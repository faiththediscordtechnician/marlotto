import React, { useState } from 'react';
import { sweepstakesAPI } from '../api';

export default function ScrapePanel({ onScraped }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastScrape, setLastScrape] = useState(null);

  const handleScrape = async (source) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = source === 'all' ? '/api/scrape/all' : `/api/scrape/${source}`;
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scrape failed');
      }

      setResult(data);
      setLastScrape(new Date().toLocaleTimeString());
      onScraped?.();
    } catch (err) {
      setError(err.message);
      console.error('Scrape error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scrape-panel mac-window">
      <div className="mac-titlebar">
        <div className="mac-buttons">
          <div className="mac-button mac-button-red"></div>
          <div className="mac-button mac-button-yellow"></div>
          <div className="mac-button mac-button-green"></div>
        </div>
        <div className="mac-title">🔍 Discovery Engine</div>
      </div>

      <div className="mac-content">
        <div className="scrape-header">
          <h2>Find New Sweepstakes</h2>
          <div className="scrape-buttons">
            <button
              onClick={() => handleScrape('reddit')}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '⏳ Scraping...' : '🔴 Reddit Now'}
            </button>
            <button
              onClick={() => handleScrape('twitter')}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '⏳ Scraping...' : '🐦 Twitter Now'}
            </button>
            <button
              onClick={() => handleScrape('all')}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '⏳ Scanning...' : '🚀 Scan All'}
            </button>
          </div>
        </div>

        {result && (
          <div className="alert alert-success">
            ✨ Success! Found {result.total_added || result.reddit?.added || 0} new sweepstakes
            {lastScrape && <br />}
            {lastScrape && <small>Last scan: {lastScrape}</small>}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {lastScrape && !result && (
          <p className="scrape-status">Last scan: {lastScrape}</p>
        )}
      </div>
    </div>
  );
}
