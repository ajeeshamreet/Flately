# Flately — Frontend Architecture & Component Guide

> Canonical journey reference: `docs/product-user-flow.md`.
> This file focuses on frontend implementation details.

> **Framework**: React 19 + Vite 7 + TypeScript  
> **Styling**: TailwindCSS v4 (with `@import "tailwindcss"` + `@theme` directive)  
> **State**: Redux Toolkit  
> **Routing**: React Router DOM v6  
> **Auth**: Manual email/password with backend JWT session

---

## 0. Product User Flow Reference

Primary source of truth for user-state transitions and route guards:

- `docs/product-user-flow.md`

Implementation contract summary:

- Public routes: `/`, `/start`, `/signup`, `/login`
- Protected routes: `/app/*`
- Guard behavior:
  - unauthenticated -> `/login`
  - authenticated + incomplete onboarding -> `/app/onboarding`
  - authenticated + completed onboarding -> app surfaces
- Supported auth endpoints:
  - `POST /auth/signup`
  - `POST /auth/login`
- Unsupported auth endpoints:
  - no OAuth provider callbacks
  - no `/auth/google/*`

---

## 1. Project Structure

```
frontend/frontend/
├── index.html                    # Entry HTML with Google Fonts + Material Symbols
├── vite.config.js                # Vite + React + TailwindCSS plugin + path aliases
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── src/
│   ├── main.tsx                  # Root: Auth0Provider → Redux Provider → AuthSync → Router
│   ├── index.css                 # Design system tokens + TailwindCSS theme
│   ├── app/
│   │   ├── router.tsx            # All route definitions
│   │   ├── store.ts              # Redux store with 6 slices
│   │   ├── AppLayout.tsx         # Sidebar + stable flex content shell
│   │   └── ProtectedRoute.tsx    # Auth guard component
│   ├── pages/
│   │   ├── Landing.tsx           # Public marketing page
│   │   ├── Login.tsx             # Placeholder
│   │   └── NotFound.tsx          # 404 page
│   ├── features/                 # Feature modules (slice + page)
│   │   ├── auth/                 # Auth state sync
│   │   ├── onboarding/           # 5-step profile setup
│   │   ├── discovery/            # Roommate browsing
│   │   ├── matches/              # Match history table
│   │   ├── chat/                 # Real-time messaging
│   │   ├── preferences/          # Preference editor
│   │   ├── dashboard/            # Main dashboard
│   │   └── rooms/                # (not yet implemented)
│   ├── components/               # Shared components
│   │   ├── common/               # Stepper, etc.
│   │   ├── layout/               # AppSidebar, Navbar
│   │   └── ui/                   # Button, Card, Input, Skeleton, NoiseLayer
│   ├── services/
│   │   ├── api.ts                # Axios + apiRequest()
│   │   └── auth0.ts              # Placeholder
│   ├── lib/
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   └── types/
│       └── index.ts              # TypeScript interfaces
```

---

## 2. Design System Tokens

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --font-display: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Primary — Forest Green */
  --color-primary: #166534;
  --color-primary-dark: #14532d;
  --color-mint: #F0FDF4;

  /* Neutrals */
  --color-neutral-border: #e5e7eb;
  --color-canvas: #FAFAFA;
  --color-surface: #ffffff;
}
```

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#166534` | Buttons, active states, accents, icons |
| `primary-dark` | `#14532d` | Hover states |
| `mint` | `#F0FDF4` | Selected/active backgrounds, subtle highlights |
| `canvas` | `#FAFAFA` | Page background |
| `surface` | `#ffffff` | Card/panel backgrounds |
| `neutral-border` | `#e5e7eb` | Borders, dividers |

### Typography

| Font Family | CSS Variable | Design Usage |
|---|---|---|
| Inter (300-900) | `font-display` | Body text, headings, UI labels |
| JetBrains Mono (400-700) | `font-mono` | Data values, codes, IDs, tags, scores |

### Icons

- **Material Symbols Outlined** via Google Fonts CDN
- CSS class: `.material-symbols-outlined`
- Fill variant: `.icon-fill` (sets `FILL 1`)

---

## 3. Design Aesthetic — "Command Center"

The UI follows a **data-dense operational dashboard** aesthetic:

- Monospace font for data/metrics (`font-mono`)
- Uppercase tracking-wide labels (`text-[10px] font-bold uppercase tracking-widest`)
- Green accent color (`#166534`) on dark-text backgrounds
- Compact data grids with border separators
- Mint-green highlights for active/selected states
- SVG sparklines in match tables
- Session IDs and system status indicators
- Code-like labels (e.g., `// SELECT_GENDER_IDENTITY`, `01_BASIC_INTEL`)

### Design-1 layout coherence baseline (2026-04-05)

- App shell uses a stable flex geometry: fixed-width sidebar + `min-w-0` content region.
- Core app pages (dashboard/discovery/matches/chat) use consistent outer rhythm (`p-4 md:p-6`) and bounded desktop containers.
- Multi-panel pages use explicit overflow boundaries and responsive panel stacking where needed.
- Discovery, matches, and chat now share a common loading/empty visual language (spinner card + dashed empty-state card).

---

## 4. Page-by-Page Breakdown

### 4.1 Landing Page (`/`)

**File**: `pages/Landing.tsx`

Sections:
1. **Hero** — Split: text (left) + profile card mockup (right)
2. **How It Works** — 3-step grid (Create Profile → Get Matched → Connect)
3. **Safety First** — Trust signals (ID Verified, Background Checks, Social Proof)
4. **CTA** — Full-width green banner
5. **Footer** — 4-column links with Flately branding

Key interactions:
- "Get Started Free" → `loginWithRedirect({ screen_hint: 'signup' })`
- "See How It Works" → smooth scroll to `#how-it-works`

---

### 4.2 Dashboard (`/app`)

**File**: `features/dashboard/DashboardPage.tsx`

3-column layout:
1. **Incoming Signals** — Recent messages list with avatars, timestamps
2. **Stats Panel**:
   - Profile Visibility (sparkline chart, conversion rate, avg time)
   - Match Efficiency (progress bars: response rate, profile completion)
3. **Algorithm Criteria** — Checklist of location/lifestyle criteria + map thumbnail

Design-1 notes:
- Outer page rhythm normalized to match other app surfaces.
- Desktop content width aligned with shared max container sizing for shell consistency.

All data is currently **demo/hardcoded**. Not wired to API yet.

---

### 4.3 Onboarding (`/app/onboarding`)

**File**: `features/onboarding/OnboardingPage.tsx`

5-step wizard form with `react-hook-form` + Zod validation:

| Step | Key | Fields | UI Pattern |
|---|---|---|---|
| 1 | BASIC_INTEL | gender, age, occupation | TileRadio grid selection |
| 2 | LOCATION | city | Text input |
| 3 | BUDGET | budgetMin, budgetMax | Number inputs |
| 4 | HABITS | smoking, pets | TileRadio grid selection |
| 5 | REVIEW | (none) | Summary panel |

**Zod Schema:**
```typescript
const onboardingSchema = z.object({
  name: z.string().min(2),
  age: z.number().min(18).max(99),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  bio: z.string().max(500).optional(),
  sleepSchedule: z.enum(['early-bird', 'night-owl', 'flexible']),
  cleanliness: z.number().min(1).max(5),
  noiseLevel: z.number().min(1).max(5),
  guestPolicy: z.enum(['never', 'rarely', 'sometimes', 'often']),
  smoking: z.enum(['no', 'outside', 'yes']),
  pets: z.enum(['no', 'have', 'love', 'allergic']),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  city: z.string().min(2),
  moveInDate: z.string().optional(),
  photos: z.array(z.string()).optional(),
  occupation: z.enum(['student', 'professional']).optional(),
});
```

**On Submit:**
1. `POST /profiles/me` — Save profile data (name, age, gender, bio, city)
2. `POST /preferences/me` — Save preferences with default weights (25 each)
3. Navigate to `/app`

**Custom Component — TileRadio:**
```typescript
function TileRadio({ name, value, checked, onChange, icon, label, desc, size }) {
  // Radio button styled as a selectable card tile
  // Green border + mint background when selected
  // Material Symbol icon + monospace label
}
```

---

### 4.4 Discovery (`/app/discover`)

**File**: `features/discovery/DiscoveryPage.tsx`

Split-panel layout:
- **Left (320px-360px responsive)**: Queue panel — scrollable list of candidate cards with scores
- **Right (flex)**: Profile detail — photos, bio, tags, data grid (budget, timeline, lifestyle, map)

Design-1 notes:
- Shared loading/empty states added without changing discovery data flow.
- Panel container now has bounded overflow and responsive stacking behavior on smaller widths.

Design-2 notes:
- Loading/empty/error states now render explicit status copy and retry handling for load failures.
- Non-wired queue controls (search, filters, prev/next shortcuts) are intentionally disabled/labeled to avoid false affordances.
- Queue rows use keyboard-focusable button semantics for clearer interaction and accessibility.

Data sources:
- **Initial**: Hardcoded `DEMO_PROFILES` array (5 profiles)
- **API**: Uses canonical `GET /discovery/feed` via `discovery.transport.ts`
- **Compatibility**: Backend still accepts `GET /discovery` as a legacy alias

Actions:
- **Pass**: Remove from queue → `handlePass()`
- **Connect (canonical)**: `POST /discovery/swipe` with `{ toUserId, action: "like" }`
- **Connect (legacy alias)**: `POST /matches/connect/:toUserId` remains available for backward compatibility

---

### 4.5 Matches (`/app/matches`)

**File**: `features/matches/MatchesPage.tsx`

Data table with:
- Search bar + filters (Status, Date, Budget)
- Table columns: Candidate, Status, Match %, Engagement (SVG sparkline), Last Active, Actions
- Status badges: `Matched` (green), `Passed` (gray), `Archived` (amber)
- Hover actions: Re-connect, Archive, Delete

Design-1 notes:
- Shared loading/empty states added for archive list rendering.
- Table container uses explicit horizontal overflow handling with a minimum table width for readability.

Design-2 notes:
- Error state rendering added for matches fetch failure, alongside readable loading and empty state copy.
- Non-wired filter/search/table utility controls are disabled and relabeled as coming soon.
- Pagination controls are explicitly disabled pending data paging integration.

Data sources:
- **Initial**: Hardcoded `DEMO_MATCHES` array (5 matches)
- **API**: Fetches `GET /matches/me` on mount

---

### 4.6 Chat (`/app/chat/:matchId?`)

**File**: `features/chat/ChatPage.tsx`

3-panel layout:
- **Left (320px)**: Thread list with last message preview, unread indicators
- **Center (flex)**: Message bubbles (green for sent, white for received) + input
- **Right (320px, xl only)**: Match Intel panel — score, budget, tags, private notes

Design-1 notes:
- Shared loading/empty states added for no-conversation and initial load conditions.
- Chat shell now uses a bounded panel container with consistent page rhythm and responsive overflow behavior.

Design-2 notes:
- Error state rendering with retry added for chat initialization failures.
- Thread rows now use button semantics and focus-visible states for keyboard navigation clarity.
- Non-wired affordances (thread search/tabs, utility actions, intel-side actions) are disabled or relabeled to align visuals with behavior.

**Real-time flow:**
1. On mount: Fetch matches → build conversations list
2. On active chat: `GET /chat/:matchId` → load messages
3. Socket join: `emit('joinRoom', conversationId)` (canonical)
4. Send: Optimistic UI + `emit('sendMessage', ...)` (canonical)
5. Receive: subscribe to `message` (canonical) and `new_message` (alias) during compatibility window

```typescript
// socket.ts
export const socket = io(runtimeConfig.socketUrl);
```

---

## 5. AppSidebar

**File**: `components/layout/AppSidebar.tsx`

Fixed sidebar (w-64 / 256px, sticky in shell) with:

Navigation items:
| Icon | Label | Path | Badge |
|---|---|---|---|
| `dashboard` | Dashboard | `/app` | — |
| `explore` | Discovery | `/app/discover` | — |
| `group` | Matches | `/app/matches` | "12" |
| `chat` | Messages | `/app/chat` | Green dot |
| `calendar_month` | Calendar | `/app/calendar` | — |

Bottom items:
| Icon | Label | Path |
|---|---|---|
| `tune` | Filters | `/app/filters` |
| `settings` | Settings | `/app/settings` |

Active state: `bg-mint text-[#166534] border-emerald-100`

User section at bottom: Auth0 user avatar + name + monospace ID.

### Route Coverage Matrix (Router vs Sidebar)

| Route | Router Defined | Sidebar Link | Status |
|---|---|---|---|
| `/app` | Yes | Yes (Dashboard) | Resolved |
| `/app/discover` | Yes | Yes (Discovery) | Resolved via primary sidebar link (D1-007) |
| `/app/matches` | Yes | Yes (Matches) | Resolved |
| `/app/chat/:matchId?` | Yes | Yes (`/app/chat`) | Resolved |
| `/app/onboarding` | Yes | No | Intentional onboarding flow route |
| `/app/calendar` | Yes (placeholder) | Yes (Calendar) | Resolved via placeholder route (Policy A, UI-001) |
| `/app/filters` | Yes (placeholder) | Yes (Filters) | Resolved via placeholder route (Policy A, UI-002) |
| `/app/settings` | Yes (placeholder) | Yes (Settings) | Resolved via placeholder route (Policy A, UI-003) |

---

## 6. Redux Store Architecture

```typescript
// app/store.ts
const store = configureStore({
  reducer: {
    auth:        authReducer,        // features/auth/authSlice.ts
    onboarding:  onboardingReducer,  // features/onboarding/onboardingSlice.ts
    preferences: preferenceReducer,  // features/preferences/preferencesSlice.ts
    discovery:   discoveryReducer,   // features/discovery/discoverySlice.ts
    matches:     matchesReducer,     // features/matches/matchesSlice.ts
    chat:        chatReducer,        // features/chat/chatSlice.ts
  }
});
```

### Auth Slice

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: Auth0User | null;
  loading: boolean;
}
// Actions: setAuth(user), clearAuth()
```

### Onboarding Slice

```typescript
interface OnboardingState {
  profile: Profile | null;
  loading: boolean;
  completed: boolean;
}
// Actions: startLoading(), setProfile(profile)
```

### Discovery Slice

```typescript
interface DiscoveryState {
  feed: DiscoveryProfile[];
  loading: boolean;
}
// Actions: start(), setFeed(feed), removeUser(userId)
```

### Matches Slice

```typescript
interface MatchesState {
  list: Match[];
  loading: boolean;
}
// Actions: start(), setMatches(list)
```

### Chat Slice

```typescript
interface ChatState {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
}
// Actions: setLoading(), setActiveConversation(id),
//   setConversation({conversationId, messages}),
//   addMessage({conversationId, message}),
//   setError(msg), clearChat()
```

---

## 7. Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // @ → src/
    }
  },
  test: {
    projects: [{
      plugins: [storybookTest({ configDir: '.storybook' })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{ browser: 'chromium' }]
        }
      }
    }]
  }
});
```

**Import alias**: `@/` maps to `src/`, used throughout as `@/services/api`, `@/features/...`, etc.

---

## 8. TypeScript Interfaces (Frontend)

```typescript
// types/index.ts
export interface User {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Profile {
  id: string;
  userId: string;
  age?: number;
  gender?: string;
  occupation?: string;
  city?: string;
  hasRoom?: boolean;
  onboardingCompleted?: boolean;
}

export interface Preference {
  genderPreference: 'male' | 'female' | 'any';
  minBudget: number;
  maxBudget: number;
  city: string;
  cleanliness: number;
  sleepSchedule: number;
  smoking: boolean;
  drinking: boolean;
  pets: boolean;
  socialLevel: number;
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
}

export interface Match {
  id: string;
  matchedAt: string;
  compatibility: number;
  conversationId?: string | null;
}
```

---

## 9. External CDN Dependencies (index.html)

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900
  &family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:
  wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

**Note**: The `<script>` tag references `/src/main.jsx` but the actual file is `main.tsx`. Vite handles this via its JSX transform.

---

## 10. Minimal UI Redesign Execution Plan

Frontend redesign execution is tracked in:
- `docs/minimal-ui-redesign-plan.md`

Use that plan as the implementation source for:
- Route closure work for calendar, filters, and settings links
- Verification-first rollout gates across matching, discovery, matches, and chat flows
- Design-0, Design-1, and Design-2 phased delivery checkpoints
