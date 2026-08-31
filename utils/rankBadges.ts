/**
 * Bosjol Tactical Airsoft - Embedded Vector Rank Badges (Self-Contained SVG Data URIs)
 * 100% Transparent vector insignias with zero opaque container boxes or background fills.
 */

function createSvgDataUri(svgString: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const ROOKIE_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="rookie_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <filter id="rookie_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#d97706" flood-opacity="0.6"/>
    </filter>
  </defs>
  <!-- Base Shield Metallic Outline (Transparent Center) -->
  <polygon points="60,6 106,24 106,72 60,114 14,72 14,24" fill="none" stroke="url(#rookie_metal)" stroke-width="4" filter="url(#rookie_glow)"/>
  <!-- Inner Border Accent -->
  <polygon points="60,14 98,30 98,68 60,104 22,68 22,30" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="6 3"/>
  <!-- Chevron 1 -->
  <path d="M36,44 L60,64 L84,44 L84,54 L60,74 L36,54 Z" fill="url(#rookie_metal)"/>
  <!-- Chevron 2 (Lower) -->
  <path d="M42,60 L60,76 L78,60 L78,68 L60,84 L42,68 Z" fill="#fbbf24"/>
  <!-- Center Star -->
  <polygon points="60,24 63,33 72,33 65,38 68,47 60,42 52,47 55,38 48,33 57,33" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
</svg>
`);

export const ROOKIE_2_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="rookie2_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="rookie2_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#f59e0b" flood-opacity="0.7"/>
    </filter>
  </defs>
  <!-- Shield Outline -->
  <polygon points="60,6 106,24 106,72 60,114 14,72 14,24" fill="none" stroke="url(#rookie2_metal)" stroke-width="4.5" filter="url(#rookie2_glow)"/>
  <!-- Dual Inner Borders -->
  <polygon points="60,14 98,30 98,68 60,104 22,68 22,30" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
  <!-- 2 Chevrons -->
  <path d="M34,42 L60,62 L86,42 L86,52 L60,72 L34,52 Z" fill="url(#rookie2_metal)"/>
  <path d="M40,58 L60,74 L80,58 L80,66 L60,82 L40,66 Z" fill="#fbbf24"/>
  <!-- 2 Stars -->
  <polygon points="50,25 52,32 59,32 54,36 56,43 50,39 44,43 46,36 41,32 48,32" fill="#fde68a"/>
  <polygon points="70,25 72,32 79,32 74,36 76,43 70,39 64,43 66,36 61,32 68,32" fill="#fde68a"/>
</svg>
`);

export const ROOKIE_3_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="rookie3_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <filter id="rookie3_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#f59e0b" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Shield Outline -->
  <polygon points="60,6 106,24 106,72 60,114 14,72 14,24" fill="none" stroke="url(#rookie3_metal)" stroke-width="5" filter="url(#rookie3_glow)"/>
  <polygon points="60,14 98,30 98,68 60,104 22,68 22,30" fill="none" stroke="#fef3c7" stroke-width="1.5"/>
  <!-- 3 Chevrons -->
  <path d="M34,42 L60,62 L86,42 L86,50 L60,70 L34,50 Z" fill="url(#rookie3_metal)"/>
  <path d="M38,54 L60,71 L82,54 L82,62 L60,79 L38,62 Z" fill="#fbbf24"/>
  <path d="M42,66 L60,80 L78,66 L78,73 L60,87 L42,73 Z" fill="#fef3c7"/>
  <!-- 3 Stars -->
  <polygon points="60,20 62,26 68,26 63,30 65,36 60,32 55,36 57,30 52,26 58,26" fill="#fef3c7"/>
  <polygon points="42,25 44,30 49,30 45,33 47,38 42,35 37,38 39,33 35,30 40,30" fill="#fef3c7"/>
  <polygon points="78,25 80,30 85,30 81,33 83,38 78,35 73,38 75,33 71,30 76,30" fill="#fef3c7"/>
</svg>
`);

export const VETERAN_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="vet_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <filter id="vet_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#38bdf8" flood-opacity="0.6"/>
    </filter>
  </defs>
  <!-- Shield Outline -->
  <polygon points="60,6 108,22 108,74 60,114 12,74 12,22" fill="none" stroke="url(#vet_metal)" stroke-width="4.5" filter="url(#vet_glow)"/>
  <polygon points="60,14 100,28 100,70 60,105 20,70 20,28" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
  <!-- Cross Swords / Wings Accent -->
  <path d="M28,34 L92,34 L60,56 Z" fill="none" stroke="url(#vet_metal)" stroke-width="1.5"/>
  <!-- Military Double Chevrons -->
  <path d="M32,48 L60,70 L88,48 L88,58 L60,80 L32,58 Z" fill="url(#vet_metal)"/>
  <path d="M38,62 L60,80 L82,62 L82,70 L60,88 L38,70 Z" fill="#38bdf8"/>
  <!-- Center Star -->
  <polygon points="60,20 64,31 75,31 66,37 70,48 60,42 50,48 54,37 45,31 56,31" fill="#f8fafc" stroke="#0284c7" stroke-width="0.5"/>
</svg>
`);

export const ELITE_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="elite_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="40%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <filter id="elite_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0ea5e9" flood-opacity="0.7"/>
    </filter>
  </defs>
  <!-- Diamond Base Outline -->
  <polygon points="60,4 112,42 60,116 8,42" fill="none" stroke="url(#elite_metal)" stroke-width="4.5" filter="url(#elite_glow)"/>
  <!-- Inner Diamond -->
  <polygon points="60,14 102,44 60,105 18,44" fill="none" stroke="#bae6fd" stroke-width="1.5"/>
  <!-- Elite Wings -->
  <path d="M22,46 Q60,34 98,46 Q60,60 22,46 Z" fill="url(#elite_metal)"/>
  <!-- Triple Chevrons -->
  <path d="M34,56 L60,76 L86,56 L86,64 L60,84 L34,64 Z" fill="#e0f2fe"/>
  <path d="M40,68 L60,84 L80,68 L80,75 L60,91 L40,75 Z" fill="#38bdf8"/>
  <!-- Top Apex Star -->
  <polygon points="60,18 64,28 75,28 67,34 70,44 60,38 50,44 53,34 45,28 56,28" fill="#f0f9ff" stroke="#0284c7" stroke-width="0.5"/>
</svg>
`);

export const PRO_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="pro_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#eab308" />
      <stop offset="80%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>
    <filter id="pro_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#eab308" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Octagon Shield Outline -->
  <polygon points="60,4 104,18 116,60 96,108 60,116 24,108 4,60 16,18" fill="none" stroke="url(#pro_gold)" stroke-width="4.5" filter="url(#pro_glow)"/>
  <!-- Inner Border -->
  <polygon points="60,12 98,24 108,60 90,100 60,108 30,100 12,60 22,24" fill="none" stroke="#fef08a" stroke-width="1.5"/>
  <!-- Gold Wing Accents -->
  <path d="M22,34 C44,22 76,22 98,34 C76,46 44,46 22,34 Z" fill="url(#pro_gold)"/>
  <!-- Pro Star Core -->
  <polygon points="60,34 66,50 82,50 69,60 74,76 60,66 46,76 51,60 38,50 54,50" fill="url(#pro_gold)" stroke="#78350f" stroke-width="1"/>
  <!-- Tactical Chevron Base -->
  <path d="M38,78 L60,94 L82,78 L82,86 L60,102 L38,86 Z" fill="#fef08a"/>
</svg>
`);

export const MASTER_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="master_ruby" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fda4af" />
      <stop offset="40%" stop-color="#f43f5e" />
      <stop offset="80%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#881337" />
    </linearGradient>
    <linearGradient id="master_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <filter id="master_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#f43f5e" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Aggressive Crest Outline -->
  <polygon points="60,2 114,24 104,80 60,118 16,80 6,24" fill="none" stroke="url(#master_ruby)" stroke-width="5" filter="url(#master_glow)"/>
  <!-- Gold Inlay Frame -->
  <polygon points="60,10 106,30 96,76 60,108 24,76 14,30" fill="none" stroke="url(#master_gold)" stroke-width="1.5"/>
  <!-- Ruby Crest Wings -->
  <path d="M18,36 Q60,16 102,36 L86,58 Q60,40 34,58 Z" fill="url(#master_ruby)"/>
  <!-- Master Star Emblem -->
  <polygon points="60,32 70,52 92,52 74,66 80,88 60,74 40,88 46,66 28,52 50,52" fill="url(#master_gold)" stroke="#881337" stroke-width="1"/>
  <!-- Lower Ruby Crystal -->
  <polygon points="60,78 72,92 60,104 48,92" fill="url(#master_ruby)" stroke="#fff" stroke-width="0.5"/>
</svg>
`);

export const GRANDMASTER_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="gm_purple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d0fe" />
      <stop offset="30%" stop-color="#c084fc" />
      <stop offset="70%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#581c87" />
    </linearGradient>
    <linearGradient id="gm_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="gm_glow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#c084fc" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Grandmaster Outer Crown Crest -->
  <polygon points="60,2 116,22 102,86 60,120 18,86 4,22" fill="none" stroke="url(#gm_purple)" stroke-width="5" filter="url(#gm_glow)"/>
  <polygon points="60,10 108,28 96,80 60,110 24,80 12,28" fill="none" stroke="url(#gm_gold)" stroke-width="1.8"/>
  <!-- Grandmaster Royal Wings -->
  <path d="M14,32 Q60,12 106,32 L90,56 Q60,34 30,56 Z" fill="url(#gm_purple)"/>
  <!-- Grandmaster 8-Point Star Core -->
  <polygon points="60,28 66,44 82,44 70,54 75,70 60,60 45,70 50,54 38,44 54,44" fill="url(#gm_gold)" stroke="#581c87" stroke-width="1"/>
  <!-- Central Diamond Crystal -->
  <polygon points="60,54 72,68 60,84 48,68" fill="url(#gm_purple)" stroke="#fff" stroke-width="1"/>
  <!-- Lower Dual Chevrons -->
  <path d="M40,82 L60,98 L80,82 L80,89 L60,105 L40,89 Z" fill="url(#gm_gold)"/>
</svg>
`);

export const LEGENDARY_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="leg_mythic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="25%" stop-color="#fde047" />
      <stop offset="60%" stop-color="#f59e0b" />
      <stop offset="85%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#7c2d12" />
    </linearGradient>
    <linearGradient id="leg_cyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="leg_glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.9"/>
    </filter>
  </defs>
  <!-- Apex Mythic Frame Outline -->
  <polygon points="60,0 118,26 98,88 60,120 22,88 2,26" fill="none" stroke="url(#leg_mythic)" stroke-width="5" filter="url(#leg_glow)"/>
  <!-- Cyan Accent Radiance Frame -->
  <polygon points="60,8 108,30 92,82 60,110 28,82 12,30" fill="none" stroke="url(#leg_cyan)" stroke-width="1.8"/>
  <!-- Mythic Wings -->
  <path d="M10,32 Q60,6 110,32 L94,56 Q60,34 26,56 Z" fill="url(#leg_mythic)"/>
  <!-- Apex Grand Star / Crown -->
  <polygon points="60,22 66,40 86,40 70,52 76,72 60,60 44,72 50,52 34,40 54,40" fill="url(#leg_mythic)" stroke="#ca8a04" stroke-width="1"/>
  <!-- Diamond Core -->
  <polygon points="60,56 74,74 60,96 46,74" fill="url(#leg_cyan)" stroke="#fff" stroke-width="1"/>
  <!-- Mini Stars -->
  <polygon points="36,78 38,84 44,84 39,88 41,94 36,90 31,94 33,88 28,84 34,84" fill="#fde047"/>
  <polygon points="84,78 86,84 92,84 87,88 89,94 84,90 79,94 81,88 76,84 82,84" fill="#fde047"/>
</svg>
`);

export const RANK_SVG_MAP: Record<string, string> = {
    rookie: ROOKIE_BADGE_SVG,
    rookie_1: ROOKIE_BADGE_SVG,
    rookie_2: ROOKIE_2_BADGE_SVG,
    rookie_3: ROOKIE_3_BADGE_SVG,
    veteran: VETERAN_BADGE_SVG,
    elite: ELITE_BADGE_SVG,
    pro: PRO_BADGE_SVG,
    master: MASTER_BADGE_SVG,
    grandmaster: GRANDMASTER_BADGE_SVG,
    legendary: LEGENDARY_BADGE_SVG,
};

/**
 * Returns a bulletproof SVG Data URI for a given rank or tier.
 * Never fails, 100% transparent vector background.
 */
export function getRankBadgeSvg(nameOrId: string = ''): string {
    const key = nameOrId.toLowerCase();
    if (key.includes('leg') || key.includes('apex') || key.includes('myth')) return LEGENDARY_BADGE_SVG;
    if (key.includes('grand')) return GRANDMASTER_BADGE_SVG;
    if (key.includes('mast')) return MASTER_BADGE_SVG;
    if (key.includes('pro')) return PRO_BADGE_SVG;
    if (key.includes('eli')) return ELITE_BADGE_SVG;
    if (key.includes('vet')) return VETERAN_BADGE_SVG;
    if (key.includes('rookie iii') || key.includes('rookie 3') || key.includes('rookie_3')) return ROOKIE_3_BADGE_SVG;
    if (key.includes('rookie ii') || key.includes('rookie 2') || key.includes('rookie_2')) return ROOKIE_2_BADGE_SVG;
    if (key.includes('rook') || key.includes('recr') || key.includes('train')) return ROOKIE_BADGE_SVG;
    return ROOKIE_BADGE_SVG;
}

/**
 * Resolves a safe rank icon URL.
 * Prioritizes user-uploaded images (data URIs, Supabase/Cloudinary URLs, etc.).
 * Inherits the parent rank badge if the sub-tier icon was not explicitly uploaded.
 * Falls back to crisp embedded SVGs only if neither is provided or if legacy broken URLs are detected.
 */
export function resolveRankIcon(
    iconUrl?: string, 
    rankNameOrId?: string, 
    tierName?: string,
    fallbackRankBadgeUrl?: string
): string {
    const isDefaultSvg = (url?: string) => {
        if (!url || typeof url !== 'string') return false;
        return url.startsWith('data:image/svg+xml') || url.includes('<svg') || url.includes('%3Csvg');
    };

    // 1. If a custom tier icon is uploaded and valid (not default SVG, and not empty, and not the deprecated icons8 domain)
    if (iconUrl && typeof iconUrl === 'string' && iconUrl.trim() !== '') {
        const trimmed = iconUrl.trim();
        if (!trimmed.includes('icons8.com') && !isDefaultSvg(trimmed)) {
            return trimmed;
        }
    }

    // 2. If the parent rank has an uploaded custom badge, prioritize using that over any default tier SVG
    if (fallbackRankBadgeUrl && typeof fallbackRankBadgeUrl === 'string' && fallbackRankBadgeUrl.trim() !== '') {
        const trimmedFallback = fallbackRankBadgeUrl.trim();
        if (!trimmedFallback.includes('icons8.com') && !isDefaultSvg(trimmedFallback)) {
            return trimmedFallback;
        }
    }

    // 3. Fallback: If neither is a custom uploaded asset, but we have a non-icons8 iconUrl, use that
    if (iconUrl && typeof iconUrl === 'string' && iconUrl.trim() !== '' && !iconUrl.includes('icons8.com')) {
        return iconUrl.trim();
    }

    // 4. Fallback: parent rank badge if available and non-icons8
    if (fallbackRankBadgeUrl && typeof fallbackRankBadgeUrl === 'string' && fallbackRankBadgeUrl.trim() !== '' && !fallbackRankBadgeUrl.includes('icons8.com')) {
        return fallbackRankBadgeUrl.trim();
    }

    // 5. Hard fallback to vector SVG insignia based on tier/rank name
    return getRankBadgeSvg(tierName || rankNameOrId || 'rookie');
}

