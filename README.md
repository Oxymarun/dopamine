# FocusFlow Widget

A lightweight Electron desktop widget for macOS built for ADHD brains. Sits on your desktop and helps you track tasks, run Pomodoro sessions, manage energy, and build streaks — without getting in the way.

Built by someone with ADHD, for people with ADHD. Every feature exists because a generic productivity tool failed me first.

---

## Why this exists

Most productivity apps assume linear execution: set a timer, check it off, repeat. ADHD brains don't work that way — energy spikes and crashes, tasks feel impossible at 2pm and effortless at midnight, and "just be consistent" isn't a strategy.

FocusFlow is scaffolding, not a cure. It matches how an ADHD brain actually moves through a day.

---

## Features

- **Pomodoro timer** — configurable work/break durations with a visual progress ring
- **Task management** — add tasks with effort levels (low / med / high), mark done or Good Enough
- **Auto-archive** — completed tasks move out of the active list automatically, preserved in history
- **Carry-over** — unfinished tasks roll into the next day instead of vanishing
- **"Good Enough" button** — ship imperfect work and still earn XP (ADHD perfectionism is a stall mechanism — this is the interrupt)
- **"Stuck" flow** — guided prompts when your brain just won't move
- **XP + levels** — earn XP for completing tasks and pomos, spend it on custom rewards
- **Streaks** — day-over-day streak tracking
- **Brain dump** — quick capture for thoughts mid-session so you don't lose them
- **Hyperfocus guard** — alerts you when you've been locked in too long
- **Transition ritual** — brief wind-down prompt between tasks
- **Themes** — Dark, Light, and Pastel modes with customizable accent colors
- **Focus music** — embedded YouTube player for background audio
- **Mood check-ins** — log how you're feeling through the day
- **Wall of wins** — running log of completed tasks to revisit when motivation is low
- **Data export / import** — back up and restore your state as JSON

---

## Getting Started

### Requirements
- macOS
- Node.js 18 or newer ([download](https://nodejs.org))
- npm (ships with Node.js)

### Install and run

```bash
git clone https://github.com/Oxymarun/focusflow-widget.git
cd focusflow-widget
npm install
npm start
```

The widget window will appear. Drag it anywhere on your screen.

### Troubleshooting

If `npm start` fails with an Electron error, clear and reinstall:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

---

## Stack

- Electron 28 (macOS)
- Vanilla HTML / CSS / JS — no framework, no build step
- localStorage for persistence (no server, no telemetry, no accounts)

The entire app lives in `index.html` + `main.js` + `preload.js`. Read the source. It's self-contained.

---

## Window Controls

| Button | Action |
|--------|--------|
| Red dot | Close the app |
| Yellow dot | Minimize to dock |
| Pin | Keep window always on top |
| Resize | Drag any corner to resize the widget |

---

## Data & Privacy

All data is stored locally in your browser's `localStorage`. Nothing is sent to any server. No analytics. No accounts. No tracking.

Use **Settings → Export** to back up your data as a JSON file, and **Import** to restore it on another machine.

---

## Contributing

Pull requests welcome — especially bug reports from other ADHD users. The codebase is intentionally small and readable, so jumping in is easy.

---

## License

MIT — do whatever you want with it.
