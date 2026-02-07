import { Pose, Results } from '@mediapipe/pose';
import { PoseResults, AngleData, PoseLandmarkIndex } from '../types/pose';
import { calculateAngle } from '../utils/geometry';

export class PoseDetectionService {
  private pose: Pose | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const { Pose } = await import('@mediapipe/pose');

      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
      throw error;
    }
  }

  async detect(
    imageElement: HTMLVideoElement | HTMLImageElement,
    callback: (results: PoseResults) => void
  ) {
    if (!this.pose) {
      throw new Error('Pose detection not initialized');
    }

    this.pose.onResults((results: Results) => {
      if (results.poseLandmarks) {
        callback({ poseLandmarks: results.poseLandmarks });
      }
    });

    await this.pose.send({ image: imageElement });
  }

  calculateArmAngles(results: PoseResults): AngleData[] {
    if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
      return [];
    }

    const landmarks = results.poseLandmarks;
    const angles: AngleData[] = [];

    // Left arm angle (shoulder-elbow-wrist)
    const leftShoulder = landmarks[PoseLandmarkIndex.LEFT_SHOULDER];
    const leftElbow = landmarks[PoseLandmarkIndex.LEFT_ELBOW];
    const leftWrist = landmarks[PoseLandmarkIndex.LEFT_WRIST];

    if (leftShoulder && leftElbow && leftWrist) {
      const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const leftConfidence = Math.min(
        leftShoulder.visibility || 0,
        leftElbow.visibility || 0,
        leftWrist.visibility || 0
      );

      angles.push({
        angle: leftAngle,
        confidence: leftConfidence,
        label: 'Left Arm',
        points: [leftShoulder, leftElbow, leftWrist],
      });
    }

    // Right arm angle (shoulder-elbow-wrist)
    const rightShoulder = landmarks[PoseLandmarkIndex.RIGHT_SHOULDER];
    const rightElbow = landmarks[PoseLandmarkIndex.RIGHT_ELBOW];
    const rightWrist = landmarks[PoseLandmarkIndex.RIGHT_WRIST];

    if (rightShoulder && rightElbow && rightWrist) {
      const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      const rightConfidence = Math.min(
        rightShoulder.visibility || 0,
        rightElbow.visibility || 0,
        rightWrist.visibility || 0
      );

      angles.push({
        angle: rightAngle,
        confidence: rightConfidence,
        label: 'Right Arm',
        points: [rightShoulder, rightElbow, rightWrist],
      });
    }

    return angles;
  }

  destroy() {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
      this.isInitialized = false;
    }
  }
}
