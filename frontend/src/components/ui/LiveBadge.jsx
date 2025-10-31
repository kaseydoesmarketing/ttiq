/**
 * LiveBadge - Pulsating indicator for real-time data streams
 *
 * States: active (pulsing cyan), paused (gray), disconnected (red)
 */

import React from 'react';
import { colors } from '../../tokens/design-tokens';

const LiveBadge = ({
  status = 'active',
  label,
  size = 'md',
  showLabel = true,
  lastUpdate,
  className = ''
}) => {
  const statusConfig = {
    active: {
      color: colors.accent_primary,
      text: label || 'LIVE',
      dotClass: 'bg-primary animate-ping',
      staticDotClass: 'bg-primary',
      textClass: 'text-primary'
    },
    paused: {
      color: colors.text_tertiary,
      text: lastUpdate ? `Updated ${getTimeAgo(lastUpdate)}` : 'Paused',
      dotClass: 'bg-text-tertiary',
      staticDotClass: 'bg-text-tertiary opacity-50',
      textClass: 'text-text-tertiary'
    },
    disconnected: {
      color: colors.accent_error,
      text: label || 'Disconnected',
      dotClass: 'bg-error',
      staticDotClass: 'bg-error',
      textClass: 'text-error'
    }
  };

  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const dotSize = sizeClasses[size];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-label={`Connection status: ${status}`}
      aria-live="polite"
    >
      <span className={`relative flex ${dotSize}`}>
        {status === 'active' && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.dotClass} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${config.staticDotClass}`} />
      </span>

      {showLabel && (
        <span className={`text-xs font-medium uppercase tracking-wide ${config.textClass}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default LiveBadge;
