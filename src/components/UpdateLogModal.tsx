import React, { useState, useEffect } from 'react';
import { EquipmentItem, Area } from '../types';

interface UpdateLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEquipment?: EquipmentItem | null;
  onSave: (logData: {
    workOrder: string;
    ptwNo: string;
    area: Area;
    line: string;
    pmType: string;
    lastPmDate: string;
    frequencyMonths: number;
    nextDueDate: string;
    isCompleted: boolean;
  }) => void;
}

export const UpdateLogModal: React.FC<UpdateLogModalProps> = ({
  isOpen,
  onClose,
  selectedEquipment,
  onSave,
}) => {
  const [workOrder, setWorkOrder] = useState('');
  const [ptwNo, setPtwNo] = useState('');
  const [area, setArea] = useState<Area | ''>('');
  const [line, setLine] = useState('');
  const [pmType, setPmType] = useState('');
  const [lastPmDate, setLastPmDate] = useState('');
  const [frequencyMonths, setFrequencyMonths] = useState<number>(3);
  const [nextDueDate, setNextDueDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(true);

  // Pre-fill form if editing an existing unit
  useEffect(() => {
    if (selectedEquipment) {
      setWorkOrder(selectedEquipment.workOrder || 'WO-2026-0891');
      setPtwNo(selectedEquipment.ptwNo || 'PTW-442-A');
      setArea(selectedEquipment.area);
      setLine(selectedEquipment.line);
      setPmType(selectedEquipment.pmType);
      setLastPmDate(selectedEquipment.lastPmDate || new Date().toISOString().split('T')[0]);
      setFrequencyMonths(selectedEquipment.frequencyMonths || 3);
    } else {
      setWorkOrder('');
      setPtwNo('');
      setArea('');
      setLine('');
      setPmType('');
      const today = new Date().toISOString().split('T')[0];
      setLastPmDate(today);
      setFrequencyMonths(3);
      setIsCompleted(true);
    }
  }, [selectedEquipment, isOpen]);

  // Auto-calculate Next Due Date
  useEffect(() => {
    if (lastPmDate && frequencyMonths) {
      const date = new Date(lastPmDate);
      if (!isNaN(date.getTime())) {
        date.setMonth(date.getMonth() + Number(frequencyMonths));
        setNextDueDate(date.toISOString().split('T')[0]);
      }
    }
  }, [lastPmDate, frequencyMonths]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder || !ptwNo || !area) {
      alert('Please fill in required fields (Work Order No, PTW No, and Area).');
      return;
    }

    onSave({
      workOrder,
      ptwNo,
      area: area as Area,
      line: line || 'Line 1',
      pmType: pmType || 'Check Weigher Calibration',
      lastPmDate,
      frequencyMonths,
      nextDueDate,
      isCompleted,
    });

    onClose();
  };

  const getLinesForArea = (selectedArea: string) => {
    switch (selectedArea) {
      case 'North Logistics':
        return ['Line 1', 'Line 2'];
      case 'South Logistics':
        return ['Line A', 'Line B', 'Line C', 'Line D'];
      case 'Dock Area':
        return ['Dock Bay 1', 'Dock Bay 2', 'Dock Leveler Area'];
      default:
        return [];
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#001d32]/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c3c6d5]/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 border-b border-[#edf4ff] flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#001d32]">
                Update PM Log
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#434653] mt-0.5">
                Record new preventive maintenance data and schedule next cycle.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-[#434653] hover:text-[#001d32] transition-colors rounded-full p-2 hover:bg-[#edf4ff] cursor-pointer"
              title="Close Modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} id="pm-form" className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 space-y-6">
            {/* IDENTIFIERS SECTION */}
            <div className="space-y-4">
              <h3 className="font-label text-xs sm:text-sm font-bold text-[#094cb2] uppercase tracking-wider">
                Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Work Order No */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="wo-no">
                    Work Order No <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="wo-no"
                    type="text"
                    required
                    value={workOrder}
                    onChange={(e) => setWorkOrder(e.target.value)}
                    placeholder="e.g. WO-2026-0891"
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 transition-colors placeholder:text-[#434653]/50"
                  />
                </div>

                {/* PTW No */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="ptw-no">
                    PTW No <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="ptw-no"
                    type="text"
                    required
                    value={ptwNo}
                    onChange={(e) => setPtwNo(e.target.value)}
                    placeholder="e.g. PTW-442-A"
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 transition-colors placeholder:text-[#434653]/50"
                  />
                </div>
              </div>
            </div>

            <hr className="border-t border-[#edf4ff]" />

            {/* LOCATION & EQUIPMENT SECTION */}
            <div className="space-y-4">
              <h3 className="font-label text-xs sm:text-sm font-bold text-[#094cb2] uppercase tracking-wider">
                Location & Equipment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Area */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="area">
                    Area
                  </label>
                  <select
                    id="area"
                    value={area}
                    onChange={(e) => {
                      const newArea = e.target.value as Area;
                      setArea(newArea);
                      setLine('');
                    }}
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 cursor-pointer"
                  >
                    <option value="" disabled>Select Area</option>
                    <option value="North Logistics">North Logistics</option>
                    <option value="South Logistics">South Logistics</option>
                    <option value="Dock Area">Dock Area</option>
                  </select>
                </div>

                {/* Select Line */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="line">
                    Line
                  </label>
                  <select
                    id="line"
                    disabled={!area}
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 cursor-pointer disabled:opacity-50 disabled:bg-[#f7f9ff]"
                  >
                    <option value="" disabled>
                      {area ? 'Select Line' : 'Select Area First'}
                    </option>
                    {getLinesForArea(area).map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PM Type */}
                <div className="flex flex-col space-y-1.5 md:col-span-2">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="pm-type">
                    PM Type
                  </label>
                  <select
                    id="pm-type"
                    value={pmType}
                    onChange={(e) => setPmType(e.target.value)}
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 cursor-pointer"
                  >
                    <option value="" disabled>Select PM Type</option>
                    <option value="Check Weigher Calibration">Check Weigher Calibration</option>
                    <option value="Net Weigher Calibration">Net Weigher Calibration</option>
                    <option value="Metal Detector Calibration">Metal Detector Calibration</option>
                    <option value="Routine PM">Routine PM</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-t border-[#edf4ff]" />

            {/* SCHEDULING SECTION */}
            <div className="space-y-4">
              <h3 className="font-label text-xs sm:text-sm font-bold text-[#094cb2] uppercase tracking-wider">
                Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Last PM Date */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="last-pm-date">
                    Last PM Date
                  </label>
                  <input
                    id="last-pm-date"
                    type="date"
                    value={lastPmDate}
                    onChange={(e) => setLastPmDate(e.target.value)}
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 cursor-pointer"
                  />
                </div>

                {/* Frequency */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="frequency">
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    value={frequencyMonths}
                    onChange={(e) => setFrequencyMonths(Number(e.target.value))}
                    className="bg-white border border-[#c3c6d5]/60 text-[#001d32] text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-[#094cb2]/50 focus:border-[#094cb2] block w-full p-3 cursor-pointer"
                  >
                    <option value={1}>1 Month (Monthly)</option>
                    <option value={3}>3 Months (Quarterly)</option>
                    <option value={6}>6 Months (Bi-annual)</option>
                    <option value={12}>12 Months (Yearly)</option>
                  </select>
                </div>

                {/* Next Due Date (Auto-calculated) */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-label text-xs sm:text-sm font-semibold text-[#434653]" htmlFor="next-due-date">
                    Next Due Date
                  </label>
                  <div className="relative bg-[#edf4ff] rounded-xl border border-[#094cb2]/20 p-3">
                    <input
                      id="next-due-date"
                      type="text"
                      readOnly
                      value={nextDueDate || 'Auto-calculated'}
                      className="bg-transparent text-[#094cb2] font-bold text-xs sm:text-sm block w-full focus:outline-none cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center text-[#094cb2]">
                      <span className="material-symbols-outlined text-base">event_upcoming</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-[#edf4ff]" />

            {/* STATUS TOGGLE SECTION */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-label text-xs sm:text-sm font-bold text-[#001d32]">
                  Execution Status
                </h3>
                <p className="font-body text-xs text-[#434653] mt-0.5">
                  Mark this PM as completed if all tasks are verified.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c3c6d5]/40 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#094cb2]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#094cb2]" />
                <span className="ml-3 font-label text-xs sm:text-sm font-bold text-[#001d32]">
                  {isCompleted ? 'Completed (OK)' : 'Pending'}
                </span>
              </label>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="px-6 sm:px-8 py-4 bg-[#f7f9ff] flex items-center justify-end space-x-3 border-t border-[#edf4ff] sticky bottom-0 z-10">
            <button
              onClick={onClose}
              type="button"
              className="font-label text-xs sm:text-sm font-bold text-[#434653] hover:text-[#001d32] px-5 py-2.5 rounded-xl transition-colors hover:bg-[#edf4ff] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="pm-form"
              className="font-label text-xs sm:text-sm font-bold text-white btn-primary px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Save Log</span>
              <span className="material-symbols-outlined text-base">save</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
