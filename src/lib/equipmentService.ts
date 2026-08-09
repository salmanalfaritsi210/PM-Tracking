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

const COLLECTION_NAME = 'equipment';

/**
 * Subscribes to real-time updates from Firestore for all equipment.
 * If Firestore is empty on first load, seeds initial equipment data automatically.
 */
export function subscribeEquipment(
  onUpdate: (items: EquipmentItem[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data if Firestore is currently empty
        try {
          for (const item of INITIAL_EQUIPMENT) {
            await setDoc(doc(db, COLLECTION_NAME, item.id), item);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, COLLECTION_NAME);
        }
        return;
      }

      const items: EquipmentItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as EquipmentItem);
      });

      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
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
