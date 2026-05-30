// In-app user manual — role-based content
import React from 'react'

const SECTIONS = {
  user: [
    {
      id: 'intro', icon: '🚗', title: 'ภาพรวมระบบ EasyDrive',
      content: [
        { type: 'p', text: 'EasyDrive คือระบบจองรถยนต์ออนไลน์ของการไฟฟ้าส่วนภูมิภาค สาขาฝาง ช่วยให้การขอใช้รถ การอนุมัติ และการติดตามสถานะทำได้สะดวก รวดเร็ว ผ่านทางเว็บเบราว์เซอร์ทุกอุปกรณ์' },
        { type: 'tip', text: 'สามารถเข้าใช้งานได้ทั้งบน Desktop, Tablet และมือถือ' },
        { type: 'roles', items: [
          { role: 'ผู้ใช้งาน (User)', color: '#6E2A8C', desc: 'จองรถ ดูสถานะการจอง Check-in/out' },
          { role: 'ผู้จัดการ (Manager)', color: '#0d9488', desc: 'อนุมัติการจอง ดูรายงาน และทุกอย่างของ User' },
          { role: 'ผู้ดูแลระบบ (Admin)', color: '#F37021', desc: 'จัดการทุกอย่างในระบบ สมาชิก รถ แผนก' },
        ]},
      ]
    },
    {
      id: 'login', icon: '🔐', title: 'การเข้าสู่ระบบ',
      content: [
        { type: 'steps', items: [
          { n:1, title:'เปิดเว็บ', desc:'ไปที่ easydrive-fang.vercel.app ผ่านเบราว์เซอร์บนอุปกรณ์ใดก็ได้' },
          { n:2, title:'กรอกข้อมูล', desc:'ใส่รหัสพนักงาน (เช่น 63001) และรหัสผ่านที่ได้รับจากผู้ดูแลระบบ' },
          { n:3, title:'กด "เข้าสู่ระบบ"', desc:'หากยังไม่มีบัญชี กด "สมัครสมาชิก" และรอการอนุมัติจากผู้ดูแลระบบ' },
        ]},
        { type: 'tip', text: 'สามารถดูปฏิทินการจองสาธารณะได้โดยไม่ต้องล็อกอิน กด "ดูปฏิทินการจอง (สาธารณะ)" ที่หน้าเข้าสู่ระบบ' },
        { type: 'warn', text: 'ระบบจะออกจากระบบอัตโนมัติหากไม่มีการใช้งานนาน 30 นาที เพื่อความปลอดภัย' },
      ]
    },
    {
      id: 'booking', icon: '📋', title: 'การจองรถยนต์',
      content: [
        { type: 'p', text: 'การจองทำได้ 3 ขั้นตอน ใช้เวลาไม่เกิน 2 นาที' },
        { type: 'steps', items: [
          { n:1, title:'รายละเอียดการเดินทาง', desc:'กรอกวัตถุประสงค์, วันเวลาไป-กลับ, สถานที่ปลายทาง (คลิกบนแผนที่เพื่อปักหมุด หรือกรอกพิกัด GPS) และจำนวนผู้โดยสาร' },
          { n:2, title:'เลือกรถ', desc:'ระบบแสดงรถที่ว่างในช่วงเวลาที่เลือก เลือกรถที่เหมาะสมกับภารกิจ สามารถกรองตามประเภทหรือเชื้อเพลิงได้' },
          { n:3, title:'ยืนยันการจอง', desc:'ตรวจสอบข้อมูลให้ครบถ้วน กด "ยืนยันการจอง" — คำขอจะถูกส่งให้ผู้จัดการอนุมัติ' },
        ]},
        { type: 'tip', text: 'หากมีภารกิจด่วน สามารถทำเครื่องหมาย "ภารกิจด่วน" ในขั้นตอนที่ 3 เพื่อให้ผู้จัดการพิจารณาก่อน' },
        { type: 'tip', text: 'ระบบจะแจ้งเตือนเมื่อการจองได้รับการอนุมัติหรือปฏิเสธ' },
      ]
    },
    {
      id: 'mybookings', icon: '📑', title: 'การดูสถานะการจอง',
      content: [
        { type: 'p', text: 'ไปที่เมนู "การจองของฉัน" เพื่อดูประวัติและสถานะการจองทั้งหมด' },
        { type: 'statuses', items: [
          { status: 'รออนุมัติ', color: '#b45309', desc: 'คำขอถูกส่งแล้ว รอผู้จัดการพิจารณา' },
          { status: 'อนุมัติแล้ว', color: '#047857', desc: 'ได้รับการอนุมัติ พร้อมใช้งานตามวันเวลาที่จอง' },
          { status: 'ภารกิจด่วน', color: '#b45309', desc: 'อนุมัติพิเศษสำหรับภารกิจเร่งด่วน' },
          { status: 'ไม่อนุมัติ', color: '#dc2626', desc: 'ถูกปฏิเสธ ดูเหตุผลได้ในรายละเอียด' },
          { status: 'เสร็จสิ้น', color: '#4b5563', desc: 'ภารกิจเสร็จสมบูรณ์ คืนรถเรียบร้อยแล้ว' },
        ]},
        { type: 'tip', text: 'กดปุ่ม "พิมพ์ใบจอง" ในรายละเอียดการจองเพื่อพิมพ์ใบยืนยันสำหรับ รปภ.' },
        { type: 'tip', text: 'สแกน QR บนใบจองเพื่อเปิดรายละเอียดการจองได้ทันที — QR จะพาไปยังหน้าใบจองนั้นโดยตรง' },
      ]
    },
    {
      id: 'checkin', icon: '✅', title: 'Check-in และ Check-out',
      content: [
        { type: 'p', text: 'ก่อนนำรถออกและหลังนำรถกลับ ต้องทำการ Check-in/out ในระบบทุกครั้ง พร้อมถ่ายรูปและกรอก Checklist สภาพรถ' },
        { type: 'steps', items: [
          { n:1, title:'Check-in (รับรถ)', desc:'ไปที่เมนู Check-in/out → เลือกการจองที่อนุมัติแล้ว → ถ่ายรูปสภาพรถก่อนออกเดินทาง → กรอก Checklist 10 รายการ (ยางรถยนต์, น้ำมันเครื่อง, ระบบเบรก, ระบบหล่อเย็น, ไฟส่องสว่าง, แบตเตอรี่, ใบปัดน้ำฝน, อุปกรณ์ฉุกเฉิน, สภาพรถโดยรวม, เอกสารสำคัญและเบอร์โทรฉุกเฉิน) → บันทึกเลขไมล์ → กด "Check-in"' },
          { n:2, title:'เดินทาง', desc:'ใช้รถตามวัตถุประสงค์ที่แจ้งไว้ในการจอง' },
          { n:3, title:'Check-out (คืนรถ)', desc:'เมื่อกลับถึงสำนักงาน → ถ่ายรูปสภาพรถหลังใช้งาน → บันทึกเลขไมล์หลังใช้งาน → ให้คะแนนรถ → กด "Check-out"' },
        ]},
        { type: 'tip', text: 'ถ่ายรูปสภาพรถก่อนออกเดินทางและหลังกลับ เพื่อบันทึกหลักฐานสภาพรถ รูปถ่ายจะถูกบันทึกในระบบโดยอัตโนมัติ' },
        { type: 'warn', text: 'หากเลขไมล์ไม่ถูกต้อง สามารถแจ้งขอแก้ไขได้ในหน้า "การจองของฉัน" รอผู้ดูแลระบบอนุมัติ' },
      ]
    },
    {
      id: 'checkin-history', icon: '📸', title: 'ประวัติ Check-in/out',
      content: [
        { type: 'p', text: 'ไปที่เมนู "ประวัติ Check-in/out" เพื่อดูประวัติการเดินทางของตัวเอง พร้อมรูปถ่ายและผลการตรวจสภาพรถ' },
        { type: 'list', items: [
          'ดูรูปถ่ายสภาพรถก่อน/หลังการเดินทาง — กดรูปเพื่อขยาย',
          'ดูผลการตรวจ Checklist: ผ่าน / ไม่ผ่าน / ข้าม แต่ละรายการ',
          'ดูข้อมูลเลขไมล์เริ่มต้น-สิ้นสุด และระยะทางรวมของแต่ละเที่ยว',
          'Export ข้อมูลการเดินทางออกเป็นไฟล์ CSV',
        ]},
        { type: 'tip', text: 'ผู้ใช้ทั่วไปจะเห็นเฉพาะประวัติการเดินทางของตัวเอง' },
      ]
    },
    {
      id: 'calendar', icon: '📅', title: 'ปฏิทินการจอง',
      content: [
        { type: 'p', text: 'ปฏิทินแสดงภาพรวมการใช้รถทั้งหน่วยงาน ช่วยวางแผนการจองล่วงหน้า' },
        { type: 'list', items: [
          'สลับมุมมองระหว่าง "เดือน" และ "สัปดาห์" ได้ที่ปุ่มมุมบนขวา',
          'กรองตามรถเฉพาะคันได้จาก dropdown',
          'คลิกวันที่มีรายการ → ดูรายละเอียดการจองทั้งหมดในวันนั้น',
          'สีเขียว = อนุมัติแล้ว, สีส้ม = รออนุมัติ, สีแดง = ภารกิจด่วน',
        ]},
      ]
    },
    {
      id: 'settings', icon: '⚙️', title: 'การตั้งค่าบัญชี',
      content: [
        { type: 'p', text: 'ไปที่เมนู "ตั้งค่า" → "บัญชีผู้ใช้" เพื่อแก้ไขข้อมูลส่วนตัว' },
        { type: 'list', items: [
          'แก้ไขชื่อ, อีเมล, เบอร์โทร และแผนก',
          'เปลี่ยนรหัสผ่านได้ที่หัวข้อ "เปลี่ยนรหัสผ่าน"',
          'ตั้งค่า Dark Mode ได้จากไอคอนพระจันทร์/ดวงอาทิตย์ที่ topbar',
          'Command Menu: กด Ctrl+K (⌘K บน Mac) เพื่อเปิดเมนูค้นหาทั้งระบบ',
        ]},
      ]
    },
  ],
  manager: [
    {
      id: 'approvals', icon: '✅', title: 'การอนุมัติการจอง',
      content: [
        { type: 'p', text: 'เมนู "อนุมัติการจอง" แสดงคำขอที่รอการพิจารณา ตัวเลขสีส้มบน badge คือจำนวนที่รอดำเนินการ' },
        { type: 'steps', items: [
          { n:1, title:'ดูคำขอ', desc:'กดที่รายการเพื่อดูรายละเอียด: ผู้จอง, รถที่ต้องการ, วันเวลา, จุดหมาย' },
          { n:2, title:'อนุมัติ', desc:'กด "อนุมัติ" → ยืนยันใน dialog — ระบบจะแจ้งเตือนผู้จองทันที' },
          { n:3, title:'ปฏิเสธ', desc:'กด "ปฏิเสธ" → ระบุเหตุผล (อย่างน้อย 3 ตัวอักษร) → ยืนยัน' },
        ]},
        { type: 'tip', text: 'การจองที่ทำเครื่องหมาย "ภารกิจด่วน" จะแสดงป้ายสีแดง ควรพิจารณาก่อน' },
        { type: 'warn', text: 'เมื่ออนุมัติแล้วไม่สามารถยกเลิกได้ผ่านระบบ ต้องติดต่อผู้ดูแลระบบ' },
      ]
    },
    {
      id: 'reports', icon: '📊', title: 'รายงานและสถิติ',
      content: [
        { type: 'p', text: 'เมนู "รายงาน" แสดงสถิติการใช้รถยนต์ของหน่วยงาน' },
        { type: 'list', items: [
          'สรุปการจอง: จำนวนการจองตามสถานะ, รถที่ใช้มากที่สุด',
          'ระยะทางรวม: เลขไมล์สะสมของแต่ละคัน',
          'สถิติรายแผนก: ความถี่การใช้รถของแต่ละแผนก (นับเฉพาะการจองที่อนุมัติแล้ว, เสร็จสิ้น, และภารกิจด่วน)',
          'ผู้ใช้งานสูงสุด: จัดอันดับผู้ใช้รถบ่อยที่สุด (นับเฉพาะ approved/completed/urgent)',
          'ค่าน้ำมัน: คำนวณจากข้อมูลเลขไมล์จริง (mileageIn − mileageOut) ตามประเภทเชื้อเพลิงของรถแต่ละคัน',
          'Export ข้อมูลออกเป็น CSV ได้จากปุ่ม "ส่งออก"',
        ]},
        { type: 'tip', text: 'สถิติทั้งหมดคำนวณจากการจองที่อนุมัติแล้ว/เสร็จสิ้น/ภารกิจด่วนเท่านั้น ไม่รวมรายการที่ยังรออนุมัติหรือถูกปฏิเสธ' },
      ]
    },
  ],
  admin: [
    {
      id: 'members', icon: '👥', title: 'การจัดการสมาชิก',
      content: [
        { type: 'p', text: 'เมนู "สมาชิก" จัดการบัญชีผู้ใช้ทั้งหมดในระบบ' },
        { type: 'steps', items: [
          { n:1, title:'อนุมัติสมาชิกใหม่', desc:'แท็บ "รออนุมัติ" → กดชื่อผู้ใช้ → ตรวจสอบข้อมูล → "อนุมัติ" หรือ "ปฏิเสธ"' },
          { n:2, title:'เปลี่ยน Role', desc:'กดปุ่ม Role (User/Manager/Admin) ข้างชื่อผู้ใช้ → ยืนยันการเปลี่ยน' },
          { n:3, title:'แก้ไขข้อมูล', desc:'กดไอคอนดินสอ → แก้ไขชื่อ, แผนก, เบอร์โทร → บันทึก' },
        ]},
        { type: 'warn', text: 'การเปลี่ยน Role เป็น Admin ให้สิทธิ์เต็มรูปแบบ ดำเนินการด้วยความระมัดระวัง' },
      ]
    },
    {
      id: 'vehicles', icon: '🚘', title: 'การจัดการรถยนต์',
      content: [
        { type: 'p', text: 'เมนู "จัดการรถยนต์" ดูแลข้อมูลรถทั้งหมดในระบบ' },
        { type: 'steps', items: [
          { n:1, title:'เพิ่มรถ', desc:'กด "+ เพิ่มรถ" → กรอกข้อมูล: ทะเบียน, ยี่ห้อ, ปี, ประเภท, เชื้อเพลิง, ที่นั่ง, เลขไมล์ปัจจุบัน' },
          { n:2, title:'ดูรายละเอียดรถ', desc:'คลิกที่แถวรถในตาราง → เปิด Modal แสดงข้อมูลครบ: สเปครถ, วันครบกำหนด (สี: แดง < 30 วัน, เหลือง < 60 วัน), และการจอง 5 รายการล่าสุด' },
          { n:3, title:'แก้ไขรถ', desc:'กดปุ่ม "แก้ไข" (ไม่ต้องเปิด modal) → อัปเดตข้อมูลที่ต้องการ' },
          { n:4, title:'เปลี่ยนสถานะ', desc:'กดปุ่มสถานะเพื่อเปลี่ยนระหว่าง พร้อมใช้งาน / บำรุงรักษา / ไม่พร้อมใช้งาน' },
        ]},
        { type: 'tip', text: 'รถที่อยู่ระหว่าง "บำรุงรักษา" จะไม่ปรากฏในหน้าเลือกรถเมื่อจอง' },
        { type: 'tip', text: 'เลขไมล์ปัจจุบันคำนวณจากข้อมูลการเดินทางจริง (mileageIn ล่าสุดของการเดินทาง completed) — ระบบอัพเดทอัตโนมัติทุกครั้งที่มีการ Check-out' },
        { type: 'tip', text: 'ต้องการเพิ่มรถหลายคันพร้อมกัน รองรับการ import ไฟล์ CSV (ดูที่ปุ่ม Import)' },
      ]
    },
    {
      id: 'checkin-history-admin', icon: '✏️', title: 'แก้ไขประวัติ Check-in/out',
      content: [
        { type: 'p', text: 'Admin สามารถดูและแก้ไขประวัติ Check-in/out ของผู้ใช้ทุกคนในระบบได้จากเมนู "ประวัติ Check-in/out"' },
        { type: 'list', items: [
          'ดูประวัติการเดินทางทั้งหมดจากทุกผู้ใช้ในองค์กร',
          'กรองตามชื่อผู้ใช้, รถ, หรือช่วงวันที่',
          'กดปุ่มแก้ไข (✏️) ที่การ์ดการเดินทางใดก็ได้เพื่อแก้ไขข้อมูล',
          'ระบบแก้ไขมี 2 ขั้นตอน: กรอกค่าใหม่ → ยืนยันโดยดู diff ของฟิลด์ที่เปลี่ยนแปลงก่อนบันทึก',
          'แก้ไขได้: เลขไมล์, ผล Checklist, คะแนน, หมายเหตุ',
        ]},
        { type: 'warn', text: 'การแก้ไขข้อมูลเลขไมล์จะกระทบการคำนวณเลขไมล์ปัจจุบันของรถด้วย' },
      ]
    },
    {
      id: 'depts', icon: '🏢', title: 'การจัดการแผนก',
      content: [
        { type: 'p', text: 'ไปที่ ตั้งค่า → ข้อมูลระบบ → แผนก เพื่อดูแลรายชื่อแผนกในระบบ' },
        { type: 'list', items: [
          'เพิ่มแผนก: พิมพ์ชื่อในช่องด้านบน → กด "+ เพิ่มแผนก" → ยืนยัน',
          'แก้ไขชื่อ: กดไอคอนดินสอ → พิมพ์ชื่อใหม่ → บันทึก',
          'ซ่อนแผนก: กด "ซ่อน" → แผนกจะไม่แสดงในฟอร์มสมัครใหม่ แต่ข้อมูลเดิมไม่หาย',
          'เรียงลำดับ: กดลูกศรขึ้น/ลงเพื่อปรับลำดับการแสดงผล',
          'ลบแผนก: กดไอคอนถังขยะ → ยืนยัน (ระวัง: ไม่สามารถกู้คืนได้)',
        ]},
        { type: 'warn', text: 'การซ่อนแผนกไม่กระทบกับสมาชิกที่อยู่ในแผนกนั้นอยู่แล้ว' },
      ]
    },
    {
      id: 'data-settings', icon: '🗂️', title: 'ข้อมูลระบบ (ปรับแต่งได้)',
      content: [
        { type: 'p', text: 'ไปที่ ตั้งค่า → ข้อมูลระบบ เพื่อแก้ไขข้อมูลที่ใช้ทั่วทั้งระบบ — การเปลี่ยนแปลงบันทึกลง Supabase และมีผลทันทีสำหรับผู้ใช้ทุกคน' },
        { type: 'list', items: [
          'รายการตรวจสอบ: เพิ่ม/แก้ไข/ลบ/เรียงลำดับรายการตรวจสอบสภาพรถ 10 จุด (ต้องยืนยันก่อนลบ)',
          'วัตถุประสงค์: แก้ไขรายการวัตถุประสงค์ที่ปรากฏในฟอร์มจองรถ',
          'ประเภทรถ: แก้ไขชื่อประเภทรถ (ไอคอนเป็นค่าตายตัว 8 แบบ)',
          'เชื้อเพลิง: เพิ่ม/แก้ไข/ลบประเภทเชื้อเพลิง',
          'แผนก: จัดการรายชื่อแผนกในหน่วยงาน',
          'ราคาน้ำมัน: กำหนดราคาเชื้อเพลิงสำหรับคำนวณค่าน้ำมันในรายงาน หรือซิงค์ราคาจาก PTT แบบเรียลไทม์',
        ]},
        { type: 'tip', text: 'กด "↺ คืนค่าเริ่มต้น" เพื่อรีเซ็ตรายการตรวจสอบกลับเป็น 10 รายการดั้งเดิม หากข้อมูลถูกลบไปโดยไม่ตั้งใจ' },
        { type: 'warn', text: 'ต้องสร้างตาราง app_config ใน Supabase ก่อน — ระบบจะแสดง SQL สำหรับสร้างตารางหากยังไม่มี' },
      ]
    },
    {
      id: 'fuel-prices', icon: '⛽', title: 'การจัดการราคาน้ำมัน',
      content: [
        { type: 'p', text: 'ไปที่ ตั้งค่า → ข้อมูลระบบ → แท็บ "💰 ราคาน้ำมัน" เพื่อกำหนดราคาเชื้อเพลิงที่ใช้คำนวณในรายงาน ค่าที่บันทึกจะมีผลทันทีสำหรับทุกผู้ใช้' },
        { type: 'steps', items: [
          { n:1, title:'ซิงค์ราคาจาก PTT', desc:'กดปุ่ม "🔄 ซิงค์ราคาจาก PTT" — ระบบดึงราคาล่าสุดจาก API ของ PTT โดยอัตโนมัติ (ต้องเชื่อมต่ออินเทอร์เน็ต)' },
          { n:2, title:'ปรับราคาด้วยตนเอง', desc:'กรอกราคาในช่องของเชื้อเพลิงแต่ละประเภท: แก๊สโซฮอล์, ดีเซล, เบนซิน, NGV, EV' },
          { n:3, title:'บันทึก', desc:'กด "💾 บันทึกราคา" — ราคาจะถูกบันทึกลง Supabase และนำไปใช้คำนวณค่าน้ำมันในรายงานทันที' },
        ]},
        { type: 'tip', text: 'ราคา PTT อัปเดตทุกวัน — แนะนำให้ซิงค์เมื่อต้องการรายงานที่ใกล้เคียงความเป็นจริงมากที่สุด' },
        { type: 'warn', text: 'หากซิงค์ PTT ไม่สำเร็จ (เน็ตไม่เสถียร) ให้กรอกราคาด้วยตนเองแล้วกดบันทึก — ระบบจะใช้ราคาล่าสุดที่บันทึกไว้เสมอ' },
      ]
    },
    {
      id: 'maintenance', icon: '🔧', title: 'โหมดบำรุงรักษา',
      content: [
        { type: 'p', text: 'ไปที่ ตั้งค่า → ทดสอบระบบ เพื่อควบคุมโหมดบำรุงรักษา' },
        { type: 'steps', items: [
          { n:1, title:'ปิดระบบ', desc:'กด "เปิดระบบอยู่" → ยืนยัน → ระบบจะเข้าสู่โหมดบำรุงรักษา ผู้ใช้ทั่วไปเห็นหน้า "ระบบปิดบำรุงรักษาชั่วคราว"' },
          { n:2, title:'แถบเตือนสีส้ม', desc:'แอดมินที่เข้าใช้งานระหว่างโหมดบำรุงรักษาจะเห็นแถบเตือนสีส้มด้านบน เพื่อเตือนว่าระบบยังปิดอยู่' },
          { n:3, title:'เปิดระบบ', desc:'กดปุ่ม "เปิดระบบ" ในแถบเตือน หรือกลับไปที่ ตั้งค่า → ทดสอบระบบ → กด "🔴 ปิดระบบอยู่" → ยืนยัน' },
        ]},
        { type: 'tip', text: 'ระบบบันทึกประวัติการเปิด/ปิดโหมดบำรุงรักษาทุกครั้ง — ดูได้ที่ส่วน "ประวัติการเปิด/ปิดระบบ" (ยุบ/ขยายได้) เพื่อตรวจสอบว่าใคร เปิด/ปิด เมื่อไหร่' },
        { type: 'warn', text: 'อย่าลืมเปิดระบบหลังบำรุงรักษาเสร็จ — แถบเตือนสีส้มจะเตือนตลอดเวลาที่ระบบยังปิดอยู่' },
      ]
    },
    {
      id: 'fuel-calc', icon: '⛽', title: 'วิธีคำนวณค่าเชื้อเพลิง (รายงาน)',
      content: [
        { type: 'p', text: 'รายงาน "ค่าเชื้อเพลิงโดยประมาณ" ในหน้า รายงาน คำนวณจากระยะทางจริงที่บันทึกระหว่าง Check-in/out คูณกับอัตราสิ้นเปลืองและราคาเชื้อเพลิงมาตรฐาน' },
        { type: 'formula', items: [
          { label: 'สูตรหลัก', value: 'ค่าเชื้อเพลิง (฿) = (ระยะทาง ÷ อัตราสิ้นเปลือง) × ราคาต่อลิตร' },
          { label: 'ระยะทาง', value: 'mileageIn − mileageOut (กม.) จากการเดินทาง status = completed' },
          { label: 'ตัวอย่าง', value: 'แก๊สโซฮอล์ 100 กม. → (100 ÷ 14) × 38.50 = ฿275' },
        ]},
        { type: 'table', heads: ['ประเภทเชื้อเพลิง', 'อัตราสิ้นเปลือง', 'ราคาต่อลิตร/หน่วย', 'ตัวอย่าง 100 กม.'], rows: [
          ['แก๊สโซฮอล์', '14 กม./ล.', '฿38.50/ล.', '฿275'],
          ['ดีเซล', '12 กม./ล.', '฿32.50/ล.', '฿271'],
          ['เบนซิน', '14 กม./ล.', '฿41.50/ล.', '฿296'],
          ['NGV', '10 กม./ก.ก.', '฿16.50/ก.ก.', '฿165'],
          ['EV', '6 กม./หน่วย', '฿4.50/หน่วย', '฿75'],
        ]},
        { type: 'tip', text: 'ตัวเลขนี้เป็นการ "ประมาณ" เพื่อใช้วางแผนงบประมาณ ไม่ใช่ค่าใช้จ่ายจริง — ขึ้นอยู่กับพฤติกรรมการขับ สภาพรถ และราคาเชื้อเพลิงที่อาจเปลี่ยนแปลง' },
        { type: 'warn', text: 'การคำนวณใช้ได้เฉพาะการเดินทางที่บันทึกเลขไมล์ครบ (ทั้ง Check-in และ Check-out) เท่านั้น — การเดินทางที่ไม่มีเลขไมล์จะไม่ถูกนับ' },
      ]
    },
    {
      id: 'util-calc', icon: '📊', title: 'วิธีคำนวณอัตราการใช้งาน (รายงาน)',
      content: [
        { type: 'p', text: 'แดชบอร์ดและรายงานแสดง "อัตราการใช้งาน" ซึ่งบอกว่ารถถูกนำออกใช้งานมากน้อยแค่ไหนเทียบกับความสามารถสูงสุด' },
        { type: 'formula', items: [
          { label: 'สูตรหลัก', value: 'อัตราการใช้งาน (%) = (จำนวนรถที่ถูกจองหรือใช้งาน ÷ จำนวนรถทั้งหมด) × 100' },
          { label: 'นับเป็น "ใช้งาน"', value: 'รถที่มีการจองสถานะ approved, urgent, หรือ booked ในช่วงเวลาปัจจุบัน' },
          { label: 'ตัวอย่าง', value: 'มีรถ 10 คัน ถูกจอง 7 คัน → อัตราการใช้งาน 70%' },
        ]},
        { type: 'tip', text: 'อัตราที่แนะนำอยู่ที่ 60–80% — ต่ำกว่า 60% อาจหมายความว่ามีรถเกินความต้องการ สูงกว่า 85% อาจทำให้การจองล่วงหน้าทำได้ยาก' },
        { type: 'warn', text: 'รถที่มีสถานะ "บำรุงรักษา" หรือ "ไม่พร้อมใช้งาน" ยังคงนับรวมในตัวส่วน (จำนวนรถทั้งหมด) — ซึ่งจะทำให้ตัวเลขอัตราการใช้งานต่ำกว่าความเป็นจริง' },
      ]
    },
    {
      id: 'mileage', icon: '🔧', title: 'การแก้ไขเลขไมล์',
      content: [
        { type: 'p', text: 'เมื่อผู้ใช้แจ้งเลขไมล์ผิดพลาด สามารถขอแก้ไขได้จากหน้า "การจองของฉัน" และ Admin อนุมัติจากหน้า "อนุมัติการจอง" แท็บ "แก้ไขไมล์"' },
        { type: 'steps', items: [
          { n:1, title:'ตรวจสอบคำขอ', desc:'ดูเลขไมล์เดิม, เลขที่ขอแก้ไข และเหตุผลที่แจ้ง' },
          { n:2, title:'อนุมัติ/ปฏิเสธ', desc:'หากเหตุผลสมเหตุสมผล กด "อนุมัติ" — ระบบอัปเดตเลขไมล์รถอัตโนมัติ' },
        ]},
      ]
    },
    {
      id: 'security', icon: '🛡️', title: 'ความปลอดภัยและสิทธิ์',
      content: [
        { type: 'p', text: 'ระบบรักษาความปลอดภัยหลายชั้น' },
        { type: 'list', items: [
          'Auto-logout: ออกจากระบบอัตโนมัติหากไม่มีการใช้งาน 30 นาที',
          'Row Level Security (RLS): ผู้ใช้เห็นเฉพาะข้อมูลที่ตนมีสิทธิ์',
          'ข้อมูลส่วนตัว (ชื่อ, แผนก) ไม่แสดงในปฏิทินสาธารณะ',
          'ทุก Action สำคัญ (อนุมัติ, ลบ, เปลี่ยน Role) ต้องผ่าน Confirm Dialog',
          'Command Menu ใช้ได้หลังล็อกอินเท่านั้น',
        ]},
      ]
    },
  ],
};

const ROLE_TABS = {
  user:    [{ id:'user', label:'👤 ผู้ใช้งาน', color:'#6E2A8C' }],
  manager: [{ id:'user', label:'👤 ผู้ใช้งาน', color:'#6E2A8C' }, { id:'manager', label:'👔 ผู้จัดการ', color:'#0d9488' }],
  admin:   [{ id:'user', label:'👤 ผู้ใช้งาน', color:'#6E2A8C' }, { id:'manager', label:'👔 ผู้จัดการ', color:'#0d9488' }, { id:'admin', label:'🔑 Admin', color:'#F37021' }],
};

function ManualScreen({ role = 'user' }) {
  const tabs = ROLE_TABS[role] || ROLE_TABS.user;
  const [activeRole, setActiveRole] = React.useState(role === 'admin' ? 'user' : role);
  const [activeSection, setActiveSection] = React.useState(null);
  const contentRef = React.useRef(null);

  const sections = SECTIONS[activeRole] || SECTIONS.user;

  function scrollTo(id) {
    setActiveSection(id);
    const el = document.getElementById('manual-sec-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  React.useEffect(() => {
    setActiveSection(sections[0]?.id || null);
    contentRef.current?.scrollTo(0, 0);
  }, [activeRole]);

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', minHeight: 0 }}>
      {/* Left TOC */}
      <div style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        padding: '16px 0',
        background: 'var(--surface)',
      }}>
        {/* Role tabs */}
        {tabs.length > 1 && (
          <div style={{ padding: '0 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>บทบาท</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveRole(t.id)} style={{
                  padding: '7px 10px', borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: activeRole === t.id ? t.color + '18' : 'transparent',
                  color: activeRole === t.id ? t.color : 'var(--text-2)',
                  borderLeft: activeRole === t.id ? `3px solid ${t.color}` : '3px solid transparent',
                }}>{t.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Section list */}
        <div style={{ padding: '0 12px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>หัวข้อ</div>
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13,
              background: activeSection === s.id ? 'var(--pea-purple-50)' : 'transparent',
              color: activeSection === s.id ? 'var(--pea-purple)' : 'var(--text-2)',
              fontWeight: activeSection === s.id ? 600 : 400,
            }}>
              <span>{s.icon}</span>
              <span style={{ lineHeight: 1.3 }}>{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', minWidth: 0 }}>
        <div style={{ maxWidth: 660 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>
              {tabs.find(t => t.id === activeRole)?.label || ''} — คู่มือการใช้งาน
            </h2>
            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 13.5 }}>EasyDrive Vehicle Booking System · การไฟฟ้าส่วนภูมิภาค สาขาฝาง</p>
          </div>

          {sections.map(sec => (
            <div key={sec.id} id={'manual-sec-' + sec.id}
              style={{ marginBottom: 32, scrollMarginTop: 16 }}
              onMouseEnter={() => setActiveSection(sec.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{sec.icon}</span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{sec.title}</h3>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
              </div>

              {sec.content.map((block, bi) => (
                <ContentBlock key={bi} block={block}/>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-3)', textAlign: 'center' }}>
            EasyDrive v1.1.0 · พัฒนาสำหรับ กฟภ. สาขาฝาง · หากพบปัญหา ติดต่อผู้ดูแลระบบ
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentBlock({ block }) {
  if (block.type === 'p') return (
    <p style={{ margin: '0 0 10px', color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.65 }}>{block.text}</p>
  );

  if (block.type === 'tip') return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 13px', background: 'var(--info-bg, #eff6ff)', borderRadius: 9, border: '1px solid #bfdbfe', marginBottom: 10, fontSize: 13 }}>
      <span style={{ flexShrink: 0 }}>💡</span>
      <span style={{ color: '#1e40af', lineHeight: 1.55 }}>{block.text}</span>
    </div>
  );

  if (block.type === 'warn') return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 13px', background: 'var(--warn-bg)', borderRadius: 9, border: '1px solid var(--warn)', marginBottom: 10, fontSize: 13 }}>
      <span style={{ flexShrink: 0 }}>⚠️</span>
      <span style={{ color: 'var(--warn)', lineHeight: 1.55 }}>{block.text}</span>
    </div>
  );

  if (block.type === 'steps') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
      {block.items.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--pea-purple)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{step.n}</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{step.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (block.type === 'list') return (
    <ul style={{ margin: '0 0 10px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {block.items.map((item, i) => (
        <li key={i} style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{item}</li>
      ))}
    </ul>
  );

  if (block.type === 'formula') return (
    <div style={{ marginBottom: 12, background: 'var(--pea-purple-50,rgba(109,40,217,.07))', border: '1px solid var(--pea-purple-20,rgba(109,40,217,.2))', borderRadius: 10, overflow: 'hidden' }}>
      {block.items.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 14px', borderBottom: i < block.items.length - 1 ? '1px solid var(--pea-purple-20,rgba(109,40,217,.15))' : 'none', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pea-purple)', minWidth: 80, paddingTop: 1, flexShrink: 0 }}>{row.label}</span>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: i === 0 ? 'var(--font-mono)' : 'inherit', lineHeight: 1.55 }}>{row.value}</span>
        </div>
      ))}
    </div>
  );

  if (block.type === 'table') return (
    <div style={{ marginBottom: 12, overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)' }}>
            {block.heads.map((h, i) => (
              <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < block.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '8px 12px', color: ci === 0 ? 'var(--text)' : 'var(--text-2)', fontWeight: ci === 0 ? 600 : 400, fontFamily: ci >= 1 ? 'var(--font-mono)' : 'inherit' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (block.type === 'roles') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
      {block.items.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', border: `1.5px solid ${r.color}33`, borderLeft: `4px solid ${r.color}`, borderRadius: 9, background: r.color + '08' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: r.color }}>{r.role}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 1 }}>{r.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (block.type === 'statuses') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
      {block.items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
          <span style={{ padding: '2px 10px', borderRadius: 6, background: s.color + '18', color: s.color, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', minWidth: 96, textAlign: 'center' }}>{s.status}</span>
          <span style={{ color: 'var(--text-2)' }}>{s.desc}</span>
        </div>
      ))}
    </div>
  );

  return null;
}

export { ManualScreen };
