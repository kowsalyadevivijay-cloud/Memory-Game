 🧠✨ Cosmic Memory Match

A browser-based memory (card-matching) game built with plain HTML, CSS, and
JavaScript.
 🎮 What it does

- A grid of face-down cards, each with a hidden matching partner.
- Click any two cards to flip them:
  - ✅ **Match** → both cards stay face-up (with a little pulse animation).
  - ❌ **No match** → both cards flip back face-down after a short delay.
- 🏆 The game is won when every pair on the board has been matched.
- 📊 Live HUD tracks **Moves**, **Time**, and **Matches**, plus your **Best**
  score (fewest moves, tie-broken by fastest time), saved in the browser's
  `localStorage` so it persists between visits.
- 🎚️ Three difficulty levels (Easy: 6 pairs, Medium: 8 pairs, Hard: 10 pairs)
  via the Level dropdown, which reshuffles and redeals the board.
- 🔄 Restart button to reset the current round at any time.
- 🔇 Mute button for the flip/match/win sound effects.
- 📱💻 Responsive layout: the board reflows from 4 columns down to 3 depending
  on screen width, so it's playable on both desktop and mobile.

## 📁 Project structure

```
.
├── index.html   # page structure/markup
├── style.css    # all styling, animations, and the responsive layout
├── script.js    # game logic (DOM manipulation, no external libraries)
├── sounds/      # flip.mp3, match.mp3, win.mp3 (optional — game still
│                   works without these; missing/blocked audio just fails silently)
└── images/      # bg.jpg background image (optional)
```

## ⚙️ Setup

No build tools, package manager, or server-side code required.

1. Clone or download this repository.
2. (Optional) Add your own `images/bg.jpg` background image and
   `sounds/flip.mp3`, `sounds/match.mp3`, `sounds/win.mp3` sound files if you
   want the background art and audio — the game runs fine without them.
3. Open `index.html` directly in a browser, **or** serve the folder with any
   static file server (e.g. the VS Code "Live Server" extension, or
   `npx serve`) for the best experience with browser caching/dev reload.

## 🕹️ How to play

1. Open the page. A shuffled grid of face-down cards appears.
2. Click a card to flip it face-up, then click a second card.
3. If the two images match, they stay revealed. If not, they flip back down
   after about a second — try to remember what you saw!
4. Keep going until every pair is matched to win. 🎉
5. Use **Restart** 🔄 to reshuffle and start over, or the **Level** dropdown
   to change the number of pairs.

## 🛠️ Tech stack

- 🧱 **HTML** — semantic structure for the header, board, and win modal.
- 🎨 **CSS** — Flexbox layout, custom animations (card flip, title shine,
  background gradient), and responsive breakpoints.
- ⚡ **JavaScript (DOM manipulation)** — all game state (flipped
  cards, matches, moves, timer) and logic is handled directly via the DOM
  API, with no external UI framework.
