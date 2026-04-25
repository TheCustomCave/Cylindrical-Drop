# 🌑 Cylindrical Drop

A premium, immersive 3D cylindrical Tetris experience built with **React**, **Three.js**, and **Zustand**. 

## ✨ Features

- **🌀 3D Cylindrical Gameplay:** A unique twist on the classic formula. Rotate the entire tower to find the perfect fit.
- **🗿 Tactile Stone Aesthetics:** Beautifully textured blocks with dynamic lighting, bump mapping, and a "chilled" stone palette.
- **📊 Premium Glassmorphic HUD:** Real-time scoring, line tracking, and difficulty scaling displayed on a sleek, frosted-glass interface.
- **⚙️ Advanced Customization:**
  - **Dynamic Sizing:** Play on Small (32), Standard (64), or Large (96) cylinders.
  - **Starting Fills:** Choose from a clean slate, a classic V-Shape, or a messy Randomized start with cascading gravity.
- **🔊 Immersive Audio:** Procedural "stone clunk" sounds and ambient clear effects with full volume control.

## 🎮 Controls

| Action | Key |
| :--- | :--- |
| **Rotate Cylinder** | `Left` / `Right` Arrow or `A` / `D` |
| **Rotate Piece** | `Up` Arrow or `W` |
| **Soft Drop** | `Down` Arrow or `S` |
| **Pause** | `P` |
| **Volume/Mute** | Control Panel |
| **Drag & Spin** | Mouse / Touch Support |

## 🛠️ Developer Guide

### State Management & Logic
The game's core logic is managed by **Zustand** in `src/store/gameStore.ts`. 
- **Dynamic Radius:** The cylinder's radius is calculated on the fly: `RADIUS = columns / (2 * Math.PI)`. 
- **Collision Detection:** Collision is handled in 2D (row/column) but rendered in 3D. The `getBlockCol` utility handles the wrap-around logic for the cylinder.

### Configuration
You can tweak the game's difficulty and visuals in the following locations:
- **Difficulty Scaling:** Adjusted in `App.tsx` via the `speedMultiplier` calculation (currently +1% every 10 lines).
- **Starting Fills:** Logic for the "V-Shape" and "Randomized" starts can be found in `generateInitialGrid` within the store.
- **Visuals:** Materials are defined in `SettledBlocks.tsx` and `ActivePiece.tsx`. We use a custom `stone_texture.png` with a high `bumpScale` for a tactile feel.

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/TheCustomCave/Cylindrical-Drop.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run locally:**
   ```bash
   npm run dev
   ```

---

Developed with ❤️ by **The Custom Cave**.
