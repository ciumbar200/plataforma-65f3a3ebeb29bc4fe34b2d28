import React from 'react';
import type { User } from '../types';
import OnboardingFlow from './OnboardingFlow';
import { tenantSteps } from './useOnboarding';

type TenantOnboardingProps = {
  user: User;
  onFinish: (user: User) => void;
};

const TenantOnboarding: React.FC<TenantOnboardingProps> = ({ user, onFinish }) => {
  return (
    <OnboardingFlow
      user={user}
      role="tenant"
      steps={tenantSteps}
      onFinish={onFinish}
      hero={{
        title: 'Diseñemos la convivencia que te cuida',
        subtitle: 'En menos de dos minutos sabremos qué necesitas y qué ofreces a tu próxima tribu.',
        illustration: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
        accent: 'Perfil de inquilino',
      }}
    />
  );
};

export default TenantOnboarding;
