/**
 * Bosjol Tactical Raffle & Dynamic Ticket Formatting Utilities
 */

export interface DynamicTicketOptions {
    prefix?: string;
    startNumber?: number;
    digits?: number; // e.g. 3 => "001", 2 => "01"
}

export const DYNAMIC_TICKET_PRESETS = [
    { id: 'short_3', label: 'Short Series (#001 - #999)', prefix: '#', digits: 3 },
    { id: 'short_2', label: 'Compact Series (#01 - #99)', prefix: '#', digits: 2 },
    { id: 'alpha_a', label: 'Alpha Squad (#A-01 - #A-99)', prefix: '#A-', digits: 2 },
    { id: 'alpha_b', label: 'Bravo Squad (#B-01 - #B-99)', prefix: '#B-', digits: 2 },
    { id: 'tactical_t', label: 'Tactical (#T-01 - #T-99)', prefix: '#T-', digits: 2 },
    { id: 'lucky_7', label: 'Lucky 7 (#701 - #799)', prefix: '#7', digits: 2 },
    { id: 'custom', label: 'Custom Dynamic Prefix', prefix: '#', digits: 3 }
] as const;

/**
 * Formats any raw or legacy ticket code into a clean, compact, dynamic ticket number.
 * Examples:
 * - "BT-RAF-0042" -> "#042"
 * - "RAF-0007" -> "#007"
 * - "TKT-0012" -> "#012"
 * - "tkt_172948_1_xyz" (with fallbackIdx 5) -> "#006"
 * - "#A-01" -> "#A-01"
 * - "42" -> "#042"
 * - "#777" -> "#777"
 */
export function formatDynamicTicketCode(code: string | undefined | null, fallbackIndex?: number): string {
    if (!code || !code.trim()) {
        if (typeof fallbackIndex === 'number' && fallbackIndex >= 0) {
            return `#${(fallbackIndex + 1).toString().padStart(3, '0')}`;
        }
        return '#001';
    }

    const trimmed = code.trim();

    // If it's already a short dynamic format like #01, #001, #A-01, #B-12, #T-05, #777
    if (/^#[A-Za-z0-9\-_.]+$/i.test(trimmed) && trimmed.length <= 7) {
        return trimmed.toUpperCase();
    }

    // Match patterns like BT-RAF-0042, RAF-0042, TKT-0042, TICKET-0042, BT-0042
    const prefixMatch = trimmed.match(/^(?:BT-RAF-|RAF-|TKT-|TICKET-|BT-|T-)([A-Za-z0-9\-]+)$/i);
    if (prefixMatch && prefixMatch[1]) {
        const rawNum = prefixMatch[1];
        // If numeric like 0042 -> #042
        if (/^\d+$/.test(rawNum)) {
            const num = parseInt(rawNum, 10);
            return `#${num.toString().padStart(3, '0')}`;
        }
        return `#${rawNum.toUpperCase()}`;
    }

    // Check if it's pure digits like "42"
    if (/^\d+$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        return `#${num.toString().padStart(3, '0')}`;
    }

    // Check if it matches an internal ID pattern like tkt_17294829182_3_xyz
    if (trimmed.startsWith('tkt_') || trimmed.length > 10) {
        // Try extracting sequence index if embedded
        const matchDigits = trimmed.match(/_(\d+)_/);
        if (matchDigits && matchDigits[1]) {
            const num = parseInt(matchDigits[1], 10) + 1;
            return `#${num.toString().padStart(3, '0')}`;
        }
        if (typeof fallbackIndex === 'number' && fallbackIndex >= 0) {
            return `#${(fallbackIndex + 1).toString().padStart(3, '0')}`;
        }
        return `#${trimmed.slice(-3).toUpperCase()}`;
    }

    return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
}

/**
 * Generates an array of short, dynamic ticket codes
 */
export function generateDynamicTicketCodes(
    quantity: number,
    options: DynamicTicketOptions = {}
): string[] {
    const prefix = options.prefix ?? '#';
    const startNum = options.startNumber ?? 1;
    const digits = options.digits ?? 3;

    const codes: string[] = [];
    for (let i = 0; i < quantity; i++) {
        const currentNum = startNum + i;
        const padded = currentNum.toString().padStart(digits, '0');
        codes.push(`${prefix}${padded}`);
    }
    return codes;
}
