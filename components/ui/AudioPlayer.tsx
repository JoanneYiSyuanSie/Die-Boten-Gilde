
import React from 'react';
import { useAudio } from '../../hooks/useAudio';

interface AudioPlayerProps {
    src: string | null;
    className?: string;
    autoPlay?: boolean;
    minimal?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className = '', autoPlay = false, minimal = false }) => {
    const { isPlaying, playbackRate, togglePlay, changeSpeed, currentTime, duration, audioRef } = useAudio(src);

    React.useEffect(() => {
        if (autoPlay && src && audioRef.current) {
            audioRef.current.play().catch(() => {});
        }
    }, [autoPlay, src, audioRef]);

    if (!src) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`flex items-center ${minimal ? 'gap-2 p-1.5' : 'gap-3 p-2'} rounded-full border shadow-lg ${className} audio-player-container`}>
            <button 
                onClick={togglePlay}
                className={`${minimal ? 'w-8 h-8 text-sm' : 'w-10 h-10'} flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform audio-btn-primary`}
            >
                {isPlaying ? '⏸' : '▶'}
            </button>
            
            {!minimal && (
                <div className="flex-1 h-2 rounded-full overflow-hidden min-w-[100px] relative audio-progress-track">
                    <div 
                        className="h-full transition-all duration-100 audio-progress-fill" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <button 
                onClick={changeSpeed}
                className={`${minimal ? 'w-8 text-[9px] px-0.5' : 'w-12 text-[10px] px-1'} font-bold font-mono rounded py-1 hover:bg-white/20 transition-colors audio-speed-btn`}
                title="Playback Speed"
            >
                {playbackRate}x
            </button>
        </div>
    );
};
