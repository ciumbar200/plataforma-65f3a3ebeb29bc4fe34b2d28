import React from 'react';

const SkipToContentLink: React.FC = () => (
  <a
    href="#main-content"
    className="absolute left-1/2 top-3 z-[999] -translate-x-1/2 -translate-y-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition focus-visible:translate-y-0">
    Saltar al contenido principal
  </a>
);

export default SkipToContentLink;
