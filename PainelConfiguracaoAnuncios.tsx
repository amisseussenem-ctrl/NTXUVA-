import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Coins, 
  Check, 
  ExternalLink,
  Award
} from 'lucide-react';
import { ConfiguracaoAnuncios, EstatisticasAnuncios } from '../types/anuncios';
import { anunciosService, GOOGLE_ADMOB_TEST_IDS } from '../utils/anunciosService';

interface PainelConfiguracaoAnunciosProps {
  onTestarIntersticial: () => void;
  onTestarRecompensado: () => void;
}

export const PainelConfiguracaoAnuncios: React.FC<PainelConfiguracaoAnunciosProps> = ({
  onTestarIntersticial,
  onTestarRecompensado,
}) => {
  const [config, setConfig] = useState<ConfiguracaoAnuncios>(() => anunciosService.obterConfiguracao());
  const [stats, setStats] = useState<EstatisticasAnuncios>(() => anunciosService.obterEstatisticas());
  const [saldoMoedas, setSaldoMoedas] = useState<number>(() => anunciosService.obterSaldoMoedas());
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  useEffect(() => {
    const unsub = anunciosService.subscrever((novaConfig) => {
      setConfig(novaConfig);
      setStats(anunciosService.obterEstatisticas());
      setSaldoMoedas(anunciosService.obterSaldoMoedas());
    });
    return unsub;
  }, []);

  const handleAtualizar = (campo: keyof ConfiguracaoAnuncios, valor: any) => {
    const nova = anunciosService.salvarConfiguracao({ [campo]: valor });
    setConfig(nova);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
  };

  const handleRestaurarPadrao = () => {
    const padrao = anunciosService.restaurarPadrao();
    setConfig(padrao);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
  };

  const usarIdsTeste = () => {
    anunciosService.salvarConfiguracao({
      adMobPublisherId: GOOGLE_ADMOB_TEST_IDS.publisherId,
      adMobBannerId: GOOGLE_ADMOB_TEST_IDS.banner,
      adMobInterstitialId: GOOGLE_ADMOB_TEST_IDS.interstitial,
      adMobRewardedId: GOOGLE_ADMOB_TEST_IDS.rewarded,
      modoTeste: true,
    });
    setConfig(anunciosService.obterConfiguracao());
  };

  return (
    <div className="space-y-4 font-mono text-xs text-stone-200">
      {/* Banner Principal com Estado Geral */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#211209] to-[#2e190c] border border-amber-600/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Sistema de Anúncios AdMob</h4>
            <div className="text-[10px] text-stone-400">
              Banners, Intersticiais e Vídeos Recompensados
            </div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.habilitado}
            onChange={(e) => handleAtualizar('habilitado', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
        </label>
      </div>

      {salvoFeedback && (
        <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 flex items-center justify-center gap-1.5 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Configuração guardada com sucesso!</span>
        </div>
      )}

      {/* Cartões de Estatísticas Rápidas e Moedas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-[#180e07] border border-[#3d2315] text-center">
          <div className="text-[10px] text-stone-400 uppercase">Seu Saldo</div>
          <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center justify-center gap-1 mt-0.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{saldoMoedas} <span className="text-[10px] text-stone-400 font-normal">/ 1000</span></span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#180e07] border border-[#3d2315] text-center">
          <div className="text-[10px] text-stone-400 uppercase">Banners</div>
          <div className="text-sm font-black text-amber-300 mt-0.5">
            {stats.totalBannersExibidos}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#180e07] border border-[#3d2315] text-center">
          <div className="text-[10px] text-stone-400 uppercase">Intersticiais</div>
          <div className="text-sm font-black text-amber-300 mt-0.5">
            {stats.totalIntersticiaisExibidos}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#180e07] border border-[#3d2315] text-center">
          <div className="text-[10px] text-stone-400 uppercase">Recompensas</div>
          <div className="text-sm font-black text-emerald-400 mt-0.5">
            +{stats.totalMoedasRecompensadas}
          </div>
        </div>
      </div>

      {/* Botões de Teste ao Vivo */}
      <div className="p-3 rounded-2xl bg-[#170e08] border border-[#3d2315] space-y-2">
        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5" />
          <span>Testar Formatos de Anúncio em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onTestarIntersticial}
            className="p-2.5 rounded-xl bg-[#26150b] hover:bg-[#381f10] border border-amber-600/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <span>📱 Testar Intersticial (Tela Cheia)</span>
          </button>

          <button
            type="button"
            onClick={onTestarRecompensado}
            className="p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <span>🎁 Testar Vídeo (+250 Moedas)</span>
          </button>
        </div>
      </div>

      {/* Opções e Frequência */}
      <div className="p-3.5 rounded-2xl bg-[#170e08] border border-[#3d2315] space-y-3">
        <h5 className="font-bold text-stone-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Políticas e Exibição</span>
        </h5>

        {/* Alternância Modo de Teste */}
        <div className="flex items-center justify-between py-1 border-b border-[#2b170c]">
          <div>
            <div className="font-bold text-stone-200">Modo de Teste Oficial AdMob</div>
            <div className="text-[10px] text-stone-400">
              Garante que não haja penalização na sua conta Google durante o desenvolvimento
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.modoTeste}
            onChange={(e) => handleAtualizar('modoTeste', e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 bg-stone-900 border-stone-700 cursor-pointer"
          />
        </div>

        {/* Frequência do Intersticial */}
        <div className="flex items-center justify-between py-1 border-b border-[#2b170c]">
          <div>
            <div className="font-bold text-stone-200">Frequência do Intersticial</div>
            <div className="text-[10px] text-stone-400">
              Exibir anúncio de tela cheia a cada X partidas concluídas
            </div>
          </div>
          <select
            value={config.frequenciaIntersticialPartidas}
            onChange={(e) => handleAtualizar('frequenciaIntersticialPartidas', parseInt(e.target.value, 10))}
            className="bg-[#241308] border border-[#4d2d18] rounded-lg px-2 py-1 text-amber-300 font-mono text-xs cursor-pointer"
          >
            <option value={1}>A cada 1 partida</option>
            <option value={2}>A cada 2 partidas (Recomendado)</option>
            <option value={3}>A cada 3 partidas</option>
            <option value={5}>A cada 5 partidas</option>
          </select>
        </div>

        {/* Recompensa em Moedas por Vídeo */}
        <div className="flex items-center justify-between py-1 border-b border-[#2b170c]">
          <div>
            <div className="font-bold text-stone-200">Recompensa em Moedas (Vídeo)</div>
            <div className="text-[10px] text-stone-400">
              Moedas creditadas quando o jogador assiste ao vídeo completo
            </div>
          </div>
          <select
            value={config.recompensaMoedasVideo}
            onChange={(e) => handleAtualizar('recompensaMoedasVideo', parseInt(e.target.value, 10))}
            className="bg-[#241308] border border-[#4d2d18] rounded-lg px-2 py-1 text-emerald-400 font-mono text-xs cursor-pointer"
          >
            <option value={100}>+100 Moedas</option>
            <option value={250}>+250 Moedas (Padrão)</option>
            <option value={500}>+500 Moedas</option>
            <option value={1000}>+1000 Moedas</option>
          </select>
        </div>

        {/* Exibir Banners */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="font-bold text-stone-200">Exibir Banner na Partida</div>
            <div className="text-[10px] text-stone-400">Banner responsivo no fundo do tabuleiro</div>
          </div>
          <input
            type="checkbox"
            checked={config.exibirBannerJogo}
            onChange={(e) => handleAtualizar('exibirBannerJogo', e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 bg-stone-900 border-stone-700 cursor-pointer"
          />
        </div>
      </div>

      {/* Chaves e IDs do Google AdMob / AdSense */}
      <div className="p-3.5 rounded-2xl bg-[#170e08] border border-[#3d2315] space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>IDs de Bloco do Google AdMob</span>
          </h5>
          <button
            type="button"
            onClick={usarIdsTeste}
            className="text-[10px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
          >
            Usar IDs Teste
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-stone-400 mb-0.5">Publisher ID (ca-pub-XXXXXXXX)</label>
            <input
              type="text"
              value={config.adMobPublisherId}
              onChange={(e) => handleAtualizar('adMobPublisherId', e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full bg-[#120803] border border-[#4d2d18] rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 mb-0.5">ID Bloco Banner</label>
            <input
              type="text"
              value={config.adMobBannerId}
              onChange={(e) => handleAtualizar('adMobBannerId', e.target.value)}
              placeholder="ca-app-pub-XXXX/YYYY"
              className="w-full bg-[#120803] border border-[#4d2d18] rounded-lg px-2.5 py-1.5 text-xs text-stone-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 mb-0.5">ID Bloco Intersticial</label>
            <input
              type="text"
              value={config.adMobInterstitialId}
              onChange={(e) => handleAtualizar('adMobInterstitialId', e.target.value)}
              placeholder="ca-app-pub-XXXX/YYYY"
              className="w-full bg-[#120803] border border-[#4d2d18] rounded-lg px-2.5 py-1.5 text-xs text-stone-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 mb-0.5">ID Bloco Vídeo Recompensado</label>
            <input
              type="text"
              value={config.adMobRewardedId}
              onChange={(e) => handleAtualizar('adMobRewardedId', e.target.value)}
              placeholder="ca-app-pub-XXXX/YYYY"
              className="w-full bg-[#120803] border border-[#4d2d18] rounded-lg px-2.5 py-1.5 text-xs text-stone-300 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Botões do Rodapé do Painel */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleRestaurarPadrao}
          className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrões</span>
        </button>

        <a
          href="https://admob.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
        >
          <span>Consola AdMob</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
