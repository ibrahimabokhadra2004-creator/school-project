-- هيكل قاعدة البيانات (الجداول). آمن تشغيله أكتر من مرة.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  role          TEXT NOT NULL CHECK (role IN ('student','school')),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schools (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  school_name TEXT NOT NULL,
  school_code TEXT UNIQUE,
  address     TEXT,
  latitude    REAL,
  longitude   REAL,
  verified    INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_schools_location ON schools(latitude, longitude);
