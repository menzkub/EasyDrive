import React from 'react'
import { I } from '../components'
import { DEPARTMENTS } from '../data'
import { supabase } from '../supabase'

function AuthScreen({ onLogin, registered, onRegister }) {
  const [mode, setMode] = React.useState("login");
  const [empId, setEmpId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");

  const [reg, setReg] = React.useState({
    name: "", emp: "", dept: DEPARTMENTS[0], email: "", phone: "", password: "", confirm: "",
  });

  async function doLogin() {
    setErr("");
    if (!empId.trim() || !password.trim()) { setErr("กรุณากรอกรหัสพนักงานและรหัสผ่าน"); return; }
    setLoading(true);
    const email = `${empId.trim()}@pea-fang.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr("รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    // Load profile
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

  async function doRegister() {
    if (!reg.name || !reg.emp || !reg.email) { setErr("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (reg.password !== reg.confirm) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    if (reg.password.length < 6) { setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setLoading(true);
    setErr("");
    const authEmail = `${reg.emp.trim()}@pea-fang.local`;
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
    const email = `${forgotEmail.trim()}@pea-fang.local`;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) { setErr("ไม่พบบัญชีนี้ในระบบ"); return; }
    setMode("forgot-sent");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div className="brand-logo" style={{width:54, height:54, fontSize:14, background:'var(--pea-orange)'}}>PEA</div>
          <div>
            <div style={{fontWeight:700, fontSize:18, letterSpacing:'0.04em'}}>PEA FANG</div>
            <div style={{opacity:0.75, fontSize:13}}>การไฟฟ้าส่วนภูมิภาค สาขาฝาง</div>
          </div>
        </div>

        <div style={{marginTop:'auto', position:'relative', zIndex:1}}>
          <div style={{fontSize:13, opacity:0.7, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14}}>Vehicle Booking System</div>
          <h1 style={{fontSize:38, lineHeight:1.15, margin:'0 0 18px', fontWeight:700, letterSpacing:'-0.015em', textWrap:'balance'}}>
            ระบบจองรถใช้งาน<br/>
            <span style={{color:'var(--pea-orange-light)'}}>เพื่อภารกิจไฟฟ้า</span>
          </h1>
          <p style={{fontSize:15, opacity:0.78, lineHeight:1.7, maxWidth:420, textWrap:'pretty'}}>
            บริหารการใช้รถยนต์ส่วนกลางของหน่วยงาน
            ตรวจสอบสถานะรถ จองล่วงหน้า และอนุมัติได้
            ในระบบเดียว — โปร่งใส ตรวจสอบได้ ทุกขั้นตอน
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginTop:36, maxWidth:480}}>
            {[
              { n: "24+", l: "คันในระบบ" }, { n: "8", l: "ประเภทรถ" },
              { n: "24/7", l: "เรียลไทม์" }, { n: "100%", l: "ตรวจสอบได้" },
            ].map((s, i) => (
              <div key={i} style={{background:'rgba(0,0,0,0.18)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'14px 16px'}}>
                <div style={{fontSize:24, fontWeight:700, letterSpacing:'-0.01em'}}>{s.n}</div>
                <div style={{fontSize:12, opacity:0.7}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:'relative', zIndex:1, marginTop:32, fontSize:11.5, opacity:0.55, letterSpacing:'0.03em'}}>
          © 2026 Provincial Electricity Authority — Fang District
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-form-inner">
          {mode === "login" && (
            <>
              <h2 style={{fontSize:24, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.01em'}}>ยินดีต้อนรับกลับมา</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:13.5}}>เข้าสู่ระบบด้วยรหัสพนักงาน PEA</p>
              {registered && (
                <div style={{background:'var(--ok-bg)', border:'1px solid #c5e5d2', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--ok)', marginBottom:18}}>
                  <b>สมัครสมาชิกสำเร็จ</b> · กรุณารอผู้ดูแลระบบอนุมัติบัญชี
                </div>
              )}
              <div className="col gap-3">
                <div className="field">
                  <label className="field-lbl">รหัสพนักงาน <span className="req">*</span></label>
                  <input className="input" value={empId} onChange={(e) => setEmpId(e.target.value)}
                    placeholder="เช่น 508087" onKeyDown={(e) => e.key === 'Enter' && doLogin()}/>
                </div>
                <div className="field">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <label className="field-lbl">รหัสผ่าน <span className="req">*</span></label>
                    <a style={{fontSize:12, color:'var(--pea-purple)', fontWeight:500, cursor:'pointer'}} onClick={() => { setErr(""); setMode("forgot"); }}>
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doLogin()}/>
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
                    <input className="input" type="password" value={reg.password} onChange={(e) => setReg({...reg, password:e.target.value})}/>
                  </div>
                  <div className="field">
                    <label className="field-lbl">ยืนยันรหัสผ่าน <span className="req">*</span></label>
                    <input className="input" type="password" value={reg.confirm} onChange={(e) => setReg({...reg, confirm:e.target.value})}/>
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
