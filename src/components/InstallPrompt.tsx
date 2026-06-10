import React, { useState, useEffect } from "react";
import { X, Share, PlusSquare, Smartphone, Download, CheckCircle2, Sparkles, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptProps {
  isActiveChatOpen?: boolean;
}

export function InstallPrompt({ isActiveChatOpen }: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    // Detect iOS & Android
    const ua = window.navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1) ||
      (ua.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    const isAndroidDevice = /Android/i.test(ua);
    setIsAndroid(isAndroidDevice);

    // Detect if running in standalone mode (already installed & running from homescreen)
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://")
      );
    };
    
    const isInstalled = checkStandalone();
    setIsStandalone(isInstalled);

    // Listen to native beforeinstallprompt (Android + modern desktop browsers)
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("[PWA Event] beforeinstallprompt intercepted!");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Monitor for successful app installation
    const handleAppInstalled = () => {
      console.log("[PWA Event] App successfully installed!");
      setIsStandalone(true);
      setShowPrompt(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Listen to custom manual prompt events
  useEffect(() => {
    const handleOpenInstallGuide = () => {
      console.log("[PWA Trigger] Manual request received. Opening install prompt!");
      setShowPrompt(true);
    };

    window.addEventListener("chatpai_open_install_guide", handleOpenInstallGuide);

    return () => {
      window.removeEventListener("chatpai_open_install_guide", handleOpenInstallGuide);
    };
  }, [isStandalone]);

  // Listen to shorts swipe events to trigger every 5 swipes
  useEffect(() => {
    const handleShortsSwiped = () => {
      if (isStandalone) {
        console.log("[PWA Trigger] App is already standalone, ignoring swipe prompt trigger.");
        return;
      }
      
      try {
        const currentCount = parseInt(localStorage.getItem("chatpai_shorts_swipe_count") || "0", 10);
        const lastDismissed = parseInt(localStorage.getItem("chatpai_install_last_dismissed_swipe") || "0", 10);
        const delta = currentCount - lastDismissed;
        
        console.log(`[PWA Trigger] Shorts swiped: current=${currentCount}, lastDismissed=${lastDismissed}, delta=${delta}`);
        
        if (delta > 0 && delta % 5 === 0) {
          console.log("[PWA Trigger] Delta is a multiple of 5! Triggering install prompt.");
          setShowPrompt(true);
        }
      } catch (e) {
        console.error("[PWA Trigger] Error checking shorts swipe logic:", e);
      }
    };

    window.addEventListener("chatpai_shorts_swiped", handleShortsSwiped);

    return () => {
      window.removeEventListener("chatpai_shorts_swiped", handleShortsSwiped);
    };
  }, [isStandalone]);

  // Execute native browser install
  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log(`[PWA Prompt] User choice outcomes: ${choiceResult.outcome}`);
        if (choiceResult.outcome === "accepted") {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
        setInstallError(null);
      } catch (err) {
        console.error("[PWA Prompt] Failed to prompt native install:", err);
        setInstallError("Native install was blocked by browser. Please use the ⋮ options below.");
      }
    } else if (isAndroid) {
      // Show dynamic fallback guide if prompt hasn't fired yet
      setInstallError("Standard prompt is disallowed in this sandbox/iframe. Please follow instructions below!");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setInstallError(null);
    // Mark general dismissal
    localStorage.setItem("installPromptDismissed", "true");
    
    // Save current shorts swipe count so we start the 5-swipe delta countdown from this point!
    try {
      const currentCount = parseInt(localStorage.getItem("chatpai_shorts_swipe_count") || "0", 10);
      localStorage.setItem("chatpai_install_last_dismissed_swipe", currentCount.toString());
      console.log(`[PWA Prompt] Dismissed at count: ${currentCount}. Next automatic trigger in 5 swipes!`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!showPrompt || isActiveChatOpen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] pb-[env(safe-area-inset-bottom)] px-4 translate-y-0 transition-transform duration-500 ease-out flex justify-center animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#120a27] border border-pink-500/40 rounded-3xl p-5 shadow-[0_0_35px_rgba(236,72,153,0.15)] w-full max-w-sm mb-4 relative overflow-hidden backdrop-blur-2xl">
        {/* Absolute glow highlights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center text-center pt-2">
          {/* Circular badge illustration */}
          <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(236,72,153,0.3)] shrink-0">
            <Smartphone className="w-7 h-7 text-white animate-pulse" />
          </div>
          
          <h3 className="text-white font-extrabold text-base tracking-wide flex items-center gap-1.5 font-sans">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Install Web App
          </h3>
          
          <p className="text-zinc-300 text-xs mt-1.5 mb-4 px-2 leading-relaxed">
            {isStandalone
              ? "Awesome! You are running ChatPai in standalone mode directly from your Home Screen."
              : "Add this app to your Home Screen for a seamless, immersive full-screen experience and instant launches!"}
          </p>
          
          {/* Conditional rendering based on state */}
          {isStandalone ? (
            <div className="bg-inner bg-green-500/15 border border-green-500/30 rounded-xl p-3 flex items-center gap-2 text-green-400 text-xs w-full justify-center">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Successfully installed & running in PWA mode!</span>
            </div>
          ) : (deferredPrompt || isAndroid) ? (
            // Native installation is supported on this browser or we want to offer the fallback button on Android
            <div className="w-full space-y-3">
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs tracking-wide shadow-lg hover:shadow-pink-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 animate-bounce" />
                One-Click Install
              </button>
              
              {installError ? (
                <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 leading-relaxed text-left">
                  ⚠️ {installError}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400">
                  Click to add directly. If blocked, follow alternative steps below:
                </p>
              )}

              {/* Instructions steps backup */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col items-start gap-2 text-zinc-200 text-[11px] w-full font-sans text-left leading-relaxed">
                {isIOS ? (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">1</span>
                      <div>
                        Tap Safari Share icon <Share className="w-3.5 h-3.5 text-sky-400 inline mx-0.5" /> in the bottom navigation bar
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">2</span>
                      <div>
                        Choose and select <PlusSquare className="w-3.5 h-3.5 text-pink-400 inline mx-0.5" /> <b>「Add to Home Screen」</b> from menu
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">1</span>
                      <div>
                        Open your browser options (the <MoreVertical className="w-3.5 h-3.5 text-zinc-300 inline mx-0.5" /> vertical three-dot icon)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">2</span>
                      <div>
                        Choose <PlusSquare className="w-3.5 h-3.5 text-pink-400 inline mx-0.5" /> <b>「Add to Home Screen」</b> to confirm setting
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Platform instructions fallback (iOS or custom mobile agent)
            <div className="w-full">
              {isIOS ? (
                <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex flex-col items-start gap-2 text-zinc-200 text-[11px] w-full font-sans text-left leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">1</span>
                    <div>
                      Tap browser share button <Share className="w-3.5 h-3.5 text-sky-400 inline mx-0.5" /> in the bottom navigation bar
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">2</span>
                    <div>
                      Scroll down and select <PlusSquare className="w-3.5 h-3.5 text-zinc-300 inline mx-0.5" /> <b>「Add to Home Screen」</b> from menu
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex flex-col items-start gap-2 text-zinc-200 text-[11px] w-full font-sans text-left leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">1</span>
                    <div>
                      Open your browser's options menu (the <MoreVertical className="w-3.5 h-3.5 text-zinc-300 inline mx-0.5" /> vertical three-dot menu icon)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[9px] flex items-center justify-center font-bold font-mono mt-0.5 shrink-0">2</span>
                    <div>
                      Choose <PlusSquare className="w-3.5 h-3.5 text-pink-400 inline mx-0.5" /> <b>「Add to Home Screen」</b> to confirm your layout setup
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
