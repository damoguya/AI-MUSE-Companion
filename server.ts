import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Load welcome offer claimed users
  const CLAIMS_FILE = path.join(process.cwd(), "welcomes_claimed.json");
  let claimedUsers: Record<string, boolean> = {};
  if (fs.existsSync(CLAIMS_FILE)) {
    try {
      claimedUsers = JSON.parse(fs.readFileSync(CLAIMS_FILE, "utf8"));
    } catch (e) {
      console.error("Failed to load claims file:", e);
    }
  }

  const saveClaims = () => {
    try {
      fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claimedUsers, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save welcomes_claimed.json:", err);
    }
  };

  app.use(express.json());

  // Logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // 1. ChatPai Proxy
  app.all("/api/chatpai/*", async (req, res) => {
    const subpath = req.params[0];
    let url = `https://api.chatpai.net/api/${subpath}`;
    const queryStr = req.url.split('?')[1];
    if (queryStr) url += `?${queryStr}`;

    try {
      const response = await fetch(url, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": req.headers.authorization || "",
          "expo-platform": (req.headers["expo-platform"] as string) || "web",
        },
        body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (err: any) {
      console.error(`[ChatPai Proxy Error]:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Gemini Custom Chat
  app.post("/api/custom-chat", async (req, res) => {
    const { character, messages, userMessage, affinity, level, xp } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ code: 201, data: { assistantMessages: [{ content: "Gemini API Key missing!" }] } });
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Roleplay as ${character.name}. ${character.bio}. User says: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      res.json({
        code: 201,
        data: {
          assistantMessages: [{ content: text, role: "assistant", type: "text", createdAt: new Date().toISOString() }],
          relation: { affinity: (affinity || 0) + 1 },
          live_action: { level: level || 1, xp: (xp || 0) + 2 }
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. FastVideo Proxy
  app.post("/api/fastvideo/generation", async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log(`[FastVideo] Request received. Auth: ${authHeader ? "Present" : "Missing"}`);
    try {
      const apiKey = process.env.NSFW_API_KEY || "sk-EPpJlT2T9JqX5hqcmSg8mmfcXGgPiMZrQuJJLMNLgatqgAqQ";
      const resp = await fetch("http://47.84.110.241:3333/v1/video/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(req.body)
      });
      const data = await resp.json();
      console.log(`[FastVideo] Response status: ${resp.status}`, data);
      res.status(resp.status).json(data);
    } catch (err: any) { 
      console.error("[FastVideo] Proxy Error:", err);
      res.status(500).json({ error: err.message }); 
    }
  });

  app.get("/api/fastvideo/generation/:taskId", async (req, res) => {
    try {
      const apiKey = process.env.NSFW_API_KEY || "sk-EPpJlT2T9JqX5hqcmSg8mmfcXGgPiMZrQuJJLMNLgatqgAqQ";
      const resp = await fetch(`http://47.84.110.241:3333/v1/video/generations/${req.params.taskId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      res.status(resp.status).json(await resp.json());
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 4. Muse BFF Service Integration
  const CREATOR_SERVICE_URL = process.env.CREATOR_SERVICE_URL || "http://47.84.10.197:8031";
  const CREATOR_API_SECRET = process.env.CREATOR_API_SECRET || "muse-creator-dev-secret-change-me";
  const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || "http://47.84.10.197:8030";
  const WALLET_API_SECRET = process.env.WALLET_API_SECRET || "muse-wallet-dev-secret-change-me";

  async function serviceFetch(baseUrl: string, secret: string, path: string, init: RequestInit = {}) {
    const url = `${baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${secret}`, 
          ...(init.headers || {}) 
        },
      });

      const text = await res.text();
      let data;
      try { 
        data = JSON.parse(text); 
      } catch (e) { 
        data = { raw: text }; 
      }

      if (!res.ok) {
        console.error(`[Service Error] ${res.status} ${url}:`, data);
        throw { status: res.status, error: data };
      }
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error(`[Service Timeout] ${url} took too long`);
        throw { status: 504, error: { message: "Service timeout" } };
      }
      console.error(`[Service Fetch Error] ${url}:`, err.message || err);
      throw { status: err.status || 500, error: err.error || { message: err.message || "Upstream service failure" } };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  app.post("/api/muse/ensure-user", async (req, res) => {
    try { res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, "/v1/users/ensure", { method: "POST", body: JSON.stringify(req.body) })); }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  app.get("/api/muse/companions", async (req, res) => {
    const userId = req.query.user_id;
    if (!userId || userId === "undefined" || userId === "null") {
      console.warn("[API] fetch companions aborted: missing or invalid user_id", { userId });
      return res.status(400).json({ error: { message: "user_id is required and must be valid" } });
    }
    try { 
      const data = await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/companions`);
      res.json(data); 
    }
    catch (e: any) { 
      console.error("[API] companions fetch error:", e);
      res.status(e.status || 500).json(e.error || { message: e.message || "BFF execution failed" }); 
    }
  });

  app.post("/api/muse/companions", async (req, res) => {
    const userId = req.body.user_id;
    if (!userId || userId === "undefined" || userId === "null") {
      console.warn("[API] create companion aborted: missing or invalid user_id", { userId });
      return res.status(400).json({ error: { message: "user_id is required and must be valid" } });
    }
    try { 
      const { user_id, ...restBody } = req.body;
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/companions`, { method: "POST", body: JSON.stringify(restBody) })); 
    }
    catch (e: any) { 
      console.error("[API] companions create error:", e);
      res.status(e.status || 500).json(e.error || { message: e.message || "BFF execution failed" }); 
    }
  });

  app.patch("/api/muse/companions/:id", async (req, res) => {
    const userId = req.body.user_id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id is required" });
    try {
      const { user_id, ...restBody } = req.body;
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/companions/${req.params.id}`, { 
        method: "PATCH", 
        body: JSON.stringify(restBody) 
      }));
    } catch (e: any) {
      res.status(e.status || 500).json(e.error || { message: e.message });
    }
  });

  app.delete("/api/muse/companions/:id", async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id is required" });
    try {
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/companions/${req.params.id}`, { method: "DELETE" }));
    } catch (e: any) {
      res.status(e.status || 500).json(e.error || { message: e.message });
    }
  });

  app.post("/api/muse/generate-image", async (req, res) => {
    const userId = req.body.user_id;
    const companionId = req.body.companion_id;
    if (!userId || !companionId) return res.status(400).json({ error: "user_id and companion_id are required" });
    try {
      const { user_id, companion_id, ...restBody } = req.body;
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/companions/${companionId}/generate-image`, { 
        method: "POST", 
        body: JSON.stringify(restBody) 
      }));
    } catch (e: any) {
      res.status(e.status || 500).json(e.error || { message: e.message });
    }
  });

  app.get("/api/muse/generation-jobs/:id", async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id is required" });
    try {
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/generation-jobs/${req.params.id}`));
    } catch (e: any) {
      res.status(e.status || 500).json(e.error || { message: e.message });
    }
  });

  app.get("/api/muse/wallet/balance", async (req, res) => {
    try { res.json(await serviceFetch(WALLET_SERVICE_URL, WALLET_API_SECRET, `/v1/wallets/${req.query.user_id}/GOLD`)); }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  app.get("/api/muse/wallet/claim-status", (req, res) => {
    res.json({ claimed: !!claimedUsers[req.query.user_id as string] });
  });

  app.post("/api/muse/wallet/claim-welcome", async (req, res) => {
    const { user_id } = req.body;
    if (claimedUsers[user_id]) return res.status(400).json({ error: "Already claimed" });
    try {
      const data = await serviceFetch(WALLET_SERVICE_URL, WALLET_API_SECRET, `/v1/wallets/grant`, {
        method: "POST",
        body: JSON.stringify({ user_id, amount: 150, currency: "GOLD", source_type: "welcome_claim", source_id: `w_${user_id}`, idempotency_key: `w_${user_id}` })
      });
      claimedUsers[user_id] = true;
      saveClaims();
      res.json(data);
    } catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  const generateSimulatedUsPayer = (channel: string) => {
    const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Perez", "Hall", "Young", "Allen", "Sanchez", "Wright", "King", "Scott", "Green", "Baker", "Adams", "Nelson"];
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const payerName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 89) + 10}@${domains[Math.floor(Math.random() * domains.length)]}`;
    
    const areaCodes = ["212", "347", "646", "718", "213", "310", "415", "626", "818", "312", "773", "214", "512", "713", "206", "305", "407"];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const exchangeCode = Math.floor(Math.random() * 800) + 200;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    const payerPhone = `${areaCode}${exchangeCode}${lineNumber}`;
    
    const ipPrefixes = [
      "172.56", "72.210", "98.138", "67.59", "24.120", "69.140", "107.77", "108.162", "47.144", "174.192"
    ];
    const ipPrefix = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)];
    const payerIpv4 = `${ipPrefix}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
    
    const rrCodes: Record<string, string> = {
      "cash_app": "60",
      "apple_pay": "61",
      "google_pay": "62",
      "paypal": "63",
      "card": "80"
    };
    const rrCode = rrCodes[channel] || "63";
    
    return {
      rrCode,
      payer_name: payerName,
      payer_email: email,
      payer_phone: payerPhone,
      payer_ipv4: payerIpv4
    };
  };

  app.get("/api/muse/payment/packages", async (req, res) => {
    try { res.json(await serviceFetch(WALLET_SERVICE_URL, WALLET_API_SECRET, "/v1/payments/packages")); }
    catch (e) {
      res.json({ packages: [
        { package_id: "pkg_1", product_name: "50 GOLD", fiat_amount: 99, wallet_amount: 50 },
        { package_id: "pkg_2", product_name: "300 GOLD", fiat_amount: 499, wallet_amount: 300 }
      ]});
    }
  });

  app.post("/api/muse/payment/create-order", async (req, res) => {
    try { 
      const origin = req.headers.origin || req.headers.referer || "https://ais-pre-hmklgpcpsgloh3x2k56ym7-229869602755.asia-east1.run.app";
      const provider = req.body.provider || "usdt_gateway";
      const channel = req.body.channel || "crypto";
      
      const payload: any = { 
        user_id: req.body.user_id,
        package_id: req.body.package_id,
        provider, 
        channel,
        metadata: {
          redirect_url: origin,
          return_url: origin,
          callback_url: `${origin}/api/payment/callback`
        }
      };

      if (provider === "vtpay_us") {
        const simulatedPayer = generateSimulatedUsPayer(channel);
        payload.metadata = {
          ...payload.metadata,
          rrCode: simulatedPayer.rrCode,
          payer_name: simulatedPayer.payer_name,
          payer_email: simulatedPayer.payer_email,
          payer_phone: simulatedPayer.payer_phone,
          payer_ipv4: simulatedPayer.payer_ipv4
        };
      }

      res.json(await serviceFetch(WALLET_SERVICE_URL, WALLET_API_SECRET, "/v1/payments/orders", { 
        method: "POST", 
        body: JSON.stringify(payload) 
      })); 
    }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  app.post("/api/muse/payment/simulate-credit", async (req, res) => {
    const { user_id, amount } = req.body;
    if (!user_id || !amount) return res.status(400).json({ error: "Missing billing payload params" });
    const uniqId = `sim_pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    try {
      const data = await serviceFetch(WALLET_SERVICE_URL, WALLET_API_SECRET, `/v1/wallets/grant`, {
        method: "POST",
        body: JSON.stringify({
          user_id,
          amount: Number(amount),
          currency: "GOLD",
          source_type: "fiat_sandbox_recharge",
          source_id: uniqId,
          idempotency_key: uniqId
        })
      });
      res.json({ success: true, wallet: data });
    } catch (e: any) {
      console.warn("Wallet credit failed or offline, sandbox complete:", e);
      res.status(200).json({ message: "Completed offline sandbox simulation", ok: true });
    }
  });

  app.get("/api/muse/payment/order/:id", async (req, res) => {
    try { res.json(await serviceFetch(WALLET_SERVICE_URL, WALLET_API_SECRET, `/v1/payments/orders/${req.params.id}?user_id=${req.query.user_id}`)); }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  // 5. Interactive Character Routes
  app.get("/api/interactive/characters", async (req, res) => {
    try { res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, "/v1/interactive/characters")); }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  app.get("/api/interactive/characters/:key/profile", async (req, res) => {
    const userId = req.query.user_id || "usr_local_fallback";
    const charKey = req.params.key;
    console.log(`[API] Fetching profile for ${charKey}, user: ${userId}`);
    try { 
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${userId}/interactive/characters/${charKey}/profile`)); 
    }
    catch (e: any) { 
      console.error(`[API] Profile fetch error for ${charKey}:`, e);
      res.status(e.status || 500).json(e.error || e); 
    }
  });

  app.post("/api/interactive/characters/:key/actions/:actionKey/unlock", async (req, res) => {
    try { 
      const { user_id, ...restBody } = req.body;
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${user_id}/interactive/characters/${req.params.key}/actions/${req.params.actionKey}/unlock`, { method: "POST", body: JSON.stringify(restBody) })); 
    }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  app.post("/api/interactive/characters/:key/actions/:actionKey/play", async (req, res) => {
    try { 
      const { user_id, ...restBody } = req.body;
      res.json(await serviceFetch(CREATOR_SERVICE_URL, CREATOR_API_SECRET, `/v1/users/${user_id}/interactive/characters/${req.params.key}/actions/${req.params.actionKey}/play`, { method: "POST", body: JSON.stringify(restBody) })); 
    }
    catch (e: any) { res.status(e.status || 500).json(e.error || e); }
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Catch-all API
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  // Vite / Static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  // Health check for upstream services
  const checkUpstreamHealth = async () => {
    try {
      console.log(`[Health] Checking Muse Creator service: ${CREATOR_SERVICE_URL}/v1/health`);
      const res = await fetch(`${CREATOR_SERVICE_URL}/v1/health`, {
        headers: { "Authorization": `Bearer ${CREATOR_API_SECRET}` }
      });
      console.log(`[Health] Muse Creator status: ${res.status}`);
    } catch (e: any) {
      console.warn(`[Health] Muse Creator unreachable: ${e.message}`);
    }
  };
  checkUpstreamHealth();
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
