import React, { useState } from 'react';
import type { InventoryItem, PaymentStatus, CheckInStatus, EventAttendee, Signup } from '../types';
import { X, UserPlus, Shield, Phone, Tag, CreditCard, Crosshair, Check } from 'lucide-react';

interface AddGuestPlayerModalProps {
    eventId: string;
    inventory: InventoryItem[];
    onClose: () => void;
    onAddGuest: (guestAttendee: EventAttendee, isPendingSignup?: boolean) => Promise<void>;
}

export const AddGuestPlayerModal: React.FC<AddGuestPlayerModalProps> = ({
    eventId,
    inventory,
    onClose,
    onAddGuest
}) => {
    const [guestName, setGuestName] = useState('');
    const [guestCallsign, setGuestCallsign] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');
    const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>('checked_in');
    const [selectedGearIds, setSelectedGearIds] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rentalItems = inventory.filter(i => i.isRental);

    const toggleGearSelection = (gearId: string) => {
        setSelectedGearIds(prev => 
            prev.includes(gearId) ? prev.filter(id => id !== gearId) : [...prev, gearId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim()) {
            alert('Please enter guest full name.');
            return;
        }

        setIsSubmitting(true);
        try {
            const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const finalCallsign = guestCallsign.trim() || `GUEST-${guestName.trim().split(' ')[0]}`;

            const guestAttendee: EventAttendee = {
                playerId: guestId,
                isGuest: true,
                guestName: guestName.trim(),
                guestCallsign: finalCallsign,
                guestPhone: guestPhone.trim(),
                paymentStatus,
                rentedGearIds: selectedGearIds,
                note: note.trim(),
                checkInStatus,
            };

            await onAddGuest(guestAttendee, checkInStatus === 'pending');
            onClose();
        } catch (err) {
            console.error('Failed to add guest player:', err);
            alert('Error adding guest player. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 to-zinc-900 border-b border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                                Add Guest Player (No Account)
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Register walk-in or temporary operator without profile creation
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Guest Name & Callsign */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                Guest Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                Callsign / Alias
                            </label>
                            <input
                                type="text"
                                value={guestCallsign}
                                onChange={e => setGuestCallsign(e.target.value)}
                                placeholder="e.g. GUEST-Shadow"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-purple-400" />
                            Phone / Contact Number
                        </label>
                        <input
                            type="text"
                            value={guestPhone}
                            onChange={e => setGuestPhone(e.target.value)}
                            placeholder="e.g. 082 123 4567"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Initial Attendance Status */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                            Attendance / Check-In Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'checked_in', label: 'Checked In', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' },
                                { id: 'pending', label: 'Signed Up (Pending)', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
                                { id: 'no_show', label: 'No Show', color: 'bg-amber-600/30 text-amber-300 border-amber-500/50' }
                            ].map(st => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setCheckInStatus(st.id as CheckInStatus)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                                        checkInStatus === st.id
                                            ? `${st.color} shadow-sm ring-1 ring-white/20`
                                            : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                            Payment Status
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'Paid (Cash)', label: 'Cash' },
                                { id: 'Paid (Card)', label: 'Card' },
                                { id: 'Paid (EFT)', label: 'EFT' },
                                { id: 'Unpaid', label: 'Unpaid' }
                            ].map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPaymentStatus(p.id as PaymentStatus)}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                                        paymentStatus === p.id
                                            ? 'bg-purple-600 text-white border-purple-400 shadow'
                                            : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rental Requisitions */}
                    {rentalItems.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                                Rented Armory Requisitions ({selectedGearIds.length} selected)
                            </label>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                                {rentalItems.map(item => {
                                    const isSelected = selectedGearIds.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleGearSelection(item.id)}
                                            className={`w-full text-left p-2 rounded flex items-center justify-between text-xs border transition-all ${
                                                isSelected
                                                    ? 'bg-purple-950/40 border-purple-500/50 text-white font-bold'
                                                    : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                    isSelected ? 'bg-purple-600 border-purple-400' : 'border-zinc-700 bg-zinc-900'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span>{item.name}</span>
                                            </div>
                                            <span className="font-mono text-purple-300">R{item.salePrice}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                            Notes / Remarks
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="e.g. Walk-in guest player, brought own safety goggles"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-900/40 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Guest Player</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
