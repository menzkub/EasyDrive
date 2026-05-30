// Check-in / Check-out History — full log of all completed trips
import React from 'react'
import { I, VehicleIcon, fmtDate, fmtDateTime, fmtNum, SearchInput, Select } from '../components'
import { VEHICLE_TYPES, CHECKLIST } from '../data'

const CHECKLIST_MAP = Object.fromEntries(CHECKLIST.map((c) => [c.id, c.label]));

const STATUS_ICON = { pass: '✅', fail: '❌', skip: '➖' };
const STATUS_COLOR = { pass: 'var(--ok)', fail: 'var(--danger)', skip: 'var(--text-3)' };

function CheckinHistoryScreen({ bookings, vehicles, users, currentUser }) {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const completed = bookings.filter((b) => {
    if (b.status !== 'completed') return false;
    if (!isAdmin && b.userId !== currentUser?.id) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [search, setSearch] = React.useState('');
  const [filterVehicle, setFilterVehicle] = React.useState('all');
  const [filterDept, setFilterDept] = React.useState('all');
  const [filterRange, setFilterRange] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState(null);

  // Derived filter options
  const depts = [...new Set(
    completed.map((b) => users.find((u) => u.id === b.userId)?.dept).filter(Boolean)
  )].sort();

  const now = new Date();
  function inRange(b) {
    if (filterRange === 'all') return true;
    const d = new Date(b.from);
    if (filterRange === 'week') return (now - d) <= 7 * 86400000;
    if (filterRange === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filterRange === 'quarter') return (now - d) <= 90 * 86400000;
    return true;
  }

  const filtered = completed.filter((b) => {
    const v = vehicles.find((x) => x.id === b.vehicleId);
    const u = users.find((x) => x.id === b.userId);
    if (filterVehicle !== 'all' && b.vehicleId !== filterVehicle) return false;
    if (filterDept !== 'all' && u?.dept !== filterDept) return false;
    if (!inRange(b)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!( (v?.plate || '').toLowerCase().includes(q) ||
             (v?.brand || '').toLowerCase().includes(q) ||
             (u?.name || '').toLowerCase().includes(q) ||
             (b.destination || '').toLowerCase().includes(q) ||
             (b.id || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Summary stats
  const totalDist = filtered.reduce((s, b) => s + (b.mileageIn != null && b.mileageOut != null ? b.mileageIn - b.mileageOut : 0), 0);
  const rated = filtered.filter((b) => b.rating);
  const avgRating = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : null;

  function exportCSV() {
    const rows = [
      ['เลขที่จอง','รถยนต์','ทะเบียน','ผู้ขับ','แผนก','วันที่เดินทาง','ปลายทาง','ไมล์ก่อนใช้','ไมล์หลังใช้','ระยะทาง(กม.)','คะแนน','Checklist'],
      ...filtered.map((b) => {
        const v = vehicles.find((x) => x.id === b.vehicleId);
        const u = users.find((x) => x.id === b.userId);
        const dist = b.mileageIn != null && b.mileageOut != null ? b.mileageIn - b.mileageOut : '';
        const cl = b.checklist_data ? Object.entries(b.checklist_data).map(([k,v]) => `${CHECKLIST_MAP[k]||k}:${v}`).join(' | ') : '';
        return [b.id, v?.brand||'', v?.plate||'', u?.name||'', u?.dept||'', fmtDateTime(b.from), b.destination||'', b.mileageOut??'', b.mileageIn??'', dist, b.rating||'', cl];
      })
    ];
    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `checkin-history-${new Date().toLocaleDateString('th-TH')}.csv`;
    a.click();
  }

  return (
    <div>
      {/* Header */}
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
          <div>
            <h2 className="mt-0" style={{margin:0, display:'flex', alignItems:'center', gap:8}}>
              ประวัติ Check-in / Check-out
            </h2>
            <p className="sub" style={{margin:'2px 0 0'}}>
              {isAdmin ? 'บันทึกการรับ-ส่งรถทั้งหน่วยงาน' : 'บันทึกการรับ-ส่งรถของฉัน'}
            </p>
          </div>
          <button className="btn ghost" onClick={exportCSV}>{I.export} Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{marginBottom:14}}>
        <StatTile lbl="การเดินทางทั้งหมด" val={filtered.length} unit="ครั้ง" color="var(--pea-purple)"/>
        <StatTile lbl="ระยะทางรวม" val={fmtNum(totalDist)} unit="กม." color="var(--info)"/>
        <StatTile lbl="ระยะทางเฉลี่ย" val={filtered.length ? fmtNum(Math.round(totalDist / filtered.length)) : '—'} unit="กม./เที่ยว" color="var(--ok)"/>
        <StatTile lbl="คะแนนเฉลี่ย" val={avgRating ?? '—'} unit={avgRating ? '/ 5 ⭐' : ''} color="var(--pea-orange)"/>
      </div>

      {/* Filters */}
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
          <SearchInput value={search} onChange={setSearch} placeholder="ค้นหา ทะเบียน / ผู้ขับ / ปลายทาง..." style={{flex:'1 1 200px', minWidth:0}}/>
          <Select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} style={{width:180}}>
            <option value="all">รถยนต์ทั้งหมด</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.id} · {(v.plate||'').split(' ').slice(0,2).join(' ')}</option>)}
          </Select>
          {isAdmin && (
            <Select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{width:200}}>
              <option value="all">ทุกแผนก</option>
              {depts.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          )}
          <Select value={filterRange} onChange={(e) => setFilterRange(e.target.value)} style={{width:140}}>
            <option value="all">ทุกช่วงเวลา</option>
            <option value="week">7 วันล่าสุด</option>
            <option value="month">เดือนนี้</option>
            <option value="quarter">3 เดือนล่าสุด</option>
          </Select>
        </div>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="card card-pad" style={{textAlign:'center', padding:'60px 20px'}}>
          <div style={{fontSize:40, marginBottom:12}}>🗂️</div>
          <div style={{fontWeight:600, color:'var(--text-2)'}}>ไม่พบข้อมูล</div>
          <div className="text-xs muted" style={{marginTop:6}}>ลองปรับเงื่อนไขการกรองใหม่</div>
        </div>
      ) : (
        <div className="col gap-2">
          {filtered.map((b) => (
            <TripCard
              key={b.id}
              booking={b}
              vehicle={vehicles.find((v) => v.id === b.vehicleId)}
              user={users.find((u) => u.id === b.userId)}
              expanded={expandedId === b.id}
              onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual Trip Card ─────────────────────────────────────────
function TripCard({ booking: b, vehicle: v, user: u, expanded, onToggle, isAdmin }) {
  const dist = b.mileageIn != null && b.mileageOut != null ? b.mileageIn - b.mileageOut : null;
  const checklist = b.checklist_data || null;
  const photosBefore = b.photos_before || [];
  const photosAfter = b.photos_after || [];
  const photosMileage = b.photos_mileage || [];
  const hasChecklist = checklist && Object.keys(checklist).length > 0;
  const hasPhotos = photosBefore.length + photosAfter.length + photosMileage.length > 0;

  const clPass = checklist ? Object.values(checklist).filter(v => v === 'pass').length : 0;
  const clFail = checklist ? Object.values(checklist).filter(v => v === 'fail').length : 0;
  const clTotal = CHECKLIST.length;

  return (
    <div className="card" style={{overflow:'hidden', border: clFail > 0 ? '1px solid var(--warn)' : '1px solid var(--border)'}}>
      {/* Summary row */}
      <div
        style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer'}}
        onClick={onToggle}
      >
        {/* Vehicle icon */}
        <div className="veh-ico" style={{width:44, height:44, flexShrink:0}}>
          <VehicleIcon type={v?.type} size={26}/>
        </div>

        {/* Vehicle + user */}
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <span style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, color:'var(--pea-purple)'}}>
              {(v?.plate || '').split(' ').slice(0,2).join(' ')}
            </span>
            <span className="text-xs muted">{v?.brand}</span>
            {clFail > 0 && <span style={{fontSize:10, padding:'2px 7px', background:'var(--warn-bg)', color:'var(--warn)', borderRadius:99, fontWeight:600}}>⚠️ ตรวจไม่ผ่าน {clFail} รายการ</span>}
          </div>
          <div style={{fontSize:12, color:'var(--text-2)', marginTop:2}}>
            {u?.name} {isAdmin && u?.dept && <span className="text-xs muted">· {u.dept}</span>}
          </div>
        </div>

        {/* Date */}
        <div style={{textAlign:'center', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={{fontSize:12, color:'var(--text-3)'}}>วันที่</div>
          <div style={{fontSize:12.5, fontWeight:600}}>{fmtDate(b.from)}</div>
        </div>

        {/* Distance */}
        <div style={{textAlign:'center', flexShrink:0, minWidth:80}}>
          <div style={{fontSize:11, color:'var(--text-3)'}}>ระยะทาง</div>
          <div style={{fontSize:18, fontWeight:700, color:'var(--pea-purple)', fontFamily:'var(--font-mono)'}}>
            {dist != null ? fmtNum(dist) : '—'}
          </div>
          <div style={{fontSize:10, color:'var(--text-3)'}}>กม.</div>
        </div>

        {/* Rating */}
        <div style={{textAlign:'center', flexShrink:0, minWidth:60}}>
          <div style={{fontSize:11, color:'var(--text-3)'}}>คะแนน</div>
          <div style={{fontSize:16, color:'var(--pea-orange)', letterSpacing:-2}}>
            {b.rating ? '⭐'.repeat(b.rating) : <span className="text-xs muted">—</span>}
          </div>
        </div>

        {/* Indicators */}
        <div style={{display:'flex', gap:6, alignItems:'center', flexShrink:0}}>
          {hasChecklist && (
            <div style={{fontSize:10, padding:'3px 8px', borderRadius:99,
              background: clFail > 0 ? 'var(--warn-bg)' : 'var(--ok-bg)',
              color: clFail > 0 ? 'var(--warn)' : 'var(--ok)', fontWeight:600}}>
              ✓ {clPass}/{clTotal}
            </div>
          )}
          {hasPhotos && (
            <div style={{fontSize:10, padding:'3px 8px', borderRadius:99, background:'var(--info-bg)', color:'var(--info)', fontWeight:600}}>
              📷 {photosBefore.length + photosAfter.length + photosMileage.length}
            </div>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--text-3)', transition:'transform 0.15s', transform: expanded ? 'rotate(180deg)' : undefined}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{borderTop:'1px solid var(--border)', background:'var(--surface-2)'}}>
          <div style={{padding:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>

            {/* Left: mileage + trip info */}
            <div>
              <SectionLabel>ข้อมูลการเดินทาง</SectionLabel>
              <InfoRow k="เลขที่จอง" v={b.id}/>
              <InfoRow k="วันเวลาออกเดินทาง" v={fmtDateTime(b.from)}/>
              <InfoRow k="วันเวลากลับ" v={fmtDateTime(b.to)}/>
              <InfoRow k="ปลายทาง" v={b.destination}/>
              <InfoRow k="วัตถุประสงค์" v={b.purpose}/>
              <InfoRow k="ผู้โดยสาร" v={`${b.passengers || 1} คน`}/>
              <div style={{marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
                <MileBox lbl="ไมล์ก่อนใช้" val={b.mileageOut} color="var(--info)"/>
                <MileBox lbl="ไมล์หลังใช้" val={b.mileageIn} color="var(--ok)"/>
                <MileBox lbl="ระยะทาง" val={dist} unit="กม." color="var(--pea-purple)"/>
              </div>
            </div>

            {/* Right: checklist */}
            <div>
              <SectionLabel>ผลตรวจสภาพรถ (Checklist)</SectionLabel>
              {hasChecklist ? (
                <div className="col gap-1" style={{marginTop:6}}>
                  {CHECKLIST.map((item) => {
                    const result = checklist[item.id];
                    return (
                      <div key={item.id} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:6, background:'var(--surface)', fontSize:12.5}}>
                        <span style={{width:18, textAlign:'center'}}>{STATUS_ICON[result] || '➖'}</span>
                        <span style={{flex:1, color: result ? STATUS_COLOR[result] : 'var(--text-3)'}}>{item.label}</span>
                        <span style={{fontSize:10, color:'var(--text-3)'}}>{result === 'pass' ? 'ผ่าน' : result === 'fail' ? 'ไม่ผ่าน' : 'ข้าม'}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs muted" style={{marginTop:10}}>ไม่มีข้อมูล Checklist (บันทึกก่อนระบบ v2)</div>
              )}
            </div>
          </div>

          {/* Photos */}
          {hasPhotos && (
            <div style={{borderTop:'1px solid var(--border)', padding:'14px 16px'}}>
              <SectionLabel>รูปถ่าย</SectionLabel>
              <div style={{display:'flex', gap:16, marginTop:10, flexWrap:'wrap'}}>
                {photosBefore.length > 0 && (
                  <PhotoGroup label="สภาพรถก่อนใช้งาน" photos={photosBefore} color="var(--info)"/>
                )}
                {photosMileage.length > 0 && (
                  <PhotoGroup label="หน้าปัดเลขไมล์" photos={photosMileage} color="var(--warn)"/>
                )}
                {photosAfter.length > 0 && (
                  <PhotoGroup label="สภาพรถหลังใช้งาน" photos={photosAfter} color="var(--ok)"/>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {b.notes && (
            <div style={{borderTop:'1px solid var(--border)', padding:'12px 16px'}}>
              <SectionLabel>หมายเหตุจากผู้ขับ</SectionLabel>
              <div style={{marginTop:6, fontSize:13, color:'var(--text-2)', fontStyle:'italic'}}>"{b.notes}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────
function StatTile({ lbl, val, unit, color }) {
  return (
    <div className="card card-pad" style={{textAlign:'center'}}>
      <div style={{fontSize:11, color:'var(--text-3)', marginBottom:4}}>{lbl}</div>
      <div style={{fontSize:26, fontWeight:700, color, fontFamily:'var(--font-mono)', lineHeight:1}}>{val}</div>
      {unit && <div style={{fontSize:11, color:'var(--text-3)', marginTop:4}}>{unit}</div>}
    </div>
  );
}
function SectionLabel({ children }) {
  return <div style={{fontSize:11, fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6}}>{children}</div>;
}
function InfoRow({ k, v }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:6, padding:'3px 0', fontSize:12.5, borderBottom:'1px dotted var(--border)'}}>
      <span style={{color:'var(--text-3)'}}>{k}</span>
      <span style={{fontWeight:500, color:'var(--text)'}}>{v || '—'}</span>
    </div>
  );
}
function MileBox({ lbl, val, unit = 'กม.', color }) {
  return (
    <div style={{textAlign:'center', padding:'8px 4px', background:'var(--surface)', borderRadius:8, border:`1px solid ${color}22`}}>
      <div style={{fontSize:10, color:'var(--text-3)'}}>{lbl}</div>
      <div style={{fontSize:16, fontWeight:700, color, fontFamily:'var(--font-mono)'}}>{val != null ? fmtNum(val) : '—'}</div>
      <div style={{fontSize:10, color:'var(--text-3)'}}>{unit}</div>
    </div>
  );
}
function PhotoGroup({ label, photos, color }) {
  const [fullImg, setFullImg] = React.useState(null);
  return (
    <div>
      <div style={{fontSize:11, fontWeight:600, color, marginBottom:6}}>{label} ({photos.length})</div>
      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {photos.map((src, i) => (
          <img key={i} src={src} alt="" width={80} height={80}
            style={{borderRadius:6, objectFit:'cover', border:`2px solid ${color}55`, cursor:'pointer'}}
            onClick={() => setFullImg(src)}
          />
        ))}
      </div>
      {fullImg && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'grid', placeItems:'center'}}
          onClick={() => setFullImg(null)}>
          <img src={fullImg} alt="" style={{maxWidth:'90vw', maxHeight:'90vh', borderRadius:10, boxShadow:'0 0 60px rgba(0,0,0,0.5)'}}/>
        </div>
      )}
    </div>
  );
}

export { CheckinHistoryScreen };
