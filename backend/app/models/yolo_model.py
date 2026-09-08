from ultralytics import YOLO
from app.config import settings


class YOLOModel:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = settings.MODEL_PATH
        self.model = YOLO(model_path)

    def predict(self, frame, conf: float = None):
        if conf is None:
            conf = settings.CONFIDENCE_THRESHOLD
        results = self.model(frame, conf=conf, verbose=False)
        return results


# Singleton instance (loaded once)
yolo_model = YOLOModel()