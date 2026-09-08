from collections import Counter
import cv2

from app.utils.frame_extractor import extract_frames
from app.utils.video_writer import VideoWriter
from app.services.detection_service import detect_objects


def process_video(input_path: str, output_path: str):
    """
    Process a video file with object detection.

    Returns:
        dict containing output_path, total_frames, fps, width, height,
        total_detections, and detection_summary.
    """
    cap = cv2.VideoCapture(input_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or fps > 120:
        fps = 30.0

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_input_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    cap.release()

    if width <= 0 or height <= 0:
        width, height = 640, 480

    writer = VideoWriter(output_path, fps, width, height)

    total_frames_processed = 0
    total_detections_count = 0
    class_counter = Counter()

    for frame in extract_frames(input_path):
        if frame is None or frame.size == 0:
            continue

        annotated_frame, detections, _ = detect_objects(frame)
        writer.write_frame(annotated_frame)

        total_frames_processed += 1
        total_detections_count += len(detections)
        for det in detections:
            class_counter[det["class_name"]] += 1

    writer.release()

    return {
        "output_path": output_path,
        "total_frames": total_frames_processed,
        "fps": round(fps, 2),
        "width": width,
        "height": height,
        "total_detections": total_detections_count,
        "detection_summary": dict(class_counter)
    }