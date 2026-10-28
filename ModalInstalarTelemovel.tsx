import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  PlusSquare, 
  Copy, 
  Check, 
  MessageCircle,
  AlertTriangle,
  MoreVertical,
  Compass,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ModalInstalarTelemovelProps {
  aberto: boolean;
  onFechar: () => void;
}

export const LINK_OFICIAL_APP = 'https://ais-pre-m7z6m33bgkhm6ni3hfvygd-897447642738.europe-west2.run.app';

export const ModalInstalarTelemovel: React.FC<ModalInstalarTelemovelProps> = ({
  aberto,
  onFechar,
}) => {
  const { isInstallable, isInstalled, isIOS, isInAppBrowser, install, marcarComoInstalado } = usePWAInstall();
  const [copiado, setCopiado] = useState(false);
  const [instalando, setInstalando] = useState(false);
  const [instaladoComSucesso, setInstaladoComSucesso] = useState(false);
  const [tentativaFeita, setTentativaFeita] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'android' | 'ios'>(() => {
    if (isIOS) return 'ios';
    return 'android';
  });

  if (!aberto) return null;

  const handleInstalarDireto = async () => {
    setInstalando(true);
    setTentativaFeita(true);

    if (isInstallable) {
      try {
        const instalado = await install();
        if (instalado) {
          marcarComoInstalado();
          setInstaladoComSucesso(true);
          setTimeout(onFechar, 2000);
          return;
        }
      } catch (err) {
        console.warn('[PWA] Erro ao instalar:', err);
      } finally {
        setInstalando(false);
      }
    } else {
      // Quando não é suportado pelo navegador via script (ex: iPhone ou Chrome sem prompt prévio)
      setTimeout(() => {
        setInstalando(false);
      }, 300);
    }
  };

  const copiarLinkOficial = async () => {
    try {
      await navigator.clipboard.writeText(LINK_OFICIAL_APP);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = LINK_OFICIAL_APP;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const textoWhatsApp = encodeURIComponent(
    `🎮 Vem jogar NTXUVA comigo online! O jogo tradicional de África de tabuleiro (24 casas e 48 pedras). Instale no seu telemóvel:\n${LINK_OFICIAL_APP}`
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-fadeIn font-mono"
      onClick={onFechar}
    >
      <div 
        className="w-full max-w-md rounded-3xl bg-[#1a0f08] border-2 border-emerald-500/70 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-stone-100 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d2315]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Smartphone className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200 uppercase tracking-wide leading-tight">
                Instalar no Telemóvel
              </h2>
              <p className="text-[11px] text-stone-400">
                Adicione o NTXUVA ao seu ecrã principal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-[#4d2d18] text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ALERTA: Se o utilizador abriu dentro do WhatsApp */}
        {isInAppBrowser && (
          <div className="p-3.5 rounded-2xl bg-amber-950/70 border-2 border-amber-500 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Você está dentro do WhatsApp!</span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              O navegador interno do WhatsApp bloqueia a instalação de aplicativos.
            </p>
            <div className="bg-[#24130a] p-2.5 rounded-xl border border-amber-600/40 text-[11px] text-stone-200 space-y-1.5">
              <p className="flex items-center gap-1.5 font-bold text-amber-200">
                <MoreVertical className="w-3.5 h-3.5 text-amber-400" />
                1. Toque nos 3 pontinhos (⋮) no topo direito do WhatsApp
              </p>
              <p className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                2. Selecione «Abrir no Chrome» ou «Abrir no navegador»
              </p>
            </div>
            <button
              type="button"
              onClick={copiarLinkOficial}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiado ? 'Link Copiado! Cole no Chrome' : 'Copiar Link e Abrir no Chrome'}</span>
            </button>
          </div>
        )}

        {/* Card do Aplicativo Oficial */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#27140a] to-emerald-950/40 border border-amber-600/30 flex items-center gap-3">
          <img 
            src="/ntxuva-icon.png" 
            alt="Ícone Oficial NTXUVA" 
            className="w-14 h-14 rounded-2xl border-2 border-amber-500/60 shadow-md shrink-0 bg-[#26160d] object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-black text-sm text-amber-200">NTXUVA</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                PWA Oficial
              </span>
            </div>
            <p className="text-[11px] text-stone-300 truncate">
              O Jogo Tradicional de África (4x6)
            </p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-400/90">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Leve &amp; Rápido
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Sem Anúncios
              </span>
            </div>
          </div>
        </div>

        {/* FEEDBACK DE SUCESSO SE INSTALADO AGORA */}
        {instaladoComSucesso && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center gap-2.5 text-xs text-emerald-200 animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-black text-sm text-emerald-300">Instalação Concluída!</p>
              <p className="text-[11px] text-emerald-100">O ícone do NTXUVA já está no seu ecrã principal.</p>
            </div>
          </div>
        )}

        {/* BOTÃO PRINCIPAL DE INSTALAÇÃO */}
        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/60 flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">NTXUVA já está instalado!</p>
              <p className="text-[11px] text-emerald-300/80">O jogo já se encontra no ecrã inicial do seu telemóvel.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {isInstallable ? (
              <button
                type="button"
                onClick={handleInstalarDireto}
                disabled={instalando}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 active:scale-98 text-stone-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/80 border-2 border-emerald-200 transition-all animate-pulse"
              >
                <Download className="w-5 h-5 text-stone-950 shrink-0" />
                <span>{instalando ? 'A preparar instalação...' : '⚡ Instalar no Telemóvel Agora'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInstalarDireto}
                className={`w-full py-3.5 px-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm uppercase font-black border-2 ${
                  tentativaFeita 
                    ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400 shadow-md'
                }`}
              >
                <Smartphone className="w-5 h-5 shrink-0" />
                <span>
                  {tentativaFeita ? '👉 Siga os 2 Passos Abaixo' : '📱 Toque Aqui Para Ver Onde Instalar'}
                </span>
              </button>
            )}

            {/* Aviso Explicativo Amigável */}
            {tentativaFeita && !isInstallable && (
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/60 text-[11px] text-amber-200 space-y-1 animate-fadeIn">
                <p className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Por que precisa ser pelo menu?
                </p>
                <p className="text-stone-300 leading-relaxed">
                  Por segurança, os telemóveis (Apple Safari e Chrome Mobile) exigem que você confirme a instalação diretamente no menu do navegador. Veja os passos simples logo abaixo:
                </p>
              </div>
            )}
          </div>
        )}

        {/* GUIA PASSO A PASSO (ANDROID OU IPHONE) */}
        {!isInstalled && (
          <div className={`space-y-2 pt-1 ${tentativaFeita ? 'ring-2 ring-emerald-500/80 rounded-2xl p-2 bg-[#170c06]' : ''}`}>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#140b06] border border-[#3d2315]">
              <button
                type="button"
                onClick={() => setAbaAtiva('android')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  abaAtiva === 'android'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🤖 Android (Google Chrome)</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('ios')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  abaAtiva === 'ios'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🍏 iPhone (Safari)</span>
              </button>
            </div>

            {/* Passos Android */}
            {abaAtiva === 'android' && (
              <div className="p-3.5 rounded-2xl bg-[#150c07] border border-[#442312] text-xs space-y-2.5">
                <div className="font-black text-amber-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Como instalar no Chrome (Android):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">Super rápido (10 seg)</span>
                </div>
                <ol className="space-y-2 text-[11px] text-stone-200">
                  <li className="flex items-start gap-2.5 bg-[#22120a] p-2.5 rounded-xl border border-[#3a1d0f]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                    <div>
                      No topo direito do Chrome, toque no menu dos <strong className="text-white">3 pontinhos (⋮)</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-[#22120a] p-2.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-transparent">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-black flex items-center justify-center text-[10px] shrink-0">2</span>
                    <div>
                      Toque na opção <strong className="text-emerald-300 uppercase underline decoration-emerald-500 underline-offset-2">«Instalar aplicação»</strong> ou <strong className="text-emerald-300">«Adicionar ao ecrã inicial»</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-[#22120a] p-2.5 rounded-xl border border-[#3a1d0f]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <div>
                      Toque em <strong className="text-emerald-400">«Instalar»</strong> para confirmar. O jogo NTXUVA abrirá como um aplicativo normal!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Passos iPhone / iPad */}
            {abaAtiva === 'ios' && (
              <div className="p-3.5 rounded-2xl bg-[#150c07] border border-[#442312] text-xs space-y-2.5">
                <div className="font-black text-amber-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Como instalar no iPhone (Safari):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">Padrão da Apple</span>
                </div>
                <ol className="space-y-2 text-[11px] text-stone-200">
                  <li className="flex items-start gap-2.5 bg-[#22120a] p-2.5 rounded-xl border border-[#3a1d0f]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                    <div>
                      Na barra inferior do <strong>Safari</strong>, toque no botão de <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 text-sky-400" /> Partilhar</strong> (o quadrado com seta para cima).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-[#22120a] p-2.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-transparent">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-black flex items-center justify-center text-[10px] shrink-0">2</span>
                    <div>
                      Role a lista e toque em <strong className="text-amber-200 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-amber-400" /> «Adicionar ao Ecrã Principal»</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-[#22120a] p-2.5 rounded-xl border border-[#3a1d0f]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <div>
                      Toque em <strong className="text-emerald-400">«Adicionar»</strong> no canto superior direito. Pronto!
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Rodapé: Convidar amigo / Copiar Link Oficial */}
        <div className="pt-2 border-t border-[#3d2315] space-y-2">
          <div className="flex items-center gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${textoWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-stone-950" />
              <span>Convidar no WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={copiarLinkOficial}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copiado
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-[#26140b] hover:bg-[#361c0e] text-stone-200 border-[#4d2d18]'
              }`}
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="w-full py-2.5 rounded-xl bg-[#29170c] hover:bg-[#382012] border border-[#4d2d18] text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>Voltar ao Jogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
