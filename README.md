# Hushallskampen

Hushållskampen is a PWA that helps households plan, approve, and track chores in either competition‑ or equality‑mode.

## Requirements
- Node.js 18+ (frontend) / Node.js 20+ (backend)
- npm
- MongoDB (Atlas or local)

## Quick start (local)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, CORS_ORIGIN
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL to your backend
npm run dev
```

## Build
```bash
cd frontend
npm run build
npm run preview
```

## Accessibility (EAA‑focused)
We use accessibility tools during development to find and fix issues.

Recommended checks:
- **Lighthouse** (Chrome DevTools → Lighthouse → Accessibility)
- **axe DevTools** browser extension (scan pages and fix reported issues)
- **Keyboard check**: tab through all controls and verify visible focus

Notes:
- A global `:focus-visible` style is included for links/buttons/inputs.
- Dynamic status messages use `aria-live` where relevant.

## Code documentation
Architecture and module notes live in `docs/CODE.md`.

## PWA
The app uses `vite-plugin-pwa`. When deployed, the install prompt should appear on supported browsers. Test by visiting the production URL on mobile.




