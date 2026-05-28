// Main app — state, routing, and Tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "purple-orange",
  "density": "regular",
  "dashboardLayout": "timeline",
  "vehicleGrid": "grid",
  "darkSidebar": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Auth state
  const [currentUser, setCurrentUser] = React.useState(null);
  const [registered, setRegistered] = React.useState(false);

  // Data state (using state so mutations are reactive)
  const [vehicles, setVehicles] = React.useState(window.VEHICLES);
  const [bookings, setBookings] = React.useState(window.BOOKINGS);
  const [users, setUsers] = React.useState(window.USERS);
  const [vehicleHistory, setVehicleHistory] = React.useState([
    // Seed audit history
    { id: "H001", vehicleId: "V002", at: "2026-05-19T14:30", actor: "ธีรพงษ์ ทองสุข", action: "update", field: "เลขไมล์", oldValue: "64,500 กม.", newValue: "67,120 กม.", note: "ปรับเลขไมล์ตาม Check-in รอบล่าสุด", photo: true },
    { id: "H002", vehicleId: "V002", at: "2026-04-15T09:10", actor: "ธีรพงษ์ ทองสุข", action: "update", field: "วันครบกำหนดเช็คระยะถัดไป", oldValue: "2026-04-01", newValue: "2026-07-01", note: "ทำเช็คระยะ 60,000 กม. เสร็จสิ้น", photo: false },
    { id: "H003", vehicleId: "V005", at: "2026-05-15T08:45", actor: "ธีรพงษ์ ทองสุข", action: "status", field: "สถานะ", oldValue: "พร้อมใช้งาน", newValue: "บำรุงรักษา", note: "นำเข้าศูนย์ Toyota เปลี่ยนคลัทช์ คาดเสร็จ 25 พ.ค.", photo: false },
    { id: "H004", vehicleId: "V008", at: "2026-05-21T10:50", actor: "ธีรพงษ์ ทองสุข", action: "status", field: "สถานะการจอง", oldValue: "พร้อมใช้งาน", newValue: "ภารกิจด่วน", note: "เรียกใช้ภารกิจไฟดับ ต.แม่ข่า", photo: false },
    { id: "H005", vehicleId: "V001", at: "2026-04-01T11:20", actor: "วิภาวี ศรีสุข", action: "create", field: "เพิ่มรถยนต์", oldValue: "", newValue: "Toyota Hilux Revo · กข 1234", note: "เพิ่มรถใหม่เข้าระบบ", photo: false },
  ]);
  const [mileageCorrections, setMileageCorrections] = React.useState([
    {
      id: "MC2026-001",
      bookingId: "BK2026-0521-001",
      vehicleId: "V002",
      userId: "U001",
      claimedMileage: 67248,
      systemMileage: 67120,
      diff: 128,
      reason: "เลขไมล์บนหน้าปัดสูงกว่าในระบบ คาดว่าผู้ใช้งานคนก่อนหน้าไม่ได้บันทึก Check-in",
      dashPhoto: true,
      status: "pending",
      requestedAt: "2026-05-21T07:55",
    },
  ]);

  // Routing & modals
  const [route, setRoute] = React.useState("dashboard");
  const [selectedVehicle, setSelectedVehicle] = React.useState(null);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [voucherBooking, setVoucherBooking] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [confirm, setConfirm] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [notiOpen, setNotiOpen] = React.useState(false);
  const [readNotifications, setReadNotifications] = React.useState(new Set());

  // Apply theme
  React.useEffect(() => {
    const root = document.documentElement;
    if (t.theme === "blue") {
      root.style.setProperty('--pea-purple', '#1d4ed8');
      root.style.setProperty('--pea-purple-deep', '#1e3a8a');
      root.style.setProperty('--pea-purple-50', '#eff6ff');
      root.style.setProperty('--pea-purple-100', '#dbeafe');
      root.style.setProperty('--pea-orange', '#f59e0b');
      root.style.setProperty('--pea-orange-light', '#fbbf24');
    } else if (t.theme === "teal") {
      root.style.setProperty('--pea-purple', '#0d9488');
      root.style.setProperty('--pea-purple-deep', '#115e59');
      root.style.setProperty('--pea-purple-50', '#f0fdfa');
      root.style.setProperty('--pea-purple-100', '#ccfbf1');
      root.style.setProperty('--pea-orange', '#f59e0b');
      root.style.setProperty('--pea-orange-light', '#fbbf24');
    } else {
      // PEA default
      root.style.setProperty('--pea-purple', '#6E2A8C');
      root.style.setProperty('--pea-purple-deep', '#4D1F66');
      root.style.setProperty('--pea-purple-50', '#F5EEF8');
      root.style.setProperty('--pea-purple-100', '#E9DBF0');
      root.style.setProperty('--pea-orange', '#F37021');
      root.style.setProperty('--pea-orange-light', '#FAA61A');
    }
  }, [t.theme]);

  function pushToast(toast) {
    const id = Math.random().toString(36).slice(2);
    const item = { ...toast, id };
    setToasts((s) => [...s, item]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3500);
  }

  // ── Actions ──
  function handleLogin(user) { setCurrentUser(user); setRoute("dashboard"); }
  function handleLogout() { setCurrentUser(null); setRoute("dashboard"); }

  function handleRegister(reg) {
    const newUser = {
      id: "U" + (users.length + 1).toString().padStart(3, "0"),
      emp: reg.emp, name: reg.name, dept: reg.dept,
      role: "user", status: "pending",
      phone: reg.phone, email: reg.email, joined: "2026-05-21",
    };
    setUsers([...users, newUser]);
    setRegistered(true);
  }

  function handleSubmitBooking(form) {
    const id = `BK${new Date().toISOString().slice(0,10).replace(/-/g,'').slice(2)}-${(bookings.length+1).toString().padStart(3,"0")}`;
    const newBooking = {
      id, vehicleId: form.vehicleId, userId: currentUser.id,
      purpose: form.purpose, purposeNote: form.purposeNote,
      from: form.from, to: form.to,
      destination: form.destination, coords: form.coords,
      status: "booked", approvedBy: null,
      createdAt: new Date().toISOString().slice(0, 16),
      mileageOut: null, mileageIn: null,
      passengers: form.passengers,
    };
    setBookings([newBooking, ...bookings]);
    pushToast({ kind: "ok", title: "ส่งคำขอจองเรียบร้อย", body: "รออนุมัติจากผู้จัดการ — เลขที่ " + id });
    setRoute("my");
  }

  function handleApprove(bookingId) {
    const b = bookings.find((x) => x.id === bookingId);
    const v = vehicles.find((x) => x.id === b?.vehicleId);
    const u = users.find((x) => x.id === b?.userId);
    setConfirm({
      kind: "positive",
      title: "อนุมัติการจองรถ?",
      message: "เมื่ออนุมัติแล้ว ผู้จองจะได้รับใบจองเพื่อยืนยันสิทธิ์การใช้รถ",
      detail: (
        <div>
          <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:4}}>
            <b>{u?.name}</b><span className="text-xs muted">· {u?.dept}</span>
          </div>
          <div>🚗 {v?.brand} <span style={{fontFamily:'var(--font-mono)'}}>({v?.plate.split(' ').slice(0,2).join(' ')})</span></div>
          <div>📅 {window.fmtDateTime(b?.from)} – {window.fmtTime(b?.to)}</div>
          <div>📍 {b?.destination}</div>
        </div>
      ),
      confirmLabel: "อนุมัติการจอง",
      onConfirm: () => {
        setBookings(bookings.map((x) => x.id === bookingId ? { ...x, status: "approved", approvedBy: currentUser.name } : x));
        pushToast({ kind: "ok", title: "อนุมัติการจองแล้ว", body: bookingId });
      },
    });
  }
  function handleReject(bookingId) {
    const b = bookings.find((x) => x.id === bookingId);
    const u = users.find((x) => x.id === b?.userId);
    setConfirm({
      kind: "negative",
      title: "ไม่อนุมัติการจอง?",
      message: "ระบบจะแจ้งผู้จองพร้อมเหตุผลที่ระบุ",
      detail: <div><b>{u?.name}</b> · {b?.id}</div>,
      requireReason: true,
      reasonLabel: "เหตุผลที่ไม่อนุมัติ",
      reasonPlaceholder: "เช่น รถถูกจองในช่วงเวลาดังกล่าวแล้ว / ระยะเวลาเกินขอบเขตการใช้งาน",
      confirmLabel: "ยืนยันปฏิเสธ",
      onConfirm: ({ reason }) => {
        setBookings(bookings.map((x) => x.id === bookingId ? { ...x, status: "rejected", approvedBy: currentUser.name, rejectReason: reason } : x));
        pushToast({ kind: "warn", title: "ปฏิเสธการจองแล้ว", body: bookingId });
      },
    });
  }
  function handleApproveUser(userId) {
    const u = users.find((x) => x.id === userId);
    setConfirm({
      kind: "positive",
      title: "อนุมัติสมาชิกใหม่?",
      message: "ผู้ใช้รายนี้จะสามารถเข้าสู่ระบบและใช้งานได้ทันที",
      detail: (
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div className="avatar lg">{u?.name.charAt(0)}</div>
          <div>
            <b>{u?.name}</b>
            <div className="text-xs muted">{u?.dept} · รหัส {u?.emp}</div>
            <div className="text-xs muted">{u?.email}</div>
          </div>
        </div>
      ),
      confirmLabel: "อนุมัติสมาชิก",
      onConfirm: () => {
        setUsers(users.map((x) => x.id === userId ? { ...x, status: "approved" } : x));
        pushToast({ kind: "ok", title: "อนุมัติสมาชิกใหม่แล้ว", body: u?.name });
      },
    });
  }
  function handleRejectUser(userId) {
    const u = users.find((x) => x.id === userId);
    setConfirm({
      kind: "negative",
      title: "ปฏิเสธการสมัครสมาชิก?",
      message: "บัญชีจะถูกลบออกจากระบบและไม่สามารถเข้าใช้งานได้",
      detail: <div><b>{u?.name}</b> · {u?.dept}</div>,
      requireReason: true,
      reasonLabel: "เหตุผล",
      reasonPlaceholder: "เช่น ไม่ใช่บุคลากรของหน่วยงาน / ข้อมูลไม่ครบถ้วน",
      confirmLabel: "ยืนยันปฏิเสธ",
      onConfirm: ({ reason }) => {
        setUsers(users.filter((x) => x.id !== userId));
        pushToast({ kind: "warn", title: "ปฏิเสธการสมัครแล้ว", body: u?.name });
      },
    });
  }
  function handleChangeRole(userId, role) {
    setUsers(users.map((u) => u.id === userId ? { ...u, role } : u));
    pushToast({ kind: "ok", title: "เปลี่ยนบทบาทแล้ว" });
  }
  function handleUpdateUser(userId, data) {
    setUsers(users.map((u) => u.id === userId ? { ...u, ...data } : u));
    pushToast({ kind: "ok", title: "บันทึกข้อมูลสมาชิกแล้ว", body: data.name });
  }
  function handleAddVehicle(data) {
    const id = "V" + (vehicles.length + 1).toString().padStart(3, "0");
    setVehicles([...vehicles, { ...data, id, image: "🚗" }]);
    addHistory({
      vehicleId: id, action: "create", field: "เพิ่มรถยนต์",
      oldValue: "", newValue: `${data.brand} · ${data.plate}`,
      note: "เพิ่มรถใหม่เข้าระบบ", photo: false,
    });
    pushToast({ kind: "ok", title: "เพิ่มรถยนต์ใหม่แล้ว", body: data.plate });
  }
  function handleUpdateVehicle(id, data) {
    const old = vehicles.find((v) => v.id === id);
    if (!old) return;
    // Detect specific field changes to log
    const changes = [];
    const fieldMap = {
      mileage: "เลขไมล์",
      status: "สถานะ",
      plate: "ทะเบียน",
      brand: "ยี่ห้อ/รุ่น",
      taxDue: "วันครบกำหนดต่อภาษี",
      insuranceDue: "วันครบกำหนด พ.ร.บ.",
      nextService: "วันครบกำหนดเช็คระยะถัดไป",
      lastService: "วันบำรุงรักษาล่าสุด",
      owner: "ผู้รับผิดชอบ",
    };
    Object.keys(fieldMap).forEach((k) => {
      if (data[k] != null && data[k] !== old[k]) {
        let oldV = old[k]; let newV = data[k];
        if (k === "mileage") { oldV = window.fmtNum(oldV) + " กม."; newV = window.fmtNum(newV) + " กม."; }
        if (k === "status") { oldV = window.STATUS_LABEL[oldV] || oldV; newV = window.STATUS_LABEL[newV] || newV; }
        changes.push({ field: fieldMap[k], oldValue: oldV, newValue: newV });
      }
    });
    setVehicles(vehicles.map((v) => v.id === id ? { ...v, ...data } : v));
    changes.forEach((c) => {
      addHistory({
        vehicleId: id, action: c.field.includes("สถานะ") ? "status" : "update",
        field: c.field, oldValue: c.oldValue, newValue: c.newValue,
        note: data._editNote || "", photo: data._photo || false,
      });
    });
    pushToast({ kind: "ok", title: "อัพเดทข้อมูลรถแล้ว", body: data.plate });
  }
  function addHistory(entry) {
    const id = "H" + Date.now().toString().slice(-6);
    setVehicleHistory((s) => [{
      id, at: new Date().toISOString().slice(0, 16), actor: currentUser?.name || "ระบบ",
      ...entry,
    }, ...s]);
  }
  function handleCheckIn(bookingId, data) {
    setBookings(bookings.map((b) => b.id === bookingId ? { ...b, mileageOut: data.mileageOut } : b));
    if (data.mileageCorrection) {
      const booking = bookings.find((b) => b.id === bookingId);
      const id = "MC" + Date.now().toString().slice(-6);
      setMileageCorrections((s) => [{
        id, bookingId, vehicleId: booking.vehicleId, userId: currentUser.id,
        requestedAt: new Date().toISOString().slice(0, 16),
        ...data.mileageCorrection,
      }, ...s]);
      pushToast({ kind: "warn", title: "ส่งคำขอแก้ไขเลขไมล์แล้ว", body: `เลขที่ ${id} · รอแอดมินอนุมัติ` });
    } else {
      pushToast({ kind: "ok", title: "Check-out สำเร็จ", body: "บันทึกเลขไมล์ก่อนใช้งานแล้ว" });
    }
  }
  function handleApproveMileageCorrection(correctionId) {
    const c = mileageCorrections.find((x) => x.id === correctionId);
    if (!c) return;
    const v = vehicles.find((x) => x.id === c.vehicleId);
    const u = users.find((x) => x.id === c.userId);
    setConfirm({
      kind: "positive",
      title: "อนุมัติแก้ไขเลขไมล์?",
      message: "ระบบจะปรับเลขไมล์ของรถให้ตรงกับที่ผู้ใช้ระบุ การกระทำนี้ไม่สามารถย้อนกลับได้",
      detail: (
        <div>
          <div style={{display:'flex', gap:6, alignItems:'center', marginBottom:4}}>
            <b>{v?.brand}</b> <span style={{fontFamily:'var(--font-mono)', fontSize:11.5, background:'var(--text)', color:'white', padding:'1px 6px', borderRadius:3}}>{v?.plate.split(' ').slice(0,2).join(' ')}</span>
          </div>
          <div>โดย {u?.name} · {u?.dept}</div>
          <div style={{marginTop:6, padding:'8px 10px', background:'white', borderRadius:6, border:'1px solid var(--border)', fontFamily:'var(--font-mono)'}}>
            <span style={{color:'var(--text-3)'}}>{window.fmtNum(c.systemMileage)}</span>
            <span style={{margin:'0 8px', color:'var(--ok)'}}>→</span>
            <b style={{color:'var(--ok)'}}>{window.fmtNum(c.claimedMileage)} กม.</b>
            <span style={{marginLeft:8, color:'var(--info)', fontWeight:600}}>({c.diff > 0 ? '+' : ''}{window.fmtNum(c.diff)})</span>
          </div>
        </div>
      ),
      requireAck: true,
      ackLabel: "ข้าพเจ้าได้ตรวจสอบรูปหน้าปัดและเหตุผลที่ผู้ใช้แจ้งเรียบร้อยแล้ว",
      confirmLabel: "อนุมัติและปรับข้อมูล",
      onConfirm: () => {
        setVehicles(vehicles.map((v) => v.id === c.vehicleId ? { ...v, mileage: c.claimedMileage } : v));
        setMileageCorrections(mileageCorrections.map((x) => x.id === correctionId ? { ...x, status: "approved", approvedBy: currentUser.name, approvedAt: new Date().toISOString().slice(0, 16) } : x));
        pushToast({ kind: "ok", title: "อนุมัติแก้ไขเลขไมล์", body: `ปรับเลขไมล์รถเป็น ${c.claimedMileage.toLocaleString()} กม.` });
      },
    });
  }
  function handleRejectMileageCorrection(correctionId) {
    const c = mileageCorrections.find((x) => x.id === correctionId);
    setConfirm({
      kind: "negative",
      title: "ไม่อนุมัติคำขอแก้ไขเลขไมล์?",
      message: "ระบบจะเก็บเลขไมล์เดิมไว้ และส่งเหตุผลกลับให้ผู้ขอ",
      detail: <div>คำขอ <b>{c?.id}</b> · ส่วนต่าง {c?.diff > 0 ? '+' : ''}{window.fmtNum(c?.diff)} กม.</div>,
      requireReason: true,
      reasonLabel: "เหตุผลที่ไม่อนุมัติ",
      reasonPlaceholder: "เช่น รูปไม่ชัด / เลขไมล์ที่ระบุไม่สมเหตุสมผล",
      onConfirm: ({ reason }) => {
        setMileageCorrections(mileageCorrections.map((x) => x.id === correctionId ? { ...x, status: "rejected", approvedBy: currentUser.name, rejectReason: reason } : x));
        pushToast({ kind: "warn", title: "ปฏิเสธคำขอแก้ไขเลขไมล์" });
      },
    });
  }
  function handleCheckOut(bookingId, data) {
    setBookings(bookings.map((b) => b.id === bookingId ? { ...b, mileageIn: data.mileageIn, rating: data.rating, status: "completed" } : b));
    pushToast({ kind: "ok", title: "Check-in สำเร็จ", body: `ระยะทาง ${data.distance} กม.` });
  }

  // Route guard — must run unconditionally (Rules of Hooks)
  React.useEffect(() => {
    if (!currentUser) return;
    const allowedKeys = ["dashboard", "booking", "calendar", "my", "checkin", "settings",
      ...(currentUser.role === "manager" ? ["approvals", "reports"] : []),
      ...(currentUser.role === "admin" ? ["approvals", "members", "vehicles", "reports"] : [])
    ];
    if (!allowedKeys.includes(route)) setRoute("dashboard");
  }, [currentUser, route]);

  if (!currentUser) {
    return <window.AuthScreen registered={registered} onLogin={handleLogin} onRegister={handleRegister}/>;
  }

  const counts = {
    approvals: bookings.filter((b) => b.status === "booked").length +
               (currentUser.role === "admin" ? mileageCorrections.filter((c) => c.status === "pending").length : 0),
    members: users.filter((u) => u.status === "pending").length,
  };

  const titles = {
    dashboard: { t: "แดชบอร์ด", s: "ภาพรวมสถานะรถยนต์เรียลไทม์" },
    booking: { t: "จองรถใช้งาน", s: "สร้างคำขอจองรถใหม่" },
    calendar: { t: "ปฏิทินการจอง", s: "ภาพรวมการใช้รถทั้งหน่วยงาน" },
    my: { t: "การจองของฉัน", s: "ประวัติการจองทั้งหมด" },
    checkin: { t: "Check-in / Check-out", s: "บันทึกการรับ-ส่งรถยนต์" },
    approvals: { t: "อนุมัติการจองรถ", s: "ตรวจสอบและอนุมัติคำขอ" },
    members: { t: "จัดการสมาชิก", s: "อนุมัติและกำหนดบทบาทผู้ใช้" },
    vehicles: { t: "จัดการรถยนต์", s: "เพิ่ม แก้ไข และตั้งสถานะรถ" },
    reports: { t: "รายงานและสถิติ", s: "วิเคราะห์การใช้งานรถยนต์" },
    settings: { t: "ตั้งค่าและเชื่อมต่อ", s: "Calendar Sync, การแจ้งเตือน, บัญชี" },
  };
  const title = titles[route] || titles.dashboard;

  // Generate notifications based on current state, mark read state from set
  const baseNotifications = window.generateNotifications(currentUser, bookings, users, vehicles, mileageCorrections);
  const notifications = baseNotifications.map((n) => ({ ...n, read: n.read || readNotifications.has(n.id) }));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="app">
      <window.Sidebar route={route} setRoute={setRoute} user={currentUser} counts={counts} onLogout={handleLogout} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}/>
      <window.Topbar title={title.t} subtitle={null}
        onMenuClick={() => setDrawerOpen(true)}
        onBellClick={() => setNotiOpen(!notiOpen)}
        unreadCount={unreadCount}
      />
      <main className="main">
        {route === "dashboard" && (
          <window.Dashboard
            user={currentUser} vehicles={vehicles} bookings={bookings} users={users}
            setRoute={setRoute}
            onSelectVehicle={(v) => setSelectedVehicle(v)}
          />
        )}
        {route === "booking" && (
          <window.BookingScreen
            user={currentUser} vehicles={vehicles} bookings={bookings}
            prefillVehicle={selectedVehicle}
            onSubmit={handleSubmitBooking}
            onCancel={() => setRoute("dashboard")}
          />
        )}
        {route === "calendar" && (
          <window.CalendarScreen
            vehicles={vehicles} bookings={bookings} users={users}
            onSelectBooking={(b) => setSelectedBooking(b)}
          />
        )}
        {route === "my" && (
          <window.MyBookingsScreen
            bookings={bookings} vehicles={vehicles} users={users}
            currentUser={currentUser}
            onSelectBooking={(b) => setSelectedBooking(b)}
            onPrintVoucher={(b) => setVoucherBooking(b)}
            setRoute={setRoute}
          />
        )}
        {route === "checkin" && (
          <window.CheckinScreen
            bookings={bookings} vehicles={vehicles} users={users}
            currentUser={currentUser}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onPrintChecklist={(b) => setVoucherBooking(b)}
          />
        )}
        {route === "approvals" && (
          <window.ApprovalsScreen
            bookings={bookings} vehicles={vehicles} users={users}
            mileageCorrections={mileageCorrections}
            user={currentUser}
            onApprove={handleApprove}
            onReject={handleReject}
            onApproveMileage={handleApproveMileageCorrection}
            onRejectMileage={handleRejectMileageCorrection}
            onSelectBooking={(b) => setSelectedBooking(b)}
            onPrintVoucher={(b) => setVoucherBooking(b)}
          />
        )}
        {route === "members" && (
          <window.MembersScreen
            users={users} user={currentUser}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onChangeRole={handleChangeRole}
            onUpdateUser={handleUpdateUser}
          />
        )}
        {route === "vehicles" && (
          <window.VehiclesScreen
            vehicles={vehicles} bookings={bookings} vehicleHistory={vehicleHistory}
            users={users}
            user={currentUser}
            onUpdateVehicle={handleUpdateVehicle}
            onAddVehicle={handleAddVehicle}
          />
        )}
        {route === "reports" && (
          <window.ReportsScreen vehicles={vehicles} bookings={bookings} users={users}/>
        )}
        {route === "settings" && (
          <window.SettingsScreen currentUser={currentUser} bookings={bookings} vehicles={vehicles}/>
        )}
      </main>

      {/* Modals */}
      {selectedVehicle && (
        <VehicleQuickModal
          vehicle={selectedVehicle}
          bookings={bookings} users={users}
          onClose={() => setSelectedVehicle(null)}
          onBook={() => { setSelectedVehicle(null); setRoute("booking"); }}
        />
      )}
      {selectedBooking && (
        <window.BookingDetailModal
          booking={selectedBooking}
          vehicle={vehicles.find((v) => v.id === selectedBooking.vehicleId)}
          user={users.find((u) => u.id === selectedBooking.userId)}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      {voucherBooking && (
        <window.BookingVoucher
          booking={voucherBooking}
          vehicle={vehicles.find((v) => v.id === voucherBooking.vehicleId)}
          user={users.find((u) => u.id === voucherBooking.userId)}
          onClose={() => setVoucherBooking(null)}
        />
      )}

      <window.ToastStack toasts={toasts}/>
      <window.ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)}/>
      <window.NotificationCenter
        open={notiOpen}
        notifications={notifications}
        onClose={() => setNotiOpen(false)}
        onMarkRead={(id) => setReadNotifications(new Set([...readNotifications, id]))}
        onMarkAllRead={() => setReadNotifications(new Set(notifications.map((n) => n.id)))}
        onNavigate={(r) => setRoute(r)}
      />

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="บทบาทผู้ใช้งาน (ทดลองสลับ)"/>
        <TweakRadio label="บทบาท" value={currentUser.role}
          options={["user","manager","admin"]}
          onChange={(v) => {
            const u = users.find((u) => u.role === v && u.status === "approved");
            if (u) setCurrentUser(u);
          }}/>

        <TweakSection label="ธีมสี"/>
        <TweakColor label="พาเลตต์"
          value={t.theme === "blue" ? ["#1d4ed8","#f59e0b"] : t.theme === "teal" ? ["#0d9488","#f59e0b"] : ["#6E2A8C","#F37021"]}
          options={[
            ["#6E2A8C","#F37021"],
            ["#1d4ed8","#f59e0b"],
            ["#0d9488","#f59e0b"],
          ]}
          onChange={(v) => {
            const themes = { "#6E2A8C": "purple-orange", "#1d4ed8": "blue", "#0d9488": "teal" };
            setTweak("theme", themes[v[0]] || "purple-orange");
          }}/>

        <TweakSection label="แดชบอร์ด"/>
        <TweakRadio label="Layout" value={t.dashboardLayout}
          options={["timeline","grid"]}
          onChange={(v) => setTweak("dashboardLayout", v)}/>

        <TweakSection label="ทางลัด"/>
        <TweakButton label="กลับสู่หน้าเข้าสู่ระบบ" onClick={handleLogout}/>
      </TweaksPanel>
    </div>
  );
}

// Quick vehicle detail modal from dashboard
function VehicleQuickModal({ vehicle, bookings, users, onClose, onBook }) {
  const v = vehicle;
  const vBookings = bookings.filter((b) => b.vehicleId === v.id && (b.status === "approved" || b.status === "urgent" || b.status === "booked"));
  return (
    <window.Modal title={`รถยนต์ ${v.id}`} onClose={onClose} width={560} footer={
      <>
        <button className="btn" onClick={onClose}>ปิด</button>
        <button className="btn accent" onClick={onBook}>
          {window.I.plus} จองรถคันนี้
        </button>
      </>
    }>
      <div style={{display:'flex', gap:14, padding:16, background:'linear-gradient(135deg, var(--pea-purple-50), var(--pea-orange-50))', borderRadius:10, marginBottom:14}}>
        <window.VehicleIcon type={v.type} size={64}/>
        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span className="plate">{v.plate}</span>
            <window.StatusPill status={v.status}/>
          </div>
          <div style={{fontSize:18, fontWeight:700, marginTop:4}}>{v.brand}</div>
          <div className="text-xs muted">{window.VEHICLE_TYPES[v.type]?.label} · ปี {v.year}</div>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
        <Mini lbl="เลขไมล์" val={`${window.fmtNum(v.mileage)} กม.`}/>
        <Mini lbl="ที่นั่ง" val={`${v.seats} คน`}/>
        <Mini lbl="เชื้อเพลิง" val={window.FUEL_TYPES[v.fuel]}/>
        <Mini lbl="ผู้รับผิดชอบ" val={v.owner}/>
        <Mini lbl="ต่อภาษีถัดไป" val={window.fmtDate(v.taxDue)}/>
        <Mini lbl="เช็คระยะถัดไป" val={window.fmtDate(v.nextService)}/>
      </div>
      {vBookings.length > 0 && (
        <>
          <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8}}>การจองที่กำลังจะมาถึง</div>
          <div className="col gap-2">
            {vBookings.slice(0, 3).map((b) => {
              const u = users.find((x) => x.id === b.userId);
              return (
                <div key={b.id} style={{padding:'10px 12px', background:'var(--surface-2)', borderRadius:8, fontSize:12.5}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <window.StatusPill status={b.status}/>
                    <span style={{marginLeft:'auto', color:'var(--text-3)', fontSize:11.5}}>{window.fmtDateTime(b.from)} – {window.fmtTime(b.to)}</span>
                  </div>
                  <div style={{marginTop:4, fontWeight:500}}>{u?.name} · {b.purpose}</div>
                  <div className="text-xs muted">{b.destination}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </window.Modal>
  );
}
function Mini({ lbl, val }) {
  return (
    <div style={{background:'var(--surface-2)', borderRadius:8, padding:'9px 12px'}}>
      <div style={{fontSize:11, color:'var(--text-3)'}}>{lbl}</div>
      <div style={{fontWeight:600, fontSize:13}}>{val}</div>
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
