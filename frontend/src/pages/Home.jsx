import React, { useState } from "react";
import { Tabs, Tab, Box, Typography, Paper } from "@mui/material";

import VideoUpload from "../components/VideoUpload";
import CameraStream from "../components/CameraStream";

function Home() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", padding: { xs: 2, md: 6 } }}>
      {/* Main Glassmorphism Container */}
      <Paper
        elevation={0}
        sx={{
          width: "900px",
          padding: { xs: 3, md: 5 },
          borderRadius: 4,
          background: "rgba(30, 41, 59, 0.5)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
        }}
      >
        {/* Title */}
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            marginBottom: 1,
            background: "linear-gradient(to right, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          OmniSight AI
        </Typography>

        {/* Subtitle */}
        <Typography
          align="center"
          sx={{ marginBottom: 4, color: "#94a3b8", fontFamily: "'Inter', sans-serif", fontSize: "1.1rem" }}
        >
          Real-time object detection powered by deep learning
        </Typography>

        {/* Styled Tabs */}
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          centered
          sx={{
            marginBottom: 4,
            "& .MuiTabs-indicator": {
              backgroundColor: "#a78bfa",
              height: 3,
              borderRadius: "3px 3px 0 0"
            }
          }}
        >
          <Tab 
            label="Live Camera" 
            sx={{ 
              color: "#64748b", 
              fontWeight: 600, 
              fontFamily: "'Inter', sans-serif",
              fontSize: "1rem",
              textTransform: "none",
              "&.Mui-selected": { color: "#e2e8f0" } 
            }} 
          />
          <Tab 
            label="Upload Video" 
            sx={{ 
              color: "#64748b", 
              fontWeight: 600, 
              fontFamily: "'Inter', sans-serif",
              fontSize: "1rem",
              textTransform: "none",
              "&.Mui-selected": { color: "#e2e8f0" } 
            }} 
          />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ minHeight: "400px" }}>
          {tabIndex === 0 && <CameraStream />}
          {tabIndex === 1 && <VideoUpload />}
        </Box>
      </Paper>
    </Box>
  );
}

export default Home;