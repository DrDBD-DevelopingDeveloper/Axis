export default function CircularStat({ value }) {
  const r = 40, c = 2 * Math.PI * r, o = c - (value / 100) * c;
  return (
    <svg width="100" height="100">
      <circle cx="50" cy="50" r={r} stroke="#334155" strokeWidth="8" fill="none" />
      <circle
        cx="50" cy="50"
        r={r}
        stroke="var(--accent)"
        strokeWidth="8"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={o}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="55" textAnchor="middle">{value}%</text>
    </svg>
  );
}
