# Pixel Dungeon Game - Project Structure

## 📁 Project Overview

This is a pixel art dungeon crawler game featuring a player character battling against the MimicBoss with multiple phases and special abilities.

## 🗂️ Directory Structure

```
pixel/
├── Assets/                     # Game assets
│   ├── Backgrounds/           # Background images
│   ├── Boss/                  # Boss sprites and animations
│   │   └── MimicBoss/
│   │       └── Sprites/
│   │           ├── Attack/    # Boss attack animations
│   │           ├── Bite/      # Boss bite animations
│   │           ├── Death/     # Boss death animations
│   │           ├── Transform/ # Boss transformation animations
│   │           └── ...        # Other boss animations
│   ├── GiftStates/           # Gift box power-up images
│   ├── Items/                # Game items (airplane, etc.)
│   └── Player/               # Player sprites and animations
│       └── Sprites/
│           ├── Attack/       # Player attack animations
│           ├── Idle/         # Player idle animations
│           └── Walk/         # Player walk animations
│
├── audio/                     # Sound effects and music
│   ├── menu-bgm.mp3          # Menu background music
│   ├── game-bgm.mp3          # Game background music
│   └── boss-bgm.mp3          # Boss battle music
│
├── MimicBoss/                # Unity project files (optional)
│   ├── Assets/
│   ├── Documents/
│   └── Web/
│
├── SuperClaude_Framework/    # AI assistant framework
│
├── index.html                # Main game file
├── README.md                 # Project documentation
├── CLAUDE.md                 # AI assistant instructions
├── .gitignore               # Git ignore configuration
└── PROJECT_STRUCTURE.md     # This file
```

## 🎮 Game Features

### Player
- **Movement**: Arrow keys or WASD
- **Attack**: Space bar
- **Animations**: Idle, Walk, Attack (4 frames each)
- **Size**: 96x96 pixels
- **Health**: 100 HP

### Boss (MimicBoss)
- **Phase 1**: Disguised chest form
- **Phase 2**: Awakened form (HP < 50%)
- **Phase 3**: Final transformation (HP < 30%)
- **Attacks**: 
  - Bite attack (4 frames)
  - Gold coin projectiles
  - Fireball barrage
- **Size**: 128x128 pixels

### Power-ups (Gift Boxes)
- **Invincible**: Green shield effect (10 seconds)
- **Speed Boost**: Cyan speed lines (10 seconds)
- **Vampire**: Purple aura with life steal (10 seconds)

### Visual Effects
- **Three.js Integration**: 3D particle effects for buffs
- **Responsive Design**: Adapts to different screen sizes
- **Mobile Support**: Touch controls for mobile devices

## 🛠️ Technologies Used

- **HTML5 Canvas**: Main game rendering
- **Three.js**: 3D buff effects
- **JavaScript**: Game logic
- **CSS3**: Styling and animations
- **Microsoft Clarity**: Analytics tracking

## 📝 Important Files

### Core Files
- `index.html`: Complete game implementation
- `README.md`: User documentation

### Configuration
- `.gitignore`: Specifies files to ignore in version control
- `CLAUDE.md`: Instructions for AI assistant
- `.editorconfig`: Editor configuration

### Assets Required
All sprite assets are stored in the `Assets/` directory and are essential for the game to function properly.

## 🚀 Deployment

The game can be deployed by serving the `index.html` file along with the `Assets/` and `audio/` directories. No build process is required as it's a pure HTML5/JavaScript game.

## 📊 Analytics

Microsoft Clarity tracking is integrated with ID: `t38s0rk3ln`

## 🎯 Game Endings

- **Victory**: Defeat the boss → WINNER discount code → Link to https://lihi.cc/op2ya
- **Defeat**: Lose to the boss → FIGHTER discount code → Link to https://lihi.cc/YCw6a