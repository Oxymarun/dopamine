# Dopamine

**A lightweight macOS widget built by an ADHDer for ADHDers. Pomodoro + tasks + energy-aware streaks that actually work when your brain doesn't.**

One widget. Always on your desktop. No accounts, no cloud, no subscriptions. Just structure that fits the way your brain actually operates.

---

## Why I built this

I have ADHD. Every productivity app I tried was built for neurotypical brains — linear task lists, rigid timers, guilt-trip streaks that reset to zero when you have a bad day.

So I built Dopamine over a weekend. A tiny desktop widget that sits in the corner and does exactly three things: helps me start, helps me keep going, and doesn't punish me when I stall. It's raw, it's simple, and it actually works — because it was built around the failure modes I live with every day.

---

## Features

🍅 **Pomodoro Timer** — Configurable work/break cycles with a visual progress ring. Snooze (+10 min) when you're in flow.

✅ **Task Management** — Add tasks with effort levels (low/med/high), break them into substeps, and track what matters.

👍 **"Good Enough" Button** — The perfectionism killer. Ship the B+ version, collect your XP, move on. This one feature alone changed how I work.

🔄 **Relentless Carry-over** — Tasks don't vanish at midnight. Unfinished items roll forward until you finish them or deliberately remove them.

🧱 **Stuck Flow** — Totally paralyzed? Dopamine walks you through isolating the tiniest next action and wires it as a substep.

⚡ **Hyperfocus Guards** — Alerts that break you out before you dehydrate, forget to eat, or burn through 6 hours without standing up.

🎮 **XP + Levels + Streaks** — Scaled rewards tied to execution. Dopamine wired to doing, not planning.

🎵 **Focus Music** — Embedded YouTube audio right in the widget. No browser tab, no context switch.

🐕 **Nura (Companion Dog)** — An animated buddy with contextual messages. Collapsible when you need space.

📊 **History + Wall of Wins** — Per-day archive of everything you completed. Proof that you're getting things done, even on the days it doesn't feel like it.

🎨 **Themes** — Dark, Light, Pastel. Five accent colors. Because environment matters.

🧠 **Brain Dump** — Quick capture mid-session so stray thoughts don't derail your focus.

⌨️ **Keyboard Shortcuts** — Press `?` for the full list.

---

## Why this isn't like other tools

**No linear perfectionism.** Most productivity apps assume you'll complete tasks in order, one by one, like a well-adjusted adult. Dopamine assumes you won't — and that's fine.

**Carry-over, not daily wipe.** Your tasks don't disappear when the clock hits midnight. They stay until you deal with them. No pretending yesterday didn't happen.

**"Good Enough" is a real completion state.** It earns XP, shows in your history with a badge, and counts as a win. Because done is better than perfect.

**100% local.** Zero backend. Zero telemetry. Zero accounts. Everything lives in your machine's localStorage. Export your data as JSON anytime.

**No build pipeline.** The entire UI is vanilla HTML/CSS/JS in a single file. No React, no webpack, no nonsense. Read the source — it's all there.

---

## Installation

### Option A: Download the app (recommended)

1. Go to the [latest release](https://github.com/Oxymarun/focusflow-widget/releases/latest)
2. Download **Dopamine-1.0.0-arm64.dmg**
3. Open the `.dmg` and drag Dopamine to your Applications folder
4. **First launch only** — open Terminal and run:
   ```bash
   xattr -cr /Applications/Dopamine.app
   ```
5. Launch Dopamine from Launchpad

> macOS blocks unsigned apps by default. The `xattr` command removes the quarantine flag. This is a one-time step.

### Option B: Run from source (for devs)

```bash
git clone https://github.com/Oxymarun/focusflow-widget.git
cd focusflow-widget
npm install
npm start
```

---

## Tech Stack

- macOS + Electron 28
- Vanilla HTML/CSS/JS — zero framework bloat, zero build step
- Everything lives in `index.html` — read the source
- localStorage for persistence, no server, no telemetry

---

## License

MIT. Fork it. Break it. Ship your version.
