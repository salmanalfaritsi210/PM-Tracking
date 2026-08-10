import { EquipmentItem } from '../types';

const DB_NAME = 'PMTrackingOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'equipment_cache';
const KEY_LATEST = 'latest_synced_equipment';

export interface CachedEquipmentData {
  items: EquipmentItem[];
  syncedAt: number; // Timestamp
  itemCount: number;
}

/**
 * Opens or initializes the IndexedDB database.
 */

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Caches the latest equipment list into IndexedDB.
 */
export async function cacheEquipmentList(items: EquipmentItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const cachePayload: CachedEquipmentData = {
      items,
      syncedAt: Date.now(),
      itemCount: items.length,
    };

    store.put(cachePayload, KEY_LATEST);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('Failed to save equipment cache to IndexedDB:', err);
    // Fallback to localStorage
    try {
      localStorage.setItem(
        'pm_equipment_cache_fallback',
        JSON.stringify({
          items,
          syncedAt: Date.now(),
          itemCount: items.length,
        })
      );
    } catch {
      // ignore
    }
  }
}

/**
 * Retrieves the cached equipment list from IndexedDB (or fallback).
 */
export async function getCachedEquipmentList(): Promise<CachedEquipmentData | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(KEY_LATEST);

    const result = await new Promise<CachedEquipmentData | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as CachedEquipmentData);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (result && Array.isArray(result.items)) {
      return result;
    }
  } catch (err) {
    console.warn('Failed to load equipment cache from IndexedDB:', err);
  }

  // Check fallback in localStorage
  try {
    const raw = localStorage.getItem('pm_equipment_cache_fallback');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed as CachedEquipmentData;
      }
    }
  } catch {
    // ignore
  }

  return null;
}
