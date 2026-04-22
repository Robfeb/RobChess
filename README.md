# ♟️ Rob Chess PWA

Rob Chess is a high-performance, mobile-first Chess Puzzle Progressive Web App built with **Angular 19**. It features a production-ready architecture designed to handle large puzzle datasets (~1GB) seamlessly using sharded lazy-loading and offline-first caching strategies.

![Logo](public/logo.svg)

## 🚀 Live Demo
The application is configured for deployment to **GitHub Pages**. Access the latest build in the `docs/` folder or via your specific GitHub Pages URL.

---

## ✨ Core Features

- **🧩 Interactive Puzzles**: Solve puzzles ranging from Beginner to Grandmaster level using an integrated `chess.js` engine.
- **📱 Mobile-First UI**: Optimised for iPhone 12 (390×844px) and modern touch devices with smooth animations and a board-first layout.
- **👑 Crown Economy**:
  - Earn **1 Crown** for every puzzle you solve.
  - Earn **+50 Crowns** bonus when you complete a full puzzle batch.
  - Every 10 puzzles solved also grants an additional Crown.
  - Crowns are tracked per difficulty level with a colour-coded breakdown in the header.
- **🪙 Coin Economy**: Earn gold coins based on difficulty (Beginner: 10 → Grandmaster: 50). Mistakes reduce the reward by 5 coins per error.
- **🔥 Performance Tracking**:
  - **Streak Counter**: Track consecutive correct moves with automatic reset on failure.
  - **Error Tracking**: Logs total mistakes per puzzle session.
- **🎨 Customisation**:
  - **Board Themes**: Switch between Classic Brown, Ocean Blue, Emerald Green, and Royal Purple.
  - **Piece Sets**: Selection of distinct piece designs (Cburnett, Chess24).
  - **Dark Mode**: Native dark/light mode support.
  - **Show Legal Move Dots**: Toggled via the ⚙️ Settings menu (not shown by default on mobile to save space).
- **🌐 Multilingual**: Full support for **English**, **Spanish**, **French**, and **Catalan**, switchable on the fly.
- **📊 Play History**: Detailed performance tracking for every attempt, including previous error counts and completion dates.
- **📶 Offline Support (PWA)**: Installable as a standalone app with smart asset caching via Service Workers.
- **🔄 Navigation Modes**:
  - **Sequential (Default)**: Play puzzles in their original order within a batch.
  - **Random Mode**: Toggle random selection in Settings for a varied experience.
- **🔗 Sharing**: Share the current puzzle URL with the native share sheet or clipboard fallback.
- **🔊 Audio Feedback**: Toggleable sound effects for puzzle completion and mistakes.

---

## 🛠️ Technology Stack

- **Framework**: [Angular 19+](https://angular.dev/) (Standalone Components, Signals)
- **Engine**: [Chess.js](https://github.com/jhlywa/chess.js) (Logic & Move Validation)
- **Styling**: Vanilla CSS (Custom Properties, Flexbox, CSS Grid)
- **Icons**: [Sharp](https://sharp.pixelplumbing.com/) & [png-to-ico](https://github.com/theinternand/png-to-ico) for automated asset generation.
- **PWA**: [Angular Service Worker](https://angular.dev/ecosystem/service-workers)

---

## 📂 Data Architecture

To maintain high performance without bundling massive JSON files, the app uses a **Sharded Data Retrieval** strategy:

1. **Structure Metadata**: On boot, the app loads `puzzles_data/structure.json` to understand level batch counts.
2. **Dynamic Sharding**: Individual batch files are fetched only when needed using the formula:
   `path = ./puzzles_data/${level}/${Math.floor(batchIndex / shard_size)}/batch_${batchIndex}.json`
3. **Theme Indexing**: Tactics-based filtering is powered by `themes_{level}.json` files which map themes to specific batch indices for rapid lookup.

---

## 💻 Development & Debugging

Since the puzzle data (~1GB) lives in the `docs/puzzles_data` folder for production, a proxy is configured to allow easy access during development.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run start
```
The dev server uses `proxy.conf.js` to serve puzzle data directly from the `docs/` folder to `localhost:4200` without requiring duplicate data.

### 3. Build for Production
```bash
ng build --configuration=production
```
Build artifacts are exported to the `docs/` directory, making the repository ready for GitHub Pages hosting instantly.

---

## 🎨 UI / UX Overview

### Board Layout
- The **"You play as White / Black"** badge is displayed **above the board** so the active colour is always visible.
- When a puzzle is solved, a **Puzzle Complete overlay** appears directly on the board showing:
  - 👑 Crowns earned (including any batch bonus).
  - 🪙 Coins earned.
  - **Next Puzzle** and **Retry** buttons — no scrolling required.

### Level & Theme Selection
- Difficulty tabs run across the top: 🌱 Beginner · 📈 Intermediate · 🔥 Advanced · 🎓 Master · 🏆 Grandmaster.
- A **🔍 Filter tab** sits alongside the difficulty tabs. Selecting it reveals a theme picker (Mate in 2, Pin, Fork, etc.) inline below the tabs.
- On **mobile (≤600px)** the tabs collapse into a single `<select>` dropdown for a compact layout.

### Header & Controls
- ⚙️ Settings, ❓ Help, 👑 Crown tracker, and 🪙 Coin display are always in the header.
- The action strip above the board contains: 💡 Hint · 🔄 Retry · 📤 Share · Next Puzzle.
- **Legal move dots 🎯** and other display options live in the ⚙️ Settings dropdown.

### Reward System
| Event | Reward |
|---|---|
| Solve a puzzle (no errors) | +1 Crown + full Coin reward |
| Solve a puzzle (with errors) | +1 Crown + reduced Coins (−5 per error) |
| Complete a full batch | +50 Crowns bonus |

---

## 🎛️ UI Legend
- **🔴 Red Shake**: Indicates an incorrect move.
- **🟡 Yellow Glow**: King in check.
- **🟢 Green Dot**: Legal move indicator (toggle in Settings).
- **🟡 Capture Ring**: Highlight for capturable squares.
- **💡 Hint Arrow**: Animated dashed arrow showing the correct solution move.
- **🔊 Sound FX**: Chime for success, low buzz for errors (toggleable in Settings).
- **⌨️ Shortcut**: Press **Enter** to jump to the next puzzle.

---

## 📄 License
This project is for personal use and development demonstration. Puzzle data rights belong to their respective creators (sourced from Lichess open datasets).

Created with ❤️ by Antigravity AI.
