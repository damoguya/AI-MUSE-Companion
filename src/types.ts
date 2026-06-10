export interface Media {
  id: string;
  url: string;
  type: "video" | "image";
}

export interface DigitalHuman {
  id: string;
  uid: string;
  name: string;
  avatar: string;
  age: number;
  country: string;
  desc: string[]; // e.g. ["relationship:Wife", "character:Slow to warm up", ...]
  bio: string;
  fans_cnt: number;
  relationship: string;
  voice_id: string;
  media: Media[];
  created_at: string;
  updated_at: string;
  is_follow: boolean;
  isCustom?: boolean; // If custom created by user
  isInteractive?: boolean; // If one of the 10 featured interactive characters
  interactive_key?: string; // Original character_key for interactive APIs
  initialVideoIndex?: number;
}

export interface ChatSession {
  id: string;
  digitalHumanId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  affinity: number;
  mood: string;
  updatedAt: string;
  isCustom?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  type: "text" | "voice";
  voiceUrl?: string;
  durationSec?: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  web_device_id: string;
}
