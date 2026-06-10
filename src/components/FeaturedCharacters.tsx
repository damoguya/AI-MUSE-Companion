import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Crown, Star, Play, ChevronRight } from 'lucide-react';
import { DigitalHuman, Media } from '../types';

interface FeaturedCharactersProps {
  onSelect: (companion: DigitalHuman) => void;
}

// Map database interactive character schema to our standard DigitalHuman schema
const mapInteractiveToDigitalHuman = (char: any): DigitalHuman => {
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

  // Generate a semi-stable "random" number based on the name
  const seed = (char.display_name || char.character_key || char.name || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const fans = 12000 + (seed % 38000);

  return {
    id: char.id || `ich_${char.character_key}`,
    uid: char.id || `ich_${char.character_key}`,
    name: char.display_name || char.character_key,
    avatar: char.cover_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
    age: char.attributes?.age ? parseInt(char.attributes?.age, 10) : 21,
    country: char.attributes?.ethnicity || "Caucasian",
    desc: descList,
    bio: char.bio || `Connect with ${char.display_name || char.character_key} for live action high fidelity interactive stories.`,
    fans_cnt: fans,
    relationship: relationship,
    voice_id: char.voice_id || "sweet",
    media: media,
    created_at: char.created_at || new Date().toISOString(),
    updated_at: char.updated_at || new Date().toISOString(),
    is_follow: false,
    isInteractive: true,
    interactive_key: char.character_key
  };
};

// Static, robust offline fallback matching standard Keys
const FEATURED_COMPANIONS: DigitalHuman[] = [
  {
    id: "ich_coco",
    uid: "ich_coco",
    name: "Coco",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/coco/cover/cover.webp",
    age: 21,
    country: "Caucasian",
    desc: ["relationship:Girlfriend", "style:Sexy"],
    bio: "I love attention and having fun. Shall we play a game?",
    fans_cnt: 25400,
    relationship: "Girlfriend",
    voice_id: "sweet",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_darkangel666",
    uid: "ich_darkangel666",
    name: "Dark Angel",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/darkangel666/cover/cover.webp",
    age: 23,
    country: "Gothic",
    desc: ["relationship:Mistress", "style:Dark"],
    bio: "Embrace the darkness with me. I have many secrets to share.",
    fans_cnt: 18930,
    relationship: "Mistress",
    voice_id: "sultry",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_elodie",
    uid: "ich_elodie",
    name: "Elodie",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/elodie/cover/cover.webp",
    age: 22,
    country: "French",
    desc: ["relationship:Girlfriend", "style:Elegant"],
    bio: "Sophisticated and charming. Ready for a romantic adventure?",
    fans_cnt: 15210,
    relationship: "Girlfriend",
    voice_id: "french",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_emilia",
    uid: "ich_emilia",
    name: "Emilia",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/emilia/cover/cover.webp",
    age: 20,
    country: "Latin",
    desc: ["relationship:Wife", "style:Flirty"],
    bio: "Passionate and full of energy. Let me brighten your day.",
    fans_cnt: 31050,
    relationship: "Wife",
    voice_id: "spanish",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_isabella",
    uid: "ich_isabella",
    name: "Isabella",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/isabella/cover/cover.webp",
    age: 25,
    country: "Italian",
    desc: ["relationship:Milf", "style:Voluptuous"],
    bio: "Mature, confident, and deeply sensual. Dare to find out more?",
    fans_cnt: 42100,
    relationship: "Milf",
    voice_id: "husky",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_katarina",
    uid: "ich_katarina",
    name: "Katarina",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/katarina/cover/cover.webp",
    age: 24,
    country: "Russian",
    desc: ["relationship:Boss", "style:Commanding"],
    bio: "Strict, elegant, and always in control. Are you ready of obedience?",
    fans_cnt: 21540,
    relationship: "Boss",
    voice_id: "command",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_luna",
    uid: "ich_luna",
    name: "Luna",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/luna/cover/cover.webp",
    age: 19,
    country: "Asian",
    desc: ["relationship:Sister", "style:Kawaii"],
    bio: "Innocent, lively, and incredibly cute. Let's make happy memories!",
    fans_cnt: 34580,
    relationship: "Sister",
    voice_id: "cute",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_mila",
    uid: "ich_mila",
    name: "Mila",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/mila/cover/cover.webp",
    age: 22,
    country: "Ukrainian",
    desc: ["relationship:Co-worker", "style:Active"],
    bio: "Athletic and enthusiastic. Let's go for a run, or stay cozy.",
    fans_cnt: 13920,
    relationship: "Co-worker",
    voice_id: "playful",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_olivia",
    uid: "ich_olivia",
    name: "Olivia",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/olivia/cover/cover.webp",
    age: 26,
    country: "British",
    desc: ["relationship:Teacher", "style:Intellectual"],
    bio: "Smart, sophisticated, and a little bit naughty. Class is in session.",
    fans_cnt: 27140,
    relationship: "Teacher",
    voice_id: "british",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
  {
    id: "ich_sakura",
    uid: "ich_sakura",
    name: "Sakura",
    avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/muse/generated/interactive-characters/sakura/cover/cover.webp",
    age: 20,
    country: "Japanese",
    desc: ["relationship:Classmate", "style:Shy"],
    bio: "I'm a bit shy at first, but I have a lot to talk about anime!",
    fans_cnt: 28620,
    relationship: "Classmate",
    voice_id: "soft",
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_follow: false,
    isInteractive: true
  },
];

export default function FeaturedCharacters({ onSelect }: FeaturedCharactersProps) {
  const [characters, setCharacters] = React.useState<DigitalHuman[]>(FEATURED_COMPANIONS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch("/api/interactive/characters")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load interactive characters list");
        return res.json();
      })
      .then((data) => {
        if (active && data.characters && Array.isArray(data.characters)) {
          const mapped = data.characters.map((char: any) => mapInteractiveToDigitalHuman(char));
          setCharacters(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using offline fallback for interactive characters:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="py-2 mb-2">
      <div className="px-6 mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30 shrink-0">
            <Crown className="w-4 h-4 text-pink-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-display font-black text-white tracking-widest uppercase truncate">
              Interactives
            </h3>
            <p className="text-[10px] text-pink-400/80 font-mono font-bold uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Live Action &bull; Unlock Spicy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.div 
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="hidden sm:flex items-center gap-1 px-2 py-1"
          >
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Swipe</span>
            <ChevronRight className="w-2.5 h-2.5 text-zinc-600" />
          </motion.div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">
            <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
            <span className="text-[9px] font-bold text-zinc-400">Featured</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar">
        {characters.map((companion) => (
          <motion.div
            key={companion.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(companion)}
            className="relative w-[180px] h-[260px] shrink-0 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl shadow-pink-500/5 border border-white/5"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110 brightness-[0.8] group-hover:brightness-[0.95] bg-cover bg-center"
              style={{ backgroundImage: `url(${companion.avatar})` }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            {/* Top Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              <Sparkles className="w-2.5 h-2.5 text-pink-500" />
              <span className="text-[9px] font-mono font-black text-pink-300 uppercase">
                Interactive
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
              <div>
                <h4 className="text-sm font-display font-black text-white tracking-tight drop-shadow-xl justify-between flex items-center gap-1">
                  <span>{companion.name}</span>
                  {companion.age && <span className="font-sans font-medium text-[8px] opacity-70">Lv.{companion.age}</span>}
                </h4>
                <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
                  <span className="text-[8px] font-bold text-pink-400 uppercase tracking-widest bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                    {companion.relationship}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-zinc-300">{(companion.fans_cnt || 25000).toLocaleString()}</span>
                </div>
                <div className="p-1 px-2 rounded-lg bg-pink-500 group-hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/20">
                    <Play className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Glass Border Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
