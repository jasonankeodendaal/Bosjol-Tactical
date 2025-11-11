import { IconProps } from "@phosphor-icons/react";

export type Role = 'player' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  headshots: number;
  gamesPlayed: number;
  xp: number; // Internally this is rank points
}

export interface Badge {
  id:string;
  name: string;
  description: string;
  iconUrl: string;
  criteria: {
      type: 'kills' | 'headshots' | 'gamesPlayed' | 'custom' | 'rank';
      value: number | string;
  }
}

export interface LegendaryBadge {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    howToObtain: string;
}

export interface MatchRecord {
    eventId: string;
    playerStats: {
        kills: number;
        deaths: number;
        headshots: number;
    }
}

export interface XpAdjustment {
    amount: number;
    reason: string;
    date: string;
}

export interface Loadout {
    primaryWeapon: string;
    secondaryWeapon: string;

    lethal: string;
    tactical: string;
}

export type PlayerRole = 'Assault' | 'Recon' | 'Support' | 'Sniper';

export interface Player extends User {
  role: 'player';
  callsign: string;
  rank: Rank;
  status: 'Active' | 'On Leave' | 'Retired';
  avatarUrl: string;
  stats: PlayerStats;
  matchHistory: MatchRecord[];
  xpAdjustments: XpAdjustment[];
  badges: Badge[];
  legendaryBadges: LegendaryBadge[];
  loadout: Loadout;
  // New detailed fields
  playerCode: string;
  surname: string;
  email: string;
  phone: string;
  pin: string;
  address?: string;
  allergies?: string;
  medicalNotes?: string;
  bio?: string;
  preferredRole?: PlayerRole;
}

export interface Admin extends User {
  role: 'admin';
  clearanceLevel: number;
  avatarUrl: string;
}

export interface AuthContextType {
  user: User | Player | Admin | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User | Player | Admin) => void; 
}

export type EventType = 'Training' | 'Mission' | 'Briefing' | 'Maintenance';
export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid (Card)' | 'Paid (Cash)' | 'Unpaid';

export interface EventAttendee {
    playerId: string;
    paymentStatus: PaymentStatus;
    voucherCode?: string;
    rentedGearIds?: string[];
    note?: string;
    discountAmount?: number;
    discountReason?: string;
}

export type InventoryCategory = 'AEG Rifle' | 'GBB Rifle' | 'Sniper Rifle' | 'Sidearm' | 'SMG' | 'Tactical Gear' | 'Attachments' | 'Consumables' | 'Other';
export type InventoryCondition = 'New' | 'Used' | 'Needs Repair';


export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  salePrice: number;
  stock: number;
  type: 'Weapon' | 'Gear' | 'Consumable'; // This can be deprecated or used as a broader category
  isRental: boolean;
  // New advanced fields
  category: InventoryCategory;
  condition: InventoryCondition;
  serialNumber?: string;
  purchaseDate?: string;
  lastServiceDate?: string;
  sku?: string;
  supplierId?: string;
  purchasePrice?: number;
  reorderLevel?: number;
  warrantyInfo?: string;
}

export interface RentalSignup {
    playerId: string;
    requestedGearIds: string[];
    note?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  location: string;
  description: string;
  theme: string;
  rules: string;
  participationXp: number;
  attendees: EventAttendee[];
  signedUpPlayers: string[];
  absentPlayers: string[];
  status: EventStatus;
  imageUrl?: string;
  gameFee: number;
  gearForRent: InventoryItem[];
  teams?: {
    alpha: string[];
    bravo: string[];
  };
  xpOverrides?: Partial<Record<string, number>>; // { [ruleId]: newXpValue }
  rentalSignups?: RentalSignup[];
  liveStats?: Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>;
  gameDurationSeconds?: number;
}


export interface Briefing {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  date: string;
}

export interface Rank {
    name: string;
    tier: string;
    minXp: number; // Represents Rank Points
    iconUrl: string;
    unlocks: string[];
    badgeAwarded?: string;
}

export interface Voucher {
    id: string;
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    description: string;
    status: 'Active' | 'Expired' | 'Depleted';
    assignedToPlayerId?: string;
    usageLimit?: number; // Total uses for this voucher code
    perUserLimit?: number; // How many times a single player can use it
    redemptions: {
        playerId: string;
        eventId: string;
        date: string;
    }[];
}

export interface Prize {
    id: string;
    name: string;
    place: 1 | 2 | 3;
}

export interface RaffleWinner {
    prizeId: string;
    ticketId: string;
    playerId: string;
}

export interface RaffleTicket {
    id: string;
    code: string;
    playerId: string;
    purchaseDate: string;
    paymentStatus: PaymentStatus;
}

export interface Raffle {
    id: string;
    name: string; // Raffle event name
    location: string;
    contactPhone: string;
    prizes: Prize[];
    tickets: RaffleTicket[];
    drawDate: string; // ISO date string
    status: 'Upcoming' | 'Active' | 'Completed';
    winners: RaffleWinner[];
    createdAt: string;
}


export interface GamificationRule {
    id: string;
    name: string;
    description: string;
    xp: number;
}

export type GamificationSettings = GamificationRule[];

export interface Sponsor {
    id: string;
    name: string;
    logoUrl: string;
    email?: string;
    phone?: string;
    website?: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
}

export type TransactionType = 'Event Revenue' | 'Rental Revenue' | 'Retail Revenue' | 'Expense';

export interface Transaction {
    id: string;
    date: string;
    type: TransactionType;
    description: string;
    amount: number;
    relatedEventId?: string;
    relatedInventoryId?: string;
    relatedPlayerId?: string;
    paymentStatus?: PaymentStatus;
}

export interface Location {
    id: string;
    name: string;
    description: string;
    address: string;
    imageUrls: string[];
    pinLocationUrl: string;
    contactInfo: {
        phone?: string;
        email?: string;
    };
}

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    iconUrl: string;
}

export interface CompanyDetails {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    regNumber?: string;
    vatNumber?: string;
    logoUrl: string;
    loginBackgroundUrl?: string;
    loginAudioUrl?: string;
    playerDashboardBackgroundUrl?: string;
    adminDashboardBackgroundUrl?: string;
    apkUrl?: string;
    socialLinks: SocialLink[];
    bankInfo: {
        bankName: string;
        accountNumber: string;
        routingNumber: string;
    };
    fixedEventRules?: string;
}