import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { extractAndCleanStorageUrlsFromDoc } from '../utils/storageCleaner';
import * as mock from '../constants';
import type { Player, GameEvent, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, ApiGuideStep, Tier, Session, ActivityLog, FirestoreQuotaCounters, AdminNotification, PlayerHonor } from '../types';
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

// Helper to fetch collection data from Supabase or LocalStorage
function useCollection<T extends {id: string}>(
    collectionName: string, 
    mockData: T[], 
    options: { isProtected?: boolean } = {}
) {
    const storageKey = `app_data_${collectionName}`;

    const getStoredFallback = (): T[] => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn(`Failed to read ${storageKey} from storage:`, e);
        }
        return mockData;
    };

    const [data, setData] = useState<T[]>(() => IS_LIVE_DATA ? [] : getStoredFallback());
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);
    const isAuthenticated = auth?.isAuthenticated;
    const isProtected = !!options.isProtected;

    // Wrapped setter that automatically mirrors to localStorage
    const setCollectionData = useCallback((action: React.SetStateAction<T[]>) => {
        setData(prev => {
            const next = typeof action === 'function' ? (action as (p: T[]) => T[])(prev) : action;
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
            } catch (err) {
                console.warn(`Failed to persist ${storageKey} to storage:`, err);
            }
            return next;
        });
    }, [storageKey]);

    useEffect(() => {
        if (IS_LIVE_DATA && supabase) {
            if (isProtected && !isAuthenticated) {
                setData([]); 
                setLoading(false);
                return; 
            }

            setLoading(true);
            let isMounted = true;
            
            // Initial Fetch with error fallback to LocalStorage/Mock
            supabase.from(collectionName).select('*')
                .then(({ data: fetchedData, error }) => {
                    if (!isMounted) return;
                    if (error) {
                        console.warn(`Could not fetch ${collectionName} from Supabase, using local fallback:`, error.message || error);
                        setData(getStoredFallback());
                    } else {
                        if (fetchedData && fetchedData.length > 0) {
                            recordDatabaseActivity('reads', fetchedData.length);
                            setCollectionData(fetchedData as unknown as T[]);
                        } else {
                            setData(getStoredFallback());
                        }
                    }
                    setLoading(false);
                })
                .catch(err => {
                    if (!isMounted) return;
                    console.warn(`Network error fetching ${collectionName}, using local fallback:`, err?.message || err);
                    setData(getStoredFallback());
                    setLoading(false);
                });

            // Realtime Subscription
            let channel: any = null;
            try {
                channel = supabase.channel(`public:${collectionName}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, (payload) => {
                        recordDatabaseActivity('reads', 1);
                        if (payload.eventType === 'INSERT') {
                            setCollectionData(currentData => {
                                const newDoc = payload.new as unknown as T;
                                return [...currentData.filter(item => (item as any).id !== (newDoc as any).id), newDoc];
                            });
                        } else if (payload.eventType === 'UPDATE') {
                            setCollectionData(currentData => currentData.map(item => {
                                if ((item as any).id === (payload.new as any).id) {
                                    const { id, ...rest } = payload.new as any;
                                    const updated = { ...item };
                                    for (const key in rest) {
                                        if (rest[key] !== undefined) (updated as any)[key] = rest[key];
                                    }
                                    return updated;
                                }
                                return item;
                            }));
                        } else if (payload.eventType === 'DELETE') {
                            setCollectionData(currentData => currentData.filter(item => item.id !== (payload.old as any).id));
                        }
                    })
                    .subscribe();
            } catch (subErr) {
                console.warn(`Could not subscribe to realtime changes for ${collectionName}:`, subErr);
            }

            return () => {
                isMounted = false;
                if (channel) {
                    try {
                        supabase.removeChannel(channel);
                    } catch {}
                }
            };
        } else {
            setData(getStoredFallback());
            setLoading(false);
        }
    }, [collectionName, isAuthenticated, isProtected]);

    return [data, setCollectionData, loading] as const;
}

// Helper to fetch a single document from Supabase (mapped to a table row by ID)
function useDocument<T>(collectionName: string, docId: string, mockData: T) {
    const storageKey = `app_doc_${collectionName}_${docId}`;

    const getStoredFallback = (): T => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...mockData, ...parsed };
            }
        } catch (e) {
            console.warn(`Failed to read document ${storageKey} from storage:`, e);
        }
        return mockData;
    };

    const [data, setData] = useState<T>(() => getStoredFallback());
    const [loading, setLoading] = useState(true);

    const updateStoredDoc = useCallback((updated: T) => {
        setData(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (err) {
            console.warn(`Failed to save document ${storageKey} to storage:`, err);
        }
    }, [storageKey]);

    useEffect(() => {
        if (IS_LIVE_DATA && supabase) {
            setLoading(true);
            let isMounted = true;
            
            supabase.from(collectionName).select('*').eq('id', docId)
                .then(({ data: fetchedRows, error }) => {
                    if (!isMounted) return;
                    if (fetchedRows && fetchedRows.length > 0) {
                        recordDatabaseActivity('reads', 1);
                        const { id, ...rest } = fetchedRows[0];
                        setData(prev => {
                            const merged = { ...prev, ...mockData };
                            for (const k in mockData) {
                                if (rest[k] !== null && rest[k] !== undefined) {
                                    (merged as any)[k] = rest[k];
                                } else if ((prev as any)[k] !== undefined) {
                                    (merged as any)[k] = (prev as any)[k];
                                }
                            }
                            try {
                                localStorage.setItem(storageKey, JSON.stringify(merged));
                            } catch {}
                            return merged;
                        });
                    } else if (error) {
                        console.warn(`Could not fetch document ${collectionName}/${docId}:`, error.message || error);
                        setData(getStoredFallback());
                    }
                    setLoading(false);
                })
                .catch(err => {
                    if (!isMounted) return;
                    console.warn(`Network error fetching document ${collectionName}/${docId}:`, err?.message || err);
                    setData(getStoredFallback());
                    setLoading(false);
                });

            // Subscription for this specific document/row
            let channel: any = null;
            try {
                channel = supabase.channel(`public:${collectionName}:${docId}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: `id=eq.${docId}` }, (payload) => {
                         recordDatabaseActivity('reads', 1);
                         if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                             const { id, ...rest } = payload.new as any;
                             setData(prev => {
                                 const merged = { ...prev };
                                 for (const key in mockData) {
                                     if (rest[key] !== undefined && rest[key] !== null) {
                                         (merged as any)[key] = rest[key];
                                     }
                                 }
                                 try {
                                     localStorage.setItem(storageKey, JSON.stringify(merged));
                                 } catch {}
                                 return merged;
                             });
                         }
                    })
                    .subscribe();
            } catch (subErr) {
                console.warn(`Could not subscribe to document changes for ${collectionName}/${docId}:`, subErr);
            }

            return () => {
                isMounted = false;
                if (channel) {
                    try {
                        supabase.removeChannel(channel);
                    } catch {}
                }
            };
        } else {
            setData(getStoredFallback());
            setLoading(false);
        }
    }, [collectionName, docId, storageKey]);

     const updateData = useCallback(async (newData: Partial<T>) => {
        let diffData: Partial<T> = {};
        let hasChanges = false;
        
        setData(prev => {
            for (const key in newData) {
                if (newData[key] !== (prev as any)[key]) {
                    (diffData as any)[key] = newData[key];
                    hasChanges = true;
                }
            }
            
            const updated = { ...prev, ...diffData };
            try {
                localStorage.setItem(storageKey, JSON.stringify(updated));
            } catch (err) {
                console.warn(`Failed to persist document ${storageKey}:`, err);
            }
            return updated;
        });

        if (!hasChanges) return;

        if (IS_LIVE_DATA && supabase) {
            try {
                const payload = { id: docId, ...diffData };
                const { error } = await supabase.from(collectionName).upsert(payload);
                if (error) {
                    console.warn(`Failed to update ${collectionName}/${docId}:`, error.message || error);
                    alert(`Failed to save to database: ${error.message}`);
                } else {
                    recordDatabaseActivity('writes', 1);
                }
            } catch (error: any) {
                console.warn(`Failed to save document ${collectionName}/${docId}:`, error?.message || error);
            }
        }
    }, [collectionName, docId, storageKey]);
    
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
    notifications: mock.MOCK_NOTIFICATIONS,
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
    honors: PlayerHonor[]; setHonors: (d: PlayerHonor[] | ((p: PlayerHonor[]) => PlayerHonor[])) => void;
    signups: Signup[]; setSignups: (d: Signup[] | ((p: Signup[]) => Signup[])) => void;
    apiSetupGuide: ApiGuideStep[]; setApiSetupGuide: (d: ApiGuideStep[] | ((p: ApiGuideStep[]) => ApiGuideStep[])) => void;
    sessions: Session[]; setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    activityLog: ActivityLog[]; setActivityLog: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
    logActivity: (action: string, details?: Record<string, any>) => Promise<void>;
    notifications: AdminNotification[]; setNotifications: React.Dispatch<React.SetStateAction<AdminNotification[]>>;
    createNotification: (notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'> & Partial<AdminNotification>) => Promise<string>;
    markAllNotificationsAsRead: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;

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

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

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
    const [honors, setHonors, loadingHonors] = useCollection<PlayerHonor>('honors', mock.MOCK_HONORS, { isProtected: true });
    const [signups, setSignups, loadingSignups] = useCollection<Signup>('signups', MOCK_DATA_MAP.signups, { isProtected: true });
    const [sessions, setSessions, loadingSessions] = useCollection<Session>('sessions', [], { isProtected: true });
    const [activityLog, setActivityLog, loadingActivityLog] = useCollection<ActivityLog>('activityLog', [], { isProtected: true });
    const [notifications, setNotifications, loadingNotifications] = useCollection<AdminNotification>('notifications', MOCK_DATA_MAP.notifications, { isProtected: true });

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

    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingSponsors || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingSocialLinks || loadingCarouselMedia || loadingSignups || loadingCompanyCore || loadingBranding || loadingContent || loadingCreatorCore || loadingApiGuide || loadingSessions || loadingActivityLog || loadingNotifications;
    
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
        
        // Optimistic Update
        const coreData: Partial<typeof mock.MOCK_COMPANY_CORE> = {};
        const brandingData: Partial<typeof mock.MOCK_BRANDING_DETAILS> = {};
        const contentData: Partial<typeof mock.MOCK_CONTENT_DETAILS> = {};

        let coreChanged = false;
        let brandingChanged = false;
        let contentChanged = false;

        for (const key in finalData) {
            const typedKey = key as keyof CompanyDetails;
            if (finalData[typedKey] !== companyDetails[typedKey]) {
                if (key in mock.MOCK_COMPANY_CORE) {
                    (coreData as any)[key] = finalData[typedKey];
                    coreChanged = true;
                } else if (key in mock.MOCK_BRANDING_DETAILS) {
                    (brandingData as any)[key] = finalData[typedKey];
                    brandingChanged = true;
                } else if (key in mock.MOCK_CONTENT_DETAILS) {
                    (contentData as any)[key] = finalData[typedKey];
                    contentChanged = true;
                }
            }
        }

        const promises = [];
        if (coreChanged) promises.push(updateCompanyCore(coreData));
        if (brandingChanged) promises.push(updateBrandingDetails(brandingData));
        if (contentChanged) promises.push(updateContentDetails(contentData));

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }, [companyDetails, updateCompanyCore, updateBrandingDetails, updateContentDetails]);

    const setCreatorDetails = useCallback(async (d: (CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) | ((p: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) => CreatorDetails & { apiSetupGuide: ApiGuideStep[] })) => {
        const finalData = typeof d === 'function' ? d(creatorDetails) : d;
        const { apiSetupGuide: _newGuide, ...coreData } = finalData;

        if (JSON.stringify(coreData) !== JSON.stringify(creatorCore)) {
            await updateCreatorCore(coreData);
        }
    }, [creatorDetails, creatorCore, updateCreatorCore]);

    // Stable reference to collection setters to prevent recreation of CRUD callbacks
    const collectionSettersRef = useRef<Record<string, React.Dispatch<React.SetStateAction<any[]>>>>({});
    collectionSettersRef.current = {
        players: setPlayers,
        events: setEvents,
        ranks: setRanks,
        badges: setBadges,
        legendaryBadges: setLegendaryBadges,
        gamificationSettings: setGamificationSettings,
        sponsors: setSponsors,
        vouchers: setVouchers,
        inventory: setInventory,
        suppliers: setSuppliers,
        transactions: setTransactions,
        locations: setLocations,
        raffles: setRaffles,
        honors: setHonors,
        signups: setSignups,
        sessions: setSessions,
        activityLog: setActivityLog,
        socialLinks: setSocialLinks,
        carouselMedia: setCarouselMedia,
        apiSetupGuide: setApiSetupGuide,
        notifications: setNotifications,
    };

    const setDoc = useCallback(async (collectionName: string, docId: string, data: object) => {
        const fullDoc = { id: docId, ...data };
        const setter = collectionSettersRef.current[collectionName];
        if (setter) {
            setter(prev => [...prev.filter(item => item.id !== docId), fullDoc]);
        }

        if (IS_LIVE_DATA && supabase) {
            try {
                const { error } = await supabase.from(collectionName).upsert(fullDoc);
                if (error) console.warn(`Supabase setDoc error on ${collectionName}:`, error.message || error);
                else recordDatabaseActivity('writes', 1);
            } catch (err: any) {
                console.warn(`Network error in setDoc (${collectionName}):`, err?.message || err);
            }
        }
    }, []);

    const addDoc = useCallback(async <T extends {}>(collectionName: string, data: T): Promise<string> => {
        const generatedId = (data as any).id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const payload = { id: generatedId, ...data };

        // Instant optimistic update
        const setter = collectionSettersRef.current[collectionName];
        if (setter) {
            setter(prev => [...prev.filter(item => item.id !== generatedId), payload]);
        }

        if (IS_LIVE_DATA && supabase) {
            try {
                const { data: insertedData, error } = await supabase.from(collectionName).insert(payload).select().single();
                if (error) {
                    console.warn(`Supabase addDoc error on ${collectionName}:`, error.message || error);
                } else {
                    recordDatabaseActivity('writes', 1);
                }
                return insertedData?.id || payload.id;
            } catch (err: any) {
                console.warn(`Network error in addDoc (${collectionName}):`, err?.message || err);
                return payload.id;
            }
        } else {
            return payload.id;
        }
    }, []);

    const updateDoc = useCallback(async <T extends {id: string}>(collectionName: string, doc: Partial<T> & {id: string}) => {
        // Find existing doc to diff against
        let existingDoc: any = null;
        const setter = collectionSettersRef.current[collectionName];
        if (setter) {
            setter(prev => {
                existingDoc = prev.find(item => item.id === doc.id);
                return prev.map(item => item.id === doc.id ? { ...item, ...doc } : item);
            });
        }

        if (IS_LIVE_DATA && supabase) {
            try {
                const { id, ...newData } = doc;
                let dataToUpdate: any = { ...newData };
                
                // If we found the existing doc, only push fields that actually changed
                if (existingDoc) {
                    dataToUpdate = {};
                    let hasChanges = false;
                    for (const key in newData) {
                        if (newData[key as keyof typeof newData] !== existingDoc[key]) {
                            dataToUpdate[key] = newData[key as keyof typeof newData];
                            hasChanges = true;
                        }
                    }
                    if (!hasChanges) return; // Nothing to update remotely
                }

                const { error } = await supabase.from(collectionName).update(dataToUpdate).eq('id', id);
                if (error) console.warn(`Supabase updateDoc error on ${collectionName}:`, error.message || error);
                else recordDatabaseActivity('writes', 1);
            } catch (err: any) {
                console.warn(`Network error in updateDoc (${collectionName}):`, err?.message || err);
            }
        }
    }, []);

    const deleteDoc = useCallback(async (collectionName: string, docId: string) => {
        // Find existing doc in state if possible to extract any storage URLs
        let targetDoc: any = null;
        const setter = collectionSettersRef.current[collectionName];
        if (setter) {
            setter(prev => {
                targetDoc = prev.find(item => item && item.id === docId);
                return prev.filter(item => item && item.id !== docId);
            });
        }

        // Clean associated images/files from Supabase Storage asynchronously
        if (targetDoc) {
            extractAndCleanStorageUrlsFromDoc(targetDoc).catch(err => {
                console.warn(`[StorageCleaner] Error cleaning files for ${collectionName}/${docId}:`, err);
            });
        }

        if (IS_LIVE_DATA && supabase) {
            try {
                // Manually cascade deletes to prevent foreign key constraint violations
                if (collectionName === 'players') {
                    console.log(`Cascading deletes for player ${docId}...`);
                    await Promise.all([
                        supabase.from('signups').delete().eq('playerId', docId),
                        supabase.from('transactions').delete().eq('playerId', docId),
                        supabase.from('vouchers').delete().eq('assignedToPlayerId', docId),
                        supabase.from('honors').delete().eq('playerId', docId),
                        supabase.from('sessions').delete().eq('id', docId),
                        supabase.from('activityLog').delete().eq('playerId', docId)
                    ]);
                } else if (collectionName === 'events') {
                    console.log(`Cascading deletes for event ${docId}...`);
                    await Promise.all([
                        supabase.from('signups').delete().eq('eventId', docId)
                    ]);
                }

                const { error } = await supabase.from(collectionName).delete().eq('id', docId);
                if (error) {
                    console.warn(`Supabase deleteDoc error on ${collectionName}:`, error.message || error);
                    alert(`Failed to delete: ${error.message}`);
                    // Revert the optimistic UI update
                    if (setter && targetDoc) {
                        setter(prev => [...prev, targetDoc]);
                    }
                } else {
                    recordDatabaseActivity('deletes', 1);
                }
            } catch (err: any) {
                console.warn(`Network error in deleteDoc (${collectionName}):`, err?.message || err);
                alert(`Network error deleting document: ${err?.message || err}`);
                // Revert the optimistic UI update
                if (setter && targetDoc) {
                    setter(prev => [...prev, targetDoc]);
                }
            }
        }
    }, []);

    const logActivity = useCallback(async (action: string, details?: Record<string, any>) => {
        if (!auth?.user) return;

        const logId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const logEntryData: ActivityLog = {
            id: logId,
            userId: auth.user.id,
            userName: auth.user.name,
            userRole: auth.user.role,
            action,
            details: details || {},
            timestamp: new Date().toISOString()
        };
        
        // Optimistic update
        setActivityLog(prev => [logEntryData, ...prev.slice(0, 99)]);

        if (IS_LIVE_DATA && supabase) {
            try {
                await supabase.from('activityLog').insert(logEntryData);
                recordDatabaseActivity('writes', 1);
            } catch (error: any) {
                console.warn("Failed to log activity remotely:", error?.message || error);
            }
        }
    }, [auth?.user?.id, auth?.user?.name, auth?.user?.role, setActivityLog]);

    const createNotification = useCallback(async (notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'> & Partial<AdminNotification>): Promise<string> => {
        const notifId = notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const newNotif: AdminNotification = {
            id: notifId,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            timestamp: notif.timestamp || new Date().toISOString(),
            read: notif.read || false,
            playerId: notif.playerId,
            playerName: notif.playerName,
            playerCallsign: notif.playerCallsign,
            playerCode: notif.playerCode,
            playerAvatarUrl: notif.playerAvatarUrl,
            badgeId: notif.badgeId,
            badgeName: notif.badgeName,
            badgeIconUrl: notif.badgeIconUrl,
            badgeDescription: notif.badgeDescription,
            badgeCriteria: notif.badgeCriteria,
            rankName: notif.rankName,
            rankIconUrl: notif.rankIconUrl,
            eventId: notif.eventId,
            eventTitle: notif.eventTitle,
            details: notif.details,
        };

        // Optimistic update
        setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== notifId)]);

        if (IS_LIVE_DATA && supabase) {
            try {
                await supabase.from('notifications').insert(newNotif);
                recordDatabaseActivity('writes', 1);
            } catch (error: any) {
                console.warn("Failed to create notification remotely:", error?.message || error);
            }
        }
        return notifId;
    }, [setNotifications]);

    const markAllNotificationsAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        if (IS_LIVE_DATA && supabase) {
            try {
                await supabase.from('notifications').update({ read: true }).eq('read', false);
                recordDatabaseActivity('writes', 1);
            } catch (error: any) {
                console.warn("Failed to mark notifications read remotely:", error?.message || error);
            }
        }
    }, [setNotifications]);

    const clearAllNotifications = useCallback(async () => {
        setNotifications([]);

        if (IS_LIVE_DATA && supabase) {
            try {
                await supabase.from('notifications').delete().gte('id', '');
                recordDatabaseActivity('deletes', 1);
            } catch (error: any) {
                console.warn("Failed to clear notifications remotely:", error?.message || error);
            }
        }
    }, [setNotifications]);

    const seedCollection = useCallback(async (collectionName: SeedableCollection) => {
        if (!IS_LIVE_DATA || !supabase) return;
        const dataToSeed = MOCK_DATA_MAP[collectionName];
        if (!dataToSeed) {
            console.error(`No mock data found for collection: ${collectionName}`);
            return;
        }

        console.log(`Seeding collection: ${collectionName}...`);
        
        if (Array.isArray(dataToSeed)) {
            try {
                const { error } = await supabase.from(collectionName).upsert(dataToSeed);
                if (error) console.warn(`Error seeding ${collectionName}:`, error.message || error);
                else recordDatabaseActivity('writes', dataToSeed.length);
            } catch (err: any) {
                console.warn(`Network error seeding ${collectionName}:`, err?.message || err);
            }
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
            await seedCollection('notifications');
            
            // Deconstructed Settings
            try {
                await supabase.from('settings').upsert([
                    { id: 'companyDetails', ...mock.MOCK_COMPANY_CORE },
                    { id: 'brandingDetails', ...mock.MOCK_BRANDING_DETAILS },
                    { id: 'contentDetails', ...mock.MOCK_CONTENT_DETAILS },
                    { id: 'creatorDetails', ...mock.MOCK_CREATOR_CORE }
                ]);
                recordDatabaseActivity('writes', 4);
            } catch (err: any) {
                console.warn("Could not seed settings:", err?.message || err);
            }
            
            // Admin User
            try {
                const { id: adminId, ...adminData } = mock.MOCK_ADMIN;
                await supabase.from('admins').upsert({ id: adminId, ...adminData });
                recordDatabaseActivity('writes', 1);
            } catch (err: any) {
                console.warn("Could not seed admin:", err?.message || err);
            }

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
            console.warn("Error seeding initial data: ", error);
        } finally {
            setIsSeeding(false);
        }
    }, [seedCollection]);
    
    // One-time initial seeding check has been removed.
    // If you want to seed data, do it manually.

    const deleteAllData = useCallback(async () => {
        if (!IS_LIVE_DATA) {
            setPlayers(MOCK_DATA_MAP.players);
            setEvents(MOCK_DATA_MAP.events);
            return;
        }
        
        try {
            console.log("Attempting to delete all transactional data via RPC...");
            if (supabase) {
                const { error: rpcError } = await supabase.rpc('delete_all_data');
                
                if (rpcError) {
                    console.warn("RPC failed or not found, falling back to manual client-side deletion...", rpcError);
                    // Ordered carefully to prevent Foreign Key constraint violations
                    const collectionsToDelete = [
                        'signups', 'transactions', 'vouchers', 'honors', 'activityLog', 'sessions', 
                        'players', 'events', 'inventory', 'raffles', 'suppliers', 'sponsors', 
                        'locations', 'socialLinks', 'carouselMedia', 'notifications', 'settings'
                    ];
                    for (const collectionName of collectionsToDelete) {
                        const { data } = await supabase.from(collectionName).select('id');
                        if (data && data.length > 0) {
                            const ids = data.map(d => d.id);
                            // Delete in chunks of 500 to avoid URL length limits
                            for (let i = 0; i < ids.length; i += 500) {
                                const chunk = ids.slice(i, i + 500);
                                await supabase.from(collectionName).delete().in('id', chunk);
                            }
                        }
                    }
                }
                recordDatabaseActivity('deletes', 1);
            }
            console.log('All transactional data deleted.');
            alert('All data wiped successfully!');
            window.location.reload();
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
                console.log("Attempting to delete all players via RPC...");
                const { error: rpcError } = await supabase.rpc('delete_all_players');
                
                if (rpcError) {
                    console.warn("RPC failed, falling back to manual client-side deletion...", rpcError);
                    const dependentTables = ['signups', 'transactions', 'vouchers', 'honors', 'activityLog', 'sessions'];
                    for (const table of dependentTables) {
                         const { data } = await supabase.from(table).select('id');
                         if (data && data.length > 0) {
                             const ids = data.map(d => d.id);
                             for (let i = 0; i < ids.length; i += 500) {
                                 await supabase.from(table).delete().in('id', ids.slice(i, i + 500));
                             }
                         }
                    }

                    console.log("Deleting all players manually...");
                    const { data: players } = await supabase.from('players').select('id');
                    if (players && players.length > 0) {
                        const pIds = players.map(p => p.id);
                        for (let i = 0; i < pIds.length; i += 500) {
                            await supabase.from('players').delete().in('id', pIds.slice(i, i + 500));
                        }
                    }
                }
                recordDatabaseActivity('deletes', 1);
                console.log(`All players have been deleted.`);
                alert('All players wiped successfully!');
                window.location.reload();
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
        honors, setHonors,
        signups, setSignups,
        apiSetupGuide, setApiSetupGuide,
        sessions, setSessions,
        activityLog, setActivityLog,
        logActivity,
        notifications, setNotifications,
        createNotification,
        markAllNotificationsAsRead,
        clearAllNotifications,
        
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
        honors, setHonors,
        signups, setSignups,
        apiSetupGuide, setApiSetupGuide,
        sessions, setSessions,
        activityLog, setActivityLog,
        logActivity,
        notifications, setNotifications,
        createNotification,
        markAllNotificationsAsRead,
        clearAllNotifications,
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
