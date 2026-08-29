import { Player, Event, Signup, InventoryItem, Transaction, Rank, Badge, LegendaryBadge, Honor, CompanyDetails, SocialLink, Location, CarouselMedia, Notification, Voucher, Raffle, Sponsor, Supplier, Admin, TacticalRuleSet } from './types';

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
    name: "Jason's Solutions To Your Problems",
    email: 'jstypme@gmail.com',
    whatsapp: '+27821234567',
    role: 'creator',
    tagline: 'You think it, I build it',
    bio: 'We specialise in custom website design & development, strategic social media marketing, bespoke digital strategy, and scalable software applications engineered to help your business expand, engage clients, and achieve sustained growth.',
    logoUrl: 'https://i.ibb.co/HfT2Qzz3/IMG-20260803-WA0029.jpg',
    githubUrl: 'https://github.com',
    avatarUrl: 'https://i.ibb.co/HfT2Qzz3/IMG-20260803-WA0029.jpg'
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
export const DEFAULT_TACTICAL_RULE_SETS: TacticalRuleSet[] = [
    {
        id: 'rule_set_safety',
        title: 'Safety & Eyewear Protocol',
        category: 'Safety Rules',
        shortDescription: 'Mandatory eye protection, face mesh, dead rag signals, and barrel safety standards.',
        icon: 'shield',
        badge: 'MANDATORY',
        isActive: true,
        lastUpdated: '2026-08-29',
        rules: [
            {
                id: 'r_safe_1',
                name: 'Full-Seal Eyewear Standard',
                description: 'ANSI Z87.1 rated full-seal goggles with retention straps must be worn at all times while on field boundaries or staging areas.',
                penalty: 'Immediate Game Ejection',
                importance: 'critical',
                note: 'Mesh goggles are strictly forbidden unless accompanied by shatterproof poly-lenses.'
            },
            {
                id: 'r_safe_2',
                name: 'Lower Face Mesh & Mouth Protection',
                description: 'Players under 18 must wear full rigid face protection. Adult players are strongly advised to wear steel mesh lower masks.',
                penalty: 'Warning / No-Entry',
                importance: 'important'
            },
            {
                id: 'r_safe_3',
                name: 'Red Dead Rag & Signal Marker',
                description: 'All operators must carry a bright red dead rag (min 30x30cm) or red LED light for night operations to signal hit confirmation.',
                penalty: '-100 XP Penalty',
                importance: 'important'
            },
            {
                id: 'r_safe_4',
                name: 'Barrel Cover / Sock in Staging Zone',
                description: 'Muzzles must be capped with approved barrel socks and weapons put on SAFE with magazines removed inside safe zones.',
                penalty: 'Match Disqualification',
                importance: 'critical'
            }
        ]
    },
    {
        id: 'rule_set_chrono',
        title: 'Chronograph & Joule Limits',
        category: 'Chronograph & FPS',
        shortDescription: 'Velocity thresholds, BB weight standards, tournament locks, and Minimum Engagement Distances (MED).',
        icon: 'crosshair',
        badge: 'FPS SPEC',
        isActive: true,
        lastUpdated: '2026-08-29',
        rules: [
            {
                id: 'r_chrono_1',
                name: 'Standard Rifle & Sidearm Limit (1.20 Joules)',
                description: 'Max 1.20 Joules (~360 FPS with 0.20g BBs). No Minimum Engagement Distance required. Full-auto permitted outdoors.',
                penalty: 'Weapon Rejection',
                importance: 'important'
            },
            {
                id: 'r_chrono_2',
                name: 'DMR Heavy Rifle Limit (1.88 Joules)',
                description: 'Max 1.88 Joules (~450 FPS with 0.20g BBs). 20-Meter Minimum Engagement Distance. Must be mechanically semi-auto only.',
                penalty: 'Match Disqualification',
                importance: 'critical'
            },
            {
                id: 'r_chrono_3',
                name: 'Bolt-Action Sniper Limit (2.31 Joules)',
                description: 'Max 2.31 Joules (~500 FPS with 0.20g BBs). 30-Meter Minimum Engagement Distance. Sidearm mandatory for close quarters.',
                penalty: 'Match Disqualification',
                importance: 'critical'
            },
            {
                id: 'r_chrono_4',
                name: 'HPA Regulator Tournament Zip Lock',
                description: 'All High Pressure Air (HPA) systems must be chronographed with event weight BBs and tournament locked prior to deployment.',
                penalty: 'Instant Ejection',
                importance: 'critical'
            }
        ]
    },
    {
        id: 'rule_set_game_domination',
        title: 'Game Mode: Domination & Control Points',
        category: 'Specific Game Rules',
        shortDescription: 'Tactical objectives, flag capture timers, ticket depletion rates, and Mobile HQ respawn points.',
        icon: 'target',
        badge: 'GAME MODE',
        isActive: true,
        lastUpdated: '2026-08-29',
        rules: [
            {
                id: 'r_dom_1',
                name: 'Electronic Flag Capture',
                description: 'To capture a sector flag prop, hold team button continuously for 5 seconds until beacon flashes your team color.',
                penalty: 'Invalid Capture',
                importance: 'standard'
            },
            {
                id: 'r_dom_2',
                name: 'Ticket Drain Mechanics',
                description: 'Holding 2 of 3 sectors drains opposing team tickets by 10 points per minute. Holding all 3 triggers 2x drain rate.',
                importance: 'important'
            },
            {
                id: 'r_dom_3',
                name: 'Forward Spawn Point Rule',
                description: 'Secured alpha or beta flags serve as forward respawn sites unless the sector is actively contested by enemy fire.',
                importance: 'standard'
            }
        ]
    },
    {
        id: 'rule_set_game_search_destroy',
        title: 'Game Mode: Search & Destroy / Demolition',
        category: 'Specific Game Rules',
        shortDescription: 'Bomb arming, defusal sightlines, round timers, and single-life elimination parameters.',
        icon: 'alert-triangle',
        badge: 'GAME MODE',
        isActive: true,
        lastUpdated: '2026-08-29',
        rules: [
            {
                id: 'r_sd_1',
                name: 'Bomb Arming Protocol',
                description: 'Attacking operator must stay in contact with bomb terminal for 10 uninterrupted seconds to arm timer.',
                importance: 'important'
            },
            {
                id: 'r_sd_2',
                name: 'Defusal Physical Contact',
                description: 'Defusal requires 15 continuous seconds of physical contact on terminal. Firing weapon during defusal cancels timer.',
                importance: 'important'
            },
            {
                id: 'r_sd_3',
                name: 'Single Life per Round',
                description: 'No medic revives or respawns allowed during active S&D rounds. Once hit, player immediately exits to dead zone.',
                penalty: 'Round Loss',
                importance: 'critical'
            }
        ]
    },
    {
        id: 'rule_set_cqb',
        title: 'CQB & Indoor Clearing Code',
        category: 'CQB Standards',
        shortDescription: 'Semi-auto restrictions inside structures, surrender callouts, and pyrotechnic blast radii.',
        icon: 'zap',
        badge: 'CQB SPEC',
        isActive: true,
        lastUpdated: '2026-08-29',
        rules: [
            {
                id: 'r_cqb_1',
                name: 'Strict Semi-Auto Indoors',
                description: 'Full-auto fire is strictly forbidden inside all buildings, rooms, and enclosed corridors regardless of weapon classification.',
                penalty: '-250 XP & Warning',
                importance: 'critical'
            },
            {
                id: 'r_cqb_2',
                name: 'Courtesy Surrender Offer',
                description: 'If within 2 meters of an unaware enemy operator, verbally declare "SURRENDER!" to spare them point-blank hit.',
                importance: 'standard'
            },
            {
                id: 'r_cqb_3',
                name: 'Grenade & Pyro Blast Radius',
                description: 'Spring or pyro grenades detonating inside a room eliminate all occupants within 5 meters who lack hard cover.',
                importance: 'important'
            },
            {
                id: 'r_cqb_4',
                name: 'No Blind Firing',
                description: 'Barrels must not be fired around corners or over barricades without line-of-sight visual sighting.',
                penalty: 'Match Disqualification',
                importance: 'critical'
            }
        ]
    },
    {
        id: 'rule_set_medic',
        title: 'Field Medic & Hit Call Honor Code',
        category: 'Medic & Respawn',
        shortDescription: 'Honor code callouts, touch revives, bleed-out timers, and dead man radio silence.',
        icon: 'scale',
        badge: 'HONOR CODE',
        isActive: true,
        lastUpdated: '2026-08-29',
        rules: [
            {
                id: 'r_med_1',
                name: 'Loud Hit Call & Hand Raised',
                description: 'When struck by BB or ricochet, shout "HIT!" loudly, raise arm, and deploy red dead rag immediately.',
                penalty: '-500 XP Honor Penalty',
                importance: 'critical'
            },
            {
                id: 'r_med_2',
                name: 'Touch Medic Revive',
                description: 'Designated field medics must maintain continuous two-hand physical contact on downed player for 30 seconds.',
                importance: 'standard'
            },
            {
                id: 'r_med_3',
                name: 'Dead Men Tell No Tales',
                description: 'Eliminated operators must maintain strict radio and vocal silence. Pointing or giving callouts to live teammates is banned.',
                penalty: 'Team XP Penalty',
                importance: 'critical'
            }
        ]
    }
];

export const MOCK_TACTICAL_RULE_SETS: TacticalRuleSet[] = DEFAULT_TACTICAL_RULE_SETS;

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
