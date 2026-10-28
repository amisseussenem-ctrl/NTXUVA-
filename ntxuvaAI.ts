import { GameState, Jogador, DificuldadeIA } from '../types/ntxuva';
import { 
  podeIniciarJogada, 
  executarDistribuicao, 
  alternarJogador,
  JOGADOR_B,
  JOGADOR_A 
} from './ntxuva';

export interface DecisaoIA {
  casaEscolhida: number;
  pontuacao: number;
  totalCapturasEsperadas: number;
  passosEstimados: number;
  motivo: string;
}

/**
 * Retorna todos os lances legais que um jogador pode iniciar no estado atual
 */
export function obterLancesValidos(estado: GameState, jogador: Jogador): number[] {
  return estado.casas
    .filter((c) => c.proprietario === jogador && c.quantidadeDePedras >= 2)
    .map((c) => c.numero)
    .filter((casa) => podeIniciarJogada(estado, casa).valido);
}

/**
 * Avaliação Mestre ("Kota do Ntxuva"):
 * - Minimax / Lookahead de 2 a 3 jogadas à frente (simula resposta do adversário e contra-ataque)
 * - Evita casas vulneráveis (deduz dano máximo do adversário)
 * - Arma ciladas (posicionamento estratégico na linha de ataque)
 * - Detecta vitória imediata ou asfixia forçada do adversário
 */
function avaliarLanceMestre(
  estado: GameState,
  casa: number,
  jogadorIA: Jogador
): { pontuacao: number; totalCapturas: number; passos: number; motivo: string } {
  const adversario = alternarJogador(jogadorIA);
  const { novoEstado, passos } = executarDistribuicao(estado, casa, false);
  const totalCapturas = novoEstado.ultimaCadeia?.totalCapturas ?? 0;
  const pedrasCapturadas = novoEstado.ultimaCadeia?.totalPedrasCapturadas ?? 0;

  // 1. Se este lance resulta em vitória imediata da IA (eliminação ou asfixia)
  if (novoEstado.vencedor === jogadorIA) {
    return {
      pontuacao: 1_000_000,
      totalCapturas,
      passos: passos.length,
      motivo: 'Vitória imediata decisiva!',
    };
  }

  // 2. Pontuação por pedras capturadas e extensão da cadeia
  let pontuacao = pedrasCapturadas * 180 + totalCapturas * 120;
  pontuacao += passos.length * 3;

  // Saldo de pedras
  const pedrasIA = novoEstado.casas
    .filter((c) => c.proprietario === jogadorIA)
    .reduce((s, c) => s + c.quantidadeDePedras, 0);
  const pedrasAdv = novoEstado.casas
    .filter((c) => c.proprietario === adversario)
    .reduce((s, c) => s + c.quantidadeDePedras, 0);
  pontuacao += (pedrasIA - pedrasAdv) * 20;

  // 3. MINIMAX / LOOKAHEAD: Resposta do Adversário (Pli 2)
  const lancesAdversario = obterLancesValidos(novoEstado, adversario);

  if (lancesAdversario.length === 0) {
    // Adversário não tem movimentos: Vitória da IA por Asfixia (Afogamento)
    return {
      pontuacao: 900_000,
      totalCapturas,
      passos: passos.length,
      motivo: 'Cilada perfeita: bloqueia todas as jogadas do adversário (vitória por asfixia)!',
    };
  }

  // Bónus de constrição se deixar o adversário com apenas 1 ou 2 opções
  if (lancesAdversario.length <= 2) {
    pontuacao += 140;
  }

  let piorDanoAdversario = 0;
  let adversarioPodeVencer = false;
  let melhorRespostaAdversario: { casa: number; estado: GameState; dano: number } | null = null;

  for (const lanceAdv of lancesAdversario) {
    try {
      const simAdv = executarDistribuicao(novoEstado, lanceAdv, false);
      const capAdv = simAdv.novoEstado.ultimaCadeia?.totalPedrasCapturadas ?? 0;
      const numCapsAdv = simAdv.novoEstado.ultimaCadeia?.totalCapturas ?? 0;

      if (simAdv.novoEstado.vencedor === adversario) {
        adversarioPodeVencer = true;
      }

      const danoAdv = capAdv * 220 + numCapsAdv * 120;
      if (danoAdv > piorDanoAdversario) {
        piorDanoAdversario = danoAdv;
        melhorRespostaAdversario = { casa: lanceAdv, estado: simAdv.novoEstado, dano: danoAdv };
      }
    } catch {
      continue;
    }
  }

  // Prevenção estrita de derrotas e contra-ataques graves (Anti-Blunder)
  if (adversarioPodeVencer) {
    pontuacao -= 500_000;
  } else {
    // Subtrai com peso o pior dano que o adversário poderia nos causar
    pontuacao -= piorDanoAdversario * 1.35;
  }

  // 4. LOOKAHEAD PROFUNDO (Pli 3): Contra-retaliação da IA após a melhor resposta do oponente
  if (melhorRespostaAdversario && !adversarioPodeVencer) {
    const lancesRetaliacaoIA = obterLancesValidos(melhorRespostaAdversario.estado, jogadorIA);
    let melhorRetaliacaoIA = 0;

    for (const lanceRetal of lancesRetaliacaoIA.slice(0, 4)) {
      try {
        const simRetal = executarDistribuicao(melhorRespostaAdversario.estado, lanceRetal, false);
        const capRetal = simRetal.novoEstado.ultimaCadeia?.totalPedrasCapturadas ?? 0;
        if (simRetal.novoEstado.vencedor === jogadorIA) {
          melhorRetaliacaoIA = Math.max(melhorRetaliacaoIA, 3000);
        } else {
          melhorRetaliacaoIA = Math.max(melhorRetaliacaoIA, capRetal * 120);
        }
      } catch {
        continue;
      }
    }
    pontuacao += melhorRetaliacaoIA * 0.45;
  }

  // 5. CILADAS E PROTEÇÃO ESTRUTURAL
  // Penaliza espalhar demais as pedras em casas com apenas 1 pedra (vulnerabilidade a asfixia)
  const casasComUmaPedraIA = novoEstado.casas.filter(
    (c) => c.proprietario === jogadorIA && c.quantidadeDePedras === 1
  ).length;
  pontuacao -= casasComUmaPedraIA * 14;

  // Valoriza manter casas de ataque fortes (prontas para contra-ataques)
  const casasAtaqueAtivas = novoEstado.casas.filter((c) => {
    const ehLinhaAtaque = jogadorIA === JOGADOR_B ? c.numero >= 13 && c.numero <= 18 : c.numero >= 1 && c.numero <= 6;
    return c.proprietario === jogadorIA && ehLinhaAtaque && c.quantidadeDePedras >= 2;
  }).length;
  pontuacao += casasAtaqueAtivas * 16;

  // Variação controlada para evitar determinismo previsível entre lances igualmente mestres
  pontuacao += Math.random() * 4;

  let motivo = `Mestre Kota: estratégia profunda a partir da casa ${casa}`;
  if (totalCapturas > 0 && piorDanoAdversario === 0) {
    motivo = `Mestre Kota: golpe cirúrgico na casa ${casa} (captura de ${totalCapturas} pedra(s) com blindagem)`;
  } else if (totalCapturas > 0) {
    motivo = `Mestre Kota: captura tática de ${totalCapturas} pedra(s) e controle posicional`;
  } else if (piorDanoAdversario === 0) {
    motivo = `Mestre Kota: armou cilada e anulou o ataque adversário`;
  }

  return { pontuacao, totalCapturas, passos: passos.length, motivo };
}

/**
 * Avaliação Média (Equilibrada e competitiva):
 * - Prioriza vitória imediata e capturas diretas
 * - Calcula saldo de pedras e ritmo da semeadura
 */
function avaliarLanceMedio(
  estado: GameState,
  casa: number,
  jogadorIA: Jogador
): { pontuacao: number; totalCapturas: number; passos: number; motivo: string } {
  const adversario = alternarJogador(jogadorIA);
  const { novoEstado, passos } = executarDistribuicao(estado, casa, false);
  const totalCapturas = novoEstado.ultimaCadeia?.totalCapturas ?? 0;
  const pedrasAdversarioDepois = novoEstado.casas
    .filter((c) => c.proprietario === adversario)
    .reduce((s, c) => s + c.quantidadeDePedras, 0);
  const pedrasIADepois = novoEstado.casas
    .filter((c) => c.proprietario === jogadorIA)
    .reduce((s, c) => s + c.quantidadeDePedras, 0);

  let pontuacao = 0;

  if (novoEstado.vencedor === jogadorIA || pedrasAdversarioDepois === 0) {
    pontuacao += 100_000;
  }

  pontuacao += totalCapturas * 120;
  pontuacao += (pedrasIADepois - pedrasAdversarioDepois) * 15;
  pontuacao += passos.length * 2;

  // Linha interna
  if (casa >= 13 && casa <= 18) {
    pontuacao += 6;
  }

  pontuacao += Math.random() * 6;

  let motivo = `Distribuição a partir da casa ${casa}`;
  if (totalCapturas > 0) {
    motivo = `Captura de ${totalCapturas} pedra(s) adversária(s)`;
  }
  if (novoEstado.vencedor === jogadorIA) {
    motivo = `Movimento de vitória imediata!`;
  }

  return { pontuacao, totalCapturas, passos: passos.length, motivo };
}

/**
 * Avaliação Iniciante (Descontraída e amigável para quem está a aprender):
 * - Joga de forma descontraída
 * - Não prevê contra-ataques
 * - Comete pequenas imprecisões e prioriza movimentos simples
 */
function avaliarLanceIniciante(
  estado: GameState,
  casa: number,
  jogadorIA: Jogador
): { pontuacao: number; totalCapturas: number; passos: number; motivo: string } {
  const { novoEstado, passos } = executarDistribuicao(estado, casa, false);
  const totalCapturas = novoEstado.ultimaCadeia?.totalCapturas ?? 0;

  let pontuacao = 10;

  // Às vezes prefere capturar se vir uma oportunidade óbvia, mas com ruído
  if (totalCapturas > 0) {
    pontuacao += totalCapturas * 40;
  }

  // Mais peso aleatório para variar o jogo e cometer lances mais humanos/casuais
  pontuacao += Math.random() * 70;

  let motivo = `Jogada simples a partir da casa ${casa}`;
  if (totalCapturas > 0) {
    motivo = `Capturou ${totalCapturas} pedra(s) na casa ${casa}`;
  }

  return { pontuacao, totalCapturas, passos: passos.length, motivo };
}

/**
 * Escolhe a melhor jogada para a IA conforme o nível de dificuldade selecionado.
 * 
 * Níveis:
 * - 'iniciante': Jogo descontraído, ótimo para aprendizes.
 * - 'medio': Inteligência equilibrada e competitiva.
 * - 'mestre': "Kota do Ntxuva" com previsão de 2-3 pli, anti-blunder e ciladas táticas.
 */
export function escolherMelhorJogadaIA(
  estado: GameState,
  jogadorIA: Jogador = JOGADOR_B,
  dificuldade: DificuldadeIA = 'medio'
): DecisaoIA | null {
  if (estado.estadoDaPartida !== 'EM_ANDAMENTO' || estado.vencedor !== null) {
    return null;
  }

  const lancesValidos = obterLancesValidos(estado, jogadorIA);
  if (lancesValidos.length === 0) {
    return null;
  }

  // No modo iniciante, 40% das vezes escolhe simplesmente um lance casual válido
  if (dificuldade === 'iniciante' && Math.random() < 0.4) {
    const casaAleatoria = lancesValidos[Math.floor(Math.random() * lancesValidos.length)];
    return {
      casaEscolhida: casaAleatoria,
      pontuacao: 10,
      totalCapturasEsperadas: 0,
      passosEstimados: 3,
      motivo: `Lance casual a partir da casa ${casaAleatoria}`,
    };
  }

  let melhorDecisao: DecisaoIA | null = null;

  for (const casa of lancesValidos) {
    try {
      let resultado: { pontuacao: number; totalCapturas: number; passos: number; motivo: string };

      if (dificuldade === 'mestre') {
        resultado = avaliarLanceMestre(estado, casa, jogadorIA);
      } else if (dificuldade === 'iniciante') {
        resultado = avaliarLanceIniciante(estado, casa, jogadorIA);
      } else {
        resultado = avaliarLanceMedio(estado, casa, jogadorIA);
      }

      if (!melhorDecisao || resultado.pontuacao > melhorDecisao.pontuacao) {
        melhorDecisao = {
          casaEscolhida: casa,
          pontuacao: resultado.pontuacao,
          totalCapturasEsperadas: resultado.totalCapturas,
          passosEstimados: resultado.passos,
          motivo: resultado.motivo,
        };
      }
    } catch {
      continue;
    }
  }

  if (!melhorDecisao && lancesValidos.length > 0) {
    return {
      casaEscolhida: lancesValidos[0],
      pontuacao: 1,
      totalCapturasEsperadas: 0,
      passosEstimados: 1,
      motivo: `Movimento padrão`,
    };
  }

  return melhorDecisao;
}
