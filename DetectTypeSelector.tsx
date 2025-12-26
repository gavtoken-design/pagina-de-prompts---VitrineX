
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {DetectTypeAtom} from './atoms';
import {DetectTypes} from './Types';

interface ModeDefinition {
  label: DetectTypes;
  icon: string;
  description: string;
  technicalDetails: string;
}

const MODES: ModeDefinition[] = [
  {
    label: 'Caixas delimitadoras 2D',
    icon: '◰',
    description: 'Localização Retangular',
    technicalDetails: 'Detecta a posição (x, y, largura, altura) e o rótulo de até 25 objetos na cena.'
  },
  {
    label: 'Máscaras de segmentação',
    icon: '▩',
    description: 'Silhuetas Pixel-a-Pixel',
    technicalDetails: 'Extrai o contorno exato de objetos, ideal para recortes precisos e análise de forma.'
  },
  {
    label: 'Pontos',
    icon: '•',
    description: 'Coordenadas Precisas',
    technicalDetails: 'Identifica pontos específicos de interesse ou o centro de massa de componentes individuais.'
  },
  {
    label: 'Detecção 3D',
    icon: '🧊',
    description: 'Voxel & Profundidade',
    technicalDetails: 'Gera cuboides que representam o volume e a posição de objetos no espaço tridimensional.'
  }
];

export function DetectTypeSelector({iconOnly = false}: {iconOnly?: boolean}) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [hoveredMode, setHoveredMode] = useState<ModeDefinition | null>(null);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className={`flex ${iconOnly ? 'flex-col gap-4' : 'flex-col gap-2'}`}>
        {MODES.map((mode) => (
          <div 
            key={mode.label}
            className="relative group"
            onMouseEnter={() => setHoveredMode(mode)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <button
              onClick={() => setDetectType(mode.label)}
              className={`flex items-center transition-all duration-300 w-full ${
                iconOnly 
                  ? `w-10 h-10 justify-center rounded-xl ${detectType === mode.label ? 'bg-[var(--accent-color)] text-white scale-110 shadow-[0_0_15px_rgba(59,104,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-white/5'}`
                  : `px-4 py-3 rounded-xl text-left border ${detectType === mode.label ? 'bg-[var(--accent-color)] text-white border-transparent shadow-lg' : 'hover:bg-white/5 text-[var(--text-secondary)] border-white/5'}`
              }`}
            >
              <span className="text-xl">{mode.icon}</span>
              {!iconOnly && (
                <div className="flex flex-col ml-3 overflow-hidden">
                  <span className="text-xs font-bold whitespace-nowrap">{mode.label}</span>
                  <span className={`text-[9px] uppercase tracking-wider opacity-60 transition-all ${detectType === mode.label ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                    {mode.description}
                  </span>
                </div>
              )}
            </button>

            {/* Tooltip para modo iconOnly */}
            {iconOnly && hoveredMode?.label === mode.label && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-3 glass-panel rounded-xl z-[100] border border-white/10 shadow-2xl animate-in slide-in-from-left-2 fade-in duration-200 pointer-events-none">
                <div className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-1">{mode.label}</div>
                <div className="text-[9px] text-white/80 leading-relaxed font-medium">{mode.technicalDetails}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Painel de ajuda contextual para modo expandido */}
      {!iconOnly && hoveredMode && (
        <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5 animate-in fade-in duration-300">
          <div className="flex items-start gap-2">
            <span className="text-[var(--accent-color)] text-xs mt-0.5">ℹ</span>
            <p className="text-[10px] text-white/50 leading-relaxed italic">
              {hoveredMode.technicalDetails}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
