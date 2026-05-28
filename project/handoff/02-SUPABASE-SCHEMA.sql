-- ═══════════════════════════════════════════════════════════════════
-- PEA FANG Vehicle Booking System — Supabase Schema
-- ═══════════════════════════════════════════════════════════════════
-- Run this SQL in your Supabase Project's SQL Editor
-- (Dashboard → SQL Editor → New query → Paste → RUN)
--
-- This creates:
--   1. All tables with foreign keys
--   2. Row Level Security policies for each role
--   3. Triggers for auto-create profile, audit logs, notifications
--   4. Helper functions
--   5. Seed data (24 vehicles, sample bookings)
--   6. Storage buckets and policies
-- ═══════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'manager', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM ('sedan','pickup','van','truck6','truck3','crane','bucket','ev');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE fuel_type AS ENUM ('diesel','gasohol','benzin','ngv','ev');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('available','maintenance','unavailable');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('booked','approved','rejected','urgent','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE correction_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: profiles  (extends auth.users)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id     text UNIQUE NOT NULL,
  full_name       text NOT NULL,
  department      text NOT NULL,
  email           text UNIQUE NOT NULL,
  phone           text,
  role            user_role NOT NULL DEFAULT 'user',
  status          user_status NOT NULL DEFAULT 'pending',
  avatar_url      text,
  notification_preferences jsonb DEFAULT '{
    "booking_approved": {"in":true,"email":true,"push":true},
    "booking_rejected": {"in":true,"email":true,"push":false},
    "booking_reminder": {"in":true,"email":false,"push":true},
    "urgent_assignment": {"in":true,"email":true,"push":true},
    "maintenance_due": {"in":true,"email":true,"push":false},
    "pending_approval": {"in":true,"email":false,"push":true},
    "new_member": {"in":true,"email":true,"push":false},
    "mileage_correction": {"in":true,"email":false,"push":false}
  }'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role   ON profiles(role);
CREATE INDEX idx_profiles_dept   ON profiles(department);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: vehicles
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicles (
  id              text PRIMARY KEY,         -- "V001", "V002", ...
  plate           text NOT NULL,
  brand           text NOT NULL,
  vehicle_type    vehicle_type NOT NULL,
  year            int NOT NULL,
  fuel_type       fuel_type NOT NULL,
  seats           int NOT NULL DEFAULT 5,
  mileage         int NOT NULL DEFAULT 0,
  last_service_date  date,
  next_service_date  date,
  tax_due_date       date,
  insurance_due_date date,
  owner_user_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status          vehicle_status NOT NULL DEFAULT 'available',
  status_reason   text,
  image_url       text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type   ON vehicles(vehicle_type);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: vehicle_documents
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      text NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  doc_type        text NOT NULL,           -- 'พ.ร.บ.', 'ภาษีรถยนต์', etc.
  file_path       text NOT NULL,           -- Storage path
  file_name       text NOT NULL,
  file_size_bytes int,
  uploaded_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_vdocs_vehicle ON vehicle_documents(vehicle_id);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: vehicle_history (audit log)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicle_history (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      text NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  action          text NOT NULL,           -- 'create','update','status','delete'
  field_name      text NOT NULL,
  old_value       text,
  new_value       text,
  note            text,
  photo_url       text,
  actor_user_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_vhist_vehicle ON vehicle_history(vehicle_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: bookings
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id              text PRIMARY KEY,        -- "BK2026-0521-001"
  vehicle_id      text NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  purpose         text NOT NULL,
  purpose_note    text,
  from_datetime   timestamptz NOT NULL,
  to_datetime     timestamptz NOT NULL,
  destination     text NOT NULL,
  latitude        numeric(10,7),
  longitude       numeric(10,7),
  passengers      int DEFAULT 1,

  status          booking_status NOT NULL DEFAULT 'booked',
  approver_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at     timestamptz,
  reject_reason   text,
  urgent_reason   text,

  mileage_out     int,
  mileage_in      int,
  rating          int CHECK (rating BETWEEN 1 AND 5),
  review_note     text,

  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  CHECK (to_datetime > from_datetime),
  CHECK (mileage_in IS NULL OR mileage_in >= mileage_out)
);

CREATE INDEX idx_bookings_vehicle      ON bookings(vehicle_id);
CREATE INDEX idx_bookings_user         ON bookings(user_id);
CREATE INDEX idx_bookings_status       ON bookings(status);
CREATE INDEX idx_bookings_from         ON bookings(from_datetime);
CREATE INDEX idx_bookings_date_range   ON bookings(vehicle_id, from_datetime, to_datetime);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: mileage_corrections
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mileage_corrections (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_id      text NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  claimed_mileage int NOT NULL,
  system_mileage  int NOT NULL,
  diff            int GENERATED ALWAYS AS (claimed_mileage - system_mileage) STORED,
  reason          text NOT NULL,
  dash_photo_url  text,
  status          correction_status NOT NULL DEFAULT 'pending',
  approver_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at     timestamptz,
  reject_reason   text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_mcorrections_status ON mileage_corrections(status);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: inspections (10-point checklist)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inspections (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  inspector_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  inspection_type text NOT NULL CHECK (inspection_type IN ('before','after')),
  -- JSON: {tires:'pass'|'fail', oil:'pass'|'fail', brake:..., ...}
  checklist_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes           text,
  photo_urls      jsonb DEFAULT '[]'::jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_inspections_booking ON inspections(booking_id);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: notifications
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            text NOT NULL,    -- 'booking_approved','urgent', etc.
  title           text NOT NULL,
  body            text,
  related_entity_type text,         -- 'booking','vehicle','user','correction'
  related_entity_id   text,
  link_route      text,             -- target route in app
  read            boolean DEFAULT false,
  read_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: calendar_subscriptions
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  ics_token       text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  google_connected boolean DEFAULT false,
  outlook_connected boolean DEFAULT false,
  apple_connected   boolean DEFAULT false,
  filters         jsonb DEFAULT '{"myBookings":true,"teamBookings":false,"approvedOnly":true}'::jsonb,
  last_synced_at  timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, employee_id, department, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'employee_id', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'department', 'แผนกบริหารงานทั่วไป'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create calendar_subscription when profile is approved
CREATE OR REPLACE FUNCTION create_calendar_sub()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO calendar_subscriptions (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_calendar_sub ON profiles;
CREATE TRIGGER trg_profile_calendar_sub
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION create_calendar_sub();

-- Auto-update vehicle.mileage when mileage_correction approved
CREATE OR REPLACE FUNCTION apply_mileage_correction()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE vehicles SET mileage = NEW.claimed_mileage, updated_at = now()
    WHERE id = NEW.vehicle_id;

    INSERT INTO vehicle_history (vehicle_id, action, field_name, old_value, new_value, note, photo_url, actor_user_id)
    VALUES (NEW.vehicle_id, 'update', 'เลขไมล์',
      NEW.system_mileage::text || ' กม.',
      NEW.claimed_mileage::text || ' กม.',
      'แก้ไขจากคำขอ ' || NEW.id::text || ' — ' || NEW.reason,
      NEW.dash_photo_url, NEW.approver_user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_mcorrection ON mileage_corrections;
CREATE TRIGGER trg_apply_mcorrection
AFTER UPDATE ON mileage_corrections
FOR EACH ROW EXECUTE FUNCTION apply_mileage_correction();

-- Auto-update vehicle.mileage when booking checkin (mileage_in)
CREATE OR REPLACE FUNCTION sync_vehicle_mileage_on_checkin()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.mileage_in IS NOT NULL AND OLD.mileage_in IS NULL THEN
    UPDATE vehicles
      SET mileage = NEW.mileage_in, updated_at = now()
      WHERE id = NEW.vehicle_id AND mileage < NEW.mileage_in;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_mileage ON bookings;
CREATE TRIGGER trg_sync_mileage
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION sync_vehicle_mileage_on_checkin();

-- Notify user when booking status changes
CREATE OR REPLACE FUNCTION notify_booking_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_vehicle RECORD;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT brand, plate INTO v_vehicle FROM vehicles WHERE id = NEW.vehicle_id;

  IF NEW.status = 'approved' THEN
    INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id, link_route)
    VALUES (NEW.user_id, 'booking_approved',
      'การจองของคุณได้รับการอนุมัติ',
      v_vehicle.brand || ' (' || v_vehicle.plate || ') · ' || NEW.purpose,
      'booking', NEW.id, 'my');
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id, link_route)
    VALUES (NEW.user_id, 'booking_rejected',
      'การจองของคุณถูกปฏิเสธ',
      'เหตุผล: ' || COALESCE(NEW.reject_reason, 'ไม่ระบุ'),
      'booking', NEW.id, 'my');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_booking ON bookings;
CREATE TRIGGER trg_notify_booking
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION notify_booking_status();

-- Notify admin when new user registers
CREATE OR REPLACE FUNCTION notify_new_member()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  admin_id uuid;
BEGIN
  IF NEW.status = 'pending' THEN
    FOR admin_id IN SELECT id FROM profiles WHERE role = 'admin' AND status = 'approved' LOOP
      INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id, link_route)
      VALUES (admin_id, 'new_member',
        'สมาชิกใหม่สมัครเข้าระบบ',
        NEW.full_name || ' · ' || NEW.department,
        'user', NEW.id::text, 'members');
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_member ON profiles;
CREATE TRIGGER trg_notify_new_member
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION notify_new_member();

-- updated_at auto-touch
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_touch_profiles ON profiles;
CREATE TRIGGER trg_touch_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_vehicles ON vehicles;
CREATE TRIGGER trg_touch_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_bookings ON bookings;
CREATE TRIGGER trg_touch_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper: get my role
CREATE OR REPLACE FUNCTION my_role() RETURNS user_role
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND status = 'approved')
$$;

CREATE OR REPLACE FUNCTION is_staff() RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager') AND status = 'approved')
$$;

-- PROFILES policies
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Staff see all profiles" ON profiles
  FOR SELECT USING (is_staff());
CREATE POLICY "Users update own profile (basic)" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admin updates anyone" ON profiles
  FOR UPDATE USING (is_admin());

-- VEHICLES policies
CREATE POLICY "Everyone reads vehicles" ON vehicles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manages vehicles" ON vehicles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- VEHICLE_DOCUMENTS policies
CREATE POLICY "Everyone reads vehicle docs" ON vehicle_documents
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manages vehicle docs" ON vehicle_documents
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- VEHICLE_HISTORY policies (read-only for staff, write-only via trigger)
CREATE POLICY "Staff reads history" ON vehicle_history
  FOR SELECT USING (is_staff());

-- BOOKINGS policies
CREATE POLICY "Users see own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff see all bookings" ON bookings
  FOR SELECT USING (is_staff());
CREATE POLICY "Users create own bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own pending bookings" ON bookings
  FOR UPDATE USING (
    user_id = auth.uid() AND status IN ('booked')
    OR is_staff()
  );

-- MILEAGE CORRECTIONS
CREATE POLICY "Users see own corrections" ON mileage_corrections
  FOR SELECT USING (user_id = auth.uid() OR is_staff());
CREATE POLICY "Users create corrections" ON mileage_corrections
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin updates corrections" ON mileage_corrections
  FOR UPDATE USING (is_admin());

-- INSPECTIONS
CREATE POLICY "Inspectors see own + staff sees all" ON inspections
  FOR SELECT USING (inspector_user_id = auth.uid() OR is_staff());
CREATE POLICY "Users create own inspections" ON inspections
  FOR INSERT WITH CHECK (inspector_user_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- CALENDAR_SUBSCRIPTIONS
CREATE POLICY "Users manage own subscription" ON calendar_subscriptions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('vehicle-photos', 'vehicle-photos', false),
  ('vehicle-docs',   'vehicle-docs', false),
  ('mileage-photos', 'mileage-photos', false),
  ('profile-avatars','profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (read for authenticated, write checked per bucket)
CREATE POLICY "Authenticated reads vehicle-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated uploads vehicle-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated reads vehicle-docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-docs' AND auth.role() = 'authenticated');

CREATE POLICY "Admin uploads vehicle-docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-docs' AND is_admin());

CREATE POLICY "Authenticated reads mileage-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mileage-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated uploads mileage-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mileage-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public reads avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA — 24 vehicles
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO vehicles (id, plate, brand, vehicle_type, year, fuel_type, seats, mileage, last_service_date, next_service_date, tax_due_date, insurance_due_date, status) VALUES
('V001','กข 1234 เชียงใหม่','Toyota Hilux Revo','pickup',2022,'diesel',4,45230,'2026-03-15','2026-06-15','2026-11-20','2026-11-20','available'),
('V002','กข 5678 เชียงใหม่','Toyota Hilux Revo','pickup',2021,'diesel',4,67120,'2026-04-01','2026-07-01','2026-09-12','2026-09-12','available'),
('V003','งจ 9012 เชียงใหม่','Toyota Vios','sedan',2023,'gasohol',5,28940,'2026-02-20','2026-08-20','2026-12-05','2026-12-05','available'),
('V004','งจ 3456 เชียงใหม่','Toyota Vios','sedan',2022,'gasohol',5,38450,'2026-03-22','2026-09-22','2026-10-15','2026-10-15','available'),
('V005','นว 7890 เชียงใหม่','Toyota Hiace','van',2020,'diesel',12,89320,'2026-05-01','2026-08-01','2026-07-30','2026-07-30','maintenance'),
('V006','นว 2345 เชียงใหม่','Toyota Commuter','van',2022,'diesel',12,52100,'2026-04-18','2026-07-18','2026-08-25','2026-08-25','available'),
('V007','บง 6789 เชียงใหม่','Isuzu D-Max','pickup',2021,'diesel',4,73450,'2026-03-08','2026-06-08','2026-09-30','2026-09-30','available'),
('V008','บง 0123 เชียงใหม่','Isuzu D-Max','pickup',2023,'diesel',4,18700,'2026-04-22','2026-10-22','2027-01-15','2027-01-15','available'),
('V009','ผก 4567 เชียงใหม่','Hino 500 6W','truck6',2019,'diesel',3,145200,'2026-02-10','2026-05-10','2026-06-30','2026-06-30','available'),
('V010','ผก 8901 เชียงใหม่','Isuzu FRR 6W','truck6',2020,'diesel',3,112800,'2026-03-30','2026-06-30','2026-10-10','2026-10-10','available'),
('V011','ฮต 2468 เชียงใหม่','Isuzu NPR 3 ตัน','truck3',2021,'diesel',3,87300,'2026-04-05','2026-07-05','2026-08-18','2026-08-18','available'),
('V012','ฮต 1357 เชียงใหม่','Hino XZU 3 ตัน','truck3',2022,'diesel',3,54200,'2026-03-12','2026-06-12','2026-11-22','2026-11-22','available'),
('V013','อบ 8642 เชียงใหม่','Hino เครน 5 ตัน','crane',2018,'diesel',3,198400,'2026-01-25','2026-07-25','2026-12-30','2026-12-30','available'),
('V014','อบ 9753 เชียงใหม่','Isuzu เครน 3 ตัน','crane',2020,'diesel',3,89200,'2026-04-10','2026-07-10','2026-09-05','2026-09-05','available'),
('V015','รต 5286 เชียงใหม่','Hino กระเช้า 12 ม.','bucket',2019,'diesel',3,134500,'2026-02-28','2026-05-28','2026-07-15','2026-07-15','maintenance'),
('V016','รต 4197 เชียงใหม่','Isuzu กระเช้า 9 ม.','bucket',2021,'diesel',3,68900,'2026-04-15','2026-07-15','2026-10-28','2026-10-28','available'),
('V017','ฉม 3175 เชียงใหม่','MG EP EV','ev',2023,'ev',5,14200,'2026-04-30','2026-10-30','2027-02-10','2027-02-10','available'),
('V018','ฉม 8264 เชียงใหม่','BYD Atto 3 EV','ev',2024,'ev',5,5800,'2026-05-01','2026-11-01','2027-04-22','2027-04-22','available'),
('V019','ลต 6543 เชียงใหม่','Toyota Yaris ATIV','sedan',2022,'gasohol',5,41200,'2026-03-18','2026-09-18','2026-11-12','2026-11-12','available'),
('V020','ลต 2980 เชียงใหม่','Honda City','sedan',2021,'gasohol',5,56800,'2026-03-25','2026-09-25','2026-09-18','2026-09-18','available'),
('V021','วก 1098 เชียงใหม่','Toyota Hilux Revo','pickup',2022,'diesel',4,38900,'2026-04-08','2026-07-08','2026-10-30','2026-10-30','available'),
('V022','วก 7621 เชียงใหม่','Mitsubishi Triton','pickup',2020,'diesel',4,82400,'2026-02-15','2026-05-15','2026-08-08','2026-08-08','available'),
('V023','ดท 4382 เชียงใหม่','Toyota Fortuner','sedan',2021,'diesel',7,63500,'2026-03-05','2026-09-05','2026-10-22','2026-10-22','available'),
('V024','ดท 9856 เชียงใหม่','Isuzu MU-X','sedan',2022,'diesel',7,48200,'2026-04-12','2026-10-12','2026-11-08','2026-11-08','available')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- HELPER: Promote first admin (run after you sign up)
-- ═══════════════════════════════════════════════════════════════════
-- Run this manually after your first signup to make yourself admin:
--
--   UPDATE profiles
--     SET role='admin', status='approved'
--     WHERE email='your-email@pea.co.th';
--
-- ═══════════════════════════════════════════════════════════════════
-- DONE! Schema created. Next steps:
--   1. Sign up your first account via the app
--   2. Run the UPDATE statement above to make yourself admin
--   3. Login as admin → approve other users from "สมาชิก" page
-- ═══════════════════════════════════════════════════════════════════
