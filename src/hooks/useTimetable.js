import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useTimetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState({});
  const [exams, setExams] = useState([]);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setIsLoaded(true); return; }
    
    const fetchTimetable = async () => {
      try {
        const { data } = await supabase.from('user_data').select('timetable_json').eq('user_id', user.id).single();
        
        if (data?.timetable_json) {
          const raw = data.timetable_json;
          
          // 1. EXTRACT TIMETABLE (Handle Old vs New Structure)
          // If raw has a .timetable property, use it. Otherwise, assume raw IS the timetable.
          let tMap = raw.timetable ? raw.timetable : raw;
          
          // 2. EXTRACT EXAMS
          let eList = raw.exams || [];

          setTimetable(tMap);
          setExams(eList);

          // 3. DETERMINE TODAY'S CLASSES
          // JS: 0=Sun, 1=Mon ... 6=Sat
          // ICS Standard: 1=Mon ... 7=Sun
          const jsDay = new Date().getDay();
          const cycleDay = jsDay === 0 ? 7 : jsDay;
          
          // ROBUST LOOKUP: Check number key, string key, and nested structures
          // Some parsers might output { "1": [...] } and others { 1: [...] }
          let classes = tMap[cycleDay] || tMap[String(cycleDay)] || [];

          // If strictly empty, double check we aren't nested inside another 'timetable' key accidentally
          if (classes.length === 0 && tMap.timetable) {
             classes = tMap.timetable[cycleDay] || tMap.timetable[String(cycleDay)] || [];
          }
          
          // 4. SORT BY TIME (Minutes)
          if (Array.isArray(classes)) {
            // Sort based on minutes if available, otherwise string comparison
            classes.sort((a, b) => {
              if (a.minutes && b.minutes) return a.minutes - b.minutes;
              return a.time.localeCompare(b.time);
            });
          } else {
            classes = []; // Safety fallback if not an array
          }

          setTodaysClasses(classes);
        }
      } catch (err) {
        console.error("Timetable sync failed:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchTimetable();
  }, [user]);

  return { timetable, exams, todaysClasses, isLoaded };
}