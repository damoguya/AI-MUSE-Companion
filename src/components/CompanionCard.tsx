import React from "react";
import { Flame, Heart, MessageSquare, Play, Sparkles } from "lucide-react";
import { DigitalHuman } from "../types";

interface CompanionCardProps {
  key?: React.Key;
  companion: DigitalHuman;
  onClick: () => void;
  onChat: (e: React.MouseEvent) => void;
  onToggleFollow: (e: React.MouseEvent) => void;
}

export default function CompanionCard({
  companion,
  onClick,
  onChat,
  onToggleFollow,
}: CompanionCardProps) {
  // Helper to parse "key:value" tags (e.g. "relationship:Wife")
  const parsedTags = React.useMemo(() => {
    return companion.desc.map((d) => {
      const idx = d.indexOf(":");
      if (idx !== -1) {
        return {
          key: d.substring(0, idx),
          value: d.substring(idx + 1),
        };
      }
      return { key: "tag", value: d };
    });
  }, [companion.desc]);

  // Extract core tags for quick header display
  const roleTag = parsedTags.find((t) => t.key === "relationship")?.value || "Companion";
  const occTag = parsedTags.find((t) => t.key === "occupation")?.value;
  const personalityTag = parsedTags.find((t) => t.key === "character")?.value;

  return (
    <div
      id={`card-${companion.id}`}
      onClick={onClick}
      className="group relative aspect-[3/4.5] rounded-[24px] overflow-hidden bg-zinc-900 border border-[#2b1f48] hover:border-pink-500/50 hover:shadow-2xl transition-all duration-500 cursor-pointer active:scale-[0.98] select-none"
    >
      {/* Background Avatar Image - Fills the card */}
      <div
        className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-1000 brightness-90 group-hover:brightness-100 bg-cover bg-center"
        style={{ backgroundImage: `url(${companion.avatar})` }}
      />

      {/* Top Floating Badge dock */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
        <button
          id={`follow-btn-${companion.id}`}
          onClick={onToggleFollow}
          className={`p-1.5 rounded-full backdrop-blur-md border transition-all duration-300 active:scale-90 ${
            companion.is_follow
              ? "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20"
              : "bg-black/30 border-white/10 text-zinc-300 hover:text-white"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${companion.is_follow ? "fill-white" : ""}`} />
        </button>

        <div className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[8px] text-pink-300 font-bold tracking-widest uppercase">
          {companion.age} Y/O
        </div>
      </div>

      {/* Central interaction indicator - Reels Preview */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/25 pointer-events-none">
        <div className="px-3 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-pink-400 fill-current animate-pulse" />
          <span className="text-[10px] font-black uppercase text-pink-100 tracking-wider">Preview Reels</span>
        </div>
      </div>

      {/* Bottom Information Overlay - Integrated gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-display text-base font-black text-white tracking-tight drop-shadow-lg truncate">
                {companion.name}
              </h3>
              {companion.isCustom && (
                <span className="text-[7px] px-1.5 py-0.5 rounded bg-pink-500 border border-pink-400 text-white font-black uppercase tracking-widest translate-y-[-1px]">
                  MY AI
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-90 truncate">
               <span className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                {roleTag}
              </span>
              <span className="text-zinc-500 text-[8px]">•</span>
              <span className="text-[9px] text-zinc-300 font-medium truncate">
                {personalityTag || occTag || "Companion"}
              </span>
            </div>
          </div>

          <button
            id={`quick-chat-${companion.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onChat(e);
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-zinc-100 font-display font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all shadow-xl border border-pink-400/20 active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
            <span>Flirt Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
