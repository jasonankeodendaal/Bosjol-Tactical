
import React from 'react';
import { DashboardCard } from './DashboardCard';
import { InformationCircleIcon, ExclamationTriangleIcon, ServerStackIcon, CpuChipIcon, ShieldCheckIcon, PhotoIcon, CurrencyDollarIcon } from './icons/Icons';

const SectionCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, color?: string }> = ({ icon, title, children, color = "text-gray-200" }) => {
    return (
        <div className="border border-zinc-800/80 rounded-lg shadow-lg overflow-hidden bg-zinc-900/50">
            <header className="flex items-center p-4 border-b border-zinc-800/50 bg-black/20">
                <div className={`mr-3 ${color}`}>{icon}</div>
                <h3 className={`font-bold text-lg tracking-wide uppercase ${color}`}>{title}</h3>
            </header>
            <div className="p-6 text-gray-300 text-sm space-y-4 leading-relaxed">
                {children}
            </div>
        </div>
    );
};

export const AboutTab: React.FC = () => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <DashboardCard title="System Architecture & Operational Guide" icon={<InformationCircleIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-8">
                    
                    {/* SYSTEM OVERVIEW */}
                    <SectionCard 
                        icon={<ServerStackIcon className="w-6 h-6" />} 
                        title="1. The Bosjol Ecosystem" 
                        color="text-blue-400"
                    >
                        <p>
                            The Bosjol Tactical Dashboard is a high-performance, Progressive Web Application (PWA) built on a modern tech stack designed for speed, reliability, and offline capability.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-zinc-800/40 p-4 rounded-lg border border-zinc-700/50">
                                <h4 className="font-bold text-white mb-2">Frontend Core</h4>
                                <ul className="list-disc list-inside text-xs space-y-1 text-gray-400">
                                    <li><strong>React 19:</strong> The latest version of the industry-standard UI library for lightning-fast interactions.</li>
                                    <li><strong>TypeScript:</strong> Ensures code reliability and prevents runtime errors through strict typing.</li>
                                    <li><strong>Tailwind CSS:</strong> Provides a responsive, military-grade aesthetic that adapts to any device size.</li>
                                    <li><strong>Vite:</strong> The build engine that delivers instant page loads.</li>
                                </ul>
                            </div>
                            <div className="bg-zinc-800/40 p-4 rounded-lg border border-zinc-700/50">
                                <h4 className="font-bold text-white mb-2">Backend Infrastructure</h4>
                                <ul className="list-disc list-inside text-xs space-y-1 text-gray-400">
                                    <li><strong>Supabase (PostgreSQL):</strong> An enterprise-grade SQL database storing all player and event data.</li>
                                    <li><strong>Real-time Subscriptions:</strong> The dashboard listens for database changes instantly. If a player checks in on one device, the admin screen updates immediately without refreshing.</li>
                                    <li><strong>Row Level Security (RLS):</strong> Cryptographic security rules ensure players can only read public data and never modify sensitive records.</li>
                                </ul>
                            </div>
                        </div>
                    </SectionCard>

                    {/* AUTOMATION ENGINE */}
                    <SectionCard 
                        icon={<CpuChipIcon className="w-6 h-6" />} 
                        title="2. The Automation Engine" 
                        color="text-red-400"
                    >
                        <p>
                            The heart of the system is a complex logic engine that handles the heavy lifting for administrators. Understanding these automations ensures you get the most out of the platform.
                        </p>

                        <div className="space-y-6 mt-4">
                            <div>
                                <h4 className="font-bold text-white text-base border-b border-zinc-700 pb-2 mb-2">The "Finalize Event" Cascade</h4>
                                <p className="mb-2">When you click <span className="text-green-400 font-mono text-xs border border-green-900 bg-green-900/20 px-1 rounded">Finalize Event</span>, the system executes a precise sequence of operations in milliseconds:</p>
                                <ol className="list-decimal list-inside space-y-2 ml-2 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                                    <li><strong>Score Calculation:</strong> It aggregates the Base Participation XP + (Kills × Kill XP) + (Headshots × HS XP) + (Deaths × Death Penalty) for every attendee.</li>
                                    <li><strong>No-Show Detection:</strong> It compares the Signup list against the Attendee list. Any player who signed up but didn't check in receives the configured "No-Show Penalty".</li>
                                    <li><strong>Stat Preservation:</strong> A permanent "Match History" record is created for each player, freezing their stats for that specific game in time.</li>
                                    <li><strong>Lifetime Aggregation:</strong> The match stats are added to the player's lifetime totals (Total Kills, Total Deaths, etc.).</li>
                                    <li><strong>Rank Evaluation:</strong> The system checks the player's new Total XP against the Rank Structure. If they cross a threshold, they are automatically promoted to the next Tier/Rank.</li>
                                    <li><strong>Financial Ledgering:</strong> For every attendee marked as "Paid", a transaction record is generated in the Finance module, splitting revenue into "Event Fees" and "Rental Income".</li>
                                    <li><strong>Cleanup:</strong> All temporary Signup records for the event are deleted to keep the database clean.</li>
                                </ol>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-white text-base border-b border-zinc-700 pb-2 mb-2">Smart Inventory</h4>
                                    <p>Stock levels are dynamic. When viewing the Inventory tab, items with <code className="text-red-400">Stock &le; Re-order Level</code> are visually flagged. During event setup, rental availability is calculated by subtracting live signups from total stock, preventing overbooking.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base border-b border-zinc-700 pb-2 mb-2">Raffle Logic</h4>
                                    <p>The "Draw Winners" function performs a cryptographic shuffle of all purchased tickets. It guarantees that a single ticket cannot win multiple prizes in the same draw, though a player with multiple tickets can win multiple times.</p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* FINANCIAL & SECURITY */}
                    <SectionCard 
                        icon={<CurrencyDollarIcon className="w-6 h-6" />} 
                        title="3. Financial & Data Integrity" 
                        color="text-green-400"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-white mb-2">Revenue Tracking</h4>
                                <p>The Finance tab is not just a log; it's an analytical tool. It distinguishes between:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                                    <li><strong>Event Revenue:</strong> Pure profit from game fees.</li>
                                    <li><strong>Rental Revenue:</strong> Income generated from asset usage (guns/gear).</li>
                                    <li><strong>Retail Revenue:</strong> Sales of consumables (BBs, Gas).</li>
                                    <li><strong>Expenses:</strong> Operational costs recorded manually.</li>
                                </ul>
                                <p className="mt-2 text-xs text-gray-500">Charts automatically adjust to show revenue distribution over time (Day/Week/Month).</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">Security Protocols</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                                    <li><strong>Authentication:</strong> Admins use secure email/password auth via Supabase Auth. Players use a custom PIN system for quick access.</li>
                                    <li><strong>Authorization:</strong> Database policies ensure that while players can <em>read</em> event details and their own stats, they cannot <em>write</em> or modify any data. Only authenticated Admins have write access.</li>
                                    <li><strong>Backup & Restore:</strong> The Settings tab includes a JSON-based backup engine. This allows for a complete snapshot of the database to be saved locally and restored instantly in case of catastrophic data loss.</li>
                                </ul>
                            </div>
                        </div>
                    </SectionCard>

                    {/* MEDIA STRATEGY */}
                    <SectionCard 
                        icon={<PhotoIcon className="w-6 h-6" />} 
                        title="4. Media & Content Strategy" 
                        color="text-purple-400"
                    >
                        <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg mb-4">
                            <p className="font-bold text-purple-200 mb-1">Critical Performance Rule:</p>
                            <p className="text-purple-300 text-sm">Always prefer <strong>External URLs</strong> over Direct Uploads for images, and <strong>mandatory</strong> for video/audio.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-white mb-2">Why External URLs?</h4>
                                <ul className="list-disc list-inside space-y-2 text-xs text-gray-400">
                                    <li><strong>Database Size:</strong> Storing images directly in the database (Base64) bloats the size, slows down initial load times, and can hit storage quotas.</li>
                                    <li><strong>Streaming:</strong> Browsers cannot stream video/audio from a database text string efficiently. They need a file URL to buffer content.</li>
                                    <li><strong>Caching:</strong> External CDNs (Content Delivery Networks) cache images closer to the user, making the dashboard feel instant.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">Recommended Tools</h4>
                                <div className="space-y-3">
                                    <div className="bg-zinc-800 p-2 rounded border border-zinc-700">
                                        <p className="font-bold text-gray-200 text-xs">For Images (Logos, Avatars)</p>
                                        <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs">ImgBB</a>
                                        <span className="text-gray-500 text-xs"> - Get the "Direct Link" (ending in .png/.jpg).</span>
                                    </div>
                                    <div className="bg-zinc-800 p-2 rounded border border-zinc-700">
                                        <p className="font-bold text-gray-200 text-xs">For Audio/Video (Briefings, BG)</p>
                                        <a href="https://catbox.moe" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs">Catbox.moe</a>
                                        <span className="text-gray-500 text-xs"> - Supports MP3/MP4 with direct streaming links.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <div className="text-center pt-8 border-t border-zinc-800">
                        <p className="text-gray-500 text-xs">System Version 2.4.0 (Supabase Edition)</p>
                        <p className="text-gray-600 text-[10px] mt-1">Developed by JSTYP.me | Bosjol Tactical Command</p>
                    </div>

                </div>
            </DashboardCard>
        </div>
    );
};
