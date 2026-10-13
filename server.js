const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());
// ربط قاعدة البيانات
const db = new Database(path.join(__dirname, 'db', 'school.db'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware للتحقق من الـ Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'مطلوب توكن المصادقة، يرجى تسجيل الدخول' });
    }

    jwt.verify(token, 'YOUR_SECRET_KEY', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'التوكن غير صالح أو انتهت صلاحيته' });
        }
        req.user = user;
        next();
    });
}

// مسار محمي تجريبي للبروفايل
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'أنت مصرح لك بالوصول لهذه البيانات السرية',
        user: req.user
    });
});


// مسار تسجيل الدخول وتوليد التوكن
app.post('/api/login', (req, res) => {
    const { role, identifier, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE identifier = ? AND role = ?');
        const user = stmt.get(identifier, role);

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'اسم المستخدم/الرقم القومي أو كلمة المرور غير صحيحة' });
        }

        const userPayload = {
            id: user.id,
            role: user.role,
            identifier: user.identifier
        };

        const token = jwt.sign(userPayload, 'YOUR_SECRET_KEY', { expiresIn: '2h' });

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token: token,
            user: userPayload
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});
// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});