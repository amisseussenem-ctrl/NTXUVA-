import React, { useEffect, useState, useRef } from 'react';
import { Trophy, X, Sparkles, Award } from 'lucide-react';
import { Conquista } from '../utils/estatisticasService';

interface ToastConquistaDesbloqueadaProps {
  conquista: Conquista | null;
  onFechar: () => void;
}

export const ToastConquistaDesbloqueada: React.FC<ToastConquistaDesbloqueadaProps> = ({
  conquista,
  onFechar,
}) => {
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  const [visivel, setVisivel] = useState(false);
  const [animandoSaida, setAnimandoSaida] = useState(false);

  useEffect(() => {
    if (!conquista) {
      setVisivel(false);
      setAnimandoSaida(false);
      return;
    }

    setVisivel(true);
    setAnimandoSaida(false);

    // Suavemente desaparece aos 3600ms e fecha aos 4000ms
    const timerFade = setTimeout(() => {
      setAnimandoSaida(true);
    }, 3600);

    const timerFechar = setTimeout(() => {
      setVisivel(false);
      onFecharRef.current();
    }, 4000);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerFechar);
    };
  }, [conquista]);

  if (!conquista || !visivel) return null;

  const fecharManualmente = () => {
    setAnimandoSaida(true);
    setTimeout(() => {
      setVisivel(false);
      onFecharRef.current();
    }, 200);
  };

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md font-mono"
    >
      <div 
        style={{
          transition: 'opacity 400ms ease, transform 400ms ease',
          opacity: animandoSaida ? 0 : 1,
          transform: animandoSaida ? 'translateY(-10px) scale(0.95)' : 'translateY(0) scale(1)',
          pointerEvents: animandoSaida ? 'none' : 'auto',
        }}
        className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#2f180d] via-[#3d2011] to-[#241209] border-2 border-amber-400 shadow-2xl flex items-center justify-between gap-3 text-stone-100 ring-4 ring-amber-500/30"
      >
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center text-2xl shadow-lg shrink-0 font-black animate-pulse">
            {conquista.icone || '🏆'}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>CONQUISTA DESBLOQUEADA!</span>
            </div>
            
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
              {conquista.titulo}
            </h4>

            <p className="text-[11px] text-stone-300 leading-tight">
              {conquista.descricao}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={fecharManualmente}
            className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black">
            +{conquista.pontos} pts
          </span>
        </div>
      </div>
    </div>
  );
};
