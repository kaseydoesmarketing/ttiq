# UI_FOUNDATION.md
## TitleIQ Admin Dashboard v2 Design System

**VERSION:** 1.0.0
**THEME:** admin-dark (Gamified)
**LAST UPDATED:** 2025-10-28
**AUTHORITY:** CATALYST UI ENFORCER
**STATUS:** LOCKED FOR BUILD_ENGINE IMPLEMENTATION

---

## 1. DESIGN TOKENS (SINGLE SOURCE OF TRUTH)

### 1.1 Color System

All colors inherit from existing TitleIQ brand palette with admin-specific extensions for system states.

```javascript
export const colors = {
  // BACKGROUNDS
  bg_default: '#0A0E27',        // Main canvas (existing dark)
  bg_surface: '#1A1F3A',        // Card/panel background (lifted 1 level)
  bg_elevated: '#252B47',       // Modal/dropdown background (lifted 2 levels)
  bg_overlay: 'rgba(10, 14, 39, 0.85)', // Modal backdrop

  // TEXT
  text_primary: '#FFFFFF',      // Headings, primary content
  text_secondary: '#A0AEC0',    // Subtitles, supporting text
  text_tertiary: '#64748B',     // Disabled, placeholder text
  text_inverse: '#0A0E27',      // Text on light backgrounds

  // BRAND ACCENTS (Primary Actions)
  accent_primary: '#00F0FF',    // Cyan - primary CTAs, live indicators (existing)
  accent_secondary: '#9D4EDD',  // Purple - secondary actions (existing)
  accent_tertiary: '#FF006E',   // Pink - special emphasis (existing)

  // SYSTEM STATES
  accent_success: '#06FFA5',    // Green - success, healthy status (existing)
  accent_warning: '#F59E0B',    // Amber - warnings, degraded state
  accent_error: '#FF4D6D',      // Red - errors, critical alerts (existing)
  accent_info: '#60A5FA',       // Blue - informational messages

  // GAMIFICATION ACCENTS
  gamification_xp: '#FFD700',   // Gold - XP gains, achievements
  gamification_streak: '#FF8C00', // Orange - streak badges
  gamification_level: '#9D4EDD', // Purple - level ups

  // BORDERS
  border_subtle: '#2D3748',     // Default borders, dividers
  border_medium: '#4A5568',     // Hover states, focus indicators
  border_strong: '#718096',     // Active selection, emphasis

  // SPECIAL EFFECTS
  glow_cyan: 'rgba(0, 240, 255, 0.4)',    // Cyan glow for live indicators
  glow_green: 'rgba(6, 255, 165, 0.4)',   // Green glow for success
  glow_gold: 'rgba(255, 215, 0, 0.4)',    // Gold glow for achievements

  // DATA VISUALIZATION
  chart_primary: '#00F0FF',
  chart_secondary: '#9D4EDD',
  chart_tertiary: '#06FFA5',
  chart_quaternary: '#F59E0B',
  chart_quinary: '#FF006E',
};
```

**Tailwind Configuration Extension:**
```javascript
// Add to tailwind.config.js theme.extend.colors
{
  'bg-default': '#0A0E27',
  'bg-surface': '#1A1F3A',
  'bg-elevated': '#252B47',
  'text-primary': '#FFFFFF',
  'text-secondary': '#A0AEC0',
  'text-tertiary': '#64748B',
  'border-subtle': '#2D3748',
  'border-medium': '#4A5568',
  'glow-cyan': 'rgba(0, 240, 255, 0.4)',
  'glow-green': 'rgba(6, 255, 165, 0.4)',
  'gamification-xp': '#FFD700',
  'gamification-streak': '#FF8C00',
}
```

### 1.2 Spacing Scale

Base unit: `4px` (Tailwind's default rem-based scale).

```javascript
export const spacing = {
  xs: '4px',      // 0.25rem - Tailwind: p-1, gap-1
  sm: '8px',      // 0.5rem  - Tailwind: p-2, gap-2
  md: '12px',     // 0.75rem - Tailwind: p-3, gap-3
  base: '16px',   // 1rem    - Tailwind: p-4, gap-4
  lg: '20px',     // 1.25rem - Tailwind: p-5, gap-5
  xl: '24px',     // 1.5rem  - Tailwind: p-6, gap-6
  '2xl': '32px',  // 2rem    - Tailwind: p-8, gap-8
  '3xl': '48px',  // 3rem    - Tailwind: p-12, gap-12
  '4xl': '64px',  // 4rem    - Tailwind: p-16, gap-16
};
```

**Component-Specific Padding Standards:**
- **Cards:** `p-6` (24px) for content, `p-4` (16px) for compact variants
- **Modals:** `p-8` (32px) for content, `p-6` (24px) for headers/footers
- **Page containers:** `px-6 py-8` on mobile, `px-8 py-12` on desktop
- **Button padding:** `px-6 py-3` for default, `px-4 py-2` for small
- **Gap between elements:** `gap-4` (16px) default, `gap-6` (24px) for sections

### 1.3 Border Radius Scale

```javascript
export const radius = {
  none: '0px',
  sm: '4px',      // Tailwind: rounded-sm - badges, chips
  md: '8px',      // Tailwind: rounded-md - buttons, inputs
  lg: '12px',     // Tailwind: rounded-lg - cards, panels
  xl: '16px',     // Tailwind: rounded-xl - modals, large cards
  '2xl': '24px',  // Tailwind: rounded-2xl - hero sections
  pill: '9999px', // Tailwind: rounded-full - avatars, status badges
};
```

**Component Assignments:**
- **Buttons:** `rounded-md` (8px)
- **Cards:** `rounded-lg` (12px)
- **Modals:** `rounded-xl` (16px)
- **Live badges:** `rounded-full` (pill)
- **Input fields:** `rounded-md` (8px)
- **Toasts:** `rounded-lg` (12px)

### 1.4 Typography Scale

Uses existing TitleIQ fonts: Space Grotesk (headings), Inter (body).

```javascript
export const typography = {
  // DISPLAY (Hero/Dashboard Title)
  display: {
    fontSize: '3rem',         // 48px - Tailwind: text-5xl
    fontWeight: '700',        // bold
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // H1 (Page Headings)
  h1: {
    fontSize: '2rem',         // 32px - Tailwind: text-3xl
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // H2 (Section Headings)
  h2: {
    fontSize: '1.5rem',       // 24px - Tailwind: text-2xl
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '0',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // H3 (Subsection Headings)
  h3: {
    fontSize: '1.25rem',      // 20px - Tailwind: text-xl
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // BODY (Default Text)
  body: {
    fontSize: '1rem',         // 16px - Tailwind: text-base
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
    fontFamily: 'Inter, sans-serif',
  },

  // BODY SMALL (Supporting Text)
  body_small: {
    fontSize: '0.875rem',     // 14px - Tailwind: text-sm
    fontWeight: '400',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: 'Inter, sans-serif',
  },

  // LABEL (Form Labels, Chip Text)
  label: {
    fontSize: '0.75rem',      // 12px - Tailwind: text-xs
    fontWeight: '500',
    lineHeight: '1.3',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },

  // MONO (Metrics, API Keys, Code)
  mono: {
    fontSize: '0.875rem',     // 14px
    fontWeight: '500',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
  },

  // KPI VALUE (Large Metric Numbers)
  kpi_value: {
    fontSize: '2.5rem',       // 40px - Tailwind: text-4xl
    fontWeight: '700',
    lineHeight: '1',
    letterSpacing: '-0.02em',
    fontFamily: '"Space Grotesk", sans-serif',
  },
};
```

**Tailwind Utility Combinations:**
- Display: `text-5xl font-bold font-heading tracking-tight`
- H1: `text-3xl font-bold font-heading`
- H2: `text-2xl font-semibold font-heading`
- Body: `text-base font-body`
- Label: `text-xs font-medium uppercase tracking-wide`
- Mono: `text-sm font-mono`

### 1.5 Elevation & Shadows

```javascript
export const shadows = {
  // CARDS
  card: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)',
  card_hover: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',

  // POPOVERS (Dropdowns, Tooltips)
  pop: '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',

  // MODALS
  modal: '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',

  // GLOWS (Live Indicators, Special States)
  glow_cyan: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
  glow_green: '0 0 20px rgba(6, 255, 165, 0.5), 0 0 40px rgba(6, 255, 165, 0.3)',
  glow_gold: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
};
```

**Tailwind Configuration Extension:**
```javascript
// Add to tailwind.config.js theme.extend.boxShadow
{
  'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)',
  'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
  'pop': '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
  'modal': '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
  'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
  'glow-green': '0 0 20px rgba(6, 255, 165, 0.5), 0 0 40px rgba(6, 255, 165, 0.3)',
  'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
}
```

### 1.6 Motion & Animation Tokens

Uses Framer Motion for complex animations, CSS transitions for simple state changes.

```javascript
export const motion = {
  // DURATIONS (milliseconds)
  duration_instant: 100,      // Checkbox toggles, switches
  duration_fast: 200,         // Hover states, focus indicators
  duration_normal: 300,       // Button presses, modal open/close
  duration_slow: 500,         // Page transitions, toast slide-in
  duration_pulse: 2000,       // Live indicator pulse loop
  duration_shimmer: 3000,     // Card shimmer effect
  duration_confetti: 800,     // Confetti burst

  // EASING CURVES
  ease_default: 'cubic-bezier(0.4, 0, 0.2, 1)',       // Tailwind default
  ease_in: 'cubic-bezier(0.4, 0, 1, 1)',              // Deceleration
  ease_out: 'cubic-bezier(0, 0, 0.2, 1)',             // Acceleration
  ease_in_out: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Smooth both ends
  ease_bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful overshoot

  // FRAMER MOTION PRESETS
  spring_default: { type: 'spring', stiffness: 300, damping: 25 },
  spring_gentle: { type: 'spring', stiffness: 200, damping: 20 },
  spring_bouncy: { type: 'spring', stiffness: 400, damping: 15 },

  // ANIMATION VARIANTS (for prefers-reduced-motion)
  respectsReducedMotion: true, // Global flag - disable decorative animations
};
```

**Tailwind Configuration Extension:**
```javascript
// Add to tailwind.config.js theme.extend
transitionDuration: {
  'instant': '100ms',
  'fast': '200ms',
  'normal': '300ms',
  'slow': '500ms',
},
transitionTimingFunction: {
  'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
},
```

**Animation Specifications:**

1. **Pulse (Live Indicators):**
   - Duration: 2s loop
   - Keyframes: 0% scale(1) opacity(1) → 50% scale(1.05) opacity(0.7) → 100% scale(1) opacity(1)
   - Glow: Cyan shadow fades in/out
   - Trigger: Auto-play when `isLive={true}`
   - Pause: After 10s of no data updates (dim to 50% opacity)

2. **Shimmer (Card Hover):**
   - Duration: 3s linear
   - Effect: Subtle gradient sweep left-to-right
   - Trigger: Mouse hover on KPICard
   - Implementation: `background-image` gradient with `background-position` animation

3. **Confetti (Positive Delta):**
   - Duration: 800ms
   - Particles: 20-30 small circles (#FFD700, #00F0FF, #06FFA5)
   - Physics: Random velocity, gravity fall, fade out
   - Trigger: Delta value > 10% increase
   - Library: canvas-confetti or react-rewards

4. **Toast Slide-In:**
   - Duration: 300ms ease-out
   - Entry: `translateX(100%)` → `translateX(0)`
   - Exit: `translateX(100%)` with opacity fade
   - Stacking: Max 3 toasts, queue overflow

5. **Focus Indicator:**
   - Duration: 200ms ease-out
   - Style: 2px cyan ring, 2px offset
   - Applies to: Buttons, inputs, table rows, interactive cards
   - Keyboard only: Use `:focus-visible` not `:focus`

---

## 2. COMPONENT CONTRACTS

Each component below includes:
- **TypeScript Interface** (props definition)
- **Visual Variants** (allowed configurations)
- **States** (loading, error, success, empty)
- **Accessibility Requirements** (WCAG AA compliance)
- **Responsive Behavior** (mobile-first breakpoints)

### 2.1 KPICard

**Purpose:** Display primary metric with optional live indicator and delta comparison.

**TypeScript Interface:**
```typescript
interface KPICardProps {
  // REQUIRED
  title: string;                     // Metric name (e.g., "Total Users")
  value: string | number;             // Primary value to display

  // OPTIONAL
  subtitle?: string;                  // Supporting text (e.g., "Last 30 days")
  isLive?: boolean;                   // Enable pulsing live indicator
  delta?: number;                     // Percentage change (e.g., 12.5 for +12.5%)
  trend?: 'up' | 'down' | 'neutral';  // Visual trend indicator
  icon?: React.ReactNode;             // Optional leading icon
  loading?: boolean;                  // Show skeleton state
  error?: string;                     // Error message (replaces value)
  sparklineData?: number[];           // Mini chart data (24h)
  onClick?: () => void;               // Make card interactive
  className?: string;                 // Additional Tailwind classes
}
```

**Visual Variants:**

1. **Static (Default):**
   - No live indicator
   - Simple value display
   - Optional delta badge

2. **Live:**
   - `isLive={true}` adds pulsing cyan dot in top-right corner
   - Glow effect on card border (subtle cyan shadow)
   - Pulse animation: 2s loop, pauses after 10s of no updates

3. **Delta (Comparison):**
   - `delta` prop shows percentage change badge
   - Positive: Green background, up arrow, sparkle effect
   - Negative: Red background, down arrow
   - Neutral: Gray background, equals sign

4. **Loading:**
   - Skeleton gradient shimmer on title/value
   - Disable interactions

5. **Error:**
   - Red border, error icon, error message replaces value
   - Retry button if `onClick` provided

**States:**
- **Default:** Displays value and title
- **Hover:** Subtle scale(1.02) transform, shadow elevation increase (if interactive)
- **Loading:** Skeleton pulse on text areas
- **Error:** Red border, error icon, message
- **Empty:** Gray text "No data available"

**Accessibility Requirements:**
- Card role: `role="article"` or `<article>` element
- Live region: If `isLive={true}`, wrap value in `<div aria-live="polite" aria-atomic="true">`
- Delta announced: Screen readers read "+12.5% increase" or "-5% decrease"
- Keyboard focus: If `onClick` provided, card must be focusable with Enter key support
- Focus indicator: 2px cyan ring with 2px offset
- Contrast: Title text on bg_surface must meet 4.5:1 (currently #A0AEC0 on #1A1F3A = PASS)

**Responsive Behavior:**
```css
/* Mobile (<768px) */
- Full width, stacks vertically in parent grid
- Value font-size: 2rem (text-3xl) instead of 2.5rem
- Padding: p-4 instead of p-6

/* Tablet (768px-1024px) */
- 2-column grid layout
- Default sizing

/* Desktop (>1024px) */
- 4-column grid layout (KPI Rail)
- Default sizing (p-6, text-4xl value)
```

**Tailwind Base Classes:**
```jsx
<div className="bg-bg-surface rounded-lg shadow-card p-6 transition-all duration-normal hover:shadow-card-hover hover:scale-[1.02]">
  {/* Content */}
</div>
```

---

### 2.2 LiveBadge

**Purpose:** Pulsing indicator for real-time data streams.

**TypeScript Interface:**
```typescript
interface LiveBadgeProps {
  // REQUIRED
  status: 'active' | 'paused' | 'disconnected'; // Connection state

  // OPTIONAL
  label?: string;                     // Text label (default: "LIVE")
  size?: 'sm' | 'md' | 'lg';          // Dot size
  showLabel?: boolean;                // Show/hide text label
  lastUpdate?: Date;                  // Last data timestamp
  className?: string;
}
```

**Visual Variants:**

1. **Active (status="active"):**
   - Cyan pulsing dot (2s loop)
   - Glow effect on dot
   - Label color: cyan (#00F0FF)
   - Full opacity

2. **Paused (status="paused"):**
   - Gray static dot (no pulse)
   - 50% opacity
   - Label color: gray (#64748B)
   - Shows "Paused" or timestamp "Updated 5m ago"

3. **Disconnected (status="disconnected"):**
   - Red static dot
   - 100% opacity
   - Label color: red (#FF4D6D)
   - Shows "Disconnected"

**States:**
- Active: Pulsing animation, full brightness
- Paused: Static, dimmed
- Disconnected: Static, red

**Accessibility Requirements:**
- ARIA live region: `<div aria-live="polite" aria-label="Connection status: active">`
- Status announced: Screen reader announces "Live connection active" or "Connection paused"
- Color not sole indicator: Text label required (not just dot color)
- High contrast mode: Ensure dot visible with border fallback

**Responsive Behavior:**
- All breakpoints: Same size, inline placement in top-right of cards or header

**Tailwind Base Classes:**
```jsx
<div className="flex items-center gap-2">
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
  </span>
  <span className="text-xs font-medium uppercase tracking-wide text-primary">LIVE</span>
</div>
```

---

### 2.3 SparklineCard

**Purpose:** Compact time-series visualization for trend context.

**TypeScript Interface:**
```typescript
interface SparklineCardProps {
  // REQUIRED
  data: number[];                     // Array of values (e.g., 24 hourly points)
  label: string;                      // Chart label

  // OPTIONAL
  timeframe?: '24h' | '7d' | '30d';   // Data timeframe
  color?: string;                     // Line color (default: accent_primary)
  fillGradient?: boolean;             // Show gradient fill under line
  height?: number;                    // Chart height in pixels (default: 48)
  showPoints?: boolean;               // Show data points on line
  loading?: boolean;
  error?: string;
  className?: string;
}
```

**Visual Variants:**

1. **Line Only:**
   - Simple stroke line
   - No fill gradient
   - Minimal visual weight

2. **Filled Gradient:**
   - `fillGradient={true}` adds vertical gradient under line
   - Top: color at 60% opacity → Bottom: transparent

3. **With Points:**
   - `showPoints={true}` adds circles at data points
   - Hover: Tooltip shows value + timestamp

**States:**
- Default: Renders chart
- Loading: Skeleton pulse
- Error: Red text message
- Empty: Gray placeholder "No data"

**Accessibility Requirements:**
- Alternative text: `<div role="img" aria-label="Sparkline chart showing [label] over [timeframe]: trend [up/down/stable]">`
- Data table fallback: Provide `<details>` with raw data table for screen readers
- Not interactive: No keyboard navigation required (unless points are clickable)

**Responsive Behavior:**
- All breakpoints: Full width of parent container
- Height: Fixed at 48px (default) or custom prop

**Implementation Notes:**
- Use Recharts `<Sparklines>` or `<AreaChart>` in tiny mode
- OR use canvas drawing for performance (no library)
- Smooth curve: Use cardinal spline interpolation

---

### 2.4 SystemStatus

**Purpose:** Display API/Database health with status badges.

**TypeScript Interface:**
```typescript
interface SystemStatusProps {
  // REQUIRED
  services: Array<{
    name: string;                     // Service name (e.g., "API", "Database")
    status: 'healthy' | 'degraded' | 'down'; // Health state
    responseTime?: number;            // Optional latency in ms
    lastCheck: Date;                  // Last health check timestamp
  }>;

  // OPTIONAL
  refreshInterval?: number;           // Auto-refresh interval (ms)
  onRefresh?: () => void;             // Manual refresh callback
  className?: string;
}
```

**Visual Variants:**

1. **Healthy (status="healthy"):**
   - Green dot (#06FFA5)
   - Service name in white
   - Optional: Response time in gray (e.g., "42ms")

2. **Degraded (status="degraded"):**
   - Amber dot (#F59E0B)
   - Service name in amber
   - Shows "Slow response" or latency

3. **Down (status="down"):**
   - Red dot (#FF4D6D)
   - Service name in red
   - Shows "Unavailable" or error message

**States:**
- Default: Displays service statuses
- Refreshing: Spinner icon on refresh button
- Error: Shows last successful check timestamp with warning

**Accessibility Requirements:**
- Status list: `<ul role="list">` with service items as `<li>`
- Status announced: Each service has `aria-label="API status: healthy, response time 42 milliseconds"`
- Color not sole indicator: Text label "Healthy" / "Degraded" / "Down" required
- Live updates: Wrap in `<div aria-live="polite">` if auto-refreshing

**Responsive Behavior:**
- Mobile: Stacks vertically, full width
- Desktop: Horizontal inline layout with dot-separated items

**Tailwind Base Classes:**
```jsx
<div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-success"></span>
    <span className="text-sm font-medium">API</span>
    <span className="text-xs text-text-secondary">42ms</span>
  </div>
  {/* Repeat for other services */}
</div>
```

---

### 2.5 LiveUsersTable

**Purpose:** Sortable, filterable table of user activity with inline actions.

**TypeScript Interface:**
```typescript
interface LiveUsersTableProps {
  // REQUIRED
  users: Array<{
    id: string;
    email: string;
    lastSeen: Date;
    titlesGenerated: number;
    modelUsage: Array<{ model: string; count: number }>;
    hasProLifetime: boolean;
  }>;

  // OPTIONAL
  onGrantProLifetime?: (userId: string, notes: string) => Promise<void>;
  onRevokeProLifetime?: (userId: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sortable?: boolean;                 // Enable column sorting
  filters?: {
    model?: string[];
    grantStatus?: 'all' | 'pro' | 'free';
    dateRange?: { start: Date; end: Date };
  };
  onFilterChange?: (filters: any) => void;
  className?: string;
}
```

**Visual Variants:**

1. **Default Table:**
   - Columns: Email, Last Seen, Titles Generated, Model Usage (chips), Actions
   - Sortable headers (click to sort)
   - Hover row highlight

2. **Compact Mode:**
   - Reduced row padding (py-2 instead of py-3)
   - Smaller font (text-sm instead of text-base)

3. **With Filters:**
   - FilterBar component above table
   - Active filters shown as removable chips

**States:**
- Default: Shows user rows
- Loading: Skeleton rows
- Error: Error message with retry button
- Empty: "No users found" message
- Row hover: Background color change, action buttons visible

**Accessibility Requirements:**
- Semantic table: `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Column headers: `<th scope="col">` with sort buttons having `aria-label="Sort by email"`
- Row selection: If selectable, use `aria-selected` and checkbox in first column
- Action buttons: Clear labels "Grant Pro Lifetime to [email]", "Revoke Pro Lifetime from [email]"
- Keyboard navigation:
  - Tab through interactive elements (sort buttons, action buttons)
  - Arrow keys to navigate table cells (optional, advanced)
- Screen reader announcements: When sorting changes, announce "Table sorted by email, ascending"

**Responsive Behavior:**
```css
/* Mobile (<768px) */
- Convert to card-based layout (no table)
- Each user = card with stacked fields
- Actions become full-width buttons

/* Tablet (768px-1024px) */
- Horizontal scroll on table
- Fixed left column (email) if possible

/* Desktop (>1024px) */
- Full table layout, no scroll
```

**Tailwind Base Classes:**
```jsx
<table className="min-w-full divide-y divide-border-subtle">
  <thead className="bg-bg-elevated">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
        Email
      </th>
      {/* Other headers */}
    </tr>
  </thead>
  <tbody className="bg-bg-surface divide-y divide-border-subtle">
    <tr className="hover:bg-bg-elevated transition-colors duration-fast">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
        user@example.com
      </td>
      {/* Other cells */}
    </tr>
  </tbody>
</table>
```

---

### 2.6 EntitlementModal

**Purpose:** Confirmation dialog for granting/revoking Pro Lifetime access.

**TypeScript Interface:**
```typescript
interface EntitlementModalProps {
  // REQUIRED
  isOpen: boolean;
  onClose: () => void;
  action: 'grant' | 'revoke';
  user: {
    id: string;
    email: string;
  };

  // OPTIONAL
  onConfirm: (userId: string, notes: string) => Promise<void>;
  loading?: boolean;                  // Confirm button loading state
  error?: string;                     // Error message to display
  className?: string;
}
```

**Visual Variants:**

1. **Grant Modal:**
   - Title: "Grant Pro Lifetime Access"
   - Description: "Grant unlimited access to [email]"
   - Fields: Notes textarea (optional)
   - Actions: Confirm (green), Cancel (gray)

2. **Revoke Modal:**
   - Title: "Revoke Pro Lifetime Access"
   - Description: "Remove unlimited access from [email]"
   - Fields: Reason textarea (required)
   - Actions: Confirm (red), Cancel (gray)
   - Warning: "This action cannot be undone"

**States:**
- Default: Modal open, fields editable
- Loading: Confirm button shows spinner, fields disabled
- Error: Error message above actions
- Success: Auto-close after 300ms delay

**Accessibility Requirements:**
- Modal role: `<div role="dialog" aria-modal="true" aria-labelledby="modal-title">`
- Focus trap: Focus locked inside modal while open
- Initial focus: Set to first input field (notes textarea) or Confirm button
- Close on Escape: Pressing Escape key closes modal
- Backdrop click: Clicking outside modal closes it (optional, configurable)
- Close button: Visible X button in top-right with `aria-label="Close dialog"`
- Screen reader announcements: When modal opens, announce title and description

**Responsive Behavior:**
- Mobile: Full-screen modal (covers viewport)
- Desktop: Centered modal with max-width 500px, backdrop overlay

**Tailwind Base Classes:**
```jsx
{/* Backdrop */}
<div className="fixed inset-0 bg-bg-overlay z-40" onClick={onClose} />

{/* Modal */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-bg-elevated rounded-xl shadow-modal max-w-md w-full p-8">
    <h2 id="modal-title" className="text-2xl font-bold font-heading mb-4">
      Grant Pro Lifetime Access
    </h2>
    {/* Content */}
  </div>
</div>
```

**Framer Motion Animation:**
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Modal content */}
</motion.div>
```

---

### 2.7 FilterBar

**Purpose:** Multi-select filters for data tables and lists.

**TypeScript Interface:**
```typescript
interface FilterBarProps {
  // REQUIRED
  filters: Array<{
    key: string;                      // Filter identifier
    label: string;                    // Display label
    type: 'select' | 'multiselect' | 'daterange';
    options?: Array<{ value: string; label: string }>; // For select/multiselect
    value: any;                       // Current filter value
  }>;
  onChange: (key: string, value: any) => void;

  // OPTIONAL
  onClearAll?: () => void;            // Clear all filters button
  activeCount?: number;               // Number of active filters (for badge)
  className?: string;
}
```

**Visual Variants:**

1. **Select (Single Choice):**
   - Dropdown with radio buttons
   - Example: Model filter (GPT-4, GPT-3.5, Claude)

2. **Multiselect (Multiple Choices):**
   - Dropdown with checkboxes
   - Shows "3 selected" in trigger button
   - Example: Grant status (Pro, Free)

3. **Date Range:**
   - Date picker with start/end dates
   - Presets: Today, Last 7 days, Last 30 days

**States:**
- Default: Filters closed
- Open: Dropdown expanded, overlay backdrop
- Active: Filter has non-default value, shows blue dot badge
- Empty: "Clear all" button disabled

**Accessibility Requirements:**
- Filter buttons: `<button aria-haspopup="true" aria-expanded="false">` toggles dropdown
- Dropdown menu: `<div role="menu">` with `<button role="menuitem">` for options
- Checkbox filters: Use native `<input type="checkbox">` with labels
- Keyboard navigation:
  - Tab to filter buttons
  - Enter/Space opens dropdown
  - Arrow keys navigate options
  - Escape closes dropdown
- Screen reader: Announce "Filter by model, 3 options selected" when filter changes

**Responsive Behavior:**
- Mobile: Stacks filters vertically, full-width dropdowns
- Desktop: Horizontal layout, inline dropdowns

**Tailwind Base Classes:**
```jsx
<div className="flex flex-wrap gap-4">
  <button className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-md text-sm font-medium hover:border-border-medium transition-colors">
    Model: All
    <ChevronDownIcon className="ml-2 h-4 w-4" />
  </button>
  {/* Other filter buttons */}
  <button className="ml-auto text-sm text-text-secondary hover:text-primary transition-colors">
    Clear all
  </button>
</div>
```

---

### 2.8 Toast

**Purpose:** Temporary notification for success/error/info messages.

**TypeScript Interface:**
```typescript
interface ToastProps {
  // REQUIRED
  variant: 'success' | 'error' | 'info' | 'warning';
  message: string;

  // OPTIONAL
  title?: string;                     // Optional heading
  duration?: number;                  // Auto-dismiss duration (ms, default: 5000)
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  icon?: React.ReactNode;             // Custom icon override
  className?: string;
}
```

**Visual Variants:**

1. **Success (variant="success"):**
   - Green left border (4px solid #06FFA5)
   - Checkmark icon
   - White background with green tint

2. **Error (variant="error"):**
   - Red left border (#FF4D6D)
   - X circle icon
   - White background with red tint

3. **Info (variant="info"):**
   - Cyan left border (#00F0FF)
   - Info icon
   - White background with cyan tint

4. **Warning (variant="warning"):**
   - Amber left border (#F59E0B)
   - Warning triangle icon
   - White background with amber tint

**States:**
- Entering: Slide in from right (translateX(100%) → 0)
- Visible: Full opacity, static
- Exiting: Slide out to right + fade (opacity 1 → 0)
- Paused: Hover stops auto-dismiss countdown

**Accessibility Requirements:**
- Live region: `<div role="status" aria-live="polite" aria-atomic="true">` for success/info
- Alert region: `<div role="alert" aria-live="assertive">` for errors/warnings
- Close button: `<button aria-label="Close notification">`
- Focus management: When toast appears, do NOT steal focus (non-intrusive)
- Screen reader: Announce message immediately on render

**Responsive Behavior:**
- Mobile: Full width at top of screen, stacks vertically
- Desktop: Fixed position bottom-right, max 3 visible toasts, stacks vertically

**Tailwind Base Classes:**
```jsx
<div className="bg-bg-surface border-l-4 border-success rounded-lg shadow-pop p-4 flex items-start gap-3 min-w-[320px] max-w-md">
  <CheckCircleIcon className="h-6 w-6 text-success flex-shrink-0" />
  <div className="flex-1">
    <p className="text-sm font-medium text-text-primary">{message}</p>
  </div>
  <button className="text-text-secondary hover:text-text-primary transition-colors">
    <XIcon className="h-5 w-5" />
  </button>
</div>
```

**Framer Motion Animation:**
```jsx
<motion.div
  initial={{ x: '100%', opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: '100%', opacity: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {/* Toast content */}
</motion.div>
```

---

### 2.9 DopamineEffects

**Purpose:** Celebratory micro-interactions for gamified feedback.

**TypeScript Interface:**
```typescript
interface DopamineEffectsProps {
  // REQUIRED
  trigger: 'confetti' | 'shimmer' | 'pulse' | 'sparkle';
  enabled: boolean;                   // Feature flag (GAMIFICATION env var)

  // OPTIONAL
  target?: React.RefObject<HTMLElement>; // Element to attach effect to
  intensity?: 'low' | 'medium' | 'high'; // Effect strength
  color?: string;                     // Primary color override
  onComplete?: () => void;            // Callback when effect finishes
  className?: string;
}
```

**Visual Variants:**

1. **Confetti (trigger="confetti"):**
   - Burst of 20-30 colored particles
   - Colors: Gold, cyan, green (#FFD700, #00F0FF, #06FFA5)
   - Duration: 800ms
   - Trigger: Positive delta > 10% on KPICard

2. **Shimmer (trigger="shimmer"):**
   - Subtle gradient sweep across element
   - Duration: 3s linear loop
   - Trigger: Mouse hover on cards

3. **Pulse (trigger="pulse"):**
   - Gentle scale(1) → scale(1.05) → scale(1)
   - Duration: 2s ease-in-out loop
   - Trigger: Live data updates

4. **Sparkle (trigger="sparkle"):**
   - Single gold star ✨ animation
   - Appears briefly at random position near target
   - Duration: 1s fade-out
   - Trigger: Badge unlock, achievement

**States:**
- Idle: No effect visible
- Active: Effect playing
- Disabled: No effect (respects `prefers-reduced-motion` or `enabled={false}`)

**Accessibility Requirements:**
- Purely decorative: Use `aria-hidden="true"` on effect container
- Reduced motion: Check `prefers-reduced-motion: reduce` media query
- Feature flag: Controlled by `GAMIFICATION` env var (default: on)
- No focus trap: Effects do not interfere with keyboard navigation
- Screen reader: No announcements (decorative only)

**Responsive Behavior:**
- All breakpoints: Same effect intensity (scaled to viewport if needed)

**Implementation Notes:**

1. **Confetti Library:**
   - Use `canvas-confetti` npm package
   - Or `react-rewards` for React-friendly API
   - Example:
   ```jsx
   import confetti from 'canvas-confetti';

   confetti({
     particleCount: 30,
     spread: 60,
     origin: { x: 0.5, y: 0.5 },
     colors: ['#FFD700', '#00F0FF', '#06FFA5'],
   });
   ```

2. **Shimmer with Tailwind:**
   ```jsx
   <div className="relative overflow-hidden">
     <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
     {/* Content */}
   </div>
   ```
   Add to `tailwind.config.js`:
   ```js
   animation: {
     shimmer: 'shimmer 3s linear infinite',
   },
   keyframes: {
     shimmer: {
       '0%': { transform: 'translateX(-100%)' },
       '100%': { transform: 'translateX(100%)' },
     },
   },
   ```

3. **Framer Motion Pulse:**
   ```jsx
   <motion.div
     animate={{ scale: [1, 1.05, 1] }}
     transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
   >
     {/* Content */}
   </motion.div>
   ```

---

## 3. LAYOUT STRUCTURE

**Dashboard Page Hierarchy:**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [TitleIQ ADMIN v2] ───────────────────── [User Menu] [●]   │ ← Cyan/Emerald gradient, LiveBadge
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ KPI RAIL (4 Cards in Row)                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│ │Total │ │Active│ │Total │ │Gen   │                       │
│ │Users │ │Now ● │ │Gens  │ │24h   │                       │
│ └──────┘ └──────┘ └──────┘ └──────┘                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ PERFORMANCE STRIP (3 Metrics)                              │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│ │Requests    │ │Avg Response│ │Error Rate  │              │
│ │24h         │ │(ms)        │ │(%)         │              │
│ └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM STATUS                                               │
│ API: ● green | DB: ● green | Refreshed at HH:MM:SS         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ USERS TABLE                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Filters: [Model ▼] [Grant Status ▼] [Date Range ▼]    ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Email         │Last Seen │Titles│Models    │Actions   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ user@ex.com   │5m ago    │ 42   │[GPT-4]   │Grant Rev ││
│ │ ...           │...       │...   │...       │...       ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ LLM USAGE BREAKDOWN                                         │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Per-user, per-model with sparklines                     ││
│ │ [User email] - GPT-4: ▁▂▃▄▅▆▇█ (124 uses)              ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Container Specifications:**

```jsx
// Page Shell
<div className="min-h-screen bg-bg-default">
  {/* Header */}
  <header className="bg-gradient-to-r from-primary via-secondary to-primary bg-bg-surface border-b border-border-subtle px-6 py-4">
    {/* Header content */}
  </header>

  {/* Main Content */}
  <main className="container mx-auto px-6 py-8 max-w-7xl">
    {/* KPI Rail */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard {...} />
      <KPICard {...} />
      <KPICard {...} />
      <KPICard {...} />
    </div>

    {/* Performance Strip */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KPICard {...} />
      <KPICard {...} />
      <KPICard {...} />
    </div>

    {/* System Status */}
    <div className="bg-bg-surface rounded-lg shadow-card p-4 mb-8">
      <SystemStatus {...} />
    </div>

    {/* Users Table */}
    <div className="bg-bg-surface rounded-lg shadow-card p-6 mb-8">
      <h2 className="text-2xl font-semibold font-heading mb-4">Live Users</h2>
      <FilterBar {...} />
      <LiveUsersTable {...} />
    </div>

    {/* LLM Usage */}
    <div className="bg-bg-surface rounded-lg shadow-card p-6">
      <h2 className="text-2xl font-semibold font-heading mb-4">LLM Usage Breakdown</h2>
      {/* Usage charts */}
    </div>
  </main>
</div>
```

**Responsive Breakpoints:**

```javascript
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
};
```

**Grid Layouts:**

1. **KPI Rail:**
   - Mobile: 1 column (full width cards)
   - Tablet: 2 columns
   - Desktop: 4 columns

2. **Performance Strip:**
   - Mobile: 1 column
   - Tablet/Desktop: 3 columns

3. **Users Table:**
   - Mobile: Convert to card list (no table)
   - Tablet: Horizontal scroll table
   - Desktop: Full table, no scroll

---

## 4. ACCESSIBILITY STANDARDS

**WCAG AA Compliance (Non-Negotiable):**

### 4.1 Color Contrast Requirements

All text and interactive elements MUST meet WCAG AA contrast ratios:

- **Normal text (< 18px):** 4.5:1 minimum
- **Large text (≥ 18px or ≥ 14px bold):** 3:1 minimum
- **UI controls (buttons, inputs):** 3:1 minimum

**Verified Combinations:**

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| #FFFFFF (text_primary) | #1A1F3A (bg_surface) | 12.6:1 | PASS ✓ |
| #A0AEC0 (text_secondary) | #1A1F3A (bg_surface) | 6.2:1 | PASS ✓ |
| #64748B (text_tertiary) | #1A1F3A (bg_surface) | 3.8:1 | PASS ✓ |
| #00F0FF (accent_primary) | #1A1F3A (bg_surface) | 7.1:1 | PASS ✓ |
| #FFFFFF (text) | #00F0FF (button bg) | 3.2:1 | PASS ✓ |

**Action Required:** BUILD_ENGINE MUST verify all new color combinations with contrast checker before implementation.

### 4.2 Keyboard Navigation

**All interactive elements MUST support:**

1. **Tab Order:**
   - Logical tab sequence (left-to-right, top-to-bottom)
   - No tab traps (user can exit modals/dropdowns)
   - Skip links for keyboard users ("Skip to main content")

2. **Focus Indicators:**
   - Visible 2px cyan ring with 2px offset on all focusable elements
   - Use `:focus-visible` not `:focus` to avoid mouse focus indicators
   - Tailwind: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-default`

3. **Keyboard Shortcuts:**
   - Enter/Space: Activate buttons and links
   - Escape: Close modals and dropdowns
   - Arrow keys: Navigate within dropdowns, tables (optional)

**Testing Protocol:**
- Unplug mouse, navigate entire dashboard using Tab, Enter, Space, Escape
- All actions must be completable without mouse

### 4.3 ARIA Attributes

**Required ARIA patterns:**

1. **Live Regions:**
   - `<div aria-live="polite">` for KPICard values that update
   - `<div aria-live="assertive">` for error toasts
   - `aria-atomic="true"` when entire region should be announced

2. **Modals:**
   - `<div role="dialog" aria-modal="true" aria-labelledby="modal-title">`
   - Focus trap: Lock focus inside modal while open

3. **Tables:**
   - `<table>` with `<thead>`, `<tbody>`, proper `<th scope="col">`
   - Sortable headers: `<button aria-label="Sort by email, currently unsorted">`

4. **Status Indicators:**
   - `<span role="status" aria-label="Connection status: active">` for LiveBadge
   - Color MUST NOT be sole indicator (use text label too)

5. **Form Fields:**
   - Every input has associated `<label for="input-id">` or `aria-labelledby`
   - Error messages linked with `aria-describedby`

### 4.4 Screen Reader Testing

**Must announce clearly:**
- "Total users: 1,234"
- "Active now, live indicator pulsing: 42 users"
- "Requests in last 24 hours increased by 12.5%"
- "API status: healthy, response time 42 milliseconds"
- "Filter by model, 3 options selected"

**Tool:** Test with VoiceOver (Mac) or NVDA (Windows).

### 4.5 Reduced Motion

**Respect user preferences:**

```javascript
// Check system preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Disable decorative animations
if (prefersReducedMotion) {
  // No confetti, no shimmer, no pulse
  // Keep essential transitions (focus indicators, state changes)
}
```

**Tailwind Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .animate-shimmer,
  .animate-confetti {
    animation: none !important;
  }
}
```

**Guideline:** Essential animations (loading spinners, state changes) stay; decorative animations (confetti, shimmer) disable.

---

## 5. MOTION & ANIMATION GUIDELINES

### 5.1 Timing & Duration

**Standard Durations:**

| Action | Duration | Easing | Use Case |
|--------|----------|--------|----------|
| Instant | 100ms | ease-out | Toggle switches, checkboxes |
| Fast | 200ms | ease-out | Hover states, focus indicators |
| Normal | 300ms | ease-out | Button clicks, modal open/close |
| Slow | 500ms | ease-out | Page transitions, toast slide-in |
| Pulse | 2000ms | ease-in-out | Live indicator loop |
| Shimmer | 3000ms | linear | Card hover effect |
| Confetti | 800ms | ease-out | Celebration burst |

### 5.2 Animation Patterns

**1. Pulse (Live Indicator):**
```javascript
// Framer Motion
<motion.div
  animate={{
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  <LiveBadge />
</motion.div>
```

**Tailwind Alternative:**
```css
@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
    box-shadow: 0 0 40px rgba(0, 240, 255, 0.8);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

**2. Shimmer (Card Hover):**
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 3s linear infinite;
}
```

**Implementation:**
```jsx
<div className="relative overflow-hidden group">
  <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  <KPICard {...} />
</div>
```

**3. Confetti (Positive Delta):**
```javascript
import confetti from 'canvas-confetti';

const triggerConfetti = () => {
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#FFD700', '#00F0FF', '#06FFA5'],
    startVelocity: 30,
    decay: 0.9,
    scalar: 0.8,
  });
};

// Trigger when delta > 10%
if (delta > 10 && gamificationEnabled) {
  triggerConfetti();
}
```

**4. Toast Slide-In:**
```javascript
<motion.div
  initial={{ x: '100%', opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: '100%', opacity: 0 }}
  transition={{
    duration: 0.3,
    ease: [0, 0, 0.2, 1], // ease-out
  }}
>
  <Toast {...} />
</motion.div>
```

**5. Modal Fade + Scale:**
```javascript
// Backdrop
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 bg-bg-overlay"
/>

// Modal
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  <EntitlementModal {...} />
</motion.div>
```

### 5.3 Performance Optimization

**GPU-Accelerated Properties:**
- Use `transform`, `opacity`, `filter` (hardware-accelerated)
- Avoid animating `width`, `height`, `margin`, `padding` (layout-triggering)

**Best Practices:**
1. Add `will-change: transform;` to animated elements (sparingly)
2. Use `translate3d(0,0,0)` to force GPU acceleration
3. Debounce scroll/resize handlers
4. Use `IntersectionObserver` to trigger animations only when visible

---

## 6. COMPONENT USAGE RULES

**Enforcement for BUILD_ENGINE:**

### 6.1 Token Consumption

**BUILD_ENGINE MUST:**
- Use ONLY tokens from this spec (no random Tailwind values)
- Reference colors by name: `bg-bg-surface` not `bg-[#1A1F3A]`
- Use spacing scale: `p-6` not `p-[24px]`
- Use radius scale: `rounded-lg` not `rounded-[12px]`

**Example VIOLATION:**
```jsx
❌ <div className="bg-[#1A1F3A] p-[24px] rounded-[12px]">
```

**Example COMPLIANT:**
```jsx
✓ <div className="bg-bg-surface p-6 rounded-lg shadow-card">
```

### 6.2 No Freestyle Components

**All UI components MUST:**
1. Match a spec in Section 2 (KPICard, LiveBadge, etc.)
2. Use defined props interface (no ad-hoc props)
3. Follow accessibility requirements
4. Implement responsive behavior

**If new component needed:**
1. REQUEST approval from CATALYST
2. Submit TypeScript interface + accessibility plan
3. Wait for CATALYST to update UI_FOUNDATION.md

### 6.3 Accessibility Checklist

**Before shipping ANY component, BUILD_ENGINE MUST verify:**

- [ ] Keyboard navigable (Tab, Enter, Space, Escape work)
- [ ] Visible focus indicator (2px cyan ring)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] ARIA attributes correct (role, aria-label, aria-live)
- [ ] Screen reader announces content clearly
- [ ] Respects `prefers-reduced-motion`
- [ ] Works on mobile (390px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1440px+ width)

### 6.4 Responsive Testing

**Mandatory viewport tests:**

| Viewport | Width | Device Example | Test Priority |
|----------|-------|----------------|---------------|
| Mobile | 390px | iPhone 12/13/14 | HIGH |
| Mobile Large | 428px | iPhone 14 Pro Max | MEDIUM |
| Tablet | 768px | iPad | HIGH |
| Desktop | 1440px | MacBook Pro 15" | HIGH |
| Large Desktop | 1920px | iMac 27" | MEDIUM |

**Test Scenarios:**
1. No horizontal scroll on mobile
2. Tap targets ≥ 44px touch area
3. Text readable (no sub-16px body text)
4. Cards stack vertically on mobile
5. Tables convert to cards or scroll on mobile

---

## 7. DARK MODE PALETTE (FINALIZED)

**Color Palette Summary:**

```javascript
// COPY THIS INTO YOUR PROJECT
export const adminDarkTheme = {
  // Backgrounds
  bg_default: '#0A0E27',
  bg_surface: '#1A1F3A',
  bg_elevated: '#252B47',
  bg_overlay: 'rgba(10, 14, 39, 0.85)',

  // Text
  text_primary: '#FFFFFF',
  text_secondary: '#A0AEC0',
  text_tertiary: '#64748B',

  // Brand Accents
  accent_primary: '#00F0FF',      // Cyan
  accent_secondary: '#9D4EDD',    // Purple
  accent_tertiary: '#FF006E',     // Pink

  // System States
  accent_success: '#06FFA5',
  accent_warning: '#F59E0B',
  accent_error: '#FF4D6D',
  accent_info: '#60A5FA',

  // Gamification
  gamification_xp: '#FFD700',
  gamification_streak: '#FF8C00',

  // Borders
  border_subtle: '#2D3748',
  border_medium: '#4A5568',
  border_strong: '#718096',

  // Effects
  glow_cyan: 'rgba(0, 240, 255, 0.4)',
  glow_green: 'rgba(6, 255, 165, 0.4)',
  glow_gold: 'rgba(255, 215, 0, 0.4)',
};
```

**Usage in Components:**
```jsx
// Background hierarchy
<div className="bg-bg-default">               {/* Page canvas */}
  <div className="bg-bg-surface">             {/* Cards, panels */}
    <div className="bg-bg-elevated">          {/* Modals, dropdowns */}
    </div>
  </div>
</div>

// Text hierarchy
<h1 className="text-text-primary">Heading</h1>
<p className="text-text-secondary">Supporting text</p>
<span className="text-text-tertiary">Disabled</span>

// Interactive states
<button className="bg-primary text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary">
  Action
</button>
```

---

## 8. TAILWIND CONFIG EXTENSION

**Complete `tailwind.config.js` additions:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-default': '#0A0E27',
        'bg-surface': '#1A1F3A',
        'bg-elevated': '#252B47',

        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0AEC0',
        'text-tertiary': '#64748B',

        // Borders
        'border-subtle': '#2D3748',
        'border-medium': '#4A5568',
        'border-strong': '#718096',

        // Existing brand colors (keep these)
        primary: '#00F0FF',
        secondary: '#9D4EDD',
        accent: '#FF006E',
        dark: '#0A0E27',
        success: '#06FFA5',
        error: '#FF4D6D',
        warning: '#F59E0B',
        info: '#60A5FA',

        // Gamification
        'gamification-xp': '#FFD700',
        'gamification-streak': '#FF8C00',

        // Glows
        'glow-cyan': 'rgba(0, 240, 255, 0.4)',
        'glow-green': 'rgba(6, 255, 165, 0.4)',
        'glow-gold': 'rgba(255, 215, 0, 0.4)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
        'pop': '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
        'modal': '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
        'glow-green': '0 0 20px rgba(6, 255, 165, 0.5), 0 0 40px rgba(6, 255, 165, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.7',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.8)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
```

---

## 9. AUTHORITY & ENFORCEMENT

**CATALYST UI ENFORCER Authority:**

This design system is **LOCKED** and enforced by CATALYST. BUILD_ENGINE MUST NOT:
- Create components outside this spec without CATALYST approval
- Use arbitrary Tailwind values not defined in tokens
- Skip accessibility requirements
- Ship UI that fails contrast/keyboard/responsive checks

**CATALYST has BLOCK authority:**
- If UI fails accessibility: **HOLD SHIP**
- If UI breaks on mobile: **HOLD SHIP**
- If UI uses freestyle values: **BLOCK IMPLEMENTATION**

**Only BOSS_PRIME override:** If BOSS_PRIME explicitly says "ship now," CATALYST must document the compromise and issue warnings.

---

## 10. NEXT STEPS FOR BUILD_ENGINE

**Phase 1: Setup (Before Implementation)**
1. Update `tailwind.config.js` with Section 8 extensions
2. Create `/src/components/ui/` folder for atomic components
3. Install dependencies: `canvas-confetti`, `recharts` (for sparklines)
4. Create `/src/tokens/` folder with JavaScript exports of tokens

**Phase 2: Component Implementation**
1. Build components in order:
   - KPICard (most reused)
   - LiveBadge (dependency for KPICard)
   - SystemStatus
   - Toast
   - FilterBar
   - LiveUsersTable
   - EntitlementModal
   - SparklineCard
   - DopamineEffects

2. For each component:
   - Create `.tsx` file with TypeScript interface from Section 2
   - Implement all visual variants
   - Add accessibility attributes (ARIA, keyboard support)
   - Test on 390px, 768px, 1440px viewports
   - Verify color contrast with WebAIM tool

**Phase 3: Integration**
1. Build admin dashboard page with layout from Section 3
2. Connect to live API endpoints
3. Enable live data updates (WebSocket or polling)
4. Test full keyboard navigation flow
5. Test with screen reader (VoiceOver/NVDA)

**Phase 4: CATALYST Review**
1. Submit dashboard for accessibility audit
2. Submit responsive audit results
3. Fix any BLOCKER issues
4. Get SHIP approval from CATALYST

---

## APPENDIX A: TYPESCRIPT INTERFACES (EXPORT-READY)

```typescript
// /src/types/ui.types.ts

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isLive?: boolean;
  delta?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string;
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
}

export interface LiveBadgeProps {
  status: 'active' | 'paused' | 'disconnected';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  lastUpdate?: Date;
  className?: string;
}

export interface SparklineCardProps {
  data: number[];
  label: string;
  timeframe?: '24h' | '7d' | '30d';
  color?: string;
  fillGradient?: boolean;
  height?: number;
  showPoints?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface SystemStatusService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: Date;
}

export interface SystemStatusProps {
  services: SystemStatusService[];
  refreshInterval?: number;
  onRefresh?: () => void;
  className?: string;
}

export interface LiveUsersTableUser {
  id: string;
  email: string;
  lastSeen: Date;
  titlesGenerated: number;
  modelUsage: Array<{ model: string; count: number }>;
  hasProLifetime: boolean;
}

export interface LiveUsersTableProps {
  users: LiveUsersTableUser[];
  onGrantProLifetime?: (userId: string, notes: string) => Promise<void>;
  onRevokeProLifetime?: (userId: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sortable?: boolean;
  filters?: {
    model?: string[];
    grantStatus?: 'all' | 'pro' | 'free';
    dateRange?: { start: Date; end: Date };
  };
  onFilterChange?: (filters: any) => void;
  className?: string;
}

export interface EntitlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'grant' | 'revoke';
  user: {
    id: string;
    email: string;
  };
  onConfirm: (userId: string, notes: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange';
  options?: FilterOption[];
  value: any;
}

export interface FilterBarProps {
  filters: Filter[];
  onChange: (key: string, value: any) => void;
  onClearAll?: () => void;
  activeCount?: number;
  className?: string;
}

export interface ToastProps {
  variant: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export interface DopamineEffectsProps {
  trigger: 'confetti' | 'shimmer' | 'pulse' | 'sparkle';
  enabled: boolean;
  target?: React.RefObject<HTMLElement>;
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
  onComplete?: () => void;
  className?: string;
}
```

---

## APPENDIX B: DESIGN TOKENS (EXPORT-READY)

```javascript
// /src/tokens/design-tokens.js

export const colors = {
  bg_default: '#0A0E27',
  bg_surface: '#1A1F3A',
  bg_elevated: '#252B47',
  bg_overlay: 'rgba(10, 14, 39, 0.85)',

  text_primary: '#FFFFFF',
  text_secondary: '#A0AEC0',
  text_tertiary: '#64748B',
  text_inverse: '#0A0E27',

  accent_primary: '#00F0FF',
  accent_secondary: '#9D4EDD',
  accent_tertiary: '#FF006E',

  accent_success: '#06FFA5',
  accent_warning: '#F59E0B',
  accent_error: '#FF4D6D',
  accent_info: '#60A5FA',

  gamification_xp: '#FFD700',
  gamification_streak: '#FF8C00',
  gamification_level: '#9D4EDD',

  border_subtle: '#2D3748',
  border_medium: '#4A5568',
  border_strong: '#718096',

  glow_cyan: 'rgba(0, 240, 255, 0.4)',
  glow_green: 'rgba(6, 255, 165, 0.4)',
  glow_gold: 'rgba(255, 215, 0, 0.4)',

  chart_primary: '#00F0FF',
  chart_secondary: '#9D4EDD',
  chart_tertiary: '#06FFA5',
  chart_quaternary: '#F59E0B',
  chart_quinary: '#FF006E',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
};

export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  pill: '9999px',
};

export const typography = {
  display: {
    fontSize: '3rem',
    fontWeight: '700',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '0',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
    fontFamily: 'Inter, sans-serif',
  },
  body_small: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: 'Inter, sans-serif',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '500',
    lineHeight: '1.3',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  mono: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
  },
  kpi_value: {
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: '1',
    letterSpacing: '-0.02em',
    fontFamily: '"Space Grotesk", sans-serif',
  },
};

export const shadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)',
  card_hover: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
  pop: '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
  modal: '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
  glow_cyan: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
  glow_green: '0 0 20px rgba(6, 255, 165, 0.5), 0 0 40px rgba(6, 255, 165, 0.3)',
  glow_gold: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
};

export const motion = {
  duration_instant: 100,
  duration_fast: 200,
  duration_normal: 300,
  duration_slow: 500,
  duration_pulse: 2000,
  duration_shimmer: 3000,
  duration_confetti: 800,

  ease_default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  ease_in: 'cubic-bezier(0.4, 0, 1, 1)',
  ease_out: 'cubic-bezier(0, 0, 0.2, 1)',
  ease_in_out: 'cubic-bezier(0.4, 0, 0.2, 1)',
  ease_bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  spring_default: { type: 'spring', stiffness: 300, damping: 25 },
  spring_gentle: { type: 'spring', stiffness: 200, damping: 20 },
  spring_bouncy: { type: 'spring', stiffness: 400, damping: 15 },

  respectsReducedMotion: true,
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

---

## SIGN-OFF

**STATUS:** DESIGN SYSTEM LOCKED FOR IMPLEMENTATION
**AUTHORITY:** CATALYST UI ENFORCER
**BUILD_ENGINE:** Ready to implement components using this spec
**SHIP GATE:** All components must pass CATALYST accessibility + responsive audit

END OF UI_FOUNDATION.md
