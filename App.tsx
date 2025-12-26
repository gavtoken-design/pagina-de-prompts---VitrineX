
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {Content} from './Content';
import {DetectTypeSelector} from './DetectTypeSelector';
import {ExampleImages} from './ExampleImages';
import {Prompt} from './Prompt';
import {SideControls} from './SideControls';
import {TopBar} from './TopBar';
import {
  RequestJsonAtom, 
  ResponseJsonAtom, 
  SelectedModelAtom, 
  TemperatureAtom, 
  IsThinkingEnabledAtom, 
  FovAtom,
  IsLoadingAtom
} from './atoms';

export default function App() {
  const [showJson, setShowJson] = useState(false);
  const [requestJson] = useAtom(RequestJsonAtom);
  const [responseJson] = useAtom(ResponseJsonAtom);
  const [selectedModel, setSelectedModel] = useAtom(SelectedModelAtom);
  const [isThinkingEnabled, setIsThinkingEnabled] = useAtom(IsThinkingEnabledAtom);
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [fov, setFov] = useAtom(FovAtom);
  const [isLoading] = useAtom(IsLoadingAtom);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-color)]">
      <TopBar />
      
      <main className="flex grow overflow-hidden relative">
        {/* Lado Esquerdo: Toolbox Minimalista */}
        <aside className="w-16 border-r border-white/5 flex flex-col items-center py-4 gap-6 glass-panel z-20">
           <div className="text-[10px] font-black text-[var(--accent-color)] rotate-[-90deg] mt-8 mb-4">TOOLS</div>
           <DetectTypeSelector iconOnly />
           <div className="mt-auto mb-4">
              <SideControls iconOnly />
           </div>
        </aside>

        {/* Lado Esquerdo Secundário: Galeria (Pode ser colapsável no futuro) */}
        <aside className="w-64 border-r border-white/5 flex flex-col glass-panel z-10 overflow-y-auto p-4 hidden lg:flex">
          <section>
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full"></span>
              Imagens de Exemplo
            </h3>
            <ExampleImages />
          </section>
          
          <div className="mt-8 border-t border-white/5 pt-6">
             <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Opções de Visão
             </h3>
             <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="opacity-50 uppercase">FOV 3D</span>
                    <span className="text-[var(--accent-color)]">{fov}°</span>
                  </div>
                  <input type="range" min="30" max="120" value={fov} onChange={(e) => setFov(Number(e.target.value))} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="opacity-50 uppercase">Temp</span>
                    <span className="text-[var(--accent-color)]">{temperature}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
                </div>
             </div>
          </div>
        </aside>

        {/* Palco Principal */}
        <section className="grow relative flex items-center justify-center checkerboard overflow-hidden">
          <Content />
          
          {/* Barra de Comandos Flutuante (Prompt) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-30">
            <div className="glass-panel rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
              <Prompt />
            </div>
          </div>

          {/* Overlay de Loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-40 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
                   <div className="text-[10px] font-black tracking-[0.5em] text-[var(--accent-color)] uppercase animate-pulse">
                      Sincronizando com Gemini
                   </div>
                </div>
            </div>
          )}
        </section>

        {/* Lado Direito: Debugger Console */}
        <aside className={`transition-all duration-500 border-l border-white/5 glass-panel flex flex-col ${showJson ? 'w-[500px]' : 'w-0'}`}>
          <div className="h-full flex flex-col overflow-hidden">
             {showJson && (
               <div className="flex flex-col grow p-6 overflow-hidden animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Neural Data Console</h3>
                    <button onClick={() => setShowJson(false)} className="text-[10px] font-bold hover:text-white opacity-50">ESC</button>
                  </div>
                  
                  <div className="flex flex-col grow gap-6 overflow-hidden">
                    <div className="flex flex-col grow">
                      <div className="text-[9px] font-bold text-blue-500 mb-2 uppercase tracking-wider">Payload Enviado</div>
                      <pre className="grow bg-black/60 p-4 rounded-2xl border border-white/5 text-[10px] mono overflow-auto text-blue-300 shadow-inner">
                        {requestJson || '// Aguardando ação...'}
                      </pre>
                    </div>
                    
                    <div className="flex flex-col grow">
                      <div className="text-[9px] font-bold text-emerald-500 mb-2 uppercase tracking-wider">Resposta do Sistema</div>
                      <pre className="grow bg-black/60 p-4 rounded-2xl border border-white/5 text-[10px] mono overflow-auto text-emerald-400 shadow-inner">
                        {responseJson || '// Aguardando resposta...'}
                      </pre>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </aside>

        {/* Botão de Trigger JSON Flutuante */}
        <button 
          onClick={() => setShowJson(!showJson)}
          className="absolute right-6 top-20 z-50 w-12 h-12 bg-black/80 hover:bg-[var(--accent-color)] border border-white/10 rounded-full flex items-center justify-center text-xl transition-all shadow-2xl"
          title="Ver Dados da API"
        >
          {showJson ? '✕' : '⚙️'}
        </button>
      </main>
    </div>
  );
}
