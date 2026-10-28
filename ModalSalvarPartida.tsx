import React from 'react';
import { Save, Trash2, Play, X, ShieldAlert, Sparkles } from 'lucide-react';

interface ModalSalvarPartidaProps {
  aberto: boolean;
  onSalvarESair: () => void;
  onSairSemSalvar: () => void;
  onCancelar: () => void;
  totalJogadas?: number;
  modoJogo?: 'local' | 'ia' | 'online';
}

export const ModalSalvarPartida: React.FC<ModalSalvarPartidaProps> = ({
  aberto,
  onSalvarESair,
  onSairSemSalvar,
  onCancelar,
  totalJogadas = 0,
  modoJogo = 'local',
}) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-fadeIn font-mono">
      <div className="w-full max-w-sm bg-[#1c1008] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-stone-200 relative overflow-hidden animate-scaleUp">
        {/* Glow de fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d2213]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-200 uppercase tracking-wide">
                Salvar a Partida?
              </h3>
              <span className="text-[10px] text-stone-400">
                A partida já iniciou
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 cursor-pointer transition-colors"
            title="Cancelar e continuar a jogar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagem e Detalhes da Partida */}
        <div className="space-y-2.5 text-xs text-stone-300">
          <p className="leading-relaxed">
            Desejas <strong className="text-amber-300 font-bold">salvar a partida</strong> para depois poderes entrar e continuar a jogar exatamente de onde paraste?
          </p>

          <div className="p-2.5 rounded-xl bg-[#251309] border border-[#442312] text-[11px] text-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {modoJogo === 'ia' ? 'Jogo Contra IA' : modoJogo === 'online' ? 'Partida Online' : 'Jogo Local 2P'}
              </span>
            </div>
            <span className="text-amber-300 font-bold">
              {totalJogadas} {totalJogadas === 1 ? 'jogada' : 'jogadas'}
            </span>
          </div>
        </div>

        {/* Botões de Ação: SIM ou NÃO */}
        <div className="pt-1 space-y-2">
          {/* Opção SIM: Salvar e ir ao menu */}
          <button
            type="button"
            onClick={onSalvarESair}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/60 border border-emerald-400"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>SIM, SALVAR PARTIDA</span>
          </button>

          {/* Opção NÃO: Descartar e ir ao menu */}
          <button
            type="button"
            onClick={onSairSemSalvar}
            className="w-full py-2.5 px-4 rounded-xl bg-[#29140a] hover:bg-rose-950/80 hover:text-rose-200 text-stone-300 border border-[#522914] hover:border-rose-600 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>NÃO, SAIR SEM SALVAR</span>
          </button>

          {/* Opção Cancelar: Voltar ao jogo */}
          <button
            type="button"
            onClick={onCancelar}
            className="w-full py-1.5 text-center text-[11px] text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            Cancelar e Continuar a Jogar
          </button>
        </div>
      </div>
    </div>
  );
};
