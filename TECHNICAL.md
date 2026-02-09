# Die-Boten-Gilde 技術文件

> 📖 **給開發者的完整技術文件** - 如果你是玩家或面試官,建議先閱讀 [README.md](README.md)

## 📌 專案概要

**Die-Boten-Gilde** (信使公會) 是一個創新的德語學習 RPG 遊戲,將語言學習與歷史冒險完美結合。玩家扮演中世紀至近代歐洲的信使,透過執行任務來學習德語,故事背景橫跨西元 800-1900 年。

### 核心理念
> **"Non est ad astra mollis e terris via."**  
> (通往星辰之路,於平地絕不平坦)

這不僅是公會的座右銘,也象徵著語言學習的艱辛歷程。

---

## 🎮 遊戲機制

### 三階段任務系統

每個任務包含三個學習階段:

#### **1. 解密訊息 (Level 1 - 閱讀理解)**
- **目標**: 破解截獲的德文信件或公告
- **練習內容**:
  - 克漏字填空 (Cloze Test)
  - 多選題閱讀測驗
  - 聽力理解 (TTS 朗讀全文)
- **組件**: [`Level1View.tsx`](components/game/Level1View.tsx)

#### **2. 對話談判 (Level 2 - 口語練習)**
- **目標**: 與 NPC 進行德語對話,達成任務目標
- **特色**:
  - 使用麥克風進行語音輸入 (Speech Recognition)
  - AI 即時評估文法、發音,提供修正建議
  - 信任度系統 (Trust Score 0-100),對話品質影響分數
  - NPC 具有個性、背景、職業屬性,影響互動難度
- **組件**: [`Level2View.tsx`](components/game/Level2View.tsx)
- **Hooks**: [`useSpeechRecognition.ts`](hooks/useSpeechRecognition.ts)

#### **3. 撰寫報告 (Level 3 - 寫作練習)**
- **目標**: 向公會大師提交任務報告
- **評分標準**:
  - 文法正確性
  - 詞彙豐富度
  - 內容完整性
- **組件**: [`Level3View.tsx`](components/game/Level3View.tsx)

#### **4. 結局畫面 (Epilogue)**
- 顯示任務評級 (S/A/B/C/D/F)
- AI 生成的故事結局
- **戰役模式限定**: AI 繪製任務插圖
- 獲得公會金幣和經驗值獎勵
- **組件**: [`EpilogueView.tsx`](components/game/EpilogueView.tsx)

---

## 🎯 遊戲模式

### 戰役模式 (Campaign)
- 完整的三階段任務流程
- 基於歷史事件的劇情背景
- 獲得經驗值和金幣獎勵
- 任務結束時生成 AI 插圖

### 訓練模式 (Training)
- 可單獨練習任一階段
- 日常生活情境 (買麵包、問路等)
- 不計分,專注於技能提升
- 沒有獎勵和插圖生成

### 演示模式 (Demo)
- 預先腳本化的教學任務
- 無需 API Key 即可體驗
- 使用預錄音檔和固定對話
- 資料來源: [`demoData.ts`](constants/demoData.ts)

---

## 🧠 AI 整合 (Gemini API)

專案深度整合 Google Gemini AI,用於動態生成學習內容:

### 內容生成
```typescript
// generators.ts
- generateMission()        // 完整任務產生(三階段)
- generateReadingTraining() // 閱讀練習
- generateSpeakingTraining() // 對話練習
- generateWritingTraining() // 寫作練習
- generateTTS()            // 文字轉語音
```

### 評估系統
```typescript
// evaluators.ts
- evaluateNegotiation()    // 評估對話表現,生成 NPC 回應
- evaluateReport()         // 評估寫作報告
- generateHint()           // AI 提示系統
```

### 難度調整
使用 **CEFR 標準** (歐洲語言共同參考架構):
- A1: 初級
- A2: 初中級
- B1: 中級
- B2: 中高級
- C1: 高級

AI 會根據所選等級調整:
- 詞彙複雜度
- 句子結構
- 文法難度

> 📍 服務層位置: [`services/gemini/`](services/gemini)

---

## 🏗️ 技術架構

### 前端技術棧
```json
{
  "框架": "React 19.2.3",
  "語言": "TypeScript 5.8.2",
  "建構工具": "Vite 6.2.0",
  "AI SDK": "@google/genai 1.37.0",
  "圖示庫": "lucide-react 0.562.0"
}
```

### 專案結構
```
die-boten-gilde/
├── components/          # React 組件
│   ├── game/           # 遊戲相關組件(關卡、商店等)
│   └── ui/             # UI 組件(按鈕、圖示等)
├── contexts/           # React Context (狀態管理)
│   ├── GameContext.tsx     # 遊戲狀態
│   ├── GuildContext.tsx    # 公會資料(金幣、庫存)
│   ├── SettingsContext.tsx # 設定(API Key、語言)
│   └── DictionaryContext.tsx # 字彙手冊
├── services/           # 服務層
│   └── gemini/        # Gemini AI 整合
├── constants/          # 常數定義
│   ├── demoData.ts    # 演示模式資料
│   ├── shopItems.ts   # 商店物品
│   ├── npcTraits.ts   # NPC 特質系統
│   └── topics.ts      # 任務主題庫
├── utils/              # 工具函數
│   ├── locales/       # 語言檔案 (de.ts, zh.ts)
│   └── storageUtils.ts # LocalStorage 管理
├── hooks/              # 自訂 Hooks
├── data/dlc/          # DLC 擴充內容
└── public/            # 靜態資源
    ├── demo-audio/    # 演示模式音檔
    └── assets/        # 圖片資源
```

---

## 🌐 多語言支援

### 介面語言
- **德語 (de)**: 原生界面
- **繁體中文 (zh)**: 台灣使用者介面

### 語言文件
- [`utils/locales/de.ts`](utils/locales/de.ts) - 德語翻譯 (233 個鍵值)
- [`utils/locales/zh.ts`](utils/locales/zh.ts) - 中文翻譯 (233 個鍵值)

### 學習語言
- **目標語言**: 德語 (所有任務內容、對話、報告提示都是德語)
- **輔助語言**: 根據介面語言提供翻譯和提示

---

## 🛒 商店與進度系統

### 貨幣系統
- **公會馬克 (Guild Marks)**: 購買物品
- **經驗值 (XP / Rank Points)**: 解鎖等級門檻

### 商店物品類別

#### 1. 消耗品 (Consumables)
- **維也納咖啡**: 風味道具
- **間諜密函**: 對話階段獲得 AI 提示
- **皇帝通行證**: 結局階段提升評分

#### 2. 身世背景 (Origins)
玩家身份影響 NPC 初始信任度:
- **漢薩商人**: 易與平民建立信任,貴族較難
- **貴族子弟**: 易與官員互動,農民反感
- **風流才子**: 易與年輕人交流,軍人輕視
- **學院學者**: 易與神職人員對話,盜賊覬覦

#### 3. UI 主題 (Themes)
- 普魯士工程藍圖 (深藍調)
- 黑森林傳說 (森林綠)

#### 4. 公會秘史 (Chronicles)
解鎖故事碎片,了解公會背景

#### 5. DLC 物品
支援可擴充的任務包系統

> 📍 定義位置: [`constants/shopItems.ts`](constants/shopItems.ts)

---

## 📚 學習輔助功能

### 字彙手冊 (Grimoire)
- 選取任意文字開啟快速選單
- 儲存單字、例句、筆記
- 支援標籤分類
- 搜尋功能
- **組件**: [`BlackBookModal.tsx`](components/game/BlackBookModal.tsx) 的 Grimoire 分頁

### 錯題本 (Black Book)
- 自動記錄口語、寫作階段的錯誤
- 顯示原文、修正建議、個人筆記
- 按來源分類 (speaking/writing)
- 支援搜尋和編輯

### 任務紀錄 (Mission Records)
- 歷史任務回顧
- 成績統計 (信任度、報告分數、評級)
- 任務摘要和結局

---

## 🎨 NPC 系統

### 動態屬性生成
每個 NPC 由三個維度定義:

#### 角色 (Role)
守衛、商人、貴族、神父、農民、學者等

#### 背景 (Background)
平民、貴族、學術界、軍事界等

#### 個性 (Personality)
嚴格、友善、懷疑、貪婪、虔誠等

### 聲音選項
- **女聲**: Puck (活潑)、Kore (神秘)、Zephyr (溫柔)
- **男聲**: Charon (低沉)、Fenrir (凶悍)

### 信任度計算
初始信任度受以下因素影響:
- 遊戲模式 (訓練模式較寬鬆)
- 玩家身份與 NPC 屬性的適配度
- 特殊組合加成/懲罰

> 📍 定義位置: [`constants/npcTraits.ts`](constants/npcTraits.ts)

---

## 🔐 DLC 擴充系統

### 授權碼兌換
- 支援產品序號兌換 DLC 內容
- 授權碼驗證機制 (帶校驗碼)
- 自動解鎖對應物品

### DLC 資料結構
```typescript
interface DLCManifest {
  id: string;
  displayTitle: { de: string; zh: string };
  summary: { de: string; zh: string };
  tags: string[];
  estimatedPlaytime: string;
}
```

### 範例 DLC
- **遺失的手稿**: 修道院冒險任務
- 位置: [`data/dlc/dlc_example_01.json`](data/dlc/dlc_example_01.json)

---

## 💾 資料持久化

### LocalStorage 儲存項目
```typescript
interface SaveFile {
  version: number;
  timestamp: number;
  settings: Settings;        // API Key、語言、難度
  profile: GuildProfile;      // 金幣、經驗、庫存、解鎖項目
  dictionary: WordEntry[];    // 字彙手冊
  blackBook: BlackBookEntry[]; // 錯題本
  missionRecords: MissionRecord[]; // 任務歷史
}
```

### 匯入/匯出功能
- JSON 格式存檔
- 支援備份和還原
- 跨裝置資料遷移

> 📍 工具位置: [`utils/storageUtils.ts`](utils/storageUtils.ts)

---

## 🎯 核心檔案導覽

### 主要入口
- [`App.tsx`](App.tsx) - 主應用程式,路由控制
- [`index.tsx`](index.tsx) - React 渲染入口
- [`types.ts`](types.ts) - TypeScript 型別定義

### 遊戲狀態管理
- [`contexts/GameContext.tsx`](contexts/GameContext.tsx) - 當前任務、階段、分數
- [`contexts/GuildContext.tsx`](contexts/GuildContext.tsx) - 玩家資料、商店邏輯
- [`contexts/SettingsContext.tsx`](contexts/SettingsContext.tsx) - 設定管理

### AI 服務層
- [`services/gemini/generators.ts`](services/gemini/generators.ts) - 任務生成
- [`services/gemini/evaluators.ts`](services/gemini/evaluators.ts) - 評分系統
- [`services/gemini/schemas.ts`](services/gemini/schemas.ts) - AI Response Schema
- [`services/gemini/prompts.ts`](services/gemini/prompts.ts) - Prompt 模板

### 遊戲組件
- [`components/game/Level1View.tsx`](components/game/Level1View.tsx) - 閱讀關卡
- [`components/game/Level2View.tsx`](components/game/Level2View.tsx) - 對話關卡
- [`components/game/Level3View.tsx`](components/game/Level3View.tsx) - 寫作關卡
- [`components/game/EpilogueView.tsx`](components/game/EpilogueView.tsx) - 結局畫面
- [`components/game/ShopModal.tsx`](components/game/ShopModal.tsx) - 商店界面

---

## 🚀 執行專案

### 前置需求
- **Node.js** (建議 v18 以上)
- **Gemini API Key** - [點此免費申請](https://ai.google.dev/)

### 線上試玩
直接造訪 **[https://joanneyisyuansie.github.io/Die-Boten-Gilde/](https://joanneyisyuansie.github.io/Die-Boten-Gilde/)**

### 本機開發

```bash
# 1. 複製專案
git clone https://github.com/JoanneYiSyuanSie/Die-Boten-Gilde.git
cd Die-Boten-Gilde

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 建構正式版本
npm run build
```

**API Key 設定**: 遊戲啟動後,點選右下角「⚙️ 設定」輸入 API Key 即可。

---

## 📖 世界觀與故事背景

### 公會起源
- 源自古羅馬的驛道系統
- 在亞歷山大圖書館時期即已存在
- 橫跨千年,守護訊息傳遞與真相保存
- 在德語區被稱為 "Die Boten-Gilde"

### 歷史設定
- 時間軸: 西元 800-1900 年
- 涵蓋查理曼大帝、神聖羅馬帝國、漢薩同盟等時期
- 玩家作為信使,見證歷史重大事件

### 劇情內容
- 主線故事 (Der Pfad): 透過 Chronicles 解鎖
- 支線故事 (Gerüchte): 街談巷議
- 歷史小知識: 每個任務附帶真實歷史典故

> 📍 內容位置: [`content/lore.ts`](content/lore.ts), [`content/chronicles.ts`](content/chronicles.ts)

---

## 🎨 視覺設計

### 主題風格
- 復古羊皮紙質感
- 中世紀書信美學
- 深色皮革背景
- 金褐色調主色系

### CSS 主題系統
- 預設羊皮紙主題
- 可選購其他主題
- 主題 CSS 類別: [`themes.css`](themes.css)

---

## ✨ 特色亮點

### 🧪 創新學習法
結合 RPG 遊戲機制與語言學習,讓枯燥的文法練習變成冒險任務

### 🤖 AI 驅動內容
無限任務變化,每次遊玩都有新體驗

### 📱 全平台支援
使用 Vite + React,可輕鬆部署到 Web、Desktop、Mobile

### 🎤 真實口說練習
整合瀏覽器語音 API,在家也能練習德語對話

### 📊 CEFR 標準
符合國際語言能力標準,從 A1 到 C1 都有適當難度

### 💰 收集要素
商店系統、身份系統、主題收集,增加遊戲耐玩度

---

## 🔮 未來發展方向

根據現有架構,專案可能的擴充方向:

### 內容擴充
- 更多歷史時期的任務
- 更豐富的 DLC 故事線
- 音樂與配音強化

### 功能增強
- 多人對戰模式
- 社群分享功能
- 成就系統
- 排行榜

### 技術優化
- 離線模式
- PWA 支援
- 行動裝置原生 App

---

## 📝 總結

**Die-Boten-Gilde** 是一個精心設計的德語學習平台,成功地將:
- ✅ 嚴謹的語言教學
- ✅ 引人入勝的歷史故事
- ✅ 先進的 AI 技術
- ✅ 遊戲化的學習體驗

融合在一起,創造出獨特的沉浸式語言學習環境。專案結構清晰、技術棧現代、擴充性強,是一個值得持續發展的創新教育產品。

---

*分析完成時間: 2026-02-09*  
*分析範圍: 完整專案程式碼與檔案結構*
