import { Router } from "express";
import { z } from "zod";
import { getGroups, createGroup, getGroupMessages, saveGroupMessage } from "../lib/groupStore";
import { findUserById } from "../lib/userStore";

const router = Router();

function requireAuth(req: any, res: any): string | null {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "غير مسجّل دخول" }); return null; }
  return userId;
}

router.get("/groups", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getGroups(userId));
});

router.post("/groups", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ name: z.string().min(1).max(50), description: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "اسم المجموعة مطلوب" }); return; }
  const group = createGroup(userId, parsed.data.name, parsed.data.description);
  res.status(201).json({ id: group.id, name: group.name, description: group.description, ownerId: group.ownerId, memberCount: group.memberIds.length, createdAt: group.createdAt });
});

router.get("/groups/:groupId/messages", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getGroupMessages(req.params.groupId));
});

router.post("/groups/:groupId/messages", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ text: z.string().min(1).max(2000) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "نص الرسالة مطلوب" }); return; }
  const user = findUserById(userId);
  const msg = saveGroupMessage(req.params.groupId, userId, user?.username ?? "مجهول", parsed.data.text);
  res.status(201).json(msg);
});

export default router;
