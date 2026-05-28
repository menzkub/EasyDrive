-- PEA FANG Vehicle Booking System — Supabase Schema
-- วิธีใช้: ไปที่ Supabase Dashboard → SQL Editor → วาง SQL นี้ แล้วกด Run

-- ─── Profiles (เชื่อมกับ Supabase Auth) ─────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id       UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  emp      TEXT UNIQUE NOT NULL,
  name     TEXT NOT NULL,
  dept     TEXT NOT NULL DEFAULT 'แผนกบริการลูกค้า',
  role     TEXT NOT NULL DEFAULT 'user',   -- user | manager | admin
  status   TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  phone    TEXT DEFAULT '',
  email    TEXT DEFAULT '',
  joined   DATE DEFAULT CURRENT_DATE
);

-- ─── Vehicles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id              TEXT PRIMARY KEY,
  plate           TEXT NOT NULL DEFAULT '',
  brand           TEXT NOT NULL DEFAULT '',
  type            TEXT NOT NULL DEFAULT 'sedan',
  year            INTEGER DEFAULT 2024,
  fuel            TEXT DEFAULT 'diesel',
  seats           INTEGER DEFAULT 5,
  mileage         INTEGER DEFAULT 0,
  "lastService"   DATE,
  "nextService"   DATE,
  "taxDue"        DATE,
  "insuranceDue"  DATE,
  owner           TEXT DEFAULT '',
  status          TEXT DEFAULT 'available',
  image           TEXT DEFAULT '🚗',
  "createdAt"     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bookings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id             TEXT PRIMARY KEY,
  "vehicleId"    TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  "userId"       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  purpose        TEXT DEFAULT '',
  "purposeNote"  TEXT DEFAULT '',
  "from"         TIMESTAMPTZ,
  "to"           TIMESTAMPTZ,
  destination    TEXT DEFAULT '',
  coords         FLOAT8[],
  status         TEXT DEFAULT 'booked',
  "approvedBy"   TEXT,
  "rejectReason" TEXT,
  "urgentReason" TEXT,
  "createdAt"    TIMESTAMPTZ DEFAULT NOW(),
  "mileageOut"   INTEGER,
  "mileageIn"    INTEGER,
  rating         INTEGER,
  passengers     INTEGER DEFAULT 1
);

-- ─── Vehicle History (Audit Log) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_history (
  id           TEXT PRIMARY KEY,
  "vehicleId"  TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
  actor        TEXT DEFAULT '',
  action       TEXT DEFAULT 'update',
  field        TEXT DEFAULT '',
  "oldValue"   TEXT,
  "newValue"   TEXT,
  note         TEXT DEFAULT '',
  photo        BOOLEAN DEFAULT FALSE,
  at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mileage Corrections ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mileage_corrections (
  id               TEXT PRIMARY KEY,
  "bookingId"      TEXT,
  "vehicleId"      TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  "userId"         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  "claimedMileage" INTEGER,
  "systemMileage"  INTEGER,
  diff             INTEGER,
  reason           TEXT DEFAULT '',
  "dashPhoto"      BOOLEAN DEFAULT FALSE,
  status           TEXT DEFAULT 'pending',
  "approvedBy"     TEXT,
  "approvedAt"     TIMESTAMPTZ,
  "rejectReason"   TEXT,
  "requestedAt"    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ──────────────────────────────────────────────
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_corrections ENABLE ROW LEVEL SECURITY;

-- ผู้ใช้ที่ login แล้ว อ่านข้อมูลทั้งหมดได้
CREATE POLICY "auth_read_profiles"    ON profiles            FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_vehicles"    ON vehicles            FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_bookings"    ON bookings            FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_history"     ON vehicle_history     FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_corrections" ON mileage_corrections FOR SELECT TO authenticated USING (true);

-- เขียน/แก้ไขข้อมูล (ตรวจสอบสิทธิ์ใน app code)
CREATE POLICY "auth_write_profiles"    ON profiles            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_vehicles"    ON vehicles            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_bookings"    ON bookings            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_history"     ON vehicle_history     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_corrections" ON mileage_corrections FOR ALL TO authenticated USING (true) WITH CHECK (true);
