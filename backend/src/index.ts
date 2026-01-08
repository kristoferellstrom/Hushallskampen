import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db";
import { app } from "./app";

const port = Number(process.env.PORT) || 4000;

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
