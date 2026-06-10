import React from "react";
import { 
  ArrowLeft, 
  Flame, 
  Heart, 
  Play, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Coins, 
  Lock, 
  Unlock, 
  Sparkle,
  Smile,
  Shield,
  Film,
  X,
  RotateCcw,
  Plus,
  Grid
} from "lucide-react";
import { DigitalHuman, Message } from "../types";
import { useFastVideoAPI } from "../hooks/useFastVideoAPI";

// Helper functions for parsing covering images and generating absolute paths
const getVideoCoverUrl = (videoUrl: string, companionAvatar: string): string => {
  if (!videoUrl) return companionAvatar;
  let normalizedUrl = videoUrl;
  if (normalizedUrl.includes("/video-library/")) {
    normalizedUrl = normalizedUrl.replace("/video-library/", "/videos/");
  }
  if (normalizedUrl.includes("/videos/")) {
    let coverUrl = normalizedUrl.replace("/videos/", "/cover/");
    const lastDotIdx = coverUrl.lastIndexOf(".");
    if (lastDotIdx !== -1) {
      coverUrl = coverUrl.substring(0, lastDotIdx) + ".jpg";
    }
    return coverUrl;
  }
  return companionAvatar;
};

const makeUrlAbsolute = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${window.location.origin}${normalizedPath}`;
};

const getCharacterKey = (companion: DigitalHuman): string => {
  if (companion.interactive_key) return companion.interactive_key;
  if (companion.id?.startsWith("ich_")) {
    return companion.id.replace("ich_", "").toLowerCase();
  }
  return companion.name?.toLowerCase() || "";
};

interface ChatWindowProps {
  companion: DigitalHuman;
  messages: Message[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onSend: (customText?: string) => void;
  onBack: () => void;
  isGenerating: boolean;
  relationStats?: {
    affinity: number;
    level: number;
    xp: number;
    xp_to_next: number;
  };
  onStatsChange?: (stats: { affinity: number; level: number; xp: number; xp_to_next: number }) => void;
  onPlay?: () => void;
  onOpenProfile?: () => void;
  onSaveGenerationRecord: (record: any) => void;
  authToken?: string;
  userId?: string;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

export default function ChatWindow({
  companion,
  messages,
  inputValue,
  onInputChange,
  onSend,
  onBack,
  isGenerating,
  relationStats,
  onStatsChange,
  onPlay,
  onOpenProfile,
  authToken,
  userId,
  gold,
  setGold,
  onSaveGenerationRecord,
}: ChatWindowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Filter out and extract background looping companion videos
  const companionVideos = React.useMemo(() => {
    return companion.media?.filter((m) => m.type === "video") || [];
  }, [companion.media]);

  // Track currently active video URL (starts as companion default)
  const [currentVideoUrl, setCurrentVideoUrl] = React.useState<string>(() => {
    const defaultIndex = companion.initialVideoIndex ?? 0;
    const defaultVideo = companionVideos[defaultIndex] || companionVideos[0];
    return defaultVideo?.url || "";
  });

  const [mediaError, setMediaError] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [videoFit, setVideoFit] = React.useState<"cover" | "contain">("cover");
  const [isVideoCollapsed, setIsVideoCollapsed] = React.useState(false);
  
  // Action unlock mappings
  const [unlockedActions, setUnlockedActions] = React.useState<string[]>(() => {
    const stored = localStorage.getItem(`chatpai_unlocked_${companion.id}`);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem(`chatpai_unlocked_${companion.id}`, JSON.stringify(unlockedActions));
  }, [unlockedActions, companion.id]);

  // Action sub-caption and active play state triggers
  const [actionSubtitle, setActionSubtitle] = React.useState<string | null>(null);
  const [activeActionId, setActiveActionId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  // Premium UI stage modes & overlay controls
  const [uiMode, setUiMode] = React.useState<"chat" | "actions" | "video-focus">("chat");
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [pendingUnlockAction, setPendingUnlockAction] = React.useState<any | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "free" | "unlockable" | "locked">("all");

  // Interactive character state loaders
  const [interactiveProfile, setInteractiveProfile] = React.useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  const fetchInteractiveProfile = React.useCallback(() => {
    if (!companion.isInteractive || !userId) return;

    const charKey = getCharacterKey(companion);
    setIsProfileLoading(true);

    const encodedKey = encodeURIComponent(charKey);
    fetch(`/api/interactive/characters/${encodedKey}/profile?user_id=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load interactive profile");
        return res.json();
      })
      .then((data) => {
        setInteractiveProfile(data);
        if (data.bond && onStatsChange) {
          onStatsChange({
            affinity: data.bond.affinity,
            level: data.bond.level,
            xp: data.bond.xp,
            xp_to_next: data.bond.next_level_xp || 30
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching interactive profile:", err);
      })
      .finally(() => {
        setIsProfileLoading(false);
      });
  }, [companion.id, userId, onStatsChange]);

  React.useEffect(() => {
    fetchInteractiveProfile();
  }, [fetchInteractiveProfile]);

  const playInteractiveAction = async (action: any, e?: React.MouseEvent) => {
    if (e) triggerFloatingHearts(e);

    const charKey = getCharacterKey(companion);
    setIsActionLoading(true);

    try {
      const encodedKey = encodeURIComponent(charKey);
      const response = await fetch(`/api/interactive/characters/${encodedKey}/actions/${encodeURIComponent(action.action_key)}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, client_event_id: Math.random().toString(36).substring(7) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || "Error playing action");
      }

      const data = await response.json();
      if (data.video_url) {
        setCurrentVideoUrl(data.video_url);
        setMediaError(false);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(() => {});
          }
        }, 50);
      }

      setActiveActionId(action.id);
      setActionSubtitle(data.character_message || action.subtitle);

      setTimeout(() => {
        setActionSubtitle((prev) => (prev === (data.character_message || action.subtitle) ? null : prev));
        setActiveActionId((prev) => (prev === action.id ? null : prev));
      }, 7000);

      if (data.progress_after && onStatsChange) {
        onStatsChange({
          affinity: data.progress_after.affinity,
          level: data.progress_after.level,
          xp: data.progress_after.xp,
          xp_to_next: data.progress_after.next_level_xp || 30
        });
      }

      if (data.progress_after) {
        fetchInteractiveProfile();
      }

      const simulatedActionText = `*Triggers physical flirt action: ${action.name}*`;
      onSend(simulatedActionText);

    } catch (err: any) {
      console.error("Action play failure:", err);
      showToast(err.message || "Failed playing interactive action");
    } finally {
      setIsActionLoading(false);
    }
  };

  const unlockInteractiveActionSubmit = async (action: any, e: React.MouseEvent) => {
    const charKey = getCharacterKey(companion);
    setIsActionLoading(true);

    try {
      const encodedKey = encodeURIComponent(charKey);
      const response = await fetch(`/api/interactive/characters/${encodedKey}/actions/${encodeURIComponent(action.action_key)}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, idempotency_key: `interactive_unlock:${userId}:${charKey}:${action.action_key}` }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 402 || errorData?.error?.code === "insufficient_balance") {
          showToast("Insufficient Gold! Click the Coins at top to reload points! 💰");
          return;
        }
        throw new Error(errorData?.error?.message || "Error unlocking action");
      }

      const data = await response.json();
      if (data.wallet && typeof data.wallet.balance_after === "number") {
        setGold(data.wallet.balance_after);
      }
      showToast(`Unlocked "${action.name}" action! 💖`);
      setPendingUnlockAction(null);

      await playInteractiveAction(action, e);

    } catch (err: any) {
      console.error("Unlock action failure:", err);
      showToast(err.message || "Failed to unlock interactive action");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Integrate FastVideo custom AI rendering engine
  const { 
    generate: generateFastVideo, 
    taskId, 
    taskStatus, 
    taskResult, 
    loading: isGeneratingVideo, 
    error: videoGenError 
  } = useFastVideoAPI(authToken || "");

  // Active fast video payload receiver
  React.useEffect(() => {
    console.log("[ChatWindow] Checking FastVideo status update:", { taskStatus, taskResult, videoGenError });
    if ((taskStatus === "SUCCESS" || taskStatus === "COMPLETED" || taskStatus === "SUCCEEDED") && taskResult) {
      const generatedUrl = 
        taskResult.data?.video_url || 
        taskResult.data?.videoUrl || 
        taskResult.video_url || 
        taskResult.videoUrl ||
        taskResult.data?.data?.data?.[0]?.url;

      if (generatedUrl) {
        console.log("[ChatWindow FastVideo Success] Play URL:", generatedUrl);
        setCurrentVideoUrl(generatedUrl);
        setMediaError(false);

        // Save record (assuming needed to fix "missing in profile" issue)
        console.log("[ChatWindow] Saving generation record:", { taskId, companionName: companion.name });
        onSaveGenerationRecord({
          id: taskId,
          companionName: companion.name,
          companionAvatar: companion.avatar,
          prompt: taskResult.prompt || "Generated Video",
          videoUrl: generatedUrl,
          status: "SUCCESS",
          createdAt: Date.now()
        });

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch((e) => {
              // Ignore benign interruption or pause-to-save-power errors from background play
              if (e.name !== "AbortError" && !e.message?.includes("interrupted")) {
                console.warn("[ChatWindow] Video play interrupted or paused:", e);
              }
            });
          }
        }, 50);
      } else {
        console.error("[ChatWindow FastVideo] Success status received but no URL in result:", taskResult);
      }
    } else if (taskStatus === "FAILED" || taskStatus === "ERROR" || videoGenError) {
      console.error("[ChatWindow FastVideo Failed]:", videoGenError, taskResult);
      showToast(videoGenError || "FastVideo generation failed, using loop video instead.");
    }
  }, [taskId, taskStatus, taskResult, videoGenError]);

  // Sync isMuted state with HTML5 video element
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating, actionSubtitle]);

  // Define structured, spicy flirting levels exactly like detail modal
  const playActionLevels = React.useMemo(() => {
    const mediaCount = companionVideos.length || 1;
    return [
      {
        levelName: "Lv.1 Flirty Gaze",
        levelNumber: 1,
        actions: [
          {
            id: "action-ahegao",
            name: "Lustful Gaze",
            cost: 0,
            mediaIndex: 0,
            isFastVideo: true,
            subtitle: `*eyes go soft and flirty, gazing intensely with a cute, teasing blush* "Do my faces capture your complete attention? Ah~ ...♥"`,
          },
          {
            id: "action-panty",
            name: "Bashful Smile",
            cost: 9,
            mediaIndex: 1 % mediaCount,
            isFastVideo: true,
            subtitle: `*gently plays with her dress lining, glancing away with a sly grin* "Does this view make your heart beat faster, love? Let's take it secret...♥"`,
          },
        ],
      },
      {
        levelName: "Lv.2 Playful Tease",
        levelNumber: 2,
        actions: [
          {
            id: "action-fours",
            name: "Shoulder Reveal",
            cost: 29,
            mediaIndex: 2 % mediaCount,
            isFastVideo: true,
            subtitle: `*turns around arched playfully, winking back at you seductive* "I'm always ready for whatever story you wish to direct in our private chat...♥"`,
          },
        ],
      },
      {
        levelName: "Lv.3 Suggestive Focus",
        levelNumber: 3,
        actions: [
          {
            id: "action-undress-trial",
            name: "Undress Trial",
            cost: 0,
            mediaIndex: 3 % mediaCount,
            isFastVideo: true,
            isSpicy: true,
            subtitle: `*reeling up AI live rendering models... please wait as she undresses for you* "Let me dream a complete dream for you tonight... look at me carefully...♥"`,
          },
        ],
      },
      {
        levelName: "Lv.4 Intimate Bond",
        levelNumber: 4,
        actions: [
          {
            id: "action-full",
            name: "Full Action",
            cost: 99,
            mediaIndex: 4 % mediaCount,
            isFastVideo: true,
            isSpicy: true,
            subtitle: `*unlocking full intimate motion sequence* "Now that we are close... let me show you my real side...♥"`,
          },
        ],
      },
    ];
  }, [companionVideos, companion.name]);

  // Flat view of actions with level details attached
  const flatActionsList = React.useMemo(() => {
    let result: any[] = [];
    
    // For interactive humans, we primarily use the backend-defined actions
    if (companion.isInteractive && interactiveProfile && Array.isArray(interactiveProfile.actions)) {
      result = interactiveProfile.actions.map((act: any) => ({
        id: act.action_key,
        action_key: act.action_key,
        name: act.display_name,
        cost: act.price_gold,
        price_gold: act.price_gold,
        levelNumber: act.level_required || 1,
        bond_required: act.bond_required || 0,
        levelName: `Lv.${act.level_required || 1} Gate`,
        can_play: act.can_play,
        unlocked: act.unlocked,
        lock_reason: act.lock_reason,
        isFastVideo: false,
        subtitle: `*starts playing ${act.display_name} sequence...*`
      }));
    } else {
      // For standard humans, we use our local tiers
      result = playActionLevels.flatMap((lvl) => 
        lvl.actions.map(act => ({
          ...act,
          levelNumber: lvl.levelNumber,
          levelName: lvl.levelName
        }))
      );
    }

    // SPECIAL: Always inject "Undress Trial" if it's missing (it's our core free feature)
    if (companion.isInteractive && interactiveProfile) {
      if (!result.some(a => a.id === "action-undress-trial" || a.name === "Undress Trial")) {
        const globalActions = playActionLevels.flatMap(lvl => lvl.actions.map(act => ({ 
          ...act, 
          levelNumber: lvl.levelNumber, 
          levelName: lvl.levelName 
        })));
        const trial = globalActions.find(a => a.id === "action-undress-trial");
        if (trial) {
          result.push(trial);
        }
      }
    }

    return result;
  }, [companion.isInteractive, interactiveProfile, playActionLevels]);

  // Helper to determine precise state of an action
  const getActionStatus = React.useCallback((act: any) => {
    // Global free actions are always unlocked regardless of companion type
    if (act.id === "action-undress-trial" || act.cost === 0) return "unlocked";

    if (companion.isInteractive) {
      // Backend-managed interactive lifecycle
      if (act.can_play) return "unlocked";
      if (act.lock_reason === "need_unlock") return "unlockable";
      return "locked";
    }

    // Local-managed offline fallback lifestyle
    const isUnlocked = unlockedActions.includes(act.id);
    if (isUnlocked) {
      return "unlocked";
    }
    const affinityLevel = relationStats?.level ?? 1;
    if (affinityLevel >= act.levelNumber) {
      return "unlockable";
    }
    return "locked";
  }, [companion.isInteractive, unlockedActions, relationStats?.level]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const triggerFloatingHearts = (e: React.MouseEvent) => {
    const parentRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - parentRect.left + e.currentTarget.offsetLeft - 12;
    const y = e.clientY - parentRect.top + e.currentTarget.offsetTop - 24;
    const newHeart = { id: Date.now() + Math.random(), x, y };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  // Click on a premium action pill
  const handleTriggerActionInChat = (action: any, e: React.MouseEvent) => {
    e.stopPropagation();

    // Determine status
    const status = getActionStatus(action);
    if (status === "locked") {
      if (companion.isInteractive) {
        if (action.lock_reason === "need_level") {
          showToast(`🔓 Reach Bond Level ${action.levelNumber} to unlock "${action.name}"! 💕`);
        } else if (action.lock_reason === "need_bond") {
          showToast(`🔓 Reach Affinity ${action.bond_required} to unlock "${action.name}"! 💕`);
        } else {
          showToast(`This action is gated at this moment.`);
        }
      } else {
        showToast(`🔓 Reach Bond Level ${action.levelNumber} to unlock "${action.name}"! 💕`);
      }
      return;
    }

    if (status === "unlockable") {
      // Set to pending unlock for inline confirmation bar, instead of direct unlock!
      setPendingUnlockAction(action);
      return;
    }

    if (companion.isInteractive && action.action_key) {
      playInteractiveAction(action, e);
      return;
    }

    // Otherwise play the unlocked / free action!
    triggerFloatingHearts(e);

    // Play action video reaction
    if (action.isFastVideo) {
      const firstFrameUrl = getVideoCoverUrl(currentVideoUrl, companion.avatar);
      const absoluteFirstFrameUrl = makeUrlAbsolute(firstFrameUrl);
      const promptText = `The woman quickly takes off clothes. She becomes completely naked and undressed. Woman revealing her breasts. The woman reveals her outie vagina and pussy. NSFW. Nude. One scene. One Cut.`;
      
      generateFastVideo({
        model: "NSFW2.2-turbo",
        prompt: promptText,
        image: absoluteFirstFrameUrl,
        first_frame_image: absoluteFirstFrameUrl,
        image_url: absoluteFirstFrameUrl,
        input_image_url: absoluteFirstFrameUrl,
        width: 272,
        height: 480,
        seed: 12345
      });
    } else {
      const selectedMedia = companion.media?.[action.mediaIndex];
      if (selectedMedia && selectedMedia.url) {
        setCurrentVideoUrl(selectedMedia.url);
        setMediaError(false);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(() => {});
          }
        }, 50);
      }
    }

    // High fidelity active details
    setActiveActionId(action.id);
    setActionSubtitle(action.subtitle);

    // Clear subtitle overlay after 7 seconds
    setTimeout(() => {
      setActionSubtitle((prev) => (prev === action.subtitle ? null : prev));
      setActiveActionId((prev) => (prev === action.id ? null : prev));
    }, 7000);

    // Dispatch simulated user interaction into Chat history stream!
    const simulatedActionText = `*Triggers physical flirt action: ${action.name}*`;
    onSend(simulatedActionText);
  };

  // Perform transaction and activate video playback on confirmation
  const handleConfirmUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pendingUnlockAction) return;

    if (companion.isInteractive && pendingUnlockAction.action_key) {
      unlockInteractiveActionSubmit(pendingUnlockAction, e);
      return;
    }

    const action = pendingUnlockAction;
    if (gold < action.cost) {
      showToast("Insufficient Gold! Click the Coins at top to reload points! 💰");
      return;
    }

    // Deduct and add to unlocked list
    setGold((prev) => prev - action.cost);
    setUnlockedActions((prev) => [...prev, action.id]);
    showToast(`Unlocked "${action.name}" action! 💖`);
    setPendingUnlockAction(null);

    // Trigger action simulation
    triggerFloatingHearts(e);

    // Play action video reaction
    if (action.isFastVideo) {
      const firstFrameUrl = getVideoCoverUrl(currentVideoUrl, companion.avatar);
      const absoluteFirstFrameUrl = makeUrlAbsolute(firstFrameUrl);
      const promptText = `A beautiful, photorealistic, HD digital human ${companion.name} performing action: ${action.name}. Natural cinematic lighting, close up vertical video, smooth movement, highly immersive realism.`;
      
      generateFastVideo({
        model: "NSFW2.2-turbo",
        prompt: promptText,
        image: absoluteFirstFrameUrl,
        first_frame_image: absoluteFirstFrameUrl,
        image_url: absoluteFirstFrameUrl,
        input_image_url: absoluteFirstFrameUrl,
        width: 272,
        height: 480,
        seed: 12345
      });
    } else {
      const selectedMedia = companion.media?.[action.mediaIndex];
      if (selectedMedia && selectedMedia.url) {
        setCurrentVideoUrl(selectedMedia.url);
        setMediaError(false);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(() => {});
          }
        }, 50);
      }
    }

    // Set details
    setActiveActionId(action.id);
    setActionSubtitle(action.subtitle);

    // Clear subtitle overlay after 7 seconds
    setTimeout(() => {
      setActionSubtitle((prev) => (prev === action.subtitle ? null : prev));
      setActiveActionId((prev) => (prev === action.id ? null : prev));
    }, 7000);

    // Dispatch simulated user interaction into Chat history stream!
    const simulatedActionText = `*Unlocks and triggers physical flirt action: ${action.name}*`;
    onSend(simulatedActionText);
  };

  // Restore camera to idle stream state
  const handleBackToIdle = React.useCallback(() => {
    const defaultIndex = companion.initialVideoIndex ?? 0;
    const defaultVideo = companionVideos[defaultIndex] || companionVideos[0];
    setCurrentVideoUrl(defaultVideo?.url || "");
    setMediaError(false);
    setActiveActionId(null);
    setActionSubtitle(null);
    showToast("Restored camera to live idle stream.");
  }, [companionVideos, companion.initialVideoIndex]);

  // Pick a random unlocked action and trigger play
  const handlePlayNextAction = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const playable = flatActionsList.filter(act => {
      const status = getActionStatus(act);
      return act.id !== activeActionId && (status === "unlocked" || act.cost === 0);
    });

    if (playable.length > 0) {
      const randomAct = playable[Math.floor(Math.random() * playable.length)];
      handleTriggerActionInChat(randomAct, e);
    } else {
      showToast("Unveil more premium actions or level up to expand this sequence! 💖");
    }
  }, [flatActionsList, activeActionId, getActionStatus]);

  const handleRefillGold = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFloatingHearts(e);
    setGold((prev) => prev + 9999);
    showToast("Recharged +9999 Gold! Enjoy limitless physical roleplay.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Format message text inside asterisk italic blocks
  const formatMessageText = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        const cleaned = part.substring(1, part.length - 1);
        return (
          <span
            key={idx}
            className={`inline-block ${
              isUser ? "text-pink-100 border-pink-200/50" : "text-pink-400 border-pink-500/50"
            } text-[11px] italic my-1 font-sans border-l-2 pl-2 leading-relaxed opacity-95`}
          >
            {cleaned}
          </span>
        );
      }
      return (
        <span
          key={idx}
          className={`font-sans leading-relaxed ${isUser ? "text-white" : "text-zinc-100"}`}
        >
          {part}
        </span>
      );
    });
  };

  // Relation statistics parsing
  const affinity = relationStats?.affinity ?? 3;
  const level = relationStats?.level ?? 1;
  const xp = relationStats?.xp ?? 2;
  const xpToNext = relationStats?.xp_to_next ?? 10;
  const xpPercent = Math.min(100, Math.floor((xp / xpToNext) * 100));

  // Toggle video focused mode
  const handleToggleFocusMode = () => {
    if (uiMode === "video-focus") {
      setUiMode("chat");
    } else {
      setUiMode("video-focus");
    }
  };

  const filteredActions = React.useMemo(() => {
    return flatActionsList.filter(act => {
      const status = getActionStatus(act);
      if (activeFilter === "all") return true;
      if (activeFilter === "free") return act.cost === 0;
      if (activeFilter === "unlockable") return status === "unlockable";
      if (activeFilter === "locked") return status === "locked";
      return true;
    });
  }, [flatActionsList, activeFilter, getActionStatus]);

  return (
    <div
      id="chat-window-screen"
      className="absolute inset-0 z-30 bg-[#070414] flex flex-col justify-between animate-in fade-in transition-all duration-300 overflow-hidden"
    >
      {/* Floating Love Heart Particles */}
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart z-[51] text-2xl select-none"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          💖
        </span>
      ))}

      {/* Dynamic Toast Alerts */}
      {toastMessage && (
        <div className="absolute top-28 inset-x-6 z-50 flex justify-center animate-bounce">
          <div className="bg-black/90 border border-pink-500/40 backdrop-blur-md text-zinc-100 text-[10px] py-1.5 px-3.5 rounded-full shadow-xl shadow-pink-500/10 font-sans tracking-wide flex items-center gap-1.5">
            <Sparkle className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sleek Ultra-Compact Header & Integrated Bond Level Tray */}
      <div className="pt-10 pb-2 px-3 bg-[#0d0922]/95 border-b border-[#21163e]/40 backdrop-blur-xl flex flex-col shrink-0 z-10">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <button
              id="chat-back"
              onClick={onBack}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-pink-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div
              onClick={() => onOpenProfile?.()}
              className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 active:scale-[0.98] transition-all"
              title="Click to view full video reels!"
            >
              <img
                src={companion.avatar}
                alt={companion.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-pink-500/20 object-cover shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 leading-none min-w-0">
                  <h2 className="font-display font-black text-[10px] uppercase tracking-wider text-pink-100 truncate">
                    {companion.name}
                  </h2>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                {/* Compact XP Progression */}
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[7.5px] text-pink-400 font-mono font-black uppercase shrink-0">Lv.{level}</span>
                  <div className="w-11 h-1 rounded-full bg-black/45 border border-white/5 overflow-hidden shrink-0">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-450 transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                  <span className="text-[7.5px] text-pink-305 font-mono font-bold shrink-0">{xp}/{xpToNext}XP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Aspect Ratio Button (Fit/Fill) */}
            <button
              onClick={() => setVideoFit(prev => prev === "cover" ? "contain" : "cover")}
              className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#1c1236]/75 border border-pink-500/15 text-[8.5px] font-extrabold text-pink-300 uppercase tracking-tight hover:bg-[#1a0e2a] hover:border-pink-500/35 active:scale-95 transition-all cursor-pointer"
            >
              <Film className="w-2.5 h-2.5 text-pink-400 shrink-0" />
              <span>{videoFit === "cover" ? "Fill" : "Fit"}</span>
            </button>

            {/* Toggle video sound */}
            {!mediaError && currentVideoUrl && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-7 h-7 rounded-full bg-[#1c1236]/75 border border-pink-500/15 text-zinc-300 hover:bg-[#1a0e2a] hover:text-pink-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                {isMuted ? <VolumeX className="w-3 h-3 text-zinc-400" /> : <Volume2 className="w-3 h-3 text-pink-500 animate-pulse" />}
              </button>
            )}

            {/* Simulated Live Coins Gold Wallet Indicator */}
            <button
              onClick={handleRefillGold}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-gradient-to-r from-[#291334]/85 to-[#3b0923]/85 border border-pink-500/25 text-pink-300 hover:from-[#291334] hover:to-[#3b0923] hover:border-pink-500/45 shadow-md active:scale-95 transition-all cursor-pointer font-mono text-[9px] font-black"
            >
              <Coins className="w-3 h-3 text-pink-400 shrink-0" />
              <span>{gold}</span>
            </button>

            {/* Relationship Heart Affinity level badge */}
            <div className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#1c1236]/75 border border-pink-500/15 text-pink-300 font-mono text-[9px] font-black shrink-0">
              <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500 animate-pulse" />
              <span>{affinity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* THEATER VIDEO CANVAS: Dedicated non-obstructive viewport zone */}
      <div 
        onClick={handleToggleFocusMode}
        className={`relative w-full bg-[#03010b] overflow-hidden flex items-center justify-center shadow-inner shrink-0 z-0 transition-all duration-300 cursor-pointer ${
          uiMode === "video-focus" 
            ? "h-[62dvh] border-b-2 border-pink-500/40" 
            : isInputFocused 
            ? "h-[22dvh] border-b border-[#21163e]/30" 
            : uiMode === "actions" 
            ? "h-[32dvh] border-b border-[#21163e]/40" 
            : "h-[38dvh] border-b border-[#21163e]/40"
        }`}
      >
        {!mediaError && currentVideoUrl ? (
          <video
            ref={videoRef}
            src={currentVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            referrerPolicy="no-referrer"
            onError={() => setMediaError(true)}
            className={`w-full h-full bg-black transition-all duration-300 ${
              videoFit === "cover" ? "object-cover" : "object-contain"
            }`}
          />
        ) : (
          <img
            src={companion.avatar}
            alt={companion.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full bg-[#03010b] transition-all duration-300 ${
              videoFit === "cover" ? "object-cover" : "object-contain"
            }`}
          />
        )}

        {/* Action subtitle dialogue placed exactly inside theater video's absolute bottom edge */}
        {actionSubtitle && (
          <div className="absolute bottom-3 inset-x-4 z-20 flex justify-center animate-in fade-in duration-300">
            <div className="bg-black/85 border border-[#d842ff]/30 text-zinc-100 text-[10.5px] leading-relaxed py-1.5 px-3.5 rounded-xl shadow-xl shadow-pink-900/20 border-l-4 border-l-pink-500 text-center font-sans tracking-wide max-w-[90vw]">
              {actionSubtitle}
            </div>
          </div>
        )}

        {/* Watermark badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/55 backdrop-blur border border-white/5 text-[7px] text-[#ffccee] font-mono flex items-center gap-1 z-10">
          <Sparkle className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
          <span>HQ DYNAMIC LIVE CAMERA</span>
        </div>

        {/* Focus Mode top right indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {uiMode === "video-focus" ? (
            <button
              onClick={(e) => { e.stopPropagation(); setUiMode("chat"); }}
              className="px-2 py-1 rounded bg-[#ff49ac]/80 border border-pink-500/40 text-white text-[7px] font-mono tracking-widest uppercase flex items-center gap-1 active:scale-95 transition-all"
            >
              <X className="w-2.5 h-2.5" />
              <span>Exit Focus</span>
            </button>
          ) : (
            <div className="px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[7px] text-pink-300 font-mono flex items-center gap-1">
              <Film className="w-2.5 h-2.5 animate-pulse" />
              <span>Tap to Zoom Gaze</span>
            </div>
          )}
        </div>
      </div>

      {/* COCKPIT PANEL: Solid container underneath that dynamically adjusts sizes without overlapping */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#070412] relative z-10">
        
        {/* Messages Scrolling Hub / Chat Timeline */}
        {uiMode === "video-focus" ? (
          /* Simplified stream overlay in Video Focus mode to ensure maximum screen focus! */
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2 text-center select-none">
            <span className="text-[10px] text-pink-300 font-mono uppercase tracking-widest animate-pulse font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Immersive Camera Gaze Mode
            </span>
            <p className="text-[8.5px] text-zinc-400 max-w-[240px] leading-relaxed">
              Enjoy the live stream of {companion.name} directly. Whisper thoughts in the composer below or tap the feed anytime to return to Chat.
            </p>
            <button
              onClick={() => setUiMode("chat")}
              className="px-3.5 py-1.5 rounded-full bg-pink-950/45 border border-pink-500/25 text-pink-300 font-mono text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 hover:bg-pink-900/30 transition-all active:scale-95 cursor-pointer"
            >
              💬 Return to Chat Timeline
            </button>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 no-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-3.5 rounded-full bg-pink-950/20 border border-pink-500/20 animate-bounce">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                </div>
                <h3 className="font-display font-extrabold text-xs text-zinc-100 uppercase tracking-widest leading-none">
                  Start Chatting with {companion.name}
                </h3>
                <p className="text-[9.5px] text-zinc-400 max-w-[200px] leading-relaxed">
                  Whisper intimate thoughts or trigger actions to experience live video reactions securely.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                  >
                    <div
                      className={`relative ${
                        isUser
                          ? "bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-2xl rounded-tr-none shadow-md border border-pink-500/10 shadow-pink-500/5 cursor-text"
                          : "bg-[#110c22] border border-[#2d204e]/60 text-zinc-100 rounded-2xl rounded-tl-none shadow-md cursor-text"
                      } px-3 py-2 max-w-[85%]`}
                    >
                      {/* Speech content parser */}
                      <div className="text-[10.5px] select-text">
                        {formatMessageText(msg.content, msg.role === "user")}
                      </div>

                      {/* Audio representation if voice */}
                      {msg.type === "voice" && (
                        <div className="flex items-center gap-2 bg-black/35 border border-pink-500/20 rounded-xl px-2.5 py-1 mt-1.5 cursor-pointer active:scale-[0.98]">
                          <Play className="w-2.5 h-2.5 text-pink-400 fill-pink-400" />
                          <div className="flex items-end gap-[2px] h-2.5">
                            <div className="w-[1.5px] h-2 bg-pink-400 rounded-full animate-pulse" />
                            <div className="w-[1.5px] h-1.5 bg-pink-400 rounded-full" />
                            <div className="w-[1.5px] h-2.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                            <div className="w-[1.5px] h-1.5 bg-pink-400 rounded-full" />
                          </div>
                          <span className="text-[7.5px] font-mono font-bold text-pink-350">
                            {msg.durationSec || 4}s
                          </span>
                        </div>
                      )}

                      {/* Timestamp log */}
                      <span className={`block text-[7.5px] text-right mt-1 font-mono ${isUser ? "text-pink-350" : "text-zinc-500"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Live interactive action loading box */}
            {isActionLoading && (
              <div className="flex justify-start animate-in fade-in duration-250">
                <div className="bg-[#0b1c19] border border-emerald-500/40 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-lg flex flex-col gap-1 z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    <span className="text-[9px] text-[#00ffcc] font-mono font-bold tracking-wide uppercase">
                      Action Streaming: Fetching Signed Asset
                    </span>
                  </div>
                  <p className="text-[8.5px] text-zinc-400 font-sans max-w-[200px]">
                    Buffering interactive movement sequence safely...
                  </p>
                </div>
              </div>
            )}

            {/* Live fast video loading box */}
            {isGeneratingVideo && (
              <div className="flex justify-start animate-in fade-in duration-250">
                <div className="bg-[#100726] border border-pink-500/40 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-lg flex flex-col gap-1 z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                    <span className="text-[9px] text-pink-350 font-mono font-bold tracking-wide uppercase">
                      AI Rendering Engine: Just a moment
                    </span>
                  </div>
                  <p className="text-[8.5px] text-zinc-400 font-sans max-w-[200px]">
                    Generating physical reactions sequence for {companion.name}...
                  </p>
                </div>
              </div>
            )}

            {/* Typing thinking dot animation */}
            {isGenerating && !isGeneratingVideo && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-[#120b29] border border-pink-500/20 rounded-2xl rounded-tl-none px-3 py-1.5 shadow-md flex items-center gap-2">
                  <span className="text-[9px] text-pink-400 font-mono tracking-widest uppercase font-bold">
                    {companion.name} is typing
                  </span>
                  <div className="flex gap-[2px]">
                    <div className="w-1 h-1 rounded-full bg-pink-500 animate-bounce" />
                    <div className="w-1 h-1 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-1 h-1 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPANDED ACTIONS DRAWER: Takes exactly up elements above composer, splits leftover space neatly */}
        {uiMode === "actions" && (
          <div className="h-[250px] shrink-0 bg-[#0c0820]/95 border-t border-b border-pink-500/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 z-20">
            {/* Header row */}
            <div className="p-2.5 border-b border-[#21163e]/40 flex items-center justify-between bg-[#150e2e]/60">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ff67ca] font-mono flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-pink-405 animate-pulse" />
                poses & live reactions
              </span>
              <button
                onClick={() => { setUiMode("chat"); setPendingUnlockAction(null); }}
                className="p-1 px-3 rounded-md bg-white/5 text-zinc-400 hover:text-white border border-white/5 active:scale-95 transition-all text-[8px] uppercase tracking-wider font-mono cursor-pointer"
              >
                Close ×
              </button>
            </div>

            {/* Tabs Filter Bar */}
            <div className="flex gap-1.5 px-3 py-1.5 bg-[#090618] border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
              {([
                { id: "all", label: "All Poses" },
                { id: "free", label: "Free" },
                { id: "unlockable", label: "Unlockable" },
                { id: "locked", label: "Level Gate" }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveFilter(tab.id); setPendingUnlockAction(null); }}
                  className={`px-3 py-1 rounded-full text-[8.5px] uppercase tracking-normal transition-all active:scale-95 select-none font-bold ${
                    activeFilter === tab.id
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black"
                      : "bg-[#18112e]/50 text-zinc-400 border border-[#301c4c] hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Grid list container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
              {filteredActions.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                  No active poses in this folder.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {filteredActions.map((act) => {
                    const status = getActionStatus(act);
                    const isPlaying = activeActionId === act.id;
                    
                    return (
                      <div
                        key={act.id}
                        onClick={(e) => handleTriggerActionInChat(act, e)}
                        className={`flex items-center justify-between bg-[#130926]/90 hover:bg-[#1f103d]/80 border rounded-xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.99] group ${
                          isPlaying 
                            ? "border-pink-500/80 bg-pink-950/20" 
                            : status === "unlocked" 
                            ? "border-[#2b1b4b]" 
                            : status === "unlockable" 
                            ? "border-emerald-500/20 hover:border-emerald-500/40 bg-[#0d1c1a]/45" 
                            : "border-zinc-805 bg-black/25 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-[#20103b]/80 border border-white/5">
                            {status === "locked" ? (
                              <Lock className="w-2.5 h-2.5 text-zinc-550" />
                            ) : status === "unlockable" ? (
                              <Unlock className="w-2.5 h-2.5 text-emerald-450 animate-pulse" />
                            ) : (
                              <Flame className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-[10px] uppercase tracking-wide text-zinc-100 font-extrabold font-mono leading-none flex items-center gap-1">
                              {act.name}
                              {isPlaying && (
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping inline-block" />
                              )}
                            </h4>
                            <p className="text-[7.5px] text-zinc-400 uppercase tracking-tight font-sans mt-1 font-mono">
                              {act.levelName} Requirement
                            </p>
                          </div>
                        </div>

                        {/* Status label right badge */}
                        <div>
                          {status === "locked" ? (
                            <span className="text-[8px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded border border-white/5 uppercase">
                              Lv.{act.levelNumber} Req
                            </span>
                          ) : status === "unlockable" ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPendingUnlockAction(act); }}
                              className="text-[8px] font-mono font-black text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/20 uppercase hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                            >
                              Unlock: {act.cost}G
                            </button>
                          ) : (
                            <span className="text-[8.5px] font-mono font-black text-pink-300 bg-pink-500/15 px-2.5 py-1 rounded border border-pink-500/20 uppercase">
                              {act.cost === 0 ? "FREE" : "Unlocked 🎉"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirmation Drawer Bar inside the Action Area */}
            {pendingUnlockAction && (
              <div className="p-2.5 bg-emerald-950/95 border-t border-emerald-500/40 flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-150 relative z-35 bg-gradient-to-r from-[#071d18] to-[#041210]">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#00ffcc] animate-bounce" />
                  <span className="text-[9px] font-mono font-extrabold text-[#95ffd7] leading-none">
                    Deduct {pendingUnlockAction.cost} Gold for "{pendingUnlockAction.name}"?
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setPendingUnlockAction(null)}
                    className="p-1 px-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[8px] font-mono uppercase font-bold active:scale-95 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUnlock}
                    className="p-1 px-3 rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-black text-[8px] font-mono uppercase font-black active:scale-95 transition-all active-glow cursor-pointer"
                  >
                    Confirm (pay)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTION RAIL / PLAYBACK CONTROLS: Shown ONLY when drawer panel is closed */}
        {uiMode !== "actions" && !isInputFocused && (
          <div className="h-[64px] shrink-0 bg-[#0a0718] border-t border-[#1e133c]/80 p-2 flex flex-col justify-center relative">
            {activeActionId ? (
              /* Playback style controller: Replay, Next, Back to idle */
              <div className="flex items-center justify-between px-2 w-full animate-in fade-in duration-200">
                <span className="text-[8.5px] font-black font-mono uppercase tracking-widest text-[#ff6ec3] flex items-center gap-1 shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse animate-duration-1000" />
                  playback: {flatActionsList.find(a => a.id === activeActionId)?.name || 'Pose'}
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Replay */}
                  <button
                    onClick={(e) => {
                      const mat = flatActionsList.find(a => a.id === activeActionId);
                      if (mat) handleTriggerActionInChat(mat, e);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 text-[8px] font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5 text-pink-300" />
                    <span>Replay</span>
                  </button>
                  
                  {/* Next */}
                  <button
                    onClick={handlePlayNextAction}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-pink-950/20 border border-pink-500/25 text-pink-300 hover:border-pink-500/55 text-[8px] font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-pink-500 text-pink-500 animate-pulse" />
                    <span>Next Pose</span>
                  </button>

                  {/* Rest loop */}
                  <button
                    onClick={handleBackToIdle}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/60 border border-white/5 hover:bg-white/5 text-zinc-400 text-[8px] font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Back Loop</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Collapsed shortcut actions rail */
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth animate-in fade-in duration-150">
                {/* Free / basic shortcut actions */}
                {flatActionsList.slice(0, 3).map((act) => {
                  const status = getActionStatus(act);
                  const isUnlockedStatus = status === "unlocked";
                  
                  return (
                    <button
                      key={act.id}
                      onClick={(e) => handleTriggerActionInChat(act, e)}
                      disabled={isGeneratingVideo || isActionLoading}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full border flex items-center gap-1 transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-40 select-none ${
                        isUnlockedStatus 
                          ? "bg-white/[0.04] border-white/10 text-zinc-200 hover:bg-white/[0.08]" 
                          : status === "unlockable"
                          ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300 hover:bg-emerald-950/25"
                          : "bg-black/25 border-zinc-850 text-zinc-500"
                      }`}
                      title={`${act.name}: Req ${act.levelName}`}
                    >
                      {status === "unlocked" ? (
                        <Flame className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
                      ) : (
                        <Lock className="w-2 h-2 text-zinc-500" />
                      )}
                      <span className="text-[8.5px] font-extrabold uppercase tracking-tight">{act.name}</span>
                    </button>
                  );
                })}

                {/* More / Expand poses button */}
                <button
                  onClick={() => setUiMode("actions")}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-600/20 hover:from-pink-500/30 border border-pink-500/40 text-pink-300 font-extrabold active:scale-95 duration-200 cursor-pointer flex items-center gap-1 select-none flex-1 justify-center min-w-[95px]"
                >
                  <Grid className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
                  <span className="text-[8.5px] uppercase tracking-wide">✨ More Poses</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMPOSER BAR: Text editor and panel controls */}
        <div className="p-3 bg-[#0a0718] border-t border-[#1e133c]/80 flex flex-col gap-2 shrink-0 pb-[32px] relative z-25">
          <div className="flex items-center gap-2">
            
            {/* Action launcher shortcut inside input bar, highly responsive */}
            <button
              onClick={() => setUiMode(uiMode === "actions" ? "chat" : "actions")}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer min-w-[38px] ${
                uiMode === "actions"
                  ? "bg-pink-650 border-pink-450 text-white shadow-lg active-glow"
                  : "bg-white/5 border-white/10 text-pink-400 hover:bg-white/10"
              }`}
              title="Toggle fast poses panel"
            >
              <Grid className="w-3.5 h-3.5 fill-none" />
            </button>

            <div className="flex-1 flex items-center bg-black/45 hover:bg-black/55 border border-[#2b1b4b] rounded-xl px-3 py-0.5 focus-within:border-pink-500/40 transition-all duration-300">
              <textarea
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsInputFocused(true);
                  if (uiMode === "actions") {
                    setUiMode("chat");
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setIsInputFocused(false);
                  }, 250);
                }}
                placeholder={`Whisper secrets to ${companion.name}...`}
                rows={1}
                className="flex-1 bg-transparent max-h-16 py-2 text-[11px] text-zinc-100 placeholder-zinc-500 outline-none resize-none font-sans font-medium"
              />
            </div>

            <button
              id="chat-send-btn"
              onClick={() => onSend()}
              disabled={!inputValue.trim() || isGenerating || isGeneratingVideo || isActionLoading}
              className={`p-3 rounded-xl text-white font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer min-w-[38px] min-h-[38px] ${
                inputValue.trim() && !isGenerating && !isGeneratingVideo && !isActionLoading
                   ? "bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-500/20 active-glow"
                   : "bg-[#16122d] text-zinc-650 border border-[#241c46] cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
