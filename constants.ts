import type { Player, Admin, GameEvent, Briefing, Rank, GamificationSettings, Badge, Sponsor, CompanyDetails, MatchRecord, Loadout, PlayerRole, InventoryItem, Voucher, Supplier, Transaction, Location, LegendaryBadge, Raffle, EventStatus, EventType, SocialLink, CarouselMedia, CreatorDetails } from './types';

export const MOCK_BADGES: Badge[] = [
    { id: 'b01', name: 'Sharpshooter', description: 'Achieve 50 headshots', iconUrl: 'https://cdn.pixabay.com/photo/2012/04/13/19/27/target-33391_1280.png', criteria: { type: 'headshots', value: 50 }},
    { id: 'b02', name: 'Veteran', description: 'Participate in 25 matches', iconUrl: 'https://cdn.pixabay.com/photo/2017/08/10/03/00/medal-2617351_1280.png', criteria: { type: 'gamesPlayed', value: 25 }},
    { id: 'b03', name: 'First Kill', description: 'Get your first kill', iconUrl: 'https://cdn.pixabay.com/photo/2012/04/12/21/51/skull-30880_1280.png', criteria: { type: 'kills', value: 1 }},
    { id: 'b04', name: 'Gold Tier Operator', description: 'Awarded for reaching the Gold rank', iconUrl: 'https://img.icons8.com/color/96/gold-medal.png', criteria: { type: 'rank', value: 'Gold' } },
];

export const MOCK_LEGENDARY_BADGES: LegendaryBadge[] = [
    { id: 'leg01', name: 'Medal of Valor', description: 'Awarded for exceptional bravery and selflessness in a critical situation.', iconUrl: 'https://img.icons8.com/color/96/laurel-wreath.png', howToObtain: 'Manually awarded by an admin for acts of exceptional bravery.' },
    { id: 'leg02', name: 'Tactical Genius', description: 'Recognizes an operator who devised and executed a game-changing strategy.', iconUrl: 'https://img.icons8.com/color/96/brain-3.png', howToObtain: 'Manually awarded by an admin for brilliant strategic plays.' },
    { id: 'leg03', name: 'Last Man Standing', description: 'For an operator who single-handedly clutched a victory against overwhelming odds.', iconUrl: 'https://img.icons8.com/fluency/96/shield.png', howToObtain: 'Be the last surviving member of your team and win the round.' },
];

export const UNRANKED_RANK: Rank = { 
    // FIX: Add id to conform to the updated Rank interface.
    id: 'rank_unranked',
    name: 'Unranked',
    tier: 'N/A',
    minXp: 0, 
    iconUrl: 'https://img.icons8.com/ios-filled/100/737373/shield.png',
    unlocks: ["Access to standard loadout"],
};

// New 30-rank structure
// FIX: Add unique id properties to all ranks to conform to the Rank interface.
export const MOCK_RANKS: Rank[] = [
    // Tier 1 - Recruit
    { id: "rank_t01_1", tier: "Tier 1 – Recruit", name: "Trainee", minXp: 0, iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png", unlocks: ["Basic Loadout"] },
    { id: "rank_t01_2", tier: "Tier 1 – Recruit", name: "Novice", minXp: 100, iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png", unlocks: ["New Pistol Option"] },
    // Tier 2 - Cadet
    { id: "rank_t02_1", tier: "Tier 2 – Cadet", name: "Cadet 1", minXp: 250, iconUrl: "https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-rank-military-flatart-icons-outline-flatarticons.png", unlocks: ["New SMG Option"] },
    { id: "rank_t02_2", tier: "Tier 2 – Cadet", name: "Cadet 2", minXp: 400, iconUrl: "https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-rank-military-flatart-icons-outline-flatarticons.png", unlocks: ["First Perk Slot"] },
    // Tier 3 - Private
    { id: "rank_t03_1", tier: "Tier 3 – Private", name: "Private 1", minXp: 600, iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png", unlocks: ["New AR Option"] },
    { id: "rank_t03_2", tier: "Tier 3 – Private", name: "Private 2", minXp: 800, iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png", unlocks: ["New Tactical Grenade"] },
    // Tier 4 - Corporal
    { id: "rank_t04_1", tier: "Tier 4 – Corporal", name: "Corporal 1", minXp: 1050, iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png", unlocks: ["New Scope Attachment"] },
    { id: "rank_t04_2", tier: "Tier 4 – Corporal", name: "Corporal 2", minXp: 1300, iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png", unlocks: ["5% Store Discount"] },
    // Tier 5 - Sergeant
    { id: "rank_t05_1", tier: "Tier 5 – Sergeant", name: "Sergeant 1", minXp: 1600, iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png", unlocks: ["New Sniper Rifle"] },
    { id: "rank_t05_2", tier: "Tier 5 – Sergeant", name: "Sergeant 2", minXp: 1900, iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png", unlocks: ["Second Perk Slot"] },
    // Tier 6 - Staff Sergeant
    { id: "rank_t06_1", tier: "Tier 6 – Staff Sergeant", name: "Staff Sergeant 1", minXp: 2250, iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png", unlocks: ["New Shotgun"] },
    { id: "rank_t06_2", tier: "Tier 6 – Staff Sergeant", name: "Staff Sergeant 2", minXp: 2600, iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png", unlocks: ["New Lethal Grenade"] },
    // Tier 7 - Gunnery Sergeant
    { id: "rank_t07_1", tier: "Tier 7 – Gunnery Sergeant", name: "Gunnery Sergeant 1", minXp: 3000, iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png", unlocks: ["Custom Weapon Charm"] },
    { id: "rank_t07_2", tier: "Tier 7 – Gunnery Sergeant", name: "Gunnery Sergeant 2", minXp: 3400, iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png", unlocks: ["10% Store Discount"] },
    // Tier 8 - First Sergeant
    { id: "rank_t08_1", tier: "Tier 8 – First Sergeant", name: "First Sergeant 1", minXp: 3850, iconUrl: "https://img.icons8.com/ios-filled/50/insignia.png", unlocks: ["New Underbarrel Attachment"] },
    { id: "rank_t08_2", tier: "Tier 8 – First Sergeant", name: "First Sergeant 2", minXp: 4300, iconUrl: "https://img.icons8.com/ios-filled/50/insignia.png", unlocks: ["New Operator Skin"] },
    // Tier 9 - Master Sergeant
    { id: "rank_t09_1", tier: "Tier 9 – Master Sergeant", name: "Master Sergeant 1", minXp: 4800, iconUrl: "https://img.icons8.com/ios-filled/50/military-rank.png", unlocks: ["Third Perk Slot"] },
    { id: "rank_t09_2", tier: "Tier 9 – Master Sergeant", name: "Master Sergeant 2", minXp: 5300, iconUrl: "https://img.icons8.com/ios-filled/50/military-rank.png", unlocks: ["New LMG"] },
    // Tier 10 - Sergeant Major
    { id: "rank_t10_1", tier: "Tier 10 – Sergeant Major", name: "Sergeant Major 1", minXp: 5850, iconUrl: "https://img.icons8.com/color/48/sergeant-major-of-the-army.png", unlocks: ["Exclusive Calling Card"] },
    { id: "rank_t10_2", tier: "Tier 10 – Sergeant Major", name: "Sergeant Major 2", minXp: 6400, iconUrl: "https://img.icons8.com/color/48/sergeant-major-of-the-army.png", unlocks: ["15% Store Discount"] },
    // Tier 11 - Warrant Officer
    { id: "rank_t11_1", tier: "Tier 11 – Warrant Officer", name: "Warrant Officer 1", minXp: 7000, iconUrl: "https://img.icons8.com/external-justicon-flat-justicon/64/external-award-reward-and-badges-justicon-flat-justicon-1.png", unlocks: ["New Marksman Rifle"] },
    { id: "rank_t11_2", tier: "Tier 11 – Warrant Officer", name: "Warrant Officer 2", minXp: 7600, iconUrl: "https://img.icons8.com/external-justicon-flat-justicon/64/external-award-reward-and-badges-justicon-flat-justicon-1.png", unlocks: ["Free Gear Rental Coupon"] },
    // Tier 12 - Lieutenant
    { id: "rank_t12_1", tier: "Tier 12 – Lieutenant", name: "Lieutenant 1", minXp: 8250, iconUrl: "https://img.icons8.com/external-flat-icons-vectors-co/48/external-rank-military-maps-and-flags-flat-icons-vectors-co.png", unlocks: ["New Laser Sight"] },
    { id: "rank_t12_2", tier: "Tier 12 – Lieutenant", name: "Lieutenant 2", minXp: 8900, iconUrl: "https://img.icons8.com/external-flat-icons-vectors-co/48/external-rank-military-maps-and-flags-flat-icons-vectors-co.png", unlocks: ["Additional Loadout Slot"] },
    // Tier 13 - Captain
    { id: "rank_t13_1", tier: "Tier 13 – Captain", name: "Captain 1", minXp: 9600, iconUrl: "https://img.icons8.com/external-flat-icons-vectors-co/48/external-badge-military-maps-and-flags-flat-icons-vectors-co.png", unlocks: ["New Suppressor"] },
    { id: "rank_t13_2", tier: "Tier 13 – Captain", name: "Captain 2", minXp: 10300, iconUrl: "https://img.icons8.com/external-flat-icons-vectors-co/48/external-badge-military-maps-and-flags-flat-icons-vectors-co.png", unlocks: ["20% Store Discount"] },
    // Tier 14 - Major
    { id: "rank_t14_1", tier: "Tier 14 – Major", name: "Major 1", minXp: 11050, iconUrl: "https://img.icons8.com/fluency/48/medal2.png", unlocks: ["Elite Operator Skin"] },
    { id: "rank_t14_2", tier: "Tier 14 – Major", name: "Major 2", minXp: 11800, iconUrl: "https://img.icons8.com/fluency/48/medal2.png", unlocks: ["Prestige Weapon Blueprint"] },
    // Tier 15 - Colonel
    { id: "rank_t15_1", tier: "Tier 15 – Colonel", name: "Colonel 1", minXp: 12600, iconUrl: "https://img.icons8.com/officel/40/command-sergeant-major.png", unlocks: ["Hall of Fame Entry"] },
    { id: "rank_t15_2", tier: "Tier 15 – Colonel", name: "Colonel 2", minXp: 13500, iconUrl: "https://img.icons8.com/officel/40/command-sergeant-major.png", unlocks: ["Lifetime 25% Discount"] }
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
    location: 'Verdansk',
    description: 'Infiltrate the enemy stronghold under the cover of darkness. Your primary objective is to retrieve sensitive intel from a heavily guarded command post. Secondary objectives include disrupting enemy communications and sabotaging their supply lines. Expect heavy resistance.',
    attendees: [],
    signedUpPlayers: ['p001', 'p003'],
    absentPlayers: [],
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/163822/soldier-airsoft-gun-weapon-163822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Modern Warfare',
    rules: 'Standard ROE. Suppressors recommended. NVG is mandatory. One medic per squad.',
    participationXp: 50,
    gameFee: 300,
    gearForRent: MOCK_INVENTORY.filter(i => i.isRental).slice(0, 3),
    rentalSignups: [],
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
    location: 'Killhouse',
    description: 'Hone your close-quarters combat skills in a series of intense training drills. Focus will be on room clearing, door breaching, and team communication in tight spaces. All skill levels welcome.',
    attendees: [],
    signedUpPlayers: ['p001', 'p002', 'p003'],
    absentPlayers: [],
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/7984333/pexels-photo-7984333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Drill',
    rules: 'Training weapons only. No lethal equipment. Full face protection required.',
    participationXp: 25,
    gameFee: 150,
    gearForRent: [],
    rentalSignups: [],
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
    signedUpPlayers: ['p001', 'p002', 'p003'],
    absentPlayers: [],
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/53860/pexels-photo-53860.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Logistics',
    rules: 'Unload and clear all weapons before entry. No live ammunition in the maintenance area.',
    participationXp: 10,
    gameFee: 0,
    gearForRent: [],
    rentalSignups: [],
    liveStats: {},
    gameDurationSeconds: 0,
  },
   {
    id: 'e000',
    title: 'Operation Kingslayer',
    type: 'Mission',
    date: '2023-10-20T18:00:00Z',
    startTime: "18:00",
    location: 'Al Mazrah',
    description: 'Successful HVT extraction under heavy fire. Operators infiltrated a desert compound, neutralized threats, and exfiltrated the high-value target before enemy reinforcements could arrive.',
    attendees: [
        { playerId: 'p001', paymentStatus: 'Paid (Card)', rentedGearIds: ['g01', 'g05'], voucherCode: 'LOYALTY50' },
        { playerId: 'p002', paymentStatus: 'Paid (Cash)', rentedGearIds: ['g02'] },
    ],
    signedUpPlayers: [],
    absentPlayers: [],
    status: 'Completed',
    imageUrl: 'https://images.pexels.com/photos/8354527/pexels-photo-8354527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Desert Ops',
    rules: 'HVT must be extracted alive. All hostiles are cleared for engagement.',
    participationXp: 100,
    gameFee: 350,
    gearForRent: MOCK_INVENTORY.filter(i => i.isRental),
    rentalSignups: [],
    liveStats: {
        'p001': { kills: 8, deaths: 3, headshots: 2 },
        'p002': { kills: 12, deaths: 1, headshots: 5 }
    },
    gameDurationSeconds: 2750, // e.g., 45 minutes and 50 seconds
  },
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
    pin: '1111',
    age: 28,
    idNumber: 'A12345678',
    address: 'Hereford, UK',
    allergies: 'None',
    medicalNotes: 'Resistant to flashbangs.',
    role: 'player',
    callsign: 'Soap',
    rank: MOCK_RANKS[7], // Corporal 2
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2017/11/06/13/45/cap-2923682_1280.jpg',
    stats: {
        kills: 128,
        deaths: 45,
        headshots: 32,
        gamesPlayed: 15,
        xp: 1350,
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
    pin: '2222',
    age: 35,
    idNumber: 'B87654321',
    address: 'Manchester, UK',
    allergies: 'Penicillin',
    medicalNotes: 'Prefers to remain masked.',
    role: 'player',
    callsign: 'Ghost',
    rank: MOCK_RANKS[9], // Sergeant 2
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2023/07/04/19/43/man-8107142_1280.jpg',
    stats: {
        kills: 210,
        deaths: 30,
        headshots: 88,
        gamesPlayed: 18,
        xp: 2050,
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
    pin: '3333',
    age: 32,
    idNumber: 'C11223344',
    address: 'London, UK',
    role: 'player',
    callsign: 'Gaz',
    rank: MOCK_RANKS[8], // Sergeant 1
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2015/01/07/20/53/hat-591973_1280.jpg',
    stats: {
        kills: 142,
        deaths: 55,
        headshots: 41,
        gamesPlayed: 16,
        xp: 1610,
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
    pin: '4444',
    age: 21,
    idNumber: 'D55667788',
    role: 'player',
    callsign: 'Rook',
    rank: MOCK_RANKS[3], // Cadet 2
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2016/03/09/10/22/girl-1246022_1280.jpg',
    stats: {
        kills: 5,
        deaths: 8,
        headshots: 1,
        gamesPlayed: 3,
        xp: 450,
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
    pin: '5555',
    age: 29,
    idNumber: 'E99887766',
    role: 'player',
    callsign: 'Nomad',
    rank: MOCK_RANKS[12], // Lieutenant 1
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
    pin: '6666',
    age: 26,
    idNumber: 'F12123434',
    role: 'player',
    callsign: 'Valkyrie',
    rank: MOCK_RANKS[10], // Staff Sergeant 1
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2021/06/25/19/33/woman-6364433_1280.jpg',
    stats: { kills: 180, deaths: 80, headshots: 50, gamesPlayed: 22, xp: 2300 },
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
    pin: '7777',
    age: 31,
    idNumber: 'G56567878',
    role: 'player',
    callsign: 'Oni',
    rank: MOCK_RANKS[5], // Private 2
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2016/11/29/08/59/man-1868552_1280.jpg',
    stats: { kills: 95, deaths: 65, headshots: 20, gamesPlayed: 12, xp: 950 },
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
    pin: '8888',
    age: 33,
    idNumber: 'H90901212',
    role: 'player',
    callsign: 'Echo',
    rank: MOCK_RANKS[15], // First Sergeant 2
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
    pin: '9999',
    age: 27,
    idNumber: 'I34345656',
    role: 'player',
    callsign: 'Breach',
    rank: MOCK_RANKS[6], // Corporal 1
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2017/08/01/01/33/beanie-2562646_1280.jpg',
    stats: { kills: 115, deaths: 95, headshots: 35, gamesPlayed: 19, xp: 1100 },
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
    pin: '1010',
    age: 19,
    idNumber: 'J78789090',
    role: 'player',
    callsign: 'Spectre',
    rank: MOCK_RANKS[1], // Novice
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
    { id: 's01', name: 'Tactical Gear Co.', logoUrl: 'https://img.logoipsum.com/243.svg', email: 'contact@tacticalgear.com', phone: '555-0201', website: 'https://tacticalgear.com' },
    { id: 's02', name: 'Adrenaline Fuel', logoUrl: 'https://img.logoipsum.com/244.svg', email: 'sponsorship@adrenaline.com', phone: '555-0202', website: 'https://adrenaline.com' },
    { id: 's03', name: 'Vortex Optics', logoUrl: 'https://img.logoipsum.com/245.svg', email: 'info@vortex.com', phone: '555-0203', website: 'https://vortex.com' },
    { id: 's04', name: '5.11 Tactical', logoUrl: 'https://img.logoipsum.com/246.svg', email: 'support@511.com', phone: '555-0204', website: 'https://511.com' },
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
    { id: 'cm1', type: 'image', url: 'https://images.pexels.com/photos/163822/soldier-airsoft-gun-weapon-163822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
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
    loginBackgroundUrl: '', // Default to empty, let user upload
    loginAudioUrl: '',
    playerDashboardBackgroundUrl: '',
    adminDashboardBackgroundUrl: '',
    apiServerUrl: '',
    apkUrl: '',
    minimumSignupAge: 18,
    bankInfo: {
        bankName: 'Global Trust Bank',
        accountNumber: '**** **** **** 1234',
        routingNumber: '*********',
    },
    fixedEventRules: "1. All players must have approved eye protection (ANSI Z87.1 rated) worn at all times in designated areas.\n2. All weapons will be chronographed before play. Field limits will be strictly enforced.\n3. Do not blind fire. You must be able to see your target.\n4. Call your hits. Cheating will not be tolerated.\n5. Observe minimum engagement distances (MEDs) for high-powered replicas.\n6. No physical contact or verbal abuse between players.",
};

export const MOCK_CREATOR_DETAILS: CreatorDetails = {
    id: 'creatorDetails',
    name: 'JSTYP.me',
    email: 'jstypme@gmail.com',
    whatsapp: '27695989427',
    tagline: "Jason's solution to your problems, Yes me!",
    bio: "Need a website, mobile app or custom tool get in touch today.. At Jstyp.me nothing is impossible, innovation is key and the mind is a open learning space. Here we build on what can not be done!",
    logoUrl: 'https://i.ibb.co/TDC9Xn1N/JSTYP-me-Logo.png',
    githubUrl: 'https://github.com/jstyp/bosjol-tactical-dashboard'
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