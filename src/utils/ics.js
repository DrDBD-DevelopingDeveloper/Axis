function utcToLocalTime(dateRaw, hh, mm) {
  const d = new Date(
    `${dateRaw.slice(0,4)}-${dateRaw.slice(4,6)}-${dateRaw.slice(6,8)}T${hh}:${mm}:00Z`
  );
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function importICS(text) {
  const subjects = {};
  const blocks = text.split("BEGIN:VEVENT").slice(1);

  blocks.forEach(b => {
    const summary = /SUMMARY:(.+)/.exec(b)?.[1];
    const dt = /DTSTART:(\d{8})T(\d{2})(\d{2})Z?/.exec(b);
    const dtEnd = /DTEND:\d{8}T(\d{2})(\d{2})Z?/.exec(b);
    if (!summary || !dt) return;

    const dateRaw = dt[1];
    const startTime = utcToLocalTime(dateRaw, dt[2], dt[3]);
    const endTime = dtEnd ? utcToLocalTime(dateRaw, dtEnd[1], dtEnd[2]) : "";

    const location = /LOCATION:(.+)/.exec(b)?.[1] || "";
    const rrule = /RRULE:(.+)/.exec(b)?.[1];
    const name =
      /DESCRIPTION:Course:\s*(.+)/.exec(b)?.[1]?.trim() || "";

    // -------- EXAMS --------
    if (!rrule && summary.toLowerCase().includes("exam")) {
      const code = summary.split(" ")[0];
      subjects[code] ??= {
        id: crypto.randomUUID(),
        code,
        name,
        sections: {},
        exams: [],
      };

      subjects[code].exams.push({
        title: summary,
        date: `${dateRaw.slice(0,4)}-${dateRaw.slice(4,6)}-${dateRaw.slice(6,8)}`,
        startTime,
        endTime,
      });
      return;
    }

    // -------- LECTURES --------
    if (rrule) {
      const match = /^(.+?)\s*-\s*(.+)$/.exec(summary);
      if (!match) return;

      const code = match[1].trim();
      const section = match[2].trim();

      subjects[code] ??= {
        id: crypto.randomUUID(),
        code,
        name,
        sections: {},
        exams: [],
      };

      subjects[code].sections[section] ??= {
        section,
        slots: [],
      };

      const byDays = /BYDAY=([A-Z,]+)/.exec(rrule)?.[1]?.split(",") || [];
      byDays.forEach(day => {
        subjects[code].sections[section].slots.push({
          day,
          startTime,
          endTime,
          location,
        });
      });
    }
  });

  return Object.values(subjects);
}
