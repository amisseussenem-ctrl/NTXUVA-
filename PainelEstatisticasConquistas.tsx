import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Target, 
  Flame, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Bot, 
  Monitor, 
  Globe, 
  Brain,
  Star,
  Layers,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  EstatisticasJogador, 
  LISTA_CONQUISTAS, 
  Conquista, 
  CategoriaConquista,
  estatisticasService 
} from '../utils/estatisticasService';

interface PainelEstatisticasConquistasProps {
  stats: EstatisticasJogador;
  onAtualizarStats: (novasStats: EstatisticasJogador) => void;
  abaInicial?: 'estatisticas' | 'conquistas';
}

export const PainelEstatisticasConquistas: React.FC<PainelEstatisticasConquistasProps> = ({
  stats,
  onAtualizarStats,
  abaInicial = 'estatisticas',
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'estatisticas' | 'conquistas'>(abaInicial);
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | CategoriaConquista>('todas');
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  // Cálculos gerais
  const totalVitorias = stats.vitoriasLocal + stats.vitoriasIA + stats.vitoriasOnline;
  const totalDerrotas = stats.derrotasLocal + stats.derrotasIA + stats.derrotasOnline;
  const taxaVitoriaGeral = stats.partidasTotais > 0 
    ? Math.round((totalVitorias / stats.partidasTotais) * 100) 
    : 0;

  const conquistasDesbloqueadasCount = Object.keys(stats.conquistasDesbloqueadas).length;
  const totalConquistas = LISTA_CONQUISTAS.length;
  const percentualConquistas = Math.round((conquistasDesbloqueadasCount / totalConquistas) * 100);

  const pontosTotais = LISTA_CONQUISTAS.reduce((soma, c) => {
    return stats.conquistasDesbloqueadas[c.id] ? soma + c.pontos : soma;
  }, 0);

  const conquistasFiltradas = LISTA_CONQUISTAS.filter((c) => {
    if (filtroCategoria === 'todas') return true;
    return c.categoria === filtroCategoria;
  });

  const handleReset = () => {
    const limpo = estatisticasService.redefinir();
    onAtualizarStats(limpo);
    setConfirmandoReset(false);
  };

  return (
    <div className="space-y-4 font-mono text-stone-100">
      
      {/* ──────────────────────────────────────────────────────────
          SELETOR DE ABAS: ESTATÍSTICAS vs CONQUISTAS
          ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 p-1 bg-[#150d08] rounded-2xl border border-[#3d2315]">
        <button
          type="button"
          onClick={() => setAbaAtiva('estatisticas')}
          className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            abaAtiva === 'estatisticas'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Estatísticas</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('conquistas')}
          className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            abaAtiva === 'conquistas'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Conquistas</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            abaAtiva === 'conquistas' 
              ? 'bg-stone-950 text-amber-300' 
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            {conquistasDesbloqueadasCount}/{totalConquistas}
          </span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────
          ABA 1: ESTATÍSTICAS DO JOGADOR
          ────────────────────────────────────────────────────────── */}
      {abaAtiva === 'estatisticas' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* CARTÃO DE DESTAQUE OURO: MAIOR CAPTURA NUMA ÚNICA JOGADA */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2f1a0e] via-[#3a2012] to-[#261309] border-2 border-amber-400 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg font-black shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 uppercase tracking-widest font-black block">
                    Recorde Pessoal
                  </span>
                  <h4 className="text-sm font-black text-amber-100 uppercase">
                    Maior Captura em 1 Jogada
                  </h4>
                  {stats.dataMaiorCaptura ? (
                    <span className="text-[10px] text-stone-400">
                      Conquistado em {stats.dataMaiorCaptura} ({stats.modoMaiorCaptura})
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400">
                      Jogue partidas para registrar o seu recorde
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight drop-shadow-md">
                  {stats.maiorCapturaUnica}
                </span>
                <span className="text-[10px] text-stone-300 uppercase font-black block">
                  Pedras
                </span>
              </div>
            </div>
          </div>

          {/* RESUMO GERAL DO DESEMPENHO */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#23140b] border border-[#3d2315]">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Partidas</span>
              <strong className="text-lg font-black text-amber-200">{stats.partidasTotais}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#23140b] border border-[#3d2315]">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Vitórias</span>
              <strong className="text-lg font-black text-emerald-300">{totalVitorias}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#23140b] border border-[#3d2315]">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Aproveitamento</span>
              <strong className="text-lg font-black text-amber-300">{taxaVitoriaGeral}%</strong>
            </div>
          </div>

          {/* DESEMPENHO DETALHADO POR MODO DE JOGO */}
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              Resultados por Modo de Jogo:
            </span>

            {/* MODO LOCAL */}
            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs text-white block">Modo Local (2P)</strong>
                  <span className="text-[10px] text-stone-400">Partidas frente a frente no mesmo ecrã</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="text-emerald-400">{stats.vitoriasLocal}V</span>
                  <span className="text-stone-500">/</span>
                  <span className="text-rose-400">{stats.derrotasLocal}D</span>
                </div>
              </div>
            </div>

            {/* MODO CONTRA IA */}
            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs text-white block">Contra IA</strong>
                  <span className="text-[10px] text-stone-400">
                    {stats.vitoriasIAMestreKota > 0 
                      ? `${stats.vitoriasIAMestreKota} vitória(s) contra Mestre Kota` 
                      : 'Motor com 3 níveis táticos'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="text-emerald-400">{stats.vitoriasIA}V</span>
                  <span className="text-stone-500">/</span>
                  <span className="text-rose-400">{stats.derrotasIA}D</span>
                </div>
              </div>
            </div>

            {/* MODO ONLINE */}
            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs text-white block">Modo Online</strong>
                  <span className="text-[10px] text-stone-400">Salas em tempo real com código</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="text-emerald-400">{stats.vitoriasOnline}V</span>
                  <span className="text-stone-500">/</span>
                  <span className="text-rose-400">{stats.derrotasOnline}D</span>
                </div>
              </div>
            </div>
          </div>

          {/* DEMAIS CONQUISTAS E REGRAS ESPECIAIS */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-stone-300">Vitórias p/ Asfixia:</span>
              </div>
              <strong className="text-amber-300 font-black">{stats.vitoriasPorAsfixia}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span className="text-stone-300">Puzzles Resolvidos:</span>
              </div>
              <strong className="text-emerald-300 font-black">{stats.puzzlesConcluidosTotal}/10</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300">Bónus de 1x Jogada:</span>
              </div>
              <strong className="text-amber-300 font-black">{stats.totalBonus1x}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-stone-300">Bónus de 2x Jogadas:</span>
              </div>
              <strong className="text-amber-300 font-black">{stats.totalBonus2x}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#23140b] border border-[#3d2315] flex items-center justify-between col-span-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300">Total de Pedras Capturadas na Carreira:</span>
              </div>
              <strong className="text-amber-300 font-black text-sm">{stats.totalPedrasCapturadas}</strong>
            </div>
          </div>

          {/* BOTÃO DE RESETAR ESTATÍSTICAS */}
          <div className="pt-2 border-t border-[#3d2315] flex items-center justify-between">
            {confirmandoReset ? (
              <div className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-950/50 border border-rose-600/50 animate-fadeIn">
                <span className="text-[11px] text-rose-200">Zerar todo o histórico de estatísticas?</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Sim, Zerar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoReset(false)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white font-bold text-[10px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoReset(true)}
                className="inline-flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar Estatísticas e Conquistas</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          ABA 2: CONQUISTAS DESBLOQUEÁVEIS (TROFÉUS)
          ────────────────────────────────────────────────────────── */}
      {abaAtiva === 'conquistas' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* BARRA DE PROGRESSO GERAL DE CONQUISTAS */}
          <div className="p-3.5 rounded-2xl bg-[#23140b] border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Progresso das Conquistas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black">{conquistasDesbloqueadasCount}/{totalConquistas}</span>
                <span className="text-stone-400 font-medium">({percentualConquistas}%)</span>
                <span className="text-amber-400 font-black pl-1.5 border-l border-stone-700">
                  ⭐ {pontosTotais} pts
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${percentualConquistas}%` }}
              />
            </div>
          </div>

          {/* FILTRO DE CATEGORIAS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'vitorias', label: 'Vitórias' },
              { id: 'capturas', label: 'Capturas' },
              { id: 'taticas', label: 'Táticas' },
              { id: 'mestria', label: 'Mestria' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroCategoria(f.id as any)}
                className={`px-3 py-1 rounded-xl border text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  filtroCategoria === f.id
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-sm'
                    : 'bg-[#24130a] border-[#3d2315] text-stone-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* LISTA DE CARTÕES DE CONQUISTAS */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {conquistasFiltradas.map((conquista) => {
              const desbloqueada = !!stats.conquistasDesbloqueadas[conquista.id];
              const dataDesbloqueio = stats.conquistasDesbloqueadas[conquista.id]
                ? new Date(stats.conquistasDesbloqueadas[conquista.id]).toLocaleDateString('pt-PT')
                : null;
              const progresso = Math.min(conquista.calcularProgresso(stats), conquista.meta);
              const porcentagemMeta = Math.min(Math.round((progresso / conquista.meta) * 100), 100);

              return (
                <div
                  key={conquista.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                    desbloqueada
                      ? 'bg-gradient-to-r from-[#2a1b10] to-[#1c1109] border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-[#1a0f09]/80 border-[#381e10] opacity-75'
                  }`}
                >
                  {/* Ícone de Destaque */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                    desbloqueada
                      ? 'bg-amber-500/20 border-amber-400/60 shadow-inner'
                      : 'bg-stone-900 border-stone-800 text-stone-600'
                  }`}>
                    {desbloqueada ? conquista.icone : <Lock className="w-5 h-5 text-stone-600" />}
                  </div>

                  {/* Conteúdo da Conquista */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className={`text-xs font-black tracking-wide ${
                          desbloqueada ? 'text-amber-200' : 'text-stone-300'
                        }`}>
                          {conquista.titulo}
                        </strong>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-900 text-amber-400/80 font-mono font-bold">
                          +{conquista.pontos} pts
                        </span>
                      </div>

                      {desbloqueada ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-black shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Desbloqueada</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {progresso} / {conquista.meta}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-300 leading-tight">
                      {conquista.descricao}
                    </p>

                    {/* Barra de Progresso ou Data de Desbloqueio */}
                    {desbloqueada ? (
                      <span className="text-[10px] text-amber-400/70 block pt-0.5">
                        Conquistada em {dataDesbloqueio}
                      </span>
                    ) : (
                      <div className="w-full pt-1">
                        <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                          <div 
                            className="h-full bg-amber-500/60 transition-all duration-300"
                            style={{ width: `${porcentagemMeta}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
