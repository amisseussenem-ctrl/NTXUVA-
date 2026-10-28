import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Trophy, 
  Users, 
  Swords, 
  Play, 
  Plus, 
  User, 
  Clock, 
  Sparkles, 
  Check, 
  Share2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { 
  PerfilJogador, 
  MensagemChat, 
  CampeonatoNtxuva 
} from '../types/online';
import { comunidadeService } from '../utils/comunidadeService';

interface BarraChatComunidadeProps {
  aberto: boolean;
  onFechar: () => void;
  perfil: PerfilJogador;
  onAbrirEditarPerfil: () => void;
  onAbrirCriarCampeonato: () => void;
  onEntrarNaSalaOnline: (codigo: string) => void;
  onCriarSalaParaDesafio: (codigoPredefinido?: string, tempoTurno?: number | null) => void;
  codigoSalaAtual?: string | null;
}

export const BarraChatComunidade: React.FC<BarraChatComunidadeProps> = ({
  aberto,
  onFechar,
  perfil,
  onAbrirEditarPerfil,
  onAbrirCriarCampeonato,
  onEntrarNaSalaOnline,
  onCriarSalaParaDesafio,
  codigoSalaAtual,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'chat' | 'campeonatos' | 'jogadores'>('chat');
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [campeonatos, setCampeonatos] = useState<CampeonatoNtxuva[]>([]);
  const [perfisOnline, setPerfisOnline] = useState<PerfilJogador[]>([]);
  const [textoInput, setTextoInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState<CampeonatoNtxuva | null>(null);
  const [mensagemAviso, setMensagemAviso] = useState<string | null>(null);

  const mensagensFimRef = useRef<HTMLDivElement | null>(null);

  // Escutar mensagens do chat em tempo real via Firestore
  useEffect(() => {
    const unsub = comunidadeService.ouvirMensagensChat((novasMensagens) => {
      setMensagens(novasMensagens);
    });
    return () => unsub();
  }, []);

  // Escutar campeonatos em tempo real
  useEffect(() => {
    const unsub = comunidadeService.ouvirCampeonatos((lista) => {
      setCampeonatos(lista);
      if (campeonatoSelecionado) {
        const atual = lista.find((c) => c.id === campeonatoSelecionado.id);
        if (atual) setCampeonatoSelecionado(atual);
      }
    });
    return () => unsub();
  }, [campeonatoSelecionado]);

  // Escutar perfis ativos da comunidade
  useEffect(() => {
    const unsub = comunidadeService.ouvirPerfisComunidade((lista) => {
      setPerfisOnline(lista);
    });
    return () => unsub();
  }, []);

  // Auto-scroll para a mensagem mais recente
  useEffect(() => {
    if (abaAtiva === 'chat') {
      mensagensFimRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, abaAtiva]);

  const handleEnviarMensagem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const texto = textoInput.trim();
    if (!texto || enviando) return;

    setEnviando(true);
    try {
      await comunidadeService.enviarMensagemTexto(perfil, texto);
      setTextoInput('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarMensagemRapida = async (texto: string) => {
    try {
      await comunidadeService.enviarMensagemTexto(perfil, texto);
    } catch (err) {
      console.error('Erro ao enviar reação rápida:', err);
    }
  };

  const handlePublicarSalaAtual = async () => {
    if (!codigoSalaAtual) {
      onCriarSalaParaDesafio();
      return;
    }
    try {
      await comunidadeService.publicarConvitePartida(
        perfil,
        codigoSalaAtual,
        null,
        `🔥 Criei uma sala para jogar Ntxuva! Código: ${codigoSalaAtual}. Quem aceita o duelo?`
      );
      setMensagemAviso('Link da sua sala publicado no Chat!');
      setTimeout(() => setMensagemAviso(null), 3000);
    } catch (err) {
      console.error('Erro ao publicar sala:', err);
    }
  };

  const handleInscreverCampeonato = async (camp: CampeonatoNtxuva) => {
    const res = await comunidadeService.inscreverNoCampeonato(camp, perfil);
    setMensagemAviso(res.mensagem);
    setTimeout(() => setMensagemAviso(null), 3500);
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-fadeIn font-mono">
      {/* Container Principal Slide-Over (Largura total no mobile, max-w-lg em desktop) */}
      <div className="w-full max-w-lg h-full bg-[#180e07] border-l-2 border-[#4d2d18] flex flex-col shadow-2xl relative overflow-hidden animate-slideInRight">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ──────────────────────────────────────────────────────────
            1. CABEÇALHO DO CHAT & COMUNIDADE
            ────────────────────────────────────────────────────────── */}
        <div className="p-3.5 sm:p-4 bg-[#21130a] border-b border-[#442513] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wider">
                  Comunidade Ntxuva
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400">
                Jogadores do mundo · Desafios em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botão Meu Perfil */}
            <button
              type="button"
              onClick={onAbrirEditarPerfil}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2e190d] hover:bg-[#3b2011] border border-amber-600/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Editar Meu Perfil"
            >
              <span className="text-sm">{perfil.avatar}</span>
              <span className="max-w-[80px] truncate text-[11px] hidden sm:inline">{perfil.nome}</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onFechar}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 cursor-pointer transition-colors"
              title="Fechar Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            2. ABAS DE NAVEGAÇÃO: CHAT | CAMPEONATOS | JOGADORES
            ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 bg-[#1c1008] border-b border-[#3d2213] p-1 gap-1 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setAbaAtiva('chat')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              abaAtiva === 'chat'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#28160b]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Global</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('campeonatos')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              abaAtiva === 'campeonatos'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#28160b]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Campeonatos</span>
            {campeonatos.filter((c) => c.status === 'aberto').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-black">
                {campeonatos.filter((c) => c.status === 'aberto').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('jogadores')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              abaAtiva === 'jogadores'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#28160b]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Comunidade</span>
          </button>
        </div>

        {/* FEEDBACK INLINE DE AVISO */}
        {mensagemAviso && (
          <div className="mx-3 mt-2 px-3 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemAviso}</span>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            3. CONTEÚDO PRINCIPAL (DEPENDENDO DA ABA ATIVA)
            ────────────────────────────────────────────────────────── */}

        {/* ========================================================
            ABA 1: CHAT GLOBAL EM TEMPO REAL
            ======================================================== */}
        {abaAtiva === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Barra rápida de ação superior no Chat: Publicar Desafio */}
            <div className="p-2.5 bg-[#23140a] border-b border-[#3d2213] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Desafie alguém para o tabuleiro:</span>
              </div>
              <button
                type="button"
                onClick={handlePublicarSalaAtual}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <Swords className="w-3 h-3" />
                <span>{codigoSalaAtual ? `Publicar Sala ${codigoSalaAtual}` : 'Criar e Publicar Sala'}</span>
              </button>
            </div>

            {/* Lista com Rolagem das Mensagens */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {mensagens.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-stone-400">
                  <MessageSquare className="w-8 h-8 mx-auto text-stone-600 opacity-60" />
                  <p className="text-xs">Seja o primeiro a enviar uma mensagem ou convite!</p>
                  <button
                    type="button"
                    onClick={() => handleEnviarMensagemRapida('Olá a todos! Quem aceita uma partida de Ntxuva agora?')}
                    className="text-[11px] text-amber-400 underline hover:text-amber-300 cursor-pointer"
                  >
                    Dizer Olá à Comunidade 👋
                  </button>
                </div>
              ) : (
                mensagens.map((msg) => {
                  const ehMeu = msg.autorId === perfil.id;

                  // 1. MENSAGEM DO TIPO CONVITE DE JOGO
                  if (msg.tipo === 'convite_jogo' && msg.codigoSala) {
                    return (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl bg-gradient-to-r from-[#2a170c] via-[#331c0e] to-[#251308] border-2 border-emerald-500/60 shadow-lg space-y-2 animate-fadeIn"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{msg.autorAvatar}</span>
                            <div>
                              <strong className="text-xs text-amber-200 block">{msg.autorNome}</strong>
                              <span className="text-[10px] text-stone-400">{msg.autorPais}</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-wider">
                            Desafio Aberto
                          </span>
                        </div>

                        <p className="text-xs text-stone-200 font-medium">
                          {msg.texto}
                        </p>

                        <div className="pt-1 flex items-center justify-between gap-2">
                          <div className="text-xs font-black text-amber-400 bg-[#190d05] px-2.5 py-1 rounded-lg border border-[#442513]">
                            SALA: <span className="text-white tracking-widest">{msg.codigoSala}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onEntrarNaSalaOnline(msg.codigoSala!)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 border border-emerald-300"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Jogar Agora</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 2. MENSAGEM DO TIPO CAMPEONATO
                  if (msg.tipo === 'campeonato' && msg.campeonatoId) {
                    return (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl bg-gradient-to-r from-[#291408] via-[#361a09] to-[#240e04] border-2 border-amber-500/70 shadow-lg space-y-2 animate-fadeIn"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🏆</span>
                            <div>
                              <strong className="text-xs text-amber-300 block">{msg.campeonatoTitulo}</strong>
                              <span className="text-[10px] text-stone-400">Criado por {msg.autorNome}</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-bold uppercase tracking-wider">
                            Torneio
                          </span>
                        </div>

                        <p className="text-xs text-stone-200">
                          {msg.texto}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setAbaAtiva('campeonatos');
                            const camp = campeonatos.find((c) => c.id === msg.campeonatoId);
                            if (camp) setCampeonatoSelecionado(camp);
                          }}
                          className="w-full py-1.5 rounded-xl bg-[#2e190d] hover:bg-[#3d2111] border border-amber-500/60 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ver Detalhes & Inscrever-se</span>
                        </button>
                      </div>
                    );
                  }

                  // 3. MENSAGEM DE TEXTO PADRÃO
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${ehMeu ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#29170c] border border-[#522d17] flex items-center justify-center text-sm shrink-0">
                        {msg.autorAvatar}
                      </div>

                      <div className={`max-w-[82%] space-y-0.5 ${ehMeu ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                          <strong className="text-amber-300 font-bold">{msg.autorNome}</strong>
                          <span>·</span>
                          <span className="text-stone-500 truncate max-w-[100px]">{msg.autorPais}</span>
                        </div>

                        <div
                          className={`p-2.5 rounded-2xl text-xs font-sans font-medium leading-relaxed break-words shadow-xs ${
                            ehMeu
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold rounded-tr-xs'
                              : 'bg-[#29170c] border border-[#4d2d18] text-stone-200 rounded-tl-xs'
                          }`}
                        >
                          {msg.texto}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={mensagensFimRef} />
            </div>

            {/* Chips Rápidos de Expressões e Convites */}
            <div className="px-3 py-1.5 bg-[#1b0f08] border-t border-[#3d2213] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {[
                'Quem quer jogar?',
                'Aceito o desafio!',
                'Kanimambo!',
                'Belo lance!',
                'Vamos ao tabuleiro!',
              ].map((frase) => (
                <button
                  key={frase}
                  type="button"
                  onClick={() => handleEnviarMensagemRapida(frase)}
                  className="px-2 py-1 rounded-full bg-[#29170c] hover:bg-[#382012] border border-[#542d17] text-stone-300 hover:text-white text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {frase}
                </button>
              ))}
            </div>

            {/* Caixa de Entrada de Mensagem */}
            <form onSubmit={handleEnviarMensagem} className="p-2.5 bg-[#21130a] border-t border-[#442513] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={textoInput}
                onChange={(e) => setTextoInput(e.target.value)}
                placeholder="Escreva uma mensagem ou convite..."
                maxLength={250}
                className="flex-1 px-3 py-2 rounded-xl bg-[#2b170c] border border-[#522d17] focus:border-amber-400 focus:outline-hidden text-xs text-amber-100 placeholder:text-stone-500"
              />

              <button
                type="submit"
                disabled={!textoInput.trim() || enviando}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 text-stone-950 font-bold transition-all cursor-pointer shadow-sm"
                title="Enviar Mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            ABA 2: CAMPEONATOS & TORNEIOS DA COMUNIDADE
            ======================================================== */}
        {abaAtiva === 'campeonatos' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-3 space-y-3">
            {/* Botão no topo: Criar Campeonato */}
            <button
              type="button"
              onClick={onAbrirCriarCampeonato}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/50 border border-amber-300 active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Criar Novo Campeonato</span>
            </button>

            {/* Se tiver campeonato aberto em destaque */}
            {campeonatoSelecionado && (
              <div className="p-3.5 rounded-2xl bg-[#231309] border-2 border-amber-500/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-amber-200 uppercase">
                      {campeonatoSelecionado.titulo}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCampeonatoSelecionado(null)}
                    className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                  >
                    Voltar à lista
                  </button>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {campeonatoSelecionado.descricao}
                </p>

                {/* Vagas e Participantes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-bold">Participantes Inscritos:</span>
                    <span className="text-amber-300 font-black">
                      {campeonatoSelecionado.participantes.length} / {campeonatoSelecionado.maxParticipantes}
                    </span>
                  </div>

                  {/* Lista de Participantes */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {campeonatoSelecionado.participantes.map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-1.5 rounded-xl bg-[#2b170c] border border-[#4d2d18] flex items-center gap-2 text-xs"
                      >
                        <span className="text-sm">{p.avatar}</span>
                        <div className="truncate">
                          <strong className="text-amber-200 block truncate text-[11px]">{p.nome}</strong>
                          <span className="text-[9px] text-stone-400 truncate block">{p.pais}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chave de Partidas (Se em andamento ou finalizado) */}
                {campeonatoSelecionado.partidas && campeonatoSelecionado.partidas.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-800">
                    <div className="text-[11px] font-bold text-amber-300 uppercase">
                      Chave de Confrontos:
                    </div>

                    <div className="space-y-2">
                      {campeonatoSelecionado.partidas.map((partida) => {
                        const souEu1 = partida.jogador1?.id === perfil.id;
                        const souEu2 = partida.jogador2?.id === perfil.id;
                        const estouNaPartida = souEu1 || souEu2;

                        return (
                          <div
                            key={partida.id}
                            className="p-2.5 rounded-xl bg-[#1d0e06] border border-[#442513] space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[10px] text-stone-400">
                              <span>{partida.faseNome}</span>
                              <span className={`px-1.5 py-0.2 rounded-full uppercase font-bold text-[9px] ${
                                partida.status === 'concluida'
                                  ? 'bg-stone-800 text-stone-400'
                                  : partida.status === 'em_andamento'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-amber-950 text-amber-400'
                              }`}>
                                {partida.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold text-stone-200">
                              <span className={souEu1 ? 'text-amber-300 font-black' : ''}>
                                {partida.jogador1?.avatar} {partida.jogador1?.nome || 'Aguardando'}
                              </span>
                              <span className="text-stone-500 text-[10px]">VS</span>
                              <span className={souEu2 ? 'text-amber-300 font-black' : ''}>
                                {partida.jogador2?.avatar} {partida.jogador2?.nome || 'Aguardando'}
                              </span>
                            </div>

                            {/* Ações da Partida */}
                            {estouNaPartida && partida.status !== 'concluida' && (
                              <div className="pt-1 flex items-center gap-2">
                                {partida.codigoSala ? (
                                  <button
                                    type="button"
                                    onClick={() => onEntrarNaSalaOnline(partida.codigoSala!)}
                                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Entrar na Sala ({partida.codigoSala})</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Criar sala para a partida do campeonato
                                      onCriarSalaParaDesafio();
                                    }}
                                    className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Swords className="w-3.5 h-3.5" />
                                    <span>Criar Sala para este Duelo</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botão de Inscrição se Aberto */}
                {campeonatoSelecionado.status === 'aberto' && (
                  <button
                    type="button"
                    onClick={() => handleInscreverCampeonato(campeonatoSelecionado)}
                    disabled={
                      campeonatoSelecionado.participantes.some((p) => p.id === perfil.id) ||
                      campeonatoSelecionado.participantes.length >= campeonatoSelecionado.maxParticipantes
                    }
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>
                      {campeonatoSelecionado.participantes.some((p) => p.id === perfil.id)
                        ? 'Você Já Está Inscrito!'
                        : campeonatoSelecionado.participantes.length >= campeonatoSelecionado.maxParticipantes
                        ? 'Vagas Esgotadas'
                        : 'Inscrever-me Neste Campeonato'}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Lista Geral de Campeonatos */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Campeonatos Ativos & Recentes:
              </h3>

              {campeonatos.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#211309] border border-[#3d2213] text-center text-stone-400 space-y-2">
                  <Trophy className="w-8 h-8 mx-auto text-amber-500/50" />
                  <p className="text-xs">Nenhum campeonato criado ainda.</p>
                  <p className="text-[11px] text-stone-500">
                    Crie o primeiro torneio e convide a comunidade!
                  </p>
                </div>
              ) : (
                campeonatos.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-3 rounded-2xl bg-[#231309] hover:bg-[#2b170c] border border-[#442513] hover:border-amber-500/50 transition-all space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        <div>
                          <strong className="text-xs text-amber-200 block">{camp.titulo}</strong>
                          <span className="text-[10px] text-stone-400">Org: {camp.organizadorNome}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        camp.status === 'aberto'
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                          : camp.status === 'em_andamento'
                          ? 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                          : 'bg-stone-900 border-stone-700 text-stone-400'
                      }`}>
                        {camp.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-300 line-clamp-2">
                      {camp.descricao}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#341b0e]">
                      <span className="text-[10px] text-stone-400">
                        Vagas: <strong className="text-amber-300">{camp.participantes.length}/{camp.maxParticipantes}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => setCampeonatoSelecionado(camp)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-200 cursor-pointer"
                      >
                        <span>Abrir Quadro</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: JOGADORES ONLINE & COMUNIDADE
            ======================================================== */}
        {abaAtiva === 'jogadores' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-[#23140a] border border-[#3d2213] text-[11px] text-stone-300 leading-relaxed">
              🌍 Conecte-se e desafie jogadores ativos no Ntxuva. Cada desafio compartilhado cria uma partida oficial online!
            </div>

            <div className="space-y-2">
              {perfisOnline.map((jog) => {
                const ehVoce = jog.id === perfil.id;

                return (
                  <div
                    key={jog.id}
                    className="p-2.5 rounded-xl bg-[#24140b] border border-[#442513] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <span className="text-2xl">{jog.avatar}</span>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-stone-900" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-amber-200 truncate">
                            {jog.nome}
                          </strong>
                          {ehVoce && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {jog.pais} · {jog.vitorias || 0} vitórias
                        </div>
                      </div>
                    </div>

                    {!ehVoce && (
                      <button
                        type="button"
                        onClick={async () => {
                          // Convidar jogador no chat
                          await comunidadeService.enviarMensagemTexto(
                            perfil,
                            `⚔️ Olá @${jog.nome}! Convido-te para um duelo de Ntxuva. Aceitas o desafio?`
                          );
                          setAbaAtiva('chat');
                          setMensagemAviso(`Convite enviado a @${jog.nome} no chat!`);
                          setTimeout(() => setMensagemAviso(null), 3000);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#2d190e] hover:bg-[#3d2112] border border-amber-600/50 text-amber-300 hover:text-amber-200 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Swords className="w-3 h-3" />
                        <span>Desafiar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
