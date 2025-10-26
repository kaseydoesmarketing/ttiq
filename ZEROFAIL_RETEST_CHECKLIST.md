# ZEROFAIL RE-CERTIFICATION CHECKLIST

After applying the emergency fix, use this checklist to verify everything works before requesting final certification.

---

## Pre-Flight Checks

### 1. Verify Fix Was Deployed
```bash
ssh root@72.61.0.118 "grep 'llama-3.3-70b-versatile' /var/www/titleiq/backend/utils/llm.js"
```
**Expected:** Line containing `model: 'llama-3.3-70b-versatile'`
**Status:** [ ] PASS / [ ] FAIL

### 2. Verify Backend is Running
```bash
ssh root@72.61.0.118 "pm2 list | grep titleiq-backend"
```
**Expected:** Status: `online`, Uptime: recent restart time
**Status:** [ ] PASS / [ ] FAIL

---

## Core Loop Tests

### Test 1: Text Input Generation
```bash
curl -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"This video covers 5 essential productivity tips for remote workers including time management strategies and focus techniques","type":"text"}' \
  -s | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "transcript": "This video covers 5 essential productivity tips...",
  "themes": ["productivity", "remote", "workers", "management", ...],
  "titles": [
    "Title 1 (45-65 chars)",
    "Title 2 (45-65 chars)",
    ...
    "Title 10 (45-65 chars)"
  ],
  "description": "String with max 500 characters",
  "usedProvider": "groq (free)"
}
```

**Validation Checklist:**
- [ ] HTTP Status: 200 OK
- [ ] `success: true` present
- [ ] `titles` array has exactly 10 items
- [ ] `description` exists and is ≤500 characters
- [ ] `themes` array contains extracted keywords
- [ ] No error messages

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2: YouTube URL (with fallback)
```bash
curl -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","type":"url"}' \
  -s | jq .
```

**Expected Response (if transcript unavailable):**
```json
{
  "error": "Failed to fetch transcript: Transcript is empty",
  "fallbackRequired": true
}
```

**Validation:**
- [ ] Error is graceful (not 500)
- [ ] `fallbackRequired: true` indicates user should try manual paste
- [ ] No server crash

**Status:** [ ] PASS / [ ] FAIL

---

### Test 3: Invalid Input Handling
```bash
curl -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"","type":"text"}' \
  -s | jq .
```

**Expected Response:**
```json
{
  "error": "Transcript is too short (minimum 100 characters)"
}
```

**Validation:**
- [ ] Returns 400 status
- [ ] Error message is clear
- [ ] No server crash

**Status:** [ ] PASS / [ ] FAIL

---

### Test 4: Missing Fields
```bash
curl -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"test"}' \
  -s | jq .
```

**Expected Response:**
```json
{
  "error": "Missing required fields: input and type"
}
```

**Validation:**
- [ ] Returns 400 status
- [ ] Clear validation error

**Status:** [ ] PASS / [ ] FAIL

---

## Frontend Integration Tests

### Test 5: Homepage Loads
```bash
curl -s http://72.61.0.118/ | grep -o "<title>TitleIQ"
```

**Expected:** `<title>TitleIQ`
**Status:** [ ] PASS / [ ] FAIL

---

### Test 6: Frontend Assets Load
```bash
curl -s -o /dev/null -w "%{http_code}" http://72.61.0.118/assets/index-BuQnt-JY.js
```

**Expected:** `200`
**Status:** [ ] PASS / [ ] FAIL

---

### Test 7: API Proxy Works
```bash
curl -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"Short test about AI tools","type":"text"}' \
  -s -w "\nHTTP: %{http_code}\n" | tail -1
```

**Expected:** `HTTP: 200`
**Status:** [ ] PASS / [ ] FAIL

---

## Browser Tests (Manual)

### Test 8: Builder Mode Flow
1. Open http://72.61.0.118 in browser
2. Click "Try Builder Mode (No Login)"
3. Paste this text:
   ```
   This comprehensive video tutorial walks through 10 proven strategies for increasing your YouTube channel's subscriber count, including SEO optimization, thumbnail design, and content consistency techniques that top creators use.
   ```
4. Click "Generate Titles"

**Expected:**
- [ ] Loading animation appears
- [ ] "Analyzing transcript..." message shows
- [ ] Themes appear (keywords like "youtube", "strategies", "optimization")
- [ ] 10 titles appear with stagger animation
- [ ] Each title is 45-65 characters
- [ ] Description appears (≤500 chars)
- [ ] Copy buttons work
- [ ] No console errors

**Status:** [ ] PASS / [ ] FAIL

---

### Test 9: Character Count Validation
Look at generated titles from Test 8:

**Validation:**
- [ ] All 10 titles are between 45-65 characters
- [ ] Titles are relevant to input content
- [ ] Titles use psychological triggers (curiosity, urgency, authority)
- [ ] Description is ≤500 characters

**Status:** [ ] PASS / [ ] FAIL

---

### Test 10: Copy Functionality
1. Click copy button on any title
2. Paste into text editor

**Expected:**
- [ ] Full title text is copied
- [ ] No extra characters
- [ ] UI shows "Copied!" feedback

**Status:** [ ] PASS / [ ] FAIL

---

## Performance Tests

### Test 11: Response Time
```bash
curl -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"Test video about productivity","type":"text"}' \
  -s -w "\nTime: %{time_total}s\n" -o /dev/null
```

**Expected:** 3-15 seconds (Groq API response time)
**Status:** [ ] PASS / [ ] FAIL / Time: ______ seconds

---

### Test 12: Concurrent Requests
```bash
for i in {1..3}; do
  curl -X POST http://72.61.0.118/api/generate \
    -H "Content-Type: application/json" \
    -d '{"input":"Test concurrent request '$i'","type":"text"}' \
    -s -w "\nRequest $i: %{http_code}\n" -o /dev/null &
done
wait
```

**Expected:** All return 200 (or 500 if rate limited by Groq)
**Status:** [ ] PASS / [ ] FAIL

---

## Infrastructure Tests

### Test 13: PM2 Process Health
```bash
ssh root@72.61.0.118 "pm2 jlist" | jq '.[] | select(.name=="titleiq-backend" or .name=="titleiq-frontend") | {name: .name, status: .pm2_env.status, uptime: .pm2_env.pm_uptime, restarts: .pm2_env.restart_time}'
```

**Expected:**
- Both processes: `status: "online"`
- Restarts: Low number (not crash-looping)

**Status:** [ ] PASS / [ ] FAIL

---

### Test 14: Error Log Check
```bash
ssh root@72.61.0.118 "pm2 logs titleiq-backend --lines 20 --nostream --err"
```

**Expected:** No recent critical errors (old Groq 400 errors are OK)
**Status:** [ ] PASS / [ ] FAIL

---

## Security Tests

### Test 15: CORS Headers
```bash
curl -s -I http://72.61.0.118/api/generate | grep -E "Access-Control|X-Frame|X-Content|X-XSS"
```

**Expected:**
```
Access-Control-Allow-Origin: https://titleiq.titleslice.com
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

**Status:** [ ] PASS / [ ] FAIL

---

### Test 16: No Exposed Secrets
```bash
curl -s http://72.61.0.118/api/generate | grep -i "groq\|api.*key\|secret"
```

**Expected:** No matches (secrets should never be in responses)
**Status:** [ ] PASS / [ ] FAIL

---

## Final Checklist

### Critical Tests (Must Pass All)
- [ ] Test 1: Text Input Generation (200 OK, 10 titles)
- [ ] Test 8: Browser Builder Mode (full flow works)
- [ ] Test 11: Response Time (<20 seconds)
- [ ] Test 13: PM2 Processes (both online)

### Important Tests (Should Pass Most)
- [ ] Test 2: YouTube URL Graceful Error
- [ ] Test 3: Invalid Input Handling
- [ ] Test 4: Missing Fields Validation
- [ ] Test 5: Homepage Loads
- [ ] Test 15: CORS Headers Present

### Nice-to-Have Tests
- [ ] Test 9: Character Count Validation
- [ ] Test 10: Copy Functionality
- [ ] Test 12: Concurrent Requests
- [ ] Test 14: Clean Error Logs

---

## Results Summary

**Total Tests:** 16
**Tests Passed:** ___ / 16
**Tests Failed:** ___ / 16
**Critical Failures:** ___ / 4

### Pass Criteria for ZEROFAIL Certification:
- ✅ All 4 Critical Tests: PASS
- ✅ At least 4/5 Important Tests: PASS
- ✅ No security issues (Test 16): PASS

---

## If All Tests Pass

**Congratulations!** Your fix worked. Submit for re-certification:

```
ZEROFAIL RE-CERTIFICATION REQUEST

Status: All critical tests passed
Evidence:
- Title generation: Working (Test 1 passed)
- Browser flow: Working (Test 8 passed)
- Performance: Acceptable (Test 11 passed)
- Infrastructure: Stable (Test 13 passed)

Ready for CERTIFIED status.
```

---

## If Tests Fail

### Common Issues:

**Issue:** Test 1 still returns 400/500
**Fix:** Check PM2 logs for errors: `pm2 logs titleiq-backend --err --lines 50`

**Issue:** Test 8 shows "Failed to generate titles"
**Fix:** Check browser console for API errors

**Issue:** Frontend can't reach backend
**Fix:** Verify nginx proxy: `nginx -t && systemctl status nginx`

**Issue:** PM2 process crashed
**Fix:** Restart: `pm2 restart titleiq-backend && pm2 logs titleiq-backend`

---

## Contact ZEROFAIL

If any critical tests fail after fix deployment:

1. Capture error output:
```bash
pm2 logs titleiq-backend --lines 50 > /tmp/pm2-errors.log
```

2. Test API directly:
```bash
curl -v -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"test","type":"text"}' 2>&1 > /tmp/api-test.log
```

3. Submit logs for analysis

---

**ZEROFAIL will re-certify once all critical tests pass.**
