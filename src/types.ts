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
