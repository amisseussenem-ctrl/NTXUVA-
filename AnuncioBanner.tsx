import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, ShieldCheck, X } from 'lucide-react';
import { CampanhaAnuncio, ConfiguracaoAnuncios } from '../types/anuncios';
import { anunciosService } from '../utils/anunciosService';

interface AnuncioBannerProps {
  posicao?: 'superior' | 'inferior';
  onAbrirConfiguracoes?: () => void;
  className?: string;
}

export const AnuncioBanner: React.FC<AnuncioBannerProps> = ({
  onAbrirConfiguracoes,
  className = '',
}) => {
  const [config, setConfig] = useState<ConfiguracaoAnuncios>(() => anunciosService.obterConfiguracao());
  const [campanha, setCampanha] = useState<CampanhaAnuncio>(() => anunciosService.obterCampanhaAleatoria());
  const [minimizado, setMinimizado] = useState(false);
  const [fechadoTemporariamente, setFechadoTemporariamente] = useState(false);

  useEffect(() => {
    const cancelar = anunciosService.subscrever((novaConfig) => {
      setConfig(novaConfig);
    });
    return cancelar;
  }, []);

  // Rotaciona o anúncio a cada 40 segundos suavemente
  useEffect(() => {
    if (!config.habilitado || fechadoTemporariamente) return;

    anunciosService.registrarExibicao('banner');

    const intervalo = setInterval(() => {
      setCampanha((atual) => anunciosService.obterCampanhaAleatoria(atual?.id));
    }, 40000);

    return () => clearInterval(intervalo);
  }, [config.habilitado, fechadoTemporariamente]);

  if (!config.habilitado || fechadoTemporariamente) {
    return null;
  }

  return (
    <aside
      aria-label="Publicidade"
      className={`w-full max-w-3xl mx-auto px-2 z-20 transition-all duration-300 ${className}`}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#170d06] via-[#241309] to-[#170d06] border border-amber-900/60 shadow-lg shadow-black/60">
        {/* Barra superior com identificação clara e botões de controle */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[#120803] border-b border-amber-950 text-[10px] text-stone-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[9px] uppercase tracking-wider">
              Patrocinado · AdMob
            </span>
            {config.modoTeste && (
              <span className="text-amber-400/80 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Modo de Teste</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onAbrirConfiguracoes && (
              <button
                type="button"
                onClick={onAbrirConfiguracoes}
                className="hover:text-amber-300 text-[10px] text-stone-400 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                title="Configurações de Anúncios"
              >
                ⚙️ Config
              </button>
            )}

            <button
              type="button"
              onClick={() => setMinimizado(!minimizado)}
              className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer rounded"
              title={minimizado ? 'Expandir Banner' : 'Minimizar Banner'}
            >
              {minimizado ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setFechadoTemporariamente(true)}
              className="p-1 text-stone-500 hover:text-stone-300 cursor-pointer rounded ml-0.5"
              title="Fechar temporariamente"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Banner */}
        {!minimizado && (
          <div className="p-2 sm:p-2.5 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Ícone da Campanha */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${campanha.gradienteCor} flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0 border border-white/20`}
              >
                <span>{campanha.iconeEmoji}</span>
              </div>

              {/* Informações da campanha */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-100 truncate font-mono">
                    {campanha.titulo}
                  </h4>
                  <span className="hidden md:inline-block text-[9px] px-1 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {campanha.anunciante}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-300/90 truncate max-w-sm sm:max-w-md">
                  {campanha.descricao}
                </p>
              </div>
            </div>

            {/* Ação */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={campanha.urlDestino}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => anunciosService.registrarExibicao('banner')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-bold text-[10px] sm:text-xs font-mono flex items-center gap-1 shadow-sm transition-all"
              >
                <span>{campanha.ctaTexto}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
