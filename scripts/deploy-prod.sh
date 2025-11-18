#!/bin/bash

# Deploy Prod Script for ADTOPIA-v2
# 
# Deploys to Vercel production, triggers deployment hook, and runs Lighthouse audit
# 
# Usage: ./scripts/deploy-prod.sh
# 
# Quality: JSDoc, error handling, Lighthouse 95+ /gallery/:id

set -e  # Exit on error

echo "🚀 ADTOPIA-v2 Production Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Run from project root.${NC}"
    exit 1
fi

# Build the project first
echo -e "${YELLOW}📦 Building project...${NC}"
npm run build --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Deploy to Vercel production
echo -e "${YELLOW}🚀 Deploying to Vercel production...${NC}"
DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed:${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Extract production URL from output
PROD_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)

if [ -z "$PROD_URL" ]; then
    # Try alternative pattern
    PROD_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+-[a-zA-Z0-9]+\.vercel\.app' | head -1)
fi

if [ -z "$PROD_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not extract production URL from output${NC}"
    echo "$DEPLOY_OUTPUT"
    PROD_URL="https://adtopia.vercel.app"  # Fallback
else
    echo -e "${GREEN}✅ Deployment successful${NC}"
fi

echo ""
echo -e "${GREEN}🌐 Production URL: ${PROD_URL}${NC}"
echo ""

# Trigger deployment hook if configured
if [ -n "$VERCEL_DEPLOY_HOOK_URL" ]; then
    echo -e "${YELLOW}🔗 Triggering deployment hook...${NC}"
    HOOK_RESPONSE=$(curl -s -X POST "${VERCEL_DEPLOY_HOOK_URL}?branch=main" -w "\n%{http_code}" 2>&1)
    HTTP_CODE=$(echo "$HOOK_RESPONSE" | tail -1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "204" ]; then
        echo -e "${GREEN}✅ Deployment hook triggered successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment hook returned HTTP ${HTTP_CODE}${NC}"
        echo "$HOOK_RESPONSE" | head -n -1
    fi
    
    # Save hook response to log
    echo "$HOOK_RESPONSE" > deploy-hook-log.txt
    echo "Hook response saved to deploy-hook-log.txt"
else
    echo -e "${YELLOW}⚠️  VERCEL_DEPLOY_HOOK_URL not set, skipping hook${NC}"
fi

# Run Lighthouse audit if lighthouse CLI is available
if command -v lighthouse &> /dev/null; then
    echo ""
    echo -e "${YELLOW}🔍 Running Lighthouse audit on /gallery/:id...${NC}"
    
    # Use a test gallery ID or the main gallery page
    LIGHTHOUSE_URL="${PROD_URL}/gallery"
    
    # Run Lighthouse audit
    lighthouse "$LIGHTHOUSE_URL" \
        --output=html \
        --output-path=./lighthouse-report.html \
        --only-categories=performance,accessibility,best-practices,seo \
        --chrome-flags="--headless --no-sandbox" \
        --quiet || true
    
    if [ -f "./lighthouse-report.html" ]; then
        echo -e "${GREEN}✅ Lighthouse report saved to lighthouse-report.html${NC}"
        
        # Try to extract performance score (requires jq or grep)
        if command -v jq &> /dev/null && [ -f "./lighthouse-report.json" ]; then
            PERF_SCORE=$(jq -r '.categories.performance.score * 100' ./lighthouse-report.json 2>/dev/null || echo "N/A")
            echo -e "${GREEN}📊 Performance Score: ${PERF_SCORE}${NC}"
            
            if [ "$PERF_SCORE" != "N/A" ] && [ $(echo "$PERF_SCORE >= 95" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
                echo -e "${GREEN}✅ Performance score meets 95+ requirement${NC}"
            elif [ "$PERF_SCORE" != "N/A" ]; then
                echo -e "${YELLOW}⚠️  Performance score ${PERF_SCORE} is below 95${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Lighthouse CLI not installed. Install with: npm i -g lighthouse${NC}"
    echo "   Run manually: lighthouse ${PROD_URL}/gallery --view"
fi

# Summary
echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✅ Deployment Complete${NC}"
echo -e "${GREEN}🌐 Production URL: ${PROD_URL}${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify deployment: ${PROD_URL}"
echo "2. Run E2E tests: npx playwright test --project=vercel-preview"
echo "3. Check Lighthouse report: open lighthouse-report.html"
echo ""

# Export URL for use in CI/CD
export VERCEL_URL="$PROD_URL"
echo "VERCEL_URL=$PROD_URL" >> .env.production.local 2>/dev/null || true

exit 0

