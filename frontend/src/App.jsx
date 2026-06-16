import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SweepstakesList from './components/SweepstakesList';
import SweepstakeDetail from './components/SweepstakeDetail';
import AddEditForm from './components/AddEditForm';
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

  const handleAddNew = () => {
    setView('add');
  };

  const handleUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setView('dashboard');
    setSelectedSweepstake(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎰 Marlotto</h1>
        <p>Sweepstakes Mail Entry Tracker</p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleBack()}
        >
          Dashboard
        </button>
        <button
          className={`nav-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          All Sweepstakes
        </button>
      </nav>

      <main className="app-main">
        {view === 'dashboard' && <Dashboard />}

        {view === 'list' && (
          <SweepstakesList
            onSelectSweepstake={handleSelectSweepstake}
            onAddNew={handleAddNew}
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

        {view === 'add' && (
          <AddEditForm
            onBack={handleBack}
            onSaved={handleUpdated}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Marlotto. Personal use only.</p>
      </footer>
    </div>
  );
}
