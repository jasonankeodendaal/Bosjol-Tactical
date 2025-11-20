import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo, useCallback } from 'react';
import { USE_FIREBASE, db, firebaseInitializationError, firebase } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, ApiGuideStep, Tier, Session, ActivityLog } from '../types';
import { AuthContext } from '../auth/AuthContext';

export const IS_LIVE_DATA = USE_FIREBASE && !!db && !firebaseInitializationError;

// FIX: Define and export DataContextType
export interface DataContextType {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    events: GameEvent[];
    setEvents: React.Dispatch<React.SetStateAction<GameEvent[]>>;
    ranks: Rank[];
    setRanks: React.Dispatch<React.SetStateAction<Rank[]>>;
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    legendaryBadges: LegendaryBadge[];
    setLegendaryBadges: React.Dispatch<React.SetStateAction<LegendaryBadge[]>>;
    gamificationSettings: GamificationSettings;
    setGamificationSettings: React.Dispatch<React.SetStateAction<GamificationSettings>>;
    sponsors: Sponsor[];
    setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
    companyDetails: CompanyDetails;
    setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => Promise<void>;
    creatorDetails: CreatorDetails & { apiSetupGuide: ApiGuideStep[] };
    setCreatorDetails: (d: (CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) | ((p: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) => CreatorDetails & { apiSetupGuide: ApiGuideStep[] })) => Promise<void>;
    socialLinks: SocialLink[];
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
    carouselMedia: CarouselMedia[];
    setCarouselMedia: React.Dispatch<React.SetStateAction<CarouselMedia[]>>;
    vouchers: Voucher[];
    setVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    locations: Location[];
    setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
    raffles: Raffle[];
    setRaffles: React.Dispatch<React.SetStateAction<Raffle[]>>;
    signups: Signup[];
    setSignups: React.Dispatch<React.SetStateAction<Signup[]>>;
    sessions: Session[];
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    activityLog: ActivityLog[];
    setActivityLog: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
    apiSetupGuide: ApiGuideStep[];
    setApiSetupGuide: React.Dispatch<React.SetStateAction<ApiGuideStep[]>>;

    loading: boolean;
    isSeeding: boolean;
    seedInitialData: () => Promise<void>;
    deleteAllData: () => Promise<void>;
    deleteAllPlayers: () => Promise<void>;
    restoreFromBackup: (backupData: any) => Promise<void>;
    logActivity: (action: string, details?: Record<string, any>) => Promise<void>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<string>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    setDoc: <T extends {}>(collectionName: string, docId: string, data: T) => Promise<void>;
}

// FIX: Export DataContext
export const DataContext = createContext<DataContextType | null>(null);

// Helper to fetch collection data
function useCollection<T extends {id: string}>(collectionName: string, mockData: T[], dependencies: any[] = [], options: { isProtected?: boolean } = {}) {
    const [data, setData] = useState<T[]>(IS_LIVE_DATA ? [] : mockData);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (IS_LIVE_DATA) {
            const userRole = auth?.user?.role;
            
            // Don't fetch protected collections at all if not authenticated
            if (options.isProtected && !auth?.isAuthenticated) {
                setData([]); 
                setLoading(false);
                return; 
            }

            // Specifically block players from fetching admin-only collections to conserve read quotas
            const collectionsToBlockForPlayer = ['transactions', 'sessions', 'activityLog', 'suppliers', 'vouchers', 'apiSetupGuide', 'gamificationSettings'];
            if (userRole === 'player' && collectionsToBlockForPlayer.includes(collectionName)) {
                setData([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const q = db!.collection(collectionName);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.isAuthenticated, auth?.user?.role, ...dependencies]);

    return [data, setData, loading] as const;
}

// Helper to fetch a single document
function useDocument<T>(collectionName: string, docId: string, mockData: T) {
    const [data, setData] = useState<T>(mockData);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (IS_LIVE_DATA) {
            setLoading(true);
            const docRef = db!.collection(collectionName).doc(docId);
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

     const updateData = async (newData: T | ((p: T) => T)) => {
        const dataToSet = typeof newData === 'function' ? (newData as (p: T) => T)(data) : newData;
        // Optimistically update state
        setData(dataToSet);

        if (IS_LIVE_DATA) {
            try {
                const docRef = db!.collection(collectionName).doc(docId);
                await docRef.set(dataToSet, { merge: true });
            } catch (error: any) {
                console.error(`Failed to save document ${collectionName}/${docId}:`, error);
                alert(`Failed to save settings: ${error.message}`);
                // In a production app, we might roll back the optimistic update here.
            }
        }
    };

    return [data, updateData, loading] as const;
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Hooks for collections
    const [players, setPlayers, playersLoading] = useCollection<Player>('players', mock.MOCK_PLAYERS);
    const [events, setEvents, eventsLoading] = useCollection<GameEvent>('events', mock.MOCK_EVENTS);
    const [ranks, setRanks, ranksLoading] = useCollection<Rank>('ranks', mock.MOCK_RANKS);
    const [badges, setBadges, badgesLoading] = useCollection<Badge>('badges', mock.MOCK_BADGES);
    // FIX: Corrected typo 'MOCK_LEGENDary_BADGES' to 'MOCK_LEGENDARY_BADGES'.
    const [legendaryBadges, setLegendaryBadges, legendaryBadgesLoading] = useCollection<LegendaryBadge>('legendaryBadges', mock.MOCK_LEGENDARY_BADGES);
    const [gamificationSettings, setGamificationSettings, gamificationLoading] = useCollection<GamificationRule>('gamificationSettings', mock.MOCK_GAMIFICATION_SETTINGS, [], { isProtected: true });
    const [sponsors, setSponsors, sponsorsLoading] = useCollection<Sponsor>('sponsors', mock.MOCK_SPONSORS);
    const [socialLinks, setSocialLinks, socialLinksLoading] = useCollection<SocialLink>('socialLinks', mock.MOCK_SOCIAL_LINKS);
    const [carouselMedia, setCarouselMedia, carouselMediaLoading] = useCollection<CarouselMedia>('carouselMedia', mock.MOCK_CAROUSEL_MEDIA);
    const [vouchers, setVouchers, vouchersLoading] = useCollection<Voucher>('vouchers', mock.MOCK_VOUCHERS, [], { isProtected: true });
    const [inventory, setInventory, inventoryLoading] = useCollection<InventoryItem>('inventory', mock.MOCK_INVENTORY);
    const [suppliers, setSuppliers, suppliersLoading] = useCollection<Supplier>('suppliers', mock.MOCK_SUPPLIERS, [], { isProtected: true });
    const [transactions, setTransactions, transactionsLoading] = useCollection<Transaction>('transactions', mock.MOCK_TRANSACTIONS, [], { isProtected: true });
    const [locations, setLocations, locationsLoading] = useCollection<Location>('locations', mock.MOCK_LOCATIONS);
    const [raffles, setRaffles, rafflesLoading] = useCollection<Raffle>('raffles', mock.MOCK_RAFFLES);
    const [signups, setSignups, signupsLoading] = useCollection<Signup>('signups', mock.MOCK_SIGNUPS);
    const [sessions, setSessions, sessionsLoading] = useCollection<Session>('sessions', [], [], { isProtected: true });
    const [activityLog, setActivityLog, activityLogLoading] = useCollection<ActivityLog>('activityLog', [], [], { isProtected: true });
    
    // Hooks for single documents (settings)
    const [companyDetails, updateCompanyDetails, companyDetailsLoading] = useDocument<CompanyDetails>('settings', 'companyDetails', mock.MOCK_COMPANY_DETAILS);
    const [creatorDetails, updateCreatorDetails, creatorDetailsLoading] = useDocument<CreatorDetails & { apiSetupGuide: ApiGuideStep[] }>('settings', 'creatorDetails', mock.MOCK_CREATOR_DETAILS);

    const [isSeeding, setIsSeeding] = useState(false);
    const auth = useContext(AuthContext);

    const setCompanyDetails = useCallback(async (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => {
        await updateCompanyDetails(d);
    }, [updateCompanyDetails]);
    
    const setCreatorDetails = useCallback(async (d: (CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) | ((p: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) => CreatorDetails & { apiSetupGuide: ApiGuideStep[] })) => {
        await updateCreatorDetails(d);
    }, [updateCreatorDetails]);

    // Derived State
    const apiSetupGuide = useMemo(() => creatorDetails.apiSetupGuide || [], [creatorDetails.apiSetupGuide]);
    const setApiSetupGuide = useCallback((newGuide: ApiGuideStep[] | ((p: ApiGuideStep[]) => ApiGuideStep[])) => {
        setCreatorDetails(prev => ({ ...prev, apiSetupGuide: typeof newGuide === 'function' ? newGuide(prev.apiSetupGuide) : newGuide }));
    }, [setCreatorDetails]);

    const loading = [
        playersLoading, eventsLoading, ranksLoading, badgesLoading, legendaryBadgesLoading,
        gamificationLoading, sponsorsLoading, socialLinksLoading, carouselMediaLoading,
        vouchersLoading, inventoryLoading, suppliersLoading, transactionsLoading,
        locationsLoading, rafflesLoading, signupsLoading, companyDetailsLoading,
        creatorDetailsLoading, sessionsLoading, activityLogLoading
    ].some(Boolean);

    // Generic CRUD functions
    const addDoc = async <T extends {}>(collectionName: string, data: T): Promise<string> => {
        if (IS_LIVE_DATA) {
            const docRef = await db!.collection(collectionName).add(data);
            return docRef.id;
        } else {
            console.log(`(MOCK) ADDED to ${collectionName}:`, data);
            const newId = `mock_${Date.now()}`;
            return newId;
        }
    };
    
    const updateDoc = async <T extends { id: string; }>(collectionName: string, doc: T): Promise<void> => {
        if (IS_LIVE_DATA) {
            const { id, ...data } = doc;
            await db!.collection(collectionName).doc(id).set(data, { merge: true });
        } else {
            console.log(`(MOCK) UPDATED in ${collectionName}:`, doc);
        }
    };
    
    const deleteDoc = async (collectionName: string, docId: string): Promise<void> => {
        if (IS_LIVE_DATA) {
            await db!.collection(collectionName).doc(docId).delete();
        } else {
            console.log(`(MOCK) DELETED from ${collectionName}:`, docId);
        }
    };
    
    const setDoc = async <T extends {}>(collectionName: string, docId: string, data: T): Promise<void> => {
        if (IS_LIVE_DATA) {
            await db!.collection(collectionName).doc(docId).set(data);
        } else {
            console.log(`(MOCK) SET in ${collectionName} with ID ${docId}:`, data);
        }
    };

    const COLLECTIONS_TO_DELETE = [ 'players', 'events', 'signups', 'vouchers', 'inventory', 'suppliers', 'transactions', 'locations', 'raffles', 'sessions', 'activityLog' ];
    const COLLECTIONS_TO_SEED = [ 'players', 'events', 'ranks', 'badges', 'legendaryBadges', 'gamificationSettings', 'sponsors', 'socialLinks', 'carouselMedia', 'vouchers', 'inventory', 'suppliers', 'transactions', 'locations', 'raffles', 'signups' ];
    const SETTINGS_DOCS_TO_SEED = { 'settings': ['companyDetails', 'creatorDetails'] };

    const seedInitialData = useCallback(async () => { /* ... implementation ... */ }, []);
    const deleteAllData = async () => { /* ... implementation ... */ };
    const deleteAllPlayers = async () => { /* ... implementation ... */ };
    const restoreFromBackup = async (backupData: any) => { /* ... implementation ... */ };
    
    const logActivity = useCallback(async (action: string, details?: Record<string, any>) => {
        if (!auth?.user) return; // Don't log if no user
        const logEntry: Omit<ActivityLog, 'id' | 'timestamp'> & { timestamp: any } = {
            // FIX: Cast `firebase` object to `any` to resolve TypeScript error.
            // The `firebase` object is an empty placeholder when Firebase is disabled, causing a type error.
            // This change preserves the original logic for server-side timestamps if Firebase is re-enabled in the future.
            timestamp: USE_FIREBASE && (firebase as any).firestore ? (firebase as any).firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
            userId: auth.user.id,
            userName: auth.user.name,
            userRole: auth.user.role,
            action,
            details: details || {},
        };
        if (IS_LIVE_DATA) {
            await addDoc('activityLog', logEntry);
        } else {
            console.log("Activity Logged:", logEntry);
            setActivityLog(prev => [...prev, { ...logEntry, id: `log_${Date.now()}`, timestamp: new Date().toISOString() }]);
        }
    }, [auth?.user, setActivityLog]);

    const value: DataContextType = {
        players, setPlayers, events, setEvents, ranks, setRanks, badges, setBadges, legendaryBadges, setLegendaryBadges,
        gamificationSettings, setGamificationSettings, sponsors, setSponsors, companyDetails, setCompanyDetails,
        creatorDetails, setCreatorDetails, socialLinks, setSocialLinks, carouselMedia, setCarouselMedia,
        vouchers, setVouchers, inventory, setInventory, suppliers, setSuppliers, transactions, setTransactions,
        locations, setLocations, raffles, setRaffles, signups, setSignups,
        apiSetupGuide, setApiSetupGuide, sessions, setSessions, activityLog, setActivityLog,
        loading, isSeeding, seedInitialData, deleteAllData, deleteAllPlayers, restoreFromBackup,
        logActivity, addDoc, updateDoc, deleteDoc, setDoc,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
