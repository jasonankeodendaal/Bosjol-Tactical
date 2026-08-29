
import React, { useContext, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../auth/AuthContext';
import { Button } from './Button';
import { UserIcon, KeyIcon, ExclamationTriangleIcon, CloudArrowDownIcon, ArrowLeftIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './icons/Icons';
import { CompanyDetails, SocialLink } from '../types';
import { Input } from './Input';
import { RecruitSignUpForm } from './RecruitSignUpForm';
import { UserPlus } from 'lucide-react';

interface LoginScreenProps {
  companyDetails: CompanyDetails;
  socialLinks: SocialLink[];
  onBackToWelcome?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ companyDetails, socialLinks, onBackToWelcome }) => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRecruitForm, setShowRecruitForm] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { login } = auth;
  const audioUrl = companyDetails.loginAudioUrl;

  useEffect(() => {
    if (audioRef.current && audioUrl && audioUrl.trim() !== '') {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Autoplay fallback
      });
    }
  }, [audioUrl]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const performLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
        const success = await login(identifier.trim(), password.trim());
        if (!success) {
            setError("Invalid credentials. Please check your details and try again.");
            setIsLoading(false);
        }
    } catch (err) {
        console.error("Login exception:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      performLogin();
  };

  const renderBackground = () => {
    const url = companyDetails.loginBackgroundUrl;
    if (!url || typeof url !== 'string' || url.trim() === '') return null;

    const isVideo = url.startsWith('data:video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');

    if (isVideo) {
      return (
        <video
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          key={url}
        >
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-80"
        style={{ backgroundImage: `url("${url}")` }}
      />
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black p-3 sm:p-4 overflow-hidden">
       {renderBackground()}
       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 z-1 pointer-events-none" />

       {/* Background Audio */}
       {audioUrl && audioUrl.trim() !== '' && (
         <audio ref={audioRef} src={audioUrl} loop autoPlay />
       )}

       {/* Top Controls: Back Button & Audio Toggle */}
       <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {onBackToWelcome ? (
            <button
              type="button"
              onClick={onBackToWelcome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md border border-zinc-800/60 px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-md"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 text-red-500" />
              <span>Welcome Page</span>
            </button>
          ) : <div />}

          {audioUrl && audioUrl.trim() !== '' && (
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-zinc-800/60 text-zinc-300 hover:text-white transition-all shadow-md"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-4 h-4 text-zinc-400" />
              ) : (
                <SpeakerWaveIcon className="w-4 h-4 text-red-500" />
              )}
            </button>
          )}
       </div>
      
      {/* Compact Shrunken Frameless Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto text-center bg-black/40 backdrop-blur-md border border-zinc-800/40 p-4 sm:p-5 rounded-2xl shadow-2xl"
      >
        {companyDetails.logoUrl && companyDetails.logoUrl.trim() !== '' && (
          <img src={companyDetails.logoUrl} alt={`${companyDetails.name} Logo`} className="h-10 sm:h-12 mx-auto mb-2 object-contain" />
        )}
        <h1 
          className="text-2xl sm:text-3xl font-black text-red-500 tracking-wider uppercase glitch-text mb-0.5"
          data-text="Bosjol Tactical"
        >
          Bosjol Tactical
        </h1>
        <p className="text-[11px] sm:text-xs text-zinc-400 mb-3 font-medium">Operator Authentication Required</p>
        
        <form onSubmit={handleLogin} className="space-y-2.5 text-left">
            <Input 
                icon={<UserIcon className="w-4 h-4 text-zinc-400"/>}
                type="text"
                placeholder="Player Code / Admin Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="!py-1.5 !text-xs sm:!text-sm"
            />
             <Input 
                icon={<KeyIcon className="w-4 h-4 text-zinc-400"/>}
                type="password"
                placeholder="PIN / Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="!py-1.5 !text-xs sm:!text-sm"
            />
            
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-2 rounded-lg flex items-center justify-center gap-1.5"
                >
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{error}</span>
                </motion.div>
            )}

            <Button
                type="submit"
                className="w-full !py-2 text-xs sm:text-sm font-bold flex items-center justify-center mt-1"
                disabled={isLoading}
            >
                {isLoading ? 'Authenticating...' : 'ACCESS TERMINAL'}
            </Button>
        </form>

        <div className="mt-3 text-[10px] sm:text-[11px] text-zinc-400 leading-tight space-y-0.5">
            <p><span className="text-red-400 font-bold">PLAYERS:</span> Use Player Code & PIN</p>
            <p><span className="text-red-400 font-bold">ADMINS:</span> Use Email & Password</p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-zinc-800/50 flex flex-col gap-2">
            <button
                type="button"
                onClick={() => setShowRecruitForm(true)}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-red-600/20 via-zinc-900 to-emerald-600/20 hover:from-red-600/30 hover:to-emerald-600/30 border border-zinc-700 hover:border-emerald-500/50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
            >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>New Recruit? Fill Enlistment Form</span>
            </button>
        </div>

        {companyDetails.apkUrl && companyDetails.apkUrl.trim() !== '' && (
          <div className="mt-2 pt-2 border-t border-zinc-800/50">
            <a 
              href={companyDetails.apkUrl} 
              download="BosjolTactical.apk"
              className="inline-block w-full"
            >
              <Button variant="secondary" size="sm" className="w-full !py-1.5 text-xs">
                <CloudArrowDownIcon className="w-4 h-4 mr-1.5" />
                Download Android APK
              </Button>
            </a>
          </div>
        )}

         {socialLinks.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-zinc-800/50">
                <div className="flex items-center justify-center gap-4">
                    {socialLinks.map(link => (
                         <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:scale-110 transition-transform">
                            {link.iconUrl && link.iconUrl.trim() !== '' ? (
                              <img src={link.iconUrl} alt={link.name} className="h-5 w-5 object-contain" title={link.name} />
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-400">{link.name}</span>
                            )}
                        </a>
                    ))}
                </div>
            </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showRecruitForm && (
            <RecruitSignUpForm 
                companyDetails={companyDetails}
                onClose={() => setShowRecruitForm(false)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};
