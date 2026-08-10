import React from 'react';
import { NavTab, ViewMode } from '../types';
import logoImg from '../assets/images/instrumentation_logo_1786301198901.jpg';

interface HeaderProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenUpdateModal: () => void;
  onOpenReportModal: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenMobileSidebar,
  onOpenUpdateModal,
  onOpenReportModal,
  unreadCount = 2,
}) => {
  return (
    <header className="bg-white top-0 sticky z-20 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-3.5 border-b border-[#c3c6d5]/20 shadow-xs">
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8">
        {/* Brand Title */}
        <div
          onClick={() => setCurrentTab('dashboard')}
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
          <div className="flex flex-col justify-center">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-[#094cb2] tracking-tight leading-tight">
              PM Tracking
            </h2>
            <p className="font-label text-[11px] font-semibold text-[#434653] leading-tight">Instrumentation Logistics Department</p>
          </div>
        </div>

        {/* Top Header Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 ml-4">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`font-body text-sm font-semibold transition-colors duration-200 cursor-pointer py-1.5 border-b-2 ${
              currentTab === 'dashboard'
                ? 'text-[#094cb2] border-[#094cb2]'
                : 'text-[#434653] border-transparent hover:text-[#094cb2]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('equipment')}
            className={`font-body text-sm font-semibold transition-colors duration-200 cursor-pointer py-1.5 border-b-2 ${
              currentTab === 'equipment'
                ? 'text-[#094cb2] border-[#094cb2]'
                : 'text-[#434653] border-transparent hover:text-[#094cb2]'
            }`}
          >
            Equipment Matrix
          </button>
          <button
            onClick={() => setCurrentTab('schedules')}
            className={`font-body text-sm font-semibold transition-colors duration-200 cursor-pointer py-1.5 border-b-2 ${
              currentTab === 'schedules'
                ? 'text-[#094cb2] border-[#094cb2]'
                : 'text-[#434653] border-transparent hover:text-[#094cb2]'
            }`}
          >
            Schedules
          </button>
          <button
            onClick={() => setCurrentTab('archives')}
            className={`font-body text-sm font-semibold transition-colors duration-200 cursor-pointer py-1.5 border-b-2 ${
              currentTab === 'archives'
                ? 'text-[#094cb2] border-[#094cb2]'
                : 'text-[#434653] border-transparent hover:text-[#094cb2]'
            }`}
          >
            Archives
          </button>
        </nav>
      </div>

      {/* Right Controls: Search, View Mode Toggle, Report, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#edf4ff]">
        {/* Search Input */}
        <div className="relative flex-1 sm:flex-none">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434653] text-sm pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="WO No, PTW, Equipment..."
            className="bg-[#edf4ff] hover:bg-[#e2efff] focus:bg-white rounded-full py-1.5 pl-9 pr-3 w-full sm:w-56 text-xs sm:text-sm font-body text-[#001d32] placeholder:text-[#434653]/70 border border-transparent focus:border-[#094cb2] focus:outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#434653] hover:text-[#001d32]"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher (Grid vs Table) */}
        <div className="hidden sm:flex items-center bg-[#edf4ff] p-0.5 rounded-lg border border-[#c3c6d5]/30">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === 'grid' ? 'bg-white text-[#094cb2] shadow-xs' : 'text-[#434653] hover:text-[#001d32]'
            }`}
            title="Grid View Cards"
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === 'table' ? 'bg-white text-[#094cb2] shadow-xs' : 'text-[#434653] hover:text-[#001d32]'
            }`}
            title="Table View Rows"
          >
            <span className="material-symbols-outlined text-lg">table_rows</span>
          </button>
        </div>

        {/* Notifications Icon */}
        <button
          className="relative text-[#434653] hover:text-[#094cb2] transition-colors p-1.5 rounded-full hover:bg-[#edf4ff] cursor-pointer"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Generate Report Button */}
        <button
          onClick={onOpenReportModal}
          className="hidden md:flex items-center gap-1.5 bg-[#094cb2] hover:bg-[#3366cc] text-white px-3.5 py-1.5 rounded-full font-label text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">summarize</span>
          <span>Generate Report</span>
        </button>

        {/* Mobile Quick Action button */}
        <button
          onClick={onOpenUpdateModal}
          className="sm:hidden bg-[#094cb2] text-white p-1.5 rounded-full hover:bg-[#3366cc] cursor-pointer"
          title="Update PM Log"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>


      </div>
    </header>
  );
};
