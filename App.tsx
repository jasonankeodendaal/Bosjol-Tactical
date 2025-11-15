

import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia, CreatorDetails } from './types';
import { BuildingOfficeIcon, ExclamationTriangleIcon, AtSymbolIcon, XIcon, KeyIcon } from './components/icons/Icons';
import { DataProvider, DataContext, IS_LIVE_DATA } from './data/DataContext';
import { Loader } from './components/Loader';
import { USE_FIREBASE, isFirebaseConfigured, getEnvVar, firebaseInitializationError } from './firebase';
import { FrontPage } from './components/FrontPage';
import { Modal } from './components/Modal';
import { HelpSystem } from './components/Help';
import { CreatorDashboard } from './components/CreatorDashboard';
import { StorageStatusIndicator } from './components/StorageStatusIndicator';
import { MockDataWatermark } from './components/MockDataWatermark';
import { Input } from './components/Input';


// --- Creator Popup Component and Icons ---
const CreatorPopup: React.FC<{
    onClose: () => void;
    login: (email: string, pass: string) => Promise<boolean>;
}> = ({ onClose, login }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const CREATOR_EMAIL = 'jstypme@gmail.com';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const success = await login(CREATOR_EMAIL, password);
        if (success) {
            onClose();
        } else {
            setError("Invalid credentials. Please check your password and try again.");
            setIsLoading(false);
        }
    };

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
                onClick={(e) => e.stopPropagation()}
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

                <div className="flex flex-col items-center text-center p-8">
                    <img src="https://i.ibb.co/TDC9Xn1N/JSTYP-me-Logo.png" alt="JSTYP.me Logo" className="h-24 w-auto mb-3" />
                    
                    <h3 className="text-2xl font-bold text-white tracking-wider">Creator Access</h3>
                    <p className="text-sm text-red-400 font-semibold italic">"Jason's solution to your problems, Yes me!"</p>
                    
                     <form onSubmit={handleLogin} className="w-full max-w-xs mx-auto mt-6 space-y-4">
                        <Input
                            icon={<AtSymbolIcon className="w-5 h-5"/>}
                            type="email"
                            value={CREATOR_EMAIL}
                            readOnly
                            className="bg-zinc-800/50 cursor-not-allowed text-center"
                            aria-label="Creator Email"
                        />
                         <Input
                            icon={<KeyIcon className="w-5 h-5"/>}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm bg-red-900/40 border border-red-800/50 px-3 py-2 rounded-md"
                            >
                                {error}
                            </motion.div>
                        )}
                        <Button type="submit" className="w-full !py-3" disabled={isLoading}>
                            {isLoading ? 'Authenticating...' : 'Access Creator Dashboard'}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};
// --- END Creator Popup ---

const Footer: React.FC<{ 
    details: CompanyDetails, 
    socialLinks: SocialLink[],
    creatorDetails: CreatorDetails,
    onHelpClick: () => void,
    onCreatorClick: () => void,
}> = ({ details, socialLinks, creatorDetails, onHelpClick, onCreatorClick }) => (
    <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 py-2 px-4 text-center text-xs text-gray-500 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.button
                onClick={onHelpClick}
                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                className="p-2" title="Help" aria-label="Open help menu"
            >
                <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Help Icon" className="w-8 h-8 object-contain" />
            </motion.button>

            <div className="hidden sm:flex items-center gap-4">
                 {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">
                        <img src={link.iconUrl} alt={link.name} className="h-5 w-5 object-contain"/>
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-3">
                 <StorageStatusIndicator apiServerUrl={details.apiServerUrl} />
                 <motion.button
                    onClick={onCreatorClick}
                    whileHover={{ scale: 1.15, rotate: 15 }} whileTap={{ scale: 0.95 }}
                    className="p-1" title="Creator Information" aria-label="Open creator information"
                >
                    <img src="https://i.ibb.co/0phm4WG/image-removebg-preview.png" alt="Creator Icon" className="w-8 h-8 rounded-full" />
                </motion.button>
            </div>
        </div>
    </footer>
);

const AppContent: React.FC = () => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);
    const [showFrontPage, setShowFrontPage] = useState(true);
    const [showCreatorPopup, setShowCreatorPopup] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    if (!auth) throw new Error("AuthContext not found.");
    if (!data) throw new Error("DataContext not found.");
    
    const { isAuthenticated, user, login, logout, helpTopic, setHelpTopic } = auth;

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
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
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
    

    useEffect(() => {
      // Per user request, always log out on refresh to ensure the session starts
      // from the front page, preventing accidental session continuation.
      logout();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This should only run once when the app component mounts.
    
    // Inactivity logout logic
    const logoutTimer = useRef<number | null>(null);

    const resetInactivityTimer = useCallback(() => {
        if (logoutTimer.current) {
            clearTimeout(logoutTimer.current);
        }

        logoutTimer.current = window.setTimeout(() => {
            if (auth.isAuthenticated) {
                console.log("User inactive for 10 minutes. Logging out.");
                logout();
            }
        }, 10 * 60 * 1000); // 10 minutes
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
        creatorDetails,
        setCreatorDetails
    } = data;
    
    // Centralized background audio management
    useEffect(() => {
        const audioUrl = companyDetails.loginAudioUrl;

        if (!audioUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            return;
        }

        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.loop = true;
        } else if (audioRef.current.src !== audioUrl) {
            audioRef.current.src = audioUrl;
        }

        const audio = audioRef.current;
        let playPromise: Promise<void> | undefined;

        if (showFrontPage) {
            audio.pause();
        } else if (!isAuthenticated) { // Login Screen
            audio.volume = 0.5; // Louder on login
            playPromise = audio.play();
        } else { // Authenticated Dashboard
            audio.volume = 0.2; // Softer on dashboard
            playPromise = audio.play();
        }
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio autoplay was prevented by the browser.");
            });
        }

    }, [showFrontPage, isAuthenticated, companyDetails.loginAudioUrl]);


    const currentPlayer = players.find(p => p.id === user?.id);

    const handleUpdatePlayer = async (updatedPlayer: Player) => {
        await updateDoc('players', updatedPlayer);
        if (auth.user?.id === updatedPlayer.id) {
            auth.updateUser(updatedPlayer);
        }
    }

    const handleEventSignUp = async (eventId: string, requestedGearIds: string[], note: string) => {
        if (!user || user.role !== 'player') return;
        const playerId = user.id;

        const eventToUpdate = events.find(e => e.id === eventId);
        if (!eventToUpdate) return;
        
        const isSignedUp = eventToUpdate.signedUpPlayers.includes(playerId);
        const rentalSignups = eventToUpdate.rentalSignups || [];
        let updatedEvent: GameEvent;

        if (isSignedUp) { // Withdraw
            updatedEvent = {
                ...eventToUpdate,
                signedUpPlayers: eventToUpdate.signedUpPlayers.filter(id => id !== playerId),
                rentalSignups: rentalSignups.filter(s => s.playerId !== playerId)
            };
        } else { // Sign up
            updatedEvent = {
                ...eventToUpdate,
                signedUpPlayers: [...eventToUpdate.signedUpPlayers, playerId],
                rentalSignups: [...rentalSignups, { playerId, requestedGearIds, note }]
            };
        }
        await updateDoc('events', updatedEvent);
    };
    
    const handleDeleteAllData = async () => {
        if (confirm('ARE YOU ABSOLUTELY SURE? This will wipe all data except for system settings (ranks, badges, etc). This cannot be undone.')) {
            await data.deleteAllData();
            alert("All transactional data has been deleted.");
            logout();
        }
    };

    if (isSeeding) {
        return (
            <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[100]">
                <div className="w-16 h-16 border-4 border-zinc-700 border-t-red-500 rounded-full animate-spin"></div>
                <h1 className="mt-4 text-lg font-semibold text-gray-300 tracking-wider">
                    New Project Detected
                </h1>
                <p className="text-gray-400">Seeding initial database configuration. Please wait...</p>
            </div>
        );
    }

    const renderPublicContent = () => (
        <>
            {showFrontPage ? (
                <FrontPage companyDetails={companyDetails} socialLinks={socialLinks} carouselMedia={carouselMedia} onEnter={() => setShowFrontPage(false)} onCreatorClick={() => setShowCreatorPopup(true)} />
            ) : (
                <LoginScreen companyDetails={companyDetails} socialLinks={socialLinks} onCreatorClick={() => setShowCreatorPopup(true)} />
            )}
        </>
    );

    if (loading) {
        return <Loader />;
    }

    let dashboardBackground: string | undefined;
    let creatorBackgroundStyle = {};

    if(user?.role === 'creator') {
        creatorBackgroundStyle = {
             backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.85)), url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')",
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundAttachment: 'fixed',
        };
    } else if (user) {
        dashboardBackground = user.role === 'admin' 
        ? companyDetails.adminDashboardBackgroundUrl 
        : companyDetails.playerDashboardBackgroundUrl;
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-white" style={creatorBackgroundStyle}>
            <AnimatePresence>
                {showCreatorPopup && <CreatorPopup onClose={() => setShowCreatorPopup(false)} login={login} />}
            </AnimatePresence>
            <HelpSystem topic={helpTopic} isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {!isAuthenticated || !user ? (
                renderPublicContent()
            ) : (
                <>
                    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-30">
                        <div className="flex items-center">
                            <div className="mr-3">
                                <img src={companyDetails.logoUrl} alt="Logo" className="h-8 w-8 rounded-md"/>
                            </div>
                            <h1 className="text-xl font-black text-red-500 tracking-wider uppercase">
                                BOSJOL TACTICAL
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <p className="text-sm text-gray-300 mr-4 hidden sm:block">Welcome, <span className="font-bold">{user.name}</span></p>
                            <Button onClick={logout} size="sm" variant="secondary">Logout</Button>
                        </div>
                    </header>
                    <main 
                        className="flex-grow relative pb-20" // Padding bottom to avoid footer overlap
                        style={{
                            backgroundImage: dashboardBackground ? `url(${dashboardBackground})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundAttachment: 'fixed'
                        }}
                    >
                        {dashboardBackground && <div className="absolute inset-0 bg-black/50 z-0"/>}
                        <div className="relative z-10">
                            {user.role === 'player' && currentPlayer ? 
                                <PlayerDashboard 
                                    player={currentPlayer}
                                    players={players}
                                    sponsors={data.sponsors} 
                                    onPlayerUpdate={handleUpdatePlayer}
                                    events={events}
                                    onEventSignUp={handleEventSignUp}
                                    legendaryBadges={data.legendaryBadges}
                                    raffles={data.raffles}
                                    ranks={data.ranks}
                                /> : user.role === 'admin' ?
                                <AdminDashboard 
                                    // Pass all data and functions from context to AdminDashboard
                                    {...data}
                                    addPlayerDoc={(playerData) => addDoc('players', playerData)}
                                    onDeleteAllData={handleDeleteAllData}
                                /> : user.role === 'creator' ?
                                <CreatorDashboard />
                                : null
                            }
                        </div>
                    </main>
                </>
            )}
            
            <Footer 
                details={companyDetails} 
                socialLinks={socialLinks} 
                creatorDetails={creatorDetails}
                onHelpClick={() => setShowHelp(true)}
                onCreatorClick={() => setShowCreatorPopup(true)}
            />
            {!IS_LIVE_DATA && <MockDataWatermark />}
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
}

export default App;