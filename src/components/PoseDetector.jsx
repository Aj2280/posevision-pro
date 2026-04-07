import React, { useRef, useEffect, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

const PoseDetector = ({ src, type, onStatusChange, onLoaded, onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const requestRef = useRef();
  const streamRef = useRef(null);

  useEffect(() => {
    let active = true;
    const initPose = async () => {
      try {
        onStatusChange('Initializing Engine...');
        setError(null);
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: 'GPU',
          },
          runningMode: type === 'image' ? 'IMAGE' : 'VIDEO',
          numPoses: 1,
        });
        
        if (active) {
          setPoseLandmarker(landmarker);
          setIsInitializing(false);
          onStatusChange('Engine Ready');
        } else {
          landmarker.close();
        }
      } catch (err) {
        console.error('MediaPipe Init Error:', err);
        setError('Failed to initialize AI engine. Please check your internet connection and browser capabilities.');
        onStatusChange('Engine Error');
      }
    };

    initPose();
    
    return () => {
      active = false;
      if (poseLandmarker) poseLandmarker.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, [type]);

  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Webcam Error:', err);
      setError('Camera access denied. Please allow camera permissions to use Pro Mode.');
    }
  };

  useEffect(() => {
    if (type === 'webcam' && !isInitializing) {
      setupWebcam();
    }
  }, [type, isInitializing]);

  const drawResults = (results, ctx, drawingUtils) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (onResults) onResults(results); // Emit results to parent for biometrics

    if (!results || !results.landmarks || results.landmarks.length === 0) return;
    
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
        color: '#00f2ff',
        lineWidth: 3,
      });
      drawingUtils.drawLandmarks(landmarks, {
        color: '#8b5cf6',
        lineWidth: 1,
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 8, 3),
      });
    }
  };

  const processVideo = () => {
    if (!videoRef.current || !poseLandmarker || !canvasRef.current || error) return;
    const startTimeMs = performance.now();
    
    if (videoRef.current.readyState >= 2) {
      // For webcam, we process every frame. For file video, we check currentTime.
      if (type === 'webcam' || videoRef.current.currentTime !== videoRef.current.lastTime) {
          const results = poseLandmarker.detectForVideo(videoRef.current, startTimeMs);
          const ctx = canvasRef.current.getContext('2d');
          const drawingUtils = new DrawingUtils(ctx);
          
          // Ensure canvas sync if needed (for webcam)
          if (type === 'webcam' && (canvasRef.current.width !== videoRef.current.videoWidth)) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }

          drawResults(results, ctx, drawingUtils);
          videoRef.current.lastTime = videoRef.current.currentTime;
      }
    }
    requestRef.current = requestAnimationFrame(processVideo);
  };

  const processImage = () => {
    if (!imageRef.current || !poseLandmarker || !canvasRef.current || error) return;
    canvasRef.current.width = imageRef.current.naturalWidth;
    canvasRef.current.height = imageRef.current.naturalHeight;
    try {
      const results = poseLandmarker.detect(imageRef.current);
      const ctx = canvasRef.current.getContext('2d');
      const drawingUtils = new DrawingUtils(ctx);
      drawResults(results, ctx, drawingUtils);
      onStatusChange('Analysis Complete');
    } catch (err) {
      onStatusChange('Analysis Failed');
    }
  };

  useEffect(() => {
    if (poseLandmarker && type === 'image' && !isInitializing) {
      onStatusChange('Analyzing Image...');
      if (imageRef.current.complete) processImage();
      else imageRef.current.onload = processImage;
    } else if (poseLandmarker && (type === 'video' || type === 'webcam') && !isInitializing) {
        onStatusChange(type === 'webcam' ? 'Live Mode Active' : 'Processing Video...');
        if (videoRef.current) videoRef.current.lastTime = -1;
        requestRef.current = requestAnimationFrame(processVideo);
    }
  }, [poseLandmarker, src, type]);

  const handleVideoMetadata = () => {
    if (!videoRef.current || !canvasRef.current) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    onLoaded();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', borderRadius: '24px', overflow: 'hidden' }}>
      {isInitializing && !error && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Downloading AI Models...</p>
        </div>
      )}

      {error && (
        <div className="loading-container" style={{ color: '#ff4d4d', textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem', borderColor: '#ff4d4d', color: '#ff4d4d' }} onClick={() => window.location.reload()}>
            Retry Engine
          </button>
        </div>
      )}
      
      {(type === 'video' || type === 'webcam') ? (
        <video
          ref={videoRef}
          src={type === 'video' ? src : undefined}
          autoPlay
          loop={type === 'video'}
          muted
          playsInline
          onLoadedMetadata={handleVideoMetadata}
          style={{ 
            opacity: (isInitializing || error) ? 0 : 1, 
            width: '100%', height: '100%', objectFit: 'contain'
          }}
        />
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt="Pose source"
          onLoad={() => { if (poseLandmarker) processImage(); onLoaded(); }}
          style={{ opacity: (isInitializing || error) ? 0 : 1, width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
      
      <canvas ref={canvasRef} className="visualizer-overlay" style={{ opacity: (isInitializing || error) ? 0 : 1, width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
};

export default PoseDetector;
