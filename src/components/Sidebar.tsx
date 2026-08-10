import React from 'react';
import { NavTab } from '../types';
import logoImg from '../assets/images/instrumentation_logo_1786301198901.jpg';
import { hapticLight, hapticMedium } from '../utils/haptics';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  onOpenUpdateModal: () => void;
  onOpenSettings?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenUpdateModal,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleNavClick = (tab: NavTab) => {
    hapticLight();
    setCurrentTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Brand & Department */}
      <div className="mb-6 px-2 flex items-center justify-between">
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
          title="Go to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border border-[#094cb2]/20 flex items-center justify-center shadow-xs shrink-0 p-0.5">
            <img
              src={logoImg}
              alt="Instrumentation Logo"
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-headline text-lg text-[#001d32] font-bold tracking-tight leading-tight">
              PM Tracking
            </h1>
            <p className="font-label text-[11px] font-semibold text-[#434653] leading-tight">Instrumentation Dept</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-[#434653] hover:text-[#001d32] p-1.5 rounded-lg hover:bg-[#cde5ff]"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Primary Action CTA */}
      <button
        onClick={() => {
          hapticMedium();
          onOpenUpdateModal();
          onCloseMobile();
        }}
        className="mb-6 w-full btn-primary font-label text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
        <span>Update PM Log</span>
      </button>

      {/* Navigation Links */}
      <ul className="flex flex-col gap-1.5 flex-grow font-body text-sm">
        <li>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#cde5ff] text-[#094cb2] font-bold shadow-2xs'
                : 'text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavClick('north')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'north'
                ? 'bg-[#cde5ff] text-[#094cb2] font-bold shadow-2xs'
                : 'text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl">location_on</span>
            <span>North Logistics</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavClick('south')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'south'
                ? 'bg-[#cde5ff] text-[#094cb2] font-bold shadow-2xs'
                : 'text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl">location_on</span>
            <span>South Logistics</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavClick('dock')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'dock'
                ? 'bg-[#cde5ff] text-[#094cb2] font-bold shadow-2xs'
                : 'text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
            <span>Dock Area</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'history'
                ? 'bg-[#cde5ff] text-[#094cb2] font-bold shadow-2xs'
                : 'text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentTab === 'history' ? "'FILL' 1" : undefined }}>
              history
            </span>
            <span>PM History</span>
          </button>
        </li>
      </ul>

      {/* Footer Navigation */}
      <div className="mt-auto border-t border-[#c3c6d5]/20 pt-4 flex flex-col gap-1 font-body text-sm">
        {onOpenSettings && (
          <button
            onClick={() => {
              hapticMedium();
              onOpenSettings();
              onCloseMobile();
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 text-[#094cb2] dark:text-blue-400 font-bold hover:bg-[#d8eaff] dark:hover:bg-slate-800 rounded-xl transition-all duration-200 cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span>Settings</span>
          </button>
        )}
        <a
          href="#support"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 px-3.5 py-2.5 text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] rounded-xl transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">help</span>
          <span>Support</span>
        </a>
        <a
          href="#user-guide"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 px-3.5 py-2.5 text-[#434653] hover:bg-[#f7f9ff] hover:text-[#001d32] rounded-xl transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">menu_book</span>
          <span>User Guide</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#e2efff] border-r border-[#c3c6d5]/20 z-10 overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-[#001d32]/40 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer Body */}
          <div className="relative w-72 max-w-[80vw] bg-[#e2efff] h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-300">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
