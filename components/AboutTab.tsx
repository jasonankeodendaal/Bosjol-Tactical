

import React from 'react';
import { DashboardCard } from './DashboardCard';
import { InformationCircleIcon, ExclamationTriangleIcon } from './icons/Icons';

const StepCard: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => {
    return (
        <div
            className="border border-zinc-800/80 rounded-lg shadow-lg overflow-hidden bg-zinc-900/50"
        >
            <header className="flex items-center p-4 border-b border-red-600/30 bg-black/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-lg mr-4 flex-shrink-0">{number}</div>
                <h3 className="font-bold text-xl tracking-wider uppercase text-gray-200">{title}</h3>
            </header>
            <div className="p-5 text-gray-300 text-sm space-y-3 leading-relaxed">
                {children}
            </div>
        </div>
    );
};


export const AboutTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <DashboardCard title="About This Dashboard & System Guide" icon={<InformationCircleIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-6">

                     <StepCard number={1} title="System Automations & Features Guide">
                        <p>This guide explains the automated processes and key features available to both Players and Administrators, designed to streamline management and enhance the player experience.</p>
                        
                        <h4 className="font-semibold text-gray-200 mt-6 mb-2 text-lg">For Players</h4>
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                           <ul>
                                <li><strong>Automatic Rank Progression:</strong> Your Rank and Tier are determined solely by your total Rank Points (RP). As you earn RP, you will automatically be promoted to the next tier once you meet the minimum XP requirement.</li>
                                <li><strong>Real-Time Leaderboard:</strong> The global leaderboard is updated instantly whenever any player's RP changes, ensuring the rankings are always current.</li>
                                <li><strong>Automated Badge Unlocking:</strong> Standard Badges (e.g., 'Sharpshooter' for 50 headshots) are automatically awarded the moment your lifetime stats meet the required criteria.</li>
                                <li><strong>Instant Stat Updates:</strong> After an admin finalizes an event you attended, your lifetime stats (Kills, Deaths, Headshots, Games Played) and match history are updated immediately.</li>
                                <li><strong>Smart Event Signups:</strong> When signing up for an event, the availability of rental gear is shown in real-time. If an item is fully booked, it's automatically marked as 'Out of Stock' to prevent overbooking.</li>
                                <li><strong>Rank Up Celebrations:</strong> If your rank or tier has increased since your last session, you will be greeted with a full-screen "Promotion" summary upon your next login, celebrating your achievement.</li>
                            </ul>
                        </div>

                        <h4 className="font-semibold text-gray-200 mt-6 mb-2 text-lg">For Administrators</h4>
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                             <ul>
                                <li><strong>Automated Player Code Generation:</strong> When creating a new player, the system automatically suggests a unique Player Code based on the player's initials and a sequential number (e.g., John Smith becomes JS01), preventing duplicates.</li>
                                <li><strong>Core Automation - Finalize Event:</strong> This is the most powerful automation. When you click "Finalize Event" on the Manage Event page, the system automatically performs a cascade of actions:
                                    <ul className="mt-2">
                                        <li>Calculates and awards RP to every attendee based on participation and their recorded in-game stats (kills, deaths, headshots).</li>
                                        <li>Applies a configurable RP penalty to any player who signed up for the event but did not attend (a "no-show").</li>
                                        <li>Updates each attendee's lifetime stats and creates a permanent Match History record for that event.</li>
                                        <li>Recalculates each attendee's total RP and automatically promotes their Rank/Tier if they've met a new threshold.</li>
                                        <li>Automatically generates 'Event Revenue' and 'Rental Revenue' transactions in the Finance tab for every attendee marked as 'Paid'.</li>
                                    </ul>
                                </li>
                                <li><strong>Automated Financial Tracking:</strong> As described above, the Finance tab is automatically populated with revenue data from finalized events, providing a live look at profitability without manual data entry.</li>
                                <li><strong>Automatic Raffle Winner Drawing:</strong> On the Vouchers & Raffles tab, clicking "Draw Winners" for an active raffle instantly and randomly selects winners from all purchased tickets, assigns prizes, and marks the raffle as 'Completed'.</li>
                                <li><strong>Inventory Stock Alerts:</strong> In the Inventory tab, any item whose stock level drops to or below its defined "Re-order Level" will have its stock count highlighted in red, serving as a visual reminder to restock.</li>
                            </ul>
                        </div>
                    </StepCard>

                    <StepCard number={2} title="Understanding the Storage Status Indicator">
                        <p>The small colored dot in the footer of the dashboard provides immediate feedback on the status of your data connection. Here's what each color means:</p>
                        <ul className="list-none space-y-3 pl-2 mt-4">
                            <li className="flex items-start gap-3">
                                <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]"></div>
                                <div>
                                    <strong className="text-green-400">Green Dot: Live Firebase Connection</strong>
                                    <p className="text-xs text-gray-400">Your data is being saved and read from the Google Firebase cloud in real-time. All changes are live.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 flex-shrink-0 shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]"></div>
                                <div>
                                    <strong className="text-blue-400">Blue Dot: Live API Server Connection</strong>
                                    <p className="text-xs text-gray-400">Your application is successfully connected to your self-hosted API server for handling data and large file uploads.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-4 h-4 rounded-full bg-yellow-500 mt-1 flex-shrink-0 animate-pulse"></div>
                                <div>
                                    <strong className="text-yellow-400">Yellow Dot: Mock Data Mode</strong>
                                    <p className="text-xs text-gray-400">The application is running in an offline, local-only mode using sample data. No changes you make will be saved permanently. This mode is active if Firebase is not configured.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-4 h-4 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-pulse"></div>
                                <div>
                                    <strong className="text-red-400">Red Dot: Connection Error</strong>
                                    <p className="text-xs text-gray-400">The app failed to connect to the configured API Server URL. Check that the server is running and the URL in the Settings tab is correct.</p>
                                </div>
                            </li>
                        </ul>
                    </StepCard>

                    <StepCard number={3} title="Hosting Guide: External URLs vs. Direct Uploads">
                        <p>This dashboard offers two ways to handle images, audio, and video files:</p>
                        <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                            <li><strong>Direct Upload:</strong> You can upload files directly from your device. The file is converted into a 'data URL' and stored in the database. <strong>This has a 500KB file size limit.</strong></li>
                            <li><strong>External URL:</strong> You can paste a direct link to a file hosted elsewhere on the internet. This method has no file size limit and is the recommended approach for large files like videos or high-resolution images.</li>
                        </ul>
                        <div className="mt-4 bg-amber-900/40 border border-amber-700 text-amber-200 p-3 rounded-lg text-sm">
                            <p><span className="font-bold">Recommendation:</span> For all significant media (backgrounds, logos, event images), use an external hosting service to get a URL. Use direct uploads only for small, quick assets like player avatars if needed.</p>
                        </div>
                    </StepCard>

                    <StepCard number={4} title="How to Get a Direct URL (Free Image Hosting)">
                        <p>You need a <strong>direct link</strong> to the image file itself (usually ending in .jpg, .png, .gif), not a link to the webpage where the image is displayed.</p>
                        <h4 className="font-semibold text-gray-200 mt-4 mb-2">Recommended Service: ImgBB</h4>
                        <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Go to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">imgbb.com</a>.</li>
                            <li>Click "Start Uploading" and select your image.</li>
                            <li>After the upload, you will see a dropdown menu for "Embed codes".</li>
                            <li>Select <strong>"Direct links"</strong> from the dropdown.</li>
                            <li>Copy the generated URL and paste it into the URL field in the dashboard.</li>
                        </ol>
                        <p className="mt-4">Other services like <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Imgur</a> work too, but make sure you right-click the uploaded image and select "Copy Image Address" to get the direct link.</p>
                    </StepCard>

                    <StepCard number={5} title="Handling Video and Audio Files">
                         <p>For video and audio, you cannot use image hosting sites. The best free options are platforms designed for media streaming. It's also recommended to use web-optimized formats like <strong>MP3</strong> over large formats like WAV for faster loading.</p>
                         <h4 className="font-semibold text-gray-200 mt-4 mb-2">Cloud Storage (Dropbox, Google Drive)</h4>
                         <p>You can use services like Dropbox or Google Drive, but you must modify the sharing link to create a direct download link. This process varies by service and can be unreliable for streaming due to security policies.</p>
                         
                         <div className="mt-4 bg-blue-900/40 border border-blue-700 text-blue-200 p-3 rounded-lg text-sm">
                            <p><span className="font-bold">Advanced Option:</span> The most reliable method is to use a proper file hosting service (like Amazon S3, or your own web hosting via FTP) that provides true direct streaming links.</p>
                        </div>
                    </StepCard>
                </div>
            </DashboardCard>
        </div>
    );
};