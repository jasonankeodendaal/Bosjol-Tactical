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
        id: 'rule_set_safety_eyewear',
        title: 'Safety & Eyewear Protocol',
        category: 'Safety Rules',
        shortDescription: 'ANSI Z87.1 mandatory eye protection, blind man emergency freeze, and Code Red real-world injury protocol.',
        icon: 'shield',
        badge: 'MANDATORY',
        isActive: true,
        lastUpdated: '2026-08-30',
        rules: [
            {
                id: 'r_airsoft_eye',
                name: 'Eye of the Beholder (ANSI Z87.1 Required)',
                description: 'Always wear eye protection in the form of goggles, mask, shooting glasses or safety glasses meeting ANSI Z87.1 standards. Never remove eye protection on the battlefield. Regular prescription glasses are NOT acceptable as safety eyewear.',
                penalty: 'Immediate Expulsion',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_blindman',
                name: 'Blind Man – Emergency Freeze Callout',
                description: 'Blind man will be called if anyone enters the field without eye protection. When "BLIND MAN" is called, the game stops immediately, and only continues when the marshal calls "Game On".',
                penalty: 'Mandatory Field Hold',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_codered',
                name: 'Code Red – Real World Injury Protocol',
                description: 'The term "CODE RED" will be used for any real world injury. Once "CODE RED" has been shouted, all players will holster their replicas, put them on safe, and remove the magazine. Proceed to make the area as safe as possible to assist the injured player.',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_codeblue',
                name: 'Code Blue – Law Enforcement / Blue Presence',
                description: 'Potentially dangerous situation treated as if law enforcement does not know we are playing a game. All players must walk to the "Safe Zone" in plain sight, with guns over their head or leaving guns in the field. At the Safe Zone, place replicas with gear and gather in a group at least 20 feet away from gear.',
                importance: 'critical'
            }
        ]
    },
    {
        id: 'rule_set_field_engagement',
        title: 'Engagement & Conduct Rules',
        category: 'Field Protocols',
        shortDescription: 'Bang kill range, pyrotechnics ban, no physical contact, blind firing expulsion, and hit calling honor code.',
        icon: 'zap',
        badge: 'CONDUCT',
        isActive: true,
        lastUpdated: '2026-08-30',
        rules: [
            {
                id: 'r_airsoft_pyro',
                name: 'No Big Bangs / Crackers Ban',
                description: 'No crackers or explosive pyrotechnics are allowed to be played with on the field at any time.',
                penalty: 'Confiscation & Warning',
                importance: 'important'
            },
            {
                id: 'r_airsoft_bang',
                name: 'Bang, You Dead! (5m Safety Kill Range)',
                description: 'A 5 meter "bang kill range" will be observed for all weapons, or whenever there is a safety issue with taking a shot. Pull out a sidearm or point weapon at target and shout "BANG". Cannot be called on multiple people at once. Must always honor a safety kill and return to re-spawn.',
                penalty: 'Field Ejection if Abused',
                importance: 'important',
                note: 'Abusing safety kills will result in removal from the field. You are ultimately responsible for anyone or anything injured by your projectiles.'
            },
            {
                id: 'r_airsoft_blindfire',
                name: 'Blind Firing Prohibition',
                description: 'Blind firing is never permitted. Always look through your sights when engaging targets.',
                penalty: 'Immediate Expulsion from Game',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_notouchy',
                name: 'No Touchy! (Zero Physical Contact)',
                description: 'Absolutely no physical contact at any point between players or moderators is permitted.',
                penalty: 'Immediate Removal & Permanent Ban',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_hits',
                name: 'Hit Calling Integrity & Honor Code',
                description: 'All integrity violations and non-calling of "hits" will be dealt with swiftly and severely.',
                penalty: 'Immediate Ejection from Day Event',
                importance: 'critical'
            }
        ]
    },
    {
        id: 'rule_set_mags_weapons',
        title: 'Weapons, Magazines & Safe Zone Standards',
        category: 'CQB Standards',
        shortDescription: 'High cap semi-auto restriction, mid cap burst fire allowance, chronograph checks, and Safe Zone weapon discipline.',
        icon: 'crosshair',
        badge: 'WEAPONS',
        isActive: true,
        lastUpdated: '2026-08-30',
        rules: [
            {
                id: 'r_airsoft_mag_rule',
                name: 'Mid Cap & High Cap Firing Rule',
                description: 'High Cap magazines (winding wheel at bottom) can ONLY fire semi-auto. Players using Mid Cap magazines are allowed burst fire. Heavy support gunners receive role priority. (Exceptions can be made for exotic/rare replicas by asking the organizer).',
                importance: 'important',
                note: 'You may carry high caps with mid caps, but you must strictly fire semi-auto when feeding from high cap magazines.'
            },
            {
                id: 'r_airsoft_safezone',
                name: 'Safe Zone Security Rules',
                description: 'The "Safe Zone" is the area on the playing field where no weapons will be fired at any time. Keep magazines out of rifles and switch selector switches to SAFE at all times in the Safe Zone.',
                penalty: 'Severe Warning / Disqualification',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_chrono_check',
                name: 'Mandatory Chronograph & Weapons Check',
                description: 'All airsoft weapons will be checked by Game Moderators and tested via chronograph prior to every game.',
                penalty: 'Weapon Disqualification',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_real_firearms',
                name: 'Strict Prohibition of Real Firearms',
                description: 'No real firearms, live ammunition, or other non-airsoft weapons are allowed on the property or field at any time.',
                penalty: 'Immediate Permanent Ban & Law Enforcement Call',
                importance: 'critical'
            },
            {
                id: 'r_airsoft_game_boss',
                name: 'Game Moderator Authority',
                description: 'The "Game Moderator" holds final approval for all field decisions, game calls, conflict resolutions, and safety items on the field.',
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
