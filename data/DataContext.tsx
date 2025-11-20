

import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo, useCallback } from 'react';
import { USE_FIREBASE, db, firebaseInitializationError, firebase } from '../firebase';
import * as mock from '../constants';
import type { Player, GameEvent, GamificationSettings, Badge, Sponsor, CompanyDetails, Voucher, InventoryItem, Supplier, Transaction, Location, Raffle, LegendaryBadge, GamificationRule, SocialLink, CarouselMedia, CreatorDetails, Signup, Rank, ApiGuideStep, Tier, Session, ActivityLog } from '../types';
import { AuthContext } from '../auth/AuthContext';

export const IS_LIVE_DATA = USE_FIREBASE && !!db && !firebaseInitializationError;

// Helper to fetch collection data
function useCollection<T extends {id: string}>(collectionName: string, mockData: T[], dependencies: any[] = [], options: { isProtected?: boolean } = {}) {
    const [data, setData] = useState<T[]>(IS_LIVE_DATA ? [] : mockData);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (IS_LIVE_DATA) {
            const userRole = auth?.user?.role;
            
            // Don't fetch protected collections at all if not authenticated
            if (options.isProtected && !auth?.isAuthenticated) {
                setData([]); 
                setLoading(false);
                return; 
            }

            // Specifically block players from fetching admin-only collections to conserve read quotas
            const collectionsToBlockForPlayer = ['transactions', 'sessions', 'activityLog', 'suppliers', 'vouchers', 'apiSetupGuide', 'gamificationSettings'];
            if (userRole === 'player' && collectionsToBlockForPlayer.includes(collectionName)) {
                setData([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const q = db!.collection(collectionName);
            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const newItems: T[] = [];
                querySnapshot.forEach((doc) => {
                    newItems.push({ id: doc.id, ...doc.data() } as unknown as T);
                });

                setData(prevItems => {
                    // Sort by ID to ensure consistent order for stringify comparison
                    const sortById = (a: T, b: T) => a.id.localeCompare(b.id);
                    const sortedPrev = [...prevItems].sort(sortById);
                    const sortedNew = [...newItems].sort(sortById);

                    if (JSON.stringify(sortedPrev) === JSON.stringify(sortedNew)) {
                        return prevItems; // Data is the same, return previous state to prevent re-render
                    }
                    return newItems; // Data has changed, update state
                });

                setLoading(false);
            }, (error) => {
                console.error(`Error fetching ${collectionName}: `, error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setData(mockData);
            setLoading(false);
        }
    // Add auth?.isAuthenticated and user role to dependency array to refetch on login/logout or role change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.isAuthenticated, auth?.user?.role, ...dependencies]);

    return [data, setData, loading] as const;
}

// Helper to fetch a single document
function useDocument<T>(collectionName: string, docId: string, mockData: T) {
    const [data, setData] = useState<T>(mockData);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (IS_LIVE_DATA) {
            setLoading(true);
            const docRef = db!.collection(collectionName).doc(docId);
            const unsubscribe = docRef.onSnapshot((docSnap) => {
                if (docSnap.exists) {
                    const firestoreData = docSnap.data() || {};
                    const newData = { ...mockData, ...firestoreData };

                    setData(prevData => {
                        // Perform deep comparison to prevent unnecessary re-renders
                        if (JSON.stringify(prevData) === JSON.stringify(newData)) {
                            return prevData;
                        }
                        return newData as T;
                    });

                } else {
                    console.warn(`Document ${docId} not found in ${collectionName}. Waiting for seed.`);
                }
                setLoading(false);
            }, (error) => {
                console.error(`Error fetching document ${collectionName}/${docId}: `, error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setData(mockData);
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, docId]);

     const updateData = async (newData: Partial<T>) => {
        // Optimistically update the state for a responsive UI.
        setData(prev => ({...prev, ...newData}));

        if (IS_LIVE_DATA) {
            try {
                const docRef = db!.collection(collectionName).doc(docId);
                // Persist the change. The onSnapshot listener will also get this update,
                // but our deep comparison check prevents a redundant re-render.
                await docRef.set(newData, { merge: true });
            } catch (error: any) {
                console.error(`Failed to save document ${collectionName}/${docId}:`, error);
                alert(`Failed to save settings: ${error.message}`);
                // In a production app, we might roll