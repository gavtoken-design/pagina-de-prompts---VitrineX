
/* tslint:disable */
import {useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  ActiveColorAtom,
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  BoundingBoxes3DAtom,
  BrushOpacityAtom,
  BrushSizeAtom,
  DetectTypeAtom,
  DrawModeAtom,
  FovAtom,
  ImageSentAtom,
  ImageSrcAtom,
  LinesAtom,
  PointsAtom,
  RevealOnHoverModeAtom,
  SelectedObjectIndexAtom,
  IsLoadingAtom
} from './atoms';
import {lineOptions, segmentationColorsRgb} from './consts';
import {getSvgPathFromStroke} from './utils';

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

  // Zoom and Pan State
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

  // Handle Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed, 0.5), 10);
    setScale(newScale);
  };

  // Handle Panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click for pan
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Update local mouse pos for HUD (normalized to the image space)
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
      {/* HUD Telemetry */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        <div className="absolute top-10 left-10 flex flex-col gap-1 mono text-[9px] text-blue-500/60 uppercase">
          <span>Target_Sync: Active</span>
          <span>Buffer: {Math.round(activeMediaDimensions.width)}x{Math.round(activeMediaDimensions.height)}</span>
          <span>FPS: 60.0</span>
          <span className="text-white/40 mt-2">Scale: {scale.toFixed(2)}x</span>
        </div>
        <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1 mono text-[9px] text-blue-500/60 uppercase">
          <span>Rel_Pos: {mousePos.x.toFixed(3)}, {mousePos.y.toFixed(3)}</span>
          <span>Pan_X: {Math.round(offset.x)}px</span>
          <span>Pan_Y: {Math.round(offset.y)}px</span>
        </div>
        {isLoading && <div className="scanner-bar" />}
        
        {/* Reset View Button */}
        {(scale !== 1 || offset.x !== 0 || offset.y !== 0) && (
          <button 
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            className="absolute bottom-10 left-10 pointer-events-auto bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest transition-all"
          >
            Resetar Visão ⌖
          </button>
        )}
      </div>

      {/* Main Content Group with Transitions */}
      <div 
        className="relative transition-transform duration-75 ease-out"
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
            className="w-full h-full object-contain shadow-2xl pointer-events-none" 
            onLoad={(e) => setActiveMediaDimensions({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
          />
        )}

        {/* Tactical SVG HUD */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
          <line x1="50%" y1="0" x2="50%" y2="100%" className="hud-line" />
          <line x1="0" y1="50%" x2="100%" y2="50%" className="hud-line" />
          <circle cx="50%" cy="50%" r="40" fill="none" className="hud-line" strokeDasharray="2 2" />
        </svg>

        <div className="absolute inset-0 pointer-events-auto">
          {/* 2D Bounding Boxes */}
          {detectType === 'Caixas delimitadoras 2D' && boundingBoxes2D.map((box, i) => (
            <div 
              key={i} 
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(i === selectedIdx ? null : i); }}
              className={`absolute border-2 transition-all cursor-pointer ${selectedIdx === i ? 'border-blue-400 bg-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-white/20 bg-white/5 hover:border-white/40'}`}
              style={{ top: box.y * 100 + '%', left: box.x * 100 + '%', width: box.width * 100 + '%', height: box.height * 100 + '%' }}>
              <span className="absolute -top-5 left-0 text-[8px] font-black bg-black/80 px-1 text-white uppercase tracking-tighter mono whitespace-nowrap">
                ID_{i.toString().padStart(2, '0')} : {box.label}
              </span>
            </div>
          ))}

          {/* Segmentation Masks */}
          {detectType === 'Máscaras de segmentação' && boundingBoxMasks.map((box, i) => (
            <div 
              key={i} 
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(i === selectedIdx ? null : i); }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ top: box.y * 100 + '%', left: box.x * 100 + '%', width: box.width * 100 + '%', height: box.height * 100 + '%' }}>
              <BoxMask box={box} index={i} isSelected={selectedIdx === i} />
              <span className="absolute -top-4 left-0 text-[8px] font-black text-blue-400 mono whitespace-nowrap">
                {box.label}
              </span>
            </div>
          ))}

          {/* Points */}
          {detectType === 'Pontos' && points.map((p, i) => (
            <div 
              key={i} 
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: `${p.point.x * 100}%`, top: `${p.point.y * 100}%` }}>
              <div className="w-4 h-4 border border-blue-500 rounded-full animate-ping opacity-50" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
              <span className="ml-3 text-[9px] font-bold text-blue-400 mono bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap shadow-xl">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoxMask({box, index, isSelected}: {box: any, index: number, isSelected: boolean}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = isSelected ? [59, 130, 246] : segmentationColorsRgb[index % segmentationColorsRgb.length];

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
        data[i + 3] = data[i] * 0.4; // Semi-transparent
        data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2];
      }
      ctx.putImageData(pixels, 0, 0);
    };
  }, [box.imageData, rgb, isSelected]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60'}`} />;
}
