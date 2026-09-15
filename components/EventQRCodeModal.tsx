import React from 'react';
import { createPortal } from 'react-dom';
import type { GameEvent, Signup } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { X, QrCode, Calendar, MapPin, Clock, Users, CheckCircle, Download, Printer, Sparkles, ShieldCheck } from 'lucide-react';

interface EventQRCodeModalProps {
    event: GameEvent;
    signups?: Signup[];
    onClose: () => void;
}

export const EventQRCodeModal: React.FC<EventQRCodeModalProps> = ({
    event,
    signups = [],
    onClose
}) => {
    // Encode payload into QR code
    const qrPayload = JSON.stringify({
        type: 'BOSJOL_EVENT_CHECKIN',
        eventId: event.id,
        title: event.title,
        date: event.date
    });

    const eventSignups = signups.filter(s => s.eventId === event.id);
    const checkedInPlayerIds = new Set((event.attendees || []).map(a => a.playerId));
    const checkedInCount = checkedInPlayerIds.size;
    const registeredOnlyCount = eventSignups.filter(s => !checkedInPlayerIds.has(s.playerId)).length;
    const totalSignupsCount = checkedInCount + registeredOnlyCount;

    const handleDownloadQR = () => {
        const img = document.querySelector('.qr-modal-container img') as HTMLImageElement;
        if (!img || !img.src) return;
        const link = document.createElement('a');
        link.href = img.src;
        link.download = `QR_CheckIn_${event.title.replace(/\s+/g, '_')}_${event.date}.png`;
        link.click();
    };

    const handlePrint = () => {
        window.print();
    };

    const modalContent = (
        <div 
            className="fixed inset-0 z-[99999] w-full h-[100dvh] bg-zinc-950 flex flex-col text-zinc-100 qr-modal-container overflow-hidden select-none animate-fade-in"
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

            {/* 3D Top Accent Bar */}
            <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shadow-[0_0_15px_#ef4444] shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/10 bg-zinc-900/90 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.3)] shrink-0">
                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                Official Event Pass
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono hidden xs:inline">
                                ID: {event.id.slice(0, 8)}
                            </span>
                        </div>
                        <h3 className="text-xs sm:text-base font-black text-white truncate leading-tight mt-0.5">
                            {event.title}
                        </h3>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] hover:bg-red-950/60 hover:text-red-400 border border-white/10 text-zinc-300 transition shrink-0"
                    aria-label="Close"
                    title="Close"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Main Body - Shrink to fit layout on mobile, side-by-side on desktop */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-start md:justify-center custom-scrollbar">
                
                {/* QR Code Section */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-2.5 shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-bold tracking-wider uppercase animate-pulse">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Scan On-Site to Check In</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-2">
                        <QRCodeDisplay 
                            value={qrPayload} 
                            size={220}
                            className="border-2 border-red-500/40 w-[190px] h-[190px] xs:w-[220px] xs:h-[220px] sm:w-[260px] sm:h-[260px]"
                        />
                        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-zinc-400 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            <span>Auto-Verified Bosjol Event Token</span>
                        </div>
                    </div>
                </div>

                {/* Event Details Section */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2.5 sm:space-y-4 max-w-md">
                    <div className="w-full grid grid-cols-2 gap-2 text-left bg-white/[0.03] border border-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                            <span className="truncate font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                            <span className="truncate font-medium">{event.startTime || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 col-span-2">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                            <span className="truncate font-medium">{event.location}</span>
                        </div>
                    </div>

                    {/* Check-In Attendance Live Metric */}
                    <div className="w-full flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/60 border border-white/10 gap-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0" />
                            <span className="font-medium">Attendance Check-In</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-[11px] sm:text-sm font-black flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {checkedInCount} Checked In
                            </span>
                            <span className="text-[10px] sm:text-xs text-zinc-500 font-bold">
                                / {totalSignupsCount} Total
                            </span>
                        </div>
                    </div>

                    <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed bg-red-950/20 p-2.5 sm:p-3 rounded-xl border border-red-500/10">
                        Display this QR code at the field staging area. Multiple players can scan this directly using the <strong className="text-white font-bold">QR Check-In</strong> tool in their Player Dashboard.
                    </p>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="px-3 py-2 sm:px-6 sm:py-3.5 border-t border-white/10 bg-black/70 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={handleDownloadQR}
                        className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
                        title="Download PNG QR Image"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save QR</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
                        title="Print Pass"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                >
                    <span>Close Pass</span>
                </button>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
