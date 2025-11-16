#!/bin/bash
# Phase 2 Wave 3: Migrate marketing module (landing pages, FOMO elements)
# Usage: ./scripts/migrate-marketing.sh [legacy-repo-path] [target-repo-path]

set -e

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "📢 Migrating marketing module..."

if [ ! -d "$LEGACY_REPO" ] || [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Repos not found"
  exit 1
fi

cd "$TARGET_REPO"

# Create marketing module structure
mkdir -p modules/marketing/{components,fomo,lib}

# Copy marketing components
if [ -d "$LEGACY_REPO/src/components/marketing" ]; then
  cp -r "$LEGACY_REPO/src/components/marketing"/* modules/marketing/components/
  echo "  ✅ Copied marketing components"
fi

# Copy FOMO elements
if [ -f "$LEGACY_REPO/src/components/FOMOElements.tsx" ]; then
  cp "$LEGACY_REPO/src/components/FOMOElements.tsx" modules/marketing/fomo/
  echo "  ✅ Copied FOMOElements.tsx"
fi

# Copy marketing libs
if [ -d "$LEGACY_REPO/src/lib/marketing" ]; then
  cp -r "$LEGACY_REPO/src/lib/marketing"/* modules/marketing/lib/
  echo "  ✅ Copied marketing libs"
fi

# Create barrel exports
cat > modules/marketing/components/index.ts << 'EOF'
// Marketing Components Barrel Export
export * from './GlassBentoLanding';
// Add more marketing component exports here
EOF

cat > modules/marketing/fomo/index.ts << 'EOF'
// FOMO Elements Barrel Export
export { FOMOElements } from './FOMOElements';
EOF

cat > modules/marketing/index.ts << 'EOF'
// Marketing Module Barrel Exports
export * from './components';
export * from './fomo';
export * from './lib';
EOF

# Update import paths
echo "🔧 Updating import paths..."
find modules/marketing -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/components/marketing|from '../components|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/lib/marketing|from '../lib|g" \
      "$file" 2>/dev/null || true
  else
    sed -i \
      -e "s|from '@/components/marketing|from '../components|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/lib/marketing|from '../lib|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ Marketing module migration complete!"

