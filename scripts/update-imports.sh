#!/bin/bash
# Phase 2: Update all import paths to use module structure
# Usage: ./scripts/update-imports.sh [target-repo-path]

set -e

TARGET_REPO="${1:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "🔧 Updating import paths to module structure..."

if [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Target repo not found at $TARGET_REPO"
  exit 1
fi

cd "$TARGET_REPO"

# Find all TypeScript/TSX files
FILES=$(find src modules -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "⚠️  No TypeScript files found"
  exit 0
fi

echo "📝 Found $(echo "$FILES" | wc -l | tr -d ' ') files to update"

# Update import paths
echo "$FILES" | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' \
      -e "s|from '@/components/auth|from '@modules/auth/components|g" \
      -e "s|from '@/hooks/useAuth|from '@modules/auth/hooks/useAuth|g" \
      -e "s|from '@/contexts/AuthContext|from '@modules/auth/AuthContext|g" \
      -e "s|from '@/services/AuthService|from '@modules/auth/services/AuthService|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/lib/utils|from '@modules/core/utils|g" \
      -e "s|from '@/lib/constants|from '@modules/core/constants|g" \
      -e "s|from '@/core|from '@modules/core|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      -e "s|from '@/lib/api|from '@modules/api/clients|g" \
      -e "s|from '@/lib/gallery-api|from '@modules/api/gallery-api|g" \
      -e "s|from '@/components/admin|from '@modules/dashboard/admin|g" \
      -e "s|from '@/components/analytics|from '@modules/dashboard/analytics|g" \
      -e "s|from '@/components/gallery|from '@modules/features/gallery|g" \
      -e "s|from '@/components/checkout|from '@modules/features/checkout|g" \
      -e "s|from '@/components/pricing|from '@modules/features/pricing|g" \
      -e "s|from '@/features/gemini|from '@modules/features/gemini|g" \
      -e "s|from '@/components/marketing|from '@modules/marketing/components|g" \
      -e "s|from '@/lib/marketing|from '@modules/marketing/lib|g" \
      -e "s|from '@/types|from '@modules/core/types|g" \
      "$file" 2>/dev/null || true
  else
    # Linux
    sed -i \
      -e "s|from '@/components/auth|from '@modules/auth/components|g" \
      -e "s|from '@/hooks/useAuth|from '@modules/auth/hooks/useAuth|g" \
      -e "s|from '@/contexts/AuthContext|from '@modules/auth/AuthContext|g" \
      -e "s|from '@/services/AuthService|from '@modules/auth/services/AuthService|g" \
      -e "s|from '@/components/ui|from '@modules/ui/components|g" \
      -e "s|from '@/lib/utils|from '@modules/core/utils|g" \
      -e "s|from '@/lib/constants|from '@modules/core/constants|g" \
      -e "s|from '@/core|from '@modules/core|g" \
      -e "s|from '@/integrations/supabase|from '@modules/api/supabase|g" \
      -e "s|from '@/lib/api|from '@modules/api/clients|g" \
      -e "s|from '@/lib/gallery-api|from '@modules/api/gallery-api|g" \
      -e "s|from '@/components/admin|from '@modules/dashboard/admin|g" \
      -e "s|from '@/components/analytics|from '@modules/dashboard/analytics|g" \
      -e "s|from '@/components/gallery|from '@modules/features/gallery|g" \
      -e "s|from '@/components/checkout|from '@modules/features/checkout|g" \
      -e "s|from '@/components/pricing|from '@modules/features/pricing|g" \
      -e "s|from '@/features/gemini|from '@modules/features/gemini|g" \
      -e "s|from '@/components/marketing|from '@modules/marketing/components|g" \
      -e "s|from '@/lib/marketing|from '@modules/marketing/lib|g" \
      -e "s|from '@/types|from '@modules/core/types|g" \
      "$file" 2>/dev/null || true
  fi
done

echo ""
echo "✅ Import paths updated!"
echo "📝 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Test build: npm run build"
echo "   3. Fix any remaining import errors manually"
echo "   4. Commit: git add . && git commit -m 'refactor: Update imports to module structure'"

