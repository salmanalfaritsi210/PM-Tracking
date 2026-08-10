import React from 'react';
import { NavTab } from '../types';
import { hapticLight } from '../utils/haptics';

interface BottomNavBarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  onOpenMobileMenu?: () => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: 'grid_view' },
    { id: 'north' as NavTab, label: 'North', icon: 'location_on' },
    { id: 'south' as NavTab, label: 'South', icon: 'location_on' },
    { id: 'history' as NavTab, label: 'History', icon: 'history' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-[#c3c6d5]/30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              hapticLight();
              setCurrentTab(tab.id);
            }}
            className="flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 group cursor-pointer transition-transform active:scale-95"
            aria-label={`Navigate to ${tab.label}`}
          >
            {/* Active Pill Indicator */}
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-[#d8eaff] text-[#094cb2] shadow-2xs font-bold scale-105'
                  : 'text-[#434653] hover:bg-[#edf4ff]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'filled-icon' : ''}`}>
                {tab.icon}
              </span>
            </div>
            <span
              className={`font-label text-[11px] mt-0.5 tracking-tight transition-colors ${
                isActive ? 'font-bold text-[#094cb2]' : 'font-medium text-[#434653]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
