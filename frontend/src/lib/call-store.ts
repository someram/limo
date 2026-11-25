import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CallRecord } from '@/types';

const CALLS_KEY = 'limo.calls';

let cache: CallRecord[] | null = null;
let loading: Promise<CallRecord[]> | null = null;

async function loadCalls() {
  if (cache) return cache;
  if (loading) return loading;

  loading = (async () => {
    const raw = await AsyncStorage.getItem(CALLS_KEY);
    let records: CallRecord[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        records = Array.isArray(parsed) ? (parsed as CallRecord[]) : [];
      } catch {
        records = [];
      }
    }

    cache = records;
    return records;
  })().finally(() => {
    loading = null;
  });

  return loading;
}

export async function addCallRecord(record: CallRecord) {
  const records = await loadCalls();
  cache = [...records, record];
  await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(cache));
}

export async function getLastCall(contactId: string) {
  const records = await loadCalls();
  const calls = records.filter((record) => record.contactId === contactId);
  if (calls.length === 0) return null;

  return calls.reduce((latest, record) =>
    record.startedAt > latest.startedAt ? record : latest
  );
}
