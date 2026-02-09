"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { cn } from "@skill-learn/lib/utils.js";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  let videoId = null;
  if (trimmed.includes("youtube.com/watch?v=")) {
    const match = trimmed.match(/[?&]v=([^&]+)/);
    videoId = match ? match[1] : null;
  } else if (trimmed.includes("youtu.be/")) {
    const match = trimmed.match(/youtu\.be\/([^?&]+)/);
    videoId = match ? match[1] : null;
  } else if (trimmed.includes("youtube.com/embed/")) {
    const match = trimmed.match(/embed\/([^?&]+)/);
    videoId = match ? match[1] : null;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
}

export default function LessonVideoPlayer({ src, className, onProgress, onEnded }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverControls, setHoverControls] = useState(false);
  const progressIntervalRef = useRef(null);

  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);
  const isYouTube = !!youtubeEmbedUrl;

  const togglePlay = useCallback(() => {
    if (isYouTube) return;
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    }
  }, [isYouTube]);

  const seek = useCallback(
    (e) => {
      if (isYouTube || !videoRef.current || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const time = pct * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    },
    [isYouTube, duration]
  );

  const toggleMute = useCallback(() => {
    if (isYouTube) return;
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  }, [isYouTube]);

  const setVol = useCallback(
    (e) => {
      if (isYouTube) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const v = Math.max(0, Math.min(1, x / rect.width));
      if (videoRef.current) {
        videoRef.current.volume = v;
        videoRef.current.muted = v === 0;
        setVolume(v);
        setMuted(v === 0);
      }
    },
    [isYouTube]
  );

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || isYouTube) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDurationChange = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      onEnded?.();
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnd);

    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDurationChange);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnd);
    };
  }, [isYouTube, onEnded]);

  useEffect(() => {
    if (isYouTube) return;
    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current && playing) {
        const pct = duration ? (videoRef.current.currentTime / duration) * 100 : 0;
        onProgress?.(pct);
      }
    }, 2000);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [playing, duration, isYouTube, onProgress]);

  if (!src || !src.trim()) {
    return (
      <div
        className={cn(
          "flex items-center justify-center aspect-video bg-muted rounded-lg text-muted-foreground",
          className
        )}
      >
        <p>No video URL for this lesson.</p>
      </div>
    );
  }

  if (isYouTube) {
    return (
      <div className={cn("relative w-full rounded-lg overflow-hidden bg-black", className)}>
        <div className="aspect-video">
          <iframe
            src={youtubeEmbedUrl}
            title="Lesson video"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full rounded-lg overflow-hidden bg-black group",
        className
      )}
      onMouseEnter={() => setHoverControls(true)}
      onMouseLeave={() => setHoverControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-contain"
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Progress bar - always visible at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 cursor-pointer"
        onClick={seek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          }
          if (e.key === "ArrowRight" && videoRef.current) {
            videoRef.current.currentTime = Math.min(
              duration,
              videoRef.current.currentTime + 5
            );
          }
        }}
      >
        <div
          className="h-full bg-brand-teal transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Controls bar */}
      <div
        className={cn(
          "absolute bottom-1 left-0 right-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/90 to-transparent transition-opacity",
          hoverControls || !playing ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          type="button"
          onClick={togglePlay}
          className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <span className="text-white/90 text-sm tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1" />

        {/* Volume */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded text-white hover:bg-white/20"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <div
            className="w-20 h-1.5 bg-white/30 rounded-full cursor-pointer overflow-hidden"
            onClick={setVol}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={muted ? 0 : Math.round(volume * 100)}
          >
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(muted ? 0 : volume) * 100}%` }}
            />
          </div>
        </div>

        {/* Playback rate */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRateMenu((s) => !s)}
            className="flex items-center gap-1 px-2 py-1.5 rounded text-white/90 text-sm hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{playbackRate}x</span>
          </button>
          {showRateMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setShowRateMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-1 py-1 bg-black/95 rounded shadow-lg z-20 min-w-[80px]">
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.playbackRate = rate;
                        setPlaybackRate(rate);
                        setShowRateMenu(false);
                      }
                    }}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-sm text-white hover:bg-white/20",
                      playbackRate === rate && "bg-white/20"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded text-white hover:bg-white/20"
          aria-label="Fullscreen"
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
