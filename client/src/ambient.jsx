import { useMemo } from 'react';

export function RainAmbient() {
  const drops = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 0.7 + Math.random() * 0.7,
      delay: -(Math.random() * 2), // negative delay so drops are already in motion
      opacity: 0.08 + Math.random() * 0.14,
      height: 12 + Math.random() * 10,
    })), []);

  return (
    <div style={ambientBase}>
      <style>{`
        @keyframes rainfall {
          0%   { transform: translateY(-30px); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
      {drops.map(d => (
        <div key={d.id} style={{
          position: 'absolute',
          left: `${d.x}%`,
          top: 0,
          width: '1px',
          height: `${d.height}px`,
          background: 'var(--ink-faint)',
          borderRadius: '1px',
          opacity: d.opacity,
          animation: `rainfall ${d.duration}s linear ${d.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

export function Starfield() {
  const stars = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 1.6,
      twinkle: Math.random() > 0.65,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 4,
      baseOpacity: 0.35 + Math.random() * 0.55,
    })), []);

  return (
    <div style={ambientBase}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--star-lo); transform: scale(0.85); }
          50%       { opacity: var(--star-hi); transform: scale(1.2); }
        }
      `}</style>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          borderRadius: '50%',
          background: 'var(--ink)',
          '--star-lo': s.baseOpacity * 0.3,
          '--star-hi': s.baseOpacity,
          opacity: s.baseOpacity,
          animation: s.twinkle
            ? `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`
            : 'none',
        }} />
      ))}
    </div>
  );
}

const ambientBase = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 0,
};
