
import React, { useEffect, useState, useRef } from 'react';
import { useDictionary } from '../../contexts/DictionaryContext';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../utils/translations';
import { getPonsLink, getDwdsLink, getLeoLink, getGodicLink } from '../../utils/dictionaryUtils';
import { Icons } from './Icons';

export const SelectionMenu: React.FC = () => {
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');
    const [contextText, setContextText] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');

    const { addWord } = useDictionary();
    const { settings } = useSettings();
    const t = translations[settings.language];

    const menuRef = useRef<HTMLDivElement>(null);

    // Safe ID generator
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    useEffect(() => {
        const handleSelection = (e: Event) => {
            // If form is open, do not update selection logic at all
            if (showForm) return;

            // If the interaction is with the menu button itself, ignore it to prevent clearing position
            if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) {
                return;
            }

            const selection = window.getSelection();

            if (!selection || selection.isCollapsed || !selection.toString().trim()) {
                setPosition(null);
                return;
            }

            const text = selection.toString().trim();
            // Basic validation: ignore overly long selections
            if (text.split(' ').length > 10) {
                setPosition(null);
                return;
            }

            try {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Ensure the selection is visible on screen before showing menu
                if (rect.width === 0 || rect.height === 0) {
                    setPosition(null);
                    return;
                }

                let context = text;
                if (selection.anchorNode && selection.anchorNode.textContent) {
                    context = selection.anchorNode.textContent.substring(0, 300); // Limit context length
                }

                setSelectedText(text);
                setContextText(context);

                // Use Fixed Positioning to be accurate relative to viewport
                setPosition({
                    x: rect.left + (rect.width / 2),
                    y: rect.top - 10
                });
            } catch (e) {
                console.error("Selection handling error:", e);
                setPosition(null);
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('touchend', handleSelection);
        // We keep scroll/resize to update position if the user scrolls AFTER selecting
        window.addEventListener('scroll', handleSelection);
        window.addEventListener('resize', handleSelection);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('touchend', handleSelection);
            window.removeEventListener('scroll', handleSelection);
            window.removeEventListener('resize', handleSelection);
        };
    }, []); // Keep showForm in dependencies to ensure handleSelectionChange always has the latest state

    const handleOpenForm = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowForm(true);
        setNotes('');
        setTags('');
    };

    const handleSave = () => {
        try {
            addWord({
                id: generateId(),
                word: selectedText,
                context: contextText,
                notes: notes,
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                timestamp: Date.now()
            });
        } catch (e) {
            console.error("Failed to add word:", e);
            alert("Failed to save word. Please try again.");
        }

        // Cleanup
        try {
            window.getSelection()?.removeAllRanges();
        } catch (e) { /* ignore */ }

        setPosition(null);
        setShowForm(false);
    };

    const handleCancel = () => {
        try {
            window.getSelection()?.removeAllRanges();
        } catch (e) { /* ignore */ }
        setPosition(null);
        setShowForm(false);
    };

    // 1. If form is active, show form (regardless of position)
    if (showForm) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                <div className="bg-[#f3e5ab] p-6 rounded-lg border-4 border-[#2c1810] shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-fantasy font-bold mb-4 text-[#8a1c1c]">{t.addToGrimoire}</h3>

                    <div className="mb-4">
                        <p className="text-xs font-bold text-[#2c1810] mb-1 uppercase tracking-wider">{t.externalDictionaries}</p>
                        <div className="flex gap-3 flex-wrap">
                            <a href={getDwdsLink(selectedText)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">DWDS</a>
                            <span className="text-gray-400 text-xs">|</span>
                            <a href={getPonsLink(selectedText, settings.language)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">PONS</a>
                            <span className="text-gray-400 text-xs">|</span>
                            <a href={getLeoLink(selectedText, settings.language)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">LEO</a>
                            <span className="text-gray-400 text-xs">|</span>
                            <a href={getGodicLink(selectedText)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">德語助手</a>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-[#2c1810] mb-1">{t.wordLabel}</label>
                        <input
                            type="text"
                            value={selectedText}
                            onChange={(e) => setSelectedText(e.target.value)}
                            className="w-full p-2 bg-white border-2 border-[#2c1810] rounded font-serif font-bold text-lg text-[#2c1810] focus:outline-none focus:ring-2 focus:ring-[#8a1c1c] transition-all"
                            placeholder={t.wordPlaceholder}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-[#2c1810] mb-1">{t.context}</label>
                        <div className="p-2 bg-white/40 border border-[#2c1810]/30 rounded text-sm italic text-gray-700 max-h-20 overflow-y-auto">"{contextText}"</div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-[#2c1810] mb-1">{t.notes}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 bg-white border border-[#2c1810]/50 text-[#2c1810] rounded h-24 text-sm focus:outline-none focus:ring-1 focus:ring-[#8a1c1c]"
                            placeholder={t.notesPlaceholder}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-[#2c1810] mb-1">{t.tags}</label>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full p-2 bg-white border border-[#2c1810]/50 text-[#2c1810] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8a1c1c]"
                            placeholder={t.tagsPlaceholder}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancel} className="px-4 py-2 text-[#2c1810] hover:bg-black/10 rounded">{t.cancel}</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-[#8a1c1c] text-[#f3e5ab] font-bold rounded shadow hover:bg-[#a62424]">{t.saveToGrimoire}</button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. If no position, nothing to show
    if (!position) return null;

    // 3. Show the small floating button
    return (
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -100%)'
            }}
            className="z-50 pb-2 animate-bounce"
            onMouseDown={(e) => e.preventDefault()} // Prevent button click from clearing selection
        >
            <button
                onClick={handleOpenForm}
                className="bg-[#2c1810] text-[#f3e5ab] px-3 py-1 rounded shadow-lg border border-[#f3e5ab] font-fantasy text-sm hover:bg-[#4a2e20] transition flex items-center gap-2 whitespace-nowrap"
            >
                <Icons.Book className="w-4 h-4" />
                <span>{t.addToGrimoire}</span>
            </button>
        </div>
    );
};
