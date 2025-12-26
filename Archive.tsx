
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
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
        <div className="text-6xl mb-6">📂</div>
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Arquivo Vazio</h2>
        <p className="text-xs mono">Nenhuma geração ou análise detectada nos registros atuais.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-10 scrollbar-hide">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Arquivo Tático</h1>
            <p className="text-[10px] mono text-white/40 uppercase tracking-widest">Registros históricos de inferência e síntese visual</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-500 mono">{history.length}</span>
            <span className="text-[9px] block text-white/20 uppercase font-bold">Entradas totais</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel group relative overflow-hidden rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => restoreItem(item)}
            >
              {/* Image Preview */}
              <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                <img src={item.imageSrc} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[8px] font-black text-blue-400 uppercase mono border border-blue-500/30">
                  {item.detectType}
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[8px] mono text-white/30 uppercase">{new Date(item.timestamp).toLocaleString()}</span>
                   <button className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:text-white">Restaurar ↺</button>
                </div>
                <p className="text-[11px] font-medium text-white/80 line-clamp-2 italic mb-4 leading-relaxed">
                  "{item.prompt || 'Análise automática de cena'}"
                </p>
                
                {/* Visual JSON hint */}
                <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                   <div className="flex gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                   </div>
                   <span className="text-[8px] mono text-white/20 mt-1 block">METADATA_READY</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
