# 📁 檔案整理計畫

## 🗂️ 新的資料夾結構

```
D:\Github-repo\pixel\
├── 📁 Assets\                    # 所有遊戲資源
│   ├── 📁 Boss\                  # Boss相關資源
│   │   ├── 📁 Phase1\            # 第一階段 (寶箱形態)
│   │   │   ├── Attack\           # 攻擊動畫
│   │   │   ├── Idle\             # 待機動畫
│   │   │   ├── Hurt\             # 受傷動畫
│   │   │   └── Close\            # 閉合動畫
│   │   │
│   │   ├── 📁 Phase2\            # 第二階段 (狂暴形態)
│   │   │   ├── Transform\        # 變身動畫
│   │   │   ├── Attack\           # 各種攻擊動畫
│   │   │   ├── Special\          # 特殊技能
│   │   │   └── Death\            # 死亡動畫
│   │   │
│   │   └── 📁 Projectiles\       # 投射物
│   │       ├── Coins\            # 金幣
│   │       ├── Fireballs\        # 火球
│   │       └── Shockwaves\       # 震波
│   │
│   ├── 📁 Player\                # 玩家角色資源
│   │   ├── Idle\                 # 待機
│   │   ├── Walk\                 # 移動
│   │   ├── Jump\                 # 跳躍
│   │   ├── Attack\               # 攻擊
│   │   └── Hurt\                 # 受傷
│   │
│   ├── 📁 Items\                 # 道具資源
│   │   ├── Treasures\            # 寶物
│   │   ├── Weapons\              # 武器
│   │   ├── Potions\              # 藥水
│   │   └── Chests\               # 寶箱道具
│   │
│   ├── 📁 UI\                    # 介面資源
│   │   ├── Buttons\              # 按鈕
│   │   ├── Icons\                # 圖標
│   │   ├── HUD\                  # 遊戲介面
│   │   ├── Menus\                # 選單
│   │   └── EndScreens\           # 結束畫面
│   │       ├── Victory\          # 勝利畫面
│   │       └── Defeat\           # 失敗畫面
│   │
│   ├── 📁 Backgrounds\           # 背景圖片
│   │   ├── Dungeons\             # 地下城背景
│   │   ├── StartScreen\          # 開始畫面
│   │   └── BattleArenas\         # 戰鬥場景
│   │
│   └── 📁 Effects\               # 特效資源
│       ├── Particles\            # 粒子效果
│       ├── Explosions\           # 爆炸效果
│       └── Magic\                # 魔法效果
│
├── 📁 Docs\                      # 文檔資料
│   ├── GameDesign\               # 遊戲設計文檔
│   ├── Technical\                # 技術文檔
│   └── Updates\                  # 更新記錄
│
├── 📁 Archive\                   # 封存的舊檔案
│   ├── OldVersions\              # 舊版本
│   └── Deprecated\               # 已棄用檔案
│
├── index.html                    # 主遊戲檔案
└── README.md                     # 專案說明
```

## 🔄 需要移動的檔案

### 1. Boss動畫檔案
- **從**: `MimicBoss/Assets/Sprites/Attack/`
- **到**: `Assets/Boss/Phase1/Attack/`

### 2. 背景圖片
- **從**: `dungeon-start-bg.png`, `castle-background.png`
- **到**: `Assets/Backgrounds/`

### 3. 舊的測試檔案
- **從**: `game.html`, `test.html`, `index-old.html`, `index-backup.html`
- **到**: `Archive/OldVersions/`

### 4. 文檔檔案
- **從**: 根目錄的所有 `.md` 檔案
- **到**: `Docs/` 相應子資料夾

## 🗑️ 建議刪除的檔案

### 可以安全刪除：
1. `micmic/` - 舊的動畫資料夾（已被新路徑取代）
2. `js/` - 未使用的JavaScript檔案（遊戲都在index.html中）
3. `SuperClaude_Framework/` - 超大且與遊戲無關
4. 重複的HTML檔案（保留一個備份即可）

### 需要確認：
1. `MimicBoss/Source/Scripts/` - C#檔案（如果不是Unity專案可刪除）
2. `MimicBoss/Web/` - 舊的web版本檔案

## ✅ 執行步驟

1. **創建新資料夾結構** ✅
2. **移動Boss動畫到新位置**
3. **移動背景圖片**
4. **整理文檔**
5. **封存舊檔案**
6. **更新index.html中的路徑**
7. **刪除不需要的檔案**
8. **創建新的README**

## 🎯 最終目標

- 清晰的資源組織
- 易於擴展（新增關卡、角色、道具）
- 減少專案大小
- 提高開發效率

要我開始執行這個整理計畫嗎？