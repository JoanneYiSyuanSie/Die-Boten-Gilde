
export const parseJSON = <T>(text: string): T => {
  try {
    // Robust parsing: Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?|```/g, '').trim();
    
    // Find first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw new Error("Invalid JSON response from AI");
  }
};

export const getInterfaceLangName = (lang: 'de' | 'zh') => {
  return lang === 'de' ? 'German' : 'Traditional Chinese (Taiwan)';
};
