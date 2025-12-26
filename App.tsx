
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {Content} from './Content';
import {DetectTypeSelector} from './DetectTypeSelector';
import {ExampleImages} from './ExampleImages';
import {Prompt} from './Prompt';
import {SideControls} from './SideControls';
import {TopBar} from './TopBar';
import {Archive} from './Archive';
import {
  FovAtom,
  TemperatureAtom,
  IsLoadingAtom,
  ResponseJsonAtom,
  ActiveTabAtom
} from './atoms';

export default function App() {
  const [fov, setFov] = useAtom(FovAtom);
  const [temp, setTemp] = useAtom(TemperatureAtom);
  const [isLoading] = useAtom(IsLoadingAtom);
  const [responseJson] = useAtom(ResponseJsonAtom);
  const [activeTab] = useAtom(ActiveTabAtom);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-slate-200">
      <TopBar />
      
      <main className="flex grow overflow-hidden relative">
        {/* Left Control Column */}
        <aside className="w-20 lg:w-24 flex flex-col items-center py-10 glass-panel z-30 border-r border-white/5">
           <DetectTypeSelector iconOnly />
           <div className="mt-auto pb-6">
              <SideControls iconOnly />
           </div>
        </aside>

        {/* Viewport Area - Conditional Rendering based on Tab */}
        <section className="grow relative flex items-center justify-center checkerboard overflow-hidden">
          {activeTab === 'vision' ? (
            <>
              <div className={`relative w-full h-full p-8 lg:p-12 flex items-center justify-center transition-all duration-1000 ${isLoading ? 'blur-sm scale-[0.98]' : 'scale-100'}`}>
                <Content />
              </div>

              {/* Floating Action Bar */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-center z-40">
                <div className="glass-panel p-6 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-white/10 w-full max-w-4xl mx-8">
                  <Prompt />
                </div>
              </div>
            </>
          ) : (
            <Archive />
          )}
        </section>

        {/* Right Info Sidebar (Only visible in Vision mode) */}
        {activeTab === 'vision' && (
          <aside className="w-72 glass-panel border-l border-white/5 flex flex-col hidden 2xl:flex">
            <div className="p-8 flex flex-col grow gap-10">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  Source Library
                </h3>
                <ExampleImages />
              </section>

              <section className="grow overflow-hidden flex flex-col">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Neural_Manifest.json</h3>
                <div className="grow bg-black/40 rounded-2xl border border-white/5 p-4 mono text-[10px] overflow-auto text-blue-200/50 leading-relaxed scrollbar-hide shadow-inner">
                  {responseJson ? (
                    <pre className="whitespace-pre-wrap">{responseJson}</pre>
                  ) : (
                    <span className="opacity-20 italic">// Awaiting inference stream...</span>
                  )}
                </div>
              </section>

              <section className="border-t border-white/5 pt-8 pb-4 flex flex-col gap-6">
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-white/30 uppercase tracking-widest">Global FOV</span>
                      <span className="text-blue-500 mono">{fov}deg</span>
                    </div>
                    <input type="range" min="30" max="120" value={fov} onChange={e => setFov(Number(e.target.value))} className="w-full accent-blue-500" />
                 </div>
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-white/30 uppercase tracking-widest">Inference Temp</span>
                      <span className="text-blue-500 mono">{temp.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full accent-blue-500" />
                 </div>
              </section>
            </div>
          </aside>
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 glass-panel border-t border-white/5 px-6 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-white/20 mono z-50">
        <div className="flex gap-6">
          <span>Sys_Stat: {activeTab === 'vision' ? 'Inference_Live' : 'Archive_Browser'}</span>
          <span className="text-blue-500/40">Context: {activeTab.toUpperCase()}</span>
        </div>
        <div className="flex gap-6">
          <span>Latency: 24ms</span>
          <span>Buffer_Alloc: 512MB</span>
          <span className="text-emerald-500/40">Sec: Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
