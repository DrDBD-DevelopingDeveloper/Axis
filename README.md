# About Axis

Hola, I'm Druhin, the mastermind behind Axis. 👋

Axis was born out of frustration. I was tired of "cooked" apps that were either too bloated, filled with ads, or didn't do exactly what I needed. I needed a single, privacy-focused tool to manage my life at BITS Pilani — tracking my gym progress, managing expenses,viewing my timetable, tracking my overall regularity.

So, I built one myself.

## The "Human + AI" Approach
I want to be transparent: this project is an experiment in modern software engineering. I didn't write every single line of syntax by hand, but I didn't just "prompt and pray" either.

**My Role (The Architect):**
* **System Design:** I defined the relational data structure for the Gym Templates and the local-first architecture.
* **Debugger & Tester:** I spent hours fixing edge cases, refining the UI spacing, and ensuring the features actually worked in the real world.
* **Product Manager:** I decided what features mattered (like Progressive Overload tracking) and cut the gimmicks that didn't.
* **Aesthetics:** I tuned the CSS variables to create the specific "Graphite" and "Obsidian" themes because standard dark modes looked off.

**The AI's Role (The Engine):**
* I used LLMs as a pair programmer to generate the React boilerplate and refactor heavy logic hooks like `useGym.js`.
* Think of the AI as the Junior Developer who types fast, and me as the Lead who tells it what to build, reviews the code, and fixes it when it breaks.

## The Tech Stack
* **Frontend:** React + Vite
* **State Management:** Custom React Hooks persisting to `localStorage`
* **Styling:** Tailwind CSS (v3) + Framer Motion for animations
* **Mobile Runtime:** CapacitorJS (wrapping the web app for iOS)

## Key Features
1.  **Academic Engine:** Parses `.ics` files to generate a conflict-aware timetable.
2.  **Gym Tracker:** A serious tool for progressive overload, including history graphs and PR tracking.
3.  **Expense Manager:** A privacy-first budget tracker with "Trend Mode" analytics.
4.  **Theme Engine:** A custom-built CSS variable system supporting true OLED dark modes.

## Running Locally
```bash
# Install dependencies
npm install

# Run the dev server
npm run dev