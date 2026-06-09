import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const groupsFile = path.resolve(dataDir, "groups.json");

export interface GroupRecord {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface GroupMessageRecord {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

interface GroupsData {
  groups: GroupRecord[];
  messages: GroupMessageRecord[];
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function read(): GroupsData {
  ensureDataDir();
  if (!fs.existsSync(groupsFile)) return { groups: [], messages: [] };
  try {
    return JSON.parse(fs.readFileSync(groupsFile, "utf-8")) as GroupsData;
  } catch (err) {
    logger.error({ err }, "Failed to read groups file");
    return { groups: [], messages: [] };
  }
}

function write(data: GroupsData) {
  ensureDataDir();
  fs.writeFileSync(groupsFile, JSON.stringify(data, null, 2), "utf-8");
}

export function getGroups(userId: string) {
  const data = read();
  return data.groups
    .filter((g) => g.memberIds.includes(userId))
    .map((g) => ({ id: g.id, name: g.name, description: g.description ?? null, ownerId: g.ownerId, memberCount: g.memberIds.length, createdAt: g.createdAt }));
}

export function createGroup(ownerId: string, name: string, description?: string): GroupRecord {
  const data = read();
  const group: GroupRecord = {
    id: randomUUID(),
    name,
    description: description ?? null,
    ownerId,
    memberIds: [ownerId],
    createdAt: new Date().toISOString(),
  };
  data.groups.push(group);
  write(data);
  return group;
}

export function getGroupMessages(groupId: string): GroupMessageRecord[] {
  const data = read();
  return data.messages.filter((m) => m.groupId === groupId).slice(-100);
}

export function saveGroupMessage(groupId: string, senderId: string, senderName: string, text: string): GroupMessageRecord {
  const data = read();
  const msg: GroupMessageRecord = {
    id: randomUUID(),
    groupId,
    senderId,
    senderName,
    text,
    createdAt: new Date().toISOString(),
  };
  data.messages.push(msg);
  write(data);
  return msg;
}
