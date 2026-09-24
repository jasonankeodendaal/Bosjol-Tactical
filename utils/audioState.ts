// In-memory audio mute state manager (zero localStorage)
let appAudioMuted: boolean = false;
const listeners = new Set<(muted: boolean) => void>();

export const getAppAudioMuted = (): boolean => appAudioMuted;

export const setAppAudioMuted = (muted: boolean): void => {
    appAudioMuted = muted;
    listeners.forEach(fn => {
        try {
            fn(muted);
        } catch {
            // Ignore subscriber errors
        }
    });
};

export const subscribeAppAudioMuted = (fn: (muted: boolean) => void): (() => void) => {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
};
