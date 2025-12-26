
/* tslint:disable */
import {GoogleGenAI, Type} from '@google/genai';
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  DetectTypeAtom,
  EditPromptAtom,
  ImageSrcAtom,
  SelectedImageIndexAtom,
  IsLoadingAtom,
  PointsAtom,
  PromptsAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  SelectedImageSizeAtom,
  SelectedModelAtom,
  SelectedObjectIndexAtom,
  TemperatureAtom,
  GenerationHistoryAtom,
  HistoryItem
} from './atoms';
import {imageContextualSuggestions, defaultPrompts} from './consts';
import {loadImage} from './utils';

export function Prompt() {
  const [detectType] = useAtom(DetectTypeAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const [imageIndex] = useAtom(SelectedImageIndexAtom);
  const [selectedSize] = useAtom(SelectedImageSizeAtom);
  const [temp] = useAtom(TemperatureAtom);
  const [selectedIdx, setSelectedIdx] = useAtom(SelectedObjectIndexAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setRequestJson] = useAtom(RequestJsonAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);
  const [, setHistory] = useAtom(GenerationHistoryAtom);

  const [localInput, setLocalInput] = useState('');

  const isCreative = detectType === 'Geração Pro';
  const isEditing = detectType === 'Edição IA' || selectedIdx !== null;

  const saveToHistory = (img: string, type: string, prompt: string, json: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      imageSrc: img,
      detectType: type,
      prompt: prompt,
      jsonResult: json
    };
    setHistory(prev => [newItem, ...prev]);
  };

  async function handleAction() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isCreative) {
        if (!(window as any).aistudio.hasSelectedApiKey()) await (window as any).aistudio.openSelectKey();
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: localInput }] },
          config: { imageConfig: { aspectRatio: "1:1", imageSize: selectedSize } }
        });
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { 
            const newImg = `data:image/png;base64,${part.inlineData.data}`;
            setImageSrc(newImg); 
            saveToHistory(newImg, detectType, localInput, "{}");
            break; 
          }
        }
      } else if (isEditing) {
        const img = await loadImage(imageSrc!);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: localInput }] }
        });
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { 
            const newImg = `data:image/png;base64,${part.inlineData.data}`;
            setImageSrc(newImg); 
            saveToHistory(newImg, detectType, localInput, "{}");
            break; 
          }
        }
      } else {
        const img = await loadImage(imageSrc!);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        
        const systemPrompt = defaultPrompts[detectType as keyof typeof defaultPrompts] || "";
        const userPrompt = localInput ? `Foque em: ${localInput}` : "Detecte todos os itens relevantes.";

        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const response = await ai.models.generateContent({
          model: detectType === 'Detecção 3D' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
          contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: `${systemPrompt}\n${userPrompt}` }] },
          config: { responseMimeType: 'application/json', temperature: temp }
        });

        const data = JSON.parse(response.text || "[]");
        const jsonStr = JSON.stringify(data, null, 2);
        setResponseJson(jsonStr);
        saveToHistory(imageSrc!, detectType, localInput || 'Detecção Automática', jsonStr);

        if (detectType === 'Caixas delimitadoras 2D') {
          setBoundingBoxes2D(data.map((item: any) => ({
            y: item.box_2d[0] / 1000, x: item.box_2d[1] / 1000,
            height: (item.box_2d[2] - item.box_2d[0]) / 1000,
            width: (item.box_2d[3] - item.box_2d[1]) / 1000,
            label: item.label
          })));
        } else if (detectType === 'Pontos') {
          setPoints(data.map((item: any) => ({
            point: { y: item.point[0] / 1000, x: item.point[1] / 1000 },
            label: item.label
          })));
        } else if (detectType === 'Máscaras de segmentação') {
          setBoundingBoxMasks(data.map((item: any) => ({
            y: item.box_2d[0] / 1000, x: item.box_2d[1] / 1000,
            height: (item.box_2d[2] - item.box_2d[0]) / 1000,
            width: (item.box_2d[3] - item.box_2d[1]) / 1000,
            label: item.label,
            imageData: item.mask
          })));
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Erro na inferência: " + e.message);
    } finally {
      setIsLoading(false);
      setLocalInput('');
    }
  }

  // Busca sugestões específicas para a imagem atual e modo atual
  const suggestions = imageContextualSuggestions[imageIndex]?.[detectType as string] || [];

  // Descriptive placeholders based on current mode
  const getPlaceholder = () => {
    switch (detectType) {
      case 'Caixas delimitadoras 2D':
        return "Descreva objetos para detectar (ex: 'todos os cabos', 'caixas azuis')...";
      case 'Máscaras de segmentação':
        return "Isolamento detalhado (ex: 'contorne a garra do robô', 'separe cada fruta')...";
      case 'Pontos':
        return "Marque pontos específicos (ex: 'centros das rodas', 'pontas das garras')...";
      case 'Detecção 3D':
        return "Identifique volumes no espaço (ex: 'caixas na prateleira', 'cubos empilhados')...";
      case 'Geração Pro':
        return "Crie uma imagem do zero (ex: 'Um robô futurista limpando uma sala de estar')...";
      case 'Edição IA':
        return "Modifique a cena (ex: 'mude a cor da lixeira para vermelho', 'adicione um gato')...";
      default:
        return "Refine sua solicitação aqui...";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Suggestions Chips */}
      {!isCreative && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest self-center mr-2">Sugestões:</span>
          {suggestions.map(s => (
            <button 
              key={s}
              onClick={() => setLocalInput(s)}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-white/60 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all mono"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Main Bar */}
      <div className="flex gap-4 items-end">
        <div className="grow group">
          <label className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.3em] ml-4 mb-2 block transition-colors group-focus-within:text-blue-500">
            {detectType} Controller
          </label>
          <div className="relative">
            <input
              type="text"
              value={localInput}
              onChange={e => setLocalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAction()}
              placeholder={getPlaceholder()}
              className="w-full h-14 pl-6 pr-6 bg-black/40 border border-white/10 rounded-2xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <span className="text-[10px] mono text-white/20 uppercase">V-Engine_0.7</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleAction}
          disabled={isLoading || (!isCreative && !imageSrc)}
          className={`h-14 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-2xl ${
            isLoading ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-900/30'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>Executar <span className="opacity-40">↵</span></>
          )}
        </button>
      </div>
    </div>
  );
}
