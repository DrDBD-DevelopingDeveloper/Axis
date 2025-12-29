import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Gym from "./pages/Gym";
import Timetable from "./pages/Timetable";
import { load, save } from "./utils/storage";
import "./index.css";

export default function App() {
  const [view,setView]=useState("home");
  const [theme,setTheme]=useState(load("theme","light"));
  const [classes,setClasses]=useState(load("classes",[]));
  const [gymDayLibrary,setGymDayLibrary]=useState(load("gymLib",{}));
  const [activeGymRegime,setActiveGymRegime]=useState(load("gymReg",Array.from({length:14},()=>[])));
  const [doneMap,setDoneMap]=useState(load("done",{}));

  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    save("theme",theme);
  },[theme]);

  useEffect(()=>save("classes",classes),[classes]);
  useEffect(()=>save("gymLib",gymDayLibrary),[gymDayLibrary]);
  useEffect(()=>save("gymReg",activeGymRegime),[activeGymRegime]);
  useEffect(()=>save("done",doneMap),[doneMap]);

  const toggle=k=>setDoneMap(p=>({...p,[k]:!p[k]}));

  return (
    <>
      <header>
        <button onClick={()=>setView("home")}>Home</button>
        <button onClick={()=>setView("gym")}>Gym</button>
        <button onClick={()=>setView("timetable")}>Timetable</button>
        <button onClick={()=>setTheme(t=>t==="light"?"dark":"light")}>
          {theme==="light"?"🌙":"☀️"}
        </button>
      </header>

      {view==="home" && <Home classes={classes} doneMap={doneMap} toggle={toggle}/>}
      {view==="gym" && (
        <Gym
          gymDayLibrary={gymDayLibrary}
          setGymDayLibrary={setGymDayLibrary}
          activeGymRegime={activeGymRegime}
          setActiveGymRegime={setActiveGymRegime}
        />
      )}
      {view==="timetable" && (
        <Timetable classes={classes} setClasses={setClasses}/>
      )}
    </>
  );
}
