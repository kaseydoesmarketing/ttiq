#!/bin/bash

set -e

API_BASE="${API_BASE:-https://titleiq.tightslice.com/api/auth}"
TEST_EMAIL="test+$(date +%s)@example.com"

echo "🧪 TitleIQ Password Reset Flow Test"
echo "===================================="
echo "API: $API_BASE"
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Request reset
echo "Test 1: Request password reset..."
RESPONSE=$(curl -s -X POST "$API_BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

if echo "$RESPONSE" | grep -q "success"; then
  echo "✓ Test 1 passed"
else
  echo "✗ Test 1 failed"
  echo "$RESPONSE"
  exit 1
fi

# Extract token (dev mode only)
TOKEN=$(echo "$RESPONSE" | grep -o '"dev_token":"[0-9]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "⚠ No dev_token in response (production mode)"
  echo "Please check email for reset code"
  exit 0
fi

echo "  Token: $TOKEN"
echo ""

# Test 2: Reset with valid token
echo "Test 2: Reset password with valid token..."
RESET_RESPONSE=$(curl -s -X POST "$API_BASE/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"token\":\"$TOKEN\",\"newPassword\":\"NewSecure123!\"}")

if echo "$RESET_RESPONSE" | grep -q "success"; then
  echo "✓ Test 2 passed"
else
  echo "✗ Test 2 failed"
  echo "$RESET_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Try reusing token
echo "Test 3: Verify token cannot be reused..."
REUSE_RESPONSE=$(curl -s -X POST "$API_BASE/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"token\":\"$TOKEN\",\"newPassword\":\"Another123!\"}")

if echo "$REUSE_RESPONSE" | grep -q "Invalid or expired"; then
  echo "✓ Test 3 passed"
else
  echo "✗ Test 3 failed"
  echo "$REUSE_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Test weak password rejection
echo "Test 4: Verify weak password rejected..."
REQUEST_RESPONSE=$(curl -s -X POST "$API_BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

NEW_TOKEN=$(echo "$REQUEST_RESPONSE" | grep -o '"dev_token":"[0-9]*"' | cut -d'"' -f4)

if [ -n "$NEW_TOKEN" ]; then
  WEAK_RESPONSE=$(curl -s -X POST "$API_BASE/reset-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"token\":\"$NEW_TOKEN\",\"newPassword\":\"weak\"}")

  if echo "$WEAK_RESPONSE" | grep -q "does not meet security requirements"; then
    echo "✓ Test 4 passed"
  else
    echo "✗ Test 4 failed"
    echo "$WEAK_RESPONSE"
    exit 1
  fi
else
  echo "⚠ Test 4 skipped (no dev_token available)"
fi
echo ""

echo "===================================="
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "  • Check email inbox for reset codes"
echo "  • Verify confirmation email received"
echo "  • Test frontend flow at $API_BASE/../login"
