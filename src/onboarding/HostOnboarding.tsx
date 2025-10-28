import React from 'react';
import type { User } from '../types';
import OnboardingFlow from './OnboardingFlow';
import { hostSteps } from './useOnboarding';

type HostOnboardingProps = {
  user: User;
  onFinish: (user: User) => void;
};

const HostOnboarding: React.FC<HostOnboardingProps> = ({ user, onFinish }) => {
  return (
    <OnboardingFlow
      user={user}
      role="host"
      steps={hostSteps}
      onFinish={onFinish}
      hero={{
        title: 'Activa tu modo anfitrión',
        subtitle: 'Reunamos los detalles de tu habitación y tus normas para publicar en minutos.',
        illustration: 'https://images.unsplash.com/photo-1505692794403-35fabe6a8e03?auto=format&fit=crop&w=1200&q=80',
        accent: 'Programa Host',
      }}
    />
  );
};

export default HostOnboarding;
