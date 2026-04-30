import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.routes.js";
import { mosqueRouter } from "./routes/mosque.routes.js";
import { prayerRouter } from "./routes/prayer.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { metaRouter } from "./routes/meta.routes.js";

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: config.nodeEnv === "development" ? true : [],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 400,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "imarah-api" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/mosques", mosqueRouter);
  app.use("/api/prayer-times", prayerRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/meta", metaRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Laluan tidak dijumpai" });
  });

  return app;
}
