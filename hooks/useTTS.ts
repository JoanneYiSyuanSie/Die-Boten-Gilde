
import { useState, useCallback } from 'react';
import { generateTTS } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';

// Map our NPC Voice IDs to Browser Voice Preferences
// We look for gender/lang keywords in system voices
const VOICE_PREFERENCES: Record<string, { gender: 'female' | 'male', pitch: number, rate: number }> = {
    'Puck': { gender: 'female', pitch: 1.2, rate: 1.1 }, // Playful, higher
    'Kore': { gender: 'female', pitch: 1.0, rate: 1.0 }, // Mystical, normal
    'Zephyr': { gender: 'female', pitch: 0.9, rate: 0.9 }, // Calm, soft
    'Charon': { gender: 'male', pitch: 0.8, rate: 0.9 }, // Deep, slow
    'Fenrir': { gender: 'male', pitch: 0.7, rate: 1.1 }, // Aggressive, low
};

export const useTTS = () => {
    const { settings } = useSettings();
    const [isFallingBack, setIsFallingBack] = useState(false);

    /**
     * Tries to generate audio using Gemini, falls back to Browser TTS on error.
     * Returns a URL (blob or remote) if Gemini succeeds, or NULL if it fell back to browser playback directly.
     */
    const speak = useCallback(async (text: string, voiceId: string = 'Puck'): Promise<string | null> => {
        // 1. Try Gemini First (if API key exists and we haven't permanently fallen back this session)
        if (settings.apiKey && !isFallingBack) {
            try {
                const audioUrl = await generateTTS(settings.apiKey, text, voiceId);
                return audioUrl;
            } catch (error: any) {
                console.warn("Gemini TTS failed, switching to fallback:", error);

                // If it's a quota/server error, mark fallback mode as active to skip future API calls this session
                if (error.message.includes('429') || error.message.includes('503') || error.message.includes('quota')) {
                    setIsFallingBack(true);
                }
                // Continue to fallback...
            }
        }

        // 2. Browser Fallback
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = settings.language === 'de' ? 'de-DE' : 'zh-TW'; // Target language (German usually)

            // Attempt to find a matching voice
            const voices = window.speechSynthesis.getVoices();
            const pref = VOICE_PREFERENCES[voiceId] || VOICE_PREFERENCES['Puck'];

            // Simple matching logic
            const targetVoice = voices.find(v =>
                v.lang.startsWith(settings.language === 'de' ? 'de' : 'zh') &&
                (v.name.toLowerCase().includes(pref.gender === 'female' ? 'female' : 'male') ||
                    v.name.toLowerCase().includes('google')) // "Google Deutsch" is usually female/neutral good quality
            );

            if (targetVoice) utterance.voice = targetVoice;
            utterance.pitch = pref.pitch;
            utterance.rate = pref.rate;

            utterance.onend = () => resolve(null); // Resolve with null to indicate "played directly"
            utterance.onerror = () => resolve(null);

            window.speechSynthesis.speak(utterance);
        });

    }, [settings.apiKey, settings.language, isFallingBack]);

    return { speak, isFallingBack };
};
