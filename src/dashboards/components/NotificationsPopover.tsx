import React from 'react';
import { Notification, NotificationType } from '../../types';
import { HeartIcon, BuildingIcon, PaperAirplaneIcon, UsersIcon, MoonIcon, XIcon } from '../../components/icons';
import GlassCard from '../../components/GlassCard';

interface NotificationsPopoverProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const commonClasses = "w-6 h-6";
  switch (type) {
    case NotificationType.NEW_MATCH:
      return <HeartIcon className={`${commonClasses} text-pink-400`} />;
    case NotificationType.PROPERTY_INQUIRY:
      return <BuildingIcon className={`${commonClasses} text-sky-400`} />;
    case NotificationType.NEW_MESSAGE:
       return <PaperAirplaneIcon className={`${commonClasses} text-green-400`} />;
    case NotificationType.CANDIDATE_ALERT:
      return <UsersIcon className={`${commonClasses} text-purple-400`} />;
    case NotificationType.SYSTEM_ALERT:
    default:
      return <MoonIcon className={`${commonClasses} text-yellow-400`} />;
  }
};

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <GlassCard className="!p-0 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-bold text-lg">Notificaciones</h3>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button onClick={onMarkAllAsRead} className="text-sm text-indigo-400 hover:underline">
              Marcar todo como leído
            </button>
          )}
           <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Cerrar notificaciones">
              <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => onMarkAsRead(notification.id)}
              className={`flex items-start gap-4 p-4 border-b border-white/10 last:border-b-0 cursor-pointer transition-colors ${notification.read ? 'opacity-60' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex-shrink-0 pt-1">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-white/90">{notification.message}</p>
                <p className="text-xs text-white/60 mt-1">{new Date(notification.timestamp).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</p>
              </div>
              {!notification.read && (
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full flex-shrink-0 mt-1.5" aria-label="No leído"></div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-white/70">
            <p>No tienes notificaciones nuevas.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default NotificationsPopover;
