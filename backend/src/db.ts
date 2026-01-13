import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let memoryServer: MongoMemoryServer | null = null;

async function startMemoryServer() {
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
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
