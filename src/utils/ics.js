export function exportICS(classes) {
    let out="BEGIN:VCALENDAR\nVERSION:2.0\n";
    classes.forEach(c=>{
      if(!c.startTime) return;
      out+=
        "BEGIN:VEVENT\n"+
        `SUMMARY:${c.title}\n`+
        `DTSTART:20250101T${c.startTime.replace(":","")}00\n`+
        "DURATION:PT1H\n"+
        `LOCATION:${c.location||""}\n`+
        "END:VEVENT\n";
    });
    out+="END:VCALENDAR";
  
    const blob=new Blob([out],{type:"text/calendar"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="timetable.ics";
    a.click();
  }
  
  export function importICS(text) {
    const events=[];
    const blocks=text.split("BEGIN:VEVENT").slice(1);
    blocks.forEach(b=>{
      const title=/SUMMARY:(.+)/.exec(b)?.[1];
      const time=/DTSTART:\d+T(\d{2})(\d{2})/.exec(b);
      if(!title||!time) return;
      events.push({title,startTime:`${time[1]}:${time[2]}`});
    });
    return events;
  }
  