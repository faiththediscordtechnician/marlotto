import React, { useEffect, useState } from 'react';
import { sweepstakesAPI } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await sweepstakesAPI.getDashboard();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="dashboard">Loading...</div>;
  if (error) return <div className="dashboard error">{error}</div>;
  if (!stats) return <div className="dashboard">No data</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sweepstakes</h3>
          <p className="stat-value">{stats.total}</p>
        </div>

        <div className="stat-card">
          <h3>Deadlines in 7 Days</h3>
          <p className="stat-value">{stats.upcomingDeadlines}</p>
        </div>

        <div className="stat-card">
          <h3>Total Prize Value</h3>
          <p className="stat-value">${stats.totalPrizeValue?.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h3>Status Breakdown</h3>
          <ul className="status-list">
            <li>Not Started: {stats.statusCounts?.not_started || 0}</li>
            <li>Started: {stats.statusCounts?.started || 0}</li>
            <li>Mailed: {stats.statusCounts?.mailed || 0}</li>
            <li>Saved: {stats.statusCounts?.saved || 0}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
