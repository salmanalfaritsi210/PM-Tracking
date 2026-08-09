import React, { useState } from 'react';
import { EquipmentItem } from '../types';

interface FlatLogEntry {
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  area: string;
  line: string;
  logId: string;
  date: string;
  status: string;
  workOrder: string;
  permitPtw: string;
  technicianNotes: string;
}

interface HistoryLogsViewProps {
  equipmentList: EquipmentItem[];
  onDeleteLog: (equipmentId: string, logId: string) => void;
  onClearAllLogs?: () => void;
  onSelectEquipment: (item: EquipmentItem) => void;
}

export const HistoryLogsView: React.FC<HistoryLogsViewProps> = ({
  equipmentList,
  onDeleteLog,
  onClearAllLogs,
  onSelectEquipment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flatten all history logs from all equipment items
  const allLogs: FlatLogEntry[] = [];
  equipmentList.forEach((eq) => {
    (eq.history || []).forEach((h) => {
      allLogs.push({
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentCode: eq.code,
        area: eq.area,
        line: eq.line,
        logId: h.id,
        date: h.date,
        status: h.status,
        workOrder: h.workOrder,
        permitPtw: h.permitPtw,
        technicianNotes: h.technicianNotes,
      });
    });
  });

  // Filter logs by search term
  const filteredLogs = allLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.equipmentName.toLowerCase().includes(q) ||
      log.equipmentCode.toLowerCase().includes(q) ||
      log.workOrder.toLowerCase().includes(q) ||
      log.permitPtw.toLowerCase().includes(q) ||
      log.technicianNotes.toLowerCase().includes(q) ||
      log.area.toLowerCase().includes(q) ||
      log.date.toLowerCase().includes(q)
    );
  });

  const handleDelete = (equipmentId: string, logId: string) => {
    onDeleteLog(equipmentId, logId);
    setDeleteConfirmId(null);
    setToastMessage('Maintenance log entry deleted successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Toast notification */}
      {toastMessage && (
        <div className="bg-[#001d32] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-label font-bold border border-white/10 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#4ade80]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white cursor-pointer ml-2"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header Search & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 ghost-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#434653] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search history logs, WO, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#edf4ff] border border-[#c3c6d5]/30 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-body text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 placeholder:text-[#434653]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-label font-bold text-[#434653]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#094cb2]">history</span>
            <span>Total Logs recorded: <strong className="text-[#094cb2]">{allLogs.length}</strong></span>
          </div>

          {allLogs.length > 0 && onClearAllLogs && (
            <div>
              {confirmClearAll ? (
                <div className="flex items-center gap-1.5 bg-[#ffdad6] p-1.5 rounded-xl border border-[#ba1a1a]/30 animate-fade-in">
                  <span className="text-[#ba1a1a] text-xs font-bold pl-1">Bersihkan semua {allLogs.length} log?</span>
                  <button
                    onClick={() => {
                      onClearAllLogs();
                      setConfirmClearAll(false);
                      setToastMessage('All maintenance history logs have been cleared.');
                      setTimeout(() => setToastMessage(null), 3500);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold hover:bg-[#931313] transition-colors cursor-pointer"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2 py-1 rounded-lg bg-gray-200 text-[#434653] text-xs font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6] font-label text-xs font-bold transition-colors cursor-pointer border border-[#ba1a1a]/20"
                >
                  <span className="material-symbols-outlined text-base">delete_sweep</span>
                  <span>Clear All Logs</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl ghost-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#c3c6d5]/20 bg-[#edf4ff]">
                <th className="py-3.5 px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3.5 px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Equipment
                </th>
                <th className="py-3.5 px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Location Area
                </th>
                <th className="py-3.5 px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  WO / PTW No
                </th>
                <th className="py-3.5 px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider">
                  Technician Notes
                </th>
                <th className="py-3.5 px-4 font-label text-xs font-bold text-[#434653] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d5]/15 text-xs sm:text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#434653]">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">
                      find_in_page
                    </span>
                    <p className="font-label text-sm font-semibold">No maintenance logs matching current search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const targetEq = equipmentList.find((e) => e.id === log.equipmentId);
                  const isConfirming = deleteConfirmId === log.logId;

                  return (
                    <tr
                      key={log.logId}
                      className="hover:bg-[#edf4ff]/60 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-bold text-[#001d32]">
                        {log.date}
                      </td>

                      {/* Equipment Name & Code */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => targetEq && onSelectEquipment(targetEq)}
                          className="font-bold text-[#094cb2] hover:underline cursor-pointer block text-left"
                        >
                          {log.equipmentName}
                        </button>
                        <span className="font-mono text-[11px] text-[#434653]">{log.equipmentCode}</span>
                      </td>

                      {/* Location Area */}
                      <td className="py-3.5 px-4 font-medium text-[#001d32]">
                        {log.area} ({log.line})
                      </td>

                      {/* WO / PTW */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#001d32]">
                        <div>{log.workOrder || '-'}</div>
                        <div className="text-[#434653]">{log.permitPtw || '-'}</div>
                      </td>

                      {/* Technician Notes */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#42474b]">
                        {log.technicianNotes}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        {isConfirming ? (
                          <div className="inline-flex items-center gap-1 bg-[#ffdad6] p-1 rounded-xl">
                            <span className="text-[11px] font-bold text-[#ba1a1a] px-1">Delete?</span>
                            <button
                              onClick={() => handleDelete(log.equipmentId, log.logId)}
                              className="px-2 py-0.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold hover:bg-[#931313] transition-colors cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-0.5 rounded-lg bg-gray-200 text-[#434653] text-xs font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(log.logId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors cursor-pointer font-label text-xs font-bold"
                            title="Delete this log entry"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                            <span>Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
