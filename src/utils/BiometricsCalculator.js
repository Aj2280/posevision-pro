/**
 * Biometrics Calculator for Pose Analysis
 * Handles angle calculations and repetition counting logic.
 */

export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
};

export const EXERCISES = {
  SQUAT: {
    name: 'Squat',
    joints: { a: 24, b: 26, c: 28 }, // Hip, Knee, Ankle (Right side)
    thresholds: { down: 100, up: 160 },
    feedback: { down: 'Go Deeper', up: 'Full Extension' }
  },
  CURL: {
    name: 'Bicep Curl',
    joints: { a: 12, b: 14, c: 16 }, // Shoulder, Elbow, Wrist (Right side)
    thresholds: { down: 40, up: 160 },
    feedback: { down: 'Squeeze', up: 'Full Extension' }
  }
};

export class RepCounter {
  constructor(exercise) {
    this.exercise = exercise;
    this.count = 0;
    this.stage = 'up'; // 'up' or 'down'
    this.feedback = '';
  }

  update(angle) {
    const { thresholds } = this.exercise;
    let incremented = false;

    if (this.exercise.name === 'Squat') {
      if (angle < thresholds.down) {
        this.stage = 'down';
        this.feedback = 'Good Depth!';
      }
      if (angle > thresholds.up && this.stage === 'down') {
        this.stage = 'up';
        this.count++;
        this.feedback = 'Perfect Rep!';
        incremented = true;
      }
    } else if (this.exercise.name === 'Bicep Curl') {
      if (angle < thresholds.down) {
        this.stage = 'down';
        this.feedback = 'Full Contraction!';
      }
      if (angle > thresholds.up && this.stage === 'down') {
        this.stage = 'up';
        this.count++;
        this.feedback = 'Excellent Form!';
        incremented = true;
      }
    }

    return { count: this.count, stage: this.stage, feedback: this.feedback, incremented };
  }
}
