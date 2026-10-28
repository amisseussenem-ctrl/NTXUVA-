import React, { useMemo } from 'react';
import { PassoDistribuicao, Jogador } from '../types/ntxuva';
import { Swords, ExternalLink, ArrowRight, Sparkles, ChevronDown, ChevronUp, Flame } from 'lucide-react';

export interface EventoMovimento {
  id: string;
  tipo: 'distribuicao' | 'captura' | 'revezamento' | 'fim';
  texto: string;
  detalhe?: string;
  casas?: number[];
  pedras?: number;
}

/**
 * Converte a lista de passos brutos de uma jogada na sequência limpa de distribuições e capturas
 * exatamente no formato do NTXUVA:
 *
 * 11 → 12 → 1
 * Captura: 18 + 19
 * 2 → 3 → 4 → 5
 * Captura: 14 + 23
 */
export function extrairEventosJogada(passos: PassoDistribuicao[]): EventoMovimento[] {
  const eventos: EventoMovimento[] = [];
  if (!passos || passos.length === 0) return eventos;

  let sequenciaAtual: number[] = [];

  for (let i = 0; i < passos.length; i++) {
    const p = passos[i];

    if (p.tipo === 'retirar_origem') {
      if (sequenciaAtual.length > 0) {
        eventos.push({
          id: `dist-${i}-${sequenciaAtual.join('-')}`,
          tipo: 'distribuicao',
          texto: sequenciaAtual.join(' → '),
          casas: [...sequenciaAtual],
        });
        sequenciaAtual = [];
      }
      sequenciaAtual.push(p.casa);
    } else if (p.tipo === 'semear_pedra') {
      if (sequenciaAtual.length === 0 || sequenciaAtual[sequenciaAtual.length - 1] !== p.casa) {
        sequenciaAtual.push(p.casa);
      }
    } else if (p.tipo === 'captura_pedras') {
      if (sequenciaAtual.length > 0) {
        eventos.push({
          id: `dist-${i}-${sequenciaAtual.join('-')}`,
          tipo: 'distribuicao',
          texto: sequenciaAtual.join(' → '),
          casas: [...sequenciaAtual],
        });
        sequenciaAtual = [];
      }

      const casasCap = p.casasCapturadas || [];
      const textoCasas = casasCap.length > 0 ? casasCap.join(' + ') : `${p.casa}`;
      const totalPedras = p.pedrasCapturadas !== undefined ? p.pedrasCapturadas : 0;
      eventos.push({
        id: `cap-${i}-${casasCap.join('-')}`,
        tipo: 'captura',
        texto: `Captura: ${textoCasas}`,
        detalhe: totalPedras > 0 ? `+${totalPedras} pedras` : undefined,
        casas: casasCap,
        pedras: totalPedras,
      });
    } else if (p.tipo === 'recolher_revezamento') {
      if (sequenciaAtual.length > 0) {
        eventos.push({
          id: `dist-${i}-${sequenciaAtual.join('-')}`,
          tipo: 'distribuicao',
          texto: sequenciaAtual.join(' → '),
          casas: [...sequenciaAtual],
        });
        sequenciaAtual = [];
      }
      // O revezamento continua semeando a partir da casa seguinte no próximo passo
    } else if (p.tipo === 'fim_distribuicao') {
      if (sequenciaAtual.length > 0) {
        eventos.push({
          id: `dist-${i}-${sequenciaAtual.join('-')}`,
          tipo: 'distribuicao',
          texto: sequenciaAtual.join(' → '),
          casas: [...sequenciaAtual],
        });
        sequenciaAtual = [];
      }
      if (p.isMotoMoto) {
        eventos.push({
          id: `moto-moto-${i}`,
          tipo: 'fim',
          texto: 'Regra de Moto-Moto (5 Giros)',
          detalhe: `Casa ${p.casa}`,
          casas: [p.casa],
        });
      }
    }
  }

  if (sequenciaAtual.length > 0) {
    eventos.push({
      id: `dist-final-${sequenciaAtual.join('-')}`,
      tipo: 'distribuicao',
      texto: sequenciaAtual.join(' → '),
      casas: [...sequenciaAtual],
    });
  }

  return eventos;
}

interface AreaUltimosMovimentosProps {
  passos: PassoDistribuicao[];
  passoAtualIndex?: number | null;
  animando?: boolean;
  jogador?: Jogador;
  onAbrirHistorico: () => void;
}

export const AreaUltimosMovimentos: React.FC<AreaUltimosMovimentosProps> = ({
  passos,
  passoAtualIndex,
  animando = false,
  jogador,
  onAbrirHistorico,
}) => {
  const [minimizado, setMinimizado] = React.useState(false);

  // Se animando, exibe dinamicamente até o passo atual da animação
  const passosVisiveis = useMemo(() => {
    if (!passos || passos.length === 0) return [];
    if (animando && passoAtualIndex !== null && passoAtualIndex !== undefined) {
      return passos.slice(0, Math.min(passoAtualIndex + 1, passos.length));
    }
    return passos;
  }, [passos, animando, passoAtualIndex]);

  const eventos = useMemo(() => extrairEventosJogada(passosVisiveis), [passosVisiveis]);

  if (eventos.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-xl mx-auto my-1 animate-fadeIn">
      <div className="rounded-2xl bg-[#180e08]/95 border-2 border-[#452715] shadow-xl overflow-hidden backdrop-blur-xs transition-all">
        {/* Barra de Título: ÚLTIMOS MOVIMENTOS */}
        <div className="px-3.5 py-2 bg-[#22130a] border-b border-[#3d2213] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-mono font-black text-xs sm:text-sm tracking-wider text-amber-200 uppercase flex items-center gap-1.5">
              <span>ÚLTIMOS MOVIMENTOS</span>
              {jogador && (
                <span className="text-[10px] font-bold text-stone-400 lowercase font-mono">
                  ({jogador})
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {animando && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                Distribuindo...
              </span>
            )}

            <button
              type="button"
              onClick={() => setMinimizado(!minimizado)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-[#2e190d] transition-colors cursor-pointer"
              title={minimizado ? 'Expandir área de eventos' : 'Recolher área de eventos'}
            >
              {minimizado ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Lista de Movimentos */}
        {!minimizado && (
          <div className="p-3 space-y-1.5 max-h-36 sm:max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-800/40">
            {eventos.map((ev, index) => {
              if (ev.tipo === 'captura') {
                return (
                  <div
                    key={ev.id || index}
                    className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-rose-950/70 border border-rose-500/70 text-rose-200 font-mono text-xs sm:text-sm font-bold shadow-xs animate-fadeIn"
                  >
                    <div className="flex items-center gap-2">
                      <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="font-black text-rose-100">{ev.texto}</span>
                    </div>
                    {ev.detalhe && (
                      <span className="text-[11px] font-mono font-bold text-rose-300 px-1.5 py-0.2 rounded bg-rose-900/60 border border-rose-700/60">
                        {ev.detalhe}
                      </span>
                    )}
                  </div>
                );
              }

              if (ev.tipo === 'fim') {
                return (
                  <div
                    key={ev.id || index}
                    className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/80 text-yellow-200 font-mono text-xs sm:text-sm font-bold shadow-xs animate-fadeIn"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                      <span className="font-black text-white">{ev.texto}</span>
                    </div>
                    {ev.detalhe && (
                      <span className="text-[11px] font-mono font-bold text-yellow-300 px-1.5 py-0.2 rounded bg-red-900/70 border border-red-600/70">
                        {ev.detalhe}
                      </span>
                    )}
                  </div>
                );
              }

              // Distribuição: 11 → 12 → 1
              return (
                <div
                  key={ev.id || index}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#24140b]/80 border border-[#3e2212] text-amber-100 font-mono text-xs sm:text-sm font-bold shadow-xs animate-fadeIn"
                >
                  <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="tracking-wide text-stone-200 font-bold">{ev.texto}</span>
                </div>
              );
            })}

            {/* Rodapé com link para o Histórico Completo */}
            <div className="pt-1.5 flex items-center justify-between border-t border-[#311b0e] text-[11px] font-mono text-stone-400">
              <span className="truncate">
                {eventos.length} evento{eventos.length !== 1 ? 's' : ''} nesta jogada
              </span>
              <button
                type="button"
                onClick={onAbrirHistorico}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-100 font-bold transition-colors cursor-pointer hover:underline"
              >
                <span>Ver Histórico Completo</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
