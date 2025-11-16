import React, { useState, useEffect, useContext, useRef } from 'react';
import { db, USE_FIREBASE, firebase } from '../firebase';
import { AuthContext } from '../auth/AuthContext';
import { DashboardCard } from './DashboardCard';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, TrashIcon } from './icons/Icons';
import { Button } from './Button';
import { Input } from './Input';
import type { ChatMessage, Player, Admin } from '../types';
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
    
    const currentUser = auth?.user as Player | Admin;
    const isAdmin = currentUser?.role === 'admin';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!USE_FIREBASE || !db) {
            setIsLoading(false);
            return;
        }

        const q = db.collection('chats').orderBy('createdAt', 'asc').limitToLast(100);

        const unsubscribe = q.onSnapshot(querySnapshot => {
            const msgs: ChatMessage[] = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    ...data,
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
        const authUID = (currentUser as Player)?.activeAuthUID || (firebase.auth().currentUser?.uid);
        if (!newMessage.trim() || !authUID || !db) return;

        setIsSending(true);
        const messageData = {
            text: newMessage.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            playerId: currentUser.id,
            playerName: currentUser.name,
            playerAvatarUrl: (currentUser as Player).avatarUrl,
            authUID: authUID,
            role: currentUser.role,
        };
        
        try {
            await db.collection('chats').add(messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!isAdmin || !db) return;
        if (confirm('Are you sure you want to delete this message?')) {
            try {
                await db.collection('chats').doc(messageId).delete();
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        }
    };

    if (!currentUser) {
        return <div className="text-center p-8">Error: No user data found.</div>
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
                                className={`flex items-end gap-2 group ${msg.playerId === currentUser.id ? 'justify-end' : ''}`}
                            >
                                {msg.playerId !== currentUser.id && (
                                    <img src={msg.playerAvatarUrl} alt={msg.playerName} className="w-8 h-8 rounded-full object-cover self-start flex-shrink-0" />
                                )}
                                <div className={`flex flex-col ${msg.playerId === currentUser.id ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative p-3 rounded-lg max-w-xs md:max-w-md ${msg.playerId === currentUser.id ? 'bg-red-600 text-white rounded-br-none' : 'bg-zinc-800 text-gray-200 rounded-bl-none'}`}>
                                        {isAdmin && (
                                            <button onClick={() => handleDelete(msg.id)} className="absolute -top-2 -right-2 bg-red-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIcon className="w-3 h-3"/>
                                            </button>
                                        )}
                                        {(msg.playerId !== currentUser.id || msg.role === 'admin') && (
                                          <p className={`text-xs font-bold mb-1 ${msg.role === 'admin' ? 'text-amber-300' : 'text-red-400'}`}>{msg.playerName} {msg.role === 'admin' && ' (Admin)'}</p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                     <p className="text-xs text-gray-500 mt-1 px-1">{timeSince(msg.createdAt)}</p>
                                </div>
                                {msg.playerId === currentUser.id && (
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
