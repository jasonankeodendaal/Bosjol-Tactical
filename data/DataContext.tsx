import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { USE_FIREBASE, db } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, Rank, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge } from '../types';

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
    }, dependencies);

    const updateData = async (newData: T[] | ((prev: T[]) => T[])) => {
        const finalData = typeof newData === 'function' ? newData(data) : newData;
        if (USE_FIREBASE && db) {
            const batch = db.batch();
            const collectionRef = db.collection(collectionName);
            
            // This is a simple diffing approach. More complex logic might be needed for large datasets.
            const existingIds = new Set(data.map((d: any) => d.id));
            const newIds = new Set(finalData.map((d: any) => d.id));

            for (const item of finalData) {
                const { id, ...itemData } = item as any;
                const docRef = collectionRef.doc(id);
                batch.set(docRef, itemData);
            }

            for (const id of existingIds) {
                if (!newIds.has(id)) {
                    // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string'.
                     batch.delete(collectionRef.doc(id as string));
                }
            }
            await batch.commit();

        } else {
            setData(finalData);
        }
    };

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
                    console.warn(`Document ${docId} not found in ${collectionName}. Using mock data.`);
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
    }, [collectionName, docId]);

     const updateData = async (newData: T | ((prev: T) => T)) => {
        // FIX: Add a type assertion to inform TypeScript that `newData` is callable when it's a function.
        // This resolves the "expression is not callable" error with generic types.
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
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [players, setPlayers, loadingPlayers] = useCollection<Player>('players', mock.MOCK_PLAYERS);
    const [events, setEvents, loadingEvents] = useCollection<GameEvent>('events', mock.MOCK_EVENTS);
    const [ranks, setRanks, loadingRanks] = useCollection<Rank>('ranks', mock.MOCK_RANKS);
    const [badges, setBadges, loadingBadges] = useCollection<Badge>('badges', mock.MOCK_BADGES);
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useCollection<LegendaryBadge>('legendaryBadges', mock.MOCK_LEGENDARY_BADGES);
    const [sponsors, setSponsors, loadingSponsors] = useCollection<Sponsor>('sponsors', mock.MOCK_SPONSORS);
    const [vouchers, setVouchers, loadingVouchers] = useCollection<Voucher>('vouchers', mock.MOCK_VOUCHERS);
    const [inventory, setInventory, loadingInventory] = useCollection<InventoryItem>('inventory', mock.MOCK_INVENTORY);
    const [suppliers, setSuppliers, loadingSuppliers] = useCollection<Supplier>('suppliers', mock.MOCK_SUPPLIERS);
    const [transactions, setTransactions, loadingTransactions] = useCollection<Transaction>('transactions', mock.MOCK_TRANSACTIONS);
    const [locations, setLocations, loadingLocations] = useCollection<Location>('locations', mock.MOCK_LOCATIONS);
    const [raffles, setRaffles, loadingRaffles] = useCollection<Raffle>('raffles', mock.MOCK_RAFFLES);

    // Single documents in 'settings' collection
    const [companyDetails, setCompanyDetails, loadingCompany] = useDocument<CompanyDetails>('settings', 'companyDetails', mock.MOCK_COMPANY_DETAILS);
    const [gamificationSettingsDoc, setGamificationSettingsDoc, loadingGamification] = useDocument<{rules: GamificationSettings}>('settings', 'gamification', {rules: mock.MOCK_GAMIFICATION_SETTINGS});
    const [isSeeding, setIsSeeding] = useState(false);

    const gamificationSettings = gamificationSettingsDoc.rules;
    const setGamificationSettings = (newSettings: GamificationSettings | ((p: GamificationSettings) => GamificationSettings)) => {
        const finalRules = typeof newSettings === 'function' ? newSettings(gamificationSettings) : newSettings;
        setGamificationSettingsDoc({ rules: finalRules });
    };
    
    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingSponsors || loadingCompany || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingGamification;
    
    const seedInitialData = async () => {
        if (!USE_FIREBASE || !db) {
            console.warn("Seeding feature is only available when using Firebase.");
            return;
        }

        try {
            const batch = db.batch();
            let operationsCount = 0;

            // 1. Seed Ranks
            const ranksRef = db.collection('ranks');
            const ranksSnap = await ranksRef.limit(1).get();
            if (ranksSnap.empty) {
                console.log('Seeding ranks collection...');
                mock.MOCK_RANKS.forEach(rank => {
                    const docRef = ranksRef.doc(); // Firestore will auto-generate ID
                    batch.set(docRef, rank);
                    operationsCount++;
                });
            }

            // 2. Seed Badges
            const badgesRef = db.collection('badges');
            const badgesSnap = await badgesRef.limit(1).get();
            if (badgesSnap.empty) {
                console.log('Seeding badges collection...');
                mock.MOCK_BADGES.forEach(badge => {
                    const docRef = badgesRef.doc(badge.id); // Use mock ID
                    batch.set(docRef, badge);
                    operationsCount++;
                });
            }
            
            // 3. Seed Legendary Badges
            const legendaryBadgesRef = db.collection('legendaryBadges');
            const legendaryBadgesSnap = await legendaryBadgesRef.limit(1).get();
            if (legendaryBadgesSnap.empty) {
                console.log('Seeding legendaryBadges collection...');
                mock.MOCK_LEGENDARY_BADGES.forEach(badge => {
                    const docRef = legendaryBadgesRef.doc(badge.id); // Use mock ID
                    batch.set(docRef, badge);
                    operationsCount++;
                });
            }

            // 4. Seed Settings Documents
            const settingsRef = db.collection('settings');
            
            const companyDetailsRef = settingsRef.doc('companyDetails');
            const companyDetailsSnap = await companyDetailsRef.get();
            if (!companyDetailsSnap.exists) {
                console.log('Seeding companyDetails document...');
                batch.set(companyDetailsRef, mock.MOCK_COMPANY_DETAILS);
                operationsCount++;
            }

            const gamificationRef = settingsRef.doc('gamification');
            const gamificationSnap = await gamificationRef.get();
            if (!gamificationSnap.exists) {
                console.log('Seeding gamification document...');
                batch.set(gamificationRef, { rules: mock.MOCK_GAMIFICATION_SETTINGS });
                operationsCount++;
            }
            
             // 5. Seed Admin User
            const adminRef = db.collection('admins').doc(mock.MOCK_ADMIN.id);
            const adminSnap = await adminRef.get();
            if (!adminSnap.exists) {
                console.log('Seeding admin user document...');
                const { id, ...adminData } = mock.MOCK_ADMIN;
                batch.set(adminRef, adminData);
                operationsCount++;
            }

            // 6. Seed Players
            const playersRef = db.collection('players');
            const playersSnap = await playersRef.limit(1).get();
            if (playersSnap.empty) {
                console.log('Seeding players collection...');
                mock.MOCK_PLAYERS.forEach(player => {
                    const { id, ...playerData } = player;
                    const docRef = playersRef.doc(id);
                    batch.set(docRef, playerData);
                    operationsCount++;
                });
            }

            if (operationsCount > 0) {
                await batch.commit();
                console.log('Database has been seeded. Reloading application...');
                window.location.reload();
            } else {
                console.log('All initial configuration data already exists. No action taken.');
            }

        } catch (error) {
            console.error("Error seeding initial data:", error);
            setIsSeeding(false);
        }
    };

    useEffect(() => {
        // Automatically seed the database if it's a new Firebase project.
        if (USE_FIREBASE && !loading && ranks.length === 0 && badges.length === 0) {
            console.log("New Firebase project detected. Automatically seeding initial data...");
            const doSeed = async () => {
                setIsSeeding(true);
                await seedInitialData();
            };
            doSeed();
        }
    }, [loading, ranks, badges]);


    const updatePlayerDoc = async (player: Player) => {
        if (USE_FIREBASE && db) {
            const { id, ...playerData } = player;
            await db.collection('players').doc(id).update(playerData);
            // onSnapshot listener will update the local state automatically
        } else {
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
        }
    };

    const updateEventDoc = async (event: GameEvent) => {
        if (USE_FIREBASE && db) {
            const { id, ...eventData } = event;
            await db.collection('events').doc(id).update(eventData);
            // onSnapshot listener will update the local state automatically
        } else {
            setEvents(prev => prev.map(e => e.id === event.id ? event : e));
        }
    };

    const deleteAllData = async () => {
        if (!USE_FIREBASE || !db) {
            // In mock mode, this is handled in App.tsx directly on state
            setPlayers([]);
            setEvents([]);
            setSponsors([]);
            setVouchers([]);
            setInventory([]);
            setSuppliers([]);
            setTransactions([]);
            setLocations([]);
            setRaffles([]);
            return;
        }

        // In Firebase mode, delete documents from collections
        const collectionsToDelete = ['players', 'events', 'sponsors', 'vouchers', 'inventory', 'suppliers', 'transactions', 'locations', 'raffles'];
        for (const collectionName of collectionsToDelete) {
            try {
                const querySnapshot = await db.collection(collectionName).get();
                const batch = db.batch();
                querySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Successfully deleted all documents from ${collectionName}.`);
            } catch (error) {
                console.error(`Error deleting documents from ${collectionName}: `, error);
            }
        }
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
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
