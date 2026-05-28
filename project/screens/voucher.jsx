// Voucher (printable booking confirmation) + Booking detail modal

function BookingVoucher({ booking, vehicle, user, approver, onClose }) {
  if (!booking || !vehicle) return null;
  const refCode = booking.id;
  const distance = booking.mileageIn != null ? booking.mileageIn - booking.mileageOut : null;

  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal" style={{ width: 800, maxHeight: '92vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <h2>ใบจองรถยนต์ — สำหรับยืนยันสิทธิ์การใช้งาน</h2>
          <button className="btn icon ghost" onClick={onClose}>{window.I.x}</button>
        </div>
        <div className="modal-body" style={{padding:0, background:'#f0ecf3'}}>
          <div className="print-area" style={{background:'white', margin:18, padding:'30px 36px', borderRadius:8, position:'relative'}}>
            {/* Watermark */}
            <div style={{
              position:'absolute', inset:0, display:'grid', placeItems:'center',
              pointerEvents:'none', opacity:0.05, zIndex:0
            }}>
              <div style={{fontSize:140, fontWeight:900, transform:'rotate(-20deg)', color:'var(--pea-purple)'}}>PEA FANG</div>
            </div>

            {/* Header */}
            <div style={{display:'flex', alignItems:'flex-start', gap:14, paddingBottom:14, borderBottom:'2px solid var(--pea-purple)', position:'relative', zIndex:1}}>
              <div style={{width:60, height:60, background:'var(--pea-orange)', borderRadius:12, display:'grid', placeItems:'center', color:'white', fontWeight:700, fontSize:14, letterSpacing:'0.02em'}}>PEA</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase'}}>การไฟฟ้าส่วนภูมิภาค สาขาฝาง</div>
                <div style={{fontSize:22, fontWeight:700, color:'var(--pea-purple)', letterSpacing:'-0.01em'}}>ใบจองรถยนต์ใช้งาน</div>
                <div style={{fontSize:12.5, color:'var(--text-2)', marginTop:2}}>Vehicle Booking Voucher · PEA FANG District</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11, color:'var(--text-3)'}}>เลขที่ใบจอง</div>
                <div style={{fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--pea-purple)', fontSize:13.5, letterSpacing:'0.04em'}}>{refCode}</div>
                <div style={{marginTop:6, padding:'4px 10px', background: booking.status === "urgent" ? 'var(--status-urgent-bg)' : 'var(--ok-bg)', color: booking.status === "urgent" ? 'var(--status-urgent)' : 'var(--ok)', borderRadius:6, fontSize:11, fontWeight:700, letterSpacing:'0.04em', display:'inline-block'}}>
                  ✓ {booking.status === "urgent" ? "ภารกิจด่วน" : "อนุมัติแล้ว"}
                </div>
              </div>
            </div>

            {/* QR + Vehicle */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 120px', gap:18, marginTop:18, position:'relative', zIndex:1}}>
              <div>
                <SectionHead n="1" title="ข้อมูลผู้จอง"/>
                <Row k="ชื่อ-นามสกุล" v={user?.name}/>
                <Row k="ตำแหน่ง" v={user?.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : user?.role === "manager" ? "ผู้จัดการ (Manager)" : "ผู้ใช้งาน (User)"}/>
                <Row k="รหัสพนักงาน" v={user?.emp}/>
                <Row k="สังกัด" v={user?.dept}/>
                <Row k="โทรศัพท์" v={user?.phone}/>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{
                  width:110, height:110, margin:'0 auto 4px',
                  background:`
                    radial-gradient(black 25%, transparent 25%) 0 0/22px 22px,
                    radial-gradient(black 25%, transparent 25%) 11px 11px/22px 22px,
                    repeating-linear-gradient(0deg, black 0 2px, transparent 2px 6px),
                    repeating-linear-gradient(90deg, black 0 2px, transparent 2px 6px),
                    white
                  `,
                  borderRadius:4, border:'4px solid black',
                  position:'relative', overflow:'hidden'
                }}>
                  <div style={{position:'absolute', top:6, left:6, width:24, height:24, background:'white', border:'5px solid black'}}></div>
                  <div style={{position:'absolute', top:6, right:6, width:24, height:24, background:'white', border:'5px solid black'}}></div>
                  <div style={{position:'absolute', bottom:6, left:6, width:24, height:24, background:'white', border:'5px solid black'}}></div>
                </div>
                <div style={{fontSize:10, color:'var(--text-3)'}}>สแกนเพื่อยืนยัน</div>
              </div>
            </div>

            <div style={{marginTop:14, position:'relative', zIndex:1}}>
              <SectionHead n="2" title="ข้อมูลรถยนต์"/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:18, rowGap:0}}>
                <div>
                  <Row k="รหัส / ทะเบียน" v={<><b>{vehicle.id}</b> · <span style={{fontFamily:'var(--font-mono)', fontWeight:600}}>{vehicle.plate}</span></>}/>
                  <Row k="ยี่ห้อ / รุ่น / ปี" v={`${vehicle.brand} (${vehicle.year})`}/>
                </div>
                <div>
                  <Row k="ประเภทรถ" v={window.VEHICLE_TYPES[vehicle.type]?.label}/>
                  <Row k="เชื้อเพลิง / ที่นั่ง" v={`${window.FUEL_TYPES[vehicle.fuel]} · ${vehicle.seats} ที่นั่ง`}/>
                </div>
              </div>
            </div>

            <div style={{marginTop:14, position:'relative', zIndex:1}}>
              <SectionHead n="3" title="รายละเอียดการเดินทาง"/>
              <Row k="วัตถุประสงค์" v={booking.purpose}/>
              <Row k="รายละเอียด" v={booking.purposeNote}/>
              <Row k="วันเวลาเดินทางไป" v={window.fmtDateTime(booking.from)}/>
              <Row k="วันเวลาเดินทางกลับ" v={window.fmtDateTime(booking.to)}/>
              {(() => {
                const ms = new Date(booking.to) - new Date(booking.from);
                const totalMin = Math.max(0, Math.floor(ms / 60000));
                const d = Math.floor(totalMin / (60*24));
                const h = Math.floor((totalMin % (60*24)) / 60);
                const m = totalMin % 60;
                const label = [d > 0 ? `${d} วัน` : null, h > 0 ? `${h} ชั่วโมง` : null, m > 0 ? `${m} นาที` : null].filter(Boolean).join(" ") || "0 นาที";
                return <Row k="ระยะเวลารวม" v={<b style={{color:'var(--pea-purple)'}}>{label}</b>}/>;
              })()}
              <Row k="สถานที่ปลายทาง" v={booking.destination}/>
              <Row k="พิกัด GPS" v={<span style={{fontFamily:'var(--font-mono)'}}>{booking.coords[0].toFixed(5)}, {booking.coords[1].toFixed(5)}</span>}/>
              <Row k="ผู้โดยสาร" v={`${booking.passengers || 1} คน`}/>
              {booking.mileageOut != null && <Row k="เลขไมล์ก่อนใช้งาน" v={`${window.fmtNum(booking.mileageOut)} กม.`}/>}
              {booking.mileageIn != null && <Row k="เลขไมล์หลังใช้งาน" v={`${window.fmtNum(booking.mileageIn)} กม. (ใช้ไป ${window.fmtNum(distance)} กม.)`}/>}
            </div>

            <div style={{marginTop:14, position:'relative', zIndex:1}}>
              <SectionHead n="4" title="การอนุมัติ"/>
              <Row k="วันที่จอง" v={window.fmtDateTime(booking.createdAt)}/>
              <Row k="วันที่อนุมัติ" v="2026-05-20 09:30"/>
              <Row k="ผู้อนุมัติ" v={<><b>{booking.approvedBy}</b> · ผู้จัดการ</>}/>
            </div>

            <div style={{marginTop:22, paddingTop:14, borderTop:'1px dashed var(--border-strong)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, position:'relative', zIndex:1}}>
              <Signature label="ผู้จอง" name={user?.name}/>
              <Signature label="ผู้อนุมัติ" name={booking.approvedBy}/>
              <Signature label="ผู้รับ-ส่งรถ" name="________________"/>
            </div>

            <div style={{marginTop:18, padding:'10px 12px', background:'var(--pea-orange-50)', borderRadius:8, fontSize:11, color:'#7a4d10', lineHeight:1.6, position:'relative', zIndex:1}}>
              <b>หมายเหตุ:</b> โปรดนำใบจองนี้แสดงต่อ รปภ. ก่อนนำรถยนต์ออกจากหน่วยงาน · ใบจองมีผลเฉพาะวันและเวลาที่ระบุ ·
              กรุณาคืนรถพร้อมเลขไมล์และตรวจสภาพรถผ่านระบบเมื่อกลับถึงหน่วยงาน · พิมพ์เมื่อ {new Date().toLocaleString('th-TH')}
            </div>
          </div>
        </div>
        <div className="modal-foot no-print">
          <button className="btn ghost" onClick={() => alert('ส่งออกเป็น CSV/Excel (mock)')}>{window.I.download} ส่งออก CSV</button>
          <button className="btn primary" onClick={() => window.print()}>{window.I.print} พิมพ์ใบจอง</button>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ n, title }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6, marginTop:6}}>
      <div style={{width:22, height:22, background:'var(--pea-purple)', color:'white', borderRadius:6, display:'grid', placeItems:'center', fontSize:12, fontWeight:700}}>{n}</div>
      <div style={{fontSize:13, fontWeight:700, color:'var(--pea-purple)', letterSpacing:'0.01em'}}>{title}</div>
      <div style={{flex:1, height:1, background:'var(--border)'}}></div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'140px 1fr', padding:'4px 0', fontSize:12.5, borderBottom:'1px dotted #e8e2ec'}}>
      <div style={{color:'var(--text-3)'}}>{k}</div>
      <div style={{color:'var(--text)', fontWeight:500}}>{v || '—'}</div>
    </div>
  );
}
function Signature({ label, name }) {
  return (
    <div style={{textAlign:'center'}}>
      <div style={{height:50, borderBottom:'1.5px solid var(--text)', marginBottom:6}}></div>
      <div style={{fontSize:11, color:'var(--text-3)'}}>ลงชื่อ ({label})</div>
      <div style={{fontSize:12, fontWeight:600, marginTop:2}}>{name || '________________'}</div>
    </div>
  );
}

// ─── Booking detail modal ─────────────────────────────────────────
function BookingDetailModal({ booking, vehicle, user, onClose }) {
  if (!booking || !vehicle) return null;

  return (
    <window.Modal title={`รายละเอียดการจอง · ${booking.id}`} onClose={onClose} width={620}>
      <div style={{display:'flex', gap:14, paddingBottom:14, borderBottom:'1px solid var(--border)', marginBottom:14}}>
        <div className="veh-ico lg" style={{width:64, height:64}}>
          <window.VehicleIcon type={vehicle.type} size={42}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span className="plate">{vehicle.plate.split(' ').slice(0,2).join(' ')}</span>
            <window.StatusPill status={booking.status}/>
          </div>
          <div style={{fontSize:16, fontWeight:600, marginTop:4}}>{vehicle.brand}</div>
          <div className="text-xs muted">{vehicle.id} · {vehicle.year} · {window.VEHICLE_TYPES[vehicle.type]?.label}</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'140px 1fr', rowGap:8, columnGap:14, fontSize:13.5}}>
        <Field label="ผู้จอง" value={`${user?.name} (${user?.emp})`}/>
        <Field label="สังกัด" value={user?.dept}/>
        <Field label="วัตถุประสงค์" value={booking.purpose}/>
        <Field label="รายละเอียด" value={booking.purposeNote}/>
        <Field label="เวลาไป" value={window.fmtDateTime(booking.from)}/>
        <Field label="เวลากลับ" value={window.fmtDateTime(booking.to)}/>
        <Field label="ปลายทาง" value={booking.destination}/>
        <Field label="พิกัด" value={<span style={{fontFamily:'var(--font-mono)', fontSize:12}}>{booking.coords[0].toFixed(4)}, {booking.coords[1].toFixed(4)}</span>}/>
        <Field label="ผู้โดยสาร" value={`${booking.passengers || 1} คน`}/>
        {booking.approvedBy && <Field label="อนุมัติโดย" value={booking.approvedBy}/>}
        {booking.rejectReason && <Field label="เหตุผลปฏิเสธ" value={<span style={{color:'var(--danger)'}}>{booking.rejectReason}</span>}/>}
        {booking.urgentReason && <Field label="เหตุภารกิจด่วน" value={<span style={{color:'var(--status-urgent)', fontWeight:600}}>{booking.urgentReason}</span>}/>}
        {booking.mileageOut != null && <Field label="ไมล์ก่อนใช้" value={`${window.fmtNum(booking.mileageOut)} กม.`}/>}
        {booking.mileageIn != null && <Field label="ไมล์หลังใช้" value={`${window.fmtNum(booking.mileageIn)} กม. (+${window.fmtNum(booking.mileageIn - booking.mileageOut)})`}/>}
        {booking.rating && <Field label="คะแนนรถ" value={<span style={{color:'var(--pea-orange)', display:'inline-flex', gap:1}}>{Array.from({length:booking.rating}).map((_, i) => window.I.star)}</span>}/>}
      </div>
    </window.Modal>
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

window.BookingVoucher = BookingVoucher;
window.BookingDetailModal = BookingDetailModal;
