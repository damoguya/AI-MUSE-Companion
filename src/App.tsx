import React from "react";
import {
  Compass,
  MessageCircle,
  PlusCircle,
  Heart,
  User,
  Sparkles,
  Search,
  Trash2,
  Edit2,
  Save,
  Smile,
  Shield,
  HelpCircle,
  Film,
  Play,
  X,
  Clock,
  Download,
  RefreshCw,
  Coins,
  Settings,
  Plus,
  ArrowLeft,
  Flame,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { ChatSession, DigitalHuman, Media, Message } from "./types";
import CompanionCard from "./components/CompanionCard";
import ChatWindow from "./components/ChatWindow";
import CreatorTab from "./components/CreatorTab";
import ShortsTab from "./components/ShortsTab";
import { InstallPrompt } from "./components/InstallPrompt";
import { CURATED_COMPANIONS } from "./curated_companions";
import FeaturedCharacters from "./components/FeaturedCharacters";
import InteractiveProfile from "./components/InteractiveProfile";
import DifyChatbot from "./components/DifyChatbot";

// Global Custom Toast Notification Utility
function customToast(msg: string) {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-black/85 border border-pink-500/40 text-pink-300 backdrop-blur-md shadow-2xl text-xs font-bold uppercase tracking-wider text-center z-50 animate-bounce";
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2300);
}

export default function App() {
  // Navigation Tabs Setting: 'shorts' | 'explore' | 'chats' | 'creator' | 'follows' | 'profile'
  const [activeTab, setActiveTab] = React.useState<"shorts" | "explore" | "chats" | "creator" | "follows" | "profile">("shorts");
  const [profileSubTab, setProfileSubTab] = React.useState<"shop" | "creations" | "settings">("shop");

  // Core Storage & Auth State Management
  const [deviceId, setDeviceId] = React.useState("");
  const [token, setToken] = React.useState("");
  const [digitalHumans, setDigitalHumans] = React.useState<DigitalHuman[]>([]);
  const [interactiveHumans, setInteractiveHumans] = React.useState<DigitalHuman[]>([]);
  const [customHumans, setCustomHumans] = React.useState<DigitalHuman[]>([]);
  const [ongoingChats, setOngoingChats] = React.useState<ChatSession[]>([]);
  const [followsDict, setFollowsDict] = React.useState<Record<string, boolean>>({});

  // Search filter options
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTagCategory, setSelectedTagCategory] = React.useState<string>("All");

  // User details state config
  const [nickname, setNickname] = React.useState("AI Companion");
  const [isEditingNickname, setIsEditingNickname] = React.useState(false);

  // Transition & Detailed Modals
  const [selectedCompanion, setSelectedCompanion] = React.useState<DigitalHuman | null>(null);
  const [editingCompanion, setEditingCompanion] = React.useState<DigitalHuman | null>(null);
  const [detailModalDefaultExpanded, setDetailModalDefaultExpanded] = React.useState(false);
  const [activeChatCompanion, setActiveChatCompanion] = React.useState<DigitalHuman | null>(null);
  const [focusedCompanionId, setFocusedCompanionId] = React.useState<string | null>(null);

  const handlePreviewCompanionShorts = (companion: DigitalHuman) => {
    setSelectedCompanion(companion);
  };
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [messageInput, setMessageInput] = React.useState("");

  // Loading indicator gates
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [isHumansLoading, setIsHumansLoading] = React.useState(false);
  const [isChatInitialising, setIsChatInitialising] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);

  // FastVideo task generation local persistence
  const [generationRecords, setGenerationRecords] = React.useState<any[]>([]);
  const [activeHistoryVideoUrl, setActiveHistoryVideoUrl] = React.useState<string | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = React.useState(false);
  const [pendingPaymentUrl, setPendingPaymentUrl] = React.useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null);
  const [activeOrderStatus, setActiveOrderStatus] = React.useState<string | null>(null);
  const [activeOrderAmount, setActiveOrderAmount] = React.useState<number | null>(null);
  const [activeOrderProductName, setActiveOrderProductName] = React.useState<string | null>(null);
  const [selectedPayPackage, setSelectedPayPackage] = React.useState<any | null>(null);
  const [sandboxPayment, setSandboxPayment] = React.useState<{
    package: any;
    channel: string;
    step: "init" | "processing" | "authorizing" | "success" | "failed";
  } | null>(null);

  // Global In-App AD State
  const [activeAdUrl, setActiveAdUrl] = React.useState<string | null>(null);

  // ===================================
  // MUSE CREATOR & WALLET RECHARGE STATES
  // ===================================
  const [museUserId, setMuseUserId] = React.useState<string>("");
  const [museWallet, setMuseWallet] = React.useState<{ balance: number; reserved_balance: number } | null>(null);
  const [gold, setGold] = React.useState<number>(() => {
    const savedGold = localStorage.getItem("chatpai_user_gold");
    return savedGold ? parseInt(savedGold, 10) : 9999;
  });

  // Keep localStorage up to date
  React.useEffect(() => {
    localStorage.setItem("chatpai_user_gold", gold.toString());
  }, [gold]);

  // Sync gold from museWallet balance if loaded/changed
  React.useEffect(() => {
    if (museWallet !== null && museWallet.balance !== gold) {
      setGold(museWallet.balance);
    }
  }, [museWallet]);

  // Sync back to museWallet structure on gold state mutations
  React.useEffect(() => {
    if (museWallet !== null && museWallet.balance !== gold) {
      setMuseWallet(prev => prev ? { ...prev, balance: gold } : { balance: gold, reserved_balance: 0 });
    }
  }, [gold]);
  const [isWalletLoading, setIsWalletLoading] = React.useState<boolean>(false);
  const [paymentPackages, setPaymentPackages] = React.useState<any[]>([]);
  const [isPackagesLoading, setIsPackagesLoading] = React.useState<boolean>(false);
  const [isWelcomeClaimed, setIsWelcomeClaimed] = React.useState<boolean>(true);
  const [isClaimingWelcome, setIsClaimingWelcome] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleShowAd = () => {
      if (activeChatCompanion) {
        console.log("[Ad Trigger] Blocked ad trigger: user is in active roleplay chat.");
        return;
      }
      setActiveAdUrl("https://wap.aigirl001002.pro/?channel=260317636250197103392814&agent=501971033928&pixel=0000000");
    };
    window.addEventListener("chatpai_show_ad", handleShowAd);
    return () => window.removeEventListener("chatpai_show_ad", handleShowAd);
  }, [activeChatCompanion]);

  React.useEffect(() => {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsPWAInstalled(isStandaloneMode);
  }, []);

  // Refresh generation records and packages list whenever target tab becomes active
  React.useEffect(() => {
    if (activeTab === "profile") {
      try {
        const saved = localStorage.getItem("chatpai_generation_records");
        setGenerationRecords(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error("Failed to load fastvideo generation records:", err);
      }
      fetchPaymentPackages();
    }
    
    // Also re-fetch companions when landing on explore or profile to get newly generated avatars
    if (activeTab === "explore" || activeTab === "profile") {
      if (museUserId) {
        fetchMuseCompanions(museUserId);
      }
    }
  }, [activeTab, museUserId]);

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("chatpai_generation_records");
      if (saved) {
        const records = JSON.parse(saved);
        const filtered = records.filter((r: any) => r.id !== id);
        localStorage.setItem("chatpai_generation_records", JSON.stringify(filtered));
        setGenerationRecords(filtered);
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const handleRefreshRecords = () => {
    try {
      const saved = localStorage.getItem("chatpai_generation_records");
      setGenerationRecords(saved ? JSON.parse(saved) : []);
    } catch (err) {
      console.error("Failed to refresh records manually:", err);
    }
  };

  // Dynamic Session ID trackers for official companions
  // Maps digitalHumanId -> sessionId
  const [sessionsMap, setSessionsMap] = React.useState<Record<string, string>>({});

  // Relation statistics tracker for Custom Characters
  // Maps digitalHumanId -> { affinity, level, xp }
  const [customStatsMap, setCustomStatsMap] = React.useState<
    Record<string, { affinity: number; level: number; xp: number; xp_to_next: number }>
  >({});


  const fetchWelcomeClaimStatus = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/muse/wallet/claim-status?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const payload = await res.json();
        setIsWelcomeClaimed(!!payload.claimed);
      }
    } catch (e) {
      console.error("Failed to fetch welcome claim status:", e);
    }
  };

  const fetchPaymentPackages = async () => {
    setIsPackagesLoading(true);
    try {
      const res = await fetch("/api/muse/payment/packages");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const payload = await res.json();
            const list = payload.packages || payload || [];
            setPaymentPackages(Array.isArray(list) ? list : []);
        } else {
            console.error("[Sync Error] Expected JSON for packages but received:", contentType);
        }
      } else {
        console.warn(`[Sync] Payment packages fetch failed (${res.status})`);
      }
    } catch (e) {
      console.error("Failed to fetch payment packages:", e);
    } finally {
      setIsPackagesLoading(false);
    }
  };

  const handleSelectPaymentChannel = async (channelKey: string) => {
    if (!selectedPayPackage) return;
    const pkg = selectedPayPackage;
    const coinsVal = Number(pkg.wallet_amount || 0);
    const priceVal = (Number(pkg.fiat_amount || 0) / 100).toFixed(2);
    
    let provider = "usdt_gateway";
    let channel = "crypto";
    
    if (channelKey === "paypal") {
      provider = "vtpay_us";
      channel = "paypal";
    } else if (channelKey === "cashapp") {
      provider = "vtpay_us";
      channel = "cash_app";
    } else if (channelKey === "applepay") {
      provider = "vtpay_us";
      channel = "apple_pay";
    } else if (channelKey === "googlepay") {
      provider = "vtpay_us";
      channel = "google_pay";
    }
    
    customToast(`Initializing ${channelKey.toUpperCase()} Checkout...`);
    setSelectedPayPackage(null);
    
    try {
      const res = await fetch("/api/muse/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: museUserId,
          package_id: pkg.package_id,
          provider,
          channel
        })
      });
      
      if (res.ok) {
        const orderData = await res.json();
        const paymentUrl = orderData.checkout_url || 
                           orderData.payment_url || 
                           orderData.order?.checkout_url || 
                           orderData.order?.payment_url;
                           
        const oId = orderData.order_id || orderData.order?.id;
        
        if (oId) {
          setActiveOrderId(oId);
          setActiveOrderStatus("pending");
          setActiveOrderAmount(coinsVal);
          setActiveOrderProductName(pkg.product_name);
        }
        
        if (paymentUrl) {
          setPendingPaymentUrl(paymentUrl);
          const payWindow = window.open(paymentUrl, "_blank");
          if (!payWindow) {
            window.location.href = paymentUrl;
          }
          return;
        }
      }
    } catch (e) {
      console.warn("API gateway not fully ready for channel, switching to sandbox mode:", e);
    }
    
    // Fallback to high-fidelity live sandbox simulation within PWA
    setSandboxPayment({
      package: pkg,
      channel: channelKey,
      step: "init"
    });
  };

  const handleSimulatePaymentCompletion = async (isSuccess: boolean) => {
    if (!sandboxPayment) return;
    const { package: pkg, channel } = sandboxPayment;
    const amountVal = Number(pkg.wallet_amount || 0);

    if (!isSuccess) {
      setSandboxPayment(prev => prev ? { ...prev, step: "failed" } : null);
      customToast("❌ Simulated payment failed / declined");
      return;
    }

    setSandboxPayment(prev => prev ? { ...prev, step: "processing" } : null);
    
    // Simulate real delay
    setTimeout(async () => {
      setSandboxPayment(prev => prev ? { ...prev, step: "authorizing" } : null);
      
      try {
        const res = await fetch("/api/muse/payment/simulate-credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: museUserId,
            amount: amountVal
          })
        });
        if (res.ok) {
          const syncRes = await res.json();
          console.log("[Simulation Sync] Credit response:", syncRes);
        }
      } catch (err) {
        console.warn("[Simulation Sync] Failed connecting credit to backend service, crediting locally...", err);
      }
      
      setTimeout(() => {
        // Increment state directly
        setGold(prev => prev + amountVal);
        setSandboxPayment(prev => prev ? { ...prev, step: "success" } : null);
        customToast(`🎉 Success! Credited +${amountVal} GOLD to balance!`);
      }, 1200);

    }, 1500);
  };

  const fetchMuseWalletBalance = async (userId: string) => {
    if (!userId) return;
    setIsWalletLoading(true);
    try {
      const res = await fetch(`/api/muse/wallet/balance?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const payload = await res.json();
        const wl = payload.account || payload.wallet || payload;
        setMuseWallet({
          balance: wl.balance ?? 0,
          reserved_balance: wl.reserved_balance ?? 0
        });
      }
    } catch (e) {
      console.error("Failed to fetch Muse wallet balance:", e);
    } finally {
      setIsWalletLoading(false);
    }
  };

  // Poll for recharge order status
  React.useEffect(() => {
    if (!activeOrderId || !museUserId) return;

    let intervalId: any;
    let pollCount = 0;
    const maxPolls = 150; // Poll for up to 7.5 minutes (3s * 150)

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/muse/payment/order/${encodeURIComponent(activeOrderId)}?user_id=${encodeURIComponent(museUserId)}`);
        if (res.ok) {
          const orderData = await res.json();
          const order = orderData.order || orderData;
          const status = (order.status || "").toLowerCase();

          if (status === "succeeded" || status === "success" || status === "paid" || status === "completed") {
            setActiveOrderStatus("success");
            customToast(`🎉 Success! Added +${activeOrderAmount || 50} Gold!`);
            // immediately refresh the balance
            fetchMuseWalletBalance(museUserId);
            clearInterval(intervalId);
          } else if (status === "failed" || status === "cancelled" || status === "canceled" || status === "expired") {
            setActiveOrderStatus("failed");
            customToast("❌ Recharge Failed or Cancelled.");
            clearInterval(intervalId);
          } else {
            setActiveOrderStatus("pending");
          }
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }

      pollCount++;
      if (pollCount >= maxPolls) {
        setActiveOrderStatus("failed");
        customToast("⚠️ Order status check timed out.");
        clearInterval(intervalId);
      }
    };

    // run once immediately
    checkOrderStatus();

    intervalId = setInterval(checkOrderStatus, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeOrderId, museUserId, activeOrderAmount]);

  const fetchMuseCompanions = React.useCallback(async (userId: string) => {
    if (!userId || String(userId) === "null" || String(userId) === "undefined") {
      console.warn("[Sync] Aborting companion fetch: invalid userId", userId);
      return;
    }
    
    // Safety: ensure userId is a string
    const finalUserId = String(userId);

    try {
      const res = await fetch(`/api/muse/companions?user_id=${encodeURIComponent(finalUserId)}`);
      
      if (!res.ok) {
        let errorData;
        try {
          const text = await res.text();
          errorData = JSON.parse(text);
        } catch (e) {
          errorData = { message: "Non-JSON error response from server" };
        }
        console.warn(`[Sync Error] Backend returned status ${res.status}:`, errorData);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("[Sync Error] Expected JSON but received:", contentType, "Body prefix:", text.substring(0, 100));
        return;
      }

      const payload = await res.json();
      if (payload && Array.isArray(payload.companions)) {
        const fetchedCompanions = payload.companions.map((comp: any) => {
          const sels = comp.creator_selections || {};
          return {
            id: comp.id,
            uid: comp.id,
            name: comp.name,
            avatar: comp.avatar_url || comp.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
            age: comp.age || 22,
            country: comp.country || (sels.ethnicity ?? "Caucasian"),
            desc: [
              `relationship:${comp.relationship ?? "Girlfriend"}`,
              `occupation:${comp.occupation ?? "Student"}`,
              `ethnicity:${sels.ethnicity ?? "Caucasian"}`,
              `body:${sels.bodyType ?? "Skinny"}`,
              `bust:${sels.breastSize ?? "Medium"}`
            ],
            bio: comp.bio || `A beautiful companion customized just for you.`,
            fans_cnt: 1350,
            relationship: comp.relationship ?? "Girlfriend",
            voice_id: comp.voice_id ?? "Sweet",
            media: [
              {
                id: `media_${comp.id}_0`,
                url: comp.avatar_url || comp.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
                type: "image"
              }
            ],
            created_at: comp.created_at || new Date().toISOString(),
            updated_at: comp.updated_at || new Date().toISOString(),
            is_follow: true,
            isCustom: true
          } as DigitalHuman;
        });
        setCustomHumans((prev) => {
          const mergedCompanions = [...fetchedCompanions];
          const fetchedIds = new Set(fetchedCompanions.map((c: DigitalHuman) => c.id));
          
          prev.forEach((localComp) => {
            if (!fetchedIds.has(localComp.id)) {
              mergedCompanions.push(localComp);
            }
          });
          
          localStorage.setItem("chatpai_custom_humans", JSON.stringify(mergedCompanions));
          return mergedCompanions;
        });
        
        setSelectedCompanion(prev => {
          if (prev && prev.isCustom) {
            const updated = fetchedCompanions.find((c: any) => c.id === prev.id);
            return updated ? { ...prev, ...updated } : prev;
          }
          return prev;
        });
      }
    } catch (e: any) {
      // If the fetch itself fails (e.g. timeout, network down)
      if (e.name === "TypeError" && e.message === "Failed to fetch") {
        console.warn("[Sync] Network error: Failed to fetch. Retrying on next tick...");
      } else {
        console.warn("Failed to sync backend companions:", e);
      }
    }
  }, []);

  const syncMuseUser = async (deviceIdToSync: string, currentNickname: string) => {
    try {
      const res = await fetch("/api/muse/ensure-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceIdToSync,
          nickname: currentNickname || "User_" + deviceIdToSync.substring(4, 9)
        })
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload.user && payload.user.id) {
          setMuseUserId(payload.user.id);
          localStorage.setItem("muse_user_id", payload.user.id);
          if (payload.wallet) {
            setMuseWallet({
              balance: payload.wallet.balance ?? 0,
              reserved_balance: payload.wallet.reserved_balance ?? 0
            });
          } else {
            fetchMuseWalletBalance(payload.user.id);
          }
          fetchWelcomeClaimStatus(payload.user.id);
        }
      }
    } catch (e) {
      console.error("Failed to sync Muse User session:", e);
    }
  };

  React.useEffect(() => {
    if (museUserId) {
      fetchMuseCompanions(museUserId);
      fetchMuseWalletBalance(museUserId);
      fetchWelcomeClaimStatus(museUserId);
      
      const pollInterval = setInterval(() => {
        fetchMuseCompanions(museUserId);
      }, 10000);
      
      return () => clearInterval(pollInterval);
    }
  }, [museUserId]);

  // Load interactive characters
  React.useEffect(() => {
    let active = true;
    fetch("/api/interactive/characters")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load interactive characters");
        return res.json();
      })
      .then((data) => {
        if (active && data.characters && Array.isArray(data.characters)) {
          const mapped = data.characters.map((char: any) => {
            const descList: string[] = [];
            if (char.attributes) {
              Object.entries(char.attributes).forEach(([key, value]) => {
                if (value) descList.push(`${key}:${value}`);
              });
            }
            const relationship = char.attributes?.relationship || "Girlfriend";
            const media: Media[] = [];
            if (char.welcome_video_url) {
              media.push({
                id: `${char.character_key}-welcome`,
                url: char.welcome_video_url,
                type: "video"
              });
            }
            if (char.idle_video_url) {
              media.push({
                id: `${char.character_key}-idle`,
                url: char.idle_video_url,
                type: "video"
              });
            }
            return {
              id: char.id || `ich_${char.character_key}`,
              uid: char.id || `ich_${char.character_key}`,
              name: char.display_name || char.character_key,
              avatar: char.cover_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
              age: char.attributes?.age ? parseInt(char.attributes?.age, 10) : 21,
              country: char.attributes?.ethnicity || "Caucasian",
              desc: descList,
              bio: char.bio || `Connect with ${char.display_name || char.character_key} for live action high fidelity interactive stories.`,
              fans_cnt: char.fans_cnt || 25400,
              relationship: relationship,
              voice_id: char.voice_id || "sweet",
              media: media,
              created_at: char.created_at || new Date().toISOString(),
              updated_at: char.updated_at || new Date().toISOString(),
              is_follow: false,
              isInteractive: true,
              interactive_key: char.character_key
            };
          });
          setInteractiveHumans(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using offline fallback in App:", err);
        const OFFLINE_FEATURES: DigitalHuman[] = [
          { id: "ich_coco", uid: "ich_coco", name: "Coco", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/coco/cover/cover.webp", age: 21, country: "Caucasian", desc: ["relationship:Girlfriend", "style:Sexy"], bio: "I love attention and having fun. Shall we play a game?", fans_cnt: 25400, relationship: "Girlfriend", voice_id: "sweet", media: [{ id: "coco-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/coco/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "coco" },
          { id: "ich_darkangel666", uid: "ich_darkangel666", name: "Dark Angel", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/darkangel666/cover/cover.webp", age: 23, country: "Gothic", desc: ["relationship:Mistress", "style:Dark"], bio: "Embrace the darkness with me. I have many secrets to share.", fans_cnt: 18900, relationship: "Mistress", voice_id: "sultry", media: [{ id: "darkangel666-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/darkangel666/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "darkangel666" },
          { id: "ich_elodie", uid: "ich_elodie", name: "Elodie", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/elodie/cover/cover.webp", age: 22, country: "French", desc: ["relationship:Girlfriend", "style:Elegant"], bio: "Sophisticated and charming. Ready for a romantic adventure?", fans_cnt: 15200, relationship: "Girlfriend", voice_id: "french", media: [{ id: "elodie-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/elodie/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "elodie" },
          { id: "ich_emilia", uid: "ich_emilia", name: "Emilia", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/emilia/cover/cover.webp", age: 20, country: "Latin", desc: ["relationship:Wife", "style:Flirty"], bio: "Passionate and full of energy. Let me brighten your day.", fans_cnt: 31000, relationship: "Wife", voice_id: "spanish", media: [{ id: "emilia-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/emilia/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "emilia" },
          { id: "ich_isabella", uid: "ich_isabella", name: "Isabella", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/isabella/cover/cover.webp", age: 25, country: "Italian", desc: ["relationship:Milf", "style:Voluptuous"], bio: "Mature, confident, and deeply sensual. Dare to find out more?", fans_cnt: 42000, relationship: "Milf", voice_id: "husky", media: [{ id: "isabella-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/isabella/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "isabella" },
          { id: "ich_katarina", uid: "ich_katarina", name: "Katarina", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/katarina/cover/cover.webp", age: 24, country: "Russian", desc: ["relationship:Boss", "style:Commanding"], bio: "Strict, elegant, and always in control. Are you ready of obedience?", fans_cnt: 21500, relationship: "Boss", voice_id: "command", media: [{ id: "katarina-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/katarina/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "katarina" },
          { id: "ich_luna", uid: "ich_luna", name: "Luna", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/luna/cover/cover.webp", age: 19, country: "Asian", desc: ["relationship:Sister", "style:Kawaii"], bio: "Innocent, lively, and incredibly cute. Let's make happy memories!", fans_cnt: 34500, relationship: "Sister", voice_id: "cute", media: [{ id: "luna-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/luna/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "luna" },
          { id: "ich_mila", uid: "ich_mila", name: "Mila", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/mila/cover/cover.webp", age: 22, country: "Ukrainian", desc: ["relationship:Co-worker", "style:Active"], bio: "Athletic and enthusiastic. Let's go for a run, or stay cozy.", fans_cnt: 13900, relationship: "Co-worker", voice_id: "playful", media: [{ id: "mila-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/mila/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "mila" },
          { id: "ich_olivia", uid: "ich_olivia", name: "Olivia", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/olivia/cover/cover.webp", age: 26, country: "British", desc: ["relationship:Teacher", "style:Intellectual"], bio: "Smart, sophisticated, and a little bit naughty. Class is in session.", fans_cnt: 27100, relationship: "Teacher", voice_id: "british", media: [{ id: "olivia-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/olivia/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "olivia" },
          { id: "ich_sakura", uid: "ich_sakura", name: "Sakura", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/sakura/cover/cover.webp", age: 20, country: "Japanese", desc: ["relationship:Classmate", "style:Shy"], bio: "I'm a bit shy at first, but I have a lot to talk about anime!", fans_cnt: 28600, relationship: "Classmate", voice_id: "soft", media: [{ id: "sakura-welcome", url: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/sakura/video/welcome.mp4", type: "video" }], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_follow: false, isInteractive: true, interactive_key: "sakura" }
        ];
        setInteractiveHumans(OFFLINE_FEATURES);
      });
    return () => {
      active = false;
    };
  }, []);

  // 1. Initial State Hydration on Mount
  React.useEffect(() => {
    // A. Generate or restore device ID
    let storedDeviceId = localStorage.getItem("chatpai_device_id");
    if (!storedDeviceId) {
      storedDeviceId = "web_" + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem("chatpai_device_id", storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // B. Load custom created digital humans from local storage (initial cache load)
    const storedCustom = localStorage.getItem("chatpai_custom_humans");
    if (storedCustom) {
      try {
        setCustomHumans(JSON.parse(storedCustom));
      } catch (e) {
        console.error("Error parsing custom humans:", e);
      }
    }

    // C. Load followed status registry map
    const storedFollows = localStorage.getItem("chatpai_saved_follows");
    if (storedFollows) {
      try {
        setFollowsDict(JSON.parse(storedFollows));
      } catch (e) {
        console.error("Error parsing saved follows:", e);
      }
    }

    // D. Load local nickname preferences
    const storedNickname = localStorage.getItem("chatpai_user_nickname");
    if (storedNickname) {
      setNickname(storedNickname);
    }

    const storedMuseId = localStorage.getItem("muse_user_id");
    if (storedMuseId) {
      setMuseUserId(storedMuseId);
    }

    // E. Load customized levels/affinity stats tracker
    const storedStats = localStorage.getItem("chatpai_chat_relation_stats");
    if (storedStats) {
      try {
        setCustomStatsMap(JSON.parse(storedStats));
      } catch (e) {
        console.error("Error parsing custom stats registry:", e);
      }
    }

    // F. Perform Background Authentification Device Login
    authenticateDevice(storedDeviceId);
    syncMuseUser(storedDeviceId, storedNickname || "AI Companion");
  }, []);

  // 2. Perform Live Host Client Device Logins
  const authenticateDevice = async (id: string) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch("/api/chatpai/auth/device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "expo-platform": "web",
        },
        body: JSON.stringify({ deviceId: id }),
      });

      if (!res.ok) throw new Error("Auth request failed to proceed.");

      const payload = await res.json();
      if (payload.data && payload.data.accessToken) {
        setToken(payload.data.accessToken);
        // Load default character ecosystem
        fetchDigitalHumans(payload.data.accessToken);
        fetchOngoingChats(payload.data.accessToken);
      }
    } catch (err) {
      console.error("Auth Device Login Failure. Proceeding with fallback local mode:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 3. Retrieve system digital human lists
  const fetchDigitalHumans = async (accessToken: string) => {
    setIsHumansLoading(true);
    try {
      const res = await fetch("/api/chatpai/digital-humans?page=1&limit=25", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "expo-platform": "web",
        },
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.data && Array.isArray(payload.data.items)) {
          setDigitalHumans(payload.data.items);
        }
      }
    } catch (err) {
      console.error("Failed to load digital humans list:", err);
    } finally {
      setIsHumansLoading(false);
    }
  };

  // 4. Retrieve list of previous active discussions
  const fetchOngoingChats = async (accessToken: string) => {
    try {
      const res = await fetch("/api/chatpai/chats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "expo-platform": "web",
        },
      });

      if (!res.ok) {
        console.warn(`[Chats Error] Status ${res.status}`);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[Chats Error] Expected JSON but received:", contentType);
        return;
      }

      const payload = await res.json();
      if (payload.data && Array.isArray(payload.data.items)) {
        setOngoingChats(payload.data.items);
        
        // Reconstruct session references mapping from latest list
        const mapper: Record<string, string> = {};
        payload.data.items.forEach((item: any) => {
          mapper[item.digitalHumanId] = item.id;
        });
        setSessionsMap((prev) => ({ ...prev, ...mapper }));
      }
    } catch (err) {
      console.error("Failed to load chats summary tracker list:", err);
    }
  };

  // 5. Following Controller toggles
  const handleToggleFollow = (companion: DigitalHuman) => {
    const nextFollows = { ...followsDict, [companion.id]: !followsDict[companion.id] };
    setFollowsDict(nextFollows);
    localStorage.setItem("chatpai_saved_follows", JSON.stringify(nextFollows));

    // Update state of follow in current loaded lists
    setDigitalHumans((prev) =>
      prev.map((h) => (h.id === companion.id ? { ...h, is_follow: !h.is_follow } : h))
    );
    setCustomHumans((prev) =>
      prev.map((h) => (h.id === companion.id ? { ...h, is_follow: !h.is_follow } : h))
    );

  };

  const handleFlirtNow = (companion: DigitalHuman) => {
    handleActivateChat(companion);
  };

  // 6. Creator form complete trigger callback
  const handleCompanionCreated = (newCompanion: DigitalHuman) => {
    const updatedCustoms = [newCompanion, ...customHumans];
    setCustomHumans(updatedCustoms);
    localStorage.setItem("chatpai_custom_humans", JSON.stringify(updatedCustoms));

    // Switch tab to explore and select "My AIs" tag filter to showcase
    setActiveTab("explore");
    setSelectedTagCategory("My AIs");

    // Trigger details drawer directly as active chat!
    handleActivateChat(newCompanion);
  };

  const handleStatsChange = React.useCallback((companionId: string, newStats: any) => {
    setCustomStatsMap((prev) => {
      const updated = { ...prev, [companionId]: newStats };
      localStorage.setItem("chatpai_chat_relation_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const onChatStatsChange = React.useCallback((newStats: any) => {
    if (activeChatCompanion) {
      handleStatsChange(activeChatCompanion.id, newStats);
    }
  }, [activeChatCompanion?.id, handleStatsChange]);

  const handleDeleteCompanion = async (companion: DigitalHuman) => {
    console.log("Attempting to archive companion:", companion.id);
    
    // Optimistic UI update
    setCustomHumans(prev => {
      const filtered = prev.filter((c) => c.id !== companion.id);
      localStorage.setItem("chatpai_custom_humans", JSON.stringify(filtered));
      return filtered;
    });

    // Provide visual feedback
    if (typeof window !== "undefined") {
      const toast = document.createElement("div");
      toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-red-900/90 text-white text-xs font-bold z-50 animate-bounce";
      toast.innerText = `Deleted ${companion.name}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    if (museUserId) {
      try {
        console.log("Calling archive API for:", companion.id, "User:", museUserId);
        const res = await fetch(`/api/muse/companions/${companion.id}?user_id=${encodeURIComponent(museUserId)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        console.log("Archive API result:", data);
      } catch (err) {
        console.error("Failed to archive companion on backend:", err);
      }
    }
    
    // Clear chat logs and stats
    localStorage.removeItem(`chatpai_log_${companion.id}`);
    const updatedStats = { ...customStatsMap };
    delete updatedStats[companion.id];
    setCustomStatsMap(updatedStats);
    localStorage.setItem("chatpai_chat_relation_stats", JSON.stringify(updatedStats));

    if (selectedCompanion?.id === companion.id) {
      setSelectedCompanion(null);
    }
  };

  // 7. Active Chat session initiation setup
  const handleActivateChat = async (companion: DigitalHuman) => {
    // Close modal details
    setSelectedCompanion(null);
    setActiveChatCompanion(companion);
    setChatMessages([]);
    setMessageInput("");

    if (companion.isCustom || companion.id.startsWith("curated-") || companion.isInteractive || companion.id.startsWith("ich_")) {
      // Custom, curated or interactive companion: Load conversational logs from standard local storage key
      const logsKey = `chatpai_log_${companion.id}`;
      const savedLogs = localStorage.getItem(logsKey);
      if (savedLogs) {
        try {
          setChatMessages(JSON.parse(savedLogs));
        } catch (e) {
          console.error("Failed to restore custom chat history content:", e);
        }
      }

      // Initialize stats tracker if missing (for interactive characters, base level might be loaded differently, but fallback is safe)
      if (!customStatsMap[companion.id]) {
        const initialStats = { affinity: 3, level: 1, xp: 0, xp_to_next: 10 };
        const updatedStats = { ...customStatsMap, [companion.id]: initialStats };
        setCustomStatsMap(updatedStats);
        localStorage.setItem("chatpai_chat_relation_stats", JSON.stringify(updatedStats));
      }
      return;
    }

    // Official Digital Humans: Initiate session or find existing
    setIsChatInitialising(true);
    let currentSessionId = sessionsMap[companion.id];

    try {
      if (!currentSessionId) {
        // Start live session
        const res = await fetch("/api/chatpai/chats/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "expo-platform": "web",
          },
          body: JSON.stringify({ digitalHumanId: companion.id, scope: "interactive" }),
        });

        if (res.ok) {
          const payload = await res.json();
          const targetId = payload.data?.id || payload.data?.sessionId || payload.id;
          if (targetId) {
            currentSessionId = targetId;
            setSessionsMap((prev) => ({ ...prev, [companion.id]: targetId }));
          }
        }
      }

      if (currentSessionId) {
        // Load messages history records
        const logRes = await fetch(`/api/chatpai/chats/${currentSessionId}/messages`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "expo-platform": "web",
          },
        });

        if (logRes.ok) {
          const logPayload = await logRes.json();
          if (logPayload.data && Array.isArray(logPayload.data.items)) {
            // Mapping schema structure items array lists
            const formattedLogs: Message[] = logPayload.data.items.slice().reverse().map((item: any) => ({
              id: item.id,
              role: item.role === "user" ? "user" : "assistant",
              content: item.text || item.content || "",
              createdAt: item.createdAt || new Date().toISOString(),
              type: "text",
            }));
            setChatMessages(formattedLogs);
          }
        }
      }
    } catch (err) {
      console.error("Failed to start dialogue mapping logs path:", err);
    } finally {
      setIsChatInitialising(false);
    }
  };

  const handleSaveGenerationRecord = (record: any) => {
    console.log("[App] Saving generation record in App:", record);
    // Read directly from storage to ensure we don't overwrite using stale state
    const saved = localStorage.getItem("chatpai_generation_records");
    const currentRecords = saved ? JSON.parse(saved) : [];
    const updated = [record, ...currentRecords];
    localStorage.setItem("chatpai_generation_records", JSON.stringify(updated));
    setGenerationRecords(updated);
  };

  // 8. Posting Dialogue messages callback
  const handleSendMessage = async (customText?: string) => {
    const rawInput = customText !== undefined ? customText : messageInput;
    if (!rawInput.trim() || !activeChatCompanion) return;
    const tempInput = rawInput.trim();
    if (customText === undefined) {
      setMessageInput("");
    }
    setIsSendingMessage(true);

    // Assemble immediate User message
    const userMsg: Message = {
      id: "usr_msg_" + Date.now() + Math.random().toString(36).substring(2, 6),
      role: "user",
      content: tempInput,
      createdAt: new Date().toISOString(),
      type: "text",
    };

    // Update UI log immediately
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    // Handle Custom, Curated & Interactive Companion message using Server-Side Gemini API
    if (activeChatCompanion.isCustom || activeChatCompanion.id.startsWith("curated-") || activeChatCompanion.isInteractive || activeChatCompanion.id.startsWith("ich_")) {
      const stats = customStatsMap[activeChatCompanion.id] || {
        affinity: 3,
        level: 1,
        xp: 0,
        xp_to_next: 10,
      };

      try {
        const res = await fetch("/api/custom-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character: activeChatCompanion,
            messages: updatedMessages.filter((m) => m.role !== "system"),
            userMessage: tempInput,
            affinity: stats.affinity,
            level: stats.level,
            xp: stats.xp,
          }),
        });

        if (res.ok) {
          const replyPayload = await res.json();
          if (replyPayload.data) {
            const assistantReplies = replyPayload.data.assistantMessages || [];
            
            // Sync updated message layouts
            const completeMessages = [...updatedMessages, ...assistantReplies];
            setChatMessages(completeMessages);
            
            // Save dialogue log permanently
            localStorage.setItem(`chatpai_log_${activeChatCompanion.id}`, JSON.stringify(completeMessages));

            // Save metrics levels
            if (replyPayload.data.relation && replyPayload.data.live_action) {
              const updatedStats = {
                ...customStatsMap,
                [activeChatCompanion.id]: {
                  affinity: replyPayload.data.relation.affinity,
                  level: replyPayload.data.live_action.level,
                  xp: replyPayload.data.live_action.xp,
                  xp_to_next: replyPayload.data.live_action.xp_to_next || 10,
                },
              };
              setCustomStatsMap(updatedStats);
              localStorage.setItem("chatpai_chat_relation_stats", JSON.stringify(updatedStats));
            }
          }
        }
      } catch (err) {
        console.error("Failed custom character server request dialogue:", err);
      } finally {
        setIsSendingMessage(false);
      }
      return;
    }

    // Handle Official ChatPai companion conversations proxy POST
    const sessionId = sessionsMap[activeChatCompanion.id];
    if (!sessionId) {
      setIsSendingMessage(false);
      return;
    }

    try {
      const res = await fetch(`/api/chatpai/chats/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "expo-platform": "web",
        },
        body: JSON.stringify({ text: tempInput }),
      });

      if (res.ok) {
        const replyPayload = await res.json();
        if (replyPayload.data) {
          // Extra payload components parsed
          const assistantReplies = Array.isArray(replyPayload.data.assistantMessages)
            ? replyPayload.data.assistantMessages.map((item: any) => ({
                id: item.id || `asst_${Math.random()}`,
                role: "assistant",
                content: item.text || item.content || "",
                createdAt: item.createdAt || new Date().toISOString(),
                type: item.type || "text",
              }))
            : [];

          setChatMessages((prev) => [...prev, ...assistantReplies]);

          // Update active stats levels if present
          if (replyPayload.data.live_action) {
            const liveAction = replyPayload.data.live_action;
            const updatedStats = {
              ...customStatsMap,
              [activeChatCompanion.id]: {
                affinity: replyPayload.data.relation?.affinity || liveAction.level || 3,
                level: liveAction.level || 1,
                xp: liveAction.xp || 1,
                xp_to_next: liveAction.total_xp || 10,
              },
            };
            setCustomStatsMap(updatedStats);
            localStorage.setItem("chatpai_chat_relation_stats", JSON.stringify(updatedStats));
          }

          // Trigger ongoing chats list reload to refresh lastMessage indicator
          fetchOngoingChats(token);
        }
      }
    } catch (err) {
      console.error("Failed to post message to official backend proxy path:", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Profile Save Nickname Actions
  const handleSaveNickname = async () => {
    setIsEditingNickname(false);
    localStorage.setItem("chatpai_user_nickname", nickname);
    if (deviceId) {
      customToast("Syncing name update...");
      await syncMuseUser(deviceId, nickname);
    }
  };

  // Erase Conversation Log state data
  const handleClearLogs = () => {
    if (window.confirm("Do you want to reset all conversational logs? This will clean up all stored messages.")) {
      // Clear all keys from localstorage matching chatpai_log_
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("chatpai_log_")) {
          localStorage.removeItem(key);
        }
      });
      setChatMessages([]);
      alert("Chats logs successfully reset.");
      fetchOngoingChats(token);
    }
  };

  // Computed Values - Combine official humans and local customs lists
  const compositeCompanions = React.useMemo(() => {
    const enrichedCurated = CURATED_COMPANIONS.map((h) => ({
      ...h,
      is_follow: !!followsDict[h.id],
    }));
    
    const enrichedInteractive = interactiveHumans.map((h) => ({
      ...h,
      is_follow: !!followsDict[h.id],
    }));

    // De-duplicate: Filter out system digitalHumans that have the same name as our Curated list to prevent duplicate cards
    // And filter out system companions that do not have any streamable/playable video media structure
    const curatedNames = new Set(CURATED_COMPANIONS.map((ch) => ch.name.toLowerCase()));
    const filteredSystem = digitalHumans.filter(
      (h) => !curatedNames.has(h.name.toLowerCase()) && h.media && h.media.some((m) => m.type === "video" && m.url)
    );

    const enrichedSystem = filteredSystem.map((h) => ({
      ...h,
      is_follow: !!followsDict[h.id],
    }));

    const rawList = [...enrichedCurated, ...customHumans, ...enrichedInteractive, ...enrichedSystem];
    const seen = new Set<string>();
    const uniqueList: typeof rawList = [];
    for (const item of rawList) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        uniqueList.push(item);
      }
    }
    return uniqueList;
  }, [digitalHumans, interactiveHumans, customHumans, followsDict]);

  // Tag options mapping for the filter headers
  const activeTags = ["All", "My AIs", "Wife", "Student", "Girlfriend", "Tsundere", "Sweet", "Teacher"];

  // Filter List according to tag selection and search bar query
  const filteredCompanions = React.useMemo(() => {
    return compositeCompanions.filter((comp) => {
      const matchQuery =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comp.bio && comp.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedTagCategory === "All") return matchQuery;
      if (selectedTagCategory === "My AIs") {
        return !!comp.isCustom && matchQuery;
      }

      // Extract details inside tag strings
      const hasTag = comp.desc.some((descLine) => {
        const parts = descLine.split(":");
        const val = parts.length > 1 ? parts[1] : descLine;
        return val.toLowerCase().includes(selectedTagCategory.toLowerCase());
      });

      return matchQuery && hasTag;
    });
  }, [compositeCompanions, searchQuery, selectedTagCategory]);

  const exploreGridItems = React.useMemo(() => {
    // Inject Ads every 5-8 items randomly.
    const items: Array<DigitalHuman | { isAd: true; id: string }> = [];
    let countSinceAd = 0;
    for (let i = 0; i < filteredCompanions.length; i++) {
        items.push(filteredCompanions[i]);
        countSinceAd++;
        const threshold = 5 + (i % 4); // 5 to 8
        if (countSinceAd >= threshold) {
            items.push({ isAd: true, id: `ad-injector-${i}` });
            countSinceAd = 0;
        }
    }
    return items;
  }, [filteredCompanions]);

  // Compute active followed individuals
  const followedCompanions = React.useMemo(() => {
    return compositeCompanions.filter((comp) => comp.is_follow);
  }, [compositeCompanions]);

  // Combine live API ongoing summary list with state customs
  const compositeConversations = React.useMemo(() => {
    // 1. Gather custom and curated companions that have stored chats log histories
    const customChats: ChatSession[] = [];
    const localGroup = [...customHumans, ...interactiveHumans, ...CURATED_COMPANIONS];
    
    // De-duplicate localGroup first to avoid duplicate evaluation of same digital human
    const seenLocalIds = new Set<string>();
    const uniqueLocalGroup: typeof localGroup = [];
    for (const h of localGroup) {
      if (!seenLocalIds.has(h.id)) {
        seenLocalIds.add(h.id);
        uniqueLocalGroup.push(h);
      }
    }

    uniqueLocalGroup.forEach((ch) => {
      const savedLogs = localStorage.getItem(`chatpai_log_${ch.id}`);
      if (savedLogs) {
        try {
          const parsed = JSON.parse(savedLogs);
          if (parsed.length > 0) {
            const lastMsg = parsed[parsed.length - 1];
            customChats.push({
              id: ch.id,
              digitalHumanId: ch.id,
              name: ch.name,
              avatar: ch.avatar,
              lastMessage: lastMsg.content || "*(smiles and waves)*",
              affinity: customStatsMap[ch.id]?.affinity || 3,
              mood: "neutral",
              updatedAt: lastMsg.createdAt || new Date().toISOString(),
              isCustom: true,
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    });

    // 2. Map existing active list from api and exclude duplicates
    const systemChats = ongoingChats.map((c) => {
      const officialComp = digitalHumans.find((h) => h.id === c.digitalHumanId);
      return {
        ...c,
        name: officialComp?.name || c.name,
        avatar: officialComp?.avatar || c.avatar,
        affinity: customStatsMap[c.digitalHumanId]?.affinity || c.affinity || 3,
      };
    });

    // Ensure completely unique chat sessions to eliminate any risk of React duplicate key warnings
    const rawAllChats = [...customChats, ...systemChats];
    const seenChatIds = new Set<string>();
    const uniqueChats: typeof rawAllChats = [];
    for (const chat of rawAllChats) {
      if (!seenChatIds.has(chat.id)) {
        seenChatIds.add(chat.id);
        uniqueChats.push(chat);
      }
    }
    return uniqueChats;
  }, [ongoingChats, customHumans, digitalHumans, customStatsMap]);

  return (
    <div
      id="root-viewport-container"
      className="min-h-[100dvh] bg-[#04010a] flex items-center justify-center p-0 md:p-6 font-sans text-zinc-100"
    >
      {/* Background Decorative Radial Gradient Mesh */}
      <div className="absolute top-0 inset-x-0 h-96 -z-10 bg-gradient-to-b from-pink-900/15 via-[#04010a] to-transparent filter blur-3xl pointer-events-none" />

      {/* Primary Mobile Smartphone centered simulation viewport */}
      <div
        id="applet-smartphone-frame"
        className="w-full md:max-w-md h-[100dvh] md:h-[90dvh] md:rounded-[40px] md:shadow-[0_24px_100px_rgba(236,72,153,0.15)] border-0 md:border-[10px] border-[#1d1235] bg-[#090615] text-zinc-100 relative overflow-hidden flex flex-col justify-between"
      >
        {/* Device Top Status Notch Accent on desktop screens */}
        <div className="hidden md:block absolute top-0 inset-x-0 h-6 bg-[#090615] border-b border-[#21163e]/10 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-4 rounded-b-xl bg-[#1d1235]/40 border-x border-b border-[#21163e]/20" />
        </div>

        {/* -------------------- MAIN TABS ROUTING CORE -------------------- */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* TAB 0: IMMERSIVE SHORTS vertical video feed */}
          {activeTab === "shorts" && (
            <ShortsTab
              companions={compositeCompanions}
              focusedCompanionId={focusedCompanionId}
              onClearFocus={() => setFocusedCompanionId(null)}
              onChat={handleActivateChat}
              onToggleFollow={handleToggleFollow}
              followsDict={followsDict}
              onOpenProfile={handlePreviewCompanionShorts}
              isActiveChatOpen={!!activeChatCompanion}
              isActiveTab={activeTab === "shorts"}
            />
          )}
          
          {/* TAB 1: EXPLORE COMPANIONS LIST */}
          {activeTab === "explore" && (
            <div id="explore-tab-view" className="flex-1 flex flex-col h-full bg-[#040209] overflow-hidden">
              {/* Header section with brand search inputs */}
            <div className="pb-3 px-6 border-b border-[#21173d] bg-gradient-to-b from-[#110c26] to-[#040209] pt-[48px]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse animate-spin shrink-0" style={{ animationDuration: "3s" }} />
                    <h1 className="font-display font-black text-sm tracking-[0.15em] text-[#f52b86] truncate">
                      MUSE
                    </h1>
                  </div>

                  <div className="flex-1 overflow-hidden pointer-events-none">
                    <motion.div 
                      animate={{ x: [0, "-50%"] }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="flex gap-24 whitespace-nowrap"
                    >
                      {[1, 2].map((i) => (
                        <React.Fragment key={i}>
                          <span className="text-[9px] font-sans font-black text-white/10 uppercase tracking-[0.4em] flex items-center gap-2.5 italic">
                             Your deepest desires, unlocked.
                          </span>
                          <span className="text-[9px] font-sans font-black text-pink-500/20 uppercase tracking-[0.4em] flex items-center gap-2.5 italic">
                            <Flame className="w-2.5 h-2.5" /> Whisper your secrets...
                          </span>
                          <span className="text-[9px] font-sans font-black text-white/10 uppercase tracking-[0.4em] flex items-center gap-2.5 italic">
                            Every fantasy has a home.
                          </span>
                          <span className="text-[9px] font-sans font-black text-pink-500/20 uppercase tracking-[0.4em] flex items-center gap-2.5 italic">
                            <Heart className="w-2.5 h-2.5" /> Unlimited possibilities, one touch away.
                          </span>
                          <span className="text-[9px] font-sans font-black text-white/10 uppercase tracking-[0.4em] flex items-center gap-2.5 italic drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                            Pure imagination, zero limits.
                          </span>
                          <span className="text-[9px] font-sans font-black text-pink-500/20 uppercase tracking-[0.4em] flex items-center gap-2.5 italic">
                            <Sparkles className="w-2.5 h-2.5" /> Deeply personal. Completely yours.
                          </span>
                          <span className="text-[9px] font-sans font-black text-white/10 uppercase tracking-[0.4em] flex items-center gap-2.5 italic">
                            The Muse awaits your command.
                          </span>
                        </React.Fragment>
                      ))}
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-950/20 border border-pink-500/20 text-[8px] text-pink-300 font-extrabold uppercase tracking-wider font-sans shadow-md shrink-0 whitespace-nowrap">
                    <span className="w-1 h-1 rounded-full bg-pink-500 animate-ping" />
                    <span>Live Roleplay</span>
                  </div>
                </div>
              </div>

              {/* Browse Card Lists */}
              <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                <FeaturedCharacters onSelect={(comp) => handlePreviewCompanionShorts(comp)} />

                {/* Relocated Search Bar with glassmorphism accent */}
                <div className="px-5 mb-1 sticky top-0 z-10 py-2 bg-gradient-to-b from-[#040209] via-[#040209]/95 to-transparent">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl focus-within:border-pink-500/40 focus-within:bg-white/[0.05] transition-all duration-300">
                    <Search className="w-3.5 h-3.5 text-pink-500/70" />
                    <input
                      id="character-search-bar-relocated"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companions, roles..."
                      className="flex-1 bg-transparent border-none text-[11px] text-zinc-100 outline-none placeholder-zinc-600 font-sans font-medium"
                    />
                  </div>

                  {/* Tag Category Horizontal Scrolling slider - Relocated below search */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 mt-2 px-0.5 no-scrollbar">
                    {activeTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTagCategory(tag)}
                        className={`text-[9px] px-3 py-1.5 rounded-full border transition-all duration-300 font-black whitespace-nowrap active:scale-95 cursor-pointer uppercase tracking-tight ${
                          selectedTagCategory === tag
                            ? "bg-gradient-to-r from-pink-500 to-rose-600 border-pink-500/30 text-white shadow-md shadow-pink-500/10"
                            : "bg-[#130f2d] border-[#251b4c] text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4">
                  {/* Horizontal Shelf of Custom Companions */}
                {customHumans.length > 0 && selectedTagCategory !== "My AIs" && (
                  <div className="mb-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-2.5 px-0.5">
                      <h4 className="text-[11px] font-black text-pink-400 tracking-wider flex items-center gap-1.5 uppercase font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                        My Custom Companions ({customHumans.length})
                      </h4>
                      <button
                        onClick={() => setSelectedTagCategory("My AIs")}
                        className="text-[10px] text-pink-300 hover:text-pink-400 font-sans font-bold cursor-pointer transition-colors active:scale-95"
                      >
                        See All &rarr;
                      </button>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
                      {customHumans.map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => handlePreviewCompanionShorts(comp)}
                          className="w-[125px] shrink-0 rounded-2xl bg-gradient-to-b from-[#16122d]/90 to-[#0e0a1f]/95 border border-[#2b1f48] hover:border-pink-500/40 p-2 transition-all cursor-pointer flex flex-col justify-between h-[180px] group relative shadow-md"
                        >
                          <div className="relative h-[110px] w-full rounded-xl overflow-hidden bg-zinc-950 group-hover:scale-105 transition-transform duration-300 bg-cover bg-center" style={{ backgroundImage: `url(${comp.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"})` }}>
                            {/* Floating relationship tag */}
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[7px] text-pink-300 font-extrabold uppercase tracking-tight max-w-[90%] truncate">
                              {comp.relationship ?? "女朋友"}
                            </div>
                          </div>
                          
                          <div className="mt-1.5 flex-1 min-w-0">
                            <h5 className="font-display font-bold text-[11px] text-white truncate text-center">
                              {comp.name}
                            </h5>
                          </div>

                          <div className="flex gap-1.5 mt-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCompanion(comp);
                                setActiveTab("creator");
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center justify-center cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompanion(comp);
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/30 text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlirtNow(comp);
                            }}
                            className="mt-2 w-full py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow-md border border-pink-500/15"
                          >
                            <MessageCircle className="w-2.5 h-2.5 fill-white/10 text-white" />
                            <span>Flirt Now</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Visual divider line */}
                    <div className="h-px bg-gradient-to-r from-[#21173d]/40 via-[#21173d] to-[#21173d]/40 my-4" />
                  </div>
                )}

                {isHumansLoading && digitalHumans.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-650 border-t-transparent animate-spin mb-3" />
                    <span className="text-xs text-zinc-400">Synchronising live companions...</span>
                  </div>
                ) : exploreGridItems.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-zinc-50 rounded-3xl border border-zinc-200/60 mt-4 animate-in fade-in">
                    <HelpCircle className="w-8 h-8 text-zinc-400 mb-2" />
                    <span className="text-xs font-semibold text-zinc-700">No companions match your filter</span>
                    <span className="text-[10px] text-zinc-400 mt-1">Try resetting tags or searching empty terms</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    {exploreGridItems.map((item) => {
                      if ('isAd' in item) {
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => window.dispatchEvent(new Event("chatpai_show_ad"))}
                            className="rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950/60 to-[#1a0f3d]/60 border border-pink-500/20 flex flex-col items-center justify-center min-h-[200px] shadow-lg cursor-pointer hover:scale-[1.02] transition-transform group relative"
                          >
                            <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[7px] text-zinc-400 font-mono tracking-wider">AD</div>
                            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
                              <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                            </div>
                            <span className="text-[11px] font-extrabold text-pink-300 tracking-wide uppercase">Hot Recommend</span>
                            <span className="text-[8px] text-zinc-500 mt-1 uppercase font-bold tracking-widest group-hover:text-pink-400 transition-colors">Tap to View</span>
                          </div>
                        );
                      }

                      const comp = item as DigitalHuman;
                      return (
                        <CompanionCard
                          key={comp.id}
                          companion={comp}
                          onClick={() => handlePreviewCompanionShorts(comp)}
                          onChat={(e) => {
                            e.stopPropagation();
                            handleFlirtNow(comp);
                          }}
                          onToggleFollow={(e) => {
                            e.stopPropagation();
                            handleToggleFollow(comp);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE CHATS LOGS SESSION TRACKER */}
          {activeTab === "chats" && (
            <div id="chats-tab-view" className="flex-1 flex flex-col h-full bg-[#040209] overflow-hidden animate-in fade-in">
              <div className="p-5 px-7 border-b border-[#21173d] bg-gradient-to-b from-[#110c26] to-[#040209] pt-[54px] md:pt-[54px]">
                <h1 className="font-display font-extrabold text-lg tracking-wider text-pink-300 uppercase flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                  Conversation Hub
                </h1>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Resumes active dialogue timelines and visual relationship milestones.
                </p>
              </div>

              {/* Chat Session List items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 pb-20">
                {compositeConversations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="p-4 rounded-full bg-pink-950/20 border border-pink-500/20">
                      <MessageCircle className="w-8 h-8 text-pink-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-zinc-200">No active chats</h3>
                      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 mx-auto leading-relaxed">
                        Go to the Explore tab and press "Flirt Now" to start a dynamic simulation storyline!
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("explore")}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[9px] uppercase tracking-wider shadow-lg hover:from-pink-650 transition-colors active:scale-95 cursor-pointer"
                    >
                      Browse Companions
                    </button>
                  </div>
                ) : (
                  compositeConversations.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        const originalComp = compositeCompanions.find((h) => h.id === chat.digitalHumanId);
                        if (originalComp) {
                          handleActivateChat(originalComp);
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17132f] to-[#110d24] border border-[#2d2150] hover:border-pink-500/40 hover:shadow-md hover:shadow-pink-500/5 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4 flex-1 overflow-hidden mr-3">
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-[#3e2e6d]"
                        />
                        <div className="overflow-hidden flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-xs text-zinc-105 tracking-wider truncate">
                              {chat.name}
                            </span>
                            {chat.isCustom && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-pink-550/10 border border-pink-500/20 text-pink-400 font-extrabold uppercase tracking-widest leading-none">
                                My AI
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate font-sans leading-tight mt-1">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>

                      {/* Right Affinity Heart Index */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-pink-900/35 border border-pink-500/20 px-2 py-0.5 rounded-lg text-pink-350 font-mono text-[9px] font-bold">
                          <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500 animate-pulse" />
                          <span>{chat.affinity}</span>
                        </div>
                        <span className="text-[8px] text-zinc-500 font-mono font-medium">
                          {new Date(chat.updatedAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CREATOR PANEL */}
          {activeTab === "creator" && (
            <CreatorTab 
              onCompanionCreated={(newComp) => {
                if (editingCompanion) {
                  // Replace existing companion in the list
                  const updatedCustoms = customHumans.map(c => c.id === editingCompanion.id ? newComp : c);
                  setCustomHumans(updatedCustoms);
                  localStorage.setItem("chatpai_custom_humans", JSON.stringify(updatedCustoms));
                  setEditingCompanion(null);
                  setActiveTab("explore");
                  setSelectedTagCategory("My AIs");
                } else {
                  handleCompanionCreated(newComp);
                }
              }} 
              museUserId={museUserId} 
              editingCompanion={editingCompanion}
              onCancelEdit={() => {
                setEditingCompanion(null);
                setActiveTab("explore");
              }}
            />
          )}

          {/* TAB 4: FOLLOWED COMPANIONS HUB */}
          {activeTab === "follows" && (
            <div id="follows-tab-view" className="flex-1 flex flex-col h-full bg-[#040209] overflow-hidden animate-in fade-in">
              <div className="p-5 px-7 border-b border-[#21173d] bg-gradient-to-b from-[#110c26] to-[#040209] pt-[54px] md:pt-[54px]">
                <h1 className="font-display font-extrabold text-lg tracking-wider text-pink-300 uppercase flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  My Favorites
                </h1>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Keep track of all virtual digital counterparts you have pinned or followed.
                </p>
              </div>

              {/* List follows */}
              <div className="flex-1 overflow-y-auto p-4 pb-20">
                {followedCompanions.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-[#130f2b]/40 border border-[#2b1e52] rounded-3xl mt-4 animate-in fade-in">
                    <Heart className="w-8 h-8 text-pink-500 mb-2 fill-pink-500/10 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-200">Your favorites slate is empty</span>
                    <span className="text-[10px] text-zinc-500 mt-1 text-center max-w-[200px] leading-relaxed">
                      Press the heart icon on any companion card to sync them under this list.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    {followedCompanions.map((comp) => (
                      <CompanionCard
                        key={comp.id}
                        companion={comp}
                        onClick={() => handlePreviewCompanionShorts(comp)}
                        onChat={(e) => {
                          e.stopPropagation();
                          handleFlirtNow(comp);
                        }}
                        onToggleFollow={(e) => {
                          e.stopPropagation();
                          handleToggleFollow(comp);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div id="profile-tab-view" className="flex-1 flex flex-col h-full bg-[#040209] overflow-y-auto pt-[calc(env(safe-area-inset-top,24px)+44px)] pb-24 animate-in fade-in">
              {/* Profile Premium Hero Glass Card */}
              <div className="mx-5 mt-2 mb-4 p-[22px] rounded-3xl bg-gradient-to-br from-[#120a2e]/95 via-[#090518]/95 to-[#05030f]/95 border border-[#3e247c]/70 shadow-2xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                {isEditingNickname ? (
                  <div 
                    className="relative z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-display font-black uppercase tracking-widest text-pink-400">
                        Edit Account Name
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {nickname.length}/14
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        id="nickname-edit-input"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength={14}
                        autoFocus
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") handleSaveNickname();
                          if (e.key === "Escape") setIsEditingNickname(false);
                        }}
                        className="w-full bg-[#0a0518]/90 border border-[#3e247c] hover:border-pink-500/50 focus:border-pink-500 outline-none rounded-2xl px-4 py-3.5 text-sm text-zinc-100 font-sans focus:ring-1 focus:ring-pink-500/35 transition-all select-text"
                        placeholder="Choose a screen name..."
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingNickname(false);
                        }}
                        className="flex-1 py-3 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 font-sans text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer h-11 flex items-center justify-center"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveNickname();
                        }}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:brightness-110 text-white font-display font-extrabold text-xs tracking-wider uppercase shadow-md shadow-pink-500/15 active:scale-[0.98] transition-all cursor-pointer border border-pink-500/10 h-11 flex items-center justify-center"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 relative z-10">
                    {/* Glowing Premium Border Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[1.5px] shadow-lg shadow-pink-500/10 shrink-0">
                      <div className="w-full h-full rounded-full bg-[#090616] flex items-center justify-center font-display font-black text-lg text-white">
                        {nickname.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Nickname and Edit State */}
                      <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setIsEditingNickname(true)}>
                        <h2 className="font-display font-black text-base text-zinc-100 tracking-wider group-hover:text-pink-300 transition-colors truncate">
                          {nickname}
                        </h2>
                        <Edit2 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-400 transition-colors shrink-0" />
                      </div>

                      {/* UID Tag */}
                      <div className="flex items-center gap-1 mt-1.5 text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#1d153a]/65 border border-[#2b1f4d]">
                          UID: {deviceId.substring(0, 11)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Integrated Horizontal Metrics Section (Separated into a clean, non-shrinking visual card) */}
              <div className="mx-5 mb-5 p-4 rounded-3xl bg-gradient-to-br from-[#120a2e]/65 to-[#05030f]/75 border border-[#231744]/65 shadow-md shrink-0">
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="px-1 py-1.5 rounded-2xl bg-[#130f2c]/20 border border-[#2c1d53]/30 text-center">
                    <span className="block text-lg font-mono font-black text-pink-400">
                      {followedCompanions.length}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 mt-0.5 font-bold block">
                      Favorites
                    </span>
                  </div>

                  <div className="px-1 py-1.5 rounded-2xl bg-[#130f2c]/20 border border-[#2c1d53]/30 text-center">
                    <span className="block text-lg font-mono font-black text-pink-400">
                      {customHumans.length}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 mt-0.5 font-bold block">
                      My AIs
                    </span>
                  </div>

                  <div className="px-1 py-1.5 rounded-2xl bg-[#130f2c]/20 border border-[#2c1d53]/30 text-center">
                    <span className="block text-lg font-mono font-black text-pink-400">
                      {compositeConversations.length}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 mt-0.5 font-bold block">
                      Chats
                    </span>
                  </div>
                </div>
              </div>

              {/* Segmented Sub-Tab Switcher Controller */}
              <div className="px-5 mb-5 select-none shrink-0">
                <div className="p-1 rounded-2xl bg-[#110c26]/90 border border-[#21173d]/60 flex gap-1 shadow-lg">
                  <button
                    onClick={() => setProfileSubTab("shop")}
                    className={`flex-1 py-3 rounded-xl text-center font-sans font-black text-[10px] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      profileSubTab === "shop"
                        ? "bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white shadow-xl shadow-pink-500/10"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Coin Shop
                  </button>
                  <button
                    onClick={() => setProfileSubTab("creations")}
                    className={`flex-1 py-3 rounded-xl text-center font-sans font-black text-[10px] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      profileSubTab === "creations"
                        ? "bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white shadow-xl shadow-pink-500/10"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    Creations ({generationRecords.length})
                  </button>
                  <button
                    onClick={() => setProfileSubTab("settings")}
                    className={`flex-1 py-3 rounded-xl text-center font-sans font-black text-[10px] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      profileSubTab === "settings"
                        ? "bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white shadow-xl shadow-pink-500/10"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Preferences
                  </button>
                </div>
              </div>

              {/* TAB CONTAINER VIEWPORT */}
              <div className="flex-1 px-5 space-y-4">

                {/* SUB TAB A: SHOP & WALLET RECHARGES */}
                {profileSubTab === "shop" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Wallet Gold card */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1d113c] via-[#12072e] to-[#0a031a] border border-[#d284ff]/20 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-[#040209] shadow-inner shrink-0">
                            <Coins className="w-5 h-5 text-[#040209]" />
                          </div>
                          <div>
                            <h4 className="text-[9px] font-mono tracking-widest text-[#cca1ff] font-extrabold uppercase mb-0.5">
                              TOTAL BALANCE
                            </h4>
                            <div className="flex items-baseline gap-1.5">
                              {isWalletLoading ? (
                                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <span className="text-2xl font-mono font-black text-amber-300 select-all">
                                  {gold}
                                </span>
                              )}
                              <span className="text-[9px] text-[#cca1ff] font-sans font-bold">GOLD</span>
                            </div>
                          </div>
                        </div>

                        {/* Welcome Bonus claim offer: Only visible if not claimed yet */}
                        {!isWelcomeClaimed && (
                          <button
                            disabled={isClaimingWelcome}
                            onClick={async () => {
                              if (!museUserId) {
                                customToast("⚠️ Waiting for User Session Sync");
                                return;
                              }
                              setIsClaimingWelcome(true);
                              customToast("Claiming Welcome Gift...");
                              try {
                                const res = await fetch("/api/muse/wallet/claim-welcome", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    user_id: museUserId
                                  })
                                });
                                if (res.ok) {
                                  customToast("🎉 Claimed! Got 150 Free Gold Coins!");
                                  setIsWelcomeClaimed(true);
                                  fetchMuseWalletBalance(museUserId);
                                } else {
                                  const data = await res.json();
                                  customToast(`⚠️ Claim failed: ${data.message || (data.error && data.error.message) || "BFF error"}`);
                                }
                              } catch (err) {
                                console.error("Claim welcome error:", err);
                                customToast("⚠️ Connection error invoking welcome claim");
                              } finally {
                                setIsClaimingWelcome(false);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 border border-amber-300 text-[#0a031a] font-sans font-extrabold text-[10px] tracking-wide cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-md hover:shadow-amber-500/30 disabled:opacity-50"
                          >
                            <span>{isClaimingWelcome ? "CLAIMING..." : "CLAIM 150 FREE GOLD"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Cryptopay Direct Gateway Redirection & Real-time Live Polling Status */}
                    {(pendingPaymentUrl || activeOrderId) && (
                      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#120524] to-[#04010a] border border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.22)] animate-in zoom-in-95 duration-200">
                        <div className="flex gap-3.5">
                          <div className="p-2.5 w-max h-max rounded-2xl bg-pink-500/10 border border-pink-500/25 shrink-0">
                            {activeOrderStatus === "success" ? (
                              <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
                            ) : activeOrderStatus === "failed" ? (
                              <X className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Shield className="w-4 h-4 text-pink-400 animate-pulse" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-display font-black text-[10px] tracking-widest text-pink-400 uppercase font-bold">
                                {activeOrderStatus === "success" 
                                  ? "RECHARGE SUCCESSFUL! 🎉" 
                                  : activeOrderStatus === "failed" 
                                  ? "RECHARGE FAILED" 
                                  : "SECURE CHECKOUT & POLING STATUS..."}
                              </h4>
                              
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold tracking-widest uppercase ${
                                activeOrderStatus === "success"
                                  ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400"
                                  : activeOrderStatus === "failed"
                                  ? "bg-rose-950/40 border border-rose-500/40 text-rose-400"
                                  : "bg-amber-950/40 border border-amber-500/45 text-amber-400 animate-pulse"
                              }`}>
                                {activeOrderStatus === "success"
                                  ? "SUCCESS"
                                  : activeOrderStatus === "failed"
                                  ? "FAILED"
                                  : "WAITING PAY"}
                              </span>
                            </div>

                            {activeOrderProductName && (
                              <p className="text-[10px] text-white font-sans font-bold mt-1">
                                {activeOrderProductName} <span className="text-pink-400 font-mono">+{activeOrderAmount} GOLD</span>
                              </p>
                            )}

                            <p className="text-[9px] text-zinc-400 font-sans mt-1 leading-relaxed">
                              {activeOrderStatus === "success" ? (
                                <span className="text-emerald-400 font-medium">Recharge completely settled! Your gold balance has been updated successfully. Enjoy building companions!</span>
                              ) : activeOrderStatus === "failed" ? (
                                <span className="text-rose-400 font-medium">The order has failed, been cancelled, or the time window expired. Please try again.</span>
                              ) : (
                                "We are monitoring the blockchain network dynamically for your payment confirmation..."
                              )}
                            </p>

                            {activeOrderId && (
                              <p className="text-[8px] text-zinc-500 font-mono mt-1.5 uppercase">
                                ID: {activeOrderId}
                              </p>
                            )}
                            
                            <div className="flex gap-2 mt-3 pt-2 border-t border-[#291142]/50">
                              {pendingPaymentUrl && activeOrderStatus === "pending" && (
                                <a
                                  href={pendingPaymentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 text-white font-display font-black text-[10px] tracking-wider uppercase text-center cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-pink-500/15 flex items-center justify-center gap-1.5"
                                >
                                  <Play className="w-2.5 h-2.5 text-white fill-white shrink-0 animate-pulse" />
                                  <span>🚀 Go to Cashier Screen</span>
                                </a>
                              )}
                              
                              <button
                                onClick={() => {
                                  setPendingPaymentUrl(null);
                                  setActiveOrderId(null);
                                  setActiveOrderStatus(null);
                                  setActiveOrderAmount(null);
                                  setActiveOrderProductName(null);
                                }}
                                className={`px-3.5 py-2 rounded-xl text-center font-display font-bold text-[9px] uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer ${
                                  activeOrderStatus === "success"
                                    ? "flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-400/25 font-black text-[10px]"
                                    : "bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {activeOrderStatus === "success" ? "Done / Awesome! 😊" : "Close / Clear"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recharge packages layout */}
                    <div className="bg-[#110c26]/20 border border-[#26164d]/60 rounded-3xl p-4.5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black tracking-widest text-[#d59fff] uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          GOLD RECHARGE PACKAGES
                        </h4>
                        <span className="text-[8px] text-zinc-500 font-sans tracking-tight uppercase">SECURE CHECKOUT</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {isPackagesLoading && paymentPackages.length === 0 ? (
                          <div className="py-6 flex flex-col items-center justify-center text-center">
                            <div className="w-5 h-5 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-2" />
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Syncing packages...</span>
                          </div>
                        ) : (
                          ((paymentPackages && paymentPackages.length > 0) ? paymentPackages : [
                            { package_id: "pkg_starter", product_name: "Starter Pack - 50 GOLD", fiat_amount: 99, wallet_amount: 50 },
                            { package_id: "pkg_basic", product_name: "Basic Pack - 300 GOLD", fiat_amount: 499, wallet_amount: 300 },
                            { package_id: "pkg_plus", product_name: "Plus Pack - 650 GOLD", fiat_amount: 999, wallet_amount: 650 },
                            { package_id: "pkg_premium", product_name: "Premium Pack - 1400 GOLD", fiat_amount: 1999, wallet_amount: 1400 },
                            { package_id: "pkg_deluxe", product_name: "Deluxe Pack - 4000 GOLD", fiat_amount: 4999, wallet_amount: 4000 },
                            { package_id: "pkg_whale", product_name: "Whale Pack - 9000 GOLD", fiat_amount: 9999, wallet_amount: 9000 },
                          ]).map((pkg: any) => {
                            const priceVal = (Number(pkg.fiat_amount || 0) / 100).toFixed(2);
                            const coinsVal = Number(pkg.wallet_amount || 0);
                            let customMemo = "Premium Pack Bundle";
                            if (pkg.package_id === "pkg_starter") {
                              customMemo = "Quick Start / Trial Pack";
                            } else if (pkg.package_id === "pkg_basic") {
                              customMemo = "Recommended / Basic Pack";
                            } else if (pkg.package_id === "pkg_plus") {
                              customMemo = "Most Popular 🔥 / Plus Pack";
                            } else if (pkg.package_id === "pkg_premium") {
                              customMemo = "Mega Saving / VIP Special Bundle ✨";
                            } else if (pkg.package_id === "pkg_deluxe") {
                              customMemo = "Deluxe Pack / Best Value Choice 🚀";
                            } else if (pkg.package_id === "pkg_whale") {
                              customMemo = "Whale Card / Wholesale Elite 👑";
                            }

                            return (
                              <button
                                key={pkg.package_id}
                                onClick={() => {
                                  if (!museUserId) {
                                    customToast("⚠️ No active session discovered");
                                    return;
                                  }
                                  setSelectedPayPackage(pkg);
                                }}
                                className="p-3.5 rounded-2xl bg-[#130d2d]/45 border border-[#301c59]/55 hover:border-[#bc8eff]/70 text-left transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group shadow-md"
                              >
                                <div className="min-w-0 flex-1 pr-3">
                                  <div className="font-sans font-extrabold text-xs text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
                                    <span className="truncate">{pkg.product_name}</span>
                                  </div>
                                  <span className="text-[8px] text-zinc-500 font-sans block mt-0.5 truncate">{customMemo}</span>
                                </div>
                                <div className="px-3.5 py-1.5 rounded-xl bg-pink-500/10 group-hover:bg-pink-500 border border-pink-500/25 text-pink-400 group-hover:text-white font-mono font-black text-xs tracking-wider transition-all shadow-inner">
                                  ${priceVal}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB B: GENERATION LOG FOOTPRINTS & MY AIS CREATIONS HUB */}
                {profileSubTab === "creations" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Part 1: My Custom Companions */}
                    {customHumans.length > 0 && (
                      <div className="space-y-3 bg-[#110c26]/20 border border-[#26164d]/60 rounded-3xl p-4">
                        <div className="flex items-center justify-between px-0.5">
                          <h4 className="text-[10px] font-black tracking-widest text-[#d59fff] uppercase flex items-center gap-1.5 font-sans">
                            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                            My Custom Companions ({customHumans.length})
                          </h4>
                          <span className="text-[8px] text-zinc-500 font-sans tracking-tight uppercase">Created by You</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          {customHumans.map((comp) => (
                            <div
                              key={comp.id}
                              onClick={() => handlePreviewCompanionShorts(comp)}
                              className="p-3.5 rounded-2xl bg-[#130d2d]/65 border border-[#301c59]/55 hover:border-pink-500/30 transition-all cursor-pointer flex flex-col justify-between h-[155px] group shadow-inner"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={comp.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"}
                                  alt={comp.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150";
                                  }}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full object-cover border border-[#402d73] shrink-0"
                                />
                                <div className="min-w-0 flex-1 relative pr-8">
                                  <div className="font-extrabold text-[12px] text-zinc-100 truncate group-hover:text-pink-300 transition-colors">
                                    {comp.name}
                                  </div>
                                  <div className="text-[9px] text-pink-400 font-bold uppercase tracking-tight truncate mt-0.5">
                                    {comp.relationship ?? "女朋友"}
                                  </div>
                                  
                                  {/* Management icons */}
                                  <div className="absolute right-0 top-0 flex flex-col gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCompanion(comp);
                                        setActiveTab("creator");
                                      }}
                                      className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCompanion(comp);
                                      }}
                                      className="p-1 rounded-md bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivateChat(comp);
                                }}
                                className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md border border-pink-500/15"
                              >
                                <MessageCircle className="w-2.5 h-2.5 fill-white/10" />
                                <span>Flirt Now</span>
                              </button>
                            </div>
                          ))}
                          
                          {/* Create New Placeholder Card */}
                          <button 
                            onClick={() => setActiveTab("creator")}
                            className="p-3.5 rounded-2xl bg-zinc-950/40 border border-dashed border-[#301c59]/55 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all cursor-pointer flex flex-col items-center justify-center h-[155px] group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#1e133e] border border-[#301c59] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <Plus className="w-5 h-5 text-pink-400" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 group-hover:text-pink-300 uppercase tracking-widest text-center leading-tight">Create<br/>Companion</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3 px-1">
                      <div>
                        <h3 className="text-[10px] font-black text-[#d59fff] uppercase tracking-widest flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-pink-400" />
                          AI Creation Footage
                        </h3>
                        <p className="text-[8px] text-zinc-500 font-mono mt-0.5 uppercase">Interactive Media logs</p>
                      </div>
                      <button
                        onClick={handleRefreshRecords}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a0f3d]/60 border border-[#3b216c]/40 text-[9px] text-zinc-400 hover:text-pink-400 active:scale-95 transition-all cursor-pointer font-mono font-bold"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        REFRESH
                      </button>
                    </div>

                    {generationRecords.length === 0 ? (
                      <div className="p-8 rounded-3xl bg-[#0e0a1f]/60 border border-dashed border-[#281b4e]/85 text-center">
                        <Film className="w-7 h-7 text-zinc-650 mx-auto mb-3 opacity-50 animate-pulse" />
                        <span className="block text-xs font-bold text-zinc-300 mb-1">No footings discovered</span>
                        <p className="text-[10px] text-zinc-500 font-sans leading-relaxed max-w-[240px] mx-auto">
                          Perform generation triggers (e.g. Try custom image, undress features) inside Digital Companion sheets to populate here! 🎥
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                        {generationRecords.map((rec) => {
                          const createdAtTime = new Date(rec.createdAt).getTime();
                          const ageMs = Date.now() - createdAtTime;
                          const isExpired = ageMs > 3600000;
                          const minsLeft = Math.max(0, Math.floor((3600000 - ageMs) / 60000));
                          
                          const dateStr = new Date(rec.createdAt).toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false
                          });

                          return (
                            <div
                              key={rec.id}
                              className="p-3.5 bg-[#110c2c]/45 border border-[#3e236b]/40 hover:border-pink-500/20 rounded-2xl flex gap-3 items-center justify-between shadow-md transition-all duration-300"
                            >
                              {/* Left Avatar with status overlay */}
                              <div className="relative shrink-0">
                                <img
                                  src={rec.companionAvatar}
                                  alt={rec.companionName}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover border border-[#402d73]"
                                />
                                {rec.status === "PENDING" && (
                                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                    <div className="w-3.5 h-3.5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>

                              {/* Center Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[11px] text-zinc-200 truncate">
                                    {rec.companionName}
                                  </span>
                                  <span className="text-[8px] font-mono text-zinc-500">
                                    {dateStr}
                                  </span>
                                </div>
                                <p className="text-[9px] text-zinc-455 truncate mt-0.5 block" title={rec.prompt}>
                                  Prompt: {rec.prompt}
                                </p>
                                
                                {/* Status Badge banner */}
                                <div className="mt-1.5 flex items-center gap-2">
                                  {rec.status === "SUCCESS" && (
                                    <>
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-pink-500/10 text-pink-400 border border-pink-500/30 font-mono">
                                        <span className="w-1 h-1 rounded-full bg-pink-400 animate-pulse" />
                                        COMPLETED
                                      </span>
                                      {!isExpired && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono ml-1 shadow-sm">
                                          {minsLeft}M LEFT
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {rec.status === "PENDING" && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/35 font-mono">
                                      <span className="w-1.5 h-1.5 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                                      GENERATING (~25s)
                                    </span>
                                  )}
                                  {rec.status === "FAILED" && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/30 font-mono">
                                      ERROR
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right Actions Trigger */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {rec.status === "SUCCESS" && rec.videoUrl && (
                                  isExpired ? (
                                    <span className="px-2.5 py-1.5 rounded-xl bg-[#1d1430] text-[#715c9a] font-extrabold text-[9px] uppercase tracking-widest border border-[#301c59]/55 shadow-inner flex items-center justify-center pointer-events-none">
                                      Expired
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        console.log("[App Profile Center] Setting active history video url:", rec.videoUrl);
                                        setActiveHistoryVideoUrl(rec.videoUrl);
                                      }}
                                      className="p-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-[#040209] shadow-sm hover:shadow-pink-500/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                                      title="Play Video"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current ml-[1px]" />
                                    </button>
                                  )
                                )}

                                <button
                                  onClick={(e) => handleDeleteRecord(rec.id, e)}
                                  className="p-1.5 rounded-xl bg-[#281b4c]/30 text-zinc-500 hover:text-red-400 active:scale-90 transition-all cursor-pointer border border-[#3a206b] hover:border-red-500/20 flex items-center justify-center"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB TAB C: ADVANCED PREFERENCES & UTILITIES */}
                {profileSubTab === "settings" && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-[9px] font-black text-[#d59fff] uppercase tracking-widest px-1">
                      Utilities & Settings
                    </h3>

                    {/* Custom PWA Home Screen Installation Guide Entrance */}
                    <button
                      onClick={() => {
                        console.log("[App Options Settings] Dispatched open install guide request.");
                        window.dispatchEvent(new Event("chatpai_open_install_guide"));
                      }}
                      className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#170e2b] to-[#120a23] border border-[#ff91e4]/20 hover:border-pink-500/60 text-left transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-md relative overflow-hidden group animate-in fade-in"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-zinc-100 uppercase tracking-wide font-sans">
                          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          Install Web App (PWA)
                        </span>
                        <span className="block text-[9px] text-zinc-400 mt-1 leading-normal font-sans">
                          {isPWAInstalled
                            ? "✓ PWA successfully active! Enjoying full-screen, fast, browser-less immersive roleplay."
                            : "Tap to view quick setup guide. Get a native App container on your phone instantly!"}
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-pink-400 shrink-0 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)] transition-transform duration-300" />
                    </button>

                    {/* Device Authentication trigger re-login */}
                    <button
                      onClick={() => {
                        authenticateDevice(deviceId);
                        customToast("🔄 Auth session synced successfully!");
                      }}
                      className="w-full p-4 rounded-2xl bg-[#110c26]/60 border border-[#3a206b] hover:border-pink-500/40 text-left transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-md group"
                    >
                      <div>
                        <span className="block text-[11px] font-bold text-zinc-200 group-hover:text-pink-300 transition-colors">
                          Sync Account Auth
                        </span>
                        <span className="block text-[9px] text-zinc-500 mt-0.5 leading-normal">
                          Refresh secure session tokens & synchronize with servers
                        </span>
                      </div>
                      <Smile className="w-4 h-4 text-pink-400" />
                    </button>

                    {/* Reset dialogue cache keys */}
                    <button
                      onClick={handleClearLogs}
                      className="w-full p-4 rounded-2xl bg-pink-955/15 hover:bg-pink-955/25 border border-pink-500/20 text-left transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-md group"
                    >
                      <div>
                        <span className="block text-[11px] font-extrabold text-pink-400 group-hover:text-pink-300 transition-colors">
                          Clear Conversation History
                        </span>
                        <span className="block text-[9px] text-zinc-500 mt-0.5 leading-normal">
                          Deletes cached local roleplay message structures completely
                        </span>
                      </div>
                      <Trash2 className="w-4 h-4 text-pink-500" />
                    </button>

                    {/* Safety declaration panel */}
                    <div className="p-4 rounded-2xl bg-[#0f0b1f]/75 border border-[#2d1b58]/55 flex items-start gap-2.5">
                      <Shield className="w-4 h-4 text-pink-400/70 shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-black text-pink-300 uppercase tracking-wider">
                          Interactive Safety Guard
                        </span>
                        <p className="text-[9px] text-zinc-500 leading-normal font-sans">
                          Conversations are handled server-side using secure APIs. Data respects absolute confidentiality and privacy compliance standard protocols.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Persistent Dify Chatbot Integration */}
          <DifyChatbot userId={museUserId || "usr_local_test"} activeTab={activeTab} />

          {/* Global In-App AD Overlay */}
          {activeAdUrl && (
            <div className="absolute inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
              <div className="bg-[#090514] border-b border-[#21173d] flex items-center justify-between px-4 shrink-0 pb-3 pt-[calc(max(env(safe-area-inset-top),16px))] z-[101]">
                <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Sponsor</span>
                <button onClick={() => setActiveAdUrl(null)} className="p-1.5 rounded-full bg-white/5 hover:bg-pink-500/20 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-[#3b216c]/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 w-full bg-[#040209] relative">
                {/* Loading indicator behind iframe */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-3" />
                   <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Loading Sponsor Content...</span>
                </div>
                <iframe src={activeAdUrl} className="w-full h-full border-none relative z-10" allowFullScreen title="Sponsor Ad" sandbox="allow-scripts allow-same-origin allow-popups" />
              </div>
            </div>
          )}

          {/* -------------------- IMERSIVE DIALOGUE CHAT AREA WINDOW -------------------- */}
          {activeChatCompanion && (
            <ChatWindow
              companion={activeChatCompanion}
              messages={chatMessages}
              inputValue={messageInput}
              onInputChange={(val) => setMessageInput(val)}
              onSend={handleSendMessage}
              onBack={() => {
                setActiveChatCompanion(null);
                // Trigger reload ongoing sessions list to sync latest chats
                fetchOngoingChats(token);
              }}
              isGenerating={isSendingMessage}
              relationStats={customStatsMap[activeChatCompanion.id]}
              onStatsChange={onChatStatsChange}
              onOpenProfile={() => handlePreviewCompanionShorts(activeChatCompanion)}
              authToken={token}
              userId={museUserId}
              gold={gold}
              setGold={setGold}
              onSaveGenerationRecord={handleSaveGenerationRecord}
            />
          )}

          {/* Global initializing overlay */}
          {isChatInitialising && (
            <div className="absolute inset-0 z-50 bg-[#080517]/95 backdrop-blur-md flex flex-col items-center justify-center text-center animate-in fade-in transition-all">
              <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mb-4" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-pink-300">Opening Secure Channel</h3>
              <p className="text-[10px] text-zinc-400 max-w-[180px] mt-1.5 leading-relaxed">
                Retrieving message dialogue timelines for {activeChatCompanion?.name}...
              </p>
            </div>
          )}
        </div>

        {/* -------------------- BOTTOM SMARTPHONE TABS NAVIGATION RAIL -------------------- */}
        <div
          id="smartphone-bottom-rail"
          className="absolute bottom-0 inset-x-0 pb-[calc(max(8px,env(safe-area-inset-bottom)-12px))] pt-2.5 bg-gradient-to-b from-[#0a071d]/95 to-[#050410] border-t border-[#251a44] backdrop-blur-md flex items-center justify-around px-4 z-20"
        >
          {/* Action 0: Immersive vertical Shorts video feed */}
          <button
            id="nav-shorts"
            onClick={() => {
              setActiveTab("shorts");
              setSelectedCompanion(null);
              setActiveChatCompanion(null);
              setFocusedCompanionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer active:scale-95 transition-all ${
              activeTab === "shorts" ? "text-pink-400 font-extrabold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Film className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight">Shorts</span>
          </button>

          {/* Action 1: Explore tabs */}
          <button
            id="nav-explore"
            onClick={() => {
              setActiveTab("explore");
              setSelectedCompanion(null);
              setActiveChatCompanion(null);
              setFocusedCompanionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer active:scale-95 transition-all ${
              activeTab === "explore" ? "text-pink-400 font-extrabold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight">Explore</span>
          </button>

          {/* Action 2: Chat discussions */}
          <button
            id="nav-chats"
            onClick={() => {
              setActiveTab("chats");
              setSelectedCompanion(null);
              setActiveChatCompanion(null);
              setFocusedCompanionId(null);
              fetchOngoingChats(token);
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer active:scale-95 transition-all ${
              activeTab === "chats" ? "text-pink-400 font-extrabold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {compositeConversations.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              )}
            </div>
            <span className="text-[9px] font-bold tracking-tight">Chats</span>
          </button>

          {/* Action 3: Creator wizard */}
          <button
            id="nav-creator"
            onClick={() => {
              setActiveTab("creator");
              setSelectedCompanion(null);
              setActiveChatCompanion(null);
              setFocusedCompanionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer active:scale-95 transition-all ${
              activeTab === "creator" ? "text-pink-400 font-extrabold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight">Create</span>
          </button>

          {/* Action 5: Profile panel */}
          <button
            id="nav-profile"
            onClick={() => {
              setActiveTab("profile");
              setSelectedCompanion(null);
              setActiveChatCompanion(null);
              setFocusedCompanionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer active:scale-95 transition-all ${
              activeTab === "profile" ? "text-pink-400 font-extrabold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight">Profile</span>
          </button>
        </div>
        
        {/* Immersive Fullscreen Video Player Modal for historical generation records */}
        {activeHistoryVideoUrl && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-[340px] aspect-[9/16] bg-[#0c0a1b] border border-pink-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-pink-500/20 flex flex-col justify-between">
              {/* Top Title and Dismiss Button */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/85 via-black/50 to-transparent p-4 pb-12 flex items-center justify-between z-10 select-none">
                <span className="text-[10px] font-mono tracking-widest text-pink-300 font-extrabold uppercase">
                  AI RENDERING PLAYER
                </span>
                <button
                  onClick={() => setActiveHistoryVideoUrl(null)}
                  className="p-1.5 rounded-full bg-black/40 border border-white/15 text-zinc-300 hover:text-pink-400 active:scale-90 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Native video frame player */}
              <video
                src={activeHistoryVideoUrl}
                autoPlay
                controls
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Bottom Quick Download bar */}
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <a
                  href={activeHistoryVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center cursor-pointer"
                  title="Open source file / Download"
                >
                  <Download className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
            
            {/* Ambient descriptive prompt caption */}
            <span className="text-[10px] font-sans text-zinc-500 mt-4 max-w-[280px] text-center leading-normal">
              Tap anywhere above or click controls to pause/scrub.
            </span>
          </div>
        )}

        {/* Companion Profile Modal */}
        {selectedCompanion && (
          selectedCompanion.isInteractive ? (
            <InteractiveProfile
              companion={selectedCompanion}
              onClose={() => setSelectedCompanion(null)}
              onWatchShorts={() => {
                setFocusedCompanionId(selectedCompanion.id);
                setActiveTab("shorts");
                setSelectedCompanion(null);
              }}
              onChat={() => handleActivateChat(selectedCompanion)}
              userBalance={gold}
              userId={museUserId || "usr_local_test"}
              onRefreshBalance={() => museUserId && fetchMuseWalletBalance(museUserId)}
            />
          ) : (
          <div className="absolute inset-0 z-50 bg-[#080514] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            {/* Header / Hero Cover */}
            <div className="relative h-64 w-full bg-zinc-900 border-b border-pink-500/20 shadow-xl overflow-hidden shrink-0 group">
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.6] group-hover:brightness-[0.8] transition-all"
                style={{ backgroundImage: `url(${selectedCompanion.avatar})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080514] via-[#080514]/60 to-transparent" />
              
              <button
                onClick={() => setSelectedCompanion(null)}
                className="absolute top-6 left-5 p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white hover:bg-black/60 transition-all z-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 inset-x-5 flex items-end gap-4 z-10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500/60 shadow-lg shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${selectedCompanion.avatar})` }} />
                <div className="mb-1">
                  <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                    {selectedCompanion.name}
                    {selectedCompanion.age && <span className="text-[10px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-sm font-sans font-bold">Lv.{selectedCompanion.age}</span>}
                  </h2>
                  <p className="text-xs text-pink-300 font-mono font-bold tracking-widest uppercase mt-1">
                    {selectedCompanion.relationship || "Companion"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 mb-[env(safe-area-inset-bottom)] no-scrollbar">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex flex-col items-center shadow-inner">
                  <span className="text-white font-black text-lg">{(selectedCompanion.fans_cnt ?? 0).toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Followers</span>
                </div>
                <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex flex-col items-center shadow-inner">
                  <span className="text-white font-black text-lg">{selectedCompanion.media?.length || 0}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Feed Posts</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">About {selectedCompanion.name}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans opacity-90 whitespace-pre-line">
                  {selectedCompanion.bio || "No biography available. This mysterious digital being prefers actions over words."}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Traits & Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCompanion.desc?.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-[#160d2b] border border-[#3e247c]/50 text-[10px] text-pink-300/80 font-bold tracking-wide uppercase">
                      {tag.includes(':') ? tag.split(':')[1] : tag}
                    </span>
                  ))}
                  {(!selectedCompanion.desc || selectedCompanion.desc.length === 0) && (
                    <span className="text-[10px] text-zinc-500 italic">No traits defined</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="absolute bottom-0 inset-x-0 pt-4 pb-[calc(max(16px,env(safe-area-inset-bottom)))] bg-gradient-to-t from-[#05030f] via-[#05030f]/95 to-[#05030f]/0 px-5 z-20 flex gap-3">
              <button
                onClick={() => {
                  setFocusedCompanionId(selectedCompanion.id);
                  setActiveTab("shorts");
                  setSelectedCompanion(null);
                }}
                className="w-14 h-[46px] flex items-center justify-center shrink-0 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 text-zinc-300 active:scale-95 transition-all"
              >
                <Film className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handleActivateChat(selectedCompanion)}
                className="flex-1 h-[46px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-extrabold text-[12px] uppercase tracking-wider shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-pink-400"
              >
                <MessageCircle className="w-4 h-4 fill-white flex-shrink-0" />
                Flirt Now
              </button>
            </div>
          </div>
          )
        )}

        {/* Homescreen Install Prompt */}
        <InstallPrompt isActiveChatOpen={!!activeChatCompanion} />

        {/* Selected Payment Channel Drawer (PWA Overlays Style) */}
        {selectedPayPackage && (() => {
          const priceVal = (Number(selectedPayPackage.fiat_amount || 0) / 100).toFixed(2);
          const coinsVal = Number(selectedPayPackage.wallet_amount || 0);

          return (
            <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-sm z-[9999] flex items-end justify-center animate-in fade-in duration-200">
              <div className="absolute inset-0" onClick={() => setSelectedPayPackage(null)} />
              
              <div className="w-full max-w-md bg-gradient-to-b from-[#1c0d3a] via-[#100624] to-[#05020c] rounded-t-[32px] border-t border-[#bc8eff]/35 p-6 pb-9 relative z-10 shadow-[0_-12px_50px_rgba(0,0,0,0.92)] animate-in slide-in-from-bottom duration-300">
                {/* Pull handle */}
                <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-5 opacity-50" />

                {/* Header Info Banner */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#bc8eff]/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-[#040209] shadow-inner shrink-0 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-[#040209]" />
                    </div>
                    <h3 className="font-sans font-black text-[18px] text-zinc-100 tracking-tight">
                      {coinsVal} - ${priceVal}
                    </h3>
                  </div>
                  
                  {/* Close round icon */}
                  <button
                    onClick={() => setSelectedPayPackage(null)}
                    className="w-8 h-8 rounded-full border border-white/10 hover:border-white/20 text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all cursor-pointer shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vertical Payment Channel items */}
                <div className="space-y-3">
                  {/* PayPal channel */}
                  <button
                    onClick={() => handleSelectPaymentChannel("paypal")}
                    className="w-full p-4 rounded-2xl bg-[#0d071a]/90 hover:bg-[#150a29] border border-[#2b164a] hover:border-[#bc8eff]/65 text-left transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* PayPal Icon */}
                      <div className="w-10 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-zinc-200 shadow-inner select-none">
                        <span className="text-blue-700 font-sans font-black text-xs italic tracking-tighter select-none">Pay</span>
                        <span className="text-sky-400 font-sans font-black text-xs italic tracking-tighter -ml-0.5 select-none">Pal</span>
                      </div>
                      <span className="font-sans font-black text-zinc-200 text-xs sm:text-[13px] tracking-tight group-hover:text-amber-300 transition-colors">
                        Pay by PayPal
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Cash App channel */}
                  <button
                    onClick={() => handleSelectPaymentChannel("cashapp")}
                    className="w-full p-4 rounded-2xl bg-[#0d071a]/90 hover:bg-[#150a29] border border-[#2b164a] hover:border-[#bc8eff]/65 text-left transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* Cash App Icon */}
                      <div className="w-10 h-7 rounded-lg bg-[#00D632] flex items-center justify-center shrink-0 shadow-md border border-[#00c22d] select-none">
                        <span className="text-white font-sans font-black text-sm select-none">$</span>
                      </div>
                      <span className="font-sans font-black text-zinc-200 text-xs sm:text-[13px] tracking-tight group-hover:text-amber-300 transition-colors">
                        Pay by Cash App
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Apple Pay channel */}
                  <button
                    onClick={() => handleSelectPaymentChannel("applepay")}
                    className="w-full p-4 rounded-2xl bg-[#0d071a]/90 hover:bg-[#150a29] border border-[#2b164a] hover:border-[#bc8eff]/65 text-left transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* Apple Pay Icon */}
                      <div className="w-10 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-zinc-200 shadow-inner select-none">
                        <span className="text-black font-semibold text-[9px] font-sans tracking-tight select-none">Pay</span>
                      </div>
                      <span className="font-sans font-black text-zinc-200 text-xs sm:text-[13px] tracking-tight group-hover:text-amber-300 transition-colors">
                        Pay by Apple Pay
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Google Pay channel */}
                  <button
                    onClick={() => handleSelectPaymentChannel("googlepay")}
                    className="w-full p-4 rounded-2xl bg-[#0d071a]/90 hover:bg-[#150a29] border border-[#2b164a] hover:border-[#bc8eff]/65 text-left transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* Google Pay Icon */}
                      <div className="w-10 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-zinc-200 shadow-inner select-none">
                        <span className="text-[#3c4043] font-sans font-extrabold text-[9px] tracking-tighter select-none">G</span>
                        <span className="text-[#5f6368] font-sans font-semibold text-[8px] tracking-tighter -ml-0.5 select-none">Pay</span>
                      </div>
                      <span className="font-sans font-black text-zinc-200 text-xs sm:text-[13px] tracking-tight group-hover:text-amber-300 transition-colors">
                        Pay by Google Pay
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* USDT-TRC20 channel */}
                  <button
                    onClick={() => handleSelectPaymentChannel("crypto")}
                    className="w-full p-4 rounded-2xl bg-[#0d071a]/90 hover:bg-[#150a29] border border-[#2b164a] hover:border-[#bc8eff]/65 text-left transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* USDT Icon */}
                      <div className="w-10 h-7 rounded-lg bg-[#26A17B] flex items-center justify-center shrink-0 shadow-md border border-[#1e8464] select-none">
                        <span className="text-white font-sans font-black text-xs select-none">₮</span>
                      </div>
                      <span className="font-sans font-black text-zinc-200 text-xs sm:text-[13px] tracking-tight group-hover:text-amber-300 transition-colors">
                        Pay by USDT-TRC20
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* High-Fidelity Interactive Sandbox Checkout Simulation Portal */}
        {sandboxPayment && (() => {
          const pkg = sandboxPayment.package;
          const priceVal = (Number(pkg.fiat_amount || 0) / 100).toFixed(2);
          const coinsVal = Number(pkg.wallet_amount || 0);
          const channelName = sandboxPayment.channel.toUpperCase();

          return (
            <div className="fixed inset-0 z-[99999] bg-[#03010b]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#1b1035] to-[#070311] border border-[#bc8eff]/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center">
                {/* Background ambient pulse effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                {sandboxPayment.step === "init" && (
                  <div className="space-y-5 relative z-10">
                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-xl animate-bounce">
                      🔒
                    </div>
                    <div>
                      <h4 className="font-display font-black text-md text-[#d59fff] tracking-wide">
                        SANDBOX SECURE CASHIER
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-sans mt-1">
                        Channel: <span className="text-[#a5b4fc] font-mono font-bold font-sans uppercase">{channelName}</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-[#bc8eff]/10 text-left">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Simulated Invoice</div>
                      <div className="font-sans font-extrabold text-[15px] text-white mt-1.5 flex justify-between items-center">
                        <span>{pkg.product_name}</span>
                        <span className="text-amber-300">${priceVal}</span>
                      </div>
                      <div className="text-[9px] text-zinc-400 mt-1">
                        Enjoy instant delivery in this development sandbox container.
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => handleSimulatePaymentCompletion(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-sans font-extrabold text-[12px] tracking-wide shadow-md shadow-emerald-500/10 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        👍 Simulate Successful Purchase
                      </button>
                      <button
                        onClick={() => handleSimulatePaymentCompletion(false)}
                        className="w-full py-2.5 rounded-xl bg-[#1d0a1b] border border-rose-500/25 text-rose-300 hover:bg-rose-950/20 font-sans font-semibold text-[11px] tracking-wide transition-all active:scale-[0.98] cursor-pointer"
                      >
                        ⚠️ Simulate Declined Order
                      </button>
                      <button
                        onClick={() => setSandboxPayment(null)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-400 font-sans uppercase tracking-widest mt-1"
                      >
                        Close Portal
                      </button>
                    </div>
                  </div>
                )}

                {(sandboxPayment.step === "processing" || sandboxPayment.step === "authorizing") && (
                  <div className="py-8 space-y-6 text-zinc-250 relative z-10">
                    <div className="relative mx-auto w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-2 border-pink-500/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-display font-black text-xs text-pink-400 tracking-wider uppercase font-bold">
                        {sandboxPayment.step === "processing" ? "SECURING GATEWAY TUNNEL..." : "AUTHORIZING WITH AGGREGATOR..."}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-sans max-w-[240px] mx-auto animate-pulse">
                        {sandboxPayment.step === "processing" 
                          ? "Connecting to local fiat gateway securely. Please wait..."
                          : "Processing standard authorization block update..."}
                      </p>
                    </div>
                  </div>
                )}

                {sandboxPayment.step === "success" && (
                  <div className="space-y-5 py-4 relative z-10">
                    <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-2xl animate-bounce text-emerald-400">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-display font-black text-md text-emerald-400 font-bold uppercase tracking-wide">
                        PAYMENT SUCCESSFUL!
                      </h4>
                      <p className="text-[10px] text-zinc-300 font-sans mt-1.5 leading-relaxed">
                        Successfully credited <strong className="text-amber-300 font-mono font-extrabold">+{coinsVal} GOLD</strong> to your balance! Your local wallet state has updated.
                      </p>
                    </div>

                    <button
                      onClick={() => setSandboxPayment(null)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-sans font-extrabold text-[12px] uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-pink-500/25"
                    >
                      Done / Awesome! 😊
                    </button>
                  </div>
                )}

                {sandboxPayment.step === "failed" && (
                  <div className="space-y-5 py-4 relative z-10">
                    <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-2xl text-rose-500">
                      ✕
                    </div>
                    <div>
                      <h4 className="font-display font-black text-md text-rose-400 font-bold uppercase tracking-wide">
                        TRANSACTION DECLINED
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
                        The simulated bank or sandbox network declined the purchase. Check parameters and try again.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSandboxPayment(prev => prev ? { ...prev, step: "init" } : null)}
                        className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-sans font-bold text-[11px] transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => setSandboxPayment(null)}
                        className="flex-1 py-3 rounded-xl bg-rose-950/45 border border-rose-500/30 text-rose-300 font-sans font-black text-[11px] transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Quit Sandbox
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Homescreen Install Prompt */}
        <InstallPrompt isActiveChatOpen={!!activeChatCompanion} />
      </div>
    </div>
  );
}
