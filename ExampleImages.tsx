
/* tslint:disable */
import {useAtom} from 'jotai';
import React from 'react';
import {GalleryImagesAtom, SelectedImageIndexAtom} from './atoms';
import {useResetState} from './hooks';

export function ExampleImages() {
  const [gallery, setGallery] = useAtom(GalleryImagesAtom);
  const [selectedIndex, setSelectedIndex] = useAtom(SelectedImageIndexAtom);
  const resetState = useResetState();

  const removeImage = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (gallery.length <= 1) return; // Keep at least one image
    
    const newGallery = gallery.filter((_, i) => i !== idx);
    setGallery(newGallery);
    
    if (selectedIndex === idx) {
      setSelectedIndex(0);
      resetState();
    } else if (selectedIndex > idx) {
      setSelectedIndex(selectedIndex - 1);
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
      {gallery.map((image, idx) => (
        <button
          key={idx}
          className={`aspect-square rounded-xl overflow-hidden border transition-all shadow-lg group relative ${
            selectedIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5 hover:border-white/20'
          }`}
          onClick={() => {
            if (selectedIndex !== idx) {
              resetState();
              setSelectedIndex(idx);
            }
          }}>
          <img src={image} className={`w-full h-full object-cover transition-opacity duration-300 ${selectedIndex === idx ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
             <span className="text-[8px] font-black text-white uppercase tracking-tighter">
               {idx < 9 ? `Default_0${idx + 1}` : `User_Node_${idx - 8}`}
             </span>
             {idx >= 9 && (
               <div 
                 onClick={(e) => removeImage(idx, e)}
                 className="w-4 h-4 rounded bg-red-500/20 hover:bg-red-500 text-white flex items-center justify-center text-[8px] transition-colors"
               >
                 ✕
               </div>
             )}
          </div>
          
          {selectedIndex === idx && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
