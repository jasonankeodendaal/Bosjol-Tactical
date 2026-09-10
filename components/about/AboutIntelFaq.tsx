import React, { useState } from 'react';
import { 
    Terminal, 
    Search, 
    ChevronDown, 
    Sparkles, 
    HelpCircle, 
    Info, 
    CheckCircle2, 
    Shield, 
    Gauge, 
    Cpu, 
    Database, 
    Users, 
    DollarSign,
    Zap
} from 'lucide-react';

export const AboutIntelFaq: React.FC = () => {
    const [faqSearch, setFaqSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

    const faqs = [
        {
            id: 'faq-1',
            category: 'Match Operations',
            question: 'How does single-click Event Finalization cascade stats across operators?',
            answer: 'When a Game Master clicks "Finalize Event" on the Manage Event console, the system executes an atomic transaction across Supabase PostgreSQL. It checks all confirmed checked-in operators, increments their career attendance, awards +500 Rank Points (RP), computes earned milestone badges, unlocks new tier ranks, and automatically writes total ticket admissions and rental income into the Financial Ledger journal without requiring manual spreadsheets.'
        },
        {
            id: 'faq-2',
            category: 'Cloud & Database',
            question: 'How does real-time live synchronization work across field marshal and player screens?',
            answer: 'The system uses Supabase Cloud PostgreSQL with Change Data Capture (CDC) streaming over WebSockets (`postgres_changes`). When a marshal scans a player’s QR code, changes a match score, or updates armory rental status, the change broadcasts immediately to all connected devices in sub-15ms. The system also maintains local caching for offline resilience in remote wilderness arenas.'
        },
        {
            id: 'faq-3',
            category: 'Chrono & Ballistics',
            question: 'What happens if a primary replica fails the morning chronograph check?',
            answer: 'Any replica exceeding the configured Joule or FPS limit (e.g. >1.50J for Assault AEGs or >2.32J for Snipers) is flagged RED and cannot enter the active combat field. Operators may down-tune their spring, adjust HPA regulator tournament locks under marshal supervision, switch to a compliant secondary weapon, or rent a certified backup AEG from the Armory.'
        },
        {
            id: 'faq-4',
            category: 'Ranks & Progression',
            question: 'How are Rank Level-Ups, Insignias, and Promotion Perks unlocked?',
            answer: 'As operators accumulate Rank Points (RP) from match attendance (+500 RP), objective captures (+250 RP), and marshal commendations (+150 RP), their total RP is evaluated against the 6 Tier thresholds (Rookie -> Veteran -> Elite -> Pro -> Master -> Legendary). Crossing a threshold automatically updates the player card insignia on the global leaderboard and applies store discounts and rental perks to their profile.'
        },
        {
            id: 'faq-5',
            category: 'Financial Ledger',
            question: 'How are ticket entry fees and rental gear income calculated automatically?',
            answer: 'During event finalization, the accounting engine executes `Total Confirmed Players × Base Ticket Price` plus `Total Rental Packages × Rental Fee`. It generates a balanced double-entry transaction record with a unique journal ID, categorizes it under "Event Ticket Admissions" and "Armory Rental Income", and updates the gross revenue in the Financial Ledger overview.'
        },
        {
            id: 'faq-6',
            category: 'Emergency & First Aid',
            question: 'What is the "Blind Man" emergency cease-fire protocol?',
            answer: 'If any individual loses eye protection, suffers an injury, or an unauthorized civilian enters the active combat zone, ANY operator must loudly shout "BLIND MAN! BLIND MAN!". All players immediately echo the call, stop firing, switch replicas to SAFE, point barrels down, and remain in place until Field Marshals secure the situation and declare "ALL CLEAR / GAME ON".'
        },
        {
            id: 'faq-7',
            category: 'Field Etiquette',
            question: 'What is the standard Hit-Call protocol and Ricochet rule?',
            answer: 'Airsoft operates strictly on the honor system. Any direct BB strike to any part of an operator’s body, head, gear, plate carrier, backpack, or holster counts as a hit. When struck, shout "HIT!" loudly, raise your red dead-rag or hand high, and return to respawn. Ricochets off trees or walls do not count unless specified by scenario rules.'
        },
        {
            id: 'faq-8',
            category: 'Armory & Gear',
            question: 'What type of BBs and eye protection are mandatory at Bosjol Tactical?',
            answer: 'Only 100% biodegradable PLA BBs (0.20g to 0.45g) are permitted to preserve the outdoor arena ecology. Eye protection must be full-seal ballistic rated to ANSI Z87.1+ or EN166 standards with retention straps. Mesh goggles require protective safety glasses underneath. Full lower face steel mesh is mandatory for players under 18.'
        },
        {
            id: 'faq-9',
            category: 'Match Operations',
            question: 'What are the UHF/FRS squad radio channels assigned during combat matches?',
            answer: 'Channel 1 (462.5625 MHz) is dedicated to Marshal Command & Emergency Cease-Fire alerts. Channel 2 (462.5875 MHz) is assigned to Alpha Faction (Blue Team). Channel 3 (462.6125 MHz) is assigned to Bravo Faction (Red Team). Channel 4 (462.6375 MHz) is reserved for Armory, Battery swaps, and Medical Logistics.'
        },
        {
            id: 'faq-10',
            category: 'Chrono & Ballistics',
            question: 'What is the Minimum Engagement Distance (MED) for DMRs and Snipers?',
            answer: 'Designated Marksman Rifles (DMRs, max 1.88J / 450 FPS on 0.20g, semi-locked) have a strict 15-meter MED. Bolt Action Sniper Rifles (BASR, max 2.32J / 500 FPS on 0.20g) have a 20-meter MED. Within their respective MED, operators must switch to a sidearm (0m MED) or call surrender.'
        },
        {
            id: 'faq-11',
            category: 'Ranks & Progression',
            question: 'Do Rank Points (RP) reset between seasons?',
            answer: 'Career Tier insignias, historic match attendance, and earned Legendary Achievement Medals are permanently preserved in your operator legacy. However, the Competitive Seasonal Leaderboard resets every 6 months to give new recruits and rising veterans a fair shot at the seasonal Grandmaster Crown.'
        },
        {
            id: 'faq-12',
            category: 'Armory & Gear',
            question: 'What is included in the Turnkey Rental Package for recruits?',
            answer: 'The rental package includes a high-performance M4 AEG (G&G Raider / Specna Core shooting ~360 FPS), 2x 300-round high-capacity magazines, an 11.1v LiPo battery with free battery swaps throughout the day, a full-face anti-fog protective mask, a speedloader, and a starter bag of 2,000 precision 0.25g bio BBs.'
        }
    ];

    const categories = ['All', 'Match Operations', 'Cloud & Database', 'Chrono & Ballistics', 'Ranks & Progression', 'Financial Ledger', 'Emergency & First Aid', 'Field Etiquette', 'Armory & Gear'];

    const filteredFaqs = faqs.filter(f => {
        const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
        const matchesSearch = !faqSearch.trim() || 
            f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
            f.answer.toLowerCase().includes(faqSearch.toLowerCase()) || 
            f.category.toLowerCase().includes(faqSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-red-500" />
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Tactical Intel Terminal &amp; Comprehensive Knowledgebase
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Instant searchable answers covering match operations, cloud sync, chrono physics, and field safety rules.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search intel knowledgebase..."
                        value={faqSearch}
                        onChange={e => setFaqSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                    />
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                            selectedCategory === cat
                                ? 'bg-red-600 text-white font-black shadow-md shadow-red-900/30'
                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FAQ Accordion List */}
            <div className="space-y-2.5">
                {filteredFaqs.map(faq => {
                    const isExpanded = expandedFaq === faq.id;
                    return (
                        <div
                            key={faq.id}
                            className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden transition-all shadow-md"
                        >
                            <button
                                onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-zinc-900/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-800/50 shrink-0">
                                        {faq.category}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                                        {faq.question}
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-red-400' : ''}`} />
                            </button>
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60 bg-black/40">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredFaqs.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 text-xs bg-zinc-950/50 rounded-2xl border border-zinc-800">
                        No intel documents found matching "{faqSearch}". Try searching for "chrono", "RP", "radio", or "safety".
                    </div>
                )}
            </div>
        </div>
    );
};
