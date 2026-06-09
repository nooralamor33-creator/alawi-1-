import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const channelsFile = path.resolve(dataDir, "channels.json");

export interface ChannelRecord {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  subscriberIds: string[];
  createdAt: string;
}

export interface ChannelPostRecord {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  text: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

interface ChannelsData {
  channels: ChannelRecord[];
  posts: ChannelPostRecord[];
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function read(): ChannelsData {
  ensureDataDir();
  if (!fs.existsSync(channelsFile)) return { channels: [], posts: [] };
  try {
    return JSON.parse(fs.readFileSync(channelsFile, "utf-8")) as ChannelsData;
  } catch (err) {
    logger.error({ err }, "Failed to read channels file");
    return { channels: [], posts: [] };
  }
}

function write(data: ChannelsData) {
  ensureDataDir();
  fs.writeFileSync(channelsFile, JSON.stringify(data, null, 2), "utf-8");
}

export function getAllChannels() {
  const data = read();
  return data.channels.map((c) => ({
    id: c.id, name: c.name, description: c.description ?? null,
    ownerId: c.ownerId, subscriberCount: c.subscriberIds.length, createdAt: c.createdAt,
  }));
}

export function createChannel(ownerId: string, name: string, description?: string): ChannelRecord {
  const data = read();
  const channel: ChannelRecord = {
    id: randomUUID(), name, description: description ?? null,
    ownerId, subscriberIds: [ownerId], createdAt: new Date().toISOString(),
  };
  data.channels.push(channel);
  write(data);
  return channel;
}

export function getChannelPosts(channelId: string): ChannelPostRecord[] {
  const data = read();
  return data.posts.filter((p) => p.channelId === channelId).slice(-50);
}

export function createChannelPost(channelId: string, authorId: string, authorName: string, text: string): ChannelPostRecord {
  const data = read();
  const post: ChannelPostRecord = {
    id: randomUUID(), channelId, authorId, authorName, text,
    likes: 0, likedBy: [], createdAt: new Date().toISOString(),
  };
  data.posts.push(post);
  write(data);
  return post;
}
