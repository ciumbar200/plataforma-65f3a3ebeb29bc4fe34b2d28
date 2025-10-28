import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'moon_high_contrast';

const HighContrastToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setEnabled(true);
      document.body.classList.add('high-contrast');
    }
  }, []);

  const handleToggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage issues
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span aria-hidden>{enabled ? '🌙' : '✨'}</span>
      <span>{enabled ? 'Modo alto contraste' : 'Activar alto contraste'}</span>
    </button>
  );
};

export default HighContrastToggle;
