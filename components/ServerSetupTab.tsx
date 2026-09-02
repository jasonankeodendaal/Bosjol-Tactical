
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, CloudArrowDownIcon } from './icons/Icons';
import { Button } from './Button';

const CodeBlock: React.FC<{ children: React.ReactNode, title?: string, language?: string }> = ({ children, title, language = 'bash' }) => {
    const [copyStatus, setCopyStatus] = useState('Copy');

    const handleCopy = () => {
        if (typeof children === 'string') {
            navigator.clipboard.writeText(children.trim());
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }
    };
    
    return (
        <div className="bg-zinc-950 rounded-lg border border-zinc-800 my-3 shadow-inner">
             {title && (
                <div className="px-4 py-2 border-b border-zinc-800 text-xs text-gray-400 font-mono bg-zinc-900/50 rounded-t-lg flex justify-between items-center">
                    <span>{title}</span>
                    <span className="text-zinc-600">{language}</span>
                </div>
            )}
            <div className="relative p-4 group">
                 <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                    <code className={`language-${language}`}>
                        {children}
                    </code>
                </pre>
                <button
                    className="absolute top-3 right-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    onClick={handleCopy}
                >
                    {copyStatus}
                </button>
            </div>
        </div>
    );
};

const TipBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-blue-900/20 border border-blue-800/50 p-3 rounded-md flex gap-3 text-sm text-blue-200 my-3">
        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{children}</div>
    </div>
);

const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-amber-900/20 border border-amber-800/50 p-3 rounded-md flex gap-3 text-sm text-amber-200 my-3">
        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{children}</div>
    </div>
);

const StepCard: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden"
        >
            <header className="flex items-center p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-lg mr-4 flex-shrink-0 shadow-lg shadow-red-900/50">{number}</div>
                <h3 className="font-bold text-lg tracking-wide text-gray-100">{title}</h3>
            </header>
            <div className="p-5 text-gray-300 text-sm space-y-4 leading-relaxed">
                {children}
            </div>
        </motion.div>
    );
};

export const ServerSetupTab: React.FC = () => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <DashboardCard title="Cloud Deployment Guide: Supabase + Vercel" icon={<CloudArrowDownIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8 text-gray-300">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-xl border border-zinc-800">
                        <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
                        <p className="text-gray-400 mb-4">
                            This guide details how to deploy your tactical dashboard to the web for free using industry-standard tools. 
                            You will use <strong>Supabase</strong> for your database and authentication, and <strong>Vercel</strong> to host the website.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-green-400 mb-1">Cost</span>
                                Free Tiers Available
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-blue-400 mb-1">Tech Stack</span>
                                React, PostgreSQL
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-amber-400 mb-1">Difficulty</span>
                                Beginner Friendly
                            </div>
                        </div>
                    </div>

                    <StepCard number={1} title="Prepare Your Code (GitHub)">
                        <p>Before deploying, your code needs to be hosted on GitHub. If you haven't done this yet:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Create a <strong>GitHub Account</strong> if you don't have one.</li>
                            <li>Create a <strong>New Repository</strong> named <code>bosjol-tactical</code> (or similar).</li>
                            <li>Upload your project files to this repository.</li>
                        </ol>
                        <TipBox>
                            Ensure your repository is <strong>Private</strong> if you don't want the world to see your code, or <strong>Public</strong> if you want to share it. Vercel works with both.
                        </TipBox>
                    </StepCard>

                    <StepCard number={2} title="Setup Database (Supabase)">
                        <p>Supabase will act as your backend, storing player data, events, and handling logins.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>Go to <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">supabase.com</a> and sign up.</li>
                            <li>Click <strong>"New Project"</strong>. Give it a name and a strong database password (save this password!).</li>
                            <li>Select a region closest to you (e.g., Cape Town or London) for best speed.</li>
                            <li>Wait for the database to provision (takes ~2 minutes).</li>
                            <li><strong>Get API Keys:</strong>
                                <ul className="list-disc list-inside ml-6 mt-2 text-gray-400 text-xs space-y-1">
                                    <li>Go to <strong>Project Settings</strong> (Cog icon at bottom left).</li>
                                    <li>Click <strong>API</strong>.</li>
                                    <li>Copy the <strong>Project URL</strong>.</li>
                                    <li>Copy the <strong>anon public</strong> Key.</li>
                                    <li><span className="text-red-400">Keep these tabs open, you will need them for Vercel.</span></li>
                                </ul>
                            </li>
                        </ol>
                        <TipBox>
                            <strong>Live Updates & Schema Sync:</strong> If you already have an existing Supabase database or want to ensure all new features (Equipment Rentals, Sign-up Gear, Custom Fees, Game Voting, and Realtime Sync) work 100% live without permission errors, run this idempotent SQL migration snippet in your <strong>Supabase SQL Editor</strong>:
                        </TipBox>
                        <CodeBlock title="Supabase SQL Editor - Live Features & Migration Snippet" language="sql">
{`-- =========================================================================
-- BOSJOL TACTICAL - LIVE DATABASE UPDATE & MIGRATION SNIPPET FOR SUPABASE
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- Safe & idempotent: Adds missing columns and permissions without deleting existing data.
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. EVENTS TABLE (Rentals, Fees, Voting, Teams, Live Stats)
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
    "gameFee" NUMERIC DEFAULT 0,
    gamefee NUMERIC DEFAULT 0,
    "gearForRent" JSONB DEFAULT '[]'::jsonb,
    gearforrent JSONB DEFAULT '[]'::jsonb,
    "rentalPriceOverrides" JSONB DEFAULT '{}'::jsonb,
    rentalpriceoverrides JSONB DEFAULT '{}'::jsonb,
    "maxParticipants" NUMERIC DEFAULT 50,
    maxparticipants NUMERIC DEFAULT 50,
    attendees JSONB DEFAULT '[]'::jsonb,
    "gameType" JSONB DEFAULT '{}'::jsonb,
    gametype JSONB DEFAULT '{}'::jsonb,
    "gameTypeId" TEXT DEFAULT '',
    gametypeid TEXT DEFAULT '',
    game_type_id TEXT DEFAULT '',
    "teamCount" NUMERIC DEFAULT 2,
    teamcount NUMERIC DEFAULT 2,
    team_count NUMERIC DEFAULT 2,
    teams JSONB DEFAULT '{"alpha":[], "bravo":[]}'::jsonb,
    "winningTeamId" TEXT DEFAULT '',
    winningteamid TEXT DEFAULT '',
    "liveStats" JSONB DEFAULT '{}'::jsonb,
    livestats JSONB DEFAULT '{}'::jsonb,
    "votingEnabled" BOOLEAN DEFAULT false,
    votingenabled BOOLEAN DEFAULT false,
    "votingGameTypeIds" JSONB DEFAULT '[]'::jsonb,
    votinggametypeids JSONB DEFAULT '[]'::jsonb,
    "gameTypeVotes" JSONB DEFAULT '{}'::jsonb,
    gametypevotes JSONB DEFAULT '{}'::jsonb,
    scenarios JSONB DEFAULT '[]'::jsonb,
    "imageUrl" TEXT DEFAULT '',
    imageurl TEXT DEFAULT '',
    "audioBriefingUrl" TEXT DEFAULT '',
    audiobriefingurl TEXT DEFAULT '',
    rules TEXT DEFAULT '',
    theme TEXT DEFAULT 'Standard',
    "participationXp" NUMERIC DEFAULT 50,
    participationxp NUMERIC DEFAULT 50,
    "winXpAward" NUMERIC DEFAULT 100,
    winxpaward NUMERIC DEFAULT 100,
    "gameDurationSeconds" NUMERIC DEFAULT 2700,
    gamedurationseconds NUMERIC DEFAULT 2700,
    "eventBadges" JSONB DEFAULT '[]'::jsonb,
    eventbadges JSONB DEFAULT '[]'::jsonb,
    "awardedBadges" JSONB DEFAULT '{}'::jsonb,
    awardedbadges JSONB DEFAULT '{}'::jsonb,
    "xpOverrides" JSONB DEFAULT '{}'::jsonb,
    xpoverrides JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all event columns exist on existing tables
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameFee" NUMERIC DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gamefee NUMERIC DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gearForRent" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gearforrent JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "rentalPriceOverrides" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rentalpriceoverrides JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameTypeId" TEXT DEFAULT '';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gametypeid TEXT DEFAULT '';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS game_type_id TEXT DEFAULT '';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "teamCount" NUMERIC DEFAULT 2;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS teamcount NUMERIC DEFAULT 2;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_count NUMERIC DEFAULT 2;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS teams JSONB DEFAULT '{"alpha":[], "bravo":[]}'::jsonb;
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

-- 3. SIGNUPS TABLE (Requested Gear, Notes, Game Votes)
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

-- 4. INVENTORY TABLE (Rental & Sale Pricing, Stock, Condition)
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Gear',
    quantity NUMERIC DEFAULT 0,
    stock NUMERIC DEFAULT 0,
    "pricePerUnit" NUMERIC DEFAULT 0,
    priceperunit NUMERIC DEFAULT 0,
    "salePrice" NUMERIC DEFAULT 0,
    saleprice NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Gear',
    "isRental" BOOLEAN DEFAULT false,
    isrental BOOLEAN DEFAULT false,
    description TEXT DEFAULT '',
    condition TEXT DEFAULT 'New',
    "serialNumber" TEXT DEFAULT '',
    serialnumber TEXT DEFAULT '',
    "supplierId" TEXT,
    supplierid TEXT,
    status TEXT DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "salePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS saleprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS stock NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Gear';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "isRental" BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS isrental BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "serialNumber" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS serialnumber TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "purchaseDate" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchasedate TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "lastServiceDate" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS lastservicedate TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "purchasePrice" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchaseprice NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "reorderLevel" NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorderlevel NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS warrantyinfo TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS imageurl TEXT DEFAULT '';

-- 5. ROW LEVEL SECURITY (RLS) - PERMISSIVE POLICIES
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
        END;
    END LOOP;
END $$;

-- 6. REALTIME REPLICATION (Instant live multi-player updates)
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
        WHEN OTHERS THEN
        END;
    END LOOP;
END $$;`}
                        </CodeBlock>
                        <WarningBox>
                            You do not need to manually delete or recreate your tables. The script above uses <code>IF NOT EXISTS</code> and adds all new columns without touching your existing rows.
                        </WarningBox>
                    </StepCard>

                    <StepCard number={3} title="Deploy Website (Vercel)">
                        <p>Vercel builds your site and puts it online.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>Go to <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">vercel.com</a> and sign up (login with GitHub is easiest).</li>
                            <li>Click <strong>"Add New..."</strong> &rarr; <strong>"Project"</strong>.</li>
                            <li>Select your <code>bosjol-tactical</code> repository from the list and click <strong>Import</strong>.</li>
                            <li><strong>Configure Environment Variables (Crucial Step):</strong>
                                <ul className="list-disc list-inside ml-6 mt-2 text-gray-400 text-xs space-y-2">
                                    <li>Find the <strong>"Environment Variables"</strong> section and expand it.</li>
                                    <li>Add the following keys using the values you copied from Supabase:</li>
                                    <li>
                                        <code>VITE_SUPABASE_URL</code> : Paste your <strong>Project URL</strong>.
                                    </li>
                                    <li>
                                        <code>VITE_SUPABASE_ANON_KEY</code> : Paste your <strong>anon public</strong> Key.
                                    </li>
                                    <li>
                                        <code>VITE_USE_FIREBASE</code> : Set this to <code>false</code>.
                                    </li>
                                </ul>
                            </li>
                            <li>Click <strong>Deploy</strong>.</li>
                        </ol>
                        <TipBox>
                            Vercel will take a minute to build. Once done, you will see a big "Congratulations!" screen with a screenshot of your app. Click the screenshot to visit your live site!
                        </TipBox>
                    </StepCard>

                    <StepCard number={4} title="Final Configuration">
                        <p>Now that your site is live, we need to tell Supabase to allow logins from this new website URL.</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Copy your new website URL (e.g., <code>https://bosjol-tactical.vercel.app</code>).</li>
                            <li>Go back to your <strong>Supabase Dashboard</strong>.</li>
                            <li>Go to <strong>Authentication</strong> &rarr; <strong>URL Configuration</strong>.</li>
                            <li>In <strong>Site URL</strong>, paste your Vercel website link.</li>
                            <li>In <strong>Redirect URLs</strong>, add your Vercel link as well (and ensure <code>http://localhost:5173</code> is there for local testing).</li>
                            <li>Click <strong>Save</strong>.</li>
                        </ol>
                    </StepCard>

                    <div className="bg-green-900/30 border border-green-700/50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircleIcon className="w-6 h-6"/> Deployment Complete
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Your application is now fully deployed!
                        </p>
                        <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                            <li>Open your Vercel URL.</li>
                            <li>Log in with the default admin credentials: <code>bosjol@gmail.com</code> / <code>admin123</code> (if using mock logic) or create a new user in Supabase Authentication.</li>
                            <li>The app should automatically seed the database with initial data on first load.</li>
                        </ul>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
