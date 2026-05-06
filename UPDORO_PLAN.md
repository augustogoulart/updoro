# UpDoro: macOS Menubar App — Implementation Plan

A pomodoro timer for training attention through progressive ramps. Modeled on treadmill workout programs: each session starts at 5 minutes and ramps up through longer focus intervals. Modes are different ramps, not difficulty levels.

---

## 1. Philosophy (load-bearing — informs every ambiguous decision)

1. **Trust the user.** No activity monitoring, no app blocking, no Accessibility/Screen Recording permissions. UpDoro is a timer that runs in the background; the user does the work.
2. **Daily reset.** Every session starts at 5 minutes regardless of past performance. Attention isn't uniformly trained day-to-day; ramping daily respects that.
3. **Modes are a library, not a ladder.** Users pick whichever mode fits today. No graduation, no unlocks, no levels. The hardest mode is available to a brand-new user.
4. **Inform, don't guard.** Show honest information (total session time, interval count) but don't gate, warn paternalistically, or imply the user is making a wrong choice.
5. **Names are handles, not aspirations.** Modes are named by their peak interval duration (`60m`, `4h ×2`). No "Starter / Builder / Deep / Ultra," no "ease in," no "most days." Those silently rank.

When in doubt, default to the principle. Don't add streaks, achievements, or "best ever" framing — those were considered and rejected.

---

## 2. Tech stack

- **Platform**: macOS 14 (Sonoma) or later
- **Language**: Swift 5.9+
- **UI framework**: SwiftUI for content (popover body, picker window). AppKit for menubar integration (`NSStatusItem`, `NSPopover`).
- **Persistence**: `UserDefaults` for v1 (last-used mode ID, settings flags). Modes themselves are hardcoded constants.
- **No third-party dependencies.**

The app is `LSUIElement = true` (no Dock icon, no main menu, lives only in the menubar).

---

## 3. Data model

```swift
struct Interval: Codable, Equatable {
    enum Kind: String, Codable { case work, rest }
    let kind: Kind
    let minutes: Int
}

struct Mode: Codable, Identifiable, Equatable {
    let id: String              // stable identifier, e.g. "builtin.60m"
    let name: String            // display name, e.g. "60m"
    let intervals: [Interval]   // alternating work/rest, always starts with work, ends with work

    var totalMinutes: Int { intervals.reduce(0) { $0 + $1.minutes } }
    var workIntervals: [Interval] { intervals.filter { $0.kind == .work } }
    var peakWorkMinutes: Int { workIntervals.map(\.minutes).max() ?? 0 }
    var rampDescription: String {
        workIntervals.map { String($0.minutes) }.joined(separator: " → ")
    }
}

enum SessionState: Equatable {
    case idle
    case running(intervalIndex: Int, elapsedSeconds: Int)
    case paused(intervalIndex: Int, elapsedSeconds: Int)
}

@MainActor
final class SessionStore: ObservableObject {
    @Published private(set) var mode: Mode?
    @Published private(set) var state: SessionState = .idle
    // start(mode:), pause(), resume(), skip(), stop()
    // Timer fires every second to drive UI updates; remaining time is computed
    // from an absolute interval-start timestamp (Date), not a per-tick decrement.
    // This avoids drift across system load, app suspension, and the 13h+ peak modes.
}
```

The `SessionStore` is a singleton owned by the app delegate; both the menubar item and any open SwiftUI views observe it.

---

## 4. Built-in modes

Hardcode these as constants in a `BuiltInModes` namespace. Notation: `Nw` = N-minute work, `Nr` = N-minute rest. Sessions always end on a work interval (no trailing rest).

| ID                | Name    | Intervals                                                 | Total    |
|-------------------|---------|-----------------------------------------------------------|----------|
| `builtin.30m`     | `30m`   | 5w · 5r · 15w · 5r · 30w                                  | 60m      |
| `builtin.60m`     | `60m`   | 5w · 5r · 15w · 5r · 30w · 5r · 60w                       | 2h 5m    |
| `builtin.2h`      | `2h`    | 5w · 5r · 15w · 5r · 30w · 5r · 60w · 10r · 120w          | 4h 15m   |
| `builtin.4hx2`    | `4h ×2` | 5w · 5r · 15w · 5r · 30w · 5r · 60w · 10r · 120w · 20r · 240w · 30r · 240w | 13h 5m   |

The rest interval scales loosely with the preceding work interval: 5min rest for short work, 10min after 60w, 20min after 120w, 30min after 240w.

---

## 5. UI surfaces

### 5.1 Menubar item

`NSStatusItem` with a custom view that combines an icon and (when running) a countdown label.

**States:**

| State    | Icon                          | Label                |
|----------|-------------------------------|----------------------|
| Idle     | Outlined ring (no fill)       | (none)               |
| Working  | Ring with arc filled to % through current interval, warm color | Countdown |
| Resting  | Same ring, cool color         | Countdown            |
| Paused   | Pause glyph                   | Frozen countdown, muted |

**Time format:**

- Under 1 hour: `mm:ss` — e.g., `22:14`, `4:23`
- 1 hour or more: `h:mm` followed by a small subscript `h` — e.g., `3:42h`. Drop seconds; don't watch them on a 4-hour countdown anyway. Saves ~12pt of menubar width.
- Always use `.monospacedDigit()` so digits don't dance.

**Pill background:** the icon+label sits inside a tinted rounded rect (4pt corner radius):

| State    | Background             | Foreground             |
|----------|------------------------|------------------------|
| Working  | `rgba(216,90,48,0.08)` | `#993C1D` (light) / `#F0997B` (dark) |
| Resting  | `rgba(29,158,117,0.08)` | `#0F6E56` (light) / `#5DCAA5` (dark) |
| Paused   | `secondaryBackground`  | `tertiaryLabel`        |
| Idle     | (none)                 | `secondaryLabel`       |

This is a deliberate departure from default macOS menubar style — the tint makes state legible at a glance from across the room.

**Ring progress:** shows progress through the **current interval only**, not the whole session. Resets on each interval boundary. The dropdown handles session-level visualization.

**Click behavior:** left-click toggles an `NSPopover` anchored to the status item.

### 5.2 Popover — idle state

Shown when no session is running.

```
┌─────────────────────────────────┐
│ 🔥 UpDoro              ⚙        │
├─────────────────────────────────┤
│                                 │
│  Last used                      │
│   60m                           │
│   5 → 15 → 30 → 60 · 2h 15m     │
│                                 │
│   [    Start    ]               │
│                                 │
│   Switch mode →                 │
│                                 │
└─────────────────────────────────┘
```

If there's no last-used mode (first launch), inline the full mode list here instead of showing "Last used" + a switch link. Once any mode is started once, switch to the last-used layout.

### 5.3 Popover — running state

Width ~340pt. Layout top to bottom:

1. **Header row**: app icon + name (left), `Interval N of M` text (center-right), settings gear (right).
2. **Mode badge**: pill, `FOCUS` (warm coral) or `REST` (cool teal), uppercase, letter-spaced.
3. **Big timer**: 44pt, `.monospacedDigit()`, weight 500. Counts down the current interval.
4. **Subtext**: `of 30 min · ends 2:08 PM` (interval duration + projected wall-clock end of the interval).
5. **Workout track**: profile chart (see §5.5).
6. **Controls row**:
   - Primary: Pause / Resume button — full-width-ish, filled dark background, white text.
   - Secondary: Skip (forward icon).
   - Secondary: Stop (square icon).
7. **Footer**: small text, `Last session: 60m · 2h 15m total`. No "best ever," no streaks.

### 5.4 Mode Picker window

Separate `NSWindow` (titled "Modes," standard close button only — no minimize/zoom). Width ~480pt. Opened from the "Switch mode" link in the idle popover, or from a Preferences/Modes menu item.

Each row:

| Section            | Content                                                  |
|--------------------|----------------------------------------------------------|
| Left (~130pt)      | Mode name (`60m`) + optional `last used` tag, ramp string (`5 → 15 → 30 → 60`), total (`total 2h 15m`) |
| Center (flex)      | Profile chart (see §5.5)                                |
| Right (~70pt)      | `Start` button (filled, dark)                            |

Plus a disabled `+ New mode` row at the bottom with `coming soon` text (placeholder for v2 custom modes).

**Sort order:** last-used mode first, then the rest in their definition order (`30m`, `60m`, `2h`, `4h ×2`). **Do not sort by total duration ascending** — that re-introduces a ladder.

Clicking `Start` on any row: closes the picker window, opens the popover in running state, begins the session.

### 5.5 Profile chart spec

Reusable SwiftUI view: `ProfileChart(mode: Mode, currentIntervalIndex: Int? = nil)`.

- **X-axis**: intervals laid out left-to-right. Bar widths roughly proportional to duration (so a 60-min bar is ~12× wider than a 5-min bar). Small fixed gap between intervals. **Clamp to a minimum bar width of 6pt** so 5-min intervals stay visible in long modes — `4h ×2` has a 48× ratio between shortest and longest, and unclamped 5-min bars become invisible.
- **Y-axis**: heights proportional to work duration. Normalize so the peak work interval in *this mode* hits the top of the chart area. (So all charts visually fill the same vertical space regardless of peak — a 30m mode and a 4h mode both look like complete profiles, the absolute scale is in the labels.)
- **Work bars**: filled coral (`#D85A30`).
- **Rest bars**: short, neutral light-gray (`#F1EFE8`), sit at low fixed height (~10% of chart height).
- **Past intervals** (when `currentIntervalIndex` is set): dimmed to ~40% opacity.
- **Current interval**: full opacity, plus a thin pin marker above the bar with a small dot, plus a darker shade for the elapsed portion.
- **Future intervals**: ~50% opacity preview.

In the running popover, the chart is wider (~300pt) and shows tick labels below (`5  15  30 ←  60 min`). In the picker rows, it's compact (no ticks, no current marker since nothing is running).

---

## 6. Session behaviors

| Action                      | Behavior                                                                                                                |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **Start (from idle)**       | Begin first interval (5min work). No notification fired (user just clicked Start, doesn't need to be told).             |
| **Interval boundary (work→rest)**  | Fire notification: "Focus done — rest [N] minutes." Auto-advance to rest interval. Optional sound.            |
| **Interval boundary (rest→work)**  | Fire notification: "Rest over — focus [N] minutes." Auto-advance. Optional sound.                            |
| **Session complete**        | Fire notification: "Session complete — [mode name]." Return state to `.idle`. Persist `lastUsedMode`.                   |
| **Pause**                   | Freeze elapsed seconds. Menubar shows pause glyph. Resume continues from the same elapsed time.                         |
| **Resume**                  | Continue countdown from frozen elapsed time.                                                                            |
| **Skip**                    | Advance to next interval. If skipping a work interval ≥ 60min, show a small confirmation alert ("Skip this 60-minute focus?"). Skipping the last work interval ends the session and fires the complete-session notification. |
| **Stop**                    | Always confirm ("Stop the session?"). On confirm, return to idle. Don't persist progress (no resume-tomorrow).          |
| **Mac sleep mid-interval**  | Pause the timer. On wake, show menubar in paused state with a brief notification: "UpDoro paused while sleeping." User resumes manually. |

**Switching modes mid-session is not supported.** Stop the session first; the mode is committed when a session starts.

---

## 7. Notifications

- Use `UNUserNotificationCenter`.
- Request permission **on first session start** (not on app launch).
- Default to no banner sound (system default), but make sound configurable.
- Notification content stays factual: "Focus done — rest 5 minutes." No emoji, no exclamation marks.
- **If permission is denied**, the app keeps working: interval boundaries auto-advance, the menubar reflects state changes, and (if sound is enabled in Settings) a sound plays directly via `NSSound`. No in-app banner — the menubar is the source of truth.

---

## 8. Settings

Minimal for v1. Open via the gear icon in the running popover header, or via the right-click menu on the menubar item.

**Right-click menu items:**

- **Pause / Resume** (only while running)
- **Stop** (only while running; same confirmation as the popover Stop)
- **Preferences…**
- **Quit UpDoro**

- Sound on/off (default: on)
- Sound choice (system sounds dropdown, default: Glass)
- Launch at login (uses `SMAppService.mainApp.register()`)

That's it for v1. No keyboard shortcut, no menubar appearance options, no DND integration.

---

## 9. Accessibility

- `NSStatusItem` button has `accessibilityLabel` that reads the full state: "UpDoro — focusing, 22 minutes 14 seconds remaining."
- All buttons in popover/picker have explicit labels.
- Profile chart has an `accessibilityLabel` summarizing the mode: "60-minute mode: ramps from 5 to 60 minutes over 4 intervals, currently on interval 3."
- Respects "Reduce Motion" — no ring animations during streaming, no transitions between states.
- Color is never the sole signal: work/rest is also distinguished by the FOCUS/REST badge text and the pause glyph.

---

## 10. Out of scope for v1

- **Custom modes.** Placeholder row in picker only.
- **History / journal** of completed sessions.
- **Streaks, badges, stats dashboards.**
- **Activity / app-switching monitoring.** Deliberately excluded — see Philosophy #1.
- **iCloud sync, multi-device.**
- **iOS / iPadOS counterparts.**

These were discussed and rejected for v1. Adding any of them would require revisiting the philosophy section.

---

## 11. Build phases

Each phase produces a working, testable app. Don't conflate phases.

### Phase 1: Timer core + menubar

- Data model (`Interval`, `Mode`, `SessionState`, `SessionStore`)
- Built-in modes hardcoded
- `NSStatusItem` with all four states (idle / working / resting / paused)
- Time format logic (`mm:ss` ↔ `h:mm` with `h` suffix)
- Click opens a stub popover that just shows mode name + countdown

**Acceptance:** can start a 30m mode from a debug menu, watch the menubar tick down through the full ramp, get visual confirmation of state changes.

### Phase 2: Running popover

- Full popover layout per §5.3
- Pause / Resume / Skip / Stop wired up to `SessionStore`
- Mode badge, big timer, subtext, footer all live-updating

**Acceptance:** the popover is the primary control surface; no debug menus needed to run a session end-to-end.

### Phase 3: Profile chart

- Reusable `ProfileChart` SwiftUI view per §5.5
- Wire into the running popover

**Acceptance:** the chart renders correctly for all four built-in modes, current-interval marker tracks correctly through a session.

### Phase 4: Mode picker window

- Separate `NSWindow` with the list UI per §5.4
- "Last used" tag, sort order, Start buttons all functional
- Idle popover gets the layout per §5.2 with the "Switch mode" link

**Acceptance:** complete end-to-end flow from a fresh launch — pick a mode, run it, return to idle, see "last used" reflected next time.

### Phase 5: Polish

- Notifications wired up with permission flow
- Settings panel (sound, launch at login)
- Light/dark mode color verification across all surfaces
- Edge cases: clock changes during a session, sleep/wake
- Accessibility labels per §9

---

## 12. Open decisions

These are minor and can be defaulted; flagging in case you want to revise:

1. **Default sound**: Glass (suggested).
2. **Skip confirmation threshold**: confirm before skipping work intervals ≥ 60min (suggested: yes).
3. **Stop confirmation**: always confirm (suggested: yes).
4. **Sleep handling**: pause on sleep, manual resume on wake (suggested).
5. **Clicking the menubar mid-session**: opens the running popover (not the picker).

---

## 13. What the app deliberately does *not* do

A short note for any contributor or future-you tempted to add features:

- It does not measure your "focus quality" or count distractions.
- It does not penalize skipping or stopping.
- It does not gate any mode behind any condition.
- It does not show your "personal record" or anything resembling a leaderboard.
- It does not nag you to start a session.

These are not oversights. They're the product.
