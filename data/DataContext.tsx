import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { USE_FIREBASE, db } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, Rank, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule } from '../types';

// Helper to fetch collection data
function useCollection<T>(collectionName: string, mockData: T[], dependencies: any[] = []) {
    const [data, setData] = useState<T[]>(mockData);
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

    return [data, setData, loading] as const;
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
                    setData(docSnap.data() as T);
                } else {
                    console.warn(`Document ${docId} not found in ${collectionName}. Seeding with mock data.`);
                    docRef.set(mockData); // Seed the document if it doesn't exist
                    setData(mockData);
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
            const docRef = db.collection(collectionName).doc(docId);
            await docRef.set(finalData);
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
    updateEventDoc: (event: GameEvent) => Promise<void>;
    addEventDoc: (eventData: Omit<GameEvent, 'id'>) => Promise<void>;
    deleteEventDoc: (eventId: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [players, setPlayers, loadingPlayers] = useCollection<Player>('players', mock.MOCK_PLAYERS);
    const [events, setEvents, loadingEvents] = useCollection<GameEvent>('events', mock.MOCK_EVENTS);
    const [ranks, setRanks, loadingRanks] = useCollection<Rank>('ranks', mock.MOCK_RANKS);
    const [badges, setBadges, loadingBadges] = useCollection<Badge>('badges', mock.MOCK_BADGES);
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useCollection<LegendaryBadge>('legendaryBadges', mock.MOCK_LEGENDARY_BADGES);
    const [gamificationSettings, setGamificationSettings, loadingGamification] = useCollection<GamificationRule>('gamificationSettings', mock.MOCK_GAMIFICATION_SETTINGS);
    const [sponsors, setSponsors, loadingSponsors] = useCollection<Sponsor>('sponsors', mock.MOCK_SPONSORS);
    const [vouchers, setVouchers, loadingVouchers] = useCollection<Voucher>('vouchers', mock.MOCK_VOUCHERS);
    const [inventory, setInventory, loadingInventory] = useCollection<InventoryItem>('inventory', mock.MOCK_INVENTORY);
    const [suppliers, setSuppliers, loadingSuppliers] = useCollection<Supplier>('suppliers', mock.MOCK_SUPPLIERS);
    const [transactions, setTransactions, loadingTransactions] = useCollection<Transaction>('transactions', mock.MOCK_TRANSACTIONS);
    const [locations, setLocations, loadingLocations] = useCollection<Location>('locations', mock.MOCK_LOCATIONS);
    const [raffles, setRaffles, loadingRaffles] = useCollection<Raffle>('raffles', mock.MOCK_RAFFLES);
    const [companyDetails, setCompanyDetails, loadingCompanyDetails] = useDocument<CompanyDetails>('settings', 'companyDetails', mock.MOCK_COMPANY_DETAILS);
    const [isSeeding, setIsSeeding] = useState(false);

    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingSponsors || loadingCompanyDetails || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles;
    
    const seedInitialData = async () => {
        if (!USE_FIREBASE || !db) return;
        setIsSeeding(true);
        console.log("Seeding initial database configuration...");
        try {
            const batch = db.batch();
            
            mock.MOCK_RANKS.forEach(item => batch.set(db.collection('ranks').doc(), item));
            mock.MOCK_BADGES.forEach(item => batch.set(db.collection('badges').doc(item.id), item));
            mock.MOCK_LEGENDARY_BADGES.forEach(item => batch.set(db.collection('legendaryBadges').doc(item.id), item));
            mock.MOCK_GAMIFICATION_SETTINGS.forEach(item => batch.set(db.collection('gamificationSettings').doc(item.id), item));
            
            // For other collections, you might want to add them here too if they are static
            mock.MOCK_SPONSORS.forEach(item => batch.set(db.collection('sponsors').doc(item.id), item));
            mock.MOCK_SUPPLIERS.forEach(item => batch.set(db.collection('suppliers').doc(item.id), item));
            mock.MOCK_LOCATIONS.forEach(item => batch.set(db.collection('locations').doc(item.id), item));
            
            await batch.commit();
            console.log('Initial data seeded successfully.');

        } catch (error) {
            console.error("Error seeding initial data: ", error);
        } finally {
            setIsSeeding(false);
        }
    };
    
     useEffect(() => {
        const checkAndSeed = async () => {
            if (USE_FIREBASE && db && !loading) {
                const ranksSnapshot = await db.collection('ranks').limit(1).get();
                if (ranksSnapshot.empty) {
                    await seedInitialData();
                }
            }
        };
        checkAndSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]); // Run this check after initial loading finishes.


    const deleteAllData = async () => {
        if (!USE_FIREBASE || !db) return;
        
        const collectionsToDelete = ['players', 'events', 'vouchers', 'inventory', 'transactions', 'raffles', 'suppliers'];
        
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
    
    const updatePlayerDoc = async (player: Player) => {
        if (!USE_FIREBASE || !db) {
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            return;
        }
        const { id, ...playerData } = player;
        await db.collection('players').doc(id).set(playerData, { merge: true });
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
        addEventDoc,
        deleteEventDoc
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
