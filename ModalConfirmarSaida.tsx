import React from 'react';
import { LogOut, Play, X, ShieldCheck } from 'lucide-react';

interface ModalConfirmarSaidaProps {
  aberto: boolean;
  onCancelar: () => void;
  onConfirmarSaida: () => void;
}

export const ModalConfirmarSaida: React.FC<ModalConfirmarSaidaProps> = ({
  aberto,
  onCancelar,
  onConfirmarSaida,
}) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-fadeIn font-mono">
      <div className="w-full max-w-sm bg-[#1c1008] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-stone-200 relative overflow-hidden animate-scaleUp">
        {/* Glow de fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d2213]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-200 uppercase tracking-wide">
                Sair do Jogo?
              </h3>
              <span className="text-[10px] text-stone-400">
                NTXUVA &bull; Tradicional Africano
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 cursor-pointer transition-colors"
            title="Voltar ao jogo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagem amigável */}
        <div className="space-y-2 text-xs leading-relaxed text-stone-300">
          <p>
            Tens a certeza de que desejas sair do aplicativo?
          </p>
          <div className="p-2.5 rounded-xl bg-[#251309] border border-[#442312] text-[11px] text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>As tuas conquistas, perfil e histórico estão gravados com segurança.</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {/* Botão 1: CONTINUAR A JOGAR (Destaque) */}
          <button
            type="button"
            onClick={onCancelar}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-stone-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/60 border border-amber-300"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Continuar a Jogar</span>
          </button>

          {/* Botão 2: SAIR DO JOGO */}
          <button
            type="button"
            onClick={onConfirmarSaida}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#26140b] hover:bg-rose-950 hover:text-rose-200 text-stone-300 border border-[#4d2d18] hover:border-rose-700/60 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4 text-stone-400" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
