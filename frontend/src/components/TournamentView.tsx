import React, { useState } from 'react';
import ModelMixer from './ModelMixer';
import ConfidenceDashboard from './ConfidenceDashboard';

interface MatchNode {
  phase: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  winner: string;
}

interface GroupStanding {
  TeamName: string;
  Points: number;
  GD: number;
  GF: number;
}

interface TournamentResponse {
  groups: Record<string, GroupStanding[]>;
  round32: MatchNode[];
  round16: MatchNode[];
  quarters: MatchNode[];
  semis: MatchNode[];
  final: MatchNode;
  globalConfidence: number;
}

export default function TournamentView() {
  const [weights, setWeights] = useState({
    optaWeight: 0.3,
    eloWeight: 0.3,
    socioWeight: 0.2,
    envWeight: 0.1,
    randomWeight: 0.1
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TournamentResponse | null>(null);
  const [error, setError] = useState('');

  const simulateTournament = async () => {
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_URL}/api/tournament`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights })
      });
      if (!res.ok) throw new Error('Error al conectar con el motor de simulación');
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error en la simulación del torneo');
    }
    setLoading(false);
  };

  const renderMatch = (match: MatchNode, isFinal = false) => {
    if (!match) return null;
    return (
      <div className={`bracket-match ${isFinal ? 'bracket-final' : ''}`} key={`${match.teamA}-${match.teamB}`}>
        <div className={`bracket-team ${match.winner === match.teamA ? 'winner' : ''}`}>
          <span>{match.teamA}</span>
          <span>{match.scoreA.toFixed(1)}</span>
        </div>
        <div className={`bracket-team ${match.winner === match.teamB ? 'winner' : ''}`}>
          <span>{match.teamB}</span>
          <span>{match.scoreB.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        <h3>Configuración del Motor (Torneo Completo)</h3>
        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          Simula 104 partidos (Fase de Grupos + 32avos hasta la Final) ajustando las iteraciones dinámicamente para alta velocidad.
        </p>
        <ModelMixer weights={weights} setWeights={setWeights} />
        {error && <p className="text-red" style={{ margin: '1rem 0' }}>{error}</p>}
        <button onClick={simulateTournament} disabled={loading} className="btn-secondary" style={{ marginTop: '1rem' }}>
          {loading ? 'Simulando 48 equipos (104 partidos)...' : 'Lanzar Simulación Global'}
        </button>
      </div>

      {results && (
        <div className="tournament-container animate-fade-in">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="text-green">¡CAMPEÓN: {results.final.winner}!</span>
          </h2>
          
          <div className="bracket-wrapper">
            {/* LADO IZQUIERDO */}
            <div className="bracket-col">
              <div className="phase-title">16avos</div>
              {results.round32.slice(0, 8).map(m => renderMatch(m))}
            </div>
            <div className="bracket-col">
              <div className="phase-title">Octavos</div>
              {results.round16.slice(0, 4).map(m => renderMatch(m))}
            </div>
            <div className="bracket-col">
              <div className="phase-title">Cuartos</div>
              {results.quarters.slice(0, 2).map(m => renderMatch(m))}
            </div>
            <div className="bracket-col">
              <div className="phase-title">Semis</div>
              {renderMatch(results.semis[0])}
            </div>

            {/* FINAL (CENTRO) */}
            <div className="bracket-col" style={{ flex: 1.5, justifyContent: 'center' }}>
              <div className="phase-title" style={{ color: 'var(--accent-green)', fontSize: '1.2rem' }}>LA GRAN FINAL</div>
              {renderMatch(results.final, true)}
            </div>

            {/* LADO DERECHO */}
            <div className="bracket-col">
              <div className="phase-title">Semis</div>
              {renderMatch(results.semis[1])}
            </div>
            <div className="bracket-col">
              <div className="phase-title">Cuartos</div>
              {results.quarters.slice(2, 4).map(m => renderMatch(m))}
            </div>
            <div className="bracket-col">
              <div className="phase-title">Octavos</div>
              {results.round16.slice(4, 8).map(m => renderMatch(m))}
            </div>
            <div className="bracket-col">
              <div className="phase-title">16avos</div>
              {results.round32.slice(8, 16).map(m => renderMatch(m))}
            </div>
          </div>
          
          <ConfidenceDashboard currentConfidence={results.globalConfidence} />
        </div>
      )}
    </div>
  );
}
