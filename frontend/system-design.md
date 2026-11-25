# System Design: Simple Audio and Video Calling App

## 1. Goal

Build a mobile app for one-to-one audio calls, video calls, and simple text chat. Users sign up and sign in with email. The backend runs on the existing VPS. The design avoids paid external services and leaves the database choice to the project owner.

“Zero infrastructure cost” here means no additional paid service is required beyond the VPS already available. The VPS, its bandwidth, and any usage charges still have costs. Calls can send media directly between phones when networks allow. Some calls require a TURN relay, which uses VPS bandwidth.

## 2. MVP features

- Email signup, sign-in, sign-out, and persistent sessions.
- A basic user/contact list to find someone and start a conversation.
- One-to-one audio and video calls: start, receive, accept, decline, and hang up.
- In-call controls: mute/unmute microphone, enable/disable camera, and switch front/rear camera.
- One-to-one text chat with stored message history and live updates while connected.
- Call and connection status, missed-call indication, and clear permission/error handling.

Group calls, call recording, PSTN calls, and push notifications are outside the initial MVP.

## 3. Recommended technology stack

| Area | Recommendation | Notes |
|---|---|---|
| Mobile app | Expo SDK 58, React Native, TypeScript, Expo Router | The repository currently uses Expo SDK 58. |
| Calling | WebRTC peer-to-peer via a React Native WebRTC native module | Audio/video flows directly between the two devices when possible. A native module requires development and production builds; Expo Go does not include it. |
| Backend | A small API and WebSocket service on the existing VPS | Handles authentication, users, conversations, messages, call signaling, and authorization. Choose the backend language/framework independently. |
| Database | Project owner’s choice | Store users, conversations, messages, and any required call history. No vendor is assumed. |
| NAT traversal | STUN for connection discovery; coturn on the VPS for TURN relay if needed | coturn is open-source software. Relayed media consumes server bandwidth and VPS capacity. |
| Transport security | HTTPS and secure WebSockets (WSS) | Use TLS for API and signaling traffic. WebRTC media uses its built-in encrypted transport. |

Expo’s SDK 58 documentation is available at [docs.expo.dev/versions/v58.0.0](https://docs.expo.dev/versions/v58.0.0/). Expo’s [LiveKit guide](https://docs.expo.dev/guides/using-livekit/) documents the general native-build requirement for WebRTC-based calling libraries: these native modules do not run in Expo Go.

## 4. High-level architecture

```text
┌─────────────────────────────┐       HTTPS / WSS       ┌──────────────────────────┐
│ Phone A                     │◄───────────────────────►│ Backend on existing VPS  │
│ Expo / React Native         │                         │ Auth, API, signaling,    │
│ WebRTC peer connection      │                         │ chat, authorization      │
└──────────────┬──────────────┘                         └────────────┬─────────────┘
               │                                                     │
               │            SDP / ICE signaling                      │
               └─────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│ Phone B                     │
│ Expo / React Native         │
│ WebRTC peer connection      │
└──────────────┬──────────────┘
               │
               ├──────── Direct encrypted audio/video when possible ────────┐
               │                                                              │
               └── TURN relay via coturn on VPS when direct connection fails ┘
```

The backend is the trusted control plane: it authenticates users, checks that they may contact one another, stores chat messages, and forwards call setup messages. WebRTC carries audio and video. The signaling server does not carry the media stream.

## 5. Important terms

- **STUN** helps a phone discover the network address it can use when trying to connect directly to another phone.
- **TURN** relays traffic when the phones cannot establish a direct path. For a relayed call, audio and video pass through the TURN server.
- **coturn** is free, open-source software that can provide STUN and TURN services. Running it on the VPS avoids a separate TURN provider, but not the bandwidth and capacity cost of relaying calls.

Direct peer-to-peer connections will not work for every network combination. TURN is the fallback that improves reachability. Do not rely on a public, unauthenticated TURN service for production calls.

## 6. Main flows

### 6.1 Sign up and sign in

1. The user submits an email and password through the app.
2. The backend validates credentials, creates or verifies the account, and returns a session token.
3. The app stores the session using platform-appropriate secure storage and sends it with authenticated API and WebSocket requests.
4. Sign-out revokes the session on the backend and clears it from the device.

Use a standard password hashing scheme on the backend, rate-limit authentication attempts, and provide email verification and password reset if required for launch.

### 6.2 Chat

1. The app requests the conversation and recent message history from the backend.
2. To send a message, the app submits it over the authenticated API or WebSocket.
3. The backend checks conversation membership, stores the message, then notifies the other participant over their active WebSocket connection.
4. On reconnect, the app fetches messages newer than its last received message.

The database choice is open. At minimum, persist users, conversation membership, and messages with sender, conversation, content, and creation time. Define retention and pagination as implementation details before launch.

### 6.3 Start and receive a call

1. Caller A asks the backend to start a call with user B.
2. The backend verifies both users and forwards an incoming-call event to B if B is connected.
3. B accepts or declines. If accepted, both apps create a WebRTC peer connection and request microphone/camera access as appropriate.
4. The caller sends an SDP offer through the signaling WebSocket. The callee returns an SDP answer.
5. Both devices exchange ICE candidates through signaling while WebRTC checks possible network paths using STUN and, when configured, TURN.
6. Once connected, audio/video flows between the phones directly or through the TURN relay.
7. Either participant can hang up. The backend forwards the end event and both clients close media tracks and the peer connection.

Signaling messages should include a call identifier and be authorized against the call’s two participants. Handle duplicate and late messages safely.

### 6.4 Call states

`idle → ringing → connecting → connected → ended`

Other terminal outcomes include `declined`, `missed`, `failed`, and `cancelled`. The app should show a useful status while ringing and connecting, and a recoverable message if connection setup fails.

## 7. Backend responsibilities and interfaces

The backend should provide equivalent operations to:

- **Auth API:** sign up, sign in, refresh/restore session, sign out, and optionally verify/reset credentials.
- **User API:** retrieve a minimal searchable/listable set of users for starting a conversation.
- **Conversation and message API:** create or retrieve a one-to-one conversation, page through history, and send a message.
- **Realtime channel:** authenticated WebSocket for chat notifications and call signaling events such as incoming call, accept, decline, offer, answer, ICE candidate, cancel, and hangup.
- **ICE configuration:** provide STUN/TURN connection configuration to authenticated clients. Use short-lived TURN credentials rather than embedding a permanent TURN secret in the app.

Exact routes, message serialization, and database schema depend on the chosen backend and database. The backend must enforce authorization for every conversation and call event; a client-provided user or conversation ID is not proof of access.

## 8. Reliability, privacy, and operations

- Request camera and microphone permissions only when the user starts the corresponding call action. Explain denied permissions and offer a path to retry in system settings.
- Stop camera and microphone tracks and close peer connections on hangup, failure, app logout, and appropriate app lifecycle transitions.
- Handle offline users, unanswered calls, WebSocket reconnects, ICE connection failure, and calls interrupted by network changes.
- Use authenticated signaling and validate that every event belongs to the active call and its participants.
- Use secure password storage, TLS, authorization checks, request limits, and minimal personal data in logs.
- Run the API/signaling service and optional coturn on the existing VPS. Restrict coturn to authenticated clients, monitor CPU, memory, network throughput, and relay usage, and configure firewall ports for signaling and TURN traffic.
- A direct call mostly uses the participants’ internet connections. A relayed call consumes VPS ingress and egress bandwidth for both media directions; video can make that the main operating constraint.
- Mobile operating systems may suspend background apps. The MVP can support incoming calls while the app is active; reliable incoming calls while backgrounded generally require platform push-notification setup, which is outside the zero-external-service MVP assumption.

## 9. MVP validation scenarios

- Sign up, sign in, restore a session after app restart, and sign out.
- Send and receive chat messages, load history, reconnect, and receive messages sent while temporarily disconnected.
- Complete audio and video calls on Wi-Fi and across Wi-Fi/mobile networks.
- Verify mute, camera on/off, front/rear camera switch, decline, cancel, and hang up.
- Exercise microphone/camera permission denial, offline recipient, missed call, signaling disconnect, direct ICE failure, and TURN relay fallback.
- Confirm one user cannot read another user’s conversation or send call signaling events for a call they do not participate in.

## 10. Known tradeoffs

- Raw peer-to-peer WebRTC avoids operating an SFU for simple one-to-one calls, but NAT and firewall behavior means TURN is needed for some calls.
- Hosting coturn on the same VPS avoids a separate service bill but shares the VPS’s network and compute capacity with the backend. If usage grows, a single VPS may not provide enough relay bandwidth or availability.
- Without push notifications, the MVP cannot promise timely incoming-call alerts when the app is suspended or terminated.
- Expo Go is not sufficient for calling features that use native WebRTC modules; use Expo development builds and rebuild when native dependencies change.
