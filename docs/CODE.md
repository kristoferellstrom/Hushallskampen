# Code documentation

This document summarizes the core modules and data flow.

## Frontend (React + Vite)
**Routing / Pages**
- `frontend/src/pages/HomePage.tsx`: dashboard shell + embedded sections.
- `frontend/src/pages/CalendarPage.tsx`: weekly/monthly calendar UI.
- `frontend/src/pages/ChoresPage.tsx`: chore library and create/edit flows.
- `frontend/src/pages/ApprovalsPage.tsx`: approve/reject tasks.
- `frontend/src/pages/StatsPage.tsx`: weekly/monthly/year summaries.
- `frontend/src/pages/SettingsPage.tsx`: mode, colors, rules, prizes.
- `frontend/src/pages/AchievementsPage.tsx`: badges & monthly rewards.

**State & API**
- `frontend/src/context/AuthContext.tsx`: auth state and current user.
- `frontend/src/hooks/*`: page‑specific state + side‑effects.
- `frontend/src/api/*`: REST calls to backend.

**Components**
- `frontend/src/components/*`: reusable UI blocks (calendar, stats, settings, etc.).

**Styles**
- `frontend/src/styles/*.scss`: base + per‑page styles.
- `*.mobile.scss` / `*.tablet.scss`: mobile/tablet overrides only.

## Backend (Node + Express)

**Entry**
- `backend/src/index.ts`: app bootstrap.

**Routes**
- `backend/src/routes/*`: REST endpoints for auth, chores, calendar, approvals, stats, achievements.

**Services**
- `backend/src/services/achievements.ts`: badge logic & monthly/year winners.

**Models**
- `backend/src/models/*`: Mongoose schemas.

## Data flow (high level)
1. User logs in → JWT stored in frontend.
2. Frontend requests household data + chores + calendar entries.
3. User creates/updates tasks → backend persists.
4. Approvals update entries → points/stat totals recomputed.
5. Achievements use approved entries to compute badges.

If you update backend contracts, update the matching `frontend/src/api/*` modules.
