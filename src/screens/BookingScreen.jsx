import React from 'react'
import L from 'leaflet'
import { I, StatusPill, VehicleIcon, fmtDateTime, fmtTime } from '../components'
import { PURPOSES, VEHICLE_TYPES, FUEL_TYPES } from '../data'

function BookingScreen({ user, vehicles, bookings, users = [], onSubmit, prefillVehicle, onCancel, onGoToMyBookings }) {
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [bookingId, setBookingId] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    purpose: PURPOSES[0],
    purposeNote: "",
    from: "2026-05-22T08:00",
    to: "2026-05-22T17:00",
    destination: "ต.เวียง อ.ฝาง จ.เชียงใหม่",
    coords: [19.9152, 99.2102],
    passengers: 1,
    vehicleId: prefillVehicle?.id || null,
    notes: "",
  });

  const availableVehicles = vehicles.filter((v) => {
    if (v.status === "maintenance" || v.status === "unavailable") return false;
    const conflict = bookings.some((b) =>
      b.vehicleId === v.id &&
      (b.status === "approved" || b.status === "booked" || b.status === "urgent") &&
      !(b.to <= form.from || b.from >= form.to)
    );
    return !conflict;
  });

  const conflictVehicles = vehicles.filter((v) => {
    if (v.status === "maintenance" || v.status === "unavailable") return false;
    return bookings.some((b) =>
      b.vehicleId === v.id &&
      (b.status === "approved" || b.status === "booked" || b.status === "urgent") &&
      !(b.to <= form.from || b.from >= form.to)
    );
  });

  async function next() {
    if (step === 1) {
      if (!form.purpose || !form.destination || !form.from || !form.to) return;
      setStep(2);
    } else if (step === 2) {
      if (!form.vehicleId) return;
      setStep(3);
    } else {
      setConfirmOpen(true);
    }
  }

  async function handleConfirmedSubmit() {
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const id = await onSubmit(form);
      if (id) setBookingId(id);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmOpen) {
    const v = vehicles.find((x) => x.id === form.vehicleId);
    const dur = calcDuration(form.from, form.to);
    const durLabel = dur.valid
      ? [dur.days > 0 ? `${dur.days} วัน` : null, dur.hours > 0 ? `${dur.hours} ชม.` : null, dur.minutes > 0 ? `${dur.minutes} นาที` : null]
          .filter(Boolean).join(' ') || '0 นาที'
      : '—';
    return (
      <div style={{maxWidth:520, margin:'40px auto 0'}}>
        <div className="card card-pad">
          {/* Header */}
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20, paddingBottom:16, borderBottom:'1px solid var(--border)'}}>
            <div style={{width:48, height:48, borderRadius:12, background:'var(--pea-purple-50)', color:'var(--pea-purple)', display:'grid', placeItems:'center', flexShrink:0}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>
            </div>
            <div>
              <div style={{fontWeight:700, fontSize:16}}>ยืนยันการจองรถ</div>
              <div style={{fontSize:12.5, color:'var(--text-3)', marginTop:2}}>กรุณาตรวจสอบข้อมูลก่อนยืนยัน</div>
            </div>
          </div>

          {/* Vehicle */}
          {v && (
            <div style={{display:'flex', gap:12, alignItems:'center', padding:'12px 14px', background:'var(--pea-purple-50)', borderRadius:10, marginBottom:16, border:'1px solid var(--pea-purple-100)'}}>
              <div className="veh-ico" style={{width:44, height:44, flexShrink:0, color:'var(--pea-purple)'}}>
                <VehicleIcon type={v.type} size={26}/>
              </div>
              <div>
                <div style={{fontWeight:700, fontSize:14, color:'var(--pea-purple)'}}>{v.brand}</div>
                <div style={{fontSize:12, color:'var(--text-2)', fontFamily:'var(--font-mono)'}}>{(v.plate||'').split(' ').slice(0,2).join(' ')} · {v.nickname || v.id}</div>
              </div>
              <div style={{marginLeft:'auto', textAlign:'right'}}>
                <div style={{fontSize:11, color:'var(--text-3)'}}>ระยะเวลา</div>
                <div style={{fontWeight:700, fontSize:15, color:'var(--pea-purple)'}}>{durLabel}</div>
              </div>
            </div>
          )}

          {/* Trip details */}
          <div style={{display:'grid', rowGap:10, fontSize:13.5}}>
            {[
              { label:'ผู้จอง',       value: `${user.name} (${user.emp})` },
              { label:'สังกัด',       value: user.dept },
              { label:'วัตถุประสงค์', value: form.purpose + (form.purposeNote ? ` — ${form.purposeNote}` : '') },
              { label:'วัน-เวลาไป',   value: fmtDateTime(form.from) },
              { label:'วัน-เวลากลับ', value: fmtDateTime(form.to) },
              { label:'ปลายทาง',      value: form.destination },
              { label:'ผู้โดยสาร',    value: `${form.passengers} คน` },
              ...(form.notes ? [{ label:'หมายเหตุ', value: form.notes }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{display:'grid', gridTemplateColumns:'110px 1fr', gap:8, paddingBottom:10, borderBottom:'1px dotted var(--border)'}}>
                <span style={{color:'var(--text-3)', fontSize:12.5}}>{label}</span>
                <span style={{fontWeight:500}}>{value}</span>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div style={{marginTop:18, padding:'10px 14px', background:'var(--warn-bg)', borderRadius:8, fontSize:12.5, color:'var(--warn)', fontWeight:500}}>
            ⚠️ หลังยืนยันแล้ว คำขอจะถูกส่งให้ผู้จัดการพิจารณาอนุมัติทันที
          </div>

          {/* Actions */}
          <div style={{display:'flex', gap:10, marginTop:18, justifyContent:'flex-end'}}>
            <button className="btn ghost" onClick={() => setConfirmOpen(false)}>← แก้ไขข้อมูล</button>
            <button className="btn accent lg" onClick={handleConfirmedSubmit} style={{minWidth:160}}>
              ยืนยันการจอง
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bookingId) {
    return (
      <div style={{maxWidth:520, margin:'60px auto 0', textAlign:'center'}}>
        <div style={{
          width:80, height:80, borderRadius:'50%',
          background:'var(--ok-bg)', color:'var(--ok)',
          display:'grid', placeItems:'center',
          margin:'0 auto 20px',
          boxShadow:'0 0 0 12px var(--ok-bg)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{margin:'0 0 8px', fontSize:22, fontWeight:700}}>ส่งคำขอจองสำเร็จ!</h2>
        <p style={{margin:'0 0 6px', color:'var(--text-2)', fontSize:14}}>คำขอของท่านถูกส่งให้ผู้จัดการพิจารณาแล้ว</p>
        <div style={{
          display:'inline-block', padding:'6px 16px',
          background:'var(--surface-2)', border:'1px solid var(--border)',
          borderRadius:8, fontFamily:'var(--font-mono)', fontSize:13,
          fontWeight:600, color:'var(--pea-purple)', margin:'8px 0 28px',
        }}>
          เลขที่การจอง: {bookingId}
        </div>
        <div style={{display:'flex', gap:10, justifyContent:'center'}}>
          <button className="btn ghost" onClick={onCancel}>กลับหน้าแรก</button>
          <button className="btn primary" onClick={onGoToMyBookings}>ดูการจองของฉัน</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:1200, margin:'0 auto'}}>
      <Stepper step={step}/>

      {step === 1 && <Step1 form={form} setForm={setForm} availableVehicles={availableVehicles} conflictVehicles={conflictVehicles}/>}
      {step === 2 && <Step2 form={form} setForm={setForm} vehicles={vehicles} availableVehicles={availableVehicles} conflictVehicles={conflictVehicles} bookings={bookings} users={users}/>}
      {step === 3 && <Step3 form={form} setForm={setForm} user={user} vehicles={vehicles} bookings={bookings} users={users}/>}

      <div style={{display:'flex', gap:10, marginTop:18, justifyContent:'flex-end'}}>
        {step > 1 && <button className="btn ghost" onClick={() => setStep(step - 1)} disabled={submitting}>{I.arrowLeft} ย้อนกลับ</button>}
        <button className="btn" onClick={onCancel} disabled={submitting}>ยกเลิก</button>
        {step < 3 && <button className="btn primary" onClick={next}>ถัดไป {I.arrowRight}</button>}
        {step === 3 && (
          <button className="btn accent lg" onClick={next} disabled={submitting} style={{minWidth:160}}>
            {submitting ? (
              <span style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite'}}/>
                กำลังส่งคำขอ...
              </span>
            ) : 'ยืนยันการจอง'}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const steps = [
    { n: 1, l: "รายละเอียดการเดินทาง" },
    { n: 2, l: "เลือกรถ" },
    { n: 3, l: "ยืนยัน" },
  ];
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:20}}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:30, height:30, borderRadius:'50%',
              background: step >= s.n ? 'var(--pea-purple)' : 'var(--muted-bg)',
              color: step >= s.n ? 'white' : 'var(--text-3)',
              display:'grid', placeItems:'center',
              fontWeight:600, fontSize:13,
              transition:'all 0.15s'
            }}>
              {step > s.n ? I.check : s.n}
            </div>
            <div className="stepper-label" style={{fontSize:13.5, fontWeight: step === s.n ? 600 : 500, color: step >= s.n ? 'var(--text)' : 'var(--text-3)'}}>{s.l}</div>
          </div>
          {i < steps.length - 1 && <div style={{flex:1, height:2, background: step > s.n ? 'var(--pea-purple)' : 'var(--border)', transition:'background 0.15s'}}></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function Step1({ form, setForm }) {
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const leafletMapRef = React.useRef(null);
  const [latInput, setLatInput] = React.useState(form.coords[0].toFixed(6));
  const [lngInput, setLngInput] = React.useState(form.coords[1].toFixed(6));

  function moveMapTo(coords) {
    setLatInput(coords[0].toFixed(6));
    setLngInput(coords[1].toFixed(6));
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView(coords, leafletMapRef.current.getZoom());
      markerRef.current.setLatLng(coords);
    }
  }

  function applyLatLng() {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    setForm(f => ({ ...f, coords: [lat, lng] }));
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([lat, lng], 14);
      markerRef.current.setLatLng([lat, lng]);
    }
  }

  React.useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(form.coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM',
      maxZoom: 19
    }).addTo(map);

    const orangePin = L.divIcon({
      className: 'pea-pin',
      html: `<div style="width:30px;height:38px;position:relative;">
        <svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0 C7 0 0 6 0 14 C0 24 15 38 15 38 C15 38 30 24 30 14 C30 6 23 0 15 0 Z" fill="#F37021" stroke="white" stroke-width="2"/>
          <circle cx="15" cy="14" r="5" fill="white"/>
        </svg>
      </div>`,
      iconAnchor: [15, 38],
    });

    const marker = L.marker(form.coords, { icon: orangePin, draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const ll = marker.getLatLng();
      setForm((f) => ({ ...f, coords: [ll.lat, ll.lng] }));
      setLatInput(ll.lat.toFixed(6));
      setLngInput(ll.lng.toFixed(6));
    });
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setForm((f) => ({ ...f, coords: [e.latlng.lat, e.latlng.lng] }));
      setLatInput(e.latlng.lat.toFixed(6));
      setLngInput(e.latlng.lng.toFixed(6));
    });

    leafletMapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 100);
  }, []);

  const presetLocations = [
    { name: "PEA สาขาฝาง", coords: [19.9152, 99.2102] },
    { name: "ต.เวียง อ.ฝาง", coords: [19.9152, 99.2102] },
    { name: "ต.แม่ข่า", coords: [19.8542, 99.1856] },
    { name: "ต.แม่งอน", coords: [19.7820, 99.2740] },
    { name: "ต.โป่งน้ำร้อน", coords: [19.9580, 99.1420] },
    { name: "ต.แม่สูน", coords: [19.8920, 99.2310] },
    { name: "ต.สันทราย", coords: [19.8842, 99.1742] },
    { name: "PEA เขต 1 เชียงใหม่", coords: [18.7883, 98.9853] },
  ];

  function setLocation(p) {
    setForm(f => ({ ...f, destination: p.name + " จ.เชียงใหม่", coords: p.coords }));
    setLatInput(p.coords[0].toFixed(6));
    setLngInput(p.coords[1].toFixed(6));
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView(p.coords, 13);
      markerRef.current.setLatLng(p.coords);
    }
  }

  return (
    <div className="grid-2" style={{gap:18, gridTemplateColumns:'1fr 1.1fr'}}>
      <div className="card card-pad">
        <h2 className="mt-0">รายละเอียดการเดินทาง</h2>
        <p className="sub">กำหนดวัน เวลา และจุดประสงค์การใช้รถ</p>
        <div className="col gap-3">
          <div className="field">
            <label className="field-lbl">วัตถุประสงค์การใช้รถ <span className="req">*</span></label>
            <input className="input" list="purpose-list" value={form.purpose}
              onChange={e => setForm({...form, purpose: e.target.value})}
              placeholder="เลือกหรือพิมพ์วัตถุประสงค์..."/>
            <datalist id="purpose-list">
              {PURPOSES.map(p => <option key={p} value={p}/>)}
            </datalist>
            <div className="input-hint">เลือกจากรายการ หรือพิมพ์เองได้</div>
          </div>
          <div className="field">
            <label className="field-lbl">รายละเอียดเพิ่มเติม / เหตุผล {form.purpose === "อื่นๆ (ระบุ)" && <span className="req">*</span>}</label>
            <textarea className="textarea" value={form.purposeNote} onChange={(e) => setForm({...form, purposeNote:e.target.value})} placeholder="ระบุรายละเอียดการเดินทาง เช่น เลขคำร้อง บ้านเลขที่ ฯลฯ"/>
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-lbl">วัน-เวลา เริ่ม <span className="req">*</span></label>
              <input className="input" type="datetime-local" value={form.from} onChange={(e) => setForm({...form, from:e.target.value})}/>
            </div>
            <div className="field">
              <label className="field-lbl">วัน-เวลา เดินทางกลับ <span className="req">*</span></label>
              <input className="input" type="datetime-local" value={form.to} onChange={(e) => setForm({...form, to:e.target.value})}/>
            </div>
          </div>
          {(() => {
            const dur = calcDuration(form.from, form.to);
            const label = dur.valid
              ? [dur.days > 0 ? `${dur.days} วัน` : null, dur.hours > 0 ? `${dur.hours} ชม.` : null, dur.minutes > 0 ? `${dur.minutes} นาที` : null].filter(Boolean).join(" ") || "0 นาที"
              : "วัน-เวลากลับต้องอยู่หลังเวลาไป";
            return (
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'8px 12px', borderRadius:8,
                background: dur.valid ? 'var(--pea-purple-50)' : 'var(--danger-bg)',
                color: dur.valid ? 'var(--pea-purple-deep)' : 'var(--danger)',
                fontSize:12.5, fontWeight:500
              }}>
                {I.clock}
                <span>ระยะเวลาเดินทาง: <b>{label}</b></span>
                {dur.valid && <span style={{marginLeft:'auto', color:'var(--text-3)', fontWeight:400}}>≈ {dur.totalHours.toFixed(1)} ชั่วโมง</span>}
              </div>
            );
          })()}
          <div className="field">
            <label className="field-lbl">สถานที่ปลายทาง <span className="req">*</span></label>
            <input className="input" value={form.destination} onChange={e => setForm({...form, destination:e.target.value})} placeholder="ระบุที่อยู่/ตำบล/จังหวัด"/>
          </div>
          <div className="field">
            <label className="field-lbl">พิกัด GPS (ละติจูด, ลองจิจูด)</label>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <input className="input" value={latInput} onChange={e => setLatInput(e.target.value)}
                onBlur={applyLatLng} onKeyDown={e => e.key === 'Enter' && applyLatLng()}
                placeholder="ละติจูด เช่น 19.9152" style={{flex:1}}/>
              <span style={{color:'var(--text-3)', flexShrink:0}}>，</span>
              <input className="input" value={lngInput} onChange={e => setLngInput(e.target.value)}
                onBlur={applyLatLng} onKeyDown={e => e.key === 'Enter' && applyLatLng()}
                placeholder="ลองจิจูด เช่น 99.2102" style={{flex:1}}/>
              <button className="btn sm primary" onClick={applyLatLng} title="ปักหมุด" style={{flexShrink:0}}>📍</button>
            </div>
            <div className="input-hint">กรอกพิกัดจาก Google Maps แล้วกด 📍 หรือคลิก/ลากหมุดบนแผนที่</div>
          </div>
          <div className="field">
            <label className="field-lbl">จำนวนผู้โดยสาร</label>
            <input className="input" type="number" min="1" max="14" value={form.passengers} onChange={(e) => setForm({...form, passengers:parseInt(e.target.value) || 1})}/>
          </div>
        </div>
      </div>

      <div className="card" style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{padding:'16px 18px 12px'}}>
          <h2 className="mt-0" style={{margin:0}}>ปักหมุดพิกัดปลายทาง</h2>
          <p className="sub" style={{margin:'4px 0 12px'}}>คลิกบนแผนที่หรือลากหมุดเพื่อกำหนดพิกัด · เลือกตำแหน่งบ่อยใช้:</p>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {presetLocations.map((p) => (
              <button key={p.name} className="btn sm ghost" onClick={() => setLocation(p)}>{I.pin} {p.name}</button>
            ))}
          </div>
        </div>
        <div ref={mapRef} style={{height:380, width:'100%', margin:'0 18px 18px', borderRadius:10, border:'1px solid var(--border)'}}></div>
      </div>
    </div>
  );
}

function Step2({ form, setForm, vehicles, availableVehicles, conflictVehicles, bookings, users }) {
  const [typeFilter, setTypeFilter] = React.useState("all");

  const conflictMap = {};
  vehicles.forEach((v) => {
    const conflicts = bookings.filter((b) =>
      b.vehicleId === v.id &&
      (b.status === "approved" || b.status === "booked" || b.status === "urgent") &&
      !(b.to <= form.from || b.from >= form.to)
    );
    if (conflicts.length) conflictMap[v.id] = conflicts;
  });

  const allBookable = vehicles.filter((v) => v.status !== "maintenance" && v.status !== "unavailable");
  const types = ["all", ...new Set(vehicles.map((v) => v.type))];
  const filtered = allBookable.filter((v) => typeFilter === "all" || v.type === typeFilter);
  const availableCount = filtered.filter((v) => !conflictMap[v.id]).length;
  const conflictCount = filtered.filter((v) => conflictMap[v.id]).length;

  const selectedConflicts = form.vehicleId ? conflictMap[form.vehicleId] : null;

  return (
    <div className="card card-pad">
      <div style={{display:'flex', alignItems:'baseline', gap:14, flexWrap:'wrap'}}>
        <div>
          <h2 className="mt-0" style={{margin:0}}>เลือกรถยนต์</h2>
          <p className="sub" style={{margin:'2px 0 0'}}>
            ในช่วง {fmtDateTime(form.from)} ถึง {fmtDateTime(form.to)} —
            <span style={{color:'var(--ok)', fontWeight:600}}> ว่าง {availableCount} คัน</span>
            {conflictCount > 0 && <span style={{color:'var(--warn)', fontWeight:600}}> · ติดจอง {conflictCount} คัน (จองซ้อนได้ แต่ต้องรออนุมัติ)</span>}
          </p>
        </div>
        <div style={{display:'flex', gap:6, marginLeft:'auto', flexWrap:'wrap'}}>
          {types.map((t) => (
            <button key={t} className={"btn sm" + (typeFilter === t ? " primary" : " ghost")} onClick={() => setTypeFilter(t)}>
              {t === "all" ? "ทั้งหมด" : VEHICLE_TYPES[t]?.label || t}
            </button>
          ))}
        </div>
      </div>

      {selectedConflicts && (
        <div style={{
          marginTop:14, padding:'12px 14px',
          background:'var(--warn-bg)', border:'1.5px solid var(--warn)',
          borderRadius:10, display:'flex', gap:12, alignItems:'flex-start',
        }}>
          <div style={{width:32, height:32, borderRadius:8, background:'var(--warn)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
            {I.warn}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.5, fontWeight:700, color:'#7a5500', marginBottom:4}}>
              ⚠️ จองซ้อนกับการจองที่มีอยู่ ({selectedConflicts.length} รายการ)
            </div>
            <div style={{fontSize:12.5, color:'#7a5500', lineHeight:1.5}}>
              ท่านยังสามารถส่งคำขอจองได้ — ผู้จัดการ/ผู้ดูแลระบบจะเป็นผู้ตัดสินใจว่าจะอนุมัติให้ใคร
            </div>
            <div className="col gap-2" style={{marginTop:8}}>
              {selectedConflicts.map((b) => {
                const u = users.find((x) => x.id === b.userId);
                return (
                  <div key={b.id} style={{
                    background:'white', borderRadius:8, padding:'8px 10px',
                    fontSize:12, display:'flex', gap:8, alignItems:'center',
                    border:'1px solid #f0d8a8',
                  }}>
                    <StatusPill status={b.status}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600}}>{u?.name} · {u?.dept}</div>
                      <div className="text-xs muted" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                        {fmtDateTime(b.from)}–{fmtTime(b.to)} · {b.destination}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid-3" style={{gap:12, marginTop:16, gridTemplateColumns:'repeat(3, 1fr)'}}>
        {filtered.map((v) => {
          const selected = form.vehicleId === v.id;
          const conflicts = conflictMap[v.id];
          const isConflict = !!conflicts;
          return (
            <button key={v.id} onClick={() => setForm({...form, vehicleId: v.id})}
              style={{
                textAlign:'left', cursor:'pointer',
                background: selected
                  ? (isConflict ? 'var(--warn-bg)' : 'var(--pea-purple-50)')
                  : 'var(--surface)',
                border: selected
                  ? (isConflict ? '2px solid var(--warn)' : '2px solid var(--pea-purple)')
                  : isConflict ? '1.5px solid #f0c577' : '1px solid var(--border)',
                borderRadius:12, padding:14, display:'flex', gap:12, alignItems:'center',
                position:'relative', transition:'all 0.12s'
              }}>
              <div className="veh-ico lg" style={{
                background: selected
                  ? (isConflict ? 'var(--warn)' : 'var(--pea-purple)')
                  : isConflict ? 'var(--warn-bg)' : undefined,
                color: selected ? 'white' : isConflict ? 'var(--warn)' : undefined
              }}>
                <VehicleIcon type={v.type} size={36}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap'}}>
                  <span className="plate" style={{fontSize:11.5, padding:'1px 6px'}}>{v.plate.split(' ').slice(0,2).join(' ')}</span>
                  <span className="text-xs muted">{v.year}</span>
                  {isConflict && (
                    <span style={{padding:'1px 7px', background:'var(--warn)', color:'white', borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:'0.02em'}}>
                      ติดจอง {conflicts.length}
                    </span>
                  )}
                </div>
                <div style={{fontSize:13.5, fontWeight:600, marginTop:2}}>{v.brand}</div>
                <div className="text-xs muted">{VEHICLE_TYPES[v.type]?.label} · {v.seats} ที่นั่ง · {FUEL_TYPES[v.fuel]}</div>
              </div>
              {selected && (
                <div style={{
                  position:'absolute', top:8, right:8,
                  width:22, height:22, borderRadius:'50%',
                  background: isConflict ? 'var(--warn)' : 'var(--pea-purple)',
                  color:'white', display:'grid', placeItems:'center'
                }}>{I.check}</div>
              )}
            </button>
          );
        })}
      </div>

      {vehicles.filter((v) => v.status === "maintenance" || v.status === "unavailable").length > 0 && (
        <>
          <div className="divider"></div>
          <div style={{fontSize:12, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>
            รถที่ไม่พร้อมใช้งาน ({vehicles.filter((v) => v.status === "maintenance" || v.status === "unavailable").length} คัน) — จองไม่ได้
          </div>
          <div className="grid-3" style={{gap:12, gridTemplateColumns:'repeat(3, 1fr)'}}>
            {vehicles.filter((v) => v.status === "maintenance" || v.status === "unavailable").map((v) => (
              <div key={v.id} style={{background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:12, padding:14, display:'flex', gap:12, alignItems:'center', opacity:0.55}}>
                <div className="veh-ico lg" style={{background:'var(--status-maintenance-bg)', color:'var(--status-maintenance)'}}>
                  <VehicleIcon type={v.type} size={36}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <span className="plate" style={{fontSize:11.5, padding:'1px 6px'}}>{v.plate.split(' ').slice(0,2).join(' ')}</span>
                  <div style={{fontSize:13.5, fontWeight:600, marginTop:2}}>{v.brand}</div>
                  <StatusPill status={v.status}/>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function calcDuration(from, to) {
  const ms = new Date(to) - new Date(from);
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, totalHours: 0, valid: false };
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  return { days, hours, minutes, totalHours: (ms / 3600000), valid: true };
}

function Step3({ form, setForm, user, vehicles, bookings = [], users = [] }) {
  const v = vehicles.find((x) => x.id === form.vehicleId);
  const dur = calcDuration(form.from, form.to);
  const durLabel = dur.valid
    ? [
        dur.days > 0 ? `${dur.days} วัน` : null,
        dur.hours > 0 ? `${dur.hours} ชั่วโมง` : null,
        dur.minutes > 0 ? `${dur.minutes} นาที` : null,
      ].filter(Boolean).join(" ") || "0 นาที"
    : "—";
  const sameDay = form.from.slice(0,10) === form.to.slice(0,10);

  const conflicts = bookings.filter((b) =>
    b.vehicleId === form.vehicleId &&
    (b.status === "approved" || b.status === "booked" || b.status === "urgent") &&
    !(b.to <= form.from || b.from >= form.to)
  );

  return (
    <div className="grid-2" style={{gap:18, gridTemplateColumns:'1.3fr 1fr'}}>
      <div className="card card-pad">
        <h2 className="mt-0">สรุปการจอง</h2>
        <p className="sub">ตรวจสอบรายละเอียดก่อนยืนยัน</p>

        <div style={{
          marginTop:14, padding:'12px 14px',
          background:'linear-gradient(135deg, var(--pea-purple-50), var(--pea-orange-50))',
          borderRadius:10, border:'1px solid var(--pea-purple-100)',
          display:'flex', alignItems:'center', gap:14
        }}>
          <div style={{width:38, height:38, borderRadius:10, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
            {I.clock}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:11.5, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em'}}>ระยะเวลาการใช้รถ</div>
            <div style={{display:'flex', gap:14, alignItems:'baseline', flexWrap:'wrap', marginTop:2}}>
              <div style={{fontSize:20, fontWeight:700, color:'var(--pea-purple)', letterSpacing:'-0.01em'}}>{durLabel}</div>
              <div style={{fontSize:12.5, color:'var(--text-2)'}}>
                ≈ {dur.totalHours.toFixed(1)} ชั่วโมง · {sameDay ? "ใช้งานภายในวันเดียว" : `เดินทางข้ามวัน (${dur.days + (dur.hours > 0 || dur.minutes > 0 ? 1 : 0)} วันทำการ)`}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'140px 1fr', rowGap:10, columnGap:14, marginTop:14, fontSize:13.5}}>
          <Field label="ผู้จอง" value={`${user.name} (${user.emp})`}/>
          <Field label="สังกัด" value={user.dept}/>
          <Field label="วัตถุประสงค์" value={form.purpose}/>
          {form.purposeNote && <Field label="รายละเอียด" value={form.purposeNote}/>}
          <Field label="วัน-เวลา ไป" value={fmtDateTime(form.from)}/>
          <Field label="วัน-เวลา กลับ" value={fmtDateTime(form.to)}/>
          <Field label="ระยะเวลารวม" value={<span style={{color:'var(--pea-purple)', fontWeight:600}}>{durLabel}</span>}/>
          <Field label="ปลายทาง" value={form.destination}/>
          <Field label="พิกัด" value={<span style={{fontFamily:'var(--font-mono)', fontSize:12}}>{form.coords[0].toFixed(4)}, {form.coords[1].toFixed(4)}</span>}/>
          <Field label="ผู้โดยสาร" value={`${form.passengers} คน`}/>
          <Field label="หมายเหตุ" value={
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"/>
          }/>
        </div>
      </div>

      {v && (
        <div className="card card-pad">
          <h2 className="mt-0">รถที่เลือก</h2>
          <p className="sub">ข้อมูลรถยนต์</p>

          <div style={{display:'flex', gap:14, alignItems:'center', padding:'14px 0', borderBottom:'1px solid var(--border)'}}>
            <div className="veh-ico lg" style={{width:64, height:64, background:'var(--pea-purple-50)', color:'var(--pea-purple)'}}>
              <VehicleIcon type={v.type} size={44}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:2}}>
                <span className="plate">{v.plate.split(' ').slice(0,2).join(' ')}</span>
              </div>
              <div style={{fontSize:15, fontWeight:600}}>{v.brand}</div>
              <div className="text-xs muted">{v.id} · {v.year} · {VEHICLE_TYPES[v.type]?.label}</div>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12, fontSize:13}}>
            <Mini lbl="ที่นั่ง" val={`${v.seats} คน`}/>
            <Mini lbl="เชื้อเพลิง" val={FUEL_TYPES[v.fuel]}/>
            <Mini lbl="เลขไมล์" val={`${v.mileage.toLocaleString('th-TH')} กม.`}/>
            <Mini lbl="ผู้รับผิดชอบ" val={v.owner}/>
          </div>

          <div style={{marginTop:14, padding:'12px 14px', background:'var(--pea-orange-50)', borderRadius:10, fontSize:12.5, color:'#a55a18'}}>
            <b>หมายเหตุ:</b> เมื่อยืนยันแล้ว ระบบจะส่งคำขอให้ผู้จัดการ/ผู้ดูแลระบบอนุมัติ
            หลังอนุมัติแล้ว ท่านจะได้ใบจองรถสำหรับยืนยันสิทธิ์การใช้งาน
          </div>

          {conflicts.length > 0 && (
            <div style={{
              marginTop:10, padding:'12px 14px',
              background:'var(--warn-bg)', border:'1.5px solid var(--warn)',
              borderRadius:10,
            }}>
              <div style={{display:'flex', gap:8, alignItems:'flex-start', marginBottom:8}}>
                <div style={{width:24, height:24, borderRadius:6, background:'var(--warn)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
                  {I.warn}
                </div>
                <div style={{flex:1, fontSize:12.5, color:'#7a5500', lineHeight:1.5}}>
                  <b>คำเตือน:</b> รถคันนี้มีการจองอื่นในช่วงเวลาเดียวกัน {conflicts.length} รายการ —
                  ระบบจะส่งคำขอเข้าคิวรอ <b>ผู้อนุมัติจะเป็นผู้ตัดสินใจว่าจะอนุมัติให้ใคร</b>
                </div>
              </div>
              <div className="col gap-2">
                {conflicts.map((b) => {
                  const u = users.find((x) => x.id === b.userId);
                  return (
                    <div key={b.id} style={{background:'white', borderRadius:6, padding:'6px 10px', fontSize:11.5, border:'1px solid #f0d8a8', display:'flex', gap:6, alignItems:'center'}}>
                      <StatusPill status={b.status}/>
                      <span style={{fontWeight:600}}>{u?.name}</span>
                      <span className="muted" style={{flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>· {fmtTime(b.from)}-{fmtTime(b.to)} · {b.destination}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <>
      <div style={{color:'var(--text-3)', fontSize:12.5, paddingTop:2}}>{label}</div>
      <div style={{color:'var(--text)', fontWeight:500}}>{value}</div>
    </>
  );
}
function Mini({ lbl, val }) {
  return (
    <div style={{background:'var(--surface-2)', borderRadius:8, padding:'9px 12px'}}>
      <div style={{fontSize:11, color:'var(--text-3)'}}>{lbl}</div>
      <div style={{fontWeight:600}}>{val}</div>
    </div>
  );
}

export { BookingScreen };
