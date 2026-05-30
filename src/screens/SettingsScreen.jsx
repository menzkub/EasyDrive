import React from 'react'
import { I, fmtDate, ConfirmDialog } from '../components'
import { DEPARTMENTS as DEPT_FALLBACK } from '../data'
import { supabase } from '../supabase'
import { ManualScreen } from './ManualScreen'
import { DevGuideScreen } from './DevGuideScreen'
import { DevCardSettings } from '../DevCard'

function calcPwStrength(pw) {
  const checks = [
    { key: 'length',   label: 'อย่างน้อย 8 ตัวอักษร',   ok: pw.length >= 8 },
    { key: 'upper',    label: 'ตัวพิมพ์ใหญ่ A-Z',        ok: /[A-Z]/.test(pw) },
    { key: 'lower',    label: 'ตัวพิมพ์เล็ก a-z',        ok: /[a-z]/.test(pw) },
    { key: 'number',   label: 'ตัวเลข 0-9',               ok: /[0-9]/.test(pw) },
    { key: 'special',  label: 'อักขระพิเศษ !@#$%^&*',    ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter(c => c.ok).length;
  const missing = checks.filter(c => !c.ok);
  let label = '', color = '';
  if (pw.length > 0) {
    if (score <= 2)      { label = 'อ่อนแอ';     color = 'var(--danger)'; }
    else if (score === 3){ label = 'ปานกลาง';   color = 'var(--warn)'; }
    else if (score === 4){ label = 'ดี';          color = 'var(--info)'; }
    else                 { label = 'แข็งแกร่ง';  color = 'var(--ok)'; }
  }
  return { score, checks, missing, label, color };
}

function SettingsScreen({ currentUser, bookings, vehicles, departments, onUpdateProfile, pushToast, activeTab, onTabChange, demoEnabled, onSetDemoEnabled, onDeleteDemoBookings, maintenanceMode, onSetMaintenanceMode, maintenanceCfg, onSetMaintenanceCfg, defaultMaintenanceMsg, appConfig, onSaveConfig, defaultConfig }) {
  const [tab, setTab] = React.useState(activeTab || "account");
  const deptNames = departments?.length ? departments.map(d => d.name) : DEPT_FALLBACK;
  const isAdmin = currentUser.role === 'admin';
  const adminOnlyTabs = ["demo", "data", "manual", "dev", "about"];

  React.useEffect(() => {
    if (activeTab) setTab(adminOnlyTabs.includes(activeTab) && !isAdmin ? "account" : activeTab);
  }, [activeTab]);

  function changeTab(t) {
    setTab(t);
    onTabChange && onTabChange(t);
  }

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <h2 className="mt-0" style={{margin:0}}>การตั้งค่าและการเชื่อมต่อ</h2>
        <p className="sub" style={{margin:'2px 0 0'}}>จัดการบัญชี ความปลอดภัย และการแจ้งเตือน</p>
      </div>
      <div className="card card-pad">
        <div className="tabs">
          <button className={"tab" + (tab === "account" ? " active" : "")} onClick={() => changeTab("account")}>👤 บัญชี</button>
          <button className={"tab" + (tab === "noti" ? " active" : "")} onClick={() => changeTab("noti")}>🔔 การแจ้งเตือน</button>
          <button className={"tab" + (tab === "calendar" ? " active" : "")} onClick={() => changeTab("calendar")}>📅 Calendar Sync</button>
          {isAdmin && <button className={"tab" + (tab === "data" ? " active" : "")} onClick={() => changeTab("data")}>🗂️ ข้อมูลระบบ</button>}
          {isAdmin && <button className={"tab" + (tab === "demo" ? " active" : "")} onClick={() => changeTab("demo")}>🎮 ทดสอบระบบ</button>}
          {isAdmin && <button className={"tab" + (tab === "manual" ? " active" : "")} onClick={() => changeTab("manual")}>📖 คู่มือ</button>}
          {isAdmin && <button className={"tab" + (tab === "dev" ? " active" : "")} onClick={() => changeTab("dev")}>🛠️ นักพัฒนา</button>}
          {isAdmin && <button className={"tab" + (tab === "about" ? " active" : "")} onClick={() => changeTab("about")}>🪪 เกี่ยวกับ</button>}
        </div>
        {tab === "account"  && <AccountSettings currentUser={currentUser} deptNames={deptNames} onUpdateProfile={onUpdateProfile} pushToast={pushToast}/>}
        {tab === "noti"     && <NotificationSettings pushToast={pushToast}/>}
        {tab === "calendar" && <CalendarSync currentUser={currentUser} bookings={bookings} vehicles={vehicles}/>}
        {tab === "data"     && isAdmin && <DataSettings appConfig={appConfig} onSaveConfig={onSaveConfig} defaultConfig={defaultConfig} departments={departments || []} pushToast={pushToast}/>}
        {tab === "demo"     && isAdmin && <DemoSettings demoEnabled={demoEnabled} onSetDemoEnabled={onSetDemoEnabled} bookings={bookings} onDeleteAll={onDeleteDemoBookings} maintenanceMode={maintenanceMode} onSetMaintenanceMode={onSetMaintenanceMode} maintenanceCfg={maintenanceCfg||{}} onSetMaintenanceCfg={onSetMaintenanceCfg} defaultMaintenanceMsg={defaultMaintenanceMsg}/>}
        {tab === "manual"   && isAdmin && <div style={{marginTop:14, border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', height:600}}><ManualScreen role="admin"/></div>}
        {tab === "dev"      && isAdmin && <div style={{marginTop:14}}><DevGuideScreen/></div>}
        {tab === "about"    && isAdmin && <DevCardSettings pushToast={pushToast}/>}
      </div>
    </div>
  );
}

// ─── Account Settings ──────────────────────────────────────────────
function AccountSettings({ currentUser, deptNames, onUpdateProfile, pushToast }) {
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
    setMfaFactors(data?.totp || data?.all?.filter(f => f.factor_type === 'totp') || []);
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
    const { score } = calcPwStrength(pwForm.newPw);
    if (pwForm.newPw.length < 8) { setPwErr('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (score < 3) { setPwErr('รหัสผ่านอ่อนแอเกินไป — เพิ่มตัวพิมพ์ใหญ่ ตัวเลข หรืออักขระพิเศษ'); return; }
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

    // Step 1: try to enroll
    let { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'EasyDrive Authenticator' });

    // Step 2: if "already exists" — find the conflicting factor and unenroll it, then retry
    if (error?.message?.toLowerCase().includes('already exists') || error?.message?.toLowerCase().includes('friendly name')) {
      const { data: existing } = await supabase.auth.mfa.listFactors();
      const allFactors = [
        ...(existing?.totp || []),
        ...(existing?.all?.filter(f => f.factor_type === 'totp') || []),
      ];
      const unique = [...new Map(allFactors.map(f => [f.id, f])).values()];
      for (const f of unique) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      // Retry enrollment after clearing
      ({ data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'EasyDrive Authenticator' }));
    }

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
      <div className="profile-card" style={{display:'flex', gap:16, alignItems:'center', padding:'16px 18px', background:'linear-gradient(135deg, var(--pea-purple-50), var(--pea-orange-50))', borderRadius:12}}>
        <div className="avatar lg" style={{width:64, height:64, fontSize:24, background:'var(--pea-purple)', flexShrink:0}}>{currentUser.name.charAt(0)}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:18, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{currentUser.name}</div>
          <div className="text-sm muted" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{currentUser.role === "admin" ? "ผู้ดูแลระบบ" : currentUser.role === "manager" ? "ผู้จัดการ" : "ผู้ใช้งาน"} · {currentUser.dept}</div>
          <div className="text-xs muted" style={{marginTop:2}}>รหัส {currentUser.emp} · สมาชิกตั้งแต่ {fmtDate(currentUser.joined)}</div>
        </div>
        <div className="profile-card-actions">
          {!editing
            ? <button className="btn ghost" onClick={() => setEditing(true)}>{I.edit} แก้ไขโปรไฟล์</button>
            : <div style={{display:'flex', gap:8}}>
                <button className="btn ghost" onClick={() => { setEditing(false); setForm({ name: currentUser.name, dept: currentUser.dept, email: currentUser.email||'', phone: currentUser.phone||'' }); }}>ยกเลิก</button>
                <button className="btn primary" onClick={saveProfile} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
          }
        </div>
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
              {deptNames.map(d => <option key={d}>{d}</option>)}
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
                <input className="input" type="password" value={pwForm.newPw} onChange={e => setPwForm({...pwForm, newPw: e.target.value})} placeholder="อย่างน้อย 8 ตัวอักษร"/>
              </div>
              {pwForm.newPw.length > 0 && (() => {
                const { score, checks, missing, label, color } = calcPwStrength(pwForm.newPw);
                return (
                  <div style={{padding:'10px 12px', background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                      <div style={{display:'flex', gap:3, flex:1}}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{flex:1, height:5, borderRadius:3,
                            background: i <= score ? color : 'var(--border)',
                            transition:'background 0.2s'}}/>
                        ))}
                      </div>
                      <span style={{fontSize:11, fontWeight:700, color, minWidth:60, textAlign:'right'}}>{label}</span>
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'4px 12px'}}>
                      {checks.map(c => (
                        <span key={c.key} style={{fontSize:11, color: c.ok ? 'var(--ok)' : 'var(--text-3)', display:'flex', alignItems:'center', gap:3}}>
                          <span style={{fontSize:10}}>{c.ok ? '✓' : '✗'}</span> {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="field">
                <label className="field-lbl">ยืนยันรหัสผ่านใหม่</label>
                <input className="input" type="password" value={pwForm.confirmPw} onChange={e => setPwForm({...pwForm, confirmPw: e.target.value})} placeholder="กรอกรหัสผ่านซ้ำ"
                  style={pwForm.confirmPw && pwForm.newPw !== pwForm.confirmPw ? {borderColor:'var(--danger)'} : {}}/>
                {pwForm.confirmPw && pwForm.newPw !== pwForm.confirmPw && (
                  <div style={{fontSize:12, color:'var(--danger)', marginTop:4}}>รหัสผ่านไม่ตรงกัน</div>
                )}
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
  const [modal, setModal] = React.useState(null); // 'google' | 'outlook' | null
  const [showUrl, setShowUrl] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const myBookings = React.useMemo(() =>
    bookings.filter(b => b.userId === currentUser.id && b.from && b.to)
      .sort((a, b) => new Date(a.from) - new Date(b.from)),
    [bookings, currentUser.id]
  );
  const upcomingBookings = myBookings.filter(b => new Date(b.to) >= new Date());

  function fmtIcsDt(dt) {
    return new Date(dt).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  }
  function esc(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/[,;]/g, s => '\\' + s).replace(/\n/g, '\\n');
  }
  function statusTH(s) {
    return { booked:'จองแล้ว', approved:'อนุมัติ', rejected:'ไม่อนุมัติ', cancelled:'ยกเลิก', checkin:'รับรถแล้ว', checkout:'คืนรถแล้ว' }[s] || s;
  }

  function buildICS() {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//EasyDrive//Vehicle Booking System//TH',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:EasyDrive การจองรถ',
    ];
    for (const b of myBookings) {
      const v = vehicles.find(v => v.id === b.vehicleId);
      const summary = `จองรถ ${v?.plate || ''} · ${b.purpose || ''}`.trim();
      const desc = `วัตถุประสงค์: ${b.purpose || ''}\nปลายทาง: ${b.destination || ''}\nสถานะ: ${statusTH(b.status)}`;
      lines.push(
        'BEGIN:VEVENT',
        `UID:pea-${b.id}@easydrive.local`,
        `DTSTART:${fmtIcsDt(b.from)}`,
        `DTEND:${fmtIcsDt(b.to)}`,
        `DTSTAMP:${fmtIcsDt(b.createdAt || new Date())}`,
        `SUMMARY:${esc(summary)}`,
        `DESCRIPTION:${esc(desc)}`,
        `LOCATION:${esc(b.destination || '')}`,
        `STATUS:${b.status === 'approved' ? 'CONFIRMED' : b.status === 'rejected' ? 'CANCELLED' : 'TENTATIVE'}`,
        'END:VEVENT',
      );
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function downloadICS() {
    const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `easydrive-${currentUser.emp}.ics`; a.click();
    URL.revokeObjectURL(url);
  }

  function printSchedule() {
    const rows = myBookings.map(b => {
      const v = vehicles.find(v => v.id === b.vehicleId);
      return `<tr>
        <td>${new Date(b.from).toLocaleString('th-TH')}</td>
        <td>${new Date(b.to).toLocaleString('th-TH')}</td>
        <td>${v?.plate || '-'} ${v?.brand || ''}</td>
        <td>${b.purpose || '-'}</td>
        <td>${b.destination || '-'}</td>
        <td>${statusTH(b.status)}</td>
      </tr>`;
    }).join('');
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html lang="th"><head><meta charset="utf-8">
<title>ตารางการจองรถ - ${currentUser.name}</title>
<style>
  body{font-family:Sarabun,sans-serif;font-size:12px;margin:24px}
  h2{margin:0 0 4px;color:#4b2d8c} p{margin:0 0 16px;color:#666}
  table{width:100%;border-collapse:collapse}
  th{background:#4b2d8c;color:#fff;padding:7px 10px;text-align:left}
  td{border:1px solid #ddd;padding:6px 10px}
  tr:nth-child(even)td{background:#f9f7ff}
</style></head><body>
<h2>ตารางการจองรถ</h2>
<p>${currentUser.name} · ${currentUser.dept} · พิมพ์เมื่อ ${new Date().toLocaleString('th-TH')}</p>
<table><thead><tr><th>เริ่ม</th><th>สิ้นสุด</th><th>รถ</th><th>วัตถุประสงค์</th><th>ปลายทาง</th><th>สถานะ</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }

  function googleUrl(b) {
    const v = vehicles.find(v => v.id === b.vehicleId);
    const text = encodeURIComponent(`จองรถ ${v?.plate || ''} · ${b.purpose || ''}`);
    const s = fmtIcsDt(b.from); const e = fmtIcsDt(b.to);
    const details = encodeURIComponent(`วัตถุประสงค์: ${b.purpose || ''}\nปลายทาง: ${b.destination || ''}`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${s}/${e}&details=${details}&location=${encodeURIComponent(b.destination || '')}`;
  }

  function outlookUrl(b) {
    const v = vehicles.find(v => v.id === b.vehicleId);
    const subj = encodeURIComponent(`จองรถ ${v?.plate || ''} · ${b.purpose || ''}`);
    const s = new Date(b.from).toISOString().slice(0,19);
    const e = new Date(b.to).toISOString().slice(0,19);
    const body = encodeURIComponent(`วัตถุประสงค์: ${b.purpose || ''}\nปลายทาง: ${b.destination || ''}`);
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subj}&startdt=${s}&enddt=${e}&body=${body}&location=${encodeURIComponent(b.destination || '')}&allday=false`;
  }

  const PROVIDERS = [
    { key:'google',  name:'Google Calendar',  icon:'🗓️', desc:'เพิ่มนัดหมายใน Google Calendar', action:() => setModal('google') },
    { key:'outlook', name:'Microsoft Outlook', icon:'📧', desc:'เพิ่มนัดหมายใน Outlook Calendar', action:() => setModal('outlook') },
    { key:'apple',   name:'Apple Calendar',    icon:'🍎', desc:'ดาวน์โหลด .ics นำเข้า Calendar บน Mac/iPhone', action:downloadICS },
  ];

  return (
    <div>
      <div style={{padding:'14px 16px', background:'var(--pea-purple-50)', border:'1px solid var(--pea-purple-100)', borderRadius:10, marginBottom:18, display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:38, height:38, borderRadius:10, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
          {I.calendar}
        </div>
        <div style={{flex:1}}>
          <b style={{fontSize:13.5}}>ซิงค์การจองรถไปยังปฏิทินส่วนตัวของคุณ</b>
          <div className="text-sm" style={{color:'var(--text-2)', lineHeight:1.5}}>
            เพิ่มการจองเข้าปฏิทิน Google, Outlook หรือดาวน์โหลด .ics สำหรับ Apple Calendar
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:11, color:'var(--text-3)'}}>การจองทั้งหมด</div>
          <div style={{fontSize:22, fontWeight:700, color:'var(--pea-purple)'}}>{myBookings.length}</div>
        </div>
      </div>

      <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
        เพิ่มในปฏิทิน
      </div>
      <div className="col gap-2" style={{marginBottom:22}}>
        {PROVIDERS.map(({ key, name, icon, desc, action }) => (
          <div key={key} style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px', border:'1px solid var(--border)', borderRadius:10, background:'var(--surface)'}}>
            <div style={{width:42, height:42, borderRadius:10, background:'white', border:'1px solid var(--border)', display:'grid', placeItems:'center', fontSize:22}}>{icon}</div>
            <div style={{flex:1, minWidth:0}}>
              <b style={{fontSize:14}}>{name}</b>
              <div className="text-xs muted" style={{marginTop:2}}>{desc}</div>
            </div>
            <button className="btn sm primary" onClick={action}>
              {key === 'apple' ? <>{I.download} นำเข้า</> : <>{I.plus} เพิ่มนัด</>}
            </button>
          </div>
        ))}
      </div>

      <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
        ส่งออก / Subscribe
      </div>
      <div className="card card-pad" style={{padding:'16px'}}>
        <div style={{display:'flex', gap:10, marginBottom:showUrl ? 14 : 0, flexWrap:'wrap'}}>
          <button className="btn ghost" onClick={downloadICS}>{I.download} ดาวน์โหลด .ics</button>
          <button className="btn ghost" onClick={printSchedule}>{I.print} พิมพ์ตารางการจอง</button>
          <button className="btn" onClick={() => setShowUrl(!showUrl)}>
            {I.qr} {showUrl ? 'ซ่อน' : 'แสดง'} Subscribe URL
          </button>
        </div>
        {showUrl && (
          <div>
            <div className="text-xs muted" style={{marginBottom:6}}>คัดลอก URL นี้เพื่อ Subscribe ในแอปปฏิทินที่รองรับ webcal://</div>
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--font-mono)', fontSize:11}}>
              <code style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                webcal://easydrive-fang.vercel.app/api/calendar/{currentUser.id}.ics
              </code>
              <button className="btn sm primary" onClick={() => {
                navigator.clipboard?.writeText(`webcal://easydrive-fang.vercel.app/api/calendar/${currentUser.id}.ics`);
                setCopied(true); setTimeout(() => setCopied(false), 2000);
              }}>{copied ? '✓ คัดลอกแล้ว' : 'คัดลอก'}</button>
            </div>
            <div className="text-xs" style={{color:'var(--warn)', marginTop:6}}>{I.warn} URL ส่วนตัว — ห้ามแชร์กับผู้อื่น</div>
          </div>
        )}
      </div>

      {/* Modal: Google / Outlook per-event links */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{width:520}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'google' ? '🗓️ เพิ่มใน Google Calendar' : '📧 เพิ่มใน Microsoft Outlook'}</h2>
              <button className="btn ghost sm" onClick={() => setModal(null)}>{I.x}</button>
            </div>
            <div className="modal-body">
              {upcomingBookings.length === 0 ? (
                <div style={{textAlign:'center', padding:'28px 0', color:'var(--text-3)'}}>
                  <div style={{fontSize:36, marginBottom:10}}>📅</div>
                  <div>ไม่มีการจองที่กำลังจะมาถึง</div>
                  <div className="text-xs muted" style={{marginTop:4}}>ดาวน์โหลด .ics เพื่อนำเข้าการจองที่ผ่านมา</div>
                </div>
              ) : (
                <div className="col gap-2">
                  <div className="text-xs muted" style={{marginBottom:6}}>คลิก "เปิด" เพื่อเพิ่มนัดหมายในปฏิทินทีละรายการ</div>
                  {upcomingBookings.map(b => {
                    const v = vehicles.find(v => v.id === b.vehicleId);
                    const url = modal === 'google' ? googleUrl(b) : outlookUrl(b);
                    return (
                      <div key={b.id} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', border:'1px solid var(--border)', borderRadius:9, background:'var(--surface-2)'}}>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontWeight:600, fontSize:13}}>{v?.plate || '-'} · {b.purpose || '-'}</div>
                          <div className="text-xs muted">
                            {new Date(b.from).toLocaleString('th-TH', {dateStyle:'medium', timeStyle:'short'})} →{' '}
                            {new Date(b.to).toLocaleString('th-TH', {timeStyle:'short'})}
                          </div>
                          {b.destination && <div className="text-xs muted">📍 {b.destination}</div>}
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="btn sm primary" style={{flexShrink:0}}>
                          เปิด ↗
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={downloadICS}>{I.download} ดาวน์โหลด .ics (นำเข้าทั้งหมด)</button>
              <button className="btn ghost" onClick={() => setModal(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Data Settings (admin only) ────────────────────────────────────
function DataSettings({ appConfig, onSaveConfig, defaultConfig, departments, pushToast }) {
  const [subTab, setSubTab] = React.useState('checklist');
  const [saving, setSaving] = React.useState(false);
  const [setupNeeded, setSetupNeeded] = React.useState(false);
  const [confirmDlg, setConfirmDlg] = React.useState(null);

  const [checklist, setChecklist] = React.useState(() => appConfig?.checklist || defaultConfig?.checklist || []);
  const [purposes, setPurposes] = React.useState(() => appConfig?.purposes || defaultConfig?.purposes || []);
  const [vehicleTypes, setVehicleTypes] = React.useState(() => appConfig?.vehicleTypes || defaultConfig?.vehicleTypes || {});
  const [fuelTypes, setFuelTypes] = React.useState(() => appConfig?.fuelTypes || defaultConfig?.fuelTypes || {});

  const [editingCl, setEditingCl] = React.useState(null);
  const [newCl, setNewCl] = React.useState({ label: '', hint: '' });
  const [editingPurpose, setEditingPurpose] = React.useState(null);
  const [newPurpose, setNewPurpose] = React.useState('');
  const [editingFuel, setEditingFuel] = React.useState(null);
  const [newFuel, setNewFuel] = React.useState({ key: '', label: '' });
  const [editingVt, setEditingVt] = React.useState(null);

  function confirm(opts) { setConfirmDlg(opts); }

  async function save(key, value) {
    setSaving(true);
    try {
      await onSaveConfig(key, value);
      pushToast({ kind: 'ok', title: 'บันทึกสำเร็จ', body: 'อัปเดตข้อมูลระบบแล้ว' });
      setSetupNeeded(false);
    } catch (e) {
      if (e.message?.includes('42P01') || e.code === '42P01') {
        setSetupNeeded(true);
        pushToast({ kind: 'warn', title: 'ยังไม่มีตาราง app_config', body: 'ดูคำแนะนำการติดตั้งด้านล่าง' });
      } else {
        pushToast({ kind: 'error', title: 'บันทึกไม่สำเร็จ', body: e.message });
      }
    }
    setSaving(false);
  }

  // ── Checklist ──
  function moveClItem(idx, dir) {
    const arr = [...checklist];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setChecklist(arr);
  }
  function requestDeleteCl(idx) {
    confirm({ kind:'negative', title:'ลบรายการตรวจสอบ?', message:`ลบ "${checklist[idx].label}" ออกจากรายการตรวจสอบ — กดบันทึกเพื่อให้มีผล`,
      onConfirm: () => setChecklist(checklist.filter((_, i) => i !== idx)) });
  }
  function addClItem() {
    if (!newCl.label.trim()) return;
    const id = newCl.label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    setChecklist([...checklist, { id, label: newCl.label.trim(), hint: newCl.hint.trim() }]);
    setNewCl({ label: '', hint: '' });
  }
  function requestResetCl() {
    confirm({ kind:'warn', title:'รีเซ็ตเป็นค่าเริ่มต้น?', message:'รายการตรวจสอบจะกลับเป็น 10 รายการเดิม — การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะหาย',
      onConfirm: () => { setChecklist(defaultConfig?.checklist || []); setEditingCl(null); } });
  }
  function requestSaveCl() {
    confirm({ kind:'primary', title:'บันทึกรายการตรวจสอบ?', message:`บันทึก ${checklist.length} รายการลงฐานข้อมูล`,
      onConfirm: () => save('checklist', checklist) });
  }

  // ── Purposes ──
  function movePurpose(idx, dir) {
    const arr = [...purposes];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setPurposes(arr);
  }
  function requestDeletePurpose(idx) {
    confirm({ kind:'negative', title:'ลบวัตถุประสงค์?', message:`ลบ "${purposes[idx]}" — กดบันทึกเพื่อให้มีผล`,
      onConfirm: () => setPurposes(purposes.filter((_, i) => i !== idx)) });
  }
  function addPurpose() {
    if (!newPurpose.trim()) return;
    setPurposes([...purposes, newPurpose.trim()]);
    setNewPurpose('');
  }
  function requestSavePurposes() {
    confirm({ kind:'primary', title:'บันทึกวัตถุประสงค์?', message:`บันทึก ${purposes.length} รายการลงฐานข้อมูล`,
      onConfirm: () => save('purposes', purposes) });
  }

  // ── Fuel types ──
  function requestDeleteFuel(key) {
    confirm({ kind:'negative', title:'ลบประเภทเชื้อเพลิง?', message:`ลบ "${fuelTypes[key]}" (${key}) — กดบันทึกเพื่อให้มีผล`,
      onConfirm: () => { const ft = {...fuelTypes}; delete ft[key]; setFuelTypes(ft); } });
  }
  function addFuelType() {
    if (!newFuel.key.trim() || !newFuel.label.trim()) return;
    setFuelTypes({ ...fuelTypes, [newFuel.key.trim()]: newFuel.label.trim() });
    setNewFuel({ key: '', label: '' });
  }
  function requestSaveFuel() {
    confirm({ kind:'primary', title:'บันทึกประเภทเชื้อเพลิง?', message:`บันทึก ${Object.keys(fuelTypes).length} รายการลงฐานข้อมูล`,
      onConfirm: () => save('fuel_types', fuelTypes) });
  }

  // ── Vehicle types ──
  function requestSaveVt() {
    confirm({ kind:'primary', title:'บันทึกประเภทรถ?', message:'บันทึกชื่อประเภทรถลงฐานข้อมูล',
      onConfirm: () => save('vehicle_types', vehicleTypes) });
  }

  const SQL_SETUP = `-- รัน SQL นี้ใน Supabase SQL Editor
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read" ON app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write" ON app_config FOR ALL TO authenticated USING (true);`;

  const VEHICLE_ICONS = ['sedan', 'pickup', 'van', 'truck6', 'truck3', 'crane', 'bucket', 'ev'];

  return (
    <div style={{marginTop:16}}>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
        {[['checklist','✅ รายการตรวจสอบ'],['purposes','📋 วัตถุประสงค์'],['vehicleTypes','🚗 ประเภทรถ'],['fuelTypes','⛽ เชื้อเพลิง'],['depts','🏢 แผนก']].map(([k,l]) => (
          <button key={k} className={"btn sm" + (subTab === k ? " primary" : " ghost")} onClick={() => setSubTab(k)}>{l}</button>
        ))}
      </div>

      {setupNeeded && (
        <div style={{background:'var(--warn-bg)', border:'1px solid var(--warn)', borderRadius:10, padding:'12px 14px', marginBottom:16}}>
          <div style={{fontWeight:600, color:'var(--warn)', marginBottom:6}}>ต้องสร้างตาราง app_config ใน Supabase ก่อน</div>
          <pre style={{fontSize:11, margin:0, whiteSpace:'pre-wrap', fontFamily:'var(--font-mono)', color:'var(--text-2)', userSelect:'all'}}>{SQL_SETUP}</pre>
        </div>
      )}

      {/* ── Checklist ── */}
      {subTab === 'checklist' && (
        <div>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
            <p className="muted" style={{margin:0, fontSize:13, flex:1}}>รายการตรวจสอบสภาพรถก่อนออก — {checklist.length} รายการ</p>
            <button className="btn sm ghost" style={{fontSize:12, color:'var(--warn)'}} onClick={requestResetCl}>↺ คืนค่าเริ่มต้น</button>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:14}}>
            {checklist.map((item, i) => (
              <div key={item.id} style={{background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', display:'flex', alignItems:'flex-start', gap:8}}>
                <div style={{flex:1, minWidth:0}}>
                  {editingCl?.idx === i ? (
                    <div style={{display:'flex', flexDirection:'column', gap:6}}>
                      <input className="input" value={editingCl.label} onChange={e => setEditingCl({...editingCl, label: e.target.value})} placeholder="ชื่อรายการ" style={{fontSize:13}}/>
                      <input className="input" value={editingCl.hint} onChange={e => setEditingCl({...editingCl, hint: e.target.value})} placeholder="คำอธิบาย (hint)" style={{fontSize:12}}/>
                      <div style={{display:'flex', gap:6}}>
                        <button className="btn sm primary" onClick={() => {
                          const arr = [...checklist];
                          arr[i] = { ...arr[i], label: editingCl.label, hint: editingCl.hint };
                          setChecklist(arr); setEditingCl(null);
                        }}>บันทึก</button>
                        <button className="btn sm ghost" onClick={() => setEditingCl(null)}>ยกเลิก</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{fontWeight:500, fontSize:13.5}}>{i+1}. {item.label}</div>
                      {item.hint && <div style={{fontSize:11.5, color:'var(--text-3)', marginTop:2}}>{item.hint}</div>}
                    </>
                  )}
                </div>
                {editingCl?.idx !== i && (
                  <div style={{display:'flex', gap:4, flexShrink:0}}>
                    <button className="btn icon ghost sm" onClick={() => moveClItem(i, -1)} disabled={i === 0} title="ขึ้น">↑</button>
                    <button className="btn icon ghost sm" onClick={() => moveClItem(i, 1)} disabled={i === checklist.length-1} title="ลง">↓</button>
                    <button className="btn icon ghost sm" onClick={() => setEditingCl({idx:i, label:item.label, hint:item.hint||''})}>✏️</button>
                    <button className="btn icon ghost sm" style={{color:'var(--danger)'}} onClick={() => requestDeleteCl(i)}>🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{background:'var(--bg-2)', border:'1px dashed var(--border)', borderRadius:8, padding:'10px 12px', marginBottom:12}}>
            <div style={{fontWeight:500, fontSize:13, marginBottom:8}}>+ เพิ่มรายการใหม่</div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <input className="input" value={newCl.label} onChange={e => setNewCl({...newCl, label:e.target.value})} placeholder="ชื่อรายการ *" style={{flex:'2 1 140px', fontSize:13}}/>
              <input className="input" value={newCl.hint} onChange={e => setNewCl({...newCl, hint:e.target.value})} placeholder="คำอธิบาย (ไม่บังคับ)" style={{flex:'3 1 200px', fontSize:13}}/>
              <button className="btn sm primary" onClick={addClItem} disabled={!newCl.label.trim()}>เพิ่ม</button>
            </div>
          </div>
          <button className="btn primary" onClick={requestSaveCl} disabled={saving}>{saving ? 'กำลังบันทึก...' : '💾 บันทึกรายการตรวจสอบ'}</button>
        </div>
      )}

      {/* ── Purposes ── */}
      {subTab === 'purposes' && (
        <div>
          <p className="muted" style={{margin:'0 0 12px', fontSize:13}}>วัตถุประสงค์การใช้รถ — {purposes.length} รายการ</p>
          <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:14}}>
            {purposes.map((p, i) => (
              <div key={i} style={{background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 12px', display:'flex', alignItems:'center', gap:8}}>
                <span style={{flex:1, fontSize:13.5}}>
                  {editingPurpose?.idx === i ? (
                    <input className="input" value={editingPurpose.value} onChange={e => setEditingPurpose({...editingPurpose, value: e.target.value})} style={{fontSize:13, width:'100%'}}/>
                  ) : `${i+1}. ${p}`}
                </span>
                <div style={{display:'flex', gap:4, flexShrink:0}}>
                  {editingPurpose?.idx === i ? (
                    <>
                      <button className="btn sm primary" onClick={() => {
                        const arr = [...purposes]; arr[i] = editingPurpose.value; setPurposes(arr); setEditingPurpose(null);
                      }}>บันทึก</button>
                      <button className="btn sm ghost" onClick={() => setEditingPurpose(null)}>ยกเลิก</button>
                    </>
                  ) : (
                    <>
                      <button className="btn icon ghost sm" onClick={() => movePurpose(i, -1)} disabled={i === 0}>↑</button>
                      <button className="btn icon ghost sm" onClick={() => movePurpose(i, 1)} disabled={i === purposes.length-1}>↓</button>
                      <button className="btn icon ghost sm" onClick={() => setEditingPurpose({idx:i, value:p})}>✏️</button>
                      <button className="btn icon ghost sm" style={{color:'var(--danger)'}} onClick={() => requestDeletePurpose(i)}>🗑</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'var(--bg-2)', border:'1px dashed var(--border)', borderRadius:8, padding:'10px 12px', marginBottom:12}}>
            <div style={{fontWeight:500, fontSize:13, marginBottom:8}}>+ เพิ่มวัตถุประสงค์ใหม่</div>
            <div style={{display:'flex', gap:8}}>
              <input className="input" value={newPurpose} onChange={e => setNewPurpose(e.target.value)} placeholder="วัตถุประสงค์การใช้รถ" style={{flex:1, fontSize:13}}/>
              <button className="btn sm primary" onClick={addPurpose} disabled={!newPurpose.trim()}>เพิ่ม</button>
            </div>
          </div>
          <button className="btn primary" onClick={requestSavePurposes} disabled={saving}>{saving ? 'กำลังบันทึก...' : '💾 บันทึกวัตถุประสงค์'}</button>
        </div>
      )}

      {/* ── Vehicle Types ── */}
      {subTab === 'vehicleTypes' && (
        <div>
          <p className="muted" style={{margin:'0 0 4px', fontSize:13}}>ประเภทรถยนต์ — แก้ไขชื่อได้ (ไอคอนเป็นค่าตายตัว)</p>
          <p className="muted" style={{margin:'0 0 12px', fontSize:12}}>ไอคอนที่ใช้ได้: {VEHICLE_ICONS.join(', ')}</p>
          <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:14}}>
            {Object.entries(vehicleTypes).map(([key, v]) => (
              <div key={key} style={{background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', display:'flex', alignItems:'center', gap:10}}>
                <code style={{fontSize:12, background:'var(--bg)', padding:'2px 6px', borderRadius:4, color:'var(--text-3)', flexShrink:0}}>{key}</code>
                <span style={{flex:1, fontSize:13.5}}>
                  {editingVt?.key === key ? (
                    <input className="input" value={editingVt.label} onChange={e => setEditingVt({...editingVt, label: e.target.value})} style={{fontSize:13}}/>
                  ) : v.label}
                </span>
                <code style={{fontSize:11, color:'var(--text-3)', flexShrink:0}}>{v.icon}</code>
                <div style={{display:'flex', gap:4}}>
                  {editingVt?.key === key ? (
                    <>
                      <button className="btn sm primary" onClick={() => {
                        setVehicleTypes({...vehicleTypes, [key]: {...v, label: editingVt.label}}); setEditingVt(null);
                      }}>บันทึก</button>
                      <button className="btn sm ghost" onClick={() => setEditingVt(null)}>ยกเลิก</button>
                    </>
                  ) : (
                    <button className="btn icon ghost sm" onClick={() => setEditingVt({key, label: v.label})}>✏️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="btn primary" onClick={requestSaveVt} disabled={saving}>{saving ? 'กำลังบันทึก...' : '💾 บันทึกประเภทรถ'}</button>
        </div>
      )}

      {/* ── Fuel Types ── */}
      {subTab === 'fuelTypes' && (
        <div>
          <p className="muted" style={{margin:'0 0 12px', fontSize:13}}>ประเภทเชื้อเพลิง — {Object.keys(fuelTypes).length} รายการ</p>
          <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:14}}>
            {Object.entries(fuelTypes).map(([key, label]) => (
              <div key={key} style={{background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', display:'flex', alignItems:'center', gap:10}}>
                <code style={{fontSize:12, background:'var(--bg)', padding:'2px 6px', borderRadius:4, color:'var(--text-3)', flexShrink:0}}>{key}</code>
                <span style={{flex:1, fontSize:13.5}}>
                  {editingFuel?.key === key ? (
                    <input className="input" value={editingFuel.label} onChange={e => setEditingFuel({...editingFuel, label: e.target.value})} style={{fontSize:13}}/>
                  ) : label}
                </span>
                <div style={{display:'flex', gap:4}}>
                  {editingFuel?.key === key ? (
                    <>
                      <button className="btn sm primary" onClick={() => {
                        setFuelTypes({...fuelTypes, [key]: editingFuel.label}); setEditingFuel(null);
                      }}>บันทึก</button>
                      <button className="btn sm ghost" onClick={() => setEditingFuel(null)}>ยกเลิก</button>
                    </>
                  ) : (
                    <>
                      <button className="btn icon ghost sm" onClick={() => setEditingFuel({key, label})}>✏️</button>
                      <button className="btn icon ghost sm" style={{color:'var(--danger)'}} onClick={() => requestDeleteFuel(key)}>🗑</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'var(--bg-2)', border:'1px dashed var(--border)', borderRadius:8, padding:'10px 12px', marginBottom:12}}>
            <div style={{fontWeight:500, fontSize:13, marginBottom:8}}>+ เพิ่มเชื้อเพลิงใหม่</div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <input className="input" value={newFuel.key} onChange={e => setNewFuel({...newFuel, key:e.target.value})} placeholder="รหัส (เช่น: hybrid)" style={{flex:'1 1 100px', fontSize:13}}/>
              <input className="input" value={newFuel.label} onChange={e => setNewFuel({...newFuel, label:e.target.value})} placeholder="ชื่อ (เช่น: ไฮบริด)" style={{flex:'2 1 140px', fontSize:13}}/>
              <button className="btn sm primary" onClick={addFuelType} disabled={!newFuel.key.trim() || !newFuel.label.trim()}>เพิ่ม</button>
            </div>
          </div>
          <button className="btn primary" onClick={requestSaveFuel} disabled={saving}>{saving ? 'กำลังบันทึก...' : '💾 บันทึกเชื้อเพลิง'}</button>
        </div>
      )}

      {/* ── Departments (embedded) ── */}
      {subTab === 'depts' && (
        <DeptManager departments={departments} pushToast={pushToast}/>
      )}

      <ConfirmDialog confirm={confirmDlg} onClose={() => setConfirmDlg(null)}/>
    </div>
  );
}

// ─── Dept Manager (admin only) ─────────────────────────────────────
function DeptManager({ departments, pushToast }) {
  const [newName, setNewName] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingDept, setDeletingDept] = React.useState(null);
  const [confirmHideDept, setConfirmHideDept] = React.useState(null);
  const [confirmAddName, setConfirmAddName] = React.useState(null);
  const [editModalDept, setEditModalDept] = React.useState(null);
  const [editName, setEditName] = React.useState('');

  const [localDepts, setLocalDepts] = React.useState(() =>
    [...departments].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );
  React.useEffect(() => {
    setLocalDepts([...departments].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  }, [departments]);

  const activeCount = localDepts.filter(d => d.active !== false).length;
  const hiddenCount = localDepts.filter(d => d.active === false).length;

  async function addDept() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    const maxOrder = localDepts.reduce((m, d) => Math.max(m, d.sort_order || 0), 0);
    const id = `dept-${Date.now()}`;
    const { error } = await supabase.from('departments').insert({ id, name, sort_order: maxOrder + 1, active: true });
    setAdding(false);
    if (error) { pushToast({ kind: 'danger', title: error.message.includes('unique') ? 'ชื่อแผนกนี้มีอยู่แล้ว' : error.message }); return; }
    setNewName('');
    pushToast({ kind: 'ok', title: `เพิ่มแผนก "${name}" เรียบร้อยแล้ว` });
  }

  async function saveEdit() {
    const dept = editModalDept;
    const name = editName.trim();
    if (!name || name === dept.name) { setEditModalDept(null); return; }
    setSaving(true);
    const { error } = await supabase.from('departments').update({ name }).eq('id', dept.id);
    setSaving(false);
    if (error) { pushToast({ kind: 'danger', title: error.message.includes('unique') ? 'ชื่อแผนกนี้มีอยู่แล้ว' : error.message }); return; }
    setEditModalDept(null);
    pushToast({ kind: 'ok', title: `แก้ไขชื่อแผนก "${dept.name}" → "${name}" แล้ว` });
  }

  async function toggleActive(dept) {
    const newActive = !dept.active;
    setLocalDepts(prev => prev.map(d => d.id === dept.id ? { ...d, active: newActive } : d));
    await supabase.from('departments').update({ active: newActive }).eq('id', dept.id);
    pushToast({ kind: 'ok', title: `${newActive ? 'เปิดใช้' : 'ซ่อน'} แผนก "${dept.name}" แล้ว` });
    setConfirmHideDept(null);
  }

  async function moveOrder(dept, dir) {
    const idx = localDepts.findIndex(d => d.id === dept.id);
    const swap = localDepts[idx + dir];
    if (!swap) return;
    const newDepts = [...localDepts];
    [newDepts[idx], newDepts[idx + dir]] = [newDepts[idx + dir], newDepts[idx]];
    setLocalDepts(newDepts);
    await Promise.all([
      supabase.from('departments').update({ sort_order: swap.sort_order }).eq('id', dept.id),
      supabase.from('departments').update({ sort_order: dept.sort_order }).eq('id', swap.id),
    ]);
  }

  async function doDeleteDept(dept) {
    await supabase.from('departments').delete().eq('id', dept.id);
    pushToast({ kind: 'ok', title: `ลบแผนก "${dept.name}" แล้ว` });
  }

  return (
    <div>
      <div style={{padding:'12px 14px', background:'var(--info-bg)', borderRadius:9, marginBottom:18, fontSize:13, color:'#1e4f88', lineHeight:1.6}}>
        <b>🏢 จัดการแผนก</b><br/>
        แผนกที่เปิดใช้งานจะแสดงในฟอร์มสมัครสมาชิกและแก้ไขโปรไฟล์ ซ่อนแผนกเพื่อไม่ให้เลือกใหม่ (ไม่ลบข้อมูลเดิม)
      </div>

      <div style={{display:'flex', gap:8, marginBottom:18}}>
        <input className="input" value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && newName.trim() && setConfirmAddName(newName.trim())}
          placeholder="ชื่อแผนกใหม่..." style={{flex:1}}/>
        <button className="btn primary" onClick={() => newName.trim() && setConfirmAddName(newName.trim())} disabled={adding || !newName.trim()}>
          {adding ? 'กำลังเพิ่ม...' : '+ เพิ่มแผนก'}
        </button>
      </div>

      <div className="col gap-2">
        {localDepts.length === 0 && (
          <div style={{textAlign:'center', padding:'28px 0', color:'var(--text-3)'}}>
            <div style={{fontSize:32, marginBottom:8}}>🏢</div>
            ยังไม่มีแผนก — เพิ่มแผนกแรกด้านบน
          </div>
        )}
        {localDepts.map((dept, idx) => (
          <div key={dept.id} style={{
            display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
            border: '1px solid var(--border)', borderRadius:10,
            background: dept.active !== false ? 'var(--surface)' : 'var(--bg)',
            opacity: dept.active !== false ? 1 : 0.7,
          }}>
            <div style={{display:'flex', flexDirection:'column', gap:2, flexShrink:0}}>
              <button onClick={() => moveOrder(dept, -1)} disabled={idx === 0}
                style={{background:'none', border:'1px solid var(--border)', borderRadius:4, width:22, height:20, cursor:idx===0?'default':'pointer', color:idx===0?'var(--text-3)':'var(--text-2)', fontSize:10, display:'grid', placeItems:'center', lineHeight:1}}>▲</button>
              <button onClick={() => moveOrder(dept, 1)} disabled={idx === localDepts.length - 1}
                style={{background:'none', border:'1px solid var(--border)', borderRadius:4, width:22, height:20, cursor:idx===localDepts.length-1?'default':'pointer', color:idx===localDepts.length-1?'var(--text-3)':'var(--text-2)', fontSize:10, display:'grid', placeItems:'center', lineHeight:1}}>▼</button>
            </div>

            <div style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontWeight:500, fontSize:14}}>{dept.name}</span>
              {dept.active === false && (
                <span style={{fontSize:11, background:'var(--warn-bg)', color:'var(--warn)', padding:'1px 8px', borderRadius:999, fontWeight:600}}>ซ่อน</span>
              )}
            </div>

            <div style={{display:'flex', gap:6, flexShrink:0}}>
              <button className="btn sm ghost" title="แก้ไขชื่อ"
                onClick={() => { setEditModalDept(dept); setEditName(dept.name); }}>✏️</button>
              {dept.active !== false
                ? <button className="btn sm ghost" onClick={() => setConfirmHideDept(dept)}>🙈 ซ่อน</button>
                : <button className="btn sm ghost" style={{color:'var(--ok)'}} onClick={() => toggleActive(dept)}>👁️ แสดง</button>
              }
              <button className="btn sm danger" onClick={() => setDeletingDept(dept)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time stats */}
      <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center'}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:600, padding:'4px 10px', borderRadius:999, background:'rgba(110,42,140,0.1)', color:'var(--pea-purple)'}}>
          🏢 {localDepts.length} แผนก
        </span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:600, padding:'4px 10px', borderRadius:999, background:'var(--ok-bg)', color:'var(--ok)'}}>
          ✓ {activeCount} เปิดใช้งาน
        </span>
        {hiddenCount > 0 && (
          <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:600, padding:'4px 10px', borderRadius:999, background:'var(--warn-bg)', color:'var(--warn)'}}>
            🙈 {hiddenCount} ซ่อน
          </span>
        )}
      </div>

      {/* Edit modal */}
      {editModalDept && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'grid', placeItems:'center', zIndex:300}} onClick={e => e.target === e.currentTarget && setEditModalDept(null)}>
          <div style={{background:'var(--surface)', borderRadius:16, padding:'28px 28px 24px', width:400, maxWidth:'90vw', boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
              <div style={{width:40, height:40, borderRadius:10, background:'var(--warn-bg)', display:'grid', placeItems:'center', fontSize:20}}>⚠️</div>
              <div>
                <div style={{fontWeight:700, fontSize:15}}>แก้ไขชื่อแผนก</div>
                <div style={{fontSize:12.5, color:'var(--text-3)'}}>"{editModalDept.name}"</div>
              </div>
            </div>
            <div className="field" style={{marginBottom:16}}>
              <label className="field-lbl">ชื่อใหม่ <span className="req">*</span></label>
              <input className="input" autoFocus value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditModalDept(null); }}/>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button className="btn ghost" onClick={() => setEditModalDept(null)}>ยกเลิก</button>
              <button className="btn primary" onClick={saveEdit} disabled={saving || !editName.trim()}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกชื่อใหม่'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm add dialog */}
      {confirmAddName && (
        <ConfirmDialog
          confirm={{
            kind: "primary",
            title: `เพิ่มแผนก "${confirmAddName}"?`,
            message: "แผนกใหม่จะปรากฏในฟอร์มสมัครสมาชิกและแก้ไขโปรไฟล์ทันที สามารถซ่อนหรือแก้ไขชื่อได้ภายหลัง",
            confirmLabel: "เพิ่มแผนก",
            onConfirm: () => { setConfirmAddName(null); addDept(); },
          }}
          onClose={() => setConfirmAddName(null)}
        />
      )}

      {/* Confirm hide dialog */}
      {confirmHideDept && (
        <ConfirmDialog
          confirm={{
            kind: "warn",
            title: `ซ่อนแผนก "${confirmHideDept.name}"?`,
            message: "แผนกนี้จะไม่แสดงในฟอร์มสมัครสมาชิก แต่สมาชิกที่อยู่ในแผนกนี้จะไม่ถูกกระทบ สามารถกดแสดงเพื่อยกเลิกได้ภายหลัง",
            confirmLabel: "ซ่อนแผนก",
            onConfirm: () => toggleActive(confirmHideDept),
          }}
          onClose={() => setConfirmHideDept(null)}
        />
      )}

      {/* Confirm delete dialog */}
      {deletingDept && (
        <ConfirmDialog
          confirm={{
            kind: "negative",
            title: `ลบแผนก "${deletingDept.name}"?`,
            message: "หากมีสมาชิกอยู่ในแผนกนี้ ข้อมูลสมาชิกจะไม่ถูกลบ — แต่แผนกจะหายออกจากรายการถาวร",
            confirmLabel: "ลบแผนก",
            onConfirm: () => doDeleteDept(deletingDept),
          }}
          onClose={() => setDeletingDept(null)}
        />
      )}
    </div>
  );
}

// ─── Demo Settings ────────────────────────────────────────────────
function DateTimePicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(() => {
    const d = value ? new Date(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [time, setTime] = React.useState(() => {
    if (!value) return { h: '08', m: '00' };
    const d = new Date(value);
    return { h: String(d.getHours()).padStart(2,'0'), m: String(d.getMinutes()).padStart(2,'0') };
  });
  const ref = React.useRef(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date(); today.setHours(0,0,0,0);

  React.useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function selectDay(y, mo, d) {
    const h = parseInt(time.h) || 0;
    const m = parseInt(time.m) || 0;
    const iso = new Date(y, mo, d, h, m).toISOString().slice(0,16);
    onChange(iso);
    if (selectedDate) {
      const prev = new Date(selectedDate);
      prev.setFullYear(y); prev.setMonth(mo); prev.setDate(d);
      prev.setHours(h, m, 0, 0);
      onChange(prev.toISOString().slice(0,16));
    }
  }

  function applyTime(field, val) {
    const newTime = { ...time, [field]: val };
    setTime(newTime);
    if (selectedDate) {
      const d = new Date(selectedDate);
      d.setHours(parseInt(newTime.h)||0, parseInt(newTime.m)||0, 0, 0);
      onChange(d.toISOString().slice(0,16));
    }
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const TH_DAYS = ['อา','จ','อ','พ','พฤ','ศ','ส'];

  function fmtSelected() {
    if (!value) return '';
    const d = new Date(value);
    return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear()+543} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  const weeks = [];
  let cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
    if (cells.length === 7) { weeks.push(cells); cells = []; }
  }
  if (cells.length > 0) { while (cells.length < 7) cells.push(null); weeks.push(cells); }

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)',
          background:'var(--surface)', cursor:'pointer', fontSize:13,
          color: value ? 'var(--text)' : 'var(--text-3)', width:'100%', textAlign:'left',
          transition:'border-color 0.15s',
          ...(open ? {borderColor:'var(--pea-purple)', boxShadow:'0 0 0 2px var(--pea-purple-20,rgba(109,40,217,.15))'} : {}),
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,color:'var(--text-3)'}}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{flex:1}}>{value ? fmtSelected() : 'เลือกวันที่และเวลา...'}</span>
        {value && (
          <span
            onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }}
            style={{color:'var(--text-3)', fontSize:14, lineHeight:1, padding:'0 2px', cursor:'pointer'}}
            title="ล้าง">✕</span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:200,
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
          padding:14, minWidth:280,
        }}>
          {/* Month nav */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <button type="button" className="btn sm ghost icon" onClick={() => setViewDate(new Date(year, month-1, 1))} style={{padding:'4px 8px'}}>‹</button>
            <span style={{fontWeight:600, fontSize:13}}>{TH_MONTHS[month]} {year+543}</span>
            <button type="button" className="btn sm ghost icon" onClick={() => setViewDate(new Date(year, month+1, 1))} style={{padding:'4px 8px'}}>›</button>
          </div>

          {/* Day headers */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4}}>
            {TH_DAYS.map(d => (
              <div key={d} style={{textAlign:'center', fontSize:10.5, fontWeight:600, color:'var(--text-3)', padding:'2px 0'}}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {weeks.map((wk, wi) => (
            <div key={wi} style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:2}}>
              {wk.map((day, di) => {
                if (!day) return <div key={di}/>;
                const thisDate = new Date(year, month, day);
                thisDate.setHours(0,0,0,0);
                const isPast = thisDate < today;
                const isSel = selectedDate && thisDate.toDateString() === new Date(selectedDate).toDateString();
                const isToday = thisDate.toDateString() === today.toDateString();
                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => !isPast && selectDay(year, month, day)}
                    style={{
                      border: 'none', borderRadius:6, padding:'5px 2px',
                      fontSize:12.5, cursor: isPast ? 'default' : 'pointer',
                      fontWeight: isSel || isToday ? 700 : 400,
                      background: isSel ? 'var(--pea-purple)' : isToday ? 'var(--pea-purple-50,rgba(109,40,217,.12))' : 'transparent',
                      color: isSel ? '#fff' : isPast ? 'var(--text-3)' : 'var(--text)',
                      transition:'background 0.1s',
                    }}
                  >{day}</button>
                );
              })}
            </div>
          ))}

          {/* Time picker */}
          <div style={{
            borderTop:'1px solid var(--border)', marginTop:10, paddingTop:10,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{color:'var(--text-3)', flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{fontSize:12, color:'var(--text-3)'}}>เวลา</span>
            <div style={{display:'flex', alignItems:'center', gap:4, marginLeft:'auto'}}>
              <input type="number" min="0" max="23" value={time.h}
                onChange={e => applyTime('h', String(parseInt(e.target.value)||0).padStart(2,'0'))}
                style={{width:42, textAlign:'center', padding:'4px 6px', borderRadius:6, border:'1px solid var(--border)', fontSize:13, fontFamily:'monospace', background:'var(--surface)', color:'var(--text)'}}
              />
              <span style={{fontWeight:700, color:'var(--text-3)'}}>:</span>
              <input type="number" min="0" max="59" step="5" value={time.m}
                onChange={e => applyTime('m', String(parseInt(e.target.value)||0).padStart(2,'0'))}
                style={{width:42, textAlign:'center', padding:'4px 6px', borderRadius:6, border:'1px solid var(--border)', fontSize:13, fontFamily:'monospace', background:'var(--surface)', color:'var(--text)'}}
              />
            </div>
            <button type="button" className="btn sm primary" style={{marginLeft:4, padding:'4px 10px', fontSize:12}} onClick={() => setOpen(false)}>ตกลง</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoSettings({ demoEnabled, onSetDemoEnabled, bookings, onDeleteAll, maintenanceMode, onSetMaintenanceMode, maintenanceCfg, onSetMaintenanceCfg, defaultMaintenanceMsg }) {
  const demoBookings = (bookings || []).filter(b => b.id.startsWith('DEMO'));
  const [confirmDlg, setConfirmDlg] = React.useState(null);
  const [showDemoList, setShowDemoList] = React.useState(true);
  const [showLog, setShowLog] = React.useState(false);

  const DEFAULT_MSG = defaultMaintenanceMsg || 'ผู้ดูแลระบบกำลังปรับปรุงและอัปเดตระบบ\nกรุณาลองเข้าใช้งานใหม่ในภายหลัง';
  const [msg, setMsg] = React.useState(maintenanceCfg.message || DEFAULT_MSG);
  const [returnAt, setReturnAt] = React.useState(maintenanceCfg.returnAt || '');
  const msgChanged = msg !== (maintenanceCfg.message || DEFAULT_MSG) || returnAt !== (maintenanceCfg.returnAt || '');

  const maintenanceLog = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pea-maintenance-log') || '[]'); } catch { return []; }
  }, [maintenanceMode]);

  function saveCfg() {
    onSetMaintenanceCfg({ ...maintenanceCfg, message: msg, returnAt: returnAt || null });
  }

  function requestToggle() {
    if (demoEnabled) {
      setConfirmDlg({ kind:'warn', title:'ปิดระบบทดสอบ?', message:'เมื่อปิด ปุ่ม "🎮 ทดสอบจอง" จะหายไปจากหน้าแดชบอร์ด การจอง Demo ที่มีอยู่จะยังคงอยู่จนกว่าจะลบ', onConfirm: () => onSetDemoEnabled(false) });
    } else {
      setConfirmDlg({ kind:'primary', title:'เปิดระบบทดสอบ?', message:'เมื่อเปิด ผู้ใช้ทุกคนจะเห็นปุ่ม "🎮 ทดสอบจอง" ในหน้าแดชบอร์ด และสามารถสร้างการจอง Demo ได้', onConfirm: () => onSetDemoEnabled(true) });
    }
  }

  function requestToggleMaintenance() {
    if (maintenanceMode) {
      setConfirmDlg({ kind:'primary', title:'เปิดระบบใช้งาน?', message:'ผู้ใช้ทุกคนจะสามารถเข้าใช้งานระบบได้ตามปกติ', onConfirm: () => onSetMaintenanceMode(false) });
    } else {
      setConfirmDlg({ kind:'negative', title:'ปิดระบบเพื่อบำรุงรักษา?', message:'ผู้ใช้ทั่วไปจะเข้าระบบไม่ได้จนกว่าแอดมินจะเปิดระบบอีกครั้ง · แอดมินยังเข้าได้ตามปกติ', onConfirm: () => onSetMaintenanceMode(true) });
    }
  }

  function fmtLogTime(iso) {
    try {
      const d = new Date(iso);
      const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear()+543} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    } catch { return iso; }
  }

  return (
    <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:12}}>

      {/* ── Maintenance mode ── */}
      <div className="card card-pad" style={{border: maintenanceMode ? '1.5px solid var(--danger)' : undefined}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:14}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <strong>🔧 โหมดบำรุงรักษา</strong>
              {maintenanceMode && <span style={{fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--danger-bg,#fee2e2)', color:'var(--danger)', fontWeight:600}}>ปิดระบบอยู่</span>}
            </div>
            <p style={{margin:'3px 0 0', fontSize:12.5, color:'var(--text-2)'}}>เมื่อปิดระบบ ผู้ใช้ทั่วไปจะเห็นหน้า "ระบบปิดบำรุงรักษา" — แอดมินยังเข้าใช้งานได้พร้อมแถบเตือนสีส้ม</p>
          </div>
          <button className={"btn sm" + (maintenanceMode ? " danger" : " ghost")} onClick={requestToggleMaintenance} style={{flexShrink:0, minWidth:90}}>
            {maintenanceMode ? '🔴 ปิดระบบอยู่' : 'เปิดระบบอยู่'}
          </button>
        </div>

        {/* Message & return time config */}
        <div style={{borderTop:'1px solid var(--border)', paddingTop:14, display:'flex', flexDirection:'column', gap:10}}>
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5}}>
              <label style={{fontSize:13, fontWeight:500}}>ข้อความแจ้งผู้ใช้งาน</label>
              <button className="btn sm ghost" style={{fontSize:11, padding:'2px 8px'}} onClick={() => setMsg(DEFAULT_MSG)} title="คืนค่าเริ่มต้น">↺ ค่าเริ่มต้น</button>
            </div>
            <textarea
              className="input"
              rows={3}
              value={msg}
              onChange={e => setMsg(e.target.value)}
              style={{fontSize:13, resize:'vertical', lineHeight:1.6, width:'100%'}}
              placeholder="ข้อความที่ผู้ใช้เห็นขณะระบบปิด..."
            />
          </div>
          <div>
            <label style={{fontSize:13, fontWeight:500, display:'block', marginBottom:5}}>
              วันที่/เวลาที่คาดว่าจะกลับมาให้บริการ
              <span style={{fontSize:11, fontWeight:400, color:'var(--text-3)', marginLeft:6}}>(ไม่บังคับ)</span>
            </label>
            <DateTimePicker value={returnAt} onChange={setReturnAt}/>
          </div>
          <button className="btn sm primary" style={{alignSelf:'flex-start'}} onClick={saveCfg} disabled={!msgChanged && !returnAt && !maintenanceCfg.returnAt}>
            💾 บันทึกข้อความ{msgChanged ? ' *' : ''}
          </button>
        </div>

        {/* Maintenance history log */}
        <div style={{borderTop:'1px solid var(--border)', marginTop:14, paddingTop:12}}>
          <button
            type="button"
            onClick={() => setShowLog(v => !v)}
            style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:0, fontSize:12.5, color:'var(--text-2)', fontWeight:500}}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transition:'transform 0.2s', transform: showLog ? 'rotate(90deg)' : 'rotate(0deg)'}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            ประวัติการแก้ไขโหมดบำรุงรักษา
            {maintenanceLog.length > 0 && <span style={{fontSize:11, padding:'1px 6px', borderRadius:99, background:'var(--surface-2)', color:'var(--text-3)', marginLeft:2}}>{maintenanceLog.length}</span>}
          </button>
          {showLog && (
            <div style={{marginTop:10}}>
              {maintenanceLog.length === 0 ? (
                <p style={{fontSize:12, color:'var(--text-3)', margin:0}}>ยังไม่มีประวัติ</p>
              ) : (
                <div style={{position:'relative', paddingLeft:20}}>
                  <div style={{position:'absolute', left:7, top:8, bottom:8, width:2, background:'var(--border)'}}/>
                  {maintenanceLog.map((entry, i) => (
                    <div key={i} style={{position:'relative', paddingBottom:10, display:'flex', alignItems:'flex-start', gap:10}}>
                      <div style={{
                        position:'absolute', left:-20, top:2,
                        width:16, height:16, borderRadius:'50%',
                        background: entry.action === 'off' ? 'var(--danger)' : 'var(--ok)',
                        border:'2px solid var(--surface)',
                        flexShrink:0,
                      }}/>
                      <div style={{background:'var(--surface-2)', borderRadius:8, padding:'6px 10px', fontSize:12, flex:1}}>
                        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                          <span style={{
                            fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:99,
                            background: entry.action === 'off' ? 'var(--danger-bg,#fee2e2)' : 'var(--ok-bg,#dcfce7)',
                            color: entry.action === 'off' ? 'var(--danger)' : 'var(--ok)',
                          }}>
                            {entry.action === 'off' ? '🔴 ปิดระบบ' : '🟢 เปิดระบบ'}
                          </span>
                          <span style={{color:'var(--text-3)', fontSize:11, marginLeft:'auto'}}>{fmtLogTime(entry.at)}</span>
                        </div>
                        <div style={{color:'var(--text-2)', marginTop:3}}>โดย <b>{entry.by}</b></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Demo booking ── */}
      <div className="card card-pad" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16}}>
        <div>
          <strong>ปุ่มทดสอบการจองในหน้าแดชบอร์ด</strong>
          <p style={{margin:'3px 0 0', fontSize:12.5, color:'var(--text-2)'}}>เมื่อเปิด จะแสดงปุ่ม "🎮 ทดสอบจอง" ในหน้าแดชบอร์ด · ผู้ใช้ทุกคนสามารถสร้างการจอง Demo ได้</p>
        </div>
        <button className={"btn sm" + (demoEnabled ? " primary" : " ghost")} onClick={requestToggle} style={{flexShrink:0, minWidth:80}}>
          {demoEnabled ? '✓ เปิดอยู่' : 'ปิดอยู่'}
        </button>
      </div>

      <div className="card card-pad">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: (showDemoList && demoBookings.length) ? 12 : 4}}>
          <button
            type="button"
            onClick={() => demoBookings.length > 0 && setShowDemoList(v => !v)}
            style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor: demoBookings.length > 0 ? 'pointer' : 'default', padding:0, fontSize:14, fontWeight:600, color:'var(--text)'}}
          >
            {demoBookings.length > 0 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transition:'transform 0.2s', transform: showDemoList ? 'rotate(90deg)' : 'rotate(0deg)'}}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
            การจอง Demo ในระบบ ({demoBookings.length} รายการ)
          </button>
          {demoBookings.length > 0 && (
            <button className="btn sm danger" onClick={() => setConfirmDlg({
              kind: 'negative',
              title: 'ลบการจอง Demo ทั้งหมด?',
              message: `จะลบการจอง Demo จำนวน ${demoBookings.length} รายการออกจากระบบถาวร`,
              onConfirm: onDeleteAll,
            })}>ลบทั้งหมด</button>
          )}
        </div>
        {demoBookings.length === 0 ? (
          <p style={{color:'var(--text-3)', fontSize:13, margin:0}}>ไม่มีการจอง Demo · กดปุ่ม "🎮 ทดสอบจอง" ในหน้าแดชบอร์ดเพื่อสร้าง</p>
        ) : showDemoList ? (
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {demoBookings.map(b => (
              <div key={b.id} style={{display:'flex', gap:10, alignItems:'center', padding:'7px 10px', background:'var(--surface-2)', borderRadius:8, fontSize:12.5, flexWrap:'wrap'}}>
                <span style={{fontWeight:700, color:'var(--pea-purple)', minWidth:130, fontFamily:'monospace'}}>{b.id}</span>
                <span style={{color:'var(--text-2)'}}>{b.vehicleId}</span>
                <span style={{color:'var(--text-3)'}}>{b.from?.slice(0,10)}</span>
                <span style={{marginLeft:'auto', fontSize:11.5, padding:'2px 8px', borderRadius:99, background:'var(--status-booked-bg)', color:'var(--status-booked)', border:'1px solid var(--status-booked)'}}>
                  {b.status === 'approved' ? 'อนุมัติแล้ว' : b.status === 'booked' ? 'รออนุมัติ' : b.status}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <ConfirmDialog confirm={confirmDlg} onClose={() => setConfirmDlg(null)}/>
    </div>
  );
}

export { SettingsScreen }
