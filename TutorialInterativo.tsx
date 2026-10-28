import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Swords, 
  Layers, 
  Compass, 
  X, 
  Lightbulb,
  Zap,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { TabuleiroNtxuva } from './TabuleiroNtxuva';
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
  JOGADOR_A,
  obterProximaCasa,
  ehLinhaInterna
} from '../models/ntxuva';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

export interface TutorialEtapa {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  conceito: 'semeadura_basica' | 'movimento_continuo' | 'captura_simples' | 'captura_dupla' | 'jogo_livre';
  icone: string;
  explicacao: string;
  instrucaoPasso: string;
  casasIniciais: Record<number, number>;
  jogadorInicial?: Jogador;
  covaRecomendada: number;
  covasPermitidas?: number[];
  covaDestinoDestaque?: number;
  covasAlvoCaptura?: number[];
  mostrarDicaFluxo?: boolean;
  resumoRegra: string;
}

export const ETAPAS_TUTORIAL: TutorialEtapa[] = [
  {
    id: 'etapa_1',
    numero: 1,
    titulo: '1. O Fluxo de Semeadura (Casa a Casa)',
    subtitulo: 'Aprenda a semear no sentido anti-horário',
    conceito: 'semeadura_basica',
    icone: '🌱',
    explicacao: 'No NTXUVA, você escolhe uma cova com 2 ou mais pedras. Todas as pedras são retiradas e semeadas UMA A UMA nas covas seguintes no sentido anti-horário (1 → 2 → 3...).',
    instrucaoPasso: 'Toque na Cova 1 (que tem 2 pedras) para ver a semeadura cair na Cova 2 e depois na Cova 3 vazia!',
    casasIniciais: {
      1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
      13: 2, 14: 2, 15: 2, 16: 0, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2
    },
    covaRecomendada: 1,
    covasPermitidas: [1],
    covaDestinoDestaque: 3,
    mostrarDicaFluxo: true,
    resumoRegra: 'Cada pedra cai individualmente na casa seguinte (+1). Se a última cair numa casa vazia sem peças adversárias em frente, o turno encerra.'
  },
  {
    id: 'etapa_2',
    numero: 2,
    titulo: '2. Movimento Contínuo (Revezamento)',
    subtitulo: 'Quando a última pedra cai numa cova já com pedras',
    conceito: 'movimento_continuo',
    icone: '🔄',
    explicacao: 'Se a ÚLTIMA pedra da sua mão cair numa cova que já possui pedras, você NÃO para! Você recolhe todas as pedras dessa cova para a sua mão e continua a semear sem perder o turno!',
    instrucaoPasso: 'Toque na Cova 1 (2 pedras). A 2ª pedra cairá na Cova 3 (que já tem 1 pedra). Veja a jogada continuar automaticamente pela Cova 4 e 5!',
    casasIniciais: {
      1: 2, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
      13: 2, 14: 2, 15: 2, 16: 0, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2
    },
    covaRecomendada: 1,
    covasPermitidas: [1],
    covaDestinoDestaque: 3,
    mostrarDicaFluxo: true,
    resumoRegra: 'O movimento contínuo permite criar cascatas longas pelo tabuleiro até encontrar uma cova vazia ou uma captura.'
  },
  {
    id: 'etapa_3',
    numero: 3,
    titulo: '3. A Captura Simples de Peças',
    subtitulo: 'As 3 Condições Oficiais de Captura',
    conceito: 'captura_simples',
    icone: '⚔️',
    explicacao: 'Para capturar (comer) pedras adversárias, 3 condições devem ocorrer juntas:\n1. A sua última pedra cai numa casa que estava VAZIA;\n2. Essa casa é na sua LINHA DE ATAQUE (Covas 1 a 6);\n3. O adversário tem pedras na cova logo em frente!\nAs peças capturadas vão para a sua mão e continuam sendo semeadas!',
    instrucaoPasso: 'Toque na Cova 2 (2 pedras). Ela semeará na 3 e a última pedra cairá na Cova 4 vazia, em frente à Cova 15 do adversário (que tem 3 pedras)!',
    casasIniciais: {
      1: 0, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
      13: 2, 14: 2, 15: 3, 16: 0, 17: 0, 18: 2, 19: 2, 20: 2, 21: 0, 22: 2, 23: 2, 24: 2
    },
    covaRecomendada: 2,
    covasPermitidas: [2],
    covaDestinoDestaque: 4,
    covasAlvoCaptura: [15],
    mostrarDicaFluxo: true,
    resumoRegra: 'Última pedra em casa vazia + Linha de ataque + Adversário em frente = CAPTURA com continuação!'
  },
  {
    id: 'etapa_4',
    numero: 4,
    titulo: '4. Captura Dupla (Frente + Defesa)',
    subtitulo: 'Limpar a coluna inteira do adversário',
    conceito: 'captura_dupla',
    icone: '💥',
    explicacao: 'Quando você cumpre os requisitos de captura na linha interna de frente do adversário, e a cova de trás (linha de defesa externa dele) também tiver pedras, você come AS DUAS COVAS de uma só vez!',
    instrucaoPasso: 'Toque na Cova 1 (2 pedras). A última cairá na Cova 3 vazia. Você capturará a Cova 16 (frente) E a Cova 21 (trás), levando 5 pedras para a mão!',
    casasIniciais: {
      1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
      13: 2, 14: 2, 15: 0, 16: 3, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2
    },
    covaRecomendada: 1,
    covasPermitidas: [1],
    covaDestinoDestaque: 3,
    covasAlvoCaptura: [16, 21],
    mostrarDicaFluxo: true,
    resumoRegra: 'Se a cova da frente tiver peças, a cova de trás também é capturada na mesma jogada!'
  },
  {
    id: 'etapa_5',
    numero: 5,
    titulo: '5. Prática Interativa Guiada',
    subtitulo: 'Execute uma abertura clássica do NTXUVA',
    conceito: 'jogo_livre',
    icone: '🏆',
    explicacao: 'Você está no tabuleiro inicial clássico (2 pedras em cada uma das 24 covas). Escolha uma cova da sua linha de frente ou retaguarda para iniciar a sua primeira semeadura guiada!',
    instrucaoPasso: 'Experimente iniciar pela Cova 1 ou Cova 2 e observe o caminho circular de 12 casas se desenrolar.',
    casasIniciais: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
      13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2
    },
    covaRecomendada: 1,
    covasPermitidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    covaDestinoDestaque: 3,
    mostrarDicaFluxo: true,
    resumoRegra: 'Parabéns! Você já domina a Semeadura, Movimento Contínuo e Captura. Boa partida!'
  }
];

interface TutorialInterativoProps {
  onVoltarMenu: () => void;
  onIniciarPartidaReal?: () => void;
}

export const TutorialInterativo: React.FC<TutorialInterativoProps> = ({
  onVoltarMenu,
  onIniciarPartidaReal
}) => {
  const [etapaIndex, setEtapaIndex] = useState(0);
  const etapa = ETAPAS_TUTORIAL[etapaIndex];

  // Estado do jogo simulado
  const [gameState, setGameState] = useState<GameState>(() => 
    criarGameStateCustomizado(etapa.casasIniciais, etapa.jogadorInicial || JOGADOR_A)
  );

  // Estados de animação e fluxo
  const [animando, setAnimando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [passosFila, setPassosFila] = useState<PassoDistribuicao[]>([]);
  const [passoIndex, setPassoIndex] = useState<number>(-1);
  const [passoVisualAtivo, setPassoVisualAtivo] = useState<PassoDistribuicao | null>(null);
  const [gameStateAnimacao, setGameStateAnimacao] = useState<GameState | null>(null);

  // Destaques visuais no tabuleiro
  const [casaOrigemAnimacao, setCasaOrigemAnimacao] = useState<number | null>(null);
  const [casaDestinoAnimacao, setCasaDestinoAnimacao] = useState<number | null>(null);
  const [casaTerminoAnimacao, setCasaTerminoAnimacao] = useState<number | null>(null);
  const [casasEmCapturaAnimacao, setCasasEmCapturaAnimacao] = useState<number[]>([]);
  const [pedrasNaMaoAnimacao, setPedrasNaMaoAnimacao] = useState<number>(0);
  const [trajetoriaAnimacao, setTrajetoriaAnimacao] = useState<number[]>([]);
  const [bonusAtivo, setBonusAtivo] = useState<BonusCapturaRecente | null>(null);

  // Status de conclusão da etapa atual
  const [etapaConcluida, setEtapaConcluida] = useState(false);
  const [explicacaoPassoAtual, setExplicacaoPassoAtual] = useState<string | null>(null);

  // Trajetória prevista antes de clicar
  const casasPrevistas = useRef<number[]>([]);

  const animacaoTimerRef = useRef<any>(null);
  const pausadoRef = useRef(false);
  pausadoRef.current = pausado;

  // Ao mudar de etapa, reinicia o estado
  useEffect(() => {
    reiniciarEtapa();
  }, [etapaIndex]);

  const reiniciarEtapa = useCallback(() => {
    if (animacaoTimerRef.current) {
      clearTimeout(animacaoTimerRef.current);
      animacaoTimerRef.current = null;
    }
    setAnimando(false);
    setPausado(false);
    setPassosFila([]);
    setPassoIndex(-1);
    setPassoVisualAtivo(null);
    setGameStateAnimacao(null);
    setCasaOrigemAnimacao(null);
    setCasaDestinoAnimacao(null);
    setCasaTerminoAnimacao(null);
    setCasasEmCapturaAnimacao([]);
    setPedrasNaMaoAnimacao(0);
    setTrajetoriaAnimacao([]);
    setBonusAtivo(null);
    setEtapaConcluida(false);
    setExplicacaoPassoAtual(null);

    const novoState = criarGameStateCustomizado(etapa.casasIniciais, etapa.jogadorInicial || JOGADOR_A);
    setGameState(novoState);
  }, [etapa]);

  // Função para executar a jogada na cova
  const executarLanceTutorial = (numeroCasa: number) => {
    if (animando) return;

    // Se a etapa restringe as covas válidas
    if (etapa.covasPermitidas && !etapa.covasPermitidas.includes(numeroCasa)) {
      soundManager.playError();
      setExplicacaoPassoAtual(`Nesta etapa do tutorial, experimente tocar na Cova ${etapa.covaRecomendada} destacada em verde.`);
      return;
    }

    const validacao = podeIniciarJogada(gameState, numeroCasa);
    if (!validacao.valido) {
      soundManager.playError();
      setExplicacaoPassoAtual(validacao.motivo || 'Cova inválida para iniciar a jogada.');
      return;
    }

    try {
      const { novoEstado, passos } = executarDistribuicao(gameState, numeroCasa, false, true);

      soundManager.playPickup();
      setPassosFila(passos);
      setPassoIndex(0);
      setAnimando(true);
      setCasaOrigemAnimacao(numeroCasa);
      setTrajetoriaAnimacao([numeroCasa]);

      // Inicia reprodução passo a passo
      animarProximoPasso(passos, 0, novoEstado);
    } catch (e: any) {
      soundManager.playError();
    }
  };

  const animarProximoPasso = (
    passos: PassoDistribuicao[], 
    idx: number, 
    estadoFinal: GameState
  ) => {
    if (idx >= passos.length) {
      // Fim da distribuição desta jogada no tutorial
      setAnimando(false);
      setGameState(estadoFinal);
      setGameStateAnimacao(null);
      setCasaOrigemAnimacao(null);
      setCasaDestinoAnimacao(null);
      setPedrasNaMaoAnimacao(0);
      setEtapaConcluida(true);
      soundManager.playVictory();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3 }
        });
      } catch {}

      return;
    }

    const passo = passos[idx];
    setPassoIndex(idx);
    setPassoVisualAtivo(passo);
    setPedrasNaMaoAnimacao(passo.pedrasNaMaoDepois);

    // Ajusta visualização conforme o tipo de passo
    if (passo.tipo === 'retirar_origem') {
      soundManager.playPickup();
      setCasaOrigemAnimacao(passo.casa);
      setExplicacaoPassoAtual(`Retirou ${passo.pedrasNaMaoDepois} pedras da Cova ${passo.casa} para a mão.`);
    } else if (passo.tipo === 'semear_pedra') {
      soundManager.playStoneDrop();
      setCasaDestinoAnimacao(passo.casa);
      setTrajetoriaAnimacao((prev) => [...prev, passo.casa]);
      setExplicacaoPassoAtual(`Semeando +1 pedra na Cova ${passo.casa}. Restam ${passo.pedrasNaMaoDepois} na mão.`);
    } else if (passo.tipo === 'captura_pedras') {
      soundManager.playCapture(passo.pedrasCapturadas || 2);
      setCasasEmCapturaAnimacao(passo.casasCapturadas || []);
      setExplicacaoPassoAtual(`⚔️ CAPTURA! As peças das covas [${(passo.casasCapturadas || []).join(', ')}] foram comidas e entraram na sua mão!`);
    } else if (passo.tipo === 'recolher_revezamento') {
      soundManager.playPickup();
      setCasaOrigemAnimacao(passo.casa);
      setExplicacaoPassoAtual(`🔄 Movimento Contínuo: A última pedra caiu na Cova ${passo.casa} que já tinha pedras. Recolheu todas para a mão e prossegue!`);
    } else if (passo.tipo === 'fim_distribuicao') {
      setCasaTerminoAnimacao(passo.casa);
      setExplicacaoPassoAtual(`🛑 Fim da jogada: A última pedra caiu na Cova ${passo.casa} vazia sem capturas.`);
    }

    // Atualiza estado intermediário do tabuleiro
    setGameStateAnimacao((prev) => {
      const base = prev || gameState;
      const novasCasas = base.casas.map((c) => {
        if (c.numero === passo.casa) {
          return { ...c, quantidadeDePedras: passo.pedrasNaCasaDepois };
        }
        if (passo.casasCapturadas && passo.casasCapturadas.includes(c.numero)) {
          return { ...c, quantidadeDePedras: 0 };
        }
        return c;
      });
      return {
        ...base,
        casas: novasCasas,
        pedrasNaMao: passo.pedrasNaMaoDepois
      };
    });

    // Tempo de delay para o jogador ver casa a casa
    const delay = passo.tipo === 'captura_pedras' ? 1200 : passo.tipo === 'recolher_revezamento' ? 900 : 600;

    animacaoTimerRef.current = setTimeout(() => {
      setCasasEmCapturaAnimacao([]);
      animarProximoPasso(passos, idx + 1, estadoFinal);
    }, delay);
  };

  // Casas calculadas para mostrar seta de fluxo antecipado
  const fluxoCircuitoDestaque = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 w-full max-w-4xl mx-auto animate-fadeIn select-none space-y-3">
      {/* Topo / Barra de Cabeçalho do Tutorial */}
      <div className="w-full bg-[#1c1008] border-2 border-[#4d2d18] rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onVoltarMenu}
            className="p-2 rounded-xl bg-[#2b170d] hover:bg-[#382012] border border-[#542f1a] text-amber-300 hover:text-amber-100 transition-colors cursor-pointer"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>TUTORIAL INTERATIVO</span>
              <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/50 text-emerald-300">
                {etapaIndex + 1} de {ETAPAS_TUTORIAL.length}
              </span>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-amber-200 font-mono leading-tight">
              {etapa.titulo}
            </h2>
          </div>
        </div>

        {/* Botão de reiniciar etapa */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reiniciarEtapa}
            disabled={animando}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#29170c] hover:bg-[#361e10] border border-[#522d17] text-stone-300 hover:text-amber-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            title="Reiniciar esta lição"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Repetir</span>
          </button>
        </div>
      </div>

      {/* Caixa de Explicação Didática da Etapa */}
      <div className="w-full bg-gradient-to-r from-[#211108] via-[#2d180b] to-[#211108] border-2 border-amber-600/50 rounded-2xl p-3 sm:p-4 shadow-lg space-y-2 relative overflow-hidden">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-inner">
            {etapa.icone}
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-xs sm:text-sm text-stone-200 leading-snug whitespace-pre-line font-medium">
              {etapa.explicacao}
            </div>

            {/* Instrução em destaque para o próximo clique */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 flex items-center gap-2 text-xs font-mono text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong>Ação:</strong> {etapa.instrucaoPasso}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback dinâmico da animação casa a casa */}
        {explicacaoPassoAtual && (
          <div className="p-2 rounded-xl bg-stone-900/90 border border-emerald-500/50 flex items-center gap-2 text-[11px] sm:text-xs font-mono text-emerald-300 animate-fadeIn">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{explicacaoPassoAtual}</span>
          </div>
        )}
      </div>

      {/* Tabuleiro Real Interativo do Ntxuva */}
      <div className="w-full relative">
        <TabuleiroNtxuva
          casas={(gameStateAnimacao || gameState).casas}
          jogadorAtual={JOGADOR_A}
          podeIniciarCasa={(num) => {
            if (animando) return { valido: false, motivo: 'Animação em andamento' };
            if (etapa.covasPermitidas && !etapa.covasPermitidas.includes(num)) {
              return { valido: false, motivo: `Neste passo, selecione a Cova ${etapa.covaRecomendada}` };
            }
            return podeIniciarJogada(gameState, num);
          }}
          casaEmFoco={etapa.covaRecomendada}
          onEscolherCasa={executarLanceTutorial}
          desabilitado={animando}
          passoAtual={passoVisualAtivo}
          casaOrigemAnimacao={casaOrigemAnimacao}
          casaDestinoAnimacao={casaDestinoAnimacao}
          casaTerminoAnimacao={casaTerminoAnimacao}
          casasEmCapturaAnimacao={casasEmCapturaAnimacao}
          pedrasNaMaoAnimacao={pedrasNaMaoAnimacao}
          trajetoriaAnimacao={trajetoriaAnimacao}
          mostrarStartBanner={false}
          bonus={bonusAtivo}
        />

        {/* Legenda visual de orientação anti-horária */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#1f1008] border border-[#422211] text-[10px] sm:text-xs font-mono text-stone-400">
          <div className="flex items-center gap-1 text-amber-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Sentido Anti-horário: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Cova para Clicar
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Alvo de Captura
            </span>
          </div>
        </div>
      </div>

      {/* Rodapé de Navegação entre Etapas / Conclusão */}
      <div className="w-full bg-[#1c1008] border-2 border-[#4d2d18] rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Botão anterior */}
        <button
          type="button"
          onClick={() => setEtapaIndex((prev) => Math.max(0, prev - 1))}
          disabled={etapaIndex === 0 || animando}
          className="px-3.5 py-2 rounded-xl bg-[#29170c] hover:bg-[#382012] disabled:opacity-40 border border-[#542f1a] text-stone-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lição Anterior</span>
        </button>

        {/* Indicadores de progresso com bolinhas */}
        <div className="flex items-center gap-1.5">
          {ETAPAS_TUTORIAL.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!animando) setEtapaIndex(idx);
              }}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                idx === etapaIndex
                  ? 'bg-amber-400 ring-2 ring-amber-500/60 scale-125'
                  : idx < etapaIndex
                  ? 'bg-emerald-500'
                  : 'bg-stone-700 hover:bg-stone-500'
              }`}
              title={`Ir para Lição ${idx + 1}: ${item.titulo}`}
            />
          ))}
        </div>

        {/* Botão de Próxima Lição ou Iniciar Partida Real */}
        {etapaIndex < ETAPAS_TUTORIAL.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              setEtapaIndex((prev) => Math.min(ETAPAS_TUTORIAL.length - 1, prev + 1));
            }}
            disabled={animando}
            className={`px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
              etapaConcluida
                ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 ring-2 ring-emerald-300 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
          >
            <span>{etapaConcluida ? 'Excelente! Próxima Lição' : 'Avançar Lição'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onIniciarPartidaReal || onVoltarMenu}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-mono text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-300 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Jogar Partida Real!</span>
          </button>
        )}
      </div>
    </div>
  );
};
