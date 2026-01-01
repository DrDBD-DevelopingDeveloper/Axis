import React, { useState } from "react";
import { useGym } from "../hooks/useGym";
import { useGymHistory } from "../hooks/useGymHistory";
import { Edit2, RotateCcw, Plus, Trash2, Calendar, Dumbbell, ChevronRight, Activity } from "lucide-react";

export default function Gym() {
  const { 
    schedule, templates, getTodayCycleIndex, assignTemplateToDay, 
    updateTemplateName, addExercise, deleteExercise, updateExercise, resetCycle, isLoaded 
  } = useGym();
  
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || null);
  const todayIndex = getTodayCycleIndex();

  if (!isLoaded) return <div className="h-full flex items-center justify-center text-text-muted font-heading animate-pulse">Syncing Gym OS...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 text-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-extrabold text-text mb-2">Gym Routine</h1>
          <p className="text-text-muted flex items-center gap-2">
            <Activity size={16} className="text-accent"/> 
            Managing 14-day microcycle
          </p>
        </div>
        <div className="flex gap-4">
            <button onClick={resetCycle} className="p-3 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20" title="Restart Cycle"><RotateCcw size={20}/></button>
            
            <div className="bg-surface p-1.5 rounded-xl border border-border flex gap-1">
                <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-bg text-text shadow-sm border border-border' : 'text-text-muted hover:text-text'}`}>
                    <Calendar size={16}/> Schedule
                </button>
                <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'editor' ? 'bg-bg text-text shadow-sm border border-border' : 'text-text-muted hover:text-text'}`}>
                    <Edit2 size={16}/> Editor
                </button>
            </div>
        </div>
      </div>

      {/* SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {schedule.map((day) => {
            const isToday = day.dayIndex === todayIndex + 1;
            const assignedTemplate = templates.find(t => t.id === day.templateId);
            
            return (
              <div key={day.dayIndex} className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col h-[180px] group ${isToday ? "bg-surface border-accent shadow-[0_0_30px_-10px_var(--app-accent-glow)] ring-1 ring-accent/50" : "bg-surface border-border hover:border-text-muted"}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${isToday ? "text-accent" : "text-text-muted"}`}>Day {day.dayIndex}</span>
                  {isToday && <span className="bg-accent text-bg text-[9px] font-black px-2 py-0.5 rounded shadow-sm">TODAY</span>}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                    <select 
                      className={`w-full bg-transparent text-lg font-bold outline-none appearance-none cursor-pointer hover:underline underline-offset-4 decoration-accent/30 ${!assignedTemplate ? 'text-text-muted text-sm italic' : 'text-text'}`}
                      value={day.templateId || ""} 
                      onChange={(e) => assignTemplateToDay(day.dayIndex, e.target.value)}
                    >
                      <option value="">Rest & Recover</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                
                {isToday && assignedTemplate && (
                   <button className="w-full py-2 bg-accent text-bg text-[10px] uppercase tracking-wider font-bold rounded-lg hover:opacity-90 transition-colors">Start Session</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EDITOR VIEW */}
      {activeTab === 'editor' && (
        <div className="flex flex-col lg:flex-row gap-8 h-[650px]">
          {/* Sidebar */}
          <div className="lg:w-1/4 bg-surface rounded-2xl border border-border p-4 flex flex-col gap-2 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase text-text-muted mb-2 px-2 font-mono">My Routines</h3>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group ${selectedTemplateId === template.id ? 'bg-bg border-accent text-text' : 'bg-transparent border-transparent text-text-muted hover:bg-bg'}`}
              >
                <span className="font-bold text-sm">{template.name}</span>
                <ChevronRight size={16} className={`transition-transform ${selectedTemplateId === template.id ? 'text-accent translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`}/>
              </button>
            ))}
          </div>

          {/* Main Editor */}
          <div className="lg:w-3/4 bg-surface rounded-2xl border border-border p-8 flex flex-col">
            {selectedTemplateId ? (
              <>
                <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
                   <div className="flex-1">
                       <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block font-mono">Routine Name</label>
                       <input 
                          className="text-4xl font-extrabold bg-transparent outline-none text-text placeholder-text-muted w-full"
                          value={templates.find(t => t.id === selectedTemplateId)?.name}
                          onChange={(e) => updateTemplateName(selectedTemplateId, e.target.value)}
                       />
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {templates.find(t => t.id === selectedTemplateId)?.exercises?.map((ex, i) => (
                    <div key={i} className="flex gap-4 items-center p-4 bg-bg rounded-xl border border-border group hover:border-text-muted transition-colors">
                      <span className="text-text-muted font-mono text-xs w-6">{String(i + 1).padStart(2, '0')}</span>
                      
                      <div className="flex-1">
                        <input className="w-full bg-transparent font-bold text-base outline-none text-text placeholder-text-muted" value={ex.name} onChange={(e) => updateExercise(selectedTemplateId, i, 'name', e.target.value)} placeholder="Exercise Name"/>
                      </div>

                      <div className="w-24 bg-surface rounded-lg p-1 border border-border flex flex-col items-center">
                         <span className="text-[9px] text-text-muted font-bold uppercase">Sets</span>
                        <input className="w-full bg-transparent text-center text-sm font-mono outline-none text-accent font-bold" value={ex.sets} onChange={(e) => updateExercise(selectedTemplateId, i, 'sets', e.target.value)}/>
                      </div>

                      <div className="w-24 bg-surface rounded-lg p-1 border border-border flex flex-col items-center">
                         <span className="text-[9px] text-text-muted font-bold uppercase">Reps</span>
                         <input className="w-full bg-transparent text-center text-sm font-mono outline-none text-accent font-bold" value={ex.reps} onChange={(e) => updateExercise(selectedTemplateId, i, 'reps', e.target.value)}/>
                      </div>

                      <button onClick={() => deleteExercise(selectedTemplateId, i)} className="p-3 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addExercise(selectedTemplateId)} className="w-full py-4 border-2 border-dashed border-border rounded-xl text-text-muted font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-2 mt-4">
                    <Plus size={18}/> Add Exercise
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">Select a routine to edit</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}