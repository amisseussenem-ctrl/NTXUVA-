import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Brain, 
  Trophy, 
  Star, 
  Lightbulb, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Target, 
  Play,
  Zap,
  Check,
  X,
  AlertCircle,
  Shuffle,
  LayoutGrid,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  DesafioPuzzle, 
  PUZZLES_NTXUVA, 
  CategoriaPuzzle 
} from '../data/puzzlesNtxuva';
import { 
  GameState, 
  PassoDistribuicao, 
  BonusCapturaRecente, 
  Jogador 
} from '../types/ntxuva';
import { 
  criarGameStateCustomizado, 
  executarDistribuicao, 
  podeIniciarJogada, 
  JOGADOR_A 
} from '../models/ntxuva';
import { TabuleiroNtxuva } from './TabuleiroNtxuva';
import { 
  BalaoExpressaoMocambicana, 
  TipoExpressaoMocambicana,
  vocalizarExpressaoMocambicana 
} from './BalaoExpressaoMocambicana';
import { soundManager } from '../utils/sound';
import { estatisticasService } from '../utils/estatisticasService';

const STORAGE_PROGRESSO_KEY = 'ntxuva_puzzles_concluidos_v1';

interface ModoDesafiosProps {
  onVoltarMenu: () => void;
}

export const ModoDesafios: React.FC<ModoDesafiosProps> = ({ onVoltarMenu }) => {
  // Lista de IDs de puzzles já concluídos pelo usuário
  const [concluidos, setConcluidos] = useState<string[]>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_PROGRESSO_KEY);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const [puzzleAtualIndex, setPuzzleAtualIndex] = useState(0);
  const [categoriaFiltro, setCategoriaFiltro] = useState<'todas' | CategoriaPuzzle>('todas');
  const [mostrarDica, setMostrarDica] = useState(false);
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);
  const [modalListaAberta, setModalListaAberta] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroProgresso, setFiltroProgresso] = useState<'todos' | 'concluidos' | 'pendentes'>('todos');
  const [sucessoUltimoLance, setSucessoUltimoLance] = useState<boolean | null>(null);
  const [pedrasCapturadasTentativa, setPedrasCapturadasTentativa] = useState(0);
  const [mensagemFeedback, setMensagemFeedback] = useState<string | null>(null);
  const [velocidadeAnimacao, setVelocidadeAnimacao] = useState<'normal' | 'rapida'>('normal');

  // Puzzle ativo
  const puzzle = PUZZLES_NTXUVA[puzzleAtualIndex] || PUZZLES_NTXUVA[0];

  // Estado do jogo para o puzzle
  const [gameState, setGameState] = useState<GameState>(() => 
    criarGameStateCustomizado(puzzle.casas, puzzle.jogadorInicial || JOGADOR_A)
  );

  // Estados de animação visual (simulação física das pedras)
  const [animando, setAnimando] = useState(false);
  const [gameStateAnimacao, setGameStateAnimacao] = useState<GameState | null>(null);
  const [expressaoAtiva, setExpressaoAtiva] = useState<TipoExpressaoMocambicana | null>(null);
  const [passoVisualAtivo, setPassoVisualAtivo] = useState<PassoDistribuicao | null>(null);
  const [casaOrigemAnimacao, setCasaOrigemAnimacao] = useState<number | null>(null);
  const [casaDestinoAnimacao, setCasaDestinoAnimacao] = useState<number | null>(null);
  const [casaTerminoAnimacao, setCasaTerminoAnimacao] = useState<number | null>(null);
  const [casaMotoMotoAnimacao, setCasaMotoMotoAnimacao] = useState<number | null>(null);
  const [casasEmCapturaAnimacao, setCasasEmCapturaAnimacao] = useState<number[]>([]);
  const [trajetoriaAnimacao, setTrajetoriaAnimacao] = useState<number[]>([]);
  const [casasCapturadasRecentes, setCasasCapturadasRecentes] = useState<number[]>([]);
  const [casaCapturadoraRecente, setCasaCapturadoraRecente] = useState<number | null>(null);
  const [bonusAtivo, setBonusAtivo] = useState<BonusCapturaRecente | null>(null);

  const animacaoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Salvar progresso
  const salvarConcluido = useCallback((puzzleId: string) => {
    setConcluidos((prev) => {
      if (prev.includes(puzzleId)) return prev;
      const novo = [...prev, puzzleId];
      try {
        localStorage.setItem(STORAGE_PROGRESSO_KEY, JSON.stringify(novo));
        estatisticasService.sincronizarPuzzlesConcluidos(novo.length);
      } catch {}
      return novo;
    });
  }, []);

  // Sincronização inicial de puzzles nas estatísticas
  useEffect(() => {
    try {
      estatisticasService.sincronizarPuzzlesConcluidos(concluidos.length);
    } catch {}
  }, [concluidos.length]);

  // Reiniciar posição do puzzle atual
  const reiniciarPuzzle = useCallback(() => {
    if (animacaoTimerRef.current) {
      clearTimeout(animacaoTimerRef.current);
      animacaoTimerRef.current = null;
    }
    setAnimando(false);
    setGameStateAnimacao(null);
    setExpressaoAtiva(null);
    setPassoVisualAtivo(null);
    setCasaOrigemAnimacao(null);
    setCasaDestinoAnimacao(null);
    setCasaTerminoAnimacao(null);
    setCasaMotoMotoAnimacao(null);
    setCasasEmCapturaAnimacao([]);
    setTrajetoriaAnimacao([]);
    setCasasCapturadasRecentes([]);
    setCasaCapturadoraRecente(null);
    setBonusAtivo(null);
    setSucessoUltimoLance(null);
    setMensagemFeedback(null);
    setGameState(criarGameStateCustomizado(puzzle.casas, puzzle.jogadorInicial || JOGADOR_A));
  }, [puzzle]);

  // Troca de puzzle ao mudar de índice
  useEffect(() => {
    reiniciarPuzzle();
    setMostrarDica(false);
  }, [puzzleAtualIndex, reiniciarPuzzle]);

  // Validar se uma casa pode ser selecionada pelo jogador
  const podeIniciarCasa = useCallback((numeroCasa: number) => {
    if (animando) return { valido: false, motivo: 'Animação em andamento.' };
    return podeIniciarJogada(gameState, numeroCasa);
  }, [animando, gameState]);

  // Disparo da animação passo-a-passo simulando fielmente o jogo real
  const dispararAnimacao = useCallback((
    passos: PassoDistribuicao[], 
    casaInicial: number, 
    novoEstado: GameState,
    totalCapturadas: number,
    estadoInicialSnapshot?: GameState
  ) => {
    setAnimando(true);
    setSucessoUltimoLance(null);
    setMensagemFeedback(null);

    let index = 0;

    // Snapshot inicial: as peças começam exatamente como estão no início do desafio
    const baseSnapshot: GameState = estadoInicialSnapshot
      ? {
          ...estadoInicialSnapshot,
          casas: estadoInicialSnapshot.casas.map((c) => ({ ...c })),
          pedrasNaMao: 0,
        }
      : {
          ...gameState,
          casas: gameState.casas.map((c) => ({ ...c })),
          pedrasNaMao: 0,
        };

    setGameStateAnimacao(baseSnapshot);
    setCasaOrigemAnimacao(casaInicial);
    setTrajetoriaAnimacao([casaInicial]);

    const delayFator = velocidadeAnimacao === 'rapida' ? 0.6 : 1.0;

    const animar = () => {
      if (index >= passos.length) {
        // Encerramento da jogada no puzzle: destaca a casa onde terminou em vermelho por no máximo 1 segundo
        const casaFinal = passos[passos.length - 1]?.casa || casaInicial;
        const foiMotoMoto = passos.some((p) => p.isMotoMoto) || passos[passos.length - 1]?.isMotoMoto;
        setCasaOrigemAnimacao(null);
        setCasaDestinoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        setCasaTerminoAnimacao(casaFinal);
        if (foiMotoMoto) {
          setCasaMotoMotoAnimacao(casaFinal);
        }

        const ultimoPassoFoiFim = passos[passos.length - 1]?.tipo === 'fim_distribuicao';
        const tempoPausa = ultimoPassoFoiFim ? 350 : 1000;

        animacaoTimerRef.current = setTimeout(() => {
          setAnimando(false);
          setPassoVisualAtivo(null);
          setCasaOrigemAnimacao(null);
          setCasaDestinoAnimacao(null);
          setCasaTerminoAnimacao(null);
          setCasaMotoMotoAnimacao(null);
          setCasasEmCapturaAnimacao([]);
          setGameStateAnimacao(null);
          setGameState(novoEstado);

          // Avaliação do sucesso do puzzle
          let sucesso = false;
          const jogadasCorretas = Array.isArray(puzzle.jogadaCorreta) 
            ? puzzle.jogadaCorreta 
            : [puzzle.jogadaCorreta];

          const escolheuCasaCorreta = jogadasCorretas.includes(casaInicial);

          if (puzzle.tipoVitoria === 'vitoria_imediata') {
            sucesso = novoEstado.estadoDaPartida === 'FINALIZADA' && novoEstado.vencedor === JOGADOR_A;
          } else if (puzzle.tipoVitoria === 'bonus_extra') {
            sucesso = (novoEstado.jogadasBonusPendentes > 0 || passos.some(p => p.tipo === 'bonus_jogada_extra')) && escolheuCasaCorreta;
          } else if (puzzle.tipoVitoria === 'captura_exata') {
            sucesso = totalCapturadas === (puzzle.parametroMeta ?? 8) && escolheuCasaCorreta;
          } else if (puzzle.tipoVitoria === 'captura_minima') {
            sucesso = totalCapturadas >= (puzzle.parametroMeta ?? 1) && escolheuCasaCorreta;
          } else {
            sucesso = escolheuCasaCorreta && totalCapturadas > 0;
          }

          setPedrasCapturadasTentativa(totalCapturadas);
          setSucessoUltimoLance(sucesso);

          if (sucesso) {
            soundManager.playVictory();
            salvarConcluido(puzzle.id);
            try {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#10b981', '#fbbf24', '#38bdf8']
              });
            } catch {}

            if (totalCapturadas >= 6) {
              setExpressaoAtiva('que_bela_jogada');
            } else if (passos.filter((p) => p.tipo === 'recolher_revezamento').length >= 3) {
              setExpressaoAtiva('wau_que_bom');
            }
          } else {
            soundManager.playError();
          }
        }, tempoPausa);
        return;
      }

      const passo = passos[index];
      setPassoVisualAtivo(passo);

      let stepDelay = Math.round(280 * delayFator);

      if (passo.tipo === 'retirar_origem') {
        // A casa de onde vai levar as peças fica de cor amarela
        setCasaOrigemAnimacao(passo.casa);
        setCasaDestinoAnimacao(null);
        setCasaTerminoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        soundManager.playPickup();
        // Pausa de 1 segundo extra para o jogador contar as peças
        stepDelay = Math.max(1000, Math.round(1000 * delayFator));
      } else if (passo.tipo === 'semear_pedra') {
        setCasaDestinoAnimacao(passo.casa);
        setCasaOrigemAnimacao(null);
        setCasaTerminoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        setTrajetoriaAnimacao((prev) => {
          if (prev[prev.length - 1] === passo.casa) return prev;
          return [...prev, passo.casa];
        });
        soundManager.playStoneDrop();
        // Quando deixa a última peça, pausa 1 segundo a mais para o jogador contar as peças
        if (passo.pedrasNaMaoDepois === 0) {
          stepDelay = Math.max(1100, Math.round(1100 * delayFator));
        } else {
          stepDelay = Math.round(250 * delayFator);
        }
      } else if (passo.tipo === 'verificar_captura') {
        stepDelay = Math.round(110 * delayFator);
      } else if (passo.tipo === 'captura_pedras') {
        // As peças das covas adversárias são recolhidas e entram na mão
        setCasaOrigemAnimacao(null);
        setCasaDestinoAnimacao(null);
        setCasaTerminoAnimacao(null);
        if (passo.casasCapturadas && passo.casasCapturadas.length > 0) {
          setCasasEmCapturaAnimacao(passo.casasCapturadas);
          setCasasCapturadasRecentes(passo.casasCapturadas);
        }
        setCasaCapturadoraRecente(passo.casa);
        soundManager.playCapture();
        stepDelay = Math.round(620 * delayFator);
        if (passo.tipoBonus) {
          soundManager.playBonus(passo.tipoBonus === '2x');
          setBonusAtivo({
            tipo: passo.tipoBonus,
            jogadasExtras: passo.tipoBonus === '2x' ? 2 : 1,
            motivo: passo.tipoBonus === '2x' ? 'Captura combinada de 20+ pedras!' : 'Captura de casa com 10+ pedras!',
            casas: passo.casasCapturadas || [],
            totalPedras: passo.pedrasCapturadas || 0,
            jogador: JOGADOR_A,
            id: Date.now(),
          });
        }
      } else if (passo.tipo === 'recolher_revezamento') {
        // Casa onde vai levar as peças para dar continuidade fica amarela
        setCasaOrigemAnimacao(passo.casa);
        setCasaDestinoAnimacao(null);
        setCasaTerminoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        soundManager.playPickup();
        // Pausa de 1 segundo extra para o jogador contar quantas peças vai levar
        stepDelay = Math.max(1100, Math.round(1100 * delayFator));
      } else if (passo.tipo === 'bonus_jogada_extra') {
        stepDelay = Math.round(500 * delayFator);
      } else if (passo.tipo === 'fim_distribuicao') {
        // Casa onde termina a jogada fica de cor vermelha (pausa de 1 segundo no término)
        setCasaOrigemAnimacao(null);
        setCasaDestinoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        setCasaTerminoAnimacao(passo.casa);
        if (passo.isMotoMoto) {
          setCasaMotoMotoAnimacao(passo.casa);
          soundManager.playExpressaoAcustica('moto_moto');
          try {
            vocalizarExpressaoMocambicana('Moto-moto!');
          } catch {}
          stepDelay = 1000;
        } else {
          stepDelay = Math.min(1000, Math.round(650 * delayFator));
        }
      }

      // Atualiza o estado visual das pedras no tabuleiro cova por cova em tempo real!
      setGameStateAnimacao((prevBase) => {
        const base = prevBase || baseSnapshot;
        const casasAtualizadas = base.casas.map((c) => {
          if (passo.tipo === 'captura_pedras' && passo.casasCapturadas?.includes(c.numero)) {
            return { ...c, quantidadeDePedras: 0 };
          }
          if (c.numero === passo.casa) {
            return { ...c, quantidadeDePedras: passo.pedrasNaCasaDepois };
          }
          return c;
        });

        return {
          ...base,
          casas: casasAtualizadas,
          pedrasNaMao: passo.pedrasNaMaoDepois,
          casaEmFoco: passo.casa,
          estadoDaJogada: passo.mensagem,
        };
      });

      index++;
      animacaoTimerRef.current = setTimeout(animar, stepDelay);
    };

    animar();
  }, [puzzle, salvarConcluido, gameState, velocidadeAnimacao]);

  // Manipular escolha da casa pelo usuário no tabuleiro
  const handleEscolherCasa = (numeroCasa: number) => {
    if (animando) return;
    const val = podeIniciarCasa(numeroCasa);
    if (!val.valido) {
      soundManager.playError();
      setMensagemFeedback(val.motivo || 'Movimento inválido para esta cova.');
      return;
    }

    setMensagemFeedback(null);
    const estadoInicialSnapshot = gameState;
    const { novoEstado, passos } = executarDistribuicao(gameState, numeroCasa, true);
    const totalCapturadas = passos
      .filter((p) => p.tipo === 'captura_pedras')
      .reduce((acc, p) => acc + (p.pedrasCapturadas || 0), 0);

    dispararAnimacao(passos, numeroCasa, novoEstado, totalCapturadas, estadoInicialSnapshot);
  };

  // Executar lance recomendado / táctico do puzzle diretamente com um clique
  const handleExecutarLanceRecomendado = () => {
    if (animando) return;
    const jogadaRecomendada = Array.isArray(puzzle.jogadaCorreta) 
      ? puzzle.jogadaCorreta[0] 
      : puzzle.jogadaCorreta;
    handleEscolherCasa(jogadaRecomendada);
  };

  const irParaProximoPuzzle = () => {
    if (puzzleAtualIndex < PUZZLES_NTXUVA.length - 1) {
      setPuzzleAtualIndex(prev => prev + 1);
    } else {
      setPuzzleAtualIndex(0);
    }
  };

  const irParaPuzzleAnterior = () => {
    if (puzzleAtualIndex > 0) {
      setPuzzleAtualIndex(prev => prev - 1);
    }
  };

  const puzzlesFiltrados = useMemo(() => {
    if (categoriaFiltro === 'todas') return PUZZLES_NTXUVA;
    return PUZZLES_NTXUVA.filter(p => p.categoria === categoriaFiltro);
  }, [categoriaFiltro]);

  const handleSelecionarCategoria = (catId: 'todas' | CategoriaPuzzle) => {
    setCategoriaFiltro(catId);
    if (catId !== 'todas') {
      const primeiroDaCategoria = PUZZLES_NTXUVA.findIndex(p => p.categoria === catId);
      if (primeiroDaCategoria !== -1) {
        setPuzzleAtualIndex(primeiroDaCategoria);
      }
    }
  };

  const totalConcluidos = concluidos.length;
  const porcentagemGeral = Math.round((totalConcluidos / PUZZLES_NTXUVA.length) * 100);

  // Contagem por categoria
  const contagensPorCategoria = useMemo(() => {
    const counts: Record<string, number> = {
      iniciante: 0,
      intermediario: 0,
      medio: 0,
      avancado: 0,
      mestre: 0
    };
    for (const p of PUZZLES_NTXUVA) {
      if (counts[p.categoria] !== undefined) {
        counts[p.categoria]++;
      }
    }
    return counts;
  }, []);

  // Selecionar quebra-cabeça aleatório (prioriza desafios não concluídos)
  const selecionarAleatorio = () => {
    if (animando) return;
    const pendentes = PUZZLES_NTXUVA.map((p, idx) => ({ p, idx })).filter(item => !concluidos.includes(item.p.id));
    const pool = pendentes.length > 0 ? pendentes : PUZZLES_NTXUVA.map((p, idx) => ({ p, idx }));
    const sorteado = pool[Math.floor(Math.random() * pool.length)];
    if (sorteado) {
      setPuzzleAtualIndex(sorteado.idx);
      setMensagemFeedback(`🎲 Quebra-cabeça #${sorteado.p.numero} sorteado: "${sorteado.p.titulo}"!`);
      soundManager.playClick();
    }
  };

  // Lista filtrada para o modal de escolha direta
  const puzzlesFiltradosModal = useMemo(() => {
    return PUZZLES_NTXUVA.filter((p) => {
      if (categoriaFiltro !== 'todas' && p.categoria !== categoriaFiltro) {
        return false;
      }
      const isConcluido = concluidos.includes(p.id);
      if (filtroProgresso === 'concluidos' && !isConcluido) return false;
      if (filtroProgresso === 'pendentes' && isConcluido) return false;
      if (buscaTexto.trim()) {
        const query = buscaTexto.toLowerCase();
        const texto = `${p.numero} ${p.titulo} ${p.descricao} ${p.objetivo} ${p.categoria}`.toLowerCase();
        if (!texto.includes(query)) return false;
      }
      return true;
    });
  }, [categoriaFiltro, concluidos, filtroProgresso, buscaTexto]);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-5 space-y-3.5 animate-fadeIn font-mono text-stone-100">
      
      {/* ──────────────────────────────────────────────────────────
          TOPO: CABEÇALHO DO JOGO QUEBRA-CABEÇA & BOTÕES DE CONTROLO
          ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3d2315] gap-3">
        <div className="flex items-center gap-2.5">
          {/* Botão Voltar ao Menu Principal */}
          <button
            type="button"
            onClick={onVoltarMenu}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-[#522d17] text-stone-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-black tracking-wider text-amber-100 uppercase">
                  GAME QUEBRA-CABEÇA
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/50 font-bold uppercase tracking-wider">
                  60 Puzzles
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-stone-400">
                Desafios táticos de raciocínio lógico e capturas de Ntxuva
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas de Progresso do Jogador & Ações Rápidas */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <div className="flex items-center gap-2 bg-[#1b1008] px-3 py-1.5 rounded-2xl border border-[#3d2315]">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{totalConcluidos} / {PUZZLES_NTXUVA.length}</span>
              <span className="text-stone-500">({porcentagemGeral}%)</span>
            </div>

            <div className="w-16 sm:w-24 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${porcentagemGeral}%` }}
              />
            </div>
          </div>

          {/* Botão Desafio Aleatório */}
          <button
            type="button"
            onClick={selecionarAleatorio}
            disabled={animando}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-amber-500/50 text-amber-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40"
            title="Sortear um quebra-cabeça aleatório"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Aleatório</span>
          </button>

          {/* Botão Ver Todos os 60 Puzzles */}
          <button
            type="button"
            onClick={() => setModalListaAberta(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/40 hover:to-orange-600/40 border border-amber-500/70 text-amber-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Abrir catálogo com todos os 60 quebra-cabeças"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>Todos os 60</span>
          </button>

          {/* Botão Como Jogar / Regras Rápidas */}
          <button
            type="button"
            onClick={() => setMostrarInstrucoes(prev => !prev)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              mostrarInstrucoes
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-[#29170c] hover:bg-[#382012] border-[#522d17] text-stone-300 hover:text-white'
            }`}
            title="Como jogar os quebra-cabeças"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          CARD EXPLICATIVO EXPANSÍVEL: COMO RESOLVER O QUEBRA-CABEÇA
          ────────────────────────────────────────────────────────── */}
      {mostrarInstrucoes && (
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1c120a] via-[#26150b] to-[#1c120a] border-2 border-amber-500/70 text-xs text-stone-200 space-y-2 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between text-amber-300 font-bold border-b border-[#3d2315] pb-1.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>GUIA DO JOGO QUEBRA-CABEÇA (NTXUVA)</span>
            </div>
            <button
              type="button"
              onClick={() => setMostrarInstrucoes(false)}
              className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] leading-relaxed pt-1">
            <div className="p-2.5 rounded-xl bg-black/30 border border-amber-500/20">
              <strong className="text-amber-300 block mb-1">1. Escolha a Cova</strong>
              Jogue sempre com as peças do Jogador A (Covas 1 a 12). Só é permitido semear a partir de covas que tenham 2 ou mais pedras.
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-amber-500/20">
              <strong className="text-amber-300 block mb-1">2. Semeadura & Linha Frontal</strong>
              As pedras caem uma a uma em sentido anti-horário. A última pedra precisa cair numa cova da sua linha de ataque (Covas 1 a 6) que estivesse vazia.
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-amber-500/20">
              <strong className="text-amber-300 block mb-1">3. Captura & Meta</strong>
              Se a cova adversária à frente tiver pedras, elas são capturadas! Se a cova de trás também contiver pedras, ambas são levadas juntas!
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          FILTRO DE CATEGORIAS: INICIANTE, INTERMEDIÁRIO, MÉDIO, AVANÇADO, MESTRE
          ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-xs">
        {[
          { id: 'todas', label: `Todos (${PUZZLES_NTXUVA.length})` },
          { id: 'iniciante', label: `Iniciante (${contagensPorCategoria.iniciante})` },
          { id: 'intermediario', label: `Intermediário (${contagensPorCategoria.intermediario})` },
          { id: 'medio', label: `Médio (${contagensPorCategoria.medio})` },
          { id: 'avancado', label: `Avançado (${contagensPorCategoria.avancado})` },
          { id: 'mestre', label: `Mestre Kota (${contagensPorCategoria.mestre})` },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleSelecionarCategoria(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all shrink-0 cursor-pointer ${
              categoriaFiltro === cat.id
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                : 'bg-[#24130a] border-[#3d2315] text-stone-300 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* CARROSSEL NUMÉRICO DOS DESAFIOS (FILTRADO POR CATEGORIA) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
        {puzzlesFiltrados.map((p) => {
          const globalIdx = PUZZLES_NTXUVA.findIndex(item => item.id === p.id);
          const isAtivo = globalIdx === puzzleAtualIndex;
          const isConcluido = concluidos.includes(p.id);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPuzzleAtualIndex(globalIdx)}
              className={`relative px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isAtivo
                  ? 'bg-gradient-to-b from-[#3a2012] to-[#251309] border-amber-400 ring-2 ring-amber-500/50 shadow-lg text-amber-200 font-black'
                  : isConcluido
                  ? 'bg-[#142316] border-emerald-500/60 text-emerald-200'
                  : 'bg-[#1f1109] border-[#381e10] text-stone-400 hover:text-stone-200'
              }`}
            >
              <span className="text-xs font-mono font-black">#{p.numero}</span>
              {isConcluido && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────
          HUD DO DESAFIO ATIVO: TÍTULO, OBJETIVO E AÇÃO DE EXECUTAR
          ────────────────────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[#1c1109] border-2 border-amber-500/70 shadow-2xl space-y-3 relative overflow-hidden">
        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#3b2112]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-black text-amber-200 tracking-wide">
                Desafio #{puzzle.numero}: {puzzle.titulo}
              </span>
              <div className="flex items-center text-amber-400 text-xs">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < puzzle.dificuldadeEstrelas ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                    }`}
                  />
                ))}
              </div>
              {concluidos.includes(puzzle.id) && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-black flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Concluído
                </span>
              )}
            </div>

            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              {puzzle.descricao}
            </p>
          </div>

          {/* Botões de Ação do Desafio */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {/* Botão de Velocidade */}
            <button
              type="button"
              onClick={() => setVelocidadeAnimacao(prev => prev === 'normal' ? 'rapida' : 'normal')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-[#522d17] text-stone-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
              title="Velocidade da simulação"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{velocidadeAnimacao === 'rapida' ? 'Rápida' : 'Normal'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMostrarDica((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                mostrarDica
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                  : 'bg-[#29170c] hover:bg-[#382012] border-amber-600/50 text-amber-300'
              }`}
              title="Ver dica tática"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Dica</span>
            </button>

            <button
              type="button"
              onClick={reiniciarPuzzle}
              disabled={animando}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-[#522d17] text-stone-300 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              title="Reiniciar posição do desafio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* CARTÃO DE OBJETIVO E AÇÃO DIRETA DE EXECUTAR */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#2f180d] to-amber-950/80 border-2 border-amber-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-black shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                SEU OBJETIVO:
              </span>
              <strong className="text-xs sm:text-sm font-extrabold text-white leading-tight block">
                {puzzle.objetivo}
              </strong>
            </div>
          </div>

          {/* BOTÃO PRINCIPAL: EXECUTAR / SIMULAR LANCE REAL */}
          <button
            type="button"
            onClick={handleExecutarLanceRecomendado}
            disabled={animando}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-emerald-300"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Executar Lance</span>
          </button>
        </div>

        {/* FEEDBACK DE COVA INVÁLIDA (SE O USUÁRIO TOCAR EM COVA COM 0 OU 1 PEDRA) */}
        {mensagemFeedback && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{mensagemFeedback}</span>
            <button
              type="button"
              onClick={() => setMensagemFeedback(null)}
              className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* DICA TÁTICA (EXPANSÍVEL) */}
        {mostrarDica && (
          <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/60 text-xs text-amber-200 space-y-1 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-black text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>DICA TÁTICA:</span>
            </div>
            <p className="leading-relaxed font-medium">
              {puzzle.dica}
            </p>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          TABULEIRO INTERATIVO DO DESAFIO (SIMULAÇÃO REAL DAS PEDRAS)
          ────────────────────────────────────────────────────────── */}
      <div className="w-full relative">
        <TabuleiroNtxuva
          casas={(gameStateAnimacao || gameState).casas}
          jogadorAtual={(gameStateAnimacao || gameState).jogadorAtual}
          podeIniciarCasa={podeIniciarCasa}
          casaEmFoco={(gameStateAnimacao || gameState).casaEmFoco}
          ultimaCasaEscolhida={(gameStateAnimacao || gameState).ultimaCasaEscolhida}
          casasCapturadas={casasCapturadasRecentes}
          casaCapturadora={casaCapturadoraRecente}
          onEscolherCasa={handleEscolherCasa}
          desabilitado={animando}
          passoAtual={passoVisualAtivo}
          casaOrigemAnimacao={casaOrigemAnimacao}
          casaDestinoAnimacao={casaDestinoAnimacao}
          casaTerminoAnimacao={casaTerminoAnimacao}
          casaMotoMotoAnimacao={casaMotoMotoAnimacao}
          casasEmCapturaAnimacao={casasEmCapturaAnimacao}
          pedrasNaMaoAnimacao={0}
          trajetoriaAnimacao={trajetoriaAnimacao}
          onReiniciarPartida={reiniciarPuzzle}
          onSairMenu={onVoltarMenu}
          bonus={bonusAtivo}
        />

        {/* ──────────────────────────────────────────────────────────
            PAINEL EM DESTAQUE À FRENTE DO TABULEIRO (VITÓRIA OU DERROTA)
            ────────────────────────────────────────────────────────── */}
        {sucessoUltimoLance !== null && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-[3px] rounded-2xl sm:rounded-3xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className={`w-full max-w-md p-5 sm:p-6 rounded-3xl border-2 shadow-2xl space-y-4 font-mono ${
              sucessoUltimoLance
                ? 'bg-[#122315]/95 border-emerald-400 ring-4 ring-emerald-500/30 text-emerald-100'
                : 'bg-[#25120a]/95 border-rose-500 ring-4 ring-rose-500/30 text-rose-100'
            }`}>
              {/* Cabeçalho do Card */}
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  {sucessoUltimoLance ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce shrink-0" />
                  ) : (
                    <XCircle className="w-7 h-7 text-rose-400 animate-pulse shrink-0" />
                  )}
                  <div>
                    <h3 className={`text-base sm:text-lg font-black tracking-wide uppercase ${
                      sucessoUltimoLance ? 'text-emerald-300' : 'text-rose-300'
                    }`}>
                      {sucessoUltimoLance ? 'DESAFIO CONCLUÍDO!' : 'NÃO FOI DESSA VEZ'}
                    </h3>
                    <span className="text-xs text-stone-300">
                      {sucessoUltimoLance ? 'Táctica executada com maestria!' : 'A jogada não atingiu a meta.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSucessoUltimoLance(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                  title="Fechar para ver tabuleiro"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Explicação da Jogada */}
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                {sucessoUltimoLance
                  ? puzzle.explicacaoSucesso
                  : `Você realizou uma semeadura válida que capturou ${pedrasCapturadasTentativa} pedra(s), mas o objetivo era "${puzzle.objetivo}".`}
              </p>

              {/* Dica para tentar novamente se perdeu */}
              {!sucessoUltimoLance && (
                <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs">
                  <strong>Dica tática:</strong> {puzzle.dica}
                </div>
              )}

              {/* BOTÕES DE AÇÃO:
                  - Se VENCEU: Botão "Próximo" e Botão "Continuar"
                  - Se PERDEU: Botão "Tentar de Novo" e Botão "Prosseguir" */}
              <div className="pt-2 space-y-2">
                {sucessoUltimoLance ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    {/* 1. Botão PRÓXIMO */}
                    <button
                      type="button"
                      onClick={() => {
                        setSucessoUltimoLance(null);
                        irParaProximoPuzzle();
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#20140c] hover:bg-[#2d1b10] border-2 border-amber-500/60 text-amber-300 hover:text-amber-200 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                    >
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                      <span>Próximo</span>
                    </button>

                    {/* 2. Botão CONTINUAR */}
                    <button
                      type="button"
                      onClick={() => {
                        setSucessoUltimoLance(null);
                        irParaProximoPuzzle();
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-950/60 border border-emerald-300"
                    >
                      <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
                      <span>Continuar</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    {/* 1. Botão TENTAR DE NOVO */}
                    <button
                      type="button"
                      onClick={() => {
                        reiniciarPuzzle();
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-950/60 border border-amber-300"
                    >
                      <RotateCcw className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                      <span>Tentar de Novo</span>
                    </button>

                    {/* 2. Botão PROSSEGUIR */}
                    <button
                      type="button"
                      onClick={() => {
                        setSucessoUltimoLance(null);
                        irParaProximoPuzzle();
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#24150c] hover:bg-[#341e12] border-2 border-stone-600 hover:border-stone-400 text-stone-200 hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Prosseguir</span>
                      <ArrowRight className="w-4 h-4 text-stone-300" />
                    </button>
                  </div>
                )}

                {/* Opção secundária discreta para rever a posição final no tabuleiro */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setSucessoUltimoLance(null)}
                    className="text-[11px] text-stone-400 hover:text-stone-200 underline transition-colors cursor-pointer"
                  >
                    Olhar posição final no tabuleiro
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          NAVEGAÇÃO RÁPIDA ANTERIOR / PRÓXIMO NO RODAPÉ
          ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-[#382012] text-xs">
        <button
          type="button"
          onClick={irParaPuzzleAnterior}
          disabled={puzzleAtualIndex === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22130a] hover:bg-[#331c0e] disabled:opacity-40 border border-[#442614] text-stone-300 hover:text-white font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <span className="text-stone-400 font-bold">
          Desafio {puzzle.numero} de {PUZZLES_NTXUVA.length}
        </span>

        <button
          type="button"
          onClick={irParaProximoPuzzle}
          disabled={puzzleAtualIndex === PUZZLES_NTXUVA.length - 1}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22130a] hover:bg-[#331c0e] disabled:opacity-40 border border-[#442614] text-stone-300 hover:text-white font-bold transition-all cursor-pointer"
        >
          <span>Próximo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* BALÃO DE EXPRESSÃO MOÇAMBICANA (PARABÉNS E JOGADAS ÉPICAS) */}
      <BalaoExpressaoMocambicana
        expressao={expressaoAtiva}
        onFechar={() => setExpressaoAtiva(null)}
      />

      {/* ──────────────────────────────────────────────────────────
          MODAL: CATÁLOGO COMPLETO DOS 60 QUEBRA-CABEÇAS
          ────────────────────────────────────────────────────────── */}
      {modalListaAberta && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-[#1c1109] border-2 border-amber-500/80 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            
            {/* CABEÇALHO DO MODAL */}
            <div className="p-3.5 sm:p-4 border-b border-[#3b2214] flex items-center justify-between gap-3 bg-[#170e07]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wider">
                    CATÁLOGO DOS 60 QUEBRA-CABEÇAS
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    {totalConcluidos} de {PUZZLES_NTXUVA.length} concluídos ({porcentagemGeral}%)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalListaAberta(false)}
                className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors"
                title="Fechar catálogo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FILTROS & BARRA DE PESQUISA */}
            <div className="p-3 border-b border-[#3b2214] space-y-2 bg-[#140b05]">
              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  placeholder="Pesquisar por número, título ou objetivo..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#24140b] border border-[#4d2b17] text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-amber-400 transition-colors"
                />
                {buscaTexto && (
                  <button
                    type="button"
                    onClick={() => setBuscaTexto('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro de Status: Todos / Concluídos / Pendentes */}
              <div className="flex items-center gap-1.5 flex-wrap justify-between">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'concluidos', label: `Concluídos (${totalConcluidos})` },
                    { id: 'pendentes', label: `Pendentes (${PUZZLES_NTXUVA.length - totalConcluidos})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltroProgresso(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        filtroProgresso === f.id
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-[#24140b] text-stone-400 hover:text-white border border-[#3d2315]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Filtro Rápido de Categorias no Modal */}
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value as any)}
                  aria-label="Filtrar quebra-cabeças por nível"
                  className="px-2 py-1 rounded-lg bg-[#24140b] border border-[#3d2315] text-[10px] text-amber-300 font-bold focus:outline-hidden"
                >
                  <option value="todas">Todas as Categorias</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="medio">Médio</option>
                  <option value="avancado">Avançado</option>
                  <option value="mestre">Mestre Kota</option>
                </select>
              </div>
            </div>

            {/* LISTA GRID DE QUEBRA-CABEÇAS */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2">
              {puzzlesFiltradosModal.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-1">
                  <Brain className="w-8 h-8 mx-auto text-stone-600" />
                  <p>Nenhum quebra-cabeça encontrado com esses filtros.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                  {puzzlesFiltradosModal.map((p) => {
                    const globalIdx = PUZZLES_NTXUVA.findIndex(item => item.id === p.id);
                    const isAtivo = globalIdx === puzzleAtualIndex;
                    const isConcluido = concluidos.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setPuzzleAtualIndex(globalIdx);
                          setModalListaAberta(false);
                          soundManager.playClick();
                        }}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left group active:scale-[0.98] ${
                          isAtivo
                            ? 'bg-[#331c0e] border-amber-400 ring-2 ring-amber-500/50 shadow-lg'
                            : isConcluido
                            ? 'bg-[#152417] hover:bg-[#1a2e1d] border-emerald-500/50'
                            : 'bg-[#22130a] hover:bg-[#2e190e] border-[#442614]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-amber-300">
                              #{p.numero}
                            </span>
                            <div className="flex items-center text-amber-400 text-[10px]">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-2.5 h-2.5 ${
                                    i < p.dificuldadeEstrelas ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-stone-100 group-hover:text-amber-200 line-clamp-1 leading-tight">
                            {p.titulo}
                          </h4>

                          <p className="text-[10px] text-stone-400 line-clamp-2 leading-tight">
                            {p.objetivo}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-black/30 text-[10px]">
                          <span className={`px-1.5 py-0.2 rounded-full font-bold uppercase text-[8px] ${
                            p.categoria === 'iniciante'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : p.categoria === 'intermediario'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                              : p.categoria === 'medio'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : p.categoria === 'avancado'
                              ? 'bg-orange-950 text-orange-300 border border-orange-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}>
                            {p.categoria}
                          </span>

                          {isConcluido ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolvido</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 group-hover:underline font-bold">
                              Jogar →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RODAPÉ DO MODAL */}
            <div className="p-3 border-t border-[#3b2214] flex items-center justify-between bg-[#140b05] text-[11px] text-stone-400">
              <span>{puzzlesFiltradosModal.length} quebra-cabeças exibidos</span>
              <button
                type="button"
                onClick={() => {
                  setModalListaAberta(false);
                  selecionarAleatorio();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black cursor-pointer transition-colors shadow-sm"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Sorteio Aleatório</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
