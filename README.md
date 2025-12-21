---
title: Yolo Wasm App
emoji: 🦀
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
---

# YOLOv8 WASM Object Detection

This project demonstrates real-time object detection using YOLOv8n running in the browser via WebAssembly (Rust + Candle).

## Prerequisites

- Rust (latest stable)
- Node.js (v18+)
- `wasm-pack` (`cargo install wasm-pack`)

## Setup

1.  **Download the Model**
    Download `yolov8n.safetensors` from Hugging Face and place it in `web/public/`.

    You can download it from: https://huggingface.co/lmz/candle-yolo-v8/resolve/main/yolov8n.safetensors

    ```bash
    # Example using curl
    curl -L -o web/public/yolov8n.safetensors https://huggingface.co/lmz/candle-yolo-v8/resolve/main/yolov8n.safetensors
    ```

2.  **Build Rust WASM**

    ```bash
    cd rust
    wasm-pack build --target web --out-dir ../web/pkg
    ```

3.  **Install Web Dependencies**

    ```bash
    cd web
    npm install
    ```

4.  **Run Development Server**

    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Open `http://localhost:5173` (or the URL shown in the terminal).

## Project Structure

- `rust/`: Rust source code for WASM module (YOLOv8 inference using Candle)
- `web/`: React application (Vite) for UI and camera handling

## Notes

- The first load might take a few seconds to download and initialize the WASM module and model.
- Ensure your browser supports WebAssembly and has access to the camera.
