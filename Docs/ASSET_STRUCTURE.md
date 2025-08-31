# 🗂️ 遊戲資源檔案結構建議

## 📁 目前結構
```
C:\Users\leoch\Documents\GitHub\pixel\
├── index.html              # 主遊戲檔案
├── game.html              # 備用遊戲檔案
├── css\
│   └── game-styles.css    # 遊戲樣式
├── js\                    # JavaScript檔案
│   ├── mimicBoss.js       # Boss邏輯
│   ├── boss-ai.js         # AI系統
│   └── particles.js       # 粒子效果
├── Assets\
│   ├── Boss\
│   │   └── MimicBoss\
│   │       └── Sprites\
│   │           ├── Attack\        # 攻擊動畫 (7幀)
│   │           ├── Transform\     # 變身動畫 (9幀)
│   │           └── Idle\          # 待機動畫
│   └── Backgrounds\               # 背景圖片
│       ├── castle-background.png
│       └── dungeon-start-bg.png
└── audio\                         # 音效檔案
    ├── level1-bgm.mp3
    └── menu-bgm.mp3
```

## 📁 建議的完整結構

```
C:\Users\leoch\Documents\GitHub\pixel\
├── index.html
├── MimicBoss\
│   └── Assets\
│       └── Sprites\
│           ├── Phase1\              # 🟢 第一階段資源
│           │   ├── Attack\          # 攻擊動畫 (已有)
│           │   │   └── boss_attack_frame1-7.png
│           │   ├── Idle\            # 待機動畫
│           │   │   └── idle_frame1-3.png
│           │   ├── Hurt\            # 受傷動畫
│           │   │   └── hurt_frame1-3.png
│           │   └── Walk\            # 移動動畫
│           │       └── walk_frame1-4.png
│           │
│           ├── Phase2\              # 🔴 第二階段資源 (建議放這裡!)
│           │   ├── Attack\          # 第二階段攻擊
│           │   │   ├── Fireball\    # 火球攻擊
│           │   │   │   └── fireball_frame1-6.png
│           │   │   ├── Slam\        # 震地攻擊
│           │   │   │   └── slam_frame1-5.png
│           │   │   └── Rage\        # 狂暴攻擊
│           │   │       └── rage_frame1-8.png
│           │   ├── Transform\       # 變身動畫
│           │   │   └── transform_frame1-10.png
│           │   ├── Idle\            # 第二階段待機
│           │   │   └── idle_rage_frame1-4.png
│           │   └── Death\           # 死亡動畫
│           │       └── death_frame1-8.png
│           │
│           └── Projectiles\         # 投射物
│               ├── Coin\            # 金幣
│               │   └── coin_frame1-3.png
│               ├── Fireball\        # 火球
│               │   └── fireball_projectile_frame1-4.png
│               └── Shockwave\       # 震波
│                   └── shockwave_frame1-5.png
```

## 🎯 推薦做法

### 選項 1: 最簡單 (推薦) ⭐
在現有的 `MimicBoss/Assets/Sprites/` 下創建 `Phase2` 資料夾：
```
MimicBoss/Assets/Sprites/Phase2/
├── attack_frame1-8.png     # 第二階段基本攻擊
├── fireball_frame1-6.png   # 火球攻擊
├── slam_frame1-5.png       # 震地攻擊
└── transform_frame1-10.png # 變身動畫
```

### 選項 2: 分離攻擊類型
```
MimicBoss/Assets/Sprites/
├── Attack/          # 保留第一階段
└── Attack_Phase2/   # 新增第二階段
    ├── fireball_frame1-6.png
    ├── slam_frame1-5.png
    └── rage_frame1-8.png
```

### 選項 3: 完全分離階段
```
MimicBoss/
├── Phase1/          # 第一階段所有資源
│   └── Attack/
└── Phase2/          # 第二階段所有資源
    ├── Attack/
    ├── Transform/
    └── Effects/
```

## 💻 程式碼對應更新

```javascript
// 在 loadAnimations() 中
loadAnimations() {
    // 攻擊動畫
    for (let i = 1; i <= 7; i++) {
        const img = new Image();
        img.src = `Assets/Boss/MimicBoss/Sprites/Attack/boss_attack_frame${i}.png`;
        this.animations.attack.push(img);
    }
    
    // 變身動畫
    for (let i = 1; i <= 9; i++) {
        const img = new Image();
        img.src = `Assets/Boss/MimicBoss/Sprites/Transform/micmic_transform_frame_${i}.png`;
        this.animations.transform.push(img);
    }
}
```

## 📝 建議

1. **短期**: 使用**選項1**，在 `MimicBoss/Assets/Sprites/` 下創建 `Phase2` 資料夾
2. **長期**: 如果資源越來越多，可以考慮**選項3**的完整分離
3. **命名規則**: 保持一致的命名格式 `{動作}frame{編號}.png`

你想用哪種方式？我可以幫你創建資料夾結構！