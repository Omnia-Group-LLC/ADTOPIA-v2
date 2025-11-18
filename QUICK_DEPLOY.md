# 🚀 Quick Deployment Guide

## Apply Admin Activity Log Migration

Since your migration history doesn't match, apply the migration directly via Supabase Dashboard:

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New query**
2. Copy and paste the entire contents of: `scripts/apply-admin-activity-log.sql`
3. Click **Run** (or press Cmd/Ctrl + Enter)
4. ✅ Tables created!

### Step 3: Verify
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_activity_log', 'activity_log');
```

You should see both tables listed.

---

## Deploy Edge Functions

### Deploy Batch Optimize Function
```bash
npx supabase functions deploy optimize-image-batch
```

### Deploy AI Ad Generation Function
```bash
npx supabase functions deploy generate-ai-ad

# Set OpenAI API key (required for AI ad generation)
npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
```

---

## Test the Deployment

### Test Batch Optimize Page
1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:5173/admin/batch-optimize
3. Select images and click "Optimize Selected"

### Test AI Ad Generation
Use the `useAIAd` hook in your components:
```typescript
import { useAIAd } from '@modules/api/hooks/useAIAd';

const { adCopy, generateAd, isGenerating } = useAIAd({
  title: 'Test Ad',
  description: 'Test description',
  tier: 'pro', // Will add FOMO
});
```

---

## Troubleshooting

### Migration Already Exists?
If tables already exist, the migration will skip them (using `IF NOT EXISTS`).

### Edge Function Deployment Fails?
Check that you're logged in:
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Need to Reset Migration History?
If you want to sync migration history later:
```bash
# Mark old migrations as reverted (one by one)
npx supabase migration repair --status reverted 20241114
# ... repeat for all old migrations

# Mark new migrations as applied
npx supabase migration repair --status applied 20250120
```

