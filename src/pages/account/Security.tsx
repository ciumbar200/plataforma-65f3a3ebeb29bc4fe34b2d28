import React from 'react';
import GlassCard from '../../components/GlassCard';

export default function Security() {
  const btnStyle = "w-full text-left bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors";
  const btnDangerStyle = "w-full text-left bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-3 px-4 rounded-lg transition-colors";
  
  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-6">Seguridad</h2>
      <div className="space-y-4">
        <button className={btnStyle}>Cambiar contraseña</button>
        <button className={btnDangerStyle}>Cerrar todas las sesiones</button>
      </div>
    </GlassCard>
  );
}
