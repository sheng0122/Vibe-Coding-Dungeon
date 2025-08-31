# 🎮 Vibe Coding Dungeon

一個像素風格的地下城冒險遊戲，使用純 HTML5 Canvas 和 JavaScript 開發，具有完整的戰鬥系統、Buff 機制和動態特效。

## 🎯 專案概述

這是一個功能完整的網頁版動作遊戲，玩家需要挑戰 Mimic Boss（寶箱怪），收集禮盒獲得強化，體驗豐富的戰鬥系統。

### 核心特色
- 🎨 **像素藝術風格** - 復古 8-bit 視覺風格
- ⚔️ **Boss 戰鬥系統** - 智能 AI、三階段變化
- 🎁 **禮盒 Buff 系統** - 4 種隨機強化效果
- ✨ **動態特效** - ctrl+c/ctrl+v 文字飄散、粒子效果
- 📱 **全平台支援** - 桌面/手機響應式設計

### 遊戲檔案
- **index.html** (約 130KB) - 完整遊戲，所有程式碼內嵌，無需伺服器
- **game.html** (10KB) - 測試版本，使用外部 JS 模組
- **boss-transform-fix.html** (9KB) - Boss 變身動畫測試

## 🎮 操作說明

### 鍵盤控制
- **←/→**: 左右移動
- **↑**: 跳躍
- **空白鍵**: 攻擊
- **F**: 全螢幕切換
- **ESC**: 退出全螢幕

### 手機觸控
- 使用螢幕上的虛擬按鈕（自動顯示）
- 必須橫向持握（直向會提示旋轉）
- 左側：方向控制
- 右側：攻擊按鈕

## 📁 專案結構

```
pixel/
├── 主要遊戲檔案
│   ├── index.html              # 完整遊戲（101KB，所有程式內嵌）
│   ├── game.html               # 測試版（使用外部 JS）
│   └── boss-transform-fix.html # 動畫測試
│
├── Assets/
│   ├── Boss/MimicBoss/Sprites/
│   │   ├── Attack/             # 7 張攻擊動畫圖片
│   │   ├── Idle/               # 1 張待機圖片
│   │   └── Transform/          # 9 張變身動畫圖片
│   ├── Backgrounds/
│   │   ├── castle-background.png
│   │   └── dungeon-start-bg.png
│   ├── Scripts/                # Unity C# 腳本（18個檔案）
│   │   ├── AI/                 # BehaviorTree.cs, DecisionMaker.cs, MimicAI.cs
│   │   ├── Combat/             # AttackSystem.cs, DamageCalculator.cs, SkillManager.cs
│   │   │   └── Projectiles/    # BoomerangProjectile.cs, GoldCoinProjectile.cs, GoldCoinTrap.cs
│   │   ├── Core/               # MimicController.cs, MimicData.cs, MimicStateMachine.cs, MimicResourceManager.cs
│   │   ├── Animation/          # AnimationController.cs, AnimationEvents.cs
│   │   ├── Optimization/       # MimicLODController.cs, ObjectPoolManager.cs
│   │   └── Utilities/          # CameraShaker.cs
│   ├── Resources/
│   │   └── MimicBossConfig.json # Boss 配置檔
│   └── Audio/                  # 空資料夾（Music/, SFX/）
│
├── js/                         # JavaScript 模組（game.html 使用）
│   ├── resourceLoader.js      # 資源載入器
│   ├── mimicBoss.js           # Boss 類別
│   ├── boss-ai.js             # Boss AI
│   ├── game-engine.js         # 遊戲引擎
│   ├── main.js                # 主程式
│   ├── dynamic-programming.js # 動態規劃演算法
│   └── random-algorithms.js   # 隨機演算法
│
├── audio/
│   ├── menu-bgm.mp3          # 選單音樂
│   └── level1-bgm.mp3        # 關卡音樂
│
├── Archive/                   # 舊版本備份
├── Docs/                      # 專案文檔
├── SuperClaude_Framework/     # SuperClaude 框架檔案
└── .editorconfig             # 程式碼風格設定
```

## 🚀 快速開始

1. 直接開啟 `index.html` 即可遊玩
2. 不需要任何伺服器或建置工具
3. 支援所有現代瀏覽器（Chrome、Firefox、Safari、Edge）
4. 手機請使用橫向模式以獲得最佳體驗

## 🛠️ 技術實作

### 主遊戲 (index.html)
- 完整的遊戲邏輯內嵌在單一 HTML 檔案中
- 主要類別：
  - `GameEngine` - 遊戲引擎、渲染、物理系統
  - `Player` - 玩家控制、Buff 系統
  - `MimicBoss` - Boss AI、三階段變化
  - `GiftBox` - 禮盒掉落、Buff 隨機
  - `Airplane` - 廣告飛機系統
- 使用 Three.js (CDN) 處理 3D 效果
- 使用 Google Fonts (Press Start 2P) 提供像素字體
- Canvas 2D API 繪製所有遊戲元素

### 測試版本 (game.html)
- 使用外部 JavaScript 模組
- 引用 `js/resourceLoader.js` 和 `js/mimicBoss.js`
- 簡化的遊戲邏輯用於測試

### 資源現況
✅ **已完成功能**
- 完整的 Boss AI 系統和三階段變化
- 禮盒 Buff 系統（4 種隨機效果）
- ctrl+c/ctrl+v 文字特效
- 粒子系統（傷害、治療、金幣）
- 飛機廣告系統
- 連擊計分系統
- 音樂淡入淡出
- 手機觸控支援
- 全螢幕模式

📁 **資源檔案**
- Boss 攻擊動畫（7 幀）
- Boss 變身動畫（9 幀）
- Boss 待機圖片
- 背景圖片（2 張）
- 背景音樂（2 首）
- Boss 配置檔（JSON）
- Unity C# 腳本（18 個）

⚠️ **現有限制**
- 玩家角色使用程式繪製（無圖片資源）
- 無音效（僅有背景音樂）

## 🎮 遊戲系統

### 核心功能
- **智能 Boss AI** - 三階段變化、多種攻擊模式、智能決策系統
- **禮盒系統** - 血量低於 50% 觸發、每 10 秒掉落、4 種隨機 Buff
- **Buff 效果**:
  - 🟢 **無敵狀態** - 10 秒無視攻擊，結束後滿血
  - 🔵 **速度提升** - 2.5 倍移動和攻擊速度
  - 🟣 **吸血攻擊** - 1.5 倍攻擊力並回復生命
  - 🔴 **被祖了** - 立即死亡（25% 機率）
- **飛機廣告** - 定時飛過拉布條宣傳
- **連擊系統** - 連續攻擊獲得更高分數
- **動態特效** - ctrl+c/ctrl+v 文字飄散、粒子系統

### 遊戲流程
1. 開始畫面 → 點擊開始冒險
2. 引導視窗 → 了解操作方式
3. Boss 戰鬥 → 擊敗寶箱怪
4. 結束畫面 → 顯示分數和折扣碼

### Boss 設計
- **血量**: 500 HP
- **三階段變化**:
  - 第一階段 (100%-66%): 基礎攻擊
  - 第二階段 (66%-33%): 速度提升、攻擊頻率增加
  - 第三階段 (33%-0%): 狂暴化、全方位攻擊
- **AI 行為**:
  - 智能追蹤玩家
  - 預判玩家位置
  - 角落逃脫機制
  - 跳躍攻擊

### 玩家屬性
- **血量**: 100 HP
- **攻擊力**: 10（可被 Buff 加成）
- **移動速度**: 250 px/s（可被 Buff 加成）
- **跳躍力**: 450

## 📝 開發說明

### 為什麼有重複的程式碼？
- `index.html` 包含完整的內嵌程式碼（主要版本）
- `js/` 資料夾的模組是為了測試和未來模組化準備
- Unity C# 腳本是為了可能的 Unity 版本移植

### Unity 腳本用途
`Assets/Scripts/` 中的 C# 腳本包含完整的 Unity 實作：
- AI 行為樹系統
- 戰鬥與傷害計算
- 狀態機管理
- 物件池優化

## 🔧 開發資訊

### Debug 模式
URL 參數：
- `?debug=true` - 顯示 debug 資訊
- `?mobile=true` - 強制顯示手機控制

### 效能優化
- 使用 `requestAnimationFrame` 確保 60 FPS
- 像素藝術渲染（`image-rendering: pixelated`）
- 物件池管理（粒子、投射物）
- Canvas 層級渲染優化

### 響應式設計
- 桌面版：800x400 畫布尺寸
- 手機版：自動調整畫布比例
- 觸控按鈕：橫向模式自動顯示

## 📦 版本資訊

### v1.0.0 (2025-08-30)
- ✅ 完整的 Boss 戰鬥系統
- ✅ 禮盒 Buff 機制
- ✅ 動態特效系統
- ✅ 手機支援
- ✅ 遊戲進度 86% 完成

### 待開發功能
- [ ] 玩家角色精靈圖
- [ ] 音效系統
- [ ] 更多 Boss 類型
- [ ] 關卡系統
- [ ] 成就系統

## 📄 授權

學習專案 - 僅供教育和參考用途

---

**最後更新**: 2025-08-30  
**開發進度**: 86% 完成  
**檔案統計**: 
- 3 個 HTML 遊戲檔案
- 17 張 Boss 圖片
- 18 個 C# 腳本
- 7 個 JavaScript 模組
- 2 首背景音樂
- 1 份動畫檢查清單

## 👥 聯絡資訊

如有問題或建議，歡迎透過 GitHub Issues 回報。