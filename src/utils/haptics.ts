// Haptic Feedback Utility for Mobile & Touch Browsers
export const triggerHaptic = (pattern: number | number[] = 15): void => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Browser or device does not support vibration or user gesture required
    }
  }
};

/** Light haptic tick for minor clicks and tab switches */
export const hapticLight = (): void => triggerHaptic(12);

/** Medium haptic feedback for modal triggers and status toggles */
export const hapticMedium = (): void => triggerHaptic(30);

/** Success pattern for saving logs and completing forms */
export const hapticSuccess = (): void => triggerHaptic([20, 60, 40]);

/** Warning pattern for deletions or destructive actions */
export const hapticWarning = (): void => triggerHaptic([50, 50, 50]);
