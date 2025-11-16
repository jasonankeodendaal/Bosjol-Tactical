/** @jsxImportSource react */
import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../auth/AuthContext';
import { Button } from './Button';
import { KeyIcon, ExclamationTriangleIcon } from './icons/Icons';
import { Player, CompanyDetails } from '../types';

interface PinEntryScreenProps {
  player: Player;
  companyDetails: CompanyDetails;
  onSwitchUser: () => void;
}

export const PinEntryScreen: React.FC<PinEntryScreenProps> = ({ player, companyDetails, onSwitchUser }) => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { login } = auth;

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Move focus to next input
      if (value !== '' && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      setError("PIN must be 6 digits.");
      return;
    }
    
    try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/cod-mw-ui-sfx-2.mp3');
        audio.volume = 0.5;
        audio.play();
    } catch (err) {
        console.error("Failed to play login sound:", err);
    }

    setIsLoading(true);
    setError(null);

    const success = await login(player.playerCode, fullPin);
    if (!success) {
      setError("Invalid PIN. Please try again.");
      setPin(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    }
    setIsLoading(false);
  };
  
  const backgroundUrl = companyDetails.loginBackgroundUrl;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-transparent p-4 overflow-hidden">
      {backgroundUrl && (
        <div
          className="absolute z-0 w-full h-full bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-1"></div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-sm mx-auto text-center bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-lg shadow-2xl shadow-black/50"
      >
        <img src={player.avatarUrl} alt={player.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-red-500 object-cover" />
        <h2 className="text-xl font-bold text-white">Welcome back, {player.name}</h2>
        <p className="text-gray-400 mb-8">Enter your PIN to continue</p>
        
        <form onSubmit={handleLogin}>
            <div className="flex justify-center gap-2 mb-6" aria-label="PIN Code Entry">
                {pin.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => { inputsRef.current[index] = el; }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-14 bg-zinc-900 border border-zinc-700 rounded-lg text-center text-3xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                        autoComplete="one-time-code"
                    />
                ))}
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/50 border border-red-700 text-red-200 text-sm p-3 rounded-md flex items-center justify-center gap-2 mb-6"
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
                {isLoading ? 'Verifying...' : 'Authenticate'}
            </Button>
        </form>
        
        <button onClick={onSwitchUser} className="text-sm text-gray-500 hover:text-red-400 mt-6 transition-colors">
            Not you? Switch user
        </button>

      </motion.div>
    </div>
  );
};

export default PinEntryScreen;