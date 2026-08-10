export type Area = 'North Logistics' | 'South Logistics' | 'Dock Area';

export type PMStatus = 'OK' | 'Due Soon' | 'Overdue';

export type HistoryStatus = 'Completed' | 'Archived' | 'Flagged' | 'Updated';

export interface MaintenanceHistoryEntry {
  id: string;
  date: string;
  status: HistoryStatus;
  workOrder: string;
  permitPtw: string;
  technicianNotes: string;
  followupWo?: string;
}

export interface EquipmentSpecs {
  calibrationWeights: string;
  sensorType: string;
  ipRating: string;
  serialNumber: string;
  lastCertification: string;
}

export interface EquipmentTelemetry {
  liveWeight: string;
  dspSignal: string;
  temperature: string;
  beltSpeed: string;
  stability: 'Stable' | 'Calibrating' | 'Warning';
}

export interface EquipmentItem {
  id: string;
  name: string;
  code: string;
  area: Area;
  line: string;
  pmType: string;
  lastPmDate: string;
  daysAgoText: string;
  lastWoPtw: string;
  workOrder: string;
  ptwNo: string;
  nextDueDate: string;
  frequencyMonths: number;
  status: PMStatus;
  specs?: EquipmentSpecs;
  telemetry?: EquipmentTelemetry;
  history: MaintenanceHistoryEntry[];
}

export interface FilterState {
  area: string;
  line: string;
  pmType: string;
  status: string;
  dateRange: string;
  search: string;
  sortBy: string;
}

export type NavTab = 
  | 'dashboard'
  | 'north'
  | 'south'
  | 'dock'
  | 'history'
  | 'equipment'
  | 'schedules'
  | 'archives';

export type ViewMode = 'grid' | 'table';

export interface AreaCustomization {
  lines: string[];
  pmTypes: string[];
}

export type AreaCustomizationMap = Record<Area, AreaCustomization>;

export const DEFAULT_AREA_CUSTOMIZATION: AreaCustomizationMap = {
  'North Logistics': {
    lines: ['Line 1', 'Line 2'],
    pmTypes: [
      'Check Weigher Calibration',
      'Net Weigher Calibration',
      'Metal Detector Calibration',
      'Routine PM',
    ],
  },
  'South Logistics': {
    lines: ['Line A', 'Line B', 'Line C', 'Line D'],
    pmTypes: [
      'Check Weigher Calibration',
      'Net Weigher Calibration',
      'Metal Detector Calibration',
      'Routine PM',
    ],
  },
  'Dock Area': {
    lines: ['Dock Bay 1', 'Dock Bay 2', 'Dock Leveler Area'],
    pmTypes: [
      'Check Weigher Calibration',
      'Dock Leveler Safety Inspection',
      'Scale Calibration',
      'Routine PM',
    ],
  },
};

