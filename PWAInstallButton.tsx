import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ModalInstalarTelemovel } from './ModalInstalarTelemovel';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'footer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', variant = 'header' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and opened as an app, hide
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleAction}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 transition-all cursor-pointer shadow-xs active:scale-95 ${className}`}
          title="Instalar o aplicativo NTXUVA no seu telemóvel"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Instalar</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#1c1008] to-emerald-950/80 border border-emerald-500/50 flex items-center justify-between gap-3 shadow-lg ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-stone-950" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-200 truncate">Instalar no Telemóvel</p>
              <p className="text-[11px] text-stone-300 truncate">Jogue em ecrã inteiro sem navegador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAction}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-300"
          >
            <Download className="w-3.5 h-3.5 text-stone-950" />
            <span>Instalar</span>
          </button>
        </div>
      )}

      {variant === 'footer' && (
        <button
          type="button"
          onClick={handleAction}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3 h-3 text-emerald-400" />
          <span>Instalar no Telemóvel</span>
        </button>
      )}

      {/* Modal explicativo de instalação para smartphone */}
      <ModalInstalarTelemovel
        aberto={showGuideModal}
        onFechar={() => setShowGuideModal(false)}
      />
    </>
  );
};
