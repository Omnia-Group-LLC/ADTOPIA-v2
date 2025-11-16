#!/bin/bash
# Phase 2 Wave 2: Migrate API module (Supabase, API clients)
# Usage: ./scripts/migrate-api.sh [legacy-repo-path] [target-repo-path]

set -e

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "🔌 Migrating API module..."

if [ ! -d "$LEGACY_REPO" ] || [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Repos not found"
  exit 1
fi

cd "$TARGET_REPO"

# Create API module structure
mkdir -p modules/api/{supabase,clients,types}

# Copy Supabase integration
if [ -d "$LEGACY_REPO/src/integrations/supabase" ]; then
  cp -r "$LEGACY_REPO/src/integrations/supabase"/* modules/api/supabase/
  echo "  ✅ Copied Supabase integration"
fi

# Copy API clients
if [ -d "$LEGACY_REPO/src/lib/api" ]; then
  cp -r "$LEGACY_REPO/src/lib/api"/* modules/api/clients/
  echo "  ✅ Copied API clients"
fi

# Copy API-specific files
if [ -f "$LEGACY_REPO/src/lib/gallery-api.ts" ]; then
  cp "$LEGACY_REPO/src/lib/gallery-api.ts" modules/api/
  echo "  ✅ Copied gallery-api.ts"
fi

if [ -f "$LEGACY_REPO/src/lib/access-code-api.ts" ]; then
  cp "$LEGACY_REPO/src/lib/access-code-api.ts" modules/api/
  echo "  ✅ Copied access-code-api.ts"
fi

if [ -f "$LEGACY_REPO/src/lib/api-client.ts" ]; then
  cp "$LEGACY_REPO/src/lib/api-client.ts" modules/api/clients/
  echo "  ✅ Copied api-client.ts"
fi

# Create barrel exports
cat > modules/api/supabase/index.ts << 'EOF'
// Supabase Integration Barrel Export
export { supabase } from './client';
export * from './types';
EOF

cat > modules/api/clients/index.ts << 'EOF'
// API Clients Barrel Export
export * from './api-client';
// Add more client exports here
EOF

cat > modules/api/index.ts << 'EOF'
// API Module Barrel Exports
export * from './supabase';
export * from './clients';
export * from './gallery-api';
export * from './access-code-api';
EOF

# Update import paths
echo "🔧 Updating import paths..."
find modules/api -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/integrations/supabase|from '../supabase|g" \
      -e "s|from '@/lib/api|from '../clients|g" \
      -e "s|from '@/lib/gallery-api|from '../gallery-api|g" \
      -e "s|from '@/lib/access-code-api|from '../access-code-api|g" \
      "$file" 2>/dev/null || true
  else
    sed -i \
      -e "s|from '@/integrations/supabase|from '../supabase|g" \
      -e "s|from '@/lib/api|from '../clients|g" \
      -e "s|from '@/lib/gallery-api|from '../gallery-api|g" \
      -e "s|from '@/lib/access-code-api|from '../access-code-api|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ API module migration complete!"

