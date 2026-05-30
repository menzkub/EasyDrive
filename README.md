# 🚗 EasyDrive — Vehicle Booking System

> ระบบจองรถยนต์สำหรับ **การไฟฟ้าส่วนภูมิภาค สาขาฝาง**

[![Live](https://img.shields.io/badge/🌐_Live-easydrive.vercel.app-4f46e5?style=flat-square)](https://easydrive.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-build-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 📅 จองรถออนไลน์ | เลือกรถ วันเวลา จุดหมาย พร้อมระบุพิกัด GPS |
| ✅ อนุมัติ / ปฏิเสธ | ผู้จัดการอนุมัติ-ปฏิเสธพร้อมเหตุผล |
| 📆 ปฏิทินการจอง | ดูภาพรวมทุกรถในรูปแบบปฏิทิน (สาธารณะ ไม่ต้อง login) |
| 🗺️ นำทาง | เปิด Google Maps / Apple Maps ไปจุดหมายได้เลย |
| ⌨️ Command Menu | กด `Ctrl+K` ค้นหาทุกอย่างในระบบ |
| 📖 คู่มือในระบบ | คู่มือตามบทบาท user / manager / admin |
| 🔒 Auto-Logout | ออกระบบอัตโนมัติเมื่อไม่มีการใช้งาน 30 นาที |
| 🌙 Dark Mode | รองรับ dark mode |
| 📱 Responsive | ใช้งานได้ทั้ง desktop, tablet, และมือถือ |

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite (JavaScript, no TypeScript)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Styling**: CSS custom properties (no CSS framework)
- **Deploy**: Vercel

---

## 📁 โครงสร้างโปรเจกต์

```
repo/
├── public/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.jsx      # หน้า login / register + ปฏิทินสาธารณะ
│   │   ├── DashboardScreen.jsx # แดชบอร์ดหลัก
│   │   ├── VoucherScreen.jsx   # รายการจอง + navigation
│   │   ├── CalendarScreen.jsx  # ปฏิทินการจอง
│   │   ├── FleetScreen.jsx     # จัดการยานพาหนะ (admin)
│   │   ├── UsersScreen.jsx     # จัดการผู้ใช้ (admin)
│   │   ├── ReportsScreen.jsx   # รายงาน (manager/admin)
│   │   ├── SettingsScreen.jsx  # ตั้งค่า
│   │   └── ManualScreen.jsx    # คู่มือการใช้งาน
│   ├── App.jsx                 # root component + routing + auth state
│   ├── components.jsx          # shared components (Topbar, Sidebar, Modals...)
│   ├── supabase.js             # Supabase client
│   └── index.css               # global styles
├── .env.local                  # (ไม่ commit) Supabase keys
├── index.html
├── vite.config.js
└── package.json
```

---

## 👥 บทบาทผู้ใช้

| Role | สิทธิ์ |
|---|---|
| `user` | จองรถ, ดูการจองของตัวเอง, ดูปฏิทิน |
| `manager` | ทุกอย่างของ user + อนุมัติ/ปฏิเสธ, ดูรายงาน |
| `admin` | ทุกอย่างของ manager + จัดการรถ/ผู้ใช้/แผนก, แก้ไขไมล์ |

---

## 🚀 รันในเครื่อง (Local Development)

### 1. Clone

```bash
git clone https://github.com/menzkub/PEA-FANG-vehicle-booking-system.git
cd PEA-FANG-vehicle-booking-system
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ที่ root:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. รัน Dev Server

```bash
npm run dev
```

เปิด [http://localhost:5173](http://localhost:5173)

### 4. Build สำหรับ Production

```bash
npm run build
```

---

## 🗄️ Supabase Setup

### Tables หลัก

| Table | คำอธิบาย |
|---|---|
| `users` | ข้อมูลผู้ใช้ (name, email, role, dept, approved) |
| `vehicles` | ยานพาหนะ (plate, brand, type, status, mileage) |
| `bookings` | การจอง (userId, vehicleId, from, to, purpose, status, coords, destination) |
| `departments` | แผนก (name) |

### RLS (Row Level Security)

- `users`: อ่านได้ทุกคน, แก้ไขได้เฉพาะ admin
- `bookings`: user ดูได้เฉพาะของตัวเอง, manager/admin ดูทั้งหมด
- `vehicles`: อ่านได้ทุกคน, แก้ไขได้เฉพาะ admin

### Realtime

เปิด Realtime สำหรับ tables: `bookings`, `vehicles`, `users`

---

## ☁️ Deploy บน Vercel

1. Push code ขึ้น GitHub
2. Import repo ใน [vercel.com](https://vercel.com)
3. ตั้ง Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy

---

## 🎯 ฟีเจอร์เด่น

### ⌨️ Command Menu (`Ctrl+K`)
ค้นหาทั่วทั้งระบบ — หน้า, การจอง, รถ, ผู้ใช้ — จากทุกที่ในแอป

### 🗺️ Navigation Modal
ตรวจจับ GPS อัตโนมัติ แสดงระยะทาง และเปิด Google Maps / Apple Maps ได้โดยตรง

### 📖 In-App Manual
คู่มือการใช้งานแบบ role-based ครบทุกฟีเจอร์ ไม่ต้องพึ่งเอกสารภายนอก

### 🔐 Auto-Logout
แจ้งเตือน 2 นาทีก่อนออกระบบอัตโนมัติ เมื่อไม่มีการใช้งานนาน 30 นาที

---

## 📄 License

Internal use — การไฟฟ้าส่วนภูมิภาค สาขาฝาง
