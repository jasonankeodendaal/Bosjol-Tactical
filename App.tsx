import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { Button } from './components/Button';
// FIX: Changed RankTier to Rank and SubRank to Tier to align with type definitions.
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia, CreatorDetails, Tier, Badge, Signup, Rank, XpAdjustment } from './types';
import { XIcon, KeyIcon, ShieldCheckIcon, TrophyIcon, ArrowLeftIcon } from './components/icons/Icons';
import { DataProvider, DataContext, IS_LIVE_DATA } from './data/DataContext';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { HelpSystem } from './components/Help';
import { StorageStatusIndicator } from './components/StorageStatusIndicator';
import { MockDataWatermark } from './components/MockDataWatermark';
import { Input } from './components/Input';
import { DashboardBackground } from './components/DashboardBackground';
import { getTierForXp, getRankForPlayer } from './utils/rankUtils';
import { auth as firebaseAuth } from './firebase'; // Deprecated import kept to prevent build crash, value is null.


// --- Switched from lazy to direct imports to fix critical module loading error ---
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import FrontPage from './components/FrontPage';
import { CreatorDashboard } from './components/CreatorDashboard';
import { ThemeInjector } from './components/ThemeInjector';
import { RuleShowcaseModal } from './components/RuleShowcaseModal';
import { PromotionCelebrationModal } from './components/PromotionCelebrationModal';


// --- Creator Popup Component and Icons ---
const CreatorPopup: React.FC<{
    onClose: () => void;
    creatorDetails: CreatorDetails;
}> = ({ onClose, creatorDetails }) => {
    const creatorName = (creatorDetails?.name && creatorDetails.name.trim() !== '' && creatorDetails.name !== 'Creator')
        ? creatorDetails.name
        : "Jason's Solutions To Your Problems";

    const creatorTagline = (creatorDetails?.tagline && creatorDetails.tagline.trim() !== '')
        ? creatorDetails.tagline
        : "You think it, I build it";

    const creatorLogoUrl = (creatorDetails?.logoUrl && creatorDetails.logoUrl.trim() !== '')
        ? creatorDetails.logoUrl
        : "https://i.ibb.co/HfT2Qzz3/IMG-20260803-WA0029.jpg";

    const creatorBio = (creatorDetails?.bio && creatorDetails.bio.trim() !== '')
        ? creatorDetails.bio
        : "We specialise in custom website design & development, strategic social media marketing, bespoke digital strategy, and scalable software applications engineered to help your business expand, engage clients, and achieve sustained growth.";

    const creatorEmail = creatorDetails?.email || 'jstypme@gmail.com';
    const rawWhatsapp = creatorDetails?.whatsapp || '+27821234567';

    const clientInquiryTemplate = `Hello Jason's Solutions,

I came across your work on the Bosjol Tactical Dashboard and I'm interested in discussing a potential project.

Please see my details below:

- Project Name/Idea: 
- My Name: 
- Company Name (if applicable): 
- Services Needed (Web Design / Social Marketing / App Development): 
- Brief Description: 
- Best Contact Method: 

Thank you, I look forward to connecting.
`;

    const emailSubject = "Project Inquiry via Bosjol Tactical Dashboard";
    const emailHref = `mailto:${creatorEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(clientInquiryTemplate)}`;
    
    const whatsappNumber = rawWhatsapp.replace(/\D/g, '') || '27821234567';
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(clientInquiryTemplate)}`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[120]"
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="relative bg-zinc-950/95 border border-zinc-700/60 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.25)] w-full max-w-md overflow-hidden text-white"
                style={{
                    backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.9), rgba(10, 10, 10, 0.92)), url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Top Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />

                <button 
                    onClick={onClose} 
                    className="absolute top-3.5 right-3.5 p-1 rounded-full bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700 text-gray-400 hover:text-white transition-colors z-10" 
                    aria-label="Close creator popup"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col items-center text-center mb-4">
                        {/* Creator Logo Frame */}
                        <div className="relative mb-3 group">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
                            <img 
                                src={creatorLogoUrl} 
                                alt={`${creatorName} Logo`} 
                                className="relative w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-zinc-700/80 shadow-2xl bg-black" 
                            />
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-md">
                            {creatorName}
                        </h3>

                        {/* Slogan */}
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600/30 via-amber-500/20 to-emerald-500/20 border border-red-500/40 text-red-400 text-xs font-bold tracking-wide shadow-sm">
                            <span>✨ "{creatorTagline}" ✨</span>
                        </div>
                    </div>
                    
                    {/* Bio & Services */}
                    <div className="mb-4 pb-4 border-b border-zinc-800/80 space-y-3">
                        <p className="text-center text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium">
                            {creatorBio}
                        </p>

                        {/* Services Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                            <span className="px-2.5 py-0.5 rounded-md bg-red-600/20 border border-red-500/30 text-[10.5px] font-semibold text-red-300">🌐 Website Design</span>
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-600/20 border border-amber-500/30 text-[10.5px] font-semibold text-amber-300">📱 Social Marketing</span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600/20 border border-emerald-500/30 text-[10.5px] font-semibold text-emerald-300">⚙️ Web Apps & Systems</span>
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-600/20 border border-blue-500/30 text-[10.5px] font-semibold text-blue-300">📈 Business Expansion</span>
                        </div>
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <a 
                            href={emailHref} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-3 bg-zinc-800/90 border border-zinc-700 rounded-full hover:bg-zinc-700 hover:border-red-500/60 transition-all hover:scale-110 shadow-lg"
                            title="Email Creator"
                            aria-label="Email Creator"
                        >
                            <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" alt="Email" className="w-6 h-6 object-contain"/>
                        </a>
                        <a 
                            href={whatsappHref} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-3 bg-zinc-800/90 border border-zinc-700 rounded-full hover:bg-zinc-700 hover:border-emerald-500/60 transition-all hover:scale-110 shadow-lg"
                            title="WhatsApp Creator"
                            aria-label="WhatsApp Creator"
                        >
                            <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-6 h-6 object-contain"/>
                        </a>
                    </div>

                    <p className="text-[10px] sm:text-xs text-center text-zinc-400 uppercase tracking-wider font-semibold mb-3">
                        Professional Digital Solutions & System Architecture
                    </p>

                    <div className="pt-3 border-t border-zinc-800 flex justify-center">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md active:scale-95"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Return to Arena</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PublicPageFloatingIcons: React.FC<{
    onOpenRulesAndHelp: () => void,
    onCreatorClick: () => void,
}> = ({ onOpenRulesAndHelp, onCreatorClick }) => (
    <>
        {/* Merged Help & Tactical Rules Icon Button */}
        <motion.button
            onClick={onOpenRulesAndHelp}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-4 left-4 z-20 bg-zinc-900/80 backdrop-blur-md p-2 sm:p-2.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 hover:border-red-400 transition-all flex items-center gap-2 group"
            title="Tactical Protocols & System Help"
            aria-label="Open rules and help"
        >
            <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Rules and Help" className="w-6 h-6 sm:w-7 sm:h-7 object-contain group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline-block pr-1 text-xs font-bold text-red-400 tracking-wide">Rules & Help</span>
        </motion.button>

        {/* Creator Icon */}
        <motion.button
            onClick={onCreatorClick}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-4 right-4 z-20 bg-zinc-900/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-lg border border-zinc-700/70 hover:border-zinc-500 transition-all"
            title="Creator Information"
            aria-label="Open creator information"
        >
            <img src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png" alt="Creator Icon" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
        </motion.button>
    </>
);


// --- END Creator Popup ---

const Footer: React.FC<{ details: CompanyDetails, apiServerUrl?: string }> = ({ details, apiServerUrl }) => (
    <footer className="bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 py-3 px-4 text-xs text-gray-500 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img src={details.logoUrl} alt={details.name} className="h-8 w-auto rounded"/>
                <p className="hidden sm:block">© 2026 Bosjol Tactical Nelspruit Airsoft. All rights reserved.build by JSTYP.me</p>
            </div>
            <StorageStatusIndicator apiServerUrl={apiServerUrl} />
        </div>
        <p className="sm:hidden text-center mt-2">© 2026 Bosjol Tactical Nelspruit Airsoft. All rights reserved.build by JSTYP.me</p>
    </footer>
);


const AppContent: React.FC = () => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);
    const [showFrontPage, setShowFrontPage] = useState(true);
    const [showCreatorPopup, setShowCreatorPopup] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showRuleShowcase, setShowRuleShowcase] = useState(false);
    const [selectedRuleSetId, setSelectedRuleSetId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [promotion, setPromotion] = useState<{ newTier?: Tier; oldTier?: Tier; newBadges: Badge[], xpGained: number, currentXp: number, bonusXp: number, rewards: string[], finalXp: number } | null>(null);


    if (!auth) throw new Error("AuthContext not found.");
    if (!data) throw new Error("DataContext not found.");
    
    const { isAuthenticated, user, login, logout, helpTopic, setHelpTopic } = auth;

    useEffect(() => {
        if (isAuthenticated) {
            setShowFrontPage(false);
        }
    }, [isAuthenticated]);
    
    const { 
        players,
        events,
        companyDetails,
        socialLinks,
        carouselMedia,
        loading,
        isSeeding,
        updateDoc,
        addDoc,
        deleteDoc,
        setDoc,
        creatorDetails,
        ranks,
        signups,
        setCompanyDetails,
        logActivity,
    } = data;
    
    const currentPlayer = players.find(p => p.id === user?.id);
    const hasPerformedReset = useRef(false); // Prevent multiple runs in one session
    const sessionRef = useRef<{ id: string | null }>({ id: null });

    // FIX: Define playAudio function
    const playAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => {
                // Autoplay was prevented. This is expected behavior in some browsers.
                // We'll let the user interact to enable audio.
                console.warn("Audio autoplay prevented:", e);
            });
        }
    }, []);

    // --- SESSION MANAGEMENT FOR OBSERVABILITY ---
    const prevHelpTopicRef = useRef<string>(helpTopic);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            return;
        }

        const uid = user.id;
        sessionRef.current.id = uid;
        const sessionData = {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            currentView: helpTopic,
            lastSeen: new Date().toISOString(),
        };

        setDoc('sessions', uid, sessionData).catch(err => {
            console.warn("Session register failed (handled):", err);
        });

        const handleBeforeUnload = () => {
            if (sessionRef.current.id) {
                deleteDoc('sessions', sessionRef.current.id).catch(() => {});
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (sessionRef.current.id) {
                deleteDoc('sessions', sessionRef.current.id).catch(() => {});
                sessionRef.current.id = null;
            }
        };
    }, [isAuthenticated, user?.id, user?.name, user?.role]);

    useEffect(() => {
        // Update current view AND lastSeen timestamp only when view actually changes
        if (isAuthenticated && sessionRef.current.id && prevHelpTopicRef.current !== helpTopic) {
            prevHelpTopicRef.current = helpTopic;
            updateDoc('sessions', { 
                id: sessionRef.current.id, 
                currentView: helpTopic,
                lastSeen: new Date().toISOString()
            }).catch(err => {
                console.warn("Session update failed (handled):", err);
            });
        }
    }, [helpTopic, isAuthenticated]);


    useEffect(() => {
        const performRankReset = async () => {
            if (!companyDetails.nextRankResetDate || hasPerformedReset.current) {
                return;
            }

            const resetDate = new Date(companyDetails.nextRankResetDate);
            const today = new Date();
            // Set hours to 0 to compare dates only, ensuring the reset happens at the start of the day
            resetDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);

            if (today < resetDate) {
                return;
            }

            hasPerformedReset.current = true; // Mark that we're attempting a reset in this session
            console.log("Rank reset date reached. Performing seasonal rank reset...");

            if (confirm('A seasonal rank reset is due. All player Ranks and RP will be reset. This cannot be undone. Proceed?')) {
                // Find the lowest tier
                const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean);
                if (allTiers.length === 0) {
                    console.error("Cannot perform rank reset: No ranks configured.");
                    alert("Cannot perform rank reset: No ranks configured.");
                    hasPerformedReset.current = false; // allow retry
                    return;
                }
                const lowestTier = allTiers.sort((a, b) => a.minXp - b.minXp)[0];

                const playersToReset = players.filter(p => p.stats.xp > 0);

                if (playersToReset.length === 0) {
                    console.log("No players needed a rank reset.");
                    await setCompanyDetails(prev => ({ ...prev, nextRankResetDate: '' }));
                    alert('No players required a rank reset. Reset date has been cleared.');
                    return;
                }

                const updatedPlayers = playersToReset.map(player => ({
                    ...player,
                    stats: {
                        ...player.stats,
                        xp: 0,
                    },
                    rank: lowestTier,
                }));
                
                try {
                    const promises = updatedPlayers.map(p => updateDoc('players', p));
                    await Promise.all(promises);
                    logActivity('Performed Seasonal Rank Reset', { resetCount: updatedPlayers.length });

                    // Update the company details to clear the reset date
                    await setCompanyDetails(prev => ({ ...prev, nextRankResetDate: '' }));

                    alert(`A seasonal rank reset has occurred! ${updatedPlayers.length} players have had their Rank and RP reset.`);
                } catch (error) {
                    console.error("Failed to perform rank reset:", error);
                    alert("An error occurred during the rank reset process. Please check the console.");
                    hasPerformedReset.current = false; // allow retry on error
                }

            } else {
                 alert('Rank reset has been postponed. It will be prompted again on your next login.');
                 hasPerformedReset.current = false; // allow prompt on next login
            }
        };

        // Only run this logic for admins to prevent multiple users/clients from triggering the reset.
        if (isAuthenticated && user?.role === 'admin' && ranks.length > 0 && players.length > 0) {
            performRankReset();
        }
    }, [isAuthenticated, user?.role, companyDetails.nextRankResetDate, players.length, ranks.length]);


    const checkForPromotions = useCallback((player: Player) => {
        if (promotion || !ranks || ranks.length === 0) return;
    
        const lastSeenXp = parseInt(sessionStorage.getItem(`lastSeenXp_${player.id}`) || '0', 10);
        const lastSeenTierId = sessionStorage.getItem(`lastSeenTierId_${player.id}`);
        const lastSeenBadges: string[] = JSON.parse(sessionStorage.getItem(`lastSeenBadges_${player.id}`) || '[]');
    
        if (player.stats.xp > lastSeenXp) {
            const oldTier = lastSeenTierId ? (ranks.flatMap(r => r.tiers || []).find(t => t?.id === lastSeenTierId) || getTierForXp(lastSeenXp, ranks)) : getTierForXp(lastSeenXp, ranks);
            const newTier = getTierForXp(player.stats.xp, ranks);
            
            const newBadges = (player.badges || []).filter(b => !lastSeenBadges.includes(b.id));
    
            const hasNewTier = newTier && oldTier && (newTier.id !== oldTier.id || newTier.minXp > oldTier.minXp);
    
            if (hasNewTier || newBadges.length > 0) {
                let bonusXp = 0;
                const rewards: string[] = [];

                if (hasNewTier && newTier) {
                    (newTier.perks || []).forEach(perk => {
                        if (perk.includes('Weapon XP Card')) {
                            bonusXp += 100; // Bonus XP amount
                            rewards.push('Weapon XP Card');
                        }
                    });
                }
    
                setPromotion({ 
                    newTier: hasNewTier ? newTier : undefined, 
                    oldTier,
                    newBadges,
                    xpGained: player.stats.xp - lastSeenXp,
                    currentXp: player.stats.xp,
                    bonusXp,
                    rewards,
                    finalXp: player.stats.xp + bonusXp,
                });
            }
        }
    }, [ranks, promotion]);

    const dismissPromotion = () => {
        if (promotion && user?.role === 'player' && currentPlayer) {
            const { bonusXp, rewards, newTier } = promotion;
            
            if (bonusXp > 0 && rewards && rewards.length > 0) {
                const finalXp = currentPlayer.stats.xp + bonusXp;

                const newAdjustments: XpAdjustment[] = rewards.map(reward => ({
                    amount: 100, // Bonus for "Weapon XP Card"
                    reason: `Rank Up Reward: ${reward}`,
                    date: new Date().toISOString()
                }));

                const finalTier = getTierForXp(finalXp, ranks) || currentPlayer.rank;

                const updatedPlayer = {
                    ...currentPlayer,
                    stats: { ...currentPlayer.stats, xp: finalXp },
                    xpAdjustments: [...(currentPlayer.xpAdjustments || []), ...newAdjustments],
                    rank: finalTier,
                };
                
                updateDoc('players', updatedPlayer);
                
                sessionStorage.setItem(`lastSeenXp_${currentPlayer.id}`, String(finalXp));
                sessionStorage.setItem(`lastSeenBadges_${currentPlayer.id}`, JSON.stringify((updatedPlayer.badges || []).map(b => b.id)));
                if (finalTier) {
                    sessionStorage.setItem(`lastSeenTierId_${currentPlayer.id}`, finalTier.id);
                }
            } else {
                const finalTier = newTier || getTierForXp(currentPlayer.stats.xp, ranks) || currentPlayer.rank;
                if (finalTier && (!currentPlayer.rank || currentPlayer.rank.id !== finalTier.id)) {
                    updateDoc('players', {
                        ...currentPlayer,
                        rank: finalTier,
                    });
                }
                sessionStorage.setItem(`lastSeenXp_${currentPlayer.id}`, String(currentPlayer.stats.xp));
                sessionStorage.setItem(`lastSeenBadges_${currentPlayer.id}`, JSON.stringify((currentPlayer.badges || []).map(b => b.id)));
                if (finalTier) {
                    sessionStorage.setItem(`lastSeenTierId_${currentPlayer.id}`, finalTier.id);
                }
            }
        }
        setPromotion(null);
    };

    useEffect(() => {
        if (user?.role === 'player' && currentPlayer) {
            checkForPromotions(currentPlayer);
        }
    }, [user?.role, currentPlayer?.id, currentPlayer?.stats?.xp, checkForPromotions]);


    useEffect(() => {
        if (showFrontPage) {
            setHelpTopic('front-page');
        } else if (!isAuthenticated) {
            setHelpTopic('login-screen');
        }
    }, [showFrontPage, isAuthenticated, setHelpTopic]);

    
    // Inactivity logout logic
    const logoutTimer = useRef<number | null>(null);

    const resetInactivityTimer = useCallback(() => {
        if (logoutTimer.current) {
            clearTimeout(logoutTimer.current);
        }

        logoutTimer.current = window.setTimeout(() => {
            if (auth.isAuthenticated) {
                console.log("User inactive for 5 minutes. Logging out.");
                logout();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }, [logout, auth.isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

            activityEvents.forEach(event => {
                window.addEventListener(event, resetInactivityTimer);
            });

            resetInactivityTimer();

            return () => {
                if (logoutTimer.current) {
                    clearTimeout(logoutTimer.current);
                }
                activityEvents.forEach(event => {
                    window.removeEventListener(event, resetInactivityTimer);
                });
            };
        }
    }, [isAuthenticated, resetInactivityTimer]);

    
    // Centralized background audio management
    useEffect(() => {
        // Ensure audio element exists
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3; // Set a default, non-intrusive volume
        }
        const audio = audioRef.current;

        let targetAudioUrl: string | undefined;

        if (showFrontPage) {
            targetAudioUrl = undefined; // No audio on the front page
        } else if (!isAuthenticated) {
            targetAudioUrl = companyDetails.loginAudioUrl; // Login screen audio
        } else if (user?.role === 'player') {
            targetAudioUrl = companyDetails.playerDashboardAudioUrl; // Player dashboard audio
        } else if (user?.role === 'admin' || user?.role === 'creator') {
            targetAudioUrl = companyDetails.adminDashboardAudioUrl; // Admin/Creator dashboard audio
        }

        const handleAudioError = (e: Event) => {
            console.error("Audio Element Error:", e);
            if (audio.error) {
                console.error(`Audio error code ${audio.error.code}: ${audio.error.message}`);
            }
        };

        audio.addEventListener('error', handleAudioError);
        
        const currentSrc = audio.currentSrc;
        const isPlayingSomething = !!currentSrc && !audio.paused;

        if (targetAudioUrl) {
            // If the target is different from what's currently playing, change it.
            let absoluteTargetUrl: string;
            if (targetAudioUrl.startsWith('data:')) {
                absoluteTargetUrl = targetAudioUrl;
            } else {
                absoluteTargetUrl = new URL(targetAudioUrl, window.location.href).href;
            }

            if (currentSrc !== absoluteTargetUrl) {
                audio.src = targetAudioUrl;
                playAudio();
            } 
            // If the source is correct but playback is paused, try to play.
            else if (audio.paused) {
                playAudio();
            }
        } else {
            // If there should be no audio but something is playing, stop it.
            if (isPlayingSomething) {
                audio.pause();
                audio.src = ''; // Release resource
            }
        }
        
        return () => {
            audio.removeEventListener('error', handleAudioError);
        };
    }, [
        showFrontPage, 
        isAuthenticated, 
        user?.role, 
        companyDetails.loginAudioUrl, 
        companyDetails.playerDashboardAudioUrl, 
        companyDetails.adminDashboardAudioUrl, 
        playAudio
    ]);

    const onPlayerUpdate = async (player: Player) => {
        await updateDoc('players', player);
        logActivity('Updated Own Profile');
    };

    const onEventSignUp = async (eventId: string, requestedGearIds: string[], note: string, voteGameTypeId?: string) => {
        if (!user || user.role !== 'player') return;

        const signupId = `${eventId}_${user.id}`;
        const existingSignup = signups.find(s => s.eventId === eventId && s.playerId === user.id);
        const event = events.find(e => e.id === eventId);

        if (existingSignup) {
            // Withdraw from event
            await deleteDoc('signups', signupId);
            
            // Also remove vote if voting was enabled
            if (event?.votingEnabled && event.gameTypeVotes?.[user.id]) {
                const newVotes = { ...event.gameTypeVotes };
                delete newVotes[user.id];
                await updateDoc('events', { id: event.id, gameTypeVotes: newVotes });
            }
            logActivity(`Withdrew from event: ${event?.title}`);
        } else {
            // Sign up for event
            const newSignupData = {
                eventId,
                playerId: user.id,
                requestedGearIds,
                note,
            };
            await setDoc('signups', signupId, newSignupData);
            
            // Add vote
            if (event?.votingEnabled && voteGameTypeId) {
                const newVotes = { ...(event.gameTypeVotes || {}), [user.id]: voteGameTypeId };
                await updateDoc('events', { id: event.id, gameTypeVotes: newVotes });
            }
            logActivity(`Signed up for event: ${event?.title}`);
        }
    };


    const handleEnterFrontPage = () => {
        // Directly handle audio playback on user interaction to comply with autoplay policies
        if (audioRef.current && companyDetails.loginAudioUrl) {
            if (audioRef.current.src !== companyDetails.loginAudioUrl) {
                audioRef.current.src = companyDetails.loginAudioUrl;
            }
            // Attempt to play, but catch errors silently. The useEffect will also try to play.
            // This direct call on a user gesture is crucial for "unlocking" audio playback.
            playAudio();
        }
        setShowFrontPage(false);
        setHelpTopic('login-screen');
    };

    if (loading) {
        return <Loader logoUrl={companyDetails?.logoUrl} />;
    }
    
    return (
        <div className="bg-zinc-950 text-gray-100 font-sans min-h-screen flex flex-col antialiased">
            <ThemeInjector themeColors={companyDetails?.themeColors} />
            <AnimatePresence>
                {isSeeding && (
                    <Loader 
                        logoUrl={companyDetails?.logoUrl}
                        text="SEEDING TACTICAL DATABASE" 
                        subText="DEPLOYING INITIAL OPERATIONAL ASSETS & RANKS" 
                    />
                )}
            </AnimatePresence>

            {!IS_LIVE_DATA && <MockDataWatermark />}

            <HelpSystem topic={helpTopic} isOpen={showHelp} onClose={() => setShowHelp(false)} />
            <AnimatePresence>
                {showCreatorPopup && creatorDetails && <CreatorPopup creatorDetails={creatorDetails} onClose={() => setShowCreatorPopup(false)} />}
            </AnimatePresence>
            
            <RuleShowcaseModal 
                isOpen={showRuleShowcase} 
                onClose={() => setShowRuleShowcase(false)} 
                initialRuleSetId={selectedRuleSetId} 
            />

            <AnimatePresence>
              {promotion && <PromotionCelebrationModal promotion={promotion} onDismiss={dismissPromotion} ranks={ranks} />}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {showFrontPage ? (
                    <motion.div key="frontpage" exit={{ opacity: 0 }}>
                        <FrontPage 
                            companyDetails={companyDetails}
                            socialLinks={socialLinks}
                            carouselMedia={carouselMedia}
                            onEnter={handleEnterFrontPage}
                        />
                        <PublicPageFloatingIcons 
                            onOpenRulesAndHelp={() => { setSelectedRuleSetId(null); setShowRuleShowcase(true); }} 
                            onCreatorClick={() => setShowCreatorPopup(true)} 
                        />
                    </motion.div>
                ) : !isAuthenticated ? (
                    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <LoginScreen 
                            companyDetails={companyDetails} 
                            socialLinks={socialLinks} 
                            onBackToWelcome={() => setShowFrontPage(true)} 
                        />
                        <PublicPageFloatingIcons 
                            onOpenRulesAndHelp={() => { setSelectedRuleSetId(null); setShowRuleShowcase(true); }} 
                            onCreatorClick={() => setShowCreatorPopup(true)} 
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-grow flex flex-col relative"
                    >
                        <DashboardBackground url={user?.role === 'admin' || user?.role === 'creator' ? companyDetails.adminDashboardBackgroundUrl : companyDetails.playerDashboardBackgroundUrl} />
                        <div className="flex-grow relative z-10 flex flex-col">
                            {user?.role === 'player' && currentPlayer && (
                                <PlayerDashboard
                                    player={currentPlayer}
                                    players={players}
                                    sponsors={data.sponsors}
                                    onPlayerUpdate={onPlayerUpdate}
                                    events={events}
                                    onEventSignUp={onEventSignUp}
                                    legendaryBadges={data.legendaryBadges}
                                    raffles={data.raffles}
                                    ranks={ranks}
                                    locations={data.locations}
                                    signups={signups}
                                    onOpenInfoModal={(ruleSetId) => { setSelectedRuleSetId(ruleSetId || null); setShowRuleShowcase(true); }}
                                />
                            )}
                            {user?.role === 'admin' && (
                                <AdminDashboard
                                    {...data}
                                    onDeleteAllData={data.deleteAllData}
                                    deleteAllPlayers={data.deleteAllPlayers}
                                    addPlayerDoc={(playerData) => addDoc('players', playerData)}
                                    onOpenInfoModal={(ruleSetId) => { setSelectedRuleSetId(ruleSetId || null); setShowRuleShowcase(true); }}
                                />
                            )}
                             {user?.role === 'creator' && (
                                <CreatorDashboard
                                    {...data}
                                    setShowHelp={setShowHelp}
                                    setHelpTopic={setHelpTopic}
                                />
                            )}
                        </div>
                        
                        {!showFrontPage && isAuthenticated && <Footer details={companyDetails} apiServerUrl={companyDetails.apiServerUrl} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
          <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;