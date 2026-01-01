import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Clock, CalendarDays, Upload } from "lucide-react";
import { parseICS } from "../utils/ics";
import { useTimetable } from "../hooks/useTimetable"; // Import hook

export default function Timetable() {
  const { user } = useAuth();
  // Use the hook for initial data, but allow local overrides for file upload
  const { timetable: initialTimetable, exams: initialExams } = useTimetable();
  const [timetable, setTimetable] = useState({});
  const [exams, setExams] = useState([]);

  // Sync local state with hook data when loaded
  React.useEffect(() => {
    if (Object.keys(initialTimetable).length > 0) setTimetable(initialTimetable);
    if (initialExams.length > 0) setExams(initialExams);
  }, [initialTimetable, initialExams]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const text = await file.text();
    const parsedData = parseICS(text); 
    
    await supabase.from('user_data').upsert({ 
      user_id: user.id, 
      timetable_json: parsedData 
    });
    
    setTimetable(parsedData.timetable);
    setExams(parsedData.exams);
    window.location.reload(); // Force reload to ensure Home page gets new data
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">Timetable</h1>
        <label className="flex items-center gap-2 cursor-pointer bg-[var(--app-accent)] px-4 py-2 rounded-lg font-bold text-white hover:opacity-90">
          <Upload size={16}/> Sync .ics
          <input type="file" accept=".ics" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {exams.length > 0 && (
        <div className="premium-card p-6 border-l-4 border-rose-500 bg-[var(--app-surface)]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-500"><CalendarDays/> Upcoming Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((ex, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-[var(--app-bg)] rounded-lg">
                <span className="font-bold text-sm">{ex.name}</span>
                <div className="text-right">
                  <div className="text-xs font-bold">{ex.date}</div>
                  <div className="text-[10px] opacity-70">{ex.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((dayName, index) => {
          const dayClasses = timetable[index + 1] || timetable[String(index + 1)] || [];
          if (dayClasses.length === 0) return null;
          return (
            <div key={index} className="premium-card p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-4">{dayName}</h2>
              <div className="space-y-3">
                {dayClasses.map((cls, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[var(--app-surface-hover)] rounded-lg border border-[var(--app-border)]">
                    <div>
                      <h3 className="font-bold text-xs">{cls.name}</h3>
                      <p className="text-[10px] opacity-70">{cls.room}</p>
                    </div>
                    <div className="text-xs font-mono bg-[var(--app-bg)] px-2 py-1 rounded">
                      {cls.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}