// Mock data for PEA FANG Vehicle Booking System

export const VEHICLE_TYPES = {
  sedan:   { label: "รถยนต์ 4 ประตู", icon: "sedan" },
  van:     { label: "รถตู้", icon: "van" },
  pickup:  { label: "รถกระบะ", icon: "pickup" },
  truck6:  { label: "รถบรรทุก 6 ล้อ", icon: "truck6" },
  truck3:  { label: "รถบรรทุก 3 ตัน", icon: "truck3" },
  crane:   { label: "รถเครน", icon: "crane" },
  bucket:  { label: "รถกระเช้า", icon: "bucket" },
  ev:      { label: "รถยนต์ไฟฟ้า", icon: "ev" },
};

export const FUEL_TYPES = {
  diesel: "ดีเซล",
  benzin: "เบนซิน",
  gasohol: "แก๊สโซฮอล์",
  ev: "ไฟฟ้า",
  ngv: "NGV",
};

export const DEPARTMENTS = [
  "แผนกบริการลูกค้า",
  "แผนกวิศวกรรม",
  "แผนกก่อสร้างและปฏิบัติการ",
  "แผนกบัญชีและการเงิน",
  "แผนกบริหารงานทั่วไป",
  "แผนกมิเตอร์",
  "แผนกมิเตอร์และหม้อแปลง",
  "แผนกปฏิบัติการระบบไฟฟ้า",
];

export const VEHICLES = [
];

export const USERS = [
  { id: "U001", emp: "508087", name: "ธนพล มณีกุล", dept: "แผนกมิเตอร์และหม้อแปลง", role: "admin", status: "approved", password: "A508087", phone: "", email: "", joined: new Date().toISOString().slice(0, 10) },
];

export const PURPOSES = [
  "ตรวจสอบมิเตอร์",
  "ตรวจคำร้องผู้ใช้ไฟ",
  "ติดตามลูกหนี้ค่าไฟฟ้า",
  "ติดตามข้อร้องเรียน",
  "ตรวจสอบระบบจำหน่าย",
  "ก่อสร้างระบบจำหน่าย",
  "บำรุงรักษาระบบจำหน่าย",
  "ประชุม/อบรม",
  "อื่นๆ (ระบุ)",
];

export const TODAY = new Date().toISOString().slice(0, 10);

export const BOOKINGS = [];

export const CHECKLIST = [
  { id: "tires",      label: "ยางรถยนต์",            hint: "ตรวจสภาพดอกยาง แรงดันลม รอยฉีกขาด" },
  { id: "engine_oil", label: "น้ำมันเครื่อง",        hint: "ระดับน้ำมันเครื่อง / รอยรั่วซึม" },
  { id: "brake",      label: "ระบบเบรก",             hint: "ผ้าเบรก น้ำมันเบรก ทดสอบเบรกฉุกเฉิน" },
  { id: "cooling",    label: "ระบบหล่อเย็น",         hint: "น้ำในหม้อน้ำ น้ำในกระป๋องพักน้ำ" },
  { id: "lights",     label: "ไฟส่องสว่าง",          hint: "ไฟหน้า ไฟท้าย ไฟเลี้ยว ไฟเบรก" },
  { id: "battery",    label: "แบตเตอรี่",            hint: "ขั้วแบตฯ ระดับน้ำกรด สภาพสตาร์ทเครื่อง" },
  { id: "wiper",      label: "ใบปัดน้ำฝน",          hint: "สภาพยางใบปัด การฉีดน้ำล้างกระจก" },
  { id: "emergency",  label: "อุปกรณ์ฉุกเฉิน",      hint: "ยางอะไหล่ แม่แรง ถังดับเพลิง สามเหลี่ยม" },
  { id: "overall",    label: "ตรวจสอบสภาพรถโดยรวม", hint: "ภายนอก ภายใน รอยขีดข่วน สภาพที่นั่ง" },
  { id: "documents",  label: "เอกสารสำคัญและเบอร์โทรฉุกเฉิน", hint: "คู่มือ ใบขับขี่ พ.ร.บ. เบอร์ฉุกเฉิน" },
];
