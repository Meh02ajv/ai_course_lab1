export interface TranscriptionResult {
  transcript: string;
  confidence?: number;
  duration?: number;
  words?: Word[];
}

export interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface AnalysisResult {
  summary: string;
  keyTakeaways: string[];
  actionItems: ActionItem[];
  studyTopics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedReadTime: number;
}

export interface ActionItem {
  task: string;
  priority: "High" | "Medium" | "Low";
  deadline?: string;
  assignee?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
  url: string;
}

export interface StudySession {
  id: string;
  title: string;
  createdAt: Date;
  duration: number;
  transcript: string;
  analysis: AnalysisResult;
  videos: YouTubeVideo[];
}

export type AppStep =
  | "idle" | "recording" | "uploading"
  | "transcribing" | "analyzing" | "complete" | "error";

export interface AppState {
  step: AppStep;
  transcript: string;
  analysis: AnalysisResult | null;
  videos: YouTubeVideo[];
  chatMessages: ChatMessage[];
  error: string | null;
  sessionId: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TranscribeResponse {
  transcript: string;
  sessionId: string;
  duration?: number;
}

export interface AnalyzeResponse {
  analysis: AnalysisResult;
  videos: YouTubeVideo[];
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
}

export interface PdfResponse {
  url: string;
  filename: string;
}