import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let memoryServer: MongoMemoryServer | null = null;
let dbMode: "mongo" | "memory" = "mongo";
const MONGO_MEM_VERSION = process.env.MONGO_MEMORY_VERSION || "7.0.9";

async function startMemoryServer() {
  memoryServer = await MongoMemoryServer.create({
    binary: { version: MONGO_MEM_VERSION },
  });
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  dbMode = "memory";
  console.log("MongoDB (memory) connected");
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI saknas, startar in-memory MongoDB.");
    await startMemoryServer();
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    dbMode = "mongo";
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error, försöker med in-memory:", error);
    try {
      await startMemoryServer();
    } catch (memErr) {
      console.error("Kunde inte starta in-memory MongoDB:", memErr);
      process.exit(1);
    }
  }
};

export default mongoose;

export const getDbMode = () => dbMode;
