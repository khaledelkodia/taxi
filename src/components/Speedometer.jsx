import React, { useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const Speedometer = ({ speed = 0, maxSpeed = 160, label = 'KM/H' }) => {
  const clampedSpeed = Math.min(Math.max(0, speed), maxSpeed);

  // Semicircle: 180° (left = 0) to 360° (right = max)
  const svgStartAngle = 180;
  const svgSweep = 180;

  const cx = 130;
  const cy = 110;
  const arcR = 90;
  const tickOuterR = 90;
  const tickMajorInnerR = 74;
  const tickMinorInnerR = 82;
  const labelR = 62;
  const needleR = 80;
  const counterR = 12;

  const toRad = (deg) => (deg * Math.PI) / 180;

  // Animated spring value for needle
  const springVal = useSpring(clampedSpeed, { stiffness: 60, damping: 14 });

  // compute needle angle from speed
  const getNeedleAngleDeg = (spd) => svgStartAngle + (spd / maxSpeed) * svgSweep;

  // Tick marks
  const majorTicks = useMemo(() => {
    const ticks = [];
    const step = 20;
    for (let v = 0; v <= maxSpeed; v += step) {
      const angle = svgStartAngle + (v / maxSpeed) * svgSweep;
      const rad = toRad(angle);
      ticks.push({
        value: v,
        x1: cx + tickOuterR * Math.cos(rad),
        y1: cy + tickOuterR * Math.sin(rad),
        x2: cx + tickMajorInnerR * Math.cos(rad),
        y2: cy + tickMajorInnerR * Math.sin(rad),
        lx: cx + labelR * Math.cos(rad),
        ly: cy + labelR * Math.sin(rad),
      });
    }
    return ticks;
  }, [maxSpeed]);

  const minorTicks = useMemo(() => {
    const ticks = [];
    const step = 10;
    for (let v = 0; v <= maxSpeed; v += step) {
      if (v % 20 === 0) continue;
      const angle = svgStartAngle + (v / maxSpeed) * svgSweep;
      const rad = toRad(angle);
      ticks.push({
        x1: cx + tickOuterR * Math.cos(rad),
        y1: cy + tickOuterR * Math.sin(rad),
        x2: cx + tickMinorInnerR * Math.cos(rad),
        y2: cy + tickMinorInnerR * Math.sin(rad),
      });
    }
    return ticks;
  }, [maxSpeed]);

  // Arc path
  const describeArc = (r, startA, endA) => {
    const sRad = toRad(startA);
    const eRad = toRad(endA);
    const x1 = cx + r * Math.cos(sRad);
    const y1 = cy + r * Math.sin(sRad);
    const x2 = cx + r * Math.cos(eRad);
    const y2 = cy + r * Math.sin(eRad);
    const largeArc = (endA - startA) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const activeEndAngle = svgStartAngle + (clampedSpeed / maxSpeed) * svgSweep;

  // Color based on speed
  const getSpeedColor = () => {
    if (clampedSpeed < 40) return '#FFD000';
    if (clampedSpeed < 80) return '#FF9500';
    if (clampedSpeed < 120) return '#FF5722';
    return '#FF1744';
  };
  const speedColor = getSpeedColor();

  // Calculate needle tip & counter positions directly
  const needleAngleRad = toRad(getNeedleAngleDeg(clampedSpeed));
  const tipX = cx + needleR * Math.cos(needleAngleRad);
  const tipY = cy + needleR * Math.sin(needleAngleRad);
  const ctrX = cx - counterR * Math.cos(needleAngleRad);
  const ctrY = cy - counterR * Math.sin(needleAngleRad);

  // For animated needle, use motion values
  const needleTipX = useTransform(springVal, (v) => {
    const rad = toRad(getNeedleAngleDeg(v));
    return cx + needleR * Math.cos(rad);
  });
  const needleTipY = useTransform(springVal, (v) => {
    const rad = toRad(getNeedleAngleDeg(v));
    return cy + needleR * Math.sin(rad);
  });
  const needleCtrX = useTransform(springVal, (v) => {
    const rad = toRad(getNeedleAngleDeg(v));
    return cx - counterR * Math.cos(rad);
  });
  const needleCtrY = useTransform(springVal, (v) => {
    const rad = toRad(getNeedleAngleDeg(v));
    return cy - counterR * Math.sin(rad);
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      marginTop: '-5px',
      marginBottom: '-15px',
    }}>
      <svg
        viewBox="0 0 260 125"
        width="100%"
        height="auto"
        style={{ maxWidth: '100%' }}
      >
        <defs>
          <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="active-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD000" />
            <stop offset="50%" stopColor="#FFAB00" />
            <stop offset="100%" stopColor={speedColor} />
          </linearGradient>
          <linearGradient id="track-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,208,0,0.12)" />
            <stop offset="100%" stopColor="rgba(255,208,0,0.04)" />
          </linearGradient>
        </defs>

        {/* Background arc track */}
        <path
          d={describeArc(arcR, svgStartAngle, svgStartAngle + svgSweep)}
          fill="none"
          stroke="url(#track-grad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Active arc */}
        {clampedSpeed > 0.5 && (
          <path
            d={describeArc(arcR, svgStartAngle, activeEndAngle)}
            fill="none"
            stroke="url(#active-arc-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#arc-glow)"
          />
        )}

        {/* Minor ticks */}
        {minorTicks.map((tick, i) => (
          <line key={`m-${i}`}
            x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round"
          />
        ))}

        {/* Major ticks + labels */}
        {majorTicks.map((tick, i) => (
          <g key={`M-${i}`}>
            <line
              x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
              stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"
            />
            <text x={tick.lx} y={tick.ly}
              textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.55)" fontSize="9" fontWeight="700"
              fontFamily="'Inter', sans-serif">
              {tick.value}
            </text>
          </g>
        ))}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="10" fill="rgba(12,13,16,1)" stroke="rgba(255,208,0,0.15)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="6" fill="none" stroke={speedColor} strokeWidth="2" opacity="0.8" />
        <circle cx={cx} cy={cy} r="3" fill={speedColor} opacity="1" />

        {/* Needle — drawn by coordinates, animated with spring */}
        {/* Main needle (bright) */}
        <motion.line
          x1={needleCtrX} y1={needleCtrY} x2={needleTipX} y2={needleTipY}
          stroke="#FF3030" strokeWidth="3" strokeLinecap="round"
        />
        {/* White highlight stripe */}
        <motion.line
          x1={cx} y1={cy} x2={needleTipX} y2={needleTipY}
          stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round"
        />
        {/* Tip */}
        <motion.circle cx={needleTipX} cy={needleTipY} r="2.5" fill="#FF3030" />

        {/* Digital speed */}
        <text x={cx} y={cy - 28} textAnchor="middle"
          fill="white" fontSize="30" fontWeight="800"
          fontFamily="'Inter', monospace" letterSpacing="-1">
          {Math.round(clampedSpeed)}
        </text>
        <text x={cx} y={cy - 14} textAnchor="middle"
          fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="700"
          fontFamily="'Inter', sans-serif" letterSpacing="3">
          {label}
        </text>
      </svg>
    </div>
  );
};

export default Speedometer;
