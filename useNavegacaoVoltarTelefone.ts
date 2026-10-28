import { useEffect, useRef, useCallback } from 'react';

export type TelaAtual = 'menu' | 'preparacao' | 'jogar_online' | 'partida' | 'desafios' | 'tutorial';

interface UseNavegacaoVoltarTelefoneProps {
  telaAtual: TelaAtual;
  modalPerfilAberto: boolean;
  modalCriarCampeonatoAberto: boolean;
  modalChatAberto: boolean;
  modalConfigAberto: boolean;
  modalMenuAberto: boolean;
  modalDoacoesAberto: boolean;
  modalCompartilharAberto?: boolean;
  barraRegrasAberta: boolean;
  modalConfirmarSaidaAberto: boolean;
  modalSalvarPartidaAberto?: boolean;
  setModalPerfilAberto: (aberto: boolean) => void;
  setModalCriarCampeonatoAberto: (aberto: boolean) => void;
  setModalChatAberto: (aberto: boolean) => void;
  setModalConfigAberto: (aberto: boolean) => void;
  setModalMenuAberto: (aberto: boolean) => void;
  setModalDoacoesAberto: (aberto: boolean) => void;
  setModalCompartilharAberto?: (aberto: boolean) => void;
  setBarraRegrasAberta: (aberto: boolean) => void;
  setModalConfirmarSaidaAberto: (aberto: boolean) => void;
  setModalSalvarPartidaAberto?: (aberto: boolean) => void;
  onTentarSairPartida?: () => boolean;
  voltarAoMenuPrincipal: () => void;
  notificarFeedback: (msg: string) => void;
}

export function useNavegacaoVoltarTelefone({
  telaAtual,
  modalPerfilAberto,
  modalCriarCampeonatoAberto,
  modalChatAberto,
  modalConfigAberto,
  modalMenuAberto,
  modalDoacoesAberto,
  modalCompartilharAberto = false,
  barraRegrasAberta,
  modalConfirmarSaidaAberto,
  modalSalvarPartidaAberto = false,
  setModalPerfilAberto,
  setModalCriarCampeonatoAberto,
  setModalChatAberto,
  setModalConfigAberto,
  setModalMenuAberto,
  setModalDoacoesAberto,
  setModalCompartilharAberto,
  setBarraRegrasAberta,
  setModalConfirmarSaidaAberto,
  setModalSalvarPartidaAberto,
  onTentarSairPartida,
  voltarAoMenuPrincipal,
  notificarFeedback,
}: UseNavegacaoVoltarTelefoneProps) {
  // Referência sempre atualizada do estado de navegação (evita stale closures em eventos de navegador)
  const navStateRef = useRef({
    telaAtual,
    modalPerfilAberto,
    modalCriarCampeonatoAberto,
    modalChatAberto,
    modalConfigAberto,
    modalMenuAberto,
    modalDoacoesAberto,
    modalCompartilharAberto: !!modalCompartilharAberto,
    barraRegrasAberta,
    modalConfirmarSaidaAberto,
    modalSalvarPartidaAberto: !!modalSalvarPartidaAberto,
    onTentarSairPartida,
  });

  useEffect(() => {
    navStateRef.current = {
      telaAtual,
      modalPerfilAberto,
      modalCriarCampeonatoAberto,
      modalChatAberto,
      modalConfigAberto,
      modalMenuAberto,
      modalDoacoesAberto,
      modalCompartilharAberto: !!modalCompartilharAberto,
      barraRegrasAberta,
      modalConfirmarSaidaAberto,
      modalSalvarPartidaAberto: !!modalSalvarPartidaAberto,
      onTentarSairPartida,
    };
  });

  // Contador de entradas no histórico inseridas por nós
  const historicoPushedEntriesRef = useRef<number>(0);
  // Flag para ignorar o evento popstate quando o usuário clica nas setas na tela
  const ignorarProximoPopstateRef = useRef<boolean>(false);
  // Timestamp do último toque no botão voltar quando no menu principal
  const ultimoToqueVoltarMenuRef = useRef<number>(0);

  // Calcula o nível de profundidade atual da interface:
  // 0: Menu Principal limpo
  // 1: Telas de jogo / desafios / preparação / lobby online
  // 2: Modais principais (Chat, Configurações, Regras, Doações, Confirmação de Saída, Salvar Partida)
  // 3: Sub-modais secundários (Editar Perfil ou Criar Campeonato por cima do Chat)
  const calcularProfundidade = useCallback((state = navStateRef.current): number => {
    if (state.modalPerfilAberto || state.modalCriarCampeonatoAberto) return 3;
    if (
      state.modalChatAberto ||
      state.modalConfigAberto ||
      state.modalMenuAberto ||
      state.modalDoacoesAberto ||
      state.modalCompartilharAberto ||
      state.barraRegrasAberta ||
      state.modalConfirmarSaidaAberto ||
      state.modalSalvarPartidaAberto
    ) {
      return 2;
    }
    if (state.telaAtual !== 'menu') return 1;
    return 0;
  }, []);

  const profundidadeAnteriorRef = useRef<number>(calcularProfundidade());

  // Ação atômica de voltar / sair que espelha exatamente as setas na tela
  const executarAcaoVoltar = useCallback((): boolean => {
    const s = navStateRef.current;

    // 1. Sub-modais de nível 3 (Perfil ou Novo Campeonato dentro do Chat)
    if (s.modalPerfilAberto) {
      setModalPerfilAberto(false);
      return true;
    }
    if (s.modalCriarCampeonatoAberto) {
      setModalCriarCampeonatoAberto(false);
      return true;
    }

    // 2. Se o modal de salvar partida estiver aberto, fecha-o (cancela e continua na partida)
    if (s.modalSalvarPartidaAberto) {
      if (setModalSalvarPartidaAberto) {
        setModalSalvarPartidaAberto(false);
      }
      return true;
    }

    // 3. Se o modal de confirmação de saída do app já estiver aberto, fecha-o
    if (s.modalConfirmarSaidaAberto) {
      setModalConfirmarSaidaAberto(false);
      return true;
    }

    // 4. Modais principais de nível 2
    if (s.modalChatAberto) {
      setModalChatAberto(false);
      notificarFeedback('Chat fechado.');
      return true;
    }
    if (s.modalConfigAberto) {
      setModalConfigAberto(false);
      notificarFeedback('Definições fechadas.');
      return true;
    }
    if (s.modalMenuAberto) {
      setModalMenuAberto(false);
      notificarFeedback('Regras fechadas.');
      return true;
    }
    if (s.modalDoacoesAberto) {
      setModalDoacoesAberto(false);
      return true;
    }
    if (s.modalCompartilharAberto && setModalCompartilharAberto) {
      setModalCompartilharAberto(false);
      return true;
    }
    if (s.barraRegrasAberta) {
      setBarraRegrasAberta(false);
      return true;
    }

    // 5. Se estiver em Partida Ativa, invoca o manipulador especializado com verificação de duplo clique e salvar partida
    if (s.telaAtual === 'partida') {
      if (onTentarSairPartida) {
        return onTentarSairPartida();
      }
    }

    // 6. Sub-telas de nível 1 (Desafios, Preparação, Jogar Online)
    if (s.telaAtual !== 'menu') {
      voltarAoMenuPrincipal();
      notificarFeedback('Retornou ao Menu Principal.');
      return true;
    }

    // 7. Nível 0: Já está no Menu Principal com tudo fechado
    const agora = Date.now();
    if (agora - ultimoToqueVoltarMenuRef.current < 2500) {
      // Duplo clique rápido no botão voltar do telefone para sair
      if ((navigator as any)?.app?.exitApp) {
        (navigator as any).app.exitApp();
      } else {
        try {
          window.close();
        } catch {}
        notificarFeedback('Saindo do aplicativo...');
      }
      return true;
    }

    ultimoToqueVoltarMenuRef.current = agora;
    setModalConfirmarSaidaAberto(true);
    return false;
  }, [
    setModalPerfilAberto,
    setModalCriarCampeonatoAberto,
    setModalSalvarPartidaAberto,
    setModalConfirmarSaidaAberto,
    setModalChatAberto,
    setModalConfigAberto,
    setModalMenuAberto,
    setModalDoacoesAberto,
    setBarraRegrasAberta,
    onTentarSairPartida,
    voltarAoMenuPrincipal,
    notificarFeedback,
  ]);

  // Função invocada quando o usuário clica nas setas e botões de voltar/sair na tela
  // (faz a mesma ação e mantém a pilha de histórico do telefone 100% sincronizada)
  const voltarComSetaOuBotao = useCallback((): boolean => {
    const acaoRealizada = executarAcaoVoltar();
    if (acaoRealizada && historicoPushedEntriesRef.current > 0) {
      ignorarProximoPopstateRef.current = true;
      historicoPushedEntriesRef.current -= 1;
      try {
        window.history.back();
      } catch {}
    }
    return acaoRealizada;
  }, [executarAcaoVoltar]);

  // Monitora alterações na profundidade e empurra estado no histórico do navegador
  useEffect(() => {
    const profAtual = calcularProfundidade();
    const profAnterior = profundidadeAnteriorRef.current;
    profundidadeAnteriorRef.current = profAtual;

    if (profAtual > profAnterior) {
      try {
        window.history.pushState(
          { ntxuva: true, prof: profAtual, timestamp: Date.now() },
          '',
          window.location.pathname
        );
        historicoPushedEntriesRef.current += 1;
      } catch {}
    }
  }, [
    telaAtual,
    modalPerfilAberto,
    modalCriarCampeonatoAberto,
    modalChatAberto,
    modalConfigAberto,
    modalMenuAberto,
    modalDoacoesAberto,
    barraRegrasAberta,
    modalConfirmarSaidaAberto,
    modalSalvarPartidaAberto,
    calcularProfundidade,
  ]);

  // Registra os ouvintes globais do telefone:
  // - popstate (botão voltar físico/virtual/gesto do Android e navegadores móveis)
  // - backbutton (botão voltar do hardware em ambientes Android / Cordova / Capacitor)
  // - keydown Escape (teclado)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (ignorarProximoPopstateRef.current) {
        ignorarProximoPopstateRef.current = false;
        return;
      }

      // Executa a saída correspondente ao item aberto
      const acaoRealizada = executarAcaoVoltar();

      if (acaoRealizada) {
        if (historicoPushedEntriesRef.current > 0) {
          historicoPushedEntriesRef.current -= 1;
        }
      } else {
        // Se a ação foi cancelada/interceptada (ex: primeiro clique com aviso "Dá dois cliques se quiser sair"):
        // Restaura a entrada no histórico para manter a sincronização perfeita
        try {
          window.history.pushState(
            { ntxuva: true, prof: calcularProfundidade(), timestamp: Date.now() },
            '',
            window.location.pathname
          );
        } catch {}
      }
    };

    const handleHardwareBackButton = (e: Event) => {
      if (e && 'preventDefault' in e) e.preventDefault();
      voltarComSetaOuBotao();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        voltarComSetaOuBotao();
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('backbutton', handleHardwareBackButton);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('backbutton', handleHardwareBackButton);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [executarAcaoVoltar, voltarComSetaOuBotao, calcularProfundidade]);

  return {
    voltarComSetaOuBotao,
    executarAcaoVoltar,
  };
}
