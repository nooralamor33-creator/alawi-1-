import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { logger } from "./logger";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const usersFile = path.resolve(dataDir, "users.json");
export const avatarsDir = path.resolve(dataDir, "avatars");

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  avatar: string | null;
}

export interface PublicUser {
  id: string;
  username: string;
  createdAt: string;
  avatar: string | null;
}

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
  }
}

function readUsers(): StoredUser[] {
  ensureDataDir();
  if (!fs.existsSync(usersFile)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(usersFile, "utf-8");
    return JSON.parse(raw) as StoredUser[];
  } catch (err) {
    logger.error({ err }, "Failed to read users file");
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  ensureDataDir();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

function generateEightDigitId(existingIds: Set<string>): string {
  let id: string;
  do {
    const num = Math.floor(10000000 + Math.random() * 90000000);
    id = String(num);
  } while (existingIds.has(id));
  return id;
}

export function findUserByUsername(username: string): StoredUser | undefined {
  const users = readUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  const users = readUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(username: string, password: string): Promise<PublicUser> {
  const users = readUsers();
  const existingIds = new Set(users.map((u) => u.id));
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: StoredUser = {
    id: generateEightDigitId(existingIds),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
    avatar: null,
  };
  users.push(newUser);
  writeUsers(users);
  return toPublicUser(newUser);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function updateUserAvatar(userId: string, avatarUrl: string | null): PublicUser | null {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx].avatar = avatarUrl;
  writeUsers(users);
  return toPublicUser(users[idx]);
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    avatar: user.avatar ?? null,
  };
}
