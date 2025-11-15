import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanyDetails, CarouselMedia, SocialLink } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { AtSymbolIcon, PhoneIcon, GlobeAltIcon, InformationCircleIcon, DocumentIcon, ClipboardListIcon, CheckCircleIcon, HelmetPhoneIcon, VestEmailIcon } from './icons/Icons';

const SignUpInfoModal: React.FC<{ companyDetails: CompanyDetails, onContinue: () => void }> = ({ companyDetails, onContinue }) => {
    const [copied, setCopied] = useState<'email' | 'phone' | null>(null);

    const signupMessageTemplate = `Hello Bosjol Tactical Command,

I am interested in enlisting. Please find my details for registration below:

- Full Name: 
- Callsign (In-game name): 
- Age: 
- South African ID Number: 
- Contact Number: 
- Email Address: 

I have read and understood the Standard Operating Procedures and meet the minimum age requirement of ${companyDetails.minimumSignupAge}.

Thank you.
`;

    const handleCopy = (text: string, type: 'email' | 'phone') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const emailHref = `mailto:${companyDetails.email}?subject=${encodeURIComponent('New Recruit Enlistment Request')}&body=${encodeURIComponent(signupMessageTemplate)}`;
    
    // Improved WhatsApp number formatting
    const formatWhatsAppNumber = (phone: string | undefined): string => {
        if (!phone) return '';
        // Remove all non-digit characters
        let digitsOnly = phone.replace(/\D/g, '');
        // Check if it's a 10-digit SA number starting with 0
        if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
            // Replace the leading 0 with the country code 27
            return '27' + digitsOnly.substring(1);
        }
        // If it was entered as +27... the replace(/\D/g, '') would have already made it 27...
        return digitsOnly;
    };
    
    const whatsappNumber = formatWhatsAppNumber(companyDetails.phone);
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(signupMessageTemplate)}`;
    
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
                                <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50 flex items-center gap-4">
                                    <a href={emailHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-grow min-w-0 group">
                                        <VestEmailIcon className="w-10 h-10 text-red-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-gray-200 font-mono truncate group-hover:text-red-300 transition-colors">{companyDetails.email}</p>
                                            <label className="text-xs text-gray-500 uppercase">Primary Channel (Click to Email)</label>
                                        </div>
                                    </a>
                                    <button onClick={() => handleCopy(companyDetails.email, 'email')} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                        {copied === 'email' ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardListIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                            {companyDetails.phone && whatsappNumber && (
                                 <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50 flex items-center gap-4">
                                     <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-grow min-w-0 group">
                                        <HelmetPhoneIcon className="w-10 h-10 text-red-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-gray-200 font-mono truncate group-hover:text-red-300 transition-colors">{companyDetails.phone}</p>
                                            <label className="text-xs text-gray-500 uppercase">Secondary Channel (Click for WhatsApp)</label>
                                        </div>
                                     </a>
                                    <button onClick={() => handleCopy(companyDetails.phone, 'phone')} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                        {copied === 'phone' ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardListIcon className="w-5 h-5" />}
                                    </button>
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
                        Gear up and join the team
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
