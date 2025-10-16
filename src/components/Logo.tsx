import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
        aria-hidden="true"
      >
        <defs>
          <mask id="moon-cut">
            <rect width="28" height="28" fill="white" />
            {/* Subtract a slightly offset circle to create the crescent */}
            <circle cx="17.5" cy="12.5" r="9" fill="black" />
          </mask>
        </defs>
        {/* Outer ring */}
        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
        {/* Crescent */}
        <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#moon-cut)" opacity="0.9" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-white select-none">MoOn</span>
    </div>
  );
};

export default Logo;

