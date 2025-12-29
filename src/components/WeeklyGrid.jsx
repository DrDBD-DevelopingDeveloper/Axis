import SlotBlock from "./SlotBlock";
import TimeColumn from "./TimeColumn";

const DAYS = ["MO", "TU", "WE", "TH", "FR"];
const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const toMinutes = t => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function WeeklyGrid({
  subjects,
  doneMap,
  toggleDone,
}) {
  // ---------- FLATTEN ALL SLOTS ----------
  const slots = [];

  subjects.forEach(sub => {
    Object.values(sub.sections || {}).forEach(sec => {
      sec.slots.forEach(s => {
        slots.push({
          code: sub.code,
          section: sec.section,
          instructor: sec.instructor,
          day: s.day,
          startMin: toMinutes(s.startTime),
          endMin: toMinutes(s.endTime),
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          color: sub.color || "#3b82f6",
        });
      });
    });
  });

  if (slots.length === 0) {
    return <div className="card small">No classes</div>;
  }

  // ---------- TIME RANGE ----------
  const minTime =
    Math.floor(Math.min(...slots.map(s => s.startMin)) / 60) * 60;
  const maxTime =
    Math.ceil(Math.max(...slots.map(s => s.endMin)) / 60) * 60;

  const hours = [];
  for (let t = minTime; t <= maxTime; t += 60) hours.push(t);

  // ---------- GROUP BY DAY + START HOUR ----------
  const grouped = {};
  slots.forEach(s => {
    const hourBucket = Math.floor((s.startMin - minTime) / 60);
    const key = `${s.day}|${hourBucket}`;
    grouped[key] ||= [];
    grouped[key].push(s);
  });

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="week-grid-root">
      {/* HEADER */}
      <div className="week-grid-header">
        <div />
        {LABELS.map(l => (
          <div key={l} className="week-grid-day">
            {l}
          </div>
        ))}
      </div>

      {/* BODY */}
      <div
        className="week-grid-body"
        style={{
          gridTemplateRows: `repeat(${hours.length}, 60px)`,
        }}
      >
        <TimeColumn hours={hours} />

        {DAYS.map(day => (
          <div
            key={day}
            className="week-grid-col"
            style={{
              gridTemplateRows: `repeat(${hours.length}, 60px)`,
            }}
          >
            {hours.map((_, rowIdx) => {
              const key = `${day}|${rowIdx}`;
              const bucket = grouped[key] || [];

              if (bucket.length === 0) return null;

              return (
                <div
                  key={key}
                  style={{ gridRow: rowIdx + 1 }}
                >
                  {bucket.map((s, i) => {
                    const slotKey = `${todayStr}|${s.code}|${s.day}|${s.startTime}`;
                    return (
                      <SlotBlock
                        key={i}
                        slot={s}
                        done={!!doneMap[slotKey]}
                        onToggle={() => toggleDone(slotKey)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
