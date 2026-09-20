import type { GameEvent, EventCore } from '../types';

/**
 * Checks if event unjoining / withdrawal is locked (within 48 hours of event start, or completed/cancelled).
 * 
 * @param event GameEvent or EventCore object
 * @param lockHours Hours before event start when unjoining becomes locked (default: 48)
 * @returns boolean true if unjoining is locked
 */
export function isUnjoinLocked(event?: GameEvent | EventCore | null, lockHours: number = 48): boolean {
    if (!event) return false;
    if (!event.date) return false;

    // Completed or Cancelled events are always locked for unjoining
    if (event.status === 'Completed' || event.status === 'Cancelled') {
        return true;
    }

    try {
        const timeString = event.startTime || '00:00';
        const datePart = event.date.split('T')[0];
        let timePart = timeString.trim();

        // Convert 12-hour AM/PM format if present (e.g., "09:00 AM", "02:30 PM")
        if (/pm/i.test(timePart) || /am/i.test(timePart)) {
            const isPM = /pm/i.test(timePart);
            const cleanTime = timePart.replace(/am|pm/gi, '').trim();
            const [hStr, mStr] = cleanTime.split(':');
            let hours = parseInt(hStr || '0', 10);
            const minutes = parseInt(mStr || '0', 10);
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
            timePart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        const isoString = `${datePart}T${timePart.length === 5 ? timePart + ':00' : timePart}`;
        const eventStartDate = new Date(isoString);

        let eventStartTimestamp = eventStartDate.getTime();
        if (isNaN(eventStartTimestamp)) {
            // Fallback: parse date string directly
            eventStartTimestamp = new Date(datePart).getTime();
        }

        const nowTimestamp = Date.now();
        const msUntilStart = eventStartTimestamp - nowTimestamp;
        const hoursUntilStart = msUntilStart / (1000 * 60 * 60);

        // Locked if within 48 hours of event start (or already past start time)
        return hoursUntilStart <= lockHours;
    } catch (err) {
        console.warn('Error parsing event start date for 48h unjoin lock:', err);
        return false;
    }
}

/**
 * Calculates remaining hours until event start
 */
export function getRemainingHoursToEvent(event?: GameEvent | EventCore | null): number {
    if (!event || !event.date) return 999;
    try {
        const datePart = event.date.split('T')[0];
        const timeString = event.startTime || '00:00';
        const isoString = `${datePart}T${timeString.length === 5 ? timeString + ':00' : timeString}`;
        const eventStartDate = new Date(isoString);
        let eventStartTimestamp = eventStartDate.getTime();
        if (isNaN(eventStartTimestamp)) {
            eventStartTimestamp = new Date(datePart).getTime();
        }
        return (eventStartTimestamp - Date.now()) / (1000 * 60 * 60);
    } catch {
        return 999;
    }
}
