import React, { useState } from 'react';
import { sweepstakesAPI } from '../api';

export default function SweepstakeDetail({ sweepstake, onBack, onUpdated }) {
  const [notes, setNotes] = useState(sweepstake.notes || '');
  const [status, setStatus] = useState(sweepstake.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'mailed') {
      const confirmed = window.confirm(
        'Are you sure? This marks the sweepstake as mailed.'
      );
      if (!confirmed) return;
    }

    try {
      setLoading(true);
      const updated = await sweepstakesAPI.update(sweepstake.id, {
        status: newStatus,
      });
      setStatus(updated.status);
      onUpdated();
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      await sweepstakesAPI.update(sweepstake.id, { notes });
      setError(null);
    } catch (err) {
      setError('Failed to save notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await sweepstakesAPI.delete(sweepstake.id);
      onUpdated();
      onBack();
    } catch (err) {
      setError('Failed to delete sweepstake');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sweepstake-detail">
      <button onClick={onBack} className="btn btn-back">
        ← Back
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-header">
        <h2>{sweepstake.name}</h2>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-danger"
          disabled={loading}
        >
          Delete
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this sweepstake?</p>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={loading}
          >
            Confirm Delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="btn"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="detail-section">
        <h3>Prize Value</h3>
        <p>
          {sweepstake.prize_value
            ? `$${sweepstake.prize_value}`
            : 'Not specified'}
        </p>
      </div>

      <div className="detail-section">
        <h3>Deadline</h3>
        <p>{new Date(sweepstake.deadline).toLocaleDateString()}</p>
      </div>

      <div className="detail-section">
        <h3>Mailing Address</h3>
        {sweepstake.mail_address_street ? (
          <address>
            {sweepstake.mail_address_street}
            <br />
            {sweepstake.mail_address_city}, {sweepstake.mail_address_state}{' '}
            {sweepstake.mail_address_zip}
          </address>
        ) : (
          <p>No mailing address provided</p>
        )}
      </div>

      <div className="detail-section">
        <h3>Entry Instructions</h3>
        <div className="instructions-box">
          {sweepstake.instructions || 'No instructions provided'}
        </div>
      </div>

      <div className="detail-section">
        <h3>Status</h3>
        <div className="status-controls">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="status-select"
          >
            <option value="not_started">Not Started</option>
            <option value="started">Started</option>
            <option value="mailed">Mailed</option>
            <option value="saved">Saved</option>
          </select>
          <p className="status-updated">
            Last updated:{' '}
            {new Date(sweepstake.status_updated_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="detail-section">
        <h3>Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any personal notes about this sweepstake..."
          disabled={loading}
          className="notes-textarea"
        />
        <button
          onClick={handleSaveNotes}
          disabled={loading}
          className="btn btn-primary"
        >
          Save Notes
        </button>
      </div>

      <div className="detail-section metadata">
        <p>Added: {new Date(sweepstake.date_added).toLocaleString()}</p>
      </div>
    </div>
  );
}
