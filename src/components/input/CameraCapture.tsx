import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { CameraService } from '../../services/cameraService';

const cameraService = new CameraService();

const CameraCapture: React.FC = () => {
  const { videoRef, setSource } = useVideo();
  const [isActive, setIsActive] = useState(false);

  const handleStartCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await cameraService.startCamera(videoRef.current);
      setSource({ type: 'camera', stream });
      setIsActive(true);
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Failed to access camera. Please check permissions.');
    }
  };

  const handleStopCamera = () => {
    cameraService.stopCamera();
    setSource({ type: 'file', url: undefined });
    setIsActive(false);
  };

  return (
    <div>
      {!isActive ? (
        <button
          onClick={handleStartCamera}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-500/30"
        >
          카메라 시작
        </button>
      ) : (
        <button
          onClick={handleStopCamera}
          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg text-white rounded-xl font-semibold transition-all shadow-md shadow-red-500/30"
        >
          카메라 중지
        </button>
      )}
    </div>
  );
};

export default CameraCapture;
