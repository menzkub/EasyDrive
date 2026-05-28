import React from 'react'
import { I, fmtDate } from '../components'
import { DEPARTMENTS } from '../data'
import { supabase } from '../supabase'

function SettingsScreen({ currentUser, bookings, vehicles, onUpdateProfile, pushToast }) {
  const [tab, setTab] = React.useState("account");

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <h2 className="mt-0" style={{margin:0}}>การตั้งค่าและการเชื่อมต่อ</h2>
        <p className="sub" style={{margin:'2px 0 0'}}>จัดการบัญชี ความปลอดภัย และการแจ้งเตือน</p>
      </div>
      <div className="card card-pad">
        <div className="tabs">
          <button className={"tab" + (tab === "account" ? " active" : "")} onClick={() => setTab("account")}>👤 บัญชี</button>
          <button className={"tab" + (tab === "noti" ? " active" : "")} onClick={() => setTab("noti")}>🔔 การแจ้งเตือน</button>
          <button className={"tab" + (tab === "calendar" ? " active" : "")} onClick={() => setTab("calendar")}>📅 Calendar Sync</button>
        </div>
        {tab === "account"  && <AccountSettings currentUser={currentUser} onUpdateProfile={onUpdateProfile} pushToast={pushToast}/>}
        {tab === "noti"     && <NotificationSettings pushToast={pushToast}/>}
        {tab === "calendar" && <CalendarSync currentUser={currentUser} bookings={bookings} vehicles={vehicles}/>}
      </div>
    </div>
  );
}

// ─── Account Settings ──────────────────────────────────────────────
function AccountSettings({ currentUser, onUpdateProfile, pushToast }) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({
    name: currentUser.name || '',
    dept: currentUser.dept || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
  });
  const [saving, setSaving] = React.useState(false);

  const [showPw, setShowPw] = React.useState(false);
  const [pwForm, setPwForm] = React.useState({ newPw: '', confirmPw: '' });
  const [pwLoading, setPwLoading] = React.useState(false);
  const [pwErr, setPwErr] = React.useState('');

  const [show2FA, setShow2FA] = React.useState(false);
  const [mfaFactors, setMfaFactors] = React.useState([]);
  const [mfaEnrolling, setMfaEnrolling] = React.useState(false);
  const [mfaQr, setMfaQr] = React.useState(null);
  const [mfaSecret, setMfaSecret] = React.useState('');
  const [mfaFactorId, setMfaFactorId] = React.useState('');
  const [mfaChallengeId, setMfaChallengeId] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaErr, setMfaErr] = React.useState('');
  const [mfaLoading, setMfaLoading] = React.useState(false);

  const [showDevices, setShowDevices] = React.useState(false);
  const [sessionInfo, setSessionInfo] = React.useState(null);

  React.useEffect(() => {
    loadMfa();
    loadSession();
  }, []);

  async function loadMfa() {
    const { data } = await supabase.auth.mfa.listFactors();
    setMfaFactors(data?.totp || []);
  }

  async function loadSession() {
    const { data: { session } } = await supabase.auth.getSession();
    setSessionInfo(session);
  }

  async function saveProfile() {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: form.name.trim(),
      dept: form.dept,
      email: form.email.trim(),
      phone: form.phone.trim(),
    }).eq('id', currentUser.id);
    setSaving(false);
    if (error) { pushToast({ type: 'error', msg: 'เกิดข้อผิดพลาด: ' + error.message }); return; }
    onUpdateProfile({ ...currentUser, ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    setEditing(false);
    pushToast({ type: 'ok', msg: 'บันทึกโปรไฟล์เรียบร้อยแล้ว' });
  }

  async function changePassword() {
    setPwErr('');
    if (pwForm.newPw.length < 6) { setPwErr('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (pwForm.newPw !== pwForm.confirmPw) { setPwErr('รหัสผ่านไม่ตรงกัน'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setPwLoading(false);
    if (error) { setPwErr(error.message); return; }
    setShowPw(false);
    setPwForm({ newPw: '', confirmPw: '' });
    pushToast({ type: 'ok', msg: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
  }

  async function startEnroll2FA() {
    setMfaErr('');
    setMfaLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'PEA FANG Authenticator' });
    setMfaLoading(false);
    if (error) { setMfaErr(error.message); return; }
    setMfaQr(data.totp.qr_code);
    setMfaSecret(data.totp.secret);
    setMfaFactorId(data.id);
    setMfaEnrolling(true);
    const { data: c } = await supabase.auth.mfa.challenge({ factorId: data.id });
    setMfaChallengeId(c.id);
  }

  async function verify2FA() {
    setMfaErr('');
    if (!mfaCode.trim()) { setMfaErr('กรุณากรอกรหัส OTP'); return; }
    setMfaLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode.trim() });
    setMfaLoading(false);
    if (error) { setMfaErr('รหัสไม่ถูกต้อง กรุณาลองใหม่'); return; }
    setMfaEnrolling(false);
    setMfaQr(null);
    setMfaCode('');
    await loadMfa();
    pushToast({ type: 'ok', msg: 'เปิดใช้งาน 2FA เรียบร้อยแล้ว' });
  }

  async function disable2FA(factorId) {
    setMfaLoading(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setMfaLoading(false);
    if (error) { pushToast({ type: 'error', msg: error.message }); return; }
    await loadMfa();
    pushToast({ type: 'ok', msg: 'ปิดใช้งาน 2FA แล้ว' });
  }

  async function signOutAllDevices() {
    await supabase.auth.signOut({ scope: 'others' });
    pushToast({ type: 'ok', msg: 'ออกจากระบบอุปกรณ์อื่นทั้งหมดแล้ว' });
  }

  const verified2FA = mfaFactors.filter(f => f.status === 'verified');

  return (
    <div className="col gap-3">
      {/* Profile card */}
      <div style={{display:'flex', gap:16, alignItems:'center', padding:'16px 18px', background:'linear-gradient(135deg, var(--pea-purple-50), var(--pea-orange-50))', borderRadius:12}}>
        <div className="avatar lg" style={{width:64, height:64, fontSize:24, background:'var(--pea-purple)'}}>{currentUser.name.charAt(0)}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:18, fontWeight:700}}>{currentUser.name}</div>
          <div className="text-sm muted">{currentUser.role === "admin" ? "ผู้ดูแลระบบ" : currentUser.role === "manager" ? "ผู้จัดการ" : "ผู้ใช้งาน"} · {currentUser.dept}</div>
          <div className="text-xs muted" style={{marginTop:2}}>รหัส {currentUser.emp} · สมาชิกตั้งแต่ {fmtDate(currentUser.joined)}</div>
        </div>
        {!editing
          ? <button className="btn ghost" onClick={() => setEditing(true)}>{I.edit} แก้ไขโปรไฟล์</button>
          : <div style={{display:'flex', gap:8}}>
              <button className="btn ghost" onClick={() => { setEditing(false); setForm({ name: currentUser.name, dept: currentUser.dept, email: currentUser.email||'', phone: currentUser.phone||'' }); }}>ยกเลิก</button>
              <button className="btn primary" onClick={saveProfile} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            </div>
        }
      </div>

      {/* Editable fields */}
      {editing ? (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div className="field">
            <label className="field-lbl">ชื่อ-นามสกุล *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-lbl">แผนก</label>
            <select className="input" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-lbl">อีเมลติดต่อ</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="example@pea.co.th"/>
          </div>
          <div className="field">
            <label className="field-lbl">เบอร์โทรศัพท์</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08x-xxx-xxxx"/>
          </div>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div className="field">
            <label className="field-lbl">อีเมลติดต่อ</label>
            <input className="input" value={currentUser.email || '-'} readOnly style={{background:'var(--surface-2)'}}/>
          </div>
          <div className="field">
            <label className="field-lbl">เบอร์โทรศัพท์</label>
            <input className="input" value={currentUser.phone || '-'} readOnly style={{background:'var(--surface-2)'}}/>
          </div>
        </div>
      )}

      <div className="divider"></div>

      {/* Security section */}
      <h3 style={{fontSize:14, fontWeight:600, margin:0}}>ความปลอดภัย</h3>

      {/* Change password */}
      <div>
        <button className="btn ghost" style={{justifyContent:'flex-start', width:'100%', textAlign:'left', padding:'14px 16px'}}
          onClick={() => { setShowPw(!showPw); setPwErr(''); setPwForm({ newPw:'', confirmPw:'' }); }}>
          🔒 เปลี่ยนรหัสผ่าน
          <span style={{marginLeft:'auto', color:'var(--text-3)'}}>{showPw ? I.chevronUp || '▲' : I.arrowRight}</span>
        </button>
        {showPw && (
          <div style={{padding:'16px', background:'var(--surface-2)', borderRadius:'0 0 10px 10px', border:'1px solid var(--border)', borderTop:'none'}}>
            <div className="col gap-2">
              <div className="field">
                <label className="field-lbl">รหัสผ่านใหม่</label>
                <input className="input" type="password" value={pwForm.newPw} onChange={e => setPwForm({...pwForm, newPw: e.target.value})} placeholder="อย่างน้อย 6 ตัวอักษร"/>
              </div>
              <div className="field">
                <label className="field-lbl">ยืนยันรหัสผ่านใหม่</label>
                <input className="input" type="password" value={pwForm.confirmPw} onChange={e => setPwForm({...pwForm, confirmPw: e.target.value})} placeholder="กรอกรหัสผ่านซ้ำ"/>
              </div>
              {pwErr && <div style={{color:'var(--danger)', fontSize:13}}>{pwErr}</div>}
              <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                <button className="btn ghost" onClick={() => setShowPw(false)}>ยกเลิก</button>
                <button className="btn primary" onClick={changePassword} disabled={pwLoading}>{pwLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2FA — admin only */}
      {currentUser.role !== 'admin' ? null : <div>
        <button className="btn ghost" style={{justifyContent:'flex-start', width:'100%', textAlign:'left', padding:'14px 16px'}}
          onClick={() => { setShow2FA(!show2FA); setMfaEnrolling(false); setMfaErr(''); }}>
          <span>🛡️ การยืนยันตัวตนสองชั้น (2FA)</span>
          {verified2FA.length > 0
            ? <span className="pill done" style={{marginLeft:8}}>เปิดใช้งาน</span>
            : <span className="pill" style={{marginLeft:8}}>ปิดอยู่</span>}
          <span style={{marginLeft:'auto', color:'var(--text-3)'}}>{show2FA ? '▲' : I.arrowRight}</span>
        </button>
        {show2FA && (
          <div style={{padding:'16px', background:'var(--surface-2)', borderRadius:'0 0 10px 10px', border:'1px solid var(--border)', borderTop:'none'}}>
            {verified2FA.length > 0 ? (
              <div>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                  <span style={{fontSize:32}}>✅</span>
                  <div>
                    <div style={{fontWeight:600}}>2FA เปิดใช้งานอยู่</div>
                    <div className="text-xs muted">บัญชีของคุณมีการป้องกันชั้นที่สอง</div>
                  </div>
                </div>
                {verified2FA.map(f => (
                  <div key={f.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)'}}>
                    <div>
                      <div style={{fontWeight:500, fontSize:13}}>{f.friendly_name || 'Authenticator App'}</div>
                      <div className="text-xs muted">เพิ่มเมื่อ {new Date(f.created_at).toLocaleDateString('th-TH')}</div>
                    </div>
                    <button className="btn sm danger" onClick={() => disable2FA(f.id)} disabled={mfaLoading}>ปิดใช้งาน</button>
                  </div>
                ))}
              </div>
            ) : mfaEnrolling ? (
              <div className="col gap-3">
                <div style={{fontWeight:600, marginBottom:4}}>สแกน QR Code ด้วยแอป Authenticator</div>
                <div className="text-xs muted">ใช้แอป Google Authenticator, Microsoft Authenticator หรือ Authy</div>
                {mfaQr && <img src={mfaQr} alt="QR Code" style={{width:200, height:200, border:'1px solid var(--border)', borderRadius:8}}/>}
                <div style={{background:'var(--surface)', padding:'8px 12px', borderRadius:8, fontFamily:'monospace', fontSize:12, wordBreak:'break-all', border:'1px solid var(--border)'}}>
                  <div className="text-xs muted" style={{marginBottom:4}}>หรือกรอก Secret Key:</div>
                  {mfaSecret}
                </div>
                <div className="field">
                  <label className="field-lbl">กรอกรหัส 6 หลักจากแอป</label>
                  <input className="input" value={mfaCode} onChange={e => setMfaCode(e.target.value)} placeholder="000000" maxLength={6} style={{letterSpacing:4, fontSize:18, textAlign:'center'}}/>
                </div>
                {mfaErr && <div style={{color:'var(--danger)', fontSize:13}}>{mfaErr}</div>}
                <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                  <button className="btn ghost" onClick={() => { setMfaEnrolling(false); setMfaQr(null); }}>ยกเลิก</button>
                  <button className="btn primary" onClick={verify2FA} disabled={mfaLoading}>{mfaLoading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}</button>
                </div>
              </div>
            ) : (
              <div className="col gap-2">
                <div className="text-sm" style={{lineHeight:1.6}}>
                  เปิดใช้งาน 2FA เพื่อเพิ่มความปลอดภัย — ทุกครั้งที่ login จะต้องกรอกรหัส OTP จากแอป Authenticator ด้วย
                </div>
                {mfaErr && <div style={{color:'var(--danger)', fontSize:13}}>{mfaErr}</div>}
                <button className="btn primary" onClick={startEnroll2FA} disabled={mfaLoading} style={{alignSelf:'flex-start'}}>
                  {mfaLoading ? 'กำลังเตรียม...' : '🛡️ เปิดใช้งาน 2FA'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>}

      {/* Devices */}
      <div>
        <button className="btn ghost" style={{justifyContent:'flex-start', width:'100%', textAlign:'left', padding:'14px 16px'}}
          onClick={() => { setShowDevices(!showDevices); loadSession(); }}>
          📱 อุปกรณ์ที่ลงชื่อเข้าใช้
          <span style={{marginLeft:'auto', color:'var(--text-3)'}}>{showDevices ? '▲' : I.arrowRight}</span>
        </button>
        {showDevices && (
          <div style={{padding:'16px', background:'var(--surface-2)', borderRadius:'0 0 10px 10px', border:'1px solid var(--border)', borderTop:'none'}}>
            {sessionInfo ? (
              <div className="col gap-3">
                <div style={{padding:'12px 14px', background:'var(--surface)', border:'1.5px solid var(--ok)', borderRadius:10}}>
                  <div style={{display:'flex', gap:12, alignItems:'center'}}>
                    <span style={{fontSize:28}}>💻</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:13}}>อุปกรณ์ปัจจุบัน (Session นี้)</div>
                      <div className="text-xs muted">
                        เริ่มเซสชันเมื่อ {new Date(sessionInfo.user?.last_sign_in_at || Date.now()).toLocaleString('th-TH')}
                      </div>
                      <div className="text-xs muted">
                        User: {sessionInfo.user?.email}
                      </div>
                    </div>
                    <span className="pill done"><span className="dot"></span>ออนไลน์</span>
                  </div>
                </div>
                <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                  <button className="btn ghost danger" onClick={signOutAllDevices}>
                    🚪 ออกจากระบบอุปกรณ์อื่นทั้งหมด
                  </button>
                </div>
                <div className="text-xs muted">การออกจากระบบจะยกเลิก session ทั้งหมด ยกเว้นอุปกรณ์นี้</div>
              </div>
            ) : (
              <div className="text-sm muted">กำลังโหลด...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification Settings ──────────────────────────────────────────
const NOTI_DEFAULTS = {
  booking_approved: { in: true, email: true, push: true },
  booking_rejected: { in: true, email: true, push: false },
  booking_reminder: { in: true, email: false, push: true },
  urgent_assignment: { in: true, email: true, push: true },
  maintenance_due: { in: true, email: true, push: false },
  pending_approval: { in: true, email: false, push: true },
  new_member: { in: true, email: true, push: false },
  mileage_correction: { in: true, email: false, push: false },
};

function NotificationSettings({ pushToast }) {
  const [prefs, setPrefs] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('noti_prefs')) || NOTI_DEFAULTS; }
    catch { return NOTI_DEFAULTS; }
  });
  const [saved, setSaved] = React.useState(false);

  function savePrefs() {
    localStorage.setItem('noti_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (pushToast) pushToast({ type: 'ok', msg: 'บันทึกการตั้งค่าการแจ้งเตือนแล้ว' });
  }

  const PREFS_META = [
    { key: "booking_approved", label: "การจองของฉันได้รับการอนุมัติ", desc: "เมื่อผู้จัดการอนุมัติคำขอจองรถของคุณ" },
    { key: "booking_rejected", label: "การจองของฉันถูกปฏิเสธ", desc: "พร้อมเหตุผลที่ไม่อนุมัติ" },
    { key: "booking_reminder", label: "เตือนความจำการใช้รถ", desc: "30 นาทีก่อนถึงเวลารับรถ" },
    { key: "urgent_assignment", label: "ภารกิจด่วน", desc: "เมื่อรถถูกเรียกใช้ในภารกิจด่วน" },
    { key: "maintenance_due", label: "รถใกล้ครบกำหนดบำรุงรักษา", desc: "30, 14, 7 และ 1 วันก่อนครบกำหนด" },
    { key: "pending_approval", label: "มีคำขอรอการอนุมัติ", desc: "สำหรับผู้จัดการและผู้ดูแลระบบ" },
    { key: "new_member", label: "สมาชิกใหม่สมัครเข้าระบบ", desc: "สำหรับผู้ดูแลระบบ" },
    { key: "mileage_correction", label: "คำขอแก้ไขเลขไมล์", desc: "สำหรับผู้ดูแลระบบ" },
  ];

  return (
    <div>
      <div style={{padding:'14px 16px', background:'var(--info-bg)', borderRadius:10, marginBottom:18, fontSize:13, color:'#1e4f88', lineHeight:1.5}}>
        <b>📲 รูปแบบการแจ้งเตือน:</b><br/>
        • <b>ในระบบ</b> — ที่ไอคอนกริ่งระฆัง<br/>
        • <b>อีเมล</b> — ส่งไปยังอีเมลที่ลงทะเบียน<br/>
        • <b>Push</b> — แจ้งเตือนบนหน้าจอเบราว์เซอร์/มือถือ
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="table">
          <thead>
            <tr>
              <th>ประเภทการแจ้งเตือน</th>
              <th style={{textAlign:'center', width:90}}>ในระบบ</th>
              <th style={{textAlign:'center', width:90}}>อีเมล</th>
              <th style={{textAlign:'center', width:90}}>Push</th>
            </tr>
          </thead>
          <tbody>
            {PREFS_META.map((p) => (
              <tr key={p.key}>
                <td>
                  <div style={{fontWeight:500, fontSize:13}}>{p.label}</div>
                  <div className="text-xs muted">{p.desc}</div>
                </td>
                {["in", "email", "push"].map((channel) => (
                  <td key={channel} style={{textAlign:'center'}}>
                    <button
                      className={"switch" + (prefs[p.key]?.[channel] ? " on" : "")}
                      onClick={() => setPrefs({...prefs, [p.key]: {...prefs[p.key], [channel]: !prefs[p.key]?.[channel]}})}
                      style={{margin:'0 auto', display:'block'}}
                    ></button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{padding:'14px 0 0', display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center'}}>
        {saved && <span style={{color:'var(--ok)', fontSize:13}}>✓ บันทึกแล้ว</span>}
        <button className="btn primary" onClick={savePrefs}>บันทึกการตั้งค่า</button>
      </div>
    </div>
  );
}

// ─── Calendar Sync ──────────────────────────────────────────────────
function CalendarSync({ currentUser, bookings, vehicles }) {
  const [providers, setProviders] = React.useState({
    google:  { connected: false, email: '', lastSync: null, calendar: '' },
    outlook: { connected: false, email: '', lastSync: null },
    apple:   { connected: false, email: '', lastSync: null },
  });
  const [autoSync, setAutoSync] = React.useState(true);
  const [syncFilters, setSyncFilters] = React.useState({ myBookings: true, teamBookings: false, approvedOnly: true });
  const [showSubscribeUrl, setShowSubscribeUrl] = React.useState(false);

  const myBookings = bookings.filter(b => b.userId === currentUser.id);
  const subscribeUrl = `webcal://pea-fang-vehicle-booking-system.vercel.app/api/calendar/${currentUser.id}.ics`;

  function toggleProvider(key) {
    setProviders({...providers, [key]: providers[key].connected
      ? { connected: false, email: '', lastSync: null }
      : { connected: true, email: currentUser.email || `${currentUser.emp}@pea.co.th`, lastSync: 'เมื่อกี้', calendar: 'PEA FANG จองรถ' }
    });
  }

  return (
    <div>
      <div style={{padding:'14px 16px', background:'var(--pea-purple-50)', border:'1px solid var(--pea-purple-100)', borderRadius:10, marginBottom:18, display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:38, height:38, borderRadius:10, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
          {I.calendar}
        </div>
        <div style={{flex:1}}>
          <b style={{fontSize:13.5}}>ซิงค์การจองรถไปยังปฏิทินส่วนตัวของคุณ</b>
          <div className="text-sm" style={{color:'var(--text-2)', lineHeight:1.5}}>
            เมื่อเชื่อมต่อแล้ว การจองที่ได้รับการอนุมัติจะปรากฏในปฏิทินส่วนตัวอัตโนมัติ
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:11, color:'var(--text-3)'}}>การจองในปฏิทิน</div>
          <div style={{fontSize:22, fontWeight:700, color:'var(--pea-purple)'}}>{myBookings.length}</div>
        </div>
      </div>

      <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
        ปฏิทินที่เชื่อมต่อ
      </div>
      <div className="col gap-2" style={{marginBottom:22}}>
        {[
          { key: 'google', name: 'Google Calendar', icon: '🗓️' },
          { key: 'outlook', name: 'Microsoft Outlook', icon: '📧' },
          { key: 'apple', name: 'Apple Calendar', icon: '🍎' },
        ].map(({ key, name, icon }) => (
          <div key={key} style={{
            display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
            border: providers[key].connected ? '1.5px solid var(--ok)' : '1px solid var(--border)',
            borderRadius:10,
            background: providers[key].connected ? 'var(--ok-bg)' : 'var(--surface)',
          }}>
            <div style={{width:42, height:42, borderRadius:10, background:'white', border:'1px solid var(--border)', display:'grid', placeItems:'center', fontSize:22}}>{icon}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <b style={{fontSize:14}}>{name}</b>
                {providers[key].connected && <span className="pill done"><span className="dot"></span>เชื่อมต่อแล้ว</span>}
              </div>
              <div className="text-xs muted" style={{marginTop:2}}>
                {providers[key].connected ? `${providers[key].email} · ซิงค์ล่าสุด ${providers[key].lastSync}` : `ส่งการจองไปแสดงใน ${name} อัตโนมัติ`}
              </div>
            </div>
            <button className={"btn sm " + (providers[key].connected ? "danger" : "primary")} onClick={() => toggleProvider(key)}>
              {providers[key].connected ? <>{I.x} ยกเลิก</> : <>{I.plus} เชื่อมต่อ</>}
            </button>
          </div>
        ))}
      </div>

      <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
        ส่งออก / Subscribe URL
      </div>
      <div className="card card-pad" style={{padding:'16px'}}>
        <div style={{display:'flex', gap:10, marginBottom:14, flexWrap:'wrap'}}>
          <button className="btn ghost">{I.download} ดาวน์โหลด .ics</button>
          <button className="btn ghost">{I.print} พิมพ์ตารางการจอง</button>
          <button className="btn" onClick={() => setShowSubscribeUrl(!showSubscribeUrl)}>
            {I.qr} {showSubscribeUrl ? 'ซ่อน' : 'แสดง'} Subscribe URL
          </button>
        </div>
        {showSubscribeUrl && (
          <div>
            <div className="text-xs muted" style={{marginBottom:6}}>คัดลอก URL นี้ Subscribe ในปฏิทินที่ใช้ (รองรับ webcal:// และ ICS)</div>
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--font-mono)', fontSize:11.5}}>
              <code style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{subscribeUrl}</code>
              <button className="btn sm primary" onClick={() => navigator.clipboard?.writeText(subscribeUrl)}>คัดลอก</button>
            </div>
            <div className="text-xs" style={{color:'var(--warn)', marginTop:6}}>{I.warn} URL ส่วนตัว — ห้ามแชร์กับผู้อื่น</div>
          </div>
        )}
      </div>
    </div>
  );
}

export { SettingsScreen }
