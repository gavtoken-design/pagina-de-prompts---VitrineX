
/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Sugestões mapeadas pelo índice da imagem em imageOptions
export const imageContextualSuggestions: Record<number, Record<string, string[]>> = {
  0: { // aloha-arms-table
    'Caixas delimitadoras 2D': ['braços robóticos', 'ferramentas na mesa', 'cabos de conexão'],
    'Máscaras de segmentação': ['cada componente do robô', 'a superfície da mesa'],
    'Pontos': ['articulações do robô', 'pontas das garras'],
    'Detecção 3D': ['volume dos braços', 'área de alcance']
  },
  1: { // cart
    'Caixas delimitadoras 2D': ['produtos no carrinho', 'rodas do carrinho', 'alça'],
    'Máscaras de segmentação': ['cada item individual de mercado', 'a estrutura metálica'],
    'Pontos': ['centros das embalagens', 'eixo das rodas'],
    'Detecção 3D': ['espaço interno do carrinho', 'dimensões das caixas']
  },
  2: { // mango
    'Caixas delimitadoras 2D': ['mangas individuais', 'balança eletrônica', 'prato da balança'],
    'Máscaras de segmentação': ['cada fruta', 'o visor da balança'],
    'Pontos': ['ponto mais alto de cada manga', 'cantos da balança'],
    'Detecção 3D': ['volume total das frutas', 'altura da balança']
  },
  3: { // gameboard
    'Caixas delimitadoras 2D': ['peças de xadrez brancas', 'peças pretas', 'casas do tabuleiro'],
    'Máscaras de segmentação': ['o rei e a rainha', 'o tabuleiro completo'],
    'Pontos': ['base de cada peça', 'centro do tabuleiro'],
    'Detecção 3D': ['altura das peças', 'plano do tabuleiro']
  },
  4: { // aloha_desk
    'Caixas delimitadoras 2D': ['monitor', 'teclado', 'objetos de escritório'],
    'Máscaras de segmentação': ['periféricos', 'área de trabalho livre'],
    'Pontos': ['cantos do monitor', 'botões principais'],
    'Detecção 3D': ['profundidade da mesa', 'tamanho do monitor']
  },
  5: { // soarm-block
    'Caixas delimitadoras 2D': ['blocos coloridos', 'base de madeira', 'garra'],
    'Máscaras de segmentação': ['blocos empilhados', 'peça por peça'],
    'Pontos': ['vértices dos blocos', 'ponto de contato da garra'],
    'Detecção 3D': ['cubo de cada bloco', 'altura da pilha']
  },
  6: { // top-down-fruits
    'Caixas delimitadoras 2D': ['maçãs', 'bananas', 'frutas cítricas'],
    'Máscaras de segmentação': ['contorno de cada fruta', 'espaços entre elas'],
    'Pontos': ['centro geométrico das frutas'],
    'Detecção 3D': ['esfericidade', 'distribuição espacial']
  },
  7: { // aloha-arms-trash
    'Caixas delimitadoras 2D': ['lixeira', 'resíduos', 'braço robótico'],
    'Máscaras de segmentação': ['interior da lixeira', 'objetos descartados'],
    'Pontos': ['borda da lixeira', 'alvo de descarte'],
    'Detecção 3D': ['profundidade do cesto', 'posição do robô']
  },
  8: { // grapes
    'Caixas delimitadoras 2D': ['cachos de uva', 'uvas individuais', 'folhas'],
    'Máscaras de segmentação': ['cada bago de uva', 'o caule'],
    'Pontos': ['ponto de fixação no caule'],
    'Detecção 3D': ['densidade do cacho', 'espaço ocupado']
  }
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
