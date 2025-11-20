

import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN, MOCK_CREATOR_CORE } from '../constants';
// Removed 'app' import as Firebase is disabled
import { USE_FIREBASE, firebaseInitializationError, auth as firebaseAuthInstance } from '../firebase'; // Import firebase auth instance
// FIX: Corrected DataContext import path.
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
        if (USE_FIREBASE && firebaseAuthInstance) {
            const unsubscribe = firebaseAuthInstance.onAuthStateChanged(async (firebaseUser) => {
                if (firebaseUser) {
                    // Check if it's the admin or creator
                    if (firebaseUser.email === ADMIN_EMAIL) {
                        setUser({ ...MOCK_ADMIN, id: firebaseUser.uid, email: firebaseUser.email, firebaseAuthUID: firebaseUser.uid });
                    } else if (firebaseUser.email === CREATOR_EMAIL) {
                        setUser({ ...MOCK_CREATOR_CORE, id: firebaseUser.uid, email: firebaseUser.email, role: 'creator' });
                    } else {
                        // Attempt to find player linked by Firebase UID
                        const player = dataContext?.players.find(p => p.activeAuthUID === firebaseUser.uid);
                        if (player) {
                            setUser(player);
                        } else {
                            // If player not found by UID, maybe they logged in anonymously?
                            // Or it's a player who hasn't linked their account yet, so log out.
                            await firebaseAuthInstance.signOut();
                            setUser(null);
                        }
                    }
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
            setUser(null); // No Firebase, no authenticated user.
        }
    }, [dataContext?.players, dataContext]); // Added dataContext to dependencies

    const login = async (username: string, password: string): Promise<boolean> => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        
        // Handle Admin or Creator Firebase login if Firebase is enabled
        const emailUsername = cleanUsername.toLowerCase();
        if (USE_FIREBASE && firebaseAuthInstance && (emailUsername === ADMIN_EMAIL || emailUsername === CREATOR_EMAIL)) {
            try {
                await firebaseAuthInstance.signInWithEmailAndPassword(emailUsername, cleanPassword);
                dataContext?.logActivity('Logged In (Firebase)');
                return true;
            } catch (error) {
                console.error("Firebase Admin/Creator Login Failed:", error);
                return false;
            }
        }
        
        // Player login logic (either mock or direct player with API backend)
        const player = MOCK_PLAYERS.find(p => 
            p.playerCode.toUpperCase() === cleanUsername.toUpperCase() && p.pin === cleanPassword
        );
        if (player) {
            // In Firebase mode, if player exists, sign in anonymously to get a UID for session tracking
            if (USE_FIREBASE && firebaseAuthInstance) {
                try {
                    const anonUserCredential = await firebaseAuthInstance.signInAnonymously();
                    // Link the anonymous UID to the player profile
                    const updatedPlayer = { ...player, activeAuthUID: anonUserCredential.user?.uid };
                    await dataContext?.updateDoc('players', updatedPlayer);
                    setUser(updatedPlayer);
                    dataContext?.logActivity('Logged In (Player, Firebase Anonymous)');
                    return true;
                } catch (error) {
                    console.error("Firebase Anonymous Login/Link Failed:", error);
                    return false;
                }
            } else {
                // Mock player login (when Firebase is not used)
                setUser(player);
                dataContext?.logActivity('Logged In (Mock)');
                return true;
            }
        }
        
        // Fallback for mock admin login if Firebase is not used
        if (!USE_FIREBASE && emailUsername === ADMIN_EMAIL && cleanPassword === '1234') {
            setUser(MOCK_ADMIN);
            dataContext?.logActivity('Logged In (Mock Admin)');
            return true;
        }

        return false;
    };
    
    // Log activity on user state change (successful login)
    useEffect(() => {
        if (user && dataContext) {
            dataContext.logActivity(`Logged In as ${user.name} (${user.role})`);
        }
    }, [user, dataContext]);


    const logout = async () => {
        if (USE_FIREBASE && firebaseAuthInstance) {
            try {
                await firebaseAuthInstance.signOut();
                dataContext?.logActivity('Logged Out (Firebase)');
            } catch (error) {
                console.error("Firebase Logout Failed:", error);
            }
        } else {
            dataContext?.logActivity('Logged Out (Mock)');
        }
        setUser(null);
    };

    const updateUser = (updatedUser: User | Player | Admin) => {
        setUser(updatedUser);
    }

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, helpTopic, setHelpTopic }}>
            {children}
        </AuthContext.Provider>
    );
};
