import React from 'react'

// ─── SVG Icons ───────────────────────────────────────────────────────
const I = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  car: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11l1.5-4a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 11"/><path d="M3 11h18v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  stats: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18"/><path d="M5 21V11M10 21V7M15 21V13M20 21V4"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  map: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3z"/><path d="M8 3v16M16 6v16"/></svg>,
  pin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  fuel: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M3 22h12M14 13h3a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V9l-3-3"/></svg>,
  wrench: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  print: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  export: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  list: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><path d="M12 7v5l3 3"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  arrowLeft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  warn: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  qr: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v3M14 21h3M21 21v-3"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starOutline: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  zap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

// ─── Vehicle type icons (visual) ─────────────────────────────────────
function VehicleIcon({ type, size = 38 }) {
  const s = size;
  const stroke = "currentColor";
  const paths = {
    sedan: <g><path d="M6 14l2-5a2 2 0 0 1 1.9-1.4h8.2a2 2 0 0 1 1.9 1.4l2 5"/><path d="M4 14h22v6a1 1 0 0 1-1 1h-2.5a1.5 1.5 0 0 1-1.5-1.5V19H9v.5A1.5 1.5 0 0 1 7.5 21H5a1 1 0 0 1-1-1z"/><circle cx="9" cy="17" r="1.5"/><circle cx="21" cy="17" r="1.5"/></g>,
    pickup: <g><path d="M3 16l2-5a2 2 0 0 1 1.9-1.4h6L15 14h12v5a1 1 0 0 1-1 1h-2v-.5a2 2 0 0 0-4 0V20H9v-.5a2 2 0 0 0-4 0V20H4a1 1 0 0 1-1-1z"/><circle cx="7" cy="20" r="1.7"/><circle cx="22" cy="20" r="1.7"/></g>,
    van: <g><rect x="3" y="6" width="22" height="13" rx="1.5"/><path d="M3 14h22"/><circle cx="8" cy="20" r="1.7"/><circle cx="20" cy="20" r="1.7"/><path d="M7 9h5v4H7zM15 9h5v4h-5z"/></g>,
    truck6: <g><path d="M3 17V8a2 2 0 0 1 2-2h10v11"/><path d="M15 11h6l5 4v2h-11z"/><circle cx="8" cy="20" r="1.8"/><circle cx="22" cy="20" r="1.8"/><path d="M3 17h2M16 17h2"/></g>,
    truck3: <g><path d="M3 17V8a2 2 0 0 1 2-2h11v11"/><path d="M16 11h5l4 4v2h-9z"/><circle cx="8" cy="20" r="1.8"/><circle cx="21" cy="20" r="1.8"/></g>,
    crane: <g><path d="M3 17V9a1.5 1.5 0 0 1 1.5-1.5H13V17"/><path d="M13 11h4l5 5v2h-9z"/><path d="M13 9l8-6M13 9l4 3"/><circle cx="7" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></g>,
    bucket: <g><path d="M3 17V9a1.5 1.5 0 0 1 1.5-1.5H13V17"/><path d="M13 11h4l5 5v2h-9z"/><rect x="18" y="3" width="6" height="4" rx="0.5"/><path d="M21 7v2M19 7v2M23 7v2"/><circle cx="7" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></g>,
    ev: <g><path d="M6 14l2-5a2 2 0 0 1 1.9-1.4h8.2a2 2 0 0 1 1.9 1.4l2 5"/><path d="M4 14h22v6a1 1 0 0 1-1 1h-2.5a1.5 1.5 0 0 1-1.5-1.5V19H9v.5A1.5 1.5 0 0 1 7.5 21H5a1 1 0 0 1-1-1z"/><circle cx="9" cy="17" r="1.5"/><circle cx="21" cy="17" r="1.5"/><polyline points="14 4 12 9 16 9 14 14" fill="none" strokeWidth="2"/></g>,
  };
  const path = paths[type] || paths.sedan;
  return (
    <svg width={s} height={s} viewBox="0 0 30 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      {path}
    </svg>
  );
}

// ─── Status helpers ──────────────────────────────────────────────────
const STATUS_LABEL = {
  available: "พร้อมใช้งาน",
  booked: "ติดจอง (รออนุมัติ)",
  approved: "อนุมัติแล้ว",
  urgent: "ภารกิจด่วน",
  maintenance: "บำรุงรักษา",
  unavailable: "ไม่พร้อมใช้งาน",
  rejected: "ไม่อนุมัติ",
  pending: "รออนุมัติ",
  completed: "เสร็จสิ้น",
};

function StatusPill({ status }) {
  return (
    <span className={"pill " + status}>
      <span className="dot"></span>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────
const SETTINGS_CHILDREN = [
  { key: "settings-account",  label: "บัญชีผู้ใช้" },
  { key: "settings-noti",     label: "การแจ้งเตือน" },
  { key: "settings-calendar", label: "Calendar Sync" },
];
const SETTINGS_CHILDREN_ADMIN = [
  ...SETTINGS_CHILDREN,
  { key: "settings-depts", label: "จัดการแผนก" },
];

const NAV = {
  user: [
    { key: "dashboard",   label: "แดชบอร์ด",         icon: "dashboard" },
    { key: "booking",     label: "จองรถ",            icon: "plus", accent: true },
    { key: "calendar",    label: "ปฏิทินการจอง",      icon: "calendar" },
    { key: "my",          label: "การจองของฉัน",      icon: "history" },
    { key: "checkin",     label: "Check-in / out",   icon: "qr" },
    { key: "settings",    label: "ตั้งค่า",           icon: "settings", children: SETTINGS_CHILDREN },
  ],
  manager: [
    { key: "dashboard",   label: "แดชบอร์ด",         icon: "dashboard" },
    { key: "approvals",   label: "อนุมัติการจอง",     icon: "check", badge: "approvals" },
    { key: "booking",     label: "จองรถ",            icon: "plus", accent: true },
    { key: "calendar",    label: "ปฏิทินการจอง",      icon: "calendar" },
    { key: "my",          label: "การจองของฉัน",      icon: "history" },
    { key: "checkin",     label: "Check-in / out",   icon: "qr" },
    { key: "reports",     label: "รายงาน",           icon: "stats" },
    { key: "settings",    label: "ตั้งค่า",           icon: "settings", children: SETTINGS_CHILDREN },
  ],
  admin: [
    { key: "dashboard",   label: "แดชบอร์ด",         icon: "dashboard" },
    { key: "approvals",   label: "อนุมัติการจอง",     icon: "check", badge: "approvals" },
    { key: "members",     label: "สมาชิก",           icon: "users", badge: "members" },
    { key: "vehicles",    label: "จัดการรถยนต์",      icon: "car" },
    { key: "calendar",    label: "ปฏิทินการจอง",      icon: "calendar" },
    { key: "reports",     label: "รายงาน",           icon: "stats" },
    { key: "booking",     label: "จองรถ",            icon: "plus", accent: true },
    { key: "checkin",     label: "Check-in / out",   icon: "qr" },
    { key: "settings",    label: "ตั้งค่า",           icon: "settings", children: SETTINGS_CHILDREN_ADMIN },
  ],
};

function Sidebar({ route, setRoute, user, counts, onLogout, isOpen, onClose, collapsed, onToggleCollapse }) {
  const nav = NAV[user.role];

  const [expanded, setExpanded] = React.useState(() => {
    const init = {};
    nav.forEach(n => {
      if (n.children && n.children.some(c => c.key === route)) init[n.key] = true;
    });
    return init;
  });

  React.useEffect(() => {
    nav.forEach(n => {
      if (n.children && n.children.some(c => c.key === route)) {
        setExpanded(e => ({ ...e, [n.key]: true }));
      }
    });
  }, [route]);

  function handleNavClick(n) {
    if (n.children) {
      setExpanded(e => ({ ...e, [n.key]: !e[n.key] }));
    } else {
      setRoute(n.key);
      onClose && onClose();
    }
  }

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={"sidebar" + (isOpen ? " open" : "") + (collapsed ? " collapsed" : "")}>
        <div className="brand">
          <div className="brand-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="17" width="26" height="7" rx="3" fill="white"/>
              <path d="M9 17 Q9.5 9.5 16 9.5 Q22.5 9.5 23 17 Z" fill="white"/>
              <path d="M11.5 17 Q12 12 16 12 Q20 12 20.5 17 Z" fill="rgba(243,112,33,0.5)"/>
              <circle cx="9" cy="25" r="4.5" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.8"/>
              <circle cx="9" cy="25" r="1.8" fill="white"/>
              <circle cx="23" cy="25" r="4.5" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.8"/>
              <circle cx="23" cy="25" r="1.8" fill="white"/>
              <rect x="26.5" y="19" width="4.5" height="2.5" rx="1.2" fill="rgba(255,224,80,0.95)"/>
            </svg>
          </div>
          <div className="brand-text">
            <b>EasyDrive</b>
            <small>ระบบจองรถใช้งาน</small>
          </div>
          <button className="sidebar-toggle-btn" onClick={onToggleCollapse} title={collapsed ? "ขยาย Sidebar" : "ย่อ Sidebar"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed
                ? <><rect x="3" y="3" width="7" height="18" rx="1"/><path d="M14 9l4 3-4 3"/></>
                : <><rect x="3" y="3" width="7" height="18" rx="1"/><path d="M18 9l-4 3 4 3"/></>
              }
            </svg>
          </button>
        </div>
        <div className="nav-section nav-text">เมนูหลัก</div>
        {nav.map((n) => {
          const isChildActive = n.children && n.children.some(c => c.key === route);
          const isOpen_ = expanded[n.key];
          return (
            <React.Fragment key={n.key}>
              <button
                className={"nav-item" + (isChildActive ? " active-parent" : "") + (route === n.key ? " active" : "")}
                onClick={() => handleNavClick(n)}
              >
                <span className="ico">{I[n.icon]}</span>
                <span className="nav-text">{n.label}</span>
                {n.badge && counts[n.badge] > 0 && <span className="badge">{counts[n.badge]}</span>}
                {n.children && (
                  <span className="nav-chevron nav-text" style={{transform: isOpen_ ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', marginLeft:'auto'}}>
                    {I.chevronDown}
                  </span>
                )}
              </button>
              {n.children && isOpen_ && n.children.map(child => (
                <button
                  key={child.key}
                  className={"nav-sub-item" + (route === child.key ? " active" : "")}
                  onClick={() => { setRoute(child.key); onClose && onClose(); }}
                >
                  <span className="nav-text">{child.label}</span>
                </button>
              ))}
            </React.Fragment>
          );
        })}
        <div className="sidebar-footer">
          <div className="role-card">
            <div className="role-avatar">{user.name.charAt(0)}</div>
            <div className="role-meta">
              <b>{user.name}</b>
              <small>{user.role === "admin" ? "ผู้ดูแลระบบ" : user.role === "manager" ? "ผู้จัดการ" : "ผู้ใช้งาน"}</small>
            </div>
            <button className="logout-btn" onClick={onLogout} title="ออกจากระบบ">
              {I.logout}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────
function Topbar({ title, subtitle, children, onMenuClick, onBellClick, unreadCount = 0, isDark, onDarkToggle, onLogout, onCmdOpen }) {
  const now = new Date('2026-05-21T10:30');
  const dateStr = now.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick} title="เมนู">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div>
        <h1>{title}<small>{subtitle || dateStr + " · จ.เชียงใหม่"}</small></h1>
      </div>
      <div className="topbar-actions">
        {onCmdOpen && (
          <button className="btn ghost cmd-trigger" onClick={onCmdOpen} title="Command Menu (⌘K)" style={{display:'flex', alignItems:'center', gap:7, fontSize:13, color:'var(--text-3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 11px', height:34}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <span style={{fontSize:12.5}}>ค้นหา...</span>
            <kbd style={{fontSize:11, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 5px', fontFamily:'var(--font-mono)', marginLeft:2}}>⌘K</kbd>
          </button>
        )}
        {children}
        {onDarkToggle && (
          <button className="btn icon ghost" title={isDark ? "โหมดสว่าง" : "โหมดมืด"} onClick={onDarkToggle}>
            {isDark ? I.sun : I.moon}
          </button>
        )}
        <button className="btn icon ghost" title="การแจ้งเตือน" onClick={onBellClick} style={{position:'relative'}}>
          {I.bell}
          {unreadCount > 0 && (
            <span style={{
              position:'absolute', top:2, right:2,
              minWidth:16, height:16, padding:'0 4px',
              background:'var(--pea-orange)', color:'white',
              borderRadius:999, fontSize:10, fontWeight:700,
              display:'grid', placeItems:'center',
              border:'1.5px solid white',
              lineHeight:1,
            }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>
        {onLogout && (
          <button className="btn icon ghost topbar-logout" title="ออกจากระบบ" onClick={onLogout}>
            {I.logout}
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer, width = 560 }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn icon ghost" onClick={onClose}>{I.x}</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────────────────
function ConfirmDialog({ confirm, onClose }) {
  const [reason, setReason] = React.useState("");
  const [acked, setAcked] = React.useState(false);

  React.useEffect(() => {
    if (!confirm) return;
    setReason(confirm.reasonDefault || "");
    setAcked(false);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && !confirm.requireReason && !confirm.requireAck) handleConfirm();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirm]);

  if (!confirm) return null;

  const kindMap = {
    positive: { bg: "var(--ok-bg)", fg: "var(--ok)", btn: "var(--ok)", icon: I.check, label: "ยืนยันอนุมัติ" },
    negative: { bg: "var(--danger-bg)", fg: "var(--danger)", btn: "var(--danger)", icon: I.x, label: "ยืนยันปฏิเสธ" },
    warn:     { bg: "var(--warn-bg)", fg: "var(--warn)", btn: "var(--warn)", icon: I.warn, label: "ยืนยัน" },
    primary:  { bg: "var(--pea-purple-50)", fg: "var(--pea-purple)", btn: "var(--pea-purple)", icon: I.check, label: "ยืนยัน" },
  };
  const k = kindMap[confirm.kind || "primary"];

  const canConfirm =
    (!confirm.requireReason || reason.trim().length >= 3) &&
    (!confirm.requireAck || acked);

  function handleConfirm() {
    if (!canConfirm) return;
    confirm.onConfirm({ reason });
    onClose();
  }

  return (
    <div className="modal-overlay center" onClick={onClose} style={{zIndex:2000}}>
      <div className="modal" style={{ width: 460, animation: 'confirmPop 0.18s ease-out' }} onClick={(e) => e.stopPropagation()}>
        <div style={{padding:'24px 24px 18px', textAlign:'center'}}>
          <div style={{
            width:60, height:60, borderRadius:'50%',
            background:k.bg, color:k.fg,
            display:'grid', placeItems:'center',
            margin:'0 auto 14px',
            boxShadow:`0 0 0 8px ${k.bg}66`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              {k.icon.props.children}
            </svg>
          </div>
          <h2 style={{margin:'0 0 6px', fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{confirm.title}</h2>
          {confirm.message && (
            <p style={{margin:'0', color:'var(--text-2)', fontSize:13.5, lineHeight:1.55, textWrap:'pretty'}}>
              {confirm.message}
            </p>
          )}
        </div>

        {confirm.detail && (
          <div style={{
            margin:'0 24px 14px',
            padding:'12px 14px',
            background:'var(--surface-2)',
            borderRadius:10,
            border:'1px solid var(--border)',
            fontSize:12.5,
          }}>
            {confirm.detail}
          </div>
        )}

        {confirm.requireReason && (
          <div style={{padding:'0 24px 14px'}}>
            <label className="field-lbl" style={{display:'block', marginBottom:5}}>
              {confirm.reasonLabel || 'ระบุเหตุผล'} <span className="req">*</span>
            </label>
            <textarea
              className="textarea"
              autoFocus
              placeholder={confirm.reasonPlaceholder || 'ระบุเหตุผลให้ชัดเจน เพื่อแจ้งกลับผู้ขอ'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{minHeight:80}}
            />
            <div className="input-hint" style={{marginTop:4}}>
              อย่างน้อย 3 ตัวอักษร · {reason.length} ตัวอักษร
            </div>
          </div>
        )}

        {confirm.requireAck && (
          <div style={{padding:'0 24px 14px'}}>
            <label className="checkbox" style={{padding:'10px 12px', background:'var(--warn-bg)', borderRadius:8, border:'1px solid #f0d8a8'}}>
              <input type="checkbox" checked={acked} onChange={(e) => setAcked(e.target.checked)}/>
              <span style={{fontSize:12.5, color:'#7a5500', lineHeight:1.4}}>
                {confirm.ackLabel || 'ข้าพเจ้าได้ตรวจสอบข้อมูลเรียบร้อยแล้ว และยืนยันการดำเนินการ'}
              </span>
            </label>
          </div>
        )}

        <div className="modal-foot" style={{padding:'14px 22px', justifyContent:'space-between'}}>
          <button className="btn ghost" onClick={onClose}>ยกเลิก</button>
          <button
            className="btn"
            disabled={!canConfirm}
            style={{
              background: k.btn, color:'white', borderColor: k.btn,
              opacity: canConfirm ? 1 : 0.5, cursor: canConfirm ? 'pointer' : 'not-allowed',
              padding:'9px 18px', fontWeight:600,
            }}
            onClick={handleConfirm}>
            {confirm.confirmLabel || k.label}
          </button>
        </div>
      </div>
      <style>{`@keyframes confirmPop { from { transform: scale(0.92); opacity: 0 } }`}</style>
    </div>
  );
}

// ─── Format helpers ──────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) + " " +
         d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
function fmtNum(n) { return (n ?? 0).toLocaleString('th-TH'); }
function daysUntil(iso) {
  if (!iso) return Infinity;
  const today = new Date('2026-05-21');
  const t = new Date(iso);
  return Math.round((t - today) / 86400000);
}

// ─── Toast ───────────────────────────────────────────────────────────
const TOAST_ICONS = {
  ok:     <><polyline points="20 6 9 17 4 12"/></>,
  danger: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  warn:   <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  info:   <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
};

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => {
        const kind = t.kind || t.type || "info";
        const title = t.title || t.msg || "";
        const body = t.body || "";
        const icon = TOAST_ICONS[kind] || TOAST_ICONS.info;
        return (
          <div key={t.id} className={"toast toast-" + kind}>
            <div className="toast-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {icon}
              </svg>
            </div>
            <div className="toast-body">
              <b>{title}</b>
              {body && <small>{body}</small>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Search Input with clear button ──────────────────────────────────
function SearchInput({ value, onChange, placeholder, style, inputStyle }) {
  return (
    <div style={{position:'relative', ...style}}>
      <div style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none', zIndex:1}}>
        {I.search}
      </div>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'ค้นหา...'}
        style={{padding:'7px 34px 7px 32px', width:'100%', fontSize:13, ...inputStyle}}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          title="ล้างการค้นหา"
          style={{
            position:'absolute', right:6, top:'50%', transform:'translateY(-50%)',
            background:'var(--surface-2)', border:'1px solid var(--border)',
            borderRadius:5, cursor:'pointer', color:'var(--text-3)',
            width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center',
            padding:0, lineHeight:1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── NavModal ────────────────────────────────────────────────────────
const PEA_FANG = { lat: 19.9152, lng: 99.2102, name: 'การไฟฟ้าส่วนภูมิภาค สาขาฝาง' };

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function NavModal({ booking, onClose }) {
  const [gps, setGps] = React.useState({ state: 'loading' });

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setGps({ state: 'unavailable' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ state: 'ok', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGps({ state: 'denied' }),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const usingFallback = gps.state !== 'ok';
  const originLat = gps.state === 'ok' ? gps.lat : PEA_FANG.lat;
  const originLng = gps.state === 'ok' ? gps.lng : PEA_FANG.lng;
  const originName = gps.state === 'ok' ? 'ตำแหน่งปัจจุบัน' : PEA_FANG.name;
  const destLat = booking.coords[0];
  const destLng = booking.coords[1];
  const distKm = haversineKm(originLat, originLng, destLat, destLng);
  const estMin = Math.round(distKm / 50 * 60);

  const googleUrl = `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
  const appleUrl = `https://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, var(--pea-purple) 0%, #7c3aed 100%)', color: 'white', borderRadius: '12px 12px 0 0' }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
            นำทางไปยังจุดหมาย
          </h2>
          <button className="btn icon ghost" onClick={onClose} style={{ color: 'rgba(255,255,255,0.8)' }}>
            {I.x}
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {usingFallback && (
            <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn)', borderRadius: 8, padding: '10px 13px', display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13 }}>
              <span style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }}>{I.warn}</span>
              <span style={{ color: 'var(--warn)', lineHeight: 1.5 }}>
                {gps.state === 'loading' ? 'กำลังหาตำแหน่ง GPS...' : 'ไม่สามารถระบุตำแหน่งปัจจุบันได้'}&nbsp;
                {gps.state !== 'loading' && 'ใช้ที่ตั้งสำนักงานเป็นจุดเริ่มต้นแทน'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <NavPoint
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>}
              label="จุดเริ่มต้น"
              name={gps.state === 'loading' ? 'กำลังโหลด...' : originName}
              coords={gps.state === 'loading' ? null : [originLat, originLng]}
              color="var(--ok)"
              bg="var(--ok-bg)"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 20 }}>
              <div style={{ width: 2, height: 20, background: 'var(--border-strong)', marginLeft: 6 }}/>
              {gps.state !== 'loading' && (
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  {distKm < 1 ? `${Math.round(distKm * 1000)} ม.` : `${distKm.toFixed(1)} กม.`}
                  &nbsp;·&nbsp;~{estMin < 60 ? `${estMin} นาที` : `${Math.floor(estMin/60)} ชม. ${estMin%60} นาที`}
                </span>
              )}
            </div>
            <NavPoint
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
              label="จุดหมาย"
              name={booking.destination}
              coords={[destLat, destLng]}
              color="var(--danger)"
              bg="var(--danger-bg)"
            />
          </div>
        </div>

        <div className="modal-foot" style={{ gap: 10 }}>
          <button
            className="btn"
            style={{ flex: 1, background: '#34a853', color: 'white', border: 'none', justifyContent: 'center', gap: 7 }}
            onClick={() => window.open(googleUrl, '_blank')}
            disabled={gps.state === 'loading'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google Maps
          </button>
          <button
            className="btn"
            style={{ flex: 1, background: '#1c1c1e', color: 'white', border: 'none', justifyContent: 'center', gap: 7 }}
            onClick={() => window.open(appleUrl, '_blank')}
            disabled={gps.state === 'loading'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Apple Maps
          </button>
        </div>
      </div>
    </div>
  );
}

function NavPoint({ icon, label, name, coords, color, bg }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{name}</div>
        {coords && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Command Menu (Ctrl/Cmd+K) ───────────────────────────────────────
const CMD_ITEMS = {
  user: [
    { key: "dashboard",        label: "แดชบอร์ด",        icon: "dashboard", group: "นำทาง" },
    { key: "booking",          label: "จองรถใช้งาน",      icon: "plus",      group: "นำทาง" },
    { key: "calendar",         label: "ปฏิทินการจอง",     icon: "calendar",  group: "นำทาง" },
    { key: "my",               label: "การจองของฉัน",     icon: "list",      group: "นำทาง" },
    { key: "checkin",          label: "Check-in / out",   icon: "qr",        group: "นำทาง" },
    { key: "settings-account", label: "บัญชีผู้ใช้",      icon: "settings",  group: "ตั้งค่า" },
    { key: "settings-noti",    label: "การแจ้งเตือน",     icon: "bell",      group: "ตั้งค่า" },
  ],
  manager: [
    { key: "dashboard",        label: "แดชบอร์ด",        icon: "dashboard", group: "นำทาง" },
    { key: "approvals",        label: "อนุมัติการจอง",    icon: "check",     group: "นำทาง" },
    { key: "booking",          label: "จองรถใช้งาน",      icon: "plus",      group: "นำทาง" },
    { key: "calendar",         label: "ปฏิทินการจอง",     icon: "calendar",  group: "นำทาง" },
    { key: "checkin",          label: "Check-in / out",   icon: "qr",        group: "นำทาง" },
    { key: "reports",          label: "รายงาน",           icon: "stats",     group: "นำทาง" },
    { key: "settings-account", label: "บัญชีผู้ใช้",      icon: "settings",  group: "ตั้งค่า" },
    { key: "settings-noti",    label: "การแจ้งเตือน",     icon: "bell",      group: "ตั้งค่า" },
  ],
  admin: [
    { key: "dashboard",        label: "แดชบอร์ด",        icon: "dashboard", group: "นำทาง" },
    { key: "approvals",        label: "อนุมัติการจอง",    icon: "check",     group: "นำทาง" },
    { key: "members",          label: "สมาชิก",           icon: "users",     group: "นำทาง" },
    { key: "vehicles",         label: "จัดการรถยนต์",     icon: "car",       group: "นำทาง" },
    { key: "calendar",         label: "ปฏิทินการจอง",     icon: "calendar",  group: "นำทาง" },
    { key: "reports",          label: "รายงาน",           icon: "stats",     group: "นำทาง" },
    { key: "booking",          label: "จองรถใช้งาน",      icon: "plus",      group: "นำทาง" },
    { key: "checkin",          label: "Check-in / out",   icon: "qr",        group: "นำทาง" },
    { key: "settings-account", label: "บัญชีผู้ใช้",      icon: "settings",  group: "ตั้งค่า" },
    { key: "settings-noti",    label: "การแจ้งเตือน",     icon: "bell",      group: "ตั้งค่า" },
    { key: "settings-depts",   label: "จัดการแผนก",       icon: "users",     group: "ตั้งค่า" },
  ],
};

function CommandMenu({ open, onClose, role, setRoute, onLogout }) {
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  const items = React.useMemo(() => {
    const base = CMD_ITEMS[role] || CMD_ITEMS.user;
    const logoutItem = { key: '__logout', label: 'ออกจากระบบ', icon: 'logout', group: 'บัญชี', action: onLogout };
    const all = [...base, logoutItem];
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter(i => i.label.toLowerCase().includes(lq) || i.group.toLowerCase().includes(lq));
  }, [q, role, onLogout]);

  React.useEffect(() => { setIdx(0); }, [q]);

  React.useEffect(() => {
    if (!open) { setQ(''); setIdx(0); return; }
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, items.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        const item = items[idx];
        if (!item) return;
        onClose();
        if (item.action) item.action();
        else setRoute(item.key);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, items, idx]);

  React.useEffect(() => {
    const el = listRef.current?.children[idx];
    el?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  if (!open) return null;

  const groups = [...new Set(items.map(i => i.group))];

  return (
    <div className="modal-overlay" style={{zIndex:3000, alignItems:'flex-start', paddingTop:'10vh'}} onClick={onClose}>
      <div style={{
        width:'min(92vw, 520px)',
        background:'var(--surface)',
        borderRadius:16,
        boxShadow:'0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12)',
        overflow:'hidden',
        animation:'slideUp 0.15s ease-out',
      }} onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid var(--border)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="พิมพ์คำสั่งหรือค้นหา..."
            style={{flex:1, border:'none', outline:'none', background:'transparent', fontSize:15, color:'var(--text)', fontFamily:'inherit'}}
          />
          {q && (
            <button onClick={() => setQ('')} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:2, display:'flex', alignItems:'center'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={listRef} style={{maxHeight:'min(60vh, 400px)', overflowY:'auto', padding:'6px 0'}}>
          {items.length === 0 ? (
            <div style={{padding:'28px 16px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>ไม่พบผลลัพธ์</div>
          ) : groups.map(group => {
            const groupItems = items.filter(i => i.group === group);
            return (
              <React.Fragment key={group}>
                <div style={{padding:'6px 14px 2px', fontSize:11, fontWeight:600, color:'var(--text-3)', letterSpacing:'0.06em', textTransform:'uppercase'}}>{group}</div>
                {groupItems.map(item => {
                  const globalIdx = items.indexOf(item);
                  const active = globalIdx === idx;
                  return (
                    <button key={item.key}
                      onMouseEnter={() => setIdx(globalIdx)}
                      onClick={() => { onClose(); if (item.action) item.action(); else setRoute(item.key); }}
                      style={{
                        display:'flex', alignItems:'center', gap:11,
                        width:'100%', padding:'10px 14px',
                        border:'none', textAlign:'left', cursor:'pointer',
                        background: active ? 'var(--pea-purple-50)' : 'transparent',
                        color: active ? 'var(--pea-purple)' : item.key === '__logout' ? 'var(--danger)' : 'var(--text)',
                        borderRadius: active ? 0 : 0,
                        transition:'background 0.1s',
                        fontSize: 14,
                      }}
                    >
                      <span style={{
                        width:30, height:30, borderRadius:8, flexShrink:0,
                        background: active ? 'var(--pea-purple-100)' : 'var(--surface-2)',
                        display:'grid', placeItems:'center',
                        color: item.key === '__logout' ? 'var(--danger)' : active ? 'var(--pea-purple)' : 'var(--text-2)',
                      }}>
                        {React.cloneElement(I[item.icon] || I.dashboard, { width: 15, height: 15 })}
                      </span>
                      <span style={{flex:1}}>{item.label}</span>
                      {active && (
                        <kbd style={{fontSize:11, color:'var(--text-3)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:5, padding:'2px 6px', fontFamily:'var(--font-mono)'}}>↵</kbd>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{display:'flex', gap:14, padding:'8px 16px', borderTop:'1px solid var(--border)', fontSize:11.5, color:'var(--text-3)'}}>
          <span><kbd style={{background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 5px', fontFamily:'var(--font-mono)', marginRight:4}}>↑↓</kbd>เลื่อน</span>
          <span><kbd style={{background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 5px', fontFamily:'var(--font-mono)', marginRight:4}}>↵</kbd>เปิด</span>
          <span><kbd style={{background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 5px', fontFamily:'var(--font-mono)', marginRight:4}}>Esc</kbd>ปิด</span>
          <span style={{marginLeft:'auto'}}>⌘K</span>
        </div>
      </div>
    </div>
  );
}

// ─── DeptPicker (searchable command menu) ────────────────────────────
function DeptPicker({ value, options, onChange, placeholder = 'เลือกแผนก...' }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const rootRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    setQ('');
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const handler = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [open]);

  const filtered = options.filter((o) => !q || o.toLowerCase().includes(q.toLowerCase()));

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="input"
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: open ? 'var(--surface)' : undefined, borderColor: open ? 'var(--pea-purple)' : undefined, boxShadow: open ? '0 0 0 3px var(--pea-purple-100)' : undefined }}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ color: value ? 'var(--text)' : 'var(--text-3)' }}>{value || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 600,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 260,
          animation: 'slideUp 0.12s ease-out',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                ref={inputRef}
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาแผนก..."
                style={{ paddingLeft: 30, fontSize: 13, height: 34 }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false);
                  if (e.key === 'Enter' && filtered.length === 1) { onChange(filtered[0]); setOpen(false); }
                }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>ไม่พบแผนก</div>
            ) : filtered.map((o) => {
              const active = o === value;
              return (
                <button key={o} type="button"
                  onClick={() => { onChange(o); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: 14, lineHeight: 1.4,
                    background: active ? 'var(--pea-purple-50)' : 'transparent',
                    color: active ? 'var(--pea-purple)' : 'var(--text)',
                    fontWeight: active ? 600 : 400,
                    border: 'none', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: active ? 1 : 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export {
  I, VehicleIcon, StatusPill, STATUS_LABEL,
  Sidebar, Topbar, Modal, ConfirmDialog, ToastStack, SearchInput, NavModal, DeptPicker, CommandMenu,
  fmtDate, fmtDateTime, fmtTime, fmtNum, daysUntil,
};
