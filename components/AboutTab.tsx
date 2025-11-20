

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
                        
                        <h4 className="font-semibold text-gray-200 mt-6 mb-2 text-lg">For Players: The Automated Experience</h4>
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                           <ul>
                                <li><strong>Automatic Rank Progression:</strong> Your Rank and Tier are determined solely by your total Rank Points (RP), which you earn from match performance and admin-awarded bonuses. As your RP total increases, the system automatically checks if you've met the minimum requirement for the next Tier. If you have, you are instantly promoted.</li>
                                <li><strong>Real-Time Leaderboard:</strong> The global leaderboard is directly tied to the RP values of all players. The moment any player's RP is updated (up or down), the leaderboard is re-sorted and re-rendered for everyone, ensuring the rankings are always live and accurate.</li>
                                <li><strong>Automated Badge Unlocking:</strong> The system continuously monitors your lifetime stats against the criteria for all available Standard Badges. For example, if a badge requires 50 headshots and your total goes from 49 to 50 after an event, the badge is immediately awarded to your profile.</li>
                                <li><strong>Instant Stat Updates:</strong> After an admin finalizes an event you attended, the system instantly processes your performance. It adds the match stats to your lifetime totals, creates a permanent Match History record for that event, and updates your RP. All of this is visible on your dashboard the next time you view it.</li>
                                <li><strong>Smart Event Signups:</strong> When you view an event's details to register, the system cross-references the event's available rental gear with the current number of signups who have also requested those items. The "available stock" number you see is calculated in real-time, preventing overbooking and ensuring gear availability.</li>
                                <li><strong>Rank Up Celebrations:</strong> The system remembers the last Rank, Tier, and Badges you had when your session ended. If, upon your next login, it detects that your stats have improved enough to earn a new Tier or Badge (usually from an event finalized while you were offline), it will trigger a full-screen "Promotion" summary to celebrate your achievements before you access the main dashboard.</li>
                            </ul>
                        </div>

                        <h4 className="font-semibold text-gray-200 mt-6 mb-2 text-lg">For Administrators: Core Automations</h4>
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                             <ul>
                                <li><strong>Automated Player Code Generation:</strong> When creating a new player, the system looks at their first and last name to create initials (e.g., John Smith &rarr; JS). It then checks all existing player codes to find the highest number associated with those initials and suggests the next sequential number (e.g., if JS01 and JS02 exist, it will suggest JS03). This prevents duplicate codes and speeds up registration.</li>
                                <li><strong>Core Automation - The "Finalize Event" Cascade:</strong> This is the most powerful automation. When you click "Finalize Event" on the Manage Event page, the system performs a precise sequence of actions:
                                    <ol className="mt-2">
                                        <li><strong>Calculates RP:</strong> For each attendee, it calculates total RP earned by combining the event's base participation RP with performance RP (Kills, Deaths, Headshots) based on the values in the Gamification Settings.</li>
                                        <li><strong>Applies Penalties:</strong> It identifies any players who signed up but did not attend (no-shows) and applies the configurable "No-Show Penalty" to their RP total.</li>
                                        <li><strong>Updates Player Stats:</strong> It adds the match stats and calculated RP to each attendee's permanent lifetime stats record and creates a new entry in their Match History.</li>
                                        <li><strong>Recalculates Ranks:</strong> For every player whose RP changed, it re-evaluates their total RP against the Rank Structure and automatically promotes (or demotes) their Rank/Tier if necessary.</li>
                                        <li><strong>Generates Financial Records:</strong> For every attendee marked as 'Paid', it automatically creates corresponding 'Event Revenue' and 'Rental Revenue' transactions in the Finance tab, linking them to the event and player for perfect record-keeping.</li>
                                        <li><strong>Cleans Up Signups:</strong> It deletes all signup records for the finalized event, removing clutter from the system.</li>
                                    </ol>
                                </li>
                                <li><strong>Automatic Raffle Winner Drawing:</strong> On the Vouchers & Raffles tab, clicking "Draw Winners" on an active raffle triggers a lottery. The system fetches all purchased ticket records, randomly selects a winner for each prize tier (starting with 1st place), and ensures a single ticket cannot win multiple prizes. It then saves the winners and marks the raffle as 'Completed', making the results visible to all players.</li>
                                <li><strong>Inventory Stock Alerts:</strong> In the Inventory tab, the system constantly compares each item's "Stock Quantity" to its "Re-order Level". If the stock is less than or equal to the re-order level, the stock number is automatically highlighted in red, providing a clear visual cue to restock.</li>
                            </ul>
                        </div>
                    </StepCard>

                     <StepCard number={2} title="Hosting Guide: External URLs vs. Direct Uploads">
                        <p>This dashboard offers two ways to handle images, audio, and video files. Understanding the difference is crucial for app performance and avoiding file size errors.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                <h4 className="font-semibold text-white mb-2">Method 1: Direct Upload</h4>
                                <p className="text-xs mb-3">You upload a file from your computer. It gets converted into a very long text string (Base64) and saved directly inside the database document.</p>
                                <strong className="text-green-400">Pros:</strong>
                                <ul className="list-disc list-inside text-xs my-1">
                                    <li>Simple and fast for tiny files.</li>
                                    <li>No external accounts needed.</li>
                                </ul>
                                <strong className="text-red-400">Cons:</strong>
                                <ul className="list-disc list-inside text-xs my-1">
                                    <li><strong>Strict 500KB File Size Limit.</strong></li>
                                    <li>Increases database size, which can increase costs.</li>
                                    <li>Base64 encoding makes files ~33% larger.</li>
                                    <li>Slows down app loading times if used for many images.</li>
                                    <li>Completely unsuitable for audio or video.</li>
                                </ul>
                            </div>
                             <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                <h4 className="font-semibold text-white mb-2">Method 2: External URL</h4>
                                <p className="text-xs mb-3">You upload your file to a separate hosting service (many are free) and then paste the link to that file into the dashboard.</p>
                                <strong className="text-green-400">Pros:</strong>
                                <ul className="list-disc list-inside text-xs my-1">
                                    <li><strong>No file size limit.</strong></li>
                                    <li>Keeps the database small and fast.</li>
                                    <li>Significantly faster app loading and performance.</li>
                                    <li><strong>The only way to use audio and video.</strong></li>
                                </ul>
                                <strong className="text-red-400">Cons:</strong>
                                <ul className="list-disc list-inside text-xs my-1">
                                    <li>Requires one extra step (uploading elsewhere first).</li>
                                    <li>Relies on the external service remaining online.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4 bg-blue-900/40 border border-blue-700 text-blue-200 p-4 rounded-lg">
                            <p className="font-bold text-lg mb-2">When to Use Which Method</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li><strong className="text-white">Use Direct Upload ONLY for:</strong> Small, non-critical icons or player avatars where convenience is most important and the file is well under the 500KB limit.</li>
                                <li><strong className="text-white">Use External URL for EVERYTHING ELSE:</strong> All logos, event images, sponsor images, and especially all audio and video files should be hosted externally.</li>
                            </ul>
                        </div>
                    </StepCard>

                    <StepCard number={3} title="How to Get a Direct URL (Free Image Hosting)">
                        <p>You need a <strong>direct link</strong> to the image file itself (usually ending in .jpg, .png, .gif), not a link to a webpage that displays the image. This is the most common point of confusion.</p>
                        
                        <div className="my-3 p-3 bg-zinc-800/50 rounded-md border border-zinc-700/50">
                            <p className="font-semibold text-sm mb-1">Example: What is a Direct Link?</p>
                            <p className="text-xs text-green-400 break-all"><strong className="text-white">Correct:</strong> <code>https://i.ibb.co/L6TySzL/image.png</code> (Ends in .png, browser shows only the image)</p>
                            <p className="text-xs text-red-400 break-all mt-1"><strong className="text-white">Incorrect:</strong> <code>https://ibb.co/L6TySzL</code> (This is a webpage that contains the image)</p>
                        </div>

                        <h4 className="font-semibold text-gray-200 mt-4 mb-2">Recommended Service: ImgBB</h4>
                        <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Go to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">imgbb.com</a> in a new browser tab.</li>
                            <li>Click the large "Start Uploading" button and select your image file.</li>
                            <li>Leave the "Auto delete image" option turned off. Click <strong>Upload</strong>.</li>
                            <li>After the upload is complete, you will see a new page. Find the "Embed codes" dropdown menu.</li>
                            <li>Click the dropdown and select <strong>"Direct links"</strong>.</li>
                            <li>The link in the box is the direct link. Copy this URL and paste it into the appropriate URL field in the dashboard.</li>
                        </ol>
                    </StepCard>
                    
                    <StepCard number={4} title="Handling Video and Audio Files">
                         <p>For video and audio, you cannot use image hosting sites as they are not configured for streaming media. You must use a service that provides a direct link to the media file itself.</p>
                         
                         <h4 className="font-semibold text-gray-200 mt-4 mb-2">Recommended Formats for Web</h4>
                         <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Video:</strong> MP4 (with H.264 video codec) is universally supported and offers great compression.</li>
                            <li><strong>Audio:</strong> MP3 is the best choice for compatibility and small file size. Avoid large formats like WAV.</li>
                         </ul>

                         <h4 className="font-semibold text-gray-200 mt-4 mb-2">Recommended Service: Catbox</h4>
                         <p>Catbox is a simple, free, and reliable file host that provides direct links with no sign-up required.</p>
                         <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Go to <a href="https://catbox.moe/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">catbox.moe</a>.</li>
                            <li>Drag your MP3 audio or MP4 video file onto the page, or click to select it.</li>
                            <li>Wait for the upload to complete.</li>
                            <li>Once finished, it will give you a link (e.g., <code>https://files.catbox.moe/xyz.mp4</code>). <strong>This is your direct link.</strong></li>
                            <li>Copy this URL and paste it into the appropriate audio or video URL field in the dashboard.</li>
                         </ol>
                         
                         <div className="mt-4 bg-amber-900/40 border border-amber-700 text-amber-200 p-3 rounded-lg text-sm">
                            <p className="font-bold mb-1">Cloud Storage (Dropbox, Google Drive, etc.)</p>
                            <p>While you can host files on these services, they often give you a "sharing page" link, not a direct file link. This will not work for streaming. You often need to manually change the URL (e.g., changing <code>?dl=0</code> to <code>?dl=1</code> in Dropbox) to force a download, but this can be unreliable and is not recommended.</p>
                        </div>

                        <div className="mt-4 bg-blue-900/40 border border-blue-700 text-blue-200 p-3 rounded-lg text-sm">
                            <p className="font-bold mb-1">Advanced/Most Reliable Option</p>
                            <p>For the absolute best performance, using a dedicated file hosting service like Amazon S3, Backblaze B2, or your own web hosting via FTP will always provide true, reliable direct streaming links.</p>
                        </div>
                    </StepCard>

                </div>
            </DashboardCard>
        </div>
    );
};
