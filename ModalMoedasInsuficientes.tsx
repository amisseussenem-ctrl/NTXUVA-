import React, { useState, useEffect } from 'react';
import { Coins, Gift, Sparkles, Globe, Clock, X, AlertTriangle } from 'lucide-react';
import { 
  anunciosService, 
  CUSTO_PARTIDA_MOEDAS, 
  REPOSICAO_24H_MOEDAS, 
  MAXIMO_MOEDAS,
  formatarTempoRestante 
} from '../utils/anunciosService';

interface ModalMoedasInsuficientesProps {
  aberto: boolean;
  saldoAtual: number;
  onFechar: () => void;
  onAssistirVideo: () => void;
  onJogarOnline: () => void;
}

export const ModalMoedasInsuficientes: React.FC<ModalMoedasInsuficientesProps> = ({
  aberto,
  saldoAtual,
  onFechar,
  onAssistirVideo,
  onJogarOnline,
}) => {
  const [tempoRestanteMs, setTempoRestanteMs] = useState<number | null>(() =>
    anunciosService.obterTempoRestanteReposicaoMs()
  );

  useEffect(() => {
    if (!aberto) return;

    const atualizar = () => {
      setTempoRestanteMs(anunciosService.obterTempoRestanteReposicaoMs());
    };

    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Moedas Insuficientes"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="w-full max-w-md bg-[#1c1008] border-2 border-amber-500/80 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/90 text-stone-100 font-mono space-y-4 relative animate-scaleUp overflow-hidden">
        {/* Glow decorativo de fundo */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-[#3b2010]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wider">
                Crédito Esgotado
              </h3>
              <p className="text-[10px] text-stone-400">
                Necessita de {CUSTO_PARTIDA_MOEDAS} moedas para iniciar esta partida
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador de Saldo e Custo */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-[#140c07] border border-[#3b2010]">
            <div className="text-[10px] text-stone-400 uppercase">Seu Saldo</div>
            <div className="text-base sm:text-lg font-black text-rose-400 flex items-center justify-center gap-1">
              <span>🪙 {saldoAtual}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#140c07] border border-[#3b2010]">
            <div className="text-[10px] text-stone-400 uppercase">Custo por Partida</div>
            <div className="text-base sm:text-lg font-black text-amber-300 flex items-center justify-center gap-1">
              <span>🪙 {CUSTO_PARTIDA_MOEDAS}</span>
            </div>
          </div>
        </div>

        {/* Card de Reposição Gratuita de 24 Horas */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#241308] to-[#170a04] border border-amber-600/40 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Recarga Automática de 500 Moedas</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#3b2010]/80">
            <span className="text-stone-400">Tempo restante (24h):</span>
            <strong className="text-amber-400 font-mono font-black text-xs">
              {tempoRestanteMs !== null ? formatarTempoRestante(tempoRestanteMs) : 'Aguardando'}
            </strong>
          </div>

          <p className="text-[9.5px] text-stone-400 leading-relaxed font-sans pt-0.5">
            Ao esgotar o crédito, são repostas automaticamente <strong>+{REPOSICAO_24H_MOEDAS} moedas</strong> após 24 horas (acumuláveis até {MAXIMO_MOEDAS} moedas).
          </p>
        </div>

        {/* Botões de Ação Imediata */}
        <div className="space-y-2 pt-1">
          {/* Assistir Vídeo Recompensado para Ganhar Moedas Agora */}
          <button
            type="button"
            onClick={onAssistirVideo}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-stone-950 font-mono font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 border border-emerald-300 cursor-pointer transition-all animate-pulse"
          >
            <Gift className="w-4 h-4 fill-stone-950" />
            <span>ASSISTIR BÓNUS DE VÍDEO (+250 MOEDAS)</span>
          </button>

          {/* Jogar Partida Online (Grátis, não consome moedas) */}
          <button
            type="button"
            onClick={onJogarOnline}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#201209] hover:bg-[#2b180d] active:scale-[0.98] text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>JOGAR ONLINE (GRÁTIS · 0 MOEDAS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
