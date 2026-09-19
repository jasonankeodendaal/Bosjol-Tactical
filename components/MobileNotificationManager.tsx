import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    BellRing, 
    BellOff, 
    CheckCircle2, 
    AlertTriangle, 
    Smartphone, 
    ShieldAlert, 
    Sparkles, 
    Ticket, 
    Trophy, 
    Calendar,
    Send,
    HelpCircle,
    Share2,
    PlusSquare,
    Radio
} from 'lucide-react';
import { 
    isNotificationSupported, 
    getNotificationPermission, 
    requestNotificationPermission, 
    sendTestNotification, 
    getNotificationPreferences, 
    saveNotificationPreferences, 
    isIOSDevice, 
    isStandaloneMode,
    NotificationPreferences 
} from '../utils/notificationService';

interface MobileNotificationManagerProps {
    variant?: 'full' | 'compact' | 'card' | 'banner';
    onClose?: () => void;
}

export const MobileNotificationManager: React.FC<MobileNotificationManagerProps> = ({ 
    variant = 'card',
    onClose 
}) => {
    const [supported, setSupported] = useState<boolean>(true);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
    const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
    const [requesting, setRequesting] = useState<boolean>(false);

    useEffect(() => {
        setSupported(isNotificationSupported());
        setPermission(getNotificationPermission());
        setIsIOS(isIOSDevice());
        setIsStandalone(isStandaloneMode());
    }, []);

    const handleRequestPermission = async () => {
        setRequesting(true);
        try {
            const res = await requestNotificationPermission();
            setPermission(res);
            if (res === 'granted') {
                // Trigger a welcoming confirmation notification
                await sendTestNotification();
                setTestSuccess(true);
                setTimeout(() => setTestSuccess(null), 4000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRequesting(false);
        }
    };

    const handleSendTest = async () => {
        setIsTesting(true);
        setTestSuccess(null);
        try {
            const success = await sendTestNotification();
            setTestSuccess(success);
            setTimeout(() => setTestSuccess(null), 4000);
        } catch (err) {
            console.error(err);
            setTestSuccess(false);
        } finally {
            setIsTesting(false);
        }
    };

    const handleTogglePref = (key: keyof NotificationPreferences) => {
        const updated = saveNotificationPreferences({ [key]: !prefs[key] });
        setPrefs(updated);
    };

    // Compact Banner for Dashboard Header / Alert Bar
    if (variant === 'banner') {
        if (permission === 'granted') return null;

        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-900/90 to-zinc-950 border border-red-500/40 p-3.5 sm:p-4 shadow-[0_10px_25px_rgba(220,38,38,0.2)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 flex-shrink-0 animate-pulse">
                            <BellRing className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                                    Enable Mobile Combat & Raffle Alerts
                                </h4>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-300">
                                    <Radio className="w-2.5 h-2.5 animate-ping text-red-400" />
                                    OFFLINE / MUTED
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 mt-0.5">
                                Receive live raffle draw updates, victory alerts, match countdowns, and promotions directly on your mobile device.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {isIOS && !isStandalone ? (
                            <button
                                onClick={() => setShowIOSGuide(true)}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Smartphone className="w-4 h-4" />
                                iOS Setup Guide
                            </button>
                        ) : (
                            <button
                                onClick={handleRequestPermission}
                                disabled={requesting}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 border border-red-400/40"
                            >
                                <Bell className="w-4 h-4" />
                                {requesting ? 'Activating...' : 'Enable Mobile Notifications'}
                            </button>
                        )}
                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="p-2 text-zinc-500 hover:text-zinc-300 text-xs rounded-lg hover:bg-zinc-800 transition"
                                title="Dismiss banner"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* iOS Modal inside banner */}
                {showIOSGuide && (
                    <IOSInstructionModal onClose={() => setShowIOSGuide(false)} />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Panel Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-950 to-zinc-900 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md">
                            {permission === 'granted' ? (
                                <BellRing className="w-5 h-5 text-emerald-400" />
                            ) : permission === 'denied' ? (
                                <BellOff className="w-5 h-5 text-red-400" />
                            ) : (
                                <Bell className="w-5 h-5 text-amber-400" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                                    Mobile & Push Notification Relay
                                </h3>
                                {permission === 'granted' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                                    </span>
                                ) : permission === 'denied' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> BLOCKED
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold">
                                        PERMISSION NEEDED
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Real-time system notifications and haptic vibrations for live raffles, combat promotions, and operations.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {permission !== 'granted' && (
                            <button
                                onClick={handleRequestPermission}
                                disabled={requesting}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-red-900/30 flex items-center gap-1.5 border border-red-500/40"
                            >
                                <Bell className="w-3.5 h-3.5" />
                                {requesting ? 'Authorizing...' : 'Allow Mobile Notifications'}
                            </button>
                        )}
                        {permission === 'granted' && (
                            <button
                                onClick={handleSendTest}
                                disabled={isTesting}
                                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5 text-red-400" />
                                {isTesting ? 'Transmitting...' : 'Send Test Notification'}
                            </button>
                        )}
                        {isIOS && !isStandalone && (
                            <button
                                onClick={() => setShowIOSGuide(true)}
                                className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                iOS Instructions
                            </button>
                        )}
                    </div>
                </div>

                {/* Test Feedback Toast / Notice */}
                {testSuccess === true && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Tactical alert transmitted successfully! Your mobile device should vibrate and display the notification now.</span>
                    </div>
                )}
                {testSuccess === false && (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>Could not dispatch notification. Verify device system settings or browser notification permissions.</span>
                    </div>
                )}

                {/* Permission Blocked Guide */}
                {permission === 'denied' && (
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-red-300 text-xs flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Notifications are currently blocked by your browser/device.</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                Tap the padlock / tune icon in your browser address bar or check device App Settings to change Notifications to "Allow".
                            </p>
                        </div>
                    </div>
                )}

                {/* Notification Channel Preferences Toggles */}
                <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Tactical Notification Channels
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Live Raffles */}
                        <div 
                            onClick={() => handleTogglePref('liveRaffles')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                prefs.liveRaffles 
                                    ? 'bg-amber-950/20 border-amber-800/60 shadow-sm' 
                                    : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                                    <Ticket className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Live Raffle Draws & Wins</p>
                                    <p className="text-[10px] text-zinc-400">Alerts when drum spins and winning prizes</p>
                                </div>
                            </div>
                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${prefs.liveRaffles ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${prefs.liveRaffles ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        {/* Event Reminders */}
                        <div 
                            onClick={() => handleTogglePref('eventReminders')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                prefs.eventReminders 
                                    ? 'bg-red-950/20 border-red-800/60 shadow-sm' 
                                    : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Event Briefings & Countdowns</p>
                                    <p className="text-[10px] text-zinc-400">T-minus 24h, 1h and game start reminders</p>
                                </div>
                            </div>
                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${prefs.eventReminders ? 'bg-red-600' : 'bg-zinc-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${prefs.eventReminders ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        {/* Rank Promotions */}
                        <div 
                            onClick={() => handleTogglePref('rankPromotions')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                prefs.rankPromotions 
                                    ? 'bg-emerald-950/20 border-emerald-800/60 shadow-sm' 
                                    : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Rank & Combat Promotions</p>
                                    <p className="text-[10px] text-zinc-400">Immediate push when rank increases</p>
                                </div>
                            </div>
                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${prefs.rankPromotions ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${prefs.rankPromotions ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        {/* Badge Commendations */}
                        <div 
                            onClick={() => handleTogglePref('badgeUnlocks')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                prefs.badgeUnlocks 
                                    ? 'bg-purple-950/20 border-purple-800/60 shadow-sm' 
                                    : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Badge Commendation Unlocks</p>
                                    <p className="text-[10px] text-zinc-400">Alerts when new badges/medals are unlocked</p>
                                </div>
                            </div>
                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${prefs.badgeUnlocks ? 'bg-purple-600' : 'bg-zinc-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${prefs.badgeUnlocks ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* iOS Guide Modal */}
            {showIOSGuide && (
                <IOSInstructionModal onClose={() => setShowIOSGuide(false)} />
            )}
        </div>
    );
};

export const IOSInstructionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-5 sm:p-6 shadow-2xl space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-white">
                        <Smartphone className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base font-bold uppercase tracking-wider">
                            iOS (iPhone / iPad) Notifications
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white p-1 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                    Apple iOS 16.4+ requires web apps to be added to your Home Screen before mobile notifications can be received.
                </p>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            1
                        </div>
                        <div className="text-xs text-zinc-300">
                            <p className="font-bold text-white flex items-center gap-1.5">
                                Tap the Safari Share button <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                Located in the bottom toolbar of Safari on iPhone (or top right on iPad).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            2
                        </div>
                        <div className="text-xs text-zinc-300">
                            <p className="font-bold text-white flex items-center gap-1.5">
                                Tap "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                Scroll down the share menu and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            3
                        </div>
                        <div className="text-xs text-zinc-300">
                            <p className="font-bold text-white flex items-center gap-1.5">
                                Launch from Home Screen & Enable <Bell className="w-3.5 h-3.5 text-red-400 inline" />
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                Open the Bosjol app icon from your phone's home screen, then tap <strong>Enable Mobile Notifications</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition"
                >
                    Got It
                </button>
            </div>
        </div>
    );
};
