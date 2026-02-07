# Browser Testing Checklist

## Open the App
URL: http://localhost:3000

## Visual Check (Before Loading Video)

### ✅ Initial Load
- [ ] Page loads without errors
- [ ] "AquaFlux" title appears in header (emerald green)
- [ ] Three buttons visible: Upload, Camera, Export
- [ ] Tool panel on left with 3 tools
- [ ] Black video area in center (16:9 aspect ratio)
- [ ] Footer text at bottom

### ✅ Console Check
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Check for errors (should be none or only warnings)

Expected: No red errors

## Functional Tests

### Test 1: Reference Lines
1. Click "━ Reference Lines" in tool panel
2. **Expected**: Button turns green/highlighted
3. **Expected**: Settings panel appears below
4. **Expected**: Even without video, you might see line controls
5. Try adjusting the slider
6. **Expected**: Line count number changes (2-10)

### Test 2: Arrow Tool
1. Click "➤ Arrow" in tool panel
2. **Expected**: Button turns green/highlighted
3. **Expected**: Color picker appears below
4. **Expected**: Thickness options appear
5. Click different colors
6. **Expected**: Color selection changes

### Test 3: AI Pose Toggle
1. Click "🤖 AI Pose Detection"
2. **Expected**: Button turns green/highlighted
3. Click again to toggle off
4. **Expected**: Button returns to gray

### Test 4: Video Upload
1. Click "📤 Upload Video" button
2. **Expected**: File picker dialog opens
3. Select any video file (MP4, WebM, MOV recommended)
4. **Expected**: Video loads and appears in player
5. **Expected**: Video controls appear at bottom
6. **Expected**: Time shows "0:00 / [duration]"

### Test 5: Video Playback (After Upload)
1. Click the ⏯ play button
2. **Expected**: Video starts playing
3. **Expected**: Button changes to ⏸ pause
4. Click again to pause
5. **Expected**: Video pauses

### Test 6: Speed Control (After Upload)
1. Click "0.5x" button
2. **Expected**: Video plays in slow motion
3. Try other speeds: 0.25x, 1x, 2x
4. **Expected**: Playback speed changes accordingly

### Test 7: Reference Lines on Video (After Upload)
1. Ensure "━ Reference Lines" is enabled (green)
2. Play the video
3. **Expected**: 6 horizontal dashed lines appear across video
4. Adjust line count slider
5. **Expected**: Number of lines changes in real-time
6. Check "Show Vertical Line" checkbox
7. **Expected**: Vertical line appears at center
8. Click different colors
9. **Expected**: Line colors change

### Test 8: Draw Arrows (After Upload)
1. Click "➤ Arrow" tool
2. Pause video at any point
3. Click and drag on the video
4. **Expected**: Arrow appears as you drag
5. Release mouse
6. **Expected**: Arrow is saved
7. Seek to different time in video
8. **Expected**: Arrow disappears (timestamp-based)
9. Seek back to original time
10. **Expected**: Arrow reappears

### Test 9: AI Pose Detection (After Upload with Person)
⚠️ **Note**: Video must contain a visible person

1. Upload a video with a person
2. Click "🤖 AI Pose Detection"
3. Play the video
4. **Expected**: Green skeleton appears on person
5. **Expected**: Angle measurements show if arms visible
6. **Expected**: Text labels like "Left Arm: 90° (85%)"

### Test 10: Camera (Optional)
1. Click "📹 Start Camera"
2. **Expected**: Browser asks for camera permission
3. Allow camera access
4. **Expected**: Live camera feed appears
5. **Expected**: All tools work with camera
6. Enable AI Pose Detection
7. **Expected**: Skeleton tracks your movements in real-time
8. Click "⏹ Stop Camera"
9. **Expected**: Camera stops

### Test 11: Export (After Upload)
1. Load a video and add some annotations
2. Click "💾 Export Video"
3. **Expected**: Dialog opens
4. Select settings:
   - Format: WebM
   - Quality: Medium
   - Include Annotations: ✓
5. Click "Export"
6. **Expected**: Progress bar appears
7. **Expected**: Progress increases to 100%
8. **Expected**: File downloads automatically
9. Check downloaded file
10. **Expected**: Video plays with all overlays

## Browser Console Errors

### Common Errors to Check

**If you see**: "Failed to load MediaPipe"
- **Cause**: Network issue loading AI models
- **Fix**: Check internet connection

**If you see**: "Canvas getContext failed"
- **Cause**: Browser compatibility
- **Fix**: Use Chrome or Firefox

**If you see**: "getUserMedia not found"
- **Cause**: Browser doesn't support camera
- **Fix**: Use Chrome/Firefox, ensure HTTPS or localhost

**If you see**: "MediaRecorder not supported"
- **Cause**: Export format not supported
- **Fix**: Try different format or browser

## Performance Check

### Smooth Operation
- [ ] UI responds quickly to clicks
- [ ] Video plays smoothly at 1x speed
- [ ] Canvas overlays render without lag
- [ ] No freezing or stuttering

### With AI Enabled
- [ ] Pose detection updates reasonably (10 FPS is normal)
- [ ] Video continues to play smoothly
- [ ] Skeleton tracking is responsive

## Expected Behavior Summary

### ✅ Working Correctly
- UI loads instantly
- Tools activate/deactivate
- Video uploads and plays
- Reference lines draw over video
- Arrows save at timestamps
- Speed control works
- Export creates downloadable file

### ⚠️ Known Limitations
- AI pose detection needs person in frame
- Export may be slow for long videos (normal)
- Safari may have export issues (use Chrome)
- Camera needs permission grant

## If Something Doesn't Work

### Refresh the page
```
Ctrl+F5 (hard refresh)
```

### Check browser console
```
F12 → Console tab
Look for red errors
```

### Restart dev server
```
Stop with Ctrl+C in terminal
Run: npm run dev
```

### Try different browser
```
Chrome (recommended)
Firefox (good support)
Edge (good support)
Safari (limited export support)
```

## Report Results

After testing, note:
- ✅ What works
- ❌ What doesn't work
- ⚠️ Any warnings or issues
- 🐛 Any bugs found

---

**Ready to test!** Open http://localhost:3000 in Chrome and go through this checklist.
