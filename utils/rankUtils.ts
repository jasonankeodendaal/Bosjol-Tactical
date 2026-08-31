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
    { id: 'rank_rookie_1', name: 'Rookie I', desc: 'First steps in tactical combat operations.', badge: ROOKIE_BADGE_SVG, base: 0 },
    { id: 'rank_rookie_2', name: 'Rookie II', desc: 'Demonstrating solid fundamentals and match readiness.', badge: ROOKIE_2_BADGE_SVG, base: 10000 },
    { id: 'rank_rookie_3', name: 'Rookie III', desc: 'Advanced rookie transitioning to veteran qualification.', badge: ROOKIE_3_BADGE_SVG, base: 20000 },
    { id: 'rank_veteran_1', name: 'Veteran I', desc: 'Seasoned battlefield operator with proven combat discipline.', badge: VETERAN_BADGE_SVG, base: 30000 },
    { id: 'rank_veteran_2', name: 'Veteran II', desc: 'Battle-hardened operator commanding tactical skirmishes.', badge: VETERAN_BADGE_SVG, base: 40000 },
    { id: 'rank_veteran_3', name: 'Veteran III', desc: 'Peak veteran mastery ready for elite squad induction.', badge: VETERAN_BADGE_SVG, base: 50000 },
    { id: 'rank_pro_1', name: 'Pro I', desc: 'Top-bracket competitive warrior with exceptional precision.', badge: PRO_BADGE_SVG, base: 60000 },
    { id: 'rank_pro_2', name: 'Pro II', desc: 'Competitive arena expert with lethal CQB and strategic reflexes.', badge: PRO_BADGE_SVG, base: 70000 },
    { id: 'rank_pro_3', name: 'Pro III', desc: 'Elite professional champion nearing supreme master rank.', badge: PRO_BADGE_SVG, base: 80000 },
    { id: 'rank_elite_1', name: 'Elite I', desc: 'High-tier combat specialist demonstrating tactical excellence.', badge: ELITE_BADGE_SVG, base: 90000 },
    { id: 'rank_elite_2', name: 'Elite II', desc: 'Master of recon, precision assaults, and mission dominance.', badge: ELITE_BADGE_SVG, base: 100000 },
    { id: 'rank_elite_3', name: 'Elite III', desc: 'Apex elite vanguard preparing for supreme master tier.', badge: ELITE_BADGE_SVG, base: 110000 },
    { id: 'rank_master_1', name: 'Master', desc: 'Supreme echelon operator dominating arena scoreboards.', badge: MASTER_BADGE_SVG, base: 120000 },
    { id: 'rank_grandmaster', name: 'Grandmaster', desc: 'Legendary commander and grandmaster of the entire tactical league.', badge: GRANDMASTER_BADGE_SVG, base: 130000 },
    { id: 'rank_legendary', name: 'Legendary', desc: 'The pinnacle of tactical mastery. The absolute greatest operator.', badge: LEGENDARY_BADGE_SVG, base: 140000 },
].map(r => ({
    id: r.id,
    name: r.name,
    description: r.desc,
    rankBadgeUrl: r.badge,
    tiers: Array.from({ length: 10 }, (_, i) => {
        const level = i + 1;
        const minXp = r.base + i * 1000;
        return {
            id: `${r.id}_lvl_${level}`,
            name: `${r.name} - Level ${level}`,
            minXp: minXp,
            perks: [
                level === 1 ? `${r.name} Unlocked` : `${r.name} Tier ${level} Badge`,
                `Level ${level} Tactical Calling Card`
            ],
            iconUrl: r.badge
        };
    })
}));

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

    // Helper to safely extract tiers array
    const extractTiers = (r: Rank): Tier[] => {
        let rawTiers: any = r.tiers;
        if (typeof rawTiers === 'string') {
            try { rawTiers = JSON.parse(rawTiers); } catch { rawTiers = []; }
        }
        if (!Array.isArray(rawTiers)) return [];
        return rawTiers.map((t: any) => ({
            ...t,
            minXp: Number(t.minXp ?? t.minxp ?? 0)
        }));
    };

    // Sort ranks by lowest tier minXp
    const sortedRanks = [...activeRanks].sort((a, b) => {
        const tiersA = extractTiers(a);
        const tiersB = extractTiers(b);
        const minA = tiersA.length > 0 ? Math.min(...tiersA.map(t => t.minXp)) : Number(a.minXp ?? (a as any).minxp ?? 0);
        const minB = tiersB.length > 0 ? Math.min(...tiersB.map(t => t.minXp)) : Number(b.minXp ?? (b as any).minxp ?? 0);
        return minA - minB;
    });

    sortedRanks.forEach(rank => {
        const sortedTiers = extractTiers(rank).sort((a, b) => a.minXp - b.minXp);
        const rankBadge = rank.rankBadgeUrl || (rank as any).rankbadgeurl || (rank as any).badge;
        const resolvedRankBadge = resolveRankIcon(rankBadge, rank.name);

        sortedTiers.forEach((tier, index) => {
            const tierIcon = tier.iconUrl || (tier as any).iconurl || rankBadge;
            const resolvedIcon = resolveRankIcon(tierIcon, rank.name, tier.name, rankBadge);
            flat.push({
                ...tier,
                minXp: Number(tier.minXp || 0),
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

    const numericXp = Number(xp) || 0;
    // Filter tiers whose minXp <= xp, pick the one with the highest minXp
    const eligible = allTiers.filter(t => numericXp >= Number(t.minXp || 0));
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
