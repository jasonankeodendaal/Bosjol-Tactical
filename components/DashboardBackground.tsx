
import React from 'react';

const isVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    const lowercasedUrl = url.toLowerCase();
    return lowercasedUrl.startsWith('data:video') || lowercasedUrl.includes('.mp4') || lowercasedUrl.includes('.webm');
};

export const DashboardBackground: React.FC<{ url?: string }> = ({ url }) => {
    if (!url) return null;

    if (isVideoUrl(url)) {
        return (
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover -z-10"
                key={url} // Key forces re-render if URL changes
            >
                <source src={url} />
                Your browser does not support the video tag.
            </video>
        );
    }

    return (
        <div
            className="absolute inset-0 bg-cover bg-center bg-fixed -z-10"
            style={{ backgroundImage: `url(${url})` }}
        />
    );
};
