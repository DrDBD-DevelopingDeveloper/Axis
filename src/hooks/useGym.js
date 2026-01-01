import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useGym() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setIsLoaded(true); return; }
    const loadData = async () => {
      const { data } = await supabase.from('gym_data').select('*').eq('user_id', user.id).single();
      if (data) {
        setTemplates(data.templates || []);
        setSchedule(data.schedule || Array.from({ length: 14 }, (_, i) => ({ dayIndex: i + 1, templateId: null })));
      }
      setIsLoaded(true);
    };
    loadData();
  }, [user]);

  const saveToCloud = async (newT, newS) => {
    if (!user) return;
    await supabase.from('gym_data').upsert({ user_id: user.id, templates: newT, schedule: newS });
  };

  // --- CYCLE LOGIC (Fixed) ---
  const getTodayCycleIndex = () => {
    // Uses LocalStorage to allow resetting the cycle without changing DB schema
    const startEpoch = parseInt(localStorage.getItem('gym_cycle_start') || '0');
    const currentEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    
    // If startEpoch is 0 (first run), we just use standard epoch
    // Otherwise, we offset by the start date to make that day "Day 1" (Index 0)
    let dayDiff = currentEpoch - startEpoch;
    if (startEpoch === 0) dayDiff = currentEpoch;
    
    // Ensure positive modulo
    return ((dayDiff % 14) + 14) % 14; 
  };

  const resetCycle = () => {
    if (window.confirm("Restart the 14-day cycle to Day 1 starting today?")) {
      const currentEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      localStorage.setItem('gym_cycle_start', currentEpoch.toString());
      window.location.reload(); // Reload to reflect changes immediately
    }
  };

  // --- SCHEDULING ---
  const assignTemplateToDay = (dayIndex, templateId) => {
    const newSched = schedule.map(d => d.dayIndex === dayIndex ? { ...d, templateId } : d);
    setSchedule(newSched);
    saveToCloud(templates, newSched);
  };

  // --- EDITING ---
  const updateTemplateName = (id, newName) => {
    const newT = templates.map(t => t.id === id ? { ...t, name: newName } : t);
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const addExercise = (templateId) => {
    const newT = templates.map(t => {
      if (t.id === templateId) {
        return { 
          ...t, 
          exercises: [...(t.exercises || []), { name: "New Exercise", sets: 3, reps: 10 }] 
        };
      }
      return t;
    });
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const updateExercise = (templateId, index, field, value) => {
    const newT = templates.map(t => {
      if (t.id === templateId) {
        const newEx = [...(t.exercises || [])];
        newEx[index] = { ...newEx[index], [field]: value };
        return { ...t, exercises: newEx };
      }
      return t;
    });
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const deleteExercise = (templateId, index) => {
    const newT = templates.map(t => {
      if (t.id === templateId) {
        const newEx = [...(t.exercises || [])];
        newEx.splice(index, 1);
        return { ...t, exercises: newEx };
      }
      return t;
    });
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  return { 
    schedule, templates, isLoaded, 
    getTodayCycleIndex, resetCycle,
    assignTemplateToDay, updateTemplateName, 
    addExercise, updateExercise, deleteExercise 
  };
}