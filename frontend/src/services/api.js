import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minute timeout for large video uploads
});

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/detect/video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const detectFrame = async (imageBase64, confidence = 0.25) => {
  const response = await API.post("/detect/frame", {
    image: imageBase64,
    confidence: confidence,
  });

  return response.data;
};