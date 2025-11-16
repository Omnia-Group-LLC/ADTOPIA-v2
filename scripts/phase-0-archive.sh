#!/bin/bash
# Phase 0: Tag cleanup commit and create archive backup
# Usage: ./scripts/phase-0-archive.sh

set -e

REPO_PATH="/Users/The10Komancheria/adtopia"
BACKUP_DIR="/Users/The10Komancheria"
CLEANUP_COMMIT="0361c0bd0"

echo "🏷️  Phase 0: Tagging and Archiving"

cd "$REPO_PATH"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a git repository"
  exit 1
fi

# Check if commit exists
if ! git rev-parse --verify "$CLEANUP_COMMIT" >/dev/null 2>&1; then
  echo "⚠️  Warning: Cleanup commit $CLEANUP_COMMIT not found"
  echo "💡 Using current HEAD instead"
  CLEANUP_COMMIT=$(git rev-parse HEAD)
fi

# Tag the cleanup commit
echo "📌 Tagging cleanup commit..."
if git tag -l | grep -q "v1.0-cleanup-complete"; then
  echo "  ⚠️  Tag v1.0-cleanup-complete already exists"
  read -p "  Overwrite? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git tag -d v1.0-cleanup-complete
    git tag -a v1.0-cleanup-complete -m "Final clean state: 18MB, verified builds, commit $CLEANUP_COMMIT" "$CLEANUP_COMMIT"
    echo "  ✅ Tag updated"
  fi
else
  git tag -a v1.0-cleanup-complete -m "Final clean state: 18MB, verified builds, commit $CLEANUP_COMMIT" "$CLEANUP_COMMIT"
  echo "  ✅ Tag created"
fi

# Push tag
echo "📤 Pushing tag to remote..."
if git push origin v1.0-cleanup-complete 2>/dev/null; then
  echo "  ✅ Tag pushed"
else
  echo "  ⚠️  Warning: Could not push tag (remote may not exist or no access)"
fi

# Create mirror backup
echo "💾 Creating mirror backup..."
cd "$BACKUP_DIR"
BACKUP_NAME="ADTOPIA-mirror-$(date +%Y%m%d-%H%M%S).git"
ARCHIVE_NAME="adtopia-v1-archive-$(date +%Y%m%d-%H%M%S).tar.gz"

if [ -d "$BACKUP_NAME" ]; then
  rm -rf "$BACKUP_NAME"
fi

git clone --mirror "$REPO_PATH" "$BACKUP_NAME" 2>/dev/null || {
  echo "  ⚠️  Warning: Could not create mirror (using remote URL instead)"
  git clone --mirror https://github.com/Omnia-Group-LLC/ADTOPIA.git "$BACKUP_NAME" 2>/dev/null || {
    echo "  ❌ Error: Could not create mirror backup"
    exit 1
  }
}

# Create compressed archive
echo "📦 Compressing archive..."
tar -czf "$ARCHIVE_NAME" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo "  ✅ Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

# Generate audit log
echo "📋 Generating audit log..."
cd "$REPO_PATH"
if [ -f "./create-cleanup-audit.sh" ]; then
  ./create-cleanup-audit.sh > "audit-v1-final-$(date +%Y%m%d).md"
  echo "  ✅ Audit log created"
else
  echo "  ⚠️  Warning: create-cleanup-audit.sh not found"
fi

echo ""
echo "✅ Phase 0 Complete!"
echo ""
echo "📝 Summary:"
echo "   - Tag: v1.0-cleanup-complete ($CLEANUP_COMMIT)"
echo "   - Backup: $BACKUP_DIR/$ARCHIVE_NAME ($ARCHIVE_SIZE)"
echo ""
echo "📋 Next Steps (Manual):"
echo "   1. Upload archive to secure storage (GitHub Release, S3, etc.)"
echo "   2. Archive repo on GitHub:"
echo "      - Go to: https://github.com/Omnia-Group-LLC/ADTOPIA/settings"
echo "      - Danger Zone > Transfer ownership or Archive repository"
echo "      - Transfer to: Omnia-Group-LLC/ADTOPIA-ARCHIVE"
echo "   3. Commit audit log:"
echo "      git add audit-v1-final-*.md"
echo "      git commit -m 'docs: Final cleanup audit log'"
echo "      git push origin main"
echo ""
echo "🚀 Ready for Phase 1: Create ADTOPIA-v2 repo"

