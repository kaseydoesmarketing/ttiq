/**
 * TitleIQ Admin Dashboard v2 - Design Tokens
 *
 * AUTHORITY: CATALYST UI ENFORCER
 * VERSION: 1.0.0
 * LAST UPDATED: 2025-10-28
 *
 * Single source of truth for all design system values.
 * BUILD_ENGINE MUST consume these tokens exclusively - no arbitrary values.
 *
 * Import usage:
 * import { colors, spacing, typography, shadows, motion } from '@/tokens/design-tokens';
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  // BACKGROUNDS (Darker, matching user examples)
  bg_default: '#0B1221',        // Main canvas (deep navy, like example 3)
  bg_surface: '#162338',        // Card/panel background (elevated 1 level)
  bg_elevated: '#1F2D47',       // Modal/dropdown background (elevated 2 levels)
  bg_overlay: 'rgba(11, 18, 33, 0.85)', // Modal backdrop overlay

  // TEXT
  text_primary: '#FFFFFF',      // Headings, primary content
  text_secondary: '#A0AEC0',    // Subtitles, supporting text
  text_tertiary: '#64748B',     // Disabled, placeholder text
  text_inverse: '#0A0E27',      // Text on light backgrounds

  // BRAND ACCENTS (Primary Actions & Live Indicators)
  accent_primary: '#00F0FF',    // Cyan - primary CTAs, live indicators
  accent_secondary: '#9D4EDD',  // Purple - secondary actions, level indicators
  accent_tertiary: '#FF006E',   // Pink - special emphasis

  // SYSTEM STATES
  accent_success: '#06FFA5',    // Green - success, healthy status
  accent_warning: '#F59E0B',    // Amber - warnings, degraded state
  accent_error: '#FF4D6D',      // Red - errors, critical alerts
  accent_info: '#60A5FA',       // Blue - informational messages

  // GAMIFICATION ACCENTS
  gamification_xp: '#FFD700',   // Gold - XP gains, achievements, rewards
  gamification_streak: '#FF8C00', // Orange - streak badges, consistency
  gamification_level: '#9D4EDD', // Purple - level up indicators

  // BORDERS
  border_subtle: '#2D3748',     // Default borders, dividers
  border_medium: '#4A5568',     // Hover states, interactive borders
  border_strong: '#718096',     // Active selection, emphasis

  // SPECIAL EFFECTS (Glows & Shadows)
  glow_cyan: 'rgba(0, 240, 255, 0.4)',    // Cyan glow for live indicators
  glow_green: 'rgba(6, 255, 165, 0.4)',   // Green glow for success states
  glow_gold: 'rgba(255, 215, 0, 0.4)',    // Gold glow for achievements

  // DATA VISUALIZATION (Multi-color palette like donut chart examples)
  chart_primary: '#0EA5E9',     // Electric blue - primary chart line
  chart_secondary: '#A855F7',   // Vivid purple - secondary chart line
  chart_tertiary: '#10B981',    // Emerald green - tertiary chart line
  chart_quaternary: '#F97316',  // Vivid orange - quaternary chart line
  chart_quinary: '#EC4899',     // Hot pink - quinary chart line
  chart_cyan: '#06B6D4',        // Cyan accent
  chart_teal: '#14B8A6',        // Teal accent
  chart_amber: '#F59E0B',       // Amber accent

  // GRADIENTS (For cards and backgrounds)
  gradient_primary_start: '#8B5CF6',   // Purple start
  gradient_primary_end: '#06B6D4',     // Cyan end
  gradient_secondary_start: '#0EA5E9', // Blue start
  gradient_secondary_end: '#14B8A6',   // Teal end
};

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  xs: '4px',      // 0.25rem - Minimal gaps, tight spacing
  sm: '8px',      // 0.5rem  - Small gaps, compact layouts
  md: '12px',     // 0.75rem - Medium gaps
  base: '16px',   // 1rem    - Default spacing unit
  lg: '20px',     // 1.25rem - Large gaps
  xl: '24px',     // 1.5rem  - Extra large gaps, section spacing
  '2xl': '32px',  // 2rem    - Major section spacing
  '3xl': '48px',  // 3rem    - Page section dividers
  '4xl': '64px',  // 4rem    - Hero sections, major dividers
};

// Component-specific spacing guidelines
export const componentSpacing = {
  card_padding: spacing.xl,           // 24px (p-6)
  card_padding_compact: spacing.base, // 16px (p-4)
  modal_padding: spacing['2xl'],      // 32px (p-8)
  modal_header_padding: spacing.xl,   // 24px (p-6)
  button_padding_x: spacing.xl,       // 24px (px-6)
  button_padding_y: spacing.md,       // 12px (py-3)
  button_padding_small_x: spacing.base, // 16px (px-4)
  button_padding_small_y: spacing.sm,   // 8px (py-2)
  section_gap: spacing.xl,            // 24px (gap-6)
  element_gap: spacing.base,          // 16px (gap-4)
};

// ============================================================================
// BORDER RADIUS SCALE
// ============================================================================

export const radius = {
  none: '0px',    // Sharp corners
  sm: '4px',      // Subtle rounding - badges, chips
  md: '8px',      // Default rounding - buttons, inputs
  lg: '12px',     // Card rounding - panels, cards
  xl: '16px',     // Large rounding - modals, large cards
  '2xl': '24px',  // Extra large rounding - hero sections
  pill: '9999px', // Full pill shape - avatars, status dots, badges
};

// Component-specific radius assignments
export const componentRadius = {
  button: radius.md,        // 8px (rounded-md)
  card: radius.lg,          // 12px (rounded-lg)
  modal: radius.xl,         // 16px (rounded-xl)
  input: radius.md,         // 8px (rounded-md)
  badge: radius.pill,       // 9999px (rounded-full)
  toast: radius.lg,         // 12px (rounded-lg)
  dropdown: radius.md,      // 8px (rounded-md)
};

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const typography = {
  // DISPLAY (Hero/Dashboard Title)
  display: {
    fontSize: '3rem',         // 48px - text-5xl
    fontWeight: '700',        // bold
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // H1 (Page Headings)
  h1: {
    fontSize: '2rem',         // 32px - text-3xl
    fontWeight: '700',        // bold
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // H2 (Section Headings)
  h2: {
    fontSize: '1.5rem',       // 24px - text-2xl
    fontWeight: '600',        // semibold
    lineHeight: '1.3',
    letterSpacing: '0',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // H3 (Subsection Headings)
  h3: {
    fontSize: '1.25rem',      // 20px - text-xl
    fontWeight: '600',        // semibold
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: '"Space Grotesk", sans-serif',
  },

  // BODY (Default Text)
  body: {
    fontSize: '1rem',         // 16px - text-base
    fontWeight: '400',        // normal
    lineHeight: '1.5',
    letterSpacing: '0',
    fontFamily: 'Inter, sans-serif',
  },

  // BODY SMALL (Supporting Text)
  body_small: {
    fontSize: '0.875rem',     // 14px - text-sm
    fontWeight: '400',        // normal
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: 'Inter, sans-serif',
  },

  // LABEL (Form Labels, Chip Text)
  label: {
    fontSize: '0.75rem',      // 12px - text-xs
    fontWeight: '500',        // medium
    lineHeight: '1.3',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },

  // MONO (Metrics, API Keys, Code)
  mono: {
    fontSize: '0.875rem',     // 14px - text-sm
    fontWeight: '500',        // medium
    lineHeight: '1.4',
    letterSpacing: '0',
    fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
  },

  // KPI VALUE (Large Metric Numbers)
  kpi_value: {
    fontSize: '2.5rem',       // 40px - text-4xl
    fontWeight: '700',        // bold
    lineHeight: '1',
    letterSpacing: '-0.02em',
    fontFamily: '"Space Grotesk", sans-serif',
  },
};

// Tailwind utility class mappings for typography
export const typographyClasses = {
  display: 'text-5xl font-bold font-heading tracking-tight',
  h1: 'text-3xl font-bold font-heading tracking-tight',
  h2: 'text-2xl font-semibold font-heading',
  h3: 'text-xl font-semibold font-heading',
  body: 'text-base font-body',
  body_small: 'text-sm font-body',
  label: 'text-xs font-medium uppercase tracking-wide font-body',
  mono: 'text-sm font-medium font-mono',
  kpi_value: 'text-4xl font-bold font-heading tracking-tight',
};

// ============================================================================
// ELEVATION & SHADOWS
// ============================================================================

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

  // FOCUS STATES
  focus_ring: '0 0 0 2px rgba(0, 240, 255, 1)',
};

// Tailwind shadow class mappings
export const shadowClasses = {
  card: 'shadow-card',
  card_hover: 'shadow-card-hover',
  pop: 'shadow-pop',
  modal: 'shadow-modal',
  glow_cyan: 'shadow-glow-cyan',
  glow_green: 'shadow-glow-green',
  glow_gold: 'shadow-glow-gold',
};

// ============================================================================
// MOTION & ANIMATION
// ============================================================================

export const motion = {
  // DURATIONS (milliseconds)
  duration_instant: 100,      // Toggle switches, checkboxes
  duration_fast: 200,         // Hover states, focus indicators
  duration_normal: 300,       // Button presses, modal open/close
  duration_slow: 500,         // Page transitions, toast slide-in
  duration_pulse: 2000,       // Live indicator pulse loop
  duration_shimmer: 3000,     // Card shimmer effect
  duration_confetti: 800,     // Confetti burst animation

  // EASING CURVES (cubic-bezier)
  ease_default: 'cubic-bezier(0.4, 0, 0.2, 1)',       // Tailwind default
  ease_in: 'cubic-bezier(0.4, 0, 1, 1)',              // Deceleration
  ease_out: 'cubic-bezier(0, 0, 0.2, 1)',             // Acceleration
  ease_in_out: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Smooth both ends
  ease_bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful overshoot

  // FRAMER MOTION SPRING PRESETS
  spring_default: { type: 'spring', stiffness: 300, damping: 25 },
  spring_gentle: { type: 'spring', stiffness: 200, damping: 20 },
  spring_bouncy: { type: 'spring', stiffness: 400, damping: 15 },

  // FEATURE FLAGS
  respectsReducedMotion: true, // Global flag - disable decorative animations
};

// Tailwind transition class mappings
export const transitionClasses = {
  instant: 'transition-all duration-instant',
  fast: 'transition-all duration-fast',
  normal: 'transition-all duration-normal',
  slow: 'transition-all duration-slow',
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',   // Mobile landscape (Tailwind: sm:)
  md: '768px',   // Tablet (Tailwind: md:)
  lg: '1024px',  // Desktop (Tailwind: lg:)
  xl: '1280px',  // Large desktop (Tailwind: xl:)
  '2xl': '1536px', // Extra large desktop (Tailwind: 2xl:)
};

// Critical viewport widths for testing
export const criticalViewports = {
  mobile_portrait: 390,   // iPhone 12/13/14
  mobile_landscape: 844,  // iPhone 12/13/14 landscape
  tablet_portrait: 768,   // iPad
  tablet_landscape: 1024, // iPad landscape
  desktop: 1440,          // MacBook Pro 15"
  desktop_large: 1920,    // iMac 27"
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70,
};

// ============================================================================
// ACCESSIBILITY CONSTANTS
// ============================================================================

export const a11y = {
  // WCAG AA Contrast Ratios
  contrast_normal_text: 4.5,      // Minimum for text < 18px
  contrast_large_text: 3.0,       // Minimum for text >= 18px or >= 14px bold
  contrast_ui_components: 3.0,    // Minimum for interactive elements

  // Focus Indicator
  focus_ring_width: '2px',
  focus_ring_offset: '2px',
  focus_ring_color: colors.accent_primary,

  // Touch Targets
  min_touch_target: 44,           // Minimum tap target size (px)
  preferred_touch_target: 48,     // Preferred tap target size (px)

  // Animation
  prefers_reduced_motion_query: '(prefers-reduced-motion: reduce)',
};

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // BUTTON
  button: {
    padding_x: spacing.xl,          // 24px (px-6)
    padding_y: spacing.md,          // 12px (py-3)
    padding_small_x: spacing.base,  // 16px (px-4)
    padding_small_y: spacing.sm,    // 8px (py-2)
    radius: radius.md,              // 8px
    font_weight: '600',
    transition: transitionClasses.fast,
  },

  // CARD
  card: {
    padding: spacing.xl,            // 24px (p-6)
    padding_compact: spacing.base,  // 16px (p-4)
    radius: radius.lg,              // 12px
    shadow: shadows.card,
    shadow_hover: shadows.card_hover,
    border_color: colors.border_subtle,
  },

  // MODAL
  modal: {
    padding: spacing['2xl'],        // 32px (p-8)
    padding_header: spacing.xl,     // 24px (p-6)
    radius: radius.xl,              // 16px
    shadow: shadows.modal,
    backdrop_color: colors.bg_overlay,
    max_width: '500px',
  },

  // INPUT
  input: {
    padding_x: spacing.base,        // 16px (px-4)
    padding_y: spacing.md,          // 12px (py-3)
    radius: radius.md,              // 8px
    border_color: colors.border_subtle,
    border_color_focus: colors.accent_primary,
    font_size: typography.body.fontSize,
  },

  // TOAST
  toast: {
    padding: spacing.base,          // 16px (p-4)
    radius: radius.lg,              // 12px
    shadow: shadows.pop,
    min_width: '320px',
    max_width: '448px',             // max-w-md
    border_width: '4px',            // Left border for variant color
  },

  // BADGE
  badge: {
    padding_x: spacing.md,          // 12px (px-3)
    padding_y: spacing.xs,          // 4px (py-1)
    radius: radius.pill,            // 9999px (rounded-full)
    font_size: typography.label.fontSize,
    font_weight: typography.label.fontWeight,
  },
};

// ============================================================================
// EXPORT ALL TOKENS AS DEFAULT
// ============================================================================

export default {
  colors,
  spacing,
  componentSpacing,
  radius,
  componentRadius,
  typography,
  typographyClasses,
  shadows,
  shadowClasses,
  motion,
  transitionClasses,
  breakpoints,
  criticalViewports,
  zIndex,
  a11y,
  components,
};
