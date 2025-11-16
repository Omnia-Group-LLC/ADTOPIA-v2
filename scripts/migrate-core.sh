#!/bin/bash
# Phase 2 Wave 1: Migrate core module (utils, constants, shared types)
# Usage: ./scripts/migrate-core.sh [legacy-repo-path] [target-repo-path]

set -e

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "🔧 Migrating core module..."

if [ ! -d "$LEGACY_REPO" ] || [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Repos not found"
  exit 1
fi

cd "$TARGET_REPO"

# Create core module structure
mkdir -p modules/core/{utils,constants,types,tests}

# Copy core files
echo "📋 Copying core files..."

# Core classes
if [ -d "$LEGACY_REPO/src/core" ]; then
  cp -r "$LEGACY_REPO/src/core"/* modules/core/
  echo "  ✅ Copied core classes"
fi

# Utils
if [ -d "$LEGACY_REPO/src/lib/utils" ]; then
  cp -r "$LEGACY_REPO/src/lib/utils"/* modules/core/utils/
  echo "  ✅ Copied utils"
fi

# Constants
if [ -d "$LEGACY_REPO/src/lib/constants" ]; then
  cp -r "$LEGACY_REPO/src/lib/constants"/* modules/core/constants/
  echo "  ✅ Copied constants"
fi

# Shared types (consolidate User type here)
echo "📋 Consolidating shared types..."
mkdir -p modules/core/types

# Copy User type from auth (if not already in core)
if [ -f "modules/auth/AuthContext.tsx" ]; then
  # Extract User interface - manual step needed, but create placeholder
  cat > modules/core/types/User.ts << 'EOF'
// Shared User type - consolidate duplicates from auth/api modules
export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  mfa_enabled: boolean;
  email_verified: boolean;
  created_at: string;
}
EOF
  echo "  ✅ Created shared User type (review needed)"
fi

# Copy other shared types
if [ -d "$LEGACY_REPO/src/types" ]; then
  # Copy non-module-specific types
  find "$LEGACY_REPO/src/types" -name "*.ts" -not -name "supabase.ts" | while read file; do
    cp "$file" modules/core/types/
  done
  echo "  ✅ Copied shared types"
fi

# Create barrel exports
cat > modules/core/utils/index.ts << 'EOF'
// Core Utils Barrel Export
// Auto-generated - add exports as needed
export * from './hold';
// Add more exports here
EOF

cat > modules/core/index.ts << 'EOF'
// Core Module Barrel Exports
export * from './AdTopiaCore';
export * from './PerformanceOptimizer';
export * from './utils';
export * from './constants';
export * from './types';
EOF

cat > modules/core/types/index.ts << 'EOF'
// Shared Types Barrel Export
export * from './User';
// Add more shared types here
EOF

# Update import paths
echo "🔧 Updating import paths..."
find modules/core -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/lib/utils|from '../utils|g" \
      -e "s|from '@/lib/constants|from '../constants|g" \
      "$file" 2>/dev/null || true
  else
    sed -i \
      -e "s|from '@/lib/utils|from '../utils|g" \
      -e "s|from '@/lib/constants|from '../constants|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ Core module migration complete!"
echo "📝 Next: Update auth module to import User from @modules/core/types"

