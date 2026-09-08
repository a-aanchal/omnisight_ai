import base64
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.detection_service import detect_objects

router = APIRouter()


class FrameRequest(BaseModel):
    image: str  # base64 encoded image
    confidence: float = None  # optional custom confidence threshold


@router.post("/detect/frame")
def detect_frame(request: FrameRequest):
    if not request.image or not request.image.strip():
        raise HTTPException(status_code=400, detail="Image base64 payload is empty.")

    try:
        # Strip header if present (e.g. data:image/jpeg;base64,)
        raw_image_str = request.image
        if "," in raw_image_str:
            raw_image_str = raw_image_str.split(",", 1)[1]

        image_data = base64.b64decode(raw_image_str)
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Decoded image data is empty.")

        np_arr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None or frame.size == 0:
            raise HTTPException(status_code=400, detail="Failed to decode image frame.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Invalid base64 image encoding: {str(e)}")

    # Run object detection
    annotated_frame, detections, _ = detect_objects(frame, conf=request.confidence)

    # Encode annotated frame back to JPEG base64
    success, buffer = cv2.imencode(".jpg", annotated_frame)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode annotated image frame.")

    encoded_image = base64.b64encode(buffer).decode("utf-8")

    return {
        "image": encoded_image,
        "detections": detections,
        "total_detected": len(detections)
    }