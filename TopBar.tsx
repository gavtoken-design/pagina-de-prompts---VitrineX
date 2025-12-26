
/* tslint:disable */
import React, {useState, useEffect} from 'react';
import {useAtom} from 'jotai';
import {ActiveTabAtom, IsLoadingAtom} from './atoms';
import {useResetState} from './hooks';

export function TopBar() {
  const reset = useResetState();
  const [activeTab, setActiveTab] = useAtom(ActiveTabAtom);
  const [isLoading] = useAtom(IsLoadingAtom);

  return (
    <header className="h-20 flex items-center justify-between px-10 glass-panel border-b border-white/5 z-50">
      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer" onClick={() => setActiveTab('vision')}>
          <div className="w-10 h-10 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:rotate-90 transition-transform duration-500">
             <div className="-rotate-45 group-hover:-rotate-90 transition-transform duration-500 font-black text-black text-xs">GS</div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-black tracking-[0.3em] uppercase italic text-white">Gemini_Studio</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-[7px] font-bold text-cyan-400 uppercase tracking-widest">v2.5_Stable</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] mt-1.5">Neural Architecture & Spatial Intelligence</span>
        </div>
      </div>

      <nav className="flex items-center gap-1">
         <button 
           onClick={() => setActiveTab('vision')}
           className={`btn-nav ${activeTab === 'vision' ? 'active' : 'text-white/30 hover:text-white/60'}`}
         >
           Laboratório
         </button>
         <button 
           onClick={() => setActiveTab('archive')}
           className={`btn-nav ${activeTab === 'archive' ? 'active' : 'text-white/30 hover:text-white/60'}`}
         >
           Arquivo
         </button>
         <div className="w-12"></div>
         <button onClick={() => reset(true)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-400 transition-colors border-l border-white/10 pl-10">
           Reiniciar_Sessão
         </button>
      </nav>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex flex-col items-end mono">
           <span className="text-[8px] text-white/20 uppercase">Core_Status</span>
           <span className={`text-[9px] font-bold uppercase tracking-widest ${isLoading ? 'text-orange-400' : 'text-emerald-400'}`}>
             {isLoading ? 'Inference_Active' : 'Standby_Ready'}
           </span>
        </div>
        <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center relative">
           <div className={`absolute inset-0 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent ${isLoading ? 'animate-spin' : ''}`}></div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs">👤</div>
        </div>
      </div>
    </header>
  );
}
