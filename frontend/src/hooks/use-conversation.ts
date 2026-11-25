import { useCallback, useEffect, useState } from 'react';

import { conversationIdFor } from '@/data/contacts';
import {
  getMessagesSnapshot,
  hasLoadedMessages,
  loadMessages,
  sendMessage,
  subscribeToMessages,
} from '@/lib/chat-store';
import type { ChatMessage, Contact } from '@/types';

export function useConversation(contact: Contact) {
  const conversationId = conversationIdFor(contact.id);
  const [messages, setMessages] = useState<ChatMessage[] | null>(() =>
    hasLoadedMessages(conversationId) ? getMessagesSnapshot(conversationId) : null
  );

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToMessages(conversationId, () => {
      if (active && hasLoadedMessages(conversationId)) {
        setMessages(getMessagesSnapshot(conversationId));
      }
    });

    loadMessages(conversationId, contact.id).then((loadedMessages) => {
      if (active) setMessages(loadedMessages);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [conversationId, contact.id]);

  const send = useCallback(
    (text: string) => {
      sendMessage(conversationId, contact, text);
    },
    [conversationId, contact]
  );

  return { messages, send };
}
