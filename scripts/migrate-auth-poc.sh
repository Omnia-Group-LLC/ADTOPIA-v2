#!/bin/bash
# Phase 1: POC - Migrate auth module to modular structure
# Usage: ./scripts/migrate-auth-poc.sh [legacy-repo-path] [target-repo-path]

set -e  # Exit on error

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "🔐 Migrating auth module (POC)..."

# Validate paths
if [ ! -d "$LEGACY_REPO" ]; then
  echo "❌ Error: Legacy repo not found at $LEGACY_REPO"
  exit 1
fi

if [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Target repo not found at $TARGET_REPO"
  exit 1
fi

cd "$TARGET_REPO"

# Create auth module structure
echo "📁 Creating auth module structure..."
mkdir -p modules/auth/{components,hooks,services,middleware,types,tests}

# Copy auth files
echo "📋 Copying auth files..."

# Context
if [ -f "$LEGACY_REPO/src/contexts/AuthContext.tsx" ]; then
  cp "$LEGACY_REPO/src/contexts/AuthContext.tsx" modules/auth/
  echo "  ✅ Copied AuthContext.tsx"
else
  echo "  ⚠️  Warning: AuthContext.tsx not found"
fi

# Hooks
if [ -f "$LEGACY_REPO/src/hooks/useAuth.ts" ]; then
  cp "$LEGACY_REPO/src/hooks/useAuth.ts" modules/auth/hooks/
  echo "  ✅ Copied useAuth.ts"
fi

if [ -f "$LEGACY_REPO/src/hooks/useFeatureAccess.ts" ]; then
  cp "$LEGACY_REPO/src/hooks/useFeatureAccess.ts" modules/auth/hooks/
  echo "  ✅ Copied useFeatureAccess.ts"
fi

# Components
if [ -d "$LEGACY_REPO/src/components/auth" ]; then
  cp -r "$LEGACY_REPO/src/components/auth"/* modules/auth/components/
  echo "  ✅ Copied auth components"
else
  echo "  ⚠️  Warning: auth components directory not found"
fi

# Services
if [ -f "$LEGACY_REPO/src/services/AuthService.ts" ]; then
  cp "$LEGACY_REPO/src/services/AuthService.ts" modules/auth/services/
  echo "  ✅ Copied AuthService.ts"
fi

# Middleware
if [ -f "$LEGACY_REPO/src/middleware/routeProtection.ts" ]; then
  cp "$LEGACY_REPO/src/middleware/routeProtection.ts" modules/auth/middleware/
  echo "  ✅ Copied routeProtection.ts"
fi

# Copy auth-related types to core/types (shared types adjustment)
echo "📋 Extracting shared types to core/types..."
mkdir -p modules/core/types

# Extract User type (will be deduplicated in core/types)
if [ -f "$LEGACY_REPO/src/contexts/AuthContext.tsx" ]; then
  # Extract User interface (basic extraction - manual review needed)
  grep -A 10 "export interface User" "$LEGACY_REPO/src/contexts/AuthContext.tsx" > modules/core/types/User.ts.tmp || true
  echo "  ✅ Extracted User type (needs manual review)"
fi

# Copy tests
if [ -d "$LEGACY_REPO/src/services/__tests__" ]; then
  if [ -f "$LEGACY_REPO/src/services/__tests__/AuthService.test.ts" ]; then
    cp "$LEGACY_REPO/src/services/__tests__/AuthService.test.ts" modules/auth/tests/
    echo "  ✅ Copied AuthService.test.ts"
  fi
fi

if [ -d "$LEGACY_REPO/src/contexts/__tests__" ]; then
  cp -r "$LEGACY_REPO/src/contexts/__tests__"/* modules/auth/tests/ 2>/dev/null || true
  echo "  ✅ Copied context tests"
fi

# Create barrel exports
echo "📝 Creating barrel exports..."

# Components barrel
cat > modules/auth/components/index.ts << 'EOF'
// Auth Components Barrel Exports
export { AdminGuard } from './AdminGuard';
export { PasscodeGuard } from './PasscodeGuard';
export { ProtectedRoute } from './ProtectedRoute';
export { AuthModal } from './AuthModal';
export { LoginForm } from './LoginForm';
export { RegistrationForm } from './RegistrationForm';
export { FeatureGate } from './FeatureGate';
EOF

# Main auth module barrel
cat > modules/auth/index.ts << 'EOF'
// Auth Module Barrel Exports
export { AuthProvider, useAuth, type AuthContextType } from './AuthContext';
export { useAuth as useAuthHook } from './hooks/useAuth';
export { useFeatureAccess, type UserAccess, type FeatureCheck } from './hooks/useFeatureAccess';
export { AuthService } from './services/AuthService';
export * from './components';
export * from './middleware/routeProtection';
EOF

# Update import paths (basic - will need manual review)
echo "🔧 Updating import paths..."
find modules/auth -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' \
      -e "s|from '@/contexts/AuthContext'|from '../AuthContext'|g" \
      -e "s|from '@/hooks/useAuth'|from '../hooks/useAuth'|g" \
      -e "s|from '@/services/AuthService'|from '../services/AuthService'|g" \
      -e "s|from '@/components/auth|from '../components|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      "$file" 2>/dev/null || true
  else
    # Linux
    sed -i \
      -e "s|from '@/contexts/AuthContext'|from '../AuthContext'|g" \
      -e "s|from '@/hooks/useAuth'|from '../hooks/useAuth'|g" \
      -e "s|from '@/services/AuthService'|from '../services/AuthService'|g" \
      -e "s|from '@/components/auth|from '../components|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      "$file" 2>/dev/null || true
  fi
done

echo "  ✅ Updated import paths (manual review recommended)"

# Create package.json for auth module
cat > modules/auth/package.json << 'EOF'
{
  "name": "@adtopia/auth",
  "version": "1.0.0",
  "type": "module",
  "main": "./index.ts",
  "types": "./index.ts"
}
EOF

echo ""
echo "✅ Auth module migration complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review shared types: Check modules/core/types/User.ts.tmp"
echo "   2. Move User type to modules/core/types/User.ts (remove duplicates)"
echo "   3. Update imports in auth module to use @modules/core/types"
echo "   4. Test build: npm run build"
echo "   5. Run tests: npm test -- modules/auth"
echo "   6. Commit: git add modules/auth && git commit -m 'feat: POC - Migrate auth module'"

