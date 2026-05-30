// Calendar screen - weekly and monthly view
import React from 'react'
import { I, StatusPill, VehicleIcon, Modal, fmtTime, Select } from '../components'

function CalendarScreen({ vehicles, bookings, users, onSelectBooking }) {
  const [view, setView] = React.useState("month"); // month | week
  const [refDate, setRefDate] = React.useState(new Date('2026-05-21'));
  const [vehicleFilter, setVehicleFilter] = React.useState("all");
  const [dayDetail, setDayDetail] = React.useState(null);

  const filteredBookings = bookings.filter((b) => vehicleFilter === "all" || b.vehicleId === vehicleFilter);

  return (
    <div>
      <div className="card card-pad" style={{marginBottom:14}}>
        <div style={{marginBottom:10}}>
          <h2 className="mt-0" style={{margin:'0 0 2px'}}>ปฏิทินการจอง</h2>
          <p className="sub" style={{margin:0}}>ภาพรวมการใช้รถยนต์ทั้งหน่วยงาน</p>
        </div>
        <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap'}}>
          <Select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} style={{flex:'1 1 160px', minWidth:0}}>
            <option value="all">รถยนต์ทั้งหมด ({vehicles.length})</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.id} · {v.plate.split(' ').slice(0,2).join(' ')} · {v.brand}</option>)}
          </Select>
          <div style={{display:'flex', gap:6, alignItems:'center', flexShrink:0}}>
            <div style={{display:'flex', background:'var(--surface-2)', borderRadius:8, padding:3}}>
              <button className={"btn sm" + (view === "month" ? " primary" : "")} style={{background: view !== "month" ? 'transparent' : undefined, border:'none'}} onClick={() => setView("month")}>เดือน</button>
              <button className={"btn sm" + (view === "week" ? " primary" : "")} style={{background: view !== "week" ? 'transparent' : undefined, border:'none'}} onClick={() => setView("week")}>สัปดาห์</button>
            </div>
            <button className="btn icon ghost" onClick={() => {
              const d = new Date(refDate);
              if (view === "month") d.setMonth(d.getMonth() - 1); else d.setDate(d.getDate() - 7);
              setRefDate(d);
            }}>{I.arrowLeft}</button>
            <button className="btn sm ghost" onClick={() => setRefDate(new Date('2026-05-21'))}>วันนี้</button>
            <button className="btn icon ghost" onClick={() => {
              const d = new Date(refDate);
              if (view === "month") d.setMonth(d.getMonth() + 1); else d.setDate(d.getDate() + 7);
              setRefDate(d);
            }}>{I.arrowRight}</button>
          </div>
        </div>
      </div>

      {view === "month" ? (
        <MonthView refDate={refDate} bookings={filteredBookings} vehicles={vehicles} users={users} onSelectBooking={onSelectBooking} onSelectDay={(d, evts) => setDayDetail({date:d, events:evts})}/>
      ) : (
        <WeekView refDate={refDate} bookings={filteredBookings} vehicles={vehicles} users={users} onSelectBooking={onSelectBooking}/>
      )}

      <div className="card card-pad" style={{marginTop:14, padding:'14px 18px'}}>
        <div style={{display:'flex', gap:18, flexWrap:'wrap', alignItems:'center', fontSize:12.5}}>
          <span style={{fontWeight:600, color:'var(--text-3)'}}>คำอธิบายสี:</span>
          <span style={{display:'flex', gap:6, alignItems:'center'}}><span style={{width:14, height:14, borderRadius:4, background:'var(--status-approved-bg)', border:'1px solid var(--status-approved)'}}></span> อนุมัติแล้ว</span>
          <span style={{display:'flex', gap:6, alignItems:'center'}}><span style={{width:14, height:14, borderRadius:4, background:'var(--status-booked-bg)', border:'1px solid var(--status-booked)'}}></span> รออนุมัติ</span>
          <span style={{display:'flex', gap:6, alignItems:'center'}}><span style={{width:14, height:14, borderRadius:4, background:'var(--status-urgent-bg)', border:'1px solid var(--status-urgent)'}}></span> ภารกิจด่วน</span>
          <span style={{display:'flex', gap:6, alignItems:'center'}}><span style={{width:14, height:14, borderRadius:4, background:'var(--status-maintenance-bg)', border:'1px solid var(--status-maintenance)'}}></span> บำรุงรักษา</span>
        </div>
      </div>

      {dayDetail && (
        <DayDetailModal
          date={dayDetail.date}
          events={dayDetail.events}
          vehicles={vehicles} users={users}
          onClose={() => setDayDetail(null)}
          onSelectBooking={(b) => { setDayDetail(null); onSelectBooking(b); }}
        />
      )}
    </div>
  );
}

// ─── Day detail modal ─────────────────────────────────────────────
function DayDetailModal({ date, events, vehicles, users, onClose, onSelectBooking }) {
  const dateLabel = date.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const sorted = [...events].sort((a, b) => a.from.localeCompare(b.from));
  const summary = {
    approved: events.filter((e) => e.status === "approved").length,
    booked: events.filter((e) => e.status === "booked").length,
    urgent: events.filter((e) => e.status === "urgent").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };
  return (
    <Modal title={`การจองรถ · ${dateLabel}`} onClose={onClose} width={720}>
      {events.length === 0 ? (
        <div style={{padding:'40px 0', textAlign:'center', color:'var(--text-3)'}}>
          <div style={{fontSize:36, marginBottom:6}}>📅</div>
          ไม่มีการจองในวันนี้
        </div>
      ) : (
        <>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:14}}>
            <span className="pill done"><span className="dot"></span>ทั้งหมด {events.length}</span>
            {summary.approved > 0 && <span className="pill approved"><span className="dot"></span>อนุมัติแล้ว {summary.approved}</span>}
            {summary.booked > 0 && <span className="pill booked"><span className="dot"></span>รออนุมัติ {summary.booked}</span>}
            {summary.urgent > 0 && <span className="pill urgent"><span className="dot"></span>ภารกิจด่วน {summary.urgent}</span>}
            {summary.rejected > 0 && <span className="pill rejected"><span className="dot"></span>ไม่อนุมัติ {summary.rejected}</span>}
          </div>
          <div className="col gap-2">
            {sorted.map((b) => {
              const v = vehicles.find((x) => x.id === b.vehicleId);
              const u = users.find((x) => x.id === b.userId);
              return (
                <div key={b.id} onClick={() => onSelectBooking(b)} style={{
                  display:'flex', gap:12, padding:12,
                  border:'1px solid var(--border)', borderRadius:10,
                  cursor:'pointer', alignItems:'center',
                  transition:'background 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{
                    textAlign:'center', minWidth:60,
                    padding:'8px 6px',
                    background:'var(--pea-purple-50)',
                    color:'var(--pea-purple)',
                    borderRadius:8,
                  }}>
                    <div style={{fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)'}}>{fmtTime(b.from)}</div>
                    <div style={{fontSize:10, color:'var(--text-3)'}}>ถึง</div>
                    <div style={{fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)'}}>{fmtTime(b.to)}</div>
                  </div>
                  <div className="veh-ico" style={{background:'var(--surface-2)'}}>
                    {v && <VehicleIcon type={v.type} size={24}/>}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                      <span className="plate" style={{fontSize:11, padding:'1px 6px'}}>{v?.plate.split(' ').slice(0,2).join(' ')}</span>
                      <span style={{fontSize:13.5, fontWeight:600}}>{v?.brand}</span>
                      <StatusPill status={b.status}/>
                    </div>
                    <div style={{fontSize:12.5, color:'var(--text-2)', marginTop:3}}>
                      <b>{u?.name}</b> <span className="muted">· {u?.dept}</span>
                    </div>
                    <div style={{fontSize:12, color:'var(--text-3)', marginTop:2, display:'flex', gap:10, flexWrap:'wrap'}}>
                      <span>📋 {b.purpose}</span>
                      <span>📍 {b.destination}</span>
                    </div>
                  </div>
                  <div style={{color:'var(--text-3)'}}>{I.arrowRight}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}

// Month grid view
function MonthView({ refDate, bookings, vehicles, users, onSelectBooking, onSelectDay }) {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const cells = [];
  // prev month padding
  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startWeekDay - 1; i >= 0; i--) cells.push({ d: prevMonthLast - i, other: true, fullDate: new Date(year, month - 1, prevMonthLast - i) });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i, other: false, fullDate: new Date(year, month, i) });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - daysInMonth - startWeekDay + 1, other: true, fullDate: new Date(year, month + 1, cells.length - daysInMonth - startWeekDay + 1) });

  function dayEvents(date) {
    const iso = date.toISOString().slice(0, 10);
    return bookings.filter((b) => b.from.slice(0, 10) === iso);
  }
  const today = new Date('2026-05-21');
  const monthName = refDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

  return (
    <div className="card card-pad">
      <h2 className="mt-0" style={{marginBottom:14}}>{monthName}</h2>
      <div className="cal-grid">
        {[["อาทิตย์","อา"],["จันทร์","จ"],["อังคาร","อ"],["พุธ","พ"],["พฤหัสฯ","พฤ"],["ศุกร์","ศ"],["เสาร์","ส"]].map(([full, short]) => (
          <div key={full} className="cal-head">
            <span className="cal-day-full">{full}</span>
            <span className="cal-day-short">{short}</span>
          </div>
        ))}
        {cells.map((c, i) => {
          const evts = dayEvents(c.fullDate);
          const isToday = c.fullDate.toDateString() === today.toDateString() && !c.other;
          const isWeekend = (i % 7 === 0 || i % 7 === 6) && !c.other;
          return (
            <div key={i}
              className={"cal-cell" + (c.other ? " other" : "") + (isToday ? " today" : "") + (isWeekend && !isToday ? " weekend" : "")}
              onClick={() => !c.other && onSelectDay && onSelectDay(c.fullDate, evts)}
              style={{cursor: !c.other ? 'pointer' : 'default'}}
              title={!c.other ? `ดูการจองวันที่ ${c.d} ทั้งหมด (${evts.length})` : undefined}
            >
              <div className="date-num">{c.d}</div>
              {evts.slice(0, 3).map((b) => {
                const v = vehicles.find((x) => x.id === b.vehicleId);
                const u = users.find((x) => x.id === b.userId);
                return (
                  <div key={b.id} className={"cal-event " + b.status}
                    onClick={(e) => { e.stopPropagation(); onSelectBooking(b); }}>
                    {fmtTime(b.from)} {v?.plate.split(' ')[1] || ''} · {u?.name.split(' ')[0]}
                  </div>
                );
              })}
              {evts.length > 3 && (
                <div style={{fontSize:10.5, color:'var(--pea-purple)', fontWeight:600, marginTop:2}}>
                  +{evts.length - 3} อื่นๆ →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week timeline view
function WeekView({ refDate, bookings, vehicles, users, onSelectBooking }) {
  const d = new Date(refDate);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);
  const days = Array.from({length: 7}).map((_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
  const startOfWeek = days[0].toISOString().slice(0,10);
  const endOfWeek = days[6].toISOString().slice(0,10);
  const weekRange = `${days[0].toLocaleDateString('th-TH', { day:'numeric', month:'short' })} – ${days[6].toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })}`;

  return (
    <div className="card card-pad">
      <h2 className="mt-0" style={{marginBottom:14}}>สัปดาห์ที่ {weekRange}</h2>
      <div style={{overflowX:'auto'}}>
        <div style={{minWidth:900}}>
          <div style={{display:'grid', gridTemplateColumns:'150px repeat(7, 1fr)', gap:1, background:'var(--border)', borderRadius:10, overflow:'hidden', border:'1px solid var(--border)'}}>
            <div style={{background:'var(--surface-2)', padding:'10px 12px', fontSize:11.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase'}}>รถยนต์</div>
            {days.map((dd, i) => {
              const isToday = dd.toDateString() === new Date('2026-05-21').toDateString();
              return (
                <div key={i} style={{background: isToday ? 'var(--pea-purple-50)' : 'var(--surface-2)', padding:'10px', fontSize:11.5, textAlign:'center'}}>
                  <div style={{fontWeight:600, color:isToday ? 'var(--pea-purple)' : 'var(--text-3)', textTransform:'uppercase'}}>{dd.toLocaleDateString('th-TH', { weekday:'short' })}</div>
                  <div style={{fontSize:18, fontWeight:600, marginTop:2, color: isToday ? 'var(--pea-purple)' : 'var(--text)'}}>{dd.getDate()}</div>
                </div>
              );
            })}

            {vehicles.slice(0, 14).map((v) => (
              <React.Fragment key={v.id}>
                <div style={{background:'var(--surface)', padding:'10px 12px', display:'flex', alignItems:'center', gap:8}}>
                  <VehicleIcon type={v.type} size={26}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:600}}>{v.id}</div>
                    <div style={{fontSize:10.5, color:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v.plate.split(' ').slice(0,2).join(' ')}</div>
                  </div>
                </div>
                {days.map((dd, di) => {
                  const iso = dd.toISOString().slice(0, 10);
                  const evts = bookings.filter((b) => b.vehicleId === v.id && b.from.slice(0, 10) === iso);
                  const isMaintenance = v.status === "maintenance";
                  return (
                    <div key={di} style={{background: isMaintenance ? 'var(--status-maintenance-bg)' : 'var(--surface)', padding:6, minHeight:62, display:'flex', flexDirection:'column', gap:3}}>
                      {isMaintenance && <div style={{fontSize:10.5, color:'var(--status-maintenance)', fontWeight:600, textAlign:'center', padding:'4px 0'}}>🔧 ซ่อมบำรุง</div>}
                      {evts.map((b) => {
                        const u = users.find((x) => x.id === b.userId);
                        return (
                          <div key={b.id} className={"cal-event " + b.status} onClick={() => onSelectBooking(b)} style={{fontSize:10.5, padding:'3px 6px'}}>
                            <div style={{fontWeight:600}}>{fmtTime(b.from)}-{fmtTime(b.to)}</div>
                            <div style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{u?.name.split(' ')[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CalendarScreen, DayDetailModal, MonthView, WeekView }
