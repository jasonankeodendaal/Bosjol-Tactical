import React, { useState } from 'react';
import type { GameEvent, Signup } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { X, QrCode, Calendar, MapPin, Clock, Users, CheckCircle, Download, Printer, Maximize2, Minimize2, Sparkles, ShieldCheck } from 'lucide-react';

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
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Encode payload into QR code
    const qrPayload = JSON.stringify({
        type: 'BOSJOL_EVENT_CHECKIN',
        eventId: event.id,
        title: event.title,
        date: event.date
    });

    const eventSignups = signups.filter(s => s.eventId === event.id);
    const checkedInCount = event.attendees ? event.attendees.length : 0;
    const totalSignupsCount = eventSignups.length + checkedInCount;

    const handleDownloadQR = () => {
        const canvas = document.querySelector('.qr-modal-container img') as HTMLImageElement;
        if (!canvas || !canvas.src) return;
        const link = document.createElement('a');
        link.href = canvas.src;
        link.download = `QR_CheckIn_${event.title.replace(/\s+/g, '_')}_${event.date}.png`;
        link.click();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />

            <div 
                className={`relative w-full transition-all duration-300 bg-zinc-950/95 border border-red-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(220,38,38,0.25)] flex flex-col overflow-hidden text-zinc-100 qr-modal-container ${
                    isFullScreen 
                        ? 'max-w-none h-full rounded-none border-none' 
                        : 'max-w-lg max-h-[90vh]'
                }`}
            >
                {/* 3D Top Accent Bar */}
                <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shadow-[0_0_15px_#ef4444]" />

                {/* Header */}
                <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-white/[0.03] backdrop-blur-md">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.3)] shrink-0">
                            <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                    Official Event Pass
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                                    ID: {event.id.slice(0, 8)}
                                </span>
                            </div>
                            <h3 className="text-xs sm:text-base font-black text-white truncate leading-tight mt-0.5">
                                {event.title}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 transition"
                            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                        >
                            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-red-950/60 hover:text-red-400 border border-white/10 text-zinc-300 transition"
                            aria-label="Minimize and Close"
                            title="Minimize & Proceed"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-center flex flex-col items-center justify-center custom-scrollbar">
                    
                    {/* Pulsing Tactical Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold tracking-wider uppercase animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Scan On-Site to Check In</span>
                    </div>

                    {/* Auto-Generated QR Code Display */}
                    <div className="relative group p-2">
                        <QRCodeDisplay 
                            value={qrPayload} 
                            size={isFullScreen ? 340 : 250}
                            className="mx-auto border-2 border-red-500/40"
                        />
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                            <span>Auto-Verified Bosjol Event Token</span>
                        </div>
                    </div>

                    {/* Event Details Overview */}
                    <div className="w-full grid grid-cols-2 gap-2 text-left bg-white/[0.03] border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span className="truncate">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{event.startTime || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-300 col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>

                    {/* Check-In Attendance Live Metric */}
                    <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/60 border border-white/10">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Users className="w-4 h-4 text-zinc-400" />
                            <span>Checked-In Attendance</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-black flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {checkedInCount} Checked In
                            </span>
                            <span className="text-xs text-zinc-500 font-bold">
                                / {totalSignupsCount} Total
                            </span>
                        </div>
                    </div>

                    {/* Instruction notice for multiple players */}
                    <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed max-w-sm">
                        Display this QR code at the field staging area. Multiple players can scan this directly using the <strong className="text-white font-bold">QR Check-In</strong> tool in their Player Dashboard.
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="p-3 sm:p-4 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadQR}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5"
                            title="Download PNG QR Image"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Save QR</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5"
                            title="Print Pass"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Print Pass</span>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                    >
                        <span>Minimize & Proceed</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
