#!/bin/bash

# ZEROFAIL VALIDATION: Production Onboarding Tests
# Automated testing script for TitleIQ Onboarding

set -e

echo "=================================================="
echo "ZEROFAIL VALIDATION: TitleIQ Onboarding Testing"
echo "=================================================="
echo ""
echo "Target: https://titleiq.tightslice.com"
echo "Tier: Standard (Comprehensive)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
API_URL="https://titleiq.tightslice.com"

# Test helper functions
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_code="$3"
  local headers="$4"

  echo -n "Testing $name... "

  if [ -n "$headers" ]; then
    response_code=$(curl -s -o /dev/null -w "%{http_code}" -H "$headers" "$url")
  else
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  fi

  if [ "$response_code" -eq "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response_code)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $response_code)"
    ((FAILED++))
  fi
}

echo "=== Category 1: Frontend Availability ==="
echo ""

test_endpoint "Frontend homepage" "$API_URL" 200
test_endpoint "Frontend /app route" "$API_URL/app" 200
test_endpoint "Frontend assets load" "$API_URL/assets/index-sYUGfSTM.js" 200

echo ""
echo "=== Category 2: Backend API Endpoints ==="
echo ""

# Test public endpoints
test_endpoint "Backend health check" "$API_URL/api/health" 200

# Test protected endpoints (should return 401 without auth)
test_endpoint "Onboarding status (no auth)" "$API_URL/api/onboarding/status" 401
test_endpoint "Onboarding update (no auth)" "$API_URL/api/onboarding/update" 401
test_endpoint "Onboarding complete (no auth)" "$API_URL/api/onboarding/complete" 401

echo ""
echo "=== Category 3: Database Connection Test ==="
echo ""

# SSH into production and check database
echo "Checking production database..."

ssh -i ~/.ssh/tightslice_deploy root@72.61.0.118 << 'ENDSSH'
cd /var/www/titleiq/backend

# Check if database exists
if [ -f "database/titleiq.db" ]; then
  echo "✓ Database file exists"

  # Check schema for onboarding columns
  SCHEMA=$(sqlite3 database/titleiq.db ".schema users" 2>&1)

  if echo "$SCHEMA" | grep -q "onboarding_step"; then
    echo "✓ onboarding_step column exists"
  else
    echo "✗ onboarding_step column MISSING"
  fi

  # Count users
  USER_COUNT=$(sqlite3 database/titleiq.db "SELECT COUNT(*) FROM users;" 2>&1)
  echo "✓ Database has $USER_COUNT users"

  # Check recent activity
  RECENT=$(sqlite3 database/titleiq.db "SELECT COUNT(*) FROM users WHERE created_at > strftime('%s', 'now', '-7 days') * 1000;" 2>&1)
  echo "✓ $RECENT users created in last 7 days"

else
  echo "✗ Database file NOT found"
  exit 1
fi
ENDSSH

echo ""
echo "=== Category 4: Bundle Size & Performance ==="
echo ""

# Check bundle size
BUNDLE_SIZE=$(ls -lh /Users/kvimedia/titleiq/frontend/dist/assets/index-*.js | awk '{print $5}')
echo "Frontend bundle size: $BUNDLE_SIZE"

# Acceptable if < 500KB
BUNDLE_KB=$(ls -l /Users/kvimedia/titleiq/frontend/dist/assets/index-*.js | awk '{print $5}')
if [ "$BUNDLE_KB" -lt 512000 ]; then
  echo -e "${GREEN}✓ Bundle size acceptable${NC} ($BUNDLE_SIZE < 500KB)"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠ Bundle size large${NC} ($BUNDLE_SIZE > 500KB)"
fi

# Test frontend load time
echo ""
echo "Testing frontend load time..."
START=$(date +%s%3N)
curl -s "$API_URL" > /dev/null
END=$(date +%s%3N)
DURATION=$((END - START))

if [ "$DURATION" -lt 2000 ]; then
  echo -e "${GREEN}✓ Frontend loads in ${DURATION}ms${NC} (< 2000ms)"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠ Frontend load time: ${DURATION}ms${NC} (target: < 2000ms)"
fi

echo ""
echo "=== Category 5: Production Server Health ==="
echo ""

# Check backend server
echo "Checking backend server status..."

ssh -i ~/.ssh/tightslice_deploy root@72.61.0.118 << 'ENDSSH'
# Check if PM2 process is running
if pm2 list | grep -q "titleiq-backend"; then
  echo "✓ Backend server running (PM2)"
else
  echo "✗ Backend server NOT running"
  exit 1
fi

# Check server logs for errors (last 50 lines)
cd /var/www/titleiq/backend
ERROR_COUNT=$(pm2 logs titleiq-backend --lines 50 --nostream 2>&1 | grep -i "error" | wc -l)
if [ "$ERROR_COUNT" -lt 5 ]; then
  echo "✓ Backend logs healthy (< 5 recent errors)"
else
  echo "⚠ Backend has $ERROR_COUNT errors in recent logs"
fi
ENDSSH

echo ""
echo "=================================================="
echo "TEST SUMMARY"
echo "=================================================="
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}✓ ALL AUTOMATED TESTS PASSED${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Complete manual visual testing (see onboarding-manual-checklist.md)"
  echo "2. Test user flows end-to-end"
  echo "3. Verify onboarding data saves correctly"
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  echo ""
  echo "Review failures above and fix issues before proceeding."
  exit 1
fi
