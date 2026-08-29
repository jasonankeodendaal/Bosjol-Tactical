import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
    value: string;
    size?: number;
    className?: string;
    darkColor?: string;
    lightColor?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
    value,
    size = 220,
    className = '',
    darkColor = '#000000',
    lightColor = '#ffffff'
}) => {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        if (!value) return;

        QRCode.toDataURL(value, {
            width: size,
            margin: 1.5,
            color: {
                dark: darkColor,
                light: lightColor
            },
            errorCorrectionLevel: 'H'
        })
            .then(url => {
                if (isMounted) {
                    setQrDataUrl(url);
                    setError(false);
                }
            })
            .catch(err => {
                console.error('Failed to generate QR code:', err);
                if (isMounted) setError(true);
            });

        return () => {
            isMounted = false;
        };
    }, [value, size, darkColor, lightColor]);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-zinc-900 border border-red-500/40 rounded-xl p-4 text-center ${className}`}>
                <p className="text-xs text-red-400 font-semibold">QR Generation Error</p>
            </div>
        );
    }

    if (!qrDataUrl) {
        return (
            <div className={`flex items-center justify-center bg-zinc-900 rounded-xl animate-pulse ${className}`} style={{ width: size, height: size }}>
                <span className="text-xs text-zinc-500 font-mono">Generating QR...</span>
            </div>
        );
    }

    return (
        <div className={`relative flex items-center justify-center p-2.5 bg-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.15)] ${className}`}>
            <img 
                src={qrDataUrl} 
                alt="Event Check-In QR Code" 
                className="w-full h-full object-contain rounded-lg"
                style={{ maxWidth: size, maxHeight: size }}
            />
        </div>
    );
};
