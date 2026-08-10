import React from 'react';
import { EquipmentItem } from '../types';
import { calculateEquipmentHealthScore } from '../lib/healthScore';

interface EquipmentCardProps {
  item: EquipmentItem;
  onSelect: (item: EquipmentItem) => void;
  onQuickLog: (item: EquipmentItem) => void;
  onEdit?: (item: EquipmentItem) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  item,
  onSelect,
  onQuickLog,
  onEdit,
}) => {
  const isOverdue = item.status === 'Overdue';
  const isDueSoon = item.status === 'Due Soon';
  const health = calculateEquipmentHealthScore(item);

  return (
    <article
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl p-4 sm:p-5 ghost-border flex flex-col hover:bg-[#edf4ff]/60 active:scale-[0.98] transition-all duration-200 group relative overflow-hidden cursor-pointer shadow-2xs hover:shadow-md touch-manipulation"
    >
      {/* Overdue Red Left Accent Line */}
      {isOverdue && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ba1a1a] rounded-l-2xl" />
      )}

      {/* Decorative top-right corner element */}
      <div className="absolute top-0 right-0 w-14 h-14 bg-[#094cb2]/5 rounded-bl-full -z-0 transition-transform group-hover:scale-125" />

      {/* Header: Name + Status Badge */}
      <div className={`flex justify-between items-start mb-3 relative z-10 ${isOverdue ? 'pl-2' : ''}`}>
        <h4 className="font-body font-bold text-[#001d32] text-base sm:text-lg leading-snug pr-2 group-hover:text-[#094cb2] transition-colors">
          {item.name}
        </h4>

        {/* Status Badge */}
        {item.status === 'OK' && (
          <span className="shrink-0 bg-[#cde5ff] text-[#434653] text-xs px-2.5 py-1 rounded-lg font-label font-bold flex items-center gap-1 shadow-2xs">
            <span className="material-symbols-outlined text-[14px]">check_circle</span> OK
          </span>
        )}

        {isDueSoon && (
          <span className="shrink-0 bg-[#bfab49]/30 text-[#6d5e00] text-xs px-2.5 py-1 rounded-lg font-label font-bold flex items-center gap-1 shadow-2xs border border-[#bfab49]/20">
            <span className="material-symbols-outlined text-[14px]">warning</span> Due Soon
          </span>
        )}

        {isOverdue && (
          <span className="shrink-0 bg-[#ffdad6] text-[#93000a] text-xs px-2.5 py-1 rounded-lg font-label font-bold flex items-center gap-1 shadow-2xs border border-[#ffdad6]">
            <span className="material-symbols-outlined text-[14px]">error</span> Overdue
          </span>
        )}
      </div>

      {/* Health Progress Indicator */}
      <div className={`mb-3 relative z-10 ${isOverdue ? 'pl-2' : ''}`}>
        <div className="flex justify-between text-[11px] font-label font-bold mb-1">
          <span className="text-[#434653]">Health Index ({health.rating})</span>
          <span style={{ color: health.badgeText }}>{health.score}%</span>
        </div>
        <div className="w-full bg-[#edf4ff] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${health.progressColor} transition-all duration-300`}
            style={{ width: `${health.score}%` }}
          />
        </div>
      </div>

      {/* Information Details */}
      <div className={`space-y-3 mb-5 flex-grow relative z-10 ${isOverdue ? 'pl-2' : ''}`}>
        {/* Last PM */}
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#434653] text-base mt-0.5">event</span>
          <div>
            <p className="text-[10px] font-label font-bold text-[#434653] uppercase tracking-wider">
              Last PM
            </p>
            <p className="text-xs sm:text-sm font-body text-[#001d32]">
              {item.lastPmDate}{' '}
              <span className="text-[#434653]/70 text-xs">{item.daysAgoText}</span>
            </p>
          </div>
        </div>

        {/* Last WO / PTW */}
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#434653] text-base mt-0.5">
            description
          </span>
          <div>
            <p className="text-[10px] font-label font-bold text-[#434653] uppercase tracking-wider">
              Last WO / PTW
            </p>
            <p className="text-xs sm:text-sm font-body font-mono text-[#001d32]">
              {item.lastWoPtw || `${item.workOrder} / ${item.ptwNo}`}
            </p>
          </div>
        </div>

        {/* Next Due */}
        <div className="flex items-start gap-2.5">
          <span
            className={`material-symbols-outlined text-base mt-0.5 ${
              isOverdue ? 'text-[#ba1a1a]' : isDueSoon ? 'text-[#6d5e00]' : 'text-[#094cb2]'
            }`}
          >
            schedule
          </span>
          <div>
            <p className="text-[10px] font-label font-bold text-[#434653] uppercase tracking-wider">
              Next Due
            </p>
            <p
              className={`text-xs sm:text-sm font-body font-bold ${
                isOverdue
                  ? 'text-[#ba1a1a]'
                  : isDueSoon
                  ? 'text-[#6d5e00]'
                  : 'text-[#094cb2]'
              }`}
            >
              {item.nextDueDate}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-2 relative z-10 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickLog(item);
          }}
          className="flex-1 bg-[#d8eaff] hover:bg-[#094cb2] hover:text-white active:scale-95 text-[#094cb2] font-label font-bold text-xs sm:text-sm min-h-[44px] py-2.5 px-3 rounded-xl transition-all flex justify-center items-center gap-1.5 cursor-pointer shadow-2xs touch-manipulation"
        >
          <span className="material-symbols-outlined text-base">edit_note</span>
          <span>Quick Log</span>
        </button>

        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-[#edf4ff] hover:bg-[#094cb2] active:scale-95 text-[#094cb2] hover:text-white transition-all text-xs font-label font-bold flex items-center justify-center cursor-pointer shadow-2xs touch-manipulation"
            title="Edit Equipment Name & Code"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
        )}
      </div>
    </article>
  );
};
