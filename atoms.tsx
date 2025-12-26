
/* tslint:disable */
import {atom} from 'jotai';
import {
  colors,
  defaultPromptParts,
  defaultPrompts,
  imageOptions,
} from './consts';
import {
  BoundingBox2DType,
  BoundingBoxMaskType,
  DetectTypes,
  PointingType,
} from './Types';

export type AppTab = 'vision' | 'archive' | 'console';
export type ImageSize = '1K' | '2K' | '4K';

export interface HistoryItem {
  id: string;
  timestamp: string;
  imageSrc: string;
  detectType: string;
  prompt: string;
  jsonResult: string;
}

export const ActiveTabAtom = atom<AppTab>('vision');
export const GenerationHistoryAtom = atom<HistoryItem[]>([]);

// Gallery management
export const GalleryImagesAtom = atom<string[]>(imageOptions);
export const SelectedImageIndexAtom = atom<number>(0);

// Derived atom for current image source
export const ImageSrcAtom = atom(
  (get) => {
    const images = get(GalleryImagesAtom);
    const index = get(SelectedImageIndexAtom);
    return images[index] || null;
  },
  (get, set, newValue: string | null) => {
    // If setting a new single image (like from generation), we append it to gallery and select it
    if (newValue) {
      const currentGallery = get(GalleryImagesAtom);
      set(GalleryImagesAtom, [...currentGallery, newValue]);
      set(SelectedImageIndexAtom, currentGallery.length);
    }
  }
);

export const ImageSentAtom = atom(false);
export const BoundingBoxes2DAtom = atom<BoundingBox2DType[]>([]);
export const PromptsAtom = atom<Record<DetectTypes, string[]>>({
  ...defaultPromptParts,
});
export const CustomPromptsAtom = atom<Record<DetectTypes, string>>({
  ...defaultPrompts,
});
export const BoundingBoxMasksAtom = atom<BoundingBoxMaskType[]>([]);
export const PointsAtom = atom<PointingType[]>([]);
export const TemperatureAtom = atom<number>(0.4);
export const DetectTypeAtom = atom<DetectTypes | 'Geração Pro' | 'Edição IA'>('Caixas delimitadoras 2D');
export const RequestJsonAtom = atom('');
export const ResponseJsonAtom = atom('');
export const ActiveColorAtom = atom<string>(colors[0]);
export const LinesAtom = atom<any[]>([]);
export const SelectedModelAtom = atom('gemini-3-flash-preview');
export const IsLoadingAtom = atom(false);
export const BoundingBoxes3DAtom = atom<any[]>([]);
export const FovAtom = atom(75);
export const SelectedObjectIndexAtom = atom<number | null>(null);
export const EditPromptAtom = atom<string>('');
export const SelectedImageSizeAtom = atom<ImageSize>('1K');

export const BrushSizeAtom = atom<number>(8);
export const BrushOpacityAtom = atom<number>(1);
export const DrawModeAtom = atom<boolean>(false);
export const RevealOnHoverModeAtom = atom<boolean>(false);
export const BumpSessionAtom = atom<number>(0);
