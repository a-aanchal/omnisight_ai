import React, { useRef, useState, useEffect, useCallback } from "react";
import { Box, Button, Card, CardContent, Typography, Chip, Slider, Alert, Stack } from "@mui/material";
import { detectFrame } from "../services/api";

function CameraStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isRequestingRef = useRef(false);
  const isMountedRef = useRef(true);

  const [processedImage, setProcessedImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [confidence, setConfidence] = useState(0.25);
  const [latency, setLatency] = useState(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setProcessedImage(null);
    setDetections([]);
    setIsRunning(false);
    setLatency(null);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsRunning(true);
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Unable to access webcam. Please check browser permissions and allow camera access.");
    }
  };

  // Attach stream to video element once mounted in DOM
  useEffect(() => {
    if (isRunning && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn("Video play interrupted/failed:", err);
      });
    }
  }, [isRunning]);

  const processFrame = useCallback(async () => {
    if (!isRunning || !videoRef.current || !canvasRef.current || isRequestingRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight || video.paused || video.ended) {
      return;
    }

    isRequestingRef.current = true;
    const startTime = performance.now();

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      const base64Image = dataUrl.split(",")[1];

      if (base64Image) {
        const result = await detectFrame(base64Image, confidence);
        if (isMountedRef.current && isRunning) {
          setProcessedImage("data:image/jpeg;base64," + result.image);
          setDetections(result.detections || []);
          setLatency(Math.round(performance.now() - startTime));
        }
      }
    } catch (error) {
      console.error("Frame detection error:", error);
    } finally {
      isRequestingRef.current = false;
    }
  }, [isRunning, confidence]);

  // Main frame loop using recursive timeout after request completion
  useEffect(() => {
    isMountedRef.current = true;
    let timerId;

    const loop = async () => {
      if (isRunning && isMountedRef.current) {
        await processFrame();
        timerId = setTimeout(loop, 120); // ~8 FPS detection loop
      }
    };

    if (isRunning) {
      loop();
    }

    return () => {
      isMountedRef.current = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isRunning, processFrame]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Box>
      {cameraError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {cameraError}
        </Alert>
      )}

      {!isRunning && (
        <Box sx={{ textAlign: "center", marginTop: 6, marginBottom: 4 }}>
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
              },
            }}
          >
            Start Live Camera Feed
          </Button>
        </Box>
      )}

      {isRunning && (
        <Box>
          {/* Controls bar */}
          <Box sx={{ mb: 3, p: 2, background: "rgba(15, 23, 42, 0.4)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1, fontFamily: "'Inter', sans-serif" }}>
              Confidence Threshold: {Math.round(confidence * 100)}%
            </Typography>
            <Slider
              value={confidence}
              onChange={(e, val) => setConfidence(val)}
              min={0.1}
              max={0.9}
              step={0.05}
              sx={{ color: "#a78bfa" }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
            {/* Live Camera View */}
            <Card sx={{ background: "rgba(15, 23, 42, 0.3)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", boxShadow: "none" }}>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 1.5, color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Live Webcam</span>
                  <Chip label="LIVE" color="error" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                </Typography>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "2px solid #3b82f6",
                    boxShadow: "0 0 25px rgba(59, 130, 246, 0.2)",
                    objectFit: "cover",
                    minHeight: "240px",
                    background: "#0f172a",
                  }}
                />
              </CardContent>
            </Card>

            {/* Inference Output View */}
            <Card sx={{ background: "rgba(15, 23, 42, 0.3)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", boxShadow: "none" }}>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 1.5, color: "#a78bfa", fontFamily: "'Outfit', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>AI Detection Stream</span>
                  {latency && (
                    <Chip label={`${latency} ms`} size="small" sx={{ background: "rgba(167, 139, 250, 0.2)", color: "#a78bfa", fontSize: "0.75rem" }} />
                  )}
                </Typography>
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="Detection Stream"
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      border: "2px solid #8b5cf6",
                      boxShadow: "0 0 25px rgba(139, 92, 246, 0.2)",
                      objectFit: "cover",
                      minHeight: "240px",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: "240px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      background: "#0f172a",
                    }}
                  >
                    <Typography sx={{ color: "#64748b" }}>Processing initial stream...</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Detections Summary */}
          {detections.length > 0 && (
            <Card sx={{ mb: 3, background: "rgba(15, 23, 42, 0.3)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: "#e2e8f0", mb: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                  Objects Detected Right Now ({detections.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  {detections.map((item, idx) => (
                    <Chip
                      key={idx}
                      label={`${item.class_name} (${Math.round(item.confidence * 100)}%)`}
                      sx={{
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        color: "#93c5fd",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            <Button
              variant="outlined"
              onClick={stopCamera}
              sx={{
                borderRadius: "30px",
                padding: "8px 28px",
                color: "#f87171",
                borderColor: "rgba(248, 113, 113, 0.5)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  background: "rgba(248, 113, 113, 0.1)",
                  borderColor: "#ef4444",
                },
              }}
            >
              Stop Live Feed
            </Button>
          </Box>
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Box>
  );
}

export default CameraStream;