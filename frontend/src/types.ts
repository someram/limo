export type ContactStatus = 'online' | 'offline' | 'busy';

export type Contact = {
  id: string;
  name: string;
  status: ContactStatus;
  color: string;
};

export type SessionUser = {
  email: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: number;
};

export type CallKind = 'audio' | 'video';
export type CallDirection = 'outgoing' | 'incoming';
export type CallStatus =
  | 'incoming'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'declined'
  | 'missed'
  | 'cancelled';

export type CallRecord = {
  id: string;
  contactId: string;
  kind: CallKind;
  direction: CallDirection;
  status: CallStatus;
  startedAt: number;
  durationSeconds: number;
};
