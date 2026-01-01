import React, { useState, useEffect } from "react";
import { useTimetable } from "../hooks/useTimetable";
import { useGym } from "../hooks/useGym";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../hooks/useSettings";
import { supabase } from "../lib/supabase";
import { Clock, MapPin, CheckCircle2, XCircle, CalendarDays, Dumbbell, TrendingUp, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { todaysClasses, isLoaded: timetableLoaded } = useTimetable();
  const { getTodayCycleIndex, schedule, templates, isLoaded: gymLoaded } = useGym(); 
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (user) {
      supabase.from('user_data').select('attendance_data').eq('user_id', user.id).single()
        .then(({ data }) => setAttendance(data?.attendance_data || {}));
    }
  }, [user]);

  const markAttendance = async (className, status) => {
    const current = attendance[className] || { present: 0, total: 0, history: [] };
    const presentCount = typeof current === 'number' ? current : current.present;
    const totalCount = typeof current === 'number' ? current : current.total;
    const history = typeof current === 'number' ? [] : current.history;

    const updatedRecord = {
      present: presentCount + (status === 'present' ? 1 : 0),
      total: totalCount + 1,
      history: [...history, { date: new Date().toISOString(), status }]
    };

    const updated = { ...attendance, [className]: updatedRecord };
    setAttendance(updated);
    await supabase.from('user_data').update({ attendance_data: updated }).eq('user_id', user.id);
  };

  const todayIndex = getTodayCycleIndex();
  const todaySchedule = schedule.find(s => s.dayIndex === todayIndex + 1);
  const todayTemplate = templates.find(t => t.id === todaySchedule?.templateId);

  if (!timetableLoaded || !gymLoaded) return <div className="h-full flex items-center justify-center text-text-muted font-heading animate-pulse">Initializing Axis...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-8 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-text mb-1">
            Hola, <span className="text-accent">{settings?.userName || "Druhin"}</span> <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-text-muted text-sm font-medium">Your daily briefing.</p>
        </div>
        <Link to="/insights" className="premium-button bg-surface hover:bg-surface-hover !text-text shadow-sm border border-border !text-xs !py-2 !px-4">
          <TrendingUp size={14} className="text-accent"/> View Insights
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LECTURE COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-muted font-heading">Academic Schedule</h2>
          </div>
          
          <div className="space-y-3">
            {todaysClasses.length > 0 ? todaysClasses.map((cls, i) => (
              <div key={i} className="group relative bg-surface border border-border p-4 rounded-xl transition-all hover:border-accent/40 hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">{cls.name}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${cls.type === 'Lecture' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {cls.type === 'Lecture' ? 'LEC' : 'TUT'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[11px] text-text-muted mb-3 font-mono">
                  <span className="flex items-center gap-1"><Clock size={12} className="text-accent"/> {cls.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-accent"/> {cls.room}</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => markAttendance(cls.name, 'present')} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold flex justify-center items-center gap-1">
                    <CheckCircle2 size={12}/> Present
                  </button>
                  <button onClick={() => markAttendance(cls.name, 'absent')} className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-bold flex justify-center items-center gap-1">
                    <XCircle size={12}/> Absent
                  </button>
                </div>
              </div>
            )) : (
              <div className="h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl bg-surface/50">
                <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                    <CalendarDays className="text-text-muted" size={20}/>
                </div>
                <p className="text-xs font-medium text-text-muted">No classes scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* GYM COLUMN (8 cols) - COMPACT WEB LAYOUT */}
        <div className="lg:col-span-8 flex flex-col">
           <div className="flex items-center gap-2 mb-4">
            <Sparkles size={12} className="text-accent"/>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-muted font-heading">Physical Training</h2>
          </div>

          <div className="relative flex-1 bg-surface border border-border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 overflow-hidden">
            
            {/* Left Panel: Info & Actions */}
            <div className="md:w-1/3 flex flex-col justify-between relative z-10">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider mb-4">
                    <TrendingUp size={10}/> Cycle Day {todayIndex + 1}
                  </div>
                  
                  <h3 className="text-4xl font-black text-text tracking-tight leading-tight mb-2">
                    {todayTemplate ? todayTemplate.name : "Rest Day"}
                  </h3>
                  
                  <p className="text-xs text-text-muted font-medium">
                    {todayTemplate 
                      ? `${todayTemplate.exercises?.length || 0} exercises planned.` 
                      : "Active recovery recommended today."}
                  </p>
               </div>

               {/* Background Watermark (Compact) */}
               <div className="absolute top-10 -left-6 text-[10rem] font-black text-text opacity-[0.03] select-none font-heading leading-none -z-10 pointer-events-none">
                  {(todayIndex + 1).toString().padStart(2, '0')}
               </div>

               {todayTemplate ? (
                 <button className="mt-6 w-full py-3 bg-accent hover:opacity-90 text-bg font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
                   <Play size={16} fill="currentColor"/> Start Session
                 </button>
               ) : (
                 <div className="mt-6 p-4 bg-surface-hover rounded-xl border border-border">
                    <div className="flex items-center gap-2 text-text-muted">
                        <Dumbbell size={16}/>
                        <span className="text-xs">Rest is when muscles grow.</span>
                    </div>
                 </div>
               )}
            </div>

            {/* Right Panel: Exercise Grid */}
            <div className="md:w-2/3 border-l border-border/50 pl-0 md:pl-6">
              {todayTemplate ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-full content-start overflow-y-auto pr-1 max-h-[400px] custom-scrollbar">
                  {todayTemplate.exercises?.map((ex, i) => (
                    <div key={i} className="flex flex-col p-3 bg-bg rounded-lg border border-border hover:border-accent/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-text-muted font-mono">{String(i + 1).padStart(2, '0')}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-accent transition-colors"></div>
                      </div>
                      <span className="font-bold text-text text-xs mb-1 line-clamp-1" title={ex.name}>{ex.name}</span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted mt-auto">
                        <span className="text-accent font-bold">{ex.sets}</span> Sets
                        <span className="text-border">/</span>
                        <span className="text-accent font-bold">{ex.reps}</span> Reps
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted gap-3 opacity-50 min-h-[200px]">
                  <Dumbbell size={32}/>
                  <p className="text-xs">No workout scheduled</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}