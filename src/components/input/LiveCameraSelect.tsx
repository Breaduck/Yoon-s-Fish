import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { useTool } from '../../context/ToolContext';

const LiveCameraSelect: React.FC = () => {
  const { setSource, setSource2 } = useVideo();
  const { setIsComparisonMode } = useTool();
  const [showModal, setShowModal] = useState(false);

  const handleCameraSelect = (selection: 'camera1' | 'camera2' | 'both') => {
    const baseUrl = 'http://localhost:8888';

    if (selection === 'camera1') {
      setIsComparisonMode(false);
      setSource({ type: 'stream', url: `${baseUrl}/camera1/index.m3u8` });
    } else if (selection === 'camera2') {
      setIsComparisonMode(false);
      setSource({ type: 'stream', url: `${baseUrl}/camera2/index.m3u8` });
    } else if (selection === 'both') {
      setIsComparisonMode(true);
      setSource({ type: 'stream', url: `${baseUrl}/camera1/index.m3u8` });
      setSource2({ type: 'stream', url: `${baseUrl}/camera2/index.m3u8` });
    }

    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-md"
      >
        실시간 카메라
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 999999 }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">카메라 선택</h3>

            <div className="space-y-3">
              <button
                onClick={() => handleCameraSelect('camera1')}
                className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all text-lg"
              >
                카메라 1 (Before)
              </button>

              <button
                onClick={() => handleCameraSelect('camera2')}
                className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all text-lg"
              >
                카메라 2 (After)
              </button>

              <button
                onClick={() => handleCameraSelect('both')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all text-lg"
              >
                카메라 1 + 2 (비교)
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                MediaMTX 서버가 실행 중이어야 합니다
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveCameraSelect;
