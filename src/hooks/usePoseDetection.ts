import { useEffect, useRef, useState } from 'react';
import { PoseDetectionService } from '../services/poseDetection';
import { PoseResults, AngleData } from '../types/pose';
import { useVideo } from '../context/VideoContext';
import { useTool } from '../context/ToolContext';

export const usePoseDetection = () => {
  const { videoRef, videoState } = useVideo();
  const { toolSettings } = useTool();
  const poseServiceRef = useRef<PoseDetectionService | null>(null);
  const [poseResults, setPoseResults] = useState<PoseResults | null>(null);
  const [angles, setAngles] = useState<AngleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastDetectionTime = useRef(0);

  useEffect(() => {
    if (!toolSettings._poseEnabled) return;

    const initializePose = async () => {
      if (poseServiceRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        poseServiceRef.current = new PoseDetectionService();
        await poseServiceRef.current.initialize();
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize pose detection');
        setIsLoading(false);
        console.error(err);
      }
    };

    initializePose();

    return () => {
      if (poseServiceRef.current) {
        poseServiceRef.current.destroy();
        poseServiceRef.current = null;
      }
    };
  }, [toolSettings._poseEnabled]);

  useEffect(() => {
    if (!toolSettings._poseEnabled || !poseServiceRef.current || !videoRef.current) return;
    if (!videoState.isPlaying) return;

    let animationFrameId: number;

    const detectPose = async () => {
      const video = videoRef.current;
      const poseService = poseServiceRef.current;

      if (!video || !poseService) return;

      // Throttle detection to every 200ms to reduce CPU usage
      const now = Date.now();
      if (now - lastDetectionTime.current < 200) {
        animationFrameId = requestAnimationFrame(detectPose);
        return;
      }
      lastDetectionTime.current = now;

      try {
        await poseService.detect(video, (results: PoseResults) => {
          setPoseResults(results);
          const calculatedAngles = poseService.calculateArmAngles(results);
          setAngles(calculatedAngles);
        });
      } catch (err) {
        console.error('Pose detection error:', err);
      }

      animationFrameId = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [toolSettings._poseEnabled, videoState.isPlaying, videoRef]);

  return {
    poseResults,
    angles,
    isLoading,
    error,
  };
};
