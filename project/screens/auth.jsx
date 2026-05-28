// Auth: Login + Register screens

function AuthScreen({ onLogin, registered, onRegister }) {
  const [mode, setMode] = React.useState("login"); // login | register | pending | forgot | forgot-sent
  const [empId, setEmpId] = React.useState("62145");
  const [password, setPassword] = React.useState("••••••••");
  const [role, setRole] = React.useState("user");
  const [err, setErr] = React.useState("");
  const [forgotEmail, setForgotEmail] = React.useState("");

  // Register state
  const [reg, setReg] = React.useState({
    name: "", emp: "", dept: window.DEPARTMENTS[0], email: "", phone: "", password: "", confirm: "",
  });

  function doLogin() {
    setErr("");
    // mock: any creds work; role chosen via selector
    const user = window.USERS.find((u) => u.role === role && u.status === "approved");
    if (!user) { setErr("ไม่พบบัญชีที่ใช้งานได้"); return; }
    onLogin(user);
  }
  function doRegister() {
    if (!reg.name || !reg.emp || !reg.email) { setErr("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (reg.password !== reg.confirm) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    onRegister(reg);
    setMode("pending");
  }
  function doForgot() {
    setErr("");
    if (!forgotEmail.trim()) { setErr("กรุณากรอกอีเมลหรือรหัสพนักงาน"); return; }
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
              { n: "24+", l: "คันในระบบ" },
              { n: "8", l: "ประเภทรถ" },
              { n: "24/7", l: "เรียลไทม์" },
              { n: "100%", l: "ตรวจสอบได้" },
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
                  <input className="input" value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="เช่น 62145"/>
                </div>
                <div className="field">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <label className="field-lbl">รหัสผ่าน <span className="req">*</span></label>
                    <a style={{fontSize:12, color:'var(--pea-purple)', fontWeight:500, cursor:'pointer'}} onClick={() => { setErr(""); setMode("forgot"); }}>
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <div style={{background:'var(--surface-2)', border:'1px dashed var(--border-strong)', borderRadius:10, padding:'12px 14px'}}>
                  <div style={{fontSize:11.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>โหมดทดลอง · เลือกบทบาท</div>
                  <div style={{display:'flex', gap:6}}>
                    {[
                      { v:"user", l:"ผู้ใช้งาน" },
                      { v:"manager", l:"ผู้จัดการ" },
                      { v:"admin", l:"ผู้ดูแลระบบ" },
                    ].map((r) => (
                      <button key={r.v}
                        className={"btn sm" + (role === r.v ? " primary" : " ghost")}
                        style={{flex:1}}
                        onClick={() => setRole(r.v)}>
                        {r.l}
                      </button>
                    ))}
                  </div>
                </div>

                {err && <div className="input-err">{err}</div>}

                <button className="btn primary lg" onClick={doLogin} style={{marginTop:8}}>
                  เข้าสู่ระบบ
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
                    {window.DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
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

                <button className="btn primary lg" onClick={doRegister} style={{marginTop:8}}>สมัครสมาชิก</button>
                <div style={{textAlign:'center', fontSize:13, color:'var(--text-2)'}}>
                  มีบัญชีแล้ว? <a style={{color:'var(--pea-purple)', fontWeight:600, cursor:'pointer'}} onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
                </div>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-3)', fontSize:13, cursor:'pointer', marginBottom:14}} onClick={() => setMode("login")}>
                {window.I.arrowLeft} กลับสู่หน้าเข้าสู่ระบบ
              </div>
              <h2 style={{fontSize:24, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.01em'}}>ลืมรหัสผ่าน</h2>
              <p className="muted" style={{margin:'0 0 22px', fontSize:13.5}}>
                กรอกอีเมลหรือรหัสพนักงานที่ใช้สมัครบัญชี
                ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลที่ลงทะเบียนไว้
              </p>
              <div className="col gap-3">
                <div className="field">
                  <label className="field-lbl">อีเมล หรือ รหัสพนักงาน <span className="req">*</span></label>
                  <input className="input" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@pea.co.th หรือ 6xxxx" autoFocus/>
                </div>

                {err && <div className="input-err">{err}</div>}

                <button className="btn primary lg" onClick={doForgot}>
                  {window.I.upload} ส่งลิงก์รีเซ็ตรหัสผ่าน
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
                  {window.I.check}
                </div>
                <h2 style={{margin:'0 0 6px', fontSize:18, color:'var(--ok)'}}>ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว</h2>
                <p style={{margin:0, fontSize:13.5, color:'#1f5b3a'}}>
                  ระบบส่งอีเมลพร้อมลิงก์รีเซ็ตรหัสผ่านไปยัง <b>{forgotEmail}</b><br/>
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
                  {window.I.clock}
                </div>
                <h2 style={{margin:'0 0 6px', fontSize:18, color:'var(--warn)'}}>รอการอนุมัติจากผู้ดูแลระบบ</h2>
                <p style={{margin:0, fontSize:13.5, color:'#7a5500'}}>
                  ระบบได้รับใบสมัครของท่านเรียบร้อยแล้ว <br/>
                  เมื่อผู้ดูแลระบบอนุมัติบัญชี ท่านจะได้รับอีเมลแจ้งและสามารถเข้าสู่ระบบได้
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

window.AuthScreen = AuthScreen;
