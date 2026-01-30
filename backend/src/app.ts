import dotenv from "dotenv";
dotenv.config({ override: process.env.NODE_ENV !== "production" });
import express from "express";
import cors from "cors";
import morgan from "morgan";
import type { Request, Response } from "express";
import authRouter from "./routes/auth";
import householdRouter from "./routes/household";
import choresRouter from "./routes/chores";
import calendarRouter from "./routes/calendar";
import approvalsRouter from "./routes/approvals";
import statsRouter from "./routes/stats";
import usersRouter from "./routes/users";
import achievementsRouter from "./routes/achievements";
import { getDbMode } from "./db";

export const createApp = () => {
  const app = express();

  const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5175,http://localhost:4173";
  app.use(
    cors(
      allowedOrigin
        ? {
            origin: allowedOrigin.split(",").map((o) => o.trim()),
          }
        : {},
    ),
  );
  app.use(express.json());
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.use("/api/auth", authRouter);
  app.use("/api/households", householdRouter);
  app.use("/api/chores", choresRouter);
  app.use("/api/calendar", calendarRouter);
  app.use("/api/approvals", approvalsRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/achievements", achievementsRouter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", db: getDbMode() });
  });
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", db: getDbMode() });
  });

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};

export const app = createApp();
