import fs from "fs";
import path from "path";
import { logger } from "./logger";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const rewardsFile = path.resolve(dataDir, "rewards.json");

export interface RewardRecord {
  userId: string;
  points: number;
  gems: number;
  birds: number;
  lastDailyClaim: string | null;
  streakDays: number;
}

type RewardsData = Record<string, RewardRecord>;

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function read(): RewardsData {
  ensureDataDir();
  if (!fs.existsSync(rewardsFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(rewardsFile, "utf-8")) as RewardsData;
  } catch (err) {
    logger.error({ err }, "Failed to read rewards file");
    return {};
  }
}

function write(data: RewardsData) {
  ensureDataDir();
  fs.writeFileSync(rewardsFile, JSON.stringify(data, null, 2), "utf-8");
}

function getOrCreate(userId: string, data: RewardsData): RewardRecord {
  if (!data[userId]) {
    data[userId] = { userId, points: 100, gems: 5, birds: 1, lastDailyClaim: null, streakDays: 0 };
  }
  return data[userId];
}

export function getRewards(userId: string): RewardRecord {
  const data = read();
  const record = getOrCreate(userId, data);
  write(data);
  return record;
}

export function claimDailyReward(userId: string): { ok: boolean; error?: string; result?: { pointsEarned: number; gemsEarned: number; birdsEarned: number; newPoints: number; newGems: number; newBirds: number; streakDays: number; message: string } } {
  const data = read();
  const record = getOrCreate(userId, data);

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (record.lastDailyClaim) {
    const lastDate = record.lastDailyClaim.split("T")[0];
    if (lastDate === today) {
      return { ok: false, error: "لقد استلمت مكافأتك اليومية بالفعل" };
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    if (lastDate === yesterdayStr) {
      record.streakDays += 1;
    } else {
      record.streakDays = 1;
    }
  } else {
    record.streakDays = 1;
  }

  const streak = record.streakDays;
  const pointsEarned = 50 + (streak >= 7 ? 100 : streak >= 3 ? 30 : 0);
  const gemsEarned = streak >= 7 ? 3 : streak >= 3 ? 1 : 0;
  const birdsEarned = streak % 5 === 0 ? 1 : 0;

  record.points += pointsEarned;
  record.gems += gemsEarned;
  record.birds += birdsEarned;
  record.lastDailyClaim = now.toISOString();

  write(data);

  let message = `حصلت على ${pointsEarned} نقطة!`;
  if (gemsEarned > 0) message += ` + ${gemsEarned} جوهرة`;
  if (birdsEarned > 0) message += ` + طائر نادر 🐦`;
  if (streak >= 7) message += ` — سلسلة ${streak} أيام!`;

  return {
    ok: true,
    result: {
      pointsEarned, gemsEarned, birdsEarned,
      newPoints: record.points, newGems: record.gems, newBirds: record.birds,
      streakDays: streak, message,
    },
  };
}
