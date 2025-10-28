import React, { useState, useMemo, useEffect } from 'react';
import { User, Property, UserRole, BlogPost } from '../types';
import StatCard from './components/StatCard';
import { UsersIcon, CheckCircleIcon, BuildingIcon, HeartIcon, ChartBarIcon, ClockIcon, FileTextIcon, SettingsIcon, EyeIcon, TrashIcon, BanIcon, PencilIcon, CheckIcon as CheckMarkIcon, XIcon, PlusIcon, AlertTriangleIcon, MoonIcon, LogoutIcon, MenuIcon } from '../components/icons';
// Internal CRM (Supabase)
import GlassCard from '../components/GlassCard';
import UserDetailsModal from './components/UserDetailsModal';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import ConfirmationModal from './components/ConfirmationModal';
import BlogEditorModal from './components/BlogEditorModal';
import MatchesModal from './components/MatchesModal';
import { supabase } from '../lib/supabaseClient';
// @ts-ignore - Vite raw import of markdown
import blueprintRaw from '../../docs/perfect-app-blueprint.md?raw';
// @ts-ignore - Vite raw import of markdown
import actionPlanRaw from '../../docs/perfect-app-action-plan.md?raw';

type ReferralStats = { invited: number; registered: number; verified: number; contracted: number };
const defaultReferralStats: ReferralStats = { invited: 0, registered: 0, verified: 0, contracted: 0 };

type AdminTab = 'dashboard' | 'users' | 'properties' | 'blog' | 'growth' | 'crm' | 'plan' | 'settings';

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
    initialTab?: AdminTab;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'users', label: 'Usuarios', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'properties', label: 'Propiedades', icon: <BuildingIcon className="w-5 h-5" /> },
    { id: 'blog', label: 'Blog', icon: <FileTextIcon className="w-5 h-5" /> },
    { id: 'growth', label: 'Crecimiento', icon: <HeartIcon className="w-5 h-5" /> },
    { id: 'crm', label: 'CRM', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'plan', label: 'Plan estratégico', icon: <FileTextIcon className="w-5 h-5" /> },
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
    onLogout,
    initialTab
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>(initialTab ?? 'dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [modal, setModal] = useState<string | null>(null);
    const [modalPayload, setModalPayload] = useState<any>(null);
    const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);
    const [adminUsers, setAdminUsers] = useState<User[]>(users);
    const [adminProperties, setAdminProperties] = useState<Property[]>(properties);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [referralStats, setReferralStats] = useState<ReferralStats>(defaultReferralStats);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    useEffect(() => {
        const fetchReferralStats = async () => {
            setIsLoadingStats(true);
            try {
                const statuses = ['invited','registered','verified','contracted'] as const;
                const entries: Partial<ReferralStats> = {};
                for (const s of statuses) {
                    const { count, error } = await supabase
                        .from('referrals')
                        .select('id', { count: 'exact', head: true })
                        .eq('status', s);
                    if (error) throw error;
                    (entries as any)[s] = count || 0;
                }
                setReferralStats(entries as ReferralStats);
            } catch (e) {
                console.warn('Referral stats error', (e as any)?.message);
                setReferralStats(defaultReferralStats);
            } finally {
                setIsLoadingStats(false);
            }
        };
        void fetchReferralStats();
    }, []);

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
    
    useEffect(() => { setAdminUsers(users); }, [users]);
    useEffect(() => { setAdminProperties(properties); }, [properties]);

    const normalizedSearch = search.trim().toLowerCase();
    const filteredUsers = adminUsers
        .filter(u => u.role !== UserRole.ADMIN)
        .filter(u => roleFilter === 'ALL' ? true : u.role === roleFilter)
        .filter(u => {
            if (!normalizedSearch) return true;
            return [u.name, u.email, u.city, u.locality].filter(Boolean).some(v => String(v).toLowerCase().includes(normalizedSearch));
        });

    const approvedProperties = adminProperties.filter(p => p.status === 'approved');
    
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
                <StatCard icon={<UsersIcon className="w-7 h-7 text-white" />} title="Total de Usuarios" value={filteredUsers.length.toLocaleString()} color="indigo" />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard>
                    <h4 className="text-lg font-semibold mb-4">Usuarios por rol</h4>
                    <ul className="space-y-2 text-white/90">
                        <li>Inquilinos: <span className="font-bold">{filteredUsers.filter(u => u.role === UserRole.INQUILINO).length}</span></li>
                        <li>Propietarios: <span className="font-bold">{filteredUsers.filter(u => u.role === UserRole.PROPIETARIO).length}</span></li>
                        <li>Anfitriones: <span className="font-bold">{filteredUsers.filter(u => u.role === UserRole.ANFITRION).length}</span></li>
                    </ul>
                </GlassCard>
                <GlassCard>
                    <h4 className="text-lg font-semibold mb-4">Verificación</h4>
                    <ul className="space-y-2 text-white/90">
                        <li>Perfiles verificados: <span className="font-bold">{filteredUsers.filter(u => (u as any).is_verified).length}</span></li>
                        <li>En revisión: <span className="font-bold">{filteredUsers.filter(u => (u as any).verification_status === 'pending').length}</span></li>
                    </ul>
                </GlassCard>
                <GlassCard>
                    <h4 className="text-lg font-semibold mb-4">Referidos</h4>
                    {isLoadingStats ? (
                        <p className="text-white/70">Cargando…</p>
                    ) : (
                        <ul className="space-y-2 text-white/90">
                            <li>Invitados: <span className="font-bold">{referralStats.invited}</span></li>
                            <li>Registrados: <span className="font-bold">{referralStats.registered}</span></li>
                            <li>Verificados: <span className="font-bold">{referralStats.verified}</span></li>
                            <li>Contratados: <span className="font-bold">{referralStats.contracted}</span></li>
                        </ul>
                    )}
                </GlassCard>
            </div>
            <div className="mt-6">
                <GlassCard>
                    <h4 className="text-lg font-semibold mb-4">Últimos referidos</h4>
                    <RecentReferrals />
                </GlassCard>
            </div>
        </>
    );

    const renderUsers = () => (
        <>
            <h3 className="text-2xl font-bold mb-6 text-white">Gestión de Usuarios</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <div className="flex gap-2 items-center">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar nombre, email o ciudad"
                        className="rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm"
                    />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm">
                        <option value="ALL">Todos</option>
                        <option value={UserRole.INQUILINO}>Inquilinos</option>
                        <option value={UserRole.PROPIETARIO}>Propietarios</option>
                        <option value={UserRole.ANFITRION}>Anfitriones</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            setRefreshing(true);
                            try {
                                const [{ data: u }, { data: p }] = await Promise.all([
                                    supabase.from('profiles').select('*'),
                                    supabase.from('properties').select('*'),
                                ]);
                                setAdminUsers((u as any) || []);
                                setAdminProperties((p as any) || []);
                            } catch {}
                            setRefreshing(false);
                        }}
                        className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm"
                    >{refreshing ? 'Actualizando…' : 'Refrescar'}</button>
                    <button
                        onClick={() => {
                            const rows = filteredUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, city: u.city, locality: u.locality }));
                            const header = Object.keys(rows[0] || { id: '', name: '', email: '', role: '', city: '', locality: '' });
                            const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = 'usuarios.csv'; a.click(); URL.revokeObjectURL(url);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-semibold text-white"
                    >Exportar CSV</button>
                </div>
            </div>
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
                            {filteredUsers.map(user => (
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
                                        <button onClick={() => openModal('edit_user', user)} className="text-white/90 hover:underline text-sm font-semibold px-2">Editar</button>
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
                    {filteredUsers.map(user => (
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
                                <button onClick={() => openModal('edit_user', user)} className="bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Editar</button>
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
                                        <button onClick={() => openModal('edit_property', prop)} className="text-white/90 hover:underline text-sm font-semibold px-2">Editar</button>
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
                                <button onClick={() => openModal('edit_property', prop)} className="bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Editar</button>
                                <button onClick={() => openModal('delete_property', prop)} className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </>
    );

    const PlanView: React.FC = () => {
        const blueprint = blueprintRaw as unknown as string;
        const actionPlan = actionPlanRaw as unknown as string;
        return (
            <div className="space-y-6">
                <GlassCard>
                    <h3 className="text-xl font-bold mb-3">Blueprint estratégico</h3>
                    <div className="bg-black/40 rounded-xl p-4 overflow-auto max-h-[50vh]">
                        <pre className="whitespace-pre-wrap text-sm text-white/90">{blueprint}</pre>
                    </div>
                </GlassCard>
                {actionPlan && (
                    <GlassCard>
                        <h3 className="text-xl font-bold mb-3">Plan de acción</h3>
                        <div className="bg-black/40 rounded-xl p-4 overflow-auto max-h-[50vh]">
                            <pre className="whitespace-pre-wrap text-sm text-white/90">{actionPlan}</pre>
                        </div>
                    </GlassCard>
                )}
            </div>
        );
    };

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
            case 'growth': return <GrowthView />;
            case 'crm': return <CrmView />;
            case 'plan': return <PlanView />;
            case 'settings': return renderSettings();
            default: return null;
        }
    };
    
    return (
        <div className="min-h-[100dvh] w-full flex text-white bg-gray-900">
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
                isOpen={modal === 'delete_user'}
                onClose={closeModal}
                onConfirm={async () => {
                    try {
                        const { data: session } = await supabase.auth.getSession();
                        const token = session.session?.access_token;
                        if (!token) throw new Error('No session');
                        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`;
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ user_id: modalPayload.id })
                        });
                        if (!resp.ok) {
                            const j = await resp.json().catch(() => ({} as any));
                            throw new Error((j as any).error || `Status ${resp.status}`);
                        }
                        setAdminUsers(prev => prev.filter(u => u.id !== modalPayload.id));
                    } catch (e) {
                        alert(`Error eliminando: ${(e as any).message}`);
                    } finally {
                        closeModal();
                    }
                }}
                title={modalPayload?.name ? `Eliminar ${modalPayload.name}` : 'Eliminar usuario'}
                description={'Esta acción eliminará al usuario y sus datos asociados. No se puede deshacer.'}
                confirmText="Sí, eliminar"
                Icon={TrashIcon}
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

// Minimal inline components for edit modals
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-sm">
    <span className="text-white/70">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const EditUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onSaved: () => void; user: User }>= ({ isOpen, onClose, onSaved, user }) => {
  const [form, setForm] = useState<any>({ name: user.name, email: user.email, role: user.role, city: user.city, locality: user.locality, bio: (user as any).bio, is_verified: (user as any).is_verified, verification_status: (user as any).verification_status });
  const [saving, setSaving] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  if (!isOpen) return null;
  const update = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <GlassCard className="w-full max-w-lg text-white !p-0" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold">Editar usuario</h3>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Nombre"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.name || ''} onChange={e => update('name', e.target.value)} /></Field>
          <Field label="Email"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.email || ''} onChange={e => update('email', e.target.value)} /></Field>
          <Field label="Rol">
            <select className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.role} onChange={e => update('role', e.target.value)}>
              {Object.values(UserRole).map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.city || ''} onChange={e => update('city', e.target.value)} /></Field>
            <Field label="Localidad"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.locality || ''} onChange={e => update('locality', e.target.value)} /></Field>
          </div>
          <Field label="Bio"><textarea className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" rows={3} value={form.bio || ''} onChange={e => update('bio', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Verificado">
              <select className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.is_verified ? 'true' : 'false'} onChange={e => update('is_verified', e.target.value === 'true')}>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </Field>
            <Field label="Estado verificación">
              <select className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.verification_status || 'none'} onChange={e => update('verification_status', e.target.value)}>
                {['none','pending','approved','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Link personal de referidos</p>
                <p className="text-xs text-white/70">Úsalo para programas de embajadores.</p>
              </div>
              <button
                disabled={loadingReferral}
                onClick={async () => {
                  setLoadingReferral(true);
                  try {
                    const { data, error } = await supabase.rpc('ensure_referral_link', { uid: user.id });
                    if (error) throw error;
                    setReferralCode(String(data));
                  } catch (e) {
                    alert('Error generando link: ' + (e as any).message);
                  } finally { setLoadingReferral(false); }
                }}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-1.5 rounded-md text-xs"
              >{loadingReferral ? 'Generando…' : (referralCode ? 'Regenerar' : 'Generar')}</button>
            </div>
            {referralCode && (
              <div className="mt-2">
                <p className="text-xs break-all font-mono">Código: {referralCode}</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md">Cancelar</button>
          <button disabled={saving} onClick={async () => {
            setSaving(true);
            try {
              const { error } = await supabase.from('profiles').update({
                name: form.name, email: form.email, role: form.role, city: form.city, locality: form.locality, bio: form.bio,
                is_verified: form.is_verified, verification_status: form.verification_status,
              }).eq('id', user.id);
              if (error) throw error;
              onSaved();
            } catch (e) {
              alert(`Error guardando: ${(e as any).message}`);
            } finally { setSaving(false); }
          }} className="bg-indigo-500 px-3 py-2 rounded-md text-slate-900 font-semibold">Guardar</button>
        </div>
      </GlassCard>
    </div>
  );
};

const CrmView: React.FC = () => {
  // Contacts
  const [contacts, setContacts] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ email: string; name: string; phone?: string; city?: string; locality?: string }>({ email: '', name: '' });
  // Tags
  const [tags, setTags] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  // Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [tplForm, setTplForm] = useState<{ name: string; sendgrid_template_id: string; from_email: string }>({ name: '', sendgrid_template_id: '', from_email: '' });
  const [savingTpl, setSavingTpl] = useState(false);
  // Sequences
  const [sequences, setSequences] = useState<any[]>([]);
  const [seqForm, setSeqForm] = useState<{ name: string }>({ name: '' });
  const [savingSeq, setSavingSeq] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [stepForm, setStepForm] = useState<{ sequence_id?: number; position: number; delay_seconds: number; template_id?: number }>({ position: 1, delay_seconds: 86400 });
  const [enrollForm, setEnrollForm] = useState<{ contact_id?: string; sequence_id?: number; start_delay?: number }>({});
  // Campaigns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campForm, setCampForm] = useState<{ name: string; template_id?: number; target: 'list' | 'tag' | 'dynamic'; list_id?: number; tag_slug?: string; city?: string; locality?: string; has_tags?: string[]; scheduled_at?: string }>({ name: '', target: 'list' });

  const loadContacts = async () => {
    const query = supabase.from('crm_contacts').select('*').order('created_at', { ascending: false }).limit(50);
    const { data, error } = q.trim()
      ? await query.ilike('email', `%${q.trim()}%`)
      : await query;
    if (!error) setContacts(data as any[]);
  };
  const loadTags = async () => {
    const { data } = await supabase.from('crm_tags').select('*').order('name');
    setTags((data as any[]) || []);
  };
  const loadTemplates = async () => {
    const { data } = await supabase.from('email_templates').select('*').order('created_at', { ascending: false }).limit(100);
    setTemplates((data as any[]) || []);
  };
  const loadSequences = async () => {
    const { data } = await supabase.from('crm_sequences').select('*').order('created_at', { ascending: false }).limit(100);
    setSequences((data as any[]) || []);
  };
  const loadCampaigns = async () => {
    const { data } = await supabase.from('crm_campaigns').select('*').order('created_at', { ascending: false }).limit(50);
    setCampaigns((data as any[]) || []);
  };
  const loadSteps = async (sequence_id: number) => {
    const { data } = await supabase.from('crm_sequence_steps').select('*').eq('sequence_id', sequence_id).order('position');
    setSteps((data as any[]) || []);
  };

  useEffect(() => { void loadContacts(); void loadTags(); void loadTemplates(); void loadSequences(); void loadCampaigns(); }, []);

  return (
    <div className="space-y-6">
      {/* Contacts */}
      <GlassCard>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-sm text-white/80">Buscar contactos
                <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" placeholder="email" value={q} onChange={e => setQ(e.target.value)} />
              </label>
            </div>
            <button onClick={loadContacts} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm">Buscar</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-white/80">Email<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} /></label>
            <label className="text-sm text-white/80">Nombre<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} /></label>
            <label className="text-sm text-white/80">Teléfono<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.phone || ''} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} /></label>
            <label className="text-sm text-white/80">Ciudad<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.city || ''} onChange={e => setForm(s => ({ ...s, city: e.target.value }))} /></label>
            <label className="text-sm text-white/80">Localidad<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.locality || ''} onChange={e => setForm(s => ({ ...s, locality: e.target.value }))} /></label>
            <div className="flex items-end">
              <button disabled={creating || !form.email} onClick={async () => {
                setCreating(true);
                try {
                  const { error } = await supabase.rpc('crm_upsert_contact', { p_email: form.email, p_name: form.name || null, p_phone: form.phone || null, p_city: form.city || null, p_locality: form.locality || null });
                  if (error) throw error;
                  setForm({ email: '', name: '' });
                  await loadContacts();
                } catch (e) {
                  alert('Error creando contacto: ' + (e as any).message);
                } finally { setCreating(false); }
              }} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-2 rounded-md text-sm font-semibold text-white">{creating ? 'Guardando…' : 'Crear/Actualizar'}</button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-white text-sm">
              <thead className="sticky top-0 bg-black/30">
                <tr>
                  <th className="p-2">Email</th>
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Ciudad</th>
                  <th className="p-2">Tags</th>
                  <th className="p-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c: any) => (
                  <tr key={c.id} className="border-b border-white/10">
                    <td className="p-2">{c.email}</td>
                    <td className="p-2">{c.name || '—'}</td>
                    <td className="p-2">{c.city || '—'}</td>
                    <td className="p-2">
                      {/* This is a lightweight view; full tag names would require a join */}
                      <em className="text-white/50">via relación</em>
                    </td>
                    <td className="p-2 text-right space-x-2">
                      <button className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md text-xs" onClick={() => setSelectedContact(c.id)}>Añadir tag</button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-md text-xs font-semibold text-white" onClick={() => setEnrollForm(s => ({ ...s, contact_id: c.id }))}>Inscribir en secuencia</button>
                    </td>
                  </tr>
                ))}
                {!contacts.length && <tr><td className="p-3 text-white/70" colSpan={5}>Sin contactos.</td></tr>}
              </tbody>
            </table>
          </div>

          {selectedContact && (
            <div className="mt-3 flex items-end gap-2">
              <label className="text-sm text-white/80 flex-1">Nueva tag
                <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={newTag} onChange={e => setNewTag(e.target.value)} />
              </label>
              <button onClick={async () => {
                try {
                  const { error } = await supabase.rpc('crm_add_tag', { p_contact: selectedContact, p_tag: newTag });
                  if (error) throw error;
                  setNewTag(''); setSelectedContact(null);
                } catch (e) { alert('Error tag: ' + (e as any).message); }
              }} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm">Añadir</button>
              <button onClick={() => setSelectedContact(null)} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm">Cerrar</button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Templates */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Plantillas (SendGrid)</h4>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-white/80">Nombre<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={tplForm.name} onChange={e => setTplForm(s => ({ ...s, name: e.target.value }))} /></label>
          <label className="text-sm text-white/80">Template ID<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={tplForm.sendgrid_template_id} onChange={e => setTplForm(s => ({ ...s, sendgrid_template_id: e.target.value }))} /></label>
          <label className="text-sm text-white/80">From Email<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={tplForm.from_email} onChange={e => setTplForm(s => ({ ...s, from_email: e.target.value }))} /></label>
          <div className="flex items-end">
            <button disabled={savingTpl || !tplForm.name || !tplForm.sendgrid_template_id} onClick={async () => {
              setSavingTpl(true);
              try {
                const { error } = await supabase.from('email_templates').insert({ name: tplForm.name, provider: 'sendgrid', sendgrid_template_id: tplForm.sendgrid_template_id, from_email: tplForm.from_email || null });
                if (error) throw error;
                setTplForm({ name: '', sendgrid_template_id: '', from_email: '' });
                await loadTemplates();
              } catch (e) { alert('Error guardando plantilla: ' + (e as any).message); } finally { setSavingTpl(false); }
            }} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-2 rounded-md text-sm font-semibold text-white">{savingTpl ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <p className="font-semibold">{t.name}</p>
              <p className="text-white/60">{t.sendgrid_template_id || '—'}</p>
            </div>
          ))}
          {!templates.length && <p className="text-white/70">Sin plantillas.</p>}
        </div>
      </GlassCard>

      {/* Sequences */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Secuencias</h4>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-white/80">Nombre de secuencia<input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={seqForm.name} onChange={e => setSeqForm({ name: e.target.value })} /></label>
          <div className="flex items-end">
            <button disabled={savingSeq || !seqForm.name} onClick={async () => {
              setSavingSeq(true);
              try {
                const { data, error } = await supabase.from('crm_sequences').insert({ name: seqForm.name, is_active: true }).select('id').single();
                if (error) throw error;
                setSeqForm({ name: '' });
                await loadSequences();
                await loadSteps(data!.id);
                setStepForm({ sequence_id: data!.id, position: 1, delay_seconds: 86400 });
              } catch (e) { alert('Error creando secuencia: ' + (e as any).message); } finally { setSavingSeq(false); }
            }} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-2 rounded-md text-sm font-semibold text-white">Crear</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {sequences.map((s) => (
              <button key={s.id} onClick={() => { void loadSteps(s.id); setStepForm(sf => ({ ...sf, sequence_id: s.id })); }} className="w-full text-left rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-white/60">Activa: {s.is_active ? 'Sí' : 'No'}</p>
              </button>
            ))}
            {!sequences.length && <p className="text-white/70">Sin secuencias.</p>}
          </div>
          <div className="space-y-3">
            <h5 className="font-semibold">Pasos de la secuencia</h5>
            <div className="space-y-2">
              {steps.map((st) => (
                <div key={st.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="font-semibold">Paso {st.position} • +{st.delay_seconds}s</p>
                  <p className="text-white/60">Plantilla ID: {st.template_id || '—'}</p>
                </div>
              ))}
              {!steps.length && <p className="text-white/70">Selecciona una secuencia.</p>}
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <label className="text-sm text-white/80">Posición<input type="number" min={1} className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={stepForm.position} onChange={e => setStepForm(s => ({ ...s, position: Number(e.target.value || 1) }))} /></label>
              <label className="text-sm text-white/80">Delay (s)<input type="number" className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={stepForm.delay_seconds} onChange={e => setStepForm(s => ({ ...s, delay_seconds: Number(e.target.value || 0) }))} /></label>
              <label className="text-sm text-white/80">Template
                <select className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={stepForm.template_id || ''} onChange={e => setStepForm(s => ({ ...s, template_id: e.target.value ? Number(e.target.value) : undefined }))}>
                  <option value="">—</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <div className="flex items-end">
                <button disabled={!stepForm.sequence_id || !stepForm.position || !stepForm.template_id} onClick={async () => {
                  try {
                    const { error } = await supabase.from('crm_sequence_steps').insert({ sequence_id: stepForm.sequence_id, position: stepForm.position, delay_seconds: stepForm.delay_seconds, template_id: stepForm.template_id });
                    if (error) throw error;
                    await loadSteps(stepForm.sequence_id!);
                  } catch (e) { alert('Error guardando paso: ' + (e as any).message); }
                }} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm">Añadir paso</button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Enrollments */}
      <GlassCard>
        <h4 className="text-lg font-semibold mb-2">Inscribir contacto en secuencia</h4>
        <div className="grid gap-2 sm:grid-cols-4">
          <label className="text-sm text-white/80">Contacto
            <select className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={enrollForm.contact_id || ''} onChange={e => setEnrollForm(s => ({ ...s, contact_id: e.target.value || undefined }))}>
              <option value="">—</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
            </select>
          </label>
          <label className="text-sm text-white/80">Secuencia
            <select className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={enrollForm.sequence_id || ''} onChange={e => setEnrollForm(s => ({ ...s, sequence_id: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">—</option>
              {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="text-sm text-white/80">Comienza en (s)
            <input type="number" className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={enrollForm.start_delay || 0} onChange={e => setEnrollForm(s => ({ ...s, start_delay: Number(e.target.value || 0) }))} />
          </label>
          <div className="flex items-end">
            <button onClick={async () => {
              try {
                if (!enrollForm.contact_id || !enrollForm.sequence_id) return;
                const { error } = await supabase.rpc('crm_enroll_contact', { p_contact: enrollForm.contact_id, p_sequence: enrollForm.sequence_id, p_start_delay_seconds: enrollForm.start_delay || 0 });
                if (error) throw error;
                alert('Inscrito');
              } catch (e) { alert('Error inscribiendo: ' + (e as any).message); }
            }} className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-semibold text-white">Inscribir</button>
          </div>
        </div>
      </GlassCard>

      {/* Campaigns */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Campañas (envíos masivos)</h4>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-white/80">Nombre
            <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.name} onChange={e => setCampForm(s => ({ ...s, name: e.target.value }))} />
          </label>
          <label className="text-sm text-white/80">Plantilla
            <select className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.template_id || ''} onChange={e => setCampForm(s => ({ ...s, template_id: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">—</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="text-sm text-white/80">Cuándo (ISO)
            <input placeholder="2025-12-31T20:00:00Z" className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.scheduled_at || ''} onChange={e => setCampForm(s => ({ ...s, scheduled_at: e.target.value }))} />
          </label>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <label className="text-sm text-white/80">Objetivo
            <select className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.target} onChange={e => setCampForm(s => ({ ...s, target: e.target.value as any }))}>
              <option value="list">Lista</option>
              <option value="tag">Tag</option>
              <option value="dynamic">Dinámico</option>
            </select>
          </label>
          {campForm.target === 'list' && (
            <label className="text-sm text-white/80">Lista
              <select className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.list_id || ''} onChange={e => setCampForm(s => ({ ...s, list_id: e.target.value ? Number(e.target.value) : undefined }))}>
                <option value="">—</option>
                {/* Simplificación: cargar listas al arrancar si las necesitas */}
                {/* Puedes reutilizar loadLists si añadimos estado */}
              </select>
            </label>
          )}
          {campForm.target === 'tag' && (
            <label className="text-sm text-white/80">Tag slug
              <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.tag_slug || ''} onChange={e => setCampForm(s => ({ ...s, tag_slug: e.target.value }))} />
            </label>
          )}
          {campForm.target === 'dynamic' && (
            <>
              <label className="text-sm text-white/80">Ciudad
                <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.city || ''} onChange={e => setCampForm(s => ({ ...s, city: e.target.value }))} />
              </label>
              <label className="text-sm text-white/80">Localidad
                <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={campForm.locality || ''} onChange={e => setCampForm(s => ({ ...s, locality: e.target.value }))} />
              </label>
              <label className="text-sm text-white/80">Tags (coma)
                <input className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" placeholder="moon-inquilino, verified" value={(campForm.has_tags || []).join(',')} onChange={e => setCampForm(s => ({ ...s, has_tags: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} />
              </label>
            </>
          )}
          <div className="flex items-end">
            <button onClick={async () => {
              try {
                if (!campForm.name || !campForm.template_id) { alert('Nombre y plantilla son obligatorios'); return; }
                const payload: any = { name: campForm.name, template_id: campForm.template_id, status: 'scheduled' as const, scheduled_at: campForm.scheduled_at || new Date().toISOString() };
                if (campForm.target === 'list') payload.list_id = campForm.list_id || null;
                if (campForm.target === 'tag') payload.tag_slug = campForm.tag_slug || null;
                if (campForm.target === 'dynamic') payload.definition = { city: campForm.city || undefined, locality: campForm.locality || undefined, has_tags: campForm.has_tags && campForm.has_tags.length ? campForm.has_tags : undefined };
                const { error } = await supabase.from('crm_campaigns').insert(payload);
                if (error) throw error;
                setCampForm({ name: '', target: 'list' });
                await loadCampaigns();
                alert('Campaña programada');
              } catch (e) { alert('Error creando campaña: ' + (e as any).message); }
            }} className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-semibold text-white">Programar</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-white text-sm">
            <thead className="sticky top-0 bg-black/30">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Programada</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-white/10">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2 capitalize">{c.status}</td>
                  <td className="p-2">{c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {!campaigns.length && <tr><td className="p-3 text-white/70" colSpan={3}>Sin campañas.</td></tr>}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

const EditPropertyModal: React.FC<{ isOpen: boolean; onClose: () => void; onSaved: () => void; property: Property }>= ({ isOpen, onClose, onSaved, property }) => {
  const [form, setForm] = useState<any>({ title: property.title, price: property.price, visibility: property.visibility, city: property.city, locality: property.locality, address: property.address, status: property.status });
  const [saving, setSaving] = useState(false);
  if (!isOpen) return null;
  const update = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <GlassCard className="w-full max-w-lg text-white !p-0" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold">Editar propiedad</h3>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Título"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.title || ''} onChange={e => update('title', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio (€)"><input type="number" className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.price || 0} onChange={e => update('price', Number(e.target.value))} /></Field>
            <Field label="Visibilidad">
              <select className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.visibility} onChange={e => update('visibility', e.target.value)}>
                {['Pública','Privada'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.city || ''} onChange={e => update('city', e.target.value)} /></Field>
            <Field label="Localidad"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.locality || ''} onChange={e => update('locality', e.target.value)} /></Field>
          </div>
          <Field label="Dirección"><input className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.address || ''} onChange={e => update('address', e.target.value)} /></Field>
          <Field label="Estado">
            <select className="w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.status} onChange={e => update('status', e.target.value)}>
              {['pending','approved','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md">Cancelar</button>
          <button disabled={saving} onClick={async () => {
            setSaving(true);
            try {
              const { error } = await supabase.from('properties').update({
                title: form.title, price: form.price, visibility: form.visibility, city: form.city, locality: form.locality, address: form.address, status: form.status,
              }).eq('id', property.id);
              if (error) throw error;
              onSaved();
            } catch (e) {
              alert(`Error guardando: ${(e as any).message}`);
            } finally { setSaving(false); }
          }} className="bg-indigo-500 px-3 py-2 rounded-md text-slate-900 font-semibold">Guardar</button>
        </div>
      </GlassCard>
    </div>
  );
};

const RecentReferrals: React.FC = () => {
  const [rows, setRows] = useState<Array<{ id: number; referee_user_id: string | null; referee_email: string | null; status: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('referrals').select('id, referee_user_id, referee_email, status, created_at').order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      setRows((data as any) || []);
    } catch (e) {
      console.warn('RecentReferrals error', (e as any)?.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  if (loading) return <p className="text-white/70">Cargando…</p>;
  if (!rows.length) return <p className="text-white/70">Sin referidos recientes.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-white text-sm">
        <thead className="sticky top-0 bg-black/30">
          <tr>
            <th className="p-2">Fecha</th>
            <th className="p-2">Email</th>
            <th className="p-2">Estado</th>
            <th className="p-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-b border-white/10">
              <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-2">{r.referee_email || 'N/A'}</td>
              <td className="p-2 capitalize">{r.status}</td>
              <td className="p-2 text-right">
                <button
                  className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-md mr-2 disabled:opacity-50"
                  disabled={!r.referee_user_id || r.status === 'contracted'}
                  onClick={async () => {
                    if (!r.referee_user_id) return;
                    const { error } = await supabase.rpc('admin_mark_referral_contracted', { p_referee: r.referee_user_id });
                    if (error) { alert('Error: ' + error.message); return; }
                    void load();
                  }}
                >Marcar contratado</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const GrowthView: React.FC = () => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [invites, setInvites] = useState<Array<{ id: number; code: string; invited_email: string | null; expires_at: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ count: number; invited_email: string; expires_at: string }>(() => ({ count: 5, invited_email: '', expires_at: '' }));
  const [outbox, setOutbox] = useState<Array<{ id: number; to_email: string; template: string; status: string; scheduled_at: string; sent_at: string | null; error: string | null }>>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const tok = data.session?.access_token ?? null;
      setSessionToken(tok || null);
    }).catch(() => setSessionToken(null));
  }, []);

  const listInvites = async () => {
    if (!sessionToken) return;
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ambassador-codes?limit=50`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${sessionToken}` } });
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json();
      setInvites(body.data || []);
    } catch (e) {
      console.warn('List invites error', (e as any).message);
    } finally {
      setLoading(false);
    }
  };

  const createInvites = async () => {
    if (!sessionToken) return;
    setCreating(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ambassador-codes`;
      const payload: any = { count: Math.max(1, Math.min(100, Number(form.count) || 1)) };
      if (form.invited_email.trim()) payload.invited_email = form.invited_email.trim();
      if (form.expires_at.trim()) payload.expires_at = form.expires_at.trim();
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await listInvites();
    } catch (e) {
      alert('Error creando códigos: ' + (e as any).message);
    } finally { setCreating(false); }
  };

  const loadOutbox = async () => {
    try {
      const { data, error } = await supabase
        .from('email_outbox')
        .select('id, to_email, template, status, scheduled_at, sent_at, error')
        .order('scheduled_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      setOutbox((data as any) || []);
    } catch (e) {
      console.warn('Outbox error', (e as any).message);
    }
  };

  useEffect(() => { void listInvites(); void loadOutbox(); }, [sessionToken]);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-2 text-white">Crecimiento: embajadores, referidos y emails</h3>
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-sm text-white/80">Cantidad
              <input type="number" min={1} max={100} className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.count} onChange={e => setForm(s => ({ ...s, count: Number(e.target.value || 1) }))} />
            </label>
            <label className="text-sm text-white/80">Email invitado (opcional)
              <input placeholder="alguien@dominio.com" className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.invited_email} onChange={e => setForm(s => ({ ...s, invited_email: e.target.value }))} />
            </label>
            <label className="text-sm text-white/80">Expira (ISO opcional)
              <input placeholder="2025-12-31T23:59:59Z" className="mt-1 w-full rounded-md bg-white/10 border-white/20 px-3 py-2" value={form.expires_at} onChange={e => setForm(s => ({ ...s, expires_at: e.target.value }))} />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={createInvites} disabled={creating || !sessionToken} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-2 rounded-md text-sm font-semibold text-white">{creating ? 'Creando…' : 'Crear códigos'}</button>
            <button onClick={listInvites} disabled={loading || !sessionToken} className="bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-2 rounded-md text-sm">{loading ? 'Cargando…' : 'Refrescar'}</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-white text-sm">
            <thead className="sticky top-0 bg-black/30">
              <tr>
                <th className="p-2">Código</th>
                <th className="p-2">Email</th>
                <th className="p-2">Expira</th>
                <th className="p-2">Creado</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(row => (
                <tr key={row.id} className="border-b border-white/10">
                  <td className="p-2 font-mono text-xs">{row.code}</td>
                  <td className="p-2">{row.invited_email || '—'}</td>
                  <td className="p-2">{row.expires_at || '—'}</td>
                  <td className="p-2">{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!invites.length && (
                <tr><td className="p-3 text-white/70" colSpan={4}>Sin códigos aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Email Outbox (últimos 25)</h4>
          <div className="flex gap-2">
            <button onClick={loadOutbox} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm">Refrescar</button>
            <button onClick={async () => { try { await fetch('/api/automation/trigger', { method: 'POST' }); await loadOutbox(); } catch (e) { alert('Error trigger: ' + (e as any).message); } }} className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-semibold text-white">Ejecutar ahora</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white text-sm">
            <thead className="sticky top-0 bg-black/30">
              <tr>
                <th className="p-2">Para</th>
                <th className="p-2">Template</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Programado</th>
                <th className="p-2">Enviado</th>
                <th className="p-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {outbox.map(r => (
                <tr key={r.id} className="border-b border-white/10">
                  <td className="p-2">{r.to_email}</td>
                  <td className="p-2 font-mono text-xs">{r.template}</td>
                  <td className="p-2 capitalize">{r.status}</td>
                  <td className="p-2">{new Date(r.scheduled_at).toLocaleString()}</td>
                  <td className="p-2">{r.sent_at ? new Date(r.sent_at).toLocaleString() : '—'}</td>
                  <td className="p-2 text-right">
                    <button className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md text-xs" disabled={r.status !== 'error'} onClick={async () => {
                      const { error } = await supabase.from('email_outbox').update({ status: 'pending', scheduled_at: new Date().toISOString(), error: null }).eq('id', r.id);
                      if (error) { alert('Error re-programando: ' + error.message); return; }
                      await loadOutbox();
                    }}>Re-intentar</button>
                  </td>
                </tr>
              ))}
              {!outbox.length && (
                <tr><td className="p-3 text-white/70" colSpan={6}>Sin emails en cola.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">CRM rápido: exportar contactos con tags</h4>
          <button
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                const { data, error } = await supabase
                  .from('profiles')
                  .select('id, name, email, role, city, locality, is_verified, convivencia_quiz_completed')
                  .limit(1000);
                if (error) throw error;
                const rows = (data as any[]).map((p) => {
                  const tags: string[] = [];
                  if (p.role === 'INQUILINO') tags.push('moon-inquilino');
                  if (p.role === 'PROPIETARIO') tags.push('moon-propietario');
                  if (p.role === 'ANFITRION') tags.push('moon-anfitrion');
                  if (p.role === 'ADMIN') tags.push('moon-admin');
                  if (p.is_verified) tags.push('verified');
                  if (p.convivencia_quiz_completed) tags.push('quiz-completed');
                  if (p.city) tags.push(`city:${p.city}`);
                  if (p.locality) tags.push(`locality:${p.locality}`);
                  return {
                    id: p.id,
                    name: p.name || '',
                    email: p.email || '',
                    role: p.role || '',
                    city: p.city || '',
                    locality: p.locality || '',
                    tags: tags.join(' | '),
                  };
                });
                const headers = ['id','name','email','role','city','locality','tags'];
                const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'contacts_export.csv'; a.click(); URL.revokeObjectURL(url);
              } catch (e) {
                alert('Error exportando: ' + (e as any).message);
              } finally { setExporting(false); }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-2 rounded-md text-sm font-semibold text-white"
          >{exporting ? 'Exportando…' : 'Exportar CSV'}</button>
        </div>
        <p className="text-white/70 text-sm">Exporta contactos con tags derivadas (rol, verificación, ciudad/localidad). Útil para importar a FluentCRM u otro CRM.</p>
      </GlassCard>
    </div>
  );
};
