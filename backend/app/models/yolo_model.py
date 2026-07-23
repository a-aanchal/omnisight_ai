from ultralytics import YOLO

class YOLOModel:

    def __init__(self, model_path: str = "weights/yolo11n.pt"):
        self.model = YOLO(model_path)

    def predict(self, frame):
        results = self.model(frame)
        return results


# Singleton instance (loaded once)
yolo_model = YOLOModel()