# 🚀 AdTopia Supabase Setup Guide

## Step 1: Run Database Schema

1. Go to your Supabase Dashboard → SQL Editor

2. Click "New query"

3. Copy and paste the complete SQL schema below

4. Click "Run" or press Cmd/Ctrl + Enter

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('user', 'editor', 'admin', 'super_admin', 'enterprise');
  END IF;
END$$;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER_ROLES TABLE (CRITICAL FOR SECURITY)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'super_admin' THEN 5
    WHEN 'admin' THEN 4
    WHEN 'enterprise' THEN 4
    WHEN 'editor' THEN 3
    WHEN 'user' THEN 2
    ELSE 1
  END DESC
  LIMIT 1
$$;

-- =============================================
-- AD_TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ad_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  style TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ad_templates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- AD_CARDS TABLE (CORE PRODUCT)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ad_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.ad_templates(id),
  qr_code_url TEXT,
  custom_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ad_cards ENABLE ROW LEVEL SECURITY;

-- =============================================
-- GALLERY_CONTAINERS TABLE (PASSWORD PROTECTION!)
-- =============================================
CREATE TABLE IF NOT EXISTS public.gallery_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  access_code TEXT,
  card_ids UUID[] DEFAULT '{}',
  display_order UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery_containers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BETA_CODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.beta_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  max_uses INT NOT NULL DEFAULT 50,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- APP_CONFIG TABLE (System Settings)
-- =============================================
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================
-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Ad Templates (Public read, admin write)
DROP POLICY IF EXISTS "public_select_active_templates" ON public.ad_templates;
DROP POLICY IF EXISTS "admin_manage_templates" ON public.ad_templates;

CREATE POLICY "public_select_active_templates"
  ON public.ad_templates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "admin_manage_templates"
  ON public.ad_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Ad Cards
DROP POLICY IF EXISTS "owner_select_cards" ON public.ad_cards;
DROP POLICY IF EXISTS "anyone_select_published" ON public.ad_cards;
DROP POLICY IF EXISTS "owner_insert_cards" ON public.ad_cards;
DROP POLICY IF EXISTS "owner_update_cards" ON public.ad_cards;
DROP POLICY IF EXISTS "owner_delete_cards" ON public.ad_cards;

CREATE POLICY "owner_select_cards"
  ON public.ad_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "anyone_select_published"
  ON public.ad_cards FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "owner_insert_cards"
  ON public.ad_cards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_update_cards"
  ON public.ad_cards FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner_delete_cards"
  ON public.ad_cards FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Gallery Containers
DROP POLICY IF EXISTS "public_can_view_public_galleries" ON public.gallery_containers;
DROP POLICY IF EXISTS "owner_select_galleries" ON public.gallery_containers;
DROP POLICY IF EXISTS "owner_insert_galleries" ON public.gallery_containers;
DROP POLICY IF EXISTS "owner_update_galleries" ON public.gallery_containers;
DROP POLICY IF EXISTS "owner_delete_galleries" ON public.gallery_containers;

CREATE POLICY "public_can_view_public_galleries"
  ON public.gallery_containers FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "owner_select_galleries"
  ON public.gallery_containers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner_insert_galleries"
  ON public.gallery_containers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_update_galleries"
  ON public.gallery_containers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner_delete_galleries"
  ON public.gallery_containers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Beta Codes (Admin only)
DROP POLICY IF EXISTS "beta_codes_admin_all" ON public.beta_codes;
DROP POLICY IF EXISTS "beta_codes_admin_write" ON public.beta_codes;

CREATE POLICY "beta_codes_admin_all"
  ON public.beta_codes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "beta_codes_admin_write"
  ON public.beta_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- App Config (Admin only)
DROP POLICY IF EXISTS "config_admin_select" ON public.app_config;
DROP POLICY IF EXISTS "config_admin_write" ON public.app_config;

CREATE POLICY "config_admin_select"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "config_admin_write"
  ON public.app_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- TRIGGERS
-- =============================================
-- Auto-create profile and assign default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  );

  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (NEW.id, 'user', NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED DATA
-- =============================================
-- Insert app config for pre-beta mode
INSERT INTO public.app_config (key, value)
VALUES (
  'pre_beta_mode',
  jsonb_build_object(
    'enabled', true,
    'expires_at', null,
    'slots_remaining', 50
  )
)
ON CONFLICT (key) DO NOTHING;

-- Insert sample templates
INSERT INTO public.ad_templates (name, category, style, preview_url, thumbnail_url, is_premium, is_active, config)
VALUES
  ('Modern Minimal', 'Business', 'modern', '/placeholder.svg', '/placeholder.svg', false, true, '{"layout":"single-column","color_scheme":["#000000","#FFFFFF"],"font_family":"Inter"}'),
  ('Bold Impact', 'Marketing', 'bold', '/placeholder.svg', '/placeholder.svg', false, true, '{"layout":"two-column","color_scheme":["#FF4500","#000000"],"font_family":"Poppins"}'),
  ('Classic Elegance', 'Luxury', 'classic', '/placeholder.svg', '/placeholder.svg', true, true, '{"layout":"single-column","color_scheme":["#D4AF37","#1A1A1A"],"font_family":"Playfair Display"}'),
  ('Minimalist White', 'Real Estate', 'minimalist', '/placeholder.svg', '/placeholder.svg', false, true, '{}'),
  ('Vibrant Product', 'Products', 'creative', '/placeholder.svg', '/placeholder.svg', false, true, '{}'),
  ('Professional Services', 'Services', 'professional', '/placeholder.svg', '/placeholder.svg', false, true, '{}')
ON CONFLICT DO NOTHING;

-- Create a sample beta code for testing
INSERT INTO public.beta_codes (code, max_uses, used_count, expires_at, metadata)
VALUES (
  'ADTOPIA2025',
  100,
  0,
  NOW() + INTERVAL '90 days',
  '{"created_for":"initial_launch"}'
)
ON CONFLICT (code) DO NOTHING;
```

---

## Step 2: Create Storage Buckets

Go to your Supabase Dashboard → Storage → Create new buckets with these settings:

### Bucket 1: `ad-images` (Public)

- **Name:** `ad-images`
- **Public:** Yes
- **File size limit:** 10MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif`

### Bucket 2: `qr-codes` (Public)

- **Name:** `qr-codes`
- **Public:** Yes
- **File size limit:** 2MB
- **Allowed MIME types:** `image/png, image/svg+xml`

### Bucket 3: `avatars` (Public)

- **Name:** `avatars`
- **Public:** Yes
- **File size limit:** 5MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### Bucket 4: `gallery-thumbnails` (Public)

- **Name:** `gallery-thumbnails`
- **Public:** Yes
- **File size limit:** 5MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### Bucket 5: `template-previews` (Public)

- **Name:** `template-previews`
- **Public:** Yes
- **File size limit:** 3MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

---

## Step 3: Configure Storage RLS Policies

For each bucket, go to Storage → [bucket name] → Policies → New Policy

### Ad Images Policies

```sql
-- SELECT (Anyone can view)
CREATE POLICY "Anyone can view ad images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

-- INSERT (Authenticated users)
CREATE POLICY "Authenticated users can upload ad images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-images');

-- UPDATE (Owner only)
CREATE POLICY "Users can update own ad images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE (Owner only)
CREATE POLICY "Users can delete own ad images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Repeat similar policies for `qr-codes`, `avatars`, `gallery-thumbnails`, and `template-previews` buckets.**

---

## Step 4: Deploy Edge Functions

The edge functions are already created in your `supabase/functions/` directory. Deploy them using Supabase CLI:

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
npx supabase functions deploy generate-qr-code
npx supabase functions deploy generate-ai-ad
npx supabase functions deploy verify-beta-code
npx supabase functions deploy admin-list-users
npx supabase functions deploy track-analytics
npx supabase functions deploy send-share-email
```

---

## Step 5: Add Required Secrets

Go to Supabase Dashboard → Edge Functions → Manage secrets

Add these secrets:

1. **OPENAI_API_KEY** - Your OpenAI API key for AI ad generation
2. **RESEND_API_KEY** - Your Resend API key for email sharing (optional)

```bash
# Or via CLI:
npx supabase secrets set OPENAI_API_KEY=sk-your-key-here
npx supabase secrets set RESEND_API_KEY=re_your-key-here
```

---

## Step 6: Create Your First Super Admin

After signing up, run this SQL to give yourself super_admin role:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('YOUR_USER_ID', 'super_admin', 'YOUR_USER_ID')
ON CONFLICT (user_id, role) DO NOTHING;
```

To find your user ID:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Or use the seed script:

```bash
tsx scripts/seed-super-admin.ts
```

---

## ✅ Verification Checklist

- [ ] Database schema applied successfully
- [ ] All 5 storage buckets created
- [ ] Storage RLS policies configured
- [ ] All 6 edge functions deployed
- [ ] OPENAI_API_KEY secret added
- [ ] RESEND_API_KEY secret added (optional)
- [ ] Super admin role assigned to your user
- [ ] Test beta code works: `ADTOPIA2025`
- [ ] Test gallery password protection
- [ ] Test QR code generation
- [ ] Test admin panel access

---

## 🚨 Security Notes

**CRITICAL:** The `gallery_containers.access_code` field currently stores passcodes in plain text. After confirming the base setup works, implement the hardening steps in the main plan to hash passcodes and use RPC verification.

---

## 🆘 Troubleshooting

**Edge Functions Not Working?**

- Check function logs in Supabase Dashboard → Edge Functions → Logs
- Verify secrets are set correctly
- Ensure CORS headers are present in responses

**RLS Policy Errors?**

- Check that `has_role()` function is created
- Verify user has proper role assigned in `user_roles` table
- Test policies using "RLS disabled" mode temporarily

**Storage Upload Fails?**

- Verify bucket exists and is public
- Check file size limits
- Ensure RLS policies allow your user to upload

---

Need help? Check the Supabase docs or the edge function code in `supabase/functions/`
