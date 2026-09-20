import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Raffle, Player, Prize, RaffleTicketDoc, RaffleWinnerDoc } from '../types';
import { useData } from '../data/DataContext';
import { Button } from './Button';
import { notifyLiveRaffleStart, notifyRaffleWin } from '../utils/notificationService';
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

// ==========================================
// TACTICAL ANIMATED SPINNING WHEEL
// ==========================================
interface WheelSegment {
    label: string;
    code: string;
    ticketId?: string;
}

const TacticalSpinningWheel: React.FC<{
    segments: WheelSegment[];
    rotationAngle: number;
    isSpinning: boolean;
    winningIndex: number | null;
}> = ({ segments, rotationAngle, isSpinning, winningIndex }) => {
    const total = Math.max(1, segments.length);
    const sliceAngle = 360 / total;
    const colors = [
        '#d97706', '#dc2626', '#059669', '#2563eb', 
        '#7c3aed', '#0891b2', '#b45309', '#991b1b',
        '#047857', '#1d4ed8', '#6d28d9', '#0e7490'
    ];

    return (
        <div className="relative w-full max-w-[240px] sm:max-w-[300px] aspect-square mx-auto my-1.5 flex items-center justify-center shrink-0">
            {/* Outer LED Ring with Flashing Bulbs */}
            <div className="absolute -inset-2.5 sm:-inset-3.5 rounded-full border-4 border-amber-500/50 bg-gradient-to-b from-amber-950/60 via-zinc-950 to-black p-2 shadow-[0_0_40px_rgba(245,158,11,0.35)] flex items-center justify-center">
                {Array.from({ length: 18 }).map((_, i) => {
                    const angle = (i * 360) / 18;
                    const rad = (angle * Math.PI) / 180;
                    const rx = 50 + 47 * Math.cos(rad);
                    const ry = 50 + 47 * Math.sin(rad);
                    const isActive = isSpinning
                        ? (i % 2 === Math.floor(rotationAngle / 18) % 2)
                        : true;
                    return (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-black/80 transition-all ${
                                isActive
                                    ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                                    : 'bg-red-600 shadow-[0_0_10px_#dc2626]'
                            }`}
                            style={{ left: `${rx}%`, top: `${ry}%`, transform: 'translate(-50%, -50%)' }}
                        />
                    );
                })}
            </div>

            {/* Top Tactical Targeting Pointer */}
            <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <div className={`w-0 h-0 border-l-[10px] sm:border-l-[14px] border-l-transparent border-r-[10px] sm:border-r-[14px] border-r-transparent border-t-[18px] sm:border-t-[24px] border-t-red-600 drop-shadow-[0_4px_12px_rgba(239,68,68,0.9)] ${isSpinning ? 'animate-bounce' : ''}`} />
                <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-red-950 shadow-[0_0_10px_#f59e0b] -mt-2" />
            </div>

            {/* Rotating Wheel Graphics */}
            <div
                className="w-full h-full rounded-full overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]"
                style={{
                    transform: `rotate(${rotationAngle}deg)`,
                    transition: isSpinning ? 'transform 0.08s linear' : 'transform 3.8s cubic-bezier(0.12, 0.8, 0.28, 1.0)',
                }}
            >
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {segments.map((seg, idx) => {
                        const startAngle = idx * sliceAngle;
                        const endAngle = (idx + 1) * sliceAngle;
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;

                        const x1 = 100 + 100 * Math.cos(startRad);
                        const y1 = 100 + 100 * Math.sin(startRad);
                        const x2 = 100 + 100 * Math.cos(endRad);
                        const y2 = 100 + 100 * Math.sin(endRad);

                        const largeArc = sliceAngle > 180 ? 1 : 0;
                        const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        const midAngle = startAngle + sliceAngle / 2;
                        const midRad = (midAngle * Math.PI) / 180;
                        const textX = 100 + 68 * Math.cos(midRad);
                        const textY = 100 + 68 * Math.sin(midRad);

                        const isWinnerWedge = winningIndex === idx;

                        return (
                            <g key={idx}>
                                <path
                                    d={pathData}
                                    fill={isWinnerWedge ? '#fbbf24' : colors[idx % colors.length]}
                                    stroke="#09090b"
                                    strokeWidth="1.5"
                                />
                                <text
                                    x={textX}
                                    y={textY}
                                    fill="#ffffff"
                                    fontSize="6.5"
                                    fontWeight="900"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                >
                                    {(seg.code || `TKT-${idx + 1}`).substring(0, 9)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Central Tactical Hub */}
                    <circle cx="100" cy="100" r="28" fill="#18181b" stroke="#f59e0b" strokeWidth="2.5" />
                    <circle cx="100" cy="100" r="18" fill="#09090b" stroke="#ef4444" strokeWidth="1.5" />
                    <text
                        x="100"
                        y="100"
                        fill="#fbbf24"
                        fontSize="6.5"
                        fontWeight="900"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform="rotate(90, 100, 100)"
                    >
                        BOSJOL
                    </text>
                </svg>
            </div>
        </div>
    );
};

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
    const [wheelRotation, setWheelRotation] = useState(0);
    const [winningWedgeIndex, setWinningWedgeIndex] = useState<number | null>(null);
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

    // Derived wheel segments for 3D physics wheel
    const wheelSegments = useMemo(() => {
        if (availableTickets.length === 0) {
            return [{ label: 'NO TICKETS', code: 'EMPTY-POOL' }];
        }
        const maxSegs = Math.min(12, availableTickets.length);
        return availableTickets.slice(0, maxSegs).map((t, i) => {
            const p = players.find(ply => ply.id === t.playerId);
            const name = p ? (p.callsign || p.name) : 'Operator';
            return {
                label: name,
                code: t.code || `TKT-${i + 1}`,
                ticketId: t.id
            };
        });
    }, [availableTickets, players]);

    const currentPrize = prizes[currentPrizeIndex] || prizes[0] || { id: 'p_1', name: 'Grand Prize', place: 1 };
    const isCurrentPrizeDrawn = localWinners.some(w => w.prizeId === currentPrize?.id);
    const undrawnPrizesCount = prizes.filter(p => !localWinners.some(w => w.prizeId === p.id)).length;

    // Player specific tickets in this raffle (matching both id and playerCode)
    const myTickets = useMemo(() => {
        if (!currentPlayer) return [];
        const cid = String(currentPlayer.id || '').trim().toLowerCase();
        const ccode = String(currentPlayer.playerCode || '').trim().toLowerCase();
        return tickets.filter(t => {
            const tid = String(t.playerId || '').trim().toLowerCase();
            const tcode = String(t.playerCode || '').trim().toLowerCase();
            return (cid && tid === cid) || (ccode && (tid === ccode || tcode === ccode));
        });
    }, [tickets, currentPlayer]);

    // Enforce player privacy: Ensure non-admin users cannot access the Contenders Radar tab
    useEffect(() => {
        if (!isAdmin && activeTab === 'leaderboard') {
            setActiveTab('stage');
        }
    }, [isAdmin, activeTab]);

    const myWinCount = useMemo(() => {
        if (!currentPlayer) return 0;
        const cid = String(currentPlayer.id || '').trim().toLowerCase();
        const ccode = String(currentPlayer.playerCode || '').trim().toLowerCase();
        return localWinners.filter(w => {
            const wid = String(w.playerId || '').trim().toLowerCase();
            return (cid && wid === cid) || (ccode && wid === ccode);
        }).length;
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
        setWinningWedgeIndex(null);

        // Broadcast live draw start to players
        if (dataContext?.updateDoc) {
            dataContext.updateDoc('raffles', {
                ...raffle,
                liveState: {
                    isSpinning: true,
                    currentPrizeId: targetPrize.id,
                    updatedAt: Date.now()
                }
            });
        }

        // Notify subscribers that live draw has started
        notifyLiveRaffleStart(raffle.name, targetPrize.name, raffle.id).catch(() => {});

        let spinCount = 0;
        const totalSpins = 32;
        let speed = 40;

        const spinInterval = () => {
            const randomIdx = Math.floor(Math.random() * availableTickets.length);
            setActiveCandidateIndex(randomIdx % 10);
            setWheelRotation(prev => prev + 45);

            soundEngine.playTick(1 + (spinCount / totalSpins) * 0.8);
            spinCount++;

            if (spinCount < totalSpins) {
                // Heartbeat tension in the final 6 ticks
                if (totalSpins - spinCount <= 6 && spinCount % 2 === 0) {
                    soundEngine.playHeartbeat();
                }
                speed = 40 + Math.pow(spinCount / totalSpins, 3.2) * 260;
                setTimeout(spinInterval, speed);
            } else {
                // Final Lock-in
                const winningTicket = pickWinnerTicket(targetPrize, localWinners) || availableTickets[0];
                const winningPlayer = players.find(p => p.id === winningTicket.playerId);
                const playerTicketsCount = tickets.filter(t => t.playerId === winningTicket.playerId).length;

                // Find winning wedge index
                const segIdx = wheelSegments.findIndex(s => s.ticketId === winningTicket.id);
                const winIdx = segIdx >= 0 ? segIdx : 0;
                setWinningWedgeIndex(winIdx);

                // Align wheel precisely with winning wedge
                const segCount = Math.max(1, wheelSegments.length);
                const sliceAngle = 360 / segCount;
                const targetWedgeAngle = (winIdx + 0.5) * sliceAngle;
                setWheelRotation(prev => prev + 1440 + (360 - (targetWedgeAngle % 360)));

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

                // Check if all prizes are drawn -> mark completed
                const allPrizesWon = prizes.length > 0 && updatedWinners.length >= prizes.length;
                const updatedRaffle = {
                    ...raffle,
                    winners: updatedWinners,
                    status: allPrizesWon ? ('Completed' as const) : ('Active' as const),
                    completedAt: allPrizesWon ? new Date().toISOString() : raffle.completedAt,
                    liveState: {
                        isSpinning: false,
                        lastWinner: newWinnerDoc,
                        updatedAt: Date.now()
                    }
                };

                if (onSaveWinners) {
                    onSaveWinners(raffle.id, updatedWinners);
                }
                if (dataContext?.updateDoc) {
                    dataContext.updateDoc('raffles', updatedRaffle);
                }

                // Dispatch mobile notification for raffle win
                notifyRaffleWin(raffle.name, targetPrize.name, winningTicket.code || 'WINNER', raffle.id).catch(() => {});

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
    }, [availableTickets, isSpinning, currentPrize, players, pickWinnerTicket, localWinners, raffle, tickets, fireConfetti, dataContext, wheelSegments, prizes.length, onSaveWinners]);

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

            {/* Tactical Grid & 4D Layered Atmospheric Background with Image Fade & Depth Blur */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Dark tactical atmospheric background image with smooth dark radial mask */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity scale-105 transform-gpu transition-transform duration-1000"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/92 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12)_0%,rgba(0,0,0,0.85)_70%,rgba(0,0,0,0.98)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-15" />
                
                {/* 4D Floating Optical Depth Flares */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-96 bg-gradient-to-b from-amber-500/20 via-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* ==================================================== */}
            {/* TOP BAR: EVENT BRANDING & THEATER CONTROLS (SHRINK TO FIT) */}
            {/* ==================================================== */}
            <header className="relative z-20 flex items-center justify-between px-3 sm:px-5 py-1.5 sm:py-2 border-b border-white/10 bg-black/50 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="p-1 sm:p-1.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-red-600/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
                        <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h1 className="text-xs sm:text-base font-black tracking-wide text-white uppercase truncate max-w-[130px] xs:max-w-[180px] sm:max-w-md">
                                {raffle.name}
                            </h1>
                            <span className={`text-[8px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border shadow-sm ${
                                raffle.status === 'Completed'
                                    ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
                                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 animate-pulse'
                            }`}>
                                {raffle.status === 'Completed' ? 'CONCLUDED' : 'LIVE ARENA'}
                            </span>
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
                        className="p-1 sm:p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 shadow-sm active:scale-95 transition-all"
                    >
                        {soundMuted ? <SpeakerXMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500"/> : <SpeakerWaveIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"/>}
                    </button>

                    {/* Fullscreen Mode */}
                    <button
                        onClick={toggleFullscreen}
                        title="Toggle Theater Mode"
                        className="p-1 sm:p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 shadow-sm active:scale-95 transition-all"
                    >
                        {isFullscreen ? <ArrowsPointingInIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"/> : <ArrowsPointingOutIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
                    </button>

                    {/* Close Modal */}
                    <button 
                        onClick={onClose}
                        className="p-1 sm:p-1.5 rounded-xl bg-zinc-900/80 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-900/50 shadow-sm active:scale-95 transition-all"
                    >
                        <XMarkIcon className="w-4 h-4 sm:w-4 sm:h-4"/>
                    </button>
                </div>
            </header>

            {/* ==================================================== */}
            {/* NAVIGATION TABS HUD (SHRINK TO FIT) */}
            {/* ==================================================== */}
            <nav className="relative z-20 flex items-center justify-between px-3 sm:px-5 py-1 sm:py-1.5 bg-black/30 border-b border-white/5 overflow-x-auto gap-2 scrollbar-none backdrop-blur-xl">
                <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                        onClick={() => setActiveTab('stage')}
                        className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'stage'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 border border-amber-300'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                        }`}
                    >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>🎯 Live Stage</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('prizes')}
                        className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'prizes'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 border border-amber-300'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                        }`}
                    >
                        <TrophyIcon className="w-3.5 h-3.5" />
                        <span>🏆 Vault ({prizes.length})</span>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                                activeTab === 'leaderboard'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 border border-amber-300'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                            }`}
                        >
                            <UserGroupIcon className="w-3.5 h-3.5" />
                            <span>📊 Radar (Admin)</span>
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            activeTab === 'tickets'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 border border-amber-300'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                        }`}
                    >
                        <TicketIcon className="w-3.5 h-3.5" />
                        <span>🎟️ {isAdmin ? `All Tickets (${tickets.length})` : `My Tickets (${myTickets.length})`}</span>
                    </button>
                </div>

                {/* Spectator Cheer Trigger Bar */}
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-zinc-500 hidden md:inline mr-1 font-mono uppercase">Cheer:</span>
                    {['🎉', '🔥', '🎯', '👑', '💥'].map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => triggerCheer(emoji)}
                            className="p-1 sm:px-2 sm:py-0.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-xs sm:text-sm hover:scale-125 active:scale-95 transition-all shadow-sm"
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

                        {/* CENTRAL ROTATING CYLINDER / 3D SPOTLIGHT STAGE (NO HEAVY OUTLINES, 3D SHADOWING) */}
                        <div className="relative flex-1 min-h-[220px] sm:min-h-[320px] bg-gradient-to-b from-zinc-900/60 via-black/80 to-black/95 rounded-3xl p-3 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden group">
                            {/* Ambient Stage Lighting */}
                            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-full h-full bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent pointer-events-none" />

                            {/* Place & Prize Name Banner */}
                            <div className="mb-2 sm:mb-3">
                                <span className="inline-block font-mono text-[9px] sm:text-xs uppercase tracking-widest text-amber-300 bg-amber-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-500/30 shadow-sm backdrop-blur-md">
                                    Place #{currentPrizeIndex + 1} Prize Award
                                </span>
                                <h2 className="text-base sm:text-2xl font-black text-white mt-1 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] px-2">
                                    {currentPrize?.name || 'Grand Tactical Prize'}
                                </h2>
                            </div>

                            {/* 3D TACTICAL ANIMATED SPINNING WHEEL ARENA */}
                            <TacticalSpinningWheel 
                                segments={wheelSegments}
                                rotationAngle={wheelRotation}
                                isSpinning={isSpinning}
                                winningIndex={winningWedgeIndex}
                            />

                            {/* 3D CYLINDRICAL REEL / WINNER CARD DISPLAY */}
                            {isSpinning ? (
                                <div className="w-full max-w-sm sm:max-w-md my-2 p-3 sm:p-5 rounded-2xl bg-black/80 border border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25),inset_0_2px_8px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-2xl">
                                    {/* 3D Drum Slot Machine Cylindrical Overlays */}
                                    <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
                                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />

                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-amber-400 mb-1 z-10">
                                        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                        <span>DECRYPTING TICKET SERIALS...</span>
                                    </div>
                                    <div className="text-2xl sm:text-4xl font-mono font-black text-amber-300 tracking-wider my-1 sm:my-1.5 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] z-10">
                                        {availableTickets[activeCandidateIndex]?.code || 'TKT-??????'}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold text-zinc-300 mt-0.5 z-10 truncate max-w-full px-2">
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
                                <div className="w-full max-w-md my-1.5 p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-950/50 via-zinc-900/70 to-black/90 shadow-[0_25px_70px_rgba(245,158,11,0.25),0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col items-center justify-center animate-scaleUp border border-amber-500/40">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <SparklesIcon className="w-4 h-4 text-amber-400 animate-spin" />
                                        <span className="font-mono text-[10px] sm:text-xs uppercase font-black text-amber-400 tracking-wider">
                                            OFFICIAL WINNER SELECTED!
                                        </span>
                                        <SparklesIcon className="w-4 h-4 text-amber-400 animate-spin" />
                                    </div>

                                    {/* Winner Details with Full Name and Callsign */}
                                    <div className="my-1.5 sm:my-2 flex flex-col items-center">
                                        {justWon.player?.avatarUrl ? (
                                            <img 
                                                src={justWon.player.avatarUrl} 
                                                alt={justWon.player.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-amber-400 object-cover shadow-[0_4px_20px_rgba(245,158,11,0.4)] mb-1"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 text-lg sm:text-xl font-black mb-1 shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
                                                {justWon.player?.name?.charAt(0) || '🏆'}
                                            </div>
                                        )}

                                        <h3 className="text-base sm:text-xl font-black text-white px-2">
                                            {justWon.player?.name} {justWon.player?.surname || ''}
                                        </h3>
                                        
                                        {justWon.player?.callsign && (
                                            <span className="text-xs sm:text-base font-mono font-bold text-amber-400 mt-0.5">
                                                "{justWon.player.callsign}"
                                            </span>
                                        )}
                                        
                                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                            ID: {justWon.player?.playerCode || 'OP-00'}
                                        </span>
                                    </div>

                                    {/* Winning Ticket Code Pill (Realistic Holographic Ticket Token) */}
                                    <div className="bg-black/80 px-3 py-1 sm:py-1.5 rounded-xl border border-amber-500/40 shadow-inner flex items-center gap-2">
                                        <span className="text-[10px] sm:text-xs font-mono text-zinc-400">Winning Ticket:</span>
                                        <span className="text-xs sm:text-base font-mono font-black text-red-400 tracking-wider">
                                            {justWon.ticket?.code || 'TKT-XXXX'}
                                        </span>
                                    </div>

                                    {isAdmin && justWon.totalTicketsHeld > 0 && (
                                        <p className="text-[10px] text-amber-300/80 font-mono mt-1.5">
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
                                        <div className="w-full max-w-sm my-2 p-3 sm:p-4 rounded-2xl bg-black/60 border border-emerald-500/40 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
                                            <span className="text-[10px] sm:text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                                                <CheckBadgeIcon className="w-4 h-4"/> Prize Claimed
                                            </span>
                                            <h3 className="text-sm sm:text-base font-bold text-white">
                                                {winPlayer?.name} {winPlayer?.surname || ''}
                                            </h3>
                                            {winPlayer?.callsign && (
                                                <span className="text-xs font-mono font-bold text-amber-400">
                                                    "{winPlayer.callsign}"
                                                </span>
                                            )}
                                            <div className="mt-1.5 font-mono text-[10px] sm:text-xs text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-lg border border-red-900/50">
                                                {winTicket?.code || 'TKT-LOCKED'}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                /* WAITING FOR SPIN PROMPT */
                                <div className="my-2 sm:my-4 space-y-1">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mx-auto text-zinc-500 shadow-md">
                                        <TicketIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400/80" />
                                    </div>
                                    <p className="text-xs text-zinc-400">
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

                        {/* LIVE WINNERS PODIUM ROSTER (BORDERLESS FLOATING GLASS) */}
                        {localWinners.length > 0 && (
                            <div className="bg-black/40 p-3 sm:p-4 rounded-3xl border border-white/5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                                <div className="flex justify-between items-center mb-2.5">
                                    <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Official Podium ({localWinners.length}/{prizes.length} Awarded)
                                    </h4>
                                    {localWinners.length === prizes.length && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800/80">
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
                                            <div key={w.id} className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-black/50 border border-white/5 shadow-md backdrop-blur-md">
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
                                        className={`p-3.5 rounded-2xl border transition-all backdrop-blur-xl shadow-lg ${
                                            winnerDoc
                                                ? 'bg-gradient-to-br from-black/60 to-emerald-950/40 border-emerald-500/50'
                                                : 'bg-black/40 border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-[11px] font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                                                    {medal}
                                                </span>
                                                <h4 className="text-sm sm:text-base font-bold text-white mt-1.5">{prize.name}</h4>
                                            </div>
                                            {winnerDoc ? (
                                                <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/80">
                                                    CLAIMED
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                                    UP FOR GRABS
                                                </span>
                                            )}
                                        </div>

                                        {winnerDoc && (
                                            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
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
                {/* TAB 3: CONTENDERS LEADERBOARD & RADAR (ADMIN ONLY) */}
                {/* ==================================================== */}
                {activeTab === 'leaderboard' && isAdmin && (
                    <div className="max-w-4xl mx-auto w-full space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                                    <UserGroupIcon className="w-4 h-4 text-amber-400" /> Contenders Radar & Odds Breakdown
                                </h3>
                                <p className="text-[11px] text-zinc-400">
                                    Total ticket distribution across {leaderboardStats.length} participating operators
                                </p>
                            </div>
                        </div>

                        {/* Top Contender Leaderboard Table */}
                        <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-2xl shadow-xl">
                            <div className="p-2.5 bg-black/60 border-b border-white/10 grid grid-cols-12 text-[11px] font-mono font-bold text-zinc-400">
                                <span className="col-span-1 text-center">#</span>
                                <span className="col-span-5">Operator</span>
                                <span className="col-span-3 text-center">Tickets Held</span>
                                <span className="col-span-3 text-right">Probability</span>
                            </div>

                            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                                {leaderboardStats.length > 0 ? (
                                    leaderboardStats.map((item, idx) => {
                                        const probability = tickets.length > 0 
                                            ? ((item.count / tickets.length) * 100).toFixed(1)
                                            : '0.0';
                                        const isCurrent = currentPlayer && item.player?.id === currentPlayer.id;

                                        return (
                                            <div 
                                                key={item.player?.id || idx}
                                                className={`p-2.5 grid grid-cols-12 items-center text-xs transition-colors ${
                                                    isCurrent 
                                                        ? 'bg-amber-500/15 font-bold border-l-4 border-amber-500' 
                                                        : 'hover:bg-white/5'
                                                }`}
                                            >
                                                <span className="col-span-1 text-center font-mono font-bold text-amber-400">
                                                    {idx === 0 ? '👑' : `${idx + 1}`}
                                                </span>
                                                <div className="col-span-5 flex items-center gap-2">
                                                    {item.player?.avatarUrl ? (
                                                        <img src={item.player.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-white/10 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
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
                                                    <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-[11px]">
                                                        {item.count} tickets
                                                    </span>
                                                </div>
                                                <div className="col-span-3 text-right font-mono font-bold text-emerald-400 text-xs">
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
                {/* TAB 4: TICKET STASH (PERSONAL FOR PLAYERS, AUDIT FOR ADMIN) */}
                {/* ==================================================== */}
                {activeTab === 'tickets' && (
                    <div className="max-w-4xl mx-auto w-full space-y-3">
                        {!isAdmin ? (
                            /* Player View: Private Personal Stash Only */
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-black/60 via-amber-950/30 to-black/60 border border-amber-500/30 backdrop-blur-2xl flex items-center justify-between shadow-lg">
                                    <div>
                                        <span className="text-xs font-mono uppercase font-bold text-amber-400 block">
                                            Your Personal Raffle Tickets
                                        </span>
                                        <p className="text-base font-black text-white mt-0.5">
                                            {myTickets.length} Ticket{myTickets.length === 1 ? '' : 's'} Held
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-xl border border-white/10">
                                        Status: {raffle.status}
                                    </span>
                                </div>

                                {myTickets.length === 0 ? (
                                    <div className="p-8 text-center bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl">
                                        <TicketIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-zinc-300">You do not hold any tickets for this raffle yet.</p>
                                        <p className="text-[10px] text-zinc-500 mt-1">Tickets assigned to your callsign/profile will appear here securely.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto p-1">
                                        {myTickets.map(ticket => {
                                            const isWinningTicket = localWinners.some(w => w.ticketId === ticket.id);
                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all backdrop-blur-md shadow-md ${
                                                        isWinningTicket
                                                            ? 'bg-gradient-to-b from-amber-950/80 to-black/90 border-amber-400 shadow-amber-500/20'
                                                            : 'bg-black/40 border-amber-500/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="font-mono text-xs font-black text-amber-400">
                                                            {ticket.code}
                                                        </span>
                                                        {isWinningTicket ? (
                                                            <span className="text-[10px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-full">
                                                                WINNER 🏆
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">
                                                                {ticket.paymentStatus || 'Valid'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 font-mono">
                                                        Issued: {new Date(ticket.purchaseDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Admin View: Full Pool Audit & Management */
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-black/60 via-amber-950/30 to-black/60 border border-amber-500/30 backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg">
                                    <div>
                                        <span className="text-xs font-mono uppercase font-bold text-amber-400 block">
                                            Admin Raffle Pool Stash
                                        </span>
                                        <p className="text-base font-black text-white mt-0.5">
                                            {tickets.length} Total Tickets in Pool
                                        </p>
                                    </div>
                                    {onIssueTickets && (
                                        <Button 
                                            size="sm"
                                            onClick={() => onIssueTickets(raffle)}
                                            className="bg-amber-600 hover:bg-amber-500 text-xs font-bold py-1"
                                        >
                                            + Issue Tickets
                                        </Button>
                                    )}
                                </div>

                                {/* Search & Filter */}
                                <div className="flex items-center justify-between gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search ticket serial code or operator..."
                                        value={ticketSearch}
                                        onChange={(e) => setTicketSearch(e.target.value)}
                                        className="w-full max-w-sm px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                    />
                                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                                        {tickets.length} total in pool
                                    </span>
                                </div>

                                {/* Ticket Grid for Admin */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-1">
                                    {tickets
                                        .filter(t => {
                                            if (!ticketSearch) return true;
                                            const q = ticketSearch.toLowerCase();
                                            const owner = players.find(p => p.id === t.playerId || (p.playerCode && t.playerId === p.playerCode) || (t.playerCode && p.playerCode === t.playerCode));
                                            const nameMatch = t.playerName && t.playerName.toLowerCase().includes(q);
                                            const ownerMatch = owner && (
                                                owner.name.toLowerCase().includes(q) ||
                                                (owner.surname && owner.surname.toLowerCase().includes(q)) ||
                                                (owner.callsign && owner.callsign.toLowerCase().includes(q)) ||
                                                (owner.playerCode && owner.playerCode.toLowerCase().includes(q))
                                            );
                                            return t.code.toLowerCase().includes(q) || Boolean(nameMatch) || Boolean(ownerMatch);
                                        })
                                        .map(ticket => {
                                            const isWinningTicket = localWinners.some(w => w.ticketId === ticket.id);
                                            const owner = players.find(p => p.id === ticket.playerId || (p.playerCode && ticket.playerId === p.playerCode) || (ticket.playerCode && p.playerCode === ticket.playerCode));
                                            const ownerName = owner ? `${owner.name} ${owner.surname || ''}`.trim() : (ticket.playerName || 'Operator');
                                            const ownerCallsign = owner?.callsign || ticket.playerCallsign;

                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className={`p-2 rounded-xl border flex flex-col justify-between transition-all backdrop-blur-md shadow-sm ${
                                                        isWinningTicket
                                                            ? 'bg-gradient-to-b from-amber-950/80 to-black border-amber-400 shadow-amber-500/20'
                                                            : 'bg-black/50 border-white/5'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1 gap-1">
                                                        <span className="font-mono text-xs font-black text-amber-400 truncate">
                                                            {ticket.code}
                                                        </span>
                                                        {isWinningTicket && <span className="text-xs shrink-0">🏆</span>}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-300 truncate font-semibold" title={`${ownerName} ${ownerCallsign ? `("${ownerCallsign}")` : ''}`}>
                                                        {ownerName} {ownerCallsign ? `("${ownerCallsign}")` : ''}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Tactical Footer (Shrink to Fit) */}
            <footer className="relative z-20 px-3 sm:px-5 py-1 sm:py-1.5 border-t border-white/5 bg-black/60 text-center text-[10px] font-mono text-zinc-500 flex items-center justify-between backdrop-blur-xl">
                <span>BOSJOL TACTICAL AIRSOFT • RAFFLE ENGINE</span>
                <span className="hidden xs:inline">AUDIT RECORD: {raffle.id}</span>
            </footer>
        </div>
    );
};
