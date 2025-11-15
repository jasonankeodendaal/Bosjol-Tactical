import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE, firebase } from '../firebase';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

const ADMIN_EMAIL = 'bosjoltactical@gmail.com';
const CREATOR_PIN = '1723'; // Hardcoded PIN for the creator

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [helpTopic, setHelpTopic] = useState('front-page');

    useEffect(() => {
        if (!USE_FIREBASE || !auth || !db) {
            setLoading(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
            if (firebaseUser) {
                 const email = firebaseUser.email?.toLowerCase();

                if (email === ADMIN_EMAIL) {
                    try {
                        const adminSnapshot = await db.collection("admins").where("email", "==", email).limit(1).get();
                        if (!adminSnapshot.empty) {
                            const adminDoc = adminSnapshot.docs[0];
                            setUser({ id: adminDoc.id, ...adminDoc.data() } as Admin);
                        } else {
                            console.warn("Admin profile not found, creating default.");
                            const { id, ...newAdminData } = { ...MOCK_ADMIN, email };
                            const docRef = await db.collection("admins").add(newAdminData);
                            setUser({ ...newAdminData, id: docRef.id });
                        }
                    } catch (error) {
                        console.error("Error fetching admin profile:", error);
                        await auth.signOut();
                        setUser(null);
                    }
                } else {
                    // Non-admin Firebase user, sign them out
                    await auth.signOut();
                    setUser(null);
                }
            } else {
                // No Firebase user, clear admin state but not player/creator state
                setUser(currentUser => {
                    if (currentUser?.role === 'admin') {
                        return null;
                    }
                    return currentUser;
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        
        // Handle Creator PIN login first
        if (cleanUsername === 'creator' && cleanPassword === CREATOR_PIN) {
             setUser({ id: 'creator', name: 'Creator', role: 'creator' });
             return true;
        }

        // Handle Admin login
        if (cleanUsername.toLowerCase() === ADMIN_EMAIL) {
            if (USE_FIREBASE && auth) {
                try {
                    await auth.signInWithEmailAndPassword(cleanUsername, cleanPassword);
                    // onAuthStateChanged will set user state
                    return true;
                } catch (error) {
                    const typedError = error as { code?: string; message?: string };
                    console.error(`Firebase login failed with code: ${typedError.code || 'N/A'}. Message: ${typedError.message || 'Unknown error'}`);
                    return false;
                }
            } else { // Mock admin login
                if (cleanPassword === '1234') {
                    setUser(MOCK_ADMIN);
                    return true;
                }
                return false;
            }
        }
        
        // Player login logic
        if (USE_FIREBASE && db) {
            try {
                const playersRef = db.collection("players");
                const q = playersRef.where("playerCode", "==", cleanUsername.toUpperCase()).limit(1);
                const querySnapshot = await q.get();

                if (querySnapshot.empty) return false;

                const playerDoc = querySnapshot.docs[0];
                const playerData = { id: playerDoc.id, ...playerDoc.data() } as Player;
                
                if (playerData.pin === cleanPassword) {
                    setUser(playerData);
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Player Firestore login failed:", error);
                return false;
            }
        } else { // Mock player login
            const player = MOCK_PLAYERS.find(p => 
                p.playerCode.toLowerCase() === cleanUsername.toLowerCase() && p.pin === cleanPassword
            );
            if (player) {
                setUser(player);
                return true;
            }
            return false;
        }
    };

    const logout = async () => {
        // Only sign out from Firebase if the logged-in user is an admin
        if (USE_FIREBASE && auth && auth.currentUser && user?.role === 'admin') {
            await auth.signOut();
        }
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