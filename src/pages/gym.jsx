export default function Gym({ gymLibrary, setGymLibrary, gymRegime, setGymRegime }) {
  return (
    <>
      <h2>Gym Regime</h2>

      <div className="section">
        <h3>Workout Library</h3>

        <button
          className="primary"
          onClick={() => {
            const id = crypto.randomUUID();
            setGymLibrary(p => ({
              ...p,
              [id]: { title: "New Workout", warmup: [], exercises: [] },
            }));
          }}
        >
          + Add Workout
        </button>

        {Object.entries(gymLibrary).map(([id, g]) => (
          <div key={id} className="card">
            <div className="row">
              <input
                value={g.title}
                onChange={e =>
                  setGymLibrary(p => ({
                    ...p,
                    [id]: { ...p[id], title: e.target.value },
                  }))
                }
              />
              <button
                onClick={() =>
                  setGymLibrary(p => {
                    const copy = { ...p };
                    delete copy[id];
                    return copy;
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>14-Day Cycle</h3>

        <button
          onClick={() => setGymRegime(Array.from({ length: 14 }, () => []))}
        >
          Reset Regime
        </button>

        {gymRegime.map((ids, i) => (
          <div key={i} className="card">
            <strong>Day {i + 1}</strong>

            {Object.entries(gymLibrary).map(([id, g]) => (
              <label key={id} className="row">
                <input
                  type="checkbox"
                  checked={ids.includes(id)}
                  onChange={() =>
                    setGymRegime(p => {
                      const c = p.map(a => [...a]);
                      c[i] = c[i].includes(id)
                        ? c[i].filter(x => x !== id)
                        : [...c[i], id];
                      return c;
                    })
                  }
                />
                {g.title}
              </label>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
