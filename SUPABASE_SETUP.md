# Supabase Setup Guide

## Running Seed Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `auyjsmtnfnnapjdrzhea`

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Seed Migration:**
   - Copy contents of `supabase/migrations/20251117_seed_gallery_images.sql`
   - Paste into SQL Editor
   - Click "Run" (or press Cmd+Enter)

4. **Verify:**
   ```sql
   SELECT COUNT(*) 
   FROM gallery_images 
   WHERE gallery_container_id = (
     SELECT id 
     FROM gallery_containers 
     WHERE name = 'Test Public Gallery'
   );
   ```
   Should return: `5`

### Option 2: Supabase CLI (If Linked)

**Link Project First:**
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (requires project ref)
supabase link --project-ref auyjsmtnfnnapjdrzhea

# Run migration
supabase db push
```

**Get Project Ref:**
- Go to Supabase Dashboard → Project Settings → General
- Copy "Reference ID" (e.g., `auyjsmtnfnnapjdrzhea`)

### Option 3: Direct SQL Query

If you have database access, run the SQL directly:

```sql
-- Copy from: supabase/migrations/20251117_seed_gallery_images.sql
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
  END IF;
END $$;
```

---

## Prerequisites

### Required Tables

1. **gallery_containers** table with:
   - `id` (UUID, primary key)
   - `name` (TEXT)
   - Row with `name = 'Test Public Gallery'`

2. **gallery_images** table with:
   - `id` (UUID, primary key)
   - `gallery_container_id` (UUID, foreign key)
   - `url` (TEXT)
   - `title` (TEXT, nullable)
   - `description` (TEXT, nullable)
   - `visible` (BOOLEAN)
   - `created_at` (TIMESTAMP)

### Check if Tables Exist

```sql
-- Check gallery_containers
SELECT * FROM gallery_containers WHERE name = 'Test Public Gallery';

-- Check gallery_images structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gallery_images';
```

---

## Troubleshooting

### "Cannot find project ref"
- Use Supabase Dashboard instead (Option 1)
- Or link project: `supabase link --project-ref YOUR_PROJECT_REF`

### "Table does not exist"
- Create tables first or check table names
- Verify you're connected to the correct database

### "Container not found"
- Create Test Public Gallery container first:
  ```sql
  INSERT INTO gallery_containers (id, name, created_at)
  VALUES (gen_random_uuid(), 'Test Public Gallery', NOW())
  ON CONFLICT DO NOTHING;
  ```

---

## After Migration

### Verify Gallery Page

```bash
npm run dev
# Navigate to: http://localhost:5173/gallery
# Should see 5 gallery items with Share buttons
```

### Run E2E Tests

```bash
npx playwright test gallery-flow.spec.ts --headed

# Expected:
# ✅ Share button found
# ✅ QR modal opens
# ✅ QR PNG renders
# ✅ 5 thumbnails visible
# ✅ No "no images" log
```

