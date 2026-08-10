import React from 'react';
import { hapticMedium, hapticLight } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001d32]/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#c3c6d5]/30 flex flex-col animate-in zoom-in-95 duration-200 text-[#001d32] dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#edf4ff] dark:bg-slate-800/80 px-6 py-4 border-b border-[#c3c6d5]/20 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#094cb2]/10 dark:bg-blue-500/20 text-[#094cb2] dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">settings</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg leading-tight dark:text-white">
                Settings
              </h3>
              <p className="font-label text-xs text-[#434653] dark:text-slate-400">
                Application preferences & developer credit
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className="p-2 rounded-xl text-[#434653] dark:text-slate-400 hover:text-[#001d32] dark:hover:text-white hover:bg-[#c3c6d5]/20 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Theme Section */}
          <div className="space-y-3">
            <h4 className="font-label text-xs font-bold uppercase tracking-wider text-[#094cb2] dark:text-blue-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">palette</span>
              <span>Appearance</span>
            </h4>

            <div className="bg-[#edf4ff]/60 dark:bg-slate-800/60 border border-[#094cb2]/15 dark:border-slate-700/60 rounded-xl p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 text-[#094cb2] dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-xl">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <h5 className="font-label text-sm font-bold dark:text-white">
                    {isDarkMode ? 'Dark Theme' : 'Light Theme'}
                  </h5>
                  <p className="text-xs text-[#434653] dark:text-slate-400">
                    {isDarkMode
                      ? 'Comfortable dark theme for low-light environments'
                      : 'Clean light theme for daytime and bright environments'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch Button */}
              <button
                type="button"
                onClick={() => {
                  hapticMedium();
                  onToggleDarkMode();
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#094cb2] focus:ring-offset-2 ${
                  isDarkMode ? 'bg-[#094cb2]' : 'bg-[#c3c6d5]'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span className="sr-only">Toggle theme</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] ${
                    isDarkMode ? 'translate-x-5 text-blue-900' : 'translate-x-0 text-amber-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <hr className="border-[#c3c6d5]/20 dark:border-slate-800" />

          {/* Developer Credit Section */}
          <div className="space-y-3">
            <h4 className="font-label text-xs font-bold uppercase tracking-wider text-[#094cb2] dark:text-blue-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">badge</span>
              <span>Developer Credit</span>
            </h4>

            <div className="bg-gradient-to-br from-[#edf4ff] to-[#d8eaff]/50 dark:from-slate-800 dark:to-slate-800/80 border border-[#094cb2]/20 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Developer Avatar / Icon */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#094cb2] to-[#3366cc] text-white flex items-center justify-center font-headline font-bold text-2xl shadow-md ring-4 ring-white dark:ring-slate-700">
                  SA
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-xs border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </div>
              </div>

              {/* Developer Info */}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h5 className="font-headline font-bold text-base sm:text-lg text-[#001d32] dark:text-white">
                    Salman Alfaritsi
                  </h5>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#094cb2]/10 text-[#094cb2] dark:bg-blue-500/20 dark:text-blue-300 border border-[#094cb2]/20 w-fit mx-auto sm:mx-0">
                    Lead Developer
                  </span>
                </div>
                <p className="font-label text-xs font-semibold text-[#094cb2] dark:text-blue-400">
                  Instrument Technician Logistics Department
                </p>
                <p className="text-xs text-[#434653] dark:text-slate-400 leading-relaxed pt-1">
                  Instrument technician responsible for maintenance, precision calibration, and real-time reliability of instrumentation across the Logistics Department.
                </p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-[#f7f9ff] dark:bg-slate-900/80 border border-[#c3c6d5]/20 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-[#434653] dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-label font-medium">
              <span className="material-symbols-outlined text-sm text-[#094cb2] dark:text-blue-400">
                memory
              </span>
              <span>PM Tracking System</span>
            </span>
            <span className="font-mono text-[11px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[#c3c6d5]/30 dark:border-slate-700">
              v1.2.0 (Offline-IndexedDB)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#edf4ff]/50 dark:bg-slate-800/50 px-6 py-3.5 border-t border-[#c3c6d5]/20 dark:border-slate-700/60 flex items-center justify-end">
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className="btn-primary font-label text-xs sm:text-sm font-bold py-2 px-5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
