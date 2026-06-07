import React from 'react';

interface Player {
  name: string;
  quality: number;
  status: string;
}

interface Team {
  id: string;
  name: string;
  roster: Player[];
  crisisModifier: number; // passed implicitly from backend calculation
}

interface RosterHealthProps {
  team: Team | null;
}

export default function RosterHealth({ team }: RosterHealthProps) {
  if (!team) return null;

  const injuredPlayers = team.roster.filter(p => p.status === 'injured');

  return (
    <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 800 }}>Salud de Plantilla</h4>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Impacto de bajas: {(100 - (team.crisisModifier * 100)).toFixed(1)}% de merma.
      </p>

      {injuredPlayers.length > 0 ? (
        <div>
          <h5 className="text-red" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Bajas Sensibles
          </h5>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {injuredPlayers.map((player) => (
              <li key={player.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                <span className="text-red">{player.name}</span>
                <span className="text-muted">Calidad: {player.quality}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-green" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Plantilla al 100% (Sin bajas reportadas)</p>
      )}
    </div>
  );
}
