import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import { User } from '../../types';
import { RELIGIONS, SEXUAL_ORIENTATIONS } from '../../constants';

interface PrivacyProps {
  user: User;
  onSave: (updatedUser: User) => Promise<void>;
}

const Privacy: React.FC<PrivacyProps> = ({ user, onSave }) => {
    const [formData, setFormData] = useState(user);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            alert('Información de privacidad guardada con éxito.');
        } catch (error) {
            console.error('Error al guardar la información de privacidad:', error);
            alert('No se pudo guardar la información. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const btnStyle = "w-full text-left bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition-colors";
    const btnDangerStyle = "w-full text-left bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-3 px-4 rounded-lg transition-colors";
    
    return (
        <div className="space-y-8">
            <GlassCard>
                <h2 className="text-2xl font-bold mb-4">Información Privada</h2>
                <p className="text-sm text-white/70 mb-6">Esta información es obligatoria y nunca se revelará públicamente. Solo ayuda a nuestro algoritmo a encontrar mejores matches para ti.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="religion" className="block text-sm font-medium text-white/80 mb-1">Religión</label>
                        <select name="religion" id="religion" value={formData.religion || ''} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                             <option value="" disabled className="bg-gray-800">Selecciona una opción</option>
                            {RELIGIONS.map(r => <option key={r} value={r} className="bg-gray-800">{r}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="sexual_orientation" className="block text-sm font-medium text-white/80 mb-1">Orientación Sexual</label>
                        <select name="sexual_orientation" id="sexual_orientation" value={formData.sexual_orientation || ''} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="" disabled className="bg-gray-800">Selecciona una opción</option>
                            {SEXUAL_ORIENTATIONS.map(o => <option key={o} value={o} className="bg-gray-800">{o}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500">
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </GlassCard>

            <GlassCard>
                <h2 className="text-2xl font-bold mb-6">Gestión de Datos</h2>
                <div className="space-y-4">
                    <p className="text-sm text-white/70">Gestiona tus datos personales de acuerdo con el GDPR.</p>
                    <button className={btnStyle}>Descargar mis datos</button>
                    <button className={btnDangerStyle}>Eliminar mi cuenta</button>
                    <p className="text-xs text-white/60 pt-2">La eliminación de la cuenta es irreversible y se procesará en un plazo de 30 días.</p>
                </div>
            </GlassCard>
        </div>
    );
};

export default Privacy;