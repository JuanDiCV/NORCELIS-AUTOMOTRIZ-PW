import React from 'react';

interface State {
  hasError: boolean;
}

/**
 * Red de seguridad: si una pantalla falla al dibujarse, el visitante ve un mensaje y un botón
 * para recargar en vez de una página en blanco. No muestra detalles técnicos al visitante.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Solo a la consola del navegador; nunca a la pantalla
    console.error('Error de interfaz:', error);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="min-h-screen flex items-center justify-center p-6 bg-[#212955] text-white">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-extrabold">Algo salió mal</h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Tuvimos un problema al mostrar esta página. Recárgala o vuelve al inicio; si continúa, escríbenos por WhatsApp.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[#F07F00] hover:bg-[#d97300] text-white font-bold px-5 py-3 rounded-xl text-sm cursor-pointer"
            >
              Recargar
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl text-sm cursor-pointer"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
