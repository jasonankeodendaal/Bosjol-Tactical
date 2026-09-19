import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Raffle, Player, Prize, RaffleTicketDoc, RaffleWinnerDoc } from '../types';
import { useData } from '../data/DataContext';
import { Button } from './Button';
import { 
    Trophy as TrophyIcon, 
    Ticket as TicketIcon, 
    Sparkles as SparklesIcon, 
    X as XMarkIcon,
    RefreshCw as ArrowPathIcon,
    Volume2 as SpeakerWaveIcon,
    VolumeX as SpeakerXMarkIcon,
    Maximize as ArrowsPointingOutIcon,
    Minimize as ArrowsPointingInIcon,
    Users as UserGroupIcon,
    CheckCircle2 as CheckBadgeIcon,
    Info as InformationCircleIcon,
    Calendar as CalendarIcon,
    MapPin as MapPinIcon,
    Phone as PhoneIcon,
    Tag as TagIcon,
    Flame as FireIcon
} from 'lucide-react';

// ==========================================
// TACTICAL SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class RaffleSoundEngine {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        // Lazy init
    }

    private initContext() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public setSoundEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public isSoundEnabled() {
        return this.enabled;
    }

    public playTick(pitchMultiplier: number = 1.0) {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520 * pitchMultiplier, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch {
            // Audio context silent catch
        }
    }

    public playHeartbeat() {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch {
            // Silent catch
        }
    }

    public playVictoryFanfare() {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
            const now = this.ctx.currentTime;

            notes.forEach((freq, idx) => {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = now + idx * 0.11;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.55);
            });

            // Add final chord
            setTimeout(() => {
                if (!this.ctx || !this.enabled) return;
                const chordNotes = [523.25, 659.25, 783.99, 1046.50];
                const chordNow = this.ctx.currentTime;
                chordNotes.forEach(f => {
                    if (!this.ctx) return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(f, chordNow);
                    gain.gain.setValueAtTime(0.15, chordNow);
                    gain.gain.exponentialRampToValueAtTime(0.001, chordNow + 1.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(chordNow);
                    osc.stop(chordNow + 1.25);
                });
            }, 550);
        } catch {
            // Silent catch
        }
    }

    public playCheerSound() {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch {
            // Silent catch
        }
    }
}

const soundEngine = new RaffleSoundEngine();

// ==========================================
// CANVASES & CONFETTI ENGINE
// ==========================================
interface ConfettiParticle {
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle' | 'star';
}

interface FloatingReaction {
    id: string;
    emoji: string;
    left: number;
}

interface RaffleEventDashboardProps {
    raffle: Raffle;
    players: Player[];
    currentPlayer?: Player | null;
    isAdmin?: boolean;
    onClose: () => void;
    onSaveWinners?: (raffleId: string, winners: RaffleWinnerDoc[]) => void;
    onIssueTickets?: (raffle: Raffle) => void;
}

export const RaffleEventDashboard: React.FC<RaffleEventDashboardProps> = ({
    raffle,
    players,
    currentPlayer,
    isAdmin = false,
    onClose,
    onSaveWinners,
    onIssueTickets,
}) => {
    const dataContext = useData();
    const [activeTab, setActiveTab] = useState<'stage' | 'prizes' | 'leaderboard' | 'tickets'>('stage');
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isAutoDrawingAll, setIsAutoDrawingAll] = useState(false);
    const [soundMuted, setSoundMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [reactions, setReactions] = useState<FloatingReaction[]>([]);
    const [ticketSearch, setTicketSearch] = useState('');
    
    // Live winners array tracking
    const [localWinners, setLocalWinners] = useState<RaffleWinnerDoc[]>(raffle.winners || []);
    const [candidateReel, setCandidateReel] = useState<Array<{ ticket: RaffleTicketDoc; player: Player | undefined }>>([]);
    const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);
    const [justWon, setJustWon] = useState<{
        prize: Prize;
        winner: RaffleWinnerDoc;
        player: Player | undefined;
        ticket: RaffleTicketDoc;
        totalTicketsHeld: number;
    } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const prizes = useMemo(() => [...(raffle.prizes || [])].sort((a, b) => a.place - b.place), [raffle.prizes]);
    const tickets = useMemo(() => raffle.tickets || [], [raffle.tickets]);
    const isTopTicketsMode = Boolean(
        raffle.alwaysChooseMostTickets === true || 
        (raffle as any)?.alwayschoosemosttickets === true ||
        String(raffle.alwaysChooseMostTickets) === 'true' ||
        String((raffle as any)?.alwayschoosemosttickets) === 'true'
    );

    // Available tickets for drawing (unawarded tickets)
    const availableTickets = useMemo(() => {
        const winningTicketIds = new Set(localWinners.map(w => w.ticketId));
        return tickets.filter(t => !winningTicketIds.has(t.id));
    }, [tickets, localWinners]);

    const currentPrize = prizes[currentPrizeIndex] || prizes[0] || { id: 'p_1', name: 'Grand Prize', place: 1 };
    const isCurrentPrizeDrawn = localWinners.some(w => w.prizeId === currentPrize?.id);
    const undrawnPrizesCount = prizes.filter(p => !localWinners.some(w => w.prizeId === p.id)).length;

    // Player specific tickets in this raffle
    const myTickets = useMemo(() => {
        if (!currentPlayer) return [];
        return tickets.filter(t => t.playerId === currentPlayer.id);
    }, [tickets, currentPlayer]);

    const myWinCount = useMemo(() => {
        if (!currentPlayer) return 0;
        return localWinners.filter(w => w.playerId === currentPlayer.id).length;
    }, [localWinners, currentPlayer]);

    // Leaderboard stats
    const leaderboardStats = useMemo(() => {
        const counts = new Map<string, { count: number; tickets: RaffleTicketDoc[]; player: Player | undefined; wins: Prize[] }>();
        
        tickets.forEach(t => {
            const existing = counts.get(t.playerId);
            if (existing) {
                existing.count++;
                existing.tickets.push(t);
            } else {
                const player = players.find(p => p.id === t.playerId);
                counts.set(t.playerId, { count: 1, tickets: [t], player, wins: [] });
            }
        });

        // Add wins
        localWinners.forEach(w => {
            const entry = counts.get(w.playerId);
            const prize = prizes.find(p => p.id === w.prizeId);
            if (entry && prize) {
                entry.wins.push(prize);
            }
        });

        return Array.from(counts.values()).sort((a, b) => b.count - a.count);
    }, [tickets, players, localWinners, prizes]);

    // Initialize candidate reel for realistic carousel visual
    useEffect(() => {
        if (tickets.length > 0) {
            const reel = tickets.slice(0, 30).map(t => ({
                ticket: t,
                player: players.find(p => p.id === t.playerId)
            }));
            setCandidateReel(reel);
        }
    }, [tickets, players]);

    // Sound toggle handler
    const toggleSound = () => {
        const next = !soundMuted;
        setSoundMuted(next);
        soundEngine.setSoundEnabled(!next);
    };

    // Fullscreen toggle handler
    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    // Confetti cannon trigger
    const fireConfetti = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

        const colors = ['#f59e0b', '#dc2626', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#ffffff'];
        const particles: ConfettiParticle[] = [];

        for (let i = 0; i < 140; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height * 0.45,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: (Math.random() - 0.5) * 18,
                speedY: (Math.random() - 0.9) * 16 - 3,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star',
            });
        }

        let animationFrame: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = 0;

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.speedY += 0.35; // Gravity
                p.speedX *= 0.98; // Air resistance
                p.rotation += p.rotationSpeed;
                p.opacity -= 0.007;

                if (p.opacity > 0 && p.y < canvas.height + 50) {
                    alive++;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = Math.max(0, p.opacity);
                    ctx.fillStyle = p.color;

                    if (p.shape === 'rect') {
                        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                    } else if (p.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Star
                        ctx.beginPath();
                        for (let s = 0; s < 5; s++) {
                            ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size, -Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
                            ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size / 2), -Math.sin((54 + s * 72) * Math.PI / 180) * (p.size / 2));
                        }
                        ctx.closePath();
                        ctx.fill();
                    }
                    ctx.restore();
                }
            });

            if (alive > 0) {
                animationFrame = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        render();
    }, []);

    // Cheer spectator reaction
    const triggerCheer = (emoji: string) => {
        soundEngine.playCheerSound();
        const newReaction: FloatingReaction = {
            id: `r_${Date.now()}_${Math.random()}`,
            emoji,
            left: 15 + Math.random() * 70
        };
        setReactions(prev => [...prev, newReaction]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 2200);
    };

    // Helper to calculate winning ticket for a specific prize
    const pickWinnerTicket = useCallback((targetPrize: Prize, currentWinnersList: RaffleWinnerDoc[]): RaffleTicketDoc | null => {
        const drawnTicketIds = new Set(currentWinnersList.map(w => w.ticketId));
        const pool = tickets.filter(t => !drawnTicketIds.has(t.id));
        if (pool.length === 0) return null;

        if (isTopTicketsMode) {
            // 1. Calculate overall total ticket volume per player in this raffle
            const playerTotalsMap = new Map<string, { playerId: string; totalCount: number; tickets: RaffleTicketDoc[] }>();
            tickets.forEach(t => {
                const existing = playerTotalsMap.get(t.playerId);
                if (existing) {
                    existing.totalCount++;
                    existing.tickets.push(t);
                } else {
                    playerTotalsMap.set(t.playerId, { playerId: t.playerId, totalCount: 1, tickets: [t] });
                }
            });

            // 2. Sort all participating players descending by total tickets held (Rank 1 = most tickets, Rank 2 = 2nd most, Rank 3 = 3rd most, etc.)
            const allRankedBuyers = Array.from(playerTotalsMap.values()).sort((a, b) => b.totalCount - a.totalCount);

            // 3. Exclude players who have already won another prize in this raffle session
            const alreadyWonPlayerIds = new Set(currentWinnersList.filter(w => w.prizeId !== targetPrize.id).map(w => w.playerId));
            const unawardedBuyers = allRankedBuyers.filter(b => !alreadyWonPlayerIds.has(b.playerId));

            // Candidate buyers pool (prefer unawarded; fallback to all ranked buyers if all have won)
            const candidateBuyers = unawardedBuyers.length > 0 ? unawardedBuyers : allRankedBuyers;

            if (candidateBuyers.length > 0) {
                // Find maximum ticket count among the available eligible candidates
                const maxTicketCount = candidateBuyers[0].totalCount;
                
                // Collect all candidates tied at the current top rank tier
                const tiedTopHolders = candidateBuyers.filter(b => b.totalCount === maxTicketCount);
                
                // Randomly draw among tied candidates at this rank tier
                const chosenBuyer = tiedTopHolders[Math.floor(Math.random() * tiedTopHolders.length)];

                // From the chosen player's tickets, pick an undrawn ticket
                const undrawnTickets = chosenBuyer.tickets.filter(t => !drawnTicketIds.has(t.id));
                const winningTicket = undrawnTickets.length > 0 
                    ? undrawnTickets[Math.floor(Math.random() * undrawnTickets.length)]
                    : chosenBuyer.tickets[Math.floor(Math.random() * chosenBuyer.tickets.length)];

                if (winningTicket) return winningTicket;
            }

            return pool[Math.floor(Math.random() * pool.length)];
        } else {
            const alreadyWonPlayerIds = new Set(currentWinnersList.filter(w => w.prizeId !== targetPrize.id).map(w => w.playerId));
            const freshTickets = pool.filter(t => !alreadyWonPlayerIds.has(t.playerId));
            const activePool = freshTickets.length > 0 ? freshTickets : pool;
            return activePool[Math.floor(Math.random() * activePool.length)];
        }
    }, [tickets, isTopTicketsMode]);

    // Single prize live draw with deceleration physics
    const executeSpinDraw = useCallback((targetPrize: Prize = currentPrize) => {
        if (availableTickets.length === 0 || isSpinning) return;

        setIsSpinning(true);
        setJustWon(null);

        let spinCount = 0;
        const totalSpins = 36;
        let speed = 40;

        const spinInterval = () => {
            const randomIdx = Math.floor(Math.random() * availableTickets.length);
            const randomTicket = availableTickets[randomIdx];
            const randomPlayer = players.find(p => p.id === randomTicket.playerId);

            setActiveCandidateIndex(randomIdx % 10);
            soundEngine.playTick(1 + (spinCount / totalSpins) * 0.8);
            spinCount++;

            if (spinCount < totalSpins) {
                // Heartbeat tension in the final 8 ticks
                if (totalSpins - spinCount <= 6 && spinCount % 2 === 0) {
                    soundEngine.playHeartbeat();
                }
                speed = 40 + Math.pow(spinCount / totalSpins, 3.2) * 280;
                setTimeout(spinInterval, speed);
            } else {
                // Final Lock-in
                const winningTicket = pickWinnerTicket(targetPrize, localWinners) || availableTickets[0];
                const winningPlayer = players.find(p => p.id === winningTicket.playerId);
                const playerTicketsCount = tickets.filter(t => t.playerId === winningTicket.playerId).length;

                const newWinnerDoc: RaffleWinnerDoc = {
                    id: `rw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    raffleId: raffle.id,
                    prizeId: targetPrize.id,
                    ticketId: winningTicket.id,
                    playerId: winningTicket.playerId
                };

                const updatedWinners = [...localWinners.filter(w => w.prizeId !== targetPrize.id), newWinnerDoc];
                setLocalWinners(updatedWinners);

                setJustWon({
                    prize: targetPrize,
                    winner: newWinnerDoc,
                    player: winningPlayer,
                    ticket: winningTicket,
                    totalTicketsHeld: playerTicketsCount
                });

                setIsSpinning(false);
                soundEngine.playVictoryFanfare();
                fireConfetti();

                // Trigger celebration notification
                if (winningPlayer) {
                    const fullName = `${winningPlayer.name} ${winningPlayer.surname || ''}`.trim();
                    const callsignFormatted = winningPlayer.callsign ? ` ("${winningPlayer.callsign}")` : '';
                    const winnerDisplayName = `${fullName}${callsignFormatted}`;

                    dataContext?.createNotification?.({
                        title: `🎉 Raffle Winner: ${winnerDisplayName}!`,
                        message: `${winnerDisplayName} won "${targetPrize.name}" in ${raffle.name}! (Ticket: ${winningTicket.code})`,
                        type: 'raffle_winner',
                        playerId: winningPlayer.id,
                        playerName: fullName,
                        playerCallsign: winningPlayer.callsign,
                        playerCode: winningPlayer.playerCode,
                        playerAvatarUrl: winningPlayer.avatarUrl,
                        eventId: raffle.id,
                        eventTitle: raffle.name,
                    });
                }
            }
        };

        spinInterval();
    }, [availableTickets, isSpinning, currentPrize, players, pickWinnerTicket, localWinners, raffle.id, raffle.name, tickets, fireConfetti, dataContext, isTopTicketsMode]);

    // Auto-draw all remaining prizes sequentially
    const handleAutoDrawAll = async () => {
        if (availableTickets.length === 0 || isSpinning || isAutoDrawingAll) return;

        setIsAutoDrawingAll(true);
        let updatedWinners = [...localWinners];

        for (let i = 0; i < prizes.length; i++) {
            const prize = prizes[i];
            const alreadyWon = updatedWinners.some(w => w.prizeId === prize.id);
            if (!alreadyWon) {
                setCurrentPrizeIndex(i);
                soundEngine.playHeartbeat();
                await new Promise(res => setTimeout(res, 450));

                const winningTicket = pickWinnerTicket(prize, updatedWinners);
                if (winningTicket) {
                    const winningDoc: RaffleWinnerDoc = {
                        id: `rw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        raffleId: raffle.id,
                        prizeId: prize.id,
                        ticketId: winningTicket.id,
                        playerId: winningTicket.playerId
                    };
                    updatedWinners = [...updatedWinners, winningDoc];
                    setLocalWinners(updatedWinners);

                    const p = players.find(ply => ply.id === winningTicket.playerId);
                    const count = tickets.filter(t => t.playerId === winningTicket.playerId).length;

                    setJustWon({
                        prize,
                        winner: winningDoc,
                        player: p,
                        ticket: winningTicket,
                        totalTicketsHeld: count
                    });

                    soundEngine.playVictoryFanfare();
                    fireConfetti();
                    await new Promise(res => setTimeout(res, 1400));
                }
            }
        }

        setIsAutoDrawingAll(false);
    };

    // Save winners back to backend/state
    const handleSaveWinners = () => {
        if (onSaveWinners) {
            onSaveWinners(raffle.id, localWinners);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col backdrop-blur-xl overflow-hidden animate-fadeIn select-none"
            id="raffle-event-dashboard-container"
        >
            {/* Confetti canvas overlay */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 pointer-events-none z-50 w-full h-full"
            />

            {/* Floating spectator reactions */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                {reactions.map(r => (
                    <div 
                        key={r.id}
                        style={{ left: `${r.left}%`, bottom: '60px' }}
                        className="absolute text-2xl sm:text-4xl animate-floatUp drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                    >
                        {r.emoji}
                    </div>
                ))}
            </div>

            {/* Tactical Grid Ambient 3D Glow & Depth Lighting */}
            <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-80 bg-gradient-to-b from-amber-500/15 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* ==================================================== */}
            {/* TOP BAR: EVENT BRANDING & THEATER CONTROLS */}
            {/* ==================================================== */}
            <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-red-600/20 border border-amber-500/30 text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] shrink-0">
                        <TrophyIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h1 className="text-sm sm:text-lg font-black tracking-wide text-white uppercase truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
                                {raffle.name}
                            </h1>
                            <span className={`text-[9px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shadow-sm ${
                                raffle.status === 'Completed'
                                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                    : 'bg-emerald-950/90 text-emerald-400 border-emerald-700/80 animate-pulse'
                            }`}>
                                {raffle.status === 'Completed' ? 'CONCLUDED' : 'LIVE ARENA'}
                            </span>
                            {isTopTicketsMode && isAdmin && (
                                <span className="hidden md:inline-flex text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    👑 TOP BUYER PRIORITY
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                            <span>Pool: <strong className="text-white font-mono">{tickets.length}</strong> tix</span>
                            <span>•</span>
                            <span>Prizes: <strong className="text-amber-400 font-mono">{prizes.length}</strong></span>
                            {raffle.drawDate && (
                                <>
                                    <span className="hidden xs:inline">•</span>
                                    <span className="hidden xs:inline truncate">Draw: {new Date(raffle.drawDate).toLocaleDateString()}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Sound Toggle */}
                    <button
                        onClick={toggleSound}
                        title={soundMuted ? "Unmute Tactical Audio FX" : "Mute Audio FX"}
                        className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                    >
                        {soundMuted ? <SpeakerXMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500"/> : <SpeakerWaveIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"/>}
                    </button>

                    {/* Fullscreen Mode */}
                    <button
                        onClick={toggleFullscreen}
                        title="Toggle Theater Mode"
                        className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                    >
                        {isFullscreen ? <ArrowsPointingInIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"/> : <ArrowsPointingOutIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
                    </button>

                    {/* Close Modal */}
                    <button 
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                    >
                        <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                    </button>
                </div>
            </header>

            {/* ==================================================== */}
            {/* NAVIGATION TABS HUD */}
            {/* ==================================================== */}
            <nav className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-1.5 sm:py-2 bg-zinc-900/70 border-b border-zinc-800/80 overflow-x-auto gap-2 scrollbar-none backdrop-blur-md">
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={() => setActiveTab('stage')}
                        className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'stage'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 border border-amber-400'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                        }`}
                    >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>🎯 Live Stage</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('prizes')}
                        className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'prizes'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 border border-amber-400'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                        }`}
                    >
                        <TrophyIcon className="w-3.5 h-3.5" />
                        <span>🏆 Vault ({prizes.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'leaderboard'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 border border-amber-400'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                        }`}
                    >
                        <UserGroupIcon className="w-3.5 h-3.5" />
                        <span>📊 Radar</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'tickets'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 border border-amber-400'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                        }`}
                    >
                        <TicketIcon className="w-3.5 h-3.5" />
                        <span>🎟️ My Tix {currentPlayer ? `(${myTickets.length})` : `(${tickets.length})`}</span>
                    </button>
                </div>

                {/* Spectator Cheer Trigger Bar */}
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-zinc-500 hidden md:inline mr-1 font-mono uppercase">Cheer:</span>
                    {['🎉', '🔥', '🎯', '👑', '💥'].map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => triggerCheer(emoji)}
                            className="p-1 sm:px-2 sm:py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs sm:text-sm hover:scale-125 active:scale-95 transition-all shadow-sm"
                            title={`Send ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ==================================================== */}
            {/* MAIN DASHBOARD CONTENT AREA */}
            {/* ==================================================== */}
            <main className="relative z-10 flex-1 overflow-y-auto p-2.5 sm:p-6 flex flex-col scrollbar-thin">
                {/* ==================================================== */}
                {/* TAB 1: LIVE DRAW ARENA / THEATER STAGE */}
                {/* ==================================================== */}
                {activeTab === 'stage' && (
                    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full space-y-3 sm:space-y-4">
                        {/* Prize Position Selector Pills */}
                        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                            {prizes.map((p, idx) => {
                                const hasWinner = localWinners.some(w => w.prizeId === p.id);
                                const isCurrent = idx === currentPrizeIndex;
                                return (
                                    <button
                                        key={p.id || idx}
                                        onClick={() => {
                                            if (!isSpinning) {
                                                setCurrentPrizeIndex(idx);
                                                setJustWon(null);
                                            }
                                        }}
                                        disabled={isSpinning}
                                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                            isCurrent
                                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 scale-105 border border-amber-300'
                                                : hasWinner
                                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                                        }`}
                                    >
                                        <span>#{idx + 1}</span>
                                        <span className="max-w-[80px] sm:max-w-[110px] truncate">{p.name || `Prize #${idx + 1}`}</span>
                                        {hasWinner && <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-400" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* CENTRAL ROTATING CYLINDER / 3D SPOTLIGHT STAGE */}
                        <div className="relative flex-1 min-h-[240px] sm:min-h-[360px] bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-black rounded-3xl border border-amber-500/30 p-3.5 sm:p-8 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
                            {/* Ambient Stage Lighting */}
                            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-full h-full bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
                            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

                            {/* Place & Prize Name Banner */}
                            <div className="mb-2 sm:mb-4">
                                <span className="inline-block font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 bg-amber-950/70 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-500/40 shadow-sm">
                                    Place #{currentPrizeIndex + 1} Prize Award
                                </span>
                                <h2 className="text-lg sm:text-3xl font-black text-white mt-1 sm:mt-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-2">
                                    {currentPrize?.name || 'Grand Tactical Prize'}
                                </h2>
                            </div>

                            {/* 3D CYLINDRICAL REEL / WINNER CARD DISPLAY */}
                            {isSpinning ? (
                                <div className="w-full max-w-sm sm:max-w-md my-2 sm:my-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.3),inset_0_2px_8px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center relative overflow-hidden">
                                    {/* 3D Drum Slot Machine Cylindrical Overlays */}
                                    <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
                                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />

                                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-amber-400 mb-1.5 z-10">
                                        <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-400" />
                                        <span>DECRYPTING TICKET SERIALS...</span>
                                    </div>
                                    <div className="text-2xl sm:text-5xl font-mono font-black text-amber-300 tracking-wider my-1.5 sm:my-2 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] z-10">
                                        {availableTickets[activeCandidateIndex]?.code || 'TKT-??????'}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold text-zinc-300 mt-1 z-10 truncate max-w-full px-2">
                                        {(() => {
                                            const candidate = availableTickets[activeCandidateIndex];
                                            const p = players.find(ply => ply.id === candidate?.playerId);
                                            return p ? (
                                                <span>{p.name} {p.surname || ''} {p.callsign ? `("${p.callsign}")` : ''}</span>
                                            ) : (
                                                <span>Scanning Operator Roster...</span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ) : justWon ? (
                                /* WINNER REVEAL SPOTLIGHT CARD (3D REALISM DEPTH) */
                                <div className="w-full max-w-md sm:max-w-lg my-1.5 sm:my-2 p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-950/90 via-zinc-900/95 to-zinc-950 border-2 border-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center animate-scaleUp">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin" />
                                        <span className="font-mono text-[11px] sm:text-xs uppercase font-black text-amber-400 tracking-wider">
                                            OFFICIAL WINNER SELECTED!
                                        </span>
                                        <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin" />
                                    </div>

                                    {/* Winner Details with Full Name and Callsign */}
                                    <div className="my-2 sm:my-3 flex flex-col items-center">
                                        {justWon.player?.avatarUrl ? (
                                            <img 
                                                src={justWon.player.avatarUrl} 
                                                alt={justWon.player.name}
                                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 object-cover shadow-[0_4px_20px_rgba(245,158,11,0.4)] mb-1.5"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 text-xl sm:text-2xl font-black mb-1.5 shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
                                                {justWon.player?.name?.charAt(0) || '🏆'}
                                            </div>
                                        )}

                                        <h3 className="text-lg sm:text-2xl font-black text-white px-2">
                                            {justWon.player?.name} {justWon.player?.surname || ''}
                                        </h3>
                                        
                                        {justWon.player?.callsign && (
                                            <span className="text-sm sm:text-lg font-mono font-bold text-amber-400 mt-0.5">
                                                "{justWon.player.callsign}"
                                            </span>
                                        )}
                                        
                                        <span className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-0.5">
                                            ID: {justWon.player?.playerCode || 'OP-00'}
                                        </span>
                                    </div>

                                    {/* Winning Ticket Code Pill (Realistic Holographic Ticket Token) */}
                                    <div className="bg-zinc-950/95 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-amber-500/40 shadow-inner flex items-center gap-2 sm:gap-3">
                                        <span className="text-[10px] sm:text-xs font-mono text-zinc-400">Winning Ticket:</span>
                                        <span className="text-sm sm:text-lg font-mono font-black text-red-400 tracking-wider drop-shadow-sm">
                                            {justWon.ticket?.code || 'TKT-XXXX'}
                                        </span>
                                    </div>

                                    {justWon.totalTicketsHeld > 0 && (
                                        <p className="text-[10px] sm:text-[11px] text-amber-300/80 font-mono mt-1.5 sm:mt-2">
                                            Operator held {justWon.totalTicketsHeld} ticket{justWon.totalTicketsHeld === 1 ? '' : 's'} in this raffle pool
                                        </p>
                                    )}
                                </div>
                            ) : isCurrentPrizeDrawn ? (
                                /* PREVIOUSLY DRAWN SUMMARY FOR THIS PRIZE */
                                (() => {
                                    const winDoc = localWinners.find(w => w.prizeId === currentPrize?.id);
                                    const winPlayer = players.find(p => p.id === winDoc?.playerId);
                                    const winTicket = tickets.find(t => t.id === winDoc?.ticketId);
                                    return (
                                        <div className="w-full max-w-sm sm:max-w-md my-2 sm:my-4 p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-emerald-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center">
                                            <span className="text-[10px] sm:text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                                                <CheckBadgeIcon className="w-4 h-4"/> Prize Claimed
                                            </span>
                                            <h3 className="text-base sm:text-lg font-bold text-white">
                                                {winPlayer?.name} {winPlayer?.surname || ''}
                                            </h3>
                                            {winPlayer?.callsign && (
                                                <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                                                    "{winPlayer.callsign}"
                                                </span>
                                            )}
                                            <div className="mt-2 font-mono text-[11px] sm:text-xs text-red-400 bg-red-950/80 px-3 py-1 rounded-xl border border-red-900/50 shadow-inner">
                                                {winTicket?.code || 'TKT-LOCKED'}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                /* WAITING FOR SPIN PROMPT */
                                <div className="my-3 sm:my-6 space-y-1.5 sm:space-y-2">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center mx-auto text-zinc-500">
                                        <TicketIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400/60" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-zinc-400">
                                        {availableTickets.length > 0 
                                            ? `${availableTickets.length} eligible tickets awaiting drawing`
                                            : 'No tickets available in this raffle pool'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* CONTROLS BAR: ONLY ADMIN CAN TRIGGER AND COMMIT DRAWS */}
                            {isAdmin ? (
                                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mt-3 sm:mt-4 z-20">
                                    <Button
                                        onClick={() => executeSpinDraw(currentPrize)}
                                        disabled={isSpinning || isAutoDrawingAll || availableTickets.length === 0}
                                        className="text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-lg shadow-red-950/80 active:scale-95"
                                    >
                                        {isSpinning 
                                            ? '🎲 Decrypting...' 
                                            : isCurrentPrizeDrawn 
                                                ? '🔄 Re-Draw This Prize' 
                                                : `🎯 Spin Place #${currentPrizeIndex + 1}`
                                        }
                                    </Button>

                                    {undrawnPrizesCount > 1 && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleAutoDrawAll}
                                            disabled={isSpinning || isAutoDrawingAll || availableTickets.length === 0}
                                            className="text-xs sm:text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95"
                                        >
                                            ⚡ Auto-Draw All {undrawnPrizesCount}
                                        </Button>
                                    )}

                                    {currentPrizeIndex > 0 && (
                                        <Button 
                                            variant="secondary"
                                            onClick={() => {
                                                setCurrentPrizeIndex(prev => Math.max(0, prev - 1));
                                                setJustWon(null);
                                            }}
                                            disabled={isSpinning}
                                            className="text-xs sm:text-sm active:scale-95"
                                        >
                                            👈 Prev
                                        </Button>
                                    )}

                                    {currentPrizeIndex < prizes.length - 1 && (
                                        <Button 
                                            variant="secondary"
                                            onClick={() => {
                                                setCurrentPrizeIndex(prev => Math.min(prizes.length - 1, prev + 1));
                                                setJustWon(null);
                                            }}
                                            disabled={isSpinning}
                                            className="text-xs sm:text-sm active:scale-95"
                                        >
                                            Next 👉
                                        </Button>
                                    )}

                                    {onSaveWinners && localWinners.length > 0 && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleSaveWinners}
                                            disabled={isSpinning}
                                            className="text-xs sm:text-sm bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 active:scale-95"
                                        >
                                            💾 Save Results
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                /* SPECTATOR CLIENT CONTROLS: VIEW ONLY + PLACE NAVIGATION */
                                <div className="flex flex-col items-center gap-2 sm:gap-3 mt-3 sm:mt-4 z-20">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                                        {currentPrizeIndex > 0 && (
                                            <Button 
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setCurrentPrizeIndex(prev => Math.max(0, prev - 1));
                                                    setJustWon(null);
                                                }}
                                                className="text-[11px] sm:text-xs active:scale-95"
                                            >
                                                👈 Prev
                                            </Button>
                                        )}

                                        <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] sm:text-xs text-zinc-400 font-mono flex items-center gap-1.5 shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span>
                                                {raffle.status === 'Completed'
                                                    ? '🏆 Draw Concluded'
                                                    : '📡 Live Spectator Stream'
                                                }
                                            </span>
                                        </div>

                                        {currentPrizeIndex < prizes.length - 1 && (
                                            <Button 
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setCurrentPrizeIndex(prev => Math.min(prizes.length - 1, prev + 1));
                                                    setJustWon(null);
                                                }}
                                                className="text-[11px] sm:text-xs active:scale-95"
                                            >
                                                Next 👉
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LIVE WINNERS PODIUM ROSTER (3D DEPTH CARDS) */}
                        {localWinners.length > 0 && (
                            <div className="bg-zinc-900/70 p-3 sm:p-4 rounded-3xl border border-zinc-800 text-left shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                <div className="flex justify-between items-center mb-2.5">
                                    <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Official Podium ({localWinners.length}/{prizes.length} Awarded)
                                    </h4>
                                    {localWinners.length === prizes.length && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-800">
                                            ✓ All Claimed
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {localWinners.map((w, wIdx) => {
                                        const prize = prizes.find(p => p.id === w.prizeId);
                                        const player = players.find(p => p.id === w.playerId);
                                        const ticket = tickets.find(t => t.id === w.ticketId);
                                        const place = prize?.place || (wIdx + 1);
                                        const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🎖️';
                                        return (
                                            <div key={w.id} className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-sm">
                                                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                                                    <span className="text-base sm:text-xl shrink-0">{medal}</span>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-white text-[11px] sm:text-xs truncate">{prize?.name || `Place #${place}`}</span>
                                                            <span className="text-[9px] sm:text-[10px] text-amber-400 font-mono shrink-0">#{place}</span>
                                                        </div>
                                                        <p className="text-[10px] sm:text-[11px] text-zinc-300 truncate">
                                                            {player?.name} {player?.surname || ''} <span className="text-amber-400 font-mono font-bold">({player?.callsign || player?.playerCode || 'Operator'})</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-[10px] sm:text-xs font-bold text-red-400 px-2 py-0.5 rounded-lg bg-red-950/80 border border-red-900/50 shrink-0 ml-2">
                                                    {ticket?.code || 'TICKET'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================================================== */}
                {/* TAB 2: PRIZE VAULT */}
                {/* ==================================================== */}
                {activeTab === 'prizes' && (
                    <div className="max-w-4xl mx-auto w-full space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-amber-400" /> Tactical Prize Showcase
                                </h3>
                                <p className="text-xs text-zinc-400">All prizes designated for this raffle event</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/30">
                                {prizes.length} Total Prizes
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {prizes.map((prize, idx) => {
                                const winnerDoc = localWinners.find(w => w.prizeId === prize.id);
                                const winnerPlayer = players.find(p => p.id === winnerDoc?.playerId);
                                const winnerTicket = tickets.find(t => t.id === winnerDoc?.ticketId);
                                const place = prize.place || (idx + 1);
                                const medal = place === 1 ? '🥇 1st Place' : place === 2 ? '🥈 2nd Place' : place === 3 ? '🥉 3rd Place' : `🎖️ Place #${place}`;

                                return (
                                    <div 
                                        key={prize.id || idx}
                                        className={`p-4 rounded-2xl border transition-all ${
                                            winnerDoc
                                                ? 'bg-gradient-to-br from-zinc-900/90 to-emerald-950/30 border-emerald-800/80'
                                                : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                                    {medal}
                                                </span>
                                                <h4 className="text-base font-bold text-white mt-1.5">{prize.name}</h4>
                                            </div>
                                            {winnerDoc ? (
                                                <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-800">
                                                    CLAIMED
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                                                    UP FOR GRABS
                                                </span>
                                            )}
                                        </div>

                                        {winnerDoc && (
                                            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Winner:</span>
                                                    <p className="text-xs font-bold text-white">
                                                        {winnerPlayer?.name} {winnerPlayer?.surname || ''}
                                                        {winnerPlayer?.callsign && (
                                                            <span className="text-amber-400 font-mono ml-1.5">"{winnerPlayer.callsign}"</span>
                                                        )}
                                                    </p>
                                                </div>
                                                {winnerTicket?.code && (
                                                    <span className="font-mono text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900/60">
                                                        {winnerTicket.code}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ==================================================== */}
                {/* TAB 3: CONTENDERS LEADERBOARD & RADAR */}
                {/* ==================================================== */}
                {activeTab === 'leaderboard' && (
                    <div className="max-w-4xl mx-auto w-full space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                    <UserGroupIcon className="w-5 h-5 text-amber-400" /> Contenders Radar & Odds Breakdown
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Total ticket distribution across {leaderboardStats.length} participating operators
                                </p>
                            </div>
                            {isTopTicketsMode && isAdmin && (
                                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/40">
                                    👑 Top Buyers Priority (Admin Only)
                                </span>
                            )}
                        </div>

                        {/* Top Contender Leaderboard Table */}
                        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden">
                            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800 grid grid-cols-12 text-xs font-mono font-bold text-zinc-400">
                                <span className="col-span-1 text-center">#</span>
                                <span className="col-span-5">Operator</span>
                                <span className="col-span-3 text-center">Tickets Held</span>
                                <span className="col-span-3 text-right">Probability</span>
                            </div>

                            <div className="divide-y divide-zinc-800/60 max-h-96 overflow-y-auto">
                                {leaderboardStats.length > 0 ? (
                                    leaderboardStats.map((item, idx) => {
                                        const probability = tickets.length > 0 
                                            ? ((item.count / tickets.length) * 100).toFixed(1)
                                            : '0.0';
                                        const isCurrent = currentPlayer && item.player?.id === currentPlayer.id;

                                        return (
                                            <div 
                                                key={item.player?.id || idx}
                                                className={`p-3 grid grid-cols-12 items-center text-xs transition-colors ${
                                                    isCurrent 
                                                        ? 'bg-amber-500/10 font-bold border-l-4 border-amber-500' 
                                                        : 'hover:bg-zinc-800/40'
                                                }`}
                                            >
                                                <span className="col-span-1 text-center font-mono font-bold text-amber-400">
                                                    {idx === 0 ? '👑' : `${idx + 1}`}
                                                </span>
                                                <div className="col-span-5 flex items-center gap-2">
                                                    {item.player?.avatarUrl ? (
                                                        <img src={item.player.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                                                            {item.player?.name?.charAt(0) || 'O'}
                                                        </div>
                                                    )}
                                                    <div className="truncate">
                                                        <span className="text-white font-semibold truncate block">
                                                            {item.player?.name} {item.player?.surname || ''}
                                                            {isCurrent && <span className="text-amber-400 font-bold ml-1">(You)</span>}
                                                        </span>
                                                        {item.player?.callsign && (
                                                            <span className="text-[10px] text-amber-400 font-mono">
                                                                "{item.player.callsign}"
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-3 text-center">
                                                    <span className="font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                                                        {item.count} tickets
                                                    </span>
                                                </div>
                                                <div className="col-span-3 text-right font-mono font-bold text-emerald-400">
                                                    {probability}%
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-zinc-500 text-xs">
                                        No tickets issued in this raffle yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================================================== */}
                {/* TAB 4: TICKET STASH (PERSONAL & SEARCHABLE) */}
                {/* ==================================================== */}
                {activeTab === 'tickets' && (
                    <div className="max-w-4xl mx-auto w-full space-y-4">
                        {/* Player Summary Card */}
                        {currentPlayer && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs font-mono uppercase font-bold text-amber-400 block">
                                        Your Personal Raffle Stash
                                    </span>
                                    <p className="text-lg font-black text-white mt-0.5">
                                        {myTickets.length} Tickets Held
                                        <span className="text-xs text-zinc-400 font-normal ml-2">
                                            ({tickets.length > 0 ? ((myTickets.length / tickets.length) * 100).toFixed(1) : 0}% Draw Probability)
                                        </span>
                                    </p>
                                </div>
                                {onIssueTickets && (
                                    <Button 
                                        size="sm"
                                        onClick={() => onIssueTickets(raffle)}
                                        className="bg-amber-600 hover:bg-amber-500 text-xs font-bold"
                                    >
                                        + Request / Add Tickets
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Search & Filter */}
                        <div className="flex items-center justify-between gap-3">
                            <input
                                type="text"
                                placeholder="Search ticket serial code (e.g. TKT-)..."
                                value={ticketSearch}
                                onChange={(e) => setTicketSearch(e.target.value)}
                                className="w-full max-w-sm px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-xs font-mono text-zinc-400 shrink-0">
                                {tickets.length} total in pool
                            </span>
                        </div>

                        {/* Ticket Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto p-1">
                            {tickets
                                .filter(t => !ticketSearch || t.code.toLowerCase().includes(ticketSearch.toLowerCase()))
                                .map(ticket => {
                                    const isMine = currentPlayer && ticket.playerId === currentPlayer.id;
                                    const isWinningTicket = localWinners.some(w => w.ticketId === ticket.id);
                                    const owner = players.find(p => p.id === ticket.playerId);

                                    return (
                                        <div
                                            key={ticket.id}
                                            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                                                isWinningTicket
                                                    ? 'bg-gradient-to-b from-amber-950/80 to-zinc-900 border-amber-400 shadow-md shadow-amber-500/20'
                                                    : isMine
                                                        ? 'bg-zinc-900/90 border-amber-500/50'
                                                        : 'bg-zinc-950/70 border-zinc-800/80'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-xs font-black text-red-400">
                                                    {ticket.code}
                                                </span>
                                                {isWinningTicket && <span className="text-xs">🏆</span>}
                                            </div>
                                            <p className="text-[11px] text-zinc-300 truncate">
                                                {owner?.name} {owner?.callsign ? `("${owner.callsign}")` : ''}
                                            </p>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </main>

            {/* Tactical Footer */}
            <footer className="relative z-20 px-4 py-2 border-t border-zinc-800 bg-zinc-950/90 text-center text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>BOSJOL TACTICAL AIRSOFT • RAFFLE ENGINE</span>
                <span>AUDIT RECORD: {raffle.id}</span>
            </footer>
        </div>
    );
};
