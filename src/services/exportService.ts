import { ExportOptions, ExportProgress } from '../types/export';
import { AnnotationData, ReferenceLine } from '../types/drawing';
import { DrawingEngine } from './drawingEngine';

export class ExportService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isCancelled = false;

  async exportVideo(
    videoElement: HTMLVideoElement,
    annotations: AnnotationData,
    options: ExportOptions,
    onProgress: (progress: ExportProgress) => void,
    videoElement2?: HTMLVideoElement | null
  ): Promise<Blob> {
    this.isCancelled = false;

    onProgress({
      status: 'preparing',
      progress: 0,
      message: 'Preparing export...',
    });

    try {
      // Create offscreen canvas for rendering
      const canvas = document.createElement('canvas');
      const isComparisonMode = videoElement2 && videoElement2.src;

      if (isComparisonMode) {
        // Side by side: width is doubled
        canvas.width = videoElement.videoWidth * 2;
        canvas.height = videoElement.videoHeight;
      } else {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
      }

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Create drawing engine for annotations
      const drawingEngine = new DrawingEngine(canvas);

      // Determine MIME type
      const mimeType = this.getSupportedMimeType(options.format);
      if (!mimeType) {
        throw new Error('No supported video format found');
      }

      // Get canvas stream
      const stream = canvas.captureStream(30);

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: this.getBitrate(options.quality),
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      return new Promise((resolve, reject) => {
        if (!this.mediaRecorder) {
          reject(new Error('MediaRecorder not initialized'));
          return;
        }

        this.mediaRecorder.onstop = () => {
          if (this.isCancelled) {
            reject(new Error('Export cancelled'));
            return;
          }
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          onProgress({
            status: 'complete',
            progress: 100,
            message: 'Export complete!',
          });
          resolve(blob);
        };

        this.mediaRecorder.onerror = (event) => {
          reject(event);
        };

        onProgress({
          status: 'encoding',
          progress: 10,
          message: 'Recording video...',
        });

        this.mediaRecorder.start();

        // Reset video to start
        videoElement.currentTime = 0;

        // Wait for video to be ready then play
        const startExport = () => {
          videoElement.play();

          // Render loop - draw video + annotations for each frame
          const renderFrame = () => {
            if (this.isCancelled) {
              this.mediaRecorder?.stop();
              return;
            }

            if (videoElement.ended || videoElement.paused) {
              return;
            }

            // Draw current video frame(s)
            if (isComparisonMode && videoElement2) {
              // Draw left video (Before)
              ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
              // Draw right video (After)
              ctx.drawImage(videoElement2, videoElement.videoWidth, 0, videoElement2.videoWidth, videoElement2.videoHeight);

              // Draw "Before" and "After" labels
              ctx.save();
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(10, 10, 100, 40);
              ctx.fillRect(videoElement.videoWidth + 10, 10, 100, 40);
              ctx.fillStyle = 'white';
              ctx.font = 'bold 20px sans-serif';
              ctx.fillText('Before', 20, 38);
              ctx.fillText('After', videoElement.videoWidth + 20, 38);
              ctx.restore();
            } else {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            }

            // Draw annotations for current timestamp
            if (options.includeAnnotations) {
              const currentTimestamp = Math.floor(videoElement.currentTime * 1000);

              // Draw reference lines
              if (annotations.referenceLines.length > 0) {
                drawingEngine.drawReferenceLines(annotations.referenceLines);
              }

              // Draw arrows, free drawings, and angles for current time
              const currentArrows = annotations.arrows.filter(
                a => a.timestamp <= currentTimestamp
              );
              const currentDrawings = annotations.freeDrawings.filter(
                d => d.timestamp <= currentTimestamp
              );
              const currentAngles = annotations.angles.filter(
                a => a.timestamp <= currentTimestamp
              );

              drawingEngine.drawArrows(currentArrows);
              drawingEngine.drawFreeDrawings(currentDrawings);
              drawingEngine.drawAngles(currentAngles);
            }

            // Update progress
            if (videoElement.duration) {
              const progress = Math.min(
                90,
                10 + (videoElement.currentTime / videoElement.duration) * 80
              );
              onProgress({
                status: 'encoding',
                progress,
                message: `Recording: ${Math.round(progress)}%`,
              });
            }

            // Continue rendering
            requestAnimationFrame(renderFrame);
          };

          // Start rendering frames
          requestAnimationFrame(renderFrame);
        };

        // Handle video end
        videoElement.onended = () => {
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        };

        // Start export when video is seeked to beginning
        if (videoElement.readyState >= 2) {
          startExport();
        } else {
          videoElement.addEventListener('loadeddata', startExport, { once: true });
        }
      });
    } catch (error) {
      onProgress({
        status: 'error',
        progress: 0,
        message: 'Export failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private getSupportedMimeType(format: 'webm' | 'mp4'): string | null {
    // Try MP4 first regardless of format parameter
    const mp4Types = ['video/mp4;codecs=h264', 'video/mp4'];
    for (const type of mp4Types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // Fallback to WebM
    const webmTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const type of webmTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
  }

  private getBitrate(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low':
        return 2500000; // 2.5 Mbps
      case 'medium':
        return 5000000; // 5 Mbps
      case 'high':
        return 10000000; // 10 Mbps
    }
  }

  downloadBlob(blob: Blob, filename: string) {
    // Ensure filename has correct extension based on blob type
    const extension = blob.type.includes('mp4') ? '.mp4' : '.webm';
    if (!filename.endsWith(extension)) {
      filename = filename.replace(/\.(mp4|webm)$/, '') + extension;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  cancel() {
    this.isCancelled = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.recordedChunks = [];
  }
}
