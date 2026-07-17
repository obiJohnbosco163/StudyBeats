# StudyBeats

StudyBeats is an AI-powered study soundtrack app that turns uploaded lecture notes into reusable study artifacts such as songs, playlists, flashcards, quizzes, and guided study sessions.

The project combines a React 19 + Vite frontend with a Hono-based Cloudflare Worker backend and uses Poof/Tarobase-backed auth and data persistence for connected users while preserving a guest-mode demo flow in the browser.

## What this app does

- Upload study material from PDF, DOCX, or plain text
- Extract and analyze note content
- Generate a learning package with flashcards and quiz content
- Turn notes into vocal-style, genre-driven song lyrics
- Produce a mock or provider-backed music track and save it as a song
- Organize content into playlists, study sessions, favorites, history, and downloads
- Support both wallet-connected users and guest-mode usage without requiring a wallet

## Tech stack

### Frontend

- React 19
- Vite 6
- TypeScript
- Tailwind CSS
- React Router
- shadcn-style UI primitives
- Sonner for toast messaging
- Lucide React icons

### Backend

- Hono
- Cloudflare Workers / PartyServer
- AI generation endpoints for analysis, summaries, flashcards, quiz, lyrics, and music
- Tarobase-backed collections for authenticated users
- Local guest database storage for browser-only demo mode

## Project structure

```text
src/
  components/          # Pages, app shell, UI, player, generation flow
  contexts/            # Auth and player contexts
  hooks/               # Custom hooks and realtime subscriptions
  lib/                 # API config, data clients, helper utilities
  services/            # Document parsing and generation orchestration
  utils/               # StudyBeats helpers, guest DB utilities, learning package types

partyserver/
  src/
    routes/            # API route registration and pipeline endpoints
    services/          # backend generation services
    lib/               # response helpers, auth, AI helpers, CORS, etc.
  scripts/
    generate-api-spec.ts
```

## Core user journey

1. Navigate to the app and either connect a wallet or continue in guest mode.
2. Upload notes from a file or paste text into the app.
3. Choose a genre, vocal style, mood, and length for the generated song.
4. The frontend runs a multi-step generation pipeline:
   - read source material
   - understand the content
   - build flashcards and quiz materials
   - write song lyrics
   - produce music/audio output
   - assemble the study session
5. Results are saved to the user account or to the guest local database.

## Local development

### Prerequisites

- Bun
- Node.js-compatible toolchain for the Vite frontend

### Install dependencies

```bash
bun install
```

### Run the frontend locally

The frontend dev command is wired through Vite:

```bash
PORT=3000 bun run dev
```

Then open:

```text
http://localhost:3000
```

### Run the backend locally

The Cloudflare Worker API is separate and should be started in the PartyServer workspace:

```bash
cd partyserver
bun run dev
```

## Build and deployment scripts

From the root project:

```bash
bun run build
bun run build:api
bun run build:full
bun run build:full:prod
```

Useful commands:

- `bun run build` — runs the frontend validation and build steps
- `bun run build:api` — builds the PartyServer worker
- `bun run build:full` — builds frontend and backend together
- `bun run deploy:api` — deploys the PartyServer worker
- `bun run preview` — previews the built frontend output

## Frontend runtime config

The frontend reads environment-dependent configuration from the Vite build environment and from the central config file in `src/lib/config.ts`.

Important build-time variables include:

- `VITE_TAROBASE_APP_ID`
- `VITE_CHAIN`
- `VITE_RPC_URL`
- `VITE_ENV`
- `VITE_API_URL`
- `VITE_PARTYSERVER_URL`
- `VITE_AUTH_METHOD`
- `VITE_WS_API_URL`
- `VITE_AUTH_API_URL`

The default frontend build script sets preview-mode values for Tarobase and RPC endpoints so the app can boot correctly in the current template setup.

## Backend API surface

The PartyServer routes currently expose the StudyBeats generation pipeline:

- `GET /health` — simple health check
- `POST /api/pipeline/analyze` — analyze notes and return a summary + key concepts
- `POST /api/pipeline/learning-package` — generate flashcards and quiz material
- `POST /api/pipeline/lyrics` — generate lyrics from analysis input
- `POST /api/pipeline/music` — generate a track using the configured music provider

All responses follow the shared `success/data/error/timestamp/requestId` response format used by the backend helpers.

## Authentication and guest mode

The app supports two modes:

- Real wallet-connected mode via Poof/Tarobase auth
- Guest mode for testing and demo flows

The app shell uses `useAppAuth()` to route the user into either flow. For authenticated users, data is saved to Tarobase-backed collections. For guest mode, the frontend stores content in a browser-local guest database so the experience remains usable without a crypto wallet.

## Notes on the repository

This repo is a full-stack product app rather than a single-page starter. The frontend handles the experience, routing, upload flow, and generation UI. The backend is responsible for stateless AI generation operations and the Worker-side API entry points.

If you are making changes:

- add frontend routes in `src/App.tsx`
- keep the UI shell consistent through the shared `AppShell` and `PageLayout` construction
- register backend routes in `partyserver/src/routes/index.ts`
- keep `routeSpec` aligned with any new backend route you add

## Recommended workflow

For day-to-day development:

1. Start the frontend with Vite.
2. Start the PartyServer worker for API-driven generation.
3. Use the upload and generate flow on the UI.
4. Verify your changes using the normal app flow rather than only by static inspection.

## License

This project is configured for local development and deployment under the repo's existing project ownership and platform deployment rules.
