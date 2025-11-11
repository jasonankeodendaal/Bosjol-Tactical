import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType, Player, Admin } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
                if (firebaseUser.email === 'bosjol@gmail.com') { // Use a real admin email or a custom claim in production
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

    const login = async (email: string, password: string): Promise<boolean> => {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (USE_FIREBASE && db && auth) {
            try {
                await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
                return true;
            } catch (error) {
                console.error("Firebase login failed:", error);
                return false;
            }
        } else {
            // Mock Login Logic
            if (cleanEmail.toLowerCase() === 'bosjol@gmail.com' && cleanPassword === '1234') {
                setUser(MOCK_ADMIN);
                return true;
            }
            const player = MOCK_PLAYERS.find(p => 
                p.email.toLowerCase() === cleanEmail.toLowerCase() && p.pin === cleanPassword
            );
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