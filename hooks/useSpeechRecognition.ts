import { useState, useEffect, useCallback, useRef } from 'react';

// Polyfill types for SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new(): SpeechRecognition };
    webkitSpeechRecognition?: { new(): SpeechRecognition };
  }
}

export const useSpeechRecognition = (language: string = 'de-DE') => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognitionInstance = new SpeechRecognitionConstructor();
        recognitionInstance.continuous = true; 
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = language;

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript) {
             setTranscript(fullTranscript);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech Recognition Error:", event.error);
          if (event.error === 'no-speech') {
              return; 
          }
          setError(event.error);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognitionInstance;
      } else {
        setError("Speech recognition not supported in this browser.");
      }
    }
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, [language]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
        // Force cleanup before starting
        recognitionRef.current.abort();
        setIsRecording(false);

        // Small timeout to allow browser to reset mic state
        setTimeout(() => {
            try {
                setTranscript(''); 
                setError(null);
                recognitionRef.current?.start();
                setIsRecording(true);
            } catch (e) {
                console.error("Failed to start recording:", e);
                setIsRecording(false);
            }
        }, 50);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
          recognitionRef.current.stop();
          setIsRecording(false);
      } catch (e) {
          console.error("Failed to stop recording:", e);
          setIsRecording(false);
      }
    }
  }, []);

  const abortRecording = useCallback(() => {
      if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch(e) { console.warn(e); }
          setIsRecording(false);
      }
  }, []);

  const resetTranscript = useCallback(() => {
      setTranscript('');
  }, []);

  return { isRecording, transcript, error, startRecording, stopRecording, abortRecording, resetTranscript };
};
