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
- [x] Phase 3: Testing & optimization (CI/CD pipeline complete)
- [ ] Phase 4: Vercel deployment

See `REVAMP_PLAN.md` for full migration plan.

---

## 🚀 Deployment & CI/CD

### Vercel Deployment Setup

#### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

1. **VERCEL_TOKEN**
   - Get from: [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token with full access
   - Copy and paste into GitHub Secrets

2. **VERCEL_ORG_ID**
   - Get from: Vercel Dashboard > Your Organization > Settings > General
   - Or run: `vercel whoami` and check organization ID

3. **VERCEL_PROJECT_ID**
   - Get from: Vercel Dashboard > Project Settings > General
   - Or run: `vercel link` and check `.vercel/project.json`

#### Setting Up Secrets

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link your project
vercel link

# 4. Get your project ID
cat .vercel/project.json | grep projectId

# 5. Get your org ID
vercel whoami
```

Then add these to GitHub:
- Go to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`
- Click "New repository secret"
- Add each secret:
  - `VERCEL_TOKEN` (from account settings)
  - `VERCEL_ORG_ID` (from `vercel whoami` or dashboard)
  - `VERCEL_PROJECT_ID` (from `.vercel/project.json`)

### Deployment Hooks

#### Testing Staging Deployment Hook

```bash
# Set your staging hook URL (get from Vercel Dashboard)
export VERCEL_STAGING_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..."

# Test the hook
./scripts/test-hook.sh develop

# Expected output:
# ✅ Hook triggered successfully
# 🚀 Preview URL: https://adtopia-v2-develop-abc.vercel.app
```

**Getting Hook URL:**
1. Vercel Dashboard > Project Settings > Deploy Hooks
2. Create new hook:
   - Name: `staging-develop`
   - Branch: `develop`
   - Copy the hook URL
3. Set as environment variable or in GitHub Secrets

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Tests** on Node 20 and 22 (matrix strategy)
   - TypeScript type checking
   - ESLint
   - Unit tests with coverage (>90% target)
   - Production build
   - Bundle size check (<500KB)

2. **Deploys** to Vercel:
   - Preview deployments on `develop` branch and PRs
   - Production deployments on `main` branch
   - PR comments with preview URLs

3. **E2E Tests** on deployed previews:
   - Playwright tests against live preview URL
   - Screenshots and videos on failure
   - Test reports uploaded as artifacts

### Manual Deployment

```bash
# Preview deployment
vercel

# Production deployment (with Lighthouse audit)
npm run deploy:prod

# Or use Vercel CLI directly
vercel --prod

# Check deployment status
vercel ls --prod
```

#### Production Deployment Script

The `deploy:prod` script (`scripts/deploy-prod.sh`) provides:
- ✅ Build verification before deployment
- ✅ Automatic production URL extraction
- ✅ Deployment hook triggering (if configured)
- ✅ Lighthouse audit (if CLI installed)
- ✅ Error handling and logging

**Usage:**
```bash
# Set deployment hook URL (optional)
export VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..."

# Deploy
npm run deploy:prod
```

**Output:**
- Production URL displayed
- Hook response logged to `deploy-hook-log.txt`
- Lighthouse report saved to `lighthouse-report.html` (if available)

### E2E Testing on Preview

Test against Vercel preview deployments:

```bash
# Test against preview URL
npm run test:e2e-preview

# Or specify custom URL
DEPLOYMENT_URL=https://your-preview.vercel.app npx playwright test --project=vercel-preview
```

### Batch Optimize Admin Tool

Access the batch image optimization tool:

```bash
# Navigate to admin page
http://localhost:5173/admin/batch-optimize

# Features:
# - Select all / individual images
# - Sortable table (title, created, position)
# - Batch optimize (concurrent 3)
# - Progress tracking (0-68)
# - Activity log integration
```

### Verification Checklist

After deployment, verify:

- [ ] Preview URL accessible (`curl https://preview-url.vercel.app`)
- [ ] Gallery loads (`/gallery` route)
- [ ] RLS mode header present (`X-Rls-Mode: public` on `/gallery`)
- [ ] QR code generation works
- [ ] Bundle size <500KB gzipped
- [ ] Lighthouse score 95+ (Performance, Accessibility, Best Practices, SEO)

```bash
# Run E2E tests against production
BASE_URL=https://your-prod-url.vercel.app npm run test:e2e

# Run Lighthouse audit
npm run lighthouse
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
npm run test:coverage  # Coverage report
```

### E2E Tests
```bash
# Local testing
npm run test:e2e

# CI testing (against deployed preview)
BASE_URL=https://preview-url.vercel.app npm run test:e2e

# Specific project
npx playwright test --project=vercel-preview
```

### Launch Verification Tests

The `tests/e2e/launch.spec.ts` file contains critical launch verification tests:

1. **Anonymous Gallery Access** - `/gallery` loads, QR modal works, PNG download <2s
2. **Admin Upload Flow** - Image upload, WebP optimization, thumbnail load <1s
3. **Performance** - Bundle size, Lighthouse 95+, RLS headers

Run with:
```bash
npx playwright test tests/e2e/launch.spec.ts --project=vercel-preview
```
