import React, { useEffect, useState } from 'react';

export default function SweepstakesList({
  onSelectSweepstake,
  refreshTrigger,
}) {
  const [sweepstakes, setSweepstakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [search, setSearch] = useState('');
  const [minPrize, setMinPrize] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    fetchSweepstakes();
  }, [source, sortBy, refreshTrigger]);

  const fetchSweepstakes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (source) params.append('source', source);
      if (sortBy) params.append('sortBy', sortBy);
      if (minPrize) params.append('minPrize', minPrize);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await fetch(`/api/sweepstakes?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSweepstakes(data);
    } catch (err) {
      setError('Failed to load sweepstakes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSweepstakes = sweepstakes.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const isDeadlineSoon = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3 && daysUntil >= 0;
  };

  if (loading) return <div className="sweepstakes-list"><p>Loading sweepstakes...</p></div>;
  if (error) return <div className="sweepstakes-list alert alert-error">{error}</div>;

  return (
    <div className="sweepstakes-list">
      <div className="list-header">
        <h2>🎁 Available Sweepstakes</h2>
      </div>

      <div className="list-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="filter-select"
        >
          <option value="">All Sources</option>
          <option value="reddit">Reddit</option>
          <option value="twitter">Twitter</option>
          <option value="manual">Manual</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="filter-select"
        >
          <option value="">Any Difficulty</option>
          <option value="3">Easy (1-3)</option>
          <option value="7">Medium (4-7)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="prize">Sort by Prize</option>
          <option value="difficulty">Sort by Difficulty</option>
        </select>

        <input
          type="number"
          placeholder="Min prize value"
          value={minPrize}
          onChange={(e) => setMinPrize(e.target.value)}
          className="filter-select"
          min="0"
        />
      </div>

      {filteredSweepstakes.length === 0 ? (
        <p className="empty-state">No sweepstakes found. Time to scrape! 🔍</p>
      ) : (
        <div className="sweepstakes-table">
          <table>
            <thead>
              <tr>
                <th>Sweepstake</th>
                <th>Deadline</th>
                <th>Prize</th>
                <th>Source</th>
                <th>Difficulty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSweepstakes.map((s) => (
                <tr
                  key={s.id}
                  className={isDeadlineSoon(s.deadline) ? 'deadline-soon' : ''}
                >
                  <td><strong>{s.name}</strong></td>
                  <td>{new Date(s.deadline).toLocaleDateString()}</td>
                  <td>{s.prize_value ? `$${s.prize_value}` : '-'}</td>
                  <td>
                    {s.source === 'reddit' && '🔴'}
                    {s.source === 'twitter' && '🐦'}
                    {s.source === 'manual' && '✏️'}
                    {' '}{s.source}
                  </td>
                  <td>{'⭐'.repeat(s.difficulty_score || 5) || '-'}</td>
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
