#!/bin/bash
# Phase 2 Wave 1: Migrate UI module (Radix/Shadcn components)
# Usage: ./scripts/migrate-ui.sh [legacy-repo-path] [target-repo-path]

set -e

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "🎨 Migrating UI module..."

if [ ! -d "$LEGACY_REPO" ] || [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Repos not found"
  exit 1
fi

cd "$TARGET_REPO"

# Create UI module structure
mkdir -p modules/ui/components

# Copy UI components
if [ -d "$LEGACY_REPO/src/components/ui" ]; then
  cp -r "$LEGACY_REPO/src/components/ui"/* modules/ui/components/
  echo "  ✅ Copied UI components"
else
  echo "  ⚠️  Warning: UI components not found"
fi

# Generate barrel export from components
echo "📝 Generating barrel exports..."
cat > modules/ui/components/index.ts << 'EOF'
// UI Components Barrel Export
// Auto-generated - review and organize as needed

// Radix UI Components
export * from './accordion';
export * from './alert-dialog';
export * from './avatar';
export * from './button';
export * from './card';
export * from './checkbox';
export * from './dialog';
export * from './dropdown-menu';
export * from './hover-card';
export * from './label';
export * from './navigation-menu';
export * from './popover';
export * from './progress';
export * from './radio-group';
export * from './scroll-area';
export * from './select';
export * from './separator';
export * from './slider';
export * from './switch';
export * from './tabs';
export * from './toast';
export * from './toggle';
export * from './tooltip';

// Custom UI Components
export * from './loading-spinner';
export * from './sonner';
export * from './toaster';
EOF

cat > modules/ui/index.ts << 'EOF'
// UI Module Barrel Exports
export * from './components';
EOF

# Update import paths
echo "🔧 Updating import paths..."
find modules/ui -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/components/ui|from '../components|g" \
      -e "s|from '@/lib/utils|from '@modules/core/utils|g" \
      "$file" 2>/dev/null || true
  else
    sed -i \
      -e "s|from '@/components/ui|from '../components|g" \
      -e "s|from '@/lib/utils|from '@modules/core/utils|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ UI module migration complete!"

