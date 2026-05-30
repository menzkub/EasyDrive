import React from 'react'

const CHANGELOG = [
  {
    version: '1.1.0',
    date: '30 พ.ค. 2569',
    changes: [
      { icon: '🎨', text: 'Sidebar สีม่วง gradient เข้ม (light + dark mode)' },
      { icon: '🎨', text: 'Dashboard header: gradient text + วันที่เด่นชัด' },
      { icon: '⛽', text: 'ราคาน้ำมัน admin-editable + PTT real-time sync' },
      { icon: '📊', text: 'FuelCostReport: รายละเอียดการคำนวณ (admin-only)' },
      { icon: '📋', text: 'ประวัติการซิงค์ราคาน้ำมัน + maintenance log' },
      { icon: '🐛', text: 'แก้ไข blank screen bugs ทุก tab (scope bug)' },
      { icon: '📅', text: 'Modern DateTimePicker (ปฏิทินไทย)' },
      { icon: '↕️', text: 'Demo bookings + DevCard: ยุบ/ขยาย' },
      { icon: '📖', text: 'คู่มือ: สูตรคำนวณค่าน้ำมัน + อัตราการใช้งาน (admin)' },
      { icon: '📱', text: 'แก้ไข mobile member card click (AdminScreen)' },
    ],
  },
  {
    version: '1.0.0',
    date: 'พ.ค. 2569',
    changes: [
      { icon: '🚗', text: 'ระบบจองรถ, อนุมัติ, Check-in/out' },
      { icon: '👥', text: 'จัดการสมาชิกและแผนก' },
      { icon: '📊', text: 'รายงาน, ปฏิทิน, คู่มือใช้งาน' },
      { icon: '🔔', text: 'ระบบแจ้งเตือนและ Command Menu' },
      { icon: '⚙️', text: 'ตั้งค่าระบบ + โหมดบำรุงรักษา' },
      { icon: '🔐', text: 'Supabase Auth + RLS multi-tenant' },
      { icon: '🌙', text: 'Dark mode + Responsive (mobile/tablet)' },
    ],
  },
];

const DEVCARD_KEY = 'easydrive-devcard';

export const DEVCARD_DEFAULTS = {
  show: true,
  name: 'ธนพล มณีกุล',
  position: 'พนักงานช่าง ระดับ 5',
  dept: 'แผนกมิเตอร์และหม้อแปลง',
  org: 'การไฟฟ้าส่วนภูมิภาค สาขาฝาง',
  version: '1.1.0',
  detail1Label: 'ฐานข้อมูล',
  detail1Value: 'PostgreSQL (Supabase) · RLS Multi-tenant',
  detail2Label: 'Tech Stack',
  detail2Value: 'React 18 · Vite 5 · Supabase · Vercel',
  detail3Label: 'การเชื่อมต่อ API',
  detail3Value: 'PTT Fuel Price API · Thai Oil Price · Real-time Sync',
  footer: 'พัฒนาเพื่อใช้งานภายใน การไฟฟ้าส่วนภูมิภาค (PEA)',
};

export function loadDevCard() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEVCARD_KEY) || 'null');
    return saved ? { ...DEVCARD_DEFAULTS, ...saved } : { ...DEVCARD_DEFAULTS };
  } catch { return { ...DEVCARD_DEFAULTS }; }
}

export function saveDevCard(cfg) {
  localStorage.setItem(DEVCARD_KEY, JSON.stringify(cfg));
}

const POS_KEY = 'easydrive-devcard-pos';
function loadPos() {
  try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); }
  catch { return null; }
}

// ─── Floating button + popup card (draggable) ─────────────────────────
export function DevCardButton() {
  const [cfg, setCfg] = React.useState(loadDevCard);
  const [open, setOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() => document.documentElement.dataset.dark === '1');
  const [expanded, setExpanded] = React.useState(false);
  const [showChangelog, setShowChangelog] = React.useState(false);
  const [pos, setPos] = React.useState(loadPos);
  const [dragging, setDragging] = React.useState(false);
  const btnRef = React.useRef(null);
  const drag = React.useRef({ active: false, moved: false, ox: 0, oy: 0 });

  React.useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.dataset.dark === '1'));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-dark'] });
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    const onUpdate = () => setCfg(loadDevCard());
    window.addEventListener('devcard-updated', onUpdate);
    return () => window.removeEventListener('devcard-updated', onUpdate);
  }, []);

  // Convert default bottom/right position to absolute left/top on first drag
  function resolvePos() {
    if (pos) return pos;
    const btn = btnRef.current;
    if (!btn) return { left: window.innerWidth - 200, top: window.innerHeight - 112 };
    const r = btn.getBoundingClientRect();
    return { left: Math.round(r.left), top: Math.round(r.top) };
  }

  // Clamp within viewport
  function clamp(p) {
    const btn = btnRef.current;
    const w = btn ? btn.offsetWidth  : 160;
    const h = btn ? btn.offsetHeight : 40;
    return {
      left: Math.max(8, Math.min(window.innerWidth  - w - 8, p.left)),
      top:  Math.max(8, Math.min(window.innerHeight - h - 8, p.top)),
    };
  }

  function savePos(p) { localStorage.setItem(POS_KEY, JSON.stringify(p)); }

  // ── Mouse drag ────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    const p = resolvePos();
    drag.current = { active: true, moved: false, ox: e.clientX - p.left, oy: e.clientY - p.top };
    setPos(p);
    setDragging(true);

    function onMove(e) {
      if (!drag.current.active) return;
      const np = clamp({ left: e.clientX - drag.current.ox, top: e.clientY - drag.current.oy });
      if (Math.abs(np.left - p.left) > 4 || Math.abs(np.top - p.top) > 4) drag.current.moved = true;
      setPos(np);
    }
    function onUp() {
      drag.current.active = false;
      setDragging(false);
      setPos(cur => { if (cur) savePos(cur); return cur; });
      if (!drag.current.moved) setOpen(o => !o);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Touch drag ───────────────────────────────────────────────────
  function onTouchStart(e) {
    const t = e.touches[0];
    const p = resolvePos();
    drag.current = { active: true, moved: false, ox: t.clientX - p.left, oy: t.clientY - p.top };
    setPos(p);
  }
  function onTouchMove(e) {
    if (!drag.current.active) return;
    e.preventDefault();
    const t = e.touches[0];
    const np = clamp({ left: t.clientX - drag.current.ox, top: t.clientY - drag.current.oy });
    if (Math.abs(np.left - (pos?.left || 0)) > 4 || Math.abs(np.top - (pos?.top || 0)) > 4) drag.current.moved = true;
    setPos(np);
  }
  function onTouchEnd() {
    drag.current.active = false;
    setPos(cur => { if (cur) savePos(cur); return cur; });
    if (!drag.current.moved) setOpen(o => !o);
  }

  // ── Popup position: smart-place near the button ───────────────────
  function popupStyle() {
    const POPUP_W = 360, POPUP_H = 500;
    const vw = window.innerWidth, vh = window.innerHeight;
    const btn = btnRef.current;
    const bw = btn ? btn.offsetWidth  : 160;
    const bh = btn ? btn.offsetHeight : 40;

    let bl, bt; // button left/top
    if (pos) { bl = pos.left; bt = pos.top; }
    else { bl = vw - bw - 16; bt = vh - bh - 72; }

    // Prefer above the button; fall back to below
    let top = bt - POPUP_H - 8;
    if (top < 8) top = bt + bh + 8;
    // Prefer align-right of button; clamp
    let left = bl + bw - POPUP_W;
    if (left < 8) left = 8;
    if (left + POPUP_W > vw - 8) left = vw - POPUP_W - 8;

    return { position: 'fixed', left, top, zIndex: 1000, width: POPUP_W, maxWidth: `calc(100vw - 16px)` };
  }

  if (isDark || !cfg.show) return null;
  const firstName = (cfg.name || '').split(' ')[0] || cfg.name;
  const details = [
    { icon: '🗄️', label: cfg.detail1Label, value: cfg.detail1Value },
    { icon: '⚙️', label: cfg.detail2Label, value: cfg.detail2Value },
    { icon: '🔗', label: cfg.detail3Label, value: cfg.detail3Value },
  ].filter(d => d.value);

  // Button position style
  const btnStyle = pos
    ? { position: 'fixed', left: pos.left, top: pos.top, bottom: 'auto', right: 'auto' }
    : { position: 'fixed', bottom: 72, right: 16 };

  return (
    <>
      {/* Floating pill button */}
      <button
        ref={btnRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          ...btnStyle,
          zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: 'white', border: 'none', borderRadius: 999,
          padding: '7px 14px 7px 7px',
          cursor: dragging ? 'grabbing' : 'grab',
          fontSize: 12.5, fontWeight: 600,
          boxShadow: dragging
            ? '0 12px 32px rgba(109,40,217,0.55)'
            : '0 4px 20px rgba(109,40,217,0.38)',
          fontFamily: 'var(--font-sans)',
          userSelect: 'none',
          transition: dragging ? 'box-shadow 0.1s' : 'box-shadow 0.2s',
          transform: dragging ? 'scale(1.04)' : '',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)', display: 'grid',
          placeItems: 'center', fontSize: 11, fontFamily: 'monospace', flexShrink: 0,
          pointerEvents: 'none',
        }}>{'</>'}</div>
        <span style={{ pointerEvents: 'none' }}>พัฒนาโดย {firstName}</span>
        <span style={{ fontSize: 13, pointerEvents: 'none' }}>✨</span>
      </button>

      {/* Popup card */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => { setOpen(false); setExpanded(false); setShowChangelog(false); }}/>
          <div style={{ ...popupStyle(), borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(109,40,217,0.12)', animation: 'devcard-in 0.18s ease', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <style>{`@keyframes devcard-in { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:none; } }`}</style>

            {/* Purple header */}
            <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 55%, #5b21b6 100%)', padding: '20px 20px 22px', color: 'white', position: 'relative' }}>
              <button onClick={() => { setOpen(false); setExpanded(false); setShowChangelog(false); }}
                style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'white', fontSize: 14 }}>✕</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 15 }}>✨</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.82 }}>Developed By</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15, marginBottom: 4 }}>{cfg.name}</div>
              <div style={{ fontSize: 13, opacity: 0.88, marginBottom: 2 }}>{cfg.position}</div>
              <div style={{ fontSize: 12.5, opacity: 0.72 }}>{cfg.dept}</div>
              {cfg.org && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 13, background: 'rgba(255,255,255,0.14)', borderRadius: 999, padding: '5px 12px', fontSize: 11.5, fontWeight: 600 }}>
                  <span>📍</span>{cfg.org}
                </div>
              )}
            </div>

            {/* White body */}
            <div style={{ background: 'var(--surface)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={() => { setExpanded(false); setShowChangelog(false); }}
                  style={{ flex: 1, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: !showChangelog ? '#7c3aed' : 'var(--text-3)', borderBottom: !showChangelog ? '2px solid #7c3aed' : '2px solid transparent', fontFamily: 'var(--font-sans)', transition: 'color 0.15s' }}>
                  ⚙️ รายละเอียด
                </button>
                <button
                  onClick={() => setShowChangelog(true)}
                  style={{ flex: 1, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: showChangelog ? '#7c3aed' : 'var(--text-3)', borderBottom: showChangelog ? '2px solid #7c3aed' : '2px solid transparent', fontFamily: 'var(--font-sans)', transition: 'color 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  📋 ประวัติอัปเดต
                  <span style={{ background: '#7c3aed', color: 'white', borderRadius: 999, padding: '1px 6px', fontSize: 9.5, fontWeight: 700 }}>{CHANGELOG.length}</span>
                </button>
              </div>

              {/* Detail tab */}
              {!showChangelog && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <button onClick={() => setExpanded(e => !e)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                    <span>รายละเอียดเพิ่มเติม</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#7c3aed', color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>รุ่น {cfg.version}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{expanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expanded && details.length > 0 && details.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--pea-purple-50)', display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{d.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 3 }}>{d.label}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{d.value}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px 11px', fontSize: 10.5, color: 'var(--text-3)' }}>
                    <span style={{ fontWeight: 600 }}>เวอร์ชัน {cfg.version}</span>
                    <span style={{ textAlign: 'right', maxWidth: '65%', lineHeight: 1.45 }}>{cfg.footer}</span>
                  </div>
                </div>
              )}

              {/* Changelog tab */}
              {showChangelog && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                  {CHANGELOG.map((rel, ri) => (
                    <div key={ri} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ background: ri === 0 ? '#7c3aed' : 'var(--surface-2)', color: ri === 0 ? 'white' : 'var(--text-2)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                          v{rel.version}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>📅 {rel.date}</span>
                        {ri === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, background: '#dcfce7', color: '#16a34a', borderRadius: 999, padding: '2px 7px', fontWeight: 700 }}>ล่าสุด</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {rel.changes.map((c, ci) => (
                          <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: ci < rel.changes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>{c.icon}</span>
                            <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{c.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', paddingTop: 4 }}>
                    พัฒนาด้วย ❤️ โดย Claude · Anthropic
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Settings form (admin) ────────────────────────────────────────────
export function DevCardSettings({ pushToast }) {
  const [cfg, setCfg] = React.useState(loadDevCard);
  const [showDetails, setShowDetails] = React.useState(false);

  function save() {
    saveDevCard(cfg);
    window.dispatchEvent(new Event('devcard-updated'));
    pushToast?.({ kind: 'ok', title: 'บันทึกข้อมูลนักพัฒนาแล้ว' });
  }

  function reset() {
    setCfg({ ...DEVCARD_DEFAULTS });
    pushToast?.({ kind: 'ok', title: 'รีเซ็ตเป็นค่าเริ่มต้นแล้ว' });
  }

  const F = ({ label, k, placeholder = '', area = false }) => (
    <div className="field">
      <label className="field-lbl">{label}</label>
      {area
        ? <textarea className="input" value={cfg[k] || ''} rows={2} placeholder={placeholder}
            style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            onChange={e => setCfg({ ...cfg, [k]: e.target.value })}/>
        : <input className="input" value={cfg[k] || ''} placeholder={placeholder}
            onChange={e => setCfg({ ...cfg, [k]: e.target.value })}/>
      }
    </div>
  );

  const firstName = (cfg.name || '').split(' ')[0] || 'นักพัฒนา';

  return (
    <div style={{ paddingTop: 14 }}>

      {/* Live preview */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)',
        borderRadius: 14, padding: '18px 20px 16px', marginBottom: 20, color: 'white',
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.8, marginBottom: 8 }}>
            ✨ DEVELOPED BY
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2 }}>{cfg.name || '(ชื่อ-นามสกุล)'}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{cfg.position}</div>
          <div style={{ fontSize: 11.5, opacity: 0.7 }}>{cfg.dept}</div>
          {cfg.org && (
            <div style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.14)', borderRadius: 999, padding: '4px 10px', fontSize: 11,
            }}>📍 {cfg.org}</div>
          )}
        </div>
        {/* Button preview */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.14)', borderRadius: 999,
          padding: '6px 12px 6px 7px', fontSize: 11.5, fontWeight: 600,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(0,0,0,0.22)', display: 'grid', placeItems: 'center',
            fontFamily: 'monospace', fontSize: 9,
          }}>{'</>'}</div>
          <span>พัฒนาโดย {firstName}</span>
          <span>✨</span>
        </div>
      </div>

      {/* Toggle show */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10,
        marginBottom: 16, border: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>แสดงปุ่มนักพัฒนา</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>ปุ่มมุมขวาล่าง — ผู้ใช้ทุกคนมองเห็น</div>
        </div>
        <button className={"switch" + (cfg.show ? " on" : "")} onClick={() => setCfg({ ...cfg, show: !cfg.show })}/>
      </div>

      {/* Main fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
        <F label="ชื่อ-นามสกุล *" k="name" placeholder="ธนพล มณีกุล"/>
        <F label="ตำแหน่ง / ระดับ" k="position" placeholder="พนักงานช่าง ระดับ 5"/>
        <F label="แผนก" k="dept" placeholder="แผนกมิเตอร์และหม้อแปลง"/>
        <F label="หน่วยงาน" k="org" placeholder="การไฟฟ้าส่วนภูมิภาค สาขาฝาง"/>
        <F label="เวอร์ชัน" k="version" placeholder="1.0.0"/>
      </div>

      <div className="divider" style={{ margin: '16px 0 12px' }}/>
      <button
        type="button"
        onClick={() => setShowDetails(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8,
          padding: '9px 12px', cursor: 'pointer', marginBottom: showDetails ? 10 : 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          รายละเอียดเพิ่มเติม (ส่วนขยาย)
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ color: 'var(--text-3)', transition: 'transform 0.2s', transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {showDetails && <>
        {[
          ['detail1', 'รายละเอียดที่ 1 🗄️'],
          ['detail2', 'รายละเอียดที่ 2 ⚙️'],
          ['detail3', 'รายละเอียดที่ 3 🔗'],
        ].map(([p, lbl]) => (
          <div key={p} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-lbl">{lbl} — หัวข้อ</label>
              <input className="input" value={cfg[p + 'Label'] || ''}
                onChange={e => setCfg({ ...cfg, [p + 'Label']: e.target.value })}/>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-lbl">เนื้อหา</label>
              <input className="input" value={cfg[p + 'Value'] || ''} placeholder="(ว่างเปล่า = ไม่แสดง)"
                onChange={e => setCfg({ ...cfg, [p + 'Value']: e.target.value })}/>
            </div>
          </div>
        ))}
        <div className="divider" style={{ margin: '12px 0' }}/>
      </>}

      <F label="ข้อความท้ายการ์ด" k="footer" placeholder="พัฒนาเพื่อใช้งานภายใน ..." area/>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
        <button className="btn ghost" onClick={reset}>รีเซ็ตค่าเริ่มต้น</button>
        <button className="btn primary" onClick={save}>💾 บันทึก</button>
      </div>
    </div>
  );
}
