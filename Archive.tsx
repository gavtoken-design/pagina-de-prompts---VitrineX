
/* tslint:disable */
import {useAtom} from 'jotai';
import React from 'react';
import {
  ActiveTabAtom,
  GenerationHistoryAtom,
  ImageSrcAtom,
  ResponseJsonAtom,
  DetectTypeAtom
} from './atoms';

export function Archive() {
  const [history] = useAtom(GenerationHistoryAtom);
  const [, setActiveTab] = useAtom(ActiveTabAtom);
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);
  const [, setDetectType] = useAtom(DetectTypeAtom);

  const restoreItem = (item: any) => {
    setImageSrc(item.imageSrc);
    setResponseJson(item.jsonResult);
    setDetectType(item.detectType);
    setActiveTab('vision');
  };

  if (history.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-40">
        <div className="w-24 h-24 mb-10 border border-white/5 rounded-full flex items-center justify-center relative">
           <div className="absolute inset-2 border border-cyan-500/20 rounded-full animate-pulse"></div>
           <span className="text-4xl">📂</span>
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.4em] mb-3 text-white">Empty_Vault</h2>
        <p className="text-[9px] mono uppercase tracking-widest text-cyan-400/40">Nenhum registro tático encontrado na sessão atual</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-12 scrollbar-hide">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-3 h-3 bg-cyan-500"></div>
               <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic">Tactical_Archive</h1>
            </div>
            <p className="text-[9px] mono text-cyan-400/40 uppercase tracking-[0.4em]">Deep-Storage Inference Retrieval System</p>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-5xl font-black text-cyan-400 mono italic">{history.length.toString().padStart(2, '0')}</span>
            <span className="text-[8px] text-white/20 uppercase font-black tracking-widest mt-2">Active_Records</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="group relative overflow-hidden bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all duration-500 cursor-pointer p-1"
              onClick={() => restoreItem(item)}
            >
              {/* Image Preview */}
              <div className="aspect-video w-full overflow-hidden relative">
                <img src={item.imageSrc} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute top-4 left-4 flex gap-1">
                   <div className="bg-cyan-500 h-4 px-2 flex items-center">
                     <span className="text-[7px] font-black text-black uppercase tracking-widest mono">{item.detectType}</span>
                   </div>
                </div>
              </div>

              {/* Data Overlay */}
              <div className="p-5 border-t border-white/5 relative bg-[#060b13]">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[7px] mono text-cyan-400/40 uppercase font-bold">{new Date(item.timestamp).toLocaleTimeString()} // REF_{item.id.toUpperCase()}</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/30"></div>
                </div>
                <p className="text-[10px] font-bold text-white/70 line-clamp-1 italic mb-6">
                  "{item.prompt}"
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-1 h-3 bg-cyan-500/20"></div>
                      <div className="w-1 h-3 bg-cyan-500/40"></div>
                      <div className="w-1 h-3 bg-cyan-500/60"></div>
                   </div>
                   <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Restore_Scene_↺</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
