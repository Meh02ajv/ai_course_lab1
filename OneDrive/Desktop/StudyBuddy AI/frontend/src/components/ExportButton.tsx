"use client";
import React, { useState } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { exportPdf } from "@/lib/api";
import { AnalysisResult } from "@/types";
import toast from "react-hot-toast";
import clsx from "clsx";

interface ExportButtonProps { sessionId: string; transcript: string; analysis: AnalysisResult; }

const ExportButton: React.FC<ExportButtonProps> = ({ sessionId, transcript, analysis }) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleExport = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      const pdf = await exportPdf(sessionId, transcript, analysis);
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `study-guide-${sessionId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setState("done");
      toast.success("PDF study guide downloaded!");
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setState("idle");
      }, 3000);
    } catch {
      toast.error("Failed to export PDF. Please try again.");
      setState("idle");
    }
  };

  return (
    <button onClick={handleExport} disabled={state === "loading"}
      className={clsx(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
        state === "done"    ? "bg-green-500/20 text-green-300 border border-green-500/30" :
        state === "loading" ? "bg-dark-800 text-dark-400 border border-dark-700 cursor-not-allowed" :
        "bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:opacity-90"
      )}>
      {state === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</> :
       state === "done"    ? <><CheckCircle className="w-4 h-4" /> Downloaded!</> :
                             <><Download className="w-4 h-4" /> Export PDF Study Guide</>}
    </button>
  );
};

export default ExportButton;