import React, { useRef, useEffect } from 'react';
import { VideoProvider, useVideo } from './context/VideoContext';
import { AnnotationProvider, useAnnotations } from './context/AnnotationContext';
import { ToolProvider, useTool } from './context/ToolContext';
import { ClipProvider } from './context/ClipContext';
import VideoPlayer from './components/video/VideoPlayer';
import VideoPlayer2 from './components/video/VideoPlayer2';
import VideoCanvas from './components/video/VideoCanvas';
import VideoCanvas2 from './components/video/VideoCanvas2';
import VideoControls from './components/video/VideoControls';
import FullscreenPlayer from './components/video/FullscreenPlayer';
import ToolPanel from './components/tools/ToolPanel';
import ClipPanel from './components/clips/ClipPanel';
import VideoUpload from './components/input/VideoUpload';
import CameraCapture from './components/input/CameraCapture';
import IPCameraInput from './components/input/IPCameraInput';
import LiveCameraSelect from './components/input/LiveCameraSelect';
import ExportDialog from './components/export/ExportDialog';

function AppContent() {
  const { isComparisonMode, setIsComparisonMode } = useTool();
  const { videoState, secondVideoSource, setSource, setSource2, playVideo1, pauseVideo1, playVideo2, pauseVideo2, playBoth } = useVideo();
  const { annotations, removeArrow, removeFreeDraw, removeAngle } = useAnnotations();

  // Hidden file inputs for click-to-upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  // Controls visibility state
  const [showControls, setShowControls] = React.useState(true);
  const [showControlsVideo1, setShowControlsVideo1] = React.useState(false);
  const [showControlsVideo2, setShowControlsVideo2] = React.useState(false);

  const handleFileUpload = (file: File, isSecondVideo: boolean) => {
    const url = URL.createObjectURL(file);
    if (isSecondVideo) {
      setSource2({ type: 'file', url });
    } else {
      setSource({ type: 'file', url });
    }
  };

  // Handle ESC/BACKSPACE/DELETE to remove last added annotation in order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete') {
        // Find the most recent annotation across all types
        let mostRecent: { type: 'arrow' | 'drawing' | 'angle'; id: string; createdAt: number } | null = null;

        annotations.arrows.forEach(a => {
          if (!mostRecent || a.createdAt > mostRecent.createdAt) {
            mostRecent = { type: 'arrow', id: a.id, createdAt: a.createdAt };
          }
        });

        annotations.freeDrawings.forEach(d => {
          if (!mostRecent || d.createdAt > mostRecent.createdAt) {
            mostRecent = { type: 'drawing', id: d.id, createdAt: d.createdAt };
          }
        });

        annotations.angles.forEach(a => {
          if (!mostRecent || a.createdAt > mostRecent.createdAt) {
            mostRecent = { type: 'angle', id: a.id, createdAt: a.createdAt };
          }
        });

        // Remove it
        if (mostRecent) {
          e.preventDefault();
          if (mostRecent.type === 'arrow') {
            removeArrow(mostRecent.id);
          } else if (mostRecent.type === 'drawing') {
            removeFreeDraw(mostRecent.id);
          } else if (mostRecent.type === 'angle') {
            removeAngle(mostRecent.id);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [annotations, removeArrow, removeFreeDraw, removeAngle]);

  return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
            {/* Hidden file inputs for click-to-upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, false);
              }}
              className="hidden"
            />
            <input
              ref={fileInput2Ref}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, true);
              }}
              className="hidden"
            />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm relative overflow-visible" style={{ zIndex: 100000 }}>
              <div className="px-6 py-6 flex items-center justify-between min-h-[80px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#083985' }}>
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <h1 className="text-2xl font-bold" style={{ color: '#083985' }}>
                    AQUAFLUX
                  </h1>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsComparisonMode(!isComparisonMode)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isComparisonMode
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isComparisonMode ? '비교 모드' : '비교 모드'}
                  </button>
                  {!isComparisonMode && <VideoUpload />}
                  {isComparisonMode && (
                    <>
                      <VideoUpload />
                      <VideoUpload isSecondVideo={true} />
                    </>
                  )}
                  <CameraCapture />
                  <LiveCameraSelect />
                  <ExportDialog />
                </div>
              </div>
            </header>

            {/* Main content */}
            <div className="flex gap-3 px-3 py-4">
              {/* Tool panel - left */}
              <aside style={{ width: '135px', flexShrink: 0 }}>
                <ToolPanel />
              </aside>

              {/* Video area - center, flexible */}
              <main className="flex-1" style={{ minWidth: 0 }}>
                  <div className="space-y-5">
                    {/* Video player container */}
                    {isComparisonMode ? (
                      <div className="bg-white rounded-3xl overflow-hidden aspect-video relative flex gap-3 p-3 shadow-xl">
                        {/* Before Video - Left */}
                        <div
                          className="flex-1 relative bg-black rounded-2xl overflow-hidden"
                          onMouseEnter={() => setShowControlsVideo1(true)}
                          onMouseLeave={() => setShowControlsVideo1(false)}
                        >
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800 z-10 shadow-lg">
                            Before
                          </div>
                          <VideoPlayer />
                          <VideoCanvas />
                          {/* Empty state upload icon for Before video */}
                          {!videoState.source && (
                            <div
                              className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-gray-900/10 transition-all"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <div className="text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-gray-500 text-sm font-semibold">Before 영상</p>
                              </div>
                            </div>
                          )}
                          {/* Video controls overlay - hover to show */}
                          <div
                            className={`absolute bottom-0 left-0 right-0 px-6 py-3 transition-opacity duration-300 ${
                              showControlsVideo1 ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            <VideoControls />
                          </div>
                        </div>

                        {/* After Video - Right */}
                        <div
                          className="flex-1 relative bg-black rounded-2xl overflow-hidden"
                          onMouseEnter={() => setShowControlsVideo2(true)}
                          onMouseLeave={() => setShowControlsVideo2(false)}
                        >
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800 z-10 shadow-lg">
                            After
                          </div>
                          <VideoPlayer2 />
                          <VideoCanvas2 key={`canvas2-${secondVideoSource?.url || 'none'}`} />
                          {/* Empty state upload icon for After video */}
                          {!secondVideoSource && (
                            <div
                              className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-gray-900/10 transition-all"
                              onClick={() => fileInput2Ref.current?.click()}
                            >
                              <div className="text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-gray-500 text-sm font-semibold">After 영상</p>
                              </div>
                            </div>
                          )}
                          {/* Video controls overlay - hover to show */}
                          <div
                            className={`absolute bottom-0 left-0 right-0 px-6 py-3 transition-opacity duration-300 ${
                              showControlsVideo2 ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            <VideoControls />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                        <div
                          className="bg-black aspect-video relative"
                          onMouseEnter={() => setShowControls(true)}
                          onMouseLeave={() => setShowControls(false)}
                        >
                          <VideoPlayer />
                          <VideoCanvas />
                          {/* Empty state upload icon */}
                          {!videoState.source && (
                            <div
                              className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-gray-900/10 transition-all"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <div className="text-center">
                                <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-gray-500 font-semibold">영상을 업로드하세요</p>
                              </div>
                            </div>
                          )}
                          {/* Video controls overlay - inside video for single mode with auto-hide */}
                          <div
                            className={`absolute bottom-0 left-0 right-0 px-6 py-3 transition-opacity duration-300 ${
                              showControls ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            <VideoControls />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </main>

              {/* Clip panel - right */}
              <aside style={{ width: '264px', flexShrink: 0 }}>
                <ClipPanel />
              </aside>
            </div>

            {/* Fullscreen Player */}
            <FullscreenPlayer />
          </div>
  );
}

function App() {
  return (
    <VideoProvider>
      <AnnotationProvider>
        <ToolProvider>
          <ClipProvider>
            <AppContent />
          </ClipProvider>
        </ToolProvider>
      </AnnotationProvider>
    </VideoProvider>
  );
}

export default App;
