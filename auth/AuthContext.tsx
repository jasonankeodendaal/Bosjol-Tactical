

import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
// FIX: Updated imports to use MOCK_PLAYERS and MOCK_ADMIN.
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
// FIX: Removed Firebase specific imports as it is no longer used.
import { USE_FIREBASE, firebaseInitializationError } from '../firebase';
import { DataContext } from '../data/DataContext';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

const ADMIN_EMAIL = 'bosjoltactical@gmail.com';
const CREATOR_EMAIL = 'jstypme@gmail.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [helpTopic, setHelpTopic] = useState('front-page');
    const dataContext = useContext(DataContext);

    useEffect(() => {
        // If Firebase is not used or configured, ensure user is null
        // and handle authentication with mock data or API based on IS_LIVE_DATA
        if (!USE_FIREBASE || firebaseInitializationError) {
             setLoading(false);
             // In a purely API-driven scenario without Firebase, you might have
             // a different mechanism for initial user check, or simply start unauthenticated.
             setUser(null); 
             return;
        }

        // --- Firebase-specific code removed for onAuthStateChanged ---
        // As Firebase is globally disabled, this block is unreachable.
        // In a hybrid scenario, this would be re-enabled if USE_FIREBASE was true
        // and firebase.ts was configured.
        setLoading(false); // If USE_FIREBASE is true but setup failed, still stop loading.

    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        
        // Handle Admin or Creator Firebase login
        const emailUsername = cleanUsername.toLowerCase();
        if (emailUsername === ADMIN_EMAIL || emailUsername === CREATOR_EMAIL) {
            // FIX: Removed Firebase specific login attempts since USE_FIREBASE is false.
            // Mock admin login (creator has no mock login for now)
            if (emailUsername === ADMIN_EMAIL && cleanPassword === '1234') {
                setUser(MOCK_ADMIN);
                dataContext?.logActivity('Logged In');
                return true;
            }
            return false;
        }
        
        // Player login logic
        // FIX: Removed Firebase specific login attempts since USE_FIREBASE is false.
        // Mock player login
        const player = MOCK_PLAYERS.find(p => 
            p.playerCode.toUpperCase() === cleanUsername.toUpperCase() && p.pin === cleanPassword
        );
        if (player) {
            setUser(player);
            dataContext?.logActivity('Logged In');
            return true;
        }
        return false;
    };
    
    // Log activity on user state change (successful login)
    useEffect(() => {
        if (user && dataContext) {
            dataContext.logActivity('Logged In');
        }
    }, [user, dataContext]);


    const logout = async () => {
        // FIX: Removed Firebase-specific logout logic as Firebase is globally disabled.
        setUser(null);
    };

    const updateUser = (updatedUser: User | Player | Admin) => {
        setUser(updatedUser);
    }

    if (loading && USE_FIREBASE) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, helpTopic, setHelpTopic }}>
            {children}
        </AuthContext.Provider>
    );
};