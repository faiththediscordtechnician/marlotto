import React, { useEffect, useState } from 'react';

export default function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setStats(data);
      } catch (err) {
        setError('Failed to load stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  if (loading) return <div className="dashboard"><p>Loading stats...</p></div>;
  if (error) return <div className="dashboard alert alert-error">{error}</div>;
  if (!stats) return <div className="dashboard"><p>No stats available</p></div>;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🎯 Available</h3>
          <p className="stat-value">{stats.total_sweepstakes_available}</p>
        </div>

        <div className="stat-card">
          <h3>✍️ Submitted</h3>
          <p className="stat-value">{stats.total_submitted}</p>
        </div>

        <div className="stat-card">
          <h3>⏳ Pending</h3>
          <p className="stat-value">{stats.pending_outcomes}</p>
        </div>

        <div className="stat-card">
          <h3>🎉 Wins</h3>
          <p className="stat-value">{stats.wins_count}</p>
        </div>

        <div className="stat-card">
          <h3>📊 Win Rate</h3>
          <p className="stat-value">{stats.win_rate_percent}%</p>
        </div>

        <div className="stat-card">
          <h3>💰 Prize Value</h3>
          <p className="stat-value">${stats.total_prize_value_won}</p>
        </div>

        <div className="stat-card">
          <h3>⏱️ Avg Time</h3>
          <p className="stat-value">{stats.avg_time_per_entry_minutes.toFixed(1)}m</p>
        </div>

        <div className="stat-card">
          <h3>📈 This Week</h3>
          <p className="stat-value">{stats.submissions_this_week}</p>
        </div>
      </div>
    </div>
  );
}
