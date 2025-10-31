/**
 * KPICard - Primary metric display card
 *
 * Variants: static, live (with pulsing indicator), delta (with change percentage)
 */

import React from 'react';
import LiveBadge from '../ui/LiveBadge';

const KPICard = ({
  title,
  value,
  subtitle,
  isLive = false,
  delta,
  trend = 'neutral',
  icon,
  loading = false,
  error,
  onClick,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="bg-bg-surface rounded-lg shadow-card p-6 animate-pulse">
        <div className="h-4 bg-border-subtle rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-border-subtle rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-surface rounded-lg shadow-card p-6 border-2 border-error">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-error">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const deltaColor = trend === 'up' ? 'text-success bg-success/10' :
                     trend === 'down' ? 'text-error bg-error/10' :
                     'text-text-secondary bg-border-subtle/10';

  const deltaIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '=';

  const CardContent = () => (
    <>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-text-secondary">{icon}</div>}
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">{title}</h3>
        </div>
        {isLive && <LiveBadge status="active" size="sm" />}
      </div>

      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-bold font-heading text-text-primary tracking-tight" aria-live={isLive ? 'polite' : 'off'} aria-atomic="true">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {delta !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${deltaColor}`}>
            {deltaIcon} {Math.abs(delta)}%
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-sm text-text-tertiary">{subtitle}</p>
      )}
    </>
  );

  const baseClasses = `bg-bg-surface rounded-lg shadow-card p-6 transition-all duration-normal ${
    onClick ? 'hover:shadow-card-hover hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-default' : ''
  } ${className}`;

  if (onClick) {
    return (
      <button
        className={baseClasses}
        onClick={onClick}
        role="article"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={baseClasses} role="article">
      <CardContent />
    </div>
  );
};

export default KPICard;
