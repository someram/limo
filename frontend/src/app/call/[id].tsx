import { Redirect, useLocalSearchParams } from 'expo-router';

import { getContact } from '@/data/contacts';
import { CallScreen } from '@/screens/call';
import type { CallDirection, CallKind } from '@/types';

export default function CallRoute() {
  const { id, kind, direction } = useLocalSearchParams<{
    id?: string;
    kind?: string;
    direction?: string;
  }>();

  const contact = getContact(id);
  if (!contact) return <Redirect href="/(app)/home" />;

  const callKind: CallKind = kind === 'audio' ? 'audio' : 'video';
  const callDirection: CallDirection = direction === 'incoming' ? 'incoming' : 'outgoing';

  return <CallScreen contact={contact} kind={callKind} direction={callDirection} />;
}
