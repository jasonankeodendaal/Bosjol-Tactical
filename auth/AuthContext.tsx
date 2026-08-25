
import React, { createContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

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

    const IS_LIVE = isSupabaseConfigured();

    const handleSupabaseUser = useCallback(async (sbUser: any) => {
        try {
            const email = sbUser.email?.toLowerCase();
            
            if (email === CREATOR_EMAIL) {
                const { data } = await supabase!.from('settings').select('*').eq('id', 'creatorDetails').single();
                if (data) setUser({ ...data, id: 'creator', role: 'creator' } as any);
                else setUser({ id: 'creator', name: 'Creator', role: 'creator' });
                return;
            }

            // Check specific hardcoded admin (legacy/default logic)
            if (email === ADMIN_EMAIL) {
                const { data, error } = await supabase!.from('admins').select('*').eq('email', email).single();
                
                if (data) {
                    setUser({ ...data, id: data.id } as Admin);
                } else {
                    // Fallback: If auth matched but DB record missing (e.g. freshly seeded DB race condition), use Mock/Default
                    console.warn("Admin record not found in DB, using fallback.");
                    const fallbackAdmin = { ...MOCK_ADMIN, id: 'admin_fallback', email };
                    setUser(fallbackAdmin as Admin); 
                    
                    // Attempt to self-repair by upserting the default admin record
                    const { id: adminId, ...adminData } = MOCK_ADMIN;
                    await supabase!.from('admins').upsert({ id: adminId, ...adminData }).then(({ error }) => {
                        if (error) console.error("Failed to auto-repair admin record:", error);
                    });
                }
                return;
            }

            // Generic Admin Check: Look for ANY record in the admins table with this email
            const { data: adminRows } = await supabase!.from('admins').select('*').eq('email', email);
            if (adminRows && adminRows.length > 0) {
                const adminDoc = adminRows[0];
                setUser({ ...adminDoc, id: adminDoc.id } as Admin);
                return;
            }

            // Player Check: Look for ANY record in the players table with this email
            const { data: playerRows } = await supabase!.from('players').select('*').eq('email', email);
            if (playerRows && playerRows.length > 0) {
                const playerDoc = playerRows[0];
                setUser(playerDoc as Player);
                localStorage.setItem('activePlayerId', playerDoc.id);
                return;
            }

            // Auto-provision a new player profile if an authenticated user is not yet in the players table
            const newPlayerId = `p_${Date.now()}`;
            const cleanName = email.split('@')[0];
            const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            const newPlayerCode = `P${Math.floor(1000 + Math.random() * 9000)}`;

            const newPlayer: Partial<Player> = {
                id: newPlayerId,
                name: formattedName,
                surname: '',
                playerCode: newPlayerCode,
                email: email,
                phone: '',
                pin: '1234',
                role: 'player',
                callsign: cleanName.toUpperCase().slice(0, 8),
                status: 'Active',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                stats: { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 },
                badges: [],
                legendaryBadges: [],
                loadout: { primaryWeapon: '', secondaryWeapon: '', lethal: '', tactical: '' },
                matchHistory: [],
                xpAdjustments: []
            };

            await supabase!.from('players').upsert(newPlayer);
            setUser(newPlayer as Player);
            localStorage.setItem('activePlayerId', newPlayer.id);
        } catch (error) {
            console.error("Error handling Supabase user:", error);
        }
    }, []);

    useEffect(() => {
        if (!IS_LIVE || !supabase) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        // Check active Supabase session for Admins/Creators
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;
            if (session?.user) {
                await handleSupabaseUser(session.user);
                if (isMounted) setLoading(false);
            } else {
                // Check if we have a locally stored player session
                const storedPlayerId = localStorage.getItem('activePlayerId');
                if (storedPlayerId) {
                    supabase.from('players').select('*').eq('id', storedPlayerId).single()
                    .then(({ data, error }) => {
                        if (!isMounted) return;
                        if (data && !error) {
                            setUser(data as Player);
                        } else {
                            localStorage.removeItem('activePlayerId');
                        }
                    })
                    .finally(() => {
                        if (isMounted) setLoading(false);
                    });
                } else {
                    if (isMounted) setLoading(false);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            try {
                if (session?.user) {
                    await handleSupabaseUser(session.user);
                } else if (!localStorage.getItem('activePlayerId')) {
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth state change error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [IS_LIVE, handleSupabaseUser]);

    const login = useCallback(async (identifier: string, password: string): Promise<boolean> => {
        setLoading(true);
        try {
            if (!IS_LIVE || !supabase) {
                // Mock Login
                if (identifier === ADMIN_EMAIL && password === "admin123") {
                    setUser(MOCK_ADMIN);
                    return true;
                } else {
                    const player = MOCK_PLAYERS.find(p => p.playerCode === identifier && p.pin === password);
                    if (player) {
                        setUser(player);
                        return true;
                    }
                }
                return false;
            }

            // Live Login
            if (identifier.includes('@')) {
                // Admin/Creator Login via Supabase Auth
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: identifier,
                    password: password,
                });
                
                if (error) {
                    console.error("Supabase Auth Error:", error.message);
                    return false;
                }
                
                // Successful Auth will trigger onAuthStateChange, which sets the user.
                return true;
            } else {
                // Player Login via Table Query (App-Level Auth)
                const { data: player, error } = await supabase
                    .from('players')
                    .select('*')
                    .eq('playerCode', identifier)
                    .single();

                if (player && player.pin === password) {
                    setUser(player as Player);
                    localStorage.setItem('activePlayerId', player.id);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [IS_LIVE]);

    const logout = useCallback(async () => {
        if (IS_LIVE && supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('activePlayerId');
        setUser(null);
        setLoading(false);
    }, [IS_LIVE]);

    const updateUser = useCallback((updatedUserData: User | Player | Admin) => {
        setUser(updatedUserData);
    }, []);

    const contextValue = useMemo<AuthContextType>(() => ({
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        helpTopic,
        setHelpTopic
    }), [user, login, logout, updateUser, helpTopic]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
