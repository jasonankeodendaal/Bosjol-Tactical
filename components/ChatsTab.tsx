import React from 'react';
import PlayerChatsTab from './PlayerChatsTab';

// This component simply wraps the main PlayerChatsTab component,
// which is now role-aware and will display admin features when an admin is logged in.
// This avoids code duplication and keeps the chat system unified.
const ChatsTab: React.FC = () => {
    return <PlayerChatsTab />;
};

export { ChatsTab };
export default ChatsTab;
