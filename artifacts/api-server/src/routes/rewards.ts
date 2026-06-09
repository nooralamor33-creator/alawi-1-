import { Router } from "express";
import { getRewards, claimDailyReward } from "../lib/rewardStore";

const router = Router();

function requireAuth(req: any, res: any): string | null {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "غير مسجّل دخول" }); return null; }
  return userId;
}

router.get("/rewards", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getRewards(userId));
});

router.post("/rewards/daily", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const result = claimDailyReward(userId);
  if (!result.ok) { res.status(409).json({ error: result.error }); return; }
  res.json(result.result);
});

export default router;
