


import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia } from './types';
import { BuildingOfficeIcon, ExclamationTriangleIcon, AtSymbolIcon, XIcon } from './components/icons/Icons';
import { DataProvider, DataContext } from './data/DataContext';
import { Loader } from './components/Loader';
import { USE_FIREBASE, isFirebaseConfigured, getEnvVar, firebaseInitializationError } from './firebase';
import { FrontPage } from './components/FrontPage';
import { Modal } from './components/Modal';


// --- Creator Popup Component and Icons ---
const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.77.46 3.45 1.28 4.92L2 22l5.25-1.38c1.41.78 3.02 1.25 4.79 1.25h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM17.48 15.39c-.2-.11-1.18-.58-1.36-.65-.18-.07-.31-.07-.44.07-.13.13-.51.65-.63.78-.12.13-.24.14-.44.05-.2-.1-.85-.31-1.61-.99-.59-.53-1.02-1.18-1.14-1.38-.12-.2 0-.31.09-.41.08-.09.2-.24.3-.35.1-.12.13-.2.2-.34.06-.14.03-.27-.01-.37-.05-.1-.44-1.06-.6-1.45-.16-.39-.32-.33-.44-.34h-.24c-.13 0-.26.03-.39.16-.13.13-.51.51-.51 1.24 0 .73.53 1.44.6 1.54s1.02 1.57 2.47 2.17c1.45.6 1.45.4 1.71.38.26-.02.83-.34.95-.67.12-.33.12-.61.08-.67-.03-.06-.12-.1-.22-.16z" />
    </svg>
);

const CreatorPopup: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    // Pre-built message for email and WhatsApp
    const messageBody = `Hello JSTYP.me,

I am interested in your development services after seeing your work on the Bosjol Tactical Dashboard.

Here are my details:
- Full Name: 
- Company (if applicable): 
- Project Type (Website, Mobile App, Custom Tool, etc.): 
- Brief description of my needs: 

Looking forward to hearing from you.

Best regards,
`;
    const emailHref = `mailto:jstypme@gmail.com?subject=${encodeURIComponent('Inquiry from Bosjol Tactical Dashboard')}&body=${encodeURIComponent(messageBody)}`;
    const whatsappMessage = `Hello JSTYP.me, I'm contacting you from the Bosjol Tactical Dashboard regarding your services. Please provide the following information:\n- Full Name:\n- Company (if applicable):\n- Brief project description:\n\nThank you!`;
    const whatsappHref = `https://wa.me/27695989427?text=${encodeURIComponent(whatsappMessage)}`;

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
                className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                style={{
                    backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.85)), url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close creator popup">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center text-center p-8 pt-12">
                    <img src="https://i.ibb.co/TDC9Xn1N/JSTYP-me-Logo.png" alt="JSTYP.me Logo" className="h-28 w-auto mb-4" />
                    
                    <h3 className="text-3xl font-bold text-white tracking-wider">JSTYP.me</h3>
                    <p className="text-md text-red-400 font-semibold italic">"Jason's solution to your problems, Yes me!"</p>
                    
                    <p className="text-sm text-gray-300 mt-6 max-w-md">
                        Need a website, mobile app or custom tool get in touch today.. At Jstyp.me nothing is impossible, innovation is key and the mind is a open learning space. Here we build on what can not be done!
                    </p>
                    
                    <div className="mt-8 pt-6 border-t border-zinc-700/50 w-full flex justify-center gap-8">
                        <a href={emailHref} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors flex flex-col items-center gap-1.5 transform hover:scale-110">
                            <AtSymbolIcon className="w-9 h-9" />
                            <span className="text-xs font-semibold">Email</span>
                        </a>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors flex flex-col items-center gap-1.5 transform hover:scale-110">
                            <WhatsAppIcon className="w-9 h-9" />
                            <span className="text-xs font-semibold">WhatsApp</span>
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
// --- END Creator Popup ---


const Footer: React.FC<{ details: CompanyDetails, socialLinks: SocialLink[] }> = ({ details, socialLinks }) => (
    <footer className="bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800 p-6 text-center text-sm text-gray-400 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="flex items-center">
                 {details.logoUrl ? (
                    <img src={details.logoUrl} alt={details.name} className="h-8 mr-3" />
                ) : (
                    <BuildingOfficeIcon className="h-8 w-8 mr-3" />
                )}
                <p className="font-bold text-gray-300">{details.name}</p>
            </div>
            <div className="flex items-center gap-4">
                {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">
                        <img src={link.iconUrl} alt={link.name} className="h-6 w-6 object-contain"/>
                    </a>
                ))}
            </div>
        </div>
        <p>{details.address} | {details.phone}</p>
        <p>&copy; {new Date().getFullYear()} {details.name}. All Rights Reserved.</p>
    </footer>
);

const AppContent: React.FC = () => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);
    const [showFrontPage, setShowFrontPage] = useState(true);

    if (firebaseInitializationError) {
        return (
            <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-8 text-center">
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-8 rounded-lg max-w-2xl">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h1 className="text-2xl font-bold mb-2 text-white">Firebase Initialization Error</h1>
                    <p className="text-base mb-4">
                        The application could not connect to Firebase. This usually happens if the environment variables are set, but contain incorrect values (e.g., a typo in the Project ID).
                    </p>
                    <div className="text-sm mt-6 text-left bg-black/20 p-4 rounded-md font-mono text-xs text-red-300">
                        <h2 className="text-lg font-bold mb-2 text-white">Error Details:</h2>
                        <pre className="whitespace-pre-wrap">{firebaseInitializationError.message}</pre>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!auth) throw new Error("AuthContext not found.");
    if (!data) throw new Error("DataContext not found.");

    const { isAuthenticated, user, logout } = auth;

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
        players, setPlayers,
        events, setEvents,
        ranks, setRanks,
        badges, setBadges,
        legendaryBadges, setLegendaryBadges,
        gamificationSettings, setGamificationSettings,
        sponsors, setSponsors,
        companyDetails, setCompanyDetails,
        socialLinks, setSocialLinks,
        carouselMedia, setCarouselMedia,
        vouchers, setVouchers,
        inventory, setInventory,
        suppliers, setSuppliers,
        transactions, setTransactions,
        locations, setLocations,
        raffles, setRaffles,
        deleteAllData,
        seedInitialData,
        loading,
        isSeeding,
        updatePlayerDoc,
        addPlayerDoc,
        updateEventDoc,
    } = data;
    
    const currentPlayer = players.find(p => p.id === user?.id);

    const handleUpdatePlayer = async (updatedPlayer: Player) => {
        await updatePlayerDoc(updatedPlayer);
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
        await updateEventDoc(updatedEvent);
    };
    
    const handleDeleteAllData = async () => {
        if (confirm('ARE YOU ABSOLUTELY SURE? This will wipe all data except for system settings (ranks, badges, etc). This cannot be undone.')) {
            await deleteAllData();
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

    if (!isAuthenticated || !user) {
        if (showFrontPage) {
            return <FrontPage companyDetails={companyDetails} socialLinks={socialLinks} carouselMedia={carouselMedia} onEnter={() => setShowFrontPage(false)} />;
        }
        return <LoginScreen companyDetails={companyDetails} socialLinks={socialLinks} />;
    }

    if (loading) {
        return <Loader />;
    }

    const dashboardBackground = user.role === 'admin' 
        ? companyDetails.adminDashboardBackgroundUrl 
        : companyDetails.playerDashboardBackgroundUrl;

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-white">
            <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-40">
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
                className="flex-grow relative"
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
                            sponsors={sponsors} 
                            onPlayerUpdate={handleUpdatePlayer}
                            events={events}
                            onEventSignUp={handleEventSignUp}
                            legendaryBadges={legendaryBadges}
                            raffles={raffles}
                            ranks={ranks}
                        /> : 
                        <AdminDashboard 
                            players={players}
                            setPlayers={setPlayers}
                            events={events}
                            setEvents={setEvents}
                            ranks={ranks}
                            setRanks={setRanks}
                            badges={badges}
                            setBadges={setBadges}
                            legendaryBadges={legendaryBadges}
                            setLegendaryBadges={setLegendaryBadges}
                            gamificationSettings={gamificationSettings}
                            setGamificationSettings={setGamificationSettings}
                            sponsors={sponsors}
                            setSponsors={setSponsors}
                            companyDetails={companyDetails}
                            setCompanyDetails={setCompanyDetails}
                            socialLinks={socialLinks}
                            setSocialLinks={setSocialLinks}
                            carouselMedia={carouselMedia}
                            setCarouselMedia={setCarouselMedia}
                            vouchers={vouchers}
                            setVouchers={setVouchers}
                            inventory={inventory}
                            setInventory={setInventory}
                            suppliers={suppliers}
                            setSuppliers={setSuppliers}
                            transactions={transactions}
                            setTransactions={setTransactions}
                            locations={locations}
                            setLocations={setLocations}
                            raffles={raffles}
                            setRaffles={setRaffles}
                            onDeleteAllData={handleDeleteAllData}
                            addPlayerDoc={addPlayerDoc}
                        />
                    }
                </div>
            </main>
            <Footer details={companyDetails} socialLinks={socialLinks} />

        </div>
    );
};

const App: React.FC = () => {
    const [showCreatorPopup, setShowCreatorPopup] = useState(false);

    return (
        <AuthProvider>
            <DataProvider>
                <AppContent />
                {showCreatorPopup && <CreatorPopup onClose={() => setShowCreatorPopup(false)} />}
                 <motion.button
                    className="fixed bottom-4 left-4 z-50 p-0 bg-transparent border-none cursor-pointer"
                    onClick={() => setShowCreatorPopup(true)}
                    animate={{
                        rotate: [0, -10, 10, -10, 0, 360],
                        scale: [1, 1.1, 0.9, 1.1, 1, 1],
                        y: [0, -10, 5, -10, 0, 0],
                        x: [0, 5, -5, 5, 0, 0]
                    }}
                    transition={{
                        duration: 5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop",
                        repeatDelay: 8
                    }}
                    whileHover={{ scale: 1.3, rotate: 20 }}
                    title="Creator Icon"
                    aria-label="Open Creator Information"
                >
                    <img src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png" alt="Creator Icon" className="h-12 w-12" />
                </motion.button>
            </DataProvider>
        </AuthProvider>
    );
}

export default App;