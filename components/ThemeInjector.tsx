import React, { useEffect } from 'react';
import type { CompanyDetails } from '../types';

interface ThemeInjectorProps {
    themeColors?: CompanyDetails['themeColors'];
}

export const THEME_PRESETS = [
    {
        id: 'red-alert',
        name: 'Red Alert Tactical',
        colors: {
            primary: '#dc2626',
            primaryHover: '#ef4444',
            secondary: '#f59e0b',
            darkBg: '#0a0a0a',
            cardBg: '#18181b',
            textHighlight: '#f87171',
            borderGlow: '#7f1d1d',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'cyber-emerald',
        name: 'Cyber Emerald Ops',
        colors: {
            primary: '#059669',
            primaryHover: '#10b981',
            secondary: '#34d399',
            darkBg: '#022c22',
            cardBg: '#064e3b',
            textHighlight: '#6ee7b7',
            borderGlow: '#047857',
            gradientStyle: 'neon-pulse' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'midnight-cobalt',
        name: 'Midnight Cobalt Navy',
        colors: {
            primary: '#2563eb',
            primaryHover: '#3b82f6',
            secondary: '#38bdf8',
            darkBg: '#090d16',
            cardBg: '#111827',
            textHighlight: '#60a5fa',
            borderGlow: '#1d4ed8',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'heavy' as const,
            borderRadius: 'rounded' as const,
        }
    },
    {
        id: 'neon-amber',
        name: 'Neon Amber Hazmat',
        colors: {
            primary: '#d97706',
            primaryHover: '#f59e0b',
            secondary: '#fbbf24',
            darkBg: '#120c02',
            cardBg: '#1c1917',
            textHighlight: '#fcd34d',
            borderGlow: '#b45309',
            gradientStyle: 'neon-pulse' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'obsidian-violet',
        name: 'Night Stalker Violet',
        colors: {
            primary: '#7c3aed',
            primaryHover: '#8b5cf6',
            secondary: '#c084fc',
            darkBg: '#0f0914',
            cardBg: '#1e1b4b',
            textHighlight: '#a78bfa',
            borderGlow: '#6d28d9',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'heavy' as const,
            borderRadius: 'rounded' as const,
        }
    },
    {
        id: 'stealth-silver',
        name: 'Stealth Recon Silver',
        colors: {
            primary: '#52525b',
            primaryHover: '#71717a',
            secondary: '#a1a1aa',
            darkBg: '#09090b',
            cardBg: '#18181b',
            textHighlight: '#e4e4e7',
            borderGlow: '#3f3f46',
            gradientStyle: 'solid' as const,
            glassOpacity: 'off' as const,
            borderRadius: 'sharp' as const,
        }
    },
    {
        id: 'blood-crimson',
        name: 'Blood Crimson Fury',
        colors: {
            primary: '#991b1b',
            primaryHover: '#b91c1c',
            secondary: '#fca5a5',
            darkBg: '#140404',
            cardBg: '#270a0a',
            textHighlight: '#f87171',
            borderGlow: '#7f1d1d',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'desert-strike',
        name: 'Desert Strike Arid',
        colors: {
            primary: '#b45309',
            primaryHover: '#d97706',
            secondary: '#f59e0b',
            darkBg: '#140f09',
            cardBg: '#241b11',
            textHighlight: '#fde047',
            borderGlow: '#78350f',
            gradientStyle: 'solid' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'sharp' as const,
        }
    },
    {
        id: 'marine-green',
        name: 'Marine Green Ops',
        colors: {
            primary: '#15803d',
            primaryHover: '#16a34a',
            secondary: '#84cc16',
            darkBg: '#09150b',
            cardBg: '#122616',
            textHighlight: '#4ade80',
            borderGlow: '#14532d',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'marine-camo-pattern',
        name: 'Marine Camo Pattern',
        colors: {
            primary: '#2d6a4f',
            primaryHover: '#40916c',
            secondary: '#74c69d',
            darkBg: '#081c15',
            cardBg: '#1b4332',
            textHighlight: '#95d5b2',
            borderGlow: '#1b4332',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'marine-olive-drab',
        name: 'Marine Olive Pattern',
        colors: {
            primary: '#4d5d36',
            primaryHover: '#607344',
            secondary: '#a3b18a',
            darkBg: '#11170d',
            cardBg: '#1f2918',
            textHighlight: '#dad7cd',
            borderGlow: '#3a4a28',
            gradientStyle: 'solid' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'sharp' as const,
        }
    },
    {
        id: 'deep-sea-marine',
        name: 'Deep Sea Marine Teal',
        colors: {
            primary: '#0e7490',
            primaryHover: '#06b6d4',
            secondary: '#38bdf8',
            darkBg: '#04151f',
            cardBg: '#0b2536',
            textHighlight: '#67e8f9',
            borderGlow: '#155e75',
            gradientStyle: 'neon-pulse' as const,
            glassOpacity: 'heavy' as const,
            borderRadius: 'rounded' as const,
        }
    },
    {
        id: 'slate-gunmetal',
        name: 'Gunmetal Slate Grey',
        colors: {
            primary: '#475569',
            primaryHover: '#64748b',
            secondary: '#cbd5e1',
            darkBg: '#0f172a',
            cardBg: '#1e293b',
            textHighlight: '#94a3b8',
            borderGlow: '#334155',
            gradientStyle: 'solid' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'sharp' as const,
        }
    },
    {
        id: 'titanium-ash',
        name: 'Titanium Ash Grey',
        colors: {
            primary: '#3f3f46',
            primaryHover: '#52525b',
            secondary: '#d4d4d8',
            darkBg: '#09090b',
            cardBg: '#18181b',
            textHighlight: '#a1a1aa',
            borderGlow: '#27272a',
            gradientStyle: 'solid' as const,
            glassOpacity: 'off' as const,
            borderRadius: 'sharp' as const,
        }
    },
    {
        id: 'phantom-graphite',
        name: 'Phantom Graphite Grey',
        colors: {
            primary: '#334155',
            primaryHover: '#475569',
            secondary: '#94a3b8',
            darkBg: '#020617',
            cardBg: '#0f172a',
            textHighlight: '#cbd5e1',
            borderGlow: '#1e293b',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'heavy' as const,
            borderRadius: 'rounded' as const,
        }
    },
    {
        id: 'urban-charcoal-grey',
        name: 'Urban Charcoal Grey',
        colors: {
            primary: '#52525b',
            primaryHover: '#71717a',
            secondary: '#e4e4e7',
            darkBg: '#121215',
            cardBg: '#202024',
            textHighlight: '#f4f4f5',
            borderGlow: '#3f3f46',
            gradientStyle: 'solid' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'arctic-frost',
        name: 'Arctic Frost Recon',
        colors: {
            primary: '#0284c7',
            primaryHover: '#0369a1',
            secondary: '#38bdf8',
            darkBg: '#03111d',
            cardBg: '#072136',
            textHighlight: '#bae6fd',
            borderGlow: '#075985',
            gradientStyle: 'linear-glow' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    },
    {
        id: 'rust-oxide',
        name: 'Rust Oxide Tactical',
        colors: {
            primary: '#c2410c',
            primaryHover: '#ea580c',
            secondary: '#fdba74',
            darkBg: '#180a04',
            cardBg: '#2e1207',
            textHighlight: '#ffedd5',
            borderGlow: '#9a3412',
            gradientStyle: 'solid' as const,
            glassOpacity: 'subtle' as const,
            borderRadius: 'standard' as const,
        }
    }
];

export const ThemeInjector: React.FC<ThemeInjectorProps> = ({ themeColors }) => {
    useEffect(() => {
        const primary = themeColors?.primary || '#dc2626';
        const primaryHover = themeColors?.primaryHover || '#ef4444';
        const secondary = themeColors?.secondary || '#f59e0b';
        const darkBg = themeColors?.darkBg || '#0a0a0a';
        const cardBg = themeColors?.cardBg || '#18181b';
        const textHighlight = themeColors?.textHighlight || '#f87171';
        const borderGlow = themeColors?.borderGlow || '#7f1d1d';

        const root = document.documentElement;
        root.style.setProperty('--color-primary', primary);
        root.style.setProperty('--color-primary-hover', primaryHover);
        root.style.setProperty('--color-secondary', secondary);
        root.style.setProperty('--color-dark-bg', darkBg);
        root.style.setProperty('--color-card-bg', cardBg);
        root.style.setProperty('--color-text-highlight', textHighlight);
        root.style.setProperty('--color-border-glow', borderGlow);

        if (themeColors?.darkBg) {
            document.body.style.backgroundColor = themeColors.darkBg;
        } else {
            document.body.style.backgroundColor = '#0A0A0A';
        }

        // Inject dynamic style tag for theme overrides
        let styleTag = document.getElementById('theme-dynamic-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'theme-dynamic-styles';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
            :root {
                --color-primary: ${primary};
                --color-primary-hover: ${primaryHover};
                --color-secondary: ${secondary};
                --color-dark-bg: ${darkBg};
                --color-card-bg: ${cardBg};
                --color-text-highlight: ${textHighlight};
                --color-border-glow: ${borderGlow};
            }

            /* Main Background Canvas & Cards */
            body, .bg-zinc-950 {
                background-color: ${darkBg} !important;
            }
            .bg-zinc-900, .bg-zinc-900\\/90, .bg-zinc-900\\/80, .bg-zinc-900\\/70, .bg-zinc-900\\/60, .bg-zinc-900\\/50, .bg-zinc-900\\/40 {
                background-color: ${cardBg} !important;
            }

            /* Primary Accent Backgrounds & Buttons */
            .bg-red-600, .bg-red-500, .bg-red-700, .bg-red-800, .bg-red-900 {
                background-color: ${primary} !important;
            }
            .bg-red-500\\/10, .bg-red-600\\/10, .bg-red-500\\/20, .bg-red-600\\/20 {
                background-color: ${primary}25 !important;
            }
            .hover\\:bg-red-500:hover, .hover\\:bg-red-600:hover, .hover\\:bg-red-700:hover {
                background-color: ${primaryHover} !important;
            }

            /* Borders & Glows */
            .border-red-500, .border-red-600, .border-red-400, .border-red-700, .border-red-800, .border-red-900 {
                border-color: ${primary} !important;
            }
            .border-red-500\\/20, .border-red-500\\/30, .border-red-500\\/40, .border-red-500\\/50, .border-red-800\\/80, .border-red-900\\/50 {
                border-color: ${borderGlow}90 !important;
            }
            .hover\\:border-red-500:hover, .hover\\:border-red-600:hover {
                border-color: ${primaryHover} !important;
            }

            /* Text Highlights */
            .text-red-400, .text-red-500, .text-red-300, .text-red-200, .text-red-600 {
                color: ${textHighlight} !important;
            }
            .hover\\:text-red-400:hover, .hover\\:text-red-300:hover, .hover\\:text-red-500:hover {
                color: ${textHighlight} !important;
            }

            /* Secondary / Badge Highlights */
            .text-amber-400, .text-amber-500, .text-amber-300 {
                color: ${secondary} !important;
            }
            .border-amber-500, .border-amber-600, .border-amber-500\\/30, .border-amber-500\\/50 {
                border-color: ${secondary} !important;
            }
            .bg-amber-500, .bg-amber-600 {
                background-color: ${secondary} !important;
            }

            /* Shadows & Focus Ring Effects */
            .shadow-red-900\\/50, .shadow-red-500\\/20, .shadow-red-600\\/30 {
                box-shadow: 0 4px 14px 0 ${borderGlow}90 !important;
            }
            .focus\\:ring-red-500:focus, .focus\\:border-red-500:focus, .ring-red-500 {
                --tw-ring-color: ${primary} !important;
                border-color: ${primary} !important;
            }
        `;
    }, [themeColors]);

    return null;
};

