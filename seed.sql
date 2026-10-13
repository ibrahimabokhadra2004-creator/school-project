-- بيانات تجريبية للتجربة فقط (أسماء وهمية). امسحها قبل الاستخدام الحقيقي.
-- password_hash هنا مش حقيقي: الدخول بالحسابات دي مش هيشتغل.
-- الحسابات الحقيقية بتتعمل من خلال الباك إند (register) وبتتشفّر بـ bcrypt.

INSERT INTO users (role, name, email, phone, password_hash) VALUES
  ('student', 'طالب تجريبي',            'student@example.com', '01000000001', 'DEMO_ONLY_NOT_A_REAL_HASH'),
  ('school',  'مدرسة النور النموذجية',   'noor@example.com',    '01000000002', 'DEMO_ONLY_NOT_A_REAL_HASH'),
  ('school',  'مدرسة الأمل الدولية',     'amal@example.com',    '01000000003', 'DEMO_ONLY_NOT_A_REAL_HASH'),
  ('school',  'مدرسة المستقبل للغات',    'mostaqbal@example.com','01000000004','DEMO_ONLY_NOT_A_REAL_HASH'),
  ('school',  'مدرسة الفجر الخاصة',      'fagr@example.com',    '01000000005', 'DEMO_ONLY_NOT_A_REAL_HASH');

-- user_id بيتجاب من الإيميل، فمش لازم نحفظ أرقام الـ id
INSERT INTO schools (user_id, school_name, school_code, address, latitude, longitude, verified) VALUES
  ((SELECT id FROM users WHERE email='noor@example.com'),      'مدرسة النور النموذجية', 'NOOR-001', 'الجيزة',          29.9870, 31.2118, 1),
  ((SELECT id FROM users WHERE email='amal@example.com'),      'مدرسة الأمل الدولية',   'AMAL-002', 'مدينة نصر، القاهرة', 30.0561, 31.3300, 1),
  ((SELECT id FROM users WHERE email='mostaqbal@example.com'), 'مدرسة المستقبل للغات',  'MOST-003', 'المعادي، القاهرة',   29.9602, 31.2569, 0),
  ((SELECT id FROM users WHERE email='fagr@example.com'),      'مدرسة الفجر الخاصة',    'FAGR-004', 'سموحة، الإسكندرية',  31.2156, 29.9411, 1);
