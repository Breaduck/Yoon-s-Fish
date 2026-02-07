export interface Clip {
  id: string;
  title: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: number;
  cameraId?: string;
}
