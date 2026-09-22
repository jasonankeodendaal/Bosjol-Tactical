import React, { useState } from 'react';
import type { GameEvent, Player, InventoryItem, Signup } from '../types';
import { X, UserPlus, Phone, Shield, Crosshair, Check, Database, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { SupabaseSyncSqlModal } from './SupabaseSyncSqlModal';

interface PlayerGuestSignupModalProps {
    event: GameEvent;
    player: Player;
    inventory: InventoryItem[];
    onClose: () => void;
    onSaveGuestSignup: (signup: Signup) => Promise<void>;
    existingGuestSignup?: Signup;
}

export const PlayerGuestSignupModal: React.FC<PlayerGuestSignupModalProps> = ({
    event,
    player,
    inventory,
    onClose,
    onSaveGuestSignup,
    existingGuestSignup
}) => {
    const [guestName, setGuestName] = useState(existingGuestSignup?.guestName || '');
    const [guestCallsign, setGuestCallsign] = useState(existingGuestSignup?.guestCallsign || '');
    const [guestPhone, setGuestPhone] = useState(existingGuestSignup?.guestPhone || '');
    const [guestEmail, setGuestEmail] = useState(existingGuestSignup?.guestEmail || '');
    const [emergencyContact, setEmergencyContact] = useState(existingGuestSignup?.emergencyContact || '');
    const [selectedGearIds, setSelectedGearIds] = useState<string[]>(existingGuestSignup?.requestedGearIds || []);
    const [note, setNote] = useState(existingGuestSignup?.note || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSqlModal, setShowSqlModal] = useState(false);

    // Available rental equipment for this event
    const rentalItems = inventory.filter(i => i.isRental);

    const toggleGearSelection = (gearId: string) => {
        setSelectedGearIds(prev =>
            prev.includes(gearId) ? prev.filter(id => id !== gearId) : [...prev, gearId]
        );
    };

    // Calculate total costs for guest player
    const fieldFee = event.gameFee || 0;
    const rentalCost = selectedGearIds.reduce((sum, id) => {
        const item = inventory.find(i => i.id === id);
        return sum + (item?.salePrice || 0);
    }, 0);
    const guestTotalCost = fieldFee + rentalCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim()) {
            alert('Please enter your guest player\'s full name.');
            return;
        }

        setIsSubmitting(true);
        try {
            const guestId = existingGuestSignup?.id || `guest_${event.id}_${player.id}_${Date.now()}`;
            const guestPlayerId = existingGuestSignup?.playerId || `guest_usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const finalCallsign = guestCallsign.trim() || `GUEST-${guestName.trim().split(' ')[0]}`;

            const guestSignupData: Signup = {
                id: guestId,
                eventId: event.id,
                playerId: guestPlayerId,
                hostPlayerId: player.id,
                hostPlayerName: player.name ? `${player.name} (${player.callsign || 'Operator'})` : player.email,
                isGuest: true,
                guestName: guestName.trim(),
                guestCallsign: finalCallsign,
                guestPhone: guestPhone.trim(),
                guestEmail: guestEmail.trim(),
                emergencyContact: emergencyContact.trim(),
                requestedGearIds: selectedGearIds,
                note: note.trim(),
                operatorNote: note.trim(),
                playerName: guestName.trim(),
                playerCallsign: finalCallsign,
                paymentStatus: existingGuestSignup?.paymentStatus || 'Unpaid',
                checkInStatus: existingGuestSignup?.checkInStatus || 'pending',
                signedUpAt: existingGuestSignup?.signedUpAt || new Date().toISOString()
            };

            await onSaveGuestSignup(guestSignupData);
            onClose();
        } catch (err) {
            console.error('Error saving guest signup:', err);
            alert('Failed to register guest player. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-black border-b border-amber-500/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                                {existingGuestSignup ? 'Edit Guest Registration' : 'Bring a Friend / Guest Registration'}
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Event: <strong className="text-amber-300">{event.title}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowSqlModal(true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            title="View Supabase SQL Snippet"
                        >
                            <Database className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Supabase SQL</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Host Player Banner */}
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Registering Guest under Host Operator:</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">
                            {player.callsign || player.name}
                        </span>
                    </div>

                    {/* Guest Name & Callsign */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                Guest Full Name <span className="text-amber-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="e.g. Michael Scott"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                Guest Callsign / Tactical Alias
                            </label>
                            <input
                                type="text"
                                value={guestCallsign}
                                onChange={e => setGuestCallsign(e.target.value)}
                                placeholder="e.g. GUEST-Ranger"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Phone & Emergency Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-amber-400" />
                                Guest Contact Number
                            </label>
                            <input
                                type="text"
                                value={guestPhone}
                                onChange={e => setGuestPhone(e.target.value)}
                                placeholder="e.g. +27 82 123 4567"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                Emergency Contact Number
                            </label>
                            <input
                                type="text"
                                value={emergencyContact}
                                onChange={e => setEmergencyContact(e.target.value)}
                                placeholder="e.g. Guardian Name (+27...)"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Guest Rental Equipment Configuration */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                                Configure Guest Rental Package ({selectedGearIds.length} item{selectedGearIds.length === 1 ? '' : 's'})
                            </label>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                Armory Stock Available
                            </span>
                        </div>

                        {rentalItems.length === 0 ? (
                            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                                No specific rental packages set up for this match. Guest can use personal gear or request on-site.
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-black/60 border border-zinc-800 rounded-xl">
                                {rentalItems.map(item => {
                                    const isSelected = selectedGearIds.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleGearSelection(item.id)}
                                            className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs border transition-all ${
                                                isSelected
                                                    ? 'bg-amber-950/40 border-amber-500/50 text-white font-bold'
                                                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                    isSelected ? 'bg-amber-500 border-amber-400' : 'border-zinc-700 bg-zinc-900'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 text-black font-bold" />}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{item.name}</div>
                                                    {item.category && <div className="text-[10px] text-zinc-500 font-mono">{item.category}</div>}
                                                </div>
                                            </div>
                                            <span className="font-mono text-amber-400 font-bold">R{item.salePrice.toFixed(2)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Guest Notes */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            Guest Notes / Special Requirements
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="e.g. Needs left-handed rifle, first-time player..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    {/* Cost Summary Breakdown */}
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>Guest Total Due On Event Day</span>
                        </div>
                        <div className="space-y-1 text-xs text-zinc-300">
                            <div className="flex justify-between items-center">
                                <span>Guest Field Game Fee:</span>
                                <span className="font-mono text-zinc-200">R{fieldFee.toFixed(2)}</span>
                            </div>
                            {rentalCost > 0 && (
                                <div className="flex justify-between items-center">
                                    <span>Guest Equipment Rentals:</span>
                                    <span className="font-mono text-zinc-200">R{rentalCost.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1.5 border-t border-amber-500/20 text-sm font-black text-white">
                                <span>Guest Total Payable On-Site:</span>
                                <span className="font-mono text-amber-400 text-base">R{guestTotalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowSqlModal(true)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                    >
                        <Database className="w-3.5 h-3.5" />
                        <span>Supabase SQL Snippet</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{existingGuestSignup ? 'Update Guest' : 'Register Guest Player'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Supabase SQL Snippet Modal */}
            <SupabaseSyncSqlModal
                isOpen={showSqlModal}
                onClose={() => setShowSqlModal(false)}
                eventId={event.id}
                eventTitle={event.title}
                sampleGuestData={{
                    id: `guest_${event.id}_${player.id}_${Date.now()}`,
                    eventId: event.id,
                    hostPlayerId: player.id,
                    hostPlayerName: player.name || player.callsign,
                    isGuest: true,
                    guestName: guestName || 'Michael Scott',
                    guestCallsign: guestCallsign || 'GUEST-Ranger',
                    guestPhone: guestPhone || '+27 82 123 4567',
                    requestedGearIds: selectedGearIds,
                    note: note || 'Guest bringing friend for skirmish',
                    paymentStatus: 'Unpaid',
                    checkInStatus: 'pending',
                    signedUpAt: new Date().toISOString()
                }}
            />
        </div>
    );
};
