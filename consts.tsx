
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

export const colors = [
  'rgb(0, 0, 0)',
  'rgb(255, 255, 255)',
  'rgb(213, 40, 40)',
  'rgb(250, 123, 23)',
  'rgb(240, 186, 17)',
  'rgb(8, 161, 72)',
  'rgb(26, 115, 232)',
  'rgb(161, 66, 244)',
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r, g, b];
}

export const segmentationColors = [
  '#E6194B',
  '#3C89D0',
  '#3CB44B',
  '#FFE119',
  '#911EB4',
  '#42D4F4',
  '#F58231',
  '#F032E6',
  '#BFEF45',
  '#469990',
];
export const segmentationColorsRgb = segmentationColors.map((c) => hexToRgb(c));

export const imageOptions: string[] = await Promise.all(
  [
    'aloha-arms-table.png',
    'cart.png',
    'mango.png',
    'gameboard.png',
    'aloha_desk.png',
    'soarm-block.png',
    'top-down-fruits.png',
    'aloha-arms-trash.jpg',
    'grapes.png',
  ].map(async (i) =>
    URL.createObjectURL(
      await (
        await fetch(
          `https://storage.googleapis.com/generativeai-downloads/images/robotics/applet-robotics-spatial-understanding/${i}`,
        )
      ).blob(),
    ),
  ),
);

export const lineOptions = {
  size: 8,
  thinning: 0,
  smoothing: 0,
  streamline: 0,
  simulatePressure: false,
};

export const defaultPromptParts = {
  'Caixas delimitadoras 2D': [
    'Mostre-me as posições de',
    'itens',
    'como uma lista JSON. Não retorne máscaras. Limite a 25 itens.',
  ],
  'Máscaras de segmentação': [
    `Forneça as máscaras de segmentação para`,
    'todos os objetos',
    `. Produza uma lista JSON de máscaras de segmentação onde cada entrada contém a caixa delimitadora 2D na chave "box_2d", a máscara de segmentação na chave "mask" e o rótulo de texto na chave "label". Use rótulos descritivos.`,
  ],
  Pontos: [
    'Aponte para os',
    'itens',
    ' com no máximo 10 itens. A resposta deve seguir o formato JSON: [{"point": <ponto>, "label": <rótulo1>}, ...]. Os pontos estão no formato [y, x] normalizados de 0 a 1000.',
  ],
  'Detecção 3D': [
    'Detecte os objetos no espaço 3D para',
    'objetos visíveis',
    '. Produza uma lista JSON onde cada entrada tenha "box_3d" como [ymin, xmin, zmin, ymax, xmax, zmax] (normalizado 0-1000) e o rótulo em "label".',
  ]
};

export const promptSuggestions = {
  'Caixas delimitadoras 2D': [
    'todos os objetos pequenos',
    'utensílios de cozinha',
    'frutas e vegetais',
    'ferramentas robóticas',
    'itens na borda da mesa'
  ],
  'Máscaras de segmentação': [
    'o objeto mais importante',
    'todos os itens individuais',
    'recipientes e potes',
    'partes da cena'
  ],
  'Pontos': [
    'centro de cada item',
    'pontas das ferramentas',
    'contorno dos objetos'
  ],
  'Detecção 3D': [
    'volumes principais',
    'objetos empilhados',
    'espaços vazios entre itens'
  ]
};

export const defaultPrompts = {
  'Caixas delimitadoras 2D': defaultPromptParts['Caixas delimitadoras 2D'].join(' '),
  'Máscaras de segmentação': defaultPromptParts['Máscaras de segmentação'].join(''),
  Pontos: defaultPromptParts.Pontos.join(' '),
  'Detecção 3D': defaultPromptParts['Detecção 3D'].join(' '),
};

const safetyLevel = 'only_high';

export const safetySettings = new Map();

safetySettings.set('harassment', safetyLevel);
safetySettings.set('hate_speech', safetyLevel);
safetySettings.set('sexually_explicit', safetyLevel);
safetySettings.set('dangerous_content', safetyLevel);
safetySettings.set('civic_integrity', safetyLevel);
