import dotenv from "dotenv";
dotenv.config();
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

export const createApp = () => {
  const app = express();

  const allowedOrigin = process.env.CORS_ORIGIN;
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

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};

export const app = createApp();
