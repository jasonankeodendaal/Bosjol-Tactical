import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../types';
import { CrownIcon } from './icons/Icons';

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
                <p className={`font-bold text-xl ${isCurrentUser ? 'text-red-300' : 'text-gray-100'}`}>{player.stats.xp.toLocaleString()}</p>
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
                <p className="text-xs text-zinc-300">{player.stats.xp.toLocaleString()} RP</p>
            </div>
            <div className="podium-base">
                {rank}
            </div>
        </motion.div>
    );
};


// Main Leaderboard Component
export const Leaderboard: React.FC<{ players: Player[], currentPlayerId?: string }> = ({ players, currentPlayerId }) => {
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => b.stats.xp - a.stats.xp);
    }, [players]);

    const topThree = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    return (
        <div className="flex flex-col h-full">
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
        </div>
    );
};