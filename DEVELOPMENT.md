# AquaFlux Development Guide

## Project Status

All 6 phases of the implementation plan are complete:

- ✅ Phase 1: Project setup and basic video player
- ✅ Phase 2: Drawing tools (arrows with timestamps)
- ✅ Phase 3: AI pose detection and angle measurement
- ✅ Phase 4: Real-time camera support
- ✅ Phase 5: Video export functionality
- ✅ Phase 6: Polish and optimization

## Project Structure

```
aquaflux/
├── src/
│   ├── components/
│   │   ├── video/
│   │   │   ├── VideoPlayer.tsx       ✅ Video element with source handling
│   │   │   ├── VideoCanvas.tsx       ✅ Overlay canvas with all drawings
│   │   │   └── VideoControls.tsx     ✅ Playback controls and speed
│   │   ├── tools/
│   │   │   ├── ToolPanel.tsx         ✅ Tool selection sidebar
│   │   │   └── ReferenceLines.tsx    ✅ Reference line settings
│   │   ├── export/
│   │   │   ├── ExportDialog.tsx      ✅ Export configuration
│   │   │   └── ExportProgress.tsx    ✅ Progress indicator
│   │   └── input/
│   │       ├── VideoUpload.tsx       ✅ File upload
│   │       └── CameraCapture.tsx     ✅ Webcam access
│   ├── services/
│   │   ├── drawingEngine.ts          ✅ Canvas rendering engine
│   │   ├── poseDetection.ts          ✅ MediaPipe wrapper
│   │   ├── cameraService.ts          ✅ Camera stream management
│   │   └── exportService.ts          ✅ Video recording/export
│   ├── hooks/
│   │   ├── useVideoPlayer.ts         ✅ Video state management
│   │   ├── useDrawing.ts             ✅ Arrow drawing interaction
│   │   ├── usePoseDetection.ts       ✅ Pose detection lifecycle
│   │   └── useExport.ts              ✅ Export workflow
│   ├── context/
│   │   ├── VideoContext.tsx          ✅ Video global state
│   │   ├── AnnotationContext.tsx     ✅ Annotations storage
│   │   └── ToolContext.tsx           ✅ Tool settings
│   ├── types/
│   │   ├── video.ts                  ✅ Video-related types
│   │   ├── drawing.ts                ✅ Drawing types
│   │   ├── pose.ts                   ✅ Pose detection types
│   │   └── export.ts                 ✅ Export types
│   └── utils/
│       ├── geometry.ts               ✅ Angle calculations
│       ├── canvas.ts                 ✅ Canvas drawing helpers
│       └── colors.ts                 ✅ Color definitions
└── public/
    └── models/                       📁 MediaPipe models (CDN loaded)
```

## Technology Stack

### Core
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.2** - Build tool and dev server

### Styling
- **TailwindCSS 3.4.1** - Utility-first CSS
- **PostCSS 8.4.38** - CSS processing

### AI/Video
- **@mediapipe/pose 0.5.x** - Pose estimation
- **@mediapipe/camera_utils 0.3.x** - Camera utilities
- **@mediapipe/drawing_utils 0.3.x** - Skeleton rendering utilities

### APIs Used
- Canvas API - Overlay rendering
- Video API - Playback control
- MediaRecorder API - Video export
- MediaDevices API - Camera access
- RequestAnimationFrame - Smooth rendering

## Architecture Decisions

### Context API over Redux
- Simpler setup for this project size
- No external dependencies needed
- Built-in React feature
- Sufficient for our state management needs

### Canvas Overlay Pattern
- Separate video and canvas elements
- Canvas positioned absolutely over video
- Enables non-destructive annotations
- Better performance than video manipulation

### Service Classes
- Encapsulate complex logic
- Easier to test and maintain
- Clean separation of concerns
- Reusable across components

### Custom Hooks
- Encapsulate stateful logic
- Promote code reuse
- Cleaner component code
- Standard React pattern

## Key Implementation Details

### Video-Canvas Synchronization

The app uses `requestAnimationFrame` to keep canvas overlays in sync with video:

```typescript
useEffect(() => {
  let animationFrameId: number;

  const render = () => {
    // Clear canvas
    // Draw reference lines
    // Draw arrows for current timestamp
    // Draw pose skeleton if enabled
    animationFrameId = requestAnimationFrame(render);
  };

  render();
  return () => cancelAnimationFrame(animationFrameId);
}, [dependencies]);
```

### Timestamp-Based Annotations

Arrows are stored with millisecond timestamps:

```typescript
const arrow: Arrow = {
  id: `arrow-${Date.now()}-${Math.random()}`,
  start: startPoint,
  end: endPoint,
  color: toolSettings.color,
  thickness: toolSettings.thickness,
  timestamp: Math.floor(videoState.currentTime * 1000),
};
```

Arrows are shown when video time is within 100ms:

```typescript
const getAnnotationsForTime = (timestamp: number) => {
  const tolerance = 100; // ms
  return annotations.arrows.filter(
    arrow => Math.abs(arrow.timestamp - timestamp) < tolerance
  );
};
```

### Pose Detection Throttling

To maintain performance, pose detection runs at ~10 FPS:

```typescript
const detectPose = async () => {
  const now = Date.now();
  if (now - lastDetectionTime.current < 100) {
    animationFrameId = requestAnimationFrame(detectPose);
    return;
  }
  lastDetectionTime.current = now;
  // Run detection...
};
```

### Angle Calculation

Uses vector math to calculate joint angles:

```typescript
const calculateAngle = (p1, p2, p3) => {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
  const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
  return Math.round(angle);
};
```

### Video Export

Captures canvas stream and records:

```typescript
const stream = canvas.captureStream(30); // 30 FPS
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 10000000, // 10 Mbps for high quality
});
```

## Performance Optimizations

1. **Throttled Pose Detection**: 100ms intervals instead of every frame
2. **Canvas Clearing**: Only clear and redraw what's needed
3. **RequestAnimationFrame**: Synced with browser refresh rate
4. **Model Complexity**: MediaPipe set to complexity 1 (balanced)
5. **Code Splitting**: Vite automatically splits MediaPipe into separate chunk
6. **Lazy Loading**: Components loaded as needed

## Browser Compatibility

### Supported Features by Browser

| Feature | Chrome | Firefox | Edge | Safari |
|---------|--------|---------|------|--------|
| Video Playback | ✅ | ✅ | ✅ | ✅ |
| Canvas Overlay | ✅ | ✅ | ✅ | ✅ |
| MediaPipe Pose | ✅ | ✅ | ✅ | ⚠️ |
| Camera Access | ✅ | ✅ | ✅ | ✅ |
| MediaRecorder WebM | ✅ | ✅ | ✅ | ❌ |
| MediaRecorder MP4 | ❌ | ❌ | ❌ | ✅ |

### Fallback Strategy

```typescript
const getSupportedMimeType = (format) => {
  const types = format === 'webm'
    ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    : ['video/mp4;codecs=h264', 'video/mp4'];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
};
```

## Testing Recommendations

### Manual Testing Checklist

**Video Upload:**
- [ ] MP4 files load correctly
- [ ] WebM files load correctly
- [ ] MOV files load correctly
- [ ] Large files (>100MB) work
- [ ] Video controls respond

**Camera:**
- [ ] Camera access permission requested
- [ ] Camera feed displays
- [ ] Can switch between camera/file
- [ ] Camera stops properly

**Reference Lines:**
- [ ] 6 default horizontal lines appear
- [ ] Can adjust line count (2-10)
- [ ] Vertical line toggles on/off
- [ ] Color changes apply
- [ ] Lines sync with video resize

**Arrow Tool:**
- [ ] Can draw arrows
- [ ] Color/thickness changes work
- [ ] Arrows save with timestamp
- [ ] Arrows appear at correct time
- [ ] Multiple arrows work

**Pose Detection:**
- [ ] Skeleton appears on swimmer
- [ ] Angles calculate correctly
- [ ] Confidence scores shown
- [ ] Performance acceptable
- [ ] Toggle on/off works

**Playback:**
- [ ] Play/pause works
- [ ] Speed controls work (0.25x - 2x)
- [ ] Seek bar works
- [ ] Skip forward/back works
- [ ] Time display updates

**Export:**
- [ ] Dialog opens
- [ ] Settings apply
- [ ] Progress shows
- [ ] File downloads
- [ ] Exported video includes overlays

### Performance Benchmarks

Target metrics:
- Initial load: < 2 seconds
- Pose detection: ~10 FPS
- Canvas rendering: 30-60 FPS
- Export 1 min video: < 2 minutes
- Memory usage: < 500MB

## Known Issues and Limitations

1. **Safari MediaRecorder**: Limited codec support, export may fail
2. **Long Videos**: Export of 10+ minute videos may be slow
3. **Low-end Hardware**: Pose detection may lag on older devices
4. **Mobile**: Touch events not optimized (desktop-first design)
5. **Multiple Swimmers**: Currently only tracks one person

## Future Enhancements

### High Priority
- [ ] Mobile/touch support
- [ ] Multiple swimmer tracking
- [ ] Annotation editing/deletion
- [ ] Undo/redo functionality
- [ ] Save/load annotation files

### Medium Priority
- [ ] More pose metrics (hip angle, knee angle)
- [ ] Stroke type detection (freestyle, butterfly, etc.)
- [ ] Side-by-side video comparison
- [ ] Timeline view of annotations
- [ ] Keyboard shortcuts

### Low Priority
- [ ] Cloud storage integration
- [ ] User accounts
- [ ] Sharing annotated videos
- [ ] Mobile app (React Native)
- [ ] Collaborative annotations

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# In another terminal, run type checking
npm run build -- --watch
```

### Making Changes

1. Edit source files in `src/`
2. Changes hot-reload automatically
3. Check browser console for errors
4. Test in multiple browsers

### Building for Production

```bash
# Type check + build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- Use TypeScript strict mode
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Keep components under 200 lines
- Extract complex logic to services
- Use meaningful variable names
- Comment complex algorithms

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add: description"

# Push and create PR
git push origin feature/your-feature
```

## Debugging Tips

### Video Not Playing
- Check browser console for errors
- Verify video source URL is valid
- Check video codec compatibility
- Test with different video file

### Canvas Not Showing
- Verify canvas is positioned over video
- Check z-index stacking
- Inspect canvas dimensions
- Check for JavaScript errors

### Pose Detection Issues
- Open browser DevTools Network tab
- Check MediaPipe models loading from CDN
- Verify WebGL is enabled
- Test with well-lit video

### Export Failing
- Check MediaRecorder support: `MediaRecorder.isTypeSupported('video/webm')`
- Monitor browser console
- Try different quality settings
- Check available disk space

### Performance Issues
- Disable pose detection temporarily
- Reduce video resolution
- Close other applications
- Check CPU/GPU usage
- Try different browser

## Environment Variables

Create `.env` file for custom configuration:

```bash
# Dev server port
VITE_PORT=3000

# API URL (if needed in future)
# VITE_API_URL=http://localhost:8000
```

## Build Output

Production build creates:

```
dist/
├── index.html                 # Entry HTML
├── assets/
│   ├── index-[hash].js       # Main app bundle
│   ├── pose-[hash].js        # MediaPipe chunk
│   └── index-[hash].css      # Compiled CSS
```

Optimizations:
- Code splitting (MediaPipe separate chunk)
- Tree shaking (unused code removed)
- Minification
- CSS purging (unused Tailwind classes removed)
- Source maps for debugging

## Deployment

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

### Vercel

```bash
# Framework: Vite
# Build command: npm run build
# Output directory: dist
```

### GitHub Pages

```bash
# Update vite.config.ts base path
base: '/aquaflux/'

# Build and deploy
npm run build
# Copy dist/ to gh-pages branch
```

## License

Copyright © 2026 AquaFlux. All rights reserved.

---

For questions or contributions, please open an issue on GitHub.
