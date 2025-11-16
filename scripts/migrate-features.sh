#!/bin/bash
# Phase 2 Wave 3: Migrate features module (gallery, checkout, pricing, gemini)
# Usage: ./scripts/migrate-features.sh [legacy-repo-path] [target-repo-path]

set -e

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "✨ Migrating features module..."

if [ ! -d "$LEGACY_REPO" ] || [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Repos not found"
  exit 1
fi

cd "$TARGET_REPO"

# Create features module structure
mkdir -p modules/features/{gallery,checkout,pricing,gemini}

# Copy gallery components
if [ -d "$LEGACY_REPO/src/components/gallery" ]; then
  cp -r "$LEGACY_REPO/src/components/gallery"/* modules/features/gallery/
  echo "  ✅ Copied gallery components"
fi

if [ -f "$LEGACY_REPO/src/components/Gallery.tsx" ]; then
  cp "$LEGACY_REPO/src/components/Gallery.tsx" modules/features/gallery/
  echo "  ✅ Copied Gallery.tsx"
fi

# Copy checkout components
if [ -d "$LEGACY_REPO/src/components/checkout" ]; then
  cp -r "$LEGACY_REPO/src/components/checkout"/* modules/features/checkout/
  echo "  ✅ Copied checkout components"
fi

# Copy pricing components
if [ -d "$LEGACY_REPO/src/components/pricing" ]; then
  cp -r "$LEGACY_REPO/src/components/pricing"/* modules/features/pricing/
  echo "  ✅ Copied pricing components"
fi

# Copy gemini feature
if [ -d "$LEGACY_REPO/src/features/gemini" ]; then
  cp -r "$LEGACY_REPO/src/features/gemini"/* modules/features/gemini/
  echo "  ✅ Copied gemini feature"
fi

if [ -d "$LEGACY_REPO/src/components/gemini" ]; then
  cp -r "$LEGACY_REPO/src/components/gemini"/* modules/features/gemini/components/ 2>/dev/null || true
  echo "  ✅ Copied gemini components"
fi

# Copy feature-specific libs
if [ -d "$LEGACY_REPO/src/lib/gemini" ]; then
  mkdir -p modules/features/gemini/lib
  cp -r "$LEGACY_REPO/src/lib/gemini"/* modules/features/gemini/lib/
  echo "  ✅ Copied gemini lib"
fi

# Create barrel exports
cat > modules/features/gallery/index.ts << 'EOF'
// Gallery Feature Barrel Export
export * from './Gallery';
// Add more gallery exports here
EOF

cat > modules/features/checkout/index.ts << 'EOF'
// Checkout Feature Barrel Export
// Add exports here
EOF

cat > modules/features/pricing/index.ts << 'EOF'
// Pricing Feature Barrel Export
// Add exports here
EOF

cat > modules/features/gemini/index.ts << 'EOF'
// Gemini Feature Barrel Export
// Add exports here
EOF

cat > modules/features/index.ts << 'EOF'
// Features Module Barrel Exports
export * from './gallery';
export * from './checkout';
export * from './pricing';
export * from './gemini';
EOF

# Update import paths
echo "🔧 Updating import paths..."
find modules/features -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/components/gallery|from '../gallery|g" \
      -e "s|from '@/components/checkout|from '../checkout|g" \
      -e "s|from '@/components/pricing|from '../pricing|g" \
      -e "s|from '@/features/gemini|from '../gemini|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      "$file" 2>/dev/null || true
  else
    sed -i \
      -e "s|from '@/components/gallery|from '../gallery|g" \
      -e "s|from '@/components/checkout|from '../checkout|g" \
      -e "s|from '@/components/pricing|from '../pricing|g" \
      -e "s|from '@/features/gemini|from '../gemini|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ Features module migration complete!"

