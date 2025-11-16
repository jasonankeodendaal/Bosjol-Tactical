import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanyDetails, CarouselMedia, SocialLink } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { DocumentIcon } from './icons/Icons';

const SignUpInfoModal: React.FC<{ companyDetails: CompanyDetails, onContinue: () => void }> = ({ companyDetails, onContinue }) => {
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
                        <p className="text-gray-300 text-sm mb-4">
                            Click an icon below to open your Email or WhatsApp with a pre-filled template to begin registration.
                        </p>
                        <div className="flex justify-center gap-8 py-4">
                            {companyDetails.email && (
                                <a href={emailHref} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110" title="Send an Email">
                                    <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" alt="Email" className="w-16 h-16" />
                                </a>
                            )}
                            {companyDetails.phone && whatsappNumber && (
                                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110" title="Message on WhatsApp">
                                    <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-16 h-16" />
                                </a>
                            )}
                        </div>
                    </div>

                    {companyDetails.fixedEventRules && (
                        <div>
                            <h4 className="font-bold text-lg text-red-400 mb-2">STANDARD OPERATING PROCEDURES</h4>
                            <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50">
                                {companyDetails.fixedEventRules}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-700/50">
                    <Button onClick={onContinue} className="w-full">Understood, Continue</Button>
                </div>
            </div>
        </Modal>
    );
};

interface FrontPageProps {
    companyDetails: CompanyDetails;
    socialLinks: SocialLink[];
    carouselMedia: CarouselMedia[];
    onEnter: () => void;
}

export const FrontPage: React.FC<FrontPageProps> = ({ companyDetails, socialLinks, carouselMedia, onEnter }) => {
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    useEffect(() => {
        if (carouselMedia.length > 1) {
            const timer = setInterval(() => {
                setCurrentMediaIndex(prevIndex => (prevIndex + 1) % carouselMedia.length);
            }, 7000); // Change media every 7 seconds
            return () => clearInterval(timer);
        }
    }, [carouselMedia.length]);

    const handleEnter = () => {
        try {
            const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_76495610fc.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch (err) {
            console.error("Failed to play enter sound:", err);
        }
        onEnter();
    };

    const currentMedia = carouselMedia[currentMediaIndex];

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-black p-4 overflow-hidden">
            <AnimatePresence>
                {currentMedia && (
                    <motion.div
                        key={currentMedia.id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="absolute inset-0"
                    >
                        {currentMedia.type === 'video' ? (
                            <video
                                key={currentMedia.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={currentMedia.url} />
                            </video>
                        ) : (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${currentMedia.url})` }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            
            <AnimatePresence>
                {showSignUpModal && (
                    <SignUpInfoModal companyDetails={companyDetails} onContinue={handleEnter} />
                )}
            </AnimatePresence>
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="relative z-10 text-center"
            >
                {companyDetails.logoUrl && (
                    <img src={companyDetails.logoUrl} alt={`${companyDetails.name} Logo`} className="h-20 sm:h-24 mx-auto mb-4" />
                )}
                <h1 
                  className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-widest uppercase glitch-text mb-4"
                  data-text="Bosjol Tactical"
                >
                  Bosjol Tactical
                </h1>
                <h2 className="text-md sm:text-lg text-red-400 font-semibold italic">"Where weekends become warzones"</h2>
                
                <div className="mt-12 space-y-4 max-w-sm mx-auto">
                    <Button onClick={() => setShowSignUpModal(true)} className="w-full !py-3 text-md">
                        Enlist as a New Recruit
                    </Button>
                     <Button onClick={handleEnter} variant="secondary" className="w-full !py-3 text-md">
                        Returning Operator Login
                    </Button>
                </div>
            </motion.div>

             {socialLinks.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
                >
                    <div className="flex items-center justify-center gap-6 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full border border-zinc-800">
                        {socialLinks.map(link => (
                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:scale-110 transition-transform">
                                <img src={link.iconUrl} alt={link.name} className="h-6 w-6 object-contain" title={link.name} />
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default FrontPage;