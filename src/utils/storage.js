export function load(key, fallback) {
    try {
      const d = localStorage.getItem(key);
      return d ? JSON.parse(d) : fallback;
    } catch {
      return fallback;
    }
  }
  
  export function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  