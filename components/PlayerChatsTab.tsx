import React, { useState, useEffect, useContext, useRef } from 'react';
import { db, USE_FIREBASE, firebase } from '../firebase';
import { AuthContext } from '../auth/AuthContext';
import { DashboardCard } from './DashboardCard';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from './icons/Icons';
import { Button } from './Button';
import { Input } from './Input';
import type { ChatMessage, Player } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

const timeSince = (date: Date): string => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    if (seconds < 10) return "just now";
    return `${Math.floor(seconds)}s ago`;
};

const PlayerChatsTab: React.FC = () => {
    const auth = useContext(AuthContext);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const player = auth?.user as Player;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!USE_FIREBASE || !db) {
            // Handle mock data mode if needed, for now just show empty.
            setIsLoading(false);
            return;
        }

        const q = db.collection('chats').orderBy('createdAt', 'asc').limitToLast(50);

        const unsubscribe = q.onSnapshot(querySnapshot => {
            const msgs: ChatMessage[] = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to JS Date
                    createdAt: data.createdAt?.toDate()
                } as ChatMessage);
            });
            setMessages(msgs);
            setIsLoading(false);
        }, error => {
            console.error("Error fetching chat messages:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !player?.activeAuthUID || !db) return;

        setIsSending(true);
        const messageData = {
            text: newMessage.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            playerId: player.id,
            playerName: player.name,
            playerAvatarUrl: player.avatarUrl,
            authUID: player.activeAuthUID,
        };
        
        try {
            await db.collection('chats').add(messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally show an error to the user
        } finally {
            setIsSending(false);
        }
    };

    if (!player) {
        return <div className="text-center p-8">Error: No player data found.</div>
    }

    if (isLoading) {
        return <div className="text-center p-8">Loading chat...</div>
    }

    return (
        <DashboardCard title="Global Comms Channel" icon={<ChatBubbleLeftRightIcon className="w-6 h-6"/>} fullHeight>
            <div className="flex flex-col h-[75vh]">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    <AnimatePresence>
                        {messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex items-end gap-2 ${msg.playerId === player.id ? 'justify-end' : ''}`}
                            >
                                {msg.playerId !== player.id && (
                                    <img src={msg.playerAvatarUrl} alt={msg.playerName} className="w-8 h-8 rounded-full object-cover self-start flex-shrink-0" />
                                )}
                                <div className={`flex flex-col ${msg.playerId === player.id ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${msg.playerId === player.id ? 'bg-red-600 text-white rounded-br-none' : 'bg-zinc-800 text-gray-200 rounded-bl-none'}`}>
                                        {msg.playerId !== player.id && <p className="text-xs font-bold text-red-400 mb-1">{msg.playerName}</p>}
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                     <p className="text-xs text-gray-500 mt-1 px-1">{timeSince(msg.createdAt)}</p>
                                </div>
                                {msg.playerId === player.id && (
                                    <img src={msg.playerAvatarUrl} alt={msg.playerName} className="w-8 h-8 rounded-full object-cover self-start flex-shrink-0" />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-zinc-800">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow"
                            disabled={isSending}
                            autoComplete="off"
                        />
                        <Button type="submit" disabled={isSending || !newMessage.trim()} className="!px-4">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </DashboardCard>
    );
};

export default PlayerChatsTab;