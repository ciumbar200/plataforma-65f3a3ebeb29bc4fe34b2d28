import React from 'react';
import GlassCard from '../../components/GlassCard';

export default function Help() {
  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-4">Centro de Ayuda</h2>
      <p className="text-white/80 mb-4">Preguntas frecuentes próximamente.</p>
      <p className="text-white/80">Para cualquier consulta, contacta con nuestro equipo de soporte en <a href="mailto:help@moonsharedliving.com" className="text-cyan-400 hover:underline">help@moonsharedliving.com</a>.</p>
    </GlassCard>
  );
}
