
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
                        <WarningBox>
                            You do not need to manually create tables. This app has a built-in "Seeder" function. Once deployed and connected, the app will detect an empty database and automatically set up all the necessary tables and ranks for you.
                        </WarningBox>
                    </StepCard>

                    <StepCard number={3} title="Deploy Website (Vercel)">
                        <p>Vercel builds your site and puts it online.</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>Go to <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">vercel.com</a> and sign up (login with GitHub is easiest).</li>
                            <li>Click <strong>"Add New..."</strong> -> <strong>"Project"</strong>.</li>
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
                            <li>Go to <strong>Authentication</strong> -> <strong>URL Configuration</strong>.</li>
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
