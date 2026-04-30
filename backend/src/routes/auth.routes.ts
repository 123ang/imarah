import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { getSessionUser } from "../services/session.service.js";
import {
  forgotPasswordRequest,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  requestEmailVerification,
  resetPasswordWithToken,
  verifyEmailWithToken,
} from "../services/auth.service.js";

export const authRouter = Router();

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await getSessionUser(req.userId!);
  if (!user) return res.status(401).json({ error: "Pengguna tidak dijumpai" });
  res.json(user);
});

authRouter.post("/register", async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ralat";
    const status = msg.includes("sudah") ? 409 : 400;
    res.status(status).json({ error: msg });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const out = await loginUser(req.body, req.ip);
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ralat";
    res.status(401).json({ error: msg });
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(req.body);
    const out = await refreshSession(body.refreshToken);
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ralat";
    res.status(401).json({ error: msg });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const body = z.object({ refreshToken: z.string().optional() }).parse(req.body);
    await logoutUser(body.refreshToken);
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const out = await forgotPasswordRequest(req.body, req.ip);
    res.json(out);
  } catch {
    res.status(400).json({ error: "Permintaan tidak sah" });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const out = await resetPasswordWithToken(req.body, req.ip);
    res.json(out);
  } catch {
    res.status(400).json({ error: "Pautan tidak sah atau telah luput" });
  }
});

authRouter.post("/verify-email", async (req, res) => {
  try {
    const out = await verifyEmailWithToken(req.body, req.ip);
    res.json(out);
  } catch {
    res.status(400).json({ error: "Pautan tidak sah atau telah luput" });
  }
});

authRouter.post("/send-verification", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const out = await requestEmailVerification(req.userId!, req.ip);
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ralat";
    res.status(400).json({ error: msg });
  }
});
