import React, { useState, useEffect } from 'react';

export const OfflineToast: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
      setShowRestored(true);

      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isDismissed) return null;

  if (isOffline) {
    return (
      <div
        id="offline-notification-toast"
        role="alert"
        aria-live="assertive"
        className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 w-[92%] sm:w-[420px] max-w-full bg-[#1e293b] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-top duration-300 flex items-start gap-3.5"
      >
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-xl">cloud_off</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-headline font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>You are offline</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </h4>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss offline notification"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 font-body leading-relaxed mt-1">
            Syncing to Firestore is currently paused. Your updates will automatically sync as soon as network connection is restored.
          </p>
        </div>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        id="online-restored-notification-toast"
        role="status"
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 w-[92%] sm:w-[420px] max-w-full bg-[#0f291e] text-white p-4 rounded-2xl shadow-2xl border border-emerald-800/80 backdrop-blur-md animate-in slide-in-from-top duration-300 flex items-start gap-3.5"
      >
        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-xl">cloud_done</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-headline font-bold text-sm text-emerald-100 flex items-center gap-1.5">
              <span>Back Online</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h4>
            <button
              onClick={() => setShowRestored(false)}
              className="text-emerald-400 hover:text-emerald-200 p-1 rounded-lg hover:bg-emerald-950/50 transition-colors cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss online restored notification"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <p className="text-xs text-emerald-200/90 font-body leading-relaxed mt-1">
            Network connection re-established. Syncing to Firestore has resumed.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
