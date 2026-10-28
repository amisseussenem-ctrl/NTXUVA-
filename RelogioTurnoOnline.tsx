import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, Zap } from 'lucide-react';
import { Jogador } from '../types/ntxuva';
import { soundManager } from '../utils/sound';

interface RelogioTurnoOnlineProps {
  tempoTurnoSegundos?: number | null;
  turnoIniciadoEm?: number | null;
  jogadorAtual: Jogador;
  seuPapel: Jogador | null;
  nomeJogadorAtual: string;
  isMinhaVez: boolean;
  onTempoEsgotado?: () => void;
}

export const RelogioTurnoOnline: React.FC<RelogioTurnoOnlineProps> = ({
  tempoTurnoSegundos,
  turnoIniciadoEm,
  jogadorAtual,
  seuPapel,
  nomeJogadorAtual,
  isMinhaVez,
  onTempoEsgotado,
}) => {
  const [tempoRestante, setTempoRestante] = useState<number>(tempoTurnoSegundos || 0);
  const ultimoSegundoAvisadoRef = useRef<number | null>(null);

  useEffect(() => {
    if (!tempoTurnoSegundos || !turnoIniciadoEm) {
      setTempoRestante(0);
      return;
    }

    const atualizar = () => {
      const decorridoMs = Date.now() - turnoIniciadoEm;
      const decorridoSeg = Math.floor(decorridoMs / 1000);
      const restante = Math.max(0, tempoTurnoSegundos - decorridoSeg);

      setTempoRestante(restante);

      // Alerta sonoro nos últimos 5 segundos se for a vez do jogador
      if (isMinhaVez && restante <= 5 && restante > 0 && ultimoSegundoAvisadoRef.current !== restante) {
        ultimoSegundoAvisadoRef.current = restante;
        soundManager.playTimerWarning();
      }

      if (restante <= 0 && onTempoEsgotado) {
        onTempoEsgotado();
      }
    };

    atualizar();
    const interval = setInterval(atualizar, 250);

    return () => clearInterval(interval);
  }, [tempoTurnoSegundos, turnoIniciadoEm, isMinhaVez, onTempoEsgotado]);

  if (!tempoTurnoSegundos || !turnoIniciadoEm) {
    return null;
  }

  const porcentagem = Math.min(100, Math.max(0, (tempoRestante / tempoTurnoSegundos) * 100));
  const isCritico = tempoRestante <= 5;
  const isAviso = tempoRestante <= 15;

  return (
    <div
      className={`px-3 py-1.5 rounded-2xl border-2 transition-all flex items-center gap-2.5 shadow-lg font-mono ${
        isCritico
          ? 'bg-rose-950/95 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 animate-pulse'
          : isAviso
          ? 'bg-amber-950/90 border-amber-500 text-amber-200'
          : 'bg-[#1e1108] border-stone-700 text-stone-200'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {isCritico ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
        ) : (
          <Timer className={`w-4 h-4 ${isAviso ? 'text-amber-400' : 'text-stone-400'}`} />
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">
            {isMinhaVez ? 'Seu Tempo:' : `Tempo (${nomeJogadorAtual}):`}
          </span>
          <strong
            className={`text-sm font-black tracking-wider ${
              isCritico ? 'text-rose-300' : isAviso ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {tempoRestante}s
          </strong>
        </div>

        {/* Mini Barra de Progresso do Turno */}
        <div className="w-24 sm:w-32 h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              isCritico ? 'bg-rose-500' : isAviso ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>
    </div>
  );
};
