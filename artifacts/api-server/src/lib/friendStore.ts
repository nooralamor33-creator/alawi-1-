import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger";
import { findUserById } from "./userStore";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const friendsFile = path.resolve(dataDir, "friends.json");

export interface FriendRelation {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

export interface FriendRequestRecord {
  id: string;
  fromId: string;
  toId: string;
  createdAt: string;
}

interface FriendsData {
  relations: FriendRelation[];
  requests: FriendRequestRecord[];
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function read(): FriendsData {
  ensureDataDir();
  if (!fs.existsSync(friendsFile)) return { relations: [], requests: [] };
  try {
    return JSON.parse(fs.readFileSync(friendsFile, "utf-8")) as FriendsData;
  } catch (err) {
    logger.error({ err }, "Failed to read friends file");
    return { relations: [], requests: [] };
  }
}

function write(data: FriendsData) {
  ensureDataDir();
  fs.writeFileSync(friendsFile, JSON.stringify(data, null, 2), "utf-8");
}

export function getFriends(userId: string) {
  const data = read();
  const friendIds = data.relations
    .filter((r) => r.userId === userId || r.friendId === userId)
    .map((r) => (r.userId === userId ? r.friendId : r.userId));
  return friendIds.map((id) => {
    const u = findUserById(id);
    if (!u) return null;
    return { id: u.id, username: u.username, avatar: u.avatar ?? null, createdAt: u.createdAt };
  }).filter(Boolean);
}

export function getPendingRequests(userId: string) {
  const data = read();
  return data.requests
    .filter((r) => r.toId === userId)
    .map((r) => {
      const from = findUserById(r.fromId);
      if (!from) return null;
      return {
        id: r.id,
        from: { id: from.id, username: from.username, avatar: from.avatar ?? null, createdAt: from.createdAt },
        createdAt: r.createdAt,
      };
    })
    .filter(Boolean);
}

export function sendFriendRequest(fromId: string, toId: string): { ok: boolean; error?: string } {
  if (fromId === toId) return { ok: false, error: "لا يمكنك إضافة نفسك" };
  const target = findUserById(toId);
  if (!target) return { ok: false, error: "المستخدم غير موجود" };
  const data = read();
  const alreadyFriends = data.relations.some(
    (r) => (r.userId === fromId && r.friendId === toId) || (r.userId === toId && r.friendId === fromId)
  );
  if (alreadyFriends) return { ok: false, error: "أنتما أصدقاء بالفعل" };
  const pending = data.requests.some(
    (r) => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId)
  );
  if (pending) return { ok: false, error: "طلب الصداقة معلّق بالفعل" };
  data.requests.push({ id: randomUUID(), fromId, toId, createdAt: new Date().toISOString() });
  write(data);
  return { ok: true };
}

export function acceptFriendRequest(userId: string, requestId: string): { ok: boolean; error?: string } {
  const data = read();
  const req = data.requests.find((r) => r.id === requestId && r.toId === userId);
  if (!req) return { ok: false, error: "الطلب غير موجود" };
  data.requests = data.requests.filter((r) => r.id !== requestId);
  data.relations.push({ id: randomUUID(), userId: req.fromId, friendId: req.toId, createdAt: new Date().toISOString() });
  write(data);
  return { ok: true };
}

export function rejectFriendRequest(userId: string, requestId: string): { ok: boolean; error?: string } {
  const data = read();
  const req = data.requests.find((r) => r.id === requestId && r.toId === userId);
  if (!req) return { ok: false, error: "الطلب غير موجود" };
  data.requests = data.requests.filter((r) => r.id !== requestId);
  write(data);
  return { ok: true };
}
