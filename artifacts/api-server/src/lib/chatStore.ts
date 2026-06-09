import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const chatsFile = path.resolve(dataDir, "chats.json");

export interface MessageRecord {
  id: string;
  conversationKey: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface AiMessageRecord {
  id: string;
  userId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

interface ChatsData {
  messages: MessageRecord[];
  aiMessages: AiMessageRecord[];
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function read(): ChatsData {
  ensureDataDir();
  if (!fs.existsSync(chatsFile)) return { messages: [], aiMessages: [] };
  try {
    return JSON.parse(fs.readFileSync(chatsFile, "utf-8")) as ChatsData;
  } catch (err) {
    logger.error({ err }, "Failed to read chats file");
    return { messages: [], aiMessages: [] };
  }
}

function write(data: ChatsData) {
  ensureDataDir();
  fs.writeFileSync(chatsFile, JSON.stringify(data, null, 2), "utf-8");
}

function convKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

export function getMessages(userId: string, friendId: string): MessageRecord[] {
  const data = read();
  const key = convKey(userId, friendId);
  return data.messages.filter((m) => m.conversationKey === key).slice(-100);
}

export function saveMessage(senderId: string, senderName: string, friendId: string, text: string): MessageRecord {
  const data = read();
  const msg: MessageRecord = {
    id: randomUUID(),
    conversationKey: convKey(senderId, friendId),
    senderId,
    senderName,
    text,
    createdAt: new Date().toISOString(),
  };
  data.messages.push(msg);
  write(data);
  return msg;
}

export function getAiMessages(userId: string): AiMessageRecord[] {
  const data = read();
  return data.aiMessages.filter((m) => m.userId === userId).slice(-50);
}

export function saveAiMessage(userId: string, role: "user" | "assistant", text: string): AiMessageRecord {
  const data = read();
  const msg: AiMessageRecord = {
    id: randomUUID(),
    userId,
    role,
    text,
    createdAt: new Date().toISOString(),
  };
  data.aiMessages.push(msg);
  write(data);
  return msg;
}
