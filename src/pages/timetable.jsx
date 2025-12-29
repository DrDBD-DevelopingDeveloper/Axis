import { useState } from "react";
import WeeklyGrid from "../components/WeeklyGrid";
import { importICS } from "../utils/ics";

const DAY_LABELS = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
};

export default function Timetable({
  subjects,
  setSubjects,
  doneMap,
  toggleDone,
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  // -------- IMPORT HANDLER (STRICT OVERWRITE) --------
  function handleImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const imported = importICS(e.target.result);
      setSubjects(imported); // overwrite old data
    };
    reader.readAsText(file);
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <section className="section">
        <div className="card">
          <h2>Timetable</h2>
          <div className="small">
            Weekly academic schedule (Mon–Fri)
          </div>
        </div>
      </section>

      {/* ================= IMPORT ================= */}
      <section className="section">
        <h3>Import</h3>
        <div className="card">
          <input
            type="file"
            accept=".ics"
            onChange={e => handleImport(e.target.files[0])}
          />
          <div className="small" style={{ marginTop: 6 }}>
            Strict import: invalid or ambiguous events are dropped
          </div>
        </div>
      </section>

      {/* ================= WEEK NAV ================= */}
      <section className="section">
        <div className="row-between">
          <button onClick={() => setWeekOffset(w => w - 1)}>
            ← Previous Week
          </button>
          <button onClick={() => setWeekOffset(0)}>
            This Week
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)}>
            Next Week →
          </button>
        </div>
      </section>

      {/* ================= WEEKLY GRID ================= */}
      <section className="section timetable-grid-sandbox">
        <WeeklyGrid
          subjects={subjects}
          doneMap={doneMap}
          toggleDone={toggleDone}
          weekOffset={weekOffset}
        />
      </section>

      {/* ================= SUBJECTS ================= */}
      <section className="section">
        <h3>Subjects</h3>

        {subjects.length === 0 && (
          <div className="card small">No subjects imported</div>
        )}

        {subjects.map(sub => {
          // ---- derive timings ----
          const timings = {};
          Object.values(sub.sections || {}).forEach(sec => {
            sec.slots.forEach(s => {
              timings[s.day] ||= [];
              timings[s.day].push(`${s.startTime}–${s.endTime}`);
            });
          });

          return (
            <div key={sub.id} className="card">
              <div className="row-between">
                <strong>{sub.code}</strong>
                <button
                  onClick={() =>
                    setSubjects(prev =>
                      prev.filter(x => x.id !== sub.id)
                    )
                  }
                >
                  Delete
                </button>
              </div>

              {/* Timings */}
              {Object.keys(timings).length > 0 && (
                <div className="small" style={{ marginTop: 6 }}>
                  {Object.entries(timings).map(([day, ts]) => (
                    <div key={day}>
                      {DAY_LABELS[day]}: {ts.join(", ")}
                    </div>
                  ))}
                </div>
              )}

              {/* Sections */}
              <div className="small" style={{ marginTop: 6 }}>
                {Object.values(sub.sections || {}).map(sec => (
                  <div key={sec.section}>
                    {sec.section} —{" "}
                    {sec.instructor || "Instructor TBA"}
                  </div>
                ))}
              </div>

              {/* Exams */}
              {sub.exams?.length > 0 && (
                <div className="small" style={{ marginTop: 6 }}>
                  Exams:
                  {sub.exams.map((e, i) => (
                    <div key={i}>
                      {e.title} — {e.date}{" "}
                      {e.startTime}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
