import React, { useEffect, useState } from "react";

interface DifyChatbotProps {
  userId: string;
  activeTab: string;
}

export default function DifyChatbot({ userId, activeTab }: DifyChatbotProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  // 1. Synchronize the system user ID query parameter within Dify's iframe
  useEffect(() => {
    const finalUserId = userId || localStorage.getItem("muse_user_id") || "usr_local_test";

    // Periodically inspect DOM to find Dify's loaded iframe and sync the user_id parameter
    const syncIframeUserId = () => {
      const windowEl = document.getElementById("dify-chatbot-bubble-window");
      if (!windowEl) return false;

      const iframe = windowEl.querySelector("iframe");
      if (!iframe) return false;

      let currentSrc = iframe.getAttribute("src") || "";
      if (currentSrc) {
        try {
          const url = new URL(currentSrc);
          const currentUserId = url.searchParams.get("user_id");
          if (currentUserId !== finalUserId) {
            console.log("[DifyChatbot] Syncing active user session:", finalUserId);
            url.searchParams.set("user_id", finalUserId);
            iframe.setAttribute("src", url.toString());
          }
          return true;
        } catch (e) {
          // Fallback parsing for partial links
          if (currentSrc.includes("user_id=")) {
            const updated = currentSrc.replace(/user_id=[^&]+/, `user_id=${finalUserId}`);
            if (updated !== currentSrc) {
              iframe.setAttribute("src", updated);
            }
          } else {
            const connector = currentSrc.includes("?") ? "&" : "?";
            iframe.setAttribute("src", `${currentSrc}${connector}user_id=${finalUserId}`);
          }
          return true;
        }
      }
      return false;
    };

    const timer = setInterval(() => {
      syncIframeUserId();
    }, 1500);

    return () => clearInterval(timer);
  }, [userId]);

  // 2. Observe the style attributes of Dify's container to detect Maximize/Minimize changes
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const observeDifyWindow = () => {
      const winEl = document.getElementById("dify-chatbot-bubble-window");
      if (!winEl) return false;

      observer = new MutationObserver(() => {
        const wStyle = winEl.style.width || "";
        const hStyle = winEl.style.height || "";
        const tStyle = winEl.style.top || "";
        
        // When maximized, Dify stretches to full screen width/height and resets top coordinates
        const isCurrentlyMaximized = 
          wStyle.includes("100") || 
          hStyle.includes("100") || 
          tStyle === "0px" || 
          winEl.classList.contains("maximized") ||
          winEl.getAttribute("data-maximized") === "true";

        setIsMaximized(isCurrentlyMaximized);
      });

      observer.observe(winEl, { attributes: true, attributeFilter: ["style", "class"] });
      return true;
    };

    const timer = setInterval(() => {
      if (observeDifyWindow()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // 3. Setup Persistent & Draggable Gestures for the Chatbot Button
  useEffect(() => {
    let button: HTMLElement | null = null;
    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let initRight = 20;
    let initBottom = 110;

    // Load custom position from LocalStorage
    const savedRight = localStorage.getItem("chatpai_chatbot_btn_right");
    const savedBottom = localStorage.getItem("chatpai_chatbot_btn_bottom");

    const initializePosition = () => {
      button = document.getElementById("dify-chatbot-bubble-button");
      const winEl = document.getElementById("dify-chatbot-bubble-window");
      if (!button) return false;

      // Restore saved position if present
      if (savedRight && savedBottom) {
        const rVal = parseFloat(savedRight);
        const bVal = parseFloat(savedBottom);
        button.style.setProperty("right", `${rVal}px`, "important");
        button.style.setProperty("bottom", `${bVal}px`, "important");

        if (winEl) {
          winEl.style.setProperty("right", `${rVal}px`, "important");
          winEl.style.setProperty("bottom", `${bVal + 70}px`, "important");
        }
      }
      return true;
    };

    const attachDraggableHandlers = () => {
      button = document.getElementById("dify-chatbot-bubble-button");
      if (!button) return false;

      button.style.touchAction = "none";
      button.style.cursor = "grab";

      const handleDragStart = (clX: number, clY: number) => {
        isDragging = true;
        hasMoved = false;
        startX = clX;
        startY = clY;

        const currentStyle = window.getComputedStyle(button!);
        initRight = parseInt(currentStyle.right, 10) || 20;
        initBottom = parseInt(currentStyle.bottom, 10) || 110;
        button!.style.cursor = "grabbing";
      };

      const handleDragMove = (clX: number, clY: number) => {
        if (!isDragging) return;

        const dX = clX - startX;
        const dY = clY - startY;

        // Visual moving movement delta sensitivity
        if (Math.abs(dX) > 5 || Math.abs(dY) > 5) {
          hasMoved = true;
        }

        const nextRight = initRight - dX;
        const nextBottom = initBottom - dY;

        // Boundaries matching our layout constraints
        const clampR = Math.max(10, Math.min(window.innerWidth - 75, nextRight));
        const clampB = Math.max(90, Math.min(window.innerHeight - 75, nextBottom));

        button!.style.setProperty("right", `${clampR}px`, "important");
        button!.style.setProperty("bottom", `${clampB}px`, "important");

        // Sync position of the conversational chat window
        const winEl = document.getElementById("dify-chatbot-bubble-window");
        if (winEl) {
          // Avoid shifting coordinates when chat window is currently maximized
          const wStyle = winEl.style.width || "";
          const tStyle = winEl.style.top || "";
          const isMax = wStyle.includes("100") || tStyle === "0px" || winEl.classList.contains("maximized");

          if (!isMax) {
            winEl.style.setProperty("right", `${clampR}px`, "important");
            winEl.style.setProperty("bottom", `${clampB + 70}px`, "important");
          }
        }
      };

      const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (button) {
          button.style.cursor = "grab";
          // Store position in local persistence to survive refreshes
          localStorage.setItem("chatpai_chatbot_btn_right", button.style.right.replace("px", ""));
          localStorage.setItem("chatpai_chatbot_btn_bottom", button.style.bottom.replace("px", ""));
        }
      };

      // Register Mouse Inputs
      const onMouseDown = (e: MouseEvent) => {
        // Prevent action on right click or aux inputs
        if (e.button !== 0) return;
        handleDragStart(e.clientX, e.clientY);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX, e.clientY);
      };

      const onMouseUp = () => {
        handleDragEnd();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      // Register Mobile Touch Inputs
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const onTouchEnd = () => {
        handleDragEnd();
      };

      // Distinguish dragging vs clicking (so dragging doesn't trigger open/close click)
      const onClickCapture = (e: MouseEvent) => {
        if (hasMoved) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      };

      button.addEventListener("mousedown", onMouseDown);
      button.addEventListener("touchstart", onTouchStart, { passive: true });
      button.addEventListener("touchmove", onTouchMove, { passive: true });
      button.addEventListener("touchend", onTouchEnd);
      button.addEventListener("click", onClickCapture, true);

      return true;
    };

    const timer = setInterval(() => {
      if (initializePosition() && attachDraggableHandlers()) {
        clearInterval(timer);
      }
    }, 800);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const isVisible = activeTab === "profile";

  if (!isVisible) {
    return (
      <style>{`
        /* Hide floating window and launcher bubble on non-Profile pages */
        #dify-chatbot-bubble-button, #dify-chatbot-bubble-window {
          display: none !important;
        }
      `}</style>
    );
  }

  // Render conditional style block representing maximized layout
  if (isMaximized) {
    return (
      <style>{`
        #dify-chatbot-bubble-button {
          display: flex !important; /* Keep button visible so user can click to close the maximized window */
          z-index: 20000005 !important;
        }
        #dify-chatbot-bubble-window {
          z-index: 20000000 !important;
        }
      `}</style>
    );
  }

  return (
    <style>{`
      /* Set correct background & layer for launcher button bubble */
      #dify-chatbot-bubble-button {
        display: flex !important;
        background-color: #1C64F2 !important;
        bottom: 110px;
        right: 20px;
        z-index: 20000005 !important;
        box-shadow: 0 4px 14px rgba(28, 100, 242, 0.4) !important;
        transition: transform 0.1s ease !important;
      }
      #dify-chatbot-bubble-button:active {
        transform: scale(0.9) !important;
      }
      
      /* Target the floating chat frame only when NOT maximized inline (removes !important conflicts) */
      #dify-chatbot-bubble-window:not([style*="top: 0px"]):not([style*="top: 0"]):not([style*="height: 100%"]):not([style*="width: 100%"]) {
        /* No display !important override at all! Let Dify toggle display natively! */
        width: 440px !important;
        max-width: calc(100% - 32px) !important;
        
        /* Fixed height, capped gracefully as proportional height to avoid overflow the viewport top */
        height: 600px !important;
        max-height: calc(100vh - 200px) !important;
        
        bottom: 180px;
        right: 20px;
        z-index: 20000000 !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      /* Mobile dynamic scaling optimizations */
      @media (max-width: 640px) {
        #dify-chatbot-bubble-window:not([style*="top: 0px"]):not([style*="top: 0"]):not([style*="height: 100%"]):not([style*="width: 100%"]) {
          /* Centering sideways completely on mobile viewports for best usability! */
          width: calc(100% - 32px) !important;
          left: 16px !important;
          right: 16px !important;
          
          /* Larger and more tall height on mobile screens for superb communication space! */
          height: calc(100dvh - 210px) !important;
          max-height: calc(100vh - 180px) !important;
          
          bottom: 180px;
        }
      }
    `}</style>
  );
}
