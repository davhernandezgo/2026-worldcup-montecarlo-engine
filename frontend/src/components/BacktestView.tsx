import React, { useState, useEffect } from 'react';
import ModelMixer from './ModelMixer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BacktestResponse {
  simulations_run: number;
  champion_counts: Record<string, number>;
  average_surprise_factor: number;
  execution_time_ms: number;
}

export default function BacktestView() {
  const [weights, setWeights] = useState({
    optaWeight: 0.3,
    eloWeight: 0.3,
    socioWeight: 0.2,
    envWeight: 0.1,
    randomWeight: 0.1
  });
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [error, setError] = useState('');

  // UX Trick: Simulated progress bar while backend crunches numbers
  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 95) return 95; // Hold at 95% until backend actually returns
          return p + (100 / 25); // Target ~2.5 seconds to reach 100% (25 ticks of 100ms)
        });
      }, 100);
    } else {
      setProgress(100); // Complete
    }
    return () => clearInterval(interval);
  }, [loading]);

  const runBacktest = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_URL}/api/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights })
      });
      if (!res.ok) throw new Error('Error al ejecutar Backtest en el servidor Go');
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error en la simulación concurrente');
    }
    setLoading(false);
  };

  // Convert map to array sorted by wins
  const chartData = results 
    ? Object.entries(results.champion_counts)
        .map(([name, wins]) => ({ name, wins }))
        .sort((a, b) => b.wins - a.wins)
    : [];

  return (
    <div className="animate-fade-in" style={{ padding: '0 2rem' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        <h3>Módulo de Backtesting (Montecarlo)</h3>
        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          Este módulo usa concurrencia en Go para ejecutar 100 mundiales enteros (10,400 partidos) simultáneamente usando tu configuración del motor.
        </p>
        <ModelMixer weights={weights} setWeights={setWeights} />
        {error && <p className="text-red" style={{ margin: '1rem 0' }}>{error}</p>}
        
        <button onClick={runBacktest} disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
          {loading ? 'Procesando en Goroutines...' : 'Ejecutar 100 Torneos en Paralelo'}
        </button>

        {(loading || progress === 100) && progress > 0 && progress < 100 && (
          <div style={{ marginTop: '2rem', backgroundColor: 'var(--bg-dark)', borderRadius: '1rem', overflow: 'hidden', height: '10px' }}>
            <div style={{ width: `${progress}%`, backgroundColor: 'var(--accent-green)', height: '100%', transition: 'width 0.1s linear' }}></div>
          </div>
        )}
      </div>

      {results && (
        <div className="card animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Simulaciones Realizadas</h4>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-green)' }}>{results.simulations_run}</p>
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Factor Sorpresa Promedio</h4>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-red)' }}>{(results.average_surprise_factor * 100).toFixed(1)}%</p>
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Tiempo de Ejecución</h4>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{results.execution_time_ms} ms</p>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem' }}>Frecuencia de Campeones</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} 
                />
                <Bar dataKey="wins" name="Campeonatos Obtenidos" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-green)' : 'var(--accent-green-hover)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
