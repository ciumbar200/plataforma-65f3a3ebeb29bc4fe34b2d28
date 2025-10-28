import React, { lazy } from 'react';

type RouteConfig = {
  path: string;
  element: React.ReactNode;
};

const AffiliatesLanding = lazy(() => import('../features/affiliates/AffiliatesLanding'));
const AffiliatePortal = lazy(() => import('../features/affiliates/AffiliatePortal'));

export function affiliatesRoutes(enabled: boolean): RouteConfig[] {
  if (!enabled) return [];
  return [
    { path: '/affiliates', element: <AffiliatesLanding /> },
    { path: '/affiliate/portal', element: <AffiliatePortal /> },
  ];
}
