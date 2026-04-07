# 🕺 PoseVision Pro - Biometric AI Analysis Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dynamic movement analysis](https://img.shields.io/badge/AI-MediaPipe-blue)](https://developers.google.com/mediapipe)
[![Framework: React](https://img.shields.io/badge/Framework-React-61DAFB)](https://reactjs.org/)

**PoseVision Pro** is a world-class, professional-grade movement analysis engine. It transforms standard webcam and video feeds into a sophisticated biometric dashboard, capable of real-time joint tracking, angle calculation, and intelligent repetition counting.

---

## 🚀 Key Features

- **PRO Biometric Engine**: High-fidelity human pose detection for images, videos, and live webcam streams.
- **Biomechanical Angle Gauges**: Real-time trigonometric calculation for joints (elbows, knees, hips).
- **Intelligent Rep Counter**: Automated Finite State Machine (FSM) that accurately counts Squats and Bicep Curls with form validation.
- **Coaching Dashboard**: Dynamic overlay providing real-time movement feedback (e.g., "Full Extension", "Go Deeper").
- **Ghost Frame Prevention**: Automated canvas synchronization to ensure clean visual data across frames.
- **GPU Optimized**: Leveraging WebGL and Google's MediaPipe WASM runtime for high-performance inference.

## 🛠 Tech Stack

- **Core**: React 19 + Vite
- **AI Engine**: [MediaPipe Tasks Vision v0.10.34](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- **Styling**: Premium Glassmorphism (Vanilla CSS)
- **Icons**: Lucide React

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/human-pose.git
   cd human-pose
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎯 Supported Exercises

Currently, PoseVision Pro features specialized state-tracking for:
- **Squats**: Detects hip-knee-ankle angles and validates squat depth.
- **Bicep Curls**: Monitors elbow flexion-extension for rep counting.
- *More exercises coming soon...*

## 🧑‍💻 Technical Details

The engine utilizes the **Pose Landmarker Lite** model with `float16` quantization, ensuring it runs efficiently on most modern laptops and mobile browsers. Key landmarks (33 in total) are processed at 30-60 FPS, with custom drawing logic implemented on an absolute-positioned HTML5 Canvas.

---

## 📜 License
Distribute under the MIT License. See `LICENSE` for more information.

---
*Built with passion by Antigravity AI Engine.*
