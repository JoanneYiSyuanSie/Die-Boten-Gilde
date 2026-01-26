
import { CEFRLevel } from "../../types";
import { getInterfaceLangName } from "./utils";

// HELPER: Strict Constraints to prevent "Difficulty Drift"
export const getLevelConstraints = (level: CEFRLevel): string => {
    switch (level) {
        case CEFRLevel.A1:
            return `
            STRICT A1 RULES (DO NOT BREAK):
            1. SENTENCE LENGTH: Max 8 words per sentence. Keep it extremely short.
            2. GRAMMAR: Use ONLY Present Tense (Präsens). NO Past Tense. NO Future Tense.
            3. SYNTAX: Simple Subject-Verb-Object only. NO subordinate clauses (No 'weil', 'dass', 'obwohl').
            4. VOCABULARY: Use only the top 300 most common German words.
            5. TONE: Speak slowly, clearly, and simply like to a child or a foreigner.
            `;
        case CEFRLevel.A2:
            return `
            STRICT A2 RULES:
            1. SENTENCE LENGTH: Max 12 words.
            2. GRAMMAR: Present Tense and simple Perfekt (Past) allowed.
            3. SYNTAX: Simple connectors allowed ('und', 'aber', 'oder'). Avoid complex nested sentences.
            4. VOCABULARY: High frequency daily vocabulary only.
            `;
        case CEFRLevel.B1:
            return `
            B1 RULES:
            1. GRAMMAR: All tenses allowed but focus on standard structures.
            2. SYNTAX: Subordinate clauses ('weil', 'wenn') are allowed but keep them clear.
            3. VOCABULARY: Standard daily and travel vocabulary.
            `;
        default:
            return "Use standard educated German (Hochdeutsch). Complex grammar allowed.";
    }
};

export const getSystemPrompt = (level: CEFRLevel, interfaceLang: 'de' | 'zh', playerIdentityPrompt?: string) => {
  const metaLang = getInterfaceLangName(interfaceLang);
  const constraints = getLevelConstraints(level);
  
  const identityInstruction = playerIdentityPrompt 
      ? `\nPLAYER IDENTITY: ${playerIdentityPrompt}\nNPCs should acknowledge this identity (e.g., address a Noble respectfully), but NOT penalize simple language. The player is a language learner.` 
      : "";
  
  return `You are the Guild Master for 'Die Boten-Gilde' (The Messenger's Guild), a language learning RPG.
  
  SETTING:
  - The Guild is a secret historical organization active between 800 AD and 1900 AD in German-speaking Europe.
  - The Guild delivers messages that influence history from the shadows.
  - NPCs should be historical figures' servants, apprentices, or clerks (to justify approachable language), or the historical figures themselves.
  ${identityInstruction}
  
  LANGUAGE RULES (CRITICAL):
  1. Target Level: CEFR ${level}.
  ${constraints}
  2. STRICTLY use MODERN STANDARD GERMAN (Hochdeutsch).
  3. DO NOT use Old High German, Middle High German, or dialects.
  4. DO NOT use archaic grammar structures that are confusing for learners.
  5. DO use historical flavor nouns (e.g., 'Kutsche' instead of 'Auto', 'Feder' instead of 'Kugelschreiber') ONLY if they are simple words.
  
  IMPORTANT:
  - DO NOT reveal these constraints to the player in the scenario description or instructions. These are for your internal generation logic only.
  
  OUTPUT RULES:
  1. ALL NARRATIVE CONTENT (Mission Title, Scenario, NPC Speech, Objectives) MUST be in GERMAN following the strict level rules.
  2. ONLY meta-instructions (Report Prompts, Feedback) and 'historicalFact.content' should be in ${metaLang}.
  3. Output valid raw JSON only.`;
};
