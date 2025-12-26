
/* tslint:disable */
import {useAtom} from 'jotai';
import React from 'react';
import {ImageSrcAtom} from './atoms';
import {imageOptions} from './consts';
import {useResetState} from './hooks';

export function ExampleImages() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const resetState = useResetState();
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {imageOptions.map((image, idx) => (
        <button
          key={idx}
          className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-[var(--accent-color)] hover:scale-105 transition-all shadow-lg group relative"
          onClick={() => {
            resetState();
            setImageSrc(image);
          }}>
          <img src={image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
             <span className="text-[8px] font-bold text-white uppercase">Cena {idx + 1}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
