import React, { useState, useEffect, useRef } from 'react';
import { EquipmentItem } from '../types';
import { BulkUpdateModal, BulkUpdateData } from './BulkUpdateModal';
import { calculateEquipmentHealthScore } from '../lib/healthScore';

interface EquipmentTableProps {
  items: EquipmentItem[];
  onSelect: (item: EquipmentItem) => void;
  onQuickLog: (item: EquipmentItem) => void;
  onEditEquipment?: (item: EquipmentItem) => void;
  onBulkUpdate?: (selectedIds: string[], updates: BulkUpdateData) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  items,
  onSelect,
  onQuickLog,
  onEditEquipment,
  onBulkUpdate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const pageSize = 8;
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  const currentItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page if filtering reduces items below current page offset
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [items.length, totalPages, currentPage]);

  // Handle header checkbox indeterminate & checked states
  const allFilteredSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const someFilteredSelected =
    items.some((item) => selectedIds.includes(item.id)) && !allFilteredSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someFilteredSelected;
    }
  }, [someFilteredSelected]);

  // Toggle selection for an individual item
  const handleToggleSelect = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all filtered items
  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all items in filtered list
      const filteredItemIds = new Set(items.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredItemIds.has(id)));
    } else {
      // Select all items in filtered list
      const filteredItemIds = items.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredItemIds])));
    }
  };

  // Select all items currently on visible page
  const handleSelectCurrentPage = () => {
    const pageItemIds = currentItems.map((i) => i.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Perform Quick Status Change for selected items
  const handleQuickStatusChange = (status: 'OK' | 'Due Soon' | 'Overdue') => {
    if (!onBulkUpdate || selectedIds.length === 0) return;
    onBulkUpdate(selectedIds, { status });
    showToast(`Updated status to "${status}" for ${selectedIds.length} items`);
  };

  // Perform Quick Log PM for all selected items (sets last PM to today, status to OK)
  const handleQuickLogBulk = () => {
    if (!onBulkUpdate || selectedIds.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    const nextDue = d.toISOString().split('T')[0];

    onBulkUpdate(selectedIds, {
      status: 'OK',
      lastPmDate: today,
      nextDueDate: nextDue,
      notes: 'Bulk Preventive Maintenance logged for selected equipment.',
    });
    showToast(`Logged PM inspection for ${selectedIds.length} items`);
  };

  // Perform full custom bulk update via modal
  const handleApplyModalUpdate = (data: BulkUpdateData) => {
    if (!onBulkUpdate || selectedIds.length === 0) return;
    onBulkUpdate(selectedIds, data);
    showToast(`Bulk update applied to ${selectedIds.length} equipment items`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="relative space-y-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#001d32] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-label font-bold animate-fade-in border border-white/10 mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#4ade80]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-3 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* BULK ACTION TOOLBAR (VISIBLE WHEN 1+ ITEMS ARE SELECTED) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#094cb2] text-white rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in transition-all">
          {/* Selected Count & Select Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-label font-bold">
              <span className="material-symbols-outlined text-lg text-[#8cc2ff]">check_box</span>
              <span>
                {selectedIds.length} Selected
              </span>
            </div>

            <button
              onClick={handleToggleSelectAll}
              className="text-xs font-label text-[#d8eaff] hover:text-white underline cursor-pointer hidden sm:inline"
            >
              {allFilteredSelected ? 'Deselect All' : `Select All (${items.length})`}
            </button>
            <button
              onClick={handleSelectCurrentPage}
              className="text-xs font-label text-[#d8eaff] hover:text-white underline cursor-pointer hidden md:inline"
            >
              Select Page ({currentItems.length})
            </button>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Status Buttons */}
            <div className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-xl">
              <button
                onClick={() => handleQuickStatusChange('OK')}
                className="px-2.5 py-1 rounded-lg text-xs font-label font-bold bg-[#14833b] hover:bg-[#0f6a2e] text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Set status to OK"
              >
                <span className="material-symbols-outlined text-xs">check_circle</span>
                <span>Mark OK</span>
              </button>
              <button
                onClick={() => handleQuickStatusChange('Due Soon')}
                className="px-2.5 py-1 rounded-lg text-xs font-label font-bold bg-[#b58b00] hover:bg-[#8c6c00] text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Set status to Due Soon"
              >
                <span className="material-symbols-outlined text-xs">warning</span>
                <span>Mark Due Soon</span>
              </button>
              <button
                onClick={() => handleQuickStatusChange('Overdue')}
                className="px-2.5 py-1 rounded-lg text-xs font-label font-bold bg-[#ba1a1a] hover:bg-[#931313] text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Set status to Overdue"
              >
                <span className="material-symbols-outlined text-xs">error</span>
                <span>Mark Overdue</span>
              </button>
            </div>

            {/* Quick Log PM */}
            <button
              onClick={handleQuickLogBulk}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-label text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Quick Log PM</span>
            </button>

            {/* Custom Bulk Update Modal Trigger */}
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-white text-[#094cb2] hover:bg-[#edf4ff] font-label text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">edit_calendar</span>
              <span>Bulk Update...</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={handleClearSelection}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Clear Selection"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl ghost-border shadow-xs overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#c3c6d5]/20 bg-[#edf4ff]">
                {/* Select Checkbox Column */}
                <th className="py-3.5 px-3 sm:px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all equipment"
                    className="w-4 h-4 rounded-md border-gray-300 text-[#094cb2] focus:ring-[#094cb2] cursor-pointer"
                  />
                </th>

                <th className="py-3.5 px-3 sm:px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider w-14 text-center">
                  Status
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Equipment Name
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Area / Line
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider text-center">
                  Health Score
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Last PM
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  WO / PTW No
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Next Due
                </th>
                <th className="py-3.5 px-4 sm:px-6 font-label text-xs font-bold text-[#434653] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d5]/15">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#434653]">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">
                      find_in_page
                    </span>
                    <p className="font-label text-sm font-semibold">No equipment matching current filter criteria.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const isOverdue = item.status === 'Overdue';
                  const isDueSoon = item.status === 'Due Soon';
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className={`hover:bg-[#edf4ff]/70 transition-colors group cursor-pointer ${
                        isSelected
                          ? 'bg-[#d8eaff]/50 font-medium'
                          : isOverdue
                          ? 'border-l-4 border-l-[#ba1a1a] bg-[#ffdad6]/10'
                          : isDueSoon
                          ? 'border-l-4 border-l-[#bfab49] bg-[#bfab49]/5'
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Checkbox Cell */}
                      <td
                        className="py-4 px-3 sm:px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(item.id, e)}
                          aria-label={`Select ${item.name}`}
                          className="w-4 h-4 rounded-md border-gray-300 text-[#094cb2] focus:ring-[#094cb2] cursor-pointer"
                        />
                      </td>

                      {/* Status Badge Icon */}
                      <td className="py-4 px-3 sm:px-4 text-center">
                        {item.status === 'OK' && (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d9e2ff] text-[#094cb2]"
                            title="OK / Up to Date"
                          >
                            <span className="material-symbols-outlined text-lg filled">check_circle</span>
                          </span>
                        )}

                        {isDueSoon && (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f9e37a] text-[#6d5e00]"
                            title="Due Soon"
                          >
                            <span className="material-symbols-outlined text-lg filled">warning</span>
                          </span>
                        )}

                        {isOverdue && (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a]"
                            title="Overdue"
                          >
                            <span className="material-symbols-outlined text-lg filled">error</span>
                          </span>
                        )}
                      </td>

                      {/* Equipment Name & Code */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-[#001d32] text-sm sm:text-base group-hover:text-[#094cb2] transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-[#434653] font-mono">{item.code}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#edf4ff] text-[#094cb2] text-[11px] font-label font-semibold border border-[#094cb2]/10">
                            {item.pmType}
                          </span>
                        </div>
                      </td>

                      {/* Area & Line */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="text-xs sm:text-sm text-[#001d32] font-semibold">{item.area}</div>
                        <div className="text-xs text-[#434653] mt-0.5">{item.line}</div>
                      </td>

                      {/* Health Score Badge */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        {(() => {
                          const hs = calculateEquipmentHealthScore(item);
                          return (
                            <span
                              style={{ backgroundColor: hs.badgeBg, color: hs.badgeText }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label font-bold border border-black/5"
                              title={hs.recommendedAction}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hs.color }} />
                              <span>{hs.score}%</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Last PM */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="text-xs sm:text-sm text-[#001d32]">{item.lastPmDate}</div>
                        <div className="text-xs text-[#434653]/70 mt-0.5">{item.daysAgoText}</div>
                      </td>

                      {/* WO / PTW */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="text-xs sm:text-sm font-mono text-[#001d32]">
                          {item.workOrder || item.lastWoPtw.split('/')[0]}
                        </div>
                        <div className="text-xs text-[#434653] font-mono">
                          {item.ptwNo || item.lastWoPtw.split('/')[1] || ''}
                        </div>
                      </td>

                      {/* Next Due */}
                      <td className="py-4 px-4 sm:px-6">
                        <div
                          className={`text-xs sm:text-sm font-bold flex items-center gap-1 ${
                            isOverdue
                              ? 'text-[#ba1a1a]'
                              : isDueSoon
                              ? 'text-[#6d5e00]'
                              : 'text-[#094cb2]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isOverdue ? 'event_busy' : 'schedule'}
                          </span>
                          <span>{item.nextDueDate}</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onEditEquipment && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEquipment(item);
                              }}
                              className="p-1.5 rounded-lg text-[#434653] hover:text-[#094cb2] hover:bg-[#edf4ff] transition-all cursor-pointer"
                              title="Edit Equipment Name & Code"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickLog(item);
                            }}
                            className="text-[#094cb2] hover:text-[#3366cc] font-label text-xs sm:text-sm font-bold inline-flex items-center justify-end gap-1 px-3 py-1.5 rounded-lg hover:bg-[#d8eaff] transition-all cursor-pointer"
                          >
                            <span>Log PM</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="bg-white border-t border-[#c3c6d5]/20 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs sm:text-sm text-[#434653] font-medium font-label">
            Showing {items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, items.length)} of {items.length} entries
            {selectedIds.length > 0 && (
              <span className="ml-2 font-bold text-[#094cb2]">
                ({selectedIds.length} selected)
              </span>
            )}
          </span>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#c3c6d5]/30 hover:bg-[#edf4ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#434653] cursor-pointer"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-3 py-1 text-xs font-label font-bold text-[#094cb2] bg-[#edf4ff] rounded-lg flex items-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#c3c6d5]/30 hover:bg-[#edf4ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#434653] cursor-pointer"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedCount={selectedIds.length}
        onApply={handleApplyModalUpdate}
      />
    </div>
  );
};
