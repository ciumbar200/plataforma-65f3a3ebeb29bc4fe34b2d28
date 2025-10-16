import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon } from '../../components/icons';
import { BlogPost } from '../../types';

interface BlogEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<BlogPost, 'id'> & { id?: number }) => void;
  postToEdit?: BlogPost | null;
}

const BlogEditorModal: React.FC<BlogEditorModalProps> = ({ isOpen, onClose, onSave, postToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    image_url: '',
    content: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setFormData({
          title: postToEdit.title,
          excerpt: postToEdit.excerpt,
          image_url: postToEdit.image_url,
          content: postToEdit.content,
        });
      } else {
        setFormData({ title: '', excerpt: '', image_url: '', content: '' });
      }
    }
  }, [postToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...postToEdit, // a bit of a hack to pass through other properties like author
      ...formData,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-3xl text-white relative !p-0">
        <div className="p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white" aria-label="Cerrar modal">
            <XIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">{postToEdit ? 'Editar Post' : 'Crear Nuevo Post'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto p-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">Título</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-white/80 mb-1">URL de la Imagen de Portada</label>
            <input type="text" name="image_url" id="image_url" value={formData.image_url} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://images.unsplash.com/..." required />
          </div>
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-white/80 mb-1">Extracto (Resumen corto)</label>
            <textarea name="excerpt" id="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" required></textarea>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-white/80 mb-1">Contenido (HTML permitido)</label>
            <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows={10} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="<h2>Título</h2><p>Párrafo...</p>" required></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-slate-900/90 backdrop-blur-sm -m-6 mt-4 p-6 border-t border-white/10">
            <button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-semibold transition-colors">Guardar Post</button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default BlogEditorModal;