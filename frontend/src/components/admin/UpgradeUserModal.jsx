import { useState } from 'react';

export default function UpgradeUserModal({ user, open, onClose, onSuccess }) {
  const [plan, setPlan] = useState('creator_pro');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${user.id}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('titleiq_token')}`
        },
        body: JSON.stringify({ plan, reason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upgrade failed');
      }

      onSuccess(`User upgraded to ${plan}`);
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Upgrade User</h2>
        <p className="text-gray-300 mb-4">User: <span className="text-purple-400 font-medium">{user.email}</span></p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="creator">Creator ($19/mo)</option>
              <option value="creator_pro">Creator Pro ($49/mo)</option>
              <option value="pro_lifetime">Pro Lifetime ($299)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reason *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Beta tester reward, exceptional usage"
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Upgrading...' : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}
