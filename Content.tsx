
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  DetectTypeAtom,
  ImageSrcAtom,
  PointsAtom,
  SelectedObjectIndexAtom,
  IsLoadingAtom
} from './atoms';
import {segmentationColorsRgb} from './consts';

export function Content() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [points] = useAtom(PointsAtom);
  const [isLoading] = useAtom(IsLoadingAtom);
  const [selectedIdx, setSelectedIdx] = useAtom(SelectedObjectIndexAtom);

  const [mousePos, setMousePos] = useState({x: 0, y: 0});
  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({ width: 1, height: 1 });

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) setContainerDims({ width: el.width, height: el.height });
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    return aspectRatio < containerAspectRatio 
      ? { height: containerDims.height, width: containerDims.height * aspectRatio }
      : { width: containerDims.width, height: containerDims.width / aspectRatio };
  }, [containerDims, activeMediaDimensions]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed, 0.4), 12);
    setScale(newScale);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = (e.clientX - rect.left) / rect.width;
    const localY = (e.clientY - rect.top) / rect.height;
    setMousePos({ x: localX, y: localY });

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative flex items-center justify-center overflow-hidden cursor-crosshair select-none touch-none"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Tactical HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* Corner Telemetry */}
        <div className="absolute top-8 left-8 p-4 border-l border-t border-cyan-500/30 flex flex-col gap-1.5 mono text-[9px] text-cyan-400/60 uppercase">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_5px_cyan]"></div>
            <span>System_Link: Online</span>
          </div>
          <span>Res: {Math.round(activeMediaDimensions.width)}p</span>
          <span>Zoom: {(scale * 100).toFixed(0)}%</span>
        </div>

        <div className="absolute top-8 right-8 p-4 border-r border-t border-cyan-500/30 flex flex-col items-end gap-1.5 mono text-[9px] text-cyan-400/60 uppercase">
          <span>Buffer_Load: {isLoading ? 'High' : 'Optimal'}</span>
          <span>Signal_Str: 100%</span>
        </div>

        <div className="absolute bottom-8 left-8 p-4 border-l border-b border-cyan-500/30 flex flex-col gap-1.5 mono text-[9px] text-cyan-400/60 uppercase">
          <span>Grid_Sync: Locked</span>
          <button 
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            className={`mt-4 pointer-events-auto bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/20 px-4 py-2 text-[8px] font-black tracking-[0.2em] transition-all rounded-sm ${scale === 1 && offset.x === 0 ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            REC_CENTER_POS
          </button>
        </div>

        <div className="absolute bottom-8 right-8 p-4 border-r border-b border-cyan-500/30 flex flex-col items-end gap-1.5 mono text-[9px] text-cyan-400/60 uppercase">
          <span>X: {mousePos.x.toFixed(4)}</span>
          <span>Y: {mousePos.y.toFixed(4)}</span>
          <div className="w-32 h-1 bg-white/5 mt-2 overflow-hidden">
             <div className="h-full bg-cyan-500/40" style={{ width: `${mousePos.x * 100}%` }}></div>
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-20">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-cyan-400"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-4 bg-cyan-400"></div>
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-cyan-400"></div>
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-px bg-cyan-400"></div>
           <div className="absolute inset-4 rounded-full border border-cyan-400/30 border-dashed"></div>
        </div>

        {isLoading && <div className="scanner-bar" />}
      </div>

      {/* Main Image Viewport */}
      <div 
        className="relative transition-transform duration-75 ease-out shadow-[0_0_100px_rgba(0,0,0,1)]"
        style={{ 
          width: boundingBoxContainer.width, 
          height: boundingBoxContainer.height,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {imageSrc && (
          <img 
            src={imageSrc} 
            className="w-full h-full object-contain pointer-events-none opacity-90 brightness-110 contrast-110" 
            onLoad={(e) => setActiveMediaDimensions({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
          />
        )}

        <div className="absolute inset-0 pointer-events-auto">
          {detectType === 'Caixas delimitadoras 2D' && boundingBoxes2D.map((box, i) => (
            <div 
              key={i} 
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(i === selectedIdx ? null : i); }}
              className={`absolute border-2 transition-all cursor-pointer group ${selectedIdx === i ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_30px_rgba(0,242,255,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/40'}`}
              style={{ top: box.y * 100 + '%', left: box.x * 100 + '%', width: box.width * 100 + '%', height: box.height * 100 + '%' }}>
              <div className="absolute -top-6 left-0 flex items-center gap-2">
                 <span className="text-[9px] font-black bg-cyan-500 text-black px-1.5 py-0.5 uppercase tracking-tighter mono whitespace-nowrap">
                  {box.label}
                 </span>
                 <span className="text-[7px] font-bold text-cyan-400 mono opacity-0 group-hover:opacity-100 transition-opacity">
                   CONF: 98.4%
                 </span>
              </div>
            </div>
          ))}

          {detectType === 'Máscaras de segmentação' && boundingBoxMasks.map((box, i) => (
            <div 
              key={i} 
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(i === selectedIdx ? null : i); }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ top: box.y * 100 + '%', left: box.x * 100 + '%', width: box.width * 100 + '%', height: box.height * 100 + '%' }}>
              <BoxMask box={box} index={i} isSelected={selectedIdx === i} />
            </div>
          ))}

          {detectType === 'Pontos' && points.map((p, i) => (
            <div 
              key={i} 
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: `${p.point.x * 100}%`, top: `${p.point.y * 100}%` }}>
              <div className="w-6 h-6 border border-cyan-500/50 rounded-full animate-ping opacity-40" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_#00f2ff]" />
              <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 border border-cyan-500/30 rounded shadow-2xl">
                <span className="text-[9px] font-bold text-cyan-400 mono whitespace-nowrap">{p.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoxMask({box, index, isSelected}: {box: any, index: number, isSelected: boolean}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = isSelected ? [0, 242, 255] : [100, 100, 255];

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const image = new Image();
    image.src = box.imageData;
    image.onload = () => {
      canvasRef.current!.width = image.width;
      canvasRef.current!.height = image.height;
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, image.width, image.height);
      const data = pixels.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = data[i] * 0.5;
        data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2];
      }
      ctx.putImageData(pixels, 0, 0);
    };
  }, [box.imageData, rgb, isSelected]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full transition-all duration-500 ${isSelected ? 'opacity-100 scale-105' : 'opacity-60'}`} />;
}
