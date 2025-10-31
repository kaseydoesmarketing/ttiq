import { useState } from 'react';

export default function RestoreAccountModal({ user, open, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${user.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('titleiq_token')}`
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Restoration failed');
      }

      onSuccess('Account restored');
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
        <h2 className="text-2xl font-bold text-white mb-4">✅ Restore Account</h2>
        <p className="text-gray-300 mb-4">User: <span className="text-green-400 font-medium">{user.email}</span></p>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
          <p className="text-green-300 text-sm">
            This will restore full access to TitleIQ. The user will be able to log in and use all features according to their plan.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Issue resolved, payment cleared, user apologized"
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
            onClick={handleRestore}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Restoring...' : 'Restore Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
