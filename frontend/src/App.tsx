import React, { useState } from 'react';
import MatchSimulator from './components/MatchSimulator';
import TournamentView from './components/TournamentView';
import BacktestView from './components/BacktestView';

function App() {
  const [view, setView] = useState<'match' | 'tournament' | 'backtest'>('match');

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${view === 'match' ? 'active' : ''}`}
            onClick={() => setView('match')}
          >
            Partido Único
          </button>
          <button 
            className={`nav-tab ${view === 'tournament' ? 'active' : ''}`}
            onClick={() => setView('tournament')}
          >
            Simulador de Torneo
          </button>
          <button 
            className={`nav-tab ${view === 'backtest' ? 'active' : ''}`}
            onClick={() => setView('backtest')}
          >
            Backtest de Motor
          </button>
        </div>
      </div>
      
      {view === 'match' && <MatchSimulator />}
      {view === 'tournament' && <TournamentView />}
      {view === 'backtest' && <BacktestView />}
    </>
  );
}

export default App;
