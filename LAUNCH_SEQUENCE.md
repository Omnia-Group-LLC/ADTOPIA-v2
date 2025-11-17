# 🚀 Launch Sequence: Seed + Re-Test + Prod Verify

**Status:** ✅ Code pushed, CI/CD triggered, ready for seed migration

---

## Step 1: Run Seed Migration (2 Mins)

### Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea
   - Or: https://supabase.com/dashboard → Select project `auyjsmtnfnnapjdrzhea`

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New query" button

3. **Paste Seed SQL:**
   - Open `SEED_MIGRATION_READY.sql` in this repo
   - Copy the entire `DO $$ ... END $$;` block
   - Paste into SQL Editor

4. **Run Query:**
   - Click "Run" button (or press Cmd+Enter)
   - Should see: `Success: Gallery images seeded for Test Public Gallery`

5. **Verify:**
   - Run the verification query at bottom of `SEED_MIGRATION_READY.sql`
   - Expected: `image_count = 5`

**Quick Copy:**
```sql
DO $$
DECLARE
  container_id UUID;
BEGIN
  SELECT id INTO container_id
  FROM gallery_containers
  WHERE name = 'Test Public Gallery'
  LIMIT 1;

  IF container_id IS NOT NULL THEN
    INSERT INTO gallery_images (
      id, gallery_container_id, url, title, description, visible, created_at
    ) VALUES
      (gen_random_uuid(), container_id, '/placeholder.svg', 'Gallery Item 1', 'Test Public Gallery item 1', true, NOW()),
      (gen_random_uuid(), container_id, '/placeholder.svg', 'Gallery Item 2', 'Test Public Gallery item 2', true, NOW()),
      (gen_random_uuid(), container_id, '/placeholder.svg', 'Gallery Item 3', 'Test Public Gallery item 3', true, NOW()),
      (gen_random_uuid(), container_id, '/placeholder.svg', 'Gallery Item 4', 'Test Public Gallery item 4', true, NOW()),
      (gen_random_uuid(), container_id, '/placeholder.svg', 'Gallery Item 5', 'Test Public Gallery item 5', true, NOW())
    ON CONFLICT DO NOTHING;
    RAISE NOTICE 'Success: Gallery images seeded for Test Public Gallery';
  ELSE
    RAISE NOTICE 'Warning: Test Public Gallery container not found. Create it first.';
  END IF;
END $$;
```

---

## Step 2: Re-Test E2E Locally (3 Mins)

### Start Dev Server

```bash
cd /Users/The10Komancheria/ADTOPIA-v2
npm run dev
```

**Expected:** Server starts on `http://localhost:5173`

### Verify Gallery Page

1. Navigate to: `http://localhost:5173/gallery`
2. **Expected:**
   - ✅ "Test Public Gallery" header visible
   - ✅ 5 gallery items displayed
   - ✅ Each card has Share button (top-right)
   - ✅ Thumbnails show `/placeholder.svg`

### Test Share Flow

1. Click Share button on any card
2. **Expected:**
   - ✅ QR modal opens
   - ✅ "Generating QR code..." spinner appears
   - ✅ QR code PNG renders (<5s)
   - ✅ Download button enabled
   - ✅ Copy URL button works

### Run E2E Tests

```bash
# In new terminal
cd /Users/The10Komancheria/ADTOPIA-v2
npx playwright test gallery-flow.spec.ts --headed
```

**Expected Results:**
- ✅ **No skips** - Share button found, images found
- ✅ **Console logs:** "Share button found" (not "skipping")
- ✅ **Console logs:** "5 thumbnails visible" (not "no images")
- ✅ **QR modal:** Opens, generates, downloads
- ✅ **Thumbnails:** Load in <1s

**Success Criteria:**
```
✓ Share button found
✓ QR modal opens
✓ QR PNG renders
✓ 5 thumbnails visible
✓ No "Share button not found" logs
✓ No "No images found" logs
```

---

## Step 3: Prod Deploy + Verify (5 Mins)

### Check Vercel Deployment

1. **Vercel Dashboard:**
   - Go to: https://vercel.com/omnia-group/adtopia-v2
   - Check "Deploys" tab
   - Latest `main` branch deployment should be building/completed

2. **Production URL:**
   - Get from Vercel dashboard or GitHub Actions comment
   - Format: `https://adtopia-v2-*.vercel.app` or custom domain

### Verify Production Gallery

1. **Navigate to:** `{PROD_URL}/gallery`
2. **Expected:**
   - ✅ "Test Public Gallery" header
   - ✅ 5 gallery items with Share buttons
   - ✅ Thumbnails load

### DevTools Network Check

1. Open DevTools (F12) → Network tab
2. Reload `/gallery` page
3. **Verify:**
   - ✅ Thumbnails load <1s
   - ✅ Response headers: `X-Rls-Mode: public` (for anonymous access)
   - ✅ No CORS errors
   - ✅ Images from `/placeholder.svg` or CDN

### Lighthouse Audit

```bash
# Install Lighthouse CLI if needed
npm install -g lighthouse

# Run audit
lighthouse https://{PROD_URL}/gallery --view --only-categories=performance,accessibility,best-practices,seo
```

**Expected Scores:**
- ✅ Performance: 95+
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+
- ✅ SEO: 95+

---

## Step 4: CI/CD Verification (2 Mins)

### Check GitHub Actions

1. **Go to:** https://github.com/Omnia-Group-LLC/ADTOPIA-v2/actions
2. **Latest Run:**
   - Should show commit `81b7c0c` or later
   - Status: ✅ Green (or ⏳ Running)

3. **Matrix Jobs:**
   - ✅ Test (Node 20) - Green
   - ✅ Test (Node 22) - Green
   - ✅ Deploy to Vercel - Green
   - ✅ E2E Tests - Green (if configured)

### Test PR Preview (Optional)

1. **Create Test PR:**
   ```bash
   git checkout -b feat/e2e-polish
   git commit --allow-empty -m "test: PR preview test"
   git push origin feat/e2e-polish
   ```

2. **Create PR on GitHub:**
   - Go to: https://github.com/Omnia-Group-LLC/ADTOPIA-v2/pulls
   - Click "New Pull Request"
   - Base: `main`, Compare: `feat/e2e-polish`
   - Create PR

3. **Expected:**
   - ✅ GitHub Actions runs
   - ✅ PR comment posted with preview URL
   - ✅ E2E tests pass on preview

---

## Troubleshooting

### Seed Migration Issues

**"Container not found":**
```sql
-- Create Test Public Gallery container first
INSERT INTO gallery_containers (id, name, created_at)
VALUES (gen_random_uuid(), 'Test Public Gallery', NOW())
ON CONFLICT DO NOTHING;
```

**"Duplicate key" or "0 rows inserted":**
- ✅ This is OK - means images already exist
- ✅ Run verification query to confirm 5 images exist

**"Table does not exist":**
- Check table names match your schema
- Verify you're connected to correct database

### E2E Test Issues

**Share button still not found:**
- Check browser console for errors
- Verify GalleryItemCard component renders
- Check `data-testid="share-button"` exists

**Images still not found:**
- Verify seed migration ran successfully
- Check Supabase: `SELECT * FROM gallery_images WHERE gallery_container_id = (SELECT id FROM gallery_containers WHERE name = 'Test Public Gallery');`
- Verify GalleryPage loads from Supabase

**QR modal doesn't open:**
- Check browser console for errors
- Verify QRModal component imports correctly
- Check `generateQRCode` utility works

### Production Issues

**Gallery page 404:**
- Check Vercel deployment logs
- Verify `/gallery` route exists in router
- Check middleware rewrites

**Images not loading:**
- Check CORS headers
- Verify image URLs are correct
- Check Supabase RLS policies

---

## Success Checklist

- [ ] Seed migration ran successfully (5 images inserted)
- [ ] Local gallery page shows 5 items with Share buttons
- [ ] E2E tests pass with no skips
- [ ] Production deployment successful
- [ ] Production gallery page loads with 5 items
- [ ] Share button works on production
- [ ] QR modal generates and downloads
- [ ] GitHub Actions matrix green
- [ ] Lighthouse scores 95+

---

## 🎉 Launch Complete!

Once all checks pass:
- ✅ **Beta Live:** Production URL accessible
- ✅ **E2E Green:** All tests passing
- ✅ **CI/CD Automated:** Future pushes auto-deploy
- ✅ **Quality Metrics:** Bundle <500KB, Lighthouse 95+

**Empires don't launch on half-seeds—we're closing the moat!** 🚀

