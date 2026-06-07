import React, { useState, useEffect } from 'react';
import ModelMixer from './ModelMixer';
import RosterHealth from './RosterHealth';

interface Player {
  name: string;
  quality: number;
  status: string;
}

interface Team {
  id: string;
  name: string;
  confederation: string;
  baseElo: number;
  optaRating: number;
  socioScore: number;
  isAcclimated: boolean;
  playStyle: string;
  roster: Player[];
  crisisModifier: number;
}

interface SimulationResults {
  winProbA: number;
  winProbB: number;
  drawProb: number;
  expectedGoalA: number;
  expectedGoalB: number;
  analysis: string;
}

export default function MatchSimulator() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamA, setTeamA] = useState('España');
  const [teamB, setTeamB] = useState('Brasil');
  
  const [weights, setWeights] = useState({
    optaWeight: 0.3,
    eloWeight: 0.3,
    socioWeight: 0.2,
    envWeight: 0.1,
    randomWeight: 0.1
  });
  const [env, setEnv] = useState({
    isAltitude: false,
    wbgt: 22,
    travelA: 1000,
    travelB: 1500
  });
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/api/teams`)
      .then(res => res.json())
      .then((data: Team[]) => {
        setTeams(data);
        if (data.length > 0) {
          setTeamA(data[0].name);
          if (data.length > 1) {
            setTeamB(data[1].name);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError('Error loading teams from backend.');
      });
  }, []);

  const simulateMatch = async () => {
    setLoading(true);
    setError('');
    const payload = { teamA, teamB, ...weights, ...env };
    
    try {
      const res = await fetch(`${API_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('Error al conectar con el motor de simulación');
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error en la simulación');
    }
    setLoading(false);
  };

  const selectedTeamAObj = teams.find(t => t.name === teamA) || null;
  const selectedTeamBObj = teams.find(t => t.name === teamB) || null;

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">2026 World Cup Predictive Engine</h1>
        <p className="subtitle">Data-Driven FIFA 2026 Simulation Engine</p>
      </header>

      <div className="simulator-layout">
        {/* Controles Izquierdos */}
        <div className="controls-panel">
          <ModelMixer weights={weights} setWeights={setWeights} />
          
          <div className="card">
            <h3>Entorno & Logística</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={env.isAltitude}
                onChange={e => setEnv({...env, isAltitude: e.target.checked})}
              />
              Partido en Altitud (CDMX/Guadalajara)
            </label>
            <div className="input-group">
              <label className="input-label">WBGT (°C) Estrés Térmico</label>
              <input
                type="number"
                value={env.wbgt}
                onChange={e => setEnv({...env, wbgt: Number(e.target.value)})}
                className="text-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Viaje Equipo A (km)</label>
              <input
                type="number"
                value={env.travelA}
                onChange={e => setEnv({...env, travelA: Number(e.target.value)})}
                className="text-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Viaje Equipo B (km)</label>
              <input
                type="number"
                value={env.travelB}
                onChange={e => setEnv({...env, travelB: Number(e.target.value)})}
                className="text-input"
              />
            </div>
          </div>

          {error && <p className="text-red" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button
            onClick={simulateMatch}
            disabled={loading || teams.length === 0}
            className="btn-primary"
          >
            {loading ? 'Procesando 10,000 Iteraciones...' : 'Simular Partido'}
          </button>
        </div>

        {/* Panel Derecho */}
        <div className="results-panel">
          <div className="card" style={{ height: '100%' }}>
            
            {/* Headers and Squad Health side-by-side ideally, but we stack headers then health */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <select
                  value={teamA}
                  onChange={e => setTeamA(e.target.value)}
                  className="select-input"
                  style={{ width: '100%' }}
                >
                  {teams.map(t => <option key={`A-${t.id}`}>{t.name}</option>)}
                </select>
                <RosterHealth team={selectedTeamAObj} />
              </div>
              
              <div style={{ paddingTop: '1rem' }}>
                <span className="vs-text">VS</span>
              </div>
              
              <div>
                <select
                  value={teamB}
                  onChange={e => setTeamB(e.target.value)}
                  className="select-input"
                  style={{ width: '100%' }}
                >
                  {teams.map(t => <option key={`B-${t.id}`}>{t.name}</option>)}
                </select>
                <RosterHealth team={selectedTeamBObj} />
              </div>
            </div>

            {results && (
              <div className="animate-fade-in">
                <div className="results-grid">
                  <div className="result-box">
                    <p className="result-box-label">Gana {teamA}</p>
                    <p className="result-prob text-green">{(results.winProbA * 100).toFixed(1)}%</p>
                  </div>
                  <div className="result-box">
                    <p className="result-box-label">Empate</p>
                    <p className="result-prob text-gray">{(results.drawProb * 100).toFixed(1)}%</p>
                  </div>
                  <div className="result-box">
                    <p className="result-box-label">Gana {teamB}</p>
                    <p className="result-prob text-red">{(results.winProbB * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="xg-container">
                  <h4 className="result-box-label" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    Marcador Esperado (xG)
                  </h4>
                  <p className="xg-score">
                    {results.expectedGoalA.toFixed(2)} - {results.expectedGoalB.toFixed(2)}
                  </p>
                </div>

                <div className="analysis-box">
                  <h4 className="analysis-title">Análisis Multi-factorial</h4>
                  <p>{results.analysis}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
