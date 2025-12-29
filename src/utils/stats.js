export function computeStats(doneMap) {
  const today = new Date();
  let total = 0, done = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);

    Object.keys(doneMap).forEach(k => {
      if (!k.startsWith(key)) return;
      total++;
      if (doneMap[k]) done++;
    });
  }

  return total ? Math.round((done / total) * 100) : 0;
}
