import React from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Phone,
  PhoneOff,
  Music,
  Plus,
  Check,
  Sparkles,
  Flame,
  ArrowLeft,
  X,
} from "lucide-react";
import { DigitalHuman } from "../types";

interface ShortsTabProps {
  companions: DigitalHuman[];
  focusedCompanionId?: string | null;
  onClearFocus?: () => void;
  onChat: (companion: DigitalHuman) => void;
  onToggleFollow: (companion: DigitalHuman) => void;
  followsDict: Record<string, boolean>;
  onOpenProfile: (companion: DigitalHuman) => void;
  isActiveChatOpen?: boolean;
  isActiveTab?: boolean;
}

export default function ShortsTab({
  companions,
  focusedCompanionId,
  onClearFocus,
  onChat,
  onToggleFollow,
  followsDict,
  onOpenProfile,
  isActiveChatOpen,
  isActiveTab = true,
}: ShortsTabProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [videoSlides, setVideoSlides] = React.useState<Array<{
    id: string;
    companion: DigitalHuman;
    videoUrl: string;
    videoIndex: number;
  }>>([]);

  React.useEffect(() => {
    // If not focused, we can keep the cached slides if they match companion sizes
    if (!focusedCompanionId && videoSlides.length > 0 && Math.abs(videoSlides.length - companions.length * 2) < 5) return;

    const list: Array<{
      id: string;
      companion: DigitalHuman;
      videoUrl: string;
      videoIndex: number;
    }> = [];

    const activeCompanionsList = focusedCompanionId
      ? companions.filter((c) => c.id === focusedCompanionId)
      : companions;

    activeCompanionsList.forEach((c) => {
      const vids = c.media?.filter((m) => m.type === "video") || [];
      if (vids.length > 0) {
        vids.forEach((v, idx) => {
          list.push({
            id: `${c.id}-${v.id || v.url?.split('/').pop()}`,
            companion: c,
            videoUrl: v.url,
            videoIndex: idx,
          });
        });
      }
    });

    // Fallback placeholder cover slide if character has no videos uploaded
    if (list.length === 0 && focusedCompanionId) {
      const fc = companions.find(hl => hl.id === focusedCompanionId);
      if (fc) {
        list.push({
          id: `${fc.id}-placeholder`,
          companion: fc,
          videoUrl: "",
          videoIndex: 0,
        });
      }
    }

    if (list.length === 0) return;

    // Shuffle only for the general tab; preserve exact media timeline order for focused companion's story progression
    if (!focusedCompanionId) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    setVideoSlides(list);
    setCurrentIndex(0);
  }, [companions.length, focusedCompanionId]);
  const currentSlide = videoSlides[currentIndex] || { id: "empty", companion: companions[0], videoUrl: "", videoIndex: 0 };
  const currentCompanion = { ...currentSlide.companion, initialVideoIndex: currentSlide.videoIndex };

  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [likedCompanions, setLikedCompanions] = React.useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = React.useState<Record<string, number>>({});
  const [activeWatchers, setActiveWatchers] = React.useState(1200);


  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Initialize random mock likes & watchers
  React.useEffect(() => {
    if (!currentCompanion || !currentCompanion.id) return;
    
    // Set a credible simulated likes count
    const compId = currentCompanion.id;
    if (!likesCount[compId]) {
      setLikesCount((prev) => ({
        ...prev,
        [compId]: Math.floor(25000 + (parseInt(compId.substring(0, 4), 16) || 42) * 45),
      }));
    }

    // Tick spectator counts to make feed feel live
    setActiveWatchers(Math.floor(8200 + Math.random() * 4500));
    if (isActiveChatOpen) return;

    const timer = setInterval(() => {
      setActiveWatchers((prev) => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 20));
    }, 3000);

    return () => clearInterval(timer);
  }, [currentCompanion.id, currentIndex, isActiveChatOpen]);

  // Force pause and set isPlaying to false when active chat opens or tab goes to background
  React.useEffect(() => {
    if (isActiveChatOpen || !isActiveTab) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      if (isPlaying && videoRef.current) {
        videoRef.current.play().catch(console.log);
      }
    }
  }, [isActiveChatOpen, isActiveTab, isPlaying]);

  // Restart video playback when index changes
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      // Only auto-play if the state is set to playing and tab is active and not in active chat
      if (isPlaying && !isActiveChatOpen && isActiveTab) {
        videoRef.current.play().catch((err) => console.log("Video play request handled:", err));
      }
    }
  }, [currentIndex, isActiveChatOpen, isActiveTab]);

  // Sync isPlaying state with HTML5 video playback
  React.useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isActiveChatOpen && isActiveTab) {
        videoRef.current.play().catch((err) => console.log("Playback error, resuming:", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isActiveChatOpen, isActiveTab]);

  const triggerViewCounter = () => {
    try {
      const currentVal = parseInt(localStorage.getItem("chatpai_shorts_swipe_count") || "0", 10);
      const newVal = currentVal + 1;
      localStorage.setItem("chatpai_shorts_swipe_count", newVal.toString());
      console.log("[PWA Swiper Tracking] Swipes registered:", newVal);
      window.dispatchEvent(new Event("chatpai_shorts_swiped"));

      // AD LOGIC inside Shorts
      let adCount = parseInt(sessionStorage.getItem("chatpai_session_swipe_since_ad") || "0", 10) + 1;
      let adThresholdVal = parseInt(sessionStorage.getItem("chatpai_ad_threshold") || "0", 10);
      if (!adThresholdVal || adThresholdVal < 5 || adThresholdVal > 8) {
        adThresholdVal = Math.floor(Math.random() * 4) + 5;
      }
      
      if (adCount >= adThresholdVal) {
         // Pause before showing ad
         setIsPlaying(false);
         // Small delay to ensure pause registers before ad overlay/redirect
         setTimeout(() => {
           window.dispatchEvent(new Event("chatpai_show_ad"));
         }, 100);

         sessionStorage.setItem("chatpai_session_swipe_since_ad", "0");
         sessionStorage.setItem("chatpai_ad_threshold", String(Math.floor(Math.random() * 4) + 5));
      } else {
         sessionStorage.setItem("chatpai_session_swipe_since_ad", String(adCount));
         sessionStorage.setItem("chatpai_ad_threshold", String(adThresholdVal));
      }
    } catch (e) {
      console.warn("Storage writing failed:", e);
    }
  };

  // Next / Prev handers
  const handleNext = () => {
    if (videoSlides.length === 0 || !isActiveTab) return;
    setIsPlaying(true);
    setCurrentIndex((prev) => (prev + 1) % videoSlides.length);
    triggerViewCounter();
  };

  const handlePrev = () => {
    if (videoSlides.length === 0 || !isActiveTab) return;
    setIsPlaying(true);
    setCurrentIndex((prev) => (prev - 1 + videoSlides.length) % videoSlides.length);
    triggerViewCounter();
  };

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        handlePrev();
      } else if (e.key === "ArrowDown") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoSlides]);

  if (!currentCompanion || !currentCompanion.id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 text-white min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <span className="text-sm text-zinc-400 font-sans mb-4">Connecting live video feeds...</span>
        {onClearFocus && (
          <button
            onClick={onClearFocus}
            className="mt-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        )}
      </div>
    );
  }

  // Touch Swipe navigation support
  const touchStartY = React.useRef(0);
  const touchStartTime = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - endY;
    const duration = Date.now() - touchStartTime.current;

    // Detect swipe
    if (Math.abs(diff) > 60 && duration < 500) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      return;
    }

    // If it was a short tap and not a swipe, toggle play/pause
    // Increased tolerance to 40 for slop and duration to 500
    if (Math.abs(diff) < 40 && duration < 500) {
      setIsPlaying(prev => !prev);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Only handle if not mobile (no touch start/end recently)
    // Actually simpler to just stop propagation and toggle, but we must avoid touch conflict
    if (Date.now() - touchStartTime.current < 600) return; 
    e.stopPropagation();
    setIsPlaying(prev => !prev);
  };

  // Parse remaining tags for presentation
  const isFollowed = !!followsDict[currentCompanion.id];
  const tagsList = (currentCompanion.desc || []).map((t) => {
    const idx = t.indexOf(":");
    return idx !== -1 ? t.substring(idx + 1) : t;
  });

  const getRelationshipTag = () => {
    const rel = currentCompanion.desc.find((d) => d.startsWith("relationship:"));
    if (rel) return rel.split(":")[1];
    const char = currentCompanion.desc.find((d) => d.startsWith("character:"));
    if (char) return char.split(":")[1];
    return "AI Companion";
  };


  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const compId = currentCompanion.id;
    const nextLiked = !likedCompanions[compId];
    setLikedCompanions((prev) => ({ ...prev, [compId]: nextLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [compId]: prev[compId] + (nextLiked ? 1 : -1),
    }));
  };

  const videoUrl = currentSlide.videoUrl;

  return (
    <div
      id="shorts-vertical-feed"
      className="flex-1 h-full bg-zinc-950 relative flex flex-col justify-between overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual Toast Notification Alert */}
      {toastMessage && (
        <div id="shorts-custom-toast" className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-indigo-500/30 backdrop-blur-md text-zinc-100 text-[11px] py-2 px-4 rounded-full shadow-lg shadow-black/50 font-sans tracking-wide flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Background looping full screen companion video */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            onEnded={handleNext}
            muted={isMuted}
            preload="auto"
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            poster={currentCompanion.avatar}
            referrerPolicy="no-referrer"
            onClick={handleVideoClick}
            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05]"
          />
        ) : (
          <img
            src={currentCompanion.avatar}
            alt={currentCompanion.name}
            className="w-full h-full object-cover filter brightness-[0.6] blur-sm animate-pulse"
          />
        )}

        {/* Video pause indicator overlay updated per user request to remove Play icons */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity duration-300">
            <div className="p-5 rounded-full bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 animate-pulse">
              <Flame className="w-10 h-10 text-pink-500 fill-pink-500 opacity-60" />
            </div>
          </div>
        )}
      </div>

      {/* Top Floating bar controls */}
      <div className="absolute top-[calc(max(44px,env(safe-area-inset-top))+4px)] inset-x-0 px-4 flex items-center justify-between z-10 pointer-events-none">
        
        {/* Left: Spacer (Clean Top) */}
        <div className="w-[44px]" /> 

        {/* Right: Audio control */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 backdrop-blur-md text-white transition-transform active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400 animate-bounce" />}
          </button>
          
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 text-white active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 text-white active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT FLOATING BUTTONS BAR - OVERLAID ON VIDEO */}
      <div className="absolute right-3 bottom-[calc(5.2rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-4.5 z-10 text-white">
        {/* Companion Avatar Follow action */}
        <div className="relative mb-2">
          <button
            onClick={() => onOpenProfile(currentCompanion)}
            className="w-12 h-12 rounded-full border-2 border-indigo-500 overflow-hidden shadow-lg hover:brightness-110 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <img
              src={currentCompanion.avatar}
              alt={currentCompanion.name}
              className="w-full h-full object-cover"
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(currentCompanion);
            }}
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 p-1 rounded-full border border-zinc-950 transition-all duration-300 cursor-pointer ${
              isFollowed ? "bg-green-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isFollowed ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
          </button>
        </div>

        {/* Animated Like Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={toggleLike}
            className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 active:scale-75 cursor-pointer ${
              likedCompanions[currentCompanion.id]
                ? "bg-red-500/85 border-red-400 text-white scale-110"
                : "bg-black/45 hover:bg-black/60 border-white/10 text-zinc-200"
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                likedCompanions[currentCompanion.id] ? "fill-white text-white" : ""
              }`}
            />
          </button>
          <span className="text-[10px] font-mono font-medium tracking-wide drop-shadow-md text-zinc-300">
            {(likesCount[currentCompanion.id] || 25000).toLocaleString()}
          </span>
        </div>

        {/* Start Chat Message Shortcut */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onChat(currentCompanion)}
            className="p-3 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 text-zinc-200 backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
          >
            <Flame className="w-5 h-5 text-pink-500 fill-pink-500" />
          </button>
          <span className="text-[10px] font-mono font-medium drop-shadow-md text-zinc-300">Flirt</span>
        </div>

        {/* Share profile card info */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Companion ${currentCompanion.name} on ChatPai`,
                  text: currentCompanion.bio,
                  url: window.location.href,
                }).catch((err) => console.log("Share failed:", err));
              } else {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`Companion ${currentCompanion.name} on ChatPai: ${currentCompanion.bio}`);
                }
                setToastMessage(`Copied @${currentCompanion.name} Profile link!`);
                setTimeout(() => {
                  setToastMessage(null);
                }, 2000);
              }
            }}
            className="p-3 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 text-zinc-200 backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-mono font-medium drop-shadow-md text-zinc-300">Share</span>
        </div>

        {/* Floating Rotating Disc Music icon */}
        <div className="w-9 h-9 rounded-full bg-black/60 border border-white/15 flex items-center justify-center animate-spin duration-10000 shrink-0">
          <Music className="w-4 h-4 text-indigo-400" />
        </div>
      </div>

      {/* BOTTOM METRICS, BIO & RELATIONSHIP SLATE OVERLAID */}
      <div className="absolute left-0 right-16 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] px-4.5 pb-2 text-white z-10 pointer-events-none">
        <div className="space-y-2 pointer-events-auto">
          {/* Subtle Focus Flow indicator integrated into bio area */}
          {focusedCompanionId && onClearFocus && (
            <div className="flex items-center gap-1.5 mb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="px-2 py-0.5 rounded-sm bg-pink-500/20 border border-pink-500/30 backdrop-blur-md flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[9px] font-black text-pink-300 uppercase tracking-[0.15em] drop-shadow-sm">
                  {currentCompanion.name}'s Flow
                </span>
              </div>
              <button
                onClick={onClearFocus}
                className="p-1 rounded-full bg-black/20 hover:bg-black/40 border border-white/5 transition-colors active:scale-90"
              >
                <X className="w-2.5 h-2.5 text-white/50" />
              </button>
            </div>
          )}

          {/* Main heading with age and relation label */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              onClick={() => onOpenProfile(currentCompanion)}
              className="text-base font-display font-extrabold tracking-wide drop-shadow-lg cursor-pointer hover:underline flex items-center gap-1"
            >
              @{currentCompanion.name}
              <span className="text-xs font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded ml-1">
                {currentCompanion.age} y/o
              </span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-semibold uppercase font-sans tracking-wide">
              {getRelationshipTag()}
            </span>
          </div>

          {/* Scrolling ticker of character details tags */}
          <div className="flex gap-1.5 flex-wrap max-h-12 overflow-y-auto no-scrollbar py-0.5">
            {tagsList.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="text-[9px] px-2 py-0.5 rounded bg-zinc-900/60 border border-white/10 text-zinc-300 font-sans backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Intimate story bio blurb */}
          <p className="text-[11px] text-zinc-300 leading-normal drop-shadow-md font-sans line-clamp-2 pr-4">
            {currentCompanion.bio || `Connect with ${currentCompanion.name} for high fidelity interactive roleplaying stories. Press Chat Me below!`}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            <span className="text-[9px] tracking-wide text-zinc-400 font-mono">
              Ready for private video session
            </span>
          </div>
        </div>
      </div>


    </div>
  );
}
