











import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia, CreatorDetails } from './types';
import { BuildingOfficeIcon, ExclamationTriangleIcon, AtSymbolIcon, XIcon, KeyIcon, PhoneIcon } from './components/icons/Icons';
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
    creatorDetails: CreatorDetails;
}> = ({ onClose, login, creatorDetails }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const success = await login("creator", password); // Use a fixed identifier for creator PIN login
        if (success) {
            onClose();
        } else {
            setError("Invalid PIN. Please try again.");
            setIsLoading(false);
        }
    };

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

                 <div className="p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src={creatorDetails.logoUrl} alt={`${creatorDetails.name} Logo`} className="h-24 w-auto mb-3" />
                        <h3 className="text-3xl font-bold text-white tracking-wider">{creatorDetails.name}</h3>
                        <p className="text-md text-red-400 font-semibold italic mt-1">"{creatorDetails.tagline}"</p>
                    </div>
                    
                    <p className="text-center text-gray-300 text-sm mb-6 pb-6 border-b border-zinc-700/50">{creatorDetails.bio}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <a href={emailHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-red-500/50 transition-all">
                            <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" alt="Email" className="w-8 h-8"/>
                            <span className="font-semibold text-white">Email Me</span>
                        </a>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-red-500/50 transition-all">
                            <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-8 h-8"/>
                            <span className="font-semibold text-white">WhatsApp</span>
                        </a>
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                         <h4 className="text-xs text-center text-gray-500 uppercase tracking-wider font-semibold">Creator Access</h4>
                         <form onSubmit={handleLogin} className="mt-2 space-y-2">
                             <Input
                                icon={<KeyIcon className="w-4 h-4"/>}
                                type="password"
                                placeholder="PIN"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                                className="!py-1.5 text-xs"
                                inputMode="numeric"
                                pattern="\d*"
                            />
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-400 text-xs text-center bg-red-900/40 border border-red-800/50 px-3 py-1.5 rounded-md"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <Button type="submit" size="sm" className="w-full !py-1" disabled={isLoading}>
                                {isLoading ? 'Authenticating...' : 'Authenticate'}
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PublicPageFloatingIcons: React.FC<{
    socialLinks: SocialLink[],
    onHelpClick: () => void,
    onCreatorClick: () => void,
}> = ({ socialLinks, onHelpClick, onCreatorClick }) => (
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

        {/* Social Icons */}
        {socialLinks.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-700"
            >
                {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110">
                        <img src={link.iconUrl} alt={link.name} className="h-6 w-6 object-contain"/>
                    </a>
                ))}
            </motion.div>
        )}

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

const Footer: React.FC<{ details: CompanyDetails }> = ({ details }) => (
    <footer className="bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 py-3 px-4 text-xs text-gray-500 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img src={details.logoUrl} alt={details.name} className="h-8 w-auto rounded"/>
                <p className="hidden sm:block">© 2025 Bosjol Tactical Nelspruit Airsoft. All rights reserved.</p>
            </div>
            <StorageStatusIndicator apiServerUrl={details.apiServerUrl} />
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
                <FrontPage companyDetails={companyDetails} socialLinks={socialLinks} carouselMedia={carouselMedia} onEnter={() => setShowFrontPage(false)} />
            ) : (
                <LoginScreen companyDetails={companyDetails} socialLinks={socialLinks} />
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
                {showCreatorPopup && <CreatorPopup onClose={() => setShowCreatorPopup(false)} login={login} creatorDetails={creatorDetails} />}
            </AnimatePresence>
            <HelpSystem topic={helpTopic} isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {!isAuthenticated || !user ? (
                <>
                    {renderPublicContent()}
                    <PublicPageFloatingIcons 
                        socialLinks={socialLinks} 
                        onHelpClick={() => setShowHelp(true)} 
                        onCreatorClick={() => setShowCreatorPopup(true)} 
                    />
                </>
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
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-300 mr-2 hidden sm:block">Welcome, <span className="font-bold">{user.name}</span></p>
                            
                             <motion.button
                                onClick={() => setShowHelp(true)}
                                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                                className="p-1 rounded-full hover:bg-zinc-700" title="Help" aria-label="Open help menu"
                            >
                                <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Help Icon" className="w-6 h-6 object-contain" />
                            </motion.button>
                            
                            <motion.button
                                onClick={() => setShowCreatorPopup(true)}
                                whileHover={{ scale: 1.15, rotate: 15 }} whileTap={{ scale: 0.95 }}
                                className="p-1 rounded-full hover:bg-zinc-700" title="Creator Information" aria-label="Open creator information"
                            >
                                <img src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png" alt="Creator Icon" className="w-6 h-6 rounded-full" />
                            </motion.button>

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
                    <Footer details={companyDetails} />
                </>
            )}
            
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