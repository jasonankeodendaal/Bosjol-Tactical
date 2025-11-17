import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
// FIX: Updated imports to use MOCK_PLAYERS and MOCK_ADMIN.
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { auth, db, USE_FIREBASE, firebase } from '../firebase';

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

    useEffect(() => {
        if (!USE_FIREBASE || !auth || !db) {
            setLoading(false);
            return;
        }

        // On initial mount, sign out any existing user to enforce re-login on every app load/refresh.
        auth.signOut();

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
                            // FIX: The error on this line is resolved by correctly importing MOCK_ADMIN with an ID.
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
            } else {
                // This handles the initial load (after signOut) and any anonymous user sessions from previous player logins.
                // It ensures we always start with a clean slate.
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        
        // Handle Admin or Creator Firebase login
        const emailUsername = cleanUsername.toLowerCase();
        if (emailUsername === ADMIN_EMAIL || emailUsername === CREATOR_EMAIL) {
            if (USE_FIREBASE && auth) {
                try {
                    await auth.signInWithEmailAndPassword(emailUsername, cleanPassword);
                    // onAuthStateChanged will set user state
                    return true;
                } catch (error) {
                    const typedError = error as { code?: string; message?: string };
                    console.error(`Firebase login failed with code: ${typedError.code || 'N/A'}. Message: ${typedError.message || 'Unknown error'}`);
                    return false;
                }
            } else { // Mock admin login (creator has no mock login)
                if (emailUsername === ADMIN_EMAIL && cleanPassword === '1234') {
                    setUser(MOCK_ADMIN);
                    return true;
                }
                return false;
            }
        }
        
        // Player login logic
        if (USE_FIREBASE && db && auth) {
            try {
                const playersRef = db.collection("players");
                const q = playersRef.where("playerCode", "==", cleanUsername.toUpperCase()).limit(1);
                const querySnapshot = await q.get();

                if (querySnapshot.empty) return false;

                const playerDoc = querySnapshot.docs[0];
                const playerData = { id: playerDoc.id, ...playerDoc.data() } as Player;
                
                if (playerData.pin === cleanPassword) {
                    // signInAnonymously will automatically sign out any existing user.
                    const userCredential = await auth.signInAnonymously();
                    const authUID = userCredential.user?.uid;

                    if (authUID) {
                        const updatedPlayerData = { ...playerData, activeAuthUID: authUID };
                        await db.collection('players').doc(playerData.id).update({ activeAuthUID: authUID });
                        setUser(updatedPlayerData);
                    } else {
                        throw new Error("Failed to get UID from anonymous session.");
                    }
                    return true;
                }
                return false;
            } catch (error) {
                const typedError = error as { code?: string; message: string };
                let userMessage = `Login failed: ${typedError.message}.`; // Default message

                if (typedError.code === 'auth/admin-restricted-operation') {
                    userMessage = "Login failed due to a server configuration issue (auth/admin-restricted-operation). This can happen if Anonymous Sign-In is not enabled in your Firebase project's Authentication settings. Please ask the administrator to enable it.";
                } else if (typedError.code === 'permission-denied') {
                    userMessage = "Login failed due to a permission error. This usually means the app's Firestore Security Rules are not configured correctly. The rules must allow an authenticated user to update the 'activeAuthUID' field on their player document.";
                } else {
                    userMessage += "\n\nPlease check the console for more details.";
                }
                
                console.error("Player login failed:", typedError);
                alert(userMessage);
                return false;
            }
        } else { // Mock player login
            const player = MOCK_PLAYERS.find(p => 
                p.playerCode.toUpperCase() === cleanUsername.toUpperCase() && p.pin === cleanPassword
            );
            if (player) {
                setUser(player);
                return true;
            }
            return false;
        }
    };

    const logout = async () => {
        // For both anonymous player sessions and admin/creator sessions
        if (USE_FIREBASE && auth && auth.currentUser) {
            // This will sign out any logged-in Firebase user, regardless of whether they are anonymous or email/password.
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