import React, { useState, useEffect } from 'react';
import { Jogador } from '../types/ntxuva';
import { SalaPartidaPublica } from '../types/online';
import { 
  Users, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Share2, 
  LogOut, 
  Flag, 
  Plus, 
  LogIn, 
  User, 
  KeyRound, 
  Sparkles,
  Timer,
  MessageSquare
} from 'lucide-react';
import { ChatReacoesOnline } from './ChatReacoesOnline';
import { RelogioTurnoOnline } from './RelogioTurnoOnline';

interface PainelPartidaOnlineProps {
  sala: SalaPartidaPublica | null;
  seuPapel: Jogador | null;
  conectado: boolean;
  reconectando: boolean;
  carregando: boolean;
  erro: string | null;
  onCriarPartida: (nome: string, tempoTurno?: number | null) => Promise<boolean>;
  onEntrarPartida: (codigo: string, nome: string) => Promise<boolean>;
  onSairDaSala: () => void;
  onDesistir: () => void;
  onLimparErro: () => void;
  onEnviarReacao?: (texto: string, emoji?: string) => Promise<boolean>;
  onTentarReconectar?: () => void;
  onPublicarNoChatGlobal?: () => void;
}

export const PainelPartidaOnline: React.FC<PainelPartidaOnlineProps> = ({
  sala,
  seuPapel,
  conectado,
  reconectando,
  carregando,
  erro,
  onCriarPartida,
  onEntrarPartida,
  onSairDaSala,
  onDesistir,
  onLimparErro,
  onEnviarReacao,
  onTentarReconectar,
  onPublicarNoChatGlobal,
}) => {
  const [abaLobby, setAbaLobby] = useState<'criar' | 'entrar'>('criar');
  const [nomeJogador, setNomeJogador] = useState('Jogador');
  const [codigoInput, setCodigoInput] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [tempoTurno, setTempoTurno] = useState<number | null>(45);

  // Preencher código da URL caso haja query param ?sala=NTX-XXX
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const salaParam = params.get('sala');
      if (salaParam) {
        setCodigoInput(salaParam.toUpperCase());
        setAbaLobby('entrar');
      }
    } catch {
      // Ignorar
    }
  }, []);

  const handleCopiarCodigo = () => {
    if (!sala) return;
    try {
      navigator.clipboard.writeText(sala.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopiarLink = () => {
    if (!sala) return;
    try {
      const url = `${window.location.origin}${window.location.pathname}?sala=${sala.codigo}`;
      navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback
    }
  };

  const submitCriar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeJogador.trim()) return;
    onCriarPartida(nomeJogador.trim(), tempoTurno);
  };

  const submitEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInput.trim() || !nomeJogador.trim()) return;
    onEntrarPartida(codigoInput.trim().toUpperCase(), nomeJogador.trim());
  };

  // Se o jogador JÁ ESTÁ em uma sala online
  if (sala) {
    const isJogadorA = seuPapel === 'Jogador A';
    const isJogadorB = seuPapel === 'Jogador B';
    const isMinhaVez = sala.gameState.jogadorAtual === seuPapel && sala.status === 'em_andamento';

    return (
      <section className="p-4 sm:p-6 rounded-3xl bg-[#1d120a] border-2 border-amber-500/70 shadow-2xl space-y-4 text-stone-100">
        {/* Cabeçalho da Sala */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#3b2314] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-500/50 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-stone-300 text-xs sm:text-sm uppercase tracking-wider font-bold">
                  Código da Sala:
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-widest font-mono bg-[#2b170c] px-2.5 py-0.5 rounded-lg border border-amber-500/40">
                  {sala.codigo}
                </span>
                <button
                  type="button"
                  onClick={handleCopiarCodigo}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2b180d] hover:bg-[#3d2313] text-stone-200 hover:text-white transition-colors cursor-pointer border border-[#4d2d1a] text-xs font-bold font-mono"
                  title="Copiar código da sala"
                >
                  {copiado ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2.5 mt-1 text-xs sm:text-sm font-semibold flex-wrap">
                <span className="text-stone-300">Você é:</span>
                <strong className={`px-2 py-0.5 rounded-md font-extrabold ${
                  isJogadorA 
                    ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40' 
                    : isJogadorB 
                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40' 
                    : 'text-stone-200 bg-stone-900 border border-stone-700'
                }`}>
                  {seuPapel || 'Espectador'}
                </strong>
                <span className="text-stone-500">·</span>
                {conectado ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> Conectado ao servidor
                  </span>
                ) : reconectando ? (
                  <span className="text-amber-400 font-bold animate-pulse flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Reconectando...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onTentarReconectar}
                    className="text-rose-400 hover:text-rose-200 underline font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <WifiOff className="w-4 h-4" /> Desconectado · Reconectar
                  </button>
                )}

                {sala.tempoTurnoSegundos && (
                  <>
                    <span className="text-stone-500">·</span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-amber-400" />
                      <span>{sala.tempoTurnoSegundos}s / lance</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ações da Sala */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onEnviarReacao && sala.status === 'em_andamento' && (
              <ChatReacoesOnline
                seuPapel={seuPapel}
                ultimaReacao={sala.ultimaReacao ?? null}
                onEnviarReacao={onEnviarReacao}
              />
            )}

            <button
              type="button"
              onClick={handleCopiarLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a1a10] hover:bg-[#3b2517] text-stone-200 hover:text-white border border-[#4d2f1d] transition-all cursor-pointer text-xs font-bold font-mono"
              title="Copiar link com código da sala"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>{copiado ? 'Link Copiado!' : 'Copiar Convite'}</span>
            </button>

            {sala.status === 'em_andamento' && (
              <button
                type="button"
                onClick={onDesistir}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-rose-950 hover:text-rose-200 text-stone-300 border border-stone-800 transition-all cursor-pointer text-xs font-bold font-mono"
                title="Desistir da partida"
              >
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Desistir</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSairDaSala}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-all cursor-pointer text-xs font-bold font-mono"
              title="Sair desta sala"
            >
              <LogOut className="w-4 h-4 text-stone-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Alerta de Espera do Segundo Jogador */}
        {sala.status === 'aguardando_adversario' && (
          <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-500/70 space-y-3">
            <div className="flex items-center gap-2 text-amber-200 font-extrabold text-sm sm:text-base">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span>Aguardando o segundo jogador entrar...</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
              Envie o código <strong className="text-amber-200 text-base font-black px-2 py-0.5 rounded bg-amber-950 border border-amber-600 font-mono tracking-wider">{sala.codigo}</strong> para seu amigo. Assim que ele ingressar, a partida iniciará imediatamente com o Jogador A.
            </p>
            {onPublicarNoChatGlobal && (
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onPublicarNoChatGlobal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border border-amber-300"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Publicar no Chat da Comunidade</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Banner de Turno Dinâmico com Relógio */}
        {sala.status === 'em_andamento' && (
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all ${
              isMinhaVez
                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/50 shadow-xl'
                : 'bg-stone-950/80 border-stone-800 text-stone-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    isMinhaVez ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400/80'
                  }`}
                />
                <span className="font-extrabold text-sm sm:text-base">
                  {isMinhaVez ? 'É A SUA VEZ DE JOGAR!' : `Aguardando a jogada de ${sala.gameState.jogadorAtual}...`}
                </span>
              </div>

              {sala.tempoTurnoSegundos && sala.turnoIniciadoEm && (
                <RelogioTurnoOnline
                  tempoTurnoSegundos={sala.tempoTurnoSegundos}
                  turnoIniciadoEm={sala.turnoIniciadoEm}
                  jogadorAtual={sala.gameState.jogadorAtual}
                  seuPapel={seuPapel}
                  nomeJogadorAtual={sala.gameState.jogadorAtual === 'Jogador A' ? sala.jogadorA.nome : (sala.jogadorB?.nome || 'Adversário')}
                  isMinhaVez={isMinhaVez}
                />
              )}

              <span className="text-xs sm:text-sm text-stone-300 font-medium">
                {isMinhaVez ? 'Clique em uma casa iluminada do seu campo' : 'O adversário está calculando a semeadura'}
              </span>
            </div>
          </div>
        )}

        {/* Status dos Jogadores Conectados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* Jogador A */}
          <div
            className={`p-3.5 rounded-2xl border-2 ${
              isJogadorA ? 'bg-[#1b2518] border-emerald-500' : 'bg-stone-950/70 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="font-bold text-white text-sm sm:text-base">{sala.jogadorA.nome}</span>
                <span className="text-xs text-emerald-400 font-extrabold">(Jogador A)</span>
              </div>
              <span className="text-xs text-stone-300 font-bold">
                {sala.jogadorA.conectado ? '🟢 Online' : '🔴 Ausente'}
              </span>
            </div>
            <div className="text-xs text-stone-300 font-medium mt-1.5 flex items-center justify-between font-mono">
              <span>Casas 1 a 12</span>
              <strong className="text-emerald-300 font-black text-sm">{sala.gameState.pedrasDoJogadorA} pedras</strong>
            </div>
          </div>

          {/* Jogador B */}
          <div
            className={`p-3.5 rounded-2xl border-2 ${
              isJogadorB ? 'bg-[#26190e] border-cyan-500' : 'bg-stone-950/70 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${sala.jogadorB ? 'bg-cyan-400' : 'bg-stone-600'}`} />
                <span className="font-bold text-white text-sm sm:text-base">
                  {sala.jogadorB ? sala.jogadorB.nome : 'Aguardando jogador...'}
                </span>
                <span className="text-xs text-cyan-400 font-extrabold">(Jogador B)</span>
              </div>
              <span className="text-xs text-stone-300 font-bold">
                {sala.jogadorB
                  ? sala.jogadorB.conectado
                    ? '🟢 Online'
                    : '🔴 Ausente'
                  : '⏳ Vago'}
              </span>
            </div>
            <div className="text-xs text-stone-300 font-medium mt-1.5 flex items-center justify-between font-mono">
              <span>Casas 13 a 24</span>
              <strong className="text-cyan-300 font-black text-sm">{sala.gameState.pedrasDoJogadorB} pedras</strong>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Se o jogador NÃO ESTÁ em nenhuma sala (Lobby de Criação e Entrada)
  return (
    <section className="p-5 sm:p-7 rounded-3xl bg-[#1c1109] border-2 border-[#4d2f1d] shadow-2xl space-y-5 text-stone-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#382112] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-500/50 shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-100 tracking-tight">
              Partida Online (2 Jogadores)
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-medium">
              Crie uma sala ou entre com o código para jogar em tempo real.
            </p>
          </div>
        </div>

        {/* Abas Criar vs Entrar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#120a05] rounded-2xl border border-[#3b2314] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setAbaLobby('criar');
              onLimparErro();
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              abaLobby === 'criar'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Criar Partida
          </button>
          <button
            type="button"
            onClick={() => {
              setAbaLobby('entrar');
              onLimparErro();
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              abaLobby === 'entrar'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Entrar com Código
          </button>
        </div>
      </div>

      {erro && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-500/80 text-rose-100 flex items-center justify-between gap-3 text-sm font-semibold">
          <span>{erro}</span>
          <button
            type="button"
            onClick={onLimparErro}
            className="text-stone-300 hover:text-white font-black p-1 text-base cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulário de Criação */}
      {abaLobby === 'criar' && (
        <form onSubmit={submitCriar} className="space-y-4">
          <div>
            <label className="block text-amber-200 text-xs sm:text-sm mb-2 font-extrabold tracking-wide flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>Seu Nome ou Apelido:</span>
            </label>
            <input
              type="text"
              value={nomeJogador}
              onChange={(e) => setNomeJogador(e.target.value)}
              placeholder="Digite seu nome (ex.: Mussa)"
              maxLength={20}
              required
              className="w-full sm:max-w-md px-4 py-3 rounded-2xl bg-[#24150b] border-2 border-[#5a3821] text-white placeholder:text-stone-400 text-base sm:text-lg font-bold tracking-wide focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 shadow-inner"
              style={{ color: '#ffffff', backgroundColor: '#24150b' }}
            />
            <span className="block text-[11px] text-stone-400 mt-1 font-medium">
              Este nome será exibido para o seu adversário durante a partida.
            </span>
          </div>

          {/* Seletor de Temporizador */}
          <div className="p-3.5 rounded-2xl bg-[#22130a] border border-[#442614] space-y-2 sm:max-w-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-amber-200 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>Relógio de Turno (Temporizador):</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">30s / 45s / 60s</span>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono">
              {[
                { valor: null, label: 'Sem Limite' },
                { valor: 30, label: '30s' },
                { valor: 45, label: '45s' },
                { valor: 60, label: '60s' },
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
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando || !nomeJogador.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 font-black text-sm transition-all shadow-xl cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{carregando ? 'Criando Partida...' : 'Criar Nova Partida'}</span>
          </button>
        </form>
      )}

      {/* Formulário de Entrada */}
      {abaLobby === 'entrar' && (
        <form onSubmit={submitEntrar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-200 text-xs sm:text-sm mb-2 font-extrabold tracking-wide flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>Seu Nome ou Apelido:</span>
              </label>
              <input
                type="text"
                value={nomeJogador}
                onChange={(e) => setNomeJogador(e.target.value)}
                placeholder="Digite seu nome (ex.: Amisse)"
                maxLength={20}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#24150b] border-2 border-[#5a3821] text-white placeholder:text-stone-400 text-base sm:text-lg font-bold tracking-wide focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                style={{ color: '#ffffff', backgroundColor: '#24150b' }}
              />
            </div>

            <div>
              <label className="block text-amber-200 text-xs sm:text-sm mb-2 font-extrabold tracking-wide flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Código da Partida (Ex.: NTX-ABC):</span>
              </label>
              <input
                type="text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                placeholder="NTX-..."
                maxLength={10}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#24150b] border-2 border-[#5a3821] text-amber-300 placeholder:text-stone-400 text-base sm:text-lg font-black font-mono tracking-widest uppercase focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                style={{ color: '#fcd34d', backgroundColor: '#24150b' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando || !codigoInput.trim() || !nomeJogador.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-50 text-stone-950 font-black text-sm transition-all shadow-xl cursor-pointer"
          >
            <LogIn className="w-5 h-5 stroke-[2.5]" />
            <span>{carregando ? 'Entrando...' : 'Entrar na Partida'}</span>
          </button>
        </form>
      )}
    </section>
  );
};

