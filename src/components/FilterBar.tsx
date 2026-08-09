import React from 'react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenUpdateModal: () => void;
  onClearFilters: () => void;
  totalFilteredCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onOpenUpdateModal,
  onClearFilters,
  totalFilteredCount,
}) => {
  const handleSelectChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const isFiltered =
    filters.area !== 'All' ||
    filters.line !== 'All' ||
    filters.pmType !== 'All' ||
    filters.status !== 'All' ||
    filters.dateRange !== 'All' ||
    (filters.sortBy && filters.sortBy !== 'Default') ||
    filters.search !== '';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl ghost-border shadow-xs mb-8 transition-all">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Area Filter */}
          <div className="flex-1 sm:flex-none min-w-[130px]">
            <select
              value={filters.area}
              onChange={(e) => handleSelectChange('area', e.target.value)}
              className="w-full bg-[#edf4ff] border-none rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-label text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer shadow-2xs font-medium"
            >
              <option value="All">Area: All</option>
              <option value="North Logistics">North Logistics</option>
              <option value="South Logistics">South Logistics</option>
              <option value="Dock Area">Dock Area</option>
            </select>
          </div>

          {/* Line Filter */}
          <div className="flex-1 sm:flex-none min-w-[120px]">
            <select
              value={filters.line}
              onChange={(e) => handleSelectChange('line', e.target.value)}
              className="w-full bg-[#edf4ff] border-none rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-label text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer shadow-2xs font-medium"
            >
              <option value="All">Line: All</option>
              <option value="Line 1">Line 1</option>
              <option value="Line 2">Line 2</option>
              <option value="Line A">Line A</option>
              <option value="Line B">Line B</option>
              <option value="Line C">Line C</option>
              <option value="Line D">Line D</option>
            </select>
          </div>

          {/* PM Type Filter */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <select
              value={filters.pmType}
              onChange={(e) => handleSelectChange('pmType', e.target.value)}
              className="w-full bg-[#edf4ff] border-none rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-label text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer shadow-2xs font-medium"
            >
              <option value="All">Type: All</option>
              <option value="Check Weigher Calibration">Check Weigher Calibration</option>
              <option value="Net Weigher Calibration">Net Weigher Calibration</option>
              <option value="Metal Detector Calibration">Metal Detector Calibration</option>
              <option value="Routine PM">Routine PM</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-none min-w-[130px]">
            <select
              value={filters.status}
              onChange={(e) => handleSelectChange('status', e.target.value)}
              className="w-full bg-[#edf4ff] border-none rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-label text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer shadow-2xs font-medium"
            >
              <option value="All">Status: All</option>
              <option value="OK">OK / Up to Date</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <select
              value={filters.dateRange}
              onChange={(e) => handleSelectChange('dateRange', e.target.value)}
              className="w-full bg-[#edf4ff] border-none rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-label text-[#001d32] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer shadow-2xs font-medium"
            >
              <option value="All">Date: All Time</option>
              <option value="Next 30 Days">Next 30 Days</option>
              <option value="Next 60 Days">Next 60 Days</option>
              <option value="Overdue">Overdue Only</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex-1 sm:flex-none min-w-[160px]">
            <select
              value={filters.sortBy || 'Default'}
              onChange={(e) => handleSelectChange('sortBy', e.target.value)}
              className="w-full bg-[#e3edff] border border-[#094cb2]/20 rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-label text-[#094cb2] focus:ring-2 focus:ring-[#094cb2]/50 cursor-pointer shadow-2xs font-bold"
            >
              <option value="Default">Sort: Default (PM Type)</option>
              <option value="PM Type">Sort: PM Type</option>
              <option value="Next Due Date">Sort: Next Due Date</option>
              <option value="Status">Sort: Status</option>
              <option value="Alphabetical Name">Sort: Alphabetical Name</option>
            </select>
          </div>

          {/* Clear Button */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#d8eaff] hover:bg-[#cde5ff] text-[#094cb2] text-xs sm:text-sm font-label font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Action Button & Active Filter Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#edf4ff]">
          {totalFilteredCount !== undefined && (
            <span className="text-xs font-label text-[#434653] font-semibold">
              Found <strong className="text-[#094cb2]">{totalFilteredCount}</strong> items
            </span>
          )}

          <button
            onClick={onOpenUpdateModal}
            className="btn-primary font-label text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Update New PM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
