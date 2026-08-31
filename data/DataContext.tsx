import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { extractAndCleanStorageUrlsFromDoc } from '../utils/storageCleaner';
import * as mock from '../constants';
import { getRankForPlayer } from '../utils/rankUtils';
import { normalizePlayerRow, normalizeRankRow, prepareSupabasePayload } from '../utils/supabaseSchema';
import type { Player, GameEvent, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, ApiGuideStep, Tier, Session, ActivityLog, FirestoreQuotaCounters, AdminNotification, PlayerHonor, TacticalRuleSet, GameType } from '../types';
import { AuthContext } from '../auth/AuthContext';

export const IS_LIVE_DATA = isSupabaseConfigured();

const TODAY_KEY = new Date().toISOString().split('T')[0];

const INITIAL_QUOTA_COUNTERS: FirestoreQuotaCounters = {
    date: TODAY_KEY,
    reads: 0,
    writes: 0,
    deletes: 0,
};

// Global memory for quota tracking in-memory
let globalQuota: FirestoreQuotaCounters = { ...INITIAL_QUOTA_COUNTERS };

function recordDatabaseActivity(type: 'reads' | 'writes' | 'deletes', amount: number = 1) {
    const currentDay = new Date().toISOString().split('T')[0];
    if (globalQuota.date !== currentDay) {
        globalQuota = { ...INITIAL_QUOTA_COUNTERS, date: currentDay, [type]: amount };
    } else {
        globalQuota = { ...globalQuota, [type]: globalQuota[type] + amount };
    }
}

// Normalizer dispatcher for collections
function normalizeCollectionItem<T>(collectionName: string, item: any): T {
    if (!item) return item;
    if (collectionName === 'players') {
        return normalizePlayerRow(item) as unknown as T;
    }
    if (collectionName === 'ranks') {
        return normalizeRankRow(item) as unknown as T;
    }
    return item as T;
}

// Helper to fetch collection data directly from Supabase with 100% live real-time sync (zero localStorage)
function useCollection<T extends {id: string}>(
    collectionName: string, 
    mockData: T[], 
    options: { isProtected?: boolean } = {}
) {
    const [data, setData] = useState<T[]>(() => mockData || []);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);
    const isAuthenticated = auth?.isAuthenticated;
    const isProtected = !!options.isProtected;

    useEffect(() => {
        if (!IS_LIVE_DATA || !supabase) {
            setData(mockData || []);
            setLoading(false);
            return;
        }

        if (isProtected && !isAuthenticated) {
            setData([]); 
            setLoading(false);
            return; 
        }

        setLoading(true);
        let isMounted = true;
        
        // Initial live fetch from Supabase
        supabase.from(collectionName).select('*')
            .then(({ data: fetchedData, error }) => {
                if (!isMounted) return;
                if (error) {
                    console.warn(`Live fetch notice on ${collectionName}:`, error.message || error);
                    setData(mockData || []);
                } else {
                    if (fetchedData && fetchedData.length > 0) {
                        recordDatabaseActivity('reads', fetchedData.length);
                        const normalizedFetched = fetchedData.map(row => normalizeCollectionItem<T>(collectionName, row));
                        const merged = [...(mockData || [])];
                        normalizedFetched.forEach(fetchedItem => {
                            const idx = merged.findIndex(item => (item as any).id === (fetchedItem as any).id);
                            if (idx > -1) {
                                merged[idx] = fetchedItem;
                            } else {
                                merged.push(fetchedItem);
                            }
                        });
                        setData(merged);
                    } else {
                        setData(mockData || []);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                console.warn(`Network notice on ${collectionName}:`, err?.message || err);
                setData(mockData || []);
                setLoading(false);
            });

        // Realtime Subscription directly from Supabase PostgreSQL
        let channel: any = null;
        try {
            channel = supabase.channel(`public:${collectionName}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, (payload) => {
                    recordDatabaseActivity('reads', 1);
                    if (payload.eventType === 'INSERT') {
                        const newDoc = normalizeCollectionItem<T>(collectionName, payload.new);
                        setData(currentData => [
                            ...currentData.filter(item => (item as any).id !== (newDoc as any).id), 
                            newDoc
                        ]);
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedDoc = normalizeCollectionItem<T>(collectionName, payload.new);
                        setData(currentData => currentData.map(item => {
                            if ((item as any).id === (updatedDoc as any).id) {
                                return { ...item, ...updatedDoc };
                            }
                            return item;
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        const deletedId = (payload.old as any)?.id;
                        setData(currentData => currentData.filter(item => (item as any).id !== deletedId));
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
    }, [collectionName, isAuthenticated, isProtected]);

    return [data, setData, loading] as const;
}

// Helper to safely extract field values matching camelCase, lower_case or lowercase from Supabase rows
function extractDocumentField(rawRow: Record<string, any>, key: string, fallback: any) {
    if (!rawRow) return fallback;
    const lowerKey = key.toLowerCase();
    const directVal = rawRow[key];
    const lowerVal = rawRow[lowerKey];

    // Check direct key first
    if (directVal !== undefined && directVal !== null && directVal !== '') return directVal;
    // Check lowercase key
    if (lowerVal !== undefined && lowerVal !== null && lowerVal !== '') return lowerVal;
    // If either is explicitly non-undefined and non-null (even if 0 or false or empty string)
    if (directVal !== undefined && directVal !== null) return directVal;
    if (lowerVal !== undefined && lowerVal !== null) return lowerVal;

    return fallback;
}

// Helper to safely upsert a row to Supabase, stripping missing columns automatically if table schema does not include them yet
async function safeUpsertRow(table: string, initialPayload: any): Promise<boolean> {
    if (!supabase) return false;
    let currentPayload = { ...initialPayload };
    let attempts = 0;
    while (attempts < 10) {
        attempts++;
        const { error } = await supabase.from(table).upsert(currentPayload);
        if (!error) {
            recordDatabaseActivity('writes', 1);
            return true;
        }
        const msg = error.message || String(error);
        const match = msg.match(/Could not find the '([^']+)' column/i) || msg.match(/column "([^"]+)" of relation/i);
        if (match && match[1]) {
            const missingCol = match[1];
            let removed = false;
            for (const k of Object.keys(currentPayload)) {
                if (k === missingCol || k.toLowerCase() === missingCol.toLowerCase()) {
                    delete currentPayload[k];
                    removed = true;
                }
            }
            if (removed && Object.keys(currentPayload).length > 0) {
                console.warn(`Supabase table '${table}' missing column '${missingCol}'. Stripped missing column and retrying upsert...`);
                continue;
            }
        }
        console.warn(`Supabase upsert notice for ${table}:`, msg);
        break;
    }
    return false;
}

// Helper to fetch a single document from Supabase live with real-time sync (no localStorage)
function useDocument<T>(collectionName: string, docId: string, defaultShape: T) {
    const [data, setData] = useState<T>(() => defaultShape);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!IS_LIVE_DATA || !supabase) {
            setData(defaultShape);
            setLoading(false);
            return;
        }

        setLoading(true);
        let isMounted = true;
        
        // Initial live fetch from Supabase
        supabase.from(collectionName).select('*').eq('id', docId)
            .then(({ data: fetchedRows, error }) => {
                if (!isMounted) return;
                if (fetchedRows && fetchedRows.length > 0) {
                    recordDatabaseActivity('reads', 1);
                    const rawRow = fetchedRows[0] || {};
                    
                    setData(prev => {
                        const merged: any = { ...prev, ...defaultShape };
                        for (const k in defaultShape) {
                            merged[k] = extractDocumentField(rawRow, k, (prev as any)[k] ?? (defaultShape as any)[k]);
                        }
                        return merged;
                    });
                } else if (error) {
                    console.warn(`Live fetch note on ${collectionName}/${docId}:`, error.message || error);
                }
                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                console.warn(`Network note on ${collectionName}/${docId}:`, err?.message || err);
                setLoading(false);
            });

        // Subscription for this specific document/row
        let channel: any = null;
        try {
            channel = supabase.channel(`public:${collectionName}:${docId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: `id=eq.${docId}` }, (payload) => {
                     recordDatabaseActivity('reads', 1);
                     if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                         const rawRow = (payload.new as any) || {};
                         setData(prev => {
                             const merged: any = { ...prev };
                             for (const key in defaultShape) {
                                 merged[key] = extractDocumentField(rawRow, key, (prev as any)[key] ?? (defaultShape as any)[key]);
                             }
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
    }, [collectionName, docId]);

    const updateData = useCallback(async (newData: Partial<T>) => {
        if (!newData || Object.keys(newData).length === 0) return;

        // Immediate optimistic in-memory update
        setData(prev => ({ ...prev, ...newData }));

        if (IS_LIVE_DATA && supabase) {
            try {
                const payload: any = { id: docId };
                for (const key in newData) {
                    const val = (newData as any)[key];
                    payload[key] = val;
                    if (key.toLowerCase() !== key) {
                        payload[key.toLowerCase()] = val;
                    }
                }

                await safeUpsertRow(collectionName, payload);
            } catch (error: any) {
                console.warn(`Network error updating ${collectionName}/${docId}:`, error?.message || error);
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
    gameTypes: mock.MOCK_GAME_TYPES,
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
    tacticalRules: mock.MOCK_TACTICAL_RULE_SETS,
};
type SeedableCollection = keyof typeof MOCK_DATA_MAP;

export interface DataContextType {
    players: Player[]; setPlayers: (d: Player[] | ((p: Player[]) => Player[])) => void;
    events: GameEvent[]; setEvents: (d: GameEvent[] | ((p: GameEvent[]) => GameEvent[])) => void;
    gameTypes: GameType[]; setGameTypes: (d: GameType[] | ((p: GameType[]) => GameType[])) => void;
    ranks: Rank[]; setRanks: (d: Rank[] | ((p: Rank[]) => Rank[])) => void;
    badges: Badge[]; setBadges: (d: Badge[] | ((p: Badge[]) => Badge[])) => void;
    legendaryBadges: LegendaryBadge[]; setLegendaryBadges: (d: LegendaryBadge[] | ((p: LegendaryBadge[]) => LegendaryBadge[])) => void;
    gamificationSettings: GamificationSettings; setGamificationSettings: (d: GamificationSettings | ((p: GamificationSettings) => GamificationSettings)) => void;
    tacticalRules: TacticalRuleSet[]; setTacticalRules: (d: TacticalRuleSet[] | ((p: TacticalRuleSet[]) => TacticalRuleSet[])) => void;
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
    const [rawPlayers, setRawPlayers, loadingPlayers] = useCollection<Player>('players', MOCK_DATA_MAP.players, { isProtected: true });
    const [events, setEvents, loadingEvents] = useCollection<GameEvent>('events', MOCK_DATA_MAP.events, { isProtected: true });

    // Public collections for ranks & game types
    const [rawRanks, setRawRanks, loadingRanks] = useCollection<Rank>('ranks', MOCK_DATA_MAP.ranks);
    const [gameTypes, setGameTypes, loadingGameTypes] = useCollection<GameType>('gameTypes', MOCK_DATA_MAP.gameTypes);

    const ranks = useMemo(() => {
        if (!rawRanks || rawRanks.length === 0) {
            return MOCK_DATA_MAP.ranks;
        }
        return rawRanks;
    }, [rawRanks]);
    const setRanks = setRawRanks;

    const [badges, setBadges, loadingBadges] = useCollection<Badge>('badges', MOCK_DATA_MAP.badges, { isProtected: true });
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useCollection<LegendaryBadge>('legendaryBadges', MOCK_DATA_MAP.legendaryBadges, { isProtected: true });

    // Auto-calculate and ensure every player's rank strictly matches their current XP total
    // and dynamically resolve all earned badges and legendary badges to use the latest live database configurations.
    const players = useMemo(() => {
        return (rawPlayers || []).map(p => {
            if (!p) return p;

            // Map and resolve standard badges to their latest database definitions by ID
            const updatedBadges = (p.badges || []).map(pb => {
                const liveBadge = badges?.find(b => b.id === pb.id);
                return liveBadge ? { ...pb, ...liveBadge } : pb;
            });

            // Map and resolve legendary badges to their latest database definitions by ID
            const updatedLegendaryBadges = (p.legendaryBadges || []).map(lb => {
                const liveBadge = legendaryBadges?.find(b => b.id === lb.id);
                return liveBadge ? { ...lb, ...liveBadge } : lb;
            });

            const correctTier = getRankForPlayer(p, ranks);

            let rankUpdated = !p.rank || p.rank.id !== correctTier.id || p.rank.minXp !== correctTier.minXp || p.rank.name !== correctTier.name;
            
            // Check if nested badges are structurally different from the resolved live versions
            let badgesUpdated = JSON.stringify(p.badges) !== JSON.stringify(updatedBadges) || 
                                JSON.stringify(p.legendaryBadges) !== JSON.stringify(updatedLegendaryBadges);

            if (rankUpdated || badgesUpdated) {
                return { 
                    ...p, 
                    rank: correctTier,
                    badges: updatedBadges,
                    legendaryBadges: updatedLegendaryBadges
                };
            }
            return p;
        });
    }, [rawPlayers, ranks, badges, legendaryBadges]);
    const setPlayers = setRawPlayers;
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
    const [tacticalRules, setTacticalRules, loadingTacticalRules] = useCollection<TacticalRuleSet>('tacticalRules', MOCK_DATA_MAP.tacticalRules);
    
    const [isSeeding, setIsSeeding] = useState(false);
    const hasCheckedSeedRef = useRef(false);

    const loading = loadingPlayers || loadingEvents || loadingGameTypes || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingTacticalRules || loadingSponsors || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingSocialLinks || loadingCarouselMedia || loadingSignups || loadingCompanyCore || loadingBranding || loadingContent || loadingCreatorCore || loadingApiGuide || loadingSessions || loadingActivityLog || loadingNotifications;
    
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
            const typedKey = key as keyof CompanyDetails;
            const val = finalData[typedKey];
            if (key in mock.MOCK_COMPANY_CORE) {
                (coreData as any)[key] = val;
            } else if (key in mock.MOCK_BRANDING_DETAILS) {
                (brandingData as any)[key] = val;
            } else if (key in mock.MOCK_CONTENT_DETAILS) {
                (contentData as any)[key] = val;
            }
        }

        const promises = [];
        if (Object.keys(coreData).length > 0) promises.push(updateCompanyCore(coreData));
        if (Object.keys(brandingData).length > 0) promises.push(updateBrandingDetails(brandingData));
        if (Object.keys(contentData).length > 0) promises.push(updateContentDetails(contentData));

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
        gameTypes: setGameTypes,
        ranks: setRanks,
        badges: setBadges,
        legendaryBadges: setLegendaryBadges,
        gamificationSettings: setGamificationSettings,
        tacticalRules: setTacticalRules,
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
                const preparedPayload = prepareSupabasePayload(collectionName, fullDoc, ranks);
                await safeUpsertRow(collectionName, preparedPayload);
            } catch (err: any) {
                console.warn(`Network error in setDoc (${collectionName}):`, err?.message || err);
            }
        }
    }, [ranks]);

    const addDoc = useCallback(async <T extends {}>(collectionName: string, data: T): Promise<string> => {
        const generatedId = (data as any).id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const payload = { id: generatedId, ...data };

        if (collectionName === 'players') {
            const rawPayload: any = payload;
            if (rawPayload.stats?.xp !== undefined) {
                rawPayload.rank = getRankForPlayer({ stats: rawPayload.stats }, ranks);
            }
        }

        // Instant optimistic update
        const setter = collectionSettersRef.current[collectionName];
        if (setter) {
            setter(prev => [...prev.filter(item => item.id !== generatedId), payload]);
        }

        if (IS_LIVE_DATA && supabase) {
            try {
                const preparedPayload = prepareSupabasePayload(collectionName, payload, ranks);
                const success = await safeUpsertRow(collectionName, preparedPayload);
                if (success) {
                    recordDatabaseActivity('writes', 1);
                }
                return payload.id;
            } catch (err: any) {
                console.warn(`Network error in addDoc (${collectionName}):`, err?.message || err);
                return payload.id;
            }
        } else {
            return payload.id;
        }
    }, [ranks]);

    const updateDoc = useCallback(async <T extends {id: string}>(collectionName: string, doc: Partial<T> & {id: string}) => {
        const { id, ...newData } = doc;

        if (collectionName === 'players') {
            const rawDoc: any = doc;
            if (rawDoc.stats?.xp !== undefined) {
                const calculatedTier = getRankForPlayer({ stats: rawDoc.stats }, ranks);
                rawDoc.rank = calculatedTier;
                (newData as any).rank = calculatedTier;
            }
        }

        // Instant optimistic local update
        const setter = collectionSettersRef.current[collectionName];
        if (setter) {
            setter(prev => prev.map(item => item.id === id ? { ...item, ...doc } : item));
        }

        if (IS_LIVE_DATA && supabase) {
            try {
                const preparedPayload = prepareSupabasePayload(collectionName, { id, ...newData }, ranks);
                await safeUpsertRow(collectionName, preparedPayload);
            } catch (err: any) {
                console.warn(`Network error in updateDoc (${collectionName}):`, err?.message || err);
            }
        }
    }, [ranks]);

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
                const settingsDocs = [
                    { id: 'companyDetails', ...mock.MOCK_COMPANY_CORE },
                    { id: 'brandingDetails', ...mock.MOCK_BRANDING_DETAILS },
                    { id: 'contentDetails', ...mock.MOCK_CONTENT_DETAILS },
                    { id: 'creatorDetails', ...mock.MOCK_CREATOR_CORE }
                ];
                for (const docItem of settingsDocs) {
                    await safeUpsertRow('settings', docItem);
                }
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
        globalQuota = { ...INITIAL_QUOTA_COUNTERS };
    }, []);

    const value = useMemo<DataContextType>(() => ({
        players, setPlayers,
        events, setEvents,
        gameTypes, setGameTypes,
        ranks, setRanks,
        badges, setBadges,
        legendaryBadges, setLegendaryBadges,
        gamificationSettings, setGamificationSettings,
        tacticalRules, setTacticalRules,
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
        gameTypes, setGameTypes,
        ranks, setRanks,
        badges, setBadges,
        legendaryBadges, setLegendaryBadges,
        gamificationSettings, setGamificationSettings,
        tacticalRules, setTacticalRules,
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
