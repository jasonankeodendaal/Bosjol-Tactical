

import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import { Button } from './components/Button';
import type { Player, GameEvent, CompanyDetails, SocialLink, CarouselMedia, CreatorDetails, Tier, Badge, Signup, Rank, XpAdjustment } from './types';
import { XIcon, KeyIcon, ShieldCheckIcon, TrophyIcon, ExclamationTriangleIcon } from './components/icons/Icons';
import { DataProvider, DataContext, IS_LIVE_DATA } from './data/DataContext';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { HelpSystem } from './components/Help';
import { StorageStatusIndicator } from './components/StorageStatusIndicator';
import { MockDataWatermark } from './components/MockDataWatermark';
import { Input } from './components/Input';
import { DashboardBackground } from './components/DashboardBackground';
import { USE_FIREBASE, isFirebaseConfigured, firebaseInitializationError } from './firebase';


// --- Switched from lazy to direct imports to fix critical module loading error ---
import { LoginScreen } from './components/LoginScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import FrontPage from './components/FrontPage';
import { CreatorDashboard } from './components/CreatorDashboard';


// --- Creator Popup Component and Icons ---
const CreatorPopup: React.FC<{
    onClose: () => void;
    creatorDetails: CreatorDetails;
}> = ({ onClose, creatorDetails }) => {
    
    const clientInquiryTemplate = `Hello JSTYP.me,

I came across your work on the Bosjol Tactical Dashboard and I'm interested in discussing a potential project.

Please see my details below for your convenience:

- Project Name/Idea: 
- My Name: 
- Company Name (if applicable): 
- Brief Project Description: 
- Estimated Budget (Optional): 
- Best Contact Method (Email/Phone): 

Thank you, I look forward to hearing from you.
`;

    const emailSubject = "Project Inquiry via Bosjol Tactical Dashboard";
    const emailHref = `mailto:${creatorDetails.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(clientInquiryTemplate)}`;
    
    const whatsappNumber = creatorDetails.whatsapp.replace(/\D/g, '');
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(clientInquiryTemplate)}`;


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]"
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{
                    backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.85)), url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close creator popup">
                    <XIcon className="w-6 h-6" />
                </button>

                 <div className="p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src={creatorDetails.logoUrl} alt={`${creatorDetails.name} Logo`} className="h-24 w-auto mb-3" />
                        <h3 className="text-3xl font-bold text-white tracking-wider">{creatorDetails.name}</h3>
                        <p className="text-md text-red-400 font-semibold italic mt-1">"{creatorDetails.tagline}"</p>
                    </div>
                    
                    <p className="text-center text-gray-300 text-sm mb-6 pb-6 border-b border-zinc-700/50">{creatorDetails.bio}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <a href={emailHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-red-500/50 transition-all">
                            <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" alt="Email" className="w-8 h-8"/>
                            <span className="font-semibold text-white">Email Me</span>
                        </a>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-red-500/50 transition-all">
                            <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-8 h-8"/>
                            <span className="font-semibold text-white">WhatsApp</span>
                        </a>
                    </div>
                     <p className="text-xs text-center text-gray-500 uppercase tracking-wider font-semibold">Creator Access via Login Screen</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PublicPageFloatingIcons: React.FC<{
    onHelpClick: () => void,
    onCreatorClick: () => void,
}> = ({ onHelpClick, onCreatorClick }) => (
    <>
        {/* Help Icon */}
        <motion.button
            onClick={onHelpClick}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, rotate: -15 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-5 left-5 z-20 bg-zinc-900/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-zinc-700"
            title="Help"
            aria-label="Open help menu"
        >
            <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Help Icon" className="w-10 h-10" />
        </motion.button>

        {/* Creator Icon */}
        <motion.button
            onClick={onCreatorClick}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-5 right-5 z-20 bg-zinc-900/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-zinc-700"
            title="Creator Information"
            aria-label="Open creator information"
        >
            <img src="https://i.ibb.co/0phm4WGq/image-removebg-preview.png" alt="Creator Icon" className="w-10 h-10" />
        </motion.button>
    </>
);


// --- END Creator Popup ---

const PromotionModal: React.FC<{
    promotion: { newTier?: Tier; oldTier?: Tier; newBadges: Badge[], xpGained: number, currentXp: number, bonusXp: number, rewards: string[], finalXp: number },
    onDismiss: () => void;
    ranks: Rank[];
}> = ({ promotion, onDismiss, ranks }) => {

    const { oldTier, newTier, xpGained, bonusXp, rewards, finalXp } = promotion;
    
    // Recalculate progression for display based on the final XP (current + bonus)
    const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean).sort((a, b) => a.minXp - b.minXp);
    const finalTierAfterBonus = [...allTiers].reverse().find(r => finalXp >= r.minXp);
    const finalTierIndex = allTiers.findIndex(r => r.id === finalTierAfterBonus?.id);
    const nextTierAfterBonus = finalTierIndex !== -1 && finalTierIndex < allTiers.length - 1 ? allTiers[finalTierIndex + 1] : null;

    const startXp = oldTier?.minXp || 0;
    const endXp = nextTierAfterBonus ? nextTierAfterBonus.minXp : finalXp;
    const progressPercentage = endXp > startXp ? ((finalXp - startXp) / (endXp - startXp)) * 100 : 100;

    return (
        <div className="promotion-backdrop" onClick={onDismiss}>
            <motion.div 
                className="promotion-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <div className="rank-display-grid">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0, transition:{ delay: 0.2 }}} className="rank-item previous">
                        {oldTier && <>
                            <img src={oldTier.iconUrl} alt={oldTier.name} className="w-20 h-20" />
                            <p>{oldTier.name}</p>
                        </>}
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1, transition:{ delay: 0, type: 'spring', stiffness: 150 }}} className="rank-item current">
                       {newTier && <>
                            <div className="rank-item-hex">
                               <img src={newTier.iconUrl} alt={newTier.name} />
                            </div>
                            <p>{newTier.name}</p>
                        </>}
                    </motion.div>

                    <div className="rank-item next">{/* Placeholder for next rank if needed */}</div>
                </div>

                {newTier && <h2 className="rank-item-header">Tier Up</h2>}

                <div className="xp-bar-container">
                    <div className="xp-bar-info">