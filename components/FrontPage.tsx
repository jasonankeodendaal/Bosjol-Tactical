import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanyDetails } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { AtSymbolIcon, PhoneIcon, GlobeAltIcon, InformationCircleIcon } from './icons/Icons';

const SignUpInfoModal: React.FC<{ companyDetails: CompanyDetails, onContinue: () => void }> = ({ companyDetails, onContinue }) => (
    <Modal isOpen={true} onClose={onContinue} title="New Recruit Information">
        <div className="text-center">
            <InformationCircleIcon className="w-16 h-16 mx-auto text-red-500 mb-4"/>
            <p className="text-lg text-gray-200 mb-4">To sign up for duty, please contact command leadership directly:</p>
            <div className="space-y-3 text-gray-300 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                {companyDetails.email && (
                    <div className="flex items-center justify-center gap-2">
                        <AtSymbolIcon className="w-5 h-5 text-red-400"/>
                        <span>{companyDetails.email}</span>
                    </div>
                )}
                {companyDetails.phone && (
                     <div className="flex items-center justify-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-red-400"/>
                        <span>{companyDetails.phone}</span>
                    </div>
                )}
                {companyDetails.website && (
                     <a href={companyDetails.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-red-400 hover:underline">
                        <GlobeAltIcon className="w-5 h-5"/>
                        <span>Visit Website</span>
                    </a>
                )}
            </div>
            <div className="mt-6">
                <Button variant="secondary" onClick={onContinue} size="sm">
                    Continue to Login
                </Button>
            </div>
        </div>
    </Modal>
);

export const FrontPage: React.FC<{ companyDetails: CompanyDetails, onEnter: () => void }> = ({ companyDetails, onEnter }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const media = companyDetails.carouselMedia || [];

    useEffect(() => {
        if (media.length <= 1) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
        }, 8000); // Change slide every 8 seconds

        return () => clearTimeout(timer);
    }, [currentIndex, media.length]);

    const variants = {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
    };
    
    return (
        <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
             {showInfoModal && <SignUpInfoModal companyDetails={companyDetails} onContinue={onEnter} />}

            <AnimatePresence initial={false}>
                {media.length > 0 && (
                     <motion.div
                        key={currentIndex}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ opacity: { duration: 1.5 } }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {media[currentIndex].type === 'video' ? (
                            <video
                                src={media[currentIndex].url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                             <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${media[currentIndex].url})` }}
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
                {media.map((_, index) => (
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