/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      // MAGIC MAPPING: connecting Tailwind classes to your CSS Variables
      colors: {
        bg: 'var(--app-bg)',
        surface: 'var(--app-surface)',
        'surface-hover': 'var(--app-surface-hover)',
        text: 'var(--app-text)',
        'text-muted': 'var(--app-text-muted)',
        border: 'var(--app-border)',
        accent: 'var(--app-accent)',
        'accent-glow': 'var(--app-accent-glow)',
      }
    },
  },
  plugins: [],
}