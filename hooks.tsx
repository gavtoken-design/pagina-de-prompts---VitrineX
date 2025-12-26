
/* tslint:disable */
import {useAtom} from 'jotai';
import {
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  BumpSessionAtom,
  ImageSentAtom,
  PointsAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  GalleryImagesAtom,
  SelectedImageIndexAtom,
  GenerationHistoryAtom
} from './atoms';
import {imageOptions} from './consts';

const STORAGE_KEY = 'gemini_studio_session_v1';

export function useResetState() {
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setRequestJson] = useAtom(RequestJsonAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);
  const [, setGallery] = useAtom(GalleryImagesAtom);
  const [, setSelectedIdx] = useAtom(SelectedImageIndexAtom);
  const [, setHistory] = useAtom(GenerationHistoryAtom);

  return (fullReset: boolean = false) => {
    setImageSent(false);
    setBoundingBoxes2D([]);
    setBoundingBoxMasks([]);
    setBumpSession((prev) => prev + 1);
    setPoints([]);
    setRequestJson('');
    setResponseJson('');
    
    if (fullReset) {
      setGallery(imageOptions);
      setSelectedIdx(0);
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      // Optional: force reload to ensure all volatile blobs are cleared
      // window.location.reload(); 
    }
  };
}
