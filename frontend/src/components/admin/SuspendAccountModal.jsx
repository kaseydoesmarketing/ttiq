import { useState } from 'react';

export default function SuspendAccountModal({ user, open, onClose, onSuccess }) {
  const [reason, setReason] = useState('policy_violation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuspend = async () => {
    if (!notes.trim()) {
      alert('Please provide notes explaining the suspension');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('titleiq_token')}`
        },
        body: JSON.stringify({ reason, notes })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Suspension failed');
      }

      onSuccess('Account suspended');
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
        <h2 className="text-2xl font-bold text-white mb-4">⚠️ Suspend Account</h2>
        <p className="text-gray-300 mb-4">User: <span className="text-red-400 font-medium">{user.email}</span></p>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">
            This action will immediately prevent the user from accessing TitleIQ. They will be logged out and cannot log back in until restored.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="policy_violation">Policy Violation</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="user_request">User Request</option>
              <option value="abuse">Abuse / Spam</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain the reason for suspension..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
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
            onClick={handleSuspend}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Suspending...' : 'Suspend Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
