import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { GameEvent, Player, Signup, EventAttendee } from '../types';
import { X, Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Calendar, Clock, Sparkles, Upload, ArrowRight, Check, CreditCard, Coins, Database } from 'lucide-react';

interface EventQRScannerModalProps {
    player: Player;
    events: GameEvent[];
    signups: Signup[];
    onClose: () => void;
    onCheckInSuccess?: (eventId: string, attendee: EventAttendee) => void;
    updateDoc: <T extends { id: string }>(collectionName: string, doc: Partial<T> & { id: string }) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    setDoc?: (collectionName: string, docId: string, data: object) => Promise<void>;
}

export const EventQRScannerModal: React.FC<EventQRScannerModalProps> = ({
    player,
    events,
    signups,
    onClose,
    onCheckInSuccess,
    updateDoc,
    deleteDoc
}) => {
    const [scanning, setScanning] = useState<boolean>(true);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [processedEvent, setProcessedEvent] = useState<{
        event: GameEvent;
        status: 'SUCCESS_NEW' | 'SUCCESS_ALREADY' | 'SIGNED_UP_NOW';
        timestamp: string;
    } | null>(null);
    const [manualEventId, setManualEventId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [pendingEventId, setPendingEventId] = useState<string | null>(null);

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerDivId = 'bosjol-player-qr-reader';

    const upcomingEvents = events.filter(e => e.status === 'Upcoming' || e.status === 'In Progress');

    const handleScannedEventId = (eventId: string) => {
        const targetEvent = events.find(e => e.id === eventId);
        if (!targetEvent) {
            setCameraError(`Event token invalid or event #${eventId} not found.`);
            return;
        }

        const currentAttendees = targetEvent.attendees || [];
        const existingAttendee = currentAttendees.find(a => a.playerId === player.id);
        if (existingAttendee) {
            // Already checked in, complete directly so they see the checked in screen
            executeCheckIn(eventId, existingAttendee.paymentStatus);
            return;
        }

        // Prompt player to select payment method
        setPendingEventId(eventId);
    };

    // Function to handle event check-in logic
    const executeCheckIn = async (eventId: string, selectedPaymentStatus: PaymentStatus = 'Unpaid') => {
        const targetEvent = events.find(e => e.id === eventId);
        if (!targetEvent) {
            setCameraError(`Event token invalid or event #${eventId} not found.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const currentAttendees = targetEvent.attendees || [];
            const existingAttendee = currentAttendees.find(a => a.playerId === player.id);

            // Find existing signup if any
            const existingSignup = signups.find(s => s.eventId === eventId && s.playerId === player.id);

            if (existingAttendee) {
                // Already checked in
                setProcessedEvent({
                    event: targetEvent,
                    status: 'SUCCESS_ALREADY',
                    timestamp: new Date().toLocaleTimeString()
                });
                setIsSubmitting(false);
                return;
            }

            // Create attendee record
            const newAttendee: EventAttendee = {
                playerId: player.id,
                paymentStatus: selectedPaymentStatus,
                rentedGearIds: existingSignup?.requestedGearIds || [],
                note: existingSignup?.note || 'Checked in via Field QR Scanner',
            };

            const updatedAttendees = [...currentAttendees, newAttendee];

            // Update database event attendees
            await updateDoc('events', {
                id: targetEvent.id,
                attendees: updatedAttendees
            });

            // If player was in signups, delete doc from signups collection
            if (existingSignup) {
                await deleteDoc('signups', existingSignup.id);
            }

            if (onCheckInSuccess) {
                onCheckInSuccess(targetEvent.id, newAttendee);
            }

            setProcessedEvent({
                event: { ...targetEvent, attendees: updatedAttendees },
                status: existingSignup ? 'SUCCESS_NEW' : 'SIGNED_UP_NOW',
                timestamp: new Date().toLocaleTimeString()
            });

            // Play tactile vibration / audio tone if supported
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }

        } catch (err: any) {
            console.error('Check-in processing error:', err);
            setCameraError('Failed to record check-in. Please try again or notify admin.');
        } finally {
            setIsSubmitting(false);
            setPendingEventId(null);
        }
    };

    // Initialize scanner
    useEffect(() => {
        let isMounted = true;

        const startScanner = async () => {
            try {
                // Wait for element to render
                await new Promise(r => setTimeout(r, 200));
                const element = document.getElementById(scannerDivId);
                if (!element) return;

                const qrScanner = new Html5Qrcode(scannerDivId);
                html5QrCodeRef.current = qrScanner;

                const config = {
                    fps: 15,
                    qrbox: { width: 230, height: 230 }
                };

                await qrScanner.start(
                    { facingMode: 'environment' },
                    config,
                    async (decodedText) => {
                        if (!isMounted) return;

                        // Stop scanning once a payload is captured
                        try {
                            await qrScanner.stop();
                        } catch (e) {
                            // ignore stop error
                        }
                        setScanning(false);

                        // Decode QR payload
                        let eventId = decodedText;
                        try {
                            const parsed = JSON.parse(decodedText);
                            if (parsed && parsed.eventId) {
                                eventId = parsed.eventId;
                            }
                        } catch (e) {
                            // Plain string fallback
                            if (decodedText.startsWith('BOSJOL_EVENT:')) {
                                eventId = decodedText.replace('BOSJOL_EVENT:', '');
                            }
                        }

                        handleScannedEventId(eventId);
                    },
                    () => {
                        // ignore scanning frame errors
                    }
                );
                setCameraError(null);
            } catch (err: any) {
                console.warn('Camera scanner initialization issue:', err);
                if (isMounted) {
                    setScanning(false);
                    setCameraError('Camera access unavailable or blocked by browser permissions.');
                }
            }
        };

        if (scanning && !processedEvent && !pendingEventId) {
            startScanner();
        }

        return () => {
            isMounted = false;
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, [scanning, processedEvent, pendingEventId]);

    const handleResetScanner = () => {
        setProcessedEvent(null);
        setCameraError(null);
        setPendingEventId(null);
        setScanning(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const html5QrCode = new Html5Qrcode(scannerDivId);
            const decodedText = await html5QrCode.scanFile(file, true);
            let eventId = decodedText;
            try {
                const parsed = JSON.parse(decodedText);
                if (parsed && parsed.eventId) eventId = parsed.eventId;
            } catch (err) {
                if (decodedText.startsWith('BOSJOL_EVENT:')) {
                    eventId = decodedText.replace('BOSJOL_EVENT:', '');
                }
            }
            handleScannedEventId(eventId);
        } catch (err) {
            setCameraError('Could not find a valid Bosjol Event QR Code in the uploaded image.');
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualEventId) return;
        handleScannedEventId(manualEventId);
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-hidden">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="relative w-full max-w-md bg-zinc-950/95 border border-red-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(220,38,38,0.25)] flex flex-col overflow-hidden text-zinc-100 max-h-[92vh]">
                
                {/* 3D Top Accent Bar */}
                <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 shadow-[0_0_15px_#ef4444]" />

                {/* Header */}
                <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-white/[0.03] backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.3)]">
                            <Camera className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                Field Scanner
                            </span>
                            <h3 className="text-xs sm:text-sm font-black text-white leading-tight mt-0.5">
                                Player Event QR Check-In
                            </h3>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-red-950/60 hover:text-red-400 border border-white/10 text-zinc-300 transition"
                        aria-label="Close Scanner"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-center custom-scrollbar">
                    
                    {/* PENDING PAYMENT SELECTION VIEW */}
                    {pendingEventId ? (
                        <div className="py-2 space-y-4 text-left animate-scale-up">
                            <div className="text-center pb-2 border-b border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                </div>
                                <h4 className="text-sm font-black text-white">Payment Method Verification</h4>
                                <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                                    Before starting the game, choose the payment method used for this event entry.
                                </p>
                            </div>

                            <div className="space-y-2.5">
                                <button
                                    onClick={() => executeCheckIn(pendingEventId, 'Paid (Card)')}
                                    className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all duration-200 group flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-zinc-100 group-hover:text-emerald-400 transition">Card Payment</div>
                                        <div className="text-[10px] text-zinc-400">Paid via speedpoint card reader on-site</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                                </button>

                                <button
                                    onClick={() => executeCheckIn(pendingEventId, 'Paid (Cash)')}
                                    className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all duration-200 group flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                                        <Coins className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-zinc-100 group-hover:text-emerald-400 transition">Cash on Field</div>
                                        <div className="text-[10px] text-zinc-400">Paid in cash directly to the field marshal</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                                </button>

                                <button
                                    onClick={() => executeCheckIn(pendingEventId, 'Paid (EFT)')}
                                    className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all duration-200 group flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-zinc-100 group-hover:text-emerald-400 transition">EFT / Bank Transfer</div>
                                        <div className="text-[10px] text-zinc-400">Paid via bank transfer or QR code scan</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                                </button>

                                <button
                                    onClick={() => executeCheckIn(pendingEventId, 'Unpaid')}
                                    className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-left transition-all duration-200 group flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-zinc-300 group-hover:text-red-400 transition">Unpaid (Pay Later)</div>
                                        <div className="text-[10px] text-zinc-500">Record check-in now but keep fee outstanding</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-400 group-hover:translate-x-0.5 transition" />
                                </button>
                            </div>

                            <button
                                onClick={() => setPendingEventId(null)}
                                className="w-full mt-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition text-center"
                            >
                                Back to Scanner
                            </button>
                        </div>
                    ) : processedEvent ? (
                        <div className="py-4 space-y-4 animate-scale-up">
                            {/* Checkmark Badge */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                            </div>

                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {processedEvent.status === 'SUCCESS_ALREADY' ? 'Already Checked In' : 'Check-In Confirmed'}
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-white mt-2">
                                    {processedEvent.event.title}
                                </h3>
                                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                                    Operative: <strong className="text-red-400">{player.callsign || player.name}</strong>
                                </p>
                            </div>

                            {/* Event Metadata Card */}
                            <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl text-left space-y-2 backdrop-blur-md">
                                <div className="flex items-center justify-between text-xs text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-red-400" />
                                        <span>{new Date(processedEvent.event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{processedEvent.timestamp}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-300">
                                    <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                                    <span className="truncate">{processedEvent.event.location}</span>
                                </div>
                                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                                    <span className="text-zinc-400">Status</span>
                                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Verified On Field
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    onClick={handleResetScanner}
                                    className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Scan Another QR Code</span>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition"
                                >
                                    Done & Return to Dashboard
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* SCANNING VIEW */
                        <div className="space-y-4">
                            
                            {/* Live Viewfinder Frame */}
                            <div className="relative mx-auto w-full max-w-[280px] h-[280px] bg-black/80 rounded-2xl border-2 border-dashed border-red-500/50 overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                                <div id={scannerDivId} className="w-full h-full object-cover" />

                                {scanning && !cameraError && (
                                    <>
                                        {/* Animated Laser Scanning Beam */}
                                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-[pulse_1.5s_infinite] top-1/2 -translate-y-1/2 pointer-events-none" />
                                        
                                        {/* Corner Crosshairs */}
                                        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-red-500 rounded-tl-lg pointer-events-none" />
                                        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-red-500 rounded-tr-lg pointer-events-none" />
                                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-red-500 rounded-bl-lg pointer-events-none" />
                                        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-red-500 rounded-br-lg pointer-events-none" />
                                    </>
                                )}

                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 z-20">
                                        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                                        <p className="text-xs font-bold text-white">Verifying Check-In...</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-zinc-400">
                                Point your camera at the <strong className="text-white">Event Check-In QR Code</strong> displayed by field staff.
                            </p>

                            {/* Camera Fallbacks & Manual Check-In */}
                            {cameraError && (
                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
                                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>Camera Note</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-300 leading-snug">
                                        {cameraError}
                                    </p>
                                </div>
                            )}

                            {/* Alternate Option 1: Upload QR Image */}
                            <div className="pt-2 border-t border-white/10 text-left space-y-2">
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                    Option A: Upload QR Image from Device
                                </label>
                                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-200 cursor-pointer transition font-medium">
                                    <Upload className="w-4 h-4 text-red-400" />
                                    <span>Select QR Screenshot / Photo</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileUpload} 
                                        className="hidden" 
                                    />
                                </label>
                            </div>

                            {/* Alternate Option 2: Quick Event Selector */}
                            <form onSubmit={handleManualSubmit} className="border-t border-white/10 pt-3 text-left space-y-2">
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                    Option B: Direct Select Field Event
                                </label>
                                <div className="flex gap-1.5">
                                    <select
                                        value={manualEventId}
                                        onChange={(e) => setManualEventId(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                                    >
                                        <option value="">Select Event to Check In...</option>
                                        {upcomingEvents.map(ev => (
                                            <option key={ev.id} value={ev.id}>
                                                {ev.title} ({new Date(ev.date).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={!manualEventId || isSubmitting}
                                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                                    >
                                        <span>Check In</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
