# Dopamine — State Document
**Last updated:** 2026-04-24
**Version:** 2.0.0.0 — shipped ✅

---

## 1. Project Goal & Success Criteria

A lightweight Electron desktop widget for macOS built for ADHD brains. Sits on the desktop, helps track tasks, run Pomodoro sessions, manage energy, and build streaks — without getting in the way.

**Success criteria:**
- Widget launches reliably, resizes fluidly, stays on top when pinned
- Tasks can be added, completed, sub-stepped, and sent to Focus tab
- Pomodoro timer with sound + OS notification on complete
- Streak/level system persists across sessions
- Nura companion reacts to timer state
- Distributable as standalone `.dmg`

---

## 2. Architecture (as of v2.0.0)

**Stack:** Electron 28 + Vite + React 19 + TypeScript + Tailwind CSS + Radix UI

```
focusflow-widget/
  main.js              # Electron main — window, tray, IPC
  preload.js           # IPC bridge (close, minimize, pin, setAlwaysOnTop)
  package.json         # deps + scripts
  vite.config.ts       # Electron-aware Vite (base: './')
  tailwind.config.ts   # design tokens
  src/
    main.tsx           # React entry
    App.tsx            # Shell + Radix Tabs + state lifting
    components/
      TitleBar.tsx     # traffic lights, clock, streak/level chips, pin
      Focus.tsx        # ring timer, mood, Nura integration
      Tasks.tsx        # task list with sub-steps, focus button
      Stats.tsx        # streak/level/focus-time, mood grid, session history
      Settings.tsx     # duration, accent, sound, alwaysOnTop toggles
      Nura.tsx         # beagle mascot SVG component
    lib/
      storage.ts       # localStorage wrappers + streak/level logic
      timer.ts         # TimerState type, formatTime, ringProgress
      sound.ts         # Web Audio API chimes (no external files)
      notify.ts        # OS Notification wrapper
    styles/
      globals.css      # Tailwind base + CSS custom props
```

**Scripts:**
| Command | Does |
|---|---|
| `npm run dev` | Vite dev server only (port 5173) |
| `npm run dev:app` | Vite + Electron together (concurrently + wait-on) |
| `npm run build:renderer` | Vite prod build → `dist/` |
| `npm start` | Electron loading `dist/index.html` |
| `npm run build:dmg` | Full DMG build via electron-builder |

---

## 3. Key Decisions Made (v2.0.0)

- **React + Vite rebuild** — old 2800-line monolithic `index.html` preserved as `index.html.bak`. New renderer lives in `src/`.
- **Radix UI Tabs** — only Radix component used. No shadcn (avoided for simplicity).
- **Web Audio API for sound** — no external sound files. Ascending 3-tone chime on work complete, 2-tone on break.
- **Close hides, not quits** — window hides on red dot click. Tray click toggles visibility. `app.dock.hide()` keeps it out of dock.
- **Window position persists** — saved to `userData/window-state.json` on move/resize. Loaded on next start.
- **alwaysOnTop persists** — Settings toggle writes to `userData/settings.json` via IPC. main.js reads it at startup.
- **Stats refresh on tab open** — `key={statsKey}` increments every time Stats tab is opened, forcing remount + fresh storage read.
- **focusTask lifted to App** — clicking crosshair in Tasks sets `focusTask` state in App, switches tab to Focus, pre-fills task input.
- **Nura neglect timer** — 20 min no timer activity → Nura goes sad. Resets on start/pet.
- **Streak/level in App state** — `rewards` state in App.tsx, refreshed via `onSessionComplete` callback from Focus.

---

## 4. Current Status

### Done (v2.0.0 — ~40% of original feature set)

**Core infrastructure**
- [x] Vite + React + TS + Tailwind scaffold
- [x] Design tokens (globals.css) — Linear-inspired dark palette
- [x] Electron: window persistence, tray, dock hide, alwaysOnTop on startup
- [x] Combined dev script (`npm run dev:app`)

**Focus tab**
- [x] SVG ring timer (work/break modes)
- [x] Start / Pause / Resume / Reset
- [x] +5m button, preset buttons (15/25/45/60m)
- [x] Mode toggle (Work / Break)
- [x] Mood picker (5 emojis)
- [x] Sound on complete (Web Audio)
- [x] OS notification on complete
- [x] Session complete → updates streak/level in TitleBar

**Tasks tab**
- [x] Add / complete / delete tasks
- [x] Sub-steps (expandable per task)
- [x] "Focus this" button → sends task to Focus tab + switches tab

**Stats tab**
- [x] Streak, today's sessions, total focus time chips
- [x] Level display
- [x] 7-day mood grid
- [x] Session history list (last 20)
- [x] Live refresh on tab open

**Settings tab**
- [x] Work / break duration (± 5m steppers)
- [x] Accent colour picker (5 presets)
- [x] Sound toggle
- [x] Always-on-top toggle (persists via IPC to main.js)
- [x] Clear session history button

**TitleBar**
- [x] Traffic lights (close hides, minimize minimizes)
- [x] Live clock
- [x] Streak chip (🔥Nd)
- [x] Level chip
- [x] Pin toggle (alwaysOnTop)

**Nura**
- [x] Full beagle SVG (chibi flat style, redesigned from original rects)
- [x] 5 animation states: idle, focus, break, celebrate, neglected
- [x] Streak accessories: collar (≥3d), bandana (≥7d), crown (≥30d)
- [x] Night cap (10pm–6am)
- [x] Eye lids close in focus mode
- [x] Speech bubbles (mode-change, motivation, pet, neglect)
- [x] Pet interaction (click → bounce + random msg)
- [x] Zoomies (1-in-20 on timer start)
- [x] Neglect timer (20min idle → sad state)
- [x] Motivation bubbles every 8min during focus

---

### Not yet built (~45% of original features)

**Focus tab gaps** — all Phase 2 items done ✅
- [x] Pomo dots row (visual session counter below timer)
- [x] Session duration counter (live elapsed while running)
- [x] "Done" button (marks focused task complete, triggers Nura celebrate)
- [x] "Good Enough" button (same behavior — ADHD perfectionism interrupt)
- [x] Snooze button (+10m, visible only when running)
- [x] Timer ring glow (drop-shadow on progress arc when running)

**Tasks tab gaps** — all Phase 2 items done ✅
- [x] Task effort labels (⚡Tiny / 🔹Small / 🔷Med / 🔶Big selector on add)
- [x] Top 3 goals section (pin any task as goal, max 3, shown at top)
- [x] Brain dump inbox (quick capture, separate list, promote to task)

**Missing tabs / overlays** — all Phase 3 items done ✅
- [x] Breathing exercise overlay (FAB) — box breathing 4-4-4-4, animated ring + pulsing circle
- [x] Stuck flow overlay (FAB) — 3-step guided prompts, auto-starts 5-min timer
- [x] Hyperfocus alert — auto-triggers at 90min continuous work, offers break
- [x] One-thing overlay (FAB) — full-widget focus on current task, Done/Keep going
- [x] Brain dump overlay (FAB) — quick capture outside of Tasks tab

**Stats gaps** — all Phase 4 items done ✅
- [x] Weekly bar charts (tasks / pomos / focus time)
- [x] XP bar with level progress
- [x] Reward shop (custom redeemable rewards)
- [x] Wall of wins

**Global missing** — all Phase 4 items done ✅
- [x] Ambient noise bar (rain / brown / white / cafe + volume — Web Audio API)
- [x] Confetti / FX canvas (on task complete, empty board)
- [x] Toast notifications (in-app)
- [x] Keyboard shortcuts (? to toggle help)
- [x] Data export / import (JSON)

---

## 5. Open Items / Next Actions

**Remaining (post Phase 4)**
- [ ] Nura: body/tail visibility fix (dark saddle merges with ears visually)
- [ ] Test full flow in Electron (not just browser preview)
- [ ] Build + test DMG

**Status:** v2.0.0.0 merged to main — https://github.com/Oxymarun/dopamine/pull/3

---

## 6. Constraints & Rules

### Tech
- Electron 28 — do NOT upgrade (v41 breaks `require('electron')` in main process)
- React + TypeScript + Tailwind — no `any` in TS
- No unnecessary dependencies
- localStorage for persistence — storage keys are `ff_tasks`, `ff_sessions`, `ff_settings`, `ff_rewards`
- `contextIsolation: true`, `nodeIntegration: false`

### UX
- Built for ADHD — every feature must reduce friction
- No native `confirm()`/`alert()` — use in-app toasts
- Nura is not collapsible yet (was in v1, restore if needed)

### Explicitly NOT doing
- Auto-delete archived tasks
- Server / backend / accounts / telemetry
- Apple Developer signing ($99/yr) — `xattr -cr` workaround for DMG

---

## 7. Gotchas

- **Electron launch quirk**: `npm start` must run from user's terminal. Spawning from subprocess doesn't always activate macOS window.
- **Electron 41 is broken**: Pinned to v28. Do not upgrade.
- **Browser preview vs Electron**: Preview server (port 5173, full browser height) makes layout look more spaced out than the actual 640px Electron window. Test in Electron for true proportions.
- **Nura SVG dark ears**: Ear fill `#3A1A06` on `#0F0F10` background is low-contrast. Ear outline `#6B3418` makes them distinguishable. Don't darken further.
- **Stats re-read**: Stats uses `key={statsKey}` in App.tsx — increments on every tab open to force remount + fresh storage read.
- **alwaysOnTop dual storage**: Settings component writes to localStorage (`ff_settings`). IPC `setAlwaysOnTop` also writes to `userData/settings.json` for startup persistence. Both must stay in sync.
- **Unsigned DMG**: macOS Gatekeeper shows "damaged" error. Users run `xattr -cr /Applications/Dopamine.app`.

---

## 8. Artifacts / Links

| What | Path / URL |
|---|---|
| Old monolith (backup) | `index.html.bak` |
| React entry | `src/main.tsx` |
| App shell | `src/App.tsx` |
| Electron main | `main.js` |
| IPC bridge | `preload.js` |
| Design tokens | `src/styles/globals.css` + `tailwind.config.ts` |
| GitHub repo | https://github.com/Oxymarun/dopamine |
| Open PR | https://github.com/Oxymarun/dopamine/pull/1 |
| Release v1.0.0 | https://github.com/Oxymarun/dopamine/releases/tag/v1.0.0 |
| Preview server | Port 5173 (Vite dev) |
