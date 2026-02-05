/**
 * DLC Registry
 * 
 * This module provides a centralized registry for all available DLC packages.
 * Each DLC must be imported here to be accessible by the game.
 */

import dlcExample01 from '../data/dlc/dlc_example_01.json';

// Type definition for DLC Package
interface DLCPackageData {
    id: string;
    typeCode: string;
    mode: 'CAMPAIGN' | 'TRAINING';
    audioFileName?: string;
    manifest: any;
    content: any;
}

// DLC Registry - Add new DLCs here
export const DLC_REGISTRY: Record<string, DLCPackageData> = {
    'dlc_example_01': dlcExample01 as DLCPackageData,
    // Add more DLCs here as they become available
    // 'dlc_chapter_2': dlcChapter02,
};

/**
 * Gets a DLC package by its ID
 */
export function getDLCPackage(dlcId: string): DLCPackageData | null {
    return DLC_REGISTRY[dlcId] || null;
}

/**
 * Checks if a DLC is available in the registry
 */
export function isDLCAvailable(dlcId: string): boolean {
    return dlcId in DLC_REGISTRY;
}
