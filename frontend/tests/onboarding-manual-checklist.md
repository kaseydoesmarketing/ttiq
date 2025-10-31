# ZEROFAIL VALIDATION: Manual Test Checklist
## TitleIQ Onboarding Wizard - Production Environment
**URL:** https://titleiq.tightslice.com

---

## Category 1: Visual Quality & Premium Appearance

### Test 1.1: Full-Screen Takeover ✅ / ❌
**Instructions:**
1. Visit https://titleiq.tightslice.com/app
2. Create new trial account or clear localStorage: `localStorage.clear()` in console
3. Observe onboarding appearance

**Verify:**
- [ ] Onboarding covers entire viewport (100% width, 100% height)
- [ ] Background is grayed out (gray overlay visible)
- [ ] Main app content NOT visible behind onboarding
- [ ] Z-index hierarchy correct (onboarding on top)

**Expected Result:** Dark gray overlay (`bg-gray-900/95 backdrop-blur-sm`) behind white card

---

### Test 1.2: Color Contrast & Branding ✅ / ❌
**Verify:**
- [ ] Onboarding card is WHITE (`bg-white`) - NOT purple/pink
- [ ] Text is DARK (`text-gray-900`) and easily readable
- [ ] Strong visual separation from main app
- [ ] Purple/pink used ONLY for accents (buttons, progress bar)
- [ ] Professional and premium appearance

**Expected Result:** White card with dark text, purple gradient for selected buttons and progress

---

### Test 1.3: Content Layout & Spacing ✅ / ❌
**Verify:**
- [ ] No content cut off at top
- [ ] No content cut off at bottom
- [ ] Proper padding around edges (`p-8`)
- [ ] Content properly centered vertically
- [ ] Progress bar visible at top with step counter
- [ ] "Step X of 12" displayed

**Expected Result:** All content visible, scrollable if needed (`max-h-[calc(100vh-16rem)] overflow-y-auto`)

---

### Test 1.4: Responsive Design ✅ / ❌
**Instructions:** Use browser DevTools to test different viewport sizes

**Test viewports:**
- [ ] Desktop (1920x1080) - Content looks good
- [ ] Laptop (1366x768) - Content looks good
- [ ] Tablet (768x1024) - Content looks good
- [ ] Mobile (375x667) - Content looks good or adapts

**Expected Result:** Scrolling works, no horizontal overflow, content remains accessible

---

## Category 2: Functionality Testing

### Test 2.1: Onboarding Trigger Logic ✅ / ❌
**Instructions:**
1. Create new trial account
2. Log in as admin user
3. Complete onboarding, then refresh

**Verify:**
- [ ] Onboarding appears automatically after new user registration
- [ ] Onboarding does NOT appear for admin users
- [ ] Onboarding does NOT appear if already completed (after refresh)

---

### Test 2.2: Navigation & Progress ✅ / ❌
**Instructions:** Go through all 12 steps

**Verify:**
- [ ] "Next" button advances to next step
- [ ] "Back" button goes to previous step
- [ ] Progress bar updates correctly (purple gradient)
- [ ] Step counter updates (1 of 12 → 2 of 12, etc.)
- [ ] Smooth animations between steps (no flicker)

---

### Test 2.3: Data Input & Validation ✅ / ❌
**Test each input type:**
- [ ] Can select options (button clicks work)
- [ ] Can type in text fields (niche, demographics)
- [ ] Can add hashtags (press Enter to add)
- [ ] Can remove hashtags (click X)
- [ ] Can add keywords (press Enter)
- [ ] Can add competitors (press Enter)
- [ ] Form remembers data when clicking "Back"

---

### Test 2.4: Dismissal Functionality ✅ / ❌
**Verify:**
- [ ] Large X button visible in top-right corner
- [ ] X button is clickable
- [ ] X button dismisses onboarding
- [ ] "Skip for now" link also dismisses
- [ ] Onboarding closes smoothly (animation)
- [ ] Returns to main app correctly
- [ ] Can relaunch onboarding from settings (if applicable)

---

### Test 2.5: Completion & Persistence ✅ / ❌
**Instructions:**
1. Complete all 12 steps
2. Click "Complete" button
3. Refresh page
4. Check localStorage and database

**Verify:**
- [ ] Onboarding closes after completion
- [ ] Dashboard loads
- [ ] Refresh page → onboarding does NOT reappear
- [ ] `onboarding_completed` marked in database

**Database check:**
```bash
ssh -i ~/.ssh/tightslice_deploy root@72.61.0.118
cd /var/www/titleiq/backend
sqlite3 database/titleiq.db "SELECT email, onboarding_completed, onboarding_step FROM users WHERE email = 'your-test-email@example.com';"
```

---

## Category 3: Backend Integration

### Test 3.1: Data Persistence ✅ / ❌
**Instructions:** SSH into production server

```bash
ssh -i ~/.ssh/tightslice_deploy root@72.61.0.118
cd /var/www/titleiq/backend
sqlite3 database/titleiq.db
```

**SQL queries:**
```sql
-- Check schema
.schema users

-- Check onboarding data
SELECT id, email, onboarding_completed, onboarding_step, niche, keywords
FROM users
WHERE email LIKE '%test%'
LIMIT 5;

-- Check specific user
SELECT * FROM users WHERE email = 'your-email@example.com';
```

**Verify:**
- [ ] `onboarding_completed` column exists
- [ ] `onboarding_step` column exists
- [ ] Data columns exist: `niche`, `keywords`, `content_type`, etc.
- [ ] Data is saved correctly
- [ ] JSON fields parse correctly (social_links, hashtags, etc.)

---

## Category 4: Edge Cases & Error Handling

### Test 4.1: Network Failures ✅ / ❌
**Instructions:**
1. Open DevTools → Network tab
2. Throttle to "Slow 3G"
3. Navigate through onboarding

**Verify:**
- [ ] No white screens or crashes
- [ ] Loading states appear (if implemented)
- [ ] Can complete steps despite slow network
- [ ] Errors are handled gracefully

---

### Test 4.3: Session Expiration ✅ / ❌
**Instructions:**
1. Start onboarding
2. Delete JWT token: `localStorage.removeItem('titleiq_token')`
3. Try to complete onboarding

**Verify:**
- [ ] Redirects to login page
- [ ] No crashes or white screens
- [ ] Can resume after re-login (if progress saved)

---

## Category 5: Performance & Polish

### Test 5.1: Performance Metrics ✅ / ❌
**Check browser DevTools Console:**
- [ ] No console errors
- [ ] No console warnings (except expected ones)
- [ ] Network tab shows reasonable load times

**Frontend bundle:**
- [ ] Bundle size < 500KB (check in Network tab)
- [ ] Loads in < 2 seconds on normal connection

**Animation performance:**
- [ ] Smooth transitions (60fps)
- [ ] No jank or stuttering
- [ ] Progress bar animates smoothly

---

### Test 5.2: Accessibility ✅ / ❌
**Verify:**
- [ ] X button has `aria-label="Close onboarding"`
- [ ] Can navigate with Tab key
- [ ] Focus states visible
- [ ] Text contrast meets WCAG AA standards (use browser DevTools Accessibility panel)

**Keyboard navigation:**
1. Press Tab repeatedly
2. Verify can reach all interactive elements
3. Press Enter to select buttons
4. Press Escape to close (if implemented)

---

### Test 5.3: Browser Compatibility ✅ / ❌
**Test in multiple browsers:**
- [ ] Chrome/Chromium - Works correctly
- [ ] Safari - Works correctly
- [ ] Firefox - Works correctly
- [ ] Edge - Works correctly (if available)

**Check for:**
- [ ] Consistent appearance across browsers
- [ ] No browser-specific bugs
- [ ] Animations work in all browsers

---

## Final Verification Checklist

### Visual Quality ✅ / ❌
- [ ] Premium appearance confirmed
- [ ] White card with dark text
- [ ] Purple/pink accents only
- [ ] No UI glitches

### Functionality ✅ / ❌
- [ ] All 12 steps work
- [ ] Navigation works (Next/Back)
- [ ] Data input works
- [ ] Dismissal works
- [ ] Completion works

### Backend Integration ✅ / ❌
- [ ] API endpoints respond
- [ ] Data persists to database
- [ ] Authentication works
- [ ] Authorization enforced

### Performance ✅ / ❌
- [ ] No console errors
- [ ] Fast load times
- [ ] Smooth animations
- [ ] Responsive design

---

## Test Results Summary

**Date Tested:** _______________
**Tester:** _______________

**Overall Assessment:**
- [ ] PRODUCTION READY - All tests pass
- [ ] NEEDS MINOR FIXES - Small issues found
- [ ] NEEDS MAJOR FIXES - Critical issues found

**Critical Bugs Found:** _______________

**Notes:**
_______________________________________
_______________________________________
_______________________________________
