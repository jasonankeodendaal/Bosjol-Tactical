import type { Player, Rank, Tier, Badge, LegendaryBadge, GameEvent, GamificationRule, GameType, InventoryItem } from '../types';
import { getRankForPlayer } from './rankUtils';
import { generatePlayerCodeFromName } from './playerCodeGenerator';

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

-- 2. SUPABASE STORAGE SETUP (Avatars, Media, Public, Uploads, Settings)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('media', 'media', true),
    ('public', 'public', true),
    ('uploads', 'uploads', true),
    ('settings', 'settings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (true) WITH CHECK (true);

-- 3. PLAYERS TABLE (Supports Operators, Stats, Ranks, XP, and Badges)
CREATE TABLE IF NOT EXISTS public.players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    surname TEXT DEFAULT '',
    callsign TEXT DEFAULT '',
    "playerCode" TEXT,
    playercode TEXT,
    player_code TEXT,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    pin TEXT DEFAULT '000000',
    age NUMERIC DEFAULT 18,
    "idNumber" TEXT DEFAULT '',
    idnumber TEXT DEFAULT '',
    id_number TEXT DEFAULT '',
    role TEXT DEFAULT 'player',
    status TEXT DEFAULT 'Active',
    "avatarUrl" TEXT DEFAULT '',
    avatarurl TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    stats JSONB DEFAULT '{"kills":0,"deaths":0,"headshots":0,"gamesPlayed":0,"xp":0}'::jsonb,
    rank JSONB DEFAULT '{}'::jsonb,
    loadout JSONB DEFAULT '{"primaryWeapon":"M4A1 Assault Rifle","secondaryWeapon":"X12 Pistol","lethal":"Frag Grenade","tactical":"Flashbang"}'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb,
    "legendaryBadges" JSONB DEFAULT '[]'::jsonb,
    legendarybadges JSONB DEFAULT '[]'::jsonb,
    legendary_badges JSONB DEFAULT '[]'::jsonb,
    "matchHistory" JSONB DEFAULT '[]'::jsonb,
    matchhistory JSONB DEFAULT '[]'::jsonb,
    match_history JSONB DEFAULT '[]'::jsonb,
    "xpAdjustments" JSONB DEFAULT '[]'::jsonb,
    xpadjustments JSONB DEFAULT '[]'::jsonb,
    xp_adjustments JSONB DEFAULT '[]'::jsonb,
    address TEXT DEFAULT '',
    allergies TEXT DEFAULT '',
    "medicalNotes" TEXT DEFAULT '',
    medicalnotes TEXT DEFAULT '',
    medical_notes TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    "preferredRole" TEXT DEFAULT 'Assault',
    preferredrole TEXT DEFAULT 'Assault',
    preferred_role TEXT DEFAULT 'Assault',
    "activeAuthUID" TEXT DEFAULT '',
    activeauthuid TEXT DEFAULT '',
    active_auth_uid TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all expected columns exist if table was already created
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "playerCode" TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS playercode TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS player_code TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS avatarurl TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "idNumber" TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS idnumber TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"kills":0,"deaths":0,"headshots":0,"gamesPlayed":0,"xp":0}'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS rank JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS loadout JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "legendaryBadges" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS legendarybadges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS legendary_badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "matchHistory" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS matchhistory JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS match_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "xpAdjustments" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS xpadjustments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS xp_adjustments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "medicalNotes" TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS medicalnotes TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS medical_notes TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "preferredRole" TEXT DEFAULT 'Assault';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS preferredrole TEXT DEFAULT 'Assault';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS preferred_role TEXT DEFAULT 'Assault';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "activeAuthUID" TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS activeauthuid TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS active_auth_uid TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Full Replica Identity so updates broadcast complete row states in Realtime
ALTER TABLE public.players REPLICA IDENTITY FULL;

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

-- Enable Full Replica Identity so updates and deletions broadcast complete row states in Realtime
ALTER TABLE public.ranks REPLICA IDENTITY FULL;

-- Explicitly grant permissions
GRANT ALL ON TABLE public.ranks TO anon, authenticated, service_role;

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
    icon_url TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    how_to_obtain TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS "iconUrl" TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS iconurl TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS "howToObtain" TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS howtoobtain TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS how_to_obtain TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.legendarybadges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    how_to_obtain TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS "iconUrl" TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS iconurl TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS "howToObtain" TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS howtoobtain TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS how_to_obtain TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.legendary_badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    how_to_obtain TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS "iconUrl" TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS iconurl TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS "howToObtain" TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS howtoobtain TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS how_to_obtain TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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
    category TEXT DEFAULT 'Scenario',
    description TEXT DEFAULT '',
    "gameplayMechanics" TEXT DEFAULT '',
    gameplaymechanics TEXT DEFAULT '',
    gameplay_mechanics TEXT DEFAULT '',
    rules TEXT DEFAULT '',
    "rulesFileUrl" TEXT DEFAULT '',
    rulesfileurl TEXT DEFAULT '',
    "imageUrl" TEXT DEFAULT '',
    imageurl TEXT DEFAULT '',
    "audioBriefingUrl" TEXT DEFAULT '',
    audiobriefingurl TEXT DEFAULT '',
    theme TEXT DEFAULT 'Standard',
    "participationXp" NUMERIC DEFAULT 50,
    participationxp NUMERIC DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all possible table variations and columns exist
DO $$
BEGIN
    -- Create game_types table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.game_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'Scenario',
        description TEXT DEFAULT '',
        "gameplayMechanics" TEXT DEFAULT '',
        gameplaymechanics TEXT DEFAULT '',
        gameplay_mechanics TEXT DEFAULT '',
        rules TEXT DEFAULT '',
        "rulesFileUrl" TEXT DEFAULT '',
        rulesfileurl TEXT DEFAULT '',
        "imageUrl" TEXT DEFAULT '',
        imageurl TEXT DEFAULT '',
        "audioBriefingUrl" TEXT DEFAULT '',
        audiobriefingurl TEXT DEFAULT '',
        theme TEXT DEFAULT 'Standard',
        "participationXp" NUMERIC DEFAULT 50,
        participationxp NUMERIC DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add missing columns to game_types
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Scenario';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS "gameplayMechanics" TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS gameplaymechanics TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS gameplay_mechanics TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS rules TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS "rulesFileUrl" TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS rulesfileurl TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS "audioBriefingUrl" TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS audiobriefingurl TEXT DEFAULT '';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'Standard';
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS "participationXp" NUMERIC DEFAULT 50;
    ALTER TABLE public.game_types ADD COLUMN IF NOT EXISTS participationxp NUMERIC DEFAULT 50;

    -- Add missing columns to gametypes
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Scenario';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS "gameplayMechanics" TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS gameplaymechanics TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS gameplay_mechanics TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS rules TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS "rulesFileUrl" TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS rulesfileurl TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS "audioBriefingUrl" TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS audiobriefingurl TEXT DEFAULT '';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'Standard';
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS "participationXp" NUMERIC DEFAULT 50;
    ALTER TABLE public.gametypes ADD COLUMN IF NOT EXISTS participationxp NUMERIC DEFAULT 50;

    -- Add missing columns to "gameTypes"
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Scenario';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS "gameplayMechanics" TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS gameplaymechanics TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS gameplay_mechanics TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS rules TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS "rulesFileUrl" TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS rulesfileurl TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS "audioBriefingUrl" TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS audiobriefingurl TEXT DEFAULT '';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'Standard';
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS "participationXp" NUMERIC DEFAULT 50;
    ALTER TABLE public."gameTypes" ADD COLUMN IF NOT EXISTS participationxp NUMERIC DEFAULT 50;

    -- Add team, winner, gameTypeId, rentals, fees, and voting columns to events
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameTypeId" TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gametypeid TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS game_type_id TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameFee" NUMERIC DEFAULT 0;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gamefee NUMERIC DEFAULT 0;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gearForRent" JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gearforrent JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "rentalPriceOverrides" JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rentalpriceoverrides JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "teamCount" NUMERIC DEFAULT 2;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS teamcount NUMERIC DEFAULT 2;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_count NUMERIC DEFAULT 2;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS teams JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "winningTeamId" TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS winningteamid TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "liveStats" JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS livestats JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "votingEnabled" BOOLEAN DEFAULT false;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS votingenabled BOOLEAN DEFAULT false;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "votingGameTypeIds" JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS votinggametypeids JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameTypeVotes" JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gametypevotes JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "audioBriefingUrl" TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS audiobriefingurl TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rules TEXT DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'Standard';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "participationXp" NUMERIC DEFAULT 50;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS participationxp NUMERIC DEFAULT 50;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "winXpAward" NUMERIC DEFAULT 100;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS winxpaward NUMERIC DEFAULT 100;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameDurationSeconds" NUMERIC DEFAULT 2700;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gamedurationseconds NUMERIC DEFAULT 2700;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "eventBadges" JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS eventbadges JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "awardedBadges" JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS awardedbadges JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "xpOverrides" JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS xpoverrides JSONB DEFAULT '{}'::jsonb;
END $$;

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
    "requestedGearIds" JSONB DEFAULT '[]'::jsonb,
    requestedgearids JSONB DEFAULT '[]'::jsonb,
    note TEXT DEFAULT '',
    "operatorNote" TEXT DEFAULT '',
    operatornote TEXT DEFAULT '',
    "votedGameTypeId" TEXT DEFAULT '',
    votedgametypeid TEXT DEFAULT '',
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "requestedGearIds" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS requestedgearids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "operatorNote" TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS operatornote TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "votedGameTypeId" TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS votedgametypeid TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "isGuest" BOOLEAN DEFAULT false;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS isguest BOOLEAN DEFAULT false;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "guestName" TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS guestname TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "guestCallsign" TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS guestcallsign TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "guestPhone" TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS guestphone TEXT DEFAULT '';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS "checkInStatus" TEXT DEFAULT 'pending';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS checkinstatus TEXT DEFAULT 'pending';

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
    stock NUMERIC DEFAULT 0,
    "pricePerUnit" NUMERIC DEFAULT 0,
    priceperunit NUMERIC DEFAULT 0,
    price_per_unit NUMERIC DEFAULT 0,
    "salePrice" NUMERIC DEFAULT 0,
    saleprice NUMERIC DEFAULT 0,
    sale_price NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    "rentalPrice" NUMERIC DEFAULT 0,
    rentalprice NUMERIC DEFAULT 0,
    rental_price NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Gear',
    "isRental" BOOLEAN DEFAULT false,
    isrental BOOLEAN DEFAULT false,
    is_rental BOOLEAN DEFAULT false,
    description TEXT DEFAULT '',
    condition TEXT DEFAULT 'New',
    "serialNumber" TEXT DEFAULT '',
    serialnumber TEXT DEFAULT '',
    serial_number TEXT DEFAULT '',
    "supplierId" TEXT,
    supplierid TEXT,
    supplier_id TEXT,
    status TEXT DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive Column Aliases for public.inventory (Handles camelCase, lowercase, and snake_case)
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "salePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS saleprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "pricePerUnit" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS priceperunit NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "rentalPrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS rentalprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS rental_price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS stock NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Gear';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "isRental" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS isrental BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS is_rental BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "serialNumber" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS serialnumber TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS serial_number TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "purchaseDate" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchasedate TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "lastServiceDate" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS lastservicedate TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "purchasePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchaseprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "reorderLevel" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorderlevel NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorder_level NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "supplierId" TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS supplierid TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS supplier_id TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS warrantyinfo TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "availableInShop" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS availableinshop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS available_in_shop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "inShop" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS inshop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS in_shop BOOLEAN DEFAULT false;

-- Row Level Security & Full Access for inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on inventory" ON public.inventory;
CREATE POLICY "Allow public full access on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.inventory TO anon, authenticated, service_role;

-- Full Replica Identity for instant live Realtime sync
ALTER TABLE public.inventory REPLICA IDENTITY FULL;

-- Add inventory to Supabase Realtime publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;

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
    type TEXT DEFAULT 'Retail Revenue',
    date TEXT DEFAULT '',
    "playerId" TEXT,
    playerid TEXT,
    "eventId" TEXT,
    eventid TEXT,
    status TEXT DEFAULT 'completed',
    "paymentMethod" TEXT DEFAULT 'Cash',
    paymentmethod TEXT DEFAULT 'Cash',
    payment_method TEXT DEFAULT 'Cash',
    "receiptNumber" TEXT,
    receiptnumber TEXT,
    receipt_number TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    "cashierName" TEXT DEFAULT 'Admin',
    cashiername TEXT DEFAULT 'Admin',
    "customerName" TEXT DEFAULT '',
    customername TEXT DEFAULT '',
    "customerCallsign" TEXT DEFAULT '',
    customercallsign TEXT DEFAULT '',
    "customerCode" TEXT DEFAULT '',
    customercode TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all transaction columns exist safely
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paymentmethod TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "receiptNumber" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receiptnumber TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "cashierName" TEXT DEFAULT 'Admin';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cashiername TEXT DEFAULT 'Admin';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "customerName" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customername TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "customerCallsign" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customercallsign TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "customerCode" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customercode TEXT DEFAULT '';
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on transactions" ON public.transactions;
CREATE POLICY "Allow public full access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;

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
    name TEXT,
    title TEXT,
    location TEXT DEFAULT 'Main Tactical Arena',
    "contactPhone" TEXT DEFAULT '',
    contactphone TEXT DEFAULT '',
    description TEXT DEFAULT '',
    "ticketPrice" NUMERIC DEFAULT 0,
    ticketprice NUMERIC DEFAULT 0,
    "totalTickets" NUMERIC DEFAULT 100,
    totaltickets NUMERIC DEFAULT 100,
    tickets JSONB DEFAULT '[]'::jsonb,
    "soldTickets" JSONB DEFAULT '[]'::jsonb,
    soldtickets JSONB DEFAULT '[]'::jsonb,
    winners JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Upcoming',
    "drawDate" TEXT,
    drawdate TEXT,
    prizes JSONB DEFAULT '[]'::jsonb,
    "alwaysChooseMostTickets" BOOLEAN DEFAULT FALSE,
    alwayschoosemosttickets BOOLEAN DEFAULT FALSE,
    "createdAt" TEXT,
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
    const parsedLegendaryBadges = safeJsonParse<LegendaryBadge[]>(raw.legendaryBadges ?? raw.legendarybadges ?? raw.legendary_badges, []);
    const parsedMatchHistory = safeJsonParse<any[]>(raw.matchHistory ?? raw.matchhistory ?? raw.match_history, []);
    const parsedXpAdjustments = safeJsonParse<any[]>(raw.xpAdjustments ?? raw.xpadjustments ?? raw.xp_adjustments, []);
    const parsedLoadout = safeJsonParse(raw.loadout, {
        primaryWeapon: 'M4A1 Assault Rifle',
        secondaryWeapon: 'X12 Pistol',
        lethal: 'Frag Grenade',
        tactical: 'Flashbang',
    });

    const rawCode = (raw.playerCode || raw.playercode || raw.player_code || '').trim();
    const validCode = (rawCode && rawCode.toUpperCase() !== 'NO-CODE')
        ? rawCode.toUpperCase()
        : generatePlayerCodeFromName(raw.name, raw.surname, raw.id);

    const player: Player = {
        id: String(raw.id || `p_${Date.now()}`),
        name: raw.name || '',
        surname: raw.surname || '',
        callsign: raw.callsign || raw.name || 'Operator',
        playerCode: validCode,
        email: raw.email || '',
        phone: raw.phone || '',
        pin: String(raw.pin || '000000'),
        age: Number(raw.age || 18),
        idNumber: raw.idNumber || raw.idnumber || raw.id_number || '',
        role: raw.role || 'player',
        status: raw.status || 'Active',
        avatarUrl: raw.avatarUrl || raw.avatarurl || raw.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(raw.name || 'Operator')}`,
        stats: parsedStats,
        rank: parsedRank,
        badges: Array.isArray(parsedBadges) ? parsedBadges : [],
        legendaryBadges: Array.isArray(parsedLegendaryBadges) ? parsedLegendaryBadges : [],
        matchHistory: Array.isArray(parsedMatchHistory) ? parsedMatchHistory : [],
        xpAdjustments: Array.isArray(parsedXpAdjustments) ? parsedXpAdjustments : [],
        loadout: parsedLoadout,
        address: raw.address || '',
        allergies: raw.allergies || '',
        medicalNotes: raw.medicalNotes || raw.medicalnotes || raw.medical_notes || '',
        bio: raw.bio || '',
        preferredRole: raw.preferredRole || raw.preferredrole || raw.preferred_role || 'Assault',
        activeAuthUID: raw.activeAuthUID || raw.activeauthuid || raw.active_auth_uid || '',
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

    const badgeUrl = raw.rankBadgeUrl || raw.rankbadgeurl || raw.badgeUrl || raw.badgeurl || '';

    return {
        id: String(raw.id),
        name: raw.name || '',
        description: raw.description || '',
        rankBadgeUrl: badgeUrl,
        minXp: Number(raw.minXp ?? raw.minxp ?? 0) || 0,
        maxXp: raw.maxXp !== undefined ? Number(raw.maxXp) : (raw.maxxp !== undefined ? Number(raw.maxxp) : undefined),
        tiers: normalizedTiers,
    };
}

/**
 * Normalizes a raw game type row from Supabase into a fully-typed GameType object.
 */
export function normalizeGameTypeRow(raw: any): GameType {
    if (!raw) return raw;
    const rulesVal = typeof raw.rules === 'string' ? raw.rules : (Array.isArray(raw.rules) ? raw.rules.join('\n') : '');
    const imgUrl = raw.imageUrl || raw.imageurl || raw.iconUrl || raw.iconurl || '';
    const audioUrl = raw.audioBriefingUrl || raw.audiobriefingurl || '';
    const docUrl = raw.rulesFileUrl || raw.rulesfileurl || '';
    const mechanics = raw.gameplayMechanics || raw.gameplaymechanics || raw.gameplay_mechanics || '';
    const xp = Number(raw.participationXp ?? raw.participationxp ?? 50) || 50;
    const duration = Number(raw.gameDurationMinutes ?? raw.gamedurationminutes ?? 45) || 45;

    return {
        id: String(raw.id),
        name: raw.name || '',
        category: raw.category || 'Scenario',
        description: raw.description || '',
        gameplayMechanics: mechanics,
        rules: rulesVal,
        rulesFileUrl: docUrl || undefined,
        imageUrl: imgUrl || undefined,
        audioBriefingUrl: audioUrl || undefined,
        theme: raw.theme || 'Standard',
        participationXp: xp,
        gameDurationMinutes: duration,
        createdAt: raw.createdAt || raw.createdat || raw.created_at || new Date().toISOString().split('T')[0],
        lastUpdated: raw.lastUpdated || raw.lastupdated || raw.updated_at || new Date().toISOString().split('T')[0],
    };
}

/**
 * Normalizes a raw signup row from Supabase into a fully-typed Signup object.
 * Resolves both camelCase and lowercase Postgres column aliases so player registrations never vanish after reload.
 */
export function normalizeSignupRow(raw: any): Signup {
    if (!raw) return raw;
    const rawGear = raw.requestedGearIds ?? raw.requestedgearids ?? raw.requested_gear_ids;
    const parsedGear = safeJsonParse<string[]>(rawGear, []);
    const requestedGearIds = Array.isArray(parsedGear) ? parsedGear : (Array.isArray(rawGear) ? rawGear : []);
    
    let eventId = String(raw.eventId || raw.eventid || raw.event_id || '');
    let playerId = String(raw.playerId || raw.playerid || raw.player_id || '');
    const id = String(raw.id || (eventId && playerId ? `${eventId}_${playerId}` : `signup_${Date.now()}`));

    // Composite ID fallback extraction (e.g. "event123_player456")
    if ((!eventId || !playerId) && id && id.includes('_')) {
        const parts = id.split('_');
        if (parts.length >= 2) {
            if (!eventId) eventId = parts[0];
            if (!playerId) playerId = parts.slice(1).join('_');
        }
    }

    const note = raw.note || raw.operatorNote || raw.operatornote || '';

    return {
        id,
        eventId,
        playerId,
        requestedGearIds,
        note: note || undefined,
        operatorNote: note || undefined,
        votedGameTypeId: raw.votedGameTypeId || raw.votedgametypeid || raw.voted_game_type_id || undefined,
        playerName: raw.playerName || raw.playername || undefined,
        playerCallsign: raw.playerCallsign || raw.playercallsign || undefined,
        playerCode: raw.playerCode || raw.playercode || undefined,
        paymentStatus: raw.paymentStatus || raw.paymentstatus || 'Unpaid',
        signedUpAt: raw.signedUpAt || raw.signedupat || raw.created_at || undefined,
    } as Signup;
}

/**
 * Normalizes a raw event row from Supabase into a fully-typed GameEvent object.
 */
export function normalizeEventRow(raw: any): GameEvent {
    if (!raw) return raw;
    const fee = Number(raw.gameFee ?? raw.gamefee ?? raw.price ?? 0) || 0;
    const winXp = raw.winXpAward !== undefined ? Number(raw.winXpAward) : (raw.winxpaward !== undefined ? Number(raw.winxpaward) : undefined);
    const teamCount = Number(raw.teamCount ?? raw.teamcount ?? raw.team_count ?? 2) || 2;
    const duration = raw.gameDurationSeconds !== undefined ? Number(raw.gameDurationSeconds) : (raw.gamedurationseconds !== undefined ? Number(raw.gamedurationseconds) : undefined);
    const xpAward = Number(raw.participationXp ?? raw.participationxp ?? 100) || 100;
    
    const parsedAttendees = safeJsonParse<any[]>(raw.attendees, []);
    const parsedLiveStats = safeJsonParse<any>(raw.liveStats ?? raw.livestats, {});
    const parsedGearForRent = safeJsonParse<string[]>(raw.gearForRent ?? raw.gearforrent ?? raw.gear_for_rent, []);
    const parsedRentalOverrides = safeJsonParse<any>(raw.rentalPriceOverrides ?? raw.rentalpriceoverrides ?? raw.rental_price_overrides, {});
    const parsedTeams = safeJsonParse<any>(raw.teams, { alpha: [], bravo: [] });
    const parsedXpOverrides = safeJsonParse<any>(raw.xpOverrides ?? raw.xpoverrides, {});
    const parsedEventBadges = safeJsonParse<string[]>(raw.eventBadges ?? raw.eventbadges, []);
    const parsedAwardedBadges = safeJsonParse<any>(raw.awardedBadges ?? raw.awardedbadges, {});
    const parsedVotingGameTypeIds = safeJsonParse<string[]>(raw.votingGameTypeIds ?? raw.votinggametypeids, []);
    const parsedGameTypeVotes = safeJsonParse<any>(raw.gameTypeVotes ?? raw.gametypevotes, {});

    return {
        id: String(raw.id),
        gameTypeId: raw.gameTypeId || raw.gametypeid || raw.game_type_id || undefined,
        title: raw.title || 'Airsoft Operation',
        type: (raw.type || 'Mission') as EventType,
        date: raw.date || new Date().toISOString().split('T')[0],
        startTime: raw.startTime || raw.starttime || raw.start_time || '09:00',
        location: raw.location || 'Bosjol Airsoft Field',
        description: raw.description || '',
        theme: raw.theme || 'Standard Operation',
        rules: typeof raw.rules === 'string' ? raw.rules : (Array.isArray(raw.rules) ? raw.rules.join('\n') : ''),
        participationXp: xpAward,
        winXpAward: winXp,
        winningTeamId: raw.winningTeamId || raw.winningteamid || null,
        status: (raw.status || 'Upcoming') as EventStatus,
        imageUrl: raw.imageUrl || raw.imageurl || undefined,
        audioBriefingUrl: raw.audioBriefingUrl || raw.audiobriefingurl || undefined,
        gameFee: fee,
        gearForRent: Array.isArray(parsedGearForRent) ? parsedGearForRent : [],
        rentalPriceOverrides: parsedRentalOverrides,
        teamCount: teamCount,
        teams: parsedTeams,
        xpOverrides: parsedXpOverrides,
        gameDurationSeconds: duration,
        eventBadges: Array.isArray(parsedEventBadges) ? parsedEventBadges : [],
        awardedBadges: parsedAwardedBadges,
        votingEnabled: Boolean(raw.votingEnabled ?? raw.votingenabled ?? false),
        votingGameTypeIds: Array.isArray(parsedVotingGameTypeIds) ? parsedVotingGameTypeIds : [],
        gameTypeVotes: parsedGameTypeVotes,
        attendees: Array.isArray(parsedAttendees) ? parsedAttendees : [],
        liveStats: parsedLiveStats,
    };
}

/**
 * Normalizes a raw inventory item row from Supabase into a fully-typed InventoryItem object.
 * Robustly checks all pricing, rental, stock, and metadata column aliases so rental price updates never fallback.
 */
export function normalizeInventoryRow(raw: any): InventoryItem {
    if (!raw) return raw;
    const salePrice = Number(
        raw.salePrice ?? 
        raw.saleprice ?? 
        raw.sale_price ?? 
        raw.price ?? 
        raw.pricePerUnit ?? 
        raw.priceperunit ?? 
        raw.price_per_unit ?? 
        raw.rentalPrice ?? 
        raw.rentalprice ?? 
        raw.rental_price ?? 
        0
    ) || 0;
    const stock = Number(raw.stock ?? raw.quantity ?? 0) || 0;
    const rawIsRental = raw.isRental ?? raw.isrental ?? raw.is_rental;
    const isRental = rawIsRental !== undefined 
        ? Boolean(rawIsRental) 
        : (raw.name ? /rental/i.test(String(raw.name)) : false);
    const purchasePrice = Number(raw.purchasePrice ?? raw.purchaseprice ?? raw.purchase_price ?? 0) || 0;
    const reorderLevel = Number(raw.reorderLevel ?? raw.reorderlevel ?? raw.reorder_level ?? 0) || 0;
    const availableInShop = Boolean(
        raw.availableInShop ?? 
        raw.availableinshop ?? 
        raw.available_in_shop ?? 
        raw.inShop ?? 
        raw.inshop ?? 
        raw.in_shop ?? 
        false
    );

    return {
        ...raw,
        id: String(raw.id || ''),
        name: raw.name || '',
        category: raw.category || 'Gear',
        salePrice,
        pricePerUnit: salePrice,
        stock,
        quantity: stock,
        isRental,
        availableInShop,
        type: raw.type || 'Gear',
        condition: raw.condition || 'New',
        description: raw.description || '',
        supplierId: raw.supplierId || raw.supplierid || raw.supplier_id || '',
        sku: raw.sku || '',
        purchasePrice,
        reorderLevel,
        serialNumber: raw.serialNumber || raw.serialnumber || raw.serial_number || '',
        imageUrl: raw.imageUrl || raw.imageurl || raw.image_url || '',
    } as InventoryItem;
}

/**
 * Prepares a clean, Postgres/Supabase-compatible payload for writing to Supabase.
 * Supplies matching column aliases (camelCase and unquoted) and ensures JSON objects are formatted.
 */
export function prepareSupabasePayload(collectionName: string, item: any, liveRanks?: Rank[]): any {
    if (!item) return item;
    const payload = { ...item };

    if (collectionName === 'events') {
        const tc = Number(item.teamCount ?? item.teamcount ?? item.team_count ?? 2) || 2;
        const winner = item.winningTeamId || item.winningteamid || null;
        const gameFee = Number(item.gameFee ?? item.gamefee ?? item.price ?? 0) || 0;
        return {
            ...item,
            id: String(item.id),
            gameFee: gameFee,
            gamefee: gameFee,
            gearForRent: Array.isArray(item.gearForRent) ? item.gearForRent : (item.gearforrent || []),
            gearforrent: Array.isArray(item.gearForRent) ? item.gearForRent : (item.gearforrent || []),
            rentalPriceOverrides: item.rentalPriceOverrides || item.rentalpriceoverrides || {},
            rentalpriceoverrides: item.rentalPriceOverrides || item.rentalpriceoverrides || {},
            teamCount: tc,
            teamcount: tc,
            team_count: tc,
            winningTeamId: winner,
            winningteamid: winner,
            teams: item.teams || { alpha: [], bravo: [] },
            liveStats: item.liveStats || item.livestats || {},
            livestats: item.liveStats || item.livestats || {},
            eventBadges: Array.isArray(item.eventBadges) ? item.eventBadges : (item.eventbadges || []),
            eventbadges: Array.isArray(item.eventBadges) ? item.eventBadges : (item.eventbadges || []),
            awardedBadges: item.awardedBadges || item.awardedbadges || {},
            awardedbadges: item.awardedBadges || item.awardedbadges || {},
            attendees: Array.isArray(item.attendees) ? item.attendees : [],
            votingEnabled: !!(item.votingEnabled || item.votingenabled),
            votingenabled: !!(item.votingEnabled || item.votingenabled),
            votingGameTypeIds: Array.isArray(item.votingGameTypeIds) ? item.votingGameTypeIds : (item.votinggametypeids || []),
            votinggametypeids: Array.isArray(item.votingGameTypeIds) ? item.votingGameTypeIds : (item.votinggametypeids || []),
            gameTypeVotes: item.gameTypeVotes || item.gametypevotes || {},
            gametypevotes: item.gameTypeVotes || item.gametypevotes || {},
        };
    }

    if (collectionName === 'signups') {
        const requestedGear = Array.isArray(item.requestedGearIds) 
            ? item.requestedGearIds 
            : (Array.isArray(item.requestedgearids) ? item.requestedgearids : []);
        const note = item.note || item.operatorNote || item.operatornote || '';
        const eventId = String(item.eventId || item.eventid || '');
        const playerId = String(item.playerId || item.playerid || '');
        const votedGameTypeId = item.votedGameTypeId || item.votedgametypeid || '';
        const playerName = item.playerName || item.playername || '';
        const playerCallsign = item.playerCallsign || item.playercallsign || '';
        const playerCode = item.playerCode || item.playercode || '';
        const paymentStatus = item.paymentStatus || item.paymentstatus || 'Unpaid';
        const signedUpAt = item.signedUpAt || item.signedupat || new Date().toISOString();

        return {
            id: String(item.id || `${eventId}_${playerId}`),
            eventId,
            eventid: eventId,
            playerId,
            playerid: playerId,
            requestedGearIds: requestedGear,
            requestedgearids: requestedGear,
            note,
            operatorNote: note,
            operatornote: note,
            votedGameTypeId,
            votedgametypeid: votedGameTypeId,
            playerName,
            playername: playerName,
            playerCallsign,
            playercallsign: playerCallsign,
            playerCode,
            playercode: playerCode,
            paymentStatus,
            paymentstatus: paymentStatus,
            signedUpAt,
            signedupat: signedUpAt,
        };
    }

    if (collectionName === 'inventory') {
        const salePrice = Number(
            item.salePrice ?? 
            item.saleprice ?? 
            item.sale_price ?? 
            item.price ?? 
            item.pricePerUnit ?? 
            item.priceperunit ?? 
            item.price_per_unit ?? 
            item.rentalPrice ?? 
            item.rentalprice ?? 
            item.rental_price ?? 
            0
        ) || 0;
        const stock = Number(item.stock ?? item.quantity ?? 0) || 0;
        const rawIsRental = item.isRental ?? item.isrental ?? item.is_rental;
        const isRental = rawIsRental !== undefined 
            ? Boolean(rawIsRental) 
            : (item.name ? /rental/i.test(String(item.name)) : false);
        const purchasePrice = Number(item.purchasePrice ?? item.purchaseprice ?? item.purchase_price ?? 0) || 0;
        const reorderLevel = Number(item.reorderLevel ?? item.reorderlevel ?? item.reorder_level ?? 0) || 0;
        const supplierId = String(item.supplierId || item.supplierid || item.supplier_id || '');
        const serialNumber = String(item.serialNumber || item.serialnumber || item.serial_number || '');
        const imageUrl = String(item.imageUrl || item.imageurl || item.image_url || '');

        return {
            ...item,
            id: String(item.id),
            name: item.name || '',
            category: item.category || 'Gear',
            type: item.type || 'Gear',
            condition: item.condition || 'New',
            description: item.description || '',
            // Populate all price column aliases so Supabase saves regardless of column casing
            salePrice: salePrice,
            saleprice: salePrice,
            sale_price: salePrice,
            price: salePrice,
            pricePerUnit: salePrice,
            priceperunit: salePrice,
            price_per_unit: salePrice,
            rentalPrice: salePrice,
            rentalprice: salePrice,
            rental_price: salePrice,
            // Stock aliases
            stock: stock,
            quantity: stock,
            // Rental flag aliases
            isRental: isRental,
            isrental: isRental,
            is_rental: isRental,
            // Accounting & audit aliases
            purchasePrice: purchasePrice,
            purchaseprice: purchasePrice,
            purchase_price: purchasePrice,
            reorderLevel: reorderLevel,
            reorderlevel: reorderLevel,
            reorder_level: reorderLevel,
            // Supplier & metadata aliases
            supplierId: supplierId,
            supplierid: supplierId,
            supplier_id: supplierId,
            sku: item.sku || '',
            serialNumber: serialNumber,
            serialnumber: serialNumber,
            serial_number: serialNumber,
            imageUrl: imageUrl,
            imageurl: imageUrl,
            image_url: imageUrl,
            // Shop showcase & sales availability aliases
            availableInShop: Boolean(item.availableInShop),
            availableinshop: Boolean(item.availableInShop),
            available_in_shop: Boolean(item.availableInShop),
            inShop: Boolean(item.availableInShop),
            inshop: Boolean(item.availableInShop),
            in_shop: Boolean(item.availableInShop),
        };
    }

    if (collectionName === 'transactions') {
        const playerId = String(item.playerId || item.playerid || item.relatedPlayerId || item.relatedplayerid || '');
        const paymentMethod = String(item.paymentMethod || item.paymentmethod || item.payment_method || 'Cash');
        const receiptNumber = String(item.receiptNumber || item.receiptnumber || item.receipt_number || '');
        let items = item.items || [];
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
        }
        return {
            ...item,
            id: String(item.id),
            description: String(item.description || 'Transaction'),
            amount: Number(item.amount || 0),
            type: String(item.type || 'Retail Revenue'),
            date: String(item.date || new Date().toISOString()),
            playerId,
            playerid: playerId,
            relatedPlayerId: playerId,
            relatedplayerid: playerId,
            eventId: String(item.eventId || item.eventid || item.relatedEventId || ''),
            eventid: String(item.eventId || item.eventid || item.relatedEventId || ''),
            relatedEventId: String(item.eventId || item.eventid || item.relatedEventId || ''),
            status: String(item.status || 'completed'),
            paymentStatus: String(item.paymentStatus || 'Paid'),
            paymentMethod,
            paymentmethod: paymentMethod,
            payment_method: paymentMethod,
            receiptNumber,
            receiptnumber: receiptNumber,
            receipt_number: receiptNumber,
            items,
            subtotal: Number(item.subtotal ?? item.amount ?? 0),
            discount: Number(item.discount || 0),
            notes: String(item.notes || ''),
            cashierName: String(item.cashierName || item.cashiername || 'Admin'),
            cashiername: String(item.cashierName || item.cashiername || 'Admin'),
            customerName: String(item.customerName || item.customername || ''),
            customername: String(item.customerName || item.customername || ''),
            customerCallsign: String(item.customerCallsign || item.customercallsign || ''),
            customercallsign: String(item.customerCallsign || item.customercallsign || ''),
            customerCode: String(item.customerCode || item.customercode || ''),
            customercode: String(item.customerCode || item.customercode || ''),
            expenseName: String(item.expenseName || item.expensename || item.expense_name || ''),
            expensename: String(item.expenseName || item.expensename || item.expense_name || ''),
            expense_name: String(item.expenseName || item.expensename || item.expense_name || ''),
            expenseReason: String(item.expenseReason || item.expensereason || item.expense_reason || ''),
            expensereason: String(item.expenseReason || item.expensereason || item.expense_reason || ''),
            expense_reason: String(item.expenseReason || item.expensereason || item.expense_reason || ''),
            receiptImageUrl: String(item.receiptImageUrl || item.receiptimageurl || item.receipt_image_url || item.slipImageUrl || item.slipimageurl || item.slip_image_url || ''),
            receiptimageurl: String(item.receiptImageUrl || item.receiptimageurl || item.receipt_image_url || item.slipImageUrl || item.slipimageurl || item.slip_image_url || ''),
            receipt_image_url: String(item.receiptImageUrl || item.receiptimageurl || item.receipt_image_url || item.slipImageUrl || item.slipimageurl || item.slip_image_url || ''),
            category: String(item.category || (item.type === 'Expense' ? 'Business Expense' : '')),
            paidTo: String(item.paidTo || item.paidto || item.paid_to || item.vendor || ''),
            paidto: String(item.paidTo || item.paidto || item.paid_to || item.vendor || ''),
            paid_to: String(item.paidTo || item.paidto || item.paid_to || item.vendor || ''),
            profitMade: Number(item.profitMade ?? item.profitmade ?? item.profit_made ?? 0),
            profitmade: Number(item.profitMade ?? item.profitmade ?? item.profit_made ?? 0),
            profit_made: Number(item.profitMade ?? item.profitmade ?? item.profit_made ?? 0),
            profitName: String(item.profitName || item.profitname || item.profit_name || ''),
            profitname: String(item.profitName || item.profitname || item.profit_name || ''),
            profit_name: String(item.profitName || item.profitname || item.profit_name || ''),
            profitReason: String(item.profitReason || item.profitreason || item.profit_reason || ''),
            profitreason: String(item.profitReason || item.profitreason || item.profit_reason || ''),
            profit_reason: String(item.profitReason || item.profitreason || item.profit_reason || ''),
            profitDate: String(item.profitDate || item.profitdate || item.profit_date || ''),
            profitdate: String(item.profitDate || item.profitdate || item.profit_date || ''),
            profit_date: String(item.profitDate || item.profitdate || item.profit_date || ''),
        };
    }

    if (collectionName === 'gameTypes' || collectionName === 'game_types' || collectionName === 'gametypes') {
        const imageUrl = item.imageUrl || item.imageurl || '';
        const audioBriefingUrl = item.audioBriefingUrl || item.audiobriefingurl || '';
        const rulesFileUrl = item.rulesFileUrl || item.rulesfileurl || '';
        const gameplayMechanics = item.gameplayMechanics || item.gameplaymechanics || '';
        const participationXp = Number(item.participationXp ?? item.participationxp ?? 50) || 50;
        const gameDurationMinutes = Number(item.gameDurationMinutes ?? item.gamedurationminutes ?? 45) || 45;

        return {
            id: String(item.id),
            name: item.name || '',
            category: item.category || 'Scenario',
            description: item.description || '',
            rules: item.rules || '',
            gameplayMechanics: gameplayMechanics,
            gameplaymechanics: gameplayMechanics,
            rulesFileUrl: rulesFileUrl,
            rulesfileurl: rulesFileUrl,
            imageUrl: imageUrl,
            imageurl: imageUrl,
            audioBriefingUrl: audioBriefingUrl,
            audiobriefingurl: audioBriefingUrl,
            theme: item.theme || 'Standard',
            participationXp: participationXp,
            participationxp: participationXp,
            gameDurationMinutes: gameDurationMinutes,
            gamedurationminutes: gameDurationMinutes,
            lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0],
        };
    }

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

        let finalCode = (item.playerCode || item.playercode || item.player_code || '').trim();
        if (!finalCode || finalCode.toUpperCase() === 'NO-CODE') {
            finalCode = generatePlayerCodeFromName(item.name, item.surname, item.id);
        }
        finalCode = finalCode.toUpperCase();

        return {
            id: String(item.id),
            name: item.name || '',
            surname: item.surname || '',
            callsign: item.callsign || item.name || 'Operator',
            playerCode: finalCode,
            playercode: finalCode,
            player_code: finalCode,
            email: item.email || '',
            phone: item.phone || '',
            pin: String(item.pin || '000000'),
            age: Number(item.age || 18),
            idNumber: item.idNumber || item.idnumber || item.id_number || '',
            idnumber: item.idNumber || item.idnumber || item.id_number || '',
            id_number: item.idNumber || item.idnumber || item.id_number || '',
            role: item.role || 'player',
            status: item.status || 'Active',
            avatarUrl: item.avatarUrl || item.avatarurl || item.avatar_url || '',
            avatarurl: item.avatarUrl || item.avatarurl || item.avatar_url || '',
            avatar_url: item.avatarUrl || item.avatarurl || item.avatar_url || '',
            stats: stats,
            rank: calculatedRank,
            loadout: item.loadout || {},
            badges: Array.isArray(item.badges) ? item.badges : [],
            legendaryBadges: Array.isArray(item.legendaryBadges) ? item.legendaryBadges : (item.legendarybadges || item.legendary_badges || []),
            legendarybadges: Array.isArray(item.legendaryBadges) ? item.legendaryBadges : (item.legendarybadges || item.legendary_badges || []),
            legendary_badges: Array.isArray(item.legendaryBadges) ? item.legendaryBadges : (item.legendarybadges || item.legendary_badges || []),
            matchHistory: Array.isArray(item.matchHistory) ? item.matchHistory : (item.matchhistory || item.match_history || []),
            matchhistory: Array.isArray(item.matchHistory) ? item.matchHistory : (item.matchhistory || item.match_history || []),
            match_history: Array.isArray(item.matchHistory) ? item.matchHistory : (item.matchhistory || item.match_history || []),
            xpAdjustments: Array.isArray(item.xpAdjustments) ? item.xpAdjustments : (item.xpadjustments || item.xp_adjustments || []),
            xpadjustments: Array.isArray(item.xpAdjustments) ? item.xpAdjustments : (item.xpadjustments || item.xp_adjustments || []),
            xp_adjustments: Array.isArray(item.xpAdjustments) ? item.xpAdjustments : (item.xpadjustments || item.xp_adjustments || []),
            address: item.address || '',
            allergies: item.allergies || '',
            medicalNotes: item.medicalNotes || item.medicalnotes || item.medical_notes || '',
            medicalnotes: item.medicalNotes || item.medicalnotes || item.medical_notes || '',
            medical_notes: item.medicalNotes || item.medicalnotes || item.medical_notes || '',
            bio: item.bio || '',
            preferredRole: item.preferredRole || item.preferredrole || item.preferred_role || 'Assault',
            preferredrole: item.preferredRole || item.preferredrole || item.preferred_role || 'Assault',
            preferred_role: item.preferredRole || item.preferredrole || item.preferred_role || 'Assault',
            activeAuthUID: item.activeAuthUID || item.activeauthuid || item.active_auth_uid || '',
            activeauthuid: item.activeAuthUID || item.activeauthuid || item.active_auth_uid || '',
            active_auth_uid: item.activeAuthUID || item.activeauthuid || item.active_auth_uid || '',
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

    if (collectionName === 'legendaryBadges' || collectionName === 'legendarybadges' || collectionName === 'legendary_badges') {
        const id = String(item.id || `lb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
        const iconUrl = item.iconUrl || item.iconurl || item.icon_url || '';
        const howToObtain = item.howToObtain || item.howtoobtain || item.how_to_obtain || '';
        return {
            id,
            name: item.name || '',
            description: item.description || '',
            iconUrl: iconUrl,
            iconurl: iconUrl,
            icon_url: iconUrl,
            howToObtain: howToObtain,
            howtoobtain: howToObtain,
            how_to_obtain: howToObtain,
            updated_at: new Date().toISOString(),
        };
    }

    if (collectionName === 'badges') {
        const id = String(item.id || `badge_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
        const iconUrl = item.iconUrl || item.iconurl || item.icon_url || '';
        return {
            id,
            name: item.name || '',
            description: item.description || '',
            iconUrl: iconUrl,
            iconurl: iconUrl,
            criteria: item.criteria || {},
            updated_at: new Date().toISOString(),
        };
    }

    if (collectionName === 'raffles') {
        const id = String(item.id || `raffle_${Date.now()}`);
        const name = item.name || item.title || 'Tactical Raffle';
        const alwaysTop = Boolean(item.alwaysChooseMostTickets ?? item.alwayschoosemosttickets ?? false);
        const ticketPrice = Number(item.ticketPrice ?? item.ticketprice ?? 0) || 0;
        const totalTickets = Number(item.totalTickets ?? item.totaltickets ?? 100) || 100;
        const prizes = Array.isArray(item.prizes) ? item.prizes : [];
        const rawTickets = Array.isArray(item.tickets) ? item.tickets : (item.soldTickets || item.soldtickets || []);
        const tickets = rawTickets.map((t: any, idx: number) => ({
            id: String(t.id || `tkt_${Date.now()}_${idx}`),
            raffleId: String(t.raffleId || t.raffleid || id),
            code: String(t.code || `BT-RAF-${String(idx + 1).padStart(4, '0')}`),
            playerId: String(t.playerId || t.playerid || t.player_id || ''),
            playerid: String(t.playerId || t.playerid || t.player_id || ''),
            player_id: String(t.playerId || t.playerid || t.player_id || ''),
            playerName: t.playerName || t.playername || '',
            playerCallsign: t.playerCallsign || t.playercallsign || '',
            playerCode: t.playerCode || t.playercode || '',
            purchaseDate: t.purchaseDate || t.purchasedate || t.purchase_date || new Date().toISOString(),
            paymentStatus: t.paymentStatus || t.paymentstatus || 'Paid (Cash)',
        }));
        const rawWinners = Array.isArray(item.winners) ? item.winners : [];
        const winners = rawWinners.map((w: any) => ({
            ...w,
            playerId: String(w.playerId || w.playerid || w.player_id || ''),
            playerid: String(w.playerId || w.playerid || w.player_id || ''),
            prizeId: String(w.prizeId || w.prizeid || w.prize_id || ''),
            ticketId: String(w.ticketId || w.ticketid || w.ticket_id || ''),
        }));

        return {
            id,
            name: name,
            title: name,
            description: item.description || '',
            location: item.location || 'Main Tactical Arena',
            contactPhone: item.contactPhone || item.contactphone || '',
            contactphone: item.contactPhone || item.contactphone || '',
            ticketPrice: ticketPrice,
            ticketprice: ticketPrice,
            totalTickets: totalTickets,
            totaltickets: totalTickets,
            prizes: prizes,
            tickets: tickets,
            soldTickets: tickets,
            soldtickets: tickets,
            winners: winners,
            status: item.status || 'Upcoming',
            drawDate: item.drawDate || item.drawdate || '',
            drawdate: item.drawDate || item.drawdate || '',
            alwaysChooseMostTickets: alwaysTop,
            alwayschoosemosttickets: alwaysTop,
            createdAt: item.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    return payload;
}

export const LEGENDARY_BADGES_SQL = `-- =========================================================================
-- BOSJOL TACTICAL AIRSOFT - LEGENDARY BADGES LIVE SYNC POSTGRESQL SETUP
-- Run this in your Supabase SQL Editor (SQL Editor -> New query -> Paste -> Run)
-- Safe to run multiple times (idempotent)
-- =========================================================================

-- 1. Create the legendaryBadges table (supports case-preserved queries)
CREATE TABLE IF NOT EXISTS public."legendaryBadges" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    how_to_obtain TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the lowercase legendarybadges table (standard PostgREST lowercase fallback)
CREATE TABLE IF NOT EXISTS public.legendarybadges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    how_to_obtain TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the snake_case legendary_badges table fallback
CREATE TABLE IF NOT EXISTS public.legendary_badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    "iconUrl" TEXT DEFAULT '',
    iconurl TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    "howToObtain" TEXT DEFAULT '',
    howtoobtain TEXT DEFAULT '',
    how_to_obtain TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ensure all columns exist on tables if already created previously
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS "iconUrl" TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS iconurl TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS "howToObtain" TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS howtoobtain TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS how_to_obtain TEXT DEFAULT '';
ALTER TABLE public."legendaryBadges" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS "iconUrl" TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS iconurl TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS "howToObtain" TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS howtoobtain TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS how_to_obtain TEXT DEFAULT '';
ALTER TABLE public.legendarybadges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS "iconUrl" TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS iconurl TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS "howToObtain" TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS howtoobtain TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS how_to_obtain TEXT DEFAULT '';
ALTER TABLE public.legendary_badges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Ensure players table has the legendaryBadges columns to store awarded badges
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "legendaryBadges" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS legendarybadges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS legendary_badges JSONB DEFAULT '[]'::jsonb;

-- 6. Enable Row Level Security (RLS) & Grant full public access
ALTER TABLE public."legendaryBadges" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on legendaryBadges" ON public."legendaryBadges";
CREATE POLICY "Allow public full access on legendaryBadges" ON public."legendaryBadges" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.legendarybadges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on legendarybadges" ON public.legendarybadges;
CREATE POLICY "Allow public full access on legendarybadges" ON public.legendarybadges FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.legendary_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on legendary_badges" ON public.legendary_badges;
CREATE POLICY "Allow public full access on legendary_badges" ON public.legendary_badges FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON TABLE public."legendaryBadges" TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.legendarybadges TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.legendary_badges TO anon, authenticated, service_role;

-- 7. Enable Realtime Replication for instant live sync across devices
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public."legendaryBadges";
    EXCEPTION WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.legendarybadges;
    EXCEPTION WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.legendary_badges;
    EXCEPTION WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
    END;
END $$;
`;

export const PLAYER_LOGIN_CODE_SQL = `-- =========================================================================
-- BOSJOL TACTICAL AIRSOFT - PLAYER LOGIN CODE FIX & AUTOMATION SCRIPT
-- Run this in your Supabase SQL Editor (SQL Editor -> New query -> Paste -> Run)
-- Safe to run multiple times (idempotent)
-- =========================================================================

-- 1. Ensure all player code columns exist on public.players table
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS "playerCode" TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS playercode TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS player_code TEXT DEFAULT '';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '000000';

-- 2. Create PostgreSQL helper function to generate player code from Name & Surname
CREATE OR REPLACE FUNCTION public.generate_player_code(p_name TEXT, p_surname TEXT, p_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_clean_name TEXT;
    v_clean_surname TEXT;
    v_prefix TEXT;
    v_candidate TEXT;
    v_counter INT := 1;
BEGIN
    v_clean_name := UPPER(REGEXP_REPLACE(COALESCE(TRIM(p_name), ''), '[^a-zA-Z0-9]', '', 'g'));
    v_clean_surname := UPPER(REGEXP_REPLACE(COALESCE(TRIM(p_surname), ''), '[^a-zA-Z0-9]', '', 'g'));

    IF LENGTH(v_clean_name) >= 1 AND LENGTH(v_clean_surname) >= 1 THEN
        v_prefix := SUBSTRING(v_clean_name FROM 1 FOR 1) || SUBSTRING(v_clean_surname FROM 1 FOR 1);
    ELSIF LENGTH(v_clean_name) >= 2 THEN
        v_prefix := SUBSTRING(v_clean_name FROM 1 FOR 2);
    ELSIF LENGTH(v_clean_name) = 1 THEN
        v_prefix := v_clean_name || 'X';
    ELSE
        v_prefix := 'OP';
    END IF;

    -- Ensure prefix is exactly 2 letters
    IF LENGTH(v_prefix) < 2 THEN
        v_prefix := RPAD(v_prefix, 2, 'X');
    END IF;

    -- Find next available sequential number that is not taken by another player
    LOOP
        v_candidate := v_prefix || LPAD(v_counter::TEXT, 2, '0');
        IF NOT EXISTS (
            SELECT 1 FROM public.players
            WHERE id <> COALESCE(p_id, '')
              AND (
                UPPER(COALESCE("playerCode", '')) = v_candidate
                OR UPPER(COALESCE(playercode, '')) = v_candidate
                OR UPPER(COALESCE(player_code, '')) = v_candidate
              )
        ) THEN
            RETURN v_candidate;
        END IF;
        v_counter := v_counter + 1;
        EXIT WHEN v_counter > 99;
    END LOOP;

    RETURN v_candidate;
END;
$$;

-- 3. Update ALL existing player rows that currently have NULL, blank, or 'NO-CODE'
DO $$
DECLARE
    r RECORD;
    v_new_code TEXT;
BEGIN
    FOR r IN (
        SELECT id, name, surname, "playerCode", playercode, player_code
        FROM public.players
        WHERE "playerCode" IS NULL OR TRIM("playerCode") = '' OR UPPER(TRIM("playerCode")) = 'NO-CODE'
           OR playercode IS NULL OR TRIM(playercode) = '' OR UPPER(TRIM(playercode)) = 'NO-CODE'
           OR player_code IS NULL OR TRIM(player_code) = '' OR UPPER(TRIM(player_code)) = 'NO-CODE'
        ORDER BY created_at ASC NULLS LAST, id ASC
    ) LOOP
        v_new_code := public.generate_player_code(r.name, r.surname, r.id);
        
        UPDATE public.players
        SET "playerCode" = v_new_code,
            playercode = v_new_code,
            player_code = v_new_code,
            updated_at = NOW()
        WHERE id = r.id;
    END LOOP;
END $$;

-- 4. Automatically synchronize all playerCode column variations for all existing players
UPDATE public.players
SET 
    "playerCode" = UPPER(TRIM(COALESCE(NULLIF("playerCode", ''), NULLIF(playercode, ''), NULLIF(player_code, '')))),
    playercode = UPPER(TRIM(COALESCE(NULLIF(playercode, ''), NULLIF("playerCode", ''), NULLIF(player_code, '')))),
    player_code = UPPER(TRIM(COALESCE(NULLIF(player_code, ''), NULLIF("playerCode", ''), NULLIF(playercode, ''))))
WHERE "playerCode" IS NOT NULL AND "playerCode" <> '';

-- 5. Trigger function: Auto-generate player code on INSERT / UPDATE if missing or 'NO-CODE'
CREATE OR REPLACE FUNCTION public.fn_auto_generate_player_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_code TEXT;
BEGIN
    v_code := COALESCE(NULLIF(TRIM(NEW."playerCode"), ''), NULLIF(TRIM(NEW.playercode), ''), NULLIF(TRIM(NEW.player_code), ''));

    IF v_code IS NULL OR UPPER(v_code) = 'NO-CODE' THEN
        v_code := public.generate_player_code(NEW.name, NEW.surname, NEW.id);
    ELSE
        v_code := UPPER(v_code);
    END IF;

    NEW."playerCode" := v_code;
    NEW.playercode := v_code;
    NEW.player_code := v_code;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_player_code ON public.players;
CREATE TRIGGER trg_ensure_player_code
BEFORE INSERT OR UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.fn_auto_generate_player_code();

-- 6. Indexes for ultra-fast, case-insensitive player login
CREATE INDEX IF NOT EXISTS idx_players_playercode_upper ON public.players (UPPER("playerCode"));
CREATE INDEX IF NOT EXISTS idx_players_playercode_lower ON public.players (LOWER(playercode));
CREATE INDEX IF NOT EXISTS idx_players_pin ON public.players (pin);

-- 7. Ensure Row Level Security (RLS) allows login verification queries
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and login on players" ON public.players;
CREATE POLICY "Allow public read and login on players" ON public.players FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.players TO anon, authenticated, service_role;
`;

export const RAFFLES_SQL_SCHEMA_MIGRATION = `-- =========================================================================
-- BOSJOL TACTICAL AIRSOFT - RAFFLE SYSTEM & MULTI-WINNER SQL MIGRATION
-- Run this in your Supabase SQL Editor (SQL Editor -> New query -> Paste -> Run)
-- Supports: Multiple Winners, Ordered Prizes (1st, 2nd, 3rd, 4th, etc.), Top-Ticket Priority, and Live Realtime Sync
-- =========================================================================

-- 1. Create or ensure raffles table exists
CREATE TABLE IF NOT EXISTS public.raffles (
    id TEXT PRIMARY KEY,
    name TEXT,
    title TEXT,
    location TEXT DEFAULT 'Main Tactical Arena',
    "contactPhone" TEXT DEFAULT '',
    contactphone TEXT DEFAULT '',
    description TEXT DEFAULT '',
    "ticketPrice" NUMERIC DEFAULT 0,
    ticketprice NUMERIC DEFAULT 0,
    "totalTickets" NUMERIC DEFAULT 100,
    totaltickets NUMERIC DEFAULT 100,
    tickets JSONB DEFAULT '[]'::jsonb,
    "soldTickets" JSONB DEFAULT '[]'::jsonb,
    soldtickets JSONB DEFAULT '[]'::jsonb,
    winners JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Upcoming',
    "drawDate" TEXT,
    drawdate TEXT,
    prizes JSONB DEFAULT '[]'::jsonb,
    "alwaysChooseMostTickets" BOOLEAN DEFAULT FALSE,
    alwayschoosemosttickets BOOLEAN DEFAULT FALSE,
    "createdAt" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns if table already existed (idempotent migration)
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Main Tactical Arena';
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "contactPhone" TEXT DEFAULT '';
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS contactphone TEXT DEFAULT '';
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "ticketPrice" NUMERIC DEFAULT 0;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS ticketprice NUMERIC DEFAULT 0;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "totalTickets" NUMERIC DEFAULT 100;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS totaltickets NUMERIC DEFAULT 100;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS tickets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "soldTickets" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS soldtickets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS winners JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Upcoming';
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "drawDate" TEXT;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS drawdate TEXT;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS prizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "alwaysChooseMostTickets" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS alwayschoosemosttickets BOOLEAN DEFAULT FALSE;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Row Level Security & Permissions
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write on raffles" ON public.raffles;
CREATE POLICY "Allow public read and write on raffles" ON public.raffles FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.raffles TO anon, authenticated, service_role;

-- 4. Enable Full Replica Identity for instant Realtime Broadcasts
ALTER TABLE public.raffles REPLICA IDENTITY FULL;

-- 5. Add to Supabase Realtime Publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.raffles;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- 6. Optional Relational raffle_tickets Table (for normalized queries and player ticket auditing)
CREATE TABLE IF NOT EXISTS public.raffle_tickets (
    id TEXT PRIMARY KEY,
    raffle_id TEXT REFERENCES public.raffles(id) ON DELETE CASCADE,
    player_id TEXT,
    player_code TEXT DEFAULT '',
    player_name TEXT DEFAULT '',
    code TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Paid (Cash)',
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.raffle_tickets ADD COLUMN IF NOT EXISTS player_code TEXT DEFAULT '';
ALTER TABLE public.raffle_tickets ADD COLUMN IF NOT EXISTS player_name TEXT DEFAULT '';
ALTER TABLE public.raffle_tickets ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Paid (Cash)';
ALTER TABLE public.raffle_tickets ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_raffle_tickets_player_id ON public.raffle_tickets(player_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_player_code ON public.raffle_tickets(player_code);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle_id ON public.raffle_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_code ON public.raffle_tickets(code);

ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write on raffle_tickets" ON public.raffle_tickets;
CREATE POLICY "Allow public read and write on raffle_tickets" ON public.raffle_tickets FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.raffle_tickets TO anon, authenticated, service_role;

-- 7. PostgreSQL Stored Procedure: Atomically issue tickets to player in JSONB array
CREATE OR REPLACE FUNCTION public.issue_raffle_tickets(
    p_raffle_id TEXT,
    p_player_id TEXT,
    p_quantity INT DEFAULT 1,
    p_payment_status TEXT DEFAULT 'Paid (Cash)'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_raffle RECORD;
    v_player RECORD;
    v_tickets JSONB;
    v_current_count INT;
    v_new_tickets JSONB := '[]'::jsonb;
    v_i INT;
    v_code TEXT;
    v_ticket_obj JSONB;
    v_ticket_id TEXT;
    v_now TEXT := TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
BEGIN
    -- 1. Verify raffle exists
    SELECT * INTO v_raffle FROM public.raffles WHERE id = p_raffle_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Raffle with ID % not found', p_raffle_id;
    END IF;

    -- 2. Verify player exists: support matching by id, UUID, or playerCode/playercode
    SELECT * INTO v_player FROM public.players 
    WHERE id::text = p_player_id 
       OR COALESCE("playerCode", playercode, '') = p_player_id
       OR LOWER(COALESCE("playerCode", playercode, '')) = LOWER(p_player_id)
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player with ID or Code % not found in database', p_player_id;
    END IF;

    -- 3. Get current tickets array
    v_tickets := COALESCE(v_raffle.tickets, v_raffle.soldtickets, '[]'::jsonb);
    v_current_count := jsonb_array_length(v_tickets);

    -- 4. Generate requested quantity of tickets assigned directly to the chosen player
    FOR v_i IN 1..p_quantity LOOP
        v_code := 'BT-RAF-' || LPAD((v_current_count + v_i)::TEXT, 4, '0');
        v_ticket_id := 'tkt_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || v_i || '_' || FLOOR(RANDOM()*10000)::INT;
        v_ticket_obj := jsonb_build_object(
            'id', v_ticket_id,
            'raffleId', p_raffle_id,
            'code', v_code,
            'playerId', v_player.id::TEXT,
            'playerid', v_player.id::TEXT,
            'player_id', v_player.id::TEXT,
            'playerName', TRIM(COALESCE(v_player.name, '') || ' ' || COALESCE(v_player.surname, '')),
            'playerCallsign', COALESCE(v_player.callsign, ''),
            'playerCode', COALESCE(v_player."playerCode", v_player.playercode, ''),
            'purchaseDate', v_now,
            'paymentStatus', p_payment_status
        );
        v_tickets := v_tickets || jsonb_build_array(v_ticket_obj);
        v_new_tickets := v_new_tickets || jsonb_build_array(v_ticket_obj);

        -- Also record into relational table if present
        BEGIN
            INSERT INTO public.raffle_tickets (id, raffle_id, player_id, player_code, player_name, code, payment_status, purchase_date)
            VALUES (
                v_ticket_id,
                p_raffle_id,
                v_player.id::TEXT,
                COALESCE(v_player."playerCode", v_player.playercode, ''),
                TRIM(COALESCE(v_player.name, '') || ' ' || COALESCE(v_player.surname, '')),
                v_code,
                p_payment_status,
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;

    -- 5. Update raffle record
    UPDATE public.raffles
    SET tickets = v_tickets,
        "soldTickets" = v_tickets,
        soldtickets = v_tickets,
        status = CASE WHEN status = 'Upcoming' THEN 'Active' ELSE status END,
        updated_at = NOW()
    WHERE id = p_raffle_id;

    RETURN v_new_tickets;
END;
$$;

-- 8. Helper function: Get all raffle tickets held by a player (supports id or playerCode)
CREATE OR REPLACE FUNCTION public.get_player_raffle_tickets(p_player_id TEXT)
RETURNS TABLE (
    raffle_id TEXT,
    raffle_name TEXT,
    raffle_status TEXT,
    ticket_id TEXT,
    ticket_code TEXT,
    purchase_date TEXT,
    payment_status TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        r.id AS raffle_id,
        COALESCE(r.name, r.title, 'Raffle') AS raffle_name,
        r.status AS raffle_status,
        t->>'id' AS ticket_id,
        t->>'code' AS ticket_code,
        t->>'purchaseDate' AS purchase_date,
        t->>'paymentStatus' AS payment_status
    FROM public.raffles r,
         jsonb_array_elements(COALESCE(r.tickets, '[]'::jsonb)) AS t
    WHERE t->>'playerId' = p_player_id
       OR t->>'playerid' = p_player_id
       OR t->>'player_id' = p_player_id
       OR LOWER(COALESCE(t->>'playerCode', '')) = LOWER(p_player_id)
       OR LOWER(COALESCE(t->>'playercode', '')) = LOWER(p_player_id)
    ORDER BY r.drawdate DESC NULLS LAST;
$$;
`;

export const INVENTORY_SQL_SCHEMA_MIGRATION = `-- =========================================================================
-- BOSJOL TACTICAL AIRSOFT - INVENTORY & RENTAL PRICING LIVE SYNC SQL FIX
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- Ensures rental prices, quantities, and stock save permanently and sync live.
-- =========================================================================

-- 1. Create table if not exists with primary pricing columns
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Gear',
    quantity NUMERIC DEFAULT 0,
    stock NUMERIC DEFAULT 0,
    "pricePerUnit" NUMERIC DEFAULT 0,
    priceperunit NUMERIC DEFAULT 0,
    price_per_unit NUMERIC DEFAULT 0,
    "salePrice" NUMERIC DEFAULT 0,
    saleprice NUMERIC DEFAULT 0,
    sale_price NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    "rentalPrice" NUMERIC DEFAULT 0,
    rentalprice NUMERIC DEFAULT 0,
    rental_price NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Gear',
    "isRental" BOOLEAN DEFAULT false,
    isrental BOOLEAN DEFAULT false,
    is_rental BOOLEAN DEFAULT false,
    description TEXT DEFAULT '',
    condition TEXT DEFAULT 'New',
    "serialNumber" TEXT DEFAULT '',
    serialnumber TEXT DEFAULT '',
    serial_number TEXT DEFAULT '',
    "supplierId" TEXT,
    supplierid TEXT,
    supplier_id TEXT,
    status TEXT DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add all missing price and rental column variants safely (Idempotent)
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "salePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS saleprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "pricePerUnit" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS priceperunit NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "rentalPrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS rentalprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS rental_price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS stock NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Gear';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "isRental" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS isrental BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS is_rental BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "serialNumber" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS serialnumber TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS serial_number TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "purchaseDate" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchasedate TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "lastServiceDate" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS lastservicedate TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "purchasePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchaseprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "reorderLevel" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorderlevel NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorder_level NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "supplierId" TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS supplierid TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS supplier_id TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS warrantyinfo TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "availableInShop" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS availableinshop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS available_in_shop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "inShop" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS inshop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS in_shop BOOLEAN DEFAULT false;

-- 3. Row Level Security & Permissions (Fixes silent write rejections)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on inventory" ON public.inventory;
CREATE POLICY "Allow public full access on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.inventory TO anon, authenticated, service_role;

-- 4. Enable Full Replica Identity for instant Realtime sync
ALTER TABLE public.inventory REPLICA IDENTITY FULL;

-- 5. Add to Realtime Publication so changes broadcast across devices
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;
`;

export const SHOP_AND_EXPENSES_SQL_SCHEMA = `-- =========================================================================
-- BOSJOL TACTICAL: SHOP SHOWCASE, POINT-OF-SALE & PLAYER EXPENSES MIGRATION
-- Run this idempotent script in the Supabase SQL Editor to enable all
-- Tactical Shop, POS Cart Checkout, and Player Expense features.
-- =========================================================================

-- 1. Ensure Inventory table exists with Shop availability and Product Image
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Gear',
    quantity NUMERIC DEFAULT 0,
    stock NUMERIC DEFAULT 0,
    "salePrice" NUMERIC DEFAULT 0,
    saleprice NUMERIC DEFAULT 0,
    "pricePerUnit" NUMERIC DEFAULT 0,
    priceperunit NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    "rentalPrice" NUMERIC DEFAULT 0,
    rentalprice NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Gear',
    "isRental" BOOLEAN DEFAULT false,
    isrental BOOLEAN DEFAULT false,
    "availableInShop" BOOLEAN DEFAULT false,
    availableinshop BOOLEAN DEFAULT false,
    available_in_shop BOOLEAN DEFAULT false,
    "inShop" BOOLEAN DEFAULT false,
    description TEXT DEFAULT '',
    condition TEXT DEFAULT 'New',
    "serialNumber" TEXT DEFAULT '',
    serialnumber TEXT DEFAULT '',
    sku TEXT DEFAULT '',
    "imageUrl" TEXT DEFAULT '',
    imageurl TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    "supplierId" TEXT,
    supplierid TEXT,
    status TEXT DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for inventory shop showcase
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "availableInShop" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS availableinshop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS available_in_shop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "inShop" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS inshop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS in_shop BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "salePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS saleprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS stock NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 0;

-- 2. Ensure Transactions table exists with POS & Player Expense fields
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Retail Revenue',
    date TEXT DEFAULT '',
    "playerId" TEXT,
    playerid TEXT,
    "eventId" TEXT,
    eventid TEXT,
    status TEXT DEFAULT 'completed',
    "paymentMethod" TEXT DEFAULT 'Cash',
    paymentmethod TEXT DEFAULT 'Cash',
    payment_method TEXT DEFAULT 'Cash',
    "receiptNumber" TEXT,
    receiptnumber TEXT,
    receipt_number TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    "cashierName" TEXT DEFAULT 'Admin',
    cashiername TEXT DEFAULT 'Admin',
    "customerName" TEXT DEFAULT '',
    customername TEXT DEFAULT '',
    "customerCallsign" TEXT DEFAULT '',
    customercallsign TEXT DEFAULT '',
    "customerCode" TEXT DEFAULT '',
    customercode TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for transactions / sales / expenses
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paymentmethod TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "receiptNumber" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receiptnumber TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "cashierName" TEXT DEFAULT 'Admin';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cashiername TEXT DEFAULT 'Admin';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "customerName" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customername TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "customerCallsign" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customercallsign TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "customerCode" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customercode TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "playerId" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS playerid TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "expenseName" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expensename TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expense_name TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "expenseReason" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expensereason TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expense_reason TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "receiptImageUrl" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receiptimageurl TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_image_url TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Business Expense';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Business Expense';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paidTo" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paidto TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paid_to TEXT DEFAULT '';

-- 3. Row Level Security & Permissions
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on inventory" ON public.inventory;
CREATE POLICY "Allow public full access on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.inventory TO anon, authenticated, service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on transactions" ON public.transactions;
CREATE POLICY "Allow public full access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;

-- 4. Enable Full Replica Identity for instant live Realtime sync
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- 5. Add to Realtime Publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;
`;

export const BUSINESS_EXPENSES_SQL_SCHEMA = `-- =========================================================================
-- BOSJOL TACTICAL: BUSINESS EXPENSES & SLIP UPLOADS LIVE SYNC MIGRATION
-- Run this idempotent script in the Supabase SQL Editor to enable full
-- business expense tracking, receipt/slip photo storage, and live sync.
-- =========================================================================

-- 1. Ensure transactions table exists with all standard and expense fields
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Expense',
    date TEXT DEFAULT '',
    "playerId" TEXT,
    playerid TEXT,
    "eventId" TEXT,
    eventid TEXT,
    status TEXT DEFAULT 'completed',
    "paymentStatus" TEXT DEFAULT 'Paid',
    paymentstatus TEXT DEFAULT 'Paid',
    "paymentMethod" TEXT DEFAULT 'Cash',
    paymentmethod TEXT DEFAULT 'Cash',
    payment_method TEXT DEFAULT 'Cash',
    "receiptNumber" TEXT,
    receiptnumber TEXT,
    receipt_number TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    "cashierName" TEXT DEFAULT 'Admin',
    cashiername TEXT DEFAULT 'Admin',
    "customerName" TEXT DEFAULT '',
    customername TEXT DEFAULT '',
    "customerCallsign" TEXT DEFAULT '',
    customercallsign TEXT DEFAULT '',
    "customerCode" TEXT DEFAULT '',
    customercode TEXT DEFAULT '',
    "expenseName" TEXT DEFAULT '',
    expensename TEXT DEFAULT '',
    expense_name TEXT DEFAULT '',
    "expenseReason" TEXT DEFAULT '',
    expensereason TEXT DEFAULT '',
    expense_reason TEXT DEFAULT '',
    "receiptImageUrl" TEXT DEFAULT '',
    receiptimageurl TEXT DEFAULT '',
    receipt_image_url TEXT DEFAULT '',
    category TEXT DEFAULT 'Business Expense',
    "paidTo" TEXT DEFAULT '',
    paidto TEXT DEFAULT '',
    paid_to TEXT DEFAULT '',
    "profitMade" NUMERIC DEFAULT 0,
    profitmade NUMERIC DEFAULT 0,
    profit_made NUMERIC DEFAULT 0,
    "profitName" TEXT DEFAULT '',
    profitname TEXT DEFAULT '',
    profit_name TEXT DEFAULT '',
    "profitReason" TEXT DEFAULT '',
    profitreason TEXT DEFAULT '',
    profit_reason TEXT DEFAULT '',
    "profitDate" TEXT DEFAULT '',
    profitdate TEXT DEFAULT '',
    profit_date TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Idempotently add any missing business expense columns (both quoted and unquoted)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "expenseName" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expensename TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expense_name TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "expenseReason" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expensereason TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expense_reason TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "receiptImageUrl" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receiptimageurl TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_image_url TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Business Expense';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Business Expense';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paidTo" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paidto TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paid_to TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "profitMade" NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profitmade NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profit_made NUMERIC DEFAULT 0;

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "profitName" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profitname TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profit_name TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "profitReason" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profitreason TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profit_reason TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "profitDate" TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profitdate TEXT DEFAULT '';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profit_date TEXT DEFAULT '';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paymentmethod TEXT DEFAULT 'Cash';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'Paid';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paymentstatus TEXT DEFAULT 'Paid';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 3. Row Level Security & Open Access Policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on transactions" ON public.transactions;
CREATE POLICY "Allow public full access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;

-- 4. Enable Full Replica Identity for Realtime Event Payloads
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- 5. Ensure Table is Included in Supabase Realtime Publication Channel
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;
`;





