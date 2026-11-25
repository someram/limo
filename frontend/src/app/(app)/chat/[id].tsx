import { Redirect, Stack, useLocalSearchParams } from 'expo-router';

import { getContact } from '@/data/contacts';
import { usePalette } from '@/constants/theme';
import { ChatScreen } from '@/screens/chat';
import { ChatHeaderActions } from '@/screens/chat/header-actions';

export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const contact = getContact(id);
  const palette = usePalette();

  if (!contact) return <Redirect href="/(app)/home" />;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerTitleStyle: { color: palette.text, fontSize: 17, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          title: contact.name,
          headerRight: () => <ChatHeaderActions contact={contact} />,
        }}
      />
      <ChatScreen contact={contact} />
    </>
  );
}
