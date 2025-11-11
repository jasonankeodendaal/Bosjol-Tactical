import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../auth/AuthContext';
import { Button } from './Button';
import { UserIcon, KeyIcon, ExclamationTriangleIcon } from './icons/Icons';
import { CompanyDetails } from '../types';
import { Input } from './Input';

interface LoginScreenProps {
  companyDetails: CompanyDetails;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ companyDetails }) => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = auth;

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    
    if (companyDetails.loginAudioUrl) {
      audio = new Audio(companyDetails.loginAudioUrl);
      audio.loop = true;
      audio.play().catch(error => {
        console.warn("Background audio autoplay was prevented by the browser.");
      });
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [companyDetails.loginAudioUrl]);
  
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      const success = await login(identifier.trim(), pin.trim());
      if (!success) {
          setError("Invalid credentials. Please check your details and try again.");
      }
      setIsLoading(false);
  }

  const renderBackground = () => {
    const url = companyDetails.loginBackgroundUrl;
    if (!url) return null;

    const isVideo = url.startsWith('data:video');

    if (isVideo) {
      return (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none opacity-20"
          key={url}
        >
          <source src={url} type={url.substring(5, url.indexOf(';'))} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div
        className="absolute z-0 w-full h-full bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${url})` }}
      />
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-transparent p-4 overflow-hidden">
       {renderBackground()}
       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-1"></div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-sm mx-auto text-center bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-lg shadow-2xl shadow-black/50"
      >
        {companyDetails.logoUrl && (
          <img src={companyDetails.logoUrl} alt={`${companyDetails.name} Logo`} className="h-16 mx-auto mb-6" />
        )}
        <h1 
          className="text-5xl font-black text-red-500 tracking-widest uppercase glitch-text mb-4"
          data-text="Bosjol Tactical"
        >
          Bosjol Tactical
        </h1>
        <p className="text-gray-400 mb-8">Operator Authentication Required</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
            <Input 
                icon={<UserIcon className="w-5 h-5"/>}
                type="text"
                placeholder="Email or Initials (e.g., JM)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
            />
             <Input 
                icon={<KeyIcon className="w-5 h-5"/>}
                type="password"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
            />

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/50 border border-red-700 text-red-200 text-sm p-3 rounded-md flex items-center justify-center gap-2"
                >
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </motion.div>
            )}

            <Button
                type="submit"
                className="w-full !py-3 text-md flex items-center justify-center"
                disabled={isLoading}
            >
                {isLoading ? 'Authenticating...' : 'ACCESS TERMINAL'}
            </Button>
        </form>

         {companyDetails.socialLinks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-700/50">
                <div className="flex items-center justify-center gap-6">
                    {companyDetails.socialLinks.map(link => (
                         <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:scale-110 transition-transform">
                            <img src={link.iconUrl} alt={link.name} className="h-7 w-7 object-contain" title={link.name} />
                        </a>
                    ))}
                </div>
            </div>
        )}
      </motion.div>
    </div>
  );
};