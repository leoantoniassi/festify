import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen p-10 font-mono bg-error-container text-on-error-container">
          <h1 className="text-2xl text-error">⚠️ Algo deu errado</h1>
          <p className="mt-4">
            <strong>Erro:</strong> {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <pre className="mt-4 p-4 rounded-lg overflow-auto text-xs bg-surface text-on-surface-variant">
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="mt-5 px-6 py-3 rounded-lg text-sm cursor-pointer bg-error text-on-error"
          >
            Limpar dados e voltar ao Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
