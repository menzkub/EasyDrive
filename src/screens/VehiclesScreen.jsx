import React from 'react'
import { I, StatusPill, VehicleIcon, Modal, ConfirmDialog, fmtDate, fmtNum, daysUntil, fmtDateTime, SearchInput, Select } from '../components'
import { VEHICLE_TYPES as VT_DEFAULT, FUEL_TYPES as FT_DEFAULT } from '../data'

function VehiclesScreen({ vehicles, bookings, vehicleHistory = [], users = [], user, onUpdateVehicle, onAddVehicle, vehicleTypes: vtProp, fuelTypes: ftProp }) {
  const VEHICLE_TYPES = vtProp || VT_DEFAULT;
  const FUEL_TYPES = ftProp || FT_DEFAULT;
  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [viewingHistory, setViewingHistory] = React.useState(null);
  const [viewingVehicle, setViewingVehicle] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const isAdmin = user.role === "admin";

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const inPlate = (v.plate || '').toLowerCase().includes(q);
      const inBrand = (v.brand || '').toLowerCase().includes(q);
      const inId    = (v.id   || '').toLowerCase().includes(q);
      if (!inPlate && !inBrand && !inId) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <div>
            <h2 className="mt-0" style={{margin:0}}>จัดการรถยนต์ ({filtered.length}/{vehicles.length})</h2>
            <p className="sub" style={{margin:'2px 0 0'}}>เพิ่ม แก้ไข และจัดการสถานะรถยนต์ในระบบ</p>
          </div>
          <div style={{display:'flex', gap:8, marginLeft:'auto', alignItems:'center', flexWrap:'wrap'}}>
            <SearchInput value={search} onChange={setSearch} placeholder="ค้นหา..." style={{width:'min(200px,100%)'}} />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{width:150, fontSize:13}}>
              <option value="all">ทุกประเภท</option>
              {Object.entries(VEHICLE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{width:150, fontSize:13}}>
              <option value="all">ทุกสถานะ</option>
              <option value="available">พร้อมใช้งาน</option>
              <option value="maintenance">บำรุงรักษา</option>
              <option value="unavailable">ไม่พร้อมใช้งาน</option>
            </Select>
            {isAdmin && <button className="btn accent" onClick={() => setShowAdd(true)}>{I.plus} เพิ่มรถยนต์</button>}
          </div>
        </div>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>รหัส / ประเภท</th>
              <th>ยี่ห้อ / ทะเบียน</th>
              <th>สเปก</th>
              <th>เลขไมล์ปัจจุบัน</th>
              <th>วันครบกำหนด</th>
              <th>ผู้รับผิดชอบ</th>
              <th>สถานะ</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const taxDays = daysUntil(v.taxDue);
              const serviceDays = daysUntil(v.nextService);
              const curMileage = calcEffectiveMileage(v.id, v.mileage, bookings);
              return (
                <tr key={v.id} onClick={() => setViewingVehicle(v)} style={{cursor:'pointer'}}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}
                >
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div className="veh-ico"><VehicleIcon type={v.type} size={24}/></div>
                      <div>
                        <div style={{fontWeight:600, fontSize:12.5}}>{v.id}</div>
                        <div style={{fontSize:11, color:'var(--text-3)'}}>{VEHICLE_TYPES[v.type]?.label}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight:500}}>{v.brand}</div>
                    <span className="plate" style={{fontSize:11, padding:'1px 6px'}}>{(v.plate || '').split(' ').slice(0,2).join(' ')}</span>
                    <span className="text-xs muted" style={{marginLeft:6}}>ปี {v.year}</span>
                  </td>
                  <td className="text-sm">
                    <div>{v.seats} ที่นั่ง · {FUEL_TYPES[v.fuel]}</div>
                  </td>
                  <td className="num">{fmtNum(curMileage)} กม.</td>
                  <td className="text-xs">
                    <div style={{color: taxDays < 30 ? 'var(--danger)' : 'var(--text-2)'}}>
                      <b>พ.ร.บ./ภาษี:</b> {fmtDate(v.taxDue)}
                      {taxDays < 60 && taxDays >= 0 && <span style={{marginLeft:4, padding:'1px 6px', borderRadius:4, background:'var(--warn-bg)', color:'var(--warn)', fontWeight:600}}>อีก {taxDays} วัน</span>}
                    </div>
                    <div style={{color: serviceDays < 14 ? 'var(--danger)' : 'var(--text-2)', marginTop:2}}>
                      <b>เช็คระยะ:</b> {fmtDate(v.nextService)}
                      {serviceDays < 30 && serviceDays >= 0 && <span style={{marginLeft:4, padding:'1px 6px', borderRadius:4, background:'var(--warn-bg)', color:'var(--warn)', fontWeight:600}}>อีก {serviceDays} วัน</span>}
                    </div>
                  </td>
                  <td className="text-sm">{v.owner}</td>
                  <td><StatusPill status={v.status}/></td>
                  {isAdmin && (
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{display:'flex', gap:6}}>
                        <button className="btn sm ghost icon" onClick={() => setViewingHistory(v)} title="ประวัติการแก้ไข">{I.history}</button>
                        <button className="btn sm ghost icon" onClick={() => setEditing(v)} title="แก้ไข">{I.edit}</button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showAdd || editing) && (
        <VehicleForm
          vehicle={editing}
          users={users}
          effectiveMileage={editing ? calcEffectiveMileage(editing.id, editing.mileage, bookings) : null}
          onSave={(data) => {
            if (editing) onUpdateVehicle(editing.id, data);
            else onAddVehicle(data);
            setShowAdd(false);
            setEditing(null);
          }}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}
      {viewingVehicle && (
        <VehicleDetailModal
          vehicle={viewingVehicle}
          bookings={bookings}
          users={users}
          onClose={() => setViewingVehicle(null)}
          onEdit={isAdmin ? () => { setEditing(viewingVehicle); setViewingVehicle(null); } : null}
          onHistory={isAdmin ? () => { setViewingHistory(viewingVehicle); setViewingVehicle(null); } : null}
        />
      )}
      {viewingHistory && (
        <VehicleHistoryModal
          vehicle={viewingHistory}
          history={vehicleHistory.filter((h) => h.vehicleId === viewingHistory.id)}
          onClose={() => setViewingHistory(null)}
        />
      )}
    </div>
  );
}

function calcEffectiveMileage(vehicleId, initialMileage, bookings) {
  const mileageIns = bookings
    .filter((b) => b.vehicleId === vehicleId && b.status === 'completed' && b.mileageIn != null)
    .map((b) => b.mileageIn);
  return mileageIns.length > 0 ? Math.max(...mileageIns) : initialMileage;
}

function VehicleDetailModal({ vehicle: v, bookings, users, onClose, onEdit, onHistory }) {
  const currentMileage = calcEffectiveMileage(v.id, v.mileage, bookings);
  const vBookings = bookings.filter((b) => b.vehicleId === v.id)
    .sort((a, b) => new Date(b.from) - new Date(a.from)).slice(0, 5);
  const totalKm = bookings.filter((b) => b.vehicleId === v.id && b.mileageIn && b.mileageOut)
    .reduce((s, b) => s + (b.mileageIn - b.mileageOut), 0);
  const taxDays = daysUntil(v.taxDue);
  const serviceDays = daysUntil(v.nextService);
  const insureDays = daysUntil(v.insuranceDue);

  function DueRow({ label, date, days }) {
    const urgent = days != null && days < 30;
    const warn = days != null && days < 60;
    return (
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px dotted var(--border)', fontSize:13}}>
        <span style={{color:'var(--text-3)'}}>{label}</span>
        <span style={{fontWeight:600, color: urgent ? 'var(--danger)' : warn ? 'var(--warn)' : 'var(--text)'}}>
          {fmtDate(date) || '—'}
          {days != null && days >= 0 && days < 60 && <span style={{marginLeft:6, fontSize:11, padding:'1px 6px', borderRadius:4, background: urgent ? 'var(--danger-bg)' : 'var(--warn-bg)', color: urgent ? 'var(--danger)' : 'var(--warn)'}}>อีก {days} วัน</span>}
        </span>
      </div>
    );
  }

  return (
    <Modal title={`รายละเอียดรถยนต์ · ${v.id}`} onClose={onClose} width={680}
      footer={<>
        {onHistory && <button className="btn ghost" onClick={onHistory}>{I.history} ประวัติแก้ไข</button>}
        <div style={{flex:1}}/>
        {onEdit && <button className="btn primary" onClick={onEdit}>{I.edit} แก้ไขข้อมูล</button>}
      </>}
    >
      {/* Header */}
      <div style={{display:'flex', gap:16, paddingBottom:16, borderBottom:'1px solid var(--border)', marginBottom:16}}>
        <div className="veh-ico lg" style={{width:72, height:72, flexShrink:0}}>
          <VehicleIcon type={v.type} size={46}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            <span className="plate">{(v.plate || '').split(' ').slice(0,2).join(' ')}</span>
            <StatusPill status={v.status}/>
            {v.nickname && <span style={{fontSize:12, color:'var(--text-2)', fontStyle:'italic'}}>"{v.nickname}"</span>}
          </div>
          <div style={{fontSize:20, fontWeight:700, marginTop:4}}>{v.brand}</div>
          <div className="text-xs muted">{v.id} · {VEHICLE_TYPES[v.type]?.label} · ปี {v.year}</div>
        </div>
        <div style={{textAlign:'right', flexShrink:0}}>
          <div style={{fontSize:11, color:'var(--text-3)'}}>เลขไมล์ปัจจุบัน</div>
          <div style={{fontSize:24, fontWeight:700, color:'var(--pea-purple)', fontFamily:'var(--font-mono)'}}>{fmtNum(currentMileage)}</div>
          <div style={{fontSize:11, color:'var(--text-3)'}}>กม.</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        {/* Left: specs + owner */}
        <div>
          <div style={{fontSize:11, fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8}}>ข้อมูลรถยนต์</div>
          {[
            ['ประเภท', VEHICLE_TYPES[v.type]?.label],
            ['เชื้อเพลิง', FUEL_TYPES[v.fuel]],
            ['ที่นั่ง', `${v.seats} ที่นั่ง`],
            ['ผู้รับผิดชอบ', v.owner],
            ['วันจดทะเบียน', fmtDate(v.regDate)],
            ['ระยะทางสะสม (จากการเดินทาง)', `${fmtNum(totalKm)} กม.`],
          ].map(([k, val]) => (
            <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px dotted var(--border)', fontSize:13}}>
              <span style={{color:'var(--text-3)'}}>{k}</span>
              <span style={{fontWeight:600}}>{val || '—'}</span>
            </div>
          ))}
        </div>

        {/* Right: due dates */}
        <div>
          <div style={{fontSize:11, fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8}}>วันครบกำหนด</div>
          <DueRow label="พ.ร.บ. / ภาษี" date={v.taxDue} days={taxDays}/>
          <DueRow label="ประกันภัย" date={v.insuranceDue} days={insureDays}/>
          <DueRow label="เช็คระยะ" date={v.nextService} days={serviceDays}/>
          <DueRow label="บำรุงรักษาล่าสุด" date={v.lastService} days={null}/>

          {v.unavailReason && (
            <div style={{marginTop:10, padding:'8px 10px', background:'var(--warn-bg)', borderRadius:8, fontSize:12.5, color:'var(--warn)'}}>
              <b>เหตุผลไม่พร้อม:</b> {v.unavailReason}
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      {vBookings.length > 0 && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11, fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8}}>การจองล่าสุด</div>
          <div className="col gap-1">
            {vBookings.map((b) => {
              const u = users.find((x) => x.id === b.userId);
              const dist = b.mileageIn && b.mileageOut ? b.mileageIn - b.mileageOut : null;
              return (
                <div key={b.id} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:'var(--surface-2)', borderRadius:8, fontSize:12.5}}>
                  <StatusPill status={b.status}/>
                  <span style={{flex:1, fontWeight:500}}>{u?.name || '—'}</span>
                  <span style={{color:'var(--text-3)'}}>{fmtDate(b.from)}</span>
                  {dist && <span style={{fontFamily:'var(--font-mono)', color:'var(--pea-purple)', fontWeight:600}}>{fmtNum(dist)} กม.</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

function VehicleHistoryModal({ vehicle, history, onClose }) {
  return (
    <Modal title={`ประวัติการแก้ไขรถยนต์ · ${vehicle.id}`} onClose={onClose} width={680}>
      <div style={{display:'flex', gap:14, padding:'4px 0 18px', borderBottom:'1px solid var(--border)', marginBottom:14}}>
        <div className="veh-ico lg" style={{width:60, height:60}}>
          <VehicleIcon type={vehicle.type} size={40}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span className="plate">{vehicle.plate.split(' ').slice(0,2).join(' ')}</span>
            <StatusPill status={vehicle.status}/>
          </div>
          <div style={{fontSize:16, fontWeight:600, marginTop:3}}>{vehicle.brand}</div>
          <div className="text-xs muted">{VEHICLE_TYPES[vehicle.type]?.label} · เลขไมล์ {fmtNum(vehicle.mileage)} กม.</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="text-xs muted">รายการทั้งหมด</div>
          <div style={{fontSize:22, fontWeight:700, color:'var(--pea-purple)'}}>{history.length}</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{padding:'32px 0', textAlign:'center', color:'var(--text-3)'}}>
          ยังไม่มีประวัติการแก้ไข
        </div>
      ) : (
        <div style={{position:'relative', paddingLeft:24}}>
          <div style={{position:'absolute', left:9, top:8, bottom:8, width:2, background:'var(--border)'}}></div>
          {history.map((h) => {
            const iconMap = {
              create:  { bg: 'var(--ok)',   ico: I.plus },
              update:  { bg: 'var(--pea-purple)', ico: I.edit },
              status:  { bg: 'var(--pea-orange)', ico: I.refresh },
              delete:  { bg: 'var(--danger)', ico: I.trash },
            };
            const ic = iconMap[h.action] || iconMap.update;
            return (
              <div key={h.id} style={{position:'relative', paddingBottom:18}}>
                <div style={{
                  position:'absolute', left:-24, top:0,
                  width:20, height:20, borderRadius:'50%',
                  background:ic.bg, color:'white',
                  display:'grid', placeItems:'center',
                  border:'3px solid var(--surface)'
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    {ic.ico.props.children}
                  </svg>
                </div>
                <div style={{background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px'}}>
                  <div style={{display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap', marginBottom:4}}>
                    <b style={{fontSize:13}}>{h.field}</b>
                    {h.photo && <span className="pill done" style={{fontSize:10}}>📸 มีรูปแนบ</span>}
                    <span className="text-xs muted" style={{marginLeft:'auto'}}>{fmtDateTime(h.at)}</span>
                  </div>
                  {h.action !== "create" ? (
                    <div style={{display:'flex', alignItems:'center', gap:8, fontSize:12.5, fontFamily:'var(--font-mono)', marginBottom:4, flexWrap:'wrap'}}>
                      <span style={{padding:'2px 8px', background:'var(--danger-bg)', color:'var(--danger)', borderRadius:5, textDecoration:'line-through'}}>{h.oldValue || '—'}</span>
                      <span style={{color:'var(--text-3)'}}>→</span>
                      <span style={{padding:'2px 8px', background:'var(--ok-bg)', color:'var(--ok)', borderRadius:5, fontWeight:600}}>{h.newValue}</span>
                    </div>
                  ) : (
                    <div style={{fontSize:12.5, fontWeight:500, marginBottom:4}}>{h.newValue}</div>
                  )}
                  {h.note && <div style={{fontSize:12.5, color:'var(--text-2)', lineHeight:1.4}}>{h.note}</div>}
                  <div className="text-xs muted" style={{marginTop:4}}>โดย <b style={{color:'var(--text-2)'}}>{h.actor}</b></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function VehicleForm({ vehicle, users = [], effectiveMileage, onSave, onClose }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const nextServiceISO = new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);
  const nextYearISO = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
  const initMileage = vehicle ? (effectiveMileage ?? vehicle.mileage) : 0;
  const [form, setForm] = React.useState(vehicle ? { ...vehicle, mileage: initMileage } : {
    nickname: "", vehicleCode: "", regDate: "",
    plate: "", brand: "", type: "sedan", year: new Date().getFullYear(), fuel: "gasohol", seats: 5,
    mileage: 0, lastService: todayISO, nextService: nextServiceISO,
    taxDue: nextYearISO, insuranceDue: nextYearISO, owner: "", status: "available",
  });

  function calcAge(regDate) {
    if (!regDate) return null;
    const reg = new Date(regDate);
    const now = new Date();
    let years = now.getFullYear() - reg.getFullYear();
    let months = now.getMonth() - reg.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years < 0) return null;
    if (years === 0 && months === 0) return "น้อยกว่า 1 เดือน";
    if (years === 0) return `${months} เดือน`;
    if (months === 0) return `${years} ปี`;
    return `${years} ปี ${months} เดือน`;
  }
  const vehicleAge = calcAge(form.regDate);
  const [unavailReason, setUnavailReason] = React.useState("");
  const [editNote, setEditNote] = React.useState("");
  const [photo, setPhoto] = React.useState(false);
  const [documents, setDocuments] = React.useState(vehicle?.documents || []);
  const [uploadingDoc, setUploadingDoc] = React.useState(false);
  const [newDoc, setNewDoc] = React.useState({ type: "พ.ร.บ.", name: "" });
  const [deletingDoc, setDeletingDoc] = React.useState(null);
  const approvedUsers = users.filter((u) => u.status === "approved");
  const DOC_TYPES = ["พ.ร.บ.", "ภาษีรถยนต์", "ใบทะเบียนรถ", "ใบรับรองการตรวจสภาพ", "ประกันภัย", "คู่มือรถ", "อื่นๆ"];
  function addDocument() {
    if (!newDoc.name.trim()) return;
    setDocuments([...documents, { id: "d" + Date.now(), type: newDoc.type, name: newDoc.name, size: Math.floor(Math.random()*900 + 100) + " KB", uploaded: "2026-05-21" }]);
    setNewDoc({ type: "พ.ร.บ.", name: "" });
    setUploadingDoc(false);
  }

  const originalMileage = effectiveMileage ?? vehicle?.mileage ?? 0;
  const mileageChanged = vehicle && form.mileage !== originalMileage;
  const mileageBigChange = mileageChanged && Math.abs(form.mileage - originalMileage) > 5;
  const canSave = !mileageBigChange || (photo && editNote.trim().length > 3);

  return (
    <Modal title={vehicle ? `แก้ไขรถยนต์ ${vehicle.id}` : "เพิ่มรถยนต์ใหม่"} onClose={onClose} width={680} noOutsideClose
      footer={<>
        <button className="btn" onClick={onClose}>ยกเลิก</button>
        <button className="btn primary" disabled={!canSave}
          onClick={() => onSave({...form, unavailReason, _editNote: editNote, _photo: photo, documents})}>
          {vehicle ? "บันทึก" : "เพิ่มรถยนต์"}
        </button>
      </>}>
      <div className="col gap-3">
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">ชื่อเรียกรถ</label>
            <input className="input" value={form.nickname} onChange={(e) => setForm({...form, nickname:e.target.value})} placeholder="เช่น รถตู้หลังบ้าน, ปิกอัพดำ"/>
          </div>
          <div className="field">
            <label className="field-lbl">รหัสยานพาหนะ</label>
            <input className="input" value={form.vehicleCode} onChange={(e) => setForm({...form, vehicleCode:e.target.value})} placeholder="เช่น VH-001, PEA-007"/>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">วันที่จดทะเบียน</label>
            <input className="input" type="date" value={form.regDate} onChange={(e) => setForm({...form, regDate:e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-lbl">อายุการใช้งาน</label>
            <div className="input" style={{display:'flex', alignItems:'center', background:'var(--surface-2)', cursor:'default', color: vehicleAge ? 'var(--text)' : 'var(--text-3)', fontWeight: vehicleAge ? 600 : 400}}>
              {vehicleAge || '— กรอกวันที่จดทะเบียนก่อน'}
            </div>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">ทะเบียน <span className="req">*</span></label>
            <input className="input" value={form.plate} onChange={(e) => setForm({...form, plate:e.target.value})} placeholder="กข 1234 เชียงใหม่"/>
          </div>
          <div className="field">
            <label className="field-lbl">ยี่ห้อ / รุ่น <span className="req">*</span></label>
            <input className="input" value={form.brand} onChange={(e) => setForm({...form, brand:e.target.value})} placeholder="Toyota Hilux Revo"/>
          </div>
        </div>
        <div className="grid-3" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="field">
            <label className="field-lbl">ประเภทรถ <span className="req">*</span></label>
            <Select value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}>
              {Object.entries(VEHICLE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <div className="field">
            <label className="field-lbl">ปี</label>
            <input className="input" type="number" value={form.year} onChange={(e) => setForm({...form, year:parseInt(e.target.value)})}/>
          </div>
          <div className="field">
            <label className="field-lbl">เชื้อเพลิง</label>
            <Select value={form.fuel} onChange={(e) => setForm({...form, fuel:e.target.value})}>
              {Object.entries(FUEL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">ที่นั่ง / น้ำหนักบรรทุก</label>
            <input className="input" type="number" value={form.seats} onChange={(e) => setForm({...form, seats:parseInt(e.target.value)})}/>
          </div>
          <div className="field">
            <label className="field-lbl">ผู้รับผิดชอบประจำรถ <span className="req">*</span></label>
            <Select value={form.owner} onChange={(e) => setForm({...form, owner:e.target.value})} placeholder="— เลือกผู้รับผิดชอบ —">
              <option value="">— เลือกผู้รับผิดชอบจากสมาชิกในระบบ —</option>
              {approvedUsers.map((u) => (
                <option key={u.id} value={u.name}>{u.name} · {u.dept} ({u.emp})</option>
              ))}
            </Select>
            <div className="input-hint">เลือกจากสมาชิกที่ผ่านการอนุมัติแล้วเท่านั้น</div>
          </div>
        </div>

        <div style={{
          background: mileageChanged ? 'var(--warn-bg)' : 'var(--surface-2)',
          border: mileageChanged ? '1.5px solid var(--warn)' : '1px solid var(--border)',
          borderRadius:10, padding:'12px 14px',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <div style={{width:24, height:24, borderRadius:6, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center'}}>
              {I.car}
            </div>
            <b style={{fontSize:13.5}}>เลขไมล์รถ (กม.)</b>
            {mileageChanged && <span className="pill pending" style={{marginLeft:'auto', fontSize:10}}>มีการเปลี่ยนแปลง</span>}
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-lbl">เลขไมล์เดิมในระบบ</label>
              <input className="input" type="text" value={vehicle ? fmtNum(originalMileage) + " กม." : "—"} disabled style={{fontFamily:'var(--font-mono)', background:'var(--surface-2)', cursor:'not-allowed'}}/>
            </div>
            <div className="field">
              <label className="field-lbl">เลขไมล์ใหม่ <span className="req">*</span></label>
              <input className="input" type="number" value={form.mileage}
                onChange={(e) => setForm({...form, mileage:parseInt(e.target.value) || 0})}
                style={mileageChanged ? {borderColor:'var(--warn)', fontWeight:600, fontFamily:'var(--font-mono)'} : {fontFamily:'var(--font-mono)'}}/>
              {mileageChanged && (
                <div className="input-hint" style={{color: form.mileage > originalMileage ? 'var(--info)' : 'var(--danger)', fontWeight:600}}>
                  {form.mileage > originalMileage ? '+' : ''}{fmtNum(form.mileage - originalMileage)} กม.
                </div>
              )}
            </div>
          </div>
          {mileageBigChange && (
            <div style={{marginTop:10, paddingTop:10, borderTop:'1px dashed var(--warn)'}}>
              <div className="text-xs" style={{color:'#7a5500', marginBottom:8, fontWeight:500}}>
                {I.warn} เปลี่ยนเลขไมล์ &gt; 5 กม. ต้องแนบรูปและระบุเหตุผล
              </div>
              <button
                onClick={() => setPhoto(!photo)}
                style={{
                  width:'100%', padding:'12px',
                  border: photo ? '2px solid var(--ok)' : '2px dashed var(--warn)',
                  borderRadius:8,
                  background: photo ? 'var(--ok-bg)' : 'rgba(255,255,255,0.6)',
                  cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  color: photo ? 'var(--ok)' : '#7a5500',
                  fontSize:12.5, fontWeight:500, marginBottom:8
                }}>
                {photo ? "✓ ถ่ายรูปเลขไมล์หน้าปัดแนบแล้ว" : <><span>{I.upload}</span> ถ่ายรูปเลขไมล์หน้าปัดเพื่อประกอบการแก้ไข <span className="req">*</span></>}
              </button>
              <textarea
                className="textarea"
                placeholder="ระบุเหตุผลการแก้ไขเลขไมล์ เช่น ผู้ใช้คนก่อนหน้าไม่ได้ Check-in / ปรับให้ตรงกับหน้าปัด ฯลฯ"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                style={{minHeight:60, fontSize:12.5}}
              />
            </div>
          )}
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">วันบำรุงรักษาล่าสุด</label>
            <input className="input" type="date" value={form.lastService} onChange={(e) => setForm({...form, lastService:e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-lbl">วันครบกำหนดเช็คระยะถัดไป</label>
            <input className="input" type="date" value={form.nextService} onChange={(e) => setForm({...form, nextService:e.target.value})}/>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-lbl">วันครบกำหนดต่อภาษี</label>
            <input className="input" type="date" value={form.taxDue} onChange={(e) => setForm({...form, taxDue:e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-lbl">วันครบกำหนด พ.ร.บ.</label>
            <input className="input" type="date" value={form.insuranceDue} onChange={(e) => setForm({...form, insuranceDue:e.target.value})}/>
          </div>
        </div>
        <div className="field">
          <label className="field-lbl">สถานะความพร้อม</label>
          <div style={{display:'flex', gap:6}}>
            {[
              { v: "available", l: "พร้อมใช้งาน", c: "var(--ok)" },
              { v: "maintenance", l: "บำรุงรักษา", c: "var(--status-maintenance)" },
              { v: "unavailable", l: "ไม่พร้อมใช้งาน", c: "var(--text-3)" },
            ].map((s) => (
              <button key={s.v} className={"btn sm" + (form.status === s.v ? " primary" : " ghost")} style={{flex:1}} onClick={() => setForm({...form, status:s.v})}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
        {(form.status === "maintenance" || form.status === "unavailable") && (
          <div className="field">
            <label className="field-lbl">สาเหตุ {form.status === "maintenance" ? "การบำรุงรักษา" : "ที่ไม่พร้อมใช้งาน"} <span className="req">*</span></label>
            <textarea className="textarea" value={unavailReason} onChange={(e) => setUnavailReason(e.target.value)} placeholder={form.status === "maintenance" ? "เช่น นำเข้าศูนย์เปลี่ยนน้ำมันเครื่อง คาดว่าเสร็จ 25 พ.ค." : "เช่น เครื่องยนต์ขัดข้อง รอช่าง"}/>
          </div>
        )}

        <div style={{background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <div style={{width:24, height:24, borderRadius:6, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center'}}>{I.shield}</div>
            <b style={{fontSize:13.5}}>เอกสารประกอบรถยนต์</b>
            <span className="text-xs muted" style={{marginLeft:'auto'}}>{documents.length} ไฟล์</span>
            <button className="btn sm primary" onClick={() => setUploadingDoc(!uploadingDoc)}>{I.plus} แนบเอกสาร</button>
          </div>
          {documents.length > 0 && (
            <div className="col gap-2" style={{marginBottom: uploadingDoc ? 10 : 0}}>
              {documents.map((d) => {
                const ext = d.name.split('.').pop().toUpperCase();
                const isPdf = ext === 'PDF';
                return (
                  <div key={d.id} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'white', borderRadius:8, border:'1px solid var(--border)'}}>
                    <div style={{
                      width:34, height:42, borderRadius:5,
                      background: isPdf ? '#FEE7E7' : '#E4F0FC',
                      color: isPdf ? '#C03434' : '#1F5BA8',
                      display:'grid', placeItems:'center', fontSize:9, fontWeight:700, flexShrink:0,
                    }}>{ext}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                        <span style={{padding:'1px 7px', background:'var(--pea-purple-50)', color:'var(--pea-purple)', borderRadius:4, fontSize:10.5, fontWeight:600}}>{d.type}</span>
                        <span style={{fontSize:12.5, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</span>
                      </div>
                      <div className="text-xs muted">{d.size} · อัพโหลดเมื่อ {fmtDate(d.uploaded)}</div>
                    </div>
                    <button className="btn sm ghost icon" title="ดาวน์โหลด">{I.download}</button>
                    <button className="btn sm ghost icon" title="ลบ" onClick={() => setDeletingDoc(d)} style={{color:'var(--danger)'}}>{I.trash}</button>
                  </div>
                );
              })}
            </div>
          )}
          {uploadingDoc && (
            <div style={{background:'white', border:'2px dashed var(--pea-purple)', borderRadius:9, padding:14}}>
              <div className="grid-2" style={{marginBottom:10}}>
                <div className="field">
                  <label className="field-lbl">ประเภทเอกสาร</label>
                  <Select value={newDoc.type} onChange={(e) => setNewDoc({...newDoc, type:e.target.value})}>
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div className="field">
                  <label className="field-lbl">ชื่อไฟล์</label>
                  <input className="input" value={newDoc.name} onChange={(e) => setNewDoc({...newDoc, name:e.target.value})} placeholder="porbor-2569.pdf"/>
                </div>
              </div>
              <div style={{width:'100%', padding:'18px', border:'2px dashed var(--border-strong)', borderRadius:8, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--text-2)', fontSize:13, fontWeight:500, cursor:'pointer'}}>
                <span>{I.upload}</span> ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ (PDF, JPG, PNG ≤ 5 MB)
              </div>
              <div style={{display:'flex', gap:6, marginTop:10, justifyContent:'flex-end'}}>
                <button className="btn sm ghost" onClick={() => { setUploadingDoc(false); setNewDoc({ type: "พ.ร.บ.", name: "" }); }}>ยกเลิก</button>
                <button className="btn sm primary" onClick={addDocument} disabled={!newDoc.name.trim()}>{I.check} แนบเอกสาร</button>
              </div>
            </div>
          )}
          {documents.length === 0 && !uploadingDoc && (
            <div className="text-xs muted" style={{textAlign:'center', padding:'14px 0'}}>
              ยังไม่มีเอกสารที่แนบไว้ — คลิก "แนบเอกสาร" เพื่อเพิ่ม
            </div>
          )}
        </div>
      </div>
      {deletingDoc && (
        <ConfirmDialog
          confirm={{
            kind: "negative",
            title: "ลบเอกสารนี้?",
            message: "การลบเอกสารไม่สามารถย้อนกลับได้",
            detail: (
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{
                  width:34, height:42, borderRadius:5,
                  background: deletingDoc.name.endsWith('.pdf') ? '#FEE7E7' : '#E4F0FC',
                  color: deletingDoc.name.endsWith('.pdf') ? '#C03434' : '#1F5BA8',
                  display:'grid', placeItems:'center', fontSize:9, fontWeight:700, flexShrink:0,
                }}>{deletingDoc.name.split('.').pop().toUpperCase()}</div>
                <div>
                  <div style={{display:'flex', gap:6, alignItems:'center'}}>
                    <span style={{padding:'1px 7px', background:'var(--pea-purple-50)', color:'var(--pea-purple)', borderRadius:4, fontSize:10.5, fontWeight:600}}>{deletingDoc.type}</span>
                    <b style={{fontSize:13}}>{deletingDoc.name}</b>
                  </div>
                  <div className="text-xs muted">{deletingDoc.size} · {fmtDate(deletingDoc.uploaded)}</div>
                </div>
              </div>
            ),
            confirmLabel: "ลบเอกสาร",
            onConfirm: () => {
              setDocuments(documents.filter((x) => x.id !== deletingDoc.id));
            },
          }}
          onClose={() => setDeletingDoc(null)}
        />
      )}
    </Modal>
  );
}

export { VehiclesScreen }
