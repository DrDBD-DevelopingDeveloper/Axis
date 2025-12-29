// utils/ics.js
// STRICT ICS IMPORTER — drops anything ambiguous

// =======================
// Helpers
// =======================

const COURSE_CODE_REGEX = /\b([A-Z]{2,4}\sF\d{3})\b/;
const SECTION_REGEX = /\b([LTP]\d+)\b/i;
const TIME_REGEX = /(\d{2}):(\d{2})/;

const DAY_MAP = {
  MO: "MO",
  TU: "TU",
  WE: "WE",
  TH: "TH",
  FR: "FR",
};

function toLocalDate(dt) {
  // dt like 20241230T033000Z or 20241230T033000
  const hasZ = dt.endsWith("Z");

  const year = Number(dt.slice(0, 4));
  const month = Number(dt.slice(4, 6)) - 1;
  const day = Number(dt.slice(6, 8));
  const hour = Number(dt.slice(9, 11));
  const min = Number(dt.slice(11, 13));

  if (hasZ) {
    return new Date(Date.UTC(year, month, day, hour, min));
  }
  return new Date(year, month, day, hour, min);
}

function parseTime(dt) {
  const d = toLocalDate(dt);
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

function getWeekday(dt) {
  const d = toLocalDate(dt);
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d.getDay()];
}


function emptySubject(code) {
  return {
    id: crypto.randomUUID(),
    code,
    name: "",
    sections: {},
    exams: [],
  };
}

// =======================
// MAIN IMPORT FUNCTION
// =======================

export function importICS(text) {
  const lines = text.split(/\r?\n/);

  const subjects = {};
  let current = null;

  function commitEvent(ev) {
    if (!ev.summary || !ev.start || !ev.end) return;

    const codeMatch = ev.summary.match(COURSE_CODE_REGEX);
    const sectionMatch = ev.summary.match(SECTION_REGEX);

    // ---------- EXAM ----------
    if (/exam|midsem|compre|quiz/i.test(ev.summary)) {
      if (!codeMatch) return;

      const code = codeMatch[1];
      subjects[code] ||= emptySubject(code);

      subjects[code].exams.push({
        title: ev.summary.trim(),
        date: ev.start.slice(0, 4) + "-" +
              ev.start.slice(4, 6) + "-" +
              ev.start.slice(6, 8),
        startTime: parseTime(ev.start),
        endTime: parseTime(ev.end),
      });
      return;
    }

    // ---------- LECTURE ----------
    if (!codeMatch || !sectionMatch) return;

    const code = codeMatch[1];
    const section = sectionMatch[1].toUpperCase();
    const day = getWeekday(ev.start);

    if (!DAY_MAP[day]) return; // drop weekends

    subjects[code] ||= emptySubject(code);
    subjects[code].name ||= ev.description?.split("\n")[0] || "";

    subjects[code].sections[section] ||= {
      section,
      instructor: "",
      slots: [],
    };

    const sec = subjects[code].sections[section];

    if (!sec.instructor && ev.description) {
      const instLine = ev.description
        .split("\n")
        .find(l => /Instructor:/i.test(l));
      if (instLine) {
        sec.instructor = instLine.replace(/Instructor:/i, "").trim();
      }
    }

    sec.slots.push({
      day,
      startTime: parseTime(ev.start),
      endTime: parseTime(ev.end),
      room: ev.location || "",
    });
  }

  // =======================
  // ICS PARSING
  // =======================

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
    } else if (line === "END:VEVENT") {
      commitEvent(current);
      current = null;
    } else if (!current) continue;
    else if (line.startsWith("SUMMARY:")) {
      current.summary = line.slice(8).trim();
    } else if (line.startsWith("DTSTART")) {
      current.start = line.split(":")[1];
    } else if (line.startsWith("DTEND")) {
      current.end = line.split(":")[1];
    } else if (line.startsWith("LOCATION:")) {
      current.location = line.slice(9).trim();
    } else if (line.startsWith("DESCRIPTION:")) {
      current.description = line.slice(12).replace(/\\n/g, "\n");
    }
  }

  return Object.values(subjects);
}
