import React from "react";
import { Brain } from "lucide-react";

interface HeaderProps { step: string; }

const Header: React.FC<HeaderProps> = ({ step }) => (
  <header className="glass-dark border-b border-dark-700 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-dark-100 leading-none">StudyBuddy</h1>
            <p className="text-xs text-dark-500 leading-none mt-1">Lecture notes workspace</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {step !== "idle" && step !== "complete" && step !== "error" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary-500/10 border border-primary-500/20">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-xs text-primary-300 font-medium capitalize">
                {step === "transcribing" ? "Transcribing audio…" :
                 step === "analyzing"    ? "Analyzing with AI…"  :
                 step === "uploading"    ? "Uploading file…"     :
                 step === "recording"    ? "Recording…"          : step}
              </span>
            </div>
          )}
          {step === "complete" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-300 font-medium">Analysis complete</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800 border border-dark-700">
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          <span className="text-xs font-medium text-dark-400">Study tools, in one place</span>
        </div>

      </div>
    </div>
  </header>
);

export default Header;