import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Coins,
  Crown,
  Flame,
  Gem,
  Gift,
  History,
  Lock,
  Medal,
  PackageOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ children, className = "", variant = "default", disabled = false, ...props }) {
  const variantClass =
    variant === "secondary"
      ? "bg-white/90 text-slate-950 hover:bg-white"
      : variant === "destructive"
        ? "bg-rose-500 text-white hover:bg-rose-400"
        : variant === "ghost"
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-white text-slate-950 hover:bg-violet-100";

  return (
    <button
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

const firebaseConfig = {
  apiKey: "AIzaSyDmVVeWsA-rcDmtFwAO94oYvNOc_ORGxY4",
  authDomain: "popular-scinece-writing-lotter.firebaseapp.com",
  projectId: "popular-scinece-writing-lotter",
  storageBucket: "popular-scinece-writing-lotter.firebasestorage.app",
  messagingSenderId: "1060264688290",
  appId: "1:1060264688290:web:7fc48dbb341a2dbe8235fb",
  measurementId: "G-YZ7V3DRYWT",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SESSION_ID = "skinbox-social-demo-002";
const LOCAL_PLAYER_ID_KEY = "skinbox_social_player_id_v2";
const LOCAL_PLAYER_NAME_KEY = "skinbox_social_player_name_v2";
const ADMIN_PIN = "1234";

const CASE_COST = 30;
const STARTING_COINS = 300;
const BONUS_COINS = 60;
const FREE_CASE_EVERY = 5;
const HISTORY_LIMIT = 30;
const CENTER_INDEX = 4;
const REEL_ITEM_WIDTH = 104;
const REEL_GAP = 8;
const REEL_STEP = REEL_ITEM_WIDTH + REEL_GAP;
const REEL_FINAL_INDEX = 36;
const REEL_TRACK_LENGTH = 48;
const REEL_SPIN_DURATION = 4.2;

const RARITIES = {
  white: {
    id: "white",
    name: "白色普通造型",
    shortName: "白",
    emoji: "⚪",
    colorName: "白色",
    chance: 40,
    weight: 400,
    sellPrice: 3,
    socialValue: 1,
    sellable: true,
    marketLabel: "低價回收",
    bg: "bg-slate-100",
    text: "text-slate-900",
    border: "border-slate-300",
    glow: "shadow-slate-300/30",
    message: "普通造型。社交價值低，但讓人覺得至少有累積。",
  },
  blue: {
    id: "blue",
    name: "淺藍稀有造型",
    shortName: "藍",
    emoji: "🔵",
    colorName: "淺藍",
    chance: 30,
    weight: 300,
    sellPrice: 8,
    socialValue: 3,
    sellable: true,
    marketLabel: "低價回收",
    bg: "bg-cyan-300",
    text: "text-slate-950",
    border: "border-cyan-300",
    glow: "shadow-cyan-300/40",
    message: "稀有造型。比白色更有存在感，但仍偏向回收材料。",
  },
  purple: {
    id: "purple",
    name: "紫色史詩造型",
    shortName: "紫",
    emoji: "🟣",
    colorName: "紫色",
    chance: 18,
    weight: 180,
    sellPrice: 20,
    socialValue: 8,
    sellable: true,
    marketLabel: "中價回收",
    bg: "bg-violet-500",
    text: "text-white",
    border: "border-violet-400",
    glow: "shadow-violet-400/50",
    message: "史詩造型！開始有展示價值，也讓人覺得快接近紅色或金色。",
  },
  red: {
    id: "red",
    name: "紅色傳說造型",
    shortName: "紅",
    emoji: "🔴",
    colorName: "紅色",
    chance: 9,
    weight: 90,
    sellPrice: 80,
    socialValue: 25,
    sellable: true,
    marketLabel: "高價可售",
    bg: "bg-rose-500",
    text: "text-white",
    border: "border-rose-400",
    glow: "shadow-rose-400/70",
    message: "傳說造型！可以賣出大量金幣，但保留能大幅提高社交分數。",
  },
  gold: {
    id: "gold",
    name: "金色神話造型",
    shortName: "金",
    emoji: "🟡",
    colorName: "金色",
    chance: 3,
    weight: 30,
    sellPrice: 0,
    socialValue: 80,
    sellable: false,
    marketLabel: "有價無市",
    bg: "bg-yellow-300",
    text: "text-slate-950",
    border: "border-yellow-300",
    glow: "shadow-yellow-300/90",
    message: "神話造型！有價無市，不能出售，但社交分數最高，是展示與炫耀的核心。",
  },
};

const rarityList = [RARITIES.white, RARITIES.blue, RARITIES.purple, RARITIES.red, RARITIES.gold];

function weightedRandomRarity() {
  const total = rarityList.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * total;
  for (const rarity of rarityList) {
    random -= rarity.weight;
    if (random <= 0) return rarity;
  }
  return RARITIES.white;
}

function randomReel() {
  return Array.from({ length: 9 }, () => weightedRandomRarity());
}

function createOpeningTrack(finalRarity, nearMiss) {
  const track = Array.from({ length: REEL_TRACK_LENGTH }, () => weightedRandomRarity());
  track[REEL_FINAL_INDEX] = finalRarity;

  if (nearMiss && finalRarity.id !== "gold") {
    track[REEL_FINAL_INDEX - 1] = RARITIES.gold;
    track[REEL_FINAL_INDEX + 1] = finalRarity.id === "red" ? RARITIES.gold : RARITIES.red;
  }

  return track;
}

function finalTrackX() {
  return -(REEL_FINAL_INDEX - CENTER_INDEX) * REEL_STEP;
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime() {
  return new Date().toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPlayerRef(playerId) {
  return doc(db, "sessions", SESSION_ID, "players", playerId);
}

function getPlayersRef() {
  return collection(db, "sessions", SESSION_ID, "players");
}

function emptyInventory() {
  return { white: 0, blue: 0, purple: 0, red: 0, gold: 0 };
}

function normalizeInventory(inventory = {}) {
  return { ...emptyInventory(), ...inventory };
}

function calculateInventoryValue(inventory = {}) {
  const inv = normalizeInventory(inventory);
  return rarityList.reduce((sum, rarity) => sum + inv[rarity.id] * rarity.sellPrice, 0);
}

function calculateSocialScore(inventory = {}) {
  const inv = normalizeInventory(inventory);
  return rarityList.reduce((sum, rarity) => sum + inv[rarity.id] * rarity.socialValue, 0);
}

function sortPlayersForRanking(players) {
  return [...players].sort((a, b) => {
    const aInv = normalizeInventory(a.inventory);
    const bInv = normalizeInventory(b.inventory);
    const aSocial = calculateSocialScore(aInv);
    const bSocial = calculateSocialScore(bInv);
    if (bSocial !== aSocial) return bSocial - aSocial;
    if ((bInv.gold || 0) !== (aInv.gold || 0)) return (bInv.gold || 0) - (aInv.gold || 0);
    if ((bInv.red || 0) !== (aInv.red || 0)) return (bInv.red || 0) - (aInv.red || 0);
    if ((b.coins || 0) !== (a.coins || 0)) return (b.coins || 0) - (a.coins || 0);
    return (a.totalCases || 0) - (b.totalCases || 0);
  });
}

function initialPlayer(name) {
  return {
    name,
    coins: STARTING_COINS,
    inventory: emptyInventory(),
    totalCases: 0,
    totalSpent: 0,
    totalRecovered: 0,
    freeTickets: 0,
    paidCaseProgress: 0,
    lastBonusDate: "",
    history: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export default function SkinBoxSocialApp() {
  const [route, setRoute] = useState(window.location.hash === "#admin" ? "admin" : "player");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash === "#admin" ? "admin" : "player");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#2e1065_34%,#070716_100%)] px-4 py-6 text-white">
      <AnimatedBackground />
      {route === "admin" ? <AdminPage /> : <PlayerPage />}
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 opacity-50">
      <motion.div className="absolute left-8 top-16 h-40 w-40 rounded-full bg-yellow-300 blur-3xl" animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute bottom-16 right-8 h-48 w-48 rounded-full bg-rose-400 blur-3xl" animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 5, repeat: Infinity }} />
      <motion.div className="absolute right-1/3 top-1/3 h-36 w-36 rounded-full bg-cyan-300 blur-3xl" animate={{ y: [0, -20, 0], opacity: [0.15, 0.45, 0.15] }} transition={{ duration: 6, repeat: Infinity }} />
    </div>
  );
}

function PlayerPage() {
  const [playerId, setPlayerId] = useState(localStorage.getItem(LOCAL_PLAYER_ID_KEY) || "");
  const [nameInput, setNameInput] = useState(localStorage.getItem(LOCAL_PLAYER_NAME_KEY) || "");
  const [player, setPlayer] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState(null);
  const [nearMiss, setNearMiss] = useState(false);
  const [reelItems, setReelItems] = useState(randomReel);
  const [reelX, setReelX] = useState(0);
  const [reelShouldAnimate, setReelShouldAnimate] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!playerId) return;
    const unsub = onSnapshot(getPlayerRef(playerId), (snap) => {
      if (snap.exists()) setPlayer({ id: snap.id, ...snap.data() });
      else setPlayer(null);
    });
    return unsub;
  }, [playerId]);

  const inventory = normalizeInventory(player?.inventory);
  const inventoryValue = calculateInventoryValue(inventory);
  const socialScore = calculateSocialScore(inventory);
  const freeTickets = player?.freeTickets || 0;
  const paidCaseProgress = player?.paidCaseProgress || 0;
  const canOpenPaid = !!player && player.coins >= CASE_COST && !isOpening;
  const canOpenFree = !!player && freeTickets > 0 && !isOpening;
  const hasSellableItems = rarityList.some((rarity) => rarity.sellable && inventory[rarity.id] > 0);
  const shortForNextCase = Math.max(0, CASE_COST - (player?.coins || 0));

  async function registerPlayer() {
    const cleanName = nameInput.trim();
    if (!cleanName) return setToast("請先輸入玩家名稱。 ");

    try {
      let id = playerId || createId();
      const ref = getPlayerRef(id);
      const snap = await getDoc(ref);
      if (!snap.exists()) await setDoc(ref, initialPlayer(cleanName));
      else await updateDoc(ref, { name: cleanName, updatedAt: serverTimestamp() });

      localStorage.setItem(LOCAL_PLAYER_ID_KEY, id);
      localStorage.setItem(LOCAL_PLAYER_NAME_KEY, cleanName);
      setPlayerId(id);
      setToast(`歡迎，${cleanName}！你的造型庫已連線到 Firebase。`);
    } catch (error) {
      console.error("建立玩家失敗：", error);
      setToast(`建立玩家失敗：${error.code || error.message || "請檢查 Firebase 設定"}`);
    }
  }

  async function claimBonus() {
    if (!player) return;
    const key = todayKey();
    if (player.lastBonusDate === key) return setToast("這場活動已經領過補給金幣了。 ");

    try {
      await updateDoc(getPlayerRef(playerId), {
        coins: increment(BONUS_COINS),
        lastBonusDate: key,
        updatedAt: serverTimestamp(),
      });
      setToast(`補給成功！獲得 ${BONUS_COINS} 金幣。`);
    } catch (error) {
      console.error("領取金幣失敗：", error);
      setToast(`領取失敗：${error.code || error.message || "請檢查 Firebase 設定"}`);
    }
  }

  async function resetLocalPlayer() {
    localStorage.removeItem(LOCAL_PLAYER_ID_KEY);
    localStorage.removeItem(LOCAL_PLAYER_NAME_KEY);
    setPlayerId("");
    setNameInput("");
    setPlayer(null);
    setResult(null);
    setNearMiss(false);
    setReelItems(randomReel());
    setReelShouldAnimate(false);
    setReelX(0);
    setToast("已清除這台裝置的玩家登入。Firebase 內資料仍保留給管理員統計。 ");
  }

  async function openCase(useFreeTicket = false) {
    if (!player) return setToast("請先建立玩家。 ");

    const isFreeCase = useFreeTicket && freeTickets > 0;
    if (!isFreeCase && player.coins < CASE_COST) return setToast("金幣不足，可以出售造型換金幣繼續開箱。 ");
    if (isFreeCase && freeTickets <= 0) return setToast("目前沒有免費開箱券。 ");

    setIsOpening(true);
    setReelShouldAnimate(false);
    setResult(null);
    setNearMiss(false);
    setToast("");

    const finalRarity = weightedRandomRarity();
    const isNearMiss = finalRarity.id !== "gold" && (finalRarity.id === "purple" || finalRarity.id === "red" ? Math.random() < 0.65 : Math.random() < 0.22);

    const nextPaidProgress = isFreeCase ? paidCaseProgress : (paidCaseProgress + 1) % FREE_CASE_EVERY;
    const earnedFreeTicket = !isFreeCase && paidCaseProgress + 1 >= FREE_CASE_EVERY;
    const paymentUpdate = isFreeCase
      ? { freeTickets: increment(-1) }
      : {
          coins: increment(-CASE_COST),
          totalSpent: increment(CASE_COST),
          paidCaseProgress: nextPaidProgress,
          freeTickets: increment(earnedFreeTicket ? 1 : 0),
        };

    await updateDoc(getPlayerRef(playerId), {
      ...paymentUpdate,
      updatedAt: serverTimestamp(),
    });

    const openingTrack = createOpeningTrack(finalRarity, isNearMiss);
    setReelItems(openingTrack);
    setReelShouldAnimate(false);
    setReelX(0);
    await new Promise((resolve) => setTimeout(resolve, 120));
    setReelShouldAnimate(true);
    setReelX(finalTrackX());
    await new Promise((resolve) => setTimeout(resolve, REEL_SPIN_DURATION * 1000 + 250));
    const currentInventory = normalizeInventory(player.inventory);
    const nextInventory = {
      ...currentInventory,
      [finalRarity.id]: (currentInventory[finalRarity.id] || 0) + 1,
    };

    const historyItem = {
      id: createId(),
      action: "open",
      time: formatTime(),
      rarityId: finalRarity.id,
      rarityName: finalRarity.name,
      emoji: finalRarity.emoji,
      nearMiss: isNearMiss,
      socialValue: finalRarity.socialValue,
      isFreeCase,
      earnedFreeTicket,
      message: finalRarity.message,
    };

    await updateDoc(getPlayerRef(playerId), {
      inventory: nextInventory,
      totalCases: increment(1),
      history: [historyItem, ...(player.history || [])].slice(0, HISTORY_LIMIT),
      lastRarityName: finalRarity.name,
      lastRarityId: finalRarity.id,
      lastWasNearMiss: isNearMiss,
      updatedAt: serverTimestamp(),
    });

    setReelShouldAnimate(false);
    setResult(finalRarity);
    setNearMiss(isNearMiss);
    setIsOpening(false);
    if (earnedFreeTicket) setToast(`已累積 ${FREE_CASE_EVERY} 次付費開箱，獲得 1 張免費開箱券！`);
  }

  async function sellOne(rarityId) {
    if (!player) return;
    const rarity = RARITIES[rarityId];
    const currentInventory = normalizeInventory(player.inventory);

    if (!rarity.sellable) return setToast("金色神話造型有價無市，不可出售，只能展示。 ");
    if ((currentInventory[rarityId] || 0) <= 0) return setToast("你沒有這個造型可以出售。 ");

    const nextInventory = {
      ...currentInventory,
      [rarityId]: currentInventory[rarityId] - 1,
    };

    const historyItem = {
      id: createId(),
      action: "sell",
      time: formatTime(),
      rarityId,
      rarityName: rarity.name,
      emoji: rarity.emoji,
      sellPrice: rarity.sellPrice,
      socialLost: rarity.socialValue,
      message: `出售 ${rarity.name}，回收 ${rarity.sellPrice} 金幣，但失去 ${rarity.socialValue} 社交分數。`,
    };

    try {
      await updateDoc(getPlayerRef(playerId), {
        inventory: nextInventory,
        coins: increment(rarity.sellPrice),
        totalRecovered: increment(rarity.sellPrice),
        history: [historyItem, ...(player.history || [])].slice(0, HISTORY_LIMIT),
        updatedAt: serverTimestamp(),
      });
      setToast(`已出售 ${rarity.shortName}色造型，回收 ${rarity.sellPrice} 金幣，但社交分數會下降。`);
    } catch (error) {
      console.error("出售失敗：", error);
      setToast(`出售失敗：${error.code || error.message || "請檢查 Firebase 設定"}`);
    }
  }

  async function sellAllLowValue() {
    if (!player) return;
    const currentInventory = normalizeInventory(player.inventory);
    const sellIds = ["white", "blue", "purple"];
    const total = sellIds.reduce((sum, id) => sum + currentInventory[id] * RARITIES[id].sellPrice, 0);
    const socialLost = sellIds.reduce((sum, id) => sum + currentInventory[id] * RARITIES[id].socialValue, 0);
    if (total <= 0) return setToast("目前沒有白、藍、紫造型可以批量出售。 ");

    const nextInventory = { ...currentInventory, white: 0, blue: 0, purple: 0 };
    const historyItem = {
      id: createId(),
      action: "sell",
      time: formatTime(),
      rarityId: "bundle",
      rarityName: "批量出售白/藍/紫",
      emoji: "💰",
      sellPrice: total,
      socialLost,
      message: `批量出售白、藍、紫造型，回收 ${total} 金幣，但失去 ${socialLost} 社交分數。`,
    };

    try {
      await updateDoc(getPlayerRef(playerId), {
        inventory: nextInventory,
        coins: increment(total),
        totalRecovered: increment(total),
        history: [historyItem, ...(player.history || [])].slice(0, HISTORY_LIMIT),
        updatedAt: serverTimestamp(),
      });
      setToast(`批量出售成功，回收 ${total} 金幣，但社交分數會下降。`);
    } catch (error) {
      console.error("批量出售失敗：", error);
      setToast(`批量出售失敗：${error.code || error.message || "請檢查 Firebase 設定"}`);
    }
  }

  return (
    <section className="relative mx-auto grid max-w-7xl gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <HeroCard coins={player?.coins ?? STARTING_COINS} socialScore={socialScore} />

        {!player ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3"><UserRound className="h-6 w-6" /></div>
              <div>
                <h2 className="text-2xl font-bold">建立玩家</h2>
                <p className="text-sm text-violet-100">輸入名稱後，金幣與造型庫會同步到 Firebase。</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && registerPlayer()} placeholder="例如：Jeff" className="min-h-12 flex-1 rounded-2xl border border-white/20 bg-white/90 px-4 text-slate-900 outline-none ring-violet-300 transition focus:ring-4" />
              <Button onClick={registerPlayer} className="min-h-12 rounded-2xl px-6 text-base font-bold">開始開箱</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-violet-100">目前玩家</p>
                <h2 className="flex items-center gap-2 text-2xl font-black"><UserRound className="h-6 w-6" />{player.name}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={resetLocalPlayer} variant="destructive" className="rounded-2xl font-bold"><RotateCcw className="mr-2 h-4 w-4" />清除本機</Button>
              </div>
            </div>

            <SkinCase reelItems={reelItems} reelX={reelX} reelShouldAnimate={reelShouldAnimate} isOpening={isOpening} result={result} nearMiss={nearMiss} />

            <div className="mt-5 space-y-4">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="text-sm text-violet-100">
                  每次付費開箱花費 <span className="font-bold text-yellow-200">{CASE_COST}</span> 金幣。每開 <span className="font-bold text-cyan-100">{FREE_CASE_EVERY}</span> 次付費箱，獲得 1 張免費開箱券。
                  {shortForNextCase > 0 && <span className="ml-1 text-yellow-100">距離下一次開箱只差 {shortForNextCase} 金幣。</span>}
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  {freeTickets > 0 && (
                    <Button onClick={() => openCase(true)} disabled={!canOpenFree} variant="secondary" className="min-h-14 rounded-2xl px-6 text-base font-black">
                      <Gift className="mr-2 h-5 w-5" />使用免費券 × {freeTickets}
                    </Button>
                  )}
                  <Button onClick={() => openCase(false)} disabled={!canOpenPaid} className="min-h-14 rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-500 px-8 text-lg font-black text-slate-950 shadow-lg transition hover:scale-[1.02]">
                    <PackageOpen className="mr-2 h-5 w-5" />{isOpening ? "開箱中..." : `花 ${CASE_COST} 金幣開箱`}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-violet-100">免費箱進度</span>
                  <span className="font-black text-cyan-100">{paidCaseProgress} / {FREE_CASE_EVERY}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-950/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-yellow-300"
                    animate={{ width: `${(paidCaseProgress / FREE_CASE_EVERY) * 100}%` }}
                    transition={{ duration: 0.45 }}
                  />
                </div>
                <div className="mt-2 text-xs text-violet-100">
                  付費開箱才會累積進度；免費箱不消耗金幣，也不累積免費箱進度。免費券：<span className="font-bold text-yellow-200">{freeTickets}</span> 張。
                </div>
              </div>
            </div>

            <ResultSummary result={result} isOpening={isOpening} />
            <div className="mt-4">
              <PlayerStatsCard player={player} inventory={inventory} inventoryValue={inventoryValue} socialScore={socialScore} />
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <InventoryCard inventory={inventory} sellOne={sellOne} sellAllLowValue={sellAllLowValue} hasSellableItems={hasSellableItems} />
        <HistoryCard history={player?.history || []} />
        <a href="#admin" className="block rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm text-violet-100 backdrop-blur-xl hover:bg-white/15">前往管理員統計頁</a>
      </div>

      <Toast toast={toast} setToast={setToast} />
    </section>
  );
}

function AdminPage() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [players, setPlayers] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!authed) return;
    const q = query(getPlayersRef(), orderBy("totalCases", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [authed]);

  const ranking = useMemo(() => sortPlayersForRanking(players), [players]);
  const showcasePlayers = useMemo(() => ranking.filter((p) => {
    const inv = normalizeInventory(p.inventory);
    return (inv.gold || 0) > 0 || (inv.red || 0) > 0;
  }), [ranking]);

  const summary = useMemo(() => {
    const totalPlayers = players.length;
    const totalCases = players.reduce((sum, p) => sum + (p.totalCases || 0), 0);
    const totalSpent = players.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
    const totalRecovered = players.reduce((sum, p) => sum + (p.totalRecovered || 0), 0);
    const totalCoins = players.reduce((sum, p) => sum + (p.coins || 0), 0);
    const totalSocialScore = players.reduce((sum, p) => sum + calculateSocialScore(p.inventory), 0);
    const totals = players.reduce((acc, p) => {
      const inv = normalizeInventory(p.inventory);
      rarityList.forEach((rarity) => { acc[rarity.id] += inv[rarity.id] || 0; });
      return acc;
    }, emptyInventory());
    return { totalPlayers, totalCases, totalSpent, totalRecovered, totalCoins, totalSocialScore, totals };
  }, [players]);

  async function clearAllPlayers() {
    const confirmText = window.prompt("這會刪除管理員頁面看到的所有玩家資料。請輸入 RESET 確認：");
    if (confirmText !== "RESET") return;

    try {
      setIsClearing(true);
      setAdminMessage("");
      const snapshot = await getDocs(getPlayersRef());
      const batch = writeBatch(db);
      snapshot.docs.forEach((playerDoc) => batch.delete(playerDoc.ref));
      await batch.commit();
      setAdminMessage("已清除所有玩家資料。玩家手機本機的 playerId 仍可能保留，但再次進入會需要重新建立玩家資料。");
    } catch (error) {
      console.error("清除玩家資料失敗：", error);
      setAdminMessage(`清除失敗：${error.code || error.message || "請檢查 Firebase Rules"}`);
    } finally {
      setIsClearing(false);
    }
  }

  if (!authed) {
    return (
      <section className="relative mx-auto max-w-lg pt-16">
        <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3"><Lock className="h-8 w-8" /><div><h1 className="text-2xl font-black">管理員統計頁</h1><p className="text-sm text-violet-100">輸入 PIN 後查看即時資料。</p></div></div>
            <input value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setAuthed(pin === ADMIN_PIN)} placeholder="管理員 PIN" type="password" className="mb-3 min-h-12 w-full rounded-2xl border border-white/20 bg-white/90 px-4 text-slate-900 outline-none" />
            <Button onClick={() => setAuthed(pin === ADMIN_PIN)} className="w-full rounded-2xl font-bold">進入管理頁</Button>
            <a href="#" className="mt-4 block text-center text-sm text-violet-100 hover:text-white">回玩家頁</a>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-7xl space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-violet-100"><BarChart3 className="h-4 w-4" />Live SkinBox Dashboard</div>
            <h1 className="text-3xl font-black sm:text-5xl">管理員統計頁</h1>
            <p className="mt-2 text-sm text-violet-100">最後勝利規則：社交分數最高者獲勝。金色有價無市，不可出售，但社交分數最高。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={clearAllPlayers} disabled={isClearing} variant="destructive" className="rounded-2xl font-bold"><RotateCcw className="mr-2 h-4 w-4" />{isClearing ? "清除中..." : "清除測試資料"}</Button>
            <a href="#" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20">回玩家頁</a>
          </div>
        </div>
      </motion.div>

      {adminMessage && <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-violet-100 backdrop-blur-xl">{adminMessage}</div>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <AdminMetric icon={<Users />} label="參與人數" value={summary.totalPlayers} />
        <AdminMetric icon={<PackageOpen />} label="全班開箱" value={summary.totalCases} />
        <AdminMetric icon={<Coins />} label="總投入" value={summary.totalSpent} />
        <AdminMetric icon={<Wallet />} label="總回收" value={summary.totalRecovered} />
        <AdminMetric icon={<Sparkles />} label="總社交分數" value={summary.totalSocialScore} />
        <AdminMetric icon={<Crown />} label="金色總數" value={summary.totals.gold} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <PodiumCard ranking={ranking} />
        <ShowcaseCard players={showcasePlayers} />
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {rarityList.map((rarity) => <RarityTotalCard key={rarity.id} rarity={rarity} count={summary.totals[rarity.id]} />)}
      </div>

      <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
        <CardContent className="p-6">
          <h2 className="mb-4 text-2xl font-black">完整社交分數排行榜</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-violet-100">
                <tr className="border-b border-white/10"><th className="py-3">#</th><th>玩家</th><th>社交分數</th><th>金</th><th>紅</th><th>紫</th><th>藍</th><th>白</th><th>金幣</th><th>開箱</th><th>投入/回收</th></tr>
              </thead>
              <tbody>
                {ranking.map((p, index) => {
                  const inv = normalizeInventory(p.inventory);
                  return (
                    <tr key={p.id} className="border-b border-white/10">
                      <td className="py-3 font-bold">{index + 1}</td>
                      <td className="font-bold">{p.name}</td>
                      <td className="font-black text-cyan-100">{calculateSocialScore(inv)}</td>
                      <td>{inv.gold}</td><td>{inv.red}</td><td>{inv.purple}</td><td>{inv.blue}</td><td>{inv.white}</td>
                      <td className="text-yellow-200">{p.coins || 0}</td>
                      <td>{p.totalCases || 0}</td>
                      <td>{p.totalSpent || 0} / {p.totalRecovered || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function HeroCard({ coins, socialScore }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-violet-100"><Sparkles className="h-4 w-4" />SkinBox Simulator</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">造型開箱模擬器</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">抽造型、賣低價物、保留高社交價值造型。最後社交分數最高者獲勝。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.div className="rounded-3xl border border-yellow-300/30 bg-yellow-300/15 px-5 py-4 text-right shadow-lg" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity }}><div className="text-sm text-yellow-100">目前金幣</div><div className="flex items-center gap-2 text-3xl font-black text-yellow-200"><Coins className="h-7 w-7" />{coins}</div></motion.div>
          <motion.div className="rounded-3xl border border-cyan-300/30 bg-cyan-300/15 px-5 py-4 text-right shadow-lg" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.9, repeat: Infinity }}><div className="text-sm text-cyan-100">社交分數</div><div className="flex items-center gap-2 text-3xl font-black text-cyan-100"><Sparkles className="h-7 w-7" />{socialScore}</div></motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function SkinCase({ reelItems, reelX, reelShouldAnimate, isOpening, result, nearMiss }) {
  const focus = result || reelItems[CENTER_INDEX] || RARITIES.white;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/70 p-5 shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_55%)]" />
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-70" />
      <motion.div className="absolute left-1/2 top-0 z-30 h-full w-1 -translate-x-1/2 bg-yellow-300 shadow-lg shadow-yellow-300/80" animate={{ opacity: isOpening ? [0.3, 1, 0.3] : 0.9 }} transition={{ duration: 0.35, repeat: isOpening ? Infinity : 0 }} />

      <div className="relative z-20 mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-violet-100">SkinBox Case Opening</div>
          <div className="text-xs text-violet-200">造型軌道由右往左滑動，只有停在中間線上的造型會被獲得。</div>
        </div>
        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-yellow-100">
          {isOpening ? "滑動中..." : result ? `獲得 ${result.colorName}` : "等待開箱"}
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-[1000px] overflow-hidden px-1 py-4">
        <motion.div
          className="flex items-center"
          style={{ gap: REEL_GAP }}
          animate={{ x: reelX }}
          transition={reelShouldAnimate ? { duration: REEL_SPIN_DURATION, ease: [0.18, 0.02, 0.18, 1] } : { duration: 0 }}
        >
          {reelItems.map((item, index) => {
            const isWinningSlot = !isOpening && result && index === REEL_FINAL_INDEX;
            const isCurrentCenter = !isOpening && (index === REEL_FINAL_INDEX || index === CENTER_INDEX);
            const distance = Math.abs(index - REEL_FINAL_INDEX);
            const opacity = isOpening ? 0.95 : distance <= 1 ? 1 : distance <= 3 ? 0.78 : 0.55;
            const scale = isWinningSlot ? 1.14 : isOpening ? 0.95 : distance === 1 ? 0.98 : 0.88;

            return (
              <motion.div
                key={`${index}-${item.id}`}
                animate={{ opacity, scale }}
                transition={{ duration: 0.25 }}
                className={cx(
                  "relative flex aspect-[0.75] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[1.2rem] border text-2xl shadow-2xl sm:text-4xl",
                  item.bg,
                  item.text,
                  item.border,
                  item.glow,
                  isWinningSlot || isCurrentCenter ? "z-20 ring-4 ring-yellow-300/80" : ""
                )}
                style={{ width: REEL_ITEM_WIDTH }}
              >
                {(isWinningSlot || isCurrentCenter) && <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.15, 0.45, 0.15] }} transition={{ duration: 0.7, repeat: Infinity }} />}
                {item.id === "gold" && <motion.div className="absolute inset-0 bg-gradient-to-br from-white/60 via-yellow-200/10 to-transparent" animate={{ x: ["-100%", "120%"] }} transition={{ duration: 1.2, repeat: Infinity }} />}
                {item.id === "red" && <motion.div className="absolute inset-0 bg-rose-300/20" animate={{ opacity: [0.12, 0.45, 0.12] }} transition={{ duration: 0.7, repeat: Infinity }} />}
                <span className="relative drop-shadow-lg">{item.emoji}</span>
                <span className="relative mt-2 text-[10px] font-black sm:text-xs">{item.shortName}</span>
                {(isWinningSlot || isCurrentCenter) && <span className="relative mt-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold">獲得</span>}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {!isOpening && result && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={cx("relative z-30 mt-5 rounded-[1.5rem] border p-4 shadow-2xl", focus.border, focus.id === "gold" ? "bg-yellow-300/20" : focus.id === "red" ? "bg-rose-500/20" : "bg-white/10")}>
            {focus.id === "gold" && <motion.div className="pointer-events-none fixed inset-0 z-40 bg-yellow-300/20" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2 }} />}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <motion.div className="text-6xl" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.25, 1] }} transition={{ duration: 0.8 }}>{focus.emoji}</motion.div>
                <div>
                  <div className="text-sm font-bold text-violet-100">你獲得了</div>
                  <div className="text-2xl font-black sm:text-3xl">{focus.name}</div>
                  <div className="mt-1 text-sm text-violet-100">{focus.marketLabel}｜社交分數 +{focus.socialValue}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-right">
                <div className="text-xs text-violet-100">市場狀態</div>
                <div className="text-lg font-black text-yellow-100">{focus.sellable ? `${focus.sellPrice} 金幣` : "有價無市"}</div>
                <div className="text-xs text-violet-100">{focus.sellable ? "可出售換金幣，但會失去社交分數" : "不可出售，只能展示"}</div>
              </div>
            </div>
            {nearMiss && <div className="mt-3 rounded-xl bg-yellow-300/15 px-3 py-2 text-sm font-bold text-yellow-100">差一點！高價值造型剛剛滑過中間附近，這會放大「下一次可能就中」的感覺。</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultSummary({ result, isOpening }) {
  return (
    <AnimatePresence>
      {result && !isOpening && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-violet-100">稀有度</div><div className="text-2xl font-black">{result.colorName}</div></div>
          <div className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-violet-100">市場價值</div><div className="text-2xl font-black text-yellow-100">{result.sellable ? `${result.sellPrice}` : "有價無市"}</div></div>
          <div className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-violet-100">社交分數</div><div className="text-2xl font-black text-cyan-100">+{result.socialValue}</div></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerStatsCard({ player, inventory, inventoryValue, socialScore }) {
  return (
    <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><Trophy className="h-6 w-6" /></div><div><h2 className="text-xl font-black">玩家狀態</h2><p className="text-sm text-violet-100">最後只看社交分數，最高者獲勝。</p></div></div><div className="grid grid-cols-2 gap-3"><MiniMetric label="社交分數" value={socialScore} /><MiniMetric label="開箱次數" value={player?.totalCases || 0} /><MiniMetric label="已投入" value={player?.totalSpent || 0} /><MiniMetric label="已回收" value={player?.totalRecovered || 0} /><MiniMetric label="紅色持有" value={inventory.red} /><MiniMetric label="金色持有" value={inventory.gold} /></div><div className="mt-3 rounded-2xl bg-white/10 p-4 text-sm text-violet-100">可出售庫存估值：<span className="font-bold text-yellow-200">{inventoryValue}</span> 金幣。金色是 <span className="font-bold text-yellow-200">有價無市</span>：不能賣，但有最高社交分數。</div></CardContent></Card>
  );
}

function InventoryCard({ inventory, sellOne, sellAllLowValue, hasSellableItems }) {
  return (
    <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="shrink-0 rounded-2xl bg-white/15 p-3">
            <Gem className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black">造型庫存</h2>
            <p className="text-sm leading-5 text-violet-100">
              出售造型會拿回金幣，但會失去該造型的社交分數。
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rarityList.map((rarity) => {
            const count = inventory[rarity.id] || 0;
            return (
              <div
                key={rarity.id}
                className={cx(
                  "flex items-center gap-3 rounded-2xl border p-3 shadow-xl",
                  rarity.border,
                  rarity.id === "gold" ? "bg-yellow-300/15" : "bg-white/10"
                )}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                  {rarity.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="whitespace-nowrap text-lg font-black">{rarity.shortName} × {count}</span>
                    <span className="whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-cyan-100">
                      社交 +{rarity.socialValue}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-violet-100">
                    {rarity.sellable ? `市場回收價 ${rarity.sellPrice} 金幣` : "有價無市，不可出售，只能展示"}
                  </div>
                </div>

                <Button
                  onClick={() => sellOne(rarity.id)}
                  disabled={!rarity.sellable || count <= 0}
                  variant={rarity.id === "red" ? "destructive" : "ghost"}
                  className="shrink-0 rounded-xl px-3 py-2 text-xs whitespace-nowrap"
                >
                  {rarity.sellable ? "賣出" : "展示"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryCard({ history }) {
  return (
    <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><History className="h-6 w-6" /></div><div><h2 className="text-xl font-black">操作紀錄</h2><p className="text-sm text-violet-100">最近 {HISTORY_LIMIT} 筆。</p></div></div><div className="max-h-[360px] space-y-2 overflow-auto pr-1">{history.length === 0 ? <div className="rounded-2xl border border-dashed border-white/25 p-5 text-center text-sm text-violet-100">還沒有紀錄。</div> : history.map((item) => <motion.div key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-2xl bg-white/10 p-3"><div className="flex items-center gap-3"><div className="text-2xl">{item.emoji}</div><div><div className="font-bold">{item.action === "sell" ? "出售" : "開箱"}：{item.rarityName}</div><div className="text-xs text-violet-100">{item.time}{item.nearMiss ? " · 差一點高價值造型" : ""}{item.isFreeCase ? " · 免費箱" : ""}{item.earnedFreeTicket ? " · 獲得免費券" : ""}</div></div></div><div className="text-right text-xs text-violet-100">{item.socialValue ? `社交 +${item.socialValue}` : item.sellPrice ? `+${item.sellPrice}` : ""}</div></motion.div>)}</div></CardContent></Card>
  );
}

function PodiumCard({ ranking }) {
  const top = ranking.slice(0, 3);
  return <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-yellow-300/20 p-3"><Medal className="h-6 w-6 text-yellow-200" /></div><div><h2 className="text-2xl font-black">目前社交分數排行榜</h2><p className="text-sm text-violet-100">同分時依金色、紅色、剩餘金幣、較少開箱排序。</p></div></div><div className="space-y-3">{top.length === 0 ? <div className="rounded-2xl border border-dashed border-white/20 p-5 text-center text-violet-100">尚無玩家。</div> : top.map((p, index) => { const inv = normalizeInventory(p.inventory); return <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cx("rounded-2xl border p-4", index === 0 ? "border-yellow-300 bg-yellow-300/15" : "border-white/15 bg-white/10")}><div className="flex items-center justify-between gap-3"><div><div className="text-sm text-violet-100">{index === 0 ? "🥇 第一名" : index === 1 ? "🥈 第二名" : "🥉 第三名"}</div><div className="text-2xl font-black">{p.name}</div></div><div className="text-right"><div className="text-3xl font-black text-cyan-100">{calculateSocialScore(inv)}</div><div className="text-xs text-violet-100">金 {inv.gold}｜紅 {inv.red}</div></div></div></motion.div>; })}</div></CardContent></Card>;
}

function ShowcaseCard({ players }) {
  return <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-rose-400/20 p-3"><Flame className="h-6 w-6 text-rose-200" /></div><div><h2 className="text-2xl font-black">高社交價值展示牆</h2><p className="text-sm text-violet-100">請持有金色或紅色造型的玩家在大家面前展示。</p></div></div><div className="grid gap-3 sm:grid-cols-2">{players.length === 0 ? <div className="rounded-2xl border border-dashed border-white/20 p-5 text-center text-violet-100 sm:col-span-2">目前還沒有人持有紅色或金色造型。</div> : players.map((p) => { const inv = normalizeInventory(p.inventory); return <motion.div key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/15 bg-white/10 p-4"><div className="text-xl font-black">{p.name}</div><div className="mt-2 flex gap-2 text-sm"><span className="rounded-xl bg-yellow-300/20 px-3 py-1 text-yellow-100">金色 × {inv.gold}</span><span className="rounded-xl bg-rose-400/20 px-3 py-1 text-rose-100">紅色 × {inv.red}</span></div><div className="mt-2 text-sm text-violet-100">社交分數：{calculateSocialScore(inv)}</div></motion.div>; })}</div></CardContent></Card>;
}

function RarityTotalCard({ rarity, count }) {
  return <div className={cx("rounded-[1.5rem] border p-4 text-center shadow-xl backdrop-blur-xl", rarity.border, rarity.id === "gold" ? "bg-yellow-300/15" : "bg-white/10")}><div className="text-3xl">{rarity.emoji}</div><div className="mt-1 text-sm text-violet-100">{rarity.colorName}</div><div className="text-3xl font-black">{count}</div><div className="text-xs text-violet-100">機率 {rarity.chance}%</div><div className="text-xs font-bold text-cyan-100">社交 +{rarity.socialValue}</div></div>;
}

function AdminMetric({ icon, label, value }) {
  return <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">{icon}</div><div className="text-sm text-violet-100">{label}</div><div className="text-3xl font-black">{value}</div></div>;
}

function MiniMetric({ label, value }) {
  return <div className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-violet-100">{label}</div><div className="text-3xl font-black">{value}</div></div>;
}

function Toast({ toast, setToast }) {
  return <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onAnimationComplete={() => { window.clearTimeout(window.__skinboxToastTimer); window.__skinboxToastTimer = window.setTimeout(() => setToast(""), 2600); }} className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 text-center text-sm text-white shadow-2xl backdrop-blur-xl">{toast}</motion.div>}</AnimatePresence>;
}

