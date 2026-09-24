/**
 * Tactical Mobile & Device Notification Service
 * Handles Web Notifications, Service Worker push notifications, permission requests,
 * vibration patterns, and automated tactical triggers (Raffles, Events, Ranks, Badges).
 */

export interface NotificationPreferences {
    eventReminders: boolean;
    liveRaffles: boolean;
    rankPromotions: boolean;
    badgeUnlocks: boolean;
    squadAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    eventReminders: true,
    liveRaffles: true,
    rankPromotions: true,
    badgeUnlocks: true,
    squadAlerts: true
};

const PREFS_STORAGE_KEY = 'bosjol_tactical_notification_prefs';

/**
 * Check if the current browser and platform support Notifications
 */
export const isNotificationSupported = (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Detect if user is on an iOS device (iPhone/iPad)
 */
export const isIOSDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Detect if application is currently running as an installed PWA (Standalone)
 */
export const isStandaloneMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as unknown as { standalone?: boolean }).standalone === true;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
    if (!isNotificationSupported()) {
        return 'unsupported';
    }
    return Notification.permission;
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    if (!isNotificationSupported()) {
        return 'unsupported';
    }

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // Ensure service worker is registered and ready
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.ready;
                } catch (e) {
                    console.warn('[Notifications] SW ready check:', e);
                }
            }
        }
        
        return permission;
    } catch (err) {
        console.error('[Notifications] Failed to request notification permission:', err);
        return 'denied';
    }
};

// In-memory runtime cache for notification preferences (zero localStorage)
let inMemoryPreferences: NotificationPreferences = { ...DEFAULT_PREFERENCES };

/**
 * Load user notification preferences (in-memory, no localStorage)
 */
export const getNotificationPreferences = (): NotificationPreferences => {
    return inMemoryPreferences;
};

/**
 * Save user notification preferences (in-memory, no localStorage)
 */
export const saveNotificationPreferences = (prefs: Partial<NotificationPreferences>): NotificationPreferences => {
    inMemoryPreferences = { ...inMemoryPreferences, ...prefs };
    return inMemoryPreferences;
};

/**
 * Send a rich tactical notification to the mobile device / desktop
 */
export const sendDeviceNotification = async (
    title: string,
    options?: {
        body?: string;
        icon?: string;
        badge?: string;
        image?: string;
        tag?: string;
        data?: Record<string, any>;
        url?: string;
        vibrate?: number[];
        requireInteraction?: boolean;
        renotify?: boolean;
        sound?: string;
    }
): Promise<boolean> => {
    if (!isNotificationSupported()) {
        console.warn('[Notifications] Notifications not supported on this device');
        return false;
    }

    if (Notification.permission !== 'granted') {
        console.warn('[Notifications] Notification permission is not granted:', Notification.permission);
        return false;
    }

    const notificationPayload = {
        body: options?.body || 'Tactical Alert from Bosjol Command',
        icon: options?.icon || '/pwa-192x192.png',
        badge: options?.badge || '/pwa-192x192.png',
        image: options?.image,
        tag: options?.tag || `bosjol-${Date.now()}`,
        renotify: options?.renotify ?? true,
        requireInteraction: options?.requireInteraction ?? false,
        vibrate: options?.vibrate || [200, 100, 200, 100, 200],
        actions: [
            { action: 'open', title: 'View Dashboard' },
            { action: 'close', title: 'Dismiss' }
        ],
        data: {
            url: options?.url || '/',
            timestamp: Date.now(),
            ...(options?.data || {})
        }
    };

    // Mobile device tactical haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate([150, 75, 150]);
        } catch {
            // Ignore vibration errors
        }
    }

    // Method 1: Preferred for Mobile — Service Worker showNotification
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.showNotification) {
                await registration.showNotification(title, notificationPayload as NotificationOptions);
                console.log('[Notifications] SW Notification dispatched:', title);
                return true;
            }
        } catch (err) {
            console.warn('[Notifications] ServiceWorker notification failed, attempting fallback:', err);
        }
    }

    // Method 2: Fallback to Window Notification constructor
    try {
        const notif = new Notification(title, {
            body: notificationPayload.body,
            icon: notificationPayload.icon,
            badge: notificationPayload.badge,
            tag: notificationPayload.tag,
            data: notificationPayload.data
        });

        notif.onclick = () => {
            window.focus();
            if (options?.url && options.url !== window.location.pathname) {
                window.location.href = options.url;
            }
            notif.close();
        };

        return true;
    } catch (fallbackErr) {
        console.error('[Notifications] Window notification fallback error:', fallbackErr);
        return false;
    }
};

/**
 * Dispatch an automated upcoming event reminder
 */
export const notifyEventReminder = async (
    eventName: string,
    timeText: string,
    locationName?: string,
    eventId?: string
) => {
    const prefs = getNotificationPreferences();
    if (!prefs.eventReminders) return false;

    return sendDeviceNotification(`⚠️ OPERATION BRIEFING: ${eventName}`, {
        body: `T-minus ${timeText}! ${locationName ? `Location: ${locationName}. ` : ''}Prepare tactical loadout and check in on field.`,
        tag: `event-reminder-${eventId || 'general'}`,
        url: '/?tab=Events',
        data: { eventId, type: 'event_reminder' }
    });
};

/**
 * Dispatch a live raffle draw notification
 */
export const notifyLiveRaffleStart = async (
    raffleTitle: string,
    prizeName: string,
    raffleId?: string
) => {
    const prefs = getNotificationPreferences();
    if (!prefs.liveRaffles) return false;

    return sendDeviceNotification(`🎟️ LIVE RAFFLE COMMENCED: ${raffleTitle}`, {
        body: `The drum is spinning for "${prizeName}"! Spectate the live cipher draw on your tactical dashboard now.`,
        tag: `raffle-live-${raffleId || Date.now()}`,
        url: '/?tab=Raffles',
        data: { raffleId, type: 'raffle_live' }
    });
};

/**
 * Dispatch a prize winning alert to a lucky player
 */
export const notifyRaffleWin = async (
    raffleTitle: string,
    prizeName: string,
    ticketNumber?: string
) => {
    return sendDeviceNotification(`🏆 VICTORY: YOU WON THE RAFFLE!`, {
        body: `Congratulations! Ticket #${ticketNumber || 'WIN'} won "${prizeName}" in ${raffleTitle}! Claim with Field Marshall.`,
        tag: `raffle-win-${Date.now()}`,
        requireInteraction: true,
        url: '/?tab=Raffles',
        data: { type: 'raffle_win' }
    });
};

/**
 * Dispatch a rank promotion alert
 */
export const notifyRankPromotion = async (
    callsignOrName: string,
    newRankName: string,
    rankIconUrl?: string
) => {
    const prefs = getNotificationPreferences();
    if (!prefs.rankPromotions) return false;

    return sendDeviceNotification(`⭐ PROMOTION GRANTED: ${newRankName.toUpperCase()}`, {
        body: `Operator ${callsignOrName}, field command has confirmed your battlefield promotion to ${newRankName}!`,
        icon: rankIconUrl || '/pwa-192x192.png',
        tag: `rank-promotion-${Date.now()}`,
        url: '/?tab=Ranks',
        data: { type: 'rank_promotion' }
    });
};

/**
 * Dispatch a badge unlock alert
 */
export const notifyBadgeEarned = async (
    badgeName: string,
    isLegendary: boolean = false,
    badgeIconUrl?: string
) => {
    const prefs = getNotificationPreferences();
    if (!prefs.badgeUnlocks) return false;

    return sendDeviceNotification(
        isLegendary ? `👑 LEGENDARY COMMENDATION: ${badgeName}` : `🎖️ COMMENDATION UNLOCKED: ${badgeName}`,
        {
            body: `You have been awarded the "${badgeName}" tactical medal for outstanding battlefield performance.`,
            icon: badgeIconUrl || '/pwa-192x192.png',
            tag: `badge-unlock-${Date.now()}`,
            url: '/?tab=Achievements',
            data: { type: 'badge_unlock', badgeName }
        }
    );
};

/**
 * Send an immediate test notification to verify mobile receipt and vibration
 */
export const sendTestNotification = async (): Promise<boolean> => {
    return sendDeviceNotification('🔴 BOSJOL TACTICAL: MOBILE LINK ACTIVE', {
        body: 'Mobile notification channel successfully established! You will now receive live tactical ops, raffle draws, and combat alerts.',
        tag: `test-ping-${Date.now()}`,
        url: '/',
        data: { test: true }
    });
};
