import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.services.video_service import process_video

router = APIRouter()

os.makedirs(settings.INPUT_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)


@router.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    """
    Endpoint: Upload a video file and run object detection on it.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(allowed_extensions)}"
        )

    # Generate unique filenames to avoid collision
    unique_id = uuid.uuid4().hex[:8]
    safe_filename = f"{unique_id}_{file.filename}"
    input_path = os.path.join(settings.INPUT_DIR, safe_filename)
    output_filename = f"processed_{safe_filename}"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)

    # Write uploaded file to disk
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    with open(input_path, "wb") as buffer:
        buffer.write(contents)

    try:
        # Run object detection
        result_info = process_video(input_path, output_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

    # Format output path for web URL (relative static URL "temp/output/...")
    rel_output_path = os.path.relpath(output_path, os.path.dirname(settings.INPUT_DIR)).replace("\\", "/")
    if not rel_output_path.startswith("temp/"):
        rel_output_path = f"temp/output/{output_filename}"

    return {
        "message": "Video processed successfully",
        "output_path": rel_output_path,
        "total_frames": result_info["total_frames"],
        "fps": result_info["fps"],
        "width": result_info["width"],
        "height": result_info["height"],
        "total_detections": result_info["total_detections"],
        "detection_summary": result_info["detection_summary"]
    }