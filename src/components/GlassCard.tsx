import React from 'react';

// FIX: Extended props to include standard HTML div attributes like onClick.
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={`bg-slate-900/90 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-lg p-4 ${className || ''}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
