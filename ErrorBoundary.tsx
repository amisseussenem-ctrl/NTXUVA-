import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NTXUVA Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('ntxuva_viu_tutorial_interativo');
      this.setState({ hasError: false, error: null, errorInfo: null });
    } catch {
      window.location.reload();
    }
  };

  private handleHardReload = () => {
    try {
      // Limpa dados de navegação que poderiam estar corrompidos
      localStorage.removeItem('ntxuva_viu_tutorial_interativo');
      window.location.reload();
    } catch {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#120a06] text-stone-100 flex items-center justify-center p-4 font-mono select-none">
          <div className="max-w-md w-full bg-[#1c1008] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/60 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-amber-200">
                NTXUVA &bull; RECUPERAÇÃO RÁPIDA
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Ocorreu uma pequena instabilidade de carregamento na interface. Clique no botão abaixo para restaurar o jogo imediatamente:
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#2a160b] rounded-xl text-[11px] font-mono text-amber-300 text-left overflow-x-auto max-h-28 border border-[#522c15]">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recuperar e Abrir Menu do Jogo</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReload}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Recarregar Página Completa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
