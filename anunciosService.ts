import { CampanhaAnuncio, ConfiguracaoAnuncios, EstatisticasAnuncios, TipoAnuncio } from '../types/anuncios';

const STORAGE_CONFIG_KEY = 'ntxuva_config_anuncios_v2';
const STORAGE_STATS_KEY = 'ntxuva_stats_anuncios_v2';
const STORAGE_PARTIDAS_CONCLUIDAS_KEY = 'ntxuva_partidas_anuncio_v2';
const STORAGE_SALDO_MOEDAS_KEY = 'ntxuva_saldo_moedas_v2';
const STORAGE_DATA_ESGOTADO_KEY = 'ntxuva_moedas_esgotado_em_v2';

// Regras Oficiais da Economia de Moedas do NTXUVA
export const CUSTO_PARTIDA_MOEDAS = 25;
export const SALDO_INICIAL_MOEDAS = 500; // Saldo de boas-vindas / instalação
export const MAXIMO_MOEDAS = 1000; // Limite máximo de acumulação
export const REPOSICAO_24H_MOEDAS = 500; // Recarga diária de 500 moedas
export const TEMPO_REPOSICAO_24H_MS = 24 * 60 * 60 * 1000; // 24 horas

export function formatarTempoRestante(ms: number): string {
  if (ms <= 0) return 'Disponível agora';
  const horas = Math.floor(ms / (1000 * 60 * 60));
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((ms % (1000 * 60)) / 1000);
  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  }
  if (minutos > 0) {
    return `${minutos}m ${segundos}s`;
  }
  return `${segundos}s`;
}

// IDs Oficiais de Teste do Google AdMob / AdSense
export const GOOGLE_ADMOB_TEST_IDS = {
  publisherId: 'ca-pub-3940256099942544',
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

export const CONFIGURACAO_PADRAO: ConfiguracaoAnuncios = {
  habilitado: true,
  modoTeste: true,
  frequenciaIntersticialPartidas: 2, // Exibe anúncio intersticial a cada 2 partidas concluídas
  recompensaMoedasVideo: 250,
  adMobPublisherId: GOOGLE_ADMOB_TEST_IDS.publisherId,
  adMobBannerId: GOOGLE_ADMOB_TEST_IDS.banner,
  adMobInterstitialId: GOOGLE_ADMOB_TEST_IDS.interstitial,
  adMobRewardedId: GOOGLE_ADMOB_TEST_IDS.rewarded,
  exibirBannerMenu: true,
  exibirBannerJogo: true,
};

export const ESTATISTICAS_PADRAO: EstatisticasAnuncios = {
  totalBannersExibidos: 0,
  totalIntersticiaisExibidos: 0,
  totalRecompensadosAssistidos: 0,
  totalMoedasRecompensadas: 0,
  dataUltimaExibicao: null,
};

// Campanhas nativas com temática moçambicana e africana de alto engajamento
export const CAMPANHAS_DEMO: CampanhaAnuncio[] = [
  {
    id: 'artesanato_mocambique',
    titulo: 'Tabuleiros Artesanais de Ntxuva em Madeira Nativa',
    anunciante: 'Mestres da Marracuene',
    descricao: 'Peças entalhadas à mão em madeira de pau-rosa e sândalo com seixos naturais polidos de Moçambique.',
    categoria: 'Cultura & Artesanato',
    ctaTexto: 'Ver Coleção',
    urlDestino: 'https://pt.wikipedia.org/wiki/Mancala',
    badge: 'Feito em Moçambique',
    iconeEmoji: '🪵',
    gradienteCor: 'from-amber-700 to-amber-950',
  },
  {
    id: 'torneio_nacional_ntxuva',
    titulo: 'Grande Campeonato Moçambicano de Ntxuva 2026',
    anunciante: 'Federação Moçambicana de Jogos Tradicionais',
    descricao: 'Inscreva a sua equipa no torneio de Maputo, Beira e Nampula. Prémios para os melhores mestres!',
    categoria: 'Torneios & Desporto',
    ctaTexto: 'Inscrever-se',
    urlDestino: '#',
    badge: 'Torneio Oficial',
    iconeEmoji: '🏆',
    gradienteCor: 'from-yellow-600 to-amber-800',
  },
  {
    id: 'turismo_inhambane',
    titulo: 'Descubra as Praias de Tofo e Bazaruto',
    anunciante: 'Turismo de Moçambique',
    descricao: 'Mergulho com tubarões-baleia, passeios de dhow ao pôr-do-sol e a rica música da Timbila Chopi em Zavala.',
    categoria: 'Viagens & Turismo',
    ctaTexto: 'Explorar Destinos',
    urlDestino: '#',
    badge: 'Turismo MZ',
    iconeEmoji: '🏝️',
    gradienteCor: 'from-cyan-700 to-teal-900',
  },
  {
    id: 'jogos_africanos',
    titulo: 'Clube dos Mestres de Jogos Tradicionais de África',
    anunciante: 'Património Cultural Africano',
    descricao: 'Aprenda Mancala, Ntxuva, Morabaraba e Bao com os grandes mestres africanos.',
    categoria: 'Jogos & Cultura',
    ctaTexto: 'Participar Grátis',
    urlDestino: '#',
    badge: 'Cultura & Jogos',
    iconeEmoji: '🏺',
    gradienteCor: 'from-amber-600 to-stone-900',
  },
  {
    id: 'energia_solar_moz',
    titulo: 'Sistemas Solares Residenciais em Moçambique',
    anunciante: 'EcoEnergia África',
    descricao: 'Energia limpa e luz 24h para sua casa ou comércio com painéis solares modernos e garantia.',
    categoria: 'Sustentabilidade',
    ctaTexto: 'Simular Orçamento',
    urlDestino: '#',
    badge: 'Energia Verde',
    iconeEmoji: '☀️',
    gradienteCor: 'from-emerald-700 to-green-950',
  },
];

class AnunciosService {
  private config: ConfiguracaoAnuncios;
  private stats: EstatisticasAnuncios;
  private ouvintes: Array<(config: ConfiguracaoAnuncios) => void> = [];
  private ouvintesMoedas: Array<(saldo: number) => void> = [];

  constructor() {
    this.config = this.carregarConfiguracao();
    this.stats = this.carregarEstatisticas();
  }

  public carregarConfiguracao(): ConfiguracaoAnuncios {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const salvo = localStorage.getItem(STORAGE_CONFIG_KEY);
        if (salvo) {
          return { ...CONFIGURACAO_PADRAO, ...JSON.parse(salvo) };
        }
      }
    } catch {
      // Fallback gracioso
    }
    return { ...CONFIGURACAO_PADRAO };
  }

  public carregarEstatisticas(): EstatisticasAnuncios {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const salvo = localStorage.getItem(STORAGE_STATS_KEY);
        if (salvo) {
          return { ...ESTATISTICAS_PADRAO, ...JSON.parse(salvo) };
        }
      }
    } catch {
      // Fallback
    }
    return { ...ESTATISTICAS_PADRAO };
  }

  public obterConfiguracao(): ConfiguracaoAnuncios {
    return { ...this.config };
  }

  public obterEstatisticas(): EstatisticasAnuncios {
    return { ...this.stats };
  }

  public salvarConfiguracao(novaConfig: Partial<ConfiguracaoAnuncios>): ConfiguracaoAnuncios {
    this.config = { ...this.config, ...novaConfig };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
      }
    } catch (e) {
      console.error('Erro ao salvar configuração de anúncios:', e);
    }
    this.notificarOuvintes();
    return this.obterConfiguracao();
  }

  public restaurarPadrao(): ConfiguracaoAnuncios {
    this.config = { ...CONFIGURACAO_PADRAO };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
      }
    } catch {}
    this.notificarOuvintes();
    return this.obterConfiguracao();
  }

  public registrarExibicao(tipo: TipoAnuncio): void {
    if (!this.config.habilitado) return;

    if (tipo === 'banner') {
      this.stats.totalBannersExibidos += 1;
    } else if (tipo === 'intersticial') {
      this.stats.totalIntersticiaisExibidos += 1;
    } else if (tipo === 'recompensado') {
      this.stats.totalRecompensadosAssistidos += 1;
      this.stats.totalMoedasRecompensadas += this.config.recompensaMoedasVideo;
    }
    this.stats.dataUltimaExibicao = new Date().toISOString();

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(this.stats));
      }
    } catch {}
  }

  /**
   * Registra conclusão de partida. Retorna TRUE se atingiu a frequência para exibir anúncio intersticial.
   */
  public registrarFimDePartida(): boolean {
    if (!this.config.habilitado) return false;

    let contador = 0;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        contador = parseInt(localStorage.getItem(STORAGE_PARTIDAS_CONCLUIDAS_KEY) || '0', 10);
      }
    } catch {}

    contador += 1;

    const frequencia = Math.max(1, this.config.frequenciaIntersticialPartidas);
    const deveExibir = contador % frequencia === 0;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_PARTIDAS_CONCLUIDAS_KEY, contador.toString());
      }
    } catch {}

    return deveExibir;
  }

  public obterSaldoMoedas(): number {
    let saldo = SALDO_INICIAL_MOEDAS;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const salvo = localStorage.getItem(STORAGE_SALDO_MOEDAS_KEY);
        if (salvo !== null) {
          saldo = parseInt(salvo, 10);
        } else {
          // Quando o jogo é instalado/aberto pela primeira vez, ganha cerca de 500 moedas
          localStorage.setItem(STORAGE_SALDO_MOEDAS_KEY, SALDO_INICIAL_MOEDAS.toString());
          saldo = SALDO_INICIAL_MOEDAS;
        }
      }
    } catch {}

    if (isNaN(saldo)) saldo = SALDO_INICIAL_MOEDAS;

    // Respeita o limite máximo de acumulação de até 1000 moedas
    if (saldo > MAXIMO_MOEDAS) {
      saldo = MAXIMO_MOEDAS;
      this.salvarSaldo(saldo);
    }

    // Regra: após passar 24h depois de esgotado o crédito (< 25 moedas), repõe-se as 500 moedas
    if (saldo < CUSTO_PARTIDA_MOEDAS) {
      const esgotadoEm = this.obterDataEsgotado();
      const agora = Date.now();
      if (!esgotadoEm) {
        this.salvarDataEsgotado(agora);
      } else if (agora - esgotadoEm >= TEMPO_REPOSICAO_24H_MS) {
        // Passaram-se 24 horas completas! Repor 500 moedas
        saldo = Math.min(MAXIMO_MOEDAS, saldo + REPOSICAO_24H_MOEDAS);
        this.salvarSaldo(saldo);
        this.salvarDataEsgotado(null);
        this.notificarOuvintesMoedas(saldo);
      }
    } else {
      // Crédito não está esgotado
      if (this.obterDataEsgotado() !== null) {
        this.salvarDataEsgotado(null);
      }
    }

    return saldo;
  }

  public obterDataEsgotado(): number | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const salvo = localStorage.getItem(STORAGE_DATA_ESGOTADO_KEY);
        if (salvo) {
          const num = parseInt(salvo, 10);
          return isNaN(num) ? null : num;
        }
      }
    } catch {}
    return null;
  }

  public salvarDataEsgotado(timestamp: number | null): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (timestamp === null) {
          localStorage.removeItem(STORAGE_DATA_ESGOTADO_KEY);
        } else {
          localStorage.setItem(STORAGE_DATA_ESGOTADO_KEY, timestamp.toString());
        }
      }
    } catch {}
  }

  public obterTempoRestanteReposicaoMs(): number | null {
    const saldo = this.obterSaldoMoedas();
    if (saldo >= CUSTO_PARTIDA_MOEDAS) return null;

    const esgotadoEm = this.obterDataEsgotado();
    if (!esgotadoEm) return TEMPO_REPOSICAO_24H_MS;

    const decorrido = Date.now() - esgotadoEm;
    const restante = Math.max(0, TEMPO_REPOSICAO_24H_MS - decorrido);
    return restante;
  }

  public salvarSaldo(novoSaldo: number): void {
    const valor = Math.min(MAXIMO_MOEDAS, Math.max(0, novoSaldo));
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_SALDO_MOEDAS_KEY, valor.toString());
      }
    } catch {}
  }

  public adicionarMoedas(quantidade: number): number {
    const atual = this.obterSaldoMoedas();
    // Máximo de acumulação de até 1000 moedas
    const novo = Math.min(MAXIMO_MOEDAS, atual + quantidade);
    this.salvarSaldo(novo);
    if (novo >= CUSTO_PARTIDA_MOEDAS) {
      this.salvarDataEsgotado(null);
    }
    this.notificarOuvintesMoedas(novo);
    return novo;
  }

  /**
   * Consome 25 moedas para iniciar uma partida.
   * Não abrange partidas online (modo 'online' é gratuito e não consome moedas).
   */
  public consumirMoedasParaPartida(modoJogo: 'local' | 'ia' | 'online'): {
    sucesso: boolean;
    novoSaldo: number;
    motivo?: string;
  } {
    if (modoJogo === 'online') {
      return { sucesso: true, novoSaldo: this.obterSaldoMoedas() };
    }

    const saldo = this.obterSaldoMoedas();
    if (saldo < CUSTO_PARTIDA_MOEDAS) {
      if (!this.obterDataEsgotado()) {
        this.salvarDataEsgotado(Date.now());
      }
      return {
        sucesso: false,
        novoSaldo: saldo,
        motivo: `Moedas insuficientes. Cada partida consome ${CUSTO_PARTIDA_MOEDAS} moedas. Seu saldo é de ${saldo} moedas.`,
      };
    }

    const novo = saldo - CUSTO_PARTIDA_MOEDAS;
    this.salvarSaldo(novo);
    if (novo < CUSTO_PARTIDA_MOEDAS) {
      this.salvarDataEsgotado(Date.now());
    }
    this.notificarOuvintesMoedas(novo);
    return { sucesso: true, novoSaldo: novo };
  }

  public podeIniciarPartida(modoJogo: 'local' | 'ia' | 'online'): {
    permitido: boolean;
    saldo: number;
    custo: number;
  } {
    if (modoJogo === 'online') {
      return { permitido: true, saldo: this.obterSaldoMoedas(), custo: 0 };
    }
    const saldo = this.obterSaldoMoedas();
    return {
      permitido: saldo >= CUSTO_PARTIDA_MOEDAS,
      saldo,
      custo: CUSTO_PARTIDA_MOEDAS,
    };
  }

  public subscreverMoedas(callback: (saldo: number) => void): () => void {
    this.ouvintesMoedas.push(callback);
    return () => {
      this.ouvintesMoedas = this.ouvintesMoedas.filter((cb) => cb !== callback);
    };
  }

  private notificarOuvintesMoedas(saldo: number): void {
    for (const callback of this.ouvintesMoedas) {
      try {
        callback(saldo);
      } catch (err) {
        console.error('Erro em ouvinte de moedas:', err);
      }
    }
  }

  public obterCampanhaAleatoria(excluirId?: string): CampanhaAnuncio {
    const disponiveis = CAMPANHAS_DEMO.filter((c) => c.id !== excluirId);
    if (disponiveis.length === 0) return CAMPANHAS_DEMO[0];
    const index = Math.floor(Math.random() * disponiveis.length);
    return disponiveis[index];
  }

  public subscrever(callback: (config: ConfiguracaoAnuncios) => void): () => void {
    this.ouvintes.push(callback);
    return () => {
      this.ouvintes = this.ouvintes.filter((cb) => cb !== callback);
    };
  }

  private notificarOuvintes(): void {
    for (const callback of this.ouvintes) {
      try {
        callback(this.obterConfiguracao());
      } catch (err) {
        console.error('Erro em ouvinte de anúncios:', err);
      }
    }
  }
}

export const anunciosService = new AnunciosService();
