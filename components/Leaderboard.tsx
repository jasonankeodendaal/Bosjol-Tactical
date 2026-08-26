import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, PlayerHonor, HonorType } from '../types';
import { CrownIcon, TrophyIcon, SparklesIcon, PlusIcon, TrashIcon, PencilIcon, UserIcon, CalendarIcon, PhotoIcon } from './icons/Icons';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { useData } from '../data/DataContext';

// RankedPlayerListItem Component
const RankedPlayerListItem: React.FC<{ player: Player, rank: number, isCurrentUser?: boolean }> = memo(({ player, rank, isCurrentUser }) => {
    return (
        <li
            className={`flex items-center p-1.5 sm:p-3 rounded-lg transition-colors bg-zinc-800/40 border border-transparent ${isCurrentUser ? 'bg-red-500/20 !border-red-500/30' : 'hover:bg-zinc-800/80'}`}
        >
            <div className={`text-center w-5 sm:w-10 font-bold text-xs sm:text-xl ${rank <= 3 ? 'text-amber-400' : isCurrentUser ? 'text-red-400' : 'text-gray-400'}`}>{rank}</div>
            <img src={player.avatarUrl} alt={player.name} className="w-7 h-7 sm:w-12 sm:h-12 rounded-full object-cover mx-1.5 sm:mx-4 border-2 border-zinc-700 flex-shrink-0" />
            <div className="flex-grow min-w-0">
                <p className={`font-bold text-xs sm:text-lg truncate ${isCurrentUser ? 'text-white' : 'text-gray-200'}`}>{player.name}</p>
                <p className="text-[9px] sm:text-sm text-gray-500 truncate">"{player.callsign}"</p>
            </div>
            <div className="text-right flex-shrink-0 ml-1">
                <p className={`font-bold text-xs sm:text-xl ${isCurrentUser ? 'text-red-300' : 'text-gray-100'}`}>{(player.stats?.xp ?? 0).toLocaleString()}</p>
                <p className="text-[8px] sm:text-xs text-gray-500">Rank Points</p>
            </div>
        </li>
    );
});

// PodiumPlayer Component
const PodiumPlayer: React.FC<{ player: Player, rank: 1 | 2 | 3, delay: number }> = ({ player, rank, delay }) => {
    const podiumClass = `podium-${rank}`;
    const animationVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
    };

    return (
        <motion.div className={`podium-item ${podiumClass}`} variants={animationVariants}>
            <div className="podium-avatar-wrapper">
                {rank === 1 && <CrownIcon className="w-5 h-5 sm:w-10 sm:h-10 crown-icon" />}
                <img src={player.avatarUrl} alt={player.name} className="podium-avatar" />
                <p className={`font-bold text-[10px] sm:text-base mt-1 sm:mt-2 truncate max-w-full px-0.5 sm:px-1 ${rank === 1 ? 'text-amber-300' : 'text-white'}`}>{player.name}</p>
                <p className="text-[9px] sm:text-xs text-zinc-300">{(player.stats?.xp ?? 0).toLocaleString()} RP</p>
            </div>
            <div className="podium-base">
                {rank}
            </div>
        </motion.div>
    );
};

// Admin Add / Edit Honor Modal
const AdminHonorModal: React.FC<{
    honor: Partial<PlayerHonor> | null;
    players: Player[];
    onClose: () => void;
    onSave: (honor: PlayerHonor | Omit<PlayerHonor, 'id'>) => void;
}> = ({ honor, players, onClose, onSave }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(honor?.playerId || players[0]?.id || '');
    const [type, setType] = useState<string>(honor?.type || 'Man of Match');
    const [title, setTitle] = useState<string>(honor?.title || '');
    const [badgeImageUrl, setBadgeImageUrl] = useState<string>(honor?.badgeImageUrl || '');
    const [date, setDate] = useState<string>(honor?.date || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState<string>(honor?.notes || '');

    const handleSave = () => {
        if (!selectedPlayerId) {
            alert('Please select a player.');
            return;
        }
        if (!type.trim()) {
            alert('Please enter an honor category (e.g. Man of Match, Man of Month, Man of Year).');
            return;
        }
        if (!title.trim()) {
            alert('Please enter a title or event/season name (e.g. Operation Nightfall or August 2026).');
            return;
        }

        const targetPlayer = players.find(p => p.id === selectedPlayerId);

        const honorData = {
            ...honor,
            playerId: selectedPlayerId,
            playerName: targetPlayer ? `${targetPlayer.name} ${targetPlayer.surname || ''}`.trim() : 'Unknown Player',
            playerCallsign: targetPlayer?.callsign || '',
            playerAvatarUrl: targetPlayer?.avatarUrl || '',
            type: type.trim(),
            title: title.trim(),
            badgeImageUrl: badgeImageUrl.trim() || undefined,
            date,
            notes: notes.trim(),
        };

        onSave(honorData as any);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={honor?.id ? 'Edit Player Honor' : 'Assign Player Honor'}>
            <div className="space-y-4 text-left">
                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Honor Category (Manual Text Entry)
                    </label>
                    <Input
                        value={type}
                        onChange={e => setType(e.target.value)}
                        placeholder="e.g. Man of Match, Man of Month, Man of Year"
                        className="mb-2"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-zinc-500 font-medium mr-1">Quick Select:</span>
                        <button
                            type="button"
                            onClick={() => setType('Man of Match')}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${type.toLowerCase().includes('match') ? 'bg-amber-950/90 border-amber-500 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            🌟 Man of Match
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('Man of Month')}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${type.toLowerCase().includes('month') ? 'bg-purple-950/90 border-purple-500 text-purple-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            🏆 Man of Month
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('Man of Year')}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${type.toLowerCase().includes('year') ? 'bg-amber-900/90 border-amber-400 text-amber-200' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            👑 Man of Year
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Select Player
                    </label>
                    <select
                        value={selectedPlayerId}
                        onChange={e => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                        {players.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.playerCode ? `[${p.playerCode}] ` : ''}{p.name} {p.surname || ''} {p.callsign ? `("${p.callsign}")` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Event / Period Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={type.toLowerCase().includes('match') ? 'e.g. Operation Nightfall' : type.toLowerCase().includes('month') ? 'e.g. August 2026' : 'e.g. 2025/2026 Season'}
                    />
                    <Input
                        label="Award Date"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <UrlOrUploadField
                    label="Badge Image (JPG / PNG Custom Upload)"
                    fileUrl={badgeImageUrl}
                    onUrlSet={setBadgeImageUrl}
                    onRemove={() => setBadgeImageUrl('')}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                />

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Performance Notes / Citation (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. Outstanding squad leadership and clutch defense."
                    />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3">
                <Button variant="secondary" onClick={onClose} className="w-1/2">
                    Cancel
                </Button>
                <Button onClick={handleSave} className="w-1/2 font-bold bg-amber-600 hover:bg-amber-500">
                    {honor?.id ? 'Update Honor' : 'Award Honor'}
                </Button>
            </div>
        </Modal>
    );
};

// Main Leaderboard Component
export const Leaderboard: React.FC<{ players: Player[], currentPlayerId?: string, isAdmin?: boolean }> = ({ players, currentPlayerId, isAdmin }) => {
    const dataContext = useData();
    const honors = dataContext?.honors || [];
    const [viewMode, setViewMode] = useState<'leaderboard' | 'honors'>('leaderboard');
    const [honorFilter, setHonorFilter] = useState<string>('all');
    const [editingHonor, setEditingHonor] = useState<Partial<PlayerHonor> | null>(null);

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));
    }, [players]);

    const topThree = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        honors.forEach(h => {
            if (h.type && h.type.trim()) set.add(h.type.trim());
        });
        return Array.from(set);
    }, [honors]);

    const filteredHonors = useMemo(() => {
        let list = [...honors];
        if (honorFilter !== 'all') {
            const filterNorm = honorFilter.toLowerCase().trim();
            list = list.filter(h => {
                const typeNorm = (h.type || '').toLowerCase().trim();
                if (filterNorm === 'match') return typeNorm.includes('match') || typeNorm === 'man_of_the_match';
                if (filterNorm === 'month') return typeNorm.includes('month') || typeNorm === 'man_of_the_month';
                if (filterNorm === 'year') return typeNorm.includes('year') || typeNorm === 'man_of_the_year';
                return typeNorm === filterNorm;
            });
        }
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [honors, honorFilter]);

    const handleSaveHonor = async (honorData: PlayerHonor | Omit<PlayerHonor, 'id'>) => {
        setEditingHonor(null);
        if ('id' in honorData && honorData.id) {
            await dataContext.updateDoc('honors', honorData);
        } else {
            await dataContext.addDoc('honors', honorData);
        }
    };

    const handleDeleteHonor = async (honorId: string) => {
        if (confirm('Are you sure you want to remove this honor record?')) {
            await dataContext.deleteDoc('honors', honorId);
        }
    };

    const getHonorBadge = (type: string = '') => {
        const normalized = type.toLowerCase().replace(/[_\-\s]+/g, ' ').trim();
        if (normalized.includes('match') || normalized === 'man of match') {
            return { label: type || 'Man of Match', badgeBg: 'bg-amber-950/70 border-amber-500/60 text-amber-400', icon: '🌟' };
        }
        if (normalized.includes('month') || normalized === 'man of month') {
            return { label: type || 'Man of Month', badgeBg: 'bg-purple-950/70 border-purple-500/60 text-purple-300', icon: '🏆' };
        }
        if (normalized.includes('year') || normalized === 'man of year') {
            return { label: type || 'Man of Year', badgeBg: 'bg-gradient-to-r from-amber-600/30 to-amber-900/30 border-amber-400 text-amber-200', icon: '👑' };
        }
        return { label: type || 'Honor', badgeBg: 'bg-zinc-800 border-amber-500/50 text-amber-300', icon: '🎖️' };
    };

    return (
        <div className="flex flex-col h-full">
            {/* View Switcher Header */}
            <div className="p-2 sm:p-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setViewMode('leaderboard')}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'leaderboard' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <CrownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> RP Standings
                    </button>
                    <button
                        onClick={() => setViewMode('honors')}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'honors' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Hall of Fame ({honors.length})
                    </button>
                </div>

                {viewMode === 'honors' && (
                    <div className="flex items-center gap-1.5">
                        <select
                            value={honorFilter}
                            onChange={e => setHonorFilter(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs text-white focus:outline-none"
                        >
                            <option value="all">All Honors</option>
                            <option value="match">Man of Match</option>
                            <option value="month">Man of Month</option>
                            <option value="year">Man of Year</option>
                            {availableCategories.filter(c => !['match', 'month', 'year', 'man of match', 'man of month', 'man of year', 'man_of_the_match', 'man_of_the_month', 'man_of_the_year'].includes(c.toLowerCase())).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => setEditingHonor({})}
                                className="bg-amber-600 hover:bg-amber-500 text-white !px-2 !py-0.5 text-[10px] sm:text-xs font-bold flex items-center gap-1"
                            >
                                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Record Honor
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {viewMode === 'leaderboard' ? (
                <>
                    <div className="leaderboard-podium-bg">
                        <motion.div
                            className="podium-container"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        >
                            {topThree.length > 1 && <PodiumPlayer player={topThree[1]} rank={2} delay={0.1} />}
                            {topThree.length > 0 && <PodiumPlayer player={topThree[0]} rank={1} delay={0} />}
                            {topThree.length > 2 && <PodiumPlayer player={topThree[2]} rank={3} delay={0.2} />}
                        </motion.div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-1.5 sm:p-4">
                        <ul className="space-y-1 sm:space-y-2">
                            {rest.map((player, index) => (
                                <RankedPlayerListItem
                                    key={player.id}
                                    player={player}
                                    rank={index + 4}
                                    isCurrentUser={player.id === currentPlayerId}
                                />
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <div className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-3">
                    {filteredHonors.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-1.5 sm:gap-3">
                            {filteredHonors.map(honor => {
                                const badgeInfo = getHonorBadge(honor.type);
                                const playerObj = players.find(p => p.id === honor.playerId);
                                const avatar = honor.playerAvatarUrl || playerObj?.avatarUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${honor.playerId}`;
                                const name = honor.playerName || playerObj?.name || 'Player';
                                const callsign = honor.playerCallsign || playerObj?.callsign || '';

                                return (
                                    <div
                                        key={honor.id}
                                        className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2 sm:p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md relative group overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between gap-1 sm:gap-3">
                                            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                                                <img
                                                    src={avatar}
                                                    alt={name}
                                                    className="w-7 h-7 sm:w-12 sm:h-12 rounded-full border border-amber-500/50 bg-zinc-950 object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badgeInfo.badgeBg} mb-0.5 truncate max-w-full`}>
                                                        {honor.badgeImageUrl ? (
                                                            <img src={honor.badgeImageUrl} alt={badgeInfo.label} className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded-full inline-block flex-shrink-0" />
                                                        ) : (
                                                            <span>{badgeInfo.icon}</span>
                                                        )}
                                                        <span className="truncate">{badgeInfo.label}</span>
                                                    </span>
                                                    <h3 className="font-bold text-white text-xs sm:text-base leading-tight truncate">
                                                        {name}
                                                    </h3>
                                                    {callsign && <p className="text-amber-400 font-mono text-[9px] sm:text-xs truncate">"{callsign}"</p>}
                                                    <p className="text-[9px] sm:text-xs text-zinc-400 flex items-center gap-0.5 mt-0.5 truncate">
                                                        <SparklesIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
                                                        <span className="font-semibold text-zinc-200 truncate">{honor.title}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                                    <button
                                                        onClick={() => setEditingHonor(honor)}
                                                        className="p-1 text-zinc-400 hover:text-amber-400 transition-colors"
                                                        title="Edit Honor"
                                                    >
                                                        <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHonor(honor.id)}
                                                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                                                        title="Delete Honor"
                                                    >
                                                        <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {honor.notes && (
                                            <p className="mt-1.5 sm:mt-3 text-[9px] sm:text-xs text-zinc-300 italic bg-zinc-950/60 p-1.5 sm:p-2.5 rounded-lg border border-zinc-800/80 line-clamp-2">
                                                "{honor.notes}"
                                            </p>
                                        )}

                                        <div className="mt-1.5 sm:mt-3 pt-1 sm:pt-2 border-t border-zinc-800/60 flex justify-between items-center text-[8px] sm:text-[11px] text-zinc-500">
                                            <span className="flex items-center gap-0.5 truncate">
                                                <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" /> {honor.date}
                                            </span>
                                            <span className="font-mono text-amber-500/80 uppercase tracking-widest text-[7px] sm:text-[10px] hidden sm:inline">Official</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                            <TrophyIcon className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                            <p className="text-zinc-400 font-semibold text-sm">No honors recorded yet for this filter.</p>
                            {isAdmin && (
                                <p className="text-xs text-amber-400 mt-1">Click "Record Honor" above to award Man of the Match, Month, or Year.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {editingHonor && (
                <AdminHonorModal
                    honor={editingHonor}
                    players={players}
                    onClose={() => setEditingHonor(null)}
                    onSave={handleSaveHonor}
                />
            )}
        </div>
    );
};
