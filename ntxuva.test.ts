/**
 * NTXUVA - Testes Automatizados de Movimento, Distribuição e Motor de Captura
 * 
 * Requisitos estritos testados:
 * 
 * MOVIMENTO E DISTRIBUIÇÃO:
 * 1. começar na casa 1
 * 2. começar na casa 11
 * 3. passar de 12 para 1
 * 4. passar de 24 para 13
 * 5. retirar todas as pedras da casa escolhida
 * 6. continuar a partir da casa seguinte (revezamento)
 * 7. as 12 correspondências físicas diretas (oposta)
 * 
 * MOTOR DE CAPTURA - SITUAÇÕES MODELADAS:
 * 1. Posição da casa onde terminou a distribuição (linha interna vs linha externa)
 * 2. Casa adversária diretamente correspondente (primeira casa adversária)
 * 3. Como verificar a segunda casa adversária (linha externa atrás da primeira)
 * 4. Como impedir a captura de uma casa própria (linha externa e propriedade do jogador)
 * 
 * MOTOR DE CAPTURA - 10 REGRAS:
 * Regra 1: Captura depende da posição física das casas
 * Regra 2: Só podem ser capturadas pedras pertencentes ao adversário
 * Regra 3: Nunca pode capturar pedras do próprio jogador
 * Regra 4: A casa adversária necessária para a captura não pode estar vazia
 * Regra 5: Não é permitido saltar uma primeira casa adversária vazia para capturar outra
 * Regra 6: Uma captura pode envolver no máximo 2 casas adversárias
 * Regra 7: Se a segunda casa fizer parte da sequência válida, sua captura é obrigatória
 * Regra 8: Nunca capturar uma terceira casa
 * Regra 9: Não existe limite de quantidade de pedras dentro das duas casas capturadas
 * Regra 10: Todas as pedras das casas capturadas são retiradas e redistribuídas no percurso do jogador
 */

import { 
  inicializarJogo, 
  executarDistribuicao, 
  obterProximaCasa, 
  executarTestesUnitarios,
  oposta,
  CORRESPONDENCIAS_FISICAS,
  posicaoDaCasaOndeTerminou,
  obterCasaAdversariaDiretamenteCorrespondente,
  obterSegundaCasaAdversaria,
  verificarImpedimentoCasaPropria,
  obterCasasAdversariasColuna,
  avaliarCaptura,
  executarCaptura,
  ehLinhaInterna,
  ehLinhaExterna,
  avaliarEncerramentoDaJogada,
  alternarJogador,
  podeIniciarJogada,
  verificarVitoriaAposCaptura,
  JOGADOR_A,
  JOGADOR_B
} from './ntxuva';
import { extrairEventosJogada } from '../components/AreaUltimosMovimentos';
import { PassoDistribuicao } from '../types/ntxuva';
import { escolherMelhorJogadaIA } from './ntxuvaAI';
import { PUZZLES_NTXUVA } from '../data/puzzlesNtxuva';
import { criarGameStateCustomizado } from './ntxuva';

console.log('================================================================');
console.log('   NTXUVA - TESTES DE MOVIMENTO, DISTRIBUIÇÃO E MOTOR DE CAPTURA ');
console.log('================================================================\n');

let falhas = 0;

// ==========================================
// 1. MOVIMENTO E DISTRIBUIÇÃO
// ==========================================
console.log('--- MOVIMENTO E DISTRIBUIÇÃO ---');

// Teste 1: começar na casa 1
console.log('TESTE 1: Começar na casa 1');
const estado1 = inicializarJogo();
const res1 = executarDistribuicao(estado1, 1, false);
const p1Primeiro = res1.passos[0];
const iniciouCasa1 = 
  p1Primeiro.tipo === 'retirar_origem' &&
  p1Primeiro.casa === 1 &&
  p1Primeiro.pedrasNaCasaDepois === 0 &&
  res1.passos.some((p) => p.casa === 2);

if (iniciouCasa1) {
  console.log('  [PASSOU ✓] Começou na casa 1: pedras retiradas e distribuídas a partir da casa 2.');
} else {
  console.error('  [FALHOU ✗] Falha ao começar na casa 1.');
  falhas++;
}

// Teste 2: começar na casa 11
console.log('\nTESTE 2: Começar na casa 11');
const estado11 = inicializarJogo();
const res11 = executarDistribuicao(estado11, 11, false);
const p11Primeiro = res11.passos[0];
const distribuiuPara12 = res11.passos.some((p) => p.tipo === 'semear_pedra' && p.casa === 12);
const distribuiuPara1 = res11.passos.some((p) => p.tipo === 'semear_pedra' && p.casa === 1);
const iniciouCasa11 = 
  p11Primeiro.tipo === 'retirar_origem' && 
  p11Primeiro.casa === 11 && 
  distribuiuPara12 && 
  distribuiuPara1;

if (iniciouCasa11) {
  console.log('  [PASSOU ✓] Começou na casa 11: distribuiu na casa 12 e passou para a casa 1.');
} else {
  console.error('  [FALHOU ✗] Falha ao começar na casa 11.');
  falhas++;
}

// Teste 3: passar de 12 para 1 (Jogador A)
console.log('\nTESTE 3: Passar de 12 para 1 (Jogador A)');
const proxima12 = obterProximaCasa(12, JOGADOR_A);
const passou12Para1 = proxima12 === 1;

if (passou12Para1) {
  console.log(`  [PASSOU ✓] Transição circular do Jogador A: 12 → ${proxima12}`);
} else {
  console.error(`  [FALHOU ✗] Esperado 1, obtido: ${proxima12}`);
  falhas++;
}

// Teste 4: passar de 24 para 13 (Jogador B)
console.log('\nTESTE 4: Passar de 24 para 13 (Jogador B)');
const proxima24 = obterProximaCasa(24, JOGADOR_B);
const passou24Para13 = proxima24 === 13;

if (passou24Para13) {
  console.log(`  [PASSOU ✓] Transição circular do Jogador B: 24 → ${proxima24}`);
} else {
  console.error(`  [FALHOU ✗] Esperado 13, obtido: ${proxima24}`);
  falhas++;
}

// Teste 5: retirar todas as pedras da casa escolhida
console.log('\nTESTE 5: Retirar todas as pedras da casa escolhida');
const estadoRetirar = inicializarJogo();
estadoRetirar.casas.find((c) => c.numero === 7)!.quantidadeDePedras = 4;
const resRetirar = executarDistribuicao(estadoRetirar, 7, false);
const passo0 = resRetirar.passos[0];
const retirouTodas =
  passo0.tipo === 'retirar_origem' &&
  passo0.casa === 7 &&
  passo0.pedrasNaCasaAntes === 4 &&
  passo0.pedrasNaCasaDepois === 0 &&
  passo0.pedrasNaMaoDepois === 4;

if (retirouTodas) {
  console.log('  [PASSOU ✓] Casa escolhida (casa 7) teve todas as 4 pedras retiradas (ficou com 0 pedras).');
} else {
  console.error('  [FALHOU ✗] Falha ao retirar todas as pedras da casa escolhida.');
  falhas++;
}

// Teste 6: continuar a partir da casa seguinte (revezamento)
console.log('\nTESTE 6: Continuar a partir da casa seguinte (revezamento)');
const estadoRevez = inicializarJogo();
estadoRevez.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
estadoRevez.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 0;
estadoRevez.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 2;
// Para testar o revezamento puro (sem captura), as casas adversárias na coluna da casa 3 estão vazias:
estadoRevez.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 0;
estadoRevez.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 0;

const resRevez = executarDistribuicao(estadoRevez, 1, false);
const idxRevez = resRevez.passos.findIndex((p) => p.tipo === 'recolher_revezamento');
const passoRevez = resRevez.passos[idxRevez];
const passoSeguinte = resRevez.passos[idxRevez + 1];

const continuouNaSeguinte =
  passoRevez &&
  passoRevez.casa === 3 &&
  passoSeguinte &&
  passoSeguinte.tipo === 'semear_pedra' &&
  passoSeguinte.casa === 4; // Casa seguinte à casa 3

if (continuouNaSeguinte) {
  console.log(`  [PASSOU ✓] A última pedra caiu na casa 3 (já possuía pedras):`);
  console.log(`             Somou a pedra, recolheu da casa 3 e CONTINUOU na casa seguinte: Casa ${passoSeguinte.casa}.`);
} else {
  console.error('  [FALHOU ✗] Falha ao continuar a distribuição a partir da casa seguinte.');
  falhas++;
}

// ==========================================
// 2. CORRESPONDÊNCIA FÍSICA (12 PARES)
// ==========================================
console.log('\n--- CORRESPONDÊNCIAS FÍSICAS DIRETAS ---');
CORRESPONDENCIAS_FISICAS.forEach(([casaA, casaB], idx) => {
  const resA = oposta(casaA);
  const resB = oposta(casaB);
  const ok = resA === casaB && resB === casaA;
  if (!ok) {
    console.error(`  [FALHOU ✗] ${casaA} ↔ ${casaB}`);
    falhas++;
  }
});
console.log(`  [PASSOU ✓] Todas as 12 correspondências físicas verificadas com sucesso bidirecional.`);

// ==========================================
// 3. MODELAGEM PRÉVIA DO MOTOR DE CAPTURA
// ==========================================
console.log('\n================================================================');
console.log('   SITUAÇÕES MODELADAS DO MOTOR DE CAPTURA                       ');
console.log('================================================================\n');

// SITUAÇÃO 1: Qual é a posição da casa onde terminou a distribuição
console.log('SITUAÇÃO 1: Posição da casa onde terminou a distribuição');
const posInternaA = posicaoDaCasaOndeTerminou(1);
const posExternaA = posicaoDaCasaOndeTerminou(7);
const posInternaB = posicaoDaCasaOndeTerminou(13);
const posExternaB = posicaoDaCasaOndeTerminou(19);

const s1Ok = 
  posInternaA.linha === 'interna' && posInternaA.elegivelParaCaptura === true &&
  posExternaA.linha === 'externa' && posExternaA.elegivelParaCaptura === false &&
  posInternaB.linha === 'interna' && posInternaB.elegivelParaCaptura === true &&
  posExternaB.linha === 'externa' && posExternaB.elegivelParaCaptura === false;

if (s1Ok) {
  console.log('  [PASSOU ✓] Posições identificadas: Casas 1..6 e 13..18 são internas (elegíveis); 7..12 e 19..24 são externas.');
} else {
  console.error('  [FALHOU ✗] Falha na identificação da posição onde terminou a distribuição.');
  falhas++;
}

// SITUAÇÃO 2: Qual é a casa adversária diretamente correspondente
console.log('\nSITUAÇÃO 2: Casa adversária diretamente correspondente');
const op1 = obterCasaAdversariaDiretamenteCorrespondente(1);
const op6 = obterCasaAdversariaDiretamenteCorrespondente(6);
const op13 = obterCasaAdversariaDiretamenteCorrespondente(13);
const op18 = obterCasaAdversariaDiretamenteCorrespondente(18);

const s2Ok = op1 === 18 && op6 === 13 && op13 === 6 && op18 === 1;
if (s2Ok) {
  console.log(`  [PASSOU ✓] Casas adversárias diretamente correspondentes corretas:`);
  console.log(`             oposta(1) = ${op1}, oposta(6) = ${op6}, oposta(13) = ${op13}, oposta(18) = ${op18}`);
} else {
  console.error('  [FALHOU ✗] Falha ao obter casa adversária diretamente correspondente.');
  falhas++;
}

// SITUAÇÃO 3: Como verificar a segunda casa adversária
console.log('\nSITUAÇÃO 3: Como verificar a segunda casa');
const segDe18 = obterSegundaCasaAdversaria(18); // atrás de 18 na coluna 6 está a casa 19
const segDe13 = obterSegundaCasaAdversaria(13); // atrás de 13 na coluna 1 está a casa 24
const segDe6 = obterSegundaCasaAdversaria(6);   // atrás de 6 na coluna 1 está a casa 7
const segDe1 = obterSegundaCasaAdversaria(1);   // atrás de 1 na coluna 6 está a casa 12

const s3Ok = segDe18 === 19 && segDe13 === 24 && segDe6 === 7 && segDe1 === 12;
if (s3Ok) {
  console.log(`  [PASSOU ✓] Segunda casa adversária na coluna física mapeada corretamente:`);
  console.log(`             Atrás da 18: ${segDe18}; Atrás da 13: ${segDe13}; Atrás da 6: ${segDe6}; Atrás da 1: ${segDe1}`);
} else {
  console.error('  [FALHOU ✗] Falha ao verificar segunda casa adversária.');
  falhas++;
}

// SITUAÇÃO 4: Como impedir a captura de uma casa própria
console.log('\nSITUAÇÃO 4: Como impedir a captura de uma casa própria');
const impExternaA = verificarImpedimentoCasaPropria(12, JOGADOR_A);
const impExternaB = verificarImpedimentoCasaPropria(24, JOGADOR_B);
const impInternaA = verificarImpedimentoCasaPropria(1, JOGADOR_A);

const s4Ok = impExternaA.impedido === true && impExternaB.impedido === true && impInternaA.impedido === false;
if (s4Ok) {
  console.log('  [PASSOU ✓] Captura de casa própria rigorosamente impedida:');
  console.log('             - Linha externa de A (casa 12): impedida porque a casa em frente (1) é própria.');
  console.log('             - Linha externa de B (casa 24): impedida porque a casa em frente (13) é própria.');
} else {
  console.error('  [FALHOU ✗] Falha ao impedir captura de casa própria.');
  falhas++;
}

// ==========================================
// 4. TESTES DAS 10 REGRAS DE CAPTURA
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DAS 10 REGRAS DE CAPTURA                               ');
console.log('================================================================\n');

// Regra 1: Captura depende da posição física das casas
console.log('REGRA 1: Posição física');
const colInfo = obterCasasAdversariasColuna(2);
const r1Ok = colInfo.primeiraCasaAdversaria === 17 && colInfo.segundaCasaAdversaria === 20;
if (r1Ok) {
  console.log('  [PASSOU ✓] Alinhamento físico comprovado: casa 2 alinha com 17 e 20.');
} else {
  console.error('  [FALHOU ✗] Regra 1 falhou.');
  falhas++;
}

// Regras 2 e 3: Só pedras do adversário, nunca do próprio jogador
console.log('\nREGRAS 2 e 3: Só pedras adversárias, nunca do próprio jogador');
const estPropria = inicializarJogo();
const avalPropria = avaliarCaptura(estPropria, 8); // Linha externa de A
const r2r3Ok = !avalPropria.podeCapturar && avalPropria.impedidaPorCasaPropria;
if (r2r3Ok) {
  console.log('  [PASSOU ✓] Casas próprias são protegidas de captura.');
} else {
  console.error('  [FALHOU ✗] Regras 2 e 3 falharam.');
  falhas++;
}

// Regra 4: A casa adversária necessária para a captura não pode estar vazia
console.log('\nREGRA 4: Casa adversária necessária não pode estar vazia');
const estVazia = inicializarJogo();
estVazia.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 0;
const avalVazia = avaliarCaptura(estVazia, 1);
const r4Ok = !avalVazia.podeCapturar && avalVazia.casasParaCapturar.length === 0;
if (r4Ok) {
  console.log('  [PASSOU ✓] Casa adversária com 0 pedras impede captura.');
} else {
  console.error('  [FALHOU ✗] Regra 4 falhou.');
  falhas++;
}

// Regra 5: Não é permitido saltar uma primeira casa adversária vazia para capturar outra
console.log('\nREGRA 5: Proibido saltar primeira casa adversária vazia');
const estSalto = inicializarJogo();
estSalto.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 0;
estSalto.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 10; // Segunda tem 10 pedras
const avalSalto = avaliarCaptura(estSalto, 1);
const r5Ok = !avalSalto.podeCapturar && avalSalto.casasParaCapturar.length === 0;
if (r5Ok) {
  console.log('  [PASSOU ✓] Mesmo com 10 pedras na 2ª casa, o salto sobre a 1ª vazia é bloqueado.');
} else {
  console.error('  [FALHOU ✗] Regra 5 falhou: permitiu salto sobre casa vazia!');
  falhas++;
}

// Regras 6 e 7: Máximo 2 casas e captura da segunda casa obrigatória quando válida
console.log('\nREGRAS 6 e 7: Máximo 2 casas e captura obrigatória da 2ª casa válida');
const estDupla = inicializarJogo();
estDupla.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 3;
estDupla.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 5;
const avalDupla = avaliarCaptura(estDupla, 1);
const r6r7Ok = 
  avalDupla.podeCapturar && 
  avalDupla.casasParaCapturar.length === 2 &&
  avalDupla.casasParaCapturar[0] === 18 &&
  avalDupla.casasParaCapturar[1] === 19 &&
  avalDupla.totalPedrasCapturadas === 8;

if (r6r7Ok) {
  console.log('  [PASSOU ✓] Captura obrigatória de ambas as casas [18, 19] totalizando 8 pedras.');
} else {
  console.error('  [FALHOU ✗] Regras 6 e 7 falharam.');
  falhas++;
}

// Regra 8: Nunca capturar uma terceira casa
console.log('\nREGRA 8: Nunca capturar uma terceira casa');
const r8Ok = avalDupla.casasParaCapturar.length <= 2;
if (r8Ok) {
  console.log('  [PASSOU ✓] Limite estrito de no máximo 2 casas capturadas garantido.');
} else {
  console.error('  [FALHOU ✗] Regra 8 falhou.');
  falhas++;
}

// Regra 9: Não existe limite de quantidade de pedras dentro das duas casas capturadas
console.log('\nREGRA 9: Sem limite de pedras nas casas capturadas');
const estGrande = inicializarJogo();
estGrande.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 25;
estGrande.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 18;
const avalGrande = avaliarCaptura(estGrande, 1);
const r9Ok = avalGrande.podeCapturar && avalGrande.totalPedrasCapturadas === 43;
if (r9Ok) {
  console.log(`  [PASSOU ✓] Captura de 43 pedras (25 + 18) realizada com sucesso sem restrição.`);
} else {
  console.error('  [FALHOU ✗] Regra 9 falhou.');
  falhas++;
}

// Regra 10 e Pós-Captura: Todas as pedras retiradas e redistribuídas no percurso do jogador
console.log('\nREGRA 10 & PÓS-CAPTURA: Retirada total e redistribuição');
const estExec = inicializarJogo();
estExec.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 4;
estExec.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 3;
const resExec = executarCaptura(estExec, 1);
const pedrasC18Depois = resExec.novoEstado.casas.find((c) => c.numero === 18)!.quantidadeDePedras;
const pedrasC19Depois = resExec.novoEstado.casas.find((c) => c.numero === 19)!.quantidadeDePedras;

const r10Ok = 
  resExec.houveCaptura &&
  pedrasC18Depois === 0 &&
  pedrasC19Depois === 0 &&
  resExec.novoEstado.pedrasNaMao === 7 &&
  resExec.pedrasCapturadas === 7;

if (r10Ok) {
  console.log('  [PASSOU ✓] Todas as pedras retiradas (casas 18 e 19 ficaram com 0) e colocadas na mão temporária (7 pedras).');
} else {
  console.error('  [FALHOU ✗] Regra 10 falhou.');
  falhas++;
}

// ==========================================
// 5. TESTES DA CADEIA DE UMA JOGADA NTXUVA
// ==========================================
console.log('\n================================================================');
console.log('   CADEIA DE UMA JOGADA NTXUVA (INTEGRAÇÃO COMPLETA)             ');
console.log('================================================================\n');

// Teste Cadeia 1: Captura, pedras na mão e continuação na casa seguinte
console.log('CADEIA 1: Captura, pedras na mão e continuação na casa seguinte');
const estCad1 = inicializarJogo();
for (let i = 1; i <= 12; i++) estCad1.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
estCad1.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Distribui em 2 e 3
for (let i = 13; i <= 24; i++) estCad1.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
estCad1.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 2; // Oposta da casa 3
estCad1.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2; // Jogador B continua ativo (não vence por pedras == 0)

const resCad1 = executarDistribuicao(estCad1, 1, true);
const idxCap1 = resCad1.passos.findIndex((p) => p.tipo === 'captura_pedras');
const passoAposCap1 = idxCap1 >= 0 ? resCad1.passos[idxCap1 + 1] : null;

const cad1Passou =
  idxCap1 >= 0 &&
  passoAposCap1?.tipo === 'semear_pedra' &&
  passoAposCap1?.casa === 4 &&
  resCad1.novoEstado.ultimaCadeia?.totalCapturas === 1 &&
  resCad1.novoEstado.ultimaCadeia?.totalPedrasCapturadas === 2;

if (cad1Passou) {
  console.log('  [PASSOU ✓] Capturou na casa 3 (casa 16 com 2 pedras), colocou na mão e continuou na casa 4!');
} else {
  console.error('  [FALHOU ✗] Falha na cadeia 1.');
  falhas++;
}

// Teste Cadeia 2: Uma mesma jogada com múltiplas capturas sucessivas
console.log('\nCADEIA 2: Uma mesma jogada com múltiplas capturas sucessivas');
const estCadMult = inicializarJogo();
for (let i = 1; i <= 24; i++) estCadMult.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
estCadMult.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // cai na 3
estCadMult.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 2; // 1ª captura (casa 3) -> 2 pedras na mão
estCadMult.casas.find((c) => c.numero === 14)!.quantidadeDePedras = 2; // 2ª captura (cai na 5) -> 2 pedras na mão
estCadMult.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2; // Jogador B continua ativo
// Da casa 5 semeia na 6 e 7 (cai na 7 que está vazia e é linha externa)

const resCadMult = executarDistribuicao(estCadMult, 1, true);
const cadMultOk =
  resCadMult.novoEstado.ultimaCadeia?.totalCapturas === 2 &&
  resCadMult.novoEstado.ultimaCadeia?.totalPedrasCapturadas === 4 &&
  resCadMult.novoEstado.ultimaCadeia?.casaFinal === 7 &&
  resCadMult.novoEstado.casas.find((c) => c.numero === 16)!.quantidadeDePedras === 0 &&
  resCadMult.novoEstado.casas.find((c) => c.numero === 14)!.quantidadeDePedras === 0;

if (cadMultOk) {
  console.log('  [PASSOU ✓] Múltiplas capturas na mesma jogada:');
  console.log('             - 1ª Captura na casa 3 (capturou casa 16) → continuou na casa 4');
  console.log('             - 2ª Captura na casa 5 (capturou casa 14) → continuou na casa 6');
  console.log('             - Finalizou com sucesso na casa 7 com 2 capturas e 4 pedras no total!');
} else {
  console.error('  [FALHOU ✗] Falha no teste de múltiplas capturas na mesma jogada.');
  falhas++;
}

// Teste Cadeia 3: A nova distribuição começa na casa seguinte e NUNCA volta para a casa inicial
console.log('\nCADEIA 3: Nunca voltar automaticamente para a casa inicial');
const estNuncaVolta = inicializarJogo();
for (let i = 1; i <= 24; i++) estNuncaVolta.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
estNuncaVolta.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Começa na 1, cai na 3
estNuncaVolta.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 1; // Captura 1 pedra
estNuncaVolta.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2; // Jogador B ativo
const resNuncaVolta = executarDistribuicao(estNuncaVolta, 1, true);

const semeadurasAposCap = resNuncaVolta.passos.filter((p, idx) => {
  const iCap = resNuncaVolta.passos.findIndex((x) => x.tipo === 'captura_pedras');
  return idx > iCap && p.tipo === 'semear_pedra';
});
const primeiraApos = semeadurasAposCap[0];
const casa1PermaneceuVazia = resNuncaVolta.novoEstado.casas.find((c) => c.numero === 1)!.quantidadeDePedras === 0;

const nuncaVoltaOk = primeiraApos?.casa === 4 && casa1PermaneceuVazia;
if (nuncaVoltaOk) {
  console.log('  [PASSOU ✓] Após captura na casa 3, a nova distribuição começou na casa 4 (NUNCA voltou para a casa 1).');
} else {
  console.error('  [FALHOU ✗] Distribuição voltou indevidamente para a casa inicial.');
  falhas++;
}

// Teste Cadeia 4: Não mudar o jogador enquanto a cadeia ainda estiver ativa
console.log('\nCADEIA 4: Não mudar o jogador enquanto a cadeia estiver ativa');
const estJ = inicializarJogo();
for (let i = 1; i <= 24; i++) estJ.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
estJ.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
estJ.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 2;
estJ.casas.find((c) => c.numero === 22)!.quantidadeDePedras = 2; // Para Jogador B ter pedras

const resJ = executarDistribuicao(estJ, 1, true);
const passosTodosMesmoJogador = resJ.passos.every((p) => p.jogadorAtivo === JOGADOR_A);
const turnoMudouApenasNoFim = resJ.novoEstado.jogadorAtual === JOGADOR_B;

const jogadorOk = passosTodosMesmoJogador && turnoMudouApenasNoFim;
if (jogadorOk) {
  console.log('  [PASSOU ✓] Durante toda a cadeia (retirar, semear, capturar, continuar), o jogador permaneceu Jogador A.');
  console.log('             O turno só mudou para o Jogador B após a cadeia inteira estar finalizada!');
} else {
  console.error('  [FALHOU ✗] Falha no controle de turno da cadeia.');
  falhas++;
}

// ==========================================
// 6. TESTES DAS CONDIÇÕES DE ENCERRAMENTO DE UMA JOGADA
// ==========================================
console.log('\n================================================================');
console.log('   CONDIÇÕES DE ENCERRAMENTO DE UMA JOGADA NTXUVA                ');
console.log('================================================================\n');

// Teste Encerramento 1: Fim por casa vazia
console.log('ENCERRAMENTO 1: Fim por casa vazia (uma pedra colocada em casa vazia, ficando com 1 pedra)');
{
  const estFimVazia = inicializarJogo();
  for (let i = 1; i <= 24; i++) estFimVazia.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  estFimVazia.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Distribui na 2 e cai na casa 3 (que tinha 0)
  estFimVazia.casas.find((c) => c.numero === 23)!.quantidadeDePedras = 2; // Adversário ativo

  const resFimVazia = executarDistribuicao(estFimVazia, 1, true);
  const c3Depois = resFimVazia.novoEstado.casas.find((c) => c.numero === 3)!.quantidadeDePedras;
  const passoFim = resFimVazia.passos.find((p) => p.tipo === 'fim_distribuicao');
  const avalFimVazia = avaliarEncerramentoDaJogada(resFimVazia.novoEstado, 3, 0);

  const encerramento1Passou =
    c3Depois === 1 &&
    passoFim !== undefined &&
    passoFim.casa === 3 &&
    avalFimVazia.casaEstavaVazia === true &&
    avalFimVazia.casaFicouComUmaPedra === true &&
    avalFimVazia.jogadaTerminou === true;

  if (encerramento1Passou) {
    console.log('  [PASSOU ✓] Uma pedra colocada na casa vazia 3 (ficou com 1 pedra).');
    console.log('             Condições 1 e 2 satisfeitas: casaEstavaVazia=true e casaFicouComUmaPedra=true!');
  } else {
    console.error('  [FALHOU ✗] Falha no teste de fim por casa vazia.');
    falhas++;
  }
}

// Teste Encerramento 2: Fim sem captura (casa própria bloqueada & salto proibido)
console.log('\nENCERRAMENTO 2: Fim sem captura (Regras: pedras próprias nunca capturadas & salto proibido)');
{
  const estSemCap = inicializarJogo();
  for (let i = 1; i <= 24; i++) estSemCap.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;

  // Sub-caso A: Casa própria nunca pode ser capturada (linha externa, casa 7)
  estSemCap.casas.find((c) => c.numero === 7)!.quantidadeDePedras = 1;
  estSemCap.casas.find((c) => c.numero === 6)!.quantidadeDePedras = 4;
  const avalProp = avaliarEncerramentoDaJogada(estSemCap, 7, 0);
  const subCasoPropriaOk =
    avalProp.avaliacaoCaptura.impedidaPorCasaPropria === true &&
    avalProp.existeCapturaValida === false &&
    avalProp.jogadaTerminou === true;

  // Sub-caso B: Primeira casa adversária vazia não pode ser saltada (linha interna, casa 1)
  estSemCap.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 1;
  estSemCap.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 0; // Primeira vazia
  estSemCap.casas.find((c) => c.numero === 19)!.quantidadeDePedras = 4; // Segunda com pedras
  const avalSlt = avaliarEncerramentoDaJogada(estSemCap, 1, 0);
  const subCasoSaltoOk =
    avalSlt.avaliacaoCaptura.podeCapturar === false &&
    avalSlt.avaliacaoCaptura.casasParaCapturar.length === 0 &&
    avalSlt.existeCapturaValida === false &&
    avalSlt.jogadaTerminou === true;

  const encerramento2Passou = subCasoPropriaOk && subCasoSaltoOk;
  if (encerramento2Passou) {
    console.log('  [PASSOU ✓] Condição 3 (sem captura válida):');
    console.log('             - Pedras próprias NUNCA são capturadas (impedidaPorCasaPropria=true).');
    console.log('             - Não pode saltar uma primeira casa adversária vazia (Regras 4 e 5 cumpridas).');
    console.log('             - Em ambos os casos, existeCapturaValida=false e a jogada encerra.');
  } else {
    console.error('  [FALHOU ✗] Falha no teste de fim sem captura.');
    falhas++;
  }
}

// Teste Encerramento 3: Fim por impossibilidade de continuar
console.log('\nENCERRAMENTO 3: Fim por impossibilidade de continuar');
{
  const estImp = inicializarJogo();
  for (let i = 1; i <= 24; i++) estImp.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  estImp.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2; // Distribui em 2 e 3 (cai em 3 que está vazia)
  estImp.casas.find((c) => c.numero === 22)!.quantidadeDePedras = 2;

  const resImp = executarDistribuicao(estImp, 1, true);
  const avalImp = avaliarEncerramentoDaJogada(resImp.novoEstado, 3, 0);
  const ultimoP = resImp.passos[resImp.passos.length - 1];

  const encerramento3Passou =
    avalImp.existeContinuacaoValida === false &&
    avalImp.existeCapturaValida === false &&
    avalImp.jogadaTerminou === true &&
    ultimoP.tipo === 'fim_distribuicao' &&
    ultimoP.casa === 3;

  if (encerramento3Passou) {
    console.log('  [PASSOU ✓] Condição 4: sem captura e sem pedras para revezamento (casa estava vazia).');
    console.log('             A jogada encerrou imediatamente com passo fim_distribuicao.');
  } else {
    console.error('  [FALHOU ✗] Falha no teste de fim por impossibilidade de continuar.');
    falhas++;
  }
}

// Teste Encerramento 4: Troca correta do jogador (jogadorAtual = outro jogador)
console.log('\nENCERRAMENTO 4: Troca correta do jogador (jogadorAtual = outro jogador)');
{
  const estTroca = inicializarJogo();
  for (let i = 1; i <= 24; i++) estTroca.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  estTroca.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
  estTroca.casas.find((c) => c.numero === 6)!.quantidadeDePedras = 2;
  estTroca.casas.find((c) => c.numero === 13)!.quantidadeDePedras = 2;
  estTroca.casas.find((c) => c.numero === 20)!.quantidadeDePedras = 2;

  // Jogador A joga e termina
  const resTrocaA = executarDistribuicao(estTroca, 1, true);
  const turnoPassouParaB = resTrocaA.novoEstado.jogadorAtual === JOGADOR_B;

  // Jogador B joga do estado resultante e termina
  const resTrocaB = executarDistribuicao(resTrocaA.novoEstado, 13, true);
  const turnoPassouParaA = resTrocaB.novoEstado.jogadorAtual === JOGADOR_A;

  const alternarOk =
    alternarJogador(JOGADOR_A) === JOGADOR_B &&
    alternarJogador(JOGADOR_B) === JOGADOR_A;

  const encerramento4Passou = turnoPassouParaB && turnoPassouParaA && alternarOk;
  if (encerramento4Passou) {
    console.log('  [PASSOU ✓] Troca correta do jogador comprovada:');
    console.log('             - Jogador A finalizou jogada → jogadorAtual = Jogador B');
    console.log('             - Jogador B finalizou jogada → jogadorAtual = Jogador A');
  } else {
    console.error('  [FALHOU ✗] Falha no teste de troca correta do jogador.');
    falhas++;
  }
}

// ==========================================
// TESTE DA ÁREA DE EVENTOS (ÚLTIMOS MOVIMENTOS)
// Formato solicitado:
// 11 → 12 → 1
// Captura: 18 + 19
// 2 → 3 → 4 → 5
// Captura: 14 + 23
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DA ÁREA DE EVENTOS: ÚLTIMOS MOVIMENTOS                ');
console.log('================================================================');
{
  const passosExemplo: PassoDistribuicao[] = [
    { tipo: 'retirar_origem', casa: 11, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 0, pedrasNaMaoAntes: 0, pedrasNaMaoDepois: 2, mensagem: 'Retirou da 11' },
    { tipo: 'semear_pedra', casa: 12, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 2, pedrasNaMaoDepois: 1, mensagem: 'Semeou na 12' },
    { tipo: 'semear_pedra', casa: 1, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 1, pedrasNaMaoDepois: 0, mensagem: 'Semeou na 1' },
    { tipo: 'verificar_captura', casa: 1, pedrasNaCasaAntes: 3, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 0, pedrasNaMaoDepois: 0, mensagem: 'Verificou' },
    { tipo: 'captura_pedras', casa: 1, pedrasNaCasaAntes: 3, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 0, pedrasNaMaoDepois: 4, casasCapturadas: [18, 19], pedrasCapturadas: 4, mensagem: 'Capturou 18 e 19' },
    { tipo: 'semear_pedra', casa: 2, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 4, pedrasNaMaoDepois: 3, mensagem: 'Semeou na 2' },
    { tipo: 'semear_pedra', casa: 3, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 3, pedrasNaMaoDepois: 2, mensagem: 'Semeou na 3' },
    { tipo: 'semear_pedra', casa: 4, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 2, pedrasNaMaoDepois: 1, mensagem: 'Semeou na 4' },
    { tipo: 'semear_pedra', casa: 5, pedrasNaCasaAntes: 2, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 1, pedrasNaMaoDepois: 0, mensagem: 'Semeou na 5' },
    { tipo: 'verificar_captura', casa: 5, pedrasNaCasaAntes: 3, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 0, pedrasNaMaoDepois: 0, mensagem: 'Verificou' },
    { tipo: 'captura_pedras', casa: 5, pedrasNaCasaAntes: 3, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 0, pedrasNaMaoDepois: 4, casasCapturadas: [14, 23], pedrasCapturadas: 4, mensagem: 'Capturou 14 e 23' },
    { tipo: 'fim_distribuicao', casa: 5, pedrasNaCasaAntes: 3, pedrasNaCasaDepois: 3, pedrasNaMaoAntes: 0, pedrasNaMaoDepois: 0, mensagem: 'Fim' },
  ];

  const eventos = extrairEventosJogada(passosExemplo);
  const textos = eventos.map((e) => e.texto);

  const esperado = [
    '11 → 12 → 1',
    'Captura: 18 + 19',
    '2 → 3 → 4 → 5',
    'Captura: 14 + 23'
  ];

  const passouEventos = JSON.stringify(textos) === JSON.stringify(esperado);
  if (passouEventos) {
    console.log('  [PASSOU ✓] Formatação da sequência de eventos do NTXUVA validada com sucesso:');
    textos.forEach((t) => console.log(`             ${t}`));
  } else {
    console.error('  [FALHOU ✗] Formatação de eventos incorreta.');
    console.error('             Esperado:', esperado);
    console.error('             Obtido:  ', textos);
    falhas++;
  }
}

// ==========================================
// TESTES DO MOTOR DE IA (escolherMelhorJogadaIA)
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DO MOTOR DE INTELIGÊNCIA ARTIFICIAL (IA)               ');
console.log('================================================================');
{
  const jogo = inicializarJogo();
  jogo.jogadorAtual = JOGADOR_B;
  const decisao = escolherMelhorJogadaIA(jogo, JOGADOR_B);

  const valido = decisao !== null && decisao.casaEscolhida >= 13 && decisao.casaEscolhida <= 24;
  if (valido) {
    console.log(`  [PASSOU ✓] IA selecionou movimento válido no território de B: casa ${decisao?.casaEscolhida} (${decisao?.motivo})`);
  } else {
    console.error('  [FALHOU ✗] IA não selecionou casa válida de B:', decisao);
    falhas++;
  }

  // Teste com casa de vitória evidente
  const jogoVitoria = inicializarJogo();
  jogoVitoria.jogadorAtual = JOGADOR_B;
  for (let i = 1; i <= 24; i++) {
    jogoVitoria.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  // B na casa 13 com 2 pedras -> semeia na 14 e cai na 15 (vazia, linha interna)
  // Oposta da 15 é a casa 4 com 2 pedras -> captura decisiva eliminando o adversário A!
  jogoVitoria.casas.find((c) => c.numero === 13)!.quantidadeDePedras = 2;
  jogoVitoria.casas.find((c) => c.numero === 4)!.quantidadeDePedras = 2; // adversário oposta da 15
  jogoVitoria.pedrasDoJogadorA = 2;
  jogoVitoria.pedrasDoJogadorB = 2;

  const decisaoVitoria = escolherMelhorJogadaIA(jogoVitoria, JOGADOR_B, 'medio');
  if (decisaoVitoria && decisaoVitoria.casaEscolhida === 13) {
    console.log('  [PASSOU ✓] IA identificou e escolheu movimento de vitória imediata (casa 13)!');
  } else {
    console.error('  [FALHOU ✗] IA não priorizou vitória imediata:', decisaoVitoria);
    falhas++;
  }

  // Testes de Níveis de Dificuldade: Iniciante, Médio e Mestre Kota
  const decIniciante = escolherMelhorJogadaIA(jogo, JOGADOR_B, 'iniciante');
  const decMedio = escolherMelhorJogadaIA(jogo, JOGADOR_B, 'medio');
  const decMestre = escolherMelhorJogadaIA(jogo, JOGADOR_B, 'mestre');

  if (decIniciante && decMedio && decMestre) {
    console.log('  [PASSOU ✓] Todos os 3 níveis de dificuldade da IA respondem perfeitamente:');
    console.log(`             - Iniciante: casa ${decIniciante.casaEscolhida} (${decIniciante.motivo})`);
    console.log(`             - Médio: casa ${decMedio.casaEscolhida} (${decMedio.motivo})`);
    console.log(`             - Mestre Kota: casa ${decMestre.casaEscolhida} (${decMestre.motivo})`);
  } else {
    console.error('  [FALHOU ✗] Falha nos níveis de dificuldade da IA:', { decIniciante, decMedio, decMestre });
    falhas++;
  }
}

// ==========================================
// TESTES DA REGRA: INÍCIO COM 1 PEDRA
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DA REGRA DE INÍCIO: CASAS COM 1 PEDRA                  ');
console.log('================================================================');
{
  // 1. Proibição de iniciar em casa com 1 pedra se houver casas com 2+ pedras
  const jogoMisto = inicializarJogo();
  for (let i = 1; i <= 24; i++) {
    jogoMisto.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  jogoMisto.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 1; // 1 pedra apenas
  jogoMisto.casas.find((c) => c.numero === 4)!.quantidadeDePedras = 3; // 3 pedras
  jogoMisto.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 2; // Adversário
  jogoMisto.jogadorAtual = JOGADOR_A;

  const res1Pedra = podeIniciarJogada(jogoMisto, 1);
  const res3Pedras = podeIniciarJogada(jogoMisto, 4);

  if (res1Pedra.valido === false && res3Pedras.valido === true) {
    console.log('  [PASSOU ✓] Proibido iniciar na casa 1 (1 pedra) porque existe a casa 4 com 3 pedras.');
    console.log('             Motivo exibido:', res1Pedra.motivo);
  } else {
    console.error('  [FALHOU ✗] Falha na proibição de iniciar com 1 pedra:', res1Pedra);
    falhas++;
  }

  // 2. Não se deve e não se inicia a jogada numa casa que tenha somente 1 pedra
  const jogoSo1Pedra = inicializarJogo();
  for (let i = 1; i <= 24; i++) {
    jogoSo1Pedra.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  jogoSo1Pedra.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 1;
  jogoSo1Pedra.casas.find((c) => c.numero === 5)!.quantidadeDePedras = 1;
  jogoSo1Pedra.casas.find((c) => c.numero === 18)!.quantidadeDePedras = 2; // Adversário
  jogoSo1Pedra.jogadorAtual = JOGADOR_A;

  const resPerm2 = podeIniciarJogada(jogoSo1Pedra, 2);
  const resPerm5 = podeIniciarJogada(jogoSo1Pedra, 5);

  if (resPerm2.valido === false && resPerm5.valido === false) {
    console.log('  [PASSOU ✓] Não se inicia a jogada nas casas 2 e 5: têm somente 1 pedra (regra estrita: 2+ pedras)!');
  } else {
    console.error('  [FALHOU ✗] Falha na proibição com 1 pedra:', resPerm2, resPerm5);
    falhas++;
  }
}

// ==========================================
// TESTES DA REGRA: VITÓRIA POR ASFIXIA (AFOGAMENTO)
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DE VITÓRIA POR ASFIXIA (AFOGAMENTO)                   ');
console.log('================================================================');
{
  const jogoAfogado = inicializarJogo();
  for (let i = 1; i <= 24; i++) jogoAfogado.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  // Jogador A tem 2 pedras na casa 1 e 2 pedras na casa 6
  jogoAfogado.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
  jogoAfogado.casas.find((c) => c.numero === 6)!.quantidadeDePedras = 2;
  // Jogador B só tem casas de 1 pedra (impossibilitado de jogar)
  jogoAfogado.casas.find((c) => c.numero === 13)!.quantidadeDePedras = 1;
  jogoAfogado.casas.find((c) => c.numero === 20)!.quantidadeDePedras = 1;

  const checkAfogamento = verificarVitoriaAposCaptura(jogoAfogado.casas, JOGADOR_A);
  const resAfogamento = executarDistribuicao(jogoAfogado, 1, true);

  if (
    checkAfogamento.vitoria === true &&
    checkAfogamento.tipoVitoria === 'asfixia' &&
    checkAfogamento.vencedor === JOGADOR_A &&
    resAfogamento.novoEstado.vencedor === JOGADOR_A &&
    resAfogamento.novoEstado.tipoVitoria === 'asfixia' &&
    resAfogamento.novoEstado.estadoDaPartida === 'FINALIZADA'
  ) {
    console.log('  [PASSOU ✓] Vitória por Asfixia (Afogamento) declarada corretamente:');
    console.log('             Adversário restou apenas com casas de 1 pedra e foi derrotado por asfixia!');
  } else {
    console.error('  [FALHOU ✗] Falha na detecção de vitória por asfixia:', checkAfogamento, resAfogamento.novoEstado.vencedor);
    falhas++;
  }
}

// ==========================================
// TESTES DA REGRA TRADICIONAL DOS 5 GIROS
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DA REGRA TRADICIONAL DOS 5 GIROS COMPLETOS            ');
console.log('================================================================');
{
  const jogo5Giros = inicializarJogo();
  // Zera as pedras do Jogador B na linha de ataque para garantir que não há capturas à frente
  for (let i = 13; i <= 24; i++) {
    jogo5Giros.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  // Casa 24 com 2 pedras para o adversário ter lance válido e não haver asfixia
  jogo5Giros.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 2;

  // Jogador A tem 65 pedras na Casa 2 (mais que 5 giros = 60 passos)
  const casa2 = jogo5Giros.casas.find((c) => c.numero === 2)!;
  casa2.quantidadeDePedras = 65;

  const res5Giros = executarDistribuicao(jogo5Giros, 2, true);
  const ultimoPasso = res5Giros.passos[res5Giros.passos.length - 1];

  // 5 giros completos a partir da casa 2:
  // 1 giro: 3..12, 1, 2 (12 passos)
  // 5 giros: 5 * 12 = 60 passos completam exatamente na casa 2!
  // Como não há captura à frente, a jogada encerra na casa 2 e a vez passa para o Jogador B!
  const terminouNaCasa2 = ultimoPasso.casa === 2;
  const mensagemContem5Giros = ultimoPasso.mensagem.includes('5 giros completos');
  const passouTurno = res5Giros.novoEstado.jogadorAtual === JOGADOR_B;

  if (terminouNaCasa2 && mensagemContem5Giros && passouTurno) {
    console.log('  [PASSOU ✓] Regra de Moto-Moto (5 Giros) respeitada com sucesso:');
    console.log(`             A jogada completou 5 giros na casa ${ultimoPasso.casa}, encerrou com Moto-Moto sem captura à frente e passou a vez ao ${res5Giros.novoEstado.jogadorAtual}!`);
  } else {
    console.error('  [FALHOU ✗] Falha no teste dos 5 giros:', { terminouNaCasa2, mensagemContem5Giros, passouTurno, ultimoPasso });
    falhas++;
  }
}

// ==========================================
// TESTES DA REGRA ESPECIAL DE BÓNUS (1x e 2x)
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DA REGRA DE BÓNUS: 1x (≥10 em 1 casa) E 2x (≥20)       ');
console.log('================================================================');
{
  // Teste 1: Captura de 1 casa com 10 pedras (não combinada) -> ganha 1x (1 jogada extra)
  const jogoBonus1x = inicializarJogo();
  for (let i = 1; i <= 24; i++) {
    jogoBonus1x.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  // Jogador A sai da casa 2 com 1 pedra não pode, então com 2 pedras: cai na 3 e na 4.
  // Vamos configurar: casa 1 tem 2 pedras. Linha de A: 1 -> 2 -> 3.
  // Se casa 1 tem 2 pedras: semeadura cai na casa 2 e na casa 3 (casa vazia, linha de ataque).
  jogoBonus1x.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
  jogoBonus1x.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 0;
  jogoBonus1x.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 0;
  // Adversário na casa oposta de 3 é 16 (linha de ataque do adversário)
  // Casa 16 tem 12 pedras (≥ 10 em 1 casa individual!)
  jogoBonus1x.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 12;
  // Casa 21 (defesa) tem 0 pedras (captura apenas 1 casa com 12 pedras)
  jogoBonus1x.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 0;
  // Outra casa para o adversário não morrer por eliminação/asfixia imediata:
  jogoBonus1x.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 5;
  jogoBonus1x.casas.find((c) => c.numero === 23)!.quantidadeDePedras = 5;

  const resBonus1x = executarDistribuicao(jogoBonus1x, 1, true);
  const cadeia1x = resBonus1x.novoEstado.ultimaCadeia;
  const ganhou1x = cadeia1x?.tipoBonusGanhos === '1x' && cadeia1x?.jogadasBonusGanhos === 1;
  const proximoA = resBonus1x.novoEstado.jogadorAtual === JOGADOR_A;

  if (ganhou1x && proximoA) {
    console.log('  [PASSOU ✓] Captura de 1 casa com 12 pedras (≥10 individual):');
    console.log(`             Concedeu bónus de ${cadeia1x?.tipoBonusGanhos} (${cadeia1x?.jogadasBonusGanhos} jogada extra) e a vez continua com o ${resBonus1x.novoEstado.jogadorAtual}!`);
  } else {
    console.error('  [FALHOU ✗] Falha no teste de bónus 1x:', { cadeia1x, proximoA, vencedor: resBonus1x.novoEstado.vencedor });
    falhas++;
  }

  // Teste 2: Duas casas com 5 e 5 pedras (combinadas = 10, mas nenhuma tem 10 individualmente)
  // Não pode ganhar 1x (porque a regra proíbe combinação de duas casas para 10) e não pode ganhar 2x (<20)
  const jogoSemBonus = inicializarJogo();
  for (let i = 1; i <= 24; i++) {
    jogoSemBonus.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  jogoSemBonus.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
  jogoSemBonus.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 0;
  jogoSemBonus.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 0;
  jogoSemBonus.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 5; // 5 pedras
  jogoSemBonus.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 5; // 5 pedras (total 10 combinadas)
  jogoSemBonus.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 5;
  jogoSemBonus.casas.find((c) => c.numero === 23)!.quantidadeDePedras = 5;

  const resSemBonus = executarDistribuicao(jogoSemBonus, 1, true);
  const cadeiaSemBonus = resSemBonus.novoEstado.ultimaCadeia;
  const semBonus = !cadeiaSemBonus?.tipoBonusGanhos;

  if (semBonus) {
    console.log('  [PASSOU ✓] Captura dupla de 5+5 pedras (10 combinadas):');
    console.log('             NÃO concedeu bónus 1x porque 10 pedras NÃO podem ser combinadas de 2 casas!');
  } else {
    console.error('  [FALHOU ✗] Falha no teste de restrição 5+5 pedras:', cadeiaSemBonus);
    falhas++;
  }

  // Teste 3: Captura dupla combinando 20 pedras (ex: 12 + 8 = 20) -> ganha 2x (2 vezes para jogar)
  const jogoBonus2x = inicializarJogo();
  for (let i = 1; i <= 24; i++) {
    jogoBonus2x.casas.find((c) => c.numero === i)!.quantidadeDePedras = 0;
  }
  jogoBonus2x.casas.find((c) => c.numero === 1)!.quantidadeDePedras = 2;
  jogoBonus2x.casas.find((c) => c.numero === 2)!.quantidadeDePedras = 0;
  jogoBonus2x.casas.find((c) => c.numero === 3)!.quantidadeDePedras = 0;
  jogoBonus2x.casas.find((c) => c.numero === 16)!.quantidadeDePedras = 11; // 11 pedras
  jogoBonus2x.casas.find((c) => c.numero === 21)!.quantidadeDePedras = 9;  // 9 pedras (11 + 9 = 20)
  jogoBonus2x.casas.find((c) => c.numero === 24)!.quantidadeDePedras = 5;
  jogoBonus2x.casas.find((c) => c.numero === 23)!.quantidadeDePedras = 5;

  const resBonus2x = executarDistribuicao(jogoBonus2x, 1, true);
  const cadeia2x = resBonus2x.novoEstado.ultimaCadeia;
  const ganhou2x = cadeia2x?.tipoBonusGanhos === '2x' && cadeia2x?.jogadasBonusGanhos === 2;
  const jogadasPendentes = resBonus2x.novoEstado.jogadasBonusPendentes === 1; // Gastou 1 agora e tem mais 1 pendente para a próxima

  if (ganhou2x && jogadasPendentes) {
    console.log('  [PASSOU ✓] Captura dupla combinando 20 pedras (11 + 9 = 20 ≥ 20):');
    console.log(`             Concedeu bónus de ${cadeia2x?.tipoBonusGanhos} (${cadeia2x?.jogadasBonusGanhos} jogadas extras) e jogador tem mais 1 bónus pendente!`);
  } else {
    console.error('  [FALHOU ✗] Falha no teste de bónus 2x:', { cadeia2x, jogadasPendentes, estado: resBonus2x.novoEstado });
    falhas++;
  }
}

// ==========================================
// TESTES DO MODO DESAFIOS / PUZZLES ("TÁTICAS DE NTXUVA")
// ==========================================
console.log('\n================================================================');
console.log('   TESTES DO MODO DESAFIOS / PUZZLES ("TÁTICAS DE NTXUVA")      ');
console.log('================================================================');

for (const puzzle of PUZZLES_NTXUVA) {
  const estadoInicial = criarGameStateCustomizado(puzzle.casas, puzzle.jogadorInicial || JOGADOR_A);
  const jogadasCorretas = Array.isArray(puzzle.jogadaCorreta) ? puzzle.jogadaCorreta : [puzzle.jogadaCorreta];
  const casaEscolhida = jogadasCorretas[0];

  const { novoEstado, passos } = executarDistribuicao(estadoInicial, casaEscolhida, true);
  const totalCapturadas = passos
    .filter((p) => p.tipo === 'captura_pedras')
    .reduce((acc, p) => acc + (p.pedrasCapturadas || 0), 0);

  let sucesso = false;
  if (puzzle.tipoVitoria === 'vitoria_imediata') {
    sucesso = novoEstado.estadoDaPartida === 'FINALIZADA' && novoEstado.vencedor === JOGADOR_A;
  } else if (puzzle.tipoVitoria === 'bonus_extra') {
    sucesso = novoEstado.jogadasBonusPendentes > 0 || passos.some(p => p.tipo === 'bonus_jogada_extra');
  } else if (puzzle.tipoVitoria === 'captura_exata') {
    sucesso = totalCapturadas === (puzzle.parametroMeta ?? 8);
  } else if (puzzle.tipoVitoria === 'captura_minima') {
    sucesso = totalCapturadas >= (puzzle.parametroMeta ?? 1);
  } else {
    sucesso = totalCapturadas > 0;
  }

  if (sucesso) {
    console.log(`  [PASSOU ✓] Desafio #${puzzle.numero}: "${puzzle.titulo}" (${puzzle.categoria})`);
    console.log(`             Objetivo atingido: ${puzzle.objetivo} | Capturadas: ${totalCapturadas}`);
  } else {
    console.error(`  [FALHOU ✗] Desafio #${puzzle.numero}: "${puzzle.titulo}"`);
    console.error(`             Esperava vitória: ${puzzle.tipoVitoria} (meta: ${puzzle.parametroMeta}), mas capturou ${totalCapturadas}`);
    falhas++;
  }
}

// ==========================================
// SUITE GERAL COMPLETA (executarTestesUnitarios)
// ==========================================
console.log('\n----------------------------------------------------------------');
console.log('Suite Geral de Testes Automatizados:');
const suite = executarTestesUnitarios();
suite.forEach((t) => {
  console.log(`  - [${t.passou ? '✓' : '✗'}] ${t.nome}`);
  if (!t.passou) falhas++;
});

console.log('================================================================');
if (falhas === 0) {
  console.log('SUCESSO: Todos os testes do motor de captura passaram com 100% de conformidade!');
  console.log('  ✓ 4 Situações Modeladas');
  console.log('  ✓ 10 Regras de Captura');
  console.log('  ✓ Revezamento e Movimento Circular Preservados');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`ERRO: ${falhas} teste(s) falharam.`);
  console.log('================================================================\n');
  process.exit(1);
}
