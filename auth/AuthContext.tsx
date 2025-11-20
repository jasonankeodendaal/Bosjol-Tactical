
import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
// FIX: Updated imports to use MOCK_PLAYERS and MOCK_ADMIN.
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
    const [user, setUser] = useState<User | Player | Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [helpTopic, setHelpTopic] = useState('front-page');
    const dataContext = useContext(DataContext);

    useEffect(() => {
        if (!USE_FIREBASE || !auth || !db) {
            setLoading(false);
            return;
        }

        // On initial mount, sign out any existing user to enforce re-login on every app load/refresh.
        auth.signOut();

        // FIX: The type `firebase.User` is not directly available. Use `firebase.auth.User` instead.
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
                // This handles the initial load (after signOut) and any anonymous user sessions from previous player logins