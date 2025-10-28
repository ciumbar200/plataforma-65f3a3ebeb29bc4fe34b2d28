type AnalyticsPayload = Record<string, unknown> | undefined;

export const trackEvent = (eventName: string, payload?: AnalyticsPayload) => {
  try {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(eventName, payload ?? {});
    } else if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, payload ?? {});
    }
  } catch (error) {
    console.warn('[analytics] event error', error);
  }
};
