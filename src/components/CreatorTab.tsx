import React from "react";
import {
  Sparkles,
  Smile,
  Heart,
  Globe,
  User,
  Ruler,
  Scissors,
  Palette,
  Shirt,
  Compass,
  ArrowLeft,
  ArrowRight,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Edit2,
  Check,
  Search,
  Music,
  Briefcase,
  Layers,
  ChevronRight,
  Film,
  Camera,
  MessageSquare,
  MousePointerClick
} from "lucide-react";
import { DigitalHuman, Media } from "../types";
import { CURATED_COMPANIONS } from "../curated_companions";

interface CreatorTabProps {
  onCompanionCreated: (companion: DigitalHuman) => void;
  museUserId?: string;
  editingCompanion?: DigitalHuman | null;
  onCancelEdit?: () => void;
}

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

// PRESETS & ASSETS
const ETHNICITIES = [
  { id: "Caucasian", name: "Caucasian", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/ethnicity/caucasian.mp4" },
  { id: "Asian", name: "Asian", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/ethnicity/asian.mp4" },
  { id: "Black / Afro", name: "Black / Afro", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/ethnicity/black_afro.mp4" },
  { id: "Latina", name: "Latina", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/ethnicity/latina.mp4" },
  { id: "Arab", name: "Arab", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/ethnicity/arab.mp4" }
];

const BODIES = [
  { id: "Skinny", name: "Skinny", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/body/skinny.jpg", desc: "Skinny" },
  { id: "Athletic", name: "Athletic", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/body/athletic.jpg", desc: "Athletic" },
  { id: "Average", name: "Average", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/body/average.jpg", desc: "Average" },
  { id: "Curvy", name: "Curvy", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/body/curvy.jpg", desc: "Curvy" },
  { id: "BBW", name: "BBW", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/body/bbw.jpg", desc: "BBW" }
];

const BREASTS = [
  { id: "Small", name: "Small", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/breast/small.jpg", desc: "Small" },
  { id: "Medium", name: "Medium", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/breast/medium.jpg", desc: "Medium" },
  { id: "Large", name: "Large", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/breast/large.jpg", desc: "Large" },
  { id: "Extra Large", name: "Extra Large", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/breast/extra_large.jpg", desc: "Extra Large" }
];

const HAIRSTYLES = [
  { id: "Straight", name: "Straight", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_style/straight.mp4" },
  { id: "Bangs", name: "Bangs", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_style/bangs.mp4" },
  { id: "Curly", name: "Curly", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_style/curly.mp4" },
  { id: "Bun", name: "Bun", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_style/bun.mp4" },
  { id: "Short", name: "Short", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_style/short.mp4" },
  { id: "Ponytail", name: "Ponytail", video: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_style/ponytail.mp4" }
];

const HAIRCOLORS = [
  { id: "Brunette", name: "Brunette", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_color/brunette.webp", desc: "Brunette" },
  { id: "Blonde", name: "Blonde", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_color/blonde.webp", desc: "Blonde" },
  { id: "Black", name: "Black", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_color/black.webp", desc: "Black" },
  { id: "Redhead", name: "Redhead", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_color/redhead.webp", desc: "Redhead" },
  { id: "Pink", name: "Pink", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/hair_color/pink.webp", desc: "Pink" }
];

const CLOTHINGS = [
  { id: "Belly Dancer", name: "Belly Dancer", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Belly_Dancer.webp" },
  { id: "Bikini", name: "Bikini", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Bikini.webp" },
  { id: "Casual", name: "Casual", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Casual.webp" },
  { id: "Cheerleader", name: "Cheerleader", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Cheerleader.webp" },
  { id: "Corset", name: "Corset", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Corset.webp" },
  { id: "Crop Top", name: "Crop Top", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Crop_Top.webp" },
  { id: "Fancy Dress", name: "Fancy Dress", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Fancy_Dress.webp" },
  { id: "Flight Attendant", name: "Flight Attendant", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Flight_Attendant.webp" },
  { id: "Goth", name: "Goth", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Goth.webp" },
  { id: "Hijab", name: "Hijab", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Hijab.webp" },
  { id: "Hoodie", name: "Hoodie", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Hoodie.webp" },
  { id: "Jeans", name: "Jeans", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Jeans.webp" },
  { id: "Latex Outfit", name: "Latex Outfit", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Latex_Outfit.webp" },
  { id: "Leather Harness", name: "Leather Harness", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Leather_Harness.webp" },
  { id: "Leather Outfit", name: "Leather Outfit", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Leather_Outfit.webp" },
  { id: "Leggings", name: "Leggings", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Leggings.webp" },
  { id: "Lingerie", name: "Lingerie", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Lingerie.webp" },
  { id: "Long Dress", name: "Long Dress", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Long_Dress.webp" },
  { id: "Maid", name: "Maid", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Maid.webp" },
  { id: "Military", name: "Military", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Military.webp" },
  { id: "Nurse", name: "Nurse", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Nurse.webp" },
  { id: "Oversized Shirt", name: "Oversized Shirt", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Oversized_Shirt.webp" },
  { id: "Pencil Dress", name: "Pencil Dress", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Pencil_Dress.webp" },
  { id: "Police", name: "Police", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Police.webp" },
  { id: "Pop Star", name: "Pop Star", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Pop_Star.webp" },
  { id: "Pyjamas", name: "Pyjamas", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Pyjamas.webp" },
  { id: "School Outfit", name: "School Outfit", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/School_Outfit.webp" },
  { id: "Secretary", name: "Secretary", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Secretary.webp" },
  { id: "Silk Robe", name: "Silk Robe", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Silk_Robe.webp" },
  { id: "Skirt", name: "Skirt", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Skirt.webp" },
  { id: "Sport", name: "Sport", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Sport.webp" },
  { id: "Summer Dress", name: "Summer Dress", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Summer_Dress.webp" },
  { id: "Swimsuit", name: "Swimsuit", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Swimsuit.webp" },
  { id: "Tank Top", name: "Tank Top", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Tank_Top.webp" },
  { id: "Teacher", name: "Teacher", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Teacher.webp" },
  { id: "Tennis", name: "Tennis", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Tennis.webp" },
  { id: "Tight Shorts", name: "Tight Shorts", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Tight_Shorts.webp" },
  { id: "Yoga Outfit", name: "Yoga Outfit", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/clothing/Yoga_Outfit.webp" }
];

const PERSONALITIES = [
  { emoji: "☕", label: "Slow to warm up" },
  { emoji: "🙈", label: "Shy & Bashful" },
  { emoji: "📖", label: "Innocent & Quiet" },
  { emoji: "🌸", label: "Tender & Sensitive" },
  { emoji: "❤️", label: "Gentle Babe" },
  { emoji: "✨", label: "Playful Vibe" },
  { emoji: "❄️", label: "Cool & Reserved" },
  { emoji: "💢", label: "Tsundere" },
  { emoji: "🔥", label: "Bold & Warm" },
  { emoji: "🌹", label: "Mysterious Queen" },
  { emoji: "🪄", label: "Whimsical & Fun" },
  { emoji: "💋", label: "Energetic Baddie" },
  { emoji: "😈", label: "Cunning & Witty" }
];

const RELATIONSHIPS = [
  { id: "Wife", label: "Wife", desc: "Wife", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/wife.8bf79d35b6ba7fb8ae280e3cf5e71374.png" },
  { id: "Girlfriend", label: "Girlfriend", desc: "Girlfriend", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/girl_friend.0c4987d5f26dd07928d62748b3e70075.png" },
  { id: "Friend", label: "Friend", desc: "Friend", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/friend.2e8de32625417769732cea080e696664.png" },
  { id: "Mistress", label: "Mistress", desc: "Mistress", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/mistress.1b9cbfbbf2a876d0b32ab5de5dab2539.png" },
  { id: "Sex Friend", label: "Sex Friend", desc: "Sex Friend", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/sex_friend.006275e3787fdeb4e5779fbbd21d9b14.png" },
  { id: "Colleague", label: "Colleague", desc: "Colleague", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/work_colleague.006bb59bfa27fbc67ecb62a8f8e78c6f.png" }
];

const EXTRA_RELATIONSHIPS = [
  { id: "Landlord", label: "Landlord", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/landlord.9447e6ea8ba27893162723ab1025704c.png" },
  { id: "Mother-in-law", label: "Mother-in-law", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/mother_in_law.fdbdb06d6f77b2e9989d10b322811434.png" },
  { id: "Neighbour", label: "Neighbour", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/neighbour.657f0dec35e9445b726c040277de53e4.png" },
  { id: "School Mate", label: "School Mate", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/school_mate.68ebcb2549ce71a5006082758a13fc8b.png" },
  { id: "Sister-in-law", label: "Sister-in-law", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/sister_in_law.7e64ae73e26e8bc535af29e73cb4e427.png" },
  { id: "Step Daughter", label: "Step Daughter", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/step_daughter.050e68f170a902ea6509fb431a293b71.png" },
  { id: "Step Mom", label: "Step Mom", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/step_mom.fc46e733bc77abcc58b3d8b401782ef6.png" },
  { id: "Step Sister", label: "Step Sister", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/step_sister.add58b6e8e693d965c2899dbb80550b9.png" },
  { id: "Stranger", label: "Stranger", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/stranger.c688d2ae3fcbea847f6d479568dc6bbb.png" },
  { id: "Sugar Baby", label: "Sugar Baby", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/relationship/sugar_baby.871cd6e52962ae54bd39ec6219add9ba.png" }
];

const OCCUPATIONS = [
  { id: "Student", label: "Student", desc: "Student", icon: "🎓", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/occupation/student.bde0075094832b0f21efe547a2fdc45e.png" },
  { id: "Dancer", label: "Dancer", desc: "Dancer", icon: "💃" },
  { id: "Model", label: "Model", desc: "Model", icon: "👗" },
  { id: "Stripper", label: "Stripper", desc: "Stripper", icon: "👠" },
  { id: "Maid", label: "Maid", desc: "Maid", icon: "🧹" },
  { id: "Cam Girl", label: "Cam Girl", desc: "Cam Girl", icon: "💻" },
  { id: "Boss / CEO", label: "Boss / CEO", desc: "Boss", icon: "👔", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/occupation/boss.6ab9edd8fd4af1d3c449890eb7201abe.png" },
  { id: "Babysitter / Au Pair", label: "Babysitter", desc: "Babysitter", icon: "🍼" },
  { id: "Pornstar", label: "Pornstar", desc: "Pornstar", icon: "🎥" },
  { id: "Streamer", label: "Streamer", desc: "Streamer", icon: "🎮" },
  { id: "Bartender", label: "Bartender", desc: "Bartender", icon: "🍹" },
  { id: "Tech Engineer", label: "Tech Engineer", desc: "Tech Engineer", icon: "💻" },
  { id: "Teacher", label: "Teacher", desc: "Teacher", icon: "👩‍🏫", img: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/occupation/teacher.2b83a43ba44a5c28b706ae24d6e1b84e.png" }
];

const VOICES = [
  { id: "Sweet", label: "Sweet", desc: "Sweet", phrase: "Hi there sweetie, I've been waiting for you all day! Let's build a special story together." },
  { id: "Innocent", label: "Innocent", desc: "Innocent", phrase: "Oh! Hello. You seem really nice. Can we hang out and talk about everything?" },
  { id: "Cheerful", label: "Cheerful", desc: "Cheerful", phrase: "Hey hey! What's up? I'm so happy you crafted me! Let's go crazy chatting!" },
  { id: "Sultry", label: "Sultry", desc: "Sultry", phrase: "Mmm, hello handsome. I love your configuration. Come closer and tell me what you want." },
  { id: "Confident", label: "Confident", desc: "Confident", phrase: "Hello. I know exactly what I want, and I think you do too. Let's make this interest mutual." },
  { id: "Calm", label: "Calm", desc: "Calm", phrase: "Take a deep breath. Focus on me. I'm here to listen to your voice and comfort you." }
];

// Reference photos templates for photo generation matching fallback
const REFERENCE_MODELS = [
  { name: "Claire", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/claire/cover/claire_008.jpg", ethnicity: "Asian" },
  { name: "Bella", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/bella/cover/bella_044.jpg", ethnicity: "Caucasian" },
  { name: "Kaia", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/kaia/cover/kaia_021.jpg", ethnicity: "South Asian" },
  { name: "Elena", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/elena/cover/elena_015.jpg", ethnicity: "Mediterranean" },
  { name: "Lily", avatar: "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/lily/cover/lily_037.jpg", ethnicity: "European" }
];

export default function CreatorTab({ 
  onCompanionCreated, 
  museUserId,
  editingCompanion = null,
  onCancelEdit = () => {}
}: CreatorTabProps) {
  // Navigation Flow State: "SELECT_MODE" | "PHOTO_UPLOAD" | "PHOTO_MATCHING" | "WIZARD" | "GENERATING" | "RESULT"
  const [currentScreen, setCurrentScreen] = React.useState<
    "SELECT_MODE" | "PHOTO_UPLOAD" | "PHOTO_MATCHING" | "WIZARD" | "GENERATING" | "RESULT"
  >(editingCompanion ? "WIZARD" : "SELECT_MODE");

  // Selection state
  const [creationMode, setCreationMode] = React.useState<"manual" | "upload">(editingCompanion ? "manual" : "manual");
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [uploadedBase64, setUploadedBase64] = React.useState<string | null>(null);
  const [matchingProgress, setMatchingProgress] = React.useState(0);
  const [detectedFaces, setDetectedFaces] = React.useState<any[]>([]);
  const [selectedFaceIdx, setSelectedFaceIdx] = React.useState<number>(0);

  // wizard step tracker
  const [activeStep, setActiveStep] = React.useState(editingCompanion ? 1 : 1);

  // Helper to parse desc tags
  const getTagValue = (tags: string[], key: string) => {
    const found = tags.find(t => t.startsWith(`${key}:`));
    return found ? found.split(":")[1] : "";
  };

  // Custom Creation Data
  const [ethnicity, setEthnicity] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "ethnicity") || "Caucasian" : "Caucasian");
  const [bodyType, setBodyType] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "body") || "Skinny" : "Skinny");
  const [breastSize, setBreastSize] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "bust") || "Medium" : "Medium");
  const [hairStyle, setHairStyle] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "hairstyle") || "Straight" : "Straight");
  const [hairColor, setHairColor] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "hairColor") || "Brunette" : "Brunette");
  const [clothing, setClothing] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "clothing") || "Belly Dancer" : "Belly Dancer");
  const [personalityTags, setPersonalityTags] = React.useState<string[]>(editingCompanion ? editingCompanion.desc.find(t => t.startsWith("character:"))?.split(":")[1]?.split(", ") || ["Gentle Babe"] : ["Gentle Babe"]);
  const [customPersonality, setCustomPersonality] = React.useState("");
  const [relationship, setRelationship] = React.useState(editingCompanion ? editingCompanion.relationship || "Girlfriend" : "Girlfriend");
  const [showAllRelationships, setShowAllRelationships] = React.useState(false);
  const [occupation, setOccupation] = React.useState(editingCompanion ? getTagValue(editingCompanion.desc, "occupation") || "Student" : "Student");
  const [voiceId, setVoiceId] = React.useState(editingCompanion ? editingCompanion.voice_id || "Sweet" : "Sweet");

  // BGM & Synth loop states
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [synthAudio, setSynthAudio] = React.useState<HTMLAudioElement | null>(null);

  // Result metadata
  const [generatedId, setGeneratedId] = React.useState(editingCompanion ? editingCompanion.id : "");
  const [generatedName, setGeneratedName] = React.useState(editingCompanion ? editingCompanion.name : "Lillian");
  const [generatedBio, setGeneratedBio] = React.useState(editingCompanion ? editingCompanion.bio : "");
  const [generatedAvatar, setGeneratedAvatar] = React.useState(editingCompanion ? editingCompanion.avatar : "");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = React.useState(false);
  const [creationStatus, setCreationStatus] = React.useState("");

  const pollGenerationJob = async (userId: string, jobId: string): Promise<string | null> => {
    try {
      for (let i = 0; i < 30; i++) { // Poll for up to 60 seconds
        const res = await fetch(`/api/muse/generation-jobs/${jobId}?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const job = data.job || data;
          if (job.status === "succeeded") {
            return job.outputs?.[0]?.public_url || null;
          } else if (job.status === "failed") {
            console.error("Image generation job failed:", job.error_message);
            return null;
          }
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
    return null;
  };

  React.useEffect(() => {
    return () => {
      if (synthAudio) {
        synthAudio.pause();
      }
    };
  }, [synthAudio]);

  const [bondPoints, setBondPoints] = React.useState(15);
  const [goldCoins, setGoldCoins] = React.useState(150);
  const [unlockedInteractions, setUnlockedInteractions] = React.useState<Record<string, boolean>>({
    "lv1": true
  });
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newNameInput, setNewNameInput] = React.useState("Lillian");

  // Filter & Search inside clothing step
  const [clothingTab, setClothingTab] = React.useState<"all" | "cosplay" | "swimwear" | "casual">("all");
  const [clothingSearch, setClothingSearch] = React.useState("");

  // Speech Synth voice trigger
  const handleVoicePreview = (voiceText: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
      
      // Try to find a nice female English voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.lang.includes("en") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("google"))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      // Audio fallback sound beep
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
    customToast(`Playing voice preview: ${voiceId}`);
  };

  // Upload trigger or presets match simulator
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedBase64(reader.result as string);
        triggerPhotoMatching();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectReferenceModel = (model: typeof REFERENCE_MODELS[0]) => {
    setUploadedBase64(model.avatar);
    triggerPhotoMatching();
  };

  const triggerPhotoMatching = () => {
    setCurrentScreen("PHOTO_MATCHING");
    setMatchingProgress(0);
    
    // Play matchmaking audio demo loop
    const demoAudio = new Audio("https://app.chatpai.net/h5/assets/assets/creation/demo.0c51557f55799f919a7e71be63304c43.mp3");
    demoAudio.loop = true;
    demoAudio.volume = 0.45;
    demoAudio.play().catch(() => {});
    setSynthAudio((prev) => {
      if (prev) prev.pause();
      return demoAudio;
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Mock matching algorithm selecting 3 highly matching digital faces from existing database
        // Pick companions resembling the choices!
        const matchScores = [92, 85, 78];
        const companions = [...CURATED_COMPANIONS].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        const faces = companions.map((c, idx) => ({
          name: c.name,
          avatar: c.avatar,
          similarity: matchScores[idx],
          bio: c.bio,
          media: c.media.map(m => m.url),
          faceProfile: {
            ethnicity: c.id === "curated-claire" || c.id === "curated-olivia" ? "Asian" : "Caucasian",
            bodyType: idx === 0 ? "Skinny" : idx === 1 ? "Curvy" : "Athletic",
            breastSize: idx === 0 ? "Medium" : "Large",
            hairStyle: "Straight",
            hairColor: "Brunette",
            clothing: "Casual"
          }
        }));

        setDetectedFaces(faces);
        setSelectedFaceIdx(0);
        
        // Apply matching choices to state
        const first = faces[0];
        setGeneratedName(first.name);
        setGeneratedAvatar(first.avatar);
        setEthnicity(first.faceProfile.ethnicity);
        setBodyType(first.faceProfile.bodyType);
        setBreastSize(first.faceProfile.breastSize);
        setGeneratedId(`custom_upload_${Math.random().toString(36).substring(2, 9)}`);
      }
      setMatchingProgress(progress);
    }, 120);
  };

  // Submission handler generating client-authoritative companion and playing percentage countdown
  const handleFinalSubmit = () => {
    // Synth audio setup BGM loading
    const demoAudio = new Audio("https://app.chatpai.net/h5/assets/assets/creation/demo.0c51557f55799f919a7e71be63304c43.mp3");
    demoAudio.loop = true;
    demoAudio.volume = 0.55;
    demoAudio.play().catch(() => {});
    setSynthAudio((prev) => {
      if (prev) prev.pause();
      return demoAudio;
    });

    setCurrentScreen("GENERATING");
    setMatchingProgress(0);

    let count = 0;
    const timer = setInterval(() => {
      count += Math.floor(Math.random() * 12) + 8;
      if (count >= 100) {
        count = 100;
        clearInterval(timer);
        
        // Finalize state human details
        if (creationMode === "upload" && detectedFaces.length > 0) {
          const matched = detectedFaces[selectedFaceIdx];
          setGeneratedName(matched.name);
          setGeneratedAvatar(matched.avatar);
          setGeneratedBio(matched.bio || `Matched digital double reference companion inspired by photographic resemblance.`);
        } else {
          // Curated random companion avatar template selection or custom anime render generator fallback
          const avatarDict: Record<string, string> = {
            "Claire": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/claire/cover/claire_008.jpg",
            "Bella": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/bella/cover/bella_044.jpg",
            "Kaia": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/kaia/cover/kaia_021.jpg",
            "Elena": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/elena/cover/elena_015.jpg",
            "Lily": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/lily/cover/lily_037.jpg",
            "Emma": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/emma/cover/emma_022.jpg",
            "Stella": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/stella/cover/stella_007.jpg",
            "Olivia": "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/olivia/cover/olivia_039.jpg"
          };
          const avatarUrl = avatarDict[generatedName] || "https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/persona/amelia/cover/amelia_001.jpg";
          setGeneratedAvatar(avatarUrl);
          
          const tagsStr = personalityTags.join(", ");
          setGeneratedBio(`A custom-created companion, ${generatedName}. Full of ${tagsStr} personality energy, roleplaying as your ${relationship}.`);
          setGeneratedId(`custom_manual_${Math.random().toString(36).substring(2, 9)}`);
        }
        
        setCurrentScreen("RESULT");
        customToast(`🎉 Match Complete! Let's meet ${generatedName}!`);
      }
      setMatchingProgress(count);
    }, 300);
  };

  // Apply creation to system registry list and transition into Immersive direct private chat dialogue
  const handleEnterChatMode = async () => {
    setCreationStatus("Synchronizing Identity...");
    
    let finalId = generatedId;
    let finalAvatar = generatedAvatar;
    let finalBio = generatedBio;

    if (museUserId) {
      try {
        const url = editingCompanion ? `/api/muse/companions/${editingCompanion.id}` : "/api/muse/companions";
        const method = editingCompanion ? "PATCH" : "POST";

        setCreationStatus(editingCompanion ? "Updating Soul Records..." : "Forging New Identity...");
        const createRes = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: museUserId,
            name: generatedName,
            bio: generatedBio,
            relationship: relationship,
            occupation: occupation,
            voice_id: voiceId,
            creator_selections: {
              ethnicity: ethnicity,
              bodyType: bodyType,
              breastSize: breastSize,
              hairStyle: hairStyle,
              hairColor: hairColor,
              clothing: clothing
            },
            personality_tags: personalityTags
          })
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          const comp = createData.companion || createData.data || createData;
          if (comp && comp.id) {
            finalId = comp.id;
            setGeneratedId(finalId);
            if (comp.avatar_url || comp.avatar) {
              finalAvatar = comp.avatar_url || comp.avatar;
              setGeneratedAvatar(finalAvatar);
            }
            
            // Check if appearance changed during edit to trigger re-generation
            let appearanceChanged = !editingCompanion;
            if (editingCompanion) {
              const oldEthnicity = getTagValue(editingCompanion.desc, "ethnicity");
              const oldBody = getTagValue(editingCompanion.desc, "body");
              const oldBust = getTagValue(editingCompanion.desc, "bust");
              const oldHairStyle = getTagValue(editingCompanion.desc, "hairstyle");
              const oldHairColor = getTagValue(editingCompanion.desc, "hairColor");
              const oldClothing = getTagValue(editingCompanion.desc, "clothing");

              if (oldEthnicity !== ethnicity || 
                  oldBody !== bodyType || 
                  oldBust !== breastSize || 
                  oldHairStyle !== hairStyle ||
                  oldHairColor !== hairColor ||
                  oldClothing !== clothing) {
                appearanceChanged = true;
              }
            }

            // Kickstart avatar generation automatically using BFF /api/muse/generate-image
            if (appearanceChanged) {
              try {
                setCreationStatus("Sculpting Appearance (30-60s)...");
                setIsGeneratingAvatar(true);
                const genRes = await fetch("/api/muse/generate-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    user_id: museUserId,
                    companion_id: finalId,
                    usage_type: "avatar",
                    size: "768x1024",
                    n: 1,
                    recipe_key: "agnes_avatar_v1"
                  })
                });

                if (genRes.ok) {
                  const genData = await genRes.json();
                  const jobId = genData.job_id || genData.id;
                  if (jobId) {
                    setCreationStatus("Wait... AI is detailing the face...");
                    const newAvatarUrl = await pollGenerationJob(museUserId, jobId);
                    if (newAvatarUrl) {
                      finalAvatar = newAvatarUrl;
                      setGeneratedAvatar(newAvatarUrl);
                      customToast("✨ Digital Identity Sculpted Successfully!");
                    } else {
                      customToast("⚠️ Sculpting timed out. The image will appear soon.");
                    }
                  }
                }
              } catch (imageErr) {
                console.error("Failed to boot avatar generation job:", imageErr);
              } finally {
                setIsGeneratingAvatar(false);
              }
            } else {
              customToast("Success! Connection updated.");
            }
          }
        } else {
          const err = await createRes.json();
          console.error("Backend error:", err);
          customToast(`Creation failed: ${err?.error?.message || "Internal error"}`);
          setCreationStatus("");
          return;
        }
      } catch (err) {
        console.error("Backend companion registration failed:", err);
        setCreationStatus("");
        return;
      }
    }
    
    setCreationStatus("");

    // Default Fallback ID if not on backend
    if (!finalId) {
        finalId = `custom_m_fallback_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Create actual typed human
    const descTags = [
      `relationship:${relationship}`,
      `ethnicity:${ethnicity}`,
      `body:${bodyType}`,
      `bust:${breastSize}`,
      `hairstyle:${hairStyle}`,
      `hairColor:${hairColor}`,
      `clothing:${clothing}`,
      `occupation:${occupation}`,
      `character:${personalityTags.join(", ")}`
    ];

    // Attempt to source matched video media if upload mode
    let targetMedia: Media[] = [{ id: "custom-m-1", url: finalAvatar, type: "image" }];
    if (creationMode === "upload" && detectedFaces.length > 0) {
      const selectedModel = CURATED_COMPANIONS.find(c => c.name.toLowerCase() === generatedName.toLowerCase());
      if (selectedModel) {
        targetMedia = selectedModel.media;
      }
    } else {
      // Find matching curated system list model fallback for rich video reals
      const matchedModel = CURATED_COMPANIONS.find(c => c.name.toLowerCase() === generatedName.toLowerCase() || c.name === "Amelia");
      if (matchedModel) {
        targetMedia = matchedModel.media;
      }
    }

    const compiledCompanion: DigitalHuman = {
      id: finalId,
      uid: `uid_${Math.random().toString(36).substring(2, 8)}`,
      name: generatedName,
      avatar: finalAvatar || (targetMedia[0]?.url) || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80",
      age: 22,
      country: ethnicity,
      desc: descTags,
      bio: finalBio,
      fans_cnt: 1350,
      relationship: relationship,
      voice_id: voiceId,
      media: targetMedia,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_follow: true,
      isCustom: true
    };

    setSynthAudio((prev) => {
      if (prev) prev.pause();
      return null;
    });
    onCompanionCreated(compiledCompanion);
    customToast(`Connected with ${generatedName}!`);
  };

  // Mute logic sound toggle
  const toggleSound = () => {
    setSynthAudio((prev) => {
      if (prev) {
        prev.muted = !prev.muted;
        setIsAudioMuted(prev.muted);
      }
      return prev;
    });
  };

  // Unlock individual interactions with simulated gold coins
  const handleUnlockLevel = (id: string, cost: number) => {
    if (unlockedInteractions[id]) {
      customToast("Already unlocked! Enjoy!");
      return;
    }
    if (goldCoins < cost) {
      customToast("⚠️ Insufficient coins! Buy more packages inside Me profiles!");
      return;
    }
    setGoldCoins(prev => prev - cost);
    setUnlockedInteractions(prev => ({ ...prev, [id]: true }));
    customToast(`🔓 Level Up! Bond Interaction unlocked beautifully!`);
  };

  // Save renamed profile info via Patch mockup
  const handleSaveNameChange = () => {
    if (!newNameInput.trim()) return;
    setGeneratedName(newNameInput.trim());
    setIsEditingName(false);
    customToast("Rename saved successfully!");
  };

  // Tab dynamic filtering inside clothing step selection
  const filteredClothings = CLOTHINGS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(clothingSearch.toLowerCase());
    if (clothingTab === "all") return matchesSearch;
    if (clothingTab === "cosplay") return matchesSearch && ["Belly Dancer", "Cheerleader", "Hijab", "Maid", "Military", "Nurse", "Police"].includes(c.name);
    if (clothingTab === "swimwear") return matchesSearch && ["Bikini", "Lingerie", "Swimsuit", "Yoga Outfit"].includes(c.name);
    if (clothingTab === "casual") return matchesSearch && ["Casual", "Hoodie", "Jeans", "Leggings", "Oversized Shirt"].includes(c.name);
    return matchesSearch;
  });

  return (
    <div id="creator-tab-root" className="flex-1 flex flex-col h-full bg-[#0a0a0f] text-zinc-100 overflow-y-auto pt-[env(safe-area-inset-top)] pb-24 relative select-none font-sans">
      
      {/* 1. SELECT MODE HERO ENTRANCE */}
      {currentScreen === "SELECT_MODE" && (
        <div id="select-mode-screen" className="flex-1 flex flex-col p-6 max-w-md mx-auto justify-center min-h-[80vh] space-y-8 animate-fade-in">
          <div className="text-center pt-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-955/20 border border-pink-500/30 text-[10px] text-pink-400 font-extrabold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
              Muse Lab Creator
            </span>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-white">
              CRAFT YOUR DREAM COMPANION
            </h1>
            <p className="text-zinc-400 text-xs mt-2 max-w-[280px] mx-auto leading-relaxed">
              Synthesize a highly responsive, high-fidelity virtual counterpart based on photo references or selective 10-step custom customization!
            </p>
          </div>

          <div className="space-y-4">
            {/* Action Card A: Generate via Photo */}
            <div
              id="action-gen-photo"
              onClick={() => {
                setCreationMode("upload");
                setCurrentScreen("PHOTO_UPLOAD");
              }}
              className="group relative p-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 hover:border-pink-500/40 rounded-2xl flex items-center justify-between transition-all duration-300 scale-100 active:scale-[0.98] cursor-pointer shadow-lg shadow-black/40 hover:shadow-pink-500/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-pink-950/20 border border-pink-500/15 group-hover:border-pink-500/40 text-pink-500 transition-colors">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-200 uppercase tracking-wider">Generate via Photo</h3>
                  <p className="text-[10.5px] text-zinc-500 mt-1">Upload portrait to match virtual lookalike companions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 transition-all group-hover:translate-x-1" />
            </div>

            {/* Action Card B: Custom Creation */}
            <div
              id="action-gen-custom"
              onClick={() => {
                setCreationMode("manual");
                setCurrentScreen("WIZARD");
                setActiveStep(1);
              }}
              className="group relative p-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 hover:border-pink-500/40 rounded-2xl flex items-center justify-between transition-all duration-300 scale-100 active:scale-[0.98] cursor-pointer shadow-lg shadow-black/40 hover:shadow-pink-500/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-violet-955/20 border border-violet-500/15 group-hover:border-pink-500/40 text-violet-400 transition-colors">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-200 uppercase tracking-wider">Custom Creation</h3>
                  <p className="text-[10.5px] text-zinc-500 mt-1">10-step wizard: customizing outfit, body, voice, and personality</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 transition-all group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      )}

      {/* 2. PHOTO UPLOADER PORTAL SCREEN */}
      {currentScreen === "PHOTO_UPLOAD" && (
        <div id="photo-upload-screen" className="flex-1 flex flex-col p-6 max-w-md mx-auto space-y-6 animate-fade-in justify-center min-h-[80vh]">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setCurrentScreen("SELECT_MODE")}
              className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-display font-extrabold text-sm uppercase tracking-widest text-zinc-200">Upload Reference Portrait</h1>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-center font-display font-bold text-md text-zinc-100">Upload a Photo</h3>
            <p className="text-center text-[10.5px] text-zinc-400">Tap to browse or drop an image reference below</p>

            {/* Drag & drop uploading zone trigger */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-pink-500/40 rounded-xl py-8 px-4 bg-zinc-900/10 cursor-pointer transition-all hover:bg-pink-955/5 group/upload text-center relative overflow-hidden">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <Upload className="w-10 h-10 mb-3 text-zinc-500 opacity-80 group-hover/upload:text-pink-400 group-hover/upload:scale-110 transition-all" />
              <span className="text-zinc-300 text-xs font-bold font-display uppercase tracking-wider mb-1">Select Reference Image</span>
              <span className="text-[9.5px] text-zinc-500">Supports PNG, JPG, JPEG</span>
              <MousePointerClick className="absolute right-4 bottom-3 w-6 h-6 text-pink-500 pointer-events-none opacity-50 animate-bounce" />
            </label>

            {/* Quick Presets Matcher Grid */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Or Use Model Presets:</span>
                <span className="text-[9px] text-pink-400 font-mono animate-pulse">Fast Simulator match</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {REFERENCE_MODELS.map((model, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectReferenceModel(model)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 hover:border-pink-500 transition-colors cursor-pointer group active:scale-95"
                    title={`Click to simulate matching ${model.name}`}
                  >
                    <img src={model.avatar} alt="reference model avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/75 text-center text-[7.5px] text-zinc-400 truncate">
                      {model.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PHOTO MATCHING / CIRCULAR PERCENTAGE countdown PORTAL SCREEN */}
      {currentScreen === "PHOTO_MATCHING" && (
        <div id="photo-matching-screen" className="flex-1 flex flex-col p-6 space-y-6 animate-fade-in max-w-md mx-auto items-center justify-center min-h-[85vh]">
          {matchingProgress < 100 ? (
            <div className="text-center space-y-6">
              {/* Circular matching loop visual component */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-900 border-t-pink-500 animate-spin" />
                <div className="z-10 font-mono text-xl font-extrabold text-pink-500 tracking-wider">
                  {matchingProgress}%
                </div>
              </div>
              <h2 className="font-display font-extrabold text-lg text-white uppercase tracking-wider animate-pulse">Matching face similarity...</h2>
              <p className="text-[11px] text-zinc-500 max-w-xs">Scanning reference profile descriptors & face characteristics database to source highly related matches...</p>
            </div>
          ) : (
            // Results: Grid of similar faces picked from Curated human list
            <div className="w-full space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="text-[9.5px] font-extrabold text-pink-400 bg-pink-950/20 border border-pink-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                  Match Success (100%)
                </span>
                <h2 className="font-white font-display text-md uppercase tracking-wider font-extrabold pt-2">SIMILAR FACES MATCHED</h2>
                <p className="text-[11px] text-zinc-400">Select which digital companion double you want to customize:</p>
              </div>

              {/* Grid lists with pink border choice and similarity matches */}
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {detectedFaces.map((face, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedFaceIdx(index);
                      setGeneratedName(face.name);
                      setGeneratedAvatar(face.avatar);
                    }}
                    className={`p-3.5 rounded-xl border transition-all flex items-center gap-4 cursor-pointer relative ${
                      selectedFaceIdx === index
                        ? "bg-pink-955/15 border-pink-500 shadow-lg shadow-pink-500/5 scale-[1.01]"
                        : "bg-zinc-950/60 border-zinc-900 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-800">
                      <img src={face.avatar} alt="matched template avatar portrait" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute top-0 right-0 py-0.5 px-1 bg-pink-650 hover:bg-pink-755 text-white font-mono text-[7px] font-bold uppercase rounded-bl-lg tracking-wider">
                        NEW
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-zinc-100 uppercase tracking-wide truncate">{face.name}</span>
                        <span className="font-mono text-[10px] font-bold text-green-400 bg-green-950/20 border border-green-500/25 px-2 py-0.5 rounded-full">
                          Match: {face.similarity}%
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        Ethnicity: {face.faceProfile.ethnicity} | Body: {face.faceProfile.bodyType} | Breast: {face.faceProfile.breastSize}
                      </p>
                    </div>

                    {/* Check icon badge */}
                    {selectedFaceIdx === index && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white font-extrabold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Control bottom nav action button */}
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setCurrentScreen("PHOTO_UPLOAD")}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-display font-extrabold text-[11px] tracking-widest uppercase cursor-pointer"
                >
                  ◀ RE-UPLOAD
                </button>
                <button
                  onClick={() => {
                    // Pre-fill manual states based on match choice and skip steps to finalize customize preferences!
                    const chosen = detectedFaces[selectedFaceIdx];
                    setEthnicity(chosen.faceProfile.ethnicity);
                    setBodyType(chosen.faceProfile.bodyType);
                    setBreastSize(chosen.faceProfile.breastSize);
                    setGeneratedName(chosen.name);
                    setGeneratedAvatar(chosen.avatar);
                    // Open Preference selection config layout
                    setCurrentScreen("WIZARD");
                    // Skip ahead directly to Relationship config step (Step 8) to tailor companion personality and role!
                    setActiveStep(8);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-display font-extrabold text-[11px] tracking-widest uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/10 active:scale-98"
                >
                  <span>NEXT PREFERENCE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CUSTOM CREATION 10-STEP PROGRESSIVE WIZARD FLOW */}
      {currentScreen === "WIZARD" && (
        <div id="custom-wizard-screen" className="flex-1 flex flex-col p-6 max-w-md mx-auto space-y-5 animate-fade-in w-full">
          
          {/* Header navigation section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeStep > 1) {
                    setActiveStep(prev => prev - 1);
                  } else {
                    setCurrentScreen(creationMode === "upload" ? "PHOTO_UPLOAD" : "SELECT_MODE");
                  }
                }}
                className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Go Back Step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[8.5px] font-bold text-pink-400 uppercase tracking-widest font-mono">
                  CUSTOM CREATOR
                </span>
                <h1 className="font-display font-extrabold text-xs uppercase tracking-wider text-zinc-100">
                  {creationMode === "upload" ? "PREFERENCE TUNING" : `Step ${activeStep} of 10`}
                </h1>
              </div>
            </div>
            {/* Audio music mute controller */}
            {synthAudio && (
              <button
                onClick={toggleSound}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-pink-400 transition-colors"
                title={isAudioMuted ? "Resume BGM demo" : "Mute BGM demo"}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-green-400 animate-pulse" />}
              </button>
            )}
          </div>

          {/* TOP 10-STEP NUMERICAL TRACKER BAR */}
          <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-900 px-3 py-2.5 rounded-xl space-x-1.5 overflow-x-auto select-none no-scrollbar">
            {Array.from({ length: 10 }).map((_, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < activeStep;
              const isActive = stepNum === activeStep;
              return (
                <div key={idx} className="flex items-center space-x-1 flex-shrink-0">
                  <div
                    onClick={() => {
                      // Allow sliding backwards to completed steps
                      if (stepNum < activeStep) {
                        setActiveStep(stepNum);
                      }
                    }}
                    className={`w-6 h-6 rounded-full text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                        : isActive
                        ? "bg-pink-500 text-white font-extrabold active-glow animate-pulse"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 text-white" /> : stepNum}
                  </div>
                  {stepNum < 10 && <div className={`h-0.5 w-2.5 rounded ${isCompleted ? "bg-green-500/50" : "bg-zinc-800"}`} />}
                </div>
              );
            })}
          </div>

          {/* ACTIVE WIZARD STEP LAYOUT CARDS */}
          <div className="flex-1 bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-4 min-h-[50vh] flex flex-col justify-between space-y-4">
            
            {/* STEP 1: ETHNICITY (Video preview) */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-zinc-100 uppercase tracking-wider mb-1">Ethnicity</h3>
                  <p className="text-[10.5px] text-zinc-400">Select ethnicity attributes with real video animations</p>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {ETHNICITIES.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setEthnicity(item.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-4 cursor-pointer relative ${
                        ethnicity === item.id
                          ? "bg-pink-955/15 border-pink-500"
                          : "bg-zinc-950 border-zinc-900 hover:bg-zinc-900"
                      }`}
                    >
                      {/* Real time loop previews */}
                      <div className="relative w-20 aspect-[9/16] shrink-0 rounded-lg overflow-hidden bg-black border border-zinc-800">
                        <video
                          src={item.video}
                          muted
                          loop
                          autoPlay
                          playsInline
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-display font-bold text-xs uppercase tracking-wide text-zinc-200 block">{item.name}</span>
                        <span className="text-[9.5px] text-zinc-500 bg-pink-950/20 px-2 py-0.5 rounded-full border border-pink-500/10 mt-1 inline-block uppercase tracking-wider">
                          Animation Active
                        </span>
                      </div>
                      {ethnicity === item.id && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-pink-500 w-5 h-5 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: BODY (Static images) */}
            {activeStep === 2 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-[#f52b86] uppercase tracking-wider mb-1">Body Type</h3>
                  <p className="text-[10.5px] text-zinc-400">Select target body posture preset</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {BODIES.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setBodyType(item.id)}
                      className={`rounded-xl border hover:border-pink-500/40 cursor-pointer overflow-hidden relative transition-all group ${
                        bodyType === item.id ? "border-pink-500 bg-pink-955/10 bg-opacity-30 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                      }`}
                    >
                      <div className="aspect-[3/4] relative overflow-hidden bg-zinc-900 border-b border-zinc-900">
                        <img src={item.img} alt={`${item.name} preview`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      </div>
                      <div className="p-2 bg-zinc-950/80 text-center">
                        <span className="block font-display font-bold text-[10.5px] uppercase text-zinc-100">{item.name}</span>
                        <span className="text-[9px] text-[#f52b86] font-extrabold">{item.desc}</span>
                      </div>
                      {bodyType === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: BREAST (Static images) */}
            {activeStep === 3 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-zinc-100 uppercase tracking-wider mb-1">Breast Sizing</h3>
                  <p className="text-[10.5px] text-zinc-400">Select target chest measurements preview</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {BREASTS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setBreastSize(item.id)}
                      className={`rounded-xl border hover:border-pink-500/40 cursor-pointer overflow-hidden relative transition-all group ${
                        breastSize === item.id ? "border-pink-500 bg-pink-955/10 bg-opacity-30 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                      }`}
                    >
                      <div className="aspect-square relative overflow-hidden bg-zinc-900 border-b border-zinc-900">
                        <img src={item.img} alt={`${item.name} breast size visual`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      </div>
                      <div className="p-2 bg-zinc-950/80 text-center">
                        <span className="block font-display font-bold text-[10.5px] uppercase text-zinc-100">{item.name}</span>
                        <span className="text-[9px] text-zinc-400 font-extrabold">{item.desc}</span>
                      </div>
                      {breastSize === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: HAIR STYLE (Video animation) */}
            {activeStep === 4 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-zinc-100 uppercase tracking-wider mb-1">Hair Style</h3>
                  <p className="text-[10.5px] text-zinc-400">Select custom hairstyle design preview loops</p>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {HAIRSTYLES.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setHairStyle(item.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-4 cursor-pointer relative ${
                        hairStyle === item.id ? "bg-pink-955/15 border-pink-500" : "bg-zinc-950 border-zinc-900 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="relative w-20 aspect-[9/16] shrink-0 rounded-lg overflow-hidden bg-black border border-zinc-800">
                        <video src={item.video} muted loop autoPlay playsInline referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-display font-bold text-xs uppercase tracking-wide text-zinc-100 block">{item.name}</span>
                        <span className="text-[9.5px] text-zinc-500 font-mono">Animated Video preview</span>
                      </div>
                      {hairStyle === item.id && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-pink-500 w-5 h-5 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: HAIR COLOR (WebP images) */}
            {activeStep === 5 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-[#f52b86] uppercase tracking-wider mb-1">Hair Color</h3>
                  <p className="text-[10.5px] text-zinc-400">Custom hair color WebP shaders</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {HAIRCOLORS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setHairColor(item.id)}
                      className={`rounded-xl border select-none cursor-pointer overflow-hidden relative transition-all group ${
                        hairColor === item.id ? "border-pink-500 bg-pink-955/10 bg-opacity-30 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                      }`}
                    >
                      <div className="aspect-square relative overflow-hidden bg-zinc-900 border-b border-zinc-900">
                        <img src={item.img} alt={`${item.name} hair shader`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      </div>
                      <div className="p-2 bg-zinc-950/80 text-center">
                        <span className="block font-display font-bold text-[10.5px] uppercase text-zinc-100">{item.name}</span>
                        <span className="text-[9.5px] text-[#f52b86] font-semibold">{item.desc}</span>
                      </div>
                      {hairColor === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: CLOTHING (39 WebP options + Search + Tabs) */}
            {activeStep === 6 && (
              <div className="space-y-4 animate-fade-in w-full max-h-[60vh] overflow-y-auto pr-1">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-zinc-100 uppercase tracking-wider mb-1">Select Custom Style Clothing</h3>
                  <p className="text-[10.5px] text-zinc-400">Combine custom clothing designs (39 complete options available)</p>
                </div>

                {/* Clothing Category tabs and search query */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1.5 rounded-xl border border-zinc-900">
                    <Search className="w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search clothing options (e.g. Bikini, Lingerie...)"
                      value={clothingSearch}
                      onChange={(e) => setClothingSearch(e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs outline-none text-white font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar text-[9.5px] font-bold">
                    {[
                      { id: "all", label: "ALL" },
                      { id: "cosplay", label: "COSPLAY & ROLE" },
                      { id: "swimwear", label: "SWIM & LINGERIE" },
                      { id: "casual", label: "CASUAL" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setClothingTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                          clothingTab === tab.id
                            ? "bg-pink-500 border-pink-500 text-white"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid layout of clothes */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {filteredClothings.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setClothing(item.id)}
                      className={`rounded-xl border select-none cursor-pointer overflow-hidden relative transition-all group ${
                        clothing === item.id ? "border-pink-500 bg-pink-955/10 bg-opacity-30 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                      }`}
                    >
                      <div className="aspect-[3/4] relative overflow-hidden bg-zinc-900 border-b border-zinc-900">
                        <img src={item.img} alt={`${item.name} outfit option`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      </div>
                      <div className="p-2 bg-zinc-950/80 text-center">
                        <span className="block font-display font-medium text-[10.5px] text-zinc-100 truncate">{item.name}</span>
                        <span className="text-[8px] text-zinc-500 uppercase font-mono tracking-wider">Premium WebP</span>
                      </div>
                      {clothing === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredClothings.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-[11px] text-zinc-500">
                      No outfits matched search queries. Try scanning different category tabs!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: PERSONALITY (Preset tags + custom text boxed inputs) */}
            {activeStep === 7 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-zinc-100 uppercase tracking-wider mb-1">Companion Personality</h3>
                  <p className="text-[10.5px] text-zinc-400">Tailor behavior metrics and custom personalities</p>
                </div>

                {/* Selected Tag summary list */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 rounded-xl min-h-[45px] border border-zinc-900 items-center">
                  {personalityTags.length === 0 ? (
                    <span className="text-[9.5px] text-zinc-600 pl-1">No personality tags selected yet...</span>
                  ) : (
                    personalityTags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setPersonalityTags(prev => prev.filter(t => t !== tag))}
                        className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-red-950/20 hover:border-red-500/40 hover:text-red-300 transition-colors"
                      >
                        <span>{tag}</span>
                        <span className="text-[9px] font-light">×</span>
                      </span>
                    ))
                  )}
                </div>

                {/* Grid tag selections */}
                <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-1 select-none">
                  {PERSONALITIES.map((item) => {
                    const isSelected = personalityTags.includes(item.label);
                    return (
                      <div
                        key={item.label}
                        onClick={() => {
                          if (isSelected) {
                            setPersonalityTags(prev => prev.filter(t => t !== item.label));
                          } else {
                            if (personalityTags.length >= 3) {
                              customToast("Select up to 3 major personality traits!");
                              return;
                            }
                            setPersonalityTags(prev => [...prev, item.label]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "bg-pink-955/15 border-pink-500 text-white font-bold scale-[1.01]"
                            : "bg-zinc-950 border-zinc-900 text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <span className="text-sm">{item.emoji}</span>
                        <span className="text-[10px] uppercase font-display tracking-wider">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom personality tag text input boxes */}
                <div className="space-y-1.5 pt-2">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Define Custom Traits:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Hyperactive, Jealous, Sarcastic..."
                      value={customPersonality}
                      onChange={(e) => setCustomPersonality(e.target.value)}
                      maxLength={14}
                      className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-pink-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-sans"
                    />
                    <button
                      onClick={() => {
                        const clean = customPersonality.trim();
                        if (!clean) return;
                        if (personalityTags.includes(clean)) return;
                        if (personalityTags.length >= 3) {
                          customToast("Select up to 3 major personality traits!");
                          return;
                        }
                        setPersonalityTags(prev => [...prev, clean]);
                        setCustomPersonality("");
                        customToast(`Added "${clean}" trait!`);
                      }}
                      className="px-4 bg-pink-500 hover:bg-pink-650 rounded-xl text-white font-display font-bold text-xs uppercase cursor-pointer"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: RELATIONSHIP ROLE (Wife, Girlfriend with static PNG reference cards) */}
            {activeStep === 8 && (
              <div className="space-y-4 animate-fade-in w-full max-h-[60vh] overflow-y-auto pr-1">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-[#f52b86] uppercase tracking-wider mb-1">Relationship Role</h3>
                  <p className="text-[10.5px] text-zinc-400">Determine custom boundary dynamics and scenarios</p>
                </div>

                {/* Core selections */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {RELATIONSHIPS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setRelationship(item.id)}
                      className={`rounded-xl border hover:border-pink-500/40 cursor-pointer overflow-hidden relative transition-all group ${
                        relationship === item.id ? "border-pink-500 bg-pink-955/10 bg-opacity-30 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                      }`}
                    >
                      <div className="aspect-[1.2/1] relative overflow-hidden bg-zinc-900 border-b border-zinc-900">
                        <img src={item.img} alt={`${item.label} relationship card`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      </div>
                      <div className="p-2 bg-zinc-950/80 text-center">
                        <span className="block font-display font-bold text-[10.5px] uppercase text-zinc-100">{item.label}</span>
                        <span className="text-[8.5px] text-zinc-500 uppercase tracking-widest">{item.desc}</span>
                      </div>
                      {relationship === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Show All toggler expanded relationship lists */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setShowAllRelationships(!showAllRelationships)}
                    className="w-full py-2 border border-zinc-800/80 hover:border-zinc-700 rounded-xl bg-zinc-950/50 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-[#f52b86] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>{showAllRelationships ? "COLLAPSE ADDITIONAL" : "SHOW ALL RELATIONSHIPS"}</span>
                    <span>{showAllRelationships ? "▲" : "▼"}</span>
                  </button>

                  {showAllRelationships && (
                    <div className="grid grid-cols-2 gap-3 pt-2 animate-fade-in select-none">
                      {EXTRA_RELATIONSHIPS.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setRelationship(item.id)}
                          className={`rounded-xl border hover:border-pink-500/40 cursor-pointer overflow-hidden relative transition-all group ${
                            relationship === item.id ? "border-pink-500 bg-pink-955/10 bg-opacity-30 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                          }`}
                        >
                          <div className="aspect-[1.2/1] relative overflow-hidden bg-zinc-900 border-b border-zinc-900">
                            <img src={item.img} alt={`${item.label} extra card`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2 bg-zinc-950/80 text-center">
                            <span className="block font-display font-bold text-[10.5px] uppercase text-zinc-100">{item.label}</span>
                          </div>
                          {relationship === item.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white font-bold" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 9: OCCUPATION (Icons & PNG student cards) */}
            {activeStep === 9 && (
              <div className="space-y-4 animate-fade-in w-full max-h-[60vh] overflow-y-auto pr-1">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-zinc-100 uppercase tracking-wider mb-1">Occupation</h3>
                  <p className="text-[10.5px] text-zinc-400">Configure customized career backgrounds</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {OCCUPATIONS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setOccupation(item.id)}
                      className={`rounded-xl border hover:border-pink-500/40 cursor-pointer overflow-hidden relative transition-all flex flex-col justify-between ${
                        occupation === item.id ? "border-pink-500 bg-pink-955/20 scale-[1.01]" : "border-zinc-900 bg-zinc-950/70"
                      }`}
                    >
                      {item.img ? (
                        <div className="aspect-[1.2/1] overflow-hidden bg-zinc-900 border-b border-zinc-900">
                          <img src={item.img} alt={`${item.label} career`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[1.2/1] bg-zinc-900/40 border-b border-zinc-900 flex items-center justify-center">
                          <span className="text-3xl animate-bounce">{item.icon}</span>
                        </div>
                      )}
                      
                      <div className="p-2.5 bg-zinc-950">
                        <div className="flex items-center gap-1 justify-center">
                          <span className="text-xs">{item.icon}</span>
                          <span className="font-display font-bold text-[10.5px] uppercase text-zinc-200 truncate">{item.label}</span>
                        </div>
                        <span className="block text-[8.5px] text-zinc-500 text-center font-medium">{item.desc}</span>
                      </div>

                      {occupation === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 10: VOICE (Sweet, Innocent, Sultry with tone speech synthesizers) */}
            {activeStep === 10 && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-md text-[#f52b86] uppercase tracking-wider mb-1">Companion Voice</h3>
                  <p className="text-[10.5px] text-zinc-400">Sample individual synthesis voices below</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {VOICES.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setVoiceId(item.id);
                        handleVoicePreview(item.phrase);
                      }}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer relative group ${
                        voiceId === item.id
                          ? "bg-pink-955/15 border-pink-500 shadow-md shadow-pink-500/5 scale-[1.01]"
                          : "bg-zinc-950 border-zinc-900 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3.5 rounded-full bg-pink-950/20 border border-pink-500/10 text-pink-500 shrink-0">
                          <Volume2 className="w-4 h-4 text-pink-500 animate-pulse" />
                        </div>
                        <div>
                          <span className="font-display font-bold text-xs uppercase tracking-wide text-zinc-150 block">{item.label}</span>
                          <span className="text-[9.5px] text-zinc-500 font-mono italic">"{item.phrase.slice(0, 35)}..."</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoicePreview(item.phrase);
                        }}
                        className="p-1 px-2 border border-pink-500/30 hover:border-pink-500 rounded-lg text-pink-400 text-[8.5px] font-bold uppercase tracking-widest bg-pink-950/10 active:scale-95 transition-all text-right shrink-0"
                      >
                        PLAY TEST
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP NAVIGATION BOTTOM CONTROLLER */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => {
                  if (activeStep > 1) {
                    setActiveStep(prev => prev - 1);
                  } else {
                    setCurrentScreen(creationMode === "upload" ? "PHOTO_UPLOAD" : "SELECT_MODE");
                  }
                }}
                className="flex-1 py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 font-display font-extrabold text-[10px] tracking-widest uppercase cursor-pointer transition-all"
              >
                ◀ RETURN
              </button>
              
              {activeStep < 10 ? (
                <button
                  onClick={() => {
                    // Fast skip or check tags constraints
                    if (activeStep === 7 && personalityTags.length === 0) {
                      customToast("Please choose or custom type at least one personality trait!");
                      return;
                    }
                    setActiveStep(prev => prev + 1);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-display font-extrabold text-[10px] tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                >
                  <span>NEXT STEP</span>
                  <ArrowRight className="w-4.5 h-4.5 text-zinc-100" />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-extrabold text-[10px] tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: "3s" }} />
                  <span>SYNTHESIZE COMPANION</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. POST-CREATION GENERATING LOADING COUNTDOWN OVERLAY */}
      {currentScreen === "GENERATING" && (
        <div
          id="generation-generating-portal"
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-cover bg-center text-zinc-100 select-none cursor-not-allowed text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(10,10,15,0.7), rgba(5,5,10,0.92)), url('https://hspimage.oss-ap-southeast-1.aliyuncs.com/chatpai/create/generation/generate_bg.65b3f0fe7588fba3e21b60977a223182.webp')`
          }}
        >
          {/* Top header */}
          <div className="pt-8">
            <span className="inline-flex items-center gap-1.5 text-pink-400 font-mono text-[9px] font-extrabold uppercase tracking-widest border border-pink-500/30 px-3 py-1 rounded-full bg-pink-955/20 backdrop-blur-md animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-pink-400" />
              AI Quantum Core Active
            </span>
          </div>

          {/* Center progress circles */}
          <div className="space-y-6">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full border border-zinc-800/60 shadow-2xl">
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-zinc-800/80" />
              <div className="absolute inset-0 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" style={{ animationDuration: "1s" }} />
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-violet-500/10 border-b-violet-500 animate-reverse-spin" style={{ animationDuration: "15s" }} />
              <div className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-500 to-violet-500 tracking-tight">
                {matchingProgress}%
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-display font-black text-lg text-white uppercase tracking-widest animate-pulse">
                Your dream girl is coming
              </h1>
              <p className="text-[10.5px] text-zinc-400 max-w-xs mx-auto leading-relaxed italic">
                Formulating personalized behavioral vectors, tailoring synthetic voice profiles, and loading custom visual shaders...
              </p>
            </div>
          </div>

          {/* Bottom helper */}
          <div className="pb-8 space-y-2 max-w-xs mx-auto">
            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
              <div className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-300" style={{ width: `${matchingProgress}%` }} />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 lowercase">
              <span>loading system.bin</span>
              <span>rendering synthetic_shader_2k</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATION RESULT SUCCESS SHEET (Lillian custom editable card, play, chat) */}
      {currentScreen === "RESULT" && (
        <div id="creation-result-screen" className="flex-1 flex flex-col p-6 max-w-md mx-auto space-y-6 animate-fade-in w-full text-zinc-100 relative">
          
          {creationStatus && (
            <div className="absolute top-0 left-0 right-0 bg-pink-600/90 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5 text-center flex items-center justify-center gap-2 z-50 rounded-b-xl border-b border-white/20 shadow-xl backdrop-blur-md">
              <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
              {creationStatus}
            </div>
          )}
          
          {/* Header notification title */}
          <div className="text-center pt-2 select-none">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-green-950/30 border border-green-500/30 rounded-full text-green-400 font-mono font-bold text-[9px] uppercase tracking-widest mb-1.5">
              <Check className="w-3.5 h-3.5 text-green-400" />
              COMPANION CREATED SUCCESSFUL
            </div>
            <h1 className="font-display font-black text-xl italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 uppercase">
              Meet Your Counterpart
            </h1>
          </div>

          {/* Core Profile Card display */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-955 border border-zinc-800 rounded-3xl p-5 shadow-2xl relative space-y-4">
            
            <div className="flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 group">
                <img 
                  src={generatedAvatar} 
                  alt="generated digital avatar image" 
                  referrerPolicy="no-referrer" 
                  className={`w-full h-full object-cover transition-all ${isGeneratingAvatar ? 'opacity-40 grayscale blur-[2px]' : ''}`} 
                />
                {isGeneratingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-5 h-5 rounded-full border border-pink-500 border-t-transparent animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-md text-zinc-200 truncate uppercase tracking-widest">
                    {generatedName}
                  </span>
                  {/* Name Edit Pen popup buttons */}
                  <button
                    onClick={() => {
                      setNewNameInput(generatedName);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-zinc-500 hover:text-pink-400 cursor-pointer active:scale-90 transition-transform"
                    title="Edit Companion Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Custom Personality Tag label */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {personalityTags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-pink-955/20 border border-pink-500/25 text-pink-300 font-display font-bold text-[8.5px] uppercase tracking-wider">
                      #☕ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* BIO narrative description */}
            <p className="text-[10px] text-zinc-400 leading-relaxed bg-black/40 p-3 rounded-xl border border-zinc-900 italic select-text select-none">
              "{generatedBio}"
            </p>

            {/* High fidelity stats lists matching provided specifications */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              {/* Ethnicity Choice */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Globe className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Ethnicity</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{ethnicity}</span>
                </div>
              </div>

              {/* Body Choice */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <User className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Body Type</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{bodyType}</span>
                </div>
              </div>

              {/* Breast Sizing */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Ruler className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Measurements</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{breastSize} bust</span>
                </div>
              </div>

              {/* Hairstyle */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Scissors className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Hairstyle</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{hairStyle}</span>
                </div>
              </div>

              {/* Haircolor */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Palette className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Hair Color</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{hairColor}</span>
                </div>
              </div>

              {/* Clothing style */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Shirt className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Style Preset</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{clothing}</span>
                </div>
              </div>

              {/* Relationship dynamics */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Heart className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Bond Limit</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{relationship}</span>
                </div>
              </div>

              {/* Occupations */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <Briefcase className="w-5 h-5 shrink-0 text-pink-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] text-zinc-600 uppercase font-mono tracking-wider font-extrabold leading-none">Occupation</span>
                  <span className="text-zinc-200 font-bold tracking-wide uppercase truncate block mt-0.5">{occupation}</span>
                </div>
              </div>
            </div>

          </div>

          {/* INTERACTION STORYLINE LEVELING UNLOCK CLIPS PANEL */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl space-y-3.5 select-none text-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-pink-400" />
                <span className="text-xs uppercase font-display font-extrabold tracking-wider">Bond Level Pathways</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-500/20">
                <span>🪙</span>
                <span>{goldCoins} Coins Balance</span>
              </div>
            </div>

            {/* Level entries list */}
            {[
              { id: "lv1", levelName: "Unlocked Sequence", desc: "First encounter greeting & basic private talk", cost: 0, levelReq: 1 },
              { id: "lv2", levelName: "Sensory Dance Video", desc: "Unlock premium dynamic pole fitness reel choreography", cost: 25, levelReq: 2 },
              { id: "lv3", levelName: "Evening Pillow Talk", desc: "Unlock deep scenario interactive storylines & audio greetings", cost: 50, levelReq: 3 }
            ].map((node) => {
              const isUnlocked = unlockedInteractions[node.id];
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    if (!isUnlocked) {
                      handleUnlockLevel(node.id, node.cost);
                    } else {
                      customToast(`Starting interactive video sequence: "${node.levelName}"`);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isUnlocked
                      ? "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800"
                      : "bg-zinc-950 border-zinc-900/60 hover:brightness-110 opacity-80"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-bold text-zinc-500 uppercase font-mono">Lv.{node.levelReq}</span>
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">{node.levelName}</span>
                    </div>
                    <span className="block text-[9.5px] text-zinc-500 mt-0.5 leading-relaxed">{node.desc}</span>
                  </div>

                  {/* Lock/Play visual badges */}
                  {isUnlocked ? (
                    <div className="p-2 rounded-full bg-pink-950/30 text-pink-400 border border-pink-500/10">
                      <Play className="w-3.5 h-3.5 fill-pink-500/20" />
                    </div>
                  ) : (
                    <button className="flex items-center gap-1 py-1 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-transform cursor-pointer">
                      <Lock className="w-2.5 h-2.5 text-white" />
                      <span>{node.cost} Coins</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTION BUTTON CONSOLE */}
          <div className="pt-2 flex gap-3.5 pt-4">
            <button
               onClick={() => {
                 if (editingCompanion) {
                   onCancelEdit();
                 } else {
                   // Return builder
                   setCurrentScreen("SELECT_MODE");
                   setActiveStep(1);
                 }
               }}
               className="flex-1 py-4 border-2 border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/40 rounded-2xl text-zinc-400 font-display font-extrabold text-[10px] tracking-widest uppercase cursor-pointer"
             >
               {editingCompanion ? "Cancel Edit" : "Reconstruct Companion"}
             </button>
             <button
               onClick={handleEnterChatMode}
               disabled={!!creationStatus || isGeneratingAvatar}
               className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-display font-extrabold text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-pink-500/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
             >
               {creationStatus ? (
                 <>
                   <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                   <span>{creationStatus}</span>
                 </>
               ) : isGeneratingAvatar ? (
                 <>
                   <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                   <span>Sculpting Form...</span>
                 </>
               ) : (
                 <>
                   <MessageSquare className="w-4 h-4 text-white fill-white/10" />
                   <span>{editingCompanion ? "Save Changes" : "Flirt & Connect"}</span>
                 </>
               )}
             </button>
           </div>

        </div>
      )}

      {/* DYNAMIC MODALS NAME EDIT OVERLAY POPUP */}
      {isEditingName && (
        <div id="result-name-edit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-center font-display font-extrabold text-sm uppercase tracking-widest text-[#f52b86]">Modify Companion Name</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Companion Name:</label>
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                maxLength={14}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl px-4 py-3 text-xs outline-none text-white font-sans"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditingName(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 font-display font-bold text-[10px] tracking-widest uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNameChange}
                className="flex-1 py-3 rounded-xl bg-pink-500 hover:bg-pink-650 text-white font-display font-bold text-[10px] tracking-widest uppercase cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
