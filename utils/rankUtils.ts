import type { Rank, Tier, Player } from '../types';
import {
    ROOKIE_BADGE_SVG,
    ROOKIE_2_BADGE_SVG,
    ROOKIE_3_BADGE_SVG,
    VETERAN_BADGE_SVG,
    ELITE_BADGE_SVG,
    PRO_BADGE_SVG,
    MASTER_BADGE_SVG,
    GRANDMASTER_BADGE_SVG,
    LEGENDARY_BADGE_SVG,
    resolveRankIcon,
    getRankBadgeSvg,
} from './rankBadges';

export { resolveRankIcon, getRankBadgeSvg };

export const DEFAULT_RANKS: Rank[] = [
    {
        id: 'rank_rookie_1',
        name: 'Rookie I',
        description: 'First steps in tactical combat operations.',
        rankBadgeUrl: ROOKIE_BADGE_SVG,
        tiers: [
            { id: 'r1_1', name: 'Training', minXp: 0, perks: ['Recruit Calling Card', 'Basic Loadout Access'], iconUrl: ROOKIE_BADGE_SVG },
            { id: 'r1_2', name: 'Field Ready', minXp: 150, perks: ['5% Gear Rental Discount', 'Weapon XP Boost'], iconUrl: ROOKIE_BADGE_SVG },
        ]
    },
    {
        id: 'rank_rookie_2',
        name: 'Rookie II',
        description: 'Demonstrating solid fundamentals and match readiness.',
        rankBadgeUrl: ROOKIE_2_BADGE_SVG,
        tiers: [
            { id: 'r2_1', name: 'Rookie Level 2', minXp: 300, perks: ['Custom Field Patch', 'Tactical Calling Card'], iconUrl: ROOKIE_2_BADGE_SVG },
            { id: 'r2_2', name: 'Marksman Trainee', minXp: 450, perks: ['Weapon XP Card (+100 RP)', 'Priority Briefing'], iconUrl: ROOKIE_2_BADGE_SVG },
        ]
    },
    {
        id: 'rank_rookie_3',
        name: 'Rookie III',
        description: 'Advanced rookie transitioning to veteran qualification.',
        rankBadgeUrl: ROOKIE_3_BADGE_SVG,
        tiers: [
            { id: 'r3_1', name: 'Field Qualified', minXp: 600, perks: ['Rookie Master Ribbon', 'Special Event Entry'], iconUrl: ROOKIE_3_BADGE_SVG },
            { id: 'r3_2', name: 'Veteran Aspirant', minXp: 750, perks: ['Squad Comms Clearance', 'Extra Magazine Token'], iconUrl: ROOKIE_3_BADGE_SVG },
        ]
    },
    {
        id: 'rank_veteran_1',
        name: 'Veteran I',
        description: 'Seasoned battlefield operator with proven combat discipline.',
        rankBadgeUrl: VETERAN_BADGE_SVG,
        tiers: [
            { id: 'v1_1', name: 'Field Operative', minXp: 900, perks: ['Veteran Bronze Insignia', 'Weapon XP Card'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v1_2', name: 'Combat Specialist', minXp: 1150, perks: ['10% Ammo Discount', 'Custom Camo Token'], iconUrl: VETERAN_BADGE_SVG },
        ]
    },
    {
        id: 'rank_veteran_2',
        name: 'Veteran II',
        description: 'Battle-hardened operator commanding tactical skirmishes.',
        rankBadgeUrl: VETERAN_BADGE_SVG,
        tiers: [
            { id: 'v2_1', name: 'Squad Leader Eligible', minXp: 1400, perks: ['Squad Leader Authority', 'Free Smoke Grenade Tag'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v2_2', name: 'Tactical Veteran', minXp: 1650, perks: ['Weapon XP Card (100 Bonus RP)', 'Veteran Frame'], iconUrl: VETERAN_BADGE_SVG },
        ]
    },
    {
        id: 'rank_veteran_3',
        name: 'Veteran III',
        description: 'Peak veteran mastery ready for elite squad induction.',
        rankBadgeUrl: VETERAN_BADGE_SVG,
        tiers: [
            { id: 'v3_1', name: 'Combat Veteran', minXp: 1900, perks: ['Elite Tournament Access', 'Exclusive Veteran Patch'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v3_2', name: 'Senior Operative', minXp: 2200, perks: ['Priority Queue Access', 'Tactical Radio Badge'], iconUrl: VETERAN_BADGE_SVG },
        ]
    },
    {
        id: 'rank_elite_1',
        name: 'Elite I',
        description: 'High-tier combat specialist demonstrating tactical excellence.',
        rankBadgeUrl: ELITE_BADGE_SVG,
        tiers: [
            { id: 'e1_1', name: 'Specialist Training', minXp: 2500, perks: ['Silver Tactical Wings', '15% Rental Discount'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e1_2', name: 'Recon Specialist', minXp: 2850, perks: ['Elite Weapon Skin Card', 'Custom Callsign Plaque'], iconUrl: ELITE_BADGE_SVG },
        ]
    },
    {
        id: 'rank_elite_2',
        name: 'Elite II',
        description: 'Master of recon, precision assaults, and mission dominance.',
        rankBadgeUrl: ELITE_BADGE_SVG,
        tiers: [
            { id: 'e2_1', name: 'Tactical Specialist', minXp: 3200, perks: ['VIP Staging Zone Access', 'Exclusive Event Pass'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e2_2', name: 'Apex Specialist', minXp: 3550, perks: ['Weapon XP Card (100 Bonus RP)', 'Tactical Recon Badge'], iconUrl: ELITE_BADGE_SVG },
        ]
    },
    {
        id: 'rank_elite_3',
        name: 'Elite III',
        description: 'Apex elite vanguard preparing for professional tournament tier.',
        rankBadgeUrl: ELITE_BADGE_SVG,
        tiers: [
            { id: 'e3_1', name: 'Elite Vanguard', minXp: 3900, perks: ['Elite Vanguard Frame', 'Pro League Qualifier'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e3_2', name: 'Elite Commando', minXp: 4300, perks: ['Commando Crest', 'Custom Weapon Sling Token'], iconUrl: ELITE_BADGE_SVG },
        ]
    },
    {
        id: 'rank_pro_1',
        name: 'Pro I',
        description: 'Top-bracket competitive warrior with exceptional precision.',
        rankBadgeUrl: PRO_BADGE_SVG,
        tiers: [
            { id: 'p1_1', name: 'Pro Cadet', minXp: 4700, perks: ['Gold Star Insignia', 'Tournament Seeding Boost'], iconUrl: PRO_BADGE_SVG },
            { id: 'p1_2', name: 'Tournament Seeding', minXp: 5100, perks: ['20% Store & Rental Discount', 'Weapon Master Voucher'], iconUrl: PRO_BADGE_SVG },
        ]
    },
    {
        id: 'rank_pro_2',
        name: 'Pro II',
        description: 'Competitive arena expert with lethal CQB and strategic reflexes.',
        rankBadgeUrl: PRO_BADGE_SVG,
        tiers: [
            { id: 'p2_1', name: 'CQB Master', minXp: 5500, perks: ['Exclusive Neon Callsign Glow', 'Priority Slot in CQB'], iconUrl: PRO_BADGE_SVG },
            { id: 'p2_2', name: 'Pro Strategist', minXp: 5900, perks: ['Weapon XP Card (100 Bonus RP)', 'Pro Combat Ribbon'], iconUrl: PRO_BADGE_SVG },
        ]
    },
    {
        id: 'rank_pro_3',
        name: 'Pro III',
        description: 'Elite professional champion nearing supreme master rank.',
        rankBadgeUrl: PRO_BADGE_SVG,
        tiers: [
            { id: 'p3_1', name: 'Pro Master', minXp: 6300, perks: ['Pro Master Trophy Badge', 'Free Event Pass'], iconUrl: PRO_BADGE_SVG },
            { id: 'p3_2', name: 'Pro Vanguard', minXp: 6750, perks: ['Champion Banner', 'Lifetime 20% Field Discount'], iconUrl: PRO_BADGE_SVG },
        ]
    },
    {
        id: 'rank_master_1',
        name: 'Master I',
        description: 'Supreme echelon operator dominating arena scoreboards.',
        rankBadgeUrl: MASTER_BADGE_SVG,
        tiers: [
            { id: 'm1_1', name: 'Master Initiate', minXp: 7200, perks: ['Ruby Master Crest', '25% All-Access Pass'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm1_2', name: 'Ruby Marksman', minXp: 7700, perks: ['Custom 3D Profile Frame', 'Ruby Inlay Patch'], iconUrl: MASTER_BADGE_SVG },
        ]
    },
    {
        id: 'rank_master_2',
        name: 'Master II',
        description: 'Feared battlefield strategist with flawless record.',
        rankBadgeUrl: MASTER_BADGE_SVG,
        tiers: [
            { id: 'm2_1', name: 'Tactical Master', minXp: 8200, perks: ['Lifetime Arena VIP Perks', 'Exclusive Raffle Multiplier'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm2_2', name: 'Supreme Master', minXp: 8750, perks: ['Weapon XP Card (100 Bonus RP)', 'Master Marksman Badge'], iconUrl: MASTER_BADGE_SVG },
        ]
    },
    {
        id: 'rank_master_3',
        name: 'Master III',
        description: 'Apex master tier standing on the threshold of Grandmaster.',
        rankBadgeUrl: MASTER_BADGE_SVG,
        tiers: [
            { id: 'm3_1', name: 'Senior Master', minXp: 9300, perks: ['Master Hall of Fame Entry', 'Golden Calling Card'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm3_2', name: 'Master Apex', minXp: 9900, perks: ['Supreme Master Crown', 'Challenger Title'], iconUrl: MASTER_BADGE_SVG },
        ]
    },
    {
        id: 'rank_grandmaster',
        name: 'Grandmaster',
        description: 'Legendary commander and grandmaster of the entire tactical league.',
        rankBadgeUrl: GRANDMASTER_BADGE_SVG,
        tiers: [
            { id: 'gm_1', name: 'Grandmaster Initiate', minXp: 10500, perks: ['Royal Grandmaster Crest', 'Crown Callsign Halo', 'Permanent 30% Pass'], iconUrl: GRANDMASTER_BADGE_SVG },
            { id: 'gm_2', name: 'Grandmaster Vanguard', minXp: 11250, perks: ['Grandmaster Crown', 'Hall of Fame Golden Plaque'], iconUrl: GRANDMASTER_BADGE_SVG },
        ]
    },
    {
        id: 'rank_legendary',
        name: 'Legendary',
        description: 'The pinnacle of tactical mastery. The absolute greatest operator.',
        rankBadgeUrl: LEGENDARY_BADGE_SVG,
        tiers: [
            { id: 'leg_1', name: 'Apex Legend', minXp: 12000, perks: ['Legendary Mythic Insignia', 'Golden Avatar Frame', 'Arena Hall of Legends Plaque', 'VIP Free Lifetime Season Pass'], iconUrl: LEGENDARY_BADGE_SVG }
        ]
    }
];

export const FALLBACK_RECRUIT_TIER: Tier = {
    id: 'tier_recruit',
    name: 'Training',
    minXp: 0,
    perks: ['Recruit Calling Card', 'Basic Loadout Access'],
    iconUrl: ROOKIE_BADGE_SVG
};

export interface FlatTierItem extends Tier {
    rankId: string;
    rankName: string;
    rankDescription: string;
    rankBadgeUrl: string;
    tierIndex: number;
    totalTiersInRank: number;
    globalIndex: number;
}

/**
 * Extracts and sorts all tiers across all ranks in ascending order of minXp.
 */
export function getAllTiersSorted(ranks?: Rank[]): FlatTierItem[] {
    const activeRanks = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;
    const flat: FlatTierItem[] = [];

    // Sort ranks by lowest tier minXp
    const sortedRanks = [...activeRanks].sort((a, b) => {
        const minA = a.tiers && a.tiers.length > 0 ? Math.min(...a.tiers.map(t => t.minXp)) : 0;
        const minB = b.tiers && b.tiers.length > 0 ? Math.min(...b.tiers.map(t => t.minXp)) : 0;
        return minA - minB;
    });

    sortedRanks.forEach(rank => {
        const sortedTiers = [...(rank.tiers || [])].sort((a, b) => a.minXp - b.minXp);
        sortedTiers.forEach((tier, index) => {
            const resolvedRankBadge = resolveRankIcon(rank.rankBadgeUrl, rank.name);
            const resolvedIcon = resolveRankIcon(tier.iconUrl, rank.name, tier.name, rank.rankBadgeUrl);
            flat.push({
                ...tier,
                iconUrl: resolvedIcon,
                rankId: rank.id,
                rankName: rank.name,
                rankDescription: rank.description,
                rankBadgeUrl: resolvedRankBadge,
                tierIndex: index + 1,
                totalTiersInRank: sortedTiers.length,
                globalIndex: flat.length,
            });
        });
    });

    // Final sort ascending by minXp
    return flat.sort((a, b) => a.minXp - b.minXp);
}

/**
 * Returns the correct tier corresponding to the player's XP.
 * Automatically checks all ranks and returns the highest unlocked tier.
 */
export function getTierForXp(xp: number = 0, ranks?: Rank[]): Tier {
    const allTiers = getAllTiersSorted(ranks);
    if (allTiers.length === 0) return FALLBACK_RECRUIT_TIER;

    // Filter tiers whose minXp <= xp, pick the one with the highest minXp
    const eligible = allTiers.filter(t => xp >= t.minXp);
    if (eligible.length === 0) return allTiers[0];
    return eligible[eligible.length - 1];
}

/**
 * Resolves the player's rank/tier based on their current XP stats.
 */
export function getRankForPlayer(player?: { stats?: { xp?: number } } | null, ranks?: Rank[]): Tier {
    const xp = player?.stats?.xp ?? 0;
    return getTierForXp(xp, ranks);
}

export const getTierForPlayer = getRankForPlayer;

/**
 * Computes full progression details (previous tier, current tier, next tier, rank parent, progress %, xp remaining).
 */
export function getRankProgression(player?: { stats?: { xp?: number } } | null, ranks?: Rank[]) {
    const allTiers = getAllTiersSorted(ranks);
    const playerXp = player?.stats?.xp ?? 0;
    const currentTier = getTierForXp(playerXp, ranks);

    const currentIdx = allTiers.findIndex(t => t.id === currentTier.id || (t.name === currentTier.name && t.minXp === currentTier.minXp));
    const safeIdx = currentIdx >= 0 ? currentIdx : 0;

    const previous = safeIdx > 0 ? allTiers[safeIdx - 1] : null;
    const current = allTiers[safeIdx] || currentTier;
    const next = safeIdx < allTiers.length - 1 ? allTiers[safeIdx + 1] : null;

    const startXp = current.minXp;
    const endXp = next ? next.minXp : current.minXp;
    const xpDifference = endXp - startXp;

    const progressPercentage = next
        ? (xpDifference > 0 ? Math.min(Math.max(((playerXp - startXp) / xpDifference) * 100, 0), 100) : 100)
        : 100;

    const xpToNext = next ? Math.max(next.minXp - playerXp, 0) : 0;

    const activeRanks = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;
    const rank = activeRanks.find(r => (r.tiers || []).some(t => t.id === current.id || t.name === current.name)) || null;

    return {
        previous,
        current,
        next,
        rank,
        allTiers,
        currentIdx: safeIdx,
        playerXp,
        startXp,
        endXp,
        progressPercentage,
        xpToNext,
        isMaxRank: !next,
    };
}

/**
 * Returns an updated copy of the player object with `player.rank` guaranteed to match their current `stats.xp`.
 */
export function autoSyncPlayerRank(player: Player, ranks?: Rank[]): Player {
    const calculatedTier = getRankForPlayer(player, ranks);
    if (!player.rank || player.rank.id !== calculatedTier.id || player.rank.minXp !== calculatedTier.minXp) {
        return {
            ...player,
            rank: calculatedTier,
        };
    }
    return player;
}
