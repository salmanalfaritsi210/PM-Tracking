import { EquipmentItem } from '../types';

export interface HealthScoreResult {
  score: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Critical';
  color: string;
  badgeBg: string;
  badgeText: string;
  progressColor: string;
  recommendedAction: string;
}

export function calculateEquipmentHealthScore(item: EquipmentItem): HealthScoreResult {
  let baseScore = 100;

  // Deduct based on status
  if (item.status === 'Overdue') {
    baseScore -= 50;
  } else if (item.status === 'Due Soon') {
    baseScore -= 20;
  }

  // Deduct or bonus based on history logs count
  const historyCount = item.history?.length || 0;
  if (historyCount === 0) {
    baseScore -= 15;
  } else if (historyCount >= 3) {
    baseScore += 5;
  }

  // Deduct if no WO/PTW recorded
  if (!item.workOrder && !item.ptwNo && !item.lastWoPtw) {
    baseScore -= 10;
  }

  // Clamp score between 10 and 100
  const score = Math.max(10, Math.min(100, baseScore));

  if (score >= 85) {
    return {
      score,
      rating: 'Excellent',
      color: '#14833b',
      badgeBg: '#dcfce7',
      badgeText: '#15803d',
      progressColor: 'bg-[#14833b]',
      recommendedAction: 'Standard routine inspection schedule.',
    };
  } else if (score >= 70) {
    return {
      score,
      rating: 'Good',
      color: '#094cb2',
      badgeBg: '#dbeafe',
      badgeText: '#1d4ed8',
      progressColor: 'bg-[#094cb2]',
      recommendedAction: 'Verify sensor zero-point and span calibration on next shift.',
    };
  } else if (score >= 50) {
    return {
      score,
      rating: 'Fair',
      color: '#b58b00',
      badgeBg: '#fef3c7',
      badgeText: '#b45309',
      progressColor: 'bg-[#b58b00]',
      recommendedAction: 'Schedule preventive maintenance within 7 days.',
    };
  } else {
    return {
      score,
      rating: 'Critical',
      color: '#ba1a1a',
      badgeBg: '#fee2e2',
      badgeText: '#b91c1c',
      progressColor: 'bg-[#ba1a1a]',
      recommendedAction: 'Immediate field inspection and emergency Work Order required.',
    };
  }
}
