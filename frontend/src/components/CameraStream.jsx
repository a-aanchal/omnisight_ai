import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { detectFrame } from "../services/api";

function CameraStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [processedImage, setProcessedImage] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const startCamera = () => setIsRunning(true);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setProcessedImage(null);
    setIsRunning(false);
  };

  useEffect(() => {
    let stream;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera error:", error);
      }
    };
    if (isRunning) enableCamera();

    return () => {
      const activeStream = videoRef.current?.srcObject;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isRunning]);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
    try {
      const result = await detectFrame(base64Image);
      setProcessedImage("data:image/jpeg;base64," + result.image);
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        captureFrame();
      }, 300); // Fetch frame every 300ms
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Clean up if component unmounts
  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <Box>
      {!isRunning && (
        <Box sx={{ textAlign: "center", marginTop: 8 }}>
          <Button
            variant="contained"
            onClick={startCamera}
            sx={{
              background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              borderRadius: "30px",
              padding: "12px 40px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              textTransform: "none",
              fontSize: "1.1rem",
              boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.4)",
              "&:hover": {
                background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                boxShadow: "0 10px 25px -3px rgba(139, 92, 246, 0.6)",
              }
            }}
          >
            Start Live Analysis
          </Button>
        </Box>
      )}

      {isRunning && (
        <Box>
          <Card sx={{ 
            marginBottom: 3, 
            background: "rgba(15, 23, 42, 0.3)", 
            borderRadius: 3, 
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "none"
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: 2, color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>
                Active Feed
              </Typography>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                width="100%"
                style={{
                  borderRadius: "12px",
                  border: "2px solid #3b82f6",
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.2)"
                }}
              />
            </CardContent>
          </Card>

          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            <Button
              variant="outlined"
              onClick={stopCamera}
              sx={{
                borderRadius: "30px",
                padding: "8px 24px",
                color: "#f87171",
                borderColor: "rgba(248, 113, 113, 0.5)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  background: "rgba(248, 113, 113, 0.1)",
                  borderColor: "#ef4444"
                }
              }}
            >
              Stop Feed
            </Button>
          </Box>

          {processedImage && (
            <Card sx={{ 
              background: "rgba(15, 23, 42, 0.3)", 
              borderRadius: 3, 
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "none"
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 2, color: "#a78bfa", fontFamily: "'Outfit', sans-serif" }}>
                  Real-time Inference
                </Typography>
                <img
                  src={processedImage}
                  alt="Detection Result"
                  width="100%"
                  style={{
                    borderRadius: "12px",
                    border: "2px solid #8b5cf6",
                    boxShadow: "0 0 25px rgba(139, 92, 246, 0.2)"
                  }}
                />
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Box>
  );
}

export default CameraStream;