import React, { useState, useMemo } from 'react';
import { PassoDistribuicao, Jogador, ResumoCadeiaJogada } from '../types/ntxuva';
import { extrairEventosJogada } from './AreaUltimosMovimentos';
import { 
  History, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  Target, 
  Flame, 
  SkipForward, 
  SkipBack,
  ArrowRight,
  Swords
} from 'lucide-react';

export interface TurnRecord {
  id: string;
  turnNumber: number;
  jogador: Jogador;
  casaInicial: number;
  passos: PassoDistribuicao[];
  resumoCadeia?: ResumoCadeiaJogada | null;
  totalCapturas: number;
  totalPedrasCapturadas: number;
  casaFinal: number;
  dataHora: string;
}

interface HistoricoJogadasProps {
  historicoPartida: TurnRecord[];
  passosAtuais: PassoDistribuicao[];
  passoAtualIndex: number | null;
  animando: boolean;
  onPausarAnimacao?: () => void;
  onRetomarAnimacao?: () => void;
  onPassoAnterior?: () => void;
  onProximoPasso?: () => void;
  onReverTurno?: (turno: TurnRecord) => void;
}

export const HistoricoJogadas: React.FC<HistoricoJogadasProps> = ({
  historicoPartida,
  passosAtuais,
  passoAtualIndex,
  animando,
  onPausarAnimacao,
  onRetomarAnimacao,
  onPassoAnterior,
  onProximoPasso,
  onReverTurno,
}) => {
  const [tabAtiva, setTabAtiva] = useState<'passos_atuais' | 'historico_turnos'>('passos_atuais');
  const [turnoExpandido, setTurnoExpandido] = useState<string | null>(null);

  return (
    <section className="bg-[#1a0f08] border-2 border-[#4d2f1d] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-stone-100">
      {/* Cabeçalho do Histórico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#3b2314] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-500/50 shadow-inner">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Histórico da Jogada</span>
              {passosAtuais.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2a170c] text-amber-300 border border-amber-500/50 font-mono font-bold">
                  {passosAtuais.length} ações
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-medium">
              Registro completo da sequência de semeadura, capturas e revezamento contínuo.
            </p>
          </div>
        </div>

        {/* Abas de Navegação do Histórico */}
        <div className="flex items-center gap-1.5 p-1 bg-[#120a05] rounded-2xl border border-[#3b2314] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTabAtiva('passos_atuais')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              tabAtiva === 'passos_atuais'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Jogada Ativa
          </button>
          <button
            type="button"
            onClick={() => setTabAtiva('historico_turnos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              tabAtiva === 'historico_turnos'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <span>Partida Completa</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#24150b] text-amber-300 border border-amber-700/60 font-mono font-black">
              {historicoPartida.length}
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo Aba 1: Passos da Jogada Ativa */}
      {tabAtiva === 'passos_atuais' && (
        <div className="space-y-3">
          {/* Controles de Reprodução Passo a Passo */}
          {passosAtuais.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#140c06] border-2 border-[#3b2314] text-xs sm:text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="text-stone-300 font-bold">Passo:</span>
                <span className="font-black text-amber-300 text-base">
                  {passoAtualIndex !== null ? passoAtualIndex + 1 : passosAtuais.length} / {passosAtuais.length}
                </span>
                <span className="text-stone-500">·</span>
                <span>
                  {animando ? (
                    <span className="text-emerald-400 font-black animate-pulse flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Distribuindo...
                    </span>
                  ) : (
                    <span className="text-stone-300 font-bold">Finalizada</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onPassoAnterior && (
                  <button
                    type="button"
                    onClick={onPassoAnterior}
                    disabled={passoAtualIndex === null || passoAtualIndex <= 0}
                    className="p-2 rounded-xl bg-[#24150b] hover:bg-[#382012] disabled:opacity-30 text-stone-200 transition-all border border-[#4d2f1d] cursor-pointer"
                    title="Passo anterior"
                  >
                    <SkipBack className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                {animando ? (
                  <button
                    type="button"
                    onClick={onPausarAnimacao}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                    title="Pausar animação"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onRetomarAnimacao}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                    title="Reproduzir jogada"
                  >
                    <Play className="w-4 h-4" />
                    <span>Replay</span>
                  </button>
                )}

                {onProximoPasso && (
                  <button
                    type="button"
                    onClick={onProximoPasso}
                    disabled={passoAtualIndex !== null && passoAtualIndex >= passosAtuais.length - 1}
                    className="p-2 rounded-xl bg-[#24150b] hover:bg-[#382012] disabled:opacity-30 text-stone-200 transition-all border border-[#4d2f1d] cursor-pointer"
                    title="Próximo passo"
                  >
                    <SkipForward className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resumo Limpo da Cadeia de Movimentos (Últimos Movimentos) */}
          {passosAtuais.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#1f1108] border-2 border-[#4d2f1d] space-y-1.5 font-mono">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Sequência de Movimentos desta Jogada:</span>
              </div>
              <div className="space-y-1">
                {extrairEventosJogada(passosAtuais).map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold ${
                      ev.tipo === 'captura'
                        ? 'bg-rose-950/80 border border-rose-500/70 text-rose-200'
                        : 'bg-[#140c06] border border-[#3b2314] text-stone-200'
                    }`}
                  >
                    {ev.tipo === 'captura' ? (
                      <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                    <span>{ev.texto}</span>
                    {ev.detalhe && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-mono ml-auto">
                        {ev.detalhe}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Passos Sequenciais */}
          {passosAtuais.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#140c06] border border-[#3b2314] text-stone-300 font-medium text-xs sm:text-sm space-y-1">
              <p className="font-bold text-stone-200">Nenhuma jogada realizada ainda.</p>
              <p className="text-stone-400">
                Selecione uma casa válida destacada no seu campo para iniciar a distribuição.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-2 font-mono text-xs sm:text-sm scrollbar-thin">
              {passosAtuais.map((passo, idx) => {
                const isCurrent = passoAtualIndex === idx;
                const isCaptura = passo.tipo === 'captura_pedras';
                const isRevezamento = passo.tipo === 'recolher_revezamento';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isCaptura
                        ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md ring-1 ring-rose-500/50'
                        : isRevezamento
                        ? 'bg-amber-950/60 border-amber-600 text-amber-100'
                        : isCurrent
                        ? 'bg-[#2b170c] border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50'
                        : 'bg-[#140c06] border-[#382112] text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 ${
                          isCaptura
                            ? 'bg-rose-900 text-rose-100 border border-rose-400'
                            : isRevezamento
                            ? 'bg-amber-900 text-amber-100 border border-amber-500'
                            : 'bg-[#24150b] text-amber-300 border border-amber-700/60'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      {isCaptura ? (
                        <div className="flex items-center gap-1.5 text-rose-200 font-extrabold truncate">
                          <Target className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="truncate">{passo.mensagem}</span>
                        </div>
                      ) : (
                        <span className="truncate font-semibold text-stone-100">{passo.mensagem}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
                      {passo.casasCapturadas && passo.casasCapturadas.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-900/80 border border-rose-600 text-rose-100 font-black">
                          [{passo.casasCapturadas.join(' + ')}]
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-md bg-[#24150b] border border-[#4d2f1d] text-amber-200 font-black">
                        Mão: {passo.pedrasNaMaoDepois}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba 2: Partida Completa (Turno a Turno) */}
      {tabAtiva === 'historico_turnos' && (
        <div className="space-y-3">
          {historicoPartida.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#140c06] border border-[#3b2314] text-stone-300 font-medium text-xs sm:text-sm">
              Ainda não foram concluídos turnos nesta partida.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2 font-mono text-xs sm:text-sm scrollbar-thin">
              {historicoPartida.map((turno) => {
                const expandido = turnoExpandido === turno.id;

                return (
                  <div
                    key={turno.id}
                    className="rounded-2xl bg-[#140c06] border-2 border-[#382112] overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setTurnoExpandido(expandido ? null : turno.id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#221309] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#24150b] text-amber-300 font-black border border-amber-700/60">
                          T{turno.turnNumber}
                        </span>
                        <div className="font-extrabold text-white flex items-center gap-2">
                          <span
                            className={
                              turno.jogador === 'Jogador A' ? 'text-emerald-400' : 'text-cyan-400'
                            }
                          >
                            {turno.jogador}
                          </span>
                          <span className="text-stone-500">·</span>
                          <span className="text-stone-200">Casa #{turno.casaInicial}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-stone-300 text-xs sm:text-sm">
                        {turno.totalCapturas > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-200 border border-rose-700 font-black flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-rose-400" />
                            {turno.totalCapturas} captura{turno.totalCapturas > 1 ? 's' : ''} (+{turno.totalPedrasCapturadas})
                          </span>
                        ) : (
                          <span className="text-stone-400 font-bold">Sem captura</span>
                        )}

                        <span className="text-amber-400">
                          {expandido ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </span>
                      </div>
                    </div>

                    {/* Detalhes expandidos do turno */}
                    {expandido && (
                      <div className="p-4 pt-0 border-t border-[#2d180d] bg-[#1a0e07] space-y-2.5 text-xs sm:text-sm">
                        <div className="flex items-center justify-between text-stone-200 font-bold pt-2.5">
                          <span>Trajetória: Casa #{turno.casaInicial} → Casa final #{turno.casaFinal}</span>
                          {onReverTurno && (
                            <button
                              type="button"
                              onClick={() => onReverTurno(turno)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/50 font-black cursor-pointer transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Rever Passos</span>
                            </button>
                          )}
                        </div>

                        {/* Sequência de Movimentos (Últimos Movimentos) */}
                        <div className="p-3 rounded-xl bg-[#140c06] border border-[#3b2314] space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                            Sequência de Movimentos:
                          </div>
                          {extrairEventosJogada(turno.passos).map((ev, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 px-2 py-0.5 rounded-lg text-xs font-bold ${
                                ev.tipo === 'captura'
                                  ? 'bg-rose-950/70 border border-rose-600/70 text-rose-200'
                                  : 'text-stone-300'
                              }`}
                            >
                              {ev.tipo === 'captura' ? (
                                <Swords className="w-3 h-3 text-rose-400 shrink-0" />
                              ) : (
                                <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                              )}
                              <span>{ev.texto}</span>
                              {ev.detalhe && (
                                <span className="text-[10px] px-1 rounded bg-rose-900/60 text-rose-300 font-mono ml-auto">
                                  {ev.detalhe}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {turno.resumoCadeia && turno.resumoCadeia.historicoCapturas.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                              Capturas registradas no turno:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {turno.resumoCadeia.historicoCapturas.map((cap) => (
                                <div
                                  key={cap.numeroCaptura}
                                  className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-100 font-medium"
                                >
                                  <div className="font-bold text-rose-200">
                                    Captura #{cap.numeroCaptura} na Casa #{cap.casaOndeTerminou}:
                                  </div>
                                  <div className="text-white font-black text-sm mt-0.5">
                                    Casas: [{cap.casasCapturadas.join(' + ')}] • +{cap.pedrasCapturadas} pedras
                                  </div>
                                  <div className="text-emerald-300 font-extrabold text-xs mt-1">
                                    ↳ Continuou na Casa #{cap.proximaCasaDistribuicao}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
