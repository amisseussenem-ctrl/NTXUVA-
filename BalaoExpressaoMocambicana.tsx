import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, MessageCircle, X, Volume2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

export type TipoExpressaoMocambicana = 
  | 'que_bela_jogada'
  | 'comeu_tudo' 
  | 'kanimambo' 
  | 'axinene' 
  | 'wau_que_bom'
  | 'wamama' 
  | 'ganhou' 
  | 'morreu_afogado'
  | 'moto_moto';

export interface ExpressaoInfo {
  chave: TipoExpressaoMocambicana;
  texto: string;
  emoji: string;
  contexto: string;
  origem: string;
  corBorda: string;
  corFundo: string;
}

export const DICIONARIO_EXPRESSOES: Record<TipoExpressaoMocambicana, ExpressaoInfo> = {
  que_bela_jogada: {
    chave: 'que_bela_jogada',
    texto: 'Que bela jogada!',
    emoji: '🎯',
    contexto: 'Grande captura de pedras na linha de ataque!',
    origem: 'Celebração popular de Ntxuva em Moçambique',
    corBorda: 'border-amber-400',
    corFundo: 'from-[#381a0b] via-[#48200d] to-[#2b1206]',
  },
  comeu_tudo: {
    chave: 'que_bela_jogada',
    texto: 'Que bela jogada!',
    emoji: '🎯',
    contexto: 'Grande captura de pedras na linha de ataque!',
    origem: 'Celebração popular de Ntxuva em Moçambique',
    corBorda: 'border-amber-400',
    corFundo: 'from-[#381a0b] via-[#48200d] to-[#2b1206]',
  },
  kanimambo: {
    chave: 'kanimambo',
    texto: 'Kanimambo!',
    emoji: '🙏',
    contexto: 'Bónus de jogada extra ou lance de mestre!',
    origem: 'Obrigado / Gratidão em Changana e Ronga',
    corBorda: 'border-emerald-400',
    corFundo: 'from-[#142617] via-[#1b3520] to-[#0f1d11]',
  },
  axinene: {
    chave: 'axinene',
    texto: 'Axinenéee!',
    emoji: '🔥',
    contexto: 'Reviravolta genial e golpe espetacular!',
    origem: 'Celebração e espanto entusiasmado',
    corBorda: 'border-yellow-400',
    corFundo: 'from-[#3a2209] via-[#4d2c0b] to-[#261504]',
  },
  wau_que_bom: {
    chave: 'wau_que_bom',
    texto: 'Wau que bom!',
    emoji: '😲',
    contexto: 'Surpresa diante de um longo revezamento em cadeia!',
    origem: 'Expressão de admiração e entusiasmo',
    corBorda: 'border-purple-400',
    corFundo: 'from-[#2a1329] via-[#381a37] to-[#1c0c1b]',
  },
  wamama: {
    chave: 'wau_que_bom',
    texto: 'Wau que bom!',
    emoji: '😲',
    contexto: 'Surpresa diante de um longo revezamento em cadeia!',
    origem: 'Expressão de admiração e entusiasmo',
    corBorda: 'border-purple-400',
    corFundo: 'from-[#2a1329] via-[#381a37] to-[#1c0c1b]',
  },
  ganhou: {
    chave: 'ganhou',
    texto: 'Ganhou!',
    emoji: '👑',
    contexto: 'Vitória triunfal na partida de Ntxuva!',
    origem: 'Grito de vitória entre os jogadores',
    corBorda: 'border-amber-300',
    corFundo: 'from-[#3a200b] via-[#4a290d] to-[#291406]',
  },
  morreu_afogado: {
    chave: 'morreu_afogado',
    texto: 'Morreu afogado!',
    emoji: '🛑',
    contexto: 'Vitória por Asfixia (sem movimentos com 2+ pedras)!',
    origem: 'Termo tradicional do NTXUVA para o afogamento',
    corBorda: 'border-rose-500',
    corFundo: 'from-[#330f14] via-[#48151c] to-[#23090c]',
  },
  moto_moto: {
    chave: 'moto_moto',
    texto: 'Moto-moto!',
    emoji: '🔥',
    contexto: 'Completou 5 giros sem captura. A jogada encerra e passa a vez!',
    origem: 'Regra de Moto-Moto do NTXUVA',
    corBorda: 'border-red-500',
    corFundo: 'from-[#3b0d0d] via-[#521414] to-[#2b0808]',
  },
};

/**
 * Função utilitária para sintetizar voz natural em português para as expressões
 */
export function vocalizarExpressaoMocambicana(texto: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!soundManager.isEnabled()) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto.replace(/[!¡]/g, ''));
    
    // Procura por voz em português
    const vozes = window.speechSynthesis.getVoices();
    const vozPt = vozes.find((v) => v.lang.startsWith('pt')) || null;
    if (vozPt) utter.voice = vozPt;
    
    utter.lang = 'pt-PT';
    utter.pitch = 1.2; // entoação mais viva e alegre
    utter.rate = 1.05;
    utter.volume = 0.95;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignorar se o sintetizador de fala do browser falhar
  }
}

interface BalaoExpressaoMocambicanaProps {
  expressao: TipoExpressaoMocambicana | null;
  onFechar: () => void;
  posicao?: 'centro' | 'flutuante';
}

export const BalaoExpressaoMocambicana: React.FC<BalaoExpressaoMocambicanaProps> = ({
  expressao,
  onFechar,
  posicao = 'flutuante',
}) => {
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  const [visivel, setVisivel] = useState(false);
  const [animandoSaida, setAnimandoSaida] = useState(false);

  useEffect(() => {
    if (!expressao) {
      setVisivel(false);
      setAnimandoSaida(false);
      return;
    }

    setVisivel(true);
    setAnimandoSaida(false);

    // Dispara síntese acústica de Timbila e voz moçambicana
    soundManager.playExpressaoAcustica(expressao);
    const info = DICIONARIO_EXPRESSOES[expressao];
    if (info) {
      vocalizarExpressaoMocambicana(info.texto);
    }

    // Duração reduzida em 1 segundo: de 3000ms para 2000ms (2 segundos)
    // Vitória (ganhou/morreu afogado) permanece no ecrã de vitória.
    const ehVitoria = expressao === 'ganhou' || expressao === 'morreu_afogado';
    if (!ehVitoria) {
      // Inicia desvanecimento aos 1650ms e conclui exatamente aos 2000ms
      const timerFade = setTimeout(() => {
        setAnimandoSaida(true);
      }, 1650);

      const timerFechar = setTimeout(() => {
        setVisivel(false);
        onFecharRef.current();
      }, 2000);

      return () => {
        clearTimeout(timerFade);
        clearTimeout(timerFechar);
      };
    }
  }, [expressao]);

  if (!expressao || !visivel) return null;
  const info = DICIONARIO_EXPRESSOES[expressao];
  if (!info) return null;

  const fecharSuavemente = () => {
    setAnimandoSaida(true);
    setTimeout(() => {
      setVisivel(false);
      onFecharRef.current();
    }, 200);
  };

  return (
    <div 
      className={`fixed z-[90] font-mono select-none ${
        posicao === 'centro' 
          ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
          : 'top-16 sm:top-20 left-1/2 -translate-x-1/2 max-w-xs sm:max-w-sm w-[88%]'
      }`}
    >
      <div 
        style={{
          transition: 'opacity 350ms ease, transform 350ms ease',
          opacity: animandoSaida ? 0 : 1,
          transform: animandoSaida ? 'translateY(-8px) scale(0.96)' : 'translateY(0) scale(1)',
          pointerEvents: animandoSaida ? 'none' : 'auto',
        }}
        className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r ${info.corFundo} border-2 ${info.corBorda} shadow-xl ring-2 ring-amber-500/20 text-stone-100 flex items-center justify-between gap-2.5 relative overflow-hidden`}
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-lg pointer-events-none" />

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Emoji comemorativo mais compacto */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 animate-pulse">
            {info.emoji}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1 text-amber-300 text-[9px] font-black uppercase tracking-widest truncate">
              <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span>{info.origem}</span>
            </div>

            {/* Texto com tipografia de exclamação expressiva */}
            <h3 className="text-sm sm:text-base font-black tracking-wide text-white drop-shadow-md leading-tight truncate">
              “{info.texto}”
            </h3>

            <p className="text-[10px] text-stone-300 leading-tight font-medium truncate">
              {info.contexto}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col items-center gap-1 self-start shrink-0">
          <button
            type="button"
            onClick={fecharSuavemente}
            className="p-1 rounded-lg bg-black/30 hover:bg-black/60 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar balão"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            onClick={() => {
              soundManager.playExpressaoAcustica(expressao);
              vocalizarExpressaoMocambicana(info.texto);
            }}
            className="p-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 transition-colors cursor-pointer"
            title="Ouvir novamente"
          >
            <Volume2 className="w-3 h-3" />
          </button>
        </div>

        {/* Ponta do Balão de Fala estilizada */}
        <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-inherit border-r-2 border-b-2 border-amber-400 rotate-45 transform pointer-events-none" />
      </div>
    </div>
  );
};
