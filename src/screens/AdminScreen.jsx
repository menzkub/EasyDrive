// Admin screens: Approvals (bookings) + Members (users)
import React from 'react'
import { I, StatusPill, VehicleIcon, Modal, fmtDate, fmtDateTime, fmtTime, fmtNum } from '../components'
import { DEPARTMENTS as DEPT_FALLBACK } from '../data'

function ApprovalsScreen({ bookings, vehicles, users, mileageCorrections = [], user, onApprove, onReject, onApproveMileage, onRejectMileage, onSelectBooking, onPrintVoucher }) {
  const [tab, setTab] = React.useState("pending");
  const [search, setSearch] = React.useState("");
  const isAdmin = user.role === "admin";

  const all = bookings.filter((b) => {
    if (search) {
      const u = users.find((x) => x.id === b.userId);
      const v = vehicles.find((x) => x.id === b.vehicleId);
      const q = search.toLowerCase();
      const hay = `${u?.name} ${v?.plate} ${b.destination} ${b.id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const pending = all.filter((b) => b.status === "booked");
  const approved = all.filter((b) => b.status === "approved" || b.status === "urgent");
  const rejected = all.filter((b) => b.status === "rejected");
  const completed = all.filter((b) => b.status === "completed");
  const mileagePending = mileageCorrections.filter((c) => c.status === "pending");
  const mileageDone = mileageCorrections.filter((c) => c.status !== "pending");

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <div>
            <h2 className="mt-0" style={{margin:0}}>อนุมัติการจองรถ</h2>
            <p className="sub" style={{margin:'2px 0 0'}}>ตรวจสอบและอนุมัติคำขอจองรถจากผู้ใช้งาน</p>
          </div>
          <div className="search-export-row">
            <div style={{position:'relative', flex:1}}>
              <input className="input" placeholder="ค้นหาผู้จอง / รถ / สถานที่..." value={search} onChange={(e) => setSearch(e.target.value)} style={{padding:'7px 12px 7px 32px', width:'100%', fontSize:13}}/>
              <div style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)'}}>{I.search}</div>
            </div>
            <button className="btn ghost" style={{flexShrink:0}}>{I.export} Export</button>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="tabs">
          <button className={"tab" + (tab === "pending" ? " active" : "")} onClick={() => setTab("pending")}>รออนุมัติ <span className="count">{pending.length}</span></button>
          <button className={"tab" + (tab === "approved" ? " active" : "")} onClick={() => setTab("approved")}>อนุมัติแล้ว <span className="count">{approved.length}</span></button>
          {isAdmin && (
            <button className={"tab" + (tab === "mileage" ? " active" : "")} onClick={() => setTab("mileage")}>
              แก้ไขเลขไมล์
              <span className="count" style={mileagePending.length > 0 ? {background:'var(--warn-bg)', color:'var(--warn)'} : null}>{mileagePending.length}</span>
            </button>
          )}
          <button className={"tab" + (tab === "rejected" ? " active" : "")} onClick={() => setTab("rejected")}>ไม่อนุมัติ <span className="count">{rejected.length}</span></button>
          <button className={"tab" + (tab === "completed" ? " active" : "")} onClick={() => setTab("completed")}>เสร็จสิ้น <span className="count">{completed.length}</span></button>
        </div>

        {tab === "mileage" && isAdmin ? (
          <MileageCorrectionsList
            corrections={mileageCorrections}
            vehicles={vehicles} users={users} bookings={bookings} actor={user}
            onApprove={onApproveMileage} onReject={onRejectMileage}
          />
        ) : (
        <div className="col gap-3">
          {(() => {
            const list = { pending, approved, rejected, completed }[tab];
            if (!list || list.length === 0) {
              return (
                <div style={{padding:'48px 0', textAlign:'center', color:'var(--text-3)'}}>
                  <div style={{fontSize:42, marginBottom:8}}>📋</div>
                  ไม่มีรายการในหมวดนี้
                </div>
              );
            }
            return list.map((b) => {
              const v = vehicles.find((x) => x.id === b.vehicleId);
              const u = users.find((x) => x.id === b.userId);
              return (
                <ApprovalCard key={b.id} booking={b} vehicle={v} user={u} actor={user}
                  onApprove={() => onApprove(b.id)}
                  onReject={() => onReject(b.id)}
                  onSelect={() => onSelectBooking(b)}
                  onPrint={() => onPrintVoucher(b)}
                />
              );
            });
          })()}
        </div>
        )}
      </div>
    </div>
  );
}

function ApprovalCard({ booking, vehicle, user, actor, onApprove, onReject, onSelect, onPrint }) {
  const b = booking;
  const u = user;
  return (
    <div style={{
      border:'1px solid var(--border)', borderRadius:12, padding:14, display:'flex', gap:14,
      background: b.status === "urgent" ? "linear-gradient(to right, var(--status-urgent-bg), var(--surface))" : "var(--surface)"
    }}>
      <div className="veh-ico lg" style={{background:'var(--pea-purple-50)', color:'var(--pea-purple)', width:54, height:54}}>
        {vehicle && <VehicleIcon type={vehicle.type} size={36}/>}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap'}}>
          <div style={{fontSize:11.5, color:'var(--text-3)', fontFamily:'var(--font-mono)', letterSpacing:'0.02em'}}>{b.id}</div>
          <StatusPill status={b.status}/>
          {b.purpose && <span className="text-xs" style={{padding:'1px 8px', background:'var(--surface-2)', borderRadius:999, color:'var(--text-2)'}}>{b.purpose}</span>}
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:6, flexWrap:'wrap'}}>
          <div style={{fontSize:15, fontWeight:600}}>{u?.name || 'ผู้ใช้งาน'}</div>
          <div className="text-xs muted">{u?.dept} · {u?.emp}</div>
        </div>
        <div style={{fontSize:13, marginTop:6, color:'var(--text-2)'}}>
          {b.purposeNote}
        </div>
        <div style={{display:'flex', gap:16, marginTop:8, flexWrap:'wrap', fontSize:12.5, color:'var(--text-2)'}}>
          <span>{I.clock} {fmtDateTime(b.from)} — {fmtTime(b.to)}</span>
          <span>{I.pin} {b.destination}</span>
          <span>{I.car} {vehicle?.plate.split(' ').slice(0,2).join(' ')} · {vehicle?.brand}</span>
          <span>{I.users} {b.passengers || 1} คน</span>
        </div>
        {b.approvedBy && <div className="text-xs" style={{marginTop:6, color:'var(--ok)'}}>{I.check} อนุมัติโดย {b.approvedBy}</div>}
        {b.rejectReason && <div className="text-xs" style={{marginTop:6, color:'var(--danger)'}}>{I.x} เหตุผลที่ไม่อนุมัติ: {b.rejectReason}</div>}
        {b.urgentReason && <div className="text-xs" style={{marginTop:6, color:'var(--status-urgent)', fontWeight:600}}>⚡ {b.urgentReason}</div>}
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end'}}>
        {b.status === "booked" && (actor.role === "manager" || actor.role === "admin") && (
          <>
            <button className="btn sm" style={{background:'var(--ok)', color:'white', borderColor:'var(--ok)'}} onClick={onApprove}>{I.check} อนุมัติ</button>
            <button className="btn sm danger" onClick={onReject}>{I.x} ไม่อนุมัติ</button>
          </>
        )}
        {(b.status === "approved" || b.status === "urgent") && (
          <button className="btn sm ghost" onClick={onPrint}>{I.print} ใบจอง</button>
        )}
        <button className="btn sm ghost" onClick={onSelect}>ดูรายละเอียด {I.arrowRight}</button>
      </div>
    </div>
  );
}

// ─── Members screen ────────────────────────────────────────────────
function MembersScreen({ users, user, departments, onApproveUser, onRejectUser, onChangeRole, onUpdateUser }) {
  const DEPARTMENTS = departments?.length ? departments.map(d => d.name) : DEPT_FALLBACK;
  const [tab, setTab] = React.useState("pending");
  const [search, setSearch] = React.useState("");
  const [viewing, setViewing] = React.useState(null);
  const [editing, setEditing] = React.useState(null);

  const all = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (!`${u.name} ${u.emp} ${u.dept} ${u.email}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const pending = all.filter((u) => u.status === "pending");
  const approved = all.filter((u) => u.status === "approved");

  const list = { pending, approved }[tab];

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <div>
            <h2 className="mt-0" style={{margin:0}}>จัดการสมาชิก</h2>
            <p className="sub" style={{margin:'2px 0 0'}}>อนุมัติผู้ใช้งานและกำหนดบทบาทในระบบ</p>
          </div>
          <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center'}}>
            <div style={{position:'relative'}}>
              <input className="input" placeholder="ค้นหาชื่อ / รหัสพนักงาน / แผนก..." value={search} onChange={(e) => setSearch(e.target.value)} style={{padding:'7px 12px 7px 32px', width:300, fontSize:13}}/>
              <div style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)'}}>{I.search}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="tabs">
          <button className={"tab" + (tab === "pending" ? " active" : "")} onClick={() => setTab("pending")}>รอการอนุมัติ <span className="count">{pending.length}</span></button>
          <button className={"tab" + (tab === "approved" ? " active" : "")} onClick={() => setTab("approved")}>สมาชิกในระบบ <span className="count">{approved.length}</span></button>
        </div>

        <div className="card" style={{overflowX:'auto', border:'none', boxShadow:'none'}}>
          <table className="table">
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th>รหัสพนักงาน</th>
                <th>สังกัด</th>
                <th>ติดต่อ</th>
                <th>บทบาท</th>
                <th>วันที่สมัคร</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} onClick={() => setViewing(u)} style={{cursor:'pointer'}}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div className="avatar">{u.name.charAt(0)}</div>
                      <div>
                        <div style={{fontWeight:600}}>{u.name}</div>
                        <div className="text-xs muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontFamily:'var(--font-mono)'}}>{u.emp}</td>
                  <td className="text-sm">{u.dept}</td>
                  <td className="text-sm">{u.phone}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {tab === "pending" ? (
                      <span className="pill pending"><span className="dot"></span>รออนุมัติ</span>
                    ) : (
                      <select className="select" value={u.role} onChange={(e) => onChangeRole(u.id, e.target.value)} style={{padding:'4px 28px 4px 10px', fontSize:12.5, width:120}}>
                        <option value="user">ผู้ใช้งาน</option>
                        <option value="manager">ผู้จัดการ</option>
                        <option value="admin">ผู้ดูแลระบบ</option>
                      </select>
                    )}
                  </td>
                  <td className="text-sm">{fmtDate(u.joined)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {tab === "pending" ? (
                      <div style={{display:'flex', gap:4}}>
                        <button className="btn sm" style={{background:'var(--ok)', color:'white', borderColor:'var(--ok)'}} onClick={() => onApproveUser(u.id)}>อนุมัติ</button>
                        <button className="btn sm danger" onClick={() => onRejectUser(u.id)}>ปฏิเสธ</button>
                      </div>
                    ) : (
                      <div style={{display:'flex', gap:4}}>
                        <button className="btn sm ghost" onClick={() => setViewing(u)}>{I.search} ดู</button>
                        <button className="btn sm ghost icon" onClick={() => setEditing(u)} title="แก้ไข">{I.edit}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div style={{textAlign:'center', padding:'48px 0', color:'var(--text-3)'}}>ไม่มีสมาชิกในหมวดนี้</div>
          )}
        </div>
      </div>

      {viewing && (
        <MemberDetailModal
          user={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
          onApprove={viewing.status === "pending" ? () => { onApproveUser(viewing.id); setViewing(null); } : null}
          onReject={viewing.status === "pending" ? () => { onRejectUser(viewing.id); setViewing(null); } : null}
        />
      )}
      {editing && (
        <MemberEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => { onUpdateUser(editing.id, data); setEditing(null); }}
        />
      )}
    </div>
  );
}

// ─── Member Detail Modal ──────────────────────────────────────────
function MemberDetailModal({ user, onClose, onEdit, onApprove, onReject }) {
  return (
    <Modal title="ข้อมูลสมาชิก" onClose={onClose} width={520}
      footer={<>
        <button className="btn" onClick={onClose}>ปิด</button>
        {onApprove && <button className="btn sm danger" style={{padding:'8px 14px'}} onClick={onReject}>{I.x} ปฏิเสธ</button>}
        {onApprove && <button className="btn" style={{background:'var(--ok)', color:'white', borderColor:'var(--ok)', padding:'8px 14px'}} onClick={onApprove}>{I.check} อนุมัติสมาชิก</button>}
        {!onApprove && <button className="btn primary" onClick={onEdit}>{I.edit} แก้ไขข้อมูล</button>}
      </>}>
      <div style={{display:'flex', gap:14, padding:'4px 0 18px', borderBottom:'1px solid var(--border)', marginBottom:18}}>
        <div className="avatar lg" style={{width:64, height:64, fontSize:24}}>{user.name.charAt(0)}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <h3 style={{margin:0, fontSize:18, fontWeight:700}}>{user.name}</h3>
            {user.status === "pending" ? (
              <span className="pill pending"><span className="dot"></span>รออนุมัติ</span>
            ) : (
              <span className="pill done"><span className="dot"></span>ใช้งานได้</span>
            )}
          </div>
          <div className="text-sm muted" style={{marginTop:4}}>
            {user.role === "admin" ? "ผู้ดูแลระบบ" : user.role === "manager" ? "ผู้จัดการ" : "ผู้ใช้งาน"}
            <span style={{margin:'0 6px'}}>·</span>
            สมาชิกตั้งแต่ {fmtDate(user.joined)}
          </div>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'130px 1fr', rowGap:10, columnGap:14, fontSize:13.5}}>
        <Field label="รหัสพนักงาน" value={<span style={{fontFamily:'var(--font-mono)', fontWeight:600}}>{user.emp}</span>}/>
        <Field label="สังกัด" value={user.dept}/>
        <Field label="อีเมล" value={<a href={`mailto:${user.email}`} style={{color:'var(--pea-purple)'}}>{user.email}</a>}/>
        <Field label="เบอร์โทร" value={<a href={`tel:${user.phone}`} style={{color:'var(--pea-purple)'}}>{user.phone}</a>}/>
        <Field label="บทบาท" value={user.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : user.role === "manager" ? "ผู้จัดการ (Manager)" : "ผู้ใช้งาน (User)"}/>
        <Field label="วันที่สมัคร" value={fmtDate(user.joined)}/>
        <Field label="รหัสในระบบ" value={user.id}/>
      </div>
    </Modal>
  );
}

// ─── Member Edit Modal ───────────────────────────────────────────
function MemberEditModal({ user, onClose, onSave }) {
  const [form, setForm] = React.useState({
    name: user.name, emp: user.emp, dept: user.dept,
    email: user.email, phone: user.phone, role: user.role,
  });

  return (
    <Modal title={`แก้ไขข้อมูลสมาชิก · ${user.name}`} onClose={onClose} width={580}
      footer={<>
        <button className="btn" onClick={onClose}>ยกเลิก</button>
        <button className="btn primary" onClick={() => onSave(form)}>{I.check} บันทึก</button>
      </>}>
      <div className="col gap-3">
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">ชื่อ-นามสกุล</label>
            <input className="input" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-lbl">รหัสพนักงาน</label>
            <input className="input" value={form.emp} onChange={(e) => setForm({...form, emp:e.target.value})}/>
          </div>
        </div>
        <div className="field">
          <label className="field-lbl">สังกัด</label>
          <select className="select" value={form.dept} onChange={(e) => setForm({...form, dept:e.target.value})}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">อีเมล</label>
            <input className="input" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-lbl">เบอร์โทร</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})}/>
          </div>
        </div>
        <div className="field">
          <label className="field-lbl">บทบาทในระบบ</label>
          <div style={{display:'flex', gap:6}}>
            {[
              { v: "user", l: "ผู้ใช้งาน" },
              { v: "manager", l: "ผู้จัดการ" },
              { v: "admin", l: "ผู้ดูแลระบบ" },
            ].map((r) => (
              <button key={r.v} className={"btn sm" + (form.role === r.v ? " primary" : " ghost")} style={{flex:1}} onClick={() => setForm({...form, role:r.v})}>
                {r.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value }) {
  return (
    <>
      <div style={{color:'var(--text-3)', fontSize:12.5, paddingTop:2}}>{label}</div>
      <div style={{color:'var(--text)', fontWeight:500}}>{value || '—'}</div>
    </>
  );
}

// ─── Mileage Corrections list ──────────────────────────────────────
function MileageCorrectionsList({ corrections, vehicles, users, bookings, actor, onApprove, onReject }) {
  if (corrections.length === 0) {
    return (
      <div style={{padding:'48px 0', textAlign:'center', color:'var(--text-3)'}}>
        <div style={{fontSize:42, marginBottom:8}}>🛞</div>
        <div style={{fontWeight:600, color:'var(--text-2)'}}>ยังไม่มีคำขอแก้ไขเลขไมล์</div>
        <div className="text-xs muted" style={{marginTop:4}}>เมื่อผู้ใช้กรอกเลขไมล์ตอน Check-out ไม่ตรงกับในระบบ คำขอจะแสดงที่นี่</div>
      </div>
    );
  }
  const canAct = actor.role === "admin" || actor.role === "manager";
  return (
    <div className="col gap-3">
      {corrections.map((c) => {
        const v = vehicles.find((x) => x.id === c.vehicleId);
        const u = users.find((x) => x.id === c.userId);
        const b = bookings.find((x) => x.id === c.bookingId);
        const sign = c.diff > 0 ? "+" : "";
        return (
          <div key={c.id} style={{
            border: c.status === "pending" ? '1.5px solid var(--warn)' : '1px solid var(--border)',
            borderRadius:12, padding:14, display:'flex', gap:14,
            background: c.status === "pending" ? 'linear-gradient(to right, var(--warn-bg), var(--surface) 40%)' : 'var(--surface)'
          }}>
            <div style={{width:54, height:54, borderRadius:12, background:'var(--warn)', color:'white', display:'grid', placeItems:'center', flexShrink:0, fontSize:24}}>
              🛞
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap'}}>
                <div style={{fontSize:11.5, color:'var(--text-3)', fontFamily:'var(--font-mono)'}}>{c.id}</div>
                {c.status === "pending" && <span className="pill pending"><span className="dot"></span>รอตรวจสอบ</span>}
                {c.status === "approved" && <span className="pill done"><span className="dot"></span>อนุมัติแล้ว</span>}
                {c.status === "rejected" && <span className="pill rejected"><span className="dot"></span>ไม่อนุมัติ</span>}
                <span className="text-xs muted">· เกี่ยวกับการจอง {c.bookingId}</span>
              </div>

              <div style={{display:'flex', alignItems:'center', gap:10, marginTop:6, flexWrap:'wrap'}}>
                <span className="plate" style={{fontSize:12}}>{v?.plate.split(' ').slice(0,2).join(' ')}</span>
                <b style={{fontSize:14}}>{v?.brand}</b>
                <span className="text-xs muted">โดย {u?.name} · {u?.dept}</span>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:10}}>
                <div style={{padding:'8px 10px', background:'var(--surface-2)', borderRadius:8}}>
                  <div className="text-xs muted">เลขไมล์ในระบบ</div>
                  <div style={{fontFamily:'var(--font-mono)', fontWeight:600, fontSize:15}}>{fmtNum(c.systemMileage)} กม.</div>
                </div>
                <div style={{padding:'8px 10px', background:'var(--warn-bg)', borderRadius:8}}>
                  <div className="text-xs" style={{color:'#7a5500'}}>ผู้ใช้ระบุ</div>
                  <div style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:15, color:'var(--warn)'}}>{fmtNum(c.claimedMileage)} กม.</div>
                </div>
                <div style={{padding:'8px 10px', background: c.diff > 0 ? 'var(--info-bg)' : 'var(--danger-bg)', borderRadius:8}}>
                  <div className="text-xs muted">ส่วนต่าง</div>
                  <div style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:15, color: c.diff > 0 ? 'var(--info)' : 'var(--danger)'}}>{sign}{fmtNum(c.diff)} กม.</div>
                </div>
              </div>

              <div style={{marginTop:10, fontSize:12.5, color:'var(--text-2)'}}>
                <b style={{color:'var(--text)'}}>เหตุผล:</b> {c.reason || '—'}
              </div>

              <div style={{display:'flex', gap:10, marginTop:10, alignItems:'center'}}>
                <div style={{
                  display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
                  background: c.dashPhoto ? 'var(--ok-bg)' : 'var(--surface-2)',
                  borderRadius:6, fontSize:11.5, color: c.dashPhoto ? 'var(--ok)' : 'var(--text-3)', fontWeight:500
                }}>
                  {c.dashPhoto ? '📸 มีรูปหน้าปัดแนบ' : '⚠️ ยังไม่มีรูปแนบ'}
                </div>
                <span className="text-xs muted">ส่งคำขอเมื่อ {fmtDateTime(c.requestedAt)}</span>
              </div>

              {c.approvedBy && (
                <div className="text-xs" style={{marginTop:6, color: c.status === "approved" ? 'var(--ok)' : 'var(--danger)'}}>
                  {c.status === "approved" ? '✓ อนุมัติโดย ' : '✗ ไม่อนุมัติโดย '}
                  {c.approvedBy} · {fmtDateTime(c.approvedAt || c.requestedAt)}
                  {c.rejectReason && <> · เหตุผล: {c.rejectReason}</>}
                </div>
              )}
            </div>

            {c.status === "pending" && canAct && (
              <div style={{display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end'}}>
                {c.dashPhoto && (
                  <div style={{width:80, height:60, borderRadius:6, background:`repeating-linear-gradient(45deg, #444 0 6px, #555 6px 12px)`, position:'relative', overflow:'hidden', marginBottom:4, display:'grid', placeItems:'center', color:'white', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, border:'2px solid #222'}}>
                    {fmtNum(c.claimedMileage)}
                  </div>
                )}
                <button className="btn sm" style={{background:'var(--ok)', color:'white', borderColor:'var(--ok)'}} onClick={() => onApprove(c.id)}>
                  {I.check} อนุมัติ
                </button>
                <button className="btn sm danger" onClick={() => onReject(c.id)}>
                  {I.x} ไม่อนุมัติ
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { ApprovalsScreen, MembersScreen }
