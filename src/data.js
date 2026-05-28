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
  "แผนกปฏิบัติการระบบไฟฟ้า",
];

export const VEHICLES = [
  { id: "V001", plate: "กข 1234 เชียงใหม่", brand: "Toyota Hilux Revo", type: "pickup",  year: 2022, fuel: "diesel", seats: 4, mileage: 45230, lastService: "2026-03-15", nextService: "2026-06-15", taxDue: "2026-11-20", insuranceDue: "2026-11-20", owner: "นายอนุชา ใจดี", status: "available",     image: "🛻" },
  { id: "V002", plate: "กข 5678 เชียงใหม่", brand: "Toyota Hilux Revo", type: "pickup",  year: 2021, fuel: "diesel", seats: 4, mileage: 67120, lastService: "2026-04-01", nextService: "2026-07-01", taxDue: "2026-09-12", insuranceDue: "2026-09-12", owner: "นายอนุชา ใจดี", status: "booked",        image: "🛻" },
  { id: "V003", plate: "งจ 9012 เชียงใหม่", brand: "Toyota Vios",      type: "sedan",   year: 2023, fuel: "gasohol", seats: 5, mileage: 28940, lastService: "2026-02-20", nextService: "2026-08-20", taxDue: "2026-12-05", insuranceDue: "2026-12-05", owner: "นางสาวกัญญา รักดี", status: "available",  image: "🚗" },
  { id: "V004", plate: "งจ 3456 เชียงใหม่", brand: "Toyota Vios",      type: "sedan",   year: 2022, fuel: "gasohol", seats: 5, mileage: 38450, lastService: "2026-03-22", nextService: "2026-09-22", taxDue: "2026-10-15", insuranceDue: "2026-10-15", owner: "นางสาวกัญญา รักดี", status: "approved",   image: "🚗" },
  { id: "V005", plate: "นว 7890 เชียงใหม่", brand: "Toyota Hiace",     type: "van",     year: 2020, fuel: "diesel", seats: 12, mileage: 89320, lastService: "2026-05-01", nextService: "2026-08-01", taxDue: "2026-07-30", insuranceDue: "2026-07-30", owner: "นายสมศักดิ์ มั่นคง", status: "maintenance", image: "🚐" },
  { id: "V006", plate: "นว 2345 เชียงใหม่", brand: "Toyota Commuter",  type: "van",     year: 2022, fuel: "diesel", seats: 12, mileage: 52100, lastService: "2026-04-18", nextService: "2026-07-18", taxDue: "2026-08-25", insuranceDue: "2026-08-25", owner: "นายสมศักดิ์ มั่นคง", status: "available",  image: "🚐" },
  { id: "V007", plate: "บง 6789 เชียงใหม่", brand: "Isuzu D-Max",      type: "pickup",  year: 2021, fuel: "diesel", seats: 4, mileage: 73450, lastService: "2026-03-08", nextService: "2026-06-08", taxDue: "2026-09-30", insuranceDue: "2026-09-30", owner: "นายประวิทย์ ทองคำ", status: "available",  image: "🛻" },
  { id: "V008", plate: "บง 0123 เชียงใหม่", brand: "Isuzu D-Max",      type: "pickup",  year: 2023, fuel: "diesel", seats: 4, mileage: 18700, lastService: "2026-04-22", nextService: "2026-10-22", taxDue: "2027-01-15", insuranceDue: "2027-01-15", owner: "นายประวิทย์ ทองคำ", status: "urgent",     image: "🛻" },
  { id: "V009", plate: "ผก 4567 เชียงใหม่", brand: "Hino 500 6W",      type: "truck6",  year: 2019, fuel: "diesel", seats: 3, mileage: 145200, lastService: "2026-02-10", nextService: "2026-05-10", taxDue: "2026-06-30", insuranceDue: "2026-06-30", owner: "นายชัยวัฒน์ แก้วใส", status: "available",  image: "🚚" },
  { id: "V010", plate: "ผก 8901 เชียงใหม่", brand: "Isuzu FRR 6W",     type: "truck6",  year: 2020, fuel: "diesel", seats: 3, mileage: 112800, lastService: "2026-03-30", nextService: "2026-06-30", taxDue: "2026-10-10", insuranceDue: "2026-10-10", owner: "นายชัยวัฒน์ แก้วใส", status: "booked",    image: "🚚" },
  { id: "V011", plate: "ฮต 2468 เชียงใหม่", brand: "Isuzu NPR 3 ตัน",  type: "truck3",  year: 2021, fuel: "diesel", seats: 3, mileage: 87300, lastService: "2026-04-05", nextService: "2026-07-05", taxDue: "2026-08-18", insuranceDue: "2026-08-18", owner: "นายชัยวัฒน์ แก้วใส", status: "available",  image: "🚛" },
  { id: "V012", plate: "ฮต 1357 เชียงใหม่", brand: "Hino XZU 3 ตัน",   type: "truck3",  year: 2022, fuel: "diesel", seats: 3, mileage: 54200, lastService: "2026-03-12", nextService: "2026-06-12", taxDue: "2026-11-22", insuranceDue: "2026-11-22", owner: "นายชัยวัฒน์ แก้วใส", status: "available",  image: "🚛" },
  { id: "V013", plate: "อบ 8642 เชียงใหม่", brand: "Hino เครน 5 ตัน",  type: "crane",   year: 2018, fuel: "diesel", seats: 3, mileage: 198400, lastService: "2026-01-25", nextService: "2026-07-25", taxDue: "2026-12-30", insuranceDue: "2026-12-30", owner: "นายมานพ ฤทธิ์รักษ์", status: "available", image: "🏗️" },
  { id: "V014", plate: "อบ 9753 เชียงใหม่", brand: "Isuzu เครน 3 ตัน", type: "crane",   year: 2020, fuel: "diesel", seats: 3, mileage: 89200, lastService: "2026-04-10", nextService: "2026-07-10", taxDue: "2026-09-05", insuranceDue: "2026-09-05", owner: "นายมานพ ฤทธิ์รักษ์", status: "approved", image: "🏗️" },
  { id: "V015", plate: "รต 5286 เชียงใหม่", brand: "Hino กระเช้า 12 ม.", type: "bucket", year: 2019, fuel: "diesel", seats: 3, mileage: 134500, lastService: "2026-02-28", nextService: "2026-05-28", taxDue: "2026-07-15", insuranceDue: "2026-07-15", owner: "นายมานพ ฤทธิ์รักษ์", status: "maintenance", image: "🚜" },
  { id: "V016", plate: "รต 4197 เชียงใหม่", brand: "Isuzu กระเช้า 9 ม.", type: "bucket", year: 2021, fuel: "diesel", seats: 3, mileage: 68900, lastService: "2026-04-15", nextService: "2026-07-15", taxDue: "2026-10-28", insuranceDue: "2026-10-28", owner: "นายมานพ ฤทธิ์รักษ์", status: "available", image: "🚜" },
  { id: "V017", plate: "ฉม 3175 เชียงใหม่", brand: "MG EP EV",         type: "ev",      year: 2023, fuel: "ev",     seats: 5, mileage: 14200, lastService: "2026-04-30", nextService: "2026-10-30", taxDue: "2027-02-10", insuranceDue: "2027-02-10", owner: "นางสาวกัญญา รักดี", status: "available",  image: "⚡" },
  { id: "V018", plate: "ฉม 8264 เชียงใหม่", brand: "BYD Atto 3 EV",    type: "ev",      year: 2024, fuel: "ev",     seats: 5, mileage: 5800,  lastService: "2026-05-01", nextService: "2026-11-01", taxDue: "2027-04-22", insuranceDue: "2027-04-22", owner: "นางสาวกัญญา รักดี", status: "booked",     image: "⚡" },
  { id: "V019", plate: "ลต 6543 เชียงใหม่", brand: "Toyota Yaris ATIV",type: "sedan",   year: 2022, fuel: "gasohol", seats: 5, mileage: 41200, lastService: "2026-03-18", nextService: "2026-09-18", taxDue: "2026-11-12", insuranceDue: "2026-11-12", owner: "นายอนุชา ใจดี", status: "available",  image: "🚗" },
  { id: "V020", plate: "ลต 2980 เชียงใหม่", brand: "Honda City",       type: "sedan",   year: 2021, fuel: "gasohol", seats: 5, mileage: 56800, lastService: "2026-03-25", nextService: "2026-09-25", taxDue: "2026-09-18", insuranceDue: "2026-09-18", owner: "นายอนุชา ใจดี", status: "available",  image: "🚗" },
  { id: "V021", plate: "วก 1098 เชียงใหม่", brand: "Toyota Hilux Revo",type: "pickup",  year: 2022, fuel: "diesel", seats: 4, mileage: 38900, lastService: "2026-04-08", nextService: "2026-07-08", taxDue: "2026-10-30", insuranceDue: "2026-10-30", owner: "นายประวิทย์ ทองคำ", status: "approved",   image: "🛻" },
  { id: "V022", plate: "วก 7621 เชียงใหม่", brand: "Mitsubishi Triton",type: "pickup",  year: 2020, fuel: "diesel", seats: 4, mileage: 82400, lastService: "2026-02-15", nextService: "2026-05-15", taxDue: "2026-08-08", insuranceDue: "2026-08-08", owner: "นายประวิทย์ ทองคำ", status: "available",  image: "🛻" },
  { id: "V023", plate: "ดท 4382 เชียงใหม่", brand: "Toyota Fortuner",  type: "sedan",   year: 2021, fuel: "diesel", seats: 7, mileage: 63500, lastService: "2026-03-05", nextService: "2026-09-05", taxDue: "2026-10-22", insuranceDue: "2026-10-22", owner: "นายสมศักดิ์ มั่นคง", status: "available",  image: "🚙" },
  { id: "V024", plate: "ดท 9856 เชียงใหม่", brand: "Isuzu MU-X",       type: "sedan",   year: 2022, fuel: "diesel", seats: 7, mileage: 48200, lastService: "2026-04-12", nextService: "2026-10-12", taxDue: "2026-11-08", insuranceDue: "2026-11-08", owner: "นายสมศักดิ์ มั่นคง", status: "booked",     image: "🚙" },
];

export const USERS = [
  { id: "U001", emp: "62145", name: "สมชาย ใจดี",     dept: "แผนกมิเตอร์", role: "user",    status: "approved", phone: "081-234-5678", email: "somchai.j@pea.co.th", joined: "2024-03-15" },
  { id: "U002", emp: "61203", name: "วิภาวี ศรีสุข",   dept: "แผนกบริการลูกค้า", role: "manager", status: "approved", phone: "082-345-6789", email: "wipawee.s@pea.co.th", joined: "2022-08-20" },
  { id: "U003", emp: "58974", name: "ธีรพงษ์ ทองสุข", dept: "แผนกบริหารงานทั่วไป", role: "admin", status: "approved", phone: "081-987-6543", email: "teerapong.t@pea.co.th", joined: "2019-01-10" },
  { id: "U004", emp: "63012", name: "อนงค์ ใจกล้า",   dept: "แผนกวิศวกรรม", role: "user",    status: "approved", phone: "084-111-2233", email: "anong.j@pea.co.th", joined: "2024-11-02" },
  { id: "U005", emp: "63445", name: "พิชัย กระโดด",   dept: "แผนกก่อสร้างและปฏิบัติการ", role: "user", status: "approved", phone: "085-223-3344", email: "pichai.k@pea.co.th", joined: "2025-02-18" },
  { id: "U006", emp: "63892", name: "สุภาวดี เพ็ญศรี", dept: "แผนกบัญชีและการเงิน", role: "user", status: "pending", phone: "087-334-4455", email: "supawadee.p@pea.co.th", joined: "2026-05-15" },
  { id: "U007", emp: "63955", name: "ณัฐพล มากมี",    dept: "แผนกปฏิบัติการระบบไฟฟ้า", role: "user", status: "pending", phone: "088-445-5566", email: "natthapon.m@pea.co.th", joined: "2026-05-18" },
  { id: "U008", emp: "63971", name: "ปวีณา รัศมี",    dept: "แผนกบริการลูกค้า", role: "user", status: "pending", phone: "089-556-6677", email: "paweena.r@pea.co.th", joined: "2026-05-20" },
  { id: "U009", emp: "62890", name: "วีระชัย พงษ์ดี", dept: "แผนกมิเตอร์", role: "user",    status: "approved", phone: "081-667-7788", email: "weerachai.p@pea.co.th", joined: "2023-07-12" },
  { id: "U010", emp: "61567", name: "ดารณี ทองคำ",    dept: "แผนกวิศวกรรม", role: "manager", status: "approved", phone: "082-778-8899", email: "daranee.t@pea.co.th", joined: "2021-04-08" },
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

export const TODAY = "2026-05-21";

export const BOOKINGS = [
  { id: "BK2026-0521-001", vehicleId: "V002", userId: "U001", purpose: "ตรวจสอบมิเตอร์", purposeNote: "ตรวจสอบมิเตอร์ผิดปกติ บ้านดง อ.ฝาง", from: "2026-05-21T08:00", to: "2026-05-21T16:00", destination: "บ้านดง อ.ฝาง จ.เชียงใหม่", coords: [19.9210, 99.2138], status: "approved", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-19T10:25", mileageOut: 67120, mileageIn: null, passengers: 2 },
  { id: "BK2026-0521-002", vehicleId: "V004", userId: "U004", purpose: "ติดตามลูกหนี้ค่าไฟฟ้า", purposeNote: "ติดตามลูกหนี้ค้างชำระ 3 ราย ต.แม่ข่า", from: "2026-05-21T09:00", to: "2026-05-21T15:30", destination: "ต.แม่ข่า อ.ฝาง จ.เชียงใหม่", coords: [19.8542, 99.1856], status: "approved", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-19T14:10", mileageOut: 38450, mileageIn: null, passengers: 1 },
  { id: "BK2026-0521-003", vehicleId: "V010", userId: "U005", purpose: "ก่อสร้างระบบจำหน่าย", purposeNote: "ขนเสาคอนกรีต 8 เมตร ไปลงจุดติดตั้ง", from: "2026-05-21T07:30", to: "2026-05-21T17:00", destination: "ต.โป่งน้ำร้อน อ.ฝาง", coords: [19.9580, 99.1420], status: "booked", approvedBy: null, createdAt: "2026-05-20T16:00", mileageOut: null, mileageIn: null, passengers: 3 },
  { id: "BK2026-0521-004", vehicleId: "V014", userId: "U005", purpose: "ก่อสร้างระบบจำหน่าย", purposeNote: "ติดตั้งหม้อแปลงไฟฟ้า", from: "2026-05-21T08:00", to: "2026-05-21T17:00", destination: "ต.แม่งอน อ.ฝาง", coords: [19.7820, 99.2740], status: "approved", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-20T11:30", mileageOut: 89200, mileageIn: null, passengers: 4 },
  { id: "BK2026-0521-005", vehicleId: "V018", userId: "U002", purpose: "ประชุม/อบรม", purposeNote: "ประชุมร่วมกับสำนักงานเขต", from: "2026-05-21T13:00", to: "2026-05-21T17:00", destination: "PEA เขต 1 เชียงใหม่", coords: [18.7883, 98.9853], status: "booked", approvedBy: null, createdAt: "2026-05-21T08:45", mileageOut: null, mileageIn: null, passengers: 2 },
  { id: "BK2026-0521-006", vehicleId: "V021", userId: "U009", purpose: "ตรวจสอบมิเตอร์", purposeNote: "ตรวจมิเตอร์ติดตั้งใหม่ 12 ราย", from: "2026-05-21T08:30", to: "2026-05-21T16:30", destination: "ต.เวียง อ.ฝาง", coords: [19.9152, 99.2102], status: "approved", approvedBy: "ดารณี ทองคำ", createdAt: "2026-05-20T15:20", mileageOut: 38900, mileageIn: null, passengers: 2 },
  { id: "BK2026-0521-007", vehicleId: "V024", userId: "U002", purpose: "ติดตามข้อร้องเรียน", purposeNote: "ลงพื้นที่ตรวจสอบข้อร้องเรียนไฟตก", from: "2026-05-21T10:00", to: "2026-05-21T15:00", destination: "ต.สันทราย อ.ฝาง", coords: [19.8842, 99.1742], status: "booked", approvedBy: null, createdAt: "2026-05-21T07:30", mileageOut: null, mileageIn: null, passengers: 1 },
  { id: "BK2026-0522-008", vehicleId: "V001", userId: "U001", purpose: "ตรวจสอบมิเตอร์", purposeNote: "ตรวจสอบมิเตอร์รายเดือน", from: "2026-05-22T08:00", to: "2026-05-22T16:00", destination: "ต.แม่สูน อ.ฝาง", coords: [19.8920, 99.2310], status: "booked", approvedBy: null, createdAt: "2026-05-21T09:00", mileageOut: null, mileageIn: null, passengers: 2 },
  { id: "BK2026-0523-009", vehicleId: "V003", userId: "U004", purpose: "ติดตามลูกหนี้ค่าไฟฟ้า", purposeNote: "ติดตามลูกหนี้ค้างชำระ", from: "2026-05-23T09:00", to: "2026-05-23T15:00", destination: "ต.ม่อนปิ่น อ.ฝาง", coords: [19.8120, 99.2540], status: "approved", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-19T13:00", mileageOut: null, mileageIn: null, passengers: 1 },
  { id: "BK2026-0524-010", vehicleId: "V006", userId: "U005", purpose: "ประชุม/อบรม", purposeNote: "อบรมความปลอดภัยในการทำงาน 12 คน", from: "2026-05-24T07:00", to: "2026-05-24T18:00", destination: "PEA เขต 1 เชียงใหม่", coords: [18.7883, 98.9853], status: "approved", approvedBy: "ธีรพงษ์ ทองสุข", createdAt: "2026-05-18T10:00", mileageOut: null, mileageIn: null, passengers: 10 },
  { id: "BK2026-0518-011", vehicleId: "V003", userId: "U001", purpose: "ตรวจสอบมิเตอร์", purposeNote: "ตรวจสอบมิเตอร์ตามแผน", from: "2026-05-18T08:00", to: "2026-05-18T16:00", destination: "ต.แม่งอน อ.ฝาง", coords: [19.7820, 99.2740], status: "completed", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-16T11:00", mileageOut: 28852, mileageIn: 28940, rating: 5, passengers: 2 },
  { id: "BK2026-0517-012", vehicleId: "V007", userId: "U001", purpose: "ติดตามข้อร้องเรียน", purposeNote: "ลงพื้นที่ตรวจสอบข้อร้องเรียน", from: "2026-05-17T09:00", to: "2026-05-17T14:00", destination: "ต.แม่คะ อ.ฝาง", coords: [19.9410, 99.1985], status: "completed", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-16T08:30", mileageOut: 73320, mileageIn: 73450, rating: 4, passengers: 1 },
  { id: "BK2026-0515-013", vehicleId: "V011", userId: "U005", purpose: "ก่อสร้างระบบจำหน่าย", purposeNote: "ขนวัสดุก่อสร้าง", from: "2026-05-15T07:30", to: "2026-05-15T17:00", destination: "ต.โป่งน้ำร้อน อ.ฝาง", coords: [19.9580, 99.1420], status: "completed", approvedBy: "วิภาวี ศรีสุข", createdAt: "2026-05-13T15:00", mileageOut: 87100, mileageIn: 87300, rating: 5, passengers: 3 },
  { id: "BK2026-0520-014", vehicleId: "V001", userId: "U005", purpose: "อื่นๆ (ระบุ)", purposeNote: "ขับไปร่วมงานที่กรุงเทพฯ", from: "2026-05-22T05:00", to: "2026-05-25T22:00", destination: "กรุงเทพมหานคร", coords: [13.7563, 100.5018], status: "rejected", approvedBy: "ธีรพงษ์ ทองสุข", rejectReason: "ระยะเวลาและระยะทางเกินขอบเขตการใช้งานปกติ ให้ประสานงานรถจากเขต", createdAt: "2026-05-19T14:00", mileageOut: null, mileageIn: null, passengers: 2 },
  { id: "BK2026-0521-015", vehicleId: "V008", userId: "U003", purpose: "ภารกิจด่วน", purposeNote: "ภารกิจด่วน - ตอบสนองไฟดับทั้งตำบล ต.แม่ข่า", from: "2026-05-21T11:00", to: "2026-05-21T20:00", destination: "ต.แม่ข่า อ.ฝาง", coords: [19.8542, 99.1856], status: "urgent", approvedBy: "ธีรพงษ์ ทองสุข", urgentReason: "เหตุไฟดับเป็นวงกว้าง ต้องระดมกำลังออกซ่อมด่วน", createdAt: "2026-05-21T10:55", mileageOut: 18700, mileageIn: null, passengers: 3 },
];

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
