import { Router } from "express";
import { z } from "zod";
import { getAllChannels, createChannel, getChannelPosts, createChannelPost } from "../lib/channelStore";
import { findUserById } from "../lib/userStore";

const router = Router();

function requireAuth(req: any, res: any): string | null {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "غير مسجّل دخول" }); return null; }
  return userId;
}

router.get("/channels", (req, res) => {
  requireAuth(req, res);
  res.json(getAllChannels());
});

router.post("/channels", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ name: z.string().min(1).max(50), description: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "اسم القناة مطلوب" }); return; }
  const ch = createChannel(userId, parsed.data.name, parsed.data.description);
  res.status(201).json({ id: ch.id, name: ch.name, description: ch.description, ownerId: ch.ownerId, subscriberCount: ch.subscriberIds.length, createdAt: ch.createdAt });
});

router.get("/channels/:channelId/posts", (req, res) => {
  requireAuth(req, res);
  res.json(getChannelPosts(req.params.channelId));
});

router.post("/channels/:channelId/posts", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ text: z.string().min(1).max(5000) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "نص المنشور مطلوب" }); return; }
  const user = findUserById(userId);
  const post = createChannelPost(req.params.channelId, userId, user?.username ?? "مجهول", parsed.data.text);
  res.status(201).json(post);
});

export default router;
