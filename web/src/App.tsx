import { useState } from 'react';
import Camera from './Camera';
import './App.css';
import { Detection } from './types';

function App() {
  const [detections, setDetections] = useState<Detection[]>([]);

  return (
    <div className="App">
      <h1>YOLOv8 WASM Object Detection</h1>
      <div className="content">
        <div className="camera-wrapper">
          <Camera onDetections={setDetections} />
          {/* Overlay bounding boxes */}
          <div
            className="overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {detections.map((d, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${d.bbox[0] * 100}%`,
                  top: `${d.bbox[1] * 100}%`,
                  width: `${(d.bbox[2] - d.bbox[0]) * 100}%`,
                  height: `${(d.bbox[3] - d.bbox[1]) * 100}%`,
                  border: '2px solid #00ff00',
                  backgroundColor: 'rgba(0, 255, 0, 0.1)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: 0,
                    backgroundColor: '#00ff00',
                    color: 'black',
                    padding: '2px 4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {d.label} {Math.round(d.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="results">
          <h3>Detections:</h3>
          <ul>
            {detections.map((d, i) => (
              <li key={i}>
                {d.label}: {Math.round(d.confidence * 100)}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
