import { useState, useEffect } from "react";

/* ================= HELPERS ================= */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function dayOfWeek() {
  return new Date().getDay();
}
function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function load(key, fallback) {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
const ACADEMIC_DAY_END = timeToMinutes("18:00");

/* ================= CSV ================= */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i]));
    return obj;
  });
}
function dayStringToIndex(d) {
  return { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[d];
}

/* ================= STATS ================= */
function computeStats(doneMap) {
  const today = new Date();
  let cT=0,cD=0,gT=0,gD=0,eT=0,eD=0;

  for (let i=0;i<7;i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const kDate = d.toISOString().slice(0,10);

    Object.keys(doneMap).forEach(k => {
      if (!k.startsWith(kDate)) return;
      if (k.endsWith("|gym")) { gT++; if (doneMap[k]) gD++; }
      else if (k.includes("|gym|")) { eT++; if (doneMap[k]) eD++; }
      else { cT++; if (doneMap[k]) cD++; }
    });
  }

  return {
    classPct: cT ? Math.round(cD*100/cT) : 0,
    gymPct: gT ? Math.round(gD*100/gT) : 0,
    exercisePct: eT ? Math.round(eD*100/eT) : 0,
  };
}

function CircularStat({ label, value, color }) {
  const r = 45;
  const c = 2 * Math.PI * r;
  const o = c - (value / 100) * c;

  return (
    <div style={{ textAlign: "center", margin: 16 }}>
      <svg width="120" height="120">
        <circle cx="60" cy="60" r={r} stroke="#eee" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={o}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="65" textAnchor="middle" fontSize="18" fontWeight="bold">
          {value}%
        </text>
      </svg>
      <div>{label}</div>
    </div>
  );
}

/* ================= APP ================= */
export default function App() {
  const today = todayISO();
  const dow = dayOfWeek();
  const now = nowMinutes();

  const [view, setView] = useState("home");

  const [classTemplates, setClassTemplates] = useState(() =>
    load("classTemplates", [])
  );
  const [gymDayLibrary, setGymDayLibrary] = useState(() =>
    load("gymDayLibrary", {})
  );
  const [activeGymRegime, setActiveGymRegime] = useState(() =>
    load("activeGymRegime", Array.from({ length: 14 }, () => []))
  );
  const [doneMap, setDoneMap] = useState(() =>
    load("doneMap", {})
  );

  useEffect(() => save("classTemplates", classTemplates), [classTemplates]);
  useEffect(() => save("gymDayLibrary", gymDayLibrary), [gymDayLibrary]);
  useEffect(() => save("activeGymRegime", activeGymRegime), [activeGymRegime]);
  useEffect(() => save("doneMap", doneMap), [doneMap]);

  function toggle(key) {
    setDoneMap(p => ({ ...p, [key]: !p[key] }));
  }

  /* ---------- TIMELINE ---------- */
  const todaysClassesRaw = classTemplates
    .filter(c => c.day === dow && c.startTime)
    .sort((a,b)=>timeToMinutes(a.startTime)-timeToMinutes(b.startTime));

  const todaysClasses = todaysClassesRaw.map((c,i)=>{
    const start = timeToMinutes(c.startTime);
    const next = todaysClassesRaw[i+1];
    const end = next ? timeToMinutes(next.startTime) : ACADEMIC_DAY_END;
    let status="upcoming";
    if (now>=start && now<end) status="current";
    if (now>=end) status="past";
    return {...c,status};
  });

  const grouped = {
    current: todaysClasses.filter(c=>c.status==="current"),
    upcoming: todaysClasses.filter(c=>c.status==="upcoming"),
    past: todaysClasses.filter(c=>c.status==="past"),
  };

  /* ---------- GYM TODAY ---------- */
  const cycleStart = new Date("2025-01-01");
  const diffDays = Math.floor((new Date(today)-cycleStart)/86400000);
  const gymDayIndex = ((diffDays%14)+14)%14;

  const todaysGyms = (activeGymRegime[gymDayIndex]||[])
    .map(id=>gymDayLibrary[id])
    .filter(Boolean);

  const stats = computeStats(doneMap);

  return (
    <div style={{padding:24,fontFamily:"sans-serif",maxWidth:900}}>
      <header style={{marginBottom:16}}>
        <button onClick={()=>setView("home")}>Home</button>{" "}
        <button onClick={()=>setView("gym")}>Gym Regime</button>{" "}
        <button onClick={()=>setView("timetable")}>Timetable</button>
      </header>

      {/* ================= HOME ================= */}
      {view==="home" && (
        <>
          <h2>{today}</h2>

          <div style={{display:"flex",justifyContent:"center"}}>
            <CircularStat label="Classes" value={stats.classPct} color="#4caf50"/>
            <CircularStat label="Gym" value={stats.gymPct} color="#2196f3"/>
            <CircularStat label="Exercises" value={stats.exercisePct} color="#ff9800"/>
          </div>

          {["current","upcoming","past"].map(k=>(
            <section key={k}>
              <h3>{k.toUpperCase()}</h3>
              {grouped[k].map(c=>(
                <div key={c.id}>
                  <input
                    type="checkbox"
                    checked={!!doneMap[`${today}|${c.id}`]}
                    onChange={()=>toggle(`${today}|${c.id}`)}
                  />
                  {" "}{c.title} — {c.startTime}
                </div>
              ))}
            </section>
          ))}

          <hr/>

          <h3>🏋️ Gym</h3>
          {todaysGyms.length===0 && <p>Rest day</p>}
          {todaysGyms.map(g=>(
            <div key={g.title}>
              <h4>{g.title}</h4>
              {[...(g.warmup||[]),...g.exercises].map(e=>{
                const key=`${today}|gym|${g.title}|${e.name}`;
                return(
                  <div key={key}>
                    <input
                      type="checkbox"
                      checked={!!doneMap[key]}
                      onChange={()=>toggle(key)}
                    />
                    {" "}{e.name}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {/* ================= GYM ================= */}
      {view==="gym" && (
        <>
          <h2>Gym Regime</h2>

          <button onClick={()=>
            setActiveGymRegime(Array.from({length:14},()=>[]))
          }>
            🔁 Gym Regime Change
          </button>

          <h3>Gym Day Library</h3>
          <button onClick={()=>{
            const id=crypto.randomUUID();
            setGymDayLibrary(p=>({...p,[id]:{title:"Workout",warmup:[],exercises:[]}}));
          }}>
            + Create Gym Day
          </button>

          {Object.entries(gymDayLibrary).map(([id,g])=>(
            <div key={id}>
              <input
                value={g.title}
                onChange={e=>setGymDayLibrary(p=>({...p,[id]:{...p[id],title:e.target.value}}))}
              />
            </div>
          ))}

          <h3>Active 14-Day Regime</h3>
          {activeGymRegime.map((ids,i)=>(
            <div key={i}>
              <strong>Day {i+1}</strong>
              {Object.entries(gymDayLibrary).map(([id,g])=>(
                <label key={id} style={{display:"block"}}>
                  <input
                    type="checkbox"
                    checked={ids.includes(id)}
                    onChange={()=>
                      setActiveGymRegime(p=>{
                        const c=p.map(a=>[...a]);
                        c[i].includes(id)
                          ? c[i]=c[i].filter(x=>x!==id)
                          : c[i].push(id);
                        return c;
                      })
                    }
                  />
                  {" "}{g.title}
                </label>
              ))}
            </div>
          ))}
        </>
      )}

      {/* ================= TIMETABLE ================= */}
      {view==="timetable" && (
        <>
          <h2>Timetable</h2>

          <h3>Import CSV</h3>
          <input
            type="file"
            accept=".csv"
            onChange={e=>{
              const file=e.target.files[0];
              if(!file) return;
              const reader=new FileReader();
              reader.onload=ev=>{
                const rows=parseCSV(ev.target.result);
                const imported=rows
                  .map(r=>({
                    id:crypto.randomUUID(),
                    title:r.title,
                    day:dayStringToIndex(r.day),
                    startTime:r.startTime,
                    location:r.location,
                  }))
                  .filter(c=>c.day!==undefined && c.startTime);
                setClassTemplates(p=>[...p,...imported]);
              };
              reader.readAsText(file);
            }}
          />

          <h3>Classes</h3>
          <button onClick={()=>setClassTemplates(p=>[
            ...p,
            {id:crypto.randomUUID(),title:"New Class",day:1,startTime:"09:00",location:"Room"}
          ])}>
            + Add Class
          </button>

          {classTemplates.map((c,i)=>(
            <div key={c.id}>
              <input value={c.title} onChange={e=>{
                const cp=[...classTemplates]; cp[i].title=e.target.value; setClassTemplates(cp);
              }}/>
              <input type="time" value={c.startTime} onChange={e=>{
                const cp=[...classTemplates]; cp[i].startTime=e.target.value; setClassTemplates(cp);
              }}/>
              <button onClick={()=>setClassTemplates(p=>p.filter(x=>x.id!==c.id))}>
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
