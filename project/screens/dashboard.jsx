// Dashboard - realtime vehicle status overview

function Dashboard({ user, vehicles, bookings, users, setRoute, onSelectVehicle }) {
  const today = window.TODAY;
  const [filter, setFilter] = React.useState("all"); // all | available | booked | approved | urgent | maintenance
  const [search, setSearch] = React.useState("");

  // Derived stats
  const todaysBookings = bookings.filter((b) => b.from.startsWith(today));
  const activeApproved = todaysBookings.filter((b) => b.status === "approved" || b.status === "urgent");
  const pendingApprovals = bookings.filter((b) => b.status === "booked").length;

  // Vehicle live status today
  function liveStatus(v) {
    if (v.status === "maintenance") return "maintenance";
    if (v.status === "unavailable") return "unavailable";
    const tb = todaysBookings.find((b) => b.vehicleId === v.id && (b.status === "approved" || b.status === "urgent" || b.status === "booked"));
    if (tb) return tb.status;
    return "available";
  }

  const counts = {
    total: vehicles.length,
    available: vehicles.filter((v) => liveStatus(v) === "available").length,
    booked: vehicles.filter((v) => liveStatus(v) === "booked").length,
    approved: vehicles.filter((v) => liveStatus(v) === "approved").length,
    urgent: vehicles.filter((v) => liveStatus(v) === "urgent").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
  };

  const filtered = vehicles.filter((v) => {
    const s = liveStatus(v);
    if (filter !== "all" && s !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!v.plate.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q) && !v.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      {/* Header welcome */}
      <div className="card" style={{padding:'18px 22px', marginBottom:18, background:'linear-gradient(135deg, var(--pea-purple-deep) 0%, var(--pea-purple) 100%)', color:'white', border:'none'}}>
        <div style={{display:'flex', alignItems:'center', gap:18, flexWrap:'wrap'}}>
          <div style={{flex:'1 1 280px', minWidth:0}}>
            <div style={{fontSize:12, opacity:0.7, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>วันนี้ · พฤหัสบดี 21 พฤษภาคม 2569</div>
            <div style={{fontSize:20, fontWeight:600, letterSpacing:'-0.01em'}}>สวัสดี, คุณ{user.name.split(' ')[0]} 👋</div>
            <div style={{fontSize:13, opacity:0.78, marginTop:2}}>
              {user.role === "admin" ? `คุณมี ${pendingApprovals} การจองรอการอนุมัติ และ ${users.filter(u => u.status === "pending").length} สมาชิกใหม่รอการตรวจสอบ` :
               user.role === "manager" ? `คุณมี ${pendingApprovals} การจองรอการอนุมัติในวันนี้` :
               `วันนี้มีรถพร้อมใช้งาน ${counts.available} คันจาก ${counts.total} คัน`}
            </div>
          </div>
          <div style={{display:'flex', gap:10}}>
            <button className="btn accent" onClick={() => setRoute("booking")}>
              {window.I.plus} จองรถใหม่
            </button>
            {(user.role === "manager" || user.role === "admin") && pendingApprovals > 0 && (
              <button className="btn" style={{background:'rgba(255,255,255,0.16)', color:'white', border:'1px solid rgba(255,255,255,0.2)'}} onClick={() => setRoute("approvals")}>
                ดูคำขออนุมัติ ({pendingApprovals})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{marginBottom:18}}>
        <StatBox lbl="รถทั้งหมด" val={counts.total} foot="ในระบบ" ico={window.I.car} variant="purple"/>
        <StatBox lbl="พร้อมใช้งาน" val={counts.available} foot={`${Math.round(counts.available/counts.total*100)}% ของทั้งหมด`} ico={window.I.check} variant="ok"/>
        <StatBox lbl="กำลังใช้งาน / ติดจอง" val={counts.approved + counts.urgent + counts.booked} foot="วันนี้" ico={window.I.clock} variant="accent"/>
        <StatBox lbl="บำรุงรักษา" val={counts.maintenance} foot="นำเข้าศูนย์" ico={window.I.wrench} variant="warn"/>
      </div>

      <div className="grid-3" style={{gridTemplateColumns:'2fr 1fr', gap:18, alignItems:'start', marginBottom:18}}>
        {/* Today's timeline */}
        <div className="card card-pad">
          <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:14}}>
            <h2 className="mt-0" style={{margin:0}}>ไทม์ไลน์การใช้รถวันนี้</h2>
            <div className="muted text-xs" style={{marginLeft:'auto'}}>06:00 – 20:00 · เรียลไทม์ <span style={{display:'inline-block', width:6, height:6, background:'var(--ok)', borderRadius:'50%', marginLeft:4, animation:'pulse 2s infinite'}}></span></div>
          </div>
          <TimelineView vehicles={vehicles.slice(0, 10)} bookings={todaysBookings} users={users} onSelectVehicle={onSelectVehicle}/>
        </div>

        {/* Alerts */}
        <div className="card card-pad">
          <h2 className="mt-0">การแจ้งเตือน</h2>
          <p className="sub">รายการที่ต้องดำเนินการ</p>
          <div className="col gap-2" style={{marginTop:2}}>
            <AlertItem kind="urgent" title="ภารกิจด่วน" body="รถ V008 ถูกเรียกใช้งานด่วน (ไฟดับ ต.แม่ข่า)" time="5 นาทีที่แล้ว"/>
            {(user.role === "manager" || user.role === "admin") && (
              <AlertItem kind="warn" title={`${pendingApprovals} รายการรออนุมัติ`} body="กรุณาตรวจสอบคำขอจองรถใหม่" time="ตอนนี้" onClick={() => setRoute("approvals")}/>
            )}
            <AlertItem kind="warn" title="ใกล้ถึงเวลาใช้รถ" body="รถ V005 ครบกำหนดเช็คระยะ 30 พ.ค. (อีก 9 วัน)" time="วันนี้"/>
            <AlertItem kind="info" title="พ.ร.บ. ใกล้ครบกำหนด" body="รถ V009 และ V015 ครบกำหนด มิ.ย. นี้" time="วันนี้"/>
            {user.role === "admin" && (
              <AlertItem kind="info" title="สมาชิกใหม่ 3 ราย" body="ปวีณา, ณัฐพล, สุภาวดี รอการอนุมัติ" time="2 ชม." onClick={() => setRoute("members")}/>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="card card-pad">
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:14, flexWrap:'wrap'}}>
          <div>
            <h2 className="mt-0" style={{margin:0}}>สถานะรถยนต์ ({filtered.length} คัน)</h2>
            <p className="sub" style={{margin:'2px 0 0'}}>รถยนต์ทั้งหมดในระบบ — สถานะอัพเดทเรียลไทม์</p>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginLeft:'auto'}}>
            <div style={{position:'relative'}}>
              <input className="input" placeholder="ค้นหาทะเบียน/ยี่ห้อ..." value={search} onChange={(e) => setSearch(e.target.value)} style={{padding:'7px 12px 7px 32px', width:230, fontSize:13}}/>
              <div style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)'}}>{window.I.search}</div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{display:'flex', gap:6, marginBottom:16, flexWrap:'wrap'}}>
          {[
            { v: "all", l: "ทั้งหมด", c: counts.total },
            { v: "available", l: "พร้อมใช้", c: counts.available, color: "var(--ok)" },
            { v: "booked", l: "ติดจอง", c: counts.booked, color: "var(--status-booked)" },
            { v: "approved", l: "อนุมัติแล้ว", c: counts.approved, color: "var(--status-approved)" },
            { v: "urgent", l: "ด่วน", c: counts.urgent, color: "var(--status-urgent)" },
            { v: "maintenance", l: "บำรุงรักษา", c: counts.maintenance, color: "var(--status-maintenance)" },
          ].map((f) => (
            <button key={f.v}
              className={"btn sm" + (filter === f.v ? " primary" : " ghost")}
              onClick={() => setFilter(f.v)}>
              {f.l}
              <span style={{
                marginLeft:4, padding:'0 7px', borderRadius:999, fontSize:11,
                background: filter === f.v ? 'rgba(255,255,255,0.25)' : 'var(--muted-bg)',
                color: filter === f.v ? 'white' : (f.color || 'var(--text-3)')
              }}>{f.c}</span>
            </button>
          ))}
        </div>

        <div className="grid-4" style={{gap:14}}>
          {filtered.map((v) => {
            const status = liveStatus(v);
            const tb = todaysBookings.find((b) => b.vehicleId === v.id);
            const bookingUser = tb && users.find((u) => u.id === tb.userId);
            return (
              <div key={v.id} className="veh-card" onClick={() => onSelectVehicle(v)} style={{cursor:'pointer'}}>
                <div className="veh-image">
                  <window.VehicleIcon type={v.type} size={64}/>
                  <div style={{position:'absolute', top:8, right:8}}>
                    <window.StatusPill status={status}/>
                  </div>
                  <div style={{position:'absolute', top:8, left:8, fontSize:10.5, color:'var(--text-3)', fontWeight:600, letterSpacing:'0.05em'}}>{v.id}</div>
                </div>
                <div className="veh-body">
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:6}}>
                    <span className="plate">{v.plate.split(' ').slice(0,2).join(' ')}</span>
                    <span className="text-xs muted">{window.VEHICLE_TYPES[v.type]?.label}</span>
                  </div>
                  <div style={{fontSize:13.5, fontWeight:600}}>{v.brand}</div>
                  <div className="text-xs muted" style={{display:'flex', gap:10, alignItems:'center'}}>
                    <span>{window.FUEL_TYPES[v.fuel]}</span>
                    <span>·</span>
                    <span>{v.seats} ที่นั่ง</span>
                    <span>·</span>
                    <span>{window.fmtNum(v.mileage)} กม.</span>
                  </div>
                  {tb && bookingUser && (
                    <div style={{marginTop:6, padding:'8px 10px', background:'var(--surface-2)', borderRadius:8, fontSize:12}}>
                      <div style={{color:'var(--text-3)', fontSize:11, marginBottom:1}}>
                        {window.fmtTime(tb.from)} - {window.fmtTime(tb.to)}
                      </div>
                      <div style={{fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                        {bookingUser.name} · {tb.destination.split(' ')[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{textAlign:'center', padding:'40px 0', color:'var(--text-3)'}}>
            ไม่พบรถยนต์ที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
    </>
  );
}

function StatBox({ lbl, val, foot, ico, variant }) {
  return (
    <div className={"stat " + variant}>
      <div className="stat-lbl">{lbl}</div>
      <div className="stat-val">{val}</div>
      <div className="stat-foot">{foot}</div>
      <div className="stat-ico">{ico}</div>
    </div>
  );
}

function AlertItem({ kind, title, body, time, onClick }) {
  const colors = {
    urgent: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
    warn: { bg: 'var(--warn-bg)', fg: 'var(--warn)' },
    info: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  };
  const c = colors[kind] || colors.info;
  return (
    <div style={{display:'flex', gap:10, padding:'10px 12px', background:c.bg, borderRadius:9, cursor: onClick ? 'pointer' : 'default'}} onClick={onClick}>
      <div style={{width:24, height:24, background:c.fg, color:'white', borderRadius:6, display:'grid', placeItems:'center', flexShrink:0}}>
        {window.I.warn}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13, fontWeight:600, color:c.fg}}>{title}</div>
        <div style={{fontSize:12, color:'var(--text-2)', lineHeight:1.4}}>{body}</div>
      </div>
      <div className="text-xs muted" style={{whiteSpace:'nowrap'}}>{time}</div>
    </div>
  );
}

function TimelineView({ vehicles, bookings, users, onSelectVehicle }) {
  // 14 hours: 06:00 - 20:00
  const startH = 6;
  const endH = 20;
  const totalH = endH - startH;
  const now = new Date('2026-05-21T10:30');
  const nowPct = ((now.getHours() + now.getMinutes()/60 - startH) / totalH) * 100;

  return (
    <div style={{overflowX:'auto', margin:'0 -4px'}}>
      <div style={{minWidth:720}}>
        {/* Hour grid header */}
        <div style={{display:'grid', gridTemplateColumns:'130px 1fr', gap:8, marginBottom:6}}>
          <div></div>
          <div style={{display:'grid', gridTemplateColumns:`repeat(${totalH}, 1fr)`, fontSize:10.5, color:'var(--text-3)', fontWeight:500, position:'relative'}}>
            {Array.from({length: totalH}).map((_, i) => (
              <div key={i} style={{textAlign:'left', borderLeft: i > 0 ? '1px dashed var(--border)' : 'none', paddingLeft:4}}>{String(startH + i).padStart(2,'0')}:00</div>
            ))}
            <div style={{position:'absolute', left:`${nowPct}%`, top:-2, bottom:-200, width:2, background:'var(--pea-orange)', zIndex:5, pointerEvents:'none'}}>
              <div style={{position:'absolute', top:-7, left:-4, width:10, height:10, borderRadius:'50%', background:'var(--pea-orange)'}}></div>
            </div>
          </div>
        </div>
        {vehicles.map((v) => {
          const vehBookings = bookings.filter((b) => b.vehicleId === v.id);
          return (
            <div key={v.id} style={{display:'grid', gridTemplateColumns:'130px 1fr', gap:8, alignItems:'center', padding:'5px 0', borderTop:'1px solid var(--border)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}} onClick={() => onSelectVehicle(v)}>
                <div style={{width:28, height:28, borderRadius:6, background:'var(--pea-purple-50)', color:'var(--pea-purple)', display:'grid', placeItems:'center'}}>
                  <window.VehicleIcon type={v.type} size={24}/>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:11.5, fontWeight:600, letterSpacing:'0.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v.id}</div>
                  <div style={{fontSize:10.5, color:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v.plate.split(' ').slice(0,2).join(' ')}</div>
                </div>
              </div>
              <div style={{position:'relative', height:30, background:v.status === "maintenance" ? "repeating-linear-gradient(45deg, var(--status-maintenance-bg), var(--status-maintenance-bg) 6px, #e5d8f0 6px, #e5d8f0 12px)" : 'var(--surface-2)', borderRadius:6}}>
                {v.status !== "maintenance" && vehBookings.map((b) => {
                  const fH = new Date(b.from).getHours() + new Date(b.from).getMinutes()/60;
                  const tH = new Date(b.to).getHours() + new Date(b.to).getMinutes()/60;
                  const left = Math.max(0, (fH - startH) / totalH * 100);
                  const width = Math.min(100 - left, (tH - fH) / totalH * 100);
                  const u = users.find((u) => u.id === b.userId);
                  const colorMap = {
                    approved: { bg: 'var(--status-approved-bg)', fg: 'var(--status-approved)', border: '#a8c5e8' },
                    booked:   { bg: 'var(--status-booked-bg)', fg: 'var(--status-booked)', border: '#e8c485' },
                    urgent:   { bg: 'var(--status-urgent-bg)', fg: 'var(--status-urgent)', border: '#e8a8a8' },
                  };
                  const c = colorMap[b.status] || colorMap.booked;
                  return (
                    <div key={b.id}
                      title={`${u?.name} · ${b.destination} · ${window.fmtTime(b.from)}-${window.fmtTime(b.to)}`}
                      style={{position:'absolute', left:left + '%', width: width + '%', top:3, bottom:3,
                        background:c.bg, color:c.fg, border:`1px solid ${c.border}`,
                        borderRadius:5, padding:'0 6px', display:'flex', alignItems:'center',
                        fontSize:10.5, fontWeight:500, overflow:'hidden', whiteSpace:'nowrap'}}>
                      {u?.name.split(' ')[0]} · {b.destination.split(' ').slice(0,2).join(' ')}
                    </div>
                  );
                })}
                {v.status === "maintenance" && (
                  <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--status-maintenance)', fontWeight:600}}>
                    🔧 บำรุงรักษา
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
