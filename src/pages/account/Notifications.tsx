import React, { useState } from "react";
import GlassCard from '../../components/GlassCard';

const CheckboxLabel: React.FC<{ checked: boolean; onChange: () => void; children: React.ReactNode }> = ({ checked, onChange, children }) => (
    <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
            className="h-5 w-5 rounded bg-white/20 border-white/30 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
        />
        <span className="text-white/90">{children}</span>
    </label>
);

export default function Notifications() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-6">Notificaciones y Marketing</h2>
      <div className="space-y-4">
        <CheckboxLabel checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)}>
            Recibir notificaciones importantes por email (nuevos matches, mensajes, etc.)
        </CheckboxLabel>
        <CheckboxLabel checked={marketing} onChange={() => setMarketing(!marketing)}>
            Acepto recibir comunicaciones de marketing y novedades de MoOn.
        </CheckboxLabel>
      </div>
    </GlassCard>
  );
}
