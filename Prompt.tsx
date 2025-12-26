
/* tslint:disable */
import {GoogleGenAI} from '@google/genai';
import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
import React, {useState, useEffect} from 'react';
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  DetectTypeAtom,
  EditPromptAtom,
  FovAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  IsLoadingAtom,
  IsThinkingEnabledAtom,
  LinesAtom,
  PointsAtom,
  PromptsAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  SelectedModelAtom,
  SelectedObjectIndexAtom,
  TemperatureAtom,
} from './atoms';
import {lineOptions, promptSuggestions} from './consts';
import {DetectTypes} from './Types';
import {getSvgPathFromStroke, loadImage} from './utils';

export function Prompt() {
  const [temperature] = useAtom(TemperatureAtom);
  const [boundingBoxes2D, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxMasks, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [boundingBoxes3D, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [points, setPoints] = useAtom(PointsAtom);
  const [fov] = useAtom(FovAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const [targetPrompt, setTargetPrompt] = useState('itens');
  const [selectedModel] = useAtom(SelectedModelAtom);
  const [isThinkingEnabled] = useAtom(IsThinkingEnabledAtom);
  const [selectedIdx, setSelectedIdx] = useAtom(SelectedObjectIndexAtom);
  const [editPrompt, setEditPrompt] = useAtom(EditPromptAtom);
  const [prompts, setPrompts] = useAtom(PromptsAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);
  const [, setRequestJson] = useAtom(RequestJsonAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);

  const is2d = detectType === 'Caixas delimitadoras 2D';

  // Resetar prompt local quando mudar de modo
  useEffect(() => {
    if (is2d) {
       // Para 2D mantemos o targetPrompt simplificado
    } else {
       // Para outros usamos a estrutura de partes
    }
  }, [detectType]);

  const get2dPrompt = () =>
    `Detecte ${targetPrompt}, com no máximo 20 itens. Produza um JSON onde cada entrada contenha a caixa delimitadora 2D em "box_2d" e um rótulo de texto em "label".`;

  const getGenericPrompt = (type: DetectTypes) => {
    if (!prompts[type] || prompts[type].length < 3) return prompts[type]?.join(' ') || '';
    const [p0, p1, p2] = prompts[type];
    return `${p0} ${p1}${p2}`;
  };

  const getSelectedObjectData = () => {
    if (selectedIdx === null) return null;
    if (detectType === 'Caixas delimitadoras 2D') return boundingBoxes2D[selectedIdx];
    if (detectType === 'Máscaras de segmentação') return boundingBoxMasks[selectedIdx];
    if (detectType === 'Pontos') return points[selectedIdx];
    return null;
  };

  async function handleSend() {
    if (isLoading || !imageSrc) return;
    setIsLoading(true);
    setRequestJson('');
    setResponseJson('');
    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const maxSize = 1024;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;
      const image = await loadImage(imageSrc);
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      copyCanvas.width = image.width * scale;
      copyCanvas.height = image.height * scale;
      ctx.drawImage(image, 0, 0, copyCanvas.width, copyCanvas.height);
      const activeDataURL = copyCanvas.toDataURL('image/png').split(',')[1];

      const config: any = { temperature, responseMimeType: 'application/json' };
      if (!isThinkingEnabled) config.thinkingConfig = {thinkingBudget: 0};

      let textPromptToSend = is2d ? get2dPrompt() : getGenericPrompt(detectType);

      const requestPayload = {
        model: selectedModel,
        contents: { parts: [{ inlineData: { data: activeDataURL, mimeType: 'image/png' } }, { text: textPromptToSend }] },
        config
      };

      const displayPayload = JSON.parse(JSON.stringify(requestPayload));
      displayPayload.contents.parts[0].inlineData.data = '<IMAGE_DATA>';
      setRequestJson(JSON.stringify(displayPayload, null, 2));

      const genAIResponse = await ai.models.generateContent(requestPayload);
      let responseText = genAIResponse.text || '';
      if (responseText.includes('```json')) responseText = responseText.split('```json')[1].split('```')[0];
      
      const parsedResponse = JSON.parse(responseText);
      setResponseJson(JSON.stringify(parsedResponse, null, 2));

      setBoundingBoxes2D([]); setBoundingBoxMasks([]); setPoints([]); setBoundingBoxes3D([]); setSelectedIdx(null);

      if (is2d) {
        setBoundingBoxes2D(parsedResponse.map((box: any) => ({
          x: box.box_2d[1] / 1000, y: box.box_2d[0] / 1000,
          width: (box.box_2d[3] - box.box_2d[1]) / 1000,
          height: (box.box_2d[2] - box.box_2d[0]) / 1000,
          label: box.label
        })));
      } else if (detectType === 'Máscaras de segmentação') {
        setBoundingBoxMasks(parsedResponse.map((box: any) => ({
          x: box.box_2d[1]/1000, y: box.box_2d[0]/1000,
          width: (box.box_2d[3]-box.box_2d[1])/1000,
          height: (box.box_2d[2]-box.box_2d[0])/1000,
          label: box.label, imageData: box.mask
        })));
      } else if (detectType === 'Pontos') {
        setPoints(parsedResponse.map((p: any) => ({
          point: { x: p.point[1]/1000, y: p.point[0]/1000 },
          label: p.label
        })));
      }
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEdit() {
    const selectedObj = getSelectedObjectData();
    if (!selectedObj || !editPrompt || isLoading) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const image = await loadImage(imageSrc!);
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      const base64Image = canvas.toDataURL('image/png').split(',')[1];

      const fullEditPrompt = `In this image, edit the object '${selectedObj.label}'. Modification: ${editPrompt}. Return only the modified image.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: base64Image, mimeType: 'image/png' } }, { text: fullEditPrompt }] }
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setImageSrc(`data:image/png;base64,${part.inlineData.data}`);
          setSelectedIdx(null); setEditPrompt('');
          break;
        }
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (is2d) {
      setTargetPrompt(suggestion);
    } else {
      setPrompts(prev => ({
        ...prev,
        [detectType]: [prev[detectType][0], suggestion, prev[detectType][2]]
      }));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sugestões de Exemplos Rápidos */}
      <div className="flex flex-wrap gap-2 mb-1">
        <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] self-center mr-2">Exemplos:</span>
        {promptSuggestions[detectType].map((suggestion, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-[10px] px-3 py-1 bg-white/5 hover:bg-[var(--accent-color)] hover:text-white border border-white/10 rounded-full transition-all whitespace-nowrap !min-h-0 !p-1"
            disabled={isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Barra de Edição Contextual */}
      {selectedIdx !== null && (
        <div className="flex items-center gap-3 bg-yellow-400/20 border border-yellow-400/40 p-2 rounded-xl animate-in slide-in-from-bottom-2">
          <span className="text-[10px] font-black uppercase text-yellow-400 whitespace-nowrap pl-2">Ajuste IA: {getSelectedObjectData()?.label}</span>
          <input 
            type="text" 
            className="grow border-none bg-transparent text-sm p-1 focus:ring-0 placeholder-yellow-600/50 text-white outline-none" 
            placeholder="Ex: transforme em metal, remova, mude a cor..." 
            value={editPrompt}
            onChange={e => setEditPrompt(e.target.value)}
          />
          <button onClick={handleEdit} className="bg-yellow-400 text-black text-[10px] font-bold py-1 px-4 rounded-lg hover:bg-yellow-500 shadow-lg">EXECUTAR</button>
          <button onClick={() => setSelectedIdx(null)} className="text-[10px] text-yellow-400/70 px-2 font-bold hover:text-yellow-400">FECHAR</button>
        </div>
      )}

      {/* Barra Principal de Comando */}
      <div className="flex items-center gap-3 relative">
        <div className="grow relative group">
          <input
            type="text"
            className="w-full h-14 pl-12 pr-4 bg-black/60 border border-white/10 rounded-2xl text-base focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all shadow-inner placeholder-white/20"
            placeholder={is2d ? "O que devo encontrar na cena?" : "Especifique o alvo da detecção..."}
            value={is2d ? targetPrompt : (prompts[detectType]?.[1] ?? '')}
            onChange={e => is2d ? setTargetPrompt(e.target.value) : setPrompts({...prompts, [detectType]: [prompts[detectType][0], e.target.value, prompts[detectType][2]]})}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">✨</span>
        </div>
        <button 
          onClick={() => handleSend()} 
          disabled={isLoading || !imageSrc}
          className="h-14 primary px-10 rounded-2xl whitespace-nowrap shadow-xl transform active:scale-95 transition-all"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>PROCESSANDO</span>
            </div>
          ) : 'ANALISAR AGORA'}
        </button>
      </div>
    </div>
  );
}
