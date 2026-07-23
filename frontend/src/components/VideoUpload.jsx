import React, { useState } from "react";
import { Card, CardContent, Button, Box, CircularProgress, Typography } from "@mui/material";
import { uploadVideo } from "../services/api";

function VideoUpload() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setVideoFile(file);
    const previewURL = URL.createObjectURL(file);
    setVideoPreview(previewURL);
    setProcessedVideo(null);
  };

  const resetUploader = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setProcessedVideo(null);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    try {
      setLoading(true);
      const response = await uploadVideo(videoFile);
      const videoUrl = "http://localhost:8000/" + response.output_path;
      setProcessedVideo(videoUrl);
    } catch (error) {
      console.error("Video processing error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ 
      background: "transparent", 
      boxShadow: "none" 
    }}>
      <CardContent sx={{ padding: 0 }}>
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
              }
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
                }
              }}
            >
              Select Video
              <input hidden type="file" accept="video/*" onChange={handleFileChange} />
            </Button>
            <Typography sx={{ mt: 2, color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
              Supports MP4, AVI, MOV
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
                boxShadow: processedVideo ? "0 0 25px rgba(16, 185, 129, 0.2)" : "none"
              }}
            />

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(15, 23, 42, 0.7)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  zIndex: 10
                }}
              >
                <CircularProgress sx={{ color: "#10b981", mb: 2 }} size={60} thickness={4} />
                <Typography sx={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 500 }}>
                  Analyzing Frames...
                </Typography>
              </Box>
            )}

            {!processedVideo && (
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
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
                    "&:hover": { background: "linear-gradient(45deg, #059669, #047857)" }
                  }}
                >
                  Run AI Inference
                </Button>
              </Box>
            )}

            {processedVideo && (
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                <Button
                  variant="outlined"
                  onClick={resetUploader}
                  sx={{
                    borderRadius: "30px",
                    padding: "8px 24px",
                    color: "#94a3b8",
                    borderColor: "rgba(148, 163, 184, 0.5)",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { borderColor: "#cbd5e1", background: "rgba(255,255,255,0.05)" }
                  }}
                >
                  Process Another Video
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default VideoUpload;