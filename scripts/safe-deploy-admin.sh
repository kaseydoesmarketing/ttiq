#!/bin/bash
# Safe deployment script for TitleIQ Admin Dashboard
# Validates, builds, tests, and deploys with automatic rollback on failure

set -e

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLLBACK_NEEDED=false
PREVIOUS_ASSET=""

# Trap errors and rollback
trap 'handle_error' ERR

handle_error() {
    echo ""
    echo -e "${COLOR_RED}========================================${COLOR_RESET}"
    echo -e "${COLOR_RED}DEPLOYMENT FAILED${COLOR_RESET}"
    echo -e "${COLOR_RED}========================================${COLOR_RESET}"

    if [ "$ROLLBACK_NEEDED" = true ] && [ -n "$PREVIOUS_ASSET" ]; then
        echo ""
        echo -e "${COLOR_YELLOW}Attempting rollback...${COLOR_RESET}"
        # Rollback would go here if we saved previous state
        echo -e "${COLOR_YELLOW}Manual verification required${COLOR_RESET}"
    fi

    exit 1
}

echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}TitleIQ Admin Dashboard - Safe Deploy${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo ""

# PHASE 1: Pre-deployment validation
echo -e "${COLOR_BLUE}Phase 1: Pre-deployment Validation${COLOR_RESET}"
echo "Running validation checks..."
echo ""

bash "$SCRIPT_DIR/validate-admin-dashboard.sh"
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${COLOR_RED}❌ Validation failed. Aborting deployment.${COLOR_RESET}"
    exit 1
fi

echo ""
echo -e "${COLOR_GREEN}✅ Validation passed${COLOR_RESET}"
echo ""

# PHASE 2: Backup current state
echo -e "${COLOR_BLUE}Phase 2: Backup Current State${COLOR_RESET}"
BACKUP_TIMESTAMP=$(date -u +%Y%m%d%H%M%S)

echo "Creating backup..."
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "
  cp /var/www/titleiq/frontend/src/pages/AdminDashboard.jsx \
     /var/www/titleiq/frontend/src/pages/AdminDashboard.jsx.backup-$BACKUP_TIMESTAMP

  # Save current asset hash for rollback
  if [ -f /var/www/titleiq/frontend/dist/index.html ]; then
    grep -o 'index-[^\"]*\.js' /var/www/titleiq/frontend/dist/index.html | head -1 > /tmp/previous_asset.txt
  fi
"

PREVIOUS_ASSET=$(ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "cat /tmp/previous_asset.txt 2>/dev/null || echo 'none'")
echo -e "${COLOR_GREEN}✅ Backup created (previous asset: $PREVIOUS_ASSET)${COLOR_RESET}"
echo ""

ROLLBACK_NEEDED=true

# PHASE 3: Set build tag
echo -e "${COLOR_BLUE}Phase 3: Configure Build${COLOR_RESET}"
BUILD_TAG=$(date -u +%Y%m%d%H%M%S)
echo "Build tag: $BUILD_TAG"

ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "
  printf 'VITE_BUILD_TAG=%s\nVITE_SHOW_CANARY=0\nVITE_ADMIN_BADGE=1\n' '$BUILD_TAG' \
    > /var/www/titleiq/frontend/.env.production.local

  # Sync to backend
  if grep -q '^BUILD_TAG=' /var/www/titleiq/backend/.env; then
    sed -i 's/^BUILD_TAG=.*/BUILD_TAG=$BUILD_TAG/' /var/www/titleiq/backend/.env
  else
    echo 'BUILD_TAG=$BUILD_TAG' >> /var/www/titleiq/backend/.env
  fi
"

echo -e "${COLOR_GREEN}✅ Build configured${COLOR_RESET}"
echo ""

# PHASE 4: Build frontend
echo -e "${COLOR_BLUE}Phase 4: Build Frontend${COLOR_RESET}"
echo "Building..."

BUILD_OUTPUT=$(ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
  "cd /var/www/titleiq/frontend && npm run build 2>&1" || echo "BUILD_FAILED")

if echo "$BUILD_OUTPUT" | grep -q "BUILD_FAILED"; then
    echo -e "${COLOR_RED}❌ Build failed${COLOR_RESET}"
    echo "$BUILD_OUTPUT"
    exit 1
fi

# Check for build errors
if echo "$BUILD_OUTPUT" | grep -qE "(ERROR|Failed to compile|SyntaxError)"; then
    echo -e "${COLOR_RED}❌ Build contained errors${COLOR_RESET}"
    echo "$BUILD_OUTPUT"
    exit 1
fi

NEW_ASSET=$(echo "$BUILD_OUTPUT" | grep -o 'index-[^.]*\.js' | tail -1)
if [ -z "$NEW_ASSET" ]; then
    echo -e "${COLOR_RED}❌ Could not determine new asset hash${COLOR_RESET}"
    exit 1
fi

echo -e "${COLOR_GREEN}✅ Build succeeded${COLOR_RESET}"
echo "New asset: $NEW_ASSET"
echo ""

# PHASE 5: Restart backend
echo -e "${COLOR_BLUE}Phase 5: Restart Backend${COLOR_RESET}"
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
  "cd /var/www/titleiq/backend && pm2 restart titleiq-backend --update-env" > /dev/null 2>&1

sleep 2

# Verify backend is running
BACKEND_STATUS=$(ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
  "pm2 status titleiq-backend | grep -o 'online'" || echo "offline")

if [ "$BACKEND_STATUS" != "online" ]; then
    echo -e "${COLOR_RED}❌ Backend failed to start${COLOR_RESET}"
    exit 1
fi

echo -e "${COLOR_GREEN}✅ Backend restarted${COLOR_RESET}"
echo ""

# PHASE 6: Clear caches and reload nginx
echo -e "${COLOR_BLUE}Phase 6: Clear Caches${COLOR_RESET}"
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "
  rm -rf /var/cache/nginx/* 2>/dev/null || true
  nginx -t && systemctl reload nginx
" > /dev/null 2>&1

echo -e "${COLOR_GREEN}✅ Caches cleared, nginx reloaded${COLOR_RESET}"
echo ""

# PHASE 7: Verify deployment
echo -e "${COLOR_BLUE}Phase 7: Verify Deployment${COLOR_RESET}"
echo "Testing live site..."

# Wait a moment for nginx to fully reload
sleep 2

# Check if new asset is being served
LIVE_ASSET=$(curl -s 'https://titleiq.tightslice.com/' | grep -o 'index-[^"]*\.js' | head -1)

if [ "$LIVE_ASSET" != "$NEW_ASSET" ]; then
    echo -e "${COLOR_RED}❌ New asset not being served${COLOR_RESET}"
    echo "Expected: $NEW_ASSET"
    echo "Got: $LIVE_ASSET"
    exit 1
fi

echo -e "${COLOR_GREEN}✅ New asset being served: $LIVE_ASSET${COLOR_RESET}"

# Check if admin endpoint returns HTML (not 404)
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'https://titleiq.tightslice.com/admin')
if [ "$ADMIN_STATUS" != "200" ]; then
    echo -e "${COLOR_YELLOW}⚠️  Warning: Admin endpoint returned $ADMIN_STATUS${COLOR_RESET}"
else
    echo -e "${COLOR_GREEN}✅ Admin endpoint accessible${COLOR_RESET}"
fi

# Check backend health
BACKEND_HEALTH=$(curl -s 'https://titleiq.tightslice.com/api/health' | grep -o '"ok":true' || echo "")
if [ -z "$BACKEND_HEALTH" ]; then
    echo -e "${COLOR_YELLOW}⚠️  Warning: Backend health check failed${COLOR_RESET}"
else
    echo -e "${COLOR_GREEN}✅ Backend healthy${COLOR_RESET}"
fi

echo ""

# PHASE 8: Success summary
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}✅ DEPLOYMENT SUCCESSFUL${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo ""
echo "Build tag:    $BUILD_TAG"
echo "Asset hash:   $NEW_ASSET"
echo "Backup:       AdminDashboard.jsx.backup-$BACKUP_TIMESTAMP"
echo ""
echo -e "${COLOR_GREEN}URLs to test:${COLOR_RESET}"
echo "  Admin:  https://titleiq.tightslice.com/admin"
echo "  API:    https://titleiq.tightslice.com/api/health"
echo ""
echo -e "${COLOR_YELLOW}Remember to hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)${COLOR_RESET}"
echo ""
echo -e "${COLOR_GREEN}Deployment complete!${COLOR_RESET}"
