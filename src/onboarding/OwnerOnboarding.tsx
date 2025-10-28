import React from 'react';
import type { User } from '../types';
import OnboardingFlow from './OnboardingFlow';
import { ownerSteps } from './useOnboarding';

type OwnerOnboardingProps = {
  user: User;
  onFinish: (user: User) => void;
};

const OwnerOnboarding: React.FC<OwnerOnboardingProps> = ({ user, onFinish }) => {
  return (
    <OnboardingFlow
      user={user}
      role="owner"
      steps={ownerSteps}
      onFinish={onFinish}
      hero={{
        title: 'Prepara tu hogar para la mejor convivencia',
        subtitle: 'Al completar este resumen tendremos todo listo para traer a los inquilinos que encajan contigo.',
        illustration: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
        accent: 'Propietarios',
      }}
    />
  );
};

export default OwnerOnboarding;
