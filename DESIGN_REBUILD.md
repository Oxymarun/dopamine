# Dopamine — Design Rebuild Tracker

## Status: In Progress (~40% done)
**Last updated:** 2026-04-20
**Active branch:** `feat/react-vite-rebuild`
**PR:** https://github.com/Oxymarun/dopamine/pull/1

---

## What This Is

Migration from a 2800-line monolithic `index.html` (vanilla JS, no build step) to a proper React + Vite + TypeScript + Tailwind architecture. Original file preserved at `index.html.bak`.

---

## Stack (locked)

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| UI primitives | Radix UI (Tabs only — no shadcn) |
| Icons | lucide-react |
| Desktop | Electron 28 (do NOT upgrade) |

---

## Design System (locked)

### Colors
```
--bg:           #0F0F10
--surface:      #141415
--surface-hover:#1C1C1E
--border:       rgba(255,255,255,0.06)
--text-primary: #EDEDF0
--text-muted:   rgba(255,255,255,0.42)
--accent:       #7B61FF  (user-switchable: violet/blue/teal/rose/amber)
--success:      #34D399
--warning:      #FBBF24
--danger:       #F87171
```

### Typography
- Font: Inter (Google Fonts)
- Base: 13px / 1.5 line-height
- Timer numerals: 26px bold tabular-nums
- Labels/chips: 10–11px
- Antialiased: `-webkit-font-smoothing: antialiased`

### Border radius (Tailwind custom)
- `rounded-btn`: 6px
- `rounded-card`: 10px
- `rounded-chip`: 999px

### Shadows
- `shadow-card`: 0 1px 3px rgba(0,0,0,0.4)

### Inspiration
Linear — dark, dense but breathable, single accent, strong hierarchy.

---

## Component Status

### Done ✅

| Component | File | Notes |
|---|---|---|
| App shell | `src/App.tsx` | Radix Tabs, state lifting (rewards, focusTask, statsKey) |
| TitleBar | `src/components/TitleBar.tsx` | Traffic lights, clock, streak/level chips, pin |
| Focus | `src/components/Focus.tsx` | Ring timer, mode toggle, presets, mood, Nura integration |
| Tasks | `src/components/Tasks.tsx` | Add/complete/delete, sub-steps, focus-this button |
| Stats | `src/components/Stats.tsx` | Chips, mood grid, session history, live refresh |
| Settings | `src/components/Settings.tsx` | Duration, accent, sound, alwaysOnTop |
| Nura | `src/components/Nura.tsx` | Beagle mascot, 5 states, accessories, interactions |
| storage | `src/lib/storage.ts` | localStorage wrappers, streak/level compute |
| timer | `src/lib/timer.ts` | TimerState type, formatTime, ringProgress |
| sound | `src/lib/sound.ts` | Web Audio chimes — no external files |
| notify | `src/lib/notify.ts` | OS Notification wrapper |

---

### Not Built Yet ❌

Priority order for next session:

#### High — Focus tab
| Feature | Notes |
|---|---|
| Pomo dots row | Green dots below timer, one per completed session in current block |
| Session duration counter | Live "Session: 0:00" elapsed time while running |
| "Done" button | Marks current task complete from Focus tab, triggers Nura wiggle |
| "Good Enough" button | ADHD perfectionism interrupt — same XP as Done |
| Timer ring glow | `drop-shadow` filter on progress arc when running |
| Snooze button | Appears while timer running, +10m, hides when paused |

#### High — Tasks tab
| Feature | Notes |
|---|---|
| Brain dump inbox | Quick-capture input at bottom of Tasks, separate list from tasks |
| Task effort labels | ⚡Tiny / 🔹Small / 🔷Med / 🔶Big selector on add |
| Top 3 goals section | Pinned section at top of task list |

#### Medium — Overlays / FABs
| Feature | Notes |
|---|---|
| Breathing exercise | FAB button → overlay with guided breathing phases |
| Stuck flow | Overlay: guided prompts + "tiniest next action" → creates substep |
| Hyperfocus alert | After ~90min unbroken session, show alert |
| One-thing overlay | Full-screen focus on current task (click ring?) |
| Brain dump FAB | Second FAB alongside breathing |

#### Medium — Stats tab
| Feature | Notes |
|---|---|
| Weekly bar charts | Tasks / pomos / focus time — 3 separate bar charts |
| XP bar | Level progress bar with curr XP / next threshold |
| Reward shop | Custom redeemable rewards — add name + XP cost, redeem |
| Wall of wins | Last 15 completed tasks |

#### Low — Global
| Feature | Notes |
|---|---|
| Ambient noise bar | Rain / brown noise / white noise / cafe + volume slider + YouTube input |
| Confetti + FX canvas | On task complete, empty board celebration |
| Toast notifications | In-app toasts (not OS notifications) |
| Keyboard shortcuts | `?` to toggle help overlay |
| Data export / import | JSON backup in Settings |

---

## Nura — Known Issues

| Issue | Fix needed |
|---|---|
| Body barely visible | Dark saddle on body blends with dark ear colour |
| Tail not rendering visibly | Dark tail on dark bg — needs lighter fur stripe or reposition |
| No visible legs | Body ellipse too small, legs not drawn |

**Nura palette for reference:**
```
TAN    = '#C8782E'   // golden caramel fur
DARK   = '#3A1A06'   // warm dark brown (saddle, ears)
CREAM  = '#FFF0D0'   // muzzle, belly, paw tips
EAR_MID= '#7B3A10'   // ear depth stripe (must stay visible)
STROKE = '#2A1205'   // outline
```

---

## Layout Notes

- Widget: 370 × 640px in Electron
- Browser preview (port 5173) is full-height — bottom dead zone is a preview artifact, not real
- Focus tab content fills ~500–520px of 569px available — ~50px breathing room at bottom is intentional
- All tabs use `flex-1 flex flex-col overflow-hidden` → `overflow-y-auto` on content

---

## File Structure (actual, as built)

```
focusflow-widget/
  main.js              # Electron main — window, tray, IPC handlers
  preload.js           # close / minimize / pin / setAlwaysOnTop
  package.json         # scripts + deps
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  postcss.config.js
  index.html           # Vite entry shell (minimal)
  index.html.bak       # Original monolith — reference for missing features
  src/
    main.tsx
    App.tsx
    vite-env.d.ts      # window.widget type declaration
    components/
      TitleBar.tsx
      Focus.tsx
      Tasks.tsx
      Stats.tsx
      Settings.tsx
      Nura.tsx
    lib/
      storage.ts
      timer.ts
      sound.ts
      notify.ts
    styles/
      globals.css
  dist/                # Vite build output (gitignored)
  .claude/
    launch.json        # preview server config (port 5173, npm run dev)
```

---

## Non-Negotiables (carry forward every session)

- Electron 28 — pinned, do NOT upgrade
- No `any` in TypeScript
- No unnecessary deps
- localStorage keys: `ff_tasks`, `ff_sessions`, `ff_settings`, `ff_rewards`
- `contextIsolation: true`, `nodeIntegration: false`
- Traffic light dots must work
- Draggable titlebar (`-webkit-app-region: drag`)
- All data persists — don't change storage key names
- Fully offline — no network required
