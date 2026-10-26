"use client";
import React, { useState } from "react";
import { FileText, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

interface TranscriptPanelProps { transcript: string; isLoading?: boolean; }

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, isLoading = false }) => {
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount   = transcript.split(/\s+/).filter(Boolean).length;
  const charCount   = transcript.length;
  const readTime    = Math.ceil(wordCount / 200);
  const displayText = expanded ? transcript : transcript.slice(0, 600) + (transcript.length > 600 ? "…" : "");

  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-100">Transcript</h3>
            {!isLoading && transcript && (
              <p className="text-xs text-dark-500">{wordCount.toLocaleString()} words · ~{readTime} min read</p>
            )}
          </div>
        </div>
        {!isLoading && transcript && (
          <button onClick={handleCopy}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              copied ? "bg-green-500/20 text-green-300 border border-green-500/30" :
              "bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700"
            )}>
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        )}
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
            <div className="flex items-center gap-2 mt-4">
              {[0, 150, 300].map((d) => (
                <div key={d} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
                     style={{ animationDelay: `${d}ms` }} />
              ))}
              <span className="text-xs text-dark-400 ml-1">Transcribing audio…</span>
            </div>
          </div>
        ) : transcript ? (
          <>
            <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{displayText}</p>
            {transcript.length > 600 && (
              <button onClick={() => setExpanded(!expanded)}
                className="mt-3 flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> :
                            <><ChevronDown className="w-3.5 h-3.5" /> Show full transcript ({charCount.toLocaleString()} chars)</>}
              </button>
            )}
            <div className="mt-4 pt-4 border-t border-dark-700/50 grid grid-cols-3 gap-3">
              {[
                { label: "Words",      value: wordCount.toLocaleString() },
                { label: "Characters", value: charCount.toLocaleString() },
                { label: "Read time",  value: `~${readTime} min`         },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-bold text-primary-400">{value}</p>
                  <p className="text-xs text-dark-500">{label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-500 text-sm">Transcript will appear here after processing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;