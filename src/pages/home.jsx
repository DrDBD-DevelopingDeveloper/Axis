import { daysBetween } from "../utils/time";

const DAY_MAP = {
  0: "SU",
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA",
};

export default function Home({
  subjects = [],
  gymLibrary = {},
  gymRegime = [],
  doneMap = {},
  toggleDone,
  navigate,
}) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dayCode = DAY_MAP[today.getDay()];

  const prettyDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* ---------- Upcoming Exams ---------- */
  const upcomingExams = subjects
    .flatMap(sub =>
      (sub.exams || []).map(exam => ({
        ...exam,
        code: sub.code,
      }))
    )
    .filter(exam => {
      const d = daysBetween(todayStr, exam.date);
      return d >= 0 && d <= 14;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  /* ---------- Today’s Classes ---------- */
  const todaysClasses = subjects
    .map(sub => {
      const slots = Object.values(sub.sections || {})
        .flatMap(sec => sec.slots || [])
        .filter(slot => slot.day === dayCode);

      if (slots.length === 0) return null;

      return { code: sub.code, slots };
    })
    .filter(Boolean);

  /* ---------- Today’s Gym ---------- */
  const cycleAnchor = new Date("2025-01-01");
  const diffDays = Math.floor((today - cycleAnchor) / 86400000);
  const gymDayIndex = ((diffDays % 14) + 14) % 14;

  const todaysGyms = (gymRegime[gymDayIndex] || [])
    .map(id => gymLibrary[id])
    .filter(Boolean);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <div className="section">
        <div className="card">
          <h2>Today</h2>
          <div className="small">{prettyDate}</div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              className="primary"
              onClick={() => navigate("timetable")}
            >
              Open Timetable
            </button>

            <button onClick={() => navigate("gym")}>
              Open Gym
            </button>
          </div>
        </div>
      </div>

      {/* ---------- UPCOMING EXAMS ---------- */}
      {upcomingExams.length > 0 && (
        <div className="section">
          <h3>Upcoming Exams</h3>
          <div className="card exam">
            {upcomingExams.map((exam, i) => (
              <div key={i} className="row-between">
                <div>
                  <strong>{exam.code}</strong>
                  <div className="small">{exam.title}</div>
                </div>
                <div className="small">
                  {exam.date} • {exam.startTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- TODAY’S SCHEDULE ---------- */}
      <div className="section">
        <h3>Today’s Schedule</h3>

        {todaysClasses.length === 0 && (
          <div className="card small">No classes today</div>
        )}

        {todaysClasses.map(subject => (
          <div key={subject.code} className="card">
            <strong>{subject.code}</strong>

            {subject.slots.map((slot, idx) => {
              const slotKey = `${todayStr}|${subject.code}|${slot.day}|${slot.startTime}`;

              return (
                <label key={idx} className="row small">
                  <input
                    type="checkbox"
                    checked={!!doneMap[slotKey]}
                    onChange={() => toggleDone(slotKey)}
                  />
                  {slot.startTime}–{slot.endTime} • {slot.location}
                </label>
              );
            })}
          </div>
        ))}
      </div>

      {/* ---------- GYM ---------- */}
      <div className="section">
        <h3>Gym Today</h3>

        {todaysGyms.length === 0 && (
          <div className="card small">Rest day</div>
        )}

        {todaysGyms.map((gym, i) => (
          <div key={i} className="card">
            <strong>{gym.title}</strong>

            {gym.warmup?.length > 0 && (
              <div className="small">
                Warm-up: {gym.warmup.join(", ")}
              </div>
            )}

            {gym.exercises?.length > 0 && (
              <div className="small">
                Exercises: {gym.exercises.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
