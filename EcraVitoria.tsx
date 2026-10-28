import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Volume2, Gift } from 'lucide-react';
import { Jogador } from '../types/ntxuva';
import { soundManager } from '../utils/sound';
import { vocalizarExpressaoMocambicana } from './BalaoExpressaoMocambicana';

interface EcraVitoriaProps {
  vencedor: Jogador;
  nomeExibicao: string;
  isJogadorPrincipal: boolean;
  tipoVitoria?: 'eliminacao' | 'asfixia';
  motivoVitoria?: string;
  onNovaPartida: () => void;
  onMenuPrincipal: () => void;
  onAssistirAnuncioRecompensa?: () => void;
}

export const EcraVitoria: React.FC<EcraVitoriaProps> = ({
  vencedor,
  nomeExibicao,
  isJogadorPrincipal,
  tipoVitoria = 'eliminacao',
  motivoVitoria,
  onNovaPartida,
  onMenuPrincipal,
  onAssistirAnuncioRecompensa,
}) => {
  // Efeito de celebração contínua com confetes dourados, fitas e papel picado de levantamento de taça
  useEffect(() => {
    // Sons de tômbola (batuques tradicionais) combinando com a taça e os parabéns
    soundManager.playTombolaCelebration();
    if (tipoVitoria === 'asfixia') {
      vocalizarExpressaoMocambicana('Morreu afogado!');
    } else {
      vocalizarExpressaoMocambicana('Parabéns! Ganhou!');
    }

    // 1. Grande explosão inicial central
    try {
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.45 },
        colors: ['#ffd700', '#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
        shapes: ['circle', 'square'],
        scalar: 1.2,
      });
    } catch {
      // Ignorar fallback
    }

    // 2. Canhões laterais disparando fitas e papéis dourados como em finais de campeonato
    const duracaoMs = 4000;
    const fimAnimacao = Date.now() + duracaoMs;

    const intervalId = setInterval(() => {
      const tempoRestante = fimAnimacao - Date.now();
      if (tempoRestante <= 0) {
        clearInterval(intervalId);
        return;
      }

      const particleCount = 40 * (tempoRestante / duracaoMs);

      try {
        // Canhão da esquerda
        confetti({
          particleCount,
          angle: 60,
          spread: 65,
          origin: { x: -0.05, y: 0.75 },
          colors: ['#ffd700', '#f59e0b', '#fbbf24', '#10b981', '#ffffff'],
          ticks: 280,
          gravity: 0.9,
          scalar: 1.1,
        });

        // Canhão da direita
        confetti({
          particleCount,
          angle: 120,
          spread: 65,
          origin: { x: 1.05, y: 0.75 },
          colors: ['#ffd700', '#f59e0b', '#fbbf24', '#f43f5e', '#ffffff'],
          ticks: 280,
          gravity: 0.9,
          scalar: 1.1,
        });
      } catch {
        // Fallback silencioso
      }
    }, 450);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Determinar ícone e cor do vencedor (Jogador 1 / A = 🟢, Jogador 2 / B = 🔴)
  const isVerde = vencedor === 'Jogador A';
  const indicadorCirculo = isVerde ? '🟢' : '🔴';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Balões flutuantes decorativos subindo pelo ecrã */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Balão 1 - Esquerda */}
        <div 
          className="absolute -bottom-20 left-[8%] text-4xl sm:text-5xl opacity-90 animate-float-balloon-1"
          style={{ animationDuration: '6.5s', animationIterationCount: 'infinite' }}
        >
          🎈
        </div>
        {/* Balão 2 - Ouro Esquerda */}
        <div 
          className="absolute -bottom-24 left-[20%] text-5xl sm:text-6xl opacity-85 animate-float-balloon-2"
          style={{ animationDuration: '7.8s', animationIterationCount: 'infinite', animationDelay: '1.2s' }}
        >
          🎈
        </div>
        {/* Balão 3 - Direita */}
        <div 
          className="absolute -bottom-20 right-[10%] text-4xl sm:text-5xl opacity-90 animate-float-balloon-3"
          style={{ animationDuration: '7s', animationIterationCount: 'infinite', animationDelay: '0.5s' }}
        >
          🎈
        </div>
        {/* Balão 4 - Ouro Direita */}
        <div 
          className="absolute -bottom-28 right-[22%] text-5xl sm:text-6xl opacity-85 animate-float-balloon-1"
          style={{ animationDuration: '8.5s', animationIterationCount: 'infinite', animationDelay: '2s' }}
        >
          🎈
        </div>

        {/* Brilhos e estrelas douradas no ar */}
        <div className="absolute top-[18%] left-[15%] text-amber-300 text-2xl animate-pulse">✨</div>
        <div className="absolute top-[25%] right-[16%] text-yellow-300 text-3xl animate-pulse" style={{ animationDelay: '0.8s' }}>⭐</div>
        <div className="absolute bottom-[28%] left-[18%] text-yellow-400 text-2xl animate-pulse" style={{ animationDelay: '1.5s' }}>✨</div>
        <div className="absolute bottom-[22%] right-[18%] text-amber-200 text-2xl animate-pulse" style={{ animationDelay: '1.1s' }}>⭐</div>
      </div>

      {/* Cartão Central de Celebração de Vitória */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#24140b] via-[#1a0e07] to-[#140b05] border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center space-y-6 animate-trophy-reveal">
        
        {/* Efeito de Raios de Glória Dourada atrás da Taça */}
        <div className="relative flex items-center justify-center pt-2">
          {/* Halo radiante de ouro */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-400/40 to-transparent blur-xl animate-pulse" />
          
          {/* A TAÇA DE CAMPEÃO (🏆) SAINDO DIRETO NO ECRÃ */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-7xl sm:text-8xl select-none filter drop-shadow-[0_10px_20px_rgba(251,191,36,0.6)] transform hover:scale-110 transition-transform cursor-default animate-bounce-gentle">
              🏆
            </div>
            
            {/* Faixa ou estrela sob a taça */}
            <div className="flex items-center gap-1.5 mt-2 text-amber-400">
              <Sparkles className="w-4 h-4 fill-amber-400" />
              <span className="text-[11px] font-mono font-black tracking-widest uppercase text-amber-300">
                Campeão de Ntxuva
              </span>
              <Sparkles className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL: VITÓRIA! */}
        <div className="space-y-2">
          <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
            VITÓRIA!
          </h2>

          {/* BALÃO / DISTINTIVO DE EXPRESSÃO MOÇAMBICANA */}
          {tipoVitoria === 'asfixia' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950 border-2 border-rose-500 text-xs font-mono font-black text-rose-200 tracking-wide uppercase shadow-lg animate-bounce">
              <span>🛑 “Morreu afogado!”</span>
              <span className="text-[10px] text-rose-300/80 font-normal hidden sm:inline">(Vitória por Asfixia)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950 border-2 border-amber-400 text-xs font-mono font-black text-amber-200 tracking-wide uppercase shadow-lg animate-bounce">
              <span>👑 “Ganhou! Kanimambo!”</span>
            </div>
          )}
        </div>

        {/* IDENTIFICAÇÃO DO VENCEDOR (Ex: 🟢 JOGADOR 1) */}
        <div className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#2e180d] border-2 border-amber-500/60 shadow-inner">
          <span className="text-xl select-none">{indicadorCirculo}</span>
          <span className="text-base sm:text-lg font-black font-mono tracking-wider text-amber-100 uppercase">
            {nomeExibicao}
          </span>
        </div>

        {/* MENSAGEM DESCRITIVA OFICIAL */}
        <div className="text-sm sm:text-base font-mono font-medium text-stone-300 max-w-xs mx-auto leading-relaxed">
          {tipoVitoria === 'asfixia' ? (
            <div className="space-y-1">
              <p>O adversário ficou apenas com casas de 1 pedra e sem jogada válida.</p>
              <p className="text-xs text-amber-300 font-bold">Perdeu por asfixia (morreu afogado)!</p>
            </div>
          ) : (
            <p>
              Todas as pedras do<br />
              adversário foram capturadas.
            </p>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────
            BOTÕES DE AÇÃO:
            [ NOVA PARTIDA ]
            [ MENU PRINCIPAL ]
            ────────────────────────────────────────────────────────── */}
        <div className="space-y-2.5 pt-2">
          {/* BOTÃO RECOMPENSA DE VÍDEO ADMOB: RESGATAR MOEDAS */}
          {onAssistirAnuncioRecompensa && (
            <button
              type="button"
              onClick={onAssistirAnuncioRecompensa}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-mono font-black text-xs tracking-wider flex items-center justify-between border border-emerald-400/60 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-300" />
                <span>ASSISTIR VÍDEO & GANHAR BÓNUS</span>
              </div>
              <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-mono">
                +250 Moedas 🎁
              </span>
            </button>
          )}

          {/* BOTÃO 1: NOVA PARTIDA */}
          <button
            type="button"
            onClick={onNovaPartida}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-stone-950 font-mono font-black text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-950/60 border border-amber-300 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>NOVA PARTIDA</span>
          </button>

          {/* BOTÃO 2: MENU PRINCIPAL */}
          <button
            type="button"
            onClick={onMenuPrincipal}
            className="w-full py-3 px-6 rounded-2xl bg-[#24130a] hover:bg-[#331b0e] active:scale-[0.98] text-amber-200 hover:text-white font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 border border-[#4d2d18] hover:border-amber-500/60 shadow-md cursor-pointer transition-all"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>MENU PRINCIPAL</span>
          </button>
        </div>

      </div>
    </div>
  );
};
