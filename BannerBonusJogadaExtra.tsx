import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, X, Crown, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BonusCapturaRecente } from '../types/ntxuva';
import { soundManager } from '../utils/sound';

interface BannerBonusJogadaExtraProps {
  bonus: BonusCapturaRecente | null;
  onFechar?: () => void;
}

export const BannerBonusJogadaExtra: React.FC<BannerBonusJogadaExtraProps> = ({ bonus, onFechar }) => {
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  const [visivel, setVisivel] = useState(false);
  const [animandoSaida, setAnimandoSaida] = useState(false);

  useEffect(() => {
    if (!bonus) {
      setVisivel(false);
      setAnimandoSaida(false);
      return;
    }

    setVisivel(true);
    setAnimandoSaida(false);

    // Tocar som de bónus
    try {
      soundManager.playBonus(bonus.tipo === '2x');
    } catch {
      // Ignora erro de áudio
    }

    // Efeito de confetes leve para celebrar o "Parabéns pequeno"
    try {
      if (bonus.tipo === '2x') {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.3 },
          colors: ['#f59e0b', '#fbbf24', '#a855f7', '#ec4899', '#ffffff'],
        });
      } else {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.3 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#ffffff'],
        });
      }
    } catch {
      // Ignora se o canvas do confetti não estiver disponível
    }

    // Duração reduzida em 1 segundo: de 3000ms para 2000ms (2 segundos)
    const timerFade = setTimeout(() => {
      setAnimandoSaida(true);
    }, 1650);

    const timerFechar = setTimeout(() => {
      setVisivel(false);
      if (onFecharRef.current) onFecharRef.current();
    }, 2000);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerFechar);
    };
  }, [bonus]);

  if (!bonus || !visivel) return null;

  const eh2x = bonus.tipo === '2x';

  const fecharManualmente = () => {
    setAnimandoSaida(true);
    setTimeout(() => {
      setVisivel(false);
      if (onFecharRef.current) onFecharRef.current();
    }, 200);
  };

  return (
    <aside
      aria-label="Notificação de bónus de jogadas adicionais"
      className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300 max-w-sm w-[88%]"
    >
      <div
        style={{
          transition: 'opacity 350ms ease, transform 350ms ease',
          opacity: animandoSaida ? 0 : 1,
          transform: animandoSaida ? 'translateY(-8px) scale(0.96)' : 'translateY(0) scale(1)',
          pointerEvents: animandoSaida ? 'none' : 'auto',
        }}
        className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border-2 shadow-xl flex items-center justify-between gap-2.5 backdrop-blur-md ${
          eh2x
            ? 'bg-gradient-to-r from-[#2a0e2e]/95 via-[#3b1235]/95 to-[#240c1a]/95 border-amber-400 text-amber-100 shadow-purple-950/70 ring-2 ring-amber-400/30'
            : 'bg-gradient-to-r from-[#0d2818]/95 via-[#13321f]/95 to-[#0f2416]/95 border-emerald-400 text-emerald-100 shadow-emerald-950/70 ring-2 ring-emerald-400/30'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Distintivo Mais Compacto: "1x" ou "2x" */}
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center font-black tracking-tighter shadow-md shrink-0 border animate-pulse ${
              eh2x
                ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 text-stone-950 border-amber-200'
                : 'bg-gradient-to-br from-emerald-400 via-teal-300 to-emerald-600 text-stone-950 border-emerald-200'
            }`}
          >
            <span className="text-base sm:text-lg font-black font-mono leading-none">
              {bonus.tipo}
            </span>
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider font-mono">
              BÓNUS
            </span>
          </div>

          {/* Texto de Parabéns Compacto */}
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1 font-black text-xs sm:text-sm font-mono truncate">
              {eh2x ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-amber-300 truncate">🎉 Parabéns! Ganhou 2x!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 truncate">🎉 Parabéns! Ganhou 1x!</span>
                </>
              )}
            </div>

            <p className="text-[10px] sm:text-[11px] text-stone-300 font-mono truncate">
              {eh2x
                ? `Captura combinada de ${bonus.totalPedras} pedras!`
                : `Captura de casa com 10+ pedras!`}
            </p>

            <span
              className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                eh2x
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                  : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
              }`}
            >
              {bonus.jogador} joga de novo (+{bonus.jogadasExtras})
            </span>
          </div>
        </div>

        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={fecharManualmente}
          className="p-1 rounded-lg text-stone-400 hover:text-white bg-black/30 hover:bg-black/50 transition-colors cursor-pointer shrink-0 self-start"
          title="Fechar notificação"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
