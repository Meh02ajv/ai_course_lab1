"use client";
import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import Header           from "@/components/Header";
import AudioCapture     from "@/components/AudioCapture";
import TranscriptPanel  from "@/components/TranscriptPanel";
import AnalysisPanel    from "@/components/AnalysisPanel";
import ChatPanel        from "@/components/ChatPanel";
import YouTubePanel     from "@/components/YouTubePanel";
import ExportButton     from "@/components/ExportButton";
import ProcessingStatus from "@/components/ProcessingStatus";
import { transcribeAudio, analyzeTranscript } from "@/lib/api";
import { AppStep, AnalysisResult, YouTubeVideo } from "@/types";

export default function Home() {
  const [step,       setStep]       = useState<AppStep>("idle");
  const [progress,   setProgress]   = useState(0);
  const [sessionId,  setSessionId]  = useState<string>("");
  const [transcript, setTranscript] = useState("");
  const [analysis,   setAnalysis]   = useState<AnalysisResult | null>(null);
  const [videos,     setVideos]     = useState<YouTubeVideo[]>([]);
  const [error,      setError]      = useState<string | null>(null);

  const isProcessing = step === "uploading" || step === "transcribing" || step === "analyzing";

  const handleAudioReady = useCallback(async (blob: Blob, filename: string) => {
    const sid = crypto.randomUUID();
    setSessionId(sid); setError(null); setTranscript(""); setAnalysis(null); setVideos([]);

    try {
      setStep("uploading"); setProgress(10);
      toast.loading("Uploading audio…", { id: "pipeline" });

      const transcribeRes = await transcribeAudio(blob, filename, (p) => {
        setProgress(10 + Math.round(p * 0.3));
      });
      if (!transcribeRes.success || !transcribeRes.data?.transcript)
        throw new Error(transcribeRes.error || "Transcription failed");

      setStep("transcribing"); setProgress(45);
      toast.loading("Transcribing speech…", { id: "pipeline" });
      const rawTranscript = transcribeRes.data.transcript;
      setTranscript(rawTranscript); setProgress(60);

      setStep("analyzing"); setProgress(65);
      toast.loading("Analyzing with Gemini AI…", { id: "pipeline" });
      const analyzeRes = await analyzeTranscript(rawTranscript, sid);
      if (!analyzeRes.success || !analyzeRes.data)
        throw new Error(analyzeRes.error || "Analysis failed");

      setAnalysis(analyzeRes.data.analysis);
      setVideos(analyzeRes.data.videos || []);
      setProgress(100); setStep("complete");
      toast.success("Study guide ready! 🎉", { id: "pipeline" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg); setStep("error");
      toast.error(msg, { id: "pipeline" });
    }
  }, []);

  const handleReset = () => {
    setStep("idle"); setProgress(0); setSessionId("");
    setTranscript(""); setAnalysis(null); setVideos([]); setError(null);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Header step={step} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {step === "idle" && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-primary-500/10 border border-primary-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-600" />
              <span className="text-xs text-primary-700 font-medium">
              Audio to organized study notes
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-dark-100 mb-4 leading-tight tracking-tight">
              Turn Audio Into{" "}
              <span className="gradient-text">Smart Study Guides</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Record lectures, upload audio files, and get instant AI-powered summaries,
              key takeaways, action items, and YouTube recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["Live recording", "Audio uploads", "Structured study notes",
                "Transcript Q&A", "Lesson recommendations", "PDF export"].map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium
                                         bg-dark-800 text-dark-300 border border-dark-700">{f}</span>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto mb-8">
          <AudioCapture onAudioReady={handleAudioReady} isProcessing={isProcessing} />
        </div>

        {step !== "idle" && step !== "recording" && (
          <div className="max-w-2xl mx-auto mb-8">
            <ProcessingStatus step={step} progress={progress} error={error} />
          </div>
        )}

        {(transcript || analysis) && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TranscriptPanel transcript={transcript} isLoading={step === "transcribing"} />
              <AnalysisPanel   analysis={analysis}     isLoading={step === "analyzing"}    />
            </div>

            {step === "complete" && analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChatPanel    transcript={transcript} sessionId={sessionId} />
                <YouTubePanel videos={videos} isLoading={false} studyTopics={analysis.studyTopics} />
              </div>
            )}

            {step === "complete" && analysis && (
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 glass rounded-2xl animate-fade-in">
                <div>
                  <h3 className="text-dark-100 font-semibold text-sm">Export Your Study Guide</h3>
                  <p className="text-dark-500 text-xs mt-0.5">
                    Download a beautifully formatted PDF with all your notes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-dark-800 text-dark-300
                               border border-dark-700 hover:text-dark-100 transition-colors">
                    Start New Session
                  </button>
                  <ExportButton sessionId={sessionId} transcript={transcript} analysis={analysis} />
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-16 pb-8 text-center">
          <p className="text-dark-600 text-xs">
            StudyBuddy AI · Built with Next.js, AssemblyAI & Google Gemini ·{" "}
            <span className="text-primary-600">v1.0.0</span>
          </p>
        </footer>
      </main>
    </div>
  );
}