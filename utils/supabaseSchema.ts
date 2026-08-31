import type { Player, Rank, Tier, Badge, LegendaryBadge, GameEvent, GamificationRule } from '../types';
import { getRankForPlayer } from './rankUtils';

/**
 * Complete, idempotent SQL migration snippet for Supabase PostgreSQL.
 * Run this snippet in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
 * to ensure all tables, columns (including JSONB data types, column aliases, and RLS policies)
 * are properly structured for 100% live database synchronization with zero data loss.
 */
export const COMPLETE_SUPABASE_SETUP_SQL = `-- =========================================================================
-- BOSJOL TACTICAL AIRSOFT - FULL SUPABASE POSTGRESQL SCHEMA & PERMISSIONS
-- Run this complete script in your Supabase SQL Editor.
-- It is idempotent (safe to run multiple times without losing data).
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PLAYERS TABLE (Supports Operators, Stats, Ranks, XP, and Badges)
CREATE TABLE IF NOT EXISTS public.players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    surname TEXT DEFAULT '',
    callsign TEXT DEFAULT '',
    "playerCode" TEXT,
    playercode TEXT,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    pin TEXT DEFAULT '000000',
    age NUMERIC DEFAULT 18,
    "idNumber" TEXT DEFAULT '',
    idnumber TEXT DEFAULT '',
    role TEXT DEFAULT 'player',
    status TEXT DEFAULT 'Active',
    "avatarUrl" TEXT DEFAULT '',
    avatarurl TEXT DEFAULT '',
    stats JSONB DEFAULT '{"kills":0,"deaths":0,"headshots":0,"gamesPlayed":0,"xp":0}'::jsonb,
    rank JSONB DEFAULT '{}'::jsonb,
    loadout JSONB DEFAULT '{"primaryWeapon":"M4A1 Assault Rifle","secondaryWeapon":"X12 Pistol","lethal":"Frag Grenade","tactical":"Flashbang"}'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb,
    "legendaryBadges" JSONB DEFAULT '[]'::jsonb,
    legendarybadges JSONB DEFAULT '[]'::jsonb,
    "matchHistory" JSONB DEFAULT '[]'::jsonb,
    matchhistory JSONB DEFAULT '[]'::jsonb,
    "xpAdjustments" JSONB DEFAULT '[]'::jsonb,
    xpadjustments JSONB DEFAULT '[]'::jsonb,
    address TEXT DEFAULT '',
    allergies TEXT DEFAULT '',
    "medicalNotes" TEXT DEFAULT '',
    medicalnotes TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    "preferredRole" TEXT DEFAULT 'Assault',
    preferredrole TEXT DEFAULT 'Assault',
    "activeAuthUID" TEXT DEFAULT '',
    activeauthuid TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all expected columns exist if table was already created
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "playerCode" TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS playercode TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS avatarurl TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "idNumber" TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS idnumber TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"kills":0,"deaths":0,"headshots":0,"gamesPlayed":0,"xp":0}'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS rank JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS loadout JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "legendaryBadges" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS legendarybadges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "matchHistory" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS matchhistory JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "xpAdjustments" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS xpadjustments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "medicalNotes" TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS medicalnotes TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "preferredRole" TEXT DEFAULT 'Assault';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS preferredrole TEXT DEFAULT 'Assault';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "activeAuthUID" TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS activeauthuid TEXT DEFAULT '';

-- 3. RANKS & TIERS TABLE (Progression Hierarchy)
CREATE TABLE IF NOT EXISTS public.ranks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "rankBadgeUrl" TEXT DEFAULT '',
    rankbadgeurl TEXT DEFAULT '',
    "minXp" NUMERIC DEFAULT 0,
    minxp NUMERIC DEFAULT 0,
    "maxXp" NUMERIC,
    maxxp NUMERIC,
    tiers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS "rankBadgeUrl" TEXT;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS rankbadgeurl TEXT;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS "minXp" NUMERIC DEFAULT 0;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS minxp NUMERIC DEFAULT 0;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS "maxXp" NUMERIC;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS maxxp NUMERIC;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS tiers JSONB DEFAULT '[]'::jsonb;

-- 4. GAMIFICATION RULES & BADGES TABLES
CREATE TABLE IF NOT EXISTS public."gamificationSettings" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    xp NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gamificationsettings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    xp NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS "iconUrl" TEXT;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS iconurl TEXT;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public."legendaryBadges" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legendarybadges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTS & GAME TYPES TABLES
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT DEFAULT '',
    "startTime" TEXT DEFAULT '',
    starttime TEXT DEFAULT '',
    "endTime" TEXT DEFAULT '',
    endtime TEXT DEFAULT '',
    location TEXT DEFAULT '',
    type TEXT DEFAULT 'Skirmish',
    status TEXT DEFAULT 'Upcoming',
    price NUMERIC DEFAULT 0,
    "maxParticipants" NUMERIC DEFAULT 50,
    maxparticipants NUMERIC DEFAULT 50,
    attendees JSONB DEFAULT '[]'::jsonb,
    "gameType" JSONB DEFAULT '{}'::jsonb,
    gametype JSONB DEFAULT '{}'::jsonb,
    scenarios JSONB DEFAULT '[]'::jsonb,
    "imageUrl" TEXT DEFAULT '',
    imageurl TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."gameTypes" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    rules JSONB DEFAULT '[]'::jsonb,
    scenarios JSONB DEFAULT '[]'::jsonb,
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gametypes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    rules JSONB DEFAULT '[]'::jsonb,
    scenarios JSONB DEFAULT '[]'::jsonb,
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SETTINGS & APP CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    "logoUrl" TEXT DEFAULT '',
    logourl TEXT DEFAULT '',
    "companyDetails" JSONB DEFAULT '{}'::jsonb,
    companydetails JSONB DEFAULT '{}'::jsonb,
    "brandingDetails" JSONB DEFAULT '{}'::jsonb,
    brandingdetails JSONB DEFAULT '{}'::jsonb,
    "contentDetails" JSONB DEFAULT '{}'::jsonb,
    contentdetails JSONB DEFAULT '{}'::jsonb,
    "creatorDetails" JSONB DEFAULT '{}'::jsonb,
    creatordetails JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUPPORTING TABLES (Signups, Inventory, Finance, Notifications, Sessions, Activity)
CREATE TABLE IF NOT EXISTS public.signups (
    id TEXT PRIMARY KEY,
    "playerId" TEXT,
    playerid TEXT,
    "eventId" TEXT,
    eventid TEXT,
    "playerName" TEXT,
    playername TEXT,
    "playerCallsign" TEXT,
    playercallsign TEXT,
    "playerCode" TEXT,
    playercode TEXT,
    "paymentStatus" TEXT DEFAULT 'Unpaid',
    paymentstatus TEXT DEFAULT 'Unpaid',
    "signedUpAt" TEXT,
    signedupat TEXT,
    "selectedWeapon" TEXT DEFAULT '',
    selectedweapon TEXT DEFAULT '',
    "tacticalRole" TEXT DEFAULT '',
    tacticalrole TEXT DEFAULT '',
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT DEFAULT '',
    message TEXT DEFAULT '',
    type TEXT DEFAULT 'info',
    timestamp TEXT DEFAULT '',
    read BOOLEAN DEFAULT false,
    "playerId" TEXT,
    playerid TEXT,
    "playerName" TEXT,
    playername TEXT,
    "playerCallsign" TEXT,
    playercallsign TEXT,
    "playerCode" TEXT,
    playercode TEXT,
    "playerAvatarUrl" TEXT,
    playeravatarurl TEXT,
    "badgeId" TEXT,
    badgeid TEXT,
    "badgeName" TEXT,
    badgename TEXT,
    "badgeIconUrl" TEXT,
    badgeiconurl TEXT,
    "badgeDescription" TEXT,
    badgedescription TEXT,
    "badgeCriteria" TEXT,
    badgecriteria TEXT,
    "rankName" TEXT,
    rankname TEXT,
    "rankIconUrl" TEXT,
    rankiconurl TEXT,
    "eventId" TEXT,
    eventid TEXT,
    "eventTitle" TEXT,
    eventtitle TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."activityLog" (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    userid TEXT,
    "userName" TEXT,
    username TEXT,
    "userRole" TEXT,
    userrole TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activitylog (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    userid TEXT,
    "userName" TEXT,
    username TEXT,
    "userRole" TEXT,
    userrole TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    userid TEXT,
    "userName" TEXT,
    username TEXT,
    "userRole" TEXT,
    userrole TEXT,
    "currentView" TEXT,
    currentview TEXT,
    "lastSeen" TEXT,
    lastseen TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vouchers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount NUMERIC DEFAULT 0,
    "discountType" TEXT DEFAULT 'percentage',
    discounttype TEXT DEFAULT 'percentage',
    "expiryDate" TEXT,
    expirydate TEXT,
    "isUsed" BOOLEAN DEFAULT false,
    isused BOOLEAN DEFAULT false,
    "assignedToPlayerId" TEXT,
    assignedtoplayerid TEXT,
    "usedByPlayerId" TEXT,
    usedbyplayerid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Gear',
    quantity NUMERIC DEFAULT 0,
    "pricePerUnit" NUMERIC DEFAULT 0,
    priceperunit NUMERIC DEFAULT 0,
    "supplierId" TEXT,
    supplierid TEXT,
    status TEXT DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'income',
    date TEXT DEFAULT '',
    "playerId" TEXT,
    playerid TEXT,
    "eventId" TEXT,
    eventid TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    description TEXT DEFAULT '',
    coordinates TEXT DEFAULT '',
    "imageUrl" TEXT DEFAULT '',
    imageurl TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.raffles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    "ticketPrice" NUMERIC DEFAULT 0,
    ticketprice NUMERIC DEFAULT 0,
    "totalTickets" NUMERIC DEFAULT 100,
    totaltickets NUMERIC DEFAULT 100,
    "soldTickets" JSONB DEFAULT '[]'::jsonb,
    soldtickets JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active',
    "drawDate" TEXT,
    drawdate TEXT,
    prizes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sponsors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier TEXT DEFAULT 'Bronze',
    "logoUrl" TEXT DEFAULT '',
    logourl TEXT DEFAULT '',
    website TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."socialLinks" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sociallinks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."carouselMedia" (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    type TEXT DEFAULT 'image',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carouselmedia (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    type TEXT DEFAULT 'image',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."apiSetupGuide" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.apisetupguide (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."tacticalRules" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tacticalrules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.honors (
    id TEXT PRIMARY KEY,
    "playerId" TEXT,
    playerid TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable Row Level Security on all public tables and grant full access to anonymous/authenticated client requests
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public full access on ' || r.tablename, r.tablename);
            EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'Allow public full access on ' || r.tablename, r.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Safely continue if a view or system table is encountered
        END;
    END LOOP;
END $$;

-- 9. REALTIME REPLICATION SETUP
-- Safely add all existing public tables to the supabase_realtime publication
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename NOT LIKE 'pg_%'
    ) LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', r.tablename);
        EXCEPTION WHEN duplicate_object THEN
            -- Table already in publication, proceed safely
        WHEN OTHERS THEN
            -- Ignore non-critical warnings
        END;
    END LOOP;
END $$;

-- 10. RPC HELPER FUNCTIONS FOR RESET / CLEANUP
CREATE OR REPLACE FUNCTION public.delete_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.signups;
    DELETE FROM public.transactions;
    DELETE FROM public.vouchers;
    DELETE FROM public.honors;
    DELETE FROM public.activitylog;
    DELETE FROM public.sessions;
    DELETE FROM public.notifications;
    DELETE FROM public.players;
    DELETE FROM public.events;
    DELETE FROM public.inventory;
    DELETE FROM public.raffles;
    DELETE FROM public.suppliers;
    DELETE FROM public.sponsors;
    DELETE FROM public.locations;
    DELETE FROM public.sociallinks;
    DELETE FROM public.carouselmedia;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_all_players()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.signups;
    DELETE FROM public.transactions;
    DELETE FROM public.vouchers;
    DELETE FROM public.honors;
    DELETE FROM public.activitylog;
    DELETE FROM public.sessions;
    DELETE FROM public.players;
END;
$$;
`;

/**
 * Safely parse a value if it was returned as a string from Postgres.
 */
function safeJsonParse<T>(val: any, fallback: T): T {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') return val as T;
    if (typeof val === 'string') {
        try {
            return JSON.parse(val) as T;
        } catch {
            return fallback;
        }
    }
    return fallback;
}

/**
 * Normalizes a raw player row from Supabase into a fully-typed Player object.
 * Handles casing differences, JSON strings vs JSONB, and auto-calculates correct rank based on XP.
 */
export function normalizePlayerRow(raw: any, ranks?: Rank[]): Player {
    if (!raw) return raw;

    const stats = safeJsonParse(raw.stats, { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 });
    const parsedStats = {
        kills: Number(stats.kills ?? 0) || 0,
        deaths: Number(stats.deaths ?? 0) || 0,
        headshots: Number(stats.headshots ?? 0) || 0,
        gamesPlayed: Number(stats.gamesPlayed ?? stats.gamesplayed ?? 0) || 0,
        xp: Number(stats.xp ?? 0) || 0,
    };

    const parsedRank = safeJsonParse(raw.rank, {} as Tier);
    const parsedBadges = safeJsonParse<Badge[]>(raw.badges, []);
    const parsedLegendaryBadges = safeJsonParse<LegendaryBadge[]>(raw.legendaryBadges ?? raw.legendarybadges, []);
    const parsedMatchHistory = safeJsonParse<any[]>(raw.matchHistory ?? raw.matchhistory, []);
    const parsedXpAdjustments = safeJsonParse<any[]>(raw.xpAdjustments ?? raw.xpadjustments, []);
    const parsedLoadout = safeJsonParse(raw.loadout, {
        primaryWeapon: 'M4A1 Assault Rifle',
        secondaryWeapon: 'X12 Pistol',
        lethal: 'Frag Grenade',
        tactical: 'Flashbang',
    });

    const player: Player = {
        id: String(raw.id || `p_${Date.now()}`),
        name: raw.name || '',
        surname: raw.surname || '',
        callsign: raw.callsign || raw.name || 'Operator',
        playerCode: raw.playerCode || raw.playercode || 'NO-CODE',
        email: raw.email || '',
        phone: raw.phone || '',
        pin: String(raw.pin || '000000'),
        age: Number(raw.age || 18),
        idNumber: raw.idNumber || raw.idnumber || '',
        role: raw.role || 'player',
        status: raw.status || 'Active',
        avatarUrl: raw.avatarUrl || raw.avatarurl || `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(raw.name || 'Operator')}`,
        stats: parsedStats,
        rank: parsedRank,
        badges: Array.isArray(parsedBadges) ? parsedBadges : [],
        legendaryBadges: Array.isArray(parsedLegendaryBadges) ? parsedLegendaryBadges : [],
        matchHistory: Array.isArray(parsedMatchHistory) ? parsedMatchHistory : [],
        xpAdjustments: Array.isArray(parsedXpAdjustments) ? parsedXpAdjustments : [],
        loadout: parsedLoadout,
        address: raw.address || '',
        allergies: raw.allergies || '',
        medicalNotes: raw.medicalNotes || raw.medicalnotes || '',
        bio: raw.bio || '',
        preferredRole: raw.preferredRole || raw.preferredrole || 'Assault',
        activeAuthUID: raw.activeAuthUID || raw.activeauthuid || '',
    };

    // Auto-calculate exact rank tier if ranks array provided
    if (ranks && ranks.length > 0) {
        player.rank = getRankForPlayer(player, ranks);
    }

    return player;
}

/**
 * Normalizes a raw rank row from Supabase into a fully-typed Rank object.
 */
export function normalizeRankRow(raw: any): Rank {
    if (!raw) return raw;
    const rawTiers = safeJsonParse<any[]>(raw.tiers, []);
    const normalizedTiers: Tier[] = Array.isArray(rawTiers)
        ? rawTiers.map((t: any, idx: number) => ({
            id: t.id || `tier_${raw.id}_${idx}`,
            name: t.name || 'Tier',
            minXp: Number(t.minXp ?? t.minxp ?? 0) || 0,
            perks: Array.isArray(t.perks) ? t.perks : (typeof t.perks === 'string' ? [t.perks] : []),
            iconUrl: t.iconUrl || t.iconurl || '',
        }))
        : [];

    return {
        id: String(raw.id),
        name: raw.name || '',
        description: raw.description || '',
        rankBadgeUrl: raw.rankBadgeUrl || raw.rankbadgeurl || '',
        minXp: Number(raw.minXp ?? raw.minxp ?? 0) || 0,
        maxXp: raw.maxXp !== undefined ? Number(raw.maxXp) : (raw.maxxp !== undefined ? Number(raw.maxxp) : undefined),
        tiers: normalizedTiers,
    };
}

/**
 * Prepares a clean, Postgres/Supabase-compatible payload for writing to Supabase.
 * Supplies matching column aliases (camelCase and unquoted) and ensures JSON objects are formatted.
 */
export function prepareSupabasePayload(collectionName: string, item: any, liveRanks?: Rank[]): any {
    if (!item) return item;
    const payload = { ...item };

    if (collectionName === 'players') {
        const stats = item.stats ? {
            kills: Number(item.stats.kills ?? 0) || 0,
            deaths: Number(item.stats.deaths ?? 0) || 0,
            headshots: Number(item.stats.headshots ?? 0) || 0,
            gamesPlayed: Number(item.stats.gamesPlayed ?? item.stats.gamesplayed ?? 0) || 0,
            xp: Number(item.stats.xp ?? 0) || 0,
        } : { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 };

        let calculatedRank = item.rank || {};
        if (liveRanks && liveRanks.length > 0 && stats.xp !== undefined) {
            calculatedRank = getRankForPlayer({ stats }, liveRanks);
        }

        return {
            id: String(item.id),
            name: item.name || '',
            surname: item.surname || '',
            callsign: item.callsign || item.name || 'Operator',
            playerCode: item.playerCode || item.playercode || '',
            playercode: item.playerCode || item.playercode || '',
            email: item.email || '',
            phone: item.phone || '',
            pin: String(item.pin || '000000'),
            age: Number(item.age || 18),
            idNumber: item.idNumber || item.idnumber || '',
            idnumber: item.idNumber || item.idnumber || '',
            role: item.role || 'player',
            status: item.status || 'Active',
            avatarUrl: item.avatarUrl || item.avatarurl || '',
            avatarurl: item.avatarUrl || item.avatarurl || '',
            stats: stats,
            rank: calculatedRank,
            loadout: item.loadout || {},
            badges: Array.isArray(item.badges) ? item.badges : [],
            legendaryBadges: Array.isArray(item.legendaryBadges) ? item.legendaryBadges : (item.legendarybadges || []),
            legendarybadges: Array.isArray(item.legendaryBadges) ? item.legendaryBadges : (item.legendarybadges || []),
            matchHistory: Array.isArray(item.matchHistory) ? item.matchHistory : (item.matchhistory || []),
            matchhistory: Array.isArray(item.matchHistory) ? item.matchHistory : (item.matchhistory || []),
            xpAdjustments: Array.isArray(item.xpAdjustments) ? item.xpAdjustments : (item.xpadjustments || []),
            xpadjustments: Array.isArray(item.xpAdjustments) ? item.xpAdjustments : (item.xpadjustments || []),
            address: item.address || '',
            allergies: item.allergies || '',
            medicalNotes: item.medicalNotes || item.medicalnotes || '',
            medicalnotes: item.medicalNotes || item.medicalnotes || '',
            bio: item.bio || '',
            preferredRole: item.preferredRole || item.preferredrole || 'Assault',
            preferredrole: item.preferredRole || item.preferredrole || 'Assault',
            activeAuthUID: item.activeAuthUID || item.activeauthuid || '',
            activeauthuid: item.activeAuthUID || item.activeauthuid || '',
            updated_at: new Date().toISOString(),
        };
    }

    if (collectionName === 'ranks') {
        const tiers = Array.isArray(item.tiers) ? item.tiers.map((t: any, idx: number) => ({
            id: t.id || `t_${Date.now()}_${idx}`,
            name: t.name || 'Tier',
            minXp: Number(t.minXp ?? t.minxp ?? 0) || 0,
            perks: Array.isArray(t.perks) ? t.perks : (typeof t.perks === 'string' ? [t.perks] : []),
            iconUrl: t.iconUrl || t.iconurl || '',
        })) : [];

        return {
            id: String(item.id),
            name: item.name || '',
            description: item.description || '',
            rankBadgeUrl: item.rankBadgeUrl || item.rankbadgeurl || '',
            rankbadgeurl: item.rankBadgeUrl || item.rankbadgeurl || '',
            minXp: Number(item.minXp ?? item.minxp ?? 0) || 0,
            minxp: Number(item.minXp ?? item.minxp ?? 0) || 0,
            maxXp: item.maxXp !== undefined ? Number(item.maxXp) : (item.maxxp !== undefined ? Number(item.maxxp) : null),
            maxxp: item.maxXp !== undefined ? Number(item.maxXp) : (item.maxxp !== undefined ? Number(item.maxxp) : null),
            tiers: tiers,
        };
    }

    return payload;
}
