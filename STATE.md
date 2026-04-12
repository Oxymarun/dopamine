# FocusFlow Widget -- State Document
**Last updated:** 2026-04-12
**Version:** 1

## 1. Project Goal & Success Criteria

A lightweight Electron desktop widget for macOS built for ADHD brains. Sits on the desktop and helps track tasks, run Pomodoro sessions, manage energy, and build streaks -- without getting in the way.

**Success criteria:**
- Widget launches reliably via `npm start`, resizes fluidly, stays on top when pinned
- Tasks can be added, completed, marked "Good Enough", or carried over -- never lost
- Completed tasks archive automatically and are visible in a per-day History view
- XP/level/streak system works consistently across sessions
- Zero dependencies beyond Electron -- no server, no accounts, no telemetry

## 2. Key Decisions Made

- **Single-file architecture** -- entire UI lives in `index.html` (~3500 lines). No framework, no build step. Intentional for simplicity and readability.
- **localStorage only** -- all persistence via `localStorage`. No backend. Export/import JSON for backup.
- **Carry-over, not daily wipe** -- uncompleted tasks stay in the active list the next day (user chose this over auto-clear).
- **No auto-delete of archived tasks** -- archive capped at 500 items. ADHD brains benefit from a long evidence trail of completed work; hard deletion was rejected.
- **"Good Enough" as a first-class completion** -- earns XP, shows in history with badge. Exists to interrupt ADHD perfectionism-stalling.
- **Nura (companion dog) is collapsible** -- users can hide it to save vertical space on the Focus tab.
- **Fluid layout (100vw/100vh)** -- replaced fixed 370x640px sizing so the widget resizes properly.

## 3. Current Status

### Done and working
- Pomodoro timer with configurable work/break durations, visual progress ring, snooze (+10 min)
- Task management: add with effort levels (low/med/high), mark done or Good Enough, substeps
- Auto-archive: completed tasks move from `state.tasks` to `state.archivedTasks` after 600ms
- Render filter: `renderTasks()` only shows active (not done/ge) tasks
- Zombie cleanup: on load, any orphaned done/ge tasks in `state.tasks` get swept to archive
- History view: Stats tab shows completed tasks grouped by day (Today/Yesterday/dates), 7-day default with "all" toggle
- Wall of Wins: last 15 completions shown in Stats
- XP + levels system (Spark through higher tiers)
- Day streaks with badge
- Brain dump: quick capture mid-session, preview on Tasks tab, full list in overlay
- Hyperfocus guard alerts
- Transition ritual between tasks
- Focus music via embedded YouTube player (with stop button)
- Mood check-ins
- Stuck flow: guided prompts + "tiniest next action" wired to substeps
- One Thing overlay: full-screen focus on current task with line-clamp
- Nura companion: animated dog with contextual messages, collapsible
- Keyboard shortcuts (? to toggle help)
- Data export/import (Settings)
- Accent color themes (purple/blue/green/amber/rose)
- Task count badge on tab, soft warning at 20+ active tasks
- Empty board celebration (confetti + toast when all tasks cleared)
- Interval pending state (dashed border when changing work/break duration mid-session)
- Pie ring hint ("tap ring for focus mode")
- Keyboard shortcut link in Settings

### Uncommitted right now
- Task archive render filter fix (Change 1-2 from today)
- History view in Stats tab (Change 3-6 from today)

### Not yet built
- Demo GIF for README
- Task reordering/drag-and-drop
- Titlebar density reduction (reviewer noted it's tight)
- Undo on accidental task completion

## 4. Open Items / Next Actions

- [ ] Commit + push today's changes (render filter fix + history view)
- [ ] Test the widget end-to-end after today's changes
- [ ] Record a demo GIF and add to README (for GitHub shareability)
- [ ] Post X thread about the project (draft was created in a previous session)
- [ ] Consider task reordering UI (reviewer suggestion, not urgent)
- [ ] Consider titlebar density cleanup (reviewer suggestion, not urgent)

## 5. Constraints & Rules

### Tech
- Vanilla JS only -- no React, no framework, no build step
- Single-file `index.html` for all UI (CSS + HTML + JS)
- Electron 28, macOS only
- `contextIsolation: true`, `nodeIntegration: false` (security model)
- localStorage for persistence, capped at 500 archived tasks
- No `any` in TypeScript (not currently using TS, but rule applies if we ever do)
- No unnecessary dependencies

### UX
- Built for ADHD -- every feature must reduce friction, not add it
- No native `confirm()`/`alert()` -- use in-app DOM toasts/modals instead
- Hydration reminders only fire during active focus sessions
- No trailing summaries after completing work (user preference)

### Explicitly NOT doing
- Auto-delete archived tasks (storage is trivial, long win-log is valuable)
- New fourth tab (Stats tab is the right home for history)
- Server/backend/accounts/telemetry
- Framework migration

## 6. Important Context / Gotchas

- **Electron launch quirk**: `npm start` must be run from the user's terminal. Spawning it from a subprocess (e.g., Claude's Bash tool) doesn't activate the macOS window. The app runs but the window never appears. Workaround: always give the user the terminal command to run themselves.
- **The 600ms archive setTimeout is a safety net, not the primary filter.** The render filter (`!t.done && !t.ge`) is what actually hides completed tasks. The setTimeout just moves them to the archive array. If it gets interrupted (reload, crash), the zombie cleanup on load catches them.
- **`state.wins` vs `state.archivedTasks`** -- these are separate arrays. `wins` is capped at 15, used for Wall of Wins display. `archivedTasks` is capped at 500, used for the History view. Both get populated on task completion.
- **YouTube input validation** -- accepts only 11-char `[A-Za-z0-9_-]` video IDs to prevent XSS via iframe src injection.
- **GitHub username changed** -- was `arunsharma281995-png`, now `Oxymarun`. Remote URL already updated.
- **CSS lint note** -- `line-clamp` needs both `-webkit-line-clamp` and standard `line-clamp` for compatibility. Both are present.

## 7. Relevant Artifacts / Links

| What | Path / URL |
|------|-----------|
| Main UI file | `index.html` (~3500 lines -- CSS + HTML + JS) |
| Electron entry | `main.js` |
| Preload script | `preload.js` |
| Package config | `package.json` |
| README | `README.md` |
| GitHub repo | https://github.com/Oxymarun/focusflow-widget |
| Git remote | `origin` -> `https://github.com/Oxymarun/focusflow-widget.git` |

### Key function locations in index.html
| Function | Purpose |
|----------|---------|
| `completeTask()` :1884 | Marks task done/ge, triggers archive + XP |
| `renderTasks()` :1754 | Renders active task list (filters done/ge) |
| `renderHistory()` :2340 | Renders per-day history in Stats tab |
| `findActiveTaskByText()` :1931 | Finds active task by text match (phantom fix) |
| `markDoneActive()` :1939 | Marks current Focus task as done |
| `toggleNura()` :3339 | Show/hide Nura companion |
| `stuckTinyAction()` :2155 | Stuck flow -> add substep |
| `snoozeTimer()` :1587 | +10 min snooze |
| `stopYT()` :2942 | Stop YouTube audio |
| `showTransition()` :3093 | Task transition ritual / empty board celebration |
| `updateStats()` :2245 | Renders entire Stats tab including history |
| `loadState()` :~1420 | Loads from localStorage with backfills + zombie cleanup |

## 8. Next Milestone

**"Shareable v1"** -- the widget is functionally complete, bug-free, and presentable enough to share publicly:
- [ ] Today's changes committed and pushed
- [ ] Widget tested end-to-end (no zombie tasks, history works)
- [ ] Demo GIF recorded and embedded in README
- [ ] X thread posted linking to the repo
