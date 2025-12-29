import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Gym from "./pages/Gym";
import Timetable from "./pages/Timetable";
import { load, save } from "./utils/storage";
import "./index.css";

export default function App() {
  // navigation
  const [view, setView] = useState("home");

  // theme
  const [theme, setTheme] = useState(load("theme", "light"));

  // timetable (subject-centric)
  const [subjects, setSubjects] = useState(load("subjects", []));

  // gym
  const [gymLibrary, setGymLibrary] = useState(load("gymLibrary", {}));
  const [gymRegime, setGymRegime] = useState(
    load("gymRegime", Array.from({ length: 14 }, () => []))
  );

  // attendance / progress
  const [doneMap, setDoneMap] = useState(load("doneMap", {}));

  // ---------- persistence ----------
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save("theme", theme);
  }, [theme]);

  useEffect(() => save("subjects", subjects), [subjects]);
  useEffect(() => save("gymLibrary", gymLibrary), [gymLibrary]);
  useEffect(() => save("gymRegime", gymRegime), [gymRegime]);
  useEffect(() => save("doneMap", doneMap), [doneMap]);

  const toggleDone = key =>
    setDoneMap(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <header>
        <button
          className={view === "home" ? "primary" : ""}
          onClick={() => setView("home")}
        >
          Home
        </button>

        <button
          className={view === "gym" ? "primary" : ""}
          onClick={() => setView("gym")}
        >
          Gym
        </button>

        <button
          className={view === "timetable" ? "primary" : ""}
          onClick={() => setView("timetable")}
        >
          Timetable
        </button>

        <button
          onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      {view === "home" && (
        <Home
          subjects={subjects}
          gymLibrary={gymLibrary}
          gymRegime={gymRegime}
          doneMap={doneMap}
          toggleDone={toggleDone}
          navigate={setView}
        />
      )}

      {view === "gym" && (
        <Gym
          gymLibrary={gymLibrary}
          setGymLibrary={setGymLibrary}
          gymRegime={gymRegime}
          setGymRegime={setGymRegime}
        />
      )}

      {view === "timetable" && (
        <Timetable
          subjects={subjects}
          setSubjects={setSubjects}
        />
      )}
    </>
  );
}
