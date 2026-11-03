import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Eye,
  Sliders,
  ArrowRight,
  Film,
  Music
} from 'lucide-react';
import { MakeoverVideo } from '../types';
import { useToast } from '../context/ToastContext';

interface MakeoverReelsSectionProps {
  onOpenBooking: (serviceId?: number) => void;
}

export const MakeoverReelsSection: React.FC<MakeoverReelsSectionProps> = ({ onOpenBooking }) => {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<MakeoverVideo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedVideos, setLikedVideos] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<'video' | 'compare'>('video');
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load makeover videos
  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error('Failed to load makeover videos:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filtered videos
  const filteredVideos = videos.filter((v) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'hair_color') {
      return v.category === 'hair_color' || v.category === 'hair';
    }
    return v.category === activeCategory;
  });

  const activeVideo = selectedVideoIndex !== null ? filteredVideos[selectedVideoIndex] : null;

  // Handle Like Button
  const handleLike = async (e: React.MouseEvent, videoId: number) => {
    e.stopPropagation();
    const alreadyLiked = likedVideos[videoId];

    setLikedVideos((prev) => ({ ...prev, [videoId]: !alreadyLiked }));
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, likes: (v.likes || 0) + (alreadyLiked ? -1 : 1) } : v
      )
    );

    if (!alreadyLiked) {
      showToast('Loved this makeover look! ❤️', 'success');
      try {
        await fetch(`/api/videos/${videoId}/like`, { method: 'POST' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Share Reel
  const handleShare = (e: React.MouseEvent, video: MakeoverVideo) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/#makeover-reels');
      showToast(`Link to "${video.title}" copied to clipboard!`, 'success');
    } else {
      showToast('Reel URL copied!', 'success');
    }
  };

  // Open reel modal
  const handleOpenReel = (index: number) => {
    setSelectedVideoIndex(index);
    setViewMode('video');
    setSliderPosition(50);
    setIsPlaying(true);
    setIsMuted(false);
    setAnimationProgress(0);

    const video = filteredVideos[index];
    if (video) {
      fetch(`/api/videos/${video.id}/view`, { method: 'POST' }).catch(() => {});
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v))
      );
    }
  };

  // Handle Play / Pause Toggle
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  // Handle Mute Toggle (controls both video audio & dedicated Indian background music)
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    if (audioRef.current) {
      if (nextMuted) {
        audioRef.current.pause();
      } else if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    showToast(nextMuted ? 'Muted' : 'Sound On 🎵', 'info');
  };

  // 1 Song per Video: Sync the dedicated music track for the active video
  useEffect(() => {
    if (activeVideo && audioRef.current) {
      const trackUrl = activeVideo.music_url || '/audio/raga-yaman-sitar.mp3';
      if (!audioRef.current.src.endsWith(trackUrl)) {
        audioRef.current.src = trackUrl;
      }
      audioRef.current.volume = 0.75;
      if (!isMuted && isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [activeVideo?.id, isMuted, isPlaying]);

  // Sync video play state on reel switch or mode switch
  useEffect(() => {
    if (selectedVideoIndex !== null && viewMode === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [selectedVideoIndex, viewMode]);

  // Navigate next/previous reel
  const handleNextReel = () => {
    if (selectedVideoIndex !== null && selectedVideoIndex < filteredVideos.length - 1) {
      handleOpenReel(selectedVideoIndex + 1);
    } else {
      handleOpenReel(0); // Loop to start
    }
  };

  const handlePrevReel = () => {
    if (selectedVideoIndex !== null && selectedVideoIndex > 0) {
      handleOpenReel(selectedVideoIndex - 1);
    } else {
      handleOpenReel(filteredVideos.length - 1);
    }
  };

  // Auto-play progress loop when in compare mode
  useEffect(() => {
    if (selectedVideoIndex === null || !isPlaying || viewMode === 'video') return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [selectedVideoIndex, isPlaying, viewMode]);

  // Keyboard navigation (Esc to close, Arrows to switch reels, Space to toggle play)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedVideoIndex === null) return;
      if (e.key === 'Escape') setSelectedVideoIndex(null);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNextReel();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrevReel();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideoIndex, filteredVideos.length, isPlaying]);

  return (
    <section id="makeover-reels" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#D4A5AC]/25">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE7EC] text-[#541224] text-xs font-bold uppercase tracking-widest border border-[#D4A5AC]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
            <span>Short Video Reels • Real Makeovers</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#541224] leading-tight">
            Watch the Transformation: <br />
            <span className="italic font-light text-[#B76E79]">Before & After Makeovers</span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Real salon guests, authentic transformations. Tap any reel to watch the glamorous makeover reveal and book your look.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Transformations', count: videos.length },
            { id: 'facial', label: '🌸 Facial Glow', count: videos.filter((v) => v.category === 'facial').length },
            { id: 'hair_spa', label: '🧖‍♀️ Hair Spa Therapy', count: videos.filter((v) => v.category === 'hair_spa').length },
            { id: 'hair_color', label: '🎨 Hair Colors & Balayage', count: videos.filter((v) => v.category === 'hair_color' || v.category === 'hair').length },
            { id: 'bridal', label: '👑 Royal Bridal Glam', count: videos.filter((v) => v.category === 'bridal').length },
            { id: 'festive', label: '✨ Festive Sagan Glam', count: videos.filter((v) => v.category === 'festive').length }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#541224] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeCategory === cat.id ? 'bg-[#FCE7EC] text-[#541224]' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 9:16 Vertical Reel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {filteredVideos.map((video, idx) => {
          const isLiked = likedVideos[video.id];

          return (
            <div
              key={video.id}
              onClick={() => handleOpenReel(idx)}
              className="group relative aspect-[9/16] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-[#D4A5AC]/40 hover:border-[#B76E79] flex flex-col justify-between bg-black"
            >
              {/* Background Poster Image */}
              <img
                src={video.after_image || video.thumbnail_url}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 group-hover:via-black/20 transition-all duration-300" />

              {/* Top Bar: Badges */}
              <div className="relative z-10 p-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                  <Play className="w-2.5 h-2.5 fill-current text-[#F4B8C5]" />
                  <span>REEL • {video.duration || '0:30'}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleLike(e, video.id)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-[#541224] transition-colors cursor-pointer group/like border border-white/20"
                  title="Like Makeover Reel"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-transform group-hover/like:scale-125 ${
                      isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {/* Center Play Button on Hover */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/50 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-[#541224]/80 transition-all duration-300">
                  <Play className="w-6 h-6 fill-white ml-0.5 text-white" />
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="relative z-10 p-5 space-y-2 text-white">
                {/* Dedicated Music Attribution */}
                {video.music_title && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-[#FCE7EC] border border-white/15">
                    <Music className="w-2.5 h-2.5 text-[#F4B8C5] shrink-0" />
                    <span className="truncate max-w-[140px]">{video.music_title.split('-')[0].trim()}</span>
                  </div>
                )}

                <h3 className="font-serif text-lg font-bold leading-snug text-white line-clamp-2 drop-shadow-sm group-hover:text-[#F8CAD5] transition-colors">
                  {video.title}
                </h3>

                {video.service_name && (
                  <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1.5 line-clamp-1">
                    <Sparkles className="w-3 h-3 text-[#F4B8C5] shrink-0" />
                    <span>{video.service_name}</span>
                  </p>
                )}

                {/* Footer Metrics */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-300 border-t border-white/15">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>{video.views ? `${(video.views / 1000).toFixed(1)}k` : '1.2k'} views</span>
                  </span>

                  <span className="flex items-center gap-1 text-[#F8CAD5] font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Watch Reel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MINIMALIST LUXURY REEL MODAL (Instagram / Shorts Style • Clean Controls) */}
      {/* --------------------------------------------------------------------- */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Close Button Top Right */}
          <button
            onClick={() => setSelectedVideoIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer hover:rotate-90"
            title="Close Reel (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow (Previous Reel) */}
          <button
            onClick={handlePrevReel}
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer hover:scale-110"
            title="Previous Makeover Reel"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow (Next Reel) */}
          <button
            onClick={handleNextReel}
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer hover:scale-110"
            title="Next Makeover Reel"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Central Vertical Player Card (9:16) */}
          <div className="relative w-full h-full sm:h-[92vh] sm:max-w-md sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between border border-white/15 select-none">
            {/* Top Navigation Bar: Minimal & Clean */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#F8CAD5]">
                  Reel {selectedVideoIndex! + 1} of {filteredVideos.length}
                </span>
              </div>

              {/* Clean View Mode Toggle (Only shown if Before photo exists) */}
              {activeVideo.before_image && (
                <div className="flex items-center bg-black/60 backdrop-blur-md p-0.5 rounded-full border border-white/20 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('video');
                      setIsPlaying(true);
                    }}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'video'
                        ? 'bg-[#541224] text-white font-bold shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Film className="w-3 h-3 text-[#F8CAD5]" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('compare')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'compare'
                        ? 'bg-[#541224] text-white font-bold shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3 text-[#F8CAD5]" />
                    <span>Before & After</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main Stage: Video Reel OR Before/After Compare */}
            {viewMode === 'video' ? (
              <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer bg-black"
                onClick={togglePlayPause}
              >
                {activeVideo.video_url ? (
                  <video
                    ref={videoRef}
                    key={activeVideo.video_url}
                    src={activeVideo.video_url}
                    poster={activeVideo.after_image || activeVideo.thumbnail_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={() => {
                      if (videoRef.current && videoRef.current.duration) {
                        setAnimationProgress(
                          (videoRef.current.currentTime / videoRef.current.duration) * 100
                        );
                      }
                    }}
                  />
                ) : (
                  <img
                    src={activeVideo.after_image || activeVideo.thumbnail_url}
                    alt={activeVideo.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Center Play Indicator when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/50 shadow-2xl scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-white ml-1 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-ew-resize bg-black"
                onMouseMove={(e) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  setSliderPosition((x / rect.width) * 100);
                }}
                onTouchMove={(e) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const touch = e.touches[0];
                  const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                  setSliderPosition((x / rect.width) * 100);
                }}
              >
                {/* Layer 1: AFTER MAKEOVER IMAGE (Full) */}
                <img
                  src={activeVideo.after_image || activeVideo.thumbnail_url}
                  alt={`${activeVideo.title} - After Makeover`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Layer 2: BEFORE MAKEOVER IMAGE (Clipped by Slider) */}
                {activeVideo.before_image && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={activeVideo.before_image}
                      alt={`${activeVideo.title} - Before Makeover`}
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{
                        width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                        height: containerRef.current ? `${containerRef.current.offsetHeight}px` : '100%'
                      }}
                    />
                    <div className="absolute top-16 left-4 z-20 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                      BEFORE
                    </div>
                  </div>
                )}

                {/* After Look Badge */}
                <div className="absolute top-16 right-4 z-20 px-3 py-1 rounded-full bg-[#541224]/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F4B8C5]" />
                  <span>AFTER GLAM</span>
                </div>

                {/* Draggable Divider Line */}
                <div
                  className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#541224] shadow-xl flex items-center justify-center font-bold text-xs border-2 border-[#541224]">
                    <Sliders className="w-4 h-4 text-[#541224]" />
                  </div>
                </div>

                <div className="absolute top-28 inset-x-0 mx-auto w-max px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium border border-white/15 pointer-events-none">
                  ← Slide to compare Before & After →
                </div>
              </div>
            )}

            {/* Right Side Floating Actions (Like, Mute, Share) */}
            <div className="absolute right-3.5 bottom-28 z-40 flex flex-col items-center gap-3.5 text-white">
              {/* Like Button */}
              <button
                type="button"
                onClick={(e) => handleLike(e, activeVideo.id)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
                title="Like Reel"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md group-hover:scale-115 ${
                    likedVideos[activeVideo.id]
                      ? 'bg-rose-500 text-white'
                      : 'bg-black/40 border border-white/25 text-white'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedVideos[activeVideo.id] ? 'fill-white text-white' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold">
                  {activeVideo.likes ? (activeVideo.likes / 1000).toFixed(1) + 'k' : '2.1k'}
                </span>
              </button>

              {/* Sound / Mute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="flex flex-col items-center gap-1 cursor-pointer group"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <div
                  className={`w-11 h-11 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md group-hover:scale-115 transition-all ${
                    !isMuted
                      ? 'bg-[#541224] text-white shadow-lg ring-2 ring-[#F4B8C5]'
                      : 'bg-black/40 text-white'
                  }`}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-gray-300" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-[#FCE7EC] animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-bold">{isMuted ? 'Muted' : 'Sound'}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={(e) => handleShare(e, activeVideo)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
                title="Share Reel"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 border border-white/25 text-white flex items-center justify-center backdrop-blur-md group-hover:scale-115 transition-all">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Share</span>
              </button>
            </div>

            {/* Hidden Dedicated Audio Player (1 song assigned per video) */}
            <audio
              ref={audioRef}
              src={activeVideo.music_url || '/audio/raga-yaman-sitar.mp3'}
              loop
              preload="auto"
            />

            {/* Bottom Scrim & Reel Caption Area */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-5 pt-8 bg-gradient-to-t from-black via-black/85 to-transparent space-y-3 text-white">
              {/* Progress Bar */}
              <div className="w-full bg-white/25 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#B76E79] h-full transition-all duration-300"
                  style={{ width: `${animationProgress}%` }}
                />
              </div>

              {/* 1 Song Per Video: Clean Minimalist Music Attribution Pill */}
              <button
                type="button"
                onClick={toggleMute}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white/90 border border-white/20 transition-all text-xs cursor-pointer group"
                title={isMuted ? 'Tap to unmute music' : 'Tap to mute music'}
              >
                <Music
                  className={`w-3.5 h-3.5 text-[#F4B8C5] shrink-0 ${!isMuted && isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
                <span className="truncate max-w-[200px] text-[11px] font-medium text-[#FCE7EC]">
                  {activeVideo.music_title || 'Durga Salon Music'}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isMuted ? 'bg-rose-500/40 text-rose-200' : 'bg-emerald-500/40 text-emerald-200'
                  }`}
                >
                  {isMuted ? 'Muted' : 'Sound On 🎵'}
                </span>
              </button>

              {/* Caption & Service Info */}
              <div className="space-y-1 pr-14">
                <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight text-white drop-shadow-sm">
                  {activeVideo.title}
                </h3>
                {activeVideo.service_name && (
                  <p className="text-[11px] text-[#F8CAD5] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#F4B8C5] shrink-0" />
                    <span>{activeVideo.service_name}</span>
                  </p>
                )}
              </div>

              {/* Direct Booking CTA Button */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVideoIndex(null);
                    onOpenBooking(activeVideo.service_id || undefined);
                  }}
                  className="flex-1 py-3 px-5 rounded-full text-xs font-bold uppercase tracking-wider text-white maroon-gradient shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98 transition-all border border-[#D4A5AC]/40"
                >
                  <Calendar className="w-4 h-4 text-[#F4B8C5]" />
                  <span>Book This Makeover Look</span>
                </button>

                <div className="flex sm:hidden gap-1">
                  <button
                    onClick={handlePrevReel}
                    className="p-2.5 rounded-full bg-white/20 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextReel}
                    className="p-2.5 rounded-full bg-white/20 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default MakeoverReelsSection;
