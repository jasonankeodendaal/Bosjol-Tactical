import React, { createContext, useState, ReactNode, useEffect } from 'react';
// FIX: Use compat imports to align with v8 syntax and resolve module export error.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import type { User, AuthContextType, Player, Admin } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE } from '../firebase';


export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

// In a real production app, this should come from an environment variable for security.
const ADMIN_EMAIL = 'bosjoltactical@gmail.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!USE_FIREBASE || !auth || !db) {
            setLoading(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
            if (firebaseUser && firebaseUser.email?.toLowerCase() === ADMIN_EMAIL) {
                // Firebase user is the admin, fetch their profile from Firestore 'admins' collection.
                try {
                    const adminsRef = db.collection("admins");
                    // Assuming there's only one admin document or we can find it by email
                    const q = adminsRef.where("email", "==", firebaseUser.email).limit(1);
                    const querySnapshot = await q.get();
                    
                    if (!querySnapshot.empty) {
                        const adminDoc = querySnapshot.docs[0];
                        setUser({ id: adminDoc.id, ...adminDoc.data() } as Admin);
                    } else {
                        console.error("Admin user authenticated but no profile found in Firestore 'admins' collection.");
                        await auth.signOut(); // Sign out to prevent inconsistent state
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error fetching admin profile from Firestore:", error);
                    await auth.signOut();
                    setUser(null);
                }
            } else if (firebaseUser) {
                // If a non-admin Firebase user is somehow logged in, sign them out.
                await auth.signOut();
                setUser(null);
            } else {
                // No Firebase user.
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        if (cleanUsername.toLowerCase() === ADMIN_EMAIL) {
            // --- ADMIN LOGIN LOGIC ---
            if (USE_FIREBASE && auth) {
                try {
                    await auth.signInWithEmailAndPassword(cleanUsername, cleanPassword);
                    // onAuthStateChanged will fetch the profile and set the user state.
                    return true;
                } catch (error) {
                    console.error("Admin Firebase login failed:", error);
                    return false;
                }
            } else { // Mock admin login
                if (cleanPassword === '1234') {
                    setUser(MOCK_ADMIN);
                    return true;
                }
                return false;
            }
        } else {
            // --- PLAYER LOGIN LOGIC ---
            if (USE_FIREBASE && db) {
                 try {
                    const playersRef = db.collection("players");
                    const q = playersRef.where("playerCode", "==", cleanUsername.toUpperCase());
                    const querySnapshot = await q.get();
                    
                    if (querySnapshot.empty) {
                        console.log('No player found with that player code.');
                        return false;
                    }

                    const playerDoc = querySnapshot.docs[0];
                    const playerData = { id: playerDoc.id, ...playerDoc.data() } as Player;
                    
                    if (playerData.pin === cleanPassword) {
                        setUser(playerData);
                        return true;
                    } else {
                        console.log('Incorrect PIN for player.');
                        return false;
                    }
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
        }
    };

    const logout = async () => {
        if (USE_FIREBASE && auth && auth.currentUser) {
            await auth.signOut();
        }
        setUser(null);
    };

    const updateUser = (updatedUser: User | Player | Admin) => {
        setUser(updatedUser);
    }

    if (loading && USE_FIREBASE) {
        return null; // Or a loading spinner while checking auth state
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
