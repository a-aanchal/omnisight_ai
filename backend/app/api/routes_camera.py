# Used to encode and decode images in base64 format
import base64

# OpenCV library for image processing
import cv2

# NumPy for handling image arrays
import numpy as np

# FastAPI router to create API endpoints
from fastapi import APIRouter

# Pydantic model for request validation
from pydantic import BaseModel

# Import object detection service which runs the YOLO model
from app.services.detection_service import detect_objects


# Create a router instance for grouping related endpoints
router = APIRouter()


# Request model for incoming frame data
class FrameRequest(BaseModel):

    # Base64 encoded image string received from frontend
    image: str   # base64 encoded image


# API endpoint to detect objects in a single frame
@router.post("/detect/frame")
def detect_frame(request: FrameRequest):

    # -----------------------------------------------------
    # Step 1: Decode base64 image received from frontend
    # -----------------------------------------------------

    # Convert base64 string back to raw bytes
    image_data = base64.b64decode(request.image)

    # Convert bytes into a NumPy array
    np_arr = np.frombuffer(image_data, np.uint8)

    # Decode NumPy array into an OpenCV image frame
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


    # -----------------------------------------------------
    # Step 2: Run object detection on the frame
    # -----------------------------------------------------

    # detect_objects returns:
    # 1. annotated_frame → frame with bounding boxes drawn
    # 2. detections → list of detected objects (ignored here)
    annotated_frame, _ = detect_objects(frame)


    # -----------------------------------------------------
    # Step 3: Encode processed frame back to base64
    # -----------------------------------------------------

    # Convert annotated frame to JPEG format
    _, buffer = cv2.imencode(".jpg", annotated_frame)

    # Encode JPEG bytes into base64 string
    encoded_image = base64.b64encode(buffer).decode("utf-8")


    # -----------------------------------------------------
    # Step 4: Return processed image to frontend
    # -----------------------------------------------------

    # Frontend will display this image in the UI
    return {"image": encoded_image}