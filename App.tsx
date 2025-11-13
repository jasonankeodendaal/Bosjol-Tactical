import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails } from './types';
import { BuildingOfficeIcon, ExclamationTriangleIcon } from './components/icons/Icons';
import { DataProvider, DataContext } from './data/DataContext';
import { Loader } from './components/Loader';
import { USE_FIREBASE, isFirebaseConfigured, getEnvVar, firebaseInitializationError } from './firebase';

const Footer: React.FC<{ details: CompanyDetails }> = ({ details }) => (
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
                {details.socialLinks.map(link => (
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

    if (USE_FIREBASE && !isFirebaseConfigured()) {
        const vars = [
            'VITE_USE_FIREBASE',
            'VITE_FIREBASE_API_KEY',
            'VITE_FIREBASE_AUTH_DOMAIN',
            'VITE_FIREBASE_PROJECT_ID',
            'VITE_FIREBASE_STORAGE_BUCKET',
            'VITE_FIREBASE_MESSAGING_SENDER_ID',
            'VITE_FIREBASE_APP_ID',
        ];

        const varStatus = vars.map(v => ({
            name: v,
            value: getEnvVar(v),
            isSet: !!getEnvVar(v)
        }));

        return (
            <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-8 text-center">
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-8 rounded-lg max-w-2xl">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h1 className="text-2xl font-bold mb-2 text-white">Firebase Configuration Error</h1>
                    <p className="text-base">
                        The application is configured to use Firebase, but it's not receiving the necessary environment variables to connect to your project.
                    </p>

                    <div className="text-sm mt-6 text-left bg-black/20 p-4 rounded-md">
                        <h2 className="text-lg font-bold mb-2 text-white">Environment Variable Status:</h2>
                        <ul className="space-y-1 font-mono text-xs">
                            {varStatus.map(v => (
                            <li key={v.name} className="flex justify-between items-center">
                                <span>{v.name}:</span>
                                {v.isSet ? (
                                <span className="font-bold text-green-400">✔️ SET</span>
                                ) : (
                                <span className="font-bold text-red-400">❌ NOT SET</span>
                                )}
                            </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-red-300 text-xs">
                            <strong>Action Required:</strong> Please ensure the variables marked "NOT SET" are correctly configured in your project's environment settings. The app requires at least <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_AUTH_DOMAIN</code>, and <code>VITE_FIREBASE_PROJECT_ID</code> to connect.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!auth) throw new Error("AuthContext not found.");
    if (!data) throw new Error("DataContext not found.");

    const { isAuthenticated, user, logout } = auth;
    const { 
        players, setPlayers,
        events, setEvents,
        ranks, setRanks,
        badges, setBadges,
        legendaryBadges, setLegendaryBadges,
        gamificationSettings, setGamificationSettings,
        sponsors, setSponsors,
        companyDetails, setCompanyDetails,
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
        return <LoginScreen companyDetails={companyDetails} />;
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
                        />
                    }
                </div>
            </main>
            <Footer details={companyDetails} />
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