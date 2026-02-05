
import { GoogleGenAI } from "@google/genai";
import { CEFRLevel, MissionData } from "../../types";
import { getAllTraitIds } from "../../constants/npcTraits";
import { parseJSON, getInterfaceLangName } from "./utils";
import { getLevelConstraints, getSystemPrompt } from "./prompts";
import {
  getMissionSchema,
  getSpeakingTrainingSchema,
  getReadingTrainingSchema,
  getWritingTrainingSchema
} from "./schemas";

export const generateMission = async (apiKey: string, level: CEFRLevel, topic: string, interfaceLang: 'de' | 'zh', playerIdentityPrompt?: string): Promise<MissionData> => {
  if (!apiKey) throw new Error("API Key is missing");
  const client = new GoogleGenAI({ apiKey });

  const metaLang = getInterfaceLangName(interfaceLang);
  const constraints = getLevelConstraints(level);
  const { roles, backgrounds, personalities } = getAllTraitIds();

  const prompt = `Generate a 3-stage mission based on the specific scenario: "${topic}".
  ${playerIdentityPrompt ? `Player Identity: ${playerIdentityPrompt}. Incorporate this into the scenario or NPC attitude.` : ""}
  
  CONSTRAINT: The German text MUST adhere to these rules: ${constraints}
  
  Stage 1: A German text to decrypt (a intercepted letter, a secret decree).
  **IMPORTANT for Stage 1**: 
  - The 'scenarioDescription' MUST be a detailed, atmospheric description (in German) of WHERE the player found this message and WHY it is important.
  - The 'decryptedMessage' fullText MUST be substantial (60-150 words).
  
  Stage 2: A negotiation in German.
  IMPORTANT - NPC CREATION:
  1. Create a unique and interesting NPC.
  2. You MUST select exactly ONE ID from EACH of the following lists for 'npcAttributes':
     - ROLES: [${roles}]
     - BACKGROUNDS: [${backgrounds}]
     - PERSONALITIES: [${personalities}]
  3. 'npcVoice': Must be exactly one of: 
     - 'Puck' (Female, Playful)
     - 'Kore' (Female, Mystical)
     - 'Zephyr' (Female, Soft)
     - 'Charon' (Male, Deep)
     - 'Fenrir' (Male, Aggressive)
  4. 'npcName' MUST match the name used in 'initialStatement'. If the NPC introduces themselves, use the same name.
  5. **CONSISTENCY CHECK**: If you choose a Male voice, the NPC description/title MUST be Male (e.g. "Herr", "Mönch"). If Female voice, MUST be Female (e.g. "Frau", "Nonne").
  
  Stage 3: A written report to the Guild Master.
  
  Include a 'historicalFact': A real, interesting historical fact or trivia related to the setting/topic.
  - Content should be in ${metaLang}.
  - Provide a credible 'source'.
  
  Narrative fields MUST be in German.
  'reportPrompt' MUST be in GERMAN.
  'historicalFact.content' in ${metaLang}.`;

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: getSystemPrompt(level, interfaceLang, playerIdentityPrompt),
      responseMimeType: "application/json",
      responseSchema: getMissionSchema(metaLang)
    }
  });

  const parsed = parseJSON<Partial<MissionData>>(response.text || "{}");
  return { ...parsed, level } as MissionData;
};

export const generateSpeakingTraining = async (apiKey: string, level: CEFRLevel, topic: string, interfaceLang: 'de' | 'zh', playerIdentityPrompt?: string): Promise<MissionData> => {
  if (!apiKey) throw new Error("API Key is missing");
  const client = new GoogleGenAI({ apiKey });

  const metaLang = getInterfaceLangName(interfaceLang);
  const constraints = getLevelConstraints(level);
  const { roles, backgrounds, personalities } = getAllTraitIds();

  const prompt = `Generate a Speaking scenario for a minor daily guild task: "${topic}".
    MUNDANE REQUIREMENT: Keep the interaction short, simple, and low-stakes (everyday messenger life).
    CONSTRAINT: The German text MUST adhere to these rules: ${constraints}
    ${playerIdentityPrompt ? `Player Identity: ${playerIdentityPrompt}.` : ""}
    
    IMPORTANT - NPC CREATION:
    You MUST select exactly ONE ID from EACH list for 'npcAttributes':
     - ROLES: [${roles}]
     - BACKGROUNDS: [${backgrounds}]
     - PERSONALITIES: [${personalities}]
    
    CRITICAL:
    1. 'negotiation.goal': Describe clearly what the player needs to achieve in this conversation (e.g., "Find out where the package is"). MUST be in GERMAN (Target Language).
    2. 'negotiation.objectives': Provide 2 simple objectives (1 Main, 1 Side). Descriptions MUST be in GERMAN (Target Language).

    Historical setting (800-1900 AD).
    NO Historical Fact needed for training.`;

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: getSystemPrompt(level, interfaceLang, playerIdentityPrompt),
      responseMimeType: "application/json",
      responseSchema: getSpeakingTrainingSchema()
    }
  });
  const parsed = parseJSON<Partial<MissionData>>(response.text || "{}");
  return { ...parsed, level } as MissionData;
};


export const generateReadingTraining = async (apiKey: string, level: CEFRLevel, topic: string, interfaceLang: 'de' | 'zh', playerIdentityPrompt?: string): Promise<MissionData> => {
  if (!apiKey) throw new Error("API Key is missing");
  const client = new GoogleGenAI({ apiKey });

  const metaLang = getInterfaceLangName(interfaceLang);
  const constraints = getLevelConstraints(level);

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a Reading Training scenario for a minor daily guild task: "${topic}". 
      MUNDANE REQUIREMENT: Keep the text short (max 100 words), simple, and focused on everyday vocabulary.
      CONSTRAINT: The German text MUST adhere to these rules: ${constraints}
      ${playerIdentityPrompt ? `Player Identity: ${playerIdentityPrompt}.` : ""}
      Historical setting (800-1900 AD).
      1. Text length approx 50-80 words (for low levels) or 100-120 (for high).
      2. Include 3 'readingQuestions' (MCQ) in addition to Cloze segments.
      NO Historical Fact needed for training.`,
    config: {
      systemInstruction: getSystemPrompt(level, interfaceLang, playerIdentityPrompt),
      responseMimeType: "application/json",
      responseSchema: getReadingTrainingSchema()
    }
  });
  const parsed = parseJSON<Partial<MissionData>>(response.text || "{}");
  return { ...parsed, level } as MissionData;
};

export const generateWritingTraining = async (apiKey: string, level: CEFRLevel, topic: string, interfaceLang: 'de' | 'zh', playerIdentityPrompt?: string): Promise<MissionData> => {
  if (!apiKey) throw new Error("API Key is missing");
  const client = new GoogleGenAI({ apiKey });

  const metaLang = getInterfaceLangName(interfaceLang);
  const constraints = getLevelConstraints(level);

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a Writing Training task for a minor daily guild task: "${topic}". 
      MUNDANE REQUIREMENT: Keep the task focused on everyday short correspondence or notes.
      CONSTRAINT: The instructions should consider these language limits: ${constraints}
      ${playerIdentityPrompt ? `Player Identity: ${playerIdentityPrompt}.` : ""}
      Historical setting (800-1900 AD).
      
      CRITICAL:
      1. 'reportPrompt' MUST be in GERMAN (Target Language), NOT ${metaLang}. 
      This is an immersion exercise. The player must read the writing instruction in German.
      
      NO Historical Fact needed for training.`,
    config: {
      systemInstruction: getSystemPrompt(level, interfaceLang, playerIdentityPrompt),
      responseMimeType: "application/json",
      responseSchema: getWritingTrainingSchema()
    }
  });
  const parsed = parseJSON<Partial<MissionData>>(response.text || "{}");
  return { ...parsed, level } as MissionData;
};
