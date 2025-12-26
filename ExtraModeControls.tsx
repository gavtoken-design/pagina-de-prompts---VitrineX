
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
import React from 'react';
import {BrushOpacityAtom, BrushSizeAtom, DrawModeAtom, LinesAtom} from './atoms';
import {Palette} from './Palette';

export function ExtraModeControls() {
  const [drawMode, setDrawMode] = useAtom(DrawModeAtom);
  const [, setLines] = useAtom(LinesAtom);
  const [brushSize, setBrushSize] = useAtom(BrushSizeAtom);
  const [brushOpacity, setBrushOpacity] = useAtom(BrushOpacityAtom);

  return (
    <>
      {drawMode ? (
        <div className="flex gap-6 px-4 py-3 items-center justify-between border-t bg-[var(--input-color)]">
          <div className="flex gap-6 items-center grow">
             <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[var(--text-color-secondary)]">Tamanho</span>
                <input 
                  type="range" 
                  min="2" 
                  max="50" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs font-mono w-6">{brushSize}</span>
             </div>
             
             <div className="flex items-center gap-2 border-l pl-6">
                <span className="text-[10px] uppercase font-bold text-[var(--text-color-secondary)]">Opacidade</span>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={brushOpacity} 
                  onChange={(e) => setBrushOpacity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs font-mono w-8">{Math.round(brushOpacity * 100)}%</span>
             </div>
          </div>

          <div className="flex justify-center shrink-0 px-4">
            <Palette />
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              className="flex gap-2 text-sm secondary items-center"
              onClick={() => {
                setLines([]);
              }}>
              <span className="text-xs">🗑️</span>
              Limpar
            </button>
            <button
              className="flex gap-2 secondary items-center bg-[var(--accent-color)] !text-white !border-none"
              onClick={() => {
                setDrawMode(false);
              }}>
              <span className="text-sm">✅</span>
              <div>Pronto</div>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
