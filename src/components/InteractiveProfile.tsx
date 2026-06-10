import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Sparkles, Flame, PlayCircle, Lock, Unlock, Play, ChevronRight, X, Coins, Volume2, VolumeX, Heart, Zap } from "lucide-react";
import { DigitalHuman } from "../types";

interface InteractiveProfileProps {
  companion: DigitalHuman;
  onClose: () => void;
  onWatchShorts: () => void;
  onChat: () => void;
  userBalance: number;
  userId: string;
  onRefreshBalance?: () => void;
}

export default function InteractiveProfile({
  companion,
  onClose,
  onWatchShorts,
  onChat,
  userBalance,
  userId,
  onRefreshBalance,
}: InteractiveProfileProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [unlockingAction, setUnlockingAction] = useState<string | null>(null);
  const [pendingActionToPlay, setPendingActionToPlay] = useState<string | null>(null);
  
  const [playingActionKey, setPlayingActionKey] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      } else if (!document.hidden && videoRef.current && isPlaying) {
        videoRef.current.play().catch(e => console.log("video play error:", e));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying]);
  
  // Use interactive_key if provided, otherwise deduce from name instead of UUID ID
  const compKey = companion.interactive_key || (companion.name ? companion.name.toLowerCase() : "");

  const fetchProfile = async () => {
    try {
      const encodedKey = encodeURIComponent(compKey);
      const res = await fetch(`/api/interactive/characters/${encodedKey}/profile?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        if (!activeVideoUrl) {
          setActiveVideoUrl(data.character.welcome_video_url || data.character.idle_video_url);
        }
      }
    } catch (e) {
      console.error("Failed to load interactive profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [compKey, userId]);

  useEffect(() => {
    if (videoRef.current && activeVideoUrl) {
      videoRef.current.play().catch(e => console.log("video play error:", e));
    }
  }, [activeVideoUrl]);

  const handlePlayAction = async (action: any) => {
    if (action.can_play || action.unlocked || action.price_gold === 0) {
      setPlayingActionKey(action.action_key);
      try {
        const encodedKey = encodeURIComponent(compKey);
        const res = await fetch(`/api/interactive/characters/${encodedKey}/actions/${encodeURIComponent(action.action_key)}/play`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, client_event_id: Math.random().toString(36).substring(7) })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.video_url) {
            setActiveVideoUrl(data.video_url);
            // Refresh profile slightly later to get new relationship/level/xp
            setTimeout(fetchProfile, 800);
          }
        } else {
          const err = await res.json();
          console.error("Action error:", err);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setPlayingActionKey(null);
      }
    } else if (action.lock_reason === "need_unlock") {
      // Show unlock confirm dialog
      setPendingActionToPlay(action.action_key);
    } else if (action.lock_reason === "need_level") {
      // Just a hint, no boost modal until backend supports it
    }
  };

  const confirmUnlock = async () => {
    if (!pendingActionToPlay) return;
    const actionKey = pendingActionToPlay;
    const action = profileData?.actions?.find((a: any) => a.action_key === actionKey);
    if (!action) return;

    if (userBalance < action.price_gold) {
      alert("Insufficient GOLD. Please recharge."); // Or trigger top-up dialog
      setPendingActionToPlay(null);
      return;
    }

    setUnlockingAction(actionKey);
    try {
      const encodedKey = encodeURIComponent(compKey);
      const res = await fetch(`/api/interactive/characters/${encodedKey}/actions/${encodeURIComponent(actionKey)}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, idempotency_key: `interactive_unlock:${userId}:${compKey}:${actionKey}` })
      });
      if (res.ok) {
        // Success
        await handlePlayAction({ ...action, can_play: true, unlocked: true });
        setPendingActionToPlay(null);
        onRefreshBalance?.();
      } else {
        const err = await res.json();
        alert(`Unlock failed: ${err?.error?.message}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUnlockingAction(null);
    }
  };

  const getActionIcon = (actionKey: string, className = "w-6 h-6") => {
    const key = actionKey.toLowerCase();
    if (key.includes("butt") || key.includes("hip")) {
      return <Heart className={`${className} text-rose-300 fill-rose-500/20`} />;
    }
    if (key.includes("boob") || key.includes("breast") || key.includes("chest")) {
      return <Flame className={`${className} text-orange-300 fill-orange-500/10`} />;
    }
    if (key.includes("ahegao") || key.includes("face") || key.includes("tongue") || key.includes("mouth")) {
      return <Sparkles className={`${className} text-fuchsia-300`} />;
    }
    if (key.includes("tease") || key.includes("touch") || key.includes("flirt")) {
      return <Zap className={`${className} text-amber-300`} />;
    }
    return <Sparkles className={`${className} text-indigo-300`} />;
  };

  if (loading || !profileData) {
    return (
      <div className="absolute inset-0 z-50 bg-[#080514] flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full border-2 border-pink-500/30 border-t-pink-500 animate-spin mb-4" />
        <p className="text-white/60 text-[10px] tracking-[0.2em] font-medium uppercase">Loading...</p>
      </div>
    );
  }

  const { bond, actions } = profileData;

  const pendingActionData = pendingActionToPlay 
    ? actions.find((a: any) => a.action_key === pendingActionToPlay)
    : null;

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-700 overflow-hidden">
      {/* Immersive Background Video */}
      <div className="absolute inset-0 w-full h-full bg-zinc-950">
        {activeVideoUrl ? (
          <video
            key={activeVideoUrl}
            ref={videoRef}
            src={activeVideoUrl}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            loop={false}
            muted={isMuted}
            onEnded={() => {
              if (profileData && activeVideoUrl !== profileData.character.idle_video_url) {
                setActiveVideoUrl(profileData.character.idle_video_url);
              }
            }}
          />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center brightness-[0.5]"
            style={{ backgroundImage: `url(${companion.avatar})` }}
          />
        )}
        
        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Top Controls - Navigation */}
      <div className="absolute top-0 inset-x-0 z-30 p-6 pt-[calc(env(safe-area-inset-top)+16px)] flex items-start justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="p-3 rounded-2xl bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-indigo-300" />}
          </button>
        </div>
      </div>
      
      {/* Top Right - Stats */}
      <div className="absolute top-6 right-6 z-30 pt-[calc(env(safe-area-inset-top))] flex flex-col items-end gap-2 pointer-events-none">
        <div className="flex items-center gap-3 h-10 px-4 rounded-full bg-black/60 border border-white/10 backdrop-blur-none pointer-events-auto">
          <span className="text-[9px] font-bold text-white/50 tracking-[0.2em] uppercase">Bond</span>
          <div className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500 tabular-nums">
            LV.{bond?.level || 1}
          </div>
        </div>
        
        <div className="h-10 px-4 rounded-full bg-amber-950/40 border border-amber-500/20 flex items-center pointer-events-auto">
          <span className="text-[11px] font-bold text-amber-300 tabular-nums">{userBalance}G</span>
        </div>
      </div>

      <div className="absolute right-4 bottom-32 z-30 flex flex-col items-center gap-6 pointer-events-none">
        {/* Actions Column */}
        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar max-h-[60vh] pointer-events-auto pr-1">
          {actions?.map((action: any) => {
            const isPlayable = action.can_play || action.unlocked || action.price_gold === 0;
            const isLevelLocked = action.lock_reason === "need_level";
            const isGoldLocked = action.lock_reason === "need_unlock";
            
            let subText = "";
            if (!isPlayable) {
              if (isLevelLocked) subText = `LV.${action.level_required}`;
              else if (isGoldLocked) subText = `${action.price_gold}G`;
            }

            return (
              <div key={action.action_key} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => handlePlayAction(action)}
                  disabled={!!playingActionKey}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isPlayable 
                      ? "bg-black/60 border border-white/10 text-white hover:bg-black/80" 
                      : "bg-black/40 border border-white/5 text-white/30"
                  } ${playingActionKey === action.action_key ? "ring-2 ring-pink-500" : ""}`}
                >
                  {playingActionKey === action.action_key ? (
                    <div className="w-5 h-5 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin" />
                  ) : (
                    <div className="relative">
                      <div className={`transition-all duration-300 ${isPlayable ? "opacity-100" : "opacity-30 grayscale"}`}>
                        {getActionIcon(action.icon_key || (isGoldLocked ? "fire" : "sparkles"), "w-6 h-6")}
                      </div>
                      {!isPlayable && (
                        <div className="absolute -top-1 -right-1 flex items-center justify-center bg-black/60 rounded-full w-4 h-4 border border-white/10">
                          <Lock className="w-2 h-2 text-white/50" />
                        </div>
                      )}
                    </div>
                  )}
                </button>
                
                <div className="flex flex-col items-center">
                  <span className={`text-[8px] font-bold tracking-widest text-center max-w-[60px] uppercase ${isPlayable ? "text-white/80" : "text-white/60"}`}>
                    {action.display_name}
                  </span>
                  {subText && (
                    <span className="text-[9px] font-black text-amber-400 tracking-wider mt-0.5 bg-black/60 px-1 py-0 rounded">
                      {subText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls - IMMERSIVE BUBBLE */}
      <div className="absolute bottom-6 inset-x-6 z-30 flex items-center justify-center gap-4">
        <button
          onClick={onChat}
          className="flex-1 h-14 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 border border-white/10 text-white font-bold text-[15px] uppercase tracking-widest shadow-[0_10px_30px_rgba(244,63,94,0.3)] transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5" /> 
          FLIRT & CHAT
        </button>

        <button
          onClick={() => {
            if (videoRef.current) {
              if (isPlaying) videoRef.current.pause();
              else videoRef.current.play();
              setIsPlaying(!isPlaying);
            }
          }}
          className="w-14 h-14 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-90"
        >
          {isPlaying ? <PlayCircle className="w-7 h-7 opacity-80" /> : <Play className="w-6 h-6" />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}} />

      {/* Unlock Confirm Modal */}
      {pendingActionToPlay && pendingActionData && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#150e26] border border-pink-500/30 rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(236,72,153,0.15)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600" />
            <button onClick={() => setPendingActionToPlay(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 mt-2">
              <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
            </div>
            
            <h3 className="text-white font-display font-black text-lg mb-1 tracking-tight">Unlock Moment</h3>
            <p className="text-[14px] font-medium text-pink-300/80 mb-1">Getting closer to {companion.name}...</p>
            <p className="text-[15px] font-black text-white mb-5">"{pendingActionData.display_name}"</p>
            
            <div className="flex items-center gap-2 mb-6 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Value:</span>
              <span className="text-xl font-black text-amber-500 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                {pendingActionData.price_gold} <Coins className="w-4 h-4" />
              </span>
            </div>

            <button
              disabled={unlockingAction === pendingActionToPlay}
              onClick={confirmUnlock}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-white font-black text-[13px] uppercase tracking-[0.15em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              {unlockingAction === pendingActionToPlay ? "Experience Loading..." : "Unlock Experience"}
            </button>
            <p className="text-[9px] text-zinc-500 font-black tracking-[0.2em] mt-5 uppercase opacity-60">
              Your Wallet: {userBalance} GOLD
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
