
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import type { GameEvent, Player, InventoryItem, GamificationSettings, PaymentStatus, PlayerStats, EventStatus, EventType, Transaction, EventAttendee, Signup, CompanyDetails, LegendaryBadge, XpAdjustment, Rank, Tier } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ArrowLeftIcon, CalendarIcon, UserIcon, TrashIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, ChartBarIcon, ExclamationTriangleIcon, TrophyIcon, MinusIcon, CurrencyDollarIcon, CogIcon } from './icons/Icons';
import { MOCK_EVENT_THEMES, EVENT_STATUSES, EVENT_TYPES, UNRANKED_TIER } from '../constants';
import { BadgePill } from './BadgePill';
import { InfoTooltip } from './InfoTooltip';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';

interface ManageEventPageProps {
    event?: GameEvent;
    players: Player[];
    inventory: InventoryItem[];
    gamificationSettings: GamificationSettings;
    legendaryBadges: LegendaryBadge[];
    onBack: () => void;
    onSave: (eventData: GameEvent) => void;
    onDelete: (eventId: string) => void;
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    signups: Signup[];
    setDoc: (collectionName: string, docId: string, data: object) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    companyDetails: CompanyDetails;
}

const defaultEvent: Omit<GameEvent, 'id'> = {
    title: '',
    type: 'Mission',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    location: '',
    description: '',
    theme: MOCK_EVENT_THEMES[0],
    rules: '',
    participationXp: 50,
    attendees: [],
    status: 'Upcoming',
    gameFee: 0,
    gearForRent: [],
    eventBadges: [],
    liveStats: {},
};

const getRankForPlayer = (player: Player, ranks: Rank[]): Tier => {
    if (!ranks || ranks.length === 0) return UNRANKED_TIER;
    const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean).sort((a, b) => b.minXp - a.minXp);
    if (allTiers.length === 0) return UNRANKED_TIER;
    const tier = allTiers.find(r => (player.stats?.xp ?? 0) >= r.minXp);
    const lowestTier = [...allTiers].sort((a,b) => a.minXp - b.minXp)[0];
    return tier || lowestTier || UNRANKED_TIER;
};


export const ManageEventPage: React.FC<ManageEventPageProps> = ({
    event, players, inventory, gamificationSettings, legendaryBadges, onBack, onSave, onDelete, setPlayers, setTransactions, signups, setDoc, deleteDoc, companyDetails
}) => {
    // FIX: Use useContext to correctly access DataContext.
    const dataContext = useContext(DataContext);
    const [formData, setFormData] = useState<Omit<GameEvent, 'id'>>(() => {
        if (!event) return defaultEvent;
        // Ensure date is in 'YYYY-MM-DD' format for the input
        const date = new Date(event.date).toISOString().split('T')[0];
        return { ...event, date };
    });
    
    const [liveStats, setLiveStats] = useState<Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>>(event?.liveStats || {});
    
    // --- Audio Recording State & Handlers ---
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);

    const stopRecordingCleanup = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        setIsRecording(false);
        setRecordingSeconds(0);
    }

    const handleStartRecording = async () => {
        setPermissionError(null);
        setFormData(f => ({ ...f, audioBriefingUrl: undefined })); // Clear previous recording

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorderRef.current.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorderRef.current.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // webm is well supported
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    setFormData(f => ({ ...f, audioBriefingUrl: base64data }));
                };
                stopRecordingCleanup();
            });

            mediaRecorderRef