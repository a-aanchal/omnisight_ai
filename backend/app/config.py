import os

# Base directory for backend (parent of app directory)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings:
    MODEL_PATH = os.path.abspath(os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "weights", "yolo11n.pt")))
    INPUT_DIR = os.path.abspath(os.getenv("INPUT_DIR", os.path.join(BASE_DIR, "temp", "input")))
    OUTPUT_DIR = os.path.abspath(os.getenv("OUTPUT_DIR", os.path.join(BASE_DIR, "temp", "output")))
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.25))


settings = Settings()