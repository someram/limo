import type { Contact } from '@/types';

export const MY_USER_ID = 'me';

export const CONTACTS: Contact[] = [
  { id: 'alex-rivera', name: 'Alex Rivera', status: 'online', color: '#3D5AFE' },
  { id: 'jordan-kim', name: 'Jordan Kim', status: 'offline', color: '#FF5A5A' },
  { id: 'sam-torres', name: 'Sam Torres', status: 'online', color: '#21C55D' },
  { id: 'morgan-lee', name: 'Morgan Lee', status: 'busy', color: '#F49B33' },
  { id: 'riley-chen', name: 'Riley Chen', status: 'online', color: '#A855F7' },
  { id: 'casey-park', name: 'Casey Park', status: 'offline', color: '#2DD4BF' },
  { id: 'drew-patel', name: 'Drew Patel', status: 'online', color: '#4F46E5' },
];

export function getContact(contactId: string | undefined) {
  return CONTACTS.find((contact) => contact.id === contactId);
}

export function conversationIdFor(contactId: string) {
  return `conversation-${contactId}`;
}
