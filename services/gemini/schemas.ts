
import { Type } from "@google/genai";

export const getMissionSchema = (metaLang: string) => ({
  type: Type.OBJECT,
  required: ["title", "scenarioDescription", "minWordCount", "decryptedMessage", "negotiation", "reportPrompt", "historicalFact"],
  properties: {
    title: { type: Type.STRING, description: "Title in German" },
    scenarioDescription: { type: Type.STRING, description: "Detailed, atmospheric scene context in German" },
    minWordCount: { type: Type.NUMBER },
    decryptedMessage: {
      type: Type.OBJECT,
      required: ["fullText", "segments", "readingQuestions"],
      properties: {
        fullText: { type: Type.STRING, description: "At least 60-80 words." },
        segments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "textBefore", "answer", "distractors", "textAfter"],
            properties: {
              id: { type: Type.STRING },
              textBefore: { type: Type.STRING },
              answer: { type: Type.STRING },
              distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
              textAfter: { type: Type.STRING }
            }
          }
        },
        readingQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "question", "options", "correctAnswer"],
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING, description: "Question in German" },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING, description: "Must be exactly one of the options" }
            }
          }
        }
      }
    },
    negotiation: {
      type: Type.OBJECT,
      required: ["npcName", "npcRole", "npcVoice", "npcAttributes", "relationship", "initialStatement", "goal", "objectives"],
      properties: {
        npcName: { type: Type.STRING },
        npcRole: { type: Type.STRING, description: "A brief descriptive sentence of who they are." },
        npcVoice: { type: Type.STRING },
        npcAttributes: {
          type: Type.OBJECT,
          required: ["roleId", "backgroundId", "personalityId"],
          properties: {
            roleId: { type: Type.STRING, description: "One ID from the ROLES list" },
            backgroundId: { type: Type.STRING, description: "One ID from the BACKGROUNDS list" },
            personalityId: { type: Type.STRING, description: "One ID from the PERSONALITIES list" }
          }
        },
        relationship: { type: Type.STRING },
        initialStatement: { type: Type.STRING },
        goal: { type: Type.STRING },
        objectives: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "description", "isMain"],
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              isMain: { type: Type.BOOLEAN }
            }
          }
        }
      }
    },
    reportPrompt: { type: Type.STRING, description: "Instruction in German" },
    historicalFact: {
      type: Type.OBJECT,
      required: ["title", "content", "source"],
      properties: {
        title: { type: Type.STRING, description: "Title of the fact in German" },
        content: { type: Type.STRING, description: `The fact content in ${metaLang}` },
        source: { type: Type.STRING, description: "Source of the fact" }
      }
    }
  }
});

export const getSpeakingTrainingSchema = () => ({
  type: Type.OBJECT,
  required: ["title", "scenarioDescription", "negotiation"],
  properties: {
    title: { type: Type.STRING },
    scenarioDescription: { type: Type.STRING },
    negotiation: {
      type: Type.OBJECT,
      required: ["npcName", "npcRole", "npcVoice", "npcAttributes", "relationship", "initialStatement", "goal", "objectives"],
      properties: {
        npcName: { type: Type.STRING },
        npcRole: { type: Type.STRING },
        npcVoice: { type: Type.STRING },
        npcAttributes: {
          type: Type.OBJECT,
          required: ["roleId", "backgroundId", "personalityId"],
          properties: {
            roleId: { type: Type.STRING },
            backgroundId: { type: Type.STRING },
            personalityId: { type: Type.STRING }
          }
        },
        relationship: { type: Type.STRING },
        initialStatement: { type: Type.STRING },
        goal: { type: Type.STRING },
        objectives: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "description", "isMain"],
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              isMain: { type: Type.BOOLEAN }
            }
          }
        }
      }
    }
  }
});

export const getReadingTrainingSchema = () => ({
  type: Type.OBJECT,
  required: ["title", "scenarioDescription", "decryptedMessage"],
  properties: {
    title: { type: Type.STRING },
    scenarioDescription: { type: Type.STRING },
    decryptedMessage: {
      type: Type.OBJECT,
      required: ["fullText", "segments", "readingQuestions"],
      properties: {
        fullText: { type: Type.STRING },
        segments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "textBefore", "answer", "distractors", "textAfter"],
            properties: {
              id: { type: Type.STRING },
              textBefore: { type: Type.STRING },
              answer: { type: Type.STRING },
              distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
              textAfter: { type: Type.STRING }
            }
          }
        },
        readingQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "question", "options", "correctAnswer"],
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING }
            }
          }
        }
      }
    }
  }
});

export const getWritingTrainingSchema = () => ({
  type: Type.OBJECT,
  required: ["title", "scenarioDescription", "minWordCount", "reportPrompt"],
  properties: {
    title: { type: Type.STRING },
    scenarioDescription: { type: Type.STRING },
    minWordCount: { type: Type.NUMBER },
    reportPrompt: { type: Type.STRING }
  }
});

export const getEvaluationSchema = () => ({
  type: Type.OBJECT,
  properties: {
    npcResponse: { type: Type.STRING },
    trustChange: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    completedObjectiveIds: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
});

export const getReportEvaluationSchema = (metaLang: string) => ({
  type: Type.OBJECT,
  properties: {
    corrections: { type: Type.STRING, description: "Grammar/Style feedback in German" },
    score: { type: Type.NUMBER },
    outcome: { type: Type.STRING, description: `Story conclusion in GERMAN (Target Language).` }
  }
});
