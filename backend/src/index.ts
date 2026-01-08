import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import authRouter from "./routes/auth";
import householdRouter from "./routes/household";
import choresRouter from "./routes/chores";
import calendarRouter from "./routes/calendar";
import approvalsRouter from "./routes/approvals";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/households", householdRouter);
app.use("/api/chores", choresRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/approvals", approvalsRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
