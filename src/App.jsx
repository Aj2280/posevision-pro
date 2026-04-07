import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Camera, Activity, FileVideo, FileImage, Trash2, Cpu, Zap, Target, BarChart, Settings, Play } from 'lucide-react';
import PoseDetector from './components/PoseDetector';
import ProStats from './components/ProStats';
import { calculateAngle, EXERCISES, RepCounter } from './utils/BiometricsCalculator';

function App() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image', 'video', 'webcam'
  const [status, setStatus] = useState('Idle');
  const [isLoaded, setIsLoaded] = useState(false);
  const [exerciseKey, setExerciseKey] = useState('SQUAT');
  const [isProMode, setIsProMode] = useState(true);
  
  // Biometrics State
  const [metrics, setMetrics] = useState({ angle: 0, count: 0, stage: 'up', feedback: '' });
  const repCounterRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize rep counter when exercise changes
  useEffect(() => {
    repCounterRef.current = new RepCounter(EXERCISES[exerciseKey]);
    setMetrics(prev => ({ ...prev, count: 0, feedback: 'Ready' }));
  }, [exerciseKey]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    const type = selectedFile.type.startsWith('video/') ? 'video' : 'image';
    setFile(URL.createObjectURL(selectedFile));
    setFileType(type);
    setStatus('Ready');
  };

  const startWebcam = () => {
    setFile('WEBCAM_STREAM'); // Dummy string
    setFileType('webcam');
    setStatus('Webcam Ready');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const clearFile = () => {
    setFile(null);
    setFileType(null);
    setStatus('Idle');
    setMetrics({ angle: 0, count: 0, stage: 'up', feedback: '' });
  };

  const handlePoseResults = (results) => {
    if (!results || !results.landmarks || results.landmarks.length === 0) {
      setMetrics(prev => ({ ...prev, feedback: 'No person detected' }));
      return;
    }

    const landmarks = results.landmarks[0];
    const exercise = EXERCISES[exerciseKey];
    const { a, b, c } = exercise.joints;

    // Calculate Angle (e.g. Right knee for squat)
    const angle = calculateAngle(landmarks[a], landmarks[b], landmarks[c]);
    
    // Update Rep Counter
    if (repCounterRef.current) {
      const result = repCounterRef.current.update(angle);
      setMetrics({
        angle,
        count: result.count,
        stage: result.stage,
        feedback: result.feedback
      });
    }
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
           <h1>PoseVision AI</h1>
           {isProMode && <span className="pro-badge">PRO</span>}
        </div>
        <p>Dynamic Movement Analysis & Biometric Intelligence</p>
      </header>

      <main className="main-layout">
        <section className="display-panel pro-theme">
          {!file && (
            <div className="loading-container">
              <div className="pulse-circle">
                <Play size={32} />
              </div>
              <div className="placeholder-text">
                Start Pro Analysis by uploading media or using your camera.
              </div>
            </div>
          )}
          
          {file && (
             <PoseDetector 
               src={file !== 'WEBCAM_STREAM' ? file : null} 
               type={fileType} 
               onStatusChange={setStatus}
               onLoaded={() => setIsLoaded(true)}
               onResults={handlePoseResults}
             />
          )}

          {file && isProMode && (
            <ProStats 
              angle={metrics.angle}
              count={metrics.count}
              stage={metrics.stage}
              feedback={metrics.feedback}
              exerciseName={EXERCISES[exerciseKey].name}
            />
          )}
        </section>

        <aside className="control-panel">
          <div className="card">
            <h3>Engine Selection</h3>
            <div className="btn-group">
               <button 
                 className={`btn ${fileType === 'webcam' ? 'active' : 'btn-outline'}`}
                 onClick={startWebcam}
               >
                 <Camera size={18} /> Live Camera
               </button>
               <button 
                 className={`btn ${file && fileType !== 'webcam' ? 'active' : 'btn-outline'}`}
                 onClick={() => fileInputRef.current.click()}
               >
                 <Upload size={18} /> Media File
               </button>
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileChange} />
          </div>

          <div className="card">
            <h3>Analysis Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div className="input-field">
                  <label>Selected Movement</label>
                  <select value={exerciseKey} onChange={(e) => setExerciseKey(e.target.value)}>
                     {Object.keys(EXERCISES).map(key => (
                        <option key={key} value={key}>{EXERCISES[key].name}</option>
                     ))}
                  </select>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Pro Visualization</span>
                  <label className="switch">
                    <input type="checkbox" checked={isProMode} onChange={() => setIsProMode(!isProMode)} />
                    <span className="slider round"></span>
                  </label>
               </div>
            </div>
          </div>

          {metrics.count > 0 && (
            <div className="card session-summary animate-in">
              <h3>Live Session Data</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{metrics.count}</span>
                  <span className="stat-label">Reps</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{metrics.angle}°</span>
                  <span className="stat-label">Last Angle</span>
                </div>
              </div>
              <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={clearFile}>
                 Reset Session
              </button>
            </div>
          )}

          <div className="card">
            <h3>Technical Diagnostics</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Engine Status</span>
                <span style={{color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.85rem'}}>{status}</span>
              </div>
              <div className="progress-bar">
                 <div className="progress-fill" style={{ width: status === 'Idle' ? '0%' : '100%' }} />
              </div>
            </div>
          </div>
        </aside>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .pro-badge {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          color: #000;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 1px;
        }

        .btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .input-field label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        select {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.6rem;
          border-radius: 8px;
          outline: none;
        }

        .progress-bar {
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-cyan);
          box-shadow: 0 0 10px var(--accent-cyan);
          transition: width 0.4s ease;
        }

        .pulse-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(0, 242, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--accent-cyan);
          margin-bottom: 1.5rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(0, 242, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0); }
        }

        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--accent-cyan); }
        input:checked + .slider:before { transform: translateX(20px); }

        .animate-in { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

export default App;
