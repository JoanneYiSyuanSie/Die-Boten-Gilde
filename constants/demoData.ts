
import { CEFRLevel, MissionData } from '../types';

export const DEMO_MISSION: MissionData = {
  level: CEFRLevel.A1, // Demo is A1
  title: "Die Prüfung",
  scenarioDescription: "Dies ist eine Prüfung für Neulinge. Du hast am Stadttor einen Aushang gefunden, doch eine Wache versperrt dir den Weg. Dein Ziel ist es, die Stadt zu betreten und Bericht zu erstatten.",
  minWordCount: 20,

  // Phase 1: Reading (Static)
  decryptedMessage: {
    fullText: "Der Zutritt ist nur jenen gestattet, die das goldene Siegel vorweisen können. Wer ohne Erlaubnis eintritt, wird verhaftet.",
    segments: [
      {
        id: "s1",
        textBefore: "Der Zutritt ist nur jenen",
        answer: "gestattet",
        distractors: ["verboten", "gedacht", "gekauft"],
        textAfter: ", die das goldene Siegel"
      },
      {
        id: "s2",
        textBefore: "vorweisen können. Wer ohne",
        answer: "Erlaubnis",
        distractors: ["Wasser", "Brot", "Schuhe"],
        textAfter: "eintritt, wird verhaftet."
      }
    ],
    readingQuestions: [
      {
        id: "q1",
        question: "Was braucht man für den Zutritt?",
        options: ["Ein Schwert", "Das goldene Siegel", "Viel Geld"],
        correctAnswer: "Das goldene Siegel"
      },
      {
        id: "q2",
        question: "Was passiert ohne Erlaubnis?",
        options: ["Man wird verhaftet", "Man bekommt Essen", "Nichts"],
        correctAnswer: "Man wird verhaftet"
      }
    ]
  },

  // Phase 2: Negotiation (Scripted Tutorial)
  negotiation: {
    npcName: "Wache",
    npcRole: "Eine streng aussehende Wache mit müden Augen. Er misstraut Fremden.",
    npcVoice: "Fenrir",
    relationship: "Hostile",
    initialStatement: "Halt! Wer da? Bleib stehen oder ich greife an!",
    initialStatementTranslation: "站住！誰在那裡？停下，否則我就要攻擊了！",
    initialStatementAudio: "demo-audio/demo_level2_npc_start.wav",
    goal: "Überzeuge die Wache, dass du zur Gilde gehörst.",
    objectives: [
      { id: "obj1", description: "Identität klären", isMain: true },
      { id: "obj2", description: "Siegel vorzeigen", isMain: true }
    ],
    script: [
      {
        step: 1,
        npcText: "Ein Bote? Du siehst eher aus wie ein Dieb. Hast du Beweise?",
        npcTranslation: "一個信使？你看起來比較像個小偷。你有證據嗎？",
        // Simulated user error: Missing article, simple structure
        userRaw: "Ich bin Bote von Gilde.",
        correction: "文法建議：\n1. 'Ich bin *ein* Bote.' (加上不定冠詞)\n2. '...*der* Gilde.' (Gilde 是陰性，所有格用 der)\n完整建議：Ich bin ein Bote der Gilde.",
        trustGain: 30,
        hint: "【教學】守衛問你是誰。請點擊「發送」或錄音。系統會模擬一個常見的初學者回答，並展示 AI 如何修正你的文法。",
        audioUrl: "demo-audio/demo_level2_npc_step1.wav"
      },
      {
        step: 2,
        npcText: "Mhm... Das Siegel scheint echt zu sein. Na gut, du darfst passieren. Aber mach keinen Ärger.",
        npcTranslation: "嗯... 這印章看起來是真的。好吧，你可以通過。但別惹麻煩。",
        // Simulated user error: Verb position incorrect (common mistake)
        userRaw: "Hier das Siegel ist.",
        correction: "文法建議：\n動詞位置錯誤。在主句中，動詞通常位於第二位。\n正確說法：'Hier *ist* das Siegel.'",
        trustGain: 40,
        hint: "【教學】請嘗試再次發送。這次我們會模擬動詞位置錯誤的情況。",
        audioUrl: "demo-audio/demo_level2_npc_step2.wav"
      },
      {
        step: 3,
        npcText: "[END] Der Weg ist frei.",
        npcTranslation: "[結束] 道路已經暢通。",
        userRaw: "Danke.",
        correction: "不錯！簡單明瞭。",
        trustGain: 30,
        hint: "【教學】對話結束。請點擊「結束對話」前往下一階段。",
        finalReveal: true,
        audioUrl: "demo-audio/demo_level2_npc_end.wav"
      }
    ]
  },

  // Phase 3: Writing (Mock Feedback)
  reportPrompt: "Berichte der Gilde vom Zustand des Königs. (Demo: 請隨意輸入以測試評分)",
  mockFeedback: {
    outcome: "你的報告已送達。公會對你的表現非常滿意，你成功通過了入會測試。",
    score: 85,
    correction: "這是一個模擬回饋。\n\n1. 'Der König ist krank' -> 更正式的說法是 'Der König ist erkrankt'.\n2. 注意德語名詞首字母大寫。\n\n(在正式遊戲中，AI 將會針對您實際撰寫的內容進行詳細批改)"
  },

  historicalFact: {
    title: "Die Boten",
    content: "在 15 世紀，專業信使是訊息傳遞的關鍵。圖恩-塔克西斯家族 (Thurn und Taxis) 建立了歐洲第一個現代郵政系統。",
    source: "Historisches Lexikon"
  }
};
