import React from 'react';
import { 
  Users, 
  Globe, 
  Bot, 
  BookOpen, 
  Settings, 
  Play,
  Heart,
  Brain,
  Trophy,
  MessageSquare,
  Gift,
  Coins,
  GraduationCap,
  Download
} from 'lucide-react';

interface MenuInicialProps {
  onJogarLocal: () => void;
  onJogarOnline: () => void;
  onJogarIA: () => void;
  onJogarDesafios: () => void;
  onJogarTutorial?: () => void;
  onAbrirRegras: () => void;
  onAbrirConfiguracoes: () => void;
  onAbrirEstatisticas?: () => void;
  onAbrirDoacoesCriador?: () => void;
  onAbrirChatComunidade?: () => void;
  onAbrirCompartilharEInstalar?: () => void;
  onAbrirAnuncioRecompensado?: () => void;
  isInstalled?: boolean;
  temPartidaEmAndamento?: boolean;
  onContinuarPartida?: () => void;
  saldoMoedas?: number;
}

export const MenuInicial: React.FC<MenuInicialProps> = ({
  onJogarLocal,
  onJogarOnline,
  onJogarIA,
  onJogarDesafios,
  onJogarTutorial,
  onAbrirRegras,
  onAbrirConfiguracoes,
  onAbrirEstatisticas,
  onAbrirDoacoesCriador,
  onAbrirChatComunidade,
  onAbrirCompartilharEInstalar,
  onAbrirAnuncioRecompensado,
  isInstalled = false,
  temPartidaEmAndamento = false,
  onContinuarPartida,
  saldoMoedas = 500,
}) => {
  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto flex flex-col items-center justify-center p-2 sm:p-3 animate-fadeIn">
      {/* Container Principal do Menu com Gestão Otimizada de Espaço */}
      <div className="w-full bg-[#1c1008] border-2 border-[#4d2d18] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl shadow-black/80 space-y-2.5 sm:space-y-3 relative overflow-hidden">
        {/* Glow de fundo decorativo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Título & Logo NTXUVA - Proporções equilibradas */}
        <div className="text-center space-y-1 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#29170c] border border-amber-600/40 text-amber-400 text-[10px] sm:text-xs font-mono font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            O JOGO TRADICIONAL DE ÁFRICA
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-amber-200 font-mono drop-shadow-md leading-none">
            NTXUVA
          </h1>

          <p className="text-stone-400 text-[11px] sm:text-xs font-mono max-w-xs mx-auto">
            24 Casas · 48 Pedras · Capturas em Cadeia
          </p>

          {/* BARRA INFORMATIVA DE MOEDAS / CRÉDITOS */}
          <div className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#291408] via-[#331a0a] to-[#291408] border border-amber-500/50 shadow-inner mt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Coins className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[9px] text-stone-400 font-mono leading-none uppercase">Crédito de Jogo</div>
                <div className="text-xs sm:text-sm font-black text-amber-200 font-mono">
                  {saldoMoedas} <span className="text-[10px] text-amber-400/70 font-normal">/ 1000 moedas</span>
                </div>
              </div>
            </div>

            {onAbrirAnuncioRecompensado && (
              <button
                type="button"
                onClick={onAbrirAnuncioRecompensado}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-mono font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                title="Assistir anúncio na categoria Bónus de Vídeo para ganhar +250 moedas (até 1000)"
              >
                <Gift className="w-3 h-3 text-stone-950" />
                <span>+250 Moedas</span>
              </button>
            )}
          </div>
        </div>

        {/* Botão de Continuar Partida (Se houver jogo aberto) */}
        {temPartidaEmAndamento && onContinuarPartida && (
          <button
            type="button"
            onClick={onContinuarPartida}
            className="w-full py-2.5 px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.98] text-white font-mono font-black text-xs sm:text-sm tracking-wider flex items-center justify-between shadow-md shadow-emerald-950/40 border border-emerald-400/50 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              <span>CONTINUAR PARTIDA</span>
            </div>
            <span className="text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/40 font-mono">
              Em andamento
            </span>
          </button>
        )}

        {/* 1. JOGAR LOCAL */}
        <button
          type="button"
          onClick={onJogarLocal}
          className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#29170c] hover:bg-[#382012] active:scale-[0.98] border border-[#542f1a] hover:border-amber-500/80 transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-amber-200 font-mono tracking-wide group-hover:text-amber-100 leading-tight flex items-center gap-1.5">
                <span>JOGAR LOCAL</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  25 moedas
                </span>
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] text-stone-400 font-medium leading-tight mt-0.5">
                2 jogadores no mesmo aparelho presencialmente.
              </div>
            </div>
          </div>
          <span className="text-amber-400/70 group-hover:text-amber-400 font-mono text-xs sm:text-sm font-bold pr-1">
            →
          </span>
        </button>

        {/* 2. JOGAR ONLINE & JOGAR CONTRA IA LADO A LADO */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* JOGAR ONLINE */}
          <button
            type="button"
            onClick={onJogarOnline}
            className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#29170c] hover:bg-[#382012] active:scale-[0.98] border border-[#542f1a] hover:border-cyan-500/80 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[66px] sm:min-h-[72px]"
          >
            <div>
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[8px] sm:text-[8.5px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase font-mono font-bold">
                  Grátis · 0 Moedas
                </span>
              </div>
              <div className="text-xs sm:text-[13px] font-black text-amber-200 font-mono tracking-wide group-hover:text-amber-100 leading-tight">
                JOGAR ONLINE
              </div>
            </div>
            <div className="text-cyan-400 group-hover:text-cyan-300 font-mono text-[10px] sm:text-[11px] font-bold pt-1 flex items-center justify-between">
              <span>Conectar</span>
              <span>→</span>
            </div>
          </button>

          {/* JOGAR CONTRA IA */}
          <button
            type="button"
            onClick={onJogarIA}
            className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#29170c] hover:bg-[#382012] active:scale-[0.98] border border-[#542f1a] hover:border-rose-500/80 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[66px] sm:min-h-[72px]"
          >
            <div>
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[8px] sm:text-[8.5px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-mono font-bold">
                  25 moedas
                </span>
              </div>
              <div className="text-xs sm:text-[13px] font-black text-amber-200 font-mono tracking-wide group-hover:text-amber-100 leading-tight">
                CONTRA IA
              </div>
            </div>
            <div className="text-rose-400 group-hover:text-rose-300 font-mono text-[10px] sm:text-[11px] font-bold pt-1 flex items-center justify-between">
              <span>Desafiar</span>
              <span>→</span>
            </div>
          </button>
        </div>

        {/* MODOS TÁTICOS & APRENDIZAGEM: QUEBRA-CABEÇA E TUTORIAL INTERATIVO LADO A LADO */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* 4. GAME QUEBRA-CABEÇA (60 PUZZLES TÁTICOS) */}
          <button
            type="button"
            onClick={onJogarDesafios}
            className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#29170c] hover:bg-[#382012] active:scale-[0.98] border-2 border-amber-500/80 hover:border-amber-400 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[66px] sm:min-h-[72px]"
          >
            <div>
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                  <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <span className="text-[8px] sm:text-[8.5px] px-1.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/50 uppercase font-black animate-pulse">
                  60 Puzzles
                </span>
              </div>
              <div className="text-xs sm:text-[13px] font-black text-amber-200 font-mono tracking-wide group-hover:text-amber-100 leading-tight">
                QUEBRA-CABEÇA
              </div>
            </div>
            <div className="text-amber-400 group-hover:text-amber-300 font-mono text-[10px] sm:text-[11px] font-bold pt-1 flex items-center justify-between">
              <span>Jogar</span>
              <span>→</span>
            </div>
          </button>

          {/* 5. MODO TUTORIAL INTERATIVO (DESTACADO PARA NOVOS JOGADORES) */}
          {onJogarTutorial && (
            <button
              type="button"
              onClick={onJogarTutorial}
              className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#172b1a] via-[#1f3b23] to-[#142417] hover:from-[#1d3821] hover:to-[#172b1a] active:scale-[0.98] border-2 border-emerald-500/80 hover:border-emerald-400 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[66px] sm:min-h-[72px]"
            >
              <div>
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                  <span className="text-[8px] sm:text-[8.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 uppercase font-bold animate-pulse">
                    Casa a Casa
                  </span>
                </div>
                <div className="text-xs sm:text-[13px] font-black text-emerald-200 font-mono tracking-wide group-hover:text-emerald-100 leading-tight">
                  TUTORIAL
                </div>
              </div>
              <div className="text-emerald-400 font-mono text-[10px] sm:text-[11px] font-black pt-1 flex items-center justify-between">
                <span>Aprender</span>
                <span>→</span>
              </div>
            </button>
          )}
        </div>

        {/* 5. COMUNIDADE & BÓNUS: CHAT GLOBAL E BÓNUS ASSISTIR VÍDEO LADO A LADO */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* CHAT GLOBAL & CAMPEONATOS */}
          {onAbrirChatComunidade && (
            <button
              type="button"
              onClick={onAbrirChatComunidade}
              className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-950/90 via-[#361a09] to-amber-950/90 hover:from-amber-900/90 hover:to-[#42200c] active:scale-[0.98] border-2 border-amber-500/80 hover:border-amber-400 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[66px] sm:min-h-[72px]"
            >
              <div>
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  </div>
                  <span className="text-[8px] sm:text-[8.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold animate-pulse">
                    Ao Vivo
                  </span>
                </div>
                <div className="text-xs sm:text-[13px] font-black text-amber-200 font-mono tracking-wide group-hover:text-amber-100 leading-tight">
                  CHAT & TORNEIOS
                </div>
              </div>
              <div className="text-amber-400 group-hover:text-amber-300 font-mono text-[10px] sm:text-[11px] font-bold pt-1 flex items-center justify-between">
                <span>Entrar</span>
                <span>→</span>
              </div>
            </button>
          )}

          {/* BÓNUS DE ANÚNCIO (VÍDEO RECOMPENSADO ADMOB) */}
          {onAbrirAnuncioRecompensado && (
            <button
              type="button"
              onClick={onAbrirAnuncioRecompensado}
              className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#172b1a] via-[#1d3521] to-[#142617] hover:from-[#1e3822] hover:to-[#172c1a] active:scale-[0.98] border-2 border-emerald-500/80 hover:border-emerald-400 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[66px] sm:min-h-[72px]"
            >
              <div>
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                  <span className="text-[8px] sm:text-[8.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                    +250 Moedas
                  </span>
                </div>
                <div className="text-xs sm:text-[13px] font-black text-emerald-200 font-mono tracking-wide group-hover:text-emerald-100 leading-tight">
                  BÓNUS DE VÍDEO
                </div>
              </div>
              <div className="text-emerald-400 font-mono text-[10px] sm:text-[11px] font-bold pt-1 flex items-center justify-between">
                <span>🎁 Ganhar</span>
                <span>→</span>
              </div>
            </button>
          )}
        </div>

        {/* 6. GRID DE 3 AÇÕES: REGRAS, RECORDES E DEFINIÇÕES */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-0.5">
          {/* REGRAS */}
          <button
            type="button"
            onClick={onAbrirRegras}
            className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#201209] hover:bg-[#2b180d] active:scale-[0.98] border border-[#3d2213] hover:border-amber-600/50 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[56px] sm:min-h-[62px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 group-hover:text-amber-300">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-stone-500 group-hover:text-stone-300 font-mono text-[11px]">
                →
              </span>
            </div>
            <div className="mt-1">
              <div className="text-[10.5px] sm:text-xs font-bold text-stone-200 font-mono tracking-wide group-hover:text-white leading-tight">
                REGRAS
              </div>
              <div className="text-[8px] sm:text-[9px] text-stone-400 font-medium truncate">
                Ilustradas
              </div>
            </div>
          </button>

          {/* RECORDES & ESTATÍSTICAS */}
          <button
            type="button"
            onClick={onAbrirEstatisticas || onAbrirConfiguracoes}
            className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#201209] hover:bg-[#2b180d] active:scale-[0.98] border border-amber-500/40 hover:border-amber-400 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[56px] sm:min-h-[62px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-amber-500/60 group-hover:text-amber-300 font-mono text-[11px]">
                →
              </span>
            </div>
            <div className="mt-1">
              <div className="text-[10.5px] sm:text-xs font-bold text-amber-200 font-mono tracking-wide group-hover:text-white leading-tight">
                RECORDES
              </div>
              <div className="text-[8px] sm:text-[9px] text-stone-400 font-medium truncate">
                Estatísticas
              </div>
            </div>
          </button>

          {/* CONFIGURAÇÕES / DEFINIÇÕES */}
          <button
            type="button"
            onClick={onAbrirConfiguracoes}
            className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#201209] hover:bg-[#2b180d] active:scale-[0.98] border border-[#3d2213] hover:border-amber-600/50 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between min-h-[56px] sm:min-h-[62px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 group-hover:text-amber-300">
                <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-stone-500 group-hover:text-stone-300 font-mono text-[11px]">
                →
              </span>
            </div>
            <div className="mt-1">
              <div className="text-[10.5px] sm:text-xs font-bold text-stone-200 font-mono tracking-wide group-hover:text-white leading-tight">
                DEFINIÇÕES
              </div>
              <div className="text-[8px] sm:text-[9px] text-stone-400 font-medium truncate">
                Som & Opções
              </div>
            </div>
          </button>
        </div>

        {/* 7. ZONA DE DOAÇÕES E CRIADOR */}
        <button
          type="button"
          onClick={onAbrirDoacoesCriador}
          className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#291307] via-[#33170a] to-[#220e04] hover:from-[#3a1a09] hover:to-[#2c1306] active:scale-[0.98] border border-amber-500/50 hover:border-amber-400 transition-all text-left group shadow-sm cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 fill-amber-400/40" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-amber-200 font-mono tracking-wide group-hover:text-amber-100 flex items-center gap-1.5 leading-tight">
                <span>DOAÇÕES E CRIADOR</span>
                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans font-bold">
                  Apoiar
                </span>
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] text-stone-400 font-medium leading-tight mt-0.5">
                Métodos de pagamento (<span className="whitespace-nowrap font-medium text-stone-300">M&#8209;Pesa</span>, <span className="whitespace-nowrap font-medium text-stone-300">e&#8209;Mola</span>) e contactos
              </div>
            </div>
          </div>
          <span className="text-amber-400/70 group-hover:text-amber-400 font-mono text-xs sm:text-sm pr-1">
            →
          </span>
        </button>

        {/* 8. BAIXAR CÓDIGO FONTE DO JOGO (.ZIP) */}
        <a
          href="/ntxuva-jogo-completo.zip"
          download="ntxuva-jogo-completo.zip"
          className="w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#172314] via-[#1f331c] to-[#142111] hover:from-[#1e3b1c] hover:to-[#172814] active:scale-[0.98] border border-emerald-500/50 hover:border-emerald-400 transition-all text-left group shadow-sm cursor-pointer flex items-center justify-between no-underline"
          title="Baixar arquivo ZIP com todo o código fonte e recursos do jogo"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
              <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-emerald-200 font-mono tracking-wide group-hover:text-emerald-100 flex items-center gap-1.5 leading-tight">
                <span>BAIXAR CÓDIGO FONTE (ZIP)</span>
                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                  2.3 MB
                </span>
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] text-stone-400 font-medium leading-tight mt-0.5">
                Pasta compactada completa com todo o código e recursos
              </div>
            </div>
          </div>
          <span className="text-emerald-400/80 group-hover:text-emerald-300 font-mono text-xs sm:text-sm pr-1 font-bold">
            ↓
          </span>
        </a>
      </div>
    </div>
  );
};
