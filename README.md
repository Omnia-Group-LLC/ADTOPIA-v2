# AdTopia v2 - Modular Architecture

> **Modular revamp of AdTopia with clean separation of concerns**

## Structure

```
modules/
├── auth/      # Authentication & authorization
├── core/      # Shared utilities, constants, types
├── ui/        # UI components (Radix/Shadcn)
├── api/       # API clients & Supabase integration
├── dashboard/ # Admin & analytics
├── features/  # Feature modules (gallery, checkout, pricing)
└── marketing/ # Marketing components & FOMO elements
```

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

## Migration Status

- [ ] Phase 0: Archive complete
- [ ] Phase 1: Configs migrated, auth POC
- [ ] Phase 2: Full modular migration
- [ ] Phase 3: Testing & optimization
- [ ] Phase 4: Vercel deployment

See `REVAMP_PLAN.md` for full migration plan.
