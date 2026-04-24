# Changelog

All notable changes to Dopamine are documented here.

## [2.0.0.0] - 2026-04-24

### Added
- **Full React rebuild** — replaced 2800-line monolithic HTML with Electron + Vite + React 19 + TypeScript + Tailwind. Identical feature set, maintainable codebase.
- **Focus tab** — SVG ring timer with work/break modes, mood picker, +5m/preset buttons, session counter (pomo dots), live elapsed display, snooze (+10m), ring glow when running, Done and Good Enough buttons
- **Tasks tab** — add/complete/delete tasks with effort labels (Tiny/Small/Med/Big), sub-steps, pin as goal (top-3 goals section), Brain Dump inbox (quick capture, promote to task), Focus this button
- **Stats tab** — streak/session/focus chips, XP bar with level progress, weekly focus bar chart, 7-day mood grid, reward shop (custom redeemable rewards), wall of wins, recent sessions history
- **Settings tab** — work/break duration steppers, 5 accent colour presets, sound toggle, always-on-top toggle, JSON export/import backup, clear session history
- **Overlays** — box breathing (4-4-4-4 animated ring), Stuck flow (3-step guided prompts + auto 5-min timer), One Thing (full-widget focus mode), Hyperfocus alert (auto-triggers at 90 min continuous work), Brain Dump FAB (quick capture from any tab)
- **Ambient noise bar** — Rain, Brown noise, Cafe, White noise with volume slider and YouTube URL input (Web Audio API, no external files)
- **Nura companion** — chibi beagle SVG with 5 animation states (idle, focus, break, celebrate, neglected), streak accessories (collar ≥3d, bandana ≥7d, crown ≥30d), night cap (10pm–6am), pet interaction, zoomies, motivation bubbles, neglect timer
- **Toast notifications** — in-app success/info/warning toasts replacing all native `alert()`/`confirm()` calls
- **Confetti** — canvas FX on task complete
- **Keyboard shortcuts** — `?` for help overlay, `B` for Brain Dump, `Escape` to close overlays
- **Streak/level/XP system** — session-based XP, 6 level thresholds (Spark → Nova), persisted across sessions

### Changed
- App entry point switched from `index.html` monolith to `src/main.tsx` (Vite)
- Storage keys migrated to namespaced `ff_*` localStorage keys
- Window position and always-on-top state now persisted to `userData/` via IPC (survives restarts)
- Close button hides the window (tray icon restores it) rather than quitting

### Fixed
- Electron launch no longer shows dock icon (`app.dock.hide()`)
