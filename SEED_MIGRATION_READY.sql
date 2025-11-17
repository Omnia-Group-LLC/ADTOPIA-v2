-- ============================================
-- SEED MIGRATION: 5 Gallery Images
-- Copy this entire block into Supabase Dashboard SQL Editor
-- ============================================

DO $$
DECLARE
  container_id UUID;
BEGIN
  -- Get Test Public Gallery container ID
  SELECT id INTO container_id
  FROM gallery_containers
  WHERE name = 'Test Public Gallery'
  LIMIT 1;

  -- Only proceed if container exists
  IF container_id IS NOT NULL THEN
    -- Insert 5 gallery images with titles and descriptions
    INSERT INTO gallery_images (
      id,
      gallery_container_id,
      url,
      title,
      description,
      visible,
      created_at
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

-- ============================================
-- VERIFICATION QUERY (Run after seed)
-- ============================================
SELECT COUNT(*) as image_count
FROM gallery_images 
WHERE gallery_container_id = (
  SELECT id 
  FROM gallery_containers 
  WHERE name = 'Test Public Gallery'
);

-- Expected result: 5

