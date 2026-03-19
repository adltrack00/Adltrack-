import React from 'react';

/**
 * ADLTrack Care Assistant Icon
 * Three interlocking ribbon bands forming a hexagonal shape
 * Green gradient inspired by modern AI assistant iconography
 */
export const CareAssistantIcon = ({ size = 40, className = '' }) => {
  const id = React.useId();
  
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
        {/* Band 1 gradient - lightest (back) */}
        <linearGradient id={`${id}-a`} x1="10" y1="40" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        {/* Band 2 gradient - medium */}
        <linearGradient id={`${id}-b`} x1="75" y1="15" x2="25" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        {/* Band 3 gradient - darkest (front) */}
        <linearGradient id={`${id}-c`} x1="25" y1="85" x2="75" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="40%" stopColor="#1a9e4c" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        {/* Highlight overlay */}
        <linearGradient id={`${id}-h`} x1="30" y1="10" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Band 1 (back): Horizontal - 0° */}
      <rect x="6" y="38" width="88" height="24" rx="12" fill={`url(#${id}-a)`} />

      {/* Band 2 (middle): 120° rotation */}
      <rect x="6" y="38" width="88" height="24" rx="12" fill={`url(#${id}-b)`} transform="rotate(120, 50, 50)" />

      {/* Band 3 (front): 240° rotation */}
      <rect x="6" y="38" width="88" height="24" rx="12" fill={`url(#${id}-c)`} transform="rotate(240, 50, 50)" />

      {/* Front band highlight for 3D depth */}
      <rect x="6" y="38" width="88" height="24" rx="12" fill={`url(#${id}-h)`} transform="rotate(240, 50, 50)" />

      {/* Center cutout - hexagonal void */}
      <circle cx="50" cy="50" r="11" fill="black" />
    </svg>
  );
};

export default CareAssistantIcon;
