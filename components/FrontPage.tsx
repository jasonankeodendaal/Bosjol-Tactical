import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanyDetails, CarouselMedia, SocialLink } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { AtSymbolIcon, PhoneIcon, GlobeAltIcon, InformationCircleIcon, DocumentIcon, ClipboardListIcon, CheckCircleIcon } from './icons/Icons';

const SignUpInfoModal: React.FC<{ companyDetails: CompanyDetails, onContinue: () => void }> = ({ companyDetails, onContinue }) => {
    const [copied, setCopied] = useState<'email' | 'phone' | null>(null);

    const handleCopy = (text: string, type: 'email' | 'phone') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };
    
    return (
        <Modal isOpen={true} onClose={onContinue} title="New Recruit Information">
            <div className="text-left">
                <div className="flex items-center justify-center mb-4 text-center border-b border-zinc-700/50 pb-4">
                    <DocumentIcon className="w-12 h-12 text-red-500 mr-4 flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-wider">MANDATORY BRIEFING</h3>
                        <p className="text-sm text-gray-400">Read the following before proceeding.</p>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                    <div>
                        <h4 className="font-bold text-lg text-red-400 mb-2">Welcome, Recruit.</h4>
                        <p className="text-gray-300 text-sm">
                            To enlist with Bosjol Tactical, you must make direct contact with command. Use the official channels listed below to begin your registration process.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-red-400 mb-2">CONTACT PROTOCOLS</h4>
                        <div className="space-y-3">
                            {companyDetails.email && (
                                <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50">
                                    <label className="text-xs text-gray-500 uppercase">Primary Channel (Email)</label>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-gray-200 font-mono">{companyDetails.email}</p>
                                        <button onClick={() => handleCopy(companyDetails.email, 'email')} className="text-gray-400 hover:text-white transition-colors">
                                            {copied === 'email' ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardListIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {companyDetails.phone && (
                                 <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50">
                                    <label className="text-xs text-gray-500 uppercase">Secondary Channel (Phone)</label>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-gray-200 font-mono">{companyDetails.phone}</p>
                                        <button onClick={() => handleCopy(companyDetails.phone, 'phone')} className="text-gray-400 hover:text-white transition-colors">
                                            {copied === 'phone' ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardListIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-red-400 mb-2">ENLISTMENT REQUIREMENTS</h4>
                         <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50">
                            <p className="text-gray-300 text-sm">
                                All operators must be <span className="font-bold text-white">{companyDetails.minimumSignupAge} years of age</span> or older. No exceptions.
                            </p>
                        </div>
                    </div>
                    
                     {companyDetails.fixedEventRules && (
                        <div>
                            <h4 className="font-bold text-lg text-red-400 mb-2">STANDARD OPERATING PROCEDURES</h4>
                            <div className="bg-zinc-900/70 p-3 rounded-md border border-zinc-700 h-32 overflow-y-auto">
                                <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans">
                                    {companyDetails.fixedEventRules}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-700/50">
                    <Button variant="primary" onClick={onContinue} size="md" className="w-full">
                        I Understand - Proceed to Authentication
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


export const FrontPage: React.FC<{ companyDetails: CompanyDetails, socialLinks: SocialLink[], carouselMedia: CarouselMedia[], onEnter: () => void }> = ({ companyDetails, socialLinks, carouselMedia, onEnter }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showInfoModal, setShowInfoModal] = useState(false);
    
    useEffect(() => {
        if (carouselMedia.length <= 1) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselMedia.length);
        }, 8000); // Change slide every 8 seconds

        return () => clearTimeout(timer);
    }, [currentIndex, carouselMedia.length]);

    const variants = {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
    };
    
    return (
        <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
             {showInfoModal && <SignUpInfoModal companyDetails={companyDetails} onContinue={onEnter} />}

            <AnimatePresence initial={false}>
                {carouselMedia.length > 0 && (
                     <motion.div
                        key={currentIndex}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ opacity: { duration: 1.5 } }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {carouselMedia[currentIndex].type === 'video' ? (
                            <video
                                src={carouselMedia[currentIndex].url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                             <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${carouselMedia[currentIndex].url})` }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="relative z-10 text-center p-4">
                 <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <img src={companyDetails.logoUrl} alt="Logo" className="h-24 mx-auto mb-4" />
                    <h1 
                        className="text-6xl md:text-8xl font-black text-red-500 tracking-widest uppercase glitch-text"
                        data-text={companyDetails.name}
                    >
                        {companyDetails.name}
                    </h1>
                 </motion.div>
                 <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1, type: 'spring' }}
                    className="mt-12"
                 >
                    <Button 
                        onClick={() => setShowInfoModal(true)}
                        className="!text-xl !px-10 !py-4 shadow-lg shadow-red-900/50"
                    >
                        SUIT UP
                    </Button>
                </motion.div>
            </div>
             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {carouselMedia.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-500'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};