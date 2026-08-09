import React, { useState } from 'react';

export interface BulkUpdateData {
  status?: 'OK' | 'Due Soon' | 'Overdue';
  lastPmDate?: string;
  nextDueDate?: string;
  workOrder?: string;
  ptwNo?: string;
  notes?: string;
}

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onApply: (data: BulkUpdateData) => void;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onApply,
}) => {
  const [updateStatus, setUpdateStatus] = useState<string>('keep'); // 'keep', 'OK', 'Due Soon', 'Overdue'
  const [lastPmDate, setLastPmDate] = useState<string>('');
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [workOrder, setWorkOrder] = useState<string>('');
  const [ptwNo, setPtwNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: BulkUpdateData = {};
    if (updateStatus !== 'keep') {
      data.status = updateStatus as 'OK' | 'Due Soon' | 'Overdue';
    }
    if (lastPmDate.trim()) data.lastPmDate = lastPmDate;
    if (nextDueDate.trim()) data.nextDueDate = nextDueDate;
    if (workOrder.trim()) data.workOrder = workOrder;
    if (ptwNo.trim()) data.ptwNo = ptwNo;
    if (notes.trim()) data.notes = notes;

    onApply(data);
    onClose();
  };

  const setTodayLastPm = () => {
    const today = new Date().toISOString().split('T')[0];
    setLastPmDate(today);

    // Auto set next due date 6 months ahead
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setNextDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#c3c6d5]/30">
        {/* Modal Header */}
        <div className="bg-[#094cb2] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl">checklist</span>
            <div>
              <h3 className="font-headline font-bold text-lg leading-tight">Bulk Update Equipment</h3>
              <p className="font-label text-xs text-[#d8eaff]">
                Updating <span className="font-bold underline">{selectedCount}</span> selected item{selectedCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-body text-sm text-[#001d32]">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-label font-bold text-[#434653] uppercase mb-1.5">
              Change Status
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer"
            >
              <option value="keep">-- Keep Current Status --</option>
              <option value="OK">OK / Up to Date</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <span className="text-xs font-label text-[#434653] font-semibold">Presets:</span>
            <button
              type="button"
              onClick={setTodayLastPm}
              className="text-xs font-label font-bold text-[#094cb2] bg-[#edf4ff] hover:bg-[#d8eaff] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Set Last PM = Today (+6 Months Due)
            </button>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label font-bold text-[#434653] uppercase mb-1.5">
                New Last PM Date
              </label>
              <input
                type="date"
                value={lastPmDate}
                onChange={(e) => setLastPmDate(e.target.value)}
                className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl px-3 py-2 text-sm text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50"
              />
              <span className="text-[10px] text-[#434653]">Leave blank to keep current</span>
            </div>

            <div>
              <label className="block text-xs font-label font-bold text-[#434653] uppercase mb-1.5">
                New Next Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl px-3 py-2 text-sm text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50"
              />
              <span className="text-[10px] text-[#434653]">Leave blank to keep current</span>
            </div>
          </div>

          {/* Work Order & PTW Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label font-bold text-[#434653] uppercase mb-1.5">
                Work Order No (WO)
              </label>
              <input
                type="text"
                placeholder="e.g. WO-2026-9001"
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
                className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl px-3.5 py-2 text-sm text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 font-mono placeholder:font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-label font-bold text-[#434653] uppercase mb-1.5">
                PTW Permit No
              </label>
              <input
                type="text"
                placeholder="e.g. PTW-B-404"
                value={ptwNo}
                onChange={(e) => setPtwNo(e.target.value)}
                className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl px-3.5 py-2 text-sm text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 font-mono placeholder:font-sans"
              />
            </div>
          </div>

          {/* Technician Notes */}
          <div>
            <label className="block text-xs font-label font-bold text-[#434653] uppercase mb-1.5">
              Technician Notes / Log History Entry
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Executed bulk calibration and routine PM inspection across line equipment."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl p-3 text-sm text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c3c6d5]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#c3c6d5]/40 text-[#434653] hover:bg-gray-100 font-label font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#094cb2] hover:bg-[#073988] text-white font-label font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">task_alt</span>
              <span>Apply to {selectedCount} Item{selectedCount > 1 ? 's' : ''}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
