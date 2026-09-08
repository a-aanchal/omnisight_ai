import React, { useState } from "react";
import { Card, CardContent, Button, Box, CircularProgress, Typography, Alert, Chip, Stack } from "@mui/material";
import { uploadVideo, SERVER_BASE_URL } from "../services/api";

function VideoUpload() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [videoStats, setVideoStats] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setErrorMsg(null);
    setVideoFile(file);
    const previewURL = URL.createObjectURL(file);
    setVideoPreview(previewURL);
    setProcessedVideo(null);
    setVideoStats(null);
  };

  const resetUploader = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setProcessedVideo(null);
    setVideoStats(null);
    setErrorMsg(null);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    setErrorMsg(null);
    try {
      setLoading(true);
      const response = await uploadVideo(videoFile);
      const videoUrl = `${SERVER_BASE_URL}/${response.output_path.replace(/^\/+/, "")}`;
      setProcessedVideo(videoUrl);
      setVideoStats({
        total_frames: response.total_frames,
        fps: response.fps,
        width: response.width,
        height: response.height,
        total_detections: response.total_detections,
        detection_summary: response.detection_summary || {},
      });
    } catch (err) {
      console.error("Video processing error:", err);
      const detail = err.response?.data?.detail || "Failed to process video. Please ensure the file is a valid video format.";
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ background: "transparent", boxShadow: "none" }}>
      <CardContent sx={{ padding: 0 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {!videoPreview && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              border: "2px dashed rgba(167, 139, 250, 0.4)",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(15, 23, 42, 0.4)",
                borderColor: "rgba(167, 139, 250, 0.8)",
              },
            }}
          >
            <Button
              variant="contained"
              component="label"
              sx={{
                background: "linear-gradient(45deg, #10b981, #059669)",
                borderRadius: "30px",
                padding: "12px 40px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                fontSize: "1.1rem",
                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #059669, #047857)",
                  boxShadow: "0 10px 25px -3px rgba(16, 185, 129, 0.6)",
                },
              }}
            >
              Select Video File
              <input hidden type="file" accept="video/mp4,video/avi,video/mov,video/mkv,video/webm" onChange={handleFileChange} />
            </Button>
            <Typography sx={{ mt: 2, color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
              Supported formats: MP4, AVI, MOV, MKV, WEBM
            </Typography>
          </Box>
        )}

        {videoPreview && (
          <Box sx={{ position: "relative" }}>
            <video
              width="100%"
              controls
              src={processedVideo || videoPreview}
              key={processedVideo || videoPreview}
              style={{
                borderRadius: "12px",
                border: processedVideo ? "2px solid #10b981" : "2px solid #64748b",
                boxShadow: processedVideo ? "0 0 25px rgba(16, 185, 129, 0.2)" : "none",
              }}
            />

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(15, 23, 42, 0.75)",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  zIndex: 10,
                }}
              >
                <CircularProgress sx={{ color: "#10b981", mb: 2 }} size={60} thickness={4} />
                <Typography sx={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 500 }}>
                  Analyzing Frames & Running Object Detection...
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
                  This may take a moment for longer videos.
                </Typography>
              </Box>
            )}

            {!processedVideo && !loading && (
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={loading}
                  sx={{
                    background: "linear-gradient(45deg, #10b981, #059669)",
                    borderRadius: "30px",
                    padding: "10px 32px",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { background: "linear-gradient(45deg, #059669, #047857)" },
                  }}
                >
                  Run AI Inference
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetUploader}
                  sx={{
                    borderRadius: "30px",
                    padding: "10px 24px",
                    color: "#94a3b8",
                    borderColor: "rgba(148, 163, 184, 0.5)",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}

            {processedVideo && videoStats && (
              <Box sx={{ marginTop: 4 }}>
                <Card sx={{ background: "rgba(15, 23, 42, 0.4)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", p: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ color: "#10b981", fontFamily: "'Outfit', sans-serif", mb: 2 }}>
                    Detection Summary Stats
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Frames Processed</Typography>
                      <Typography variant="h6" sx={{ color: "#e2e8f0" }}>{videoStats.total_frames}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Frame Rate</Typography>
                      <Typography variant="h6" sx={{ color: "#e2e8f0" }}>{videoStats.fps} FPS</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Resolution</Typography>
                      <Typography variant="h6" sx={{ color: "#e2e8f0" }}>{videoStats.width}x{videoStats.height}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Total Detections</Typography>
                      <Typography variant="h6" sx={{ color: "#34d399" }}>{videoStats.total_detections}</Typography>
                    </Box>
                  </Box>

                  {Object.keys(videoStats.detection_summary).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 1 }}>Detected Object Types:</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        {Object.entries(videoStats.detection_summary).map(([cls, count]) => (
                          <Chip
                            key={cls}
                            label={`${cls}: ${count}`}
                            sx={{
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid rgba(16, 185, 129, 0.4)",
                              color: "#6ee7b7",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Card>

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={resetUploader}
                    sx={{
                      borderRadius: "30px",
                      padding: "8px 28px",
                      color: "#94a3b8",
                      borderColor: "rgba(148, 163, 184, 0.5)",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { borderColor: "#cbd5e1", background: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    Process Another Video
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default VideoUpload;