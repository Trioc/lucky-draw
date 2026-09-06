import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Coins,
  Gem,
  Gift,
  History,
  PackageOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function GlobalLayoutFix() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
  }, []);

  return (
    <style>{`
      html, body, #root {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }

      * {
        box-sizing: border-box;
      }

      body {
        position: relative;
      }

      @media (max-width: 700px) {
        html, body, #root {
          width: 100vw;
          max-width: 100vw;
          overflow-x: hidden;
        }

        #root {
          display: block;
        }

        .skinbox-shell {
          width: 100vw;
          max-width: 100vw;
          overflow-x: hidden;
          padding-left: 12px;
          padding-right: 12px;
        }

        .skinbox-content {
          width: 100%;
          max-width: calc(100vw - 24px);
          margin-left: 0;
          margin-right: 0;
          overflow-x: hidden;
        }

        .phone-card,
        .mobile-safe {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: hidden;
        }

        .mobile-safe * {
          min-width: 0;
        }

        .case-viewport {
          width: 100% !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }

        .case-track {
          width: max-content !important;
          max-width: none !important;
        }

        .phone-stack {
          display: flex !important;
          flex-direction: column !important;
        }

        .phone-full {
          width: 100% !important;
          max-width: 100% !important;
        }
      }


      /* Hard mobile layout reset: entering the player screen adds wide reel/table/button content,
         so every page-level container must be constrained to the visual viewport. */
      @media (max-width: 700px) {
        html, body, #root {
          width: 100dvw !important;
          max-width: 100dvw !important;
          min-width: 0 !important;
          overflow-x: hidden !important;
          overscroll-behavior-x: none;
        }

        .skinbox-shell {
          display: block !important;
          width: 100dvw !important;
          max-width: 100dvw !important;
          min-width: 0 !important;
          overflow-x: clip !important;
          padding: 12px !important;
        }

        .skinbox-content {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
          overflow: clip !important;
        }

        .phone-card,
        .mobile-safe {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .phone-card,
        .mobile-safe {
          overflow: clip !important;
        }

        .case-viewport {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
          contain: layout paint size;
        }

        .case-track {
          width: max-content !important;
          max-width: none !important;
          min-width: 0 !important;
          will-change: transform;
        }

        .phone-stack {
          display: flex !important;
          flex-direction: column !important;
        }

        .phone-full {
          width: 100% !important;
          max-width: 100% !important;
        }

        table {
          max-width: 100%;
        }
      }
    `}</style>
  );
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
        "inline-flex max-w-full items-center justify-center whitespace-normal break-words rounded-xl px-4 py-2 text-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
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

const LOCAL_PLAYER_NAME_KEY = "skinbox_social_player_name_v3";
const LOCAL_PLAYER_DATA_KEY = "skinbox_social_demo_player_v1";

const CASE_COST = 30;
const STARTING_COINS = 300;
const FREE_CASE_EVERY = 5;
const HISTORY_LIMIT = 30;
const CENTER_INDEX = 4;
const REEL_GAP = 8;
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


function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function formatTime() {
  return new Date().toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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


function loadLocalPlayer() {
  try {
    const saved = localStorage.getItem(LOCAL_PLAYER_DATA_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      inventory: normalizeInventory(parsed.inventory),
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (error) {
    console.warn("無法讀取本機 Demo 資料：", error);
    return null;
  }
}

function saveLocalPlayer(player) {
  try {
    if (player) {
      localStorage.setItem(LOCAL_PLAYER_DATA_KEY, JSON.stringify(player));
      localStorage.setItem(LOCAL_PLAYER_NAME_KEY, player.name || "");
    } else {
      localStorage.removeItem(LOCAL_PLAYER_DATA_KEY);
    }
  } catch (error) {
    console.warn("無法儲存本機 Demo 資料：", error);
  }
}

function initialPlayer(name) {
  const now = new Date().toISOString();

  return {
    name,
    coins: STARTING_COINS,
    inventory: emptyInventory(),
    totalCases: 0,
    totalSpent: 0,
    totalRecovered: 0,
    freeTickets: 0,
    paidCaseProgress: 0,
    history: [],
    createdAt: now,
    updatedAt: now,
  };
}


export default function SkinBoxSocialApp() {
  return (
    <main className="skinbox-shell mobile-safe min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#2e1065_34%,#070716_100%)] px-3 py-4 text-white sm:w-full sm:px-4 sm:py-6">
      <GlobalLayoutFix />
      <AnimatedBackground />
      <PlayerPage />
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
  const [nameInput, setNameInput] = useState(
    () => localStorage.getItem(LOCAL_PLAYER_NAME_KEY) || ""
  );
  const [player, setPlayer] = useState(loadLocalPlayer);
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState(null);
  const [nearMiss, setNearMiss] = useState(false);
  const [reelItems, setReelItems] = useState(randomReel);
  const [reelShouldAnimate, setReelShouldAnimate] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveLocalPlayer(player);
  }, [player]);

  const inventory = normalizeInventory(player?.inventory);
  const inventoryValue = calculateInventoryValue(inventory);
  const socialScore = calculateSocialScore(inventory);
  const freeTickets = player?.freeTickets || 0;
  const paidCaseProgress = player?.paidCaseProgress || 0;
  const canOpenPaid = !!player && player.coins >= CASE_COST && !isOpening;
  const canOpenFree = !!player && freeTickets > 0 && !isOpening;
  const shortForNextCase = Math.max(0, CASE_COST - (player?.coins || 0));

  function registerPlayer() {
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setToast("請先輸入玩家名稱。");
      return;
    }

    const nextPlayer = initialPlayer(cleanName);
    setPlayer(nextPlayer);
    setNameInput(cleanName);
    setToast(`歡迎，${cleanName}！Demo 資料只會保存在這台裝置的瀏覽器中。`);
  }

  function resetLocalPlayer() {
    localStorage.removeItem(LOCAL_PLAYER_DATA_KEY);
    localStorage.removeItem(LOCAL_PLAYER_NAME_KEY);
    setNameInput("");
    setPlayer(null);
    setResult(null);
    setNearMiss(false);
    setReelItems(randomReel());
    setReelShouldAnimate(false);
    setToast("已重設這台裝置上的 Demo 資料。");
  }

  async function openCase(useFreeTicket = false) {
    if (!player) {
      setToast("請先建立玩家。");
      return;
    }

    const isFreeCase = useFreeTicket && (player.freeTickets || 0) > 0;

    if (!isFreeCase && player.coins < CASE_COST) {
      setToast("金幣不足，可以出售造型換金幣繼續開箱。");
      return;
    }

    if (useFreeTicket && (player.freeTickets || 0) <= 0) {
      setToast("目前沒有免費開箱券。");
      return;
    }

    setIsOpening(true);
    setReelShouldAnimate(false);
    setResult(null);
    setNearMiss(false);
    setToast("");

    const currentPlayer = player;
    const finalRarity = weightedRandomRarity();
    const isNearMiss =
      finalRarity.id !== "gold" &&
      (finalRarity.id === "purple" || finalRarity.id === "red"
        ? Math.random() < 0.65
        : Math.random() < 0.22);

    const currentProgress = currentPlayer.paidCaseProgress || 0;
    const earnedFreeTicket =
      !isFreeCase && currentProgress + 1 >= FREE_CASE_EVERY;
    const nextPaidProgress = isFreeCase
      ? currentProgress
      : earnedFreeTicket
        ? 0
        : currentProgress + 1;

    const openingTrack = createOpeningTrack(finalRarity, isNearMiss);
    setReelItems(openingTrack);
    setReelShouldAnimate(false);

    await new Promise((resolve) => setTimeout(resolve, 120));
    setReelShouldAnimate(true);

    await new Promise((resolve) =>
      setTimeout(resolve, REEL_SPIN_DURATION * 1000 + 250)
    );

    const currentInventory = normalizeInventory(currentPlayer.inventory);
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

    const nextPlayer = {
      ...currentPlayer,
      coins: isFreeCase
        ? currentPlayer.coins
        : currentPlayer.coins - CASE_COST,
      totalSpent:
        (currentPlayer.totalSpent || 0) + (isFreeCase ? 0 : CASE_COST),
      freeTickets: Math.max(
        0,
        (currentPlayer.freeTickets || 0) -
          (isFreeCase ? 1 : 0) +
          (earnedFreeTicket ? 1 : 0)
      ),
      paidCaseProgress: nextPaidProgress,
      inventory: nextInventory,
      totalCases: (currentPlayer.totalCases || 0) + 1,
      history: [historyItem, ...(currentPlayer.history || [])].slice(
        0,
        HISTORY_LIMIT
      ),
      lastRarityName: finalRarity.name,
      lastRarityId: finalRarity.id,
      lastWasNearMiss: isNearMiss,
      updatedAt: new Date().toISOString(),
    };

    setPlayer(nextPlayer);
    setReelShouldAnimate(false);
    setResult(finalRarity);
    setNearMiss(isNearMiss);
    setIsOpening(false);

    if (earnedFreeTicket) {
      setToast(
        `已累積 ${FREE_CASE_EVERY} 次付費開箱，獲得 1 張免費開箱券！`
      );
    }
  }

  function sellOne(rarityId) {
    if (!player) return;

    const rarity = RARITIES[rarityId];
    const currentInventory = normalizeInventory(player.inventory);

    if (!rarity.sellable) {
      setToast("金色神話造型有價無市，不可出售，只能展示。");
      return;
    }

    if ((currentInventory[rarityId] || 0) <= 0) {
      setToast("你沒有這個造型可以出售。");
      return;
    }

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

    setPlayer({
      ...player,
      inventory: nextInventory,
      coins: player.coins + rarity.sellPrice,
      totalRecovered: (player.totalRecovered || 0) + rarity.sellPrice,
      history: [historyItem, ...(player.history || [])].slice(
        0,
        HISTORY_LIMIT
      ),
      updatedAt: new Date().toISOString(),
    });

    setToast(
      `已出售 ${rarity.shortName}色造型，回收 ${rarity.sellPrice} 金幣，但社交分數會下降。`
    );
  }

  return (
    <section className="skinbox-content mobile-safe relative mx-0 flex w-full max-w-full min-w-0 flex-col gap-4 overflow-hidden sm:mx-auto xl:grid xl:max-w-7xl xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="mobile-safe min-w-0 space-y-4">
        <HeroCard coins={player?.coins ?? STARTING_COINS} socialScore={socialScore} />

        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-50 backdrop-blur-xl">
          <span className="font-black">Portfolio Demo Mode</span>
          {" — "}
          此公開版本不連接原課堂 Firebase。玩家進度只儲存在目前瀏覽器的 localStorage，
          不會上傳姓名、庫存或操作紀錄。
        </div>

        {!player ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="phone-card mobile-safe w-full max-w-full min-w-0 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">建立 Demo 玩家</h2>
                <p className="min-w-0 break-words text-sm text-violet-100">
                  名稱、金幣與造型庫只會保存在這台裝置的瀏覽器中。
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && registerPlayer()}
                placeholder="例如：Jeff"
                className="min-h-12 flex-1 rounded-2xl border border-white/20 bg-white/90 px-4 text-slate-900 outline-none ring-violet-300 transition focus:ring-4"
              />
              <Button
                onClick={registerPlayer}
                className="min-h-12 rounded-2xl px-6 text-base font-bold"
              >
                開始體驗
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="phone-card mobile-safe w-full max-w-full min-w-0 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-violet-100">目前 Demo 玩家</p>
                <h2 className="flex items-center gap-2 text-2xl font-black">
                  <UserRound className="h-6 w-6" />
                  {player.name}
                </h2>
              </div>
              <Button
                onClick={resetLocalPlayer}
                disabled={isOpening}
                variant="destructive"
                className="rounded-2xl font-bold"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                重設 Demo
              </Button>
            </div>

            <SkinCase
              reelItems={reelItems}
              reelShouldAnimate={reelShouldAnimate}
              isOpening={isOpening}
              result={result}
              nearMiss={nearMiss}
            />

            <div className="mt-5 space-y-4">
              <div className="flex min-w-0 flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 break-words text-sm leading-6 text-violet-100">
                  每次付費開箱花費{" "}
                  <span className="font-bold text-yellow-200">{CASE_COST}</span>{" "}
                  金幣。每開{" "}
                  <span className="font-bold text-cyan-100">
                    {FREE_CASE_EVERY}
                  </span>{" "}
                  次付費箱，獲得 1 張免費開箱券。
                  {shortForNextCase > 0 && (
                    <span className="ml-1 text-yellow-100">
                      距離下一次開箱只差 {shortForNextCase} 金幣。
                    </span>
                  )}
                </div>

                <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
                  {freeTickets > 0 && (
                    <Button
                      onClick={() => openCase(true)}
                      disabled={!canOpenFree}
                      variant="secondary"
                      className="min-h-14 w-full rounded-2xl px-6 text-base font-black sm:w-auto"
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      使用免費券 × {freeTickets}
                    </Button>
                  )}

                  <Button
                    onClick={() => openCase(false)}
                    disabled={!canOpenPaid}
                    className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-500 px-5 text-base font-black text-slate-950 shadow-lg transition hover:scale-[1.02] sm:w-auto sm:px-8 sm:text-lg"
                  >
                    <PackageOpen className="mr-2 h-5 w-5" />
                    {isOpening ? "開箱中..." : `花 ${CASE_COST} 金幣開箱`}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-violet-100">免費箱進度</span>
                  <span className="font-black text-cyan-100">
                    {paidCaseProgress} / {FREE_CASE_EVERY}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-950/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-yellow-300"
                    animate={{
                      width: `${(paidCaseProgress / FREE_CASE_EVERY) * 100}%`,
                    }}
                    transition={{ duration: 0.45 }}
                  />
                </div>
                <div className="mt-2 text-xs text-violet-100">
                  付費開箱才會累積進度；免費箱不消耗金幣，也不累積免費箱進度。
                  免費券：
                  <span className="font-bold text-yellow-200">
                    {freeTickets}
                  </span>{" "}
                  張。
                </div>
              </div>
            </div>

            <ResultSummary result={result} isOpening={isOpening} />
          </motion.div>
        )}

        {player && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="phone-card mobile-safe hidden w-full max-w-full min-w-0 overflow-hidden xl:block"
          >
            <PlayerStatsCard
              player={player}
              inventory={inventory}
              inventoryValue={inventoryValue}
              socialScore={socialScore}
            />
          </motion.div>
        )}
      </div>

      <div className="mobile-safe min-w-0 space-y-4 xl:max-w-[320px]">
        <InventoryCard inventory={inventory} sellOne={sellOne} />

        {player && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="phone-card mobile-safe w-full max-w-full min-w-0 overflow-hidden xl:hidden"
          >
            <PlayerStatsCard
              player={player}
              inventory={inventory}
              inventoryValue={inventoryValue}
              socialScore={socialScore}
            />
          </motion.div>
        )}

        <HistoryCard history={player?.history || []} />
      </div>

      <Toast toast={toast} setToast={setToast} />
    </section>
  );
}

function HeroCard({ coins, socialScore }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="phone-card mobile-safe w-full max-w-full min-w-0 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-violet-100"><Sparkles className="h-4 w-4" />SkinBox Simulator</div>
          <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">造型開箱模擬器</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">模擬原課堂活動的開箱、出售與社交分數機制；目前版本為單機展示，不含全班排行榜。</p>
        </div>
        <div className="phone-full flex w-full flex-wrap gap-3 sm:w-auto">
          <motion.div className="phone-full rounded-3xl border border-yellow-300/30 bg-yellow-300/15 px-5 py-4 text-left shadow-lg sm:text-right" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity }}><div className="text-sm text-yellow-100">目前金幣</div><div className="flex items-center gap-2 text-3xl font-black text-yellow-200"><Coins className="h-7 w-7" />{coins}</div></motion.div>
          <motion.div className="phone-full rounded-3xl border border-cyan-300/30 bg-cyan-300/15 px-5 py-4 text-left shadow-lg sm:text-right" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.9, repeat: Infinity }}><div className="text-sm text-cyan-100">社交分數</div><div className="flex items-center gap-2 text-3xl font-black text-cyan-100"><Sparkles className="h-7 w-7" />{socialScore}</div></motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function SkinCase({ reelItems, reelShouldAnimate, isOpening, result, nearMiss }) {
  const focus = result || reelItems[CENTER_INDEX] || RARITIES.white;
  const viewportRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    if (!viewportRef.current) return;
    const updateWidth = () => setViewportWidth(viewportRef.current?.clientWidth || 0);
    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  const isCompact = viewportWidth > 0 && viewportWidth < 520;
  const itemWidth = isCompact ? 54 : 104;
  const itemGap = isCompact ? 6 : REEL_GAP;
  const reelStep = itemWidth + itemGap;

  // 核心修正：
  // 黃色中線在 viewport 的正中央；真正中獎格固定是 REEL_FINAL_INDEX。
  // 因此最後位移必須用實際 viewportWidth 計算，而不是假設中線永遠在 500px。
  const finalX = viewportWidth
    ? viewportWidth / 2 - itemWidth / 2 - REEL_FINAL_INDEX * reelStep
    : 0;

  // 未開箱時讓第 CENTER_INDEX 張落在中線；開箱時滑到 REEL_FINAL_INDEX。
  // 不再用 x=0，避免手機版看到軌道從左邊切出、撐寬或看起來跑版。
  const idleX = viewportWidth
    ? viewportWidth / 2 - itemWidth / 2 - CENTER_INDEX * reelStep
    : 0;
  const targetX = reelShouldAnimate || result ? finalX : idleX;

  return (
    <div className="phone-card mobile-safe relative w-full max-w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-white/20 bg-slate-950/70 p-3 shadow-inner sm:rounded-[2rem] sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_55%)]" />
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-70" />
      <div className="relative z-20 mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-4">
        <div className="min-w-0">
          <div className="text-sm font-bold text-violet-100 sm:text-base">SkinBox Case Opening</div>
          <div className="max-w-full break-words text-xs leading-5 text-violet-200 sm:text-sm">造型軌道由右往左滑動，只有停在中間線上的造型會被獲得。</div>
        </div>
        <div className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-yellow-100">
          {isOpening ? "滑動中..." : result ? `獲得 ${result.colorName}` : "等待開箱"}
        </div>
      </div>

      <div ref={viewportRef} className="case-viewport relative z-20 mx-auto h-[150px] w-full min-w-0 max-w-full overflow-hidden px-0 py-2 sm:h-[245px] sm:max-w-[1000px] sm:py-4">
        <motion.div
          className="pointer-events-none absolute left-1/2 top-2 z-30 h-[calc(100%-1rem)] w-1 -translate-x-1/2 bg-yellow-300 shadow-lg shadow-yellow-300/80"
          animate={{ opacity: isOpening ? [0.3, 1, 0.3] : 0.9 }}
          transition={{ duration: 0.35, repeat: isOpening ? Infinity : 0 }}
        />
        <motion.div
          className="case-track absolute left-0 top-1/2 flex -translate-y-1/2 items-center"
          style={{ gap: itemGap }}
          animate={{ x: targetX }}
          transition={reelShouldAnimate ? { duration: REEL_SPIN_DURATION, ease: [0.12, 0.78, 0.16, 1] } : { duration: 0 }}
        >
          {reelItems.map((item, index) => {
            const isWinningSlot = !isOpening && result && index === REEL_FINAL_INDEX;
            const distance = Math.abs(index - REEL_FINAL_INDEX);
            const opacity = isOpening ? 0.95 : isWinningSlot ? 1 : distance <= 1 ? 0.92 : distance <= 3 ? 0.78 : 0.62;
            const scale = isWinningSlot ? 1.12 : isOpening ? 0.96 : distance <= 1 ? 0.96 : 0.88;

            return (
              <motion.div
                key={`${index}-${item.id}`}
                animate={{ opacity, scale }}
                transition={{ duration: 0.25 }}
                className={cx(
                  "relative flex aspect-[0.75] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[1rem] border text-xl shadow-2xl sm:rounded-[1.2rem] sm:text-4xl",
                  item.bg,
                  item.text,
                  item.border,
                  item.glow,
                  isWinningSlot ? "z-20 ring-4 ring-yellow-300/80" : ""
                )}
                style={{ width: itemWidth }}
              >
                {isWinningSlot && <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0.15, 0.45, 0.15] }} transition={{ duration: 0.7, repeat: Infinity }} />}
                {item.id === "gold" && <motion.div className="absolute inset-0 bg-gradient-to-br from-white/60 via-yellow-200/10 to-transparent" animate={{ x: ["-100%", "120%"] }} transition={{ duration: 1.2, repeat: Infinity }} />}
                {item.id === "red" && <motion.div className="absolute inset-0 bg-rose-300/20" animate={{ opacity: [0.12, 0.45, 0.12] }} transition={{ duration: 0.7, repeat: Infinity }} />}
                <span className="relative text-2xl drop-shadow-lg sm:text-4xl">{item.emoji}</span>
                <span className="relative mt-1 text-[10px] font-black sm:mt-2 sm:text-xs">{item.shortName}</span>
                {isWinningSlot && <span className="relative mt-1 rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-bold sm:text-[10px]">獲得</span>}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {!isOpening && result && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={cx("relative z-30 mt-3 rounded-[1.5rem] border p-3 shadow-2xl sm:mt-5 sm:p-4", focus.border, focus.id === "gold" ? "bg-yellow-300/20" : focus.id === "red" ? "bg-rose-500/20" : "bg-white/10")}>
            {focus.id === "gold" && <motion.div className="pointer-events-none fixed inset-0 z-40 bg-yellow-300/20" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2 }} />}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <motion.div className="shrink-0 text-5xl sm:text-6xl" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.25, 1] }} transition={{ duration: 0.8 }}>{focus.emoji}</motion.div>
                <div>
                  <div className="text-sm font-bold text-violet-100">你獲得了</div>
                  <div className="break-words text-xl font-black sm:text-3xl">{focus.name}</div>
                  <div className="mt-1 text-xs text-violet-100 sm:text-sm">{focus.marketLabel}｜社交分數 +{focus.socialValue}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-left sm:text-right">
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
    <Card className="phone-card rounded-[2rem] border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-4 sm:p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><Trophy className="h-6 w-6" /></div><div><h2 className="text-xl font-black">玩家狀態</h2><p className="text-sm text-violet-100">原課堂活動以社交分數作為排行榜的主要依據。</p></div></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"><MiniMetric label="社交分數" value={socialScore} /><MiniMetric label="開箱次數" value={player?.totalCases || 0} /><MiniMetric label="已投入" value={player?.totalSpent || 0} /><MiniMetric label="已回收" value={player?.totalRecovered || 0} /><MiniMetric label="紅色持有" value={inventory.red} /><MiniMetric label="金色持有" value={inventory.gold} /></div><div className="mt-3 rounded-2xl bg-white/10 p-4 text-sm text-violet-100">可出售庫存估值：<span className="font-bold text-yellow-200">{inventoryValue}</span> 金幣。金色是 <span className="font-bold text-yellow-200">有價無市</span>：不能賣，但有最高社交分數。</div></CardContent></Card>
  );
}

function InventoryCard({ inventory, sellOne }) {
  return (
    <Card className="phone-card rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
      <CardContent className="p-4 sm:p-6">
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
    <Card className="phone-card rounded-[2rem] border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-4 sm:p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><History className="h-6 w-6" /></div><div><h2 className="text-xl font-black">操作紀錄</h2><p className="text-sm text-violet-100">最近 {HISTORY_LIMIT} 筆。</p></div></div><div className="max-h-[360px] space-y-2 overflow-auto pr-1">{history.length === 0 ? <div className="rounded-2xl border border-dashed border-white/25 p-5 text-center text-sm text-violet-100">還沒有紀錄。</div> : history.map((item) => <motion.div key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-2xl bg-white/10 p-3"><div className="flex items-center gap-3"><div className="text-2xl">{item.emoji}</div><div><div className="font-bold">{item.action === "sell" ? "出售" : "開箱"}：{item.rarityName}</div><div className="text-xs text-violet-100">{item.time}{item.nearMiss ? " · 差一點高價值造型" : ""}{item.isFreeCase ? " · 免費箱" : ""}{item.earnedFreeTicket ? " · 獲得免費券" : ""}</div></div></div><div className="text-right text-xs text-violet-100">{item.socialValue ? `社交 +${item.socialValue}` : item.sellPrice ? `+${item.sellPrice}` : ""}</div></motion.div>)}</div></CardContent></Card>
  );
}

function MiniMetric({ label, value }) {
  return <div className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-violet-100">{label}</div><div className="text-3xl font-black">{value}</div></div>;
}

function Toast({ toast, setToast }) {
  return <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onAnimationComplete={() => { window.clearTimeout(window.__skinboxToastTimer); window.__skinboxToastTimer = window.setTimeout(() => setToast(""), 2600); }} className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 text-center text-sm text-white shadow-2xl backdrop-blur-xl">{toast}</motion.div>}</AnimatePresence>;
}

