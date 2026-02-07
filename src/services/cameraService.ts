export class CameraService {
  private stream: MediaStream | null = null;

  async startCamera(
    videoElement: HTMLVideoElement,
    constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: false,
    }
  ): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      await videoElement.play();
      return this.stream;
    } catch (error) {
      console.error('Failed to start camera:', error);
      throw error;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }

  isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }
}
