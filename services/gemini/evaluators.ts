
import { GoogleGenAI } from "@google/genai";
import { CEFRLevel } from "../../types";
import { parseJSON, getInterfaceLangName } from "./utils";
import { getLevelConstraints } from "./prompts";
import { getEvaluationSchema, getReportEvaluationSchema } from "./schemas";

export const evaluateNegotiation = async (
    apiKey: string,
    history: { role: string, text: string }[],
    trustScore: number,
    objectives: any[],
    level: CEFRLevel,
    interfaceLang: 'de' | 'zh',
    playerIdentityPrompt?: string
): Promise<{ npcResponse: string, trustChange: number, feedback: string, completedObjectiveIds: string[] }> => {
    if (!apiKey) throw new Error("API Key is missing");
    const client = new GoogleGenAI({ apiKey });

    const constraints = getLevelConstraints(level);

    const prompt = `Conversation history: ${JSON.stringify(history)}.
  Current trust: ${trustScore}/100.
  Objectives to evaluate (in German): ${JSON.stringify(objectives)}.
  ${playerIdentityPrompt ? `Player Identity: ${playerIdentityPrompt}.` : ""}
  
  Evaluate the player's German input from Speech-to-Text.
  
  EVALUATION INSTRUCTIONS:
  1. Identity: The NPC should acknowledge the player's identity (e.g. titles, attitude), but DO NOT penalize the player for not acting the role perfectly or using simple language. The player is a language learner.
  2. Scoring: Be lenient with capitalization, punctuation, and phonetic typos (Speech-to-Text errors).
  3. Feedback (CRITICAL): You MUST provide the CORRECT standard German written form of the player's sentence in the feedback to prevent learning bad habits. Correct capitalization, grammar, and punctuation strictly in the feedback.
  
  NPC RESPONSE RULES:
  ${constraints}
  Keep response simple.
  
  TRUST SCORE RULES (IMPORTANT):
  - Standard range for 'trustChange' is between -10 and +10 per turn.
  - ONLY exceed +/-10 if the player does something extremely clever (huge bonus) or extremely offensive (huge penalty).
  - If grammar is bad but meaning is clear -> Small penalty (-2 to -5).
  - If grammar is good and polite -> Small bonus (+2 to +5).
  
  Linguistic feedback in ${getInterfaceLangName(interfaceLang)}. Include the corrected sentence.`;

    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: getEvaluationSchema()
        }
    });

    return parseJSON(response.text || "{}");
};

export const generateHint = async (
    apiKey: string,
    history: { role: string, text: string }[],
    interfaceLang: 'de' | 'zh'
): Promise<string> => {
    if (!apiKey) throw new Error("API Key is missing");
    const client = new GoogleGenAI({ apiKey });
    const metaLang = getInterfaceLangName(interfaceLang);

    const prompt = `Based on the conversation history: ${JSON.stringify(history)}
    
    Provide a "Divine Hint" or "Spy Report" for the player.
    1. Suggest what they should say next in German to improve the relationship or achieve goals.
    2. Suggest a specific German phrase or vocabulary they might need.
    3. Keep it brief and strategic.
    Output language: ${metaLang}.`;

    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    return response.text || "No hint available.";
};

export const evaluateReport = async (apiKey: string, report: string, level: CEFRLevel, interfaceLang: 'de' | 'zh'): Promise<any> => {
    if (!apiKey) throw new Error("API Key is missing");
    const client = new GoogleGenAI({ apiKey });

    const metaLang = getInterfaceLangName(interfaceLang);
    const prompt = `Evaluate this player report: "${report}". Target Level ${level}.
    
    1. 'score': 0-100 based on grammar and completion.
    2. 'outcome': The narrative conclusion of the story (RPG style) in GERMAN. Matches Target Level ${level}. What happened after the report was submitted?
    3. 'corrections': Linguistic feedback, grammar corrections, and style suggestions in German.`;

    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: getReportEvaluationSchema(metaLang)
        }
    });
    return parseJSON(response.text || "{}");
};
