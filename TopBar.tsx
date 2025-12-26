
/* tslint:disable */
import React from 'react';
import {useAtom} from 'jotai';
import {ActiveTabAtom} from './atoms';
import {useResetState} from './hooks';

export function TopBar() {
  const reset = useResetState();
  const [activeTab, setActiveTab] = useAtom(ActiveTabAtom);

  return (
    <header className="h-16 flex items-center justify-between px-8 glass-panel border-b border-white/5 z-50">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs shadow-lg shadow-blue-500/30 cursor-pointer" onClick={() => setActiveTab('vision')}>GS</div>
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-widest uppercase italic leading-none">Gemini Studio</span>
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Spatial & Creative Lab</span>
        </div>
      </div>

      <nav className="flex items-center gap-10">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('vision')}
             className={`px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'vision' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/30 hover:text-white/60'}`}
           >
             Laboratório
           </button>
           <button 
             onClick={() => setActiveTab('archive')}
             className={`px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/30 hover:text-white/60'}`}
           >
             Arquivo
           </button>
        </div>

        <div className="h-4 w-px bg-white/10"></div>

        <button onClick={() => reset(true)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
          Nova Sessão
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Engine</span>
        </div>
      </nav>
    </header>
  );
}
