# AquaFlux - Swimming Video Analysis Tool

A web-based swimming video analysis tool with AI-powered pose detection and real-time angle measurement. Built for the premium swimming brand AquaFlux.

## Features

### 1. Reference Lines
- 6 horizontal lines at even intervals (customizable 2-10)
- Optional vertical line
- Dashed style display
- Customizable colors (Emerald default)

### 2. AI Auto Angle Measurement
- MediaPipe Pose for automatic skeleton detection
- Automatic arm angle calculation (shoulder-elbow-wrist)
- Angle display relative to reference lines
- Confidence score display

### 3. Arrow Drawing
- Drag to draw arrows
- Adjustable color and thickness
- Saved with timestamps
- Synced with video playback

### 4. Slow Motion
- Playback speed control: 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x
- Frame-by-frame navigation (5s skip forward/backward)

### 5. Video Export
- Export analyzed video with all overlays
- WebM format (with MP4 fallback)
- Progress indicator
- Includes all annotations and pose detection

### 6. Camera Support
- Real-time camera feed analysis
- Live pose detection
- Recording capability

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (fast development)
- TailwindCSS (rapid UI development)

### AI/Video Processing
- MediaPipe Pose (real-time skeleton detection)
- Canvas API (overlay drawing)
- Video API (playback/control)
- MediaRecorder API (video export)

### State Management
- Context API + Custom Hooks

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### 1. Upload or Start Camera
- Click "📤 Upload Video" to select a video file
- Click "📹 Start Camera" to use your webcam

### 2. Use Tools
- **Reference Lines**: Adjust count and show/hide vertical lines
- **Arrow**: Draw arrows on the video by clicking and dragging
- **AI Pose Detection**: Enable to see skeleton and angle measurements

### 3. Control Playback
- Play/Pause with the center button
- Skip 5s forward/backward with ⏮/⏭ buttons
- Adjust speed with 0.25x - 2x buttons
- Seek using the progress bar

### 4. Export
- Click "💾 Export Video" when done
- Choose format (WebM/MP4) and quality
- Select what to include (annotations, pose detection)
- Download the exported video

## Project Structure

```
aquaflux/
├── src/
│   ├── components/
│   │   ├── video/           # Video player, canvas, controls
│   │   ├── tools/           # Tool panel, reference lines
│   │   ├── export/          # Export dialog and progress
│   │   └── input/           # Video upload, camera capture
│   ├── services/            # MediaPipe, drawing, camera, export
│   ├── hooks/               # Custom React hooks
│   ├── context/             # Global state management
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── public/
│   └── models/              # MediaPipe model files
└── package.json
```

## Browser Compatibility

Tested on:
- Chrome (recommended)
- Firefox
- Edge
- Safari (limited MediaRecorder support)

## Performance Notes

- Pose detection runs at ~10 FPS (100ms intervals) for optimal performance
- Camera mode uses lower complexity model for real-time processing
- Export may take time for longer videos (progress shown)

## Future Enhancements

- Multiple swimmer tracking
- Stroke analysis (butterfly, freestyle, etc.)
- Comparison mode (side-by-side videos)
- Advanced metrics (stroke rate, distance per stroke)
- Cloud storage integration
- Mobile app version

## License

Copyright © 2026 AquaFlux. All rights reserved.
