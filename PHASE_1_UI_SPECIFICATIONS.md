# PHASE 1: UI/UX SPECIFICATIONS
**Mission:** TitleIQ Onboarding v2 + Admin Controls
**Agent:** Catalyst UI Enforcer + System Architect
**Date:** 2025-10-31

---

## 1. ONBOARDING MODAL DESIGN

### Modal Container
```css
Position: Fixed, fullscreen overlay
Z-index: 9999
Background: rgba(0, 0, 0, 0.85) backdrop-filter: blur(12px)
Padding: 24px (mobile), 48px (desktop)
Cursor: default (prevent accidental close)
```

### Content Card
```css
Width: 100% (mobile), max-width: 640px (desktop)
Height: Auto, max-height: 90vh
Background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)
Backdrop-filter: blur(20px)
Border: 1px solid rgba(255, 255, 255, 0.2)
Border-radius: 24px
Box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5)
Padding: 32px (mobile), 48px (desktop)
```

### Progress Ring Indicator
```
Type: SVG circular progress
Diameter: 48px
Stroke-width: 4px
Colors:
  - Track: rgba(255, 255, 255, 0.1)
  - Fill: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)
  - Text (center): White, 14px bold
Position: Top-right corner of card
Animation: Smooth transition 300ms ease-in-out on step change
```

**States:**
- Step 1/7: 14% fill
- Step 4/7: 57% fill
- Step 7/7: 100% fill → Triggers "poof" animation

### Step Counter
```
Format: "Step X of Y"
Font: 14px medium
Color: rgba(167, 139, 250, 1) (purple-300)
Position: Below progress ring
Alignment: Center
```

### Animation Parameters

**Modal Entry (First-Run):**
```javascript
initial: { opacity: 0, scale: 0.95, y: 20 }
animate: { opacity: 1, scale: 1, y: 0 }
transition: { duration: 400ms, ease: [0.16, 1, 0.3, 1] }
```

**Modal Entry (Re-Launch):**
```javascript
initial: { opacity: 0, scale: 0.9 }
animate: { opacity: 1, scale: 1 }
transition: { duration: 300ms, ease: "easeOut" }
```

**Step Transitions:**
```javascript
exit: { opacity: 0, x: -20 }
enter: { opacity: 0, x: 20 }
animate: { opacity: 1, x: 0 }
transition: { duration: 200ms, ease: "easeInOut" }
```

**Celebration "Poof" Animation (Step 7 Complete):**
```javascript
Sequence:
1. Progress ring scale: 1 → 1.2 (150ms)
2. Confetti burst: 12 particles from center
3. Ring opacity: 1 → 0 (200ms)
4. Checkmark fade-in: 0 → 1 (250ms)
5. Success text slide-up: y: 20 → 0 (300ms)

Confetti particles:
  - Count: 12
  - Colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
  - Start: center of ring
  - Velocity: random radial (150-250px)
  - Gravity: 800px/s²
  - Duration: 1200ms
  - Opacity: 1 → 0 over final 400ms
```

### Reduced-Motion Variant
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all spring animations */
  /* Instant step transitions (no slide) */
  /* No confetti particles */
  /* Simple fade for checkmark */
  transition: opacity 150ms linear;
}
```

---

## 2. PULSATING MENU INDICATOR

### Location
Navbar.jsx → "Onboarding" menu link (new)

### Visual Design
```css
Type: Dot indicator
Size: 8px diameter
Position: Top-right of "Onboarding" text (relative offset: +16px, -8px)
Background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)
Border-radius: 50%
Box-shadow: 0 0 8px rgba(139, 92, 246, 0.6)
```

### Animation
```css
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

animation: pulse 2s ease-in-out infinite;
```

### Trigger Logic
- Show indicator if: `onboarding_completed === true` BUT user skipped (didn't fully complete all fields)
- Hide indicator if: User has completed onboarding with all fields filled OR user has dismissed indicator (localStorage flag)
- Never show for admin users

### Dismissal
- Clicking "Onboarding" menu item dismisses pulse permanently (set `localStorage.setItem('hideOnboardingPulse', 'true')`)

---

## 3. ADMIN CONTROL MODALS

### Upgrade User Modal

**Trigger:** Click "Grant Pro" or "Upgrade" button in Admin Dashboard user table

**Layout:**
```
┌─────────────────────────────────────────┐
│  Upgrade User                      [X]  │
├─────────────────────────────────────────┤
│                                         │
│  User: user@example.com                 │
│  Current Plan: Trial                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Select New Plan ▼               │   │
│  └─────────────────────────────────┘   │
│    Options:                             │
│    - Creator ($9/month)                 │
│    - Creator Pro ($29/month)            │
│    - Pro Lifetime (Comp)                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Reason (optional)               │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]              [Upgrade User]   │
└─────────────────────────────────────────┘
```

**Styling:**
- Background: rgba(15, 23, 42, 0.95) backdrop-filter: blur(10px)
- Border: 1px solid rgba(139, 92, 246, 0.3)
- Border-radius: 16px
- Width: 480px max-width
- Padding: 24px
- Buttons: Cancel (ghost), Upgrade (gradient purple→pink)

**Validation:**
- Plan must be selected
- Show loading spinner on submit
- Disable buttons during submission

**Success State:**
- Modal closes
- Toast notification: "User upgraded to [plan]!"
- User table refreshes automatically

### Suspend Account Modal

**Trigger:** Click "Suspend" button in Admin Dashboard user table

**Layout:**
```
┌─────────────────────────────────────────┐
│  ⚠️ Suspend Account                [X] │
├─────────────────────────────────────────┤
│                                         │
│  User: user@example.com                 │
│  Current Status: Active                 │
│                                         │
│  This will immediately revoke access    │
│  to the platform. User can be restored  │
│  later.                                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Reason ▼                        │   │
│  └─────────────────────────────────┘   │
│    Options:                             │
│    - Policy Violation                   │
│    - Payment Issue                      │
│    - User Request                       │
│    - Spam/Abuse                         │
│    - Other                              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Additional notes (optional)     │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]        [Suspend Account]     │
└─────────────────────────────────────────┘
```

**Styling:**
- Background: rgba(15, 23, 42, 0.95) backdrop-filter: blur(10px)
- Border: 1px solid rgba(239, 68, 68, 0.3) (red warning)
- Border-radius: 16px
- Width: 480px max-width
- Padding: 24px
- Buttons: Cancel (ghost), Suspend (red, solid)

**Validation:**
- Reason must be selected
- Confirmation checkbox: "I understand this user will lose access immediately"

**Success State:**
- Modal closes
- Toast notification: "Account suspended"
- User row shows red "SUSPENDED" badge
- "Suspend" button becomes "Restore Account" button

### Restore Account Modal

**Trigger:** Click "Restore Account" button for suspended user

**Layout:**
```
┌─────────────────────────────────────────┐
│  Restore Account                   [X]  │
├─────────────────────────────────────────┤
│                                         │
│  User: user@example.com                 │
│  Current Status: Suspended              │
│  Reason: Policy Violation               │
│                                         │
│  Restore full access to this user?      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Restoration notes (optional)    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]        [Restore Access]      │
└─────────────────────────────────────────┘
```

**Styling:**
- Background: rgba(15, 23, 42, 0.95)
- Border: 1px solid rgba(34, 197, 94, 0.3) (green)
- Border-radius: 16px
- Buttons: Cancel (ghost), Restore (green, solid)

---

## 4. TOAST NOTIFICATIONS

### Design System
```css
Position: Fixed, bottom-right corner
Offset: 24px from bottom, 24px from right
Width: 360px max-width
Padding: 16px
Border-radius: 12px
Box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3)
Backdrop-filter: blur(10px)
```

### Variants

**Success:**
```css
Background: rgba(16, 185, 129, 0.15)
Border-left: 4px solid #10b981
Icon: ✓ (checkmark, green)
Text-color: #10b981
```

**Error:**
```css
Background: rgba(239, 68, 68, 0.15)
Border-left: 4px solid #ef4444
Icon: ✗ (X, red)
Text-color: #ef4444
```

**Warning:**
```css
Background: rgba(245, 158, 11, 0.15)
Border-left: 4px solid #f59e0b
Icon: ⚠ (warning, orange)
Text-color: #f59e0b
```

**Info:**
```css
Background: rgba(59, 130, 246, 0.15)
Border-left: 4px solid #3b82f6
Icon: ℹ (info, blue)
Text-color: #3b82f6
```

### Animation
```javascript
Entry: slideInRight + fadeIn (300ms ease-out)
Exit: slideOutRight + fadeOut (200ms ease-in)
Auto-dismiss: 5 seconds (pause on hover)
```

---

## 5. ONBOARDING STEP SCREENS (ENHANCED)

### Step 1: Welcome + Content Type
- Same as current (Educational, Entertainment, Gaming, etc.)

### Step 2: Niche
- Same as current (text input)

### Step 3: Channel Size
- Same as current (0-1K, 1K-10K, etc.)

### Step 4: Primary Goal
- Same as current (Growth, Monetization, etc.)

### Step 5: Upload Schedule
- Same as current (Daily, 2-3x/week, etc.)

### Step 6: Social Links (ENHANCED)
- Same as current BUT add:
  - Website URL (text input)
  - Lead Magnet URL (optional, text input with label "Booking/Offer Link")

### Step 7: **NEW - Brand & Channel Info**
```
Title: "Tell us about your brand"

Fields:
1. Brand Name (optional)
   - Text input
   - Placeholder: "e.g., TightSlice, Your Brand Name"
   - Hint: "Used in titles and descriptions"

2. Channel/Podcast Name (optional)
   - Text input
   - Placeholder: "e.g., The Daily Show, Your Channel Name"
   - Hint: "Different from brand? Add it here"

3. Website (optional)
   - Text input
   - Placeholder: "https://yourwebsite.com"
   - Validation: Must be valid URL or empty
```

### Step 8: **NEW - Title Preferences**
```
Title: "How should we format your titles?"

Preview card (live preview):
┌─────────────────────────────────────────┐
│  Preview:                               │
│  ────────────────────────────────────── │
│  "How to Train Your Dog | TightSlice |  │
│   Dog Training Pro | Ep. 42"            │
│                                         │
│  Character count: 63 / 100 ✓            │
└─────────────────────────────────────────┘

Toggles (checkboxes with live preview update):
☑ Include brand in title
☑ Include channel/podcast in title
☑ Include episode number in title

Note: "We'll automatically keep titles under 100 characters"
```

### Step 9: Hashtags (RENAMED)
- Same as current but rename to "Your Favorite Hashtags"
- Add hint: "We'll use these in descriptions (max 10 per video)"

### Step 10: Keywords
- Same as current

### Step 11: Audience Demographics
- Same as current

### Step 12: Brand Voice
- Same as current

### Step 13: Competitors
- Same as current (formerly step 11)

### Step 14: Biggest Challenge
- Same as current (formerly step 12)

**Total Steps: 14** (was 12, added 2 new steps)

---

## 6. HOMEPAGE CTA VARIANTS

### Logged Out State
```html
<Link to="/register" className="btn-primary">
  Start Free Trial →
</Link>
```

### Logged In State
```html
<Link to="/dashboard" className="btn-primary">
  Go to App →
</Link>
```

### Loading State
```html
<button className="btn-primary" disabled>
  <Spinner /> Loading...
</button>
```

---

## 7. ACCESSIBILITY REQUIREMENTS

### Keyboard Navigation
- ✅ Tab order: Progress indicator → Step inputs → Back button → Next button → Skip button
- ✅ Enter key: Submit current step (same as Next button)
- ✅ Escape key: Close modal (only on re-launch, NOT on first-run gate)
- ✅ Focus trap: Modal captures focus, cannot Tab outside
- ✅ Focus restoration: Return focus to trigger element on close

### Screen Reader Announcements
```html
<!-- Progress Ring -->
<div role="progressbar"
     aria-valuenow="5"
     aria-valuemin="1"
     aria-valuemax="14"
     aria-label="Onboarding step 5 of 14">

<!-- Modal -->
<div role="dialog"
     aria-modal="true"
     aria-labelledby="onboarding-title">
  <h2 id="onboarding-title">What type of content do you create?</h2>

<!-- Step transitions -->
<div aria-live="polite" aria-atomic="true">
  Step 5 of 14: Connect your social media
</div>

<!-- Success state -->
<div role="status" aria-live="polite">
  Onboarding complete! Redirecting to dashboard...
</div>
```

### Color Contrast
- ✅ All text: Minimum 4.5:1 contrast ratio (WCAG AA)
- ✅ Interactive elements: Minimum 3:1 contrast ratio
- ✅ Focus indicators: 2px solid outline, contrasting color

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* No confetti */
  .confetti-particle {
    display: none;
  }

  /* No pulse */
  .onboarding-pulse {
    animation: none;
  }
}
```

---

## 8. EVENT TAXONOMY (FOR TRACKING)

### Onboarding Events
```javascript
// First-run
'onboarding_started' // { source: 'first_login' }
'onboarding_step_completed' // { step: 5, duration_ms: 12000 }
'onboarding_skipped' // { step: 3 }
'onboarding_completed' // { duration_total_ms: 180000, steps_completed: 14 }

// Re-launch
'onboarding_relaunched' // { source: 'menu_click' }
'onboarding_pulse_dismissed' // {}
```

### Admin Events
```javascript
'admin_user_upgraded' // { admin_id, user_id, from_plan, to_plan }
'admin_account_suspended' // { admin_id, user_id, reason }
'admin_account_restored' // { admin_id, user_id }
'admin_grant_revoked' // { admin_id, user_id, grant_id }
```

### CTA Events
```javascript
'homepage_cta_clicked' // { auth_state: 'logged_out|logged_in', cta_text: 'Start Free Trial' }
```

### Title/Description Events
```javascript
'title_generated' // { character_count: 87, has_brand: true, has_channel: true, has_episode: false }
'description_generated' // { hashtag_count: 8, social_link_count: 4 }
'pin_comment_generated' // { character_count: 142, engagement_score: 87 }
```

---

## PHASE 1 DELIVERABLES ✅

1. ✅ UI specifications for onboarding modal (screens, animations, progress ring)
2. ✅ Pulsating menu indicator design
3. ✅ Celebration "poof" animation parameters
4. ✅ Reduced-motion variants
5. ✅ Admin modal designs (upgrade, suspend, restore)
6. ✅ Toast notification system
7. ✅ Event taxonomy for tracking
8. ✅ Accessibility requirements (WCAG AA)
9. ✅ Homepage CTA variants

**STATUS: PHASE 1 COMPLETE**

Ready to proceed to Phase 2: Build.
