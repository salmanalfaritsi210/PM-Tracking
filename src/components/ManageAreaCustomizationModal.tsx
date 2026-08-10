import React, { useState } from 'react';
import { Area, AreaCustomizationMap } from '../types';
import { hapticSuccess, hapticWarning, hapticLight, hapticMedium } from '../utils/haptics';

interface ManageAreaCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaCustomization: AreaCustomizationMap;
  onSaveCustomization: (updatedMap: AreaCustomizationMap) => void;
  initialArea?: Area;
}

export const ManageAreaCustomizationModal: React.FC<ManageAreaCustomizationModalProps> = ({
  isOpen,
  onClose,
  areaCustomization,
  onSaveCustomization,
  initialArea = 'North Logistics',
}) => {
  const [selectedArea, setSelectedArea] = useState<Area>(initialArea);
  const [customMap, setCustomMap] = useState<AreaCustomizationMap>(areaCustomization);

  // New item inputs
  const [newLineInput, setNewLineInput] = useState('');
  const [newPmTypeInput, setNewPmTypeInput] = useState('');

  // Editing state
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [editingLineText, setEditingLineText] = useState('');

  const [editingPmTypeIndex, setEditingPmTypeIndex] = useState<number | null>(null);
  const [editingPmTypeText, setEditingPmTypeText] = useState('');

  // Update internal customMap when prop changes
  React.useEffect(() => {
    setCustomMap(areaCustomization);
  }, [areaCustomization, isOpen]);

  React.useEffect(() => {
    if (initialArea) {
      setSelectedArea(initialArea);
    }
  }, [initialArea, isOpen]);

  if (!isOpen) return null;

  const currentAreaConfig = customMap[selectedArea] || { lines: [], pmTypes: [] };

  // Handlers for Lines
  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLineInput.trim();
    if (!trimmed) return;

    if (currentAreaConfig.lines.includes(trimmed)) {
      alert(`"${trimmed}" already exists in ${selectedArea}.`);
      return;
    }

    const updatedLines = [...currentAreaConfig.lines, trimmed];
    const updatedMap = {
      ...customMap,
      [selectedArea]: {
        ...currentAreaConfig,
        lines: updatedLines,
      },
    };

    setCustomMap(updatedMap);
    onSaveCustomization(updatedMap);
    hapticSuccess();
    setNewLineInput('');
  };

  const handleStartEditLine = (index: number, currentText: string) => {
    hapticLight();
    setEditingLineIndex(index);
    setEditingLineText(currentText);
  };

  const handleSaveEditLine = (index: number) => {
    const trimmed = editingLineText.trim();
    if (!trimmed) return;

    const updatedLines = [...currentAreaConfig.lines];
    updatedLines[index] = trimmed;

    const updatedMap = {
      ...customMap,
      [selectedArea]: {
        ...currentAreaConfig,
        lines: updatedLines,
      },
    };

    setCustomMap(updatedMap);
    onSaveCustomization(updatedMap);
    hapticSuccess();
    setEditingLineIndex(null);
    setEditingLineText('');
  };

  const handleDeleteLine = (index: number) => {
    const lineToDelete = currentAreaConfig.lines[index];
    if (confirm(`Remove "${lineToDelete}" from ${selectedArea}?`)) {
      const updatedLines = currentAreaConfig.lines.filter((_, i) => i !== index);
      const updatedMap = {
        ...customMap,
        [selectedArea]: {
          ...currentAreaConfig,
          lines: updatedLines,
        },
      };

      setCustomMap(updatedMap);
      onSaveCustomization(updatedMap);
      hapticWarning();
    }
  };

  // Handlers for PM Types
  const handleAddPmType = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPmTypeInput.trim();
    if (!trimmed) return;

    if (currentAreaConfig.pmTypes.includes(trimmed)) {
      alert(`"${trimmed}" already exists in ${selectedArea}.`);
      return;
    }

    const updatedPmTypes = [...currentAreaConfig.pmTypes, trimmed];
    const updatedMap = {
      ...customMap,
      [selectedArea]: {
        ...currentAreaConfig,
        pmTypes: updatedPmTypes,
      },
    };

    setCustomMap(updatedMap);
    onSaveCustomization(updatedMap);
    hapticSuccess();
    setNewPmTypeInput('');
  };

  const handleStartEditPmType = (index: number, currentText: string) => {
    hapticLight();
    setEditingPmTypeIndex(index);
    setEditingPmTypeText(currentText);
  };

  const handleSaveEditPmType = (index: number) => {
    const trimmed = editingPmTypeText.trim();
    if (!trimmed) return;

    const updatedPmTypes = [...currentAreaConfig.pmTypes];
    updatedPmTypes[index] = trimmed;

    const updatedMap = {
      ...customMap,
      [selectedArea]: {
        ...currentAreaConfig,
        pmTypes: updatedPmTypes,
      },
    };

    setCustomMap(updatedMap);
    onSaveCustomization(updatedMap);
    hapticSuccess();
    setEditingPmTypeIndex(null);
    setEditingPmTypeText('');
  };

  const handleDeletePmType = (index: number) => {
    const pmTypeToDelete = currentAreaConfig.pmTypes[index];
    if (confirm(`Remove PM Type "${pmTypeToDelete}" from ${selectedArea}?`)) {
      const updatedPmTypes = currentAreaConfig.pmTypes.filter((_, i) => i !== index);
      const updatedMap = {
        ...customMap,
        [selectedArea]: {
          ...currentAreaConfig,
          pmTypes: updatedPmTypes,
        },
      };

      setCustomMap(updatedMap);
      onSaveCustomization(updatedMap);
      hapticWarning();
    }
  };

  const areasList: Area[] = ['North Logistics', 'South Logistics', 'Dock Area'];

  return (
    <>
      {/* Modal Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#001d32]/50 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#c3c6d5]/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 border-b border-[#edf4ff] bg-[#094cb2] text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <span className="material-symbols-outlined text-2xl text-white">tune</span>
              </div>
              <div>
                <h2 className="font-headline text-lg sm:text-xl font-bold leading-tight">
                  Customize Lines & PM Types
                </h2>
                <p className="font-body text-xs text-[#d8eaff]">
                  Linked and synchronized specifically for each selected area
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Area Selector Tabs */}
          <div className="bg-[#f7f9ff] px-6 sm:px-8 py-3 border-b border-[#edf4ff] flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-label font-bold text-[#434653] shrink-0 mr-1">
              Select Area:
            </span>
            {areasList.map((areaName) => {
              const isActive = selectedArea === areaName;
              return (
                <button
                  key={areaName}
                  onClick={() => {
                    setSelectedArea(areaName);
                    setEditingLineIndex(null);
                    setEditingPmTypeIndex(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-label font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#094cb2] text-white shadow-xs'
                      : 'bg-white border border-[#c3c6d5]/40 text-[#434653] hover:bg-[#edf4ff] hover:text-[#094cb2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {areaName === 'North Logistics'
                      ? 'pin_drop'
                      : areaName === 'South Logistics'
                      ? 'near_me'
                      : 'precision_manufacturing'}
                  </span>
                  <span>{areaName}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
            {/* AREA BADGE HEADER */}
            <div className="bg-[#edf4ff]/60 rounded-2xl p-4 border border-[#094cb2]/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-[#001d32] flex items-center gap-2">
                  <span>Customizing Options for:</span>
                  <span className="text-[#094cb2] underline underline-offset-4 font-extrabold">{selectedArea}</span>
                </h3>
                <p className="text-xs font-body text-[#434653] mt-0.5">
                  Lines and PM Types configured here will be automatically linked when users select <strong className="text-[#001d32]">{selectedArea}</strong>.
                </p>
              </div>
              <span className="text-xs font-label font-bold text-[#094cb2] bg-[#d8eaff] px-3 py-1.5 rounded-xl border border-[#094cb2]/20 hidden sm:inline-block">
                Synchronized
              </span>
            </div>

            {/* TWO COLUMNS: LOG LINES & PM TYPES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SECTION 1: LOG LINES */}
              <div className="bg-white rounded-2xl border border-[#c3c6d5]/40 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf4ff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#094cb2]">format_list_bulleted</span>
                    <h4 className="font-label font-bold text-sm text-[#001d32]">
                      Log Lines ({currentAreaConfig.lines.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-label font-semibold text-[#434653] bg-[#f7f9ff] px-2 py-0.5 rounded-lg border border-[#c3c6d5]/30">
                    Linked to {selectedArea}
                  </span>
                </div>

                {/* Line List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {currentAreaConfig.lines.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No lines added for this area yet.</p>
                  ) : (
                    currentAreaConfig.lines.map((lineItem, idx) => (
                      <div
                        key={`${lineItem}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9ff] border border-[#c3c6d5]/30 hover:border-[#094cb2]/40 transition-colors"
                      >
                        {editingLineIndex === idx ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editingLineText}
                              onChange={(e) => setEditingLineText(e.target.value)}
                              className="text-xs font-semibold text-[#001d32] bg-white border border-[#094cb2] rounded-lg px-2 py-1 w-full focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEditLine(idx)}
                              className="bg-[#094cb2] text-white p-1 rounded-lg text-xs hover:bg-[#073988]"
                              title="Save"
                            >
                              <span className="material-symbols-outlined text-base">check</span>
                            </button>
                            <button
                              onClick={() => setEditingLineIndex(null)}
                              className="text-slate-500 hover:text-slate-800 p-1 rounded-lg text-xs"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold font-body text-[#001d32] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#094cb2]" />
                              {lineItem}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditLine(idx, lineItem)}
                                className="text-slate-500 hover:text-[#094cb2] p-1 rounded-lg hover:bg-[#edf4ff] transition-colors cursor-pointer"
                                title="Edit Line Name"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteLine(idx)}
                                className="text-slate-400 hover:text-[#ba1a1a] p-1 rounded-lg hover:bg-[#fff2f2] transition-colors cursor-pointer"
                                title="Delete Line"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Line Form */}
                <form onSubmit={handleAddLine} className="pt-2 border-t border-[#edf4ff] flex gap-2">
                  <input
                    type="text"
                    placeholder={`+ Add new line to ${selectedArea}...`}
                    value={newLineInput}
                    onChange={(e) => setNewLineInput(e.target.value)}
                    className="flex-1 bg-[#f7f9ff] border border-[#c3c6d5]/40 text-xs text-[#001d32] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#094cb2]/50 focus:bg-white placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newLineInput.trim()}
                    className="btn-primary text-xs font-label font-bold px-3 py-2 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add</span>
                  </button>
                </form>
              </div>

              {/* SECTION 2: PM TYPES */}
              <div className="bg-white rounded-2xl border border-[#c3c6d5]/40 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf4ff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#094cb2]">build_circle</span>
                    <h4 className="font-label font-bold text-sm text-[#001d32]">
                      PM Types ({currentAreaConfig.pmTypes.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-label font-semibold text-[#434653] bg-[#f7f9ff] px-2 py-0.5 rounded-lg border border-[#c3c6d5]/30">
                    Linked to {selectedArea}
                  </span>
                </div>

                {/* PM Type List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {currentAreaConfig.pmTypes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No PM Types added for this area yet.</p>
                  ) : (
                    currentAreaConfig.pmTypes.map((pmTypeItem, idx) => (
                      <div
                        key={`${pmTypeItem}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9ff] border border-[#c3c6d5]/30 hover:border-[#094cb2]/40 transition-colors"
                      >
                        {editingPmTypeIndex === idx ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editingPmTypeText}
                              onChange={(e) => setEditingPmTypeText(e.target.value)}
                              className="text-xs font-semibold text-[#001d32] bg-white border border-[#094cb2] rounded-lg px-2 py-1 w-full focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEditPmType(idx)}
                              className="bg-[#094cb2] text-white p-1 rounded-lg text-xs hover:bg-[#073988]"
                              title="Save"
                            >
                              <span className="material-symbols-outlined text-base">check</span>
                            </button>
                            <button
                              onClick={() => setEditingPmTypeIndex(null)}
                              className="text-slate-500 hover:text-slate-800 p-1 rounded-lg text-xs"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold font-body text-[#001d32] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {pmTypeItem}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditPmType(idx, pmTypeItem)}
                                className="text-slate-500 hover:text-[#094cb2] p-1 rounded-lg hover:bg-[#edf4ff] transition-colors cursor-pointer"
                                title="Edit PM Type Name"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeletePmType(idx)}
                                className="text-slate-400 hover:text-[#ba1a1a] p-1 rounded-lg hover:bg-[#fff2f2] transition-colors cursor-pointer"
                                title="Delete PM Type"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add New PM Type Form */}
                <form onSubmit={handleAddPmType} className="pt-2 border-t border-[#edf4ff] flex gap-2">
                  <input
                    type="text"
                    placeholder={`+ Add new PM type for ${selectedArea}...`}
                    value={newPmTypeInput}
                    onChange={(e) => setNewPmTypeInput(e.target.value)}
                    className="flex-1 bg-[#f7f9ff] border border-[#c3c6d5]/40 text-xs text-[#001d32] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#094cb2]/50 focus:bg-white placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newPmTypeInput.trim()}
                    className="btn-primary text-xs font-label font-bold px-3 py-2 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 bg-[#f7f9ff] border-t border-[#edf4ff] flex items-center justify-between sticky bottom-0 z-10">
            <p className="text-xs text-[#434653] font-body">
              Changes sync live to forms & filter dropdowns.
            </p>
            <button
              onClick={onClose}
              className="btn-primary font-label text-xs sm:text-sm font-bold text-white px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Done & Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
