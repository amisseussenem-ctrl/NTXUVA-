import React from 'react';
import { Wifi, WifiOff, RefreshCw, LogIn, X, Globe } from 'lucide-react';
import { SessionData } from '../hooks/useNtxuvaOnline';

interface BannerReconexaoOnlineProps {
  conectado: boolean;
  reconectando: boolean;
  tentativasReconexao?: number;
  onTentarReconectar: () => void;
  onDesistirOuSair?: () => void;
}

export const BannerReconexaoOnline: React.FC<BannerReconexaoOnlineProps> = ({
  conectado,
  reconectando,
  tentativasReconexao = 0,
  onTentarReconectar,
  onDesistirOuSair,
}) => {
  // Se está tudo normal e conectado, não mostra nada
  if (conectado) {
    return null;
  }

  return (
    <div className="w-full p-3 sm:p-4 rounded-2xl bg-amber-950/90 border-2 border-amber-500 text-stone-100 font-mono shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-500/60 flex items-center justify-center shrink-0">
          {reconectando ? (
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
          ) : (
            <WifiOff className="w-5 h-5 text-rose-400 animate-pulse" />
          )}
        </div>
        <div>
          <div className="text-xs sm:text-sm font-black text-amber-200">
            {reconectando
              ? `Ligação instável. A reconectar à sala... (Tentativa ${tentativasReconexao || 1})`
              : 'Ligação com o servidor interrompida.'}
          </div>
          <div className="text-[11px] text-stone-300">
            O seu progresso está seguro. Você voltará ao jogo assim que a ligação estabilizar.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          type="button"
          onClick={onTentarReconectar}
          disabled={reconectando}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reconectando ? 'animate-spin' : ''}`} />
          <span>{reconectando ? 'Reconectando...' : 'Reconectar Agora'}</span>
        </button>

        {onDesistirOuSair && (
          <button
            type="button"
            onClick={onDesistirOuSair}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-rose-950 border border-stone-800 text-stone-400 hover:text-rose-200 text-xs font-bold transition-all cursor-pointer"
            title="Sair para o menu"
          >
            Sair
          </button>
        )}
      </div>
    </div>
  );
};

interface CardRetomarPartidaOnlineProps {
  sessao: SessionData;
  onRetomar: () => void;
  onDescartar: () => void;
}

export const CardRetomarPartidaOnline: React.FC<CardRetomarPartidaOnlineProps> = ({
  sessao,
  onRetomar,
  onDescartar,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4 rounded-3xl bg-[#24140b] border-2 border-amber-500/80 text-stone-100 font-mono shadow-2xl space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-[#3d2315]">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>PARTIDA ONLINE ANTERIOR DETECTADA</span>
        </div>
        <button
          type="button"
          onClick={onDescartar}
          className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
          title="Descartar sessão anterior"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-stone-300">
            Você estava jogando na sala:
          </div>
          <strong className="text-base sm:text-lg text-amber-200 font-black tracking-widest bg-stone-950 px-2 py-0.5 rounded-lg border border-amber-500/40 inline-block mt-1">
            {sessao.codigo}
          </strong>
          <span className="text-[11px] text-stone-400 block mt-1">
            Como: <strong>{sessao.nome}</strong> ({sessao.papel})
          </span>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={onRetomar}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Voltar à Sala</span>
          </button>
          <button
            type="button"
            onClick={onDescartar}
            className="px-3 py-1.5 rounded-xl bg-[#170c06] hover:bg-[#2b170c] border border-stone-800 text-stone-400 hover:text-rose-300 text-[11px] font-bold transition-all cursor-pointer text-center"
          >
            Abandonar
          </button>
        </div>
      </div>
    </div>
  );
};
