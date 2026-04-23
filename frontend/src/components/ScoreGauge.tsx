import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  max?: number;
  size?: number;
}

function scoreColor(score: number): string {
  if (score >= 700) return '#10B981'; // green
  if (score >= 500) return '#EF9F27'; // amber
  if (score >= 300) return '#F59E0B'; // yellow-orange
  return '#EF4444'; // red
}

function scoreLabel(score: number): string {
  if (score >= 700) return 'Excelente';
  if (score >= 500) return 'Bom';
  if (score >= 300) return 'Em formação';
  return 'Insuficiente';
}

export function ScoreGauge({ score, max = 1000, size = 240 }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(id);
  }, [score]);

  const radius = size / 2 - 14;
  const circumference = Math.PI * radius; // semi-circle
  const progress = Math.max(0, Math.min(1, animated / max));
  const offset = circumference * (1 - progress);
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path
          d={`M 14 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 14} ${size / 2}`}
          stroke="#E5E7EB"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 14 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 14} ${size / 2}`}
          stroke={color}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="-mt-16 text-center">
        <div className="font-display text-5xl font-extrabold" style={{ color }}>
          {Math.round(animated)}
        </div>
        <div className="text-sm text-nan-gray font-medium">de {max}</div>
        <div
          className="mt-1 font-semibold text-sm px-3 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {scoreLabel(score)}
        </div>
      </div>
    </div>
  );
}
