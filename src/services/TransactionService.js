import { StorageService } from './StorageService';
import { firestore, firebaseIsEnabled } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const KEY = 'transactions';
const COLLECTION_NAME = 'transactions';

const normalizeItem = (item) => ({
  ...item,
  id: item.id || item._id,
  amount: Number(item.amount || 0),
  created_date: item.created_date || new Date().toISOString(),
  updated_date: item.updated_date || new Date().toISOString(),
});

const listFromFirestore = async (queryOptions = {}) => {
  if (!firestore || !firebaseIsEnabled) return null;

  const constraints = [];
  if (queryOptions.month) constraints.push(where('month', '==', queryOptions.month));
  if (queryOptions.sort) {
    const dir = queryOptions.sort.startsWith('-') ? 'desc' : 'asc';
    constraints.push(orderBy(queryOptions.sort.replace('-', ''), dir));
  }

  const q = query(collection(firestore, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data();
    return normalizeItem({
      ...data,
      id: d.id,
      created_date: data.created_date?.toDate ? data.created_date.toDate().toISOString() : data.created_date,
      updated_date: data.updated_date?.toDate ? data.updated_date.toDate().toISOString() : data.updated_date,
    });
  });
};

export const TransactionService = {
  async list(sort) {
    if (firebaseIsEnabled) {
      return listFromFirestore({ sort });
    }
    return StorageService.list(KEY, sort);
  },

  async filter(query, sort) {
    if (firebaseIsEnabled) {
      return listFromFirestore({ ...query, sort });
    }

    let items = StorageService.filter(KEY, query);
    if (sort) {
      const field = sort.replace('-', '');
      const descending = sort.startsWith('-');
      items.sort((a, b) => {
        const av = a[field] || '';
        const bv = b[field] || '';
        return descending
          ? String(bv).localeCompare(String(av))
          : String(av).localeCompare(String(bv));
      });
    }
    return items;
  },

  async create(data) {
    if (firebaseIsEnabled) {
      const payload = {
        ...data,
        amount: Number(data.amount || 0),
        created_date: Timestamp.fromDate(new Date()),
        updated_date: Timestamp.fromDate(new Date()),
      };
      const ref = await addDoc(collection(firestore, COLLECTION_NAME), payload);
      return { ...payload, id: ref.id, created_date: new Date().toISOString(), updated_date: new Date().toISOString() };
    }
    return StorageService.create(KEY, data);
  },

  async update(id, data) {
    if (firebaseIsEnabled) {
      const ref = doc(firestore, COLLECTION_NAME, id);
      await updateDoc(ref, {
        ...data,
        amount: Number(data.amount || 0),
        updated_date: Timestamp.fromDate(new Date()),
      });
      return { id, ...data };
    }
    return StorageService.update(KEY, id, data);
  },

  async delete(id) {
    if (firebaseIsEnabled) {
      await deleteDoc(doc(firestore, COLLECTION_NAME, id));
      return;
    }
    return StorageService.delete(KEY, id);
  },

  clearAll() {
    if (firebaseIsEnabled) {
      return;
    }
    StorageService.clear(KEY);
  },
};