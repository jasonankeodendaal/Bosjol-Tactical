
import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
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

    const IS_LIVE = isSupabaseConfigured();

    useEffect(() => {
        if (!IS_LIVE || !supabase) {
            setLoading(false);
            return;
        }

        // Check active Supabase session for Admins/Creators
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                handleSupabaseUser(session.user);
            } else {
                // Check if we have a locally stored player session
                const storedPlayerId = localStorage.getItem('activePlayerId');
                if (storedPlayerId) {
                    supabase.from('players').select('*').eq('id', storedPlayerId).single()
                    .then(({ data, error }) => {
                        if (data && !error) {
                            setUser(data as Player);
                        } else {
                            localStorage.removeItem('activePlayerId');
                        }
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                handleSupabaseUser(session.user);
            } else if (!localStorage.getItem('activePlayerId')) {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();

    }, [dataContext]);

    const handleSupabaseUser = async (sbUser: any) => {
        const email = sbUser.email?.toLowerCase();
        if (email === ADMIN_EMAIL) {
            const { data } = await supabase!.from('admins').select('*').eq('email', email).single();
            if (data) setUser({ ...data, id: data.id } as Admin);
            else setUser({ ...MOCK_ADMIN, id: 'admin_fallback', email }); // Fallback
        } else if (email === CREATOR_EMAIL) {
            const { data } = await supabase!.from('settings').select('*').eq('id', 'creatorDetails').single();
            if (data) setUser({ ...data, id: 'creator', role: 'creator' } as any);
            else setUser({ id: 'creator', name: 'Creator', role: 'creator' });
        }
    };

    const login = async (identifier: string, password: string): Promise<boolean> => {
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
                if (error) throw error;
                // Listener handles state update
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
                    dataContext?.logActivity('Logged In', { userRole: 'player', playerId: player.id });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        } finally {
            if (!user) setLoading(false);
        }
    };

    const logout = async () => {
        if (IS_LIVE && supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('activePlayerId');
        setUser(null);
        setLoading(false);
    };

    const updateUser = (updatedUserData: User | Player | Admin) => {
        setUser(updatedUserData);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, helpTopic, setHelpTopic }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
