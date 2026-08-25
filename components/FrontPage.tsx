import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanyDetails, CarouselMedia, SocialLink } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { DocumentIcon } from './icons/Icons';

const SignUpInfoModal: React.FC<{ companyDetails: CompanyDetails, onContinue: () => void }> = ({ companyDetails, onContinue }) => {
    const [copied, setCopied] = useState(false);

    const signupMessageTemplate = `Hello Bosjol Tactical Command,

I am interested in enlisting. Please find my details for registration below:

- Full Name: 
- Requested Callsign (Subject to Command/Admin Approval): 
- Age: 
- South African ID Number: 
- Contact Number: 
- Email Address: 

I have read and understood the Standard Operating Procedures and meet the minimum age requirement of ${companyDetails.minimumSignupAge || 16}.

Thank you.
`;

    const contactEmail = companyDetails.email || 'bosjoltactical@gmail.com';
    const emailHref = `mailto:${contactEmail}?subject=${encodeURIComponent('New Recruit Enlistment Request')}&body=${encodeURIComponent(signupMessageTemplate)}`;
    
    // Improved WhatsApp number formatting
    const formatWhatsAppNumber = (phone: string | undefined): string => {
        if (!phone) return '27821234567';
        // Remove all non-digit characters
        let digitsOnly = phone.replace(/\D/g, '');
        // Check if it's a 10-digit SA number starting with 0
        if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
            // Replace the leading 0 with the country code 27
            return '27' + digitsOnly.substring(1);
        }
        return digitsOnly || '27821234567';
    };
    
    const whatsappRawPhone = companyDetails.phone || '+27821234567';
    const whatsappNumber = formatWhatsAppNumber(whatsappRawPhone);
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(signupMessageTemplate)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(signupMessageTemplate);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };
    
    return (
        <Modal isOpen={true} onClose={onContinue} title="New Recruit Information">
            <div className="text-left space-y-2.5 sm:space-y-4 text-xs sm:text-sm">
                <div className="flex items-center justify-center mb-1.5 sm:mb-2 text-center border-b border-zinc-700/50 pb-2 sm:pb-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mr-2.5 sm:mr-4 flex-shrink-0 text-red-500">
                        <DocumentIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm sm:text-2xl font-black text-white tracking-wider uppercase">MANDATORY BRIEFING</h3>
                        <p className="text-[10px] sm:text-sm text-zinc-400">Follow enlistment protocol below to contact Command.</p>
                    </div>
                </div>

                <div className="max-h-[70vh] sm:max-h-[62vh] overflow-y-auto pr-1 sm:pr-2 space-y-2.5 sm:space-y-5">
                    <div className="bg-zinc-900/60 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border border-zinc-800">
                        <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-red-400 mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Welcome, Recruit
                        </h4>
                        <p className="text-zinc-300 text-[11px] sm:text-sm leading-tight sm:leading-relaxed">
                            To enlist with <strong className="text-white">Bosjol Tactical</strong>, initiate contact directly with Command. Click <strong className="text-emerald-400">WhatsApp</strong> or <strong className="text-red-400">Email</strong> channel below to launch pre-formatted application.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 mb-1.5 sm:mb-3">
                            OFFICIAL DISPATCH CHANNELS
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
                            {/* WhatsApp Action Button */}
                            <a 
                                href={whatsappHref} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="group relative flex flex-col p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-950/80 to-zinc-900 border border-emerald-500/40 hover:border-emerald-400 transition-all transform active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
                                            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.398C8.423 21.498 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.63 0-3.149-.479-4.431-1.306l-.317-.203-2.973.834.801-2.929-.224-.337A8.125 8.125 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                                        </svg>
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-white text-xs sm:text-sm group-hover:text-emerald-300 truncate">WhatsApp</div>
                                        <div className="text-[9px] sm:text-[11px] text-emerald-400/80 font-mono truncate">{whatsappRawPhone}</div>
                                    </div>
                                </div>
                                <div className="mt-auto pt-1 sm:pt-2 flex items-center justify-between border-t border-emerald-900/40 text-[9px] sm:text-xs font-semibold text-emerald-400">
                                    <span className="truncate">Register</span>
                                    <span className="text-xs">💬 &rarr;</span>
                                </div>
                            </a>

                            {/* Email Action Button */}
                            <a 
                                href={emailHref} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="group relative flex flex-col p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-950/80 to-zinc-900 border border-red-500/40 hover:border-red-400 transition-all transform active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-red-500/20 border border-red-400/50 flex items-center justify-center text-red-400 group-hover:scale-105 transition-all flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-white text-xs sm:text-sm group-hover:text-red-300 truncate">Email</div>
                                        <div className="text-[9px] sm:text-[11px] text-red-400/80 truncate font-mono">{contactEmail}</div>
                                    </div>
                                </div>
                                <div className="mt-auto pt-1 sm:pt-2 flex items-center justify-between border-t border-red-900/40 text-[9px] sm:text-xs font-semibold text-red-400">
                                    <span className="truncate">Enlist Email</span>
                                    <span className="text-xs">✉️ &rarr;</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Copy Template Section */}
                    <div className="bg-zinc-950 p-2 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Template Preview</span>
                            <button 
                                onClick={handleCopy}
                                className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <span className="text-green-400">✓</span>
                                        <span className="text-green-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📋</span>
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="text-zinc-400 text-[9px] sm:text-[11px] whitespace-pre-wrap font-mono bg-zinc-900/90 p-2 sm:p-2.5 rounded border border-zinc-800/80 max-h-16 sm:max-h-28 overflow-y-auto">
                            {signupMessageTemplate}
                        </pre>
                    </div>

                    {companyDetails.fixedEventRules && (
                        <div>
                            <h4 className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-red-400 mb-1 sm:mb-2">STANDARD OPERATING PROCEDURES</h4>
                            <pre className="text-zinc-300 text-[9px] sm:text-[11px] whitespace-pre-wrap font-sans bg-zinc-900/50 p-2 sm:p-3 rounded-lg border border-zinc-800 max-h-20 sm:max-h-32 overflow-y-auto">
                                {companyDetails.fixedEventRules}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-700/50">
                    <Button onClick={onContinue} className="w-full font-bold !py-1.5 sm:!py-2.5 text-xs sm:text-base">Understood, Continue to Tactical System</Button>
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