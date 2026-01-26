import React from 'react';
import { translations } from '../../utils/translations';
import { useSettings } from '../../contexts/SettingsContext';
import { ParchmentContainer } from './ParchmentContainer';
import { FantasyButton } from './FantasyButton';

interface ErrorModalProps {
    error: { message: string, retryAction?: () => void };
    onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
    const { settings } = useSettings();
    const t = translations[settings.language];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ParchmentContainer className="max-w-md w-full animate-in zoom-in-95 duration-300 border-4 border-[#8a1c1c] shadow-[0_0_50px_rgba(138,28,28,0.5)]">
                <div className="text-center space-y-4">
                    <div className="text-5xl mb-2">🐢</div>
                    <h3 className="text-2xl font-fantasy font-bold text-[#8a1c1c] uppercase tracking-widest">{t.serverBusy || "Server Busy"}</h3>

                    <p className="text-[#2c1810] font-bold text-sm bg-[#8a1c1c]/10 p-4 rounded border border-[#8a1c1c]/20">
                        {t.serverBusyDesc || "The Guild's psychic network is overloaded with messages! The Oracle needs a moment to recover."}
                    </p>

                    <div className="text-xs text-gray-500 font-mono bg-white/50 p-2 rounded break-all">
                        Error: {error.message}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <FantasyButton
                            variant="secondary"
                            onClick={onClose}
                        >
                            {t.returnToMain || "Return"}
                        </FantasyButton>
                        <FantasyButton
                            onClick={error.retryAction}
                            disabled={!error.retryAction}
                            className={!error.retryAction ? 'opacity-50 grayscale' : ''}
                        >
                            {t.retry || "Retry"}
                        </FantasyButton>
                    </div>
                </div>
            </ParchmentContainer>
        </div>
    );
};
