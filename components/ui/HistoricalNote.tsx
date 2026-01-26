
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../utils/translations';

interface HistoricalNoteProps {
    data?: {
        title: string;
        content: string;
        source: string;
    };
    className?: string;
}

export const HistoricalNote: React.FC<HistoricalNoteProps> = ({ data, className = '' }) => {
    const { settings } = useSettings();
    const t = translations[settings.language];

    if (!data) return null;

    return (
        <div className={`relative p-4 shadow-md border rotate-1 font-body max-w-sm mx-auto transition-transform hover:rotate-0 hover:scale-105 historical-note-card ${className}`}>
            {/* Visual Pin */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full shadow-sm z-10 border historical-note-pin"></div>
            
            <h4 className="font-fantasy font-bold text-sm mb-1 uppercase tracking-wider border-b pb-1 historical-note-title">
                {t.historicalNote}
            </h4>
            
            <h5 className="font-bold text-md mb-2">{data.title}</h5>
            
            <p className="text-sm italic leading-relaxed mb-3 opacity-90">
                "{data.content}"
            </p>
            
            <div className="text-[10px] text-right opacity-60 font-serif">
                <span className="font-bold">{t.source}:</span> {data.source}
            </div>
        </div>
    );
};
