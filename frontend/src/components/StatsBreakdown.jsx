import React, { useEffect, useState } from 'react';

export default function StatsBreakdown({ onBack }) {
  const [stats, setStats] = useState(null);
  const [sourceStats, setSourceStats] = useState([]);
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
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

      setStats(statsData);
      setSourceStats(sourceData);
      setRoi(roiData);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="form-container"><p>Loading analytics...</p></div>;
  if (error) return <div className="form-container alert alert-error">⚠️ {error}</div>;

  const totalOutcomes = stats.wins_count + (stats.total_submitted - stats.pending_outcomes - stats.wins_count);
  const lostCount = stats.total_submitted - stats.pending_outcomes - stats.wins_count;

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      {/* Win Rate Breakdown */}
      <div className="mac-window" style={{ marginBottom: '2rem' }}>
        <div className="mac-titlebar">
          <div className="mac-buttons">
            <div className="mac-button mac-button-red"></div>
            <div className="mac-button mac-button-yellow"></div>
            <div className="mac-button mac-button-green"></div>
          </div>
          <div className="mac-title">📊 Entry Outcomes</div>
        </div>
        <div className="mac-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0', color: 'var(--hot-pink)' }}>🎉</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--hot-pink)', margin: '0.5rem 0 0 0' }}>
                {stats.wins_count}
              </p>
              <p style={{ color: 'var(--gray)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                {stats.total_submitted > 0 ? ((stats.wins_count / stats.total_submitted) * 100).toFixed(1) : 0}% Won
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0', color: 'var(--accent-peach)' }}>😞</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0.5rem 0 0 0' }}>
                {lostCount}
              </p>
              <p style={{ color: 'var(--gray)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                {stats.total_submitted > 0 ? ((lostCount / stats.total_submitted) * 100).toFixed(1) : 0}% Lost
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0', color: 'var(--accent-blue)' }}>⏳</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0.5rem 0 0 0' }}>
                {stats.pending_outcomes}
              </p>
              <p style={{ color: 'var(--gray)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                {stats.total_submitted > 0 ? ((stats.pending_outcomes / stats.total_submitted) * 100).toFixed(1) : 0}% Pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Deep Dive */}
      {roi && (
        <div className="mac-window" style={{ marginBottom: '2rem' }}>
          <div className="mac-titlebar">
            <div className="mac-buttons">
              <div className="mac-button mac-button-red"></div>
              <div className="mac-button mac-button-yellow"></div>
              <div className="mac-button mac-button-green"></div>
            </div>
            <div className="mac-title">💹 ROI Analysis</div>
          </div>
          <div className="mac-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--darker-pink)' }}>Efficiency Metrics</h3>
              <div style={{ background: 'var(--light-gray)', padding: '1.5rem', borderRadius: '4px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray)', fontSize: '0.9rem' }}>
                    💵 Total Prize Value Won
                  </p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--hot-pink)', margin: '0' }}>
                    ${roi.total_prize_value}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray)', fontSize: '0.9rem' }}>
                    ⏲️ Total Time Invested
                  </p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0' }}>
                    {roi.total_hours_invested} hours ({Math.round(parseFloat(roi.total_hours_invested) * 60)} minutes)
                  </p>
                </div>

                <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    🚀 BEST ROI METRIC
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--hot-pink)', margin: '0' }}>
                    ${roi.roi_per_hour} per hour
                  </p>
                  <p style={{ fontSize: '1rem', color: 'var(--gray)', margin: '0.5rem 0 0 0' }}>
                    (${roi.roi_per_minute} per minute)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--darker-pink)' }}>💡 What This Means</h3>
              <ul style={{ color: 'var(--text-dark)', lineHeight: '1.8' }}>
                <li>You earn <strong>${roi.roi_per_hour}</strong> for every hour spent on sweepstakes</li>
                <li>At this rate, 10 hours of effort yields <strong>${(roi.roi_per_hour * 10).toFixed(0)}</strong> in prize value</li>
                <li>Your win rate of <strong>{stats.win_rate_percent}%</strong> is {'above' || 'below'} industry average (~2%)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Source Performance */}
      {sourceStats.length > 0 && (
        <div className="mac-window" style={{ marginBottom: '2rem' }}>
          <div className="mac-titlebar">
            <div className="mac-buttons">
              <div className="mac-button mac-button-red"></div>
              <div className="mac-button mac-button-yellow"></div>
              <div className="mac-button mac-button-green"></div>
            </div>
            <div className="mac-title">🔍 Best Performing Sources</div>
          </div>
          <div className="mac-content">
            {sourceStats.map((source, idx) => {
              const winRate = source.submissions > 0
                ? ((source.wins / source.submissions) * 100).toFixed(1)
                : 0;
              const isTopSource = idx === 0;

              return (
                <div
                  key={source.source}
                  style={{
                    background: isTopSource ? 'linear-gradient(135deg, #FFE4E1 0%, #FFD1DC 100%)' : 'var(--light-gray)',
                    padding: '1.5rem',
                    borderRadius: '4px',
                    marginBottom: idx < sourceStats.length - 1 ? '1rem' : '0',
                    border: isTopSource ? '2px solid var(--hot-pink)' : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: '0', color: 'var(--darker-pink)' }}>
                      {source.source === 'reddit' && '🔴'} {source.source.charAt(0).toUpperCase() + source.source.slice(1)}
                      {isTopSource && ' 🏆'}
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', color: 'var(--gray)' }}>Submissions</p>
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0' }}>
                        {source.submissions}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', color: 'var(--gray)' }}>Wins</p>
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--hot-pink)', margin: '0' }}>
                        {source.wins}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', color: 'var(--gray)' }}>Win Rate</p>
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--darker-pink)', margin: '0' }}>
                        {winRate}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mac-window">
        <div className="mac-titlebar">
          <div className="mac-buttons">
            <div className="mac-button mac-button-red"></div>
            <div className="mac-button mac-button-yellow"></div>
            <div className="mac-button mac-button-green"></div>
          </div>
          <div className="mac-title">🎯 Recommendations</div>
        </div>
        <div className="mac-content">
          <ul style={{ color: 'var(--text-dark)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            {sourceStats.length > 0 && sourceStats[0].source && (
              <li>Focus on <strong>{sourceStats[0].source}</strong> — it has the best win rate</li>
            )}
            {stats.avg_time_per_entry_minutes > 15 && (
              <li>You're spending {stats.avg_time_per_entry_minutes.toFixed(0)}m per entry. Try to speed up to boost ROI</li>
            )}
            {stats.pending_outcomes > stats.wins_count && (
              <li>You have {stats.pending_outcomes} pending results. Keep submitting while you wait!</li>
            )}
            {stats.total_submitted < 50 && (
              <li>You need more data. Aim for 50+ submissions to get reliable ROI metrics</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
