import React, { useEffect, useState } from 'react';
import { sweepstakesAPI } from '../api';

export default function SweepstakesList({
  onSelectSweepstake,
  onAddNew,
  refreshTrigger,
}) {
  const [sweepstakes, setSweepstakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSweepstakes = async () => {
    try {
      setLoading(true);
      const data = await sweepstakesAPI.getAll({
        status: statusFilter || undefined,
        sortBy: sortBy,
      });
      setSweepstakes(data);
    } catch (err) {
      setError('Failed to load sweepstakes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweepstakes();
  }, [statusFilter, sortBy, refreshTrigger]);

  const filteredSweepstakes = sweepstakes.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isDeadlineSoon = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.ceil(
      (deadlineDate - now) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 7 && daysUntil >= 0;
  };

  if (loading) return <div className="sweepstakes-list">Loading...</div>;
  if (error) return <div className="sweepstakes-list error">{error}</div>;

  return (
    <div className="sweepstakes-list">
      <div className="list-header">
        <h2>Sweepstakes</h2>
        <button onClick={onAddNew} className="btn btn-primary">
          + Add New
        </button>
      </div>

      <div className="list-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="started">Started</option>
          <option value="mailed">Mailed</option>
          <option value="saved">Saved</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="prize">Sort by Prize Value</option>
          <option value="added">Sort by Date Added</option>
        </select>
      </div>

      {filteredSweepstakes.length === 0 ? (
        <p className="empty-state">No sweepstakes found</p>
      ) : (
        <div className="sweepstakes-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Deadline</th>
                <th>Prize</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSweepstakes.map((s) => (
                <tr
                  key={s.id}
                  className={isDeadlineSoon(s.deadline) ? 'deadline-soon' : ''}
                >
                  <td>{s.name}</td>
                  <td>{new Date(s.deadline).toLocaleDateString()}</td>
                  <td>{s.prize_value ? `$${s.prize_value}` : '-'}</td>
                  <td className={`status status-${s.status}`}>{s.status}</td>
                  <td>
                    <button
                      onClick={() => onSelectSweepstake(s)}
                      className="btn btn-small"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
