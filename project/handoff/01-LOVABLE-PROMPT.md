# 🚀 Lovable Prompt — PEA FANG Vehicle Booking System

## วิธีใช้
1. เปิด https://lovable.dev → สร้างโปรเจกต์ใหม่
2. Copy **Prompt #1** ด้านล่างวางในช่อง prompt แรก → กด Send
3. รอ Lovable สร้าง project skeleton (ประมาณ 2-3 นาที)
4. Copy **Prompt #2, #3, #4...** ทีละขั้นเพื่อเพิ่มฟีเจอร์
5. ระหว่างทาง Lovable จะถามให้ connect **Supabase** → ตอบตกลง (ถ้ายังไม่มีบัญชี ให้สมัครก่อน — มี free tier)
6. หลังจาก Supabase connect แล้ว ให้รัน SQL จากไฟล์ `02-SUPABASE-SCHEMA.sql` ใน Supabase SQL Editor

---

## 📌 Prompt #1 — สร้างโปรเจกต์ + Design System

```
สร้างระบบจองรถยนต์ภายในชื่อ "PEA FANG Vehicle Booking System" สำหรับการไฟฟ้าส่วนภูมิภาคสาขาฝาง 
ใช้ React + TypeScript + Tailwind CSS + Supabase + shadcn/ui

UI/UX Requirements:
- ภาษาไทยทั้งหมด (label, button, error message)
- Font: IBM Plex Sans Thai หรือ Sarabun
- สีหลัก: ม่วง PEA #6E2A8C (primary), ส้ม PEA #F37021 (accent), 
  พื้นหลังอ่อน #F6F4F8, เทาดำ #1F1530 (text)
- ดีไซน์โทน corporate professional แต่อ่านง่าย ไม่ flat ไม่ใช้ gradient เยอะ
- Responsive ใช้งานได้ทั้ง Desktop / Tablet / Mobile
  - Desktop: sidebar ซ้าย + content
  - Tablet (<980px): sidebar เป็น icon-only
  - Mobile (<720px): sidebar เป็น drawer แบบ slide-in มี hamburger menu

App Structure:
- หน้า Login + Register (สมัครสมาชิกต้องรอ admin อนุมัติก่อนใช้งาน)
- มี Forgot Password
- หลัง login: Sidebar + Topbar + Main content
- Sidebar มี logo "PEA FANG" + เมนูตาม role + role card ด้านล่างมีปุ่ม logout
- Topbar มี title + ปุ่มกริ่งระฆัง (notifications) + hamburger menu (mobile)

Roles & Permissions:
1. User (ผู้ใช้งาน): จองรถ, ดูแดชบอร์ด, ดูปฏิทิน, การจองของฉัน, check-in/out, ตั้งค่า
2. Manager (ผู้จัดการ): + อนุมัติการจอง, รายงาน
3. Admin (ผู้ดูแลระบบ): ทำได้ทุกอย่าง + จัดการสมาชิก, จัดการรถยนต์, แก้ไขเลขไมล์, ดู audit log

เริ่มจากสร้าง:
1. Layout shell + Sidebar + Topbar 
2. Design system tokens (CSS variables ตามสีด้านบน)
3. หน้า Login + Register + Forgot Password (ยังไม่ต้อง connect Supabase ตอนนี้)
4. Dashboard placeholder

อย่าใส่ feature เยอะเกินไปในรอบแรก เน้นสวยและ structure ดีก่อน
```

---

## 📌 Prompt #2 — Connect Supabase + Auth

```
Connect to Supabase และสร้างระบบ Authentication:

1. ตาราง profiles (ดูใน schema.sql ที่ผมจะให้):
   - id (uuid, ลิงก์กับ auth.users)
   - employee_id (รหัสพนักงาน)
   - full_name, department, email, phone
   - role: 'user' | 'manager' | 'admin' (default 'user')
   - status: 'pending' | 'approved' | 'rejected' (default 'pending')
   - created_at

2. Register flow:
   - User กรอก ชื่อ, รหัสพนักงาน, แผนก, อีเมล, เบอร์, รหัสผ่าน
   - สร้าง auth user + insert profile (status='pending')
   - หลัง register → แสดงหน้า "รอ admin อนุมัติบัญชี"
   - ยังเข้าระบบไม่ได้จนกว่า admin จะอนุมัติ (เปลี่ยน status='approved')

3. Login flow:
   - ตรวจสอบ status='approved' ก่อนให้เข้า
   - ถ้า status='pending' แสดงข้อความ "บัญชียังไม่ได้รับการอนุมัติ"
   - ถ้า status='rejected' แสดง "บัญชีถูกปฏิเสธ ติดต่อผู้ดูแลระบบ"

4. Forgot Password:
   - ใช้ Supabase Auth resetPasswordForEmail
   - แสดงหน้ายืนยันส่งลิงก์แล้ว

5. RLS (Row Level Security):
   - profiles: user อ่านได้เฉพาะ row ของตัวเอง, admin/manager อ่านได้ทุกคน
   - มี RPC function หรือ policy ที่ admin เปลี่ยน role + status ผู้อื่นได้

6. Department list (hardcode dropdown):
   - แผนกบริการลูกค้า
   - แผนกวิศวกรรม
   - แผนกก่อสร้างและปฏิบัติการ
   - แผนกบัญชีและการเงิน
   - แผนกบริหารงานทั่วไป
   - แผนกมิเตอร์
   - แผนกปฏิบัติการระบบไฟฟ้า
```

---

## 📌 Prompt #3 — Vehicle Management (Admin)

```
สร้างหน้า "จัดการรถยนต์" (เฉพาะ Admin) :

ตาราง vehicles ใน Supabase:
- id (text PK, format V001, V002...)
- plate (ทะเบียน เช่น "กข 1234 เชียงใหม่")
- brand (ยี่ห้อ/รุ่น)
- vehicle_type: 'sedan' | 'pickup' | 'van' | 'truck6' | 'truck3' | 'crane' | 'bucket' | 'ev'
- year, fuel_type ('diesel'|'gasohol'|'benzin'|'ngv'|'ev'), seats
- mileage (เลขไมล์ปัจจุบัน)
- last_service_date, next_service_date
- tax_due_date, insurance_due_date
- owner_user_id (FK profiles - ผู้รับผิดชอบประจำรถ)
- status: 'available' | 'maintenance' | 'unavailable'
- status_reason (text, ใส่เมื่อ maintenance/unavailable)
- created_at, updated_at

หน้า List:
- Table แสดงทุกคัน มี filter: ประเภท / สถานะ + search
- แสดง: ID, รูปไอคอน, ทะเบียน, ยี่ห้อ, สเปก, เลขไมล์, วันครบกำหนด (พ.ร.บ./เช็คระยะ + badge เตือนเมื่อใกล้)
- ปุ่ม "เพิ่มรถยนต์" + ปุ่มแก้ไข + ปุ่มดูประวัติ

หน้า Form (เพิ่ม/แก้ไข) Modal:
- ทุก field ครบตาม schema
- ผู้รับผิดชอบ = dropdown จาก profiles where status='approved'
- เลขไมล์: ถ้าแก้ > 5 กม. ต้องอัพโหลดรูปหน้าปัด + ระบุเหตุผล
- ส่วน "เอกสารรถ" — แนบไฟล์ พ.ร.บ., ภาษีรถ, ใบทะเบียน, ประกันภัย (ใช้ Supabase Storage bucket 'vehicle-docs')

ตาราง vehicle_documents:
- id, vehicle_id, doc_type, file_path, file_name, file_size, uploaded_at, uploaded_by

ตาราง vehicle_history (audit log):
- id, vehicle_id, action ('create'|'update'|'status'), field_name, old_value, new_value, note, photo_url, actor_user_id, created_at

หน้าประวัติการแก้ไข (Modal):
- แสดง timeline เรียงจากใหม่ → เก่า
- แต่ละ entry: ใคร, เมื่อไหร่, เปลี่ยน field อะไร จาก X → Y, มีรูปแนบมั้ย, หมายเหตุ

Icons รถ — ใช้ Lucide หรือ SVG เอง 8 ประเภท (sedan/pickup/van/truck6/truck3/crane/bucket/ev)

Seed data: รถยนต์ 24 คัน ใส่ใน schema seed ให้
```

---

## 📌 Prompt #4 — Booking Flow + Map

```
สร้างฟีเจอร์จองรถ:

Tables ใน Supabase:
1. bookings:
   - id (text PK, format BK2026-MMDD-NNN)
   - vehicle_id (FK), user_id (FK profiles)
   - purpose (enum: 'ตรวจสอบมิเตอร์'|'ตรวจคำร้องผู้ใช้ไฟ'|'ติดตามลูกหนี้ค่าไฟฟ้า'|'ติดตามข้อร้องเรียน'|'ตรวจสอบระบบจำหน่าย'|'ก่อสร้างระบบจำหน่าย'|'บำรุงรักษาระบบจำหน่าย'|'ประชุม/อบรม'|'อื่นๆ')
   - purpose_note (text - รายละเอียดเพิ่ม)
   - from_datetime, to_datetime (timestamptz)
   - destination (text), latitude, longitude (numeric)
   - passengers (int)
   - status: 'booked'|'approved'|'rejected'|'urgent'|'completed'|'cancelled'
   - approver_user_id (FK profiles), approved_at
   - reject_reason, urgent_reason
   - mileage_out, mileage_in (int)
   - rating (1-5), review_note
   - created_at

หน้าจองรถ — 3 steps:

Step 1 — รายละเอียดการเดินทาง:
- เลือกวัตถุประสงค์ (dropdown)
- รายละเอียดเพิ่มเติม (textarea)
- วันเวลาไป + วันเวลากลับ (datetime-local)
  - แสดงระยะเวลา live: "X วัน Y ชั่วโมง Z นาที"
  - validate: to > from
- สถานที่ปลายทาง (text)
- แผนที่ Leaflet (OpenStreetMap):
  - คลิกบนแผนที่ หรือลากหมุดเพื่อปักพิกัด
  - ปุ่ม preset locations: PEA สาขาฝาง, ต.แม่ข่า, ต.แม่งอน, ฯลฯ
  - แสดง lat/lng ใต้ input
- จำนวนผู้โดยสาร (number)

Step 2 — เลือกรถ:
- แสดงรถทั้งหมดที่ status='available' (ไม่ใช่ maintenance/unavailable)
- ถ้ารถมีการจองอื่นในช่วงเวลาเดียวกัน → แสดง badge "ติดจอง N"
- เลือกได้ทั้งคันว่างและคันติดจอง
- ถ้าเลือกคันที่ติดจอง → แสดง warning banner ว่าจองซ้อน + รายชื่อผู้จองที่ทับ
- มี filter ตามประเภทรถ

Step 3 — ยืนยัน:
- สรุปข้อมูลทั้งหมด
- ระยะเวลาเดินทาง (callout เด่น)
- รายละเอียดรถที่เลือก
- ถ้าจองซ้อน — แสดง warning ว่ารอ admin ตัดสินใจ
- ปุ่ม "ยืนยันการจอง" → INSERT booking ด้วย status='booked'
- ส่ง notification + email ให้ admin/manager ในแผนกเดียวกัน

หน้า "การจองของฉัน":
- Tabs: กำลังดำเนินการ / เสร็จสิ้น / ไม่อนุมัติ
- ปุ่ม "ใบจองรถ" (พิมพ์ได้) สำหรับการจองที่อนุมัติแล้ว

ใบจองรถ (Voucher) - หน้าพิมพ์ A4:
- Header: โลโก้ PEA + หัวกระดาษ + เลขที่ใบจอง + status badge
- Section 1: ข้อมูลผู้จอง (ชื่อ, ตำแหน่ง, รหัส, สังกัด, โทร)
- Section 2: ข้อมูลรถยนต์
- Section 3: รายละเอียดการเดินทาง (วันเวลาไป-กลับ, ระยะเวลา, ปลายทาง, พิกัด, ผู้โดยสาร, เลขไมล์ก่อน/หลัง)
- Section 4: การอนุมัติ
- ช่องลายเซ็น 3 ช่อง: ผู้จอง, ผู้อนุมัติ, ผู้รับ-ส่งรถ
- มี QR code + watermark "PEA FANG"
- ปุ่ม "พิมพ์" (window.print) + "Export CSV"
```

---

## 📌 Prompt #5 — Dashboard + Real-time Status

```
สร้างหน้าแดชบอร์ดเรียลไทม์:

Layout:
- Welcome banner: สวัสดี + สรุปงานวันนี้ตาม role
  - User: "รถพร้อมใช้งานวันนี้ X คัน"
  - Manager/Admin: "มี N คำขอรอการอนุมัติ"
- Quick Actions: ปุ่ม "จองรถใหม่" + "ดูคำขออนุมัติ" (manager/admin)

Stats Tiles (4 ช่อง):
- รถทั้งหมด
- พร้อมใช้งานวันนี้
- กำลังใช้งาน/ติดจอง
- บำรุงรักษา

Timeline View (Gantt-style):
- แกนนอน 06:00 - 20:00 ของวันนี้
- แกนตั้ง: รถยนต์แต่ละคัน (top 10)
- แท่งสี: การจองในช่วงเวลานั้นๆ (สีตาม status)
- เส้นปัจจุบัน (now line) แนวตั้งสีส้ม + animation pulse
- รถ maintenance ใช้ pattern แบบลายแถบ

Vehicle Grid:
- Filter chips: ทั้งหมด / พร้อมใช้ / ติดจอง / อนุมัติแล้ว / ด่วน / บำรุงรักษา + count
- Search: ทะเบียน, ยี่ห้อ
- Card grid: รูป icon + ทะเบียน + ยี่ห้อ + status pill + การจองปัจจุบัน (ผู้ใช้, เวลา, ปลายทาง)
- คลิก card → modal รายละเอียด + ปุ่ม "จองรถคันนี้"

Alerts panel (ด้านขวา):
- ภารกิจด่วน (ถ้ามี) 
- N รายการรออนุมัติ (manager/admin)
- รถใกล้ครบกำหนดเช็คระยะ
- พ.ร.บ. ใกล้ครบกำหนด
- สมาชิกใหม่รออนุมัติ (admin)

Real-time:
- ใช้ Supabase Realtime subscription บนตาราง bookings และ vehicles
- เมื่อมีการเปลี่ยนแปลง → UI อัพเดททันทีไม่ต้อง refresh
```

---

## 📌 Prompt #6 — Approval Flow

```
สร้างหน้า "อนุมัติการจอง" (Manager + Admin):

Tabs:
1. รออนุมัติ (status='booked') — มี badge count
2. อนุมัติแล้ว (status='approved' + 'urgent')
3. แก้ไขเลขไมล์ (Admin เท่านั้น — ตาราง mileage_corrections)
4. ไม่อนุมัติ
5. เสร็จสิ้น

แต่ละการ์ดแสดง:
- ID, status pill, purpose chip
- ผู้จอง + สังกัด + รหัส
- รายละเอียดการเดินทาง (เวลา, ปลายทาง, ผู้โดยสาร)
- ข้อมูลรถ (ทะเบียน, ยี่ห้อ)
- ผู้อนุมัติ (ถ้ามี)
- ปุ่ม "อนุมัติ" (สีเขียว) + "ไม่อนุมัติ" (สีแดง) + "ดูรายละเอียด"

Confirm Dialog (โมเดิร์น centered):
- อนุมัติ → confirm dialog แสดงข้อมูลการจอง → ยืนยัน → update status='approved' + approver
- ปฏิเสธ → confirm dialog + textarea "เหตุผล" (บังคับ ≥ 3 ตัวอักษร) → update + ส่ง notification ผู้จอง

ตาราง mileage_corrections:
- id, booking_id, vehicle_id, user_id
- claimed_mileage, system_mileage, diff
- reason (text), dash_photo_url
- status: 'pending'|'approved'|'rejected'
- approver_user_id, rejected_reason
- created_at, approved_at

Admin tab "แก้ไขเลขไมล์":
- แสดงคำขอที่ user check-in แล้วเลขไมล์ไม่ตรงระบบ
- เทียบ 3 ช่อง: ในระบบ / ที่ผู้ใช้ระบุ / ส่วนต่าง
- preview รูปหน้าปัด
- อนุมัติ → confirm dialog ต้อง tick checkbox "ตรวจสอบรูปแล้ว" → update vehicles.mileage
- ปฏิเสธ → ต้องระบุเหตุผล

Notifications ส่งอัตโนมัติ:
- approved → ส่งให้ผู้จอง (in-app + email)
- rejected → ส่งให้ผู้จอง + เหตุผล
```

---

## 📌 Prompt #7 — Calendar View

```
สร้างหน้าปฏิทินการจอง:

มี 2 modes สลับได้:

1. Month view:
- Grid 7 คอลัมน์ × 5-6 แถว
- หัวคอลัมน์: อา. จ. อ. พ. พฤ. ศ. ส.
- แต่ละ cell แสดงเลขวัน + การจองสูงสุด 3 รายการ (สีตาม status)
- ถ้ามี > 3 → แสดง "+N อื่นๆ →"
- คลิกที่ cell → modal แสดงการจองทั้งหมดของวันนั้น (เรียงตามเวลา + summary pills + คลิกแถวเพื่อดูรายละเอียด)
- เน้นวันนี้ด้วย background สี
- วันหยุดสุดสัปดาห์มี background อ่อน

2. Week view:
- แกนซ้าย: รถยนต์ (top 14)
- แกนบน: 7 วันของสัปดาห์
- แต่ละ cell แสดงการจองของรถคันนั้นในวันนั้น
- รถ maintenance: cell มี hatching pattern

Toolbar:
- Filter รถยนต์ (dropdown)
- Mode toggle: เดือน/สัปดาห์
- ปุ่ม < > เพื่อเปลี่ยนเดือน/สัปดาห์
- ปุ่ม "วันนี้" กลับมาที่ปัจจุบัน

Legend ด้านล่าง: สีแต่ละ status พร้อมคำอธิบาย
```

---

## 📌 Prompt #8 — Check-in / Check-out + Inspection

```
สร้างหน้า Check-in / Check-out:

Layout:
- ซ้าย: list การจองที่ "อนุมัติแล้ว" ของฉัน (หรือทั้งหมดถ้า admin)
- ขวา: รายละเอียดของการจองที่เลือก

สถานะการจอง:
- mileage_out = null → "รอ Check-in" (กำลังจะรับรถ)
- mileage_out != null && mileage_in = null → "กำลังใช้งาน"
- mileage_in != null → "เสร็จสิ้น"

ก่อนใช้งาน (Check-out):
1. กรอกเลขไมล์ก่อนใช้งาน
   - ถ้าต่างจากเลขไมล์ในระบบ > 5 กม. → 
     - แสดง warning + บังคับ:
       a) ถ่ายรูปหน้าปัด
       b) ระบุเหตุผล (อย่างน้อย 3 ตัวอักษร)
     - กดยืนยัน → สร้าง mileage_correction record (status='pending') + update mileage_out
2. ถ่ายรูปสภาพรถก่อนใช้งาน (บังคับอย่างน้อย 1 รูป) → upload Supabase Storage
3. ตรวจสอบความพร้อม 10 รายการ (checklist):
   - ยางรถยนต์
   - น้ำมันเครื่อง
   - ระบบเบรก
   - ระบบหล่อเย็น
   - ไฟส่องสว่าง
   - แบตเตอรี่
   - ใบปัดน้ำฝน
   - อุปกรณ์ฉุกเฉิน
   - ตรวจสอบสภาพรถโดยรวม
   - เอกสารสำคัญและเบอร์โทรฉุกเฉิน
   แต่ละข้อมีปุ่ม "ผ่าน" / "ไม่ผ่าน" — ต้องตอบครบ 10 ข้อก่อน checkout
4. ถ้ามีรายการไม่ผ่าน → warning แต่ยังไป checkout ได้ (เพื่อแจ้งผู้รับผิดชอบ)
5. ปุ่ม "ยืนยัน Check-out & รับรถ" disabled จนกว่า checklist + รูป + เลขไมล์ครบ
6. ปุ่ม "พิมพ์ใบ Check-list" สำหรับเก็บไว้

ตาราง inspections:
- id, booking_id, inspector_user_id
- inspection_type: 'before'|'after'
- checklist_results (jsonb) — เช่น {tires:'pass', oil:'pass', ...}
- notes, photos (jsonb array of urls)
- created_at

หลังใช้งาน (Check-in):
1. กรอกเลขไมล์หลังใช้งาน (ต้อง > เลขไมล์ก่อนใช้)
2. ถ่ายรูปสภาพรถหลังใช้ (บังคับ)
3. ให้คะแนนสภาพรถ 1-5 ดาว
4. หมายเหตุการใช้งาน (ถ้ามีอะไรผิดปกติ)
5. กดยืนยัน → 
   - update booking: mileage_in, rating, review_note, status='completed'
   - update vehicle.mileage = mileage_in
   - คำนวณ + แสดงระยะทางที่ใช้ไป

QR Code:
- แต่ละการจองมี QR code (text = booking ID)
- รปภ. สามารถสแกนเพื่อยืนยันสิทธิ์ใช้รถ
```

---

## 📌 Prompt #9 — Notifications + Calendar Sync + Settings

```
สร้างระบบ Notification + หน้าตั้งค่า:

Notification Bell (Topbar):
- กดที่ไอคอนระฆัง → dropdown panel
- แสดง badge count ของ unread
- จัดกลุ่ม: "วันนี้" / "ก่อนหน้า"
- แต่ละ noti: icon สีตาม type + title + body + เวลา + dot สีถ้า unread
- คลิก noti → mark read + navigate ไปหน้าที่เกี่ยวข้อง
- ปุ่ม "ทำเครื่องหมายอ่านทั้งหมด"

ตาราง notifications:
- id, user_id, type, title, body
- related_entity_type ('booking'|'vehicle'|'user'|'correction')
- related_entity_id
- read (boolean default false)
- created_at

Notification Types (สร้าง trigger DB):
- booking_approved → ส่งให้ผู้จอง
- booking_rejected → ส่งให้ผู้จอง
- booking_reminder → cron 30 นาทีก่อนเวลาใช้รถ
- urgent_assignment → ส่งให้คนที่เกี่ยวข้อง
- maintenance_due → 30, 14, 7, 1 วันก่อนครบ
- pending_approval → ส่งให้ manager/admin ของแผนก
- new_member → ส่งให้ admin
- mileage_correction → ส่งให้ admin

Email integration (ใช้ Resend หรือ Supabase Edge Function):
- ส่ง email สำหรับ type ที่ user เปิด preference

หน้า "ตั้งค่า" — 3 tabs:

Tab 1 — Calendar Sync:
- เชื่อม Google Calendar / Outlook / Apple Calendar
- ใช้ OAuth provider ของ Google + Microsoft
- Setting: auto-sync ทุก 15 นาที, ซิงค์ของฉัน/ของทีม, เฉพาะที่อนุมัติแล้ว
- ปุ่มดาวน์โหลด .ics ไฟล์
- Subscribe URL (webcal://) สำหรับ subscribe ในปฏิทินใดก็ได้
- Supabase Edge Function `/api/calendar/{user_id}.ics?token=xxx`
  → generates iCalendar from bookings table

Tab 2 — การแจ้งเตือน:
- ตาราง matrix:
  - แถว: ประเภท noti (8 ประเภท)
  - คอลัมน์: ในระบบ / อีเมล / Push
  - แต่ละช่องเป็น toggle switch
- บันทึกใน profiles.notification_preferences (jsonb)

Tab 3 — บัญชี:
- โปรไฟล์: avatar + ชื่อ + ตำแหน่ง + สังกัด + รหัส + วันสมาชิก
- ปุ่มแก้ไขโปรไฟล์
- อีเมล + เบอร์โทร (readonly)
- เปลี่ยนรหัสผ่าน
- 2FA setup
- อุปกรณ์ที่ลงชื่อเข้าใช้
```

---

## 📌 Prompt #10 — Reports / Analytics

```
สร้างหน้ารายงานและสถิติ (Manager + Admin):

Filter: สัปดาห์ / เดือนนี้ / ไตรมาส / ทั้งปี
ปุ่ม Export Excel + PDF

Stats Tiles (4):
- การจองทั้งหมด
- เสร็จสิ้น (% สำเร็จ)
- ระยะทางรวม (km)
- อัตราการใช้งาน (%)

Charts:
1. Bar chart "การใช้รถรายวัน (14 วันล่าสุด)"
   - แท่งสีม่วง + วันนี้สีส้ม + ตัวเลขด้านบน

2. Horizontal bar "การใช้งานตามวัตถุประสงค์"
   - top 6 purposes

3. Table "Top รถยนต์ที่ใช้บ่อย"
   - rank + icon + ชื่อรถ + ประเภท + จำนวนครั้ง + bar % 

4. List "Top ผู้ใช้งาน"
   - rank + avatar + ชื่อ + สังกัด + จำนวนครั้ง

5. Bar chart "การใช้รถตามแผนก"
   - จำนวนการจอง + ระยะทางสะสมของแต่ละแผนก

6. "ค่าเชื้อเพลิงโดยประมาณ (เดือนนี้)"
   - ตัวเลขรวม + breakdown ตามประเภทเชื้อเพลิง
   - ใช้ราคา: ดีเซล 32.5/L, แก๊สโซฮอล์ 38.5/L, เบนซิน 41.5/L, NGV 16.5, EV 4.5
   - อัตราสิ้นเปลือง: 12, 14, 14, 10, 6 km/L

7. Heatmap "ช่วงเวลาที่ใช้รถบ่อย"
   - 7 วัน × 14 ชั่วโมง (06-19)
   - สี oklch ม่วงเข้มขึ้นตามจำนวนการจอง

8. List "รถยนต์ที่ได้รับการรีวิวสูงสุด"
   - rank + icon + ชื่อ + ดาว + คะแนนเฉลี่ย

9. Grid "ตารางบำรุงรักษาที่ใกล้ถึงกำหนด"
   - รถที่ใกล้ครบ พ.ร.บ. / เช็คระยะ / ภาษี ภายใน 90 วัน
   - highlight สี: < 14 วัน = แดง, < 30 วัน = ส้ม, อื่นๆ = ปกติ
   - badge แสดง "อีก N วัน"
```

---

## 🎯 หลัง Lovable สร้างเสร็จ — สิ่งที่ต้องทำเอง

1. **รัน SQL schema** ใน Supabase SQL Editor (จากไฟล์ 02-SUPABASE-SCHEMA.sql)
2. **สร้าง Storage buckets:**
   - `vehicle-photos` (รูปสภาพรถก่อน/หลัง)
   - `vehicle-docs` (พ.ร.บ., ใบทะเบียน ฯลฯ)
   - `mileage-photos` (รูปหน้าปัดเลขไมล์)
   - `profile-avatars`
3. **ตั้งค่า RLS policies** สำหรับ Storage (ดูในไฟล์ schema)
4. **สร้าง Edge Functions** สำหรับ:
   - `/api/calendar/[user_id].ics` (export iCalendar)
   - `/api/notifications/email` (ส่งอีเมล)
   - `/api/notifications/cron` (booking reminders + maintenance alerts)
5. **เชื่อม Resend** สำหรับ email (เพิ่ม API key ใน Supabase Secrets)
6. **เพิ่ม OAuth providers** ถ้าจะใช้ Google/Microsoft Calendar
7. **Custom domain** (ถ้ามี) — connect ใน Lovable
8. **อนุมัติ admin คนแรก** ด้วย SQL:
   ```sql
   UPDATE profiles SET role='admin', status='approved' WHERE email='your-email@pea.co.th';
   ```

---

## 💰 ค่าใช้จ่ายโดยประมาณ

- **Lovable**: $20-50/เดือน (สำหรับ pro plan)
- **Supabase**: Free tier เพียงพอเริ่มต้น (Pro $25/เดือนถ้าโตขึ้น)
- **Resend**: Free tier 100 emails/วัน, $20/เดือนสำหรับ 50K emails
- **Domain**: ~$10-15/ปี
- **รวม**: ~$40-90/เดือน เริ่มต้น

---

## 🆘 ติดปัญหาตรงไหน?

- Lovable docs: https://docs.lovable.dev
- Supabase docs: https://supabase.com/docs
- ถ้าติดเรื่อง schema/RLS → กลับมาถามได้
