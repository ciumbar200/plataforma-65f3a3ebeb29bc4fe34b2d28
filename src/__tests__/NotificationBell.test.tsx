import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from '../components/NotificationBell';

const baseNotifications = [
  {
    id: 1,
    user_id: 'user-1',
    type: 'system',
    title: 'Bienvenida',
    body: 'Gracias por sumarte a MoOn.',
    metadata: null,
    delivered_at: new Date().toISOString(),
    read_at: null,
    created_at: new Date().toISOString(),
  },
];

describe('NotificationBell', () => {
  it('shows unread badge and opens list', async () => {
    const user = userEvent.setup();
    render(<NotificationBell notifications={baseNotifications} />);

    const trigger = screen.getByLabelText(/Abrir centro de notificaciones/i);
    expect(trigger).toHaveTextContent('1');
    await user.click(trigger);
    expect(screen.getByText(/Bienvenida/i)).toBeInTheDocument();
  });
});
