import React from 'react'

// ─── Code block helper ────────────────────────────────────────────────
function Code({ children, lang = '' }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div style={{ position: 'relative', margin: '6px 0' }}>
      <pre style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '12px 14px', fontSize: 12.5,
        fontFamily: 'var(--font-mono)', overflowX: 'auto', margin: 0,
        lineHeight: 1.65, color: 'var(--text)',
      }}>
        {lang && <span style={{ position: 'absolute', top: 8, right: 36, fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--font-sans)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{lang}</span>}
        <code>{children}</code>
      </pre>
      <button onClick={() => { navigator.clipboard?.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        style={{ position: 'absolute', top: 7, right: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', fontSize: 10.5, cursor: 'pointer', color: copied ? 'var(--ok)' : 'var(--text-3)' }}>
        {copied ? '✓' : 'copy'}
      </button>
    </div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────
function SectionHead({ id, icon, title, sub }) {
  return (
    <div id={id} style={{ paddingTop: 8, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
      </div>
      {sub && <p style={{ margin: '0 0 0 30px', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{sub}</p>}
    </div>
  );
}

// ─── Table helper ────────────────────────────────────────────────────
function DevTable({ heads, rows }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>{heads.map((h, i) => (
            <th key={i} style={{ textAlign: 'left', padding: '8px 12px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid var(--border)' : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '8px 12px', verticalAlign: 'top', color: ci === 0 ? 'var(--text)' : 'var(--text-2)', fontFamily: ci === 0 ? 'var(--font-mono)' : 'inherit', fontSize: ci === 0 ? 12 : 12.5 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tag/Pill helper ─────────────────────────────────────────────────
function Tag({ children, color = 'var(--pea-purple)' }) {
  return (
    <span style={{ display: 'inline-block', background: color + '18', color, border: `1px solid ${color}30`, borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', marginRight: 4 }}>
      {children}
    </span>
  );
}

// ─── Info box ────────────────────────────────────────────────────────
function InfoBox({ kind = 'info', children }) {
  const styles = {
    info: { bg: 'var(--info-bg)', border: '#93c5fd', icon: 'ℹ️' },
    warn: { bg: 'var(--warn-bg)', border: '#fcd34d', icon: '⚠️' },
    ok:   { bg: 'var(--ok-bg)',   border: '#86efac', icon: '✅' },
  };
  const s = styles[kind] || styles.info;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, lineHeight: 1.6, display: 'flex', gap: 10, marginBottom: 12 }}>
      <span style={{ flexShrink: 0 }}>{s.icon}</span>
      <div>{children}</div>
    </div>
  );
}

// ─── TOC sections ────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',    icon: '🏗️', label: 'ภาพรวมสถาปัตยกรรม' },
  { id: 'files',       icon: '📁', label: 'ไฟล์และโครงสร้าง' },
  { id: 'database',    icon: '🗄️', label: 'ฐานข้อมูล Supabase' },
  { id: 'components',  icon: '🧩', label: 'Components & Helpers' },
  { id: 'routing',     icon: '🔀', label: 'Routing System' },
  { id: 'state',       icon: '⚙️', label: 'State Management' },
  { id: 'styling',     icon: '🎨', label: 'CSS & Theming' },
  { id: 'env',         icon: '🔑', label: 'Environment & Deploy' },
];

// ─── Main DevGuideScreen ─────────────────────────────────────────────
export function DevGuideScreen() {
  const [activeSection, setActiveSection] = React.useState('overview');
  const contentRef = React.useRef(null);

  function scrollTo(id) {
    setActiveSection(id);
    const el = document.getElementById('dev-sec-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  React.useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    function onScroll() {
      for (const sec of [...SECTIONS].reverse()) {
        const el = document.getElementById('dev-sec-' + sec.id);
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveSection(sec.id);
          return;
        }
      }
    }
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ display: 'flex', gap: 0, height: 680, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* TOC sidebar */}
      <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface-2)', padding: '16px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 14px 12px', fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Developer Guide</div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '7px 14px', background: activeSection === s.id ? 'var(--pea-purple-50)' : 'transparent',
              border: 'none', borderLeft: activeSection === s.id ? '2.5px solid var(--pea-purple)' : '2.5px solid transparent',
              color: activeSection === s.id ? 'var(--pea-purple)' : 'var(--text-2)',
              fontWeight: activeSection === s.id ? 600 : 400,
              fontSize: 12.5, cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>{s.icon}</span>
            <span style={{ lineHeight: 1.35 }}>{s.label}</span>
          </button>
        ))}
        <div style={{ margin: '16px 14px 0', padding: '10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>STACK</div>
          {['React 18', 'Vite 5', 'Supabase', 'Vanilla CSS'].map(t => (
            <div key={t} style={{ fontSize: 11.5, color: 'var(--text-2)', padding: '2px 0' }}>· {t}</div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 40px' }}>

        {/* ── OVERVIEW ─────────────────────────────────────── */}
        <div id="dev-sec-overview">
          <SectionHead id="overview" icon="🏗️" title="ภาพรวมสถาปัตยกรรม"
            sub="EasyDrive เป็น SPA (Single Page Application) ที่ไม่ใช้ Library routing — ใช้ state ธรรมดาในการสลับหน้า" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { icon: '⚡', title: 'Frontend', items: ['React 18 (JSX, ไม่ใช้ TypeScript)', 'Vite 5 (bundler + dev server)', 'Vanilla CSS (ไม่ใช้ Tailwind/Bootstrap)'] },
              { icon: '🗄️', title: 'Backend (Supabase)', items: ['PostgreSQL (ฐานข้อมูล)', 'Supabase Auth (email + MFA)', 'Realtime (WebSocket)', 'Row Level Security (RLS)'] },
              { icon: '☁️', title: 'Infrastructure', items: ['Vercel (hosting + CDN)', 'GitHub (source control)', 'Supabase Cloud (managed DB)', 'ไม่มี backend server เอง'] },
            ].map(({ icon, title, items }) => (
              <div key={title} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 14px 12px' }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{title}</div>
                {items.map((it, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', padding: '2px 0', lineHeight: 1.4 }}>· {it}</div>)}
              </div>
            ))}
          </div>

          <InfoBox kind="info">
            <b>Data Flow:</b> ข้อมูลทั้งหมดอยู่ใน <code>App.jsx</code> (root state) — Supabase Realtime subscribe ทุก table สำคัญ เมื่อมีการเปลี่ยนแปลงจะ reload ข้อมูลทั้งหมดโดยอัตโนมัติ (<code>loadAllData()</code>)
          </InfoBox>

          <Code lang="flow">{`Browser → Vite Dev Server → React App (SPA)
                                   ↓
                              App.jsx (root state)
                           ↙    ↓    ↘
                      Sidebar  Main  Topbar
                               ↓
                         [Screen Component]
                               ↓
                          supabase.js ──→ Supabase Cloud
                                              ↓
                                         PostgreSQL DB
                                         + Auth
                                         + Realtime WebSocket`}</Code>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── FILES ────────────────────────────────────────── */}
        <div id="dev-sec-files">
          <SectionHead icon="📁" title="ไฟล์และโครงสร้าง"
            sub="ทุกไฟล์อยู่ใน src/ — แต่ละไฟล์มีหน้าที่ชัดเจน" />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>ไฟล์หลัก</div>
          <DevTable
            heads={['ไฟล์', 'หน้าที่', 'หมายเหตุ']}
            rows={[
              ['src/App.jsx', 'Root component — จัดการ auth, routing, global state, handlers ทั้งหมด', 'ไฟล์ที่ใหญ่ที่สุด ~730 บรรทัด'],
              ['src/components.jsx', 'Shared UI components: I icons, Sidebar, Topbar, Modal, ConfirmDialog, CommandMenu, NavModal, DeptPicker, formatters', '~1,500+ บรรทัด'],
              ['src/supabase.js', 'สร้าง Supabase client จาก env vars, export isConfigured', '13 บรรทัด'],
              ['src/data.js', 'Static constants: VEHICLE_TYPES, FUEL_TYPES, DEPARTMENTS (fallback), PURPOSES, CHECKLIST', 'ข้อมูล fallback เมื่อยังไม่มี DB'],
              ['src/index.css', 'Global styles, CSS custom properties, dark mode, responsive, animations', '~2,000+ บรรทัด'],
              ['src/TweaksPanel.jsx', 'Dev panel สำหรับปรับ theme/layout (hidden, เปิดด้วย secret shortcut)', 'Dev tool'],
              ['src/main.jsx', 'Entry point — mount React app เข้า #root', '5 บรรทัด'],
            ]}
          />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>src/screens/ — หน้าจอหลัก</div>
          <DevTable
            heads={['ไฟล์', 'Route', 'บทบาท', 'คำอธิบาย']}
            rows={[
              ['AuthScreen.jsx', '(ไม่ต้อง login)', 'ทุกคน', 'หน้า Login + Register + ปฏิทินสาธารณะ (PublicCalendarModal)'],
              ['Dashboard.jsx', 'dashboard', 'ทุกคน', 'แดชบอร์ดหลัก — สถิติ, ปฏิทิน, timeline'],
              ['BookingScreen.jsx', 'booking', 'ทุกคน', 'ฟอร์มจองรถ — เลือกรถ วันเวลา ปลายทาง GPS'],
              ['CalendarScreen.jsx', 'calendar', 'ทุกคน', 'ปฏิทินการจองทุกรถ รายเดือน/สัปดาห์'],
              ['ReportsScreen.jsx', 'my / reports', 'user=my, manager/admin=reports', 'Export: MyBookingsScreen + ReportsScreen ในไฟล์เดียว'],
              ['CheckinScreen.jsx', 'checkin', 'ทุกคน', 'Check-in (ถ่ายรูป + Checklist + บันทึกไมล์ก่อนขับ) + Check-out (ถ่ายรูปหลังคืน + บันทึกไมล์)'],
              ['CheckinHistoryScreen.jsx', 'checkin-history', 'ทุกคน (user=ของตัวเอง, admin=ทั้งหมด)', 'ประวัติการ Check-in/out พร้อมรูปถ่ายและ Checklist — Admin แก้ไขได้'],
              ['AdminScreen.jsx', 'approvals / members', 'manager/admin', 'Export: ApprovalsScreen + MembersScreen'],
              ['VehiclesScreen.jsx', 'vehicles', 'admin', 'จัดการยานพาหนะ — เพิ่ม แก้ไข ดู history'],
              ['SettingsScreen.jsx', 'settings-*', 'ทุกคน', 'Tabs: บัญชี, แจ้งเตือน, Calendar Sync, แผนก*, คู่มือ*, นักพัฒนา*'],
              ['ManualScreen.jsx', 'help / settings-manual', 'ทุกคน', 'คู่มือในระบบ แยกตามบทบาท user/manager/admin'],
              ['DevGuideScreen.jsx', 'settings-dev', 'admin', 'คู่มือนักพัฒนา (ไฟล์นี้)'],
              ['VoucherScreen.jsx', '(modal)', 'ทุกคน', 'Export: BookingVoucher (พิมพ์ใบจอง) + BookingDetailModal'],
              ['NotificationsScreen.jsx', '(panel)', 'ทุกคน', 'Export: NotificationCenter + generateNotifications()'],
            ]}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── DATABASE ─────────────────────────────────────── */}
        <div id="dev-sec-database">
          <SectionHead icon="🗄️" title="ฐานข้อมูล Supabase"
            sub="PostgreSQL บน Supabase Cloud — ใช้ Row Level Security (RLS) และ Realtime" />

          <InfoBox kind="ok">
            <b>Environment Variables:</b><br/>
            <code>VITE_SUPABASE_URL</code> — URL ของ Supabase project (https://xxxx.supabase.co)<br/>
            <code>VITE_SUPABASE_ANON_KEY</code> — Anon/public key สำหรับ client-side access<br/>
            ตั้งค่าใน <code>.env.local</code> (local) หรือ Vercel Dashboard (production)
          </InfoBox>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tables</div>
          <DevTable
            heads={['Table', 'คอลัมน์หลัก', 'หมายเหตุ']}
            rows={[
              ['profiles', 'id (uuid, FK auth.users), name, emp, dept, role, status, email, phone, joined', 'role: user | manager | admin\nstatus: pending | approved | rejected'],
              ['vehicles', 'id, plate, brand, type, year, fuel, seats, mileage, status, owner, taxDue, insuranceDue, nextService, lastService', 'type: sedan | van | pickup | truck6 | truck3 | crane | bucket | ev\nstatus: available | booked | maintenance | unavailable | urgent'],
              ['bookings', 'id, vehicleId, userId, from, to, purpose, destination, status, approvedBy, rejectReason, mileageOut, mileageIn, rating, passengers, notes, checklist_data (JSONB), photos_before (JSONB), photos_after (JSONB), photos_mileage (JSONB), createdAt', 'checklist_data: {itemId: "pass"|"fail"|"skip"}\nphotos_*: base64 string array (compressed ≤100KB each)'],
              ['departments', 'id, name, sort_order, active', 'active: boolean — ซ่อน/แสดงในฟอร์ม'],
              ['vehicle_history', 'id, vehicleId, at, actor, action, field, oldValue, newValue, note, photo', 'บันทึกการเปลี่ยนแปลงทุก field ของรถ'],
              ['mileage_corrections', 'id, bookingId, vehicleId, userId, systemMileage, claimedMileage, diff, reason, status, approvedBy, approvedAt, rejectReason, requestedAt', 'status: pending | approved | rejected'],
            ]}
          />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Realtime Subscriptions</div>
          <Code lang="js">{`// App.jsx — subscribe ทุก table สำคัญ
const channel = supabase.channel('pea-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings'     }, loadAllData)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles'     }, loadAllData)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles'     }, loadAllData)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'departments'  }, loadAllData)
  .subscribe();`}</Code>

          <InfoBox kind="warn">
            <b>Realtime ต้องเปิดใน Supabase Dashboard:</b> ไปที่ Database → Replication → เปิด Realtime สำหรับ table: <code>bookings</code>, <code>vehicles</code>, <code>profiles</code>, <code>departments</code>
          </InfoBox>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Auth — Supabase Auth</div>
          <DevTable
            heads={['Function', 'ใช้ที่ไหน']}
            rows={[
              ['supabase.auth.signInWithPassword({ email, password })', 'AuthScreen — login'],
              ['supabase.auth.signUp({ email, password })', 'AuthScreen — register (สร้าง profile ใน trigger)'],
              ['supabase.auth.signOut()', 'App.jsx — handleLogout()'],
              ['supabase.auth.getSession()', 'App.jsx — restore session on refresh'],
              ['supabase.auth.onAuthStateChange()', 'App.jsx — detect SIGNED_OUT'],
              ['supabase.auth.updateUser({ password })', 'SettingsScreen — เปลี่ยนรหัสผ่าน'],
              ['supabase.auth.mfa.enroll/challenge/verify/unenroll', 'SettingsScreen — 2FA TOTP (admin only)'],
              ['supabase.auth.signOut({ scope: "others" })', 'SettingsScreen — ออกจากอุปกรณ์อื่น'],
            ]}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── COMPONENTS ───────────────────────────────────── */}
        <div id="dev-sec-components">
          <SectionHead icon="🧩" title="Components & Helpers"
            sub="ทุก shared component อยู่ใน src/components.jsx — import แบบ named export" />

          <Code lang="js">{`import { I, VehicleIcon, StatusPill, Sidebar, Topbar, Modal,
         ConfirmDialog, ToastStack, CommandMenu, NavModal,
         DeptPicker, SearchInput, Select,
         fmtDate, fmtDateTime, fmtTime, fmtNum
} from '../components'`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Icons — I object</div>
          <Code lang="jsx">{`// ใช้งาน: {I.dashboard}, {I.car}, {I.calendar}, {I.plus}, ...
// Icons ทั้งหมดใน I object:
// dashboard, car, calendar, plus, check, x, bell, search,
// users, stats, settings, map, pin, clock, fuel, wrench,
// print, export, edit, trash, filter, list, history, logout,
// arrowRight, arrowLeft, upload, warn, qr, star, starOutline,
// refresh, download, chevronDown, shield, zap, sun, moon,
// chevronUp, help (book-open icon)`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Components API</div>
          <DevTable
            heads={['Component', 'Props หลัก', 'คำอธิบาย']}
            rows={[
              ['<VehicleIcon>', 'type, size=38', 'SVG ไอคอนรถแต่ละประเภท (sedan/van/pickup/...)'],
              ['<StatusPill>', 'status', 'Badge แสดงสถานะ (booked/approved/rejected/...)'],
              ['<Sidebar>', 'route, setRoute, user, counts, onLogout, isOpen, onClose, collapsed, onToggleCollapse', 'Navigation sidebar ซ้าย'],
              ['<Topbar>', 'title, onMenuClick, onBellClick, unreadCount, isDark, onDarkToggle, onLogout, onCmdOpen', 'Top navigation bar'],
              ['<Modal>', 'title, onClose, width, footer, children', 'Modal dialog wrapper'],
              ['<ConfirmDialog>', 'confirm { kind, title, message, confirmLabel, onConfirm, requireReason, requireAck }, onClose', 'Confirm dialog — kind: warn|negative|positive|primary'],
              ['<ToastStack>', 'toasts[]', 'Toast notification stack (corner)'],
              ['<CommandMenu>', 'open, onClose, role, setRoute, onLogout, bookings[], vehicles[], users[], onSelectBooking, onSelectVehicle', 'Ctrl+K command palette'],
              ['<NavModal>', 'booking { coords, destination }, onClose', 'GPS navigation modal — Google/Apple Maps'],
              ['<DeptPicker>', 'value, options[], onChange, placeholder', 'Searchable department dropdown'],
              ['<Select>', 'value, onChange, children (<option>), placeholder, style', 'Custom Command Menu style dropdown — drop-in replacement สำหรับ native <select>. onChange API เหมือนกัน: e.target.value'],
              ['<SearchInput>', 'value, onChange, placeholder, style', 'Search input with icon'],
            ]}
          />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Formatter helpers</div>
          <DevTable
            heads={['Function', 'Input', 'Output ตัวอย่าง']}
            rows={[
              ['fmtDate(str)', 'ISO date string', '"15 ม.ค. 2568"'],
              ['fmtDateTime(str)', 'ISO datetime string', '"15 ม.ค. 2568 09:30"'],
              ['fmtTime(str)', 'ISO datetime string', '"17:00"'],
              ['fmtNum(n)', 'number', '"12,345"'],
            ]}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── ROUTING ──────────────────────────────────────── */}
        <div id="dev-sec-routing">
          <SectionHead icon="🔀" title="Routing System"
            sub="ไม่ใช้ React Router — ใช้ route string ใน App.jsx state" />

          <Code lang="jsx">{`// App.jsx
const [route, setRoute] = React.useState("dashboard");

// เปลี่ยนหน้า:
setRoute("booking")        // → BookingScreen
setRoute("calendar")       // → CalendarScreen
setRoute("settings-noti")  // → SettingsScreen tab="noti"

// Route guard — ป้องกันการเข้าถึงโดยไม่มีสิทธิ์
const allowed = ["dashboard", "booking", "calendar", "my", "checkin", "checkin-history", "help",
  "settings", "settings-account", "settings-noti", "settings-calendar",
  ...(role === "manager" ? ["approvals", "reports"] : []),
  ...(role === "admin"   ? ["approvals", "members", "vehicles", "reports",
                            "settings-depts", "settings-manual", "settings-dev"] : [])
];
if (!allowed.includes(route)) setRoute("dashboard");`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Routes ทั้งหมด</div>
          <DevTable
            heads={['Route', 'Component', 'สิทธิ์']}
            rows={[
              ['dashboard', '<Dashboard>', 'ทุกคน'],
              ['booking', '<BookingScreen>', 'ทุกคน'],
              ['calendar', '<CalendarScreen>', 'ทุกคน'],
              ['my', '<MyBookingsScreen>', 'ทุกคน'],
              ['checkin', '<CheckinScreen>', 'ทุกคน'],
              ['checkin-history', '<CheckinHistoryScreen>', 'ทุกคน'],
              ['help', '<ManualScreen>', 'ทุกคน'],
              ['approvals', '<ApprovalsScreen>', 'manager, admin'],
              ['reports', '<ReportsScreen>', 'manager, admin'],
              ['members', '<MembersScreen>', 'admin'],
              ['vehicles', '<VehiclesScreen>', 'admin'],
              ['settings', '<SettingsScreen tab=account>', 'ทุกคน'],
              ['settings-account', '<SettingsScreen tab=account>', 'ทุกคน'],
              ['settings-noti', '<SettingsScreen tab=noti>', 'ทุกคน'],
              ['settings-calendar', '<SettingsScreen tab=calendar>', 'ทุกคน'],
              ['settings-depts', '<SettingsScreen tab=depts>', 'admin'],
              ['settings-manual', '<SettingsScreen tab=manual>', 'admin'],
              ['settings-dev', '<SettingsScreen tab=dev>', 'admin'],
            ]}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── STATE ────────────────────────────────────────── */}
        <div id="dev-sec-state">
          <SectionHead icon="⚙️" title="State Management"
            sub="ไม่ใช้ Redux หรือ Zustand — ทุก global state อยู่ใน App.jsx และส่งผ่าน props" />

          <DevTable
            heads={['State', 'Type', 'คำอธิบาย']}
            rows={[
              ['currentUser', 'object | null', 'profile ของ user ที่ login อยู่ (จาก profiles table)'],
              ['vehicles', 'array', 'รถยนต์ทั้งหมด'],
              ['bookings', 'array', 'การจองทั้งหมด (เรียงจากใหม่→เก่า)'],
              ['users', 'array', 'profiles ทั้งหมด (ไม่รวม rejected)'],
              ['departments', 'array', 'แผนก (เรียงตาม sort_order)'],
              ['vehicleHistory', 'array', 'ประวัติการเปลี่ยนแปลงรถ'],
              ['mileageCorrections', 'array', 'คำขอแก้ไขเลขไมล์'],
              ['route', 'string', 'หน้าจอปัจจุบัน'],
              ['toasts', 'array', 'Toast notifications'],
              ['confirm', 'object | null', 'ConfirmDialog config'],
              ['sidebarCollapsed', 'boolean', 'Sidebar ย่อ/ขยาย (persist localStorage)'],
              ['isDark', 'boolean', 'Dark mode (persist localStorage)'],
              ['cmdOpen', 'boolean', 'Command menu เปิด/ปิด'],
              ['idleWarning', 'boolean', 'Auto-logout warning dialog'],
            ]}
          />

          <Code lang="jsx">{`// Optimistic UI pattern — อัพเดท local state ก่อน แล้วค่อย sync DB
async function handleApprove(bookingId) {
  // 1. อัพเดท Supabase
  const { error } = await supabase.from('bookings')
    .update({ status: "approved" }).eq('id', bookingId);
  // 2. อัพเดท local state ทันที (ไม่ต้อง reload)
  if (!error) setBookings(bookings.map(x =>
    x.id === bookingId ? { ...x, status: "approved" } : x
  ));
}

// pushToast helper
pushToast({ kind: "ok",   title: "สำเร็จ", body: "รายละเอียด" })
pushToast({ kind: "warn", title: "เตือน" })
// kind: ok | warn | error | info
// auto-dismiss หลัง 3.5 วินาที`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Auto-logout (Idle)</div>
          <Code lang="js">{`const IDLE_MS = 30 * 60 * 1000;  // 30 นาที
const WARN_MS = 2 * 60 * 1000;   // เตือน 2 นาทีก่อน logout

// Events ที่ reset timer: mousemove, mousedown, keydown, touchstart, scroll
// ทุก event ใช้ { passive: true } เพื่อ performance`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Mileage Calculation Pattern</div>
          <InfoBox kind="info">
            <Code lang="js">{`// เลขไมล์ปัจจุบัน = max(mileageIn) จาก completed trips
// fallback เป็น v.mileage หาก ยังไม่มีการเดินทาง
// handleCheckOut อัพเดท vehicles.mileage = mileageIn อัตโนมัติ`}</Code>
          </InfoBox>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── STYLING ──────────────────────────────────────── */}
        <div id="dev-sec-styling">
          <SectionHead icon="🎨" title="CSS & Theming"
            sub="ใช้ CSS Custom Properties ทั้งหมด — ไม่มี CSS framework" />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>CSS Variables หลัก</div>
          <Code lang="css">{`/* Colors — เปลี่ยนได้ผ่าน TweaksPanel (theme) */
--pea-purple        /* สีหลัก: #6E2A8C (default) */
--pea-purple-deep   /* เข้มขึ้น: #4D1F66 */
--pea-purple-50     /* อ่อนมาก: #F5EEF8 */
--pea-purple-100    /* อ่อน: #E9DBF0 */
--pea-orange        /* accent: #F37021 */
--pea-orange-light  /* #FAA61A */

/* Semantic */
--ok       --ok-bg      /* สีสำเร็จ (เขียว) */
--warn     --warn-bg    /* สีเตือน (เหลือง) */
--danger   --danger-bg  /* สีอันตราย (แดง) */
--info     --info-bg    /* สีข้อมูล (ฟ้า) */

/* Surfaces */
--bg          /* พื้นหลังหลัก */
--surface     /* การ์ด, input */
--surface-2   /* secondary surface */
--border      /* เส้นขอบ */

/* Text */
--text     --text-2     --text-3   /* เข้ม → จาง */

/* Layout */
--sidebar-w   /* 240px (ขยาย) | 68px (ย่อ) */
--topbar-h    /* 56px */`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Dark Mode</div>
          <Code lang="js">{`// เปิด dark mode — ใส่ attribute บน <html>
document.documentElement.dataset.dark = '1';
// ปิด
document.documentElement.dataset.dark = '';

// CSS: override ด้วย [data-dark="1"] selector
[data-dark="1"] { --bg: #0f0f14; --surface: #18181f; ... }`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Utility Classes</div>
          <DevTable
            heads={['Class', 'คำอธิบาย']}
            rows={[
              ['.col.gap-1 / .gap-2 / .gap-3', 'flex-direction: column + gap'],
              ['.card / .card-pad', 'การ์ด + padding 18px'],
              ['.btn / .btn.primary / .btn.ghost / .btn.danger / .btn.sm', 'ปุ่มแบบต่างๆ'],
              ['.input', 'Input, select field'],
              ['.field / .field-lbl', 'Form field wrapper + label'],
              ['.tabs / .tab / .tab.active', 'Tab navigation'],
              ['.table', 'Styled table'],
              ['.pill / .pill.done / .pill.booked / ...', 'Status badge'],
              ['.text-sm / .text-xs', 'ขนาด font 13px / 11px'],
              ['.muted', 'color: var(--text-3)'],
              ['.avatar / .avatar.lg', 'วงกลมตัวอักษรชื่อ'],
              ['.plate', 'ป้ายทะเบียนรถ (monospace, bordered)'],
              ['.modal-overlay / .modal-overlay.center', 'Modal backdrop — .center = center align (mobile)'],
              ['.modal / .modal-header / .modal-body / .modal-foot', 'Modal structure'],
              ['.switch / .switch.on', 'Toggle switch'],
              ['.divider', 'Horizontal rule'],
            ]}
          />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Sidebar collapsed</div>
          <Code lang="css">{`/* App.jsx ใส่ class บน .app */
<div className={"app" + (sidebarCollapsed ? " sidebar-min" : "")}>

/* CSS: */
.app.sidebar-min { --sidebar-w: 68px }
.app.sidebar-min .nav-text { display: none }  /* ซ่อนข้อความ */
.app.sidebar-min .sidebar-logo-text { display: none }`}</Code>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

        {/* ── ENV & DEPLOY ─────────────────────────────────── */}
        <div id="dev-sec-env">
          <SectionHead icon="🔑" title="Environment & Deploy"
            sub="ตั้งค่า env vars แล้ว deploy บน Vercel" />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Local Development</div>
          <Code lang="bash">{`# 1. Clone
git clone https://github.com/menzkub/EasyDrive.git
cd EasyDrive && npm install

# 2. สร้าง .env.local
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# 3. รัน
npm run dev        # → http://localhost:5173

# 4. Build
npm run build      # → dist/
npm run preview    # ทดสอบ production build`}</Code>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Vercel Deploy</div>
          <Code lang="bash">{`# Auto-deploy จาก GitHub main branch
# Vercel Settings → Environment Variables:
#   VITE_SUPABASE_URL  =  https://xxxx.supabase.co
#   VITE_SUPABASE_ANON_KEY  =  eyJ...
#
# Build command: npm run build
# Output directory: dist
# Framework: Vite`}</Code>

          <InfoBox kind="warn">
            <b>ANON KEY เป็น public key</b> — ปลอดภัยที่จะใส่ใน frontend เพราะ Supabase RLS ควบคุมสิทธิ์ระดับ row<br/>
            อย่าใส่ <code>service_role</code> key ใน frontend เด็ดขาด
          </InfoBox>

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>Dependencies หลัก</div>
          <DevTable
            heads={['Package', 'Version', 'ใช้ทำอะไร']}
            rows={[
              ['react', '18.x', 'UI library'],
              ['react-dom', '18.x', 'DOM renderer'],
              ['@supabase/supabase-js', '2.x', 'Supabase client (Auth, DB, Realtime)'],
              ['vite', '5.x', 'Build tool + dev server (เร็วมาก)'],
              ['@vitejs/plugin-react', '4.x', 'React JSX transform สำหรับ Vite'],
            ]}
          />

          <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 18 }}>ฟีเจอร์พิเศษที่น่าสังเกต</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { title: 'Command Menu (Ctrl+K)', desc: 'เปิดด้วย Ctrl+K หรือ Cmd+K — ค้นหาทุกอย่างในระบบ: หน้า, การจอง, รถ, ผู้ใช้', file: 'components.jsx → CommandMenu' },
              { title: 'NavModal (GPS)', desc: 'ตรวจ GPS ผู้ใช้, คำนวณระยะทาง Haversine, สร้าง deep link Google/Apple Maps', file: 'components.jsx → NavModal' },
              { title: 'TweaksPanel', desc: 'Panel ปรับ theme (สี, layout) — hidden by default, เปิดผ่าน secret area มุมขวาล่าง', file: 'TweaksPanel.jsx' },
              { title: 'PublicCalendar', desc: 'ดูปฏิทินโดยไม่ต้อง login — แสดงเฉพาะข้อมูล public (plate, เวลา, สถานะ)', file: 'AuthScreen.jsx → PublicCalendarModal' },
              { title: 'ประวัติ Check-in/out', desc: 'หน้า checkin-history แสดงรูปถ่ายก่อน/หลัง, Checklist ผ่าน/ไม่ผ่าน/ข้าม, export CSV. Admin แก้ไขข้อมูลได้พร้อม 2-step confirm แสดง diff', file: 'CheckinHistoryScreen.jsx' },
              { title: 'Photo Compression', desc: 'รูปถ่ายบีบอัดด้วย Canvas API ก่อนเก็บ: max 900px, JPEG 72%, ~100KB/รูป. เก็บเป็น base64 ใน JSONB column', file: 'CheckinScreen.jsx → PhotoCapture' },
              { title: 'QR Deep Link', desc: 'QR บนใบจองเข้ารหัสเป็น URL (origin/?booking=ID). App.jsx อ่าน ?booking= param หลัง login และแสดง VoucherModal โดยอัตโนมัติ จากนั้น clean URL', file: 'VoucherScreen.jsx + App.jsx' },
              { title: 'Custom Select', desc: 'Select component แทน native <select> ทั้งระบบ — parse <option> children ผ่าน React.Children.toArray, dropdown แบบ Command Menu, same onChange API', file: 'components.jsx → Select' },
            ].map(({ title, desc, file }) => (
              <div key={title} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 6 }}>{desc}</div>
                <code style={{ fontSize: 11, color: 'var(--pea-purple)', background: 'var(--pea-purple-50)', padding: '2px 6px', borderRadius: 4 }}>{file}</code>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
