import { drizzle } from "drizzle-orm/neon-http";

export * from "./enums";
export * from "./users";
export * from "./videos";
export * from "./categories";

export const db = drizzle(process.env.DATABASE_URL!);
