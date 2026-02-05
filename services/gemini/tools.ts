
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
  // Case-insensitive match
  const matchedVoice = validVoices.find(v => v.toLowerCase() === voiceName.toLowerCase());
  const voice = matchedVoice || 'Puck';

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

  // Strategy: Try Fast Flash Model first -> Fallback to High-Quality Imagen 3

  // 1. Attempt Gemini 2.5 Flash Image (Fast & High Quota)
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Generate a cinematic fantasy oil painting depicting: ${outcome}. Parchment texture, dramatic lighting, epic tabletop RPG style, Old Master style. IMPORTANT: NO TEXT, NO LABELS, NO LETTERS, NO UI ELEMENTS. PURE IMAGE ONLY.` }] },
      config: { imageConfig: { aspectRatio: "16:9" } },
    });

    // Check for inline data in candidates (Flash Image output format)
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }

    // If no inline data, it might have failed tacitly or safety blocked
    console.warn("Gemini Flash Image returned no inline data. Falling back...");
  } catch (flashError) {
    console.warn("Gemini Flash Image failed:", flashError);
    // Fallthrough to Imagen 3
  }

  // 2. Fallback to Imagen 3 (Reliable but lower quota?)
  try {
    const response = await client.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: `A cinematic fantasy oil painting depicting: ${outcome}. Parchment texture, dramatic lighting, epic tabletop RPG style, Old Master style. IMPORTANT: NO TEXT, NO LABELS, NO LETTERS, NO UI ELEMENTS. PURE IMAGE ONLY.`,
      config: { aspectRatio: "16:9" },
    });

    // Check for generated images in the response
    const image = response.generatedImages?.[0]?.image as any;

    if (image) {
      if (image.base64) return `data:image/png;base64,${image.base64}`;
      if (image.b64Json) return `data:image/png;base64,${image.b64Json}`;
      // Fallback for potentially binary format
      if (image.imageBytes) {
        return `data:image/png;base64,${Buffer.from(image.imageBytes).toString('base64')}`;
      }
    }

    throw new Error("No image data received from Imagen");
  } catch (error) {
    console.error("Image Generation Error (All Models Failed):", error);
    throw error;
  }
};
