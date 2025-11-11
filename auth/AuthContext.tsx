import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType, Player, Admin } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!USE_FIREBASE || !auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Admin check
                if (firebaseUser.email === 'bosjol@gmail.com') {
                    setUser(MOCK_ADMIN);
                } else {
                    // Fetch player profile from Firestore
                    const userDocRef = doc(db, "players", firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUser({ id: userDocSnap.id, ...userDocSnap.data() } as Player);
                    } else {
                        console.error("No player document found for authenticated user.");
                        setUser(null);
                    }
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (identifier: string, pin: string): Promise<boolean> => {
        const cleanIdentifier = identifier.trim();
        const cleanPin = pin.trim();

        if (USE_FIREBASE && db && auth) {
            try {
                // Admin Login or Player Login via Email
                if (cleanIdentifier.includes('@')) {
                    await signInWithEmailAndPassword(auth, cleanIdentifier, cleanPin);
                    return true;
                }

                // Player Login via Initials
                const playersRef = collection(db, "players");
                const q = query(playersRef);
                const querySnapshot = await getDocs(q);
                
                let foundPlayer: Player | null = null;
                querySnapshot.forEach((doc) => {
                    const playerData = doc.data() as Omit<Player, 'id'>;
                    if (playerData.name && playerData.surname) {
                        const playerIdentifier = (playerData.name.charAt(0) + playerData.surname.charAt(0)).toUpperCase();
                        if (playerIdentifier === cleanIdentifier.toUpperCase() && playerData.pin === cleanPin) {
                            foundPlayer = { id: doc.id, ...playerData } as Player;
                        }
                    }
                });

                if (foundPlayer) {
                    await signInWithEmailAndPassword(auth, foundPlayer.email, foundPlayer.pin);
                    return true;
                } else {
                    console.error("No player found with those credentials.");
                    return false;
                }

            } catch (error) {
                console.error("Firebase login failed:", error);
                return false;
            }
        } else {
            // Mock Login Logic
            if (cleanIdentifier.toLowerCase() === 'bosjol@gmail.com' && cleanPin === '1234') {
                setUser(MOCK_ADMIN);
                return true;
            }
            const player = MOCK_PLAYERS.find(p => {
                const playerIdentifier = (p.name.charAt(0) + p.surname.charAt(0)).toUpperCase();
                return playerIdentifier === cleanIdentifier.toUpperCase() && p.pin === cleanPin;
            });
            if (player) {
                setUser(player);
                return true;
            }
            return false;
        }
    };

    const logout = async () => {
        if (USE_FIREBASE && auth) {
            await signOut(auth);
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
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};