import React, { useCallback, useEffect, useRef } from 'react';
import type { Detection } from './types';

const Camera: React.FC<{ onDetections: (detections: Detection[]) => void }> = ({
  onDetections,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = e => {
      const { type, detections } = e.data;
      if (type === 'ready') {
        console.log('WASM Worker ready');
        detectFrame();
      } else if (type === 'detections') {
        onDetections(detections);
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    };

    workerRef.current.postMessage({ type: 'init', modelPath: '/yolov8n.safetensors' });

    return () => {
      workerRef.current?.terminate();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment',
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();
  }, []);

  const detectFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Draw video to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Send to worker
      // We need to transfer the buffer to avoid copying
      const buffer = imageData.data.buffer;
      workerRef.current.postMessage(
        {
          type: 'detect',
          imageData: new Uint8Array(buffer),
          width: canvas.width,
          height: canvas.height,
        },
        [buffer]
      );
    } else {
      requestRef.current = requestAnimationFrame(detectFrame);
    }
  }, []);

  return (
    <div
      className="camera-container"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0,
        }} // Hide canvas, we just use it for data extraction
      />
    </div>
  );
};

export default Camera;
