export interface ExportOptions {
  format: 'webm' | 'mp4';
  quality: 'low' | 'medium' | 'high';
  includeAnnotations: boolean;
  includePose: boolean;
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'encoding' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}
