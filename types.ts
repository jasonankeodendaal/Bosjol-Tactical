


import { IconProps } from "@phosphor-icons/react";
import type { Dispatch, SetStateAction } from 'react';

export type Role = 'player' | 'admin' | 'creator';

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
  xp: number; // Internally this is rank points (RP)
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

// Sub-collection document type
export interface MatchHistoryDoc extends MatchRecord {
    id: string; // doc id
    playerId: string; // parent player id
}

export interface XpAdjustment {
    amount: number;
    reason: string;
    date: string;
}

// Sub-collection document type
export interface XpAdjustmentDoc extends XpAdjustment {
    id: string;
    playerId: string;
}

export interface Loadout {
    primaryWeapon: string;
    secondaryWeapon: string;

    lethal: string;
    tactical: string;
}

export type PlayerRole = 'Assault' | 'Recon' | 'Support' | 'Sniper';

// This is the core data stored in the `players` collection document
export interface PlayerCore extends User {
  role: 'player';
  callsign: string;
  rank: Tier;
  status: 'Active' | 'On Leave' | 'Retired';
  avatarUrl: string;
  stats: PlayerStats;
  badges: Badge[]; // Correctly defined
  legendaryBadges: LegendaryBadge[]; // Correctly defined
  loadout: Loadout;
  // New detailed fields
  playerCode: string;
  surname: string;
  email: string;
  phone: string;
  pin: string;
  age: number;
  idNumber: string;
  address?: string;
  allergies?: string;
  medicalNotes?: string;
  bio?: string;
  preferredRole?: PlayerRole;
  activeAuthUID?: string; // Firebase Authentication UID, if linked.
}

// This is the composed type used by components, with sub-collection data merged in.
export interface Player extends PlayerCore {
    matchHistory: MatchHistoryDoc[];
    xpAdjustments: XpAdjustmentDoc[];
}

export interface Admin extends User {
  role: 'admin';
  email: string;
  clearanceLevel: number;
  avatarUrl: string;
  firebaseAuthUID?: string; // Firebase Authentication UID
}

export interface AuthContextType {
  user: User | Player | Admin | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User | Player | Admin) => void; 
  helpTopic: string;
  setHelpTopic: Dispatch<SetStateAction<string>>;
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

// Sub-collection document type
export interface AttendeeDoc extends EventAttendee {
    id: string; // doc id is playerId
    eventId: string; // parent event id
    stats?: Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>;
}

export type InventoryCategory = 'AEG Rifle' | 'GBB Rifle' | 'Sniper Rifle' | 'Sidearm' | 'SMG' | 'Tactical Gear' | 'Attachments' | 'Consumables' | 'Other';
export type InventoryCondition = 'New' | 'Used' | 'Needs Repair' | 'Needs Inspection';


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

export interface Signup {
    id: string; // Composite key: eventId_playerId
    eventId: string;
    playerId: string;
    requestedGearIds: string[];
    note?: string;
}

// Core data stored in the `events` collection document
export interface EventCore {
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
  status: EventStatus;
  imageUrl?: string;
  audioBriefingUrl?: string;
  gameFee: number;
  gearForRent: string[]; // Array of InventoryItem IDs
  rentalPriceOverrides?: { [itemId: string]: number };
  teams?: {
    alpha: string[];
    bravo: string[];
  };
  xpOverrides?: Partial<Record<string, number>>; // { [ruleId]: newXpValue }
  gameDurationSeconds?: number;
  eventBadges?: string[]; // Array of LegendaryBadge IDs
  awardedBadges?: { [playerId: string]: string[] }; // { 'p001': ['badgeId1'], 'p002': ['badgeId2'] }
}

// Composed type used by components
export interface GameEvent extends EventCore {
    attendees: AttendeeDoc[];
    liveStats: Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>;
}


export interface Briefing {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  date: string;
}

export interface Tier {
  id: string;
  name: string;
  minXp: number;
  perks: string[];
  iconUrl: string;
}

export interface Rank {
  id: string;
  name: string;
  description: string;
  rankBadgeUrl: string;
  tiers: Tier[];
}


export interface VoucherRedemption {
    id: string; // doc id
    voucherId: string; // parent voucher id
    playerId: string;
    eventId: string;
    date: string;
}

// Core voucher data
export interface VoucherCore {
    id: string;
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    description: string;
    status: 'Active' | 'Expired' | 'Depleted';
    assignedToPlayerId?: string;
    usageLimit?: number; // Total uses for this voucher code
    perUserLimit?: number; // How many times a single player can use it
}

// Composed type
export interface Voucher extends VoucherCore {
    redemptions: VoucherRedemption[];
}

export interface Prize {
    id: string;
    name: string;
    place: 1 | 2 | 3;
}

// Sub-collection doc
export interface RaffleWinnerDoc {
    id: string; // doc id
    raffleId: string; // parent id
    prizeId: string;
    ticketId: string;
    playerId: string;
}

// Sub-collection doc
export interface RaffleTicketDoc {
    id: string; // doc id
    raffleId: string; // parent id
    code: string;
    playerId: string;
    purchaseDate: string;
    paymentStatus: PaymentStatus;
}

// Core raffle data
export interface RaffleCore {
    id: string;
    name: string; // Raffle event name
    location: string;
    contactPhone: string;
    prizes: Prize[];
    drawDate: string; // ISO date string
    status: 'Upcoming' | 'Active' | 'Completed';
    createdAt: string;
}

// Composed type
export interface Raffle extends RaffleCore {
    tickets: RaffleTicketDoc[];
    winners: RaffleWinnerDoc[];
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
    bio?: string;
    imageUrls?: string[];
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

export interface CarouselMedia {
    id: string;
    type: 'image' | 'video';
    url: string;
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
    playerDashboardAudioUrl?: string;
    adminDashboardAudioUrl?: string;
    sponsorsBackgroundUrl?: string;
    apkUrl?: string;
    apiServerUrl?: string;
    bankInfo: {
        bankName: string;
        accountNumber: string;
        routingNumber: string;
    };
    fixedEventRules?: string;
    minimumSignupAge: number;
    nextRankResetDate?: string;
}

export interface ApiGuideStep {
  id: string;
  title: string;
  content: string;
  codeBlock?: string;
  codeLanguage?: string;
  fileName?: string;
}

export interface CreatorDetails {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    tagline: string;
    bio: string;
    logoUrl: string;
    githubUrl: string;
    sourceCodeZipUrl?: string;
}

export interface Session {
  id: string; // Firebase auth UID
  userId: string; // Player/Admin ID
  userName: string;
  userRole: Role;
  currentView: string;
  lastSeen: string; // ISO string
}

export interface ActivityLog {
  id: string; // doc id
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details?: Record<string, any>;
}