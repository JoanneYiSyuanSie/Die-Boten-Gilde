
/**
 * License Key Utility for Die Boten Gilde
 * 
 * Format: DBG-TYPE-RAND-CSUM
 * Example: DBG-DEMO-X7Z2-A1B2
 * 
 * - DBG: Fixed Prefix
 * - TYPE: 4-char code identifying the DLC (e.g., DEMO, C001)
 * - RAND: 4-char random string (for uniqueness/entropy)
 * - CSUM: 4-char checksum derived from TYPE and RAND
 */

const PREFIX = 'DBG';

// Map 4-char codes to actual Item IDs
export const DLC_CODE_MAP: Record<string, string> = {
    'DEMO': 'dlc_item_demo',
    'EX01': 'dlc_example_01',
};

// Generates a Checksum for a given input string
const generateChecksum = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    // Convert to positive hex string and take last 4 chars
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
    return hex.slice(-4);
};

export const validateLicenseKey = (key: string): { valid: boolean; itemId?: string; error?: string } => {
    // 1. Format Check
    const parts = key.toUpperCase().split('-');
    if (parts.length !== 4) {
        return { valid: false, error: 'invalid_format' };
    }

    const [prefix, type, rand, checksum] = parts;

    // 2. Prefix Check
    if (prefix !== PREFIX) {
        return { valid: false, error: 'invalid_prefix' };
    }

    // 3. Checksum Verification
    const calculatedChecksum = generateChecksum(`${type}-${rand}`);
    if (calculatedChecksum !== checksum) {
        return { valid: false, error: 'invalid_checksum' };
    }

    // 4. Content Mapping Check
    const itemId = DLC_CODE_MAP[type];
    if (!itemId) {
        return { valid: false, error: 'unknown_product' };
    }

    return { valid: true, itemId };
};

// Available only for Dev/DLC Manager usage
export const generateLicenseKey = (typeCode: string): string => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, 'X');
    const checksum = generateChecksum(`${typeCode}-${rand}`);
    return `${PREFIX}-${typeCode}-${rand}-${checksum}`;
};
