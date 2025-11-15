
import React from 'react';
import { DashboardCard } from './DashboardCard';
import { ChatBubbleLeftRightIcon } from './icons/Icons';

export const ChatsTab: React.FC = () => {
    return (
        <DashboardCard title="Operator Communications" icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}>
            <div className="p-6 text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-xl font-bold text-white">Feature Under Development</h3>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                    The Operator Communications Hub is currently being built. Soon, this is where you'll be able to engage in live chats, send direct messages, and broadcast announcements to all players.
                </p>
            </div>
        </DashboardCard>
    );
};
