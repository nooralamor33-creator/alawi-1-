import { Router } from "express";
import { z } from "zod";
import path from "path";
import multer from "multer";
import {
  findUserByUsername,
  findUserById,
  createUser,
  verifyPassword,
  toPublicUser,
  updateUserAvatar,
  avatarsDir,
} from "../lib/userStore";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, _file, cb) => {
    const userId = (req.session as any).userId as string;
    cb(null, `${userId}.jpg`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const credentialsSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6),
});

router.post("/auth/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "اسم المستخدم أو كلمة المرور غير صالحة" });
    return;
  }

  const { username, password } = parsed.data;
  const existing = findUserByUsername(username);
  if (existing) {
    res.status(409).json({ error: "اسم المستخدم مستخدم بالفعل" });
    return;
  }

  const user = await createUser(username, password);
  (req.session as any).userId = user.id;
  res.status(201).json(user);
});

router.post("/auth/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "اسم المستخدم أو كلمة المرور غير صالحة" });
    return;
  }

  const { username, password } = parsed.data;
  const stored = findUserByUsername(username);
  if (!stored) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    return;
  }

  const valid = await verifyPassword(password, stored.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    return;
  }

  (req.session as any).userId = stored.id;
  res.status(200).json(toPublicUser(stored));
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
  });
});

router.get("/auth/me", (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "غير مسجّل دخول" });
    return;
  }
  const user = findUserById(userId);
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "الجلسة غير صالحة" });
    return;
  }
  res.status(200).json(toPublicUser(user));
});

router.post("/auth/me/avatar", (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "غير مسجّل دخول" });
    return;
  }

  upload.single("avatar")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "لم يتم رفع أي ملف" });
      return;
    }

    const avatarUrl = `/api/avatars/${userId}.jpg`;
    const updated = updateUserAvatar(userId, avatarUrl);
    if (!updated) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    res.status(200).json(updated);
  });
});

router.get("/avatars/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(avatarsDir, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "الصورة غير موجودة" });
    }
  });
});

export default router;
