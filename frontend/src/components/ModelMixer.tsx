import React from 'react';

interface Weights {
  optaWeight: number;
  eloWeight: number;
  socioWeight: number;
  envWeight: number;
  randomWeight: number;
}

interface ModelMixerProps {
  weights: Weights;
  setWeights: (weights: Weights) => void;
}

export default function ModelMixer({ weights, setWeights }: ModelMixerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setWeights({ ...weights, [key]: parseFloat(e.target.value) });
  };

  return (
    <div className="card">
      <h3>Ajuste de Modelos (Pesos)</h3>
      {Object.entries(weights).map(([key, value]) => (
        <div key={key} className="input-group">
          <label className="input-label">
            {key.replace('Weight', '')} 
            <span>{(value * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={value}
            onChange={(e) => handleChange(e, key)}
            className="slider"
          />
        </div>
      ))}
    </div>
  );
}
