import cv2
from app.models.yolo_model import yolo_model


def detect_objects(frame, conf: float = None):
    """
    Run object detection on a single frame.

    Returns:
        annotated_frame: Frame with bounding boxes and labels drawn.
        detections: List of dicts with detected object metadata.
        results: Raw YOLO results object.
    """
    results = yolo_model.predict(frame, conf=conf)

    # Draw bounding boxes
    annotated_frame = results[0].plot()

    # Extract structured detection metadata
    detections = []
    if len(results) > 0 and results[0].boxes is not None:
        boxes = results[0].boxes
        names = results[0].names
        for box in boxes:
            cls_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            class_name = names.get(cls_id, f"class_{cls_id}")
            detections.append({
                "class_name": class_name,
                "confidence": round(confidence, 3),
                "box": [round(coord, 1) for coord in xyxy]
            })

    return annotated_frame, detections, results