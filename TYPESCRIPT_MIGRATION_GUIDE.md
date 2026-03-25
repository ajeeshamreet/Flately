# 🚀 TypeScript Migration Guide - Flately

## Quick Start

This guide will help you migrate the Flately MERN stack application from JavaScript to TypeScript systematically.

## 📊 Project Overview

**Files to Migrate:**
- Backend: 25 JavaScript files
- Frontend: 41 JSX/JS files
- Total: 66 files

**Estimated Time:** 15-23 hours

## 🎯 Migration Phases

### Phase 1: Setup (1-2 hours)

#### 1.1 Install TypeScript Dependencies

**Backend:**
```bash
cd backend
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt ts-node
```

**Frontend:**
```bash
cd frontend/frontend
npm install -D typescript
# @types/react and @types/react-dom already installed
```

#### 1.2 Create TypeScript Configurations

**Backend tsconfig.json:**
```bash
cd backend
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"],
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

**Frontend - Update vite.config.js to vite.config.ts:**
Already configured, just verify tsconfig.json exists.

#### 1.3 Update package.json Scripts

**Backend package.json:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --exec ts-node src/server.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### Phase 2: Backend Migration (4-6 hours)

#### 2.1 Create Type Definitions

Create `backend/src/types/` directory:

```bash
mkdir -p backend/src/types
```

**backend/src/types/express.d.ts:**
```typescript
import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  auth?: {
    payload: {
      sub: string;
    };
  };
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}
```

**backend/src/types/socket.ts:**
```typescript
import { Message } from '@prisma/client';

export interface ServerToClientEvents {
  new_message: (message: Message) => void;
}

export interface ClientToServerEvents {
  send_message: (data: SendMessagePayload) => void;
  join: (conversationId: string) => void;
}

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}
```

#### 2.2 Migration Order

**Step 1: Config files**
```
src/config/env.js → env.ts
src/config/prisma.js → prisma.ts
```

**Step 2: Middleware**
```
src/middlewares/auth0.middleware.js → auth0.middleware.ts
```

**Step 3: Services (all modules)**
```
src/modules/users.service.js → users.service.ts
src/modules/profiles/profiles.service.js → profiles.service.ts
src/modules/preferences/preferences.service.js → preferences.service.ts
src/modules/discovery/discovery.service.js → discovery.service.ts
src/modules/matching/matching.service.js → matching.service.ts
src/modules/matches/matches.service.js → matches.service.ts
src/modules/chat/chat.service.js → chat.service.ts
```

**Step 4: Controllers**
```
src/modules/users.controllers.js → users.controllers.ts
src/modules/profiles/profiles.controller.js → profiles.controller.ts
src/modules/preferences/preferences.controller.js → preferences.controller.ts
src/modules/discovery/discovery.controller.js → discovery.controller.ts
src/modules/matching/matching.controller.js → matching.controller.ts
src/modules/matches/matches.controller.js → matches.controller.ts
src/modules/chat/chat.controller.js → chat.controller.ts
```

**Step 5: Routes**
```
src/modules/users.routes.js → users.routes.ts
src/modules/profiles/profiles.routes.js → profiles.routes.ts
src/modules/preferences/preferences.routes.js → preferences.routes.ts
src/modules/discovery/discovery.routes.js → discovery.routes.ts
src/modules/matching/matching.routes.js → matching.routes.ts
src/modules/matches/matches.routes.js → matches.routes.ts
src/modules/chat/chat.routes.js → chat.routes.ts
```

**Step 6: Socket handler**
```
src/modules/chat/chat.socket.js → chat.socket.ts
```

**Step 7: Main app files**
```
src/app.js → app.ts
src/server.js → server.ts
```

**Step 8: Utils**
```
prisma/seed.js → seed.ts
```

### Phase 3: Frontend Migration (6-8 hours)

#### 3.1 Create Type Definitions

Create `frontend/frontend/src/types/` directory:

```bash
mkdir -p frontend/frontend/src/types
```

**frontend/src/types/index.ts:**
```typescript
export interface User {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export interface Profile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  occupation: string;
  city: string;
  hasRoom: boolean;
  onboardingCompleted: boolean;
}

export interface Preference {
  id: string;
  userId: string;
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
  otherUser: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    city: string;
    tags: string[];
  };
  compatibility: number;
  lastMessage?: string;
  conversationId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}
```

#### 3.2 Migration Order

**Step 1: Utilities & Services**
```
src/lib/utils.js → utils.ts
src/services/api.js → api.ts
src/services/auth0.js → auth0.ts
src/features/chat/socket.js → socket.ts
```

**Step 2: Redux Slices**
```
src/app/store.js → store.ts
src/features/auth/authSlice.js → authSlice.ts
src/features/onboarding/onboardingSlice.jsx → onboardingSlice.ts
src/features/preferences/preferencesSlice.jsx → preferencesSlice.ts
src/features/discovery/discoverySlice.js → discoverySlice.ts
src/features/matches/matchesSlice.js → matchesSlice.ts
src/features/chat/ChatSlice.js → ChatSlice.ts
```

**Step 3: UI Components**
```
src/components/ui/Button.jsx → Button.tsx
src/components/ui/Card.jsx → Card.tsx
src/components/ui/Input.jsx → Input.tsx
src/components/ui/Skeleton.jsx → Skeleton.tsx
src/components/ui/NoiseLayer.jsx → NoiseLayer.tsx
src/components/ui/index.js → index.ts
```

**Step 4: Common & Layout Components**
```
src/components/common/Stepper.jsx → Stepper.tsx
src/components/layout/Navbar.jsx → Navbar.tsx
src/components/layout/AppSidebar.jsx → AppSidebar.tsx
```

**Step 5: Auth Components**
```
src/features/auth/AuthSync.jsx → AuthSync.tsx
src/app/ProtectedRoute.jsx → ProtectedRoute.tsx
```

**Step 6: Forms**
```
src/features/onboarding/ProfileForm.jsx → ProfileForm.tsx
src/features/preferences/PreferenceForm.jsx → PreferenceForm.tsx
```

**Step 7: Onboarding Steps**
```
src/features/onboarding/steps/BasicInfoStep.jsx → BasicInfoStep.tsx
src/features/onboarding/steps/LifestyleStep.jsx → LifestyleStep.tsx
src/features/onboarding/steps/PreferencesStep.jsx → PreferencesStep.tsx
src/features/onboarding/steps/BudgetStep.jsx → BudgetStep.tsx
src/features/onboarding/steps/PhotosStep.jsx → PhotosStep.tsx
```

**Step 8: Feature Pages**
```
src/features/dashboard/DashboardPage.jsx → DashboardPage.tsx
src/features/discovery/discoveryPage.jsx → discoveryPage.tsx
src/features/matches/MatchesPage.jsx → MatchesPage.tsx
src/features/chat/ChatPage.jsx → ChatPage.tsx
src/features/onboarding/OnboardingPage.jsx → OnboardingPage.tsx
src/features/preferences/PreferencesPage.jsx → PreferencesPage.tsx
```

**Step 9: Public Pages**
```
src/pages/Landing.jsx → Landing.tsx
src/pages/Login.jsx → Login.tsx (if exists)
src/pages/NotFound.jsx → NotFound.tsx
```

**Step 10: Router & Layout**
```
src/app/router.jsx → router.tsx
src/app/AppLayout.jsx → AppLayout.tsx
```

**Step 11: Entry Point**
```
src/main.jsx → main.tsx
```

### Phase 4: Testing & Verification

#### 4.1 Type Check

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend/frontend
npx tsc --noEmit
```

#### 4.2 Runtime Testing

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend/frontend
npm run dev
```

#### 4.3 Verification Checklist

- [ ] TypeScript compilation succeeds (no errors)
- [ ] Backend server starts on port 4000
- [ ] Frontend dev server starts on port 5173
- [ ] Can login with Auth0
- [ ] Can complete onboarding
- [ ] Can view discovery feed
- [ ] Can swipe profiles
- [ ] Can see matches
- [ ] Can send chat messages
- [ ] Socket.io connection works
- [ ] API requests return expected data

## 🔥 Common Patterns

### Backend Express Controller

```typescript
import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/express';
import { Profile } from '@prisma/client';

export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse<Profile>>
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await profileService.getProfile(userId);
    res.json({ data: profile });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Frontend React Component

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  loading,
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      className={`btn ${variant} ${className}`}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
```

### Redux Slice

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '../../types';

interface DiscoveryState {
  feed: Profile[];
  loading: boolean;
  error: string | null;
}

const initialState: DiscoveryState = {
  feed: [],
  loading: false,
  error: null
};

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setFeed: (state, action: PayloadAction<Profile[]>) => {
      state.feed = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { setFeed, setLoading } = discoverySlice.actions;
export default discoverySlice.reducer;
```

### API Request with Types

```typescript
import axios from 'axios';
import { ApiResponse, Profile } from '../types';

export async function apiRequest<T>(
  path: string,
  options: any = {},
  getToken?: () => Promise<string>
): Promise<T> {
  const token = await getToken?.();

  const response = await axios({
    url: `http://localhost:4000${path}`,
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  return response.data;
}

// Usage
const profile = await apiRequest<ApiResponse<Profile>>('/profiles/me', {}, getToken);
```

## 🛠️ Troubleshooting

### Error: Cannot find module 'X'
**Solution:** Add `@types/X` package or create custom type definitions

### Error: Type 'X' is not assignable to type 'Y'
**Solution:** Check type definitions, may need to use type assertion or fix types

### Error: Object is possibly 'null' or 'undefined'
**Solution:** Add null checks or use optional chaining (`?.`) and nullish coalescing (`??`)

### Import errors after renaming files
**Solution:** Update all imports to use new `.ts`/`.tsx` extensions (or omit extension if using bundler)

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Redux Toolkit TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [Express TypeScript Guide](https://expressjs.com/en/advanced/typescript.html)

## 🎉 Success!

Once all files are migrated and tests pass, you'll have:
- ✅ Full type safety across the stack
- ✅ Better IDE autocomplete
- ✅ Catch bugs at compile time
- ✅ Self-documenting code
- ✅ Easier refactoring
- ✅ Better developer experience

Happy coding! 🚀
