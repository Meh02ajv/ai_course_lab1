import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  error: string | null;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob,      setAudioBlob]      = useState<Blob | null>(null);
  const [audioUrl,       setAudioUrl]       = useState<string | null>(null);
  const [duration,       setDuration]       = useState(0);
  const [error,          setError]          = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setDuration((p) => p + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];
      setDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100, channelCount: 1 },
      });
      streamRef.current = stream;

      const mimeType = [
        "audio/webm;codecs=opus", "audio/webm",
        "audio/ogg;codecs=opus",  "audio/mp4",
      ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingState("stopped");
        stopTimer();
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.onerror = () => {
        setError("Recording error occurred.");
        setRecordingState("idle");
        stopTimer();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setRecordingState("recording");
      startTimer();
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("No microphone found.");
      } else {
        setError("Failed to start recording.");
      }
      setRecordingState("idle");
    }
  }, [startTimer, stopTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState !== "idle") {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [recordingState, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      stopTimer();
    }
  }, [recordingState, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      startTimer();
    }
  }, [recordingState, startTimer]);

  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    stopTimer();
    chunksRef.current        = [];
    mediaRecorderRef.current = null;
    streamRef.current        = null;
    setRecordingState("idle");
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
  }, [audioUrl, stopTimer]);

  return {
    recordingState, audioBlob, audioUrl, duration,
    startRecording, stopRecording, pauseRecording,
    resumeRecording, resetRecording, error,
  };
};