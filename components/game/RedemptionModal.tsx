
import React, { useState } from 'react';
import { useGuild } from '../../contexts/GuildContext';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../utils/translations';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { FantasyButton } from '../ui/FantasyButton';
import { Icons } from '../ui/Icons';

interface RedemptionModalProps {
    onClose: () => void;
}

export const RedemptionModal: React.FC<RedemptionModalProps> = ({ onClose }) => {
    const { redeemLicense } = useGuild();
    const { settings } = useSettings();
    const t = translations[settings.language];

    const [keyInput, setKeyInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleRedeem = () => {
        if (!keyInput.trim()) return;

        setStatus('processing');

        // Simulate a small network delay for effect
        setTimeout(() => {
            const result = redeemLicense(keyInput.trim());
            if (result.success) {
                setStatus('success');
                setMessage(settings.language === 'zh' ? '序號驗證成功！物品已送達。' : 'Code redeemed successfully!');
                setKeyInput('');
            } else {
                setStatus('error');
                setMessage(settings.language === 'zh' ? '無效的序號，請檢查輸入。' : 'Invalid code. Please check your input.');
            }
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <ParchmentContainer className="max-w-md w-full relative border-2 border-[#8aa7b8] shadow-[0_0_30px_rgba(138,167,184,0.2)]">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="text-[#2c1810] opacity-50 hover:opacity-100">
                        <Icons.Cross className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-3 bg-[#2c1810] rounded-full border border-[#f3e5ab]">
                            <Icons.Key className="w-8 h-8 text-[#f3e5ab]" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-fantasy font-bold text-[#2c1810]">
                        {settings.language === 'zh' ? '兌換神秘代碼' : 'Redeem Code'}
                    </h3>

                    <p className="text-sm italic opacity-70">
                        {settings.language === 'zh'
                            ? '收到來自遠方的密函了嗎？輸入代碼以領取包裹。'
                            : 'Received a missive from afar? Enter the code to claim your package.'}
                    </p>

                    <div className="space-y-2">
                        <input
                            type="text"
                            value={keyInput}
                            onChange={(e) => {
                                setKeyInput(e.target.value.toUpperCase());
                                setStatus('idle');
                            }}
                            placeholder="DBG-XXXX-XXXX-XXXX"
                            className="w-full text-center font-mono text-lg p-2 bg-[#fdfbf7] border-2 border-[#2c1810]/30 rounded focus:border-[#8a1c1c] outline-none tracking-widest uppercase"
                            disabled={status === 'processing' || status === 'success'}
                        />

                        {status !== 'idle' && (
                            <div className={`text-sm font-bold flex items-center justify-center gap-2 ${status === 'success' ? 'text-green-700' :
                                    status === 'error' ? 'text-red-700' : 'text-[#2c1810]'
                                }`}>
                                {status === 'processing' && <Icons.Loader className="w-4 h-4 animate-spin" />}
                                {status === 'success' && <Icons.Check className="w-4 h-4" />}
                                {message}
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        {status === 'success' ? (
                            <FantasyButton onClick={onClose} className="w-full">
                                {settings.language === 'zh' ? '確認' : 'Close'}
                            </FantasyButton>
                        ) : (
                            <FantasyButton
                                onClick={handleRedeem}
                                disabled={!keyInput || status === 'processing'}
                                className="w-full"
                            >
                                {status === 'processing' ? 'Verifying...' : (settings.language === 'zh' ? '兌換' : 'Redeem')}
                            </FantasyButton>
                        )}
                    </div>
                </div>
            </ParchmentContainer>
        </div>
    );
};
