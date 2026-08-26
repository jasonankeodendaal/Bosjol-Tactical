import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CodeBracketIcon, 
    InformationCircleIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    CloudArrowDownIcon, 
    RocketLaunchIcon,
    ServerStackIcon,
    CpuChipIcon,
    ShieldCheckIcon,
    SparklesIcon,
    CircleStackIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    KeyIcon
} from './icons/Icons';
import type { CreatorDetails } from '../types';
import { Button } from './Button';

const CodeBlock: React.FC<{ children: string; title?: string; language?: string }> = ({ children, title, language = 'bash' }) => {
    const [copyStatus, setCopyStatus] = useState('Copy');

    const handleCopy = () => {
        navigator.clipboard.writeText(children.trim());
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
    };
    
    return (
        <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 my-2.5 overflow-hidden shadow-xl">
            {title && (
                <div className="px-3 py-1.5 border-b border-zinc-800/70 text-[11px] text-zinc-400 font-mono bg-zinc-900/60 flex justify-between items-center">
                    <span className="font-semibold text-zinc-300">{title}</span>
                    <span className="text-[10px] text-red-400 font-mono uppercase bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/30">{language}</span>
                </div>
            )}
            <div className="relative p-3 group">
                <pre className="text-[11px] sm:text-xs text-zinc-300 overflow-x-auto font-mono leading-relaxed max-h-72 scrollbar-thin">
                    <code>{children}</code>
                </pre>
                <button
                    className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold py-1 px-2.5 rounded transition-all shadow border border-zinc-700 opacity-90 group-hover:opacity-100"
                    onClick={handleCopy}
                >
                    {copyStatus}
                </button>
            </div>
        </div>
    );
};

const ArchitectureDiagram: React.FC = () => {
    return (
        <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 border border-zinc-800/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                    <ServerStackIcon className="w-5 h-5 text-red-500" />
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Bosjol Full-Stack Cloud Architecture</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                    Zero Cold Start • Real-Time
                </span>
            </div>

            {/* Architecture Node Visual Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                {/* Node 1 */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col items-center justify-between hover:border-red-500/40 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-2 group-hover:scale-110 transition-transform">
                        <GlobeAltIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Frontend Edge</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Vercel Global CDN • React 19 • Vite PWA Client with Offline Cache</p>
                    <div className="mt-2.5 text-[9px] font-mono text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/20 w-full truncate">
                        Edge Network &bull; &lt;50ms TTL
                    </div>
                </div>

                {/* Node 2 */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col items-center justify-between hover:border-emerald-500/40 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                        <CircleStackIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Supabase Postgres</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Relational DB • JSONB Schemas • Realtime Broadcast Channel & WebSockets</p>
                    <div className="mt-2.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/20 w-full truncate">
                        PostgreSQL 15 &bull; RLS Guard
                    </div>
                </div>

                {/* Node 3 */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col items-center justify-between hover:border-blue-500/40 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                        <CpuChipIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Logic & Media Engine</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Automated Match ELO • Cloud Bucket Storage • Cryptographic PIN Auth</p>
                    <div className="mt-2.5 text-[9px] font-mono text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900/20 w-full truncate">
                        Object CDN &bull; S3 Media Bucket
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ApiSetupTab: React.FC<{ creatorDetails?: CreatorDetails }> = () => {
    const [activeSection, setActiveSection] = useState<'deployment' | 'database' | 'api' | 'troubleshoot'>('deployment');

    const fullSqlScript = `-- ==========================================================
-- BOSJOL TACTICAL COMPLETE DATABASE & STORAGE INITIALIZATION
-- ==========================================================

-- 1. Create 'media' Storage Bucket for large assets (logos, avatars, soundscapes)
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- 2. Storage Bucket Public Access Policies
drop policy if exists "Public Media Access" on storage.objects;
create policy "Public Media Access" on storage.objects for select using ( bucket_id = 'media' );

drop policy if exists "Authenticated Media Upload" on storage.objects;
create policy "Authenticated Media Upload" on storage.objects for insert with check ( bucket_id = 'media' );

-- 3. Core Database Tables (High performance JSONB-backed schemas)
create table if not exists public.admins ( 
    id text primary key, 
    name text, 
    email text, 
    role text, 
    "clearanceLevel" int, 
    "avatarUrl" text 
);

create table if not exists public.players ( 
    id text primary key, 
    "playerCode" text, 
    name text, 
    surname text, 
    email text, 
    phone text, 
    pin text, 
    role text, 
    callsign text, 
    rank jsonb, 
    status text, 
    "avatarUrl" text, 
    stats jsonb, 
    badges jsonb, 
    "legendaryBadges" jsonb, 
    loadout jsonb, 
    bio text, 
    "preferredRole" text, 
    "idNumber" text, 
    age int, 
    "activeAuthUID" text, 
    "matchHistory" jsonb, 
    "xpAdjustments" jsonb, 
    address text, 
    allergies text, 
    "medicalNotes" text 
);

create table if not exists public.events ( 
    id text primary key, 
    title text, 
    type text, 
    date text, 
    "startTime" text, 
    location text, 
    description text, 
    theme text, 
    rules text, 
    "participationXp" int, 
    status text, 
    "imageUrl" text, 
    "audioBriefingUrl" text, 
    "gameFee" numeric, 
    "gearForRent" jsonb, 
    "rentalPriceOverrides" jsonb, 
    "eventBadges" jsonb, 
    attendees jsonb, 
    "liveStats" jsonb 
);

create table if not exists public.inventory ( 
    id text primary key, 
    name text, 
    description text, 
    "salePrice" numeric, 
    stock int, 
    type text, 
    "isRental" boolean, 
    category text, 
    condition text, 
    "purchasePrice" numeric, 
    "reorderLevel" int, 
    "supplierId" text, 
    sku text 
);

create table if not exists public.transactions ( 
    id text primary key, 
    date text, 
    type text, 
    description text, 
    amount numeric, 
    "relatedEventId" text, 
    "relatedPlayerId" text, 
    "paymentStatus" text, 
    "relatedInventoryId" text 
);

create table if not exists public.settings ( 
    id text primary key, 
    name text, 
    address text, 
    phone text, 
    email text, 
    website text, 
    "regNumber" text, 
    "vatNumber" text, 
    "logoUrl" text, 
    "loginBackgroundUrl" text, 
    "loginAudioUrl" text, 
    "playerDashboardBackgroundUrl" text, 
    "adminDashboardBackgroundUrl" text, 
    "playerDashboardAudioUrl" text, 
    "adminDashboardAudioUrl" text, 
    "sponsorsBackgroundUrl" text, 
    "apkUrl" text, 
    "apiServerUrl" text, 
    "bankInfo" jsonb, 
    "fixedEventRules" text, 
    "minimumSignupAge" int, 
    "nextRankResetDate" text, 
    tagLine text, 
    bio text, 
    whatsapp text, 
    "githubUrl" text, 
    "sourceCodeZipUrl" text 
);

create table if not exists public.ranks ( id text primary key, name text, description text, "rankBadgeUrl" text, tiers jsonb );
create table if not exists public.badges ( id text primary key, name text, description text, "iconUrl" text, criteria jsonb );
create table if not exists public."legendaryBadges" ( id text primary key, name text, description text, "iconUrl" text, "howToObtain" text );
create table if not exists public."gamificationSettings" ( id text primary key, name text, description text, xp int );
create table if not exists public."apiSetupGuide" ( id text primary key, title text, content text, "codeBlock" text, "codeLanguage" text, "fileName" text );
create table if not exists public.sponsors ( id text primary key, name text, "logoUrl" text, email text, phone text, website text, bio text, "imageUrls" text[] );
create table if not exists public.locations ( id text primary key, name text, description text, address text, "imageUrls" text[], "pinLocationUrl" text, "contactInfo" jsonb );
create table if not exists public."socialLinks" ( id text primary key, name text, url text, "iconUrl" text );
create table if not exists public."carouselMedia" ( id text primary key, type text, url text );
create table if not exists public.suppliers ( id text primary key, name text, "contactPerson" text, email text, phone text, address text, website text );
create table if not exists public.vouchers ( id text primary key, code text, discount numeric, type text, description text, status text, "assignedToPlayerId" text, "usageLimit" int, "perUserLimit" int, redemptions jsonb );
create table if not exists public.raffles ( id text primary key, name text, location text, "contactPhone" text, prizes jsonb, "drawDate" text, status text, "createdAt" text, tickets jsonb, winners jsonb );
create table if not exists public.signups ( id text primary key, "eventId" text, "playerId" text, "requestedGearIds" text[], note text );
create table if not exists public."activityLog" ( id text primary key, timestamp text, "userId" text, "userName" text, "userRole" text, action text, details jsonb );
create table if not exists public.sessions ( id text primary key, "userId" text, "userName" text, "userRole" text, "currentView" text, "lastSeen" text );
create table if not exists public.notifications ( id text primary key, title text, message text, type text, "timestamp" text, read boolean, "playerId" text, "playerName" text, "playerCallsign" text, "playerCode" text, "playerAvatarUrl" text, "eventId" text, "eventTitle" text, metadata jsonb );
create table if not exists public.honors ( id text primary key, "playerId" text, "playerName" text, "playerCallsign" text, "playerAvatarUrl" text, type text, title text, date text, notes text );

-- 4. Enable Security & Client Grants
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;

do $$
declare
  tables text[] := array['admins', 'players', 'events', 'inventory', 'transactions', 'settings', 'ranks', 'badges', 'legendaryBadges', 'gamificationSettings', 'apiSetupGuide', 'sponsors', 'locations', 'socialLinks', 'carouselMedia', 'suppliers', 'vouchers', 'raffles', 'signups', 'activityLog', 'sessions', 'notifications', 'honors'];
  t text;
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "Public Access" on public.%I;', t);
    execute format('create policy "Public Access" on public.%I for all using (true) with check (true);', t);
  end loop;
end $$;`;

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6">
            {/* Top Clean Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <RocketLaunchIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider">
                            API & Full-Stack Deployment Guide
                        </h2>
                        <p className="text-[11px] sm:text-xs text-zinc-400">
                            Zero to Hero: Production setup, Supabase schemas, REST endpoints & edge hosting.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                        Vite + Supabase
                    </span>
                </div>
            </div>

            {/* Architecture Overview Diagram */}
            <ArchitectureDiagram />

            {/* Section Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/80">
                <button
                    onClick={() => setActiveSection('deployment')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'deployment'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <RocketLaunchIcon className="w-3.5 h-3.5" />
                    <span>Deployment Steps</span>
                </button>
                <button
                    onClick={() => setActiveSection('database')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'database'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <CircleStackIcon className="w-3.5 h-3.5" />
                    <span>SQL Schema</span>
                </button>
                <button
                    onClick={() => setActiveSection('api')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'api'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <CodeBracketIcon className="w-3.5 h-3.5" />
                    <span>API & Endpoints</span>
                </button>
                <button
                    onClick={() => setActiveSection('troubleshoot')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'troubleshoot'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                    <span>Troubleshooting</span>
                </button>
            </div>

            {/* SECTION 1: DEPLOYMENT STEPS */}
            {activeSection === 'deployment' && (
                <div className="space-y-4">
                    {/* Step Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* Step 1 */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2.5">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
                                <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Push to GitHub</h3>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                                Initialize version control and upload your repository to GitHub for automated CI/CD builds.
                            </p>
                            <CodeBlock language="bash" title="Terminal Command Sequence">
{`git init
git add .
git commit -m "feat: initial tactical dashboard launch"
git branch -M main
git remote add origin https://github.com/YOUR_USER/bosjol-tactical.git
git push -u origin main`}
                            </CodeBlock>
                            <ul className="text-[10px] text-zinc-400 space-y-1 pt-1">
                                <li className="flex items-center gap-1.5">
                                    <CheckCircleIcon className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                    <span>Private or Public repositories are fully supported.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Step 2 */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2.5">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
                                <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Provision Supabase Project</h3>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                                Create your managed PostgreSQL database and obtain your secret project credentials.
                            </p>
                            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1.5 text-[11px]">
                                <div className="flex items-center justify-between text-zinc-300">
                                    <span className="font-bold text-white">Project URL:</span>
                                    <span className="font-mono text-emerald-400 text-[10px]">https://xyz.supabase.co</span>
                                </div>
                                <div className="flex items-center justify-between text-zinc-300">
                                    <span className="font-bold text-white">Public Anon Key:</span>
                                    <span className="font-mono text-blue-400 text-[10px]">eyJhbGciOiJIUzI1NiIsInR...</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-400">
                                Navigate to <strong>Project Settings &rarr; API</strong> to copy your keys.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2.5">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
                                <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Run SQL Schema</h3>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                                Paste the automated schema initialization script in the Supabase SQL Editor to construct all tables and storage buckets.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Button 
                                    size="sm" 
                                    onClick={() => setActiveSection('database')} 
                                    className="!py-1 !px-2.5 text-[11px]"
                                >
                                    <CircleStackIcon className="w-3.5 h-3.5 mr-1" />
                                    View Full SQL Schema
                                </Button>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2.5">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">4</span>
                                <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Deploy to Vercel</h3>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                                Connect Vercel to your GitHub repo, configure environment variables, and trigger the live production build.
                            </p>
                            <div className="space-y-1 font-mono text-[10px]">
                                <div className="p-1.5 bg-black/40 rounded border border-zinc-800 text-zinc-300">
                                    <span className="text-zinc-500">VITE_SUPABASE_URL = </span>
                                    <span className="text-emerald-400">https://xyz.supabase.co</span>
                                </div>
                                <div className="p-1.5 bg-black/40 rounded border border-zinc-800 text-zinc-300">
                                    <span className="text-zinc-500">VITE_SUPABASE_ANON_KEY = </span>
                                    <span className="text-blue-400">your_anon_key</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: SQL SCHEMA */}
            {activeSection === 'database' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                        <div className="flex items-center gap-2">
                            <CircleStackIcon className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                                Supabase PostgreSQL 15 Blueprint
                            </h3>
                        </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400">
                        Copy this script and run it directly in your Supabase SQL Editor to initialize all 23 application collections, media buckets, and Row Level Security policies.
                    </p>
                    <CodeBlock language="sql" title="Supabase Complete Schema Script">
                        {fullSqlScript}
                    </CodeBlock>
                </div>
            )}

            {/* SECTION 3: API & ENDPOINTS */}
            {activeSection === 'api' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* REST Example */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                                <CodeBracketIcon className="w-4 h-4 text-emerald-400" />
                                <span>Fetch Top Operators (REST API)</span>
                            </h4>
                            <p className="text-[10px] text-zinc-400">Query top operators sorted by total Rank Points (XP):</p>
                            <CodeBlock language="bash" title="cURL Request">
{`curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/players?select=id,name,callsign,stats&order=stats->>xp.desc&limit=10' \\
-H "apikey: YOUR_ANON_KEY" \\
-H "Authorization: Bearer YOUR_ANON_KEY"`}
                            </CodeBlock>
                        </div>

                        {/* Realtime Subscription Example */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                                <ArrowPathIcon className="w-4 h-4 text-blue-400" />
                                <span>Realtime Live Notifications</span>
                            </h4>
                            <p className="text-[10px] text-zinc-400">Subscribe to instant badge unlocks and event signups via WebSocket:</p>
                            <CodeBlock language="typescript" title="TypeScript Subscription">
{`import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase
  .channel('public:notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
      console.log('New notification received:', payload.new);
  })
  .subscribe();`}
                            </CodeBlock>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 4: TROUBLESHOOTING */}
            {activeSection === 'troubleshoot' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Mock Data Indicator Appears</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            If you see a yellow status indicator in the footer, verify that <code className="text-amber-300 font-mono text-[10px]">VITE_SUPABASE_URL</code> and <code className="text-amber-300 font-mono text-[10px]">VITE_SUPABASE_ANON_KEY</code> are correctly defined in your environment settings.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wider">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>CORS & Site URL Configuration</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Ensure your deployed Vercel domain (e.g. <code className="text-red-300 font-mono text-[10px]">https://bosjol.vercel.app</code>) is listed in Supabase under <strong>Authentication &rarr; URL Configuration &rarr; Redirect URLs</strong>.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
