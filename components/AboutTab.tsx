

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
            <DashboardCard title="About This Dashboard & Hosting Guide" icon={<InformationCircleIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-6">
                    <StepCard number={1} title="Using External URLs vs. Direct Uploads">
                        <p>This dashboard offers two ways to handle images, audio, and video files:</p>
                        <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                            <li><strong>Direct Upload:</strong> You can upload files directly from your device. The file is converted into a 'data URL' and stored in the database. <strong>This has a 500KB file size limit.</strong></li>
                            <li><strong>External URL:</strong> You can paste a direct link to a file hosted elsewhere on the internet. This method has no file size limit and is the recommended approach for large files like videos or high-resolution images.</li>
                        </ul>
                        <div className="mt-4 bg-amber-900/40 border border-amber-700 text-amber-200 p-3 rounded-lg text-sm">
                            <p><span className="font-bold">Recommendation:</span> For all significant media (backgrounds, logos, event images), use an external hosting service to get a URL. Use direct uploads only for small, quick assets like player avatars if needed.</p>
                        </div>
                    </StepCard>

                    <StepCard number={2} title="How to Get a Direct URL (Free Image Hosting)">
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

                    <StepCard number={3} title="Handling Video and Audio Files">
                         <p>For video and audio, you cannot use image hosting sites. The best free options are platforms designed for media streaming. It's also recommended to use web-optimized formats like <strong>MP3</strong> over large formats like WAV for faster loading.</p>
                         <h4 className="font-semibold text-gray-200 mt-4 mb-2">Cloud Storage (Dropbox, Google Drive)</h4>
                         <p>You can use services like Dropbox or Google Drive, but you must modify the sharing link to create a direct download link. This process varies by service.</p>
                         
                         <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg text-sm">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="w-8 h-8 mr-3 flex-shrink-0"/>
                                <div>
                                    <p className="font-bold">IMPORTANT: Cloud storage is NOT reliable for streaming.</p>
                                    <p className="mt-1">Services like Google Drive often force a file **download** instead of allowing it to **stream**, even with a modified link. This will break the audio/video player in the application. For guaranteed playback, it is <span className="font-bold">highly recommended</span> to use the <strong>Direct Upload</strong> feature instead.</p>
                                </div>
                            </div>
                        </div>

                         <div className="mt-4 bg-blue-900/40 border border-blue-700 text-blue-200 p-3 rounded-lg text-sm">
                            <p><span className="font-bold">Advanced Option:</span> The most reliable method is to use a proper file hosting service (like Amazon S3, or your own web hosting via FTP) that provides true direct streaming links.</p>
                        </div>
                    </StepCard>
                </div>
            </DashboardCard>
        </div>
    );
};
