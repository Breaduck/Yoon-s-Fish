import React, { useState, useEffect, useRef } from 'react';
import { useVideo } from '../../context/VideoContext';
import { useClips } from '../../context/ClipContext';
import { CameraService } from '../../services/cameraService';

const cameraService = new CameraService();

const CameraCapture: React.FC = () => {
  const { videoRef, setSource } = useVideo();
  const { addClip, clips } = useClips();
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDevices = async () => {
    const videoDevices = await cameraService.getAvailableDevices();
    setDevices(videoDevices);
    if (videoDevices.length > 0 && !selectedDevice) {
      setSelectedDevice(videoDevices[0].deviceId);
    }
  };

  const handleStartCamera = async (deviceId?: string) => {
    if (!videoRef.current) return;

    try {
      const stream = await cameraService.startCamera(
        videoRef.current,
        deviceId || selectedDevice
      );
      setSource({ type: 'camera', stream });
      setIsActive(true);
      setShowMenu(false);

      // 자동으로 녹화 시작
      setTimeout(() => {
        startRecording();
      }, 500);
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('카메라 접근에 실패했습니다. 권한을 확인하세요.');
    }
  };

  const handleStopCamera = () => {
    if (isRecording) {
      stopRecording();
    }
    cameraService.stopCamera();
    setSource({ type: 'file', url: undefined });
    setIsActive(false);
  };

  const startRecording = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const actualDuration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
        addClip({
          id: `clip-${Date.now()}`,
          title: `#${clips.length + 1}`,
          blob,
          url,
          duration: actualDuration,
          timestamp: Date.now(),
          cameraId: selectedDevice,
        });
      };

      mediaRecorderRef.current = recorder;
      recordingStartTimeRef.current = Date.now();
      recorder.start();
      setIsRecording(true);

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
        startRecording();
      }, 20000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('녹화 시작에 실패했습니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    setIsRecording(false);
  };

  return (
    <div className="flex gap-2 relative">
      {!isActive ? (
        <>
          <button
            onClick={() => handleStartCamera()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md"
          >
            카메라 녹화
          </button>
          {devices.length > 1 && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                📹
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] z-50">
                  {devices.map((device, index) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        setSelectedDevice(device.deviceId);
                        handleStartCamera(device.deviceId);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${
                        selectedDevice === device.deviceId
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {device.label || `카메라 ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md"
            >
              ● 녹화 시작
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md animate-pulse"
            >
              ■ 녹화 중...
            </button>
          )}
          <button
            onClick={handleStopCamera}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md"
          >
            카메라 중지
          </button>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
