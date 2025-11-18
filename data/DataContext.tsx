import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo } from 'react';
import { USE_FIREBASE, db, firebaseInitializationError } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, ApiGuideStep, Tier } from '../types';
import { AuthContext } from '../auth/AuthContext';

export const IS_LIVE_DATA = USE_FIREBASE && !!db && !firebaseInitializationError;

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

            // Specifically block players from fetching admin-only collections
            if (userRole === 'player' && collectionName === 'transactions') {
                setData([]);
                setLoading(false);
                return;
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
    // Add auth?.isAuthenticated and user role to dependency array to refetch on login/logout or role change
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

     const updateData = async (newData: Partial<T>) => {
        // Optimistically update the state for a responsive UI.
        setData(prev => ({...prev, ...newData}));

        if (IS_LIVE_DATA) {
            try {
                const docRef = db.collection(collectionName).doc(docId);
                // Persist the change. The onSnapshot listener will also get this update,
                // but our deep comparison check prevents a redundant re-render.
                await docRef.set(newData, { merge: true });
            } catch (error: any) {
                console.error(`Failed to save document ${collectionName}/${docId}:`, error);
                alert(`Failed to save settings: ${error.message}`);
                // In a production app, we might roll back the optimistic update here.
            }
        }
    };
    
    return [data, updateData, loading] as const;
}

// FIX: Correctly map all mock data exports from constants.ts
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


// --- START OF TYPE DEFINITION ---
// The exported types will be composite types for ease of use in components
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
}
// --- END OF TYPE DEFINITION ---


export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Protected collections (require auth)
    const [players, setPlayers, loadingPlayers] = useCollection<Player>('players', MOCK_DATA_MAP.players, [], { isProtected: true });
    const [events, setEvents, loadingEvents] = useCollection<GameEvent>('events', MOCK_DATA_MAP.events, [], { isProtected: true });
    const [ranks, setRanks, loadingRanks] = useCollection<Rank>('ranks', MOCK_DATA_MAP.ranks, [], { isProtected: true });
    const [badges, setBadges, loadingBadges] = useCollection<Badge>('badges', MOCK_DATA_MAP.badges, [], { isProtected: true });
    const [legendaryBadges, setLegendaryBadges, loadingLegendary] = useCollection<LegendaryBadge>('legendaryBadges', MOCK_DATA_MAP.legendaryBadges, [], { isProtected: true });
    const [gamificationSettings, setGamificationSettings, loadingGamification] = useCollection<GamificationRule>('gamificationSettings', MOCK_DATA_MAP.gamificationSettings, [], { isProtected: true });
    const [sponsors, setSponsors, loadingSponsors] = useCollection<Sponsor>('sponsors', MOCK_DATA_MAP.sponsors, [], { isProtected: true });
    const [vouchers, setVouchers, loadingVouchers] = useCollection<Voucher>('vouchers', MOCK_DATA_MAP.vouchers, [], { isProtected: true });
    const [inventory, setInventory, loadingInventory] = useCollection<InventoryItem>('inventory', MOCK_DATA_MAP.inventory, [], { isProtected: true });
    const [suppliers, setSuppliers, loadingSuppliers] = useCollection<Supplier>('suppliers', MOCK_DATA_MAP.suppliers, [], { isProtected: true });
    const [transactions, setTransactions, loadingTransactions] = useCollection<Transaction>('transactions', MOCK_DATA_MAP.transactions, [], { isProtected: true });
    const [locations, setLocations, loadingLocations] = useCollection<Location>('locations', MOCK_DATA_MAP.locations, [], { isProtected: true });
    const [raffles, setRaffles, loadingRaffles] = useCollection<Raffle>('raffles', MOCK_DATA_MAP.raffles, [], { isProtected: true });
    const [signups, setSignups, loadingSignups] = useCollection<Signup>('signups', MOCK_DATA_MAP.signups, [], { isProtected: true });

    // --- Deconstructed Settings Documents ---
    // Company Details
    // FIX: Use correctly exported mock constants
    const [companyCore, updateCompanyCore, loadingCompanyCore] = useDocument('settings', 'companyDetails', mock.MOCK_COMPANY_CORE);
    const [brandingDetails, updateBrandingDetails, loadingBranding] = useDocument('settings', 'brandingDetails', mock.MOCK_BRANDING_DETAILS);
    const [contentDetails, updateContentDetails, loadingContent] = useDocument('settings', 'contentDetails', mock.MOCK_CONTENT_DETAILS);
    // Creator Details
    const [creatorCore, updateCreatorCore, loadingCreatorCore] = useDocument<CreatorDetails>('settings', 'creatorDetails', mock.MOCK_CREATOR_CORE);
    const [apiSetupGuide, setApiSetupGuide, loadingApiGuide] = useCollection<ApiGuideStep>('apiSetupGuide', MOCK_DATA_MAP.apiSetupGuide, [], { isProtected: true });

    // --- Public collections ---
    const [socialLinks, setSocialLinks, loadingSocialLinks] = useCollection<SocialLink>('socialLinks', MOCK_DATA_MAP.socialLinks);
    const [carouselMedia, setCarouselMedia, loadingCarouselMedia] = useCollection<CarouselMedia>('carouselMedia', MOCK_DATA_MAP.carouselMedia);
    
    const [isSeeding, setIsSeeding] = useState(false);

    const loading = loadingPlayers || loadingEvents || loadingRanks || loadingBadges || loadingLegendary || loadingGamification || loadingSponsors || loadingVouchers || loadingInventory || loadingSuppliers || loadingTransactions || loadingLocations || loadingRaffles || loadingSocialLinks || loadingCarouselMedia || loadingSignups || loadingCompanyCore || loadingBranding || loadingContent || loadingCreatorCore || loadingApiGuide;
    
    // --- Composite Objects for consumption by components ---
    const companyDetails = useMemo(() => ({
        ...companyCore,
        ...brandingDetails,
        ...contentDetails
    }), [companyCore, brandingDetails, contentDetails]) as CompanyDetails;

    const creatorDetails = useMemo(() => ({
        ...creatorCore,
        id: 'creatorDetails', // ensure id is present
        apiSetupGuide: [...apiSetupGuide].sort((a,b) => a.id.localeCompare(b.id))
    }), [creatorCore, apiSetupGuide]) as CreatorDetails & { apiSetupGuide: ApiGuideStep[] };

    // --- Composite Setters ---
    const setCompanyDetails = async (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => {
        const finalData = typeof d === 'function' ? d(companyDetails) : d;
        
        // FIX: Use correctly exported mock constants for keys
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
    };

    const setCreatorDetails = async (d: (CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) | ((p: CreatorDetails & { apiSetupGuide: ApiGuideStep[] }) => CreatorDetails & { apiSetupGuide: ApiGuideStep[] })) => {
        const finalData = typeof d === 'function' ? d(creatorDetails) : d;
        const { apiSetupGuide: newGuide, ...coreData } = finalData;

        const updates: Promise<any>[] = [];

        // Update core document if changed
        if (JSON.stringify(coreData) !== JSON.stringify(creatorCore)) {
            updates.push(updateCreatorCore(coreData));
        }

        // Diff and update apiSetupGuide collection
        const oldGuideMap = new Map(apiSetupGuide.map(step => [step.id, step]));
        const newGuideMap = new Map(newGuide.map(step => [step.id, step]));

        for (const step of newGuide) {
            if (!oldGuideMap.has(step.id)) { // New step
                const { id, ...data } = step;
                updates.push(setDoc('apiSetupGuide', step.id, data));
            } else if (JSON.stringify(step) !== JSON.stringify(oldGuideMap.get(step.id))) { // Updated step
                updates.push(updateDoc('apiSetupGuide', step));
            }
        }
        for (const oldStep of apiSetupGuide) {
            if (!newGuideMap.has(oldStep.id)) { // Deleted step
                updates.push(deleteDoc('apiSetupGuide', oldStep.id));
            }
        }
        
        await Promise.all(updates);
    };


    const collectionSetters = {
        players: setPlayers,
        events: setEvents,
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
        signups: setSignups,
        apiSetupGuide: setApiSetupGuide,
    };
    type CollectionName = keyof typeof collectionSetters;

    // --- GENERIC CRUD FUNCTIONS ---
    const setDoc = async (collectionName: string, docId: string, data: object) => {
        if (IS_LIVE_DATA) {
            await db.collection(collectionName).doc(docId).set(data);
        } else {
            const setter = collectionSetters[collectionName as CollectionName];
            if (setter) {
                // @ts-ignore
                setter(prev => {
                    const existing = prev.find(item => item.id === docId);
                    if (existing) {
                        return prev.map(item => item.id === docId ? { ...item, ...data } : item);
                    } else {
                        return [...prev, { id: docId, ...data }];
                    }
                });
            }
        }
    };

    const addDoc = async <T extends {}>(collectionName: string, data: T): Promise<string> => {
        if (IS_LIVE_DATA) {
            const docRef = await db.collection(collectionName).add(data);
            return docRef.id;
        } else {
            const id = `mock_${collectionName}_${Date.now()}`;
            const setter = collectionSetters[collectionName as CollectionName];
            if (setter) {
                // @ts-ignore
                setter(prev => [...prev, { ...data, id }]);
            }
            return id;
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
            mock.MOCK_RANKS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('ranks').doc(id), data); });
            mock.MOCK_BADGES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('badges').doc(id), data); });
            mock.MOCK_LEGENDARY_BADGES.forEach(item => { const {id, ...data} = item; batch.set(db.collection('legendaryBadges').doc(id), data); });
            mock.MOCK_GAMIFICATION_SETTINGS.forEach(item => { const {id, ...data} = item; batch.set(db.collection('gamificationSettings').doc(id), data); });
            mock.MOCK_API_GUIDE.forEach(item => { const {id, ...data} = item; batch.set(db.collection('apiSetupGuide').doc(id), data); });
            
            // Deconstructed Settings
            batch.set(db.collection('settings').doc('companyDetails'), mock.MOCK_COMPANY_CORE);
            batch.set(db.collection('settings').doc('brandingDetails'), mock.MOCK_BRANDING_DETAILS);
            batch.set(db.collection('settings').doc('contentDetails'), mock.MOCK_CONTENT_DETAILS);
            batch.set(db.collection('settings').doc('creatorDetails'), mock.MOCK_CREATOR_CORE);
            
            // Admin User
            // FIX: Correctly use MOCK_ADMIN
            const { id: adminId, ...adminData } = mock.MOCK_ADMIN;
            batch.set(db.collection('admins').doc(adminId), adminData);

            // Transactional Data & Subcollections
            MOCK_DATA_MAP.players.forEach(item => { const {id, ...data} = item; batch.set(db.collection('players').doc(id), data); });
            MOCK_DATA_MAP.events.forEach(item => { const {id, ...data} = item; batch.set(db.collection('events').doc(id), data); });
            MOCK_DATA_MAP.signups.forEach(item => { const {id, ...data} = item; batch.set(db.collection('signups').doc(id), data); });
            MOCK_DATA_MAP.vouchers.forEach(item => { const {id, ...data} = item; batch.set(db.collection('vouchers').doc(id), data); });
            MOCK_DATA_MAP.inventory.forEach(item => { const {id, ...data} = item; batch.set(db.collection('inventory').doc(id), data); });
            MOCK_DATA_MAP.suppliers.forEach(item => { const {id, ...data} = item; batch.set(db.collection('suppliers').doc(id), data); });
            MOCK_DATA_MAP.transactions.forEach(item => { const {id, ...data} = item; batch.set(db.collection('transactions').doc(id), data); });
            MOCK_DATA_MAP.locations.forEach(item => { const {id, ...data} = item; batch.set(db.collection('locations').doc(id), data); });
            MOCK_DATA_MAP.raffles.forEach(item => { const {id, ...data} = item; batch.set(db.collection('raffles').doc(id), data); });
            MOCK_DATA_MAP.sponsors.forEach(item => { const {id, ...data} = item; batch.set(db.collection('sponsors').doc(id), data); });
            MOCK_DATA_MAP.socialLinks.forEach(item => { const {id, ...data} = item; batch.set(db.collection('socialLinks').doc(id), data); });
            MOCK_DATA_MAP.carouselMedia.forEach(item => { const {id, ...data} = item; batch.set(db.collection('carouselMedia').doc(id), data); });
            
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
            setPlayers(MOCK_DATA_MAP.players);
            setEvents(MOCK_DATA_MAP.events);
            setSignups(MOCK_DATA_MAP.signups);
            setVouchers(MOCK_DATA_MAP.vouchers);
            setInventory(MOCK_DATA_MAP.inventory);
            setTransactions(MOCK_DATA_MAP.transactions);
            setRaffles(MOCK_DATA_MAP.raffles);
            setSuppliers(MOCK_DATA_MAP.suppliers);
            setSponsors(MOCK_DATA_MAP.sponsors);
            setLocations(MOCK_DATA_MAP.locations);
            setSocialLinks(MOCK_DATA_MAP.socialLinks);
            setCarouselMedia(MOCK_DATA_MAP.carouselMedia);
            return;
        }
        
        const collectionsToDelete = ['players', 'events', 'signups', 'vouchers', 'inventory', 'transactions', 'raffles', 'suppliers', 'sponsors', 'locations', 'socialLinks', 'carouselMedia'];
        
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
    
    const deleteAllPlayers = async () => {
        if (!IS_LIVE_DATA) {
            console.log("Resetting players mock data in memory...");
            setPlayers([]);
            return;
        }
        
        try {
            console.log("Deleting all players...");
            const snapshot = await db.collection('players').get();
            if (snapshot.empty) {
                console.log("No players to delete.");
                return;
            }
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`All ${snapshot.size} players have been deleted.`);
        } catch (error) {
            console.error("Error deleting all players: ", error);
            throw error;
        }
    };

    const restoreFromBackup = async (backupData: any) => {
        const allCollections = [...Object.keys(MOCK_DATA_MAP), 'companyDetails', 'brandingDetails', 'contentDetails', 'creatorDetails'];
        
        if (!IS_LIVE_DATA) {
            console.log("Restoring from backup for mock data environment...");
            setPlayers(backupData.players || []);
            setEvents(backupData.events || []);
            setRanks(backupData.ranks || []);
            setBadges(backupData.badges || []);
            setLegendaryBadges(backupData.legendaryBadges || []);
            setGamificationSettings(backupData.gamificationSettings || []);
            setSponsors(backupData.sponsors || []);
            // Deconstruct company details for mock state
            const { name, address, phone, email, website, regNumber, vatNumber, apiServerUrl, bankInfo, minimumSignupAge } = backupData.companyDetails || {};
            updateCompanyCore({ name, address, phone, email, website, regNumber, vatNumber, apiServerUrl, bankInfo, minimumSignupAge });
            const { logoUrl, loginBackgroundUrl, loginAudioUrl, playerDashboardBackgroundUrl, adminDashboardBackgroundUrl, playerDashboardAudioUrl, adminDashboardAudioUrl, sponsorsBackgroundUrl } = backupData.companyDetails || {};
            updateBrandingDetails({ logoUrl, loginBackgroundUrl, loginAudioUrl, playerDashboardBackgroundUrl, adminDashboardBackgroundUrl, playerDashboardAudioUrl, adminDashboardAudioUrl, sponsorsBackgroundUrl });
            const { fixedEventRules, apkUrl } = backupData.companyDetails || {};
            updateContentDetails({ fixedEventRules, apkUrl });

            const { apiSetupGuide, ...creatorCore } = backupData.creatorDetails || {};
            updateCreatorCore(creatorCore);
            setApiSetupGuide(apiSetupGuide || []);
            
            setSocialLinks(backupData.socialLinks || []);
            setCarouselMedia(backupData.carouselMedia || []);
            setVouchers(backupData.vouchers || []);
            setInventory(backupData.inventory || []);
            setSuppliers(backupData.suppliers || []);
            setTransactions(backupData.transactions || []);
            setLocations(backupData.locations || []);
            setRaffles(backupData.raffles || []);
            setSignups(backupData.signups || []);
            return;
        }

        console.log("Starting Firebase restore from backup...");
       
        try {
            console.log("Wiping existing data...");
            for (const collectionName of allCollections) {
                 if (collectionName.includes('Details')) continue; // Skip single docs here
                const snapshot = await db.collection(collectionName).get();
                if (snapshot.empty) continue;
                const batch = db.batch();
                snapshot.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                console.log(`- Wiped collection: ${collectionName}`);
            }

            console.log("Writing new data from backup...");
            const writeBatch = db.batch();
            
            for (const collectionName of allCollections) {
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

            // Handle deconstructed settings
            const { apiSetupGuide, ...creatorCoreData } = backupData.creatorDetails || {};
            const { name, address, phone, email, website, regNumber, vatNumber, apiServerUrl, bankInfo, minimumSignupAge, logoUrl, loginBackgroundUrl, loginAudioUrl, playerDashboardBackgroundUrl, adminDashboardBackgroundUrl, playerDashboardAudioUrl, adminDashboardAudioUrl, sponsorsBackgroundUrl, fixedEventRules, apkUrl } = backupData.companyDetails || {};
            
            writeBatch.set(db.collection('settings').doc('companyDetails'), { name, address, phone, email, website, regNumber, vatNumber, apiServerUrl, bankInfo, minimumSignupAge });
            writeBatch.set(db.collection('settings').doc('brandingDetails'), { logoUrl, loginBackgroundUrl, loginAudioUrl, playerDashboardBackgroundUrl, adminDashboardBackgroundUrl, playerDashboardAudioUrl, adminDashboardAudioUrl, sponsorsBackgroundUrl });
            writeBatch.set(db.collection('settings').doc('contentDetails'), { fixedEventRules, apkUrl });
            writeBatch.set(db.collection('settings').doc('creatorDetails'), creatorCoreData);


            await writeBatch.commit();
            console.log("Restore complete. The page will now reload.");
            
            window.location.reload();

        } catch (error) {
            console.error("A critical error occurred during the restore process:", error);
            throw new Error("Restore failed. Please check the console for details.");
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
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};