// Check-in / Check-out + 10-point inspection checklist + mileage logging

import React from 'react'
import { I, StatusPill, VehicleIcon, fmtDateTime, fmtTime, fmtNum } from '../components'
import { VEHICLE_TYPES as VT_DEFAULT, FUEL_TYPES as FT_DEFAULT, CHECKLIST as CL_DEFAULT } from '../data'

function CheckinScreen({ bookings, vehicles, users, currentUser, onCheckIn, onCheckOut, onPrintChecklist, checklist: checklistProp, vehicleTypes: vtProp, fuelTypes: ftProp }) {
  const CHECKLIST = checklistProp || CL_DEFAULT;
  const VEHICLE_TYPES = vtProp || VT_DEFAULT;
  const FUEL_TYPES = ftProp || FT_DEFAULT;
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
                      <span className="plate" style={{fontSize:11, padding:'1px 6px'}}>{(v?.plate || '').split(' ').slice(0,2).join(' ')}</span>
                      <span className="text-xs muted">{b.id}</span>
                    </div>
                    <div style={{fontSize:13, fontWeight:600}}>{v?.brand}</div>
                    <div className="text-xs muted">{u?.name} · {fmtDateTime(b.from)}</div>
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
              checklistItems={CHECKLIST}
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

// ─── Photo Capture Component ─────────────────────────────────────
function PhotoCapture({ photos, onAdd, onRemove, label, required, disabled, maxCount = 4 }) {
  const inputRef = React.useRef();

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    const remaining = maxCount - photos.length;
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 900;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          onAdd(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  const hasPhotos = photos.length > 0;

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment"
        style={{display:'none'}} onChange={handleFiles}/>

      {hasPhotos && (
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
          {photos.map((src, i) => (
            <div key={i} style={{position:'relative', width:72, height:72, flexShrink:0}}>
              <img src={src} alt={`รูป ${i+1}`}
                style={{width:72, height:72, objectFit:'cover', borderRadius:8, border:'1.5px solid var(--border)', display:'block'}}/>
              {!disabled && (
                <button onClick={() => onRemove(i)} style={{
                  position:'absolute', top:-5, right:-5, width:20, height:20,
                  borderRadius:'50%', background:'var(--danger)', color:'white',
                  border:'2px solid white', cursor:'pointer', display:'grid',
                  placeItems:'center', fontSize:11, lineHeight:1, padding:0
                }}>×</button>
              )}
            </div>
          ))}
          {photos.length < maxCount && !disabled && (
            <button onClick={() => inputRef.current.click()} style={{
              width:72, height:72, border:'2px dashed var(--border-strong)',
              borderRadius:8, background:'var(--surface-2)', cursor:'pointer',
              display:'grid', placeItems:'center', color:'var(--text-3)', fontSize:22
            }}>+</button>
          )}
        </div>
      )}

      {!hasPhotos && !disabled && (
        <button onClick={() => inputRef.current.click()} style={{
          width:'100%', padding:'14px',
          border: required ? '2px dashed var(--danger)' : '2px dashed var(--border)',
          borderRadius:9,
          background: required ? 'var(--danger-bg)' : 'var(--surface-2)',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          color: required ? 'var(--danger)' : 'var(--text-2)', fontSize:13, fontWeight:500
        }}>
          📷 {label} {required && <span style={{color:'var(--danger)', fontSize:12}}>* บังคับ ≥ 1 รูป</span>}
        </button>
      )}

      {hasPhotos && (
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:4}}>
          <span style={{fontSize:12, color:'var(--ok)', fontWeight:600}}>✓ {photos.length} รูป · {label}</span>
          {photos.length < maxCount && !disabled && (
            <button onClick={() => inputRef.current.click()} style={{
              marginLeft:'auto', fontSize:11.5, padding:'3px 10px', borderRadius:99,
              border:'1px solid var(--border)', background:'white', cursor:'pointer', color:'var(--text-2)'
            }}>+ เพิ่มรูป ({photos.length}/{maxCount})</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Alert/Notification component ────────────────────────────────
function InlineAlert({ kind = 'warn', children }) {
  const styles = {
    warn: { bg: 'var(--warn-bg)', fg: 'var(--warn)', icon: '⚠️' },
    danger: { bg: 'var(--danger-bg)', fg: 'var(--danger)', icon: '🚫' },
    ok: { bg: 'var(--ok-bg)', fg: 'var(--ok)', icon: '✅' },
  };
  const s = styles[kind] || styles.warn;
  return (
    <div style={{display:'flex', gap:8, padding:'10px 12px', background:s.bg, borderRadius:9, fontSize:12.5, color:s.fg, alignItems:'flex-start', marginTop:8}}>
      <span style={{flexShrink:0}}>{s.icon}</span>
      <div>{children}</div>
    </div>
  );
}

function CheckinDetail({ booking, vehicle, user, isOut, isIn, onCheckIn, onCheckOut, onPrintChecklist, checklistItems: CHECKLIST }) {
  const [mileageOut, setMileageOut] = React.useState(booking.mileageOut || vehicle.mileage);
  const [mileageIn, setMileageIn] = React.useState(booking.mileageIn || vehicle.mileage);
  const [checklist, setChecklist] = React.useState({});
  const [notes, setNotes] = React.useState("");
  const [photosBefore, setPhotosBefore] = React.useState([]);
  const [photosAfter, setPhotosAfter] = React.useState([]);
  const [photosMileage, setPhotosMileage] = React.useState([]);
  const [rating, setRating] = React.useState(5);
  const [mileageReason, setMileageReason] = React.useState("");
  const [validationMsg, setValidationMsg] = React.useState(null);

  const mileageDiff = mileageOut - vehicle.mileage;
  const mileageMismatch = isOut && mileageDiff !== 0;
  const needsCorrection = mileageMismatch && (mileageDiff > 5 || mileageDiff < -5);

  const distance = mileageIn - (booking.mileageOut || mileageOut);
  const passed = Object.keys(checklist).filter((k) => checklist[k] === "pass").length;
  const failed = Object.keys(checklist).filter((k) => checklist[k] === "fail").length;
  const allChecked = passed + failed === CHECKLIST.length;

  function handleCheckoutClick() {
    const issues = [];
    if (!allChecked) issues.push(`ตรวจสอบรายการยังไม่ครบ (ตรวจแล้ว ${passed + failed}/${CHECKLIST.length} รายการ)`);
    if (photosBefore.length === 0) issues.push('ต้องถ่ายรูปสภาพรถก่อนใช้งานอย่างน้อย 1 รูป');
    if (needsCorrection && photosMileage.length === 0) issues.push('ต้องถ่ายรูปหน้าปัดเลขไมล์');
    if (needsCorrection && mileageReason.trim().length <= 3) issues.push('ต้องระบุเหตุผลความไม่ตรงของเลขไมล์');

    if (issues.length > 0) {
      setValidationMsg(issues);
      return;
    }
    setValidationMsg(null);
    onCheckIn({
      mileageOut, checklist,
      photos: photosBefore,
      mileageCorrection: needsCorrection ? {
        claimedMileage: mileageOut,
        systemMileage: vehicle.mileage,
        diff: mileageDiff,
        reason: mileageReason,
        dashPhoto: photosMileage[0] || null,
        status: "pending",
      } : null,
    });
  }

  function handleCheckinClick() {
    const issues = [];
    if (photosAfter.length === 0) issues.push('ต้องถ่ายรูปสภาพรถหลังใช้งานอย่างน้อย 1 รูป');
    if (mileageIn <= (booking.mileageOut || 0)) issues.push('เลขไมล์หลังใช้งานต้องมากกว่าก่อนใช้งาน');

    if (issues.length > 0) {
      setValidationMsg(issues);
      return;
    }
    setValidationMsg(null);
    onCheckOut({ mileageIn, distance, rating, notes, photos: photosAfter });
  }

  return (
    <div className="card card-pad">
      <div style={{display:'flex', gap:14, paddingBottom:14, borderBottom:'1px solid var(--border)', marginBottom:14}}>
        <div className="veh-ico lg" style={{width:64, height:64}}>
          <VehicleIcon type={vehicle.type} size={42}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span className="plate">{(vehicle.plate || '').split(' ').slice(0,2).join(' ')}</span>
            <StatusPill status={booking.status}/>
          </div>
          <div style={{fontSize:16, fontWeight:600, marginTop:4}}>{vehicle.brand}</div>
          <div className="text-xs muted">{booking.id} · {user?.name} · {fmtDateTime(booking.from)} – {fmtTime(booking.to)}</div>
          <div className="text-xs muted" style={{marginTop:2}}>📍 {booking.destination}</div>
        </div>
        <div style={{display:'flex', gap:6, alignItems:'flex-start'}}>
          <button className="btn sm ghost" onClick={onPrintChecklist}>{I.print} พิมพ์</button>
        </div>
      </div>

      {/* 10-point checklist */}
      <div style={{marginBottom:18}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10}}>
          <h3 style={{margin:0, fontSize:15, fontWeight:600}}>ตรวจสอบความพร้อมก่อนใช้งาน (10 รายการ)</h3>
          <div className="text-xs" style={{color: failed ? 'var(--danger)' : allChecked ? 'var(--ok)' : 'var(--text-3)'}}>
            ผ่าน {passed} / ไม่ผ่าน {failed} / ทั้งหมด {CHECKLIST.length}
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {CHECKLIST.map((item, i) => {
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
                  <button onClick={() => setChecklist({...checklist, [item.id]:"pass"})}
                    style={{width:28, height:28, borderRadius:6, border:'none', cursor:'pointer',
                      background: v === "pass" ? 'var(--ok)' : 'var(--surface-2)',
                      color: v === "pass" ? 'white' : 'var(--ok)'
                    }} title="ผ่าน">{I.check}</button>
                  <button onClick={() => setChecklist({...checklist, [item.id]:"fail"})}
                    style={{width:28, height:28, borderRadius:6, border:'none', cursor:'pointer',
                      background: v === "fail" ? 'var(--danger)' : 'var(--surface-2)',
                      color: v === "fail" ? 'white' : 'var(--danger)'
                    }} title="ไม่ผ่าน">{I.x}</button>
                </div>
              </div>
            );
          })}
        </div>
        {failed > 0 && (
          <InlineAlert kind="danger">
            พบรายการไม่ผ่านการตรวจ <b>{failed} รายการ</b> — กรุณาแจ้งผู้รับผิดชอบประจำรถก่อนใช้งาน
          </InlineAlert>
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
            <input className="input" type="number"
              value={booking.mileageOut || mileageOut}
              onChange={(e) => setMileageOut(parseInt(e.target.value) || 0)}
              disabled={booking.mileageOut != null}
              style={needsCorrection ? {borderColor:'var(--warn)', background:'var(--warn-bg)'} : null}/>
            <div className="input-hint">
              เลขไมล์ในระบบ: <b>{fmtNum(vehicle.mileage)}</b> กม.
              {mileageMismatch && (
                <span style={{marginLeft:8, color: needsCorrection ? 'var(--danger)' : 'var(--warn)', fontWeight:600}}>
                  · ต่าง {mileageDiff > 0 ? '+' : ''}{fmtNum(mileageDiff)} กม.
                </span>
              )}
            </div>
          </div>

          {needsCorrection && isOut && (
            <div style={{background:'white', border:'1.5px solid var(--warn)', borderRadius:9, padding:'12px 14px', marginBottom:10}}>
              <InlineAlert kind="warn">
                <b>เลขไมล์ไม่ตรงกับในระบบ</b> ระบบบันทึก <b>{fmtNum(vehicle.mileage)}</b> กม. แต่ท่านระบุ <b>{fmtNum(mileageOut)}</b> กม.
                ต้องถ่ายรูปหน้าปัดเลขไมล์ + ระบุเหตุผล
              </InlineAlert>
              <div style={{marginTop:10}}>
                <PhotoCapture
                  photos={photosMileage}
                  onAdd={(src) => setPhotosMileage(p => [...p, src])}
                  onRemove={(i) => setPhotosMileage(p => p.filter((_, idx) => idx !== i))}
                  label="ถ่ายรูปหน้าปัดเลขไมล์"
                  required={true}
                  maxCount={2}
                />
              </div>
              <textarea className="textarea" style={{marginTop:8, minHeight:60, fontSize:12.5}}
                placeholder="ระบุเหตุผล เช่น เลขไมล์ปัจจุบันสูงกว่าในระบบเนื่องจากผู้ใช้คนก่อนไม่ได้บันทึก ฯลฯ"
                value={mileageReason} onChange={(e) => setMileageReason(e.target.value)}/>
            </div>
          )}

          <div style={{marginTop:8}}>
            <PhotoCapture
              photos={photosBefore}
              onAdd={(src) => setPhotosBefore(p => [...p, src])}
              onRemove={(i) => setPhotosBefore(p => p.filter((_, idx) => idx !== i))}
              label="ถ่ายรูปสภาพรถก่อนใช้งาน"
              required={true}
              disabled={booking.mileageOut != null}
              maxCount={4}
            />
          </div>
        </div>

        <div style={{background:'var(--surface-2)', borderRadius:10, padding:'14px 16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <div style={{width:28, height:28, borderRadius:8, background:'var(--pea-purple)', color:'white', display:'grid', placeItems:'center', fontWeight:700, fontSize:12}}>IN</div>
            <b>Check-in (หลังใช้งาน)</b>
          </div>
          <div className="field" style={{marginBottom:10}}>
            <label className="field-lbl">เลขไมล์หลังใช้งาน (กม.) <span className="req">*</span></label>
            <input className="input" type="number" value={mileageIn}
              onChange={(e) => setMileageIn(parseInt(e.target.value) || 0)} disabled={!isIn}/>
            {booking.mileageOut != null && distance > 0 && (
              <div className="input-hint" style={{color:'var(--pea-purple)', fontWeight:600}}>
                ระยะทางที่ใช้: <span style={{fontSize:16}}>{fmtNum(distance)}</span> กม.
              </div>
            )}
          </div>
          <PhotoCapture
            photos={photosAfter}
            onAdd={(src) => setPhotosAfter(p => [...p, src])}
            onRemove={(i) => setPhotosAfter(p => p.filter((_, idx) => idx !== i))}
            label="ถ่ายรูปสภาพรถหลังใช้งาน"
            required={isIn}
            disabled={!isIn}
            maxCount={4}
          />
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

      {/* Validation errors */}
      {validationMsg && (
        <div style={{marginBottom:14, padding:'12px 14px', background:'var(--danger-bg)', border:'1.5px solid var(--danger)', borderRadius:10}}>
          <div style={{fontSize:13, fontWeight:700, color:'var(--danger)', marginBottom:6}}>🚫 ไม่สามารถดำเนินการได้ — กรุณาตรวจสอบ:</div>
          <ul style={{margin:0, paddingLeft:18}}>
            {validationMsg.map((msg, i) => (
              <li key={i} style={{fontSize:12.5, color:'var(--danger)', marginBottom:2}}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center'}}>
        {isOut && (
          <button className="btn accent lg" onClick={handleCheckoutClick}>
            {I.check} ยืนยัน Check-out & รับรถ
            {needsCorrection && " (+ ส่งคำขอแก้ไขเลขไมล์)"}
          </button>
        )}
        {isIn && (
          <button className="btn primary lg" onClick={handleCheckinClick}>
            {I.check} ยืนยัน Check-in & คืนรถ
          </button>
        )}
      </div>
    </div>
  );
}

export { CheckinScreen }
