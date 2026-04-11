# FocusFlow Widget

A lightweight Electron desktop widget for macOS built for ADHD-friendly focus sessions. Sits on your desktop and helps you track tasks, run Pomodoro timers, manage energy, and build streaks — without getting in the way.

---

## Features

- **Pomodoro timer** — configurable work/break durations with a visual progress ring
- **Task management** — add tasks with effort levels (low / med / high), mark done or Good Enough
- **XP + levels** — earn XP for completing tasks and pomos, spend it on custom rewards
- **Daily stats** — tracks tasks done, pomos completed, focus minutes, and XP earned today
- **Streaks** — day-over-day streak tracking with daily snapshots
- **Brain dump** — quick capture for thoughts mid-session
- **Stuck flow** — guided prompts when you hit a wall
- **Hyperfocus guard** — alerts you when you've been locked in too long
- **Transition ritual** — brief wind-down prompt between tasks
- **Focus music** — embedded YouTube player for background audio
- **Mood check-ins** — log how you're feeling through the day
- **Wall of wins** — running log of completed tasks to revisit
- **Data export / import** — back up and restore your state as JSON

---

## Stack

- Electron (macOS)
- Vanilla HTML / CSS / JS — no framework, no build step
- localStorage for persistence

---

## Getting Started

```bash
npm install
npm start
```

Requires Node.js and npm. Tested on macOS.

---

## Window Controls

| Button | Action |
|--------|--------|
| Pin | Keep window always on top |
| Minimize | Hide to dock |
| Close | Quit the app |

---

## Data

All data is stored locally in `localStorage`. Nothing is sent to any server.

Use **Settings → Export** to back up your data as a JSON file, and **Import** to restore it.
