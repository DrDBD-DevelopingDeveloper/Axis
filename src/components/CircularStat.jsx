export default function CircularStat({ label, value, color }) {
    const r=40,c=2*Math.PI*r,o=c-(value/100)*c;
    return (
      <svg width="100" height="100">
        <circle cx="50" cy="50" r={r} stroke="#555" strokeWidth="8" fill="none"/>
        <circle
          cx="50" cy="50" r={r}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={o}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="55" textAnchor="middle">{value}%</text>
        <text x="50" y="70" textAnchor="middle">{label}</text>
      </svg>
    );
  }
  