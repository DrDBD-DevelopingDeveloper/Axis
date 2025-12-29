export default function TimeColumn({ hours }) {
  return (
    <div
      className="time-col"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${hours.length}, 60px)`,
      }}
    >
      {hours.map(t => {
        const h = String(Math.floor(t / 60)).padStart(2, "0");
        return (
          <div key={t} className="time-cell">
            {h}:00
          </div>
        );
      })}
    </div>
  );
}
