import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  LogIn, 
  User, 
  AlertCircle,
  Timer,
  MessageSquare
} from 'lucide-react';

interface MenuJogarOnlineProps {
  onVoltarMenu?: () => void;
  onCriarPartida: (nome: string, tempoTurno?: number | null) => Promise<boolean>;
  onEntrarPartida: (codigo: string, nome: string) => Promise<boolean>;
  carregando: boolean;
  erro: string | null;
  onLimparErro: () => void;
  onAbrirChatComunidade?: () => void;
  nomePadrao?: string;
}

export const MenuJogarOnline: React.FC<MenuJogarOnlineProps> = ({
  onVoltarMenu,
  onCriarPartida,
  onEntrarPartida,
  carregando,
  erro,
  onLimparErro,
  onAbrirChatComunidade,
  nomePadrao,
}) => {
  const [nomeJogador, setNomeJogador] = useState(nomePadrao || 'Jogador');
  const [codigoPartida, setCodigoPartida] = useState('');
  const [tempoTurno, setTempoTurno] = useState<number | null>(45);

  useEffect(() => {
    if (nomePadrao) setNomeJogador(nomePadrao);
  }, [nomePadrao]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeJogador.trim()) return;
    await onCriarPartida(nomeJogador.trim(), tempoTurno);
  };

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoPartida.trim() || !nomeJogador.trim()) return;
    await onEntrarPartida(codigoPartida.trim().toUpperCase(), nomeJogador.trim());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 w-full max-w-lg mx-auto animate-fadeIn">
      <div className="w-full bg-[#1c1008] border-2 border-[#4d2d18] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 sm:space-y-5">
        
        {/* Título Central */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-amber-200 font-mono">
            JOGAR ONLINE
          </h2>
          <p className="text-stone-400 text-xs font-mono">
            Conecte-se com jogadores de qualquer lugar do mundo
          </p>
        </div>

        {/* Notificação de Erro */}
        {erro && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-200 flex items-center justify-between gap-2 text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{erro}</span>
            </div>
            <button
              type="button"
              onClick={onLimparErro}
              className="text-stone-300 hover:text-white font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Botão de Destaque para o Chat Global & Campeonatos */}
        {onAbrirChatComunidade && (
          <button
            type="button"
            onClick={onAbrirChatComunidade}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#311709] to-amber-950/80 hover:from-amber-900/80 hover:to-[#3b1d0c] border border-amber-500/60 hover:border-amber-400 transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <span>VER SALAS NO CHAT GLOBAL</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[10px] text-stone-400">
                  Jogadores postam links e campeonatos ao vivo
                </div>
              </div>
            </div>
            <span className="text-amber-400 font-mono text-sm font-bold pr-1">→</span>
          </button>
        )}

        {/* Campo do Nome do Jogador */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-stone-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Seu Nome no Tabuleiro:</span>
          </label>
          <input
            type="text"
            value={nomeJogador}
            onChange={(e) => setNomeJogador(e.target.value)}
            placeholder="Nome (ex: Mussa)"
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-xl bg-[#29170c] border border-[#542f1a] text-white text-sm font-bold focus:outline-none focus:border-amber-400 font-mono shadow-inner"
          />
        </div>

        {/* Configuração do Relógio de Turno (Temporizador) */}
        <div className="p-3.5 rounded-2xl bg-[#22130a] border border-[#442614] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-amber-200 flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>Relógio de Turno (Temporizador):</span>
            </label>
            <span className="text-[10px] text-stone-400 font-mono">Evita adversário inativo</span>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono">
            {[
              { valor: null, label: 'Sem Limite', badge: 'Casual' },
              { valor: 30, label: '30s', badge: 'Dinâmico' },
              { valor: 45, label: '45s', badge: 'Equilibrado' },
              { valor: 60, label: '60s', badge: 'Clássico' },
            ].map((opcao) => (
              <button
                key={String(opcao.valor)}
                type="button"
                onClick={() => setTempoTurno(opcao.valor)}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  tempoTurno === opcao.valor
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-md'
                    : 'bg-[#29170c] border-[#442716] text-stone-300 hover:text-white'
                }`}
              >
                <span className="text-xs font-black">{opcao.label}</span>
                <span className={`text-[9px] ${tempoTurno === opcao.valor ? 'text-stone-900 font-bold' : 'text-stone-500'}`}>
                  {opcao.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ações de Criação e Entrada */}
        <div className="space-y-3 pt-1 font-mono">
          {/* BOTÃO 1: CRIAR PARTIDA */}
          <button
            type="button"
            onClick={handleCriar}
            disabled={carregando || !nomeJogador.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 text-stone-950 font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{carregando ? 'Criando Partida...' : 'CRIAR PARTIDA ONLINE'}</span>
          </button>

          {/* DIVISOR */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#382012]"></div>
            <span className="flex-shrink mx-4 text-stone-500 text-xs">OU</span>
            <div className="flex-grow border-t border-[#382012]"></div>
          </div>

          {/* ÁREA ENTRAR NA PARTIDA COM CÓDIGO */}
          <form onSubmit={handleEntrar} className="space-y-3 p-3.5 rounded-2xl bg-[#201209] border border-[#3d2213]">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-stone-300">
              ENTRAR NA PARTIDA COM CÓDIGO
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-300 block text-center">
                Código da partida:
              </label>
              <input
                type="text"
                value={codigoPartida}
                onChange={(e) => setCodigoPartida(e.target.value.toUpperCase())}
                placeholder="Ex: NTX-ABC"
                maxLength={12}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-[#29170c] border-2 border-amber-500/50 text-amber-200 placeholder:text-stone-500 text-base font-black tracking-widest uppercase focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={carregando || !codigoPartida.trim() || !nomeJogador.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 text-stone-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer uppercase"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>{carregando ? 'Entrando...' : 'ENTRAR NA SALA'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
