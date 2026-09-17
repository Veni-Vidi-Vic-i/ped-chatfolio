# PED Chatfolio

PED Chatfolio is a mobile-first archive for importing, reading, and searching personal chat conversations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/ped-chatfolio run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo + React Native + Expo Router + TypeScript
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ped-chatfolio/app/` — Expo Router screens and navigation
- `artifacts/ped-chatfolio/components/` — shared mobile UI components
- `artifacts/ped-chatfolio/data/mockChats.ts` — typed mock conversation model and Story Mode-ready formatter
- `artifacts/ped-chatfolio/constants/colors.ts` — mobile editorial color tokens

## Architecture decisions

- The first mobile build is frontend-only and intentionally uses mock archives; no backend, auth, AI, or parsing is included yet.
- Conversation data is typed around sender, timestamp, date, and presentation mode so future local storage and Story Mode can reuse the same model.
- Expo Router tabs keep Library, Search, and Import available as primary mobile sections; Chat Reader is a stack route.

## Product

- Library displays three realistic mock WhatsApp archives.
- Import provides the WhatsApp `.txt` selection UI and explicitly stops before parsing.
- Chat Reader displays sender names, timestamps, and date separators.
- Search filters mock passages and routes to the related archive reader.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
