import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const clipCounterRef = useRef<number>(0);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (showCameraSelector) {
      loadDevices();
    }
  }, [showCameraSelector]);

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
    clipCounterRef.current = 0; // Reset counter when camera stops
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
      const startTime = Date.now(); // Capture start time in closure
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const actualDuration = Math.round((Date.now() - startTime) / 1000); // Use captured startTime
        clipCounterRef.current += 1;
        addClip({
          id: `clip-${Date.now()}`,
          title: `#${clipCounterRef.current}`,
          blob,
          url,
          duration: actualDuration,
          timestamp: Date.now(),
          cameraId: selectedDevice,
        });
      };

      mediaRecorderRef.current = recorder;
      recordingStartTimeRef.current = startTime;
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
    <>
      <div className="flex gap-2 relative">
        {!isActive ? (
          <button
            onClick={() => setShowCameraSelector(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md"
          >
            카메라 녹화
          </button>
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

      {/* Camera Selector Modal */}
      {showCameraSelector && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-6 overflow-y-auto"
          style={{ zIndex: 999999, top: 0, left: 0, right: 0, bottom: 0, position: 'fixed' }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mt-20 mb-6" style={{ maxHeight: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column' }}>
            <div className="p-6 overflow-y-auto" style={{ flex: '1 1 auto', minHeight: 0 }}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">카메라 선택</h3>

            <div className="space-y-4 mb-6">
              {/* IP 카메라 (MediaMTX) */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">실시간 IP 카메라</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSource({ type: 'stream', url: 'http://localhost:8888/camera1/index.m3u8' });
                      setShowCameraSelector(false);
                    }}
                    className="w-full px-4 py-3 text-left rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="font-semibold text-gray-800">IP 카메라 1 (Before)</div>
                    <div className="text-sm text-gray-500">192.168.0.200 - MediaMTX</div>
                  </button>
                  <button
                    onClick={() => {
                      setSource({ type: 'stream', url: 'http://localhost:8888/camera2/index.m3u8' });
                      setShowCameraSelector(false);
                    }}
                    className="w-full px-4 py-3 text-left rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="font-semibold text-gray-800">IP 카메라 2 (After)</div>
                    <div className="text-sm text-gray-500">192.168.0.201 - MediaMTX</div>
                  </button>
                </div>
              </div>

              {/* 로컬 웹캠 */}
              {devices.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">로컬 웹캠</h4>
                  <div className="space-y-2">
                    {devices.map((device, index) => (
                      <button
                        key={device.deviceId}
                        onClick={() => {
                          setSelectedDevice(device.deviceId);
                          setShowCameraSelector(false);
                          handleStartCamera(device.deviceId);
                        }}
                        className="w-full px-4 py-3 text-left rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <div className="font-semibold text-gray-800">
                          {device.label || `웹캠 ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {device.deviceId.substring(0, 20)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCameraSelector(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default CameraCapture;
