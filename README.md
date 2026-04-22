# ♟️ Rob Chess PWA

Rob Chess is a high-performance, mobile-first Chess Puzzle Progressive Web App built with **Angular 19**. It features a production-ready architecture designed to handle large puzzle datasets (~1GB) seamlessly using sharded lazy-loading and offline-first caching strategies.

![Logo](public/logo.svg)

## 🚀 Live Demo
The application is configured for deployment to **GitHub Pages**. Access the latest build in the `docs/` folder or via your specific GitHub Pages URL.

---

## ✨ Core Features

- **🧩 Interactive Puzzles**: Solving puzzles from beginner to grandmaster level using an integrated `chess.js` engine.
- **📱 Mobile-First UI**: Optimized for iPhone 12 (390x844px) and modern touch devices with smooth animations.
- **🔥 Performance Tracking**:
  - **Streak Counter**: Track consecutive correct moves with automatic reset on failure.
  - **Error Tracking**: Logs total mistakes per puzzle session.
  - **💍 Ring System**: Earn a Blue Ring every 10 puzzles solved.
  - **👑 Crown System**: Earn a Golden Crown by completing a full batch of puzzles.
  - **🪙 Coin Economy**: Earn gold coins based on difficulty (Beginner: 10, Grandmaster: 50). Mistakes reduce the reward by 5 coins.
- **🎨 Customization**:
  - **Board Themes**: Switch between Classic Brown, Ocean Blue, Emerald Green, and Royal Purple.
  - **Piece Sets**: Selection of distinct piece designs (Cburnett, Alpha).
  - **Dark Mode**: Native dark/light mode support with system detection.
- **🌐 Multilingual**: Full support for English, Spanish, **French**, and **Catalan**, switchable on the fly.
- **📊 Play History**: Detailed performance tracking for every attempt, including previous error counts and completion dates.
- **📶 Offline Support (PWA)**: Installable as a standalone app with smart asset caching via Service Workers.
- **🔄 Navigation Modes**:
  - **Sequential (Default)**: Play puzzles in their original order within a batch.
  - **Random Mode**: Toggle random selection in settings for a more varied experience.
- **🔗 Advanced Sharing**: 
  - **Deep Linking**: Share specific puzzles via IDs.
  - **One-Click Copy**: Explicit "Copy Link" button for quick clipboard access.
- **🏆 Reward System**: Earn Blue Rings 💍 and Golden Crowns 👑 for solving puzzles and completing batches.
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
The dev server uses `proxy.conf.js` to serve puzzle data directly from the `docs/` folder to `localhost:4200` without requiring duplicate data in the `src/` or `public/` directories.

### 3. Build for Production
```bash
ng build --configuration=production
```
Build artifacts are exported to the `docs/` directory, making the repository ready for GitHub Pages hosting instantly.

---

## 🎨 UI/UX Legend
- **🔴 Red Pulse**: Indicates an incorrect move or king in check.
- **🟢 Green Dot**: Visual guide for legal moves (can be toggled).
- **🟡 Yellow Ring**: Highlight for capture squares.
- **💡 Hint System**: Shows animated dashed arrows for the correct solution.
- **🔊 Sound FX**: High-pitched chime for success, low buzz for errors (toggleable).
- **⌨️ Shortcuts**: Press **Enter** to skip to the next puzzle or skip a completed one.
- **🌱 Beginner**: Entry-level tactics for learning.
- **📈 Intermediate**: Building your pattern recognition.
- **🔥 Advanced**: Challenging tactical sequences.
- **🎓 Master**: Complex Grandmaster-level problems.
- **🏆 Grandmaster**: The ultimate chess challenge.

---

## 🎛️ Navigation & Controls
Puzzles are navigated using the toolbar **above the board**:
- **⚙️ Settings**: Repositioned to the top header for quick access to board themes and sound.
- **Filter by Theme**: Narrow down puzzles to specific tactics like "Mate in 2" or "Pin".
- **Action Toolbar**: Hint, Retry, Share, and Next buttons are always accessible in a single row.

## 📄 License
This project is for personal use and development demonstration. Puzzle data rights belong to their respective creators (sourced from Lichess open datasets).

Created with ❤️ by Antigravity AI.
