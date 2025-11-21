import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE, firebase } from '../firebase';
import { DataContext } from '../data/DataContext';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

const ADMIN_EMAIL = 'bosjoltactical@gmail.com';
const CREATOR_EMAIL = 'jstypme@gmail.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // FIX: Declare state variables and setters at the top of the component function
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [helpTopic, setHelpTopic] = useState('front-page');
    const dataContext = useContext(DataContext);

    useEffect(() => {
        if (!USE_FIREBASE || !auth || !db) {
            setLoading(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
            // This listener now primarily handles logins that happen *during* the session,
            // like an admin using email/password.
            if (firebaseUser && !firebaseUser.isAnonymous) {
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
                } else if (email === CREATOR_EMAIL) {
                    try {
                        const creatorDoc = await db.collection("settings").doc("creatorDetails").get();
                        if (creatorDoc.exists) {
                            setUser({ id: 'creator', role: 'creator', ...creatorDoc.data() } as CreatorDetails & { role: 'creator', id: string });
                        } else {
                             setUser({ id: 'creator', name: 'Creator', role: 'creator' });
                        }
                    } catch (error) {
                         console.error("Error fetching creator profile:", error);
                         await auth.signOut();
                         setUser(null);
                    }
                } else {
                    // A non-admin/creator user is logged in with email/pass, which shouldn't happen.
                    await auth.signOut();
                    setUser(null);
                }
            } else if (firebaseUser && firebaseUser.isAnonymous) {
                // This handles anonymous user sessions for players
                try {
                    const playerSnapshot = await db.collection("players").where("activeAuthUID", "==", firebaseUser.uid).limit(1).get();
                    if (!playerSnapshot.empty) {
                        const playerDoc = playerSnapshot.docs[0];
                        setUser({ id: playerDoc.id, ...playerDoc.data() } as Player);
                    } else {
                        console.warn("Player profile not found for anonymous user, signing out.");
                        await auth.signOut();
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error fetching player profile for anonymous user:", error);
                    await auth.signOut();
                    setUser(null);
                }
            } else {
                // No firebaseUser, or a logout occurred
                setUser(null);
            }
            setLoading(false); // Ensure loading is false after auth state is determined
        });
        return () => unsubscribe(); // Cleanup on unmount

 }, [dataContext]); // dataContext is a dependency because it provides functions like 'updateDoc' potentially needed by login

    const login = async (identifier: string, password: string): Promise<boolean> => {
        setLoading(true);
        try {
            if (!USE_FIREBASE || !auth || !db) {
                // Mock login logic
                if (identifier === ADMIN_EMAIL && password === "admin123") {
                    setUser(MOCK_ADMIN);
                    dataContext?.logActivity('Logged In', { userRole: 'admin', loginType: 'mock' });
                    return true;
                } else if (identifier === CREATOR_EMAIL && password === "creator123") {
                     setUser({ id: 'creator', name: 'Creator', role: 'creator' });
                     dataContext?.logActivity('Logged In', { userRole: 'creator', loginType: 'mock' });
                     return true;
                } else {
                    const player = MOCK_PLAYERS.find(p => p.playerCode === identifier && p.pin === password);
                    if (player) {
                        setUser(player);
                        dataContext?.logActivity('Logged In', { userRole: 'player', loginType: 'mock' });
                        return true;
                    }
                }
                return false;
            }

            // Live Firebase login logic
            if (identifier === ADMIN_EMAIL || identifier === CREATOR_EMAIL) {
                const credential = await auth.signInWithEmailAndPassword(identifier, password);
                if (credential.user) {
                    dataContext?.logActivity('Logged In', { userRole: 'admin/creator', loginType: 'firebase_email' });
                    // onAuthStateChanged listener will handle setting the user
                    return true;
                }
            } else {
                // Player login with playerCode and PIN
                const playerSnapshot = await db.collection("players").where("playerCode", "==", identifier).limit(1).get();
                if (!playerSnapshot.empty) {
                    const playerDoc = playerSnapshot.docs[0];
                    const player = { id: playerDoc.id, ...playerDoc.data() } as Player;

                    if (player.pin === password) {
                        // Sign in anonymously and link the player's UID
                        let firebaseUser = auth.currentUser;
                        if (!firebaseUser) {
                            firebaseUser = (await auth.signInAnonymously()).user;
                        }
                        
                        // Update player's activeAuthUID in Firestore
                        if (firebaseUser && firebaseUser.uid !== player.activeAuthUID) {
                            await dataContext?.updateDoc('players', { ...player, activeAuthUID: firebaseUser.uid });
                            // Force refresh of auth state
                            await firebaseUser.reload();
                        }
                        setUser(player); // Optimistically set for immediate UI update
                        dataContext?.logActivity('Logged In', { userRole: 'player', loginType: 'firebase_pin' });
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        } finally {
            // Loading will be set to false by onAuthStateChanged if successful,
            // or here if login failed without changing auth state.
            if (!auth?.currentUser) {
                setLoading(false);
            }
        }
    };

    const logout = async () => {
        if (USE_FIREBASE && auth) {
            try {
                if (auth.currentUser?.isAnonymous) {
                    // For anonymous users (players), sign out and also clear their activeAuthUID
                    const player = user as Player;
                    if (player && player.id && player.activeAuthUID) {
                        await dataContext?.updateDoc('players', { ...player, activeAuthUID: '' });
                    }
                }
                await auth.signOut();
                dataContext?.logActivity('Logged Out', { userRole: user?.role });
            } catch (error) {
                console.error("Logout Error:", error);
            }
        }
        setUser(null);
        setLoading(false); // Ensure loading is false after logout
    };

    const updateUser = (updatedUserData: User | Player | Admin) => {
        setUser(updatedUserData);
    };

    const authContextValue = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        helpTopic,
        setHelpTopic,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
