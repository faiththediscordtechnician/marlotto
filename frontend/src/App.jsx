import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ScrapePanel from './components/ScrapePanel';
import SweepstakesList from './components/SweepstakesList';
import SweepstakeDetail from './components/SweepstakeDetail';
import EntriesHistory from './components/EntriesHistory';
import UserSettings from './components/UserSettings';
import StatsBreakdown from './components/StatsBreakdown';
import './App.css';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [selectedSweepstake, setSelectedSweepstake] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectSweepstake = (sweepstake) => {
    setSelectedSweepstake(sweepstake);
    setView('detail');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedSweepstake(null);
  };

  const handleScraped = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setView('dashboard');
    setSelectedSweepstake(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎁 Marlotto</h1>
        <p>Digital Sweepstakes Engine</p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          🎯 Sweepstakes
        </button>
        <button
          className={`nav-btn ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          📋 History
        </button>
        <button
          className={`nav-btn ${view === 'analytics' ? 'active' : ''}`}
          onClick={() => setView('analytics')}
        >
          💹 Analytics
        </button>
        <button
          className={`nav-btn ${view === 'settings' ? 'active' : ''}`}
          onClick={() => setView('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="app-main">
        {view === 'dashboard' && (
          <>
            <ScrapePanel onScraped={handleScraped} />
            <Dashboard refreshTrigger={refreshTrigger} />
          </>
        )}

        {view === 'list' && (
          <SweepstakesList
            onSelectSweepstake={handleSelectSweepstake}
            refreshTrigger={refreshTrigger}
          />
        )}

        {view === 'detail' && selectedSweepstake && (
          <SweepstakeDetail
            sweepstake={selectedSweepstake}
            onBack={handleBack}
            onUpdated={handleUpdated}
          />
        )}

        {view === 'history' && (
          <EntriesHistory
            onBack={handleBack}
            refreshTrigger={refreshTrigger}
          />
        )}

        {view === 'analytics' && (
          <StatsBreakdown onBack={handleBack} />
        )}

        {view === 'settings' && (
          <UserSettings onBack={handleBack} />
        )}
      </main>

      <footer className="app-footer">
        <p>✨ Made with love for sweepstakes hunters • Marlotto 2025</p>
      </footer>
    </div>
  );
}
