import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';

const IPCameraInput: React.FC = () => {
  const { setSource, setSource2 } = useVideo();
  const [showModal, setShowModal] = useState(false);
  const [camera1IP, setCamera1IP] = useState('');
  const [camera2IP, setCamera2IP] = useState('');
  const [camera1Port, setCamera1Port] = useState('80');
  const [camera2Port, setCamera2Port] = useState('80');
  const [camera1Path, setCamera1Path] = useState('/axis-cgi/mjpg/video.cgi');
  const [camera2Path, setCamera2Path] = useState('/axis-cgi/mjpg/video.cgi');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleConnect = () => {
    // Create authenticated URL
    const auth = username && password ? `${username}:${password}@` : '';

    if (camera1IP) {
      const url1 = `http://${auth}${camera1IP}:${camera1Port}${camera1Path}`;
      setSource({ type: 'stream', url: url1 });
    }

    if (camera2IP) {
      const url2 = `http://${auth}${camera2IP}:${camera2Port}${camera2Path}`;
      setSource2({ type: 'stream', url: url2 });
    }

    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all shadow-md"
      >
        IP 카메라 연결
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 999999, overflow: 'auto' }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-2xl w-full my-auto" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-6">IP 카메라 연결</h3>

            {/* Authentication */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3">인증 정보 (선택)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">사용자명</label>
                  <input
                    type="text"
                    placeholder="root"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">비밀번호</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Camera 1 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3">카메라 1 (Before)</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">IP 주소</label>
                  <input
                    type="text"
                    placeholder="예: 192.168.1.100"
                    value={camera1IP}
                    onChange={(e) => setCamera1IP(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">포트</label>
                    <input
                      type="text"
                      value={camera1Port}
                      onChange={(e) => setCamera1Port(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">경로</label>
                    <input
                      type="text"
                      value={camera1Path}
                      onChange={(e) => setCamera1Path(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  예: http://192.168.1.100:8080/video
                </div>
              </div>
            </div>

            {/* Camera 2 */}
            <div className="mb-6 p-4 bg-green-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3">카메라 2 (After)</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">IP 주소</label>
                  <input
                    type="text"
                    placeholder="예: 192.168.1.101"
                    value={camera2IP}
                    onChange={(e) => setCamera2IP(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">포트</label>
                    <input
                      type="text"
                      value={camera2Port}
                      onChange={(e) => setCamera2Port(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">경로</label>
                    <input
                      type="text"
                      value={camera2Path}
                      onChange={(e) => setCamera2Path(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  예: http://192.168.1.101:8080/video
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Axis 카메라 기본 설정:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• IP: 192.168.0.200 (카메라 IP 주소)</li>
                <li>• 포트: 80 (기본값)</li>
                <li>• 경로: /axis-cgi/mjpg/video.cgi</li>
                <li>• 인증: 카메라 관리자 계정</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConnect}
                disabled={!camera1IP && !camera2IP}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                연결
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IPCameraInput;
