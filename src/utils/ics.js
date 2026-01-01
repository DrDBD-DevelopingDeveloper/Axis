const unfoldLines = (text) => text.replace(/\r\n[ \t]/g, "");

const parseICSDate = (dateStr) => {
  if (!dateStr) return null;
  const isUTC = dateStr.endsWith("Z");
  const cleanStr = dateStr.replace("Z", "");
  const y = parseInt(cleanStr.substring(0, 4));
  const m = parseInt(cleanStr.substring(4, 6) || 1) - 1;
  const d = parseInt(cleanStr.substring(6, 8) || 1);
  const h = parseInt(cleanStr.substring(9, 11) || 0);
  const min = parseInt(cleanStr.substring(11, 13) || 0);
  
  if (isUTC) return new Date(Date.UTC(y, m, d, h, min, 0));
  return new Date(y, m, d, h, min, 0);
};

export const parseICS = (icsContent) => {
  if (!icsContent) return { timetable: {}, exams: [] };
  
  const unfolded = unfoldLines(icsContent);
  const lines = unfolded.split(/\r\n|\n|\r/);
  
  const timetableMap = {}; 
  const examsList = [];
  const dayMap = { 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6, 'SU': 7 };
  
  let currentRaw = {};
  let insideEvent = false;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) { insideEvent = true; currentRaw = {}; continue; }
    if (line.startsWith("END:VEVENT")) {
      insideEvent = false;
      const start = parseICSDate(currentRaw["DTSTART"]);
      const summary = currentRaw["SUMMARY"] || "Unknown";
      const location = currentRaw["LOCATION"] || "TBD";
      const rrule = currentRaw["RRULE"] || "";
      
      if (!start) continue;

      // Calculate minutes from midnight for robust sorting
      const minutes = start.getHours() * 60 + start.getMinutes();

      const dayMatch = rrule.match(/BYDAY=([A-Z]{2})/);
      if (dayMatch) {
        const cycleDay = dayMap[dayMatch[1]];
        if (!timetableMap[cycleDay]) timetableMap[cycleDay] = [];
        
        timetableMap[cycleDay].push({
          name: summary.split("-")[0].trim(),
          time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          minutes: minutes, // Critical for sorting
          room: location,
          type: summary.includes("- L") ? "Lecture" : "Tutorial"
        });
      } 
      else if (summary.toLowerCase().includes("exam") || summary.toLowerCase().includes("midsem") || summary.toLowerCase().includes("endsem")) {
        examsList.push({
          name: summary,
          date: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          rawDate: start.getTime()
        });
      }
      continue;
    }
    if (insideEvent) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).split(";")[0];
        currentRaw[key] = line.substring(colonIndex + 1);
      }
    }
  }

  // ROBUST SORTING: Sort by 'minutes' value
  Object.keys(timetableMap).forEach(day => {
    timetableMap[day].sort((a, b) => a.minutes - b.minutes);
  });
  examsList.sort((a, b) => a.rawDate - b.rawDate);

  return { timetable: timetableMap, exams: examsList };
};