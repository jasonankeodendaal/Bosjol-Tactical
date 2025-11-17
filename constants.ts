// FIX: Import `PlayerStats` to resolve TypeScript error on line 516.
import type { Player, PlayerCore, Admin, GameEvent, EventCore, Briefing, GamificationSettings, Badge, Sponsor, CompanyDetails, MatchRecord, Loadout, PlayerRole, InventoryItem, Voucher, Supplier, Transaction, Location, LegendaryBadge, Raffle, EventStatus, EventType, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, Tier, ApiGuideStep, MatchHistoryDoc, XpAdjustmentDoc, AttendeeDoc, RaffleCore, RaffleTicketDoc, RaffleWinnerDoc, VoucherCore, VoucherRedemption, PlayerStats } from './types';

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

export const UNRANKED_TIER: Tier = { 
    id: 'subrank_unranked',
    name: 'Unranked',
    minXp: 0, 
    iconUrl: 'https://img.icons8.com/ios-filled/100/737373/shield.png',
    perks: ["Play 10 games to get ranked"],
};

export const MOCK_RANKS: Rank[] = [
  {
    id: "rank_rookie",
    name: "Rookie",
    description: "Introductory rank for new operators learning the ropes.",
    rankBadgeUrl: "https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-outline-flatarticons.png",
    tiers: [
      { id: "r_i", name: "Rookie I", minXp: 0, perks: ["Basic Calling Card"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_ii", name: "Rookie II", minXp: 201, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_iii", name: "Rookie III", minXp: 401, perks: ["Custom Banner"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_iv", name: "Rookie IV", minXp: 601, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" },
      { id: "r_v", name: "Rookie V", minXp: 801, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/sf-regular-filled/48/military-insignia.png" }
    ]
  },
  {
    id: "rank_vet",
    name: "Veteran",
    description: "For established players who have proven their skills in the field.",
    rankBadgeUrl: "https://img.icons8.com/external-flatart-icons-flat-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-flat-flatarticons.png",
    tiers: [
      { id: "v_i", name: "Veteran I", minXp: 1001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_ii", name: "Veteran II", minXp: 1201, perks: ["Custom Banner"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_iii", name: "Veteran III", minXp: 1401, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_iv", name: "Veteran IV", minXp: 1601, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" },
      { id: "v_v", name: "Veteran V", minXp: 1801, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks.png" }
    ]
  },
  {
    id: "rank_elite",
    name: "Elite",
    description: "Recognizing mid-tier competitive players with advanced tactical abilities.",
    rankBadgeUrl: "https://img.icons8.com/external-flatart-icons-lineal-color-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-lineal-color-flatarticons.png",
    tiers: [
      { id: "e_i", name: "Elite I", minXp: 2001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_ii", name: "Elite II", minXp: 2201, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_iii", name: "Elite III", minXp: 2401, perks: ["Custom Calling Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_iv", name: "Elite IV", minXp: 2601, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" },
      { id: "e_v", name: "Elite V", minXp: 2801, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" }
    ]
  },
  {
    id: "rank_pro",
    name: "Pro",
    description: "High-skill players demonstrating professional-level gameplay.",
    rankBadgeUrl: "https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-shield-gaming-justicon-lineal-color-justicon.png",
    tiers: [
      { id: "p_i", name: "Pro I", minXp: 3001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_ii", name: "Pro II", minXp: 3301, perks: ["Exclusive Camo"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_iii", name: "Pro III", minXp: 3601, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_iv", name: "Pro IV", minXp: 3901, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" },
      { id: "p_v", name: "Pro V", minXp: 4201, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-rank-military-smashingstocks-glyph-smashing-stocks-2.png" }
    ]
  },
  {
    id: "rank_master",
    name: "Master",
    description: "Top-tier competitive operators with mastery over all aspects of combat.",
    rankBadgeUrl: "https://img.icons8.com/external-flat-wichaiwi/64/external-shield-game-design-flat-wichaiwi.png",
    tiers: [
      { id: "m_i", name: "Master I", minXp: 4501, perks: ["Weapon XP Card + Camo"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_ii", name: "Master II", minXp: 4801, perks: ["Exclusive Calling Card"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_iii", name: "Master III", minXp: 5101, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_iv", name: "Master IV", minXp: 5401, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" },
      { id: "m_v", name: "Master V", minXp: 5701, perks: ["Exclusive Skin + Camo"], iconUrl: "https://img.icons8.com/ios-filled/50/air-force-rank.png" }
    ]
  },
  {
    id: "rank_gm",
    name: "Grand Master",
    description: "Among the best of the best, with access to exclusive rewards.",
    rankBadgeUrl: "https://img.icons8.com/ios-filled/50/medal.png",
    tiers: [
      { id: "gm_i", name: "Grand Master I", minXp: 6001, perks: ["Permanent Cosmetic Reward"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_ii", name: "Grand Master II", minXp: 6401, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_iii", name: "Grand Master III", minXp: 6801, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_iv", name: "Grand Master IV", minXp: 7201, perks: ["Custom Calling Card"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" },
      { id: "gm_v", name: "Grand Master V", minXp: 7601, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-rank-military-flatart-icons-solid-flatarticons.png" }
    ]
  },
  {
    id: "rank_leg",
    name: "Legendary",
    description: "The pinnacle of achievement. Your exact RP and leaderboard position are now displayed.",
    rankBadgeUrl: "https://img.icons8.com/fluency/48/trophy.png",
    tiers: [
      { id: "l_i", name: "Legendary", minXp: 8001, perks: ["Legendary Banner / Frame", "Leaderboard Position Displayed"], iconUrl: "https://img.icons8.com/color/96/medal-of-honor.png" }
    ]
  }
];

export const MOCK_GAMIFICATION_SETTINGS: GamificationSettings = [
    { id: 'g_kill', name: 'RP per Kill', description: 'RP awarded for each standard elimination.', xp: 10 },
    { id: 'g_headshot', name: 'RP per Headshot', description: 'Bonus RP for headshot eliminations. Added to kill RP.', xp: 25 },
    { id: 'g_death', name: 'RP Loss per Death', description: 'RP deducted each time a player is eliminated.', xp: -5 },
    { id: 'g_game', name: 'Base RP per Game', description: 'RP awarded to every player for completing a match.', xp: 100 },
    { id: 'g_no_show_penalty', name: 'No-Show Penalty', description: 'RP deducted if a player signs up for an event but does not attend.', xp: -150 },
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

const initialEventsCore: EventCore[] = [
  {
    id: 'e001',
    title: 'Operation Nightfall',
    type: 'Mission',
    date: '2023-10-28T18:00:00Z',
    startTime: "18:00",
    location: 'Verdansk CQB Arena',
    description: 'Infiltrate the enemy stronghold under the cover of darkness. Your primary objective is to retrieve sensitive intel from a heavily guarded command post. Secondary objectives include disrupting enemy communications and sabotaging their supply lines. Expect heavy resistance.',
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
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/7984333/pexels-photo-7984333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Drill',
    rules: 'Training weapons only. No lethal equipment. Full face protection required.',
    participationXp: 25,
    gameFee: 150,
    gearForRent: [],
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
    status: 'Upcoming',
    imageUrl: 'https://images.pexels.com/photos/53860/pexels-photo-53860.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Logistics',
    rules: 'Unload and clear all weapons before entry. No live ammunition in the maintenance area.',
    participationXp: 10,
    gameFee: 0,
    gearForRent: [],
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
    status: 'Completed',
    imageUrl: 'https://images.pexels.com/photos/8354527/pexels-photo-8354527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    theme: 'Desert Ops',
    rules: 'HVT must be extracted alive. All hostiles are cleared for engagement.',
    participationXp: 100,
    gameFee: 350,
    gearForRent: MOCK_INVENTORY.filter(i => i.isRental).map(i => i.id),
    gameDurationSeconds: 2750, // e.g., 45 minutes and 50 seconds
  },
];

export const MOCK_ALL_ATTENDEES: AttendeeDoc[] = [
    { id: 'p001', eventId: 'e000', playerId: 'p001', paymentStatus: 'Paid (Card)', rentedGearIds: ['g01', 'g05'], voucherCode: 'LOYALTY50', stats: { kills: 8, deaths: 3, headshots: 2 } },
    { id: 'p002', eventId: 'e000', playerId: 'p002', paymentStatus: 'Paid (Cash)', rentedGearIds: ['g02'], stats: { kills: 12, deaths: 1, headshots: 5 } },
];

// FIX: Construct MOCK_EVENTS as GameEvent[] by combining EventCore with attendees and live stats, resolving the type error in DataContext.
export const MOCK_EVENTS: GameEvent[] = initialEventsCore.map(eventCore => {
    const attendeesForEvent = MOCK_ALL_ATTENDEES.filter(a => a.eventId === eventCore.id);
    const liveStatsForEvent: GameEvent['liveStats'] = {};
    attendeesForEvent.forEach(attendee => {
        if (attendee.stats) {
            liveStatsForEvent[attendee.playerId] = attendee.stats;
        }
    });

    return {
        ...eventCore,
        attendees: attendeesForEvent,
        liveStats: liveStatsForEvent,
    };
});

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

export const MOCK_ALL_MATCH_HISTORY: MatchHistoryDoc[] = [
    { id: 'mh001', playerId: 'p001', eventId: 'e000', playerStats: { kills: 8, deaths: 3, headshots: 2 }},
    { id: 'mh002', playerId: 'p002', eventId: 'e000', playerStats: { kills: 12, deaths: 1, headshots: 5 }},
];

export const MOCK_ALL_XP_ADJUSTMENTS: XpAdjustmentDoc[] = [
    { id: 'xp001', playerId: 'p001', amount: 50, reason: 'Bonus for excellent teamwork in Operation Kingslayer', date: '2023-10-21T10:00:00Z' }
];

export const MOCK_PLAYERS_CORE: PlayerCore[] = [
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
    rank: MOCK_RANKS[1].tiers[3], // Veteran IV (1650 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2017/11/06/13/45/cap-2923682_1280.jpg',
    stats: { kills: 128, deaths: 45, headshots: 32, gamesPlayed: 15, xp: 1650 },
    badges: [MOCK_BADGES[2]],
    legendaryBadges: [],
    loadout: { primaryWeapon: 'M4A1 Assault Rifle', secondaryWeapon: 'X12 Pistol', lethal: 'Frag Grenade', tactical: 'Flashbang' },
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
    rank: MOCK_RANKS[3].tiers[0], // Pro I (3100 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2023/07/04/19/43/man-8107142_1280.jpg',
    stats: { kills: 210, deaths: 30, headshots: 88, gamesPlayed: 18, xp: 3100 },
    badges: [MOCK_BADGES[0], MOCK_BADGES[2]],
    legendaryBadges: [MOCK_LEGENDARY_BADGES[0]],
    loadout: { primaryWeapon: 'Honey Badger SMG', secondaryWeapon: '.50 GS Pistol', lethal: 'Semtex', tactical: 'Heartbeat Sensor' },
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
    rank: MOCK_RANKS[2].tiers[1], // Elite II (2200 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2015/01/07/20/53/hat-591973_1280.jpg',
    stats: { kills: 142, deaths: 55, headshots: 41, gamesPlayed: 16, xp: 2200 },
    badges: [MOCK_BADGES[2]],
    legendaryBadges: [],
    loadout: { primaryWeapon: 'M13B Assault Rifle', secondaryWeapon: 'P890 Pistol', lethal: 'Claymore', tactical: 'Smoke Grenade' },
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
    rank: UNRANKED_TIER, // (350 XP, < 10 games)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2016/03/09/10/22/girl-1246022_1280.jpg',
    stats: { kills: 5, deaths: 8, headshots: 1, gamesPlayed: 3, xp: 350 },
    badges: [],
    legendaryBadges: [],
    loadout: { primaryWeapon: 'MP5', secondaryWeapon: 'Glock 19', lethal: 'Frag Grenade', tactical: 'Smoke Grenade' },
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
    rank: MOCK_RANKS[6].tiers[0], // Legendary (8500 XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2018/01/15/07/52/woman-3083390_1280.jpg',
    stats: { kills: 350, deaths: 120, headshots: 95, gamesPlayed: 30, xp: 8500 },
    badges: [MOCK_BADGES[0], MOCK_BADGES[1], MOCK_BADGES[2]],
    legendaryBadges: [],
    loadout: { primaryWeapon: 'MSR Sniper Rifle', secondaryWeapon: 'X12 Pistol', lethal: 'Claymore', tactical: 'Smoke Grenade' },
    bio: "A lone wolf who excels at long-range engagements and reconnaissance.",
    preferredRole: 'Sniper',
  },
// FIX: Completed the stats object for player p006.
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
    rank: MOCK_RANKS[3].tiers[1], // Pro II (3301+ XP)
    status: 'Active',
    avatarUrl: 'https://cdn.pixabay.com/photo/2021/06/25/19/33/woman-6364433_1280.jpg',
    stats: { kills: 180, deaths: 65, headshots: 70, gamesPlayed: 22, xp: 3350 },
    badges: [MOCK_BADGES[0], MOCK_BADGES[2]],
    legendaryBadges: [],
    loadout: { primaryWeapon: 'Vector', secondaryWeapon: 'Glock 19', lethal: 'Throwing Knife', tactical: 'Stun Grenade' },
    bio: "Fast and aggressive, Valkyrie excels at flanking and overwhelming opponents with speed.",
    preferredRole: 'Assault',
  },
];

// FIX: Create and export MOCK_PLAYERS for use in AuthContext
export const MOCK_PLAYERS: Player[] = MOCK_PLAYERS_CORE.map(playerCore => ({
    ...playerCore,
    matchHistory: MOCK_ALL_MATCH_HISTORY.filter(mh => mh.playerId === playerCore.id),
    xpAdjustments: MOCK_ALL_XP_ADJUSTMENTS.filter(xa => xa.playerId === playerCore.id),
}));

// FIX: Create and export MOCK_ADMIN for use in AuthContext and DataContext
export const MOCK_ADMIN: Admin = {
    id: 'admin01',
    name: 'Admin',
    role: 'admin',
    email: 'bosjoltactical@gmail.com',
    clearanceLevel: 9,
    avatarUrl: 'https://img.icons8.com/ios-filled/100/charlie-chaplin.png',
};

// FIX: Create and export missing mock data constants
export const MOCK_VOUCHERS: Voucher[] = [
    { id: 'v01', code: 'LOYALTY50', discount: 50, type: 'fixed', description: 'R50 off for loyal players', status: 'Active', usageLimit: 10, redemptions: [] },
    { id: 'v02', code: 'NEWBIE10', discount: 10, type: 'percentage', description: '10% off for new players', status: 'Active', redemptions: [] },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't01', date: '2023-10-20T19:00:00Z', type: 'Event Revenue', description: 'Event Fee: Operation Kingslayer', amount: 350, relatedEventId: 'e000', relatedPlayerId: 'p001', paymentStatus: 'Paid (Card)'},
    { id: 't02', date: '2023-10-20T19:00:00Z', type: 'Rental Revenue', description: 'Rental: M4A1 Rental Package', amount: 250, relatedEventId: 'e000', relatedPlayerId: 'p001', paymentStatus: 'Paid (Card)'},
    { id: 't03', date: '2023-10-20T19:01:00Z', type: 'Event Revenue', description: 'Event Fee: Operation Kingslayer', amount: 350, relatedEventId: 'e000', relatedPlayerId: 'p002', paymentStatus: 'Paid (Cash)'},
];

export const MOCK_LOCATIONS: Location[] = [
    { id: 'loc01', name: 'Verdansk CQB Arena', description: 'Indoor CQB arena with multiple rooms and corridors.', address: '123 Fake St, Nelspruit', imageUrls: [], pinLocationUrl: 'https://maps.app.goo.gl/12345', contactInfo: { phone: '555-0001' } },
    { id: 'loc02', name: 'Al Mazrah Desert Outpost', description: 'Outdoor desert field with various structures.', address: '456 Another Rd, Nelspruit', imageUrls: [], pinLocationUrl: 'https://maps.app.goo.gl/67890', contactInfo: { phone: '555-0002' } },
    { id: 'loc03', name: 'Armory', description: 'Maintenance and storage facility.', address: '789 Base Rd, Nelspruit', imageUrls: [], pinLocationUrl: 'https://maps.app.goo.gl/abcde', contactInfo: {} },
];

export const MOCK_RAFFLES: Raffle[] = [
    { id: 'raf01', name: 'End of Year Gear Raffle', location: 'Verdansk CQB Arena', contactPhone: '555-0100', prizes: [{id: 'prz01', name: 'Brand New M4A1', place: 1}], drawDate: '2023-12-20T18:00:00Z', status: 'Completed', createdAt: '2023-11-01T10:00:00Z', tickets: [], winners: [] },
];

export const MOCK_SPONSORS: Sponsor[] = [
    { id: 'spn01', name: 'Tactical Coffee', logoUrl: 'https://img.icons8.com/color/96/coffee-to-go.png', website: 'https://example.com' },
    { id: 'spn02', name: 'Operator Gear', logoUrl: 'https://img.icons8.com/color/96/tactical-helmet.png', website: 'https://example.com' },
];

export const MOCK_SOCIAL_LINKS: SocialLink[] = [
    { id: 'soc01', name: 'Facebook', url: 'https://facebook.com', iconUrl: 'https://img.icons8.com/color/48/facebook-new.png' },
    { id: 'soc02', name: 'Instagram', url: 'https://instagram.com', iconUrl: 'https://img.icons8.com/color/48/instagram-new--v1.png' },
];

export const MOCK_CAROUSEL_MEDIA: CarouselMedia[] = [
    { id: 'car01', type: 'image', url: 'https://images.pexels.com/photos/163822/soldier-airsoft-gun-weapon-163822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
];

export const MOCK_API_GUIDE: ApiGuideStep[] = [
    {
        id: 'step1',
        title: 'Introduction & Goal',
        content: 'This guide provides the necessary code to run a self-hosted API server for serving all application data and handling file uploads. This completely replaces the client-side Firebase connection, offering greater security, scalability, and the ability to handle large file uploads (like videos) that exceed Firestore\'s 1MB document limit. The server is built with Node.js and Express.',
    },
    {
        id: 'step2',
        title: 'Prerequisites & Setup',
        content: 'You will need [Node.js](https://nodejs.org/) installed on your server or local machine. Create a new folder for your server, and inside it, create a file named `package.json` with the following content. Then, run `npm install` in your terminal to install the required dependencies.',
        codeBlock: `{
  "name": "bosjol-tactical-api",
  "version": "1.0.0",
  "description": "API server for the Bosjol Tactical Dashboard.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1"
  }
}`,
        codeLanguage: 'json',
        fileName: 'package.json'
    },
    {
        id: 'step3',
        title: 'The Database File',
        content: 'This server uses a simple JSON file as its database. Create a file named `db.json` in the same folder. This file should contain all your application data, structured by collection name. You can generate this file using the "Download Backup" button in the Settings tab to get a correctly formatted starting point.',
        codeBlock: `{
  "players": [],
  "events": [],
  "ranks": [],
  "badges": [],
  "legendaryBadges": [],
  "gamificationSettings": [],
  "inventory": [],
  "signups": [],
  "transactions": [],
  "locations": [],
  "suppliers": [],
  "vouchers": [],
  "raffles": [],
  "sponsors": [],
  "socialLinks": [],
  "carouselMedia": [],
  "apiSetupGuide": [],
  "settings": {
    "companyDetails": {},
    "brandingDetails": {},
    "contentDetails": {},
    "creatorDetails": {}
  }
}`,
        codeLanguage: 'json',
        fileName: 'db.json'
    },
    {
        id: 'step4',
        title: 'The Server Code',
        content: 'Create a file named `server.js`. This code sets up an Express server with generic endpoints to read and write to your `db.json` file, and manage file uploads to a local `uploads/` directory.',
        codeBlock: `const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_DIR = 'uploads';

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, UPLOADS_DIR)));

// --- File Upload Setup (Multer) ---
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, UPLOADS_DIR);
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- Helper Functions ---
const readDb = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    throw new Error('Could not read database.');
  }
};

const writeDb = async (data) => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database:", error);
    throw new Error('Could not write to database.');
  }
};

// --- API Endpoints ---

// Health check
app.get('/health', (req, res) => res.status(200).send({ status: 'ok' }));

// File upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }
  const fileUrl = \`\${req.protocol}://\${req.get('host')}/\${UPLOADS_DIR}/\${req.file.filename}\`;
  res.status(200).send({ url: fileUrl });
});

// Get all data combined
app.get('/api/all-data', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generic GET all for a collection
app.get('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    const db = await readDb();
    if (db.hasOwnProperty(collection)) {
      res.json(db[collection]);
    } else {
      res.status(404).json({ message: \`Collection '\${collection}' not found.\` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generic POST to a collection
app.post('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  const newItem = { id: uuidv4(), ...req.body };
  try {
    const db = await readDb();
    if (db.hasOwnProperty(collection) && Array.isArray(db[collection])) {
      db[collection].push(newItem);
      await writeDb(db);
      res.status(201).json(newItem);
    } else {
      res.status(404).json({ message: \`Collection '\${collection}' not found or is not an array.\` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generic PUT to a document in a collection
app.put('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  const updatedData = req.body;
  try {
    const db = await readDb();
    if (db.hasOwnProperty(collection) && Array.isArray(db[collection])) {
      const index = db[collection].findIndex(item => item.id === id);
      if (index > -1) {
        db[collection][index] = { ...db[collection][index], ...updatedData, id }; // Ensure ID is preserved
        await writeDb(db);
        res.json(db[collection][index]);
      } else {
        res.status(404).json({ message: \`Document with id '\${id}' not found in '\${collection}'.\` });
      }
    } else {
      res.status(404).json({ message: \`Collection '\${collection}' not found or is not an array.\` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generic DELETE from a collection
app.delete('/api/:collection/:id', async (req, res) => {
    const { collection, id } = req.params;
    try {
        const db = await readDb();
        if (db.hasOwnProperty(collection) && Array.isArray(db[collection])) {
            const initialLength = db[collection].length;
            db[collection] = db[collection].filter(item => item.id !== id);
            if (db[collection].length < initialLength) {
                await writeDb(db);
                res.status(204).send();
            } else {
                res.status(404).json({ message: \`Document with id '\${id}' not found in '\${collection}'.\` });
            }
        } else {
            res.status(404).json({ message: \`Collection '\${collection}' not found or is not an array.\` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(\`Bosjol Tactical API server running on http://localhost:\${PORT}\`);
});`,
        codeLanguage: 'javascript',
        fileName: 'server.js'
    },
    {
        id: 'step5',
        title: 'Running the Server',
        content: 'Open your terminal in the server folder and run the start command. Your API is now running!',
        codeBlock: 'npm start',
        codeLanguage: 'bash'
    },
     {
        id: 'step6',
        title: 'Connecting the Frontend',
        content: 'In the Admin Settings, go to "App & Content Settings" and set the "API Server URL" to the address of your running server (e.g., `http://localhost:3001`). The application will now use this server for all data and file uploads, bypassing Firebase and database storage limits.',
    }
];

export const MOCK_COMPANY_CORE = { name: 'Bosjol Tactical', address: 'Nelspruit, SA', phone: '123-456-7890', email: 'bosjoltactical@gmail.com', website: 'https://example.com', regNumber: '123/456', vatNumber: '7890123', apiServerUrl: '', bankInfo: { bankName: 'FNB', accountNumber: '12345', routingNumber: '67890' }, minimumSignupAge: 16 };
export const MOCK_BRANDING_DETAILS = { logoUrl: 'https://i.ibb.co/HL2Lc6Rz/file-0000000043b061f7b655a0077343e063.png', loginBackgroundUrl: 'https://www.toptal.com/designers/subtlepatterns/uploads/dark-geometric.png', loginAudioUrl: '', playerDashboardBackgroundUrl: '', adminDashboardBackgroundUrl: '', playerDashboardAudioUrl: '', adminDashboardAudioUrl: '' };
export const MOCK_CONTENT_DETAILS = { fixedEventRules: 'Standard rules apply.', apkUrl: '' };

export const MOCK_CREATOR_CORE: CreatorDetails = { id: 'creator', name: 'JSTYP.me', email: 'jstypme@gmail.com', whatsapp: '+27725213550', tagline: 'Code. Create. Conquer.', bio: 'Full-stack developer...', logoUrl: 'https://i.ibb.co/0phm4WGq/image-removebg-preview.png', githubUrl: 'https://github.com/JSTYP/bosjol-tactical-dashboard' };