import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc,
  getDocs,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  PerfilJogador, 
  MensagemChat, 
  CampeonatoNtxuva, 
  ParticipanteCampeonato,
  PartidaCampeonato 
} from '../types/online';

const PERFIL_STORAGE_KEY = 'ntxuva_user_profile';

export const AVATARES_PREDEFINIDOS = [
  { id: 'chopi', emoji: '🛡️', nome: 'Guerreiro Chopi', desc: 'Tradição e coragem' },
  { id: 'mestre', emoji: '👑', nome: 'Mestre do Ntxuva', desc: 'Estrategista experiente' },
  { id: 'leao', emoji: '🦁', nome: 'Leão de Gorongosa', desc: 'Ataque feroz e destemido' },
  { id: 'aguia', emoji: '🦅', nome: 'Águia de Sofala', desc: 'Visão panorâmica do jogo' },
  { id: 'rainha', emoji: '👸', nome: 'Rainha do Zambeze', desc: 'Elegância e mestria' },
  { id: 'kota', emoji: '🧓', nome: 'Kota Sábio', desc: 'Paciência dos anciãos' },
  { id: 'tatico', emoji: '⚡', nome: 'Jovem Tático', desc: 'Velocidade e precisão' },
  { id: 'mar', emoji: '🌊', nome: 'Guardião de Pemba', desc: 'Fluidez como as marés' },
  { id: 'sol', emoji: '☀️', nome: 'Sol de Inhambane', desc: 'Luz nas jogadas complexas' },
  { id: 'feiticeiro', emoji: '🔮', nome: 'Mago do Tabuleiro', desc: 'Golpes imprevistos' },
];

export const PAISES_REGIOES = [
  { id: 'MZ-MAP', nome: '🇲🇿 Moçambique (Maputo)', bandeira: '🇲🇿' },
  { id: 'MZ-BEI', nome: '🇲🇿 Moçambique (Beira / Sofala)', bandeira: '🇲🇿' },
  { id: 'MZ-NAM', nome: '🇲🇿 Moçambique (Nampula)', bandeira: '🇲🇿' },
  { id: 'MZ-TET', nome: '🇲🇿 Moçambique (Tete)', bandeira: '🇲🇿' },
  { id: 'MZ-INH', nome: '🇲🇿 Moçambique (Inhambane)', bandeira: '🇲🇿' },
  { id: 'MZ-GAZ', nome: '🇲🇿 Moçambique (Gaza / Xai-Xai)', bandeira: '🇲🇿' },
  { id: 'MZ-CAB', nome: '🇲🇿 Moçambique (Cabo Delgado / Pemba)', bandeira: '🇲🇿' },
  { id: 'MZ-ZAM', nome: '🇲🇿 Moçambique (Zambézia / Quelimane)', bandeira: '🇲🇿' },
  { id: 'MZ-NIA', nome: '🇲🇿 Moçambique (Niassa / Lichinga)', bandeira: '🇲🇿' },
  { id: 'MZ-MAN', nome: '🇲🇿 Moçambique (Manica / Chimoio)', bandeira: '🇲🇿' },
  { id: 'AO', nome: '🇦🇴 Angola', bandeira: '🇦🇴' },
  { id: 'PT', nome: '🇵🇹 Portugal', bandeira: '🇵🇹' },
  { id: 'BR', nome: '🇧🇷 Brasil', bandeira: '🇧🇷' },
  { id: 'ZA', nome: '🇿🇦 África do Sul', bandeira: '🇿🇦' },
  { id: 'CV', nome: '🇨🇻 Cabo Verde', bandeira: '🇨🇻' },
  { id: 'ST', nome: '🇸🇹 São Tomé e Príncipe', bandeira: '🇸🇹' },
  { id: 'GW', nome: '🇬🇼 Guiné-Bissau', bandeira: '🇬🇼' },
  { id: 'MUNDO', nome: '🌍 Outro País', bandeira: '🌍' },
];

// Gerar ID único para novo perfil
function gerarIdPerfil(): string {
  return `ntx_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const comunidadeService = {
  // ==========================================
  // 1. GESTÃO DE PERFIL DO JOGADOR
  // ==========================================
  obterPerfilLocal(): PerfilJogador {
    try {
      const salvo = localStorage.getItem(PERFIL_STORAGE_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.id && parsed.nome) return parsed;
      }
    } catch {
      // Ignorar e gerar padrão
    }

    // Criar perfil padrão inicial convidativo
    const avatarPadrao = AVATARES_PREDEFINIDOS[Math.floor(Math.random() * 4)];
    const numAleatorio = Math.floor(100 + Math.random() * 900);
    const novoPerfil: PerfilJogador = {
      id: gerarIdPerfil(),
      nome: `Jogador Ntxuva #${numAleatorio}`,
      avatar: avatarPadrao.emoji,
      pais: '🇲🇿 Moçambique (Maputo)',
      bio: 'Apaixonado pela semeadura e estratégia tradicional do Ntxuva!',
      vitorias: 0,
      derrotas: 0,
      partidas: 0,
      online: true,
      ultimaAtividade: Date.now(),
    };

    try {
      localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(novoPerfil));
    } catch {}

    // Sincronizar em segundo plano com Firestore
    this.salvarPerfilNoFirestore(novoPerfil).catch(() => {});

    return novoPerfil;
  },

  async salvarPerfil(perfil: PerfilJogador): Promise<void> {
    try {
      localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(perfil));
    } catch {}
    await this.salvarPerfilNoFirestore(perfil);
  },

  async salvarPerfilNoFirestore(perfil: PerfilJogador): Promise<void> {
    try {
      const docRef = doc(db, 'perfis_jogadores', perfil.id);
      await setDoc(docRef, {
        id: perfil.id,
        nome: perfil.nome,
        avatar: perfil.avatar,
        pais: perfil.pais,
        bio: perfil.bio || '',
        vitorias: Number(perfil.vitorias) || 0,
        derrotas: Number(perfil.derrotas) || 0,
        partidas: Number(perfil.partidas) || 0,
        online: true,
        ultimaAtividade: Date.now(),
      }, { merge: true });
    } catch (err) {
      console.warn('Erro ao salvar perfil no Firestore:', err);
    }
  },

  async atualizarEstatisticasPartida(perfilId: string, venceu: boolean): Promise<void> {
    try {
      const perfilAtual = this.obterPerfilLocal();
      const novoPerfil: PerfilJogador = {
        ...perfilAtual,
        partidas: (perfilAtual.partidas || 0) + 1,
        vitorias: venceu ? (perfilAtual.vitorias || 0) + 1 : (perfilAtual.vitorias || 0),
        derrotas: !venceu ? (perfilAtual.derrotas || 0) + 1 : (perfilAtual.derrotas || 0),
        ultimaAtividade: Date.now(),
      };
      await this.salvarPerfil(novoPerfil);
    } catch (err) {
      console.warn('Erro ao atualizar estatísticas:', err);
    }
  },

  ouvirPerfisComunidade(callback: (perfis: PerfilJogador[]) => void): () => void {
    try {
      const q = query(
        collection(db, 'perfis_jogadores'),
        limit(20)
      );

      return onSnapshot(q, (snapshot) => {
        const perfis: PerfilJogador[] = [];
        snapshot.forEach((docSnap) => {
          const dados = docSnap.data() as PerfilJogador;
          perfis.push(dados);
        });
        callback(perfis);
      }, (err) => {
        console.warn('Erro ao ouvir perfis da comunidade:', err);
      });
    } catch {
      return () => {};
    }
  },

  // ==========================================
  // 2. CHAT GLOBAL EM TEMPO REAL
  // ==========================================
  ouvirMensagensChat(callback: (mensagens: MensagemChat[]) => void): () => void {
    try {
      const q = query(
        collection(db, 'chat_mensagens'),
        orderBy('criadoEm', 'asc'),
        limit(80)
      );

      return onSnapshot(q, (snapshot) => {
        const mensagens: MensagemChat[] = [];
        snapshot.forEach((docSnap) => {
          const dados = docSnap.data();
          mensagens.push({
            id: docSnap.id,
            autorId: dados.autorId || '',
            autorNome: dados.autorNome || 'Anónimo',
            autorAvatar: dados.autorAvatar || '👤',
            autorPais: dados.autorPais || '🇲🇿 Moçambique',
            texto: dados.texto || '',
            tipo: dados.tipo || 'texto',
            codigoSala: dados.codigoSala || undefined,
            tempoTurno: dados.tempoTurno ?? null,
            campeonatoId: dados.campeonatoId || undefined,
            campeonatoTitulo: dados.campeonatoTitulo || undefined,
            criadoEm: dados.criadoEm || Date.now(),
          });
        });
        callback(mensagens);
      }, (err) => {
        console.warn('Erro ao ouvir mensagens do chat:', err);
      });
    } catch {
      return () => {};
    }
  },

  async enviarMensagemTexto(perfil: PerfilJogador, texto: string): Promise<void> {
    const limpo = texto.trim();
    if (!limpo) return;

    const novaMensagem: Omit<MensagemChat, 'id'> = {
      autorId: perfil.id,
      autorNome: perfil.nome,
      autorAvatar: perfil.avatar,
      autorPais: perfil.pais,
      texto: limpo,
      tipo: 'texto',
      criadoEm: Date.now(),
    };

    await addDoc(collection(db, 'chat_mensagens'), novaMensagem);
  },

  async publicarConvitePartida(
    perfil: PerfilJogador, 
    codigoSala: string, 
    tempoTurno?: number | null,
    mensagemExtra?: string
  ): Promise<void> {
    const textoAviso = mensagemExtra?.trim() || 
      `🏆 Criei uma sala online para jogar Ntxuva! Código da sala: ${codigoSala}. Quem aceita o desafio?`;

    const novaMensagem: Omit<MensagemChat, 'id'> = {
      autorId: perfil.id,
      autorNome: perfil.nome,
      autorAvatar: perfil.avatar,
      autorPais: perfil.pais,
      texto: textoAviso,
      tipo: 'convite_jogo',
      codigoSala: codigoSala.toUpperCase(),
      tempoTurno: tempoTurno ?? null,
      criadoEm: Date.now(),
    };

    await addDoc(collection(db, 'chat_mensagens'), novaMensagem);
  },

  async publicarAnuncioCampeonato(
    perfil: PerfilJogador, 
    campeonatoId: string, 
    titulo: string, 
    descricao: string
  ): Promise<void> {
    const texto = `🔥 NOVO CAMPEONATO CRIADO: "${titulo}"! ${descricao} Clica no botão abaixo para te inscreveres e disputares a taça!`;

    const novaMensagem: Omit<MensagemChat, 'id'> = {
      autorId: perfil.id,
      autorNome: perfil.nome,
      autorAvatar: perfil.avatar,
      autorPais: perfil.pais,
      texto,
      tipo: 'campeonato',
      campeonatoId,
      campeonatoTitulo: titulo,
      criadoEm: Date.now(),
    };

    await addDoc(collection(db, 'chat_mensagens'), novaMensagem);
  },

  // ==========================================
  // 3. CAMPEONATOS DA COMUNIDADE
  // ==========================================
  ouvirCampeonatos(callback: (campeonatos: CampeonatoNtxuva[]) => void): () => void {
    try {
      const q = query(
        collection(db, 'campeonatos'),
        orderBy('criadoEm', 'desc'),
        limit(20)
      );

      return onSnapshot(q, (snapshot) => {
        const lista: CampeonatoNtxuva[] = [];
        snapshot.forEach((docSnap) => {
          const dados = docSnap.data();
          lista.push({
            id: docSnap.id,
            titulo: dados.titulo || 'Campeonato Ntxuva',
            descricao: dados.descricao || '',
            organizadorId: dados.organizadorId || '',
            organizadorNome: dados.organizadorNome || 'Organizador',
            organizadorAvatar: dados.organizadorAvatar || '👑',
            organizadorPais: dados.organizadorPais || '🇲🇿 Moçambique',
            maxParticipantes: Number(dados.maxParticipantes) || 4,
            participantes: Array.isArray(dados.participantes) ? dados.participantes : [],
            partidas: Array.isArray(dados.partidas) ? dados.partidas : [],
            status: dados.status || 'aberto',
            vencedorId: dados.vencedorId || undefined,
            vencedorNome: dados.vencedorNome || undefined,
            tempoTurnoSegundos: dados.tempoTurnoSegundos ?? null,
            criadoEm: dados.criadoEm || Date.now(),
          });
        });
        callback(lista);
      }, (err) => {
        console.warn('Erro ao ouvir campeonatos:', err);
      });
    } catch {
      return () => {};
    }
  },

  async criarCampeonato(
    perfil: PerfilJogador,
    titulo: string,
    descricao: string,
    maxParticipantes: number,
    tempoTurnoSegundos?: number | null
  ): Promise<string> {
    const participanteOrganizador: ParticipanteCampeonato = {
      id: perfil.id,
      nome: perfil.nome,
      avatar: perfil.avatar,
      pais: perfil.pais,
      inscritoEm: Date.now(),
    };

    const docData: Omit<CampeonatoNtxuva, 'id'> = {
      titulo: titulo.trim() || 'Grande Torneio Ntxuva 2026',
      descricao: descricao.trim() || 'Disputa de eliminatórias da comunidade.',
      organizadorId: perfil.id,
      organizadorNome: perfil.nome,
      organizadorAvatar: perfil.avatar,
      organizadorPais: perfil.pais,
      maxParticipantes: [4, 8, 16].includes(maxParticipantes) ? maxParticipantes : 4,
      participantes: [participanteOrganizador],
      partidas: [],
      status: 'aberto',
      tempoTurnoSegundos: tempoTurnoSegundos ?? null,
      criadoEm: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'campeonatos'), docData);

    // Publicar automaticamente no chat para chamar participantes
    await this.publicarAnuncioCampeonato(perfil, docRef.id, docData.titulo, docData.descricao);

    return docRef.id;
  },

  async inscreverNoCampeonato(
    campeonato: CampeonatoNtxuva,
    perfil: PerfilJogador
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    if (campeonato.status !== 'aberto') {
      return { sucesso: false, mensagem: 'Este campeonato já começou ou já foi concluído.' };
    }

    const jaInscrito = campeonato.participantes.some((p) => p.id === perfil.id);
    if (jaInscrito) {
      return { sucesso: false, mensagem: 'Você já está inscrito neste campeonato!' };
    }

    if (campeonato.participantes.length >= campeonato.maxParticipantes) {
      return { sucesso: false, mensagem: 'O campeonato já preencheu todas as vagas!' };
    }

    const novoParticipante: ParticipanteCampeonato = {
      id: perfil.id,
      nome: perfil.nome,
      avatar: perfil.avatar,
      pais: perfil.pais,
      inscritoEm: Date.now(),
    };

    const novaLista = [...campeonato.participantes, novoParticipante];
    const updates: Partial<CampeonatoNtxuva> = {
      participantes: novaLista,
    };

    // Se atingiu o limite de participantes, inicializar a chave de partidas automaticamente!
    if (novaLista.length === campeonato.maxParticipantes) {
      updates.status = 'em_andamento';
      updates.partidas = this.gerarChaveInicial(novaLista, campeonato.maxParticipantes);
    }

    const docRef = doc(db, 'campeonatos', campeonato.id);
    await updateDoc(docRef, updates as any);

    return { 
      sucesso: true, 
      mensagem: novaLista.length === campeonato.maxParticipantes 
        ? 'Inscrição confirmada! Vagas preenchidas, o campeonato começou!' 
        : 'Inscrição realizada com sucesso!' 
    };
  },

  gerarChaveInicial(participantes: ParticipanteCampeonato[], total: number): PartidaCampeonato[] {
    const partidas: PartidaCampeonato[] = [];
    const numPartidas = total / 2;

    for (let i = 0; i < numPartidas; i++) {
      const p1 = participantes[i * 2] || null;
      const p2 = participantes[i * 2 + 1] || null;
      const faseNome = total === 4 ? 'Semifinal' : total === 8 ? 'Quartas de Final' : 'Oitavas de Final';

      partidas.push({
        id: `match_${i + 1}`,
        rodada: 1,
        faseNome: `${faseNome} #${i + 1}`,
        jogador1: p1,
        jogador2: p2,
        status: 'pendente',
      });
    }

    return partidas;
  },

  async vincularSalaPartidaCampeonato(
    campeonatoId: string,
    partidaId: string,
    codigoSala: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'campeonatos', campeonatoId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const camp = docSnap.data() as CampeonatoNtxuva;
      const partidas = (camp.partidas || []).map((m) => {
        if (m.id === partidaId) {
          return { ...m, codigoSala: codigoSala.toUpperCase(), status: 'em_andamento' as const };
        }
        return m;
      });

      await updateDoc(docRef, { partidas });
    } catch (err) {
      console.warn('Erro ao vincular sala na partida do campeonato:', err);
    }
  },

  async registrarVencedorPartidaCampeonato(
    campeonatoId: string,
    partidaId: string,
    vencedorId: string,
    vencedorNome: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'campeonatos', campeonatoId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const camp = docSnap.data() as CampeonatoNtxuva;
      const partidas = (camp.partidas || []).map((m) => {
        if (m.id === partidaId) {
          return { ...m, vencedorId, status: 'concluida' as const };
        }
        return m;
      });

      // Verificar se era a partida final
      const todasConcluidas = partidas.every((m) => m.status === 'concluida');
      const updates: any = { partidas };

      if (todasConcluidas) {
        updates.status = 'finalizado';
        updates.vencedorId = vencedorId;
        updates.vencedorNome = vencedorNome;
      }

      await updateDoc(docRef, updates);
    } catch (err) {
      console.warn('Erro ao registrar vencedor no campeonato:', err);
    }
  }
};
