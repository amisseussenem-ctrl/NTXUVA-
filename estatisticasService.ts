export interface EstatisticasJogador {
  // Partidas totais e resultados
  partidasTotais: number;
  
  // Modo Local
  vitoriasLocal: number;
  derrotasLocal: number;
  
  // Modo Contra IA
  vitoriasIA: number;
  derrotasIA: number;
  vitoriasIAMestreKota: number;
  
  // Modo Online
  vitoriasOnline: number;
  derrotasOnline: number;
  
  empatesTotais: number;
  
  // Capturas e recordes
  maiorCapturaUnica: number;
  dataMaiorCaptura?: string;
  modoMaiorCaptura?: string;
  totalPedrasCapturadas: number;
  totalJogadasFeitas: number;
  
  // Regras tradicionais especiais
  totalBonus1x: number;
  totalBonus2x: number;
  vitoriasPorAsfixia: number;
  
  // Sequência de vitórias
  sequenciaVitoriasAtual: number;
  recordeSequenciaVitorias: number;
  
  // Puzzles / Táticas
  puzzlesConcluidosTotal: number;
  
  // Conquistas desbloqueadas (id -> data ISO)
  conquistasDesbloqueadas: Record<string, string>;
}

export type CategoriaConquista = 'vitorias' | 'capturas' | 'taticas' | 'mestria';

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string; // nome do ícone/emoji representativo
  categoria: CategoriaConquista;
  pontos: number;
  meta: number;
  calcularProgresso: (stats: EstatisticasJogador) => number;
  verificarDesbloqueio: (stats: EstatisticasJogador) => boolean;
}

export const STORAGE_STATS_KEY = 'ntxuva_estatisticas_jogador_v1';

export const ESTATISTICAS_INICIAIS: EstatisticasJogador = {
  partidasTotais: 0,
  vitoriasLocal: 0,
  derrotasLocal: 0,
  vitoriasIA: 0,
  derrotasIA: 0,
  vitoriasIAMestreKota: 0,
  vitoriasOnline: 0,
  derrotasOnline: 0,
  empatesTotais: 0,
  maiorCapturaUnica: 0,
  totalPedrasCapturadas: 0,
  totalJogadasFeitas: 0,
  totalBonus1x: 0,
  totalBonus2x: 0,
  vitoriasPorAsfixia: 0,
  sequenciaVitoriasAtual: 0,
  recordeSequenciaVitorias: 0,
  puzzlesConcluidosTotal: 0,
  conquistasDesbloqueadas: {},
};

export const LISTA_CONQUISTAS: Conquista[] = [
  // 1. PRIMEIRA VITÓRIA (solicitada)
  {
    id: 'primeira_vitoria',
    titulo: 'Primeira Vitória',
    descricao: 'Conquiste a sua primeira vitória em qualquer modo de jogo.',
    icone: '🏆',
    categoria: 'vitorias',
    pontos: 10,
    meta: 1,
    calcularProgresso: (s) => (s.vitoriasLocal + s.vitoriasIA + s.vitoriasOnline),
    verificarDesbloqueio: (s) => (s.vitoriasLocal + s.vitoriasIA + s.vitoriasOnline) >= 1,
  },

  // 2. MESTRE DA ASFIXIA (solicitada)
  {
    id: 'mestre_da_asfixia',
    titulo: 'Mestre da Asfixia',
    descricao: 'Vença uma partida deixando o adversário afogado apenas com covas de 1 pedra.',
    icone: '🛑',
    categoria: 'mestria',
    pontos: 25,
    meta: 1,
    calcularProgresso: (s) => s.vitoriasPorAsfixia,
    verificarDesbloqueio: (s) => s.vitoriasPorAsfixia >= 1,
  },

  // 3. GOLEADA DE PEDRAS (solicitada)
  {
    id: 'goleada_de_pedras',
    titulo: 'Goleada de Pedras',
    descricao: 'Realize uma captura devastadora de 8 ou mais pedras numa única jogada!',
    icone: '🎯',
    categoria: 'capturas',
    pontos: 20,
    meta: 8,
    calcularProgresso: (s) => s.maiorCapturaUnica,
    verificarDesbloqueio: (s) => s.maiorCapturaUnica >= 8,
  },

  // 4. BANQUETE REAL
  {
    id: 'banquete_real',
    titulo: 'Banquete Real',
    descricao: 'Capture 12 ou mais pedras numa única jogada espetacular!',
    icone: '👑',
    categoria: 'capturas',
    pontos: 30,
    meta: 12,
    calcularProgresso: (s) => s.maiorCapturaUnica,
    verificarDesbloqueio: (s) => s.maiorCapturaUnica >= 12,
  },

  // 5. SUPER GOLPE DE 20 PEDRAS
  {
    id: 'super_golpe_20',
    titulo: 'Glória de 20 Pedras',
    descricao: 'Capture 20 ou mais pedras numa única jogada e ative o raro Bónus 2x!',
    icone: '⚡',
    categoria: 'capturas',
    pontos: 50,
    meta: 20,
    calcularProgresso: (s) => s.maiorCapturaUnica,
    verificarDesbloqueio: (s) => s.maiorCapturaUnica >= 20 || s.totalBonus2x >= 1,
  },

  // 6. BÓNUS RELÂMPAGO (1x)
  {
    id: 'bonus_relampago',
    titulo: 'Bónus Relâmpago',
    descricao: 'Capture uma cova com 10 ou mais pedras e ative o Bónus de 1 Jogada Extra.',
    icone: '🔥',
    categoria: 'mestria',
    pontos: 20,
    meta: 1,
    calcularProgresso: (s) => s.totalBonus1x,
    verificarDesbloqueio: (s) => s.totalBonus1x >= 1,
  },

  // 7. CAÇADOR DE IA
  {
    id: 'cacador_de_ia',
    titulo: 'Derrubador de Mestres',
    descricao: 'Derrote a inteligência artificial na dificuldade máxima Mestre Kota.',
    icone: '🧠',
    categoria: 'vitorias',
    pontos: 35,
    meta: 1,
    calcularProgresso: (s) => s.vitoriasIAMestreKota,
    verificarDesbloqueio: (s) => s.vitoriasIAMestreKota >= 1,
  },

  // 8. GUERREIRO DA REDE
  {
    id: 'guerreiro_da_rede',
    titulo: 'Guerreiro Online',
    descricao: 'Vença a sua primeira partida online contra outro jogador em tempo real.',
    icone: '🌐',
    categoria: 'vitorias',
    pontos: 30,
    meta: 1,
    calcularProgresso: (s) => s.vitoriasOnline,
    verificarDesbloqueio: (s) => s.vitoriasOnline >= 1,
  },

  // 9. ESTRATEGISTA DE TÁTICAS
  {
    id: 'estrategista_taticas',
    titulo: 'Estrategista de Táticas',
    descricao: 'Resolva pelo menos 5 quebra-cabeças no Modo Desafios de Ntxuva.',
    icone: '💡',
    categoria: 'taticas',
    pontos: 25,
    meta: 5,
    calcularProgresso: (s) => s.puzzlesConcluidosTotal,
    verificarDesbloqueio: (s) => s.puzzlesConcluidosTotal >= 5,
  },

  // 10. GRANDE MESTRE DO NTXUVA
  {
    id: 'grande_mestre_puzzles',
    titulo: 'Grande Mestre do Ntxuva',
    descricao: 'Conclua todos os 10 quebra-cabeças táticos disponíveis com perfeição!',
    icone: '🌟',
    categoria: 'taticas',
    pontos: 50,
    meta: 10,
    calcularProgresso: (s) => s.puzzlesConcluidosTotal,
    verificarDesbloqueio: (s) => s.puzzlesConcluidosTotal >= 10,
  },

  // 11. CAMINHO DA MAESTRIA (10 Vitórias)
  {
    id: 'caminho_da_maestria',
    titulo: 'Caminho da Maestria',
    descricao: 'Acumule 10 vitórias na sua carreira geral de jogador de NTXUVA.',
    icone: '🎖️',
    categoria: 'vitorias',
    pontos: 40,
    meta: 10,
    calcularProgresso: (s) => (s.vitoriasLocal + s.vitoriasIA + s.vitoriasOnline),
    verificarDesbloqueio: (s) => (s.vitoriasLocal + s.vitoriasIA + s.vitoriasOnline) >= 10,
  },

  // 12. IMPARÁVEL (Sequência de 3 vitórias seguidas)
  {
    id: 'imparavel',
    titulo: 'Imparável',
    descricao: 'Alcance uma sequência de 3 vitórias consecutivas sem derrotas.',
    icone: '🚀',
    categoria: 'mestria',
    pontos: 35,
    meta: 3,
    calcularProgresso: (s) => s.recordeSequenciaVitorias,
    verificarDesbloqueio: (s) => s.recordeSequenciaVitorias >= 3,
  },
];

class EstatisticasService {
  private cache: EstatisticasJogador | null = null;

  public carregar(): EstatisticasJogador {
    if (this.cache) return this.cache;

    try {
      const salvo = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_STATS_KEY) : null;
      if (salvo) {
        const parsed = JSON.parse(salvo);
        this.cache = { ...ESTATISTICAS_INICIAIS, ...parsed };
        return this.cache;
      }
    } catch {
      // Ignorar erro de leitura e usar inicial
    }

    this.cache = { ...ESTATISTICAS_INICIAIS };
    return this.cache;
  }

  public salvar(stats: EstatisticasJogador): void {
    this.cache = stats;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
      }
    } catch {
      // Ignorar erro de gravação
    }
  }

  /**
   * Avalia a lista de conquistas e desbloqueia as que cumpriram seus critérios
   */
  private verificarNovasConquistas(stats: EstatisticasJogador): Conquista[] {
    const novas: Conquista[] = [];
    const agora = new Date().toISOString();

    for (const c of LISTA_CONQUISTAS) {
      if (!stats.conquistasDesbloqueadas[c.id]) {
        if (c.verificarDesbloqueio(stats)) {
          stats.conquistasDesbloqueadas[c.id] = agora;
          novas.push(c);
        }
      }
    }

    return novas;
  }

  /**
   * Registra uma jogada realizada e captura de pedras
   */
  public registrarJogadaECaptura(
    pedrasCapturadas: number,
    modo: 'local' | 'ia' | 'online',
    bonusTipo?: '1x' | '2x'
  ): { stats: EstatisticasJogador; novasConquistas: Conquista[] } {
    const stats = { ...this.carregar() };
    stats.totalJogadasFeitas += 1;

    if (pedrasCapturadas > 0) {
      stats.totalPedrasCapturadas += pedrasCapturadas;

      if (pedrasCapturadas > stats.maiorCapturaUnica) {
        stats.maiorCapturaUnica = pedrasCapturadas;
        stats.dataMaiorCaptura = new Date().toLocaleDateString('pt-PT');
        stats.modoMaiorCaptura = modo;
      }
    }

    if (bonusTipo === '1x') {
      stats.totalBonus1x += 1;
    } else if (bonusTipo === '2x') {
      stats.totalBonus2x += 1;
    }

    const novasConquistas = this.verificarNovasConquistas(stats);
    this.salvar(stats);

    return { stats, novasConquistas };
  }

  /**
   * Registra o desfecho de vitória de uma partida
   */
  public registrarVitoria(
    modo: 'local' | 'ia' | 'online',
    tipoVitoria?: string,
    dificuldadeIA?: string
  ): { stats: EstatisticasJogador; novasConquistas: Conquista[] } {
    const stats = { ...this.carregar() };
    stats.partidasTotais += 1;

    if (modo === 'local') {
      stats.vitoriasLocal += 1;
    } else if (modo === 'ia') {
      stats.vitoriasIA += 1;
      if (dificuldadeIA === 'mestre') {
        stats.vitoriasIAMestreKota += 1;
      }
    } else if (modo === 'online') {
      stats.vitoriasOnline += 1;
    }

    if (tipoVitoria === 'asfixia') {
      stats.vitoriasPorAsfixia += 1;
    }

    // Atualiza sequência de vitórias
    stats.sequenciaVitoriasAtual += 1;
    if (stats.sequenciaVitoriasAtual > stats.recordeSequenciaVitorias) {
      stats.recordeSequenciaVitorias = stats.sequenciaVitoriasAtual;
    }

    const novasConquistas = this.verificarNovasConquistas(stats);
    this.salvar(stats);

    return { stats, novasConquistas };
  }

  /**
   * Registra derrota em partida (reseta sequência de vitórias atual)
   */
  public registrarDerrota(
    modo: 'local' | 'ia' | 'online'
  ): { stats: EstatisticasJogador; novasConquistas: Conquista[] } {
    const stats = { ...this.carregar() };
    stats.partidasTotais += 1;

    if (modo === 'local') {
      stats.derrotasLocal += 1;
    } else if (modo === 'ia') {
      stats.derrotasIA += 1;
    } else if (modo === 'online') {
      stats.derrotasOnline += 1;
    }

    // Quebra sequência de vitórias
    stats.sequenciaVitoriasAtual = 0;

    const novasConquistas = this.verificarNovasConquistas(stats);
    this.salvar(stats);

    return { stats, novasConquistas };
  }

  /**
   * Registra empate
   */
  public registrarEmpate(): { stats: EstatisticasJogador; novasConquistas: Conquista[] } {
    const stats = { ...this.carregar() };
    stats.partidasTotais += 1;
    stats.empatesTotais += 1;
    stats.sequenciaVitoriasAtual = 0;

    const novasConquistas = this.verificarNovasConquistas(stats);
    this.salvar(stats);

    return { stats, novasConquistas };
  }

  /**
   * Sincroniza a quantidade de puzzles concluídos pelo jogador
   */
  public sincronizarPuzzlesConcluidos(
    totalPuzzles: number
  ): { stats: EstatisticasJogador; novasConquistas: Conquista[] } {
    const stats = { ...this.carregar() };
    if (stats.puzzlesConcluidosTotal !== totalPuzzles) {
      stats.puzzlesConcluidosTotal = totalPuzzles;
      const novasConquistas = this.verificarNovasConquistas(stats);
      this.salvar(stats);
      return { stats, novasConquistas };
    }
    return { stats, novasConquistas: [] };
  }

  /**
   * Redefine todas as estatísticas para os valores padrão com segurança
   */
  public redefinir(): EstatisticasJogador {
    this.cache = { ...ESTATISTICAS_INICIAIS };
    this.salvar(this.cache);
    return this.cache;
  }
}

export const estatisticasService = new EstatisticasService();
