import { VideoProvider } from './context/VideoContext';
import { AnnotationProvider } from './context/AnnotationContext';
import { ToolProvider, useTool } from './context/ToolContext';
import VideoPlayer from './components/video/VideoPlayer';
import VideoPlayer2 from './components/video/VideoPlayer2';
import VideoCanvas from './components/video/VideoCanvas';
import VideoCanvas2 from './components/video/VideoCanvas2';
import VideoControls from './components/video/VideoControls';
import FullscreenPlayer from './components/video/FullscreenPlayer';
import ToolPanel from './components/tools/ToolPanel';
import VideoUpload from './components/input/VideoUpload';
import CameraCapture from './components/input/CameraCapture';
import ExportDialog from './components/export/ExportDialog';

function AppContent() {
  const { isComparisonMode, setIsComparisonMode } = useTool();

  return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
              <div className="container mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    AquaFlux
                  </h1>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsComparisonMode(!isComparisonMode)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isComparisonMode
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
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
                  <ExportDialog />
                </div>
              </div>
            </header>

            {/* Main content */}
            <div className="container mx-auto px-6 py-8">
              <div className="flex gap-6">
                {/* Tool panel */}
                <aside className="flex-shrink-0">
                  <ToolPanel />
                </aside>

                {/* Video area */}
                <main className="flex-1">
                  <div className="space-y-5">
                    {/* Video player container */}
                    {isComparisonMode ? (
                      <div className="bg-white rounded-3xl overflow-hidden aspect-video relative flex gap-3 p-3 shadow-xl">
                        {/* Before Video - Left */}
                        <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800 z-10 shadow-lg">
                            Before
                          </div>
                          <VideoPlayer />
                          <VideoCanvas />
                        </div>

                        {/* After Video - Right */}
                        <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800 z-10 shadow-lg">
                            After
                          </div>
                          <VideoPlayer2 />
                          <VideoCanvas2 />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                        <div className="bg-black aspect-video relative">
                          <VideoPlayer />
                          <VideoCanvas />
                        </div>
                      </div>
                    )}

                    {/* Video controls */}
                    <VideoControls />
                  </div>
                </main>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 py-8 text-center">
              <p className="text-gray-600 font-medium">AquaFlux - 수영 영상 분석 도구</p>
              <p className="mt-2 text-gray-400 text-sm">비교 분석 및 실시간 각도 측정</p>
            </footer>

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
          <AppContent />
        </ToolProvider>
      </AnnotationProvider>
    </VideoProvider>
  );
}

export default App;
