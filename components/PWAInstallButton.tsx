import React, { useState } from 'react';
import { usePWA } from '../utils/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'badge' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone app, do not show install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS, we can still provide guidance or hide
  if (!isInstallable && !isIOS) {
    return null;
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-gradient-to-r from-red-950/80 via-zinc-900/90 to-red-950/80 border border-red-500/40 rounded-xl p-3 flex items-center justify-between gap-3 shadow-lg shadow-red-950/30 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-red-500/40 bg-black flex-shrink-0 flex items-center justify-center">
              <img src="/pwa-192x192.png" alt="Bosjol Tactical Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-chakra flex items-center gap-2">
                Bosjol Tactical PWA
                <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">Offline Ready</span>
              </h4>
              <p className="text-xs text-zinc-400">Install to your device for instant launch & offline access.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-chakra font-semibold text-xs px-3.5 py-2 rounded-lg border border-red-400/30 shadow transition flex items-center gap-1.5"
          >
            {installSuccess ? (
              <>
                <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Installed</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{isIOS ? 'Install (iOS)' : 'Install App'}</span>
              </>
            )}
          </button>
        </div>

        {/* iOS Guided Modal */}
        <AnimatePresence>
          {showIOSGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSGuide(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-red-500/40 p-6 shadow-2xl text-white font-chakra"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <img src="/pwa-192x192.png" alt="Icon" className="w-8 h-8 rounded-lg border border-red-500/30" />
                    <h3 className="font-bold text-base uppercase tracking-wider text-red-400">Install on iPhone / iPad</h3>
                  </div>
                  <button onClick={() => setShowIOSGuide(false)} className="text-zinc-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                    <p>Tap the <strong className="text-white">Share</strong> button (box with upward arrow) in Safari's bottom bar.</p>
                  </div>
                  <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                    <p>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                  </div>
                  <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                    <p>Tap <strong className="text-white">Add</strong> in the top right to launch standalone.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold py-2.5 text-sm border border-red-500/30 transition"
                >
                  Got It
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install Bosjol Tactical App"
        className={`flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-chakra font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg border border-red-400/40 shadow-md shadow-red-950/40 transition active:scale-95 ${className}`}
      >
        <svg className="w-4 h-4 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>{isIOS ? 'Install App (iOS)' : 'Install App'}</span>
      </button>

      {/* iOS Guided Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIOSGuide(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-red-500/40 p-6 shadow-2xl text-white font-chakra"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <img src="/pwa-192x192.png" alt="Icon" className="w-8 h-8 rounded-lg border border-red-500/30" />
                  <h3 className="font-bold text-base uppercase tracking-wider text-red-400">Install on iPhone / iPad</h3>
                </div>
                <button onClick={() => setShowIOSGuide(false)} className="text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                  <p>Tap the <strong className="text-white">Share</strong> button in the Safari toolbar.</p>
                </div>
                <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                  <p>Scroll and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                  <p>Tap <strong className="text-white">Add</strong> in the top right corner.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold py-2.5 text-sm border border-red-500/30 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
