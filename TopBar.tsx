
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useEffect, useState} from 'react';
import {DetectTypeAtom} from './atoms';
import {useResetState} from './hooks';

export function TopBar() {
  const resetState = useResetState();
  const [detectType] = useAtom(DetectTypeAtom);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) { console.error(e); }
    };
    checkKey();
  }, []);

  const handleKeySelection = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    } catch (e) { console.error(e); }
  };

  return (
    <header className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-6 glass-panel z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--accent-color)] rounded-md flex items-center justify-center text-[10px] font-black">AI</div>
          <span className="text-sm font-black tracking-tighter uppercase italic">Spatial Studio</span>
        </div>
        
        <div className="h-4 w-[1px] bg-[var(--border-color)]"></div>
        
        <button onClick={resetState} className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-white transition-colors">
          Nova Sessão
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
           <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Vertex AI Engine</span>
        </div>
        
        <button 
          onClick={handleKeySelection}
          className={`text-[10px] font-black py-1 px-4 rounded-md border uppercase transition-all ${hasKey ? 'border-green-500/30 text-green-500' : 'border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white'}`}
        >
          {hasKey ? 'Chave Ativa' : 'Configurar Chave'}
        </button>
      </div>
    </header>
  );
}
