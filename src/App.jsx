import React from 'react'
import { AuthScreen } from './screens/AuthScreen'
import { Dashboard } from './screens/Dashboard'
import { BookingScreen } from './screens/BookingScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { MyBookingsScreen, ReportsScreen } from './screens/ReportsScreen'
import { CheckinScreen } from './screens/CheckinScreen'
import { CheckinHistoryScreen } from './screens/CheckinHistoryScreen'
import { ApprovalsScreen, MembersScreen } from './screens/AdminScreen'
import { VehiclesScreen } from './screens/VehiclesScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ManualScreen } from './screens/ManualScreen'
import { BookingVoucher, BookingDetailModal } from './screens/VoucherScreen'
import { NotificationCenter, generateNotifications } from './screens/NotificationsScreen'
import { I, VehicleIcon, StatusPill, STATUS_LABEL, Sidebar, Topbar, Modal, ConfirmDialog, ToastStack, CommandMenu, fmtDate, fmtDateTime, fmtTime, fmtNum } from './components'
import { VEHICLE_TYPES, FUEL_TYPES } from './data'
import { useTweaks } from './TweaksPanel'
import { DevCardButton } from './DevCard'
import { supabase, isConfigured } from './supabase'

const TWEAK_DEFAULTS = { theme: "purple-orange", density: "regular", dashboardLayout: "timeline" };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [isDark, setIsDark] = React.useState(() => localStorage.getItem('pea-dark') === '1');
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    document.documentElement.dataset.dark = (isDark && currentUser) ? '1' : '';
    localStorage.setItem('pea-dark', isDark ? '1' : '0');
  }, [isDark, currentUser]);

  const [appReady, setAppReady] = React.useState(false);
  const [loaderFading, setLoaderFading] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  const [vehicles, setVehicles] = React.useState([]);
  const [bookings, setBookings] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [vehicleHistory, setVehicleHistory] = React.useState([]);
  const [mileageCorrections, setMileageCorrections] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);

  const [route, setRoute] = React.useState("dashboard");
  const [selectedVehicle, setSelectedVehicle] = React.useState(null);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [voucherBooking, setVoucherBooking] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [confirm, setConfirm] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [notiOpen, setNotiOpen] = React.useState(false);
  const [readNotifications, setReadNotifications] = React.useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => localStorage.getItem('pea-sidebar-collapsed') === '1');
  const [cmdOpen, setCmdOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (currentUser) setCmdOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentUser]);

  // ── Init: restore session on page refresh ──
  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) await initUser(session.user.id);
      setLoaderFading(true);
      setTimeout(() => setAppReady(true), 420);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setVehicles([]); setBookings([]); setUsers([]);
        setVehicleHistory([]); setMileageCorrections([]); setDepartments([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Realtime subscriptions — reload data on any change
  React.useEffect(() => {
    if (!currentUser) return;
    const channel = supabase.channel('pea-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, loadAllData)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentUser?.id]);

  async function initUser(userId) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile?.status === 'approved') {
      setCurrentUser(profile);
      await loadAllData();
    }
  }

  async function loadAllData() {
    const [v, b, u, vh, mc, depts] = await Promise.all([
      supabase.from('vehicles').select('*').order('id'),
      supabase.from('bookings').select('*').order('"createdAt"', { ascending: false }),
      supabase.from('profiles').select('*').neq('status', 'rejected'),
      supabase.from('vehicle_history').select('*').order('at', { ascending: false }),
      supabase.from('mileage_corrections').select('*').order('"requestedAt"', { ascending: false }),
      supabase.from('departments').select('*').order('sort_order'),
    ]);
    if (v.error)    console.error('[vehicles]', v.error.message, v.error.hint || '');
    if (b.error)    console.error('[bookings]', b.error.message);
    if (u.error)    console.error('[profiles]', u.error.message);
    if (depts.error) console.error('[departments]', depts.error.message);
    setVehicles((v.data || []).map(veh => ({ ...veh, plate: veh.plate || '', brand: veh.brand || '', id: veh.id || '' })));
    setBookings(b.data || []);
    setUsers((u.data || []).map(usr => ({ ...usr, name: usr.name || '-' })));
    setVehicleHistory(vh.data || []);
    setMileageCorrections(mc.data || []);
    setDepartments(depts.data || []);

    if (v.error?.code === '42501' || b.error?.code === '42501') {
      pushToast({ kind: 'warn', title: 'สิทธิ์การเข้าถึงฐานข้อมูล', body: 'ตรวจสอบ RLS Policy ใน Supabase Dashboard' });
    }
  }

  // ── Theme ──
  React.useEffect(() => {
    const root = document.documentElement;
    if (t.theme === "blue") {
      root.style.setProperty('--pea-purple', '#1d4ed8'); root.style.setProperty('--pea-purple-deep', '#1e3a8a');
      root.style.setProperty('--pea-purple-50', '#eff6ff'); root.style.setProperty('--pea-purple-100', '#dbeafe');
      root.style.setProperty('--pea-orange', '#f59e0b'); root.style.setProperty('--pea-orange-light', '#fbbf24');
    } else if (t.theme === "teal") {
      root.style.setProperty('--pea-purple', '#0d9488'); root.style.setProperty('--pea-purple-deep', '#115e59');
      root.style.setProperty('--pea-purple-50', '#f0fdfa'); root.style.setProperty('--pea-purple-100', '#ccfbf1');
      root.style.setProperty('--pea-orange', '#f59e0b'); root.style.setProperty('--pea-orange-light', '#fbbf24');
    } else {
      root.style.setProperty('--pea-purple', '#6E2A8C'); root.style.setProperty('--pea-purple-deep', '#4D1F66');
      root.style.setProperty('--pea-purple-50', '#F5EEF8'); root.style.setProperty('--pea-purple-100', '#E9DBF0');
      root.style.setProperty('--pea-orange', '#F37021'); root.style.setProperty('--pea-orange-light', '#FAA61A');
    }
  }, [t.theme]);

  function pushToast(toast) {
    const id = Math.random().toString(36).slice(2);
    setToasts((s) => [...s, { ...toast, id }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3500);
  }

  // ── Handle QR scan deep link ──
  React.useEffect(() => {
    if (!currentUser || bookings.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking');
    if (!bookingId) return;
    const b = bookings.find((x) => x.id === bookingId);
    if (b) {
      setVoucherBooking(b);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [currentUser, bookings.length]);

  // ── Auth handlers ──
  async function handleLogin(profile) {
    setCurrentUser(profile);
    await loadAllData();
    setRoute("dashboard");
  }
  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setRoute("dashboard");
  }
  function confirmLogout() {
    setConfirm({
      kind: "warn",
      title: "ออกจากระบบ?",
      message: `${currentUser?.name} — ต้องการออกจากระบบใช่ไหม?`,
      confirmLabel: "ออกจากระบบ",
      onConfirm: handleLogout,
    });
  }
  function handleRegister() { setRegistered(true); }

  // ── Auto-logout on idle ──
  const IDLE_MS = 30 * 60 * 1000;   // 30 minutes
  const WARN_MS = 2 * 60 * 1000;    // warn 2 minutes before
  const [idleWarning, setIdleWarning] = React.useState(false);
  const [idleCountdown, setIdleCountdown] = React.useState(120);
  const idleWarnTimer = React.useRef(null);
  const idleOutTimer = React.useRef(null);
  const countdownInterval = React.useRef(null);

  React.useEffect(() => {
    if (!currentUser) return;

    function resetIdle() {
      clearTimeout(idleWarnTimer.current);
      clearTimeout(idleOutTimer.current);
      clearInterval(countdownInterval.current);
      setIdleWarning(false);

      idleWarnTimer.current = setTimeout(() => {
        setIdleWarning(true);
        setIdleCountdown(WARN_MS / 1000);
        countdownInterval.current = setInterval(() => {
          setIdleCountdown((c) => {
            if (c <= 1) { clearInterval(countdownInterval.current); return 0; }
            return c - 1;
          });
        }, 1000);
      }, IDLE_MS - WARN_MS);

      idleOutTimer.current = setTimeout(() => {
        handleLogout();
      }, IDLE_MS);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => document.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetIdle));
      clearTimeout(idleWarnTimer.current);
      clearTimeout(idleOutTimer.current);
      clearInterval(countdownInterval.current);
    };
  }, [currentUser]);

  // ── Booking handlers ──
  async function handleSubmitBooking(form) {
    const id = `BK${new Date().toISOString().slice(0,10).replace(/-/g,'').slice(2)}-${(bookings.length+1).toString().padStart(3,"0")}`;
    const newBooking = {
      id, vehicleId: form.vehicleId, userId: currentUser.id,
      purpose: form.purpose, purposeNote: form.purposeNote,
      from: form.from, to: form.to,
      destination: form.destination, coords: form.coords,
      status: "booked", approvedBy: null,
      createdAt: new Date().toISOString().slice(0, 16),
      mileageOut: null, mileageIn: null, passengers: form.passengers,
    };
    try {
      const { error } = await supabase.from('bookings').insert(newBooking);
      if (!error) {
        setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
        setRoute("my");
        setTimeout(() => pushToast({ kind: "ok", title: "ส่งคำขอจองเรียบร้อย ✓", body: "รออนุมัติจากผู้จัดการ — เลขที่ " + id }), 100);
      } else {
        pushToast({ kind: "warn", title: "เกิดข้อผิดพลาด", body: error.message || "ไม่สามารถส่งคำขอจองได้" });
      }
    } catch (err) {
      pushToast({ kind: "warn", title: "เกิดข้อผิดพลาด", body: err?.message || "ไม่สามารถเชื่อมต่อฐานข้อมูล" });
    }
  }

  async function handleApprove(bookingId) {
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
          <div>📅 {fmtDateTime(b?.from)} – {fmtTime(b?.to)}</div>
          <div>📍 {b?.destination}</div>
        </div>
      ),
      confirmLabel: "อนุมัติการจอง",
      onConfirm: async () => {
        const { error } = await supabase.from('bookings')
          .update({ status: "approved", approvedBy: currentUser.name }).eq('id', bookingId);
        if (!error) {
          setBookings(bookings.map((x) => x.id === bookingId ? { ...x, status: "approved", approvedBy: currentUser.name } : x));
          pushToast({ kind: "ok", title: "อนุมัติการจองแล้ว", body: bookingId });
        }
      },
    });
  }

  async function handleReject(bookingId) {
    const b = bookings.find((x) => x.id === bookingId);
    const u = users.find((x) => x.id === b?.userId);
    setConfirm({
      kind: "negative", title: "ไม่อนุมัติการจอง?",
      message: "ระบบจะแจ้งผู้จองพร้อมเหตุผลที่ระบุ",
      detail: <div><b>{u?.name}</b> · {b?.id}</div>,
      requireReason: true, reasonLabel: "เหตุผลที่ไม่อนุมัติ",
      reasonPlaceholder: "เช่น รถถูกจองในช่วงเวลาดังกล่าวแล้ว",
      confirmLabel: "ยืนยันปฏิเสธ",
      onConfirm: async ({ reason }) => {
        const { error } = await supabase.from('bookings')
          .update({ status: "rejected", approvedBy: currentUser.name, rejectReason: reason }).eq('id', bookingId);
        if (!error) {
          setBookings(bookings.map((x) => x.id === bookingId ? { ...x, status: "rejected", approvedBy: currentUser.name, rejectReason: reason } : x));
          pushToast({ kind: "warn", title: "ปฏิเสธการจองแล้ว", body: bookingId });
        }
      },
    });
  }

  // ── User management ──
  async function handleApproveUser(userId) {
    const u = users.find((x) => x.id === userId);
    setConfirm({
      kind: "positive", title: "อนุมัติสมาชิกใหม่?",
      message: "ผู้ใช้รายนี้จะสามารถเข้าสู่ระบบและใช้งานได้ทันที",
      detail: (
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div className="avatar lg">{u?.name.charAt(0)}</div>
          <div><b>{u?.name}</b>
            <div className="text-xs muted">{u?.dept} · รหัส {u?.emp}</div>
            <div className="text-xs muted">{u?.email}</div>
          </div>
        </div>
      ),
      confirmLabel: "อนุมัติสมาชิก",
      onConfirm: async () => {
        const { error } = await supabase.from('profiles').update({ status: "approved" }).eq('id', userId);
        if (!error) {
          setUsers(users.map((x) => x.id === userId ? { ...x, status: "approved" } : x));
          pushToast({ kind: "ok", title: "อนุมัติสมาชิกใหม่แล้ว", body: u?.name });
        }
      },
    });
  }

  async function handleRejectUser(userId) {
    const u = users.find((x) => x.id === userId);
    setConfirm({
      kind: "negative", title: "ปฏิเสธการสมัครสมาชิก?",
      message: "บัญชีจะถูกยกเลิกและไม่สามารถเข้าใช้งานได้",
      detail: <div><b>{u?.name}</b> · {u?.dept}</div>,
      requireReason: true, reasonLabel: "เหตุผล",
      reasonPlaceholder: "เช่น ไม่ใช่บุคลากรของหน่วยงาน",
      confirmLabel: "ยืนยันปฏิเสธ",
      onConfirm: async () => {
        await supabase.from('profiles').update({ status: "rejected" }).eq('id', userId);
        setUsers(users.filter((x) => x.id !== userId));
        pushToast({ kind: "warn", title: "ปฏิเสธการสมัครแล้ว", body: u?.name });
      },
    });
  }

  async function handleChangeRole(userId, role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (!error) {
      setUsers(users.map((u) => u.id === userId ? { ...u, role } : u));
      pushToast({ kind: "ok", title: "เปลี่ยนบทบาทแล้ว" });
    }
  }

  async function handleUpdateUser(userId, data) {
    const { error } = await supabase.from('profiles').update(data).eq('id', userId);
    if (!error) {
      setUsers(users.map((u) => u.id === userId ? { ...u, ...data } : u));
      pushToast({ kind: "ok", title: "บันทึกข้อมูลสมาชิกแล้ว", body: data.name });
    }
  }

  // ── Vehicle management ──
  async function handleAddVehicle(data) {
    const id = "V" + (vehicles.length + 1).toString().padStart(3, "0");
    const { _editNote, _photo, documents, ...vehicleData } = data;
    const newVehicle = { ...vehicleData, id, image: "🚗" };
    const { error } = await supabase.from('vehicles').insert(newVehicle);
    if (!error) {
      setVehicles([...vehicles, newVehicle]);
      await addHistory({ vehicleId: id, action: "create", field: "เพิ่มรถยนต์", oldValue: "", newValue: `${data.brand} · ${data.plate}`, note: "เพิ่มรถใหม่เข้าระบบ", photo: false });
      pushToast({ kind: "ok", title: "เพิ่มรถยนต์ใหม่แล้ว", body: data.plate });
    } else {
      console.error('[addVehicle]', error.message, error.hint || '');
      pushToast({ kind: "warn", title: "เพิ่มรถไม่สำเร็จ", body: error.message });
    }
  }

  async function handleUpdateVehicle(id, data) {
    const old = vehicles.find((v) => v.id === id);
    if (!old) return;
    const fieldMap = { mileage: "เลขไมล์", status: "สถานะ", plate: "ทะเบียน", brand: "ยี่ห้อ/รุ่น", taxDue: "วันครบกำหนดต่อภาษี", insuranceDue: "วันครบกำหนด พ.ร.บ.", nextService: "วันครบกำหนดเช็คระยะถัดไป", lastService: "วันบำรุงรักษาล่าสุด", owner: "ผู้รับผิดชอบ" };
    const changes = [];
    Object.keys(fieldMap).forEach((k) => {
      if (data[k] != null && data[k] !== old[k]) {
        let oldV = old[k], newV = data[k];
        if (k === "mileage") { oldV = fmtNum(oldV) + " กม."; newV = fmtNum(newV) + " กม."; }
        if (k === "status") { oldV = STATUS_LABEL[oldV] || oldV; newV = STATUS_LABEL[newV] || newV; }
        changes.push({ field: fieldMap[k], oldValue: oldV, newValue: newV });
      }
    });
    const { _editNote, _photo, documents, ...vehicleData } = data;
    const { error } = await supabase.from('vehicles').update(vehicleData).eq('id', id);
    if (!error) {
      setVehicles(vehicles.map((v) => v.id === id ? { ...v, ...vehicleData } : v));
      for (const c of changes) {
        await addHistory({ vehicleId: id, action: c.field.includes("สถานะ") ? "status" : "update", field: c.field, oldValue: c.oldValue, newValue: c.newValue, note: data._editNote || "", photo: data._photo || false });
      }
      pushToast({ kind: "ok", title: "อัพเดทข้อมูลรถแล้ว", body: data.plate });
    }
  }

  async function addHistory(entry) {
    const id = "H" + Date.now().toString().slice(-6);
    const newEntry = { id, at: new Date().toISOString().slice(0, 16), actor: currentUser?.name || "ระบบ", ...entry };
    await supabase.from('vehicle_history').insert(newEntry);
    setVehicleHistory((s) => [newEntry, ...s]);
  }

  // ── Check-in history admin edit ──
  async function handleUpdateCheckinRecord(bookingId, data) {
    const { error } = await supabase.from('bookings').update(data).eq('id', bookingId);
    if (!error) {
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, ...data } : b));
      pushToast({ kind: 'ok', title: 'แก้ไขข้อมูลเรียบร้อย', body: bookingId });
    } else {
      pushToast({ kind: 'warn', title: 'แก้ไขไม่สำเร็จ', body: error.message });
    }
  }

  // ── Check-in / Check-out ──
  async function handleCheckIn(bookingId, data) {
    const { error } = await supabase.from('bookings').update({
      mileageOut: data.mileageOut,
      checklist_data: data.checklist || null,
      photos_before: data.photos?.length ? data.photos : null,
      photos_mileage: data.mileageCorrection?.dashPhoto ? [data.mileageCorrection.dashPhoto] : null,
    }).eq('id', bookingId);
    if (!error) {
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, mileageOut: data.mileageOut } : b));
      if (data.mileageCorrection) {
        const booking = bookings.find((b) => b.id === bookingId);
        const id = "MC" + Date.now().toString().slice(-6);
        const mc = { id, bookingId, vehicleId: booking.vehicleId, userId: currentUser.id, requestedAt: new Date().toISOString().slice(0, 16), ...data.mileageCorrection };
        await supabase.from('mileage_corrections').insert(mc);
        setMileageCorrections((s) => [mc, ...s]);
        pushToast({ kind: "warn", title: "ส่งคำขอแก้ไขเลขไมล์แล้ว", body: `เลขที่ ${id} · รอแอดมินอนุมัติ` });
      } else {
        pushToast({ kind: "ok", title: "Check-out สำเร็จ ✓", body: "รับรถและบันทึกเลขไมล์แล้ว" });
      }
    } else {
      pushToast({ kind: "warn", title: "Check-out ไม่สำเร็จ", body: error.message });
    }
  }

  async function handleCheckOut(bookingId, data) {
    const booking = bookings.find((b) => b.id === bookingId);
    const { error } = await supabase.from('bookings').update({
      mileageIn: data.mileageIn,
      rating: data.rating,
      status: "completed",
      notes: data.notes || null,
      photos_after: data.photos?.length ? data.photos : null,
    }).eq('id', bookingId);
    if (!error) {
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, mileageIn: data.mileageIn, rating: data.rating, status: "completed" } : b));
      if (booking?.vehicleId && data.mileageIn) {
        await supabase.from('vehicles').update({ mileage: data.mileageIn }).eq('id', booking.vehicleId);
        setVehicles((prev) => prev.map((v) => v.id === booking.vehicleId ? { ...v, mileage: data.mileageIn } : v));
      }
      pushToast({ kind: "ok", title: "Check-in สำเร็จ ✓", body: `คืนรถแล้ว · ระยะทาง ${fmtNum(data.distance)} กม.` });
    } else {
      pushToast({ kind: "warn", title: "Check-in ไม่สำเร็จ", body: error.message });
    }
  }

  // ── Mileage corrections ──
  async function handleApproveMileageCorrection(correctionId) {
    const c = mileageCorrections.find((x) => x.id === correctionId);
    if (!c) return;
    const v = vehicles.find((x) => x.id === c.vehicleId);
    const u = users.find((x) => x.id === c.userId);
    setConfirm({
      kind: "positive", title: "อนุมัติแก้ไขเลขไมล์?",
      message: "ระบบจะปรับเลขไมล์ของรถให้ตรงกับที่ผู้ใช้ระบุ การกระทำนี้ไม่สามารถย้อนกลับได้",
      detail: (
        <div>
          <div style={{display:'flex', gap:6, alignItems:'center', marginBottom:4}}>
            <b>{v?.brand}</b> <span style={{fontFamily:'var(--font-mono)', fontSize:11.5, background:'var(--text)', color:'white', padding:'1px 6px', borderRadius:3}}>{v?.plate.split(' ').slice(0,2).join(' ')}</span>
          </div>
          <div>โดย {u?.name} · {u?.dept}</div>
          <div style={{marginTop:6, padding:'8px 10px', background:'white', borderRadius:6, border:'1px solid var(--border)', fontFamily:'var(--font-mono)'}}>
            <span style={{color:'var(--text-3)'}}>{fmtNum(c.systemMileage)}</span>
            <span style={{margin:'0 8px', color:'var(--ok)'}}>→</span>
            <b style={{color:'var(--ok)'}}>{fmtNum(c.claimedMileage)} กม.</b>
            <span style={{marginLeft:8, color:'var(--info)', fontWeight:600}}>({c.diff > 0 ? '+' : ''}{fmtNum(c.diff)})</span>
          </div>
        </div>
      ),
      requireAck: true,
      ackLabel: "ข้าพเจ้าได้ตรวจสอบรูปหน้าปัดและเหตุผลที่ผู้ใช้แจ้งเรียบร้อยแล้ว",
      confirmLabel: "อนุมัติและปรับข้อมูล",
      onConfirm: async () => {
        await supabase.from('vehicles').update({ mileage: c.claimedMileage }).eq('id', c.vehicleId);
        const approvedAt = new Date().toISOString().slice(0, 16);
        await supabase.from('mileage_corrections').update({ status: "approved", approvedBy: currentUser.name, approvedAt }).eq('id', correctionId);
        setVehicles(vehicles.map((v) => v.id === c.vehicleId ? { ...v, mileage: c.claimedMileage } : v));
        setMileageCorrections(mileageCorrections.map((x) => x.id === correctionId ? { ...x, status: "approved", approvedBy: currentUser.name, approvedAt } : x));
        pushToast({ kind: "ok", title: "อนุมัติแก้ไขเลขไมล์", body: `ปรับเลขไมล์รถเป็น ${c.claimedMileage.toLocaleString()} กม.` });
      },
    });
  }

  async function handleRejectMileageCorrection(correctionId) {
    const c = mileageCorrections.find((x) => x.id === correctionId);
    setConfirm({
      kind: "negative", title: "ไม่อนุมัติคำขอแก้ไขเลขไมล์?",
      message: "ระบบจะเก็บเลขไมล์เดิมไว้ และส่งเหตุผลกลับให้ผู้ขอ",
      detail: <div>คำขอ <b>{c?.id}</b> · ส่วนต่าง {c?.diff > 0 ? '+' : ''}{fmtNum(c?.diff)} กม.</div>,
      requireReason: true, reasonLabel: "เหตุผลที่ไม่อนุมัติ",
      reasonPlaceholder: "เช่น รูปไม่ชัด / เลขไมล์ที่ระบุไม่สมเหตุสมผล",
      onConfirm: async ({ reason }) => {
        await supabase.from('mileage_corrections').update({ status: "rejected", approvedBy: currentUser.name, rejectReason: reason }).eq('id', correctionId);
        setMileageCorrections(mileageCorrections.map((x) => x.id === correctionId ? { ...x, status: "rejected", approvedBy: currentUser.name, rejectReason: reason } : x));
        pushToast({ kind: "warn", title: "ปฏิเสธคำขอแก้ไขเลขไมล์" });
      },
    });
  }

  // ── Route guard ──
  React.useEffect(() => {
    if (!currentUser) return;
    const allowed = ["dashboard", "booking", "calendar", "my", "checkin", "checkin-history", "help",
      "settings", "settings-account", "settings-noti", "settings-calendar",
      ...(currentUser.role === "manager" ? ["approvals", "reports"] : []),
      ...(currentUser.role === "admin" ? ["approvals", "members", "vehicles", "reports", "settings-depts", "settings-manual", "settings-dev", "settings-about"] : [])
    ];
    if (!allowed.includes(route)) setRoute("dashboard");
  }, [currentUser, route]);

  // ── Loading screen ──
  if (!appReady) {
    return (
      <div className={`app-loader${loaderFading ? ' out' : ''}`}>
        <div className="app-loader-car">
          <svg width="150" height="56" viewBox="0 0 150 56" fill="none">
            <ellipse cx="75" cy="53" rx="64" ry="5" fill="rgba(0,0,0,0.25)"/>
            <rect x="4" y="22" width="142" height="21" rx="5" fill="white" fillOpacity="0.92"/>
            <path d="M30 22 L48 4 L102 4 L120 22Z" fill="white" fillOpacity="0.88"/>
            <path d="M50 6 L50 22 L83 22 L83 6Z" fill="rgba(110,42,140,0.22)"/>
            <path d="M85 6 L85 22 L116 22 L104 6Z" fill="rgba(110,42,140,0.22)"/>
            <line x1="84" y1="4" x2="84" y2="22" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
            <rect x="4" y="22" width="142" height="3" rx="2" fill="rgba(255,255,255,0.4)"/>
            <line x1="72" y1="23" x2="72" y2="42" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
            <circle cx="38" cy="43" r="11" fill="#1A0A2A"/>
            <circle cx="112" cy="43" r="11" fill="#1A0A2A"/>
            <circle cx="38" cy="43" r="6" fill="rgba(255,255,255,0.28)"/>
            <circle cx="112" cy="43" r="6" fill="rgba(255,255,255,0.28)"/>
            <circle cx="38" cy="43" r="2.5" fill="rgba(255,255,255,0.65)"/>
            <circle cx="112" cy="43" r="2.5" fill="rgba(255,255,255,0.65)"/>
            <rect x="140" y="26" width="9" height="8" rx="3" fill="#FFE566" fillOpacity="0.95"/>
            <ellipse cx="147" cy="30" rx="18" ry="7" fill="#FFE566" fillOpacity="0.14"/>
            <rect x="1" y="26" width="8" height="8" rx="3" fill="#FF4444" fillOpacity="0.85"/>
          </svg>
        </div>
        <div className="app-loader-road"><div className="app-loader-road-inner"/></div>
        <div className="app-loader-name">EasyDrive</div>
        <div className="app-loader-sub">ระบบจองรถใช้งาน · กำลังโหลด...</div>
        <div className="app-loader-dots">
          <div className="app-loader-dot"/><div className="app-loader-dot"/><div className="app-loader-dot"/>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5f5f5',flexDirection:'column',gap:16,textAlign:'center',padding:24}}>
        <div style={{width:54,height:54,borderRadius:14,background:'#F37021',display:'grid',placeItems:'center',color:'white',fontWeight:700,fontSize:14}}>PEA</div>
        <div style={{fontSize:18,fontWeight:700,color:'#333'}}>ยังไม่ได้ตั้งค่า Environment Variables</div>
        <div style={{fontSize:14,color:'#666',maxWidth:420,lineHeight:1.6}}>
          กรุณาไปที่ <b>Vercel → Settings → Environment Variables</b><br/>
          แล้วเพิ่ม <code style={{background:'#eee',padding:'2px 6px',borderRadius:4}}>VITE_SUPABASE_URL</code> และ <code style={{background:'#eee',padding:'2px 6px',borderRadius:4}}>VITE_SUPABASE_ANON_KEY</code><br/>
          จากนั้น Redeploy
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen registered={registered} onLogin={handleLogin} onRegister={handleRegister} departments={departments}/>;
  }

  const counts = {
    approvals: bookings.filter((b) => b.status === "booked").length +
               (currentUser.role === "admin" ? mileageCorrections.filter((c) => c.status === "pending").length : 0),
    members: users.filter((u) => u.status === "pending").length,
  };

  const titles = {
    dashboard: { t: "แดชบอร์ด" }, booking: { t: "จองรถใช้งาน" },
    calendar: { t: "ปฏิทินการจอง" }, my: { t: "การจองของฉัน" },
    checkin: { t: "Check-in / Check-out" }, approvals: { t: "อนุมัติการจองรถ" },
    members: { t: "จัดการสมาชิก" }, vehicles: { t: "จัดการรถยนต์" },
    reports: { t: "รายงานและสถิติ" }, settings: { t: "ตั้งค่าและเชื่อมต่อ" },
    help: { t: "คู่มือการใช้งาน" },
  };

  const baseNotifications = generateNotifications(currentUser, bookings, users, vehicles, mileageCorrections);
  const notifications = baseNotifications.map((n) => ({ ...n, read: n.read || readNotifications.has(n.id) }));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={"app" + (sidebarCollapsed ? " sidebar-min" : "")}>
      <Sidebar route={route} setRoute={setRoute} user={currentUser} counts={counts} onLogout={confirmLogout} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} collapsed={sidebarCollapsed} onToggleCollapse={() => { const v = !sidebarCollapsed; setSidebarCollapsed(v); localStorage.setItem('pea-sidebar-collapsed', v ? '1' : '0'); }}/>
      <Topbar title={(titles[route.startsWith("settings") ? "settings" : route] || titles.dashboard).t} subtitle={null}
        onMenuClick={() => setDrawerOpen(true)}
        onBellClick={() => setNotiOpen(!notiOpen)}
        unreadCount={unreadCount}
        isDark={isDark}
        onDarkToggle={() => setIsDark(d => !d)}
        onLogout={confirmLogout}
        onCmdOpen={() => setCmdOpen(true)}
      />
      <main className="main">
        {route === "dashboard" && <Dashboard user={currentUser} vehicles={vehicles} bookings={bookings} users={users} setRoute={setRoute} onSelectVehicle={(v) => setSelectedVehicle(v)}/>}
        {route === "booking" && <BookingScreen user={currentUser} vehicles={vehicles} bookings={bookings} prefillVehicle={selectedVehicle} onSubmit={handleSubmitBooking} onCancel={() => setRoute("dashboard")}/>}
        {route === "calendar" && <CalendarScreen vehicles={vehicles} bookings={bookings} users={users} onSelectBooking={(b) => setSelectedBooking(b)}/>}
        {route === "my" && <MyBookingsScreen bookings={bookings} vehicles={vehicles} users={users} currentUser={currentUser} onSelectBooking={(b) => setSelectedBooking(b)} onPrintVoucher={(b) => setVoucherBooking(b)} setRoute={setRoute}/>}
        {route === "checkin" && <CheckinScreen bookings={bookings} vehicles={vehicles} users={users} currentUser={currentUser} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} onPrintChecklist={(b) => setVoucherBooking(b)}/>}
        {route === "checkin-history" && <CheckinHistoryScreen bookings={bookings} vehicles={vehicles} users={users} currentUser={currentUser} onUpdateRecord={handleUpdateCheckinRecord}/>}
        {route === "approvals" && <ApprovalsScreen bookings={bookings} vehicles={vehicles} users={users} mileageCorrections={mileageCorrections} user={currentUser} onApprove={handleApprove} onReject={handleReject} onApproveMileage={handleApproveMileageCorrection} onRejectMileage={handleRejectMileageCorrection} onSelectBooking={(b) => setSelectedBooking(b)} onPrintVoucher={(b) => setVoucherBooking(b)}/>}
        {route === "members" && <MembersScreen users={users} user={currentUser} departments={departments} onApproveUser={handleApproveUser} onRejectUser={handleRejectUser} onChangeRole={handleChangeRole} onUpdateUser={handleUpdateUser}/>}
        {route === "vehicles" && <VehiclesScreen vehicles={vehicles} bookings={bookings} vehicleHistory={vehicleHistory} users={users} user={currentUser} onUpdateVehicle={handleUpdateVehicle} onAddVehicle={handleAddVehicle}/>}
        {route === "reports" && <ReportsScreen vehicles={vehicles} bookings={bookings} users={users} onRefresh={loadAllData}/>}
        {route.startsWith("settings") && <SettingsScreen currentUser={currentUser} bookings={bookings} vehicles={vehicles} departments={departments} onUpdateProfile={(p) => setCurrentUser(p)} pushToast={pushToast} activeTab={route === "settings" ? "account" : route.replace("settings-", "")} onTabChange={(tab) => setRoute("settings-" + tab)}/>}
        {route === "help" && <ManualScreen role={currentUser?.role}/>}
      </main>

      {selectedVehicle && <VehicleQuickModal vehicle={selectedVehicle} bookings={bookings} users={users} onClose={() => setSelectedVehicle(null)} onBook={() => { setSelectedVehicle(null); setRoute("booking"); }}/>}
      {selectedBooking && <BookingDetailModal booking={selectedBooking} vehicle={vehicles.find((v) => v.id === selectedBooking.vehicleId)} user={users.find((u) => u.id === selectedBooking.userId)} onClose={() => setSelectedBooking(null)}/>}
      {voucherBooking && <BookingVoucher booking={voucherBooking} vehicle={vehicles.find((v) => v.id === voucherBooking.vehicleId)} user={users.find((u) => u.id === voucherBooking.userId)} onClose={() => setVoucherBooking(null)} pushToast={pushToast}/>}

      <ToastStack toasts={toasts}/>
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)}/>

      {idleWarning && (
        <div className="modal-overlay center" style={{zIndex:3000}} onClick={null}>
          <div className="modal" style={{width:380}} onClick={(e) => e.stopPropagation()}>
            <div style={{padding:'24px 24px 18px', textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'var(--warn-bg)',color:'var(--warn)',display:'grid',placeItems:'center',margin:'0 auto 14px',boxShadow:'0 0 0 8px rgba(234,179,8,0.12)'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h2 style={{margin:'0 0 6px',fontSize:18,fontWeight:700}}>เซสชันกำลังจะหมดอายุ</h2>
              <p style={{margin:'0 0 16px',color:'var(--text-2)',fontSize:13.5,lineHeight:1.55}}>
                ไม่มีการใช้งานนาน {IDLE_MS / 60000} นาที<br/>
                ระบบจะออกจากระบบอัตโนมัติใน
              </p>
              <div style={{fontSize:42,fontWeight:800,fontFamily:'var(--font-mono)',color:'var(--warn)',letterSpacing:'-0.02em',lineHeight:1}}>
                {Math.floor(idleCountdown / 60).toString().padStart(2,'0')}:{(idleCountdown % 60).toString().padStart(2,'0')}
              </div>
            </div>
            <div className="modal-foot" style={{gap:10}}>
              <button className="btn ghost" style={{flex:1}} onClick={handleLogout}>ออกจากระบบ</button>
              <button className="btn primary" style={{flex:2}} onClick={() => {
                clearTimeout(idleWarnTimer.current);
                clearTimeout(idleOutTimer.current);
                clearInterval(countdownInterval.current);
                setIdleWarning(false);
                document.dispatchEvent(new MouseEvent('mousemove'));
              }}>ยังใช้งานอยู่</button>
            </div>
          </div>
        </div>
      )}
      <NotificationCenter open={notiOpen} notifications={notifications} onClose={() => setNotiOpen(false)} onMarkRead={(id) => setReadNotifications(new Set([...readNotifications, id]))} onMarkAllRead={() => setReadNotifications(new Set(notifications.map((n) => n.id)))} onNavigate={(r) => setRoute(r)}/>
      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} role={currentUser?.role} setRoute={(r) => { setRoute(r); setCmdOpen(false); }} onLogout={confirmLogout}
        bookings={bookings} vehicles={vehicles} users={users}
        onSelectBooking={(b) => { setSelectedBooking(b); setCmdOpen(false); }}
        onSelectVehicle={(v) => { setSelectedVehicle(v); setCmdOpen(false); }}
      />

      <DevCardButton/>
    </div>
  );
}

function VehicleQuickModal({ vehicle, bookings, users, onClose, onBook }) {
  const v = vehicle;
  const vBookings = bookings.filter((b) => b.vehicleId === v.id && ["approved","urgent","booked"].includes(b.status));
  return (
    <Modal title={`รถยนต์ ${v.id}`} onClose={onClose} width={560} footer={<><button className="btn" onClick={onClose}>ปิด</button><button className="btn accent" onClick={onBook}>{I.plus} จองรถคันนี้</button></>}>
      <div style={{display:'flex', gap:14, padding:16, background:'linear-gradient(135deg, var(--pea-purple-50), var(--pea-orange-50))', borderRadius:10, marginBottom:14}}>
        <VehicleIcon type={v.type} size={64}/>
        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span className="plate">{v.plate}</span><StatusPill status={v.status}/>
          </div>
          <div style={{fontSize:18, fontWeight:700, marginTop:4}}>{v.brand}</div>
          <div className="text-xs muted">{VEHICLE_TYPES[v.type]?.label} · ปี {v.year}</div>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
        <Mini lbl="เลขไมล์" val={`${fmtNum(v.mileage)} กม.`}/>
        <Mini lbl="ที่นั่ง" val={`${v.seats} คน`}/>
        <Mini lbl="เชื้อเพลิง" val={FUEL_TYPES[v.fuel]}/>
        <Mini lbl="ผู้รับผิดชอบ" val={v.owner}/>
        <Mini lbl="ต่อภาษีถัดไป" val={fmtDate(v.taxDue)}/>
        <Mini lbl="เช็คระยะถัดไป" val={fmtDate(v.nextService)}/>
      </div>
      {vBookings.length > 0 && (
        <>
          <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8}}>การจองที่กำลังจะมาถึง</div>
          <div className="col gap-2">
            {vBookings.slice(0,3).map((b) => {
              const u = users.find((x) => x.id === b.userId);
              return (
                <div key={b.id} style={{padding:'10px 12px', background:'var(--surface-2)', borderRadius:8, fontSize:12.5}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <StatusPill status={b.status}/>
                    <span style={{marginLeft:'auto', color:'var(--text-3)', fontSize:11.5}}>{fmtDateTime(b.from)} – {fmtTime(b.to)}</span>
                  </div>
                  <div style={{marginTop:4, fontWeight:500}}>{u?.name} · {b.purpose}</div>
                  <div className="text-xs muted">{b.destination}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
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

export default App
