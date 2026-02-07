import React, { useRef } from 'react';
import { useVideo } from '../../context/VideoContext';
import { useTool } from '../../context/ToolContext';

interface VideoUploadProps {
  isSecondVideo?: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ isSecondVideo = false }) => {
  const { setSource, setSource2 } = useVideo();
  const { isComparisonMode } = useTool();
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
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold transition-all shadow-md"
      >
        {isComparisonMode
          ? (isSecondVideo ? 'After 영상 업로드' : 'Before 영상 업로드')
          : '영상 업로드'
        }
      </button>
    </div>
  );
};

export default VideoUpload;
