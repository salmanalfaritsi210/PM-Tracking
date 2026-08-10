import React from 'react';

interface MobileFabProps {
  onOpenUpdateModal: () => void;
  label?: string;
}

export const MobileFab: React.FC<MobileFabProps> = ({
  onOpenUpdateModal,
  label = 'Log PM',
}) => {
  return (
    <button
      onClick={onOpenUpdateModal}
      className="fixed bottom-20 right-4 z-30 md:hidden flex items-center gap-2.5 bg-[#094cb2] hover:bg-[#003da5] active:scale-95 text-white px-4 py-3.5 rounded-full shadow-lg shadow-[#094cb2]/30 border border-white/20 transition-all duration-200 cursor-pointer min-h-[48px] min-w-[48px] justify-center"
      title="Create or Update Maintenance Log"
      aria-label="Add or Update Maintenance Log"
    >
      <span className="material-symbols-outlined text-2xl leading-none">edit_note</span>
      <span className="font-label font-bold text-xs tracking-wider uppercase pr-0.5">{label}</span>
    </button>
  );
};
