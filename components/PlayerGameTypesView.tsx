import React, { useState, useMemo, useRef } from 'react';
import type { GameType } from '../types';
import { useData } from '../data/DataContext';
import {
  CrosshairsIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ClockIcon,
  TrophyIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  XIcon,
  SparklesIcon
} from './icons/Icons';
import { Search, Volume2, BookOpen, Layers, Target, CheckCircle2, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'CQB', 'Milsim', 'Speedsoft', 'Casual Skirmish', 'Night Ops', 'Tournament', 'Scenario'];

export const PlayerGameTypesView: React.FC = () => {
  const { gameTypes, tacticalRules } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);

  // Audio briefing playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredGameTypes = useMemo(() => {
    if (!gameTypes) return [];
    return gameTypes.filter((gt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        gt.name.toLowerCase().includes(q) ||
        (gt.description && gt.description.toLowerCase().includes(q)) ||
        (gt.gameplayMechanics && gt.gameplayMechanics.toLowerCase().includes(q)) ||
        (gt.category && gt.category.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'All' || gt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [gameTypes, searchQuery, selectedCategory]);

  const handleToggleAudio = (audioUrl: string, id: string) => {
    if (playingAudioId === id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(e => console.warn('Audio play error:', e));
      setPlayingAudioId(id);
      audio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'CQB':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Milsim':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Speedsoft':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Night Ops':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Tournament':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-red-400 mb-1">
              <CrosshairsIcon className="w-4 h-4" />
              <span>Tactical Operations Manual</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Mission & Game Modes
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Explore official skirmish formats, objective rules, scoring mechanics, and audio tactical briefings used across Bosjol Airsoft operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-red-400" />
              <div className="text-left">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Catalog</div>
                <div className="text-sm font-black font-mono text-white">{gameTypes?.length || 0} Modes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modes, mechanics, objectives..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Types Grid */}
      {filteredGameTypes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
          <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">No Game Modes Found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try changing your search query or filter to view other game modes.'
              : 'No game modes are currently available. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGameTypes.map((gt) => {
            const hasAudio = Boolean(gt.audioBriefingUrl);
            const isPlayingThis = playingAudioId === gt.id;

            return (
              <motion.div
                key={gt.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900/95 hover:border-red-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Header Media / Poster Background */}
                <div className="relative h-44 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/60">
                  {gt.imageUrl ? (
                    <img
                      src={gt.imageUrl}
                      alt={gt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-zinc-700">
                      <CrosshairsIcon className="w-16 h-16 opacity-30 group-hover:scale-110 group-hover:text-red-500/40 transition-all duration-500" />
                    </div>
                  )}

                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Category Chip */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest border backdrop-blur-md ${getCategoryBadgeClass(gt.category)}`}>
                      {gt.category || 'Scenario'}
                    </span>
                  </div>

                  {/* XP & Duration Pills */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    {gt.participationXp ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
                        <TrophyIcon className="w-3 h-3" />
                        +{gt.participationXp} RP
                      </span>
                    ) : null}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight drop-shadow-md truncate">
                      {gt.name}
                    </h3>
                    {gt.gameDurationMinutes ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 mt-0.5">
                        <ClockIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Approx. {gt.gameDurationMinutes} Minutes</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                    {gt.description || gt.gameplayMechanics || 'No mission briefing description available.'}
                  </p>

                  {/* Quick features indicator */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                    {gt.rules && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">Defined Victory & Respawn Rules</span>
                      </div>
                    )}
                    {gt.rulesFileUrl && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Attached Tactical PDF / Doc</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  {hasAudio && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAudio(gt.audioBriefingUrl!, gt.id);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                        isPlayingThis
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/50 animate-pulse'
                          : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:text-white'
                      }`}
                      title={isPlayingThis ? 'Pause Audio Briefing' : 'Play Audio Briefing'}
                    >
                      {isPlayingThis ? <PauseIcon className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedGameType(gt)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-red-950/40 border border-red-500/30"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View Full Briefing</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Detailed Game Type Modal */}
      <AnimatePresence>
        {selectedGameType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGameType(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-[120] overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Banner Header */}
              <div className="relative h-48 sm:h-64 w-full bg-zinc-900 shrink-0 border-b border-zinc-800">
                {selectedGameType.imageUrl ? (
                  <img
                    src={selectedGameType.imageUrl}
                    alt={selectedGameType.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                    <CrosshairsIcon className="w-20 h-20 text-zinc-700 opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                <button
                  onClick={() => setSelectedGameType(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-zinc-400 hover:text-white border border-white/10 transition-colors z-20"
                >
                  <XIcon className="w-5 h-5" />
                </button>

                {/* Badges & Meta */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border mb-2 backdrop-blur-md ${getCategoryBadgeClass(selectedGameType.category)}`}>
                      {selectedGameType.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-lg">
                      {selectedGameType.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedGameType.participationXp ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
                        <TrophyIcon className="w-3.5 h-3.5" />
                        +{selectedGameType.participationXp} RP
                      </span>
                    ) : null}
                    {selectedGameType.gameDurationMinutes ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-900/80 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 backdrop-blur-md">
                        <ClockIcon className="w-3.5 h-3.5 text-zinc-400" />
                        {selectedGameType.gameDurationMinutes}m
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-300">
                {/* Audio Briefing Player */}
                {selectedGameType.audioBriefingUrl && (
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-600/20 text-red-400">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">Audio Tactical Briefing</div>
                        <div className="text-[11px] text-zinc-400 font-mono">Official game master voice recording</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAudio(selectedGameType.audioBriefingUrl!, selectedGameType.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-red-950/50"
                    >
                      {playingAudioId === selectedGameType.id ? (
                        <>
                          <PauseIcon className="w-4 h-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Overview Description */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                    <InformationCircleIcon className="w-4 h-4" />
                    <span>Mission Overview</span>
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 whitespace-pre-line">
                    {selectedGameType.description || 'No general description provided for this mode.'}
                  </p>
                </div>

                {/* Gameplay Mechanics */}
                {selectedGameType.gameplayMechanics && (
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>Mechanics & Win Conditions</span>
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 whitespace-pre-line">
                      {selectedGameType.gameplayMechanics}
                    </p>
                  </div>
                )}

                {/* Rules & Protocol */}
                {selectedGameType.rules && (
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span>Field Rules & Respawn Protocol</span>
                    </h4>
                    <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                      {selectedGameType.rules
                        .split('\n')
                        .map(line => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="text-red-500 font-bold mt-0.5">•</span>
                            <span className="leading-relaxed">{line.replace(/^[•\-\*]\s*/, '')}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Attached Document / PDF */}
                {selectedGameType.rulesFileUrl && (
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Mission Document / Briefing Material</span>
                    </h4>
                    <a
                      href={selectedGameType.rulesFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-zinc-200 hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider truncate">Open Mission Document</span>
                      </div>
                      <Download className="w-4 h-4 text-zinc-400 group-hover:text-white shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedGameType(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Close Briefing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
