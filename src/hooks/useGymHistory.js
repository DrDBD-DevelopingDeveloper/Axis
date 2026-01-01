import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useGymHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('gym_logs').select('*').then(({ data }) => {
      if(data) setHistory(data);
    });
  }, [user]);

  const logSet = async (exerciseName, weight) => {
    const newLog = { 
      user_id: user.id, 
      exercise: exerciseName, 
      weight: parseFloat(weight), 
      date: new Date().toISOString() 
    };

    // Optimistic
    setHistory(prev => [...prev, { ...newLog, id: Date.now() }]);

    // Cloud
    await supabase.from('gym_logs').insert([newLog]);
  };

  const getHistoryForExercise = (name) => {
    return history
      .filter(h => h.exercise === name)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: h.weight
      }));
  };

  return { logSet, getHistoryForExercise };
}