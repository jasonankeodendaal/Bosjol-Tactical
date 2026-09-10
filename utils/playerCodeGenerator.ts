import type { Player } from '../types';

/**
 * Generates a clean, unique alphanumeric player code (e.g., BM01, DD01, ES01).
 * Uses player name, surname, or callsign initials combined with the next available sequential number.
 */
export function generateUniquePlayerCode(player: Partial<Player>, existingPlayers: Player[] = []): string {
    const namePart = (player.name || '').trim();
    const surnamePart = (player.surname || '').trim();
    const callsignPart = (player.callsign || '').trim();
    
    let prefix = '';
    if (namePart && surnamePart) {
        prefix = (namePart.charAt(0) + surnamePart.charAt(0)).toUpperCase();
    } else if (namePart && callsignPart && callsignPart.toLowerCase() !== namePart.toLowerCase()) {
        prefix = (namePart.charAt(0) + callsignPart.charAt(0)).toUpperCase();
    } else if (namePart.length >= 2) {
        prefix = namePart.substring(0, 2).toUpperCase();
    } else if (callsignPart.length >= 2) {
        prefix = callsignPart.substring(0, 2).toUpperCase();
    } else if (namePart.length === 1) {
        prefix = (namePart + 'X').toUpperCase();
    } else {
        prefix = 'OP';
    }

    // Ensure prefix is clean uppercase alphanumeric characters
    prefix = prefix.replace(/[^A-Z0-9]/g, '') || 'OP';
    if (prefix.length < 2) {
        prefix = (prefix + 'X').slice(0, 2);
    }

    const takenCodes = new Set(
        existingPlayers
            .map(p => (p.playerCode || '').trim().toUpperCase())
            .filter(c => Boolean(c) && c !== 'NO-CODE')
    );

    let num = 1;
    let candidate = `${prefix}${String(num).padStart(2, '0')}`;
    while (takenCodes.has(candidate)) {
        num++;
        candidate = `${prefix}${String(num).padStart(2, '0')}`;
    }
    return candidate;
}

/**
 * Deterministically creates a 4-character login player code from name and surname (e.g. JD01),
 * guaranteeing a player NEVER has "NO-CODE" displayed.
 */
export function generatePlayerCodeFromName(name?: string, surname?: string, id?: string): string {
    const namePart = (name || '').trim();
    const surnamePart = (surname || '').trim();
    let prefix = '';
    if (namePart && surnamePart) {
        prefix = (namePart.charAt(0) + surnamePart.charAt(0)).toUpperCase();
    } else if (namePart.length >= 2) {
        prefix = namePart.substring(0, 2).toUpperCase();
    } else if (namePart.length === 1) {
        prefix = (namePart + 'X').toUpperCase();
    } else {
        prefix = 'OP';
    }
    prefix = prefix.replace(/[^A-Z0-9]/g, '') || 'OP';
    if (prefix.length < 2) {
        prefix = (prefix + 'X').slice(0, 2);
    }
    
    let numStr = '01';
    if (id) {
        const matches = id.match(/\d+/g);
        if (matches && matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const parsed = parseInt(lastMatch.slice(-3), 10);
            if (!isNaN(parsed) && parsed > 0) {
                const modNum = (parsed % 99) || 1;
                numStr = String(modNum).padStart(2, '0');
            }
        }
    }
    return `${prefix}${numStr}`;
}

/**
 * Generates a secure random 6-digit numeric PIN for player login (e.g. 583921).
 */
export function generateRandom6DigitPin(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

