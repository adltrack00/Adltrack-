import React from 'react';

export const CareAssistantIcon = ({ size = 40, className = '' }) => {
  const id = 'cai';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* White card background */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef9f4" />
        </linearGradient>
        {/* Amber → coral wave — matches Start Task button */}
        <linearGradient id={`${id}-wave`} x1="10" y1="50" x2="90" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFB347" />
          <stop offset="50%"  stopColor="#F28482" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0.7" />
        </linearGradient>
        {/* Soft amber glow filter */}
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* White card background */}
      <rect x="0" y="0" width="100" height="100" rx="22" fill={`url(#${id}-bg)`} />
      {/* Subtle border */}
      <rect x="0.75" y="0.75" width="98.5" height="98.5" rx="21.5" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" />
      {/* Amber radial tint at top — matches vitals card pattern */}
      <rect x="0" y="0" width="100" height="52" rx="22" fill="rgba(255,179,71,0.07)" />

      {/* Heartbeat waveform — glow layer */}
      <polyline
        points="10,52 28,52 34,52 38,38 44,66 50,28 56,72 60,44 64,52 68,52 90,52"
        fill="none"
        stroke="#FFB347"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.22"
        filter={`url(#${id}-glow)`}
      />
      {/* Heartbeat waveform — crisp layer */}
      <polyline
        points="10,52 28,52 34,52 38,38 44,66 50,28 56,72 60,44 64,52 68,52 90,52"
        fill="none"
        stroke={`url(#${id}-wave)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CareAssistantIcon;
