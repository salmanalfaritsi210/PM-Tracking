import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { EquipmentItem, MaintenanceHistoryEntry } from '../types';
import { INITIAL_EQUIPMENT } from '../data/initialData';
import { syncEquipmentWithRealtimeDate } from './dateUtils';
import { cacheEquipmentList, getCachedEquipmentList } from './indexedDb';

const COLLECTION_NAME = 'equipment';

/**
 * Subscribes to real-time updates from Firestore for all equipment.
 * Automatically saves synced snapshots into IndexedDB for offline persistence.
 * If Firestore fails or device is offline, falls back to IndexedDB cache.
 */
export function subscribeEquipment(
  onUpdate: (items: EquipmentItem[], isFromCache?: boolean) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTION_NAME);

  // Attempt initial offline load from IndexedDB cache immediately
  getCachedEquipmentList().then((cached) => {
    if (cached && cached.items.length > 0) {
      onUpdate(cached.items, true);
    }
  }).catch(() => {
    // Ignore cache error on startup
  });

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data if Firestore is currently empty
        try {
          for (const rawItem of INITIAL_EQUIPMENT) {
            const item = syncEquipmentWithRealtimeDate(rawItem);
            await setDoc(doc(db, COLLECTION_NAME, item.id), item);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, COLLECTION_NAME);
        }
        return;
      }

      const items: EquipmentItem[] = [];
      const outOfSyncUpdates: { id: string; status: string; daysAgoText: string }[] = [];

      snapshot.forEach((docSnap) => {
        const rawItem = docSnap.data() as EquipmentItem;
        const syncedItem = syncEquipmentWithRealtimeDate(rawItem);
        
        if (syncedItem.status !== rawItem.status || syncedItem.daysAgoText !== rawItem.daysAgoText) {
          outOfSyncUpdates.push({
            id: syncedItem.id,
            status: syncedItem.status,
            daysAgoText: syncedItem.daysAgoText,
          });
        }
        items.push(syncedItem);
      });

      // Asynchronously update any items in Firestore that had outdated statuses
      if (outOfSyncUpdates.length > 0) {
        for (const update of outOfSyncUpdates) {
          updateDoc(doc(db, COLLECTION_NAME, update.id), {
            status: update.status,
            daysAgoText: update.daysAgoText,
          }).catch((err) => {
            console.warn('Auto-sync status failed for item:', update.id, err);
          });
        }
      }

      // Save latest snapshot into IndexedDB cache asynchronously
      cacheEquipmentList(items).catch((err) => {
        console.warn('Failed to cache equipment list to IndexedDB:', err);
      });

      onUpdate(items, false);
    },
    async (error) => {
      console.warn('Firestore subscription offline/error, retrieving IndexedDB cache...', error);
      try {
        const cached = await getCachedEquipmentList();
        if (cached && cached.items.length > 0) {
          onUpdate(cached.items, true);
        }
      } catch (cacheErr) {
        console.error('Failed to retrieve IndexedDB cache:', cacheErr);
      }

      if (onError) onError(error);
    }
  );
}

/**
 * Updates a single equipment item in Firestore
 */
export async function updateEquipmentInFirestore(
  id: string,
  updatedFields: Partial<EquipmentItem>
) {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await updateDoc(docRef, updatedFields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Bulk updates multiple equipment items in Firestore
 */
export async function bulkUpdateEquipmentInFirestore(
  selectedIds: string[],
  updatedFields: Partial<EquipmentItem> | ((item: EquipmentItem) => Partial<EquipmentItem>)
) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    const promises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      if (selectedIds.includes(docSnap.id)) {
        const currentData = docSnap.data() as EquipmentItem;
        const patch =
          typeof updatedFields === 'function' ? updatedFields(currentData) : updatedFields;
        const targetRef = doc(db, COLLECTION_NAME, docSnap.id);
        promises.push(updateDoc(targetRef, patch));
      }
    });

    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

/**
 * Deletes a specific history log entry from an equipment item in Firestore
 */
export async function deleteHistoryEntryFromFirestore(
  equipmentId: string,
  logId: string,
  currentHistory: MaintenanceHistoryEntry[]
) {
  const updatedHistory = currentHistory.filter((entry) => entry.id !== logId);
  const docRef = doc(db, COLLECTION_NAME, equipmentId);
  try {
    await updateDoc(docRef, { history: updatedHistory });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${equipmentId}`);
  }
}

/**
 * Clears all history logs across all equipment items in Firestore
 */
export async function clearAllLogsInFirestore() {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const promises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      const targetRef = doc(db, COLLECTION_NAME, docSnap.id);
      promises.push(updateDoc(targetRef, { history: [] }));
    });
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

/**
 * Adds a new equipment item to Firestore
 */
export async function addEquipmentToFirestore(item: EquipmentItem) {
  const docRef = doc(db, COLLECTION_NAME, item.id);
  try {
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${item.id}`);
  }
}
