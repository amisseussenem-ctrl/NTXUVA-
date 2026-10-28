import React, { useState } from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  LayoutGrid, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  ArrowDown, 
  ArrowUp,
  Info,
  ShieldAlert,
  Swords,
  Layers,
} from 'lucide-react';
import { PedrasVisual, formatarNumeroPedras, GEOMETRIA_TABULEIRO } from './TabuleiroNtxuva';

interface CasaIlustradaInfo {
  pedras: number;
  destaque?: 'verde' | 'vermelho' | 'amarelo' | 'azul' | 'neutro';
  badge?: string;
  icone?: 'check' | 'cross' | 'attack' | 'target' | 'none';
  animada?: boolean;
}

interface MiniTabuleiroProps {
  casasData: Record<number, CasaIlustradaInfo>;
  mostrarCircuitoAntiHorario?: boolean;
  mostrarCapturaExemplo?: boolean;
  legenda?: string;
}

/**
 * Tabuleiro Real do Ntxuva idêntico ao tabuleiro do jogo,
 * esculpido em madeira com as mesmas covas, pedras físicas (quartzo e ardósia)
 * e o entalhe oficial do Eixo Central.
 */
export const MiniTabuleiroNtxuva: React.FC<MiniTabuleiroProps> = ({
  casasData,
  mostrarCircuitoAntiHorario = false,
  mostrarCapturaExemplo = false,
  legenda,
}) => {
  const renderCova = (
    num: number,
    isAdversario: boolean,
    posicaoContador: 'topo' | 'base' = 'topo'
  ) => {
    const info = casasData[num] || { pedras: 0 };
    const { pedras, destaque, badge, icone, animada } = info;
    const isContadorNaBase = posicaoContador === 'base';

    let borderStyle = 'border-[2px] border-[rgba(120,60,25,0.85)]';
    let ringStyle = '';
    let contadorClass = isAdversario
      ? pedras > 0
        ? 'bg-[#3d1d0e] text-amber-100 border-[#6e3519]'
        : 'bg-[#4a2b1a]/85 text-[#c49a84] border-[#663b22]'
      : pedras > 0
      ? 'bg-[#0f2e16] text-emerald-100 border-[#226132]'
      : 'bg-[#4a2b1a]/85 text-[#c49a84] border-[#663b22]';

    if (destaque === 'verde') {
      borderStyle = 'border-[2.5px] border-emerald-400';
      ringStyle = 'ring-2 ring-emerald-400/80 ring-offset-1 ring-offset-[#9e6438] shadow-lg shadow-emerald-500/40';
      contadorClass = 'bg-emerald-400 text-stone-950 border-emerald-100 ring-2 ring-emerald-300 font-black';
    } else if (destaque === 'vermelho') {
      borderStyle = 'border-[2.5px] border-rose-500';
      ringStyle = 'ring-2 ring-rose-500/80 ring-offset-1 ring-offset-[#9e6438] shadow-lg shadow-rose-500/40';
      contadorClass = 'bg-rose-500 text-white border-rose-200 ring-2 ring-rose-400 font-black';
    } else if (destaque === 'amarelo') {
      borderStyle = 'border-[2.5px] border-amber-400';
      ringStyle = 'ring-2 ring-amber-400/80 ring-offset-1 ring-offset-[#9e6438] shadow-lg shadow-amber-500/40';
      contadorClass = 'bg-amber-400 text-stone-950 border-amber-300 font-black';
    }

    return (
      <div
        key={num}
        className={`flex ${
          isContadorNaBase ? 'flex-col-reverse' : 'flex-col'
        } items-center justify-center p-0 w-full relative`}
      >
        {/* Contador Circundado de Pedras (Idêntico ao jogo) */}
        <div
          className={`${
            isContadorNaBase ? 'mt-0.5' : 'mb-0.5'
          } pointer-events-none select-none flex items-center gap-1 justify-center z-10`}
        >
          <span
            className={`font-mono font-black text-[10px] sm:text-xs min-w-[20px] sm:min-w-[24px] h-4.5 sm:h-5.5 px-1.5 rounded-full border shadow-xs flex items-center justify-center leading-none ${contadorClass}`}
          >
            {formatarNumeroPedras(pedras)}
          </span>
          <span className="text-[9px] font-mono font-bold text-amber-200/70">
            #{num}
          </span>
        </div>

        {/* Cavidade Esférica Esculpida em Madeira com Pedras Físicas Reais do Jogo */}
        <div
          className={`relative rounded-full aspect-square w-[90%] max-w-[50px] sm:max-w-[62px] flex items-center justify-center transition-all duration-200 select-none ${borderStyle} ${ringStyle} ${
            animada ? 'animate-pulse' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle at 45% 35%, #2a150a 0%, #3d1f0e 40%, #562c14 75%, #723c1c 100%)',
            boxShadow:
              destaque === 'verde'
                ? 'inset 0 4px 10px rgba(0,0,0,0.95), inset 0 -2px 3px rgba(255,235,200,0.22), 0 0 10px rgba(16, 185, 129, 0.5)'
                : destaque === 'vermelho'
                ? 'inset 0 4px 10px rgba(0,0,0,0.95), inset 0 -2px 3px rgba(255,235,200,0.22), 0 0 10px rgba(244, 63, 94, 0.5)'
                : 'inset 0 4px 8px rgba(0,0,0,0.9), inset 0 -2px 3px rgba(255,235,200,0.12), 0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          {/* As Mesmas Pedras Orgânicas de Quartzo e Ardósia do Jogo */}
          <PedrasVisual
            quantidade={pedras}
            isCapturada={destaque === 'vermelho'}
            isSendoCapturada={icone === 'target'}
          />

          {/* Ícones de Validação */}
          {icone === 'check' && (
            <div className="absolute -top-1.5 -right-1.5 z-20 bg-emerald-500 rounded-full p-0.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
            </div>
          )}
          {icone === 'cross' && (
            <div className="absolute -top-1.5 -right-1.5 z-20 bg-rose-600 rounded-full p-0.5 shadow-md">
              <XCircle className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          {icone === 'attack' && (
            <div className="absolute -top-2 -right-1.5 z-20 bg-amber-400 rounded-full p-0.5 shadow-md animate-bounce">
              <Swords className="w-3.5 h-3.5 text-stone-950" />
            </div>
          )}

          {/* Badge Informativa sobre a Cova */}
          {badge && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0.5 rounded-full bg-black/85 border border-amber-500/60 text-amber-200 font-mono font-black text-[7px] sm:text-[8px] whitespace-nowrap shadow-md">
              {badge}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 select-none">
      {/* Moldura de Madeira do Tabuleiro do Jogo */}
      <div
        className="w-full max-w-[560px] sm:max-w-[620px] rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl relative border-2 sm:border-4"
        style={{
          backgroundColor: '#9e6438',
          backgroundImage: `
            radial-gradient(circle at 20% 15%, rgba(255,240,215,0.25) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(70,30,10,0.2) 0%, transparent 55%),
            linear-gradient(135deg, #b87e4e 0%, #a56a3b 35%, #945b2e 70%, #824d23 100%)
          `,
          borderColor: '#c68d5c',
          boxShadow:
            '0 15px 35px -5px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(60,25,5,0.45)',
        }}
      >
        {/* CABEÇALHO DO CAMPO: ADVERSÁRIO */}
        <div className="w-full flex items-center justify-center gap-2 mb-1">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent flex-1" />
          <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-rose-100 bg-[#42170d]/90 px-2 py-0.5 rounded-full border border-rose-500/40 uppercase flex items-center gap-1 shadow-xs">
            <span>🔴 ADVERSÁRIO (Jogador B)</span>
          </span>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent flex-1" />
        </div>

        {/* CAMPO UNIDO DO ADVERSÁRIO (Linhas 1 e 2) */}
        <div className="space-y-0 bg-[#421b0e]/25 p-1 sm:p-1.5 rounded-xl border border-[#783c18]/30 shadow-inner relative">
          {/* Linha 1 (Externa / Defesa): 24 ← 19 */}
          <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
            {GEOMETRIA_TABULEIRO.adversario.linhaExterna.map((num) =>
              renderCova(num, true, 'topo')
            )}
          </div>

          {/* Linha 2 (Interna / Ataque): 13 → 18 */}
          <div className="grid grid-cols-6 gap-0.5 sm:gap-1 -mt-0.5">
            {GEOMETRIA_TABULEIRO.adversario.linhaInterna.map((num) =>
              renderCova(num, true, 'base')
            )}
          </div>
        </div>

        {/* EIXO CENTRAL DE CONFRONTO COM ENTALHE NA MADEIRA */}
        <div className="my-2.5 sm:my-3.5 relative flex items-center justify-center select-none">
          <div
            className="w-full h-1.5 sm:h-2 rounded-full border-t border-b"
            style={{
              borderColor: '#5c3115',
              backgroundColor: '#3d1f0c',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.85), 0 1px 2px rgba(255,255,255,0.25)',
            }}
          />
          <div className="absolute left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#522912] border border-[#7e431f] text-[8px] sm:text-[9px] font-mono font-black tracking-widest uppercase text-amber-200 shadow-md whitespace-nowrap flex items-center gap-1">
            <Swords className="w-3 h-3 text-amber-400" />
            <span>EIXO CENTRAL (CONFRONTO)</span>
          </div>
        </div>

        {/* CAMPO UNIDO DO JOGADOR (Linhas 3 e 4) */}
        <div className="space-y-0 bg-[#143319]/20 p-1 sm:p-1.5 rounded-xl border border-[#23582d]/30 shadow-inner relative">
          {/* Indicador de Setas do Sentido Anti-Horário no Próprio Tabuleiro */}
          {mostrarCircuitoAntiHorario && (
            <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-1">
              {/* Seta para a Esquerda na Linha de Ataque (1 → 6) */}
              <div className="flex items-center justify-center">
                <div className="bg-emerald-950/90 text-emerald-300 border-2 border-emerald-400 px-3 py-1 rounded-full font-mono font-black text-[10px] sm:text-xs flex items-center gap-1.5 shadow-xl animate-pulse">
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>LINHA DE ATAQUE: MOVE PARA A ESQUERDA (1 → 6)</span>
                </div>
              </div>

              {/* Seta para a Direita na Linha de Defesa (7 → 12) */}
              <div className="flex items-center justify-center">
                <div className="bg-emerald-950/90 text-emerald-300 border-2 border-emerald-400 px-3 py-1 rounded-full font-mono font-black text-[10px] sm:text-xs flex items-center gap-1.5 shadow-xl animate-pulse">
                  <span>LINHA DE DEFESA: MOVE PARA A DIREITA (7 → 12)</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          )}

          {/* Linha 3 (Interna / Ataque): 6 ← 1 */}
          <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
            {GEOMETRIA_TABULEIRO.jogador.linhaInterna.map((num) =>
              renderCova(num, false, 'topo')
            )}
          </div>

          {/* Linha 4 (Externa / Defesa): 7 → 12 */}
          <div className="grid grid-cols-6 gap-0.5 sm:gap-1 -mt-0.5">
            {GEOMETRIA_TABULEIRO.jogador.linhaExterna.map((num) =>
              renderCova(num, false, 'base')
            )}
          </div>
        </div>

        {/* RODAPÉ DO CAMPO: TEU TERRITÓRIO */}
        <div className="w-full flex items-center justify-center gap-2 mt-1">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent flex-1" />
          <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-emerald-100 bg-[#0d2a17]/90 px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase flex items-center gap-1 shadow-xs">
            <span>🟢 TEU TERRITÓRIO (Jogador A)</span>
          </span>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent flex-1" />
        </div>
      </div>

      {/* Legenda explicativa sob o tabuleiro */}
      {legenda && (
        <div className="w-full max-w-[560px] sm:max-w-[620px] mt-2 p-2 sm:p-2.5 rounded-xl bg-[#1c1008] border border-amber-600/40 text-[11px] font-mono text-amber-200 shadow-md">
          {legenda}
        </div>
      )}
    </div>
  );
};

export const RegrasIlustradas: React.FC<{ onFechar?: () => void }> = ({ onFechar }) => {
  const [abaAtiva, setAbaAtiva] = useState<
    'todos' | 'tabuleiro' | 'sentido' | 'inicio' | 'continuidade' | 'giros' | 'captura' | 'bonus' | 'vitoria'
  >('todos');

  // Dados para Ilustração 1: Tabuleiro Inicial Padrão (2 pedras físicas em cada casa)
  const dadosTabuleiroInicial: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosTabuleiroInicial[i] = { pedras: 2 };
  }

  // Dados para Ilustração 2: Sentido Anti-Horário
  const dadosSentidoAntiHorario: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosSentidoAntiHorario[i] = { pedras: 2 };
  }
  dadosSentidoAntiHorario[1] = { pedras: 2, destaque: 'verde', badge: '1. Início' };
  dadosSentidoAntiHorario[6] = { pedras: 2, destaque: 'verde', badge: '6. Desce ↓' };
  dadosSentidoAntiHorario[7] = { pedras: 2, destaque: 'verde', badge: '7. Trás' };
  dadosSentidoAntiHorario[12] = { pedras: 2, destaque: 'verde', badge: '12. Sobe ↑' };

  // Dados para Ilustração 3: Regra de Início (Casas 2+ vs 1 pedra)
  const dadosRegraInicio: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosRegraInicio[i] = { pedras: 2 };
  }
  dadosRegraInicio[3] = { pedras: 3, destaque: 'verde', icone: 'check', badge: 'Pode Iniciar (3)' };
  dadosRegraInicio[5] = { pedras: 2, destaque: 'verde', icone: 'check', badge: 'Pode Iniciar (2)' };
  dadosRegraInicio[2] = { pedras: 1, destaque: 'vermelho', icone: 'cross', badge: 'Proibido (1 só)' };
  dadosRegraInicio[1] = { pedras: 0, destaque: 'neutro', badge: 'Vazia (0)' };

  // Dados para Ilustração 4: Semeadura e Continuidade
  const dadosContinuidade: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosContinuidade[i] = { pedras: 0 };
  }
  dadosContinuidade[1] = { pedras: 0, destaque: 'amarelo', badge: 'Origem (saiu 3)' };
  dadosContinuidade[2] = { pedras: 1, destaque: 'verde', badge: '+1 pedra' };
  dadosContinuidade[3] = { pedras: 1, destaque: 'verde', badge: '+1 pedra' };
  dadosContinuidade[4] = { pedras: 3, destaque: 'verde', badge: 'Caiu aqui (Continua!)', animada: true };

  // Dados para Ilustração 5: Regra Tradicional dos 5 Giros
  const dadosRegra5Giros: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosRegra5Giros[i] = { pedras: 0 };
  }
  dadosRegra5Giros[2] = { pedras: 4, destaque: 'verde', icone: 'check', badge: 'Origem & 5º Giro', animada: true };
  dadosRegra5Giros[3] = { pedras: 1, destaque: 'verde', badge: '12 casas ↺' };
  dadosRegra5Giros[6] = { pedras: 1, destaque: 'verde', badge: '12 casas ↺' };
  dadosRegra5Giros[7] = { pedras: 1, destaque: 'verde', badge: '12 casas ↺' };
  dadosRegra5Giros[12] = { pedras: 1, destaque: 'verde', badge: '12 casas ↺' };
  dadosRegra5Giros[1] = { pedras: 1, destaque: 'verde', badge: '12 casas ↺' };
  dadosRegra5Giros[16] = { pedras: 2, destaque: 'neutro', badge: 'Adversário' };
  dadosRegra5Giros[17] = { pedras: 2, destaque: 'neutro', badge: 'Adversário' };

  // Dados para Ilustração 6: Captura das 3 Condições
  const dadosCaptura: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosCaptura[i] = { pedras: 0 };
  }
  // Jogador A cai na casa 3 (Ataque de A) que estava vazia
  dadosCaptura[3] = { pedras: 1, destaque: 'verde', icone: 'attack', badge: 'Caiu em Casa Vazia' };
  // Adversário na frente (Casa 16 - Ataque de B) tem pedras
  dadosCaptura[16] = { pedras: 3, destaque: 'vermelho', icone: 'target', badge: '1ª Captura (Come 3!)', animada: true };
  // Adversário atrás (Casa 21 - Defesa de B) tem pedras
  dadosCaptura[21] = { pedras: 2, destaque: 'vermelho', icone: 'target', badge: '2ª Captura (Come 2!)', animada: true };
  // Algumas pedras em outras casas para contexto
  dadosCaptura[1] = { pedras: 2 };
  dadosCaptura[6] = { pedras: 2 };
  dadosCaptura[14] = { pedras: 2 };

  // Dados para Ilustração 7: Bónus de Jogadas Adicionais (1x e 2x)
  const dadosBonus: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosBonus[i] = { pedras: 0 };
  }
  dadosBonus[3] = { pedras: 1, destaque: 'verde', icone: 'attack', badge: 'Caiu aqui' };
  dadosBonus[16] = { pedras: 11, destaque: 'vermelho', icone: 'target', badge: '≥ 10 pedras = 1x Bónus!', animada: true };
  dadosBonus[21] = { pedras: 9, destaque: 'vermelho', icone: 'target', badge: 'Total 20 = 2x Bónus!', animada: true };
  dadosBonus[1] = { pedras: 2 };
  dadosBonus[6] = { pedras: 2 };

  // Dados para Ilustração 8: Vitória por Asfixia (Afogamento)
  const dadosAsfixia: Record<number, CasaIlustradaInfo> = {};
  for (let i = 1; i <= 24; i++) {
    dadosAsfixia[i] = { pedras: 0 };
  }
  // Jogador A tem casas normais com 2 ou mais pedras
  dadosAsfixia[1] = { pedras: 3, destaque: 'verde' };
  dadosAsfixia[6] = { pedras: 2, destaque: 'verde' };
  dadosAsfixia[9] = { pedras: 2, destaque: 'verde' };
  // Jogador B só tem casas de 1 pedra (bloqueado sem movimento)
  dadosAsfixia[13] = { pedras: 1, destaque: 'vermelho', icone: 'cross', badge: '1 pedra só' };
  dadosAsfixia[20] = { pedras: 1, destaque: 'vermelho', icone: 'cross', badge: '1 pedra só' };

  return (
    <div className="space-y-5 text-stone-100 font-mono text-xs">
      {/* Barra de Navegação por Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setAbaAtiva('todos')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'todos'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          📖 Todas as Regras
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('tabuleiro')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'tabuleiro'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          1. Tabuleiro
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('sentido')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'sentido'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          2. Sentido ↺
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('inicio')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'inicio'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          3. Onde Iniciar
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('continuidade')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'continuidade'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          4. Continuidade
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('giros')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            abaAtiva === 'giros'
              ? 'bg-amber-400 text-stone-950 shadow-md font-black ring-2 ring-amber-300'
              : 'bg-[#2f190c] hover:bg-[#3d2110] text-amber-300 border border-amber-500/50'
          }`}
        >
          <span>🔥 5. Regra de Moto-Moto</span>
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('captura')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'captura'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          6. Capturas
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('bonus')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            abaAtiva === 'bonus'
              ? 'bg-amber-400 text-stone-950 shadow-md font-black ring-2 ring-amber-300'
              : 'bg-[#2f190c] hover:bg-[#3d2110] text-amber-300 border border-amber-500/50'
          }`}
        >
          <span>🎁 7. Bónus 1x e 2x</span>
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('vitoria')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            abaAtiva === 'vitoria'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'bg-[#29170c] hover:bg-[#382012] text-stone-300'
          }`}
        >
          8. Vitória & Asfixia
        </button>
      </div>

      <div className="space-y-4">
        {/* ──────────────────────────────────────────────────────────
            1. O TABULEIRO E A POSIÇÃO INICIAL
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'tabuleiro') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border border-amber-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-[#3b2214] pb-1.5">
              <LayoutGrid className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-xs sm:text-sm uppercase tracking-wider">
                1. O Tabuleiro & Posição Inicial (48 Pedras)
              </h4>
            </div>

            <div className="text-[11px] text-stone-300 space-y-1">
              <div>• <strong>4 linhas de 6 covas:</strong> Total de 24 casas no tabuleiro.</div>
              <div>• <strong>2 pedras por cova:</strong> Cada jogador começa com 24 pedras (48 no total).</div>
              <div>• <strong>Território:</strong> Controlas 2 linhas: <strong>Ataque</strong> (frente, junto ao Eixo Central) e <strong>Defesa</strong> (trás).</div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 1 */}
            <MiniTabuleiroNtxuva
              casasData={dadosTabuleiroInicial}
              legenda="Tabuleiro do Jogo: Cada jogador controla 2 linhas com 2 pedras por cova (48 no total)."
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            2. SENTIDO OBRIGATÓRIO: ANTI-HORÁRIO (↺)
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'sentido') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border border-amber-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-[#3b2214] pb-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-xs sm:text-sm uppercase tracking-wider">
                2. Sentido Anti-Horário (↺)
              </h4>
            </div>

            <div className="text-[11px] text-stone-300 space-y-1">
              <div>• <strong>Sentido Único:</strong> O movimento é sempre <strong>anti-horário (↺)</strong> no teu campo (nunca recua).</div>
              <div>• <strong>Frente (Ataque):</strong> Move para a <strong>Esquerda (1 → 6)</strong>.</div>
              <div>• <strong>Trás (Defesa):</strong> Desce na curva e move para a <strong>Direita (7 → 12)</strong>, subindo de volta à casa 1.</div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 2 */}
            <MiniTabuleiroNtxuva
              casasData={dadosSentidoAntiHorario}
              mostrarCircuitoAntiHorario={true}
              legenda="Circuito Anti-Horário: 1 → 6 (Esquerda na Frente) ➔ Desce ➔ 7 → 12 (Direita Atrás) ➔ Sobe à casa 1."
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            3. ONDE INICIAR: REGRA DE 2 OU MAIS PEDRAS
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'inicio') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border border-amber-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-[#3b2214] pb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs sm:text-sm uppercase tracking-wider">
                3. Onde Iniciar (Regra de 2+ Pedras)
              </h4>
            </div>

            <div className="text-[11px] text-stone-300 space-y-1">
              <div className="text-emerald-300 font-bold">
                ✓ Permitido: Só podes iniciar jogadas em covas com 2 ou mais pedras.
              </div>
              <div className="text-rose-300 font-bold">
                ✕ Proibido: Covas com apenas 1 pedra ou vazias não podem ser iniciadas!
              </div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 3 */}
            <MiniTabuleiroNtxuva
              casasData={dadosRegraInicio}
              legenda="Casas com 2 ou 3 pedras têm anel Verde ✓ (podes jogar). Casas com 1 pedra têm anel Vermelho ✕ (proibido)."
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            4. SEMEADURA E REGRA DA CONTINUIDADE
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'continuidade') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border border-amber-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-[#3b2214] pb-1.5">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-xs sm:text-sm uppercase tracking-wider">
                4. Semeadura & Regra da Continuidade
              </h4>
            </div>

            <div className="text-[11px] text-stone-300 space-y-1">
              <div>• <strong>Semeadura:</strong> Retiras todas as pedras da casa escolhida e deixas <strong>1 pedra em cada cova seguinte</strong>.</div>
              <div>• <strong>Caiu em cova com pedras:</strong> Apanhas tudo e <strong>continuas a semear</strong>!</div>
              <div>• <strong>Caiu em cova vazia:</strong> O teu turno termina e passa a vez (a não ser que haja captura).</div>
              <div className="mt-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10.5px] text-amber-200">
                🔥 <strong>Regra de Moto-Moto (5 Giros):</strong> Uma jogada não pode exceder 5 voltas/giros completos sem captura à frente. Se não houver captura adiante, a jogada encerra na casa onde completa o 5º giro (surge a palavra "moto-moto"), a casa fica vermelha parando 1 segundo e depois é o adversário a jogar. Se houver captura à frente, continua até capturar!
              </div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 4 */}
            <MiniTabuleiroNtxuva
              casasData={dadosContinuidade}
              legenda="Casa 1 tinha 3 pedras. Semeou na 2 e na 3. Como a última caiu na Casa 4 (que tinha pedras), apanha tudo e continua!"
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            5. REGRA DE MOTO-MOTO (5 GIROS COMPLETOS)
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'giros') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border-2 border-amber-500/80 space-y-3 shadow-xl ring-1 ring-amber-400/40">
            <div className="flex items-center justify-between border-b border-[#3b2214] pb-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="text-xs sm:text-sm uppercase tracking-wider font-black text-amber-300">
                  5. Regra de Moto-Moto (5 Giros Completos)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                Regra Oficial
              </span>
            </div>

            <div className="text-[11px] text-stone-200 space-y-2 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100">
                <strong>O que é 1 Giro Completo?</strong> É você sair de uma casa (exemplo: <strong>Casa 2</strong>), percorrer as restantes casas do seu território (3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1) e retornar à <strong>Casa 2</strong>. Esse trajeto de 12 passos constitui exatamente <strong>1 giro completo</strong>.
              </div>

              <div className="space-y-1.5 pl-1">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 font-black shrink-0">1.</span>
                  <div>
                    <strong>Limite de 5 Giros (Moto-Moto):</strong> Uma mesma jogada não pode exceder 5 giros completos se não houver captura pela frente. Não importa se no meio do caminho você recolhe pedras por revezamento noutra casa.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-black shrink-0">2.</span>
                  <div>
                    <strong>Se NÃO houver captura à frente:</strong> A jogada <strong>encerra na casa onde completa o 5º giro</strong>. Quando vai deixar as pedras nessa casa, surge a palavra <strong>"moto-moto"</strong>, a casa fica de <strong>cor vermelha parando 1 segundo</strong> e depois é o adversário a jogar!
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black shrink-0">3.</span>
                  <div>
                    <strong>Se HOUVER captura à frente:</strong> A jogada continua além dos 5 giros até alcançar e capturar as pedras adversárias!
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-amber-300 font-black shrink-0">4.</span>
                  <div>
                    <strong>Reinício da Contagem:</strong> Depois de capturar as peças do adversário e colocá-las na mão, a contagem de giros reinicia do zero para a nova distribuição.
                  </div>
                </div>
              </div>
            </div>

            {/* TABULEIRO ILUSTRADO DOS 5 GIROS */}
            <MiniTabuleiroNtxuva
              casasData={dadosRegra5Giros}
              legenda="Exemplo da Regra de Moto-Moto: Saindo da Casa 2 e percorrendo 12 casas até voltar à Casa 2 = 1 giro completo. Ao completar o 5º giro sem captura à frente, surge 'moto-moto', a Casa 2 fica vermelha por 1 segundo e depois é o adversário a jogar."
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            6. COMO CAPTURAR / COMER PEDRAS (3 CONDIÇÕES)
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'captura') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border border-amber-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-[#3b2214] pb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-xs sm:text-sm uppercase tracking-wider">
                6. Como Capturar / Comer Pedras
              </h4>
            </div>

            <div className="text-[11px] text-stone-300 space-y-1">
              <div>Para capturar as pedras adversárias, cumprem-se <strong>3 condições simultâneas</strong>:</div>
              <div className="pl-2 border-l-2 border-amber-500/50 space-y-0.5 text-amber-200">
                <div><strong>1.</strong> A tua última pedra cai numa <strong>cova vazia</strong>;</div>
                <div><strong>2.</strong> Essa cova fica na tua <strong>linha de Ataque</strong> (frente);</div>
                <div><strong>3.</strong> A cova adversária em frente <strong>tem pedras</strong>!</div>
              </div>
              <div className="text-emerald-300 pt-1">
                ⭐ <strong>Captura Dupla:</strong> Se a cova de defesa do adversário atrás também tiver pedras, <strong>comes ambas</strong> e continuas a semear com elas!
              </div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 6 */}
            <MiniTabuleiroNtxuva
              casasData={dadosCaptura}
              legenda="A última pedra caiu na Casa 3 (Ataque). O jogador come as 3 pedras da Casa 16 E as 2 pedras da Casa 21 (total 5 pedras), e continua a semear."
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            7. REGRA ESPECIAL DE BÓNUS: 1x E 2x DE JOGAR
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'bonus') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border-2 border-amber-500/80 space-y-3 shadow-xl ring-1 ring-amber-400/40">
            <div className="flex items-center justify-between border-b border-[#3b2214] pb-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="text-xs sm:text-sm uppercase tracking-wider font-black text-amber-300">
                  7. Bónus de Jogadas Adicionais (1x e 2x)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                Regra Especial
              </span>
            </div>

            <div className="text-[11px] text-stone-200 space-y-2 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* CARTÃO 1x */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-400 text-stone-950 font-black text-xs font-mono">
                      1x
                    </span>
                    <strong className="text-emerald-300">Captura de 10+ pedras (1 casa só):</strong>
                  </div>
                  <p className="text-[10.5px] text-stone-300">
                    Se capturar uma única casa que contenha <strong>10 ou mais pedras</strong> (não combinadas entre duas casas), ganha <strong>1 vez extra de jogar (1x)</strong>!
                  </p>
                </div>

                {/* CARTÃO 2x */}
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-stone-950 font-black text-xs font-mono">
                      2x
                    </span>
                    <strong className="text-amber-300">Captura combinada de 20+ pedras:</strong>
                  </div>
                  <p className="text-[10.5px] text-stone-300">
                    Se capturar duas casas que combinadas perfaçam <strong>20 ou mais pedras</strong>, ganha <strong>2 vezes para jogar (2x)</strong>!
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-amber-600/30 text-[10.5px] text-stone-300 space-y-1">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Animação & Parabéns:</span>
                </div>
                <div>
                  No momento da captura com bónus, surge uma celebração com <strong>"1x"</strong> ou <strong>"2x"</strong>, um <strong>Parabéns pequeno</strong> e o jogador recebe o seu turno extra consecutivo!
                </div>
              </div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 7 */}
            <MiniTabuleiroNtxuva
              casasData={dadosBonus}
              legenda="Casa 16 (11 pedras ≥10) dá 1x de bónus. Se capturar também a Casa 21 (9 pedras), a soma chega a 20 pedras (≥20) e concede 2x para jogar!"
            />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            8. CONDIÇÕES DE VITÓRIA: ASFIXIA & ELIMINAÇÃO TOTAL
            ────────────────────────────────────────────────────────── */}
        {(abaAtiva === 'todos' || abaAtiva === 'vitoria') && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20120a] border border-amber-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-[#3b2214] pb-1.5">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-xs sm:text-sm uppercase tracking-wider">
                8. Condições de Vitória
              </h4>
            </div>

            <div className="text-[11px] text-stone-300 space-y-1.5">
              <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-0.5">
                <div className="text-rose-300 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>1. Vitória por Asfixia (Afogamento):</span>
                </div>
                <div>
                  Se o adversário ficar apenas com covas de <strong>1 pedra</strong>, ele não pode iniciar nenhuma jogada válida. Perde por <strong>asfixia (afogamento)</strong> e tu vences imediatamente!
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-0.5">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Eliminação Total:</span>
                </div>
                <div>
                  Capturar todas as 24 pedras do adversário (deixá-lo com 0 pedras).
                </div>
              </div>
            </div>

            {/* TABULEIRO OFICIAL DO JOGO ILUSTRADO 8 */}
            <MiniTabuleiroNtxuva
              casasData={dadosAsfixia}
              legenda="O adversário só tem 1 pedra nas casas 13 e 20. Como não pode jogar com 1 pedra, perdeu por asfixia/afogamento!"
            />
          </div>
        )}
      </div>

      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all"
        >
          Entendido! Fechar Regras
        </button>
      )}
    </div>
  );
};
