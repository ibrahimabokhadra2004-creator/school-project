const express = require('express');
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'SECRET_KEY_123';

// إعدادات Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات
const db = sqlite3('school.db');

// إنشاء جدول المستخدمين تلقائياً لو مش موجود
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL
    )
`).run();

// Middleware للتحقق من التوكن (Auth Middleware)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'التوكن غير صالحة أو منتهية الصلاحية' });
        }
        req.user = user;
        next();
    });
};

// API إنشاء حساب جديد
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة' });
        }

        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل بالفعل' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'student';

        const insert = db.prepare(`
            INSERT INTO users (name, email, phone, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = insert.run(name, email, phone || '', hashedPassword, userRole);

        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', userId: result.lastInsertRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// API تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// API محمي للحصول على بيانات المستخدم الحالي
app.get('/api/me', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
        
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});