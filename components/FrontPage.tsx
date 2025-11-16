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
                               