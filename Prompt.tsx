
/* tslint:disable */
import {GoogleGenAI, Type} from '@google/genai';
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  DetectTypeAtom,
  ImageSrcAtom,
  SelectedImageIndexAtom,
  IsLoadingAtom,
  PointsAtom,
  ResponseJsonAtom,
  SelectedImageSizeAtom,
  TemperatureAtom,
  GenerationHistoryAtom,
  HistoryItem,
  SelectedObjectIndexAtom
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
  const [selectedIdx] = useAtom(SelectedObjectIndexAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [, setPoints] = useAtom(PointsAtom);
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
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      if (isCreative) {
        if (!(window as any).aistudio.hasSelectedApiKey()) await (window as any).aistudio.openSelectKey();
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
      } else {
        const img = await loadImage(imageSrc!);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        
        const systemPrompt = defaultPrompts[detectType as keyof typeof defaultPrompts] || "";
        const userPrompt = localInput ? `Foque em: ${localInput}` : "Detecte todos os itens relevantes.";

        const response = await ai.models.generateContent({
          model: detectType === 'Detecção 3D' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
          contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: `${systemPrompt}\n${userPrompt}` }] },
          config: { responseMimeType: 'application/json', temperature: temp }
        });

        const data = JSON.parse(response.text || "[]");
        const jsonStr = JSON.stringify(data, null, 2);
        setResponseJson(jsonStr);
        saveToHistory(imageSrc!, detectType, localInput || 'Inferência Automática', jsonStr);

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
    } finally {
      setIsLoading(false);
      setLocalInput('');
    }
  }

  const suggestions = imageContextualSuggestions[imageIndex]?.[detectType as string] || [];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Dynamic Tags */}
      <div className="flex flex-wrap gap-2 px-4 h-6 overflow-hidden">
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest self-center mr-4">Context_Seeds:</span>
        {suggestions.map(s => (
          <button 
            key={s}
            onClick={() => setLocalInput(s)}
            className="px-2.5 py-0.5 rounded-sm border border-cyan-500/10 text-[8px] text-cyan-500/50 hover:text-cyan-400 hover:border-cyan-400/30 transition-all uppercase mono bg-cyan-500/5"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tactical Input */}
      <div className="flex items-center gap-6 bg-black/60 p-2 pl-6 rounded-2xl border border-white/5 shadow-inner group focus-within:border-cyan-500/40 transition-all">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]"></div>
          <span className="text-[10px] mono font-bold text-cyan-400 uppercase tracking-widest">Sys_Input:</span>
        </div>
        
        <input
          type="text"
          value={localInput}
          onChange={e => setLocalInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAction()}
          placeholder={`Aguardando comandos para ${detectType.toUpperCase()}...`}
          className="grow bg-transparent text-sm text-white placeholder-white/10 outline-none mono py-4"
        />

        <button
          onClick={handleAction}
          disabled={isLoading}
          className={`h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 ${
            isLoading ? 'bg-white/5 text-white/20' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
          }`}
        >
          {isLoading ? 'Executando...' : 'Run_Sequence'}
        </button>
      </div>
    </div>
  );
}
