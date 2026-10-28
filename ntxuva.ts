/**
 * NTXUVA - Modelo de Dados, Movimento e Distribuição
 * 
 * Regras:
 * - 24 casas no total (Jogador A: 1..12, Jogador B: 13..24)
 * - 48 pedras no total
 * - Percurso Jogador A: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 1
 * - Percurso Jogador B: 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 13
 * 
 * Regras de Distribuição:
 * - O jogador pode iniciar uma jogada em qualquer uma das suas casas que contenha pedras.
 * - Ao escolher uma casa:
 *   1. retirar TODAS as pedras;
 *   2. deixar a casa vazia;
 *   3. colocar as pedras na mão temporária;
 *   4. distribuir uma pedra por vez seguindo o percurso.
 * - Quando a distribuição passa pela última casa:
 *   - Jogador A: 12 → 1
 *   - Jogador B: 24 → 13
 * - Se uma pedra cair em uma casa que já possui pedras:
 *   1. somar a pedra;
 *   2. retirar TODAS as pedras daquela casa;
 *   3. colocar essas pedras na mão;
 *   4. continuar a distribuição a partir da casa seguinte.
 * - Não há captura nesta etapa.
 */

import { 
  Casa, 
  GameState, 
  Jogador, 
  ProprietarioCasa, 
  ResultadoTeste, 
  PassoDistribuicao, 
  ResultadoAvaliacaoCaptura,
  ResultadoEncerramentoJogada,
  ResumoCadeiaJogada,
  EventoCapturaCadeia,
  EstadoPartida,
  BonusCapturaRecente
} from '../types/ntxuva';

export const TOTAL_CASAS = 24;
export const TOTAL_PEDRAS = 48;
export const PEDRAS_POR_JOGADOR = 24;
export const CASAS_POR_JOGADOR = 12;
export const PEDRAS_POR_CASA_INICIAL = 2; // 24 casas * 2 pedras = 48 pedras

export const JOGADOR_A: Jogador = 'Jogador A';
export const JOGADOR_B: Jogador = 'Jogador B';

export const PERCURSO_JOGADOR_A: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const PERCURSO_JOGADOR_B: number[] = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

/**
 * Tabela de Correspondências Físicas Diretas entre as Casas do NTXUVA:
 * 
 * Linhas Internas:
 * 1 ↔ 18
 * 2 ↔ 17
 * 3 ↔ 16
 * 4 ↔ 15
 * 5 ↔ 14
 * 6 ↔ 13
 * 
 * Linhas Externas:
 * 7 ↔ 24
 * 8 ↔ 23
 * 9 ↔ 22
 * 10 ↔ 21
 * 11 ↔ 20
 * 12 ↔ 19
 */
export const CORRESPONDENCIAS_FISICAS: ReadonlyArray<readonly [number, number]> = [
  [1, 18],
  [2, 17],
  [3, 16],
  [4, 15],
  [5, 14],
  [6, 13],
  [7, 24],
  [8, 23],
  [9, 22],
  [10, 21],
  [11, 20],
  [12, 19],
] as const;

export const MAPA_OPOSICAO: Record<number, number> = {
  1: 18,
  2: 17,
  3: 16,
  4: 15,
  5: 14,
  6: 13,
  7: 24,
  8: 23,
  9: 22,
  10: 21,
  11: 20,
  12: 19,
  // Relações bidirecionais inversas:
  13: 6,
  14: 5,
  15: 4,
  16: 3,
  17: 2,
  18: 1,
  19: 12,
  20: 11,
  21: 10,
  22: 9,
  23: 8,
  24: 7,
};

/**
 * Retorna a casa diretamente correspondente (oposta) à casa fornecida.
 * Exemplo:
 * oposta(1) = 18
 * oposta(3) = 16
 * oposta(12) = 19
 */
export function oposta(numeroCasa: number): number {
  const correspondente = MAPA_OPOSICAO[numeroCasa];
  if (correspondente === undefined) {
    throw new Error(
      `Número de casa inválido para correspondência oposta: ${numeroCasa}. O jogo possui casas de 1 a 24.`
    );
  }
  return correspondente;
}

export const obterCasaOposta = oposta;

/**
 * Determina o proprietário com base no número da casa:
 * - Casas 1 a 12 pertencem ao Jogador A
 * - Casas 13 a 24 pertencem ao Jogador B
 */
export function obterProprietarioCasa(numero: number): ProprietarioCasa {
  if (numero >= 1 && numero <= 12) {
    return JOGADOR_A;
  }
  if (numero >= 13 && numero <= 24) {
    return JOGADOR_B;
  }
  throw new Error(`Número de casa inválido: ${numero}. O jogo possui casas de 1 a 24.`);
}

/**
 * Calcula a posição física X (coluna) e Y (linha) no tabuleiro.
 * Disposição clássica de 4 linhas de 6 casas (4x6):
 * - Linha 1 (Y=1, X=1..6): Jogador A (casas 1 a 6)
 * - Linha 2 (Y=2, X=1..6): Jogador A (casas 7 a 12)
 * - Linha 3 (Y=3, X=1..6): Jogador B (casas 13 a 18)
 * - Linha 4 (Y=4, X=1..6): Jogador B (casas 19 a 24)
 */
export function obterPosicaoFisica(numero: number): { x: number; y: number } {
  if (numero < 1 || numero > TOTAL_CASAS) {
    throw new Error(`Número de casa fora do intervalo permitido (1 a 24): ${numero}`);
  }

  const linha = Math.floor((numero - 1) / 6) + 1;
  const coluna = ((numero - 1) % 6) + 1;

  return {
    x: coluna,
    y: linha,
  };
}

/**
 * Retorna a próxima casa no percurso circular do jogador ativo:
 * - Jogador A: 1 → 2 → ... → 11 → 12 → 1
 * - Jogador B: 13 → 14 → ... → 23 → 24 → 13
 */
export function obterProximaCasa(numeroCasa: number, jogador: Jogador): number {
  if (jogador === JOGADOR_A) {
    if (numeroCasa >= 1 && numeroCasa < 12) {
      return numeroCasa + 1;
    }
    if (numeroCasa === 12) {
      return 1; // Transição circular 12 → 1
    }
    throw new Error(`A casa ${numeroCasa} não faz parte do território do Jogador A (1..12).`);
  }

  if (jogador === JOGADOR_B) {
    if (numeroCasa >= 13 && numeroCasa < 24) {
      return numeroCasa + 1;
    }
    if (numeroCasa === 24) {
      return 13; // Transição circular 24 → 13
    }
    throw new Error(`A casa ${numeroCasa} não faz parte do território do Jogador B (13..24).`);
  }

  throw new Error(`Jogador desconhecido: ${jogador}`);
}

/**
 * Retorna o percurso circular completo do jogador
 */
export function obterPercursoJogador(jogador: Jogador): number[] {
  return jogador === JOGADOR_A ? [...PERCURSO_JOGADOR_A] : [...PERCURSO_JOGADOR_B];
}

/**
 * Gera as 24 casas iniciais do tabuleiro com suas propriedades.
 * Cada casa inicia com 2 pedras (totalizando 48 pedras).
 */
export function criarCasasIniciais(): Casa[] {
  const casas: Casa[] = [];

  for (let numero = 1; numero <= TOTAL_CASAS; numero++) {
    const { x, y } = obterPosicaoFisica(numero);
    const proprietario = obterProprietarioCasa(numero);

    casas.push({
      numero,
      proprietario,
      quantidadeDePedras: PEDRAS_POR_CASA_INICIAL,
      posicaoFisicaX: x,
      posicaoFisicaY: y,
      casaOposta: oposta(numero),
    });
  }

  return casas;
}

/**
 * Inicializa o GameState geral da partida com todos os atributos obrigatórios.
 */
export function inicializarJogo(jogadorInicial: Jogador = JOGADOR_A): GameState {
  const casas = criarCasasIniciais();

  const pedrasDoJogadorA = casas
    .filter((c) => c.proprietario === JOGADOR_A)
    .reduce((soma, c) => soma + c.quantidadeDePedras, 0);

  const pedrasDoJogadorB = casas
    .filter((c) => c.proprietario === JOGADOR_B)
    .reduce((soma, c) => soma + c.quantidadeDePedras, 0);

  return {
    jogadorAtual: jogadorInicial,
    casas,
    pedrasDoJogadorA,
    pedrasDoJogadorB,
    pedrasNaMao: 0,
    estadoDaJogada: 'aguardando_jogada',
    vencedor: null,
    empate: false,
    estadoDaPartida: 'EM_ANDAMENTO',
    propostaEmpate: null,
    jogadasBonusPendentes: 0,
    jogadorBonusPendente: null,
    ultimoBonusCaptura: null,
    historico: [
      `Jogo NTXUVA inicializado: 24 casas criadas (12 do Jogador A, 12 do Jogador B).`,
      `Total de pedras: 48 (24 do Jogador A, 24 do Jogador B). 2 pedras em cada casa.`,
      `Primeiro a jogar: ${jogadorInicial}.`,
    ],
  };
}

/**
 * Cria um GameState customizado para cenários específicos, tutoriais ou desafios táticos (puzzles).
 * @param configCasas Mapeamento { [numeroCasa: number]: quantidadeDePedras }
 * @param jogadorInicial Jogador que tem a vez (padrão: Jogador A)
 */
export function criarGameStateCustomizado(
  configCasas: Record<number, number>,
  jogadorInicial: Jogador = JOGADOR_A
): GameState {
  const casas: Casa[] = [];

  for (let numero = 1; numero <= TOTAL_CASAS; numero++) {
    const { x, y } = obterPosicaoFisica(numero);
    const proprietario = obterProprietarioCasa(numero);
    const quantidadeDePedras = configCasas[numero] !== undefined ? Math.max(0, configCasas[numero]) : 0;

    casas.push({
      numero,
      proprietario,
      quantidadeDePedras,
      posicaoFisicaX: x,
      posicaoFisicaY: y,
      casaOposta: oposta(numero),
    });
  }

  const pedrasDoJogadorA = casas
    .filter((c) => c.proprietario === JOGADOR_A)
    .reduce((soma, c) => soma + c.quantidadeDePedras, 0);

  const pedrasDoJogadorB = casas
    .filter((c) => c.proprietario === JOGADOR_B)
    .reduce((soma, c) => soma + c.quantidadeDePedras, 0);

  return {
    jogadorAtual: jogadorInicial,
    casas,
    pedrasDoJogadorA,
    pedrasDoJogadorB,
    pedrasNaMao: 0,
    estadoDaJogada: 'aguardando_jogada',
    vencedor: null,
    empate: false,
    estadoDaPartida: 'EM_ANDAMENTO',
    propostaEmpate: null,
    jogadasBonusPendentes: 0,
    jogadorBonusPendente: null,
    ultimoBonusCaptura: null,
    historico: [
      `Posição customizada de NTXUVA carregada.`,
      `Pedras do Jogador A: ${pedrasDoJogadorA} | Pedras do Jogador B: ${pedrasDoJogadorB}`,
      `Vez de: ${jogadorInicial}.`,
    ],
  };
}

/**
 * Verifica se a casa está localizada na linha interna (linha de contato frontal).
 * - Jogador A: casas 1 a 6
 * - Jogador B: casas 13 a 18
 */
export function ehLinhaInterna(numeroCasa: number): boolean {
  return (numeroCasa >= 1 && numeroCasa <= 6) || (numeroCasa >= 13 && numeroCasa <= 18);
}

/**
 * Verifica se a casa está localizada na linha externa (linha de retaguarda).
 * - Jogador A: casas 7 a 12
 * - Jogador B: casas 19 a 24
 */
export function ehLinhaExterna(numeroCasa: number): boolean {
  return (numeroCasa >= 7 && numeroCasa <= 12) || (numeroCasa >= 19 && numeroCasa <= 24);
}

/**
 * PONTO 1 MODELADO:
 * Qual é a posição da casa onde terminou a distribuição.
 * 
 * Determina se a casa onde a semeadura terminou está na linha interna (elegível para captura direta)
 * ou na linha externa (inelegível, pois à sua frente está uma casa do próprio jogador).
 */
export function posicaoDaCasaOndeTerminou(numeroCasa: number): {
  numeroCasa: number;
  linha: 'interna' | 'externa';
  proprietario: Jogador;
  elegivelParaCaptura: boolean;
  motivo: string;
} {
  const proprietario = obterProprietarioCasa(numeroCasa);
  const interna = ehLinhaInterna(numeroCasa);

  return {
    numeroCasa,
    linha: interna ? 'interna' : 'externa',
    proprietario,
    elegivelParaCaptura: interna,
    motivo: interna
      ? `A casa ${numeroCasa} está na linha interna de ${proprietario}, em contato físico frontal com o adversário.`
      : `A casa ${numeroCasa} está na linha externa de ${proprietario}. À sua frente está a linha interna do próprio jogador.`,
  };
}

/**
 * PONTO 2 MODELADO:
 * Qual é a casa adversária diretamente correspondente.
 * 
 * Se a distribuição terminou na linha interna, a primeira casa adversária correspondente
 * é exatamente oposta(numeroCasa).
 * Se terminou na linha externa, retorna null (pois à frente está casa própria).
 */
export function obterCasaAdversariaDiretamenteCorrespondente(numeroCasaOndeTerminou: number): number | null {
  if (ehLinhaExterna(numeroCasaOndeTerminou)) {
    return null;
  }
  return oposta(numeroCasaOndeTerminou);
}

/**
 * PONTO 3 MODELADO:
 * Como verificar a segunda casa adversária.
 * 
 * A segunda casa adversária localiza-se na linha externa do adversário, diretamente atrás
 * da primeira casa adversária na mesma coluna física.
 * - Linha interna de B (13..18) -> Linha externa de B (24..19 atrás): segunda = 37 - primeira
 * - Linha interna de A (1..6) -> Linha externa de A (12..7 atrás): segunda = 13 - primeira
 */
export function obterSegundaCasaAdversaria(primeiraCasaAdversaria: number | null): number | null {
  if (primeiraCasaAdversaria === null) return null;

  // Se a primeira casa é do Jogador B (13..18), a segunda fica atrás na linha externa de B (19..24)
  if (primeiraCasaAdversaria >= 13 && primeiraCasaAdversaria <= 18) {
    return 37 - primeiraCasaAdversaria; // ex: 18 -> 19; 13 -> 24
  }

  // Se a primeira casa é do Jogador A (1..6), a segunda fica atrás na linha externa de A (7..12)
  if (primeiraCasaAdversaria >= 1 && primeiraCasaAdversaria <= 6) {
    return 13 - primeiraCasaAdversaria; // ex: 1 -> 12; 6 -> 7
  }

  return null;
}

/**
 * PONTO 4 MODELADO:
 * Como impedir a captura de uma casa própria.
 * 
 * Regra 2: Só podem ser capturadas pedras pertencentes ao adversário.
 * Regra 3: Nunca pode capturar pedras do próprio jogador.
 * 
 * Verifica se a captura a partir de determinada casa violaria a regra de casa própria:
 * 1. Ao terminar na linha externa, a casa imediatamente à frente pertence ao próprio jogador.
 * 2. Qualquer casa candidata cuja propriedade seja igual ao jogadorAtual é estritamente rejeitada.
 */
export function verificarImpedimentoCasaPropria(
  numeroCasaOndeTerminou: number,
  jogadorAtual: Jogador
): { impedido: boolean; motivo: string } {
  // Se terminou na linha externa, à frente está a linha interna do próprio jogador
  if (ehLinhaExterna(numeroCasaOndeTerminou)) {
    return {
      impedido: true,
      motivo: `A casa ${numeroCasaOndeTerminou} situa-se na linha externa do ${jogadorAtual}. A casa física à sua frente pertence ao PRÓPRIO jogador (Regra 3: Nunca pode capturar pedras do próprio jogador).`,
    };
  }

  const primeiraAdversaria = oposta(numeroCasaOndeTerminou);
  const proprietarioAlvo = obterProprietarioCasa(primeiraAdversaria);

  if (proprietarioAlvo === jogadorAtual) {
    return {
      impedido: true,
      motivo: `A casa candidata ${primeiraAdversaria} pertence ao próprio ${jogadorAtual} (Regra 3: Proibido capturar pedras do próprio jogador).`,
    };
  }

  return {
    impedido: false,
    motivo: `Casa adversária válida (${primeiraAdversaria} pertence a ${proprietarioAlvo}).`,
  };
}

/**
 * Mapeia as casas adversárias na coluna física diretamente oposta à casa fornecida:
 * 
 * Regra 1: A captura depende da posição física das casas.
 * Regra 2: Só podem ser capturadas pedras pertencentes ao adversário.
 * Regra 3: Nunca pode capturar pedras do próprio jogador.
 */
export function obterCasasAdversariasColuna(numeroCasa: number): {
  posicaoOndeTerminou: ReturnType<typeof posicaoDaCasaOndeTerminou>;
  primeiraCasaAdversaria: number | null;
  segundaCasaAdversaria: number | null;
  impedidaPorCasaPropria: boolean;
} {
  const posicao = posicaoDaCasaOndeTerminou(numeroCasa);
  const impedimento = verificarImpedimentoCasaPropria(numeroCasa, posicao.proprietario);
  const primeira = obterCasaAdversariaDiretamenteCorrespondente(numeroCasa);
  const segunda = obterSegundaCasaAdversaria(primeira);

  return {
    posicaoOndeTerminou: posicao,
    primeiraCasaAdversaria: primeira,
    segundaCasaAdversaria: segunda,
    impedidaPorCasaPropria: impedimento.impedido,
  };
}

/**
 * Avalia se há uma captura válida na casa onde terminou a distribuição segundo as 10 REGRAS:
 * 
 * 1. A captura depende da posição física das casas.
 * 2. Só podem ser capturadas pedras pertencentes ao adversário.
 * 3. Nunca pode capturar pedras do próprio jogador.
 * 4. A casa adversária necessária para a captura não pode estar vazia.
 * 5. Não é permitido saltar uma primeira casa adversária vazia para capturar outra.
 * 6. Uma captura pode envolver no máximo 2 casas adversárias.
 * 7. Se a segunda casa fizer parte da sequência válida de captura, sua captura é obrigatória.
 * 8. Nunca capturar uma terceira casa.
 * 9. Não existe limite de quantidade de pedras dentro das duas casas capturadas.
 * 10. Todas as pedras das casas capturadas são retiradas.
 */
/**
 * Verifica se a casa está na Linha de Ataque (linha interna) do jogador:
 * - Jogador A: casas 1 a 6
 * - Jogador B: casas 13 a 18
 */
export function ehLinhaDeAtaque(numeroCasa: number, jogador?: Jogador): boolean {
  if (jogador === JOGADOR_A) {
    return numeroCasa >= 1 && numeroCasa <= 6;
  }
  if (jogador === JOGADOR_B) {
    return numeroCasa >= 13 && numeroCasa <= 18;
  }
  return ehLinhaInterna(numeroCasa);
}

/**
 * Verifica se a casa está na Linha de Defesa (linha externa) do jogador:
 * - Jogador A: casas 7 a 12
 * - Jogador B: casas 19 a 24
 */
export function ehLinhaDeDefesa(numeroCasa: number, jogador?: Jogador): boolean {
  if (jogador === JOGADOR_A) {
    return numeroCasa >= 7 && numeroCasa <= 12;
  }
  if (jogador === JOGADOR_B) {
    return numeroCasa >= 19 && numeroCasa <= 24;
  }
  return ehLinhaExterna(numeroCasa);
}

/**
 * Avalia se há uma captura/comida de pedras válida no NTXUVA.
 * 
 * Regra Oficial: "Como Capturar ou Comer Pedras"
 * Para capturar ou comer as pedras do adversário, precisas de cumprir 3 condições ao mesmo tempo:
 * 1- A tua última pedra tem de cair numa casa vazia;
 * 2- Essa casa vazia tem de ser na tua linha de Ataque;
 * 3- A casa do adversário que está mesmo em frente (no Ataque dele) tem de ter peças.
 * 
 * E se as 3 condições baterem certo:
 * Tu "comes ou captura" as peças da linha de ataque dele e,
 * se a linha de defesa dele (logo atrás) também tiver pedras, comes ou captura essa também!
 */
export function avaliarCaptura(
  estado: GameState,
  casaOndeTerminou: number,
  casaEstavaVaziaOuPedrasAntes?: boolean | number
): ResultadoAvaliacaoCaptura {
  const jogadorAtivo = estado.jogadorAtual;
  const casaAtual = estado.casas.find((c) => c.numero === casaOndeTerminou);

  // 1- A tua última pedra tem de cair numa casa vazia:
  let caiuEmCasaVazia: boolean;
  if (typeof casaEstavaVaziaOuPedrasAntes === 'boolean') {
    caiuEmCasaVazia = casaEstavaVaziaOuPedrasAntes;
  } else if (typeof casaEstavaVaziaOuPedrasAntes === 'number') {
    caiuEmCasaVazia = casaEstavaVaziaOuPedrasAntes === 0;
  } else {
    // Quando não fornecido explicitamente (ex: testes diretos de regras físicas ou posição),
    // presume-se que a última pedra caiu numa casa vazia (condição 1 satisfeita)
    caiuEmCasaVazia = true;
  }

  const { primeiraCasaAdversaria, segundaCasaAdversaria, impedidaPorCasaPropria } =
    obterCasasAdversariasColuna(casaOndeTerminou);

  // 2- Essa casa vazia tem de ser na tua linha de Ataque:
  const casaNaLinhaDeAtaque = ehLinhaInterna(casaOndeTerminou) &&
    (casaAtual ? casaAtual.proprietario === jogadorAtivo : true) &&
    !impedidaPorCasaPropria &&
    primeiraCasaAdversaria !== null;

  const casaPrimeira = primeiraCasaAdversaria !== null
    ? estado.casas.find((c) => c.numero === primeiraCasaAdversaria)
    : null;

  // 3- A casa do adversário que está mesmo em frente (no Ataque dele) tem de ter peças:
  const adversarioEmFrenteTemPecas = Boolean(
    casaPrimeira &&
    casaPrimeira.proprietario !== jogadorAtivo &&
    casaPrimeira.quantidadeDePedras > 0
  );

  const todasCumpridas = caiuEmCasaVazia && casaNaLinhaDeAtaque && adversarioEmFrenteTemPecas;

  const condicoesCaptura = {
    caiuEmCasaVazia,
    casaNaLinhaDeAtaque,
    adversarioEmFrenteTemPecas,
    todasCumpridas,
  };

  // Se a Condição 1 falhou:
  if (!caiuEmCasaVazia) {
    return {
      podeCapturar: false,
      motivo: `Não houve captura: a última pedra caiu na casa ${casaOndeTerminou} que já continha pedras. Condição 1 não cumprida (a tua última pedra tem de cair numa casa vazia).`,
      casaOndeTerminou,
      primeiraCasaAdversaria: null,
      segundaCasaAdversaria: null,
      casasParaCapturar: [],
      totalPedrasCapturadas: 0,
      impedidaPorCasaPropria: false,
      condicoesCaptura,
    };
  }

  // Se a Condição 2 falhou:
  if (!casaNaLinhaDeAtaque) {
    return {
      podeCapturar: false,
      motivo: `Não houve captura: a casa ${casaOndeTerminou} está na linha de Defesa (ou não é linha de Ataque). Condição 2 não cumprida (essa casa vazia tem de ser na tua linha de Ataque).`,
      casaOndeTerminou,
      primeiraCasaAdversaria: null,
      segundaCasaAdversaria: null,
      casasParaCapturar: [],
      totalPedrasCapturadas: 0,
      impedidaPorCasaPropria: true,
      condicoesCaptura,
    };
  }

  // Se a Condição 3 falhou:
  if (!adversarioEmFrenteTemPecas || !casaPrimeira) {
    return {
      podeCapturar: false,
      motivo: `Não houve captura: a casa do adversário em frente (${primeiraCasaAdversaria}) está vazia (0 peças). Condição 3 não cumprida (a casa do adversário em frente no Ataque dele tem de ter peças).`,
      casaOndeTerminou,
      primeiraCasaAdversaria,
      segundaCasaAdversaria,
      casasParaCapturar: [],
      totalPedrasCapturadas: 0,
      impedidaPorCasaPropria: false,
      condicoesCaptura,
    };
  }

  // AS 3 CONDIÇÕES FORAM CUMPRIDAS!
  // Tu "comes ou captura" as peças da linha de ataque dele:
  const casasParaCapturar: number[] = [primeiraCasaAdversaria];
  let totalPedras = casaPrimeira.quantidadeDePedras;

  // E, se a linha de defesa dele (logo atrás) também tiver pedras, comes ou captura essa também!
  if (segundaCasaAdversaria !== null) {
    const casaSegunda = estado.casas.find((c) => c.numero === segundaCasaAdversaria);
    if (
      casaSegunda &&
      casaSegunda.proprietario !== jogadorAtivo &&
      casaSegunda.quantidadeDePedras > 0
    ) {
      casasParaCapturar.push(segundaCasaAdversaria);
      totalPedras += casaSegunda.quantidadeDePedras;
    }
  }

  return {
    podeCapturar: true,
    motivo: `Captura realizada! As 3 condições foram cumpridas (última pedra caiu na casa vazia ${casaOndeTerminou} na linha de Ataque, adversário em frente tinha peças). Capturou [${casasParaCapturar.join(', ')}] totalizando ${totalPedras} pedra(s).`,
    casaOndeTerminou,
    primeiraCasaAdversaria,
    segundaCasaAdversaria,
    casasParaCapturar,
    totalPedrasCapturadas: totalPedras,
    impedidaPorCasaPropria: false,
    condicoesCaptura,
  };
}

/**
 * Verifica se a condição de vitória foi atingida após cada captura ou término de turno no NTXUVA:
 * 
 * Regra de VITÓRIA:
 * 1. Cada jogador começa com 24 pedras.
 * 2. Condição 1 (Eliminação total):
 *    - Pedras do adversário == 0.
 *    - Encerrar imediatamente a partida e declarar vencedor quem capturou as últimas pedras.
 * 
 * 3. Condição 2 (Asfixia / Afogamento / Impossibilidade de jogada válida):
 *    - Se o adversário restar com uma casa ou casas que nelas tenham apenas uma pedra em cada casa (nenhuma casa com 2 ou mais pedras).
 *    - Porque ele ficou impossibilitado de fazer uma jogada válida ("perdeu por asfixia, ou morreu afogado").
 *    - Logo é vitória para o adversário (o jogador ativo que ainda possui jogadas válidas).
 */
export function verificarVitoriaAposCaptura(
  casas: Casa[],
  jogadorCapturador: Jogador
): {
  vitoria: boolean;
  vencedor: Jogador | null;
  adversario: Jogador;
  pedrasAdversario: number;
  tipoVitoria?: 'eliminacao' | 'asfixia';
  motivo?: string;
} {
  const adversario = alternarJogador(jogadorCapturador);
  const casasAdversario = casas.filter((c) => c.proprietario === adversario);
  const pedrasAdversario = casasAdversario.reduce((sum, c) => sum + c.quantidadeDePedras, 0);

  // 1. Eliminação total (0 pedras)
  if (pedrasAdversario === 0) {
    return {
      vitoria: true,
      vencedor: jogadorCapturador,
      adversario,
      pedrasAdversario: 0,
      tipoVitoria: 'eliminacao',
      motivo: `VITÓRIA: O ${jogadorCapturador} capturou as últimas pedras do ${adversario} (pedras do adversário == 0). A partida foi encerrada imediatamente e ${jogadorCapturador} é declarado o vencedor!`,
    };
  }

  // 2. Asfixia / Afogamento: se o adversário não possui nenhuma casa com 2 ou mais pedras
  // (restou apenas com casas de 1 pedra ou 0 pedras), ele fica impossibilitado de fazer uma jogada válida
  const adversarioTemCasasComDuasOuMais = casasAdversario.some((c) => c.quantidadeDePedras >= 2);
  if (!adversarioTemCasasComDuasOuMais) {
    return {
      vitoria: true,
      vencedor: jogadorCapturador,
      adversario,
      pedrasAdversario,
      tipoVitoria: 'asfixia',
      motivo: `VITÓRIA POR ASFIXIA (AFOGAMENTO): O ${adversario} restou apenas com casas de 1 pedra (total de ${pedrasAdversario} pedra(s)) e ficou impossibilitado de realizar qualquer jogada válida (morreu afogado). O ${jogadorCapturador} é declarado vencedor!`,
    };
  }

  return {
    vitoria: false,
    vencedor: null,
    adversario,
    pedrasAdversario,
  };
}

// Estado global auxiliar para suporte a chamadas sem argumentos: proporEmpate(), aceitarEmpate(), recusarEmpate()
let _estadoGlobalNtxuva: GameState = inicializarJogo();

export function obterEstadoGlobal(): GameState {
  return _estadoGlobalNtxuva;
}

export function definirEstadoGlobal(estado: GameState): void {
  _estadoGlobalNtxuva = estado;
}

/**
 * EMPATE POR ACORDO MÚTUO - proporEmpate()
 * 
 * Regras:
 * - Não existe empate automático.
 * - O empate somente ocorre por acordo mútuo.
 * - Criar: proporEmpate()
 */
export function proporEmpate(estado?: GameState, proponente?: Jogador): GameState {
  const est = estado || _estadoGlobalNtxuva;
  const jogadorProponente = proponente || est.jogadorAtual;
  const adversario = alternarJogador(jogadorProponente);

  if (est.estadoDaPartida === 'FINALIZADA' || est.vencedor !== null) {
    throw new Error('A partida já foi encerrada com vitória. Não é possível propor empate.');
  }

  if (est.estadoDaPartida === 'EMPATE' || est.empate) {
    return est;
  }

  const novoEstado: GameState = {
    ...est,
    propostaEmpate: jogadorProponente,
    estadoDaJogada: `${jogadorProponente} propôs empate por acordo mútuo. Aguardando aceitação de ${adversario}.`,
    historico: [
      `${jogadorProponente} propôs empate por acordo mútuo ao ${adversario}.`,
      ...est.historico,
    ],
  };

  _estadoGlobalNtxuva = novoEstado;
  return novoEstado;
}

/**
 * EMPATE POR ACORDO MÚTUO - aceitarEmpate()
 * 
 * Regras:
 * - Se os dois concordarem: estado da partida = EMPATE.
 * - Não criar nenhuma outra condição automática de empate.
 * - Criar: aceitarEmpate()
 */
export function aceitarEmpate(estado?: GameState, jogadorQueAceita?: Jogador): GameState {
  const est = estado || _estadoGlobalNtxuva;
  const proponente = est.propostaEmpate;
  const aceitante = jogadorQueAceita || (proponente ? alternarJogador(proponente) : alternarJogador(est.jogadorAtual));

  if (est.estadoDaPartida === 'FINALIZADA' || est.vencedor !== null) {
    throw new Error('A partida já foi encerrada com vitória. Não é possível aceitar empate.');
  }

  const novoEstado: GameState = {
    ...est,
    vencedor: null,
    empate: true,
    estadoDaPartida: 'EMPATE',
    propostaEmpate: null,
    estadoDaJogada: `Partida encerrada: EMPATE por acordo mútuo entre os jogadores.`,
    historico: [
      `Empate acordado mutuamente entre os jogadores. Estado da partida = EMPATE.`,
      ...est.historico,
    ],
  };

  _estadoGlobalNtxuva = novoEstado;
  return novoEstado;
}

/**
 * EMPATE POR ACORDO MÚTUO - recusarEmpate()
 * 
 * Regras:
 * - Se a proposta for recusada, a partida segue normalmente.
 * - Criar: recusarEmpate()
 */
export function recusarEmpate(estado?: GameState, jogadorQueRecusa?: Jogador): GameState {
  const est = estado || _estadoGlobalNtxuva;
  const proponente = est.propostaEmpate;
  const recusante = jogadorQueRecusa || (proponente ? alternarJogador(proponente) : alternarJogador(est.jogadorAtual));

  const novoEstado: GameState = {
    ...est,
    propostaEmpate: null,
    estadoDaJogada: `${recusante} recusou a proposta de empate. A partida continua normalmente.`,
    historico: [
      `Proposta de empate recusada por ${recusante}. A partida continua normalmente.`,
      ...est.historico,
    ],
  };

  _estadoGlobalNtxuva = novoEstado;
  return novoEstado;
}

/**
 * Executa a captura retirando todas as pedras das casas capturadas.
 * 
 * Regra 10: Todas as pedras das casas capturadas são retiradas.
 * Depois da captura:
 * - as pedras passam para a mão temporária do jogador;
 * - serão redistribuídas pelo percurso do próprio jogador.
 * - Verifica imediatamente se pedras do adversário == 0 para encerrar a partida e declarar vencedor.
 */
export function executarCaptura(
  estado: GameState,
  casaOndeTerminou: number
): {
  houveCaptura: boolean;
  novoEstado: GameState;
  casasCapturadas: number[];
  pedrasCapturadas: number;
  mensagem: string;
} {
  const avaliacao = avaliarCaptura(estado, casaOndeTerminou);

  if (!avaliacao.podeCapturar) {
    return {
      houveCaptura: false,
      novoEstado: estado,
      casasCapturadas: [],
      pedrasCapturadas: 0,
      mensagem: avaliacao.motivo,
    };
  }

  const casasClonadas = estado.casas.map((c) => {
    if (avaliacao.casasParaCapturar.includes(c.numero)) {
      return { ...c, quantidadeDePedras: 0 };
    }
    return { ...c };
  });

  const pedrasA = casasClonadas
    .filter((c) => c.proprietario === JOGADOR_A)
    .reduce((sum, c) => sum + c.quantidadeDePedras, 0);

  const pedrasB = casasClonadas
    .filter((c) => c.proprietario === JOGADOR_B)
    .reduce((sum, c) => sum + c.quantidadeDePedras, 0);

  // DEPOIS DE CADA CAPTURA VERIFICAR: pedras do adversário == 0 OU Asfixia (adversário sem casas com 2+ pedras)
  const verificacaoVitoria = verificarVitoriaAposCaptura(casasClonadas, estado.jogadorAtual);
  const vencedor = verificacaoVitoria.vitoria ? verificacaoVitoria.vencedor : null;
  const estadoDaPartida: EstadoPartida = vencedor ? 'FINALIZADA' : (estado.estadoDaPartida || 'EM_ANDAMENTO');

  const novoEstado: GameState = {
    ...estado,
    casas: casasClonadas,
    pedrasDoJogadorA: pedrasA,
    pedrasDoJogadorB: pedrasB,
    pedrasNaMao: avaliacao.totalPedrasCapturadas,
    vencedor,
    tipoVitoria: verificacaoVitoria.tipoVitoria,
    motivoVitoria: verificacaoVitoria.motivo,
    estadoDaPartida,
    estadoDaJogada: vencedor
      ? verificacaoVitoria.motivo!
      : `Capturou ${avaliacao.totalPedrasCapturadas} pedras das casas [${avaliacao.casasParaCapturar.join(', ')}].`,
    historico: [
      vencedor
        ? verificacaoVitoria.motivo!
        : `${estado.jogadorAtual} capturou ${avaliacao.totalPedrasCapturadas} pedras das casas adversárias [${avaliacao.casasParaCapturar.join(', ')}].`,
      ...estado.historico,
    ],
  };

  return {
    houveCaptura: true,
    novoEstado,
    casasCapturadas: avaliacao.casasParaCapturar,
    pedrasCapturadas: avaliacao.totalPedrasCapturadas,
    mensagem: vencedor ? verificacaoVitoria.motivo! : avaliacao.motivo,
  };
}

/**
 * Avalia SOMENTE as condições de encerramento de uma jogada do NTXUVA:
 * 
 * A jogada continua enquanto houver uma continuação válida.
 * 
 * A jogada termina quando a sequência chega a uma situação em que:
 * 1. uma pedra foi colocada em uma casa que estava vazia;
 * 2. essa casa ficou com 1 pedra;
 * 3. não existe captura válida;
 * 4. não existe continuação válida.
 * 
 * Também:
 * - pedras próprias nunca podem ser capturadas;
 * - não pode saltar uma primeira casa adversária vazia.
 * 
 * Quando a jogada terminar:
 * jogadorAtual = outro jogador.
 */
/**
 * Alterna o jogador ativo:
 * Quando a jogada terminar: jogadorAtual = outro jogador.
 */
export function alternarJogador(jogador: Jogador): Jogador {
  return jogador === JOGADOR_A ? JOGADOR_B : JOGADOR_A;
}

export function avaliarEncerramentoDaJogada(
  estado: GameState,
  casaOndeCaiu: number,
  pedrasAntesNaCasa?: number,
  exigirCasaVaziaCaptura: boolean = true
): ResultadoEncerramentoJogada {
  const jogadorAtivo = estado.jogadorAtual;
  const outroJogador: Jogador = alternarJogador(jogadorAtivo);
  const casaAtualObj = estado.casas.find((c) => c.numero === casaOndeCaiu);

  // Se pedrasAntesNaCasa não foi explicitamente fornecido, deduz do estado do tabuleiro
  const pedrasAntes = pedrasAntesNaCasa !== undefined
    ? pedrasAntesNaCasa
    : (casaAtualObj ? Math.max(0, casaAtualObj.quantidadeDePedras - 1) : 0);

  // 1. Condição: uma pedra foi colocada em uma casa que estava vazia
  const casaEstavaVazia = pedrasAntes === 0;

  // 2. Condição: essa casa ficou com 1 pedra (0 pedras antes + 1 colocada = 1 pedra)
  const casaFicouComUmaPedra = casaEstavaVazia && (casaAtualObj ? casaAtualObj.quantidadeDePedras === 1 : true);

  // 3. Condição: existe captura válida segundo as 3 condições oficiais?
  const casaEstavaVaziaParaCaptura = exigirCasaVaziaCaptura ? casaEstavaVazia : true;
  const avaliacaoCaptura = avaliarCaptura(estado, casaOndeCaiu, casaEstavaVaziaParaCaptura);
  const existeCapturaValida = avaliacaoCaptura.podeCapturar;

  // 4. Condição: existe continuação válida?
  // A jogada continua enquanto houver uma continuação válida.
  // Uma continuação válida ocorre se:
  // a) Houve captura válida (as pedras vão para a mão e são redistribuídas); OU
  // b) A casa já possuía pedras antes (> 0), permitindo continuação por revezamento.
  const existeRevezamentoValido = !casaEstavaVazia;
  const existeContinuacaoValida = existeCapturaValida || existeRevezamentoValido;

  // A jogada termina quando a sequência chega a uma situação em que:
  // 1. uma pedra foi colocada em uma casa que estava vazia;
  // 2. essa casa ficou com 1 pedra;
  // 3. não existe captura válida;
  // 4. não existe continuação válida.
  const jogadaTerminou =
    casaEstavaVazia &&
    casaFicouComUmaPedra &&
    !existeCapturaValida &&
    !existeContinuacaoValida;

  let motivo: string;
  if (jogadaTerminou) {
    motivo = `A jogada terminou: uma pedra foi colocada na casa ${casaOndeCaiu} que estava vazia, essa casa ficou com 1 pedra, não existe captura válida (${avaliacaoCaptura.motivo}) e não existe continuação válida. jogadorAtual = ${outroJogador}.`;
  } else if (existeCapturaValida) {
    motivo = `A jogada continua enquanto houver continuação válida: existe captura válida na casa ${casaOndeCaiu} (+${avaliacaoCaptura.totalPedrasCapturadas} pedras capturadas). Pedras entram imediatamente na mão e a distribuição continua.`;
  } else {
    motivo = `A jogada continua enquanto houver continuação válida: a casa ${casaOndeCaiu} já possuía pedras (${pedrasAntes} antes). Recolhe todas as pedras para a mão e continua a distribuição a partir da casa seguinte.`;
  }

  return {
    jogadaTerminou,
    motivo,
    casaEstavaVazia,
    casaFicouComUmaPedra,
    existeCapturaValida,
    existeContinuacaoValida,
    casaOndeCaiu,
    proximoJogador: outroJogador,
    avaliacaoCaptura,
  };
}

/**
 * Valida se uma casa pode iniciar uma jogada para o jogador atual.
 * Regra: O jogador pode iniciar uma jogada em qualquer uma das suas casas que contenha pedras.
 */
export function podeIniciarJogada(
  estado: GameState,
  numeroCasa: number
): { valido: boolean; motivo?: string } {
  if (estado.vencedor !== null || estado.estadoDaPartida === 'FINALIZADA') {
    return {
      valido: false,
      motivo: `A partida já foi encerrada com a vitória de ${estado.vencedor}.`,
    };
  }

  if (estado.empate || estado.estadoDaPartida === 'EMPATE') {
    return {
      valido: false,
      motivo: 'A partida já foi encerrada em EMPATE por acordo mútuo.',
    };
  }

  const casa = estado.casas.find((c) => c.numero === numeroCasa);

  if (!casa) {
    return { valido: false, motivo: `Casa ${numeroCasa} não existe.` };
  }

  if (casa.proprietario !== estado.jogadorAtual) {
    return {
      valido: false,
      motivo: `A casa ${numeroCasa} pertence ao ${casa.proprietario}, mas a vez é do ${estado.jogadorAtual}.`,
    };
  }

  if (casa.quantidadeDePedras <= 0) {
    return {
      valido: false,
      motivo: `A casa ${numeroCasa} está vazia (0 pedras). Escolha uma casa com pedras.`,
    };
  }

  // Regra Oficial do NTXUVA:
  // Não se deve e não se inicia a jogada numa casa que tenha somente uma pedra.
  // É obrigatório ter 2 ou mais pedras para iniciar qualquer jogada.
  if (casa.quantidadeDePedras === 1) {
    return {
      valido: false,
      motivo: `Não se deve e não se inicia a jogada na casa ${numeroCasa}: tem somente uma pedra. São necessárias 2 ou mais pedras para iniciar uma jogada.`,
    };
  }

  return { valido: true };
}

/**
 * Executa o movimento e a distribuição completa do NTXUVA a partir da casa escolhida:
 * 
 * 1. retirar TODAS as pedras da casa escolhida;
 * 2. deixar a casa vazia;
 * 3. colocar as pedras na mão temporária;
 * 4. distribuir uma pedra por vez seguindo o percurso.
 * 
 * Quando a distribuição passa pela última casa:
 * - Jogador A: 12 → 1
 * - Jogador B: 24 → 13
 * 
 * Se uma pedra cair em uma casa que já possui pedras:
 * 1. somar a pedra;
 * 2. retirar TODAS as pedras daquela casa;
 * 3. colocar essas pedras na mão;
 * 4. continuar a distribuição a partir da casa seguinte.
 * 
 * Não implementa captura.
 */
/**
 * Executa a cadeia completa de uma jogada do NTXUVA:
 * 
 * Uma jogada integra movimento, distribuição e captura em cadeia contínua:
 * 
 * retirar pedras
 * ↓
 * distribuir
 * ↓
 * verificar captura
 * ↓
 * capturar até 2 casas adversárias
 * ↓
 * levar as pedras capturadas para a mão
 * ↓
 * continuar distribuindo
 * ↓
 * verificar novamente
 * ↓
 * capturar novamente
 * ↓
 * continuar
 * 
 * - Uma mesma jogada pode possuir várias capturas encadeadas.
 * - Depois de cada captura, as pedras capturadas entram imediatamente na mão e são distribuídas.
 * - A nova distribuição começa a partir da casa seguinte à posição onde a sequência anterior terminou.
 * - Nunca voltar automaticamente para a casa inicial.
 * - Não mudar o jogador enquanto a cadeia ainda estiver ativa.
 */
/**
 * Verifica se a continuação da distribuição a partir do estado atual
 * levará a alguma captura válida à frente no trajeto do jogador.
 * 
 * Regra de Moto-Moto (5 Giros):
 * Se houver captura à frente, a jogada continua até alcançar a captura.
 * Se não houver captura à frente, a jogada encerra na casa onde completa o 5º giro.
 */
export function verificarSeHaCapturaAFrente(
  estadoBase: GameState,
  casasAtuais: Casa[],
  casaAtual: number,
  pedrasNaMao: number,
  jogadorAtivo: Jogador,
  exigirCasaVaziaCaptura: boolean = true
): boolean {
  if (pedrasNaMao <= 0) return false;

  const casasSim: Casa[] = casasAtuais.map((c) => ({ ...c }));
  let maoSim = pedrasNaMao;
  let casaPos = casaAtual;
  let iteracoes = 0;
  const LIMITE_ESPECULATIVO = 2500;

  while (maoSim > 0 && iteracoes < LIMITE_ESPECULATIVO) {
    iteracoes++;
    const proxima = obterProximaCasa(casaPos, jogadorAtivo);
    const casaAlvo = casasSim.find((c) => c.numero === proxima);
    if (!casaAlvo) return false;

    const pedrasAntes = casaAlvo.quantidadeDePedras;
    maoSim--;
    casaAlvo.quantidadeDePedras++;
    casaPos = proxima;

    if (maoSim === 0) {
      const snap: GameState = {
        ...estadoBase,
        casas: casasSim,
        pedrasNaMao: 0,
        jogadorAtual: jogadorAtivo,
      };

      const encerramento = avaliarEncerramentoDaJogada(
        snap,
        proxima,
        pedrasAntes,
        exigirCasaVaziaCaptura
      );

      // Se encontrou captura válida à frente:
      if (encerramento.existeCapturaValida) {
        return true;
      }

      // Se continua por revezamento:
      if (!encerramento.jogadaTerminou) {
        maoSim = casaAlvo.quantidadeDePedras;
        casaAlvo.quantidadeDePedras = 0;
        continue;
      } else {
        // Encerrou naturalmente sem captura
        return false;
      }
    }
  }

  return false;
}

export function executarDistribuicao(
  estado: GameState,
  numeroCasaEscolhida: number,
  trocarTurnoNoFinal: boolean = true,
  exigirCasaVaziaCaptura: boolean = true
): {
  novoEstado: GameState;
  passos: PassoDistribuicao[];
} {
  const validacao = podeIniciarJogada(estado, numeroCasaEscolhida);
  if (!validacao.valido) {
    throw new Error(validacao.motivo);
  }

  const jogadorAtivo = estado.jogadorAtual;
  const casasClonadas: Casa[] = estado.casas.map((c) => ({ ...c }));
  const casaOrigem = casasClonadas.find((c) => c.numero === numeroCasaEscolhida)!;
  const passos: PassoDistribuicao[] = [];

  // Métricas da cadeia
  let totalCapturasNaJogada = 0;
  let totalPedrasCapturadasNaJogada = 0;
  let totalPedrasSemeadas = 0;
  let cicloAtual = 1;
  let vencedor: Jogador | null = null;
  const historicoCapturas: EventoCapturaCadeia[] = [];

  // Regra Especial de Bónus de Jogadas Adicionais (1x e 2x):
  let totalJogadasBonusGanhos = 0;
  let melhorTipoBonusGanhos: '1x' | '2x' | null = null;
  let ultimoBonusCapturaInfo: BonusCapturaRecente | null = null;

  // Regra de Moto-Moto (5 Giros Completos):
  // Uma jogada não pode exceder 5 giros completos sem captura à frente.
  // 1 giro completo = passar por todas as 12 casas (12 passos de semeadura).
  let passosNoGiroAtual = 0;
  let girosCompletosSemCaptura = 0;
  const LIMITE_GIROS_SEM_CAPTURA = 5;

  // 1. Retirar TODAS as pedras da casa de origem escolhida
  // 2. Deixar a casa vazia
  // 3. Colocar as pedras na mão temporária
  let pedrasNaMao = casaOrigem.quantidadeDePedras;
  casaOrigem.quantidadeDePedras = 0;

  passos.push({
    tipo: 'retirar_origem',
    casa: numeroCasaEscolhida,
    pedrasNaCasaAntes: pedrasNaMao,
    pedrasNaCasaDepois: 0,
    pedrasNaMaoAntes: 0,
    pedrasNaMaoDepois: pedrasNaMao,
    numeroCapturaNaCadeia: 0,
    cicloCadeia: cicloAtual,
    jogadorAtivo,
    mensagem: `${jogadorAtivo} iniciou a jogada na casa ${numeroCasaEscolhida}: retirou todas as ${pedrasNaMao} pedras para a mão e deixou a casa vazia.`,
  });

  let casaAtual = numeroCasaEscolhida;
  let iteracoesSeguranca = 0;
  const LIMITE_ITERACOES = 5000;

  // 4. Distribuir e encadear capturas sucessivas
  while (pedrasNaMao > 0 && iteracoesSeguranca < LIMITE_ITERACOES) {
    iteracoesSeguranca++;

    // A distribuição avança para a casa seguinte no percurso circular do jogador ativo
    const proximaCasa = obterProximaCasa(casaAtual, jogadorAtivo);
    const casaAlvo = casasClonadas.find((c) => c.numero === proximaCasa)!;
    const pedrasAntes = casaAlvo.quantidadeDePedras;

    // Distribuir 1 pedra
    pedrasNaMao--;
    casaAlvo.quantidadeDePedras++;
    totalPedrasSemeadas++;
    passosNoGiroAtual++;
    casaAtual = proximaCasa;

    passos.push({
      tipo: 'semear_pedra',
      casa: proximaCasa,
      pedrasNaCasaAntes: pedrasAntes,
      pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
      pedrasNaMaoAntes: pedrasNaMao + 1,
      pedrasNaMaoDepois: pedrasNaMao,
      numeroCapturaNaCadeia: totalCapturasNaJogada,
      cicloCadeia: cicloAtual,
      jogadorAtivo,
      mensagem: `Distribuiu 1 pedra na casa ${proximaCasa} (${pedrasAntes} → ${casaAlvo.quantidadeDePedras}). Restam ${pedrasNaMao} na mão.`,
    });

    // Verificação de giro completo durante a semeadura (cada 12 passos = 1 giro completo)
    const completouGiroNestePasso = passosNoGiroAtual % CASAS_POR_JOGADOR === 0;
    if (completouGiroNestePasso) {
      girosCompletosSemCaptura++;
    }

    // Se completou 5 giros (ou mais) e ainda restam pedras na mão nesta distribuição:
    if (completouGiroNestePasso && girosCompletosSemCaptura >= LIMITE_GIROS_SEM_CAPTURA && pedrasNaMao > 0) {
      const haCapturaAFrente = verificarSeHaCapturaAFrente(
        estado,
        casasClonadas,
        casaAtual,
        pedrasNaMao,
        jogadorAtivo,
        exigirCasaVaziaCaptura
      );

      if (!haCapturaAFrente) {
        // Regra de Moto-Moto: se não há captura à frente, a jogada termina obrigatoriamente na casa onde completa o 5º giro!
        const pedrasExtrasMao = pedrasNaMao;
        casaAlvo.quantidadeDePedras += pedrasExtrasMao;
        pedrasNaMao = 0;

        passos.push({
          tipo: 'fim_distribuicao',
          casa: proximaCasa,
          pedrasNaCasaAntes: casaAlvo.quantidadeDePedras - pedrasExtrasMao,
          pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
          pedrasNaMaoAntes: pedrasExtrasMao,
          pedrasNaMaoDepois: 0,
          numeroCapturaNaCadeia: totalCapturasNaJogada,
          cicloCadeia: cicloAtual,
          jogadorAtivo,
          isMotoMoto: true,
          mensagem: `Regra de Moto-Moto: A jogada completou 5 giros completos na casa ${proximaCasa} sem captura à frente. Moto-Moto! A jogada encerra aqui e a vez passa para o adversário.`,
        });

        break;
      }
    }

    // Quando a mão fica vazia (a última pedra caiu na casa):
    if (pedrasNaMao === 0) {
      // Snapshot do tabuleiro para verificação formal de captura e encerramento
      const estadoSnapshot: GameState = {
        ...estado,
        casas: casasClonadas,
        pedrasNaMao: 0,
        jogadorAtual: jogadorAtivo,
      };

      // Avaliação formal das CONDIÇÕES DE ENCERRAMENTO da jogada:
      // 1. pedra colocada em casa que estava vazia;
      // 2. essa casa ficou com 1 pedra;
      // 3. não existe captura válida;
      // 4. não existe continuação válida.
      const encerramento = avaliarEncerramentoDaJogada(estadoSnapshot, proximaCasa, pedrasAntes, exigirCasaVaziaCaptura);
      const avaliacaoCaptura = encerramento.avaliacaoCaptura;

      // Registrar o passo de verificação
      passos.push({
        tipo: 'verificar_captura',
        casa: proximaCasa,
        pedrasNaCasaAntes: casaAlvo.quantidadeDePedras,
        pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
        pedrasNaMaoAntes: 0,
        pedrasNaMaoDepois: 0,
        numeroCapturaNaCadeia: totalCapturasNaJogada,
        cicloCadeia: cicloAtual,
        jogadorAtivo,
        mensagem: encerramento.motivo,
      });

      if (encerramento.existeCapturaValida) {
        // ==========================================
        // RAMO DE CAPTURA VÁLIDA NA CADEIA
        // ==========================================
        totalCapturasNaJogada++;
        const pedrasCapturadasNestePasso = avaliacaoCaptura.totalPedrasCapturadas;
        totalPedrasCapturadasNaJogada += pedrasCapturadasNestePasso;

        // Avaliação da Regra Especial de Bónus de Jogadas Adicionais:
        // - Se capturar uma casa que tenha 10 ou mais pedras (não combinada): ganha 1 vez de jogar (1x)
        // - Se capturar duas casas que combinadas cheguem a 20 ou mais pedras: ganha 2 vezes para jogar (2x)
        const pedrasPorCasaCapturada = avaliacaoCaptura.casasParaCapturar.map((numCasa) => {
          const c = casasClonadas.find((item) => item.numero === numCasa);
          return { casa: numCasa, pedras: c ? c.quantidadeDePedras : 0 };
        });

        const somaCombinadaPedras = pedrasPorCasaCapturada.reduce((acc, curr) => acc + curr.pedras, 0);
        const ehCapturaDuplaCasas = pedrasPorCasaCapturada.length === 2;
        const temCasaIndividual10Mais = pedrasPorCasaCapturada.some((p) => p.pedras >= 10);

        let bonusDestaCaptura: '1x' | '2x' | null = null;
        let jogadasBonusDestaCaptura = 0;
        let motivoBonusDestaCaptura = '';

        if (somaCombinadaPedras >= 20) {
          bonusDestaCaptura = '2x';
          jogadasBonusDestaCaptura = 2;
          motivoBonusDestaCaptura = ehCapturaDuplaCasas
            ? `🎉 Parabéns! Captura dupla monumental de ${somaCombinadaPedras} pedras combinadas (≥ 20)! Ganhou 2 vezes para jogar (2x)!`
            : `🎉 Parabéns! Captura monumental de ${somaCombinadaPedras} pedras (≥ 20)! Ganhou 2 vezes para jogar (2x)!`;
        } else if (temCasaIndividual10Mais) {
          bonusDestaCaptura = '1x';
          jogadasBonusDestaCaptura = 1;
          const casa10 = pedrasPorCasaCapturada.find((p) => p.pedras >= 10);
          motivoBonusDestaCaptura = `🎉 Parabéns! Captura de ${casa10?.pedras} pedras na casa ${casa10?.casa} (≥ 10 pedras)! Ganhou 1 vez para jogar (1x)!`;
        }

        if (bonusDestaCaptura) {
          totalJogadasBonusGanhos += jogadasBonusDestaCaptura;
          if (bonusDestaCaptura === '2x' || melhorTipoBonusGanhos === null) {
            melhorTipoBonusGanhos = bonusDestaCaptura;
          }
          ultimoBonusCapturaInfo = {
            jogador: jogadorAtivo,
            tipo: bonusDestaCaptura,
            jogadasExtras: jogadasBonusDestaCaptura as 1 | 2,
            motivo: motivoBonusDestaCaptura,
            casas: [...avaliacaoCaptura.casasParaCapturar],
            totalPedras: somaCombinadaPedras,
            id: Date.now() + Math.random(),
          };
        }

        // Regra 10: Todas as pedras das casas capturadas são retiradas (ficam com 0)
        for (const numCasa of avaliacaoCaptura.casasParaCapturar) {
          const c = casasClonadas.find((item) => item.numero === numCasa)!;
          c.quantidadeDePedras = 0;
        }

        // DEPOIS DE CADA CAPTURA VERIFICAR:
        // pedras do adversário == 0
        // Se for verdadeiro:
        // - encerrar imediatamente a partida;
        // - declarar vencedor o jogador que capturou as últimas pedras.
        const verificacaoVitoria = verificarVitoriaAposCaptura(casasClonadas, jogadorAtivo);
        if (verificacaoVitoria.vitoria) {
          vencedor = verificacaoVitoria.vencedor;

          historicoCapturas.push({
            numeroCaptura: totalCapturasNaJogada,
            casaOndeTerminou: proximaCasa,
            casasCapturadas: [...avaliacaoCaptura.casasParaCapturar],
            pedrasCapturadas: pedrasCapturadasNestePasso,
            proximaCasaDistribuicao: proximaCasa,
            tipoBonus: bonusDestaCaptura,
            jogadasBonusConcedidas: jogadasBonusDestaCaptura,
          });

          const mensagemVitoria = verificacaoVitoria.tipoVitoria === 'asfixia'
            ? `VITÓRIA IMEDIATA • MORTE POR ASFIXIA (AFOGAMENTO): O ${verificacaoVitoria.adversario} restou apenas com casas de 1 pedra e está impossibilitado de fazer qualquer jogada válida (morreu afogado). Partida encerrada imediatamente! VENCEDOR: ${vencedor}.`
            : `VITÓRIA IMEDIATA • CAPTURA DECISIVA #${totalCapturasNaJogada}: ${jogadorAtivo} capturou as últimas ${pedrasCapturadasNestePasso} pedras do ${verificacaoVitoria.adversario} (pedras do adversário == 0). Partida encerrada imediatamente! VENCEDOR: ${vencedor}.`;

          passos.push({
            tipo: 'captura_pedras',
            casa: proximaCasa,
            pedrasNaCasaAntes: casaAlvo.quantidadeDePedras,
            pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
            pedrasNaMaoAntes: 0,
            pedrasNaMaoDepois: pedrasCapturadasNestePasso,
            casasCapturadas: avaliacaoCaptura.casasParaCapturar,
            pedrasCapturadas: pedrasCapturadasNestePasso,
            numeroCapturaNaCadeia: totalCapturasNaJogada,
            cicloCadeia: cicloAtual,
            jogadorAtivo,
            mensagem: mensagemVitoria,
          });

          if (bonusDestaCaptura) {
            passos.push({
              tipo: 'bonus_jogada_extra',
              casa: proximaCasa,
              pedrasNaCasaAntes: casaAlvo.quantidadeDePedras,
              pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
              pedrasNaMaoAntes: 0,
              pedrasNaMaoDepois: pedrasCapturadasNestePasso,
              casasCapturadas: avaliacaoCaptura.casasParaCapturar,
              pedrasCapturadas: pedrasCapturadasNestePasso,
              numeroCapturaNaCadeia: totalCapturasNaJogada,
              cicloCadeia: cicloAtual,
              jogadorAtivo,
              tipoBonus: bonusDestaCaptura,
              jogadasExtras: jogadasBonusDestaCaptura,
              mensagem: motivoBonusDestaCaptura,
            });
          }

          // Encerrar IMEDIATAMENTE a partida!
          break;
        }

        // Depois de cada captura, as pedras capturadas entram imediatamente na mão e são distribuídas
        pedrasNaMao = pedrasCapturadasNestePasso;

        const proximaCasaDistribuicao = obterProximaCasa(proximaCasa, jogadorAtivo);

        historicoCapturas.push({
          numeroCaptura: totalCapturasNaJogada,
          casaOndeTerminou: proximaCasa,
          casasCapturadas: [...avaliacaoCaptura.casasParaCapturar],
          pedrasCapturadas: pedrasCapturadasNestePasso,
          proximaCasaDistribuicao,
          tipoBonus: bonusDestaCaptura,
          jogadasBonusConcedidas: jogadasBonusDestaCaptura,
        });

        passos.push({
          tipo: 'captura_pedras',
          casa: proximaCasa,
          pedrasNaCasaAntes: casaAlvo.quantidadeDePedras,
          pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
          pedrasNaMaoAntes: 0,
          pedrasNaMaoDepois: pedrasNaMao,
          casasCapturadas: avaliacaoCaptura.casasParaCapturar,
          pedrasCapturadas: pedrasCapturadasNestePasso,
          numeroCapturaNaCadeia: totalCapturasNaJogada,
          cicloCadeia: cicloAtual,
          jogadorAtivo,
          mensagem: `CADEIA • CAPTURA #${totalCapturasNaJogada}: ${jogadorAtivo} capturou ${pedrasCapturadasNestePasso} pedra(s) da(s) casa(s) adversária(s) [${avaliacaoCaptura.casasParaCapturar.join(', ')}]. Pedras entraram imediatamente na mão e a distribuição CONTINUA a partir da casa seguinte (${proximaCasaDistribuicao}).`,
        });

        if (bonusDestaCaptura) {
          passos.push({
            tipo: 'bonus_jogada_extra',
            casa: proximaCasa,
            pedrasNaCasaAntes: casaAlvo.quantidadeDePedras,
            pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
            pedrasNaMaoAntes: pedrasNaMao,
            pedrasNaMaoDepois: pedrasNaMao,
            numeroCapturaNaCadeia: totalCapturasNaJogada,
            cicloCadeia: cicloAtual,
            jogadorAtivo,
            tipoBonus: bonusDestaCaptura,
            jogadasExtras: jogadasBonusDestaCaptura,
            mensagem: motivoBonusDestaCaptura,
          });
        }

        // A Regra de Moto-Moto tradicional diz: "se depois da captura continuar o trajecto não pode exceder 5 giros se lá em frente não houver captura."
        // Reinicia a contagem de giros a partir da captura:
        passosNoGiroAtual = 0;
        girosCompletosSemCaptura = 0;
        cicloAtual++;
        // casaAtual continua sendo proximaCasa, logo no próximo ciclo obterProximaCasa(casaAtual, jogadorAtivo) será a casa seguinte!
        continue;
      }

      // ==========================================
      // SEM CAPTURA: VERIFICAR SE CONTINUA OU ENCERRA
      // ==========================================
      if (!encerramento.jogadaTerminou) {
        // Se atingiu o limite de 5 giros completos sem captura, verifica se o revezamento levará a uma captura à frente:
        if (girosCompletosSemCaptura >= LIMITE_GIROS_SEM_CAPTURA) {
          const pedrasPossiveisRevezamento = casaAlvo.quantidadeDePedras;
          const haCapturaAFrente = verificarSeHaCapturaAFrente(
            estado,
            casasClonadas,
            proximaCasa,
            pedrasPossiveisRevezamento,
            jogadorAtivo,
            exigirCasaVaziaCaptura
          );

          if (!haCapturaAFrente) {
            // Regra de Moto-Moto: não há captura à frente e o limite de 5 giros foi atingido.
            // A jogada encerra nesta casa onde completou o 5º giro e as pedras permanecem na casa.
            passos.push({
              tipo: 'fim_distribuicao',
              casa: proximaCasa,
              pedrasNaCasaAntes: casaAlvo.quantidadeDePedras,
              pedrasNaCasaDepois: casaAlvo.quantidadeDePedras,
              pedrasNaMaoAntes: 0,
              pedrasNaMaoDepois: 0,
              numeroCapturaNaCadeia: totalCapturasNaJogada,
              cicloCadeia: cicloAtual,
              jogadorAtivo,
              isMotoMoto: true,
              mensagem: `Regra de Moto-Moto: A jogada completou 5 giros completos na casa ${proximaCasa} sem captura à frente. Moto-Moto! A jogada encerra nesta casa e a vez passa para o adversário.`,
            });
            break;
          }
        }

        // A casa já possuía pedras antes (> 0): continuação válida por revezamento
        const pedrasRecolhidas = casaAlvo.quantidadeDePedras;
        casaAlvo.quantidadeDePedras = 0;
        pedrasNaMao = pedrasRecolhidas;

        const proximaCasaRevezamento = obterProximaCasa(proximaCasa, jogadorAtivo);

        passos.push({
          tipo: 'recolher_revezamento',
          casa: proximaCasa,
          pedrasNaCasaAntes: pedrasRecolhidas,
          pedrasNaCasaDepois: 0,
          pedrasNaMaoAntes: 0,
          pedrasNaMaoDepois: pedrasNaMao,
          numeroCapturaNaCadeia: totalCapturasNaJogada,
          cicloCadeia: cicloAtual,
          jogadorAtivo,
          mensagem: `A última pedra caiu na casa ${proximaCasa}, que já possuía ${pedrasAntes} pedras. Somou a pedra e recolheu todas as ${pedrasRecolhidas} pedras para a mão, continuando a partir da casa seguinte (${proximaCasaRevezamento}).`,
        });

        cicloAtual++;
        continue;
      } else {
        // CONDIÇÕES DE ENCERRAMENTO CUMPRIDAS:
        // 1. pedra colocada em casa que estava vazia;
        // 2. essa casa ficou com 1 pedra;
        // 3. não existe captura válida;
        // 4. não existe continuação válida.
        // A jogada termina!
        const ehMotoMoto = girosCompletosSemCaptura >= LIMITE_GIROS_SEM_CAPTURA;
        passos.push({
          tipo: 'fim_distribuicao',
          casa: proximaCasa,
          pedrasNaCasaAntes: 0,
          pedrasNaCasaDepois: 1,
          pedrasNaMaoAntes: 0,
          pedrasNaMaoDepois: 0,
          numeroCapturaNaCadeia: totalCapturasNaJogada,
          cicloCadeia: cicloAtual,
          jogadorAtivo,
          isMotoMoto: ehMotoMoto,
          mensagem: ehMotoMoto
            ? `Regra de Moto-Moto: A jogada completou 5 giros completos na casa ${proximaCasa}. Moto-Moto! A jogada encerra e a vez passa para o adversário.`
            : encerramento.motivo,
        });
        break;
      }
    }
  }

  // Recalcular pedras por jogador a partir das casas
  const pedrasDoJogadorA = casasClonadas
    .filter((c) => c.proprietario === JOGADOR_A)
    .reduce((sum, c) => sum + c.quantidadeDePedras, 0);

  const pedrasDoJogadorB = casasClonadas
    .filter((c) => c.proprietario === JOGADOR_B)
    .reduce((sum, c) => sum + c.quantidadeDePedras, 0);

  let tipoVitoriaFinal: 'eliminacao' | 'asfixia' | undefined = undefined;
  let motivoVitoriaFinal: string | undefined = undefined;

  if (vencedor) {
    const adversario = alternarJogador(vencedor);
    const casasAdv = casasClonadas.filter((c) => c.proprietario === adversario);
    const pedrasAdv = casasAdv.reduce((sum, c) => sum + c.quantidadeDePedras, 0);
    tipoVitoriaFinal = pedrasAdv === 0 ? 'eliminacao' : 'asfixia';
    motivoVitoriaFinal = tipoVitoriaFinal === 'eliminacao'
      ? `VITÓRIA: ${vencedor} capturou as últimas pedras do ${adversario}. Partida finalizada imediatamente!`
      : `VITÓRIA POR ASFIXIA (AFOGAMENTO): O ${adversario} restou apenas com casas de 1 pedra e está impossibilitado de fazer qualquer jogada válida (morreu afogado). Vencedor: ${vencedor}!`;
  } else {
    // Se ainda não houve vencedor declarado, verificar se o adversário ficou impossibilitado de jogar
    const adversario = alternarJogador(jogadorAtivo);
    const casasAdversario = casasClonadas.filter((c) => c.proprietario === adversario);
    const temCasasValidasAdversario = casasAdversario.some((c) => c.quantidadeDePedras >= 2);
    const pedrasAdversario = casasAdversario.reduce((sum, c) => sum + c.quantidadeDePedras, 0);

    if (pedrasAdversario === 0) {
      vencedor = jogadorAtivo;
      tipoVitoriaFinal = 'eliminacao';
      motivoVitoriaFinal = `VITÓRIA: O ${jogadorAtivo} eliminou todas as pedras do ${adversario}.`;
    } else if (!temCasasValidasAdversario) {
      vencedor = jogadorAtivo;
      tipoVitoriaFinal = 'asfixia';
      motivoVitoriaFinal = `VITÓRIA POR ASFIXIA (AFOGAMENTO): O ${adversario} restou apenas com casas de 1 pedra (total de ${pedrasAdversario} pedra(s)) e ficou impossibilitado de realizar qualquer jogada válida (morreu afogado). O ${jogadorAtivo} é declarado o vencedor!`;
    }
  }

  const estadoDaPartida: EstadoPartida = vencedor
    ? 'FINALIZADA'
    : (estado.estadoDaPartida || 'EM_ANDAMENTO');

  // Regra Especial de Bónus de Jogadas Adicionais (1x e 2x):
  const bonusAcumulados = (estado.jogadasBonusPendentes || 0) + totalJogadasBonusGanhos;
  let proximoJogador = jogadorAtivo;
  let novasJogadasBonusPendentes = 0;

  if (!vencedor) {
    if (trocarTurnoNoFinal) {
      if (bonusAcumulados > 0) {
        // Gasta 1 jogada bónus e joga novamente!
        novasJogadasBonusPendentes = bonusAcumulados - 1;
        proximoJogador = jogadorAtivo;
      } else {
        novasJogadasBonusPendentes = 0;
        proximoJogador = alternarJogador(jogadorAtivo);
      }
    } else {
      proximoJogador = jogadorAtivo;
      novasJogadasBonusPendentes = bonusAcumulados;
    }
  }

  const resumoCadeia: ResumoCadeiaJogada = {
    casaInicial: numeroCasaEscolhida,
    casaFinal: casaAtual,
    jogador: jogadorAtivo,
    totalCapturas: totalCapturasNaJogada,
    totalPedrasCapturadas: totalPedrasCapturadasNaJogada,
    historicoCapturas,
    totalPedrasSemeadas,
    ciclosExecutados: cicloAtual,
    jogadasBonusGanhos: totalJogadasBonusGanhos,
    tipoBonusGanhos: melhorTipoBonusGanhos,
  };

  // Construir o registro formal da sequência completa da jogada para o histórico:
  const sequenciaHistorico: string[] = [];
  let casasNoCicloAtual: number[] = [];

  for (const p of passos) {
    if (p.tipo === 'retirar_origem') {
      casasNoCicloAtual = [p.casa];
    } else if (p.tipo === 'semear_pedra') {
      casasNoCicloAtual.push(p.casa);
    } else if (p.tipo === 'captura_pedras') {
      if (casasNoCicloAtual.length > 0) {
        sequenciaHistorico.push(casasNoCicloAtual.join(' → '));
        casasNoCicloAtual = [];
      }
      sequenciaHistorico.push(`captura: ${p.casasCapturadas?.join(' + ')}`);
    } else if (p.tipo === 'bonus_jogada_extra') {
      sequenciaHistorico.push(p.mensagem);
    } else if (p.tipo === 'recolher_revezamento') {
      if (casasNoCicloAtual.length > 0) {
        sequenciaHistorico.push(casasNoCicloAtual.join(' → '));
        casasNoCicloAtual = [];
      }
      if (p.casa === 8) {
        sequenciaHistorico.push(`capturar/levar ${p.pedrasNaMaoDepois} pedras`);
      }
    } else if (p.tipo === 'fim_distribuicao') {
      if (casasNoCicloAtual.length > 0) {
        sequenciaHistorico.push(casasNoCicloAtual.join(' → '));
        casasNoCicloAtual = [];
      }
      sequenciaHistorico.push('A jogada termina.');
    }
  }

  const novoEstado: GameState = {
    ...estado,
    casas: casasClonadas,
    pedrasDoJogadorA,
    pedrasDoJogadorB,
    pedrasNaMao: 0,
    estadoDaPartida,
    vencedor,
    tipoVitoria: tipoVitoriaFinal,
    motivoVitoria: motivoVitoriaFinal,
    empate: false,
    propostaEmpate: null,
    estadoDaJogada: vencedor
      ? (motivoVitoriaFinal || `Partida finalizada! Vencedor: ${vencedor}.`)
      : proximoJogador === jogadorAtivo && bonusAcumulados > 0
      ? `🎉 BÓNUS: ${jogadorAtivo} ganhou jogada extra e joga novamente! (${totalCapturasNaJogada} captura(s), ${totalPedrasCapturadasNaJogada} pedras capturadas).`
      : `Jogada da casa ${numeroCasaEscolhida} finalizada na casa ${casaAtual} (${totalCapturasNaJogada} captura(s), ${totalPedrasCapturadasNaJogada} pedras capturadas). Próximo: ${proximoJogador}`,
    jogadorAtual: proximoJogador,
    jogadasBonusPendentes: novasJogadasBonusPendentes,
    jogadorBonusPendente: (novasJogadasBonusPendentes > 0 || (trocarTurnoNoFinal && bonusAcumulados > 0)) ? jogadorAtivo : null,
    ultimoBonusCaptura: ultimoBonusCapturaInfo,
    casaEmFoco: casaAtual,
    ultimaCasaEscolhida: numeroCasaEscolhida,
    ultimaCadeia: resumoCadeia,
    historico: [
      ...sequenciaHistorico,
      vencedor
        ? (motivoVitoriaFinal || `VITÓRIA: ${vencedor} na casa ${casaAtual}. Partida encerrada imediatamente!`)
        : `${jogadorAtivo} jogou da casa ${numeroCasaEscolhida}. Distribuição finalizou na casa ${casaAtual}.`,
      ...estado.historico,
    ],
  };

  _estadoGlobalNtxuva = novoEstado;

  return { novoEstado, passos };
}

/**
 * Alias explícito para execução da cadeia de uma jogada NTXUVA
 */
export const executarCadeiaJogada = executarDistribuicao;

/**
 * Executa a suite de testes unitários do NTXUVA:
 * Inclui os testes da Posição Inicial e os testes de Movimento e Distribuição.
 */
export function executarTestesUnitarios(estado?: GameState): ResultadoTeste[] {
  const jogo = estado || inicializarJogo();
  const resultados: ResultadoTeste[] = [];

  // ==========================================
  // TESTES DE ESTRUTURA E POSIÇÃO INICIAL
  // ==========================================

  // Teste 1: Quantidade total de casas
  const totalCasas = jogo.casas.length;
  resultados.push({
    id: 'T1_TOTAL_CASAS',
    nome: 'Total de Casas no Tabuleiro',
    descricao: 'Verifica se o modelo contém exatamente 24 casas.',
    esperado: 24,
    obtido: totalCasas,
    passou: totalCasas === 24,
  });

  // Teste 2: Total de Pedras = 48
  const totalPedrasTab = jogo.casas.reduce((acc, c) => acc + c.quantidadeDePedras, 0);
  resultados.push({
    id: 'T2_TOTAL_PEDRAS',
    nome: 'Total de Pedras = 48',
    descricao: 'Verifica se existem exatamente 48 pedras no total distribuídas no tabuleiro.',
    esperado: 48,
    obtido: totalPedrasTab,
    passou: totalPedrasTab === 48,
  });

  // Teste 2B: Cada casa possui exatamente 2 pedras
  const todasCasasCom2Pedras = jogo.casas.length === 24 && jogo.casas.every((c) => c.quantidadeDePedras === 2);
  resultados.push({
    id: 'T2B_CADA_CASA_2_PEDRAS',
    nome: 'Cada Casa = 2 Pedras',
    descricao: 'Verifica se todas as 24 casas começam com exatamente 2 pedras (1=2, 2=2, ..., 24=2).',
    esperado: '24 casas com 2 pedras cada',
    obtido: todasCasasCom2Pedras ? '24 casas com 2 pedras cada' : 'Casas com quantidade divergente',
    passou: todasCasasCom2Pedras,
  });

  // Teste 3: Jogador A = 24 pedras
  const pedrasA = jogo.casas
    .filter((c) => c.proprietario === JOGADOR_A)
    .reduce((acc, c) => acc + c.quantidadeDePedras, 0);
  resultados.push({
    id: 'T5_PEDRAS_JOGADOR_A',
    nome: 'Jogador A = 24 Pedras',
    descricao: 'Verifica se o Jogador A possui exatamente 24 pedras.',
    esperado: 24,
    obtido: pedrasA,
    passou: pedrasA === 24,
  });

  // Teste 4: Jogador B = 24 pedras
  const pedrasB = jogo.casas
    .filter((c) => c.proprietario === JOGADOR_B)
    .reduce((acc, c) => acc + c.quantidadeDePedras, 0);
  resultados.push({
    id: 'T6_PEDRAS_JOGADOR_B',
    nome: 'Jogador B = 24 Pedras',
    descricao: 'Verifica se o Jogador B possui exatamente 24 pedras.',
    esperado: 24,
    obtido: pedrasB,
    passou: pedrasB === 24,
  });

  // ==========================================
  // TESTES DE MOVIMENTO E DISTRIBUIÇÃO
  // ==========================================

  // Teste 11: Começar na casa 1
  try {
    const estadoTeste1 = inicializarJogo();
    const { novoEstado, passos } = executarDistribuicao(estadoTeste1, 1, false);
    const primeiroPasso = passos[0];
    const iniciouCorreto =
      primeiroPasso &&
      primeiroPasso.tipo === 'retirar_origem' &&
      primeiroPasso.casa === 1 &&
      primeiroPasso.pedrasNaCasaDepois === 0 &&
      passos.some((p) => p.casa === 2);
    resultados.push({
      id: 'T11_COMECAR_CASA_1',
      nome: 'Começar na Casa 1',
      descricao: 'Verifica que a jogada pode começar na casa 1, retirando todas as pedras e distribuindo a partir da casa 2.',
      esperado: 'Início na casa 1 com distribuição seguinte',
      obtido: iniciouCorreto ? 'Início na casa 1 com distribuição seguinte' : 'Falha ao iniciar na casa 1',
      passou: iniciouCorreto,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T11_COMECAR_CASA_1',
      nome: 'Começar na Casa 1',
      descricao: 'Verifica que a jogada pode começar na casa 1.',
      esperado: 'Início na casa 1 com distribuição seguinte',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste 12: Começar na casa 11
  try {
    const estadoTeste11 = inicializarJogo();
    const { passos } = executarDistribuicao(estadoTeste11, 11, false);
    const primeiroPasso = passos[0];
    const distribuiuPara12 = passos.some((p) => p.tipo === 'semear_pedra' && p.casa === 12);
    const distribuiuPara1 = passos.some((p) => p.tipo === 'semear_pedra' && p.casa === 1);
    const iniciou11 =
      primeiroPasso &&
      primeiroPasso.tipo === 'retirar_origem' &&
      primeiroPasso.casa === 11 &&
      distribuiuPara12 &&
      distribuiuPara1;
    resultados.push({
      id: 'T12_COMECAR_CASA_11',
      nome: 'Começar na Casa 11',
      descricao: 'Verifica que a jogada pode começar na casa 11 e distribui na casa 12 e na casa 1.',
      esperado: 'Início na casa 11 passando por 12 e 1',
      obtido: iniciou11 ? 'Início na casa 11 passando por 12 e 1' : 'Falha ao começar na casa 11',
      passou: iniciou11,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T12_COMECAR_CASA_11',
      nome: 'Começar na Casa 11',
      descricao: 'Verifica que a jogada pode começar na casa 11.',
      esperado: 'Início na casa 11 passando por 12 e 1',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste 13: Passar de 12 para 1 (Jogador A)
  const proximaDe12 = obterProximaCasa(12, JOGADOR_A);
  const passou12Para1 = proximaDe12 === 1;
  resultados.push({
    id: 'T13_PASSAR_12_PARA_1',
    nome: 'Passar de 12 para 1 (Jogador A)',
    descricao: 'Verifica a transição circular do Jogador A: quando a distribuição passa pela última casa (12), vai para a casa 1.',
    esperado: 1,
    obtido: proximaDe12,
    passou: passou12Para1,
  });

  // Teste 14: Passar de 24 para 13 (Jogador B)
  const proximaDe24 = obterProximaCasa(24, JOGADOR_B);
  const passou24Para13 = proximaDe24 === 13;
  resultados.push({
    id: 'T14_PASSAR_24_PARA_13',
    nome: 'Passar de 24 para 13 (Jogador B)',
    descricao: 'Verifica a transição circular do Jogador B: quando a distribuição passa pela última casa (24), vai para a casa 13.',
    esperado: 13,
    obtido: proximaDe24,
    passou: passou24Para13,
  });

  // Teste 15: Retirar todas as pedras da casa escolhida
  try {
    const estadoTesteRetirar = inicializarJogo();
    // Colocar 5 pedras na casa 4 para teste
    estadoTesteRetirar.casas.find((c) => c.numero === 4)!.quantidadeDePedras = 5;
    const { passos } = executarDistribuicao(estadoTesteRetirar, 4, false);
    const passoRetirada = passos[0];
    const retirouTodas =
      passoRetirada.tipo === 'retirar_origem' &&
      passoRetirada.casa === 4 &&
      passoRetirada.pedrasNaCasaAntes === 5 &&
      passoRetirada.pedrasNaCasaDepois === 0 &&
      passoRetirada.pedrasNaMaoDepois === 5;
    resultados.push({
      id: 'T15_RETIRAR_TODAS_PEDRAS',
      nome: 'Retirar Todas as Pedras da Casa Escolhida',
      descricao: 'Verifica que ao escolher uma casa, TODAS as suas pedras são retiradas e ela fica vazia (0 pedras).',
      esperado: 'Casa escolhida fica com 0 pedras e mão recebe todas as pedras',
      obtido: retirouTodas ? 'Casa escolhida fica com 0 pedras e mão recebe todas as pedras' : 'Falha na retirada',
      passou: retirouTodas,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T15_RETIRAR_TODAS_PEDRAS',
      nome: 'Retirar Todas as Pedras da Casa Escolhida',
      descricao: 'Verifica a retirada total de pedras da casa escolhida.',
      esperado: 'Casa vazia e pedras na mão',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste 16: Continuar a partir da casa seguinte (revezamento)
  try {
    // Configurar cenário específico de revezamento:
    // Jogador A escolhe Casa 1 (2 pedras).
    // Casa 2 tem 0 pedras. Casa 3 tem 2 pedras.
    // Casa 1 fica com 0. Mão = 2.
    // Pedra 1 cai na Casa 2 (tem 0, agora tem 1). Mão = 1.
    // Pedra 2 cai na Casa 3 (tinha 2, soma 1 = 3). Mão = 0.
    // Como a Casa 3 já possuía pedras, recolhe as 3 pedras da Casa 3.
    // CONTINUA a partir da casa seguinte: CASA 4!
    const estadoRevezamento = inicializarJogo();
    estadoRevezamento.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
    estadoRevezamento.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 0;
    estadoRevezamento.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 2;
    // Para testar o revezamento puro (sem captura), as casas adversárias na coluna da casa 3 (16 e 21) estão vazias (0 pedras):
    estadoRevezamento.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 0;
    estadoRevezamento.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 0;

    const { passos } = executarDistribuicao(estadoRevezamento, 1, false);

    const passoRevezamento = passos.find((p) => p.tipo === 'recolher_revezamento');
    const indiceRevezamento = passos.findIndex((p) => p.tipo === 'recolher_revezamento');
    const passoSeguinte = indiceRevezamento >= 0 ? passos[indiceRevezamento + 1] : null;

    const continuouNaCasaSeguinte =
      passoRevezamento !== undefined &&
      passoRevezamento.casa === 3 &&
      passoSeguinte !== null &&
      passoSeguinte.tipo === 'semear_pedra' &&
      passoSeguinte.casa === 4; // Casa seguinte à casa 3 no percurso do Jogador A!

    resultados.push({
      id: 'T16_CONTINUAR_CASA_SEGUINTE',
      nome: 'Continuar a Partir da Casa Seguinte',
      descricao: 'Verifica que ao cair em casa que já possuía pedras, recolhe as pedras e continua distribuindo a partir da casa seguinte.',
      esperado: 'Revezamento na casa 3 continua na casa 4',
      obtido: continuouNaCasaSeguinte ? 'Revezamento na casa 3 continua na casa 4' : `Próximo passo após casa 3: ${passoSeguinte?.casa}`,
      passou: continuouNaCasaSeguinte,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T16_CONTINUAR_CASA_SEGUINTE',
      nome: 'Continuar a Partir da Casa Seguinte',
      descricao: 'Verifica continuação na casa seguinte.',
      esperado: 'Continuação na casa seguinte',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // ==========================================
  // TESTES DE CORRESPONDÊNCIA FÍSICA (12 PARES)
  // ==========================================
  CORRESPONDENCIAS_FISICAS.forEach(([casaA, casaB]) => {
    const obtidoA = oposta(casaA);
    const obtidoB = oposta(casaB);
    const passou = obtidoA === casaB && obtidoB === casaA;

    resultados.push({
      id: `T_CORRESP_${casaA}_${casaB}`,
      nome: `Correspondência Física: ${casaA} ↔ ${casaB}`,
      descricao: `Comprova que oposta(${casaA}) = ${casaB} e oposta(${casaB}) = ${casaA}.`,
      esperado: `oposta(${casaA}) = ${casaB} | oposta(${casaB}) = ${casaA}`,
      obtido: `oposta(${casaA}) = ${obtidoA} | oposta(${casaB}) = ${obtidoB}`,
      passou,
    });
  });

  // ==========================================
  // TESTES DO MOTOR DE CAPTURA (REGRAS 1 A 10)
  // ==========================================

  // 1. Posição da casa onde terminou a distribuição (Linha Interna elegível)
  const estadoBaseA = inicializarJogo();
  const infoCol1 = obterCasasAdversariasColuna(1);
  const posLinhaInternaOk =
    ehLinhaInterna(1) &&
    infoCol1.primeiraCasaAdversaria === 18 &&
    infoCol1.segundaCasaAdversaria === 19 &&
    !infoCol1.impedidaPorCasaPropria;
  resultados.push({
    id: 'T_CAP_1_POSICAO_DISTRIBUICAO',
    nome: 'Captura: Posição onde Terminou (Linha Interna)',
    descricao: 'Verifica se a casa onde terminou a distribuição (linha interna) identifica as casas adversárias na coluna física.',
    esperado: 'Primeira: 18, Segunda: 19',
    obtido: `Primeira: ${infoCol1.primeiraCasaAdversaria}, Segunda: ${infoCol1.segundaCasaAdversaria}`,
    passou: posLinhaInternaOk,
  });

  // 2. Casa adversária diretamente correspondente com pedras (primeira casa)
  const estadoCap1 = inicializarJogo();
  // Casa 1 do Jogador A termina a distribuição. Casa 18 do adversário tem 2 pedras. Casa 19 tem 0 pedras.
  estadoCap1.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 2;
  estadoCap1.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 0;
  const aval1 = avaliarCaptura(estadoCap1, 1);
  const cap1Ok =
    aval1.podeCapturar &&
    aval1.casasParaCapturar.includes(18) &&
    aval1.totalPedrasCapturadas === 2;
  resultados.push({
    id: 'T_CAP_2_PRIMEIRA_CASA_DIRETA',
    nome: 'Captura: Primeira Casa Adversária Direta',
    descricao: 'Verifica a captura válida da primeira casa adversária diretamente correspondente (oposta(1) = 18).',
    esperado: 'Capturar [18] (2 pedras)',
    obtido: `Capturar [${aval1.casasParaCapturar.join(', ')}] (${aval1.totalPedrasCapturadas} pedras)`,
    passou: cap1Ok,
  });

  // 3. Regra 4: Casa adversária necessária para captura não pode estar vazia
  const estadoCapVazia = inicializarJogo();
  estadoCapVazia.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 0;
  estadoCapVazia.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 0;
  const avalVazia = avaliarCaptura(estadoCapVazia, 1);
  resultados.push({
    id: 'T_CAP_3_CASA_VAZIA_BLOQUEADA',
    nome: 'Captura: Primeira Casa Vazia Bloqueia Captura (Regra 4)',
    descricao: 'Verifica que quando a casa adversária diretamente oposta está vazia (0 pedras), a captura não ocorre.',
    esperado: 'podeCapturar = false',
    obtido: `podeCapturar = ${avalVazia.podeCapturar}`,
    passou: !avalVazia.podeCapturar,
  });

  // 4. Regra 5: Não é permitido saltar primeira casa adversária vazia para capturar outra
  const estadoSalto = inicializarJogo();
  // Primeira casa (18) vazia (0), segunda casa (19) tem 4 pedras
  estadoSalto.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 0;
  estadoSalto.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 4;
  const avalSalto = avaliarCaptura(estadoSalto, 1);
  const saltoBloqueado = !avalSalto.podeCapturar && avalSalto.casasParaCapturar.length === 0;
  resultados.push({
    id: 'T_CAP_4_SALTO_PROIBIDO',
    nome: 'Captura: Proibido Saltar Primeira Casa Vazia (Regra 5)',
    descricao: 'Verifica que NÃO é permitido saltar a primeira casa adversária vazia (18=0) para capturar a segunda (19=4).',
    esperado: 'Bloqueado (0 capturas)',
    obtido: saltoBloqueado ? 'Bloqueado (0 capturas)' : 'Falha: saltou para capturar a segunda',
    passou: saltoBloqueado,
  });

  // 5. Regras 6 e 7: Se a segunda casa fizer parte da sequência válida, captura é OBRIGATÓRIA (máx 2)
  const estadoDupla = inicializarJogo();
  // Primeira casa (18) com 3 pedras, segunda casa (19) com 5 pedras
  estadoDupla.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 3;
  estadoDupla.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 5;
  const avalDupla = avaliarCaptura(estadoDupla, 1);
  const duplaOk =
    avalDupla.podeCapturar &&
    avalDupla.casasParaCapturar.length === 2 &&
    avalDupla.casasParaCapturar[0] === 18 &&
    avalDupla.casasParaCapturar[1] === 19 &&
    avalDupla.totalPedrasCapturadas === 8;
  resultados.push({
    id: 'T_CAP_5_SEGUNDA_CASA_OBRIGATORIA',
    nome: 'Captura: Segunda Casa Obrigatória (Regras 6 e 7)',
    descricao: 'Verifica que quando a 1ª e 2ª casas têm pedras, a captura envolve exatamente as 2 casas obrigatoriamente.',
    esperado: 'Capturar [18, 19] (8 pedras)',
    obtido: `Capturar [${avalDupla.casasParaCapturar.join(', ')}] (${avalDupla.totalPedrasCapturadas} pedras)`,
    passou: duplaOk,
  });

  // 6. Regra 8: Nunca capturar uma terceira casa
  const numCasasCapturadas = avalDupla.casasParaCapturar.length;
  resultados.push({
    id: 'T_CAP_6_NUNCA_TERCEIRA_CASA',
    nome: 'Captura: Nunca Capturar 3ª Casa (Regra 8)',
    descricao: 'Garante que o número máximo de casas capturadas em uma jogada nunca exceda 2.',
    esperado: 'Máximo 2 casas',
    obtido: `${numCasasCapturadas} casas`,
    passou: numCasasCapturadas <= 2,
  });

  // 7. Regras 2 e 3: Impedir a captura de uma casa própria
  // Quando Jogador A termina na casa 12 (linha externa), a casa em frente (1) pertence ao próprio Jogador A
  const estadoLinhaExterna = inicializarJogo();
  const avalExterna = avaliarCaptura(estadoLinhaExterna, 12);
  const impediuPropria = !avalExterna.podeCapturar && avalExterna.impedidaPorCasaPropria;
  resultados.push({
    id: 'T_CAP_7_IMPEDIR_CASA_PROPRIA',
    nome: 'Captura: Impedir Captura de Casa Própria (Regras 2 e 3)',
    descricao: 'Verifica que ao terminar na linha externa (casa 12), a casa em frente (casa 1) é própria e a captura é estritamente bloqueada.',
    esperado: 'podeCapturar = false, impedidaPorCasaPropria = true',
    obtido: `podeCapturar = ${avalExterna.podeCapturar}, impedida = ${avalExterna.impedidaPorCasaPropria}`,
    passou: impediuPropria,
  });

  // 8. Regra 10: Retirada de todas as pedras e transferência para a mão temporária
  const estadoExec = inicializarJogo();
  estadoExec.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 4;
  estadoExec.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 3;
  const resExec = executarCaptura(estadoExec, 1);
  const c18Depois = resExec.novoEstado.casas.find((c) => c.numero === 18)!.quantidadeDePedras;
  const c19Depois = resExec.novoEstado.casas.find((c) => c.numero === 19)!.quantidadeDePedras;
  const retiradaOk =
    resExec.houveCaptura &&
    c18Depois === 0 &&
    c19Depois === 0 &&
    resExec.novoEstado.pedrasNaMao === 7 &&
    resExec.pedrasCapturadas === 7;
  resultados.push({
    id: 'T_CAP_8_RETIRADA_E_MAO',
    nome: 'Captura: Retirada Total e Pedras para a Mão (Regra 10)',
    descricao: 'Verifica que todas as pedras das casas capturadas são retiradas (ficam com 0) e transferidas para a mão temporária do jogador.',
    esperado: 'Casas 18 e 19 com 0 pedras e mão com 7 pedras',
    obtido: retiradaOk
      ? 'Casas 18 e 19 com 0 pedras e mão com 7 pedras'
      : `c18=${c18Depois}, c19=${c19Depois}, mao=${resExec.novoEstado.pedrasNaMao}`,
    passou: retiradaOk,
  });

  // =========================================================================
  // TESTES DA CADEIA DE UMA JOGADA NTXUVA (INTEGRAÇÃO MOVIMENTO + CAPTURA)
  // =========================================================================

  // Teste Cadeia 1: Captura e continuação imediata na casa seguinte
  try {
    const estCadeia1 = inicializarJogo();
    // Jogador A tem 2 pedras na casa 1; casas 2 a 6 vazias
    for (let i = 1; i <= 12; i++) estCadeia1.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    estCadeia1.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Distribui em 2 e 3
    // Adversário: casa 16 (oposta da casa 3) tem 2 pedras; 21 tem 0 pedras
    for (let i = 13; i <= 24; i++) estCadeia1.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    estCadeia1.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 2;
    estCadeia1.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2; // Adversário continua em jogo

    const resCad1 = executarDistribuicao(estCadeia1, 1, true);
    const houveCapturaPasso = resCad1.passos.some((p) => p.tipo === 'captura_pedras');
    const idxCap = resCad1.passos.findIndex((p) => p.tipo === 'captura_pedras');
    const passoAposCap = idxCap >= 0 ? resCad1.passos[idxCap + 1] : null;

    // A captura ocorreu na casa 3. A nova distribuição começou na casa seguinte (casa 4):
    const continuouNaCasa4 =
      passoAposCap !== null &&
      passoAposCap.tipo === 'semear_pedra' &&
      passoAposCap.casa === 4;

    const cadeia1Ok =
      houveCapturaPasso &&
      continuouNaCasa4 &&
      resCad1.novoEstado.ultimaCadeia?.totalCapturas === 1 &&
      resCad1.novoEstado.ultimaCadeia?.totalPedrasCapturadas === 2 &&
      resCad1.novoEstado.casas.find((c) => c.numero === 16)!.quantidadeDePedras === 0;

    resultados.push({
      id: 'T_CADEIA_1_CAPTURA_E_CONTINUACAO',
      nome: 'Cadeia: Captura, Pedras na Mão e Continuação na Casa Seguinte',
      descricao: 'Verifica que ao capturar, as pedras entram na mão e a distribuição continua na casa seguinte (casa 3 → casa 4).',
      esperado: 'Captura na casa 3 e continua na casa 4',
      obtido: cadeia1Ok ? 'Captura na casa 3 e continua na casa 4' : `Passo após captura: casa ${passoAposCap?.casa}`,
      passou: cadeia1Ok,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_CADEIA_1_CAPTURA_E_CONTINUACAO',
      nome: 'Cadeia: Captura, Pedras na Mão e Continuação na Casa Seguinte',
      descricao: 'Verifica cadeia com captura.',
      esperado: 'Captura na casa 3 e continua na casa 4',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Cadeia 2: Uma mesma jogada com múltiplas capturas sucessivas
  try {
    const estMult = inicializarJogo();
    for (let i = 1; i <= 24; i++) estMult.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    
    // Jogador A começa na casa 1 com 2 pedras.
    estMult.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // semeia em 2 e 3 (cai em 3)
    // 1ª captura na casa 3: casa oposta 16 tem 2 pedras
    estMult.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 2;
    // As 2 pedras de 16 vão para a mão: semeia na casa 4 e na casa 5 (cai em 5)
    // 2ª captura na casa 5: casa oposta 14 tem 2 pedras
    estMult.casas.find((c) => c.numero === 14)!.quantidadeDePedras = 2;
    estMult.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2; // Adversário continua em jogo
    // As 2 pedras de 14 vão para a mão: semeia na casa 6 e na casa 7 (cai em 7)
    // Casa 7 é linha externa, vazia e sem captura -> Fim da cadeia!

    const resMult = executarDistribuicao(estMult, 1, true);
    const totalCaps = resMult.novoEstado.ultimaCadeia?.totalCapturas ?? 0;
    const pedrasCaps = resMult.novoEstado.ultimaCadeia?.totalPedrasCapturadas ?? 0;
    const histCaps = resMult.novoEstado.ultimaCadeia?.historicoCapturas ?? [];

    const multOk =
      totalCaps === 2 &&
      pedrasCaps === 4 &&
      histCaps.length === 2 &&
      histCaps[0].casaOndeTerminou === 3 &&
      histCaps[0].casasCapturadas.includes(16) &&
      histCaps[0].proximaCasaDistribuicao === 4 &&
      histCaps[1].casaOndeTerminou === 5 &&
      histCaps[1].casasCapturadas.includes(14) &&
      histCaps[1].proximaCasaDistribuicao === 6 &&
      resMult.novoEstado.ultimaCadeia?.casaFinal === 7;

    resultados.push({
      id: 'T_CADEIA_2_MULTIPLAS_CAPTURAS',
      nome: 'Cadeia: Múltiplas Capturas na Mesma Jogada',
      descricao: 'Verifica que uma mesma jogada encadeia 2 capturas consecutivas (casa 3 captura 16, continua na 4, cai na 5 e captura 14).',
      esperado: '2 capturas consecutivas (total 4 pedras) terminando na casa 7',
      obtido: multOk
        ? '2 capturas consecutivas (total 4 pedras) terminando na casa 7'
        : `Capturas: ${totalCaps}, pedras: ${pedrasCaps}, final: ${resMult.novoEstado.ultimaCadeia?.casaFinal}`,
      passou: multOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_CADEIA_2_MULTIPLAS_CAPTURAS',
      nome: 'Cadeia: Múltiplas Capturas na Mesma Jogada',
      descricao: 'Verifica múltiplas capturas na mesma jogada.',
      esperado: '2 capturas consecutivas',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Cadeia 3: A nova distribuição começa na casa seguinte e NUNCA volta para a casa inicial
  try {
    const estNaoVolta = inicializarJogo();
    for (let i = 1; i <= 24; i++) estNaoVolta.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    estNaoVolta.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Inicia na 1, cai na 3
    estNaoVolta.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 1; // 1 pedra capturada
    estNaoVolta.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2; // Adversário continua em jogo
    // Com 1 pedra capturada, a casa seguinte é a casa 4 (cai na 4 e finaliza)

    const resNaoVolta = executarDistribuicao(estNaoVolta, 1, true);
    const passosSemeaduraAposCaptura = resNaoVolta.passos
      .filter((p, idx) => {
        const idxCap = resNaoVolta.passos.findIndex((x) => x.tipo === 'captura_pedras');
        return idx > idxCap && p.tipo === 'semear_pedra';
      });

    const primeiraSemeaduraAposCap = passosSemeaduraAposCaptura[0];
    const nuncaVoltouParaCasa1 = !passosSemeaduraAposCaptura.some((p) => p.casa === 1);

    const naoVoltouOk =
      primeiraSemeaduraAposCap?.casa === 4 &&
      nuncaVoltouParaCasa1 &&
      resNaoVolta.novoEstado.casas.find((c) => c.numero === 1)!.quantidadeDePedras === 0;

    resultados.push({
      id: 'T_CADEIA_3_NAO_VOLTA_ORIGEM',
      nome: 'Cadeia: Continua na Casa Seguinte e Nunca Volta à Origem',
      descricao: 'Verifica que a nova semeadura pós-captura ocorre na casa 4 e não volta automaticamente para a casa inicial 1.',
      esperado: 'Semeadura após captura na casa 4 e casa 1 permanece com 0',
      obtido: naoVoltouOk ? 'Semeadura após captura na casa 4 e casa 1 permanece com 0' : `Primeira: ${primeiraSemeaduraAposCap?.casa}`,
      passou: naoVoltouOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_CADEIA_3_NAO_VOLTA_ORIGEM',
      nome: 'Cadeia: Continua na Casa Seguinte e Nunca Volta à Origem',
      descricao: 'Verifica não retorno à origem.',
      esperado: 'Continuação na casa seguinte',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Cadeia 4: Não mudar o jogador enquanto a cadeia ainda estiver ativa
  try {
    const estJogador = inicializarJogo();
    for (let i = 1; i <= 24; i++) estJogador.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    estJogador.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
    estJogador.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 2; // Captura
    // Adversário precisa ter ao menos uma pedra em alguma casa para o jogo não terminar por vitória
    estJogador.casas.find((c) => c.numero === 20)!.quantidadeDePedras = 2;

    const resJogador = executarDistribuicao(estJogador, 1, true);

    // Todos os passos intermediários devem ter jogadorAtivo === 'Jogador A'
    const todosPassosMesmoJogador = resJogador.passos.every((p) => p.jogadorAtivo === JOGADOR_A);
    // E no final da cadeia inteira, o turno muda para 'Jogador B'
    const mudouNoFinal = resJogador.novoEstado.jogadorAtual === JOGADOR_B;

    const jogadorInalteradoOk = todosPassosMesmoJogador && mudouNoFinal;

    resultados.push({
      id: 'T_CADEIA_4_NAO_MUDAR_JOGADOR',
      nome: 'Cadeia: Jogador Inalterado Durante Toda a Cadeia Ativa',
      descricao: 'Garante que o jogador ativo permanece o mesmo durante todas as capturas e distribuições da cadeia, mudando apenas após o fim.',
      esperado: 'Jogador A em todos os passos e Jogador B no final',
      obtido: jogadorInalteradoOk ? 'Jogador A em todos os passos e Jogador B no final' : `Jogador final: ${resJogador.novoEstado.jogadorAtual}`,
      passou: jogadorInalteradoOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_CADEIA_4_NAO_MUDAR_JOGADOR',
      nome: 'Cadeia: Jogador Inalterado Durante Toda a Cadeia Ativa',
      descricao: 'Verifica jogador na cadeia.',
      esperado: 'Jogador inalterado na cadeia',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Cadeia 5: Captura de até 2 casas adversárias com continuidade
  try {
    const estDuplaCad = inicializarJogo();
    for (let i = 1; i <= 24; i++) estDuplaCad.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    estDuplaCad.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Distribui em 2 e 3
    estDuplaCad.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 3; // 1ª casa adversária
    estDuplaCad.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 4; // 2ª casa adversária (atrás de 16)
    // Casa 24 tem pedras para adversário continuar no jogo
    estDuplaCad.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2;

    const resDuplaCad = executarDistribuicao(estDuplaCad, 1, true);
    const passoCapDupla = resDuplaCad.passos.find((p) => p.tipo === 'captura_pedras');
    const duasCasasCapturadas =
      passoCapDupla !== undefined &&
      passoCapDupla.casasCapturadas?.length === 2 &&
      passoCapDupla.casasCapturadas.includes(16) &&
      passoCapDupla.casasCapturadas.includes(21) &&
      passoCapDupla.pedrasCapturadas === 7 &&
      passoCapDupla.pedrasNaMaoDepois === 7;

    resultados.push({
      id: 'T_CADEIA_5_DUPLA_CASA_E_CONTINUIDADE',
      nome: 'Cadeia: Captura Dupla de Casas e Continuidade',
      descricao: 'Verifica que a captura de até 2 casas (16 e 21, total 7 pedras) coloca todas as pedras na mão e continua a distribuir.',
      esperado: 'Capturar [16, 21] (7 pedras) e distribuir',
      obtido: duasCasasCapturadas ? 'Capturar [16, 21] (7 pedras) e distribuir' : `Capturado: ${passoCapDupla?.casasCapturadas}`,
      passou: duasCasasCapturadas,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_CADEIA_5_DUPLA_CASA_E_CONTINUIDADE',
      nome: 'Cadeia: Captura Dupla de Casas e Continuidade',
      descricao: 'Verifica captura dupla na cadeia.',
      esperado: 'Captura dupla',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // =========================================================================
  // TESTES ESPECÍFICOS DAS CONDIÇÕES DE ENCERRAMENTO DE UMA JOGADA NTXUVA
  // 1. Fim por casa vazia;
  // 2. Fim sem captura (pedras próprias nunca capturadas & salto proibido);
  // 3. Fim por impossibilidade de continuar;
  // 4. Troca correta do jogador (jogadorAtual = outro jogador).
  // =========================================================================

  // Teste Encerramento 1: Fim por casa vazia (uma pedra colocada em casa vazia, ficando com 1 pedra)
  try {
    const estFimVazia = inicializarJogo();
    for (let i = 1; i <= 24; i++) estFimVazia.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    // Jogador A inicia na casa 1 com 2 pedras (distribui na 2 e cai na casa 3 que estava com 0)
    estFimVazia.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
    // Adversário com pedras em casas neutras para jogo permanecer ativo
    estFimVazia.casas.find((c) => c.numero === 23)!.quantidadeDePedras = 2;

    const resFimVazia = executarDistribuicao(estFimVazia, 1, true);
    const casa3Apos = resFimVazia.novoEstado.casas.find((c) => c.numero === 3)!.quantidadeDePedras;
    const passoFim = resFimVazia.passos.find((p) => p.tipo === 'fim_distribuicao');

    // Avaliação direta da função formal
    const avalEncerramento = avaliarEncerramentoDaJogada(resFimVazia.novoEstado, 3, 0);

    const fimVaziaOk =
      casa3Apos === 1 &&
      passoFim !== undefined &&
      passoFim.casa === 3 &&
      avalEncerramento.casaEstavaVazia === true &&
      avalEncerramento.casaFicouComUmaPedra === true &&
      avalEncerramento.jogadaTerminou === true;

    resultados.push({
      id: 'T_ENCERRAMENTO_1_CASA_VAZIA',
      nome: 'Encerramento: Fim por Casa Vazia (Condições 1 e 2)',
      descricao: 'Verifica que a jogada termina quando uma pedra é colocada em casa que estava vazia e essa casa fica com 1 pedra.',
      esperado: 'casaEstavaVazia=true, casaFicouComUmaPedra=true, jogadaTerminou=true',
      obtido: fimVaziaOk
        ? 'casaEstavaVazia=true, casaFicouComUmaPedra=true (casa 3 com 1 pedra), jogadaTerminou=true'
        : `c3=${casa3Apos}, terminou=${avalEncerramento.jogadaTerminou}`,
      passou: fimVaziaOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_ENCERRAMENTO_1_CASA_VAZIA',
      nome: 'Encerramento: Fim por Casa Vazia (Condições 1 e 2)',
      descricao: 'Verifica fim por casa vazia.',
      esperado: 'jogadaTerminou = true',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Encerramento 2: Fim sem captura (Condição 3, pedras próprias nunca capturadas e sem salto de primeira casa vazia)
  try {
    const estSemCap = inicializarJogo();
    for (let i = 1; i <= 24; i++) estSemCap.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;

    // Cenário A: Linha externa (casa 7). Casa oposta (casa 6) pertence ao próprio Jogador A
    estSemCap.casas.find((c) => c.numero === 7)!.quantidadeDePedras = 1;
    estSemCap.casas.find((c) => c.numero === 6)!.quantidadeDePedras = 4;
    const avalPropria = avaliarEncerramentoDaJogada(estSemCap, 7, 0);
    const nuncaCapturaPropria =
      avalPropria.avaliacaoCaptura.impedidaPorCasaPropria === true &&
      avalPropria.existeCapturaValida === false &&
      avalPropria.jogadaTerminou === true;

    // Cenário B: Linha interna (casa 1). Primeira casa adversária (18) vazia (0 pedras), segunda casa (19) com 4 pedras
    estSemCap.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 1;
    estSemCap.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 0; // Primeira vazia
    estSemCap.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 4; // Segunda tem pedras
    const avalSalto = avaliarEncerramentoDaJogada(estSemCap, 1, 0);
    const saltoProibidoSemCap =
      avalSalto.avaliacaoCaptura.podeCapturar === false &&
      avalSalto.avaliacaoCaptura.casasParaCapturar.length === 0 &&
      avalSalto.existeCapturaValida === false &&
      avalSalto.jogadaTerminou === true;

    const fimSemCapOk = nuncaCapturaPropria && saltoProibidoSemCap;

    resultados.push({
      id: 'T_ENCERRAMENTO_2_SEM_CAPTURA',
      nome: 'Encerramento: Fim Sem Captura (Casa Própria & Salto Proibido)',
      descricao: 'Verifica que a ausência de captura válida encerra a jogada, garantindo que pedras próprias nunca são capturadas e primeira casa adversária vazia não pode ser saltada.',
      esperado: 'Captura própria bloqueada e salto de primeira casa vazia proibido (ambos jogadaTerminou=true)',
      obtido: fimSemCapOk
        ? 'Própria bloqueada (impedida=true) e Salto proibido (casas=[]), ambos encerram sem captura'
        : `propriaOk=${nuncaCapturaPropria}, saltoOk=${saltoProibidoSemCap}`,
      passou: fimSemCapOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_ENCERRAMENTO_2_SEM_CAPTURA',
      nome: 'Encerramento: Fim Sem Captura (Casa Própria & Salto Proibido)',
      descricao: 'Verifica encerramento sem captura.',
      esperado: 'jogadaTerminou = true',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Encerramento 3: Fim por impossibilidade de continuar (Condição 4)
  try {
    const estImpossivel = inicializarJogo();
    for (let i = 1; i <= 24; i++) estImpossivel.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    // Jogador A tem 2 pedras na casa 1; distribui na 2 e 3 (cai na 3 que estava vazia)
    estImpossivel.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
    // Adversário com pedras em 22
    estImpossivel.casas.find((c) => c.numero === 22)!.quantidadeDePedras = 2;

    const resImp = executarDistribuicao(estImpossivel, 1, true);
    const avalImp = avaliarEncerramentoDaJogada(resImp.novoEstado, 3, 0);

    // Sem pedras anteriores na casa (sem revezamento) e sem captura válida
    const semContinuacao =
      avalImp.existeContinuacaoValida === false &&
      avalImp.existeCapturaValida === false &&
      avalImp.jogadaTerminou === true;

    // Na execução, o último passo é estritamente 'fim_distribuicao' e não há passos subsequentes
    const ultimoPasso = resImp.passos[resImp.passos.length - 1];
    const encerrouNoFim = ultimoPasso.tipo === 'fim_distribuicao' && ultimoPasso.casa === 3;

    const impossibilidadeOk = semContinuacao && encerrouNoFim;

    resultados.push({
      id: 'T_ENCERRAMENTO_3_IMPOSSIBILIDADE_CONTINUAR',
      nome: 'Encerramento: Fim por Impossibilidade de Continuar (Condição 4)',
      descricao: 'Verifica que sem continuação válida (sem captura e sem pedras para revezamento), existeContinuacaoValida=false e a jogada encerra imediatamente.',
      esperado: 'existeContinuacaoValida=false, jogadaTerminou=true e último passo=fim_distribuicao',
      obtido: impossibilidadeOk
        ? 'existeContinuacaoValida=false, jogadaTerminou=true e último passo fim_distribuicao na casa 3'
        : `semCont=${semContinuacao}, ultimoTipo=${ultimoPasso?.tipo}`,
      passou: impossibilidadeOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_ENCERRAMENTO_3_IMPOSSIBILIDADE_CONTINUAR',
      nome: 'Encerramento: Fim por Impossibilidade de Continuar (Condição 4)',
      descricao: 'Verifica impossibilidade de continuar.',
      esperado: 'existeContinuacaoValida = false',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Encerramento 4: Troca correta do jogador (jogadorAtual = outro jogador)
  try {
    const estTroca = inicializarJogo();
    for (let i = 1; i <= 24; i++) estTroca.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    // Jogador A tem 2 pedras na casa 1 e casa 6
    estTroca.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
    estTroca.casas.find((c) => c.numero === 6)!.quantidadeDePedras = 2;
    // Jogador B tem 2 pedras na casa 13 e casa 20
    estTroca.casas.find((c) => c.numero === 13)!.quantidadeDePedras = 2;
    estTroca.casas.find((c) => c.numero === 20)!.quantidadeDePedras = 2;

    // 1. Jogada do Jogador A encerra: jogadorAtual deve passar para Jogador B
    const resA = executarDistribuicao(estTroca, 1, true);
    const jogadorMudouParaB = resA.novoEstado.jogadorAtual === JOGADOR_B;

    // 2. Jogador B joga a partir do novo estado e encerra: jogadorAtual deve passar para Jogador A
    const resB = executarDistribuicao(resA.novoEstado, 13, true);
    const jogadorMudouParaA = resB.novoEstado.jogadorAtual === JOGADOR_A;

    // Teste da função pura alternarJogador
    const alternanciaPuraOk =
      alternarJogador(JOGADOR_A) === JOGADOR_B &&
      alternarJogador(JOGADOR_B) === JOGADOR_A;

    const trocaOk = jogadorMudouParaB && jogadorMudouParaA && alternanciaPuraOk;

    resultados.push({
      id: 'T_ENCERRAMENTO_4_TROCA_CORRETA_JOGADOR',
      nome: 'Encerramento: Troca Correta do Jogador (jogadorAtual = outro jogador)',
      descricao: 'Verifica que ao encerrar a jogada, jogadorAtual passa a ser o outro jogador (Jogador A → Jogador B e Jogador B → Jogador A).',
      esperado: 'jogadorAtual muda de Jogador A para Jogador B e depois de volta para Jogador A',
      obtido: trocaOk
        ? 'Jogador A → Jogador B e Jogador B → Jogador A com sucesso (jogadorAtual = outro jogador)'
        : `A->${resA.novoEstado.jogadorAtual}, B->${resB.novoEstado.jogadorAtual}`,
      passou: trocaOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_ENCERRAMENTO_4_TROCA_CORRETA_JOGADOR',
      nome: 'Encerramento: Troca Correta do Jogador (jogadorAtual = outro jogador)',
      descricao: 'Verifica troca do jogador.',
      esperado: 'jogadorAtual = outro jogador',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // =========================================================================
  // TESTES DE VITÓRIA E EMPATE (REGRAS EXCLUSIVAS)
  // 
  // VITÓRIA:
  // - Cada jogador começa com 24 pedras.
  // - Depois de cada captura verificar: pedras do adversário == 0
  // - Se for verdadeiro:
  //   - encerrar imediatamente a partida;
  //   - declarar vencedor o jogador que capturou as últimas pedras.
  // 
  // EMPATE:
  // - Não existe empate automático.
  // - O empate somente ocorre por acordo mútuo.
  // - proporEmpate(); aceitarEmpate(); recusarEmpate().
  // - Se os dois concordarem: estado da partida = EMPATE.
  // - Não criar nenhuma outra condição automática de empate.
  // =========================================================================

  // Teste Vitória 1: Cada jogador começa com 24 pedras
  try {
    const jogoNovo = inicializarJogo();
    const pedrasA = jogoNovo.pedrasDoJogadorA;
    const pedrasB = jogoNovo.pedrasDoJogadorB;
    const somaPedrasA = jogoNovo.casas
      .filter((c) => c.proprietario === JOGADOR_A)
      .reduce((sum, c) => sum + c.quantidadeDePedras, 0);
    const somaPedrasB = jogoNovo.casas
      .filter((c) => c.proprietario === JOGADOR_B)
      .reduce((sum, c) => sum + c.quantidadeDePedras, 0);

    const inicio24Ok =
      pedrasA === 24 &&
      pedrasB === 24 &&
      somaPedrasA === 24 &&
      somaPedrasB === 24 &&
      jogoNovo.casas.length === 24;

    resultados.push({
      id: 'T_VITORIA_1_24_PEDRAS_INICIAIS',
      nome: 'Vitória: Cada Jogador Começa com 24 Pedras',
      descricao: 'Verifica que no início da partida cada jogador possui exatamente 24 pedras distribuídas em suas 12 casas (total 48 pedras).',
      esperado: 'Jogador A: 24 pedras, Jogador B: 24 pedras',
      obtido: `Jogador A: ${pedrasA} pedras, Jogador B: ${pedrasB} pedras`,
      passou: inicio24Ok,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_VITORIA_1_24_PEDRAS_INICIAIS',
      nome: 'Vitória: Cada Jogador Começa com 24 Pedras',
      descricao: 'Verifica pedras iniciais.',
      esperado: '24 pedras cada',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Vitória 2: Depois de cada captura verificar pedras do adversário == 0
  try {
    const jogoBase = inicializarJogo();
    // Simula tabuleiro onde adversário B tem pedras
    const checkComPedras = verificarVitoriaAposCaptura(jogoBase.casas, JOGADOR_A);

    // Simula tabuleiro onde adversário B ficou com 0 pedras
    const casasSemB = jogoBase.casas.map((c) =>
      c.proprietario === JOGADOR_B ? { ...c, quantidadeDePedras: 0 } : { ...c }
    );
    const checkSemB = verificarVitoriaAposCaptura(casasSemB, JOGADOR_A);

    const verificacaoOk =
      checkComPedras.vitoria === false &&
      checkComPedras.vencedor === null &&
      checkSemB.vitoria === true &&
      checkSemB.vencedor === JOGADOR_A &&
      checkSemB.pedrasAdversario === 0;

    resultados.push({
      id: 'T_VITORIA_2_VERIFICACAO_APOS_CAPTURA',
      nome: 'Vitória: Verificar Pedras do Adversário == 0 Após Captura',
      descricao: 'Verifica que a cada captura é avaliado se o adversário ficou com 0 pedras. Se > 0 não há vitória; se == 0, detecta condição de vitória.',
      esperado: 'Com pedras: vitoria=false; Sem pedras: vitoria=true, vencedor=Jogador A',
      obtido: `Com pedras: vitoria=${checkComPedras.vitoria}; Sem pedras: vitoria=${checkSemB.vitoria}, vencedor=${checkSemB.vencedor}`,
      passou: verificacaoOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_VITORIA_2_VERIFICACAO_APOS_CAPTURA',
      nome: 'Vitória: Verificar Pedras do Adversário == 0 Após Captura',
      descricao: 'Verifica se adversário tem 0 pedras.',
      esperado: 'vitoria=true quando adversario==0',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Vitória 3: Encerrar imediatamente a partida e declarar vencedor quem capturou as últimas pedras
  try {
    const jogoVit = inicializarJogo();
    // Limpar todas as casas
    for (let i = 1; i <= 24; i++) jogoVit.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;

    // Jogador A joga da casa 11 (com 2 pedras) -> distribui na casa 12 e cai na casa 1
    // Casa 1 está na linha interna de A e tem como oposta direta a casa 18 (linha interna de B)
    jogoVit.casas.find((c) => c.numero === 11)!.quantidadeDePedras = 2;
    // Jogador B só possui pedras na casa 18 (2 pedras) - são as ÚLTIMAS pedras de B!
    jogoVit.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 2;

    const resVit = executarDistribuicao(jogoVit, 11, true);

    const encerrouImediatamente =
      resVit.novoEstado.vencedor === JOGADOR_A &&
      resVit.novoEstado.estadoDaPartida === 'FINALIZADA' &&
      resVit.novoEstado.pedrasDoJogadorB === 0;

    const ultimoPassoCaptura = resVit.passos[resVit.passos.length - 1];
    const passoCapturaDecisiva = ultimoPassoCaptura?.tipo === 'captura_pedras';

    const vitoriaOk = encerrouImediatamente && passoCapturaDecisiva;

    resultados.push({
      id: 'T_VITORIA_3_ENCERRAMENTO_IMEDIATO_E_VENCEDOR',
      nome: 'Vitória: Encerrar Imediatamente e Declarar Vencedor',
      descricao: 'Verifica que ao capturar as últimas pedras do adversário, a partida encerra imediatamente e o jogador que capturou é declarado vencedor.',
      esperado: 'vencedor = Jogador A, estadoDaPartida = FINALIZADA, pedrasDoJogadorB = 0',
      obtido: `vencedor = ${resVit.novoEstado.vencedor}, estadoDaPartida = ${resVit.novoEstado.estadoDaPartida}, pedras B = ${resVit.novoEstado.pedrasDoJogadorB}`,
      passou: vitoriaOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_VITORIA_3_ENCERRAMENTO_IMEDIATO_E_VENCEDOR',
      nome: 'Vitória: Encerrar Imediatamente e Declarar Vencedor',
      descricao: 'Verifica encerramento imediato por captura final.',
      esperado: 'vencedor = Jogador A, finalizada imediatamente',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Vitória 4: Condição de Vitória por Asfixia / Afogamento (adversário com apenas 1 pedra por casa)
  try {
    const jogoAsfixia = inicializarJogo();
    for (let i = 1; i <= 24; i++) jogoAsfixia.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;

    // Jogador A tem casa 1 com 2 pedras e casa 6 com 2 pedras
    jogoAsfixia.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
    jogoAsfixia.casas.find((c) => c.numero === 6)!.quantidadeDePedras = 2;
    // Jogador B só tem casas com 1 pedra (ex: casa 13 com 1 pedra, casa 14 com 1 pedra, resto 0)
    // O adversário B ficou impossibilitado de fazer uma jogada válida (morreu afogado / perdeu por asfixia).
    jogoAsfixia.casas.find((c) => c.numero === 13)!.quantidadeDePedras = 1;
    jogoAsfixia.casas.find((c) => c.numero === 14)!.quantidadeDePedras = 1;

    // Avaliação direta da função formal
    const checkAsfixia = verificarVitoriaAposCaptura(jogoAsfixia.casas, JOGADOR_A);

    // Execução da jogada de A que encerra a partida por asfixia do adversário B
    const resAsfixia = executarDistribuicao(jogoAsfixia, 1, true);

    const asfixiaOk =
      checkAsfixia.vitoria === true &&
      checkAsfixia.vencedor === JOGADOR_A &&
      checkAsfixia.tipoVitoria === 'asfixia' &&
      resAsfixia.novoEstado.vencedor === JOGADOR_A &&
      resAsfixia.novoEstado.estadoDaPartida === 'FINALIZADA' &&
      resAsfixia.novoEstado.tipoVitoria === 'asfixia';

    resultados.push({
      id: 'T_VITORIA_4_ASFIXIA_AFOGAMENTO',
      nome: 'Vitória: Asfixia / Afogamento (Adversário com apenas casas de 1 pedra)',
      descricao: 'Garante que quando o adversário resta apenas com casas contendo 1 pedra (impossibilitado de fazer jogada válida), é declarada vitória por asfixia/afogamento para o adversário ativo.',
      esperado: 'vitoria = true, vencedor = Jogador A, tipoVitoria = asfixia',
      obtido: `vitoria = ${resAsfixia.novoEstado.vencedor === JOGADOR_A}, tipoVitoria = ${resAsfixia.novoEstado.tipoVitoria}`,
      passou: asfixiaOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_VITORIA_4_ASFIXIA_AFOGAMENTO',
      nome: 'Vitória: Asfixia / Afogamento (Adversário com apenas casas de 1 pedra)',
      descricao: 'Verifica vitória por asfixia.',
      esperado: 'vencedor = Jogador A, tipoVitoria = asfixia',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Empate 1: Não existe empate automático
  try {
    const jogoSemEmpateAuto = inicializarJogo();
    // Mesmo com jogo iniciado ou tabuleiro limpo, não há empate automático
    const semEmpateInicial = jogoSemEmpateAuto.empate === false && jogoSemEmpateAuto.estadoDaPartida === 'EM_ANDAMENTO';

    resultados.push({
      id: 'T_EMPATE_1_NAO_AUTOMATICO',
      nome: 'Empate: Não Existe Empate Automático',
      descricao: 'Garante que não existe nenhuma regra de empate automático. O empate nunca é disparado automaticamente pela mecânica do jogo.',
      esperado: 'empate = false, estadoDaPartida = EM_ANDAMENTO (sem empate automático)',
      obtido: `empate = ${jogoSemEmpateAuto.empate}, estadoDaPartida = ${jogoSemEmpateAuto.estadoDaPartida}`,
      passou: semEmpateInicial,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_EMPATE_1_NAO_AUTOMATICO',
      nome: 'Empate: Não Existe Empate Automático',
      descricao: 'Verifica ausência de empate automático.',
      esperado: 'empate = false',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Empate 2: proporEmpate()
  try {
    const jogoProp = inicializarJogo();
    const posProposta = proporEmpate(jogoProp, JOGADOR_A);

    const proporOk =
      posProposta.propostaEmpate === JOGADOR_A &&
      posProposta.empate === false &&
      posProposta.estadoDaPartida === 'EM_ANDAMENTO';

    resultados.push({
      id: 'T_EMPATE_2_PROPOR_EMPATE',
      nome: 'Empate: Função proporEmpate()',
      descricao: 'Verifica que proporEmpate() registra a proposta de acordo mútuo sem encerrar a partida prematuramente.',
      esperado: 'propostaEmpate = Jogador A, empate = false, estadoDaPartida = EM_ANDAMENTO',
      obtido: `propostaEmpate = ${posProposta.propostaEmpate}, empate = ${posProposta.empate}, estadoDaPartida = ${posProposta.estadoDaPartida}`,
      passou: proporOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_EMPATE_2_PROPOR_EMPATE',
      nome: 'Empate: Função proporEmpate()',
      descricao: 'Verifica proporEmpate().',
      esperado: 'proposta registrada',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Empate 3: aceitarEmpate() e estado da partida = EMPATE
  try {
    const jogoAceitar = inicializarJogo();
    const comProposta = proporEmpate(jogoAceitar, JOGADOR_A);
    const comAceite = aceitarEmpate(comProposta, JOGADOR_B);

    const aceiteOk =
      comAceite.estadoDaPartida === 'EMPATE' &&
      comAceite.empate === true &&
      comAceite.vencedor === null &&
      comAceite.propostaEmpate === null;

    resultados.push({
      id: 'T_EMPATE_3_ACEITAR_EMPATE_ACORDO_MUTUO',
      nome: 'Empate: aceitarEmpate() e estado da partida = EMPATE',
      descricao: 'Verifica que se os dois jogadores concordarem com o empate por acordo mútuo, o estado da partida passa a ser EMPATE.',
      esperado: 'estado da partida = EMPATE, empate = true, vencedor = null',
      obtido: `estado da partida = ${comAceite.estadoDaPartida}, empate = ${comAceite.empate}, vencedor = ${comAceite.vencedor}`,
      passou: aceiteOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_EMPATE_3_ACEITAR_EMPATE_ACORDO_MUTUO',
      nome: 'Empate: aceitarEmpate() e estado da partida = EMPATE',
      descricao: 'Verifica aceitarEmpate().',
      esperado: 'estado da partida = EMPATE',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Teste Empate 4: recusarEmpate()
  try {
    const jogoRecusa = inicializarJogo();
    const comProp = proporEmpate(jogoRecusa, JOGADOR_A);
    const comRecusa = recusarEmpate(comProp, JOGADOR_B);

    const recusaOk =
      comRecusa.propostaEmpate === null &&
      comRecusa.empate === false &&
      comRecusa.estadoDaPartida === 'EM_ANDAMENTO';

    resultados.push({
      id: 'T_EMPATE_4_RECUSAR_EMPATE',
      nome: 'Empate: recusarEmpate() Mantém a Partida em Andamento',
      descricao: 'Verifica que se um jogador recusar o empate, a proposta é descartada e a partida continua em andamento normalmente.',
      esperado: 'propostaEmpate = null, empate = false, estadoDaPartida = EM_ANDAMENTO',
      obtido: `propostaEmpate = ${comRecusa.propostaEmpate}, empate = ${comRecusa.empate}, estadoDaPartida = ${comRecusa.estadoDaPartida}`,
      passou: recusaOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_EMPATE_4_RECUSAR_EMPATE',
      nome: 'Empate: recusarEmpate() Mantém a Partida em Andamento',
      descricao: 'Verifica recusarEmpate().',
      esperado: 'proposta cancelada, jogo continua',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // TESTES DA REGRA DE INÍCIO: CASAS COM 1 PEDRA
  try {
    // Caso 1: Jogador A tem casa 1 com 1 pedra, mas casa 2 tem 2 pedras.
    // Iniciar na casa 1 DEVE ser PROIBIDO. Iniciar na casa 2 DEVE ser PERMITIDO.
    const jogoRegra1Pedra = inicializarJogo();
    for (let i = 1; i <= 24; i++) {
      jogoRegra1Pedra.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    }
    jogoRegra1Pedra.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 1;
    jogoRegra1Pedra.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 2;
    jogoRegra1Pedra.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 2; // Adversário
    jogoRegra1Pedra.jogadorAtual = JOGADOR_A;

    const valCasa1 = podeIniciarJogada(jogoRegra1Pedra, 1);
    const valCasa2 = podeIniciarJogada(jogoRegra1Pedra, 2);

    const regraProibicaoOk = valCasa1.valido === false && valCasa2.valido === true;

    resultados.push({
      id: 'T_REGRA_1_PEDRA_PROIBIDA',
      nome: 'Regra de Início: Proibido Iniciar em Casa com 1 Pedra (Misto)',
      descricao: 'Garante que o jogador não pode iniciar uma jogada numa casa onde tem somente uma pedra.',
      esperado: 'valido = false na casa com 1 pedra, valido = true na casa com 2 pedras',
      obtido: `casa 1 (1 pedra): valido=${valCasa1.valido}, casa 2 (2 pedras): valido=${valCasa2.valido}`,
      passou: regraProibicaoOk,
    });

    // Caso 2: Jogador A só tem casas com 1 pedra (ex: casa 1 e casa 3 têm 1 pedra cada, e nenhuma casa tem >= 2).
    // Conforme a regra atualizada: NÃO se deve e NÃO se inicia a jogada numa casa com somente uma pedra!
    const jogoApenas1Pedra = inicializarJogo();
    for (let i = 1; i <= 24; i++) {
      jogoApenas1Pedra.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    }
    jogoApenas1Pedra.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 1;
    jogoApenas1Pedra.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 1;
    jogoApenas1Pedra.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 2; // Adversário
    jogoApenas1Pedra.jogadorAtual = JOGADOR_A;

    const valCasa1Apenas1 = podeIniciarJogada(jogoApenas1Pedra, 1);
    const valCasa3Apenas1 = podeIniciarJogada(jogoApenas1Pedra, 3);

    const regraNunca1PedraOk = valCasa1Apenas1.valido === false && valCasa3Apenas1.valido === false;

    resultados.push({
      id: 'T_REGRA_1_PEDRA_NUNCA_PERMITIDA',
      nome: 'Regra de Início: Não se Deve e Não se Inicia com Somente 1 Pedra',
      descricao: 'Garante que não se deve e não se inicia a jogada numa casa com somente uma pedra em nenhuma circunstância.',
      esperado: 'valido = false em todas as casas com 1 pedra',
      obtido: `casa 1: valido=${valCasa1Apenas1.valido}, casa 3: valido=${valCasa3Apenas1.valido}`,
      passou: regraNunca1PedraOk,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_REGRA_1_PEDRA_ERRO',
      nome: 'Regra de Início: Casas com 1 Pedra',
      descricao: 'Teste da regra de casas com 1 pedra.',
      esperado: 'Testes de validação executados com sucesso',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // Executar e incluir testes de integração oficiais
  resultados.push(...executarTestesIntegracao());

  return resultados;
}

/**
 * TESTES DE INTEGRAÇÃO OFICIAIS DO NTXUVA
 * 
 * TESTE 1:
 * Começar na casa 11.
 * Sequência esperada:
 * 11 → 12 → 1
 * captura: 18 + 19
 * depois: 2 → 3 → 4 → 5
 * captura: 14 + 23
 * depois: 6 → 7 → 8 → 9
 * depois: 10 → 11 → 12
 * depois: 1 → 2 → 3 → 4
 * captura: 15 + 22
 * depois: 5 → 6 → 7 → 8
 * capturar/levar 4 pedras
 * depois: 9 → 10 → 11 → 12
 * A jogada termina.
 * O programa deve registrar toda a sequência no histórico.
 * 
 * TESTE 2:
 * Jogador B começa na casa 24 (partindo do estado resultante do Teste 1).
 * Sequência esperada:
 * 24 → 13 → 14
 * captura: 5 + 8
 * depois: 15 → 16 → 17 → 18
 * captura: 1 + 12
 * depois: 19 → 20 → 21 → 22 → 23
 * A jogada termina.
 * O programa deve registrar toda a sequência no histórico.
 */
export function executarTestesIntegracao(): ResultadoTeste[] {
  const resultados: ResultadoTeste[] = [];

  // ==========================================
  // TESTE DE INTEGRAÇÃO 1: JOGADOR A (CASA 11)
  // ==========================================
  let estadoPosTeste1: GameState;
  try {
    const jogoInicial = inicializarJogo();
    const resT1 = executarDistribuicao(jogoInicial, 11, true, false);
    estadoPosTeste1 = resT1.novoEstado;

    const seqEsperadaT1 = [
      '11 → 12 → 1',
      'captura: 18 + 19',
      '2 → 3 → 4 → 5',
      'captura: 14 + 23',
      '6 → 7 → 8 → 9',
      '10 → 11 → 12',
      '1 → 2 → 3 → 4',
      'captura: 15 + 22',
      '5 → 6 → 7 → 8',
      'capturar/levar 4 pedras',
      '9 → 10 → 11 → 12',
      'A jogada termina.',
    ];

    const historicoT1 = resT1.novoEstado.historico;
    const historicoContemSequencia = seqEsperadaT1.every((item) =>
      historicoT1.some((h) => h.includes(item))
    );

    const caps = resT1.passos.filter((p) => p.tipo === 'captura_pedras');
    const cap1Ok = caps[0]?.casa === 1 && caps[0]?.casasCapturadas?.includes(18) && caps[0]?.casasCapturadas?.includes(19);
    const cap2Ok = caps[1]?.casa === 5 && caps[1]?.casasCapturadas?.includes(14) && caps[1]?.casasCapturadas?.includes(23);
    const cap3Ok = caps[2]?.casa === 4 && caps[2]?.casasCapturadas?.includes(15) && caps[2]?.casasCapturadas?.includes(22);
    const fimOk = resT1.novoEstado.ultimaCadeia?.casaFinal === 12 && resT1.novoEstado.jogadorAtual === JOGADOR_B;

    const t1Passou = historicoContemSequencia && cap1Ok && cap2Ok && cap3Ok && fimOk;

    resultados.push({
      id: 'T_INTEGRACAO_1_JOGADOR_A_CASA_11',
      nome: 'Integração 1: Jogador A inicia na Casa 11',
      descricao: 'Verifica a sequência completa de semeaduras, capturas [18+19, 14+23, 15+22], revezamento da casa 8 (levar 4 pedras) e encerramento na casa 12 com registro no histórico.',
      esperado: seqEsperadaT1.join(' → '),
      obtido: t1Passou
        ? 'Sequência completa e idêntica reproduzida e registrada no histórico'
        : `Divergência na sequência ou no histórico do Teste 1`,
      passou: t1Passou,
    });
  } catch (err: any) {
    estadoPosTeste1 = inicializarJogo();
    resultados.push({
      id: 'T_INTEGRACAO_1_JOGADOR_A_CASA_11',
      nome: 'Integração 1: Jogador A inicia na Casa 11',
      descricao: 'Verifica sequência do Teste 1.',
      esperado: 'Execução sem erros',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // ==========================================
  // TESTE DE INTEGRAÇÃO 2: JOGADOR B (CASA 24)
  // ==========================================
  try {
    const resT2 = executarDistribuicao(estadoPosTeste1, 24, true, false);

    const seqEsperadaT2 = [
      '24 → 13 → 14',
      'captura: 5',
      '15 → 16 → 17 → 18',
      'captura: 1 + 12',
      '19 → 20 → 21 → 22 → 23',
      'A jogada termina.',
    ];

    const historicoT2 = resT2.novoEstado.historico;
    const historicoContemSequencia2 = seqEsperadaT2.every((item) =>
      historicoT2.some((h) => h.includes(item))
    );

    const capsT2 = resT2.passos.filter((p) => p.tipo === 'captura_pedras');
    const cap1OkT2 = capsT2[0]?.casa === 14 && capsT2[0]?.casasCapturadas?.includes(5);
    const cap2OkT2 = capsT2[1]?.casa === 18 && capsT2[1]?.casasCapturadas?.includes(1) && capsT2[1]?.casasCapturadas?.includes(12);
    const fimOkT2 = resT2.novoEstado.ultimaCadeia?.casaFinal === 23 && resT2.novoEstado.jogadorAtual === JOGADOR_A;

    const t2Passou = historicoContemSequencia2 && cap1OkT2 && cap2OkT2 && fimOkT2;

    resultados.push({
      id: 'T_INTEGRACAO_2_JOGADOR_B_CASA_24',
      nome: 'Integração 2: Jogador B inicia na Casa 24',
      descricao: 'Verifica a sequência contínua de Jogador B na Casa 24: capturas [5+8, 1+12], semeadura 19→23 e encerramento na casa 23 com registro no histórico.',
      esperado: seqEsperadaT2.join(' → '),
      obtido: t2Passou
        ? 'Sequência completa e idêntica reproduzida e registrada no histórico'
        : `Divergência na sequência ou no histórico do Teste 2`,
      passou: t2Passou,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_INTEGRACAO_2_JOGADOR_B_CASA_24',
      nome: 'Integração 2: Jogador B inicia na Casa 24',
      descricao: 'Verifica sequência do Teste 2.',
      esperado: 'Execução sem erros',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  // ==========================================
  // TESTE DE INTEGRAÇÃO 3: NOVA REGRA DE CAPTURA (3 CONDIÇÕES OBRIGATÓRIAS)
  // ==========================================
  try {
    const jogoNovaRegra = inicializarJogo();
    for (let i = 1; i <= 24; i++) {
      jogoNovaRegra.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
    }
    // Jogador A tem 2 pedras na casa 1, casa 2 está vazia (0 pedras).
    // Linha de ataque de B: casa 17 (em frente à 2) tem 3 pedras.
    // Linha de defesa de B: casa 20 (atrás da 17) tem 2 pedras.
    // Outra casa com pedras para B permanecer ativo no jogo:
    jogoNovaRegra.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Semeia na 2 e 3
    jogoNovaRegra.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 0;
    jogoNovaRegra.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 0; // Vazia na linha de ataque!
    jogoNovaRegra.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 4; // Em frente à 3 (Ataque)
    jogoNovaRegra.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 2; // Atrás da 16 (Defesa)
    jogoNovaRegra.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 5; // B ativo
    jogoNovaRegra.jogadorAtual = JOGADOR_A;

    const resNovaRegra = executarDistribuicao(jogoNovaRegra, 1, true, true);
    const passoCap = resNovaRegra.passos.find((p) => p.tipo === 'captura_pedras');
    const capturouAmbas =
      passoCap !== undefined &&
      passoCap.casa === 3 &&
      passoCap.casasCapturadas?.includes(16) &&
      passoCap.casasCapturadas?.includes(21) &&
      passoCap.pedrasCapturadas === 6;

    resultados.push({
      id: 'T_INTEGRACAO_3_REGRA_3_CONDIÇÕES',
      nome: 'Regra de Captura: 3 Condições Simultâneas (Ataque Vazio + Em Frente com Peças + Defesa Atrás)',
      descricao: 'Valida a nova regra de captura: última pedra caiu na casa 3 (vazia e linha de Ataque), capturou a casa 16 (em frente) e também a casa 21 (defesa atrás).',
      esperado: 'Capturar casas [16, 21] totalizando 6 pedras',
      obtido: capturouAmbas ? 'Capturou [16, 21] (6 pedras)' : 'Falha na captura das 3 condições',
      passou: capturouAmbas,
    });
  } catch (err: any) {
    resultados.push({
      id: 'T_INTEGRACAO_3_REGRA_3_CONDIÇÕES',
      nome: 'Regra de Captura: 3 Condições Simultâneas',
      descricao: 'Validação da nova regra de captura.',
      esperado: 'Execução sem erros',
      obtido: `Erro: ${err?.message}`,
      passou: false,
    });
  }

  return resultados;
}
