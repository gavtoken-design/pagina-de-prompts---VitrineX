
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  GalleryImagesAtom,
  SelectedImageIndexAtom,
  PointsAtom,
} from './atoms';
import {useResetState} from './hooks';

export function SideControls({iconOnly = false}: {iconOnly?: boolean}) {
  const [gallery, setGallery] = useAtom(GalleryImagesAtom);
  const [, setSelectedIdx] = useAtom(SelectedImageIndexAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [points] = useAtom(PointsAtom);
  const resetState = useResetState();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      detections: {
        boxes2d: boundingBoxes2D,
        masks: boundingBoxMasks,
        points: points
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spatial_analysis_${Date.now()}.json`;
    a.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = (re) => resolve(re.target?.result as string);
      });
      reader.readAsDataURL(file);
      newImages.push(await promise);
    }

    resetState();
    const updatedGallery = [...gallery, ...newImages];
    setGallery(updatedGallery);
    // Select the first of the newly uploaded images
    setSelectedIdx(gallery.length);
  };

  if (iconOnly) {
    return (
      <div className="flex flex-col gap-5">
        <div className="relative group">
          <label 
            className="tool-btn cursor-pointer hover:bg-blue-500/20 flex items-center justify-center w-11 h-11 rounded-xl transition-all border border-white/5"
            onMouseEnter={() => setHovered('import')}
            onMouseLeave={() => setHovered(null)}
          >
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
            />
            <span className="text-xl">📤</span>
          </label>
          {hovered === 'import' && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-3 glass-panel rounded-xl z-[100] border border-white/10 shadow-2xl pointer-events-none">
              <div className="text-[10px] font-black text-blue-500 uppercase mb-1">Importar Mídia</div>
              <div className="text-[9px] text-white/60 leading-tight">Carregue uma ou mais imagens do seu dispositivo para a galeria de análise.</div>
            </div>
          )}
        </div>
        
        <div className="relative group">
          <button 
            onClick={handleExport} 
            className="tool-btn hover:bg-emerald-500/20 flex items-center justify-center w-11 h-11 rounded-xl transition-all border border-white/5"
            onMouseEnter={() => setHovered('export')}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="text-xl">📥</span>
          </button>
          {hovered === 'export' && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-3 glass-panel rounded-xl z-[100] border border-white/10 shadow-2xl pointer-events-none">
              <div className="text-[10px] font-black text-emerald-500 uppercase mb-1">Exportar Dataset</div>
              <div className="text-[9px] text-white/60 leading-tight">Baixe todos os metadados gerados (caixas, máscaras e pontos) em um arquivo JSON estruturado.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="secondary w-full cursor-pointer hover:border-[var(--accent-color)] !py-3 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
        />
        <span className="text-[9px] font-black tracking-widest uppercase">📤 Carregar Media</span>
      </label>
      <button onClick={handleExport} className="secondary w-full !py-3 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:border-emerald-500/50 transition-all">
        <span className="text-[9px] font-black tracking-widest uppercase">📥 Baixar Dataset</span>
      </button>
    </div>
  );
}
