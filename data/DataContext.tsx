import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { USE_FIREBASE, db } from '../firebase';
// FIX: Remove modular imports and use compat syntax provided by `db` object.
import { writeBatch } from 'firebase/firestore';
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
                     batch.delete(collectionRef.doc(id));
                }
            }
            await batch.commit();

        } else {
            setData(finalData);
        }
    };

    return [data, updateData, loading] as const;
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
    loading: boolean;
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

    const gamificationSettings = gamificationSettingsDoc.rules;
    const setGamificationSettings = (newSettings: GamificationSettings | ((p: GamificationSettings) => GamificationSettings)) => {
        const finalRules = typeof newSettings === 'function' ? newSettings(gamificationSettings) : newSettings;
        setGamificationSettingsDoc({ rules: finalRules });
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

    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingSponsors || loadingCompany || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingGamification;

    const value = {
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
        loading
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
