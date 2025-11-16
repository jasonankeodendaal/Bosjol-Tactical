/** @jsxImportSource react */
import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../auth/AuthContext';
import { Button } from './Button';
import { UserIcon, KeyIcon, ExclamationTriangleIcon, CloudArrowDownIcon } from './icons/Icons';
import { CompanyDetails, SocialLink } from '../types';
import { Input } from './Input';
import { Modal } from './Modal';

interface LoginScreenProps {
  companyDetails: CompanyDetails;
  socialLinks: SocialLink[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ companyDetails, socialLinks }) => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { login } = auth;
  
  const performLogin = async (shouldRemember: boolean) => {
    setIsLoading(true);
    setError(null);

    const success = await login(identifier.trim(), password.trim(), shouldRemember);
    if (!success) {
        setError("Invalid credentials. Please check your details and try again.");
        setIsLoading(false);
    }
    // On success, component will unmount
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/cod-mw-ui-sfx-2.mp3');
        audio.volume = 0.5;
        audio.play();
      } catch (err) {
        console.error("Failed to play login sound:", err);
      }
      
      const isPlayerLogin = !identifier.includes('@');

      if (rememberMe && isPlayerLogin) {
          setShowTermsModal(true);
      } else {
          performLogin(rememberMe);
      }
  };

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    performLogin(true);
  };
  
  const handleDeclineTerms = () => {
      setShowTermsModal(false);
      performLogin(false);
  };


  const renderBackground = () => {
    const url = companyDetails.loginBackgroundUrl;
    if (!url) return null;

    const isVideo = url.startsWith('data:video') || url.includes('.mp4') || url.includes('.webm');

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
          <source src={url} />
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
      
       <AnimatePresence>
            {showTermsModal && (
                <Modal isOpen={true} onClose={handleDeclineTerms} title="Remember This Device?">
                    <div className="text-left text-gray-300 text-sm space-y-4">
                        <div className="flex items-center justify-center mb-4 text-center border-b border-zinc-700/50 pb-4">
                            <KeyIcon className="w-12 h-12 text-red-500 mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-wider">ALWAYS STAY LOGGED IN</h3>
                                <p className="text-sm text-gray-400">Terms for 'Remember Me'</p>
                            </div>
                        </div>
                        <p>
                            By accepting, you agree to keep your session partially active on this device. Your Player ID will be stored securely in your browser.
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-2 bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50">
                            <li><strong>Faster Access:</strong> You will only need to enter your 4-digit PIN to log in next time.</li>
                            <li><strong>Security:</strong> This feature is recommended only for private, trusted devices.</li>
                            <li><strong>Opting Out:</strong> You can clear this setting at any time by clicking the main "Logout" button in the dashboard.</li>
                        </ul>
                        <p>
                            Do you accept these terms and wish to stay logged in?
                        </p>
                    </div>
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-zinc-700/50">
                        <Button variant="secondary" onClick={handleDeclineTerms}>Decline & Login</Button>
                        <Button variant="primary" onClick={handleAcceptTerms}>Accept & Login</Button>
                    </div>
                </Modal>
            )}
        </AnimatePresence>

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
                placeholder="Player Code / Admin Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
            />
             <Input 
                icon={<KeyIcon className="w-5 h-5"/>}
                type="password"
                placeholder="PIN / Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
            />
            
            <div className="flex items-center justify-start pt-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember this device
              </label>
            </div>

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

        {companyDetails.apkUrl && (
          <div className="mt-4">
            <a 
              href={companyDetails.apkUrl} 
              download="BosjolTactical.apk"
              className="inline-block w-full"
            >
              <Button variant="secondary" size="sm" className="w-full !py-2">
                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                Download Android APK
              </Button>
            </a>
          </div>
        )}

         {socialLinks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-700/50">
                <div className="flex items-center justify-center gap-6">
                    {socialLinks.map(link => (
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
