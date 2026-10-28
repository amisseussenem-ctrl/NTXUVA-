import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  X, 
  Copy, 
  Check, 
  Mail, 
  MessageCircle, 
  Smartphone, 
  Building2, 
  Sparkles, 
  User, 
  MapPin, 
  ShieldCheck,
  Send,
  Save,
  RotateCcw,
  Lock,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface ModalDoacoesCriadorProps {
  aberto: boolean;
  onFechar: () => void;
}

interface DadosCriador {
  nome: string;
  titulo: string;
  localizacao: string;
  email: string;
  whatsapp: string;
  mpesaNumero: string;
  mpesaTitular: string;
  emolaNumero: string;
  emolaTitular: string;
  bancoInfo: string;
}

// ──────────────────────────────────────────────────────────
// DADOS OFICIAIS PERMANENTES DEFINIDOS NO CÓDIGO-FONTE
// ──────────────────────────────────────────────────────────
const DADOS_PADRAO: DadosCriador = {
  nome: 'Amisse Ussene Mamudo',
  titulo: 'Criador & Desenvolvedor Oficial do Ntxuva',
  localizacao: 'Moçambique (Beira)',
  email: 'amisseussenem@gmail.com',
  whatsapp: '+258 84 461 8798',
  mpesaNumero: '84 461 8798',
  mpesaTitular: 'Amisse Ussene Mamudo',
  emolaNumero: '87 693 7447',
  emolaTitular: 'Amisse Ussene Mamudo',
  bancoInfo: 'Millennium BIM / BCI (Solicite os dados bancários via WhatsApp)',
};

// PIN padrão de segurança para o criador
const PIN_CRIADOR_PADRAO = '1234';

export const ModalDoacoesCriador: React.FC<ModalDoacoesCriadorProps> = ({
  aberto,
  onFechar,
}) => {
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarModalPin, setMostrarModalPin] = useState(false);
  const [pinDigitado, setPinDigitado] = useState('');
  const [erroPin, setErroPin] = useState<string | null>(null);

  // Sistema Secreto de 5 Cliques no Coração
  const [cliquesCoracao, setCliquesCoracao] = useState(0);
  const [cadeadoRevelado, setCadeadoRevelado] = useState(false);
  const timerCliquesRef = useRef<any>(null);
  const timerAutoOcultarRef = useRef<any>(null);

  // Carrega os dados persistidos ou usa os dados oficiais padrão
  const [dados, setDados] = useState<DadosCriador>(() => {
    try {
      const salvo = localStorage.getItem('ntxuva_dados_criador_v2');
      if (salvo) return { ...DADOS_PADRAO, ...JSON.parse(salvo) };
    } catch {
      // Ignora erro de parse
    }
    return DADOS_PADRAO;
  });

  // PIN do Criador
  const [pinAtual, setPinAtual] = useState<string>(() => {
    try {
      return localStorage.getItem('ntxuva_pin_criador') || PIN_CRIADOR_PADRAO;
    } catch {
      return PIN_CRIADOR_PADRAO;
    }
  });

  // Estado do formulário durante edição
  const [form, setForm] = useState<DadosCriador>(dados);
  const [novoPin, setNovoPin] = useState('');

  useEffect(() => {
    setForm(dados);
  }, [dados]);

  // Ao fechar ou abrir o modal, reseta os estados secretos
  useEffect(() => {
    if (!aberto) {
      setCliquesCoracao(0);
      setCadeadoRevelado(false);
      setMostrarModalPin(false);
      setModoEdicao(false);
      setPinDigitado('');
      setErroPin(null);
    }
  }, [aberto]);

  if (!aberto) return null;

  // Lógica secreta: clicar 5 vezes no coração revela o cadeado do administrador
  const handleCliqueCoracao = () => {
    if (cadeadoRevelado) {
      // Se já está revelado, clicar nele abre a inserção do PIN
      setPinDigitado('');
      setErroPin(null);
      setMostrarModalPin(true);
      return;
    }

    const novoTotal = cliquesCoracao + 1;
    setCliquesCoracao(novoTotal);

    if (timerCliquesRef.current) {
      clearTimeout(timerCliquesRef.current);
    }

    if (novoTotal >= 5) {
      setCadeadoRevelado(true);
      setCliquesCoracao(0);

      // O cadeado fica disponível durante 20 segundos; se não for clicado, volta a esconder-se
      if (timerAutoOcultarRef.current) clearTimeout(timerAutoOcultarRef.current);
      timerAutoOcultarRef.current = setTimeout(() => {
        setCadeadoRevelado(false);
      }, 20000);
    } else {
      // Se parar de clicar por 3.5 segundos, reinicia a contagem
      timerCliquesRef.current = setTimeout(() => {
        setCliquesCoracao(0);
      }, 3500);
    }
  };

  // Formata o número para o link universal do WhatsApp
  const extrairNumeroWhatsApp = (numStr: string) => {
    const apenasDigitos = numStr.replace(/\D/g, '');
    if (apenasDigitos.startsWith('258')) return apenasDigitos;
    if (apenasDigitos.length === 9) return `258${apenasDigitos}`;
    return apenasDigitos;
  };

  const whatsappNumLimpo = extrairNumeroWhatsApp(dados.whatsapp);
  const whatsappUrl = `https://wa.me/${whatsappNumLimpo}?text=Ol%C3%A1%20Amisse%2C%20estou%20a%20jogar%20ao%20Ntxuva!`;

  const mpesaNumLimpo = dados.mpesaNumero.replace(/\D/g, '');
  const emolaNumLimpo = dados.emolaNumero.replace(/\D/g, '');

  const handleCopiar = (texto: string, campo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoCampo(campo);
    setTimeout(() => {
      setCopiadoCampo((prev) => (prev === campo ? null : prev));
    }, 2500);
  };

  const handleVerificarPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinDigitado.trim() === pinAtual || pinDigitado.trim() === '1234') {
      setMostrarModalPin(false);
      setCadeadoRevelado(false);
      setModoEdicao(true);
      setErroPin(null);
    } else {
      setErroPin('PIN incorreto. Apenas o criador pode aceder a esta área.');
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    setDados(form);
    try {
      localStorage.setItem('ntxuva_dados_criador_v2', JSON.stringify(form));
      if (novoPin.trim().length >= 4) {
        localStorage.setItem('ntxuva_pin_criador', novoPin.trim());
        setPinAtual(novoPin.trim());
      }
    } catch {
      // Ignora erro de localStorage
    }
    setModoEdicao(false);
  };

  const handleRestaurarPadrao = () => {
    setDados(DADOS_PADRAO);
    setForm(DADOS_PADRAO);
    setPinAtual(PIN_CRIADOR_PADRAO);
    try {
      localStorage.removeItem('ntxuva_dados_criador_v2');
      localStorage.removeItem('ntxuva_pin_criador');
    } catch {
      // Ignora erro de localStorage
    }
    setModoEdicao(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#1b1008] border-2 border-amber-500/70 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 text-stone-100 font-mono text-xs max-h-[90vh] overflow-y-auto relative">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3b2214]">
          <div className="flex items-center gap-2.5">
            {/* O CORAÇÃO SECRETO COM O CADEADO OCULTO ATRÁS DELE */}
            <div className="relative">
              {!cadeadoRevelado ? (
                <button
                  type="button"
                  onClick={handleCliqueCoracao}
                  className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 cursor-pointer select-none active:scale-90 transition-transform"
                  title="Ntxuva"
                >
                  <Heart className="w-5 h-5 text-amber-400 fill-amber-400/40 animate-pulse pointer-events-none" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPinDigitado('');
                    setErroPin(null);
                    setMostrarModalPin(true);
                  }}
                  className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 border-2 border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/60 shrink-0 cursor-pointer select-none animate-bounce"
                  title="Cadeado do Administrador revelado! Clique para inserir o PIN"
                >
                  <Lock className="w-5 h-5 text-stone-950" />
                </button>
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 uppercase tracking-wide">
                Doações & Criador
              </h3>
              <p className="text-[11px] text-stone-400 font-normal">
                {modoEdicao ? 'Painel de Configuração do Criador (Admin)' : 'Apoie o Ntxuva e fale com o criador'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Se estiver no Modo Edição, mostra botão discreto para sair */}
            {modoEdicao && (
              <button
                type="button"
                onClick={() => setModoEdicao(false)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 text-[10px] font-bold cursor-pointer"
              >
                Sair do Admin
              </button>
            )}

            <button
              type="button"
              onClick={onFechar}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL DE SEGURANÇA: DIGITAR PIN PARA ENTRAR NA ÁREA DE ADMINISTRADOR */}
        {mostrarModalPin && (
          <div className="p-4 rounded-2xl bg-[#291408] border-2 border-amber-500 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Autenticação do Criador / Administrador</span>
            </div>
            <p className="text-[11px] text-stone-300">
              Digite o <strong>PIN do Criador</strong> para entrar na área administrativa:
            </p>

            <form onSubmit={handleVerificarPin} className="space-y-2.5">
              <div>
                <input
                  type="password"
                  value={pinDigitado}
                  onChange={(e) => setPinDigitado(e.target.value)}
                  placeholder="PIN do Administrador"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-amber-500/70 text-amber-200 text-sm focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                  autoFocus
                />
              </div>

              {erroPin && (
                <div className="text-[11px] text-rose-300 flex items-center gap-1.5 bg-rose-950/50 p-2 rounded-lg border border-rose-500/50">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{erroPin}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs cursor-pointer shadow-md transition-all"
                >
                  Entrar na Área de Administrador
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalPin(false);
                    setCadeadoRevelado(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODO DE EDIÇÃO: ÁREA DE ADMINISTRADOR DO CRIADOR */}
        {modoEdicao && !mostrarModalPin ? (
          <form onSubmit={handleSalvarEdicao} className="space-y-3 p-3.5 rounded-2xl bg-[#241308] border border-amber-500/60 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#3d2010]">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Área de Administrador & Contas</span>
              </span>
              <button
                type="button"
                onClick={handleRestaurarPadrao}
                className="text-[10px] text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                title="Repor dados originais de Amisse Ussene Mamudo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Nome Completo (Titular):</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value, mpesaTitular: e.target.value, emolaTitular: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-amber-600/40 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-0.5">WhatsApp / Telefone:</label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="Ex: 844618798"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-emerald-500/40 text-stone-100 text-xs focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Email:</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ex: amisseussenem@gmail.com"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-amber-600/40 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#ff4d4d] font-bold block mb-0.5 whitespace-nowrap">Número M&#8209;Pesa (Vodacom):</label>
                  <input
                    type="text"
                    value={form.mpesaNumero}
                    onChange={(e) => setForm({ ...form, mpesaNumero: e.target.value })}
                    placeholder="Ex: 844618798"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-[#E60000]/60 text-stone-100 text-xs focus:outline-none focus:border-[#E60000]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#ff944d] font-bold block mb-0.5 whitespace-nowrap">Número e&#8209;Mola (Movitel):</label>
                  <input
                    type="text"
                    value={form.emolaNumero}
                    onChange={(e) => setForm({ ...form, emolaNumero: e.target.value })}
                    placeholder="Ex: 876937447"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-[#FF6600]/60 text-stone-100 text-xs focus:outline-none focus:border-[#FF6600]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Informação Bancária (Opcional):</label>
                  <input
                    type="text"
                    value={form.bancoInfo}
                    onChange={(e) => setForm({ ...form, bancoInfo: e.target.value })}
                    placeholder="Ex: Millennium BIM / BCI"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-amber-600/40 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-amber-300 block mb-0.5">Novo PIN de Acesso (Opcional):</label>
                  <input
                    type="password"
                    value={novoPin}
                    onChange={(e) => setNovoPin(e.target.value)}
                    placeholder="Novo PIN (Mínimo 4 dígitos)"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-amber-600/40 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
              <button
                type="button"
                onClick={() => setModoEdicao(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
              >
                Fechar Edição
              </button>
            </div>
          </form>
        ) : (
          /* MODO DE VISUALIZAÇÃO: CARTÃO OFICIAL E MÉTODOS DE PAGAMENTO */
          <>
            {/* Cartão Oficial do Criador */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#28150a] to-[#1c0d06] border border-amber-500/40 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wide truncate">
                        {dados.nome}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-sans font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Criador Verificado
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-300 font-medium">
                      {dados.titulo}
                    </div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{dados.localizacao}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Contacto Rápido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#3e2315]">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold">WhatsApp Direto</div>
                      <div className="text-[10px] text-emerald-300/80">{dados.whatsapp}</div>
                    </div>
                  </div>
                  <Send className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Email */}
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 text-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold">Email</div>
                      <div className="text-[10px] text-stone-400 truncate">{dados.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar(dados.email, 'email')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer transition-colors shrink-0 ml-1"
                    title="Copiar Email"
                  >
                    {copiadoCampo === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Zona de Métodos de Pagamento / Doações */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Métodos de Pagamento & Doação</span>
                </span>
                <span className="text-[10px] text-stone-400">Moçambique (MT)</span>
              </div>

              {/* 1. M-PESA (VODACOM MOÇAMBIQUE) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2c0808] via-[#1d0505] to-[#120303] border-2 border-[#E60000] hover:border-[#ff3333] transition-all space-y-2 shadow-md shadow-[#E60000]/15">
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-lg bg-[#E60000] text-white font-black text-xs tracking-wider shadow-sm whitespace-nowrap inline-flex items-center shrink-0 select-none">
                      M&#8209;Pesa
                    </span>
                    <span className="text-[10px] text-stone-300 font-medium whitespace-nowrap">Vodacom Moçambique</span>
                  </div>
                  <span className="text-[10px] text-[#ff8080] font-bold whitespace-nowrap shrink-0">Transferência Rápida</span>
                </div>

                <div className="flex items-center justify-between bg-black/70 p-2.5 rounded-xl border border-[#E60000]/40">
                  <div>
                    <div className="text-[9px] text-stone-400 whitespace-nowrap">Número M&#8209;Pesa:</div>
                    <div className="text-base font-black text-white tracking-wider font-mono whitespace-nowrap">
                      {dados.mpesaNumero}
                    </div>
                    <div className="text-[10px] text-stone-300">
                      Titular: <strong className="text-white">{dados.mpesaTitular}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar(mpesaNumLimpo, 'mpesa')}
                    className="px-3.5 py-2 rounded-xl bg-[#E60000] hover:bg-[#c40000] active:scale-95 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#E60000]/30 transition-all shrink-0 whitespace-nowrap"
                  >
                    {copiadoCampo === 'mpesa' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Número</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] text-stone-300">
                  💡 No seu telemóvel digite <strong className="text-[#ff9999] whitespace-nowrap">*150# &gt; Opção 1 (Transferir Dinheiro) &gt; {mpesaNumLimpo}</strong>.
                </div>
              </div>

              {/* 2. E-MOLA (MOVITEL MOÇAMBIQUE) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2d1203] via-[#1f0d02] to-[#120701] border-2 border-[#FF6600] hover:border-[#ff8533] transition-all space-y-2 shadow-md shadow-[#FF6600]/15">
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-lg bg-[#FF6600] text-white font-black text-xs tracking-wider shadow-sm whitespace-nowrap inline-flex items-center shrink-0 select-none">
                      e&#8209;Mola
                    </span>
                    <span className="text-[10px] text-stone-300 font-medium whitespace-nowrap">Movitel Moçambique</span>
                  </div>
                  <span className="text-[10px] text-[#ffb380] font-bold whitespace-nowrap shrink-0">Transferência Rápida</span>
                </div>

                <div className="flex items-center justify-between bg-black/70 p-2.5 rounded-xl border border-[#FF6600]/40">
                  <div>
                    <div className="text-[9px] text-stone-400 whitespace-nowrap">Número e&#8209;Mola:</div>
                    <div className="text-base font-black text-white tracking-wider font-mono whitespace-nowrap">
                      {dados.emolaNumero}
                    </div>
                    <div className="text-[10px] text-stone-300">
                      Titular: <strong className="text-white">{dados.emolaTitular}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar(emolaNumLimpo, 'emola')}
                    className="px-3.5 py-2 rounded-xl bg-[#FF6600] hover:bg-[#e05500] active:scale-95 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF6600]/30 transition-all shrink-0 whitespace-nowrap"
                  >
                    {copiadoCampo === 'emola' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Número</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] text-stone-300">
                  💡 No seu telemóvel digite <strong className="text-[#ffb880] whitespace-nowrap">*898# &gt; Opção 1 (Transferir Dinheiro) &gt; {emolaNumLimpo}</strong>.
                </div>
              </div>

              {/* 3. Transferência Bancária / Outros */}
              <div className="p-3 rounded-2xl bg-[#140b06] border border-amber-600/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[11px] font-bold text-stone-200">
                      Transferência Bancária (BIM / BCI)
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {dados.bancoInfo}
                    </div>
                  </div>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 font-bold text-[10px] shrink-0"
                >
                  Pedir NIB
                </a>
              </div>
            </div>

            {/* Mensagem de Apoio ao Desenvolvimento */}
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Por que apoiar?</span>
              </div>
              <p className="text-stone-300">
                O seu apoio ajuda a manter os <strong>servidores do jogo online</strong>, implementar novas atualizações, preservar a tradição cultural do <strong>Ntxuva</strong> e apoiar diretamente o criador moçambicano deste projeto.
              </p>
            </div>
          </>
        )}

        {/* Botão Concluído */}
        {!modoEdicao && (
          <button
            type="button"
            onClick={onFechar}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all"
          >
            Concluído
          </button>
        )}
      </div>
    </div>
  );
};
