import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, PlayerHonor, HonorType } from '../types';
import { CrownIcon, TrophyIcon, SparklesIcon, PlusIcon, TrashIcon, PencilIcon, UserIcon, CalendarIcon } from './icons/Icons';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { useData } from '../data/DataContext';

// RankedPlayerListItem Component
const RankedPlayerListItem: React.FC<{ player: Player, rank: number, isCurrentUser?: boolean }> = memo(({ player, rank, isCurrentUser }) => {
    return (
        <li
            className={`flex items-center p-3 rounded-lg transition-colors bg-zinc-800/40 border border-transparent ${isCurrentUser ? 'bg-red-500/20 !border-red-500/30' : 'hover:bg-zinc-800/80'}`}
        >
            <div className={`text-center w-10 font-bold text-xl ${rank <= 3 ? 'text-amber-400' : isCurrentUser ? 'text-red-400' : 'text-gray-400'}`}>{rank}</div>
            <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover mx-4 border-2 border-zinc-700" />
            <div className="flex-grow">
                <p className={`font-bold text-lg ${isCurrentUser ? 'text-white' : 'text-gray-200'}`}>{player.name}</p>
                <p className="text-sm text-gray-500">"{player.callsign}"</p>
            </div>
            <div className="text-right">
                <p className={`font-bold text-xl ${isCurrentUser ? 'text-red-300' : 'text-gray-100'}`}>{(player.stats?.xp ?? 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Rank Points</p>
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
                {rank === 1 && <CrownIcon className="w-10 h-10 crown-icon" />}
                <img src={player.avatarUrl} alt={player.name} className="podium-avatar" />
                <p className={`font-bold text-base mt-2 truncate max-w-full px-1 ${rank === 1 ? 'text-amber-300' : 'text-white'}`}>{player.name}</p>
                <p className="text-xs text-zinc-300">{(player.stats?.xp ?? 0).toLocaleString()} RP</p>
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
    const [type, setType] = useState<HonorType>(honor?.type || 'man_of_the_match');
    const [title, setTitle] = useState<string>(honor?.title || '');
    const [date, setDate] = useState<string>(honor?.date || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState<string>(honor?.notes || '');

    const handleSave = () => {
        if (!selectedPlayerId) {
            alert('Please select a player.');
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
            type,
            title: title.trim(),
            date,
            notes: notes.trim(),
        };

        onSave(honorData as any);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={honor?.id ? 'Edit Player Honor' : 'Assign Player Honor (MOTM / MOTMth / MOTYr)'}>
            <div className="space-y-4 text-left">
                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Honor Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setType('man_of_the_match')}
                            className={`p-2.5 rounded-lg border text-center transition-all ${type === 'man_of_the_match' ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-lg shadow-amber-950/50' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            <span className="text-xl block mb-1">🌟</span>
                            <span className="text-xs">Man of Match</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('man_of_the_month')}
                            className={`p-2.5 rounded-lg border text-center transition-all ${type === 'man_of_the_month' ? 'bg-purple-950/80 border-purple-500 text-purple-300 font-bold shadow-lg shadow-purple-950/50' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            <span className="text-xl block mb-1">🏆</span>
                            <span className="text-xs">Man of Month</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('man_of_the_year')}
                            className={`p-2.5 rounded-lg border text-center transition-all ${type === 'man_of_the_year' ? 'bg-amber-900/90 border-amber-400 text-amber-200 font-bold shadow-lg shadow-amber-500/20' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            <span className="text-xl block mb-1">👑</span>
                            <span className="text-xs">Man of Year</span>
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
                        placeholder={type === 'man_of_the_match' ? 'e.g. Operation Nightfall' : type === 'man_of_the_month' ? 'e.g. August 2026' : 'e.g. 2025/2026 Season'}
                    />
                    <Input
                        label="Award Date"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

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
    const [honorFilter, setHonorFilter] = useState<'all' | HonorType>('all');
    const [editingHonor, setEditingHonor] = useState<Partial<PlayerHonor> | null>(null);

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));
    }, [players]);

    const topThree = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    const filteredHonors = useMemo(() => {
        let list = [...honors];
        if (honorFilter !== 'all') {
            list = list.filter(h => h.type === honorFilter);
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

    const getHonorBadge = (type: HonorType) => {
        switch (type) {
            case 'man_of_the_match':
                return { label: 'Man of the Match', badgeBg: 'bg-amber-950/70 border-amber-500/60 text-amber-400', icon: '🌟' };
            case 'man_of_the_month':
                return { label: 'Man of the Month', badgeBg: 'bg-purple-950/70 border-purple-500/60 text-purple-300', icon: '🏆' };
            case 'man_of_the_year':
                return { label: 'Man of the Year', badgeBg: 'bg-gradient-to-r from-amber-600/30 to-amber-900/30 border-amber-400 text-amber-200', icon: '👑' };
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* View Switcher Header */}
            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setViewMode('leaderboard')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'leaderboard' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <CrownIcon className="w-4 h-4" /> RP Standings
                    </button>
                    <button
                        onClick={() => setViewMode('honors')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'honors' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <TrophyIcon className="w-4 h-4" /> Hall of Fame & Honors ({honors.length})
                    </button>
                </div>

                {viewMode === 'honors' && (
                    <div className="flex items-center gap-2">
                        <select
                            value={honorFilter}
                            onChange={e => setHonorFilter(e.target.value as any)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                        >
                            <option value="all">All Honors</option>
                            <option value="man_of_the_match">Man of the Match</option>
                            <option value="man_of_the_month">Man of the Month</option>
                            <option value="man_of_the_year">Man of the Year</option>
                        </select>

                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => setEditingHonor({})}
                                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1"
                            >
                                <PlusIcon className="w-4 h-4" /> Record Honor
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
                    <div className="flex-grow overflow-y-auto p-4">
                        <ul className="space-y-2">
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
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {filteredHonors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredHonors.map(honor => {
                                const badgeInfo = getHonorBadge(honor.type);
                                const playerObj = players.find(p => p.id === honor.playerId);
                                const avatar = honor.playerAvatarUrl || playerObj?.avatarUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${honor.playerId}`;
                                const name = honor.playerName || playerObj?.name || 'Player';
                                const callsign = honor.playerCallsign || playerObj?.callsign || '';

                                return (
                                    <div
                                        key={honor.id}
                                        className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md relative group overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={avatar}
                                                    alt={name}
                                                    className="w-12 h-12 rounded-full border-2 border-amber-500/50 bg-zinc-950 object-cover"
                                                />
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeInfo.badgeBg} mb-1`}>
                                                        <span>{badgeInfo.icon}</span> {badgeInfo.label}
                                                    </span>
                                                    <h3 className="font-bold text-white text-base leading-tight">
                                                        {name} {callsign && <span className="text-amber-400 font-mono text-xs">("{callsign}")</span>}
                                                    </h3>
                                                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                                                        <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                                                        <span className="font-semibold text-zinc-200">{honor.title}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setEditingHonor(honor)}
                                                        className="p-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
                                                        title="Edit Honor"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHonor(honor.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                                                        title="Delete Honor"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {honor.notes && (
                                            <p className="mt-3 text-xs text-zinc-300 italic bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                                                "{honor.notes}"
                                            </p>
                                        )}

                                        <div className="mt-3 pt-2 border-t border-zinc-800/60 flex justify-between items-center text-[11px] text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" /> Awarded: {honor.date}
                                            </span>
                                            <span className="font-mono text-amber-500/80 uppercase tracking-widest text-[10px]">Official Record</span>
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
