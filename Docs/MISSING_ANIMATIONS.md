# 缺少的動畫資源清單

## 更新日期：2025-08-31
## 狀態：已整理為任務清單

根據程式碼分析，以下是遊戲中定義但缺少對應動畫檔案的動作：

## Boss (Mimic Boss) 缺少的動畫

### 1. **死亡動畫 (Death Animation)**
- **狀態**：`state = 'dying'` / `playAnimation('death')`
- **預期路徑**：`Assets/Boss/MimicBoss/Sprites/Death/`
- **目前狀況**：資料夾存在但沒有動畫檔案，使用程式化繪製 (programmatic)
- **建議檔案**：
  - `death_frame1.png` ~ `death_frame5.png`

### 2. **第三階段待機動畫 (Phase 3 Idle)**
- **狀態**：`phase === 3` 的待機動畫
- **預期路徑**：`Assets/Boss/MimicBoss/Sprites/Idle/Idle_Phase3.png`
- **目前狀況**：檔案不存在，fallback 到 `Idle_Disguise.png`
- **建議檔案**：
  - `Idle_Phase3.png` 或
  - `phase3_idle_frame1.png` ~ `phase3_idle_frameN.png`

### 3. **第三階段攻擊動畫 (Phase 3 Attack)**
- **狀態**：`phase === 3` 的攻擊動畫
- **預期路徑**：`Assets/Boss/MimicBoss/Sprites/Attack/boss_attack_phase3_frame{1-7}.png`
- **目前狀況**：檔案不存在，fallback 到普通攻擊動畫
- **建議檔案**：
  - `boss_attack_phase3_frame1.png` ~ `boss_attack_phase3_frame7.png`

### 4. **第二階段待機動畫 (Phase 2 Idle)**
- **狀態**：`phase === 2` 的待機動畫
- **預期路徑**：`Assets/Boss/MimicBoss/Sprites/Phase2/Idle/`
- **目前狀況**：資料夾存在但沒有動畫檔案
- **建議檔案**：
  - `phase2_idle_frame1.png` ~ `phase2_idle_frameN.png`

### 5. **移動動畫 (Movement Animation)**
- **狀態**：Boss 移動時
- **目前狀況**：標記為 'programmatic'，使用程式化繪製
- **建議檔案**：
  - `move_frame1.png` ~ `move_frameN.png`

### 6. **特殊技能動畫**
根據 `js/mimicBoss.js` 的定義，以下技能可能需要動畫：
- **咬擊 (Bite)** - 近距離攻擊
- **舌頭鞭打 (Tongue Whip)** - 中距離攻擊
- **跳躍攻擊 (Jump Attack)**
- **金幣噴射 (Gold Spray)**
- **狂暴連擊 (Rage Combo)** - 第三階段特殊技能

## 玩家角色 (Player) 缺少的動畫

目前玩家角色完全使用程式化繪製（藍色方塊），沒有任何動畫檔案。

### 建議增加的玩家動畫：
1. **待機動畫** - `player_idle_frame1.png`
2. **行走動畫** - `player_walk_frame1.png` ~ `player_walk_frame4.png`
3. **跳躍動畫** - `player_jump_frame1.png` ~ `player_jump_frame3.png`
4. **攻擊動畫** - `player_attack_frame1.png` ~ `player_attack_frame3.png`
5. **受傷動畫** - `player_hurt_frame1.png`
6. **死亡動畫** - `player_death_frame1.png` ~ `player_death_frame3.png`

## 特效動畫 (VFX)

`Assets/Boss/MimicBoss/VFX/` 資料夾存在但沒有任何檔案。

### 建議增加的特效：
1. **變身特效** - 配合 Three.js 效果
2. **攻擊命中特效**
3. **金幣噴射特效**
4. **傷害數字特效**（目前使用文字渲染）

## 禮物狀態圖示 (Gift States)

目前已有的圖示：
- ✅ `copy_paste.png` - 複製貼上（吸血）
- ✅ `cursed.png` - 被祖了
- ✅ `invincible.png` - 無敵
- ✅ `run_dont_walk.png` - 速度提升

## 任務清單（按優先級排序）- 2025-08-31 更新

### ✅ 已存在的動畫：
- ✅ Boss 死亡動畫 (5幀) - `death_frame1-5.png` **存在**
- ✅ Boss 第三階段待機動畫 (6幀) - `phase3_idle_frame1-6.png` **存在**
- ✅ Boss 第三階段移動動畫 (5幀) - `phase3_move_frame1-5.png` **存在**
- ✅ Boss 覺醒待機動畫 (2幀) - `awakened_idle_frame1-2.png` **存在**
- ✅ Boss 覺醒移動動畫 (5幀) - `awakened_move_frame1-5.png` **存在**
- ✅ Boss 攻擊動畫 (7幀) - `boss_attack_frame1-7.png` **存在**
- ✅ Boss 變身動畫 (9幀) - `micmic_transform_frame_1-9.png` **存在**
- ✅ Boss 火球彈幕動畫 (7幀) - `fireball_barrage_frame1-7.png` **存在**

### 🔴 高優先級（需要修復或製作）：
- [ ] **Boss 第三階段攻擊動畫** - 程式碼尋找 `boss_attack_phase3_frame1-7.png` 但檔案不存在
- [ ] **Boss 關合動畫** - 程式碼需要 `closing` 動畫但檔案缺失
- [ ] **玩家所有動畫** - 完全沒有圖片，全用程式繪製：
  - [ ] 玩家待機動畫 - `player_idle_frame1.png`
  - [ ] 玩家行走動畫 (4幀) - `player_walk_frame1-4.png`
  - [ ] 玩家攻擊動畫 (3幀) - `player_attack_frame1-3.png`
  - [ ] 玩家跳躍動畫 (3幀) - `player_jump_frame1-3.png`
  - [ ] 玩家受傷動畫 - `player_hurt_frame1.png`

### 🟡 中優先級（增強效果）：
- [ ] VFX 特效 - 資料夾存在但完全空白
- [ ] 攻擊命中特效
- [ ] 金幣收集特效

### 🟢 低優先級（額外內容）：
- [ ] Boss 特殊技能動畫（咬擊、舌頭鞭打等）
- [ ] 環境特效
- [ ] UI 動畫

## 技術註記

- 程式已實作動畫系統，支援多幀動畫播放
- 動畫速度可調整（`animationSpeed`）
- 支援不同階段使用不同動畫集
- 變身動畫已實作自定義幀序列（每幀重複3次）

## 檔案命名規範

建議統一使用以下命名規範：
- `{character}_{action}_frame{number}.png`
- 例如：`boss_death_frame1.png`、`player_walk_frame1.png`

## 資源載入器支援

`js/resourceLoader.js` 已實作資源載入系統，新增動畫檔案後需要：
1. 在 `assetList` 中註冊新動畫
2. 在 `loadAnimations()` 中載入
3. 在 `getAnimationFrames()` 中提供存取方法