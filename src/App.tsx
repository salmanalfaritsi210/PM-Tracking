import { useState, useEffect, useMemo } from 'react';
import { INITIAL_EQUIPMENT } from './data/initialData';
import {
  subscribeEquipment,
  updateEquipmentInFirestore,
  addEquipmentToFirestore,
  bulkUpdateEquipmentInFirestore,
  deleteHistoryEntryFromFirestore,
  clearAllLogsInFirestore,
} from './lib/equipmentService';
import { calculateRealtimeStatus } from './lib/dateUtils';
import {
  EquipmentItem,
  FilterState,
  NavTab,
  ViewMode,
  MaintenanceHistoryEntry,
  EquipmentSpecs,
  AreaCustomizationMap,
  Area,
  DEFAULT_AREA_CUSTOMIZATION,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { EquipmentCard } from './components/EquipmentCard';
import { EquipmentTable } from './components/EquipmentTable';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HistoryLogsView } from './components/HistoryLogsView';
import { UpdateLogModal } from './components/UpdateLogModal';
import { ReportModal } from './components/ReportModal';
import { ManageAreaCustomizationModal } from './components/ManageAreaCustomizationModal';
import { SettingsModal } from './components/SettingsModal';
import { BottomNavBar } from './components/BottomNavBar';
import { OfflineToast } from './components/OfflineToast';

export default function App() {
  // Sync with Firestore real-time subscription
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeEquipment((items) => {
      setEquipmentList(items);
    });
    return () => unsubscribe();
  }, []);

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    const saved = localStorage.getItem('pm_tracking_active_tab');
    const validTabs: NavTab[] = [
      'dashboard',
      'north',
      'south',
      'dock',
      'history',
      'equipment',
      'schedules',
      'archives',
    ];
    if (saved && validTabs.includes(saved as NavTab)) {
      return saved as NavTab;
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('pm_tracking_active_tab', currentTab);
  }, [currentTab]);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    area: 'All',
    line: 'All',
    pmType: 'All',
    status: 'All',
    dateRange: 'All',
    search: '',
    sortBy: 'Default',
  });

  // Area Customization State (Lines & PM Types per Area)
  const [areaCustomization, setAreaCustomization] = useState<AreaCustomizationMap>(() => {
    const saved = localStorage.getItem('pm_tracking_area_customization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse area customization', e);
      }
    }
    return DEFAULT_AREA_CUSTOMIZATION;
  });

  useEffect(() => {
    localStorage.setItem('pm_tracking_area_customization', JSON.stringify(areaCustomization));
  }, [areaCustomization]);

  // Drawer & Modals State
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<EquipmentItem | null>(null);
  const [selectedModalItem, setSelectedModalItem] = useState<EquipmentItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isManageCustomizationOpen, setIsManageCustomizationOpen] = useState(false);
  const [manageCustomizationArea, setManageCustomizationArea] = useState<Area>('North Logistics');

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pm_tracking_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pm_tracking_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pm_tracking_theme', 'light');
    }
  }, [isDarkMode]);

  const handleOpenManageCustomization = (initialArea?: Area) => {
    if (initialArea) setManageCustomizationArea(initialArea);
    setIsManageCustomizationOpen(true);
  };

  // Sync drawer item if list changes
  useEffect(() => {
    if (selectedDrawerItem) {
      const updated = equipmentList.find((e) => e.id === selectedDrawerItem.id);
      if (updated) setSelectedDrawerItem(updated);
    }
  }, [equipmentList]);

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      area: 'All',
      line: 'All',
      pmType: 'All',
      status: 'All',
      dateRange: 'All',
      search: '',
      sortBy: 'Default',
    });
  };

  // Helper to get priority for PM type ordering: Check Weigher -> Net Weigher -> Metal Detector -> Routine PM
  const getPmTypePriority = (pmType: string): number => {
    const t = (pmType || '').toLowerCase();
    if (t.includes('check weigher') || t.includes('checkweigher')) return 1;
    if (t.includes('net weigher') || t.includes('netweigher')) return 2;
    if (t.includes('metal detector')) return 3;
    if (t.includes('routine')) return 4;
    return 5;
  };

  // Filter items based on navigation tab and FilterBar state
  const filteredEquipment = useMemo(() => {
    const list = equipmentList.filter((item) => {
      // Nav tab filters
      if (currentTab === 'north' && item.area !== 'North Logistics') return false;
      if (currentTab === 'south' && item.area !== 'South Logistics') return false;
      if (currentTab === 'dock' && item.area !== 'Dock Area') return false;

      // FilterBar dropdowns
      if (filters.area !== 'All' && item.area !== filters.area) return false;
      if (filters.line !== 'All' && item.line !== filters.line) return false;
      if (filters.pmType !== 'All' && item.pmType !== filters.pmType) return false;
      if (filters.status !== 'All' && item.status !== filters.status) return false;

      if (filters.dateRange === 'Overdue' && item.status !== 'Overdue') return false;

      // Search Query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchWo = item.workOrder.toLowerCase().includes(q);
        const matchPtw = item.ptwNo.toLowerCase().includes(q);
        const matchWoPtw = item.lastWoPtw.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchWo && !matchPtw && !matchWoPtw) {
          return false;
        }
      }

      return true;
    });

    if (!filters.sortBy || filters.sortBy === 'Default' || filters.sortBy === 'PM Type') {
      return [...list].sort((a, b) => {
        const pA = getPmTypePriority(a.pmType);
        const pB = getPmTypePriority(b.pmType);
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
      });
    }

    return [...list].sort((a, b) => {
      if (filters.sortBy === 'Next Due Date') {
        const dateA = new Date(a.nextDueDate).getTime() || 0;
        const dateB = new Date(b.nextDueDate).getTime() || 0;
        return dateA - dateB;
      }
      if (filters.sortBy === 'Status') {
        const statusPriority: Record<string, number> = { Overdue: 1, 'Due Soon': 2, OK: 3 };
        const pA = statusPriority[a.status] || 99;
        const pB = statusPriority[b.status] || 99;
        if (pA !== pB) return pA - pB;
        return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
      }
      if (filters.sortBy === 'Alphabetical Name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [equipmentList, currentTab, filters]);

  // Separate by Area sections for Dashboard Grid view
  const northEquipment = useMemo(() => {
    return filteredEquipment.filter((item) => item.area === 'North Logistics');
  }, [filteredEquipment]);

  const southEquipment = useMemo(() => {
    return filteredEquipment.filter((item) => item.area === 'South Logistics');
  }, [filteredEquipment]);

  const dockEquipment = useMemo(() => {
    return filteredEquipment.filter((item) => item.area === 'Dock Area');
  }, [filteredEquipment]);

  // Dedicated lists for Home / Dashboard view focusing on Due Soon & Overdue
  const dueSoonEquipment = useMemo(() => {
    return filteredEquipment
      .filter((item) => item.status === 'Due Soon' || (item.status === 'OK' && new Date(item.nextDueDate).getTime() - Date.now() <= 30 * 86400000 && item.status !== 'Overdue'))
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [filteredEquipment]);

  const overdueEquipment = useMemo(() => {
    return filteredEquipment
      .filter((item) => item.status === 'Overdue')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [filteredEquipment]);

  // Handlers
  const handleOpenUpdateModal = (item?: EquipmentItem | null) => {
    setSelectedModalItem(item || null);
    setIsUpdateModalOpen(true);
  };

  const handleSaveLogData = (logData: {
    equipmentName?: string;
    equipmentCode?: string;
    specs?: EquipmentSpecs;
    workOrder: string;
    ptwNo: string;
    area: 'North Logistics' | 'South Logistics' | 'Dock Area';
    line: string;
    pmType: string;
    lastPmDate: string;
    frequencyMonths: number;
    nextDueDate: string;
    isCompleted: boolean;
  }) => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const newHistoryEntry: MaintenanceHistoryEntry = {
      id: `h-log-${Date.now()}`,
      date: todayStr,
      status: logData.isCompleted ? 'Completed' : 'Flagged',
      workOrder: logData.workOrder,
      permitPtw: logData.ptwNo,
      technicianNotes: `Preventive Maintenance inspection executed. WO: ${logData.workOrder}, PTW: ${logData.ptwNo}. Next due set to ${logData.nextDueDate}.`,
    };

    const { status: realStatus, daysAgoText: realDaysAgo } = calculateRealtimeStatus(
      logData.nextDueDate,
      logData.lastPmDate
    );

    if (selectedModalItem) {
      // Update existing item in Firestore
      const updatedFields: Partial<EquipmentItem> = {
        name: logData.equipmentName?.trim() ? logData.equipmentName.trim() : selectedModalItem.name,
        code: logData.equipmentCode?.trim() ? logData.equipmentCode.trim() : selectedModalItem.code,
        specs: logData.specs || selectedModalItem.specs,
        workOrder: logData.workOrder,
        ptwNo: logData.ptwNo,
        lastWoPtw: `${logData.workOrder} / ${logData.ptwNo}`,
        area: logData.area,
        line: logData.line,
        pmType: logData.pmType,
        lastPmDate: logData.lastPmDate,
        daysAgoText: realDaysAgo,
        nextDueDate: logData.nextDueDate,
        frequencyMonths: logData.frequencyMonths,
        status: logData.isCompleted ? realStatus : 'Due Soon',
        history: [newHistoryEntry, ...(selectedModalItem.history || [])],
      };
      updateEquipmentInFirestore(selectedModalItem.id, updatedFields);
    } else {
      // Add brand new PM unit in Firestore
      const newUnit: EquipmentItem = {
        id: `eq-new-${Date.now()}`,
        name: logData.equipmentName?.trim() || `${logData.line} ${logData.pmType}`,
        code: logData.equipmentCode?.trim() || `NEW-PM-${Math.floor(100 + Math.random() * 900)}`,
        specs: logData.specs,
        area: logData.area,
        line: logData.line,
        pmType: logData.pmType,
        lastPmDate: logData.lastPmDate,
        daysAgoText: realDaysAgo,
        lastWoPtw: `${logData.workOrder} / ${logData.ptwNo}`,
        workOrder: logData.workOrder,
        ptwNo: logData.ptwNo,
        nextDueDate: logData.nextDueDate,
        frequencyMonths: logData.frequencyMonths,
        status: logData.isCompleted ? realStatus : 'Due Soon',
        history: [newHistoryEntry],
      };
      addEquipmentToFirestore(newUnit);
    }
  };

  const handleUpdateSpecs = (equipmentId: string, specs: EquipmentSpecs) => {
    updateEquipmentInFirestore(equipmentId, { specs });
  };

  const handleAddHistoryNote = (equipmentId: string, entry: Omit<MaintenanceHistoryEntry, 'id'>) => {
    const fullEntry: MaintenanceHistoryEntry = {
      ...entry,
      id: `h-entry-${Date.now()}`,
    };

    const targetItem = equipmentList.find((item) => item.id === equipmentId);
    if (targetItem) {
      updateEquipmentInFirestore(equipmentId, {
        history: [fullEntry, ...(targetItem.history || [])],
      });
    }
  };

  const handleDeleteHistoryLog = (equipmentId: string, logId: string) => {
    const targetItem = equipmentList.find((item) => item.id === equipmentId);
    if (targetItem) {
      deleteHistoryEntryFromFirestore(equipmentId, logId, targetItem.history || []);
    }
  };

  const handleClearAllHistoryLogs = () => {
    clearAllLogsInFirestore();
  };

  const handleBulkUpdate = (
    selectedIds: string[],
    updates: {
      status?: 'OK' | 'Due Soon' | 'Overdue';
      lastPmDate?: string;
      nextDueDate?: string;
      workOrder?: string;
      ptwNo?: string;
      notes?: string;
    }
  ) => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    bulkUpdateEquipmentInFirestore(selectedIds, (item) => {
      const updatedStatus = updates.status || item.status;
      const updatedLastPm = updates.lastPmDate || item.lastPmDate;
      const updatedNextDue = updates.nextDueDate || item.nextDueDate;
      const updatedWo =
        updates.workOrder !== undefined && updates.workOrder !== '' ? updates.workOrder : item.workOrder;
      const updatedPtw =
        updates.ptwNo !== undefined && updates.ptwNo !== '' ? updates.ptwNo : item.ptwNo;

      const newHistoryEntry: MaintenanceHistoryEntry = {
        id: `h-bulk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: todayStr,
        status: updatedStatus === 'OK' ? 'Completed' : 'Updated',
        workOrder: updatedWo || item.workOrder,
        permitPtw: updatedPtw || item.ptwNo,
        technicianNotes: updates.notes || `Bulk maintenance update applied. Status set to ${updatedStatus}.`,
      };

      return {
        status: updatedStatus,
        lastPmDate: updatedLastPm,
        nextDueDate: updatedNextDue,
        workOrder: updatedWo,
        ptwNo: updatedPtw,
        lastWoPtw: updatedWo || updatedPtw ? `${updatedWo} / ${updatedPtw}` : item.lastWoPtw,
        daysAgoText: updates.lastPmDate ? '- Updated recently' : item.daysAgoText,
        history: [newHistoryEntry, ...(item.history || [])],
      };
    });
  };

  // Pull-to-refresh simulation state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);

  const handlePullToRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 3000);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#001d32] font-body flex flex-col md:flex-row antialiased selection:bg-[#cde5ff]">
      {/* Side Navigation Bar (Desktop & Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUpdateModal={() => handleOpenUpdateModal(null)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-[#edf4ff]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={filters.search}
          setSearchQuery={(search) => setFilters((prev) => ({ ...prev, search }))}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenUpdateModal={() => handleOpenUpdateModal(null)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Mobile Pull-to-refresh Banner */}
        <div className="md:hidden px-4 pt-2 flex justify-between items-center text-xs font-label text-[#434653]">
          <button
            onClick={handlePullToRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 active:scale-95 transition-all border border-[#c3c6d5]/30 cursor-pointer text-[#094cb2] font-semibold"
          >
            <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isRefreshing ? 'Refreshing data...' : 'Pull to Refresh'}</span>
          </button>
          {refreshToast && (
            <span className="text-[11px] font-bold text-[#094cb2] bg-[#d8eaff] px-2.5 py-1 rounded-full animate-in fade-in duration-200">
              ✓ Data up to date
            </span>
          )}
        </div>

        {/* Dashboard Content Container with PB-28 for Mobile Bottom Nav */}
        <div className="p-4 sm:p-8 pb-28 sm:pb-8 max-w-7xl mx-auto w-full flex-grow">
          {/* Page Heading Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#094cb2]">
                {currentTab === 'dashboard' && 'PM Tracking - Instrumentation Logistics Department'}
                {currentTab === 'north' && 'North Logistics Section'}
                {currentTab === 'south' && 'South Logistics Section'}
                {currentTab === 'dock' && 'Dock Area Section'}
                {currentTab === 'history' && 'PM History Logs'}
                {currentTab === 'equipment' && 'Equipment Master List'}
                {currentTab === 'schedules' && 'Schedules Calendar'}
                {currentTab === 'archives' && 'PM Archives'}
              </h1>
              <p className="font-body text-xs sm:text-sm text-[#434653] mt-1">
                Curated overview of preventative maintenance schedules, calibration status, and work order tracking.
              </p>
            </div>

            {/* Quick View Mode Toggle on Mobile */}
            <div className="flex sm:hidden items-center gap-2 self-start mt-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-xs font-label font-bold flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-[#094cb2] text-white' : 'bg-white text-[#094cb2]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">grid_view</span> Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-label font-bold flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-[#094cb2] text-white' : 'bg-white text-[#094cb2]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">table_rows</span> Table
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onOpenUpdateModal={() => handleOpenUpdateModal(null)}
            onClearFilters={handleClearFilters}
            totalFilteredCount={filteredEquipment.length}
            areaCustomization={areaCustomization}
            onOpenManageCustomization={handleOpenManageCustomization}
          />

          {/* DEDICATED HISTORY LOGS VIEW OR EQUIPMENT DISPLAY MODES */}
          {currentTab === 'history' ? (
            <HistoryLogsView
              equipmentList={equipmentList}
              onDeleteLog={handleDeleteHistoryLog}
              onClearAllLogs={handleClearAllHistoryLogs}
              onSelectEquipment={(item) => setSelectedDrawerItem(item)}
            />
          ) : viewMode === 'table' ? (
            <EquipmentTable
              items={filteredEquipment}
              onSelect={(item) => setSelectedDrawerItem(item)}
              onQuickLog={(item) => setSelectedDrawerItem(item)}
              onEditEquipment={(item) => handleOpenUpdateModal(item)}
              onBulkUpdate={handleBulkUpdate}
            />
          ) : (
            /* DISPLAY MODE 2: GRID CARDS VIEW (GROUPED BY LOCATION & DASHBOARD FOCUS) */
            <div className="space-y-10">
              {/* HOME DASHBOARD SPECIAL VIEW: OVERDUE & DUE SOON PM DATA LOGS */}
              {currentTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* OVERDUE PM LOGS SECTION */}
                  <section className="bg-[#fff2f2]/60 p-4 sm:p-6 rounded-2xl border border-[#ba1a1a]/25">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#ba1a1a]/20">
                      <h3 className="font-headline text-lg sm:text-xl text-[#ba1a1a] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ba1a1a] fill-1">warning</span>
                        <span>Overdue PM Logs</span>
                      </h3>
                      <span className="text-xs font-label font-bold text-[#ba1a1a] bg-[#ffdad6] px-3 py-1 rounded-full self-start sm:self-auto">
                        {overdueEquipment.length} Overdue Units
                      </span>
                    </div>

                    {overdueEquipment.length === 0 ? (
                      <div className="bg-white/80 rounded-xl p-5 border border-[#ba1a1a]/15 text-center text-[#434653]">
                        <p className="font-label text-sm font-medium text-emerald-700 flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span>No overdue PM schedules. All equipment maintenance is currently up to date!</span>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                        {overdueEquipment.map((item) => (
                          <EquipmentCard
                            key={item.id}
                            item={item}
                            onSelect={(item) => setSelectedDrawerItem(item)}
                            onQuickLog={(item) => setSelectedDrawerItem(item)}
                            onEdit={(item) => handleOpenUpdateModal(item)}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* DUE SOON PM LOGS SECTION */}
                  <section className="bg-[#edf4ff]/50 p-4 sm:p-6 rounded-2xl border border-[#094cb2]/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#094cb2]/15">
                      <h3 className="font-headline text-lg sm:text-xl text-[#001d32] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#094cb2] fill-1">schedule</span>
                        <span>Due Soon PM Logs</span>
                      </h3>
                      <span className="text-xs font-label font-bold text-[#094cb2] bg-[#d8eaff] px-3 py-1 rounded-full self-start sm:self-auto">
                        {dueSoonEquipment.length} PMs Due Soon
                      </span>
                    </div>

                    {dueSoonEquipment.length === 0 ? (
                      <div className="bg-white/80 rounded-xl p-5 border border-[#094cb2]/15 text-center text-[#434653]">
                        <p className="font-label text-sm font-medium text-slate-600 flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-base">event_available</span>
                          <span>No upcoming PM schedules due soon in the near future.</span>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                        {dueSoonEquipment.map((item) => (
                          <EquipmentCard
                            key={item.id}
                            item={item}
                            onSelect={(item) => setSelectedDrawerItem(item)}
                            onQuickLog={(item) => setSelectedDrawerItem(item)}
                            onEdit={(item) => handleOpenUpdateModal(item)}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* NORTH LOGISTICS SECTION */}
              {currentTab === 'north' && (
                <section>
                  <h3 className="font-headline text-lg sm:text-xl text-[#001d32] mb-5 flex items-center gap-2 border-b-2 border-[#d8eaff] pb-2 inline-flex">
                    <span className="material-symbols-outlined text-[#094cb2]">location_on</span>
                    <span>North Logistics</span>
                    <span className="text-xs font-label font-normal text-[#434653] bg-[#e2efff] px-2 py-0.5 rounded-full ml-1">
                      {northEquipment.length} units
                    </span>
                  </h3>

                  {northEquipment.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 ghost-border text-center text-[#434653]">
                      <p className="font-label text-sm">No units matching current filters in North Logistics.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                      {northEquipment.map((item) => (
                        <EquipmentCard
                          key={item.id}
                          item={item}
                          onSelect={(item) => setSelectedDrawerItem(item)}
                          onQuickLog={(item) => setSelectedDrawerItem(item)}
                          onEdit={(item) => handleOpenUpdateModal(item)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SOUTH LOGISTICS SECTION */}
              {currentTab === 'south' && (
                <section>
                  <h3 className="font-headline text-lg sm:text-xl text-[#001d32] mb-5 flex items-center gap-2 border-b-2 border-[#d8eaff] pb-2 inline-flex">
                    <span className="material-symbols-outlined text-[#094cb2]">location_on</span>
                    <span>South Logistics</span>
                    <span className="text-xs font-label font-normal text-[#434653] bg-[#e2efff] px-2 py-0.5 rounded-full ml-1">
                      {southEquipment.length} units
                    </span>
                  </h3>

                  {southEquipment.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 ghost-border text-center text-[#434653]">
                      <p className="font-label text-sm">No units matching current filters in South Logistics.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                      {southEquipment.map((item) => (
                        <EquipmentCard
                          key={item.id}
                          item={item}
                          onSelect={(item) => setSelectedDrawerItem(item)}
                          onQuickLog={(item) => setSelectedDrawerItem(item)}
                          onEdit={(item) => handleOpenUpdateModal(item)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* DOCK AREA SECTION */}
              {currentTab === 'dock' && (
                <section>
                  <h3 className="font-headline text-lg sm:text-xl text-[#001d32] mb-5 flex items-center gap-2 border-b-2 border-[#d8eaff] pb-2 inline-flex">
                    <span className="material-symbols-outlined text-[#094cb2]">precision_manufacturing</span>
                    <span>Dock Area</span>
                  </h3>

                  {dockEquipment.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                      {dockEquipment.map((item) => (
                        <EquipmentCard
                          key={item.id}
                          item={item}
                          onSelect={(item) => setSelectedDrawerItem(item)}
                          onQuickLog={(item) => setSelectedDrawerItem(item)}
                          onEdit={(item) => handleOpenUpdateModal(item)}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Exact Dock PlaceHolder from Image 1 */
                    <div className="bg-white rounded-2xl p-8 ghost-border flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-16 h-16 rounded-full bg-[#e2efff] flex items-center justify-center mb-4 text-[#094cb2]">
                        <span className="material-symbols-outlined text-3xl">build_circle</span>
                      </div>
                      <h4 className="font-headline text-lg font-bold text-[#001d32] mb-1.5">
                        Dock PM list will be updated soon
                      </h4>
                      <p className="text-xs sm:text-sm text-[#434653] max-w-md font-body leading-relaxed mb-4">
                        Data for this area is currently being compiled and will be available in the next system sync. You can also add Dock PM entries right now.
                      </p>
                      <button
                        onClick={() => handleOpenUpdateModal(null)}
                        className="btn-primary font-label text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span>Add Dock PM Log</span>
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Maintenance History Drawer */}
      <HistoryDrawer
        item={selectedDrawerItem ? equipmentList.find((e) => e.id === selectedDrawerItem.id) || selectedDrawerItem : null}
        onClose={() => setSelectedDrawerItem(null)}
        onAddHistoryEntry={handleAddHistoryNote}
        onDeleteHistoryEntry={handleDeleteHistoryLog}
        onOpenUpdateModal={(item) => handleOpenUpdateModal(item)}
        onUpdateSpecs={handleUpdateSpecs}
      />

      {/* Update PM Log Modal Form */}
      <UpdateLogModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        selectedEquipment={selectedModalItem}
        areaCustomization={areaCustomization}
        onOpenManageCustomization={handleOpenManageCustomization}
        onSave={handleSaveLogData}
      />

      {/* Customize Lines & PM Types Modal */}
      <ManageAreaCustomizationModal
        isOpen={isManageCustomizationOpen}
        onClose={() => setIsManageCustomizationOpen(false)}
        areaCustomization={areaCustomization}
        initialArea={manageCustomizationArea}
        onSaveCustomization={(updatedMap) => setAreaCustomization(updatedMap)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        equipment={equipmentList}
      />

      {/* Settings / Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Network Online/Offline Status Notification Toast */}
      <OfflineToast />

      {/* Bottom Navigation Bar for Mobile Navigation */}
      <BottomNavBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />
    </div>
  );
}
