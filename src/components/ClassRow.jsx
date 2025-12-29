export default function ClassRow({ c, checked, toggle }) {
    return (
      <div className="card">
        <input type="checkbox" checked={checked} onChange={toggle}/>
        {" "}{c.title} — {c.startTime} ({c.location})
      </div>
    );
  }
  