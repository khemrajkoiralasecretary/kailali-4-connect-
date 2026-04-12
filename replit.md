# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Kailali-4 Connect (react-vite, `/`)
MP Office Digital Governance Platform for Kailali Constituency 4, Nepal.

**Features:**
- Dashboard with complaint stats, ward breakdown bar chart, MP profile, recent activity
- Bilingual support (English / Nepali) via React context i18n
- Complaints: list with status/ward filters, submit form, detail view with status updates
- Ideas: community idea board with upvoting
- News: official updates from MP's office

**Theme:** Crimson/maroon primary, gold accent (Nepal colors)

**Pages:**
- `/` — Dashboard
- `/complaints` — Complaints list (filterable)
- `/complaints/new` — Submit complaint
- `/complaints/:id` — Complaint detail + status update
- `/ideas` — Ideas list with upvote
- `/ideas/new` — Submit idea
- `/news` — News list
- `/news/new` — Post news

## Database Schema

- `complaints` — id, name, phone, ward (1-9), category, description, status (pending/in_progress/resolved), timestamps
- `ideas` — id, title, description, submitted_by, ward, upvotes, created_at
- `news` — id, title, content, category, published_at

## API Endpoints

All under `/api`:
- `GET/POST /complaints`, `GET/PATCH /complaints/:id`
- `GET/POST /ideas`, `POST /ideas/:id/upvote`
- `GET/POST /news`
- `GET /dashboard/stats`, `GET /dashboard/ward-breakdown`, `GET /dashboard/recent-activity`
