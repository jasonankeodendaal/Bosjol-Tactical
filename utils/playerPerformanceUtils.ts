import type { Player, Badge, LegendaryBadge, PlayerHonor, Rank } from '../types';

export interface PlayerLifetimePerformance {
    // Combat stats
    kills: number;
    deaths: number;
    headshots: number;
    kdr: string;
    kdrNumeric: number;
    headshotAccuracy: string;
    headshotAccuracyNumeric: number;
    matchesPlayed: number;
    killsPerMatch: string;
    deathsPerMatch: string;
    
    // XP & RP Dynamic Breakdown
    baseCombatXp: number;
    xpAdjustmentsTotal: number;
    xpAdjustmentsCount: number;
    badgeRewardsXp: number;
    honorsXp: number;
    totalLifetimeXp: number;
    avgXpPerMatch: number;
    
    // Badges & Commendations
    standardBadgesCount: number;
    legendaryBadgesCount: number;
    totalBadgesEarned: number;
    honorsCount: number;
    motmCount: number;
    motmthCount: number;
    motyrCount: number;
    
    // Tactical Combat Efficiency Rating (0-100 scale)
    combatRating: number;
    combatGrade: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Recruit';
    
    // Sources Breakdown
    breakdown: {
        combatPercent: number;
        badgePercent: number;
        adjustmentsPercent: number;
        honorsPercent: number;
    };
}

/**
 * Calculates live, dynamic summary and lifetime performance metrics for an operator.
 * Accounts for match statistics, badges earned, badges rewarded XP, manual XP adjustments,
 * and official Hall of Fame honors.
 */
export function calculatePlayerPerformance(
    player: Player | null | undefined,
    honorsList?: PlayerHonor[],
    allSystemBadges?: Badge[],
    allSystemLegendaryBadges?: LegendaryBadge[]
): PlayerLifetimePerformance {
    if (!player) {
        return {
            kills: 0,
            deaths: 0,
            headshots: 0,
            kdr: '0.00',
            kdrNumeric: 0,
            headshotAccuracy: '0.0%',
            headshotAccuracyNumeric: 0,
            matchesPlayed: 0,
            killsPerMatch: '0.0',
            deathsPerMatch: '0.0',
            baseCombatXp: 0,
            xpAdjustmentsTotal: 0,
            xpAdjustmentsCount: 0,
            badgeRewardsXp: 0,
            honorsXp: 0,
            totalLifetimeXp: 0,
            avgXpPerMatch: 0,
            standardBadgesCount: 0,
            legendaryBadgesCount: 0,
            totalBadgesEarned: 0,
            honorsCount: 0,
            motmCount: 0,
            motmthCount: 0,
            motyrCount: 0,
            combatRating: 0,
            combatGrade: 'Recruit',
            breakdown: {
                combatPercent: 100,
                badgePercent: 0,
                adjustmentsPercent: 0,
                honorsPercent: 0,
            }
        };
    }

    // 1. Combat & Match Stats from player.stats and matchHistory
    const statsKills = player.stats?.kills ?? 0;
    const statsDeaths = player.stats?.deaths ?? 0;
    const statsHeadshots = player.stats?.headshots ?? 0;
    const statsGames = player.stats?.gamesPlayed ?? 0;

    // Aggregate from match history if available for extra accuracy
    const matchHistory = player.matchHistory || [];
    let histKills = 0;
    let histDeaths = 0;
    let histHeadshots = 0;
    matchHistory.forEach(m => {
        if (m.playerStats) {
            histKills += m.playerStats.kills || 0;
            histDeaths += m.playerStats.deaths || 0;
            histHeadshots += m.playerStats.headshots || 0;
        }
    });

    const kills = Math.max(statsKills, histKills);
    const deaths = Math.max(statsDeaths, histDeaths);
    const headshots = Math.max(statsHeadshots, histHeadshots);
    const matchesPlayed = Math.max(statsGames, matchHistory.length);

    const kdrNumeric = deaths > 0 ? kills / deaths : kills;
    const kdr = kdrNumeric.toFixed(2);

    const headshotAccuracyNumeric = kills > 0 ? Math.min(100, (headshots / kills) * 100) : 0;
    const headshotAccuracy = `${headshotAccuracyNumeric.toFixed(1)}%`;

    const killsPerMatch = matchesPlayed > 0 ? (kills / matchesPlayed).toFixed(1) : kills.toFixed(1);
    const deathsPerMatch = matchesPlayed > 0 ? (deaths / matchesPlayed).toFixed(1) : deaths.toFixed(1);

    // 2. Badges Earned & Rewarded
    const standardBadges = player.badges || [];
    const legendaryBadges = player.legendaryBadges || [];
    const standardBadgesCount = standardBadges.length;
    const legendaryBadgesCount = legendaryBadges.length;
    const totalBadgesEarned = standardBadgesCount + legendaryBadgesCount;

    // Badge XP Rewards:
    // Standard Badges grant 75 XP each (or custom criteria XP if defined)
    // Legendary Badges grant 250 XP each
    const standardBadgeXp = standardBadges.reduce((sum, b) => {
        const critValue = typeof b.criteria?.value === 'number' ? b.criteria.value : 0;
        // Standard baseline reward is 75 XP per badge
        return sum + Math.max(75, critValue > 0 && critValue <= 500 ? critValue : 75);
    }, 0);

    const legendaryBadgeXp = legendaryBadgesCount * 250;
    const badgeRewardsXp = standardBadgeXp + legendaryBadgeXp;

    // 3. Official Hall of Fame Honors
    const playerHonors = (honorsList || []).filter(h => h.playerId === player.id);
    let motmCount = 0;
    let motmthCount = 0;
    let motyrCount = 0;
    let honorsXp = 0;

    playerHonors.forEach(h => {
        const typeNorm = (h.type || '').toLowerCase();
        if (typeNorm.includes('year') || typeNorm === 'man_of_the_year') {
            motyrCount += 1;
            honorsXp += 1000;
        } else if (typeNorm.includes('month') || typeNorm === 'man_of_the_month') {
            motmthCount += 1;
            honorsXp += 350;
        } else {
            motmCount += 1;
            honorsXp += 150;
        }
    });
    const honorsCount = playerHonors.length;

    // 4. Manual XP Adjustments
    const xpAdjustments = player.xpAdjustments || [];
    const xpAdjustmentsCount = xpAdjustments.length;
    const xpAdjustmentsTotal = xpAdjustments.reduce((acc, adj) => acc + (Number(adj.amount) || 0), 0);

    // 5. Total Rank Points (RP / XP)
    // Total XP in stats is the recorded rank points
    const rawStatsXp = player.stats?.xp ?? 0;
    const totalLifetimeXp = Math.max(0, rawStatsXp);
    const baseCombatXp = Math.max(0, totalLifetimeXp - Math.max(0, xpAdjustmentsTotal));

    const avgXpPerMatch = matchesPlayed > 0 ? Math.round(totalLifetimeXp / matchesPlayed) : totalLifetimeXp;

    // 6. Tactical Combat Rating calculation (0-100)
    // Combines K/D (35%), Accuracy (25%), Badges & Honors (25%), and XP Velocity (15%)
    const kdrScore = Math.min(40, (kdrNumeric / 2.5) * 40);
    const accuracyScore = Math.min(25, (headshotAccuracyNumeric / 40) * 25);
    const badgeScore = Math.min(25, (totalBadgesEarned * 3) + (honorsCount * 5));
    const xpVelocityScore = Math.min(10, (avgXpPerMatch / 300) * 10);

    const combatRating = Math.min(100, Math.max(10, Math.round(kdrScore + accuracyScore + badgeScore + xpVelocityScore)));

    let combatGrade: PlayerLifetimePerformance['combatGrade'] = 'Recruit';
    if (combatRating >= 95) combatGrade = 'S+';
    else if (combatRating >= 88) combatGrade = 'S';
    else if (combatRating >= 80) combatGrade = 'A+';
    else if (combatRating >= 70) combatGrade = 'A';
    else if (combatRating >= 55) combatGrade = 'B+';
    else if (combatRating >= 40) combatGrade = 'B';
    else if (combatRating >= 25) combatGrade = 'C';

    // 7. Breakdown percentages
    const totalXpSources = Math.max(1, baseCombatXp + Math.max(0, xpAdjustmentsTotal) + badgeRewardsXp + honorsXp);
    const combatPercent = Math.round((baseCombatXp / totalXpSources) * 100);
    const badgePercent = Math.round((badgeRewardsXp / totalXpSources) * 100);
    const adjustmentsPercent = Math.round((Math.max(0, xpAdjustmentsTotal) / totalXpSources) * 100);
    const honorsPercent = Math.max(0, 100 - (combatPercent + badgePercent + adjustmentsPercent));

    return {
        kills,
        deaths,
        headshots,
        kdr,
        kdrNumeric,
        headshotAccuracy,
        headshotAccuracyNumeric,
        matchesPlayed,
        killsPerMatch,
        deathsPerMatch,
        baseCombatXp,
        xpAdjustmentsTotal,
        xpAdjustmentsCount,
        badgeRewardsXp,
        honorsXp,
        totalLifetimeXp,
        avgXpPerMatch,
        standardBadgesCount,
        legendaryBadgesCount,
        totalBadgesEarned,
        honorsCount,
        motmCount,
        motmthCount,
        motyrCount,
        combatRating,
        combatGrade,
        breakdown: {
            combatPercent,
            badgePercent,
            adjustmentsPercent,
            honorsPercent,
        }
    };
}
