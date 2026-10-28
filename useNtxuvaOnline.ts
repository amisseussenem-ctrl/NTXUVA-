import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Jogador, PassoDistribuicao } from '../types/ntxuva';
import { 
  SalaPartidaPublica, 
  MensagemServidor, 
  MensagemCliente,
  ReacaoOnline 
} from '../types/online';

const STORAGE_KEY = 'ntxuva_online_session';

export interface SessionData {
  codigo: string;
  token: string;
  papel: Jogador;
  nome: string;
}

export function useNtxuvaOnline(
  onJogadaRecebida?: (passos: PassoDistribuicao[], casaInicial: number, jogador: Jogador, novoEstado: GameState) => void,
  onNotificacao?: (mensagem: string) => void,
  onReacaoRecebida?: (reacao: ReacaoOnline) => void
) {
  const [sala, setSala] = useState<SalaPartidaPublica | null>(null);
  const [seuPapel, setSeuPapel] = useState<Jogador | null>(null);
  const [conectado, setConectado] = useState(false);
  const [reconectando, setReconectando] = useState(false);
  const [tentativasReconexao, setTentativasReconexao] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaReacao, setUltimaReacao] = useState<ReacaoOnline | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<SessionData | null>(null);

  // Carregar sessão salva do localStorage
  const obterSessaoSalva = useCallback((): SessionData | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignorar
    }
    return null;
  }, []);

  const [sessaoSalva, setSessaoSalva] = useState<SessionData | null>(obterSessaoSalva);

  const salvarSessao = (dados: SessionData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
      sessionRef.current = dados;
      setSessaoSalva(dados);
    } catch {
      // Ignorar
    }
  };

  const limparSessao = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionRef.current = null;
      setSessaoSalva(null);
    } catch {
      // Ignorar
    }
  };

  // Conectar ao WebSocket com heartbeat e reconexão automática
  const conectarWebSocket = useCallback((codigo: string, token: string) => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConectado(true);
        setReconectando(false);
        setTentativasReconexao(0);

        // Enviar handshake de autenticação / reconexão
        const msg: MensagemCliente = {
          type: 'reconectar',
          codigo,
          token,
        };
        ws.send(JSON.stringify(msg));

        // Heartbeat ping a cada 20s
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const msg: MensagemServidor = JSON.parse(event.data);

          if (msg.type === 'estado_sincronizado') {
            setSala(msg.sala);
            if (msg.seuPapel) setSeuPapel(msg.seuPapel);
            if (msg.sala.ultimaReacao) {
              setUltimaReacao(msg.sala.ultimaReacao);
            }
          } else if (msg.type === 'partida_iniciada') {
            setSala(msg.sala);
            onNotificacao?.('Segundo jogador entrou na partida! A partida começou.');
          } else if (msg.type === 'jogada_executada') {
            setSala(msg.sala);
            onJogadaRecebida?.(msg.passos, msg.casaInicial, msg.jogador, msg.sala.gameState);
          } else if (msg.type === 'jogador_conectou') {
            setSala(msg.sala);
            if (msg.papel !== seuPapel) {
              onNotificacao?.(`${msg.papel} (${msg.nome}) conectou-se à partida.`);
            }
          } else if (msg.type === 'jogador_desconectou') {
            setSala(msg.sala);
            if (msg.papel !== seuPapel) {
              onNotificacao?.(`${msg.papel} desconectou-se temporariamente da partida.`);
            }
          } else if (msg.type === 'reacao_recebida') {
            setSala(msg.sala);
            setUltimaReacao(msg.reacao);
            onReacaoRecebida?.(msg.reacao);
          } else if (msg.type === 'tempo_esgotado') {
            setSala(msg.sala);
            onNotificacao?.(`Tempo de jogada esgotado para ${msg.jogador}!`);
          } else if (msg.type === 'proposta_empate') {
            setSala(msg.sala);
            onNotificacao?.(`${msg.proponente} propôs empate.`);
          } else if (msg.type === 'partida_encerrada') {
            setSala(msg.sala);
            onNotificacao?.(`Partida encerrada: ${msg.motivo}`);
          } else if (msg.type === 'erro') {
            setErro(msg.mensagem);
            onNotificacao?.(`Erro: ${msg.mensagem}`);
          }
        } catch {
          // Ignorar erros de parse
        }
      };

      ws.onclose = () => {
        setConectado(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Agendar reconexão automática se houver sessão ativa
        if (sessionRef.current) {
          setReconectando(true);
          setTentativasReconexao((prev) => prev + 1);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (sessionRef.current) {
              conectarWebSocket(sessionRef.current.codigo, sessionRef.current.token);
            }
          }, 2500);
        }
      };

      ws.onerror = () => {
        setConectado(false);
      };
    } catch {
      setConectado(false);
    }
  }, [onJogadaRecebida, onNotificacao, onReacaoRecebida, seuPapel]);

  // Criar Partida Online (com suporte ao temporizador opcional)
  const criarPartida = async (nome: string, tempoTurno?: number | null): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/partidas/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome,
          tempoTurno: tempoTurno !== undefined ? tempoTurno : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Falha ao criar partida');
      }

      const data = await res.json();
      setSala(data.sala);
      setSeuPapel(data.papel);
      salvarSessao({
        codigo: data.codigo,
        token: data.token,
        papel: data.papel,
        nome,
      });

      conectarWebSocket(data.codigo, data.token);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro de conexão');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // Entrar em Partida Existente com Código
  const entrarPartida = async (codigo: string, nome: string): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    try {
      const codigoFormatado = codigo.trim().toUpperCase();
      const res = await fetch('/api/partidas/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoFormatado, nome }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Não foi possível entrar na partida');
      }

      const data = await res.json();
      setSala(data.sala);
      setSeuPapel(data.papel);
      salvarSessao({
        codigo: data.codigo,
        token: data.token,
        papel: data.papel,
        nome,
      });

      conectarWebSocket(data.codigo, data.token);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao entrar na partida');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // Reconectar Automaticamente a Partida Ativa
  const tentarReconexao = useCallback(async (): Promise<boolean> => {
    const salva = sessionRef.current || obterSessaoSalva();
    if (!salva) return false;

    setReconectando(true);
    sessionRef.current = salva;
    setSessaoSalva(salva);

    try {
      const res = await fetch('/api/partidas/reconectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: salva.codigo, token: salva.token }),
      });

      if (res.ok) {
        const data = await res.json();
        setSala(data.sala);
        setSeuPapel(data.papel);
        setTentativasReconexao(0);
        conectarWebSocket(salva.codigo, salva.token);
        onNotificacao?.('Reconectado com sucesso à sala ' + salva.codigo);
        return true;
      } else {
        limparSessao();
        setSala(null);
        setSeuPapel(null);
        return false;
      }
    } catch {
      // Deixar na tentativa periódica se houver oscilação de rede
      return false;
    } finally {
      setReconectando(false);
    }
  }, [conectarWebSocket, obterSessaoSalva, onNotificacao]);

  // Executar Jogada (O Servidor é a Autoridade Suprema)
  const executarJogadaOnline = async (numeroCasa: number): Promise<boolean> => {
    if (!sala || !sessionRef.current) return false;

    // Se WebSocket estiver conectado, envia por socket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'fazer_jogada',
          codigo: sala.codigo,
          token: sessionRef.current.token,
          numeroCasa,
        })
      );
      return true;
    }

    // Fallback seguro via REST API
    try {
      const res = await fetch(`/api/partidas/${sala.codigo}/jogada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionRef.current.token,
          numeroCasa,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Jogada rejeitada pelo servidor');
      }

      const data = await res.json();
      setSala(data.sala);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao comunicar jogada ao servidor');
      return false;
    }
  };

  // Enviar Reação Rápida e Emoji
  const enviarReacao = async (texto: string, emoji?: string): Promise<boolean> => {
    if (!sala || !sessionRef.current) return false;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'enviar_reacao',
          codigo: sala.codigo,
          token: sessionRef.current.token,
          texto,
          emoji,
        })
      );
      return true;
    }

    // Fallback REST
    try {
      const res = await fetch(`/api/partidas/${sala.codigo}/reacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionRef.current.token,
          texto,
          emoji,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Propor Empate
  const proporEmpateOnline = async () => {
    if (!sala || !sessionRef.current) return;
    try {
      await fetch(`/api/partidas/${sala.codigo}/empate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionRef.current.token, acao: 'propor' }),
      });
    } catch {
      // Ignorar
    }
  };

  // Aceitar Empate
  const aceitarEmpateOnline = async () => {
    if (!sala || !sessionRef.current) return;
    try {
      await fetch(`/api/partidas/${sala.codigo}/empate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionRef.current.token, acao: 'aceitar' }),
      });
    } catch {
      // Ignorar
    }
  };

  // Recusar Empate
  const recusarEmpateOnline = async () => {
    if (!sala || !sessionRef.current) return;
    try {
      await fetch(`/api/partidas/${sala.codigo}/empate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionRef.current.token, acao: 'recusar' }),
      });
    } catch {
      // Ignorar
    }
  };

  // Reiniciar Partida no Servidor
  const reiniciarPartidaOnline = async () => {
    if (!sala || !sessionRef.current) return;
    try {
      await fetch(`/api/partidas/${sala.codigo}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionRef.current.token }),
      });
    } catch {
      // Ignorar
    }
  };

  // Desistir da Partida
  const desistirOnline = async () => {
    if (!sala || !sessionRef.current) return;
    try {
      await fetch(`/api/partidas/${sala.codigo}/desistir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionRef.current.token }),
      });
    } catch {
      // Ignorar
    }
  };

  // Sair da Sala e Limpar Sessão
  const sairDaSala = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    limparSessao();
    setSala(null);
    setSeuPapel(null);
    setConectado(false);
    setReconectando(false);
    setTentativasReconexao(0);
    setCarregando(false);
    setErro(null);
    setUltimaReacao(null);
  }, []);

  // Monitorar reconexão quando o navegador recupera a ligação de rede
  useEffect(() => {
    const handleOnline = () => {
      if (sessionRef.current) {
        onNotificacao?.('Ligação à internet restabelecida! A sincronizar sala...');
        tentarReconexao();
      }
    };

    const handleOffline = () => {
      setConectado(false);
      onNotificacao?.('Sem ligação à internet. Tentará reconectar assim que voltar.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tentarReconexao, onNotificacao]);

  // Efeito de inicialização: verificar se há sessão salva ao carregar a página
  useEffect(() => {
    tentarReconexao();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [tentarReconexao]);

  return {
    sala,
    seuPapel,
    conectado,
    reconectando,
    tentativasReconexao,
    carregando,
    erro,
    sessaoSalva,
    ultimaReacao,
    criarPartida,
    entrarPartida,
    executarJogadaOnline,
    enviarReacao,
    proporEmpateOnline,
    aceitarEmpateOnline,
    recusarEmpateOnline,
    reiniciarPartidaOnline,
    desistirOnline,
    sairDaSala,
    tentarReconexao,
    limparErro: () => setErro(null),
  };
}

