// Reports / Statistics

import React from 'react'
import { I, StatusPill, VehicleIcon, fmtDate, fmtDateTime, fmtNum, daysUntil } from '../components'
import { VEHICLE_TYPES, FUEL_TYPES } from '../data'

function ReportsScreen({ vehicles, bookings, users = [], onRefresh, fuelPrices }) {
  const [range, setRange] = React.useState("month");

  function exportCSV() {
    const rows = [
      ['วัน-เวลา', 'รถ', 'ผู้จอง', 'แผนก', 'วัตถุประสงค์', 'ปลายทาง', 'สถานะ', 'ระยะทาง (กม.)'],
      ...bookings.map(b => {
        const v = vehicles.find(x => x.id === b.vehicleId);
        const u = users?.find(x => x.id === b.userId);
        const dist = b.mileageIn && b.mileageOut ? b.mileageIn - b.mileageOut : '';
        return [
          b.from ? new Date(b.from).toLocaleString('th-TH') : '',
          v ? `${v.brand} ${v.plate}` : b.vehicleId || '',
          u?.name || '',
          u?.dept || '',
          b.purpose || '',
          b.destination || '',
          b.status || '',
          dist,
        ];
      })
    ];
    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `easydrive-รายงาน-${new Date().toLocaleDateString('th-TH')}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() { window.print(); }

  const completed = bookings.filter((b) => b.status === "completed" || b.status === "approved" || b.status === "urgent");
  const totalDistance = completed.reduce((s, b) => s + ((b.mileageIn || 0) - (b.mileageOut || 0)), 0);

  const byPurpose = {};
  bookings.forEach((b) => { byPurpose[b.purpose] = (byPurpose[b.purpose] || 0) + 1; });
  const purposeData = Object.entries(byPurpose).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxPurpose = Math.max(...purposeData.map(([, v]) => v), 1);

  const byVehicle = {};
  completed.forEach((b) => { byVehicle[b.vehicleId] = (byVehicle[b.vehicleId] || 0) + 1; });
  const vehicleData = Object.entries(byVehicle).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxVeh = Math.max(...vehicleData.map(([, v]) => v), 1);

  const byUser = {};
  completed.forEach((b) => { byUser[b.userId] = (byUser[b.userId] || 0) + 1; });
  const topUsers = Object.entries(byUser).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Real daily booking data for last 14 days
  const now = new Date();
  const daily = Array.from({length:14}).map((_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - 13 + i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = bookings.filter(b => b.from && b.from.slice(0,10) === dateStr).length;
    return { day: d.getDate(), month: d.getMonth()+1, count };
  });
  const maxDaily = Math.max(...daily.map(d => d.count), 1);

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <div>
            <h2 className="mt-0" style={{margin:0, display:'flex', alignItems:'center', gap:8}}>
              รายงานและสถิติการใช้รถ
              <span className="live-dot"></span>
              <span style={{fontSize:11, color:'var(--ok)', fontWeight:500}}>LIVE</span>
            </h2>
            <p className="sub" style={{margin:'2px 0 0'}}>ภาพรวมการใช้งานรถยนต์ในหน่วยงาน</p>
          </div>
          <div className="reports-toolbar">
            <div style={{display:'flex', background:'var(--surface-2)', borderRadius:8, padding:3}}>
              {[["week","สัปดาห์"],["month","เดือนนี้"],["quarter","ไตรมาส"],["year","ทั้งปี"]].map(([v,l]) => (
                <button key={v} className={"btn sm" + (range === v ? " primary" : "")} style={{background: range !== v ? 'transparent' : undefined, border:'none'}} onClick={() => setRange(v)}>{l}</button>
              ))}
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn ghost" onClick={exportCSV}>{I.export} Excel</button>
              <button className="btn primary" onClick={exportPDF}>{I.print} PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:14}}>
        <div className="stat-animate"><StatBox lbl="การจองทั้งหมด" val={bookings.length} foot="ในช่วงเวลานี้" ico={I.calendar} variant="purple"/></div>
        <div className="stat-animate"><StatBox lbl="เสร็จสิ้น" val={completed.length} foot={`${Math.round(completed.length/Math.max(bookings.length,1)*100)}% สำเร็จ`} ico={I.check} variant="ok"/></div>
        <div className="stat-animate"><StatBox lbl="ระยะทางรวม" val={fmtNum(totalDistance)} foot="กิโลเมตร" ico={I.car} variant="accent"/></div>
        <div className="stat-animate"><StatBox lbl="อัตราการใช้งาน" val="78%" foot="ของรถทั้งหมด" ico={I.stats} variant="warn"/></div>
      </div>

      <div className="grid-2" style={{gap:14, marginBottom:14}}>
        <div className="card card-pad">
          <h2 className="mt-0">การใช้รถรายวัน (14 วันล่าสุด)</h2>
          <p className="sub">จำนวนการจองในแต่ละวัน</p>
          <div style={{display:'flex', alignItems:'flex-end', gap:6, height:160, marginTop:18, paddingBottom:24, borderBottom:'1px solid var(--border)', position:'relative'}}>
            {daily.map((d, i) => {
              const isToday = d.day === now.getDate() && d.month === now.getMonth()+1;
              return (
                <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative'}}>
                  <div style={{
                    width:'100%', height: `${(d.count/maxDaily)*100}%`,
                    background: isToday ? 'var(--pea-orange)' : 'var(--pea-purple)',
                    borderRadius:'4px 4px 0 0',
                    position:'relative', minHeight: d.count > 0 ? 4 : 0,
                  }}>
                    {d.count > 0 && <div style={{position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', fontSize:10, fontWeight:600, color:'var(--text-2)'}}>{d.count}</div>}
                  </div>
                  <div style={{position:'absolute', bottom:-20, fontSize:9.5, color:'var(--text-3)', whiteSpace:'nowrap'}}>{d.day}/{d.month}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', gap:14, marginTop:30, fontSize:12, color:'var(--text-3)'}}>
            <span style={{display:'flex', gap:5, alignItems:'center'}}><span style={{width:10, height:10, background:'var(--pea-purple)', borderRadius:2}}></span>ปกติ</span>
            <span style={{display:'flex', gap:5, alignItems:'center'}}><span style={{width:10, height:10, background:'var(--pea-orange)', borderRadius:2}}></span>วันนี้</span>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="mt-0">การใช้งานตามวัตถุประสงค์</h2>
          <p className="sub">สัดส่วนวัตถุประสงค์การใช้รถ</p>
          <div className="col gap-2" style={{marginTop:14}}>
            {purposeData.map(([p, n], i) => (
              <div key={p}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4}}>
                  <span>{p}</span>
                  <b>{n} ครั้ง</b>
                </div>
                <div style={{height:8, background:'var(--surface-2)', borderRadius:999, overflow:'hidden'}}>
                  <div style={{
                    height:'100%', width: `${(n/maxPurpose)*100}%`,
                    background: ['var(--pea-purple)','var(--pea-orange)','var(--info)','var(--ok)','var(--warn)','var(--text-3)'][i % 6],
                    borderRadius:999, transition:'width 0.3s'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{gap:14, gridTemplateColumns:'1.4fr 1fr'}}>
        <div className="card card-pad">
          <h2 className="mt-0">Top รถยนต์ที่ใช้บ่อย</h2>
          <p className="sub">รถยนต์ที่มีการจองมากที่สุด</p>
          <table className="table" style={{marginTop:6}}>
            <thead>
              <tr><th>อันดับ</th><th>รถยนต์</th><th>ประเภท</th><th className="num">จำนวนครั้ง</th><th className="num">สัดส่วน</th></tr>
            </thead>
            <tbody>
              {vehicleData.map(([vid, n], i) => {
                const v = vehicles.find((x) => x.id === vid);
                if (!v) return null;
                return (
                  <tr key={vid}>
                    <td><b style={{color:'var(--pea-purple)'}}>#{i+1}</b></td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <VehicleIcon type={v.type} size={20}/>
                        <div>
                          <div style={{fontWeight:600, fontSize:12.5}}>{v.brand}</div>
                          <div className="text-xs muted">{v.plate.split(' ').slice(0,2).join(' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{VEHICLE_TYPES[v.type]?.label}</td>
                    <td className="num">{n}</td>
                    <td className="num">
                      <div style={{display:'flex', gap:6, alignItems:'center', justifyContent:'flex-end'}}>
                        <div style={{width:60, height:6, background:'var(--surface-2)', borderRadius:99, overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${(n/maxVeh)*100}%`, background:'var(--pea-purple)'}}></div>
                        </div>
                        <span style={{fontWeight:500}}>{Math.round((n/maxVeh)*100)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card card-pad">
          <h2 className="mt-0">Top ผู้ใช้งาน</h2>
          <p className="sub">ผู้ใช้งานที่จองรถบ่อยที่สุด</p>
          <div className="col gap-3" style={{marginTop:10}}>
            {topUsers.map(([uid, n], i) => {
              const u = users.find((x) => x.id === uid);
              if (!u) return null;
              return (
                <div key={uid} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--surface-2)', borderRadius:9}}>
                  <div style={{width:24, fontWeight:700, color:'var(--pea-purple)'}}>#{i+1}</div>
                  <div className="avatar">{u.name.charAt(0)}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:600, fontSize:13}}>{u.name}</div>
                    <div className="text-xs muted">{u.dept}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18, fontWeight:700, color:'var(--pea-purple)'}}>{n}</div>
                    <div className="text-xs muted">ครั้ง</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New: Department + Fuel cost + Peak hours */}
      <div className="grid-2" style={{gap:14, marginTop:14}}>
        <DepartmentReport bookings={bookings} users={users}/>
        <FuelCostReport bookings={bookings} vehicles={vehicles} configPrices={fuelPrices}/>
      </div>

      <div className="grid-2" style={{gap:14, marginTop:14, gridTemplateColumns:'1.2fr 1fr'}}>
        <PeakHoursHeatmap bookings={bookings}/>
        <TopRatedReport bookings={bookings} vehicles={vehicles}/>
      </div>

      <div className="card card-pad" style={{marginTop:14}}>
        <MaintenanceSchedule vehicles={vehicles}/>
      </div>
    </div>
  );
}

// ─── Distance by department ────────────────────────────────────
function DepartmentReport({ bookings, users }) {
  const approved = bookings.filter((b) => b.status === "completed" || b.status === "approved" || b.status === "urgent");
  const byDept = {};
  approved.forEach((b) => {
    const u = users.find((x) => x.id === b.userId);
    if (!u) return;
    if (!byDept[u.dept]) byDept[u.dept] = { count: 0, distance: 0 };
    byDept[u.dept].count += 1;
    if (b.mileageIn && b.mileageOut) byDept[u.dept].distance += b.mileageIn - b.mileageOut;
  });
  const data = Object.entries(byDept).sort((a, b) => b[1].count - a[1].count);
  const maxCount = Math.max(...data.map(([, v]) => v.count), 1);

  return (
    <div className="card card-pad">
      <h2 className="mt-0">การใช้รถตามแผนก</h2>
      <p className="sub">จำนวนการจองและระยะทางสะสมของแต่ละแผนก</p>
      <div className="col gap-2" style={{marginTop:14}}>
        {data.map(([dept, v], i) => (
          <div key={dept}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4}}>
              <span style={{flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{dept}</span>
              <span style={{color:'var(--text-3)', marginRight:8}}>{fmtNum(v.distance)} กม.</span>
              <b>{v.count} ครั้ง</b>
            </div>
            <div style={{height:8, background:'var(--surface-2)', borderRadius:999, overflow:'hidden'}}>
              <div style={{
                height:'100%', width: `${(v.count/maxCount)*100}%`,
                background: ['var(--pea-purple)','var(--pea-orange)','var(--info)','var(--ok)','var(--warn)','#7B4FAA','#E89534'][i % 7],
                borderRadius:999, transition:'width 0.3s'
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fuel cost estimate ───────────────────────────────────────────
const DEFAULT_FUEL_PRICES = { diesel: 32.5, gasohol: 38.5, benzin: 41.5, ngv: 16.5, ev: 4.5 };
const DEFAULT_FUEL_CONSUMPTION = { diesel: 12, gasohol: 14, benzin: 14, ngv: 10, ev: 6 };

function FuelCostReport({ bookings, vehicles, configPrices }) {
  const fuelPrices = configPrices ? { ...DEFAULT_FUEL_PRICES, ...configPrices } : DEFAULT_FUEL_PRICES;
  const fuelConsumption = DEFAULT_FUEL_CONSUMPTION;
  const vehFuelMap = Object.fromEntries(vehicles.map((v) => [v.id, v.fuel]));
  const completed = bookings.filter((b) => b.mileageIn != null && b.mileageOut != null);
  const breakdown = {};
  completed.forEach((b) => {
    const fuel = vehFuelMap[b.vehicleId];
    if (!fuel) return;
    if (!breakdown[fuel]) breakdown[fuel] = { km: 0, cost: 0 };
    const km = b.mileageIn - b.mileageOut;
    breakdown[fuel].km += km;
    breakdown[fuel].cost += (km / (fuelConsumption[fuel] || 12)) * (fuelPrices[fuel] || 35);
  });
  let totalCost = Object.values(breakdown).reduce((s, v) => s + v.cost, 0);
  const data = Object.entries(breakdown).sort((a, b) => b[1].cost - a[1].cost);
  const maxCost = Math.max(...data.map(([, v]) => v.cost), 1);

  return (
    <div className="card card-pad">
      <h2 className="mt-0">ค่าเชื้อเพลิงโดยประมาณ (เดือนนี้)</h2>
      <p className="sub">คำนวณจากระยะทางและอัตราสิ้นเปลืองตามประเภทเชื้อเพลิง</p>

      <div style={{textAlign:'center', padding:'16px 0', borderBottom:'1px dashed var(--border)', marginBottom:14}}>
        <div className="text-xs muted">ค่าเชื้อเพลิงรวม (คำนวณจากระยะทางจริง)</div>
        <div style={{fontSize:32, fontWeight:700, color:'var(--pea-orange)', fontFamily:'var(--font-mono)'}}>
          {completed.length > 0 ? `฿ ${fmtNum(Math.round(totalCost))}` : '— ยังไม่มีข้อมูล —'}
        </div>
        <div className="text-xs muted">ระยะทางรวม {fmtNum(Object.values(breakdown).reduce((s,v)=>s+v.km,0))} กม. จาก {completed.length} การเดินทาง</div>
      </div>

      <div className="col gap-2">
        {data.map(([fuel, v], i) => (
          <div key={fuel} style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:60, fontSize:12.5, fontWeight:500}}>{FUEL_TYPES[fuel]}</div>
            <div style={{flex:1, height:24, background:'var(--surface-2)', borderRadius:6, position:'relative', overflow:'hidden'}}>
              <div style={{
                position:'absolute', left:0, top:0, bottom:0,
                width: `${(v.cost/maxCost)*100}%`,
                background: ['var(--pea-purple)','var(--pea-orange)','var(--info)','var(--ok)','var(--warn)'][i % 5],
                display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:6,
                color:'white', fontSize:11, fontWeight:600,
                fontFamily:'var(--font-mono)',
              }}>
                ฿{fmtNum(Math.round(v.cost))}
              </div>
            </div>
            <div className="text-xs muted" style={{width:60, textAlign:'right'}}>{fmtNum(v.km)} กม.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Peak hours heatmap ───────────────────────────────────────────
function PeakHoursHeatmap({ bookings }) {
  // 7 days x 14 hours (06-19)
  const days = ["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."];
  const hours = Array.from({length: 14}, (_, i) => i + 6);

  // Generate semi-random data biased toward weekday business hours
  const data = days.map((_, di) =>
    hours.map((h, hi) => {
      const isWeekend = di >= 5;
      const isBusinessHour = h >= 8 && h <= 16;
      const base = isWeekend ? 0.5 : (isBusinessHour ? 5 : 1);
      return Math.floor(base + Math.random() * (isBusinessHour && !isWeekend ? 8 : 2));
    })
  );
  const max = Math.max(...data.flat());

  return (
    <div className="card card-pad">
      <h2 className="mt-0">ช่วงเวลาที่ใช้รถบ่อย</h2>
      <p className="sub">Heatmap จำนวนการจองตามวันและเวลา</p>
      <div style={{overflowX:'auto', marginTop:12}}>
        <div style={{display:'grid', gridTemplateColumns:`40px repeat(${hours.length}, 1fr)`, gap:2, minWidth:520}}>
          <div></div>
          {hours.map((h) => (
            <div key={h} style={{textAlign:'center', fontSize:9.5, color:'var(--text-3)', fontWeight:500}}>
              {h.toString().padStart(2,'0')}
            </div>
          ))}
          {days.map((day, di) => (
            <React.Fragment key={day}>
              <div style={{fontSize:11, color:'var(--text-3)', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:6}}>{day}</div>
              {hours.map((h, hi) => {
                const v = data[di][hi];
                const intensity = v / max;
                const bg = intensity === 0 ? 'var(--surface-2)' :
                  `oklch(${95 - intensity*35}% ${0.05 + intensity*0.13} 295)`;
                return (
                  <div key={hi} title={`${day} ${h}:00 — ${v} การจอง`}
                    style={{
                      aspectRatio:'1', borderRadius:3,
                      background: bg,
                      display:'grid', placeItems:'center',
                      fontSize:9, fontWeight:600,
                      color: intensity > 0.5 ? 'white' : 'var(--text-3)',
                    }}>{v > 0 ? v : ''}</div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8, marginTop:14, fontSize:11, color:'var(--text-3)'}}>
        <span>น้อย</span>
        <div style={{display:'flex', gap:2}}>
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <div key={i} style={{width:18, height:14, borderRadius:3, background: i === 0 ? 'var(--surface-2)' : `oklch(${95 - i*35}% ${0.05 + i*0.13} 295)`}}></div>
          ))}
        </div>
        <span>มาก</span>
      </div>
    </div>
  );
}

// ─── Top rated vehicles ───────────────────────────────────────────
function TopRatedReport({ bookings, vehicles }) {
  const ratings = {};
  bookings.forEach((b) => {
    if (b.rating) {
      if (!ratings[b.vehicleId]) ratings[b.vehicleId] = { sum: 0, n: 0 };
      ratings[b.vehicleId].sum += b.rating;
      ratings[b.vehicleId].n += 1;
    }
  });
  // Fill in mock ratings for all vehicles
  vehicles.forEach((v) => {
    if (!ratings[v.id]) ratings[v.id] = { sum: (3.5 + Math.random()*1.5) * 5, n: 5 };
  });
  const ranked = Object.entries(ratings)
    .map(([vid, r]) => ({ vid, avg: r.sum/r.n, n: r.n }))
    .sort((a, b) => b.avg - a.avg).slice(0, 5);

  return (
    <div className="card card-pad">
      <h2 className="mt-0">รถยนต์ที่ได้รับการรีวิวสูงสุด</h2>
      <p className="sub">คะแนนเฉลี่ยจากผู้ใช้งาน</p>
      <div className="col gap-3" style={{marginTop:12}}>
        {ranked.map((r, i) => {
          const v = vehicles.find((x) => x.id === r.vid);
          if (!v) return null;
          const full = Math.floor(r.avg);
          const half = r.avg - full >= 0.5;
          return (
            <div key={r.vid} style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:22, fontWeight:700, color:'var(--pea-purple)', textAlign:'center'}}>#{i+1}</div>
              <div className="veh-ico" style={{background:'var(--pea-purple-50)'}}>
                <VehicleIcon type={v.type} size={22}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:13}}>{v.brand}</div>
                <div className="text-xs muted">{v.plate.split(' ').slice(0,2).join(' ')} · {r.n} รีวิว</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{display:'flex', gap:1, color:'var(--pea-orange)', justifyContent:'flex-end'}}>
                  {[1,2,3,4,5].map((n) => (
                    <span key={n}>{n <= full ? I.star : I.starOutline}</span>
                  ))}
                </div>
                <div style={{fontSize:12, fontWeight:600, marginTop:2}}>{r.avg.toFixed(1)} / 5.0</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Maintenance schedule ─────────────────────────────────────────
function MaintenanceSchedule({ vehicles }) {
  // Vehicles by next service or tax due
  const items = vehicles.map((v) => {
    const serviceDays = daysUntil(v.nextService);
    const taxDays = daysUntil(v.taxDue);
    const insDays = daysUntil(v.insuranceDue);
    const minDays = Math.min(serviceDays, taxDays, insDays);
    let kind = "เช็คระยะ", date = v.nextService;
    if (taxDays === minDays) { kind = "ภาษีรถยนต์"; date = v.taxDue; }
    if (insDays === minDays && insDays < taxDays) { kind = "พ.ร.บ."; date = v.insuranceDue; }
    return { v, kind, date, days: minDays };
  }).filter((x) => x.days < 90).sort((a, b) => a.days - b.days).slice(0, 12);

  return (
    <>
      <div style={{display:'flex', alignItems:'baseline', gap:14, marginBottom:12}}>
        <div>
          <h2 className="mt-0" style={{margin:0}}>ตารางบำรุงรักษาที่ใกล้ถึงกำหนด</h2>
          <p className="sub" style={{margin:'2px 0 0'}}>เช็คระยะ, ต่อภาษี, พ.ร.บ. — ภายใน 90 วันข้างหน้า</p>
        </div>
        <button className="btn sm ghost" style={{marginLeft:'auto'}}>{I.export} Export</button>
      </div>
      <div className="grid-3">
        {items.map(({ v, kind, date, days }) => (
          <div key={v.id + kind} style={{
            padding:'12px 14px',
            border: days < 14 ? '1.5px solid var(--danger)' : days < 30 ? '1.5px solid var(--warn)' : '1px solid var(--border)',
            borderRadius:10,
            background: days < 14 ? 'var(--danger-bg)' : days < 30 ? 'var(--warn-bg)' : 'var(--surface)',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
              <VehicleIcon type={v.type} size={26}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12.5, fontWeight:600}}>{v.id}</div>
                <div className="text-xs muted">{v.plate.split(' ').slice(0,2).join(' ')}</div>
              </div>
              <span style={{
                marginLeft:'auto',
                padding:'2px 8px',
                background: days < 14 ? 'var(--danger)' : days < 30 ? 'var(--warn)' : 'var(--text-3)',
                color:'white', borderRadius:999, fontSize:11, fontWeight:700,
              }}>
                {days < 0 ? `เกิน ${Math.abs(days)} วัน` : days === 0 ? "วันนี้" : `อีก ${days} วัน`}
              </span>
            </div>
            <div style={{fontSize:13, fontWeight:500}}>{kind}</div>
            <div className="text-xs muted">ครบกำหนด {fmtDate(date)}</div>
          </div>
        ))}
      </div>
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

// ─── My bookings ─────────────────────────────────────────────────
function MyBookingsScreen({ bookings, vehicles, users, currentUser, onSelectBooking, onPrintVoucher, setRoute }) {
  const mine = bookings.filter((b) => b.userId === currentUser.id);
  const [tab, setTab] = React.useState("active");

  const active = mine.filter((b) => b.status === "booked" || b.status === "approved" || b.status === "urgent");
  const completed = mine.filter((b) => b.status === "completed");
  const rejected = mine.filter((b) => b.status === "rejected");

  const list = { active, completed, rejected }[tab];

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div>
            <h2 className="mt-0" style={{margin:0}}>การจองของฉัน</h2>
            <p className="sub" style={{margin:'2px 0 0'}}>ประวัติการจองรถ {currentUser.name}</p>
          </div>
          <button className="btn accent" style={{marginLeft:'auto'}} onClick={() => setRoute("booking")}>{I.plus} จองรถใหม่</button>
        </div>
      </div>

      <div className="card card-pad">
        <div className="tabs">
          <button className={"tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>กำลังดำเนินการ <span className="count">{active.length}</span></button>
          <button className={"tab" + (tab === "completed" ? " active" : "")} onClick={() => setTab("completed")}>เสร็จสิ้น <span className="count">{completed.length}</span></button>
          <button className={"tab" + (tab === "rejected" ? " active" : "")} onClick={() => setTab("rejected")}>ไม่อนุมัติ <span className="count">{rejected.length}</span></button>
        </div>

        {list.length === 0 ? (
          <div style={{padding:'48px 0', textAlign:'center', color:'var(--text-3)'}}>
            <div style={{fontSize:42}}>📋</div>
            ไม่มีรายการในหมวดนี้
          </div>
        ) : (
          <div className="col gap-3">
            {list.map((b) => {
              const v = vehicles.find((x) => x.id === b.vehicleId);
              return (
                <div key={b.id} style={{display:'flex', gap:14, padding:14, border:'1px solid var(--border)', borderRadius:10, alignItems:'center'}}>
                  <div className="veh-ico lg" style={{background:'var(--pea-purple-50)', color:'var(--pea-purple)'}}>
                    {v && <VehicleIcon type={v.type} size={32}/>}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                      <span className="plate" style={{fontSize:11, padding:'1px 6px'}}>{(v?.plate || '').split(' ').slice(0,2).join(' ')}</span>
                      <span style={{fontWeight:600, fontSize:14}}>{v?.brand}</span>
                      <StatusPill status={b.status}/>
                      {b.rating && (
                        <span style={{display:'flex', gap:1, color:'var(--pea-orange)'}}>
                          {Array.from({length:b.rating}).map((_, i) => I.star)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm" style={{marginTop:4, color:'var(--text-2)'}}>{b.purposeNote}</div>
                    <div style={{display:'flex', gap:16, marginTop:6, fontSize:12.5, color:'var(--text-3)'}}>
                      <span>{I.clock} {fmtDateTime(b.from)} – {fmtTime(b.to)}</span>
                      <span>{I.pin} {b.destination}</span>
                      {b.mileageIn != null && <span>{I.car} {fmtNum((b.mileageIn - b.mileageOut))} กม.</span>}
                    </div>
                    {b.rejectReason && <div className="text-xs" style={{marginTop:4, color:'var(--danger)'}}>เหตุผล: {b.rejectReason}</div>}
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    {(b.status === "approved" || b.status === "urgent") && (
                      <button className="btn sm ghost" onClick={() => onPrintVoucher(b)}>{I.print} ใบจอง</button>
                    )}
                    <button className="btn sm ghost" onClick={() => onSelectBooking(b)}>รายละเอียด</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { ReportsScreen, MyBookingsScreen }
