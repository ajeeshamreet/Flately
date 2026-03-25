# Flately — System Architecture

> **Version**: 2.4 COMMAND  
> **Last Updated**: 2026-03-25  
> **Stack**: TypeScript Full-Stack · MongoDB · Auth0 · Socket.IO

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  React 19 + Vite 7 + Redux Toolkit + TailwindCSS v4            │
│  Auth0 SPA SDK + Socket.IO Client + Framer Motion              │
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
│  │  REST API    │  │  Socket.IO   │  │  Auth0 JWT Middleware │   │
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
| Auth0 (express-oauth2-jwt-bearer) | ^1.7.3 | JWT validation |
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
| Auth0 React SDK | ^2.11.0 | Authentication |
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

## 3. Authentication Flow (Auth0)

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐
│  Browser  │────▶│  Auth0    │────▶│  Callback  │────▶│  App     │
│  (Login)  │     │  Hosted   │     │  Redirect  │     │  /app    │
└──────────┘     │  Login    │     │  (origin)  │     └────┬─────┘
                 └───────────┘     └────────────┘          │
                                                           │ AuthSync
                                                           │ component
                                                           ▼
                                                    ┌─────────────┐
                                                    │ GET /users/me│
                                                    │ Bearer JWT   │
                                                    └──────┬──────┘
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │ getOrCreate  │
                                                    │ User (upsert)│
                                                    └─────────────┘
```

### Auth0 Configuration

```typescript
// Frontend — main.tsx
Auth0Provider config:
  domain:    "dev-aobtnrv6g50bmj1a.us.auth0.com"
  clientId:  "2Pz3Q6dir2WRg5lDLW8ucrmo3HG92cOR"
  audience:  "http://localhost:4000"
  redirect:  window.location.origin

// Backend — auth0.middleware.ts
checkJwt = auth({
  audience:       process.env.AUTH0_AUDIENCE,  // "http://localhost:4000"
  issuerBaseURL:  `https://${process.env.AUTH0_DOMAIN}/`,  // Auth0 tenant
  tokenSigningAlg: 'RS256'
});
```

### Auth Middleware Pipeline

Every protected endpoint goes through:
1. **`checkJwt`** — Validates the Bearer token against Auth0 JWKS
2. **`attachUserId`** — Extracts `req.auth.payload.sub` → `req.userId`

```typescript
// middlewares/auth0.middleware.ts
export default [checkJwt, attachUserId] as RequestHandler[];
```

### AuthSync Component (Frontend)

Automatically syncs Auth0 user with backend on login:

```typescript
// features/auth/AuthSync.tsx
useEffect(() => {
  if (!isLoading && isAuthenticated && user) {
    dispatch(setAuth(user));
    // POST /users/me — creates backend User record if not exists
    apiRequest("/users/me", {}, getAccessTokenSilently);
  }
}, [isAuthenticated, user, isLoading]);
```

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
│   └── auth0.middleware.ts         # JWT validation + userId extraction
├── modules/
│   ├── users.controllers.ts        # GET /users/me
│   ├── users.routes.ts             # Router for /users
│   ├── users.service.ts            # getOrCreateUser()
│   ├── profiles/
│   │   ├── profiles.controller.ts  # GET/POST /profiles/me
│   │   ├── profiles.routes.ts
│   │   └── profiles.service.ts     # getProfileByUserId(), createOrUpdateProfile()
│   ├── preferences/
│   │   ├── preferences.controller.ts  # GET/POST /preferences/me
│   │   ├── preferences.routes.ts
│   │   └── preferences.service.ts     # Weight validation (sum=100)
│   ├── matching/
│   │   ├── matching.controller.ts  # GET /matching/me
│   │   ├── matching.routes.ts
│   │   └── matching.service.ts     # Compatibility algorithm
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
  baseURL: 'http://localhost:4000',
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
  socket.on('join', (conversationId) => socket.join(conversationId));
  socket.on('send_message', async ({ conversationId, senderId, content }) => {
    const msg = await sendMessage(conversationId, senderId, content);
    io.to(conversationId).emit('new_message', {
      id: msg.id, senderId: msg.senderId,
      content: msg.content, timestamp: msg.createdAt
    });
  });
});
```

### Client-Side

```typescript
// chat/socket.ts
export const socket = io("http://localhost:4000");

// ChatPage.tsx
socket.emit('join', conversationId);
socket.emit('send_message', { conversationId, senderId, content });
socket.on('new_message', (msg) => setMessages(prev => [...prev, msg]));
```

### Socket Event Contract

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join` | `conversationId: string` |
| Client → Server | `send_message` | `{ conversationId, senderId, content }` |
| Server → Client | `new_message` | `{ id, senderId, content, timestamp }` |

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
