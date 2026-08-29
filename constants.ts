import { Player, Event, Signup, InventoryItem, Transaction, Rank, Badge, LegendaryBadge, Honor, CompanyDetails, SocialLink, Location, CarouselMedia, Notification, Voucher, Raffle, Sponsor, Supplier, Admin } from './types';

export const MOCK_COMPANY_CORE = {
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    regNumber: '',
    vatNumber: '',
    apiServerUrl: '',
    bankInfo: {
        bankName: '',
        iban: '',
        bic: '',
        holder: '',
        accountNumber: '',
        routingNumber: ''
    },
    minimumSignupAge: 18,
    nextRankResetDate: '',
    tagline: '',
    bio: '',
    whatsapp: '',
    githubUrl: ''
};

export const MOCK_BRANDING_DETAILS = {
    logoUrl: 'https://i.ibb.co/V02YVzGq/IMG-20260829-WA0056.jpg',
    loginBackgroundUrl: '',
    loginAudioUrl: '',
    playerDashboardBackgroundUrl: '',
    adminDashboardBackgroundUrl: '',
    playerDashboardAudioUrl: '',
    adminDashboardAudioUrl: '',
    sponsorsBackgroundUrl: '',
    themeColors: {
        presetName: 'Red Alert Tactical',
        primary: '#dc2626',
        primaryHover: '#ef4444',
        secondary: '#f59e0b',
        darkBg: '#0a0a0a',
        cardBg: '#18181b',
        textHighlight: '#f87171',
        borderGlow: '#7f1d1d',
        gradientStyle: 'linear-glow' as const,
        glassOpacity: 'subtle' as const,
        borderRadius: 'standard' as const,
    }
};

export const MOCK_CONTENT_DETAILS = {
    fixedEventRules: '',
    apkUrl: ''
};

export const MOCK_CREATOR_CORE = {
    id: 'creator',
    name: 'Creator',
    email: 'jstypme@gmail.com',
    role: 'creator',
    bio: '',
    avatarUrl: ''
};

export const MOCK_ADMIN = {
    id: 'admin_default',
    name: 'Administrator',
    email: 'bosjoltactical@gmail.com',
    role: 'admin',
    phone: '',
    callsign: 'Command'
};

export const MOCK_PLAYERS: Player[] = [];
export const MOCK_EVENTS: any[] = [];
export const MOCK_SIGNUPS: Signup[] = [];
export const MOCK_INVENTORY: InventoryItem[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];
import { DEFAULT_RANKS, FALLBACK_RECRUIT_TIER } from './utils/rankUtils';

export const MOCK_RANKS: Rank[] = DEFAULT_RANKS;
export const MOCK_BADGES: Badge[] = [];
export const MOCK_LEGENDARY_BADGES: LegendaryBadge[] = [];
export const MOCK_HONORS: Honor[] = [];
export const MOCK_GAMIFICATION_SETTINGS: any[] = [];
export const MOCK_VOUCHERS: Voucher[] = [];
export const MOCK_SUPPLIERS: Supplier[] = [];
export const MOCK_LOCATIONS: Location[] = [];
export const MOCK_RAFFLES: Raffle[] = [];
export const MOCK_SPONSORS: Sponsor[] = [];
export const MOCK_SOCIAL_LINKS: SocialLink[] = [];
export const MOCK_CAROUSEL_MEDIA: CarouselMedia[] = [];
export const MOCK_API_GUIDE: any[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];

export const MOCK_PLAYER_ROLES = ['player', 'admin', 'marshal'];
export const MOCK_EVENT_THEMES = ['Standard', 'CQB', 'MilSim', 'Night Ops'];
export const EVENT_TYPES = ['CQB Match', 'MilSim Operation', 'Night Raid', 'SpeedSoft Tournament', 'Training Day'];
export const EVENT_STATUSES = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
export const INVENTORY_CATEGORIES = ['Primary Rifle', 'Sidearm', 'Equipment', 'Consumable', 'Protection'];
export const INVENTORY_CONDITIONS = ['New', 'Good', 'Fair', 'Needs Maintenance', 'Retired'];
export const UNRANKED_TIER: Tier = FALLBACK_RECRUIT_TIER;

export const INITIAL_PLAYERS: Player[] = [];
export const INITIAL_EVENTS: Event[] = [];
export const INITIAL_SIGNUPS: Signup[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_RANKS: Rank[] = [];
export const INITIAL_BADGES: Badge[] = [];
export const INITIAL_LEGENDARY_BADGES: LegendaryBadge[] = [];
export const INITIAL_HONORS: Honor[] = [];

export const INITIAL_COMPANY_DETAILS: CompanyDetails = {
    ...MOCK_COMPANY_CORE,
    ...MOCK_BRANDING_DETAILS,
    ...MOCK_CONTENT_DETAILS
} as CompanyDetails;

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [];
export const INITIAL_LOCATIONS: Location[] = [];
export const INITIAL_CAROUSEL_MEDIA: CarouselMedia[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
export const INITIAL_VOUCHERS: Voucher[] = [];
export const INITIAL_RAFFLES: Raffle[] = [];
export const INITIAL_SPONSORS: Sponsor[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_ADMINS: Admin[] = [];
