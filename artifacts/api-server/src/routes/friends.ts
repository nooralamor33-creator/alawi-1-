import { Router } from "express";
import { z } from "zod";
import { getFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from "../lib/friendStore";

const router = Router();

function requireAuth(req: any, res: any): string | null {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "غير مسجّل دخول" }); return null; }
  return userId;
}

router.get("/friends", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getFriends(userId));
});

router.get("/friends/requests", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getPendingRequests(userId));
});

router.post("/friends/add", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ friendId: z.string() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة" }); return; }
  const result = sendFriendRequest(userId, parsed.data.friendId);
  if (!result.ok) { res.status(409).json({ error: result.error }); return; }
  res.json({ message: "تم إرسال طلب الصداقة" });
});

router.post("/friends/accept", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ requestId: z.string() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة" }); return; }
  const result = acceptFriendRequest(userId, parsed.data.requestId);
  if (!result.ok) { res.status(404).json({ error: result.error }); return; }
  res.json({ message: "تم قبول الطلب" });
});

router.post("/friends/reject", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = z.object({ requestId: z.string() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة" }); return; }
  const result = rejectFriendRequest(userId, parsed.data.requestId);
  if (!result.ok) { res.status(404).json({ error: result.error }); return; }
  res.json({ message: "تم رفض الطلب" });
});

export default router;
