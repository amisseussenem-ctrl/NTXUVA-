import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { CampanhaAnuncio } from '../types/anuncios';
import { anunciosService } from '../utils/anunciosService';

interface ModalAnuncioIntersticialProps {
  aberto: boolean;
  onFechar: () => void;
  campanhaPersonalizada?: CampanhaAnuncio;
}

export const ModalAnuncioIntersticial: React.FC<ModalAnuncioIntersticialProps> = ({
  aberto,
  onFechar,
  campanhaPersonalizada,
}) => {
  const [segundosRestantes, setSegundosRestantes] = useState(5);
  const [podeFechar, setPodeFechar] = useState(false);
  const [campanha, setCampanha] = useState<CampanhaAnuncio>(() =>
    campanhaPersonalizada || anunciosService.obterCampanhaAleatoria()
  );
  const [config] = useState(() => anunciosService.obterConfiguracao());

  useEffect(() => {
    if (!aberto) {
      setSegundosRestantes(5);
      setPodeFechar(false);
      return;
    }

    setCampanha(campanhaPersonalizada || anunciosService.obterCampanhaAleatoria());
    anunciosService.registrarExibicao('intersticial');

    const interval = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPodeFechar(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [aberto, campanhaPersonalizada]);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anúncio Intersticial"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-[#1a0f08] border-2 border-[#4d2d18] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scaleUp">
        {/* Barra Superior */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#120803] border-b border-[#3b2010]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px] font-mono uppercase tracking-wider">
              Anúncio · AdMob
            </span>
            {config.modoTeste && (
              <span className="text-[11px] font-mono text-amber-400/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo de Teste</span>
              </span>
            )}
          </div>

          <div>
            {podeFechar ? (
              <button
                type="button"
                onClick={onFechar}
                className="px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-100 font-mono text-xs font-bold flex items-center gap-1 border border-stone-600 cursor-pointer transition-colors animate-pulse"
              >
                <span>Fechar</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono text-[11px]">
                Pode fechar em <strong className="text-amber-400">{segundosRestantes}s</strong>
              </div>
            )}
          </div>
        </div>

        {/* Corpo do Anúncio */}
        <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
          {/* Badge de categoria */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 font-mono text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{campanha.badge}</span>
          </div>

          {/* Banner Visual Hero */}
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${campanha.gradienteCor} flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-2 border-white/20`}
          >
            <span>{campanha.iconeEmoji}</span>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg sm:text-xl font-black text-amber-100 font-mono leading-tight">
              {campanha.titulo}
            </h3>
            <div className="text-xs font-mono text-stone-400 uppercase tracking-wider">
              Patrocinado por {campanha.anunciante}
            </div>
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed pt-1">
              {campanha.descricao}
            </p>
          </div>

          {/* Ações */}
          <div className="w-full pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <a
              href={campanha.urlDestino}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                anunciosService.registrarExibicao('intersticial');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-mono font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 border border-amber-300 transition-all cursor-pointer"
            >
              <span>{campanha.ctaTexto}</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </a>

            {podeFechar && (
              <button
                type="button"
                onClick={onFechar}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#26150c] hover:bg-[#382012] text-stone-300 font-mono font-bold text-xs border border-[#4d2d18] cursor-pointer transition-colors"
              >
                Voltar ao Jogo
              </button>
            )}
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="px-4 py-2 bg-[#120803] border-t border-[#3b2010] flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>Google AdMob · ID Teste: {config.adMobInterstitialId.slice(0, 20)}...</span>
          <span>Apoia o desenvolvimento do NTXUVA</span>
        </div>
      </div>
    </div>
  );
};
