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
