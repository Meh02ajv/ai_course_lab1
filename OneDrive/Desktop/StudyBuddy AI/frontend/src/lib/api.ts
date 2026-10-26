import axios, { AxiosProgressEvent } from "axios";
import {
  TranscribeResponse, AnalyzeResponse,
  ChatResponse, ApiResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE, timeout: 300000 });

api.interceptors.request.use(
  (config) => { console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`); return config; },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export const transcribeAudio = async (
  audioBlob: Blob, filename: string,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<TranscribeResponse>> => {
  const formData = new FormData();
  formData.append("audio", audioBlob, filename);
  const response = await api.post<ApiResponse<TranscribeResponse>>("/transcribe", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e: AxiosProgressEvent) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return response.data;
};

export const analyzeTranscript = async (
  transcript: string, sessionId: string
): Promise<ApiResponse<AnalyzeResponse>> => {
  const response = await api.post<ApiResponse<AnalyzeResponse>>("/analyze", { transcript, sessionId });
  return response.data;
};

export const sendChatMessage = async (
  message: string, transcript: string,
  sessionId: string, history: { role: string; content: string }[]
): Promise<ApiResponse<ChatResponse>> => {
  const response = await api.post<ApiResponse<ChatResponse>>("/chat", {
    message, transcript, sessionId, history,
  });
  return response.data;
};

export const exportPdf = async (
  sessionId: string, transcript: string, analysis: object
): Promise<Blob> => {
  const response = await api.post<Blob>("/export-pdf", {
    sessionId, transcript, analysis,
  }, { responseType: "blob" });
  return response.data;
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get("/health");
    return response.data.status === "ok";
  } catch { return false; }
};

export default api;