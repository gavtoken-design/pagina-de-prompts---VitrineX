
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {DetectTypeAtom} from './atoms';

interface ModeDefinition {
  label: any;
  icon: string;
  category: 'Spatial' | 'Creative';
  details: string;
}

const MODES: ModeDefinition[] = [
  { 
    label: 'Caixas delimitadoras 2D', 
    icon: '🎯', 
    category: 'Spatial', 
    details: 'Detecta a localização retangular de objetos. Ideal para contagem e localização rápida de múltiplos itens na cena.' 
  },
  { 
    label: 'Máscaras de segmentação', 
    icon: '🎭', 
    category: 'Spatial', 
    details: 'Extrai o contorno exato de cada objeto pixel a pixel. Permite isolar formas complexas com alta precisão.' 
  },
  { 
    label: 'Pontos', 
    icon: '📍', 
    category: 'Spatial', 
    details: 'Identifica coordenadas centrais ou pontos de interesse específicos. Útil para guiar braços robóticos ou garras.' 
  },
  { 
    label: 'Detecção 3D', 
    icon: '📦', 
    category: 'Spatial', 
    details: 'Estima o volume e a profundidade dos objetos no espaço tridimensional, gerando coordenadas [y,x,z].' 
  },
  { 
    label: 'Geração Pro', 
    icon: '✨', 
    category: 'Creative', 
    details: 'Utiliza o Gemini 3 Pro para gerar imagens fotorrealistas de alta resolução baseadas puramente em descrições textuais.' 
  },
  { 
    label: 'Edição IA', 
    icon: '🎨', 
    category: 'Creative', 
    details: 'Permite modificar a imagem atual, adicionando, removendo ou alterando elementos através de comandos naturais.' 
  }
];

export function DetectTypeSelector({iconOnly = false}: {iconOnly?: boolean}) {
  const [activeMode, setActiveMode] = useAtom(DetectTypeAtom);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {['Spatial', 'Creative'].map(cat => (
        <div key={cat} className="flex flex-col gap-2">
          {!iconOnly && (
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 mb-1">
              {cat} Engine
            </span>
          )}
          <div className="flex flex-col gap-1.5">
            {MODES.filter(m => m.category === cat).map((mode) => (
              <div 
                key={mode.label} 
                className="relative group"
                onMouseEnter={() => setHovered(mode.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  onClick={() => setActiveMode(mode.label)}
                  className={`flex items-center w-full transition-all duration-300 rounded-xl ${
                    iconOnly ? 'w-11 h-11 justify-center' : 'px-4 py-2.5'
                  } ${
                    activeMode === mode.label 
                      ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                      : 'hover:bg-white/5 text-white/50 border border-transparent hover:border-white/5'
                  }`}
                >
                  <span className="text-lg">{mode.icon}</span>
                  {!iconOnly && <span className="text-[11px] font-bold ml-3 whitespace-nowrap">{mode.label}</span>}
                </button>
                
                {hovered === mode.label && (
                  <div className={`absolute ${iconOnly ? 'left-full ml-4' : 'left-full ml-2'} top-1/2 -translate-y-1/2 w-56 p-3 glass-panel rounded-xl z-[100] border border-white/10 shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-200`}>
                    <div className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-1">{mode.label}</div>
                    <div className="text-[9px] text-white/60 leading-tight font-medium">{mode.details}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
