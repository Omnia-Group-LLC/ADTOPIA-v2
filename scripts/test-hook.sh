#!/bin/bash
# Vercel Deployment Hook Test Script
# Tests staging deployment hook and retrieves preview URL
#
# Usage: ./scripts/test-hook.sh [branch]
# Example: ./scripts/test-hook.sh develop

set -e

BRANCH="${1:-develop}"
STAGING_HOOK_URL="${VERCEL_STAGING_HOOK_URL:-}"

if [ -z "$STAGING_HOOK_URL" ]; then
  echo "⚠️  VERCEL_STAGING_HOOK_URL not set"
  echo "Set it in your environment or Vercel dashboard:"
  echo "  Vercel Dashboard > Project Settings > Deploy Hooks > Create Hook"
  echo "  Branch: $BRANCH"
  echo "  Copy hook URL to VERCEL_STAGING_HOOK_URL"
  exit 1
fi

echo "🔗 Testing Vercel deployment hook for branch: $BRANCH"
echo "📡 Hook URL: $STAGING_HOOK_URL"

# Trigger deployment hook
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$STAGING_HOOK_URL?branch=$BRANCH" \
  -H "Content-Type: application/json" \
  -o /tmp/vercel-hook-response.json)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(cat /tmp/vercel-hook-response.json)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Hook triggered successfully (HTTP $HTTP_CODE)"
  
  # Extract deployment URL from response (if available)
  DEPLOYMENT_URL=$(echo "$RESPONSE_BODY" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  
  if [ -n "$DEPLOYMENT_URL" ]; then
    echo "🚀 Preview URL: $DEPLOYMENT_URL"
  else
    echo "⏳ Deployment triggered - check Vercel dashboard for preview URL"
    echo "   Dashboard: https://vercel.com/dashboard"
  fi
  
  # Test preview URL accessibility (if we have it)
  if [ -n "$DEPLOYMENT_URL" ]; then
    echo ""
    echo "🧪 Testing preview URL accessibility..."
    sleep 5  # Wait for deployment to start
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")
    if [ "$STATUS" -eq 200 ]; then
      echo "✅ Preview URL is accessible (HTTP $STATUS)"
      
      # Check for RLS mode header
      RLS_MODE=$(curl -s -I "$DEPLOYMENT_URL/gallery" | grep -i "x-rls-mode" | cut -d: -f2 | tr -d ' ' || echo "")
      if [ -n "$RLS_MODE" ]; then
        echo "🔒 RLS Mode: $RLS_MODE"
      fi
    else
      echo "⏳ Preview URL not ready yet (HTTP $STATUS) - deployment may still be in progress"
    fi
  fi
  
  echo ""
  echo "📋 Response saved to: /tmp/vercel-hook-response.json"
else
  echo "❌ Hook trigger failed (HTTP $HTTP_CODE)"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi

