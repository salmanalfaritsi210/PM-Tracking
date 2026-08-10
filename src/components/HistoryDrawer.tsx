import React, { useState, useEffect } from 'react';
import { EquipmentItem, MaintenanceHistoryEntry, EquipmentSpecs } from '../types';
import { SmartAiInsights } from './SmartAiInsights';
import { calculateEquipmentHealthScore } from '../lib/healthScore';
import { hapticSuccess, hapticWarning, hapticLight, hapticMedium } from '../utils/haptics';

interface HistoryDrawerProps {
  item: EquipmentItem | null;
  onClose: () => void;
  onAddHistoryEntry: (equipmentId: string, entry: Omit<MaintenanceHistoryEntry, 'id'>) => void;
  onDeleteHistoryEntry?: (equipmentId: string, logId: string) => void;
  onOpenUpdateModal: (item: EquipmentItem) => void;
  onUpdateSpecs?: (equipmentId: string, specs: EquipmentSpecs) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  item,
  onClose,
  onAddHistoryEntry,
  onDeleteHistoryEntry,
  onOpenUpdateModal,
  onUpdateSpecs,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'specs' | 'telemetry'>('history');
  const [newNoteText, setNewNoteText] = useState('');
  const [newWorkOrder, setNewWorkOrder] = useState('');
  const [newPtw, setNewPtw] = useState('');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Specification Edit States
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [specCalibrationWeights, setSpecCalibrationWeights] = useState('');
  const [specSensorType, setSpecSensorType] = useState('');
  const [specIpRating, setSpecIpRating] = useState('');
  const [specSerialNumber, setSpecSerialNumber] = useState('');
  const [specLastCertification, setSpecLastCertification] = useState('');

  useEffect(() => {
    if (item?.specs) {
      setSpecCalibrationWeights(item.specs.calibrationWeights || '');
      setSpecSensorType(item.specs.sensorType || '');
      setSpecIpRating(item.specs.ipRating || '');
      setSpecSerialNumber(item.specs.serialNumber || '');
      setSpecLastCertification(item.specs.lastCertification || '');
    } else if (item) {
      setSpecCalibrationWeights('Standard Weights (10g - 1kg)');
      setSpecSensorType('Precision Load Cell');
      setSpecIpRating('IP67 Washdown Grade');
      setSpecSerialNumber(item.code);
      setSpecLastCertification(item.lastPmDate);
    }
  }, [item]);

  const handleSaveSpecsForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !onUpdateSpecs) return;
    hapticSuccess();
    onUpdateSpecs(item.id, {
      calibrationWeights: specCalibrationWeights || 'Standard Weights (10g - 1kg)',
      sensorType: specSensorType || 'Precision Load Cell',
      ipRating: specIpRating || 'IP67 Washdown Grade',
      serialNumber: specSerialNumber || item.code,
      lastCertification: specLastCertification || item.lastPmDate,
    });
    setIsEditingSpecs(false);
  };

  if (!item) return null;

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    hapticSuccess();

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    onAddHistoryEntry(item.id, {
      date: todayStr,
      status: 'Completed',
      workOrder: newWorkOrder || item.workOrder || 'WO-2026-LOG',
      permitPtw: newPtw || item.ptwNo || 'PTW-2026-LOG',
      technicianNotes: newNoteText,
    });

    setNewNoteText('');
    setNewWorkOrder('');
    setNewPtw('');
    setShowAddNoteForm(false);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#001d32]/30 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-300"
      />

      {/* Drawer Container (Mobile Bottom Sheet & Desktop Right Drawer) */}
      <aside className="fixed bottom-0 right-0 left-0 sm:left-auto sm:top-0 h-[88vh] sm:h-screen sm:max-h-none w-full sm:w-[520px] bg-white rounded-t-3xl sm:rounded-none shadow-2xl z-50 flex flex-col border-t sm:border-t-0 sm:border-l border-[#c3c6d5]/20 animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-[#c3c6d5]/70 rounded-full mx-auto my-2.5 sm:hidden shrink-0 cursor-pointer" onClick={onClose} />

        {/* Drawer Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 bg-white z-10 flex flex-col shrink-0 border-b border-[#edf4ff]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e2efff] flex items-center justify-center text-[#094cb2] shadow-2xs">
                <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
              </div>
              <div>
                <p className="font-label text-xs font-bold text-[#094cb2] uppercase tracking-widest mb-0.5">
                  Equipment Details
                </p>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#001d32] leading-tight pr-2">
                  {item.name}
                </h2>
                <p className="text-xs font-mono text-[#434653] font-semibold mt-0.5">
                  Code: {item.code} • Area: {item.area} ({item.line})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  hapticMedium();
                  onOpenUpdateModal(item);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#edf4ff] hover:bg-[#094cb2] text-[#094cb2] hover:text-white transition-all text-xs font-label font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Edit Equipment Name & Location Code"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span>Edit Info</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#edf4ff] transition-colors text-[#434653] hover:text-[#001d32] cursor-pointer"
                title="Close Drawer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Contextual Tabs inside Drawer */}
          <div className="flex gap-6 border-b border-[#c3c6d5]/20 pb-0 mt-3">
            <button
              onClick={() => {
                hapticLight();
                setActiveTab('history');
              }}
              className={`font-label text-xs sm:text-sm font-bold pb-2.5 -mb-[1px] transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'text-[#094cb2] border-b-2 border-[#094cb2]'
                  : 'text-[#434653] hover:text-[#001d32]'
              }`}
            >
              Maintenance History ({item.history.length})
            </button>
            <button
              onClick={() => {
                hapticLight();
                setActiveTab('specs');
              }}
              className={`font-label text-xs sm:text-sm font-bold pb-2.5 -mb-[1px] transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'text-[#094cb2] border-b-2 border-[#094cb2]'
                  : 'text-[#434653] hover:text-[#001d32]'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => {
                hapticLight();
                setActiveTab('telemetry');
              }}
              className={`font-label text-xs sm:text-sm font-bold pb-2.5 -mb-[1px] transition-all cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'text-[#094cb2] border-b-2 border-[#094cb2]'
                  : 'text-[#434653] hover:text-[#001d32]'
              }`}
            >
              Live Telemetry
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 py-6 bg-white flex flex-col gap-5">
          {/* TAB 1: MAINTENANCE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Gemini AI Smart Insights Component */}
              <SmartAiInsights equipment={item} />

              {/* Add Quick Technician Note Toggle */}
              <div className="flex justify-between items-center mb-2 pt-2">
                <span className="font-label text-xs uppercase font-bold text-[#434653] tracking-wider">
                  Log Chronology
                </span>
                <button
                  onClick={() => setShowAddNoteForm(!showAddNoteForm)}
                  className="text-xs font-label font-bold text-[#094cb2] hover:text-[#3366cc] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showAddNoteForm ? 'remove_circle' : 'add_circle'}
                  </span>
                  <span>{showAddNoteForm ? 'Cancel Note' : 'Add Technician Note'}</span>
                </button>
              </div>

              {/* Add Note Form */}
              {showAddNoteForm && (
                <form
                  onSubmit={handleSaveNote}
                  className="p-4 rounded-xl bg-[#edf4ff] border border-[#094cb2]/30 space-y-3 animate-in fade-in duration-200"
                >
                  <h4 className="font-label text-xs font-bold text-[#094cb2] uppercase tracking-wider">
                    Add New Maintenance Inspection Log
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Work Order No (optional)"
                      value={newWorkOrder}
                      onChange={(e) => setNewWorkOrder(e.target.value)}
                      className="bg-white border border-[#c3c6d5]/40 rounded-lg p-2 text-xs font-body text-[#001d32]"
                    />
                    <input
                      type="text"
                      placeholder="PTW No (optional)"
                      value={newPtw}
                      onChange={(e) => setNewPtw(e.target.value)}
                      className="bg-white border border-[#c3c6d5]/40 rounded-lg p-2 text-xs font-body text-[#001d32]"
                    />
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter technician notes, calibration findings, test weight results..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full bg-white border border-[#c3c6d5]/40 rounded-lg p-2.5 text-xs sm:text-sm font-body text-[#001d32] focus:ring-1 focus:ring-[#094cb2]"
                  />
                  <button
                    type="submit"
                    className="w-full btn-primary font-label text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Save Note to History
                  </button>
                </form>
              )}

              {/* Log List */}
              {item.history.length === 0 ? (
                <div className="text-center py-8 text-[#434653]">
                  <p className="font-label text-xs">No prior maintenance logs logged for this unit.</p>
                </div>
              ) : (
                item.history.map((entry) => (
                  <article
                    key={entry.id}
                    className="p-5 rounded-2xl bg-[#f7f9ff] hover:bg-[#edf4ff] transition-all duration-200 group relative border border-[#c3c6d5]/20 shadow-2xs"
                  >
                    {/* Status accent for flagged items */}
                    {entry.status === 'Flagged' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#bfab49] rounded-l-2xl" />
                    )}

                    {/* Entry Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            entry.status === 'Completed'
                              ? 'bg-[#094cb2]'
                              : entry.status === 'Flagged'
                              ? 'bg-[#6d5e00]'
                              : 'bg-[#737784]'
                          }`}
                        />
                        <h3 className="font-label font-bold text-[#001d32] text-sm sm:text-base tracking-tight">
                          {entry.date}
                        </h3>
                      </div>

                      {/* Badge & Delete Action */}
                      <div className="flex items-center gap-2">
                        {entry.status === 'Completed' && (
                          <div className="bg-[#bfab49]/20 text-[#6d5e00] font-label text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#bfab49]/30">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>Completed</span>
                          </div>
                        )}

                        {entry.status === 'Archived' && (
                          <div className="bg-[#edf4ff] text-[#434653] font-label text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">history</span>
                            <span>Archived</span>
                          </div>
                        )}

                        {entry.status === 'Flagged' && (
                          <div className="bg-[#bfab49]/20 text-[#6d5e00] font-label text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#bfab49]/40">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            <span>Flagged</span>
                          </div>
                        )}

                        {onDeleteHistoryEntry && (
                          <button
                            onClick={() => setConfirmDeleteId(confirmDeleteId === entry.id ? null : entry.id)}
                            className="p-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors cursor-pointer"
                            title="Delete this log"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete Confirmation Prompt */}
                    {confirmDeleteId === entry.id && (
                      <div className="mb-3 p-2.5 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 flex items-center justify-between text-xs animate-in fade-in">
                        <span className="font-label font-bold text-[#ba1a1a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          Delete this log entry?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              onDeleteHistoryEntry?.(item.id, entry.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#ba1a1a] hover:bg-[#931313] text-white font-label font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-[#434653] font-label font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Metadata Row */}
                    <div className="flex gap-6 mb-3 pl-5">
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] uppercase text-[#434653] font-bold tracking-wider">
                          Work Order
                        </span>
                        <span className="font-mono text-xs font-medium text-[#001d32]">
                          {entry.workOrder}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] uppercase text-[#434653] font-bold tracking-wider">
                          Permit (PTW)
                        </span>
                        <span className="font-mono text-xs font-medium text-[#001d32]">
                          {entry.permitPtw}
                        </span>
                      </div>
                    </div>

                    {/* Technician Notes Card */}
                    <div className="pl-4 pr-4 py-3 bg-white rounded-xl border border-[#c3c6d5]/20 shadow-2xs relative">
                      <span className="material-symbols-outlined absolute top-3 right-3 text-[#c3c6d5]/30 text-3xl select-none pointer-events-none">
                        format_quote
                      </span>
                      <p className="font-label text-[10px] font-bold text-[#094cb2] uppercase tracking-widest mb-1">
                        Technician Notes
                      </p>
                      <p className="font-body text-xs sm:text-sm text-[#42474b] leading-relaxed">
                        {entry.technicianNotes}
                      </p>

                      {entry.followupWo && (
                        <div className="mt-3 pt-2 border-t border-[#edf4ff] flex items-center justify-between text-xs">
                          <span className="font-label text-[#434653]">
                            Follow-up created: <strong className="font-mono">{entry.followupWo}</strong>
                          </span>
                          <span className="font-label font-bold text-[#094cb2] underline">View Ticket</span>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#f7f9ff] border border-[#c3c6d5]/20 space-y-4">
                <div className="flex justify-between items-center border-b border-[#edf4ff] pb-2">
                  <h4 className="font-label text-xs font-bold text-[#094cb2] uppercase tracking-widest">
                    Technical Specifications & Calibration Standards
                  </h4>
                  <button
                    onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                    className="px-2.5 py-1 rounded-lg bg-[#edf4ff] hover:bg-[#094cb2] text-[#094cb2] hover:text-white transition-all text-xs font-label font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">{isEditingSpecs ? 'close' : 'edit'}</span>
                    <span>{isEditingSpecs ? 'Cancel' : 'Edit Specs'}</span>
                  </button>
                </div>

                {isEditingSpecs ? (
                  <form onSubmit={handleSaveSpecsForm} className="space-y-3 pt-1">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[#434653] font-label text-[11px] uppercase font-bold">
                        Calibration Test Weights
                      </label>
                      <input
                        type="text"
                        value={specCalibrationWeights}
                        onChange={(e) => setSpecCalibrationWeights(e.target.value)}
                        className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-[#094cb2]/50"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[#434653] font-label text-[11px] uppercase font-bold">
                        Sensor Type
                      </label>
                      <input
                        type="text"
                        value={specSensorType}
                        onChange={(e) => setSpecSensorType(e.target.value)}
                        className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-[#094cb2]/50"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[#434653] font-label text-[11px] uppercase font-bold">
                        IP Protection Rating
                      </label>
                      <input
                        type="text"
                        value={specIpRating}
                        onChange={(e) => setSpecIpRating(e.target.value)}
                        className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-[#094cb2]/50"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[#434653] font-label text-[11px] uppercase font-bold">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={specSerialNumber}
                        onChange={(e) => setSpecSerialNumber(e.target.value)}
                        className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-[#094cb2]/50"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[#434653] font-label text-[11px] uppercase font-bold">
                        Last External Certification
                      </label>
                      <input
                        type="text"
                        value={specLastCertification}
                        onChange={(e) => setSpecLastCertification(e.target.value)}
                        className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-[#094cb2]/50"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 btn-primary text-xs font-label font-bold py-2 rounded-xl cursor-pointer"
                      >
                        Save Specifications
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingSpecs(false)}
                        className="px-3 bg-gray-200 hover:bg-gray-300 text-[#434653] text-xs font-label font-bold py-2 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-[#434653] font-label text-[11px] block uppercase font-bold">
                        Calibration Test Weights
                      </span>
                      <span className="font-semibold text-[#001d32]">
                        {item.specs?.calibrationWeights || 'Standard Weights (10g - 1kg)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#434653] font-label text-[11px] block uppercase font-bold">
                        Sensor Type
                      </span>
                      <span className="font-semibold text-[#001d32]">
                        {item.specs?.sensorType || 'Precision Load Cell'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#434653] font-label text-[11px] block uppercase font-bold">
                        IP Protection Rating
                      </span>
                      <span className="font-semibold text-[#001d32]">
                        {item.specs?.ipRating || 'IP67 Washdown Grade'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#434653] font-label text-[11px] block uppercase font-bold">
                        Serial Number
                      </span>
                      <span className="font-mono font-semibold text-[#001d32]">
                        {item.specs?.serialNumber || item.code}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[#434653] font-label text-[11px] block uppercase font-bold">
                        Last External Certification
                      </span>
                      <span className="font-semibold text-[#001d32]">
                        {item.specs?.lastCertification || item.lastPmDate}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#f7f9ff] border border-[#c3c6d5]/20 space-y-4">
                <div className="flex justify-between items-center border-b border-[#edf4ff] pb-2">
                  <h4 className="font-label text-xs font-bold text-[#094cb2] uppercase tracking-widest">
                    Real-time Sensor Telemetry
                  </h4>
                  <span className="flex items-center gap-1.5 text-xs font-label text-[#094cb2] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 bg-white rounded-xl border border-[#c3c6d5]/20">
                    <span className="text-[#434653] font-label text-[10px] block uppercase font-bold">
                      Current Reading
                    </span>
                    <span className="font-bold text-lg text-[#094cb2]">
                      {item.telemetry?.liveWeight || '500.0 g'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#c3c6d5]/20">
                    <span className="text-[#434653] font-label text-[10px] block uppercase font-bold">
                      DSP Signal
                    </span>
                    <span className="font-bold text-lg text-[#001d32]">
                      {item.telemetry?.dspSignal || '99.8%'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#c3c6d5]/20">
                    <span className="text-[#434653] font-label text-[10px] block uppercase font-bold">
                      Operating Temp
                    </span>
                    <span className="font-bold text-base text-[#001d32]">
                      {item.telemetry?.temperature || '22.1 °C'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#c3c6d5]/20">
                    <span className="text-[#434653] font-label text-[10px] block uppercase font-bold">
                      Conveyor Speed
                    </span>
                    <span className="font-bold text-base text-[#001d32]">
                      {item.telemetry?.beltSpeed || '1.2 m/s'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#c3c6d5]/20 flex items-center justify-between">
                  <span className="text-xs font-label text-[#434653] font-bold">System Stability</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-label bg-[#cde5ff] text-[#094cb2]">
                    {item.telemetry?.stability || 'Stable'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-[#c3c6d5]/20 bg-white mt-auto shrink-0 flex items-center justify-between gap-3">
          <p className="font-label text-xs text-[#434653]">
            Showing <strong>{item.history.length}</strong> log entries
          </p>

          <button
            onClick={() => {
              onOpenUpdateModal(item);
              onClose();
            }}
            className="px-5 py-2.5 btn-primary font-label font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Update Full PM</span>
          </button>
        </div>
      </aside>
    </>
  );
};
