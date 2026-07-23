# 👁️ OmniSight AI

**OmniSight AI** is a state-of-the-art Computer Vision platform built for real-time, high-accuracy object detection. It harnesses the power of YOLO deep learning models and a hyper-responsive FastAPI backend, wrapped in a sleek, glassmorphism-based React interface.

---

## ✨ Features

- **Live Camera Detection**: Stream real-time bounding boxes and confidence scores directly from your webcam.
- **Video Processing Engine**: Upload pre-recorded videos to generate fully annotated video outputs frame-by-frame.
- **Ultra-Fast Inference**: Backed by FastAPI and YOLO, ensuring low-latency processing suitable for real-world applications.
- **Premium User Interface**: Features a dynamic, dark-mode glassmorphism design with responsive micro-animations for an exceptional user experience.

---

## 🏗️ Architecture

1. **Frontend**: React, Material UI (Custom Glassmorphism Theme)
2. **Backend Engine**: Python, FastAPI, Uvicorn
3. **Computer Vision**: OpenCV, Ultralytics YOLO

---

## 🚀 Getting Started

### 1. Backend API

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate # Linux/Mac
pip install -r requirements.txt
python run.py
```

### 2. Frontend Application

```bash
cd frontend
npm install
npm start
```

The application will launch in your browser at `http://localhost:3000`.
