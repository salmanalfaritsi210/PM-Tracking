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
import {
  EquipmentItem,
  FilterState,
  NavTab,
  ViewMode,
  MaintenanceHistoryEntry,
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
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
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
  });

  // Drawer & Modals State
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<EquipmentItem | null>(null);
  const [selectedModalItem, setSelectedModalItem] = useState<EquipmentItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
    });
  };

  // Filter items based on navigation tab and FilterBar state
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
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

  // Handlers
  const handleOpenUpdateModal = (item?: EquipmentItem | null) => {
    setSelectedModalItem(item || null);
    setIsUpdateModalOpen(true);
  };

  const handleSaveLogData = (logData: {
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

    if (selectedModalItem) {
      // Update existing item in Firestore
      const updatedFields: Partial<EquipmentItem> = {
        workOrder: logData.workOrder,
        ptwNo: logData.ptwNo,
        lastWoPtw: `${logData.workOrder} / ${logData.ptwNo}`,
        area: logData.area,
        line: logData.line,
        pmType: logData.pmType,
        lastPmDate: logData.lastPmDate,
        daysAgoText: '- Just updated',
        nextDueDate: logData.nextDueDate,
        frequencyMonths: logData.frequencyMonths,
        status: logData.isCompleted ? 'OK' : 'Due Soon',
        history: [newHistoryEntry, ...(selectedModalItem.history || [])],
      };
      updateEquipmentInFirestore(selectedModalItem.id, updatedFields);
    } else {
      // Add brand new PM unit in Firestore
      const newUnit: EquipmentItem = {
        id: `eq-new-${Date.now()}`,
        name: `${logData.line} ${logData.pmType}`,
        code: `NEW-PM-${Math.floor(100 + Math.random() * 900)}`,
        area: logData.area,
        line: logData.line,
        pmType: logData.pmType,
        lastPmDate: logData.lastPmDate,
        daysAgoText: '- Just created',
        lastWoPtw: `${logData.workOrder} / ${logData.ptwNo}`,
        workOrder: logData.workOrder,
        ptwNo: logData.ptwNo,
        nextDueDate: logData.nextDueDate,
        frequencyMonths: logData.frequencyMonths,
        status: logData.isCompleted ? 'OK' : 'Due Soon',
        history: [newHistoryEntry],
      };
      addEquipmentToFirestore(newUnit);
    }
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

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#001d32] font-body flex flex-col md:flex-row antialiased selection:bg-[#cde5ff]">
      {/* Side Navigation Bar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUpdateModal={() => handleOpenUpdateModal(null)}
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
        />

        {/* Dashboard Content Container */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-grow">
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
              onBulkUpdate={handleBulkUpdate}
            />
          ) : (
            /* DISPLAY MODE 2: GRID CARDS VIEW (GROUPED BY LOCATION) */
            <div className="space-y-10">
              {/* NORTH LOGISTICS SECTION */}
              {(currentTab === 'dashboard' || currentTab === 'north') && (
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
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SOUTH LOGISTICS SECTION */}
              {(currentTab === 'dashboard' || currentTab === 'south') && (
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
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* DOCK AREA SECTION */}
              {(currentTab === 'dashboard' || currentTab === 'dock') && (
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
                      <p className="text-xs sm:text-sm text-[#434653] max-w-md font-body leading-relaxed">
                        Data for this area is currently being compiled and will be available in the next system sync.
                      </p>
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
        item={selectedDrawerItem}
        onClose={() => setSelectedDrawerItem(null)}
        onAddHistoryEntry={handleAddHistoryNote}
        onDeleteHistoryEntry={handleDeleteHistoryLog}
        onOpenUpdateModal={(item) => handleOpenUpdateModal(item)}
      />

      {/* Update PM Log Modal Form */}
      <UpdateLogModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        selectedEquipment={selectedModalItem}
        onSave={handleSaveLogData}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        equipment={equipmentList}
      />
    </div>
  );
}
