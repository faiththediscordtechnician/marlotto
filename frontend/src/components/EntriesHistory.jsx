import React, { useEffect, useState } from 'react';

export default function EntriesHistory({ onBack, refreshTrigger }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingOutcome, setEditingOutcome] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [outcomeFilter, refreshTrigger]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = outcomeFilter ? `?outcome=${outcomeFilter}` : '';
      const response = await fetch(`/api/entries${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEntries(data);
    } catch (err) {
      setError('Failed to load entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOutcome = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: editingOutcome }),
      });

      if (!response.ok) throw new Error('Failed to update outcome');

      setEditingId(null);
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="form-container"><p>Loading entries...</p></div>;
  }

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div className="sweepstakes-list">
        <div className="list-header">
          <h2>📋 Your Submissions</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="list-filters">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Entries</option>
            <option value="pending">Pending</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {entries.length === 0 ? (
          <p className="empty-state">No entries yet. Start submitting to sweepstakes! 🚀</p>
        ) : (
          <div className="sweepstakes-table">
            <table>
              <thead>
                <tr>
                  <th>Sweepstake</th>
                  <th>Submitted</th>
                  <th>Prize</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td><strong>{entry.name}</strong></td>
                    <td>{new Date(entry.submitted_at).toLocaleDateString()}</td>
                    <td>{entry.prize_value ? `$${entry.prize_value}` : '-'}</td>
                    <td>
                      {editingId === entry.id ? (
                        <select
                          value={editingOutcome}
                          onChange={(e) => setEditingOutcome(e.target.value)}
                          className="filter-select"
                          style={{ width: '120px' }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="won">🎉 Won</option>
                          <option value="lost">😞 Lost</option>
                        </select>
                      ) : (
                        <span>
                          {entry.outcome === 'pending' && '⏳ Pending'}
                          {entry.outcome === 'won' && '🎉 Won'}
                          {entry.outcome === 'lost' && '😞 Lost'}
                        </span>
                      )}
                    </td>
                    <td>{entry.time_spent_minutes ? `${entry.time_spent_minutes}m` : '-'}</td>
                    <td>
                      {editingId === entry.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateOutcome(entry.id)}
                            className="btn btn-small"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-small"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditingOutcome(entry.outcome);
                          }}
                          className="btn btn-small"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
