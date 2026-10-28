import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  inicializarJogo, 
  executarDistribuicao, 
  podeIniciarJogada, 
  alternarJogador,
  JOGADOR_A, 
  JOGADOR_B 
} from './models/ntxuva';
import { GameState, PassoDistribuicao, Jogador, DificuldadeIA, BonusCapturaRecente } from './types/ntxuva';
import { TabuleiroNtxuva } from './components/TabuleiroNtxuva';
import { TurnRecord } from './components/HistoricoJogadas';
import { PainelPartidaOnline } from './components/PainelPartidaOnline';
import { MenuInicial } from './components/MenuInicial';
import { MenuJogarOnline } from './components/MenuJogarOnline';
import { PreparacaoPartida } from './components/PreparacaoPartida';
import { EcraVitoria } from './components/EcraVitoria';
import { RegrasIlustradas } from './components/RegrasIlustradas';
import { ModalDoacoesCriador } from './components/ModalDoacoesCriador';
import { BannerBonusJogadaExtra } from './components/BannerBonusJogadaExtra';
import { ChatReacoesOnline } from './components/ChatReacoesOnline';
import { RelogioTurnoOnline } from './components/RelogioTurnoOnline';
import { BannerReconexaoOnline, CardRetomarPartidaOnline } from './components/BannerReconexaoOnline';
import { ModoDesafios } from './components/ModoDesafios';
import { TutorialInterativo } from './components/TutorialInterativo';
import { PainelEstatisticasConquistas } from './components/PainelEstatisticasConquistas';
import { ToastConquistaDesbloqueada } from './components/ToastConquistaDesbloqueada';
import { BarraChatComunidade } from './components/BarraChatComunidade';
import { ModalPerfilJogador } from './components/ModalPerfilJogador';
import { ModalCriarCampeonato } from './components/ModalCriarCampeonato';
import { ModalConfirmarSaida } from './components/ModalConfirmarSaida';
import { ModalSalvarPartida } from './components/ModalSalvarPartida';
import { ModalInstalarTelemovel } from './components/ModalInstalarTelemovel';
import { AnuncioBanner } from './components/AnuncioBanner';
import { ModalAnuncioIntersticial } from './components/ModalAnuncioIntersticial';
import { ModalAnuncioRecompensado } from './components/ModalAnuncioRecompensado';
import { ModalMoedasInsuficientes } from './components/ModalMoedasInsuficientes';
import { PainelConfiguracaoAnuncios } from './components/PainelConfiguracaoAnuncios';
import { anunciosService, CUSTO_PARTIDA_MOEDAS, MAXIMO_MOEDAS } from './utils/anunciosService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useNavegacaoVoltarTelefone } from './hooks/useNavegacaoVoltarTelefone';
import { comunidadeService } from './utils/comunidadeService';
import { PerfilJogador } from './types/online';
import { 
  BalaoExpressaoMocambicana, 
  TipoExpressaoMocambicana,
  vocalizarExpressaoMocambicana 
} from './components/BalaoExpressaoMocambicana';
import { useNtxuvaOnline } from './hooks/useNtxuvaOnline';
import { soundManager } from './utils/sound';
import { 
  estatisticasService, 
  EstatisticasJogador, 
  Conquista 
} from './utils/estatisticasService';
import { escolherMelhorJogadaIA } from './models/ntxuvaAI';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Trophy, 
  ScrollText, 
  X, 
  Sparkles, 
  Globe, 
  Monitor, 
  Bot,
  Brain,
  Home,
  Copy, 
  Check, 
  Flag, 
  LogOut, 
  BookOpen, 
  Info,
  User,
  LayoutGrid,
  ChevronDown,
  Heart,
  ChevronUp,
  Crown,
  Zap,
  Smile,
  Timer,
  RefreshCw,
  TrendingUp,
  Award,
  Flame,
  Music,
  Radio,
  MessageSquare,
  Smartphone,
  Megaphone,
  Gift,
  Coins,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

export type VelocidadeAnimacao = 'lenta' | 'normal' | 'rapida' | 'instantanea';

const INTERVALOS_VELOCIDADE: Record<VelocidadeAnimacao, number> = {
  lenta: 950,
  normal: 500,
  rapida: 250,
  instantanea: 0,
};

export default function App() {
  // Navegação de Telas: 'menu' (Menu Principal) | 'preparacao' | 'jogar_online' | 'partida' | 'desafios' | 'tutorial'
  const [telaAtual, setTelaAtual] = useState<'menu' | 'preparacao' | 'jogar_online' | 'partida' | 'desafios' | 'tutorial'>('menu');

  // Nomes dos jogadores para o modo Local / IA
  const [nomeJogadorLocalA, setNomeJogadorLocalA] = useState('Jogador 1');
  const [nomeJogadorLocalB, setNomeJogadorLocalB] = useState('Jogador 2');

  // Nível de Dificuldade da IA ('iniciante' | 'medio' | 'mestre')
  const [dificuldadeIA, setDificuldadeIA] = useState<DificuldadeIA>('medio');

  // Modo de Jogo: 'local' (2P no mesmo dispositivo) | 'online' | 'ia' (Contra Robô/IA)
  const [modoJogo, setModoJogo] = useState<'online' | 'local' | 'ia'>('local');

  // Estado da IA
  const [iaPensando, setIaPensando] = useState(false);

  // Estado canônico local (para quando no modo Local e IA)
  const [gameStateLocal, setGameStateLocal] = useState<GameState>(() => inicializarJogo());
  
  // Estado visual animado intermediário durante a semeadura
  const [gameStateAnimacao, setGameStateAnimacao] = useState<GameState | null>(null);

  // Histórico e passos da jogada
  const [passosUltimaJogada, setPassosUltimaJogada] = useState<PassoDistribuicao[]>([]);
  const [passoAnimacaoAtual, setPassoAnimacaoAtual] = useState<number | null>(null);
  const [historicoPartida, setHistoricoPartida] = useState<TurnRecord[]>([]);
  
  // Configuração de animação e velocidade
  const [velocidade, setVelocidade] = useState<VelocidadeAnimacao>('normal');
  const velocidadeRef = useRef<VelocidadeAnimacao>(velocidade);
  useEffect(() => {
    velocidadeRef.current = velocidade;
  }, [velocidade]);

  const alternarVelocidade = useCallback(() => {
    const ordem: VelocidadeAnimacao[] = ['normal', 'rapida', 'instantanea', 'lenta'];
    const idx = ordem.indexOf(velocidadeRef.current);
    const proxima = ordem[(idx + 1) % ordem.length];
    setVelocidade(proxima);
    velocidadeRef.current = proxima;
  }, []);

  const [animando, setAnimando] = useState(false);
  
  // Estados visuais temporários da animação
  const [casaOrigemAnimacao, setCasaOrigemAnimacao] = useState<number | null>(null);
  const [casaDestinoAnimacao, setCasaDestinoAnimacao] = useState<number | null>(null);
  const [casaTerminoAnimacao, setCasaTerminoAnimacao] = useState<number | null>(null);
  const [casaMotoMotoAnimacao, setCasaMotoMotoAnimacao] = useState<number | null>(null);
  const [casasEmCapturaAnimacao, setCasasEmCapturaAnimacao] = useState<number[]>([]);
  const [pedrasNaMaoAnimacao, setPedrasNaMaoAnimacao] = useState<number>(0);
  const [trajetoriaAnimacao, setTrajetoriaAnimacao] = useState<number[]>([]);
  const [passoVisualAtivo, setPassoVisualAtivo] = useState<PassoDistribuicao | null>(null);

  // Destaques pós-jogada e tutorial interativo
  const [casasCapturadasRecentes, setCasasCapturadasRecentes] = useState<number[]>([]);
  const [casaCapturadoraRecente, setCasaCapturadoraRecente] = useState<number | null>(null);
  const [jogadorUltimaJogada, setJogadorUltimaJogada] = useState<Jogador | null>(null);

  // Bónus especial de jogada extra (1x ou 2x)
  const [bonusAtivo, setBonusAtivo] = useState<BonusCapturaRecente | null>(null);

  // Feedback e áudio
  const [somHabilitado, setSomHabilitado] = useState(true);
  const [musicaTimbilaHabilitada, setMusicaTimbilaHabilitada] = useState<boolean>(() => soundManager.isTimbilaMusicEnabled());
  const [expressaoAtiva, setExpressaoAtiva] = useState<TipoExpressaoMocambicana | null>(null);
  const [mensagemFeedback, setMensagemFeedback] = useState<string | null>(null);
  const [, setCenarioAtivo] = useState<string>('Partida Padrão');
  const [copiadoLink, setCopiadoLink] = useState(false);

  // Sincroniza estado de som com o soundManager
  useEffect(() => {
    soundManager.setEnabled(somHabilitado);
  }, [somHabilitado]);

  const handleToggleMusicaTimbila = useCallback(() => {
    const novo = soundManager.toggleTimbilaMusic();
    setMusicaTimbilaHabilitada(novo);
  }, []);

  const handleFecharBonus = useCallback(() => {
    setBonusAtivo(null);
  }, []);

  const handleFecharExpressao = useCallback(() => {
    setExpressaoAtiva(null);
  }, []);

  const handleFecharConquista = useCallback(() => {
    setConquistaToastAtiva(null);
  }, []);

  // Modais Limpos / Gavetas
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [abaModalConfig, setAbaModalConfig] = useState<'jogo' | 'anuncios' | 'estatisticas' | 'conquistas'>('jogo');
  const [modalAnuncioIntersticialAberto, setModalAnuncioIntersticialAberto] = useState(false);
  const [modalAnuncioRecompensadoAberto, setModalAnuncioRecompensadoAberto] = useState(false);
  const [modalMoedasInsuficientesAberto, setModalMoedasInsuficientesAberto] = useState(false);
  const [saldoMoedas, setSaldoMoedas] = useState<number>(() => anunciosService.obterSaldoMoedas());

  // Subscrição em tempo real ao saldo de moedas do jogador
  useEffect(() => {
    const cancelar = anunciosService.subscreverMoedas((novoSaldo) => {
      setSaldoMoedas(novoSaldo);
    });
    return cancelar;
  }, []);
  const [modalMenuAberto, setModalMenuAberto] = useState(false);
  const [modalDoacoesAberto, setModalDoacoesAberto] = useState(false);
  const [barraRegrasAberta, setBarraRegrasAberta] = useState(false);
  const [modalChatAberto, setModalChatAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modalCriarCampeonatoAberto, setModalCriarCampeonatoAberto] = useState(false);
  const [modalConfirmarSaidaAberto, setModalConfirmarSaidaAberto] = useState(false);
  const [modalSalvarPartidaAberto, setModalSalvarPartidaAberto] = useState(false);
  const [modalCompartilharAberto, setModalCompartilharAberto] = useState(false);

  // Chave local storage para persistir partidas salvas
  const CHAVE_STORAGE_PARTIDA = 'ntxuva_partida_salva_v1';
  const [temPartidaSalva, setTemPartidaSalva] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('ntxuva_partida_salva_v1');
    } catch {
      return false;
    }
  });
  // Registo de duplo clique para sair durante a partida
  const ultimoCliqueSairPartidaRef = useRef<number>(0);

  // Hook de instalação PWA no telemóvel
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstalarPWA = () => {
    setModalCompartilharAberto(true);
  };

  // Perfil do Jogador na Comunidade Global de Ntxuva
  const [perfilJogador, setPerfilJogador] = useState<PerfilJogador>(() => comunidadeService.obterPerfilLocal());

  // Estatísticas e Conquistas do Jogador
  const [estatisticasJogador, setEstatisticasJogador] = useState<EstatisticasJogador>(() => estatisticasService.carregar());
  const [conquistaToastAtiva, setConquistaToastAtiva] = useState<Conquista | null>(null);
  const partidaFinalizadaRegistradaRef = useRef<string | null>(null);

  const dispararConquistas = useCallback((novas: Conquista[]) => {
    if (novas.length === 0) return;
    setConquistaToastAtiva(novas[0]);
    soundManager.playAchievement();
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.25 },
        colors: ['#f59e0b', '#10b981', '#fbbf24', '#38bdf8']
      });
    } catch {}
  }, []);

  // Alternância de prioridade de quem inicia a partida ao reiniciar
  const [proximoJogadorInicial, setProximoJogadorInicial] = useState<Jogador>(JOGADOR_B);

  // Banner 'START' temporário que aparece uma vez ao iniciar ou reiniciar a partida
  const [mostrarStartBanner, setMostrarStartBanner] = useState<boolean>(true);
  const startBannerTimerRef = useRef<any>(null);



  const dispararStartBanner = useCallback(() => {
    if (startBannerTimerRef.current) clearTimeout(startBannerTimerRef.current);
    setMostrarStartBanner(true);
    startBannerTimerRef.current = setTimeout(() => {
      setMostrarStartBanner(false);
    }, 1700);
  }, []);

  // Dispara o START banner na primeira vez que a partida abre
  useEffect(() => {
    if (telaAtual === 'partida') {
      dispararStartBanner();
    }
  }, [telaAtual, dispararStartBanner]);

  // Referências para execução determinística
  const animacaoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const turnCounterRef = useRef<number>(1);
  const estadoFinalPendenteRef = useRef<GameState | null>(null);
  const passosPendenteRef = useRef<PassoDistribuicao[]>([]);
  const casaInicialPendenteRef = useRef<number>(1);
  const jogadorPendenteRef = useRef<Jogador>(JOGADOR_A);

  const notificarFeedback = useCallback((msg: string) => {
    setMensagemFeedback(msg);
    setTimeout(() => {
      setMensagemFeedback((atual) => (atual === msg ? null : atual));
    }, 4500);
  }, []);

  // ──────────────────────────────────────────────────────────
  // DESLIGAMENTO AUTOMÁTICO DO SOM POR INATIVIDADE (5 MINUTOS)
  // Desliga os botões de som e música se o telefone ou aplicativo
  // ficarem inativos durante 5 minutos para evitar tocar sozinhos.
  // ──────────────────────────────────────────────────────────
  const TEMPO_INATIVIDADE_SOM_MS = 5 * 60 * 1000; // 5 minutos = 300.000 ms
  const ultimaAtividadeRef = useRef<number>(Date.now());
  const timerInatividadeRef = useRef<any>(null);
  const momentoEscondidoRef = useRef<number | null>(null);

  const desligarSomPorInatividade = useCallback(() => {
    let alterou = false;

    setSomHabilitado((somAtual) => {
      if (somAtual) {
        soundManager.setEnabled(false);
        alterou = true;
      }
      return false;
    });

    setMusicaTimbilaHabilitada((musicaAtual) => {
      if (musicaAtual) {
        soundManager.setTimbilaMusicEnabled(false);
        alterou = true;
      }
      return false;
    });

    if (alterou) {
      notificarFeedback('Som e música desligados após 5 minutos de inatividade.');
    }
  }, [notificarFeedback]);

  useEffect(() => {
    // Se ambos já estiverem desligados, limpa o temporizador
    if (!somHabilitado && !musicaTimbilaHabilitada) {
      if (timerInatividadeRef.current) {
        clearTimeout(timerInatividadeRef.current);
        timerInatividadeRef.current = null;
      }
      return;
    }

    const reiniciarTimerInatividade = () => {
      ultimaAtividadeRef.current = Date.now();
      if (timerInatividadeRef.current) {
        clearTimeout(timerInatividadeRef.current);
      }
      timerInatividadeRef.current = setTimeout(() => {
        desligarSomPorInatividade();
      }, TEMPO_INATIVIDADE_SOM_MS);
    };

    // Inicia a contagem de 5 minutos
    reiniciarTimerInatividade();

    // Eventos de interação física com o telefone / computador
    const eventosAtividade = [
      'touchstart',
      'touchmove',
      'pointerdown',
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'click',
    ];

    const manipuladorAtividade = () => {
      if (document.visibilityState === 'visible') {
        reiniciarTimerInatividade();
      }
    };

    eventosAtividade.forEach((ev) => {
      window.addEventListener(ev, manipuladorAtividade, { passive: true });
    });

    // Monitorização de quando o telefone ou aplicação fica inativo (ecrã apagado, bloqueado ou em segundo plano)
    const manipuladorVisibilidade = () => {
      if (document.visibilityState === 'hidden') {
        momentoEscondidoRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        const tempoOculto = momentoEscondidoRef.current ? Date.now() - momentoEscondidoRef.current : 0;
        const tempoTotalInativo = Date.now() - ultimaAtividadeRef.current;

        // Se o telefone ou aplicação esteve inativo por 5 minutos ou mais
        if (tempoOculto >= TEMPO_INATIVIDADE_SOM_MS || tempoTotalInativo >= TEMPO_INATIVIDADE_SOM_MS) {
          desligarSomPorInatividade();
        } else {
          reiniciarTimerInatividade();
        }
        momentoEscondidoRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', manipuladorVisibilidade);
    window.addEventListener('blur', manipuladorVisibilidade);
    window.addEventListener('focus', manipuladorVisibilidade);

    return () => {
      if (timerInatividadeRef.current) {
        clearTimeout(timerInatividadeRef.current);
        timerInatividadeRef.current = null;
      }
      eventosAtividade.forEach((ev) => {
        window.removeEventListener(ev, manipuladorAtividade);
      });
      document.removeEventListener('visibilitychange', manipuladorVisibilidade);
      window.removeEventListener('blur', manipuladorVisibilidade);
      window.removeEventListener('focus', manipuladorVisibilidade);
    };
  }, [somHabilitado, musicaTimbilaHabilitada, desligarSomPorInatividade]);

  // Efeito do som
  useEffect(() => {
    soundManager.setEnabled(somHabilitado);
  }, [somHabilitado]);

  // Limpeza de timers
  useEffect(() => {
    return () => {
      if (animacaoTimerRef.current) clearTimeout(animacaoTimerRef.current);
    };
  }, []);

  /**
   * Finalização limpa da animação
   */
  const concluirAnimacao = useCallback((
    estadoFinal: GameState, 
    passos: PassoDistribuicao[], 
    casaInicial: number, 
    jogadorQueJogou: Jogador
  ) => {
    if (animacaoTimerRef.current) {
      clearTimeout(animacaoTimerRef.current);
      animacaoTimerRef.current = null;
    }

    setAnimando(false);
    setPassoAnimacaoAtual(null);
    setPassoVisualAtivo(null);
    setCasaOrigemAnimacao(null);
    setCasaDestinoAnimacao(null);
    setCasaTerminoAnimacao(null);
    setCasaMotoMotoAnimacao(null);
    setCasasEmCapturaAnimacao([]);
    setPedrasNaMaoAnimacao(0);
    setTrajetoriaAnimacao([]);
    setGameStateAnimacao(null);

    // O estado local só é oficializado no final da distribuição e de todas as capturas!
    setGameStateLocal(estadoFinal);

    const capturas = new Set<number>();
    passos.forEach((p) => p.casasCapturadas?.forEach((c) => capturas.add(c)));
    setCasasCapturadasRecentes(Array.from(capturas));
    setCasaCapturadoraRecente(casaInicial);
    setJogadorUltimaJogada(jogadorQueJogou);

    if (estadoFinal.ultimoBonusCaptura) {
      setBonusAtivo(estadoFinal.ultimoBonusCaptura);
    }

    const novoRegistroTurno: TurnRecord = {
      id: `turn_${Date.now()}_${turnCounterRef.current}`,
      turnNumber: turnCounterRef.current,
      jogador: jogadorQueJogou,
      casaInicial: casaInicial,
      passos: passos,
      resumoCadeia: estadoFinal.ultimaCadeia,
      totalCapturas: estadoFinal.ultimaCadeia?.totalCapturas ?? 0,
      totalPedrasCapturadas: estadoFinal.ultimaCadeia?.totalPedrasCapturadas ?? 0,
      casaFinal: estadoFinal.casaEmFoco || casaInicial,
      dataHora: new Date().toLocaleTimeString(),
    };
    setHistoricoPartida((prev) => [novoRegistroTurno, ...prev]);
    turnCounterRef.current += 1;

    // Registra captura nas estatísticas do jogador
    const pedrasCapturadasJogada = estadoFinal.ultimaCadeia?.totalPedrasCapturadas ?? 
      passos.filter((p) => p.tipo === 'captura_pedras').reduce((soma, p) => soma + (p.pedrasCapturadas || 0), 0);
    const bonusTipo = estadoFinal.ultimoBonusCaptura?.tipo;

    const deveRegistrarCaptura = modoJogo !== 'ia' || jogadorQueJogou === JOGADOR_A;
    if (deveRegistrarCaptura && (pedrasCapturadasJogada > 0 || bonusTipo)) {
      const { stats: novasStats, novasConquistas } = estatisticasService.registrarJogadaECaptura(
        pedrasCapturadasJogada,
        modoJogo,
        bonusTipo
      );
      setEstatisticasJogador(novasStats);
      if (novasConquistas.length > 0) {
        dispararConquistas(novasConquistas);
      }
    }

    // Avaliar e disparar Expressões Moçambicanas em momentos épicos
    const passosRevezamento = passos.filter((p) => p.tipo === 'recolher_revezamento').length;
    if (estadoFinal.estadoDaPartida === 'FINALIZADA') {
      if (estadoFinal.tipoVitoria === 'asfixia') {
        setExpressaoAtiva('morreu_afogado');
      } else {
        setExpressaoAtiva('ganhou');
      }
    } else if (bonusTipo === '2x' || pedrasCapturadasJogada >= 12) {
      setExpressaoAtiva('axinene');
    } else if (pedrasCapturadasJogada >= 6) {
      setExpressaoAtiva('que_bela_jogada');
    } else if (bonusTipo === '1x') {
      setExpressaoAtiva('kanimambo');
    } else if (passosRevezamento >= 3) {
      setExpressaoAtiva('wau_que_bom');
    }

    estadoFinalPendenteRef.current = null;
    passosPendenteRef.current = [];
  }, [modoJogo, dispararConquistas]);


  /**
   * Executa a sequência de animação visual passo a passo em tempo real:
   * 1. Retira as pedras da casa de origem (as peças do adversário continuam intactas)
   * 2. Distribui pedra por pedra nas casas seguintes
   * 3. Na casa onde a última pedra cai, se cumprir os requisitos, captura na hora as casas da frente:
   *    retira as peças na hora daquelas casas e coloca na mão
   * 4. Distribui as peças capturadas pelas casas seguintes
   * 5. Se voltar a capturar, captura na hora e continua, até a jogada terminar
   */
  const dispararSequenciaAnimacao = useCallback((
    passos: PassoDistribuicao[],
    casaInicial: number,
    novoEstado: GameState,
    jogadorQueJogou: Jogador,
    estadoInicial?: GameState
  ) => {
    estadoFinalPendenteRef.current = novoEstado;
    passosPendenteRef.current = passos;
    casaInicialPendenteRef.current = casaInicial;
    jogadorPendenteRef.current = jogadorQueJogou;

    setPassosUltimaJogada(passos);
    setJogadorUltimaJogada(jogadorQueJogou);
    setMensagemFeedback(null);

    const vel = velocidadeRef.current;
    if (vel === 'instantanea' || passos.length === 0) {
      if (novoEstado.ultimoBonusCaptura) {
        setBonusAtivo(novoEstado.ultimoBonusCaptura);
      }
      concluirAnimacao(novoEstado, passos, casaInicial, jogadorQueJogou);
      return;
    }

    // O tabuleiro começa exatamente com o estado inicial antes da jogada!
    // As pedras do adversário continuam em suas casas e só serão retiradas na hora da captura.
    const baseSnapshot: GameState = estadoInicial
      ? {
          ...estadoInicial,
          casas: estadoInicial.casas.map((c) => ({ ...c })),
          pedrasNaMao: 0,
        }
      : {
          ...novoEstado,
          casas: novoEstado.casas.map((c) => ({ ...c })),
          pedrasNaMao: 0,
        };

    setAnimando(true);
    setCasaOrigemAnimacao(casaInicial);
    setCasaDestinoAnimacao(null);
    setCasaTerminoAnimacao(null);
    setTrajetoriaAnimacao([casaInicial]);
    setGameStateAnimacao(baseSnapshot);

    let index = 0;
    const delayMs = INTERVALOS_VELOCIDADE[vel];

    const animarPasso = () => {
      if (index >= passos.length) {
        // Encerramento da jogada:
        // A casa onde a jogada termina fica de cor vermelha por no máximo 1 segundo (1000ms)
        // antes de dar oportunidade ao adversário jogar!
        const casaFinal = passos[passos.length - 1]?.casa || novoEstado.casaEmFoco || casaInicial;
        const foiMotoMoto = passos.some((p) => p.isMotoMoto) || passos[passos.length - 1]?.isMotoMoto;
        setCasaOrigemAnimacao(null);
        setCasaDestinoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        setCasaTerminoAnimacao(casaFinal);
        if (foiMotoMoto) {
          setCasaMotoMotoAnimacao(casaFinal);
        }

        // Se o passo anterior foi 'fim_distribuicao', o destaque já iniciou; conclui suavemente.
        // O tempo de pausa quando a jogada termina é de no máximo 1 segundo (1000ms).
        const ultimoPassoFoiFim = passos[passos.length - 1]?.tipo === 'fim_distribuicao';
        const tempoPausaTermino = ultimoPassoFoiFim ? 350 : 1000;

        animacaoTimerRef.current = setTimeout(() => {
          concluirAnimacao(novoEstado, passos, casaInicial, jogadorQueJogou);
        }, tempoPausaTermino);
        return;
      }

      const passo = passos[index];
      setPassoAnimacaoAtual(index);
      setPassoVisualAtivo(passo);
      setPedrasNaMaoAnimacao(passo.pedrasNaMaoDepois);

      let stepDelay = delayMs;

      if (passo.tipo === 'retirar_origem') {
        // A casa de onde vai levar as peças fica de cor amarela
        setCasaOrigemAnimacao(passo.casa);
        setCasaDestinoAnimacao(null);
        setCasaTerminoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        soundManager.playPickup();
        // Pausa de 1 segundo extra para o jogador contar as peças na casa amarela
        stepDelay = Math.max(1000, delayMs + 900);
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
        // Quando deixa a última peça, pausa 1 segundo a mais para o jogador contar quantas peças tem
        if (passo.pedrasNaMaoDepois === 0) {
          stepDelay = Math.max(1100, delayMs + 1000);
        }
      } else if (passo.tipo === 'verificar_captura') {
        // Passo de verificação rápido
        stepDelay = Math.max(100, Math.round(delayMs * 0.45));
      } else if (passo.tipo === 'captura_pedras') {
        // MOMENTO EXATO DA CAPTURA:
        // As peças das casas adversárias à frente são retiradas NA HORA e entram na mão!
        setCasaOrigemAnimacao(null);
        setCasaDestinoAnimacao(null);
        setCasaTerminoAnimacao(null);
        if (passo.casasCapturadas && passo.casasCapturadas.length > 0) {
          setCasasEmCapturaAnimacao(passo.casasCapturadas);
        }
        soundManager.playCapture();
        // Pausa perceptível para que o jogador veja claramente as peças sendo recolhidas das casas adversárias
        stepDelay = Math.max(380, Math.round(delayMs * 1.6));
      } else if (passo.tipo === 'bonus_jogada_extra') {
        if (passo.tipoBonus) {
          setBonusAtivo({
            jogador: passo.jogadorAtivo || jogadorQueJogou,
            tipo: passo.tipoBonus,
            jogadasExtras: (passo.jogadasExtras || (passo.tipoBonus === '2x' ? 2 : 1)) as 1 | 2,
            motivo: passo.mensagem,
            casas: passo.casasCapturadas || [],
            totalPedras: passo.pedrasCapturadas || (passo.tipoBonus === '2x' ? 20 : 10),
            id: Date.now(),
          });
          soundManager.playBonus(passo.tipoBonus === '2x');
        }
        stepDelay = Math.max(500, Math.round(delayMs * 1.7));
      } else if (passo.tipo === 'recolher_revezamento') {
        // Na casa onde vai levar as peças para dar continuidade, fica de cor amarela
        setCasaOrigemAnimacao(passo.casa);
        setCasaDestinoAnimacao(null);
        setCasaTerminoAnimacao(null);
        setCasasEmCapturaAnimacao([]);
        soundManager.playPickup();
        // Pausa de mais um segundo para o jogador contar quantas peças vai levar para dar continuidade à jogada
        stepDelay = Math.max(1100, delayMs + 1000);
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
          stepDelay = Math.min(1000, Math.max(650, delayMs));
        }
      }

      setGameStateAnimacao((prevBase) => {
        const base = prevBase || baseSnapshot;
        const casasAtualizadas = base.casas.map((c) => {
          // As casas capturadas SÓ têm as suas peças retiradas (quantidade = 0) quando o passo é 'captura_pedras'!
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
      animacaoTimerRef.current = setTimeout(animarPasso, stepDelay);
    };

    animarPasso();
  }, [concluirAnimacao]);

  // Hook do Modo Online
  const online = useNtxuvaOnline(
    (passos, casaInicial, jogador, novoEstado) => {
      dispararSequenciaAnimacao(passos, casaInicial, novoEstado, jogador, gameStateAtivo);
    },
    (notificacao) => {
      notificarFeedback(notificacao);
    }
  );

  // Retorna com segurança ao Menu Principal limpando qualquer sessão online
  const voltarAoMenuPrincipal = useCallback(() => {
    online.sairDaSala();
    setModoJogo('local');
    setTelaAtual('menu');
  }, [online]);

  const handleConfirmarSaidaApp = useCallback(() => {
    setModalConfirmarSaidaAberto(false);
    if ((navigator as any)?.app?.exitApp) {
      (navigator as any).app.exitApp();
      return;
    }
    try {
      window.close();
    } catch {}
    notificarFeedback('Para sair completamente, feche esta aba ou o aplicativo no telefone.');
  }, [notificarFeedback]);

  const gameStateAtivo: GameState = useMemo(() => {
    if (animando && gameStateAnimacao) {
      return gameStateAnimacao;
    }
    if (modoJogo === 'online' && online.sala) {
      return online.sala.gameState;
    }
    return gameStateLocal;
  }, [animando, gameStateAnimacao, modoJogo, online.sala, gameStateLocal]);

  // Manipulador de saída da partida com duplo clique e salvamento
  const tentarSairDaPartida = useCallback((): boolean => {
    const agora = Date.now();
    // 1º clique: se passou mais de 2.5s desde o clique anterior
    if (agora - ultimoCliqueSairPartidaRef.current > 2500) {
      ultimoCliqueSairPartidaRef.current = agora;
      notificarFeedback('Dá dois cliques se quiser sair');
      return false; // Não sai no 1º clique
    }

    // 2º clique confirmado dentro do intervalo!
    ultimoCliqueSairPartidaRef.current = 0;

    // Verificar se a partida já iniciou (jogadas feitas ou peças movidas)
    const partidaJaIniciada =
      gameStateAtivo.estadoDaPartida === 'EM_ANDAMENTO' &&
      (historicoPartida.length > 0 ||
        turnCounterRef.current > 1 ||
        gameStateAtivo.casas.some((c) => c.quantidadeDePedras !== 2));

    if (partidaJaIniciada) {
      setModalSalvarPartidaAberto(true);
      return true;
    }

    // Se a partida não tiver iniciado ainda (0 jogadas), sai direto ao Menu Principal
    voltarAoMenuPrincipal();
    notificarFeedback('Retornou ao Menu Principal.');
    return true;
  }, [gameStateAtivo, historicoPartida, notificarFeedback, voltarAoMenuPrincipal]);

  // Salvar a partida ativa para continuar mais tarde (Opção SIM)
  const handleSalvarESairPartida = useCallback(() => {
    try {
      const dadosParaSalvar = {
        gameState: gameStateLocal,
        modoJogo: modoJogo === 'ia' ? 'ia' : 'local',
        nomeJogadorLocalA,
        nomeJogadorLocalB,
        dificuldadeIA,
        historicoPartida,
        turnCounter: turnCounterRef.current,
        proximoJogadorInicial,
        cenarioAtivo: 'Partida Padrão',
        timestamp: Date.now(),
      };
      localStorage.setItem(CHAVE_STORAGE_PARTIDA, JSON.stringify(dadosParaSalvar));
      setTemPartidaSalva(true);
    } catch (e) {
      console.error('Erro ao salvar partida:', e);
    }
    setModalSalvarPartidaAberto(false);
    voltarAoMenuPrincipal();
    notificarFeedback('Partida salva com sucesso! Podes continuar mais tarde.');
  }, [
    gameStateLocal,
    modoJogo,
    nomeJogadorLocalA,
    nomeJogadorLocalB,
    dificuldadeIA,
    historicoPartida,
    proximoJogadorInicial,
    voltarAoMenuPrincipal,
    notificarFeedback,
  ]);

  // Sair da partida sem salvar (Opção NÃO)
  const handleSairSemSalvarPartida = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE_STORAGE_PARTIDA);
    } catch {}
    setTemPartidaSalva(false);
    setModalSalvarPartidaAberto(false);
    setGameStateLocal(inicializarJogo(proximoJogadorInicial));
    setHistoricoPartida([]);
    turnCounterRef.current = 1;
    voltarAoMenuPrincipal();
    notificarFeedback('Retornou ao Menu Principal.');
  }, [proximoJogadorInicial, voltarAoMenuPrincipal, notificarFeedback]);

  // Continuar partida salva anteriormente
  const handleContinuarPartidaSalva = useCallback(() => {
    try {
      const json = localStorage.getItem(CHAVE_STORAGE_PARTIDA);
      if (json) {
        const dados = JSON.parse(json);
        if (dados.gameState) setGameStateLocal(dados.gameState);
        if (dados.modoJogo) setModoJogo(dados.modoJogo);
        if (dados.nomeJogadorLocalA) setNomeJogadorLocalA(dados.nomeJogadorLocalA);
        if (dados.nomeJogadorLocalB) setNomeJogadorLocalB(dados.nomeJogadorLocalB);
        if (dados.dificuldadeIA) setDificuldadeIA(dados.dificuldadeIA);
        if (Array.isArray(dados.historicoPartida)) setHistoricoPartida(dados.historicoPartida);
        if (typeof dados.turnCounter === 'number') turnCounterRef.current = dados.turnCounter;
        if (dados.proximoJogadorInicial) setProximoJogadorInicial(dados.proximoJogadorInicial);
        notificarFeedback('Partida salva restaurada!');
      }
    } catch (err) {
      console.error('Erro ao restaurar partida:', err);
    }
    setTelaAtual('partida');
  }, [notificarFeedback]);

  // Hook que unifica o botão físico/virtual de Voltar/Sair do telefone com as setas na tela
  const { voltarComSetaOuBotao } = useNavegacaoVoltarTelefone({
    telaAtual,
    modalPerfilAberto,
    modalCriarCampeonatoAberto,
    modalChatAberto,
    modalConfigAberto,
    modalMenuAberto,
    modalDoacoesAberto,
    modalCompartilharAberto,
    barraRegrasAberta,
    modalConfirmarSaidaAberto,
    modalSalvarPartidaAberto,
    setModalPerfilAberto,
    setModalCriarCampeonatoAberto,
    setModalChatAberto,
    setModalConfigAberto,
    setModalMenuAberto,
    setModalDoacoesAberto,
    setModalCompartilharAberto,
    setBarraRegrasAberta,
    setModalConfirmarSaidaAberto,
    setModalSalvarPartidaAberto,
    onTentarSairPartida: tentarSairDaPartida,
    voltarAoMenuPrincipal,
    notificarFeedback,
  });


  // Efeito de celebração de vitória e registro de estatísticas do jogador
  useEffect(() => {
    if (gameStateAtivo.estadoDaPartida === 'FINALIZADA' && gameStateAtivo.vencedor !== null) {
      soundManager.playVictory();
      setExpressaoAtiva(gameStateAtivo.tipoVitoria === 'asfixia' ? 'morreu_afogado' : 'ganhou');
      try {
        localStorage.removeItem(CHAVE_STORAGE_PARTIDA);
        setTemPartidaSalva(false);
      } catch {}
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#f43f5e']
        });
      } catch {
        // Ignorar
      }

      // Registro seguro: evita registrar a mesma partida mais de uma vez
      const chaveFinalizacao = `${modoJogo}_${gameStateAtivo.vencedor}_${gameStateAtivo.tipoVitoria || 'normal'}`;
      if (partidaFinalizadaRegistradaRef.current !== chaveFinalizacao) {
        partidaFinalizadaRegistradaRef.current = chaveFinalizacao;

        if (modoJogo === 'local') {
          const { stats, novasConquistas } = estatisticasService.registrarVitoria('local', gameStateAtivo.tipoVitoria);
          setEstatisticasJogador(stats);
          if (novasConquistas.length > 0) dispararConquistas(novasConquistas);
        } else if (modoJogo === 'ia') {
          if (gameStateAtivo.vencedor === JOGADOR_A) {
            const { stats, novasConquistas } = estatisticasService.registrarVitoria('ia', gameStateAtivo.tipoVitoria, dificuldadeIA);
            setEstatisticasJogador(stats);
            if (novasConquistas.length > 0) dispararConquistas(novasConquistas);
          } else {
            const { stats, novasConquistas } = estatisticasService.registrarDerrota('ia');
            setEstatisticasJogador(stats);
            if (novasConquistas.length > 0) dispararConquistas(novasConquistas);
          }
        } else if (modoJogo === 'online') {
          if (online.seuPapel && gameStateAtivo.vencedor === online.seuPapel) {
            const { stats, novasConquistas } = estatisticasService.registrarVitoria('online', gameStateAtivo.tipoVitoria);
            setEstatisticasJogador(stats);
            if (novasConquistas.length > 0) dispararConquistas(novasConquistas);
            comunidadeService.atualizarEstatisticasPartida(perfilJogador.id, true).catch(() => {});
          } else if (online.seuPapel && gameStateAtivo.vencedor !== null) {
            const { stats, novasConquistas } = estatisticasService.registrarDerrota('online');
            setEstatisticasJogador(stats);
            if (novasConquistas.length > 0) dispararConquistas(novasConquistas);
            comunidadeService.atualizarEstatisticasPartida(perfilJogador.id, false).catch(() => {});
          }
        }
      }
    }
  }, [gameStateAtivo.estadoDaPartida, gameStateAtivo.vencedor, gameStateAtivo.tipoVitoria, modoJogo, dificuldadeIA, online.seuPapel, dispararConquistas]);

  const validarCasaParaJogada = useCallback((numeroCasa: number) => {
    if (modoJogo === 'ia') {
      if (gameStateLocal.jogadorAtual !== JOGADOR_A) {
        return { valido: false, motivo: 'Aguarde a jogada da IA.' };
      }
      return podeIniciarJogada(gameStateLocal, numeroCasa);
    }
    if (modoJogo === 'online') {
      if (!online.sala || online.sala.status !== 'em_andamento') {
        return { valido: false, motivo: 'Partida online não iniciada ou finalizada.' };
      }
      if (online.sala.gameState.jogadorAtual !== online.seuPapel) {
        return { valido: false, motivo: `Aguarde sua vez. É a vez do ${online.sala.gameState.jogadorAtual}.` };
      }
      return podeIniciarJogada(online.sala.gameState, numeroCasa);
    }
    return podeIniciarJogada(gameStateLocal, numeroCasa);
  }, [modoJogo, online.sala, online.seuPapel, gameStateLocal]);

  const handleExecutarJogada = async (numeroCasa: number) => {
    if (animando) return;

    if (modoJogo === 'online') {
      if (!online.sala) return;
      if (online.sala.status !== 'em_andamento') {
        notificarFeedback('Aguardando a entrada do segundo jogador na sala.');
        return;
      }
      if (online.sala.gameState.jogadorAtual !== online.seuPapel) {
        notificarFeedback(`Aguarde a sua vez.`);
        return;
      }

      const validacaoCliente = podeIniciarJogada(online.sala.gameState, numeroCasa);
      if (!validacaoCliente.valido) {
        notificarFeedback(validacaoCliente.motivo || 'Casa inválida.');
        return;
      }

      await online.executarJogadaOnline(numeroCasa);
      return;
    }

    // Modo Local & Modo IA
    const validacao = podeIniciarJogada(gameStateLocal, numeroCasa);
    if (!validacao.valido) {
      notificarFeedback(validacao.motivo || 'Casa inválida.');
      return;
    }

    try {
      const estadoAntes = gameStateLocal;
      const { novoEstado, passos } = executarDistribuicao(estadoAntes, numeroCasa, true);
      const jogadorQueJogou = estadoAntes.jogadorAtual;
      // Não alteramos gameStateLocal antes da animação!
      // A animação executará passo a passo a partir de estadoAntes e atualizará o estado final quando todas as distribuições e capturas terminarem.
      dispararSequenciaAnimacao(passos, numeroCasa, novoEstado, jogadorQueJogou, estadoAntes);
    } catch (err: any) {
      notificarFeedback(err?.message || 'Erro ao processar movimento.');
    }
  };

  // Efeito da IA: executa automaticamente o movimento quando for a vez do Jogador B no modo IA
  useEffect(() => {
    if (
      modoJogo === 'ia' &&
      telaAtual === 'partida' &&
      gameStateAtivo.jogadorAtual === JOGADOR_B &&
      gameStateAtivo.estadoDaPartida === 'EM_ANDAMENTO' &&
      !animando &&
      !mostrarStartBanner
    ) {
      setIaPensando(true);
      // IA Mestre Kota simula com um pouco mais de presença reflexiva (800ms)
      const tempoPensamento = dificuldadeIA === 'mestre' ? 800 : 600;

      const timer = setTimeout(() => {
        setIaPensando(false);
        const decisao = escolherMelhorJogadaIA(gameStateLocal, JOGADOR_B, dificuldadeIA);
        if (decisao) {
          handleExecutarJogada(decisao.casaEscolhida);
        }
      }, tempoPensamento);

      return () => {
        clearTimeout(timer);
        setIaPensando(false);
      };
    }
  }, [
    modoJogo,
    telaAtual,
    gameStateAtivo.jogadorAtual,
    gameStateAtivo.estadoDaPartida,
    animando,
    mostrarStartBanner,
    gameStateLocal,
    dificuldadeIA,
  ]);

  const handleReiniciarPartida = async () => {
    if (animacaoTimerRef.current) clearTimeout(animacaoTimerRef.current);
    setAnimando(false);
    setPassoAnimacaoAtual(null);
    setPassoVisualAtivo(null);
    setCasaOrigemAnimacao(null);
    setCasaDestinoAnimacao(null);
    setCasaTerminoAnimacao(null);
    setCasaMotoMotoAnimacao(null);
    setCasasEmCapturaAnimacao([]);
    setPedrasNaMaoAnimacao(0);
    setTrajetoriaAnimacao([]);
    setPassosUltimaJogada([]);
    setJogadorUltimaJogada(null);
    setCasasCapturadasRecentes([]);
    setCasaCapturadoraRecente(null);
    setMensagemFeedback(null);
    setIaPensando(false);
    turnCounterRef.current = 1;
    setHistoricoPartida([]);

    try {
      localStorage.removeItem(CHAVE_STORAGE_PARTIDA);
      setTemPartidaSalva(false);
    } catch {}

    // Alterna a prioridade de quem começa:
    const jogadorParaIniciar = proximoJogadorInicial;
    const proximoParaAposEste = alternarJogador(jogadorParaIniciar);
    setProximoJogadorInicial(proximoParaAposEste);

    if (modoJogo === 'online' && online.sala) {
      await online.reiniciarPartidaOnline();
      notificarFeedback('Partida reiniciada.');
      dispararStartBanner();
      return;
    }

    // Cobrança oficial de 25 moedas por partida local / IA (Online não é cobrado)
    const consumo = anunciosService.consumirMoedasParaPartida(modoJogo);
    if (!consumo.sucesso) {
      setModalMoedasInsuficientesAberto(true);
      notificarFeedback(consumo.motivo || 'Moedas insuficientes. Cada partida consome 25 moedas.');
      return;
    }
    setSaldoMoedas(consumo.novoSaldo);

    setGameStateLocal(inicializarJogo(jogadorParaIniciar));
    setCenarioAtivo('Partida Padrão');
    dispararStartBanner();
    notificarFeedback(`Partida reiniciada (-25 moedas). Saldo: ${consumo.novoSaldo}`);
  };

  const iniciarJogoLocal = () => {
    if (!anunciosService.podeIniciarPartida('local').permitido) {
      setModalMoedasInsuficientesAberto(true);
      return;
    }
    online.sairDaSala();
    setModoJogo('local');
    setTelaAtual('preparacao');
  };

  const iniciarJogoOnline = () => {
    // Partidas online não consomem moedas!
    online.sairDaSala();
    setModoJogo('online');
    setTelaAtual('jogar_online');
  };

  const iniciarJogoIA = () => {
    if (!anunciosService.podeIniciarPartida('ia').permitido) {
      setModalMoedasInsuficientesAberto(true);
      return;
    }
    online.sairDaSala();
    setModoJogo('ia');
    setTelaAtual('preparacao');
  };

  const handleCopiarCodigoSala = () => {
    if (!online.sala) return;
    try {
      navigator.clipboard.writeText(online.sala.codigo);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2000);
    } catch {
      // Ignorar
    }
  };

  const handleSalvarPerfil = useCallback(async (novoPerfil: PerfilJogador) => {
    setPerfilJogador(novoPerfil);
    await comunidadeService.salvarPerfil(novoPerfil);
    notificarFeedback('Perfil atualizado com sucesso!');
  }, [notificarFeedback]);

  const handleEntrarNaSalaPeloChat = useCallback(async (codigo: string) => {
    const ok = await online.entrarPartida(codigo, perfilJogador.nome);
    if (ok) {
      setModoJogo('online');
      setTelaAtual('partida');
      setModalChatAberto(false);
      notificarFeedback(`Entrou na partida da sala ${codigo}!`);
    } else {
      notificarFeedback('Não foi possível entrar na sala. Verifique o código.');
    }
  }, [online, perfilJogador.nome, notificarFeedback]);

  const handleCriarSalaPeloChat = useCallback(async (_codigoPredefinido?: string, tempoTurno?: number | null) => {
    const ok = await online.criarPartida(perfilJogador.nome, tempoTurno ?? 45);
    if (ok) {
      setModoJogo('online');
      setTelaAtual('partida');
      setModalChatAberto(false);
      notificarFeedback('Sala criada! Convite publicado na comunidade.');
    }
  }, [online, perfilJogador.nome, notificarFeedback]);

  const handlePublicarSalaAtualNoChat = useCallback(async () => {
    if (!online.sala) return;
    try {
      await comunidadeService.publicarConvitePartida(
        perfilJogador,
        online.sala.codigo,
        online.sala.tempoTurnoSegundos
      );
      notificarFeedback(`Sala ${online.sala.codigo} publicada no Chat Global!`);
    } catch {
      notificarFeedback('Erro ao publicar sala no chat.');
    }
  }, [online.sala, perfilJogador, notificarFeedback]);

  const handleCriarCampeonato = useCallback(async (
    titulo: string,
    descricao: string,
    maxParticipantes: number,
    tempoTurno?: number | null
  ) => {
    try {
      await comunidadeService.criarCampeonato(
        perfilJogador,
        titulo,
        descricao,
        maxParticipantes,
        tempoTurno
      );
      setModalCriarCampeonatoAberto(false);
      setModalChatAberto(true);
      notificarFeedback('Campeonato criado e divulgado no Chat Global!');
    } catch {
      notificarFeedback('Erro ao criar campeonato.');
    }
  }, [perfilJogador, notificarFeedback]);

  // Identificação e cálculo de pedras
  const isVezJogador = useMemo(() => {
    if (gameStateAtivo.estadoDaPartida !== 'EM_ANDAMENTO') return false;
    if (modoJogo === 'online') {
      if (!online.sala || online.sala.status !== 'em_andamento') return false;
      return online.sala.gameState.jogadorAtual === online.seuPapel;
    }
    return gameStateAtivo.jogadorAtual === JOGADOR_A;
  }, [gameStateAtivo.estadoDaPartida, gameStateAtivo.jogadorAtual, modoJogo, online.sala, online.seuPapel]);

  const isVezAdversario = useMemo(() => {
    if (gameStateAtivo.estadoDaPartida !== 'EM_ANDAMENTO') return false;
    if (modoJogo === 'online') {
      if (!online.sala || online.sala.status !== 'em_andamento') return false;
      return online.sala.gameState.jogadorAtual !== online.seuPapel;
    }
    return gameStateAtivo.jogadorAtual === JOGADOR_B;
  }, [gameStateAtivo.estadoDaPartida, gameStateAtivo.jogadorAtual, modoJogo, online.sala, online.seuPapel]);

  const totalPedrasAdversario = useMemo(() => {
    const casasAdversario = (modoJogo === 'online' && online.seuPapel === JOGADOR_B)
      ? gameStateAtivo.casas.filter((c) => c.numero >= 1 && c.numero <= 12)
      : gameStateAtivo.casas.filter((c) => c.numero >= 13 && c.numero <= 24);
    return casasAdversario.reduce((acc, c) => acc + c.quantidadeDePedras, 0);
  }, [gameStateAtivo.casas, modoJogo, online.seuPapel]);

  const totalPedrasJogador = useMemo(() => {
    const casasJogador = (modoJogo === 'online' && online.seuPapel === JOGADOR_B)
      ? gameStateAtivo.casas.filter((c) => c.numero >= 13 && c.numero <= 24)
      : gameStateAtivo.casas.filter((c) => c.numero >= 1 && c.numero <= 12);
    return casasJogador.reduce((acc, c) => acc + c.quantidadeDePedras, 0);
  }, [gameStateAtivo.casas, modoJogo, online.seuPapel]);

  const nomeExibicaoAdversario = useMemo(() => {
    if (modoJogo === 'ia') {
      return nomeJogadorLocalB || 'IA (COMPUTADOR)';
    }
    if (modoJogo === 'online' && online.sala) {
      if (online.seuPapel === JOGADOR_B) {
        return online.sala.jogadorA?.nome || 'ADVERSÁRIO';
      }
      return online.sala.jogadorB?.nome || 'ADVERSÁRIO';
    }
    return nomeJogadorLocalB || 'JOGADOR 2';
  }, [modoJogo, online.sala, online.seuPapel, nomeJogadorLocalB]);

  const nomeExibicaoJogador = useMemo(() => {
    if (modoJogo === 'ia') {
      return nomeJogadorLocalA || 'VOCÊ (JOGADOR 1)';
    }
    if (modoJogo === 'online' && online.sala) {
      if (online.seuPapel === JOGADOR_B) {
        return online.sala.jogadorB?.nome || 'JOGADOR';
      }
      return online.sala.jogadorA?.nome || 'JOGADOR';
    }
    return nomeJogadorLocalA || 'JOGADOR 1';
  }, [modoJogo, online.sala, online.seuPapel, nomeJogadorLocalA]);

  const nomeExibicaoVencedor = useMemo(() => {
    if (!gameStateAtivo.vencedor) return '';
    const isJogadorA = gameStateAtivo.vencedor === JOGADOR_A;
    if (modoJogo === 'ia') {
      return isJogadorA ? (nomeJogadorLocalA || 'JOGADOR 1') : (nomeJogadorLocalB || 'IA (COMPUTADOR)');
    }
    if (modoJogo === 'online' && online.sala) {
      if (isJogadorA) {
        return `${online.sala.jogadorA?.nome || 'JOGADOR 1'}`;
      } else {
        return `${online.sala.jogadorB?.nome || 'JOGADOR 2'}`;
      }
    }
    return isJogadorA ? (nomeJogadorLocalA || 'JOGADOR 1') : (nomeJogadorLocalB || 'JOGADOR 2');
  }, [gameStateAtivo.vencedor, modoJogo, online.sala, nomeJogadorLocalA, nomeJogadorLocalB]);

  const isTabuleiroDesabilitado = useMemo(() => {
    if (animando) return true;
    if (mostrarStartBanner) return true;
    if (gameStateAtivo.estadoDaPartida !== 'EM_ANDAMENTO') return true;
    if (modoJogo === 'ia') {
      return gameStateAtivo.jogadorAtual !== JOGADOR_A;
    }
    if (modoJogo === 'online') {
      if (!online.sala || online.sala.status !== 'em_andamento') return true;
      if (online.sala.gameState.jogadorAtual !== online.seuPapel) return true;
    }
    return false;
  }, [animando, mostrarStartBanner, gameStateAtivo.estadoDaPartida, gameStateAtivo.jogadorAtual, modoJogo, online.sala, online.seuPapel]);

  return (
    <div className={`min-h-[100dvh] ${telaAtual === 'partida' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-[#120a06] text-stone-100 flex flex-col justify-between selection:bg-amber-600 selection:text-white`}>
      {/* ──────────────────────────────────────────────────────────
          1. CABEÇALHO DO TOPO
             - Canto Superior Esquerdo: Logótipo NTXUVA no topo em todas as telas (inclusive na partida)
             - Canto Superior Direito: Símbolo de telefone SOMENTE no Menu Principal e desaparece após instalado
          ────────────────────────────────────────────────────────── */}
      <header className={`w-full bg-[#1c1008] border-b border-[#3d2315] px-2.5 sm:px-6 ${telaAtual === 'partida' ? 'py-1 shrink-0' : 'py-1.5 sm:py-2'} shadow-xs z-30 animate-fadeIn`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between min-h-[26px]">
          {/* Canto Superior Esquerdo: Logótipo NTXUVA */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={voltarComSetaOuBotao}
              className="text-xs sm:text-base font-black tracking-wider text-amber-200 font-mono flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:text-amber-100 transition-colors py-0.5"
              title="Menu Principal"
            >
              <img 
                src="/ntxuva-icon.png" 
                alt="Ícone Oficial NTXUVA" 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg border border-amber-500/60 shadow-xs shrink-0 object-cover" 
              />
              <span>NTXUVA</span>
            </button>
          </div>

          {/* Canto Superior Direito: Botão de velocidade na partida, ou Saldo de moedas e Instalar no menu principal */}
          <div className="flex items-center gap-1.5">
            {telaAtual !== 'partida' && (
              <button
                type="button"
                onClick={() => setModalAnuncioRecompensadoAberto(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#29170c] border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-white font-mono font-bold text-[10px] sm:text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Saldo de moedas (Cada partida consome 25 moedas). Toque para ganhar +250 no Bónus de Vídeo (Máx. 1000)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{saldoMoedas}</span>
                <span className="text-[9px] text-amber-400/60 font-normal hidden xs:inline">/ 1000</span>
              </button>
            )}

            {telaAtual === 'partida' && (
              <button
                type="button"
                onClick={alternarVelocidade}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#29170c] border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-white font-mono font-bold text-[10px] sm:text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Alterar velocidade das jogadas (Normal / Rápida / Instantânea / Lenta)"
              >
                <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                {velocidade === 'normal' && <span>Normal</span>}
                {velocidade === 'rapida' && <span>Rápida</span>}
                {velocidade === 'instantanea' && <span>Instantânea</span>}
                {velocidade === 'lenta' && <span>Lenta</span>}
              </button>
            )}
            {telaAtual === 'menu' && !isInstalled && (
              <button
                type="button"
                onClick={handleInstalarPWA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/25 to-teal-600/25 hover:from-emerald-600/35 hover:to-teal-600/35 border border-emerald-500/70 text-xs font-mono font-bold text-emerald-300 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 animate-fadeIn"
                title="Instalar no Telemóvel (PWA)"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instalar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. ECRÃ PRINCIPAL
          ────────────────────────────────────────────────────────── */}
      <main className={`flex-1 w-full mx-auto flex flex-col items-center ${telaAtual === 'partida' ? 'h-full p-1 xs:p-1.5 sm:p-2 overflow-hidden justify-between' : telaAtual === 'menu' ? 'justify-center p-1.5 sm:p-3 space-y-2' : 'justify-center p-2 sm:p-5 space-y-3 sm:space-y-4'} max-w-4xl`}>

        {/* FEEDBACK INLINE DISCRETO */}
        {mensagemFeedback && (
          <div className="px-4 py-2.5 rounded-2xl bg-[#24150b] border border-amber-500/70 text-xs sm:text-sm font-bold text-amber-200 flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{mensagemFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setMensagemFeedback(null)}
              className="text-stone-400 hover:text-white p-0.5 text-xs font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TELA 1: MENU PRINCIPAL ANTES DA PARTIDA */}
        {telaAtual === 'menu' && (
          <div className="space-y-2 sm:space-y-3 w-full flex flex-col items-center">
            {/* Card para retomar partida online anterior se existir sessão salva */}
            {online.sessaoSalva && modoJogo !== 'online' && (
              <CardRetomarPartidaOnline
                sessao={online.sessaoSalva}
                onRetomar={async () => {
                  setModoJogo('online');
                  setTelaAtual('partida');
                  await online.tentarReconexao();
                }}
                onDescartar={() => {
                  online.sairDaSala();
                  notificarFeedback('Sessão online anterior descartada.');
                }}
              />
            )}

            <MenuInicial
              onJogarLocal={iniciarJogoLocal}
              onJogarOnline={iniciarJogoOnline}
              onJogarIA={iniciarJogoIA}
              onJogarDesafios={() => {
                online.sairDaSala();
                setTelaAtual('desafios');
              }}
              onJogarTutorial={() => {
                online.sairDaSala();
                setTelaAtual('tutorial');
              }}
              onAbrirRegras={() => setModalMenuAberto(true)}
              onAbrirConfiguracoes={() => {
                setAbaModalConfig('jogo');
                setModalConfigAberto(true);
              }}
              onAbrirEstatisticas={() => {
                setAbaModalConfig('estatisticas');
                setModalConfigAberto(true);
              }}
              onAbrirDoacoesCriador={() => setModalDoacoesAberto(true)}
              onAbrirChatComunidade={() => setModalChatAberto(true)}
              onAbrirCompartilharEInstalar={handleInstalarPWA}
              onAbrirAnuncioRecompensado={() => setModalAnuncioRecompensadoAberto(true)}
              isInstalled={isInstalled}
              temPartidaEmAndamento={temPartidaSalva || (gameStateLocal.estadoDaPartida === 'EM_ANDAMENTO' && (historicoPartida.length > 0 || gameStateLocal.casas.some(c => c.quantidadeDePedras !== 2)))}
              onContinuarPartida={temPartidaSalva ? handleContinuarPartidaSalva : () => setTelaAtual('partida')}
              saldoMoedas={saldoMoedas}
            />
          </div>
        )}

        {/* TELA 2: PREPARAÇÃO DA PARTIDA */}
        {telaAtual === 'preparacao' && (
          <PreparacaoPartida
            modoJogo={modoJogo === 'ia' ? 'ia' : 'local'}
            nomeJogadorA={nomeJogadorLocalA}
            nomeJogadorB={nomeJogadorLocalB}
            dificuldadeIA={dificuldadeIA}
            saldoMoedas={saldoMoedas}
            onConfirmar={(nomeA, nomeB, dif) => {
              const modo = modoJogo === 'ia' ? 'ia' : 'local';
              const consumo = anunciosService.consumirMoedasParaPartida(modo);
              if (!consumo.sucesso) {
                setModalMoedasInsuficientesAberto(true);
                notificarFeedback(consumo.motivo || 'Moedas insuficientes. Cada partida consome 25 moedas.');
                return;
              }
              setSaldoMoedas(consumo.novoSaldo);

              online.sairDaSala();
              setNomeJogadorLocalA(nomeA);
              setNomeJogadorLocalB(nomeB);
              if (dif) setDificuldadeIA(dif);
              setGameStateLocal(inicializarJogo(JOGADOR_B));
              turnCounterRef.current = 1;
              setHistoricoPartida([]);
              setCenarioAtivo('Partida Padrão');
              setTelaAtual('partida');
              dispararStartBanner();
              notificarFeedback(`Partida iniciada (-25 moedas). Saldo: ${consumo.novoSaldo}`);
            }}
            onVoltar={voltarComSetaOuBotao}
          />
        )}

        {/* TELA 3: JOGAR ONLINE LOBBY / PREPARAÇÃO ONLINE */}
        {telaAtual === 'jogar_online' && (
          <div className="space-y-4 w-full flex flex-col items-center">
            {/* Card para retomar partida online anterior se houver sessão */}
            {online.sessaoSalva && modoJogo !== 'online' && (
              <CardRetomarPartidaOnline
                sessao={online.sessaoSalva}
                onRetomar={async () => {
                  setModoJogo('online');
                  setTelaAtual('partida');
                  await online.tentarReconexao();
                }}
                onDescartar={() => {
                  online.sairDaSala();
                  notificarFeedback('Sessão online anterior descartada.');
                }}
              />
            )}

            <MenuJogarOnline
              onVoltarMenu={voltarComSetaOuBotao}
              onCriarPartida={async (nome, tempoTurno) => {
                const ok = await online.criarPartida(nome, tempoTurno);
                if (ok) {
                  setModoJogo('online');
                  setTelaAtual('partida');
                }
                return ok;
              }}
              onEntrarPartida={async (codigo, nome) => {
                const ok = await online.entrarPartida(codigo, nome);
                if (ok) {
                  setModoJogo('online');
                  setTelaAtual('partida');
                }
                return ok;
              }}
              carregando={online.carregando}
              erro={online.erro}
              onLimparErro={online.limparErro}
              onAbrirChatComunidade={() => setModalChatAberto(true)}
              nomePadrao={perfilJogador.nome}
            />
          </div>
        )}

        {/* TELA 5: MODO DESAFIOS / PUZZLES ("TÁTICAS DE NTXUVA") */}
        {telaAtual === 'desafios' && (
          <ModoDesafios onVoltarMenu={voltarComSetaOuBotao} />
        )}

        {/* TELA 6: TUTORIAL INTERATIVO (FLUXO CASA A CASA, CAPTURA E MOVIMENTO CONTÍNUO) */}
        {telaAtual === 'tutorial' && (
          <TutorialInterativo
            onVoltarMenu={voltarComSetaOuBotao}
            onIniciarPartidaReal={() => {
              iniciarJogoLocal();
            }}
          />
        )}

        {/* TELA 4: TELA DO JOGO (PARTIDA ATIVA) */}
        {telaAtual === 'partida' && (
          <>
            {/* BANNER DE RECONEXÃO ONLINE (QUANDO A LIGAÇÃO OSCILAR OU CAIR) */}
            {modoJogo === 'online' && (
              <BannerReconexaoOnline
                conectado={online.conectado}
                reconectando={online.reconectando}
                tentativasReconexao={online.tentativasReconexao}
                onTentarReconectar={online.tentarReconexao}
                onDesistirOuSair={voltarComSetaOuBotao}
              />
            )}

            {/* ENCERRAMENTO DE PARTIDA (VITÓRIA) */}
            {gameStateAtivo.estadoDaPartida === 'FINALIZADA' && (
              <div className="w-full flex items-center justify-center animate-fadeIn">
                <div className="w-full max-w-xl p-3.5 rounded-2xl bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-2 border-amber-400 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
                    <div>
                      <div className="text-sm font-black text-amber-100 font-mono">
                        VITÓRIA DO {nomeExibicaoVencedor.toUpperCase()}!
                      </div>
                      <div className="text-[11px] text-amber-200">
                        {gameStateAtivo.motivoVitoria || 'Todas as pedras do adversário foram capturadas.'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReiniciarPartida}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all shadow-md cursor-pointer shrink-0"
                  >
                    Nova Partida
                  </button>
                </div>
              </div>
            )}

            {/* CARD COMPACTO: Aguardando adversário na sala online */}
            {modoJogo === 'online' && online.sala && online.sala.status === 'aguardando_adversario' && (
              <div className="p-3.5 rounded-2xl bg-[#24130a] border-2 border-amber-500/70 flex flex-col gap-2.5 text-xs font-mono shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-amber-200 font-bold">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                    <span>Aguardando o segundo jogador entrar...</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-stone-300">Código:</span>
                    <strong className="text-amber-300 font-black text-sm bg-stone-950 px-2.5 py-1 rounded-lg border border-amber-500/50 tracking-wider">
                      {online.sala.codigo}
                    </strong>
                    <button
                      type="button"
                      onClick={handleCopiarCodigoSala}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      {copiadoLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiadoLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePublicarSalaAtualNoChat}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95 border border-emerald-300"
                      title="Publicar sala no Chat Global"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat da Comunidade</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        voltarComSetaOuBotao();
                        notificarFeedback('Saiu da sala online.');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/80 text-rose-200 hover:text-white font-black text-xs transition-colors cursor-pointer"
                      title="Cancelar e sair para o menu"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da Sala</span>
                    </button>
                  </div>
                </div>

                {online.sala.tempoTurnoSegundos && (
                  <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5 pt-1 border-t border-[#3b2010]">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Relógio de Turno configurado: <strong>{online.sala.tempoTurnoSegundos}s</strong> por jogada para evitar inatividade.</span>
                  </div>
                )}
              </div>
            )}

            {/* BARRA: Partida Online em Andamento com Relógio e Chat de Reações Rápidas */}
            {modoJogo === 'online' && online.sala && online.sala.status === 'em_andamento' && (
              <div className="w-full flex flex-wrap items-center justify-between px-3.5 py-2 rounded-2xl bg-[#1d1007] border border-amber-600/40 text-xs font-mono gap-2 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold flex-wrap">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sala: {online.sala.codigo}</span>
                  <span className="text-stone-500">·</span>
                  <span className="text-stone-300">
                    Você: <strong className={online.seuPapel === 'Jogador A' ? 'text-emerald-300' : 'text-cyan-300'}>{online.seuPapel}</strong>
                  </span>
                  {online.conectado ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Conectado
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                      <RefreshCw className="w-3 h-3 animate-spin" /> A Reconectar...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Relógio de Turno Opcional (Temporizador) */}
                  {online.sala.tempoTurnoSegundos && online.sala.turnoIniciadoEm && (
                    <RelogioTurnoOnline
                      tempoTurnoSegundos={online.sala.tempoTurnoSegundos}
                      turnoIniciadoEm={online.sala.turnoIniciadoEm}
                      jogadorAtual={online.sala.gameState.jogadorAtual}
                      seuPapel={online.seuPapel}
                      nomeJogadorAtual={
                        online.sala.gameState.jogadorAtual === 'Jogador A'
                          ? online.sala.jogadorA.nome
                          : (online.sala.jogadorB?.nome || 'Adversário')
                      }
                      isMinhaVez={isVezJogador}
                    />
                  )}

                  {/* Chat de Reações Rápidas e Emojis */}
                  <ChatReacoesOnline
                    seuPapel={online.seuPapel}
                    ultimaReacao={online.ultimaReacao}
                    onEnviarReacao={online.enviarReacao}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      online.desistirOnline();
                      voltarComSetaOuBotao();
                      notificarFeedback('Você saiu da partida online.');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-rose-100 hover:underline cursor-pointer ml-1"
                    title="Desistir e abandonar sala"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Abandonar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Banner de Celebração de Bónus de Jogada Extra (1x ou 2x) */}
            <BannerBonusJogadaExtra
              bonus={bonusAtivo}
              onFechar={handleFecharBonus}
            />

            {/* ──────────────────────────────────────────────────────────
                PARTE SUPERIOR: ADVERSÁRIO (Ex: 1)
                🔴 ADVERSÁRIO
                   avatar
                   Número de pedras restantes
                   Indicador de vez
                ────────────────────────────────────────────────────────── */}
            {/* ARENA DE JOGO HARMONIOSA E INTEGRADA AO TELEFONE COM ESPAÇAMENTOS IGUAIS E TABULEIRO CENTRALIZADO */}
            <div className="w-full max-w-xl mx-auto flex-1 h-full flex flex-col justify-evenly items-center my-auto min-h-0">
              {/* ──────────────────────────────────────────────────────────
                  PARTE SUPERIOR: ADVERSÁRIO (Ex: 1)
                  ────────────────────────────────────────────────────────── */}
              <div className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-2xl transition-all border shrink-0 ${
                isVezAdversario 
                  ? 'bg-[#241009] border-rose-500/90 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/30' 
                  : 'bg-[#1a0e07] border-[#382012]'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Avatar do Adversário */}
                  <div className="relative">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all ${
                      isVezAdversario 
                        ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-500/30' 
                        : 'bg-[#26150b] border-[#4d2d18]'
                    }`}>
                      {modoJogo === 'ia' ? (
                        <Bot className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isVezAdversario ? 'text-rose-300' : 'text-stone-400'}`} />
                      ) : (
                        <User className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isVezAdversario ? 'text-rose-300' : 'text-stone-400'}`} />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-xs select-none">
                      🔴
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black tracking-wider text-rose-200 uppercase font-mono leading-tight">
                        {nomeExibicaoAdversario}
                      </span>
                      {modoJogo === 'ia' && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black border font-mono flex items-center gap-0.5 ${
                          dificuldadeIA === 'mestre'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-400/60'
                            : dificuldadeIA === 'iniciante'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-400/60'
                        }`}>
                          {dificuldadeIA === 'mestre' && <span>👑 Kota</span>}
                          {dificuldadeIA === 'iniciante' && <span>🟢 Fácil</span>}
                          {dificuldadeIA === 'medio' && <span>🟡 Médio</span>}
                        </span>
                      )}
                      {modoJogo === 'online' && online.sala && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono ${
                          (online.seuPapel === 'Jogador A' ? online.sala.jogadorB?.conectado : online.sala.jogadorA?.conectado)
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/50 animate-pulse'
                        }`}>
                          {(online.seuPapel === 'Jogador A' ? online.sala.jogadorB?.conectado : online.sala.jogadorA?.conectado)
                            ? 'Online'
                            : 'Reconectando...'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-stone-300 font-mono leading-tight">
                      <strong className="text-rose-300 font-black">{totalPedrasAdversario}</strong> pedras
                    </div>
                  </div>
                </div>

                {/* Indicador de Vez do Adversário */}
                <div className="text-right flex items-center gap-1.5">
                  {isVezAdversario ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-stone-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono animate-pulse flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping" />
                      <span>{modoJogo === 'ia' ? (iaPensando ? 'Calculando...' : 'Vez da IA') : 'Vez'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-mono">Aguardando</span>
                  )}
                  {isVezAdversario && gameStateAtivo.jogadasBonusPendentes && gameStateAtivo.jogadasBonusPendentes > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black font-mono animate-bounce shadow-xs">
                      +{gameStateAtivo.jogadasBonusPendentes}x
                    </span>
                  ) : null}
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────
                  TABULEIRO (4 × 6) - CENTRALIZADO EXATAMENTE NO MEIO DO TELEFONE
                  ────────────────────────────────────────────────────────── */}
              <div className="w-full flex items-center justify-center my-auto shrink-0">
                <TabuleiroNtxuva
                  casas={gameStateAtivo.casas}
                  jogadorAtual={gameStateAtivo.jogadorAtual}
                  podeIniciarCasa={validarCasaParaJogada}
                  casaEmFoco={gameStateAtivo.casaEmFoco}
                  ultimaCasaEscolhida={gameStateAtivo.ultimaCasaEscolhida}
                  casasCapturadas={animando ? casasCapturadasRecentes : []}
                  casaCapturadora={casaCapturadoraRecente}
                  onEscolherCasa={handleExecutarJogada}
                  desabilitado={isTabuleiroDesabilitado}
                  passoAtual={passoVisualAtivo}
                  casaOrigemAnimacao={casaOrigemAnimacao}
                  casaDestinoAnimacao={casaDestinoAnimacao}
                  casaTerminoAnimacao={casaTerminoAnimacao}
                  casaMotoMotoAnimacao={casaMotoMotoAnimacao}
                  casasEmCapturaAnimacao={casasEmCapturaAnimacao}
                  pedrasNaMaoAnimacao={pedrasNaMaoAnimacao}
                  trajetoriaAnimacao={animando ? trajetoriaAnimacao : []}
                  onReiniciarPartida={handleReiniciarPartida}
                  onAbrirDefinicoes={() => setModalConfigAberto(true)}
                  onSairMenu={voltarComSetaOuBotao}
                  mostrarStartBanner={mostrarStartBanner}
                  bonus={bonusAtivo}
                />
              </div>

              {/* ──────────────────────────────────────────────────────────
                  PARTE INFERIOR: JOGADOR (Ex: 1)
                  ────────────────────────────────────────────────────────── */}
              <div className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-2xl transition-all border shrink-0 ${
                isVezJogador 
                  ? 'bg-[#102414] border-emerald-500/90 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30' 
                  : 'bg-[#1a0e07] border-[#382012]'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Avatar do Jogador */}
                  <div className="relative">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all ${
                      isVezJogador 
                        ? 'bg-emerald-950 border-emerald-500 ring-2 ring-emerald-500/30' 
                        : 'bg-[#26150b] border-[#4d2d18]'
                    }`}>
                      <User className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isVezJogador ? 'text-emerald-300' : 'text-stone-400'}`} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-xs select-none">
                      🟢
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-200 uppercase font-mono leading-tight">
                        {nomeExibicaoJogador}
                      </span>
                      {modoJogo === 'online' && online.sala && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono ${
                          online.conectado
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/50 animate-pulse'
                        }`}>
                          {online.conectado ? 'Online' : 'Reconectando...'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-stone-300 font-mono leading-tight">
                      <strong className="text-emerald-300 font-black">{totalPedrasJogador}</strong> pedras
                    </div>
                  </div>
                </div>

                {/* Indicador de Vez do Jogador */}
                <div className="text-right flex items-center gap-1.5">
                  {isVezJogador ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono animate-pulse flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping" />
                      <span>Sua Vez</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-mono">Aguardando</span>
                  )}
                  {isVezJogador && gameStateAtivo.jogadasBonusPendentes && gameStateAtivo.jogadasBonusPendentes > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black font-mono animate-bounce shadow-xs">
                      +{gameStateAtivo.jogadasBonusPendentes}x
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* BANNER PUBLICITÁRIO OFICIAL GOOGLE ADMOB / ADSENSE (RESPONSIVO E NÃO-INVASIVO) */}
      <AnuncioBanner
        onAbrirConfiguracoes={() => {
          setAbaModalConfig('anuncios');
          setModalConfigAberto(true);
        }}
        className="shrink-0 mt-0.5 mb-1 sm:mb-1.5"
      />

      {/* ──────────────────────────────────────────────────────────
          MODAL: DEFINIÇÕES & ESTATÍSTICAS (⚙️ / 📊 / 🏆)
          ────────────────────────────────────────────────────────── */}
      {modalConfigAberto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-[#1c1109] border-2 border-amber-500/70 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 text-stone-100 font-mono text-xs">
            
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#3b2214]">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Configurações
                </h3>
              </div>
              <button
                type="button"
                onClick={voltarComSetaOuBotao}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SELETOR DE ABAS PRINCIPAIS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-[#130b06] rounded-2xl border border-[#3d2315] gap-1">
              <button
                type="button"
                onClick={() => setAbaModalConfig('jogo')}
                className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  abaModalConfig === 'jogo'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Jogo</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaModalConfig('anuncios')}
                className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  abaModalConfig === 'anuncios'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Anúncios</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaModalConfig('estatisticas')}
                className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  abaModalConfig === 'estatisticas'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Estatísticas</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaModalConfig('conquistas')}
                className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  abaModalConfig === 'conquistas'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Conquistas</span>
              </button>
            </div>

            {/* CONTEÚDO DAS CONFIGURAÇÕES */}
            {abaModalConfig === 'jogo' ? (
              <div className="space-y-4 pt-1 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-stone-300 font-bold block">Modo de Jogo:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        iniciarJogoLocal();
                        setModalConfigAberto(false);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold cursor-pointer transition-all ${
                        modoJogo === 'local' && telaAtual !== 'desafios'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                          : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span className="text-[11px]">Local (2P)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        iniciarJogoIA();
                        setModalConfigAberto(false);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold cursor-pointer transition-all ${
                        modoJogo === 'ia' && telaAtual !== 'desafios'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                          : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                      <span className="text-[11px]">Contra IA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        iniciarJogoOnline();
                        setModalConfigAberto(false);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold cursor-pointer transition-all ${
                        modoJogo === 'online' && telaAtual !== 'desafios'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                          : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-[11px]">Online</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        online.sairDaSala();
                        setTelaAtual('desafios');
                        setModalConfigAberto(false);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold cursor-pointer transition-all ${
                        telaAtual === 'desafios'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                          : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-[11px]">Quebra-Cabeça</span>
                    </button>
                  </div>
                </div>

                {/* SELETOR DE DIFICULDADE DA IA NO MODAL DE CONFIGURAÇÃO */}
                {modoJogo === 'ia' && (
                  <div className="space-y-2 p-3 rounded-2xl bg-[#20120a] border border-amber-600/40">
                    <div className="flex items-center justify-between">
                      <label className="text-stone-300 font-bold block text-xs uppercase font-mono">
                        Dificuldade da IA:
                      </label>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        {dificuldadeIA === 'iniciante' && '🟢 Iniciante'}
                        {dificuldadeIA === 'medio' && '🟡 Médio'}
                        {dificuldadeIA === 'mestre' && '👑 Mestre Kota'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDificuldadeIA('iniciante');
                          setNomeJogadorLocalB('IA (Iniciante)');
                        }}
                        className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          dificuldadeIA === 'iniciante'
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400 font-black shadow-sm'
                            : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                        }`}
                      >
                        🟢 Iniciante
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDificuldadeIA('medio');
                          setNomeJogadorLocalB('IA (Médio)');
                        }}
                        className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          dificuldadeIA === 'medio'
                            ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-sm'
                            : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                        }`}
                      >
                        🟡 Médio
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDificuldadeIA('mestre');
                          setNomeJogadorLocalB('Mestre Kota (IA)');
                        }}
                        className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          dificuldadeIA === 'mestre'
                            ? 'bg-purple-500 text-stone-950 border-purple-400 font-black shadow-sm'
                            : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                        }`}
                      >
                        👑 Kota
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-stone-300 font-bold block">Velocidade da Animação:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['lenta', 'normal', 'rapida', 'instantanea'] as VelocidadeAnimacao[]).map((vel) => (
                      <button
                        key={vel}
                        type="button"
                        onClick={() => setVelocidade(vel)}
                        className={`p-2 rounded-xl border font-bold capitalize cursor-pointer transition-all ${
                          velocidade === vel
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                            : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                        }`}
                      >
                        {vel === 'lenta' && '🐢 Lenta'}
                        {vel === 'normal' && '▶ Normal'}
                        {vel === 'rapida' && '⚡ Rápida'}
                        {vel === 'instantanea' && '⏭ Instantânea'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#29170c] border border-[#442716]">
                  <div className="flex items-center gap-2 text-stone-200 font-bold">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Efeitos Sonoros</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const novo = !somHabilitado;
                      setSomHabilitado(novo);
                      soundManager.setEnabled(novo);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                      somHabilitado ? 'bg-emerald-500 text-stone-950 font-black' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {somHabilitado ? 'Ligado' : 'Mudo'}
                  </button>
                </div>

                {/* AVISO DE DESLIGAMENTO AUTOMÁTICO APÓS 5 MINUTOS */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1d1007] border border-amber-600/30 text-[10px] text-amber-200/90 leading-tight">
                  <span className="text-sm">⏳</span>
                  <span>
                    <strong>Desligamento automático:</strong> O som e a música desligam-se se o telefone ou o jogo ficarem inativos por <strong>5 minutos</strong>, evitando que toquem sozinhos.
                  </span>
                </div>

                {/* IMERSÃO CULTURAL MOÇAMBICANA: MÚSICA DE TIMBILA CHOPI */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2c170a] via-[#3a1e0d] to-[#221006] border-2 border-amber-500/60 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-100 flex items-center gap-1.5">
                          <span>Música de Timbila (Chopi)</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black">
                            Zavala
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-200/80 leading-tight">
                          Melodia suave e acústica à sombra de uma árvore
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleMusicaTimbila}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all shrink-0 ${
                        musicaTimbilaHabilitada
                          ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/40'
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {musicaTimbilaHabilitada ? '🎵 Ligado' : 'Desligado'}
                    </button>
                  </div>

                  {/* Efeitos da Timbila no jogo */}
                  <div className="pt-2 border-t border-amber-900/50 space-y-1.5">
                    <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      Ouvir Efeitos de Timbila:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => soundManager.playPickup()}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-amber-500/30 text-[10px] font-bold text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        🪵 Levar Pedras
                      </button>
                      <button
                        type="button"
                        onClick={() => soundManager.playCapture(8)}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-amber-500/30 text-[10px] font-bold text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        🎯 Captura
                      </button>
                      <button
                        type="button"
                        onClick={() => soundManager.playBonus(true)}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-amber-500/30 text-[10px] font-bold text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        ⚡ Bónus 2x
                      </button>
                      <button
                        type="button"
                        onClick={() => soundManager.playTombolaCelebration()}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-amber-500/30 text-[10px] font-bold text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        🥁 Tômbola Taça
                      </button>
                    </div>
                  </div>

                  {/* Balões de fala e expressões moçambicanas */}
                  <div className="pt-2 border-t border-amber-900/50 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-amber-300 font-bold uppercase tracking-wider">
                        Vozes e Expressões Moçambicanas:
                      </span>
                      <span className="text-stone-400">Balão + Voz + Som</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: 'que_bela_jogada', rotulo: '“Que bela jogada!” 🎯' },
                        { id: 'kanimambo', rotulo: '“Kanimambo!” 🙏' },
                        { id: 'axinene', rotulo: '“Axinenéee!” 🔥' },
                        { id: 'wau_que_bom', rotulo: '“Wau que bom!” 😲' },
                        { id: 'ganhou', rotulo: '“Ganhou!” 👑' },
                        { id: 'morreu_afogado', rotulo: '“Morreu afogado!” 🛑' },
                      ].map((expr) => (
                        <button
                          key={expr.id}
                          type="button"
                          onClick={() => setExpressaoAtiva(expr.id as TipoExpressaoMocambicana)}
                          className="p-1.5 rounded-lg bg-black/35 hover:bg-amber-950/60 border border-amber-500/30 hover:border-amber-400 text-[10px] text-stone-200 hover:text-white font-bold transition-all text-left truncate cursor-pointer active:scale-95"
                          title={`Testar expressão ${expr.rotulo}`}
                        >
                          {expr.rotulo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#3b2214] space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalConfigAberto(false);
                      setTelaAtual('menu');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-amber-600/60 text-amber-300 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-amber-400" />
                    <span>Voltar ao Menu Inicial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleReiniciarPartida();
                      setModalConfigAberto(false);
                    }}
                    disabled={animando}
                    className="w-full py-2 rounded-xl bg-[#201209] hover:bg-[#29170c] border border-[#442716] text-stone-300 hover:text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Reiniciar Partida (48 Pedras)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalConfigAberto(false);
                      setModalMenuAberto(true);
                    }}
                    className="w-full py-2 rounded-xl bg-[#201209] hover:bg-[#2b180d] border border-[#3b2012] text-stone-300 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-stone-400" />
                    <span>Regras Oficiais do Jogo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalConfigAberto(false);
                      setModalDoacoesAberto(true);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#291307] to-[#200e04] hover:from-[#35190a] hover:to-[#2b1206] border border-amber-500/40 text-amber-200 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-amber-400 fill-amber-400/40" />
                    <span>Doações & Criador (Apoiar)</span>
                  </button>
                </div>
              </div>
            ) : abaModalConfig === 'anuncios' ? (
              <div className="pt-1 animate-fadeIn">
                <PainelConfiguracaoAnuncios
                  onTestarIntersticial={() => setModalAnuncioIntersticialAberto(true)}
                  onTestarRecompensado={() => setModalAnuncioRecompensadoAberto(true)}
                />
              </div>
            ) : (
              <div className="pt-1 animate-fadeIn">
                <PainelEstatisticasConquistas
                  stats={estatisticasJogador}
                  onAtualizarStats={setEstatisticasJogador}
                  abaInicial={abaModalConfig === 'conquistas' ? 'conquistas' : 'estatisticas'}
                />
              </div>
            )}

            <button
              type="button"
              onClick={voltarComSetaOuBotao}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs cursor-pointer shadow-lg transition-colors mt-2"
            >
              Fechar Definições
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: MENU & REGRAS (⋮)
          ────────────────────────────────────────────────────────── */}
      {modalMenuAberto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-[#1c1109] border-2 border-amber-500/70 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 text-stone-100 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2214]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-200 uppercase tracking-wider">
                    Regras do Ntxuva (Guia Ilustrado)
                  </h3>
                  <p className="text-[11px] text-stone-400 font-normal">
                    Exemplos visuais no próprio tabuleiro para iniciantes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={voltarComSetaOuBotao}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modoJogo === 'online' && online.sala && (
              <div className="p-3 rounded-2xl bg-[#29170c] border border-[#442716] space-y-2">
                <span className="text-stone-300 font-bold block">Ações da Sala Online:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      handleCopiarCodigoSala();
                      setModalMenuAberto(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      online.desistirOnline();
                      setModalMenuAberto(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-bold cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Desistir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      voltarAoMenuPrincipal();
                      setModalMenuAberto(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-300 hover:text-white border border-stone-700 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Sala</span>
                  </button>
                </div>
              </div>
            )}

            {/* GUIA ILUSTRADO COM EXEMPLOS VISUAIS NO PRÓPRIO TABULEIRO */}
            <RegrasIlustradas onFechar={voltarComSetaOuBotao} />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: DOAÇÕES & CRIADOR
          ────────────────────────────────────────────────────────── */}
      <ModalDoacoesCriador
        aberto={modalDoacoesAberto}
        onFechar={voltarComSetaOuBotao}
      />

      {/* ──────────────────────────────────────────────────────────
          ECRÃ DE VITÓRIA: TAÇA (🏆), BALÕES E FITAS DOURADAS
          ────────────────────────────────────────────────────────── */}
      {gameStateAtivo.estadoDaPartida === 'FINALIZADA' && gameStateAtivo.vencedor && (
        <EcraVitoria
          vencedor={gameStateAtivo.vencedor}
          nomeExibicao={nomeExibicaoVencedor}
          isJogadorPrincipal={gameStateAtivo.vencedor === JOGADOR_A}
          tipoVitoria={gameStateAtivo.tipoVitoria}
          motivoVitoria={gameStateAtivo.motivoVitoria}
          onNovaPartida={() => {
            const deveExibir = anunciosService.registrarFimDePartida();
            handleReiniciarPartida();
            if (deveExibir) {
              setModalAnuncioIntersticialAberto(true);
            }
          }}
          onMenuPrincipal={() => {
            const deveExibir = anunciosService.registrarFimDePartida();
            handleReiniciarPartida();
            voltarComSetaOuBotao();
            if (deveExibir) {
              setModalAnuncioIntersticialAberto(true);
            }
          }}
          onAssistirAnuncioRecompensa={() => {
            setModalAnuncioRecompensadoAberto(true);
          }}
        />
      )}

      {/* TOAST DE CELEBRAÇÃO: CONQUISTA DESBLOQUEADA */}
      <ToastConquistaDesbloqueada
        conquista={conquistaToastAtiva}
        onFechar={handleFecharConquista}
      />

      {/* BALÃO DE EXPRESSÃO MOÇAMBICANA (VOZ E TEXTO TRADICIONAL) */}
      <BalaoExpressaoMocambicana
        expressao={expressaoAtiva}
        onFechar={handleFecharExpressao}
      />

      {/* ──────────────────────────────────────────────────────────
          BARRA DE CHAT GLOBAL, COMUNIDADE & CAMPEONATOS
          ────────────────────────────────────────────────────────── */}
      <BarraChatComunidade
        aberto={modalChatAberto}
        onFechar={voltarComSetaOuBotao}
        perfil={perfilJogador}
        onAbrirEditarPerfil={() => setModalPerfilAberto(true)}
        onAbrirCriarCampeonato={() => setModalCriarCampeonatoAberto(true)}
        onEntrarNaSalaOnline={handleEntrarNaSalaPeloChat}
        onCriarSalaParaDesafio={handleCriarSalaPeloChat}
        codigoSalaAtual={online.sala?.codigo ?? null}
      />

      {/* MODAL: MEU PERFIL DE JOGADOR */}
      <ModalPerfilJogador
        aberto={modalPerfilAberto}
        onFechar={voltarComSetaOuBotao}
        perfilAtual={perfilJogador}
        onSalvarPerfil={handleSalvarPerfil}
      />

      {/* MODAL: CRIAR NOVO CAMPEONATO */}
      <ModalCriarCampeonato
        aberto={modalCriarCampeonatoAberto}
        onFechar={voltarComSetaOuBotao}
        perfil={perfilJogador}
        onCriarCampeonato={handleCriarCampeonato}
      />

      {/* MODAL DE CONFIRMAÇÃO DE SAÍDA DO APLICATIVO */}
      <ModalConfirmarSaida
        aberto={modalConfirmarSaidaAberto}
        onCancelar={voltarComSetaOuBotao}
        onConfirmarSaida={handleConfirmarSaidaApp}
      />

      {/* MODAL PARA SALVAR PARTIDA EM ANDAMENTO AO SAIR (SIM OU NÃO) */}
      <ModalSalvarPartida
        aberto={modalSalvarPartidaAberto}
        onSalvarESair={handleSalvarESairPartida}
        onSairSemSalvar={handleSairSemSalvarPartida}
        onCancelar={() => setModalSalvarPartidaAberto(false)}
        totalJogadas={historicoPartida.length}
        modoJogo={modoJogo}
      />

      {/* MODAL DE INSTALAÇÃO NO TELEMÓVEL (SISTEMA MOBILE PWA) */}
      <ModalInstalarTelemovel
        aberto={modalCompartilharAberto}
        onFechar={() => setModalCompartilharAberto(false)}
      />

      {/* MODAL: ANÚNCIO INTERSTICIAL (TELA CHEIA) */}
      <ModalAnuncioIntersticial
        aberto={modalAnuncioIntersticialAberto}
        onFechar={() => setModalAnuncioIntersticialAberto(false)}
      />

      {/* MODAL: ANÚNCIO DE VÍDEO RECOMPENSADO (+250 MOEDAS) */}
      <ModalAnuncioRecompensado
        aberto={modalAnuncioRecompensadoAberto}
        onFechar={() => setModalAnuncioRecompensadoAberto(false)}
        onRecompensaConcedida={(moedas) => {
          const saldoAtualizado = anunciosService.obterSaldoMoedas();
          setSaldoMoedas(saldoAtualizado);
          notificarFeedback(`🎉 Parabéns! +${moedas} moedas adicionadas (Saldo: ${saldoAtualizado} / ${MAXIMO_MOEDAS}).`);
        }}
      />

      {/* MODAL: MOEDAS INSUFICIENTES (RECARGA 24H OU BÓNUS DE VÍDEO) */}
      <ModalMoedasInsuficientes
        aberto={modalMoedasInsuficientesAberto}
        saldoAtual={saldoMoedas}
        onFechar={() => setModalMoedasInsuficientesAberto(false)}
        onAssistirVideo={() => {
          setModalMoedasInsuficientesAberto(false);
          setModalAnuncioRecompensadoAberto(true);
        }}
        onJogarOnline={() => {
          setModalMoedasInsuficientesAberto(false);
          iniciarJogoOnline();
        }}
      />
    </div>
  );
}
