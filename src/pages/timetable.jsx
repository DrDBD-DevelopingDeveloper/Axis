import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Upload, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import ICAL from 'ical.js';

export default function Timetable() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [uploading, setUploading] = useState(false);

  // Helper: Get the Monday of the current week
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // 1. Fetch Events for the selected week
  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const startStr = currentWeekStart.toISOString();
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 7);
      const endStr = end.toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startStr)
        .lt('start_time', endStr)
        .order('start_time', { ascending: true });

      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);
    };

    fetchEvents();
  }, [user, currentWeekStart]);

  // 2. Handle .ics Upload & Expansion
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jcalData = ICAL.parse(event.target.result);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        const newEvents = [];

        // Generate events for the next 4 months
        const limit = new Date();
        limit.setMonth(limit.getMonth() + 4);

        vevents.forEach((ev) => {
          const eventObj = new ICAL.Event(ev);
          const summary = eventObj.summary;
          const location = eventObj.location || 'TBD';
          const type = summary.toLowerCase().includes('lab') ? 'Lab' : 
                       (summary.toLowerCase().includes('exam') ? 'Exam' : 'Lecture');

          if (eventObj.isRecurring()) {
            const iterator = eventObj.iterator();
            let next;
            while ((next = iterator.next()) && next.toJSDate() < limit) {
              const start = next.toJSDate();
              const end = eventObj.endDate.toJSDate();
              // Calculate duration to set correct end time for occurrence
              const duration = eventObj.duration.toSeconds() * 1000;
              const endTimestamp = start.getTime() + duration;

              newEvents.push({
                user_id: user.id,
                title: summary,
                start_time: start.toISOString(),
                end_time: new Date(endTimestamp).toISOString(),
                location: location,
                type: type,
                status: 'pending'
              });
            }
          } else {
            // Single event
            newEvents.push({
              user_id: user.id,
              title: summary,
              start_time: eventObj.startDate.toJSDate().toISOString(),
              end_time: eventObj.endDate.toJSDate().toISOString(),
              location: location,
              type: type,
              status: 'pending'
            });
          }
        });

        // Clear old events (optional, risky if you want to keep history)
        // await supabase.from('events').delete().eq('user_id', user.id); 

        // Batch Insert
        const { error } = await supabase.from('events').insert(newEvents);
        if (error) throw error;
        
        alert(`Success! Imported ${newEvents.length} classes.`);
        window.location.reload();

      } catch (err) {
        console.error(err);
        alert("Failed to parse file. Make sure it is a valid .ics file.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // 3. Mark Attendance Logic
  const updateStatus = async (id, status) => {
    // Optimistic Update
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status } : ev));
    // DB Update
    await supabase.from('events').update({ status }).eq('id', id);
  };

  // 4. Navigation Helpers
  const changeWeek = (offset) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentWeekStart(newDate);
  };

  // Group events by Day for the Grid
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const eventsByDay = Array(7).fill([]).map(() => []);

  events.forEach(ev => {
    const date = new Date(ev.start_time);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Mon=0, Sun=6
    eventsByDay[dayIndex] = [...eventsByDay[dayIndex], ev];
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black">Timetable</h1>
          <p className="text-sm opacity-70">
            Week of {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-2">
           {/* Week Nav */}
          <div className="flex items-center bg-[var(--app-surface)] rounded-lg border border-[var(--app-border)]">
            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-[var(--app-surface-hover)]"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))} className="px-3 text-xs font-bold">Today</button>
            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-[var(--app-surface-hover)]"><ChevronRight size={20}/></button>
          </div>

          {/* Upload Button */}
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white cursor-pointer transition-all ${uploading ? 'bg-gray-500' : 'bg-[var(--app-accent)] hover:opacity-90'}`}>
            <Upload size={16}/> {uploading ? "Importing..." : "Sync .ics"}
            <input type="file" accept=".ics" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {days.map((dayName, idx) => {
          const dayEvents = eventsByDay[idx];
          // Don't hide empty days if we want a full week view, or hide them:
          // if (dayEvents.length === 0) return null; 

          return (
            <div key={dayName} className="flex flex-col gap-3">
              <h3 className="font-bold text-sm uppercase opacity-50 tracking-wider text-center mb-2">{dayName}</h3>
              
              {dayEvents.length === 0 && (
                <div className="text-center py-10 opacity-20 text-xs border border-dashed border-[var(--app-border)] rounded-xl">
                  No Classes
                </div>
              )}

              {dayEvents.map(ev => {
                const startTime = new Date(ev.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const isPast = new Date(ev.end_time) < new Date();
                
                return (
                  <div key={ev.id} className={`p-3 rounded-xl border transition-all ${
                    ev.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/50' :
                    ev.status === 'absent' ? 'bg-rose-500/10 border-rose-500/50' :
                    ev.status === 'cancelled' ? 'bg-gray-500/10 border-gray-500/50 opacity-60' :
                    'bg-[var(--app-surface)] border-[var(--app-border)]'
                  }`}>
                    {/* Time & Location */}
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono font-bold opacity-70">{startTime}</span>
                      <span className="text-[10px] bg-[var(--app-bg)] px-1.5 py-0.5 rounded text-[var(--app-text-muted)] border border-[var(--app-border)]">
                        {ev.location}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="font-bold text-sm leading-tight mb-3">
                      {ev.title}
                    </div>

                    {/* Actions (Only show for pending/past classes) */}
                    <div className="flex gap-2 justify-end">
                      {ev.status === 'present' ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                          <CheckCircle size={14}/> Present
                        </div>
                      ) : ev.status === 'absent' ? (
                         <div className="flex items-center gap-1 text-xs font-bold text-rose-500">
                          <XCircle size={14}/> Missed
                        </div>
                      ) : (
                        // Pending Actions
                        <>
                          <button 
                            onClick={() => updateStatus(ev.id, 'present')}
                            className="p-1.5 rounded-md hover:bg-emerald-500 hover:text-white text-emerald-500 transition-colors"
                            title="Mark Present"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => updateStatus(ev.id, 'absent')}
                            className="p-1.5 rounded-md hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                            title="Mark Absent"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      
                      {/* Undo Button (Small dot) */}
                      {ev.status !== 'pending' && (
                        <button 
                          onClick={() => updateStatus(ev.id, 'pending')} 
                          className="text-[10px] opacity-40 hover:opacity-100 underline ml-2"
                        >
                          undo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}