import { GameState, Jogador, PassoDistribuicao } from './ntxuva';

export type StatusSala = 'aguardando_adversario' | 'em_andamento' | 'finalizada' | 'empate';

export interface InfoJogadorSala {
  id: string;
  nome: string;
  papel: Jogador; // 'Jogador A' | 'Jogador B'
  conectado: boolean;
  ultimaAtividade: number;
}

export interface ReacaoOnline {
  id: string;
  jogador: Jogador;
  nome: string;
  texto: string;
  emoji?: string;
  timestamp: number;
}

export interface SalaPartidaPublica {
  codigo: string;
  status: StatusSala;
  jogadorA: InfoJogadorSala;
  jogadorB: InfoJogadorSala | null;
  gameState: GameState;
  criadoEm: number;
  atualizadoEm: number;
  ultimoMovimento?: {
    casaInicial: number;
    jogador: Jogador;
    timestamp: number;
  } | null;
  passosUltimaJogada?: PassoDistribuicao[];
  // Relógio de Turno (Temporizador)
  tempoTurnoSegundos?: number | null; // ex: 30, 45, 60 ou null (sem limite)
  turnoIniciadoEm?: number | null; // timestamp ms de início do lance atual
  // Reações Rápidas e Emojis
  ultimaReacao?: ReacaoOnline | null;
}

export interface RespostaCriarSala {
  codigo: string;
  token: string;
  papel: Jogador;
  sala: SalaPartidaPublica;
}

export interface RespostaEntrarSala {
  codigo: string;
  token: string;
  papel: Jogador;
  sala: SalaPartidaPublica;
}

export interface RespostaReconectar {
  sucesso: boolean;
  papel: Jogador;
  sala: SalaPartidaPublica;
}

export type MensagemCliente =
  | { type: 'entrar_sala'; codigo: string; token?: string; nome?: string }
  | { type: 'reconectar'; codigo: string; token: string }
  | { type: 'fazer_jogada'; codigo: string; token: string; numeroCasa: number }
  | { type: 'enviar_reacao'; codigo: string; token: string; texto: string; emoji?: string }
  | { type: 'propor_empate'; codigo: string; token: string }
  | { type: 'aceitar_empate'; codigo: string; token: string }
  | { type: 'recusar_empate'; codigo: string; token: string }
  | { type: 'reiniciar_partida'; codigo: string; token: string }
  | { type: 'desistir'; codigo: string; token: string }
  | { type: 'ping' };

export type MensagemServidor =
  | { type: 'estado_sincronizado'; sala: SalaPartidaPublica; seuPapel: Jogador | null }
  | { type: 'jogada_executada'; sala: SalaPartidaPublica; passos: PassoDistribuicao[]; casaInicial: number; jogador: Jogador }
  | { type: 'jogador_conectou'; papel: Jogador; nome: string; sala: SalaPartidaPublica }
  | { type: 'jogador_desconectou'; papel: Jogador; sala: SalaPartidaPublica }
  | { type: 'partida_iniciada'; sala: SalaPartidaPublica }
  | { type: 'reacao_recebida'; reacao: ReacaoOnline; sala: SalaPartidaPublica }
  | { type: 'tempo_esgotado'; jogador: Jogador; sala: SalaPartidaPublica }
  | { type: 'proposta_empate'; proponente: Jogador; sala: SalaPartidaPublica }
  | { type: 'partida_encerrada'; motivo: string; sala: SalaPartidaPublica }
  | { type: 'erro'; mensagem: string }
  | { type: 'pong' };

// ==========================================
// COMUNIDADE GLOBAL, CHAT E CAMPEONATOS
// ==========================================

export interface PerfilJogador {
  id: string;
  nome: string;
  avatar: string;
  pais: string;
  bio?: string;
  vitorias: number;
  derrotas: number;
  partidas: number;
  online: boolean;
  ultimaAtividade: number;
}

export type TipoMensagemChat = 'texto' | 'convite_jogo' | 'campeonato';

export interface MensagemChat {
  id: string;
  autorId: string;
  autorNome: string;
  autorAvatar: string;
  autorPais: string;
  texto: string;
  tipo: TipoMensagemChat;
  codigoSala?: string;
  tempoTurno?: number | null;
  campeonatoId?: string;
  campeonatoTitulo?: string;
  criadoEm: number;
}

export interface ParticipanteCampeonato {
  id: string;
  nome: string;
  avatar: string;
  pais: string;
  vitorias?: number;
  inscritoEm: number;
}

export interface PartidaCampeonato {
  id: string;
  rodada: number;
  faseNome: string;
  jogador1: ParticipanteCampeonato | null;
  jogador2: ParticipanteCampeonato | null;
  codigoSala?: string;
  vencedorId?: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
}

export interface CampeonatoNtxuva {
  id: string;
  titulo: string;
  descricao: string;
  organizadorId: string;
  organizadorNome: string;
  organizadorAvatar: string;
  organizadorPais: string;
  maxParticipantes: number; // 4, 8 ou 16
  participantes: ParticipanteCampeonato[];
  partidas?: PartidaCampeonato[];
  status: 'aberto' | 'em_andamento' | 'finalizado';
  vencedorId?: string;
  vencedorNome?: string;
  tempoTurnoSegundos?: number | null;
  criadoEm: number;
}

