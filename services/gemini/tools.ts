
import { GoogleGenAI, Modality } from "@google/genai";
import { createAudioUrlFromBase64 } from "../../utils/audioUtils";

export const translateText = async (apiKey: string, text: string, targetLang: 'de' | 'zh'): Promise<string> => {
    if (!apiKey) throw new Error("API Key is missing");
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text to ${targetLang === 'de' ? 'German' : 'Traditional Chinese'}. Output ONLY the translated text. Do not include any explanations, notes, or original text. \n\n"${text}"`,
    });
    return response.text?.trim() || "Translation failed.";
};

export const generateTTS = async (apiKey: string, text: string, voiceName: string = 'Puck'): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const client = new GoogleGenAI({ apiKey });
  
  const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
  const voice = validVoices.includes(voiceName) ? voiceName : 'Puck';

  const cleanText = text
    .replace(/\*.*?\*/g, '') 
    .replace(/\(.*?\)/g, '') 
    .replace(/\[.*?\]/g, '') 
    .trim();

  // Ensure there is at least one alphanumeric character (supporting German umlauts)
  // This prevents "This prompt is not supported by the AudioOut model" errors for inputs like "..." or "?"
  const hasContent = /[a-zA-Z0-9äöüÄÖÜß]/.test(cleanText);

  if (!cleanText || !hasContent) {
      throw new Error("Text empty after sanitization");
  }

  try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
              voiceConfig: { 
                  prebuiltVoiceConfig: { voiceName: voice } 
              } 
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
          throw new Error("No audio data received from Gemini TTS");
      }
      return createAudioUrlFromBase64(base64Audio);
  } catch (error: any) {
      const errorMsg = error.message || error.toString();
      // Handle "This prompt is not supported by the AudioOut model" error (Code 400)
      if (errorMsg.includes("not supported by the AudioOut model") || errorMsg.includes("non-audio response")) {
          // We throw the specific known error that views are configured to ignore/suppress
          throw new Error("Text empty after sanitization");
      }

      console.error("Gemini TTS Error:", error);
      throw error;
  }
};

export const generateEndingIllustration = async (apiKey: string, outcome: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `A cinematic fantasy oil painting depicting: ${outcome}. Parchment texture, dramatic lighting, epic tabletop RPG style, Old Master style.` }] },
    config: { imageConfig: { aspectRatio: "16:9" } },
  });
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};
