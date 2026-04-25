import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Speedometer = ({ speed = 0, maxSpeed = 160, label = 'KM/H' }) => {
  const clampedSpeed = Math.min(Math.max(0, speed), maxSpeed);

  // Arc config: sweeps from -135° to +135° (270° total)
  const startAngle = -135;
  const endAngle = 135;
  const totalSweep = endAngle - startAngle; // 270

  // Needle angle
  const needleAngle = startAngle + (clampedSpeed / maxSpeed) * totalSweep;

  // Tick marks generation
  const majorTicks = useMemo(() => {
    const ticks = [];
    const step = 20;
    for (let v = 0; v <= maxSpeed; v += step) {
      const angle = startAngle + (v / maxSpeed) * totalSweep;
      const rad = (angle * Math.PI) / 180;
      const r1 = 88; // outer
      const r2 = 76; // inner for major
      const rLabel = 64; // label position
      ticks.push({
        value: v,
        angle,
        x1: 100 + r1 * Math.cos(rad),
        y1: 100 + r1 * Math.sin(rad),
        x2: 100 + r2 * Math.cos(rad),
        y2: 100 + r2 * Math.sin(rad),
        lx: 100 + rLabel * Math.cos(rad),
        ly: 100 + rLabel * Math.sin(rad),
      });
    }
    return ticks;
  }, [maxSpeed]);

  const minorTicks = useMemo(() => {
    const ticks = [];
    const step = 10;
    for (let v = 0; v <= maxSpeed; v += step) {
      if (v % 20 === 0) continue; // skip majors
      const angle = startAngle + (v / maxSpeed) * totalSweep;
      const rad = (angle * Math.PI) / 180;
      const r1 = 88;
      const r2 = 81;
      ticks.push({
        x1: 100 + r1 * Math.cos(rad),
        y1: 100 + r1 * Math.sin(rad),
        x2: 100 + r2 * Math.cos(rad),
        y2: 100 + r2 * Math.sin(rad),
      });
    }
    return ticks;
  }, [maxSpeed]);

  // Arc path for the colored track
  const describeArc = (cx, cy, r, startA, endA) => {
    const s = (startA * Math.PI) / 180;
    const e = (endA * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const largeArc = endA - startA > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Active arc (filled portion)
  const activeEndAngle = startAngle + (clampedSpeed / maxSpeed) * totalSweep;

  // Color based on speed
  const getSpeedColor = () => {
    if (clampedSpeed < 40) return '#FFD000';       // Gold/Yellow
    if (clampedSpeed < 80) return '#FF9500';        // Orange
    if (clampedSpeed < 120) return '#FF5722';       // Deep Orange
    return '#FF1744';                                // Red
  };

  const speedColor = getSpeedColor();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '5px 0',
    }}>
      <div style={{
        position: 'relative',
        width: '220px',
        height: '140px',
        overflow: 'visible',
      }}>
        <svg
          viewBox="0 0 200 140"
          width="220"
          height="140"
          style={{ overflow: 'visible' }}
        >
          {/* Definitions */}
          <defs>
            {/* Outer glow filter */}
            <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Active arc glow */}
            <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial gradient for gauge face */}
            <radialGradient id="gauge-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(30,32,38,0.9)" />
              <stop offset="85%" stopColor="rgba(15,16,18,0.95)" />
              <stop offset="100%" stopColor="rgba(10,10,12,1)" />
            </radialGradient>
            {/* Gradient for the active arc */}
            <linearGradient id="active-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD000" />
              <stop offset="50%" stopColor={speedColor} />
              <stop offset="100%" stopColor={speedColor} />
            </linearGradient>
          </defs>

          {/* Background circle (half visible) */}
          <circle cx="100" cy="100" r="94" fill="url(#gauge-bg)" />
          {/* Outer ring */}
          <circle cx="100" cy="100" r="93" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Background arc track */}
          <path
            d={describeArc(100, 100, 88, startAngle, endAngle)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Active arc */}
          {clampedSpeed > 0 && (
            <motion.path
              d={describeArc(100, 100, 88, startAngle, activeEndAngle)}
              fill="none"
              stroke="url(#active-arc-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#arc-glow)"
              initial={false}
              animate={{ opacity: 1 }}
            />
          )}

          {/* Minor tick marks */}
          {minorTicks.map((tick, i) => (
            <line
              key={`minor-${i}`}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          ))}

          {/* Major tick marks */}
          {majorTicks.map((tick, i) => (
            <g key={`major-${i}`}>
              <line
                x1={tick.x1} y1={tick.y1}
                x2={tick.x2} y2={tick.y2}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x={tick.lx}
                y={tick.ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255,255,255,0.55)"
                fontSize="8"
                fontWeight="700"
                fontFamily="'Inter', sans-serif"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* Center hub */}
          <circle cx="100" cy="100" r="8" fill="rgba(20,22,26,1)" stroke={speedColor} strokeWidth="2" />
          <circle cx="100" cy="100" r="4" fill={speedColor} opacity="0.8" />

          {/* Needle */}
          <motion.g
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            style={{ originX: '100px', originY: '100px', transformOrigin: '100px 100px' }}
          >
            {/* Needle shadow */}
            <line
              x1="100" y1="100"
              x2="185" y2="100"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Main needle body */}
            <line
              x1="100" y1="100"
              x2="184" y2="100"
              stroke={speedColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#needle-glow)"
            />
            {/* Needle tip accent */}
            <circle cx="184" cy="100" r="2" fill={speedColor} opacity="0.9" />
            {/* Counter-weight (small part behind center) */}
            <line
              x1="100" y1="100"
              x2="85" y2="100"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Digital speed display */}
          <text
            x="100"
            y="82"
            textAnchor="middle"
            fill="white"
            fontSize="22"
            fontWeight="800"
            fontFamily="'Inter', monospace"
            letterSpacing="-1"
          >
            {Math.round(clampedSpeed)}
          </text>
          <text
            x="100"
            y="94"
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="7"
            fontWeight="700"
            fontFamily="'Inter', sans-serif"
            letterSpacing="2"
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default Speedometer;
