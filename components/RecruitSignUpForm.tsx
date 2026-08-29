import React, { useState, useMemo, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
    User, 
    Shield, 
    Zap, 
    Phone, 
    Mail, 
    FileText, 
    Check, 
    Sparkles, 
    X, 
    MessageSquare, 
    Crosshair,
    Calendar,
    Lock
} from 'lucide-react';
import type { CompanyDetails } from '../types';
import { DataContext } from '../data/DataContext';

interface RecruitSignUpFormProps {
    companyDetails: CompanyDetails;
    onClose: () => void;
    onSuccessLoginRedirect?: () => void;
}

export const RecruitSignUpForm: React.FC<RecruitSignUpFormProps> = ({ 
    companyDetails, 
    onClose
}) => {
    const data = useContext(DataContext);
    const [fullName, setFullName] = useState('');
    const [callsign, setCallsign] = useState('');
    const [age, setAge] = useState<string>('');
    const [idNumber, setIdNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loadout, setLoadout] = useState<'needs_rental' | 'has_gear' | 'first_timer' | 'experienced'>('needs_rental');
    const [role, setRole] = useState<'assault' | 'cqb' | 'medic' | 'marksman' | 'recon'>('assault');
    const [notes, setNotes] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const minAge = companyDetails.minimumSignupAge || 16;
    const rawContactPhone = companyDetails.phone || '+27821234567';

    // Format phone for WhatsApp wa.me link
    const formattedWhatsAppNumber = useMemo(() => {
        let digitsOnly = rawContactPhone.replace(/\D/g, '');
        if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
            return '27' + digitsOnly.substring(1);
        }
        return digitsOnly || '27821234567';
    }, [rawContactPhone]);

    const loadoutLabels = {
        needs_rental: '🛡️ Rental Gear',
        has_gear: '🔫 Own Airsoft Rifle',
        first_timer: '🎯 Novice Player',
        experienced: '⚔️ Veteran Operator'
    };

    const roleLabels = {
        assault: '🔴 Assault',
        cqb: '🔵 CQB Specialist',
        medic: '🟢 Medic',
        marksman: '🟡 Marksman',
        recon: '🟣 Recon'
    };

    // Auto-generated pre-built WhatsApp text based on form inputs
    const generatedWhatsAppMessage = useMemo(() => {
        const nameText = fullName.trim() || '[Full Name]';
        const callsignText = callsign.trim() ? `"${callsign.trim()}"` : '"[Callsign]"';
        const ageText = age ? `${age} yrs` : '[Age]';
        const idText = idNumber.trim() || '[ID/Passport]';
        const phoneText = phone.trim() || '[Phone]';
        const emailText = email.trim() || '[Email]';
        const notesText = notes.trim() || 'None';

        return `🎖️ *NEW RECRUIT ENLISTMENT DISPATCH* 🎖️
*${companyDetails.name || 'Bosjol Tactical Airsoft'}*
----------------------------------------
👤 *Name:* ${nameText}
🏷️ *Callsign:* ${callsignText}
🎂 *Age:* ${ageText} (ID: ${idText})
📱 *Phone:* ${phoneText}
📧 *Email:* ${emailText}
⚙️ *Gear Status:* ${loadoutLabels[loadout]}
🎯 *Preferred Role:* ${roleLabels[role]}
📝 *Notes:* ${notesText}
----------------------------------------
I agree to standard field regulations (Min Age: ${minAge}). Requesting Command clearance!`;
    }, [fullName, callsign, age, idNumber, phone, email, loadout, role, notes, companyDetails.name, minAge]);

    const whatsappHref = `https://wa.me/${formattedWhatsAppNumber}?text=${encodeURIComponent(generatedWhatsAppMessage)}`;

    const handleDirectRegister = async () => {
        if (!fullName.trim()) return;

        setIsSaving(true);
        try {
            if (data?.addDoc) {
                const newPlayerId = `rec_${Date.now()}`;
                await data.addDoc('players', {
                    id: newPlayerId,
                    name: fullName.trim(),
                    callsign: callsign.trim() || fullName.trim().split(' ')[0],
                    email: email.trim(),
                    phone: phone.trim(),
                    role: 'player',
                    rank: 'Rookie I',
                    xp: 0,
                    status: 'Active',
                    joinedDate: new Date().toISOString().split('T')[0],
                    notes: `Enlisted via Recruit Form. Loadout: ${loadout}, Role: ${role}. ID: ${idNumber}`
                });
            }
            setSaveSuccess(true);
            setTimeout(() => {
                setIsSaving(false);
            }, 1000);
        } catch (err) {
            console.error("Failed to register recruit in database:", err);
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden bg-black/85 backdrop-blur-xl w-full max-w-full box-border"
            onClick={onClose}
        >
            {/* Background Image / Video matching Login Screen */}
            {(() => {
                const bgUrl = companyDetails.loginBackgroundUrl;
                if (!bgUrl || typeof bgUrl !== 'string' || bgUrl.trim() === '') return null;
                const isVideo = bgUrl.startsWith('data:video') || bgUrl.includes('.mp4') || bgUrl.includes('.webm') || bgUrl.includes('.mov');
                if (isVideo) {
                    return (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none"
                            key={bgUrl}
                        >
                            <source src={bgUrl} />
                        </video>
                    );
                }
                return (
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-60 pointer-events-none"
                        style={{ backgroundImage: `url("${bgUrl}")` }}
                    />
                );
            })()}

            {/* Dark Ambient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/85 z-0 pointer-events-none" />

            {/* 3D Depth Lighting Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse z-0" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none z-0" />

            {/* Futuristic 3D Grid Overlay */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-20 z-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 70%), linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 30px 30px, 30px 30px'
                }}
            />

            {/* Main Free-View Container (Shrunk-to-fit side-by-side layout, zero overflow-x) */}
            <motion.div
                initial={{ scale: 0.94, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, y: 15, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[95vw] sm:max-w-xl my-auto p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[0_0_60px_rgba(220,38,38,0.3)] text-white overflow-hidden box-border z-10"
            >
                {/* Top Glowing Laser Edge */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-emerald-400" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-300 hover:text-white transition-transform active:scale-90 z-20"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header Title Section */}
                <div className="relative z-10 text-center mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600/30 via-red-500/20 to-emerald-500/20 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(220,38,38,0.3)] mb-1">
                        <Sparkles className="w-3 h-3 text-red-400 animate-spin" />
                        <span>Tactical Recruit Enlistment</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                        New Recruit Sign-Up Form
                    </h2>
                </div>

                {/* Main Content Area - Compact Side-by-Side Mobile Layout */}
                <form onSubmit={(e) => e.preventDefault()} className="relative z-10 space-y-2.5 max-h-[72vh] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar w-full max-w-full box-border">
                    {/* Row 1: Full Name & Callsign (Side-by-Side on Mobile!) */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-full min-w-0">
                        <div className="min-w-0">
                            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                                <User className="w-3 h-3 text-red-400 shrink-0" />
                                <span className="truncate">Full Name <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Jason A"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full min-w-0 box-border px-2.5 py-1.5 sm:py-2 rounded-xl bg-black/40 border border-white/15 focus:border-red-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                                <Crosshair className="w-3 h-3 text-red-400 shrink-0" />
                                <span className="truncate">Callsign</span>
                            </label>
                            <input
                                type="text"
                                placeholder='e.g. Maverick'
                                value={callsign}
                                onChange={(e) => setCallsign(e.target.value)}
                                className="w-full min-w-0 box-border px-2.5 py-1.5 sm:py-2 rounded-xl bg-black/40 border border-white/15 focus:border-red-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Row 2: Age, SA ID & WhatsApp Phone (Side-by-Side on Mobile!) */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full max-w-full min-w-0">
                        <div className="min-w-0">
                            <label className="block text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                                <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">Age <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="number"
                                required
                                min={minAge}
                                placeholder={`Min ${minAge}`}
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full min-w-0 box-border px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl bg-black/40 border border-white/15 focus:border-red-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                                <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="truncate">ID / Passport</span>
                            </label>
                            <input
                                type="text"
                                placeholder="SA ID"
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value)}
                                className="w-full min-w-0 box-border px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl bg-black/40 border border-white/15 focus:border-red-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">WhatsApp <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="tel"
                                required
                                placeholder="0821234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full min-w-0 box-border px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl bg-black/40 border border-white/15 focus:border-emerald-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Row 3: Email (Full Width Compact) */}
                    <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="truncate">Email Address</span>
                        </label>
                        <input
                            type="email"
                            placeholder="recruit@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-black/40 border border-white/15 focus:border-red-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner"
                        />
                    </div>

                    {/* Row 4: Gear & Equipment Status (Side-by-Side 2x2 Grid) */}
                    <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1 truncate">
                            <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Gear & Equipment Status</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {(Object.keys(loadoutLabels) as Array<keyof typeof loadoutLabels>).map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setLoadout(key)}
                                    className={`p-1.5 sm:p-2 rounded-xl text-left border transition-all flex items-center justify-between text-[11px] font-semibold ${
                                        loadout === key
                                            ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                                            : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200'
                                    }`}
                                >
                                    <span className="truncate">{loadoutLabels[key]}</span>
                                    {loadout === key && <Check className="w-3 h-3 text-red-400 shrink-0 ml-1" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Row 5: Preferred Tactical Role (Side-by-Side 3x2 Grid) */}
                    <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1 truncate">
                            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>Preferred Tactical Role</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {(Object.keys(roleLabels) as Array<keyof typeof roleLabels>).map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setRole(key)}
                                    className={`p-1.5 sm:p-2 rounded-xl text-left border transition-all flex items-center justify-between text-[10.5px] sm:text-[11px] font-semibold ${
                                        role === key
                                            ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                            : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200'
                                    }`}
                                >
                                    <span className="truncate">{roleLabels[key]}</span>
                                    {role === key && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Row 6: Additional Notes */}
                    <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-0.5 flex items-center gap-1 truncate">
                            <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>Notes / Questions for Command</span>
                        </label>
                        <textarea
                            rows={1}
                            placeholder="e.g. Attending with friend, need rental rifle..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/15 focus:border-red-500 text-white placeholder-zinc-500 text-xs font-medium transition-all shadow-inner resize-none"
                        />
                    </div>

                    {/* Single WhatsApp Action Button & Roster Option */}
                    <div className="pt-2 flex flex-col gap-2">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                if (fullName.trim()) handleDirectRegister();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] transition transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span>Send Enlistment via WhatsApp 💬</span>
                        </a>

                        {saveSuccess && (
                            <p className="text-center text-[10.5px] text-emerald-400 font-semibold">
                                ✓ Recruit enlistment saved to arena roster!
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer Standard Operating Procedures */}
                <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Min Age: <strong className="text-white">{minAge} Yrs</strong></span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white underline transition"
                    >
                        Close Form
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

