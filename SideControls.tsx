
/* tslint:disable */
import {useAtom} from 'jotai';
import React from 'react';
import {
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  ImageSrcAtom,
  PointsAtom,
} from './atoms';
import {useResetState} from './hooks';

export function SideControls({iconOnly = false}: {iconOnly?: boolean}) {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [points] = useAtom(PointsAtom);
  const resetState = useResetState();

  const handleExport = () => {
    const data = [...boundingBoxes2D, ...boundingBoxMasks, ...points];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spatial_data_${Date.now()}.json`;
    a.click();
  };

  if (iconOnly) {
    return (
      <div className="flex flex-col gap-4">
        <label className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all" title="Upload Imagem">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                  resetState();
                  setImageSrc(re.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <span className="text-lg">📤</span>
        </label>
        <button onClick={handleExport} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title="Exportar JSON">
          <span className="text-lg">📥</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="secondary w-full cursor-pointer hover:border-[var(--accent-color)]">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (re) => {
                resetState();
                setImageSrc(re.target?.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <span>📤 Upload Imagem</span>
      </label>
      <button onClick={handleExport} className="secondary w-full">
        <span>📥 Exportar JSON</span>
      </button>
    </div>
  );
}
