# 🚀 Supabase Deployment Guide

## Quick Setup

### 1. Link Supabase Project

You need to link your local project to your Supabase project. You have two options:

#### Option A: Link to Existing Project (Recommended)

```bash
# Login to Supabase CLI
npx supabase login

# Link to your project (replace YOUR_PROJECT_REF with your actual project ref)
npx supabase link --project-ref YOUR_PROJECT_REF

# Your project ref can be found in:
# - Supabase Dashboard → Project Settings → General → Reference ID
# - Or from your project URL: https://YOUR_PROJECT_REF.supabase.co
```

#### Option B: Initialize New Local Project

```bash
# Initialize Supabase locally
npx supabase init

# Start local Supabase (for development)
npx supabase start
```

### 2. Push Migrations

Once linked, push your migrations:

```bash
# Push all migrations
npx supabase db push

# Or push specific migration
npx supabase migration up
```

### 3. Deploy Edge Functions

```bash
# Deploy batch optimize function
npx supabase functions deploy optimize-image-batch

# Deploy AI ad generation function
npx supabase functions deploy generate-ai-ad

# Set environment variables (if needed)
npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
```

## Finding Your Project Ref

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **General**
4. Find **Reference ID** (looks like: `auyjsmtnfnnapjdrzhea`)
5. Or check your project URL: `https://YOUR_PROJECT_REF.supabase.co`

## Migration Files

Your migrations are located in:
- `supabase/migrations/20250120_create_admin_activity_log.sql`

## Edge Functions

Your Edge Functions are located in:
- `supabase/functions/optimize-image-batch/index.ts`
- `supabase/functions/generate-ai-ad/index.ts`

## Troubleshooting

### "Cannot find project ref"

**Solution:** Link your project first:
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### "Migration failed"

**Solution:** Check if tables already exist:
```bash
# Check migration status
npx supabase migration list

# Reset migrations (careful - this will drop data!)
npx supabase db reset
```

### "Function deployment failed"

**Solution:** Check Deno version and dependencies:
```bash
# Check Deno version
deno --version

# Test function locally
npx supabase functions serve optimize-image-batch
```

## Quick Commands Reference

```bash
# Link project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push

# Deploy functions
npx supabase functions deploy optimize-image-batch
npx supabase functions deploy generate-ai-ad

# Check status
npx supabase status

# View logs
npx supabase functions logs optimize-image-batch
```

