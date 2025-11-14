import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType, Player, Admin } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE, firebase } from '../firebase';

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
                // Firebase user is the admin, fetch their profile from Firestore 'admins' collection using their UID.
                try {
                    const adminDocRef = db.collection("admins").doc(firebaseUser.uid);
                    const adminDoc = await adminDocRef.get();
                    
                    if (adminDoc.exists) {
                        setUser({ id: adminDoc.id, ...adminDoc.data() } as Admin);
                    } else {
                        // Admin authenticated but no profile. Let's create one with the UID as the document ID.
                        console.warn("Admin profile not found in Firestore. Creating a default profile.");
                        const { id, ...newAdminData } = MOCK_ADMIN;
                        newAdminData.email = firebaseUser.email!; // Ensure email matches for consistency
                        
                        try {
                            await db.collection("admins").doc(firebaseUser.uid).set(newAdminData);
                            setUser({ ...newAdminData, id: firebaseUser.uid });
                        } catch (creationError) {
                            console.error("Failed to create default admin profile:", creationError);
                            await auth.signOut();
                            setUser(null);
                        }
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
                // No Firebase user is signed in. This callback can fire on initial load, or when an admin signs out.
                // We only want to modify state if an admin was signed in and now isn't.
                // We must not disturb a non-Firebase player session.
                setUser(currentUser => {
                    // If the user currently in state is an admin, that admin has now signed out via Firebase.
                    // Clear the state.
                    if (currentUser?.role === 'admin') {
                        return null;
                    }
                    // Otherwise, the user is either a player or null. Don't change anything.
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
