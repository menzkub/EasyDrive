import React from 'react'
import { I } from '../components'
import { DEPARTMENTS as DEPT_FALLBACK } from '../data'
import { supabase } from '../supabase'

function AuthScreen({ onLogin, registered, onRegister, departments }) {
  const DEPARTMENTS = departments?.filter(d => d.active !== false).length
    ? departments.filter(d => d.active !== false).map(d => d.name)
    : DEPT_FALLBACK;
  const [mode, setMode] = React.useState("login");

  // ── Public stats from Supabase (no auth required) ──
  const [stats, setStats] = React.useState({ vehicles: null, types: null, bookings: null });
  React.useEffect(() => {
    Promise.all([
      supabase.from('vehicles').select('type'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
    ]).then(([vRes, bRes]) => {
      if (vRes.data) {
        const types = new Set(vRes.data.map(v => v.type)).size;
        setStats({ vehicles: vRes.data.length, types, bookings: bRes.count ?? 0 });
      }
    });
  }, []);
  const [empId, setEmpId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");

  const [showPw, setShowPw] = React.useState(false);
  const [showRegPw, setShowRegPw] = React.useState(false);
  const [showRegConfirm, setShowRegConfirm] = React.useState(false);

  const [mfaFactorId, setMfaFactorId] = React.useState('');
  const [mfaChallengeId, setMfaChallengeId] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaErr, setMfaErr] = React.useState('');

  const [reg, setReg] = React.useState({
    name: "", emp: "", dept: DEPARTMENTS[0], email: "", phone: "", password: "", confirm: "",
  });

  async function finishLogin() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setLoading(false);
    if (!profile || profile.status === 'pending') {
      await supabase.auth.signOut();
      setMode("pending");
      return;
    }
    if (profile.status === 'rejected') {
      await supabase.auth.signOut();
      setErr("บัญชีของท่านไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบ");
      return;
    }
    onLogin(profile);
  }

  async function doLogin() {
    setErr("");
    if (!empId.trim() || !password.trim()) { setErr("กรุณากรอกรหัสพนักงานและรหัสผ่าน"); return; }
    setLoading(true);
    const email = `${empId.trim()}@easydrive.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr("รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    // Check if 2FA is required
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find(f => f.status === 'verified');
      if (totp) {
        const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: totp.id });
        setMfaFactorId(totp.id);
        setMfaChallengeId(challenge.id);
        setMfaCode('');
        setMfaErr('');
        setLoading(false);
        setMode("mfa");
        return;
      }
    }
    await finishLogin();
  }

  async function doVerifyMfa() {
    setMfaErr('');
    if (!mfaCode.trim()) { setMfaErr('กรุณากรอกรหัส OTP'); return; }
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode.trim() });
    if (error) {
      setMfaErr('รหัสไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาลองใหม่');
      setLoading(false);
      return;
    }
    await finishLogin();
  }

  async function doRegister() {
    if (!reg.name || !reg.emp || !reg.email) { setErr("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (reg.password !== reg.confirm) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    if (reg.password.length < 6) { setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setLoading(true);
    setErr("");
    const authEmail = `${reg.emp.trim()}@easydrive.local`;
    const { data, error } = await supabase.auth.signUp({ email: authEmail, password: reg.password });
    if (error) {
      setErr(error.message === 'User already registered' ? 'รหัสพนักงานนี้มีในระบบแล้ว' : error.message);
      setLoading(false);
      return;
    }
    // Create profile record
    await supabase.from('profiles').insert({
      id: data.user.id,
      emp: reg.emp.trim(),
      name: reg.name,
      dept: reg.dept,
      role: 'user',
      status: 'pending',
      phone: reg.phone || '',
      email: reg.email,
    });
    // Sign out immediately — needs admin approval before use
    await supabase.auth.signOut();
    setLoading(false);
    onRegister();
    setMode("pending");
  }

  async function doForgot() {
    setErr("");
    if (!forgotEmail.trim()) { setErr("กรุณากรอกรหัสพนักงาน"); return; }
    setLoading(true);
    const email = `${forgotEmail.trim()}@easydrive.local`;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) { setErr("ไม่พบบัญชีนี้ในระบบ"); return; }
    setMode("forgot-sent");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side" style={{paddingBottom:136}}>
        <div style={{display:'flex', alignItems:'center', gap:14, position:'relative', zIndex:2}}>
          <div className="brand-logo" style={{width:54, height:54, background:'var(--pea-orange)'}}>
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
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
          <div>
            <div style={{fontWeight:700, fontSize:18, letterSpacing:'0.04em'}}>EasyDrive</div>
            <div style={{opacity:0.75, fontSize:13}}>การไฟฟ้าส่วนภูมิภาค สาขาฝาง</div>
          </div>
        </div>

        {/* Floating status badges */}
        <div style={{position:'absolute', top:90, right:28, animation:'floatBadge1 4.5s ease-in-out infinite', zIndex:2}}>
          <div style={{background:'rgba(255,255,255,0.13)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'9px 13px', display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:'#4abe8a', boxShadow:'0 0 6px #4abe8a'}}/>
            <span style={{color:'white', fontSize:12, fontWeight:600}}>อนุมัติแล้ว</span>
          </div>
        </div>
        <div style={{position:'absolute', top:168, left:18, animation:'floatBadge2 5.5s ease-in-out infinite', zIndex:2}}>
          <div style={{background:'rgba(255,255,255,0.11)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:12, padding:'9px 13px', display:'flex', alignItems:'center', gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAA61A" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
            <span style={{color:'white', fontSize:12, fontWeight:600}}>จองล่วงหน้า</span>
          </div>
        </div>
        <div style={{position:'absolute', bottom:172, right:22, animation:'floatBadge3 3.8s ease-in-out infinite', zIndex:2}}>
          <div style={{background:'rgba(243,112,33,0.22)', backdropFilter:'blur(10px)', border:'1px solid rgba(243,112,33,0.35)', borderRadius:12, padding:'9px 13px', display:'flex', alignItems:'center', gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAA61A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
            <span style={{color:'white', fontSize:12, fontWeight:600}}>Check-in สำเร็จ</span>
          </div>
        </div>

        <div style={{marginTop:'auto', position:'relative', zIndex:2}}>
          <div style={{fontSize:12, opacity:0.65, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14}}>Vehicle Booking System</div>
          <h1 style={{fontSize:38, lineHeight:1.15, margin:'0 0 18px', fontWeight:700, letterSpacing:'-0.015em', textWrap:'balance'}}>
            ระบบจองรถใช้งาน<br/>
            <span style={{color:'var(--pea-orange-light)'}}>เพื่อภารกิจไฟฟ้า</span>
          </h1>
          <p style={{fontSize:15, opacity:0.78, lineHeight:1.7, maxWidth:420, textWrap:'pretty'}}>
            บริหารการใช้รถยนต์ส่วนกลางของหน่วยงาน
            ตรวจสอบสถานะรถ จองล่วงหน้า และอนุมัติได้
            ในระบบเดียว — โปร่งใส ตรวจสอบได้ ทุกขั้นตอน
          </p>
          <div className="auth-stats" style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginTop:32, maxWidth:480}}>
            {[
              { n: stats.vehicles !== null ? `${stats.vehicles}` : '—', l: "คันในระบบ" },
              { n: stats.types !== null ? `${stats.types}` : '—', l: "ประเภทรถ" },
              { n: stats.bookings !== null ? `${stats.bookings}` : '—', l: "การจองทั้งหมด" },
              { n: "24/7", l: "เรียลไทม์" },
            ].map((s, i) => (
              <div key={i} style={{background:'rgba(0,0,0,0.2)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'14px 16px'}}>
                <div style={{fontSize:24, fontWeight:700, letterSpacing:'-0.01em', minHeight:32}}>{s.n}</div>
                <div style={{fontSize:12, opacity:0.7}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:24, fontSize:11, opacity:0.45, letterSpacing:'0.03em'}}>
            © 2026 Provincial Electricity Authority — Fang District
          </div>
        </div>

        {/* Animated car scene */}
        <div style={{position:'absolute', bottom:0, left:0, right:0, height:128, overflow:'hidden', zIndex:1}}>
          {/* Road */}
          <div style={{position:'absolute', bottom:0, left:'-5%', right:'-5%', height:52, background:'rgba(0,0,0,0.38)', borderTop:'2px solid rgba(255,255,255,0.12)'}}>
            {/* Scrolling center line */}
            <div style={{position:'absolute', top:'50%', transform:'translateY(-50%)', display:'flex', gap:24, animation:'roadScroll 0.65s linear infinite', width:'300%'}}>
              {Array.from({length: 28}).map((_, i) => (
                <div key={i} style={{width:44, height:4, background:'rgba(255,255,255,0.42)', borderRadius:2, flexShrink:0}}/>
              ))}
            </div>
          </div>
          {/* Floating car */}
          <div style={{position:'absolute', bottom:16, left:'50%', animation:'authCarFloat 2.8s ease-in-out infinite'}}>
            <svg width="172" height="60" viewBox="0 0 172 60" fill="none">
              <ellipse cx="86" cy="57" rx="72" ry="5" fill="rgba(0,0,0,0.22)"/>
              <rect x="5" y="25" width="162" height="22" rx="6" fill="white" fillOpacity="0.93"/>
              <path d="M34 25 L54 5 L118 5 L136 25Z" fill="white" fillOpacity="0.88"/>
              <path d="M56 7 L56 25 L94 25 L94 7Z" fill="rgba(110,42,140,0.22)"/>
              <path d="M96 7 L96 25 L131 25 L118 7Z" fill="rgba(110,42,140,0.22)"/>
              <line x1="95" y1="5" x2="95" y2="25" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
              <rect x="5" y="25" width="162" height="3" rx="2" fill="rgba(255,255,255,0.42)"/>
              <line x1="80" y1="26" x2="80" y2="46" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5"/>
              <circle cx="44" cy="47" r="12" fill="#12062A"/>
              <circle cx="128" cy="47" r="12" fill="#12062A"/>
              <circle cx="44" cy="47" r="6.5" fill="rgba(255,255,255,0.28)"/>
              <circle cx="128" cy="47" r="6.5" fill="rgba(255,255,255,0.28)"/>
              <circle cx="44" cy="47" r="2.5" fill="rgba(255,255,255,0.65)"/>
              <circle cx="128" cy="47" r="2.5" fill="rgba(255,255,255,0.65)"/>
              <rect x="160" y="29" width="11" height="9" rx="3" fill="#FFE566" fillOpacity="0.96"/>
              <ellipse cx="168" cy="33" rx="20" ry="7" fill="#FFE566" fillOpacity="0.14"/>
              <rect x="1" y="29" width="9" height="9" rx="3" fill="#FF4444" fillOpacity="0.82"/>
              <ellipse cx="5" cy="33" rx="14" ry="6" fill="#FF4444" fillOpacity="0.1"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-mobile-hero">
          <div style={{position:'absolute', width:220, height:220, borderRadius:'50%', background:'rgba(243,112,33,0.22)', top:-90, right:-50, pointerEvents:'none'}}/>
          <div style={{position:'absolute', width:150, height:150, borderRadius:'50%', background:'rgba(250,166,26,0.14)', bottom:-70, left:-40, pointerEvents:'none'}}/>
          <div style={{position:'relative', zIndex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
              <div style={{width:42, height:42, borderRadius:11, background:'var(--pea-orange)', display:'grid', placeItems:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(243,112,33,0.5)'}}>
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
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
              <div>
                <div style={{fontWeight:700, fontSize:15, letterSpacing:'0.04em'}}>EasyDrive</div>
                <div style={{fontSize:11.5, opacity:0.8}}>การไฟฟ้าส่วนภูมิภาค สาขาฝาง</div>
              </div>
            </div>
            <div style={{fontSize:22, fontWeight:700, lineHeight:1.2, letterSpacing:'-0.01em'}}>ระบบจองรถใช้งาน</div>
            <div style={{fontSize:12, opacity:0.72, marginTop:6}}>Vehicle Booking System · จ.เชียงใหม่</div>
          </div>
        </div>
        <div className="auth-form-card">
          {mode === "login" && (
            <>
              <div style={{width:40, height:4, background:'linear-gradient(90deg, var(--pea-purple), var(--pea-orange))', borderRadius:4, marginBottom:18, animation:'formSlideIn 0.4s ease-out both'}}/>
              <h2 style={{fontSize:24, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.01em', animation:'formSlideIn 0.4s 0.05s ease-out both'}}>ยินดีต้อนรับกลับมา</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:13.5, animation:'formSlideIn 0.4s 0.1s ease-out both'}}>เข้าสู่ระบบด้วยรหัสพนักงาน</p>
              {registered && (
                <div style={{background:'var(--ok-bg)', border:'1px solid #c5e5d2', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--ok)', marginBottom:18}}>
                  <b>สมัครสมาชิกสำเร็จ</b> · กรุณารอผู้ดูแลระบบอนุมัติบัญชี
                </div>
              )}
              <div className="col gap-3">
                <div className="field">
                  <label className="field-lbl">รหัสพนักงาน <span className="req">*</span></label>
                  <input className="input" value={empId} onChange={(e) => setEmpId(e.target.value)}
                    placeholder="รหัสพนักงาน" onKeyDown={(e) => e.key === 'Enter' && doLogin()}/>
                </div>
                <div className="field">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <label className="field-lbl">รหัสผ่าน <span className="req">*</span></label>
                    <a style={{fontSize:12, color:'var(--pea-purple)', fontWeight:500, cursor:'pointer'}} onClick={() => { setErr(""); setMode("forgot"); }}>
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <div style={{position:'relative'}}>
                    <input className="input" type={showPw ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                      style={{paddingRight:42}}/>
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:16, padding:4, lineHeight:1}}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                {err && <div className="input-err">{err}</div>}
                <button className="btn primary lg" onClick={doLogin} disabled={loading} style={{marginTop:8}}>
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>
                <div style={{textAlign:'center', fontSize:13, color:'var(--text-2)', marginTop:6}}>
                  ยังไม่มีบัญชี? <a style={{color:'var(--pea-purple)', fontWeight:600, cursor:'pointer'}} onClick={() => setMode("register")}>สมัครสมาชิก</a>
                </div>
              </div>
            </>
          )}

          {mode === "register" && (
            <>
              <div style={{width:40, height:4, background:'linear-gradient(90deg, var(--pea-purple), var(--pea-orange))', borderRadius:4, marginBottom:18}}/>
              <h2 style={{fontSize:24, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.01em'}}>สมัครสมาชิก</h2>
              <p className="muted" style={{margin:'0 0 22px', fontSize:13.5}}>บัญชีต้องผ่านการอนุมัติจากผู้ดูแลระบบก่อนใช้งาน</p>
              <div className="col gap-3">
                <div className="grid-2">
                  <div className="field">
                    <label className="field-lbl">ชื่อ-นามสกุล <span className="req">*</span></label>
                    <input className="input" value={reg.name} onChange={(e) => setReg({...reg, name:e.target.value})} placeholder="นาย/นาง/นางสาว ..."/>
                  </div>
                  <div className="field">
                    <label className="field-lbl">รหัสพนักงาน <span className="req">*</span></label>
                    <input className="input" value={reg.emp} onChange={(e) => setReg({...reg, emp:e.target.value})} placeholder="63xxx"/>
                  </div>
                </div>
                <div className="field">
                  <label className="field-lbl">สังกัดแผนก <span className="req">*</span></label>
                  <select className="select" value={reg.dept} onChange={(e) => setReg({...reg, dept:e.target.value})}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-lbl">อีเมล <span className="req">*</span></label>
                    <input className="input" value={reg.email} onChange={(e) => setReg({...reg, email:e.target.value})} placeholder="name@pea.co.th"/>
                  </div>
                  <div className="field">
                    <label className="field-lbl">เบอร์โทร</label>
                    <input className="input" value={reg.phone} onChange={(e) => setReg({...reg, phone:e.target.value})} placeholder="08x-xxx-xxxx"/>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-lbl">รหัสผ่าน <span className="req">*</span></label>
                    <div style={{position:'relative'}}>
                      <input className="input" type={showRegPw ? "text" : "password"} value={reg.password}
                        onChange={(e) => setReg({...reg, password:e.target.value})} style={{paddingRight:42}}/>
                      <button type="button" onClick={() => setShowRegPw(!showRegPw)}
                        style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:16, padding:4, lineHeight:1}}>
                        {showRegPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-lbl">ยืนยันรหัสผ่าน <span className="req">*</span></label>
                    <div style={{position:'relative'}}>
                      <input className="input" type={showRegConfirm ? "text" : "password"} value={reg.confirm}
                        onChange={(e) => setReg({...reg, confirm:e.target.value})} style={{paddingRight:42}}/>
                      <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)}
                        style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:16, padding:4, lineHeight:1}}>
                        {showRegConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>
                {err && <div className="input-err">{err}</div>}
                <button className="btn primary lg" onClick={doRegister} disabled={loading} style={{marginTop:8}}>
                  {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                </button>
                <div style={{textAlign:'center', fontSize:13, color:'var(--text-2)'}}>
                  มีบัญชีแล้ว? <a style={{color:'var(--pea-purple)', fontWeight:600, cursor:'pointer'}} onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
                </div>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-3)', fontSize:13, cursor:'pointer', marginBottom:14}} onClick={() => setMode("login")}>
                {I.arrowLeft} กลับสู่หน้าเข้าสู่ระบบ
              </div>
              <h2 style={{fontSize:24, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.01em'}}>ลืมรหัสผ่าน</h2>
              <p className="muted" style={{margin:'0 0 22px', fontSize:13.5}}>
                กรอกรหัสพนักงานที่ใช้สมัครบัญชี ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลที่ลงทะเบียนไว้
              </p>
              <div className="col gap-3">
                <div className="field">
                  <label className="field-lbl">รหัสพนักงาน <span className="req">*</span></label>
                  <input className="input" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="เช่น 63xxx" autoFocus/>
                </div>
                {err && <div className="input-err">{err}</div>}
                <button className="btn primary lg" onClick={doForgot} disabled={loading}>
                  {loading ? "กำลังส่ง..." : <>{I.upload} ส่งลิงก์รีเซ็ตรหัสผ่าน</>}
                </button>
                <div style={{padding:'12px 14px', background:'var(--info-bg)', borderRadius:9, fontSize:12.5, color:'#1e4f88', lineHeight:1.6, marginTop:8}}>
                  <b>หมายเหตุ:</b> หากท่านไม่ได้รับอีเมลภายใน 10 นาที กรุณาตรวจสอบ Junk/Spam หรือติดต่อผู้ดูแลระบบ
                  ที่ <a href="tel:053-451-666" style={{color:'var(--pea-purple)', fontWeight:600}}>053-451-666</a> ต่อ 12
                </div>
              </div>
            </>
          )}

          {mode === "forgot-sent" && (
            <>
              <div style={{background:'var(--ok-bg)', border:'1px solid #c5e5d2', borderRadius:14, padding:'24px 22px', marginBottom:20}}>
                <div style={{width:48, height:48, background:'var(--ok)', borderRadius:12, display:'grid', placeItems:'center', color:'white', marginBottom:14}}>
                  {I.check}
                </div>
                <h2 style={{margin:'0 0 6px', fontSize:18, color:'var(--ok)'}}>ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว</h2>
                <p style={{margin:0, fontSize:13.5, color:'#1f5b3a'}}>
                  ระบบส่งอีเมลพร้อมลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลที่ลงทะเบียนไว้<br/>
                  กรุณาตรวจสอบกล่องจดหมายและคลิกลิงก์ภายใน 30 นาที
                </p>
              </div>
              <button className="btn primary lg" style={{width:'100%'}} onClick={() => { setMode("login"); setForgotEmail(""); }}>
                กลับสู่หน้าเข้าสู่ระบบ
              </button>
              <div style={{textAlign:'center', marginTop:14, fontSize:13, color:'var(--text-2)'}}>
                ไม่ได้รับอีเมล? <a style={{color:'var(--pea-purple)', fontWeight:600, cursor:'pointer'}} onClick={() => setMode("forgot")}>ส่งใหม่อีกครั้ง</a>
              </div>
            </>
          )}

          {mode === "mfa" && (
            <>
              <div style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-3)', fontSize:13, cursor:'pointer', marginBottom:14}}
                onClick={async () => { await supabase.auth.signOut(); setMode("login"); setMfaCode(''); }}>
                {I.arrowLeft} กลับ
              </div>
              <div style={{width:52, height:52, borderRadius:14, background:'linear-gradient(135deg, var(--pea-purple), var(--pea-purple-deep))', display:'grid', placeItems:'center', marginBottom:16}}>
                <span style={{fontSize:26}}>🛡️</span>
              </div>
              <h2 style={{fontSize:24, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.01em'}}>ยืนยันตัวตน 2 ชั้น</h2>
              <p className="muted" style={{margin:'0 0 26px', fontSize:13.5, lineHeight:1.6}}>
                กรอกรหัส 6 หลักจากแอป Authenticator<br/>
                <span style={{fontSize:12}}>(Google Authenticator, Microsoft Authenticator, Authy)</span>
              </p>
              <div className="col gap-3">
                <div className="field">
                  <label className="field-lbl">รหัส OTP (6 หลัก)</label>
                  <input className="input" value={mfaCode} autoFocus
                    onChange={e => setMfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    onKeyDown={e => e.key === 'Enter' && mfaCode.length === 6 && doVerifyMfa()}
                    placeholder="000000" maxLength={6}
                    style={{letterSpacing:8, fontSize:26, textAlign:'center', fontWeight:700, padding:'14px 16px'}}/>
                </div>
                {mfaErr && <div className="input-err">{mfaErr}</div>}
                <button className="btn primary lg" onClick={doVerifyMfa} disabled={loading || mfaCode.length < 6} style={{marginTop:4}}>
                  {loading ? 'กำลังตรวจสอบ...' : '🛡️ ยืนยัน'}
                </button>
                <div style={{padding:'12px 14px', background:'var(--info-bg)', borderRadius:9, fontSize:12.5, color:'#1e4f88', lineHeight:1.6}}>
                  รหัสจะเปลี่ยนทุก 30 วินาที — ถ้ากรอกผิดให้รอรหัสใหม่แล้วลองอีกครั้ง
                </div>
              </div>
            </>
          )}

          {mode === "pending" && (
            <>
              <div style={{background:'var(--warn-bg)', border:'1px solid #f0d8a8', borderRadius:14, padding:'24px 22px', marginBottom:20}}>
                <div style={{width:48, height:48, background:'var(--warn)', borderRadius:12, display:'grid', placeItems:'center', color:'white', marginBottom:14}}>
                  {I.clock}
                </div>
                <h2 style={{margin:'0 0 6px', fontSize:18, color:'var(--warn)'}}>รอการอนุมัติจากผู้ดูแลระบบ</h2>
                <p style={{margin:0, fontSize:13.5, color:'#7a5500'}}>
                  ระบบได้รับใบสมัครของท่านเรียบร้อยแล้ว<br/>
                  เมื่อผู้ดูแลระบบอนุมัติบัญชี ท่านจะสามารถเข้าสู่ระบบได้
                </p>
              </div>
              <button className="btn ghost lg" style={{width:'100%'}} onClick={() => setMode("login")}>
                กลับสู่หน้าเข้าสู่ระบบ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { AuthScreen };
