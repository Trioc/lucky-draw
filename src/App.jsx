import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Coins,
  Gift,
  History,
  Lock,
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
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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

/*
  GitHub Pages + Firebase 版本

  安裝：
  npm install firebase framer-motion lucide-react

  Firebase Console 建立 Web App 後，把 firebaseConfig 換成你的。
  管理員頁面網址：你的網址/#admin

  注意：純前端的 ADMIN_PIN 只能防一般同學亂點，不是真正安全。
  要真正防作弊，需要 Firebase Auth + Firestore Rules 或後端 Cloud Functions。
*/

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

const SESSION_ID = "class-demo-001";
const LOCAL_PLAYER_ID_KEY = "lucky_draw_firebase_player_id_v1";
const LOCAL_PLAYER_NAME_KEY = "lucky_draw_firebase_player_name_v1";
const ADMIN_PIN = "1234";

const DRAW_COST = 10;
const STARTING_COINS = 100;
const DAILY_BONUS = 50;
const HISTORY_LIMIT = 20;

const prizePool = [
  { id: "jackpot", name: "大獎券", emoji: "🏆", coinReward: 120, weight: 3, type: "win", message: "爆擊！你抽中了大獎券！" },
  { id: "drink", name: "飲料券", emoji: "🥤", coinReward: 50, weight: 8, type: "win", message: "恭喜！獲得飲料券！" },
  { id: "candy", name: "糖果", emoji: "🍬", coinReward: 20, weight: 18, type: "win", message: "甜甜的勝利！獲得糖果！" },
  { id: "bonus", name: "金幣返還", emoji: "🪙", coinReward: 15, weight: 16, type: "small", message: "小回饋！返還一些金幣。" },
  { id: "near_miss", name: "差一點", emoji: "😵‍💫", coinReward: 0, weight: 28, type: "near", message: "差一點！你剛剛幾乎就中獎了。" },
  { id: "empty", name: "沒中", emoji: "💨", coinReward: 0, weight: 27, type: "lose", message: "這次沒中，再試一次？" },
];

function weightedRandomPrize() {
  const total = prizePool.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * total;
  for (const prize of prizePool) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }
  return prizePool[prizePool.length - 1];
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

function initialPlayer(name) {
  return {
    name,
    coins: STARTING_COINS,
    totalDraws: 0,
    totalWins: 0,
    nearMissCount: 0,
    lastBonusDate: "",
    history: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export default function FirebaseLotteryApp() {
  const [route, setRoute] = useState(window.location.hash === "#admin" ? "admin" : "player");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash === "#admin" ? "admin" : "player");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#7c3aed_0%,#26124d_38%,#070716_100%)] px-4 py-6 text-white">
      <AnimatedBackground />
      {route === "admin" ? <AdminPage /> : <PlayerPage />}
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 opacity-50">
      <motion.div
        className="absolute left-12 top-20 h-32 w-32 rounded-full bg-fuchsia-400 blur-3xl"
        animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-cyan-300 blur-3xl"
        animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
}

function PlayerPage() {
  const [playerId, setPlayerId] = useState(localStorage.getItem(LOCAL_PLAYER_ID_KEY) || "");
  const [nameInput, setNameInput] = useState(localStorage.getItem(LOCAL_PLAYER_NAME_KEY) || "");
  const [player, setPlayer] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState(null);
  const [reelItems, setReelItems] = useState(["❔", "❔", "❔"]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!playerId) return;
    const unsub = onSnapshot(getPlayerRef(playerId), (snap) => {
      if (snap.exists()) setPlayer({ id: snap.id, ...snap.data() });
      else setPlayer(null);
    });
    return unsub;
  }, [playerId]);

  const canDraw = !!player && player.coins >= DRAW_COST && !isDrawing;
  const winRate = player?.totalDraws ? Math.round((player.totalWins / player.totalDraws) * 100) : 0;

  async function registerPlayer() {
    const cleanName = nameInput.trim();
    if (!cleanName) return setToast("請先輸入玩家名稱。 ");

    let id = playerId || createId();
    const ref = getPlayerRef(id);
    const snap = await getDoc(ref);
    if (!snap.exists()) await setDoc(ref, initialPlayer(cleanName));
    else await updateDoc(ref, { name: cleanName, updatedAt: serverTimestamp() });

    localStorage.setItem(LOCAL_PLAYER_ID_KEY, id);
    localStorage.setItem(LOCAL_PLAYER_NAME_KEY, cleanName);
    setPlayerId(id);
    setToast(`歡迎，${cleanName}！你的資料會同步到 Firebase。`);
  }

  async function claimDailyBonus() {
    if (!player) return;
    const key = todayKey();
    if (player.lastBonusDate === key) return setToast("今天已經領過每日金幣了，明天再來！");
    await updateDoc(getPlayerRef(playerId), {
      coins: increment(DAILY_BONUS),
      lastBonusDate: key,
      updatedAt: serverTimestamp(),
    });
    setToast(`領取成功！獲得 ${DAILY_BONUS} 枚金幣。`);
  }

  async function resetLocalPlayer() {
    localStorage.removeItem(LOCAL_PLAYER_ID_KEY);
    localStorage.removeItem(LOCAL_PLAYER_NAME_KEY);
    setPlayerId("");
    setNameInput("");
    setPlayer(null);
    setResult(null);
    setReelItems(["❔", "❔", "❔"]);
    setToast("已清除這台裝置的玩家登入。Firebase 內的紀錄仍保留給管理員統計。 ");
  }

  async function drawPrize() {
    if (!canDraw) return setToast(player ? "金幣不足，請領每日金幣。" : "請先建立玩家。 ");

    setIsDrawing(true);
    setResult(null);
    setToast("");
    const finalPrize = weightedRandomPrize();
    const animationEmojis = prizePool.map((p) => p.emoji);

    await updateDoc(getPlayerRef(playerId), {
      coins: increment(-DRAW_COST),
      updatedAt: serverTimestamp(),
    });

    for (let i = 0; i < 18; i++) {
      await new Promise((resolve) => setTimeout(resolve, 65 + i * 8));
      setReelItems([
        animationEmojis[Math.floor(Math.random() * animationEmojis.length)],
        animationEmojis[Math.floor(Math.random() * animationEmojis.length)],
        animationEmojis[Math.floor(Math.random() * animationEmojis.length)],
      ]);
    }

    const finalReel =
      finalPrize.type === "near"
        ? ["🏆", "🏆", "💨"]
        : finalPrize.type === "win"
          ? [finalPrize.emoji, finalPrize.emoji, finalPrize.emoji]
          : ["💨", finalPrize.emoji, "💨"];

    const isWin = finalPrize.type === "win" || finalPrize.type === "small";
    const historyItem = {
      id: createId(),
      time: formatTime(),
      prizeId: finalPrize.id,
      prizeName: finalPrize.name,
      emoji: finalPrize.emoji,
      coinReward: finalPrize.coinReward,
      type: finalPrize.type,
    };

    const nextHistory = [historyItem, ...(player.history || [])].slice(0, HISTORY_LIMIT);

    await updateDoc(getPlayerRef(playerId), {
      coins: increment(finalPrize.coinReward),
      totalDraws: increment(1),
      totalWins: increment(isWin ? 1 : 0),
      nearMissCount: increment(finalPrize.type === "near" ? 1 : 0),
      history: nextHistory,
      lastPrizeName: finalPrize.name,
      lastPrizeType: finalPrize.type,
      updatedAt: serverTimestamp(),
    });

    setReelItems(finalReel);
    setResult(finalPrize);
    setIsDrawing(false);
  }

  return (
    <section className="relative mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <HeroCard coins={player?.coins ?? STARTING_COINS} />

        {!player ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3"><UserRound className="h-6 w-6" /></div>
              <div>
                <h2 className="text-2xl font-bold">建立玩家</h2>
                <p className="text-sm text-violet-100">輸入名稱後，資料會同步到 Firebase。</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && registerPlayer()} placeholder="例如：Jeff" className="min-h-12 flex-1 rounded-2xl border border-white/20 bg-white/90 px-4 text-slate-900 outline-none ring-violet-300 transition focus:ring-4" />
              <Button onClick={registerPlayer} className="min-h-12 rounded-2xl px-6 text-base font-bold">開始遊戲</Button>
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
                <Button onClick={claimDailyBonus} variant="secondary" className="rounded-2xl font-bold"><Wallet className="mr-2 h-4 w-4" />領每日 {DAILY_BONUS}</Button>
                <Button onClick={resetLocalPlayer} variant="destructive" className="rounded-2xl font-bold"><RotateCcw className="mr-2 h-4 w-4" />清除本機</Button>
              </div>
            </div>

            <SlotMachine reelItems={reelItems} isDrawing={isDrawing} />

            <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-sm text-violet-100">每次抽獎花費 <span className="font-bold text-yellow-200">{DRAW_COST}</span> 金幣。</div>
              <Button onClick={drawPrize} disabled={!canDraw} className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-500 px-8 text-lg font-black text-slate-950 shadow-lg transition hover:scale-[1.02] sm:w-auto">
                <Gift className="mr-2 h-5 w-5" />{isDrawing ? "抽獎中..." : `花 ${DRAW_COST} 金幣抽一次`}
              </Button>
            </div>

            <ResultCard result={result} isDrawing={isDrawing} />
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <StatsCard totalDraws={player?.totalDraws || 0} winRate={winRate} nearMissCount={player?.nearMissCount || 0} drawCost={DRAW_COST} />
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

  useEffect(() => {
    if (!authed) return;
    const q = query(getPlayersRef(), orderBy("totalDraws", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [authed]);

  const summary = useMemo(() => {
    const totalPlayers = players.length;
    const totalDraws = players.reduce((sum, p) => sum + (p.totalDraws || 0), 0);
    const totalWins = players.reduce((sum, p) => sum + (p.totalWins || 0), 0);
    const nearMisses = players.reduce((sum, p) => sum + (p.nearMissCount || 0), 0);
    const totalCoins = players.reduce((sum, p) => sum + (p.coins || 0), 0);
    return { totalPlayers, totalDraws, totalWins, nearMisses, totalCoins, winRate: totalDraws ? Math.round((totalWins / totalDraws) * 100) : 0 };
  }, [players]);

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
    <section className="relative mx-auto max-w-6xl space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-violet-100"><BarChart3 className="h-4 w-4" />Live Dashboard</div>
            <h1 className="text-3xl font-black sm:text-5xl">管理員統計頁</h1>
            <p className="mt-2 text-sm text-violet-100">資料會隨 Firebase Firestore 即時更新，適合投影在台上。</p>
          </div>
          <a href="#" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20">回玩家頁</a>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminMetric icon={<Users />} label="參與人數" value={summary.totalPlayers} />
        <AdminMetric icon={<Gift />} label="總抽獎次數" value={summary.totalDraws} />
        <AdminMetric icon={<Trophy />} label="總中獎次數" value={summary.totalWins} />
        <AdminMetric icon={<Sparkles />} label="近失敗次數" value={summary.nearMisses} />
        <AdminMetric icon={<Coins />} label="全班剩餘金幣" value={summary.totalCoins} />
      </div>

      <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
        <CardContent className="p-6">
          <h2 className="mb-4 text-2xl font-black">玩家排行榜</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-violet-100">
                <tr className="border-b border-white/10">
                  <th className="py-3">#</th><th>玩家</th><th>金幣</th><th>抽獎</th><th>中獎</th><th>近失敗</th><th>最後結果</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, index) => (
                  <tr key={p.id} className="border-b border-white/10">
                    <td className="py-3 font-bold">{index + 1}</td>
                    <td className="font-bold">{p.name}</td>
                    <td className="text-yellow-200">{p.coins || 0}</td>
                    <td>{p.totalDraws || 0}</td>
                    <td>{p.totalWins || 0}</td>
                    <td>{p.nearMissCount || 0}</td>
                    <td>{p.lastPrizeName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function HeroCard({ coins }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-violet-100"><Sparkles className="h-4 w-4" />Lucky Candy Machine</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">心理學抽獎實驗機</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">玩家名稱、金幣、抽獎紀錄會同步到 Firebase。適合 GitHub Pages 公開給全班使用。</p>
        </div>
        <motion.div className="rounded-3xl border border-yellow-300/30 bg-yellow-300/15 px-5 py-4 text-right shadow-lg" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <div className="text-sm text-yellow-100">目前金幣</div><div className="flex items-center gap-2 text-3xl font-black text-yellow-200"><Coins className="h-7 w-7" />{coins}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SlotMachine({ reelItems, isDrawing }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/60 p-5 shadow-inner">
      <div className="absolute inset-x-0 top-1/2 h-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="grid grid-cols-3 gap-3">
        {reelItems.map((item, index) => (
          <motion.div key={`${item}-${index}-${isDrawing}`} initial={{ y: -30, opacity: 0, rotateX: -50 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="flex aspect-square items-center justify-center rounded-[1.5rem] border border-white/15 bg-white text-5xl shadow-xl sm:text-7xl">
            <span className="drop-shadow-lg">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, isDrawing }) {
  return (
    <AnimatePresence>
      {result && !isDrawing && (
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className={`mt-5 rounded-[1.5rem] border p-4 ${result.type === "win" ? "border-yellow-300/40 bg-yellow-300/15" : result.type === "near" ? "border-fuchsia-300/40 bg-fuchsia-300/15" : "border-white/15 bg-white/10"}`}>
          <div className="flex items-center gap-3"><motion.div className="text-5xl" animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.7 }}>{result.emoji}</motion.div><div><h3 className="text-xl font-black">{result.message}</h3><p className="text-sm text-violet-100">獲得金幣：{result.coinReward}，本次成本：{DRAW_COST}</p></div></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatsCard({ totalDraws, winRate, nearMissCount, drawCost }) {
  return (
    <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><Trophy className="h-6 w-6" /></div><div><h2 className="text-xl font-black">玩家統計</h2><p className="text-sm text-violet-100">個人抽獎資料。</p></div></div><div className="grid grid-cols-2 gap-3"><MiniMetric label="總抽獎" value={totalDraws} /><MiniMetric label="中獎率" value={`${winRate}%`} /><MiniMetric label="差一點" value={nearMissCount} /><MiniMetric label="抽獎成本" value={drawCost} /></div></CardContent></Card>
  );
}

function MiniMetric({ label, value }) {
  return <div className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-violet-100">{label}</div><div className="text-3xl font-black">{value}</div></div>;
}

function HistoryCard({ history }) {
  return (
    <Card className="rounded-[2rem] border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><History className="h-6 w-6" /></div><div><h2 className="text-xl font-black">抽獎紀錄</h2><p className="text-sm text-violet-100">最近 {HISTORY_LIMIT} 筆。</p></div></div><div className="max-h-[410px] space-y-2 overflow-auto pr-1">{history.length === 0 ? <div className="rounded-2xl border border-dashed border-white/25 p-5 text-center text-sm text-violet-100">還沒有抽獎紀錄。</div> : history.map((item) => <motion.div key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-2xl bg-white/10 p-3"><div className="flex items-center gap-3"><div className="text-2xl">{item.emoji}</div><div><div className="font-bold">{item.prizeName}</div><div className="text-xs text-violet-100">{item.time}</div></div></div><div className="text-right text-sm"><div className="font-bold text-yellow-200">+{item.coinReward}</div><div className="text-xs text-violet-100">{item.type}</div></div></motion.div>)}</div></CardContent></Card>
  );
}

function AdminMetric({ icon, label, value }) {
  return <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">{icon}</div><div className="text-sm text-violet-100">{label}</div><div className="text-3xl font-black">{value}</div></div>;
}

function Toast({ toast, setToast }) {
  return (
    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onAnimationComplete={() => { window.clearTimeout(window.__luckyToastTimer); window.__luckyToastTimer = window.setTimeout(() => setToast(""), 2200); }} className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 text-center text-sm text-white shadow-2xl backdrop-blur-xl">{toast}</motion.div>}</AnimatePresence>
  );
}

