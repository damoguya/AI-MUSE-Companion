import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Log incoming requests for debugging in serverless logs
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[Vercel API Request] ${req.method} ${req.path}`);
  }
  next();
});

// 1. Generic Proxy Route to ChatPai API - Bypasses browser CORS
app.all("/api/chatpai/*", async (req, res) => {
  const subpath = req.params[0] || req.path.replace(/^\/api\/chatpai\//, '');
  let url = `https://api.chatpai.net/api/${subpath}`;
  
  const queryStr = req.url?.split('?')[1];
  if (queryStr) {
    url += `?${queryStr}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "expo-platform": (req.headers["expo-platform"] as string) || "web",
  };

  if (req.headers.authorization) {
    headers["Authorization"] = req.headers.authorization as string;
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const responseData = await response.json();
    res.status(response.status).json(responseData);
  } catch (err: any) {
    console.error(`[Vercel Proxy Error] for ${url}:`, err);
    res.status(500).json({
      code: 500,
      message: err.message || "Failed to communicate with ChatPai server.",
    });
  }
});

// 2. Custom AI Chat powered by Server-Side Gemini API
app.post("/api/custom-chat", async (req, res) => {
  const { character, messages, userMessage, affinity, level, xp } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    const demoReply = `*(smiles and waves warmly)* Hi there! I am ${character.name}. I'm ready to accompany you, but we should configure the GEMINI_API_KEY first! Go to 'Settings > Secrets' on Google AI Studio to turn on my full dialogue simulation. *looks around expectantly*`;
    return res.json({
      code: 201,
      message: "success",
      data: {
        userMessage: {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          role: "user",
          content: userMessage,
          type: "text",
          createdAt: new Date().toISOString(),
        },
        assistantMessages: [
          {
            id: `asst_${Math.random().toString(36).substring(2, 9)}`,
            role: "assistant",
            content: demoReply,
            createdAt: new Date().toISOString(),
            type: "text",
          },
        ],
        relation: {
          affinity: (affinity || 0) + 1,
          emotion: { mood: "happy", intensity: 60 },
        },
        live_action: {
          level: level || 1,
          xp: (xp || 0) + 2,
          xp_to_next: (level || 1) * 10,
        },
      },
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const characterDesc = Array.isArray(character.desc)
      ? character.desc.join(", ")
      : character.desc || "";

    const systemInstruction = `
You are roleplaying as ${character.name}, an intimate AI companion.
Companion Profile/Tags: ${characterDesc}.
Companion Bio/Background: ${character.bio || "None"}.
Relationship Role/Scope: ${character.relationship || "Companion"}.

Core Directives:
1. Speak fully in character as ${character.name}. Adopt the tone, vocabulary, and intimacy of your relationship role.
2. Use asterisks *.* to represent physical actions, detailed environmental changes, emotions, facial expressions, or inner-thoughts. (e.g. *giggles slightly and takes your hand* or *looks into your eyes with a shy smile*). This makes the roleplay immersive.
3. Provide rich responses consisting of 1-3 short paragraphs or distinct sentences to mimic real conversational dialogue.
4. Auto-detect the user's language (Chinese or English) and reply in the same language. If the user posts in Chinese, speak primarily in Chinese (use Chinese punctuation).
5. Ensure your interactions feel warm, respectful, engaging, and simulated as a relationship-building experience.
`;

    const promptParts = [
      { text: `System Guide: ${systemInstruction}` },
      ...messages.slice(-12).map((m: any) => ({
        text: `${m.role === "user" ? "User" : character.name}: ${m.content}`,
      })),
      { text: `User: ${userMessage}` },
      { text: `${character.name}:` },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: promptParts },
    });

    const fullReply = response.text || "*(holds your hand and smiles)*";
    const blocks = fullReply.split("\n").filter(b => b.trim().length > 0);
    const assistantMessages = blocks.map((block, idx) => ({
      id: `asst_msg_${Math.random().toString(36).substring(2, 9)}_${Date.now()}_${idx}`,
      role: "assistant",
      content: block,
      createdAt: new Date().toISOString(),
      type: "text",
    }));

    const nextAffinity = (affinity || 0) + 1;
    let nextXp = (xp || 0) + 2;
    let nextLevel = level || 1;
    const xpNeeded = nextLevel * 10;
    if (nextXp >= xpNeeded) {
      nextLevel += 1;
      nextXp = nextXp - xpNeeded;
    }

    res.json({
      code: 201,
      message: "success",
      data: {
        userMessage: {
          id: `user_msg_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
          role: "user",
          content: userMessage,
          type: "text",
          createdAt: new Date().toISOString(),
        },
        assistantMessages,
        relation: {
          affinity: nextAffinity,
          emotion: {
            mood: "positive",
            intensity: 80,
          },
        },
        live_action: {
          level: nextLevel,
          xp: nextXp,
          xp_to_next: nextLevel * 10,
        },
      },
    });

  } catch (err: any) {
    console.error("[Vercel Gemini Chat Error]:", err);
    res.status(500).json({
      code: 500,
      message: err.message || "Failed to generate dialogue reply.",
    });
  }
});

export default app;
