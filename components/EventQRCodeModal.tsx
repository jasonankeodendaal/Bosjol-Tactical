import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { GameEvent, Signup } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import QRCode from 'qrcode';
import { X, QrCode, Calendar, MapPin, Clock, Users, CheckCircle, Download, Printer, Sparkles, ShieldCheck, Image as ImageIcon, Loader2 } from 'lucide-react';

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

    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printQrDataUrl, setPrintQrDataUrl] = useState<string | null>(null);

    // 1. Standalone High-Res QR Code PNG Download (Blob URL - immune to iframe data-URI blocking)
    const handleDownloadQR = async () => {
        try {
            setIsDownloading(true);
            const dataUrl = await QRCode.toDataURL(qrPayload, {
                width: 1024,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H'
            });

            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QR_Code_${event.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${event.date}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        } catch (err) {
            console.error('Failed to download QR code image:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    // 2. Full Tactical Event Pass Card Download (Canvas-generated graphic card with event details & QR)
    const handleDownloadPassCard = async () => {
        try {
            setIsDownloading(true);
            const canvas = document.createElement('canvas');
            canvas.width = 900;
            canvas.height = 1200;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Background
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, 900, 1200);

            // Subtle tactical border
            ctx.strokeStyle = '#27272a';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, 860, 1160);

            // Top banner gradient
            const grad = ctx.createLinearGradient(0, 0, 900, 0);
            grad.addColorStop(0, '#dc2626');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#dc2626');
            ctx.fillStyle = grad;
            ctx.fillRect(20, 20, 860, 14);

            // Card header
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 22px monospace';
            ctx.fillText('BOSJOL AIRSOFT // OFFICIAL EVENT PASS', 50, 75);

            // Event Title
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 38px sans-serif';
            ctx.fillText(event.title.slice(0, 36), 50, 130);

            // Date & Time
            ctx.fillStyle = '#d4d4d8';
            ctx.font = '600 24px sans-serif';
            const dateStr = new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            ctx.fillText(`${dateStr} • ${event.startTime || 'TBD'}`, 50, 175);

            // Location
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '500 22px sans-serif';
            ctx.fillText(`📍 ${event.location || 'Tactical Staging Area'}`, 50, 215);

            // Generate high-resolution QR
            const qrDataUrl = await QRCode.toDataURL(qrPayload, {
                width: 580,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H'
            });

            const qrImg = new Image();
            await new Promise<void>((resolve, reject) => {
                qrImg.onload = () => resolve();
                qrImg.onerror = reject;
                qrImg.src = qrDataUrl;
            });

            // White rounded frame for QR code
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(160, 265, 580, 580, 24);
            ctx.fill();
            ctx.drawImage(qrImg, 160, 265, 580, 580);

            // Card footer details
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText('SCAN ON-SITE FOR COMBAT CHECK-IN', 450, 900);

            ctx.fillStyle = '#a1a1aa';
            ctx.font = '600 20px monospace';
            ctx.fillText(`PASS TOKEN ID: ${event.id.toUpperCase()}`, 450, 945);

            ctx.fillStyle = '#71717a';
            ctx.font = '18px sans-serif';
            ctx.fillText(`ATTENDANCE: ${checkedInCount} CHECKED IN  •  ${totalSignupsCount} REGISTERED`, 450, 985);

            ctx.fillStyle = '#52525b';
            ctx.font = '16px sans-serif';
            ctx.fillText('Authorized Bosjol Tactical Operations Platform', 450, 1130);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Event_Pass_${event.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${event.date}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 2000);
            }, 'image/png');
        } catch (err) {
            console.error('Failed to download pass card:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    // 3. High-Contrast Ink-Friendly Printable Event Pass
    const handlePrint = async () => {
        try {
            const dataUrl = await QRCode.toDataURL(qrPayload, {
                width: 600,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H'
            });

            setPrintQrDataUrl(dataUrl);
            setIsPrinting(true);
            document.body.classList.add('printing-report');

            setTimeout(() => {
                window.print();
                setTimeout(() => {
                    setIsPrinting(false);
                    document.body.classList.remove('printing-report');
                }, 800);
            }, 200);
        } catch (err) {
            console.error('Failed to prepare print pass:', err);
            setIsPrinting(false);
            document.body.classList.remove('printing-report');
        }
    };

    const printablePassContent = isPrinting && (
        <div id="printable-report" className="p-8 font-sans text-black bg-white max-w-2xl mx-auto border-2 border-black">
            <div className="border-b-4 border-black pb-4 text-center">
                <h1 className="text-3xl font-black uppercase tracking-wider">Bosjol Airsoft</h1>
                <h2 className="text-xl font-bold uppercase mt-1">Official Event Check-In Pass</h2>
            </div>

            <div className="my-6 text-center">
                <h3 className="text-2xl font-black">{event.title}</h3>
                <p className="text-base font-semibold mt-1">
                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {event.startTime ? ` • Starting @ ${event.startTime}` : ''}
                </p>
                <p className="text-base mt-1"><strong>Location:</strong> {event.location}</p>
                <p className="text-sm font-mono mt-1 text-gray-700">Token ID: {event.id}</p>
            </div>

            {printQrDataUrl && (
                <div className="flex flex-col items-center justify-center my-6">
                    <div className="p-4 border-4 border-black inline-block bg-white">
                        <img src={printQrDataUrl} alt="Event Check-In QR Code" className="w-64 h-64 block" />
                    </div>
                    <p className="text-sm font-bold uppercase mt-3 tracking-wider">Scan On-Site With Bosjol Player App</p>
                </div>
            )}

            <div className="border-t-2 border-b-2 border-gray-400 py-3 my-4 flex justify-around text-center text-sm">
                <div>
                    <span className="font-bold block">Current Attendance</span>
                    <span>{checkedInCount} Checked In</span>
                </div>
                <div>
                    <span className="font-bold block">Total Registered</span>
                    <span>{totalSignupsCount} Players</span>
                </div>
                <div>
                    <span className="font-bold block">Game Fee</span>
                    <span>R{event.gameFee?.toFixed(2) || '0.00'}</span>
                </div>
            </div>

            <div className="text-xs text-gray-600 mt-6 border-t border-gray-300 pt-3 flex justify-between">
                <span>Printed on {new Date().toLocaleString()}</span>
                <span>Bosjol Airsoft Field Operations</span>
            </div>
        </div>
    );

    const modalContent = (
        <>
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
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <button
                            onClick={handleDownloadQR}
                            disabled={isDownloading}
                            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                            title="Download Standalone PNG QR Code"
                        >
                            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-red-400" />}
                            <span>Save QR</span>
                        </button>

                        <button
                            onClick={handleDownloadPassCard}
                            disabled={isDownloading}
                            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                            title="Download Full Event Pass Image Card"
                        >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden xs:inline">Save Pass Card</span>
                            <span className="xs:hidden">Pass Card</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5"
                            title="Print Clean High-Contrast Pass"
                        >
                            <Printer className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Print</span>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 shrink-0"
                    >
                        <span>Close Pass</span>
                    </button>
                </div>
            </div>

            {/* Printable Container Portal */}
            {isPrinting && document.getElementById('printable-report-container') && createPortal(
                printablePassContent,
                document.getElementById('printable-report-container')!
            )}
        </>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
