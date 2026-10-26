"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, BookOpen, CheckSquare, Target, TrendingUp, Clock, AlertCircle, CheckCircle, MinusCircle } from "lucide-react";
import { AnalysisResult, ActionItem } from "@/types";
import clsx from "clsx";

interface AnalysisPanelProps { analysis: AnalysisResult | null; isLoading?: boolean; }
type TabId = "summary" | "takeaways" | "actions" | "topics";

const priorityConfig = {
  High:   { icon: AlertCircle,  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
  Medium: { icon: MinusCircle,  color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  Low:    { icon: CheckCircle,  color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
};

const difficultyConfig = {
  Beginner:     { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
  Intermediate: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  Advanced:     { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
};

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  const tabs = [
    { id: "summary"   as TabId, label: "Summary",  icon: Sparkles,    count: undefined                     },
    { id: "takeaways" as TabId, label: "Takeaways", icon: BookOpen,    count: analysis?.keyTakeaways.length },
    { id: "actions"   as TabId, label: "Actions",   icon: CheckSquare, count: analysis?.actionItems.length  },
    { id: "topics"    as TabId, label: "Topics",    icon: Target,      count: analysis?.studyTopics.length  },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-5 py-4 border-b border-dark-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-dark-100">AI Analysis</h3>
          </div>
          {analysis && (
            <div className="flex items-center gap-2">
              <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium border",
                difficultyConfig[analysis.difficulty].color,
                difficultyConfig[analysis.difficulty].bg,
                difficultyConfig[analysis.difficulty].border)}>
                {analysis.difficulty}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                               bg-dark-800 text-dark-400 border border-dark-700">
                <Clock className="w-3 h-3" />{analysis.estimatedReadTime} min
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                  : "text-dark-400 hover:text-dark-200 hover:bg-dark-800"
              )}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx("px-1.5 py-0.5 rounded-full text-xs",
                  activeTab === tab.id ? "bg-primary-500/30 text-primary-300" : "bg-dark-700 text-dark-500")}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 min-h-[200px]">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs text-dark-400">Analyzing with Gemini AI…</span>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-500 text-sm">AI analysis will appear here after transcription</p>
          </div>
        ) : (
          <>
            {activeTab === "summary" && (
              <div className="prose-dark animate-fade-in">
                <ReactMarkdown>{analysis.summary}</ReactMarkdown>
              </div>
            )}
            {activeTab === "takeaways" && (
              <div className="space-y-3 animate-fade-in">
                {analysis.keyTakeaways.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/50
                                          border border-dark-700/50 hover:border-primary-500/20 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400
                                     flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <p className="text-dark-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "actions" && (
              <div className="space-y-3 animate-fade-in">
                {analysis.actionItems.length === 0 ? (
                  <p className="text-dark-500 text-sm text-center py-4">No action items found</p>
                ) : analysis.actionItems.map((item: ActionItem, i) => {
                  const cfg = priorityConfig[item.priority];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className={clsx("flex items-start gap-3 p-3 rounded-xl border", cfg.bg, cfg.border)}>
                      <Icon className={clsx("w-4 h-4 flex-shrink-0 mt-0.5", cfg.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-dark-200 text-sm">{item.task}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={clsx("text-xs font-medium", cfg.color)}>{item.priority} priority</span>
                          {item.deadline && <span className="text-xs text-dark-500">Due: {item.deadline}</span>}
                          {item.assignee && <span className="text-xs text-dark-500">→ {item.assignee}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === "topics" && (
              <div className="animate-fade-in">
                <p className="text-xs text-dark-500 mb-3">Topics extracted for YouTube recommendations</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.studyTopics.map((topic, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium
                                             bg-gradient-to-r from-primary-500/20 to-purple-500/20
                                             text-primary-300 border border-primary-500/20">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;