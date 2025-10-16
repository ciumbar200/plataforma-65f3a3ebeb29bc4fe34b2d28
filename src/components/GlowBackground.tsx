import React from 'react';

// Decorative background with soft glowing blobs for hero/sections
// Non-interactive: pointer-events-none so it never captures clicks.
const GlowBackground: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`} aria-hidden="true">
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full opacity-50 blur-3xl"
           style={{ background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.45), transparent 60%)' }} />
      <div className="absolute top-1/4 right-0 w-[36rem] h-[36rem] rounded-full opacity-50 blur-3xl"
           style={{ background: 'radial-gradient(circle at 70% 30%, rgba(56,189,248,0.35), transparent 60%)' }} />
      <div className="absolute bottom-[-8rem] left-1/3 w-[30rem] h-[30rem] rounded-full opacity-40 blur-3xl"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.35), transparent 60%)' }} />
    </div>
  );
};

export default GlowBackground;

