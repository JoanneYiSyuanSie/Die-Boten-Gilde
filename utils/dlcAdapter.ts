
import { MissionData, CEFRLevel } from '../types';

/**
 * DLC Adapter Utility
 * 
 * This module handles the transformation of DLC Package files (which may contain bilingual content)
 * into the standard MissionData format that the game expects.
 */

interface BilingualText {
    de: string;
    zh: string;
}

interface DLCManifest {
    displayTitle: BilingualText;
    summary: BilingualText;
    tags: string[];
    estimatedPlaytime: string;
}

interface DLCPackage {
    id: string;
    typeCode: string;
    mode: 'CAMPAIGN' | 'TRAINING';
    manifest: DLCManifest;
    audioFileName?: string; // Optional audio file name (e.g. "mission.mp3")
    content: any; // May contain bilingual objects
}

/**
 * Resolves a bilingual text object or string based on the current language setting.
 * If the input is already a string, returns it as-is.
 * If the input is an object with {de, zh}, picks the appropriate one.
 */
const resolveBilingualText = (text: string | BilingualText | undefined, language: 'de' | 'zh'): string | undefined => {
    if (!text) return undefined;
    if (typeof text === 'string') return text;
    return text[language] || text.zh; // Fallback to Chinese if the selected language is missing
};

/**
 * Transforms a DLC Package into a standard MissionData object.
 * 
 * This function handles:
 * - Bilingual text resolution (historicalFact.content, etc.)
 * - Nested object transformation
 * - Language-specific content selection
 * 
 * @param dlcPackage - The raw DLC package (possibly with bilingual objects)
 * @param language - The current UI language setting ('de' | 'zh')
 * @returns A standard MissionData object ready for the game to consume
 */
export const adaptDLCToMissionData = (dlcPackage: DLCPackage, language: 'de' | 'zh'): MissionData => {
    const content = dlcPackage.content;

    // Transform the content, resolving any bilingual fields
    const missionData: MissionData = {
        level: content.level as CEFRLevel,
        title: content.title,
        scenarioDescription: content.scenarioDescription,
        minWordCount: content.minWordCount,

        // Reading Phase (Level 1)
        decryptedMessage: content.decryptedMessage ? {
            fullText: content.decryptedMessage.fullText,
            segments: content.decryptedMessage.segments || [],
            readingQuestions: content.decryptedMessage.readingQuestions || []
        } : undefined,

        // Speaking Phase (Level 2)
        negotiation: content.negotiation ? {
            npcName: content.negotiation.npcName,
            npcRole: content.negotiation.npcRole,
            npcVoice: content.negotiation.npcVoice,
            npcAttributes: content.negotiation.npcAttributes,
            npcTraits: content.negotiation.npcTraits,
            relationship: content.negotiation.relationship,
            initialStatement: content.negotiation.initialStatement,
            initialStatementTranslation: content.negotiation.initialStatementTranslation,
            initialStatementAudio: content.negotiation.initialStatementAudio,
            goal: content.negotiation.goal,
            objectives: content.negotiation.objectives || [],
            script: content.negotiation.script
        } : undefined,

        // Writing Phase (Level 3)
        reportPrompt: content.reportPrompt,

        // Historical Fact - BILINGUAL RESOLUTION HAPPENS HERE
        historicalFact: content.historicalFact ? {
            title: content.historicalFact.title,
            content: resolveBilingualText(content.historicalFact.content, language) || '',
            source: content.historicalFact.source
        } : undefined,

        // Demo Mode
        mockFeedback: content.mockFeedback,
        illustrationUrl: content.illustrationUrl
    };

    return missionData;
};

/**
 * Loads a DLC package from a JSON file path (for future file system integration).
 * This is a placeholder for when we implement file system loading.
 */
export const loadDLCFromFile = async (filePath: string, language: 'de' | 'zh'): Promise<MissionData> => {
    // TODO: Implement actual file loading when needed
    // For now, this would require fetch() or fs module depending on environment
    throw new Error('File loading not yet implemented. Use adaptDLCToMissionData with imported JSON.');
};
