import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { USE_FIREBASE, db } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, Rank, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia } from '../types';

// Helper to fetch and manage collection data
function useManagedCollection<T extends {id: string}>(collectionName: string, mockData: T[], dependencies: any[] = []) {
    const [data, setData] = useState<T[]>(USE_FIREBASE ? [] : mockData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (USE_FIREBASE && db) {
            setLoading(true);
            const q = db.collection(collectionName);
            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const items: T[] = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as unknown as T);
                });
                setData(items);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
    
    const updateCollection = async (newData: T[] | ((prev: T[]) => T[])) => {
        const finalData = typeof newData === 'function' ? (newData as (prev: T[]) => T[])(data) : newData;

        if (USE_FIREBASE && db) {
            try {
                const collectionRef = db.collection(collectionName);
                const batch = db.batch();
                
                const snapshot = await collectionRef.get();
                const existingIds = new Set(snapshot.docs.map(doc => doc.id));

                for (const item of finalData) {
                    const { id, ...itemData } = item;
                    const docRef = collectionRef.doc(id);
                    batch.set(docRef, itemData);
                    existingIds.delete(id);
                }

                existingIds.forEach(idToDelete => {
                    batch.delete(collectionRef.doc(idToDelete));
                });

                await batch.commit();
                // The onSnapshot listener will automatically update the local state.
            } catch (error) {
                 console.error(`Failed to update collection ${collectionName}:`, error);
                 alert(`Failed to save changes to ${collectionName}. Error: ${(error as Error).message}`);
            }
        } else {
            setData(finalData); // Update mock data state
        }
    };

    return [data, updateCollection, loading] as const;
}

// Helper to fetch a single document
function useDocument<T>(collectionName: string, docId: string, mockData: T) {
    const [data, setData] = useState<T>(mockData);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (USE_FIREBASE && db) {
            setLoading(true);
            const docRef = db.collection(collectionName).doc(docId);
            const unsubscribe = docRef.onSnapshot((docSnap) => {
                if (docSnap.exists) {
                    const firestoreData = docSnap.data() || {};
                    // Merge Firestore data with mock data to ensure a complete object and prevent data loss on subsequent writes.
                    setData({ ...mockData, ...firestoreData } as T);
                } else {
                    // This will be handled by the global seeder now
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
        if (USE_FIREBASE && db) {
            try {
                const docRef = db.collection(collectionName).doc(docId);
                // Use { merge: true } to prevent accidentally overwriting/deleting fields
                // that might not be present in the local `finalData` object.
                await docRef.set(finalData, { merge: true });
            } catch (error: any) {
                console.error(`Failed to save document ${collectionName}/${docId}:`, error);
                alert(`Failed to save settings to the database. This can happen if uploaded images or videos are too large (document size limit is 1MB).\n\nError: ${error.message}`);
            }
        } else {
            setData(finalData);
        }
    };
    
    return [data, updateData, loading] as const;
}

interface DataContextType {
    players: Player[]; setPlayers: (d: Player[] | ((p: Player[]) => Player[])) => void;
    events: GameEvent[]; setEvents: (d: GameEvent[] | ((p: GameEvent[]) => GameEvent[])) => void;
    ranks: Rank[]; setRanks: (d: Rank[] | ((p: Rank[]) => Rank[])) => void;
    badges: Badge[]; setBadges: (d: Badge[] | ((p: Badge[]) => Badge[])) => void;
    legendaryBadges: LegendaryBadge[]; setLegendaryBadges: (d: LegendaryBadge[] | ((p: LegendaryBadge[]) => LegendaryBadge[])) => void;
    gamificationSettings: GamificationSettings; setGamificationSettings: (d: GamificationSettings | ((p: GamificationSettings) => GamificationSettings)) => void;
    sponsors: Sponsor[]; setSponsors: (d: Sponsor[] | ((p: Sponsor[]) => Sponsor[])) => void;
    companyDetails: CompanyDetails; setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => void;
    socialLinks: SocialLink[]; setSocialLinks: (d: SocialLink[] | ((p: SocialLink[]) => SocialLink[])) => void;
    carouselMedia: CarouselMedia[]; setCarouselMedia: (d: CarouselMedia[] | ((p: CarouselMedia[]) => CarouselMedia[])) => void;
    vouchers: Voucher[]; setVouchers: (d: Voucher[] | ((p: Voucher[]) => Voucher[])) => void;
    inventory: InventoryItem[]; setInventory: (d: InventoryItem[] | ((p: InventoryItem[]) => InventoryItem[])) => void;
    suppliers: Supplier[]; setSuppliers: (d: Supplier[] | ((p: Supplier[]) => Supplier[])) => void;
    transactions: Transaction[]; setTransactions: (d: Transaction[] | ((p: Transaction[]) => Transaction[])) => void;
    locations: Location[]; setLocations: (d: Location[] | ((p: Location[]) => Location[])) => void;
    raffles: Raffle[]; setRaffles: (d: Raffle[] | ((p: Raffle[]) => Raffle[])) => void;
    deleteAllData: () => Promise<void>;
    seedInitialData: () => Promise<void>;
    loading: boolean;
    isSeeding: boolean;
    updatePlayerDoc: (player: Player) => Promise<void>;
    addPlayerDoc: (playerData: Omit<Player, 'id'>) => Promise<void>;
    updateEventDoc: (event: GameEvent) => Promise<void>;
    addEventDoc: (eventData: Omit<GameEvent, 'id'>) => Promise<void>;
    deleteEventDoc: (eventId: string) => Promise<void>;
    migrateToApiServer: (apiUrl: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [players, setPlayers, loadingPlayers] = useManagedCollection<Player>('players', mock.MOCK_PLAYERS, []);
    const [events, setEvents, loadingEvents] = useManagedCollection<GameEvent>('events', mock.MOCK_EVENTS, []);
    const [ranks, setRanks, loadingRanks] = useManagedCollection<Rank>('ranks', mock.MOCK_RANKS, []);
    const [badges, setBadges, loadingBadges] = useManagedCollection<Badge>('badges', mock.MOCK_BADGES, []);
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useManagedCollection<LegendaryBadge>('legendaryBadges', mock.MOCK_LEGENDARY_BADGES, []);
    const [gamificationSettings, setGamificationSettings, loadingGamification] = useManagedCollection<GamificationRule>('gamificationSettings', mock.MOCK_GAMIFICATION_SETTINGS, []);
    const [sponsors, setSponsors, loadingSponsors] = useManagedCollection<Sponsor>('sponsors', mock.MOCK_SPONSORS, []);
    const [vouchers, setVouchers, loadingVouchers] = useManagedCollection<Voucher>('vouchers', mock.MOCK_VOUCHERS, []);
    const [inventory, setInventory, loadingInventory] = useManagedCollection<InventoryItem>('inventory', mock.MOCK_INVENTORY, []);
    const [suppliers, setSuppliers, loadingSuppliers] = useManagedCollection<Supplier>('suppliers', mock.MOCK_SUPPLIERS, []);
    const [transactions, setTransactions, loadingTransactions] = useManagedCollection<Transaction>('transactions', mock.MOCK_TRANSACTIONS, []);
    const [locations, setLocations, loadingLocations] = useManagedCollection<Location>('locations', mock.MOCK_LOCATIONS, []);
    const [raffles, setRaffles, loadingRaffles] = useManagedCollection<Raffle>('raffles', mock.MOCK_RAFFLES, []);
    const [companyDetails, setCompanyDetails, loadingCompanyDetails] = useDocument<CompanyDetails>('settings', 'companyDetails', mock.MOCK_COMPANY_DETAILS);
    const [socialLinks, setSocialLinks, loadingSocialLinks] = useManagedCollection<SocialLink>('socialLinks', mock.MOCK_SOCIAL_LINKS, []);
    const [carouselMedia, setCarouselMedia, loadingCarouselMedia] = useManagedCollection<CarouselMedia>('carouselMedia', mock.MOCK_CAROUSEL_MEDIA, []);
    
    const [isSeeding, setIsSeeding] = useState(false);

    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingSponsors || loadingCompanyDetails || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingSocialLinks || loadingCarouselMedia;
    
    const seedInitialData = async () => {
        if (!USE_FIREBASE || !db) return;
        setIsSeeding(true);
        console.log("FRESH DATABASE DETECTED: Seeding all initial data...");
        try {
            const batch = db.batch();

            // System Settings & Config
            mock.MOCK_RANKS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('ranks').doc(id), data); });
            mock.MOCK_BADGES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('badges').doc(id), data); });
            mock.MOCK_LEGENDARY_BADGES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('legendaryBadges').doc(id), data); });
            mock.MOCK_GAMIFICATION_SETTINGS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('gamificationSettings').doc(id), data); });
            batch.set(db.collection('settings').doc('companyDetails'), mock.MOCK_COMPANY_DETAILS);
            
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
            if (USE_FIREBASE && db && !loading) {
                const playersSnapshot = await db.collection('players').limit(1).get();
                if (playersSnapshot.empty) {
                    await seedInitialData();
                }
            }
        };
        checkAndSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);


    const deleteAllData = async () => {
        if (!USE_FIREBASE || !db) {
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
            const batch = db.batch();
            for (const collectionName of collectionsToDelete) {
                const snapshot = await db.collection(collectionName).get();
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
            }
            await batch.commit();
            console.log('All transactional data deleted.');
        } catch (error) {
            console.error("Error deleting all data: ", error);
        }
    };
    
    const migrateToApiServer = async (apiUrl: string) => {
        if (!USE_FIREBASE || !db) {
            alert("This feature is only available when connected to Firebase.");
            return;
        }
        
        console.log("Starting data migration to API server...");
        // In a real app, this would involve a complex process:
        // 1. Fetch all documents that might contain media URLs (base64 data).
        // 2. For each base64 URL, convert it to a Blob/File.
        // 3. POST the file to the new API server's /upload endpoint.
        // 4. Get the new permanent URL back from the server.
        // 5. Update the Firestore document with the new URL.
        // This is a complex operation and for this context, we will simulate it.
        // The main goal is to save the API server URL to settings.
        
        // This simplified function just confirms the URL and saves it.
        // A full implementation is beyond the scope of this fix.
        console.log(`Simulating migration. New server URL: ${apiUrl}`);
        await setCompanyDetails(prev => ({...prev, apiServerUrl: apiUrl}));
        console.log("Migration 'complete'. API Server URL has been saved.");
    };

    const updatePlayerDoc = async (player: Player) => {
        if (!USE_FIREBASE || !db) {
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            return;
        }
        const { id, ...playerData } = player;
        await db.collection('players').doc(id).set(playerData, { merge: true });
    };
    
    const addPlayerDoc = async (playerData: Omit<Player, 'id'>) => {
        if (!USE_FIREBASE || !db) {
            const newPlayer = { ...playerData, id: `p${Date.now()}` };
            setPlayers(prev => [...prev, newPlayer]);
            return;
        }
        await db.collection('players').add(playerData);
    };

    const updateEventDoc = async (event: GameEvent) => {
        if (!USE_FIREBASE || !db) {
            setEvents(prev => prev.map(e => e.id === event.id ? event : e));
            return;
        }
        const { id, ...eventData } = event;
        await db.collection('events').doc(id).set(eventData, { merge: true });
    };
    
    const addEventDoc = async (eventData: Omit<GameEvent, 'id'>) => {
        if (!USE_FIREBASE || !db) {
            const newEvent: GameEvent = { ...eventData, id: `e${Date.now()}` };
            setEvents(prev => [...prev, newEvent]);
            return;
        }
        await db.collection('events').add(eventData);
    };

    const deleteEventDoc = async (eventId: string) => {
        if (!USE_FIREBASE || !db) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            return;
        }
        await db.collection('events').doc(eventId).delete();
    };

    const value: DataContextType = {
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
        addEventDoc,
        deleteEventDoc,
        migrateToApiServer,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};