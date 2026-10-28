import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Gift, Sparkles, ShieldCheck } from 'lucide-react';
import { CampanhaAnuncio } from '../types/anuncios';
import { anunciosService } from '../utils/anunciosService';
import { soundManager } from '../utils/sound';

interface ModalAnuncioRecompensadoProps {
  aberto: boolean;
  onFechar: () => void;
  onRecompensaConcedida: (moedas: number) => void;
  campanhaPersonalizada?: CampanhaAnuncio;
}

export const ModalAnuncioRecompensado: React.FC<ModalAnuncioRecompensadoProps> = ({
  aberto,
  onFechar,
  onRecompensaConcedida,
  campanhaPersonalizada,
}) => {
  const duracaoTotal = 10; // 10 segundos para conceder a recompensa
  const [segundosRestantes, setSegundosRestantes] = useState(duracaoTotal);
  const [recompensaConcedida, setRecompensaConcedida] = useState(false);
  const [campanha, setCampanha] = useState<CampanhaAnuncio>(() =>
    campanhaPersonalizada || anunciosService.obterCampanhaAleatoria()
  );
  const config = anunciosService.obterConfiguracao();

  useEffect(() => {
    if (!aberto) {
      setSegundosRestantes(duracaoTotal);
      setRecompensaConcedida(false);
      return;
    }

    setCampanha(campanhaPersonalizada || anunciosService.obterCampanhaAleatoria());

    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setRecompensaConcedida(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [aberto, campanhaPersonalizada]);

  const handleResgatarEFechar = () => {
    const moedas = config.recompensaMoedasVideo;
    anunciosService.registrarExibicao('recompensado');
    anunciosService.adicionarMoedas(moedas);
    soundManager.playVictory();
    onRecompensaConcedida(moedas);
    onFechar();
  };

  if (!aberto) return null;

  const progressoPercentual = Math.min(100, Math.round(((duracaoTotal - segundosRestantes) / duracaoTotal) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vídeo Recompensado"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="w-full max-w-md bg-[#1a0f08] border-2 border-emerald-500/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scaleUp">
        {/* Barra Superior */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#120803] border-b border-[#3b2010]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3 h-3 text-emerald-400" />
              <span>Vídeo Recompensado</span>
            </span>
            {config.modoTeste && (
              <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Teste AdMob</span>
              </span>
            )}
          </div>

          {recompensaConcedida ? (
            <button
              type="button"
              onClick={handleResgatarEFechar}
              className="p-1 rounded-full text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-[11px] font-mono text-stone-400">
              Recompensa em: <strong className="text-amber-400">{segundosRestantes}s</strong>
            </div>
          )}
        </div>

        {/* Barra de Progresso do Anúncio */}
        <div className="w-full h-1.5 bg-stone-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressoPercentual}%` }}
          />
        </div>

        {/* Conteúdo Principal do Vídeo Recompensado */}
        <div className="p-5 sm:p-6 flex flex-col items-center text-center space-y-4">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${campanha.gradienteCor} flex items-center justify-center text-4xl shadow-xl border border-white/20`}
          >
            <span>{campanha.iconeEmoji}</span>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              {campanha.anunciante} · {campanha.categoria}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-amber-100 font-mono">
              {campanha.titulo}
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed pt-1 max-w-xs">
              {campanha.descricao}
            </p>
          </div>

          {/* Área de Recompensa */}
          <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-stone-900 to-emerald-950/80 border border-emerald-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Gift className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-stone-400 uppercase">Recompensa (Bónus de Vídeo)</div>
                <div className="text-xs font-bold text-emerald-300 font-mono">+{config.recompensaMoedasVideo} Moedas (Máx. 1000)</div>
              </div>
            </div>

            <div className="text-right">
              {recompensaConcedida ? (
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Desbloqueado!</span>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-amber-400">
                  Aguarde {segundosRestantes}s
                </div>
              )}
            </div>
          </div>

          {/* Botão de Resgate ou Continuação */}
          <div className="w-full pt-1">
            {recompensaConcedida ? (
              <button
                type="button"
                onClick={handleResgatarEFechar}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-mono font-black text-sm tracking-wide shadow-xl shadow-emerald-950/60 border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
              >
                <Sparkles className="w-4 h-4" />
                <span>RESGATAR +{config.recompensaMoedasVideo} MOEDAS</span>
              </button>
            ) : (
              <div className="text-[11px] font-mono text-stone-400">
                Assista até o fim para receber as suas moedas no perfil.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-4 py-2 bg-[#120803] border-t border-[#3b2010] text-[10px] font-mono text-stone-500 text-center">
          Google AdMob · ID Recompensado: {config.adMobRewardedId.slice(0, 24)}...
        </div>
      </div>
    </div>
  );
};
