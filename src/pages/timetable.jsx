import { importICS } from "../utils/ics";

export default function Timetable({ subjects, setSubjects }) {
  return (
    <>
      <h2>Timetable</h2>

      <div className="section">
        <h3>Import</h3>
        <div className="card">
          <input
            type="file"
            accept=".ics"
            onChange={e => {
              const f = e.target.files[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = ev => {
                const imported = importICS(ev.target.result);
                setSubjects(imported);
              };
              r.readAsText(f);
            }}
          />
        </div>
      </div>

      <div className="section">
        <h3>Subjects</h3>

        {subjects.map(sub => (
          <div key={sub.id} className="card">
            <div className="row">
              <strong>{sub.code}</strong>
              <button
                onClick={() =>
                  setSubjects(p => p.filter(s => s.id !== sub.id))
                }
              >
                Delete
              </button>
            </div>

            {Object.values(sub.sections).map(sec => (
              <div key={sec.section} className="small">
                {sec.section}
                {sec.slots.map((s, i) => (
                  <div key={i}>
                    {s.day} {s.startTime}-{s.endTime} ({s.location})
                  </div>
                ))}
              </div>
            ))}

            {sub.exams.length > 0 && (
              <div className="small">
                <strong>Exams:</strong>
                {sub.exams.map((e, i) => (
                  <div key={i}>
                    {e.title} — {e.date}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
