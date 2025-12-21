export interface Detection {
  bbox: [number, number, number, number]; // x1,y1,x2,y2 (0-1 normalized)
  label: string; // COCO80 classes
  confidence: number; // 0.0 - 1.0
}
