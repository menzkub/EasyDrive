// Check-in / Check-out + 10-point inspection checklist + mileage logging

function CheckinScreen({ bookings, vehicles, users, currentUser, onCheckIn, onCheckOut, onPrintChecklist }) {
  const myBookings = bookings.filter((b) =>
    (b.userId === currentUser.id || currentUser.role === "admin" || currentUser.role === "manager") &&
    (b.status === "approved" || b.status === "urgent")
  );
  const [selectedId, setSelectedId] = React.useState(myBookings[0]?.id);
  const booking = bookings.find((b) => b.id === selectedId) || myBookings[0];
  const vehicle = booking && vehicles.find((v) => v.id === booking.vehicleId);
  const user = booking && users.find((u) => u.id === booking.userId);

  const isOut = booking && booking.mileageOut == null;
  const isIn = booking && booking.mileageOut != null && booking.mileageIn == null;

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <h2 className="mt-0" style={{margin:0}}>Check-in / Check-out รถยนต์</h2>
        <p className="sub" style={{margin:'2px 0 0'}}>บันทึกการรับ-ส่งรถ ตรวจสภาพ และเลขไมล์ก่อน-หลังใช้งาน</p>
      </div>

      {myBookings.length === 0 ? (
        <div className="card card-pad" style={{textAlign:'center', padding:'60px'}}>
          <div style={{fontSize:42}}>🚗</div>
          <h3>ไม่มีการจองที่อนุมัติแล้ว</h3>
          <p className="muted">เมื่อมีการจองที่ได้รับการอนุมัติ ท่านจะสามารถ Check-in/out ได้จากที่นี่</p>
        </div>
      ) : (
        <div className="grid-2" style={{gap:14, gridTemplateColumns:'320px 1fr'}}>
          {/* List */}
          <div className="card card-pad">
            <h2 className="mt-0">การจองของฉัน</h2>
            <p className="sub">เลือกการจองเพื่อ Check-in/out</p>
            <div className="col gap-2">
              {myBookings.map((b) => {
                const v = vehicles.find((x) => x.id === b.vehicleId);
                const u = users.find((x) => x.id === b.userId);
                return (
                  <button key={b.id} onClick={() => setSelectedId(b.id)} style={{
                    textAlign:'left', padding:'10px 12px',
                    background: b.id === selectedId ? 'var(--pea-purple-50)' : 'var(--surface-2)',
                    border: b.id === selectedId ? '1.5px solid var(--pea-purple)' : '1px solid var(--border)',
                    borderRadius:9, cursor:'pointer'
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                      <span className="plate" style={{fontSize:11, padding:'1px 6px'}}>{v?.plate.split(' ').slice(0,2).join(' ')}</span>
                      <span className="text-xs muted">{b.id}</span>
                    </div>
                    <div style={{fontSize:13, fontWeight:600}}>{v?.brand}</div>
                    <div className="text-xs muted">{u?.name} · {window.fmtDateTime(b.from)}</div>
                    <div style={{marginTop:6}}>
                      {b.mileageOut == null && <span className="pill pending"><span className="dot"></span>รอ Check-in</span>}
                      {b.mileageOut != null && b.mileageIn == null && <span className="pill approved"><span className="dot"></span>กำลังใช้งาน</span>}
                      {b.mileageIn != null && <span className="pill done"><span className="dot"></span>เสร็จสิ้น</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          {booking && vehicle && (
            <CheckinDetail
              booking={booking} vehicle={vehicle} user={user}
              isOut={isOut} isIn={isIn}
              onCheckIn={(data) => onCheckIn(booking.id, data)}
              onCheckOut={(data) => onCheckOut(booking.id, data)}
              onPrintChecklist={() => onPrintChecklist(booking)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CheckinDetail({ booking, vehicle, user, isOut, isIn, onCheckIn, onCheckOut, onPrintChecklist }) {
  const [mileageOut, setMileageOut] = React.useState(booking.mileageOut || vehicle.mileage);
  const [mileageIn, setMileageIn] = React.useState(booking.mileageIn || vehicle.mileage);
  const [checklist, setChecklist] = React.useState({});
  const [notes, setNotes] = React.useState("");
  const [photos, setPhotos] = React.useState({ before: false, after: false, mileageDash: false });
  const [rating, setRating] = React.useState(5);
  const [mileageReason, setMileageReason] = React.useState("");

  const mileageDiff = mileageOut - vehicle.mileage;
  const mileageMismatch = isOut && mileageDiff !== 0;
  const needsCorrection = mileageMismatch && (mileageDiff > 5 || mileageDiff < -5); // tolerance ±5km

  const distance = mileageIn - (booking.mileageOut || mileageOut);
  const passed = Object.keys(checklist).filter((k) => checklist[k] === "pass").length;
  const failed = Object.keys(checklist).filter((k) => checklist[k] === "fail").length;
  const allChecked = passed + failed === window.CHECKLIST.length;

  // Block checkout if mismatch but no photo/reason, OR if no before-use photo
  const canCheckout = allChecked && photos.before && (!needsCorrection || (photos.mileageDash && mileageReason.trim().length > 3));
  // Block check-in completion if no after-use photo or no valid mileageIn
  const canCheckinComplete = isIn && photos.after && mileageIn > (booking.mileageOut || 0);

  return (
    <div className="card card-pad">
      <div style={{display:'flex', gap:14, paddingBottom:14, borderBottom:'1px solid var(--border)', marginBottom:14}}>
        <div className="veh-ico lg" style={{width:64, height:64}}>
          <window.VehicleIcon type={vehicle.type} size={42}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span className="plate">{vehicle.plate.split(' ').slice(0,2).join(' ')}</span>
            <window.StatusPill status={booking.status}/>
          </div>
          <div style={{fontSize:16, fontWeight:600, marginTop:4}}>{vehicle.brand}</div>
          <div className="text-xs muted">{booking.id} · {user?.name} · {window.fmtDateTime(booking.from)} – {window.fmtTime(booking.to)}</div>
          <div className="text-xs muted" style={{marginTop:2}}>📍 {booking.destination}</div>
        </div>
        <div style={{display:'flex', gap:6, alignItems:'flex-start'}}>
          <button className="btn sm ghost" onClick={onPrintChecklist}>{window.I.print} พิมพ์</button>
          <div style={{background:'var(--surface-2)', borderRadius:8, padding:'6px 10px', textAlign:'center'}}>
            <div className="text-xs muted">QR Check-in</div>
            <div style={{
              width:50, height:50, marginTop:4,
              background: `repeating-conic-gradient(#000 0 25%, #fff 0 50%) 0 0/8px 8px`,
              borderRadius:4
            }}></div>
          </div>
        </div>
      </div>

      {/* 10-point checklist */}
      <div style={{marginBottom:18}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10}}>
          <h3 style={{margin:0, fontSize:15, fontWeight:600}}>ตรวจสอบความพร้อมก่อนใช้งาน (10 รายการ)</h3>
          <div className="text-xs" style={{color: failed ? 'var(--danger)' : 'var(--ok)'}}>
            ผ่าน {passed} / ไม่ผ่าน {failed} / ทั้งหมด {window.CHECKLIST.length}
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {window.CHECKLIST.map((item, i) => {
            const v = checklist[item.id];
            return (
              <div key={item.id} style={{
                border: v === "fail" ? '1.5px solid var(--danger)' : '1px solid var(--border)',
                background: v === "pass" ? 'var(--ok-bg)' : v === "fail" ? 'var(--danger-bg)' : 'var(--surface)',
                borderRadius:9, padding:'10px 12px', display:'flex', alignItems:'center', gap:10
              }}>
                <div style={{
                  width:24, height:24, borderRadius:6,
                  background: v === "pass" ? 'var(--ok)' : v === "fail" ? 'var(--danger)' : 'var(--surface-2)',
                  color: v ? 'white' : 'var(--text-3)',
                  display:'grid', placeItems:'center', fontWeight:600, fontSize:11, flexShrink:0
                }}>{i+1}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600}}>{item.label}</div>
                  <div className="text-xs muted" style={{lineHeight:1.3}}>{item.hint}</div>
                </div>
                <div style={{display:'flex', gap:3}}>
                  <button
                    onClick={() => setChecklist({...checklist, [item.id]:"pass"})}
                    style={{width:28, height:28, borderRadius:6, border:'none', cursor:'pointer',
                      background: v === "pass" ? 'var(--ok)' : 'var(--surface-2)',
                      color: v === "pass" ? 'white' : 'var(--ok)'
                    }} title="ผ่าน">{window.I.check}</button>
                  <button
                    onClick={() => setChecklist({...checklist, [item.id]:"fail"})}
                    style={{width:28, height:28, borderRadius:6, border:'none', cursor:'pointer',
                      background: v === "fail" ? 'var(--danger)' : 'var(--surface-2)',
                      color: v === "fail" ? 'white' : 'var(--danger)'
                    }} title="ไม่ผ่าน">{window.I.x}</button>
                </div>
              </div>
            );
          })}
        </div>
        {failed > 0 && (
          <div style={{marginTop:10, padding:'8px 12px', background:'var(--danger-bg)', borderRadius:8, fontSize:12.5, color:'var(--danger)'}}>
            ⚠️ พบรายการไม่ผ่านการตรวจ {failed} รายการ — กรุณาแจ้งผู้รับผิดชอบประจำรถก่อนใช้งาน
          </div>
        )}
      </div>

      {/* Mileage + photos */}
      <div className="grid-2" style={{gap:14, marginBottom:14}}>
        <div style={{background:'var(--surface-2)', borderRadius:10, padding:'14px 16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <div style={{width:28, height:28, borderRadius:8, background:'var(--pea-orange)', color:'white', display:'grid', placeItems:'center', fontWeight:700, fontSize:12}}>OUT</div>
            <b>Check-out (ก่อนใช้งาน)</b>
            {booking.mileageOut != null && <span className="pill done" style={{marginLeft:'auto'}}><span className="dot"></span>บันทึกแล้ว</span>}
          </div>
          <div className="field" style={{marginBottom:10}}>
            <label className="field-lbl">เลขไมล์ก่อนใช้งาน (กม.) <span className="req">*</span></label>
            <input
              className="input"
              type="number"
              value={booking.mileageOut || mileageOut}
              onChange={(e) => setMileageOut(parseInt(e.target.value) || 0)}
              disabled={booking.mileageOut != null}
              style={needsCorrection ? {borderColor:'var(--warn)', background:'var(--warn-bg)'} : null}
            />
            <div className="input-hint">
              เลขไมล์ในระบบ: <b>{window.fmtNum(vehicle.mileage)}</b> กม.
              {mileageMismatch && (
                <span style={{marginLeft:8, color: needsCorrection ? 'var(--danger)' : 'var(--warn)', fontWeight:600}}>
                  · ต่าง {mileageDiff > 0 ? '+' : ''}{window.fmtNum(mileageDiff)} กม.
                </span>
              )}
            </div>
          </div>

          {/* Mismatch correction flow */}
          {needsCorrection && isOut && (
            <div style={{
              background:'#fff', border:'1.5px solid var(--warn)', borderRadius:9,
              padding:'12px 14px', marginBottom:10
            }}>
              <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:8}}>
                <div style={{width:22, height:22, borderRadius:6, background:'var(--warn)', color:'white', display:'grid', placeItems:'center', flexShrink:0}}>
                  {window.I.warn}
                </div>
                <div style={{fontSize:12.5, lineHeight:1.5}}>
                  <b style={{color:'var(--warn)'}}>เลขไมล์ไม่ตรงกับในระบบ</b><br/>
                  ระบบบันทึก <b>{window.fmtNum(vehicle.mileage)}</b> กม. แต่ท่านระบุ <b>{window.fmtNum(mileageOut)}</b> กม.
                  ต้องถ่ายรูปหน้าจอเลขไมล์รถ + ระบุเหตุผล เพื่อส่งให้แอดมินตรวจสอบ
                </div>
              </div>

              <button
                onClick={() => setPhotos({...photos, mileageDash: !photos.mileageDash})}
                style={{
                  width:'100%', padding:'12px',
                  border: photos.mileageDash ? '2px solid var(--ok)' : '2px dashed var(--warn)',
                  borderRadius:8,
                  background: photos.mileageDash ? 'var(--ok-bg)' : 'var(--warn-bg)',
                  cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  color: photos.mileageDash ? 'var(--ok)' : '#7a5500',
                  fontSize:12.5, fontWeight:500, marginBottom:8
                }}>
                {photos.mileageDash
                  ? <>✓ ถ่ายรูปเลขไมล์หน้าปัดรถแล้ว — รอแอดมินตรวจสอบ</>
                  : <><span>{window.I.upload}</span> ถ่ายรูปหน้าจอเลขไมล์ของรถ <span className="req">*</span></>}
              </button>

              <textarea
                className="textarea"
                placeholder="ระบุเหตุผล เช่น เลขไมล์ปัจจุบันบนหน้าปัดสูงกว่าในระบบเนื่องจากผู้ใช้คนก่อนไม่ได้บันทึก ฯลฯ"
                value={mileageReason}
                onChange={(e) => setMileageReason(e.target.value)}
                style={{minHeight:60, fontSize:12.5}}
              />
              <div className="input-hint" style={{marginTop:6, color:'var(--text-3)'}}>
                การส่งคำขอแก้ไขเลขไมล์จะถูกส่งให้ผู้ดูแลระบบอนุมัติ เพื่อปรับปรุงข้อมูลในระบบให้ถูกต้อง
              </div>
            </div>
          )}

          <button
            onClick={() => setPhotos({...photos, before: !photos.before})}
            style={{width:'100%', padding:'14px', border: photos.before ? '2px solid var(--pea-purple)' : '2px dashed var(--danger)', borderRadius:9, background: photos.before ? 'var(--pea-purple-50)' : 'var(--danger-bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color: photos.before ? 'var(--text-2)' : 'var(--danger)', fontSize:13, fontWeight:500}}>
            {photos.before ? "✓ ถ่ายรูปสภาพรถก่อนใช้งานแล้ว (4 รูป)" : <><span>{window.I.upload}</span> ถ่ายรูปสภาพรถก่อนใช้งาน <span style={{color:'var(--danger)'}}>* (บังคับ ≥ 1 รูป)</span></>}
          </button>
        </div>

        <div style={{background:'var(--surface-2)', borderRadius:10, padding:'14px 16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <div style={{width:28, height:28, borderRadius:8, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center', fontWeight:700, fontSize:12}}>IN</div>
            <b>Check-in (หลังใช้งาน)</b>
          </div>
          <div className="field" style={{marginBottom:10}}>
            <label className="field-lbl">เลขไมล์หลังใช้งาน (กม.) <span className="req">*</span></label>
            <input className="input" type="number" value={mileageIn} onChange={(e) => setMileageIn(parseInt(e.target.value) || 0)} disabled={!isIn}/>
            {booking.mileageOut != null && distance > 0 && (
              <div className="input-hint" style={{color:'var(--pea-purple)', fontWeight:600}}>
                ระยะทางที่ใช้: <span style={{fontSize:16}}>{window.fmtNum(distance)}</span> กม.
              </div>
            )}
            {isIn && mileageIn <= booking.mileageOut && (
              <div className="input-err">เลขไมล์หลังใช้งานต้องมากกว่าก่อนใช้งาน</div>
            )}
          </div>
          <button
            onClick={() => setPhotos({...photos, after: !photos.after})}
            disabled={!isIn}
            style={{width:'100%', padding:'14px',
              border: !isIn ? '2px dashed var(--border-strong)' : photos.after ? '2px solid var(--pea-purple)' : '2px dashed var(--danger)',
              borderRadius:9,
              background: !isIn ? 'transparent' : photos.after ? 'var(--pea-purple-50)' : 'var(--danger-bg)',
              cursor: isIn ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              color: !isIn ? 'var(--text-3)' : photos.after ? 'var(--text-2)' : 'var(--danger)',
              fontSize:13, fontWeight:500, opacity: isIn ? 1 : 0.6}}>
            {photos.after ? "✓ ถ่ายรูปสภาพรถหลังใช้งานแล้ว (4 รูป)" : <><span>{window.I.upload}</span> ถ่ายรูปสภาพรถหลังใช้งาน {isIn && <span style={{color:'var(--danger)'}}>* (บังคับ ≥ 1 รูป)</span>}</>}
          </button>
        </div>
      </div>

      {isIn && (
        <div className="field" style={{marginBottom:14}}>
          <label className="field-lbl">รีวิวสภาพรถหลังใช้</label>
          <div style={{display:'flex', gap:4, marginBottom:8}}>
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setRating(n)} style={{background:'none', border:'none', cursor:'pointer', padding:2, color: n <= rating ? 'var(--pea-orange)' : 'var(--border-strong)'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            ))}
          </div>
          <textarea className="textarea" placeholder="บันทึกหมายเหตุการใช้งาน หากพบความผิดปกติของรถ" value={notes} onChange={(e) => setNotes(e.target.value)}/>
        </div>
      )}

      <div style={{display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center'}}>
        {needsCorrection && isOut && !canCheckout && (
          <div className="text-xs" style={{color:'var(--warn)', marginRight:'auto'}}>
            {window.I.warn} ต้องถ่ายรูปเลขไมล์ + ระบุเหตุผลก่อน Check-out
          </div>
        )}
        {isOut && (
          <button className="btn accent lg" disabled={!canCheckout}
            onClick={() => onCheckIn({
              mileageOut, checklist,
              photos: photos.before,
              mileageCorrection: needsCorrection ? {
                claimedMileage: mileageOut,
                systemMileage: vehicle.mileage,
                diff: mileageDiff,
                reason: mileageReason,
                dashPhoto: photos.mileageDash,
                status: "pending",
              } : null,
            })}>
            {window.I.check} ยืนยัน Check-out & รับรถ
            {needsCorrection && " (+ ส่งคำขอแก้ไขเลขไมล์)"}
          </button>
        )}
        {isIn && (
          <button className="btn primary lg" onClick={() => onCheckOut({ mileageIn, distance, rating, notes, photos: photos.after })}>
            {window.I.check} ยืนยัน Check-in & คืนรถ
          </button>
        )}
      </div>

      {!allChecked && isOut && (
        <div className="text-xs muted" style={{textAlign:'right', marginTop:6}}>
          ต้องตรวจสอบความพร้อมครบทั้ง 10 รายการก่อนรับรถ
        </div>
      )}
    </div>
  );
}

window.CheckinScreen = CheckinScreen;
