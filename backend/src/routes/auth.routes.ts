import { Router } from "express";
import { z } from "zod";
import { loginUser, logoutUser, refreshSession, registerUser } from "../services/auth.service.js";

export const authRouter = Router();

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
