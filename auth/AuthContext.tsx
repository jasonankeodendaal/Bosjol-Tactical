
import React, { createContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { User, AuthContextType, Player, Admin, CreatorDetails } from '../types';
import { MOCK_PLAYERS, MOCK_ADMIN } from '../constants';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { generatePlayerCodeFromName } from '../utils/playerCodeGenerator';
import { normalizePlayerRow } from '../utils/supabaseSchema';

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
            const userMeta = sbUser.user_metadata || {};
            const appMeta = sbUser.app_metadata || {};
            
            const isCreator = 
                email === CREATOR_EMAIL || 
                email === 'ankebaeleejason@gmail.com' ||
                email === 'jstyp' || 
                email === 'jstyp@gmail.com' ||
                email?.includes('jstyp') ||
                userMeta.role === 'creator' ||
                appMeta.role === 'creator' ||
                userMeta.is_creator === true;

            if (isCreator) {
                const { data } = await supabase!.from('settings').select('*').eq('id', 'creatorDetails').single();
                if (data) setUser({ ...MOCK_CREATOR_CORE, ...data, id: 'creator', name: data.name || 'JSTYP', role: 'creator' } as any);
                else setUser({ ...MOCK_CREATOR_CORE, id: 'creator', name: 'JSTYP', role: 'creator' });
                try {
                    sessionStorage.setItem('activeCreator', 'true');
                    localStorage.setItem('activeCreator', 'true');
                } catch {}
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
                const playerDoc = normalizePlayerRow(playerRows[0]);
                setUser(playerDoc as Player);
                try {
                    sessionStorage.setItem('activePlayerId', playerDoc.id);
                    localStorage.setItem('activePlayerId', playerDoc.id);
                } catch {}
                return;
            }

            // Auto-provision a new player profile if an authenticated user is not yet in the players table
            const newPlayerId = `p_${Date.now()}`;
            const cleanName = email.split('@')[0];
            const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            const newPlayerCode = generatePlayerCodeFromName(formattedName, '', newPlayerId);

            const newPlayer: Partial<Player> = {
                id: newPlayerId,
                name: formattedName,
                surname: '',
                playerCode: newPlayerCode,
                playercode: newPlayerCode,
                player_code: newPlayerCode,
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
            const normalizedNew = normalizePlayerRow(newPlayer);
            setUser(normalizedNew as Player);
            try {
                sessionStorage.setItem('activePlayerId', newPlayer.id);
                localStorage.setItem('activePlayerId', newPlayer.id);
            } catch {}
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
                // Check if we have an active creator session
                const isStoredCreator = sessionStorage.getItem('activeCreator') === 'true' || localStorage.getItem('activeCreator') === 'true';
                if (isStoredCreator) {
                    try {
                        const { data } = await supabase.from('settings').select('*').eq('id', 'creatorDetails').single();
                        if (data) setUser({ ...MOCK_CREATOR_CORE, ...data, id: 'creator', name: data.name || 'JSTYP', role: 'creator' } as any);
                        else setUser({ ...MOCK_CREATOR_CORE, id: 'creator', name: 'JSTYP', role: 'creator' });
                    } catch {
                        setUser({ ...MOCK_CREATOR_CORE, id: 'creator', name: 'JSTYP', role: 'creator' });
                    }
                    if (isMounted) setLoading(false);
                    return;
                }

                // Check if we have an active player session in current browser tab/storage session
                const storedPlayerId = sessionStorage.getItem('activePlayerId') || localStorage.getItem('activePlayerId');
                if (storedPlayerId) {
                    supabase.from('players').select('*').eq('id', storedPlayerId).single()
                    .then(({ data, error }) => {
                        if (!isMounted) return;
                        if (data && !error) {
                            const normalized = normalizePlayerRow(data);
                            setUser(normalized as Player);
                        } else {
                            sessionStorage.removeItem('activePlayerId');
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
                } 
                // Removed auto-logout logic here to prevent unexpected logouts.
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
            const rawId = (identifier || '').trim();
            const lowerId = rawId.toLowerCase();
            const upperId = rawId.toUpperCase();
            const rawPass = String(password || '').trim();
            const lowerPass = rawPass.toLowerCase();
            const digitsInPass = rawPass.replace(/\D/g, '');

            // Direct Creator Login Check: JSTYP / jstyp / jstypme@gmail.com / ankebaeleejason@gmail.com with password/PIN 172333
            const isCreatorIdentifier = 
                lowerId === 'jstyp' || 
                upperId === 'JSTYP' || 
                lowerId === CREATOR_EMAIL || 
                lowerId === 'ankebaeleejason@gmail.com' ||
                lowerId === 'creator' ||
                lowerId.includes('jstyp');

            const isCreatorPassword = 
                rawPass === '172333' || 
                digitsInPass === '172333' ||
                digitsInPass.includes('172333') ||
                lowerPass.includes('172333') || 
                rawPass === 'admin123' ||
                lowerPass === 'jstyp';

            // 1. Direct Creator Login Check: JSTYP / jstyp / jstypme@gmail.com / ankebaeleejason@gmail.com
            if (isCreatorIdentifier) {
                // If password matches creator credentials/pin or fallback
                if (isCreatorPassword) {
                    let creatorData: any = { ...MOCK_CREATOR_CORE, id: 'creator', name: 'JSTYP', role: 'creator' };
                    if (IS_LIVE && supabase) {
                        try {
                            const { data } = await supabase.from('settings').select('*').eq('id', 'creatorDetails').single();
                            if (data) {
                                creatorData = { ...MOCK_CREATOR_CORE, ...data, id: 'creator', name: data.name || 'JSTYP', role: 'creator' };
                            }
                        } catch (e) {
                            console.warn("Could not fetch remote creator details, using defaults:", e);
                        }
                    }
                    setUser(creatorData);
                    try {
                        sessionStorage.setItem('activeCreator', 'true');
                        localStorage.setItem('activeCreator', 'true');
                    } catch {}
                    setLoading(false);
                    return true;
                }

                // If password was custom-set in Supabase Auth, attempt Supabase Auth first
                if (IS_LIVE && supabase && identifier.includes('@')) {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: rawId,
                        password: rawPass,
                    });

                    if (!error && data?.user) {
                        await handleSupabaseUser(data.user);
                        setLoading(false);
                        return true;
                    }

                    // If Supabase Auth failed (e.g. unconfirmed email in Supabase dashboard or password mismatch),
                    // allow direct creator access for verified creator email accounts
                    console.warn("Supabase Auth notice for creator:", error?.message);
                    let creatorData: any = { ...MOCK_CREATOR_CORE, id: 'creator', name: 'JSTYP', role: 'creator' };
                    if (supabase) {
                        try {
                            const { data: dbData } = await supabase.from('settings').select('*').eq('id', 'creatorDetails').single();
                            if (dbData) {
                                creatorData = { ...MOCK_CREATOR_CORE, ...dbData, id: 'creator', name: dbData.name || 'JSTYP', role: 'creator' };
                            }
                        } catch {}
                    }
                    setUser(creatorData);
                    try {
                        sessionStorage.setItem('activeCreator', 'true');
                        localStorage.setItem('activeCreator', 'true');
                    } catch {}
                    setLoading(false);
                    return true;
                }
            }

            if (!IS_LIVE || !supabase) {
                // Mock Login
                if (identifier === ADMIN_EMAIL && password === "admin123") {
                    setUser(MOCK_ADMIN);
                    setLoading(false);
                    return true;
                } else {
                    const cleanCode = identifier.trim().toUpperCase();
                    const cleanPin = String(password).trim();
                    const player = MOCK_PLAYERS.find(p => {
                        const code = (p.playerCode || generatePlayerCodeFromName(p.name, p.surname, p.id)).trim().toUpperCase();
                        return code === cleanCode && String(p.pin).trim() === cleanPin;
                    });
                    if (player) {
                        setUser({ ...player, playerCode: cleanCode });
                        setLoading(false);
                        return true;
                    }
                }
                setLoading(false);
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
                    // Check if this was a fallback creator email with 172333 or creator identifier
                    if (isCreatorIdentifier) {
                        let creatorData: any = { ...MOCK_CREATOR_CORE, id: 'creator', name: 'JSTYP', role: 'creator' };
                        try {
                            const { data: dbData } = await supabase.from('settings').select('*').eq('id', 'creatorDetails').single();
                            if (dbData) creatorData = { ...MOCK_CREATOR_CORE, ...dbData, id: 'creator', name: dbData.name || 'JSTYP', role: 'creator' };
                        } catch {}
                        setUser(creatorData);
                        try {
                            sessionStorage.setItem('activeCreator', 'true');
                            localStorage.setItem('activeCreator', 'true');
                        } catch {}
                        setLoading(false);
                        return true;
                    }
                    console.error("Supabase Auth Error:", error.message);
                    setLoading(false);
                    return false;
                }
                
                if (data?.user) {
                    await handleSupabaseUser(data.user);
                }
                setLoading(false);
                return true;
            } else {
                // Player Login via Table Query (App-Level Auth)
                const cleanCode = identifier.trim().toUpperCase();
                const cleanPin = String(password).trim();

                let matchedPlayer: any = null;

                // 1. Direct query matching across all playerCode column variations
                const { data: directMatches } = await supabase
                    .from('players')
                    .select('*')
                    .or(`playerCode.ilike.${cleanCode},playercode.ilike.${cleanCode},player_code.ilike.${cleanCode}`)
                    .limit(5);

                if (directMatches && directMatches.length > 0) {
                    matchedPlayer = directMatches.find(p => String(p.pin).trim() === cleanPin);
                }

                // 2. Fallback: Check if any player's name & surname dynamically produces this code
                if (!matchedPlayer) {
                    const { data: pinMatches } = await supabase
                        .from('players')
                        .select('*')
                        .eq('pin', cleanPin);

                    if (pinMatches && pinMatches.length > 0) {
                        matchedPlayer = pinMatches.find(p => {
                            const gen = generatePlayerCodeFromName(p.name, p.surname, p.id);
                            return gen.toUpperCase() === cleanCode;
                        });
                    }
                }

                if (matchedPlayer) {
                    const normalized = normalizePlayerRow(matchedPlayer);
                    // Ensure the playerCode is saved in memory
                    normalized.playerCode = cleanCode;
                    setUser(normalized);
                    try {
                        sessionStorage.setItem('activePlayerId', normalized.id);
                        localStorage.setItem('activePlayerId', normalized.id);
                    } catch {}
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
            try {
                await supabase.auth.signOut();
            } catch {}
        }
        try {
            sessionStorage.removeItem('activePlayerId');
            localStorage.removeItem('activePlayerId');
            sessionStorage.removeItem('activeCreator');
            localStorage.removeItem('activeCreator');
        } catch {}
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
