import React, { useMemo, useState } from 'react';
import type { Notification } from '../types';
import { BellIcon, CheckIcon } from './icons';
import GlassCard from './GlassCard';

interface NotificationBellProps {
  notifications: Notification[];
  onOpenCenter?: () => void;
  onMarkAsRead?: (id: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onOpenCenter, onMarkAsRead }) => {
  const [open, setOpen] = useState(false);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  const latestNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Abrir centro de notificaciones"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-400 px-1 text-[10px] font-bold text-rose-950 shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-3 w-80 max-w-[90vw]">
          <GlassCard className="border-white/10 bg-slate-950/95">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Actividad</p>
                <h4 className="text-lg font-semibold text-white">Tus notificaciones</h4>
              </div>
              {onOpenCenter && (
                <button
                  type="button"
                  onClick={onOpenCenter}
                  className="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                >
                  Ver todas
                </button>
              )}
            </div>
            <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
              {latestNotifications.length === 0 ? (
                <p className="text-sm text-white/60">Todo al día. Pronto verás novedades aquí.</p>
              ) : (
                latestNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border border-white/10 bg-white/5 p-3 text-sm ${
                      !notification.read_at ? 'shadow-inner shadow-indigo-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{notification.title}</p>
                        {notification.body && <p className="mt-1 text-white/65">{notification.body}</p>}
                        <p className="mt-1 text-xs text-white/40">
                          {new Date(notification.delivered_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read_at && onMarkAsRead && (
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-100 transition hover:bg-emerald-500/30"
                          aria-label="Marcar como leída"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
