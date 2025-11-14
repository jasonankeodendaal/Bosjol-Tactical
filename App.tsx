
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia } from './types';
import { BuildingOfficeIcon, ExclamationTriangleIcon, CodeBracketIcon } from './components/icons/Icons';
import { DataProvider, DataContext } from './data/DataContext';
import { Loader } from './components/Loader';
import { USE_FIREBASE, isFirebaseConfigured, getEnvVar, firebaseInitializationError } from './firebase';
import { FrontPage } from './components/FrontPage';
import { Modal } from './components/Modal';

const CreatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="SYSTEM CREATOR">
            <div className="hud-bg -m-6 p-6 rounded-b-xl">
                <div className="hud-corners">
                    <span />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center text-cyan-200">
                    <a href="https://ibb.co/spB8SDCX" target="_blank" rel="noopener noreferrer">
                        <img 
                            src="https://i.ibb.co/TDC9Xn1N/JSTYP-me-Logo.png" 
                            alt="JSTYP.me Logo" 
                            className="h-28 w-28 mb-4 icon-glow-cyan transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    
                    <h2 className="text-2xl font-bold text-white text-glow-cyan uppercase tracking-widest">
                        Jason's Solutions to Your Problems
                    </h2>
                    <p className="text-lg font-medium text-cyan-300">- Yes me! -</p>
                    
                    <p className="text-sm text-cyan-300 mt-6 max-w-xs">
                        Need a website, mobile app or custom tool? Get in touch!
                    </p>

                    <div className="w-1/2 h-px bg-cyan-500/30 my-6"></div>

                    <div className="flex items-start justify-center gap-12">
                        <div className="flex flex-col items-center gap-2">
                            <a 
                                href="https://wa.me/27695989427?text=Hi!%20I'm%20contacting%20you%20from%20the%20Bosjol%20Tactical%20Dashboard."
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-white transition-all duration-300 transform hover:scale-110"
                                aria-label="Contact on WhatsApp"
                            >
                                <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-14 h-14 object-contain icon-glow-cyan" />
                            </a>
                            <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">WhatsApp</p>
                            <p className="text-xs text-cyan-200">069 598 9427</p>
                        </div>
                         <div className="flex flex-col items-center gap-2">
                             <a 
                                href="mailto:jstypme@gmail.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-white transition-all duration-300 transform hover:scale-110"
                                aria-label="Send an email"
                            >
                                <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" alt="Email" className="w-14 h-14 object-contain icon-glow-cyan" />
                            </a>
                            <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">Email</p>
                             <p className="text-xs text-cyan-200">jstypme@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

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
    const [showCreatorModal, setShowCreatorModal] = useState(false);

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
        migrateToApiServer,
    } = data;
    
    const creatorButtonAndModal = (
        <>
            {showCreatorModal && <CreatorModal onClose={() => setShowCreatorModal(false)} />}
            <div className="fixed bottom-4 left-4 z-50">
                 <motion.button
                    onClick={() => setShowCreatorModal(true)}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 rounded-lg"
                    aria-label="Show app creators"
                    animate={{
                        scale: [1, 1.1, 1.05, 1.15, 1],
                        rotate: [0, -3, 3, -3, 0],
                    }}
                    transition={{
                        duration: 1,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop",
                        repeatDelay: 4,
                    }}
                    whileHover={{ scale: 1.2, rotate: 0 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <img
                        src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png"
                        alt="Bosjol Tactical Logo"
                        className="w-16 h-16 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)]"
                    />
                </motion.button>
            </div>
        </>
    );

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

    if (loading) {
        return <Loader />;
    }

    if (!isAuthenticated || !user) {
        if (showFrontPage) {
            return <>
                <FrontPage companyDetails={companyDetails} socialLinks={socialLinks} carouselMedia={carouselMedia} onEnter={() => setShowFrontPage(false)} />
                {creatorButtonAndModal}
            </>;
        }
        return <>
            <LoginScreen companyDetails={companyDetails} socialLinks={socialLinks} />
            {creatorButtonAndModal}
        </>;
    }
    
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

    const dashboardBackground = user.role === 'admin' 
        ? companyDetails.adminDashboardBackgroundUrl 
        : companyDetails.playerDashboardBackgroundUrl;

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-white">
            <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-40">
                 <div className="flex items-center">
                    <img src={companyDetails.logoUrl} alt="Logo" className="h-8 w-8 mr-3 rounded-md"/>
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
            {creatorButtonAndModal}
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