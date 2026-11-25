This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
bunx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
bunx expo start              # start the dev server
bunx expo lint               # lint
bunx tsc --noEmit            # typecheck
bunx expo-doctor             # diagnose dependency and config issues
bunx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Project structure

Limo is a local-only demo chat/video-call app (no backend; data is mocked and persisted on device). Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`.

```text
src/
  app/                 Expo Router routes only — thin files that render screens
    _layout.tsx        Root Stack; auth guards live here (Stack.Protected)
    welcome.tsx        Signed-out onboarding at /welcome
    auth.tsx           Sign-in / sign-up at /auth
    (app)/             Authenticated route group
      _layout.tsx      Stack for signed-in screens
      index.tsx        "/" anchor; redirects to /(app)/home (needed for session restore)
      home.tsx         Contacts list (start screen)
      profile.tsx      Profile details + Sign out
      chat/[id].tsx    Chat thread for a contact
    call/[id].tsx      Full-screen call modal (authenticated)
  screens/             Screen implementations (UI + logic); routes in app/ render these
  components/          Reusable components; components/ui/ holds design-system primitives
  providers/           React context (auth-provider: user, isLoading, authenticate, signOut)
  hooks/               Reusable hooks (chat conversation, last call)
  lib/                 Persistence and stores: accounts, session (+ session.web), chat-store, call-store
  constants/theme.ts   Design tokens: usePalette(), spacing, radius, typography
  data/contacts.ts     Mock contacts, MY_USER_ID, conversationIdFor()
  types.ts             Shared domain types (Contact, SessionUser, ChatMessage, CallRecord…)
  utils/format.ts      Formatting/validation helpers

assets/images/         App icons, splash, favicon (referenced by app.json)
ui/                    Reference design screenshots (not bundled)
system-design.md       Product/architecture notes
scripts/reset-project.js
```

Conventions:

- Keep `src/app/` files as thin route wrappers; put screen UI in `src/screens/`.
- Use `usePalette()` and the `spacing`/`radius`/`typography` tokens from `@/constants/theme`; never hardcode colors or spacing.
- Auth state: `AuthProvider` restores the session on launch. Session uses `expo-secure-store` on native and `session.web.ts` (localStorage) on web. Accounts are stored in AsyncStorage.
- All app data is local/mock; there is no API layer.

### Routing invariant (important)

Never let two route files resolve to the same URL. Expo Router 58 can enter an infinite redirect (`Maximum update depth exceeded`) when a `Stack.Protected` guard turns false and its fallback URL also matches a guarded route — see expo/expo#52072. In this app `/` is owned only by `(app)/index.tsx`; signed-out routes live off `/` (`/welcome`, `/auth`), and both guards set explicit `redirectTo` in `src/app/_layout.tsx`. Do not add another `index.tsx` at `src/app/` or any other duplicate-URL route.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md



use relevant skills to build

dont overengineer anything

after building or when to give output write properly what changed and what have you done


