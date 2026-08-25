import React from 'react';
import type { Player } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { AtSymbolIcon, PhoneIcon } from './icons/Icons';

interface SendCredentialsModalProps {
    player: Player;
    onClose: () => void;
}

const formatPhoneNumberForWhatsApp = (phone: string): string => {
    if (!phone) return '';
    let digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
        return '27' + digitsOnly.substring(1);
    }
    return digitsOnly;
};

export const SendCredentialsModal: React.FC<SendCredentialsModalProps> = ({ player, onClose }) => {
    const message = `Hello ${player.name},\n\nWelcome to Bosjol Tactical! Here are your login credentials for the dashboard:\n\nPlayer Code: ${player.playerCode}\nPIN: ${player.pin}\n\nKeep these details safe. See you on the field!\n\n- Bosjol Tactical Command`;

    const emailHref = `mailto:${player.email}?subject=${encodeURIComponent('Your Bosjol Tactical Login Credentials')}&body=${encodeURIComponent(message)}`;
    
    const whatsappNumber = formatPhoneNumberForWhatsApp(player.phone);
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const smsHref = `sms:${player.phone}?&body=${encodeURIComponent(message)}`;

    return (
        <Modal isOpen={true} onClose={onClose} title={`Send Credentials: ${player.name}`}>
            <div className="text-center space-y-2 sm:space-y-4 text-xs sm:text-base">
                <div className="flex justify-center gap-4 bg-zinc-950/60 p-2 sm:p-3 rounded-lg border border-zinc-800">
                    <p className="text-gray-300">Code: <span className="font-mono font-bold text-red-400">{player.playerCode}</span></p>
                    <p className="text-gray-300">PIN: <span className="font-mono font-bold text-red-400">{player.pin}</span></p>
                </div>
                
                <p className="text-gray-400 text-[11px] sm:text-sm pt-2 sm:pt-4 border-t border-zinc-700/50">Choose a method to send details:</p>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
                    <a href={emailHref} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="secondary" size="sm" className="w-full !px-1.5 !py-1 sm:!py-2.5">
                            <AtSymbolIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            Email
                        </Button>
                    </a>
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block">
                         <Button variant="secondary" size="sm" className="w-full !px-1.5 !py-1 sm:!py-2.5">
                            <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" alt="WhatsApp" className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2"/>
                            WhatsApp
                        </Button>
                    </a>
                    <a href={smsHref} target="_blank" rel="noopener noreferrer" className="block">
                         <Button variant="secondary" size="sm" className="w-full !px-1.5 !py-1 sm:!py-2.5">
                            <PhoneIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            SMS
                        </Button>
                    </a>
                </div>

                <div className="pt-2 sm:pt-4">
                    <Button onClick={onClose} className="w-full !py-1.5 sm:!py-2.5" size="sm">
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
