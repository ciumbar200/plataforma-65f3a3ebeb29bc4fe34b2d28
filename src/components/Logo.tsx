import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className, showText = true, size = 28 }) => {
  const maskId = React.useId();
  const outerRadius = size / 2 - 2; // preserve ring thickness
  const center = size / 2;
  const crescentRadius = size * 0.43;
  const cutRadius = crescentRadius * 0.92;
  const cutOffset = size * 0.18; // controls crescent thickness

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect width={size} height={size} fill="white" />
            <circle cx={center + cutOffset} cy={center} r={cutRadius} fill="black" />
          </mask>
        </defs>
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="currentColor" strokeWidth={size * 0.08} opacity="0.92" />
        <circle cx={center - size * 0.04} cy={center} r={crescentRadius} fill="currentColor" mask={`url(#${maskId})`} opacity="0.92" />
      </svg>
      {showText && <span className="text-xl font-extrabold tracking-tight text-white select-none">MoOn</span>}
    </div>
  );
};

export default Logo;
