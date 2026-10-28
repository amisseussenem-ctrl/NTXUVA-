import React, { useState } from 'react';
import { 
  Users, 
  Bot, 
  Play, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  CircleDot, 
  Crown, 
  Zap, 
  Smile,
  Coins
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { DificuldadeIA } from '../types/ntxuva';

interface PreparacaoPartidaProps {
  modoJogo: 'local' | 'ia';
  nomeJogadorA: string;
  nomeJogadorB: string;
  dificuldadeIA?: DificuldadeIA;
  onConfirmar: (nomeA: string, nomeB: string, dificuldade?: DificuldadeIA) => void;
  onVoltar?: () => void;
  saldoMoedas?: number;
}

export const PreparacaoPartida: React.FC<PreparacaoPartidaProps> = ({
  modoJogo,
  nomeJogadorA: nomeInicialA,
  nomeJogadorB: nomeInicialB,
  dificuldadeIA: dificuldadeInicial = 'medio',
  onConfirmar,
  saldoMoedas = 500,
}) => {
  const [dificuldade, setDificuldade] = useState<DificuldadeIA>(dificuldadeInicial);
  const [nomeA, setNomeA] = useState(nomeInicialA || 'Jogador 1');
  
  const getNomePadraoIA = (dif: DificuldadeIA) => {
    if (dif === 'iniciante') return 'IA (Iniciante)';
    if (dif === 'mestre') return 'Mestre Kota (IA)';
    return 'IA (Médio)';
  };

  const [nomeB, setNomeB] = useState(
    modoJogo === 'ia' 
      ? getNomePadraoIA(dificuldadeInicial)
      : (nomeInicialB || 'Jogador 2')
  );

  const handleMudarDificuldade = (novaDif: DificuldadeIA) => {
    setDificuldade(novaDif);
    if (modoJogo === 'ia') {
      setNomeB(getNomePadraoIA(novaDif));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playPickup();
    onConfirmar(
      nomeA.trim() || 'Jogador 1', 
      nomeB.trim() || (modoJogo === 'ia' ? getNomePadraoIA(dificuldade) : 'Jogador 2'),
      dificuldade
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center p-2 sm:p-3 animate-fadeIn">
      <div className="w-full bg-[#1c1008] border-2 border-[#4d2d18] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-black/80 space-y-2.5 sm:space-y-3 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho Compacto da Preparação */}
        <div className="flex items-center justify-between pb-2 border-b border-[#3b2214]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
              {modoJogo === 'ia' ? <Bot className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black font-mono tracking-wider text-amber-200 uppercase leading-tight">
                Preparação da Partida
              </h2>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400 leading-none">
                {modoJogo === 'ia' ? 'Contra IA (Computador)' : 'Modo Local (2 Jogadores)'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Identificação dos Jogadores */}
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          {/* JOGADORES DA PARTIDA LADO A LADO */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            {/* Jogador 1 (Verde) */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#102414]/80 border border-emerald-500/50 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <span>🟢</span>
                  <span>JOGADOR 1</span>
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">Casas 1-12</span>
              </div>
              <input
                type="text"
                value={nomeA}
                onChange={(e) => setNomeA(e.target.value)}
                maxLength={20}
                placeholder="Nome do Jogador 1"
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950/80 border border-emerald-500/40 text-emerald-100 font-mono text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Jogador 2 ou IA (Vermelho) */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#241009]/80 border border-rose-500/50 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-rose-300 flex items-center gap-1">
                  <span>🔴</span>
                  <span>{modoJogo === 'ia' ? 'IA' : 'JOGADOR 2'}</span>
                </span>
                <span className="text-[9px] text-rose-400/80 font-mono">Casas 13-24</span>
              </div>
              <input
                type="text"
                value={nomeB}
                onChange={(e) => setNomeB(e.target.value)}
                maxLength={20}
                disabled={modoJogo === 'ia'}
                placeholder="Nome do Jogador 2"
                className={`w-full px-2.5 py-1.5 rounded-lg bg-stone-950/80 border border-rose-500/40 text-rose-100 font-mono text-xs focus:outline-none focus:border-rose-400 ${
                  modoJogo === 'ia' ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          {/* SELETOR DE DIFICULDADE DA IA RESUMIDO */}
          {modoJogo === 'ia' && (
            <div className="space-y-1.5 p-2 sm:p-2.5 rounded-xl bg-[#140c07] border border-amber-600/40 shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-amber-300">Dificuldade da IA:</span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {dificuldade === 'iniciante' && '🟢 Fácil'}
                  {dificuldade === 'medio' && '🟡 Equilibrado'}
                  {dificuldade === 'mestre' && '👑 Mestre Kota'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {/* INICIANTE */}
                <button
                  type="button"
                  onClick={() => handleMudarDificuldade('iniciante')}
                  className={`py-1.5 px-2 rounded-xl border text-center cursor-pointer transition-all ${
                    dificuldade === 'iniciante'
                      ? 'bg-emerald-950/80 border-emerald-400 ring-1 ring-emerald-500 shadow-sm text-white font-bold'
                      : 'bg-[#24150c] border-[#3d2110] text-stone-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px]">
                    <Smile className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Iniciante</span>
                  </div>
                </button>

                {/* MÉDIO */}
                <button
                  type="button"
                  onClick={() => handleMudarDificuldade('medio')}
                  className={`py-1.5 px-2 rounded-xl border text-center cursor-pointer transition-all ${
                    dificuldade === 'medio'
                      ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-500 shadow-sm text-white font-bold'
                      : 'bg-[#24150c] border-[#3d2110] text-stone-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Médio</span>
                  </div>
                </button>

                {/* MESTRE KOTA */}
                <button
                  type="button"
                  onClick={() => handleMudarDificuldade('mestre')}
                  className={`py-1.5 px-2 rounded-xl border text-center cursor-pointer transition-all ${
                    dificuldade === 'mestre'
                      ? 'bg-purple-950/80 border-purple-400 ring-1 ring-purple-500 shadow-sm text-white font-bold'
                      : 'bg-[#24150c] border-[#3d2110] text-stone-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px]">
                    <Crown className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mestre</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* CONSUMO DE MOEDAS DA PARTIDA */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#29170c] border border-amber-600/40 text-[11px] font-mono">
            <span className="text-stone-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Consumo da Partida:</span>
            </span>
            <div className="flex items-center gap-2">
              <strong className="text-amber-300 font-black">-25 Moedas</strong>
              <span className="text-stone-500">·</span>
              <span className="text-stone-400">
                Saldo: <strong className={saldoMoedas >= 25 ? 'text-emerald-300' : 'text-rose-400'}>{saldoMoedas}</strong>
              </span>
            </div>
          </div>

          {/* BOTÃO INICIAR PARTIDA */}
          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-stone-950 font-mono font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 border border-amber-300 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>INICIAR PARTIDA</span>
          </button>

          {/* Resumo Informativo das Regras (Resumido e Elegante) */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#140c07] border border-[#3b2214] flex items-center justify-between gap-2 font-mono text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>24 Casas · 48 Pedras</span>
            </div>
            <span className="text-stone-400 text-[9.5px] sm:text-[10px]">
              Sentido anti-horário · Capturas em cadeia
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
