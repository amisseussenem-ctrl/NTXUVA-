import React, { useState } from 'react';
import { X, User, Flag, Check, Trophy, Swords, Sparkles } from 'lucide-react';
import { PerfilJogador } from '../types/online';
import { AVATARES_PREDEFINIDOS, PAISES_REGIOES } from '../utils/comunidadeService';

interface ModalPerfilJogadorProps {
  aberto: boolean;
  onFechar: () => void;
  perfilAtual: PerfilJogador;
  onSalvarPerfil: (novoPerfil: PerfilJogador) => Promise<void>;
}

export const ModalPerfilJogador: React.FC<ModalPerfilJogadorProps> = ({
  aberto,
  onFechar,
  perfilAtual,
  onSalvarPerfil,
}) => {
  const [nome, setNome] = useState(perfilAtual.nome);
  const [avatar, setAvatar] = useState(perfilAtual.avatar);
  const [pais, setPais] = useState(perfilAtual.pais);
  const [bio, setBio] = useState(perfilAtual.bio || '');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  if (!aberto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSalvando(true);
    try {
      const atualizado: PerfilJogador = {
        ...perfilAtual,
        nome: nome.trim(),
        avatar,
        pais,
        bio: bio.trim(),
        ultimaAtividade: Date.now(),
      };
      await onSalvarPerfil(atualizado);
      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        onFechar();
      }, 700);
    } finally {
      setSalvando(false);
    }
  };

  const taxaVitorias = perfilAtual.partidas > 0 
    ? Math.round((perfilAtual.vitorias / perfilAtual.partidas) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-[#1c1008] border-2 border-[#522d17] rounded-3xl shadow-2xl p-4 sm:p-6 text-stone-200 relative overflow-hidden font-mono space-y-4">
        {/* Glow de fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d2213]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200 uppercase tracking-wide">
                Meu Perfil de Jogador
              </h2>
              <p className="text-[11px] text-stone-400">
                Identidade na comunidade global de Ntxuva
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

        {/* Cartão de Resumo das Estatísticas */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#24140b] border border-[#442513] text-center">
          <div>
            <div className="text-[10px] text-stone-400 uppercase">Partidas</div>
            <div className="text-sm sm:text-base font-black text-amber-300 flex items-center justify-center gap-1">
              <Swords className="w-3.5 h-3.5 text-stone-400" />
              <span>{perfilAtual.partidas || 0}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 uppercase">Vitórias</div>
            <div className="text-sm sm:text-base font-black text-emerald-400 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{perfilAtual.vitorias || 0}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-cyan-400 uppercase">Aproveitamento</div>
            <div className="text-sm sm:text-base font-black text-cyan-300">
              {taxaVitorias}%
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. Nome / Nickname */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Nome ou Alcunha (Nickname):
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={32}
              required
              placeholder="Ex: Mestre de Chimoio"
              className="w-full px-3 py-2 rounded-xl bg-[#28160c] border border-[#542d17] focus:border-amber-400 focus:outline-hidden text-amber-100 font-bold placeholder:text-stone-600"
            />
          </div>

          {/* 2. Seleção de Avatar */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Escolha o seu Avatar:</span>
              <span className="text-stone-400 font-normal">{avatar}</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-[#24140b] border border-[#442513]">
              {AVATARES_PREDEFINIDOS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.emoji)}
                  className={`p-2 rounded-xl text-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    avatar === av.emoji
                      ? 'bg-amber-500/30 border-2 border-amber-400 scale-105 shadow-md'
                      : 'hover:bg-[#341b0f] border border-transparent'
                  }`}
                  title={`${av.nome}: ${av.desc}`}
                >
                  <span>{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. País ou Província */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              <span>País / Província de Origem:</span>
            </label>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#28160c] border border-[#542d17] focus:border-amber-400 focus:outline-hidden text-amber-100 font-bold cursor-pointer"
            >
              {PAISES_REGIOES.map((p) => (
                <option key={p.id} value={p.nome} className="bg-[#1c1008] text-white">
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Frase de Jogador (Bio) */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Frase ou Lema de Jogo (Bio):
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={80}
              placeholder="Ex: Em busca da captura de 20 pedras!"
              className="w-full px-3 py-2 rounded-xl bg-[#28160c] border border-[#542d17] focus:border-amber-400 focus:outline-hidden text-amber-100 placeholder:text-stone-600 text-xs"
            />
          </div>

          {/* Botão de Salvar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={salvando || !nome.trim()}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${
                sucesso
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-amber-950/60 border border-amber-300'
              }`}
            >
              {sucesso ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Perfil Atualizado com Sucesso!</span>
                </>
              ) : salvando ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Salvar Meu Perfil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
