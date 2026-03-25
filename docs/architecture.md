# Flately — System Architecture

## Overview

Flately is a roommate-matching application built on a modern full-stack TypeScript architecture. The system follows a **modular monolith** pattern on the backend with a **feature-based** frontend structure.

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React 19 + Vite)"]
        UI[React Components]
        Redux[Redux Toolkit Store]
        Auth0SDK[Auth0 React SDK]
        SocketClient[Socket.io Client]
    end

    subgraph Backend["Backend (Express.js + TypeScript)"]
        Routes[Express Routes]
        Auth[Auth0 JWT Middleware]
        Controllers[Controllers]
        Services[Service Layer]
        Prisma[Prisma ORM]
        SocketServer[Socket.io Server]
    end

    subgraph External["External Services"]
        MongoDB[(MongoDB Atlas)]
        Auth0Service[Auth0 IdP]
    end

    UI --> Redux
    Redux --> |HTTP/REST| Routes
    Auth0SDK --> Auth0Service
    SocketClient --> |WebSocket| SocketServer
    Routes --> Auth --> Controllers --> Services --> Prisma --> MongoDB
    Auth --> Auth0Service
```

## Backend Module Map

```
backend/src/
├── config/          # Environment & Prisma client
├── middlewares/     # Auth0 JWT validation
├── types/           # Shared TypeScript types
└── modules/
    ├── users        # User CRUD (Auth0 sync)
    ├── profiles/    # Profile management
    ├── preferences/ # Matching preferences
    ├── discovery/   # Feed & swipe actions
    ├── matching/    # Compatibility algorithm
    ├── matches/     # Match lifecycle
    └── chat/        # Messages + Socket.io
```

Each module follows the pattern: `routes → controller → service → Prisma`.

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React
    participant RX as Redux
    participant API as Express API
    participant MW as Auth0 Middleware
    participant SVC as Service
    participant DB as MongoDB

    U->>R: Interaction
    R->>RX: Dispatch Action
    RX->>API: HTTP Request + Bearer Token
    API->>MW: Validate JWT
    MW->>API: userId extracted
    API->>SVC: Business Logic
    SVC->>DB: Prisma Query
    DB-->>SVC: Result
    SVC-->>API: Response
    API-->>RX: JSON Data
    RX-->>R: State Update
    R-->>U: UI Render
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | MongoDB Atlas | Flexible schema for user profiles, Prisma ORM support |
| Auth | Auth0 | Managed OAuth2/JWT, social login, zero custom auth code |
| Real-time | Socket.io | Bi-directional messaging, room-based conversations |
| State | Redux Toolkit | Predictable state, devtools, slices pattern |
| Styling | Tailwind CSS v4 | `@theme` directive, OKLCH colors, fluid typography |
| Validation | Zod | Runtime + compile-time validation, env vars |
| Build | Vite | Fast HMR, native ESM, React plugin |

## Entity Relationships

```mermaid
erDiagram
    User ||--o| Profile : has
    User ||--o| Preference : has
    User ||--o{ Swipe : sends
    User }|--o{ Match : participates
    Match ||--|| Conversation : has
    Conversation ||--o{ Message : contains
```

## Environment Variables

Validated at startup via Zod in `config/env.ts`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Server port |
| `DATABASE_URL` | **Yes** | — | MongoDB connection string |
| `AUTH0_DOMAIN` | **Yes** | — | Auth0 tenant domain |
| `AUTH0_AUDIENCE` | **Yes** | — | Auth0 API audience |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |
