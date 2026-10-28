/**
 * Efeitos sonoros e ambientação musical tradicional moçambicana (Timbila Chopi & Tômbola)
 * Desenvolvido usando Web Audio API nativo.
 * Sem dependências externas, latência zero, seguro para iframes e offline-first.
 */

// Escala tradicional da Timbila Chopi (Zavala / Inhambane) aproximada em Hz
export const ESCALA_TIMBILA_CHOPI: number[] = [
  293.66, // D4
  329.63, // E4
  369.99, // F#4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  554.37, // C#5
  587.33, // D5
  659.25, // E5
  739.99, // F#5
  880.00  // A5
];

/**
 * Sequência rítmica e melódica do tema clássico de abertura TVM (Timbila Chopi)
 * Inspirada na vinheta histórica e tradicional da Televisão de Moçambique
 */
export const NOTAS_TVM_VIGNETTE: Array<{ freq: number; dur: number }> = [
  // Frase 1: Toque clássico inicial da Timbila TVM
  { freq: 293.66, dur: 0.16 }, // D4
  { freq: 440.00, dur: 0.14 }, // A4
  { freq: 369.99, dur: 0.15 }, // F#4
  { freq: 587.33, dur: 0.18 }, // D5
  { freq: 554.37, dur: 0.14 }, // C#5
  { freq: 493.88, dur: 0.14 }, // B4
  { freq: 440.00, dur: 0.16 }, // A4
  { freq: 369.99, dur: 0.15 }, // F#4
  // Frase 2: Variação rítmica acelerando
  { freq: 329.63, dur: 0.14 }, // E4
  { freq: 440.00, dur: 0.14 }, // A4
  { freq: 587.33, dur: 0.16 }, // D5
  { freq: 659.25, dur: 0.16 }, // E5
  { freq: 739.99, dur: 0.18 }, // F#5
  { freq: 587.33, dur: 0.14 }, // D5
  { freq: 440.00, dur: 0.13 }, // A4
  { freq: 369.99, dur: 0.13 }, // F#4
  // Frase 3: Redobre acelerado em crescendo culminando na explosão
  { freq: 440.00, dur: 0.11 }, // A4
  { freq: 554.37, dur: 0.10 }, // C#5
  { freq: 587.33, dur: 0.10 }, // D5
  { freq: 739.99, dur: 0.09 }, // F#5
  { freq: 880.00, dur: 0.08 }, // A5
  { freq: 739.99, dur: 0.08 }, // F#5
  { freq: 587.33, dur: 0.08 }, // D5
  { freq: 880.00, dur: 0.07 }, // A5
];

export const STORAGE_MUSICA_TIMBILA_KEY = 'ntxuva_musica_timbila_habilitada_v1';

class NtxuvaSoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private timbilaMusicEnabled: boolean = false;
  private timbilaMusicTimer: any = null;
  private timbilaMusicGain: GainNode | null = null;
  private musicStep: number = 0;
  private lastStoneDropTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const salva = localStorage.getItem(STORAGE_MUSICA_TIMBILA_KEY);
        // Desligado por padrão para ser opcional e suave, mas pronto a ser ligado pelo utilizador
        this.timbilaMusicEnabled = salva === 'true';
      } catch {
        this.timbilaMusicEnabled = false;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled && !this.timbilaMusicEnabled) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.timbilaMusicEnabled) {
      this.stopTimbilaAmbientMusic();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public isTimbilaMusicEnabled(): boolean {
    return this.timbilaMusicEnabled;
  }

  public setTimbilaMusicEnabled(enabled: boolean) {
    this.timbilaMusicEnabled = enabled;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_MUSICA_TIMBILA_KEY, String(enabled));
      }
    } catch {}

    if (enabled) {
      this.startTimbilaAmbientMusic();
    } else {
      this.stopTimbilaAmbientMusic();
    }
  }

  public toggleTimbilaMusic(): boolean {
    const novoEstado = !this.timbilaMusicEnabled;
    this.setTimbilaMusicEnabled(novoEstado);
    return novoEstado;
  }

  /**
   * Síntese acústica autêntica de uma lâmina de madeira de Timbila Chopi (com ressonador de cabaça e panning)
   */
  public sintetizarNotaTimbila(
    ctx: AudioContext,
    freq: number,
    now: number,
    duracao: number = 0.45,
    volume: number = 0.22,
    destino?: AudioNode,
    pan: number = 0
  ) {
    let dest = destino || ctx.destination;

    if (pan !== 0 && typeof ctx.createStereoPanner === 'function') {
      try {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        panner.connect(dest);
        dest = panner;
      } catch {}
    }

    // 1. Golpe percussivo da baqueta de borracha (ataque de madeira)
    const oscMallet = ctx.createOscillator();
    const gainMallet = ctx.createGain();
    oscMallet.type = 'triangle';
    oscMallet.frequency.setValueAtTime(freq * 1.8, now);
    oscMallet.frequency.exponentialRampToValueAtTime(freq, now + 0.025);
    gainMallet.gain.setValueAtTime(volume * 0.9, now);
    gainMallet.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    oscMallet.connect(gainMallet);
    gainMallet.connect(dest);
    oscMallet.start(now);
    oscMallet.stop(now + 0.04);

    // 2. Fundamental doce e orgânica da lâmina de madeira
    const oscWood = ctx.createOscillator();
    const gainWood = ctx.createGain();
    oscWood.type = 'sine';
    oscWood.frequency.setValueAtTime(freq, now);
    gainWood.gain.setValueAtTime(volume, now);
    gainWood.gain.exponentialRampToValueAtTime(0.001, now + duracao);
    oscWood.connect(gainWood);
    gainWood.connect(dest);
    oscWood.start(now);
    oscWood.stop(now + duracao);

    // 3. Ressonador de Cabaça com membrana zumbidora tradicional (chizambi / m'were)
    const oscGourd = ctx.createOscillator();
    const gainGourd = ctx.createGain();
    oscGourd.type = 'triangle';
    oscGourd.frequency.setValueAtTime(freq * 2.01, now);
    gainGourd.gain.setValueAtTime(volume * 0.35, now);
    gainGourd.gain.exponentialRampToValueAtTime(0.001, now + (duracao * 0.7));
    oscGourd.connect(gainGourd);
    gainGourd.connect(dest);
    oscGourd.start(now);
    oscGourd.stop(now + duracao);
  }

  /**
   * Batida percussiva de tambor tradicional moçambicano (Tômbola / Batuque)
   */
  public sintetizarBatuqueTombola(
    ctx: AudioContext,
    now: number,
    freqBase: number = 90,
    volume: number = 0.28,
    destino?: AudioNode
  ) {
    const dest = destino || ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqBase * 1.7, now);
    osc.frequency.exponentialRampToValueAtTime(freqBase, now + 0.08);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Dispara a explosão multivocal de Timbila TVM onde o som se espalha em vários
   * canais estéreo e notas da timbila, e a intensidade decresce aos poucos
   * acompanhando a dispersão e desaceleração das partículas.
   */
  public sintetizarExplosaoTimbilaTVM(
    ctx: AudioContext,
    now: number,
    destino?: AudioNode
  ) {
    const dest = destino || ctx.destination;

    // 1. Acorde de Impacto Sísmico Polifónico Imediato (todas as lâminas vibram na explosão)
    const acordeImpacto = [
      { freq: 146.83, dur: 0.9, vol: 0.42, pan: 0 },    // D3 (Grave maciço)
      { freq: 220.00, dur: 0.8, vol: 0.38, pan: -0.3 }, // A3
      { freq: 293.66, dur: 0.8, vol: 0.40, pan: 0.3 },  // D4
      { freq: 369.99, dur: 0.7, vol: 0.38, pan: -0.5 }, // F#4
      { freq: 440.00, dur: 0.7, vol: 0.38, pan: 0.5 },  // A4
      { freq: 587.33, dur: 0.6, vol: 0.35, pan: -0.7 }, // D5
      { freq: 739.99, dur: 0.6, vol: 0.33, pan: 0.7 },  // F#5
      { freq: 880.00, dur: 0.5, vol: 0.30, pan: -0.4 }, // A5
    ];

    acordeImpacto.forEach(({ freq, dur, vol, pan }) => {
      this.sintetizarNotaTimbila(ctx, freq, now, dur, vol, dest, pan);
    });

    // Batuque forte de Tômbola na base do estrondo
    this.sintetizarBatuqueTombola(ctx, now, 60, 0.45, dest);
    this.sintetizarBatuqueTombola(ctx, now + 0.08, 90, 0.35, dest);

    // 2. Cascata e Espalhamento Multivocal de Notas (o som se espalha e em vários)
    // As notas começam super rápidas e intensas na explosão, e vão espaçando e decrescendo aos poucos
    const dispersaoNotas = [
      // Rajada imediata nos primeiros 200ms
      { offset: 0.04, freq: 659.25, dur: 0.35, vol: 0.36, pan: -0.85 },
      { offset: 0.07, freq: 554.37, dur: 0.35, vol: 0.35, pan: 0.80 },
      { offset: 0.11, freq: 739.99, dur: 0.40, vol: 0.33, pan: -0.60 },
      { offset: 0.15, freq: 493.88, dur: 0.40, vol: 0.31, pan: 0.65 },
      { offset: 0.20, freq: 880.00, dur: 0.45, vol: 0.29, pan: -0.75 },
      { offset: 0.26, freq: 587.33, dur: 0.45, vol: 0.28, pan: 0.50 },
      
      // Expansão intermediária (começa a desacelerar e perder força: 0.3s a 1.0s)
      { offset: 0.34, freq: 440.00, dur: 0.50, vol: 0.25, pan: -0.45 },
      { offset: 0.44, freq: 659.25, dur: 0.55, vol: 0.22, pan: 0.40 },
      { offset: 0.56, freq: 369.99, dur: 0.60, vol: 0.20, pan: -0.30 },
      { offset: 0.70, freq: 554.37, dur: 0.65, vol: 0.17, pan: 0.35 },
      { offset: 0.86, freq: 493.88, dur: 0.70, vol: 0.15, pan: -0.25 },
      { offset: 1.05, freq: 587.33, dur: 0.75, vol: 0.13, pan: 0.20 },

      // Decréscimo final e paragem aos poucos (1.2s a 2.0s)
      { offset: 1.28, freq: 440.00, dur: 0.85, vol: 0.10, pan: -0.15 },
      { offset: 1.55, freq: 369.99, dur: 0.95, vol: 0.08, pan: 0.10 },
      { offset: 1.88, freq: 293.66, dur: 1.20, vol: 0.06, pan: 0.00 },
    ];

    dispersaoNotas.forEach(({ offset, freq, dur, vol, pan }) => {
      this.sintetizarNotaTimbila(ctx, freq, now + offset, dur, vol, dest, pan);
    });
  }

  // ────────────────────────────────────────────────────────────
  // MÚSICA AMBIENTE PROCEDURAL DE TIMBILA
  // "Melodias suaves e acústicas de timbila à sombra de uma árvore"
  // ────────────────────────────────────────────────────────────
  public startTimbilaAmbientMusic() {
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.timbilaMusicTimer) {
      clearInterval(this.timbilaMusicTimer);
      this.timbilaMusicTimer = null;
    }

    // Melodia tradicional Chopi cíclica suave (fraseado melódico de Zavala)
    // Frequências suaves em padrão polirrítmico sereno
    const padraoMelodico: Array<{ freqIdx: number; dur: number; pausa: number }> = [
      { freqIdx: 0, dur: 0.35, pausa: 320 },  // D4
      { freqIdx: 2, dur: 0.35, pausa: 280 },  // F#4
      { freqIdx: 4, dur: 0.40, pausa: 340 },  // A4
      { freqIdx: 3, dur: 0.30, pausa: 260 },  // G4
      { freqIdx: 5, dur: 0.45, pausa: 480 },  // B4
      { freqIdx: 4, dur: 0.35, pausa: 280 },  // A4
      { freqIdx: 2, dur: 0.40, pausa: 350 },  // F#4
      { freqIdx: 1, dur: 0.50, pausa: 600 },  // E4 (pausa contemplativa)

      { freqIdx: 4, dur: 0.30, pausa: 280 },  // A4
      { freqIdx: 6, dur: 0.35, pausa: 300 },  // C#5
      { freqIdx: 7, dur: 0.45, pausa: 420 },  // D5
      { freqIdx: 5, dur: 0.35, pausa: 290 },  // B4
      { freqIdx: 4, dur: 0.40, pausa: 320 },  // A4
      { freqIdx: 2, dur: 0.45, pausa: 400 },  // F#4
      { freqIdx: 0, dur: 0.60, pausa: 850 },  // D4 (repouso à sombra da árvore)
    ];

    let step = 0;

    const tocarProximaNota = () => {
      if (!this.timbilaMusicEnabled || !this.soundEnabled) return;
      const currentCtx = this.getContext();
      if (!currentCtx) return;

      const notaInfo = padraoMelodico[step % padraoMelodico.length];
      const freq = ESCALA_TIMBILA_CHOPI[notaInfo.freqIdx] || 440;
      const now = currentCtx.currentTime;

      // Volume ambiente muito suave e relaxante (~0.07)
      this.sintetizarNotaTimbila(currentCtx, freq, now, notaInfo.dur, 0.075);

      step++;
      this.timbilaMusicTimer = setTimeout(tocarProximaNota, notaInfo.pausa);
    };

    tocarProximaNota();
  }

  public stopTimbilaAmbientMusic() {
    if (this.timbilaMusicTimer) {
      clearTimeout(this.timbilaMusicTimer);
      this.timbilaMusicTimer = null;
    }
  }

  // ────────────────────────────────────────────────────────────
  // EFEITOS SONOROS DE TIMBILA NAS AÇÕES DO JOGO
  // ────────────────────────────────────────────────────────────

  /**
   * 1. Ao levar/recolher pedras da casa:
   * Toque percussivo autêntico de lâmina de madeira de timbila
   */
  public playPickup() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      // Golpe duplo de timbila ligeiro (recolha com as mãos)
      this.sintetizarNotaTimbila(ctx, 329.63, now, 0.25, 0.22); // E4
      this.sintetizarNotaTimbila(ctx, 440.00, now + 0.05, 0.30, 0.20); // A4
    } catch {}
  }

  /**
   * 2. Ao semear pedra na casa:
   * Toque de gota/madeira com harmonia suave da timbila
   */
  public playStoneDrop(pitchMultiplier: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    const agora = Date.now();
    if (agora - this.lastStoneDropTime < 35) {
      return;
    }
    this.lastStoneDropTime = agora;

    try {
      const now = ctx.currentTime;
      const baseFreq = 369.99 * Math.max(0.7, Math.min(1.4, pitchMultiplier)); // F#4 com variação orgânica
      this.sintetizarNotaTimbila(ctx, baseFreq, now, 0.18, 0.16);
    } catch {}
  }

  /**
   * 3. Nas capturas de pedras:
   * Acorde ressonante e vibrante de timbila chopi com a cabaça a vibrar
   */
  public playCapture(pedrasCapturadas: number = 2) {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      
      // Batida forte em oitava/quinta tradicional da timbila
      const notaGrave = pedrasCapturadas >= 8 ? 293.66 : 329.63; // D4 ou E4
      const notaAguda = pedrasCapturadas >= 8 ? 587.33 : 440.00; // D5 ou A4

      this.sintetizarNotaTimbila(ctx, notaGrave, now, 0.40, 0.32);
      this.sintetizarNotaTimbila(ctx, notaAguda, now + 0.04, 0.45, 0.28);

      // Adiciona leve batuque de caixa quando a captura for expressiva
      if (pedrasCapturadas >= 4) {
        this.sintetizarBatuqueTombola(ctx, now, 110, 0.24);
      }
    } catch {}
  }

  /**
   * 4. Ao ganhar uma ou duas vezes de jogar (bónus 1x e 2x):
   * Floreio melódico e rítmico alegre de timbila
   */
  public playBonus(is2x: boolean = false) {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const notas = is2x
        ? [369.99, 440.00, 554.37, 587.33, 739.99, 880.00] // Floreio triunfal rápido de Timbila 2x
        : [329.63, 440.00, 554.37, 659.25]; // Arpejo alegre 1x

      notas.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.07;
        this.sintetizarNotaTimbila(ctx, freq, now, 0.35, is2x ? 0.26 : 0.22);
      });

      if (is2x) {
        // Batuque comemorativo de tômbola acompanhando
        this.sintetizarBatuqueTombola(ctx, ctx.currentTime, 85, 0.3);
        this.sintetizarBatuqueTombola(ctx, ctx.currentTime + 0.25, 95, 0.25);
      }
    } catch {}
  }

  /**
   * 5. Ao ganhar o jogo:
   * Sons de Tômbola (batuques tradicionais moçambicanos) combinando com a taça e os parabéns!
   */
  public playTombolaCelebration() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;

      // Ritmo de Tômbola Moçambicana (batuques cadenciados em polirritmia)
      const batidasTombola = [0.0, 0.16, 0.32, 0.48, 0.70, 0.90, 1.15, 1.40, 1.65, 1.90];
      batidasTombola.forEach((offset, idx) => {
        const tempoBatida = now + offset;
        const tom = (idx % 2 === 0) ? 80 : 120;
        this.sintetizarBatuqueTombola(ctx, tempoBatida, tom, 0.32);
      });

      // Melodia triunfal de Timbila Chopi sobreposta à Tômbola (arpejo de vitória)
      const arpejoVitoria = [
        { freq: 293.66, delay: 0.10 }, // D4
        { freq: 369.99, delay: 0.25 }, // F#4
        { freq: 440.00, delay: 0.40 }, // A4
        { freq: 587.33, delay: 0.60 }, // D5
        { freq: 739.99, delay: 0.85 }, // F#5
        { freq: 880.00, delay: 1.10 }, // A5
        { freq: 1108.7, delay: 1.45 }, // C#6
        { freq: 1174.6, delay: 1.70 }, // D6 (nota culminante de taça)
      ];

      arpejoVitoria.forEach(({ freq, delay }) => {
        this.sintetizarNotaTimbila(ctx, freq, now + delay, 0.55, 0.26);
      });
    } catch {}
  }

  /**
   * Som geral de vitória (compatibilidade)
   */
  public playVictory() {
    this.playTombolaCelebration();
  }

  /**
   * Fanfarra triunfal de desbloqueio de conquista
   */
  public playAchievement() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const notas = [440.0, 554.37, 659.25, 880.0];
      notas.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.08;
        this.sintetizarNotaTimbila(ctx, freq, now, 0.45, 0.24);
      });
    } catch {}
  }

  /**
   * Reação rápida online
   */
  public playReaction() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      this.sintetizarNotaTimbila(ctx, 587.33, now, 0.25, 0.22);
      this.sintetizarNotaTimbila(ctx, 880.00, now + 0.09, 0.35, 0.20);
    } catch {}
  }

  /**
   * Alerta de tempo esgotando
   */
  public playTimerWarning() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Clique suave de madeira / pedra para interações de interface
   */
  public playClick() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      this.sintetizarNotaTimbila(ctx, 587.33, now, 0.12, 0.14);
    } catch {}
  }

  /**
   * Som de jogada inválida ou erro
   */
  public playError() {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  /**
   * Expressão fonética / acústica moçambicana
   */
  public playExpressaoAcustica(
    expressao: 'que_bela_jogada' | 'comeu_tudo' | 'kanimambo' | 'axinene' | 'wau_que_bom' | 'wamama' | 'ganhou' | 'morreu_afogado' | 'moto_moto'
  ) {
    const ctx = this.getContext();
    if (!ctx || !this.soundEnabled) return;

    try {
      const now = ctx.currentTime;
      switch (expressao) {
        case 'moto_moto':
          // Ritmo quente de Moto-Moto (chama vibrante de timbila e percussão de cabaça)
          this.sintetizarNotaTimbila(ctx, 554.37, now, 0.16, 0.32);
          this.sintetizarNotaTimbila(ctx, 440.00, now + 0.10, 0.18, 0.30);
          this.sintetizarNotaTimbila(ctx, 554.37, now + 0.22, 0.16, 0.32);
          this.sintetizarNotaTimbila(ctx, 440.00, now + 0.32, 0.35, 0.30);
          this.sintetizarBatuqueTombola(ctx, now + 0.12, 110, 0.35);
          this.sintetizarBatuqueTombola(ctx, now + 0.34, 85, 0.40);
          break;
        case 'que_bela_jogada':
        case 'comeu_tudo':
          // Três notas rápidas de timbila em cascata de captura + batuque
          this.sintetizarNotaTimbila(ctx, 587.33, now, 0.25, 0.28);
          this.sintetizarNotaTimbila(ctx, 440.00, now + 0.09, 0.25, 0.28);
          this.sintetizarNotaTimbila(ctx, 293.66, now + 0.18, 0.40, 0.32);
          this.sintetizarBatuqueTombola(ctx, now + 0.20, 85, 0.30);
          break;

        case 'kanimambo':
          // Duas notas gentis e calorosas de agradecimento em timbila
          this.sintetizarNotaTimbila(ctx, 440.00, now, 0.35, 0.24);
          this.sintetizarNotaTimbila(ctx, 554.37, now + 0.12, 0.45, 0.24);
          break;

        case 'axinene':
          // Floreio ascendente expressivo de celebração/espanto
          this.sintetizarNotaTimbila(ctx, 369.99, now, 0.20, 0.26);
          this.sintetizarNotaTimbila(ctx, 493.88, now + 0.08, 0.22, 0.28);
          this.sintetizarNotaTimbila(ctx, 739.99, now + 0.17, 0.45, 0.30);
          break;

        case 'wau_que_bom':
        case 'wamama':
          // Salto de oitava expressivo
          this.sintetizarNotaTimbila(ctx, 329.63, now, 0.22, 0.26);
          this.sintetizarNotaTimbila(ctx, 659.25, now + 0.11, 0.40, 0.30);
          break;

        case 'ganhou':
          this.playTombolaCelebration();
          break;

        case 'morreu_afogado':
          // Som dramático descendente com ressonância oca de cabaça
          this.sintetizarNotaTimbila(ctx, 440.00, now, 0.20, 0.28);
          this.sintetizarNotaTimbila(ctx, 329.63, now + 0.12, 0.25, 0.28);
          this.sintetizarNotaTimbila(ctx, 164.81, now + 0.26, 0.50, 0.34);
          this.sintetizarBatuqueTombola(ctx, now + 0.28, 65, 0.35);
          break;
      }
    } catch {}
  }
}

export const soundManager = new NtxuvaSoundManager();
