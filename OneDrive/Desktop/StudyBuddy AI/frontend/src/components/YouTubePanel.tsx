"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Youtube, ExternalLink, Play, Search, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { YouTubeVideo } from "@/types";
import clsx from "clsx";

interface YouTubePanelProps { videos: YouTubeVideo[]; isLoading?: boolean; studyTopics?: string[]; }

const YouTubePanel: React.FC<YouTubePanelProps> = ({ videos, isLoading = false, studyTopics = [] }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [page,          setPage]          = useState(0);
  const PER_PAGE = 6;

  const filteredVideos = selectedTopic === "all" ? videos :
    videos.filter((v) =>
      v.title.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      v.description.toLowerCase().includes(selectedTopic.toLowerCase())
    );

  const totalPages = Math.ceil(filteredVideos.length / PER_PAGE);
  const pageVideos = filteredVideos.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const formatViews = (views?: string) => {
    if (!views) return null;
    const n = parseInt(views);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K views`;
    return `${n} views`;
  };

  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-5 py-4 border-b border-dark-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Youtube className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-dark-100">Recommended Videos</h3>
              <p className="text-xs text-dark-500">{videos.length} videos based on your study topics</p>
            </div>
          </div>
          {videos.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              {filteredVideos.length} results
            </span>
          )}
        </div>
        {studyTopics.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", ...studyTopics.slice(0, 6)].map((topic) => (
              <button key={topic} onClick={() => { setSelectedTopic(topic); setPage(0); }}
                className={clsx(
                  "flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap",
                  selectedTopic === topic
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-dark-800 text-dark-400 border border-dark-700 hover:text-dark-200"
                )}>
                {topic === "all" ? "All Topics" : topic}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-dark-800/50">
                <div className="skeleton h-36 w-full" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-3 rounded w-full" />
                  <div className="skeleton h-3 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-10">
            <Youtube className="w-12 h-12 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400 text-sm font-medium mb-1">No videos yet</p>
            <p className="text-dark-600 text-xs">Videos will appear after AI analysis</p>
          </div>
        ) : pageVideos.length === 0 ? (
          <div className="text-center py-10">
            <Search className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-500 text-sm">No videos found for &quot;{selectedTopic}&quot;</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageVideos.map((video) => (
                <a key={video.videoId} href={video.url} target="_blank" rel="noopener noreferrer"
                   className="yt-card rounded-xl overflow-hidden bg-dark-800/50 block group">
                  <div className="relative aspect-video overflow-hidden bg-dark-900">
                    <Image src={video.thumbnail} alt={video.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                                    transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80
                                       text-white text-xs font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />{video.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-dark-100 text-xs font-semibold line-clamp-2 leading-relaxed mb-1.5
                                   group-hover:text-primary-300 transition-colors">{video.title}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-dark-500 text-xs truncate flex-1">{video.channelTitle}</p>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {video.viewCount && (
                          <span className="text-dark-600 text-xs flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" />{formatViews(video.viewCount)}
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 text-dark-600 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-400
                             hover:text-dark-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-dark-400">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-400
                             hover:text-dark-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default YouTubePanel;