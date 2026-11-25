import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getLastCall } from '@/lib/call-store';
import type { CallRecord } from '@/types';

export function useLastCall(contactId: string) {
  const [lastCall, setLastCall] = useState<CallRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      getLastCall(contactId).then((record) => {
        if (active) setLastCall(record);
      });

      return () => {
        active = false;
      };
    }, [contactId])
  );

  return lastCall;
}
