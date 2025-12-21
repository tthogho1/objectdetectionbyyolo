import initWasm, { init as initYolo, detect } from '../pkg/yolo_wasm';

let wasmReady = false;

self.onmessage = async e => {
  const { type, modelPath, imageData, width, height } = e.data;

  if (type === 'init') {
    try {
      await initWasm();
      await initYolo(modelPath);
      wasmReady = true;
      self.postMessage({ type: 'ready' });
    } catch (error) {
      console.error('WASM init failed:', error);
    }
  }

  if (type === 'detect' && wasmReady) {
    try {
      const detections = detect(imageData, width, height);
      self.postMessage({ type: 'detections', detections });
    } catch (error) {
      console.error('Detection failed:', error);
    }
  }
};
