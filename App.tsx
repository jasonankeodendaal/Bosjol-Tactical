

import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia, CreatorDetails, Tier, Badge, Signup, Rank, XpAdjustment } from './types';
import { XIcon, KeyIcon, ShieldCheckIcon, TrophyIcon } from './components/icons/Icons';
import { DataProvider, DataContext, IS_LIVE_DATA } from './data/DataContext';
import { Loader } from './components/Loader';
import { USE_FIREBASE, isFirebaseConfigured, firebaseInitializationError } from './firebase';
import { Modal } from './components/Modal';
import { HelpSystem } from './components/Help';
import { StorageStatusIndicator } from './components/StorageStatusIndicator';
import { MockDataWatermark } from './components/MockDataWatermark';
import { Input } from './components/Input';
import { DashboardBackground } from './components/DashboardBackground';


// --- Switched from lazy to direct imports to fix critical module loading error ---
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import FrontPage from './components/FrontPage';
import { CreatorDashboard } from './components/CreatorDashboard';


// --- Creator Popup Component and Icons ---
const CreatorPopup: React.FC<{
    onClose: () => void;
    creatorDetails: CreatorDetails;
}> = ({ onClose, creatorDetails }) => {
    
    const clientInquiryTemplate = `Hello JSTYP.me,

I came across your work on the Bosjol Tactical Dashboard and I'm interested in discussing a potential project.

Please see my details below for your convenience:

- Project Name/Idea: 
- My Name: 
- Company Name (if applicable): 
- Brief Project Description: 
- Estimated Budget (Optional): 
- Best Contact Method (Email/Phone): 

Thank you, I look forward to hearing from you.
`;

    const emailSubject = "Project Inquiry via Bosjol Tactical Dashboard";
    const emailHref = `mailto:${creatorDetails.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(clientInquiryTemplate)}`;
    
    const whatsappNumber = creatorDetails.whatsapp.replace(/\D/g, '');
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(clientInquiryTemplate)}`;


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]"
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{
                    backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.85)), url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close creator popup">
                    <XIcon className="w-6 h-6" />
                </button>

                 <div className="p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src={creatorDetails.logoUrl} alt={`${creatorDetails.name} Logo`} className="h-24 w-auto mb-3" />
                        <h3 className="text-3xl font-bold text-white tracking-wider">{creatorDetails.name}</h3>
                        <p className="text-md text-red-400 font-semibold italic mt-1">"{creatorDetails.tagline}"</p>
                    </div>
                    
                    <p className="text-center text-gray-300 text-sm mb-6 pb-6 border-b border-zinc-700/50">{creatorDetails.bio}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <a href={emailHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-red-500/50 transition-all">
                            <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" alt="Email" className="w-8 h-8"/>
                            <span className="font-semibold text-white">Email Me</span>
                        </a>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-red-500/50 transition-all">
                            <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-8 h-8"/>
                            <span className="font-semibold text-white">WhatsApp</span>
                        </a>
                    </div>
                     <p className="text-xs text-center text-gray-500 uppercase tracking-wider font-semibold">Creator Access via Login Screen</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PublicPageFloatingIcons: React.FC<{
    onHelpClick: () => void,
    onCreatorClick: () => void,
}> = ({ onHelpClick, onCreatorClick }) => (
    <>
        {/* Help Icon */}
        <motion.button
            onClick={onHelpClick}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, rotate: -15 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-5 left-5 z-20 bg-zinc-900/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-zinc-700"
            title="Help"
            aria-label="Open help menu"
        >
            <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Help Icon" className="w-10 h-10" />
        </motion.button>

        {/* Creator Icon */}
        <motion.button
            onClick={onCreatorClick}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-5 right-5 z-20 bg-zinc-900/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-zinc-700"
            title="Creator Information"
            aria-label="Open creator information"
        >
            <img src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png" alt="Creator Icon" className="w-10 h-10" />
        </motion.button>
    </>
);


// --- END Creator Popup ---

const PromotionModal: React.FC<{
    promotion: { newTier?: Tier; oldTier?: Tier; newBadges: Badge[], xpGained: number, currentXp: number, bonusXp: number, rewards: string[], finalXp: number },
    onDismiss: () => void;
    ranks: Rank[];
}> = ({ promotion, onDismiss, ranks }) => {

    const { oldTier, newTier, xpGained, bonusXp, rewards, finalXp } = promotion;
    
    // Recalculate progression for display based on the final XP (current + bonus)
    const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean).sort((a, b) => a.minXp - b.minXp);
    const finalTierAfterBonus = [...allTiers].reverse().find(r => finalXp >= r.minXp);
    const finalTierIndex = allTiers.findIndex(r => r.id === finalTierAfterBonus?.id);
    const nextTierAfterBonus = finalTierIndex !== -1 && finalTierIndex < allTiers.length - 1 ? allTiers[finalTierIndex + 1] : null;

    const startXp = oldTier?.minXp || 0;
    const endXp = nextTierAfterBonus ? nextTierAfterBonus.minXp : finalXp;
    const progressPercentage = endXp > startXp ? ((finalXp - startXp) / (endXp - startXp)) * 100 : 100;

    return (
        <div className="promotion-backdrop" onClick={onDismiss}>
            <motion.div 
                className="promotion-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="rank-display-grid">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0, transition:{ delay: 0.2 }}} className="rank-item previous">
                        {oldTier && <>
                            <img src={oldTier.iconUrl} alt={oldTier.name} className="w-20 h-20" />
                            <p>{oldTier.name}</p>
                        </>}
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1, transition:{ delay: 0, type: 'spring', stiffness: 150 }}} className="rank-item current">
                       {newTier && <>
                            <div className="rank-item-hex">
                               <img src={newTier.iconUrl} alt={newTier.name} />
                            </div>
                            <p>{newTier.name}</p>
                        </>}
                    </motion.div>

                    <div className="rank-item next">{/* Placeholder for next rank if needed */}</div>
                </div>

                {newTier && <h2 className="rank-item-header">Tier Up</h2>}

                <div className="xp-bar-container">
                    <div className="xp-bar-info">
                        <span className="xp-earned">Match RP +{xpGained}</span>
                        {newTier && <span className="rank-up-tag">TIER UP</span>}
                        <span className="xp-values">{finalXp.toLocaleString()} / {nextTierAfterBonus ? nextTierAfterBonus.minXp.toLocaleString() : 'MAX'}{!nextTierAfterBonus && '+'}</span>
                    </div>
                    <div className="xp-bar-track">
                         <motion.div 
                            className="xp-bar-fill" 
                            initial={{ width: '0%'}}
                            animate={{ width: `${progressPercentage}%`}}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>
                
                {bonusXp > 0 && rewards.length > 0 && (
                     <div className="promotion-rewards">
                        <h3 className="promotion-rewards__title">Tier Up Rewards</h3>
                        {rewards.map((reward, index) => (
                             <div key={index} className="reward-item">
                                <span>{reward}</span>
                                <span className="reward-item__amount">+100 RP</span>
                            </div>
                        ))}
                    </div>
                )}


                {promotion.newBadges.length > 0 && (
                    <div className="mt-4 w-full max-w-md">
                        <h3 className="font-semibold text-gray-300 mb-2">Achievements Unlocked</h3>
                        <div className="space-y-2">
                            {promotion.newBadges.map(badge => (
                                <div key={badge.id} className="bg-zinc-800/50 p-2 rounded-lg flex items-center gap-3 border border-zinc-700">
                                    <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" />
                                    <div className="text-left">
                                        <p className="font-bold text-white text-sm">{badge.name}</p>
                                        <p className="text-xs text-gray-400">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                <p className="tap-to-continue">Tap to continue</p>
            </motion.div>
        </div>
    );
};


const Footer: React.FC<{ details: CompanyDetails, apiServerUrl?: string }> = ({ details, apiServerUrl }) => (
    <footer className="bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 py-3 px-4 text-xs text-gray-500 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img src={details.logoUrl} alt={details.name} className="h-8 w-auto rounded"/>
                <p className="hidden sm:block">© 2025 Bosjol Tactical Nelspruit Airsoft. All rights reserved.</p>
            </div>
            <StorageStatusIndicator apiServerUrl={apiServerUrl} />
        </div>
        <p className="sm:hidden text-center mt-2">© 2025 Bosjol Tactical Nelspruit Airsoft. All rights reserved.</p>
    </footer>
);


const AppContent: React.FC = () => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);
    const [showFrontPage, setShowFrontPage] = useState(true);
    const [showCreatorPopup, setShowCreatorPopup] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [promotion, setPromotion] = useState<{ newTier?: Tier; oldTier?: Tier; newBadges: Badge[], xpGained: number, currentXp: number, bonusXp: number, rewards: string[], finalXp: number } | null>(null);


    if (!auth) throw new Error("AuthContext not found.");
    if (!data) throw new Error("DataContext not found.");
    
    const { isAuthenticated, user, login, logout, helpTopic, setHelpTopic } = auth;
    
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
    } = data;
    
    const currentPlayer = players.find(p => p.id === user?.id);

    const checkForPromotions = useCallback((player: Player) => {
        if (promotion || !ranks || ranks.length === 0) return;
    
        const lastSeenXp = parseInt(localStorage.getItem(`lastSeenXp_${player.id}`) || '0', 10);
        const lastSeenTierId = localStorage.getItem(`lastSeenTierId_${player.id}`);
        const lastSeenBadges: string[] = JSON.parse(localStorage.getItem(`lastSeenBadges_${player.id}`) || '[]');
    
        if (player.stats.xp > lastSeenXp) {
            const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean).sort((a, b) => b.minXp - a.minXp);
            
            const getTierForXp = (xp: number): Tier | undefined => allTiers.find(r => xp >= r.minXp);
            
            const oldTier = lastSeenTierId ? allTiers.find(r => r.id === lastSeenTierId) : getTierForXp(lastSeenXp);
            const newTier = getTierForXp(player.stats.xp);
            
            const newBadges = player.badges.filter(b => !lastSeenBadges.includes(b.id));
    
            const hasNewTier = newTier && oldTier && newTier.id !== oldTier.id;
    
            if (hasNewTier || newBadges.length > 0) {
                 let bonusXp = 0;
                const rewards: string[] = [];

                if (hasNewTier && newTier) {
                    newTier.perks.forEach(perk => {
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
            const { bonusXp, rewards } = promotion;
            
            if (bonusXp > 0 && rewards && rewards.length > 0) {
                const finalXp = currentPlayer.stats.xp + bonusXp;

                const newAdjustments: XpAdjustment[] = rewards.map(reward => ({
                    amount: 100, // Hardcoded bonus for "Weapon XP Card"
                    reason: `Rank Up Reward: ${reward}`,
                    date: new Date().toISOString()
                }));

                const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean).sort((a, b) => b.minXp - a.minXp);
                const finalTier = allTiers.find(r => finalXp >= r.minXp) || currentPlayer.rank;

                const updatedPlayer = {
                    ...currentPlayer,
                    stats: { ...currentPlayer.stats, xp: finalXp },
                    xpAdjustments: [...currentPlayer.xpAdjustments, ...newAdjustments],
                    rank: finalTier,
                };
                
                updateDoc('players', updatedPlayer);
                
                localStorage.setItem(`lastSeenXp_${currentPlayer.id}`, String(finalXp));
                localStorage.setItem(`lastSeenBadges_${currentPlayer.id}`, JSON.stringify(updatedPlayer.badges.map(b => b.id)));
                if (finalTier) {
                    localStorage.setItem(`lastSeenTierId_${currentPlayer.id}`, finalTier.id);
                }
            } else {
                 localStorage.setItem(`lastSeenXp_${currentPlayer.id}`, String(currentPlayer.stats.xp));
                 localStorage.setItem(`lastSeenBadges_${currentPlayer.id}`, JSON.stringify(currentPlayer.badges.map(b => b.id)));
                 if (currentPlayer.rank) {
                    localStorage.setItem(`lastSeenTierId_${currentPlayer.id}`, currentPlayer.rank.id);
                 }
            }
        }
        setPromotion(null);
    };

    useEffect(() => {
        if (user?.role === 'player' && currentPlayer) {
            checkForPromotions(currentPlayer);
        }
    }, [user, currentPlayer, checkForPromotions]);


    useEffect(() => {
        if (showFrontPage) {
            setHelpTopic('front-page');
        } else if (!isAuthenticated) {
            setHelpTopic('login-screen');
        }
    }, [showFrontPage, isAuthenticated, setHelpTopic]);

    if (USE_FIREBASE && !isFirebaseConfigured()) {
        return (
             <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-8 text-center">
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-8 rounded-lg max-w-2xl">
                    <XIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h1 className="text-2xl font-bold mb-2 text-white">Firebase Not Configured</h1>
                    <p className="text-base">
                        The application is set to use Firebase (<code className="bg-black/20 px-1 rounded">VITE_USE_FIREBASE=true</code>), but the necessary Firebase configuration variables are missing. Please set them up in your environment.
                    </p>
                </div>
            </div>
        )
    }


    if (firebaseInitializationError) {
        // Fallback to mock data is handled by DataContext, just show the UI
        console.error("Firebase Initialization Error:", firebaseInitializationError.message);
    }
    
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

        const playAudio = async () => {
            try {
                if (audio.src) { // Only play if there's a source
                    await audio.play();
                }
            } catch (err) {
                // This error is common if the user hasn't interacted with the page yet.
                // It will be attempted again on user interaction in handleEnterFrontPage.
                console.warn("Audio play was prevented by the browser:", err);
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
    }, [showFrontPage, isAuthenticated, user, companyDetails]);

    const onPlayerUpdate = async (player: Player) => {
        await updateDoc('players', player);
    };

    const onEventSignUp = async (eventId: string, requestedGearIds: string[], note: string) => {
        if (!user || user.role !== 'player') return;

        const signupId = `${eventId}_${user.id}`;
        const existingSignup = signups.find(s => s.id === signupId);

        if (existingSignup) {
            // Withdraw from event
            await deleteDoc('signups', signupId);
        } else {
            // Sign up for event
            const newSignupData = {
                eventId,
                playerId: user.id,
                requestedGearIds,
                note,
            };
            await setDoc('signups', signupId, newSignupData);
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
            audioRef.current.play().catch(e => {
                console.warn("Audio autoplay unlock attempt was blocked by browser. This is sometimes expected.", e);
            });
        }
        setShowFrontPage(false);
        setHelpTopic('login-screen');
    };

    if (loading) {
        return <Loader />;
    }
    
    return (
        <div className="bg-zinc-950 text-gray-100 font-sans min-h-screen flex flex-col antialiased">
            <AnimatePresence>
                {isSeeding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[100]"
                    >
                        <Loader />
                        <p className="text-lg font-semibold text-gray-300 tracking-wider">Seeding initial database configuration...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!IS_LIVE_DATA && <MockDataWatermark />}

            <HelpSystem topic={helpTopic} isOpen={showHelp} onClose={() => setShowHelp(false)} />
            <AnimatePresence>
                {showCreatorPopup && creatorDetails && <CreatorPopup creatorDetails={creatorDetails} onClose={() => setShowCreatorPopup(false)} />}
            </AnimatePresence>
            
            <AnimatePresence>
              {promotion && <PromotionModal promotion={promotion} onDismiss={dismissPromotion} ranks={ranks} />}
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
                         <PublicPageFloatingIcons onHelpClick={() => setShowHelp(true)} onCreatorClick={() => setShowCreatorPopup(true)} />
                    </motion.div>
                ) : !isAuthenticated ? (
                    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <LoginScreen companyDetails={companyDetails} socialLinks={socialLinks} />
                        <PublicPageFloatingIcons onHelpClick={() => setShowHelp(true)} onCreatorClick={() => setShowCreatorPopup(true)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-grow flex flex-col relative isolate"
                    >
                        <DashboardBackground url={user?.role === 'admin' ? companyDetails.adminDashboardBackgroundUrl : companyDetails.playerDashboardBackgroundUrl} />
                        <div className="flex-grow bg-black/50 backdrop-blur-sm">
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
                                />
                            )}
                            {user?.role === 'admin' && (
                                <AdminDashboard
                                    {...data}
                                    onDeleteAllData={data.deleteAllData}
                                    deleteAllPlayers={data.deleteAllPlayers}
                                    addPlayerDoc={(playerData) => addDoc('players', playerData)}
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