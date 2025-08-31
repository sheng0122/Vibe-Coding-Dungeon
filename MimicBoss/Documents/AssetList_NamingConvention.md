# 寶箱怪資源清單與命名規範

## 文檔資訊
- 版本：v1.0
- 更新日期：2025-08-27
- 全團隊參考文檔

---

## 1. 命名規範總則

### 1.1 通用規則
- 使用**英文命名**，避免中文或特殊字符
- 使用**駝峰命名法**(CamelCase)或**下劃線分隔**(Snake_Case)
- 保持命名**簡潔明瞭**但具描述性
- 版本號使用 **_v01, _v02** 格式
- 避免空格，使用下劃線替代

### 1.2 命名結構
```
[類型前綴]_[對象名稱]_[狀態/變體]_[序號]_[版本]
範例: SPR_Mimic_Idle_01_v01
```

---

## 2. 資源類型前綴

| 前綴 | 類型 | 範例 |
|------|------|------|
| SPR | Sprite (精靈圖) | SPR_Mimic_Body |
| TEX | Texture (紋理) | TEX_Wood_Diffuse |
| ANIM | Animation (動畫) | ANIM_Mimic_Bite |
| VFX | Visual Effect (特效) | VFX_GoldExplosion |
| SFX | Sound Effect (音效) | SFX_Bite_Impact |
| BGM | Background Music (背景音樂) | BGM_Boss_Battle |
| UI | User Interface (介面) | UI_HealthBar_Boss |
| ICON | Icon (圖標) | ICON_Skill_Bite |
| MAT | Material (材質) | MAT_Wood_Rough |
| PREFAB | Prefab (預製體) | PREFAB_Mimic_Boss |
| SCRIPT | Script (腳本) | SCRIPT_MimicAI |

---

## 3. 完整資源清單

### 3.1 精靈圖資源 (Sprites)

#### 角色本體
| 檔案名稱 | 說明 | 尺寸 | 數量 |
|----------|------|------|------|
| SPR_Mimic_Box_Closed | 箱子關閉狀態 | 128x128 | 1 |
| SPR_Mimic_Box_Damaged_01-03 | 箱子受損狀態 | 128x128 | 3 |
| SPR_Mimic_Body_Full | 完整怪物形態 | 256x256 | 1 |
| SPR_Mimic_Tongue | 舌頭部件 | 128x32 | 1 |
| SPR_Mimic_Teeth_Upper | 上排牙齒 | 128x32 | 1 |
| SPR_Mimic_Teeth_Lower | 下排牙齒 | 128x32 | 1 |
| SPR_Mimic_Eye_Left | 左眼 | 32x32 | 1 |
| SPR_Mimic_Eye_Right | 右眼 | 32x32 | 1 |

#### 動畫序列
| 檔案名稱 | 說明 | 尺寸 | 幀數 |
|----------|------|------|------|
| SPR_Mimic_Idle_Disguise_01-10 | 偽裝待機 | 128x128 | 10 |
| SPR_Mimic_Idle_Combat_01-15 | 戰鬥待機 | 256x256 | 15 |
| SPR_Mimic_Transform_01-40 | 覺醒變身 | 256x256 | 40 |
| SPR_Mimic_Attack_Bite_01-15 | 咬擊攻擊 | 256x256 | 15 |
| SPR_Mimic_Attack_Tongue_01-20 | 舌頭攻擊 | 256x256 | 20 |
| SPR_Mimic_Attack_Jump_01-30 | 跳躍攻擊 | 256x256 | 30 |
| SPR_Mimic_Attack_Gold_01-25 | 金幣噴射 | 256x256 | 25 |
| SPR_Mimic_Hit_Light_01-06 | 輕度受擊 | 256x256 | 6 |
| SPR_Mimic_Hit_Heavy_01-10 | 重度受擊 | 256x256 | 10 |
| SPR_Mimic_Death_01-50 | 死亡動畫 | 256x256 | 50 |

### 3.2 特效資源 (VFX)

#### 粒子特效
| 檔案名稱 | 說明 | 尺寸 | 類型 |
|----------|------|------|------|
| VFX_Wood_Chips_01-05 | 木屑碎片 | 16x16 | 粒子 |
| VFX_Gold_Coin_01-03 | 金幣 | 32x32 | 精靈 |
| VFX_Saliva_Drop_01-03 | 口水滴落 | 8x8 | 粒子 |
| VFX_Dust_Cloud | 煙塵 | 64x64 | 序列 |
| VFX_Impact_Ring | 衝擊波環 | 256x256 | 精靈 |
| VFX_Bite_Spark | 咬擊火花 | 32x32 | 序列 |
| VFX_Gold_Explosion | 金幣爆炸 | 128x128 | 序列 |
| VFX_Rage_Aura | 狂暴氣場 | 256x256 | 精靈 |
| VFX_Transform_Glow | 變身發光 | 256x256 | 精靈 |

### 3.3 音效資源 (SFX)

#### 環境音效
| 檔案名稱 | 說明 | 時長 | 格式 |
|----------|------|------|------|
| SFX_Ambient_Creak | 木頭嘎吱聲 | 循環 | .ogg |
| SFX_Ambient_Breathing | 呼吸聲 | 循環 | .ogg |

#### 動作音效
| 檔案名稱 | 說明 | 時長 | 格式 |
|----------|------|------|------|
| SFX_Transform_Roar | 覺醒怒吼 | 2.5s | .ogg |
| SFX_Attack_Bite | 咬擊聲 | 0.5s | .ogg |
| SFX_Attack_Tongue_Whip | 舌頭甩動 | 1.0s | .ogg |
| SFX_Attack_Jump_Land | 落地重擊 | 0.8s | .ogg |
| SFX_Gold_Coins_Scatter | 金幣散落 | 1.5s | .ogg |
| SFX_Gold_Coin_Bounce | 金幣彈跳 | 0.3s | .ogg |
| SFX_Hit_Wood_Break | 木頭碎裂 | 0.3s | .ogg |
| SFX_Hit_Flesh | 肉體受擊 | 0.2s | .ogg |
| SFX_Death_Explosion | 死亡爆炸 | 3.0s | .ogg |

### 3.4 使用者介面 (UI)

| 檔案名稱 | 說明 | 尺寸 | 格式 |
|----------|------|------|------|
| UI_Boss_HealthBar_Frame | 血條框架 | 512x64 | .png |
| UI_Boss_HealthBar_Fill | 血條填充 | 512x64 | .png |
| UI_Boss_HealthBar_Damage | 傷害顯示層 | 512x64 | .png |
| UI_Boss_Portrait | Boss頭像 | 128x128 | .png |
| UI_Boss_Name_Plate | 名稱板 | 256x64 | .png |
| UI_Phase_Indicator_01-03 | 階段指示器 | 64x64 | .png |

### 3.5 材質與紋理 (Materials & Textures)

| 檔案名稱 | 說明 | 解析度 | 類型 |
|----------|------|---------|------|
| TEX_Wood_Diffuse | 木頭基礎色 | 512x512 | Diffuse |
| TEX_Wood_Normal | 木頭法線 | 512x512 | Normal |
| TEX_Wood_Roughness | 木頭粗糙度 | 512x512 | Roughness |
| TEX_Metal_Diffuse | 金屬基礎色 | 256x256 | Diffuse |
| TEX_Metal_Metallic | 金屬度 | 256x256 | Metallic |
| TEX_Flesh_Diffuse | 肉質基礎色 | 256x256 | Diffuse |
| TEX_Flesh_Normal | 肉質法線 | 256x256 | Normal |
| MAT_Mimic_Body | 身體材質 | - | Material |
| MAT_Mimic_Tongue | 舌頭材質 | - | Material |
| MAT_Gold_Coin | 金幣材質 | - | Material |

---

## 4. 程式碼檔案結構

### 4.1 腳本命名規範
```
MimicBoss/
├── Core/
│   ├── MimicController.cs
│   ├── MimicStateMachine.cs
│   └── MimicDataSO.cs (ScriptableObject)
├── AI/
│   ├── MimicAI.cs
│   ├── MimicBehaviorTree.cs
│   └── MimicDecisionMaker.cs
├── Combat/
│   ├── MimicAttackSystem.cs
│   ├── MimicSkillManager.cs
│   └── MimicDamageHandler.cs
├── Animation/
│   ├── MimicAnimationController.cs
│   ├── MimicAnimationEvents.cs
│   └── MimicVFXManager.cs
└── Utils/
    ├── MimicObjectPool.cs
    ├── MimicDebugPanel.cs
    └── MimicConstants.cs
```

### 4.2 配置檔案
| 檔案名稱 | 說明 | 格式 |
|----------|------|------|
| MimicBoss_Config.json | 主要配置 | JSON |
| MimicBoss_Attacks.json | 攻擊配置 | JSON |
| MimicBoss_Animations.json | 動畫配置 | JSON |
| MimicBoss_Loot.json | 掉落配置 | JSON |
| MimicBoss_Balance.csv | 平衡數據 | CSV |

---

## 5. 資源打包規範

### 5.1 資料夾結構
```
MimicBoss/
├── Sprites/
│   ├── Body/          # 身體部件
│   ├── Animations/    # 動畫序列
│   └── UI/           # 界面元素
├── Audio/
│   ├── SFX/          # 音效
│   └── BGM/          # 背景音樂
├── VFX/
│   ├── Particles/    # 粒子特效
│   └── Sprites/      # 特效精靈
├── Materials/
│   ├── Textures/     # 紋理貼圖
│   └── Shaders/      # 著色器
├── Prefabs/
│   ├── Boss/         # Boss預製體
│   ├── Projectiles/  # 投射物
│   └── VFX/          # 特效預製體
├── Scripts/          # 所有腳本
├── Config/           # 配置文件
└── Documentation/    # 文檔
```

### 5.2 版本控制
```
命名格式: [資源名]_[v版本號]_[日期]
範例: MimicBoss_v1.0_20250827

版本號規則:
- v0.x: 開發版本
- v1.0: 正式發布
- v1.1: 小更新
- v2.0: 大改版
```

---

## 6. 資源製作檢查清單

### 6.1 美術資源檢查
- [ ] 所有精靈圖已切割對齊
- [ ] 動畫序列編號連續
- [ ] 透明通道正確設置
- [ ] 檔案大小已優化
- [ ] 命名符合規範

### 6.2 音效資源檢查
- [ ] 音效格式統一(.ogg)
- [ ] 音量標準化(-6dB)
- [ ] 循環點設置正確
- [ ] 無爆音或雜音
- [ ] 檔案壓縮適當

### 6.3 程式資源檢查
- [ ] 腳本命名規範
- [ ] 註釋完整
- [ ] 無硬編碼數值
- [ ] 配置文件完整
- [ ] 錯誤處理完善

---

## 7. 資源統計

### 7.1 資源數量統計
| 類型 | 數量 | 預估大小 |
|------|------|----------|
| 精靈圖 | 150+ | 20MB |
| 音效 | 20+ | 5MB |
| 特效 | 15+ | 3MB |
| 材質 | 10+ | 2MB |
| 腳本 | 15+ | 100KB |
| **總計** | **210+** | **~30MB** |

### 7.2 記憶體預算
```
運行時記憶體使用:
- 精靈圖: 15MB
- 動畫: 5MB  
- 音效: 3MB
- 粒子系統: 2MB
- 腳本: 1MB
總計: ~26MB
```

---

## 8. 常見問題

### Q1: 動畫序列編號不連續怎麼辦？
使用批次重命名工具，確保序號從01開始連續編號。

### Q2: 特效資源過大如何優化？
- 降低貼圖解析度
- 減少粒子數量
- 使用貼圖集合併

### Q3: 命名錯誤如何批量修改？
使用專門的批量重命名工具，或編寫腳本自動處理。

---

## 9. 工具推薦

### 批量處理工具
- **Bulk Rename Utility** - 檔案批量重命名
- **TexturePacker** - 精靈圖打包
- **Audacity** - 音效批量處理
- **ImageMagick** - 圖片批量處理

### 版本控制
- **Git** - 版本控制
- **Git LFS** - 大檔案管理
- **Perforce** - 美術資源管理

---

## 更新日誌
- 2025-08-27: 初版資源清單建立