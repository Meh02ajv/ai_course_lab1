"use client";
import React from "react";
import { Mic, FileAudio, Brain, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { AppStep } from "@/types";
import clsx from "clsx";

interface ProcessingStatusProps { step: AppStep; progress?: number; error?: string | null; }

const STEPS = [
  { id: "uploading",    label: "Uploading Audio",     icon: FileAudio, desc: "Sending your audio to the server"         },
  { id: "transcribing", label: "Transcribing Speech", icon: Mic,       desc: "Converting speech to text via AssemblyAI" },
  { id: "analyzing",    label: "AI Analysis",         icon: Brain,     desc: "Extracting insights with Gemini AI"       },
  { id: "complete",     label: "Complete",            icon: Sparkles,  desc: "Your study guide is ready!"               },
];

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ step, progress = 0, error }) => {
  const currentIndex  = STEPS.findIndex((s) => s.id === step);
  const getStepStatus = (index: number) => {
    if (step === "error") return index <= currentIndex ? "error" : "pending";
    if (index < currentIndex)  return "complete";
    if (index === currentIndex) return "active";
    return "pending";
  };

  if (step === "idle" || step === "recording") return null;

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      {step === "error" && error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm">Processing Failed</p>
            <p className="text-red-400/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {step !== "complete" && step !== "error" && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-dark-400">Processing…</span>
            <span className="text-xs text-primary-400 font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <div className="progress-bar h-full rounded-full transition-all duration-500"
                 style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {STEPS.map((s, i) => {
          const status = getStepStatus(i);
          const Icon   = s.icon;
          return (
            <div key={s.id} className={clsx(
              "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
              status === "active"   && "bg-primary-500/10 border border-primary-500/20",
              status === "complete" && "bg-green-500/5  border border-green-500/10",
              status === "pending"  && "opacity-40",
              status === "error"    && "bg-red-500/5    border border-red-500/10",
            )}>
              <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                status === "active"   && "bg-primary-500/20",
                status === "complete" && "bg-green-500/20",
                status === "pending"  && "bg-dark-800",
                status === "error"    && "bg-red-500/20",
              )}>
                {status === "active"   ? <Loader2     className="w-4 h-4 text-primary-400 animate-spin" /> :
                 status === "complete" ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                 status === "error"    ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                                         <Icon        className="w-4 h-4 text-dark-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx("text-sm font-medium",
                  status === "active"   && "text-primary-300",
                  status === "complete" && "text-green-300",
                  status === "pending"  && "text-dark-500",
                  status === "error"    && "text-red-300",
                )}>{s.label}</p>
                <p className="text-xs text-dark-600 truncate">{s.desc}</p>
              </div>
              {status === "active" && (
                <div className="flex gap-1 flex-shrink-0">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce"
                         style={{ animationDelay: `${j * 150}ms` }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {step === "complete" && (
        <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in">
          <p className="text-green-300 text-sm font-medium">🎉 Your study guide is ready! Scroll down to explore.</p>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;