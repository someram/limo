import AsyncStorage from '@react-native-async-storage/async-storage';

import { MY_USER_ID } from '@/data/contacts';
import type { ChatMessage, Contact } from '@/types';

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const memory = new Map<string, ChatMessage[]>();
const loaded = new Set<string>();
const listeners = new Map<string, Set<() => void>>();
const pendingLoads = new Map<string, Promise<ChatMessage[]>>();

const AUTO_REPLIES = [
  'Sounds good!',
  "Got it — I'll let you know.",
  'Perfect, talk in a bit.',
  'Hey! Good to hear from you.',
  'Give me a second, finishing something up.',
];

function messageKey(conversationId: string) {
  return `limo.messages.${conversationId}`;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function notify(conversationId: string) {
  listeners.get(conversationId)?.forEach((listener) => listener());
}

function parseMessages(raw: string | null): ChatMessage[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function seedMessages(conversationId: string): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: `${conversationId}-seed-1`,
      conversationId,
      senderId: 'alex-rivera',
      text: 'Hey! Are we still on for the call later?',
      createdAt: now - 1000 * 60 * 14,
    },
    {
      id: `${conversationId}-seed-2`,
      conversationId,
      senderId: MY_USER_ID,
      text: "Yes — works for me. I'll ring you at 4.",
      createdAt: now - 1000 * 60 * 12,
    },
    {
      id: `${conversationId}-seed-3`,
      conversationId,
      senderId: 'alex-rivera',
      text: 'Perfect. Talk soon!',
      createdAt: now - 1000 * 60 * 11,
    },
  ];
}

async function persist(conversationId: string, messages: ChatMessage[]) {
  await AsyncStorage.setItem(messageKey(conversationId), JSON.stringify(messages));
}

function append(conversationId: string, message: ChatMessage) {
  const messages = memory.get(conversationId) ?? [];
  const next = [...messages, message];
  memory.set(conversationId, next);
  loaded.add(conversationId);
  void persist(conversationId, next);
  notify(conversationId);
  return next;
}

export function getMessagesSnapshot(conversationId: string) {
  return memory.get(conversationId) ?? [];
}

export function hasLoadedMessages(conversationId: string) {
  return loaded.has(conversationId);
}

export function subscribeToMessages(conversationId: string, listener: () => void) {
  const set = listeners.get(conversationId) ?? new Set<() => void>();
  set.add(listener);
  listeners.set(conversationId, set);

  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(conversationId);
  };
}

export function loadMessages(conversationId: string, contactId: string) {
  if (loaded.has(conversationId)) {
    return Promise.resolve(getMessagesSnapshot(conversationId));
  }

  const pending = pendingLoads.get(conversationId);
  if (pending) return pending;

  const load = (async () => {
    const key = messageKey(conversationId);
    const raw = await AsyncStorage.getItem(key);

    let messages = parseMessages(raw);
    if (!raw && contactId === 'alex-rivera') {
      messages = seedMessages(conversationId);
      await persist(conversationId, messages);
    }

    memory.set(conversationId, messages);
    loaded.add(conversationId);
    notify(conversationId);
    return messages;
  })().finally(() => pendingLoads.delete(conversationId));

  pendingLoads.set(conversationId, load);
  return load;
}

function scheduleReply(conversationId: string, contact: Contact) {
  if (contact.status !== 'online' || timers.has(conversationId)) return;

  const timer = setTimeout(() => {
    timers.delete(conversationId);
    const line = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    append(conversationId, {
      id: createId(),
      conversationId,
      senderId: contact.id,
      text: line,
      createdAt: Date.now(),
    });
  }, 1500 + Math.random() * 1200);

  timers.set(conversationId, timer);
}

export function sendMessage(conversationId: string, contact: Contact, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  append(conversationId, {
    id: createId(),
    conversationId,
    senderId: MY_USER_ID,
    text: trimmed,
    createdAt: Date.now(),
  });

  scheduleReply(conversationId, contact);
}
