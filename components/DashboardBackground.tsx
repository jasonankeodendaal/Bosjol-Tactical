
/** @jsxImportSource react */
import React from 'react';

const isVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    const lowercasedUrl = url.toLowerCase();
    return lowercasedUrl.startsWith('data:video') || 
           lowercasedUrl.includes('.mp4') || 
           lowercasedUrl.includes('.webm') || 
           lowercasedUrl.includes('.mov') || 
           lowercasedUrl.includes('.ogg');
};

export const DashboardBackground: React.FC<{ url?: string }> = ({ url }) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;

    const trimmedUrl = url.trim();

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0" key={trimmedUrl}>
            {isVideoUrl(trimmedUrl) ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={trimmedUrl} />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ 
                        backgroundImage: `url("${trimmedUrl}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center'
                    }}
                />
            )}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        </div>
    );
};
