import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { getMessages, saveMessage, getAiMessages, saveAiMessage } from "../lib/chatStore";
import { findUserById } from "../lib/userStore";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function requireAuth(req: any, res: any): string | null {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "غير مسجّل دخول" }); return null; }
  return userId;
}

const msgSchema = z.object({ text: z.string().min(1).max(2000) });

router.get("/chat/:friendId", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getMessages(userId, req.params.friendId));
});

router.post("/chat/:friendId", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = msgSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "نص الرسالة مطلوب" }); return; }
  const user = findUserById(userId);
  const msg = saveMessage(userId, user?.username ?? "مجهول", req.params.friendId, parsed.data.text);
  res.status(201).json(msg);
});

router.get("/chat/ai/messages", (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  res.json(getAiMessages(userId));
});

router.post("/chat/ai/send", async (req, res) => {
  const userId = requireAuth(req, res); if (!userId) return;
  const parsed = msgSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "نص الرسالة مطلوب" }); return; }

  const user = findUserById(userId);
  saveAiMessage(userId, "user", parsed.data.text);

  const history = getAiMessages(userId).slice(-20);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `أنت مساعد ذكي داخل لعبة Varecvsce العالمية. اسمك "فارس". أنت ودود، مرح، وتتحدث العربية بطلاقة. تساعد اللاعبين في أسئلتهم وتمتعهم بمعلومات عن اللعبة. المستخدم الحالي اسمه: ${user?.username ?? "لاعب"}.`,
    },
    ...history.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    })),
    { role: "user", content: parsed.data.text },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
    });
    const reply = completion.choices[0]?.message?.content ?? "عذراً، لم أفهم طلبك.";
    const aiMsg = saveAiMessage(userId, "assistant", reply);
    res.json(aiMsg);
  } catch (err) {
    req.log.error({ err }, "OpenAI error");
    res.status(500).json({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" });
  }
});

export default router;
