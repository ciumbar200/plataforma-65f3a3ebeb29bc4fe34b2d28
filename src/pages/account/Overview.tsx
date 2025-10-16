import React from 'react';
import GlassCard from '../../components/GlassCard';

export default function Overview() {
  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-4">Resumen de Cuenta</h2>
      <p className="text-white/80 mb-4">Plan actual: <strong className="text-cyan-400 font-semibold">Gratuito</strong></p>
      <button disabled className="bg-gray-600 text-white/70 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
        Mejorar a Pro (Próximamente)
      </button>
    </GlassCard>
  );
}
