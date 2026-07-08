/**
 * ErrorBoundary.jsx
 *
 * Captura erros não tratados no render de React (crashes de componentes)
 * e os encaminha para a pipeline de observabilidade.
 * Sem isso, um crash de UI é silencioso em produção.
 */
import React from 'react';
import { captureError } from '@/utils/observability';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, {
      source: 'react_error_boundary',
      componentStack: errorInfo?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h1
              className="text-2xl font-heading mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Algo deu errado
            </h1>
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Ocorreu um erro inesperado. A equipe técnica foi notificada
              automaticamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}