export default function SlotBlock({
  slot,
  rowStart,
  rowSpan,
  done,
  onToggle,
}) {
  return (
    <div
      className={`week-slot ${done ? "done" : ""}`}
      style={{
        gridRow: `${rowStart} / span ${rowSpan}`,
        borderLeftColor: slot.color,
      }}
      onClick={onToggle}
    >
      <strong>{slot.code}</strong>
      <div className="small">
        {slot.startTime}–{slot.endTime}
      </div>
      <div className="small">{slot.location}</div>
      {done && <div className="week-slot-check">✔</div>}
    </div>
  );
}
