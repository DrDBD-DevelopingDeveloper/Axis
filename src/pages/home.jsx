import CircularStat from "../components/CircularStat";
import ClassRow from "../components/ClassRow";
import { computeStats } from "../utils/stats";
import { timeToMinutes } from "../utils/time";

export default function Home({ classes, doneMap, toggle }) {
  const today=new Date().toISOString().slice(0,10);
  const dow=new Date().getDay();
  const now=new Date().getHours()*60+new Date().getMinutes();

  const todays=classes
    .filter(c=>c.day===dow)
    .sort((a,b)=>timeToMinutes(a.startTime)-timeToMinutes(b.startTime));

  const stats=computeStats(doneMap);

  return (
    <>
      <h2>{today}</h2>
      <div style={{display:"flex",justifyContent:"center"}}>
        <CircularStat label="Classes" value={stats.classPct} color="#4caf50"/>
        <CircularStat label="Gym" value={stats.gymPct} color="#2196f3"/>
        <CircularStat label="Exercises" value={stats.exercisePct} color="#ff9800"/>
      </div>

      {todays.map(c=>(
        <ClassRow
          key={c.id}
          c={c}
          checked={!!doneMap[`${today}|${c.id}`]}
          toggle={()=>toggle(`${today}|${c.id}`)}
        />
      ))}
    </>
  );
}
