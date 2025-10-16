
import React from 'react';
import GlassCard from '../../components/GlassCard';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: 'indigo' | 'purple' | 'green' | 'blue';
    onClick?: () => void;
}

const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-700',
    purple: 'from-purple-500 to-purple-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, onClick }) => {
    return (
        <GlassCard 
            className={`!p-0 overflow-hidden ${onClick ? 'cursor-pointer hover:border-white/40 transition-all' : ''}`}
            onClick={onClick}
        >
            <div className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-white/70">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
};

export default StatCard;