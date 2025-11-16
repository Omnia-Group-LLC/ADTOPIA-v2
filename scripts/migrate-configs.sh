#!/bin/bash
# Phase 1: Migrate essential configs from legacy repo to v2
# Usage: ./scripts/migrate-configs.sh [legacy-repo-path] [target-repo-path]

set -e  # Exit on error

LEGACY_REPO="${1:-/Users/The10Komancheria/adtopia}"
TARGET_REPO="${2:-/Users/The10Komancheria/ADTOPIA-v2}"

echo "🚀 Migrating configs from $LEGACY_REPO to $TARGET_REPO"

# Validate paths
if [ ! -d "$LEGACY_REPO" ]; then
  echo "❌ Error: Legacy repo not found at $LEGACY_REPO"
  exit 1
fi

if [ ! -d "$TARGET_REPO" ]; then
  echo "❌ Error: Target repo not found at $TARGET_REPO"
  echo "💡 Create it first: git clone https://github.com/Omnia-Group-LLC/ADTOPIA-v2.git"
  exit 1
fi

cd "$TARGET_REPO"

# Copy essential config files
echo "📋 Copying config files..."

CONFIG_FILES=(
  "package.json"
  "vite.config.ts"
  "tsconfig.app.json"
  "tsconfig.node.json"
  "tailwind.config.ts"
  "postcss.config.js"
  "eslint.config.js"
  "vitest.config.ts"
  "playwright.config.ts"
  ".gitignore"
  "env.example"
)

for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$LEGACY_REPO/$file" ]; then
    cp "$LEGACY_REPO/$file" .
    echo "  ✅ Copied $file"
  else
    echo "  ⚠️  Warning: $file not found in legacy repo"
  fi
done

# Update package.json name
if [ -f "package.json" ]; then
  echo "📝 Updating package.json name..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/"name": "adtopia"/"name": "adtopia-v2"/' package.json
  else
    # Linux
    sed -i 's/"name": "adtopia"/"name": "adtopia-v2"/' package.json
  fi
  echo "  ✅ Updated package name to adtopia-v2"
fi

# Create Vercel config for Vite SPA
echo "📝 Creating vercel.json for Vite SPA..."
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
echo "  ✅ Created vercel.json"

# Create initial README
echo "📝 Creating README.md..."
cat > README.md << 'EOF'
# AdTopia v2 - Modular Architecture

> **Modular revamp of AdTopia with clean separation of concerns**

## Structure

```
modules/
├── auth/      # Authentication & authorization
├── core/      # Shared utilities, constants, types
├── ui/        # UI components (Radix/Shadcn)
├── api/       # API clients & Supabase integration
├── dashboard/ # Admin & analytics
├── features/  # Feature modules (gallery, checkout, pricing)
└── marketing/ # Marketing components & FOMO elements
```

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

## Migration Status

- [ ] Phase 0: Archive complete
- [ ] Phase 1: Configs migrated, auth POC
- [ ] Phase 2: Full modular migration
- [ ] Phase 3: Testing & optimization
- [ ] Phase 4: Vercel deployment

See `REVAMP_PLAN.md` for full migration plan.
EOF
echo "  ✅ Created README.md"

echo ""
echo "✅ Config migration complete!"
echo "📝 Next steps:"
echo "   1. Review changes: git status"
echo "   2. Commit: git add . && git commit -m 'chore: Migrate essential configs from v1'"
echo "   3. Run: ./scripts/migrate-auth-poc.sh"

