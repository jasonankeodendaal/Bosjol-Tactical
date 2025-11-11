import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType, Player, Admin } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

// In a real production app, this should come from an environment variable for security.
const ADMIN_EMAIL = 'bosjol@gmail.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);

    // This effect now only handles session persistence for the admin via Firebase Auth.
    // It ensures that only the admin can have a persistent session through Firebase.
    useEffect(() => {
        if (!USE_FIREBASE || !auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser && firebaseUser.email?.toLowerCase() === ADMIN_EMAIL) {
                // If a Firebase user is logged in and it's the admin, set the user state.
                setUser(MOCK_ADMIN);
            } else if (firebaseUser) {
                // If a non-admin Firebase user is somehow logged in, sign them out to prevent conflicts.
                await signOut(auth);
                setUser(null);
            } else {
                // No Firebase user, so no admin session.
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        if (cleanEmail === ADMIN_EMAIL) {
            // --- ADMIN LOGIN LOGIC ---
            if (USE_FIREBASE && auth) {
                try {
                    await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
                    // onAuthStateChanged will set the user state upon successful login
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
                    const playersRef = collection(db, "players");
                    const q = query(playersRef, where("email", "==", cleanEmail));
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.empty) {
                        console.log('No player found with that email.');
                        return false;
                    }

                    const playerDoc = querySnapshot.docs[0];
                    const playerData = { id: playerDoc.id, ...playerDoc.data() } as Player;
                    
                    // Check if the provided password matches the player's PIN
                    if (playerData.pin === cleanPassword) {
                        setUser(playerData);
                        return true;
                    } else {
                        console.log('Incorrect password for player.');
                        return false;
                    }
                } catch (error) {
                    console.error("Player Firestore login failed:", error);
                    return false;
                }
            } else { // Mock player login
                const player = MOCK_PLAYERS.find(p => 
                    p.email.toLowerCase() === cleanEmail && p.pin === cleanPassword
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
            // Only signs out the admin from Firebase Auth
            await signOut(auth);
        }
        // Always clear local user state for both players and admins
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
