# Flately — System Architecture

> Source-of-truth note: authentication and route-state behavior are defined in `docs/product-user-flow.md`.
> This architecture file may include legacy snapshots retained for historical context.

> **Version**: 2.4 COMMAND  
> **Last Updated**: 2026-03-25  
> **Stack**: TypeScript Full-Stack · MongoDB · JWT Auth · Socket.IO

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  React 19 + Vite 7 + Redux Toolkit + TailwindCSS v4            │
│  Manual Auth UI + Socket.IO Client + Framer Motion             │
│  Port: 5173 (dev)                                               │
└────────────────────┬──────────────────┬─────────────────────────┘
                     │ REST (Axios)     │ WebSocket (Socket.IO)
                     │ Bearer JWT       │ Bidirectional
                     ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                           │
│  Express 5 + TypeScript + http.createServer()                   │
│  Helmet · CORS · Rate Limiting · Zod Env Validation             │
│  Port: 4000                                                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  REST API    │  │  Socket.IO   │  │  JWT Middleware       │   │
│  │  (7 routers) │  │  (chat ns)   │  │  (RS256 verification)│   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘   │
│         │                 │                                      │
│         ▼                 ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Prisma ORM (PrismaClient singleton)         │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MongoDB Atlas (Cluster0)                        │
│  Database: flately                                              │
│  Collections: User, Profile, Preference, Swipe, Match,          │
│               Conversation, Message                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack — Exact Versions

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Runtime |
| TypeScript | ^5.9.3 | Language |
| Express | ^5.2.1 | HTTP framework |
| Prisma | ^6.12.0 / Client ^6.19.1 | ORM for MongoDB |
| Socket.IO | ^4.8.3 | Real-time WebSocket |
| jsonwebtoken | ^9.0.3 | JWT validation/signing |
| Zod | ^3.23.8 | Runtime schema validation |
| Helmet | ^8.1.0 | HTTP security headers |
| cors | ^2.8.5 | Cross-origin resource sharing |
| express-rate-limit | ^8.2.1 | Rate limiting |
| bcrypt | ^6.0.0 | Password hashing (future use) |
| jsonwebtoken | ^9.0.3 | JWT utility |
| tsx | ^4.19.2 | TypeScript execution (dev) |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.3 | UI framework |
| Vite | ^7.2.4 | Build tool / dev server |
| TypeScript | ^5.9.3 | Language |
| TailwindCSS | ^4.1.18 | CSS framework (v4 with `@import "tailwindcss"`) |
| Redux Toolkit | ^2.11.2 | State management |
| React Router DOM | ^6.28.0 | Client-side routing |
| Custom Auth Provider | internal | Session bootstrap and persistence |
| Axios | ^1.13.2 | HTTP client |
| Framer Motion | ^12.29.2 | Animations |
| Socket.IO Client | ^4.8.3 | Real-time WebSocket |
| React Hook Form | ^7.71.1 | Form management |
| Zod | ^4.3.5 | Form validation |
| Radix UI | Various ^1.x | Accessible primitives |
| Lucide React | ^0.563.0 | Icons (alongside Material Symbols) |
| Storybook | ^10.3.3 | Component development |
| Vitest | ^4.1.1 | Testing framework |
| Playwright | ^1.58.2 | Browser testing |

---

## 3. Authentication Flow (Manual JWT)

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│  Browser │────▶│ /auth/signup  │────▶│ JWT session │
│  (login) │     │ /auth/login   │     │ persisted   │
└──────────┘     └──────┬────────┘     └──────┬──────┘
         │                     │
         ▼                     ▼
       ┌─────────────┐        ┌─────────────┐
       │ GET /users/me│       │ GET /profiles/me
       └──────┬──────┘        └─────────────┘
         │
         ▼
       ┌─────────────┐
       │ getOrCreate │
       │ User by id  │
       └─────────────┘
```

### JWT Configuration

```typescript
// Backend — auth0.middleware.ts
checkJwt = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
```

### Auth Middleware Pipeline

Every protected endpoint goes through:
1. **`checkJwt`** — Validates the Bearer token with shared secret
2. **`attachUserId`** — Extracts `req.auth.payload.sub` when ObjectId-compatible

```typescript
// middlewares/auth0.middleware.ts
export default [checkJwt, attachUserId] as RequestHandler[];
```

### Auth Bootstrap (Frontend)

After session restoration, the app fetches profile state and enforces onboarding guards before entering protected routes.

---

## 4. Backend Module Architecture

```
backend/src/
├── app.ts                          # Express app setup (middleware + routes)
├── server.ts                       # HTTP server + Socket.IO bootstrap
├── config/
│   ├── env.ts                      # Zod-validated environment variables
│   └── prisma.ts                   # PrismaClient singleton
├── middlewares/
│   ├── auth0.middleware.ts         # JWT validation + userId extraction
│   └── controller-chain.middleware.ts  # Auth precondition + domain error mapping chain
├── modules/
│   ├── users.controllers.ts        # GET /users/me
│   ├── users.routes.ts             # Router for /users
│   ├── users.service.ts            # getOrCreateUser()
│   ├── profiles/
│   │   ├── profiles.controller.ts  # GET/POST /profiles/me
│   │   ├── profiles.routes.ts
│   │   └── profiles.service.ts     # getProfileByUserId(), ProfileUpsertService-based upsert
│   ├── preferences/
│   │   ├── preferences.controller.ts  # GET/POST /preferences/me
│   │   ├── preferences.routes.ts
│   │   └── preferences.service.ts     # Weight validation + PreferenceUpsertService-based upsert
│   ├── matching/
│   │   ├── matching.controller.ts  # GET /matching/me
│   │   ├── matching.routes.ts
│   │   └── matching.service.ts     # Strategy seams + deterministic tie-order ranking
│   ├── discovery/
│   │   ├── discovery.controller.ts # GET /discovery/feed, POST /discovery/swipe
│   │   ├── discovery.routes.ts
│   │   └── discovery.service.ts    # Feed generation + swipe handler
│   ├── matches/
│   │   ├── matches.controller.ts   # GET /matches/me
│   │   ├── matches.routes.ts
│   │   └── matches.service.ts      # Mutual like detection + match creation
│   └── chat/
│       ├── chat.controller.ts      # GET /chat/:matchId
│       ├── chat.routes.ts
│       ├── chat.service.ts         # Conversation + message CRUD
│       └── chat.socket.ts          # Socket.IO event handlers
│   └── shared/
│       └── upsert-by-user-id.service.ts  # Shared upsert lifecycle abstraction
└── types/
    ├── api.ts                      # ApiResponse<T>, PaginatedResponse<T>
    ├── auth.ts                     # Auth0User, AuthRequest
    ├── database.ts                 # User, Profile, Match interfaces
    └── socket.ts                   # ServerToClientEvents, ClientToServerEvents
```

### Module Pattern

Every backend module follows the **Controller → Service → Prisma** pattern:

```
Route (auth middleware) → Controller (request/response) → Service (business logic) → Prisma (DB)
```

Cross-cutting backend notes:
- `withAuthenticatedController(...)` standardizes auth preconditions and error mapping for protected controllers.
- `UpsertByUserIdService` removes duplicated create/update lifecycle branches in profile and preference services.
- Matching internals expose strategy seams (`EligibilityStrategy`, `ScoringStrategy`) while preserving external output contract.
- Tie scores are resolved deterministically by insertion order to keep stable ranking output.

---

## 5. Express App Configuration

```typescript
// app.ts — Middleware stack (applied in order)
app.use(helmet());                    // Security headers
app.use(cors({
  origin: env.FRONTEND_URL,           // "http://localhost:5173"
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,           // 15 minutes
  max: 100,                            // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(express.json());              // JSON body parser

// Route registration
app.use('/matching',    matchingRoutes);
app.use('/profiles',    profileRoutes);
app.use('/discovery',   discoveryRoutes);
app.use('/users',       userRoutes);
app.use('/matches',     matchRoutes);
app.use('/chat',        chatRoutes);
app.use('/preferences', preferenceRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok' }));
```

### Server Bootstrap

```typescript
// server.ts
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' }   // ← NOTE: Socket.IO CORS is more permissive than Express
});
registerChatSocket(io);
server.listen(PORT || 4000);
```

---

## 6. Environment Configuration

### Backend `.env`

```env
PORT=4000
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster0.vthoeo7.mongodb.net/flately"
AUTH0_DOMAIN=dev-aobtnrv6g50bmj1a.us.auth0.com
AUTH0_AUDIENCE=http://localhost:4000
FRONTEND_URL="http://localhost:5173"
```

### Frontend runtime config (`frontend/frontend/.env.example`)

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_AUTH0_DOMAIN=dev-aobtnrv6g50bmj1a.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=http://localhost:4000
```

Runtime wiring notes:
- Frontend transport and Auth0 values are read through `runtimeConfig`.
- No frontend source edits are required per environment when these variables are set.

### Zod Validation

```typescript
// config/env.ts
const envSchema = z.object({
  PORT:           z.coerce.number().default(4000),
  DATABASE_URL:   z.string().min(1, 'DATABASE_URL is required'),
  AUTH0_DOMAIN:   z.string().min(1, 'AUTH0_DOMAIN is required'),
  AUTH0_AUDIENCE: z.string().min(1, 'AUTH0_AUDIENCE is required'),
  FRONTEND_URL:   z.string().default('http://localhost:5173'),
});
// Exits process on validation failure
```

---

## 7. Frontend Architecture

```
frontend/frontend/src/
├── main.tsx                           # App entry point (Auth0Provider + Redux + Router)
├── index.css                          # Design tokens + TailwindCSS v4 theme
├── app/
│   ├── router.tsx                     # React Router configuration (all routes)
│   ├── store.ts                       # Redux store (6 slices)
│   ├── AppLayout.tsx                  # Sidebar + Outlet layout (Framer Motion)
│   └── ProtectedRoute.tsx             # Auth guard (redirects to / if unauthenticated)
├── pages/
│   ├── Landing.tsx                    # Public landing page (Hero, How It Works, CTA)
│   ├── Login.tsx                      # Placeholder
│   └── NotFound.tsx                   # 404 page
├── features/
│   ├── auth/
│   │   ├── authSlice.ts               # Redux: {isAuthenticated, user, loading}
│   │   └── AuthSync.tsx               # Syncs Auth0 state → Redux + backend
│   ├── onboarding/
│   │   ├── OnboardingPage.tsx         # 5-step onboarding form
│   │   ├── ProfileForm.tsx            # Legacy simple profile form
│   │   └── onboardingSlice.ts         # Redux: {profile, loading, completed}
│   ├── discovery/
│   │   ├── DiscoveryPage.tsx          # Split-panel: queue + profile detail
│   │   └── discoverySlice.ts          # Redux: {feed[], loading}
│   ├── matches/
│   │   ├── MatchesPage.tsx            # Data table with filters, sparklines
│   │   └── matchesSlice.ts            # Redux: {list[], loading}
│   ├── chat/
│   │   ├── ChatPage.tsx               # 3-panel: threads + messages + intel
│   │   ├── chatSlice.ts               # Redux: {conversations{}, activeId, loading}
│   │   └── socket.ts                  # Socket.IO client instance
│   ├── preferences/
│   │   ├── PreferencesPage.tsx         # Preferences editor
│   │   ├── PreferenceForm.tsx          # Preference form component
│   │   └── preferencesSlice.ts         # Redux slice
│   ├── dashboard/
│   │   └── DashboardPage.tsx          # 3-column: signals + stats + criteria
│   └── rooms/                         # (placeholder module — not yet implemented)
├── components/
│   ├── common/
│   │   └── Stepper.tsx                # Step indicator component
│   ├── layout/
│   │   ├── AppSidebar.tsx             # Navigation sidebar (fixed, 256px)
│   │   └── Navbar.tsx                 # Top navbar for landing page
│   └── ui/
│       ├── Button.tsx                 # Reusable button
│       ├── Card.tsx                   # Card component
│       ├── Input.tsx                  # Input component
│       ├── NoiseLayer.tsx             # Visual noise texture overlay
│       ├── Skeleton.tsx               # Loading skeleton
│       └── index.ts                   # Barrel export
├── services/
│   ├── api.ts                         # Axios client + apiRequest(path, options, getToken)
│   └── auth0.ts                       # Placeholder
├── lib/
│   └── utils.ts                       # cn() — clsx + tailwind-merge
└── types/
    └── index.ts                       # User, Profile, Preference, Match interfaces
```

### Component Hierarchy

```
<StrictMode>
  <Auth0Provider>       ← Auth0 context
    <Provider store>    ← Redux store
      <AuthSync>        ← Auto-syncs Auth0 → Redux + backend
        <RouterProvider>
          ├── <Landing />                             (path: /)
          ├── <AppLayout>                             (wrapper with sidebar)
          │     <AppSidebar />                        (fixed sidebar, 256px)
          │     <motion.main>                         (animated content area)
          │       <ProtectedRoute>                    (auth guard)
          │         ├── <DashboardPage />              (path: /app)
          │         ├── <OnboardingPage />             (path: /app/onboarding)
          │         ├── <DiscoveryPage />              (path: /app/discover)
          │         ├── <MatchesPage />                (path: /app/matches)
          │         └── <ChatPage />                   (path: /app/chat/:matchId?)
          │       </ProtectedRoute>
          │     </motion.main>
          │   </AppLayout>
          └── <NotFound />                            (path: *)
```

---

## 8. State Management (Redux Toolkit)

```typescript
// app/store.ts
export const store = configureStore({
  reducer: {
    auth:        authReducer,        // {isAuthenticated, user, loading}
    onboarding:  onboardingReducer,  // {profile, loading, completed}
    preferences: preferenceReducer,  // Preference form state
    discovery:   discoveryReducer,   // {feed[], loading}
    matches:     matchesReducer,     // {list[], loading}
    chat:        chatReducer,        // {conversations{}, activeConversationId, loading, error}
  }
});
```

### Slice Actions Summary

| Slice | Actions |
|---|---|
| `auth` | `setAuth(user)`, `clearAuth()` |
| `onboarding` | `startLoading()`, `setProfile(profile)` |
| `discovery` | `start()`, `setFeed(feed)`, `removeUser(userId)` |
| `matches` | `start()`, `setMatches(list)` |
| `chat` | `setLoading()`, `setActiveConversation(id)`, `setConversation({id, messages})`, `addMessage({conversationId, message})`, `setError(msg)`, `clearChat()` |
| `preferences` | (standard CRUD pattern) |

---

## 9. API Client Pattern

```typescript
// services/api.ts
const api = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export async function apiRequest(path, options = {}, getToken) {
  const token = await getToken();
  const response = await api({
    url: path,
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
```

**Usage pattern across all pages:**
```typescript
const { getAccessTokenSilently } = useAuth0();
const data = await apiRequest('/endpoint', { method: 'POST', data: body }, getAccessTokenSilently);
```

---

## 10. Real-Time Communication (Socket.IO)

### Server-Side

```typescript
// chat.socket.ts
io.on('connection', (socket) => {
  socket.on('joinRoom', (conversationId) => socket.join(conversationId));
  socket.on('join', (conversationId) => socket.join(conversationId)); // alias
  socket.on('sendMessage', async ({ conversationId, senderId, content }) => {
    const msg = await sendMessage(conversationId, senderId, content);
    const payload = {
      id: msg.id, senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      timestamp: msg.createdAt.toISOString(),
    };
    io.to(conversationId).emit('message', payload);
    io.to(conversationId).emit('new_message', payload); // alias
  });
  socket.on('send_message', async ({ conversationId, senderId, content }) => {
    const msg = await sendMessage(conversationId, senderId, content);
    const payload = {
      id: msg.id, senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      timestamp: msg.createdAt.toISOString(),
    };
    io.to(conversationId).emit('message', payload);
    io.to(conversationId).emit('new_message', payload); // alias
  });
});
```

### Client-Side

```typescript
// chat/socket.ts
export const socket = io(runtimeConfig.socketUrl);

// ChatPage.tsx
socket.emit('joinRoom', conversationId);
socket.emit('sendMessage', { conversationId, senderId, content });
socket.on('message', (msg) => setMessages(prev => [...prev, msg]));
socket.on('new_message', (msg) => setMessages(prev => [...prev, msg])); // alias
```

### Socket Event Contract

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `joinRoom` (canonical), `join` (alias) | `conversationId: string` |
| Client → Server | `sendMessage` (canonical), `send_message` (alias) | `{ conversationId, senderId, content }` |
| Server → Client | `message` (canonical), `new_message` (alias) | `{ id, senderId, content, createdAt, timestamp }` |

---

## 11. Routing Map

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `Landing` | No | Public landing page |
| `/app` | `DashboardPage` | Yes | Main dashboard |
| `/app/onboarding` | `OnboardingPage` | Yes | 5-step profile setup |
| `/app/discover` | `DiscoveryPage` | Yes | Browse potential roommates |
| `/app/matches` | `MatchesPage` | Yes | View match history |
| `/app/chat/:matchId?` | `ChatPage` | Yes | Real-time messaging |
| `*` | `NotFound` | No | 404 page |

---

## 12. Build & Development Commands

### Backend

```bash
cd backend
npm install
npm run dev          # tsx watch src/server.ts (hot reload)
npm run build        # tsc → dist/
npm run start:prod   # node dist/server.js
npm run seed         # Seed 8 demo users + matches + conversations
npm run seed:reset   # Remove all demo data (auth0id starts with "demo_")
npm run typecheck    # tsc --noEmit
```

### Frontend

```bash
cd frontend/frontend
npm install
npm run dev          # vite dev server on port 5173
npm run build        # vite build → dist/
npm run preview      # vite preview (production build preview)
npm run lint         # eslint
npm run storybook    # storybook dev on port 6006
```
