import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { Jogador } from '../types/ntxuva';
import { ReacaoOnline } from '../types/online';
import { soundManager } from '../utils/sound';

export const REACOES_RAPIDAS: Array<{ texto: string; emoji: string }> = [
  { texto: 'Que bela jogada! 🎯', emoji: '🎯' },
  { texto: 'Kanimambo! 🙏', emoji: '🙏' },
  { texto: 'Axinenéee! 🔥', emoji: '🔥' },
  { texto: 'Wau que bom! 😲', emoji: '😲' },
  { texto: 'Boa jogada! 👏', emoji: '👏' },
  { texto: 'Pensando... 🤔', emoji: '🤔' },
  { texto: 'Quase me pegaste! 😅', emoji: '😅' },
  { texto: 'Morreu afogado! 🛑', emoji: '🛑' },
  { texto: 'Ganhou! 👑', emoji: '👑' },
  { texto: 'Boa sorte! 🍀', emoji: '🍀' },
  { texto: 'Foi por pouco! 😱', emoji: '😱' },
];

export const EMOJIS_RAPIDOS: string[] = ['👏', '🤔', '😅', '🙏', '🔥', '🎯', '😱', '🤝', '👑', '😂'];

interface ChatReacoesOnlineProps {
  seuPapel: Jogador | null;
  ultimaReacao: ReacaoOnline | null;
  onEnviarReacao: (texto: string, emoji?: string) => Promise<boolean>;
  desabilitado?: boolean;
}

export const ChatReacoesOnline: React.FC<ChatReacoesOnlineProps> = ({
  seuPapel,
  ultimaReacao,
  onEnviarReacao,
  desabilitado = false,
}) => {
  const [painelAberto, setPainelAberto] = useState(false);
  const [reacaoVisivel, setReacaoVisivel] = useState<ReacaoOnline | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Exibir balão flutuante quando uma nova reação chega
  useEffect(() => {
    if (!ultimaReacao) return;

    setReacaoVisivel(ultimaReacao);
    soundManager.playReaction();

    const timer = setTimeout(() => {
      setReacaoVisivel(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [ultimaReacao]);

  const handleEnviar = async (texto: string, emoji?: string) => {
    if (desabilitado || enviando) return;
    setEnviando(true);
    try {
      await onEnviarReacao(texto, emoji);
      soundManager.playReaction();
      setPainelAberto(false);
    } finally {
      setEnviando(false);
    }
  };

  const isMinhaReacao = reacaoVisivel?.jogador === seuPapel;

  return (
    <div className="relative z-30 font-mono">
      {/* BALÃO FLUTUANTE DE REAÇÃO RECEBIDA (ANIMAÇÃO DESTACADA) */}
      {reacaoVisivel && (
        <div
          className={`fixed z-50 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 animate-bounce ${
            isMinhaReacao ? 'bottom-24 sm:bottom-28' : 'top-20 sm:top-24'
          }`}
        >
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl border-2 flex items-center gap-2.5 backdrop-blur-md ${
              isMinhaReacao
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 ring-4 ring-emerald-500/30'
                : 'bg-rose-950/95 border-rose-400 text-rose-100 ring-4 ring-rose-500/30'
            }`}
          >
            {reacaoVisivel.emoji && (
              <span className="text-2xl sm:text-3xl filter drop-shadow-md">
                {reacaoVisivel.emoji}
              </span>
            )}
            <div className="flex flex-col text-left">
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isMinhaReacao ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {reacaoVisivel.nome} ({reacaoVisivel.jogador}):
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {reacaoVisivel.texto}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO COMPACTO PARA ABRIR O PAINEL DE REAÇÕES */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPainelAberto((prev) => !prev)}
          disabled={desabilitado}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md cursor-pointer ${
            painelAberto
              ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
              : 'bg-[#24130a] hover:bg-[#341b0e] text-amber-300 border-amber-600/50'
          }`}
          title="Abrir chat de reações rápidas e emojis"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reações Rápidas</span>
          {painelAberto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Emojis rápidos inline para envio em 1 toque */}
        <div className="hidden sm:flex items-center gap-1">
          {EMOJIS_RAPIDOS.slice(0, 5).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEnviar(emoji, emoji)}
              disabled={desabilitado || enviando}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#29170c] hover:bg-[#3d2212] border border-[#522e19] text-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title={`Enviar ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* PAINEL EXPANSÍVEL DE REAÇÕES RÁPIDAS E EMOJIS */}
      {painelAberto && (
        <div className="absolute right-0 sm:left-0 bottom-full mb-2 w-72 sm:w-80 bg-[#1c1008] border-2 border-amber-500/70 rounded-2xl p-3 shadow-2xl z-40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#3b2214]">
            <div className="flex items-center gap-1.5 text-amber-200 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Enviar Reação ao Adversário</span>
            </div>
            <button
              type="button"
              onClick={() => setPainelAberto(false)}
              className="p-1 rounded-md text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LISTA DE FRASES PRONTAS */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block">
              Frases Prontas:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {REACOES_RAPIDAS.map((item) => (
                <button
                  key={item.texto}
                  type="button"
                  onClick={() => handleEnviar(item.texto, item.emoji)}
                  disabled={desabilitado || enviando}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl bg-[#28160c] hover:bg-[#3d2212] active:scale-95 border border-[#4d2c18] hover:border-amber-500/60 text-stone-200 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-1 shadow-sm"
                >
                  <span className="truncate">{item.texto}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PALETA DE EMOJIS */}
          <div className="space-y-1.5 pt-1 border-t border-[#3b2214]">
            <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block">
              Emojis:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS_RAPIDOS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEnviar(emoji, emoji)}
                  disabled={desabilitado || enviando}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#28160c] hover:bg-[#3d2212] border border-[#4d2c18] hover:border-amber-400 text-lg hover:scale-115 active:scale-90 transition-transform cursor-pointer shadow-sm"
                  title={`Enviar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
