#!/bin/bash
# Phase 2 Wave 2: Migrate dashboard module (admin, analytics)
# Usage: ./scripts/migrate-dashboard.sh [legacy-repo-path] [target-repo-path]

set -e

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "📊 Migrating dashboard module..."

if [ ! -d "$LEGACY_REPO" ] || [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Repos not found"
  exit 1
fi

cd "$TARGET_REPO"

# Create dashboard module structure
mkdir -p modules/dashboard/{admin,analytics,pages}

# Copy admin components
if [ -d "$LEGACY_REPO/src/components/admin" ]; then
  cp -r "$LEGACY_REPO/src/components/admin"/* modules/dashboard/admin/
  echo "  ✅ Copied admin components"
fi

# Copy analytics components
if [ -d "$LEGACY_REPO/src/components/analytics" ]; then
  cp -r "$LEGACY_REPO/src/components/analytics"/* modules/dashboard/analytics/
  echo "  ✅ Copied analytics components"
fi

# Copy admin pages
if [ -d "$LEGACY_REPO/src/pages/admin" ]; then
  cp -r "$LEGACY_REPO/src/pages/admin"/* modules/dashboard/pages/
  echo "  ✅ Copied admin pages"
fi

# Copy dashboard-specific components
if [ -f "$LEGACY_REPO/src/components/AdminDashboard.tsx" ]; then
  cp "$LEGACY_REPO/src/components/AdminDashboard.tsx" modules/dashboard/
  echo "  ✅ Copied AdminDashboard.tsx"
fi

if [ -f "$LEGACY_REPO/src/components/MonetizationDashboard.tsx" ]; then
  cp "$LEGACY_REPO/src/components/MonetizationDashboard.tsx" modules/dashboard/
  echo "  ✅ Copied MonetizationDashboard.tsx"
fi

# Create barrel exports
cat > modules/dashboard/admin/index.ts << 'EOF'
// Admin Components Barrel Export
export * from './BackendAdminDashboard';
export * from './TenantDashboard';
// Add more admin exports here
EOF

cat > modules/dashboard/analytics/index.ts << 'EOF'
// Analytics Components Barrel Export
export * from './RealTimeAnalytics';
// Add more analytics exports here
EOF

cat > modules/dashboard/index.ts << 'EOF'
// Dashboard Module Barrel Exports
export * from './admin';
export * from './analytics';
export { AdminDashboard } from './AdminDashboard';
export { MonetizationDashboard } from './MonetizationDashboard';
EOF

# Update import paths
echo "🔧 Updating import paths..."
find modules/dashboard -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/components/admin|from '../admin|g" \
      -e "s|from '@/components/analytics|from '../analytics|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/hooks/useAuth|from '@modules/auth/hooks/useAuth|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      "$file" 2>/dev/null || true
  else
    sed -i \
      -e "s|from '@/components/admin|from '../admin|g" \
      -e "s|from '@/components/analytics|from '../analytics|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/hooks/useAuth|from '@modules/auth/hooks/useAuth|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ Dashboard module migration complete!"

