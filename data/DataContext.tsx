import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import * as mock from '../constants';
import type { Player, GameEvent, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, ApiGuideStep, Tier, Session, ActivityLog, FirestoreQuotaCounters } from '../types';
import { AuthContext } from '../auth/AuthContext';

export const IS_LIVE_DATA = isSupabaseConfigured();

const TODAY_KEY = new Date().toISOString().split('T')[0];

const INITIAL_QUOTA_COUNTERS: FirestoreQuotaCounters = {
    date: TODAY_KEY,
    reads: 0,
    writes: 0,
    deletes: 0,
};

// Global memory for quota tracking so we don't trigger cascading React re-renders on every read
let globalQuota = (() => {
    try {
        const saved = localStorage.getItem('supabaseQuotaCounters');
        if (saved) {
            const parsed: FirestoreQuotaCounters = JSON.parse(saved);
            if (parsed.date === TODAY_KEY) return parsed;
        }
    } catch (e) {
        console.error("Failed to parse quota counters from storage:", e);
    }
    return INITIAL_QUOTA_COUNTERS;
})();

function recordDatabaseActivity(type: 'reads' | 'writes' | 'deletes', amount: number = 1) {
    const currentDay = new Date().toISOString().split('T')[0];
    if (globalQuota.date !== currentDay) {
        globalQuota = { ...INITIAL_QUOTA_COUNTERS, date: currentDay, [type]: amount };
    } else {
        globalQuota = { ...globalQuota, [type]: globalQuota[type] + amount };
    }
    try {
        localStorage.setItem('supabaseQuotaCounters', JSON.stringify(globalQuota));
    } catch {
        // ignore storage errors
    }
}

// Helper to fetch collection data from Supabase
function useCollection<T extends {id: string}>(
    collectionName: string, 
    mockData: T[], 
    options: { isProtected?: boolean } = {}
) {
    const [data, setData] = useState<T[]>(IS_LIVE_DATA ? [] : mockData);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);
    const isAuthenticated = auth?.isAuthenticated;

    useEffect(() => {
        if (IS_LIVE_DATA && supabase) {
            if (options.isProtected && !isAuthenticated) {
                setData([]); 
                setLoading(false);
                return; 
            }

            setLoading(true);
            let isMounted = true;
            
            // Initial Fetch
            supabase.from(collectionName).select('*').then(({ data: fetchedData, error }) => {
                if (!isMounted) return;
                if (error) {
                    console.error(`Error fetching ${collectionName}:`, error);
                } else if (fetchedData) {
                    recordDatabaseActivity('reads', fetchedData.length);
                    setData(fetchedData as unknown as T[]);
                }
                setLoading(false);
            });

            // Realtime Subscription
            const channel = supabase.channel(`public:${collectionName}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, (payload) => {
                    recordDatabaseActivity('reads', 1);
                    if (payload.eventType === 'INSERT') {
                        setData(currentData => [...currentData.filter(item => item.id !== (payload.new as any).id), payload.new as unknown as T]);
                    } else if (payload.eventType === 'UPDATE') {
                        setData(currentData => currentData.map(item => item.id === (payload.new as any).id ? (payload.new as unknown as T) : item));
                    } else if (payload.eventType === 'DELETE') {
                        setData(currentData => currentData.filter(item => item.id !== (payload.old as any).id));
                    }
                })
                .subscribe();

            return () => {
                isMounted = false;
                supabase.removeChannel(channel);
            };
        } else {
            setData(mockData);
            setLoading(false);
        }
    }, [collectionName, isAuthenticated, options.isProtected]);

    return [data, setData, loading] as const;
}

// Helper to fetch a single document from Supabase (mapped to a table row by ID)
function useDocument<T>(collectionName: string, docId: string, mockData: T) {
    const [data, setData] = useState<T>(mockData);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (IS_LIVE_DATA && supabase) {
            setLoading(true);
            let isMounted = true;
            
            supabase.from(collectionName).select('*').eq('id', docId).maybeSingle()
                .then(({ data: fetchedData, error }) => {
                    if (!isMounted) return;
                    recordDatabaseActivity('reads', 1);
                    if (fetchedData) {
                        const { id, ...rest } = fetchedData;
                        setData({ ...mockData, ...rest });
                    } else if (error) {
                        console.error(`Error fetching document ${collectionName}/${docId}:`, error);
                    }
                    setLoading(false);
                });

            // Subscription for this specific document/row
            const channel = supabase.channel(`public:${collectionName}:${docId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: `id=eq.${docId}` }, (payload) => {
                     recordDatabaseActivity('reads', 1);
                     if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                         const { id, ...rest } = payload.new as any;
                         setData(prev => ({ ...prev, ...rest }));
                     }
                })
                .subscribe();

            return () => {
                isMounted = false;
                supabase.removeChannel(channel);
            };
        } else {
            setData(mockData);
            setLoading(false);
        }
    }, [collectionName, docId]);

     const updateData = useCallback(async (newData: Partial<T>) => {
        setData(prev => ({...prev, ...newData}));

        if (IS_LIVE_DATA && supabase) {
            try {
                const payload = { id: docId, ...newData };
                const { error } = await supabase.from(collectionName).upsert(payload);
                if (error) throw error;
                recordDatabaseActivity('writes', 1);
            } catch (error: any) {
                console.error(`Failed to save document ${collectionName}/${docId}:`, error);
                alert(`Failed to save settings: ${error.message}`);
            }
        }
    }, [collectionName, docId]);
    
    return [data, updateData, loading] as const;
}

const MOCK_DATA_MAP = {
    ranks: mock.MOCK_RANKS,
    badges: mock.MOCK_BADGES,
    legendaryBadges: mock.MOCK_LEGENDARY_BADGES,
    gamificationSettings: mock.MOCK_GAMIFICATION_SETTINGS,
    players: mock.MOCK_PLAYERS,
    events: mock.MOCK_EVENTS,
    signups: mock.MOCK_SIGNUPS,
    vouchers: mock.MOCK_VOUCHERS,
    inventory: mock.MOCK_INVENTORY,
    suppliers: mock.MOCK_SUPPLIERS,
    transactions: mock.MOCK_TRANSACTIONS,
    locations: mock.MOCK_LOCATIONS,
    raffles: mock.MOCK_RAFFLES,
    sponsors: mock.MOCK_SPONSORS,
    socialLinks: mock.MOCK_SOCIAL_LINKS,
    carouselMedia: mock.MOCK_CAROUSEL_MEDIA,
    apiSetupGuide: mock.MOCK_API_GUIDE,
};
type SeedableCollection = keyof typeof MOCK_DATA_MAP;

export interface DataContextType {
    players: Player[]; setPlayers: (d: Player[] | ((p: Player[]) => Player[])) => void;
    events: GameEvent[]; setEvents: (d: GameEvent[] | ((p: GameEvent[]) => GameEvent[])) => void;
    ranks: Rank[]; setRanks: (d: Rank[] | ((p: Rank[]) => Rank[])) => void;
    badges: Badge[]; setBadges: (d: Badge[] | ((p: Badge[]) => Badge[])) => void;
    legendaryBadges: LegendaryBadge[]; setLegendaryBadges: (d: LegendaryBadge[] | ((p: LegendaryBadge[]) => LegendaryBadge[])) => void;
    gamificationSettings: GamificationSettings; setGamificationSettings: (d: GamificationSettings | ((p: GamificationSettings) => GamificationSettings)) => void;
    sponsors: Sponsor[]; setSponsors: (d: Sponsor[] | ((p: Sponsor[]) => Sponsor[])) => void;
    companyDetails: CompanyDetails; setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => Promise<void>;
    creatorDetails: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }; setCreatorDetails: (d: (CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) | ((p: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) => CreatorDetails & { apiSetupGuide: ApiGuideStep[] })) => Promise<void>;
    socialLinks: SocialLink[]; setSocialLinks: (d: SocialLink[] | ((p: SocialLink[]) => SocialLink[])) => void;
    carouselMedia: CarouselMedia[]; setCarouselMedia: (d: CarouselMedia[] | ((p: CarouselMedia[]) => CarouselMedia[])) => void;
    vouchers: Voucher[]; setVouchers: (d: Voucher[] | ((p: Voucher[]) => Voucher[])) => void;
    inventory: InventoryItem[]; setInventory: (d: InventoryItem[] | ((p: InventoryItem[]) => InventoryItem[])) => void;
    suppliers: Supplier[]; setSuppliers: (d: Supplier[] | ((p: Supplier[]) => Supplier[])) => void;
    transactions: Transaction[]; setTransactions: (d: Transaction[] | ((p: Transaction[]) => Transaction[])) => void;
    locations: Location[]; setLocations: (d: Location[] | ((p: Location[]) => Location[])) => void;
    raffles: Raffle[]; setRaffles: (d: Raffle[] | ((p: Raffle[]) => Raffle[])) => void;
    signups: Signup[]; setSignups: (d: Signup[] | ((p: Signup[]) => Signup[])) => void;
    apiSetupGuide: ApiGuideStep[]; setApiSetupGuide: (d: ApiGuideStep[] | ((p: ApiGuideStep[]) => ApiGuideStep[])) => void;
    sessions: Session[]; setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    activityLog: ActivityLog[]; setActivityLog: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
    logActivity: (action: string, details?: Record<string, any>) => Promise<void>;

    // CRUD functions
    setDoc: (collectionName: string, docId: string, data: object) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<string>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    
    deleteAllData: () => Promise<void>;
    deleteAllPlayers: () => Promise<void>;
    restoreFromBackup: (backupData: any) => Promise<void>;
    seedInitialData: () => Promise<void>;
    seedCollection: (collectionName: SeedableCollection) => Promise<void>;
    loading: boolean;
    isSeeding: boolean;
    firestoreQuota: FirestoreQuotaCounters;
    resetFirestoreQuotaCounters: () => void;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);

    // Protected collections (require auth)
    const [players, setPlayers, loadingPlayers] = useCollection<Player>('players', MOCK_DATA_MAP.players, { isProtected: true });
    const [events, setEvents, loadingEvents] = useCollection<GameEvent>('events', MOCK_DATA_MAP.events, { isProtected: true });
    const [ranks, setRanks, loadingRanks] = useCollection<Rank>('ranks', MOCK_DATA_MAP.ranks, { isProtected: true });
    const [badges, setBadges, loadingBadges] = useCollection<Badge>('badges', MOCK_DATA_MAP.badges, { isProtected: true });
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useCollection<LegendaryBadge>('legendaryBadges', MOCK_DATA_MAP.legendaryBadges, { isProtected: true });
    const [gamificationSettings, setGamificationSettings, loadingGamification] = useCollection<GamificationRule>('gamificationSettings', MOCK_DATA_MAP.gamificationSettings, { isProtected: true });
    const [sponsors, setSponsors, loadingSponsors] = useCollection<Sponsor>('sponsors', MOCK_DATA_MAP.sponsors, { isProtected: true });
    const [vouchers, setVouchers, loadingVouchers] = useCollection<Voucher>('vouchers', MOCK_DATA_MAP.vouchers, { isProtected: true });
    const [inventory, setInventory, loadingInventory] = useCollection<InventoryItem>('inventory', MOCK_DATA_MAP.inventory, { isProtected: true });
    const [suppliers, setSuppliers, loadingSuppliers] = useCollection<Supplier>('suppliers', MOCK_DATA_MAP.suppliers, { isProtected: true });
    const [transactions, setTransactions, loadingTransactions] = useCollection<Transaction>('transactions', MOCK_DATA_MAP.transactions, { isProtected: true });
    const [locations, setLocations, loadingLocations] = useCollection<Location>('locations', MOCK_DATA_MAP.locations, { isProtected: true });
    const [raffles, setRaffles, loadingRaffles] = useCollection<Raffle>('raffles', MOCK_DATA_MAP.raffles, { isProtected: true });
    const [signups, setSignups, loadingSignups] = useCollection<Signup>('signups', MOCK_DATA_MAP.signups, { isProtected: true });
    const [sessions, setSessions, loadingSessions] = useCollection<Session>('sessions', [], { isProtected: true });
    const [activityLog, setActivityLog, loadingActivityLog] = useCollection<ActivityLog>('activityLog', [], { isProtected: true });

    // Settings Documents
    const [companyCore, updateCompanyCore, loadingCompanyCore] = useDocument('settings', 'companyDetails', mock.MOCK_COMPANY_CORE);
    const [brandingDetails, updateBrandingDetails, loadingBranding] = useDocument('settings', 'brandingDetails', mock.MOCK_BRANDING_DETAILS);
    const [contentDetails, updateContentDetails, loadingContent] = useDocument('settings', 'contentDetails', mock.MOCK_CONTENT_DETAILS);
    const [creatorCore, updateCreatorCore, loadingCreatorCore] = useDocument<CreatorDetails>('settings', 'creatorDetails', mock.MOCK_CREATOR_CORE);
    const [apiSetupGuide, setApiSetupGuide, loadingApiGuide] = useCollection<ApiGuideStep>('apiSetupGuide', MOCK_DATA_MAP.apiSetupGuide, { isProtected: true });

    // Public collections
    const [socialLinks, setSocialLinks, loadingSocialLinks] = useCollection<SocialLink>('socialLinks', MOCK_DATA_MAP.socialLinks);
    const [carouselMedia, setCarouselMedia, loadingCarouselMedia] = useCollection<CarouselMedia>('carouselMedia', MOCK_DATA_MAP.carouselMedia);
    
    const [isSeeding, setIsSeeding] = useState(false);
    const hasCheckedSeedRef = useRef(false);

    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingSponsors || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingSocialLinks || loadingCarouselMedia || loadingSignups || loadingCompanyCore || loadingBranding || loadingContent || loadingCreatorCore || loadingApiGuide || loadingSessions || loadingActivityLog;
    
    // Composite Objects
    const companyDetails = useMemo(() => ({
        ...companyCore,
        ...brandingDetails,
        ...contentDetails
    }), [companyCore, brandingDetails, contentDetails]) as CompanyDetails;

    const creatorDetails = useMemo(() => ({
        ...creatorCore,
        id: 'creatorDetails',
        apiSetupGuide: [...apiSetupGuide].sort((a,b) => a.id.localeCompare(b.id))
    }), [creatorCore, apiSetupGuide]) as CreatorDetails & { apiSetupGuide: ApiGuideStep[] };

    // Composite Setters
    const setCompanyDetails = useCallback(async (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => {
        const finalData = typeof d === 'function' ? d(companyDetails) : d;
        
        const coreData: Partial<typeof mock.MOCK_COMPANY_CORE> = {};
        const brandingData: Partial<typeof mock.MOCK_BRANDING_DETAILS> = {};
        const contentData: Partial<typeof mock.MOCK_CONTENT_DETAILS> = {};

        for (const key in finalData) {
            if (key in mock.MOCK_COMPANY_CORE) (coreData as any)[key] = (finalData as any)[key];
            else if (key in mock.MOCK_BRANDING_DETAILS) (brandingData as any)[key] = (finalData as any)[key];
            else if (key in mock.MOCK_CONTENT_DETAILS) (contentData as any)[key] = (finalData as any)[key];
        }

        const updates: Promise<any>[] = [];
        if (JSON.stringify(coreData) !== JSON.stringify(companyCore)) updates.push(updateCompanyCore(coreData));
        if (JSON.stringify(brandingData) !== JSON.stringify(brandingDetails)) updates.push(updateBrandingDetails(brandingData));
        if (JSON.stringify(contentData) !== JSON.stringify(contentDetails)) updates.push(updateContentDetails(contentData));
        
        await Promise.all(updates);
    }, [companyDetails, companyCore, brandingDetails, contentDetails, updateCompanyCore, updateBrandingDetails, updateContentDetails]);

    const setCreatorDetails = useCallback(async (d: (CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) | ((p: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) => CreatorDetails & { apiSetupGuide: ApiGuideStep[] })) => {
        const finalData = typeof d === 'function' ? d(creatorDetails) : d;
        const { apiSetupGuide: _newGuide, ...coreData } = finalData;

        if (JSON.stringify(coreData) !== JSON.stringify(creatorCore)) {
            await updateCreatorCore(coreData);
        }
    }, [creatorDetails, creatorCore, updateCreatorCore]);

    // Generic CRUD Functions
    const setDoc = useCallback(async (collectionName: string, docId: string, data: object) => {
        if (IS_LIVE_DATA && supabase) {
            const { error } = await supabase.from(collectionName).upsert({ id: docId, ...data });
            if (error) console.error("Error in setDoc:", error);
            else recordDatabaseActivity('writes', 1);
        }
    }, []);

    const addDoc = useCallback(async <T extends {}>(collectionName: string, data: T): Promise<string> => {
        if (IS_LIVE_DATA && supabase) {
            const { data: insertedData, error } = await supabase.from(collectionName).insert(data).select().single();
            if (error) {
                console.error("Error in addDoc:", error);
                throw error;
            }
            recordDatabaseActivity('writes', 1);
            return insertedData.id;
        } else {
            return `mock_${collectionName}_${Date.now()}`;
        }
    }, []);

    const updateDoc = useCallback(async <T extends {id: string}>(collectionName: string, doc: T) => {
        if (IS_LIVE_DATA && supabase) {
            const { id, ...data } = doc;
            const { error } = await supabase.from(collectionName).update(data).eq('id', id);
            if (error) console.error("Error in updateDoc:", error);
            else recordDatabaseActivity('writes', 1);
        }
    }, []);

    const deleteDoc = useCallback(async (collectionName: string, docId: string) => {
        if (IS_LIVE_DATA && supabase) {
            const { error } = await supabase.from(collectionName).delete().eq('id', docId);
            if (error) console.error("Error in deleteDoc:", error);
            else recordDatabaseActivity('deletes', 1);
        }
    }, []);

    const logActivity = useCallback(async (action: string, details?: Record<string, any>) => {
        if (!auth?.user) return;

        const logEntryData: Omit<ActivityLog, 'id' | 'timestamp'> = {
            userId: auth.user.id,
            userName: auth.user.name,
            userRole: auth.user.role,
            action,
            details: details || {},
        };
        
        if (IS_LIVE_DATA && supabase) {
            try {
                await supabase.from('activityLog').insert({ ...logEntryData, timestamp: new Date().toISOString() });
                recordDatabaseActivity('writes', 1);
            } catch (error) {
                console.error("Failed to log activity:", error);
            }
        }
    }, [auth?.user]);

    const seedCollection = useCallback(async (collectionName: SeedableCollection) => {
        if (!IS_LIVE_DATA || !supabase) return;
        const dataToSeed = MOCK_DATA_MAP[collectionName];
        if (!dataToSeed) {
            console.error(`No mock data found for collection: ${collectionName}`);
            return;
        }

        console.log(`Seeding collection: ${collectionName}...`);
        
        if (Array.isArray(dataToSeed)) {
             const { error } = await supabase.from(collectionName).upsert(dataToSeed);
             if (error) console.error(`Error seeding ${collectionName}:`, error);
             else recordDatabaseActivity('writes', dataToSeed.length);
        }
        console.log(`Successfully seeded ${collectionName}.`);
    }, []);

    const seedInitialData = useCallback(async () => {
        if (!IS_LIVE_DATA || !supabase) return;
        setIsSeeding(true);
        console.log("FRESH DATABASE DETECTED: Seeding all initial data...");
        try {
            await seedCollection('ranks');
            await seedCollection('badges');
            await seedCollection('legendaryBadges');
            await seedCollection('gamificationSettings');
            await seedCollection('apiSetupGuide');
            
            // Deconstructed Settings
            await supabase.from('settings').upsert([
                { id: 'companyDetails', ...mock.MOCK_COMPANY_CORE },
                { id: 'brandingDetails', ...mock.MOCK_BRANDING_DETAILS },
                { id: 'contentDetails', ...mock.MOCK_CONTENT_DETAILS },
                { id: 'creatorDetails', ...mock.MOCK_CREATOR_CORE }
            ]);
            recordDatabaseActivity('writes', 4);
            
            // Admin User
            const { id: adminId, ...adminData } = mock.MOCK_ADMIN;
            await supabase.from('admins').upsert({ id: adminId, ...adminData });
            recordDatabaseActivity('writes', 1);

            // Transactional Data
            await seedCollection('players');
            await seedCollection('events');
            await seedCollection('signups');
            await seedCollection('vouchers');
            await seedCollection('inventory');
            await seedCollection('suppliers');
            await seedCollection('transactions');
            await seedCollection('locations');
            await seedCollection('raffles');
            await seedCollection('sponsors');
            await seedCollection('socialLinks');
            await seedCollection('carouselMedia');
            
            console.log('All initial data seeded successfully.');
        } catch (error) {
            console.error("Error seeding initial data: ", error);
        } finally {
            setIsSeeding(false);
        }
    }, [seedCollection]);
    
    // One-time initial seeding check
    useEffect(() => {
        if (!IS_LIVE_DATA || !supabase || hasCheckedSeedRef.current) return;
        if (!loading) {
            hasCheckedSeedRef.current = true;
            const checkAndSeed = async () => {
                try {
                    const { data, error } = await supabase.from('settings').select('id').eq('id', 'companyDetails').maybeSingle();
                    recordDatabaseActivity('reads', 1);
                    if (!data || error) {
                        await seedInitialData();
                    }
                } catch (err) {
                    console.error("Error checking initial seed:", err);
                }
            };
            checkAndSeed();
        }
    }, [loading, seedInitialData]);

    const deleteAllData = useCallback(async () => {
        if (!IS_LIVE_DATA) {
            setPlayers(MOCK_DATA_MAP.players);
            setEvents(MOCK_DATA_MAP.events);
            return;
        }
        
        const collectionsToDelete = ['players', 'events', 'signups', 'vouchers', 'inventory', 'transactions', 'raffles', 'suppliers', 'sponsors', 'locations', 'socialLinks', 'carouselMedia', 'sessions', 'activityLog'];
        
        try {
            console.log("Deleting all transactional data...");
            for (const collectionName of collectionsToDelete) {
                if (supabase) {
                    const { error } = await supabase.from(collectionName).delete().gte('id', ''); 
                    if (error) console.error(`Error clearing ${collectionName}:`, error);
                    recordDatabaseActivity('deletes', 1);
                }
            }
            console.log('All transactional data deleted.');
        } catch (error) {
            console.error("Error deleting all data: ", error);
        }
    }, [setPlayers, setEvents]);
    
    const deleteAllPlayers = useCallback(async () => {
        if (!IS_LIVE_DATA) {
            setPlayers([]);
            return;
        }
        
        try {
            if (supabase) {
                console.log("Deleting all players...");
                const { error } = await supabase.from('players').delete().gte('id', '');
                if (error) throw error;
                recordDatabaseActivity('deletes', 1);
                console.log(`All players have been deleted.`);
            }
        } catch (error) {
            console.error("Error deleting all players: ", error);
            throw error;
        }
    }, [setPlayers]);

    const restoreFromBackup = useCallback(async (_backupData: any) => {
        alert("Restore feature currently requires manual SQL execution or batch script update.");
    }, []);

    const resetFirestoreQuotaCounters = useCallback(() => {
        globalQuota = INITIAL_QUOTA_COUNTERS;
        try {
            localStorage.setItem('supabaseQuotaCounters', JSON.stringify(globalQuota));
        } catch {
            // ignore
        }
    }, []);

    const value = useMemo<DataContextType>(() => ({
        players, setPlayers,
        events, setEvents,
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
        signups, setSignups,
        apiSetupGuide, setApiSetupGuide,
        sessions, setSessions,
        activityLog, setActivityLog,
        logActivity,
        
        setDoc,
        updateDoc,
        addDoc,
        deleteDoc,

        deleteAllData,
        deleteAllPlayers,
        restoreFromBackup,
        seedInitialData,
        seedCollection,
        loading,
        isSeeding,
        firestoreQuota: globalQuota,
        resetFirestoreQuotaCounters,
    }), [
        players, setPlayers,
        events, setEvents,
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
        signups, setSignups,
        apiSetupGuide, setApiSetupGuide,
        sessions, setSessions,
        activityLog, setActivityLog,
        logActivity,
        setDoc, updateDoc, addDoc, deleteDoc,
        deleteAllData, deleteAllPlayers, restoreFromBackup,
        seedInitialData, seedCollection,
        loading, isSeeding, resetFirestoreQuotaCounters
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
