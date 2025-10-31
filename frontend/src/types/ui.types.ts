/**
 * TitleIQ Admin Dashboard v2 - UI Component Type Definitions
 *
 * AUTHORITY: CATALYST UI ENFORCER
 * VERSION: 1.0.0
 * LAST UPDATED: 2025-10-28
 *
 * These TypeScript interfaces define the contracts for all admin dashboard components.
 * BUILD_ENGINE MUST implement components exactly as specified here.
 *
 * DO NOT modify these interfaces without CATALYST approval.
 */

import React from 'react';

// ============================================================================
// KPICard Component
// ============================================================================

export interface KPICardProps {
  /** Metric name (e.g., "Total Users") */
  title: string;

  /** Primary value to display (string for formatted numbers or raw number) */
  value: string | number;

  /** Supporting text (e.g., "Last 30 days") */
  subtitle?: string;

  /** Enable pulsing live indicator with cyan glow */
  isLive?: boolean;

  /** Percentage change (e.g., 12.5 for +12.5%) - shows delta badge */
  delta?: number;

  /** Visual trend indicator (affects delta badge color/icon) */
  trend?: 'up' | 'down' | 'neutral';

  /** Optional leading icon component */
  icon?: React.ReactNode;

  /** Show skeleton loading state */
  loading?: boolean;

  /** Error message (replaces value display) */
  error?: string;

  /** Mini chart data for 24h trend visualization */
  sparklineData?: number[];

  /** Make card interactive (adds hover effects + keyboard support) */
  onClick?: () => void;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// LiveBadge Component
// ============================================================================

export interface LiveBadgeProps {
  /** Connection state - controls visual appearance and animation */
  status: 'active' | 'paused' | 'disconnected';

  /** Text label (default: "LIVE" for active, "Paused"/"Disconnected" for others) */
  label?: string;

  /** Pulsing dot size */
  size?: 'sm' | 'md' | 'lg';

  /** Show/hide text label next to dot */
  showLabel?: boolean;

  /** Last data update timestamp (used for "Updated Xm ago" display when paused) */
  lastUpdate?: Date;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// SparklineCard Component
// ============================================================================

export interface SparklineCardProps {
  /** Array of numeric values for time-series (e.g., 24 hourly data points) */
  data: number[];

  /** Chart label/title */
  label: string;

  /** Data timeframe (affects x-axis labels) */
  timeframe?: '24h' | '7d' | '30d';

  /** Line stroke color (default: accent_primary cyan) */
  color?: string;

  /** Show gradient fill under line */
  fillGradient?: boolean;

  /** Chart height in pixels (default: 48px) */
  height?: number;

  /** Show data point circles on line */
  showPoints?: boolean;

  /** Show skeleton loading state */
  loading?: boolean;

  /** Error message */
  error?: string;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// SystemStatus Component
// ============================================================================

export interface SystemStatusService {
  /** Service name (e.g., "API", "Database", "Cache") */
  name: string;

  /** Health state - controls dot color and text */
  status: 'healthy' | 'degraded' | 'down';

  /** Optional latency in milliseconds (shows "42ms" next to healthy services) */
  responseTime?: number;

  /** Last health check timestamp */
  lastCheck: Date;
}

export interface SystemStatusProps {
  /** Array of service health statuses */
  services: SystemStatusService[];

  /** Auto-refresh interval in milliseconds (optional) */
  refreshInterval?: number;

  /** Manual refresh callback (shows refresh button if provided) */
  onRefresh?: () => void;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// LiveUsersTable Component
// ============================================================================

export interface LiveUsersTableUser {
  /** Unique user identifier */
  id: string;

  /** User email address */
  email: string;

  /** Last activity timestamp */
  lastSeen: Date;

  /** Total number of titles generated */
  titlesGenerated: number;

  /** Per-model usage breakdown */
  modelUsage: Array<{ model: string; count: number }>;

  /** Pro Lifetime entitlement status */
  hasProLifetime: boolean;
}

export interface LiveUsersTablePagination {
  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  pageSize: number;

  /** Total number of items across all pages */
  total: number;

  /** Page change callback */
  onPageChange: (page: number) => void;
}

export interface LiveUsersTableFilters {
  /** Filter by AI model(s) */
  model?: string[];

  /** Filter by entitlement status */
  grantStatus?: 'all' | 'pro' | 'free';

  /** Filter by date range */
  dateRange?: { start: Date; end: Date };
}

export interface LiveUsersTableProps {
  /** Array of user records to display */
  users: LiveUsersTableUser[];

  /** Grant Pro Lifetime callback (shows Grant button if provided) */
  onGrantProLifetime?: (userId: string, notes: string) => Promise<void>;

  /** Revoke Pro Lifetime callback (shows Revoke button if provided) */
  onRevokeProLifetime?: (userId: string) => Promise<void>;

  /** Show skeleton loading state */
  loading?: boolean;

  /** Error message */
  error?: string;

  /** Pagination configuration (optional) */
  pagination?: LiveUsersTablePagination;

  /** Enable column header sorting */
  sortable?: boolean;

  /** Active filters */
  filters?: LiveUsersTableFilters;

  /** Filter change callback */
  onFilterChange?: (filters: LiveUsersTableFilters) => void;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// EntitlementModal Component
// ============================================================================

export interface EntitlementModalUser {
  /** User ID for API call */
  id: string;

  /** User email for display in modal */
  email: string;
}

export interface EntitlementModalProps {
  /** Modal open/closed state */
  isOpen: boolean;

  /** Close modal callback */
  onClose: () => void;

  /** Action type - controls modal title, description, and button styling */
  action: 'grant' | 'revoke';

  /** User being acted upon */
  user: EntitlementModalUser;

  /** Confirm action callback (receives userId and notes/reason) */
  onConfirm: (userId: string, notes: string) => Promise<void>;

  /** Confirm button loading state (disables form while API call in progress) */
  loading?: boolean;

  /** Error message to display above action buttons */
  error?: string;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// FilterBar Component
// ============================================================================

export interface FilterOption {
  /** Filter option value (used in API calls) */
  value: string;

  /** Filter option display label */
  label: string;
}

export interface Filter {
  /** Unique filter identifier */
  key: string;

  /** Filter display label */
  label: string;

  /** Filter type - controls UI component */
  type: 'select' | 'multiselect' | 'daterange';

  /** Available options for select/multiselect types */
  options?: FilterOption[];

  /** Current filter value (any type depending on filter.type) */
  value: any;
}

export interface FilterBarProps {
  /** Array of filter configurations */
  filters: Filter[];

  /** Filter value change callback */
  onChange: (key: string, value: any) => void;

  /** Clear all filters callback (shows "Clear all" button if provided) */
  onClearAll?: () => void;

  /** Number of active filters (shows badge on filter trigger buttons) */
  activeCount?: number;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// Toast Component
// ============================================================================

export interface ToastAction {
  /** Action button label (e.g., "Undo", "View") */
  label: string;

  /** Action button click handler */
  onClick: () => void;
}

export interface ToastProps {
  /** Visual variant - controls color, icon, and ARIA role */
  variant: 'success' | 'error' | 'info' | 'warning';

  /** Toast message text */
  message: string;

  /** Optional heading above message */
  title?: string;

  /** Auto-dismiss duration in milliseconds (default: 5000) */
  duration?: number;

  /** Optional action button configuration */
  action?: ToastAction;

  /** Close callback (triggered by close button or auto-dismiss) */
  onClose?: () => void;

  /** Custom icon override (replaces default variant icon) */
  icon?: React.ReactNode;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// DopamineEffects Component
// ============================================================================

export interface DopamineEffectsProps {
  /** Effect type - determines animation behavior */
  trigger: 'confetti' | 'shimmer' | 'pulse' | 'sparkle';

  /** Feature flag - respects GAMIFICATION env var and prefers-reduced-motion */
  enabled: boolean;

  /** Target element to attach effect to (optional) */
  target?: React.RefObject<HTMLElement>;

  /** Effect intensity level */
  intensity?: 'low' | 'medium' | 'high';

  /** Primary effect color override */
  color?: string;

  /** Callback when effect animation completes */
  onComplete?: () => void;

  /** Additional Tailwind CSS classes */
  className?: string;
}

// ============================================================================
// Shared Utility Types
// ============================================================================

/** Standard loading state for components */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Trend direction for delta indicators */
export type TrendDirection = 'up' | 'down' | 'neutral';

/** Connection status for live data */
export type ConnectionStatus = 'active' | 'paused' | 'disconnected';

/** System health status */
export type HealthStatus = 'healthy' | 'degraded' | 'down';

/** Toast notification variants */
export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

/** Component size variants */
export type ComponentSize = 'sm' | 'md' | 'lg';

/** Responsive breakpoint names */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
