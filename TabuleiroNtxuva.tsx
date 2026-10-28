import React from 'react';
import { Sparkles, Crown, Swords, Flame } from 'lucide-react';
import { Casa, Jogador, PassoDistribuicao, BonusCapturaRecente } from '../types/ntxuva';
import { oposta } from '../models/ntxuva';

interface TabuleiroNtxuvaProps {
  casas: Casa[];
  jogadorAtual: Jogador;
  podeIniciarCasa: (numeroCasa: number) => { valido: boolean; motivo?: string };
  casaEmFoco?: number | null;
  ultimaCasaEscolhida?: number | null;
  casasCapturadas?: number[];
  casaCapturadora?: number | null;
  onEscolherCasa?: (numeroCasa: number) => void;
  onHoverCasa?: (numeroCasa: number | null) => void;
  desabilitado?: boolean;
  // Propriedades de animação visual
  passoAtual?: PassoDistribuicao | null;
  casaOrigemAnimacao?: number | null;
  casaDestinoAnimacao?: number | null;
  casaTerminoAnimacao?: number | null;
  casaMotoMotoAnimacao?: number | null;
  casasEmCapturaAnimacao?: number[];
  pedrasNaMaoAnimacao?: number;
  trajetoriaAnimacao?: number[];
  // Ações de controle direto ao lado do tabuleiro
  onReiniciarPartida?: () => void;
  onAbrirDefinicoes?: () => void;
  onSairMenu?: () => void;
  mostrarStartBanner?: boolean;
  bonus?: BonusCapturaRecente | null;
}

/**
 * Matriz exata das 24 casas do NTXUVA (Geometria 4 × 6):
 * 
 *                     ADVERSÁRIO (Jogador B)
 *              24    23    22    21    20    19   (Linha 1 - Externa)
 *              13    14    15    16    17    18   (Linha 2 - Interna)
 * ═════════════════════════════════════════════════  EIXO CENTRAL DE OPOSIÇÃO FÍSICA
 *               6     5     4     3     2     1   (Linha 3 - Interna)
 *               7     8     9    10    11    12   (Linha 4 - Externa)
 *                      JOGADOR (Jogador A)
 */
export const GEOMETRIA_TABULEIRO = {
  adversario: {
    linhaExterna: [24, 23, 22, 21, 20, 19],
    linhaInterna: [13, 14, 15, 16, 17, 18],
  },
  jogador: {
    linhaInterna: [6, 5, 4, 3, 2, 1],
    linhaExterna: [7, 8, 9, 10, 11, 12],
  },
};

/**
 * Formata a contagem de pedras sem parênteses
 */
export function formatarNumeroPedras(quantidade: number): string {
  return `${quantidade}`;
}

/**
 * Representação visual das pedras (seixos/quartzo) dentro da cavidade esférica
 */
export const PedrasVisual: React.FC<{
  quantidade: number;
  isCapturada?: boolean;
  isDestino?: boolean;
  isSendoCapturada?: boolean;
}> = ({ quantidade, isCapturada, isDestino, isSendoCapturada }) => {
  if (quantidade === 0 && !isSendoCapturada) {
    return null;
  }

  // Posições orgânicas na cavidade esférica
  const posicoes = [
    { top: '34%', left: '38%', rot: '12deg', s: 1.0 },
    { top: '36%', left: '62%', rot: '-22deg', s: 0.95 },
    { top: '50%', left: '30%', rot: '45deg', s: 0.95 },
    { top: '52%', left: '70%', rot: '-35deg', s: 0.95 },
    { top: '22%', left: '50%', rot: '18deg', s: 1.05 },
    { top: '48%', left: '50%', rot: '-10deg', s: 0.9 },
    { top: '38%', left: '20%', rot: '-50deg', s: 0.88 },
    { top: '38%', left: '80%', rot: '40deg', s: 0.88 },
  ];

  const pedrasRenderizadas = Math.min(quantidade, 8);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      {/* Pedra animada caindo (Drop) quando recebe semente */}
      {isDestino && (
        <div
          className="absolute -top-3 w-3 h-3 sm:w-4 sm:h-4 rounded-full z-20 animate-stone-drop shadow-lg"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #fef3c7 0%, #f59e0b 60%, #78350f 100%)',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.9), inset 0 1px 1px #fff',
          }}
        />
      )}

      {/* Pedras físicas orgânicas na cavidade esférica */}
      {Array.from({ length: pedrasRenderizadas }).map((_, index) => {
        const pos = posicoes[index % posicoes.length];
        const isQuartz = index % 2 === 0;

        return (
          <div
            key={index}
            className={`absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full transition-all duration-200 ${
              isSendoCapturada
                ? 'animate-stone-lift brightness-150'
                : isCapturada
                ? 'brightness-125'
                : ''
            }`}
            style={{
              top: pos.top,
              left: pos.left,
              transform: `translate(-50%, -50%) rotate(${pos.rot}) scale(${pos.s})`,
              background: isQuartz
                ? 'radial-gradient(circle at 32% 28%, #fef3c7 0%, #d97706 50%, #78350f 100%)'
                : 'radial-gradient(circle at 30% 30%, #f8fafc 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)',
              boxShadow: isQuartz
                ? 'inset 0 1px 1.5px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.85)'
                : 'inset 0 1px 1.5px rgba(255,255,255,0.95), 0 2px 4px rgba(0,0,0,0.85)',
            }}
          />
        );
      })}
    </div>
  );
};

interface CovaCasaProps {
  casa: Casa;
  isAdversario: boolean;
  posicaoContador?: 'topo' | 'base';
  isJogadorAtual: boolean;
  isSelecionavel: boolean;
  isFoco: boolean;
  isOrigem: boolean;
  isCapturada: boolean;
  isCapturadora: boolean;
  isOrigemAnimacao: boolean;
  isDestinoAnimacao: boolean;
  isTerminoAnimacao?: boolean;
  isMotoMoto?: boolean;
  isEmCapturaAnimacao: boolean;
  tipoBonus?: '1x' | '2x' | null;
  motivoInvalido?: string;
  onEscolher: () => void;
  onHover: (hover: boolean) => void;
}

const CovaCasa: React.FC<CovaCasaProps> = ({
  casa,
  isAdversario,
  posicaoContador = 'topo',
  isSelecionavel,
  isFoco,
  isOrigem,
  isCapturada,
  isCapturadora,
  isOrigemAnimacao,
  isDestinoAnimacao,
  isTerminoAnimacao = false,
  isMotoMoto = false,
  isEmCapturaAnimacao,
  tipoBonus = null,
  motivoInvalido,
  onEscolher,
  onHover,
}) => {
  const isContadorNaBase = posicaoContador === 'base';

  return (
    <div
      className={`flex ${
        isContadorNaBase ? 'flex-col-reverse' : 'flex-col'
      } items-center justify-center p-0 w-full`}
    >
      {/* 1. Contador Circundado de Pedras (Externo, sem parênteses: 0, 1, 2, 3...) */}
      <div
        className={`${
          isContadorNaBase ? 'mt-0.5' : 'mb-0.5'
        } pointer-events-none select-none flex items-center justify-center`}
      >
        <span
          className={`font-mono font-black text-[11px] xs:text-xs sm:text-sm min-w-[20px] xs:min-w-[22px] sm:min-w-[26px] md:min-w-[30px] h-5 xs:h-5.5 sm:h-6 md:h-6.5 px-1.5 rounded-full border shadow-xs transition-colors flex items-center justify-center leading-none ${
            isMotoMoto
              ? 'bg-red-600 text-yellow-200 border-2 border-yellow-300 ring-2 ring-red-400 font-black shadow-lg shadow-red-500/60 scale-105 z-30'
              : isTerminoAnimacao
              ? 'bg-red-600 text-white border-2 border-red-200 ring-2 ring-red-400 font-black shadow-lg shadow-red-500/50 scale-105 z-30'
              : isEmCapturaAnimacao
              ? 'bg-rose-900 text-white border-rose-300'
              : isDestinoAnimacao
              ? 'bg-emerald-400 text-stone-950 border-emerald-200'
              : isOrigemAnimacao
              ? 'bg-yellow-400 text-stone-950 border-2 border-yellow-100 ring-2 ring-yellow-400 font-black shadow-lg shadow-yellow-500/50 scale-105 z-30'
              : isSelecionavel
              ? isAdversario
                ? 'bg-rose-500 text-white border-rose-200 ring-2 ring-rose-400 font-black'
                : 'bg-emerald-400 text-stone-950 border-emerald-100 ring-2 ring-emerald-300 font-black'
              : casa.quantidadeDePedras > 0
              ? isAdversario
                ? 'bg-[#3d1d0e] text-amber-100 border-[#6e3519]'
                : 'bg-[#0f2e16] text-emerald-100 border-[#226132]'
              : 'bg-[#4a2b1a]/85 text-[#c49a84] border-[#663b22]'
          }`}
        >
          {formatarNumeroPedras(casa.quantidadeDePedras)}
        </span>
      </div>

      {/* 2. A Cavidade / Esfera esculpida na madeira com as pedras dentro */}
      <button
        type="button"
        onClick={isSelecionavel ? onEscolher : undefined}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        disabled={!isSelecionavel}
        title={
          isSelecionavel
            ? `${casa.quantidadeDePedras} pedras`
            : motivoInvalido || `${casa.quantidadeDePedras} pedras`
        }
        className={`group relative rounded-full aspect-square w-[94%] xs:w-[95%] max-w-[62px] xs:max-w-[70px] sm:max-w-[82px] md:max-w-[94px] flex items-center justify-center transition-all duration-200 outline-none select-none ${
          isTerminoAnimacao || isMotoMoto
            ? 'cursor-default ring-4 ring-red-500 ring-offset-2 ring-offset-[#9e6438] shadow-2xl shadow-red-500/90 scale-[1.05] z-30 animate-pulse'
            : isEmCapturaAnimacao
            ? 'cursor-default ring-3 ring-rose-500 ring-offset-1 ring-offset-[#9e6438] shadow-2xl animate-capture-pulse z-20'
            : isDestinoAnimacao
            ? 'cursor-default ring-3 ring-emerald-400 ring-offset-1 ring-offset-[#9e6438] shadow-xl scale-[1.02] z-20'
            : isOrigemAnimacao
            ? 'cursor-default ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#9e6438] shadow-2xl shadow-yellow-500/90 scale-[1.05] z-30 animate-pulse'
            : isSelecionavel
            ? isAdversario
              ? 'cursor-pointer ring-3 ring-rose-400 ring-offset-1 ring-offset-[#9e6438] shadow-xl shadow-rose-500/40 hover:scale-[1.02] active:scale-95 animate-pulse'
              : 'cursor-pointer ring-3 ring-emerald-400 ring-offset-1 ring-offset-[#9e6438] shadow-xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 animate-pulse'
            : isCapturada
            ? 'cursor-default ring-2 ring-rose-500 shadow-md'
            : isCapturadora
            ? 'cursor-default ring-2 ring-amber-400 shadow-xl'
            : isFoco
            ? 'cursor-default ring-2 ring-yellow-400 shadow-md'
            : isOrigem
            ? 'cursor-default ring-2 ring-orange-400'
            : 'cursor-not-allowed opacity-90'
        }`}
        style={{
          background: isTerminoAnimacao || isMotoMoto
            ? 'radial-gradient(circle at 45% 35%, #7f1d1d 0%, #991b1b 40%, #b91c1c 75%, #ef4444 100%)'
            : isOrigemAnimacao
            ? 'radial-gradient(circle at 45% 35%, #713f12 0%, #854d0e 40%, #a16207 75%, #eab308 100%)'
            : 'radial-gradient(circle at 45% 35%, #2a150a 0%, #3d1f0e 40%, #562c14 75%, #723c1c 100%)',
          boxShadow: isTerminoAnimacao || isMotoMoto
            ? 'inset 0 5px 12px rgba(0,0,0,0.95), 0 0 20px rgba(239, 68, 68, 0.9)'
            : isOrigemAnimacao
            ? 'inset 0 5px 12px rgba(0,0,0,0.95), 0 0 20px rgba(250, 204, 21, 0.9)'
            : isSelecionavel
            ? 'inset 0 5px 12px rgba(0,0,0,0.95), inset 0 -2px 3px rgba(255,235,200,0.22), 0 0 12px rgba(16, 185, 129, 0.5)'
            : 'inset 0 4px 10px rgba(0,0,0,0.9), inset 0 -2px 3px rgba(255,235,200,0.12), 0 2px 4px rgba(0,0,0,0.4)',
          border: isTerminoAnimacao || isMotoMoto
            ? '3.5px solid #ef4444'
            : isOrigemAnimacao
            ? '3.5px solid #facc15'
            : isSelecionavel
            ? isAdversario ? '2.5px solid #f43f5e' : '2.5px solid #10b981'
            : isDestinoAnimacao
            ? '3px solid #10b981'
            : isEmCapturaAnimacao
            ? '3px solid #f43f5e'
            : '2px solid rgba(120, 60, 25, 0.85)',
        }}
      >
        {/* Indicador Flutuante de Término da Jogada ou MOTO-MOTO em Vermelho */}
        {(isTerminoAnimacao || isMotoMoto) && (
          <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full font-mono font-black text-[10px] sm:text-xs shadow-2xl border-2 whitespace-nowrap animate-bounce flex items-center gap-1 ${
            isMotoMoto
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-yellow-300 ring-2 ring-red-400 shadow-red-500/90 scale-110'
              : 'bg-red-600 text-white border-red-200 ring-2 ring-red-400'
          }`}>
            {isMotoMoto ? (
              <>
                <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse shrink-0" />
                <span className="uppercase tracking-widest font-black text-yellow-100">moto-moto</span>
              </>
            ) : (
              <span>🔴 Terminou</span>
            )}
          </div>
        )}

        {/* Indicador Flutuante da Casa de Onde Leva as Peças em Amarelo */}
        {isOrigemAnimacao && !isTerminoAnimacao && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full bg-yellow-400 text-stone-950 font-mono font-black text-[10px] sm:text-xs shadow-2xl border-2 border-yellow-100 ring-2 ring-yellow-500/60 whitespace-nowrap animate-pulse flex items-center gap-1">
            <span>🟡 Levar</span>
          </div>
        )}

        {/* Indicador Flutuante de Captura com Bónus 1x ou 2x */}
        {isEmCapturaAnimacao && !isTerminoAnimacao && (
          <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full font-mono font-black text-[11px] sm:text-xs shadow-2xl animate-bounce whitespace-nowrap flex items-center gap-1 border-2 ${
            tipoBonus
              ? tipoBonus === '2x'
                ? 'bg-amber-400 text-stone-950 border-amber-200 ring-2 ring-amber-500/80 shadow-amber-500/50'
                : 'bg-emerald-400 text-stone-950 border-emerald-200 ring-2 ring-emerald-500/80 shadow-emerald-500/50'
              : 'bg-rose-600 text-white border-rose-200 ring-2 ring-rose-500/80 shadow-rose-600/60'
          }`}>
            {tipoBonus ? (
              <>
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Captura ({tipoBonus})</span>
              </>
            ) : (
              <span>Captura</span>
            )}
          </div>
        )}

        {/* Indicador Flutuante de Semeadura */}
        {isDestinoAnimacao && !isTerminoAnimacao && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 font-mono font-black text-[10px] shadow-lg animate-float-stone whitespace-nowrap">
            +1
          </div>
        )}

        {/* Pedras Físicas dentro da Cavidade Esférica */}
        <PedrasVisual
          quantidade={casa.quantidadeDePedras}
          isCapturada={isCapturada}
          isDestino={isDestinoAnimacao}
          isSendoCapturada={isEmCapturaAnimacao}
        />
      </button>
    </div>
  );
};

export const TabuleiroNtxuva: React.FC<TabuleiroNtxuvaProps> = ({
  casas,
  jogadorAtual,
  podeIniciarCasa,
  casaEmFoco,
  ultimaCasaEscolhida,
  casasCapturadas = [],
  casaCapturadora = null,
  onEscolherCasa,
  onHoverCasa,
  desabilitado = false,
  passoAtual = null,
  casaOrigemAnimacao = null,
  casaDestinoAnimacao = null,
  casaTerminoAnimacao = null,
  casaMotoMotoAnimacao = null,
  casasEmCapturaAnimacao = [],
  pedrasNaMaoAnimacao = 0,
  onReiniciarPartida,
  onAbrirDefinicoes,
  onSairMenu,
  mostrarStartBanner = false,
  bonus = null,
}) => {
  const mapaCasas = React.useMemo(() => {
    const mapa = new Map<number, Casa>();
    casas.forEach((c) => mapa.set(c.numero, c));
    return mapa;
  }, [casas]);

  const isJogadorA = jogadorAtual === 'Jogador A';
  const isJogadorB = jogadorAtual === 'Jogador B';

  // Efeito dinâmico de trepidação / pulso de impacto no tabuleiro durante a captura de peças
  const [estaTrepidando, setEstaTrepidando] = React.useState(false);
  const [chaveAnimacaoTrepida, setChaveAnimacaoTrepida] = React.useState(0);
  const capturaAnteriorRef = React.useRef<string>('');

  const isCapturaAtiva =
    (casasEmCapturaAnimacao && casasEmCapturaAnimacao.length > 0) ||
    passoAtual?.tipo === 'captura_pedras';

  React.useEffect(() => {
    if (isCapturaAtiva) {
      const chaveAtual = `${casasEmCapturaAnimacao?.join(',')}_${passoAtual?.tipo}`;
      if (chaveAtual !== capturaAnteriorRef.current) {
        capturaAnteriorRef.current = chaveAtual;
        setEstaTrepidando(true);
        setChaveAnimacaoTrepida((c) => c + 1);

        // Feedback háptico (vibração tátil física) em smartphones / Android Play Store
        try {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([40, 25, 45]);
          }
        } catch {
          // Dispositivos sem suporte a vibração ignoram silenciosamente
        }

        const timer = setTimeout(() => {
          setEstaTrepidando(false);
        }, 650);

        return () => clearTimeout(timer);
      }
    } else {
      capturaAnteriorRef.current = '';
    }
  }, [isCapturaAtiva, casasEmCapturaAnimacao, passoAtual]);

  // Efeito adicional de impacto quando um bónus de captura é conquistado
  React.useEffect(() => {
    if (bonus) {
      setEstaTrepidando(true);
      setChaveAnimacaoTrepida((c) => c + 1);
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([50, 30, 60]);
        }
      } catch {}
      const timer = setTimeout(() => setEstaTrepidando(false), 700);
      return () => clearTimeout(timer);
    }
  }, [bonus?.id]);

  const renderCasa = (
    num: number,
    isAdversario: boolean,
    posicaoContador: 'topo' | 'base' = 'topo'
  ) => {
    const casa = mapaCasas.get(num);
    if (!casa) return null;

    const validacao = podeIniciarCasa(num);
    const isSelecionavel = !desabilitado && validacao.valido;

    const tipoBonus = (passoAtual?.tipoBonus && passoAtual?.casasCapturadas?.includes(num))
      ? passoAtual.tipoBonus
      : (bonus?.casas.includes(num) ? bonus.tipo : null);

    const isEstaCasaMotoMoto =
      casaMotoMotoAnimacao === num ||
      (passoAtual?.isMotoMoto === true && (casaTerminoAnimacao === num || casaDestinoAnimacao === num || passoAtual.casa === num));

    return (
      <CovaCasa
        key={num}
        casa={casa}
        isAdversario={isAdversario}
        posicaoContador={posicaoContador}
        isJogadorAtual={isAdversario ? isJogadorB : isJogadorA}
        isSelecionavel={isSelecionavel}
        isFoco={casaEmFoco === num}
        isOrigem={ultimaCasaEscolhida === num}
        isCapturada={casasCapturadas.includes(num)}
        isCapturadora={casaCapturadora === num}
        isOrigemAnimacao={casaOrigemAnimacao === num}
        isDestinoAnimacao={casaDestinoAnimacao === num}
        isTerminoAnimacao={casaTerminoAnimacao === num}
        isMotoMoto={isEstaCasaMotoMoto}
        isEmCapturaAnimacao={casasEmCapturaAnimacao.includes(num)}
        tipoBonus={tipoBonus}
        motivoInvalido={validacao.motivo}
        onEscolher={() => onEscolherCasa?.(num)}
        onHover={(hover) => onHoverCasa?.(hover ? num : null)}
      />
    );
  };

  return (
    <div className="w-full flex items-center justify-center my-0 sm:my-1 relative">
      {/* Moldura de Madeira Artesanal do Tabuleiro com Trepidação e Pulso de Impacto nas Capturas */}
      <div
        key={chaveAnimacaoTrepida > 0 ? `tabuleiro-impacto-${chaveAnimacaoTrepida}` : 'tabuleiro-base'}
        className={`w-full max-w-[500px] xs:max-w-[560px] sm:max-w-[680px] md:max-w-[800px] mx-auto rounded-2xl sm:rounded-3xl p-1.5 xs:p-2 sm:p-2.5 md:p-3 shadow-2xl relative border-2 sm:border-4 transition-colors duration-200 ${
          estaTrepidando
            ? 'animate-board-tremor ring-4 ring-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.7)]'
            : ''
        }`}
        style={{
          backgroundColor: '#9e6438',
          backgroundImage: `
            radial-gradient(circle at 20% 15%, rgba(255,240,215,0.25) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(70,30,10,0.2) 0%, transparent 55%),
            linear-gradient(135deg, #b87e4e 0%, #a56a3b 35%, #945b2e 70%, #824d23 100%)
          `,
          borderColor: estaTrepidando ? '#f43f5e' : '#c68d5c',
          boxShadow: estaTrepidando
            ? undefined
            : '0 20px 45px -10px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(60,25,5,0.45)',
        }}
      >
        {/* Onda de choque / Pulso de impacto ao redor do tabuleiro quando ocorre captura de peças */}
        {estaTrepidando && (
          <div
            key={`onda-choque-${chaveAnimacaoTrepida}`}
            className="absolute -inset-2 sm:-inset-3.5 rounded-2xl sm:rounded-[30px] border-2 sm:border-4 border-rose-500/90 pointer-events-none animate-board-shockwave z-40 shadow-[0_0_30px_rgba(244,63,94,0.7)]"
          />
        )}

        {/* CABEÇALHO DO CAMPO: ADVERSÁRIO */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent flex-1" />
          <span className="text-[10px] sm:text-xs font-mono font-black tracking-widest text-rose-100 bg-[#42170d]/90 px-2 py-0.5 rounded-full border border-rose-500/40 uppercase flex items-center gap-1 shadow-xs">
            <span>ADVERSÁRIO</span>
          </span>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent flex-1" />
        </div>

        {/* CAMPO UNIDO DO ADVERSÁRIO (2 Linhas unidas em bloco coeso sem distância interna) */}
        <div className="space-y-0 bg-[#421b0e]/25 p-1 sm:p-1.5 rounded-xl border border-[#783c18]/30 shadow-inner">
          {/* Linha 1 (Externa do Adversário): 24 ← 19 - Contador no Topo */}
          <div className="grid grid-cols-6 gap-0.5 xs:gap-1 sm:gap-1.5">
            {GEOMETRIA_TABULEIRO.adversario.linhaExterna.map((num) =>
              renderCasa(num, true, 'topo')
            )}
          </div>

          {/* Linha 2 (Interna do Adversário): 13 → 18 - Contador na Base (covas encostadas na Linha 1) */}
          <div className="grid grid-cols-6 gap-0.5 xs:gap-1 sm:gap-1.5 -mt-0.5">
            {GEOMETRIA_TABULEIRO.adversario.linhaInterna.map((num) =>
              renderCasa(num, true, 'base')
            )}
          </div>
        </div>

        {/* DIVISÃO CENTRAL ENTALHADA NO TABULEIRO (EIXO CENTRAL: A MAIOR DISTÂNCIA DO TABULEIRO) */}
        <div className="my-1 sm:my-2.5 relative flex items-center justify-center select-none">
          <div
            className="w-full h-1.5 sm:h-2 rounded-full border-t border-b"
            style={{
              borderColor: '#5c3115',
              backgroundColor: '#3d1f0c',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.85), 0 1px 2px rgba(255,255,255,0.25)',
            }}
          />
          {bonus ? (
            <div className={`absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border-2 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-xl whitespace-nowrap flex items-center gap-1.5 animate-bounce z-30 ${
              bonus.tipo === '2x'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 border-white ring-2 ring-amber-500 shadow-amber-500/60'
                : 'bg-gradient-to-r from-emerald-400 to-teal-300 text-stone-950 border-white ring-2 ring-emerald-500 shadow-emerald-500/60'
            }`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>🎉 PARABÉNS: BÓNUS {bonus.tipo}!</span>
            </div>
          ) : casasEmCapturaAnimacao.length > 0 || passoAtual?.tipo === 'captura_pedras' ? (
            <div className="absolute left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white border-2 border-rose-200 ring-2 ring-rose-500/80 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-xl shadow-rose-900/60 whitespace-nowrap flex items-center gap-1.5 animate-bounce z-30">
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span>⚔️ CAPTURA!</span>
            </div>
          ) : casaMotoMotoAnimacao !== null || passoAtual?.isMotoMoto ? (
            <div className="absolute left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-2 border-yellow-300 ring-2 ring-red-400 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-xl shadow-red-950/70 whitespace-nowrap flex items-center gap-1.5 animate-bounce z-30">
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
              <span>🔥 REGRA DE MOTO-MOTO!</span>
            </div>
          ) : casaOrigemAnimacao !== null ? (
            <div className="absolute left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-400 text-stone-950 border border-yellow-200 ring-1 ring-yellow-500 text-[9px] sm:text-[10px] font-mono font-black tracking-wider uppercase shadow-md whitespace-nowrap flex items-center gap-1 animate-pulse z-20">
              <span>🟡 A LEVAR PEÇAS</span>
            </div>
          ) : casaTerminoAnimacao !== null ? (
            <div className="absolute left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-600 text-white border border-red-200 ring-1 ring-red-400 text-[9px] sm:text-[10px] font-mono font-black tracking-wider uppercase shadow-md whitespace-nowrap flex items-center gap-1 animate-pulse z-20">
              <span>🔴 FIM DA JOGADA</span>
            </div>
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#522912] border border-[#7e431f] text-[8px] sm:text-[10px] font-mono font-black tracking-widest uppercase text-amber-200 shadow-md whitespace-nowrap">
              EIXO CENTRAL
            </div>
          )}
        </div>

        {/* CAMPO UNIDO DO JOGADOR (2 Linhas unidas em bloco coeso sem distância interna) */}
        <div className="space-y-0 bg-[#143319]/20 p-1 sm:p-1.5 rounded-xl border border-[#23582d]/30 shadow-inner">
          {/* Linha 3 (Interna do Jogador): 6 ← 1 - Contador no Topo */}
          <div className="grid grid-cols-6 gap-0.5 xs:gap-1 sm:gap-1.5">
            {GEOMETRIA_TABULEIRO.jogador.linhaInterna.map((num) =>
              renderCasa(num, false, 'topo')
            )}
          </div>

          {/* Linha 4 (Externa do Jogador): 7 → 12 - Contador na Base (covas encostadas na Linha 3) */}
          <div className="grid grid-cols-6 gap-0.5 xs:gap-1 sm:gap-1.5 -mt-0.5">
            {GEOMETRIA_TABULEIRO.jogador.linhaExterna.map((num) =>
              renderCasa(num, false, 'base')
            )}
          </div>
        </div>

        {/* RODAPÉ DO CAMPO: JOGADOR */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent flex-1" />
          <span className="text-[10px] sm:text-xs font-mono font-black tracking-widest text-emerald-100 bg-[#0e3318]/90 px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase flex items-center gap-1 shadow-xs">
            <span>JOGADOR</span>
          </span>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent flex-1" />
        </div>

        {/* BANNER GIGANTE E DRAMÁTICO 'START' AO INICIAR/REINICIAR */}
        {mostrarStartBanner && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none select-none bg-black/45 backdrop-blur-[2px] rounded-2xl sm:rounded-3xl animate-start-banner-fade">
            <div className="flex flex-col items-center justify-center animate-start-banner">
              <span className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-widest uppercase bg-gradient-to-b from-yellow-100 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_12px_25px_rgba(0,0,0,0.95)]">
                START
              </span>
              <span className="mt-2 px-4 py-0.5 rounded-full bg-[#3d1f0c]/95 border-2 border-amber-400/90 text-xs sm:text-sm font-mono font-black text-amber-200 tracking-wider shadow-2xl uppercase">
                {jogadorAtual === 'Jogador A' ? 'Inicia o Jogador' : 'Inicia o Adversário'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
