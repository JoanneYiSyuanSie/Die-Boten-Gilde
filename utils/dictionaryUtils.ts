
export const getPonsLink = (word: string, lang: 'de' | 'zh') => {
    const langPair = lang === 'zh' ? 'deutsch-chinesisch' : 'deutsch-englisch';
    return `https://de.pons.com/%C3%BCbersetzung/${langPair}/${encodeURIComponent(word)}`;
};

export const getDwdsLink = (word: string) => {
    return `https://www.dwds.de/wb/${encodeURIComponent(word)}`;
};

export const getLeoLink = (word: string, lang: 'de' | 'zh') => {
    // Assuming Chinese users prefer Chinese-German if available, matching user's recent edit
    // User hardcoded 'chinesisch-deutsch' in BlackBookModal. We will support logic.
    const langPair = lang === 'zh' ? 'chinesisch-deutsch' : 'englisch-deutsch';
    return `https://dict.leo.org/${langPair}/${encodeURIComponent(word)}`;
};

export const getGodicLink = (word: string) => {
    return `https://www.godic.net/dicts/de/${encodeURIComponent(word)}`;
};
