import React, { useRef } from 'react';
import { useVideo } from '../../context/VideoContext';

interface VideoUploadProps {
  isSecondVideo?: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ isSecondVideo = false }) => {
  const { setSource, setSource2 } = useVideo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (isSecondVideo) {
      setSource2({ type: 'file', url });
    } else {
      setSource({ type: 'file', url });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
          isSecondVideo
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white shadow-purple-500/30'
            : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg text-white shadow-blue-500/30'
        }`}
      >
        {isSecondVideo ? '📹 After 영상' : '📹 Before 영상'}
      </button>
    </div>
  );
};

export default VideoUpload;
