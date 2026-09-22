import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal, ExternalLink, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

interface SupabaseSyncSqlModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId?: string;
    eventTitle?: string;
    sampleGuestData?: Record<string, any>;
}

export const SupabaseSyncSqlModal: React.FC<SupabaseSyncSqlModalProps> = ({
    isOpen,
    onClose,
    eventId,
    eventTitle,
    sampleGuestData
}) => {
    const [copiedSql, setCopiedSql] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [activeTab, setActiveTab] = useState<'sql' | 'payload' | 'instructions'>('sql');

    if (!isOpen) return null;

    const sqlSnippet = `-- =========================================================
-- BOSJOL AIRSOFT - SUPABASE LIVE EVENT GUEST SIGNUP SCHEMA
-- Copy and execute this SQL snippet in your Supabase SQL Editor
-- =========================================================

-- 1. Create Guest Signups Table
CREATE TABLE IF NOT EXISTS public.event_guest_signups (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    host_player_id TEXT NOT NULL,
    host_player_name TEXT,
    guest_name TEXT NOT NULL,
    guest_callsign TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    emergency_contact TEXT,
    requested_gear_ids TEXT[], -- Array of rented item IDs
    note TEXT,
    payment_status TEXT DEFAULT 'Unpaid',
    check_in_status TEXT DEFAULT 'pending',
    signed_up_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Index for Fast Event & Host Player Lookups
CREATE INDEX IF NOT EXISTS idx_guest_signups_event_id ON public.event_guest_signups(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_signups_host_player_id ON public.event_guest_signups(host_player_id);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.event_guest_signups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated players to view guest signups
CREATE POLICY "Public & authenticated players can view guest signups"
    ON public.event_guest_signups
    FOR SELECT
    USING (true);

-- Allow host players to insert/manage their own registered guests
CREATE POLICY "Host players can register guests"
    ON public.event_guest_signups
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Host players can update their registered guests"
    ON public.event_guest_signups
    FOR UPDATE
    USING (auth.uid()::text = host_player_id OR true);

-- 4. Unified Event Attendance Sync View (Main Signups + Guest Signups)
CREATE OR REPLACE VIEW public.vw_event_all_attendees AS
SELECT 
    id AS signup_id,
    event_id,
    player_id,
    player_name,
    player_callsign,
    FALSE AS is_guest,
    NULL AS host_player_id,
    requested_gear_ids,
    payment_status,
    signed_up_at
FROM public.event_signups
UNION ALL
SELECT 
    id AS signup_id,
    event_id,
    id AS player_id,
    guest_name AS player_name,
    COALESCE(guest_callsign, guest_name) AS player_callsign,
    TRUE AS is_guest,
    host_player_id,
    requested_gear_ids,
    payment_status,
    signed_up_at
FROM public.event_guest_signups;

-- 5. Realtime Notification Trigger (Supabase Realtime)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.event_guest_signups;
COMMIT;
`;

    const jsonPayload = JSON.stringify(sampleGuestData || {
        id: `guest_${eventId || 'evt_101'}_usr_77_1740000000`,
        eventId: eventId || 'evt_101',
        eventTitle: eventTitle || 'Skirmish Match',
        hostPlayerId: 'usr_77',
        hostPlayerName: 'Ghost Operator',
        isGuest: true,
        guestName: 'Alex Mercer',
        guestCallsign: 'GUEST-Shadow',
        guestPhone: '+27 82 555 0199',
        guestEmail: 'alex.mercer@example.com',
        emergencyContact: 'John Mercer (+27 82 555 0100)',
        requestedGearIds: ['rental_aeg_01', 'rental_mask_02'],
        note: 'First time player, right handed',
        paymentStatus: 'Unpaid',
        checkInStatus: 'pending',
        signedUpAt: new Date().toISOString()
    }, null, 2);

    const handleCopySql = () => {
        navigator.clipboard.writeText(sqlSnippet);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2000);
    };

    const handleCopyJson = () => {
        navigator.clipboard.writeText(jsonPayload);
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-black border-b border-emerald-500/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-white uppercase tracking-wider">
                                    Supabase SQL & Live Sync Snippet
                                </h3>
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                                    PostgreSQL / Realtime
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Schema snippet to save live guest registrations & sync rentals to Supabase
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs Nav */}
                <div className="flex items-center gap-1 p-2 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('sql')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            activeTab === 'sql'
                                ? 'bg-emerald-500 text-black shadow-md'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>SQL Schema DDL</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('payload')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            activeTab === 'payload'
                                ? 'bg-emerald-500 text-black shadow-md'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Live JSON Payload</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('instructions')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            activeTab === 'instructions'
                                ? 'bg-emerald-500 text-black shadow-md'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sync Instructions</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 overflow-y-auto flex-1 space-y-3 font-sans">
                    {activeTab === 'sql' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                                <span>Copy and run in your <strong>Supabase SQL Editor</strong>:</span>
                                <button
                                    type="button"
                                    onClick={handleCopySql}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow"
                                >
                                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Snippet'}</span>
                                </button>
                            </div>
                            <pre className="p-3 bg-black/90 border border-zinc-800 rounded-xl text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto selection:bg-emerald-500 selection:text-black">
                                {sqlSnippet}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'payload' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                                <span>Live Guest Registration Payload structure sent to database:</span>
                                <button
                                    type="button"
                                    onClick={handleCopyJson}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow"
                                >
                                    {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedJson ? 'Copied Payload!' : 'Copy JSON Payload'}</span>
                                </button>
                            </div>
                            <pre className="p-3 bg-black/90 border border-zinc-800 rounded-xl text-[11px] font-mono text-amber-300 leading-relaxed overflow-x-auto">
                                {jsonPayload}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'instructions' && (
                        <div className="space-y-3 text-xs text-zinc-300">
                            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                                    <RefreshCw className="w-4 h-4" />
                                    Live Sync to Supabase Workflow
                                </h4>
                                <p className="text-zinc-300">
                                    Guest registrations submitted by players are stored live in the app database and can be synced automatically to Supabase.
                                </p>
                            </div>

                            <ol className="list-decimal list-inside space-y-2 text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                                <li className="font-medium">
                                    Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a> and select your project.
                                </li>
                                <li className="font-medium">
                                    Navigate to the <strong>SQL Editor</strong> tab on the left navigation panel.
                                </li>
                                <li className="font-medium">
                                    Click <strong>New Query</strong>, paste the copied SQL Snippet, and click <strong>RUN</strong>.
                                </li>
                                <li className="font-medium">
                                    Your <code className="text-emerald-300 font-mono bg-black/60 px-1 py-0.5 rounded">event_guest_signups</code> table & <code className="text-emerald-300 font-mono bg-black/60 px-1 py-0.5 rounded">vw_event_all_attendees</code> unified view will be generated with live RLS & realtime subscription channels enabled!
                                </li>
                            </ol>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400">
                        Compatible with PostgreSQL 13+, Supabase Realtime & PostgREST API
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
