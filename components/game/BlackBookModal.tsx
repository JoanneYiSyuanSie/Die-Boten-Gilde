
import React, { useState, useMemo } from 'react';
import { useGuild } from '../../contexts/GuildContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useDictionary } from '../../contexts/DictionaryContext';
import { translations } from '../../utils/translations';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { Icons } from '../ui/Icons';
import { FantasyButton } from '../ui/FantasyButton';
import { WordEntry } from '../../types';
import { getPonsLink, getDwdsLink, getLeoLink, getGodicLink } from '../../utils/dictionaryUtils';

export const BlackBookModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { blackBookEntries, removeFromBlackBook, updateBlackBookEntry } = useGuild();
    const { words, removeWord, addWord, updateWord } = useDictionary();
    const { settings } = useSettings();
    const t = translations[settings.language];

    // 'blackbook' or 'grimoire'
    const [activeTab, setActiveTab] = useState<'grimoire' | 'blackbook'>('grimoire');

    // Manual Add Form State
    const [isAdding, setIsAdding] = useState(false);

    // Unified Form State (for both adding and editing)
    const [formData, setFormData] = useState({
        word: '',
        context: '',
        notes: '',
        tags: ''
    });

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filtering State
    const [activeFilter, setActiveFilter] = useState<string>('ALL');

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Compute unique tags for filter dropdown
    const uniqueTags = useMemo(() => {
        const allTags = words.flatMap(w => w.tags || []);
        return Array.from(new Set(allTags)).sort();
    }, [words]);

    const filteredWords = useMemo(() => {
        if (activeFilter === 'ALL') return words;
        return words.filter(w => w.tags?.includes(activeFilter));
    }, [words, activeFilter]);

    // --- Dictionary Links Helper ---
    // Already imported from utils/dictionaryUtils

    // --- Actions ---

    const startAdding = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({ word: '', context: '', notes: '', tags: '' });
    };

    const startEditing = (entry: WordEntry) => {
        setEditingId(entry.id);
        setIsAdding(false);
        setFormData({
            word: entry.word,
            context: entry.context,
            notes: entry.notes,
            tags: entry.tags ? entry.tags.join(', ') : ''
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ word: '', context: '', notes: '', tags: '' });
    };

    const handleSave = () => {
        if (!formData.word.trim()) return;

        const cleanTags = formData.tags.split(',').map(s => s.trim()).filter(Boolean);

        if (editingId) {
            // Update existing
            updateWord(editingId, {
                word: formData.word.trim(),
                context: formData.context.trim(),
                notes: formData.notes.trim(),
                tags: cleanTags
            });
        } else {
            // Create new
            addWord({
                id: generateId(),
                word: formData.word.trim(),
                context: formData.context.trim(),
                notes: formData.notes.trim(),
                tags: cleanTags,
                timestamp: Date.now()
            });
        }
        handleCancel();
    };

    const renderWordForm = (title: string, btnLabel: string) => (
        <div className="bg-white/40 p-6 rounded-lg border border-[#2c1810]/20 animate-in slide-in-from-bottom-5">
            <h3 className="font-fantasy font-bold text-xl mb-4 text-[#8a1c1c]">{title}</h3>

            {/* External Dictionaries Toolbar */}
            {formData.word && (
                <div className="mb-4 bg-[#f3e5ab] p-2 rounded border border-[#2c1810]/10">
                    <p className="text-[10px] font-bold text-[#2c1810] mb-1 uppercase tracking-wider">{t.externalDictionaries}</p>
                    <div className="flex gap-3 flex-wrap">
                        <a href={getDwdsLink(formData.word)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">DWDS</a>
                        <span className="text-gray-400 text-xs">|</span>
                        <a href={getPonsLink(formData.word, settings.language)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">PONS</a>
                        <span className="text-gray-400 text-xs">|</span>
                        <a href={getLeoLink(formData.word, settings.language)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">LEO</a>
                        <span className="text-gray-400 text-xs">|</span>
                        <a href={getGodicLink(formData.word)} target="_blank" rel="noreferrer" className="text-blue-800 underline text-xs font-bold hover:text-blue-600">德語助手</a>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-[#2c1810] mb-1">{t.wordLabel}</label>
                    <input
                        className="w-full p-2 bg-white border-2 border-[#2c1810] rounded font-serif font-bold text-lg text-[#2c1810] focus:outline-none focus:ring-2 focus:ring-[#8a1c1c]"
                        value={formData.word}
                        onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                        placeholder={t.wordPlaceholder}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-[#2c1810] mb-1">{t.context}</label>
                    <input
                        className="w-full p-2 bg-white/60 border border-[#2c1810]/30 rounded italic"
                        value={formData.context}
                        onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                        placeholder={t.contextPlaceholder}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-[#2c1810] mb-1">{t.notes}</label>
                    <textarea
                        className="w-full p-2 bg-white border border-[#2c1810]/50 text-[#2c1810] rounded text-sm h-24 focus:outline-none focus:ring-1 focus:ring-[#8a1c1c]"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t.notesPlaceholder}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-[#2c1810] mb-1">{t.tags}</label>
                    <input
                        className="w-full p-2 bg-white border border-[#2c1810]/50 text-[#2c1810] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8a1c1c]"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder={t.tagsPlaceholder}
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <FantasyButton
                    className="flex-1 py-1 text-sm"
                    variant="secondary"
                    onClick={handleCancel}
                >
                    {t.cancel}
                </FantasyButton>
                <FantasyButton
                    className="flex-1 py-1 text-sm"
                    onClick={handleSave}
                    disabled={!formData.word.trim()}
                >
                    {btnLabel}
                </FantasyButton>
            </div>
        </div>
    );

    const renderGrimoire = () => (
        <div className="space-y-4">
            {!isAdding && !editingId && (
                <div className="flex flex-col gap-4">
                    {/* Action Bar: Add & Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[#2c1810]/10 items-center">
                        <button
                            onClick={startAdding}
                            className="flex-shrink-0 px-3 py-1 bg-[#2c1810] text-[#f3e5ab] rounded text-sm font-bold flex items-center gap-1 hover:bg-black"
                        >
                            <span>+</span> {t.addToGrimoire}
                        </button>
                        <div className="w-[1px] h-6 bg-[#2c1810]/20 mx-1"></div>
                        <button
                            onClick={() => setActiveFilter('ALL')}
                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase border ${activeFilter === 'ALL' ? 'bg-[#8a1c1c] text-[#f3e5ab] border-[#8a1c1c]' : 'bg-transparent text-[#2c1810] border-[#2c1810]/30 hover:bg-[#2c1810]/5'}`}
                        >
                            ALL
                        </button>
                        {uniqueTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveFilter(tag)}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase border ${activeFilter === tag ? 'bg-[#8a1c1c] text-[#f3e5ab] border-[#8a1c1c]' : 'bg-transparent text-[#2c1810] border-[#2c1810]/30 hover:bg-[#2c1810]/5'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isAdding ? (
                renderWordForm(t.addToGrimoire, t.saveToGrimoire)
            ) : editingId ? (
                renderWordForm(t.addToGrimoire, t.saveToGrimoire)
            ) : (
                <>
                    {words.length === 0 && (
                        <p className="text-center italic opacity-50 mt-10">{t.emptyGrimoire}</p>
                    )}
                    {filteredWords.map(entry => (
                        <div key={entry.id} className="p-4 bg-white/40 border border-[#2c1810]/20 rounded relative group transition hover:bg-white/60">
                            {/* Header: Word & Actions */}
                            <div className="flex justify-between items-start mb-2 pr-6">
                                <h3 className="text-lg font-bold font-fantasy text-[#2c1810]">{entry.word}</h3>
                            </div>

                            {/* Content */}
                            {entry.context && <p className="text-sm italic text-[#2c1810] border-l-2 border-[#8a1c1c] pl-2 mb-2">"{entry.context}"</p>}
                            {entry.notes && <p className="text-xs text-[#2c1810] bg-white/50 p-2 rounded mb-2">{entry.notes}</p>}

                            {/* Tags moved to bottom */}
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap mt-2">
                                    {entry.tags.map((tag, i) => (
                                        <span key={i} className="text-[10px] bg-[#8a1c1c] text-[#f3e5ab] px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                                    ))}
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white/80 rounded shadow-sm">
                                <button
                                    onClick={() => startEditing(entry)}
                                    className="text-blue-800 hover:text-blue-600 p-1"
                                    title="Edit"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </button>
                                <button
                                    onClick={() => removeWord(entry.id)}
                                    className="text-gray-400 hover:text-red-800 p-1"
                                    title={t.delete}
                                >
                                    <Icons.Cross className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );

    const [editingBlackBookId, setEditingBlackBookId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ original: '', correction: '', note: '' });

    const startEditingBlackBook = (entry: any) => {
        setEditingBlackBookId(entry.id);
        setEditForm({
            original: entry.original,
            correction: entry.correction,
            note: entry.note || ''
        });
    };

    const saveBlackBookEdit = () => {
        if (!editingBlackBookId) return;
        updateBlackBookEntry(editingBlackBookId, {
            original: editForm.original,
            correction: editForm.correction,
            note: editForm.note
        });
        setEditingBlackBookId(null);
    };

    const renderBlackBook = () => (
        <div className="space-y-4">
            {blackBookEntries.length === 0 && (
                <p className="text-center italic opacity-50 mt-10">{t.emptyBlackBook}</p>
            )}
            {blackBookEntries.map(entry => (
                <div key={entry.id} className="p-4 bg-black/5 border border-[#2c1810]/20 rounded relative group">
                    {editingBlackBookId === entry.id ? (
                        <div className="space-y-3 animate-in fade-in">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#8a1c1c]">{t.yourAttempt}</label>
                                <textarea
                                    className="w-full p-2 text-sm border border-[#2c1810]/30 rounded bg-white font-serif"
                                    value={editForm.original}
                                    onChange={e => setEditForm(prev => ({ ...prev, original: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-green-800">{t.correctionAdvice}</label>
                                <textarea
                                    className="w-full p-2 text-sm border border-[#2c1810]/30 rounded bg-white font-mono"
                                    value={editForm.correction}
                                    onChange={e => setEditForm(prev => ({ ...prev, correction: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500">{t.note}</label>
                                <input
                                    className="w-full p-2 text-sm border border-[#2c1810]/30 rounded bg-white"
                                    value={editForm.note}
                                    onChange={e => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setEditingBlackBookId(null)} className="px-3 py-1 text-xs font-bold text-[#2c1810] hover:bg-black/5 rounded">{t.cancel}</button>
                                <button onClick={saveBlackBookEdit} className="px-3 py-1 text-xs font-bold text-[#f3e5ab] bg-[#8a1c1c] rounded shadow hover:bg-[#a62424]">{t.saveChanges}</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {entry.original && (
                                <div className="mb-2 bg-[#8a1c1c]/5 p-2 rounded border border-[#8a1c1c]/10">
                                    <span className="text-[10px] uppercase font-bold text-red-800 tracking-widest block mb-1">{t.yourAttempt}</span>
                                    <span className="font-serif italic text-[#2c1810]">{entry.original}</span>
                                </div>
                            )}
                            {entry.correction && (
                                <div className="mb-2">
                                    <span className="text-[10px] uppercase font-bold text-green-800 tracking-widest block mb-1">{t.correctionAdvice}</span>
                                    <span className="font-mono text-xs text-[#2c1810] whitespace-pre-wrap">{entry.correction}</span>
                                </div>
                            )}
                            {entry.note && (
                                <div className="text-xs text-gray-500 italic mt-2 pt-2 border-t border-black/5">
                                    <span className="font-bold">{t.note}:</span> {entry.note}
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 bg-white/80 rounded shadow-sm">
                                <button
                                    onClick={() => startEditingBlackBook(entry)}
                                    className="text-blue-800 hover:text-blue-600 p-1"
                                    title={t.editEntry}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </button>
                                <button
                                    onClick={() => removeFromBlackBook(entry.id)}
                                    className="text-gray-400 hover:text-red-800 p-1"
                                    title={t.delete}
                                >
                                    <Icons.Cross className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ParchmentContainer className="max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b-2 border-[#2c1810] pb-2">
                    <div className="flex gap-4 items-end">
                        <button
                            onClick={() => { setActiveTab('grimoire'); handleCancel(); }}
                            className={`text-2xl md:text-3xl font-fantasy font-bold transition-all text-button ${activeTab === 'grimoire' ? 'text-[#8a1c1c] scale-105' : 'text-[#2c1810]/40 hover:text-[#2c1810]/70'}`}
                        >
                            {t.tabGrimoire}
                        </button>
                        <span className="text-3xl font-fantasy text-[#2c1810]/20"> </span>
                        <button
                            onClick={() => { setActiveTab('blackbook'); handleCancel(); }}
                            className={`text-2xl md:text-3xl font-fantasy font-bold transition-all text-button ${activeTab === 'blackbook' ? 'text-[#8a1c1c] scale-105' : 'text-[#2c1810]/40 hover:text-[#2c1810]/70'}`}
                        >
                            {t.tabBlackBook}
                        </button>
                    </div>
                    <button onClick={onClose} className="text-2xl font-bold hover:text-[#8a1c1c] transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2c1810]/10 text-button">
                        <Icons.Cross className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-6">
                    {activeTab === 'grimoire' ? renderGrimoire() : renderBlackBook()}
                </div>
            </ParchmentContainer>
        </div>
    );
};
