/**
 * Bosjol Tactical Airsoft - Embedded Vector Rank Badges (Self-Contained SVG Data URIs)
 * Ensures 100% reliability with zero external dependencies, 0 latency, and no broken image links.
 */

function createSvgDataUri(svgString: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const ROOKIE_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="rookie_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
    <linearGradient id="rookie_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="100%" stop-color="#0c0a09" />
    </linearGradient>
    <filter id="rookie_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#d97706" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Base Shield -->
  <polygon points="60,6 106,24 106,72 60,114 14,72 14,24" fill="url(#rookie_bg)" stroke="url(#rookie_metal)" stroke-width="4" filter="url(#rookie_glow)"/>
  <!-- Inner Border -->
  <polygon points="60,14 98,30 98,68 60,104 22,68 22,30" fill="#18181b" stroke="#78350f" stroke-width="1.5"/>
  <!-- Chevron 1 -->
  <path d="M36,44 L60,64 L84,44 L84,54 L60,74 L36,54 Z" fill="url(#rookie_metal)"/>
  <!-- Chevron 2 (Lower) -->
  <path d="M42,60 L60,76 L78,60 L78,68 L60,84 L42,68 Z" fill="#f59e0b"/>
  <!-- Center Star -->
  <polygon points="60,26 63,35 72,35 65,40 68,49 60,44 52,49 55,40 48,35 57,35" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
</svg>
`);

export const VETERAN_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="vet_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="vet_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <filter id="vet_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#38bdf8" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Base Shield -->
  <polygon points="60,6 108,22 108,74 60,114 12,74 12,22" fill="url(#vet_bg)" stroke="url(#vet_metal)" stroke-width="4" filter="url(#vet_glow)"/>
  <!-- Inner Border -->
  <polygon points="60,14 100,28 100,70 60,105 20,70 20,28" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
  <!-- Cross Swords / Wings Accent -->
  <path d="M28,34 L92,34 L60,56 Z" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <!-- Military Double Chevrons -->
  <path d="M32,48 L60,70 L88,48 L88,58 L60,80 L32,58 Z" fill="url(#vet_metal)"/>
  <path d="M38,62 L60,80 L82,62 L82,70 L60,88 L38,70 Z" fill="#38bdf8"/>
  <!-- Center Star -->
  <polygon points="60,22 64,33 75,33 66,39 70,50 60,44 50,50 54,39 45,33 56,33" fill="#f8fafc" stroke="#475569" stroke-width="0.5"/>
</svg>
`);

export const ELITE_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="elite_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="elite_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c4a6e" />
      <stop offset="100%" stop-color="#031f33" />
    </linearGradient>
    <filter id="elite_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0ea5e9" flood-opacity="0.6"/>
    </filter>
  </defs>
  <!-- Diamond Base -->
  <polygon points="60,4 112,42 60,116 8,42" fill="url(#elite_bg)" stroke="url(#elite_metal)" stroke-width="4" filter="url(#elite_glow)"/>
  <!-- Inner Diamond -->
  <polygon points="60,14 102,44 60,105 18,44" fill="#041527" stroke="#0369a1" stroke-width="1.5"/>
  <!-- Elite Wings -->
  <path d="M22,46 Q60,34 98,46 Q60,60 22,46 Z" fill="url(#elite_metal)"/>
  <!-- Triple Chevrons -->
  <path d="M34,56 L60,76 L86,56 L86,64 L60,84 L34,64 Z" fill="#e0f2fe"/>
  <path d="M40,68 L60,84 L80,68 L80,75 L60,91 L40,75 Z" fill="#38bdf8"/>
  <!-- Top Apex Star -->
  <polygon points="60,20 64,30 75,30 67,36 70,46 60,40 50,46 53,36 45,30 56,30" fill="#f0f9ff" stroke="#0284c7" stroke-width="0.5"/>
</svg>
`);

export const PRO_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pro_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#eab308" />
      <stop offset="80%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>
    <linearGradient id="pro_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <filter id="pro_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#eab308" flood-opacity="0.6"/>
    </filter>
  </defs>
  <!-- Octagon Shield -->
  <polygon points="60,4 104,18 116,60 96,108 60,116 24,108 4,60 16,18" fill="url(#pro_bg)" stroke="url(#pro_gold)" stroke-width="4" filter="url(#pro_glow)"/>
  <!-- Inner Border -->
  <polygon points="60,12 98,24 108,60 90,100 60,108 30,100 12,60 22,24" fill="#14120e" stroke="#a16207" stroke-width="1.5"/>
  <!-- Gold Wing Accents -->
  <path d="M22,34 C44,22 76,22 98,34 C76,46 44,46 22,34 Z" fill="url(#pro_gold)"/>
  <!-- Pro Star Core -->
  <polygon points="60,34 66,50 82,50 69,60 74,76 60,66 46,76 51,60 38,50 54,50" fill="url(#pro_gold)" stroke="#78350f" stroke-width="1"/>
  <!-- Tactical Chevron Base -->
  <path d="M38,78 L60,94 L82,78 L82,86 L60,102 L38,86 Z" fill="#fef08a"/>
</svg>
`);

export const MASTER_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
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
    <linearGradient id="master_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a0812" />
      <stop offset="100%" stop-color="#0f0206" />
    </linearGradient>
    <filter id="master_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#f43f5e" flood-opacity="0.7"/>
    </filter>
  </defs>
  <!-- Aggressive Crest -->
  <polygon points="60,2 114,24 104,80 60,118 16,80 6,24" fill="url(#master_bg)" stroke="url(#master_ruby)" stroke-width="4.5" filter="url(#master_glow)"/>
  <!-- Gold Inlay Frame -->
  <polygon points="60,10 106,30 96,76 60,108 24,76 14,30" fill="#150308" stroke="url(#master_gold)" stroke-width="1.5"/>
  <!-- Ruby Crest Wings -->
  <path d="M18,36 Q60,16 102,36 L86,58 Q60,40 34,58 Z" fill="url(#master_ruby)"/>
  <!-- Master Skull / Apex Emblem -->
  <polygon points="60,32 70,52 92,52 74,66 80,88 60,74 40,88 46,66 28,52 50,52" fill="url(#master_gold)" stroke="#881337" stroke-width="1"/>
  <!-- Lower Ruby Crystal -->
  <polygon points="60,78 72,92 60,104 48,92" fill="url(#master_ruby)" stroke="#fff" stroke-width="0.5"/>
</svg>
`);

export const LEGENDARY_BADGE_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
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
    <linearGradient id="leg_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <filter id="leg_glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Apex Mythic Frame -->
  <polygon points="60,0 118,26 98,88 60,120 22,88 2,26" fill="url(#leg_bg)" stroke="url(#leg_mythic)" stroke-width="4.5" filter="url(#leg_glow)"/>
  <!-- Cyan Accent Radiance -->
  <polygon points="60,8 108,30 92,82 60,110 28,82 12,30" fill="#090d16" stroke="url(#leg_cyan)" stroke-width="1.5"/>
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
    veteran: VETERAN_BADGE_SVG,
    elite: ELITE_BADGE_SVG,
    pro: PRO_BADGE_SVG,
    master: MASTER_BADGE_SVG,
    legendary: LEGENDARY_BADGE_SVG,
};

/**
 * Returns a bulletproof SVG Data URI for a given rank or tier.
 * Never fails, never 403s, requires no network.
 */
export function getRankBadgeSvg(nameOrId: string = ''): string {
    const key = nameOrId.toLowerCase();
    if (key.includes('leg')) return LEGENDARY_BADGE_SVG;
    if (key.includes('mast')) return MASTER_BADGE_SVG;
    if (key.includes('pro')) return PRO_BADGE_SVG;
    if (key.includes('eli')) return ELITE_BADGE_SVG;
    if (key.includes('vet')) return VETERAN_BADGE_SVG;
    if (key.includes('rook') || key.includes('recr')) return ROOKIE_BADGE_SVG;
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
    // 1. If a custom tier icon is uploaded and valid (not empty and not the deprecated icons8 domain)
    if (iconUrl && typeof iconUrl === 'string' && iconUrl.trim() !== '' && !iconUrl.includes('icons8.com')) {
        return iconUrl.trim();
    }

    // 2. If the parent rank has an uploaded badge, use that as the tier icon
    if (fallbackRankBadgeUrl && typeof fallbackRankBadgeUrl === 'string' && fallbackRankBadgeUrl.trim() !== '' && !fallbackRankBadgeUrl.includes('icons8.com')) {
        return fallbackRankBadgeUrl.trim();
    }

    // 3. Fallback to vector SVG insignia based on tier/rank name
    return getRankBadgeSvg(tierName || rankNameOrId || 'rookie');
}
