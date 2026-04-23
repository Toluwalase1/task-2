import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import connectDb from "../config/db.js";
import Profile from "../models/profile.model.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../seed_profiles.json");
const readSeedFile = async () => {
    const raw = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.profiles || !Array.isArray(parsed.profiles)) {
        throw new Error("seed_profiles.json must contain a profiles array");
    }
    return parsed.profiles;
};
const seedDb = async () => {
    try {
        await connectDb();
        const profiles = await readSeedFile();
        const operations = profiles.map((profile) => ({
            updateOne: {
                filter: { name: profile.name },
                update: {
                    $setOnInsert: {
                        ...profile,
                        id: uuidv7(),
                        created_at: new Date(),
                    },
                },
                upsert: true,
            },
        }));
        const result = await Profile.bulkWrite(operations, { ordered: false });
        console.log(`Seed completed. Total input: ${profiles.length}, inserted: ${result.upsertedCount}, existing: ${profiles.length - result.upsertedCount}`);
    }
    catch (error) {
        console.error("Seed failed", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose.disconnect();
    }
};
seedDb();
