import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InformationCircleIcon, XIcon } from './icons/Icons';
import { HELP_CONTENT } from '../helpContent';
import { Modal } from './Modal';

interface HelpSystemProps {
    topic: string;
}

const HelpModal: React.FC<{ topic: string, onClose: () => void }> = ({ topic, onClose }) => {
    const content = HELP_CONTENT[topic];

    if (!content) {
        return (
             <Modal isOpen={true} onClose={onClose} title="Help Not Found">
                <p>Detailed help for this section is not available yet.</p>
            </Modal>
        )
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={content.title}>
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 text-gray-300">
                <p className="text-sm">{content.description}</p>
                {content.sections.map((section, index) => (
                    <div key={index} className="pt-3 border-t border-zinc-700/50">
                        <h4 className="font-bold text-lg text-red-400 mb-2">{section.heading}</h4>
                        <div className="text-sm prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-red-400">
                             {section.content}
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-6 pt-4 border-t border-zinc-700/50">
                <button
                    onClick={onClose}
                    className="w-full bg-zinc-700 text-white py-2 rounded-md hover:bg-zinc-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export const HelpSystem: React.FC<HelpSystemProps> = ({ topic }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-16 right-6 z-50 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg help-icon-pulse"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Help"
                aria-label="Open help modal"
            >
                <span className="font-bold text-2xl italic">i</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && <HelpModal topic={topic} onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
};
