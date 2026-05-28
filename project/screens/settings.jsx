// Settings: Calendar Sync + Notifications preferences

function SettingsScreen({ currentUser, bookings, vehicles }) {
  const [tab, setTab] = React.useState("calendar");

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <h2 className="mt-0" style={{margin:0}}>การตั้งค่าและการเชื่อมต่อ</h2>
        <p className="sub" style={{margin:'2px 0 0'}}>เชื่อมปฏิทินส่วนตัว ปรับการแจ้งเตือน และจัดการบัญชี</p>
      </div>

      <div className="card card-pad">
        <div className="tabs">
          <button className={"tab" + (tab === "calendar" ? " active" : "")} onClick={() => setTab("calendar")}>📅 Calendar Sync</button>
          <button className={"tab" + (tab === "noti" ? " active" : "")} onClick={() => setTab("noti")}>🔔 การแจ้งเตือน</button>
          <button className={"tab" + (tab === "account" ? " active" : "")} onClick={() => setTab("account")}>👤 บัญชี</button>
        </div>

        {tab === "calendar" && <CalendarSync currentUser={currentUser} bookings={bookings} vehicles={vehicles}/>}
        {tab === "noti" && <NotificationSettings/>}
        {tab === "account" && <AccountSettings currentUser={currentUser}/>}
      </div>
    </div>
  );
}

// ─── Calendar Sync ──────────────────────────────────────────────────
function CalendarSync({ currentUser, bookings, vehicles }) {
  const [providers, setProviders] = React.useState({
    google:   { connected: true,  email: "somchai.j@pea.co.th", lastSync: "2 นาทีที่แล้ว", calendar: "PEA FANG จองรถ" },
    outlook:  { connected: false, email: "", lastSync: null },
    apple:    { connected: false, email: "", lastSync: null },
  });
  const [autoSync, setAutoSync] = React.useState(true);
  const [syncFilters, setSyncFilters] = React.useState({
    myBookings: true,
    teamBookings: false,
    approvedOnly: true,
    includeRejected: false,
  });
  const [showSubscribeUrl, setShowSubscribeUrl] = React.useState(false);

  const myBookings = bookings.filter((b) => b.userId === currentUser.id);
  const subscribeUrl = `webcal://pea-fang.gov.th/api/calendar/${currentUser.id}.ics?token=••••••••`;

  function toggleProvider(key) {
    if (providers[key].connected) {
      setProviders({...providers, [key]: { ...providers[key], connected: false, email: "", lastSync: null }});
    } else {
      const fakeEmails = { google: currentUser.email, outlook: currentUser.email?.replace("@pea.co.th", "@outlook.com"), apple: currentUser.email };
      setProviders({...providers, [key]: { connected: true, email: fakeEmails[key], lastSync: "เมื่อกี้", calendar: "PEA FANG จองรถ" }});
    }
  }

  return (
    <div>
      <div style={{padding:'14px 16px', background:'var(--pea-purple-50)', border:'1px solid var(--pea-purple-100)', borderRadius:10, marginBottom:18, display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:38, height:38, borderRadius:10, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
          {window.I.calendar}
        </div>
        <div style={{flex:1}}>
          <b style={{fontSize:13.5}}>ซิงค์การจองรถไปยังปฏิทินส่วนตัวของคุณ</b>
          <div className="text-sm" style={{color:'var(--text-2)', lineHeight:1.5}}>
            เมื่อเชื่อมต่อแล้ว การจองที่ได้รับการอนุมัติจะปรากฏในปฏิทินส่วนตัวอัตโนมัติ
            พร้อมการแจ้งเตือนก่อนถึงเวลาใช้รถ
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
        <ProviderCard
          name="Google Calendar" icon="🗓️" color="#4285F4" provider={providers.google}
          onConnect={() => toggleProvider("google")}
        />
        <ProviderCard
          name="Microsoft Outlook" icon="📧" color="#0078D4" provider={providers.outlook}
          onConnect={() => toggleProvider("outlook")}
        />
        <ProviderCard
          name="Apple Calendar" icon="🍎" color="#000" provider={providers.apple}
          onConnect={() => toggleProvider("apple")}
        />
      </div>

      <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
        ตัวเลือกการซิงค์
      </div>
      <div className="card card-pad" style={{padding:'12px 16px', marginBottom:14}}>
        <SettingRow
          label="ซิงค์อัตโนมัติทุก 15 นาที"
          desc="อัพเดทการจองใหม่ในปฏิทินทันทีเมื่อมีการเปลี่ยนแปลง"
          checked={autoSync} onChange={setAutoSync}/>
        <div className="divider"></div>
        <SettingRow
          label="ซิงค์การจองของฉัน"
          desc="การจองที่คุณเป็นผู้สร้างเองทั้งหมด"
          checked={syncFilters.myBookings}
          onChange={(v) => setSyncFilters({...syncFilters, myBookings:v})}/>
        <SettingRow
          label="ซิงค์การจองของทีม/แผนก"
          desc="การจองของสมาชิกในแผนกเดียวกัน"
          checked={syncFilters.teamBookings}
          onChange={(v) => setSyncFilters({...syncFilters, teamBookings:v})}/>
        <SettingRow
          label="เฉพาะที่อนุมัติแล้ว"
          desc="ไม่รวมการจองที่ยังรออนุมัติ"
          checked={syncFilters.approvedOnly}
          onChange={(v) => setSyncFilters({...syncFilters, approvedOnly:v})}/>
      </div>

      <div style={{fontSize:12.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
        ส่งออกและ Subscribe URL
      </div>
      <div className="card card-pad" style={{padding:'16px'}}>
        <div style={{display:'flex', gap:10, marginBottom:14, flexWrap:'wrap'}}>
          <button className="btn ghost">{window.I.download} ดาวน์โหลด .ics</button>
          <button className="btn ghost">{window.I.print} พิมพ์ตารางการจอง</button>
          <button className="btn" onClick={() => setShowSubscribeUrl(!showSubscribeUrl)}>
            {window.I.qr} {showSubscribeUrl ? "ซ่อน" : "แสดง"} Subscribe URL
          </button>
        </div>
        {showSubscribeUrl && (
          <div>
            <div className="text-xs muted" style={{marginBottom:6}}>
              คัดลอก URL นี้แล้ว Subscribe ในปฏิทินที่ใช้ (รองรับ webcal:// และ ICS)
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'10px 12px', background:'var(--surface-2)',
              border:'1px solid var(--border)', borderRadius:8,
              fontFamily:'var(--font-mono)', fontSize:11.5,
            }}>
              <code style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{subscribeUrl}</code>
              <button className="btn sm primary" onClick={() => navigator.clipboard?.writeText(subscribeUrl)}>คัดลอก</button>
            </div>
            <div className="text-xs" style={{color:'var(--warn)', marginTop:6}}>
              {window.I.warn} URL ส่วนตัว — ห้ามแชร์กับผู้อื่น
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ name, icon, color, provider, onConnect }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'14px 16px',
      border: provider.connected ? '1.5px solid var(--ok)' : '1px solid var(--border)',
      borderRadius:10,
      background: provider.connected ? 'var(--ok-bg)' : 'var(--surface)',
    }}>
      <div style={{
        width:42, height:42, borderRadius:10,
        background:'white', border:'1px solid var(--border)',
        display:'grid', placeItems:'center', fontSize:22,
      }}>{icon}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <b style={{fontSize:14}}>{name}</b>
          {provider.connected && <span className="pill done"><span className="dot"></span>เชื่อมต่อแล้ว</span>}
        </div>
        {provider.connected ? (
          <div className="text-xs muted" style={{marginTop:2}}>
            {provider.email} · ปฏิทิน "{provider.calendar}" · ซิงค์ล่าสุด {provider.lastSync}
          </div>
        ) : (
          <div className="text-xs muted" style={{marginTop:2}}>
            ส่งการจองไปแสดงในปฏิทิน {name} ของคุณอัตโนมัติ
          </div>
        )}
      </div>
      <button
        className={"btn sm " + (provider.connected ? "danger" : "primary")}
        onClick={onConnect}>
        {provider.connected ? <>{window.I.x} ยกเลิกเชื่อมต่อ</> : <>{window.I.plus} เชื่อมต่อ</>}
      </button>
    </div>
  );
}

function SettingRow({ label, desc, checked, onChange }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:14, padding:'10px 0'}}>
      <div style={{flex:1}}>
        <div style={{fontSize:13.5, fontWeight:500}}>{label}</div>
        <div className="text-xs muted" style={{marginTop:2}}>{desc}</div>
      </div>
      <button
        className={"switch" + (checked ? " on" : "")}
        onClick={() => onChange(!checked)}
      ></button>
    </div>
  );
}

// ─── Notification Settings ──────────────────────────────────────────
function NotificationSettings() {
  const [prefs, setPrefs] = React.useState({
    booking_approved: { in: true, email: true, push: true },
    booking_rejected: { in: true, email: true, push: false },
    booking_reminder: { in: true, email: false, push: true },
    urgent_assignment: { in: true, email: true, push: true },
    maintenance_due: { in: true, email: true, push: false },
    pending_approval: { in: true, email: false, push: true },
    new_member: { in: true, email: true, push: false },
    mileage_correction: { in: true, email: false, push: false },
  });

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
      <div style={{padding:'14px 0 0', display:'flex', gap:8, justifyContent:'flex-end'}}>
        <button className="btn primary">บันทึกการตั้งค่า</button>
      </div>
    </div>
  );
}

// ─── Account Settings ──────────────────────────────────────────────
function AccountSettings({ currentUser }) {
  return (
    <div className="col gap-3">
      <div style={{display:'flex', gap:16, alignItems:'center', padding:'16px 18px', background:'linear-gradient(135deg, var(--pea-purple-50), var(--pea-orange-50))', borderRadius:12}}>
        <div className="avatar lg" style={{width:64, height:64, fontSize:24, background:'var(--pea-purple)'}}>{currentUser.name.charAt(0)}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:18, fontWeight:700}}>{currentUser.name}</div>
          <div className="text-sm muted">{currentUser.role === "admin" ? "ผู้ดูแลระบบ" : currentUser.role === "manager" ? "ผู้จัดการ" : "ผู้ใช้งาน"} · {currentUser.dept}</div>
          <div className="text-xs muted" style={{marginTop:2}}>รหัส {currentUser.emp} · สมาชิกตั้งแต่ {window.fmtDate(currentUser.joined)}</div>
        </div>
        <button className="btn ghost">{window.I.edit} แก้ไขโปรไฟล์</button>
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="field-lbl">อีเมล</label>
          <input className="input" value={currentUser.email} readOnly/>
        </div>
        <div className="field">
          <label className="field-lbl">เบอร์โทร</label>
          <input className="input" value={currentUser.phone} readOnly/>
        </div>
      </div>

      <div className="divider"></div>

      <h3 style={{fontSize:14, fontWeight:600, margin:0}}>ความปลอดภัย</h3>
      <button className="btn ghost" style={{justifyContent:'flex-start', textAlign:'left', padding:'14px 16px'}}>
        🔒 เปลี่ยนรหัสผ่าน
        <span style={{marginLeft:'auto', color:'var(--text-3)'}}>{window.I.arrowRight}</span>
      </button>
      <button className="btn ghost" style={{justifyContent:'flex-start', textAlign:'left', padding:'14px 16px'}}>
        🛡️ การยืนยันตัวตนสองชั้น (2FA)
        <span style={{marginLeft:'auto', color:'var(--text-3)'}}>{window.I.arrowRight}</span>
      </button>
      <button className="btn ghost" style={{justifyContent:'flex-start', textAlign:'left', padding:'14px 16px'}}>
        📱 อุปกรณ์ที่ลงชื่อเข้าใช้
        <span style={{marginLeft:'auto', color:'var(--text-3)'}}>{window.I.arrowRight}</span>
      </button>
    </div>
  );
}

window.SettingsScreen = SettingsScreen;
