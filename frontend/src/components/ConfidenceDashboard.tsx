import React, { useEffect, useState } from 'react';

interface SimulationLog {
  id: string;
  timestamp: string;
  type: string;
  confidence: number;
}

export default function ConfidenceDashboard({ currentConfidence }: { currentConfidence?: number }) {
  const [history, setHistory] = useState<SimulationLog[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    fetch(`${API_URL}/api/history`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          // data is most recent first. Reverse for sparkline so older is on left, newer on right.
          setHistory(data.reverse());
        }
      })
      .catch(err => console.error(err));
  }, [currentConfidence]); // refresh when a new tournament finishes

  const displayConf = currentConfidence ?? (history.length > 0 ? history[history.length - 1].confidence : 0);
  const percentage = displayConf * 100;

  // Determine color based on confidence
  let color = '#ef4444'; // Red (upsets / low confidence)
  let statusText = 'Modelo Inestable (Sorpresas)';
  if (percentage >= 60) {
    color = '#10b981'; // Green (high confidence)
    statusText = 'Efectividad Alta (Predicción Cumplida)';
  } else if (percentage >= 45) {
    color = '#f59e0b'; // Orange (medium)
    statusText = 'Desviación Leve (Resultados Ajustados)';
  }

  // Gauge calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Sparkline calculations
  const sparkWidth = 250;
  const sparkHeight = 40;
  const sparkPoints = history.map((log, i) => {
    const x = history.length > 1 ? (i / (history.length - 1)) * sparkWidth : sparkWidth / 2;
    const y = sparkHeight - (log.confidence * sparkHeight);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Efectividad del Modelo</h3>
      <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
        Promedio de probabilidad con la que ganaron los equipos en la fase eliminatoria.
      </p>

      <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* GAUGE CHART */}
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="75" cy="75" r={radius}
              fill="transparent" stroke="var(--border-color)" strokeWidth="12"
            />
            <circle
              cx="75" cy="75" r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s' }}
            />
          </svg>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color }}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* DETAILS & SPARKLINE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h4 style={{ color, fontSize: '1.2rem', marginBottom: '0.25rem' }}>{statusText}</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Un porcentaje alto indica que los favoritos ganaron consistentemente.
            </p>
          </div>

          <div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Historial Sesión ({history.length} simulaciones)
            </p>
            {history.length > 0 ? (
              <svg width={sparkWidth} height={sparkHeight + 10} style={{ overflow: 'visible' }}>
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="var(--accent-green)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {history.map((log, i) => {
                  const x = history.length > 1 ? (i / (history.length - 1)) * sparkWidth : sparkWidth / 2;
                  const y = sparkHeight - (log.confidence * sparkHeight);
                  return (
                    <circle key={log.id} cx={x} cy={y} r="4" fill="var(--accent-green)" stroke="var(--bg-dark)" strokeWidth="2" />
                  );
                })}
              </svg>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No hay historial suficiente.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
