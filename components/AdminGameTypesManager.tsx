import React, { useState, useRef } from 'react';
import type { GameType } from '../types';
import { useData } from '../data/DataContext';
import { DEFAULT_TACTICAL_RULE_SETS } from '../constants';
import { UrlOrUploadField } from './UrlOrUploadField';
import { Button } from './Button';
import { DashboardCard } from './DashboardCard';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  MicrophoneIcon
} from './icons/Icons';

const CATEGORIES = ['CQB', 'Milsim', 'Speedsoft', 'Casual Skirmish', 'Night Ops', 'Tournament', 'Scenario'];
const THEMES = [
  { id: 'red_vs_blue', name: 'Red vs Blue Split' },
  { id: 'toxic_juggernaut', name: 'Toxic Juggernaut' },
  { id: 'crimson_warfare', name: 'Crimson Warfare' },
  { id: 'cyber_cobalt', name: 'Cyber Cobalt' },
  { id: 'standard', name: 'Standard Tactical' }
];

export const AdminGameTypesManager: React.FC = () => {
  const { gameTypes, addDoc, updateDoc, deleteDoc } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingGameType, setEditingGameType] = useState<Partial<GameType> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewingGameType, setPreviewingGameType] = useState<GameType | null>(null);

  // Audio Recording State for Briefings
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  // Playing audio preview
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredGameTypes = gameTypes.filter((gt) => {
    const matchesSearch =
      gt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gt.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || gt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setEditingGameType({
      name: '',
      category: 'Scenario',
      description: '',
      gameplayMechanics: '',
      rules: '',
      imageUrl: '',
      audioBriefingUrl: '',
      theme: 'red_vs_blue',
      participationXp: 75,
      gameDurationMinutes: 45,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (gt: GameType) => {
    setEditingGameType({ ...gt });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (gt: GameType) => {
    const duplicated: Omit<GameType, 'id'> = {
      ...gt,
      name: `${gt.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    await addDoc('gameTypes', duplicated);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the game type "${name}"? Events using this template will retain their settings.`)) {
      await deleteDoc('gameTypes', id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGameType || !editingGameType.name?.trim()) {
      alert('Please enter a valid Game Type Name.');
      return;
    }

    const payload = {
      name: editingGameType.name.trim(),
      category: editingGameType.category || 'Scenario',
      description: editingGameType.description || '',
      gameplayMechanics: editingGameType.gameplayMechanics || '',
      rules: editingGameType.rules || '',
      rulesFileUrl: editingGameType.rulesFileUrl || undefined,
      imageUrl: editingGameType.imageUrl || '',
      audioBriefingUrl: editingGameType.audioBriefingUrl || '',
      theme: editingGameType.theme || 'red_vs_blue',
      participationXp: Number(editingGameType.participationXp) || 50,
      gameDurationMinutes: Number(editingGameType.gameDurationMinutes) || 45,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (editingGameType.id) {
      await updateDoc('gameTypes', { ...payload, id: editingGameType.id } as GameType);
    } else {
      await addDoc('gameTypes', { ...payload, createdAt: new Date().toISOString().split('T')[0] });
    }

    setIsModalOpen(false);
    setEditingGameType(null);
  };

  // Recording Logic
  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleStartRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setEditingGameType((prev) => ({ ...prev, audioBriefingUrl: base64data }));
        };
        stopRecordingCleanup();
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setAudioError('Microphone access denied or unavailable.');
      stopRecordingCleanup();
    }
  };

  const toggleAudioPlayback = (url: string) => {
    if (playingAudioUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(url);
      audioRef.current = newAudio;
      newAudio.play();
      setPlayingAudioUrl(url);
      newAudio.onended = () => setPlayingAudioUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
                <SparklesIcon className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-wider uppercase">
                Game Types & Scenario Builder
              </h1>
            </div>
            <p className="text-sm text-gray-400 max-w-2xl">
              Pre-create and fully customize tactical game modes. Admins can select these pre-built templates when creating events to auto-populate artwork, rules, briefings, fees, and gameplay mechanics.
            </p>
          </div>
          <Button onClick={handleCreateNew} variant="primary" size="md" className="flex items-center gap-2 shadow-lg shadow-red-900/40">
            <PlusIcon className="w-5 h-5" />
            <span>Build New Game Type</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search game modes, rules, lore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-800/80 text-gray-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              All ({gameTypes.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = gameTypes.filter((g) => g.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-zinc-800/80 text-gray-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Types Grid */}
      {filteredGameTypes.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-12 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white mb-1">No Game Types Found</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'No templates match your current filter. Try adjusting your search query or category.'
              : 'You have not built any game types yet. Create your first pre-built scenario template!'}
          </p>
          <Button onClick={handleCreateNew} variant="primary" size="sm">
            Create First Game Type
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGameTypes.map((gt) => (
            <div
              key={gt.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl hover:border-zinc-700 transition-all group flex flex-col"
            >
              {/* Card Media Header */}
              <div className="relative h-48 bg-zinc-950 overflow-hidden">
                {gt.imageUrl ? (
                  <img
                    src={gt.imageUrl}
                    alt={gt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-700">
                    <ShieldCheckIcon className="w-16 h-16 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>

                {/* Category & XP Pills */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 bg-red-600/90 text-white font-bold text-[10px] uppercase tracking-wider rounded-md backdrop-blur-md shadow-lg border border-red-500/50">
                    {gt.category}
                  </span>
                  <span className="px-2.5 py-1 bg-zinc-950/80 text-yellow-400 font-bold text-[10px] uppercase tracking-wider rounded-md border border-yellow-500/30 flex items-center gap-1">
                    <TrophyIcon className="w-3 h-3" />
                    +{gt.participationXp} XP
                  </span>
                </div>

                {/* Audio Briefing Pill */}
                {gt.audioBriefingUrl && (
                  <button
                    onClick={() => toggleAudioPlayback(gt.audioBriefingUrl!)}
                    className="absolute bottom-3 right-3 px-2.5 py-1 bg-zinc-950/80 hover:bg-red-600 text-white text-xs rounded-md border border-zinc-700 flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    {playingAudioUrl === gt.audioBriefingUrl ? (
                      <>
                        <PauseIcon className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-bold">PAUSE</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-bold">BRIEFING</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide uppercase group-hover:text-red-400 transition-colors">
                    {gt.name}
                  </h2>
                  <p className="text-xs text-gray-400 line-clamp-3 mt-1.5 leading-relaxed">
                    {gt.description || 'No overview provided for this game mode.'}
                  </p>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <ClockIcon className="w-3.5 h-3.5 text-red-400" />
                    <span>{gt.gameDurationMinutes || 45} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <TrophyIcon className="w-3.5 h-3.5 text-yellow-400" />
                    <span>+{gt.participationXp} XP</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewingGameType(gt)}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <InformationCircleIcon className="w-4 h-4 text-red-400" />
                    <span>View Lore</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(gt)}
                      title="Duplicate Template"
                      className="p-2 text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(gt)}
                      title="Edit Game Type"
                      className="p-2 text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gt.id, gt.name)}
                      title="Delete Game Type"
                      className="p-2 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Lore / Details Modal */}
      {previewingGameType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase rounded-md">
                  {previewingGameType.category}
                </span>
                <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                  {previewingGameType.name}
                </h2>
              </div>
              <button
                onClick={() => setPreviewingGameType(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {previewingGameType.imageUrl && (
              <img
                src={previewingGameType.imageUrl}
                alt={previewingGameType.name}
                className="w-full h-56 object-cover rounded-xl border border-zinc-800"
              />
            )}

            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="font-bold text-red-400 text-xs uppercase tracking-wider mb-1">
                  Overview & Mission Lore
                </h4>
                <p className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 leading-relaxed whitespace-pre-wrap">
                  {previewingGameType.description || 'No scenario details.'}
                </p>
              </div>

              {previewingGameType.gameplayMechanics && (
                <div>
                  <h4 className="font-bold text-red-400 text-xs uppercase tracking-wider mb-1">
                    Gameplay Mechanics & Objectives
                  </h4>
                  <p className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 leading-relaxed whitespace-pre-wrap">
                    {previewingGameType.gameplayMechanics}
                  </p>
                </div>
              )}

              {previewingGameType.rules && (
                <div>
                  <h4 className="font-bold text-red-400 text-xs uppercase tracking-wider mb-1">
                    Rules & Safety Restrictions
                  </h4>
                  <p className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 leading-relaxed whitespace-pre-wrap">
                    {previewingGameType.rules}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button onClick={() => setPreviewingGameType(null)} variant="secondary" size="sm">
                Close Lore
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Build Modal */}
      {isModalOpen && editingGameType && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
                  <PencilSquareIcon className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  {editingGameType.id ? 'Edit Game Type Template' : 'Create New Game Type Template'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Game Type Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Capture the Flag, Zombie Juggernaut"
                    value={editingGameType.name || ''}
                    onChange={(e) =>
                      setEditingGameType((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editingGameType.category || 'Scenario'}
                    onChange={(e) =>
                      setEditingGameType((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Theme & Cover Image Artwork */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Poster Theme Preset
                  </label>
                  <select
                    value={editingGameType.theme || 'red_vs_blue'}
                    onChange={(e) =>
                      setEditingGameType((prev) => ({ ...prev, theme: e.target.value }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {THEMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Cover Image Artwork
                  </label>
                  <UrlOrUploadField
                    value={editingGameType.imageUrl || ''}
                    onChange={(url) =>
                      setEditingGameType((prev) => ({ ...prev, imageUrl: url }))
                    }
                    placeholder="Image URL or upload artwork..."
                  />
                </div>
              </div>

              {/* Rules Upload */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Rules Document URL
                  </label>
                  <input
                    type="url"
                    value={editingGameType.rulesFileUrl || ''}
                    onChange={(e) =>
                      setEditingGameType((prev) => ({ ...prev, rulesFileUrl: e.target.value }))
                    }
                    placeholder="Link to PDF or document containing full rules..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Row 3: Audio Briefing Recording */}
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MicrophoneIcon className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Audio Briefing Template
                    </span>
                  </div>
                  {editingGameType.audioBriefingUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingGameType((prev) => ({ ...prev, audioBriefingUrl: '' }))
                      }
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Clear Recording
                    </button>
                  )}
                </div>

                {isRecording ? (
                  <div className="flex items-center justify-between bg-red-950/40 p-3 rounded-lg border border-red-500/40">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                      <span className="text-xs font-bold text-red-200">
                        Recording Briefing ({recordingSeconds}s)...
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => mediaRecorderRef.current?.stop()}
                      variant="danger"
                      size="sm"
                    >
                      Stop & Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleStartRecording}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <MicrophoneIcon className="w-4 h-4 text-red-400" />
                      <span>{editingGameType.audioBriefingUrl ? 'Re-record Briefing' : 'Record Audio Briefing'}</span>
                    </Button>
                    {editingGameType.audioBriefingUrl && (
                      <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Audio attached
                      </span>
                    )}
                  </div>
                )}
                {audioError && <p className="text-xs text-red-400">{audioError}</p>}
              </div>

              {/* Row 4: Overview / Description */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Scenario Lore & Mission Story
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed scenario background, narrative, and objectives..."
                  value={editingGameType.description || ''}
                  onChange={(e) =>
                    setEditingGameType((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Row 5: Gameplay Mechanics */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Gameplay Mechanics & Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="Respawns, medic rules, point scoring, win conditions..."
                  value={editingGameType.gameplayMechanics || ''}
                  onChange={(e) =>
                    setEditingGameType((prev) => ({ ...prev, gameplayMechanics: e.target.value }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Row 6: Rules Setup (1-by-1 Manual Entry or Linked Rules Setup) */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                    <span>Scenario Rules Setup</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Add 1-by-1 or link from Rules Setup
                  </span>
                </div>

                {/* Quick Link from Rules Setup */}
                <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      ⚡ Quick Link from Field Rules Setup:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      onChange={(e) => {
                        const setId = e.target.value;
                        if (!setId) return;
                        const targetSet = DEFAULT_TACTICAL_RULE_SETS.find(s => s.id === setId);
                        if (targetSet) {
                          const formattedRules = targetSet.rules
                            .map(r => `[${targetSet.category}] ${r.name}: ${r.description}`)
                            .join('\n');
                          setEditingGameType(prev => {
                            const existing = prev.rules?.trim() || '';
                            const updated = existing ? `${existing}\n${formattedRules}` : formattedRules;
                            return { ...prev, rules: updated };
                          });
                        }
                        e.target.value = '';
                      }}
                      className="bg-zinc-950 border border-zinc-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                    >
                      <option value="">-- Link Full Rule Set --</option>
                      {DEFAULT_TACTICAL_RULE_SETS.map(set => (
                        <option key={set.id} value={set.id}>
                          {set.title} ({set.rules.length} rules)
                        </option>
                      ))}
                    </select>

                    <select
                      onChange={(e) => {
                        const ruleId = e.target.value;
                        if (!ruleId) return;
                        for (const set of DEFAULT_TACTICAL_RULE_SETS) {
                          const foundRule = set.rules.find(r => r.id === ruleId);
                          if (foundRule) {
                            const formatted = `${foundRule.name}: ${foundRule.description}`;
                            setEditingGameType(prev => {
                              const existing = prev.rules?.trim() || '';
                              const updated = existing ? `${existing}\n${formatted}` : formatted;
                              return { ...prev, rules: updated };
                            });
                            break;
                          }
                        }
                        e.target.value = '';
                      }}
                      className="bg-zinc-950 border border-zinc-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                    >
                      <option value="">-- Link Individual Rule Preset --</option>
                      {DEFAULT_TACTICAL_RULE_SETS.map(set => (
                        <optgroup key={set.id} label={set.title}>
                          {set.rules.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 1-by-1 Manual Rules Editor */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      Active Rules List (Added 1-by-1)
                    </span>
                    {(editingGameType.rules?.trim() || '') && (
                      <button
                        type="button"
                        onClick={() => setEditingGameType(prev => ({ ...prev, rules: '' }))}
                        className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider font-bold"
                      >
                        Clear All Rules
                      </button>
                    )}
                  </div>

                  {(() => {
                    const ruleLines = (editingGameType.rules || '')
                      .split('\n')
                      .map(line => line.trim())
                      .filter(line => line.length > 0);

                    return (
                      <div className="space-y-2">
                        {ruleLines.length === 0 ? (
                          <div className="text-center py-3 px-4 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-lg text-xs text-zinc-500">
                            No rules added yet. Add rules 1-by-1 below or link from field rules setup above.
                          </div>
                        ) : (
                          ruleLines.map((line, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 pr-2">
                              <span className="w-5 h-5 rounded bg-zinc-950 text-[10px] font-mono font-bold text-red-400 flex items-center justify-center shrink-0 border border-zinc-800">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={line}
                                onChange={(e) => {
                                  const updatedLines = [...ruleLines];
                                  updatedLines[idx] = e.target.value;
                                  setEditingGameType(prev => ({
                                    ...prev,
                                    rules: updatedLines.join('\n')
                                  }));
                                }}
                                className="flex-1 bg-transparent text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1.5 py-1"
                              />
                              <button
                                type="button"
                                title="Delete Rule"
                                onClick={() => {
                                  const updatedLines = ruleLines.filter((_, i) => i !== idx);
                                  setEditingGameType(prev => ({
                                    ...prev,
                                    rules: updatedLines.join('\n')
                                  }));
                                }}
                                className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors shrink-0"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const current = editingGameType.rules?.trim() || '';
                            const newRule = 'New scenario rule item';
                            const updated = current ? `${current}\n${newRule}` : newRule;
                            setEditingGameType(prev => ({ ...prev, rules: updated }));
                          }}
                          className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          <span>Add Rule Item (1-by-1)</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Row 7: XP & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Reward XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingGameType.participationXp ?? 75}
                    onChange={(e) =>
                      setEditingGameType((prev) => ({
                        ...prev,
                        participationXp: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={editingGameType.gameDurationMinutes ?? 45}
                    onChange={(e) =>
                      setEditingGameType((prev) => ({
                        ...prev,
                        gameDurationMinutes: parseInt(e.target.value, 10) || 45,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                  size="md"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {editingGameType.id ? 'Save Game Type' : 'Create Game Type'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
