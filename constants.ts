

// FIX: Import `PlayerStats` to resolve TypeScript error on line 516.
import type { Player, PlayerCore, Admin, GameEvent, EventCore, Briefing, GamificationSettings, Badge, Sponsor, CompanyDetails, MatchRecord, Loadout, PlayerRole, InventoryItem, Voucher, Supplier, Transaction, Location, LegendaryBadge, Raffle, EventStatus, EventType, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, Tier, ApiGuideStep, MatchHistoryDoc, XpAdjustmentDoc, AttendeeDoc, RaffleCore, RaffleTicketDoc, RaffleWinnerDoc, VoucherCore, VoucherRedemption, PlayerStats, InventoryCategory, InventoryCondition } from './types';

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
    perks: ["Base operator status"],
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
      { id: "e_v", name: "Elite V", minXp: 2801, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Rank-military-smashingstocks-glyph-smashing-stocks-3.png" }
    ]
  },
  {
    id: "rank_pro",
    name: "Pro",
    description: "Top-tier players who demonstrate professional-level skill.",
    rankBadgeUrl: "https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/external-shield-achievements-and-badges-flatart-icons-solid-flatarticons.png",
    tiers: [
      { id: "p_i", name: "Pro I", minXp: 3001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/external-photo3ideastudio-solid-photo3ideastudio/64/external-rank-military-photo3ideastudio-solid-photo3ideastudio.png" },
      { id: "p_ii", name: "Pro II", minXp: 3201, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-photo3ideastudio-solid-photo3ideastudio/64/external-rank-military-photo3ideastudio-solid-photo3ideastudio.png" },
      { id: "p_iii", name: "Pro III", minXp: 3401, perks: ["Custom Calling Card"], iconUrl: "https://img.icons8.com/external-photo3ideastudio-solid-photo3ideastudio/64/external-rank-military-photo3ideastudio-solid-photo3ideastudio.png" },
      { id: "p_iv", name: "Pro IV", minXp: 3601, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/external-photo3ideastudio-solid-photo3ideastudio/64/external-rank-military-photo3ideastudio-solid-photo3ideastudio.png" },
      { id: "p_v", name: "Pro V", minXp: 3801, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/external-photo3ideastudio-solid-photo3ideastudio/64/external-rank-military-photo3ideastudio-solid-photo3ideastudio.png" }
    ]
  },
  {
    id: "rank_master",
    name: "Master",
    description: "Among the best in the league, showing consistent high-level performance.",
    rankBadgeUrl: "https://img.icons8.com/color/96/military-medal-1.png",
    tiers: [
      { id: "m_i", name: "Master I", minXp: 4001, perks: ["Weapon XP Card"], iconUrl: "https://img.icons8.com/fluency/48/insignia-1.png" },
      { id: "m_ii", name: "Master II", minXp: 4201, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/fluency/48/insignia-1.png" },
      { id: "m_iii", name: "Master III", minXp: 4401, perks: ["Custom Calling Card"], iconUrl: "https://img.icons8.com/fluency/48/insignia-1.png" },
      { id: "m_iv", name: "Master IV", minXp: 4601, perks: ["Credits Reward"], iconUrl: "https://img.icons8.com/fluency/48/insignia-1.png" },
      { id: "m_v", name: "Master V", minXp: 4801, perks: ["Exclusive Skin"], iconUrl: "https://img.icons8.com/fluency/48/insignia-1.png" }
    ]
  },
  {
    id: "rank_legend",
    name: "Legendary",
    description: "The pinnacle of tactical operators. Legendary status is the highest honor.",
    rankBadgeUrl: "https://img.icons8.com/color/96/insignia-2.png",
    tiers: [
      { id: "l_i", name: "Legendary", minXp: 5001, perks: ["Prestige Calling Card", "Credits Reward", "Legendary Skin"], iconUrl: "https://img.icons8.com/fluency/48/insignia-2.png" }
    ]
  }
];

export const MOCK_ADMIN: Admin = {
  id: 'admin01',
  name: 'John "Bravo-6" Price',
  role: 'admin',
  email: 'bosjoltactical@gmail.com',
  clearanceLevel: 1,
  avatarUrl: 'https://i.ibb.co/LQr4T2K/image-removebg-preview-1.png',
};

export const MOCK_PLAYER_ROLES: PlayerRole[] = ['Assault', 'Recon', 'Support', 'Sniper'];

// FIX: Export constants for use in components
export const MOCK_EVENT_THEMES = ['Night Ops', 'Close Quarters', 'Milsim', 'Skirmish'];
export const EVENT_TYPES: EventType[] = ['Training', 'Mission', 'Briefing', 'Maintenance'];
export const EVENT_STATUSES: EventStatus[] = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];

export const MOCK_WEAPONS = {
    primary: [ 'M4A1 Assault Rifle', 'AK-47', 'SCAR-H', 'M16A4', 'G36C' ],
    secondary: [ 'X12 Pistol', 'Glock 17', '1911', '.357 Magnum', 'Desert Eagle' ]
};

export const MOCK_EQUIPMENT = {
    lethal: [ 'Frag Grenade', 'Semtex', 'Claymore', 'Throwing Knife' ],
    tactical: [ 'Flashbang', 'Smoke Grenade', 'Stun Grenade', 'Heartbeat Sensor' ]
};

// --- START: Core Player data (no sub-collections) ---
const MOCK_PLAYERS_CORE: PlayerCore[] = [
    {
        id: 'p001', name: 'Jason', surname: 'McTavish', playerCode: 'JM01', email: 'soap@sas.com', phone: '+27821234567', pin: '123456', age: 28, idNumber: '9601015000080',
        role: 'player', callsign: 'Soap', rank: MOCK_RANKS[0].tiers[0], status: 'Active',
        avatarUrl: 'https://i.ibb.co/b3wVz6S/image-removebg-preview.png',
        stats: { kills: 120, deaths: 95, headshots: 30, gamesPlayed: 8, xp: 150 },
        badges: [], legendaryBadges: [], loadout: { primaryWeapon: 'M4A1 Assault Rifle', secondaryWeapon: 'X12 Pistol', lethal: 'Frag Grenade', tactical: 'Flashbang' }, bio: "Veteran SAS operator. Prefers close-quarters combat."
    },
    {
        id: 'p002', name: 'Simon', surname: 'Riley', playerCode: 'SR01', email: 'ghost@sas.com', phone: '+27827654321', pin: '123456', age: 32, idNumber: '9202025100081',
        role: 'player', callsign: 'Ghost', rank: MOCK_RANKS[1].tiers[2], status: 'Active',
        avatarUrl: 'https://i.ibb.co/h7nqk0z/image-removebg-preview-1.png',
        stats: { kills: 250, deaths: 110, headshots: 80, gamesPlayed: 28, xp: 1500 },
        badges: [MOCK_BADGES[0], MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [MOCK_LEGENDARY_BADGES[2]], loadout: { primaryWeapon: 'SCAR-H', secondaryWeapon: '1911', lethal: 'Semtex', tactical: 'Smoke Grenade' }, bio: "Stealth and reconnaissance specialist. Never seen, always felt."
    },
    {
        id: 'p003', name: 'Kyle', surname: 'Garrick', playerCode: 'KG01', email: 'gaz@sas.com', phone: '+27831234567', pin: '123456', age: 29, idNumber: '9503035200082',
        role: 'player', callsign: 'Gaz', rank: MOCK_RANKS[2].tiers[0], status: 'Active',
        avatarUrl: 'https://i.ibb.co/x7RqrkY/image-removebg-preview-3.png',
        stats: { kills: 310, deaths: 150, headshots: 95, gamesPlayed: 35, xp: 2050 },
        badges: [MOCK_BADGES[0], MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [MOCK_LEGENDARY_BADGES[1]], loadout: { primaryWeapon: 'M16A4', secondaryWeapon: '.357 Magnum', lethal: 'Claymore', tactical: 'Stun Grenade' }, bio: "Tactical expert, proficient in all combat scenarios."
    },
     {
        id: 'p004', name: 'Farah', surname: 'Karim', playerCode: 'FK01', email: 'farah@ulf.com', phone: '+27841234567', pin: '123456', age: 30, idNumber: '9404045300083',
        role: 'player', callsign: 'Liberator', rank: MOCK_RANKS[3].tiers[4], status: 'Active',
        avatarUrl: 'https://i.ibb.co/f4pY4s4/image-removebg-preview-4.png',
        stats: { kills: 450, deaths: 180, headshots: 150, gamesPlayed: 52, xp: 3900 },
        badges: [MOCK_BADGES[0], MOCK_BADGES[1], MOCK_BADGES[2]], legendaryBadges: [MOCK_LEGENDARY_BADGES[0]], loadout: { primaryWeapon: 'AK-47', secondaryWeapon: 'Desert Eagle', lethal: 'Throwing Knife', tactical: 'Heartbeat Sensor' }, bio: "Commander of the Urzikstan Liberation Force. Fearless leader."
    }
];

const MOCK_MATCH_HISTORY: MatchHistoryDoc[] = [
    { id: 'mh01', playerId: 'p001', eventId: 'ev004', playerStats: { kills: 15, deaths: 10, headshots: 4 }},
    { id: 'mh02', playerId: 'p001', eventId: 'ev005', playerStats: { kills: 12, deaths: 8, headshots: 2 }},
    { id: 'mh03', playerId: 'p002', eventId: 'ev004', playerStats: { kills: 22, deaths: 5, headshots: 10 }},
    { id: 'mh04', playerId: 'p003', eventId: 'ev004', playerStats: { kills: 18, deaths: 7, headshots: 8 }},
    { id: 'mh05', playerId: 'p004', eventId: 'ev005', playerStats: { kills: 25, deaths: 4, headshots: 12 }},
];

const MOCK_XP_ADJUSTMENTS: XpAdjustmentDoc[] = [
    { id: 'xpa01', playerId: 'p001', amount: 50, reason: "Bonus for excellent sportsmanship", date: '2025-01-15T12:00:00Z' },
    { id: 'xpa02', playerId: 'p002', amount: -25, reason: "Penalty for safety violation", date: '2025-02-20T14:30:00Z' }
];

export const MOCK_PLAYERS: Player[] = MOCK_PLAYERS_CORE.map(core => ({
    ...core,
    matchHistory: MOCK_MATCH_HISTORY.filter(mh => mh.playerId === core.id),
    xpAdjustments: MOCK_XP_ADJUSTMENTS.filter(xpa => xpa.playerId === core.id),
}));
// --- END: Player data ---


export const MOCK_EVENTS_CORE: EventCore[] = [
    {
        id: 'ev001', title: 'Operation Nightfall', type: 'Mission', date: '2025-08-15', startTime: '19:00',
        location: 'Abandoned Warehouse', description: 'Infiltrate and secure the objective under the cover of darkness.',
        theme: 'Night Ops', rules: 'Standard hit rules apply. NVGs recommended.', participationXp: 100,
        status: 'Upcoming', imageUrl: 'https://i.ibb.co/3k5fV82/image.png',
        gameFee: 150, gearForRent: ['inv001', 'inv002', 'inv005']
    },
    {
        id: 'ev002', title: 'CQB Training', type: 'Training', date: '2025-08-22', startTime: '10:00',
        location: 'The Killhouse', description: 'Hone your close-quarters battle skills in a fast-paced environment.',
        theme: 'Close Quarters', rules: 'Semi-auto only. No MED.', participationXp: 50,
        status: 'Upcoming', imageUrl: 'https://i.ibb.co/B285bKq/image.png',
        gameFee: 100, gearForRent: ['inv003', 'inv004']
    },
     {
        id: 'ev003', title: 'Operation Red Dawn', type: 'Mission', date: '2025-09-05', startTime: '09:00',
        location: 'The Forest', description: 'A large-scale milsim event with multiple objectives.',
        theme: 'Milsim', rules: 'Milsim ruleset applies. Radios required.', participationXp: 200,
        status: 'Upcoming', imageUrl: 'https://i.ibb.co/YyVqL0r/image.png',
        gameFee: 250, gearForRent: ['inv001', 'inv002', 'inv003', 'inv004', 'inv005'],
        eventBadges: ['leg01', 'leg02']
    },
    {
        id: 'ev004', title: 'Team Deathmatch Skirmish', type: 'Mission', date: '2025-07-20', startTime: '11:00',
        location: 'The Scrapyard', description: 'Classic TDM. First team to 100 points wins.',
        theme: 'Skirmish', rules: 'Standard hit rules. Infinite respawns.', participationXp: 75,
        status: 'Completed', imageUrl: 'https://i.ibb.co/f4n7xfr/image.png',
        gameFee: 120, gearForRent: ['inv001']
    },
    {
        id: 'ev005', title: 'Pistol & Shotgun Only', type: 'Mission', date: '2025-07-13', startTime: '11:00',
        location: 'The Killhouse', description: 'Fast-paced action with limited weapon types.',
        theme: 'Close Quarters', rules: 'Only pistols and shotguns allowed.', participationXp: 75,
        status: 'Completed', imageUrl: 'https://i.ibb.co/B285bKq/image.png',
        gameFee: 100, gearForRent: ['inv003', 'inv004']
    },
];

export const MOCK_ATTENDEES: AttendeeDoc[] = [
    { id: 'p001', eventId: 'ev004', playerId: 'p001', paymentStatus: 'Paid (Card)'},
    { id: 'p002', eventId: 'ev004', playerId: 'p002', paymentStatus: 'Paid (Cash)'},
    { id: 'p003', eventId: 'ev004', playerId: 'p003', paymentStatus: 'Unpaid'},
    { id: 'p001', eventId: 'ev005', playerId: 'p001', paymentStatus: 'Paid (Card)'},
    { id: 'p004', eventId: 'ev005', playerId: 'p004', paymentStatus: 'Paid (Card)'},
];

export const MOCK_EVENTS: GameEvent[] = MOCK_EVENTS_CORE.map(core => ({
    ...core,
    attendees: MOCK_ATTENDEES.filter(a => a.eventId === core.id),
    liveStats: {} // Default empty
}));

export const MOCK_SIGNUPS: Signup[] = [
    { id: 'ev001_p001', eventId: 'ev001', playerId: 'p001', requestedGearIds: ['inv001']},
    { id: 'ev001_p002', eventId: 'ev001', playerId: 'p002', requestedGearIds: ['inv002', 'inv005']},
    { id: 'ev002_p003', eventId: 'ev002', playerId: 'p003', requestedGearIds: []},
];

export const MOCK_VOUCHERS_CORE: VoucherCore[] = [
    { id: 'v001', code: 'NEWBIE10', discount: 10, type: 'percentage', description: '10% off for new players', status: 'Active', usageLimit: 100, perUserLimit: 1},
    { id: 'v002', code: 'BRAVO50', discount: 50, type: 'fixed', description: 'R50 off for Bravo team members', status: 'Active', usageLimit: 20 },
];

export const MOCK_VOUCHER_REDEMPTIONS: VoucherRedemption[] = [];
export const MOCK_VOUCHERS: Voucher[] = MOCK_VOUCHERS_CORE.map(core => ({...core, redemptions: []}));

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv001', name: 'M4A1 Raider', description: 'Standard issue M4A1 rifle.', salePrice: 200, stock: 10, type: 'Weapon', isRental: true, category: 'AEG Rifle', condition: 'Used' },
    { id: 'inv002', name: 'AK-74U Spetsnaz', description: 'Compact AK variant for CQB.', salePrice: 200, stock: 5, type: 'Weapon', isRental: true, category: 'AEG Rifle', condition: 'Used' },
    { id: 'inv003', name: 'Glock 17', description: 'Reliable sidearm.', salePrice: 100, stock: 15, type: 'Weapon', isRental: true, category: 'Sidearm', condition: 'New' },
    { id: 'inv004', name: 'Benelli M4', description: 'Semi-auto shotgun.', salePrice: 250, stock: 3, type: 'Weapon', isRental: true, category: 'Other', condition: 'Needs Inspection' },
    { id: 'inv005', name: 'Tactical Vest', description: 'Holds magazines and gear.', salePrice: 150, stock: 20, type: 'Gear', isRental: true, category: 'Tactical Gear', condition: 'Used' },
    { id: 'inv006', name: '0.25g BBs (Bag)', description: 'Approx 4000 rounds.', salePrice: 180, stock: 50, type: 'Consumable', isRental: false, category: 'Consumables', condition: 'New' },
];

// FIX: Export constants for use in components
export const INVENTORY_CATEGORIES: InventoryCategory[] = ['AEG Rifle', 'GBB Rifle', 'Sniper Rifle', 'Sidearm', 'SMG', 'Tactical Gear', 'Attachments', 'Consumables', 'Other'];
export const INVENTORY_CONDITIONS: InventoryCondition[] = ['New', 'Used', 'Needs Repair', 'Needs Inspection'];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup001', name: 'Tactical Edge', email: 'sales@tacticaledge.co.za', website: 'https://tacticaledge.co.za' },
    { id: 'sup002', name: 'Airsoft HQ', email: 'info@airsofthq.co.za', website: 'https://airsofthq.co.za' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn001', date: '2025-07-20', type: 'Event Revenue', description: 'Event Fee: TDM Skirmish', amount: 120, relatedEventId: 'ev004', relatedPlayerId: 'p001', paymentStatus: 'Paid (Card)' },
    { id: 'txn002', date: '2025-07-20', type: 'Event Revenue', description: 'Event Fee: TDM Skirmish', amount: 120, relatedEventId: 'ev004', relatedPlayerId: 'p002', paymentStatus: 'Paid (Cash)' },
    { id: 'txn003', date: '2025-07-13', type: 'Event Revenue', description: 'Event Fee: Pistol Only', amount: 100, relatedEventId: 'ev005', relatedPlayerId: 'p001', paymentStatus: 'Paid (Card)' },
    { id: 'txn004', date: '2025-07-13', type: 'Rental Revenue', description: 'Rental: Glock 17', amount: 100, relatedEventId: 'ev005', relatedPlayerId: 'p004', relatedInventoryId: 'inv003', paymentStatus: 'Paid (Card)' },
    { id: 'txn005', date: '2025-07-10', type: 'Expense', description: 'Restock of 0.25g BBs', amount: 2500, relatedInventoryId: 'inv006' },
];

export const MOCK_LOCATIONS: Location[] = [
    // FIX: Add missing 'contactInfo' property to satisfy the Location type.
    { id: 'loc001', name: 'Abandoned Warehouse', description: 'Large industrial site with multiple levels.', address: '123 Industrial Rd, Nelspruit', imageUrls: [], pinLocationUrl: 'https://maps.app.goo.gl/abandoned', contactInfo: {} },
    // FIX: Add missing 'contactInfo' property to satisfy the Location type.
    { id: 'loc002', name: 'The Killhouse', description: 'Indoor CQB arena.', address: '456 Commercial St, Nelspruit', imageUrls: [], pinLocationUrl: 'https://maps.app.goo.gl/killhouse', contactInfo: {} },
];

export const MOCK_RAFFLES_CORE: RaffleCore[] = [
    { id: 'raf001', name: 'July Gear Giveaway', location: 'Online', contactPhone: '+27821234567', prizes: [{id: 'prz01', name: 'M4A1 Raider AEG', place: 1}], drawDate: '2025-07-31T12:00:00Z', status: 'Completed', createdAt: '2025-07-01T10:00:00Z' }
];

export const MOCK_RAFFLE_TICKETS: RaffleTicketDoc[] = [
    { id: 'tkt001', raffleId: 'raf001', code: 'RAF01-ABCD', playerId: 'p001', purchaseDate: '2025-07-15T10:00:00Z', paymentStatus: 'Paid (Card)' },
    { id: 'tkt002', raffleId: 'raf001', code: 'RAF01-EFGH', playerId: 'p002', purchaseDate: '2025-07-16T11:00:00Z', paymentStatus: 'Paid (Card)' }
];
export const MOCK_RAFFLE_WINNERS: RaffleWinnerDoc[] = [
    { id: 'win001', raffleId: 'raf001', prizeId: 'prz01', ticketId: 'tkt002', playerId: 'p002' }
];
export const MOCK_RAFFLES: Raffle[] = MOCK_RAFFLES_CORE.map(core => ({
    ...core,
    tickets: MOCK_RAFFLE_TICKETS.filter(t => t.raffleId === core.id),
    winners: MOCK_RAFFLE_WINNERS.filter(w => w.raffleId === core.id),
}));


export const MOCK_GAMIFICATION_SETTINGS: GamificationSettings = [
    { id: 'g_kill', name: 'Standard Kill', description: 'XP awarded for a standard elimination.', xp: 10 },
    { id: 'g_headshot', name: 'Headshot', description: 'Bonus XP for a headshot elimination.', xp: 5 },
    { id: 'g_death', name: 'Death', description: 'XP deducted upon being eliminated.', xp: -2 },
    { id: 'g_objective', name: 'Objective Captured', description: 'XP for capturing a primary objective.', xp: 50 },
    { id: 'g_no_show_penalty', name: 'No-Show Penalty', description: 'XP deducted for signing up but not attending an event.', xp: -50 },
];

export const MOCK_SPONSORS: Sponsor[] = [
    { id: 'sp001', name: 'Valken', logoUrl: 'https://i.ibb.co/L6TySzL/image.png', website: 'https://valken.com' },
    { id: 'sp002', name: 'Lancer Tactical', logoUrl: 'https://i.ibb.co/hLkTb1d/image.png', website: 'https://lancertactical.com' },
    { id: 'sp003', name: 'Evike.com', logoUrl: 'https://i.ibb.co/9hM2FzK/image.png', website: 'https://evike.com' },
    { id: 'sp004', name: 'G&G Armament', logoUrl: 'https://i.ibb.co/bF9gqGH/image.png', website: 'https://guay2.com' },
];

export const MOCK_SOCIAL_LINKS: SocialLink[] = [
    { id: 'soc01', name: 'Facebook', url: 'https://facebook.com', iconUrl: 'https://img.icons8.com/fluent/48/000000/facebook-new.png' },
    { id: 'soc02', name: 'Instagram', url: 'https://instagram.com', iconUrl: 'https://img.icons8.com/fluent/48/000000/instagram-new.png' },
    { id: 'soc03', name: 'WhatsApp', url: 'https://wa.me/27821234567', iconUrl: 'https://img.icons8.com/color/48/000000/whatsapp.png' },
];

export const MOCK_CAROUSEL_MEDIA: CarouselMedia[] = [
    { id: 'car01', type: 'image', url: 'https://i.ibb.co/3k5fV82/image.png' },
    { id: 'car02', type: 'image', url: 'https://i.ibb.co/B285bKq/image.png' },
    { id: 'car03', type: 'image', url: 'https://i.ibb.co/YyVqL0r/image.png' },
];

// Split up CompanyDetails for easier management in DataContext
export const MOCK_COMPANY_CORE: Pick<CompanyDetails, 'name' | 'address' | 'phone' | 'email' | 'website' | 'regNumber' | 'vatNumber' | 'apiServerUrl' | 'bankInfo' | 'minimumSignupAge' | 'nextRankResetDate'> = {
    name: 'Bosjol Tactical',
    address: 'Nelspruit, South Africa',
    phone: '+27821234567',
    email: 'bosjoltactical@gmail.com',
    website: 'https://jstyp.me',
    regNumber: '2025/123456/07',
    vatNumber: '1234567890',
    apiServerUrl: '',
    bankInfo: { bankName: 'FNB', accountNumber: '62012345678', routingNumber: '250655' },
    minimumSignupAge: 16,
    nextRankResetDate: '',
};

export const MOCK_BRANDING_DETAILS: Pick<CompanyDetails, 'logoUrl' | 'loginBackgroundUrl' | 'loginAudioUrl' | 'playerDashboardBackgroundUrl' | 'adminDashboardBackgroundUrl' | 'playerDashboardAudioUrl' | 'adminDashboardAudioUrl'> = {
    logoUrl: 'https://i.ibb.co/7k1pWpY/Bosjol-Tactical-Logo-White-Red.png',
    loginBackgroundUrl: 'https://i.ibb.co/dsh2c2hp/unnamed.jpg',
    loginAudioUrl: '',
    playerDashboardBackgroundUrl: 'https://i.ibb.co/C5fBF6p/image.png',
    playerDashboardAudioUrl: '',
    adminDashboardBackgroundUrl: 'https://i.ibb.co/bJxtzYw/image.png',
    adminDashboardAudioUrl: '',
};

export const MOCK_CONTENT_DETAILS: Pick<CompanyDetails, 'fixedEventRules' | 'apkUrl'> = {
    fixedEventRules: `1. Minimum age is 16. ID required on first visit.\n2. Full-face protection mandatory for all players.\n3. All personal equipment must be chronographed before play.\n4. No blind firing. You must see your target.\n5. Observe Minimum Engagement Distances (MEDs).\n6. Call your hits. Cheating will not be tolerated.`,
    apkUrl: 'https://github.com/JSTYP/bosjol-tactical-dashboard/raw/main/BosjolTactical.apk',
};

export const MOCK_COMPANY_DETAILS: CompanyDetails = {
    ...MOCK_COMPANY_CORE,
    ...MOCK_BRANDING_DETAILS,
    ...MOCK_CONTENT_DETAILS,
};

export const MOCK_CREATOR_CORE: CreatorDetails = {
    id: 'creator01',
    name: 'JSTYP.me',
    email: 'jstypme@gmail.com',
    whatsapp: '+27645199692',
    tagline: "If you can think it, I can build it.",
    bio: "Full-stack developer specializing in bespoke web applications and system integrations. Turning complex problems into elegant, efficient solutions.",
    logoUrl: 'https://i.ibb.co/2SL25hV/Black-and-White-Bold-Minimalist-Interlocking-Monogram-Logo-1-removebg-preview.png',
    githubUrl: 'https://github.com/JSTYP/bosjol-tactical-dashboard',
    sourceCodeZipUrl: 'https://github.com/JSTYP/bosjol-tactical-dashboard/raw/main/api-server-template.zip',
};

export const MOCK_API_GUIDE: ApiGuideStep[] = [
    {
      id: "step_1",
      title: "Introduction & Purpose",
      content: "This guide explains how to set up an optional, self-hosted file server. The default Firebase setup limits file sizes to ~500KB. This server bypasses that limit, allowing large files like videos or audio briefings. It also adds a layer of security by handling all database interactions, instead of the client connecting directly to Firebase."
    },
    {
      id: "step_2",
      title: "Prerequisites",
      content: "You'll need `Node.js` and `npm` installed on the machine that will act as your server. You can download them from [the official Node.js website](https://nodejs.org/)."
    },
    {
      id: "step_3",
      title: "Download & Unzip Server Files",
      content: "Download the pre-configured server files using the button in the 'API Setup' tab on the Admin Dashboard. Unzip the file into a new folder on your server machine."
    },
    {
      id: "step_4",
      title: "Install Dependencies",
      content: "Open a terminal or command prompt, navigate into the unzipped folder, and run the following command to install the required packages:",
      // FIX: Corrected object property syntax.
      codeBlock: "npm install",
      codeLanguage: "bash"
    },
    {
        id: "step_5",
        title: "Get Firebase Service Account Key",
        content: "1. Go to your [Firebase Console](https://console.firebase.google.com/).\n2. Select your project, go to Project Settings (gear icon) -> Service accounts.\n3. Click 'Generate new private key' and save the downloaded JSON file.\n4. **Crucially, rename this file to `service-account-key.json` and place it inside your server folder.**"
    },
    {
        id: "step_6",
        title: "Configure Environment Variables",
        content: "Create a new file named `.env` in your server folder and add the following line, replacing the value with your Firebase Project ID:",
        // FIX: Corrected object property syntax.
        codeBlock: "FIREBASE_PROJECT_ID=your-firebase-project-id",
        codeLanguage: "bash",
        fileName: ".env"
    },
    {
      id: "step_7",
      title: "Run the Server",
      content: "Start the server with `node server.js`. It will run on port 3001 by default. You should see a message confirming it's running."
    },
    {
        id: "step_8",
        title: "Update Dashboard Settings",
        content: "In the Admin Dashboard under Settings -> App & Content, set the 'API Server URL' to the address of your server (e.g., `http://localhost:3001` for local testing, or your public URL). The app will now use your server for file uploads."
    }
];

export const MOCK_CREATOR_DETAILS: CreatorDetails & { apiSetupGuide: ApiGuideStep[] } = {
    ...MOCK_CREATOR_CORE,
    apiSetupGuide: MOCK_API_GUIDE,
};