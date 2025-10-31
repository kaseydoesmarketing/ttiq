/**
 * TitleIQ Admin Dashboard v2 - Main Page
 *
 * Real-time metrics, user management, and entitlement controls
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/admin/KPICard';
import LiveBadge from '../components/ui/LiveBadge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [system, setSystem] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveStatus, setLiveStatus] = useState('disconnected');
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);
  const [toast, setToast] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://titleiq.tightslice.com';
  const token = localStorage.getItem('titleiq_token');

  // Check query param for viz mode
  const urlParams = new URLSearchParams(window.location.search);
  const vizMode = urlParams.get('viz') === '1';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
    fetchActiveUsers();

    // Setup SSE connection for live data
    const eventSource = new EventSource(`${API_BASE}/api/admin/live`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    eventSource.onopen = () => {
      setLiveStatus('active');
      console.log('[AdminDashboard] SSE connected');
    };

    eventSource.addEventListener('active_users', (e) => {
      const data = JSON.parse(e.data);
      setOverview(prev => ({ ...prev, activeNow: data.count }));
      setLastLiveUpdate(new Date());
      setLiveStatus('active');
    });

    eventSource.addEventListener('performance_tick', (e) => {
      const data = JSON.parse(e.data);
      setPerformance(prev => ({ ...prev, avgResponseMs: data.avgResponseMs, errorRatePct: data.errorRatePct }));
    });

    eventSource.addEventListener('system_status', (e) => {
      const data = JSON.parse(e.data);
      setSystem(prev => ({ ...prev, api: data.api, db: data.db, refreshedAt: data.timestamp }));
    });

    eventSource.onerror = (err) => {
      console.error('[AdminDashboard] SSE error:', err);
      setLiveStatus('disconnected');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [token, navigate]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
        setPerformance(data.performance);
        setSystem(data.system);
      } else {
        setError(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/active?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        setActiveUsers(data.users);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching users:', err);
    }
  };

  const handleGrantProLifetime = async (userId, email) => {
    const notes = prompt(`Grant Pro Lifetime to ${email}?\n\nEnter notes (optional):`);
    if (notes === null) return; // User cancelled

    try {
      const res = await fetch(`${API_BASE}/api/admin/grants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          label: 'Pro — Lifetime',
          source: 'beta_comp',
          notes: notes || 'Admin grant'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Pro Lifetime granted to ${email}!`, 'success');
        fetchActiveUsers(); // Refresh table
      } else {
        showToast(data.error || 'Failed to grant access', 'error');
      }
    } catch (err) {
      console.error('[AdminDashboard] Grant error:', err);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleRevokeProLifetime = async (userId, email) => {
    if (!confirm(`Revoke Pro Lifetime from ${email}?\n\nThis action cannot be undone.`)) {
      return;
    }

    // Note: We need grant_id, not user_id. For simplicity, we'll fetch grants first
    try {
      const grantsRes = await fetch(`${API_BASE}/api/admin/grants?user_id=${userId}&active=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const grantsData = await grantsRes.json();
      if (!grantsData.success || grantsData.grants.length === 0) {
        showToast('No active grant found for this user', 'error');
        return;
      }

      const grantId = grantsData.grants[0].id;

      const res = await fetch(`${API_BASE}/api/admin/grants/${grantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Pro Lifetime revoked from ${email}`, 'success');
        fetchActiveUsers(); // Refresh table
      } else {
        showToast(data.error || 'Failed to revoke access', 'error');
      }
    } catch (err) {
      console.error('[AdminDashboard] Revoke error:', err);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const showToast = (message, variant) => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-default flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-default flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-bg-surface rounded-lg shadow-card border-2 border-error">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-default">
      {/* Header */}
      {vizMode && (
        <header className="bg-gradient-to-r from-primary via-secondary to-primary bg-bg-surface border-b border-border-subtle px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold font-heading text-text-primary">TitleIQ Admin v2</h1>
              <LiveBadge status={liveStatus} lastUpdate={lastLiveUpdate} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">Gamified Dashboard</span>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* KPI Rail */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Users"
            value={overview?.totalUsers || 0}
            icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
          />
          <KPICard
            title="Active Now"
            value={overview?.activeNow || 0}
            isLive={liveStatus === 'active'}
            icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}
          />
          <KPICard
            title="Total Generations"
            value={overview?.totalTitleGenerations || 0}
            delta={12.5}
            trend="up"
          />
          <KPICard
            title="Generations (24h)"
            value={overview?.titleGenerations24h || 0}
          />
        </div>

        {/* Performance Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Requests (24h)"
            value={performance?.requestsTotal24h || 0}
          />
          <KPICard
            title="Avg Response"
            value={`${performance?.avgResponseMs || 0}ms`}
          />
          <KPICard
            title="Error Rate"
            value={`${performance?.errorRatePct || 0}%`}
            trend={performance?.errorRatePct > 1 ? 'up' : 'neutral'}
          />
        </div>

        {/* System Status */}
        <div className="bg-bg-surface rounded-lg shadow-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <SystemStatusDot status={system?.api || 'green'} label="API" />
              <SystemStatusDot status={system?.db || 'green'} label="Database" />
            </div>
            <span className="text-xs text-text-tertiary">
              Refreshed at {system?.refreshedAt ? new Date(system.refreshedAt).toLocaleTimeString() : '--:--:--'}
            </span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-bg-surface rounded-lg shadow-card p-6 mb-8">
          <h2 className="text-2xl font-semibold font-heading mb-4 text-text-primary">Live Users</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-subtle">
              <thead className="bg-bg-elevated">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Last Seen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Titles Today</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Models Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Grant Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-bg-surface divide-y divide-border-subtle">
                {activeUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-bg-elevated transition-colors duration-fast">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatTimeAgo(user.last_seen_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {user.titles_generated_today}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.models_used.slice(0, 3).map((m, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                            {m.model} ({m.count})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.has_grant ? (
                        <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                          Pro Lifetime
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-border-subtle/10 text-text-tertiary rounded-full">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.has_grant ? (
                        <button
                          onClick={() => handleRevokeProLifetime(user.user_id, user.email)}
                          className="text-error hover:text-error/80 font-medium transition"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGrantProLifetime(user.user_id, user.email)}
                          className="text-primary hover:text-primary/80 font-medium transition"
                        >
                          Grant Pro
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {activeUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-text-tertiary">No active users found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

// Helper Components
const SystemStatusDot = ({ status, label }) => {
  const colors = {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-error'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${colors[status] || colors.green}`} />
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </div>
  );
};

const Toast = ({ message, variant, onClose }) => {
  const variantStyles = {
    success: 'border-success bg-success/10 text-success',
    error: 'border-error bg-error/10 text-error',
    info: 'border-primary bg-primary/10 text-primary',
    warning: 'border-warning bg-warning/10 text-warning'
  };

  return (
    <div className={`min-w-[320px] max-w-md bg-bg-surface border-l-4 rounded-lg shadow-pop p-4 flex items-start gap-3 ${variantStyles[variant]}`}>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Helper Functions
function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default AdminDashboard;
