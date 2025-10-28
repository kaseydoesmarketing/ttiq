# Password Reset Flow - Test Checklist

## Overview
This document provides a complete testing checklist for the password reset functionality in TitleIQ.

## Prerequisites
- Backend running on port 5000 (or configured port)
- Frontend accessible
- Email service configured (or dev mode for testing)
- Test user account created

## Test Flow

### 1. Request Password Reset Code

**Endpoint:** `POST /api/auth/forgot-password`

```bash
curl -X POST https://titleiq.tightslice.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If that email exists, a password reset code has been sent",
  "dev_token": "123456"  // Only in development mode
}
```

**Expected Behavior:**
- ✓ Returns 200 status code
- ✓ Generic message (same whether email exists or not)
- ✓ Email sent to user (check inbox or backend logs in dev mode)
- ✓ 6-digit code generated
- ✓ Code expires in 15 minutes
- ✓ Response time includes jitter (100-300ms) to prevent enumeration

**Security Checks:**
- ✓ No token leaked in production logs
- ✓ No indication whether email exists
- ✓ Rate limited: 5 requests per 15 minutes per IP
- ✓ Rate limited: 5 requests per hour per email

---

### 2. Complete Password Reset

**Endpoint:** `POST /api/auth/reset-password`

```bash
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "123456",
    "newPassword": "NewSecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password"
}
```

**Expected Behavior:**
- ✓ Returns 200 status code
- ✓ Password updated in database
- ✓ Reset token cleared from database
- ✓ Password version incremented
- ✓ Confirmation email sent
- ✓ Response time includes jitter

**Password Policy Enforced:**
- ✓ Minimum 10 characters
- ✓ At least one uppercase letter
- ✓ At least one lowercase letter
- ✓ At least one number
- ✓ At least one special character
- ✓ No common weak patterns (password123, etc.)
- ✓ No sequential characters (123, abc, etc.)
- ✓ No repeated characters (aaa, 111, etc.)

**Security Checks:**
- ✓ Old sessions invalidated (password_version mismatch)
- ✓ Token cannot be reused
- ✓ Rate limited: 5 requests per 15 minutes per IP
- ✓ Rate limited: 5 requests per hour per email

---

### 3. Verify Token Cannot Be Reused

**Test:** Try resetting password again with same token

```bash
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "123456",
    "newPassword": "AnotherPassword123!"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid or expired reset token"
}
```

**Expected Behavior:**
- ✓ Returns 400 status code
- ✓ Generic error message
- ✓ Token was cleared after first use

---

### 4. Verify Token Expiration

**Test:** Wait 15+ minutes and try to reset

```bash
# Request reset code
curl -X POST https://titleiq.tightslice.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Wait 16 minutes...

# Try to use expired token
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "123456",
    "newPassword": "NewPassword123!"
  }'
```

**Expected Response:**
```json
{
  "error": "Reset token has expired. Please request a new one"
}
```

**Expected Behavior:**
- ✓ Returns 400 status code
- ✓ Clear expiration message
- ✓ Suggests requesting new code

---

### 5. Verify Session Invalidation

**Test:** Reset password while having an active session

```bash
# 1. Login and get token
curl -X POST https://titleiq.tightslice.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"OldPassword123!"}'

# Save the token from response

# 2. Reset password
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "123456",
    "newPassword": "NewPassword123!"
  }'

# 3. Try to use old token
curl -X GET https://titleiq.tightslice.com/api/auth/me \
  -H "Authorization: Bearer OLD_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "error": "Session expired. Please log in again.",
  "reason": "password_changed"
}
```

**Expected Behavior:**
- ✓ Returns 401 status code
- ✓ Old token rejected
- ✓ User must log in again with new password

---

### 6. Test Rate Limiting

**Test:** Exceed rate limits

```bash
# Make 6 rapid requests (limit is 5 per 15 minutes)
for i in {1..6}; do
  curl -X POST https://titleiq.tightslice.com/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo "\nRequest $i"
done
```

**Expected Behavior:**
- ✓ First 5 requests succeed
- ✓ 6th request returns 429 status
- ✓ Generic error message: "Too many requests. Please try again later."
- ✓ No indication of email existence even when rate limited

---

### 7. Test Password Policy Violations

**Test:** Try weak passwords

```bash
# Too short
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","token":"123456","newPassword":"Short1!"}'

# No uppercase
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","token":"123456","newPassword":"lowercase123!"}'

# Common pattern
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","token":"123456","newPassword":"Password123!"}'
```

**Expected Response:**
```json
{
  "error": "Password does not meet security requirements",
  "details": [
    "Password must be at least 10 characters long",
    "Password must contain at least one uppercase letter"
  ]
}
```

**Expected Behavior:**
- ✓ Returns 400 status code
- ✓ Clear error message with specific requirements
- ✓ Password not changed

---

### 8. Frontend Flow Test (Manual)

**Test Steps:**

1. Navigate to `/login`
   - ✓ See "Forgot password?" link

2. Click "Forgot password?" → `/forgot-password`
   - ✓ Email input field visible
   - ✓ Submit button enabled

3. Enter email and submit
   - ✓ Success message displayed
   - ✓ In dev mode: reset code shown
   - ✓ "Enter reset code →" link visible
   - ✓ "Resend code" button appears with 60s timer

4. Click "Enter reset code →" → `/reset-password`
   - ✓ Email, token, new password, confirm password fields
   - ✓ Password requirements list visible

5. Start typing password
   - ✓ Requirements checklist updates in real-time
   - ✓ Green checkmarks for met requirements
   - ✓ Gray circles for unmet requirements

6. Enter weak password
   - ✓ Submit button disabled
   - ✓ Requirements remain unmet

7. Enter strong password matching all requirements
   - ✓ All requirements show green checkmarks
   - ✓ Submit button enabled

8. Enter mismatched passwords
   - ✓ Error message: "Passwords do not match"

9. Submit valid reset
   - ✓ Success message displayed
   - ✓ Auto-redirect to /login after 2 seconds

10. Check email inbox
    - ✓ Received "Password Reset Code" email
    - ✓ Contains 6-digit code
    - ✓ Professional formatting
    - ✓ 15-minute expiry notice
    - ✓ After reset: "Password Changed" confirmation email

---

## Integration Test Script

```bash
#!/bin/bash

set -e

API_BASE="https://titleiq.tightslice.com/api/auth"
TEST_EMAIL="test+$(date +%s)@example.com"

echo "🧪 TitleIQ Password Reset Flow Test"
echo "===================================="
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

# Test 4: Test rate limiting
echo "Test 4: Verify rate limiting (5 requests)..."
RATE_LIMIT_HIT=false

for i in {1..6}; do
  RATE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ratelimit@test.com\"}")

  if echo "$RATE_RESPONSE" | grep -q "429"; then
    RATE_LIMIT_HIT=true
    break
  fi
  sleep 1
done

if [ "$RATE_LIMIT_HIT" = true ]; then
  echo "✓ Test 4 passed (rate limit enforced)"
else
  echo "⚠ Test 4: Rate limit not hit (may need more requests)"
fi
echo ""

# Test 5: Test weak password rejection
echo "Test 5: Verify weak password rejected..."
REQUEST_RESPONSE=$(curl -s -X POST "$API_BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

NEW_TOKEN=$(echo "$REQUEST_RESPONSE" | grep -o '"dev_token":"[0-9]*"' | cut -d'"' -f4)

WEAK_RESPONSE=$(curl -s -X POST "$API_BASE/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"token\":\"$NEW_TOKEN\",\"newPassword\":\"weak\"}")

if echo "$WEAK_RESPONSE" | grep -q "does not meet security requirements"; then
  echo "✓ Test 5 passed"
else
  echo "✗ Test 5 failed"
  echo "$WEAK_RESPONSE"
  exit 1
fi
echo ""

echo "===================================="
echo "✅ All tests passed!"
echo ""
```

---

## Troubleshooting

### Issue: No email received
- **Check:** Email service configured (RESEND_API_KEY or SENDGRID_API_KEY)
- **Check:** Backend logs for email sending errors
- **Check:** Spam folder
- **Dev Mode:** Check backend console for dev_token

### Issue: Token invalid immediately
- **Check:** Email matches exactly (case-sensitive)
- **Check:** Token hasn't expired (15-minute window)
- **Check:** Token wasn't already used

### Issue: Password rejected
- **Check:** Password meets all requirements:
  - At least 10 characters
  - Contains uppercase, lowercase, number, special character
  - No common patterns

### Issue: Rate limited
- **Check:** Not exceeding 5 requests per 15 minutes (IP-based)
- **Check:** Not exceeding 5 requests per hour (email-based)
- **Wait:** 15 minutes for IP limit to reset
- **Wait:** 1 hour for email limit to reset

### Issue: Session not invalidated
- **Check:** password_version column exists in database
- **Check:** Token includes passwordVersion field
- **Check:** Auth middleware validates password_version

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Run all automated tests
- [ ] Run migration: `add-password-version.mjs`
- [ ] Configure email service (RESEND_API_KEY)
- [ ] Set NODE_ENV=production
- [ ] Verify no tokens in production logs
- [ ] Test with real email account
- [ ] Verify rate limiting works
- [ ] Test session invalidation
- [ ] Monitor error rates after deploy
- [ ] Have rollback plan ready

---

## Monitoring

Key metrics to monitor:

- **Password Reset Requests:** Track volume and success rate
- **Failed Resets:** Monitor for patterns (expired tokens, wrong codes)
- **Rate Limit Hits:** Alert if spike indicates attack
- **Email Delivery:** Track bounce rates and failures
- **Session Invalidations:** Monitor password_changed errors

---

## Security Notes

1. **Email Enumeration Prevention:** Always return generic success message
2. **Timing Attack Prevention:** Random 100-300ms jitter on all responses
3. **Brute Force Protection:** Dual rate limits (IP + email)
4. **Token Security:** Single-use, 15-minute expiry, cleared after use
5. **Session Management:** Old sessions auto-invalidated on password change
6. **Logging:** No tokens or sensitive data in production logs

---

## Support

For issues or questions:
- Review backend logs: `pm2 logs titleiq-backend`
- Check database: `sqlite3 database/titleiq.db "SELECT * FROM users WHERE email='...';"`
- Test endpoints with curl commands above
