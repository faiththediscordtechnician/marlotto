import React, { useState } from 'react';
import EntryForm from './EntryForm';

export default function SweepstakeDetail({ sweepstake, onBack, onUpdated }) {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleEntryFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sweepstake_id: sweepstake.id,
          time_spent_minutes: formData.timeSpentMinutes,
          notes: formData.notes || null,
          address_used: formData.addressUsed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit entry');
      }

      setSubmitted(true);
      setTimeout(() => {
        onUpdated?.();
        onBack();
      }, 1500);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="sweepstake-detail">
        <div className="alert alert-success">
          🎉 Entry submitted! Good luck!
        </div>
      </div>
    );
  }

  if (showEntryForm) {
    return (
      <EntryForm
        sweepstake={sweepstake}
        onSubmit={handleEntryFormSubmit}
        onCancel={() => setShowEntryForm(false)}
      />
    );
  }

  return (
    <div className="sweepstake-detail mac-window">
      <div className="mac-titlebar">
        <div className="mac-buttons">
          <div className="mac-button mac-button-red"></div>
          <div className="mac-button mac-button-yellow"></div>
          <div className="mac-button mac-button-green"></div>
        </div>
        <div className="mac-title">{sweepstake.name}</div>
      </div>

      <div className="mac-content">
        <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
          ← Back
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="detail-header">
          <h2>{sweepstake.name}</h2>
        </div>

        <div className="detail-section">
          <h3>📅 Deadline</h3>
          <p>{new Date(sweepstake.deadline).toLocaleDateString()} {new Date(sweepstake.deadline).toLocaleTimeString()}</p>
        </div>

        <div className="detail-section">
          <h3>💰 Prize Value</h3>
          <p>{sweepstake.prize_value ? `$${sweepstake.prize_value.toLocaleString()}` : 'Not specified'}</p>
        </div>

        <div className="detail-section">
          <h3>ℹ️ Details</h3>
          <p><strong>Source:</strong> {sweepstake.source}</p>
          <p><strong>Entry Type:</strong> {sweepstake.entry_type || 'Unknown'}</p>
          <p><strong>Difficulty:</strong> {'⭐'.repeat(sweepstake.difficulty_score || 5)}</p>
          <p><strong>Requires Social:</strong> {sweepstake.requires_social ? '✅ Yes' : '❌ No'}</p>
        </div>

        {sweepstake.instructions && (
          <div className="detail-section">
            <h3>📝 Instructions</h3>
            <div className="instructions-box">
              {sweepstake.instructions}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>🔗 Entry Link</h3>
          <p>
            <a href={sweepstake.entry_url || sweepstake.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--hot-pink)' }}>
              {sweepstake.entry_url || sweepstake.url}
            </a>
          </p>
        </div>

        <div className="form-actions">
          <button
            onClick={() => setShowEntryForm(true)}
            disabled={loading}
            className="btn-primary"
            style={{ fontSize: '1rem' }}
          >
            {loading ? '⏳ Processing...' : '✍️ Fill & Submit'}
          </button>
          <button onClick={onBack} disabled={loading} className="btn">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
