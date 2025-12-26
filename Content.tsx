
/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// Copyright 2025 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
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
} from './atoms';
import {lineOptions, segmentationColorsRgb} from './consts';
import {getSvgPathFromStroke} from './utils';

export function Content() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [boundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [points] = useAtom(PointsAtom);
  const [fov] = useAtom(FovAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [hoverEntered, setHoverEntered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useAtom(SelectedObjectIndexAtom);
  const [drawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [activeColor] = useAtom(ActiveColorAtom);
  const [brushSize] = useAtom(BrushSizeAtom);
  const [brushOpacity] = useAtom(BrushOpacityAtom);

  const boundingBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({ width: 1, height: 1 });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({ width: el.width, height: el.height });
    }
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  const projectPoint = useCallback((x: number, y: number, z: number) => {
    const nx = (x - 0.5) * 2;
    const ny = (y - 0.5) * 2;
    const nz = (z - 0.5) * 2 + 3;
    const f = 1 / Math.tan((fov * Math.PI) / 360);
    const px = (nx * f) / nz;
    const py = (ny * f) / nz;
    return { x: (px + 1) / 2, y: (py + 1) / 2 };
  }, [fov]);

  const downRef = useRef<Boolean>(false);

  return (
    <div ref={containerRef} className="w-1/2 h-full relative bg-black flex items-center justify-center overflow-hidden">
      {imageSrc ? (
        <img
          src={imageSrc}
          className="absolute top-0 left-0 w-full h-full object-contain"
          alt="Original"
          onLoad={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}
      <div
        className={`absolute pointer-events-auto ${hoverEntered ? 'hide-box' : ''} ${drawMode ? 'cursor-crosshair' : ''}`}
        ref={boundingBoxContainerRef}
        onPointerMove={(e) => {
          if (downRef.current && drawMode) {
            const parentBounds = boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => {
              const lastLine = prev[prev.length - 1];
              return [
                ...prev.slice(0, prev.length - 1),
                {
                  ...lastLine,
                  pts: [
                    ...lastLine.pts,
                    [
                      (e.clientX - parentBounds.left) / boundingBoxContainer!.width,
                      (e.clientY - parentBounds.top) / boundingBoxContainer!.height,
                    ],
                  ]
                }
              ];
            });
          }
        }}
        onPointerDown={(e) => {
          if (drawMode) {
            setImageSent(false);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downRef.current = true;
            const parentBounds = boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev,
              {
                pts: [
                  [
                    (e.clientX - parentBounds.left) / boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) / boundingBoxContainer!.height,
                  ],
                ],
                color: activeColor,
                size: brushSize,
                opacity: brushOpacity,
              }
            ]);
          }
        }}
        onPointerUp={(e) => {
          if (drawMode) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            downRef.current = false;
          }
        }}
        style={{
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
        }}>
        
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {lines.map((line, i) => (
            <path
              key={i}
              d={getSvgPathFromStroke(getStroke(line.pts.map(([x, y]) => [x * boundingBoxContainer.width, y * boundingBoxContainer.height, 0.5]), { ...lineOptions, size: line.size }))}
              fill={line.color}
              fillOpacity={line.opacity}
            />
          ))}
        </svg>

        {/* Caixas 2D clicáveis */}
        {detectType === 'Caixas delimitadoras 2D' && boundingBoxes2D.map((box, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
            className={`absolute border-2 cursor-pointer transition-colors ${selectedIdx === i ? 'border-yellow-400 ring-2 ring-yellow-400 bg-yellow-400/20' : 'border-[#3B68FF] bg-[#3B68FF1a] hover:bg-[#3B68FF33]'}`}
            style={{ top: box.y * 100 + '%', left: box.x * 100 + '%', width: box.width * 100 + '%', height: box.height * 100 + '%' }}>
            <span className={`${selectedIdx === i ? 'bg-yellow-400' : 'bg-[#3B68FF]'} text-white text-[10px] absolute top-0 left-0 px-1 font-bold`}>
              {box.label} {selectedIdx === i ? '(Selecionado)' : ''}
            </span>
          </div>
        ))}

        {/* Máscaras clicáveis */}
        {detectType === 'Máscaras de segmentação' && boundingBoxMasks.map((box, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
            className={`absolute border cursor-pointer ${selectedIdx === i ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-[#3B68FF44]'}`}
            style={{ top: box.y * 100 + '%', left: box.x * 100 + '%', width: box.width * 100 + '%', height: box.height * 100 + '%' }}>
            <BoxMask box={box} index={i} isSelected={selectedIdx === i} />
            <span className={`${selectedIdx === i ? 'bg-yellow-400 text-black' : 'bg-[#3B68FF] text-white'} text-[10px] absolute -top-4 left-0 px-1 font-bold`}>
              {box.label}
            </span>
          </div>
        ))}

        {/* Pontos clicáveis */}
        {detectType === 'Pontos' && points.map((p, i) => {
          let pos = { x: p.point.x, y: p.point.y };
          if (p.point.z !== undefined) pos = projectPoint(p.point.x, p.point.y, p.point.z);
          return (
            <div 
              key={i} 
              onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}>
              <div className={`${selectedIdx === i ? 'bg-yellow-400 text-black' : 'bg-[#3B68FF] text-white'} text-[9px] px-1 rounded-sm mb-1 whitespace-nowrap font-bold`}>{p.label}</div>
              <div className={`w-3 h-3 rounded-full shadow-lg border-2 transition-transform ${selectedIdx === i ? 'bg-yellow-400 border-black scale-150' : 'bg-white border-[#3B68FF] group-hover:scale-125'}`}></div>
            </div>
          );
        })}

        {/* 3D Boxes (Visual apenas) */}
        {detectType === 'Detecção 3D' && boundingBoxes3D.map((box, i) => {
          const corners = [
            [box.xmin, box.ymin, box.zmin], [box.xmax, box.ymin, box.zmin],
            [box.xmax, box.ymax, box.zmin], [box.xmin, box.ymax, box.zmin],
            [box.xmin, box.ymin, box.zmax], [box.xmax, box.ymin, box.zmax],
            [box.xmax, box.ymax, box.zmax], [box.xmin, box.ymax, box.zmax],
          ].map(([x, y, z]) => projectPoint(x, y, z));
          const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
          return (
            <div key={i} className="absolute w-full h-full top-0 left-0 pointer-events-none">
              <svg className="w-full h-full">
                {edges.map(([a, b], idx) => (
                  <line key={idx} x1={corners[a].x * boundingBoxContainer.width} y1={corners[a].y * boundingBoxContainer.height} x2={corners[b].x * boundingBoxContainer.width} y2={corners[b].y * boundingBoxContainer.height} stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.8" />
                ))}
              </svg>
              <div className="absolute bg-[#10b981] text-white text-[9px] px-1" style={{ left: corners[4].x * 100 + '%', top: corners[4].y * 100 + '%' }}>{box.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BoxMask({box, index, isSelected}: {box: any, index: number, isSelected: boolean}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = isSelected ? [250, 204, 21] : segmentationColorsRgb[index % segmentationColorsRgb.length];

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = box.imageData;
        image.onload = () => {
          canvasRef.current!.width = image.width;
          canvasRef.current!.height = image.height;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, image.width, image.height);
          const data = pixels.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i + 3] = data[i];
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
          }
          ctx.putImageData(pixels, 0, 0);
        };
      }
    }
  }, [box.imageData, rgb, isSelected]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{opacity: isSelected ? 0.7 : 0.4}} />;
}
