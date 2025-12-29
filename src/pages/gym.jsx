export default function Gym({ gymDayLibrary, setGymDayLibrary, activeGymRegime, setActiveGymRegime }) {
    return (
      <>
        <h2>Gym Regime</h2>
  
        <button onClick={()=>setActiveGymRegime(Array.from({length:14},()=>[]))}>
          Reset Regime
        </button>
  
        <h3>Library</h3>
        <button onClick={()=>{
          const id=crypto.randomUUID();
          setGymDayLibrary(p=>({...p,[id]:{title:"Workout",warmup:[],exercises:[]}}));
        }}>
          + Gym Day
        </button>
  
        {Object.entries(gymDayLibrary).map(([id,g])=>(
          <div key={id} className="card">
            <input
              value={g.title}
              onChange={e=>setGymDayLibrary(p=>({...p,[id]:{...p[id],title:e.target.value}}))}
            />
          </div>
        ))}
  
        <h3>14-Day Cycle</h3>
        {activeGymRegime.map((ids,i)=>(
          <div key={i} className="card">
            <strong>Day {i+1}</strong>
            {Object.entries(gymDayLibrary).map(([id,g])=>(
              <label key={id} style={{display:"block"}}>
                <input
                  type="checkbox"
                  checked={ids.includes(id)}
                  onChange={()=>{
                    setActiveGymRegime(p=>{
                      const c=p.map(a=>[...a]);
                      c[i]=c[i].includes(id)?c[i].filter(x=>x!==id):[...c[i],id];
                      return c;
                    });
                  }}
                />
                {" "}{g.title}
              </label>
            ))}
          </div>
        ))}
      </>
    );
  }
  