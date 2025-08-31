# 🎮 寶箱怪 (Mimic Boss) 專案文檔

## 專案概述
寶箱怪是一個結合「貪婪」與「欺騙」主題的Boss角色設計專案。這個偽裝成寶箱的怪物會在玩家接近時突然變身攻擊，為遊戲增添驚喜與挑戰性。

## 📁 專案結構
```
MimicBoss/
├── Documents/           # 所有設計文檔
│   ├── Design/         # 遊戲設計文檔
│   ├── Art/            # 美術風格指南
│   ├── Technical/      # 技術實作文檔
│   └── Animation/      # 動畫規格文檔
├── Assets/             # 遊戲資源
│   ├── Sprites/        # 精靈圖與動畫
│   ├── Audio/          # 音效與音樂
│   └── Animations/     # 動畫檔案
├── Source/             # 原始碼
│   ├── Scripts/        # 程式腳本
│   └── Prefabs/        # 預製物件
└── References/         # 參考資料
```

## 📚 核心文檔

### 設計文檔
- **[遊戲設計文檔 (GDD)](Documents/Design/MimicBoss_GDD.md)** - 完整的遊戲設計規格
- **[動畫規格書](Documents/Animation/Animation_Specification.md)** - 詳細的動畫製作指南
- **[美術風格指南](Documents/Art/ArtStyle_Guide.md)** - 視覺風格與美術規範
- **[技術實作文檔](Documents/Technical/Technical_Implementation.md)** - 程式架構與實作細節
- **[資源清單與命名規範](Documents/AssetList_NamingConvention.md)** - 資源管理與命名標準

## 🎯 核心特色

### 三階段戰鬥系統
1. **階段1 (100%-60% HP)** - 半箱子形態，基礎攻擊
2. **階段2 (60%-30% HP)** - 完全體形態，解鎖所有技能
3. **階段3 (30%-0% HP)** - 狂暴形態，攻速與傷害提升

### 特色攻擊模式
- 🦷 **咬擊攻擊** - 近距離快速攻擊
- 👅 **舌頭鞭打** - 中距離扇形攻擊，附帶減速
- 🦘 **跳躍撲擊** - 範圍攻擊，產生震波
- 💰 **金幣彈幕** - 遠程投射攻擊
- 🪤 **假金幣陷阱** - 設置爆炸陷阱

## 🛠️ 技術規格

### 效能目標
- **FPS**: 60 (穩定)
- **記憶體**: < 100MB
- **Draw Calls**: < 50
- **載入時間**: < 2秒

### 支援平台
- PC (Windows/Mac/Linux)
- 移動裝置 (iOS/Android)
- 主機 (可選)

## 👥 團隊分工

| 職責 | 負責內容 | 參考文檔 |
|------|----------|----------|
| 遊戲設計師 | 整體設計、數值平衡 | [GDD](Documents/Design/MimicBoss_GDD.md) |
| 美術師 | 角色設計、特效製作 | [美術指南](Documents/Art/ArtStyle_Guide.md) |
| 動畫師 | 角色動畫、動作設計 | [動畫規格](Documents/Animation/Animation_Specification.md) |
| 程式設計師 | 系統實作、AI編寫 | [技術文檔](Documents/Technical/Technical_Implementation.md) |
| 音效設計師 | 音效製作、音樂創作 | [資源清單](Documents/AssetList_NamingConvention.md) |

## 📅 開發時程

### 第一階段：核心開發 (第1-2週)
- [ ] 基礎AI框架
- [ ] 偽裝/覺醒機制
- [ ] 基礎攻擊系統
- [ ] 核心動畫

### 第二階段：功能完善 (第3-4週)
- [ ] 完整技能系統
- [ ] 階段轉換機制
- [ ] 特效與音效
- [ ] UI整合

### 第三階段：優化打磨 (第5週)
- [ ] 效能優化
- [ ] 平衡性調整
- [ ] Bug修復
- [ ] 最終測試

## 🎮 快速開始

### 環境需求
- Unity 2022.3 LTS 或更新版本
- Visual Studio 2022 或 VS Code
- Git / Git LFS

### 安裝步驟
```bash
# 克隆專案
git clone [repository-url]

# 進入專案目錄
cd MimicBoss

# 安裝依賴（如果有）
npm install  # 或其他套件管理器
```

### 測試場景
1. 開啟 Unity
2. 載入場景 `Assets/Scenes/MimicBoss_TestScene`
3. 點擊播放按鈕進行測試

## 🐛 已知問題
- 暫無

## 📝 更新日誌
- **2025-08-27** - v1.0 初版文檔建立

## 📞 聯絡資訊
- 專案負責人：[待定]
- 技術支援：[待定]
- 美術負責：[待定]

## 📄 授權
本專案文檔與設計內容版權所有 © 2025

---

**注意事項**：
1. 請定期查看文檔更新
2. 修改前請先通知相關負責人
3. 遵守命名規範與編碼標準
4. 保持文檔與程式碼同步更新