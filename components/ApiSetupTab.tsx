
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from './DashboardCard';
import { CodeBracketIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, CloudArrowDownIcon, RocketLaunchIcon } from './icons/Icons';
import type { CreatorDetails } from '../types';
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

interface ApiSetupTabProps {
    creatorDetails: CreatorDetails;
}

export const ApiSetupTab: React.FC<ApiSetupTabProps> = ({ creatorDetails }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <DashboardCard title="Zero to Hero: Full Stack Deployment Guide" icon={<RocketLaunchIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8 text-gray-300">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-xl border border-zinc-800">
                        <h3 className="text-xl font-bold text-white mb-3">The Mission</h3>
                        <p className="text-gray-400 mb-4">
                            You are about to launch your dashboard to the live web. 
                            We will use <strong>Supabase</strong> for our backend database and <strong>Vercel</strong> to host the application.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-green-400 mb-1">Cost</span>
                                Free (Generous Tiers)
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-blue-400 mb-1">Database</span>
                                Supabase (PostgreSQL)
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-zinc-800">
                                <span className="block font-bold text-amber-400 mb-1">Difficulty</span>
                                Beginner Friendly
                            </div>
                        </div>
                    </div>

                    <StepCard number={1} title="Source Control: Get on GitHub">
                        <p>Vercel needs to access your code to build it. The industry standard way to do this is via GitHub.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li><strong>Create an Account:</strong> If you don't have one, sign up at <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">github.com</a>.</li>
                            <li><strong>Create a Repository:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Click the <strong>+</strong> icon in the top right &rarr; <strong>New repository</strong>.</li>
                                    <li>Name it <code>bosjol-tactical</code>.</li>
                                    <li>Choose <strong>Private</strong> (recommended) or Public.</li>
                                    <li>Click <strong>Create repository</strong>.</li>
                                </ul>
                            </li>
                            <li><strong>Upload Your Code:</strong>
                                <p className="mt-2 text-sm text-gray-400">If you have Git installed on your computer, run these commands in your project folder:</p>
                                <CodeBlock title="Terminal Commands">
{`git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bosjol-tactical.git
git push -u origin main`}
                                </CodeBlock>
                                <p className="text-xs text-gray-500">Replace <code>YOUR_USERNAME</code> with your actual GitHub username.</p>
                            </li>
                        </ol>
                        <TipBox>
                            If you aren't comfortable with the command line, you can simply upload files manually using the "uploading an existing file" link on the GitHub repository page.
                        </TipBox>
                    </StepCard>

                    <StepCard number={2} title="The Backend: Supabase Setup">
                        <p>Supabase provides the database and authentication systems. It's an open-source alternative to Firebase.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li><strong>Sign Up:</strong> Go to <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">supabase.com</a> and sign in with GitHub.</li>
                            <li><strong>Create Project:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Click <strong>"New Project"</strong>.</li>
                                    <li>Name: <code>Bosjol Tactical</code>.</li>
                                    <li>Database Password: <strong>Generate a strong password and save it!</strong></li>
                                    <li>Region: Select the one closest to you (e.g., Cape Town or London).</li>
                                    <li>Click <strong>Create new project</strong>.</li>
                                </ul>
                            </li>
                            <li><strong>Wait for Provisioning:</strong> This usually takes about 2 minutes.</li>
                            <li><strong>Get API Credentials (IMPORTANT):</strong>
                                <p className="mt-1 text-sm text-gray-400">Once the project is ready, go to <strong>Project Settings</strong> (Cog icon) &rarr; <strong>API</strong>.</p>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Copy the <strong>Project URL</strong>.</li>
                                    <li>Copy the <strong>anon public</strong> Key.</li>
                                    <li><span className="text-red-400 font-bold">Keep this tab open. You will need them for Step 4.</span></li>
                                </ul>
                            </li>
                        </ol>
                    </StepCard>

                    <StepCard number={3} title="Database & Storage Schema (SQL Editor)">
                        <p>We need to create the tables to store data and the storage bucket for large media files (images/videos). Supabase makes this easy with SQL.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>In your Supabase Dashboard, click on the <strong>SQL Editor</strong> icon (looks like a terminal `&gt;_`) in the left sidebar.</li>
                            <li>Click <strong>"New Query"</strong>.</li>
                            <li><strong>Copy and Paste</strong> the entire script below into the editor.</li>
                            <li>Click <strong>Run</strong> (bottom right of the editor).</li>
                        </ol>
                        <CodeBlock title="SQL Initialization Script" language="sql">
{`-- 1. Create the 'media' Storage Bucket for large files (Images/Videos)
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- 2. Create Storage Policies (Allows public read, broad write access for app simplicity)
create policy "Public Media Access" on storage.objects for select using ( bucket_id = 'media' );
create policy "Authenticated Media Upload" on storage.objects for insert with check ( bucket_id = 'media' );

-- 3. Create Core Tables
-- We use text for IDs and JSONB for complex objects to match the app's flexible data structure.

create table if not exists public.admins ( id text primary key, name text, email text, role text, "clearanceLevel" int, "avatarUrl" text );

create table if not exists public.players ( 
    id text primary key, "playerCode" text, name text, surname text, email text, phone text, pin text, role text, callsign text, 
    rank jsonb, status text, "avatarUrl" text, stats jsonb, badges jsonb, "legendaryBadges" jsonb, loadout jsonb, bio text, 
    "preferredRole" text, "idNumber" text, age int, "activeAuthUID" text, "matchHistory" jsonb, "xpAdjustments" jsonb, 
    address text, allergies text, "medicalNotes" text 
);

create table if not exists public.events ( 
    id text primary key, title text, type text, date text, "startTime" text, location text, description text, theme text, 
    rules text, "participationXp" int, status text, "imageUrl" text, "audioBriefingUrl" text, "gameFee" numeric, 
    "gearForRent" jsonb, "rentalPriceOverrides" jsonb, "eventBadges" jsonb, attendees jsonb, "liveStats" jsonb 
);

create table if not exists public.inventory ( 
    id text primary key, name text, description text, "salePrice" numeric, stock int, type text, "isRental" boolean, 
    category text, condition text, "purchasePrice" numeric, "reorderLevel" int, "supplierId" text, sku text 
);

create table if not exists public.transactions ( 
    id text primary key, date text, type text, description text, amount numeric, "relatedEventId" text, "relatedPlayerId" text, 
    "paymentStatus" text, "relatedInventoryId" text 
);

create table if not exists public.settings ( 
    id text primary key, name text, address text, phone text, email text, website text, "regNumber" text, "vatNumber" text, 
    "logoUrl" text, "loginBackgroundUrl" text, "loginAudioUrl" text, "playerDashboardBackgroundUrl" text, 
    "adminDashboardBackgroundUrl" text, "playerDashboardAudioUrl" text, "adminDashboardAudioUrl" text, 
    "sponsorsBackgroundUrl" text, "apkUrl" text, "apiServerUrl" text, "bankInfo" jsonb, "fixedEventRules" text, 
    "minimumSignupAge" int, "nextRankResetDate" text, tagLine text, bio text, whatsapp text, "githubUrl" text, 
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

-- 4. Grant Access (Simplifies connection for the web app)
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;`}
                        </CodeBlock>
                        <TipBox>
                            If you see a "Success" message in the results pane, your database structure is ready! The app will populate these tables with initial data automatically when you first log in.
                        </TipBox>
                    </StepCard>

                    <StepCard number={4} title="The Frontend: Vercel Deployment">
                        <p>Vercel will build your React code and serve it to the world.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li><strong>Sign Up:</strong> Go to <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">vercel.com</a> and sign up using <strong>GitHub</strong>.</li>
                            <li><strong>Import Project:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Click <strong>"Add New..."</strong> &rarr; <strong>"Project"</strong>.</li>
                                    <li>You should see your <code>bosjol-tactical</code> repo listed. Click <strong>Import</strong>.</li>
                                </ul>
                            </li>
                            <li><strong>Configure Project:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li><strong>Framework Preset:</strong> Vite (should be auto-detected).</li>
                                    <li><strong>Root Directory:</strong> <code>./</code> (default).</li>
                                </ul>
                            </li>
                            <li><strong>Environment Variables (CRITICAL):</strong>
                                <p className="mt-1 text-sm text-gray-400">Expand the <strong>"Environment Variables"</strong> section. Add these three variables exactly as written:</p>
                                <div className="space-y-2 mt-2">
                                    <div className="bg-black/50 p-2 rounded border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 font-mono">NAME</span>
                                        <span className="text-sm font-bold text-white font-mono">VITE_SUPABASE_URL</span>
                                        <span className="text-xs text-gray-500 font-mono">VALUE</span>
                                        <span className="text-xs text-green-400 font-mono break-all">Paste your Supabase Project URL here</span>
                                    </div>
                                    <div className="bg-black/50 p-2 rounded border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 font-mono">NAME</span>
                                        <span className="text-sm font-bold text-white font-mono">VITE_SUPABASE_ANON_KEY</span>
                                        <span className="text-xs text-gray-500 font-mono">VALUE</span>
                                        <span className="text-xs text-green-400 font-mono break-all">Paste your Supabase 'anon public' Key here</span>
                                    </div>
                                </div>
                            </li>
                            <li>Click <strong>Deploy</strong>.</li>
                        </ol>
                        <TipBox>
                            Deployment takes about 1-2 minutes. Once finished, you will see a big "Congratulations!" screen with a screenshot of your app. Click the screenshot to visit your live site!
                        </TipBox>
                    </StepCard>

                    <StepCard number={5} title="Final Connection: Supabase Auth">
                        <p>Authentication requires one final handshake. We need to tell Supabase that your new Vercel website is allowed to log users in.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>Copy your new website URL from the browser address bar (e.g., <code>https://bosjol-tactical.vercel.app</code>).</li>
                            <li>Go back to your <strong>Supabase Dashboard</strong>.</li>
                            <li>Navigate to <strong>Authentication</strong> (icon on the left) &rarr; <strong>URL Configuration</strong>.</li>
                            <li><strong>Site URL:</strong> Paste your Vercel website link here.</li>
                            <li><strong>Redirect URLs:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1 text-gray-400">
                                    <li>Click "Add URL".</li>
                                    <li>Paste your Vercel link again.</li>
                                    <li>Ensure <code>http://localhost:5173/**</code> is also present if you want to keep testing locally.</li>
                                </ul>
                            </li>
                            <li>Click <strong>Save</strong>.</li>
                        </ol>
                    </StepCard>

                    <div className="bg-green-900/30 border border-green-700/50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircleIcon className="w-6 h-6"/> Mission Accomplished
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Your tactical dashboard is now live on the internet!
                        </p>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-white text-sm">How to Log In (Admin):</h4>
                                <p className="text-gray-400 text-sm">
                                    Use the default credentials: <code>bosjoltactical@gmail.com</code> / <code>admin123</code>.
                                    <br/>Since this is a fresh database, the app will auto-seed this admin user on first load.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">First Load:</h4>
                                <p className="text-gray-400 text-sm">
                                    When you first visit your live site, the app will detect the empty database and automatically run the seeding process (populating ranks, badges, etc). This might take 5-10 seconds. Refresh the page if it seems stuck.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
