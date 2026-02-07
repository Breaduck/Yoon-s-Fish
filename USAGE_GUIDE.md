# AquaFlux Usage Guide

## Getting Started

### Installation and Running

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to: http://localhost:3000

4. Build for production:
```bash
npm run build
```

## Features Overview

### 1. Loading a Video

You have two options:

#### Option A: Upload a Video File
1. Click the "📤 Upload Video" button in the top navigation
2. Select a video file from your computer (MP4, WebM, MOV, etc.)
3. The video will load in the player

#### Option B: Use Live Camera
1. Click the "📹 Start Camera" button
2. Allow camera access when prompted
3. Your camera feed will appear in the player
4. Click "⏹ Stop Camera" when done

### 2. Reference Lines Tool

Reference lines help you analyze swimmer alignment and position.

**How to use:**
1. Click "━ Reference Lines" in the tool panel
2. Adjust settings:
   - **Horizontal Lines**: Use slider to set 2-10 lines (default: 6)
   - **Vertical Line**: Check box to show a center vertical line
   - **Color**: Click a color swatch to change line color

**What you'll see:**
- Evenly spaced horizontal dashed lines across the video
- Optional vertical line at center
- Lines overlay on the video without affecting the source

### 3. Arrow Drawing Tool

Draw arrows to highlight specific movements or positions.

**How to use:**
1. Click "➤ Arrow" in the tool panel
2. Adjust settings:
   - **Color**: Select arrow color (emerald, blue, red, etc.)
   - **Thickness**: Choose from Thin, Medium, Thick, or Extra Thick
3. Draw arrows:
   - Click and drag on the video to create an arrow
   - Release to finish
   - Arrows are saved with timestamps

**Tips:**
- Arrows appear only at the video timestamp when they were drawn
- Multiple arrows can be drawn at different times
- Use different colors for different types of annotations

### 4. AI Pose Detection

Automatically detect swimmer body position and measure angles.

**How to use:**
1. Click "🤖 AI Pose Detection" to enable
2. Play the video or use live camera
3. View the overlay:
   - Green skeleton showing detected body joints
   - Arm angle measurements (shoulder-elbow-wrist)
   - Confidence scores for each measurement

**What's measured:**
- **Left Arm Angle**: Angle at the left elbow
- **Right Arm Angle**: Angle at the right elbow
- **Confidence**: How certain the AI is (0-100%)

**Performance notes:**
- Pose detection runs at ~10 FPS for optimal performance
- Works best with clear view of the swimmer
- Better lighting = better detection

### 5. Video Playback Controls

Located at the bottom of the video player.

**Controls:**
- **⏮ Rewind**: Skip backward 5 seconds
- **⏯ Play/Pause**: Start or pause video playback
- **⏭ Forward**: Skip forward 5 seconds
- **Speed buttons**: Adjust playback speed
  - 0.25x - Ultra slow motion
  - 0.5x - Slow motion
  - 0.75x - Slower
  - 1x - Normal speed
  - 1.5x - Faster
  - 2x - Double speed
- **Progress bar**: Drag to seek to any point in the video
- **Time display**: Current time / Total duration

**Keyboard shortcuts:**
- Space: Play/Pause
- Left arrow: Rewind 5s
- Right arrow: Forward 5s

### 6. Export Video

Save your analyzed video with all annotations and pose detection.

**How to export:**
1. Click "💾 Export Video" button
2. Configure export settings:
   - **Format**: WebM (recommended) or MP4
   - **Quality**:
     - Low (2.5 Mbps) - Smaller file size
     - Medium (5 Mbps) - Balanced
     - High (10 Mbps) - Best quality
   - **Include Annotations**: Keep arrows and reference lines
   - **Include Pose Detection**: Keep skeleton and angles
3. Click "Export"
4. Wait for the export to complete (progress shown)
5. Video will download automatically

**Export notes:**
- Export time depends on video length
- Longer videos may take several minutes
- All overlays are permanently rendered into the exported video
- Exported file includes timestamp in filename

## Workflow Examples

### Analyzing Swimming Stroke

1. Upload a swimming video
2. Enable reference lines (6 horizontal lines)
3. Set playback speed to 0.5x
4. Enable AI pose detection
5. Play video and observe arm angles
6. Pause at key moments
7. Draw arrows to highlight issues
8. Export the annotated video

### Real-time Stroke Analysis

1. Start camera
2. Position camera to capture swimmer
3. Enable AI pose detection
4. Enable reference lines for alignment
5. Observe real-time angle measurements
6. Make adjustments based on feedback

### Comparison of Strokes

1. Upload first stroke video
2. Annotate with arrows and lines
3. Export the video
4. Upload second stroke video
5. Use same annotation style
6. Export and compare side-by-side externally

## Tips and Best Practices

### For Best Pose Detection:
- Ensure good lighting
- Position camera perpendicular to swimmer
- Keep swimmer centered in frame
- Avoid extreme camera angles
- Higher resolution videos work better

### For Reference Lines:
- Use 6 lines for general analysis
- Add vertical line for body rotation analysis
- Match line color to video background for clarity
- Emerald works well on dark pool backgrounds

### For Arrow Annotations:
- Use consistent colors for similar annotations
- Draw arrows at slow playback speed for precision
- Thicker arrows are easier to see in exported video
- Add arrows at key moments (entry, pull, recovery)

### For Exports:
- Use High quality for final analysis videos
- Medium quality is fine for quick reviews
- WebM format has better quality/size ratio
- Disable pose detection if not needed to reduce file size

## Troubleshooting

### Camera Not Working
- Check browser permissions (allow camera access)
- Try a different browser (Chrome recommended)
- Ensure no other app is using the camera

### Pose Detection Not Showing
- Verify the tool is enabled (green highlight)
- Check that video is playing
- Ensure swimmer is visible in frame
- Try better lighting conditions

### Export Failed
- Check browser console for errors
- Try shorter video duration
- Reduce quality setting
- Use WebM format instead of MP4
- Ensure sufficient disk space

### Video Not Loading
- Check file format is supported
- Try converting to MP4 or WebM
- Ensure file size is reasonable (<500MB recommended)

### Slow Performance
- Disable pose detection when not needed
- Reduce video resolution
- Close other browser tabs
- Use Chrome for best performance

## Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Edge 90+
- Firefox 88+

**Limited Support:**
- Safari 14+ (MediaRecorder may have issues)

**Not Supported:**
- Internet Explorer (discontinued)

## System Requirements

**Minimum:**
- 4GB RAM
- Dual-core processor
- WebGL-capable GPU
- 100MB free disk space

**Recommended:**
- 8GB+ RAM
- Quad-core processor
- Dedicated GPU
- 1GB+ free disk space

## Privacy and Data

- All processing happens locally in your browser
- No videos are uploaded to servers
- No data is stored or transmitted
- Camera feed is not recorded unless you export
- Exported videos are saved only to your computer

## Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| Left Arrow | Rewind 5 seconds |
| Right Arrow | Forward 5 seconds |
| 1-6 | Set playback speed (1=0.25x, 6=2x) |
| Esc | Close dialogs |

## Getting Help

If you encounter issues:

1. Check this usage guide
2. Review browser console for errors (F12)
3. Try a different browser
4. Restart the application
5. Check the GitHub repository for updates

## Advanced Usage

### Custom Analysis Workflows

You can create custom workflows by combining tools:

1. **Stroke Timing Analysis**:
   - Use reference lines + slow motion
   - Mark stroke phases with different color arrows
   - Export for frame-by-frame review

2. **Body Position Analysis**:
   - Enable pose detection + vertical line
   - Observe shoulder rotation angles
   - Use arrows to show ideal position

3. **Progressive Training**:
   - Record swimmer with camera
   - Enable all tools
   - Provide immediate visual feedback
   - Compare with reference videos

### Batch Processing Tips

For analyzing multiple videos:

1. Use consistent tool settings
2. Create a checklist of what to annotate
3. Export all videos with same quality
4. Use consistent naming convention
5. Store in organized folders

## Updates and Maintenance

Check for updates regularly:
- Pull latest code from repository
- Run `npm install` for new dependencies
- Rebuild with `npm run build`
- Clear browser cache if issues occur

---

**AquaFlux** - Premium Swimming Video Analysis Tool
Version 0.1.0 | © 2026 AquaFlux
