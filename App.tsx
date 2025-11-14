

import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia } from './types';
import { BuildingOfficeIcon, ExclamationTriangleIcon, AtSymbolIcon } from './components/icons/Icons';
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


const GitHubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.82c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.027 2.747-1.027.546 1.378.203 2.397.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" />
    </svg>
);

const CreatorPopup: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="Creator Information">
            <div
                className="flex flex-col items-center text-center -m-6 p-6 rounded-b-xl"
                style={{
                    backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.8)), url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'local',
                }}
            >
                <div className="relative mb-4">
                    <img src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png" alt="Creator Icon" className="h-24 w-24 rounded-full border-2 border-red-500 p-1 bg-zinc-900/50" />
                    <div className="absolute -bottom-2 -right-2 bg-zinc-800 p-1 rounded-full border border-zinc-700">
                        <img src="https://i.ibb.co/HL2Lc6Rz/file-0000000043b061f7b655a0077343e063.png" alt="Bosjol Tactical Logo" className="h-8 w-8 rounded-full" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white">J.C. De Klerk</h3>
                <p className="text-md text-red-400 font-semibold">Lead Developer & UI/UX Designer</p>
                <p className="text-sm text-gray-300 mt-4 max-w-md italic">
                    "Passionate about creating immersive and functional digital experiences. This dashboard was built with a focus on performance, usability, and a distinct tactical aesthetic."
                </p>
                <div className="mt-6 pt-6 border-t border-zinc-700/50 w-full flex justify-center gap-6">
                    <a href="mailto:bosjoltactical@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors flex flex-col items-center gap-1">
                        <AtSymbolIcon className="w-8 h-8" />
                        <span className="text-xs">Email</span>
                    </a>
                    <a href="https://wa.me/27798843232" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors flex flex-col items-center gap-1">
                        <WhatsAppIcon className="w-8 h-8" />
                        <span className="text-xs">WhatsApp</span>
                    </a>
                    <a href="https://github.com/jcdeklerk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors flex flex-col items-center gap-1">
                        <GitHubIcon className="w-8 h-8" />
                        <span className="text-xs">GitHub</span>
                    </a>
                </div>
            </div>
        </Modal>
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