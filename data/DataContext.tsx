import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { USE_FIREBASE, db, firebaseInitializationError } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, Rank, Tier, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails } from '../types';
import { AuthContext } from '../auth/AuthContext';

export const IS_LIVE_DATA = USE_FIREBASE && !!db && !firebaseInitializationError;

// Helper to fetch collection data
function useCollection<T extends {id: string}>(collectionName: string, mockData: T[], dependencies: any[] = [], options: { isProtected?: boolean } = {}) {
    const [data, setData] = useState<T[]>(IS_LIVE_DATA ? [] : mockData);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (IS_LIVE_DATA) {
            if (options.isProtected && !auth?.isAuthenticated) {
                setData([]); // Clear data for protected collections if not authenticated
                setLoading(false);
                return; // Stop here, don't attempt to fetch
            }

            setLoading(true);
            const q = db.collection(collectionName);
            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const newItems: T[] = [];
                querySnapshot.forEach((doc) => {
                    newItems.push({ id: doc.id, ...doc.data() } as unknown as T);
                });

                setData(prevItems => {
                    // Sort by ID to ensure consistent order for stringify comparison
                    const sortById = (a: T, b: T) => a.id.localeCompare(b.id);
                    const sortedPrev = [...prevItems].sort(sortById);
                    const sortedNew = [...newItems].sort(sortById);

                    if (JSON.stringify(sortedPrev) === JSON.stringify(sortedNew)) {
                        return prevItems; // Data is the same, return previous state to prevent re-render
                    }
                    return newItems; // Data has changed, update state
                });

                setLoading(false);
            }, (error) => {
                console.error(`Error fetching ${collectionName}: `, error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setData(mockData);
            setLoading(false);
        }
    // Add auth?.isAuthenticated to dependency array to refetch on login/logout
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.isAuthenticated, ...dependencies]);

    return [data, setData, loading] as const;
}

// Helper to fetch a single document
function useDocument<T>(collectionName: string, docId: string, mockData: T) {
    const [data, setData] = useState<T>(mockData);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (IS_LIVE_DATA) {
            setLoading(true);
            const docRef = db.collection(collectionName).doc(docId);
            const unsubscribe = docRef.onSnapshot((docSnap) => {
                if (docSnap.exists) {
                    const firestoreData = docSnap.data() || {};
                    const newData = { ...mockData, ...firestoreData };

                    setData(prevData => {
                        // Perform deep comparison to prevent unnecessary re-renders
                        if (JSON.stringify(prevData) === JSON.stringify(newData)) {
                            return prevData;
                        }
                        return newData as T;
                    });

                } else {
                    console.warn(`Document ${docId} not found in ${collectionName}. Waiting for seed.`);
                }
                setLoading(false);
            }, (error) => {
                console.error(`Error fetching document ${collectionName}/${docId}: `, error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setData(mockData);
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, docId]);

     const updateData = async (newData: T | ((prev: T) => T)) => {
        const finalData = typeof newData === 'function' ? (newData as (prev: T) => T)(data) : newData;
        if (IS_LIVE_DATA) {
            try {
                const docRef = db.collection(collectionName).doc(docId);
                await docRef.set(finalData, { merge: true });
            } catch (error: any) {
                console.error(`Failed to save document ${collectionName}/${docId}:`, error);
                alert(`Failed to save settings: ${error.message}`);
            }
        }
        setData(finalData);
    };
    
    return [data, updateData, loading] as const;
}

const MOCK_DATA_MAP = {
    tiers: mock.MOCK_TIERS,
    ranks: mock.MOCK_RANKS,
    badges: mock.MOCK_BADGES,
    legendaryBadges: mock.MOCK_LEGENDARY_BADGES,
    gamificationSettings: mock.MOCK_GAMIFICATION_SETTINGS,
    companyDetails: mock.MOCK_COMPANY_DETAILS,
    creatorDetails: mock.MOCK_CREATOR_DETAILS,
    players: mock.MOCK_PLAYERS,
    events: mock.MOCK_EVENTS,
    vouchers: mock.MOCK_VOUCHERS,
    inventory: mock.MOCK_INVENTORY,
    suppliers: mock.MOCK_SUPPLIERS,
    transactions: mock.MOCK_TRANSACTIONS,
    locations: mock.MOCK_LOCATIONS,
    raffles: mock.MOCK_RAFFLES,
    sponsors: mock.MOCK_SPONSORS,
    socialLinks: mock.MOCK_SOCIAL_LINKS,
    carouselMedia: mock.MOCK_CAROUSEL_MEDIA,
};
type SeedableCollection = keyof typeof MOCK_DATA_MAP;


// --- START OF TYPE DEFINITION ---
export interface DataContextType {
    players: Player[]; setPlayers: (d: Player[] | ((p: Player[]) => Player[])) => void;
    events: GameEvent[]; setEvents: (d: GameEvent[] | ((p: GameEvent[]) => GameEvent[])) => void;
    tiers: Tier[]; setTiers: (d: Tier[] | ((p: Tier[]) => Tier[])) => void;
    ranks: Rank[]; setRanks: (d: Rank[] | ((p: Rank[]) => Rank[])) => void;
    badges: Badge[]; setBadges: (d: Badge[] | ((p: Badge[]) => Badge[])) => void;
    legendaryBadges: LegendaryBadge[]; setLegendaryBadges: (d: LegendaryBadge[] | ((p: LegendaryBadge[]) => LegendaryBadge[])) => void;
    gamificationSettings: GamificationSettings; setGamificationSettings: (d: GamificationSettings | ((p: GamificationSettings) => GamificationSettings)) => void;
    sponsors: Sponsor[]; setSponsors: (d: Sponsor[] | ((p: Sponsor[]) => Sponsor[])) => void;
    companyDetails: CompanyDetails; setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => Promise<void>;
    creatorDetails: CreatorDetails; setCreatorDetails: (d: CreatorDetails | ((p: CreatorDetails) => CreatorDetails)) => Promise<void>;
    socialLinks: SocialLink[]; setSocialLinks: (d: SocialLink[] | ((p: SocialLink[]) => SocialLink[])) => void;
    carouselMedia: CarouselMedia[]; setCarouselMedia: (d: CarouselMedia[] | ((p: CarouselMedia[]) => CarouselMedia[])) => void;
    vouchers: Voucher[]; setVouchers: (d: Voucher[] | ((p: Voucher[]) => Voucher[])) => void;
    inventory: InventoryItem[]; setInventory: (d: InventoryItem[] | ((p: InventoryItem[]) => InventoryItem[])) => void;
    suppliers: Supplier[]; setSuppliers: (d: Supplier[] | ((p: Supplier[]) => Supplier[])) => void;
    transactions: Transaction[]; setTransactions: (d: Transaction[] | ((p: Transaction[]) => Transaction[])) => void;
    locations: Location[]; setLocations: (d: Location[] | ((p: Location[]) => Location[])) => void;
    raffles: Raffle[]; setRaffles: (d: Raffle[] | ((p: Raffle[]) => Raffle[])) => void;
    
    // CRUD functions
    updateDoc: <T extends {id: string}>(collectionName: string, doc: T) => Promise<void>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    
    deleteAllData: () => Promise<void>;
    restoreFromBackup: (backupData: any) => Promise<void>;
    seedInitialData: () => Promise<void>;
    seedCollection: (collectionName: SeedableCollection) => Promise<void>;
    loading: boolean;
    isSeeding: boolean;
}
// --- END OF TYPE DEFINITION ---


export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Protected collections (require auth)
    const [players, setPlayers, loadingPlayers] = useCollection<Player>('players', mock.MOCK_PLAYERS, [], { isProtected: true });
    const [events, setEvents, loadingEvents] = useCollection<GameEvent>('events', mock.MOCK_EVENTS, [], { isProtected: true });
    const [tiers, setTiers, loadingTiers] = useCollection<Tier>('tiers', mock.MOCK_TIERS, [], { isProtected: true });
    const [ranks, setRanks, loadingRanks] = useCollection<Rank>('ranks', mock.MOCK_RANKS, [], { isProtected: true });
    const [badges, setBadges, loadingBadges] = useCollection<Badge>('badges', mock.MOCK_BADGES, [], { isProtected: true });
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useCollection<LegendaryBadge>('legendaryBadges', mock.MOCK_LEGENDARY_BADGES, [], { isProtected: true });
    const [gamificationSettings, setGamificationSettings, loadingGamification] = useCollection<GamificationRule>('gamificationSettings', mock.MOCK_GAMIFICATION_SETTINGS, [], { isProtected: true });
    const [sponsors, setSponsors, loadingSponsors] = useCollection<Sponsor>('sponsors', mock.MOCK_SPONSORS, [], { isProtected: true });
    const [vouchers, setVouchers, loadingVouchers] = useCollection<Voucher>('vouchers', mock.MOCK_VOUCHERS, [], { isProtected: true });
    const [inventory, setInventory, loadingInventory] = useCollection<InventoryItem>('inventory', mock.MOCK_INVENTORY, [], { isProtected: true });
    const [suppliers, setSuppliers, loadingSuppliers] = useCollection<Supplier>('suppliers', mock.MOCK_SUPPLIERS, [], { isProtected: true });
    const [transactions, setTransactions, loadingTransactions] = useCollection<Transaction>('transactions', mock.MOCK_TRANSACTIONS, [], { isProtected: true });
    const [locations, setLocations, loadingLocations] = useCollection<Location>('locations', mock.MOCK_LOCATIONS, [], { isProtected: true });
    const [raffles, setRaffles, loadingRaffles] = useCollection<Raffle>('raffles', mock.MOCK_RAFFLES, [], { isProtected: true });

    // Public collections and documents
    const [companyDetails, setCompanyDetails, loadingCompanyDetails] = useDocument<CompanyDetails>('settings', 'companyDetails', mock.MOCK_COMPANY_DETAILS);
    const [creatorDetails, setCreatorDetails, loadingCreatorDetails] = useDocument<CreatorDetails>('settings', 'creatorDetails', mock.MOCK_CREATOR_DETAILS);
    const [socialLinks, setSocialLinks, loadingSocialLinks] = useCollection<SocialLink>('socialLinks', mock.MOCK_SOCIAL_LINKS);
    const [carouselMedia, setCarouselMedia, loadingCarouselMedia] = useCollection<CarouselMedia>('carouselMedia', mock.MOCK_CAROUSEL_MEDIA);
    
    const [isSeeding, setIsSeeding] = useState(false);

    const loading = loadingPlayers || loadingEvents || loadingTiers || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingSponsors || loadingCompanyDetails || loadingCreatorDetails || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingSocialLinks || loadingCarouselMedia;
    
    const collectionSetters = {
        players: setPlayers,
        events: setEvents,
        tiers: setTiers,
        ranks: setRanks,
        badges: setBadges,
        legendaryBadges: setLegendaryBadges,
        gamificationSettings: setGamificationSettings,
        sponsors: setSponsors,
        socialLinks: setSocialLinks,
        carouselMedia: setCarouselMedia,
        vouchers: setVouchers,
        inventory: setInventory,
        suppliers: setSuppliers,
        transactions: setTransactions,
        locations: setLocations,
        raffles: setRaffles,
    };
    type CollectionName = keyof typeof collectionSetters;

    // --- GENERIC CRUD FUNCTIONS ---
    const addDoc = async <T extends {}>(collectionName: string, data: T) => {
        if (IS_LIVE_DATA) {
            await db.collection(collectionName).add(data);
        } else {
            const setter = collectionSetters[collectionName as CollectionName];
            if (setter) {
                // @ts-ignore
                setter(prev => [...prev, { ...data, id: `mock${Date.now()}` }]);
            }
        }
    };

    const updateDoc = async <T extends {id: string}>(collectionName: string, doc: T) => {
        if (IS_LIVE_DATA) {
            const { id, ...data } = doc;
            await db.collection(collectionName).doc(id).set(data, { merge: true });
        } else {
            const setter = collectionSetters[collectionName as CollectionName];
            if (setter) {
                // @ts-ignore
                setter(prev => prev.map(item => item.id === doc.id ? doc : item));
            }
        }
    };

    const deleteDoc = async (collectionName: string, docId: string) => {
        if (IS_LIVE_DATA) {
            await db.collection(collectionName).doc(docId).delete();
        } else {
            const setter = collectionSetters[collectionName as CollectionName];
            if (setter) {
                 // @ts-ignore
                setter(prev => prev.filter(item => item.id !== docId));
            }
        }
    };
    // --- END GENERIC CRUD ---
    const seedCollection = async (collectionName: SeedableCollection) => {
        if (!IS_LIVE_DATA) return;
        const dataToSeed = MOCK_DATA_MAP[collectionName];
        if (!dataToSeed) {
            console.error(`No mock data found for collection: ${collectionName}`);
            return;
        }

        console.log(`Seeding collection: ${collectionName}...`);
        const batch = db.batch();
        
        if (Array.isArray(dataToSeed)) {
             dataToSeed.forEach((item: any) => {
                const { id, ...data } = item;
                batch.set(db.collection(collectionName).doc(id), data);
            });
        } else { // It's a single document for 'settings'
            batch.set(db.collection('settings').doc(collectionName), dataToSeed);
        }

        await batch.commit();
        console.log(`Successfully seeded ${collectionName}.`);
    };

    const seedInitialData = async () => {
        if (!IS_LIVE_DATA) return;
        setIsSeeding(true);
        console.log("FRESH DATABASE DETECTED: Seeding all initial data...");
        try {
            const batch = db.batch();

            // System Settings & Config
            mock.MOCK_TIERS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('tiers').doc(id), data); });
            mock.MOCK_RANKS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('ranks').doc(id), data); });
            mock.MOCK_BADGES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('badges').doc(id), data); });
            mock.MOCK_LEGENDARY_BADGES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('legendaryBadges').doc(id), data); });
            mock.MOCK_GAMIFICATION_SETTINGS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('gamificationSettings').doc(id), data); });
            batch.set(db.collection('settings').doc('companyDetails'), mock.MOCK_COMPANY_DETAILS);
            batch.set(db.collection('settings').doc('creatorDetails'), mock.MOCK_CREATOR_DETAILS);
            
            // Admin User
            const { id: adminId, ...adminData } = mock.MOCK_ADMIN;
            batch.set(db.collection('admins').doc(adminId), adminData);

            // Transactional Data & Subcollections
            mock.MOCK_PLAYERS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('players').doc(id), data); });
            mock.MOCK_EVENTS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('events').doc(id), data); });
            mock.MOCK_VOUCHERS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('vouchers').doc(id), data); });
            mock.MOCK_INVENTORY.forEach(item => { const {id, ...data} = item; batch.set(db.collection('inventory').doc(id), data); });
            mock.MOCK_SUPPLIERS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('suppliers').doc(id), data); });
            mock.MOCK_TRANSACTIONS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('transactions').doc(id), data); });
            mock.MOCK_LOCATIONS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('locations').doc(id), data); });
            mock.MOCK_RAFFLES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('raffles').doc(id), data); });
            mock.MOCK_SPONSORS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('sponsors').doc(id), data); });
            mock.MOCK_SOCIAL_LINKS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('socialLinks').doc(id), data); });
            mock.MOCK_CAROUSEL_MEDIA.forEach(item => { const {id, ...data} = item; batch.set(db.collection('carouselMedia').doc(id), data); });
            
            await batch.commit();
            console.log('All initial data seeded successfully. Refreshing the page to load new data...');
            window.location.reload();

        } catch (error) {
            console.error("Error seeding initial data: ", error);
            setIsSeeding(false);
        }
    };
    
     useEffect(() => {
        const checkAndSeed = async () => {
            if (IS_LIVE_DATA && !loading) {
                const settingsCheck = await db.collection('settings').doc('companyDetails').get();
                if (!settingsCheck.exists) {
                    await seedInitialData();
                }
            }
        };
        checkAndSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);


    const deleteAllData = async () => {
        if (!IS_LIVE_DATA) {
            console.log("Resetting all mock transactional data in memory...");
            setPlayers(mock.MOCK_PLAYERS);
            setEvents(mock.MOCK_EVENTS);
            setVouchers(mock.MOCK_VOUCHERS);
            setInventory(mock.MOCK_INVENTORY);
            setTransactions(mock.MOCK_TRANSACTIONS);
            setRaffles(mock.MOCK_RAFFLES);
            setSuppliers(mock.MOCK_SUPPLIERS);
            setSponsors(mock.MOCK_SPONSORS);
            setLocations(mock.MOCK_LOCATIONS);
            setSocialLinks(mock.MOCK_SOCIAL_LINKS);
            setCarouselMedia(mock.MOCK_CAROUSEL_MEDIA);
            return;
        }
        
        const collectionsToDelete = ['players', 'events', 'vouchers', 'inventory', 'transactions', 'raffles', 'suppliers', 'sponsors', 'locations', 'socialLinks', 'carouselMedia'];
        
        try {
            console.log("Deleting all transactional data...");
            for (const collectionName of collectionsToDelete) {
                const snapshot = await db.collection(collectionName).get();
                const batch = db.batch();
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Deleted collection: ${collectionName}`);
            }
            console.log('All transactional data deleted.');
        } catch (error) {
            console.error("Error deleting all data: ", error);
        }
    };
    
    const restoreFromBackup = async (backupData: any) => {
        if (!IS_LIVE_DATA) {
            console.log("Restoring from backup for mock data environment...");
            setPlayers(backupData.players || []);
            setEvents(backupData.events || []);
            setTiers(backupData.tiers || []);
            setRanks(backupData.ranks || []);
            setBadges(backupData.badges || []);
            setLegendaryBadges(backupData.legendaryBadges || []);
            setGamificationSettings(backupData.gamificationSettings || []);
            setSponsors(backupData.sponsors || []);
            setCompanyDetails(backupData.companyDetails || mock.MOCK_COMPANY_DETAILS);
            setCreatorDetails(backupData.creatorDetails || mock.MOCK_CREATOR_DETAILS);
            setSocialLinks(backupData.socialLinks || []);
            setCarouselMedia(backupData.carouselMedia || []);
            setVouchers(backupData.vouchers || []);
            setInventory(backupData.inventory || []);
            setSuppliers(backupData.suppliers || []);
            setTransactions(backupData.transactions || []);
            setLocations(backupData.locations || []);
            setRaffles(backupData.raffles || []);
            return;
        }

        console.log("Starting Firebase restore from backup...");
        const collectionsToRestore = [
            'players', 'events', 'tiers', 'ranks', 'badges', 'legendaryBadges', 'gamificationSettings',
            'sponsors', 'socialLinks', 'carouselMedia', 'vouchers', 'inventory', 'suppliers',
            'transactions', 'locations', 'raffles'
        ];

        try {
            // Step 1: Wipe existing data
            console.log("Wiping existing data...");
            for (const collectionName of collectionsToRestore) {
                const snapshot = await db.collection(collectionName).get();
                if (snapshot.empty) continue;
                const batch = db.batch();
                snapshot.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                console.log(`- Wiped collection: ${collectionName}`);
            }

            // Step 2: Restore data from backup
            console.log("Writing new data from backup...");
            const writeBatch = db.batch();
            
            for (const collectionName of collectionsToRestore) {
                const data = backupData[collectionName];
                if (data && Array.isArray(data)) {
                    console.log(`- Restoring ${data.length} documents to ${collectionName}...`);
                    data.forEach((item: any) => {
                        const { id, ...itemData } = item;
                        const docRef = db.collection(collectionName).doc(id);
                        writeBatch.set(docRef, itemData);
                    });
                }
            }

            // Handle single-document settings
            if (backupData.companyDetails) {
                writeBatch.set(db.collection('settings').doc('companyDetails'), backupData.companyDetails);
            }
            if (backupData.creatorDetails) {
                 writeBatch.set(db.collection('settings').doc('creatorDetails'), backupData.creatorDetails);
            }

            await writeBatch.commit();
            console.log("Restore complete. The page will now reload.");
            
            // Force reload to reflect all changes
            window.location.reload();

        } catch (error) {
            console.error("A critical error occurred during the restore process:", error);
            throw new Error("Restore failed. Please check the console for details.");
        }
    };


    const value: DataContextType = {
        players, setPlayers,
        events, setEvents,
        tiers, setTiers,
        ranks, setRanks,
        badges, setBadges,
        legendaryBadges, setLegendaryBadges,
        gamificationSettings, setGamificationSettings,
        sponsors, setSponsors,
        companyDetails, setCompanyDetails,
        creatorDetails, setCreatorDetails,
        socialLinks, setSocialLinks,
        carouselMedia, setCarouselMedia,
        vouchers, setVouchers,
        inventory, setInventory,
        suppliers, setSuppliers,
        transactions, setTransactions,
        locations, setLocations,
        raffles, setRaffles,
        
        updateDoc,
        addDoc,
        deleteDoc,

        deleteAllData,
        restoreFromBackup,
        seedInitialData,
        seedCollection,
        loading,
        isSeeding,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};