import React, { useState, useMemo } from 'react';
import { User, Property, UserRole, BlogPost } from '../types';
import StatCard from './components/StatCard';
import { UsersIcon, CheckCircleIcon, BuildingIcon, HeartIcon, ChartBarIcon, ClockIcon, FileTextIcon, SettingsIcon, EyeIcon, TrashIcon, BanIcon, PencilIcon, CheckIcon as CheckMarkIcon, XIcon, PlusIcon, AlertTriangleIcon, MoonIcon, LogoutIcon, MenuIcon } from '../components/icons';
import GlassCard from '../components/GlassCard';
import UserDetailsModal from './components/UserDetailsModal';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import ConfirmationModal from './components/ConfirmationModal';
import BlogEditorModal from './components/BlogEditorModal';
import MatchesModal from './components/MatchesModal';

type AdminTab = 'dashboard' | 'users' | 'properties' | 'blog' | 'settings';

// FIX: Define a type for navigation items to ensure type safety for optional properties like 'count'.
type NavItem = {
    id: AdminTab;
    label: string;
    // FIX: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
    icon: React.ReactNode;
    count?: number;
};

interface AdminDashboardProps {
    users: User[];
    properties: Property[];
    blogPosts: BlogPost[];
    matches: { [key: string]: string[] };
    onDeleteProperty: (propertyId: number) => void;
    onSetUserBanStatus: (userId: string, isBanned: boolean) => void;
    onSaveBlogPost: (post: Omit<BlogPost, 'id'> & { id?: number }) => void;
    onDeleteBlogPost: (postId: number) => void;
    onLogout: () => void;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'users', label: 'Usuarios', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'properties', label: 'Propiedades', icon: <BuildingIcon className="w-5 h-5" /> },
    { id: 'blog', label: 'Blog', icon: <FileTextIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Ajustes', icon: <SettingsIcon className="w-5 h-5" /> },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, 
    properties, 
    blogPosts, 
    matches,
    onDeleteProperty,
    onSetUserBanStatus,
    onSaveBlogPost,
    onDeleteBlogPost,
    onLogout
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [modal, setModal] = useState<string | null>(null);
    const [modalPayload, setModalPayload] = useState<any>(null);
    const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);

    const openModal = (name: string, payload?: any) => {
        setModal(name);
        setModalPayload(payload);
    };

    const closeModal = () => {
        setModal(null);
        setModalPayload(null);
        setSelectedUser(null);
        setSelectedProperty(null);
    };
    
    const displayUsers = users.filter(u => u.role !== UserRole.ADMIN);
    const approvedProperties = properties.filter(p => p.status === 'approved');
    
    const activeMatchesCount = useMemo(() => {
        let count = 0;
        const userIds = Object.keys(matches);
        const processed = new Set<string>();

        for (const userId1 of userIds) {
            const user1Matches = matches[userId1] || [];
            for (const userId2 of user1Matches) {
                const key1 = `${userId1}-${userId2}`;
                const key2 = `${userId2}-${userId1}`;
                if (processed.has(key1) || processed.has(key2)) continue;
                
                const user2Matches = matches[userId2] || [];
                if (user2Matches.includes(userId1)) {
                    count++;
                    processed.add(key1);
                    processed.add(key2);
                }
            }
        }
        return count;
    }, [matches]);

    const renderDashboard = () => (
        <>
            <h3 className="text-2xl font-bold mb-6 text-white">Resumen General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<UsersIcon className="w-7 h-7 text-white" />} title="Total de Usuarios" value={displayUsers.length.toLocaleString()} color="indigo" />
                <StatCard 
                    icon={<HeartIcon className="w-7 h-7 text-white" />} 
                    title="Coincidencias Activas" 
                    value={activeMatchesCount.toLocaleString()} 
                    color="purple" 
                    onClick={() => setIsMatchesModalOpen(true)}
                />
                <StatCard icon={<BuildingIcon className="w-7 h-7 text-white" />} title="Propiedades Listadas" value={approvedProperties.length.toLocaleString()} color="blue" />
                <StatCard icon={<CheckCircleIcon className="w-7 h-7 text-white" />} title="Matches Exitosos" value="0" color="green" />
            </div>
        </>
    );

    const renderUsers = () => (
        <>
            <h3 className="text-2xl font-bold mb-6 text-white">Gestión de Usuarios</h3>
            <GlassCard>
                {/* Desktop Table */}
                <div className="overflow-x-auto max-h-[60vh] hidden md:block">
                    <table className="w-full text-left text-white">
                        <thead className="sticky top-0 bg-black/40 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 font-semibold">Usuario</th>
                                <th className="p-3 font-semibold">Rol</th>
                                <th className="p-3 font-semibold">Estado</th>
                                <th className="p-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayUsers.map(user => (
                                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-sm text-white/70">{user.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 capitalize">{user.role.toLowerCase()}</td>
                                    <td className="p-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.is_banned ? 'bg-red-500/50 text-red-300' : 'bg-green-500/50 text-green-300'}`}>
                                            {user.is_banned ? 'Baneado' : 'Activo'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => setSelectedUser(user)} className="text-indigo-400 hover:underline text-sm font-semibold px-2">Ver</button>
                                        <button onClick={() => openModal('ban_user', user)} className={`font-semibold text-sm px-2 ${user.is_banned ? 'text-green-400 hover:underline' : 'text-red-400 hover:underline'}`}>
                                            {user.is_banned ? 'Quitar Ban' : 'Banear'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {displayUsers.map(user => (
                        <div key={user.id} className="bg-black/20 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-bold text-lg">{user.name}</p>
                                    <p className="text-sm text-white/70">{user.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-3">
                                <p>Rol: <span className="font-semibold capitalize">{user.role.toLowerCase()}</span></p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.is_banned ? 'bg-red-500/50 text-red-300' : 'bg-green-500/50 text-green-300'}`}>
                                    {user.is_banned ? 'Baneado' : 'Activo'}
                                </span>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                                <button onClick={() => setSelectedUser(user)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Ver</button>
                                <button onClick={() => openModal('ban_user', user)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${user.is_banned ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {user.is_banned ? 'Quitar Ban' : 'Banear'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </>
    );
    
    const renderProperties = () => (
        <>
            <h3 className="text-2xl font-bold mb-6 text-white">Gestión de Propiedades Aprobadas</h3>
            <GlassCard>
                 <div className="overflow-x-auto max-h-[60vh] hidden md:block">
                    <table className="w-full text-left text-white">
                        <thead className="sticky top-0 bg-black/40 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 font-semibold">Propiedad</th>
                                <th className="p-3 font-semibold">Precio</th>
                                <th className="p-3 font-semibold">Visibilidad</th>
                                <th className="p-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedProperties.map(prop => (
                                <tr key={prop.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-3"><p className="font-semibold">{prop.title}</p><p className="text-sm text-white/70">{prop.address}</p></td>
                                    <td className="p-3">€{prop.price.toLocaleString()}</td>
                                    <td className="p-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${prop.visibility === 'Pública' ? 'bg-green-500' : 'bg-yellow-500'}`}>{prop.visibility}</span></td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => setSelectedProperty(prop)} className="text-indigo-400 hover:underline text-sm font-semibold px-2">Ver</button>
                                        <button onClick={() => openModal('delete_property', prop)} className="text-red-400 hover:underline text-sm font-semibold px-2">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Cards */}
                 <div className="md:hidden space-y-4">
                    {approvedProperties.map(prop => (
                        <div key={prop.id} className="bg-black/20 p-4 rounded-lg">
                            <p className="font-bold text-lg">{prop.title}</p>
                            <p className="text-sm text-white/70 mb-2">{prop.address}</p>
                            <div className="flex justify-between items-center text-sm mb-3">
                                <p>Precio: <span className="font-semibold">€{prop.price.toLocaleString()}</span></p>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${prop.visibility === 'Pública' ? 'bg-green-500' : 'bg-yellow-500'}`}>{prop.visibility}</span>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                                <button onClick={() => setSelectedProperty(prop)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Ver</button>
                                <button onClick={() => openModal('delete_property', prop)} className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </>
    );

    const renderBlog = () => (
         <>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Gestión de Blog</h3>
                <button onClick={() => openModal('edit_blog')} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    <PlusIcon className="w-5 h-5" /> Nuevo Post
                </button>
            </div>
            <GlassCard>
                <div className="overflow-x-auto max-h-[60vh] hidden md:block">
                    <table className="w-full text-left text-white">
                        <thead className="sticky top-0 bg-black/40 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 font-semibold">Título</th>
                                <th className="p-3 font-semibold">Autor</th>
                                <th className="p-3 font-semibold">Fecha</th>
                                <th className="p-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogPosts.map(post => (
                                <tr key={post.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-3 font-semibold">{post.title}</td>
                                    <td className="p-3">{post.author}</td>
                                    <td className="p-3">{new Date(post.publish_date).toLocaleDateString()}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => openModal('edit_blog', post)} className="text-indigo-400 hover:underline text-sm font-semibold px-2">Editar</button>
                                        <button onClick={() => openModal('delete_blog', post)} className="text-red-400 hover:underline text-sm font-semibold px-2">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* Mobile Cards */}
                 <div className="md:hidden space-y-4">
                    {blogPosts.map(post => (
                        <div key={post.id} className="bg-black/20 p-4 rounded-lg">
                            <p className="font-bold text-lg">{post.title}</p>
                            <p className="text-sm text-white/70 mb-2">Por {post.author} el {new Date(post.publish_date).toLocaleDateString()}</p>
                            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                                <button onClick={() => openModal('edit_blog', post)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Editar</button>
                                <button onClick={() => openModal('delete_blog', post)} className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </>
    );

    const renderSettings = () => (
         <>
            <h3 className="text-2xl font-bold mb-6 text-white">Ajustes del Sistema</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard>
                    <h4 className="text-xl font-bold mb-4">Configuración SMTP</h4>
                    <form className="space-y-4">
                        <div><label className="block text-sm text-white/80 mb-1">Servidor SMTP</label><input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg p-2 outline-none" placeholder="smtp.example.com"/></div>
                        <div><label className="block text-sm text-white/80 mb-1">Puerto</label><input type="number" className="w-full bg-white/10 border border-white/20 rounded-lg p-2 outline-none" placeholder="587"/></div>
                        <div><label className="block text-sm text-white/80 mb-1">Usuario</label><input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg p-2 outline-none" placeholder="user@example.com"/></div>
                        <div><label className="block text-sm text-white/80 mb-1">Contraseña</label><input type="password" className="w-full bg-white/10 border border-white/20 rounded-lg p-2 outline-none"/></div>
                        <div className="flex gap-4 pt-2">
                             <button type="button" onClick={() => alert('Configuración guardada (simulación).')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Guardar</button>
                             <button type="button" onClick={() => alert('Email de prueba enviado (simulación).')} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors">Enviar Email de Prueba</button>
                        </div>
                    </form>
                </GlassCard>
                 <GlassCard>
                    <h4 className="text-xl font-bold mb-4">Mensajes Globales</h4>
                     <form className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/80 mb-1">Mensaje de Mantenimiento</label>
                            <textarea className="w-full bg-white/10 border border-white/20 rounded-lg p-2 outline-none" rows={4} placeholder="Ej: El sistema estará en mantenimiento esta noche de 02:00 a 03:00 AM."></textarea>
                        </div>
                        <button type="button" onClick={() => alert('Mensaje global enviado (simulación).')} className="w-full bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">Enviar Notificación a Todos</button>
                     </form>
                </GlassCard>
            </div>
        </>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return renderDashboard();
            case 'users': return renderUsers();
            case 'properties': return renderProperties();
            case 'blog': return renderBlog();
            case 'settings': return renderSettings();
            default: return null;
        }
    };
    
    return (
        <div className="h-full w-full flex text-white bg-gray-900">
            {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setIsSidebarOpen(false)}></div>}
            
            <nav className={`fixed inset-y-0 left-0 w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-4 flex-shrink-0 flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <MoonIcon className="w-8 h-8 text-white" />
                        <span className="text-xl font-bold">Admin Panel</span>
                    </div>
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button onClick={() => { setActiveTab(item.id as AdminTab); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left font-semibold text-sm transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {/* FIX: Changed the check for 'item.count' to be type-safe. The 'NavItem' type ensures 'item.count' is a number if it exists. */}
                                    {item.count && item.count > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{item.count}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-auto hidden md:block">
                    <button 
                        onClick={onLogout} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold text-sm text-red-400/80 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </nav>
            
            <div className="flex-1 flex flex-col h-full">
                <header className="md:hidden bg-black/20 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-20">
                    <button onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-bold">Admin Panel</span>
                    <button onClick={onLogout} aria-label="Cerrar sesión">
                        <LogoutIcon className="w-6 h-6 text-red-400"/>
                    </button>
                </header>
                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            
            {/* Modals */}
            <UserDetailsModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
            <PropertyDetailsModal isOpen={!!selectedProperty} onClose={() => setSelectedProperty(null)} property={selectedProperty} />

            <ConfirmationModal
                isOpen={modal === 'ban_user'}
                onClose={closeModal}
                onConfirm={() => {
                    onSetUserBanStatus(modalPayload.id, !modalPayload.is_banned);
                    closeModal();
                }}
                title={modalPayload?.is_banned ? `Quitar Ban a ${modalPayload?.name}` : `Banear a ${modalPayload?.name}`}
                description={`¿Estás seguro de que quieres ${modalPayload?.is_banned ? 'quitar el ban a' : 'banear a'} este usuario? ${modalPayload?.is_banned ? 'Podrá volver a acceder a la plataforma.' : 'No podrá iniciar sesión.'}`}
                confirmText={modalPayload?.is_banned ? 'Quitar Ban' : 'Sí, Banear'}
                Icon={BanIcon}
                color="red"
            />
             <ConfirmationModal
                isOpen={modal === 'delete_property'}
                onClose={closeModal}
                onConfirm={() => {
                    onDeleteProperty(modalPayload.id);
                    closeModal();
                }}
                title="Eliminar Propiedad"
                description={`¿Estás seguro de que quieres eliminar "${modalPayload?.title}"? Esta acción es irreversible.`}
                confirmText="Sí, Eliminar"
                Icon={TrashIcon}
                color="red"
            />
            <ConfirmationModal
                isOpen={modal === 'delete_blog'}
                onClose={closeModal}
                onConfirm={() => {
                    onDeleteBlogPost(modalPayload.id);
                    closeModal();
                }}
                title="Eliminar Post del Blog"
                description={`¿Estás seguro de que quieres eliminar "${modalPayload?.title}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                Icon={TrashIcon}
                color="red"
            />
            <BlogEditorModal
                isOpen={modal === 'edit_blog'}
                onClose={closeModal}
                onSave={(post) => {
                    onSaveBlogPost(post);
                    closeModal();
                }}
                postToEdit={modalPayload}
            />
            <MatchesModal 
                isOpen={isMatchesModalOpen}
                onClose={() => setIsMatchesModalOpen(false)}
                users={users}
                matches={matches}
            />
        </div>
    );
};

export default AdminDashboard;