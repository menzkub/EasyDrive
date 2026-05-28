// Notifications system — Center drawer + bell badge

const NOTI_ICONS = {
  approved: { ico: "check", bg: "var(--ok)" },
  rejected: { ico: "x", bg: "var(--danger)" },
  urgent: { ico: "zap", bg: "var(--status-urgent)" },
  reminder: { ico: "clock", bg: "var(--pea-orange)" },
  maintenance: { ico: "wrench", bg: "var(--status-maintenance)" },
  member: { ico: "users", bg: "var(--info)" },
  mileage: { ico: "car", bg: "var(--warn)" },
  default: { ico: "bell", bg: "var(--pea-purple)" },
};

function NotificationCenter({ open, onClose, notifications, onMarkRead, onMarkAllRead, onNavigate }) {
  if (!open) return null;
  const unread = notifications.filter((n) => !n.read);
  const grouped = {
    today: notifications.filter((n) => n.when.includes("นาที") || n.when.includes("ชั่วโมง") || n.when === "เมื่อกี้"),
    earlier: notifications.filter((n) => !(n.when.includes("นาที") || n.when.includes("ชั่วโมง") || n.when === "เมื่อกี้")),
  };

  return (
    <>
      <div style={{position:'fixed', inset:0, zIndex:900}} onClick={onClose}></div>
      <div style={{
        position:'fixed', top:64, right:14, width:380, maxWidth:'calc(100vw - 28px)',
        maxHeight:'calc(100vh - 80px)',
        background:'var(--surface)', borderRadius:14,
        boxShadow:'0 12px 40px rgba(40,20,60,0.25)',
        border:'1px solid var(--border)',
        zIndex:1000, display:'flex', flexDirection:'column',
        animation:'notiSlide 0.18s ease-out',
      }}>
        <div style={{padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8}}>
          <h3 style={{margin:0, fontSize:15, fontWeight:600, flex:1}}>การแจ้งเตือน</h3>
          {unread.length > 0 && (
            <button className="btn sm ghost" style={{fontSize:11.5, padding:'4px 8px'}} onClick={onMarkAllRead}>
              ทำเครื่องหมายอ่านทั้งหมด
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{padding:'48px 24px', textAlign:'center', color:'var(--text-3)'}}>
            <div style={{fontSize:36, marginBottom:6}}>🔔</div>
            ยังไม่มีการแจ้งเตือน
          </div>
        ) : (
          <div style={{overflowY:'auto', flex:1}}>
            {grouped.today.length > 0 && (
              <>
                <div style={{padding:'10px 16px 4px', fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--surface-2)'}}>
                  วันนี้
                </div>
                {grouped.today.map((n) => <NotificationItem key={n.id} n={n} onMarkRead={onMarkRead} onNavigate={onNavigate} onClose={onClose}/>)}
              </>
            )}
            {grouped.earlier.length > 0 && (
              <>
                <div style={{padding:'10px 16px 4px', fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--surface-2)'}}>
                  ก่อนหน้า
                </div>
                {grouped.earlier.map((n) => <NotificationItem key={n.id} n={n} onMarkRead={onMarkRead} onNavigate={onNavigate} onClose={onClose}/>)}
              </>
            )}
          </div>
        )}

        <div style={{padding:'10px 16px', borderTop:'1px solid var(--border)', textAlign:'center'}}>
          <button style={{background:'none', border:'none', color:'var(--pea-purple)', fontSize:12.5, fontWeight:600, cursor:'pointer'}}>
            ดูทั้งหมด · ตั้งค่าการแจ้งเตือน →
          </button>
        </div>
      </div>
      <style>{`@keyframes notiSlide { from { transform: translateY(-8px); opacity: 0 } }`}</style>
    </>
  );
}

function NotificationItem({ n, onMarkRead, onNavigate, onClose }) {
  const ic = NOTI_ICONS[n.type] || NOTI_ICONS.default;
  return (
    <div
      onClick={() => {
        if (!n.read) onMarkRead(n.id);
        if (n.route && onNavigate) { onNavigate(n.route); onClose(); }
      }}
      style={{
        display:'flex', gap:10, padding:'12px 16px',
        borderBottom:'1px solid var(--border)',
        background: n.read ? 'transparent' : 'var(--pea-purple-50)',
        cursor: n.route ? 'pointer' : 'default',
        position:'relative',
        transition:'background 0.12s',
      }}>
      <div style={{
        width:34, height:34, borderRadius:8,
        background: ic.bg, color:'white',
        display:'grid', placeItems:'center', flexShrink:0,
      }}>
        {window.I[ic.ico]}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2}}>{n.title}</div>
        <div style={{fontSize:12, color:'var(--text-2)', lineHeight:1.4, marginBottom:3}}>{n.body}</div>
        <div className="text-xs muted">{n.when}</div>
      </div>
      {!n.read && (
        <div style={{
          width:8, height:8, borderRadius:'50%',
          background:'var(--pea-purple)',
          position:'absolute', top:'50%', right:14, transform:'translateY(-50%)',
        }}></div>
      )}
    </div>
  );
}

// Generate role-specific notifications from current state
function generateNotifications(currentUser, bookings, users, vehicles, mileageCorrections) {
  const list = [];
  let idCounter = 1;
  const nextId = () => "N" + (idCounter++);

  if (currentUser.role === "user") {
    // Reminders / status changes for my bookings
    const myApproved = bookings.find((b) => b.userId === currentUser.id && b.status === "approved");
    if (myApproved) {
      const v = vehicles.find((x) => x.id === myApproved.vehicleId);
      list.push({
        id: nextId(), type: "approved", read: false, when: "15 นาทีที่แล้ว",
        title: "การจองของคุณได้รับการอนุมัติ",
        body: `${v?.brand} (${v?.plate?.split(' ').slice(0,2).join(' ')}) · ${myApproved.purpose}`,
        route: "my",
      });
    }
    list.push({
      id: nextId(), type: "reminder", read: false, when: "1 ชั่วโมงที่แล้ว",
      title: "เตือนความจำการใช้รถ",
      body: "พรุ่งนี้ 22 พ.ค. 08:00 ท่านมีกำหนดรับรถ V001 · กรุณามาที่จุดจอดก่อนเวลา 15 นาที",
      route: "checkin",
    });
    list.push({
      id: nextId(), type: "reminder", read: true, when: "เมื่อวาน",
      title: "Check-in คืนรถ", body: "อย่าลืม Check-in หลังคืนรถ V003 พร้อมถ่ายรูปสภาพรถ",
      route: "checkin",
    });
  }

  if (currentUser.role === "manager" || currentUser.role === "admin") {
    const pendingCount = bookings.filter((b) => b.status === "booked").length;
    if (pendingCount > 0) {
      list.push({
        id: nextId(), type: "reminder", read: false, when: "เมื่อกี้",
        title: `มี ${pendingCount} คำขอจองรอการอนุมัติ`,
        body: "กรุณาตรวจสอบและอนุมัติคำขอจองรถจากผู้ใช้งาน",
        route: "approvals",
      });
    }
    const urgentBooking = bookings.find((b) => b.status === "urgent");
    if (urgentBooking) {
      const v = vehicles.find((x) => x.id === urgentBooking.vehicleId);
      list.push({
        id: nextId(), type: "urgent", read: false, when: "5 นาทีที่แล้ว",
        title: "ภารกิจด่วน",
        body: `รถ ${v?.id} (${v?.plate?.split(' ').slice(0,2).join(' ')}) ถูกเรียกใช้ด่วน — ${urgentBooking.urgentReason || 'ตอบสนองเหตุไฟดับ'}`,
        route: "dashboard",
      });
    }
  }

  if (currentUser.role === "admin") {
    const pendingMembers = users.filter((u) => u.status === "pending").length;
    if (pendingMembers > 0) {
      list.push({
        id: nextId(), type: "member", read: false, when: "2 ชั่วโมงที่แล้ว",
        title: `สมาชิกใหม่ ${pendingMembers} รายรอการอนุมัติ`,
        body: "กรุณาตรวจสอบและอนุมัติบัญชีสมาชิก",
        route: "members",
      });
    }
    const pendingMileage = mileageCorrections.filter((c) => c.status === "pending").length;
    if (pendingMileage > 0) {
      list.push({
        id: nextId(), type: "mileage", read: false, when: "3 ชั่วโมงที่แล้ว",
        title: "คำขอแก้ไขเลขไมล์ใหม่",
        body: `มีคำขอแก้ไขเลขไมล์ ${pendingMileage} รายการจาก Check-in รอตรวจสอบ`,
        route: "approvals",
      });
    }
  }

  // Maintenance reminders (for all roles)
  list.push({
    id: nextId(), type: "maintenance", read: true, when: "วันนี้ 08:00",
    title: "รถใกล้ครบกำหนดเช็คระยะ",
    body: "รถ V005 และ V009 ครบกำหนดเช็คระยะภายใน 14 วัน",
    route: currentUser.role === "admin" ? "vehicles" : "dashboard",
  });

  return list;
}

Object.assign(window, { NotificationCenter, generateNotifications });
