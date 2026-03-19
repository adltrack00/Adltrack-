import React from 'react';

/**
 * ADLTrack Care Assistant Icon
 * Green rounded square with white heartbeat/pulse waveform
 */
export const CareAssistantIcon = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Green rounded square background */}
      <rect x="4" y="4" width="92" height="92" rx="24" fill="#25D366" />

      {/* White heartbeat/pulse waveform line */}
      <polyline
        points="12,52 30,52 36,52 40,38 46,66 52,28 58,72 62,44 66,52 70,52 88,52"
        fill="none"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CareAssistantIcon;
