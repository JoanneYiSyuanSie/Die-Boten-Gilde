
import { LocalizedText } from "./shopItems";
import { GameMode, NpcAttributes } from "../types";

export interface NpcTraitDef {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
}

export const NPC_ROLES: NpcTraitDef[] = [
    { 
        id: 'CLERGY', 
        name: { de: 'Klerus', zh: '神職' }, 
        description: { de: 'Mönch, Priester oder Nonne. Schätzt Frömmigkeit und Latein.', zh: '僧侶、神父或修女。重視虔誠與拉丁語。' } 
    },
    { 
        id: 'SCHOLAR', 
        name: { de: 'Gelehrter', zh: '學者' }, 
        description: { de: 'Professor, Student oder Schreiber. Schätzt Logik.', zh: '教授、學生或書記官。重視邏輯與知識。' } 
    },
    { 
        id: 'BANDIT', 
        name: { de: 'Bandit', zh: '強盜' }, 
        description: { de: 'Gesetzloser oder Dieb. Respektiert Stärke und Gold.', zh: '亡命之徒或竊賊。只尊重力量與黃金。' } 
    },
    { 
        id: 'MERCENARY', 
        name: { de: 'Söldner', zh: '傭兵' }, 
        description: { de: 'Kämpfer für Geld. Pragmatisch und direkt.', zh: '收錢辦事的戰士。務實且直接。' } 
    },
    { 
        id: 'GUARD', 
        name: { de: 'Wache', zh: '守衛' }, 
        description: { de: 'Stadtwache. Schätzt Ordnung und Autorität.', zh: '城鎮守衛。重視秩序與權威。' } 
    },
    { 
        id: 'MERCHANT', 
        name: { de: 'Händler', zh: '商人' }, 
        description: { de: 'Kaufmann oder Bankier. Schätzt Profit.', zh: '店主或銀行家。重視利潤與交易。' } 
    },
    { 
        id: 'BARD', 
        name: { de: 'Barde', zh: '詩人' }, 
        description: { de: 'Künstler oder Musiker. Schätzt Emotionen.', zh: '藝術家或音樂家。重視情感與才華。' } 
    },
    { 
        id: 'OFFICIAL', 
        name: { de: 'Beamter', zh: '官員' }, 
        description: { de: 'Bürokrat. Liebt Regeln und Papierkram.', zh: '官僚。熱愛規則與文書工作。' } 
    },
    { 
        id: 'RULER', 
        name: { de: 'Herrscher', zh: '統治者' }, 
        description: { de: 'Lokaler Machthaber oder Vogt. Verlangt Unterwerfung.', zh: '當地掌權者或長官。要求絕對的服從。' } 
    }
];

export const NPC_BACKGROUNDS: NpcTraitDef[] = [
    { 
        id: 'POOR', 
        name: { de: 'Arm', zh: '貧苦' }, 
        description: { de: 'Unterschicht. Misstrauisch gegenüber Reichen.', zh: '底層階級。對富人存疑，對苦難有同理心。' } 
    },
    { 
        id: 'COMMONER', 
        name: { de: 'Bürgerlich', zh: '平民' }, 
        description: { de: 'Mittelschicht. Standardverhalten.', zh: '中產階級。反應與互動最為標準。' } 
    },
    { 
        id: 'WEALTHY', 
        name: { de: 'Reich', zh: '富有' }, 
        description: { de: 'Oberschicht. Erwartet Qualität.', zh: '上層中產。期待高品質的對話與服務。' } 
    },
    { 
        id: 'NOBLE', 
        name: { de: 'Adlig', zh: '貴族' }, 
        description: { de: 'Aristokratie. Verlangt Etikette und Respekt.', zh: '貴族階級。極度講究禮節與尊稱。' } 
    }
];

export const NPC_PERSONALITIES: NpcTraitDef[] = [
    { 
        id: 'EMOTIONAL', 
        name: { de: 'Emotional', zh: '感性' }, 
        description: { de: 'Stimmung schwankt stark. Mag Empathie.', zh: '情緒波動大。喜歡有同理心的對話。' } 
    },
    { 
        id: 'PRAGMATIC', 
        name: { de: 'Pragmatisch', zh: '務實' }, 
        description: { de: 'Zielorientiert. Schwer zu beeindrucken.', zh: '只在乎結果與目標。難以被討好。' } 
    },
    { 
        id: 'SUSPICIOUS', 
        name: { de: 'Misstrauisch', zh: '多疑' }, 
        description: { de: 'Niedriges Startvertrauen. Braucht Beweise.', zh: '初始信任低。需要證據才肯相信。' } 
    },
    { 
        id: 'GREEDY', 
        name: { de: 'Gierig', zh: '貪財' }, 
        description: { de: 'Bestechung wirkt doppelt.', zh: '賄賂效果加倍。討厭損失金錢。' } 
    },
    { 
        id: 'ARROGANT', 
        name: { de: 'Arrogant', zh: '傲慢' }, 
        description: { de: 'Braucht Schmeichelei. Hasst Korrekturen.', zh: '需要奉承。討厭被糾正或頂撞。' } 
    },
    { 
        id: 'STRICT', 
        name: { de: 'Streng', zh: '嚴格' }, 
        description: { de: 'Bestraft Grammatikfehler hart.', zh: '嚴厲懲罰文法與用詞錯誤。' } 
    },
    { 
        id: 'FRIENDLY', 
        name: { de: 'Freundlich', zh: '友善' }, 
        description: { de: 'Hohes Startvertrauen. Verzeiht Fehler.', zh: '初始信任高。容易原諒錯誤。' } 
    },
    { 
        id: 'BUSY', 
        name: { de: 'Gestresst', zh: '忙碌' }, 
        description: { de: 'Wenig Geduld. Hasst Smalltalk.', zh: '沒耐心。討厭閒聊與廢話。' } 
    },
    { 
        id: 'SUPERSTITIOUS', 
        name: { de: 'Abergläubisch', zh: '迷信' }, 
        description: { de: 'Reagiert auf Omen und Glück.', zh: '對徵兆、運氣與詛咒有強烈反應。' } 
    },
    { 
        id: 'INTROVERTED', 
        name: { de: 'Introvertiert', zh: '內向' }, 
        description: { de: 'Schüchtern. Aggression senkt Vertrauen.', zh: '害羞。侵略性的態度會迅速降低信任。' } 
    }
];

// Helper to get all IDs for prompt generation
export const getAllTraitIds = () => ({
    roles: NPC_ROLES.map(r => r.id).join(', '),
    backgrounds: NPC_BACKGROUNDS.map(b => b.id).join(', '),
    personalities: NPC_PERSONALITIES.map(p => p.id).join(', ')
});

/**
 * Calculates the starting trust based on Game Mode, NPC Traits, and Player Identity.
 */
export const calculateInitialTrust = (
    mode: GameMode, 
    npc: NpcAttributes, 
    playerIdentityId?: string
): number => {
    // 1. Base Trust
    let trust = mode === 'CAMPAIGN' ? 0 : 50;

    // 2. Background Modifiers
    if (npc.backgroundId === 'NOBLE') trust -= 15; // Harder to impress
    if (npc.backgroundId === 'POOR') trust += 10; // More approachable (usually)
    if (npc.backgroundId === 'WEALTHY') trust -= 5;

    // 3. Personality Modifiers
    if (npc.personalityId === 'SUSPICIOUS') trust -= 15;
    if (npc.personalityId === 'FRIENDLY') trust += 15;
    if (npc.personalityId === 'ARROGANT') trust -= 10;
    if (npc.personalityId === 'INTROVERTED') trust -= 5;

    // 4. Synergy (Player Identity)
    if (playerIdentityId) {
        const synergy = checkSynergy(playerIdentityId, npc);
        if (synergy === 'positive') trust += 20;
        if (synergy === 'negative') trust -= 20;
    }

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, trust));
};

export const checkSynergy = (playerOriginId: string, npc: NpcAttributes): 'positive' | 'negative' | 'neutral' => {
    // Defines which traits react well/poorly to specific player origins
    const matrix: Record<string, { pos: string[], neg: string[] }> = {
        'origin_merchant': {
            pos: ['MERCHANT', 'GREEDY', 'WEALTHY', 'RULER'], // Landlord changed to Ruler
            neg: ['NOBLE', 'CLERGY', 'STRICT', 'POOR'] 
        },
        'origin_noble': {
            pos: ['NOBLE', 'OFFICIAL', 'GUARD', 'ARROGANT', 'RULER'],
            neg: ['POOR', 'BANDIT', 'COMMONER', 'SUSPICIOUS']
        },
        'origin_artist': {
            pos: ['BARD', 'FRIENDLY', 'EMOTIONAL', 'SUPERSTITIOUS', 'COMMONER'],
            neg: ['STRICT', 'OFFICIAL', 'PRAGMATIC', 'GUARD']
        },
        'origin_scholar': {
            pos: ['SCHOLAR', 'CLERGY', 'OFFICIAL', 'INTROVERTED'],
            neg: ['BANDIT', 'MERCENARY', 'BUSY']
        }
    };

    const synergy = matrix[playerOriginId];
    if (!synergy) return 'neutral';

    // Check all 3 dimensions
    const allNpcTags = [npc.roleId, npc.backgroundId, npc.personalityId];

    const hasPos = allNpcTags.some(tag => synergy.pos.includes(tag));
    const hasNeg = allNpcTags.some(tag => synergy.neg.includes(tag));

    if (hasPos && !hasNeg) return 'positive';
    if (hasNeg && !hasPos) return 'negative';
    
    // If has both, they cancel out
    return 'neutral';
};

export const getTraitDef = (id: string): NpcTraitDef | undefined => {
    return [...NPC_ROLES, ...NPC_BACKGROUNDS, ...NPC_PERSONALITIES].find(t => t.id === id);
};
