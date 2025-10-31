# BUILD_ENGINE Implementation Checklist
## TitleIQ Admin Dashboard v2

**AUTHORITY:** CATALYST UI ENFORCER
**DATE:** 2025-10-28
**STATUS:** PRE-BUILD PHASE - READY FOR IMPLEMENTATION

---

## PHASE 1: SETUP & DEPENDENCIES

### 1.1 Install Required Packages

```bash
cd /Users/kvimedia/titleiq/frontend
npm install canvas-confetti recharts
```

**Dependencies:**
- `canvas-confetti`: Gamified confetti effects for positive deltas
- `recharts`: Sparkline charts for time-series visualization

**Already Installed:**
- `framer-motion`: ^11.0.0 (for micro-animations)
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `tailwindcss`: ^3.4.0

### 1.2 Create Folder Structure

```bash
mkdir -p /Users/kvimedia/titleiq/frontend/src/components/ui
mkdir -p /Users/kvimedia/titleiq/frontend/src/components/admin
mkdir -p /Users/kvimedia/titleiq/frontend/src/pages/admin
mkdir -p /Users/kvimedia/titleiq/frontend/src/hooks
mkdir -p /Users/kvimedia/titleiq/frontend/src/utils
```

**Folder Organization:**
- `/src/components/ui/`: Atomic components (KPICard, LiveBadge, Toast, etc.)
- `/src/components/admin/`: Composed admin components (FilterBar, LiveUsersTable)
- `/src/pages/admin/`: Admin dashboard page
- `/src/hooks/`: Custom hooks (useWebSocket, useToast, useLiveData)
- `/src/utils/`: Utility functions (formatters, validators)
- `/src/tokens/`: Design tokens (already created: `design-tokens.js`)
- `/src/types/`: TypeScript definitions (already created: `ui.types.ts`)

### 1.3 Verify Tailwind Config

**File:** `/Users/kvimedia/titleiq/frontend/tailwind.config.js`
**Status:** UPDATED with design system tokens
**Action:** None required - config is ready

---

## PHASE 2: COMPONENT IMPLEMENTATION

### Priority Order (Build in This Sequence)

Components are listed in dependency order. Build each component fully (all variants, states, accessibility) before moving to the next.

#### 2.1 LiveBadge (No Dependencies)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/ui/LiveBadge.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `LiveBadgeProps` from `/src/types/ui.types.ts`
- [ ] Implement 3 states: active (pulsing), paused (dimmed), disconnected (red)
- [ ] Add pulsing animation for active state (2s loop)
- [ ] Add ARIA live region: `aria-live="polite"` with status announcement
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify color contrast for all states (WCAG AA)
- [ ] Test on 390px, 768px, 1440px viewports

**Example Usage:**
```jsx
<LiveBadge status="active" label="LIVE" showLabel={true} />
<LiveBadge status="paused" lastUpdate={new Date()} />
<LiveBadge status="disconnected" />
```

**Accessibility Checklist:**
- [ ] Screen reader announces "Connection status: active"
- [ ] Color not sole indicator (text label required)
- [ ] High contrast mode support (border fallback)

---

#### 2.2 DopamineEffects (No Dependencies)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/ui/DopamineEffects.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `DopamineEffectsProps` from `/src/types/ui.types.ts`
- [ ] Import `confetti` from `canvas-confetti`
- [ ] Implement 4 effect types:
  - [ ] Confetti: 800ms burst with 20-30 particles
  - [ ] Shimmer: 3s linear gradient sweep
  - [ ] Pulse: 2s scale + opacity loop
  - [ ] Sparkle: 1s gold star fade-out
- [ ] Check `prefers-reduced-motion` media query
- [ ] Respect `enabled` prop (feature flag)
- [ ] Mark effects as `aria-hidden="true"` (decorative only)
- [ ] Test performance (60fps target)

**Example Usage:**
```jsx
<DopamineEffects trigger="confetti" enabled={true} intensity="high" />
<DopamineEffects trigger="shimmer" enabled={gamificationEnabled} />
```

**Accessibility Checklist:**
- [ ] All effects disabled when `prefers-reduced-motion: reduce`
- [ ] No keyboard focus interference
- [ ] Purely decorative (no screen reader announcements)

---

#### 2.3 KPICard (Depends: LiveBadge, DopamineEffects)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/ui/KPICard.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `KPICardProps` from `/src/types/ui.types.ts`
- [ ] Import `LiveBadge` and `DopamineEffects`
- [ ] Implement 5 states: default, loading, error, empty, live
- [ ] Implement 3 variants: static, live (with badge), delta (with comparison)
- [ ] Add delta badge with trend arrows (up/down/neutral)
- [ ] Trigger confetti on delta > 10% increase
- [ ] Add shimmer effect on hover (if interactive)
- [ ] Add ARIA live region for value updates: `aria-live="polite"`
- [ ] Make keyboard navigable if `onClick` provided
- [ ] Add visible focus indicator (2px cyan ring)
- [ ] Test all states on all viewports

**Example Usage:**
```jsx
<KPICard title="Total Users" value="1,234" />
<KPICard title="Active Now" value={42} isLive={true} />
<KPICard title="Generations (24h)" value={567} delta={12.5} trend="up" />
<KPICard title="Error Rate" value="Loading..." loading={true} />
```

**Accessibility Checklist:**
- [ ] Card has `role="article"` or uses `<article>` element
- [ ] Value changes announced: "Total users: 1,234"
- [ ] Delta announced: "+12.5% increase"
- [ ] Focus indicator visible on keyboard navigation
- [ ] Color contrast PASS: title (#A0AEC0) on bg_surface (#1A1F3A) = 6.2:1

**Responsive Behavior:**
- [ ] Mobile (390px): p-4, text-3xl value, full width
- [ ] Tablet (768px): p-6, text-4xl value, 2-column grid
- [ ] Desktop (1440px): p-6, text-4xl value, 4-column grid

---

#### 2.4 SparklineCard (No Dependencies)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/ui/SparklineCard.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `SparklineCardProps` from `/src/types/ui.types.ts`
- [ ] Import `AreaChart`, `Area` from `recharts`
- [ ] Render mini time-series chart (48px height default)
- [ ] Implement filled gradient variant
- [ ] Add data points variant (circles on line)
- [ ] Add ARIA label: `role="img" aria-label="Sparkline chart showing [label]..."`
- [ ] Provide `<details>` fallback with raw data table for screen readers
- [ ] Handle loading state (skeleton)
- [ ] Handle error state (error message)
- [ ] Handle empty state (placeholder)
- [ ] Test with various data lengths (24, 168, 720 points)

**Example Usage:**
```jsx
<SparklineCard data={hourlyData} label="Requests (24h)" timeframe="24h" />
<SparklineCard data={dailyData} label="Users (30d)" timeframe="30d" fillGradient={true} />
```

**Accessibility Checklist:**
- [ ] Alternative text describes trend (up/down/stable)
- [ ] Data table fallback available for screen readers
- [ ] Not interactive (no keyboard navigation required)

**Responsive Behavior:**
- [ ] All viewports: Full width of parent, fixed 48px height

---

#### 2.5 SystemStatus (No Dependencies)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/ui/SystemStatus.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `SystemStatusProps` from `/src/types/ui.types.ts`
- [ ] Render service health badges (green/amber/red dots)
- [ ] Show optional response time (e.g., "42ms")
- [ ] Show last check timestamp
- [ ] Add refresh button if `onRefresh` provided
- [ ] Wrap in `aria-live="polite"` if auto-refreshing
- [ ] Add ARIA labels: `aria-label="API status: healthy, response time 42 milliseconds"`
- [ ] Include text labels (not just color dots)
- [ ] Test all 3 states: healthy, degraded, down

**Example Usage:**
```jsx
<SystemStatus
  services={[
    { name: 'API', status: 'healthy', responseTime: 42, lastCheck: new Date() },
    { name: 'Database', status: 'healthy', responseTime: 15, lastCheck: new Date() },
  ]}
  onRefresh={() => refetchHealth()}
/>
```

**Accessibility Checklist:**
- [ ] Each service has clear text label (not just dot color)
- [ ] Status announced on change
- [ ] Refresh button has `aria-label="Refresh system status"`

**Responsive Behavior:**
- [ ] Mobile: Vertical stack, full width
- [ ] Desktop: Horizontal inline layout

---

#### 2.6 Toast (No Dependencies)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/ui/Toast.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `ToastProps` from `/src/types/ui.types.ts`
- [ ] Import `motion` from `framer-motion`
- [ ] Implement 4 variants: success, error, info, warning
- [ ] Add variant-specific icons and colors
- [ ] Add left border (4px) with variant color
- [ ] Implement slide-in animation (300ms from right)
- [ ] Auto-dismiss after `duration` (default: 5000ms)
- [ ] Pause auto-dismiss on hover
- [ ] Add close button
- [ ] Add optional action button
- [ ] Use `role="status"` for success/info, `role="alert"` for error/warning
- [ ] Use `aria-live="polite"` for success/info, `aria-live="assertive"` for error/warning
- [ ] Test stacking (max 3 visible toasts)

**Example Usage:**
```jsx
<Toast variant="success" message="Pro Lifetime granted successfully!" />
<Toast variant="error" message="Failed to revoke access" title="Error" />
<Toast variant="info" message="Data refreshed" action={{ label: 'Undo', onClick: handleUndo }} />
```

**Accessibility Checklist:**
- [ ] Screen reader announces message immediately
- [ ] Correct ARIA role for variant
- [ ] Close button has `aria-label="Close notification"`
- [ ] No focus stealing (non-intrusive)

**Responsive Behavior:**
- [ ] Mobile: Full width at top of screen
- [ ] Desktop: Fixed bottom-right, min-width 320px, max-width 448px

---

#### 2.7 FilterBar (No Dependencies)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/admin/FilterBar.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `FilterBarProps` from `/src/types/ui.types.ts`
- [ ] Implement 3 filter types:
  - [ ] Select (single choice radio buttons)
  - [ ] Multiselect (checkboxes, shows "N selected")
  - [ ] Date range (date picker with presets)
- [ ] Add dropdown menu for each filter
- [ ] Add "Clear all" button
- [ ] Show active filter count badge
- [ ] Add keyboard navigation (Tab, Enter, Arrow keys, Escape)
- [ ] Use `aria-haspopup="true"` and `aria-expanded` on filter buttons
- [ ] Use `role="menu"` and `role="menuitem"` for dropdown
- [ ] Test with screen reader

**Example Usage:**
```jsx
<FilterBar
  filters={[
    { key: 'model', label: 'Model', type: 'multiselect', options: [...], value: [] },
    { key: 'grantStatus', label: 'Grant Status', type: 'select', options: [...], value: 'all' },
  ]}
  onChange={(key, value) => setFilters({ ...filters, [key]: value })}
  onClearAll={() => setFilters({})}
  activeCount={2}
/>
```

**Accessibility Checklist:**
- [ ] Filter buttons announce "Filter by model, 3 options selected"
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys, Escape)
- [ ] Screen reader announces filter changes

**Responsive Behavior:**
- [ ] Mobile: Vertical stack, full-width dropdowns
- [ ] Desktop: Horizontal layout, inline dropdowns

---

#### 2.8 EntitlementModal (No Dependencies for UI, Depends: Toast for Notifications)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/admin/EntitlementModal.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `EntitlementModalProps` from `/src/types/ui.types.ts`
- [ ] Import `motion` from `framer-motion`
- [ ] Implement 2 variants: grant (green confirm), revoke (red confirm)
- [ ] Add backdrop overlay
- [ ] Implement focus trap (lock focus inside modal)
- [ ] Set initial focus to textarea or confirm button
- [ ] Close on Escape key
- [ ] Close on backdrop click (optional)
- [ ] Add close button (X icon)
- [ ] Add notes textarea (optional for grant, required for revoke)
- [ ] Add confirm and cancel buttons
- [ ] Show loading state on confirm button
- [ ] Show error message if API fails
- [ ] Auto-close on success after 300ms
- [ ] Use `role="dialog" aria-modal="true" aria-labelledby="modal-title"`

**Example Usage:**
```jsx
<EntitlementModal
  isOpen={showGrantModal}
  onClose={() => setShowGrantModal(false)}
  action="grant"
  user={{ id: '123', email: 'user@example.com' }}
  onConfirm={handleGrantProLifetime}
  loading={isGranting}
  error={grantError}
/>
```

**Accessibility Checklist:**
- [ ] Focus locked inside modal while open
- [ ] Initial focus set to first input or confirm button
- [ ] Escape key closes modal
- [ ] Close button has `aria-label="Close dialog"`
- [ ] Modal title announced when opened

**Responsive Behavior:**
- [ ] Mobile: Full-screen modal (covers viewport)
- [ ] Desktop: Centered modal, max-width 500px, backdrop overlay

---

#### 2.9 LiveUsersTable (Depends: FilterBar, EntitlementModal)

**File:** `/Users/kvimedia/titleiq/frontend/src/components/admin/LiveUsersTable.jsx`

**Requirements:**
- [ ] Create component file
- [ ] Import `LiveUsersTableProps` from `/src/types/ui.types.ts`
- [ ] Import `FilterBar` and `EntitlementModal`
- [ ] Render semantic table (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- [ ] Add sortable column headers (click to sort)
- [ ] Show model usage as chips/badges
- [ ] Add inline action buttons (Grant/Revoke)
- [ ] Add row hover highlight
- [ ] Add pagination if provided
- [ ] Add loading state (skeleton rows)
- [ ] Add error state (error message + retry button)
- [ ] Add empty state ("No users found")
- [ ] Add keyboard navigation (Tab through interactive elements)
- [ ] Use `<th scope="col">` for column headers
- [ ] Use `aria-label` on sort buttons
- [ ] Announce sort changes to screen readers
- [ ] Convert to card layout on mobile

**Example Usage:**
```jsx
<LiveUsersTable
  users={users}
  onGrantProLifetime={handleGrant}
  onRevokeProLifetime={handleRevoke}
  loading={isLoading}
  pagination={{ page: 1, pageSize: 20, total: 100, onPageChange: setPage }}
  sortable={true}
  filters={filters}
  onFilterChange={setFilters}
/>
```

**Accessibility Checklist:**
- [ ] Semantic table structure
- [ ] Column headers have `scope="col"`
- [ ] Sort buttons have clear labels: "Sort by email, currently unsorted"
- [ ] Action buttons have clear labels: "Grant Pro Lifetime to user@example.com"
- [ ] Keyboard navigation works (Tab through interactive elements)
- [ ] Screen reader announces sort changes

**Responsive Behavior:**
- [ ] Mobile (<768px): Convert to card-based layout (no table)
- [ ] Tablet (768px-1024px): Horizontal scroll on table
- [ ] Desktop (>1024px): Full table layout, no scroll

---

## PHASE 3: PAGE INTEGRATION

### 3.1 Admin Dashboard Page

**File:** `/Users/kvimedia/titleiq/frontend/src/pages/admin/Dashboard.jsx`

**Requirements:**
- [ ] Create page file
- [ ] Import all UI components
- [ ] Implement layout structure from UI_FOUNDATION.md Section 3
- [ ] Create page shell with header, main content, and sections
- [ ] Implement 4-card KPI rail
- [ ] Implement 3-card performance strip
- [ ] Implement system status section
- [ ] Implement users table section
- [ ] Implement LLM usage breakdown section
- [ ] Add live data updates (WebSocket or polling)
- [ ] Add toast notifications for actions
- [ ] Add loading states for initial data fetch
- [ ] Add error states with retry buttons
- [ ] Test full page on all viewports

**Layout Structure:**
```jsx
<div className="min-h-screen bg-bg-default">
  <header className="bg-gradient-to-r from-primary via-secondary to-primary border-b border-border-subtle px-6 py-4">
    {/* Header with "ADMIN v2" title and LiveBadge */}
  </header>

  <main className="container mx-auto px-6 py-8 max-w-7xl">
    {/* KPI Rail (4 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard title="Total Users" value={totalUsers} />
      <KPICard title="Active Now" value={activeNow} isLive={true} />
      <KPICard title="Total Generations" value={totalGenerations} />
      <KPICard title="Generations (24h)" value={gen24h} delta={12.5} trend="up" />
    </div>

    {/* Performance Strip (3 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KPICard title="Requests (24h)" value={requests24h} />
      <KPICard title="Avg Response (ms)" value={avgResponse} />
      <KPICard title="Error Rate (%)" value={errorRate} />
    </div>

    {/* System Status */}
    <div className="bg-bg-surface rounded-lg shadow-card p-4 mb-8">
      <SystemStatus services={healthServices} onRefresh={refetchHealth} />
    </div>

    {/* Users Table */}
    <div className="bg-bg-surface rounded-lg shadow-card p-6 mb-8">
      <h2 className="text-2xl font-semibold font-heading mb-4">Live Users</h2>
      <LiveUsersTable {...} />
    </div>

    {/* LLM Usage Breakdown */}
    <div className="bg-bg-surface rounded-lg shadow-card p-6">
      <h2 className="text-2xl font-semibold font-heading mb-4">LLM Usage Breakdown</h2>
      {/* Usage charts */}
    </div>
  </main>
</div>
```

**Accessibility Checklist:**
- [ ] Full keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Skip link provided: "Skip to main content"
- [ ] All sections have proper heading hierarchy (h1, h2, h3)
- [ ] Screen reader announces page title on load
- [ ] Focus management works (modal open/close, toast dismiss)

**Responsive Behavior:**
- [ ] Mobile (390px): All sections full width, vertical stack
- [ ] Tablet (768px): 2-column KPI rail, rest vertical
- [ ] Desktop (1440px): 4-column KPI rail, 3-column performance strip

---

## PHASE 4: CUSTOM HOOKS

### 4.1 useWebSocket Hook (Real-Time Data)

**File:** `/Users/kvimedia/titleiq/frontend/src/hooks/useWebSocket.js`

**Requirements:**
- [ ] Create custom hook for WebSocket connection
- [ ] Handle connection states: connecting, connected, disconnected
- [ ] Auto-reconnect on disconnect (exponential backoff)
- [ ] Emit live data updates to components
- [ ] Handle heartbeat/ping-pong for keep-alive
- [ ] Clean up connection on unmount

**Example Usage:**
```jsx
const { data, status, reconnect } = useWebSocket('ws://localhost:3000/admin');
```

---

### 4.2 useToast Hook (Toast Notifications)

**File:** `/Users/kvimedia/titleiq/frontend/src/hooks/useToast.js`

**Requirements:**
- [ ] Create custom hook for managing toast queue
- [ ] Provide `showToast(variant, message, options)` function
- [ ] Manage toast stack (max 3 visible)
- [ ] Auto-dismiss after duration
- [ ] Handle manual dismiss
- [ ] Return toast component for rendering

**Example Usage:**
```jsx
const { showToast, ToastContainer } = useToast();

showToast('success', 'Pro Lifetime granted!');
showToast('error', 'Failed to revoke access', { duration: 10000 });

// In JSX:
<ToastContainer />
```

---

### 4.3 useLiveData Hook (Live Updates)

**File:** `/Users/kvimedia/titleiq/frontend/src/hooks/useLiveData.js`

**Requirements:**
- [ ] Create custom hook for polling or WebSocket data
- [ ] Accept polling interval (default: 5000ms)
- [ ] Handle loading, error, success states
- [ ] Pause updates when tab inactive (Page Visibility API)
- [ ] Clean up on unmount

**Example Usage:**
```jsx
const { data, loading, error, refetch } = useLiveData('/api/admin/stats', 5000);
```

---

## PHASE 5: UTILITIES

### 5.1 Formatters

**File:** `/Users/kvimedia/titleiq/frontend/src/utils/formatters.js`

**Requirements:**
- [ ] `formatNumber(value)`: Format numbers with commas (1,234)
- [ ] `formatPercent(value)`: Format percentages (12.5%)
- [ ] `formatCurrency(value)`: Format currency ($12.34)
- [ ] `formatDate(date)`: Format dates (Oct 28, 2025)
- [ ] `formatRelativeTime(date)`: Format relative time (5m ago, 2h ago)
- [ ] `formatBytes(bytes)`: Format file sizes (1.2 MB)

---

### 5.2 Validators

**File:** `/Users/kvimedia/titleiq/frontend/src/utils/validators.js`

**Requirements:**
- [ ] `validateEmail(email)`: Email validation
- [ ] `validateNotes(notes, required)`: Notes validation for modal
- [ ] `validateDateRange(start, end)`: Date range validation

---

## PHASE 6: CATALYST REVIEW CHECKPOINTS

### 6.1 Per-Component Review

**For each component, verify:**
- [ ] TypeScript interface matches spec exactly
- [ ] All visual variants implemented
- [ ] All states implemented (loading, error, success, empty)
- [ ] Accessibility requirements met (ARIA, keyboard, contrast)
- [ ] Responsive behavior correct on 390px, 768px, 1440px
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] Focus indicators visible on keyboard navigation
- [ ] Color contrast verified with WebAIM tool

**Tool:** https://webaim.org/resources/contrastchecker/

**Test with:**
- Keyboard only (unplug mouse)
- Screen reader (VoiceOver on Mac, NVDA on Windows)
- Mobile viewport (390px)
- Reduced motion preference enabled

---

### 6.2 Full Page Review

**Before requesting CATALYST audit:**
- [ ] All components integrated into dashboard page
- [ ] Live data updates working (WebSocket or polling)
- [ ] Toast notifications working for all actions
- [ ] Full keyboard navigation works end-to-end
- [ ] Screen reader announces all critical information
- [ ] All viewports tested (390px, 768px, 1440px)
- [ ] Performance acceptable (60fps, no jank)
- [ ] Reduced motion respected (decorative animations disabled)

---

### 6.3 CATALYST Audit Request

**When ready, request CATALYST review:**

1. Submit:
   - Component implementation files
   - Dashboard page file
   - Viewport screenshots (390px, 768px, 1440px)
   - Accessibility test results (keyboard, screen reader)
   - Color contrast verification results

2. CATALYST will generate:
   - **ACCESSIBILITY_REPORT.md** with PASS/FAIL per component
   - **RESPONSIVE_AUDIT.md** with viewport-specific issues
   - **SHIP/HOLD decision**

3. Fix BLOCKER issues (if any)

4. Request re-audit

5. Receive SHIP approval

---

## PHASE 7: DEPLOYMENT PREPARATION

### 7.1 Environment Variables

**File:** `/Users/kvimedia/titleiq/frontend/.env`

**Add:**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_GAMIFICATION=on
```

**Production:**
```env
VITE_API_URL=https://api.titleiq.com
VITE_WS_URL=wss://api.titleiq.com
VITE_GAMIFICATION=on
```

---

### 7.2 Build Test

**Commands:**
```bash
cd /Users/kvimedia/titleiq/frontend
npm run build
npm run preview
```

**Verify:**
- [ ] Build succeeds without errors
- [ ] Preview server runs correctly
- [ ] All components render
- [ ] Live data updates work
- [ ] Toast notifications work
- [ ] No console errors

---

### 7.3 Performance Audit

**Tools:**
- Lighthouse (Chrome DevTools)
- React DevTools Profiler

**Targets:**
- [ ] Lighthouse Performance Score: ≥ 90
- [ ] Lighthouse Accessibility Score: ≥ 95
- [ ] First Contentful Paint: < 1.5s
- [ ] Cumulative Layout Shift: ≤ 0.1
- [ ] Time to Interactive: < 3s

---

## SHIP CRITERIA

**CATALYST will issue SHIP approval when:**

1. All components pass accessibility audit (WCAG AA)
2. All components work on mobile (390px), tablet (768px), desktop (1440px)
3. Full keyboard navigation works end-to-end
4. Screen reader announces all critical information correctly
5. Color contrast meets WCAG AA for all text and UI elements
6. Cumulative Layout Shift ≤ 0.1
7. No BLOCKER issues remain

**HOLD conditions (CATALYST blocks ship):**

1. Keyboard navigation broken
2. Contrast failures on actionable elements
3. CLS > 0.1 on first load
4. Mobile layout broken or unreadable
5. Critical flows look amateur/unsafe

---

## CONTACT & ESCALATION

**Primary Contact:** CATALYST UI ENFORCER (this agent)

**Escalation Path:**
- CATALYST → MAVEN (for sequencing issues)
- CATALYST → BOSS_PRIME (for quality vs. speed decisions)

**Override Authority:**
- Only BOSS_PRIME can override CATALYST HOLD decision
- All overrides must be documented with rationale

---

## SUCCESS METRICS

**Definition of Done:**

- [ ] All 9 components implemented
- [ ] Admin dashboard page integrated
- [ ] Live data updates working
- [ ] Toast notifications working
- [ ] Full accessibility compliance (WCAG AA)
- [ ] Full responsive support (390px, 768px, 1440px)
- [ ] CATALYST SHIP approval issued
- [ ] Build succeeds
- [ ] Preview tested
- [ ] Performance targets met

**Estimated Timeline:**

- Phase 1 (Setup): 1 hour
- Phase 2 (Components): 12-16 hours (1-2 hours per component)
- Phase 3 (Page Integration): 4-6 hours
- Phase 4 (Hooks): 2-3 hours
- Phase 5 (Utilities): 1-2 hours
- Phase 6 (CATALYST Review): 2-4 hours (includes fixes)
- Phase 7 (Deployment Prep): 1-2 hours

**Total: 23-34 hours** (3-4 full working days for a single developer)

---

END OF BUILD_ENGINE_CHECKLIST.md
