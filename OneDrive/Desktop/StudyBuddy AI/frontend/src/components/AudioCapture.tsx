"use client";
import React, { useState, useRef, useCallback } from "react";
import {
  Mic, MicOff, Square, Pause, Play,
  Upload, FileAudio, Trash2, Send, AlertCircle, Clock,
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import clsx from "clsx";

interface AudioCaptureProps {
  onAudioReady: (blob: Blob, filename: string) => void;
  isProcessing: boolean;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const AudioCapture: React.FC<AudioCaptureProps> = ({ onAudioReady, isProcessing }) => {
  const [activeTab,    setActiveTab]    = useState<"record" | "upload">("record");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  const {
    recordingState, audioBlob, audioUrl, duration,
    startRecording, stopRecording, pauseRecording,
    resumeRecording, resetRecording, error: recError,
  } = useAudioRecorder();

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 100 * 1024 * 1024) { alert("File size must be under 100MB"); return; }
    setUploadedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const formatFileSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-dark-900/60 rounded-xl mb-6">
        {(["record", "upload"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab ? "bg-primary-600 text-white shadow-lg" : "text-dark-400 hover:text-dark-200"
            )}>
            {tab === "record" ? <Mic className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {tab === "record" ? "Record Audio" : "Upload File"}
          </button>
        ))}
      </div>

      {/* RECORD TAB */}
      {activeTab === "record" && (
        <div className="space-y-6">
          {recError && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{recError}</p>
            </div>
          )}
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative">
              <button
                onClick={recordingState === "idle" || recordingState === "stopped" ? startRecording : stopRecording}
                disabled={isProcessing}
                className={clsx(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none",
                  recordingState === "recording" ? "bg-red-500 recording-pulse glow-red" :
                  recordingState === "paused"    ? "bg-yellow-500/80" :
                  "bg-gradient-to-br from-primary-500 to-purple-600 glow-primary",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}>
                {recordingState === "recording" ? <Square className="w-8 h-8 text-white" /> :
                 recordingState === "paused"    ? <Pause  className="w-8 h-8 text-white" /> :
                                                  <Mic    className="w-8 h-8 text-white" />}
              </button>
              {recordingState === "recording" && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1">
                  {[...Array(7)].map((_, i) => <span key={i} className="waveform-bar" />)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Clock className="w-4 h-4 text-dark-400" />
              <span className={clsx("font-mono text-2xl font-bold",
                recordingState === "recording" ? "text-red-400" : "text-dark-200")}>
                {formatDuration(duration)}
              </span>
            </div>
            <p className="text-sm text-dark-400 text-center">
              {recordingState === "idle"      && "Click the button to start recording"}
              {recordingState === "recording" && "Recording in progress… click to stop"}
              {recordingState === "paused"    && "Recording paused"}
              {recordingState === "stopped"   && "Recording complete — ready to process"}
            </p>
          </div>

          {recordingState === "recording" && (
            <div className="flex justify-center">
              <button onClick={pauseRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10
                           border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 transition-colors text-sm">
                <Pause className="w-4 h-4" /> Pause
              </button>
            </div>
          )}

          {recordingState === "paused" && (
            <div className="flex justify-center gap-3">
              <button onClick={resumeRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10
                           border border-green-500/20 text-green-300 hover:bg-green-500/20 transition-colors text-sm">
                <Play className="w-4 h-4" /> Resume
              </button>
              <button onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10
                           border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors text-sm">
                <Square className="w-4 h-4" /> Stop
              </button>
            </div>
          )}

          {recordingState === "stopped" && audioUrl && (
            <div className="space-y-4 animate-slide-up">
              <audio src={audioUrl} controls className="w-full h-10 rounded-xl" style={{ accentColor: "#6366f1" }} />
              <div className="flex gap-3">
                <button onClick={resetRecording}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800
                             border border-dark-700 text-dark-300 hover:text-dark-100 transition-colors text-sm flex-1">
                  <Trash2 className="w-4 h-4" /> Discard
                </button>
                <button onClick={() => audioBlob && onAudioReady(audioBlob, `recording-${Date.now()}.webm`)}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                             bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold
                             hover:opacity-90 transition-opacity text-sm flex-1 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {isProcessing ? "Processing…" : "Transcribe & Analyze"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD TAB */}
      {activeTab === "upload" && (
        <div className="space-y-5">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
              isDragging ? "border-primary-400 bg-primary-500/10" :
              "border-dark-600 hover:border-primary-500/50 hover:bg-primary-500/5"
            )}>
            <FileAudio className={clsx("w-12 h-12 mx-auto mb-4", isDragging ? "text-primary-400" : "text-dark-500")} />
            <p className="text-dark-200 font-medium mb-1">
              {isDragging ? "Drop your audio file here" : "Drag & drop your audio file"}
            </p>
            <p className="text-dark-500 text-sm mb-3">or click to browse</p>
            <p className="text-dark-600 text-xs">Supports: MP3, WAV, WebM, OGG, M4A · Max 100MB</p>
            <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a"
              className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
          </div>

          {uploadedFile && (
            <div className="animate-slide-up space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/60 border border-dark-700">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <FileAudio className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-100 font-medium text-sm truncate">{uploadedFile.name}</p>
                  <p className="text-dark-500 text-xs">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <button onClick={() => setUploadedFile(null)}
                  className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <audio src={URL.createObjectURL(uploadedFile)} controls
                className="w-full h-10 rounded-xl" style={{ accentColor: "#6366f1" }} />
              <button onClick={() => onAudioReady(uploadedFile, uploadedFile.name)} disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold
                           hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send className="w-4 h-4" />
                {isProcessing ? "Processing…" : "Transcribe & Analyze"}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "record" && recordingState === "idle" && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-dark-800/40 border border-dark-700/50">
          <MicOff className="w-4 h-4 text-dark-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-dark-500">
            Your browser will ask for microphone permission when you start recording.
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioCapture;