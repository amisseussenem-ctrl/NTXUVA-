export type TipoAnuncio = 'banner' | 'intersticial' | 'recompensado';

export interface CampanhaAnuncio {
  id: string;
  titulo: string;
  anunciante: string;
  descricao: string;
  categoria: string;
  ctaTexto: string;
  urlDestino: string;
  badge: string;
  iconeEmoji: string;
  gradienteCor: string;
}

export interface ConfiguracaoAnuncios {
  habilitado: boolean;
  modoTeste: boolean;
  frequenciaIntersticialPartidas: number;
  recompensaMoedasVideo: number;
  adMobPublisherId: string;
  adMobBannerId: string;
  adMobInterstitialId: string;
  adMobRewardedId: string;
  exibirBannerMenu: boolean;
  exibirBannerJogo: boolean;
}

export interface EstatisticasAnuncios {
  totalBannersExibidos: number;
  totalIntersticiaisExibidos: number;
  totalRecompensadosAssistidos: number;
  totalMoedasRecompensadas: number;
  dataUltimaExibicao: string | null;
}
