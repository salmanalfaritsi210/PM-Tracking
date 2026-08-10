import { EquipmentItem, PMStatus } from '../types';

/**
 * Calculates real-time PM status and days text based on the actual current date (today).
 */
export function calculateRealtimeStatus(
  nextDueDateStr: string,
  lastPmDateStr?: string
): {
  status: PMStatus;
  daysAgoText: string;
  daysRemaining: number;
} {
  if (!nextDueDateStr) {
    return { status: 'OK', daysAgoText: '-', daysRemaining: 999 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(nextDueDateStr);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days until due date

  let status: PMStatus = 'OK';
  if (diffDays < 0) {
    status = 'Overdue';
  } else if (diffDays <= 14) {
    status = 'Due Soon';
  } else {
    status = 'OK';
  }

  let daysAgoText = '';
  if (lastPmDateStr) {
    const lastDate = new Date(lastPmDateStr);
    lastDate.setHours(0, 0, 0, 0);
    const agoDiff = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (agoDiff >= 0) {
      daysAgoText = `${agoDiff} days ago`;
    } else {
      daysAgoText = `In ${Math.abs(agoDiff)} days`;
    }
  } else {
    if (diffDays < 0) {
      daysAgoText = `${Math.abs(diffDays)} days overdue`;
    } else {
      daysAgoText = `${diffDays} days left`;
    }
  }

  return { status, daysAgoText, daysRemaining: diffDays };
}

/**
 * Ensures an equipment item's status and daysAgoText are strictly synchronized with the current real date.
 */
export function syncEquipmentWithRealtimeDate(item: EquipmentItem): EquipmentItem {
  const { status: realStatus, daysAgoText: realDaysText } = calculateRealtimeStatus(
    item.nextDueDate,
    item.lastPmDate
  );

  if (item.status !== realStatus || item.daysAgoText !== realDaysText) {
    return {
      ...item,
      status: realStatus,
      daysAgoText: realDaysText,
    };
  }

  return item;
}
