import { parseCSV, dayStringToIndex } from "../utils/csv";
import { exportICS, importICS } from "../utils/ics";

export default function Timetable({ classes, setClasses }) {
  return (
    <>
      <h2>Timetable</h2>

      <button onClick={()=>exportICS(classes)}>Export .ics</button>

      <input type="file" accept=".ics" onChange={e=>{
        const f=e.target.files[0];
        if(!f) return;
        const r=new FileReader();
        r.onload=ev=>{
          const evs=importICS(ev.target.result);
          setClasses(p=>[...p,...evs.map(e=>({
            id:crypto.randomUUID(),
            day:1,
            location:"",
            ...e
          }))]);
        };
        r.readAsText(f);
      }}/>

      <input type="file" accept=".csv" onChange={e=>{
        const f=e.target.files[0];
        if(!f) return;
        const r=new FileReader();
        r.onload=ev=>{
          const rows=parseCSV(ev.target.result);
          setClasses(p=>[...p,...rows.map(r=>({
            id:crypto.randomUUID(),
            title:r.title,
            day:dayStringToIndex(r.day),
            startTime:r.startTime,
            location:r.location
          }))]);
        };
        r.readAsText(f);
      }}/>

      {classes.map((c,i)=>(
        <div key={c.id} className="card">
          {c.title} — {c.startTime}
        </div>
      ))}
    </>
  );
}
