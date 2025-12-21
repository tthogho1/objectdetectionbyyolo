use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use serde::{Deserialize, Serialize};

mod yolo;

static mut MODEL: Option<yolo::YoloV8> = None;

#[derive(Serialize, Deserialize)]
pub struct Detection {
    pub bbox: [f32; 4],  // x1, y1, x2, y2 (normalized 0-1)
    pub label: String,
    pub confidence: f32,
}

#[wasm_bindgen]
pub async fn init(model_path: &str) -> Result<(), JsValue> {
    console_error_panic_hook::set_once();
    
    let global = js_sys::global();
    let resp_value = if let Ok(window) = global.clone().dyn_into::<web_sys::Window>() {
        wasm_bindgen_futures::JsFuture::from(window.fetch_with_str(model_path)).await?
    } else if let Ok(worker) = global.dyn_into::<web_sys::WorkerGlobalScope>() {
        wasm_bindgen_futures::JsFuture::from(worker.fetch_with_str(model_path)).await?
    } else {
        return Err(JsValue::from_str("No window or worker global scope"));
    };

    let resp: web_sys::Response = resp_value.dyn_into()?;
    let data = wasm_bindgen_futures::JsFuture::from(resp.array_buffer()?).await?;
    let bytes = js_sys::Uint8Array::new(&data).to_vec();

    let model = yolo::YoloV8::new(&bytes).await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    unsafe { MODEL = Some(model); }
    Ok(())
}

#[wasm_bindgen]
pub fn detect(image_data: Vec<u8>, width: u32, height: u32) -> Result<JsValue, JsValue> {
    let model = unsafe { MODEL.as_ref().ok_or("Model not initialized")? };
    let detections = model.detect(&image_data, width, height, 0.25, 0.45)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&detections).map_err(|e| JsValue::from_str(&e.to_string()))
}
