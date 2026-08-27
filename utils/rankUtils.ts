import type { Rank, Tier, Player } from '../types';
import {
    ROOKIE_BADGE_SVG,
    VETERAN_BADGE_SVG,
    ELITE_BADGE_SVG,
    PRO_BADGE_SVG,
    MASTER_BADGE_SVG,
    LEGENDARY_BADGE_SVG,
    resolveRankIcon,
    getRankBadgeSvg,
} from './rankBadges';

export { resolveRankIcon, getRankBadgeSvg };

export const DEFAULT_RANKS: Rank[] = [
    {
        id: 'rank_rookie',
        name: 'Rookie',
        description: 'Initial operational rank for new recruits entering the field.',
        rankBadgeUrl: ROOKIE_BADGE_SVG,
        tiers: [
            { id: 'r_1', name: 'Rookie I', minXp: 0, perks: ['Recruit Calling Card', 'Basic Loadout Access'], iconUrl: ROOKIE_BADGE_SVG },
            { id: 'r_2', name: 'Rookie II', minXp: 100, perks: ['5% Gear Rental Discount', 'Weapon XP Boost'], iconUrl: ROOKIE_BADGE_SVG },
            { id: 'r_3', name: 'Rookie III', minXp: 200, perks: ['Custom Field Patch', 'Tactical Calling Card'], iconUrl: ROOKIE_BADGE_SVG },
            { id: 'r_4', name: 'Rookie IV', minXp: 300, perks: ['Weapon XP Card (100 Bonus RP)', 'Priority Briefing'], iconUrl: ROOKIE_BADGE_SVG },
            { id: 'r_5', name: 'Rookie V', minXp: 400, perks: ['Rookie Master Ribbon', 'Special Event Entry'], iconUrl: ROOKIE_BADGE_SVG },
        ]
    },
    {
        id: 'rank_veteran',
        name: 'Veteran',
        description: 'Seasoned battlefield operators with proven combat performance.',
        rankBadgeUrl: VETERAN_BADGE_SVG,
        tiers: [
            { id: 'v_1', name: 'Veteran I', minXp: 500, perks: ['Veteran Bronze Insignia', 'Weapon XP Card'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v_2', name: 'Veteran II', minXp: 750, perks: ['10% Ammo Discount', 'Custom Camo Token'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v_3', name: 'Veteran III', minXp: 1000, perks: ['Squad Leader Eligible', 'Free Smoke Grenade Tag'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v_4', name: 'Veteran IV', minXp: 1250, perks: ['Weapon XP Card (100 Bonus RP)', 'Veteran Frame'], iconUrl: VETERAN_BADGE_SVG },
            { id: 'v_5', name: 'Veteran V', minXp: 1500, perks: ['Elite Tournament Access', 'Exclusive Veteran Patch'], iconUrl: VETERAN_BADGE_SVG },
        ]
    },
    {
        id: 'rank_elite',
        name: 'Elite',
        description: 'High-tier combat specialists demonstrating tactical excellence.',
        rankBadgeUrl: ELITE_BADGE_SVG,
        tiers: [
            { id: 'e_1', name: 'Elite I', minXp: 1750, perks: ['Silver Tactical Wings', '15% Rental Discount'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e_2', name: 'Elite II', minXp: 2000, perks: ['Elite Weapon Skin Card', 'Custom Callsign Plaque'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e_3', name: 'Elite III', minXp: 2300, perks: ['VIP Staging Zone Access', 'Exclusive Event Pass'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e_4', name: 'Elite IV', minXp: 2600, perks: ['Weapon XP Card (100 Bonus RP)', 'Tactical Recon Badge'], iconUrl: ELITE_BADGE_SVG },
            { id: 'e_5', name: 'Elite V', minXp: 3000, perks: ['Elite Vanguard Frame', 'Pro League Qualifier'], iconUrl: ELITE_BADGE_SVG },
        ]
    },
    {
        id: 'rank_pro',
        name: 'Pro',
        description: 'Top-bracket competitive warriors with exceptional precision and leadership.',
        rankBadgeUrl: PRO_BADGE_SVG,
        tiers: [
            { id: 'p_1', name: 'Pro I', minXp: 3500, perks: ['Gold Star Insignia', 'Tournament Seeding Boost'], iconUrl: PRO_BADGE_SVG },
            { id: 'p_2', name: 'Pro II', minXp: 4000, perks: ['20% Store & Rental Discount', 'Weapon Master Voucher'], iconUrl: PRO_BADGE_SVG },
            { id: 'p_3', name: 'Pro III', minXp: 4500, perks: ['Exclusive Neon Callsign Glow', 'Priority Slot in CQB'], iconUrl: PRO_BADGE_SVG },
            { id: 'p_4', name: 'Pro IV', minXp: 5000, perks: ['Weapon XP Card (100 Bonus RP)', 'Pro Combat Ribbon'], iconUrl: PRO_BADGE_SVG },
            { id: 'p_5', name: 'Pro V', minXp: 5500, perks: ['Pro Master Trophy Badge', 'Free Event Pass'], iconUrl: PRO_BADGE_SVG },
        ]
    },
    {
        id: 'rank_master',
        name: 'Master',
        description: 'Supreme echelon operators dominating arena scoreboards.',
        rankBadgeUrl: MASTER_BADGE_SVG,
        tiers: [
            { id: 'm_1', name: 'Master I', minXp: 6000, perks: ['Ruby Master Crest', '25% All-Access Pass'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm_2', name: 'Master II', minXp: 7000, perks: ['Custom 3D Animated Profile Banner', 'Golden Frame'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm_3', name: 'Master III', minXp: 8000, perks: ['Lifetime Arena VIP Perks', 'Exclusive Raffle Multiplier'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm_4', name: 'Master IV', minXp: 9000, perks: ['Weapon XP Card (100 Bonus RP)', 'Master Marksman Badge'], iconUrl: MASTER_BADGE_SVG },
            { id: 'm_5', name: 'Master V', minXp: 10000, perks: ['Master Hall of Fame Entry', 'Grandmaster Challenger Title'], iconUrl: MASTER_BADGE_SVG },
        ]
    },
    {
        id: 'rank_legendary',
        name: 'Legendary',
        description: 'The pinnacle of tactical mastery. The absolute best operators in the league.',
        rankBadgeUrl: LEGENDARY_BADGE_SVG,
        tiers: [
            { id: 'leg_1', name: 'Legendary', minXp: 12000, perks: ['Legendary Mythic Insignia', 'Golden Avatar Frame', 'Arena Hall of Legends Plaque', 'VIP Free Season Pass'], iconUrl: LEGENDARY_BADGE_SVG }
        ]
    }
];

export const FALLBACK_RECRUIT_TIER: Tier = {
    id: 'tier_recruit',
    name: 'Rookie I',
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
