import React from 'react';

type ErrorBoundaryProps = { children: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    try {
      // Minimal client-side logging; avoids crashing silently
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] Runtime error', { error, errorInfo });
    } catch {}
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    const message = this.state.error?.message || 'Ha ocurrido un error inesperado.';
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-4">
          <h1 className="text-2xl font-bold">Algo no ha ido bien</h1>
          <p className="text-white/80 text-sm break-words">{message}</p>
          <div className="flex gap-2">
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md text-sm" onClick={() => window.location.assign('/')}>Volver al inicio</button>
            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-semibold text-white" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </div>
      </div>
    );
  }
}

