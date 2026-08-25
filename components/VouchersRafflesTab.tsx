import React, { useState, useMemo, useEffect } from 'react';
import type { Voucher, Raffle, Prize, Player, GameEvent, VoucherRedemption, RaffleTicketDoc, RaffleWinnerDoc, PaymentStatus } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { TicketIcon, PlusIcon, PencilIcon, TrashIcon, TrophyIcon, UserIcon, CheckCircleIcon, SparklesIcon } from './icons/Icons';
import { useData } from '../data/DataContext';

interface VouchersRafflesTabProps {
    vouchers: Voucher[];
    setVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
    raffles: Raffle[];
    setRaffles: React.Dispatch<React.SetStateAction<Raffle[]>>;
    players: Player[];
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

// ==========================================
// VOUCHER CREATOR / EDITOR MODAL
// ==========================================
const VoucherEditorModal: React.FC<{ 
    voucher: Partial<Voucher>, 
    onClose: () => void, 
    onSave: (v: Voucher | Omit<Voucher, 'id'>) => void, 
    players: Player[] 
}> = ({ voucher, onClose, onSave, players }) => {
    const [formData, setFormData] = useState({
        code: voucher.code || '',
        description: voucher.description || '',
        discount: voucher.discount || 0,
        type: voucher.type || 'fixed' as 'fixed' | 'percentage',
        status: voucher.status || 'Active' as 'Active' | 'Expired' | 'Depleted',
        usageLimit: voucher.usageLimit || 10,
        perUserLimit: voucher.perUserLimit || 1,
        assignedToPlayerId: voucher.assignedToPlayerId || ''
    });

    const handleSaveClick = () => {
        if (!formData.code.trim()) {
            alert('Please enter a voucher code.');
            return;
        }
        const finalVoucher = { 
            redemptions: voucher.redemptions || [], 
            ...voucher, 
            ...formData, 
            code: formData.code.trim().toUpperCase() 
        };
        onSave(finalVoucher);
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={voucher.id ? 'Edit Voucher' : 'Create New Voucher'}>
            <div className="space-y-4 text-left">
                <div>
                    <Input 
                        label="Voucher Code" 
                        value={formData.code} 
                        onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                        placeholder="e.g. RECRUIT50, BRAVODISCOUNT"
                    />
                </div>
                <Input 
                    label="Description / Purpose" 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    placeholder="e.g. R50 off game fee for new recruit"
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Discount Value" 
                        type="number" 
                        value={formData.discount} 
                        onChange={e => setFormData(f => ({ ...f, discount: Number(e.target.value) }))} 
                    />
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Discount Type</label>
                        <select 
                            value={formData.type} 
                            onChange={e => setFormData(f => ({ ...f, type: e.target.value as any }))} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        >
                            <option value="fixed">Fixed Amount (R)</option>
                            <option value="percentage">Percentage (%)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Input 
                        label="Total Max Uses" 
                        type="number" 
                        value={formData.usageLimit} 
                        onChange={e => setFormData(f => ({ ...f, usageLimit: Math.max(1, Number(e.target.value)) }))} 
                    />
                    <Input 
                        label="Per-Player Limit" 
                        type="number" 
                        value={formData.perUserLimit} 
                        onChange={e => setFormData(f => ({ ...f, perUserLimit: Math.max(1, Number(e.target.value)) }))} 
                    />
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                        <select 
                            value={formData.status} 
                            onChange={e => setFormData(f => ({ ...f, status: e.target.value as any }))} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        >
                            <option value="Active">Active</option>
                            <option value="Depleted">Depleted</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Assign to Specific Player (Optional)</label>
                    <select 
                        value={formData.assignedToPlayerId} 
                        onChange={e => setFormData(f => ({ ...f, assignedToPlayerId: e.target.value }))} 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        <option value="">-- Open to All Eligible Players --</option>
                        {players.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.playerCode ? `[${p.playerCode}] ` : ''}{p.name} {p.surname || ''} {p.callsign ? `("${p.callsign}")` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800">
                <Button className="w-full font-bold" onClick={handleSaveClick}>
                    {voucher.id ? 'Update Voucher' : 'Create Voucher'}
                </Button>
            </div>
        </Modal>
    );
};

// ==========================================
// ADMIN CLAIM VOUCHER FOR PLAYER MODAL
// ==========================================
const ClaimVoucherModal: React.FC<{
    voucher: Voucher;
    players: Player[];
    events: GameEvent[];
    onClose: () => void;
    onClaim: (voucherId: string, playerId: string, eventId: string) => void;
}> = ({ voucher, players, events, onClose, onClaim }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(voucher.assignedToPlayerId || (players[0]?.id || ''));
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [searchFilter, setSearchFilter] = useState('');

    const filteredPlayers = useMemo(() => {
        if (!searchFilter.trim()) return players;
        const q = searchFilter.toLowerCase();
        return players.filter(p => 
            p.name.toLowerCase().includes(q) || 
            (p.surname && p.surname.toLowerCase().includes(q)) ||
            (p.callsign && p.callsign.toLowerCase().includes(q)) ||
            (p.playerCode && p.playerCode.toLowerCase().includes(q))
        );
    }, [players, searchFilter]);

    const targetPlayer = players.find(p => p.id === selectedPlayerId);
    const existingPlayerClaims = (voucher.redemptions || []).filter(r => r.playerId === selectedPlayerId).length;
    const isOverPerPlayerLimit = voucher.perUserLimit ? existingPlayerClaims >= voucher.perUserLimit : false;

    const handleConfirmClaim = () => {
        if (!selectedPlayerId) {
            alert('Please select a player.');
            return;
        }
        if (isOverPerPlayerLimit) {
            if (!confirm(`Warning: This player has already claimed this voucher ${existingPlayerClaims} time(s) (limit is ${voucher.perUserLimit}). Continue anyway as Admin?`)) {
                return;
            }
        }
        onClaim(voucher.id, selectedPlayerId, selectedEventId);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Claim Voucher: ${voucher.code}`}>
            <div className="space-y-4 text-left">
                <div className="bg-gradient-to-r from-red-950/50 to-zinc-900 p-3.5 rounded-xl border border-red-800/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-mono text-base font-bold text-red-400">{voucher.code}</span>
                            <p className="text-xs text-zinc-300">{voucher.description || 'Special Discount Voucher'}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black text-amber-400">
                                {voucher.type === 'percentage' ? `${voucher.discount}% OFF` : `R${voucher.discount} OFF`}
                            </span>
                            <p className="text-[11px] text-zinc-400">
                                Used {(voucher.redemptions || []).length} / {voucher.usageLimit || '∞'}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Select Target Player
                    </label>
                    <input 
                        type="text" 
                        placeholder="Search player by name, callsign, or code..." 
                        value={searchFilter} 
                        onChange={e => setSearchFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white mb-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <select 
                        value={selectedPlayerId} 
                        onChange={e => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        {filteredPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.playerCode ? `[${p.playerCode}] ` : ''}{p.name} {p.surname || ''} {p.callsign ? `("${p.callsign}")` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {targetPlayer && (
                    <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src={targetPlayer.avatarUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${targetPlayer.name}`} 
                                alt={targetPlayer.name}
                                className="w-10 h-10 rounded-full border border-red-500/40 bg-zinc-950" 
                            />
                            <div>
                                <h4 className="font-bold text-white text-sm">
                                    {targetPlayer.name} {targetPlayer.surname || ''}
                                </h4>
                                <p className="text-xs text-amber-400 font-mono">
                                    Callsign: {targetPlayer.callsign || 'Unassigned'} • {targetPlayer.playerCode || 'No Code'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${isOverPerPlayerLimit ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                                {existingPlayerClaims} claim(s)
                            </span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Apply to Specific Event (Optional)
                    </label>
                    <select 
                        value={selectedEventId} 
                        onChange={e => setSelectedEventId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        <option value="">-- General Pro-Shop / Game Fee Discount --</option>
                        {events.map(ev => (
                            <option key={ev.id} value={ev.id}>
                                {ev.title} ({ev.date || 'TBD'})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3">
                <Button variant="secondary" onClick={onClose} className="w-1/2">
                    Cancel
                </Button>
                <Button onClick={handleConfirmClaim} className="w-1/2 font-bold bg-emerald-600 hover:bg-emerald-500">
                    Confirm & Claim
                </Button>
            </div>
        </Modal>
    );
};

// ==========================================
// RAFFLE CREATOR / EDITOR MODAL
// ==========================================
const RaffleEditorModal: React.FC<{ 
    raffle: Partial<Raffle>, 
    onClose: () => void, 
    onSave: (r: Raffle | Omit<Raffle, 'id'>) => void 
}> = ({ raffle, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: raffle.name || '',
        location: raffle.location || 'Main Tactical Arena',
        contactPhone: raffle.contactPhone || '+27821234567',
        drawDate: raffle.drawDate ? raffle.drawDate.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: raffle.status || 'Upcoming' as 'Upcoming' | 'Active' | 'Completed',
    });
    
    const [prizes, setPrizes] = useState<Prize[]>(
        raffle.prizes && raffle.prizes.length > 0 
            ? raffle.prizes 
            : [
                { id: `p_${Date.now()}_1`, name: '1st Place: Tactical Primary Weapon', place: 1 },
                { id: `p_${Date.now()}_2`, name: '2nd Place: Tactical Chest Rig', place: 2 },
                { id: `p_${Date.now()}_3`, name: '3rd Place: 5000 High-Grade BBs', place: 3 }
            ]
    );

    const handlePrizeChange = (index: number, value: string) => {
        const newPrizes = [...prizes];
        newPrizes[index].name = value;
        setPrizes(newPrizes);
    };

    const addPrize = () => {
        const place = (prizes.length + 1) as (1 | 2 | 3);
        if (prizes.length >= 5) return;
        setPrizes([...prizes, { id: `p_${Date.now()}_${place}`, name: '', place: (place > 3 ? 3 : place) as any }]);
    };

    const removePrize = (index: number) => {
        if (prizes.length <= 1) return;
        setPrizes(prizes.filter((_, i) => i !== index));
    };

    const handleSaveClick = () => {
        if (!formData.name.trim()) {
            alert('Please enter a raffle name.');
            return;
        }
        const finalRaffle = { 
            tickets: raffle.tickets || [], 
            winners: raffle.winners || [], 
            createdAt: raffle.createdAt || new Date().toISOString(), 
            ...raffle, 
            ...formData, 
            prizes,
            drawDate: new Date(formData.drawDate).toISOString()
        };
        onSave(finalRaffle as Raffle | Omit<Raffle, 'id'>);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={raffle.id ? 'Edit Raffle Event' : 'Create New Raffle Event'}>
            <div className="space-y-4 text-left">
                <Input 
                    label="Raffle Event Name" 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    placeholder="e.g. End of Month Gear Raffle"
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Draw Date" 
                        type="date" 
                        value={formData.drawDate} 
                        onChange={e => setFormData(f => ({ ...f, drawDate: e.target.value }))} 
                    />
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                        <select 
                            value={formData.status} 
                            onChange={e => setFormData(f => ({ ...f, status: e.target.value as any }))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        >
                            <option value="Upcoming">Upcoming</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Location / Arena" 
                        value={formData.location} 
                        onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} 
                    />
                    <Input 
                        label="Contact Phone" 
                        value={formData.contactPhone} 
                        onChange={e => setFormData(f => ({ ...f, contactPhone: e.target.value }))} 
                    />
                </div>

                <div className="border-t border-zinc-800 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <TrophyIcon className="w-4 h-4"/> Raffle Prizes (Ordered by Place)
                        </h4>
                        {prizes.length < 5 && (
                            <button 
                                type="button" 
                                onClick={addPrize} 
                                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                            >
                                <PlusIcon className="w-3.5 h-3.5"/> Add Prize
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        {prizes.map((prize, index) => (
                            <div key={prize.id || index} className="flex items-center gap-2">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : index === 1 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/40' : index === 2 ? 'bg-amber-800/20 text-amber-600 border border-amber-800/40' : 'bg-zinc-800 text-zinc-400'}`}>
                                    #{index + 1}
                                </span>
                                <input 
                                    type="text"
                                    value={prize.name} 
                                    onChange={e => handlePrizeChange(index, e.target.value)} 
                                    placeholder={`Prize for place #${index + 1}`}
                                    className="flex-grow bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                                {prizes.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removePrize(index)}
                                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
                <Button className="w-full font-bold" onClick={handleSaveClick}>
                    {raffle.id ? 'Save Raffle Changes' : 'Create Raffle Event'}
                </Button>
            </div>
        </Modal>
    );
};

// ==========================================
// ISSUE / ASSIGN RAFFLE TICKETS MODAL
// ==========================================
const IssueTicketsModal: React.FC<{
    raffle: Raffle;
    players: Player[];
    onClose: () => void;
    onIssue: (raffleId: string, newTickets: RaffleTicketDoc[]) => void;
}> = ({ raffle, players, onClose, onIssue }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
    const [quantity, setQuantity] = useState<number>(1);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid (Cash)');
    const [searchFilter, setSearchFilter] = useState('');

    const filteredPlayers = useMemo(() => {
        if (!searchFilter.trim()) return players;
        const q = searchFilter.toLowerCase();
        return players.filter(p => 
            p.name.toLowerCase().includes(q) || 
            (p.surname && p.surname.toLowerCase().includes(q)) ||
            (p.callsign && p.callsign.toLowerCase().includes(q)) ||
            (p.playerCode && p.playerCode.toLowerCase().includes(q))
        );
    }, [players, searchFilter]);

    const handleIssueConfirm = () => {
        if (!selectedPlayerId) {
            alert('Please select a player.');
            return;
        }
        if (quantity < 1) {
            alert('Please enter at least 1 ticket.');
            return;
        }

        const newTickets: RaffleTicketDoc[] = [];
        const existingCount = (raffle.tickets || []).length;
        
        for (let i = 0; i < quantity; i++) {
            const ticketNumber = existingCount + i + 1;
            const paddedNum = ticketNumber.toString().padStart(4, '0');
            newTickets.push({
                id: `tkt_${Date.now()}_${i}`,
                raffleId: raffle.id,
                code: `BT-RAF-${paddedNum}`,
                playerId: selectedPlayerId,
                purchaseDate: new Date().toISOString(),
                paymentStatus: paymentStatus
            });
        }

        onIssue(raffle.id, newTickets);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Issue Tickets: ${raffle.name}`}>
            <div className="space-y-4 text-left">
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-400 font-semibold uppercase">Current Tickets Issued</p>
                        <p className="text-xl font-bold text-white">{(raffle.tickets || []).length} Tickets</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {raffle.status}
                    </span>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Select Player
                    </label>
                    <input 
                        type="text" 
                        placeholder="Search player..." 
                        value={searchFilter} 
                        onChange={e => setSearchFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white mb-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <select 
                        value={selectedPlayerId} 
                        onChange={e => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        {filteredPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.playerCode ? `[${p.playerCode}] ` : ''}{p.name} {p.surname || ''} {p.callsign ? `("${p.callsign}")` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Number of Tickets" 
                        type="number" 
                        value={quantity} 
                        onChange={e => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))} 
                    />
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                        <select 
                            value={paymentStatus} 
                            onChange={e => setPaymentStatus(e.target.value as any)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        >
                            <option value="Paid (Cash)">Paid (Cash)</option>
                            <option value="Paid (Card)">Paid (Card)</option>
                            <option value="Unpaid">Unpaid / Promo</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3">
                <Button variant="secondary" onClick={onClose} className="w-1/2">
                    Cancel
                </Button>
                <Button onClick={handleIssueConfirm} className="w-1/2 font-bold">
                    Generate & Assign ({quantity}) Tickets
                </Button>
            </div>
        </Modal>
    );
};

// ==========================================
// INTERACTIVE LIVE RAFFLE DRAW ARENA MODAL
// ==========================================
const LiveRaffleDrawArena: React.FC<{
    raffle: Raffle;
    players: Player[];
    onClose: () => void;
    onSaveWinners: (raffleId: string, winners: RaffleWinnerDoc[]) => void;
}> = ({ raffle, players, onClose, onSaveWinners }) => {
    const dataContext = useData();
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [displayCandidate, setDisplayCandidate] = useState<{ ticketCode: string; player: Player | undefined } | null>(null);
    const [localWinners, setLocalWinners] = useState<RaffleWinnerDoc[]>(raffle.winners || []);
    const [justWon, setJustWon] = useState<{ prize: Prize; winner: RaffleWinnerDoc; player: Player | undefined } | null>(null);

    const prizes = useMemo(() => [...raffle.prizes].sort((a, b) => a.place - b.place), [raffle.prizes]);
    const tickets = raffle.tickets || [];

    // Eligible tickets (excluding already winning tickets to ensure one win per ticket)
    const availableTickets = useMemo(() => {
        const winningTicketIds = new Set(localWinners.map(w => w.ticketId));
        return tickets.filter(t => !winningTicketIds.has(t.id));
    }, [tickets, localWinners]);

    const currentPrize = prizes[currentPrizeIndex] || prizes[0];
    const isPrizeDrawn = localWinners.some(w => w.prizeId === currentPrize?.id);

    const startDraw = () => {
        if (availableTickets.length === 0) {
            alert('No eligible tickets available to draw from!');
            return;
        }

        setIsSpinning(true);
        setJustWon(null);

        let spinCount = 0;
        const totalSpins = 35; // Number of cycles
        let speed = 40; // Initial interval ms

        const spinInterval = () => {
            const randomTicket = availableTickets[Math.floor(Math.random() * availableTickets.length)];
            const player = players.find(p => p.id === randomTicket.playerId);
            setDisplayCandidate({ ticketCode: randomTicket.code, player });
            spinCount++;

            if (spinCount < totalSpins) {
                // Gradually decelerate
                speed = 40 + Math.pow(spinCount / totalSpins, 3) * 220;
                setTimeout(spinInterval, speed);
            } else {
                // Final Lock on Winner
                const finalWinningTicket = availableTickets[Math.floor(Math.random() * availableTickets.length)];
                const winningPlayer = players.find(p => p.id === finalWinningTicket.playerId);
                
                const newWinnerDoc: RaffleWinnerDoc = {
                    id: `rw_${Date.now()}`,
                    raffleId: raffle.id,
                    prizeId: currentPrize.id,
                    ticketId: finalWinningTicket.id,
                    playerId: finalWinningTicket.playerId
                };

                const updatedWinners = [...localWinners.filter(w => w.prizeId !== currentPrize.id), newWinnerDoc];
                setLocalWinners(updatedWinners);
                setIsSpinning(false);
                setJustWon({ prize: currentPrize, winner: newWinnerDoc, player: winningPlayer });

                // Trigger celebration notification
                if (winningPlayer) {
                    dataContext?.createNotification?.({
                        title: `🎉 Raffle Winner: ${winningPlayer.name}!`,
                        message: `${winningPlayer.name} (${winningPlayer.callsign || winningPlayer.playerCode}) won "${currentPrize.name}" in ${raffle.name}! Ticket: ${finalWinningTicket.code}`,
                        type: 'raffle_winner',
                        playerId: winningPlayer.id,
                        playerName: `${winningPlayer.name} ${winningPlayer.surname || ''}`.trim(),
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
    };

    const handleSaveAndExit = () => {
        onSaveWinners(raffle.id, localWinners);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={handleSaveAndExit} title={`Tactical Raffle Draw: ${raffle.name}`}>
            <div className="space-y-6 text-center">
                {/* Prize selector tabs */}
                <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                    {prizes.map((p, idx) => {
                        const hasWinner = localWinners.some(w => w.prizeId === p.id);
                        const isCurrent = idx === currentPrizeIndex;
                        return (
                            <button
                                key={p.id || idx}
                                onClick={() => { if (!isSpinning) { setCurrentPrizeIndex(idx); setJustWon(null); } }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isCurrent 
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' 
                                        : hasWinner 
                                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                                }`}
                            >
                                <span>#{idx + 1}</span>
                                <span className="max-w-[120px] truncate">{p.name || `Place #${idx+1}`}</span>
                                {hasWinner && <span className="text-emerald-400">✓</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Main Draw Display Card */}
                <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse"></div>

                    <div className="mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-amber-400/90 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-700/40">
                            DRAWING FOR PLACE #{currentPrizeIndex + 1}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                            {currentPrize.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {availableTickets.length} eligible tickets in the pool
                        </p>
                    </div>

                    {/* Spinning / Candidate Stage */}
                    <div className="my-6 min-h-[160px] flex flex-col items-center justify-center p-4 rounded-xl bg-black/60 border border-zinc-800">
                        {isSpinning && displayCandidate ? (
                            <div className="animate-pulse space-y-2">
                                <div className="text-3xl sm:text-4xl font-mono font-black text-red-500 tracking-wider">
                                    {displayCandidate.ticketCode}
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {displayCandidate.player?.name} {displayCandidate.player?.surname || ''}
                                </div>
                                <p className="text-xs text-amber-400 font-mono">
                                    Callsign: {displayCandidate.player?.callsign || 'Candidate'}
                                </p>
                            </div>
                        ) : justWon ? (
                            <div className="space-y-3 animate-bounce">
                                <div className="inline-block p-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400 mb-1">
                                    <TrophyIcon className="w-8 h-8"/>
                                </div>
                                <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-wider">
                                    {tickets.find(t => t.id === justWon.winner.ticketId)?.code || 'WINNING TICKET'}
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <img 
                                        src={justWon.player?.avatarUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${justWon.player?.name}`} 
                                        alt={justWon.player?.name}
                                        className="w-12 h-12 rounded-full border-2 border-amber-400 shadow-md"
                                    />
                                    <div className="text-left">
                                        <div className="text-xl font-black text-white">
                                            {justWon.player?.name} {justWon.player?.surname || ''}
                                        </div>
                                        <div className="text-xs text-amber-300 font-mono font-bold">
                                            Callsign: {justWon.player?.callsign || 'N/A'} • {justWon.player?.playerCode || ''}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-emerald-400">
                                    🏆 Winner Selected & Recorded!
                                </p>
                            </div>
                        ) : isPrizeDrawn ? (
                            (() => {
                                const currentWin = localWinners.find(w => w.prizeId === currentPrize.id);
                                const winnerPlayer = players.find(p => p.id === currentWin?.playerId);
                                const winningTicket = tickets.find(t => t.id === currentWin?.ticketId);
                                return (
                                    <div className="space-y-2">
                                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Previous Winner</span>
                                        <div className="text-2xl font-mono font-bold text-amber-400">
                                            {winningTicket?.code || 'TICKET'}
                                        </div>
                                        <p className="text-base font-bold text-white">
                                            {winnerPlayer?.name} {winnerPlayer?.surname || ''} {winnerPlayer?.callsign ? `("${winnerPlayer.callsign}")` : ''}
                                        </p>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="text-zinc-500 text-sm">
                                <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-zinc-600"/>
                                Ready to draw. Click the button below to start the tactical ticket generator!
                            </div>
                        )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button 
                            onClick={startDraw} 
                            disabled={isSpinning || availableTickets.length === 0}
                            className="font-black text-base py-3 px-8 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xl"
                        >
                            {isSpinning ? '🎲 Decrypting Tickets...' : isPrizeDrawn ? '🔄 Re-Draw Winner' : '🎯 Spin & Draw Winner'}
                        </Button>

                        {currentPrizeIndex < prizes.length - 1 && (
                            <Button 
                                variant="secondary"
                                onClick={() => { setCurrentPrizeIndex(i => i + 1); setJustWon(null); }}
                                disabled={isSpinning}
                                className="text-sm font-semibold"
                            >
                                Next Prize &rarr;
                            </Button>
                        )}
                    </div>
                </div>

                {/* Drawn Winners Summary */}
                {localWinners.length > 0 && (
                    <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-left">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                            <TrophyIcon className="w-4 h-4"/> Official Draw Results ({localWinners.length} of {prizes.length} Prizes Claimed)
                        </h4>
                        <div className="space-y-2">
                            {localWinners.map(w => {
                                const prize = prizes.find(p => p.id === w.prizeId);
                                const player = players.find(p => p.id === w.playerId);
                                const ticket = tickets.find(t => t.id === w.ticketId);
                                return (
                                    <div key={w.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-bold text-amber-400 text-xs w-6">#{prize?.place || 1}</span>
                                            <div>
                                                <span className="font-semibold text-white text-xs">{prize?.name}</span>
                                                <p className="text-[11px] text-zinc-400">
                                                    {player?.name} {player?.surname || ''} ({player?.callsign || player?.playerCode || 'Operator'})
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-900/50">
                                            {ticket?.code || 'TICKET'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <Button onClick={handleSaveAndExit} className="w-full font-bold">
                        Save Results & Conclude Draw
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


// ==========================================
// MAIN VOUCHERS & RAFFLES TAB
// ==========================================
export const VouchersRafflesTab: React.FC<VouchersRafflesTabProps> = (props) => {
    const { vouchers, raffles, players, addDoc, updateDoc, deleteDoc } = props;
    const dataContext = useData();

    const [activeSection, setActiveSection] = useState<'vouchers' | 'raffles'>('vouchers');
    const [voucherFilter, setVoucherFilter] = useState<'All' | 'Active' | 'Claimed' | 'Expired'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [isEditingVoucher, setIsEditingVoucher] = useState<Partial<Voucher> | null>(null);
    const [isEditingRaffle, setIsEditingRaffle] = useState<Partial<Raffle> | null>(null);
    const [claimingVoucher, setClaimingVoucher] = useState<Voucher | null>(null);
    const [issuingTicketsRaffle, setIssuingTicketsRaffle] = useState<Raffle | null>(null);
    const [drawingRaffle, setDrawingRaffle] = useState<Raffle | null>(null);
    const [viewingRedemptionsVoucherId, setViewingRedemptionsVoucherId] = useState<string | null>(null);
    const [viewingTicketsRaffleId, setViewingTicketsRaffleId] = useState<string | null>(null);

    // Save Voucher Handler
    const handleSaveVoucher = async (voucher: Voucher | Omit<Voucher, 'id'>) => {
        if ('id' in voucher) {
            await updateDoc('vouchers', voucher);
        } else {
            const newId = `v_${Date.now()}`;
            await addDoc('vouchers', { id: newId, redemptions: [], ...voucher });
        }
        setIsEditingVoucher(null);
    };

    // Save Raffle Handler
    const handleSaveRaffle = async (raffle: Raffle | Omit<Raffle, 'id'>) => {
        if ('id' in raffle) {
            await updateDoc('raffles', raffle);
        } else {
            const newId = `raf_${Date.now()}`;
            await addDoc('raffles', { id: newId, tickets: [], winners: [], ...raffle });
        }
        setIsEditingRaffle(null);
    };

    // Admin Claim Voucher on Behalf of Player
    const handleClaimVoucher = async (voucherId: string, playerId: string, eventId: string) => {
        const voucher = vouchers.find(v => v.id === voucherId);
        if (!voucher) return;

        const newRedemption: VoucherRedemption = {
            id: `vr_${Date.now()}`,
            voucherId: voucher.id,
            playerId: playerId,
            eventId: eventId || '',
            date: new Date().toISOString()
        };

        const existingRedemptions = voucher.redemptions || [];
        const updatedRedemptions = [...existingRedemptions, newRedemption];

        // Check if usage limit reached
        let updatedStatus = voucher.status;
        if (voucher.usageLimit && updatedRedemptions.length >= voucher.usageLimit) {
            updatedStatus = 'Depleted';
        }

        const updatedVoucher = {
            ...voucher,
            redemptions: updatedRedemptions,
            status: updatedStatus
        };

        await updateDoc('vouchers', updatedVoucher);
        setClaimingVoucher(null);

        // Activity log and notification
        const player = players.find(p => p.id === playerId);
        if (player) {
            dataContext?.createNotification?.({
                title: `Voucher Redeemed: ${voucher.code}`,
                message: `Admin redeemed voucher ${voucher.code} (${voucher.type === 'percentage' ? `${voucher.discount}%` : `R${voucher.discount}`} discount) for ${player.name} (${player.callsign || player.playerCode}).`,
                type: 'voucher_claimed',
                playerId: player.id,
                playerName: `${player.name} ${player.surname || ''}`.trim(),
                playerCallsign: player.callsign,
                playerCode: player.playerCode,
                playerAvatarUrl: player.avatarUrl,
            });
        }
    };

    // Admin Undo / Remove a Redemption
    const handleUndoRedemption = async (voucherId: string, redemptionId: string) => {
        const voucher = vouchers.find(v => v.id === voucherId);
        if (!voucher) return;
        if (!confirm('Are you sure you want to undo this player redemption?')) return;

        const updatedRedemptions = (voucher.redemptions || []).filter(r => r.id !== redemptionId);
        let updatedStatus = voucher.status;
        if (voucher.status === 'Depleted' && (!voucher.usageLimit || updatedRedemptions.length < voucher.usageLimit)) {
            updatedStatus = 'Active';
        }

        await updateDoc('vouchers', {
            ...voucher,
            redemptions: updatedRedemptions,
            status: updatedStatus
        });
    };

    // Issue Tickets to Player
    const handleIssueTickets = async (raffleId: string, newTickets: RaffleTicketDoc[]) => {
        const raffle = raffles.find(r => r.id === raffleId);
        if (!raffle) return;

        const updatedRaffle = {
            ...raffle,
            tickets: [...(raffle.tickets || []), ...newTickets],
            status: raffle.status === 'Upcoming' ? 'Active' as const : raffle.status
        };

        await updateDoc('raffles', updatedRaffle);
        setIssuingTicketsRaffle(null);
    };

    // Save Live Raffle Draw Winners
    const handleSaveRaffleWinners = async (raffleId: string, winners: RaffleWinnerDoc[]) => {
        const raffle = raffles.find(r => r.id === raffleId);
        if (!raffle) return;

        const allPrizesWon = raffle.prizes.length > 0 && winners.length >= raffle.prizes.length;

        const updatedRaffle = {
            ...raffle,
            winners: winners,
            status: allPrizesWon ? 'Completed' as const : 'Active' as const
        };

        await updateDoc('raffles', updatedRaffle);
        setDrawingRaffle(null);
    };

    // Filtered Vouchers List
    const filteredVouchers = useMemo(() => {
        return vouchers.filter(v => {
            if (voucherFilter === 'Active' && v.status !== 'Active') return false;
            if (voucherFilter === 'Claimed' && v.status !== 'Depleted' && (v.redemptions || []).length === 0) return false;
            if (voucherFilter === 'Expired' && v.status !== 'Expired') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesCode = v.code.toLowerCase().includes(q);
                const matchesDesc = (v.description || '').toLowerCase().includes(q);
                const assignedPlayer = players.find(p => p.id === v.assignedToPlayerId);
                const matchesPlayer = assignedPlayer && (
                    assignedPlayer.name.toLowerCase().includes(q) || 
                    (assignedPlayer.callsign && assignedPlayer.callsign.toLowerCase().includes(q)) ||
                    (assignedPlayer.playerCode && assignedPlayer.playerCode.toLowerCase().includes(q))
                );
                return matchesCode || matchesDesc || matchesPlayer;
            }
            return true;
        });
    }, [vouchers, voucherFilter, searchQuery, players]);

    return (
        <div className="space-y-6 text-left">
            {/* Modal Handlers */}
            {isEditingVoucher && (
                <VoucherEditorModal 
                    voucher={isEditingVoucher} 
                    onClose={() => setIsEditingVoucher(null)} 
                    onSave={handleSaveVoucher} 
                    players={players} 
                />
            )}
            
            {claimingVoucher && (
                <ClaimVoucherModal 
                    voucher={claimingVoucher} 
                    players={players} 
                    events={dataContext.events || []} 
                    onClose={() => setClaimingVoucher(null)} 
                    onClaim={handleClaimVoucher} 
                />
            )}

            {isEditingRaffle && (
                <RaffleEditorModal 
                    raffle={isEditingRaffle} 
                    onClose={() => setIsEditingRaffle(null)} 
                    onSave={handleSaveRaffle} 
                />
            )}

            {issuingTicketsRaffle && (
                <IssueTicketsModal 
                    raffle={issuingTicketsRaffle} 
                    players={players} 
                    onClose={() => setIssuingTicketsRaffle(null)} 
                    onIssue={handleIssueTickets} 
                />
            )}

            {drawingRaffle && (
                <LiveRaffleDrawArena 
                    raffle={drawingRaffle} 
                    players={players} 
                    onClose={() => setDrawingRaffle(null)} 
                    onSaveWinners={handleSaveRaffleWinners} 
                />
            )}

            {/* Top Navigation Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveSection('vouchers')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                            activeSection === 'vouchers'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                    >
                        <TicketIcon className="w-4 h-4"/>
                        <span>Vouchers & Discount Engine</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-zinc-300">
                            {vouchers.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection('raffles')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                            activeSection === 'raffles'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                    >
                        <TrophyIcon className="w-4 h-4"/>
                        <span>Tactical Raffles & Winner Draw</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-zinc-300">
                            {raffles.length}
                        </span>
                    </button>
                </div>

                <div>
                    {activeSection === 'vouchers' ? (
                        <Button onClick={() => setIsEditingVoucher({})} size="sm">
                            <PlusIcon className="w-4 h-4 mr-1.5"/> Create New Voucher
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditingRaffle({})} size="sm" className="bg-amber-600 hover:bg-amber-500">
                            <PlusIcon className="w-4 h-4 mr-1.5"/> Create New Raffle
                        </Button>
                    )}
                </div>
            </div>

            {/* ==================================================== */}
            {/* SECTION 1: VOUCHERS MANAGEMENT & CLAIM ENGINE */}
            {/* ==================================================== */}
            {activeSection === 'vouchers' && (
                <div className="space-y-4">
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {(['All', 'Active', 'Claimed', 'Expired'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setVoucherFilter(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        voucherFilter === tab 
                                            ? 'bg-zinc-700 text-white shadow' 
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Search vouchers or assigned player..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full sm:w-72 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                    </div>

                    {/* Vouchers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredVouchers.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                                <TicketIcon className="w-12 h-12 mx-auto mb-2 text-zinc-600"/>
                                <p className="font-semibold text-sm">No vouchers match your filter.</p>
                                <p className="text-xs text-zinc-600 mt-1">Click "Create New Voucher" above to generate codes for players.</p>
                            </div>
                        ) : (
                            filteredVouchers.map(v => {
                                const redemptions = v.redemptions || [];
                                const assignedPlayer = players.find(p => p.id === v.assignedToPlayerId);
                                const isDepleted = v.status === 'Depleted' || (v.usageLimit ? redemptions.length >= v.usageLimit : false);
                                const isViewingRedemptions = viewingRedemptionsVoucherId === v.id;

                                return (
                                    <div 
                                        key={v.id} 
                                        className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 p-4 transition-all shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2.5">
                                                <div>
                                                    <span className="font-mono text-base font-black text-red-400 bg-red-950/60 px-2.5 py-1 rounded border border-red-900/60 inline-block">
                                                        {v.code}
                                                    </span>
                                                    <span className="ml-2 font-black text-amber-400 text-sm">
                                                        {v.type === 'percentage' ? `${v.discount}% OFF` : `R${v.discount} OFF`}
                                                    </span>
                                                </div>
                                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                                    v.status === 'Active' 
                                                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                                                        : v.status === 'Depleted' 
                                                            ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' 
                                                            : 'bg-red-950/80 text-red-400 border border-red-800'
                                                }`}>
                                                    {v.status}
                                                </span>
                                            </div>

                                            <p className="text-xs text-zinc-300 mb-3">
                                                {v.description || 'No description provided.'}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 mb-3">
                                                <div>
                                                    <span className="text-zinc-500 font-semibold">Total Claims:</span>
                                                    <span className="ml-1 text-white font-bold">{redemptions.length} / {v.usageLimit || '∞'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500 font-semibold">Per Player:</span>
                                                    <span className="ml-1 text-white font-bold">{v.perUserLimit || 1} use(s)</span>
                                                </div>
                                                <div className="col-span-2 truncate">
                                                    <span className="text-zinc-500 font-semibold">Assigned To:</span>
                                                    <span className="ml-1 text-zinc-300 font-medium">
                                                        {assignedPlayer ? `${assignedPlayer.name} (${assignedPlayer.callsign || assignedPlayer.playerCode})` : 'All Operators'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Redemptions Drawer */}
                                        {isViewingRedemptions && (
                                            <div className="my-3 p-3 bg-black/80 rounded-lg border border-zinc-800 text-xs space-y-2 max-h-48 overflow-y-auto">
                                                <div className="flex justify-between items-center font-bold text-zinc-400 uppercase text-[10px]">
                                                    <span>Claim History ({redemptions.length})</span>
                                                    <button onClick={() => setViewingRedemptionsVoucherId(null)} className="text-zinc-500 hover:text-white">Close</button>
                                                </div>
                                                {redemptions.length === 0 ? (
                                                    <p className="text-zinc-500 italic py-1">No claims recorded yet.</p>
                                                ) : (
                                                    redemptions.map((r, i) => {
                                                        const p = players.find(player => player.id === r.playerId);
                                                        return (
                                                            <div key={r.id || i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
                                                                <div>
                                                                    <span className="font-bold text-white">{p?.name || 'Unknown'}</span>
                                                                    <span className="text-amber-400 font-mono ml-1 text-[11px]">
                                                                        ({p?.callsign || p?.playerCode || 'Operator'})
                                                                    </span>
                                                                    <p className="text-[10px] text-zinc-500">
                                                                        {new Date(r.date).toLocaleDateString()} at {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleUndoRedemption(v.id, r.id)}
                                                                    className="text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-900/50 text-[10px] font-semibold transition-colors"
                                                                    title="Undo / Revoke Claim"
                                                                >
                                                                    Undo
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                        {/* Action Bar */}
                                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                                            <div className="flex gap-1.5">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setClaimingVoucher(v)}
                                                    disabled={isDepleted}
                                                    className="text-xs bg-emerald-600 hover:bg-emerald-500 font-bold"
                                                >
                                                    Claim for Player
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => setViewingRedemptionsVoucherId(isViewingRedemptions ? null : v.id)}
                                                    className="text-xs text-zinc-300"
                                                >
                                                    {isViewingRedemptions ? 'Hide Claims' : `Claims (${redemptions.length})`}
                                                </Button>
                                            </div>

                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => setIsEditingVoucher(v)} 
                                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                                    title="Edit Voucher"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5"/>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete voucher "${v.code}"?`)) {
                                                            deleteDoc('vouchers', v.id);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-400 transition-colors"
                                                    title="Delete Voucher"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* SECTION 2: RAFFLES COMMAND & LIVE WINNER DRAW */}
            {/* ==================================================== */}
            {activeSection === 'raffles' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {raffles.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                                <TrophyIcon className="w-12 h-12 mx-auto mb-2 text-zinc-600"/>
                                <p className="font-semibold text-sm">No raffle events created yet.</p>
                                <p className="text-xs text-zinc-600 mt-1">Click "Create New Raffle" to launch a tactical gear raffle.</p>
                            </div>
                        ) : (
                            raffles.map(r => {
                                const tickets = r.tickets || [];
                                const winners = r.winners || [];
                                const isViewingTickets = viewingTicketsRaffleId === r.id;

                                return (
                                    <div 
                                        key={r.id} 
                                        className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 p-4 transition-all shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h4 className="font-bold text-base text-white">{r.name}</h4>
                                                    <p className="text-xs text-zinc-400">
                                                        Draw Date: {new Date(r.drawDate).toLocaleDateString()} • {r.location}
                                                    </p>
                                                </div>
                                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                                    r.status === 'Completed' 
                                                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                                                        : r.status === 'Active' 
                                                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800' 
                                                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                }`}>
                                                    {r.status}
                                                </span>
                                            </div>

                                            {/* Prize Showcase */}
                                            <div className="my-3 space-y-1.5 bg-black/50 p-3 rounded-lg border border-zinc-800/80">
                                                <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider">
                                                    Prizes ({r.prizes?.length || 0})
                                                </span>
                                                {r.prizes?.map((p, idx) => {
                                                    const winner = winners.find(w => w.prizeId === p.id);
                                                    const winnerPlayer = players.find(player => player.id === winner?.playerId);
                                                    return (
                                                        <div key={p.id || idx} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-amber-400 w-5">#{idx + 1}</span>
                                                                <span className="text-zinc-200">{p.name}</span>
                                                            </div>
                                                            {winnerPlayer ? (
                                                                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                                                    <span>🏆 {winnerPlayer.name}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-zinc-500">Unclaimed</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/60 px-3 py-2 rounded-lg border border-zinc-800 mb-3">
                                                <span>Total Issued Tickets: <strong className="text-white">{tickets.length}</strong></span>
                                                <span>Winners Drawn: <strong className="text-amber-400">{winners.length} / {r.prizes?.length || 0}</strong></span>
                                            </div>
                                        </div>

                                        {/* Ticket Drawer */}
                                        {isViewingTickets && (
                                            <div className="my-3 p-3 bg-black/80 rounded-lg border border-zinc-800 text-xs space-y-2 max-h-48 overflow-y-auto">
                                                <div className="flex justify-between items-center font-bold text-zinc-400 uppercase text-[10px]">
                                                    <span>Ticket Roster ({tickets.length})</span>
                                                    <button onClick={() => setViewingTicketsRaffleId(null)} className="text-zinc-500 hover:text-white">Close</button>
                                                </div>
                                                {tickets.length === 0 ? (
                                                    <p className="text-zinc-500 italic py-1">No tickets issued yet. Click "Issue Tickets" below.</p>
                                                ) : (
                                                    tickets.map((t, i) => {
                                                        const p = players.find(player => player.id === t.playerId);
                                                        return (
                                                            <div key={t.id || i} className="flex items-center justify-between py-1 border-b border-zinc-800/60 last:border-0">
                                                                <span className="font-mono text-red-400 font-bold">{t.code}</span>
                                                                <div className="text-right">
                                                                    <span className="text-white font-semibold">{p?.name || 'Operator'}</span>
                                                                    <span className="text-zinc-500 ml-1.5 text-[10px]">({t.paymentStatus})</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                        {/* Action Bar */}
                                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setDrawingRaffle(r)}
                                                    disabled={tickets.length === 0}
                                                    className="text-xs bg-amber-600 hover:bg-amber-500 text-black font-black flex items-center gap-1"
                                                >
                                                    <span>🎰</span> Run Live Draw
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => setIssuingTicketsRaffle(r)}
                                                    className="text-xs text-zinc-200"
                                                >
                                                    Issue Tickets
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => setViewingTicketsRaffleId(isViewingTickets ? null : r.id)}
                                                    className="text-xs text-zinc-400"
                                                >
                                                    {isViewingTickets ? 'Hide' : `Roster (${tickets.length})`}
                                                </Button>
                                            </div>

                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => setIsEditingRaffle(r)} 
                                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                                    title="Edit Raffle"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5"/>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete raffle "${r.name}"?`)) {
                                                            deleteDoc('raffles', r.id);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-400 transition-colors"
                                                    title="Delete Raffle"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
