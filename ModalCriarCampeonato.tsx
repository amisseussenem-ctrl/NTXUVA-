import React, { useState } from 'react';
import { X, Trophy, Users, Clock, Sparkles } from 'lucide-react';
import { PerfilJogador } from '../types/online';

interface ModalCriarCampeonatoProps {
  aberto: boolean;
  onFechar: () => void;
  perfil: PerfilJogador;
  onCriarCampeonato: (
    titulo: string, 
    descricao: string, 
    maxParticipantes: number, 
    tempoTurnoSegundos?: number | null
  ) => Promise<string | void>;
}

export const ModalCriarCampeonato: React.FC<ModalCriarCampeonatoProps> = ({
  aberto,
  onFechar,
  perfil,
  onCriarCampeonato,
}) => {
  const [titulo, setTitulo] = useState('Taça Comunidade Ntxuva');
  const [descricao, setDescricao] = useState('Eliminatórias diretas entre mestres da comunidade.');
  const [maxParticipantes, setMaxParticipantes] = useState<number>(4);
  const [tempoTurno, setTempoTurno] = useState<number | null>(45);
  const [criando, setCriando] = useState(false);

  if (!aberto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setCriando(true);
    try {
      await onCriarCampeonato(
        titulo.trim(),
        descricao.trim(),
        maxParticipantes,
        tempoTurno
      );
      onFechar();
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-[#1c1008] border-2 border-[#522d17] rounded-3xl shadow-2xl p-4 sm:p-6 text-stone-200 relative overflow-hidden font-mono space-y-4">
        {/* Glow de fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d2213]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200 uppercase tracking-wide">
                Criar Novo Campeonato
              </h2>
              <p className="text-[11px] text-stone-400">
                Organize um torneio e desafie jogadores do mundo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Título do Torneio */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Nome do Campeonato / Torneio:
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={50}
              required
              placeholder="Ex: Taça Ntxuva de Maputo 2026"
              className="w-full px-3 py-2 rounded-xl bg-[#28160c] border border-[#542d17] focus:border-amber-400 focus:outline-hidden text-amber-100 font-bold placeholder:text-stone-600"
            />
          </div>

          {/* Descrição / Regras */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Descrição / Regras do Torneio:
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              maxLength={140}
              placeholder="Ex: Jogos eliminatórios rápidos. Vencedor avança até à grande final!"
              className="w-full px-3 py-2 rounded-xl bg-[#28160c] border border-[#542d17] focus:border-amber-400 focus:outline-hidden text-amber-100 placeholder:text-stone-600 resize-none text-xs"
            />
          </div>

          {/* Formato / Número de Participantes */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Número de Vagas (Participantes):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { vagas: 4, desc: 'Semifinais + Final' },
                { vagas: 8, desc: 'Quartas + Semis + Final' },
                { vagas: 16, desc: 'Torneio Aberto' },
              ].map((opt) => (
                <button
                  key={opt.vagas}
                  type="button"
                  onClick={() => setMaxParticipantes(opt.vagas)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    maxParticipantes === opt.vagas
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md font-black'
                      : 'bg-[#24140b] border-[#442513] text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-base font-black">{opt.vagas} Jogadores</div>
                  <div className="text-[9px] text-stone-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Temporizador de Turno */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Tempo por Lance:</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: null, label: 'Livre' },
                { val: 30, label: '30 seg' },
                { val: 45, label: '45 seg' },
                { val: 60, label: '60 seg' },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTempoTurno(t.val)}
                  className={`py-1.5 px-2 rounded-xl border text-center text-xs transition-all cursor-pointer font-bold ${
                    tempoTurno === t.val
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs'
                      : 'bg-[#24140b] border-[#442513] text-stone-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicador do Organizador */}
          <div className="p-2.5 rounded-xl bg-[#24140b] border border-[#442513] flex items-center gap-2.5">
            <span className="text-xl">{perfil.avatar}</span>
            <div className="text-[11px]">
              <span className="text-stone-400">Organizador: </span>
              <strong className="text-amber-200">{perfil.nome}</strong>
              <div className="text-[10px] text-stone-500">{perfil.pais}</div>
            </div>
          </div>

          {/* Botão de Criação */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={criando || !titulo.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-stone-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/60 border border-amber-300 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{criando ? 'Criando Torneio...' : 'Criar e Publicar no Chat Global'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
