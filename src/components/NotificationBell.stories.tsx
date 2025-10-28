import type { Meta, StoryObj } from '@storybook/react';
import NotificationBell from './NotificationBell';
import type { Notification } from '../types';

const notifications: Notification[] = [
  {
    id: 1,
    user_id: 'demo',
    type: 'system',
    title: 'Bienvenida',
    body: 'Gracias por activar tu perfil MoOn.',
    metadata: null,
    delivered_at: new Date().toISOString(),
    read_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 'demo',
    type: 'match',
    title: 'Nuevo match',
    body: 'Tienes un match compatible al 92%.',
    metadata: null,
    delivered_at: new Date().toISOString(),
    read_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const meta: Meta<typeof NotificationBell> = {
  title: 'Dashboards/NotificationBell',
  component: NotificationBell,
  parameters: {
    layout: 'centered',
  },
  args: {
    notifications,
  },
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

export const Default: Story = {};
