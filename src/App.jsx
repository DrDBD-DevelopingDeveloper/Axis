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
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
const ACADEMIC_DAY_END = timeToMinutes("18:00");

/* ---------- CSV HELPERS ---------- */
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

/* ================= APP ================= */
export default function App() {
  const today = todayISO();
  const dow = dayOfWeek();
  const now = nowMinutes();

  const [view, setView] = useState("today"); // today | edit | stats

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
    setDoneMap(prev => ({ ...prev, [key]: !prev[key] }));
  }

  /* ================= CLASS TIMELINE ================= */
  const todaysClassesRaw = classTemplates
    .filter(c => c.day === dow && c.startTime)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const todaysClasses = todaysClassesRaw.map((c, i) => {
    const start = timeToMinutes(c.startTime);
    const next = todaysClassesRaw[i + 1];
    const end = next ? timeToMinutes(next.startTime) : ACADEMIC_DAY_END;
    let status = "upcoming";
    if (now >= start && now < end) status = "current";
    if (now >= end) status = "past";
    return { ...c, status };
  });

  const grouped = {
    current: todaysClasses.filter(c => c.status === "current"),
    upcoming: todaysClasses.filter(c => c.status === "upcoming"),
    past: todaysClasses.filter(c => c.status === "past"),
  };

  /* ================= GYM TODAY ================= */
  const cycleStart = new Date("2025-01-01");
  const diffDays = Math.floor((new Date(today) - cycleStart) / 86400000);
  const gymDayIndex = ((diffDays % 14) + 14) % 14;

  const todaysGymIds = activeGymRegime[gymDayIndex] || [];
  const todaysGyms = todaysGymIds.map(id => gymDayLibrary[id]).filter(Boolean);

  /* ================= UI ================= */
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 800 }}>
      <header>
        <button onClick={() => setView("today")}>Today</button>{" "}
        <button onClick={() => setView("edit")}>Edit</button>{" "}
        <button onClick={() => setView("stats")}>Stats</button>
      </header>

      {/* ---------- TODAY ---------- */}
      {view === "today" && (
        <>
          <h2>{today}</h2>

          {["current","upcoming","past"].map(k => (
            <section key={k}>
              <h3>{k.toUpperCase()}</h3>
              {grouped[k].length === 0 && <p>None</p>}
              {grouped[k].map(c => (
                <ClassRow key={c.id} c={c} today={today} doneMap={doneMap} toggle={toggle} />
              ))}
            </section>
          ))}

          <hr />
          <h3>🏋️ Gym</h3>
          {todaysGyms.length === 0 && <p>Rest day</p>}

          {todaysGyms.map(gym => (
            <div key={gym.title}>
              <h4>{gym.title}</h4>
              <ul>
                {gym.warmup?.map(w => {
                  const key = `${today}|gym|${gym.title}|warmup|${w.name}`;
                  return (
                    <li key={key}>
                      <input type="checkbox" checked={!!doneMap[key]} onChange={() => toggle(key)} />
                      {" "}{w.name}
                    </li>
                  );
                })}
                {gym.exercises.map(e => {
                  const key = `${today}|gym|${gym.title}|${e.name}`;
                  return (
                    <li key={key}>
                      <input type="checkbox" checked={!!doneMap[key]} onChange={() => toggle(key)} />
                      {" "}{e.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* ---------- EDIT ---------- */}
      <hr />

<h3>Gym Day Library</h3>
<button
  onClick={() => {
    const id = crypto.randomUUID();
    setGymDayLibrary(prev => ({
      ...prev,
      [id]: { title: "Workout", warmup: [], exercises: [] },
    }));
  }}
>
  + Create Gym Day
</button>

{Object.entries(gymDayLibrary).map(([id, g]) => (
  <div key={id} style={{ border: "1px solid #ccc", padding: 8, margin: 8 }}>
    <input
      value={g.title}
      onChange={e =>
        setGymDayLibrary(prev => ({
          ...prev,
          [id]: { ...prev[id], title: e.target.value },
        }))
      }
    />

    <button
      onClick={() =>
        setGymDayLibrary(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        })
      }
    >
      Delete Library Entry
    </button>

    <h4>Warmup</h4>
    <button
      onClick={() =>
        setGymDayLibrary(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            warmup: [...prev[id].warmup, { name: "Warmup", reps: "10" }],
          },
        }))
      }
    >
      + Warmup
    </button>

    {g.warmup.map((w, i) => (
      <div key={i}>
        <input
          value={w.name}
          onChange={e => {
            const copy = { ...gymDayLibrary };
            copy[id].warmup[i].name = e.target.value;
            setGymDayLibrary(copy);
          }}
        />
        <input
          value={w.reps}
          onChange={e => {
            const copy = { ...gymDayLibrary };
            copy[id].warmup[i].reps = e.target.value;
            setGymDayLibrary(copy);
          }}
        />
      </div>
    ))}

    <h4>Exercises</h4>
    <button
      onClick={() =>
        setGymDayLibrary(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            exercises: [...prev[id].exercises, { name: "Exercise", sets: 3, reps: "10" }],
          },
        }))
      }
    >
      + Exercise
    </button>

    {g.exercises.map((e, i) => (
      <div key={i}>
        <input
          value={e.name}
          onChange={ev => {
            const copy = { ...gymDayLibrary };
            copy[id].exercises[i].name = ev.target.value;
            setGymDayLibrary(copy);
          }}
        />
        <input
          value={e.sets}
          onChange={ev => {
            const copy = { ...gymDayLibrary };
            copy[id].exercises[i].sets = ev.target.value;
            setGymDayLibrary(copy);
          }}
        />
        <input
          value={e.reps}
          onChange={ev => {
            const copy = { ...gymDayLibrary };
            copy[id].exercises[i].reps = ev.target.value;
            setGymDayLibrary(copy);
          }}
        />
      </div>
    ))}
  </div>
))}

<hr />

<h3>Active 14-Day Gym Regime</h3>
<button
  onClick={() =>
    setActiveGymRegime(Array.from({ length: 14 }, () => []))
  }
>
  🔁 Gym Regime Change
</button>

{activeGymRegime.map((ids, dayIndex) => (
  <div key={dayIndex} style={{ marginBottom: 12 }}>
    <strong>Day {dayIndex + 1}</strong>

    {Object.entries(gymDayLibrary).map(([id, gym]) => (
      <label key={id} style={{ display: "block" }}>
        <input
          type="checkbox"
          checked={ids.includes(id)}
          onChange={() =>
            setActiveGymRegime(prev => {
              const copy = prev.map(arr => [...arr]);
              if (copy[dayIndex].includes(id)) {
                copy[dayIndex] = copy[dayIndex].filter(x => x !== id);
              } else {
                copy[dayIndex].push(id);
              }
              return copy;
            })
          }
        />
        {" "}{gym.title}
      </label>
    ))}
  </div>
))}

          <h3>Classes</h3>
          <button onClick={() =>
            setClassTemplates(p => [...p, {
              id: crypto.randomUUID(),
              title: "New Class",
              day: 1,
              startTime: "09:00",
              location: "Room"
            }])
          }>+ Add Class</button>

          {classTemplates.map((c,i) => (
            <div key={c.id}>
              <input value={c.title} onChange={e => {
                const cp=[...classTemplates]; cp[i].title=e.target.value; setClassTemplates(cp);
              }} />
              <input type="time" value={c.startTime} onChange={e => {
                const cp=[...classTemplates]; cp[i].startTime=e.target.value; setClassTemplates(cp);
              }} />
              <button onClick={() =>
                setClassTemplates(p => p.filter(x => x.id !== c.id))
              }>Delete</button>
            </div>
          ))}

      {/* ---------- STATS ---------- */}
      {view === "stats" && <StatsDashboard doneMap={doneMap} />}
    </div>
  );
}

/* ================= COMPONENTS ================= */
function ClassRow({ c, today, doneMap, toggle }) {
  const key = `${today}|${c.id}`;
  return (
    <div>
      <input type="checkbox" checked={!!doneMap[key]} onChange={() => toggle(key)} />
      {" "}{c.title} — {c.startTime} ({c.location})
    </div>
  );
}

function StatsDashboard({ doneMap }) {
  const today = new Date();
  function day(n) {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  let cT=0,cD=0,gT=0,gD=0,eT=0,eD=0;

  for (let i=0;i<7;i++) {
    const d=day(i);
    Object.keys(doneMap).forEach(k => {
      if (!k.startsWith(d)) return;
      if (k.endsWith("|gym")) { gT++; if (doneMap[k]) gD++; }
      else if (k.includes("|gym|")) { eT++; if (doneMap[k]) eD++; }
      else { cT++; if (doneMap[k]) cD++; }
    });
  }

  return (
    <ul>
      <li>📘 Class attendance: {pct(cD,cT)}%</li>
      <li>🏋️ Gym adherence: {pct(gD,gT)}%</li>
      <li>💪 Exercise completion: {pct(eD,eT)}%</li>
    </ul>
  );
}
function pct(a,b){ return b?Math.round(a*100/b):0; }
