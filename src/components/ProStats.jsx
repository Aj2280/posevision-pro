import React from 'react';
import { Activity, Target, Zap, Waves } from 'lucide-react';

const ProStats = ({ angle, count, feedback, stage, exerciseName }) => {
  // Normalize angle for Gauge
  let progress = 0;
  if (exerciseName === 'Squat') progress = ((180 - angle) / 80) * 100; // 180 to 100
  else progress = ((180 - angle) / 140) * 100; // 180 to 40

  return (
    <div className="pro-stats-overlay">
      <div className="pro-stats-card main-counter">
        <div className="counter-label">{exerciseName} Count</div>
        <div className="counter-value">{count}</div>
      </div>

      <div className="pro-stats-card angle-gauge">
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          <svg viewBox="0 0 100 100" className="gauge-svg">
            <circle cx="50" cy="50" r="45" className="gauge-bg" />
            <circle 
              cx="50" cy="50" r="45" 
              className="gauge-path"
              style={{ strokeDashoffset: 283 - (283 * Math.min(progress, 100)) / 100 }}
            />
          </svg>
          <div className="gauge-text">
            <span>{angle}°</span>
            <small>Angle</small>
          </div>
        </div>
      </div>

      <div className="pro-stats-card feedback-alert">
         <div className="feedback-chip">
            {stage === 'down' ? <Zap size={14} color="#00f2ff" /> : <Target size={14} color="#8b5cf6" />}
            {feedback || 'Ready to start'}
         </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .pro-stats-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 10;
        }

        .pro-stats-card {
          background: rgba(10, 10, 15, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          pointer-events: auto;
        }

        .main-counter {
          align-self: flex-start;
          min-width: 180px;
          text-align: center;
          border-bottom: 4px solid var(--accent-cyan);
        }

        .counter-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 0.2rem;
        }

        .counter-value {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1;
        }

        .angle-gauge {
          position: absolute;
          top: 2rem;
          right: 2rem;
          padding: 1rem;
        }

        .gauge-svg {
          width: 100px;
          height: 100px;
          transform: rotate(-90deg);
        }

        .gauge-bg {
          fill: transparent;
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 8;
        }

        .gauge-path {
          fill: transparent;
          stroke: var(--accent-cyan);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 283;
          transition: stroke-dashoffset 0.1s ease;
        }

        .gauge-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gauge-text span {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .gauge-text small {
          font-size: 0.6rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .feedback-alert {
          align-self: center;
          margin-bottom: 1rem;
          padding: 0.8rem 1.5rem;
          border-radius: 99px;
          border-color: var(--accent-purple);
        }

        .feedback-chip {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-main);
        }
      `}} />
    </div>
  );
};

export default ProStats;
