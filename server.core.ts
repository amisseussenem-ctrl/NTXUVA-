import express, { Request, Response } from 'express';
import fs from 'fs';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { 
  inicializarJogo, 
  podeIniciarJogada, 
  executarDistribuicao, 
  proporEmpate, 
  aceitarEmpate, 
  recusarEmpate, 
  alternarJogador,
  JOGADOR_A,
  JOGADOR_B
} from './src/models/ntxuva';
import { GameState, Jogador, PassoDistribuicao } from './src/types/ntxuva';
import { 
  SalaPartidaPublica, 
  InfoJogadorSala, 
  StatusSala, 
  MensagemCliente, 
  MensagemServidor,
  ReacaoOnline
} from './src/types/online';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determina com precisão a raiz do projeto (mesmo quando executado a partir de dist/server.js)
const projectRoot = fs.existsSync(path.join(__dirname, 'package.json'))
  ? __dirname
  : path.resolve(__dirname, '..');

const publicPath = path.join(projectRoot, 'public');
const distPath = path.join(projectRoot, 'dist');

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

interface JogadorPrivado extends InfoJogadorSala {
  token: string;
  ws?: WebSocket | null;
}

interface SalaServidor {
  codigo: string;
  status: StatusSala;
  jogadorA: JogadorPrivado;
  jogadorB: JogadorPrivado | null;
  gameState: GameState;
  criadoEm: number;
  atualizadoEm: number;
  passosUltimaJogada: PassoDistribuicao[];
  ultimoMovimento?: {
    casaInicial: number;
    jogador: Jogador;
    timestamp: number;
  } | null;
  tempoTurnoSegundos?: number | null;
  turnoIniciadoEm?: number | null;
  ultimaReacao?: ReacaoOnline | null;
}

// Armazenamento em memória das partidas gerenciadas pelo servidor (autoridade central)
const salas = new Map<string, SalaServidor>();

function gerarCodigoSala(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = 'NTX-';
  for (let i = 0; i < 3; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (salas.has(codigo)) {
    return gerarCodigoSala();
  }
  return codigo;
}

function gerarToken(): string {
  return crypto.randomUUID();
}

function toPublicSala(sala: SalaServidor): SalaPartidaPublica {
  return {
    codigo: sala.codigo,
    status: sala.status,
    jogadorA: {
      id: sala.jogadorA.id,
      nome: sala.jogadorA.nome,
      papel: sala.jogadorA.papel,
      conectado: sala.jogadorA.conectado,
      ultimaAtividade: sala.jogadorA.ultimaAtividade,
    },
    jogadorB: sala.jogadorB
      ? {
          id: sala.jogadorB.id,
          nome: sala.jogadorB.nome,
          papel: sala.jogadorB.papel,
          conectado: sala.jogadorB.conectado,
          ultimaAtividade: sala.jogadorB.ultimaAtividade,
        }
      : null,
    gameState: sala.gameState,
    criadoEm: sala.criadoEm,
    atualizadoEm: sala.atualizadoEm,
    ultimoMovimento: sala.ultimoMovimento,
    passosUltimaJogada: sala.passosUltimaJogada,
    tempoTurnoSegundos: sala.tempoTurnoSegundos ?? null,
    turnoIniciadoEm: sala.turnoIniciadoEm ?? null,
    ultimaReacao: sala.ultimaReacao ?? null,
  };
}

function broadcastParaSala(sala: SalaServidor, mensagem: MensagemServidor) {
  const payload = JSON.stringify(mensagem);
  [sala.jogadorA, sala.jogadorB].forEach((jog) => {
    if (jog && jog.ws && jog.ws.readyState === WebSocket.OPEN) {
      jog.ws.send(payload);
    }
  });
}

const app = express();
app.use(express.json());

// ==========================================
// ROTAS REST DE GERENCIAMENTO DE PARTIDAS
// ==========================================

// 1. Criação de Partida com suporte a Temporizador opcional
app.post('/api/partidas/criar', (req: Request, res: Response) => {
  try {
    const nome = req.body?.nome?.trim() || 'Jogador 1';
    const tempoTurno = req.body?.tempoTurno !== undefined && req.body?.tempoTurno !== null
      ? Number(req.body.tempoTurno)
      : null;
    const tempoTurnoSegundos = tempoTurno && [30, 45, 60].includes(tempoTurno) ? tempoTurno : null;

    const codigo = gerarCodigoSala();
    const token = gerarToken();
    const jogadorId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const novaSala: SalaServidor = {
      codigo,
      status: 'aguardando_adversario',
      jogadorA: {
        id: jogadorId,
        nome,
        papel: JOGADOR_A,
        conectado: false,
        ultimaAtividade: Date.now(),
        token,
      },
      jogadorB: null,
      gameState: inicializarJogo(),
      criadoEm: Date.now(),
      atualizadoEm: Date.now(),
      passosUltimaJogada: [],
      ultimoMovimento: null,
      tempoTurnoSegundos,
      turnoIniciadoEm: null,
      ultimaReacao: null,
    };

    salas.set(codigo, novaSala);

    res.json({
      codigo,
      token,
      papel: JOGADOR_A,
      sala: toPublicSala(novaSala),
    });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao criar partida' });
  }
});

// 2. Entrada do Segundo Jogador
app.post('/api/partidas/entrar', (req: Request, res: Response) => {
  try {
    const codigo = req.body?.codigo?.trim().toUpperCase();
    const nome = req.body?.nome?.trim() || 'Jogador 2';

    if (!codigo || !salas.has(codigo)) {
      return res.status(404).json({ erro: 'Partida não encontrada. Verifique o código informado.' });
    }

    const sala = salas.get(codigo)!;

    // Se já tiver jogador B e não for reconexão
    if (sala.jogadorB !== null) {
      return res.status(400).json({ erro: 'Esta partida já possui dois jogadores.' });
    }

    const token = gerarToken();
    const jogadorId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    sala.jogadorB = {
      id: jogadorId,
      nome,
      papel: JOGADOR_B,
      conectado: false,
      ultimaAtividade: Date.now(),
      token,
    };

    sala.status = 'em_andamento';
    sala.atualizadoEm = Date.now();
    if (sala.tempoTurnoSegundos) {
      sala.turnoIniciadoEm = Date.now();
    }

    // Notificar Jogador A
    broadcastParaSala(sala, {
      type: 'partida_iniciada',
      sala: toPublicSala(sala),
    });

    res.json({
      codigo,
      token,
      papel: JOGADOR_B,
      sala: toPublicSala(sala),
    });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao entrar na partida' });
  }
});

// 3. Reconexão e Consulta de Partida
app.post('/api/partidas/reconectar', (req: Request, res: Response) => {
  try {
    const codigo = req.body?.codigo?.trim().toUpperCase();
    const token = req.body?.token?.trim();

    if (!codigo || !token || !salas.has(codigo)) {
      return res.status(404).json({ erro: 'Partida ou credenciais não encontradas.' });
    }

    const sala = salas.get(codigo)!;
    let papel: Jogador | null = null;

    if (sala.jogadorA.token === token) {
      papel = JOGADOR_A;
      sala.jogadorA.ultimaAtividade = Date.now();
    } else if (sala.jogadorB && sala.jogadorB.token === token) {
      papel = JOGADOR_B;
      sala.jogadorB.ultimaAtividade = Date.now();
    }

    if (!papel) {
      return res.status(403).json({ erro: 'Token inválido para esta partida.' });
    }

    res.json({
      sucesso: true,
      papel,
      sala: toPublicSala(sala),
    });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao reconectar à partida' });
  }
});

// 4. Consulta do Estado Público da Partida
app.get('/api/partidas/:codigo', (req: Request, res: Response) => {
  const codigo = req.params.codigo.trim().toUpperCase();
  if (!salas.has(codigo)) {
    return res.status(404).json({ erro: 'Partida não encontrada.' });
  }
  const sala = salas.get(codigo)!;
  res.json({ sala: toPublicSala(sala) });
});

// 5. Execução de Jogada com Autoridade do Servidor
app.post('/api/partidas/:codigo/jogada', (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();
    const token = req.body?.token?.trim();
    const numeroCasa = parseInt(req.body?.numeroCasa, 10);

    if (!salas.has(codigo)) {
      return res.status(404).json({ erro: 'Partida não encontrada.' });
    }

    const sala = salas.get(codigo)!;

    if (sala.status !== 'em_andamento') {
      return res.status(400).json({ erro: `A partida não está em andamento (status: ${sala.status}).` });
    }

    // Identificar jogador pelo token do servidor
    let papelJogador: Jogador | null = null;
    if (sala.jogadorA.token === token) papelJogador = JOGADOR_A;
    else if (sala.jogadorB && sala.jogadorB.token === token) papelJogador = JOGADOR_B;

    if (!papelJogador) {
      return res.status(403).json({ erro: 'Não autorizado. Token de jogador inválido.' });
    }

    // 1. O SERVIDOR VALIDA SE É A VEZ DO JOGADOR
    if (sala.gameState.jogadorAtual !== papelJogador) {
      return res.status(400).json({
        erro: `Não é a sua vez. A vez atual é do ${sala.gameState.jogadorAtual}.`,
      });
    }

    // 2. O SERVIDOR EXECUTA O MOTOR PARA VALIDAR SE A CASA É VÁLIDA
    const validacao = podeIniciarJogada(sala.gameState, numeroCasa);
    if (!validacao.valido) {
      return res.status(400).json({ erro: validacao.motivo || 'Movimento inválido segundo as regras do NTXUVA.' });
    }

    // 3. O SERVIDOR EXECUTA A DISTRIBUIÇÃO E CAPTURAS AUTORITATIVAS
    const { novoEstado, passos } = executarDistribuicao(sala.gameState, numeroCasa, true);

    sala.gameState = novoEstado;
    sala.passosUltimaJogada = passos;
    sala.ultimoMovimento = {
      casaInicial: numeroCasa,
      jogador: papelJogador,
      timestamp: Date.now(),
    };
    sala.atualizadoEm = Date.now();

    // 4. O SERVIDOR VERIFICA CONDIÇÃO DE VITÓRIA OU ENCERRAMENTO
    if (novoEstado.estadoDaPartida === 'FINALIZADA') {
      sala.status = 'finalizada';
      sala.turnoIniciadoEm = null;
    } else if (novoEstado.estadoDaPartida === 'EMPATE') {
      sala.status = 'empate';
      sala.turnoIniciadoEm = null;
    } else if (sala.status === 'em_andamento' && sala.tempoTurnoSegundos) {
      sala.turnoIniciadoEm = Date.now();
    }

    // Transmitir para ambos os jogadores via WebSocket
    broadcastParaSala(sala, {
      type: 'jogada_executada',
      sala: toPublicSala(sala),
      passos,
      casaInicial: numeroCasa,
      jogador: papelJogador,
    });

    res.json({
      sucesso: true,
      sala: toPublicSala(sala),
      passos,
    });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao processar jogada no servidor.' });
  }
});

// 6. Propor / Aceitar / Recusar Empate no Servidor
app.post('/api/partidas/:codigo/empate', (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();
    const token = req.body?.token?.trim();
    const acao = req.body?.acao; // 'propor' | 'aceitar' | 'recusar'

    if (!salas.has(codigo)) return res.status(404).json({ erro: 'Partida não encontrada.' });
    const sala = salas.get(codigo)!;

    let papel: Jogador | null = null;
    if (sala.jogadorA.token === token) papel = JOGADOR_A;
    else if (sala.jogadorB && sala.jogadorB.token === token) papel = JOGADOR_B;

    if (!papel) return res.status(403).json({ erro: 'Token inválido.' });

    if (acao === 'propor') {
      sala.gameState = proporEmpate(sala.gameState, papel);
      broadcastParaSala(sala, {
        type: 'proposta_empate',
        proponente: papel,
        sala: toPublicSala(sala),
      });
    } else if (acao === 'aceitar') {
      sala.gameState = aceitarEmpate(sala.gameState, papel);
      sala.status = 'empate';
      broadcastParaSala(sala, {
        type: 'partida_encerrada',
        motivo: 'Empate acordado mutuamente entre os jogadores.',
        sala: toPublicSala(sala),
      });
    } else if (acao === 'recusar') {
      sala.gameState = recusarEmpate(sala.gameState, papel);
      broadcastParaSala(sala, {
        type: 'estado_sincronizado',
        sala: toPublicSala(sala),
        seuPapel: null,
      });
    }

    res.json({ sucesso: true, sala: toPublicSala(sala) });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao processar empate.' });
  }
});

// 7. Reiniciar Partida pelo Servidor
app.post('/api/partidas/:codigo/reiniciar', (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();
    const token = req.body?.token?.trim();

    if (!salas.has(codigo)) return res.status(404).json({ erro: 'Partida não encontrada.' });
    const sala = salas.get(codigo)!;

    if (sala.jogadorA.token !== token && sala.jogadorB?.token !== token) {
      return res.status(403).json({ erro: 'Apenas os jogadores da partida podem reiniciá-la.' });
    }

    sala.gameState = inicializarJogo();
    sala.status = sala.jogadorB ? 'em_andamento' : 'aguardando_adversario';
    sala.passosUltimaJogada = [];
    sala.ultimoMovimento = null;
    sala.atualizadoEm = Date.now();

    broadcastParaSala(sala, {
      type: 'estado_sincronizado',
      sala: toPublicSala(sala),
      seuPapel: null,
    });

    res.json({ sucesso: true, sala: toPublicSala(sala) });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao reiniciar partida.' });
  }
});

// 8. Desistência / Abandono
app.post('/api/partidas/:codigo/desistir', (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();
    const token = req.body?.token?.trim();

    if (!salas.has(codigo)) return res.status(404).json({ erro: 'Partida não encontrada.' });
    const sala = salas.get(codigo)!;

    let desistente: Jogador | null = null;
    if (sala.jogadorA.token === token) desistente = JOGADOR_A;
    else if (sala.jogadorB?.token === token) desistente = JOGADOR_B;

    if (!desistente) return res.status(403).json({ erro: 'Token inválido.' });

    const vencedor = alternarJogador(desistente);
    sala.gameState.estadoDaPartida = 'FINALIZADA';
    sala.gameState.vencedor = vencedor;
    sala.status = 'finalizada';
    sala.turnoIniciadoEm = null;

    broadcastParaSala(sala, {
      type: 'partida_encerrada',
      motivo: `${desistente} desistiu da partida. Vitória atribuída a ${vencedor}.`,
      sala: toPublicSala(sala),
    });

    res.json({ sucesso: true, sala: toPublicSala(sala) });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao processar desistência.' });
  }
});

// 9. Envio de Reação Rápida / Emoji via REST
app.post('/api/partidas/:codigo/reacao', (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();
    const token = req.body?.token?.trim();
    const texto = req.body?.texto?.trim() || '';
    const emoji = req.body?.emoji?.trim();

    if (!salas.has(codigo)) return res.status(404).json({ erro: 'Partida não encontrada.' });
    const sala = salas.get(codigo)!;

    let papel: Jogador | null = null;
    let nome = '';
    if (sala.jogadorA.token === token) {
      papel = JOGADOR_A;
      nome = sala.jogadorA.nome;
    } else if (sala.jogadorB && sala.jogadorB.token === token) {
      papel = JOGADOR_B;
      nome = sala.jogadorB.nome;
    }

    if (!papel) return res.status(403).json({ erro: 'Token inválido.' });

    const reacao: ReacaoOnline = {
      id: `reac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jogador: papel,
      nome,
      texto: texto.slice(0, 50),
      emoji: emoji || undefined,
      timestamp: Date.now(),
    };

    sala.ultimaReacao = reacao;

    broadcastParaSala(sala, {
      type: 'reacao_recebida',
      reacao,
      sala: toPublicSala(sala),
    });

    res.json({ sucesso: true, reacao });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro ao enviar reação.' });
  }
});

// ==========================================
// TEMPORIZADOR DE TURNO DO SERVIDOR (30s / 45s / 60s)
// ==========================================
setInterval(() => {
  const agora = Date.now();
  salas.forEach((sala) => {
    if (
      sala.status === 'em_andamento' &&
      sala.tempoTurnoSegundos &&
      sala.turnoIniciadoEm &&
      sala.jogadorB && // Dois jogadores presentes
      sala.gameState.estadoDaPartida === 'EM_ANDAMENTO'
    ) {
      const segundosDecorridos = Math.floor((agora - sala.turnoIniciadoEm) / 1000);
      if (segundosDecorridos >= sala.tempoTurnoSegundos) {
        // Tempo do jogador atual esgotou!
        const jogadorPerdedor = sala.gameState.jogadorAtual;
        const jogadorVencedor = alternarJogador(jogadorPerdedor);

        sala.gameState.estadoDaPartida = 'FINALIZADA';
        sala.gameState.vencedor = jogadorVencedor;
        sala.gameState.tipoVitoria = 'eliminacao';
        sala.gameState.motivoVitoria = `TEMPO ESGOTADO: O tempo de ${jogadorPerdedor} (${sala.tempoTurnoSegundos}s) esgotou-se! Vitória concedida a ${jogadorVencedor}.`;
        sala.status = 'finalizada';
        sala.atualizadoEm = agora;
        sala.turnoIniciadoEm = null;

        broadcastParaSala(sala, {
          type: 'tempo_esgotado',
          jogador: jogadorPerdedor,
          sala: toPublicSala(sala),
        });

        broadcastParaSala(sala, {
          type: 'partida_encerrada',
          motivo: `O tempo de ${jogadorPerdedor} (${sala.tempoTurnoSegundos}s) esgotou-se! Vitória atribuída a ${jogadorVencedor}.`,
          sala: toPublicSala(sala),
        });
      }
    }
  });
}, 1000);

// ==========================================
// CONFIGURAÇÃO DO SERVIDOR HTTP E WEBSOCKET
// ==========================================
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let codigoSalaAtual: string | null = null;
  let papelAtual: Jogador | null = null;

  ws.on('message', (dados: string) => {
    try {
      const msg: MensagemCliente = JSON.parse(dados.toString());

      if (msg.type === 'ping') {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
        return;
      }

      if (msg.type === 'entrar_sala' || msg.type === 'reconectar') {
        const codigo = msg.codigo?.trim().toUpperCase();
        const token = msg.token?.trim();

        if (!codigo || !salas.has(codigo)) {
          ws.send(JSON.stringify({ type: 'erro', mensagem: 'Partida não encontrada.' }));
          return;
        }

        const sala = salas.get(codigo)!;
        let papelIdentificado: Jogador | null = null;

        if (token) {
          if (sala.jogadorA.token === token) {
            papelIdentificado = JOGADOR_A;
            sala.jogadorA.ws = ws;
            sala.jogadorA.conectado = true;
            sala.jogadorA.ultimaAtividade = Date.now();
          } else if (sala.jogadorB && sala.jogadorB.token === token) {
            papelIdentificado = JOGADOR_B;
            sala.jogadorB.ws = ws;
            sala.jogadorB.conectado = true;
            sala.jogadorB.ultimaAtividade = Date.now();
          }
        }

        codigoSalaAtual = codigo;
        papelAtual = papelIdentificado;

        // Responder com estado sincronizado
        ws.send(
          JSON.stringify({
            type: 'estado_sincronizado',
            sala: toPublicSala(sala),
            seuPapel: papelIdentificado,
          })
        );

        if (papelIdentificado) {
          broadcastParaSala(sala, {
            type: 'jogador_conectou',
            papel: papelIdentificado,
            nome: papelIdentificado === JOGADOR_A ? sala.jogadorA.nome : sala.jogadorB!.nome,
            sala: toPublicSala(sala),
          });
        }
      }

      if (msg.type === 'fazer_jogada') {
        const codigo = msg.codigo?.trim().toUpperCase();
        const token = msg.token?.trim();
        const numeroCasa = msg.numeroCasa;

        if (!codigo || !salas.has(codigo)) return;
        const sala = salas.get(codigo)!;

        let papel: Jogador | null = null;
        if (sala.jogadorA.token === token) papel = JOGADOR_A;
        else if (sala.jogadorB && sala.jogadorB.token === token) papel = JOGADOR_B;

        if (!papel || sala.gameState.jogadorAtual !== papel) {
          ws.send(JSON.stringify({ type: 'erro', mensagem: 'Não é a sua vez de jogar.' }));
          return;
        }

        const validacao = podeIniciarJogada(sala.gameState, numeroCasa);
        if (!validacao.valido) {
          ws.send(JSON.stringify({ type: 'erro', mensagem: validacao.motivo || 'Jogada inválida.' }));
          return;
        }

        // Execução pelo motor no servidor
        const { novoEstado, passos } = executarDistribuicao(sala.gameState, numeroCasa, true);
        sala.gameState = novoEstado;
        sala.passosUltimaJogada = passos;
        sala.ultimoMovimento = {
          casaInicial: numeroCasa,
          jogador: papel,
          timestamp: Date.now(),
        };
        sala.atualizadoEm = Date.now();

        if (novoEstado.estadoDaPartida === 'FINALIZADA') {
          sala.status = 'finalizada';
          sala.turnoIniciadoEm = null;
        } else if (novoEstado.estadoDaPartida === 'EMPATE') {
          sala.status = 'empate';
          sala.turnoIniciadoEm = null;
        } else if (sala.status === 'em_andamento' && sala.tempoTurnoSegundos) {
          sala.turnoIniciadoEm = Date.now();
        }

        broadcastParaSala(sala, {
          type: 'jogada_executada',
          sala: toPublicSala(sala),
          passos,
          casaInicial: numeroCasa,
          jogador: papel,
        });
      }

      if (msg.type === 'enviar_reacao') {
        const codigo = msg.codigo?.trim().toUpperCase();
        const token = msg.token?.trim();
        const texto = msg.texto?.trim() || '';
        const emoji = msg.emoji?.trim();

        if (!codigo || !salas.has(codigo)) return;
        const sala = salas.get(codigo)!;

        let papel: Jogador | null = null;
        let nome = '';
        if (sala.jogadorA.token === token) {
          papel = JOGADOR_A;
          nome = sala.jogadorA.nome;
        } else if (sala.jogadorB && sala.jogadorB.token === token) {
          papel = JOGADOR_B;
          nome = sala.jogadorB.nome;
        }

        if (!papel) return;

        const reacao: ReacaoOnline = {
          id: `reac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          jogador: papel,
          nome,
          texto: texto.slice(0, 50),
          emoji: emoji || undefined,
          timestamp: Date.now(),
        };

        sala.ultimaReacao = reacao;

        broadcastParaSala(sala, {
          type: 'reacao_recebida',
          reacao,
          sala: toPublicSala(sala),
        });
      }

      if (msg.type === 'reiniciar_partida') {
        const codigo = msg.codigo?.trim().toUpperCase();
        const token = msg.token?.trim();
        if (!codigo || !salas.has(codigo)) return;
        const sala = salas.get(codigo)!;
        if (sala.jogadorA.token !== token && sala.jogadorB?.token !== token) return;

        sala.gameState = inicializarJogo();
        sala.status = sala.jogadorB ? 'em_andamento' : 'aguardando_adversario';
        sala.passosUltimaJogada = [];
        sala.ultimoMovimento = null;
        sala.atualizadoEm = Date.now();
        sala.turnoIniciadoEm = sala.status === 'em_andamento' && sala.tempoTurnoSegundos ? Date.now() : null;

        broadcastParaSala(sala, {
          type: 'estado_sincronizado',
          sala: toPublicSala(sala),
          seuPapel: null,
        });
      }

      if (msg.type === 'desistir') {
        const codigo = msg.codigo?.trim().toUpperCase();
        const token = msg.token?.trim();
        if (!codigo || !salas.has(codigo)) return;
        const sala = salas.get(codigo)!;

        let desistente: Jogador | null = null;
        if (sala.jogadorA.token === token) desistente = JOGADOR_A;
        else if (sala.jogadorB && sala.jogadorB.token === token) desistente = JOGADOR_B;
        if (!desistente) return;

        const vencedor = alternarJogador(desistente);
        sala.gameState.estadoDaPartida = 'FINALIZADA';
        sala.gameState.vencedor = vencedor;
        sala.status = 'finalizada';
        sala.turnoIniciadoEm = null;

        broadcastParaSala(sala, {
          type: 'partida_encerrada',
          motivo: `${desistente} desistiu da partida. Vitória atribuída a ${vencedor}.`,
          sala: toPublicSala(sala),
        });
      }
    } catch (err: any) {
      ws.send(JSON.stringify({ type: 'erro', mensagem: err?.message || 'Erro no processamento da mensagem.' }));
    }
  });

  ws.on('close', () => {
    if (codigoSalaAtual && salas.has(codigoSalaAtual) && papelAtual) {
      const sala = salas.get(codigoSalaAtual)!;
      if (papelAtual === JOGADOR_A && sala.jogadorA.ws === ws) {
        sala.jogadorA.conectado = false;
        sala.jogadorA.ws = null;
        broadcastParaSala(sala, {
          type: 'jogador_desconectou',
          papel: JOGADOR_A,
          sala: toPublicSala(sala),
        });
      } else if (papelAtual === JOGADOR_B && sala.jogadorB?.ws === ws) {
        sala.jogadorB.conectado = false;
        sala.jogadorB.ws = null;
        broadcastParaSala(sala, {
          type: 'jogador_desconectou',
          papel: JOGADOR_B,
          sala: toPublicSala(sala),
        });
      }
    }
  });
});

// ==========================================
// CONFIGURAÇÃO DO FRONTEND (DEV E PROD)
// ==========================================
export async function iniciarServidor() {
  app.use(express.static(publicPath));

  app.get('/manifest.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=UTF-8');
    res.sendFile(path.join(publicPath, 'manifest.json'));
  });
  app.get('/manifest.webmanifest', (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=UTF-8');
    res.sendFile(path.join(publicPath, 'manifest.webmanifest'));
  });
  app.get('/sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(publicPath, 'sw.js'));
  });

  const enviarZip = (_req: Request, res: Response) => {
    const zipPath = path.join(publicPath, 'ntxuva-jogo-completo.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'ntxuva-jogo-completo.zip');
    } else {
      res.status(404).send('Ficheiro ZIP não encontrado.');
    }
  };
  app.get('/ntxuva-jogo-completo.zip', enviarZip);
  app.get('/download-zip', enviarZip);

  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction || !hasDist) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.join(projectRoot, 'index.html');
        if (!fs.existsSync(templatePath)) return next();
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        if (vite && typeof vite.ssrFixStacktrace === 'function') {
          vite.ssrFixStacktrace(e as Error);
        }
        next(e);
      }
    });
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const htmlPath = path.join(distPath, 'index.html');
      if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
      } else {
        res.sendFile(path.join(projectRoot, 'index.html'));
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[NTXUVA Server] Servidor online rodando em http://localhost:${PORT}`);
  });
}

iniciarServidor().catch((err) => {
  console.error('[NTXUVA Server] Falha ao iniciar:', err);
  process.exit(1);
});
