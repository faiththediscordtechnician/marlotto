import React, { useEffect, useState } from 'react';

export default function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [sourceStats, setSourceStats] = useState([]);
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllStats();
  }, [refreshTrigger]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [statsRes, sourceRes, roiRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/stats/by-source'),
        fetch('/api/stats/roi'),
      ]);

      const statsData = await statsRes.json();
      const sourceData = await sourceRes.json();
      const roiData = await roiRes.json();

      if (!statsRes.ok) throw new Error(statsData.error);
      if (!sourceRes.ok) throw new Error(sourceData.error);
      if (!roiRes.ok) throw new Error(roiData.error);

      setStats(statsData);
      setSourceStats(sourceData);
      setRoi(roiData);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard"><p>Loading stats...</p></div>;
  if (error) return <div className="dashboard alert alert-error">⚠️ {error}</div>;
  if (!stats) return <div className="dashboard"><p>No stats available</p></div>;

  return (
    <div className="dashboard">
      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🎯 Available</h3>
          <p className="stat-value">{stats.total_sweepstakes_available}</p>
          <p className="stat-subtitle">sweepstakes in database</p>
        </div>

        <div className="stat-card">
          <h3>✍️ Submitted</h3>
          <p className="stat-value">{stats.total_submitted}</p>
          <p className="stat-subtitle">total entries</p>
        </div>

        <div className="stat-card">
          <h3>⏳ Pending</h3>
          <p className="stat-value">{stats.pending_outcomes}</p>
          <p className="stat-subtitle">awaiting results</p>
        </div>

        <div className="stat-card">
          <h3>🎉 Wins</h3>
          <p className="stat-value">{stats.wins_count}</p>
          <p className="stat-subtitle">all-time</p>
        </div>

        <div className="stat-card highlight">
          <h3>📊 Win Rate</h3>
          <p className="stat-value" style={{ color: 'var(--hot-pink)' }}>
            {stats.win_rate_percent}%
          </p>
          <p className="stat-subtitle">success rate</p>
        </div>

        <div className="stat-card highlight">
          <h3>💰 Prize Value</h3>
          <p className="stat-value" style={{ color: 'var(--hot-pink)' }}>
            ${stats.total_prize_value_won}
          </p>
          <p className="stat-subtitle">won so far</p>
        </div>

        <div className="stat-card">
          <h3>⏱️ Avg Time</h3>
          <p className="stat-value">{stats.avg_time_per_entry_minutes.toFixed(1)}m</p>
          <p className="stat-subtitle">per entry</p>
        </div>

        <div className="stat-card">
          <h3>📈 This Week</h3>
          <p className="stat-value">{stats.submissions_this_week}</p>
          <p className="stat-subtitle">submissions</p>
        </div>
      </div>

      {/* ROI Section */}
      {roi && (
        <div className="roi-section mac-window">
          <div className="mac-titlebar">
            <div className="mac-buttons">
              <div className="mac-button mac-button-red"></div>
              <div className="mac-button mac-button-yellow"></div>
              <div className="mac-button mac-button-green"></div>
            </div>
            <div className="mac-title">💹 Return on Investment</div>
          </div>
          <div className="mac-content">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <div>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  🏆 ROI PER HOUR
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--hot-pink)', margin: '0' }}>
                  ${roi.roi_per_hour}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  ⚙️ ROI PER MINUTE
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0' }}>
                  ${roi.roi_per_minute}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  ⏲️ TIME INVESTED
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0' }}>
                  {roi.total_hours_invested}h
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  💵 TOTAL WON
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--hot-pink)', margin: '0' }}>
                  ${roi.total_prize_value}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Breakdown */}
      {sourceStats.length > 0 && (
        <div className="source-section mac-window">
          <div className="mac-titlebar">
            <div className="mac-buttons">
              <div className="mac-button mac-button-red"></div>
              <div className="mac-button mac-button-yellow"></div>
              <div className="mac-button mac-button-green"></div>
            </div>
            <div className="mac-title">📊 Performance by Source</div>
          </div>
          <div className="mac-content">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Source</th>
                  <th style={{ textAlign: 'center' }}>Submissions</th>
                  <th style={{ textAlign: 'center' }}>Wins</th>
                  <th style={{ textAlign: 'center' }}>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {sourceStats.map((source) => {
                  const winRate = source.submissions > 0
                    ? ((source.wins / source.submissions) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={source.source}>
                      <td>
                        {source.source === 'reddit' && '🔴'} {source.source}
                      </td>
                      <td style={{ textAlign: 'center' }}>{source.submissions}</td>
                      <td style={{ textAlign: 'center' }}>{source.wins}</td>
                      <td style={{ textAlign: 'center' }}>
                        <strong>{winRate}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="insights-section">
        <h3 style={{ marginBottom: '1rem' }}>💡 Quick Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {roi && parseFloat(roi.roi_per_hour) > 50 && (
            <div className="insight-card" style={{ borderLeft: '4px solid var(--hot-pink)' }}>
              <p>🚀 Excellent ROI! You're earning ${roi.roi_per_hour} per hour of effort.</p>
            </div>
          )}
          {stats.pending_outcomes > 10 && (
            <div className="insight-card" style={{ borderLeft: '4px solid var(--accent-peach)' }}>
              <p>📬 You have {stats.pending_outcomes} pending outcomes. Check back soon!</p>
            </div>
          )}
          {stats.win_rate_percent > 10 && (
            <div className="insight-card" style={{ borderLeft: '4px solid var(--accent-mint)' }}>
              <p>✨ Win rate is {stats.win_rate_percent}%! Keep up the momentum!</p>
            </div>
          )}
          {stats.submissions_this_week > 20 && (
            <div className="insight-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
              <p>⚡ {stats.submissions_this_week} submissions this week! You're on fire! 🔥</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
