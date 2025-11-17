

import type { Player, Admin, GameEvent, Briefing, GamificationSettings, Badge, Sponsor, CompanyDetails, MatchRecord, Loadout, PlayerRole, InventoryItem, Voucher, Supplier, Transaction, Location, LegendaryBadge, Raffle, EventStatus, EventType, SocialLink, CarouselMedia, CreatorDetails, Signup, RankTier, SubRank, ApiGuideStep } from './types';

export const MOCK_BADGES: Badge[] = [
    { id: 'b01', name: 'Sharpshooter', description: 'Achieve 50 headshots', iconUrl: 'https://img.icons8.com/color/96/target.png', criteria: { type: 'headshots', value: 50 }},
    { id: 'b02', name: 'Veteran', description: 'Participate in 25 matches', iconUrl: 'https://img.icons8.com/color/96/medal2.png', criteria: { type: 'gamesPlayed', value: 25 }},
    { id: 'b03', name: 'First Kill', description: 'Get your first kill', iconUrl: 'https://img.icons8.com/color/96/skull.png', criteria: { type: 'kills', value: 1 }},
    { id: 'b04', name: 'Gold Tier Operator', description: 'Awarded for reaching the Gold rank', iconUrl: 'https://img.icons8.com/color/96/gold-medal.png', criteria: { type: 'rank', value: 'Gold' } },
];

export const MOCK_LEGENDARY_BADGES: LegendaryBadge[] = [
    { id: 'leg01', name: 'Medal of Valor', description: 'Awarded for exceptional bravery and selflessness in a critical situation.', iconUrl: 'https://img.icons8.com/color/96/laurel-wreath.png', howToObtain: 'Manually awarded by an admin for acts of exceptional bravery.' },
    { id: 'leg02', name: 'Tactical Genius', description: 'Recognizes an operator who devised and executed a game-changing strategy.', iconUrl: 'https://img.icons8.com/color/96/brain-3.png', howToObtain: 'Manually awarded by an admin for brilliant strategic plays.' },
    { id: 'leg03', name: 'Last Man Standing', description: 'For an operator who single-handedly clutched a victory against overwhelming odds.', iconUrl: 'https://img.icons8.com/fluency/96/shield.png', howToObtain: 'Be the last surviving member of your team and win the round.' },
];

export const UNRANKED_SUB_RANK: SubRank = { 
    id: 'subrank_unranked',
    name: 'Unranked',
    minXp: 0, 
    iconUrl: 'https://img.icons8.com/ios-filled/100/737373/shield.png',
    perks: ["Play 10 games to get ranked"],
};

export const MOCK_RANK_TIERS: RankTier[] = [
  {
    id: "tier_rookie",
    name: "Rookie",
    description: "Introductory tier for new operators learning the ropes.",
    tierBadgeUrl: "https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-outline-flatarticons.png",
    subranks: [
      { id: "r_i", name: "Rookie I", minXp: 0, perks: ["Basic Calling Card"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_ii", name: "Rookie II", minXp: 201, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_iii", name: "Rookie III", minXp: 401, perks: ["Custom Banner"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_iv", name: "Rookie IV", minXp: 601, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_v", name: "Rookie V", minXp: 801, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" }
    ]
  },
  {
    id: "tier_vet",
    name: "Veteran",
    description: "For established players who have proven their skills in the field.",
    tierBadgeUrl: "https://img.icons8.com/external-flatart-icons-flat-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-flat-flatarticons.png",
    subranks: [
      { id: "v_i", name: "Veteran I", minXp: 1001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_ii", name: "Veteran II", minXp: 1201, perks: ["Custom Banner"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_iii", name: "Veteran III", minXp: 1401, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_iv", name: "Veteran IV", minXp: 1601, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_v", name: "Veteran V", minXp: 1801, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" }
    ]
  },
  {
    id: "tier_elite",
    name: "Elite",
    description: "Recognizing mid-tier competitive players with advanced tactical abilities.",
    tierBadgeUrl: "https://img.icons8.com/external-flatart-icons-lineal-color-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-lineal-color-flatarticons.png",
    subranks: [
      { id: "e_i", name: "Elite I", minXp: 2001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_ii", name: "Elite II", minXp: 2201, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_iii", name: "Elite III", minXp: 2401, perks: ["Custom Calling Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_iv", name: "Elite IV", minXp: 2601, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_v", name: "Elite V", minXp: 2801, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" }
    ]
  },
  {
    id: "tier_pro",
    name: "Pro",
    description: "High-skill players demonstrating professional-level gameplay.",
    tierBadgeUrl: "https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-shield-gaming-justicon-lineal-color-justicon.png",
    subranks: [
      { id: "p_i", name: "Pro I", minXp: 3001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_ii", name: "Pro II", minXp: 3301, perks: ["Exclusive Camo"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_iii", name: "Pro III", minXp: 3601, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_iv", name: "Pro IV", minXp: 3901, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_v", name: "Pro V", minXp: 4201, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" }
    ]
  },
  {
    id: "tier_master",
    name: "Master",
    description: "Top-tier competitive operators with mastery over all aspects of combat.",
    tierBadgeUrl: "https://img.icons8.com/external-flat-wichaiwi/64/external-shield-game-design-flat-wichaiwi.png",
    subranks: [
      { id: "m_i", name: "Master I", minXp: 4501, perks: ["Weapon XP Card + Camo"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_ii", name: "Master II", minXp: 4801, perks: ["Exclusive Calling Card"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_iii", name: "Master III", minXp: 5101, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_iv", name: "Master IV", minXp: 5401, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_v", name: "Master V", minXp: 5701, perks: ["Exclusive Skin + Camo"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" }
    ]
  },
  {
    id: "tier_gm",
    name: "Grand Master",
    description: "Among the best of the best, with access to exclusive rewards.",
    tierBadgeUrl: "https://img.icons8.com/ios-filled/50/medal.png",
    subranks: [
      { id: "gm_i", name: "Grand Master I", minXp: 6001, perks: ["Permanent Cosmetic Reward"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_ii", name: "Grand Master II", minXp: 6401, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_iii", name: "Grand Master III", minXp: 6801, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_iv", name: "Grand Master IV", minXp: 7201, perks: ["Custom Calling Card"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_v", name: "Grand Master V", minXp: 7601, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" }
    ]
  },
  {
    id: "tier_leg",
    name: "Legendary",
    description: "The pinnacle of achievement, reserved for the most elite operators.",
    tierBadgeUrl: "https://img.icons8.com/fluency/48/trophy.png",
    subranks: [
      { id: "l_i", name: "Legendary", minXp: 8001, perks: ["Legendary Banner / Frame"], iconUrl: "https://img.icons8.com/color/96/medal-of-honor.png" },
      { id: "l_top", name: "Legendary (Top 5000)", minXp: 99999, perks: ["Special Badge / Glow Effect"], iconUrl: "https://img.icons8.com/fluency/48/star-medal.png" }
    ]
  }
];

export const MOCK_GAMIFICATION_SETTINGS: GamificationSettings = [
    { id: 'g_kill', name: 'XP per Kill', description: 'XP awarded for each standard elimination.', xp: 10 },
    { id: 'g_headshot', name: 'XP per Headshot', description: 'Bonus XP for headshot eliminations. Added to kill XP.', xp: 25 },
    { id: 'g_death', name: 'XP Loss per Death', description: 'XP deducted each time a player is eliminated.', xp: -5 },
    { id: 'g_game', name: 'Base XP per Game', description: 'XP awarded to every player for completing a match.', xp: 100 },
];

export const MOCK_WEAPONS = {
    primary: [
        'M4A1 Assault Rifle', 'M13B Assault Rifle', 'Honey Badger SMG', 'AK-47', 'SCAR-H', 'MP5', 'Vector', 'P90', 'MSR Sniper Rifle', 'L86 LSW'
    ],
    secondary: [
        'X12 Pistol', '.50 GS Pistol', 'P890 Pistol', 'Glock 19', 'Combat Knife'
    ],
};
export const MOCK_EQUIPMENT = {
    lethal: ['Frag Grenade', 'Semtex', 'Claymore', 'C4', 'Throwing Knife'],
    tactical: ['Flashbang', 'Smoke Grenade', 'Stun Grenade', 'Heartbeat Sensor', 'Stim'],
};
export const MOCK_PLAYER_ROLES: PlayerRole[] = ['Assault', 'Recon', 'Support', 'Sniper'];
export const INVENTORY_CATEGORIES: InventoryItem['category'][] = ['AEG Rifle', 'GBB Rifle', 'Sniper Rifle', 'Sidearm', 'SMG', 'Tactical Gear', 'Attachments', 'Consumables', 'Other'];
export const INVENTORY_CONDITIONS: InventoryItem['condition'][] = ['New', 'Used', 'Needs Repair'];
export const MOCK_EVENT_THEMES: string[] = [
    'Modern Warfare',
    'Post-Apocalyptic',
    'Zombies',
    'Sci-Fi',
    'Historical (WWII)',
    'Juggernaut',
    'SpeedQB',
    'Mil-Sim',
];
export const EVENT_STATUSES: EventStatus[] = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];
export const EVENT_TYPES: EventType[] = ['Training', 'Mission', 'Briefing', 'Maintenance'];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup01', name: 'Tactical Imports Inc.', contactPerson: 'John Smith', email: 'sales@tacimports.com', phone: '555-0301', website: 'https://tacimports.com', address: '123 Supply Chain Rd, Industrial Park, USA' },
    { id: 'sup02', name: 'Airsoft Global', contactPerson: 'Jane Doe', email: 'orders@airsoftglobal.com', phone: '555-0302', address: '456 Gear St, Commerce City, USA' },
    { id: 'sup03', name: 'Consumables Direct', contactPerson: 'Admin', email: 'bulk@consumables.com', phone: '555-0303' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
    {id: 'g01', name: 'M4A1 Rental Package', salePrice: 250, stock: 15, type: 'Weapon', description: 'Standard issue M4A1 with 3 magazines and a red dot sight.', isRental: true, category: 'AEG Rifle', condition: 'Used', serialNumber: 'BT-M4-001', purchaseDate: '2022-01-15', lastServiceDate: '2023-09-01', sku: 'BT-WPN-M4-R', supplierId: 'sup01', purchasePrice: 180, reorderLevel: 5, warrantyInfo: '1-year manufacturer warranty'},
    {id: 'g02', name: 'AK-47 Rental Package', salePrice: 250, stock: 8, type: 'Weapon', description: 'A classic AK-47 package, includes 3 magazines.', isRental: true, category: 'AEG Rifle', condition: 'Used', serialNumber: 'BT-AK-005', sku: 'BT-WPN-AK-R', supplierId: 'sup01', purchasePrice: 175, reorderLevel: 5},
    {id: 'g03', name: 'Extra Magazine', salePrice: 50, stock: 50, type: 'Consumable', description: 'One extra mid-cap magazine for most standard AEG rifles.', isRental: false, category: 'Attachments', condition: 'New', sku: 'BT-ATT-MAG-M4', supplierId: 'sup02', purchasePrice: 25, reorderLevel: 20},
    {id: 'g04', name: 'Tactical Vest', salePrice: 100, stock: 20, type: 'Gear', description: 'A lightweight tactical vest with pouches for magazines and gear.', isRental: true, category: 'Tactical Gear', condition: 'New', sku: 'BT-GEAR-VEST-L', supplierId: 'sup02', purchasePrice: 60, reorderLevel: 10},
    {id: 'g05', name: 'Helmet', salePrice: 100, stock: 18, type: 'Gear', description: 'Standard tactical helmet for head protection.', isRental: true, category: 'Tactical Gear', condition: 'Used', sku: 'BT-GEAR-HELM-STD', supplierId: 'sup02', purchasePrice: 45, reorderLevel: 10},
    {id: 'g06', name: 'Smoke Grenade', salePrice: 80, stock: 100, type: 'Consumable', description: 'Standard smoke grenade for cover.', isRental: false, category: 'Consumables', condition: 'New', sku: 'BT-CON-SMK-GR', supplierId: 'sup03', purchasePrice: 40},
    {id: 'g07', name: 'Glock 17 Sidearm', salePrice: 150, stock: 8, type: 'Weapon', description: 'Reliable GBB pistol for CQB or as a secondary.', isRental: true, category: 'Sidearm', condition: 'Needs Repair', purchaseDate: '2021-11-20', lastServiceDate: '2023-05-10', sku: 'BT-WPN-G17-R', supplierId: 'sup01', purchasePrice: 90, reorderLevel: 4},
];

const initialEvents: GameEvent[] = [
  {
    id: 'e001',
    title: 'Operation Nightfall',
    type: 'Mission',
    date: '2023-10-28T18:00:00Z',
    startTime: "18:00",
    location: 'Verdansk CQB Arena',
    description: 'Infiltrate the enemy stronghold under the cover of darkness. Your primary objective is to retrieve sensitive intel from a heavily guarded command post. Secondary objectives include disrupting enemy communications and sabotaging their supply lines. Expect heavy resistance.',
    attendees: [],
    absentPlayers: [],
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/163822/soldier-airsoft-gun-weapon-163822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    audioBriefingUrl: 'https://cdn.pixabay.com/audio/2022/04/18/audio_2910795790.mp3',
    theme: 'Modern Warfare',
    rules: 'Standard ROE. Suppressors recommended. NVG is mandatory. One medic per squad.',
    participationXp: 50,
    gameFee: 300,
    gearForRent: ['g01', 'g02', 'g05'],
    rentalPriceOverrides: {
        'g01': 200, // Discounted M4A1
    },
    eventBadges: ['leg03'], // Last Man Standing can be earned here
    xpOverrides: {
      g_kill: 20, // Double kill XP for this event
      g_headshot: 50, // Double headshot XP
    },
    liveStats: {},
    gameDurationSeconds: 0,
  },
  {
    id: 'e002',
    title: 'CQB Training',
    type: 'Training',
    date: '2023-11-02T10:00:00Z',
    startTime: "10:00",
    location: 'Verdansk CQB Arena',
    description: 'Hone your close-quarters combat skills in a series of intense training drills. Focus will be on room clearing, door breaching, and team communication in tight spaces. All skill levels welcome.',
    attendees: [],
    absentPlayers: [],
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/7984333/pexels-photo-7984333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Drill',
    rules: 'Training weapons only. No lethal equipment. Full face protection required.',
    participationXp: 25,
    gameFee: 150,
    gearForRent: [],
    liveStats: {},
    gameDurationSeconds: 0,
  },
  {
    id: 'e003',
    title: 'Weapon Maintenance',
    type: 'Maintenance',
    date: '2023-11-05T14:00:00Z',
    startTime: "14:00",
    location: 'Armory',
    description: 'Standard weapon cleaning and system checks for all personnel. Ensure your gear is in top condition for the next operation. Armorers will be on site to assist with any technical issues.',
    attendees: [],
    absentPlayers: [],
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/53860/pexels-photo-53860.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Logistics',
    rules: 'Unload and clear all weapons before entry. No live ammunition in the maintenance area.',
    participationXp: 10,
    gameFee: 0,
    gearForRent: [],
    liveStats: {},
    gameDurationSeconds: 0,
  },
   {
    id: 'e000',
    title: 'Operation Kingslayer',
    type: 'Mission',
    date: '2023-10-20T18:00:00Z',
    startTime: "18:00",
    location: 'Al Mazrah Desert Outpost',
    description: 'Successful HVT extraction under heavy fire. Operators infiltrated a desert compound, neutralized threats, and exfiltrated the high-value target before enemy reinforcements could arrive.',
    attendees: [
        { playerId: 'p001', paymentStatus: 'Paid (Card)', rentedGearIds: ['g01', 'g05'], voucherCode: 'LOYALTY50' },
        { playerId: 'p002', paymentStatus: 'Paid (Cash)', rentedGearIds: ['g02'] },
    ],
    absentPlayers: [],
    status: 'Completed',
    imageUrl: 'https://images.pexels.com/photos/8354527/pexels-photo-8354527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Desert Ops',
    rules: 'HVT must be extracted alive. All hostiles are cleared for engagement.',
    participationXp: 100,
    gameFee: 350,
    gearForRent: MOCK_INVENTORY.filter(i => i.isRental).map(i => i.id),
    liveStats: {
        'p001': { kills: 8, deaths: 3, headshots: 2 },
        'p002': { kills: 12, deaths: 1, headshots: 5 }
    },
    gameDurationSeconds: 2750, // e.g., 45 minutes and 50 seconds
  },
];

export const MOCK_SIGNUPS: Signup[] = [
    { id: 'e001_p001', eventId: 'e001', playerId: 'p001', requestedGearIds: ['g01'], note: 'Running 5 mins late.' },
    { id: 'e001_p003', eventId: 'e001', playerId: 'p003', requestedGearIds: [], note: '' },
    { id: 'e002_p001', eventId: 'e002', playerId: 'p001', requestedGearIds: [], note: '' },
    { id: 'e002_p002', eventId: 'e002', playerId: 'p002', requestedGearIds: [], note: '' },
    { id: 'e002_p003', eventId: 'e002', playerId: 'p003', requestedGearIds: [], note: '' },
    { id: 'e003_p001', eventId: 'e003', playerId: 'p001', requestedGearIds: [], note: '' },
    { id: 'e003_p002', eventId: 'e003', playerId: 'p002', requestedGearIds: [], note: '' },
    { id: 'e003_p003', eventId: 'e003', playerId: 'p003', requestedGearIds: [], note: '' },
];


const MOCK_PLAYER_MATCH_HISTORY: Record<string, MatchRecord[]> = {
    p001: [
        { eventId: 'e000', playerStats: { kills: 8, deaths: 3, headshots: 2 }}
    ],
    p002: [
        { eventId: 'e000', playerStats: { kills: 12, deaths: 1, headshots: 5 }}
    ],
    p003: [],
    p004: [],
    p005: [],
    p006: [],
    p007: [],
    p008: [],
    p009: [],
    p010: [],
};


export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p001',
    name: 'John "Soap"',
    surname: 'MacTavish',
    playerCode: 'P001',
    email: 'j.mactavish@tf141.dev',
    phone: '555-0101',
    pin: '111111',
    age: 28,
    idNumber: 'A12345678',
    address: 'Hereford, UK',
    allergies: 'None',
    medicalNotes: 'Resistant to flashbangs.',
    role: 'player',
    callsign: 'Soap',
    rank: MOCK_RANK_TIERS[1].subranks[3], // Veteran IV (1650 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2017/11/06/13/45/cap-2923682_1280.jpg',
    stats: {
        kills: 128,
        deaths: 45,
        headshots: 32,
        gamesPlayed: 15,
        xp: 1650,
    },
    matchHistory: MOCK_PLAYER_MATCH_HISTORY.p001,
    xpAdjustments: [
      { amount: 50, reason: 'Bonus for excellent teamwork in Operation Kingslayer', date: '2023-10-21T10:00:00Z' }
    ],
    badges: [MOCK_BADGES[2]],
    legendaryBadges: [],
    loadout: {
        primaryWeapon: 'M4A1 Assault Rifle',
        secondaryWeapon: 'X12 Pistol',
        lethal: 'Frag Grenade',
        tactical: 'Flashbang',
    },
    bio: "Task Force 141's youngest and most reckless member. Expert in demolitions and close-quarters combat. Always ready for a fight.",
    preferredRole: 'Assault',
  },
  {
    id: 'p002',
    name: 'Simon "Ghost"',
    surname: 'Riley',
    playerCode: 'P002',
    email: 's.riley@tf141.dev',
    phone: '555-0102',
    pin: '222222',
    age: 35,
    idNumber: 'B87654321',
    address: 'Manchester, UK',
    allergies: 'Penicillin',
    medicalNotes: 'Prefers to remain masked.',
    role: 'player',
    callsign: 'Ghost',
    rank: MOCK_RANK_TIERS[3].subranks[0], // Pro I (3100 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2023/07/04/19/43/man-8107142_1280.jpg',
    stats: {
        kills: 210,
        deaths: 30,
        headshots: 88,
        gamesPlayed: 18,
        xp: 3100,
    },
    matchHistory: MOCK_PLAYER_MATCH_HISTORY.p002,
    xpAdjustments: [],
    badges: [MOCK_BADGES[0], MOCK_BADGES[2]],
    legendaryBadges: [MOCK_LEGENDARY_BADGES[0]],
    loadout: {
        primaryWeapon: 'Honey Badger SMG',
        secondaryWeapon: '.50 GS Pistol',
        lethal: 'Semtex',
        tactical: 'Heartbeat Sensor',
    },
    bio: "A mysterious operator known for his stealth and efficiency. His past is classified, but his skills in the field are legendary.",
    preferredRole: 'Recon',
  },
   {
    id: 'p003',
    name: 'Kyle "Gaz"',
    surname: 'Garrick',
    playerCode: 'P003',
    email: 'k.garrick@tf141.dev',
    phone: '555-0103',
    pin: '333333',
    age: 32,
    idNumber: 'C11223344',
    address: 'London, UK',
    role: 'player',
    callsign: 'Gaz',
    rank: MOCK_RANK_TIERS[2].subranks[1], // Elite II (2200 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2015/01/07/20/53/hat-591973_1280.jpg',
    stats: {
        kills: 142,
        deaths: 55,
        headshots: 41,
        gamesPlayed: 16,
        xp: 2200,
    },
    matchHistory: MOCK_PLAYER_MATCH_HISTORY.p003,
    xpAdjustments: [],
    badges: [MOCK_BADGES[2]],
    legendaryBadges: [],
    loadout: {
        primaryWeapon: 'M13B Assault Rifle',
        secondaryWeapon: 'P890 Pistol',
        lethal: 'Claymore',
        tactical: 'Smoke Grenade',
    },
    bio: "A seasoned veteran of the SAS, Gaz is a reliable and versatile operator. Excels in any situation, from covert ops to direct action.",
    preferredRole: 'Support',
  },
  {
    id: 'p004',
    name: 'Jane "Rook"',
    surname: 'Doe',
    playerCode: 'P004',
    email: 'j.doe@newblood.net',
    phone: '555-0104',
    pin: '444444',
    age: 21,
    idNumber: 'D55667788',
    role: 'player',
    callsign: 'Rook',
    rank: UNRANKED_SUB_RANK, // (350 XP, < 10 games)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2016/03/09/10/22/girl-1246022_1280.jpg',
    stats: {
        kills: 5,
        deaths: 8,
        headshots: 1,
        gamesPlayed: 3,
        xp: 350,
    },
    matchHistory: [],
    xpAdjustments: [],
    badges: [],
    legendaryBadges: [],
    loadout: {
        primaryWeapon: 'MP5',
        secondaryWeapon: 'Glock 19',
        lethal: 'Frag Grenade',
        tactical: 'Smoke Grenade',
    },
    bio: "New recruit showing a lot of promise. Eager to learn and prove herself on the field.",
    preferredRole: 'Support',
  },
  {
    id: 'p005',
    name: 'Alex "Nomad"',
    surname: 'Johnson',
    playerCode: 'P005',
    email: 'a.johnson@operator.net',
    phone: '555-0105',
    pin: '555555',
    age: 29,
    idNumber: 'E99887766',
    role: 'player',
    callsign: 'Nomad',
    rank: MOCK_RANK_TIERS[6].subranks[0], // Legendary (8500 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2018/01/15/07/52/woman-3083390_1280.jpg',
    stats: { kills: 350, deaths: 120, headshots: 95, gamesPlayed: 30, xp: 8500 },
    matchHistory: [], xpAdjustments: [], badges: [MOCK_BADGES[0], MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [],
    loadout: { primaryWeapon: 'MSR Sniper Rifle', secondaryWeapon: 'X12 Pistol', lethal: 'Claymore', tactical: 'Smoke Grenade' },
    bio: "A lone wolf who excels at long-range engagements and reconnaissance.",
    preferredRole: 'Sniper',
  },
  {
    id: 'p006',
    name: 'Maria "Valkyrie"',
    surname: 'Garcia',
    playerCode: 'P006',
    email: 'm.garcia@operator.net',
    phone: '555-0106',
    pin: '666666',
    age: 26,
    idNumber: 'F12123434',
    role: 'player',
    callsign: 'Valkyrie',
    rank: MOCK_RANK_TIERS[3].subranks[1], // Pro II (3300 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2021/06/25/19/33/woman-6364433_1280.jpg',
    stats: { kills: 180, deaths: 80, headshots: 50, gamesPlayed: 22, xp: 3300 },
    matchHistory: [], xpAdjustments: [], badges: [MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [],
    loadout: { primaryWeapon: 'Vector', secondaryWeapon: 'Glock 19', lethal: 'Semtex', tactical: 'Stun Grenade' },
    bio: "Aggressive front-line fighter specializing in SMGs and rapid assaults.",
    preferredRole: 'Assault',
  },
  {
    id: 'p007',
    name: 'Kenji "Oni"',
    surname: 'Tanaka',
    playerCode: 'P007',
    email: 'k.tanaka@operator.net',
    phone: '555-0107',
    pin: '777777',
    age: 31,
    idNumber: 'G56567878',
    role: 'player',
    callsign: 'Oni',
    rank: MOCK_RANK_TIERS[1].subranks[0], // Veteran I (1100 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2016/11/29/08/59/man-1868552_1280.jpg',
    stats: { kills: 95, deaths: 65, headshots: 20, gamesPlayed: 12, xp: 1100 },
    matchHistory: [], xpAdjustments: [], badges: [MOCK_BADGES[2]], legendaryBadges: [],
    loadout: { primaryWeapon: 'AK-47', secondaryWeapon: 'Combat Knife', lethal: 'Throwing Knife', tactical: 'Flashbang' },
    bio: "A disciplined and honorable warrior, deadly with an AK-47.",
    preferredRole: 'Assault',
  },
  {
    id: 'p008',
    name: 'Chloe "Echo"',
    surname: 'Williams',
    playerCode: 'P008',
    email: 'c.williams@operator.net',
    phone: '555-0108',
    pin: '888888',
    age: 33,
    idNumber: 'H90901212',
    role: 'player',
    callsign: 'Echo',
    rank: MOCK_RANK_TIERS[4].subranks[0], // Master I (4500 XP)
    status: 'On Leave',
    avatarUrl: 'https://cdn.pixabay.com/photo/2015/07/09/23/15/woman-839352_1280.jpg',
    stats: { kills: 250, deaths: 90, headshots: 110, gamesPlayed: 28, xp: 4500 },
    matchHistory: [], xpAdjustments: [], badges: [MOCK_BADGES[0], MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [MOCK_LEGENDARY_BADGES[1]],
    loadout: { primaryWeapon: 'L86 LSW', secondaryWeapon: '.50 GS Pistol', lethal: 'C4', tactical: 'Heartbeat Sensor' },
    bio: "Expert in intel gathering and communications. Can turn the tide with the right information.",
    preferredRole: 'Support',
  },
  {
    id: 'p009',
    name: 'David "Breach"',
    surname: 'Chen',
    playerCode: 'P009',
    email: 'd.chen@operator.net',
    phone: '555-0109',
    pin: '999999',
    age: 27,
    idNumber: 'I34345656',
    role: 'player',
    callsign: 'Breach',
    rank: MOCK_RANK_TIERS[0].subranks[4], // Rookie V (800 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2017/08/01/01/33/beanie-2562646_1280.jpg',
    stats: { kills: 115, deaths: 95, headshots: 35, gamesPlayed: 19, xp: 800 },
    matchHistory: [], xpAdjustments: [], badges: [MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [],
    loadout: { primaryWeapon: 'P90', secondaryWeapon: 'X12 Pistol', lethal: 'Frag Grenade', tactical: 'Stim' },
    bio: "Demolitions expert. If there's a wall in the way, he'll make a door.",
    preferredRole: 'Assault',
  },
  {
    id: 'p010',
    name: 'Sofia "Spectre"',
    surname: 'Petrova',
    playerCode: 'P010',
    email: 's.petrova@operator.net',
    phone: '555-0110',
    pin: '101010',
    age: 19,
    idNumber: 'J78789090',
    role: 'player',
    callsign: 'Spectre',
    rank: UNRANKED_SUB_RANK, // (150 XP, < 10 games)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2018/04/27/03/50/portrait-3353699_1280.jpg',
    stats: { kills: 2, deaths: 5, headshots: 0, gamesPlayed: 2, xp: 150 },
    matchHistory: [], xpAdjustments: [], badges: [], legendaryBadges: [],
    loadout: { primaryWeapon: 'MP5', secondaryWeapon: 'Glock 19', lethal: 'Frag Grenade', tactical: 'Smoke Grenade' },
    bio: "Newest recruit, still learning the ropes.",
    preferredRole: 'Support',
  },
];

export const MOCK_ADMIN: Admin = {
  id: 'a001',
  name: 'General Shepherd',
  email: 'bosjoltactical@gmail.com',
  role: 'admin',
  clearanceLevel: 5,
  avatarUrl: 'https://cdn.pixabay.com/photo/2018/03/13/11/13/program-3222397_1280.jpg',
};

export const MOCK_EVENTS: GameEvent[] = initialEvents;

export const MOCK_BRIEFINGS: Briefing[] = [
    {
        id: 'b001',
        title: 'Intel Update: Verdansk',
        author: 'General Shepherd',
        date: '2023-10-27T09:00:00Z',
        content: 'Latest satellite imagery shows increased enemy activity in the downtown area. Suspected movement of high-value targets. All teams be advised, threat level is elevated. Standard ROE are in effect, but command authorizes escalated response if engaged by hostile armor. Secondary objective is to secure the broadcast tower to disrupt enemy communications. Be aware of potential sniper nests in the surrounding high-rises. Extraction will be via helo at the stadium, pending signal from team lead.',
        summary: 'Increased enemy activity in downtown Verdansk. High-value targets suspected. Threat level is high.'
    }
];

export const MOCK_VOUCHERS: Voucher[] = [
    { id: 'v01', code: 'NEWPLAYER100', discount: 100, type: 'fixed', description: 'Welcome discount for new players', status: 'Active', perUserLimit: 1, redemptions: [] },
    { id: 'v02', code: 'GHOSTMVP', discount: 100, type: 'percentage', description: 'Free entry for MVP performance', status: 'Active', assignedToPlayerId: 'p002', usageLimit: 1, redemptions: [] },
    { id: 'v03', code: 'LOYALTY50', discount: 50, type: 'fixed', description: 'Loyalty discount', status: 'Depleted', usageLimit: 1, redemptions: [{ playerId: 'p001', eventId: 'e000', date: '2023-10-20T18:00:00Z' }] },
    { id: 'v04', code: 'WEEKLY10', discount: 10, type: 'percentage', description: '10% off any event fee this week', status: 'Active', usageLimit: 20, perUserLimit: 1, redemptions: [] },
];

export const MOCK_RAFFLES: Raffle[] = [
    {
        id: 'r01',
        name: 'End of Year Gear Giveaway',
        location: 'Verdansk CQB Arena',
        contactPhone: '555-RAFFLE',
        drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        createdAt: new Date().toISOString(),
        prizes: [
            { id: 'p01-1', name: 'Custom M4A1 AEG', place: 1 },
            { id: 'p01-2', name: 'Tactical Vest Package', place: 2 },
            { id: 'p01-3', name: '5 Free Game Entries', place: 3 },
        ],
        tickets: [
            { id: 't01-1', code: 'RAFFLE-GEAR-001', playerId: 'p001', purchaseDate: new Date().toISOString(), paymentStatus: 'Paid (Card)'},
            { id: 't01-2', code: 'RAFFLE-GEAR-002', playerId: 'p003', purchaseDate: new Date().toISOString(), paymentStatus: 'Paid (Cash)'},
        ],
        winners: [],
    },
    {
        id: 'r02',
        name: 'Summer Sidearm Raffle',
        location: 'Al Mazrah Desert Outpost',
        contactPhone: '555-RAFFLE',
        drawDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        prizes: [
            { id: 'p02-1', name: 'Custom Glock 17 GBB', place: 1 },
        ],
        tickets: [
            { id: 't02-1', code: 'RAFFLE-SIDEARM-001', playerId: 'p001', purchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), paymentStatus: 'Paid (Card)'},
            { id: 't02-2', code: 'RAFFLE-SIDEARM-002', playerId: 'p002', purchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), paymentStatus: 'Paid (Card)'},
            { id: 't02-3', code: 'RAFFLE-SIDEARM-003', playerId: 'p004', purchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), paymentStatus: 'Paid (Cash)'},
        ],
        winners: [
            { prizeId: 'p02-1', ticketId: 't02-2', playerId: 'p002' }
        ],
    }
];


export const MOCK_SPONSORS: Sponsor[] = [
    { id: 's01', name: 'Tactical Gear Co.', logoUrl: 'https://img.logoipsum.com/296.svg', email: 'contact@tacticalgear.com', phone: '555-0201', website: 'https://tacticalgear.com' },
    { id: 's02', name: 'Adrenaline Fuel', logoUrl: 'https://img.logoipsum.com/297.svg', email: 'sponsorship@adrenaline.com', phone: '555-0202', website: 'https://adrenaline.com' },
    { id: 's03', name: 'Vortex Optics', logoUrl: 'https://img.logoipsum.com/298.svg', email: 'info@vortex.com', phone: '555-0203', website: 'https://vortex.com' },
    { id: 's04', name: '5.11 Tactical', logoUrl: 'https://img.logoipsum.com/299.svg', email: 'support@511.com', phone: '555-0204', website: 'https://511.com' },
];

export const MOCK_LOCATIONS: Location[] = [
    {
        id: 'loc01',
        name: 'Verdansk CQB Arena',
        description: 'A multi-level indoor arena designed for intense close-quarters combat. Features multiple breach points, tight corridors, and a central command room objective.',
        address: '101 Industrial Zone, Verdansk',
        imageUrls: [
            'https://images.pexels.com/photos/8996323/pexels-photo-8996323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/7984333/pexels-photo-7984333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/8354523/pexels-photo-8354523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ],
        pinLocationUrl: 'https://maps.app.goo.gl/abcdef1234567890',
        contactInfo: { phone: '555-FIELD-01', email: 'bookings@verdanskcqb.com' }
    },
    {
        id: 'loc02',
        name: 'Al Mazrah Desert Outpost',
        description: 'A sprawling outdoor desert field with a mix of village ruins, open terrain, and a fortified central outpost. Ideal for sniper engagements and large-scale objective games.',
        address: 'Route 66, Al Mazrah Desert',
        imageUrls: [
            'https://images.pexels.com/photos/8354527/pexels-photo-8354527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/163822/soldier-airsoft-gun-weapon-163822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ],
        pinLocationUrl: 'https://maps.app.goo.gl/fedcba0987654321',
        contactInfo: { phone: '555-FIELD-02' }
    }
];

export const MOCK_CAROUSEL_MEDIA: CarouselMedia[] = [
    { id: 'cm1', type: 'image', url: 'https://images.pexels.com/photos/8996323/pexels-photo-8996323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 'cm2', type: 'image', url: 'https://images.pexels.com/photos/7984333/pexels-photo-7984333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 'cm3', type: 'image', url: 'https://images.pexels.com/photos/8354527/pexels-photo-8354527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }
];

export const MOCK_SOCIAL_LINKS: SocialLink[] = [
    { id: 'sl1', name: 'Facebook', url: 'https://facebook.com', iconUrl: 'https://img.icons8.com/fluent/48/000000/facebook-new.png' },
    { id: 'sl2', name: 'Instagram', url: 'https://instagram.com', iconUrl: 'https://img.icons8.com/fluent/48/000000/instagram-new.png' },
    { id: 'sl3', name: 'YouTube', url: 'https://youtube.com', iconUrl: 'https://img.icons8.com/fluent/48/000000/youtube-play.png' }
];

export const MOCK_COMPANY_DETAILS: CompanyDetails = {
    name: 'Bosjol Tactical Solutions',
    address: '123 Tactical Way, Fort Bragg, NC 28307',
    phone: '(123) 456-7890',
    email: 'contact@bosjol-tactical.com',
    website: 'https://www.bosjol-tactical.com',
    regNumber: '2023/123456/07',
    vatNumber: '9876543210',
    logoUrl: 'https://i.ibb.co/HL2Lc6Rz/file-0000000043b061f7b655a0077343e063.png',
    loginBackgroundUrl: 'https://images.pexels.com/photos/1297799/pexels-photo-1297799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    loginAudioUrl: 'https://cdn.pixabay.com/audio/2022/08/03/audio_5a6914c622.mp3',
    playerDashboardBackgroundUrl: '',
    adminDashboardBackgroundUrl: '',
    playerDashboardAudioUrl: '',
    adminDashboardAudioUrl: '',
    apkUrl: '',
    apiServerUrl: '',
    minimumSignupAge: 18,
    bankInfo: {
        bankName: 'Global Trust Bank',
        accountNumber: '**** **** **** 1234',
        routingNumber: '*********',
    },
    fixedEventRules: "1. All players must have approved eye protection (ANSI Z87.1 rated) worn at all times in designated areas.\n2. All weapons will be chronographed before play. Field limits will be strictly enforced.\n3. Do not blind fire. You must be able to see your target.\n4. Call your hits. Cheating will not be tolerated.\n5. Observe minimum engagement distances (MEDs) for high-powered replicas.\n6. No physical contact or verbal abuse between players.",
};

const MOCK_API_GUIDE: ApiGuideStep[] = [
  { id: 'g1', title: 'The Problem: File Size Limits', content: "By default, this application stores all uploaded files (images, audio) directly in the Firebase Firestore database. While simple, Firestore has a hard limit of about **1MB per document**. Our direct-upload component is capped at 500KB to be safe.\n\nThis makes it impossible to use large, high-quality media like background videos or long audio briefings with the direct upload feature." },
  { id: 'g2', title: 'The Solution: Your Own File Server', content: "This guide shows you how to run a small, simple server application on your own computer or a Virtual Private Server (VPS). This server's only job is to accept file uploads of **any type (images, videos, audio)** and save them to a local folder.\n\nWhen you configure this server's URL in the main Settings tab, the dashboard will automatically switch from storing files in the database to sending them to your server. This completely bypasses the file size limit, allowing for uploads up to 100MB (or whatever you configure)." },
  { id: 'g3', title: 'Step 1: Get Server Files', content: "You need two files to create the server: `server.js` (the application logic) and `package.json` (the list of dependencies). You can download these as a ZIP file below, or create them in a new folder on your server PC (e.g., `C:\\bosjol-api-server`) and copy the contents into them.", codeBlock: `
// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = 'uploads';
const app = express();
app.use(cors());
app.use(express.json());
app.use(\`/\${UPLOADS_DIR}\`, express.static(path.join(__dirname, UPLOADS_DIR)));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send({ error: 'No file was uploaded.' });
    const API_BASE_URL = process.env.API_BASE_URL || \`http://localhost:\${PORT}\`;
    const fileUrl = \`\${API_BASE_URL}/\${UPLOADS_DIR}/\${req.file.filename}\`;
    res.status(200).send({ url: fileUrl });
});
app.get('/health', (req, res) => res.status(200).send({ status: 'ok' }));
app.listen(PORT, () => console.log(\`✅ Bosjol API Server is running on http://localhost:\${PORT}\`));
`, codeLanguage: 'javascript', fileName: 'server.js' },
  { id: 'g4', title: '', content: '', codeBlock: `
{
  "name": "bosjol-tactical-api-server",
  "version": "1.0.0",
  "description": "A simple Express server for handling file uploads for the Bosjol Tactical Dashboard.",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1"
  }
}
`, codeLanguage: 'json', fileName: 'package.json' },
  { id: 'g5', title: 'Step 2: Server Prerequisites', content: "You will need:\n- An always-on computer (like a home server or VPS).\n- [Node.js](https://nodejs.org/) (version 18+) installed.\n- [PM2](https://pm2.keymetrics.io/), a process manager to keep the server running. Install it globally by opening a terminal/command prompt and running: `npm install pm2 -g`" },
  { id: 'g6', title: 'Step 3: Server Setup', content: "Navigate into the folder you created with your terminal and install the required dependencies.", codeBlock: `# Navigate to the project folder\ncd C:\\bosjol-api-server\n\n# Install dependencies\nnpm install`, codeLanguage: 'bash' },
  { id: 'g7', title: 'Step 4: Running the Server', content: "Start the server using PM2. This runs it in the background and ensures it restarts automatically if the computer reboots.", codeBlock: `# Start the server\npm2 start server.js --name "bosjol-api"\n\n# Save the process list to run on startup\npm2 save\n\n# (Optional) To monitor server logs\npm2 logs bosjol-api`, codeLanguage: 'bash' },
  { id: 'g8', title: 'Step 5: Expose to the Internet', content: "To make your local server securely accessible from anywhere, we'll use a free Cloudflare Tunnel.\n1. Follow the [Cloudflare Tunnels Quickstart Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/) to download, install, and log in with the `cloudflared` command-line tool.\n2. Once set up, run the tunnel command, pointing it to your local server's port (3001).", codeBlock: `cloudflared tunnel --url http://localhost:3001`, codeLanguage: 'bash' },
  { id: 'g9', title: 'Step 6: Final Configuration', content: "Cloudflare will give you a public URL (e.g., `https://your-random-name.trycloudflare.com`). Go to the main 'Settings' tab in this dashboard, paste this public URL into the 'API Server URL' field, and click 'Save All Settings'. The app will now automatically use your server for all file uploads, and the status indicator in the footer should turn blue." }
];

export const MOCK_CREATOR_DETAILS: CreatorDetails = {
    id: 'creatorDetails',
    name: 'JSTYP.me',
    email: 'jstypme@gmail.com',
    whatsapp: '27695989427',
    tagline: "Jason's solution to your problems, Yes me!",
    bio: "Need a website, mobile app or custom tool get in touch today.. At Jstyp.me nothing is impossible, innovation is key and the mind is a open learning space. Here we build on what can not be done!",
    logoUrl: 'https://i.ibb.co/TDC9Xn1N/JSTYP-me-Logo.png',
    githubUrl: 'https://github.com/jstyp/bosjol-tactical-dashboard',
    sourceCodeZipUrl: 'https://github.com/jstyp/bosjol-tactical-api-server/archive/refs/heads/main.zip',
    apiSetupGuide: MOCK_API_GUIDE
};


// Generate detailed transactions from mock data
const generateMockTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];

    // Inventory Expenses
    MOCK_INVENTORY.forEach((item, index) => {
        transactions.push({
            id: `txn-exp-inv-${item.id}`,
            date: item.purchaseDate || new Date(Date.now() - (365 - index * 30) * 24 * 60 * 60 * 1000).toISOString(),
            type: 'Expense',
            description: `Purchase: ${item.stock}x ${item.name}`,
            amount: (item.purchasePrice || 0) * item.stock,
            relatedInventoryId: item.id,
        });
    });

    // Event & Rental Revenue from completed events
    initialEvents.filter(e => e.status === 'Completed').forEach(event => {
        event.attendees.forEach(attendee => {
            // Event Fee Transaction
            transactions.push({
                id: `txn-rev-event-${event.id}-${attendee.playerId}`,
                date: event.date,
                type: 'Event Revenue',
                description: `Event Fee: ${event.title}`,
                amount: event.gameFee,
                relatedEventId: event.id,
                relatedPlayerId: attendee.playerId,
                paymentStatus: attendee.paymentStatus,
            });

            // Rental Fee Transactions
            (attendee.rentedGearIds || []).forEach(gearId => {
                const gearItem = MOCK_INVENTORY.find(i => i.id === gearId);
                if (gearItem) {
                    transactions.push({
                        id: `txn-rev-rental-${event.id}-${attendee.playerId}-${gearId}`,
                        date: event.date,
                        type: 'Rental Revenue',
                        description: `Rental: ${gearItem.name}`,
                        amount: gearItem.salePrice,
                        relatedEventId: event.id,
                        relatedPlayerId: attendee.playerId,
                        relatedInventoryId: gearId,
                        paymentStatus: attendee.paymentStatus,
                    });
                }
            });
        });
    });

    // Mock Retail Sales
    transactions.push({
        id: `txn-rev-retail-1`,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Retail Revenue',
        description: 'Sale: Extra Magazine',
        amount: MOCK_INVENTORY.find(i => i.id === 'g03')?.salePrice || 50,
        relatedInventoryId: 'g03',
        relatedPlayerId: 'p003',
        paymentStatus: 'Paid (Card)',
    });
     transactions.push({
        id: `txn-rev-retail-2`,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Retail Revenue',
        description: 'Sale: Smoke Grenade x5',
        amount: (MOCK_INVENTORY.find(i => i.id === 'g06')?.salePrice || 80) * 5,
        relatedInventoryId: 'g06',
        relatedPlayerId: 'p001',
        paymentStatus: 'Paid (Cash)',
    });


    return transactions;
};


export const MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions();